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
    
    // In a real scenario, this might point to a different Docker container
    const DOCKER_URL = process.env.LINKEDIN_INVESTIGATION_DOCKER_URL || 'http://localhost:8001';
    
    // Forward the event to Docker container
    const dockerResponse = await fetch(`${DOCKER_URL}/event/${event_type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.DOCKER_API_KEY || 'your-super-secret-api-key-change-this'
      },
      body: JSON.stringify({
        scan_id,
        scan_name,
        target,
        previous_state,
        data,
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
    }
    
    // Update the scan status in the database
    if (event_type === 'start') {
      await pool.execute(
        `UPDATE scans SET status = 'running', started_at = NOW() WHERE id = ?`,
        [scan_id]
      );
    } else if (event_type === 'pause') {
      await pool.execute(
        `UPDATE scans SET status = 'paused' WHERE id = ?`,
        [scan_id]
      );
    } else if (event_type === 'resume') {
      await pool.execute(
        `UPDATE scans SET status = 'running' WHERE id = ?`,
        [scan_id]
      );
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
