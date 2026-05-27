import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
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

    // Verify membership
    const [membership] = await db.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, decoded.id]
    );

    if (membership.length === 0) {
      const response = NextResponse.json({ error: 'Access denied' }, { status: 403 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    // Fetch messages
    const [messages] = await db.execute(
      `SELECT m.*, u.first_name, u.last_name, u.email, 
       IF(m.user_id = ?, 1, 0) as is_me
       FROM team_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.team_id = ?
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [decoded.id, teamId]
    );

    const response = NextResponse.json({ success: true, messages });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Fetch team messages error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
}

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

    // Verify membership
    const [membership] = await db.execute(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, decoded.id]
    );

    if (membership.length === 0) {
      const response = NextResponse.json({ error: 'Access denied' }, { status: 403 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const { content } = await request.json();
    if (!content) {
      const response = NextResponse.json({ error: 'Content required' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const [result] = await db.execute(
      'INSERT INTO team_messages (team_id, user_id, content) VALUES (?, ?, ?)',
      [teamId, decoded.id, content]
    );

    // Notify WebSocket server about the new message
    try {
      const wsNotifyUrl = process.env.WS_NOTIFY_URL || 'http://localhost:4005/notify';
      fetch(wsNotifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'team_message',
          teamId,
          data: {
            id: result.insertId,
            team_id: teamId,
            user_id: decoded.id,
            content,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            email: decoded.email,
            created_at: new Date().toISOString()
          }
        })
      }).catch(err => console.error('WS Notify Error:', err));
    } catch (wsErr) {
      console.error('Failed to notify WS server:', wsErr);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Send team message error:', error);
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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
