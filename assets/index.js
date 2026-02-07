const galleryGrid = document.getElementById('gallery-grid');
const categoryList = document.getElementById('category-list');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const countChip = document.getElementById('gallery-count-chip');
const themeToggle = document.getElementById('theme-toggle');
const portfolioSection = document.getElementById('portfolio-section');
const portfolioLeftImage = document.getElementById('portfolio-left-image');
const portfolioLeftPrev = document.getElementById('portfolio-left-prev');
const portfolioLeftNext = document.getElementById('portfolio-left-next');
const portfolioLeftMedia = document.getElementById('portfolio-left-media');
const portfolioRightImage = document.getElementById('portfolio-right-image');
const portfolioRightPrev = document.getElementById('portfolio-right-prev');
const portfolioRightNext = document.getElementById('portfolio-right-next');
const portfolioRightMedia = document.getElementById('portfolio-right-media');
const portfolioLightbox = document.getElementById('portfolio-lightbox');
const portfolioLightboxImg = document.getElementById('portfolio-lightbox-image');
const portfolioLightboxClose = document.getElementById('portfolio-lightbox-close');

const brandLogo = document.getElementById('brand-logo');
const faviconEl = document.querySelector('link[rel="icon"]');

let galleryConfig = null;
let selectedCategory = 'all';

const DEFAULT_LOGO_URL = './assets/logo_wb.png';
const DEFAULT_LOGO_WIDTH = 180;

function getSavedLogoUrl() {
  const saved = localStorage.getItem('wbg_logo_url');
  return saved && saved.trim() ? saved.trim() : DEFAULT_LOGO_URL;
}

function getSavedLogoWidth() {
  const raw = localStorage.getItem('wbg_logo_width');
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_LOGO_WIDTH;
}

function applyLogoWidth() {
  const width = getSavedLogoWidth();
  document.documentElement.style.setProperty('--logo-width', `${width}px`);
}

function applyBranding() {
  const logoUrl = getSavedLogoUrl();
  if (brandLogo) brandLogo.src = logoUrl;
  if (faviconEl) faviconEl.href = logoUrl;
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('wbg_theme', isDark ? 'dark' : 'light');
  if (themeToggle) {
    themeToggle.textContent = isDark ? 'Hell' : 'Dunkel';
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }
}

function initTheme() {
  const saved = localStorage.getItem('wbg_theme') || 'light';
  applyTheme(saved);
  applyLogoWidth();
  applyBranding();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(next);
    });
  }
}

function isCloudinaryTransformSegment(segment) {
  if (!segment) return false;
  if (segment.includes(',')) return true;
  return /^(?:c_|w_|h_|q_|f_|g_|ar_|e_|l_|b_|dpr_|fl_|t_)/.test(segment);
}

function buildThumbUrl(url, width = 480, height = 320) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const transform = `c_fill,w_${width},h_${height},q_auto:good,f_auto`;
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const prefix = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  const parts = rest.split('/').filter(Boolean);
  while (parts.length && isCloudinaryTransformSegment(parts[0])) {
    parts.shift();
  }
  return `${prefix}${transform}/${parts.join('/')}`;
}

function normalize(text) {
  return String(text || '').toLowerCase();
}

function resolveManualPortfolioItems() {
  const left = Array.isArray(galleryConfig?.bestShotsLeft) ? galleryConfig.bestShotsLeft : [];
  const right = Array.isArray(galleryConfig?.bestShotsRight) ? galleryConfig.bestShotsRight : [];
  if (!left.length && !right.length) return null;
  const galleries = galleryConfig?.galleries || [];
  const resolveEntries = (entries) => {
    const items = [];
    entries.forEach((entry) => {
      if (!entry) return;
      if (entry.url) {
        const fullSrc = entry.url;
        items.push({
          thumbSrc: buildThumbUrl(fullSrc, 1200, 675),
          fullSrc,
          galleryId: entry.galleryId || ''
        });
        return;
      }
      const gallery = galleries.find(g => g.id === entry.galleryId) || galleries.find(g => g.name === entry.galleryName);
      if (!gallery) return;
      const images = gallery.images || [];
      const img = images.find(i => (i.id || i.publicId || i.name) === entry.imageId) || images[0];
      if (!img) return;
      const fullSrc = img.url || img.thumbnailUrl;
      items.push({
        thumbSrc: buildThumbUrl(fullSrc, 1200, 675),
        fullSrc,
        galleryId: gallery.id || ''
      });
    });
    return items;
  };
  return { left: resolveEntries(left), right: resolveEntries(right) };
}

function renderPortfolio() {
  if (!portfolioSection) return;
  const manual = resolveManualPortfolioItems();
  const items = manual ? null : collectPortfolioItems();
  const leftItems = manual ? manual.left : items;
  const rightItems = manual ? manual.right : items;
  if (!leftItems.length || !rightItems.length) {
    portfolioSection.classList.add('is-hidden');
    return;
  }
  setupPortfolioSlider({
    items: leftItems,
    imageEl: portfolioLeftImage,
    prevBtn: portfolioLeftPrev,
    nextBtn: portfolioLeftNext,
    mediaEl: portfolioLeftMedia
  });
  setupPortfolioSlider({
    items: rightItems,
    imageEl: portfolioRightImage,
    prevBtn: portfolioRightPrev,
    nextBtn: portfolioRightNext,
    mediaEl: portfolioRightMedia
  });
}

