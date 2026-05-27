import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function DELETE(request, { params }) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const { id: reportId } = await params;
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify ownership
    const [report] = await db.execute(
      'SELECT id FROM reports WHERE id = ? AND user_id = ?',
      [reportId, decoded.id]
    );

    if (report.length === 0) {
      return NextResponse.json({ error: 'Dossier not found or access denied' }, { status: 404 });
    }

    // Delete the report record
    await db.execute('DELETE FROM reports WHERE id = ?', [reportId]);

    const response = NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;

  } catch (error) {
    console.error('Decommission report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
