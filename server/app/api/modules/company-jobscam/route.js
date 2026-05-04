import pool from '../../../../database/config';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
        id: scan.id,
        job_url: scan.job_url,
        job_title: scan.job_title,
        job_description: scan.job_description,
        salary_offered: scan.salary_offered,
        company_name: scan.company_name,
        company_website: scan.company_website,
        company_linkedin: scan.company_linkedin,
        company_email_domain: scan.company_email_domain,
        company_phone: scan.company_phone,
        company_address: scan.company_address,
        company_email: scan.company_email,
        recruiter_name: scan.recruiter_name,
        recruiter_email: scan.recruiter_email,
        recruiter_phone: scan.recruiter_phone,
        recruiter_linkedin: scan.recruiter_linkedin,
        recruiter_title: scan.recruiter_title,
        suspicious_message: scan.suspicious_message,
        communication_channel: scan.communication_channel,
        red_flags_noticed: scan.red_flags_noticed,
        notes: scan.notes,
        risk_score: scan.risk_score,
        risk_level: scan.risk_level,
        analysis_status: scan.analysis_status,
        findings_summary: scan.findings_summary
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

// POST /api/modules/company-jobscam - Create new job scam scan
export async function POST(request) {
  let connection;
  
  // Generate unique request ID to prevent duplicates
  const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Check if this exact request is already being processed
  if (pendingRequests.has(requestId)) {
    console.log(`⛔ Duplicate POST request blocked: ${requestId}`);
    return NextResponse.json({ 
      success: false, 
      error: 'Duplicate request - already processing' 
    }, { status: 429 });
  }
  
  // Mark this request as processing
  pendingRequests.set(requestId, true);
  console.log(`📝 Processing POST request: ${requestId}`);
  
  // Clean up after 3 seconds
  setTimeout(() => {
    pendingRequests.delete(requestId);
  }, 3000);
  
  try {
    const user = await verifyToken(request);
    if (!user) {
      pendingRequests.delete(requestId);
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please login first' 
      }, { status: 401 });
    }

    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (!body.files) body.files = [];
          body.files.push(value);
        } else {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
    }
    
    // Validate required fields
    if (!body.company_name && !body.job_url) {
      pendingRequests.delete(requestId);
      return NextResponse.json({ 
        success: false, 
        error: 'Please provide at least company name or job URL' 
      }, { status: 400 });
    }
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get or create project
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
             VALUES (?, 'Default Project', 'Default project for job scam scans', 'active', NOW())`,
            [user.id]
          );
          projectId = newProject.insertId;
        }
      }

      // Create target
      const targetLabel = `${body.company_name || 'Unknown Company'} - ${body.job_title || 'Job Scam Investigation'}`;
      
      const [targetResult] = await connection.execute(
        `INSERT INTO targets (
          project_id, type, value, label, status, created_at
        ) VALUES (?, ?, ?, ?, 'pending', NOW())`,
        [
          projectId,
          'url',
          body.job_url || body.company_website || 'Manual Entry',
          targetLabel
        ]
      );

      const targetId = targetResult.insertId;

      // Create scan
      const [scanResult] = await connection.execute(
        `INSERT INTO scans (
          target_id, scan_type, status, priority, created_at
        ) VALUES (?, 'job-recruitment', 'queued', 1, NOW())`,
        [targetId]
      );

      const scanId = scanResult.insertId;

      // Calculate risk score
      const riskScore = calculateRiskScore(body);
      const riskLevel = getRiskLevel(riskScore);

      // Insert ALL data into job_recruitment_scans table
      await connection.execute(
        `INSERT INTO job_recruitment_scans (
          scan_id, 
          job_url, 
          job_title, 
          job_description,
          salary_offered,
          company_name, 
          company_website, 
          company_linkedin,
          company_email_domain,
          company_phone, 
          company_address,
          company_email,
          recruiter_name, 
          recruiter_email, 
          recruiter_phone,
          recruiter_linkedin,
          recruiter_title,
          suspicious_message,
          communication_channel,
          red_flags_noticed,
          notes,
          risk_score, 
          risk_level,
          analysis_status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          scanId,
          body.job_url || null,
          body.job_title || null,
          body.job_description || null,
          body.salary_offered || null,
          body.company_name || null,
          body.company_website || null,
          body.company_linkedin || null,
          body.company_email_domain || null,
          body.company_phone || null,
          body.company_address || null,
          body.company_email || null,
          body.recruiter_name || null,
          body.recruiter_email || null,
          body.recruiter_phone || null,
          body.recruiter_linkedin || null,
          body.recruiter_title || null,
          body.suspicious_message || null,
          body.communication_channel || null,
          body.red_flags_noticed || null,
          body.notes || null,
          riskScore,
          riskLevel
        ]
      );

      // Handle file uploads if any
      let fileUrls = [];
      if (body.files && body.files.length > 0) {
        fileUrls = body.files.map((file, index) => ({
          name: file.name,
          size: file.size,
          type: file.type
        }));
        console.log(`Files to upload: ${body.files.length} files`);
      }

      await connection.commit();
      connection.release();
      
      console.log(`✅ POST request ${requestId} completed successfully`);

      return NextResponse.json({ 
        success: true, 
        message: '✅ Scan created successfully! Your investigation has been saved.',
        scan: {
          id: scanId,
          status: 'queued',
          company_name: body.company_name,
          job_title: body.job_title,
          risk_level: riskLevel,
          risk_score: riskScore
        },
        files_uploaded: fileUrls.length
      });

    } catch (error) {
      await connection.rollback();
      if (connection) connection.release();
      console.error('Transaction error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save scan data. Please try again.',
        details: error.message 
      }, { status: 500 });
    }
  } catch (error) {
    if (connection) connection.release();
    console.error('Error creating job scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: '❌ Failed to create scan. Please check your input and try again.',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/modules/company-jobscam - Fixed to handle both ID types
export async function DELETE(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providedId = parseInt(searchParams.get('id'));

    if (!providedId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid scan ID' 
      }, { status: 400 });
    }

    console.log(`DELETE request for ID: ${providedId} by user: ${user.id}`);

    // First, try to find the scans.id directly
    let scanId = providedId;
    let found = false;

    // Check if the provided ID exists in the scans table
    const [scanCheck] = await query(`
      SELECT s.id 
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `, [providedId, user.id]);

    if (scanCheck.length > 0) {
      found = true;
      console.log(`ID ${providedId} found in scans table`);
    } else {
      // If not found, check if it exists in job_recruitment_scans (as its own id)
      const [jobScanCheck] = await query(`
        SELECT j.scan_id 
        FROM job_recruitment_scans j
        JOIN scans s ON j.scan_id = s.id
        JOIN targets t ON s.target_id = t.id
        JOIN projects p ON t.project_id = p.id
        WHERE j.id = ? AND p.user_id = ?
      `, [providedId, user.id]);

      if (jobScanCheck.length > 0) {
        scanId = jobScanCheck[0].scan_id;
        found = true;
        console.log(`ID ${providedId} found in job_recruitment_scans table, mapped to scan_id ${scanId}`);
      }
    }

    if (!found) {
      console.log(`ID ${providedId} not found in either scans or job_recruitment_scans for user ${user.id}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Scan not found or unauthorized' 
      }, { status: 404 });
    }

    // Now get the target_id using the verified scanId
    const [scanDetails] = await query(`
      SELECT s.target_id
      FROM scans s
      WHERE s.id = ?
    `, [scanId]);

    if (scanDetails.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Scan details not found' 
      }, { status: 404 });
    }

    const targetId = scanDetails[0].target_id;

    // Start transaction for safe deletion
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete from job_recruitment_scans
      await connection.execute('DELETE FROM job_recruitment_scans WHERE scan_id = ?', [scanId]);
      console.log(`Deleted from job_recruitment_scans for scan_id: ${scanId}`);
      
      // Delete from scans
      await connection.execute('DELETE FROM scans WHERE id = ?', [scanId]);
      console.log(`Deleted from scans for id: ${scanId}`);
      
      // Check if target has other scans
      const [remainingScans] = await connection.execute(
        'SELECT COUNT(*) as count FROM scans WHERE target_id = ?', 
        [targetId]
      );
      
      // Delete target if no other scans reference it
      if (remainingScans[0].count === 0) {
        await connection.execute('DELETE FROM targets WHERE id = ?', [targetId]);
        console.log(`Deleted target ${targetId} (no other scans)`);
      } else {
        console.log(`Target ${targetId} has ${remainingScans[0].count} other scans, not deleting`);
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        success: true, 
        message: '✅ Scan deleted successfully' 
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting scan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete scan',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT /api/modules/company-jobscam - Update scan assets
export async function PUT(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providedId = parseInt(searchParams.get('id'));
    const body = await request.json();

    if (!providedId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid scan ID' 
      }, { status: 400 });
    }

    console.log(`PUT request for ID: ${providedId} by user: ${user.id}`);

    // First, try to find the scans.id directly
    let scanId = providedId;
    let found = false;

    // Check if the provided ID exists in the scans table
    const [scanCheck] = await query(`
      SELECT s.id 
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `, [providedId, user.id]);

    if (scanCheck.length > 0) {
      found = true;
      console.log(`ID ${providedId} found in scans table`);
    } else {
      // If not found, check if it exists in job_recruitment_scans (as its own id)
      const [jobScanCheck] = await query(`
        SELECT j.scan_id 
        FROM job_recruitment_scans j
        JOIN scans s ON j.scan_id = s.id
        JOIN targets t ON s.target_id = t.id
        JOIN projects p ON t.project_id = p.id
        WHERE j.id = ? AND p.user_id = ?
      `, [providedId, user.id]);

      if (jobScanCheck.length > 0) {
        scanId = jobScanCheck[0].scan_id;
        found = true;
        console.log(`ID ${providedId} found in job_recruitment_scans table, mapped to scan_id ${scanId}`);
      }
    }

    if (!found) {
      console.log(`ID ${providedId} not found in either scans or job_recruitment_scans for user ${user.id}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Scan not found or unauthorized' 
      }, { status: 404 });
    }

    // Recalculate risk score based on updated data
    const riskScore = calculateRiskScore(body);
    const riskLevel = getRiskLevel(riskScore);

    // Check if record exists in job_recruitment_scans
    const [existingRecord] = await query(
      'SELECT scan_id FROM job_recruitment_scans WHERE scan_id = ?',
      [scanId]
    );

    if (existingRecord.length === 0) {
      // Insert new record
      await pool.execute(
        `INSERT INTO job_recruitment_scans (
          scan_id, job_url, job_title, job_description, salary_offered,
          company_name, company_website, company_linkedin, company_email_domain,
          company_phone, company_address, company_email,
          recruiter_name, recruiter_email, recruiter_phone, recruiter_linkedin,
          recruiter_title, suspicious_message, communication_channel,
          red_flags_noticed, notes, risk_score, risk_level, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          scanId,
          body.job_url || null,
          body.job_title || null,
          body.job_description || null,
          body.salary_offered || null,
          body.company_name || null,
          body.company_website || null,
          body.company_linkedin || null,
          body.company_email_domain || null,
          body.company_phone || null,
          body.company_address || null,
          body.company_email || null,
          body.recruiter_name || null,
          body.recruiter_email || null,
          body.recruiter_phone || null,
          body.recruiter_linkedin || null,
          body.recruiter_title || null,
          body.suspicious_message || null,
          body.communication_channel || null,
          body.red_flags_noticed || null,
          body.notes || null,
          riskScore,
          riskLevel
        ]
      );
    } else {
      // Update existing record
      await pool.execute(
        `UPDATE job_recruitment_scans SET
          job_url = ?,
          job_title = ?,
          job_description = ?,
          salary_offered = ?,
          company_name = ?,
          company_website = ?,
          company_linkedin = ?,
          company_email_domain = ?,
          company_phone = ?,
          company_address = ?,
          company_email = ?,
          recruiter_name = ?,
          recruiter_email = ?,
          recruiter_phone = ?,
          recruiter_linkedin = ?,
          recruiter_title = ?,
          suspicious_message = ?,
          communication_channel = ?,
          red_flags_noticed = ?,
          notes = ?,
          risk_score = ?,
          risk_level = ?,
          updated_at = NOW()
        WHERE scan_id = ?`,
        [
          body.job_url || null,
          body.job_title || null,
          body.job_description || null,
          body.salary_offered || null,
          body.company_name || null,
          body.company_website || null,
          body.company_linkedin || null,
          body.company_email_domain || null,
          body.company_phone || null,
          body.company_address || null,
          body.company_email || null,
          body.recruiter_name || null,
          body.recruiter_email || null,
          body.recruiter_phone || null,
          body.recruiter_linkedin || null,
          body.recruiter_title || null,
          body.suspicious_message || null,
          body.communication_channel || null,
          body.red_flags_noticed || null,
          body.notes || null,
          riskScore,
          riskLevel,
          scanId
        ]
      );
    }

    // Update target label if company name or job title changed
    if (body.company_name || body.job_title) {
      const [targetInfo] = await query(`
        SELECT t.id 
        FROM targets t
        JOIN scans s ON t.id = s.target_id
        WHERE s.id = ?
      `, [scanId]);
      
      if (targetInfo.length > 0) {
        const newLabel = `${body.company_name || 'Unknown Company'} - ${body.job_title || 'Job Scam Investigation'}`;
        await pool.execute(
          'UPDATE targets SET label = ? WHERE id = ?',
          [newLabel, targetInfo[0].id]
        );
      }
    }

    console.log(`Successfully updated scan ${scanId}`);

    return NextResponse.json({ 
      success: true, 
      message: '✅ Scan updated successfully!',
      risk_score: riskScore,
      risk_level: riskLevel
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
  
  if (data.recruiter_email) {
    const suspiciousDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = data.recruiter_email.split('@')[1];
    if (suspiciousDomains.includes(domain)) {
      score += 20;
    }
  }

  if (!data.company_website) {
    score += 15;
  }

  if (data.job_url) {
    const shorteners = ['bit.ly', 'tinyurl', 'short.link', 'rb.gy'];
    if (shorteners.some(s => data.job_url.includes(s))) {
      score += 25;
    }
  }

  if (data.suspicious_message) {
    const redFlagWords = ['urgent', 'immediately', 'wire transfer', 'western union', 'paypal', 'crypto', 'bitcoin'];
    const lowerMessage = data.suspicious_message.toLowerCase();
    redFlagWords.forEach(word => {
      if (lowerMessage.includes(word)) {
        score += 10;
      }
    });
  }

  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}