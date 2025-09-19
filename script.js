// ==== State ====
const el = (id) => document.getElementById(id);
const canvas = el('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

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
const form = document.getElementById('memeForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // moderation check
  const text = `${state.top.text} ${state.bottom.text}`.toLowerCase();
  if (bannedWords.some(w => w && text.includes(w))) {
    alert('Caption includes blocked words. Please edit.'); return;
  }
  render();
});

el('topText').addEventListener('input', (e) => { state.top.text = e.target.value; render(); });
el('bottomText').addEventListener('input', (e) => { state.bottom.text = e.target.value; render(); });
el('imageUrl').addEventListener('change', (e) => { if (e.target.value) loadFromURL(e.target.value); });
el('imageFile').addEventListener('change', (e) => { const f = e.target.files?.[0]; if (f) loadFromFile(f); });
el('fontFamily').addEventListener('change', (e) => { state.fontFamily = e.target.value; render(); });
el('maxFont').addEventListener('input', (e) => { state.maxFont = +e.target.value; render(); });
el('stroke').addEventListener('change', (e) => { state.stroke = e.target.checked; render(); });
el('glow').addEventListener('change', (e) => { state.glow = e.target.checked; render(); });

el('clearBtn').addEventListener('click', () => {
  form.reset();
  state.top.text = ''; state.bottom.text = '';
  state.fontFamily = "Impact, Haettenschweiler, 'Arial Black', sans-serif";
  state.maxFont = 72; state.stroke = true; state.glow = true;
  render();
});

el('randomBtn').addEventListener('click', () => {
  const ups = ["This is fine.", "Deploying on Friday", "AI did it", "When prod = dev", "Cloud bill be like"];
  const lows = ["Send help.", "it’s a feature", "pls no rate limit", "works on my machine", "ship it 🚀"];
  el('topText').value = state.top.text = ups[(Math.random()*ups.length)|0];
  el('bottomText').value = state.bottom.text = lows[(Math.random()*lows.length)|0];
  render();
});

// Drag & drop image support
const stage = document.querySelector('.stage');
;['dragenter','dragover','dragleave','drop'].forEach(ev => {
  stage.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); });
});
stage.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith('image/')) loadFromFile(file);
});

// ==== Download / Save / Share ====
el('downloadBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'meme.png';
  a.click();
});

const gallery = el('memeGallery');
function renderGallery() {
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
renderGallery();

el('saveBtn').addEventListener('click', () => {
  const items = JSON.parse(localStorage.getItem('neon-memes') || '[]');
  items.unshift(canvas.toDataURL('image/png'));
  localStorage.setItem('neon-memes', JSON.stringify(items.slice(0, 24))); // cap
  renderGallery();
});

el('shareBtn').addEventListener('click', () => {
  // simple sharable state in URL (image URL only, not uploads)
  const params = new URLSearchParams({
    u: el('imageUrl').value || '',
    t: el('topText').value || '',
    b: el('bottomText').value || ''
  });
  const url = `${location.origin}${location.pathname}?${params.toString()}`;
  navigator.clipboard?.writeText(url);
  alert('Share link copied to clipboard.');
});

// Load from URL params (for shared links)
(function initFromURL(){
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

document.getElementById('inspectBtn').onclick = inspectStorage;

document.getElementById('clearAllBtn').onclick = () => {
  if (confirm('Delete all saved memes on this device?')) {
    localStorage.removeItem('neon-memes');
    renderGallery();
    inspectStorage();
  }
};

document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
  const data = localStorage.getItem('neon-memes') || '[]';
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neon-memes-export.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
