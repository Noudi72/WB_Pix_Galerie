const cloudNameInput = document.getElementById('cloud-name');
const uploadPresetInput = document.getElementById('upload-preset');
const gallerySelect = document.getElementById('gallery-select');
const galleryNameInput = document.getElementById('gallery-name');
const galleryDescInput = document.getElementById('gallery-description');
const galleryCategorySelect = document.getElementById('gallery-category');
const gallerySubcategoryInput = document.getElementById('gallery-subcategory');
const galleryFolderInput = document.getElementById('gallery-folder');
const galleryDateInput = document.getElementById('gallery-date');
const newCategoryInput = document.getElementById('new-category');
const galleryPasswordInput = document.getElementById('gallery-password');
const gallerySearchInput = document.getElementById('gallery-search');
const imageFilesInput = document.getElementById('image-files');
const imageUrlInput = document.getElementById('image-url');
const uploadDropzone = document.getElementById('upload-dropzone');
const uploadStatus = document.getElementById('upload-status');
const uploadProgress = document.getElementById('upload-progress');
const uploadProgressLabel = document.getElementById('upload-progress-label');
const resizeBeforeUpload = document.getElementById('resize-before-upload');
const resizeMaxSide = document.getElementById('resize-max-side');
const resizeQuality = document.getElementById('resize-quality');
const wizardPrev = document.getElementById('wizard-prev');
const wizardNext = document.getElementById('wizard-next');
const wizardSteps = document.querySelectorAll('.wizard-step');
const wizardPanels = document.querySelectorAll('.wizard-step-panel');
const subcategoryDatalist = document.getElementById('subcategory-suggestions');
const folderDatalist = document.getElementById('folder-suggestions');

const galleryTable = document.getElementById('gallery-table');
const galleryTableBody = galleryTable?.querySelector('tbody');
const galleryTableSearch = document.getElementById('gallery-table-search');
const galleryTablePasswordFilter = document.getElementById('gallery-table-password');
const gallerySortModeSelect = document.getElementById('gallery-sort-mode');
const galleryTableStatus = document.getElementById('gallery-table-status');
const galleryOrderStatus = document.getElementById('gallery-order-status');
const galleryTableSortButtons = galleryTable?.querySelectorAll('.table-sort') || [];
const globalPushBtn = document.getElementById('push-json-global-btn');
const saveOrderBtn = document.getElementById('save-order-btn');
const applyPrivateFixBtn = document.getElementById('apply-private-fix-btn');

const uploadModal = document.getElementById('upload-modal');
const uploadCategorySelect = document.getElementById('upload-category');
const uploadSubcategoryInput = document.getElementById('upload-subcategory');
const uploadSubcategoryList = document.getElementById('upload-subcategory-list');
const uploadFolderInput = document.getElementById('upload-folder');
const uploadDateInput = document.getElementById('upload-date');
const uploadNewCategoryInput = document.getElementById('upload-new-category');
const uploadCancelBtn = document.getElementById('upload-cancel');
const uploadConfirmBtn = document.getElementById('upload-confirm');

const adminImageList = document.getElementById('admin-image-list');
const clearGalleryImagesBtn = document.getElementById('clear-gallery-images-btn');
const cleanGalleryImagesBtn = document.getElementById('clean-gallery-images-btn');
const bestShotsListLeft = document.getElementById('best-shots-list-left');
const bestShotsListRight = document.getElementById('best-shots-list-right');
const bestShotsEmptyLeft = document.getElementById('best-shots-empty-left');
const bestShotsEmptyRight = document.getElementById('best-shots-empty-right');
const bestShotsDropLeft = document.getElementById('best-shots-drop-left');
const bestShotsDropRight = document.getElementById('best-shots-drop-right');
const bestShotsPickLeft = document.getElementById('best-shots-pick-left');
const bestShotsPickRight = document.getElementById('best-shots-pick-right');
const bestShotsFileLeft = document.getElementById('best-shots-file-left');
const bestShotsFileRight = document.getElementById('best-shots-file-right');
const bestShotsStatus = document.getElementById('best-shots-status');
const clearBestShotsBtn = document.getElementById('clear-best-shots-btn');
const saveBestShotsBtn = document.getElementById('save-best-shots-btn');

const newGalleryBtn = document.getElementById('new-gallery-btn');
const saveGalleryBtn = document.getElementById('save-gallery-btn');
const openGalleryBtn = document.getElementById('open-gallery-btn');
const uploadImagesBtn = document.getElementById('upload-images-btn');
const addUrlBtn = document.getElementById('add-url-btn');
const downloadBtn = document.getElementById('download-json-btn');
const pushBtn = document.getElementById('push-json-btn');
const deleteGalleryBtn = document.getElementById('delete-gallery-btn');
const wizardNewGalleryBtn = document.getElementById('wizard-new-gallery-btn');

const categorySelect = document.getElementById('category-select');
const categoryRenameInput = document.getElementById('category-rename');
const categoryRenameBtn = document.getElementById('rename-category-btn');
const categoryDeleteBtn = document.getElementById('delete-category-btn');

const adminApp = document.getElementById('admin-app');
const adminLogin = document.getElementById('admin-login');
const adminLoginInput = document.getElementById('admin-login-password');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLoginHint = document.getElementById('admin-login-hint');
const adminCurrentPassword = document.getElementById('admin-current-password');
const adminNewPassword = document.getElementById('admin-new-password');
const adminChangePasswordBtn = document.getElementById('change-admin-password-btn');

const ghOwnerInput = document.getElementById('gh-owner');
const ghRepoInput = document.getElementById('gh-repo');
const ghBranchInput = document.getElementById('gh-branch');
const ghPathInput = document.getElementById('gh-path');
const ghTokenInput = document.getElementById('gh-token');
const themeToggle = document.getElementById('theme-toggle');

let galleryConfig = null;
let currentGallery = null;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
let wizardStep = 1;
let gallerySort = [
  { key: 'category', dir: 'asc' },
  { key: 'subcategory', dir: 'asc' },
  { key: 'folder', dir: 'asc' }
];
let pendingUploadFiles = [];
let dragGalleryId = null;
let mouseDragActive = false;
let hoverGalleryId = null;
let gallerySortMode = 'manual';

function ensureGalleryOrder() {
  const galleries = galleryConfig?.galleries || [];
  let nextOrder = 1;
  galleries.forEach((g) => {
    if (typeof g.order !== 'number' || Number.isNaN(g.order)) {
      g.order = nextOrder;
    }
    nextOrder += 1;
  });
}

function sortGalleriesByOrder() {
  if (!galleryConfig?.galleries?.length) return;
  galleryConfig.galleries.sort((a, b) => {
    const ao = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const bo = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });
}

function persistOrderFromArray() {
  const galleries = galleryConfig?.galleries || [];
  galleries.forEach((g, idx) => {
    g.order = idx + 1;
  });
}

function setSortMode(mode) {
  gallerySortMode = mode === 'columns' ? 'columns' : 'manual';
  localStorage.setItem('wbg_gallery_sort_mode', gallerySortMode);
  if (gallerySortMode === 'manual') {
    gallerySort = [];
  } else if (!gallerySort.length) {
    gallerySort = [{ key: 'category', dir: 'asc' }];
  }
  updateTableSortState();
  renderGalleryTable();
}
async function downscaleImage(file) {
  const img = await createImageBitmap(file);
  const maxSide = Number(resizeMaxSide?.value || 4000);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const targetW = Math.round(img.width * scale);
  const targetH = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const quality = Number(resizeQuality?.value || 0.88);
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
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
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      applyTheme(next);
    });
  }
}

function renderWizard() {
  wizardPanels.forEach((panel) => {
    const step = Number(panel.dataset.step);
    panel.classList.toggle('is-active', step === wizardStep);
  });
  wizardSteps.forEach((badge, idx) => {
    badge.classList.toggle('active', idx + 1 === wizardStep);
  });
  if (wizardPrev) wizardPrev.disabled = wizardStep === 1;
  if (wizardNext) wizardNext.textContent = wizardStep === 3 ? 'Fertig' : 'Weiter';
}

function goWizardStep(nextStep) {
  wizardStep = Math.min(3, Math.max(1, nextStep));
  renderWizard();
}

function getAdminPassword() {
  return localStorage.getItem('wbg_admin_password') || '';
}

function setAdminPassword(pwd) {
  localStorage.setItem('wbg_admin_password', pwd);
}

function showAdminApp() {
  adminLogin.classList.add('is-hidden');
  adminApp.classList.remove('is-hidden');
}

function showLogin() {
  adminApp.classList.add('is-hidden');
  adminLogin.classList.remove('is-hidden');
}

