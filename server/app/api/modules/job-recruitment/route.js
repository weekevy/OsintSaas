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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
        const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET || 'your-secret-key');
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

// GET /api/modules/job-recruitment - Get all job recruitment scans for the current user
export async function GET(request) {
  try {
    // Verify user from token
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all scans for the current user that are job-recruitment type
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
        j.*,
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
        job_url: scan.job_url,
        company_name: scan.company_name,
        company_website: scan.company_website,
        job_title: scan.job_title,
        job_description: scan.job_description,
        company_linkedin: scan.company_linkedin,
        company_address: scan.company_address,
        company_phone: scan.company_phone,
        company_email: scan.company_email,
        recruiter_name: scan.recruiter_name,
        recruiter_linkedin: scan.recruiter_linkedin,
        recruiter_email: scan.recruiter_email,
        recruiter_phone: scan.recruiter_phone,
        risk_score: scan.risk_score,
        risk_level: scan.risk_level
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ 
      success: true, 
      scans: formattedScans 
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

// POST /api/modules/job-recruitment - Create new job recruitment scan
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
             VALUES (?, 'Default Project', 'Default project for job scans', 'active', NOW())`,
            [user.id]
          );
          projectId = newProject.insertId;
        }
      }

      // Create target
      const [targetResult] = await connection.execute(
        `INSERT INTO targets (
          project_id, type, value, label, status, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          projectId,
          'url',
          body.job_url || 'Unknown',
          `${body.company_name || 'Unknown'} - ${body.job_title || 'Job'}`,
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
          'job-recruitment',
          'queued',
          1
        ]
      );

      const scanId = scanResult.insertId;

      // Calculate initial risk score
      const riskScore = calculateRiskScore(body);
      const riskLevel = getRiskLevel(riskScore);

      // Create job recruitment specific data
      await connection.execute(
        `INSERT INTO job_recruitment_scans (
          scan_id, job_url, company_name, company_website, job_title,
          job_description, company_linkedin, company_address, company_phone,
          company_email, recruiter_name, recruiter_linkedin, recruiter_email,
          recruiter_phone, risk_score, risk_level, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          scanId,
          body.job_url || '',
          body.company_name || '',
          body.company_website || '',
          body.job_title || '',
          body.job_description || '',
          body.company_linkedin || '',
          body.company_address || '',
          body.company_phone || '',
          body.company_email || '',
          body.recruiter_name || '',
          body.recruiter_linkedin || '',
          body.recruiter_email || '',
          body.recruiter_phone || '',
          riskScore,
          riskLevel
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
            job_url: body.job_url,
            company_name: body.company_name,
            job_title: body.job_title,
            risk_level: riskLevel
          }
        },
        message: 'Scan created successfully' 
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating job scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create scan',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/modules/job-recruitment?id=1 - Delete scan
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

// PUT /api/modules/job-recruitment?id=1 - Update scan assets
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
      SELECT j.scan_id 
      FROM job_recruitment_scans j
      JOIN scans s ON j.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE j.scan_id = ? AND p.user_id = ?
    `, [id, user.id]);

    if (scans.length === 0) {
      return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    }

    // Update job recruitment specific data
    await pool.execute(
      `UPDATE job_recruitment_scans SET
        job_url = ?,
        company_name = ?,
        company_website = ?,
        job_title = ?,
        job_description = ?,
        company_linkedin = ?,
        company_address = ?,
        company_phone = ?,
        company_email = ?,
        recruiter_name = ?,
        recruiter_linkedin = ?,
        recruiter_email = ?,
        recruiter_phone = ?,
        updated_at = NOW()
      WHERE scan_id = ?`,
      [
        body.job_url || '',
        body.company_name || '',
        body.company_website || '',
        body.job_title || '',
        body.job_description || '',
        body.company_linkedin || '',
        body.company_address || '',
        body.company_phone || '',
        body.company_email || '',
        body.recruiter_name || '',
        body.recruiter_linkedin || '',
        body.recruiter_email || '',
        body.recruiter_phone || '',
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

function calculateRiskScore(data) {
  let score = 0;
  
  // Check for suspicious email domains
  if (data.recruiter_email) {
    const suspiciousDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = data.recruiter_email.split('@')[1];
    if (suspiciousDomains.includes(domain)) {
      score += 20;
    }
  }

  // Check for missing company website
  if (!data.company_website) {
    score += 15;
  }

  // Check for URL shorteners in job URL
  if (data.job_url) {
    const shorteners = ['bit.ly', 'tinyurl', 'short.link', 'rb.gy'];
    if (shorteners.some(s => data.job_url.includes(s))) {
      score += 25;
    }
  }

  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}
