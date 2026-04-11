const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('./database'); // Assuming database is available
const { authenticateToken } = require('./auth'); // Adjusted path based on what we've seen
const allPlaces = require('./mockData');

// POST /api/itinerary/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { city, days = 2, startDate, preferences = [], timeFrom = '8:00 AM', timeTo = '9:00 PM', preferredTime = 'Morning' } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required.' });

    // Free Static Generator Logic
    let cityPlaces = allPlaces.filter(p => p.city.toLowerCase() === city.toLowerCase());
    
    // Fallback if city not in mock data
    if (cityPlaces.length === 0) {
      cityPlaces = [
        { name: `${city} Central Plaza`, category: 'shopping', rating: 4.5, timeNeeded: 2 },
        { name: `${city} Historical Museum`, category: 'history', rating: 4.6, timeNeeded: 3 },
        { name: `${city} Grand Park`, category: 'nature', rating: 4.8, timeNeeded: 2 },
        { name: `${city} Local Bistro`, category: 'food', rating: 4.7, timeNeeded: 1.5 }
      ];
    }
    
    // Sort places by rating to get the best ones
    cityPlaces.sort((a, b) => b.rating - a.rating);

    const generatedItinerary = [];
    let placeIndex = 0;
    
    for (let day = 1; day <= days; day++) {
      let activities = [];
      let startHour = parseInt(timeFrom.split(':')[0]) || 8;
      if (timeFrom.includes('PM') && startHour !== 12) startHour += 12;

      let currentHour = startHour;
      
      // Select 3 to 4 activities per day based on time available
      const numActivities = Math.min(4, Math.max(2, cityPlaces.length - placeIndex));
      for (let j = 0; j < numActivities; j++) {
        if (placeIndex >= cityPlaces.length) placeIndex = 0; // loop if needed
        const place = cityPlaces[placeIndex++];
        
        let endTime = currentHour + Math.ceil(place.timeNeeded || 2);
        let timeString = `${currentHour > 12 ? currentHour - 12 : currentHour}:00 ${currentHour >= 12 ? 'PM' : 'AM'} - ${endTime > 12 ? endTime - 12 : endTime}:00 ${endTime >= 12 ? 'PM' : 'AM'}`;
        
        activities.push({
          time: timeString,
          place: place.name,
          activity: `Explore ${place.name} and enjoy the ${place.category || 'surroundings'}.`,
          description: `A highly rated location (${place.rating} stars) perfect for your trip.`,
          category: place.category || 'sightseeing',
          tips: "Wear comfortable shoes and carry water."
        });
        
        currentHour = endTime + 1; // 1 hour for travel/lunch
      }

      generatedItinerary.push({
        day: day,
        date: `Day ${day}`,
        theme: `Discovering ${city}`,
        activities: activities
      });
    }

    const itineraryData = {
      city: city,
      days: days,
      title: `The Ultimate ${days}-Day ${city} Adventure`,
      summary: `A carefully curated ${days}-day journey through ${city} tailored to your preferences.`,
      itinerary: generatedItinerary,
      tips: ["Stay hydrated", "Book tickets in advance", "Use local transport for convenience"],
      bestTime: "October to March",
      estimatedBudget: "₹" + (days * 1500 + 2000) + " per person"
    };

    const saved = { id: uuidv4(), userId: req.user.id, ...itineraryData, preferences, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.get('itineraries').push(saved).write();
    res.status(201).json({ message: '✅ Itinerary generated!', itinerary: saved });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Failed to generate itinerary. Please try again.' });
  }
});

// GET /api/itinerary
router.get('/', authenticateToken, (req, res) => {
  const itineraries = db.get('itineraries').filter({ userId: req.user.id }).orderBy('createdAt', 'desc')
    .map(i => ({ id: i.id, city: i.city, days: i.days, title: i.title, summary: i.summary, preferences: i.preferences, createdAt: i.createdAt, updatedAt: i.updatedAt })).value();
  res.json({ itineraries, count: itineraries.length });
});

// GET /api/itinerary/:id
router.get('/:id', authenticateToken, (req, res) => {
  const item = db.get('itineraries').find({ id: req.params.id, userId: req.user.id }).value();
  if (!item) return res.status(404).json({ error: 'Itinerary not found.' });
  res.json({ itinerary: item });
});

// PUT /api/itinerary/:id
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const existing = db.get('itineraries').find({ id, userId: req.user.id }).value();
  if (!existing) return res.status(404).json({ error: 'Itinerary not found.' });

  const allowed = ['title', 'summary', 'itinerary', 'tips', 'bestTime', 'estimatedBudget'];
  const updates = { updatedAt: new Date().toISOString() };
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  db.get('itineraries').find({ id, userId: req.user.id }).assign(updates).write();
  res.json({ message: '✅ Itinerary updated!', itinerary: db.get('itineraries').find({ id }).value() });
});

// DELETE /api/itinerary/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const existing = db.get('itineraries').find({ id, userId: req.user.id }).value();
  if (!existing) return res.status(404).json({ error: 'Itinerary not found.' });
  db.get('itineraries').remove({ id, userId: req.user.id }).write();
  res.json({ message: '✅ Itinerary deleted.' });
});

module.exports = router;
