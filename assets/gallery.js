const grid = document.getElementById('gallery-grid');
const emptyState = document.getElementById('gallery-empty');
const titleEl = document.getElementById('gallery-title');
const subtitleEl = document.getElementById('gallery-subtitle');
const countChip = document.getElementById('image-count-chip');
const searchInput = document.getElementById('gallery-search');
const filterAllBtn = document.getElementById('filter-all');
const filterFavBtn = document.getElementById('filter-favorites');
const themeToggle = document.getElementById('theme-toggle');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let galleryConfig = null;
let currentGallery = null;
let filteredImages = [];
let currentIndex = 0;
let showFavoritesOnly = false;
let favoriteIds = new Set();

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('wbg_theme', isDark ? 'dark' : 'light');
  if (themeToggle) themeToggle.textContent = isDark ? 'Hell' : 'Dunkel';
}

function initTheme() {
  const saved = localStorage.getItem('wbg_theme') || 'light';
  applyTheme(saved);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(next);
    });
  }
}

function normalize(text) {
  return String(text || '').toLowerCase();
}

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return new URL(url, window.location.href).href;
}

function buildThumbUrl(url, width = 520, height = 390) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const transform = `c_fill,w_${width},h_${height},q_auto,f_auto`;
  return url.replace(/\/upload\/([^/]+\/)?/, `/upload/${transform}/`);
}

function loadFavorites(galleryId) {
  try {
    const raw = localStorage.getItem(`wbg_likes:${galleryId}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (_) {
    return new Set();
  }
}

function saveFavorites(galleryId) {
  try {
    localStorage.setItem(`wbg_likes:${galleryId}`, JSON.stringify(Array.from(favoriteIds)));
  } catch (_) {}
}

function renderImages(images = []) {
  grid.innerHTML = '';
  filteredImages = images;
  countChip.textContent = `${images.length} Bilder`;

  if (!images.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const baseSrc = resolveUrl(img.thumbnailUrl || img.url);
    const src = buildThumbUrl(baseSrc);
    const imgId = img.id || img.publicId || img.name || String(idx);
    const isFav = favoriteIds.has(imgId);
    item.innerHTML = `
      <img src="${src}" alt="${img.name || 'Bild'}" loading="lazy" decoding="async">
      <button class="like-btn${isFav ? ' active' : ''}" aria-label="Favorit">${isFav ? '♥' : '♡'}</button>
    `;
    const likeBtn = item.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (favoriteIds.has(imgId)) {
          favoriteIds.delete(imgId);
        } else {
          favoriteIds.add(imgId);
        }
        saveFavorites(currentGallery?.id || 'default');
        applySearch();
      });
    }
    item.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(item);
  });
}

function applySearch() {
  if (!currentGallery) return;
  const query = normalize(searchInput.value);
  let result = (currentGallery.images || []).slice();
  if (showFavoritesOnly) {
    result = result.filter((img, idx) => {
      const imgId = img.id || img.publicId || img.name || String(idx);
      return favoriteIds.has(imgId);
    });
  }
  if (query) {
    result = result.filter((img) => {
    return normalize(img.name).includes(query) || normalize(img.id).includes(query);
    });
  }
  renderImages(result);
}

function openLightbox(idx) {
  if (!filteredImages.length) return;
  currentIndex = idx;
  const img = filteredImages[currentIndex];
  const src = resolveUrl(img.url || img.thumbnailUrl);
  lightboxImg.src = src;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(step) {
  if (!filteredImages.length) return;
  currentIndex = (currentIndex + step + filteredImages.length) % filteredImages.length;
  const img = filteredImages[currentIndex];
  lightboxImg.src = resolveUrl(img.url || img.thumbnailUrl);
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

searchInput.addEventListener('input', applySearch);

async function init() {
  try {
    const res = await fetch('./gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('gallery.json konnte nicht geladen werden');
    galleryConfig = await res.json();
    const id = getParam('id');
    currentGallery = (galleryConfig.galleries || []).find((g) => g.id === id) || (galleryConfig.galleries || [])[0];
    if (!currentGallery) throw new Error('Keine Galerie gefunden');

    titleEl.textContent = currentGallery.name || 'Galerie';
    subtitleEl.textContent = currentGallery.description || '';
    favoriteIds = loadFavorites(currentGallery.id || 'default');
    renderImages(currentGallery.images || []);
  } catch (err) {
    emptyState.style.display = 'block';
    emptyState.textContent = 'Fehler beim Laden der Galerie.';
    console.error(err);
  }
}

init();
initTheme();

filterAllBtn.addEventListener('click', () => {
  showFavoritesOnly = false;
  filterAllBtn.classList.add('active');
  filterFavBtn.classList.remove('active');
  applySearch();
});

filterFavBtn.addEventListener('click', () => {
  showFavoritesOnly = true;
  filterFavBtn.classList.add('active');
  filterAllBtn.classList.remove('active');
  applySearch();
});
