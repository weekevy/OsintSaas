import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

// GET /api/user/api-tokens - Fetch all API tokens for the user
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const [tokens] = await db.execute(
      'SELECT id, name, token, permissions, status, last_used_at, expires_at, created_at FROM api_tokens WHERE user_id = ? ORDER BY created_at DESC',
      [decoded.id]
    );

    return NextResponse.json({
      success: true,
      tokens: tokens.map(t => ({
        ...t,
        permissions: typeof t.permissions === 'string' ? JSON.parse(t.permissions) : t.permissions
      }))
    });
  } catch (error) {
    console.error('Fetch API tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/api-tokens - Create a new API token
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { name, expires_days, permissions } = await request.json();

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const apiToken = `osint_${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '')}`;
    const expiresAt = expires_days > 0 
      ? new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000) 
      : null;

    const [result] = await db.execute(
      'INSERT INTO api_tokens (user_id, name, token, permissions, expires_at) VALUES (?, ?, ?, ?, ?)',
      [decoded.id, name, apiToken, JSON.stringify(permissions || ['read']), expiresAt]
    );

    return NextResponse.json({
      success: true,
      token: {
        id: result.insertId,
        name,
        token: apiToken,
        permissions: permissions || ['read'],
        status: 'active',
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create API token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/api-tokens/[id] - Revoke a token (handled via dynamic route usually, but for simplicity we can use query param or another file)
// For Next.js App Router, we'll create [id]/route.js for DELETE
