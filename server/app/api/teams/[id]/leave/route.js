import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Verify membership and role
    const [membership] = await db.execute(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, decoded.id]
    );

    if (membership.length === 0) {
      return NextResponse.json({ error: 'You are not a member of this team' }, { status: 400 });
    }

    if (membership[0].role === 'owner') {
      return NextResponse.json({ error: 'Owners cannot leave a team. Delete the team instead.' }, { status: 403 });
    }

    // Remove the member
    await db.execute(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [id, decoded.id]
    );

    const response = NextResponse.json({ success: true, message: 'You have left the team' });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (error) {
    console.error('Leave team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