function collectPortfolioItems() {
  const galleries = galleryConfig?.galleries || [];
  const items = [];
  galleries.forEach((gallery) => {
    const images = gallery.images || [];
    if (!images.length) return;
    if (gallery.showOnHomepage === false) return;
    const img = images[0];
    const fullSrc = img.url || img.thumbnailUrl;
    const thumbSrc = buildThumbUrl(fullSrc, 1200, 675);
    items.push({
      thumbSrc,
      fullSrc,
      galleryId: gallery.id || ''
    });
  });
  return items.slice(0, 12);
}

function setupPortfolioSlider({ items, imageEl, prevBtn, nextBtn, mediaEl, intervalMs = 6000 }) {
  if (!items.length) return null;
  let index = 0;
  let timer = null;

  const render = () => {
    const item = items[index];
    if (imageEl) {
      imageEl.classList.remove('is-visible');
      imageEl.src = item.thumbSrc || item.fullSrc || '';
      imageEl.alt = 'Portfolio';
      imageEl.onload = () => {
        imageEl.classList.add('is-visible');
      };
    }
    if (mediaEl) {
      mediaEl.onclick = () => {
        openPortfolioLightbox(item.fullSrc || item.thumbSrc || '');
      };
    }
  };

  const next = () => {
    index = (index + 1) % items.length;
    render();
  };
  const prev = () => {
    index = (index - 1 + items.length) % items.length;
    render();
  };
  const resetTimer = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(next, intervalMs);
  };

  if (nextBtn) nextBtn.addEventListener('click', () => {
    next();
    resetTimer();
  });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    prev();
    resetTimer();
  });

  render();
  resetTimer();

  return { next, prev, resetTimer };
}

function openPortfolioLightbox(src) {
  if (!portfolioLightbox || !portfolioLightboxImg) return;
  portfolioLightboxImg.src = src;
  portfolioLightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePortfolioLightbox() {
  if (!portfolioLightbox) return;
  portfolioLightbox.classList.remove('active');
  document.body.style.overflow = '';
}


function renderCategories(categories = []) {
  categoryList.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = `category-btn${selectedCategory === 'all' ? ' active' : ''}`;
  allBtn.textContent = 'Alle';
  allBtn.addEventListener('click', () => {
    selectedCategory = 'all';
    renderCategories(categories);
    renderGalleries();
  });
  categoryList.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = `category-btn${selectedCategory === cat.id ? ' active' : ''}`;
    btn.textContent = cat.name;
    btn.addEventListener('click', () => {
      selectedCategory = cat.id;
      renderCategories(categories);
      renderGalleries();
    });
    categoryList.appendChild(btn);
  });
}

function renderGalleries() {
  if (!galleryConfig || !Array.isArray(galleryConfig.galleries)) return;

  const query = normalize(searchInput.value);
  let items = galleryConfig.galleries.slice();

  if (selectedCategory !== 'all') {
    items = items.filter((g) => g.category === selectedCategory);
  }

  if (query) {
    items = items.filter((g) => {
      return normalize(g.name).includes(query) || normalize(g.description).includes(query);
    });
  }

  // Nur Galerien mit Bildern anzeigen (und optional ausgeblendet)
  items = items.filter((g) => {
    const hasImages = (g.images || []).length > 0;
    const showOnHomepage = g.showOnHomepage !== false;
    return hasImages && showOnHomepage;
  });

  // Manuelle Reihenfolge (falls vorhanden) beibehalten
  const hasOrder = items.some(g => typeof g.order === 'number');
  if (hasOrder) {
    items.sort((a, b) => {
      const ao = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return ao - bo;
    });
  }

  galleryGrid.innerHTML = '';
  countChip.textContent = `${items.length} Galerien`;

  if (!items.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  items.forEach((gallery) => {
    const card = document.createElement('div');
    card.className = 'card';
    const previewRaw = (gallery.images && gallery.images[0]) ? gallery.images[0].url || gallery.images[0].thumbnailUrl : '';
    const preview = buildThumbUrl(previewRaw);
    const sub = gallery.subcategory ? ` · ${gallery.subcategory}` : '';
    const folder = gallery.folder ? ` · ${gallery.folder}` : '';
    const date = gallery.date ? ` · ${gallery.date}` : '';
    card.innerHTML = `
      ${preview ? `<img src="${preview}" alt="${gallery.name || 'Galerie'}" loading="lazy" decoding="async">` : '<div class="card-placeholder"></div>'}
      <div class="card-body">
        <div class="card-title">${gallery.name || 'Galerie'}</div>
        <div class="card-meta">${gallery.description || ''}${sub}${folder}${date}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      const id = encodeURIComponent(gallery.id || '');
      window.location.href = `./gallery.html?id=${id}`;
    });
    galleryGrid.appendChild(card);
  });
}

async function init() {
  try {
    // Cache-Bust Parameter um immer neueste Version zu laden
    const cacheBust = Date.now();
    const res = await fetch(`./gallery.json?v=${cacheBust}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('gallery.json konnte nicht geladen werden');
    galleryConfig = await res.json();
    renderCategories(galleryConfig.categories || []);
    renderGalleries();
    renderPortfolio();
  } catch (err) {
    galleryGrid.innerHTML = '';
    emptyState.style.display = 'block';
    emptyState.textContent = 'Fehler beim Laden der Galerien.';
    console.error(err);
  }
}

searchInput.addEventListener('input', renderGalleries);

initTheme();
init();

if (portfolioLightboxClose) {
  portfolioLightboxClose.addEventListener('click', closePortfolioLightbox);
}
if (portfolioLightbox) {
  portfolioLightbox.addEventListener('click', (e) => {
    if (e.target === portfolioLightbox) closePortfolioLightbox();
  });
}
document.addEventListener('keydown', (e) => {
  if (!portfolioLightbox || !portfolioLightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closePortfolioLightbox();
});
