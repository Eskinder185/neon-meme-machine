// ==== State ====
const el = (id) => document.getElementById(id);
const canvas = el('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// ==== Navigation & Theme System ====
let currentPage = 'home';

// Initialize theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('memeLab-theme') || 'dark';
  applyTheme(savedTheme);
  updateThemeIcon(savedTheme);
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('memeLab-theme', newTheme);
  updateThemeIcon(newTheme);
}

// Apply theme to document
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
}

// Update theme icon
function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Navigation system
function showPage(pageId) {
  // Fast page switching with optimized DOM manipulation
  const targetPage = document.getElementById(pageId + 'Page');
  if (!targetPage) return;
  
  // Get current active page
  const currentActivePage = document.querySelector('.page.active');
  
  // If already on this page, do nothing
  if (currentActivePage === targetPage) return;
  
  // Update current page
  currentPage = pageId;
  
  // Update navigation (batch DOM updates)
  requestAnimationFrame(() => {
    // Remove active class from all pages and nav links
    document.querySelectorAll('.page.active, .nav-link.active').forEach(el => {
      el.classList.remove('active');
    });
    
    // Add active class to target page and nav link
    targetPage.classList.add('active');
    const navLink = document.querySelector(`[data-page="${pageId}"]`);
    if (navLink) navLink.classList.add('active');
    
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('page', pageId);
    window.history.pushState({ page: pageId }, '', url);
    
    // Load page-specific content
    loadPageContent(pageId);
  });
}

// Load page-specific content efficiently
function loadPageContent(pageId) {
  switch(pageId) {
    case 'home':
      loadFeaturedMemes();
      break;
    case 'forge':
      renderGallery();
      break;
    case 'faq':
      // FAQ is already initialized
      break;
    case 'about':
      // About page is static
      break;
  }
}

// Initialize from URL
function initFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'home';
  showPage(page);
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const page = e.state?.page || 'home';
  showPage(page);
});

// Navigation event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
  
  // Navigation links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      showPage(page);
      
      // Close mobile menu if open
      const navMenu = document.querySelector('.nav-menu');
      const hamburger = document.querySelector('.hamburger');
      if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  });
  
  // Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
});

// ==== FAQ Accordion ====
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');
      
      // Close all FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Open clicked item if it wasn't active
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

// ==== Featured Memes Showcase ====
let featuredMemesCache = null;
let lastFeaturedUpdate = 0;

function loadFeaturedMemes() {
  const featuredContainer = document.getElementById('featuredMemes');
  if (!featuredContainer) return;
  
  // Cache check - only update if localStorage changed
  const now = Date.now();
  if (featuredMemesCache && (now - lastFeaturedUpdate) < 1000) {
    return; // Skip if updated less than 1 second ago
  }
  
  // Get saved memes from localStorage
  const savedMemes = JSON.parse(localStorage.getItem('neon-memes') || '[]');
  
  // Check if content actually changed
  const newContent = savedMemes.length === 0 ? 'empty' : savedMemes.slice(0, 6).join('');
  if (featuredMemesCache === newContent) return;
  
  featuredMemesCache = newContent;
  lastFeaturedUpdate = now;
  
  if (savedMemes.length === 0) {
    // Show placeholder memes with better design
    featuredContainer.innerHTML = `
      <div class="card placeholder-card">
        <div class="placeholder-content">
          <div class="placeholder-icon">🎨</div>
          <h3>Your meme could be here</h3>
          <p>Start creating to see your masterpieces featured!</p>
        </div>
      </div>
      <div class="card trending-card">
        <div class="trending-badge">🔥 Trending</div>
        <div class="placeholder-content">
          <div class="placeholder-icon">⚡</div>
          <h3>Sample Meme</h3>
          <p>This could be your viral creation!</p>
        </div>
      </div>
      <div class="card cta-card">
        <div class="placeholder-content">
          <div class="placeholder-icon">🚀</div>
          <h3>Ready to forge?</h3>
          <p>Join the neon revolution!</p>
          <button class="btn-primary" data-page="forge">Forge Now</button>
        </div>
      </div>
    `;
    return;
  }
  
  // Show up to 6 featured memes
  const featuredMemes = savedMemes.slice(0, 6);
  featuredContainer.innerHTML = featuredMemes.map((memeSrc, index) => `
    <div class="card">
      <img src="${memeSrc}" alt="Featured meme ${index + 1}" loading="lazy" />
    </div>
  `).join('');
}