function handleLogin() {
  const saved = getAdminPassword();
  if (!saved) {
    adminLoginHint.textContent = 'Kein Passwort gesetzt. Bitte im Adminbereich ein neues Passwort speichern.';
    showAdminApp();
    return;
  }
  const input = adminLoginInput.value.trim();
  if (input === saved) {
    adminLoginInput.value = '';
    showAdminApp();
  } else {
    adminLoginHint.textContent = 'Falsches Passwort.';
  }
}

function loadSettings() {
  cloudNameInput.value = localStorage.getItem('wbg_cloud_name') || '';
  uploadPresetInput.value = localStorage.getItem('wbg_upload_preset') || '';
  ghOwnerInput.value = localStorage.getItem('wbg_gh_owner') || 'Noudi72';
  ghRepoInput.value = localStorage.getItem('wbg_gh_repo') || 'WB_Pix_Galerie';
  ghBranchInput.value = localStorage.getItem('wbg_gh_branch') || 'main';
  ghPathInput.value = localStorage.getItem('wbg_gh_path') || 'gallery.json';
  ghTokenInput.value = localStorage.getItem('wbg_gh_token') || '';
  if (resizeMaxSide) resizeMaxSide.value = localStorage.getItem('wbg_resize_max') || '4000';
  if (resizeQuality) resizeQuality.value = localStorage.getItem('wbg_resize_quality') || '0.88';
}

function saveSettings() {
  localStorage.setItem('wbg_cloud_name', cloudNameInput.value.trim());
  localStorage.setItem('wbg_upload_preset', uploadPresetInput.value.trim());
  localStorage.setItem('wbg_gh_owner', ghOwnerInput.value.trim());
  localStorage.setItem('wbg_gh_repo', ghRepoInput.value.trim());
  localStorage.setItem('wbg_gh_branch', ghBranchInput.value.trim());
  localStorage.setItem('wbg_gh_path', ghPathInput.value.trim());
  localStorage.setItem('wbg_gh_token', ghTokenInput.value.trim());
  if (resizeMaxSide) localStorage.setItem('wbg_resize_max', resizeMaxSide.value);
  if (resizeQuality) localStorage.setItem('wbg_resize_quality', resizeQuality.value);
}

function buildThumbUrl(url, width = 520, height = 390) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const transform = `c_fill,w_${width},h_${height},q_auto,f_auto`;
  return url.replace(/\/upload\/([^/]+\/)?/, `/upload/${transform}/`);
}

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return new URL(url, window.location.href).href;
}

function populateCategories() {
  galleryCategorySelect.innerHTML = '';
  const categories = galleryConfig?.categories || [];
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    galleryCategorySelect.appendChild(opt);
  });

  if (categorySelect) {
    categorySelect.innerHTML = '';
    categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }
}

function getCategoryName(categoryId) {
  if (!categoryId) return '';
  const cat = (galleryConfig?.categories || []).find(c => c.id === categoryId);
  return cat?.name || categoryId;
}

function updateTableSortState() {
  galleryTableSortButtons.forEach((btn) => {
    const key = btn.dataset.sort;
    const index = gallerySort.findIndex(item => item.key === key);
    const isActive = index >= 0;
    btn.classList.toggle('is-active', isActive);
    if (isActive) {
      btn.setAttribute('data-dir', gallerySort[index].dir);
      btn.setAttribute('data-order', String(index + 1));
    } else {
      btn.removeAttribute('data-dir');
      btn.removeAttribute('data-order');
    }
  });
}

function normalizeToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9äöü]/gi, '')
    .trim();
}

function tokenIncludes(value, query) {
  const token = normalizeToken(value);
  const q = normalizeToken(query);
  return token.includes(q);
}

function normalizeFolderValue(gallery, count) {
  const rawFolder = String(gallery.folder || '').trim();
  if (!rawFolder) return '';
  if (!count) {
    const categoryLabel = getCategoryName(gallery.category);
    const categoryId = gallery.category || '';
    const normalizedFolder = normalizeToken(rawFolder);
    const normalizedCategoryLabel = normalizeToken(categoryLabel);
    const normalizedCategoryId = normalizeToken(categoryId);
    const withoutPrefix = rawFolder.replace(/^\d+[_\s-]+/, '').trim();
    const normalizedWithoutPrefix = normalizeToken(withoutPrefix);
    const looksLikeCategory = normalizedFolder === normalizedCategoryLabel
      || normalizedFolder === normalizedCategoryId
      || normalizedWithoutPrefix === normalizedCategoryLabel;
    if (looksLikeCategory) {
      gallery.folder = '';
      return '';
    }
  }
  return rawFolder;
}

function buildCategoryOptions(selected) {
  const categories = galleryConfig?.categories || [];
  if (!categories.length) return '<option value="">—</option>';
  return categories.map((cat) => {
    const isSelected = cat.id === selected ? ' selected' : '';
    return `<option value="${cat.id}"${isSelected}>${cat.name}</option>`;
  }).join('');
}

function populateUploadModalOptions() {
  if (!uploadCategorySelect || !uploadSubcategoryList) return;
  uploadCategorySelect.innerHTML = buildCategoryOptions(galleryCategorySelect?.value || '');
  const subSet = new Set();
  (galleryConfig?.galleries || []).forEach((g) => {
    if (g.subcategory) subSet.add(g.subcategory);
  });
  uploadSubcategoryList.innerHTML = '';
  Array.from(subSet).sort((a, b) => a.localeCompare(b, 'de')).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    uploadSubcategoryList.appendChild(opt);
  });
  if (uploadSubcategoryInput) uploadSubcategoryInput.value = gallerySubcategoryInput?.value || '';
  if (uploadFolderInput) uploadFolderInput.value = galleryFolderInput?.value || '';
  if (uploadDateInput) uploadDateInput.value = galleryDateInput?.value || '';
  if (uploadNewCategoryInput) uploadNewCategoryInput.value = '';
}

function openUploadModal(files) {
  if (!uploadModal) return;
  pendingUploadFiles = files || [];
  populateUploadModalOptions();
  uploadModal.classList.remove('is-hidden');
}

function closeUploadModal({ reset = true } = {}) {
  if (!uploadModal) return;
  uploadModal.classList.add('is-hidden');
  if (reset) pendingUploadFiles = [];
}

function ensureCategoryByName(name) {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const id = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const exists = (galleryConfig.categories || []).some(c => c.id === id);
  if (!exists) {
    galleryConfig.categories.push({ id, name: trimmed });
  }
  populateCategories();
  return id;
}

function getOrCreateGallery({ categoryId, subcategory, folder, date }) {
  const galleries = galleryConfig?.galleries || [];
  
  // Normalisiere Werte für Vergleich
  const normalizeForMatch = (val) => String(val || '').trim();
  const catNorm = normalizeForMatch(categoryId);
  const subNorm = normalizeForMatch(subcategory);
  const folderNorm = normalizeForMatch(folder);
  const dateNorm = normalizeForMatch(date);
  
  // Suche exakte Übereinstimmung
  const match = galleries.find(g => 
    normalizeForMatch(g.category) === catNorm
    && normalizeForMatch(g.subcategory) === subNorm
    && normalizeForMatch(g.folder) === folderNorm
    && normalizeForMatch(g.date) === dateNorm
  );
  
  if (match) {
    console.log('Verwende bestehende Galerie:', match.id, match.name);
    return match;
  }
  
  const id = `gallery-${Date.now()}`;
  const newGallery = {
    id,
    name: subcategory || '',
    description: '',
    images: [],
    category: categoryId,
    subcategory,
    folder,
    date: date || ''
  };
  galleries.push(newGallery);
  console.log('Neue Galerie erstellt:', id, subcategory);
  return newGallery;
}

function updateSuggestions() {
  if (!subcategoryDatalist || !folderDatalist) return;
  const subSet = new Set();
  const folderSet = new Set();
  (galleryConfig?.galleries || []).forEach((g) => {
    if (g.subcategory) subSet.add(g.subcategory);
    if (g.folder) folderSet.add(g.folder);
  });
  subcategoryDatalist.innerHTML = '';
  Array.from(subSet).sort((a, b) => a.localeCompare(b, 'de')).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    subcategoryDatalist.appendChild(opt);
  });
  folderDatalist.innerHTML = '';
  Array.from(folderSet).sort((a, b) => a.localeCompare(b, 'de')).forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    folderDatalist.appendChild(opt);
  });
}

