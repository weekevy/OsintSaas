import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function DELETE(request, { params }) {
  try {
    const { id: tokenId } = await params;
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Revoke token (ensure it belongs to the user)
    const [result] = await db.execute(
      'UPDATE api_tokens SET status = "revoked", deleted_at = NOW() WHERE id = ? AND user_id = ?',
      [tokenId, decoded.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Token not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Token revoked successfully' });
  } catch (error) {
    console.error('Revoke API token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
