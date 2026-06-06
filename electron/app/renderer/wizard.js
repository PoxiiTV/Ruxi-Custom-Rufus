/* ══════════════════════════════════════════════════════════════════
   Ruxi — Wizard State Machine
   10 screens: 0=Welcome, 1=ChooseISO, 2=SelectISO, 3=USB,
               4=Username, 5=Summary, 6=Progress, 7=Done, 8=InstallGuide,
               9=EnterBIOS
══════════════════════════════════════════════════════════════════ */

const api = window.ruxi;

// ── State ─────────────────────────────────────────────────────────
const state = {
  currentScreen: 0,
  isoPath: null,
  isoName: null,
  selectedDrive: null,  // { model, sizeGB, letters, label }
  driveLetter: null,
  username: '',
};

// ── Screen navigation ─────────────────────────────────────────────
function goTo(n) {
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.remove('active');
    current.classList.add('exit');
    setTimeout(() => current.classList.remove('exit'), 300);
  }
  const next = document.getElementById(`screen-${n}`);
  if (!next) return;
  next.classList.add('active');
  state.currentScreen = n;
  setStatus(t('status.step', { n: n + 1 }));
  if (n === 7 && typeof applyPcDetect === 'function') applyPcDetect();
}

function setStatus(text, active = false) {
  document.getElementById('status-text').textContent = text;
  const pulse = document.getElementById('status-pulse');
  pulse.classList.toggle('active', active);
}

// ── Window controls ───────────────────────────────────────────────
document.getElementById('btn-minimize').addEventListener('click', () => api.minimize());
document.getElementById('btn-close').addEventListener('click', () => {
  if (state.currentScreen === 6) {
    if (!confirm(t('confirm.cancel'))) return;
    api.cancelFlash();
  }
  api.close();
});

// ── FAQ overlay ───────────────────────────────────────────────────
const faqOverlay = document.getElementById('faq-overlay');
function openFaq() { faqOverlay.style.display = 'flex'; }
function closeFaq() {
  faqOverlay.style.display = 'none';
  faqOverlay.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
}
document.getElementById('btn-faq').addEventListener('click', openFaq);
document.getElementById('btn-faq-close').addEventListener('click', closeFaq);
faqOverlay.addEventListener('click', (e) => { if (e.target === faqOverlay) closeFaq(); });
// Acordeón: al abrir un desplegable, cierra los demás
faqOverlay.querySelectorAll('details.faq-item').forEach(d => {
  d.addEventListener('toggle', () => {
    if (d.open) {
      faqOverlay.querySelectorAll('details.faq-item').forEach(o => { if (o !== d) o.removeAttribute('open'); });
      d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
});

// ── SCREEN 0 — Welcome (3 acciones) ───────────────────────────────
document.getElementById('wc-create').addEventListener('click', () => goTo(1));
document.getElementById('wc-guide').addEventListener('click', () => goTo(7));
document.getElementById('wc-help').addEventListener('click', openFaq);

// ── SCREEN 1 — Choose ISO ─────────────────────────────────────────
// ISO download URLs (resolved)
const ISO_URLS = {
  win10: { url: 'https://drive.usercontent.google.com/download?id=1YefHUkzusD1ep7aM8Iv38HHjWmQ7xZJg&export=download&authuser=0&confirm=t', filename: 'Windows10.iso' },
  poxi:  { url: 'https://drive.usercontent.google.com/download?id=1XWl5vnFsGIP_qz_PbwTsa4m5K1p7jAMn&export=download&authuser=0&confirm=t', filename: 'Win11-LTSC-Poxi.iso' },
};

// Open-in-browser links
document.querySelectorAll('.btn-link').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const url = e.currentTarget.dataset.url;
    if (url) api.openUrl(url);
  });
});

// In-app download buttons
document.querySelectorAll('.btn-download').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const key = e.currentTarget.dataset.download;
    const iso = ISO_URLS[key];
    if (!iso) return;
    // Go to screen 2 and start download
    state._pendingDownload = iso;
    goTo(2);
  });
});

// Descargar desde una URL propia
document.getElementById('btn-custom-dl').addEventListener('click', () => {
  const input = document.getElementById('custom-iso-url');
  const url = (input.value || '').trim();
  if (!/^https?:\/\/.+/i.test(url)) { input.classList.add('bad'); input.focus(); return; }
  input.classList.remove('bad');
  // Nombre de archivo a partir de la URL (o uno genérico)
  let filename = 'Windows-personalizado.iso';
  try {
    const last = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    if (/\.iso$/i.test(last)) filename = last;
  } catch {}
  state._pendingDownload = { url, filename, resumable: false };  // URLs propias: descarga normal, sin reanudar
  goTo(2);
});

document.getElementById('btn-skip-iso').addEventListener('click', () => {
  state._pendingDownload = null;
  goTo(2);
});

// ── SCREEN 2 — Select / Download ISO ─────────────────────────────
const isoDropZone = document.getElementById('iso-drop-zone');
const isoFileNameEl = document.getElementById('iso-file-name');
const isoErrorEl = document.getElementById('iso-error');
const btnIsoOk = document.getElementById('btn-iso-ok');
const dlPanel = document.getElementById('download-panel');

async function setIsoSelected(filePath, fileName, sizeMB) {
  state.isoPath = filePath;
  state.isoName = fileName;
  state.isoSizeMB = sizeMB || null;
  isoFileNameEl.textContent = fileName + (sizeMB ? ` (${sizeMB} MB)` : '');
  isoDropZone.classList.add('has-file');
  document.getElementById('iso-drop-label').textContent = t('iso.checking');
  hideError(isoErrorEl);
  btnIsoOk.disabled = true;

  // Validar que sea una ISO de Windows válida
  const v = await api.validateIso(filePath);
  if (!v || !v.valid) {
    document.getElementById('iso-drop-label').textContent = t('iso.droplabel.sel');
    showError(isoErrorEl, v && v.reason === 'too-small' ? t('err.iso.tooSmall') : t('err.iso.invalid'));
    btnIsoOk.disabled = true;
    return;
  }
  if (!state.isoSizeMB && v.sizeMB) state.isoSizeMB = v.sizeMB;
  document.getElementById('iso-drop-label').textContent = t('iso.droplabel.sel');
  if (!v.looksWindows) {
    showError(isoErrorEl, t('err.iso.notWindows'));
  }
  if (v.label) {
    isoFileNameEl.textContent = fileName + (sizeMB ? ` (${sizeMB} MB)` : '') + t('iso.labelSuffix', { label: v.label });
  }
  btnIsoOk.disabled = false;
}

