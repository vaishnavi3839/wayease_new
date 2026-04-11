const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : `${window.location.origin}/api`;
window.WAYEASE_API = API_BASE;

let token = localStorage.getItem('wayease_token');
let currentUser = null;
const plannerState = {
  location: '',
  days: 2,
  dateLabel: 'Selected Date',
  timeFrom: '8:00 AM',
  timeTo: '7:00 PM',
  preferredTime: 'Morning'
};
window.lastItineraryId = null;

function apiOrigin() {
  return window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
}

function mediaUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return apiOrigin() + u;
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function placeImgForCard(p) {
  if (p.image) return String(p.image);
  const seed = String(p.id || p.name).replace(/[^a-zA-Z0-9]/g, '') || 'x';
  return `https://picsum.photos/seed/${seed}/400/400`;
}

function safeAttrUrl(u) {
  return String(u).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

async function hydrateUser() {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    currentUser = await res.json();
    const loginBtn = document.getElementById('login-button-container');
    const welcome = document.getElementById('welcome-message-container');
    const username = document.getElementById('navbar-username');
    if (loginBtn) loginBtn.style.display = 'none';
    if (welcome) {
      welcome.classList.remove('hidden');
      welcome.style.display = 'flex';
    }
    if (username) {
      username.textContent = `Hi, ${currentUser.fullName}`;
      username.style.cursor = 'pointer';
      username.onclick = () => (window.location.href = 'profile.html');
    }
  } catch (e) {
    console.error(e);
  }
}

function setupExploreButton() {
  const btn = document.getElementById('btn-explore-home');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const section =
      document.getElementById('home-destinations') ||
      document.querySelector('.parallax-container') ||
      document.getElementById('planner-search-city');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

async function setupHomeNotifications() {
  const el = document.getElementById('home-notifications-strip');
  if (!el) return;
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    const data = await res.json();
    const items = data.notifications || [];
    if (!items.length) {
      el.closest('#home-notifications-wrap')?.classList.add('hidden');
      return;
    }
    el.innerHTML = `<div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">${items
      .slice(0, 10)
      .map(
        (n) =>
          `<button type="button" class="snap-start flex-shrink-0 w-[min(240px,85vw)] text-left px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-primary hover:shadow transition text-left" data-nplace="${n.placeId ? safeAttrUrl(n.placeId) : ''}">
            <span class="text-[0.65rem] font-bold uppercase tracking-wide text-primary">${esc(n.type || 'update')}</span>
            <span class="font-semibold text-gray-900 block text-sm mt-0.5 leading-snug">${esc(n.title)}</span>
            <span class="text-gray-500 text-xs mt-1 line-clamp-2">${esc(n.body)}</span>
          </button>`
      )
      .join('')}</div>`;
    el.querySelectorAll('button[data-nplace]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-nplace');
        if (pid) showPlaceDetails(pid);
      });
    });
  } catch (e) {
    el.closest('#home-notifications-wrap')?.classList.add('hidden');
  }
}

function setupPlannerControls() {
  const sel = document.getElementById('planner-city-select');
  const label = document.getElementById('planner-city-label');
  if (sel) {
    plannerState.location = sel.value || 'Bangalore';
    if (label) label.textContent = plannerState.location;
    sel.addEventListener('change', () => {
      plannerState.location = sel.value;
      if (label) label.textContent = sel.value;
      const searchInp = document.getElementById('planner-search-city');
      if (searchInp && !searchInp.value.trim()) searchInp.placeholder = `Search in ${sel.value}…`;
    });
  }
}

