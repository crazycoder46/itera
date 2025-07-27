const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:19006', 'http://localhost:8081'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Itera API Server is running!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Notes routes  
app.use('/api/notes', require('./routes/notes'));

// Shared routes
app.use('/api/shared', require('./routes/shared'));

// Setup routes (for database initialization)
app.use('/api/setup', require('./routes/setup'));

// Analytics routes
app.use('/api/analytics', require('./routes/analytics'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      pool.end();
    });
  });
}

module.exports = app; 