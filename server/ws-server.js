const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ── Manual Env Loading for standalone script ──
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, ...vals] = line.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
    console.log('Loaded environment variables from .env');
  }
} catch (e) {
  console.log('No .env file found or failed to load');
}

const app = express();
app.use(cors({
  origin: true, // Allow all origins during troubleshooting
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins during troubleshooting
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Database connection pool for Socket server
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword123',
  database: process.env.DB_NAME || 'osint_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auth middleware for Socket.io
io.use((socket, next) => {
  console.log('New socket connection attempt...');
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      console.log('WS Auth: No token found in cookies');
      return next(new Error('Authentication error: No token provided'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('WS Auth: JWT verify failed', err.message);
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.user = decoded;
      console.log('WS Auth: Success for', decoded.email);
      next();
    });
  } catch (error) {
    console.log('WS Auth: Catch block error', error.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.email} (${socket.id})`);

  // Join a room for personal notifications
  socket.join(`user_${socket.user.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User ${socket.user.id} joined project ${projectId}`);
  });

  socket.on('join_team', (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`User ${socket.user.id} joined team ${teamId}`);
  });

  // Strategic Update: Fetch individual completed scans for Dossier Builder
  socket.on('request_completed_scans', async () => {
    console.log(`Completed scans request from user ${socket.user.id}`);
    try {
      const [scans] = await pool.execute(`
        SELECT 
          s.id, 
          s.scan_type, 
          s.status, 
          s.created_at,
          t.value as target_value,
          t.label as target_label,
          j.company_name,
          j.job_title,
          l.profile_name as linkedin_profile,
          sm.display_name as social_display
        FROM scans s
        JOIN targets t ON s.target_id = t.id
        JOIN projects p ON t.project_id = p.id
        LEFT JOIN job_recruitment_scans j ON s.id = j.scan_id
        LEFT JOIN linkedin_scans l ON s.id = l.scan_id
        LEFT JOIN social_media_scans sm ON s.id = sm.scan_id
        WHERE p.user_id = ? AND s.status = 'completed'
        ORDER BY s.created_at DESC
      `, [socket.user.id]);

      // Format titles for the UI
      const formattedScans = scans.map(scan => {
        let title = scan.scan_type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        let subtitle = '';
        
        if (scan.scan_type === 'job-recruitment') {
          subtitle = scan.job_title ? `${scan.job_title} at ${scan.company_name}` : scan.company_name;
        } else if (scan.scan_type === 'linkedin') {
          subtitle = scan.linkedin_profile || 'LinkedIn Profile';
        } else if (scan.scan_type === 'social-media') {
          subtitle = scan.social_display || 'Social Profile';
        } else {
          subtitle = scan.target_label || scan.target_value;
        }

        return {
          id: String(scan.id),
          name: String(title),
          description: String(subtitle || 'No target data available'),
          status: 'completed',
          created_at: scan.created_at
        };
      });

      socket.emit('completed_scans_list', { success: true, scans: formattedScans });
    } catch (err) {
      console.error('Socket completed scans fetch error:', err);
      socket.emit('completed_scans_list', { success: false, error: 'Failed to fetch completed scans' });
    }
  });

  // Strategic Update: Socket-based data fetching for "Terminal" feel
  socket.on('request_scans', async (data) => {
    const { projectId } = data || {};
    console.log(`Scanning request received for project ${projectId || 'all'} from user ${socket.user.id}`);
    
    try {
      let sql = `
        SELECT 
          s.id as scan_id,
          s.scan_type,
          s.status,
          s.progress,
          s.findings_count,
          s.created_at,
          t.value as target_value,
          t.label as target_label,
          j.company_name,
          j.job_title,
          j.recruiter_name,
          l.profile_name as linkedin_profile,
          sm.display_name as social_display
        FROM scans s
        JOIN targets t ON s.target_id = t.id
        JOIN projects p ON t.project_id = p.id
        LEFT JOIN job_recruitment_scans j ON s.id = j.scan_id
        LEFT JOIN linkedin_scans l ON s.id = l.scan_id
        LEFT JOIN social_media_scans sm ON s.id = sm.scan_id
        WHERE p.user_id = ?
      `;
      const params = [socket.user.id];
      if (projectId) {
        sql += ' AND p.id = ?';
        params.push(projectId);
      }
      sql += ' ORDER BY s.created_at DESC';

      const [scans] = await pool.execute(sql, params);

      const formattedScans = scans.map(scan => {
        let targetDisplay = 'SCAN';
        if (scan.scan_type === 'job-recruitment') {
          if (scan.company_name && scan.job_title) targetDisplay = `${scan.job_title} at ${scan.company_name}`;
          else if (scan.company_name) targetDisplay = scan.company_name;
          else if (scan.recruiter_name) targetDisplay = `Recruiter: ${scan.recruiter_name}`;
          else targetDisplay = scan.target_label || scan.target_value || 'JOB SCAN';
        } else if (scan.scan_type === 'linkedin') {
          targetDisplay = scan.linkedin_profile || 'LINKEDIN PROFILE';
        } else if (scan.scan_type === 'social-media') {
          targetDisplay = scan.social_display || 'SOCIAL PROFILE';
        } else {
          targetDisplay = scan.target_label || scan.target_value || 'SCAN';
        }

        return {
          id: `${scan.scan_type}_${scan.scan_id}`,
          originalId: scan.scan_id,
          moduleId: scan.scan_type,
          moduleName: scan.scan_type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          target: targetDisplay,
          status: scan.status,
          progress: scan.progress || 0,
          findings: scan.findings_count || 0,
          createdAt: scan.created_at
        };
      });

      socket.emit('scans_list', { success: true, scans: formattedScans });
    } catch (err) {
      console.error('Socket scans fetch error:', err);
      socket.emit('scans_list', { success: false, error: 'Failed to fetch scans via socket' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Internal endpoint for Python workers to push updates
app.post('/notify', (req, res) => {
  const { type, userId, projectId, data } = req.body;
  
  // Strategic Update: Multi-room targeting with built-in duplicate prevention.
  // Socket.io ensures each socket receives the event only once even if it's in both rooms.
  const rooms = [];
  if (userId) rooms.push(`user_${userId}`);
  if (projectId) rooms.push(`project_${projectId}`);

  if (rooms.length > 0) {
    io.to(rooms).emit(type, data);
    console.log(`WS: Emitted ${type} to ${rooms.join(', ')}`);
  }

  res.status(200).json({ success: true });
});

const PORT = process.env.WS_PORT || 4005;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