isoDropZone.addEventListener('click', async () => {
  if (dlPanel.style.display !== 'none') return; // downloading, don't open picker
  const result = await api.openIsoPicker();
  if (!result) return;
  if (result.error) { showError(isoErrorEl, result.error); return; }
  setIsoSelected(result.path, result.name, result.sizeMB);
});

document.getElementById('btn-back-1').addEventListener('click', () => {
  api.cancelDownload();
  api.offDownloadProgress();
  dlPanel.style.display = 'none';
  goTo(1);
});
btnIsoOk.addEventListener('click', () => goTo(3));

// Download cancel
document.getElementById('btn-cancel-dl').addEventListener('click', () => {
  api.cancelDownload();
  api.offDownloadProgress();
  dlPanel.style.display = 'none';
  isoDropZone.style.display = 'flex';
  btnIsoOk.disabled = true;
  state.isoPath = null;
});

// Auto-start download if coming from a download button on screen 1
const _origScreen2GoTo = goTo;
function maybeStartDownload() {
  if (!state._pendingDownload) return;
  const iso = state._pendingDownload;
  state._pendingDownload = null;
  startInAppDownload(iso.url, iso.filename, iso.resumable !== false);
}

async function startInAppDownload(url, filename, resumable) {
  // Show download panel, hide drop zone
  isoDropZone.style.display = 'none';
  dlPanel.style.display = 'flex';
  document.getElementById('dl-filename').textContent = 'Descargando ' + filename + '...';
  document.getElementById('dl-size-info').textContent = '';
  document.getElementById('dl-pct').textContent = '0%';
  document.getElementById('dl-bar').style.width = '0%';
  btnIsoOk.disabled = true;
  hideError(isoErrorEl);

  api.offDownloadProgress();
  api.onDownloadProgress(({ percent, downloadedMB, totalMB }) => {
    document.getElementById('dl-bar').style.width = percent + '%';
    document.getElementById('dl-pct').textContent = percent + '%';
    document.getElementById('dl-size-info').textContent =
      totalMB > 0 ? `${downloadedMB} / ${totalMB} MB` : `${downloadedMB} MB`;
  });

  const result = await api.downloadIso({ url, filename, resumable: resumable !== false });

  if (result.status === 'error') {
    dlPanel.style.display = 'none';
    isoDropZone.style.display = 'flex';
    showError(isoErrorEl, '⚠️ ' + result.message);
    return;
  }

  // Done or already exists
  api.offDownloadProgress();
  dlPanel.style.display = 'none';
  isoDropZone.style.display = 'flex';
  setIsoSelected(result.path, result.name || filename, null);
}

// Hook screen-2 activation to check for pending download
(function() {
  const s2 = document.getElementById('screen-2');
  const obs = new MutationObserver(() => {
    if (s2.classList.contains('active')) maybeStartDownload();
  });
  obs.observe(s2, { attributes: true, attributeFilter: ['class'] });
})();

// ── SCREEN 3 — USB ────────────────────────────────────────────────
let usbPollTimer = null;
let usbDrives = [];
let showInternalDrives = false;  // por defecto solo USB extraíbles

async function refreshUsbList() {
  const listEl = document.getElementById('usb-list');
  const emptyEl = document.getElementById('usb-empty');
  const btnUsbOk = document.getElementById('btn-usb-ok');

  const drives = await api.listUsbDrives();
  usbDrives = drives;

  // Qué unidades mostrar: solo extraíbles, salvo que el usuario active "avanzado"
  const visible = drives.filter(d => showInternalDrives || d.removable);

  if (!visible.length) {
    listEl.innerHTML = '';
    listEl.appendChild(emptyEl);
    emptyEl.querySelector('span').textContent = drives.some(d => !d.removable)
      ? t('usb.noneUsb') : t('usb.none');
    btnUsbOk.disabled = true;
    return;
  }

  const html = visible.map((d) => {
    const idx = drives.indexOf(d);
    const icon = d.isSystem ? '🔒' : (d.removable ? '💾' : '🖥️');
    let badge = '';
    if (d.isSystem) badge = `<span class="drive-badge danger">${t('usb.badgeSystem')}</span>`;
    else if (!d.removable) badge = `<span class="drive-badge warn">${t('usb.badgeInternal')}</span>`;
    const smallWarn = d.tooSmall ? ` <span class="drive-small">${t('usb.tooSmall')}</span>` : '';
    const sub = d.isSystem
      ? t('usb.system')
      : `${d.letters.join(', ')}${smallWarn}`;
    const locked = d.isSystem || d.tooSmall;
    return `
    <div class="usb-item ${locked ? 'too-small' : ''} ${d.isSystem ? 'locked-system' : ''}" data-idx="${idx}">
      <span class="usb-icon">${icon}</span>
      <div class="usb-info">
        <strong>${escHtml(d.model)} ${badge}</strong>
        <span>${sub}</span>
      </div>
      <span class="usb-size">${d.sizeGB} GB</span>
    </div>`;
  }).join('');

  listEl.innerHTML = html;

  // Solo seleccionables: ni sistema, ni demasiado pequeños
  listEl.querySelectorAll('.usb-item:not(.too-small):not(.locked-system)').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    if (state.driveLetter && usbDrives[idx]?.letters[0] === state.driveLetter) {
      el.classList.add('selected');
      btnUsbOk.disabled = false;
    }

    el.addEventListener('click', () => {
      const d = usbDrives[idx];
      // Confirmación extra al elegir un disco interno (no USB)
      if (!d.removable && !confirm(t('confirm.internal', { model: d.model }))) {
        return;
      }
      listEl.querySelectorAll('.usb-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      state.selectedDrive = d;
      state.driveLetter = d.letters[0] || '';
      btnUsbOk.disabled = false;
      hideError(document.getElementById('usb-error'));
    });
  });
}

