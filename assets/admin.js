const cloudNameInput = document.getElementById('cloud-name');
const uploadPresetInput = document.getElementById('upload-preset');
const gallerySelect = document.getElementById('gallery-select');
const galleryNameInput = document.getElementById('gallery-name');
const galleryDescInput = document.getElementById('gallery-description');
const galleryCategorySelect = document.getElementById('gallery-category');
const galleryPasswordInput = document.getElementById('gallery-password');
const imageFilesInput = document.getElementById('image-files');
const imageUrlInput = document.getElementById('image-url');

const newGalleryBtn = document.getElementById('new-gallery-btn');
const saveGalleryBtn = document.getElementById('save-gallery-btn');
const uploadImagesBtn = document.getElementById('upload-images-btn');
const addUrlBtn = document.getElementById('add-url-btn');
const downloadBtn = document.getElementById('download-json-btn');

let galleryConfig = null;
let currentGallery = null;

function loadSettings() {
  cloudNameInput.value = localStorage.getItem('wbg_cloud_name') || '';
  uploadPresetInput.value = localStorage.getItem('wbg_upload_preset') || '';
}

function saveSettings() {
  localStorage.setItem('wbg_cloud_name', cloudNameInput.value.trim());
  localStorage.setItem('wbg_upload_preset', uploadPresetInput.value.trim());
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
  galleries.forEach((gallery, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = gallery.name || `Galerie ${idx + 1}`;
    gallerySelect.appendChild(opt);
  });
}

function loadGalleryFromSelect() {
  const idx = Number(gallerySelect.value);
  currentGallery = (galleryConfig?.galleries || [])[idx] || null;
  if (!currentGallery) return;
  galleryNameInput.value = currentGallery.name || '';
  galleryDescInput.value = currentGallery.description || '';
  galleryCategorySelect.value = currentGallery.category || '';
  galleryPasswordInput.value = currentGallery.password || '';
}

function saveGallery() {
  if (!currentGallery) return;
  currentGallery.name = galleryNameInput.value.trim();
  currentGallery.description = galleryDescInput.value.trim();
  currentGallery.category = galleryCategorySelect.value;
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

  for (const file of files) {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', preset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      alert(`Upload fehlgeschlagen: ${file.name}`);
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

async function init() {
  loadSettings();
  cloudNameInput.addEventListener('change', saveSettings);
  uploadPresetInput.addEventListener('change', saveSettings);

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
  saveGalleryBtn.addEventListener('click', saveGallery);
  newGalleryBtn.addEventListener('click', createGallery);
  uploadImagesBtn.addEventListener('click', uploadFiles);
  addUrlBtn.addEventListener('click', addImageUrl);
  downloadBtn.addEventListener('click', downloadJson);
}

init();