function syncPlannerFromDom() {
  const citySel = document.getElementById('planner-city-select');
  if (citySel && citySel.value) plannerState.location = citySel.value;
  const df = document.getElementById('planner-time-from');
  const dt = document.getElementById('planner-time-to');
  const dateEl = document.getElementById('planner-trip-date');
  if (df) plannerState.timeFrom = df.value;
  if (dt) plannerState.timeTo = dt.value;
  if (dateEl && dateEl.value) {
    const d = new Date(`${dateEl.value}T12:00:00`);
    plannerState.dateLabel = d.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

function setupPlannerTripUi() {
  const dateEl = document.getElementById('planner-trip-date');
  if (dateEl && !dateEl.value) {
    const t = new Date();
    dateEl.value = t.toISOString().slice(0, 10);
    plannerState.dateLabel = t.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  document.querySelectorAll('.planner-day-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const d = parseInt(chip.getAttribute('data-days'), 10) || 2;
      plannerState.days = d;
      document.querySelectorAll('.planner-day-chip').forEach((c) => {
        c.classList.remove('bg-primary/10', 'border-primary');
        c.classList.add('border-gray-200');
      });
      chip.classList.add('bg-primary/10', 'border-primary');
      chip.classList.remove('border-gray-200');
    });
  });

  document.querySelectorAll('.planner-pref-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      plannerState.preferredTime = chip.getAttribute('data-pref') || 'Morning';
      document.querySelectorAll('.planner-pref-chip').forEach((c) => {
        c.classList.remove('bg-primary/10');
      });
      chip.classList.add('bg-primary/10');
    });
  });

  const apply = document.getElementById('planner-apply-trip');
  if (apply) {
    apply.addEventListener('click', () => {
      syncPlannerFromDom();
      const pill = document.querySelector('#timeDropdownBtn .bg-primary\\/10');
      if (pill) pill.textContent = plannerState.dateLabel.slice(0, 12) + (plannerState.days > 1 ? ` · ${plannerState.days}d` : '');
    });
  }
}

function renderPerfectDayPlan(doc) {
  const root = document.getElementById('day-plan-timeline');
  if (!root) return;
  const days = doc.itinerary || [];
  if (!days.length) {
    root.innerHTML =
      '<div class="p-8 text-center text-gray-500 text-sm">No activities in this plan.</div>';
    return;
  }
  const rows = [];
  days.forEach((d) => {
    rows.push(
      `<div class="px-4 py-2 bg-primary/10 text-xs font-bold text-primary uppercase tracking-wide">Day ${d.day} — ${esc(
        d.theme || 'Your trip'
      )}</div>`
    );
    (d.activities || []).forEach((a) => {
      rows.push(`<div class="flex flex-col sm:flex-row p-4 hover:bg-primary/5 transition-colors gap-2 sm:gap-4 border-b border-gray-50 last:border-0">
        <div class="w-full sm:w-36 text-sm text-primary font-semibold flex-shrink-0">${esc(a.time || '')}</div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900">${esc(a.place || '')}</p>
          <p class="text-sm text-gray-600 mt-0.5">${esc(a.activity || '')}</p>
          ${
            a.description
              ? `<p class="text-xs text-gray-500 mt-1">${esc(a.description)}</p>`
              : ''
          }
        </div>
      </div>`);
    });
  });
  root.innerHTML = rows.join('');
}

async function runDownloadPdf() {
  if (!token) {
    alert('Please login to download your itinerary PDF.');
    return;
  }
  if (!window.lastItineraryId) {
    alert('Generate an itinerary first, then download.');
    return;
  }
  try {
    const res = await fetch(`${apiOrigin()}/api/download/${window.lastItineraryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Download failed');
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `WayEase-itinerary-${window.lastItineraryId.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    alert(e.message || 'Could not download PDF.');
  }
}

function setupDownloadButtons() {
  const bind = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      if (window.lastItineraryId) {
        await runDownloadPdf();
        return;
      }
      const container = document.getElementById('editable-planner-container');
      if (container && window.html2pdf) {
        window
          .html2pdf()
          .set({
            margin: 10,
            filename: 'wayease-planner.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(container)
          .save();
        return;
      }
      alert('Generate an itinerary while logged in to download the official PDF.');
    });
  };
  bind('btn-download-planner');
  bind('btn-download-day-plan');
}

function displaySearchResults(places, title = 'Search Results') {
  const c = document.getElementById('index-search-results');
  const list = document.getElementById('index-search-results-list');
  if (!c || !list) return;
  c.classList.remove('hidden');
  const h = c.querySelector('h3');
  if (h) h.textContent = title;
  if (!places.length) {
    list.innerHTML =
      '<div class="text-gray-500 py-4 text-center border rounded">No places found.</div>';
    return;
  }
  list.innerHTML = places
    .map(
      (p) =>
        `<div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onclick="showPlaceDetails('${esc(
          p.id
        )}')"><div class="flex"><div class="w-32 h-32 flex-shrink-0 bg-gray-200"><img src="${safeAttrUrl(
          placeImgForCard(p)
        )}" alt="" class="w-full h-full object-cover object-center" loading="lazy"></div><div class="p-4 flex-1"><h3 class="text-lg font-medium">${esc(
          p.name
        )}</h3><p class="text-sm text-gray-500">${esc(p.city)} • ${esc(p.category)}</p></div></div></div>`
    )
    .join('');
}

function setupSearch() {
  const input = document.getElementById('planner-search-city');
  if (!input) return;
  const run = async () => {
    const q = input.value.trim();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (plannerState.location) params.set('city', plannerState.location);
    const res = await fetch(`${API_BASE}/places?${params.toString()}`);
    const data = await res.json();
    displaySearchResults(data.places || [], q ? `Places matching "${q}"` : 'Search Results');
  };
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') run();
  });
}