// ==== Quick Demo ====
function initQuickDemo() {
  const quickDemoBtn = document.getElementById('quickDemo');
  if (quickDemoBtn) {
    quickDemoBtn.addEventListener('click', () => {
      // Load a sample image and show the forge
      const sampleImageUrl = 'https://via.placeholder.com/400x400/1a1a2e/00e5ff?text=Sample+Meme';
      showPage('forge');
      
      // Set up a quick demo
      setTimeout(() => {
        if (el('imageUrl')) {
          el('imageUrl').value = sampleImageUrl;
          loadFromURL(sampleImageUrl);
        }
        if (el('topText')) {
          el('topText').value = 'Quick Demo';
        }
        if (el('bottomText')) {
          el('bottomText').value = 'Try MemeForge!';
        }
        render();
      }, 100);
    });
  }
}

const state = {
  img: new Image(),
  top: { text: '', x: canvas.width / 2, y: 90, active: true },
  bottom: { text: '', x: canvas.width / 2, y: canvas.height - 90, active: false },
  fontFamily: getComputedStyle(document.documentElement).getPropertyValue('--meme-font') || "Impact, Haettenschweiler, 'Arial Black', sans-serif",
  maxFont: 72,
  stroke: true,
  glow: true
};

// Basic moderation (editable)
const bannedWords = ['slur1','slur2','slur3'];

// ==== Utilities ====
function wrapText(text, maxWidth, fontSize) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (let w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  // line height ~ 1.1 * font
  return { lines, height: lines.length * fontSize * 1.1 };
}

function autoFontSize(text, maxWidth, maxFontPx) {
  let size = maxFontPx;
  ctx.font = `${size}px ${state.fontFamily}`;
  let { lines } = wrapText(text, maxWidth, size);
  while (lines.some(l => ctx.measureText(l).width > maxWidth) && size > 10) {
    size -= 2;
    ctx.font = `${size}px ${state.fontFamily}`;
    lines = wrapText(text, maxWidth, size).lines;
  }
  return size;
}

