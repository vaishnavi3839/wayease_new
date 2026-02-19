const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'wayease.db');

// Create and initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Ensure table creation and index creation run sequentially
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      }
    });

    // Places table
    db.run(`CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placeName TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      description TEXT,
      category TEXT,
      rating REAL DEFAULT 4.5,
      reviewCount INTEGER DEFAULT 0,
      imageUrl TEXT,
      latitude REAL,
      longitude REAL,
      distance REAL,
      openingHours TEXT,
      entryFee TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating places table:', err.message);
      }
    });

    // Wishlist table
    db.run(`CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      placeId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE CASCADE,
      UNIQUE(userId, placeId)
    )`, (err) => {
      if (err) {
        console.error('Error creating wishlist table:', err.message);
      }
    });

    // Create indexes for better performance (run after tables are created)
    db.run(`CREATE INDEX IF NOT EXISTS idx_places_city ON places(city)`, (err) => {
      if (err) console.error('Error creating index idx_places_city:', err.message);
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_places_category ON places(category)`, (err) => {
      if (err) console.error('Error creating index idx_places_category:', err.message);
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(userId)`, (err) => {
      if (err) console.error('Error creating index idx_wishlist_user:', err.message);
    });
  });
}

// Promisify database methods for easier async/await usage
db.promisify = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = db;

