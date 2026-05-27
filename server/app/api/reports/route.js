import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const [reports] = await db.execute(
      `SELECT r.*, p.name as project_name 
       FROM reports r
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [decoded.id]
    );

    const response = NextResponse.json({
      success: true,
      reports: reports
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;

  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, name, template, classification, sections, investigatorNotes } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'Project ID and Name are required' }, { status: 400 });
    }

    // 1. Create report record
    const [result] = await db.execute(
      `INSERT INTO reports (user_id, project_id, title, type, template, classification, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'ready', NOW())`,
      [decoded.id, projectId, name, template || 'technical', template, classification || 'confidential']
    );

    const reportId = result.insertId;

    // 2. Fetch all intelligence for this project to "bake" into the report
    // (In a real system, we might generate a PDF here, but for now we just link the data)
    
    const response = NextResponse.json({
      success: true,
      reportId: reportId,
      message: 'Intelligence dossier synthesized successfully'
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;

  } catch (error) {
    console.error('Synthesize report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
