import pool from '../../../../database/config';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

// Helper function to verify JWT token from request
async function getAuthenticatedUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }
    const token = request.cookies.get('token')?.value;
    if (token) return verifyToken(token);
    return null;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

function calculateProgress(scan) {
  if (scan.status === 'completed') return 100;
  if (scan.status === 'running') return 50;
  if (scan.status === 'queued' || scan.status === 'pending') return 0;
  return 0;
}

// GET - Fetch all LinkedIn scans
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let sql = `
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
        l.id as linkedin_record_id,
        l.profile_url,
        l.profile_name,
        l.profile_headline,
        l.profile_location,
        l.connections_list,
        l.mutual_connections,
        t.value as target_value,
        t.type as target_type,
        t.label as target_label
      FROM scans s
      LEFT JOIN linkedin_scans l ON s.id = l.scan_id
      LEFT JOIN targets t ON s.target_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE s.scan_type = 'linkedin'
      AND p.user_id = ?
    `;

    const params = [user.id];

    if (projectId) {
      sql += ' AND t.project_id = ?';
      params.push(projectId);
    }

    sql += ' ORDER BY s.created_at DESC';

    const [scans] = await query(sql, params);

    const formattedScans = scans.map(scan => ({
      id: scan.scan_id,
      originalId: scan.linkedin_record_id,
      scan_type: scan.scan_type,
      status: scan.status,
      progress: scan.progress || calculateProgress(scan),
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      created_at: scan.created_at,
      target: {
        value: scan.target_value,
        type: scan.target_type,
        label: scan.target_label
      },
      assets: {
        id: scan.scan_id,
        linkedin_record_id: scan.linkedin_record_id,
        profile_url: scan.profile_url,
        profile_name: scan.profile_name,
        profile_headline: scan.profile_headline,
        profile_location: scan.profile_location,
        connections_list: scan.connections_list,
        mutual_connections: scan.mutual_connections
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ 
      success: true, 
      scans: formattedScans,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching LinkedIn scans:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch scans',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new LinkedIn scan
export async function POST(request) {
  let connection;
  
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const profileUrl = body.profile_url;

    if (!profileUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'LinkedIn profile URL is required' 
      }, { status: 400 });
    }

    // Better duplicate protection: check if a scan with same URL is already pending for this user
    const [existingScans] = await query(`
      SELECT s.id 
      FROM scans s
      JOIN linkedin_scans l ON s.id = l.scan_id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE l.profile_url = ? 
      AND p.user_id = ? 
      AND s.status IN ('queued', 'pending', 'running')
      LIMIT 1
    `, [profileUrl, user.id]);

    if (existingScans.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'A scan for this profile is already in progress' 
      }, { status: 409 });
    }
    
    // Generate unique request ID to prevent rapid-fire duplicates
    const requestId = `linkedin_${user.id}_${profileUrl}`;
    if (pendingRequests.has(requestId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Request already being processed' 
      }, { status: 429 });
    }
    pendingRequests.set(requestId, true);
    setTimeout(() => pendingRequests.delete(requestId), 5000);
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let projectId = body.project_id;
      
      if (projectId) {
        const [projectCheck] = await connection.execute(
          'SELECT id FROM projects WHERE id = ? AND user_id = ? LIMIT 1',
          [projectId, user.id]
        );
        if (projectCheck.length === 0) {
          projectId = null;
        }
      }

      if (!projectId) {
        const [projects] = await connection.execute(
          'SELECT id FROM projects WHERE user_id = ? AND name = ? LIMIT 1',
          [user.id, 'Default Project']
        );
        
        if (projects.length > 0) {
          projectId = projects[0].id;
        } else {
          const [newProject] = await connection.execute(
            `INSERT INTO projects (user_id, name, description, status, created_at) 
             VALUES (?, 'Default Project', 'Default project for LinkedIn scans', 'active', NOW())`,
            [user.id]
          );
          projectId = newProject.insertId;
        }
      }

      const [targetResult] = await connection.execute(
        `INSERT INTO targets (project_id, type, value, label, status, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          projectId,
          'url',
          profileUrl,
          `${body.profile_name || 'LinkedIn'} Profile`,
          'pending'
        ]
      );

      const targetId = targetResult.insertId;

      const [scanResult] = await connection.execute(
        `INSERT INTO scans (target_id, scan_type, status, priority, progress, created_at)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [targetId, 'linkedin', 'queued', 1]
      );

      const scanId = scanResult.insertId;

      await connection.execute(
        `INSERT INTO linkedin_scans (
          scan_id, profile_url, profile_name, profile_headline,
          profile_location, connections_list, mutual_connections, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          scanId,
          profileUrl,
          body.profile_name || null,
          body.profile_headline || null,
          body.profile_location || null,
          body.connections_list || null,
          body.mutual_connections || null
        ]
      );

      await connection.commit();
      connection.release();
      
      pendingRequests.delete(requestId);

      return NextResponse.json({ 
        success: true, 
        message: '✅ LinkedIn scan created successfully!',
        scan: {
          id: scanId,
          status: 'queued',
          profile_name: body.profile_name,
          profile_url: profileUrl
        }
      });

    } catch (error) {
      await connection.rollback();
      if (connection) connection.release();
      pendingRequests.delete(requestId);
      throw error;
    }
  } catch (error) {
    if (connection) connection.release();
    console.error('Error creating LinkedIn scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create scan',
      details: error.message 
    }, { status: 500 });
  }
}

// PATCH - Update LinkedIn scan status
export async function PATCH(request) {
  let connection;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scanId = parseInt(searchParams.get('id'));

    if (!scanId) {
      return NextResponse.json({ success: false, error: 'Invalid scan ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, progress, findings_count } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify scan belongs to user
    const [scanCheck] = await connection.execute(`
      SELECT s.id 
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `, [scanId, user.id]);

    if (scanCheck.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json({ success: false, error: 'Scan not found or unauthorized' }, { status: 404 });
    }

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      values.push(progress);
    }
    if (findings_count !== undefined) {
      updates.push('findings_count = ?');
      values.push(findings_count);
    }

    if (status === 'running') updates.push('started_at = COALESCE(started_at, NOW())');
    if (['completed', 'failed', 'stopped'].includes(status)) updates.push('completed_at = NOW()');

    updates.push('updated_at = NOW()');

    if (updates.length > 0) {
      const query = `UPDATE scans SET ${updates.join(', ')} WHERE id = ?`;
      values.push(scanId);
      await connection.execute(query, values);
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({ success: true, message: 'Scan status updated' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error updating LinkedIn scan status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Remove LinkedIn scan (FIXED TO USE scans.id)
export async function DELETE(request) {
  let connection;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providedId = parseInt(searchParams.get('id'));

    if (!providedId) {
      return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
    }

    // Identify the scan_id correctly
    let scanId = providedId;
    let found = false;

    // Check if provided ID is scanId
    const [scanCheck] = await query(`
      SELECT s.id, s.target_id
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `, [providedId, user.id]);

    if (scanCheck.length > 0) {
      found = true;
    } else {
      // Check if provided ID is linkedin_scans.id
      const [lsCheck] = await query(`
        SELECT ls.scan_id, s.target_id
        FROM linkedin_scans ls
        JOIN scans s ON ls.scan_id = s.id
        JOIN targets t ON s.target_id = t.id
        JOIN projects p ON t.project_id = p.id
        WHERE ls.id = ? AND p.user_id = ?
      `, [providedId, user.id]);

      if (lsCheck.length > 0) {
        scanId = lsCheck[0].scan_id;
        found = true;
      }
    }

    if (!found) {
      return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    }

    const [targetInfo] = await query('SELECT target_id FROM scans WHERE id = ?', [scanId]);
    const targetId = targetInfo[0]?.target_id;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Delete from linkedin_scans
      await connection.execute('DELETE FROM linkedin_scans WHERE scan_id = ?', [scanId]);
      
      // 2. Delete from scans table
      await connection.execute('DELETE FROM scans WHERE id = ?', [scanId]);
      
      // 3. Delete target if no other scans reference it
      if (targetId) {
        const [remainingScans] = await connection.execute(
          'SELECT COUNT(*) as count FROM scans WHERE target_id = ?', 
          [targetId]
        );
        
        if (remainingScans[0].count === 0) {
          await connection.execute('DELETE FROM targets WHERE id = ?', [targetId]);
        }
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        success: true, 
        message: '✅ LinkedIn scan deleted successfully' 
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    if (connection) connection.release();
    console.error('Error deleting LinkedIn scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete scan',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update LinkedIn scan assets (FIXED TO USE scans.id)
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providedId = parseInt(searchParams.get('id'));
    const body = await request.json();

    if (!providedId) {
      return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
    }

    let scanId = providedId;
    const [scanCheck] = await query(`
      SELECT s.id 
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `, [providedId, user.id]);

    if (scanCheck.length === 0) {
      const [lsCheck] = await query(`
        SELECT ls.scan_id 
        FROM linkedin_scans ls
        JOIN scans s ON ls.scan_id = s.id
        JOIN targets t ON s.target_id = t.id
        JOIN projects p ON t.project_id = p.id
        WHERE ls.id = ? AND p.user_id = ?
      `, [providedId, user.id]);

      if (lsCheck.length > 0) {
        scanId = lsCheck[0].scan_id;
      } else {
        return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
      }
    }

    await pool.execute(
      `UPDATE linkedin_scans SET
        profile_url = ?,
        profile_name = ?,
        profile_headline = ?,
        profile_location = ?,
        connections_list = ?,
        mutual_connections = ?,
        updated_at = NOW()
      WHERE scan_id = ?`,
      [
        body.profile_url || '',
        body.profile_name || null,
        body.profile_headline || null,
        body.profile_location || null,
        body.connections_list || null,
        body.mutual_connections || null,
        scanId
      ]
    );

    return NextResponse.json({ success: true, message: 'Scan updated successfully' });
  } catch (error) {
    console.error('Error updating scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update scan',
      details: error.message 
    }, { status: 500 });
  }
}
