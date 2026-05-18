import pool from '../../../../../database/config';
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

export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please login first' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { event_type, scan_id, scan_name, target, previous_state, data } = body;
    
    console.log(`📡 Received event: ${event_type} for scan ${scan_id} from user ${user.id}`);
    
    const DOCKER_URL = process.env.JOB_RECRUITMENT_API_URL || 'http://127.0.0.1:8000';
    
    // Decide which Docker endpoint to call
    let dockerEndpoint = `/event/${event_type}`;
    if (event_type === 'start') {
      dockerEndpoint = '/scan/start';
    }

    // Forward the event to Docker container
    const dockerResponse = await fetch(`${DOCKER_URL}${dockerEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.DOCKER_API_KEY || 'your-super-secret-api-key-change-this'
      },
      body: JSON.stringify({
        scan_id,
        scan_name: scan_name || 'Investigation',
        target: target || 'Unknown',
        previous_state,
        data: data || {},
        user_id: user.id,
        timestamp: new Date().toISOString()
      }),
    }).catch(err => {
      console.log(`⚠️ Docker connection error: ${err.message}`);
      return null;
    });
    
    let dockerResult = {};
    if (dockerResponse && dockerResponse.ok) {
      dockerResult = await dockerResponse.json();
      console.log(`✅ Event ${event_type} forwarded to Docker:`, dockerResult);
    } else if (dockerResponse) {
      const errorText = await dockerResponse.text();
      console.log(`⚠️ Docker responded with status ${dockerResponse.status}: ${errorText}`);
    } else {
      console.log(`⚠️ Docker container not reachable, event logged only`);
    }
    
    // Update the scan status in the database
    if (event_type === 'start' || event_type === 'resume') {
      await pool.execute(
        `UPDATE scans SET status = 'running', started_at = COALESCE(started_at, NOW()), updated_at = NOW() WHERE id = ?`,
        [scan_id]
      );
      console.log(`📊 Database updated: scan ${scan_id} status = running`);
    } else if (event_type === 'pause') {
      await pool.execute(
        `UPDATE scans SET status = 'paused', updated_at = NOW() WHERE id = ?`,
        [scan_id]
      );
      console.log(`📊 Database updated: scan ${scan_id} status = paused`);
    } else if (event_type === 'delete') {
      await pool.execute(
        `UPDATE scans SET status = 'stopped', updated_at = NOW() WHERE id = ?`,
        [scan_id]
      );
      console.log(`📊 Database updated: scan ${scan_id} status = stopped (deleted event)`);
    }
    
    return NextResponse.json({ 
      success: true, 
      event_type,
      message: `Event '${event_type}' processed successfully`,
      docker_response: dockerResult
    });
    
  } catch (error) {
    console.error('❌ Error processing event:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
