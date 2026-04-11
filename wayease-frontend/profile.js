const API_BASE =
  window.location.protocol === 'file:' ? 'http://localhost:3000/api' : `${window.location.origin}/api`;

const token = localStorage.getItem('wayease_token');

function apiOrigin() {
  return window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
}

function mediaUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return apiOrigin() + u;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function starsRow(n) {
  const r = Math.min(5, Math.max(1, parseInt(n, 10) || 5));
  let h = '';
  for (let i = 0; i < 5; i++) {
    h += `<i class="ri-star-fill ${i < r ? 'text-amber-400' : 'text-gray-600'}"></i>`;
  }
  return h;
}

const tokenRef = token;

// ✅ UPDATED TAB FUNCTION
function setTab(name) {

  // 👉 SPECIAL CASE: Virtual Diary
  if (name === 'virtual-diary') {
    window.location.href = 'virtual-diary.html';
    return;
  }

  document.querySelectorAll('.profile-tab').forEach((b) => {
    const on = b.getAttribute('data-tab') === name;
    b.classList.toggle('bg-primary', on);
    b.classList.toggle('text-white', on);
    b.classList.toggle('text-gray-500', !on);
  });

  document.querySelectorAll('.profile-panel').forEach((p) => p.classList.add('hidden'));

  const map = {
    diary: 'panel-diary',
    saved: 'panel-saved',
    trips: 'panel-trips',
    settings: 'panel-settings'
  };

  document.getElementById(map[name])?.classList.remove('hidden');
}

// 🔥 LOAD PROFILE DATA
async function loadProfile() {
  const headers = { Authorization: `Bearer ${tokenRef}` };

  const [meRes, wRes, iRes, rRes] = await Promise.all([
    fetch(`${API_BASE}/me`, { headers }),
    fetch(`${API_BASE}/wishlist`, { headers }),
    fetch(`${API_BASE}/itinerary`, { headers }),
    fetch(`${API_BASE}/places/reviews/me`, { headers })
  ]);

  const me = meRes.ok ? await meRes.json() : null;
  const wish = wRes.ok ? await wRes.json() : { wishlist: [] };
  const iti = iRes.ok ? await iRes.json() : { itineraries: [] };
  const rev = rRes.ok ? await rRes.json() : { reviews: [] };

  const name = me ? me.fullName : 'Traveler';

  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = me ? me.email : '';

  const av = document.getElementById('profile-avatar');
  if (av) av.textContent = (name.trim()[0] || '?').toUpperCase();

  document.getElementById('count-wishlist').textContent = wish.wishlist.length;
  document.getElementById('count-itinerary').textContent = iti.itineraries.length;
  document.getElementById('count-reviews').textContent = rev.reviews.length;

  // SETTINGS PREFILL
  const nameInput = document.getElementById('settings-name');
  const homeInput = document.getElementById('settings-home-city');
  const emailInput = document.getElementById('settings-email-readonly');

  if (nameInput && me) nameInput.value = me.fullName || '';
  if (emailInput && me) emailInput.value = me.email || '';
  if (homeInput && me) homeInput.value = (me.preferences && me.preferences.homeCity) || '';

  // ✅ WISHLIST
  document.getElementById('profile-wishlist').innerHTML = wish.wishlist.length
    ? wish.wishlist
        .map(
          (x) =>
            `<div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p class="font-medium text-gray-800">${esc(x.place_name)}</p>
              <p class="text-xs text-gray-500 mt-1">${esc(x.city || '')}</p>
            </div>`
        )
        .join('')
    : '<p class="text-sm text-gray-500 col-span-full">No saved places yet.</p>';

  // ✅ ITINERARIES
  document.getElementById('profile-itineraries').innerHTML = iti.itineraries.length
    ? iti.itineraries
        .map(
          (x) =>
            `<div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex justify-between items-center">
              <div>
                <p class="font-medium text-gray-800">${esc(x.title || x.city)}</p>
                <p class="text-xs text-gray-500">${x.days} days · ${esc(x.city)}</p>
              </div>
              <span class="text-xs text-gray-400">${esc((x.createdAt || '').slice(0, 10))}</span>
            </div>`
        )
        .join('')
    : '<p class="text-sm text-gray-500">No trips yet.</p>';

  // ✅ REVIEWS (DIARY)
  document.getElementById('profile-reviews').innerHTML = rev.reviews.length
    ? rev.reviews
        .map(
          (x) =>
            `<article class="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col sm:flex-row shadow-sm">
              <div class="sm:w-40 h-40 bg-gray-100">
                ${
                  x.photoUrl
                    ? `<img src="${mediaUrl(x.photoUrl)}" class="w-full h-full object-cover">`
                    : `<div class="w-full h-full flex items-center justify-center text-gray-400">📷</div>`
                }
              </div>
              <div class="p-4 flex-1">
                <div class="flex gap-2 mb-1">
                  <span class="text-amber-400">${starsRow(x.rating)}</span>
                  <span class="font-medium text-gray-800">${esc(x.placeName)}</span>
                </div>
                <p class="text-gray-600 text-sm">${esc(x.text)}</p>
              </div>
            </article>`
        )
        .join('')
    : '<p class="text-sm text-gray-500">No diary entries yet.</p>';

  // ✅ SETTINGS SAVE
  const form = document.getElementById('profile-settings-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const res = await fetch(`${API_BASE}/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenRef}`
          },
          body: JSON.stringify({
            fullName: document.getElementById('settings-name').value,
            preferences: {
              homeCity: document.getElementById('settings-home-city').value
            }
          })
        });

        if (!res.ok) throw new Error('Save failed');

        alert('Saved!');
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

// ✅ INIT
if (!tokenRef) {
  alert('Please login first.');
  window.location.href = 'login.html';
} else {
  document.querySelectorAll('.profile-tab').forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.getAttribute('data-tab')));
  });

  loadProfile().catch((e) => {
    console.error(e);
    alert('Could not load profile.');
  });
}