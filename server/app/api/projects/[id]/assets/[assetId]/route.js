import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(request, { params }) {
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
    const assetId = params.assetId;

    // Check if user has access to this project
    const [project] = await db.execute(
      'SELECT id FROM projects WHERE id = ? AND (user_id = ? OR id IN (SELECT project_id FROM project_collaborators WHERE user_id = ?))',
      [projectId, decoded.id, decoded.id]
    );

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Get asset details to check if it's a file
    const [assets] = await db.execute(
      'SELECT file_path FROM project_assets WHERE id = ? AND project_id = ?',
      [assetId, projectId]
    );

    if (assets.length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const asset = assets[0];

    // If it's a file, delete it from disk
    if (asset.file_path) {
      try {
        const filePath = path.join(process.cwd(), 'public', asset.file_path);
        await unlink(filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Delete from database
    await db.execute(
      'DELETE FROM project_assets WHERE id = ? AND project_id = ?',
      [assetId, projectId]
    );

    // Update project's asset_count
    await db.execute(
      'UPDATE projects SET asset_count = asset_count - 1 WHERE id = ?',
      [projectId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Asset deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
