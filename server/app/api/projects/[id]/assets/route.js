import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { id: projectId } = await params;
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify access to project (owner or team member)
    const [projectCheck] = await db.execute(
      `SELECT p.id FROM projects p 
       LEFT JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ?
       WHERE p.id = ? AND (p.user_id = ? OR tm.id IS NOT NULL)`,
      [decoded.id, projectId, decoded.id]
    );

    if (projectCheck.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Fetch targets as assets (grouped by value to avoid duplicates from multiple scans)
    const [targets] = await db.execute(
      `SELECT MIN(id) as id, type as asset_type, value as url, MIN(label) as title, MIN(created_at) as created_at, status
       FROM targets 
       WHERE project_id = ?
       GROUP BY value, type
       ORDER BY created_at DESC`,
      [projectId]
    );

    // Fetch findings for all scans in this project
    const [findings] = await db.execute(
      `SELECT f.*, s.scan_type, s.completed_at
       FROM findings f
       JOIN scans s ON f.scan_id = s.id
       JOIN targets t ON s.target_id = t.id
       WHERE t.project_id = ?
       ORDER BY f.severity DESC, f.created_at DESC`,
      [projectId]
    );

    // Fetch scan metadata for detailed module info
    const [scans] = await db.execute(
      `SELECT s.id, s.scan_type, s.status, s.findings_count, s.started_at, s.completed_at, t.value as target_value
       FROM scans s
       JOIN targets t ON s.target_id = t.id
       WHERE t.project_id = ?`,
      [projectId]
    );

    // Fetch reports for this project
    const [reports] = await db.execute(
      `SELECT id, title, type, status, file_path, created_at 
       FROM reports 
       WHERE project_id = ? AND status = 'ready'
       ORDER BY created_at DESC`,
      [projectId]
    );

    const response = NextResponse.json({
      success: true,
      assets: targets,
      findings: findings,
      scans: scans,
      reports: reports
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;

  } catch (error) {
    console.error('Fetch project assets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { id: projectId } = await params;
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, url } = body;

    const [result] = await db.execute(
      'INSERT INTO targets (project_id, type, value, label, created_at) VALUES (?, ?, ?, ?, NOW())',
      [projectId, type, url, title]
    );

    const response = NextResponse.json({
      success: true,
      asset: {
        id: result.insertId,
        type,
        title,
        url
      }
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Create asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
