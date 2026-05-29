import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';
import { addReportToQueue } from '@/lib/queue';

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
    const { scanId, name, template, theme, classification, sections, investigatorNotes } = body;

    if (!scanId || !name) {
      return NextResponse.json({ error: 'Scan ID and Name are required' }, { status: 400 });
    }

    // Fetch projectId from scanId
    const [scanRows] = await db.execute(
      'SELECT t.project_id FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.id = ?',
      [scanId]
    );
    
    const projectId = scanRows[0]?.project_id || null;

    // 1. Create report record in 'generating' status
    const [result] = await db.execute(
      `INSERT INTO reports (user_id, project_id, scan_id, title, type, template, classification, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'generating', NOW())`,
      [decoded.id, projectId, scanId, name, template || 'technical', theme || 'noir', classification || 'confidential']
    );

    const reportId = result.insertId;

    // 2. Add to Queue for professional synthesis
    await addReportToQueue({
      reportId,
      scanId,
      userId: decoded.id,
      name,
      template,
      theme,
      classification,
      sections,
      investigatorNotes
    });
    
    const response = NextResponse.json({
      success: true,
      reportId: reportId,
      message: 'Intelligence dossier synthesis initialized'
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
