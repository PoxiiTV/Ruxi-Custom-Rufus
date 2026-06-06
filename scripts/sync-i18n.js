/* Sincroniza el i18n canónico de la app hacia la guía móvil (GitHub Pages).
   Fuente:  electron/app/renderer/i18n/
   Destino: docs/guia/i18n/
   Uso: npm run sync:i18n  (ejecútalo tras tocar cualquier traducción) */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'electron', 'app', 'renderer', 'i18n');
const DEST = path.join(__dirname, '..', 'docs', 'guia', 'i18n');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.name.endsWith('.js')) fs.copyFileSync(s, d);
  }
}

let n = 0;
function count(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) count(path.join(dir, e.name));
    else if (e.name.endsWith('.js')) n++;
  }
}

copyDir(SRC, DEST);
count(DEST);
console.log(`✓ i18n sincronizado → docs/guia/i18n/ (${n} archivos)`);
