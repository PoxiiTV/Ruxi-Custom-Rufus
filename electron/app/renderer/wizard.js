/* ══════════════════════════════════════════════════════════════════
   Ruxi — Wizard State Machine
   8 screens: 0=Welcome, 1=ChooseISO, 2=SelectISO, 3=USB,
              4=Username, 5=Summary, 6=Progress, 7=Done, 8=InstallGuide
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
  setStatus('Paso ' + (n + 1) + ' de 9');
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
    if (!confirm('¿Cancelar el proceso? El USB podría quedar inutilizable.')) return;
    api.cancelFlash();
  }
  api.close();
});

// ── SCREEN 0 — Welcome ────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => goTo(1));

// ── SCREEN 1 — Choose ISO ─────────────────────────────────────────
// ISO download URLs (resolved)
const ISO_URLS = {
  win10:  { url: 'https://drive.google.com/uc?export=download&id=1YefHUkzusD1ep7aM8Iv38HHjWmQ7xZJg', filename: 'Windows10.iso' },
  poxi:   { url: 'https://acortar.link/tIszzw', filename: 'Win11-LTSC-Poxi.iso' },
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

function setIsoSelected(filePath, fileName, sizeMB) {
  state.isoPath = filePath;
  state.isoName = fileName;
  isoFileNameEl.textContent = fileName + (sizeMB ? ` (${sizeMB} MB)` : '');
  isoDropZone.classList.add('has-file');
  document.getElementById('iso-drop-label').textContent = 'ISO seleccionada:';
  hideError(isoErrorEl);
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
  startInAppDownload(iso.url, iso.filename);
}

async function startInAppDownload(url, filename) {
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

  const result = await api.downloadIso({ url, filename });

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

async function refreshUsbList() {
  const listEl = document.getElementById('usb-list');
  const emptyEl = document.getElementById('usb-empty');
  const btnUsbOk = document.getElementById('btn-usb-ok');

  const drives = await api.listUsbDrives();
  usbDrives = drives;

  if (!drives.length) {
    listEl.innerHTML = '';
    listEl.appendChild(emptyEl);
    emptyEl.querySelector('span').textContent = 'No se detectaron USBs. Conecta uno e intenta de nuevo.';
    btnUsbOk.disabled = true;
    return;
  }

  const html = drives.map((d, i) => `
    <div class="usb-item ${d.tooSmall ? 'too-small' : ''}" data-idx="${i}">
      <span class="usb-icon">💾</span>
      <div class="usb-info">
        <strong>${escHtml(d.model)}</strong>
        <span>${d.letters.length ? d.letters.join(', ') : 'Sin letra asignada'}${d.tooSmall ? ' — Demasiado pequeño (mín. 8 GB)' : ''}</span>
      </div>
      <span class="usb-size">${d.sizeGB} GB</span>
    </div>
  `).join('');

  listEl.innerHTML = html;

  listEl.querySelectorAll('.usb-item:not(.too-small)').forEach(el => {
    el.addEventListener('click', () => {
      listEl.querySelectorAll('.usb-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      const idx = parseInt(el.dataset.idx);
      state.selectedDrive = usbDrives[idx];
      state.driveLetter = usbDrives[idx].letters[0] || '';
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
    showError(document.getElementById('usb-error'), 'El USB no tiene letra de unidad asignada. Abre el Explorador de Windows, asigna una letra y vuelve.');
    return;
  }
  stopUsbPoll();
  goTo(4);
});

function startUsbPoll() {
  refreshUsbList();
  usbPollTimer = setInterval(refreshUsbList, 3000);
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
    showError(usernameError, 'Escribe un nombre de usuario.');
    return;
  }
  if (!/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ_-]{1,20}$/.test(val)) {
    showError(usernameError, 'El nombre no puede tener espacios ni caracteres especiales. Solo letras, números, guión o guión bajo.');
    return;
  }
  state.username = val;
  hideError(usernameError);
  fillSummary();
  goTo(5);
});

inputUsername.addEventListener('input', () => hideError(usernameError));

// ── SCREEN 5 — Summary ────────────────────────────────────────────
function fillSummary() {
  document.getElementById('sum-iso').textContent = state.isoName || '—';
  document.getElementById('sum-usb').textContent = state.selectedDrive
    ? `${state.selectedDrive.model} — ${state.selectedDrive.sizeGB} GB (${state.driveLetter})`
    : '—';
  document.getElementById('sum-user').textContent = state.username || '—';
}

document.getElementById('btn-back-4').addEventListener('click', () => goTo(4));

document.getElementById('btn-start-flash').addEventListener('click', () => {
  if (!confirm(`¿Seguro que quieres continuar?\n\nTodo el contenido del USB "${state.driveLetter}" se borrará de forma permanente.`)) return;
  startFlash();
});

// ── SCREEN 6 — Progress ───────────────────────────────────────────
function startFlash() {
  goTo(6);
  setStatus('Grabando USB...', true);
  updateProgress(0, 'Iniciando...');

  api.offFlashEvents();
  api.onFlashEvent((evt) => {
    if (evt.status === 'progress') {
      updateProgress(evt.percent || 0, evt.message || 'Procesando...');
    } else if (evt.status === 'done') {
      updateProgress(100, '¡Completado!');
      setStatus('USB listo', false);
      setTimeout(() => goTo(7), 1200);
    } else if (evt.status === 'error') {
      setStatus('Error', false);
      updateProgress(0, 'Error: ' + (evt.message || 'desconocido'));
      document.getElementById('progress-lbl').textContent = 'ERROR';
      document.getElementById('progress-fill').style.background = 'rgba(255,85,119,.3)';
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
    if (!confirm('¿Cancelar el proceso? El USB podría quedar inutilizable.')) return;
    api.cancelFlash();
    goTo(5);
  });
}
rebindCancelFlash();

// ── SCREEN 7 — Done / Boot guide ─────────────────────────────────
document.getElementById('btn-secure-boot-toggle').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const body = document.getElementById('secure-boot-body');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  btn.classList.toggle('open', !isOpen);
});

document.getElementById('btn-to-install-guide').addEventListener('click', () => goTo(8));

// ── SCREEN 8 — Install guide ──────────────────────────────────────
document.getElementById('btn-back-7').addEventListener('click', () => goTo(7));
document.getElementById('btn-finish').addEventListener('click', () => api.close());

const stepChecks = document.querySelectorAll('.step-check');
stepChecks.forEach((chk, i) => {
  chk.addEventListener('change', () => {
    const allChecked = [...stepChecks].every(c => c.checked);
    if (allChecked) {
      document.getElementById('done-final').style.display = 'block';
      document.getElementById('done-final').scrollIntoView({ behavior: 'smooth' });
    }
  });
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

// ── Init ──────────────────────────────────────────────────────────
setStatus('Listo');
