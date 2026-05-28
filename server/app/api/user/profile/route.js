import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const [users] = await db.execute(
      `SELECT id, email, first_name, last_name, bio, title, phone, 
              location, website, social, has_seen_tours, created_at
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get user stats
    const [stats] = await db.execute(
      `SELECT 
        (SELECT COUNT(*) FROM investigations WHERE user_id = ?) as investigations,
        (SELECT COUNT(*) FROM reports WHERE user_id = ?) as reports,
        (SELECT COUNT(*) FROM team_members WHERE user_id = ?) as teamMembers,
        98 as successRate`,
      [decoded.id, decoded.id, decoded.id]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        title: user.title,
        phone: user.phone,
        location: user.location,
        website: user.website,
        social: user.social ? (typeof user.social === 'string' ? JSON.parse(user.social) : user.social) : {},
        hasSeenTours: user.has_seen_tours ? (typeof user.has_seen_tours === 'string' ? JSON.parse(user.has_seen_tours) : user.has_seen_tours) : {},
        createdAt: user.created_at,
        stats: stats[0]
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { 
      firstName, 
      lastName, 
      bio,
      title, 
      phone, 
      location, 
      website,
      social
    } = await request.json();

    // Update user profile - strictly using decoded.id from token to prevent IDOR
    await db.execute(
      `UPDATE users SET 
        first_name = ?,
        last_name = ?,
        bio = ?,
        title = ?,
        phone = ?,
        location = ?,
        website = ?,
        social = ?
       WHERE id = ?`,
      [
        firstName || null, 
        lastName || null, 
        bio || null,
        title || null, 
        phone || null, 
        location || null, 
        website || null,
        social ? JSON.stringify(social) : null,
        decoded.id
      ]
    );

    // Get updated user
    const [users] = await db.execute(
      `SELECT id, email, first_name, last_name, bio, title, phone, 
              location, website, social, created_at
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    const user = users[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        title: user.title,
        phone: user.phone,
        location: user.location,
        website: user.website,
        social: user.social ? (typeof user.social === 'string' ? JSON.parse(user.social) : user.social) : {},
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
