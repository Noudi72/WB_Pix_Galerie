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

const newGalleryBtn = document.getElementById('new-gallery-btn');
const saveGalleryBtn = document.getElementById('save-gallery-btn');
const uploadImagesBtn = document.getElementById('upload-images-btn');
const addUrlBtn = document.getElementById('add-url-btn');
const downloadBtn = document.getElementById('download-json-btn');
const pushBtn = document.getElementById('push-json-btn');

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

function getAdminPassword() {
  return localStorage.getItem('wbg_admin_password') || '';
}

function setAdminPassword(pwd) {
  localStorage.setItem('wbg_admin_password', pwd);
}

function showAdminApp() {
  adminLogin.style.display = 'none';
  adminApp.style.display = 'block';
}

function showLogin() {
  adminApp.style.display = 'none';
  adminLogin.style.display = 'block';
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

function populateCategories() {
  galleryCategorySelect.innerHTML = '';
  const categories = galleryConfig?.categories || [];
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    galleryCategorySelect.appendChild(opt);
  });
}

function populateGallerySelect() {
  gallerySelect.innerHTML = '';
  const galleries = galleryConfig?.galleries || [];
  const query = (gallerySearchInput?.value || '').trim().toLowerCase();
  const options = [];
  galleries.forEach((gallery, idx) => {
    const label = `${gallery.name || ''} ${gallery.subcategory || ''} ${gallery.folder || ''} ${gallery.date || ''}`.toLowerCase();
    if (query && !label.includes(query)) return;
    const opt = document.createElement('option');
    opt.value = String(idx);
    const meta = [gallery.subcategory, gallery.folder, gallery.date].filter(Boolean).join(' · ');
    opt.textContent = meta ? `${gallery.name || `Galerie ${idx + 1}`} (${meta})` : (gallery.name || `Galerie ${idx + 1}`);
    options.push(opt);
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
  if (!gallerySelect.value) gallerySelect.value = options[0].value;
  loadGalleryFromSelect();
}

function loadGalleryFromSelect() {
  const idx = Number(gallerySelect.value);
  currentGallery = (galleryConfig?.galleries || [])[idx] || null;
  if (!currentGallery) return;
  galleryNameInput.value = currentGallery.name || '';
  galleryDescInput.value = currentGallery.description || '';
  galleryCategorySelect.value = currentGallery.category || '';
  gallerySubcategoryInput.value = currentGallery.subcategory || '';
  galleryFolderInput.value = currentGallery.folder || '';
  galleryDateInput.value = currentGallery.date || '';
  galleryPasswordInput.value = currentGallery.password || '';
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
  currentGallery.name = galleryNameInput.value.trim();
  currentGallery.description = galleryDescInput.value.trim();
  currentGallery.category = galleryCategorySelect.value;
  currentGallery.subcategory = gallerySubcategoryInput.value.trim();
  currentGallery.folder = galleryFolderInput.value.trim();
  currentGallery.date = galleryDateInput.value || '';
  const pwd = galleryPasswordInput.value.trim();
  if (pwd) currentGallery.password = pwd;
  else delete currentGallery.password;
  populateGallerySelect();
}

function createGallery() {
  const id = `gallery-${Date.now()}`;
  const category = galleryCategorySelect.value || (galleryConfig.categories?.[0]?.id || 'all');
  const newGallery = {
    id,
    name: 'Neue Galerie',
    description: '',
    images: [],
    category
  };
  galleryConfig.galleries.push(newGallery);
  populateGallerySelect();
  gallerySelect.value = String(galleryConfig.galleries.length - 1);
  loadGalleryFromSelect();
}

async function uploadFiles() {
  saveSettings();
  if (!currentGallery) return;
  if (uploadStatus) uploadStatus.textContent = '';
  const cloudName = cloudNameInput.value.trim();
  const preset = uploadPresetInput.value.trim();
  const files = Array.from(imageFilesInput.files || []);
  if (!cloudName || !preset) {
    alert('Bitte Cloud Name und Upload Preset angeben.');
    return;
  }
  if (!files.length) {
    alert('Bitte mindestens eine Datei auswählen.');
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

  gallerySelect.addEventListener('change', loadGalleryFromSelect);
  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', () => {
      populateGallerySelect();
    });
  }
  saveGalleryBtn.addEventListener('click', saveGallery);
  newGalleryBtn.addEventListener('click', createGallery);
  uploadImagesBtn.addEventListener('click', uploadFiles);
  addUrlBtn.addEventListener('click', addImageUrl);
  downloadBtn.addEventListener('click', downloadJson);
  pushBtn.addEventListener('click', pushJsonToGitHub);

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
        imageFilesInput.files = e.dataTransfer.files;
        uploadFiles();
      }
    });
  }
}

init();

if (getAdminPassword()) {
  showLogin();
} else {
  adminLoginHint.textContent = 'Kein Passwort gesetzt. Bitte ein neues Passwort speichern.';
  showAdminApp();
}