function avgLuminance(x, y, w, h) {
  const sample = ctx.getImageData(
    Math.max(0, x), Math.max(0, y),
    Math.min(canvas.width - x, w), Math.min(canvas.height - y, h)
  ).data;
  let sum = 0;
  for (let i = 0; i < sample.length; i += 4) {
    const r = sample[i], g = sample[i + 1], b = sample[i + 2];
    // Rec. 709 luma
    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  const pixels = sample.length / 4 || 1;
  return sum / pixels; // 0..255
}

function setTextStyles({ fontSize }) {
  ctx.font = `${fontSize}px ${state.fontFamily}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
}

// ==== Renderer ====
function render() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw image (letterbox/pillarbox to square canvas)
  const aspect = state.img.width / state.img.height || 1;
  let drawW = canvas.width, drawH = canvas.height, dx = 0, dy = 0;
  if (aspect > 1) { // wider than tall
    drawH = canvas.width / aspect;
    dy = (canvas.height - drawH) / 2;
  } else if (aspect < 1) {
    drawW = canvas.height * aspect;
    dx = (canvas.width - drawW) / 2;
  }
  if (state.img.complete && state.img.naturalWidth) {
    ctx.drawImage(state.img, dx, dy, drawW, drawH);
  } else {
    // placeholder grid
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  // Draw captions (auto font, auto contrast, stroke+glow)
  const pad = 24;
  const maxWidth = canvas.width - pad * 2;

  ['top','bottom'].forEach((pos) => {
    const item = state[pos];
    if (!item.text) return;

    const baseFont = autoFontSize(item.text, maxWidth, state.maxFont);
    const lines = wrapText(item.text, maxWidth, baseFont).lines;

    // compute bounding box used for contrast sampling
    setTextStyles({ fontSize: baseFont });
    const lineHeight = baseFont * 1.1;
    const blockHeight = lineHeight * lines.length;
    const boxY = item.y - blockHeight/2;
    const lum = avgLuminance(0, boxY - 6, canvas.width, blockHeight + 12);
    const fill = lum < 140 ? '#ffffff' : '#000000'; // auto white/black

    // optional glow
    if (state.glow) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = 'rgba(0,229,255,.75)';
    } else {
      ctx.shadowBlur = 0;
    }

    lines.forEach((line, i) => {
      const y = item.y - blockHeight/2 + i*lineHeight + lineHeight/2;
      if (state.stroke) {
        ctx.strokeStyle = fill === '#fff' ? '#000' : '#fff';
        ctx.lineWidth = Math.max(2, baseFont/12);
        ctx.strokeText(line, item.x, y);
      }
      ctx.fillStyle = fill;
      ctx.fillText(line, item.x, y);
    });

    ctx.shadowBlur = 0; // reset
  });
}

// ==== Image loading ====
function loadFromURL(url) {
  state.img = new Image();
  state.img.crossOrigin = 'anonymous'; // attempt to keep canvas untainted
  state.img.onload = render;
  state.img.onerror = () => alert('Could not load image. Try another URL or upload.');
  state.img.src = url;
}
function loadFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => loadFromURL(e.target.result);
  reader.readAsDataURL(file);
}

// ==== Drag text ====
let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top)  * (canvas.height / rect.height);
  // pick nearest text block
  const topDist = Math.abs(y - state.top.y);
  const botDist = Math.abs(y - state.bottom.y);
  dragging = topDist < botDist ? 'top' : 'bottom';
  state[dragging].x = x; state[dragging].y = y;
  render();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  state[dragging].x = (e.clientX - rect.left) * (canvas.width / rect.width);
  state[dragging].y = (e.clientY - rect.top)  * (canvas.height / rect.height);
  render();
});
window.addEventListener('pointerup', () => dragging = null);

// ==== Form wiring ====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('memeForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // moderation check
      const text = `${state.top.text} ${state.bottom.text}`.toLowerCase();
      if (bannedWords.some(w => w && text.includes(w))) {
        alert('Caption includes blocked words. Please edit.'); return;
      }
      render();
    });
  }

  // Form element event listeners
  const topTextEl = el('topText');
  const bottomTextEl = el('bottomText');
  const imageUrlEl = el('imageUrl');
  const imageFileEl = el('imageFile');
  const fontFamilyEl = el('fontFamily');
  const maxFontEl = el('maxFont');
  const strokeEl = el('stroke');
  const glowEl = el('glow');
  const clearBtnEl = el('clearBtn');
  const randomBtnEl = el('randomBtn');

  if (topTextEl) topTextEl.addEventListener('input', (e) => { state.top.text = e.target.value; render(); });
  if (bottomTextEl) bottomTextEl.addEventListener('input', (e) => { state.bottom.text = e.target.value; render(); });
  if (imageUrlEl) imageUrlEl.addEventListener('change', (e) => { if (e.target.value) loadFromURL(e.target.value); });
  if (imageFileEl) imageFileEl.addEventListener('change', (e) => { const f = e.target.files?.[0]; if (f) loadFromFile(f); });
  if (fontFamilyEl) fontFamilyEl.addEventListener('change', (e) => { state.fontFamily = e.target.value; render(); });
  if (maxFontEl) maxFontEl.addEventListener('input', (e) => { state.maxFont = +e.target.value; render(); });
  if (strokeEl) strokeEl.addEventListener('change', (e) => { state.stroke = e.target.checked; render(); });
  if (glowEl) glowEl.addEventListener('change', (e) => { state.glow = e.target.checked; render(); });

  if (clearBtnEl) clearBtnEl.addEventListener('click', () => {
    if (form) form.reset();
    state.top.text = ''; state.bottom.text = '';
    state.fontFamily = "Impact, Haettenschweiler, 'Arial Black', sans-serif";
    state.maxFont = 72; state.stroke = true; state.glow = true;
    render();
  });

  if (randomBtnEl) randomBtnEl.addEventListener('click', () => {
    const ups = ["This is fine.", "Deploying on Friday", "AI did it", "When prod = dev", "Cloud bill be like"];
    const lows = ["Send help.", "it's a feature", "pls no rate limit", "works on my machine", "ship it 🚀"];
    if (topTextEl) topTextEl.value = state.top.text = ups[(Math.random()*ups.length)|0];
    if (bottomTextEl) bottomTextEl.value = state.bottom.text = lows[(Math.random()*lows.length)|0];
    render();
  });
});

// Drag & drop image support
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.stage');
  if (stage) {
    ['dragenter','dragover','dragleave','drop'].forEach(ev => {
      stage.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); });
    });
    stage.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) loadFromFile(file);
    });
  }
});

// ==== Download / Save / Share ====
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = el('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'meme.png';
      a.click();
    });
  }
});

function renderGallery() {
  const gallery = el('memeGallery');
  if (!gallery) return;
  
  const items = JSON.parse(localStorage.getItem('neon-memes') || '[]');
  gallery.innerHTML = '';
  items.forEach((src, i) => {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<img src="${src}" alt="Saved meme ${i+1}"/><div class="bar">
      <button data-i="${i}" class="dl">Download</button>
      <button data-i="${i}" class="del">Delete</button></div>`;
    gallery.appendChild(card);
  });
  gallery.querySelectorAll('.dl').forEach(b => b.onclick = (e) => {
    const idx = +e.target.dataset.i;
    const items = JSON.parse(localStorage.getItem('neon-memes') || '[]');
    const a = document.createElement('a'); a.href = items[idx]; a.download = `meme-${idx+1}.png`; a.click();
  });
  gallery.querySelectorAll('.del').forEach(b => b.onclick = (e) => {
    const idx = +e.target.dataset.i;
    const items = JSON.parse(localStorage.getItem('neon-memes') || '[]');
    items.splice(idx,1); localStorage.setItem('neon-memes', JSON.stringify(items)); renderGallery();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = el('saveBtn');
  const shareBtn = el('shareBtn');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const items = JSON.parse(localStorage.getItem('neon-memes') || '[]');
      items.unshift(canvas.toDataURL('image/png'));
      localStorage.setItem('neon-memes', JSON.stringify(items.slice(0, 24))); // cap
      renderGallery();
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      // simple sharable state in URL (image URL only, not uploads)
      const params = new URLSearchParams({
        u: el('imageUrl')?.value || '',
        t: el('topText')?.value || '',
        b: el('bottomText')?.value || ''
      });
      const url = `${location.origin}${location.pathname}?${params.toString()}`;
      navigator.clipboard?.writeText(url);
      alert('Share link copied to clipboard.');
    });
  }
});