function populateGallerySelect() {
  if (!gallerySelect) return;
  gallerySelect.innerHTML = '';
  const galleries = galleryConfig?.galleries || [];
  const query = (gallerySearchInput?.value || '').trim().toLowerCase();
  const options = [];
  const keepId = currentGallery?.id || '';
  const indexById = new Map();
  galleries.forEach((gallery, idx) => {
    const label = `${gallery.name || ''} ${gallery.subcategory || ''} ${gallery.folder || ''} ${gallery.date || ''}`.toLowerCase();
    if (query && !label.includes(query)) return;
    const opt = document.createElement('option');
    opt.value = String(idx);
    const meta = [gallery.subcategory, gallery.folder, gallery.date].filter(Boolean).join(' · ');
    opt.textContent = meta ? `${gallery.name || `Galerie ${idx + 1}`} (${meta})` : (gallery.name || `Galerie ${idx + 1}`);
    options.push(opt);
    indexById.set(gallery.id || String(idx), String(idx));
  });
  options.forEach(opt => gallerySelect.appendChild(opt));

  if (!options.length) {
    gallerySelect.disabled = true;
    currentGallery = null;
    galleryNameInput.value = '';
    galleryDescInput.value = '';
    gallerySubcategoryInput.value = '';
    galleryFolderInput.value = '';
    galleryDateInput.value = '';
    galleryPasswordInput.value = '';
    return;
  }

  gallerySelect.disabled = false;
  if (keepId && indexById.has(keepId)) {
    gallerySelect.value = indexById.get(keepId);
  } else if (!gallerySelect.value) {
    gallerySelect.value = options[0].value;
  }
  loadGalleryFromSelect();
}

function renderGalleryTable() {
  if (!galleryTableBody) return;
  const galleries = galleryConfig?.galleries || [];
  const query = (galleryTableSearch?.value || '').trim().toLowerCase();
  const passwordFilter = galleryTablePasswordFilter?.value || 'all';

  let rows = galleries.map((gallery, idx) => ({
    gallery,
    idx
  }));

  if (query) {
    rows = rows.filter(({ gallery }) => {
      const meta = [
        gallery.name,
        gallery.description,
        gallery.subcategory,
        gallery.folder,
        gallery.date,
        getCategoryName(gallery.category)
      ].filter(Boolean).join(' ').toLowerCase();
      return meta.includes(query);
    });
  }

  if (passwordFilter !== 'all') {
    rows = rows.filter(({ gallery }) => {
      const hasPassword = Boolean(gallery.password);
      return passwordFilter === 'protected' ? hasPassword : !hasPassword;
    });
  }

  // Nur sortieren, wenn Sortiermodus "Spalten" aktiv ist
  if (gallerySortMode === 'columns' && gallerySort.length > 0) {
    const compareText = (a, b) => (a || '').localeCompare(b || '', 'de');
    const compareNum = (a, b) => (a || 0) - (b || 0);
    const compareBool = (a, b) => Number(Boolean(a)) - Number(Boolean(b));
    rows.sort((a, b) => {
      const ga = a.gallery;
      const gb = b.gallery;
      for (const sort of gallerySort) {
        let result = 0;
        switch (sort.key) {
          case 'date':
            result = compareText(ga.date, gb.date);
            break;
          case 'category':
            result = compareText(getCategoryName(ga.category), getCategoryName(gb.category));
            break;
          case 'subcategory':
            result = compareText(ga.subcategory, gb.subcategory);
            break;
          case 'folder':
            result = compareText(ga.folder, gb.folder);
            break;
          case 'images':
            result = compareNum(ga.images?.length, gb.images?.length);
            break;
          case 'password':
            result = compareBool(ga.password, gb.password);
            break;
          case 'name':
          default:
            result = compareText(ga.name, gb.name);
            break;
        }
        if (result !== 0) {
          return sort.dir === 'asc' ? result : -result;
        }
      }
      return 0;
    });
  }
  // Wenn gallerySort leer ist, Array-Reihenfolge beibehalten (keine Sortierung)

  galleryTableBody.innerHTML = '';
  rows.forEach(({ gallery, idx }) => {
    const tr = document.createElement('tr');
    tr.dataset.galleryId = gallery.id || String(idx);
    const count = gallery.images?.length || 0;
    if (!gallery.subcategory && gallery.name) {
      gallery.subcategory = gallery.name;
    }
    const sub = gallery.subcategory || '';
    const folder = normalizeFolderValue(gallery, count);
    const date = gallery.date || '';
    const hasPassword = Boolean(gallery.password);
    const passwordLabel = hasPassword ? 'Geschützt' : 'Öffentlich';
    const showOnHomepage = gallery.showOnHomepage !== false;
    const pathParts = [getCategoryName(gallery.category), sub, folder].filter(Boolean);
    const pathLabel = pathParts.length ? pathParts.join(' / ') : '—';
    const galleryIdValue = gallery.id || String(idx);
    tr.innerHTML = `
      <td>
        <button class="drag-handle" type="button" draggable="true" data-gallery-id="${galleryIdValue}" title="Ziehen">↕</button>
      </td>
      <td>
        <select class="table-select" data-field="category" data-idx="${idx}">
          ${buildCategoryOptions(gallery.category)}
        </select>
      </td>
      <td><input class="table-input" data-field="subcategory" data-idx="${idx}" type="text" value="${sub}" placeholder="z. B. Eishockey"></td>
      <td><input class="table-input" data-field="folder" data-idx="${idx}" type="text" value="${folder}" placeholder="z. B. EHCB vs HCD"></td>
      <td><span class="table-path">${pathLabel}</span></td>
      <td><input class="table-input" data-field="date" data-idx="${idx}" type="date" value="${date}"></td>
      <td>${count}</td>
      <td>${passwordLabel}</td>
      <td><input class="table-check" data-field="showOnHomepage" data-idx="${idx}" type="checkbox" ${showOnHomepage ? 'checked' : ''}></td>
      <td class="table-action">
        <button class="btn" data-action="auto" data-idx="${idx}">Auto</button>
        <button class="btn" data-action="edit" data-idx="${idx}">Bearbeiten</button>
        <button class="btn" data-action="delete" data-idx="${idx}">Löschen</button>
      </td>
    `;
    galleryTableBody.appendChild(tr);
  });

  if (galleryTableStatus) {
    galleryTableStatus.textContent = rows.length ? `${rows.length} Galerien angezeigt.` : 'Keine Galerien gefunden.';
  }
}

function selectGalleryByIndex(idx, { focusWizard = false } = {}) {
  const gallery = (galleryConfig?.galleries || [])[idx];
  if (!gallery) return;
  if (gallerySelect) {
    gallerySelect.value = String(idx);
    loadGalleryFromSelect();
  } else {
    applyGalleryToForm(gallery);
  }
  if (focusWizard) {
    if (wizardStep !== 1) goWizardStep(1);
    const wizardSection = document.querySelector('.admin-wizard');
    if (wizardSection) {
      wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const focusTarget = gallerySubcategoryInput || galleryNameInput;
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }
}

function openCurrentGallery() {
  if (!currentGallery?.id) return;
  const id = encodeURIComponent(currentGallery.id);
  window.open(`./gallery.html?id=${id}`, '_blank');
}

function deleteGalleryByIndex(idx) {
  const galleries = galleryConfig?.galleries || [];
  const gallery = galleries[idx];
  if (!gallery) return;
  const ok = confirm(`Galerie "${gallery.name || 'Galerie'}" wirklich löschen?`);
  if (!ok) return;
  galleries.splice(idx, 1);
  populateGallerySelect();
  updateSuggestions();
  renderGalleryTable();
}

function moveGalleryById(galleryId, direction) {
  const galleries = galleryConfig?.galleries || [];
  const idx = galleries.findIndex(g => g.id === galleryId);
  
  if (idx === -1) {
    return;
  }
  
  const newIdx = idx + direction;
  
  if (newIdx < 0 || newIdx >= galleries.length) {
    return;
  }
  
  // Tausche die Galerien
  const temp = galleries[idx];
  galleries[idx] = galleries[newIdx];
  galleries[newIdx] = temp;
  
  persistOrderFromArray();
  // WICHTIG: Sortierung zurücksetzen, damit manuelle Reihenfolge sichtbar wird
  setSortMode('manual');
  
  populateGallerySelect();
  renderGalleryTable();
  if (galleryOrderStatus) {
    galleryOrderStatus.textContent = 'Reihenfolge geändert. Bitte oben auf "Reihenfolge speichern" klicken.';
  }
}

function reorderGalleryById(sourceId, targetId) {
  const galleries = galleryConfig?.galleries || [];
  const fromIdx = galleries.findIndex(g => g.id === sourceId);
  const toIdx = galleries.findIndex(g => g.id === targetId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

  const [moved] = galleries.splice(fromIdx, 1);
  const insertIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
  galleries.splice(insertIdx, 0, moved);

  persistOrderFromArray();
  setSortMode('manual');
  populateGallerySelect();
  renderGalleryTable();
  if (galleryOrderStatus) {
    galleryOrderStatus.textContent = 'Reihenfolge geändert. Bitte oben auf "Reihenfolge speichern" klicken.';
  }
}

function resetDragState() {
  mouseDragActive = false;
  dragGalleryId = null;
  hoverGalleryId = null;
  const rows = galleryTableBody ? galleryTableBody.querySelectorAll('tr') : [];
  rows.forEach((row) => {
    row.classList.remove('is-dragging');
    row.classList.remove('is-dragover');
  });
  document.body.classList.remove('is-dragging');
}

function updateGalleryField(idx, field, value) {
  const gallery = (galleryConfig?.galleries || [])[idx];
  if (!gallery) return;
  if (field === 'showOnHomepage') {
    gallery.showOnHomepage = Boolean(value);
  } else {
    gallery[field] = value || '';
  }
  if (currentGallery === gallery) {
    if (field === 'date') galleryDateInput.value = value || '';
    if (field === 'subcategory') gallerySubcategoryInput.value = value || '';
    if (field === 'folder') galleryFolderInput.value = value || '';
    if (field === 'category') galleryCategorySelect.value = value || '';
  }
  if (field === 'subcategory') {
    gallery.name = value || '';
    if (currentGallery === gallery && galleryNameInput) galleryNameInput.value = value || '';
  }
  if (field === 'subcategory' || field === 'folder') updateSuggestions();
  renderGalleryTable();
}

function renderImageList() {
  if (!adminImageList) return;
  if (!currentGallery || !(currentGallery.images || []).length) {
    adminImageList.innerHTML = '<p class="admin-note">Keine Bilder in dieser Galerie.</p>';
    return;
  }
  adminImageList.innerHTML = '';
  currentGallery.images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'admin-image-item';
    item.draggable = true;
    item.dataset.imageIdx = String(idx);
    const thumb = buildThumbUrl(resolveUrl(img.thumbnailUrl || img.url), 180, 120);
    item.innerHTML = `
      <img class="admin-image-thumb" src="${thumb}" alt="">
      <div class="admin-image-meta">
        <strong>${img.name || 'Bild'}</strong>
        <span>${img.url ? img.url.split('/').slice(-1)[0] : ''}</span>
      </div>
      <div class="admin-actions">
        <button class="btn" data-action="best-shot-left" data-idx="${idx}">Best Shot links</button>
        <button class="btn" data-action="best-shot-right" data-idx="${idx}">Best Shot rechts</button>
        <button class="btn danger" data-action="delete-image" data-idx="${idx}">Bild löschen</button>
      </div>
    `;
    adminImageList.appendChild(item);
  });
}

