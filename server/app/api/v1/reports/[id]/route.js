import { NextResponse } from 'next/server';
import db from '@/database/config';

export async function GET(request, { params }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const { id: reportId } = await params;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 401 });
    }

    // Validate API Key
    const [tokens] = await db.execute(
      'SELECT id, user_id, status FROM api_tokens WHERE token = ?',
      [apiKey]
    );

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    const tokenData = tokens[0];
    if (tokenData.status !== 'active') {
      return NextResponse.json({ error: 'API Key is revoked or inactive' }, { status: 403 });
    }

    // Fetch Report with optional scan info
    const [reports] = await db.execute(
      `SELECT r.*, s.scan_type, t.value as target_value 
       FROM reports r 
       LEFT JOIN scans s ON r.scan_id = s.id 
       LEFT JOIN targets t ON s.target_id = t.id 
       WHERE r.id = ? AND r.user_id = ?`,
      [reportId, tokenData.user_id]
    );

    if (reports.length === 0) {
      return NextResponse.json({ error: 'Report not found or access denied' }, { status: 404 });
    }

    const report = reports[0];

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        status: report.status,
        progress: report.progress,
        type: report.type,
        target: report.target_value || 'N/A',
        scan_type: report.scan_type || 'N/A',
        file_url: report.file_path,
        created_at: report.created_at,
        updated_at: report.updated_at
      }
    });

  } catch (error) {
    console.error('API v1 Get Report Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
