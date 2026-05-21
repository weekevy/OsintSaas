import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const [projects] = await db.execute(
      `SELECT id, user_id, name, description, icon, priority, status, progress, start_date, end_date, created_at 
       FROM projects 
       WHERE user_id = ? OR team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
       ORDER BY created_at DESC`,
      [decoded.id, decoded.id]
    );

    const response = NextResponse.json({
      success: true,
      projects: projects
    });

    // Add CORS headers for Vite dev server
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;

  } catch (error) {
    console.error('Fetch projects error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
}

export async function POST(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const body = await request.json();
    const { name, description, priority, icon } = body;

    if (!name) {
      const response = NextResponse.json({ error: 'Project name is required' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const [result] = await db.execute(
      'INSERT INTO projects (user_id, name, description, priority, icon, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [decoded.id, name, description || '', priority || 'medium', icon || 'folder']
    );

    const response = NextResponse.json({
      success: true,
      project: {
        id: result.insertId,
        name,
        description,
        priority,
        icon
      }
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;

  } catch (error) {
    console.error('Create project error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || 'http://localhost:5173';
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
