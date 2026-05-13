import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Verify membership
    const [membership] = await db.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, decoded.id]
    );

    if (membership.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch team details
    const [teams] = await db.execute(
      'SELECT * FROM teams WHERE id = ?',
      [id]
    );

    if (teams.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Fetch members
    const [members] = await db.execute(
      `SELECT tm.id, tm.role, tm.joined_at, u.id as user_id, u.email, u.first_name, u.last_name 
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?`,
      [id]
    );

    const response = NextResponse.json({ 
      success: true, 
      team: teams[0],
      members,
      userRole: membership[0].role
    });
    
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Fetch team detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Verify permissions (admin or owner)
    const [membership] = await db.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, decoded.id]
    );

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, visibility, max_members } = body;

    await db.execute(
      'UPDATE teams SET name = ?, description = ?, visibility = ?, max_members = ? WHERE id = ?',
      [name, description, visibility, max_members, id]
    );

    const response = NextResponse.json({ success: true, message: 'Team updated successfully' });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Verify permissions (only owner can delete)
    const [membership] = await db.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, decoded.id]
    );

    if (membership.length === 0 || membership[0].role !== 'owner') {
      return NextResponse.json({ error: 'Only team owners can delete teams' }, { status: 403 });
    }

    await db.execute('DELETE FROM teams WHERE id = ?', [id]);

    const response = NextResponse.json({ success: true, message: 'Team deleted successfully' });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
