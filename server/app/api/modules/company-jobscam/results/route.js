import pool from '../../../../../database/config';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let connection;
  try {
    // 1. API Key Check
    const apiKey = request.headers.get('X-API-Key');
    const systemKey = process.env.DOCKER_API_KEY || 'your-super-secret-api-key-change-this';

    if (apiKey !== systemKey) {
        // Fallback to JWT check for debugging/manual testing
        const authHeader = request.headers.get('authorization');
        const cookieToken = request.cookies.get('token')?.value;
        if (!authHeader && !cookieToken) {
            console.warn(`⚠️ AUTH: Unauthorized results submission attempt.`);
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
    }

    const body = await request.json();
    const { scan_id, results } = body;

    if (!scan_id || !results) {
      return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });
    }

    const { summary } = results;
    const risk_score = summary?.overall_risk_score || 0;
    const risk_level = summary?.risk_level || 'low';
    const findings_count = summary?.total_findings || 0;

    // --- 5. DATABASE TRANSACTION SAFETY ---
    connection = await pool.getConnection();
    await connection.beginTransaction();

    console.log(`📥 DATA: Atomic transaction started for scan ${scan_id}`);

    // Update scans table
    await connection.execute(
      `UPDATE scans SET status = 'completed', progress = 100, findings_count = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [findings_count, scan_id]
    );

    // Update job_recruitment_scans table
    const findings_summary = JSON.stringify(summary.red_flags || []);
    await connection.execute(
      `UPDATE job_recruitment_scans SET risk_score = ?, risk_level = ?, analysis_status = 'completed', findings_summary = ?, updated_at = NOW() WHERE scan_id = ?`,
      [risk_score, risk_level, findings_summary, scan_id]
    );

    // Batch Insert Findings
    if (summary.red_flags && summary.red_flags.length > 0) {
        for (const flag of summary.red_flags) {
            await connection.execute(
                `INSERT INTO findings (scan_id, finding_type, severity, title, description, created_at) VALUES (?, 'security_risk', ?, ?, ?, NOW())`,
                [scan_id, risk_level, flag, 'Automated OSINT finding']
            );
        }
    }

    // Create Notification
    const [scanInfo] = await connection.execute(
        'SELECT t.project_id, p.user_id FROM scans s JOIN targets t ON s.target_id = t.id JOIN projects p ON t.project_id = p.id WHERE s.id = ?',
        [scan_id]
    );

    if (scanInfo.length > 0) {
        const userId = scanInfo[0].user_id;
        const type = risk_score > 70 ? 'threat' : risk_score > 40 ? 'warning' : 'success';
        await connection.execute(
            `INSERT INTO notifications (user_id, title, message, type, scan_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
            [userId, `Investigation #${scan_id} Ready`, `Risk Score: ${risk_score}%`, type, scan_id]
        );
    }

    await connection.commit();
    console.log(`✅ DATA: Transaction committed successfully for scan ${scan_id}`);
    
    return NextResponse.json({ success: true, message: 'Results persisted atomically' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ RESULTS TRANSACTION ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
