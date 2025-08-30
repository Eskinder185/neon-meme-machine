# MemeForge (Neon Meme Studio) ⚡

Create crispy memes with neon glow, auto-fit text, drag-to-position, and one-click export.  
Installable **PWA** that works **offline**.

![badge](https://img.shields.io/badge/PWA-Ready-00e5ff) ![badge](https://img.shields.io/badge/Export-2×%2F3×-7a5cff) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚀 Live Demo
**https://eskinder185.github.io/neon-meme-machine/**


## 📈 Lighthouse (Desktop)
Performance + PWA scores from the deployed site.

![Lighthouse](docs/lighthouse.png)

Full report: [`docs/lighthouse-report.html`](docs/lighthouse-report.html)

---

## ✨ Features
- **Neon canvas renderer**: auto-contrast text, stroke, optional glow
- **Drag to position** top/bottom captions
- **2× / 3× hi-res PNG export**
- **Local gallery** (this device) with download/delete
- **Share links** (state encoded in URL)
- **Installable PWA** + **offline-first** (service worker caching)
- Fun **random captions** & keyboard shortcuts (D = download, R = render, ⌘/Ctrl+S = save)

---

## 🧰 Tech
HTML, CSS, JavaScript (Canvas), Service Worker, Manifest  
No backend; privacy-friendly by design.

---

## 🏁 Quick Start (local)
```bash
npm i
npm run start     # serves at http://localhost:5173
