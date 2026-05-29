import { NextResponse } from 'next/server';
import db from '@/database/config';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:5173';
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    let dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
    if (timeRange === '24h') dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 DAY)';
    else if (timeRange === '30d') dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
    else if (timeRange === '90d') dateFilter = 'DATE_SUB(NOW(), INTERVAL 90 DAY)';

    // 1. Overview Stats
    const [scanStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_scans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_scans
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ? AND s.created_at >= ${dateFilter}
    `, [decoded.id]);

    const [threatStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_threats,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_threats,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_threats,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_threats
      FROM findings f
      JOIN scans s ON f.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ? AND f.created_at >= ${dateFilter}
    `, [decoded.id]);

    // Calculate Active Users (for this specific user, maybe team members)
    const [userStats] = await db.execute(`
      SELECT COUNT(*) as active_members FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE t.owner_id = ?
    `, [decoded.id]);

    // 2. Threat Trends (grouped by day)
    const [trends] = await db.execute(`
      SELECT 
        DATE_FORMAT(f.created_at, '%Y-%m-%d') as date,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM findings f
      JOIN scans s ON f.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ? AND f.created_at >= ${dateFilter}
      GROUP BY date
      ORDER BY date ASC
    `, [decoded.id]);

    // 3. Threat Type Breakdown (mapping from title/type)
    const [types] = await db.execute(`
      SELECT 
        title as name,
        COUNT(*) as count,
        severity
      FROM findings f
      JOIN scans s ON f.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ? AND f.created_at >= ${dateFilter}
      GROUP BY title, severity
      ORDER BY count DESC
      LIMIT 6
    `, [decoded.id]);

    // 4. Top IOCs
    const [iocs] = await db.execute(`
      SELECT 
        t.value as ioc,
        t.type,
        MAX(f.severity) as level,
        MIN(f.created_at) as first_seen,
        MAX(f.created_at) as last_seen,
        COUNT(f.id) as count
      FROM findings f
      JOIN scans s ON f.scan_id = s.id
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ? AND f.created_at >= ${dateFilter}
      GROUP BY t.value, t.type
      ORDER BY count DESC
      LIMIT 10
    `, [decoded.id]);

    // 5. Top Investigators (if in a team, else just self)
    const [investigators] = await db.execute(`
      SELECT 
        u.username as name,
        COUNT(DISTINCT s.id) as scans,
        COUNT(DISTINCT f.id) as threats
      FROM users u
      LEFT JOIN projects p ON u.id = p.user_id
      LEFT JOIN targets t ON p.id = t.project_id
      LEFT JOIN scans s ON t.id = s.target_id
      LEFT JOIN findings f ON s.id = f.scan_id
      WHERE u.id = ? OR u.id IN (
        SELECT user_id FROM team_members WHERE team_id IN (
          SELECT id FROM teams WHERE owner_id = ?
        )
      )
      GROUP BY u.id
      ORDER BY scans DESC
      LIMIT 5
    `, [decoded.id, decoded.id]);

    // 6. Activity Heatmap (hourly for last 24h or daily)
    const [heatmap] = await db.execute(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as count
      FROM scans s
      JOIN targets t ON s.target_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.user_id = ? AND s.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY hour
      ORDER BY hour ASC
    `, [decoded.id]);

    const response = NextResponse.json({
      success: true,
      stats: {
        totalScans: scanStats[0]?.total_scans || 0,
        threatsDetected: threatStats[0]?.total_threats || 0,
        criticalThreats: threatStats[0]?.critical_threats || 0,
        highThreats: threatStats[0]?.high_threats || 0,
        mediumThreats: threatStats[0]?.medium_threats || 0,
        activeUsers: (userStats[0]?.active_members || 0) + 1, // Include self
        avgResponseTime: '245ms' // Simulated for now
      },
      trends: trends,
      threatTypes: types.map(t => ({
        name: t.name,
        count: t.count,
        severity: t.severity,
        change: '+0%' // Placeholder
      })),
      topIOCs: iocs,
      topInvestigators: investigators,
      heatmap: heatmap
    });

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
