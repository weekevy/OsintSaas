const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

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

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Internal endpoint for Python workers to push updates
app.post('/notify', (req, res) => {
  const { type, userId, projectId, data } = req.body;
  
  // Security check: only allow requests from internal network or with a shared secret
  // For now, we trust the internal network (Docker)
  
  if (userId) {
    io.to(`user_${userId}`).emit(type, data);
  }
  
  if (projectId) {
    io.to(`project_${projectId}`).emit(type, data);
  }

  // Also broadcast to a general room if needed
  // io.emit(type, data);

  res.status(200).json({ success: true });
});

const PORT = process.env.WS_PORT || 4005;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
