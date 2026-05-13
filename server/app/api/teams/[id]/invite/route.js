import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
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
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if team is full
    const [teamInfo] = await db.execute('SELECT max_members FROM teams WHERE id = ?', [id]);
    const [memberCount] = await db.execute('SELECT COUNT(*) as count FROM team_members WHERE team_id = ?', [id]);
    
    if (memberCount[0].count >= teamInfo[0].max_members) {
      return NextResponse.json({ error: 'Team has reached its member limit' }, { status: 400 });
    }

    const inviteToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await db.execute(
      'INSERT INTO team_invitations (team_id, inviter_id, email, token, role, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, decoded.id, email, inviteToken, role || 'member', expiresAt]
    );

    // In a real production app, you would send an email here.
    // For this prototype, we'll return the token so the user can copy the link.

    const response = NextResponse.json({ 
      success: true, 
      message: 'Invitation created',
      inviteLink: `http://localhost:5173/join-team?token=${inviteToken}`
    });
    
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Create invite error:', error);
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
