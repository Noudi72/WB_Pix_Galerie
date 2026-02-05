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
const galleryTableStatus = document.getElementById('gallery-table-status');
const galleryTableSortButtons = galleryTable?.querySelectorAll('.table-sort') || [];
const globalPushBtn = document.getElementById('push-json-global-btn');
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

function closeUploadModal() {
  if (!uploadModal) return;
  uploadModal.classList.add('is-hidden');
  pendingUploadFiles = [];
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
  const match = galleries.find(g => (g.category || '') === categoryId
    && (g.subcategory || '') === subcategory
    && (g.folder || '') === folder
    && (g.date || '') === (date || ''));
  if (match) return match;
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

  const compareText = (a, b) => (a || '').localeCompare(b || '', 'de');
  const compareNum = (a, b) => (a || 0) - (b || 0);
  const compareBool = (a, b) => Number(Boolean(a)) - Number(Boolean(b));
  rows.sort((a, b) => {
    const ga = a.gallery;
    const gb = b.gallery;
    const sortList = gallerySort.length ? gallerySort : [{ key: 'name', dir: 'asc' }];
    for (const sort of sortList) {
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

  galleryTableBody.innerHTML = '';
  rows.forEach(({ gallery, idx }) => {
    const tr = document.createElement('tr');
    const count = gallery.images?.length || 0;
    if (!gallery.subcategory && gallery.name) {
      gallery.subcategory = gallery.name;
    }
    const sub = gallery.subcategory || '';
    const folder = normalizeFolderValue(gallery, count);
    const date = gallery.date || '';
    const hasPassword = Boolean(gallery.password);
    const passwordLabel = hasPassword ? 'Geschützt' : 'Öffentlich';
    const pathParts = [getCategoryName(gallery.category), sub, folder].filter(Boolean);
    const pathLabel = pathParts.length ? pathParts.join(' / ') : '—';
    tr.innerHTML = `
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
  gallerySelect.value = String(idx);
  loadGalleryFromSelect();
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

function updateGalleryField(idx, field, value) {
  const gallery = (galleryConfig?.galleries || [])[idx];
  if (!gallery) return;
  gallery[field] = value || '';
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
    const thumb = buildThumbUrl(resolveUrl(img.thumbnailUrl || img.url), 180, 120);
    item.innerHTML = `
      <img class="admin-image-thumb" src="${thumb}" alt="">
      <div class="admin-image-meta">
        <strong>${img.name || 'Bild'}</strong>
        <span>${img.url ? img.url.split('/').slice(-1)[0] : ''}</span>
      </div>
      <button class="btn danger" data-action="delete-image" data-idx="${idx}">Bild löschen</button>
    `;
    adminImageList.appendChild(item);
  });
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

function cleanGalleryImages() {
  if (!currentGallery) return;
  const before = currentGallery.images?.length || 0;
  currentGallery.images = (currentGallery.images || []).filter(img => img && (img.url || img.thumbnailUrl));
  const after = currentGallery.images.length;
  renderImageList();
  renderGalleryTable();
  alert(`Bereinigt: ${before - after} Einträge entfernt.`);
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
  const idx = Number(gallerySelect.value);
  currentGallery = (galleryConfig?.galleries || [])[idx] || null;
  if (!currentGallery) return;
  if (galleryNameInput) galleryNameInput.value = currentGallery.name || '';
  galleryDescInput.value = currentGallery.description || '';
  galleryCategorySelect.value = currentGallery.category || '';
  const subValue = currentGallery.subcategory || currentGallery.name || '';
  gallerySubcategoryInput.value = subValue;
  if (!currentGallery.subcategory && subValue) {
    currentGallery.subcategory = subValue;
  }
  galleryFolderInput.value = currentGallery.folder || '';
  galleryDateInput.value = currentGallery.date || '';
  galleryPasswordInput.value = currentGallery.password || '';
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
  if (!currentGallery) return;
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
  populateGallerySelect();
  gallerySelect.value = String(galleryConfig.galleries.length - 1);
  loadGalleryFromSelect();
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
  if (!currentGallery) return;
  if (uploadStatus) uploadStatus.textContent = '';
  const cloudName = cloudNameInput.value.trim();
  const preset = uploadPresetInput.value.trim();
  if (!cloudName || !preset) {
    alert('Bitte Cloud Name und Upload Preset angeben.');
    return;
  }

  const folderPath = buildCloudinaryFolder();
  for (const file of files) {
    let uploadFile = file;
    if (resizeBeforeUpload?.checked && file.size > MAX_UPLOAD_BYTES) {
      if (uploadStatus) uploadStatus.textContent = `Skaliere ${file.name}...`;
      uploadFile = await downscaleImage(file);
    }
    const form = new FormData();
    form.append('file', uploadFile);
    form.append('upload_preset', preset);
    if (folderPath) form.append('folder', folderPath);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Upload fehlgeschlagen: ${file.name}\n${err?.error?.message || res.status}`);
      continue;
    }
    const data = await res.json();
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
  }

  imageFilesInput.value = '';
  renderImageList();
  alert('Upload abgeschlossen.');
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
  saveSettings();
  const owner = ghOwnerInput.value.trim();
  const repo = ghRepoInput.value.trim();
  const branch = ghBranchInput.value.trim() || 'main';
  const path = ghPathInput.value.trim() || 'gallery.json';
  const token = ghTokenInput.value.trim();
  if (!owner || !repo || !token) {
    alert('Bitte Owner, Repo und Token angeben.');
    return;
  }
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(galleryConfig, null, 2))));
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  let sha = null;
  try {
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
      headers: { Authorization: `token ${token}` }
    });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch (_) {}

  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update gallery.json via admin',
      content,
      branch,
      sha: sha || undefined
    })
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    alert(`GitHub Push fehlgeschlagen: ${err.message || putRes.status}`);
    return;
  }
  alert('gallery.json erfolgreich zu GitHub gepusht.');
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

  populateCategories();
  populateGallerySelect();
  loadGalleryFromSelect();
  updateSuggestions();
  updateTableSortState();
  renderGalleryTable();

  gallerySelect.addEventListener('change', loadGalleryFromSelect);
  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', () => {
      populateGallerySelect();
    });
  }
  if (wizardPrev) wizardPrev.addEventListener('click', () => goWizardStep(wizardStep - 1));
  if (wizardNext) wizardNext.addEventListener('click', () => {
    if (wizardStep === 1) saveGallery();
    goWizardStep(wizardStep + 1);
  });
  saveGalleryBtn.addEventListener('click', saveGallery);
  if (openGalleryBtn) openGalleryBtn.addEventListener('click', openCurrentGallery);
  newGalleryBtn.addEventListener('click', createGallery);
  if (wizardNewGalleryBtn) wizardNewGalleryBtn.addEventListener('click', createGallery);
  if (deleteGalleryBtn) deleteGalleryBtn.addEventListener('click', deleteCurrentGallery);
  if (categoryRenameBtn) categoryRenameBtn.addEventListener('click', renameCategory);
  if (categoryDeleteBtn) categoryDeleteBtn.addEventListener('click', deleteCategory);
  if (galleryTableSearch) galleryTableSearch.addEventListener('input', renderGalleryTable);
  if (galleryTablePasswordFilter) galleryTablePasswordFilter.addEventListener('change', renderGalleryTable);
  if (galleryTableSortButtons.length) {
    galleryTableSortButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
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
      const idx = Number(btn.dataset.idx);
      if (Number.isNaN(idx)) return;
      const action = btn.dataset.action;
      if (action === 'auto') {
        autoFillFromFolder(idx);
      } else if (action === 'edit') {
        selectGalleryByIndex(idx, { focusWizard: true });
      } else if (action === 'delete') {
        deleteGalleryByIndex(idx);
      }
    });
    galleryTableBody.addEventListener('change', (event) => {
      const fieldEl = event.target.closest('[data-field]');
      if (!fieldEl) return;
      const idx = Number(fieldEl.dataset.idx);
      if (Number.isNaN(idx)) return;
      const field = fieldEl.dataset.field;
      if (!field) return;
      updateGalleryField(idx, field, fieldEl.value);
    });
  }
  uploadImagesBtn.addEventListener('click', uploadFiles);
  addUrlBtn.addEventListener('click', addImageUrl);
  downloadBtn.addEventListener('click', downloadJson);
  pushBtn.addEventListener('click', pushJsonToGitHub);
  if (globalPushBtn) globalPushBtn.addEventListener('click', pushJsonToGitHub);
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
      closeUploadModal();
      await uploadFilesWithFiles(pendingUploadFiles);
    });
  }

  if (adminImageList) {
    adminImageList.addEventListener('click', (event) => {
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

  renderWizard();
}

init();

if (getAdminPassword()) {
  showLogin();
} else {
  adminLoginHint.textContent = 'Kein Passwort gesetzt. Bitte ein neues Passwort speichern.';
  showAdminApp();
}
