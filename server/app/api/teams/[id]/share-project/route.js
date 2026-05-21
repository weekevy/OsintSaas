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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if user owns the project
    const [project] = await db.execute(
      'SELECT id, user_id FROM projects WHERE id = ?',
      [projectId]
    );

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project[0].user_id !== decoded.id) {
      return NextResponse.json({ error: 'Only the project owner can share it' }, { status: 403 });
    }

    // Update project with team_id and shared_at
    await db.execute(
      'UPDATE projects SET team_id = ?, shared_at = NOW() WHERE id = ?',
      [teamId, projectId]
    );

    const response = NextResponse.json({ 
      success: true, 
      message: 'Project shared with team successfully'
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
