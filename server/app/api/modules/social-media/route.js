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

// GET /api/modules/social-media - Get all social media scans for the current user
export async function GET(request) {
  try {
    // Verify user from token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all scans for the current user that are social-media type
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
        sm.twitter_url,
        sm.facebook_url,
        sm.instagram_url,
        sm.tiktok_url,
        sm.youtube_url,
        sm.reddit_url,
        sm.display_name,
        sm.username_variations,
        sm.profile_pictures,
        t.value as target_value,
        t.type as target_type,
        t.label as target_label
      FROM scans s
      LEFT JOIN social_media_scans sm ON s.id = sm.scan_id
      LEFT JOIN targets t ON s.target_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE s.scan_type = 'social-media'
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
        twitter_url: scan.twitter_url,
        facebook_url: scan.facebook_url,
        instagram_url: scan.instagram_url,
        tiktok_url: scan.tiktok_url,
        youtube_url: scan.youtube_url,
        reddit_url: scan.reddit_url,
        display_name: scan.display_name,
        username_variations: scan.username_variations,
        profile_pictures: scan.profile_pictures
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ 
      success: true, 
      scans: formattedScans 
    });
  } catch (error) {
    console.error('Error fetching social media scans:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch scans',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/modules/social-media - Create new social media scan
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
             VALUES (?, 'Default Project', 'Default project for social media scans', 'active', NOW())`,
            [user.id]
          );
          projectId = newProject.insertId;
        }
      }

      // Determine target value (use the first available platform URL or display name)
      const targetValue = body.twitter_url || body.facebook_url || body.instagram_url || 
                          body.tiktok_url || body.youtube_url || body.reddit_url || 
                          body.display_name || 'Unknown';

      // Determine target label
      const targetLabel = body.display_name ? `${body.display_name} - Social Profile` : 'Social Media Profile';

      // Create target
      const [targetResult] = await connection.execute(
        `INSERT INTO targets (
          project_id, type, value, label, status, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          projectId,
          'social',
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
          'social-media',
          'queued',
          1
        ]
      );

      const scanId = scanResult.insertId;

      // Create social media specific data - matching exact table columns
      await connection.execute(
        `INSERT INTO social_media_scans (
          scan_id, 
          twitter_url, 
          facebook_url, 
          instagram_url, 
          tiktok_url,
          youtube_url, 
          reddit_url, 
          display_name, 
          username_variations,
          profile_pictures, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          scanId,
          body.twitter_url || null,
          body.facebook_url || null,
          body.instagram_url || null,
          body.tiktok_url || null,
          body.youtube_url || null,
          body.reddit_url || null,
          body.display_name || null,
          body.username_variations || null,
          body.profile_pictures || null
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
            display_name: body.display_name,
            twitter_url: body.twitter_url,
            instagram_url: body.instagram_url
          }
        },
        message: 'Social media scan created successfully' 
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating social media scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create scan',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/modules/social-media?id=1 - Delete scan
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

// PUT /api/modules/social-media?id=1 - Update scan assets
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
      SELECT sm.scan_id 
      FROM social_media_scans sm
      JOIN scans s ON sm.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE sm.scan_id = ? AND p.user_id = ?
    `, [id, user.id]);

    if (scans.length === 0) {
      return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    }

    // Update social media specific data
    await pool.execute(
      `UPDATE social_media_scans SET
        twitter_url = ?,
        facebook_url = ?,
        instagram_url = ?,
        tiktok_url = ?,
        youtube_url = ?,
        reddit_url = ?,
        display_name = ?,
        username_variations = ?,
        profile_pictures = ?,
        updated_at = NOW()
      WHERE scan_id = ?`,
      [
        body.twitter_url || null,
        body.facebook_url || null,
        body.instagram_url || null,
        body.tiktok_url || null,
        body.youtube_url || null,
        body.reddit_url || null,
        body.display_name || null,
        body.username_variations || null,
        body.profile_pictures || null,
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