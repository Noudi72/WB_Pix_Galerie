const grid = document.getElementById('gallery-grid');
const emptyState = document.getElementById('gallery-empty');
const titleEl = document.getElementById('gallery-title');
const subtitleEl = document.getElementById('gallery-subtitle');
const countChip = document.getElementById('image-count-chip');
const searchInput = document.getElementById('gallery-search');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let galleryConfig = null;
let currentGallery = null;
let filteredImages = [];
let currentIndex = 0;

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
    const src = resolveUrl(img.thumbnailUrl || img.url);
    item.innerHTML = `<img src="${src}" alt="${img.name || 'Bild'}">`;
    item.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(item);
  });
}

function applySearch() {
  if (!currentGallery) return;
  const query = normalize(searchInput.value);
  if (!query) {
    renderImages(currentGallery.images || []);
    return;
  }
  const filtered = (currentGallery.images || []).filter((img) => {
    return normalize(img.name).includes(query) || normalize(img.id).includes(query);
  });
  renderImages(filtered);
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
    renderImages(currentGallery.images || []);
  } catch (err) {
    emptyState.style.display = 'block';
    emptyState.textContent = 'Fehler beim Laden der Galerie.';
    console.error(err);
  }
}

init();
