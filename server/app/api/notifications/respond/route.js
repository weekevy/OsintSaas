import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

// POST /api/notifications/respond - Accept or decline a team invitation
export async function POST(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
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

    const { notificationId, action } = await request.json(); // action: 'accept' or 'decline'

    if (!notificationId || !action) {
      const response = NextResponse.json({ error: 'Notification ID and action are required' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // 1. Get the notification
    const [notifications] = await db.execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, decoded.id]
    );

    if (notifications.length === 0) {
      const response = NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const notification = notifications[0];
    const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;

    if (notification.type !== 'team_invite') {
      const response = NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const { teamId, inviteToken, role } = data;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      if (action === 'accept') {
        // Verify invitation exists and isn't expired
        const [invitations] = await connection.execute(
          'SELECT * FROM team_invitations WHERE token = ? AND status = "pending" AND expires_at > NOW()',
          [inviteToken]
        );

        if (invitations.length === 0) {
          await connection.rollback();
          const response = NextResponse.json({ error: 'Invitation is invalid or expired' }, { status: 400 });
          response.headers.set('Access-Control-Allow-Origin', origin);
          response.headers.set('Access-Control-Allow-Credentials', 'true');
          return response;
        }

        // Add member to team
        await connection.execute(
          'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
          [teamId, decoded.id, role || 'member']
        );

        // Update invitation status
        await connection.execute(
          'UPDATE team_invitations SET status = "accepted" WHERE token = ?',
          [inviteToken]
        );
      } else {
        // Update invitation status to declined
        await connection.execute(
          'UPDATE team_invitations SET status = "declined" WHERE token = ?',
          [inviteToken]
        );
      }

      // Mark notification as read or delete it
      await connection.execute('DELETE FROM notifications WHERE id = ?', [notificationId]);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    const response = NextResponse.json({ 
      success: true, 
      message: action === 'accept' ? 'Invitation accepted' : 'Invitation declined' 
    });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;

  } catch (error) {
    console.error('Respond to invite error:', error);
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
