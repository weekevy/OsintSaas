import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { section } = await request.json();

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    // 1. Get current has_seen_tours
    const [users] = await db.execute(
      'SELECT has_seen_tours FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let tours = users[0].has_seen_tours;
    if (typeof tours === 'string') {
      tours = JSON.parse(tours);
    }
    if (!tours) {
      tours = {};
    }

    // 2. Update the specific section
    tours[section] = true;

    // 3. Save back to database
    await db.execute(
      'UPDATE users SET has_seen_tours = ? WHERE id = ?',
      [JSON.stringify(tours), decoded.id]
    );

    return NextResponse.json({ success: true, tours });

  } catch (error) {
    console.error('Tour update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
