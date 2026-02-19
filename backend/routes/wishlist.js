const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Add place to wishlist
router.post('/wishlist/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { place_id } = req.body;

    if (!place_id) {
      return res.status(400).json({ error: 'place_id is required' });
    }

    // Check if place exists
    const place = await db.promisify.get(
      'SELECT id FROM places WHERE id = ? OR placeName = ?',
      [place_id, place_id]
    );

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const placeId = typeof place_id === 'number' ? place_id : place.id;

    // Check if already in wishlist
    const existing = await db.promisify.get(
      'SELECT id FROM wishlist WHERE userId = ? AND placeId = ?',
      [userId, placeId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Place already in wishlist' });
    }

    // Add to wishlist
    await db.promisify.run(
      'INSERT INTO wishlist (userId, placeId) VALUES (?, ?)',
      [userId, placeId]
    );

    res.json({ message: 'Place added to wishlist successfully' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlistItems = await db.promisify.all(
      `SELECT p.*, w.createdAt as addedAt 
       FROM wishlist w 
       JOIN places p ON w.placeId = p.id 
       WHERE w.userId = ? 
       ORDER BY w.createdAt DESC`,
      [userId]
    );

    const formattedItems = wishlistItems.map(item => ({
      PlaceName: item.placeName,
      City: item.city,
      State: item.state,
      Description: item.description,
      Category: item.category,
      Rating: item.rating,
      ReviewCount: item.reviewCount,
      ImageUrl: item.imageUrl,
      Distance: item.distance,
      OpeningHours: item.openingHours,
      EntryFee: item.entryFee,
      Latitude: item.latitude,
      Longitude: item.longitude,
      AddedAt: item.addedAt
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove place from wishlist
router.delete('/wishlist/:placeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const placeId = req.params.placeId;

    const result = await db.promisify.run(
      'DELETE FROM wishlist WHERE userId = ? AND placeId = ?',
      [userId, placeId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Place not found in wishlist' });
    }

    res.json({ message: 'Place removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if place is in wishlist
router.get('/wishlist/check/:placeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const placeId = req.params.placeId;

    const item = await db.promisify.get(
      'SELECT id FROM wishlist WHERE userId = ? AND placeId = ?',
      [userId, placeId]
    );

    res.json({ inWishlist: !!item });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

