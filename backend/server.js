require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ================= SEED DATA =================
try {
  require('./seedData').run();
} catch (e) {
  console.warn('Seed skipped:', e.message);
}

// ================= FILE SETUP =================
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(path.join(uploadsDir, 'reviews'), { recursive: true });

// ================= MIDDLEWARE =================
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/uploads', express.static(uploadsDir));

// ================= FRONTEND =================
app.use(express.static(path.join(__dirname, '../wayease-frontend')));

// ================= ROUTES =================
const authModule = require('./auth');

app.use('/api', authModule.router);
app.use('/api/wishlist', require('./wishlist'));
app.use('/api/itinerary', require('./itinerary'));
app.use('/api/download', require('./download'));
app.use('/api/notifications', require('./notifications'));
app.use('/api/reservations', require('./reservations'));
app.use('/api/places', require('./places'));

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WayEase server is running',
    timestamp: new Date()
  });
});

// ================= FALLBACK =================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../wayease-frontend', 'index.html'));
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 WayEase running at http://localhost:${PORT}`);
});