function setupPlanner() {
  const btn = document.getElementById('btn-generate-planner');
  if (!btn) return;
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!token) return alert('Please login to create itinerary');
    syncPlannerFromDom();
    const city =
      document.getElementById('planner-search-city')?.value.trim() ||
      plannerState.location ||
      'Bangalore';
    btn.textContent = 'GENERATING...';
    try {
      const res = await fetch(`${API_BASE}/itinerary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          city,
          days: plannerState.days,
          startDate: plannerState.dateLabel,
          timeFrom: plannerState.timeFrom,
          timeTo: plannerState.timeTo,
          preferredTime: plannerState.preferredTime,
          preferences: []
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const it = data.itinerary;
      window.lastItineraryId = it.id;
      renderPerfectDayPlan(it);

      const pName = document.getElementById('planner-name');
      const pDest = document.getElementById('planner-destination');
      const pDate = document.getElementById('planner-datetime');
      const pActs = document.getElementById('planner-activities');
      const pBudget = document.getElementById('planner-budget');
      if (pName) pName.value = `${currentUser?.fullName || 'Traveler'}'s Trip`;
      if (pDest) pDest.value = it.city;
      if (pDate) pDate.value = `${plannerState.dateLabel} · ${plannerState.days} day(s) · ${plannerState.timeFrom}–${plannerState.timeTo}`;
      if (pActs) {
        pActs.value = it.itinerary
          .map((d) =>
            (d.activities || [])
              .map((a) => `[${a.time}] ${a.place}: ${a.activity}`)
              .join('\n')
          )
          .join('\n\n');
      }
      if (pBudget) pBudget.value = it.estimatedBudget;
    } catch (err) {
      alert(err.message);
    } finally {
      btn.textContent = 'GET YOUR ITINERARY NOW';
    }
  });
}