// Load from URL params (for shared links)
(function initMemeFromURL(){
  const q = new URLSearchParams(location.search);
  if (q.get('u')) { el('imageUrl').value = q.get('u'); loadFromURL(q.get('u')); }
  if (q.get('t')) { el('topText').value = state.top.text = q.get('t'); }
  if (q.get('b')) { el('bottomText').value = state.bottom.text = q.get('b'); }
  render();
})();

// ---- Storage Inspector ----
function approxBytesFromBase64DataURL(dataUrl) {
  // strip "data:image/png;base64,"
  const b64 = (dataUrl.split(',')[1] || '');
  // base64 size ≈ 3/4 * length
  return Math.floor((b64.length * 3) / 4);
}

async function inspectStorage() {
  const dump = document.getElementById('storageDump');
  const items = JSON.parse(localStorage.getItem('neon-memes') || '[]');
  let total = 0;
  let lines = [];
  items.forEach((d, i) => {
    const bytes = approxBytesFromBase64DataURL(d);
    total += bytes;
    lines.push(`#${i + 1} - ~${(bytes / 1024).toFixed(1)} KB`);
  });

  // LocalStorage overall size (keys + values)
  let lsBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const v = localStorage.getItem(k) || '';
    lsBytes += (k.length + v.length) * 2; // UTF-16 approx
  }

  // Cache Storage summary (PWA)
  let cacheSummary = 'Cache Storage: n/a';
  if ('caches' in window) {
    const keys = await caches.keys();
    const parts = [];
    for (const key of keys) {
      const cache = await caches.open(key);
      const reqs = await cache.keys();
      parts.push(`${key}: ${reqs.length} item(s)`);
    }
    cacheSummary = parts.join(' | ') || 'Cache Storage: empty';
  }

  dump.textContent =
    `Local "neon-memes" items: ${items.length}\n` +
    lines.join('\n') +
    `\n\nApprox images total: ${(total / 1024).toFixed(1)} KB` +
    `\nEstimated LocalStorage usage (all keys): ${(lsBytes / 1024).toFixed(1)} KB` +
    `\n${cacheSummary}\n\nTip: Clear with the "Clear All" button or via DevTools → Application.`;
}

