const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const db = require('./database');
const allPlaces = require('./mockData');
const { authenticateToken } = require('./auth');

router.post('/', authenticateToken, (req, res) => {
  const { placeId, date, partySize, note } = req.body;
  if (!placeId || !date) return res.status(400).json({ error: 'placeId and date are required.' });
  const place = allPlaces.find((p) => p.id === placeId);
  if (!place) return res.status(404).json({ error: 'Place not found.' });

  const row = {
    id: uuidv4(),
    userId: req.user.id,
    placeId,
    placeName: place.name,
    city: place.city,
    date: String(date).slice(0, 32),
    partySize: Math.min(20, Math.max(1, parseInt(partySize, 10) || 2)),
    note: note ? String(note).slice(0, 500) : '',
    status: 'requested',
    createdAt: new Date().toISOString()
  };
  db.get('reservations').push(row).write();
  res.status(201).json({
    message:
      'Request received. In a full app this would sync with the venue; for now we saved your request.',
    reservation: row
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const list = (db.get('reservations').filter({ userId: req.user.id }).value() || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ reservations: list });
});

module.exports = router;
