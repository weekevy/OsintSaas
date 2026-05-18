import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function POST(request, { params }) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { id: teamId } = await params;
    const token = request.cookies.get('token')?.value;
    if (!token) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Verify permissions (admin or owner)
    const [membership] = await db.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, decoded.id]
    );

    if (membership.length === 0 || !['owner', 'admin'].includes(membership[0].role)) {
      const response = NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      const response = NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Check if user exists
    const [user] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Check if user is already a member
    const [existingMember] = await db.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, userId]
    );
    if (existingMember.length > 0) {
      const response = NextResponse.json({ error: 'User is already a member of this team' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Check if team is full
    const [teamInfo] = await db.execute('SELECT max_members FROM teams WHERE id = ?', [teamId]);
    const [memberCount] = await db.execute('SELECT COUNT(*) as count FROM team_members WHERE team_id = ?', [teamId]);
    
    if (memberCount[0].count >= teamInfo[0].max_members) {
      const response = NextResponse.json({ error: 'Team has reached its member limit' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    await db.execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
      [teamId, userId, role || 'member']
    );

    const response = NextResponse.json({ 
      success: true, 
      message: 'Member added successfully'
    });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Add member error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
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