document.getElementById('btn-back-2').addEventListener('click', () => {
  stopUsbPoll();
  goTo(2);
});

document.getElementById('btn-usb-ok').addEventListener('click', () => {
  if (!state.selectedDrive) return;
  if (!state.driveLetter) {
    showError(document.getElementById('usb-error'), t('err.usb.noletter'));
    return;
  }
  stopUsbPoll();
  goTo(4);
});

async function triggerUsbSearch() {
  const btn = document.getElementById('btn-refresh-usb');
  if (btn) { btn.disabled = true; btn.textContent = t('btn.searching'); }
  await refreshUsbList();
  if (btn) { btn.disabled = false; btn.textContent = t('btn.search'); }
}

document.getElementById('btn-refresh-usb').addEventListener('click', triggerUsbSearch);

document.getElementById('btn-show-internal').addEventListener('click', (e) => {
  showInternalDrives = !showInternalDrives;
  e.currentTarget.textContent = showInternalDrives ? t('btn.showUsbOnly') : t('btn.showInternal');
  e.currentTarget.classList.toggle('active', showInternalDrives);
  refreshUsbList();
});

function startUsbPoll() {
  triggerUsbSearch();
}
function stopUsbPoll() {
  if (usbPollTimer) { clearInterval(usbPollTimer); usbPollTimer = null; }
}

// ── SCREEN 4 — Username ───────────────────────────────────────────
const inputUsername = document.getElementById('input-username');
const usernameError = document.getElementById('username-error');

document.getElementById('btn-back-3').addEventListener('click', () => {
  startUsbPoll();
  goTo(3);
});

document.getElementById('btn-username-ok').addEventListener('click', () => {
  const val = inputUsername.value.trim();
  if (!val) {
    showError(usernameError, t('err.username.empty'));
    return;
  }
  if (!/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ_-]{1,20}$/.test(val)) {
    showError(usernameError, t('err.username.invalid'));
    return;
  }
  state.username = val;
  hideError(usernameError);
  fillSummary();
  goTo(5);
});

inputUsername.addEventListener('input', () => hideError(usernameError));

// ── SCREEN 5 — Summary ────────────────────────────────────────────
async function fillSummary() {
  document.getElementById('sum-iso').textContent = state.isoName || '—';
  document.getElementById('sum-usb').textContent = state.selectedDrive
    ? `${state.selectedDrive.model} — ${state.selectedDrive.sizeGB} GB (${state.driveLetter})`
    : '—';
  document.getElementById('sum-user').textContent = state.username || '—';

  // Verificar qué contiene el USB antes de borrarlo
  const box = document.getElementById('usb-inspect');
  box.innerHTML = `<div class="inspect-loading"><div class="spinner"></div><span>${t('inspect.checking')}</span></div>`;
  const info = await api.inspectDrive(state.driveLetter);
  if (!info || !info.ok) { box.innerHTML = ''; return; }

  if (info.empty) {
    box.innerHTML = `
      <div class="inspect-card empty">
        <strong>${t('inspect.empty.t')}</strong>
        <span>${t('inspect.empty.d', { label: escHtml(info.label || state.driveLetter), gb: info.totalGB ?? state.selectedDrive.sizeGB })}</span>
      </div>`;
    return;
  }

  const itemsHtml = info.items.map(it =>
    `<li>${it.dir ? '📁' : '📄'} ${escHtml(it.name)}</li>`).join('');
  const more = info.itemCount > info.items.length
    ? `<li class="more">${t('inspect.more', { n: info.itemCount - info.items.length })}</li>` : '';

  box.innerHTML = `
    <div class="inspect-card has-data">
      <div class="inspect-head">
        <strong>${t('inspect.has.t')}</strong>
        <span>${t('inspect.has.sub', { label: escHtml(info.label || state.driveLetter), used: info.usedGB ?? '?', total: info.totalGB ?? state.selectedDrive.sizeGB, count: info.itemCount })}</span>
      </div>
      <ul class="inspect-items">${itemsHtml}${more}</ul>
      <p class="inspect-warn">${t('inspect.warn')}</p>
    </div>`;
}

document.getElementById('btn-back-4').addEventListener('click', () => goTo(4));

document.getElementById('btn-start-flash').addEventListener('click', () => {
  if (!confirm(t('confirm.start', { drive: state.driveLetter }))) return;
  startFlash();
});

// ── "Mientras esperas" — tips rotativos (en el idioma actual) ─────
let waitingTipTimer = null;
function startWaitingTips() {
  const el = document.getElementById('waiting-tip-text');
  const box = document.getElementById('waiting-tip');
  let order = [...window.GUIDE_BUILD.tips()].sort(() => Math.random() - 0.5);
  let i = 0;
  const show = () => {
    box.classList.remove('show');
    setTimeout(() => {
      el.textContent = order[i % order.length];
      i++;
      box.classList.add('show');
    }, 250);
  };
  show();
  waitingTipTimer = setInterval(show, 7000);
}
function stopWaitingTips() {
  if (waitingTipTimer) { clearInterval(waitingTipTimer); waitingTipTimer = null; }
}

// ── SCREEN 6 — Progress ───────────────────────────────────────────
let eta = null;  // { start, lastPct, lastTime, samples }

function startFlash() {
  goTo(6);
  setStatus(t('status.flashing'), true);
  eta = { start: Date.now(), lastPct: 0, lastTime: Date.now(), samples: [] };
  document.getElementById('progress-eta').textContent = '';
  document.getElementById('progress-fill').style.background = '';
  startWaitingTips();
  updateProgress(0, t('progress.starting'));

  api.offFlashEvents();
  api.onFlashEvent((evt) => {
    if (evt.status === 'log-path') {
      state.logPath = evt.path;
      return;
    } else if (evt.status === 'progress') {
      updateProgress(evt.percent || 0, evt.message || t('progress.processing'));
      updateEta(evt.percent || 0);
    } else if (evt.status === 'done') {
      updateProgress(100, t('progress.completed'));
      document.getElementById('progress-eta').textContent = '';
      setStatus(t('status.usbReady'), false);
      stopWaitingTips();
      playSuccessSound();
      setTimeout(() => { goTo(7); fireConfetti(); }, 1200);
    } else if (evt.status === 'error') {
      setStatus(t('status.error'), false);
      updateProgress(0, 'Error: ' + (evt.message || '—'));
      document.getElementById('progress-eta').textContent = '';
      document.getElementById('progress-lbl').textContent = 'ERROR';
      document.getElementById('progress-fill').style.background = 'rgba(255,85,119,.3)';
      stopWaitingTips();
      showFlashError(evt.message);
    }
  });

  api.startFlash({
    isoPath: state.isoPath,
    driveLetter: state.driveLetter,
    username: state.username,
  });
}

