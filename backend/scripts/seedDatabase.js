const db = require('../config/database');

// Sample places data based on the cities shown in the frontend
const places = [
  // Bangalore places
  {
    placeName: 'Bangalore Palace',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Magnificent Tudor-style palace built in 1887',
    category: 'Historical',
    rating: 4.5,
    reviewCount: 2100,
    imageUrl: 'https://public.readdy.ai/ai/img_res/dfc8788fae1c9f42483e7cdb5a1bfa51.jpg',
    distance: 4.2,
    openingHours: '10:00 AM - 5:30 PM',
    entryFee: '₹230',
    latitude: 12.9987,
    longitude: 77.5925
  },
  {
    placeName: 'Lalbagh Botanical Garden',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Historic botanical garden with over 1000 species',
    category: 'Parks',
    rating: 4.6,
    reviewCount: 3200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/6589a80615cc6ff85cb64b6f4c4c8b2a.jpg',
    distance: 5.3,
    openingHours: '6:00 AM - 7:00 PM',
    entryFee: '₹20',
    latitude: 12.9507,
    longitude: 77.5848
  },
  {
    placeName: 'ISKCON Temple',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Stunning spiritual complex with beautiful architecture',
    category: 'Religious',
    rating: 4.8,
    reviewCount: 3500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/41b50a38b76517a07b7bb4207d7541f6.jpg',
    distance: 7.1,
    openingHours: '7:30 AM - 1:00 PM, 4:00 PM - 8:30 PM',
    entryFee: 'Free',
    latitude: 12.9396,
    longitude: 77.5506
  },
  {
    placeName: 'Cubbon Park',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Historic urban park in the heart of Bangalore',
    category: 'Parks',
    rating: 4.5,
    reviewCount: 2800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/6824676097aebc4a245890df923c339f.jpg',
    distance: 3.8,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    placeName: 'Wonderla',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Popular amusement park with thrilling rides',
    category: 'Entertainment',
    rating: 4.7,
    reviewCount: 5300,
    imageUrl: 'https://public.readdy.ai/ai/img_res/50e663e5956cc9118cfa85289f1db27e.jpg',
    distance: 18.5,
    openingHours: '11:00 AM - 7:00 PM',
    entryFee: '₹1200',
    latitude: 12.8275,
    longitude: 77.3985
  },
  {
    placeName: 'Commercial Street',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Famous shopping street with various shops and boutiques',
    category: 'Shopping',
    rating: 4.4,
    reviewCount: 4200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/5ca3dfe838b1149a101430bbd2efd8a2.jpg',
    distance: 4.5,
    openingHours: '10:30 AM - 9:00 PM',
    entryFee: 'Varies',
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    placeName: 'Vidhana Soudha',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Iconic legislative building with impressive architecture',
    category: 'Historical',
    rating: 4.7,
    reviewCount: 3800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/a2efc664a66889ce37fb5a28708d5983.jpg',
    distance: 3.2,
    openingHours: '10:00 AM - 5:30 PM',
    entryFee: 'Free Entry',
    latitude: 12.9794,
    longitude: 77.5908
  },
  {
    placeName: 'UB City',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Luxury shopping mall with premium brands',
    category: 'Shopping',
    rating: 4.6,
    reviewCount: 3900,
    imageUrl: 'https://public.readdy.ai/ai/img_res/df5afa597fcf21e7886e4ac69bd9c2ef.jpg',
    distance: 5.5,
    openingHours: '11:00 AM - 9:30 PM',
    entryFee: 'Luxury',
    latitude: 12.9716,
    longitude: 77.6098
  },
  {
    placeName: 'Nandi Hills',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'A scenic hill fortress with breathtaking sunrise views, ancient temples, and lush greenery perfect for day trips',
    category: 'Historical',
    rating: 4.7,
    reviewCount: 3200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/c6016ccb72352e4191fc329e45cc3a13.jpg',
    distance: 60.0,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: '₹20',
    latitude: 13.3684,
    longitude: 77.6828
  },
  {
    placeName: 'Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    description: 'Trendy neighborhood with popular restaurants, microbreweries, boutiques, and a vibrant nightlife scene',
    category: 'Food',
    rating: 4.6,
    reviewCount: 4500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/3d39be724c320e469f3aa5588258adab.jpg',
    distance: 7.2,
    openingHours: '10:00 AM - 1:00 AM',
    entryFee: 'Varies',
    latitude: 12.9784,
    longitude: 77.6408
  },
  // Goa places
  {
    placeName: 'Calangute Beach',
    city: 'Goa',
    state: 'Goa',
    description: 'Popular beach with golden sands and vibrant beach shacks',
    category: 'Entertainment',
    rating: 4.5,
    reviewCount: 2100,
    imageUrl: 'https://public.readdy.ai/ai/img_res/d980904791a44265aae6cb9834fc1f7d.jpg',
    distance: 4.2,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 15.5439,
    longitude: 73.7553
  },
  {
    placeName: 'Baga Beach',
    city: 'Goa',
    state: 'Goa',
    description: 'Vibrant beach with water sports and nightlife',
    category: 'Entertainment',
    rating: 4.6,
    reviewCount: 3200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/edd3f1a89f5e8621b0f2b7252e6016c8.jpg',
    distance: 5.3,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 15.5589,
    longitude: 73.7500
  },
  {
    placeName: 'Fort Aguada',
    city: 'Goa',
    state: 'Goa',
    description: '17th century Portuguese fort with lighthouse and sea views',
    category: 'Historical',
    rating: 4.8,
    reviewCount: 3500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/9fecee5171c176b5e5c69e3b76734bd2.jpg',
    distance: 7.1,
    openingHours: '9:30 AM - 6:00 PM',
    entryFee: '₹25',
    latitude: 15.4939,
    longitude: 73.7733
  },
  {
    placeName: 'Dudhsagar Falls',
    city: 'Goa',
    state: 'Goa',
    description: 'Spectacular four-tiered waterfall in lush forest',
    category: 'Parks',
    rating: 4.5,
    reviewCount: 2800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/b59bfa2ebc7c5bc64acb5282c1521f3c.jpg',
    distance: 60.0,
    openingHours: '9:00 AM - 6:00 PM',
    entryFee: '₹20',
    latitude: 15.3142,
    longitude: 74.3147
  },
  {
    placeName: 'Basilica of Bom Jesus',
    city: 'Goa',
    state: 'Goa',
    description: 'UNESCO World Heritage Site with baroque architecture',
    category: 'Religious',
    rating: 4.7,
    reviewCount: 5300,
    imageUrl: 'https://public.readdy.ai/ai/img_res/d65357c00768aa7b650ed340400f359b.jpg',
    distance: 18.5,
    openingHours: '9:00 AM - 6:30 PM',
    entryFee: 'Free',
    latitude: 15.4996,
    longitude: 73.9115
  },
  {
    placeName: 'Anjuna Flea Market',
    city: 'Goa',
    state: 'Goa',
    description: 'Famous weekly market with handicrafts and souvenirs',
    category: 'Shopping',
    rating: 4.4,
    reviewCount: 4200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/7ecccf0cdc6cc0a1272c80e6bbcd2c1a.jpg',
    distance: 4.5,
    openingHours: '10:30 AM - 9:00 PM (Wednesdays)',
    entryFee: 'Varies',
    latitude: 15.5778,
    longitude: 73.7422
  },
  {
    placeName: 'Palolem Beach',
    city: 'Goa',
    state: 'Goa',
    description: 'Serene crescent-shaped beach perfect for relaxation',
    category: 'Entertainment',
    rating: 4.7,
    reviewCount: 3800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/a3b26a4b9d7c15568d02b076ab6a1aa0.jpg',
    distance: 3.2,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 15.0100,
    longitude: 74.0233
  },
  {
    placeName: 'Chapora Fort',
    city: 'Goa',
    state: 'Goa',
    description: 'Historic fort ruins with panoramic views',
    category: 'Historical',
    rating: 4.6,
    reviewCount: 3900,
    imageUrl: 'https://public.readdy.ai/ai/img_res/35f6aa699d98f021fe5c34e732c78315.jpg',
    distance: 5.5,
    openingHours: '9:00 AM - 5:30 PM',
    entryFee: 'Free',
    latitude: 15.6081,
    longitude: 73.7442
  },
  {
    placeName: 'Mandovi River Cruise',
    city: 'Goa',
    state: 'Goa',
    description: 'Enjoy a relaxing sunset cruise on the Mandovi River with live music, cultural performances, and beautiful views of Panjim\'s coastline',
    category: 'Entertainment',
    rating: 4.7,
    reviewCount: 3200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/368a8dbc78e7564b16f97b8dd7a51a90.jpg',
    distance: 3.0,
    openingHours: '5:30 PM - 7:30 PM',
    entryFee: '₹400',
    latitude: 15.4989,
    longitude: 73.8278
  },
  {
    placeName: 'Spice Plantations',
    city: 'Goa',
    state: 'Goa',
    description: 'Explore aromatic spice gardens with guided tours, learn about spice cultivation, and enjoy traditional Goan cuisine made with fresh local ingredients',
    category: 'Parks',
    rating: 4.6,
    reviewCount: 4500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/8e644309b6398c7b039f0cb5d9b4c5a6.jpg',
    distance: 8.5,
    openingHours: '9:00 AM - 5:00 PM',
    entryFee: '₹500',
    latitude: 15.4033,
    longitude: 74.0153
  },
  // Mumbai places
  {
    placeName: 'Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Iconic sea-facing promenade known as the Queen\'s Necklace',
    category: 'Entertainment',
    rating: 4.5,
    reviewCount: 2100,
    imageUrl: 'https://public.readdy.ai/ai/img_res/1ccca9dcdd832f230868d0a6f71d9d1e.jpg',
    distance: 4.2,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 18.9441,
    longitude: 72.8229
  },
  {
    placeName: 'Gateway of India',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Historic arch monument overlooking the Arabian Sea',
    category: 'Historical',
    rating: 4.6,
    reviewCount: 3200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/d45d4e17119d75c86cbde8317f05a144.jpg',
    distance: 5.3,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 18.9220,
    longitude: 72.8347
  },
  {
    placeName: 'Chhatrapati Shivaji Terminus',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'UNESCO heritage site with stunning Victorian Gothic architecture',
    category: 'Historical',
    rating: 4.8,
    reviewCount: 3500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/fa69972507cb865ac8527e699adf29bb.jpg',
    distance: 7.1,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 18.9398,
    longitude: 72.8354
  },
  {
    placeName: 'Elephanta Caves',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Ancient rock-cut caves with Hindu deity sculptures',
    category: 'Historical',
    rating: 4.5,
    reviewCount: 2800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/a7bb9c03a189db90eb1d342d3b702699.jpg',
    distance: 10.0,
    openingHours: '9:00 AM - 5:30 PM',
    entryFee: '₹40',
    latitude: 18.9633,
    longitude: 72.9314
  },
  {
    placeName: 'Juhu Beach',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Famous beach with food stalls and entertainment',
    category: 'Entertainment',
    rating: 4.7,
    reviewCount: 5300,
    imageUrl: 'https://public.readdy.ai/ai/img_res/ac9403bf220c116bd0862f57d7a73ff5.jpg',
    distance: 18.5,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 19.1000,
    longitude: 72.8267
  },
  {
    placeName: 'Colaba Causeway',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Famous shopping street with diverse range of products',
    category: 'Shopping',
    rating: 4.4,
    reviewCount: 4200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/10bfd664a445919401db24c44c1d0471.jpg',
    distance: 4.5,
    openingHours: '10:30 AM - 9:00 PM',
    entryFee: 'Varies',
    latitude: 18.9150,
    longitude: 72.8310
  },
  {
    placeName: 'Sanjay Gandhi National Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Large protected area with diverse wildlife',
    category: 'Parks',
    rating: 4.7,
    reviewCount: 3800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/463d3f675a8353462980bc8c30769842.jpg',
    distance: 25.0,
    openingHours: '7:30 AM - 6:00 PM',
    entryFee: '₹58',
    latitude: 19.2316,
    longitude: 72.9133
  },
  {
    placeName: 'Bandra-Worli Sea Link',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Iconic cable-stayed bridge connecting Bandra and Worli',
    category: 'Historical',
    rating: 4.6,
    reviewCount: 3900,
    imageUrl: 'https://public.readdy.ai/ai/img_res/e89c0521808118708b42531947bc5df6.jpg',
    distance: 15.0,
    openingHours: 'All Day',
    entryFee: 'Toll: ₹70',
    latitude: 19.0389,
    longitude: 72.8194
  },
  {
    placeName: 'Dharavi Tour',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Experience the vibrant community and entrepreneurial spirit of Asia\'s largest slum with guided tours showcasing small-scale industries and local artisans',
    category: 'Entertainment',
    rating: 4.7,
    reviewCount: 3200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/d0f63509d652d34b691828e88ecf80ff.jpg',
    distance: 5.0,
    openingHours: '9:00 AM - 5:00 PM',
    entryFee: '₹800',
    latitude: 19.0381,
    longitude: 72.8563
  },
  {
    placeName: 'Bollywood Studio Tour',
    city: 'Mumbai',
    state: 'Maharashtra',
    description: 'Go behind the scenes of Bollywood filmmaking with studio tours, see movie sets, watch dance performances, and learn about India\'s vibrant film industry',
    category: 'Entertainment',
    rating: 4.6,
    reviewCount: 4500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/514a78906dadea918cc5b072e9daca6c.jpg',
    distance: 12.5,
    openingHours: '9:00 AM - 6:00 PM',
    entryFee: '₹1500',
    latitude: 19.1692,
    longitude: 72.8397
  },
  // Delhi places
  {
    placeName: 'Red Fort',
    city: 'Delhi',
    state: 'Delhi',
    description: 'UNESCO World Heritage Site, historic Mughal fortress',
    category: 'Historical',
    rating: 4.6,
    reviewCount: 4500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 5.0,
    openingHours: '9:30 AM - 4:30 PM',
    entryFee: '₹35',
    latitude: 28.6562,
    longitude: 77.2410
  },
  {
    placeName: 'India Gate',
    city: 'Delhi',
    state: 'Delhi',
    description: 'War memorial arch monument',
    category: 'Historical',
    rating: 4.5,
    reviewCount: 5200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 3.0,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 28.6129,
    longitude: 77.2295
  },
  {
    placeName: 'Qutub Minar',
    city: 'Delhi',
    state: 'Delhi',
    description: 'Tallest brick minaret in the world',
    category: 'Historical',
    rating: 4.7,
    reviewCount: 4800,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 15.0,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: '₹35',
    latitude: 28.5245,
    longitude: 77.1855
  },
  {
    placeName: 'Lotus Temple',
    city: 'Delhi',
    state: 'Delhi',
    description: 'Bahá\'í House of Worship shaped like a lotus',
    category: 'Religious',
    rating: 4.6,
    reviewCount: 4100,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 12.0,
    openingHours: '9:00 AM - 7:00 PM',
    entryFee: 'Free',
    latitude: 28.5535,
    longitude: 77.2588
  },
  {
    placeName: 'Humayun\'s Tomb',
    city: 'Delhi',
    state: 'Delhi',
    description: 'UNESCO World Heritage Site, Mughal architecture',
    category: 'Historical',
    rating: 4.8,
    reviewCount: 3600,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 8.0,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: '₹30',
    latitude: 28.5933,
    longitude: 77.2506
  },
  {
    placeName: 'Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    description: 'Historic commercial and financial hub',
    category: 'Shopping',
    rating: 4.4,
    reviewCount: 5500,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 2.0,
    openingHours: '10:00 AM - 9:00 PM',
    entryFee: 'Varies',
    latitude: 28.6304,
    longitude: 77.2177
  },
  // Hyderabad places
  {
    placeName: 'Charminar',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Iconic monument and mosque',
    category: 'Historical',
    rating: 4.5,
    reviewCount: 4300,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 2.0,
    openingHours: '9:30 AM - 5:30 PM',
    entryFee: '₹5',
    latitude: 17.3616,
    longitude: 78.4747
  },
  {
    placeName: 'Golconda Fort',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Historic fortified citadel',
    category: 'Historical',
    rating: 4.6,
    reviewCount: 3900,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 11.0,
    openingHours: '9:00 AM - 5:30 PM',
    entryFee: '₹15',
    latitude: 17.3833,
    longitude: 78.4011
  },
  {
    placeName: 'Hussain Sagar Lake',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Heart-shaped lake with Buddha statue',
    category: 'Parks',
    rating: 4.4,
    reviewCount: 4700,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 3.0,
    openingHours: 'All Day',
    entryFee: 'Free',
    latitude: 17.4239,
    longitude: 78.4738
  },
  {
    placeName: 'Salar Jung Museum',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'One of the largest one-man collections in the world',
    category: 'Historical',
    rating: 4.5,
    reviewCount: 3100,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 4.0,
    openingHours: '10:00 AM - 5:00 PM',
    entryFee: '₹20',
    latitude: 17.3713,
    longitude: 78.4804
  },
  {
    placeName: 'Birla Mandir',
    city: 'Hyderabad',
    state: 'Telangana',
    description: 'Modern Hindu temple made of white marble',
    category: 'Religious',
    rating: 4.6,
    reviewCount: 4200,
    imageUrl: 'https://public.readdy.ai/ai/img_res/placeholder.jpg',
    distance: 5.0,
    openingHours: '7:00 AM - 12:00 PM, 3:00 PM - 9:00 PM',
    entryFee: 'Free',
    latitude: 17.4065,
    longitude: 78.4692
  }
];

// Function to seed the database
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing places (optional - comment out if you want to keep existing data)
    await db.promisify.run('DELETE FROM places');
    console.log('Cleared existing places data');

    // Insert places
    let insertedCount = 0;
    for (const place of places) {
      try {
        await db.promisify.run(
          `INSERT INTO places (
            placeName, city, state, description, category, rating, reviewCount,
            imageUrl, distance, openingHours, entryFee, latitude, longitude
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            place.placeName,
            place.city,
            place.state,
            place.description,
            place.category,
            place.rating,
            place.reviewCount,
            place.imageUrl,
            place.distance,
            place.openingHours,
            place.entryFee,
            place.latitude,
            place.longitude
          ]
        );
        insertedCount++;
      } catch (error) {
        console.error(`Error inserting ${place.placeName}:`, error.message);
      }
    }

    console.log(`✅ Successfully seeded ${insertedCount} places`);
    console.log('🎉 Database seeding completed!');
    console.log(`📊 Seeded places for cities: Bangalore, Goa, Mumbai, Delhi, Hyderabad`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        process.exit(1);
      } else {
        console.log('Database connection closed');
        process.exit(0);
      }
    });
  }
}

// Run the seeding function
seedDatabase();

