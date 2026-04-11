const { v4: uuidv4 } = require('uuid');
const db = require('./database');

function run() {
  const places = require('./mockData');
  let revs = db.get('reviews').value() || [];
  if (revs.some((r) => String(r.userId || '').startsWith('seed-u-'))) return;

  const names = [
    'Priya S.',
    'Rahul M.',
    'Ananya K.',
    'Vikram T.',
    'Sneha P.',
    'Arjun D.',
    'Meera L.',
    'Kabir N.',
    'Ishita R.',
    'Dev A.'
  ];
  const texts = [
    'Visited on a weekday — barely any crowd. Great for photos and the staff was helpful.',
    'Worth the hype. We spent longer than planned and still did not see everything.',
    'Family-friendly and easy to reach by metro. Carry water if you go in summer.',
    'Perfect sunset spot. The diary feature here is cool for remembering the trip.',
    'Good value for money. Would book a table again during peak hours.',
    'Historic vibe is strong — read a bit before you go, it makes the visit richer.',
    'Loved the local food stalls nearby. Combine this with an evening walk.',
    'A bit touristy but still enjoyable. Go early morning for the best light.',
    'We used WayEase to plan the day around this — worked out really well.',
    'Clean, well maintained, and signage is clear. Recommended for first-timers.'
  ];
  const photos = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3ef4e5c1?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526772662000-3f88f104f11d?w=600&q=80&auto=format&fit=crop',
    null,
    null
  ];

  const step = Math.max(1, Math.floor(places.length / 55));
  const picks = places.filter((_, i) => i % step === 0).slice(0, 55);
  const newR = [];

  picks.forEach((p, idx) => {
    for (let j = 0; j < 2; j++) {
      const ni = (idx * 2 + j) % names.length;
      const ti = (idx + j * 3) % texts.length;
      const pi = (idx + j) % photos.length;
      newR.push({
        id: uuidv4(),
        placeId: p.id,
        userId: `seed-u-${idx}-${j}`,
        userName: names[ni],
        rating: j === 0 ? 5 : 4,
        title: j === 0 ? 'Great experience' : '',
        text: texts[ti],
        photoUrl: photos[pi],
        createdAt: new Date(Date.now() - idx * 43200000 - j * 7200000).toISOString()
      });
    }
  });

  db.set('reviews', [...revs, ...newR]).write();
  console.log(`Seeded ${newR.length} sample reviews for community feed.`);
}

module.exports = { run };
