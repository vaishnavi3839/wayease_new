const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const allPlaces = require('./mockData');
const { authenticateToken } = require('./auth');

const REVIEW_UPLOADS = path.join(__dirname, 'uploads', 'reviews');

function withImage(place) {
  const seed = String(place.id).replace(/[^a-zA-Z0-9]/g, '') || 'place';
  return {
    ...place,
    image: place.image || `https://picsum.photos/seed/${seed}/400/400`
  };
}

db.defaults({ users: [], wishlists: [], itineraries: [], reviews: [] }).write();

const CITY_CENTERS = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  goa: { lat: 15.4989, lng: 73.8278 },
  hyderabad: { lat: 17.3850, lng: 78.4867 }
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Map UI filter labels to backend category/type keywords */
const CATEGORY_KEYWORDS = {
  historical: ['history', 'architecture'],
  food: ['food', 'street food', 'cafe'],
  shopping: ['shopping'],
  religious: ['cultural sites', 'temple', 'church'],
  parks: ['nature'],
  entertainment: ['adventure', 'nightlife'],
  'street food': ['street food', 'food'],
  hotels: ['hotel', 'resort'],
  more: []
};

function matchesCategoryFilter(place, filterRaw) {
  if (!filterRaw) return true;
  const f = filterRaw.toLowerCase().trim();
  if (f === 'all places' || f === 'more') return true;
  const keywords = CATEGORY_KEYWORDS[f];
  const pc = (place.category || '').toLowerCase();
  const pt = (place.type || '').toLowerCase();
  if (!keywords || keywords.length === 0) {
    return pc.includes(f) || pt.includes(f) || (pc && f.includes(pc));
  }
  return keywords.some((k) => pc.includes(k) || pt.includes(k) || k.includes(pc));
}

function enrichWithDistance(place, refLat, refLng) {
  const d = haversineKm(refLat, refLng, place.lat, place.lng);
  return { ...place, distanceKm: Math.round(d * 10) / 10 };
}

// GET /api/places/categories/list — must be before /:id
router.get('/categories/list', (req, res) => {
  const { city } = req.query;
  let results = [...allPlaces];
  if (city) {
    results = results.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  }
  const categories = [...new Set(results.map((p) => p.category))].sort();
  res.json({ categories });
});

// GET /api/places/reviews/me
router.get('/reviews/me', authenticateToken, (req, res) => {
  const reviews = db.get('reviews').filter({ userId: req.user.id }).sortBy('createdAt').reverse().value() || [];
  const decorated = reviews.map((r) => {
    const place = allPlaces.find((p) => p.id === r.placeId);
    return {
      ...r,
      placeName: place?.name || 'Unknown place',
      city: place?.city || ''
    };
  });
  res.json({ reviews: decorated, count: decorated.length });
});

// GET /api/places
router.get('/', (req, res) => {
  let {
    city,
    category,
    search,
    limit,
    page,
    page_size: pageSizeRaw,
    max_distance: maxDistanceRaw,
    lat: latRaw,
    lng: lngRaw,
    user_lat: userLatRaw,
    user_lng: userLngRaw,
    sort
  } = req.query;

  let results = allPlaces.map((p) => withImage({ ...p }));

  if (city) {
    results = results.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  }

  if (category) {
    results = results.filter((p) => matchesCategoryFilter(p, category));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  const cityKey = city ? city.toLowerCase() : '';
  const center = CITY_CENTERS[cityKey];

  let refLat = parseFloat(latRaw || userLatRaw);
  let refLng = parseFloat(lngRaw || userLngRaw);
  if (Number.isNaN(refLat) || Number.isNaN(refLng)) {
    if (center) {
      refLat = center.lat;
      refLng = center.lng;
    } else if (results[0]) {
      refLat = results[0].lat;
      refLng = results[0].lng;
    } else {
      refLat = CITY_CENTERS.delhi.lat;
      refLng = CITY_CENTERS.delhi.lng;
    }
  }

  results = results.map((p) => enrichWithDistance(p, refLat, refLng));

  const maxKm = maxDistanceRaw != null && maxDistanceRaw !== '' ? parseFloat(maxDistanceRaw) : null;
  if (maxKm != null && !Number.isNaN(maxKm)) {
    results = results.filter((p) => p.distanceKm <= maxKm);
  }

  if (sort === 'offers' || sort === 'promo') {
    results = results.filter((p) => p.offerLabel);
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === 'trending' || sort === 'rating') {
    results.sort((a, b) => {
      const ob = b.offerLabel ? 1 : 0;
      const oa = a.offerLabel ? 1 : 0;
      if (ob !== oa) return ob - oa;
      return (b.rating || 0) - (a.rating || 0);
    });
  } else {
    results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  const total = results.length;

  if (limit) {
    const n = parseInt(limit, 10);
    results = results.slice(0, n);
    return res.json({ places: results, count: results.length, total, page: 1, pageSize: n, hasMore: false });
  }

  const pageSize = Math.min(parseInt(pageSizeRaw || '8', 10) || 8, 50);
  const pageNum = Math.max(parseInt(page || '1', 10) || 1, 1);
  const start = (pageNum - 1) * pageSize;
  const paged = results.slice(start, start + pageSize);

  res.json({
    places: paged,
    count: paged.length,
    total,
    page: pageNum,
    pageSize,
    hasMore: start + pageSize < total
  });
});

// GET /api/places/:id
router.get('/:id', (req, res) => {
  const place = allPlaces.find((p) => p.id === req.params.id);
  if (!place) return res.status(404).json({ error: 'Place not found' });

  let reviews = db.get('reviews').filter({ placeId: req.params.id }).value() || [];
  reviews = [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ place: withImage(place), reviews });
});

// POST /api/places/:id/reviews
router.post('/:id/reviews', authenticateToken, (req, res) => {
  const { rating, text, photoUrl, photoBase64, title } = req.body;
  const placeId = req.params.id;

  if (!rating || !text) return res.status(400).json({ error: 'Rating and text are required.' });

  let finalPhoto = photoUrl && String(photoUrl).trim() ? String(photoUrl).trim() : null;
  if (photoBase64 && typeof photoBase64 === 'string') {
    const m = /^data:image\/(\w+);base64,([\s\S]+)$/.exec(photoBase64.trim());
    if (m) {
      const ext = m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
      const buf = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
      if (buf.length > 600000) {
        return res.status(400).json({ error: 'Image too large (max about 600KB).' });
      }
      try {
        fs.mkdirSync(REVIEW_UPLOADS, { recursive: true });
        const fname = `${uuidv4()}.${ext}`;
        fs.writeFileSync(path.join(REVIEW_UPLOADS, fname), buf);
        finalPhoto = `/uploads/reviews/${fname}`;
      } catch (e) {
        console.error('Review image save:', e);
        return res.status(500).json({ error: 'Could not save image.' });
      }
    }
  }

  const newReview = {
    id: uuidv4(),
    placeId,
    userId: req.user.id,
    userName: req.user.fullName,
    rating: parseInt(rating, 10),
    title: title && String(title).trim() ? String(title).trim().slice(0, 200) : '',
    text: String(text).slice(0, 8000),
    photoUrl: finalPhoto,
    createdAt: new Date().toISOString()
  };

  db.get('reviews').push(newReview).write();
  res.status(201).json({ message: 'Review added successfully', review: newReview });
});

module.exports = router;
