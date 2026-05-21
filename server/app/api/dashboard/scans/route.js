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
      SELECT s.*, t.value as target_value, t.type as target_type, p.id as project_id,
             COALESCE(j.risk_score, 0) as risk_score
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN job_recruitment_scans j ON s.id = j.scan_id
      WHERE (p.user_id = ? OR p.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?))
    `;
    const params = [decoded.id, decoded.id];

    if (projectId) {
      query += ' AND p.id = ?';
      params.push(projectId);
    }

    query += ' ORDER BY s.created_at DESC LIMIT 10';

    const [scans] = await db.execute(query, params);

    const formattedScans = scans.map(s => ({
      id: s.id,
      target: s.target_value,
      type: s.scan_type.replace('-', ' ').toUpperCase(),
      date: formatTimeAgo(s.created_at),
      risk: s.risk_score || 0,
      status: s.status,
      progress: s.progress,
      findings: s.findings_count
    }));

    return NextResponse.json({
      success: true,
      scans: formattedScans
    });

  } catch (error) {
    console.error('Fetch scans error:', error);
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