function getBestShots(side) {
  if (!galleryConfig) return [];
  if (!Array.isArray(galleryConfig.bestShotsLeft)) galleryConfig.bestShotsLeft = [];
  if (!Array.isArray(galleryConfig.bestShotsRight)) galleryConfig.bestShotsRight = [];
  return side === 'right' ? galleryConfig.bestShotsRight : galleryConfig.bestShotsLeft;
}

function addBestShot(side, img) {
  if (!currentGallery || !img) return;
  const shots = getBestShots(side);
  const imageId = img.publicId || img.id || img.name || '';
  const exists = shots.some((s) => s.galleryId === currentGallery.id && s.imageId === imageId);
  if (exists) return;
  shots.push({
    galleryId: currentGallery.id,
    imageId,
    url: img.url || img.thumbnailUrl || '',
    order: shots.length + 1
  });
  renderBestShots();
}

function addBestShotFromUrl(side, url) {
  const shots = getBestShots(side);
  const exists = shots.some((s) => s.url === url);
  if (exists) return;
  shots.push({
    galleryId: '',
    imageId: '',
    url,
    order: shots.length + 1
  });
  renderBestShots();
}

function removeBestShot(side, idx) {
  const shots = getBestShots(side);
  shots.splice(idx, 1);
  shots.forEach((s, i) => {
    s.order = i + 1;
  });
  renderBestShots();
}

