const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync(path.join(__dirname, 'wayease-frontend', 'index.html'), 'utf8');
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

console.log('--- Checking DOM Elements Expected by app.js ---');
console.log('login-button-container:', !!document.getElementById('login-button-container'));
console.log('welcome-message-container:', !!document.getElementById('welcome-message-container'));
console.log('navbar-username:', !!document.getElementById('navbar-username'));
console.log('planner-search-city:', !!document.getElementById('planner-search-city'));
console.log('btn-generate-planner:', !!document.getElementById('btn-generate-planner'));
console.log('btn-download-planner:', !!document.getElementById('btn-download-planner'));
console.log('index-search-results:', !!document.getElementById('index-search-results'));

const plannerBtn = document.getElementById('btn-generate-planner');
if(plannerBtn) {
  console.log('Planner Btn outerHTML:', plannerBtn.outerHTML);
} else {
  console.log('ERROR: Planner btn not found!');
  // Lets do a generic text search in HTML for GET YOUR ITINERARY NOW
  const idx = htmlContent.indexOf('GET YOUR ITINERARY NOW');
  console.log('String found at idx:', idx);
  if(idx > -1) {
    console.log('Snippet around string:', htmlContent.substring(Math.max(0, idx - 150), idx + 100));
  }
}
