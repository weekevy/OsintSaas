import pool from '../../../../database/config';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this');
      return decoded;
    }
    
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
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        l.*,
        t.value as target_value,
        t.type as target_type,
        t.label as target_label
      FROM scans s
      LEFT JOIN linkedin_scans l ON s.id = l.scan_id
      LEFT JOIN targets t ON s.target_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE s.scan_type = 'linkedin'
      AND p.user_id = ?
      ORDER BY s.created_at DESC
    `, [user.id]);

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
        profile_url: scan.profile_url,
        profile_name: scan.profile_name,
        profile_headline: scan.profile_headline,
        profile_location: scan.profile_location,
        connections_list: scan.connections_list,
        mutual_connections: scan.mutual_connections
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ success: true, scans: formattedScans });
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
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('LinkedIn POST received:', body);
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      let projectId = body.project_id;
      
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
          body.profile_url || 'Unknown',
          `${body.profile_name || 'LinkedIn'} Profile`,
          'pending'
        ]
      );

      const targetId = targetResult.insertId;

      const [scanResult] = await connection.execute(
        `INSERT INTO scans (target_id, scan_type, status, priority, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
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
          body.profile_url || '',
          body.profile_name || '',
          body.profile_headline || '',
          body.profile_location || '',
          body.connections_list || '',
          body.mutual_connections || ''
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
            profile_url: body.profile_url,
            profile_name: body.profile_name,
            profile_headline: body.profile_headline
          }
        },
        message: 'LinkedIn scan created successfully' 
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating LinkedIn scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create scan',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Remove LinkedIn scan
export async function DELETE(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

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

    return NextResponse.json({ success: true, message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('Error deleting scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete scan',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update LinkedIn scan assets
export async function PUT(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    const body = await request.json();

    const [scans] = await query(`
      SELECT l.scan_id 
      FROM linkedin_scans l
      JOIN scans s ON l.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE l.scan_id = ? AND p.user_id = ?
    `, [id, user.id]);

    if (scans.length === 0) {
      return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
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
        body.profile_name || '',
        body.profile_headline || '',
        body.profile_location || '',
        body.connections_list || '',
        body.mutual_connections || '',
        id
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