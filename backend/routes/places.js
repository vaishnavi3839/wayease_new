const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all places with optional filters
router.get('/places', async (req, res) => {
  try {
    let sql = 'SELECT * FROM places WHERE 1=1';
    const params = [];

    // Filter by city
    if (req.query.city) {
      sql += ' AND LOWER(city) = LOWER(?)';
      params.push(req.query.city);
    }

    // Filter by category
    if (req.query.category) {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(req.query.category);
    }

    // Search by place name or description
    if (req.query.search) {
      sql += ' AND (LOWER(placeName) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filter by distance (if provided)
    if (req.query.maxDistance) {
      sql += ' AND distance <= ?';
      params.push(parseFloat(req.query.maxDistance));
    }

    // Order by rating (highest first) by default
    sql += ' ORDER BY rating DESC, reviewCount DESC';

    // Limit results (optional pagination)
    if (req.query.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(req.query.limit));
    }

    const places = await db.promisify.all(sql, params);

    // Format response to match frontend expectations
    const formattedPlaces = places.map(place => ({
      PlaceName: place.placeName,
      City: place.city,
      State: place.state,
      Description: place.description,
      Category: place.category,
      Rating: place.rating,
      ReviewCount: place.reviewCount,
      ImageUrl: place.imageUrl,
      Distance: place.distance,
      OpeningHours: place.openingHours,
      EntryFee: place.entryFee,
      Latitude: place.latitude,
      Longitude: place.longitude
    }));

    res.json(formattedPlaces);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get place by ID
router.get('/places/:id', async (req, res) => {
  try {
    const place = await db.promisify.get(
      'SELECT * FROM places WHERE id = ?',
      [req.params.id]
    );

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json({
      PlaceName: place.placeName,
      City: place.city,
      State: place.state,
      Description: place.description,
      Category: place.category,
      Rating: place.rating,
      ReviewCount: place.reviewCount,
      ImageUrl: place.imageUrl,
      Distance: place.distance,
      OpeningHours: place.openingHours,
      EntryFee: place.entryFee,
      Latitude: place.latitude,
      Longitude: place.longitude
    });
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get places by city
router.get('/places/city/:city', async (req, res) => {
  try {
    const places = await db.promisify.all(
      'SELECT * FROM places WHERE LOWER(city) = LOWER(?) ORDER BY rating DESC',
      [req.params.city]
    );

    const formattedPlaces = places.map(place => ({
      PlaceName: place.placeName,
      City: place.city,
      State: place.state,
      Description: place.description,
      Category: place.category,
      Rating: place.rating,
      ReviewCount: place.reviewCount,
      ImageUrl: place.imageUrl,
      Distance: place.distance,
      OpeningHours: place.openingHours,
      EntryFee: place.entryFee,
      Latitude: place.latitude,
      Longitude: place.longitude
    }));

    res.json(formattedPlaces);
  } catch (error) {
    console.error('Error fetching places by city:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

