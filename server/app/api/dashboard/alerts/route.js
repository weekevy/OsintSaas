import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let query = `
      SELECT f.*, s.scan_type, t.label as target_label, t.value as target_value, p.id as project_id
      FROM findings f
      JOIN scans s ON f.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ?
    `;
    const params = [decoded.id];

    if (projectId) {
      query += ' AND p.id = ?';
      params.push(projectId);
    }

    query += ' ORDER BY f.created_at DESC LIMIT 50';

    const [findings] = await db.execute(query, params);

    const formattedAlerts = findings.map(f => ({
      id: f.id,
      severity: f.severity,
      source: f.scan_type.replace('-', ' ').toUpperCase(),
      message: `${f.title}: ${f.description}`,
      time: formatTimeAgo(f.created_at),
      projectId: f.project_id
    }));

    return NextResponse.json({
      success: true,
      alerts: formattedAlerts
    });

  } catch (error) {
    console.error('Fetch alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