document.addEventListener('DOMContentLoaded', () => {
  const inspectBtn = document.getElementById('inspectBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  
  if (inspectBtn) {
    inspectBtn.onclick = inspectStorage;
  }

  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      if (confirm('Delete all saved memes on this device?')) {
        localStorage.removeItem('neon-memes');
        renderGallery();
        inspectStorage();
      }
    };
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const data = localStorage.getItem('neon-memes') || '[]';
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'neon-memes-export.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
});

// ==== Floating Particles Animation ====
function createFloatingParticles() {
  const particlesContainer = document.getElementById('heroParticles');
  if (!particlesContainer) return;

  // Clear any existing particles
  particlesContainer.innerHTML = '';

  // Create 15 floating particles
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positioning
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 6 + 's';
    
    // Random size variation
    const size = 2 + Math.random() * 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    particlesContainer.appendChild(particle);
  }
  
}

// ==== Smooth Animations ====
function addSmoothAnimations() {
  // Add fade-in animations to elements as they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.card, .mission-card, .feature-item, .timeline-item, .faq-item, .feature-card').forEach(el => {
    observer.observe(el);
  });
}

// ==== Enhanced Page Transitions ====
function enhancePageTransitions() {
  // Add smooth transitions between pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  });
}

// ==== Mobile Optimizations ====
function initMobileOptimizations() {
  // Prevent zoom on double tap for buttons
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Improve mobile navigation
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
    
    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }
  
  // Improve canvas touch handling
  const canvas = document.getElementById('canvas');
  if (canvas) {
    // Prevent scrolling when touching canvas
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
}

// ==== Initialize Everything ====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize mobile optimizations first
  initMobileOptimizations();
  
  // Initialize theme first
  initTheme();
  
  // Initialize navigation
  initFromURL();
  
  // Initialize FAQ accordion
  initFAQ();
  
  // Load featured memes
  loadFeaturedMemes();
  
  // Initialize quick demo
  initQuickDemo();
  
  // Initialize gallery
  renderGallery();
  
  // Create floating particles
  createFloatingParticles();
  
  // Add smooth animations
  addSmoothAnimations();
  
  // Enhance page transitions
  enhancePageTransitions();
  
  // Ensure theme is applied after everything loads
  setTimeout(() => {
    const currentTheme = localStorage.getItem('memeLab-theme') || 'dark';
    applyTheme(currentTheme);
    updateThemeIcon(currentTheme);
    
    // Force refresh particles if they're not showing
    setTimeout(() => {
      createFloatingParticles();
    }, 500);
  }, 100);
});
