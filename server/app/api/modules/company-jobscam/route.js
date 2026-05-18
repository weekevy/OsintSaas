import pool from '../../../../database/config';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

// Helper function to verify JWT token from request
async function getAuthenticatedUser(request) {
  try {
    // Check Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }
    
    // Check cookie
    const token = request.cookies.get('token')?.value;
    if (token) {
      return verifyToken(token);
    }
    
    return null;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// Helper function to query the database
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// GET /api/modules/company-jobscam - Get all company job scam scans
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [scans] = await query(`
      SELECT 
        s.id as scan_id,
        s.scan_type,
        s.status,
        s.progress,
        s.priority,
        s.findings_count,
        s.started_at,
        s.completed_at,
        s.created_at,
        j.id as job_recruitment_id,
        j.job_url,
        j.job_title,
        j.job_description,
        j.salary_offered,
        j.company_name,
        j.company_website,
        j.company_linkedin,
        j.company_email_domain,
        j.company_phone,
        j.company_address,
        j.company_email,
        j.recruiter_name,
        j.recruiter_email,
        j.recruiter_phone,
        j.recruiter_linkedin,
        j.recruiter_title,
        j.suspicious_message,
        j.communication_channel,
        j.red_flags_noticed,
        j.notes,
        j.risk_score,
        j.risk_level,
        j.analysis_status,
        j.findings_summary,
        t.value as target_value,
        t.type as target_type,
        t.label as target_label
      FROM scans s
      LEFT JOIN job_recruitment_scans j ON s.id = j.scan_id
      LEFT JOIN targets t ON s.target_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE s.scan_type = 'job-recruitment'
      AND p.user_id = ?
      ORDER BY s.created_at DESC
    `, [user.id]);

    const formattedScans = scans.map(scan => ({
      id: scan.scan_id,
      originalId: scan.job_recruitment_id,
      scan_type: scan.scan_type,
      status: scan.status,
      progress: scan.progress || 0,
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      created_at: scan.created_at,
      target: {
        value: scan.target_value,
        type: scan.target_type,
        label: scan.target_label
      },
      assets: {
        ...scan
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ 
      success: true, 
      scans: formattedScans,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching job scans:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch scans',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/modules/company-jobscam - Create new job scam scan
export async function POST(request) {
  let connection;
  const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  if (pendingRequests.has(requestId)) {
    return NextResponse.json({ success: false, error: 'Duplicate request' }, { status: 429 });
  }
  pendingRequests.set(requestId, true);
  setTimeout(() => { pendingRequests.delete(requestId); }, 3000);
  
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.company_name && !body.job_url) {
      return NextResponse.json({ success: false, error: 'Please provide company name or job URL' }, { status: 400 });
    }
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let projectId = body.project_id;
      
      // If project_id is provided, verify it belongs to the user
      if (projectId) {
        const [projectCheck] = await connection.execute(
          'SELECT id FROM projects WHERE id = ? AND user_id = ? LIMIT 1',
          [projectId, user.id]
        );
        if (projectCheck.length === 0) {
          // If the project doesn't belong to the user, fall back to default project logic
          projectId = null;
        }
      }

      if (!projectId) {
        const [projects] = await connection.execute('SELECT id FROM projects WHERE user_id = ? AND name = ? LIMIT 1', [user.id, 'Default Project']);
        if (projects.length > 0) projectId = projects[0].id;
        else {
          const [newProject] = await connection.execute('INSERT INTO projects (user_id, name, description, status, created_at) VALUES (?, "Default Project", "Default", "active", NOW())', [user.id]);
          projectId = newProject.insertId;
        }
      }

      const targetLabel = `${body.company_name || 'Unknown'} - ${body.job_title || 'Investigation'}`;
      const [targetResult] = await connection.execute('INSERT INTO targets (project_id, type, value, label, status, created_at) VALUES (?, "url", ?, ?, "pending", NOW())', [projectId, body.job_url || body.company_website || 'Manual', targetLabel]);
      const targetId = targetResult.insertId;

      const [scanResult] = await connection.execute('INSERT INTO scans (target_id, scan_type, status, priority, progress, created_at) VALUES (?, "job-recruitment", "pending", 1, 0, NOW())', [targetId]);
      const scanId = scanResult.insertId;

      await connection.execute(
        `INSERT INTO job_recruitment_scans (
          scan_id, job_url, job_title, job_description, company_name, company_website, risk_score, risk_level, analysis_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, "low", "pending", NOW())`,
        [scanId, body.job_url || null, body.job_title || null, body.job_description || null, body.company_name || null, body.company_website || null]
      );

      await connection.commit();
      connection.release();

      pendingRequests.delete(requestId);

      return NextResponse.json({ success: true, scan: { id: scanId, status: 'pending' } });

    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    }
  } catch (error) {
    if (connection) connection.release();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const scanId = parseInt(searchParams.get('id'));
    const { status } = await request.json();

    await pool.execute('UPDATE scans SET status = ?, updated_at = NOW() WHERE id = ?', [status, scanId]);

    if (status === 'running') {
      const [scanData] = await pool.execute('SELECT t.value FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.id = ?', [scanId]);
      if (scanData.length > 0) {
        const dockerApiUrl = process.env.JOB_RECRUITMENT_API_URL || 'http://127.0.0.1:8000';
        const dockerApiKey = process.env.DOCKER_API_KEY || 'your-super-secret-api-key-change-this';
        fetch(`${dockerApiUrl}/scan/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': dockerApiKey },
          body: JSON.stringify({ scan_id: scanId, target: scanData[0].value, user_id: user.id })
        }).catch(err => console.error('Docker Resume Error:', err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const scanId = parseInt(searchParams.get('id'));

    // Try to notify Docker about the deletion
    try {
      const dockerApiUrl = process.env.JOB_RECRUITMENT_API_URL || 'http://127.0.0.1:8000';
      const dockerApiKey = process.env.DOCKER_API_KEY || 'your-super-secret-api-key-change-this';
      
      // We can use the event endpoint here
      fetch(`${dockerApiUrl}/event/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': dockerApiKey },
        body: JSON.stringify({ 
          scan_id: scanId, 
          user_id: user.id,
          event_type: 'delete',
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Docker Delete Event Error:', err));
    } catch (dockerErr) {
      console.error('Failed to notify Docker about deletion:', dockerErr);
    }

    await pool.execute('DELETE FROM scans WHERE id = ?', [scanId]);
    return NextResponse.json({ success: true, message: 'Scan deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
