/**
 * Shared city explore pages: search, category filters, distance, map, pagination, trending.
 * Expects: h1 "Explore {City}", #city-page-search, header filter buttons, #category-grid,
 * #places-container, #trending-container, #distanceRange, #distanceValue, #mapToggle, #mapView, #leaflet-map, #load-more-places
 */
(function () {
  const API_BASE =
    window.WAYEASE_API ||
    (window.location.protocol === 'file:'
      ? 'http://localhost:3000/api'
      : `${window.location.origin}/api`);

  function getCityName() {
    const d = document.body && document.body.dataset.city;
    if (d) return d.trim();
    const h1 = document.querySelector('h1');
    if (h1 && /explore/i.test(h1.textContent)) {
      return h1.textContent.replace(/explore/gi, '').trim();
    }
    return 'Delhi';
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(s) {
    return esc(s).replace(/'/g, '&#39;');
  }

  function placeImgUrl(p, w, h) {
    const ww = w || 400;
    const hh = h || 400;
    if (p.image) return String(p.image);
    const seed = String(p.id || p.name).replace(/[^a-zA-Z0-9]/g, '') || 'x';
    return `https://picsum.photos/seed/${seed}/${ww}/${hh}`;
  }

  function renderPlaceCard(p) {
    const name = esc(p.name);
    const cat = esc(p.category);
    const city = esc(p.city);
    const rating = typeof p.rating === 'number' ? p.rating.toFixed(1) : '4.5';
    const dist =
      p.distanceKm != null ? `${p.distanceKm} km` : '—';
    const img = escAttr(placeImgUrl(p, 400, 400));
    const safeName = String(p.name).replace(/'/g, "\\'");
    const offer = p.offerLabel
      ? `<span class="inline-block ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[0.6rem] rounded font-semibold">${esc(p.offerLabel)}</span>`
      : '';
    return `
      <div class="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onclick="showPlaceDetails('${escAttr(p.id)}')">
        <div class="flex">
          <div class="w-24 h-24 flex-shrink-0 bg-gray-200">
            <img src="${img}" alt="${name}" class="w-full h-full object-cover object-top" onerror="this.src='https://via.placeholder.com/150'">
          </div>
          <div class="p-3 flex-1 flex flex-col justify-between">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium text-gray-800">${name}${offer}</h3>
                <span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[0.65rem] rounded-full mt-1 uppercase font-semibold">${cat}</span>
              </div>
              <button type="button" onclick="event.stopPropagation(); toggleWishlist('${escAttr(p.id)}', '${safeName}', '${city}')" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary z-10 relative">
                <i class="ri-heart-line ri-lg"></i>
              </button>
            </div>
            <div class="flex items-center mt-2 text-xs text-gray-600">
              <div class="flex text-yellow-400 mr-1">
                <i class="ri-star-fill"></i>
                <span class="text-gray-600 ml-1 font-medium">${rating}</span>
              </div>
              <span class="mx-2">•</span>
              <span class="flex items-center"><i class="ri-map-pin-line mr-1"></i> ${dist}</span>
              <span class="mx-2">•</span>
              <span class="text-green-600 font-medium">Open Now</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderFeaturedCard(p) {
    const name = esc(p.name);
    const rating = typeof p.rating === 'number' ? p.rating.toFixed(1) : '4.5';
    const dist = p.distanceKm != null ? `${p.distanceKm} km away` : esc(p.city);
    const img = escAttr(placeImgUrl(p, 400, 300));
    const pid = escAttr(p.id);
    const offer = p.offerLabel
      ? `<span class="absolute bottom-3 left-3 text-[0.65rem] font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow">${esc(p.offerLabel)}</span>`
      : '';
    return `
      <div class="featured-place-card min-w-[280px] bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer shrink-0 hover:shadow-md transition-shadow active:scale-[0.99]" role="button" tabindex="0" data-pid="${pid}">
        <div class="relative h-40">
          <img src="${img}" alt="${name}" class="w-full h-full object-cover object-top" onerror="this.src='https://via.placeholder.com/400x300'">
          ${offer}
          <div class="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm pointer-events-none">
            <div class="w-5 h-5 flex items-center justify-center text-gray-600"><i class="ri-heart-line"></i></div>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-800">${name}</h3>
          <div class="flex items-center mt-1 text-sm">
            <div class="flex text-yellow-400"><i class="ri-star-fill"></i></div>
            <span class="ml-1 text-gray-600">${rating}</span>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs text-gray-500 flex items-center"><i class="ri-map-pin-line mr-1"></i> ${dist}</span>
            <span class="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded">Open</span>
          </div>
        </div>
      </div>`;
  }

  const state = {
    city: '',
    search: '',
    categoryLabel: '',
    maxDistance: 5,
    page: 1,
    pageSize: 4,
    userLat: null,
    userLng: null,
    map: null,
    mapMarkers: [],
    displayedPlaces: [],
    hasMore: false,
    loading: false
  };

  function getFilterButtons() {
    return document.querySelectorAll('header .scrollbar-hide button');
  }

  function setActiveFilter(btn) {
    getFilterButtons().forEach((b) => {
      b.classList.remove('bg-primary', 'text-white');
      b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('bg-primary', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
  }

  async function fetchPlacesFromApi(reset) {
    if (reset) {
      state.page = 1;
    }
    const params = new URLSearchParams();
    params.set('city', state.city);
    params.set('page', String(state.page));
    params.set('page_size', String(state.pageSize));
    params.set('max_distance', String(state.maxDistance));
    if (state.search.trim()) params.set('search', state.search.trim());
    if (state.categoryLabel && state.categoryLabel.toLowerCase() !== 'all places') {
      params.set('category', state.categoryLabel);
    }
    if (state.userLat != null && state.userLng != null) {
      params.set('user_lat', String(state.userLat));
      params.set('user_lng', String(state.userLng));
    }

    const res = await fetch(`${API_BASE}/places?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load places');
    return res.json();
  }

  async function fetchTrending() {
    const params = new URLSearchParams();
    params.set('city', state.city);
    params.set('sort', 'trending');
    params.set('limit', '8');
    if (state.userLat != null && state.userLng != null) {
      params.set('user_lat', String(state.userLat));
      params.set('user_lng', String(state.userLng));
    }
    const res = await fetch(`${API_BASE}/places?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.places || [];
  }

  function updateMap(places) {
    if (!state.map || !window.L) return;
    state.mapMarkers.forEach((m) => state.map.removeLayer(m));
    state.mapMarkers = [];
    places.forEach((p) => {
      if (p.lat == null || p.lng == null) return;
      const m = L.marker([p.lat, p.lng]).addTo(state.map).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.category)}`);
      state.mapMarkers.push(m);
    });
    if (state.mapMarkers.length) {
      const group = L.featureGroup(state.mapMarkers);
      state.map.fitBounds(group.getBounds().pad(0.12));
    }
  }

  function ensureMapInitialized() {
    const el = document.getElementById('leaflet-map');
    if (!el || !window.L || state.map) return;
    let centerLat = 28.6139;
    let centerLng = 77.209;
    const c = state.city.toLowerCase();
    if (c.includes('bangalore')) {
      centerLat = 12.9716;
      centerLng = 77.5946;
    } else if (c.includes('mumbai')) {
      centerLat = 19.076;
      centerLng = 72.8777;
    } else if (c.includes('goa')) {
      centerLat = 15.4989;
      centerLng = 73.8278;
    } else if (c.includes('hyderabad')) {
      centerLat = 17.385;
      centerLng = 78.4867;
    }
    if (state.userLat != null && state.userLng != null) {
      centerLat = state.userLat;
      centerLng = state.userLng;
    }
    state.map = L.map('leaflet-map').setView([centerLat, centerLng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(state.map);
    setTimeout(() => state.map.invalidateSize(), 200);
  }

  async function loadPlaces(reset) {
    const container = document.getElementById('places-container');
    if (!container || state.loading) return;
    state.loading = true;
    if (reset) {
      container.innerHTML = '<div class="text-center py-6 text-gray-500">Loading places…</div>';
    }
    try {
      if (reset) {
        state.displayedPlaces = [];
        state.page = 1;
      }
      const data = await fetchPlacesFromApi(reset);
      const chunk = data.places || [];
      state.hasMore = !!data.hasMore;
      const loadBtn = document.getElementById('load-more-places');
      if (reset) {
        state.displayedPlaces = chunk;
        container.innerHTML = chunk.length
          ? chunk.map(renderPlaceCard).join('')
          : '<div class="text-center py-6 text-gray-500">No places match your filters.</div>';
      } else {
        if (!chunk.length) {
          state.hasMore = false;
          if (loadBtn) loadBtn.classList.add('hidden');
          return;
        }
        state.displayedPlaces = state.displayedPlaces.concat(chunk);
        container.innerHTML = state.displayedPlaces.map(renderPlaceCard).join('');
      }
      if (loadBtn) loadBtn.classList.toggle('hidden', !state.hasMore);
      updateMap(state.displayedPlaces);
    } catch (e) {
      console.error(e);
      container.innerHTML =
        '<div class="text-center py-6 text-red-500">Could not load places. Is the server running on port 3000?</div>';
    } finally {
      state.loading = false;
    }
  }

  async function loadTrendingSection() {
    const el = document.getElementById('trending-container');
    if (!el) return;
    el.innerHTML = '<div class="text-center py-4 text-gray-500">Loading…</div>';
    try {
      const places = await fetchTrending();
      el.innerHTML = places.length
        ? places.map(renderPlaceCard).join('')
        : '<div class="text-center py-4 text-gray-500">No trending places yet.</div>';
    } catch (e) {
      console.error(e);
      el.innerHTML = '<div class="text-center py-4 text-red-500">Could not load trending.</div>';
    }
  }

  function wireFeaturedCarousel(container) {
    if (!container) return;
    container.querySelectorAll('.featured-place-card').forEach((card) => {
      const open = () => {
        const id = card.getAttribute('data-pid');
        if (id && typeof window.showPlaceDetails === 'function') window.showPlaceDetails(id);
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  async function loadFeaturedCarousel() {
    const el = document.getElementById('featured-carousel');
    if (!el) return;
    try {
      const params = new URLSearchParams();
      params.set('city', state.city);
      params.set('sort', 'trending');
      params.set('limit', '6');
      if (state.userLat != null && state.userLng != null) {
        params.set('user_lat', String(state.userLat));
        params.set('user_lng', String(state.userLng));
      }
      const res = await fetch(`${API_BASE}/places?${params.toString()}`);
      const data = await res.json();
      const places = data.places || [];
      el.innerHTML = '';
      if (places.length) {
        const inner = document.createElement('div');
        inner.className = 'flex space-x-4 overflow-x-auto scrollbar-hide pb-4';
        inner.innerHTML = places.slice(0, 6).map(renderFeaturedCard).join('');
        el.appendChild(inner);
        wireFeaturedCarousel(inner);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function ensureExtraCategoryPanel() {
    let panel = document.getElementById('extra-category-panel');
    if (panel) return panel;
    const grid = document.getElementById('category-grid');
    if (!grid || !grid.parentNode) return null;
    panel = document.createElement('div');
    panel.id = 'extra-category-panel';
    panel.className = 'mt-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100';
    panel.innerHTML =
      '<p class="text-sm font-medium text-gray-700 mb-2">More categories in this city</p><div id="extra-category-chips" class="flex flex-wrap gap-2"></div>';
    grid.parentNode.insertBefore(panel, grid.nextSibling);
    return panel;
  }

  async function showExtraCategories() {
    const panel = ensureExtraCategoryPanel();
    const wrap = document.getElementById('extra-category-chips');
    if (!panel || !wrap) return;
    panel.classList.remove('hidden');
    try {
      const res = await fetch(`${API_BASE}/places/categories/list?city=${encodeURIComponent(state.city)}`);
      const data = await res.json();
      const cats = data.categories || [];
      wrap.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" class="extra-cat-chip px-3 py-1.5 bg-gray-100 hover:bg-primary/20 rounded-full text-xs text-gray-700">${esc(
              c
            )}</button>`
        )
        .join('');
      wrap.querySelectorAll('.extra-cat-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.categoryLabel = btn.textContent.trim();
          state.search = '';
          const searchEl = document.getElementById('city-page-search');
          if (searchEl) searchEl.value = '';
          const match = Array.from(getFilterButtons()).find(
            (b) => b.textContent.trim().toLowerCase() === 'all places'
          );
          if (match) setActiveFilter(match);
          loadPlaces(true);
          document.getElementById('places-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    } catch (e) {
      wrap.innerHTML = '<span class="text-sm text-gray-500">Could not load categories.</span>';
    }
  }

  function wireCategoryGrid() {
    document.querySelectorAll('#category-grid .bg-white').forEach((card) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const label = card.querySelector('span')?.textContent?.trim() || '';
        const lower = label.toLowerCase();
        if (lower === 'more') {
          showExtraCategories();
          return;
        }
        state.categoryLabel = label;
        state.search = '';
        const searchEl = document.getElementById('city-page-search');
        if (searchEl) searchEl.value = '';
        const allBtn = Array.from(getFilterButtons()).find((b) => b.textContent.trim().toLowerCase() === 'all places');
        if (allBtn) setActiveFilter(allBtn);
        loadPlaces(true);
        document.getElementById('places-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function wireFilters() {
    getFilterButtons().forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveFilter(btn);
        state.categoryLabel = btn.textContent.trim();
        loadPlaces(true);
      });
    });
  }

  let searchTimer;
  function wireSearch() {
    const el = document.getElementById('city-page-search');
    if (!el) return;
    el.addEventListener('input', () => {
      state.search = el.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadPlaces(true), 280);
    });
  }

  function wireDistance() {
    const range = document.getElementById('distanceRange');
    const label = document.getElementById('distanceValue');
    if (!range) return;
    range.addEventListener('input', () => {
      state.maxDistance = parseInt(range.value, 10) || 5;
      if (label) label.textContent = state.maxDistance + ' km';
      loadPlaces(true);
    });
  }

  function wireLoadMore() {
    const btn = document.getElementById('load-more-places');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!state.hasMore || state.loading) return;
      state.page += 1;
      loadPlaces(false);
    });
  }

  function wireMapToggle() {
    const toggle = document.getElementById('mapToggle');
    const mapView = document.getElementById('mapView');
    if (!toggle || !mapView) return;
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        mapView.classList.remove('hidden');
        ensureMapInitialized();
        setTimeout(() => {
          if (state.map) {
            state.map.invalidateSize();
            updateMap(state.displayedPlaces);
          }
        }, 350);
      } else {
        mapView.classList.add('hidden');
      }
    });
  }

  function updateGeoNote(hasPrecise) {
    const range = document.getElementById('distanceRange');
    let note = document.getElementById('geo-distance-note');
    if (!range || !range.parentElement) return;
    if (!note) {
      note = document.createElement('p');
      note.id = 'geo-distance-note';
      note.className = 'text-xs text-gray-500 mt-2';
      range.parentElement.appendChild(note);
    }
    note.textContent = hasPrecise
      ? 'Distances use your current location (browser GPS).'
      : 'Allow location for distances from you; otherwise the city center is used.';
  }

  function getGeoPosition() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  async function init() {
    const container = document.getElementById('places-container');
    if (!container) return;

    state.city = getCityName();
    const range = document.getElementById('distanceRange');
    if (range) state.maxDistance = parseInt(range.value, 10) || 5;

    wireSearch();
    wireFilters();
    wireCategoryGrid();
    wireDistance();
    wireLoadMore();
    wireMapToggle();

    const geo = await getGeoPosition();
    if (geo) {
      state.userLat = geo.lat;
      state.userLng = geo.lng;
      updateGeoNote(true);
    } else {
      updateGeoNote(false);
    }

    loadFeaturedCarousel();
    await loadPlaces(true);
    loadTrendingSection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
