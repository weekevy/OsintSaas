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

// GET - Fetch all crypto wallet scans
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
        cw.wallet_address,
        cw.blockchain,
        cw.exchange,
        cw.notes,
        cw.transaction_count,
        cw.balance,
        cw.risk_score,
        t.value as target_value,
        t.type as target_type,
        t.label as target_label
      FROM scans s
      LEFT JOIN crypto_wallet_scans cw ON s.id = cw.scan_id
      LEFT JOIN targets t ON s.target_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE s.scan_type = 'crypto-wallet'
      AND p.user_id = ?
      ORDER BY s.created_at DESC
    `, [user.id]);

    const formattedScans = scans.map(scan => ({
      id: scan.scan_id,
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
        wallet_address: scan.wallet_address,
        blockchain: scan.blockchain,
        exchange: scan.exchange,
        notes: scan.notes,
        transaction_count: scan.transaction_count,
        balance: scan.balance,
        risk_score: scan.risk_score
      },
      findings_count: scan.findings_count || 0
    }));

    return NextResponse.json({ 
      success: true, 
      scans: formattedScans,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching crypto scans:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch scans',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new crypto scan
export async function POST(request) {
  let connection;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const walletAddress = body.wallet_address;

    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'Wallet address is required' }, { status: 400 });
    }

    // Duplicate protection
    const requestId = `crypto_${user.id}_${walletAddress}`;
    if (pendingRequests.has(requestId)) {
      return NextResponse.json({ success: false, error: 'Request already being processed' }, { status: 429 });
    }
    pendingRequests.set(requestId, true);
    setTimeout(() => pendingRequests.delete(requestId), 5000);
    
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
          projectId = null;
        }
      }

      if (!projectId) {
        const [projects] = await connection.execute('SELECT id FROM projects WHERE user_id = ? AND name = ? LIMIT 1', [user.id, 'Default Project']);
        if (projects.length > 0) projectId = projects[0].id;
        else {
          const [newProject] = await connection.execute(`INSERT INTO projects (user_id, name, description, status, created_at) VALUES (?, 'Default Project', 'Default project for crypto scans', 'active', NOW())`, [user.id]);
          projectId = newProject.insertId;
        }
      }

      const [targetResult] = await connection.execute(`INSERT INTO targets (project_id, type, value, label, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())`, [projectId, 'crypto', walletAddress, `${body.blockchain || 'Crypto'} Wallet`, 'pending']);
      const targetId = targetResult.insertId;

      const [scanResult] = await connection.execute(`INSERT INTO scans (target_id, scan_type, status, priority, progress, created_at) VALUES (?, ?, ?, ?, 0, NOW())`, [targetId, 'crypto-wallet', 'queued', 1]);
      const scanId = scanResult.insertId;

      await connection.execute(`INSERT INTO crypto_wallet_scans (scan_id, wallet_address, blockchain, exchange, notes, created_at) VALUES (?, ?, ?, ?, ?, NOW())`, [scanId, walletAddress, body.blockchain || null, body.exchange || null, body.notes || null]);

      await connection.commit();
      connection.release();
      pendingRequests.delete(requestId);

      return NextResponse.json({ success: true, message: '✅ Crypto wallet scan created successfully!', scan: { id: scanId, status: 'queued', wallet_address: walletAddress } });
    } catch (error) {
      await connection.rollback();
      if (connection) connection.release();
      pendingRequests.delete(requestId);
      throw error;
    }
  } catch (error) {
    if (connection) connection.release();
    console.error('Error creating crypto scan:', error);
    return NextResponse.json({ success: false, error: 'Failed to create scan', details: error.message }, { status: 500 });
  }
}

// PATCH - Update scan status
export async function PATCH(request) {
  let connection;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const scanId = parseInt(searchParams.get('id'));
    if (!scanId) return NextResponse.json({ success: false, error: 'Invalid scan ID' }, { status: 400 });
    const body = await request.json();
    const { status, progress, findings_count } = body;
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [scanCheck] = await connection.execute(`SELECT s.id FROM scans s JOIN targets t ON s.target_id = t.id JOIN projects p ON t.project_id = p.id WHERE s.id = ? AND p.user_id = ?`, [scanId, user.id]);
    if (scanCheck.length === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json({ success: false, error: 'Scan not found or unauthorized' }, { status: 404 });
    }
    const updates = [];
    const values = [];
    if (status) { updates.push('status = ?'); values.push(status); }
    if (progress !== undefined) { updates.push('progress = ?'); values.push(progress); }
    if (findings_count !== undefined) { updates.push('findings_count = ?'); values.push(findings_count); }
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
    if (connection) { await connection.rollback(); connection.release(); }
    console.error('Error updating crypto scan status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Remove scan
export async function DELETE(request) {
  let connection;
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
    const [scanCheck] = await query(`SELECT s.id, s.target_id FROM scans s JOIN targets t ON s.target_id = t.id JOIN projects p ON t.project_id = p.id WHERE s.id = ? AND p.user_id = ?`, [id, user.id]);
    if (scanCheck.length === 0) return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    const targetId = scanCheck[0].target_id;
    connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.execute('DELETE FROM crypto_wallet_scans WHERE scan_id = ?', [id]);
    await connection.execute('DELETE FROM scans WHERE id = ?', [id]);
    if (targetId) {
      const [remainingScans] = await connection.execute('SELECT COUNT(*) as count FROM scans WHERE target_id = ?', [targetId]);
      if (remainingScans[0].count === 0) await connection.execute('DELETE FROM targets WHERE id = ?', [targetId]);
    }
    await connection.commit();
    connection.release();
    return NextResponse.json({ success: true, message: '✅ Crypto scan deleted successfully' });
  } catch (error) {
    if (connection) connection.release();
    console.error('Error deleting scan:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete scan' }, { status: 500 });
  }
}

// PUT - Update scan assets
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    const body = await request.json();
    if (!id) return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 });
    const [scanCheck] = await query(`SELECT s.id FROM scans s JOIN targets t ON s.target_id = t.id JOIN projects p ON t.project_id = p.id WHERE s.id = ? AND p.user_id = ?`, [id, user.id]);
    if (scanCheck.length === 0) return NextResponse.json({ error: 'Scan not found or unauthorized' }, { status: 404 });
    await pool.execute(`UPDATE crypto_wallet_scans SET wallet_address = ?, blockchain = ?, exchange = ?, notes = ?, updated_at = NOW() WHERE scan_id = ?`, [body.wallet_address || null, body.blockchain || null, body.exchange || null, body.notes || null, id]);
    return NextResponse.json({ success: true, message: 'Scan updated successfully' });
  } catch (error) {
    console.error('Error updating crypto scan:', error);
    return NextResponse.json({ success: false, error: 'Failed to update scan' }, { status: 500 });
  }
}
