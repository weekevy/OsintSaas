import { NextResponse } from 'next/server';
import db from '@/database/config';
import { addScanToQueue } from '@/lib/queue';
import { deductCredits } from '@/lib/tokens';

export async function POST(request) {
  let connection;
  try {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 401 });
    }

    // Validate API Key
    const [tokens] = await db.execute(
      'SELECT id, user_id, status, expires_at FROM api_tokens WHERE token = ?',
      [apiKey]
    );

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    const tokenData = tokens[0];
    if (tokenData.status !== 'active') {
      return NextResponse.json({ error: 'API Key is revoked or inactive' }, { status: 403 });
    }

    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'API Key has expired' }, { status: 403 });
    }

    const body = await request.json();
    const { target } = body;

    if (!target) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Deduct 1 credit
    const success = await deductCredits(tokenData.user_id, 1);
    if (!success) {
      return NextResponse.json({ error: 'Insufficient credits for analysis' }, { status: 402 });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Get or create Default Project
    let [projects] = await connection.execute(
      'SELECT id FROM projects WHERE user_id = ? AND name = "Default Project"',
      [tokenData.user_id]
    );

    let projectId;
    if (projects.length === 0) {
      const [newProject] = await connection.execute(
        'INSERT INTO projects (user_id, name, description, status) VALUES (?, "Default Project", "Auto-generated for API investigations", "active")',
        [tokenData.user_id]
      );
      projectId = newProject.insertId;
    } else {
      projectId = projects[0].id;
    }

    // 2. Create Target
    const [newTarget] = await connection.execute(
      'INSERT INTO targets (project_id, type, value, status) VALUES (?, "email", ?, "active")',
      [projectId, target]
    );
    const targetId = newTarget.insertId;

    // 3. Create Scan
    const [newScan] = await connection.execute(
      'INSERT INTO scans (target_id, scan_type, status, progress) VALUES (?, "job-recruitment", "pending", 0)',
      [targetId]
    );
    const scanId = newScan.insertId;

    // 4. Create module-specific record (job_recruitment_scans)
    await connection.execute(
      'INSERT INTO job_recruitment_scans (scan_id, recruiter_email, analysis_status) VALUES (?, ?, "pending")',
      [scanId, target]
    );

    // 5. Update last used timestamp
    await connection.execute(
      'UPDATE api_tokens SET last_used_at = NOW() WHERE id = ?',
      [tokenData.id]
    );

    await connection.commit();

    // 6. Add to BullMQ Queue
    const job = await addScanToQueue({
      scanId,
      target,
      userId: tokenData.user_id,
      module: 'job-recruitment'
    });

    return NextResponse.json({
      success: true,
      message: 'Email analysis mission dispatched successfully',
      scan_id: scanId,
      job_id: job.id,
      target: target,
      status: 'dispatched',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('API v1 Analyze Email Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