window.toggleWishlist = async (placeId, placeName, city) => {
  if (!token) return alert('Please login');
  const res = await fetch(`${API_BASE}/wishlist/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ place_id: placeId, place_name: placeName, city })
  });
  if (res.ok) return alert('Added to wishlist');
  if (res.status === 409) {
    await fetch(`${API_BASE}/wishlist/remove/${placeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return alert('Removed from wishlist');
  }
};

function starsHtml(n) {
  const r = Math.min(5, Math.max(1, parseInt(n, 10) || 5));
  return `${'<i class="ri-star-fill text-amber-400"></i>'.repeat(r)}${'<i class="ri-star-line text-gray-300"></i>'.repeat(5 - r)}`;
}

window.showPlaceDetails = async (placeId) => {
  const res = await fetch(`${API_BASE}/places/${placeId}`);
  if (!res.ok) return alert('Place not found');
  const data = await res.json();
  const place = data.place;
  const reviews = data.reviews || [];
  const cover = mediaUrl(place.image) || placeImgForCard(place);

  let modal = document.getElementById('we-place-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'we-place-modal';
    modal.className = 'fixed inset-0 bg-black/70 z-[300] flex items-center justify-center p-4';
    document.body.appendChild(modal);
  }

  const reviewBlocks = reviews.length
    ? reviews
        .map(
          (r) => `<div class='border border-gray-100 rounded-lg p-3 bg-gray-50/80'>
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class='font-semibold text-gray-900'>${esc(r.userName || 'Traveler')}</span>
          <span class="text-amber-400 text-sm">${starsHtml(r.rating)}</span>
        </div>
        ${r.title ? `<p class="text-sm font-medium text-primary mb-1">${esc(r.title)}</p>` : ''}
        <p class="text-sm text-gray-700 whitespace-pre-wrap">${esc(r.text)}</p>
        ${
          r.photoUrl
            ? `<img src="${safeAttrUrl(mediaUrl(r.photoUrl))}" class="mt-2 w-full max-h-48 object-cover rounded-lg border border-gray-200" alt="">`
            : ''
        }
        <p class="text-[0.65rem] text-gray-400 mt-2">${esc((r.createdAt || '').slice(0, 10))}</p>
      </div>`
        )
        .join('')
    : '<p class="text-sm text-gray-500">No diary entries yet — be the first to log this place.</p>';

  const offerBanner = place.offerLabel
    ? `<div class="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 font-medium flex items-center gap-2"><i class="ri-price-tag-3-line text-lg"></i><span>${esc(place.offerLabel)}</span></div>`
    : '';
  const defaultBook = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.city}`)}`;
  const bookHref = place.bookUrl || defaultBook;

  modal.innerHTML = `<div class="bg-white rounded-xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] shadow-2xl">
    <div class="md:w-2/5 min-h-[220px] bg-gray-200 relative">
      <img src="${safeAttrUrl(cover)}" class="absolute inset-0 w-full h-full object-cover" alt="">
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
    </div>
    <div class="md:w-3/5 p-5 overflow-y-auto max-h-[90vh]">
      <div class="flex justify-between items-start gap-2 mb-2">
        <div>
          <h2 class="text-xl font-bold text-gray-900">${esc(place.name)}</h2>
          <p class="text-sm text-gray-500">${esc(place.city)} · ${esc(place.category || place.type || '')}</p>
        </div>
        <button type="button" class="text-2xl leading-none text-gray-500 hover:text-gray-800" onclick="document.getElementById('we-place-modal').remove()" aria-label="Close">&times;</button>
      </div>
      ${offerBanner}
      <div class="flex flex-wrap gap-2 mb-4">
        <a href="${safeAttrUrl(bookHref)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-gray-900 text-sm font-semibold hover:opacity-95"><i class="ri-map-pin-user-line"></i> Maps & booking</a>
        <button type="button" id="we-btn-reserve" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/10">Request reservation</button>
      </div>
      <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Community reviews (${reviews.length})</p>
      <div class="space-y-2 mb-4 max-h-56 md:max-h-72 overflow-y-auto pr-1">${reviewBlocks}</div>
      <div class="border-t border-gray-100 pt-4">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Log entry</p>
        <form id="we-review-form" class="space-y-3">
          <input type="hidden" id="review-rating-hidden" value="5">
          <div class="flex items-center gap-1" id="review-star-row" role="group" aria-label="Rating">
            ${[1, 2, 3, 4, 5]
              .map(
                (i) =>
                  `<button type="button" class="we-star text-2xl text-amber-400 focus:outline-none" data-val="${i}" aria-label="${i} stars"><i class="ri-star-fill"></i></button>`
              )
              .join('')}
          </div>
          <input id="review-title" class="border border-gray-200 rounded-lg w-full px-3 py-2 text-sm" placeholder="Headline (optional)" maxlength="200">
          <textarea id="review-text" class="border border-gray-200 rounded-lg w-full px-3 py-2 text-sm min-h-[100px]" placeholder="Write your diary-style review…" required></textarea>
          <div>
            <label class="text-xs text-gray-600 block mb-1">Photo from your visit</label>
            <input type="file" id="review-photo-file" accept="image/*" class="text-sm w-full">
            <div id="review-photo-preview" class="mt-2 hidden"><img class="max-h-36 rounded-lg border border-gray-200" alt="Preview"></div>
          </div>
          <p class="text-[0.7rem] text-gray-400">Optional: paste image URL if you prefer not to upload.</p>
          <input id="review-photo-url" class="border border-gray-200 rounded-lg w-full px-3 py-2 text-sm" placeholder="https://… (optional)">
          <button type="submit" class="w-full bg-[#87cfbe] text-white py-2.5 rounded-lg font-medium hover:opacity-95">Post to diary</button>
        </form>
      </div>
    </div>
  </div>`;

  modal.style.display = 'flex';
  const form = document.getElementById('we-review-form');
  const hiddenR = document.getElementById('review-rating-hidden');
  modal.querySelectorAll('.we-star').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = parseInt(btn.getAttribute('data-val'), 10);
      if (hiddenR) hiddenR.value = String(v);
      modal.querySelectorAll('.we-star').forEach((b, idx) => {
        b.classList.toggle('text-amber-400', idx < v);
        b.classList.toggle('text-gray-300', idx >= v);
      });
    });
  });

  const fileIn = document.getElementById('review-photo-file');
  const prev = document.getElementById('review-photo-preview');
  const prevImg = prev && prev.querySelector('img');
  if (fileIn && prev && prevImg) {
    fileIn.addEventListener('change', () => {
      const f = fileIn.files && fileIn.files[0];
      if (!f) {
        prev.classList.add('hidden');
        return;
      }
      prevImg.src = URL.createObjectURL(f);
      prev.classList.remove('hidden');
    });
  }

  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      window.submitReview(ev, place.id);
    });
  }

  const resBtn = document.getElementById('we-btn-reserve');
  if (resBtn) {
    resBtn.addEventListener('click', () => window.requestReservation(place.id, place.name));
  }
};

