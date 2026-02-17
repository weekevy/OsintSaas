import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

// GET all projects for the user
export async function GET(request) {
  try {
    console.log('📋 GET /api/projects - Fetching all projects');
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ User authenticated:', decoded.id);

    // Get projects where user is owner OR collaborator
    const [projects] = await db.execute(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM project_collaborators WHERE project_id = p.id) as members_count,
        u.first_name as owner_name
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ? OR p.id IN (SELECT project_id FROM project_collaborators WHERE user_id = ?)
       ORDER BY p.created_at DESC`,
      [decoded.id, decoded.id]
    );

    console.log(`✅ Found ${projects.length} projects`);

    // Format projects for frontend
    const projectsWithDetails = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      threatLevel: project.priority,
      progress: project.progress || 0,
      members: project.members_count || 1,
      dueDate: project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No due date',
      icon: project.icon || '📁',
      color: project.color || 'purple',
      created_at: project.created_at
    }));

    return NextResponse.json({ projects: projectsWithDetails });

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// POST create new project
export async function POST(request) {
  try {
    console.log('➕ POST /api/projects - Creating new project');
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ User authenticated:', decoded.id);

    const body = await request.json();
    console.log('📦 Request body:', body);

    const { name, description, status, priority, dueDate, icon, color } = body;

    // Validate input
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    console.log('📝 Inserting project into database...');

    // Insert project
    const [result] = await db.execute(
      `INSERT INTO projects 
       (user_id, name, description, status, priority, due_date, icon, color, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        decoded.id, 
        name, 
        description || null, 
        status || 'active', 
        priority || 'medium', 
        dueDate || null,
        icon || '📁',
        color || 'purple'
      ]
    );

    console.log('✅ Project created with ID:', result.insertId);

    // Add activity log
    await db.execute(
      'INSERT INTO project_activities (project_id, user_id, action, description) VALUES (?, ?, ?, ?)',
      [result.insertId, decoded.id, 'created', `Project "${name}" was created`]
    );

    // Add owner as collaborator
    await db.execute(
      'INSERT INTO project_collaborators (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, decoded.id, 'owner']
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully',
      projectId: result.insertId 
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}
