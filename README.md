# WB Foto Manager – WebApp (Standalone)

Diese WebApp ist vom macOS‑Projekt getrennt.

## Struktur
- `index.html` – Startseite mit Kategorien & Galerien
- `gallery.html` – Galerieansicht (Grid + Lightbox)
- `admin.html` – Admin (Uploads + JSON Export)
- `assets/` – CSS/JS
- `gallery.json` – Datenquelle (Cloudinary)

## Hosting
Für GitHub Pages den Ordner `WebAppStandalone/` als Root veröffentlichen (separates Repo empfohlen).

## Admin-Upload
- Cloudinary *Unsigned Upload Preset* erforderlich
- In `admin.html` Cloud Name + Upload Preset eingeben
- Danach `gallery.json` herunterladen und im Repo ersetzen