function updateProgress(pct, msg) {
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-msg').textContent = msg;
  if (pct > 0) {
    document.getElementById('progress-lbl').textContent = pct + '%';
  }
}

// Tiempo restante + velocidad estimados a partir del % y el tamaño de la ISO
function updateEta(pct) {
  const el = document.getElementById('progress-eta');
  if (!eta || !state.isoSizeMB || pct <= 0 || pct >= 100) { el.textContent = ''; return; }
  const now = Date.now();
  const dt = (now - eta.lastTime) / 1000;
  const dPct = pct - eta.lastPct;
  if (dt > 0.4 && dPct > 0) {
    const mbps = (dPct / 100 * state.isoSizeMB) / dt;
    eta.samples.push(mbps);
    if (eta.samples.length > 6) eta.samples.shift();
    eta.lastPct = pct;
    eta.lastTime = now;
  }
  if (!eta.samples.length) return;
  const avg = eta.samples.reduce((a, b) => a + b, 0) / eta.samples.length;
  if (avg <= 0) return;
  const remainMB = (100 - pct) / 100 * state.isoSizeMB;
  const secs = Math.round(remainMB / avg);
  const timeStr = secs >= 60
    ? `≈ ${Math.ceil(secs / 60)} ${t('eta.minUnit')} ${t('eta.minLeft')}`
    : `≈ ${secs} ${t('eta.secUnit')} ${t('eta.minLeft')}`;
  el.textContent = `${timeStr} · ${avg.toFixed(0)} MB/s`;
}

// Sonido de éxito (Web Audio, sin archivo externo)
function playSuccessSound() {
  if (!soundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // Do-Mi-Sol
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {}
}

// Confeti de celebración (canvas, sin librerías)
function fireConfetti() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const colors = ['#2f7bff', '#7b5cff', '#e23aff', '#54e6a6', '#ffffff'];
    const N = 140;
    const parts = Array.from({ length: N }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
      y: canvas.height * 0.35 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -10 - 4,
      size: Math.random() * 6 + 4,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    }));
    const start = performance.now();
    const DURATION = 2600;
    function frame(now) {
      const t = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.vy += 0.32;          // gravedad
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t / DURATION);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (t < DURATION) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  } catch {}
}

function showFlashError(msg) {
  const footer = document.querySelector('#screen-6 .screen-footer');
  footer.innerHTML = `
    <p style="color:var(--red);font-size:12px;flex:1">${escHtml(msg || 'Error desconocido')}</p>
    <button class="btn btn-ghost" id="btn-flash-retry">← Volver e intentar de nuevo</button>
  `;
  document.getElementById('btn-flash-retry').addEventListener('click', () => {
    footer.innerHTML = `<button class="btn btn-ghost" id="btn-cancel-flash">Cancelar</button>`;
    rebindCancelFlash();
    goTo(5);
  });
}

function rebindCancelFlash() {
  const btn = document.getElementById('btn-cancel-flash');
  if (btn) btn.addEventListener('click', () => {
    if (!confirm(t('confirm.cancel'))) return;
    api.cancelFlash();
    stopWaitingTips();
    goTo(5);
  });
}
rebindCancelFlash();

// ── Detección del PC actual (para resaltar la tecla de arranque) ──
let pcInfo = null;
const BRAND_MATCH = [
  { brand: 'asus', re: /asus|asustek/i, name: 'ASUS' },
  { brand: 'msi', re: /msi|micro-star/i, name: 'MSI' },
  { brand: 'gigabyte', re: /gigabyte/i, name: 'Gigabyte' },
  { brand: 'hp', re: /hp|hewlett|packard/i, name: 'HP' },
  { brand: 'lenovo', re: /lenovo/i, name: 'Lenovo' },
  { brand: 'dell', re: /dell/i, name: 'Dell' },
  { brand: 'acer', re: /acer/i, name: 'Acer' },
];
function detectedBrand() {
  if (!pcInfo) return null;
  const hay = `${pcInfo.manufacturer} ${pcInfo.model}`;
  return BRAND_MATCH.find(b => b.re.test(hay)) || null;
}
async function loadPcInfo() {
  try { pcInfo = await api.getPcInfo(); } catch { pcInfo = null; }
}
loadPcInfo();

// Aplica el resaltado de marca + banner en la pantalla 7
function applyPcDetect() {
  const box = document.getElementById('pc-detect');
  const table = document.getElementById('boot-keys-table');
  if (table) table.querySelectorAll('.boot-key-row.highlight').forEach(r => r.classList.remove('highlight'));
  if (!pcInfo || (!pcInfo.manufacturer && !pcInfo.model)) { box.style.display = 'none'; return; }
  const b = detectedBrand();
  let bootKey = '';
  if (b && table) {
    const row = table.querySelector(`.boot-key-row[data-brand="${b.brand}"]`);
    if (row) {
      row.classList.add('highlight');
      bootKey = row.querySelector('span:last-child').textContent;
    }
  }
  const fw = pcInfo.firmware && pcInfo.firmware !== 'desconocido' ? ` · ${pcInfo.firmware}` : '';
  const ram = pcInfo.ramGB ? ` · ${pcInfo.ramGB} GB RAM` : '';
  box.innerHTML = b && bootKey
    ? t('pc.detect', { brand: b.name, extra: fw + ram, key: bootKey })
    : t('pc.detectGeneric', { name: escHtml(pcInfo.manufacturer || pcInfo.model || '—'), extra: fw + ram });
  box.style.display = 'block';
}

// ── SCREEN 7 — Done / Boot guide ─────────────────────────────────
document.getElementById('btn-secure-boot-toggle').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const body = document.getElementById('secure-boot-body');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  btn.classList.toggle('open', !isOpen);
});

