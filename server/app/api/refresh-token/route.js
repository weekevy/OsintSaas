import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '../../../database/config';

export async function POST(request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    let token = null;
    
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, value] = c.split('=');
          return [key, value];
        })
      );
      token = cookies.token;
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'No token provided' 
      }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this');
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Check if user still exists and is active
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found or inactive' 
      }, { status: 401 });
    }

    const user = users[0];

    // Create new token
    const newToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
      { expiresIn: '24h' }
    );

    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });

    // Set new token cookie
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid or expired token' 
    }, { status: 401 });
  }
}