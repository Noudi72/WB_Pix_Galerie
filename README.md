# WB Foto Manager – WebApp (Standalone)

Diese WebApp ist vom macOS-Projekt getrennt und läuft weiterhin kostenfrei als statische GitHub-Pages-Seite mit Cloudinary-Bildern.

## Struktur
- `index.html` – Startseite mit Kategorien & Galerien
- `gallery.html` – Galerieansicht (Grid + Lightbox)
- `admin.html` – Admin Dashboard für Branding, Portfolio, Galerien und Upload
- `assets/` – CSS/JS
- `gallery.json` – Datenquelle für Galerien, Portfolio und veröffentlichte Branding-Einstellungen

## Hosting
Für GitHub Pages den Ordner `WebAppStandalone/` als Root veröffentlichen (separates Repo empfohlen).

## Admin-Upload
- Cloudinary *Unsigned Upload Preset* erforderlich
- In `admin.html` Cloud Name + Upload Preset eingeben
- Danach Änderungen im Admin Dashboard mit **Änderungen veröffentlichen** nach GitHub schreiben
- Empfohlener Ablauf im Admin: **Auftritt festlegen → Galerie befüllen → Veröffentlichen**.
- Cloudinary- und GitHub-Felder sind als technische Einstellungen einklappbar, damit der normale Upload-Workflow übersichtlich bleibt.

## Branding
- Logo, Logo-Breite, Titel und Font werden in `gallery.json` unter `siteSettings` gespeichert.
- Dadurch sehen andere Rechner und iPhones nach dem GitHub-Pages-Update dasselbe Logo.
- Der Dateiname des Logos ist nicht zwingend `logo_wb.png`; der Pfad wird beim Upload im Admin gespeichert.
- Bei gleichem Dateipfad wird automatisch ein Versionsparameter genutzt, damit Browser-Caches nicht das alte Logo behalten.