document.getElementById('btn-to-install-guide').addEventListener('click', () => {
  buildGuide();
  goTo(8);
});

// Crear otro USB: mantiene la ISO y el usuario, solo elige otra unidad
document.getElementById('btn-another-usb').addEventListener('click', () => {
  state.selectedDrive = null;
  state.driveLetter = null;
  showInternalDrives = false;
  document.getElementById('btn-usb-ok').disabled = true;
  goTo(3);
});

// ── SCREEN 8 — Install guide (dinámica según equipo + escenario) ──
document.getElementById('btn-back-7').addEventListener('click', () => goTo(7));
document.getElementById('btn-finish').addEventListener('click', () => goTo(9));

// ── SCREEN 9 — Entrar a la BIOS ahora ─────────────────────────────
document.getElementById('btn-back-8').addEventListener('click', () => goTo(8));
document.getElementById('btn-close-9').addEventListener('click', () => api.close());
document.getElementById('btn-bios-qr').addEventListener('click', () => openQr());
document.getElementById('btn-enter-bios').addEventListener('click', async () => {
  // Doble confirmación: evita reinicios por un clic accidental.
  if (!confirm(t('s9.confirm'))) return;
  if (!confirm(t('s9.confirm2'))) return;
  const btn = document.getElementById('btn-enter-bios');
  btn.disabled = true;
  const r = await api.rebootToFirmware();
  // Si el firmware no soporta /fw (BIOS legacy) o falla, avisamos y dejamos el método manual.
  if (!r || !r.ok) {
    btn.disabled = false;
    alert(t('s9.failed'));
  }
  // Si funciona, el PC se reinicia y la app se cierra sola.
});

const guide = { device: 'desktop', scenario: 'new', backup: 'no' };

// Pasos según el tipo de equipo / escenario / backup, en el idioma actual.
// La lógica (incluida la inyección de los pasos de backup) vive en guide-builder.js.
function getInstallSteps() {
  return window.GUIDE_BUILD.install({
    laptop: guide.device === 'laptop',
    reinstall: guide.scenario === 'reinstall',
    backup: guide.backup === 'yes',
  });
}
function getPostSteps() {
  return window.GUIDE_BUILD.post({
    laptop: guide.device === 'laptop',
    backup: guide.backup === 'yes',
  });
}

function renderSteps(containerId, steps, offset) {
  const html = steps.map((s, i) => `
    <label class="install-step ${s.crit ? 'critical' : ''} ${s.advanced ? 'advanced' : ''}">
      <input type="checkbox" class="step-check" />
      <span class="step-circle"></span>
      <div class="step-text">
        <strong>${offset + i + 1}. ${s.t}</strong>
        <span>${s.d}</span>
        ${s.action ? `<button type="button" class="step-action-btn" data-url="${s.action.url}">${s.action.label}</button>` : ''}
        ${s.builder ? `<button type="button" class="step-builder-btn" data-ninite="1">${t('ninite.builder')}</button>` : ''}
        ${s.why ? `<details class="step-why"><summary>${t('why.label')}</summary><div class="step-why-body">${s.why}</div></details>` : ''}
        ${s.tip ? `<div class="tip-box">${s.tip}</div>` : ''}
      </div>
    </label>`).join('');
  document.getElementById(containerId).innerHTML = html;
}

function buildGuide() {
  const install = getInstallSteps();
  const post = getPostSteps();
  renderSteps('install-steps', install, 0);
  renderSteps('post-steps', post, install.length);
  bindGuideProgress();
  document.getElementById('done-final').style.display = 'none';
}

function bindGuideProgress() {
  const checks = [...document.querySelectorAll('#screen-8 .step-check')];
  const fill = document.getElementById('guide-progress-fill');
  const text = document.getElementById('guide-progress-text');
  const update = () => {
    const done = checks.filter(c => c.checked).length;
    const pct = checks.length ? Math.round((done / checks.length) * 100) : 0;
    fill.style.width = pct + '%';
    text.textContent = t('guide.progress', { done, total: checks.length });
    const final = document.getElementById('done-final');
    if (done === checks.length && checks.length > 0) {
      final.style.display = 'block';
      final.scrollIntoView({ behavior: 'smooth' });
      fireConfetti();
    } else {
      final.style.display = 'none';
    }
  };
  checks.forEach(c => c.addEventListener('change', update));
  update();
}

// Chips: cambiar tipo de equipo / escenario reconstruye la guía
document.querySelectorAll('#chips-device .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#chips-device .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    guide.device = chip.dataset.device;
    buildGuide();
  });
});
document.querySelectorAll('#chips-scenario .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#chips-scenario .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    guide.scenario = chip.dataset.scenario;
    buildGuide();
  });
});
document.querySelectorAll('#chips-backup .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#chips-backup .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    guide.backup = chip.dataset.backup;
    buildGuide();
  });
});

// ── Llevar la guía al móvil (QR → GitHub Pages) ───────────────────
const GUIDE_PAGES_URL = 'https://poxiitv.github.io/Ruxi-Custom-Rufus/guia/';
function buildGuideUrl() {
  const b = (typeof detectedBrand === 'function') ? detectedBrand() : null;
  const marca = b ? `&marca=${b.brand}` : '';
  return `${GUIDE_PAGES_URL}?equipo=${guide.device}&caso=${guide.scenario}&backup=${guide.backup}&idioma=${getLang()}${marca}`;
}
const qrOverlay = document.getElementById('qr-overlay');
function openQr() {
  const url = buildGuideUrl();
  const codeEl = document.getElementById('qr-code');
  try {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    codeEl.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
  } catch (e) {
    codeEl.innerHTML = '<p style="color:var(--dim);font-size:12px">No se pudo generar el QR.</p>';
  }
  document.getElementById('qr-url').textContent = url;
  qrOverlay.style.display = 'flex';
}
function closeQr() { qrOverlay.style.display = 'none'; }
document.getElementById('btn-guide-qr').addEventListener('click', openQr);
document.getElementById('btn-qr-close').addEventListener('click', closeQr);
qrOverlay.addEventListener('click', (e) => { if (e.target === qrOverlay) closeQr(); });

