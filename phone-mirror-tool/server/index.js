require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Session storage (in-memory for now, use database in production)
const sessions = new Map();
const deviceConnections = new Map();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Create a new mirroring session
app.post('/api/sessions/create', (req, res) => {
  try {
    const sessionId = uuidv4();
    const sessionToken = uuidv4();
    
    const session = {
      sessionId,
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'pending',
      deviceConnected: false,
      mirroring: false,
      viewers: [],
      recordingEnabled: false,
      recordedFrames: []
    };
    
    sessions.set(sessionId, session);
    
    const mirrorLink = `${process.env.MIRROR_URL || 'http://localhost:3000'}/mirror/${sessionId}`;
    
    res.json({
      success: true,
      sessionId,
      sessionToken,
      mirrorLink,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session status
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId,
    status: session.status,
    deviceConnected: session.deviceConnected,
    mirroring: session.mirroring,
    viewers: session.viewers.length,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt
  });
});

// List all active sessions
app.get('/api/sessions', (req, res) => {
  const activeSessions = Array.from(sessions.values()).map(session => ({
    sessionId: session.sessionId,
    status: session.status,
    deviceConnected: session.deviceConnected,
    mirroring: session.mirroring,
    viewers: session.viewers.length,
    createdAt: session.createdAt
  }));
  
  res.json({ sessions: activeSessions });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  
  // Device connects to mirror
  socket.on('device:connect', (data) => {
    const { sessionId, sessionToken, deviceInfo } = data;
    const session = sessions.get(sessionId);
    
    if (!session || session.sessionToken !== sessionToken) {
      socket.emit('error', { message: 'Invalid session or token' });
      return;
    }
    
    session.deviceConnected = true;
    session.status = 'active';
    session.deviceInfo = deviceInfo;
    deviceConnections.set(sessionId, socket.id);
    
    console.log(`Device connected to session ${sessionId}`);
    socket.join(sessionId);
    io.to(sessionId).emit('device:connected', deviceInfo);
  });
  
  // Viewer joins session
  socket.on('viewer:join', (data) => {
    const { sessionId } = data;
    const session = sessions.get(sessionId);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    session.viewers.push(socket.id);
    socket.join(sessionId);
    
    socket.emit('session:info', {
      sessionId,
      status: session.status,
      deviceConnected: session.deviceConnected,
      deviceInfo: session.deviceInfo
    });
    
    io.to(sessionId).emit('viewer:joined', { viewerCount: session.viewers.length });
  });
  
  // Start mirroring
  socket.on('mirror:start', (data) => {
    const { sessionId } = data;
    const session = sessions.get(sessionId);
    
    if (session) {
      session.mirroring = true;
      io.to(sessionId).emit('mirror:started');
      console.log(`Mirroring started for session ${sessionId}`);
    }
  });
  
  // Screen frame update
  socket.on('screen:frame', (data) => {
    const { sessionId, frameData, timestamp } = data;
    const session = sessions.get(sessionId);
    
    if (session) {
      if (session.recordingEnabled) {
        session.recordedFrames.push({ frameData, timestamp });
      }
      io.to(sessionId).emit('screen:update', { frameData, timestamp });
    }
  });
  
  // Remote input command
  socket.on('input:command', (data) => {
    const { sessionId, command } = data;
    const deviceSocket = deviceConnections.get(sessionId);
    
    if (deviceSocket) {
      io.to(deviceSocket).emit('input:execute', command);
    }
  });
  
  // Stop mirroring
  socket.on('mirror:stop', (data) => {
    const { sessionId } = data;
    const session = sessions.get(sessionId);
    
    if (session) {
      session.mirroring = false;
      io.to(sessionId).emit('mirror:stopped');
      console.log(`Mirroring stopped for session ${sessionId}`);
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up session if device disconnects
    for (let [sessionId, socketId] of deviceConnections.entries()) {
      if (socketId === socket.id) {
        const session = sessions.get(sessionId);
        if (session) {
          session.deviceConnected = false;
          session.mirroring = false;
          session.status = 'inactive';
          io.to(sessionId).emit('device:disconnected');
        }
        deviceConnections.delete(sessionId);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Phone Mirror Server running on port ${PORT}`);
});