function renderBestShots() {
  const renderSide = (side, listEl, emptyEl) => {
    if (!listEl) return;
    const shots = getBestShots(side).slice().sort((a, b) => {
      const ao = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      const bo = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return ao - bo;
    });
    listEl.innerHTML = '';
    if (!shots.length) {
      if (emptyEl) emptyEl.classList.remove('is-hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('is-hidden');
    shots.forEach((shot, idx) => {
      const gallery = (galleryConfig?.galleries || []).find(g => g.id === shot.galleryId);
      const images = gallery?.images || [];
      const img = images.find(i => (i.publicId || i.id || i.name) === shot.imageId) || null;
      const thumb = buildThumbUrl(resolveUrl(img?.thumbnailUrl || img?.url || shot.url), 180, 120);
      const title = gallery?.name || gallery?.subcategory || (shot.galleryId ? 'Galerie' : 'Upload');
      const meta = img?.name || shot.imageId || (shot.url ? shot.url.split('/').pop() : '');
      const item = document.createElement('div');
      item.className = 'best-shots-item';
      item.innerHTML = `
        <img class="best-shots-thumb" src="${thumb}" alt="">
        <div class="best-shots-meta">
          <strong>#${idx + 1} · ${title}</strong>
          <span>${meta}</span>
        </div>
        <button class="btn danger" data-action="remove-best-shot" data-idx="${idx}" data-side="${side}">Entfernen</button>
      `;
      listEl.appendChild(item);
    });
  };
  renderSide('left', bestShotsListLeft, bestShotsEmptyLeft);
  renderSide('right', bestShotsListRight, bestShotsEmptyRight);
}

function applyPrivateFix() {
  if (!galleryConfig) return;
  const galleries = galleryConfig.galleries || [];
  const hits = galleries.filter((g) => {
    const id = g.id || '';
    const name = g.name || '';
    const sub = g.subcategory || '';
    const folder = g.folder || '';
    const byFields = tokenIncludes(id, 'noel') || tokenIncludes(name, 'noel') || tokenIncludes(sub, 'noel') || tokenIncludes(folder, 'noel')
      || tokenIncludes(id, 'privat') || tokenIncludes(name, 'privat') || tokenIncludes(sub, 'privat') || tokenIncludes(folder, 'privat');
    if (byFields) return true;
    return (g.images || []).some((img) => {
      const imgId = img.publicId || img.id || '';
      const url = img.url || img.thumbnailUrl || '';
      return tokenIncludes(imgId, 'noel')
        || tokenIncludes(url, '/noel')
        || tokenIncludes(imgId, 'privat')
        || tokenIncludes(url, '/privat');
    });
  });

  if (!hits.length) {
    alert('Keine privaten Galerien gefunden.');
    return;
  }

  const ok = confirm(`Privat‑Fix auf ${hits.length} Galerie(n) anwenden?`);
  if (!ok) return;

  const privateCategoryId = ensureCategoryByName('Privat');
  hits.forEach((g) => {
    g.category = privateCategoryId;
    g.subcategory = 'shootings';
    g.folder = 'noël';
    g.name = g.subcategory;
  });
  populateGallerySelect();
  updateSuggestions();
  renderGalleryTable();
  renderImageList();
  alert('Privat‑Fix angewendet. Bitte Änderungen zu GitHub pushen.');
}

function clearGalleryImages() {
  if (!currentGallery) return;
  const ok = confirm('Alle Bilder dieser Galerie wirklich löschen?');
  if (!ok) return;
  currentGallery.images = [];
  renderImageList();
  renderGalleryTable();
}

async function cleanGalleryImages() {
  if (!currentGallery) return;
  const before = currentGallery.images?.length || 0;
  currentGallery.images = (currentGallery.images || []).filter(img => img && (img.url || img.thumbnailUrl));
  const removedEmpty = before - currentGallery.images.length;

  const doCheck = confirm(
    `Bereinigt: ${removedEmpty} leere Einträge entfernt.\n\nZusätzlich jetzt Cloudinary-Links prüfen (404) und kaputte Einträge entfernen?`
  );

  if (!doCheck) {
    renderImageList();
    renderGalleryTable();
    alert(`Bereinigt: ${removedEmpty} Einträge entfernt.`);
    return;
  }

  const okImages = [];
  let broken = 0;

  for (let i = 0; i < currentGallery.images.length; i += 1) {
    const img = currentGallery.images[i];
    const url = resolveUrl(img.url || img.thumbnailUrl);
    const isCloudinary = url.includes('res.cloudinary.com') && url.includes('/upload/');

    if (uploadStatus) {
      uploadStatus.textContent = `Prüfe Bilder ${i + 1}/${currentGallery.images.length}…`;
    }

    if (!isCloudinary) {
      okImages.push(img);
      continue;
    }

    let exists = true;
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (res.status === 404) exists = false;
    } catch (_) {
      exists = true;
    }

    if (exists) {
      okImages.push(img);
    } else {
      broken += 1;
    }
  }

  currentGallery.images = okImages;
  renderImageList();
  renderGalleryTable();
  if (uploadStatus) {
    uploadStatus.textContent = `Check fertig: ${broken} kaputte Links entfernt.`;
  }
  alert(`Check fertig:\n- ${removedEmpty} leere entfernt\n- ${broken} kaputte Cloudinary-Links entfernt`);
}

function autoFillFromFolder(idx) {
  const gallery = (galleryConfig?.galleries || [])[idx];
  if (!gallery) return;
  const folderValue = String(gallery.folder || '').trim();
  if (!folderValue) return;
  const separatorMatch = folderValue.match(/\s*(.+?)\s*(?:\/|—|–|-|:)\s*(.+)/);
  if (!separatorMatch) return;
  const candidateSub = separatorMatch[1]?.trim();
  const candidateFolder = separatorMatch[2]?.trim();
  if (!gallery.subcategory && candidateSub) gallery.subcategory = candidateSub;
  if (candidateFolder) gallery.folder = candidateFolder;
  if (currentGallery === gallery) {
    gallerySubcategoryInput.value = gallery.subcategory || '';
    galleryFolderInput.value = gallery.folder || '';
  }
  updateSuggestions();
  renderGalleryTable();
}

function loadGalleryFromSelect() {
  if (!gallerySelect) return;
  const idx = Number(gallerySelect.value);
  const gallery = (galleryConfig?.galleries || [])[idx] || null;
  if (!gallery) return;
  applyGalleryToForm(gallery);
}

function applyGalleryToForm(gallery) {
  if (!gallery) return;
  currentGallery = gallery;
  if (galleryNameInput) galleryNameInput.value = gallery.name || '';
  galleryDescInput.value = gallery.description || '';
  if (galleryCategorySelect) galleryCategorySelect.value = gallery.category || '';
  const subValue = gallery.subcategory || gallery.name || '';
  gallerySubcategoryInput.value = subValue;
  if (!gallery.subcategory && subValue) {
    gallery.subcategory = subValue;
  }
  galleryFolderInput.value = gallery.folder || '';
  galleryDateInput.value = gallery.date || '';
  galleryPasswordInput.value = gallery.password || '';
  renderImageList();
}

function resetWizardFields() {
  if (galleryNameInput) galleryNameInput.value = '';
  galleryDescInput.value = '';
  gallerySubcategoryInput.value = '';
  galleryFolderInput.value = '';
  galleryDateInput.value = '';
  galleryPasswordInput.value = '';
  if (newCategoryInput) newCategoryInput.value = '';
  currentGallery = null;
  if (gallerySelect) gallerySelect.value = '';
  renderImageList();
}

function ensureCategoryExists() {
  const name = newCategoryInput.value.trim();
  if (!name) return;
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const exists = (galleryConfig.categories || []).some(c => c.id === id);
  if (!exists) {
    galleryConfig.categories.push({ id, name });
  }
  newCategoryInput.value = '';
  populateCategories();
  galleryCategorySelect.value = id;
}

function saveGallery() {
  if (!currentGallery) {
    createGallery();
    return;
  }
  ensureCategoryExists();
  const subValue = gallerySubcategoryInput.value.trim();
  currentGallery.name = subValue || (galleryNameInput ? galleryNameInput.value.trim() : '');
  currentGallery.description = galleryDescInput.value.trim();
  currentGallery.category = galleryCategorySelect.value;
  currentGallery.subcategory = subValue;
  currentGallery.folder = galleryFolderInput.value.trim();
  currentGallery.date = galleryDateInput.value || '';
  const pwd = galleryPasswordInput.value.trim();
  if (pwd) currentGallery.password = pwd;
  else delete currentGallery.password;
  populateGallerySelect();
  updateSuggestions();
  renderGalleryTable();
}

function createGallery() {
  const subValue = gallerySubcategoryInput.value.trim();
  const folderValue = galleryFolderInput.value.trim();
  const dateValue = galleryDateInput.value || '';
  const categoryValue = galleryCategorySelect.value || (galleryConfig.categories?.[0]?.id || 'all');
  const id = `gallery-${Date.now()}`;
  const newGallery = {
    id,
    name: subValue || 'Neue Galerie',
    description: galleryDescInput.value.trim(),
    images: [],
    category: categoryValue,
    subcategory: subValue,
    folder: folderValue,
    date: dateValue
  };
  galleryConfig.galleries.push(newGallery);
  persistOrderFromArray();
  populateGallerySelect();
  if (gallerySelect) {
    gallerySelect.value = String(galleryConfig.galleries.length - 1);
    loadGalleryFromSelect();
  } else {
    applyGalleryToForm(newGallery);
  }
  updateSuggestions();
  renderGalleryTable();
  renderImageList();
}

function deleteCurrentGallery() {
  if (!currentGallery) return;
  const ok = confirm(`Galerie "${currentGallery.name || 'Galerie'}" wirklich löschen?`);
  if (!ok) return;
  const idx = galleryConfig.galleries.indexOf(currentGallery);
  if (idx >= 0) galleryConfig.galleries.splice(idx, 1);
  populateGallerySelect();
  updateSuggestions();
  renderGalleryTable();
  renderImageList();
}

function renameCategory() {
  const id = categorySelect?.value;
  const newName = categoryRenameInput?.value.trim();
  if (!id || !newName) return;
  const cat = (galleryConfig.categories || []).find(c => c.id === id);
  if (!cat) return;
  cat.name = newName;
  populateCategories();
  categoryRenameInput.value = '';
  renderGalleryTable();
}

function deleteCategory() {
  const id = categorySelect?.value;
  if (!id) return;
  const ok = confirm('Kategorie wirklich löschen?');
  if (!ok) return;
  galleryConfig.categories = (galleryConfig.categories || []).filter(c => c.id !== id);
  (galleryConfig.galleries || []).forEach(g => {
    if (g.category === id) delete g.category;
  });
  populateCategories();
  renderGalleryTable();
}

async function uploadFiles() {
  saveSettings();
  const files = Array.from(imageFilesInput.files || []);
  if (!files.length) {
    alert('Bitte mindestens eine Datei auswählen.');
    return;
  }
  openUploadModal(files);
}

async function uploadFilesWithFiles(files) {
  saveSettings();
  if (!currentGallery) {
    alert('Bitte zuerst eine Galerie auswählen oder anlegen.');
    return;
  }
  currentGallery.images = Array.isArray(currentGallery.images) ? currentGallery.images : [];
  if (uploadStatus) uploadStatus.textContent = '';
  if (uploadProgress) uploadProgress.value = 0;
  if (uploadProgressLabel) uploadProgressLabel.textContent = '';
  const cloudName = cloudNameInput.value.trim();
  const preset = uploadPresetInput.value.trim();
  if (!cloudName || !preset) {
    alert('Bitte Cloud Name und Upload Preset angeben.');
    return;
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const folderPath = buildCloudinaryFolder();
  let okCount = 0;
  let errorCount = 0;
  const total = files.length;

  const uploadWithProgress = (form, onProgress) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err);
        }
      } else {
        try {
          reject(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err);
        }
      }
    };
    xhr.onerror = () => reject(new Error('Upload fehlgeschlagen'));
    xhr.send(form);
  });

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    try {
      if (uploadStatus) uploadStatus.textContent = `Upload ${i + 1}/${total}: ${file.name}`;

      let uploadFile = file;
      if (resizeBeforeUpload?.checked && file.size > MAX_UPLOAD_BYTES) {
        if (uploadStatus) uploadStatus.textContent = `Skaliere ${file.name}...`;
        uploadFile = await downscaleImage(file);
      }

      const form = new FormData();
      form.append('file', uploadFile);
      form.append('upload_preset', preset);
      if (folderPath) form.append('folder', folderPath);

      const data = await uploadWithProgress(form, (percent) => {
        const overall = Math.round(((i + percent / 100) / total) * 100);
        if (uploadProgress) uploadProgress.value = overall;
        if (uploadProgressLabel) {
          uploadProgressLabel.textContent = `${overall}% (${i + 1}/${total})`;
        }
      });
      const url = data.secure_url;
      currentGallery.images.push({
        id: data.public_id,
        name: file.name,
        url,
        thumbnailUrl: buildThumbUrl(url),
        uploadDate: new Date().toISOString(),
        width: data.width,
        height: data.height,
        source: 'cloudinary',
        publicId: data.public_id
      });
      okCount += 1;
    } catch (err) {
      console.error(`Upload Fehler: ${file.name}`, err);
      errorCount += 1;
    }
  }

  imageFilesInput.value = '';
  if (uploadProgress) uploadProgress.value = 100;
  if (uploadProgressLabel) uploadProgressLabel.textContent = '100%';
  renderImageList();
  renderGalleryTable();
  if (uploadStatus) {
    uploadStatus.textContent = `Upload abgeschlossen: ${okCount} erfolgreich, ${errorCount} Fehler.`;
  }
  
  if (okCount > 0) {
    const doSave = confirm(
      `Upload abgeschlossen: ${okCount} Bild(er) erfolgreich hochgeladen!${errorCount > 0 ? `\n(${errorCount} Fehler - siehe Console)` : ''}\n\n` +
      'Möchtest du jetzt zu Schritt 3 springen und die Änderungen zu GitHub pushen?\n\n' +
      '(Ohne Push sind die Bilder nur lokal im Admin sichtbar!)'
    );
    if (doSave) {
      goWizardStep(3);
    }
  } else {
    alert(`Upload fehlgeschlagen: ${errorCount} Fehler (siehe Console)`);
  }
}

