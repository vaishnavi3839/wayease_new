/**
 * Goa & Hyderabad (manual) + Bangalore, Delhi, Mumbai from HTML (mockData.generated.js).
 * Regenerate: node scripts/generatePlacesFromHtml.js
 */
const generated = require('./mockData.generated');

const goaHyderabad = [
  { id: 'goa-1', name: 'Baga Beach', city: 'Goa', type: 'Beach', rating: 4.5, timeNeeded: 3, category: 'nature', lat: 15.5557, lng: 73.7557, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&auto=format&fit=crop', offerLabel: 'Sunset kayak 20% off', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Baga+Beach+Goa' },
  { id: 'goa-2', name: 'Basilica of Bom Jesus', city: 'Goa', type: 'Church', rating: 4.6, timeNeeded: 1, category: 'history', lat: 15.5007, lng: 73.9116, image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80&auto=format&fit=crop', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Basilica+of+Bom+Jesus+Goa' },
  { id: 'goa-3', name: 'Dudhsagar Falls', city: 'Goa', type: 'Waterfall', rating: 4.7, timeNeeded: 4, category: 'adventure', lat: 15.3144, lng: 74.3149, image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80&auto=format&fit=crop', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Dudhsagar+Falls+Goa' },
  { id: 'goa-4', name: 'Anjuna Flea Market', city: 'Goa', type: 'Market', rating: 4.2, timeNeeded: 2, category: 'shopping', lat: 15.5865, lng: 73.742, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop', offerLabel: 'Weekend bazaar specials', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Anjuna+Flea+Market+Goa' },
  { id: 'goa-5', name: "Tito's Lane", city: 'Goa', type: 'Street', rating: 4.3, timeNeeded: 3, category: 'nightlife', lat: 15.5553, lng: 73.7606, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80&auto=format&fit=crop', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Titos+Lane+Goa' },
  { id: 'hyd-1', name: 'Charminar', city: 'Hyderabad', type: 'Monument', rating: 4.6, timeNeeded: 1.5, category: 'history', lat: 17.3616, lng: 78.4747, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80&auto=format&fit=crop', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Charminar+Hyderabad' },
  { id: 'hyd-2', name: 'Golconda Fort', city: 'Hyderabad', type: 'Fort', rating: 4.5, timeNeeded: 3, category: 'history', lat: 17.3833, lng: 78.4011, image: 'https://images.unsplash.com/photo-1595658658481-df843a88c9a5?w=800&q=80&auto=format&fit=crop', offerLabel: 'Early bird tickets ₹50 off', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Golconda+Fort+Hyderabad' },
  { id: 'hyd-3', name: 'Ramoji Film City', city: 'Hyderabad', type: 'Theme Park', rating: 4.4, timeNeeded: 5, category: 'adventure', lat: 17.2543, lng: 78.6818, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&auto=format&fit=crop', bookUrl: 'https://www.ramojifilmcity.com/' },
  { id: 'hyd-4', name: 'Hussain Sagar Lake', city: 'Hyderabad', type: 'Lake', rating: 4.3, timeNeeded: 2, category: 'nature', lat: 17.4239, lng: 78.4738, image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format&fit=crop', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Hussain+Sagar+Hyderabad' },
  { id: 'hyd-5', name: 'Paradise Biryani', city: 'Hyderabad', type: 'Restaurant', rating: 4.6, timeNeeded: 1.5, category: 'food', lat: 17.4458, lng: 78.5035, image: 'https://images.unsplash.com/photo-1563379091339-03246963d4b7?w=800&q=80&auto=format&fit=crop', offerLabel: 'Lunch combo 10% off', bookUrl: 'https://www.google.com/maps/search/?api=1&query=Paradise+Biryani+Hyderabad+reserve' }
];

module.exports = [...goaHyderabad, ...generated];
