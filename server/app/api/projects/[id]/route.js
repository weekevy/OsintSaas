import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

// GET single project
export async function GET(request, { params }) {
  try {
    console.log(`🔍 GET /api/projects/${params.id} - Fetching single project`);
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = params.id;

    // Get project
    const [projects] = await db.execute(
      `SELECT p.*, 
        u.first_name as owner_name,
        u.email as owner_email
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];

    // Check if user has access
    if (project.user_id !== decoded.id) {
      const [collab] = await db.execute(
        'SELECT * FROM project_collaborators WHERE project_id = ? AND user_id = ?',
        [projectId, decoded.id]
      );
      
      if (collab.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get collaborators
    const [collaborators] = await db.execute(
      `SELECT u.id, u.email, u.first_name, u.last_name, pc.role 
       FROM project_collaborators pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.project_id = ?`,
      [projectId]
    );

    return NextResponse.json({ 
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        progress: project.progress || 0,
        dueDate: project.due_date,
        icon: project.icon || '📁',
        color: project.color || 'purple',
        created_at: project.created_at,
        owner: {
          id: project.user_id,
          name: project.owner_name,
          email: project.owner_email
        },
        collaborators
      }
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT update project - FIXED with better error handling
export async function PUT(request, { params }) {
  try {
    console.log(`✏️ PUT /api/projects/${params.id} - Updating project`);
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = params.id;
    
    // Parse JSON with error handling
    let body;
    try {
      body = await request.json();
      console.log('📦 Update data received:', body);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      return NextResponse.json({ 
        error: 'Invalid JSON format',
        details: e.message 
      }, { status: 400 });
    }

    const { name, description, status, priority, dueDate, progress, icon, color } = body;

    // Check if project exists
    const [project] = await db.execute(
      'SELECT user_id FROM projects WHERE id = ?',
      [projectId]
    );

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check permissions
    let hasPermission = false;
    if (project[0].user_id === decoded.id) {
      hasPermission = true;
    } else {
      const [collab] = await db.execute(
        'SELECT role FROM project_collaborators WHERE project_id = ? AND user_id = ?',
        [projectId, decoded.id]
      );
      if (collab.length > 0 && (collab[0].role === 'editor' || collab[0].role === 'owner')) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (dueDate !== undefined) {
      // Handle date conversion if needed
      const dateValue = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;
      updates.push('due_date = ?');
      values.push(dateValue);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      values.push(progress);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }

    // Always update updated_at
    updates.push('updated_at = NOW()');

    if (updates.length === 1) { // Only updated_at was added
      return NextResponse.json({ 
        success: true, 
        message: 'No changes to update' 
      });
    }

    values.push(projectId);

    const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    console.log('📝 SQL Query:', query);
    console.log('📊 SQL Values:', values);

    // Execute update
    const [result] = await db.execute(query, values);
    console.log('✅ Update result:', result);

    // Log activity (optional - comment out if table doesn't exist)
    try {
      await db.execute(
        `INSERT INTO project_activities (project_id, user_id, action, description) 
         VALUES (?, ?, ?, ?)`,
        [projectId, decoded.id, 'updated', `Project "${name || 'details'}" was updated`]
      );
    } catch (activityError) {
      console.log('⚠️ Could not log activity (table may not exist):', activityError.message);
      // Continue even if activity logging fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Project updated successfully',
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('❌ ERROR in PUT handler:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MySQL errors
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return NextResponse.json({ 
        error: 'Database schema mismatch - missing column',
        details: error.message 
      }, { status: 500 });
    }
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json({ 
        error: 'Database table does not exist',
        details: error.message 
      }, { status: 500 });
    }
    
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
      return NextResponse.json({ 
        error: 'Database error',
        details: error.sqlMessage 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(request, { params }) {
  try {
    console.log(`🗑️ DELETE /api/projects/${params.id} - Deleting project`);
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = params.id;

    // Check if user is owner
    const [project] = await db.execute(
      'SELECT id, name FROM projects WHERE id = ? AND user_id = ?',
      [projectId, decoded.id]
    );

    if (project.length === 0) {
      // Check if they're a collaborator (for better error message)
      const [collab] = await db.execute(
        'SELECT * FROM project_collaborators WHERE project_id = ? AND user_id = ?',
        [projectId, decoded.id]
      );
      
      if (collab.length > 0) {
        return NextResponse.json({ 
          error: 'Only the project owner can delete projects' 
        }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // First delete collaborators (if table exists)
    try {
      await db.execute('DELETE FROM project_collaborators WHERE project_id = ?', [projectId]);
    } catch (e) {
      console.log('⚠️ Could not delete collaborators:', e.message);
    }

    // Delete activities (if table exists)
    try {
      await db.execute('DELETE FROM project_activities WHERE project_id = ?', [projectId]);
    } catch (e) {
      console.log('⚠️ Could not delete activities:', e.message);
    }

    // Delete project
    await db.execute('DELETE FROM projects WHERE id = ?', [projectId]);

    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Error deleting project:', error);
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}