async function uploadBestShotFiles(files, side) {
  saveSettings();
  const cloudName = cloudNameInput.value.trim();
  const preset = uploadPresetInput.value.trim();
  if (!cloudName || !preset) {
    alert('Bitte Cloud Name und Upload Preset angeben.');
    return;
  }
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const folderPath = 'portfolio';
  let okCount = 0;
  let errorCount = 0;
  if (bestShotsStatus) bestShotsStatus.textContent = 'Upload startet…';
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    try {
      if (bestShotsStatus) {
        const pct = Math.round(((i) / files.length) * 100);
        bestShotsStatus.textContent = `Upload ${i + 1}/${files.length} · ${pct}%`;
      }
      let uploadFile = file;
      if (resizeBeforeUpload?.checked && file.size > MAX_UPLOAD_BYTES) {
        uploadFile = await downscaleImage(file);
      }
      const form = new FormData();
      form.append('file', uploadFile);
      form.append('upload_preset', preset);
      if (folderPath) form.append('folder', folderPath);
      const res = await fetch(uploadUrl, { method: 'POST', body: form });
      if (!res.ok) {
        errorCount += 1;
        continue;
      }
      const data = await res.json();
      addBestShotFromUrl(side, data.secure_url);
      okCount += 1;
      if (bestShotsStatus) {
        const pct = Math.round(((i + 1) / files.length) * 100);
        bestShotsStatus.textContent = `Upload ${i + 1}/${files.length} · ${pct}%`;
      }
    } catch (_) {
      errorCount += 1;
    }
  }
  if (bestShotsStatus) {
    bestShotsStatus.textContent = `Best Shots Upload: ${okCount} ok, ${errorCount} Fehler.`;
  }
}

function addImageUrl() {
  if (!currentGallery) return;
  const url = imageUrlInput.value.trim();
  if (!url) return;
  currentGallery.images.push({
    id: `img_${Date.now()}`,
    name: url.split('/').pop() || 'Bild',
    url,
    thumbnailUrl: buildThumbUrl(url),
    uploadDate: new Date().toISOString(),
    source: 'url'
  });
  imageUrlInput.value = '';
  renderImageList();
  alert('URL hinzugefügt.');
}

