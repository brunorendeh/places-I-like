// Elements
const placesGrid = document.getElementById('places-grid');
const emptyState = document.getElementById('empty-state');
const sectionTitle = document.getElementById('section-title');
const sectionCount = document.getElementById('section-count');
const detailOverlay = document.getElementById('detail-overlay');
const detailContent = document.getElementById('detail-content');
const detailClose = document.getElementById('detail-close');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const navLinks = document.querySelectorAll('.nav-link');

let places = [];
let currentFilter = 'all';
let searchQuery = '';

const categoryLabels = {
    restaurant: 'Restaurant',
    bar: 'Bar',
    cafe: 'Cafe'
};

// --- Load places from JSON file ---
async function loadPlaces() {
    try {
        const res = await fetch('places.json');
        places = await res.json();
    } catch (e) {
        places = [];
    }
    render();
}

// --- Navigation filters ---
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentFilter = link.dataset.filter;
        render();
    });
});

// --- Search ---
searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchQuery = '';
        render();
    }
});

searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase().trim();
    render();
});

// --- Detail modal ---
function openDetail(place) {
    const imageHTML = place.image
        ? `<img class="detail-image" src="${place.image}" alt="${escapeHTML(place.name)}">`
        : '';

    const tagsHTML = place.tags && place.tags.length
        ? `<div class="detail-tags">${place.tags.map(t => `<span class="detail-tag">${escapeHTML(t)}</span>`).join('')}</div>`
        : '';

    detailContent.innerHTML = `
        ${imageHTML}
        <div class="detail-body">
            <div class="detail-category">${categoryLabels[place.category] || place.category}</div>
            <h2 class="detail-title">${escapeHTML(place.name)}</h2>
            ${place.neighborhood ? `<div class="detail-location">${escapeHTML(place.neighborhood)}</div>` : ''}
            ${place.description ? `<p class="detail-description">${escapeHTML(place.description)}</p>` : ''}
            ${tagsHTML}
            ${place.maps ? `<a class="detail-maps-link" href="${escapeHTML(place.maps)}" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> View on Google Maps</a>` : ''}
        </div>
    `;

    detailOverlay.classList.add('open');
}

detailClose.addEventListener('click', () => detailOverlay.classList.remove('open'));
detailOverlay.addEventListener('click', (e) => {
    if (e.target === detailOverlay) detailOverlay.classList.remove('open');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        detailOverlay.classList.remove('open');
    }
});

// --- Render ---
function render() {
    let filtered = currentFilter === 'all'
        ? places
        : places.filter(p => p.category === currentFilter);

    if (searchQuery) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            (p.neighborhood && p.neighborhood.toLowerCase().includes(searchQuery)) ||
            (p.description && p.description.toLowerCase().includes(searchQuery)) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery)))
        );
    }

    // Update header
    const titleMap = {
        all: 'All Places',
        restaurant: 'Restaurants',
        bar: 'Bars',
        cafe: 'Cafes'
    };
    sectionTitle.textContent = titleMap[currentFilter] || 'All Places';
    sectionCount.textContent = filtered.length > 0 ? `${filtered.length} place${filtered.length !== 1 ? 's' : ''}` : '';

    // Clear cards
    placesGrid.querySelectorAll('.card').forEach(el => el.remove());

    if (filtered.length === 0 && places.length === 0) {
        emptyState.style.display = '';
    } else if (filtered.length === 0) {
        emptyState.style.display = '';
        emptyState.querySelector('.empty-text').textContent = 'No matches.';
        emptyState.querySelector('.empty-sub').textContent = 'Try a different filter or search.';
    } else {
        emptyState.style.display = 'none';
        filtered.forEach(place => {
            placesGrid.appendChild(createCard(place));
        });
    }
}

function createCard(place) {
    const card = document.createElement('article');
    card.className = 'card';

    const imageHTML = place.image
        ? `<img src="${place.image}" alt="${escapeHTML(place.name)}">`
        : `<div class="card-image-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;

    const tags = place.tags || [];
    const tagsHTML = tags.slice(0, 3).map(t => `<span class="card-tag">${escapeHTML(t)}</span>`).join('');

    card.innerHTML = `
        <div class="card-image">
            ${imageHTML}
        </div>
        <div class="card-category">${categoryLabels[place.category] || place.category}</div>
        <h3 class="card-title">${escapeHTML(place.name)}</h3>
        ${place.neighborhood ? `<p class="card-subtitle">${escapeHTML(place.neighborhood)}</p>` : ''}
        ${tagsHTML ? `<div class="card-meta">${tagsHTML}</div>` : ''}
        ${place.maps ? `<a class="card-maps-link" href="${escapeHTML(place.maps)}" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Map</a>` : ''}
        <span class="card-read-more">Read More</span>
    `;

    card.addEventListener('click', (e) => {
        if (e.target.closest('.card-maps-link')) return;
        openDetail(place);
    });

    return card;
}

// --- Helpers ---
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Load and render
loadPlaces();
