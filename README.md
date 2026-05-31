<div align="center">

<img src="electron/app/renderer/assets/logo.png" width="90" alt="Ruxi logo" />

# Ruxi — Custom Rufus

**La forma más sencilla de instalar Windows.**  
Sin tecnicismos. Sin pasos raros. Para todos.

[![GitHub release](https://img.shields.io/github/v/release/PoxiiTV/Ruxi-Custom-Rufus?include_prereleases&style=flat-square&color=7b5cff)](https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases)
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

- **Wizard guiado** — 9 pantallas que te llevan de la mano de principio a fin
- **Descarga integrada de ISOs** — Baja la ISO desde la propia app, con barra de progreso
- **ISO recomendada** — Windows 11 IoT LTSC 2024 optimizado por Poxi: sin bloatware, sin telemetría, máximo rendimiento para gaming
- **Todo automático** — GPT + UEFI + NTFS + bypass de TPM/SecureBoot configurados solos
- **Cuenta local** — Sin obligarte a usar cuenta de Microsoft
- **Etiqueta del USB** — Se crea como `Poxi-WINDOWS`
- **Pide admin automáticamente** — El portable solicita permisos de administrador al abrirse (UAC)
- **Guía de arranque** — Tabla de teclas por marca (ASUS, MSI, HP, Lenovo, Dell…) y solución al error de Secure Boot
- **Guía de instalación adaptativa** — Pasos interactivos marcables que cambian según tu equipo (🖥️ sobremesa / 💻 portátil) y tu caso (🆕 PC nuevo / ♻️ reinstalar)
- **Guía post-instalación** — Qué hacer al terminar: internet, Windows Update y drivers del fabricante (WiFi/touchpad en portátiles, GPU/chipset en sobremesa)
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
rufus-engine.exe --headless --iso "C:\ruta\windows.iso" --device "E:" --username "TuNombre" [--logfile "C:\ruta\log.txt"]
```

| Flag | Descripción |
|------|-------------|
| `--headless` | Corre sin interfaz, auto-configurado, emitiendo JSON por stdout |
| `--iso PATH` | Ruta de la imagen ISO de Windows |
| `--device "E:"` | Letra de la unidad USB destino |
| `--username NOMBRE` | Nombre de la cuenta local de Windows |
| `--logfile PATH` | (Opcional) Vuelca el log completo de Rufus a un archivo |

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

O usa el script **`build-portable.bat`** (doble clic), que hace el build del portable. El portable pide permisos de administrador al abrirse gracias a `portable.requestExecutionLevel: "admin"` en `package.json`.

> **Recuerda:** si tocas el código C del motor, recompílalo en VS2022 y copia `x64\Release\rufus.exe` a `build\rufus-engine.exe` **antes** de hacer el build del portable.

> **Nota de desarrollo:** `npm start` no funciona en modo dev por un conflicto de resolución de módulos entre el paquete npm `electron` y las APIs internas del runtime. La app funciona correctamente al hacer el build con electron-builder.

### Modificaciones al código C de Rufus

Todos los cambios están marcados con comentarios `// Ruxi`:

- **`rufus.c`** — Flags CLI `--headless`, `--device`, `--username`, `--logfile`; mensaje `UM_HEADLESS_INIT` que se lanza **al terminar el escaneo de la ISO** (no antes, para evitar grabar sin imagen válida); selección automática de unidad y arranque del formato; etiqueta del volumen `Poxi-WINDOWS`; bypass del diálogo de actualización, del diálogo WUE, del aviso de bootloader UEFI revocado y de todas las confirmaciones modales cuando `bHeadless`; el resultado real (`done`/`error`) se emite desde `UM_FORMAT_COMPLETED`
- **`ui.c`** — `UpdateProgress` emite `{"status":"progress","percent":N}` a stdout cuando `bHeadless == TRUE`
- **`stdio.c`** — `uprintf` también vuelca el log a un archivo cuando se pasa `--logfile`
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
