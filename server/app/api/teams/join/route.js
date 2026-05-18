import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const [invites] = await db.execute(
      'SELECT ti.*, t.name as team_name FROM team_invitations ti JOIN teams t ON ti.team_id = t.id WHERE ti.token = ? AND ti.status = "pending" AND ti.expires_at > NOW()',
      [token]
    );

    if (invites.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, invitation: invites[0] });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Verify invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const auth_token = request.cookies.get('token')?.value;
    if (!auth_token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(auth_token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { token } = body;

    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    // 1. Validate invitation
    const [invites] = await db.execute(
      'SELECT * FROM team_invitations WHERE token = ? AND status = "pending" AND expires_at > NOW()',
      [token]
    );

    if (invites.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    const invitation = invites[0];

    // 2. Check if already a member
    const [existing] = await db.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [invitation.team_id, decoded.id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
    }

    // 3. Join team
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      await connection.execute(
        'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
        [invitation.team_id, decoded.id, invitation.role]
      );

      await connection.execute(
        'UPDATE team_invitations SET status = "accepted" WHERE id = ?',
        [invitation.id]
      );

      await connection.commit();

      const response = NextResponse.json({ success: true, message: 'Joined team successfully' });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Join team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
