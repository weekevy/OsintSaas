import { NextResponse } from 'next/server';
import db from '@/database/config';
import { hashPassword } from '@/lib/password';
import { generateTokens, setTokenCookies } from '@/lib/jwt';

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { email, password, username, firstName, lastName } = await request.json();

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      );
    }

    // Check if user already exists (email or username)
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { 
          status: 409,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
          }
        }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (email, username, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, username, hashedPassword, firstName || null, lastName || null, 'user']
    );

    const userId = result.insertId;

    // Get created user
    const [users] = await db.execute(
      'SELECT id, email, username, first_name, last_name, role FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    // Generate tokens
    const tokens = generateTokens(user);

    // Store session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.execute(
      'INSERT INTO sessions (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, tokens.token, tokens.refreshToken, expiresAt]
    );

    // Log activity
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [user.id, 'REGISTER', request.headers.get('x-forwarded-for') || 'unknown', request.headers.get('user-agent') || 'unknown']
    );

    // ✅ FIXED: Create response FIRST, THEN set cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // ✅ This now works with the updated jwt.js
    setTokenCookies(response, tokens);

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
  }
}
