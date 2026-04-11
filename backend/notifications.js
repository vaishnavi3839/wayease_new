const express = require('express');
const router = express.Router();
const allPlaces = require('./mockData');

/** Picks + static notices for home “activity” strip */
router.get('/', (req, res) => {
  const withOffer = allPlaces.filter((p) => p.offerLabel).slice(0, 6);
  const topRated = [...allPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);

  const items = [
    {
      id: 'n-sys-1',
      type: 'tip',
      title: 'Tip',
      body: 'Enable location on city pages for accurate distance filters.',
      at: new Date().toISOString()
    },
    {
      id: 'n-sys-2',
      type: 'feature',
      title: 'Diary',
      body: 'Log places like Letterboxd — rate, write, and add photos after you visit.',
      at: new Date().toISOString()
    }
  ];

  withOffer.forEach((p, i) => {
    items.push({
      id: `offer-${p.id}`,
      type: 'offer',
      title: p.offerLabel,
      body: `${p.name} · ${p.city}`,
      placeId: p.id,
      at: new Date(Date.now() - i * 3600000).toISOString()
    });
  });

  topRated.slice(0, 2).forEach((p, i) => {
    items.push({
      id: `trend-${p.id}`,
      type: 'trending',
      title: 'Trending high',
      body: `${p.name} is rated ${p.rating}★ in ${p.city}`,
      placeId: p.id,
      at: new Date(Date.now() - (i + 8) * 3600000).toISOString()
    });
  });

  items.sort((a, b) => new Date(b.at) - new Date(a.at));
  res.json({ notifications: items });
});

module.exports = router;
