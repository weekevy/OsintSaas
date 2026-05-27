import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function POST(request, { params }) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { id: teamId } = await params;
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Verify membership in the team
    const [membership] = await db.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, decoded.id]
    );

    if (membership.length === 0) {
      return NextResponse.json({ error: 'You are not a member of this team' }, { status: 403 });
    }

    const body = await request.json();
    const { scanId } = body;

    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID is required' }, { status: 400 });
    }

    // Check if user owns the scan and it is completed
    const [scanData] = await db.execute(
      `SELECT s.id, s.status, t.project_id, p.user_id 
       FROM scans s
       JOIN targets t ON s.target_id = t.id
       JOIN projects p ON t.project_id = p.id
       WHERE s.id = ?`,
      [scanId]
    );

    if (scanData.length === 0) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (scanData[0].user_id !== decoded.id) {
      return NextResponse.json({ error: 'Only the scan owner can share it' }, { status: 403 });
    }

    if (scanData[0].status !== 'completed') {
      return NextResponse.json({ error: 'Only completed scans can be synchronized with the team' }, { status: 400 });
    }

    const projectId = scanData[0].project_id;

    // Update project with team_id and shared_at
    await db.execute(
      'UPDATE projects SET team_id = ?, shared_at = NOW() WHERE id = ?',
      [teamId, projectId]
    );

    const response = NextResponse.json({ 
      success: true, 
      message: 'Intelligence synchronized with team successfully'
    });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Share project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
