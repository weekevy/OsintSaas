import pool from '../../../../database/config';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    // Check Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this');
      return decoded;
    }
    
    // Then check cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, value] = c.split('=');
          return [key, value];
        })
      );
      
      if (cookies.token) {
        const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this');
        return decoded;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Helper function to query the database using the pool
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// GET /api/modules/scam-email - Get all scam email scans for the current user
export async function GET(request) {
  try {
    // Verify user from token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all scans for the current user that are scam-email type
    const [scans] = await query(`
      SELECT 
        s.id,
        s.scan_type,
        s.status,
        s.priority,
        s.findings_count,
        s.started_at,
        s.completed_at,
        s.created_at,
        se.sender_email,
        se.sender_name,
        se.subject,
        se.email_body,
        se.attachments,
        se.headers_raw,
        se.reply_to,
        se.return_path,
        t.value as target_value,
        t.type as target_type,
        t.label as target_label
      FROM scans s
      LEFT JOIN scam_email_scans se ON s.id = se.scan_id
      LEFT JOIN targets t ON s.target_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE s.scan_type = 'scam-email'
      AND p.user_id = ?
      ORDER BY s.created_at DESC
    `, [user.id]);

    // Format the response
    const formattedScans = scans.map(scan => ({
      id: scan.id,
      scan_type: scan.scan_type,
      status: scan.status,
      progress: calculateProgress(scan),
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      created_at: scan.created_at,
      target: {
        value: scan.target_value,
        type: scan.target_type,
        label: scan.target_label
      },
      assets: {
        sender_email: scan.sender_email,
        sender_name: scan.sender_name,
        subject: scan.subject,
        email_body: scan.email_body,
        attachments: scan.attachments,
        headers_raw: scan.headers_raw,
        reply_to: scan.reply_to,
        return_path: scan.return_path
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ 
      success: true, 
      scans: formattedScans 
    });
  } catch (error) {
    console.error('Error fetching scam email scans:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch scans',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/modules/scam-email - Create new scam email scan
export async function POST(request) {
  try {
    // Verify user from token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // First, find or create a project for this user
      let projectId = body.project_id;
      
      if (!projectId) {
        // Check if user has a default project
        const [projects] = await connection.execute(
          'SELECT id FROM projects WHERE user_id = ? AND name = ? LIMIT 1',
          [user.id, 'Default Project']
        );
        
        if (projects.length > 0) {
          projectId = projects[0].id;
        } else {
          // Create a default project for the user
          const [newProject] = await connection.execute(
            `INSERT INTO projects (user_id, name, description, status, created_at) 
             VALUES (?, 'Default Project', 'Default project for scam email scans', 'active', NOW())`,
            [user.id]
          );
          projectId = newProject.insertId;
        }
      }

      // Determine target value (use sender email or subject)
      const targetValue = body.sender_email || body.subject || 'Unknown';
      const targetLabel = body.subject ? `${body.subject} - Email Analysis` : 'Scam Email Analysis';

      // Create target
      const [targetResult] = await connection.execute(
        `INSERT INTO targets (
          project_id, type, value, label, status, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          projectId,
          'email',
          targetValue,
          targetLabel,
          'pending'
        ]
      );

      const targetId = targetResult.insertId;

      // Create scan
      const [scanResult] = await connection.execute(
        `INSERT INTO scans (
          target_id, scan_type, status, priority, created_at
        ) VALUES (?, ?, ?, ?, NOW())`,
        [
          targetId,
          'scam-email',
          'queued',
          1
        ]
      );

      const scanId = scanResult.insertId;

      // Create scam email specific data - matching exact table columns
      await connection.execute(
        `INSERT INTO scam_email_scans (
          scan_id, 
          sender_email, 
          sender_name,
          subject, 
          email_body, 
          attachments,
          headers_raw, 
          reply_to, 
          return_path, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          scanId,
          body.sender_email || null,
          body.sender_name || null,
          body.subject || null,
          body.email_body || null,
          body.attachments || null,
          body.headers_raw || null,
          body.reply_to || null,
          body.return_path || null
        ]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        success: true, 
        scan: {
          id: scanId,
          status: 'queued',
          assets: {
            sender_email: body.sender_email,
            sender_name: body.sender_name,
            subject: body.subject
          }
        },
        message: 'Scam email scan created successfully' 
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating scam email scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create scan',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/modules/scam-email?id=1 - Delete scan
export async function DELETE(request) {
  try {
    // Verify user from token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    // Verify the scan belongs to this user before deleting
    const [scans] = await query(`
      SELECT s.id 
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `, [id, user.id]);

    if (scans.length === 0) {
      return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    }

    await pool.execute('DELETE FROM scans WHERE id = ?', [id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Scan deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete scan',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT /api/modules/scam-email?id=1 - Update scan assets
export async function PUT(request) {
  try {
    // Verify user from token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    const body = await request.json();

    // Verify the scan belongs to this user before updating
    const [scans] = await query(`
      SELECT se.scan_id 
      FROM scam_email_scans se
      JOIN scans s ON se.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE se.scan_id = ? AND p.user_id = ?
    `, [id, user.id]);

    if (scans.length === 0) {
      return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    }

    // Update scam email specific data
    await pool.execute(
      `UPDATE scam_email_scans SET
        sender_email = ?,
        sender_name = ?,
        subject = ?,
        email_body = ?,
        attachments = ?,
        headers_raw = ?,
        reply_to = ?,
        return_path = ?,
        updated_at = NOW()
      WHERE scan_id = ?`,
      [
        body.sender_email || null,
        body.sender_name || null,
        body.subject || null,
        body.email_body || null,
        body.attachments || null,
        body.headers_raw || null,
        body.reply_to || null,
        body.return_path || null,
        id
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Scan updated successfully' 
    });
  } catch (error) {
    console.error('Error updating scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update scan',
      details: error.message 
    }, { status: 500 });
  }
}

// Helper functions
function calculateProgress(scan) {
  if (scan.status === 'completed') return 100;
  if (scan.status === 'running') return 50;
  if (scan.status === 'queued' || scan.status === 'pending') return 0;
  return 0;
}