window.requestReservation = async (placeId, placeName) => {
  if (!token) {
    alert('Please login to request a reservation.');
    window.location.href = 'login.html';
    return;
  }
  const date = window.prompt(`Request table at ${placeName}\nPreferred date (YYYY-MM-DD)`, new Date().toISOString().slice(0, 10));
  if (!date) return;
  const partySize = window.prompt('Party size', '2');
  if (partySize == null) return;
  const note = window.prompt('Note for the venue (optional)', '') || '';
  try {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ placeId, date, partySize, note })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    alert(data.message || 'Reservation request saved.');
  } catch (e) {
    alert(e.message);
  }
};

window.submitReview = async (e, placeId) => {
  e.preventDefault();
  if (!token) return alert('Please login');
  const rating = document.getElementById('review-rating-hidden')?.value || '5';
  const title = document.getElementById('review-title')?.value?.trim() || '';
  const text = document.getElementById('review-text')?.value?.trim();
  const photoUrl = document.getElementById('review-photo-url')?.value?.trim();
  const fileIn = document.getElementById('review-photo-file');
  const file = fileIn && fileIn.files && fileIn.files[0];
  if (!text) return alert('Write your review');

  let photoBase64 = null;
  if (file) {
    photoBase64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  const res = await fetch(`${API_BASE}/places/${placeId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, text, title, photoUrl: photoUrl || undefined, photoBase64 })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return alert(err.error || 'Failed to add review');
  }
  document.getElementById('we-place-modal')?.remove();
  showPlaceDetails(placeId);
};

function setupViewAllCards() {
  const h1 = document.querySelector('h1');
  if (!h1 || !/all\s+.*places/i.test(h1.textContent)) return;
  const city = (h1.textContent.match(/All\s+([A-Za-z]+)/i)?.[1] || '').trim();
  if (!city) return;
  document.querySelectorAll('h3').forEach((title) => {
    const card = title.closest('.bg-white');
    if (!card) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', async (e) => {
      if (e.target.closest('a,button')) return;
      const name = title.textContent.trim();
      const r = await fetch(
        `${API_BASE}/places?city=${encodeURIComponent(city)}&search=${encodeURIComponent(name)}&limit=1`
      );
      const d = await r.json();
      const p = (d.places || [])[0];
      if (p) showPlaceDetails(p.id);
    });
  });
}

function logout() {
  localStorage.removeItem('wayease_token');
  window.location.reload();
}
window.logout = logout;

window.addEventListener('DOMContentLoaded', async () => {
  await hydrateUser();
  setupExploreButton();
  setupPlannerControls();
  setupPlannerTripUi();
  setupSearch();
  setupPlanner();
  setupDownloadButtons();
  setupViewAllCards();
  setupHomeNotifications();
});
