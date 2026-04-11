const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const { authenticateToken } = require('./auth');

const PLACES_DATA = {
  'goa':       { name: 'Goa',       city: 'Goa',       description: 'Beach Paradise',     image: 'goa (1).jpg',              rating: 4.8 },
  'bangalore': { name: 'Bangalore', city: 'Bangalore', description: 'Garden City',        image: 'bangalore (1).jpg',        rating: 4.6 },
  'delhi':     { name: 'Delhi',     city: 'Delhi',     description: 'Historical Capital', image: 'newdelhi-Photoroom.png',   rating: 4.7 },
  'mumbai':    { name: 'Mumbai',    city: 'Mumbai',    description: 'City of Dreams',     image: 'mumbai (1).jpg',           rating: 4.9 },
  'hyderabad': { name: 'Hyderabad', city: 'Hyderabad', description: 'City of Pearls',    image: 'hyderabad (1).jpg',        rating: 4.5 },
};

// POST /api/wishlist/add
router.post('/add', authenticateToken, (req, res) => {
  try {
    const { place_id, place_name, city, description, image, rating } = req.body;
    if (!place_id) return res.status(400).json({ error: 'place_id is required.' });

    const userId = req.user.id;
    const existing = db.get('wishlists').find({ userId, place_id: String(place_id) }).value();
    if (existing) return res.status(409).json({ error: 'Place already in your wishlist!' });

    const known = PLACES_DATA[String(place_id).toLowerCase()];
    const item = {
      id: uuidv4(), userId, place_id: String(place_id),
      place_name: place_name || known?.name || place_id,
      city: city || known?.city || '',
      description: description || known?.description || '',
      image: image || known?.image || '',
      rating: rating || known?.rating || null,
      addedAt: new Date().toISOString()
    };
    db.get('wishlists').push(item).write();
    res.status(201).json({ message: `✅ ${item.place_name} added to your wishlist!`, item });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/wishlist
router.get('/', authenticateToken, (req, res) => {
  const wishlist = db.get('wishlists').filter({ userId: req.user.id }).orderBy('addedAt', 'desc').value();
  res.json({ wishlist, count: wishlist.length });
});

// DELETE /api/wishlist/remove/:place_id
router.delete('/remove/:place_id', authenticateToken, (req, res) => {
  const { place_id } = req.params;
  const item = db.get('wishlists').find({ userId: req.user.id, place_id }).value();
  if (!item) return res.status(404).json({ error: 'Item not in your wishlist.' });
  db.get('wishlists').remove({ userId: req.user.id, place_id }).write();
  res.json({ message: '✅ Removed from wishlist.' });
});

// GET /api/wishlist/check/:place_id
router.get('/check/:place_id', authenticateToken, (req, res) => {
  const item = db.get('wishlists').find({ userId: req.user.id, place_id: req.params.place_id }).value();
  res.json({ inWishlist: !!item });
});

module.exports = router;