// ── Exportar la guía a PDF ────────────────────────────────────────
const BOOT_KEYS = [
  ['ASUS / ROG', 'Del / F2', 'F8'], ['MSI', 'Del', 'F11'], ['Gigabyte', 'Del / F2', 'F12'],
  ['HP', 'F10 / Esc', 'F9'], ['Lenovo', 'F2 / Fn+F2', 'F12'], ['Dell', 'F2', 'F12'], ['Acer', 'F2 / Del', 'F12'],
];
function buildPrintableGuideHtml() {
  const devName = t(guide.device === 'laptop' ? 'chip.laptop' : 'chip.desktop');
  const caseName = t(guide.scenario === 'reinstall' ? 'chip.reinstall' : 'chip.new');
  const install = getInstallSteps();
  const post = getPostSteps();
  const stepLi = (s, n) => `<li><strong>${n}. ${s.t}</strong><div>${s.d}</div>${s.tip ? `<div class="tip">${s.tip}</div>` : ''}</li>`;
  const bootRows = BOOT_KEYS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  let n = 0;
  const installLis = install.map(s => stepLi(s, ++n)).join('');
  const postLis = post.map(s => stepLi(s, ++n)).join('');
  return `<!DOCTYPE html><html lang="${getLang()}"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 28px 32px; }
    h1 { font-size: 22px; margin: 0 0 2px; }
    .meta { color: #6b6b86; font-size: 13px; margin-bottom: 18px; }
    h2 { font-size: 15px; margin: 22px 0 8px; padding-bottom: 5px; border-bottom: 2px solid #7b5cff; color: #4b3acc; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; margin: 6px 0 4px; }
    th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; }
    th { background: #f2efff; }
    ol { padding-left: 0; list-style: none; counter-reset: none; }
    li { margin: 0 0 10px; padding: 9px 12px; border: 1px solid #e6e6ef; border-radius: 8px; page-break-inside: avoid; }
    li strong { font-size: 13px; }
    li div { font-size: 12px; color: #444; margin-top: 3px; line-height: 1.5; }
    li .tip { background: #fff7e6; border-left: 3px solid #f0a500; padding: 6px 9px; border-radius: 5px; margin-top: 6px; color: #6b5200; }
    .foot { margin-top: 24px; font-size: 11px; color: #9a9ab0; text-align: center; }
  </style></head><body>
    <h1>${t('pdf.docTitle')}</h1>
    <div class="meta">${t('pdf.meta', { device: devName, case: caseName })}</div>

    <h2>${t('pdf.bootTitle')}</h2>
    <p style="font-size:12px;color:#444;margin:0 0 4px">${t('pdf.bootIntro')}</p>
    <table><tr><th>${t('boot.brand')}</th><th>${t('boot.bios')}</th><th>${t('boot.boot')}</th></tr>${bootRows}</table>

    <h2>${t('sec.during')}</h2>
    <ol>${installLis}</ol>

    <h2>${t('sec.after')}</h2>
    <ol>${postLis}</ol>

    <div class="foot">${t('pdf.foot')}</div>
  </body></html>`;
}
document.getElementById('btn-guide-pdf').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const prev = btn.textContent;
  btn.disabled = true; btn.textContent = t('btn.pdf.gen');
  const html = buildPrintableGuideHtml();
  const res = await api.exportPdf({ html, suggestedName: 'Guia-instalacion-Windows-Ruxi.pdf' });
  btn.disabled = false; btn.textContent = prev;
  if (res && !res.ok && res.error) alert(t('pdf.error', { error: res.error }));
});

// ── Start USB polling when screen 3 becomes active ────────────────
(function() {
  const screen3 = document.getElementById('screen-3');
  const observer = new MutationObserver(() => {
    if (screen3.classList.contains('active')) {
      if (!usbPollTimer) startUsbPoll();
    } else {
      stopUsbPoll();
    }
  });
  observer.observe(screen3, { attributes: true, attributeFilter: ['class'] });
})();

