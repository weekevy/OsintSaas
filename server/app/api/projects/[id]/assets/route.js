import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET all assets for a project
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = params.id;

    // Check if user has access to this project
    const [project] = await db.execute(
      'SELECT id FROM projects WHERE id = ? AND (user_id = ? OR id IN (SELECT project_id FROM project_collaborators WHERE user_id = ?))',
      [projectId, decoded.id, decoded.id]
    );

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Fetch assets
    const [assets] = await db.execute(
      `SELECT * FROM project_assets 
       WHERE project_id = ? 
       ORDER BY created_at DESC`,
      [projectId]
    );

    return NextResponse.json({ assets });

  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new asset (URL type)
export async function POST(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = params.id;
    const { type, title, url, description } = await request.json();

    // Validate input
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'Asset type is required' }, { status: 400 });
    }

    // Check project access
    const [project] = await db.execute(
      'SELECT id FROM projects WHERE id = ? AND (user_id = ? OR id IN (SELECT project_id FROM project_collaborators WHERE user_id = ?))',
      [projectId, decoded.id, decoded.id]
    );

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Insert asset
    const [result] = await db.execute(
      `INSERT INTO project_assets 
       (project_id, asset_type, title, url, description, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, type, title, url, description || null, decoded.id]
    );

    // Update project's asset_count
    await db.execute(
      'UPDATE projects SET asset_count = asset_count + 1 WHERE id = ?',
      [projectId]
    );

    return NextResponse.json({ 
      success: true, 
      assetId: result.insertId,
      message: 'Asset added successfully'
    });

  } catch (error) {
    console.error('Error adding asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST file upload
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const projectId = params.id;
    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const type = formData.get('type');
    const description = formData.get('description');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check project access
    const [project] = await db.execute(
      'SELECT id FROM projects WHERE id = ? AND (user_id = ? OR id IN (SELECT project_id FROM project_collaborators WHERE user_id = ?))',
      [projectId, decoded.id, decoded.id]
    );

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'projects', String(projectId));
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const publicPath = `/uploads/projects/${projectId}/${fileName}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Determine mime type
    const mimeType = file.type;

    // Insert asset record
    const [result] = await db.execute(
      `INSERT INTO project_assets 
       (project_id, asset_type, title, file_path, file_name, file_size, mime_type, description, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, type, title, publicPath, file.name, file.size, mimeType, description || null, decoded.id]
    );

    // Update project's asset_count
    await db.execute(
      'UPDATE projects SET asset_count = asset_count + 1 WHERE id = ?',
      [projectId]
    );

    return NextResponse.json({ 
      success: true, 
      assetId: result.insertId,
      filePath: publicPath,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
