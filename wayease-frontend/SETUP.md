# WayEase Full Stack Setup Guide

Complete setup instructions for the WayEase travel planner application (Frontend + Backend).

## Project Structure

```
wayease-frontend/
├── frontend files (HTML, images, etc.)
└── backend/
    ├── config/
    │   └── database.js
    ├── middleware/
    │   └── auth.js
    ├── routes/
    │   ├── auth.js
    │   ├── places.js
    │   └── wishlist.js
    ├── scripts/
    │   └── seedDatabase.js
    ├── server.js
    ├── package.json
    └── README.md
```

## Quick Start

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # On Windows (PowerShell)
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

4. **Edit `.env` file** (optional, defaults work for development):
   ```
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```
   This will populate the database with sample places from Bangalore, Goa, Mumbai, Delhi, and Hyderabad.

6. **Start the backend server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # OR Production mode
   npm start
   ```

   The backend API will be available at `/api` when served by the backend; during development you can still use `http://localhost:3000`.

### 2. Frontend Setup

The frontend is static HTML files, so you can:

1. **Option A: Use a simple HTTP server (Recommended for development)**

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Then open `http://localhost:8000` in your browser.

2. **Option B: Open directly in browser**
   - Simply open `index.html` in your browser (some features may not work due to CORS)

3. **Option C: Use VS Code Live Server extension**
   - Install "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

## Testing the Application

### 1. Create a User Account

1. Open the frontend in your browser
2. Click "LOGIN" button
3. Click "Sign Up" link
4. Fill in the form:
   - Full Name: Your Name
   - Email: your.email@example.com
   - Password: (at least 6 characters)
   - Confirm Password: (same as password)
5. Click "Sign Up"

### 2. Login

1. After signup, you'll be redirected to the login form
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the homepage with your name displayed

### 3. Browse Places

1. On the homepage, scroll to see popular destinations
2. Click on any city card (Goa, Bangalore, Delhi, Mumbai, Hyderabad)
3. You'll see places in that city
4. Use filters to search by category

### 4. Add to Wishlist

1. Make sure you're logged in
2. Browse places in any city
3. Click the heart icon on any place card
4. The place will be added to your wishlist

## API Testing

You can test the API endpoints using:

### Using curl:

**Signup:**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Get Places:**
```bash
curl http://localhost:3000/api/places?city=Bangalore
```

**Add to Wishlist (replace TOKEN with actual token):**
```bash
curl -X POST http://localhost:3000/api/wishlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"place_id":1}'
```

### Using Postman or similar tools:

Import the endpoints from the backend README.md file.

## Troubleshooting

### Backend won't start

1. **Port already in use:**
   - Change PORT in `.env` file to a different port (e.g., 3001)
   - Update frontend API calls to use the new port

2. **Database errors:**
   - Delete `wayease.db` file in backend directory
   - Run `npm run seed` again

3. **Module not found errors:**
   - Run `npm install` again
   - Make sure you're in the backend directory

### Frontend can't connect to backend

1. **CORS errors:**
   - Make sure backend is running
   - Check that backend has CORS enabled (it should be by default)

2. **404 errors on API calls:**
   - Verify backend is running on `http://localhost:3000` (API root is `/api`)
   - Check browser console for exact error messages
   - Verify API endpoint URLs in frontend code

3. **Authentication errors:**
   - Make sure you're logged in (token exists in localStorage)
   - Check browser console for token errors
   - Try logging out and logging back in

### Database issues

1. **Empty places list:**
   - Run `npm run seed` to populate database
   - Check if `wayease.db` file exists in backend directory

2. **Can't add to wishlist:**
   - Make sure you're logged in
   - Check that the place_id exists in the database
   - Verify token is valid (not expired)

## Development Tips

1. **Backend Development:**
   - Use `npm run dev` for auto-reload on file changes
   - Check console logs for debugging
   - Database file (`wayease.db`) will be created automatically

2. **Frontend Development:**
   - Use browser DevTools (F12) to check console for errors
   - Check Network tab to see API requests/responses
   - Use Application/Storage tab to check localStorage

3. **Adding New Places:**
   - Edit `backend/scripts/seedDatabase.js`
   - Add place objects to the `places` array
   - Run `npm run seed` again

4. **Database Management:**
   - Database file: `backend/wayease.db`
   - To reset database: Delete `wayease.db` and run `npm run seed`
   - You can use SQLite browser tools to inspect the database

## Production Deployment

### Backend:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong, unique `JWT_SECRET`
3. Consider using PostgreSQL/MySQL instead of SQLite
4. Set up proper logging
5. Use environment variables for all secrets
6. Enable HTTPS
7. Set up reverse proxy (nginx)
8. Configure CORS for specific origins only

### Frontend:

1. Update API endpoint URLs to production backend URL
2. Minify HTML/CSS/JS
3. Optimize images
4. Enable HTTPS
5. Set up CDN for static assets
6. Configure proper caching headers

## Support

For issues or questions:
1. Check the backend README.md for API documentation
2. Review browser console for frontend errors
3. Check backend console logs for server errors
4. Verify all dependencies are installed correctly

## License

ISC

