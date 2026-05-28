import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken, generateTokens, setTokenCookies } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (decoded) {
      // Token is valid, get user data
      const [users] = await db.execute(
        'SELECT id, email, username, first_name, last_name, role, credits, has_seen_tours FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: users[0].id,
          email: users[0].email,
          username: users[0].username,
          firstName: users[0].first_name,
          lastName: users[0].last_name,
          role: users[0].role,
          credits: users[0].credits,
          hasSeenTours: users[0].has_seen_tours ? (typeof users[0].has_seen_tours === 'string' ? JSON.parse(users[0].has_seen_tours) : users[0].has_seen_tours) : {}
        }
      });
    }

    // Token expired, try refresh token
    if (refreshToken) {
      const refreshDecoded = verifyToken(refreshToken);
      
      if (refreshDecoded) {
        const [sessions] = await db.execute(
          'SELECT user_id FROM sessions WHERE refresh_token = ? AND expires_at > NOW()',
          [refreshToken]
        );

        if (sessions.length > 0) {
          // Get user data
          const [users] = await db.execute(
            'SELECT id, email, username, first_name, last_name, role, credits, has_seen_tours FROM users WHERE id = ?',
            [sessions[0].user_id]
          );

          if (users.length > 0) {
            // Generate new tokens
            const newTokens = generateTokens(users[0]);

            // Update session
            await db.execute(
              'UPDATE sessions SET token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE refresh_token = ?',
              [newTokens.token, refreshToken]
            );

            const response = NextResponse.json({
              authenticated: true,
              user: {
                id: users[0].id,
                email: users[0].email,
                username: users[0].username,
                firstName: users[0].first_name,
                lastName: users[0].last_name,
                role: users[0].role,
                credits: users[0].credits,
                hasSeenTours: users[0].has_seen_tours ? (typeof users[0].has_seen_tours === 'string' ? JSON.parse(users[0].has_seen_tours) : users[0].has_seen_tours) : {}
              }
            });

            setTokenCookies(response, newTokens);
            return response;
          }
        }
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });

  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
