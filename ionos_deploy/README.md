# LexiMix v3.5.2 - Deployment Package

## 📦 Inhalt des ionos_deploy Ordners

Dieser Ordner enthält alle Dateien für das Deployment auf dem IONOS Server.

### Web-Dateien (Root)
- `index.html` - Haupt-HTML-Datei
- `favicon.png`, `logo*.png` - Branding Assets
- `background_*.png` - Hintergrundbilder
- `changelog.json` - Update-Informationen
- `version.json` - Versions-Info
- `season_settings.json` - Season-Konfiguration
- `clear-storage.html` - LocalStorage Reset Tool

### API-Ordner (`/api`)
**Authentifizierung:**
- `register.php` - Benutzerregistrierung mit E-Mail-Verifikation
- `login.php` - Login-Logik
- `verify.php` - E-Mail-Bestätigung

**Email:**
- `smtp_mailer.php` - SMTP-Mailer (SSL/465, noreply@leximix.de)

**Cloud Saves:**
- `save_cloud.php` - Cloud Save speichern
- `load_cloud.php` - Cloud Save laden
- `friends.php` - Freunde-System
- `voucher.php` - Gutschein-System

**Datenbank:**
- `db_connect.php` - MySQL-Verbindung

### Assets-Ordner (`/assets`)
- `index-*.js` - JavaScript Bundle
- `index-*.css` - Styles Bundle  
- `matchmaking-*.js` - Multiplayer Code
- `cat-dance-*.gif` - Cat Dance Animation
- `/season/` - Season 1 Avatare
- `/season2/` - Season 2 Avatare (TBD)
- `/skat_karten/` - Mau Mau Karten

### Music-Ordner (`/music`)
- `happy-video-game-music-geometry-dash-type-beat-431059.mp3` - Game Music (784 KB)

### APK (`/`)
- `LexiMix-v3.5.2-Release.apk` - Android APK (59.9 MB)

## 🚀 Upload-Anleitung

### Struktur auf IONOS Server:
```
public/
├── index.html
├── favicon.png
├── ...
├── api/
│   ├── register.php
│   ├── smtp_mailer.php
│   └── ...
├── assets/
│   ├── index-*.js
│   └── ...
├── music/
│   └── happy-video-game-music-geometry-dash-type-beat-431059.mp3
└── LexiMix-v3.5.2-Release.apk
```

### SFTP Credentials:
- **Host:** access-5019066038.webspace-host.com
- **Port:** 22
- **Username:** su357282
- **Password:** TK##2024

### Upload-Schritte:
1. Verbinde via SFTP zum Server
2. Navigiere zu `public/`
3. Kopiere **alle** Dateien aus `ionos_deploy/` nach `public/`
4. Achte darauf, dass die Ordnerstruktur erhalten bleibt

## ✅ Funktionen in v3.5.2

### Neu:
- ✅ E-Mail-Verifikation mit Bestätigungslink
- ✅ SMTP-Email-Versand (SSL/465)  
- ✅ **MusicPlayer im Brutalism-Style** (lokale MP3, unten links)
- ✅ Changelog für v3.5.2

### Features:
- Email: noreply@leximix.de (TK##2024)
- DB: MySQL auf IONOS
- Cloud Saves funktionieren
- Season System aktiv
- Multiplayer Ready

## 🎵 MusicPlayer

- **Position:** Unten links, fixed
- **Design:** Brutalism (skewed, bold colors)
- **Farben:** 
  - Play: #FF006E (Pink)
  - Pause: #06FFA5 (Grün)
  - Volume: #FFBE0B (Gelb)
- **Features:**
  - Play/Pause Toggle
  - Volume Slider
  - Mute Button
  - Loop aktiviert

---
**Version:** 3.5.2  
**Build:** 352  
**Datum:** 10.12.2025
