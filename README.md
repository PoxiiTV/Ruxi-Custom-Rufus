<div align="center">

<img src="electron/app/renderer/assets/logo.png" width="90" alt="Ruxi logo" />

# Ruxi — Custom Rufus

**La forma más sencilla de instalar Windows.**  
Sin tecnicismos. Sin pasos raros. Para todos.

[![GitHub release](https://img.shields.io/github/v/release/PoxiiTV/Ruxi-Custom-Rufus?style=flat-square&color=7b5cff)](https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](LICENSE.txt)
[![Made by Poxi](https://img.shields.io/badge/made%20by-Poxi-e23aff?style=flat-square)](https://github.com/PoxiiTV)

</div>

---

## ¿Qué es Ruxi?

Ruxi es un fork de [Rufus](https://github.com/pbatard/rufus) — la herramienta más fiable para crear USBs de arranque — con una interfaz completamente rediseñada y un **tutorial integrado paso a paso** que te guía desde descargar la ISO hasta tener Windows instalado.

**No necesitas saber nada de informática para usarlo.**

### Diferencias con Rufus original

| | Rufus | Ruxi |
|---|---|---|
| Interfaz | Clásica Win32 | Glassmorphism moderno |
| Complejidad | Técnica (GPT, UEFI, NTFS…) | Todo automático |
| Tutorial | ❌ | ✅ Integrado paso a paso |
| ISO recomendada | ❌ | ✅ Windows 11 LTSC optimizado |
| Guía post-instalación | ❌ | ✅ Qué hacer después del USB |
| Motor de flasheo | Rufus | Rufus (backend) |

---

## Características

- **Wizard guiado** — 8 pantallas que te llevan de la mano de principio a fin
- **ISO recomendada** — Windows 11 IoT LTSC 2024 optimizado por Poxi: sin bloatware, sin telemetría, máximo rendimiento para gaming
- **Todo automático** — GPT + UEFI + NTFS + bypass de TPM/SecureBoot configurados solos
- **Cuenta local** — Sin obligarte a usar cuenta de Microsoft
- **Guía de arranque** — Tabla de teclas por marca (ASUS, MSI, HP, Lenovo, Dell…) y solución al error de Secure Boot
- **Guía de instalación** — Pasos interactivos marcables dentro del propio programa
- **Motor Rufus** — El backend real es Rufus modificado con modo headless (`--headless`)

---

## Descarga

> **[→ Releases](https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases)**

Descarga `Ruxi-Portable.exe` de la última release. No requiere instalación — doble clic y listo.

Requiere **Windows 10/11 x64** y privilegios de administrador.

---

## ISOs de Windows

| Versión | Enlace | Notas |
|---------|--------|-------|
| Windows 10 | [Descargar](https://drive.google.com/file/d/1YefHUkzusD1ep7aM8Iv38HHjWmQ7xZJg) | Descarga directa |
| Windows 11 | [microsoft.com](https://www.microsoft.com/es-es/software-download/windows11) | Oficial Microsoft |
| **Windows 11 LTSC Poxi** ⭐ | [Descargar](https://acortar.link/tIszzw) | Sin bloatware · Sin telemetría · Gaming |

---

## Para desarrolladores

### Estructura del proyecto

```
Ruxi-Custom-Rufus/
├── src/                     ← Motor Rufus (C) modificado
│   ├── rufus.c              ← Modo headless + UM_HEADLESS_INIT
│   ├── ui.c                 ← JSON progress → stdout
│   ├── rufus.h              ← extern bHeadless, UM_HEADLESS_INIT
│   └── wue.h                ← extern unattend_username[]
├── electron/app/            ← Frontend Electron
│   ├── main.js              ← Proceso principal + IPC
│   ├── preload.js           ← Bridge contextBridge
│   └── renderer/
│       ├── index.html       ← 9 pantallas del wizard
│       ├── styles.css       ← Diseño glassmorphism
│       └── wizard.js        ← State machine
├── build/
│   └── rufus-engine.exe     ← Motor compilado (ver abajo)
├── nuevo-diseño/            ← Boceto HTML de referencia
└── package.json
```

### Compilar el motor (rufus-engine.exe)

El frontend Electron llama a `rufus-engine.exe` con el modo headless que añadimos. Para compilarlo:

1. Abre `rufus.sln` en **Visual Studio 2022**
2. Selecciona configuración **Release x64**
3. Build → Build Solution
4. Copia `Release\rufus.exe` a `build\rufus-engine.exe`

#### Parámetros del motor headless

```
rufus-engine.exe --headless --iso "C:\ruta\windows.iso" --device "E:" --username "TuNombre"
```

Output JSON por stdout:
```json
{"status":"progress","percent":35}
{"status":"done"}
{"status":"error","message":"..."}
```

### Desarrollo y build

```bash
# Instalar dependencias
npm install

# Build portable (Ruxi-Portable.exe)
npm run build:portable

# Build instalador (requiere excluir app-builder.exe de Windows Defender)
npm run build:installer
```

> **Nota de desarrollo:** `npm start` no funciona en modo dev por un conflicto de resolución de módulos entre el paquete npm `electron` y las APIs internas del runtime. La app funciona correctamente al hacer el build con electron-builder.

### Modificaciones al código C de Rufus

Todos los cambios están marcados con comentarios `// Ruxi`:

- **`rufus.c`** — Flags CLI `--headless`, `--device`, `--username`; mensaje `UM_HEADLESS_INIT`; bypass del diálogo WUE; `UM_PROGRESS_EXIT` emite JSON y sale limpiamente
- **`ui.c`** — `UpdateProgress` emite `{"status":"progress","percent":N}` a stdout cuando `bHeadless == TRUE`
- **`rufus.h`** — `UM_HEADLESS_INIT` en el enum de mensajes; `extern BOOL bHeadless`
- **`wue.h`** — `extern char unattend_username[]`

---

## Créditos

- **Motor** — [Rufus](https://github.com/pbatard/rufus) por Pete Batard (GPL v3)
- **Frontend, diseño y concepto** — Poxi

Ruxi se distribuye bajo [GPL v3](LICENSE.txt), la misma licencia que Rufus.

---

<div align="center">

Hecho con ❤️ por **Poxi** · [GitHub](https://github.com/PoxiiTV)

</div>
