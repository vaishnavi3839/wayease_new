const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const wishlistRoutes = require('./routes/wishlist');

// Mount API routes under /api to avoid collisions with frontend static files
app.use('/api', authRoutes);
app.use('/api', placesRoutes);
app.use('/api', wishlistRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'wayease-frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WayEase API is running' });
});

// Fallback: serve index.html for non-API GET requests (useful when visiting from browser)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'wayease-frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for API routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Route not found' });
  res.status(404).send('Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WayEase Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

