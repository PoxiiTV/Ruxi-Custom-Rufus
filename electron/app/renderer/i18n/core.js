/* ══════════════════════════════════════════════════════════════════
   Ruxi — i18n core (motor genérico, multiidioma)
   - window.I18N[code] : diccionario plano por idioma (lo llena lang/xx.js)
   - window.LANGS      : idiomas disponibles [{code, name, flag}]
   - t(key, vars), getLang(), setLang(code), applyI18n()
   - renderLangOptions(): genera los botones del selector desde LANGS
   Los textos de la guía viven también como claves "g.*" en cada lang/xx.js;
   los ensambla guide-builder.js (la lógica, una sola vez).
══════════════════════════════════════════════════════════════════ */

window.I18N = window.I18N || {};

// Banderas SVG sin id (se duplican en varios contenedores → nada de ids).
window.LANGS = [
  { code: 'es', name: 'Español', flag: '<svg class="flag" viewBox="0 0 3 2"><rect width="3" height="2" fill="#c60b1e"/><rect y="0.5" width="3" height="1" fill="#ffc400"/></svg>' },
  { code: 'en', name: 'English', flag: '<svg class="flag" viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0,0 60,40 M60,0 0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 60,40 M60,0 0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="12"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6"/></svg>' },
  { code: 'fr', name: 'Français', flag: '<svg class="flag" viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>' },
  { code: 'pt', name: 'Português', flag: '<svg class="flag" viewBox="0 0 30 20"><rect width="12" height="20" fill="#006600"/><rect x="12" width="18" height="20" fill="#FF0000"/><circle cx="12" cy="10" r="3.6" fill="#FFCC00"/><circle cx="12" cy="10" r="2.2" fill="#fff"/></svg>' },
  { code: 'de', name: 'Deutsch', flag: '<svg class="flag" viewBox="0 0 5 3"><rect width="5" height="3" fill="#000"/><rect y="1" width="5" height="1" fill="#D00"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>' },
  { code: 'ru', name: 'Русский', flag: '<svg class="flag" viewBox="0 0 9 6"><rect width="9" height="6" fill="#fff"/><rect y="2" width="9" height="2" fill="#0039A6"/><rect y="4" width="9" height="2" fill="#D52B1E"/></svg>' },
  { code: 'zh', name: '中文', flag: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#DE2910"/><polygon points="8,4 9.18,7.38 12.76,7.45 9.9,9.62 10.94,13.05 8,11 5.06,13.05 6.1,9.62 3.24,7.45 6.82,7.38" fill="#FFDE00"/></svg>' },
];

function langExists(code) {
  return window.LANGS.some(function (l) { return l.code === code; });
}

// ── Idioma actual + persistencia ──────────────────────────────────
function getLang() {
  var l = window.__ruxiLang || localStorage.getItem('ruxi-lang') || 'es';
  return langExists(l) ? l : 'es';
}
function setLang(code) {
  window.__ruxiLang = langExists(code) ? code : 'es';
  try { localStorage.setItem('ruxi-lang', window.__ruxiLang); } catch (e) {}
  document.documentElement.lang = window.__ruxiLang;
  applyI18n();
}
function t(key, vars) {
  var lang = getLang();
  var s = (window.I18N[lang] && window.I18N[lang][key]);
  if (s == null) s = (window.I18N.es && window.I18N.es[key] != null ? window.I18N.es[key] : key);
  if (vars) for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
// Aplica las traducciones a todos los elementos marcados
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
  if (typeof window.onLangChanged === 'function') window.onLangChanged();
}

// Genera los botones del selector de idioma desde LANGS, en todos los .lang-options
function renderLangOptions() {
  var html = window.LANGS.map(function (l) {
    return '<button class="lang-opt" data-lang="' + l.code + '">' + l.flag + ' ' + l.name + '</button>';
  }).join('');
  document.querySelectorAll('.lang-options').forEach(function (c) { c.innerHTML = html; });
}

// Este <script> va al final del body (el DOM ya existe): generamos el selector
// ahora para que wizard.js (posterior) pueda enganchar los clics.
renderLangOptions();
