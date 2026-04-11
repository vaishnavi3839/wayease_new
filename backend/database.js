const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'wayease.json'));
const db = low(adapter);

db.defaults({ users: [], wishlists: [], itineraries: [], reviews: [], reservations: [] }).write();

module.exports = db;
