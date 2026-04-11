/* One-off: node scripts/generatePlacesFromHtml.js — writes mockData.generated.js */
const fs = require('fs');
const path = require('path');

const CITY_CENTERS = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Goa: { lat: 15.4989, lng: 73.8278 },
  Hyderabad: { lat: 17.385, lng: 78.4867 }
};

const STOCK_IMG = [
  'photo-1524492412932-e022a2938881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1476514525535-07fb3ef4e5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1526772662000-3f88f104f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

function hashPick(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return STOCK_IMG[h % STOCK_IMG.length];
}

function categoryFromType(type) {
  const t = (type || '').toLowerCase();
  if (/temple|church|mosque|basilica|gurudwara/.test(t)) return 'cultural sites';
  if (/museum|gallery/.test(t)) return 'history';
  if (/park|garden|beach|lake|nature|waterfall/.test(t)) return 'nature';
  if (/restaurant|cafe|food|bistro|pub|brew|dining/.test(t)) return 'food';
  if (/market|shopping|mall|street/.test(t)) return 'shopping';
  if (/fort|palace|monument|gate|minar|historical/.test(t)) return 'history';
  if (/hotel|resort/.test(t)) return 'hotels';
  if (/adventure|theme|film city/.test(t)) return 'adventure';
  if (/night/.test(t)) return 'nightlife';
  return 'sightseeing';
}

function parseFile(absFile, city) {
  const html = fs.readFileSync(absFile, 'utf8');
  const blocks = html.split('<div class="bg-white rounded-lg shadow-md overflow-hidden');
  const out = [];
  for (const b of blocks.slice(1)) {
    const h3 = b.match(/<h3[^>]*>([^<]+)<\/h3>/);
    if (!h3) continue;
    const name = h3[1].trim().replace(/\s+/g, ' ');
    const typeM = b.match(/<strong>Type:<\/strong>\s*([^<]+)/);
    const type = (typeM && typeM[1].trim()) || 'Attraction';
    const rM = b.match(/ri-star-fill[^<]*<\/i>\s*([0-9.]+)/);
    const rating = rM ? Math.min(5, Math.max(1, parseFloat(rM[1]))) : 4.3;
    const tM = b.match(/<strong>Time Needed:<\/strong>\s*([0-9.]+)/);
    const timeNeeded = tM ? Math.min(8, Math.max(0.5, parseFloat(tM[1]))) : 2;
    out.push({ name, type, rating, timeNeeded });
  }
  return out;
}

function jitterLatLng(city, idx, total) {
  const c = CITY_CENTERS[city] || CITY_CENTERS.Delhi;
  const angle = (idx / Math.max(total, 1)) * Math.PI * 2;
  const r = 0.02 + (idx % 7) * 0.003;
  return {
    lat: c.lat + Math.sin(angle) * r,
    lng: c.lng + Math.cos(angle) * r
  };
}

function main() {
  const root = path.join(__dirname, '../../wayease-frontend');
  const jobs = [
    ['blrplaces.html', 'Bangalore'],
    ['delhiplaces.html', 'Delhi'],
    ['mumbaiplaces.html', 'Mumbai']
  ];
  const places = [];
  let n = 0;
  for (const [file, city] of jobs) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) {
      console.warn('Skip missing', abs);
      continue;
    }
    const rows = parseFile(abs, city);
    console.log(file, rows.length);
    rows.forEach((r, i) => {
      n += 1;
      const id = `html-${city.toLowerCase().slice(0, 3)}-${n}`;
      const { lat, lng } = jitterLatLng(city, i, rows.length);
      const category = categoryFromType(r.type);
      const image = `https://images.unsplash.com/${hashPick(id + r.name)}`;
      const offerLabel =
        n % 11 === 0 ? 'Weekend 15% off' : n % 17 === 0 ? 'Free guided tour' : '';
      const bookUrl =
        /restaurant|cafe|pub|brew|bistro|dining/i.test(r.type)
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + city + ' reserve table')}`
          : /hotel|resort/i.test(r.type)
            ? `https://www.google.com/travel/hotels?q=${encodeURIComponent(r.name + ' ' + city)}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + city)}`;
      places.push({
        id,
        name: r.name,
        city,
        type: r.type,
        rating: r.rating,
        timeNeeded: r.timeNeeded,
        category,
        lat,
        lng,
        image,
        offerLabel,
        bookUrl
      });
    });
  }

  const outPath = path.join(__dirname, '../mockData.generated.js');
  const body = `// Auto-generated by scripts/generatePlacesFromHtml.js — do not edit by hand
module.exports = ${JSON.stringify(places, null, 0)};
`;
  fs.writeFileSync(outPath, body);
  console.log('Wrote', outPath, 'count', places.length);
}

main();
