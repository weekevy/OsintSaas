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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tokens } = await request.json();
    if (!tokens || typeof tokens !== 'number') {
      return NextResponse.json({ error: 'Invalid token count' }, { status: 400 });
    }

    // Update user credits in database
    await db.execute(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [tokens, decoded.id]
    );

    // Get updated credits
    const [users] = await db.execute(
      'SELECT credits FROM users WHERE id = ?',
      [decoded.id]
    );

    return NextResponse.json({
      success: true,
      credits: users[0].credits,
      message: `Successfully recharged ${tokens} tokens.`
    });

  } catch (error) {
    console.error('Recharge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