function downloadJson() {
  const data = JSON.stringify(galleryConfig, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gallery.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

async function pushJsonToGitHub() {
  try {
    saveSettings();
    const owner = ghOwnerInput.value.trim();
    const repo = ghRepoInput.value.trim();
    const branch = ghBranchInput.value.trim() || 'main';
    const path = ghPathInput.value.trim() || 'gallery.json';
    const token = ghTokenInput.value.trim();
    if (!owner || !repo || !token) {
      alert('Bitte Owner, Repo und Token angeben.');
      return false;
    }
    if (galleryConfig && typeof galleryConfig === 'object') {
      galleryConfig.generated = new Date().toISOString();
    }
    const json = JSON.stringify(galleryConfig, null, 2);
    const content = btoa(unescape(encodeURIComponent(json)));
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const fetchSha = async () => {
      const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}&_=${Date.now()}`, {
        headers: {
          Authorization: `token ${token}`
        }
      });
      if (!getRes.ok) return null;
      const data = await getRes.json();
      return data.sha || null;
    };

    const tryPut = async (sha) => {
      return await fetch(apiBase, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update gallery.json via admin',
          content,
          branch,
          ...(sha ? { sha } : {})
        })
      });
    };

    // 1) Erster Versuch mit aktuellem SHA
    let sha = await fetchSha();
    let putRes = await tryPut(sha);

    // 2) Wenn SHA-Conflict: EINMAL neu holen und erneut versuchen (ohne Endlosschleife)
    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      const message = err.message || `HTTP ${putRes.status}`;
      const isShaConflict = message.includes('does not match') || message.includes('sha');
      if (isShaConflict) {
        sha = await fetchSha();
        putRes = await tryPut(sha);
      }
    }

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      const message = err.message || `HTTP ${putRes.status}`;
      alert(
        `GitHub Push fehlgeschlagen:\n${message}\n\n` +
        'Bitte Seite neu laden (Cmd+Shift+R) und nochmals versuchen.'
      );
      return false;
    }

    alert(
      '✅ gallery.json erfolgreich zu GitHub gepusht!\n\n' +
      '⏱️ WICHTIG: GitHub Pages braucht 2-10 Minuten für das Update.\n\n' +
      'Danach Galerie-Seite mit Cmd+Shift+R neu laden.'
    );
    return true;
  } catch (err) {
    const message = err?.message || String(err);
    const isNetwork = message.includes('Load failed')
      || message.includes('NetworkError')
      || message.includes('Failed to fetch');
    const extra = isNetwork
      ? '\n\nHinweis: Der Browser blockiert gerade die Verbindung zu api.github.com.\nBitte prüfen:\n- Token noch gültig?\n- Internet/Firewall/Adblocker?\n- Seite neu laden (Cmd+Shift+R)'
      : '';
    alert(`GitHub Push fehlgeschlagen:\n${message}${extra}`);
    return false;
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildCloudinaryFolder() {
  const category = galleryCategorySelect.value || 'galerie';
  const sub = slugify(gallerySubcategoryInput.value || '');
  const folder = slugify(galleryFolderInput.value || '');
  const parts = [category, sub, folder].filter(Boolean);
  return parts.join('/');
}

async function init() {
  initTheme();
  loadSettings();
  cloudNameInput.addEventListener('change', saveSettings);
  uploadPresetInput.addEventListener('change', saveSettings);
  ghOwnerInput.addEventListener('change', saveSettings);
  ghRepoInput.addEventListener('change', saveSettings);
  ghBranchInput.addEventListener('change', saveSettings);
  ghPathInput.addEventListener('change', saveSettings);
  ghTokenInput.addEventListener('change', saveSettings);
  if (resizeMaxSide) resizeMaxSide.addEventListener('change', saveSettings);
  if (resizeQuality) resizeQuality.addEventListener('change', saveSettings);

  const res = await fetch('./gallery.json', { cache: 'no-store' });
  if (!res.ok) {
    alert('gallery.json konnte nicht geladen werden.');
    return;
  }
  galleryConfig = await res.json();
  galleryConfig.galleries = galleryConfig.galleries || [];
  galleryConfig.categories = galleryConfig.categories || [];
  if (Array.isArray(galleryConfig.bestShots) && !galleryConfig.bestShotsLeft && !galleryConfig.bestShotsRight) {
    const midpoint = Math.ceil(galleryConfig.bestShots.length / 2);
    galleryConfig.bestShotsLeft = galleryConfig.bestShots.slice(0, midpoint);
    galleryConfig.bestShotsRight = galleryConfig.bestShots.slice(midpoint);
    delete galleryConfig.bestShots;
  }
  if (!Array.isArray(galleryConfig.bestShotsLeft)) galleryConfig.bestShotsLeft = [];
  if (!Array.isArray(galleryConfig.bestShotsRight)) galleryConfig.bestShotsRight = [];
  galleryConfig.galleries.forEach((g, idx) => {
    if (!g.id) {
      const base = slugify(g.subcategory || g.name || `gallery-${idx}`);
      g.id = `${base || 'gallery'}-${idx}`;
    }
  });
  ensureGalleryOrder();
  sortGalleriesByOrder();

  gallerySortMode = localStorage.getItem('wbg_gallery_sort_mode') || 'manual';
  if (gallerySortModeSelect) {
    gallerySortModeSelect.value = gallerySortMode;
    gallerySortModeSelect.addEventListener('change', () => {
      setSortMode(gallerySortModeSelect.value);
    });
  }

  populateCategories();
  populateGallerySelect();
  if (gallerySelect) loadGalleryFromSelect();
  resetWizardFields();
  updateSuggestions();
  updateTableSortState();
  renderGalleryTable();
  renderBestShots();

  if (gallerySelect) gallerySelect.addEventListener('change', loadGalleryFromSelect);
  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', () => {
      populateGallerySelect();
    });
  }
  if (wizardPrev) wizardPrev.addEventListener('click', () => goWizardStep(wizardStep - 1));
  if (wizardNext) wizardNext.addEventListener('click', async () => {
    if (wizardStep === 1) {
      saveGallery();
      goWizardStep(wizardStep + 1);
      return;
    }
    if (wizardStep === 3) {
      wizardNext.disabled = true;
      try {
        await pushJsonToGitHub();
      } catch (err) {
        alert(`GitHub Push fehlgeschlagen: ${err?.message || err}`);
      } finally {
        wizardNext.disabled = false;
      }
      return;
    }
    goWizardStep(wizardStep + 1);
  });
  saveGalleryBtn.addEventListener('click', saveGallery);
  if (openGalleryBtn) openGalleryBtn.addEventListener('click', openCurrentGallery);
  if (newGalleryBtn) newGalleryBtn.addEventListener('click', createGallery);
  if (wizardNewGalleryBtn) wizardNewGalleryBtn.addEventListener('click', () => {
    resetWizardFields();
    goWizardStep(1);
  });
  if (deleteGalleryBtn) deleteGalleryBtn.addEventListener('click', deleteCurrentGallery);
  if (categoryRenameBtn) categoryRenameBtn.addEventListener('click', renameCategory);
  if (categoryDeleteBtn) categoryDeleteBtn.addEventListener('click', deleteCategory);
  if (galleryTableSearch) galleryTableSearch.addEventListener('input', renderGalleryTable);
  if (galleryTablePasswordFilter) galleryTablePasswordFilter.addEventListener('change', renderGalleryTable);
  if (galleryTableSortButtons.length) {
    galleryTableSortButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        if (gallerySortMode !== 'columns') {
          setSortMode('columns');
        }
        const key = btn.dataset.sort;
        if (!key) return;
        const existingIndex = gallerySort.findIndex(item => item.key === key);
        if (event.shiftKey) {
          if (existingIndex >= 0) {
            gallerySort[existingIndex].dir = gallerySort[existingIndex].dir === 'asc' ? 'desc' : 'asc';
          } else {
            gallerySort = [
              ...gallerySort,
              { key, dir: key === 'date' || key === 'images' ? 'desc' : 'asc' }
            ];
          }
        } else {
          if (existingIndex >= 0 && gallerySort.length === 1) {
            gallerySort = [{ key, dir: gallerySort[existingIndex].dir === 'asc' ? 'desc' : 'asc' }];
          } else {
            gallerySort = [{ key, dir: key === 'date' || key === 'images' ? 'desc' : 'asc' }];
          }
        }
        updateTableSortState();
        renderGalleryTable();
      });
    });
  }
  if (galleryTableBody) {
    galleryTableBody.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      
      const idx = Number(btn.dataset.idx);
      if (Number.isNaN(idx)) return;
      
      if (action === 'auto') {
        autoFillFromFolder(idx);
      } else if (action === 'edit') {
        selectGalleryByIndex(idx, { focusWizard: true });
      } else if (action === 'delete') {
        deleteGalleryByIndex(idx);
      }
    });
    galleryTableBody.addEventListener('dragstart', (event) => {
      const handle = event.target.closest('.drag-handle');
      if (!handle) return;
      dragGalleryId = handle.dataset.galleryId || null;
      if (!dragGalleryId) return;
      const row = event.target.closest('tr');
      if (row) row.classList.add('is-dragging');
      gallerySort = [];
      updateTableSortState();
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', dragGalleryId);
      }
    });
    galleryTableBody.addEventListener('dragover', (event) => {
      const row = event.target.closest('tr');
      if (!row || !dragGalleryId) return;
      if (row.dataset.galleryId === dragGalleryId) return;
      event.preventDefault();
      row.classList.add('is-dragover');
    });
    galleryTableBody.addEventListener('dragleave', (event) => {
      const row = event.target.closest('tr');
      if (!row) return;
      row.classList.remove('is-dragover');
    });
    galleryTableBody.addEventListener('drop', (event) => {
      const row = event.target.closest('tr');
      if (!row || !dragGalleryId) return;
      event.preventDefault();
      const targetId = row.dataset.galleryId;
      row.classList.remove('is-dragover');
      const sourceId = dragGalleryId;
      dragGalleryId = null;
      if (!targetId || sourceId === targetId) return;
      reorderGalleryById(sourceId, targetId);
    });
    galleryTableBody.addEventListener('dragend', (event) => {
      const row = event.target.closest('tr');
      if (row) row.classList.remove('is-dragging');
      Array.from(galleryTableBody.querySelectorAll('tr.is-dragover')).forEach(el => {
        el.classList.remove('is-dragover');
      });
      dragGalleryId = null;
    });
    // Fallback für Safari: Drag per Maus (ohne HTML5 DnD)
    galleryTableBody.addEventListener('mousedown', (event) => {
      const handle = event.target.closest('.drag-handle');
      if (!handle) return;
      event.preventDefault();
      dragGalleryId = handle.dataset.galleryId || null;
      if (!dragGalleryId) return;
      mouseDragActive = true;
      document.body.classList.add('is-dragging');
      const row = event.target.closest('tr');
      if (row) row.classList.add('is-dragging');
      gallerySort = [];
      updateTableSortState();
    });
    galleryTableBody.addEventListener('mousemove', (event) => {
      if (!mouseDragActive || !dragGalleryId) return;
      const row = event.target.closest('tr');
      if (!row) return;
      const targetId = row.dataset.galleryId;
      if (!targetId || targetId === dragGalleryId) return;
      if (hoverGalleryId !== targetId) {
        hoverGalleryId = targetId;
        Array.from(galleryTableBody.querySelectorAll('tr.is-dragover')).forEach(el => {
          el.classList.remove('is-dragover');
        });
        row.classList.add('is-dragover');
      }
    });
    document.addEventListener('mouseup', () => {
      if (!mouseDragActive || !dragGalleryId) return;
      const sourceId = dragGalleryId;
      const targetId = hoverGalleryId;
  resetDragState();
      if (!targetId || sourceId === targetId) return;
      reorderGalleryById(sourceId, targetId);
    });
    galleryTableBody.addEventListener('change', (event) => {
      const fieldEl = event.target.closest('[data-field]');
      if (!fieldEl) return;
      const idx = Number(fieldEl.dataset.idx);
      if (Number.isNaN(idx)) return;
      const field = fieldEl.dataset.field;
      if (!field) return;
      const value = fieldEl.type === 'checkbox' ? fieldEl.checked : fieldEl.value;
      updateGalleryField(idx, field, value);
    });
  }
  uploadImagesBtn.addEventListener('click', uploadFiles);
  addUrlBtn.addEventListener('click', addImageUrl);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadJson);
  if (pushBtn) pushBtn.addEventListener('click', pushJsonToGitHub);
  if (globalPushBtn) globalPushBtn.addEventListener('click', pushJsonToGitHub);
  if (saveOrderBtn) saveOrderBtn.addEventListener('click', async () => {
    const owner = ghOwnerInput.value.trim();
    const repo = ghRepoInput.value.trim();
    const token = ghTokenInput.value.trim();
    if (!owner || !repo || !token) {
      if (galleryOrderStatus) {
        galleryOrderStatus.textContent = 'Bitte Owner, Repo und Token in Schritt 3 eintragen.';
      }
      goWizardStep(3);
      const wizardSection = document.querySelector('.admin-wizard');
      if (wizardSection) wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      alert('Bitte Owner, Repo und Token in Schritt 3 eintragen.');
      return;
    }
    if (galleryOrderStatus) galleryOrderStatus.textContent = 'Speichere Reihenfolge zu GitHub…';
    const ok = await pushJsonToGitHub();
    if (galleryOrderStatus) {
      galleryOrderStatus.textContent = ok
        ? 'Reihenfolge gespeichert. Bitte Startseite mit Cmd+Shift+R neu laden.'
        : 'Speichern fehlgeschlagen. Bitte nochmals versuchen.';
    }
  });
  if (applyPrivateFixBtn) applyPrivateFixBtn.addEventListener('click', applyPrivateFix);
  if (clearGalleryImagesBtn) clearGalleryImagesBtn.addEventListener('click', clearGalleryImages);
  if (cleanGalleryImagesBtn) cleanGalleryImagesBtn.addEventListener('click', cleanGalleryImages);

  adminLoginBtn.addEventListener('click', handleLogin);
  adminLoginInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  adminChangePasswordBtn.addEventListener('click', () => {
    const current = adminCurrentPassword.value.trim();
    const next = adminNewPassword.value.trim();
    const saved = getAdminPassword();
    if (saved && current !== saved) {
      alert('Aktuelles Passwort ist falsch.');
      return;
    }
    if (!next) {
      alert('Neues Passwort darf nicht leer sein.');
      return;
    }
    setAdminPassword(next);
    adminCurrentPassword.value = '';
    adminNewPassword.value = '';
    alert('Passwort gespeichert.');
  });

  if (uploadDropzone) {
    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.classList.add('is-dragover');
    });
    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.classList.remove('is-dragover');
    });
    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('is-dragover');
      if (e.dataTransfer?.files?.length) {
        // Leere File-Input um Duplikate zu vermeiden
        if (imageFilesInput) imageFilesInput.value = '';
        openUploadModal(Array.from(e.dataTransfer.files));
      }
    });
  }

  if (uploadCancelBtn) uploadCancelBtn.addEventListener('click', closeUploadModal);
  if (uploadModal) {
    uploadModal.addEventListener('click', (event) => {
      if (event.target === uploadModal) closeUploadModal();
    });
  }
  if (uploadConfirmBtn) {
    uploadConfirmBtn.addEventListener('click', async () => {
      if (!pendingUploadFiles.length) {
        closeUploadModal();
        return;
      }
      const filesToUpload = pendingUploadFiles.slice();
      const newCategoryName = uploadNewCategoryInput?.value || '';
      const categoryId = newCategoryName.trim()
        ? ensureCategoryByName(newCategoryName)
        : (uploadCategorySelect?.value || galleryCategorySelect?.value || '');
      const subValue = (uploadSubcategoryInput?.value || '').trim();
      const folderValue = (uploadFolderInput?.value || '').trim();
      const dateValue = uploadDateInput?.value || '';
      if (!categoryId || !subValue) {
        alert('Bitte mindestens Kategorie und Unterkategorie angeben.');
        return;
      }
      const targetGallery = getOrCreateGallery({
        categoryId,
        subcategory: subValue,
        folder: folderValue,
        date: dateValue
      });
      populateGallerySelect();
      const idx = (galleryConfig.galleries || []).indexOf(targetGallery);
      if (idx >= 0) gallerySelect.value = String(idx);
      loadGalleryFromSelect();
      galleryCategorySelect.value = categoryId;
      gallerySubcategoryInput.value = subValue;
      galleryFolderInput.value = folderValue;
      galleryDateInput.value = dateValue;
      currentGallery = targetGallery;
      closeUploadModal({ reset: false });
      await uploadFilesWithFiles(filesToUpload);
      pendingUploadFiles = [];
    });
  }

  if (adminImageList) {
    adminImageList.addEventListener('click', (event) => {
      const bestLeftBtn = event.target.closest('button[data-action="best-shot-left"]');
      if (bestLeftBtn && currentGallery) {
        const idx = Number(bestLeftBtn.dataset.idx);
        if (!Number.isNaN(idx)) {
          addBestShot('left', currentGallery.images[idx]);
        }
        return;
      }
      const bestRightBtn = event.target.closest('button[data-action="best-shot-right"]');
      if (bestRightBtn && currentGallery) {
        const idx = Number(bestRightBtn.dataset.idx);
        if (!Number.isNaN(idx)) {
          addBestShot('right', currentGallery.images[idx]);
        }
        return;
      }
      const btn = event.target.closest('button[data-action="delete-image"]');
      if (!btn) return;
      const idx = Number(btn.dataset.idx);
      if (Number.isNaN(idx) || !currentGallery) return;
      const ok = confirm('Bild wirklich löschen?');
      if (!ok) return;
      currentGallery.images.splice(idx, 1);
      renderImageList();
      renderGalleryTable();
    });
  }

  if (bestShotsListLeft || bestShotsListRight) {
    const handler = (event) => {
      const btn = event.target.closest('button[data-action="remove-best-shot"]');
      if (!btn) return;
      const idx = Number(btn.dataset.idx);
      const side = btn.dataset.side || 'left';
      if (Number.isNaN(idx)) return;
      removeBestShot(side, idx);
    };
    if (bestShotsListLeft) bestShotsListLeft.addEventListener('click', handler);
    if (bestShotsListRight) bestShotsListRight.addEventListener('click', handler);
  }

  if (clearBestShotsBtn) {
    clearBestShotsBtn.addEventListener('click', () => {
      const left = getBestShots('left');
      const right = getBestShots('right');
      if (!left.length && !right.length) return;
      const ok = confirm('Alle Best Shots wirklich löschen?');
      if (!ok) return;
      galleryConfig.bestShotsLeft = [];
      galleryConfig.bestShotsRight = [];
      renderBestShots();
    });
  }

  if (saveBestShotsBtn) {
    saveBestShotsBtn.addEventListener('click', async () => {
      const owner = ghOwnerInput.value.trim();
      const repo = ghRepoInput.value.trim();
      const token = ghTokenInput.value.trim();
      if (!owner || !repo || !token) {
        if (bestShotsStatus) {
          bestShotsStatus.textContent = 'Bitte Owner, Repo und Token in Schritt 3 eintragen.';
        }
        goWizardStep(3);
        const wizardSection = document.querySelector('.admin-wizard');
        if (wizardSection) wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        alert('Bitte Owner, Repo und Token in Schritt 3 eintragen.');
        return;
      }
      if (bestShotsStatus) bestShotsStatus.textContent = 'Speichere Best Shots zu GitHub…';
      const ok = await pushJsonToGitHub();
      if (bestShotsStatus) {
        bestShotsStatus.textContent = ok
          ? 'Best Shots gespeichert. Bitte Startseite mit Cmd+Shift+R neu laden.'
          : 'Speichern fehlgeschlagen. Bitte nochmals versuchen.';
      }
    });
  }

  if (adminImageList) {
    adminImageList.addEventListener('dragstart', (event) => {
      const item = event.target.closest('.admin-image-item');
      if (!item || !currentGallery) return;
      const idx = Number(item.dataset.imageIdx);
      if (Number.isNaN(idx)) return;
      const img = currentGallery.images[idx];
      const payload = JSON.stringify({
        galleryId: currentGallery.id,
        imageId: img.publicId || img.id || img.name || '',
        url: img.url || img.thumbnailUrl || ''
      });
      if (event.dataTransfer) {
        event.dataTransfer.setData('application/json', payload);
        event.dataTransfer.effectAllowed = 'copy';
      }
    });
  }

  const setupBestShotDrop = (dropEl, side) => {
    if (!dropEl) return;
    dropEl.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropEl.classList.add('is-dragover');
    });
    dropEl.addEventListener('dragleave', () => dropEl.classList.remove('is-dragover'));
    dropEl.addEventListener('drop', (event) => {
      event.preventDefault();
      dropEl.classList.remove('is-dragover');
      const files = Array.from(event.dataTransfer?.files || []);
      if (files.length) {
        uploadBestShotFiles(files, side);
        return;
      }
      const data = event.dataTransfer?.getData('application/json');
      if (!data) return;
      try {
        const parsed = JSON.parse(data);
        const gallery = (galleryConfig?.galleries || []).find(g => g.id === parsed.galleryId);
        const img = (gallery?.images || []).find(i => (i.publicId || i.id || i.name) === parsed.imageId);
        if (img) {
          currentGallery = gallery;
          addBestShot(side, img);
        }
      } catch (_) {
        // ignore
      }
    });
    dropEl.addEventListener('click', () => {
      if (side === 'left' && bestShotsFileLeft) bestShotsFileLeft.click();
      if (side === 'right' && bestShotsFileRight) bestShotsFileRight.click();
    });
  };
  setupBestShotDrop(bestShotsDropLeft, 'left');
  setupBestShotDrop(bestShotsDropRight, 'right');

  if (bestShotsPickLeft && bestShotsFileLeft) {
    bestShotsPickLeft.addEventListener('click', () => bestShotsFileLeft.click());
    bestShotsFileLeft.addEventListener('change', () => {
      const files = Array.from(bestShotsFileLeft.files || []);
      if (files.length) uploadBestShotFiles(files, 'left');
      bestShotsFileLeft.value = '';
    });
  }
  if (bestShotsPickRight && bestShotsFileRight) {
    bestShotsPickRight.addEventListener('click', () => bestShotsFileRight.click());
    bestShotsFileRight.addEventListener('change', () => {
      const files = Array.from(bestShotsFileRight.files || []);
      if (files.length) uploadBestShotFiles(files, 'right');
      bestShotsFileRight.value = '';
    });
  }

  renderWizard();
}

init();

if (getAdminPassword()) {
  showLogin();
} else {
  adminLoginHint.textContent = 'Kein Passwort gesetzt. Bitte ein neues Passwort speichern.';
  showAdminApp();
}