// ── Helpers ───────────────────────────────────────────────────────
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}
function hideError(el) {
  el.style.display = 'none';
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Ver logs (delegación, el botón vive en el footer de progreso) ──
document.addEventListener('click', (e) => {
  if (e.target.closest('#btn-view-logs')) api.openLogs();
  const actionBtn = e.target.closest('.step-action-btn');
  if (actionBtn) {
    e.preventDefault();
    e.stopPropagation();
    const url = actionBtn.dataset.url;
    if (url) api.openUrl(url);
  }
  const builderBtn = e.target.closest('.step-builder-btn');
  if (builderBtn) { e.preventDefault(); e.stopPropagation(); openNinite(); }
});

// ── Constructor de Ninite (beta) ──────────────────────────────────
const NINITE_APPS = [
  { cat: '🌐 Navegadores', apps: [['chrome', 'Chrome'], ['firefox', 'Firefox'], ['brave', 'Brave'], ['opera', 'Opera']] },
  { cat: '💬 Comunicación', apps: [['discord', 'Discord'], ['zoom', 'Zoom'], ['skype', 'Skype']] },
  { cat: '🎬 Multimedia', apps: [['vlc', 'VLC'], ['spotify', 'Spotify'], ['audacity', 'Audacity'], ['itunes', 'iTunes']] },
  { cat: '🎨 Imagen', apps: [['gimp', 'GIMP'], ['paint', 'Paint.NET'], ['sharex', 'ShareX'], ['krita', 'Krita']] },
  { cat: '📄 Documentos', apps: [['libreoffice', 'LibreOffice'], ['foxit', 'Foxit Reader'], ['sumatra', 'SumatraPDF']] },
  { cat: '🗜️ Compresión', apps: [['7zip', '7-Zip'], ['winrar', 'WinRAR'], ['peazip', 'PeaZip']] },
  { cat: '🎮 Juegos', apps: [['steam', 'Steam']] },
  { cat: '🧰 Utilidades', apps: [['notepadplusplus', 'Notepad++'], ['everything', 'Everything'], ['keepass2', 'KeePass 2'], ['teamviewer15', 'TeamViewer']] },
  { cat: '🛡️ Seguridad', apps: [['malwarebytes', 'Malwarebytes']] },
  { cat: '☁️ Nube', apps: [['dropbox', 'Dropbox'], ['googledrive', 'Google Drive'], ['onedrive', 'OneDrive']] },
  { cat: '👨‍💻 Desarrollo', apps: [['vscode', 'VS Code'], ['python', 'Python'], ['filezilla', 'FileZilla']] },
];
const niniteOverlay = document.getElementById('ninite-overlay');
const niniteSelected = new Set();
function renderNiniteApps() {
  const cont = document.getElementById('ninite-apps');
  cont.innerHTML = NINITE_APPS.map(group => `
    <div class="ninite-group">
      <span class="ninite-cat">${group.cat}</span>
      <div class="ninite-list">
        ${group.apps.map(([slug, name]) => `
          <label class="ninite-app ${niniteSelected.has(slug) ? 'on' : ''}" data-slug="${slug}">
            <input type="checkbox" ${niniteSelected.has(slug) ? 'checked' : ''}><span>${name}</span>
          </label>`).join('')}
      </div>
    </div>`).join('');
  cont.querySelectorAll('.ninite-app input').forEach(chk => {
    chk.addEventListener('change', () => {
      const slug = chk.closest('.ninite-app').dataset.slug;
      if (chk.checked) niniteSelected.add(slug); else niniteSelected.delete(slug);
      chk.closest('.ninite-app').classList.toggle('on', chk.checked);
      updateNinite();
    });
  });
}
function updateNinite() {
  const btn = document.getElementById('ninite-download');
  document.getElementById('ninite-count').textContent = t('ninite.count', { n: niniteSelected.size });
  btn.disabled = niniteSelected.size === 0;
}
function openNinite() {
  renderNiniteApps();
  updateNinite();
  niniteOverlay.style.display = 'flex';
}
function closeNinite() { niniteOverlay.style.display = 'none'; }
document.getElementById('btn-ninite-close').addEventListener('click', closeNinite);
niniteOverlay.addEventListener('click', (e) => { if (e.target === niniteOverlay) closeNinite(); });
document.getElementById('ninite-download').addEventListener('click', () => {
  if (!niniteSelected.size) return;
  const slugs = NINITE_APPS.flatMap(g => g.apps.map(a => a[0])).filter(s => niniteSelected.has(s));
  api.openUrl(`https://ninite.com/${slugs.join('-')}/ninite.exe`);
});

// ── Atajos de desarrollo (ocultos) ────────────────────────────────
//  Ctrl+Shift+P  → simula el grabado (pantalla de progreso) sin USB
//  Ctrl+Shift+G  → salta a la guía final (pantalla 7) sin grabar USB
//  Ctrl+Shift+H  → salta directo a la guía de instalación (pantalla 8)
//  Ctrl+Shift+B  → salta a la pantalla "Entrar a la BIOS" (pantalla 9)
//  Ctrl+Shift+U  → fuerza el banner de actualización (para probarlo)
let simTimer = null;
function simulateFlash() {
  if (simTimer) { clearInterval(simTimer); simTimer = null; }
  if (!state.isoSizeMB) state.isoSizeMB = 4700;  // tamaño ficticio para el ETA
  goTo(6);
  setStatus(t('status.flashing'), true);
  eta = { start: Date.now(), lastPct: 0, lastTime: Date.now(), samples: [] };
  document.getElementById('progress-eta').textContent = '';
  document.getElementById('progress-fill').style.background = '';
  startWaitingTips();
  let pct = 0;
  simTimer = setInterval(() => {
    pct += Math.random() * 4 + 1;
    if (pct >= 100) {
      pct = 100;
      clearInterval(simTimer); simTimer = null;
      updateProgress(100, t('progress.completed'));
      document.getElementById('progress-eta').textContent = '';
      stopWaitingTips();
      playSuccessSound();
      setTimeout(() => { goTo(7); fireConfetti(); }, 1000);
    } else {
      updateProgress(Math.floor(pct), t('progress.processing'));
      updateEta(Math.floor(pct));
    }
  }, 350);
}
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey && e.shiftKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'p') { e.preventDefault(); simulateFlash(); }
  else if (k === 'g') { e.preventDefault(); goTo(7); fireConfetti(); }
  else if (k === 'h') { e.preventDefault(); buildGuide(); goTo(8); }
  else if (k === 'b') { e.preventDefault(); goTo(9); }
  else if (k === 'u') { e.preventDefault(); showUpdateBanner('9.9.9'); }
});

// ── Tema de color: selector + botón 🎨 ────────────────────────────
const settingsOverlay = document.getElementById('settings-overlay');
function getTheme() { return localStorage.getItem('ruxi-theme') || 'poxi'; }
function setTheme(name) {
  if (name === 'poxi') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', name);
  try { localStorage.setItem('ruxi-theme', name); } catch {}
  markCurrentTheme();
}
function markCurrentTheme() {
  const cur = getTheme();
  document.querySelectorAll('.theme-opt').forEach(o => o.classList.toggle('selected', o.dataset.theme === cur));
}
function markCurrentLang() {
  const cur = getLang();
  settingsOverlay.querySelectorAll('.lang-opt').forEach(o => o.classList.toggle('selected', o.dataset.lang === cur));
}
function openSettings() {
  markCurrentTheme(); markCurrentLang(); refreshSoundToggle();
  document.getElementById('about-version').textContent = 'v' + (appVersion || '—');
  document.getElementById('about-updstatus').textContent = '';
  settingsOverlay.style.display = 'flex';
}
function closeSettings() { settingsOverlay.style.display = 'none'; }
document.getElementById('btn-settings').addEventListener('click', openSettings);
document.getElementById('btn-settings-close').addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', (e) => { if (e.target === settingsOverlay) closeSettings(); });
document.querySelectorAll('.theme-opt').forEach(o => {
  o.addEventListener('click', () => setTheme(o.dataset.theme));
});

// Sonido (silenciar)
function soundEnabled() { return localStorage.getItem('ruxi-sound') !== '0'; }
function refreshSoundToggle() {
  const b = document.getElementById('toggle-sound');
  b.textContent = soundEnabled() ? t('sound.on') : t('sound.off');
  b.classList.toggle('off', !soundEnabled());
}
document.getElementById('toggle-sound').addEventListener('click', () => {
  try { localStorage.setItem('ruxi-sound', soundEnabled() ? '0' : '1'); } catch {}
  refreshSoundToggle();
});

