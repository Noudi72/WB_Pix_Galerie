const galleryGrid = document.getElementById('gallery-grid');
const categoryList = document.getElementById('category-list');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const countChip = document.getElementById('gallery-count-chip');

let galleryConfig = null;
let selectedCategory = 'all';

function normalize(text) {
  return String(text || '').toLowerCase();
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
    const preview = (gallery.images && gallery.images[0]) ? gallery.images[0].thumbnailUrl || gallery.images[0].url : '';
    card.innerHTML = `
      ${preview ? `<img src="${preview}" alt="${gallery.name || 'Galerie'}">` : '<div style="height: 160px; background: var(--surface-2);"></div>'}
      <div class="card-body">
        <div class="card-title">${gallery.name || 'Galerie'}</div>
        <div class="card-meta">${gallery.description || ''}</div>
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
    const res = await fetch('./gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('gallery.json konnte nicht geladen werden');
    galleryConfig = await res.json();
    renderCategories(galleryConfig.categories || []);
    renderGalleries();
  } catch (err) {
    galleryGrid.innerHTML = '';
    emptyState.style.display = 'block';
    emptyState.textContent = 'Fehler beim Laden der Galerien.';
    console.error(err);
  }
}

searchInput.addEventListener('input', renderGalleries);

init();
