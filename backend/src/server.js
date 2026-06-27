require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);

/**
 * Socket.io setup for real-time communication
 * Enables live updates across the dashboard when tasks are modified.
 */
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make socket.io instance accessible in all route controllers
app.set('io', io);

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * Socket.io Connection & Room Handling
 * Users join:
 * 1. A private room based on their ID: `user-<id>`
 * 2. A role-based room: `role-<manager|user>`
 */
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ userId, role }) => {
    if (userId) {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    }
    if (role) {
      socket.join(`role-${role}`);
      console.log(`User joined role room: role-${role}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

/**
 * Database connection and Server initialization
 */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = { app, io };