// Acerca de
const REPO_URL = 'https://github.com/PoxiiTV/Ruxi-Custom-Rufus';
const RELEASES_URL = REPO_URL + '/releases';
// VirusTotal: sube el .exe a VirusTotal y pega aquí el enlace del análisis para cada release.
const VIRUSTOTAL_URL = 'https://www.virustotal.com/gui/home/upload';
let appVersion = '';
(async () => { try { appVersion = await api.getAppVersion(); } catch {} })();
document.getElementById('about-github').addEventListener('click', () => api.openUrl(REPO_URL));
document.getElementById('about-releases').addEventListener('click', () => api.openUrl(RELEASES_URL));
document.getElementById('about-vt').addEventListener('click', () => api.openUrl(VIRUSTOTAL_URL));
document.getElementById('about-update').addEventListener('click', async () => {
  const status = document.getElementById('about-updstatus');
  status.textContent = t('about.checking');
  const r = await api.checkUpdate();
  if (r && r.ok && r.hasUpdate) { showUpdateBanner(r.latest, r.url); closeSettings(); }
  else { status.textContent = t('about.uptodate'); }
});

// ── Idioma: selector + botón 🌐 ───────────────────────────────────
const langOverlay = document.getElementById('lang-overlay');
function openLang() { langOverlay.style.display = 'flex'; }
function closeLang() { langOverlay.style.display = 'none'; }
langOverlay.addEventListener('click', (e) => { if (e.target === langOverlay) closeLang(); });
document.querySelectorAll('.lang-opt').forEach(b => {
  b.addEventListener('click', () => { setLang(b.dataset.lang); closeLang(); markCurrentLang(); });
});

// Cuando cambia el idioma, re-renderiza el contenido dinámico
window.onLangChanged = function () {
  if (state.currentScreen === 6) setStatus(t('status.flashing'), true);
  else if (state.currentScreen === 0) setStatus(t('status.ready'));
  else setStatus(t('status.step', { n: state.currentScreen + 1 }));
  if (state.currentScreen === 8) buildGuide();
  if (state.currentScreen === 3) refreshUsbList();
  if (state.currentScreen === 7 && typeof applyPcDetect === 'function') applyPcDetect();
  if (state.isoPath) document.getElementById('iso-drop-label').textContent = t('iso.droplabel.sel');
  refreshSoundToggle();
};

// ── Aviso de actualización ────────────────────────────────────────
let shownUpdateVersion = null;
function showUpdateBanner(latest, url) {
  shownUpdateVersion = latest;
  const banner = document.getElementById('update-banner');
  document.getElementById('update-text').textContent = t('update.available', { v: latest });
  document.getElementById('update-dl').textContent = t('update.btn');
  document.getElementById('update-news').textContent = t('update.btnNews');
  document.getElementById('update-dl').onclick = () => api.openUrl(url || `https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases`);
  document.getElementById('update-news').onclick = openChangelog;
  banner.style.display = 'flex';
}
document.getElementById('update-close').addEventListener('click', () => {
  document.getElementById('update-banner').style.display = 'none';
  // Recordar esta versión para no volver a avisar en cada apertura
  try { if (shownUpdateVersion) localStorage.setItem('ruxi-update-dismissed', shownUpdateVersion); } catch {}
});
async function checkForUpdate() {
  try {
    const r = await api.checkUpdate();
    if (r && r.ok && r.hasUpdate) {
      const dismissed = localStorage.getItem('ruxi-update-dismissed');
      if (dismissed !== r.latest) showUpdateBanner(r.latest, r.url);
    }
  } catch {}
}

// Versión instalada: cuando el auto-updater ya descargó la nueva, ofrecer reiniciar
function showUpdateReadyBanner(version) {
  const banner = document.getElementById('update-banner');
  document.getElementById('update-text').textContent = t('update.ready', { v: version || '' });
  document.getElementById('update-news').style.display = 'none';
  const dl = document.getElementById('update-dl');
  dl.textContent = t('update.restart');
  dl.onclick = () => api.installUpdate();
  banner.style.display = 'flex';
}

// ── Changelog / Novedades ─────────────────────────────────────────
const changelogOverlay = document.getElementById('changelog-overlay');
async function openChangelog() {
  changelogOverlay.style.display = 'flex';
  const body = document.getElementById('changelog-body');
  body.innerHTML = `<p style="color:var(--dim);font-size:13px">${t('changelog.loading')}</p>`;
  const r = await api.getReleaseNotes();
  if (!r || !r.ok) { body.innerHTML = `<p style="color:var(--dim);font-size:13px">${t('changelog.error')}</p>`; return; }
  // Render de las notas: convierte el markdown básico (negrita, títulos, listas)
  let safe = escHtml(r.body || '');
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');      // **negrita**
  safe = safe.replace(/^#{1,6}\s*(.+)$/gm, '<strong>$1</strong>');   // # títulos
  safe = safe.replace(/^[-*]\s+(.+)$/gm, '• $1');                    // - viñetas → •
  safe = safe.replace(/\r?\n/g, '<br>');
  body.innerHTML = `<h3 style="margin:0 0 10px">${escHtml(r.name || '')}</h3><div style="font-size:13px;line-height:1.6;color:var(--txt)">${safe}</div>`;
}
function closeChangelog() { changelogOverlay.style.display = 'none'; }
document.getElementById('btn-changelog-close').addEventListener('click', closeChangelog);
changelogOverlay.addEventListener('click', (e) => { if (e.target === changelogOverlay) closeChangelog(); });

// ── Init ──────────────────────────────────────────────────────────
(async function init() {
  const saved = localStorage.getItem('ruxi-lang');
  setLang(saved || 'es');          // aplica idioma (y traduce toda la UI)
  if (!saved) openLang();          // primera vez: pregunta el idioma
  let mode = 'notice';
  try { mode = await api.getUpdateMode(); } catch {}
  if (mode === 'notice') {
    checkForUpdate();              // portable: solo avisa y abre descargas
  } else if (mode === 'auto') {
    api.onUpdateReady((d) => showUpdateReadyBanner(d && d.version));  // instalador: se actualiza solo
  }
})();
