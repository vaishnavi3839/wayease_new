# WayEase Backend API

Production-ready backend API for the WayEase travel planner application.

## Features

- ✅ User Authentication (Signup/Login with JWT)
- ✅ Places Management (CRUD operations)
- ✅ Wishlist Management
- ✅ Search and Filter Places by City, Category, Distance
- ✅ SQLite Database with proper schema
- ✅ RESTful API design
- ✅ CORS enabled
- ✅ Error handling
- ✅ Database seeding script

## API Endpoints

### Authentication

- `POST /signup` - Register a new user
  - Body: `{ fullName, email, password }`
  - Returns: `{ message, token, userId, fullName }`

- `POST /login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ message, token, userId, fullName, email }`

### Places

- `GET /places` - Get all places (with optional filters)
  - Query params: `city`, `category`, `search`, `maxDistance`, `limit`
  - Returns: Array of places

- `GET /places/:id` - Get place by ID
  - Returns: Place object

- `GET /places/city/:city` - Get places by city
  - Returns: Array of places

### Wishlist

- `POST /wishlist/add` - Add place to wishlist (requires authentication)
  - Headers: `Authorization: Bearer <token>` or query param: `?token=<token>`
  - Body: `{ place_id }`
  - Returns: `{ message }`

- `GET /wishlist` - Get user's wishlist (requires authentication)
  - Headers: `Authorization: Bearer <token>` or query param: `?token=<token>`
  - Returns: Array of places

- `DELETE /wishlist/:placeId` - Remove place from wishlist (requires authentication)
  - Headers: `Authorization: Bearer <token>` or query param: `?token=<token>`
  - Returns: `{ message }`

- `GET /wishlist/check/:placeId` - Check if place is in wishlist (requires authentication)
  - Headers: `Authorization: Bearer <token>` or query param: `?token=<token>`
  - Returns: `{ inWishlist: boolean }`

### Health Check

- `GET /health` - Check API health
  - Returns: `{ status: 'OK', message: 'WayEase API is running' }`

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Edit `.env` and set your JWT_SECRET (important for production):
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Seed the database with initial places data:
```bash
npm run seed
```

6. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Database Schema

### Users Table
- `id` - Primary key
- `fullName` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `createdAt` - Timestamp

### Places Table
- `id` - Primary key
- `placeName` - Name of the place
- `city` - City name
- `state` - State name
- `description` - Place description
- `category` - Category (Historical, Food, Shopping, etc.)
- `rating` - Average rating
- `reviewCount` - Number of reviews
- `imageUrl` - Place image URL
- `distance` - Distance from city center (km)
- `openingHours` - Opening hours
- `entryFee` - Entry fee information
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `createdAt` - Timestamp

### Wishlist Table
- `id` - Primary key
- `userId` - Foreign key to users table
- `placeId` - Foreign key to places table
- `createdAt` - Timestamp
- Unique constraint on (userId, placeId)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login or signup, a token is returned that should be included in subsequent requests:

### Using Authorization Header (Recommended)
```
Authorization: Bearer <token>
```

### Using Query Parameter (Alternative)
```
GET /wishlist?token=<token>
```

Tokens expire after 30 days.

## Frontend Integration

Update your frontend API calls to use the correct endpoints:

### Login Example
```javascript
const response = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('userName', data.fullName);
  localStorage.setItem('userEmail', data.email);
}
```

### Wishlist Example
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/wishlist/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ place_id: '1' })
});
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Database Seeding

To populate the database with sample places:
```bash
npm run seed
```

To add more places, edit `scripts/seedDatabase.js` and run the seed command again.

## Production Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Use a strong, unique `JWT_SECRET`
3. Consider using PostgreSQL or MySQL instead of SQLite for better performance
4. Set up proper logging and monitoring
5. Use environment variables for sensitive configuration
6. Enable HTTPS
7. Set up rate limiting
8. Configure proper CORS origins

## License

ISC

