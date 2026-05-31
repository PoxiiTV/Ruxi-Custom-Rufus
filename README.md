<div align="center">

<img src="electron/app/renderer/assets/logo.png" width="110" alt="Ruxi logo" />

# ✨ Ruxi

### La forma más sencilla de instalar Windows 🪟

**Sin tecnicismos. Sin pasos raros. Sin pagar a nadie.**
Solo tú, un USB y unos minutos. 🚀

<br>

[![GitHub release](https://img.shields.io/github/v/release/PoxiiTV/Ruxi-Custom-Rufus?include_prereleases&style=for-the-badge&color=7b5cff&labelColor=11132a)](https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases)
[![License: GPL v3](https://img.shields.io/badge/Licencia-GPLv3-2f7bff?style=for-the-badge&labelColor=11132a)](LICENSE.txt)
[![Made by Poxi](https://img.shields.io/badge/hecho%20por-Poxi-e23aff?style=for-the-badge&labelColor=11132a)](https://github.com/PoxiiTV)

</div>

<br>

---

## 💡 ¿Por qué existe Ruxi?

Instalar Windows **no es difícil** — solo lo parece. 😮‍💨

Mucha gente acaba llevando el ordenador a una tienda y pagando por algo que, con la guía adecuada, podría hacer perfectamente en casa en media hora. Particiones, BIOS, "arrancar desde USB", TPM, Secure Boot… palabras que asustan, pero que en realidad esconden un proceso bastante simple.

**Ruxi existe para que cualquiera pueda hacerlo solo.** 🙌

Tanto si te acabas de montar un PC nuevo, como si quieres dejar tu portátil como recién salido de fábrica, Ruxi te coge de la mano desde el minuto cero: te ayuda a descargar Windows, prepara el USB automáticamente y te explica **paso a paso, en lenguaje normal**, qué hacer hasta que tengas Windows funcionando.

> 🎯 **El objetivo:** que sepas hacerlo tú, entiendas lo que estás haciendo, y no dependas (ni pagues) a nadie para algo que está a tu alcance.

---

## 🪄 ¿Qué es exactamente?

Ruxi es un fork de [**Rufus**](https://github.com/pbatard/rufus) — la herramienta más fiable del mundo para crear USBs de arranque — pero con:

- 🎨 Una **interfaz nueva y bonita** (glassmorphism oscuro)
- 🧭 Un **asistente guiado** que decide la parte técnica por ti
- 📚 Un **tutorial integrado** que no te suelta hasta tener Windows instalado

> 👵 **Pensado para todos:** si tu abuela sabe usar WhatsApp, sabe usar Ruxi.

### 🆚 Ruxi vs. Rufus original

| | 🔧 Rufus | ✨ Ruxi |
|---|:---:|:---:|
| **Interfaz** | Clásica Win32 | Glassmorphism moderno |
| **Dificultad** | Técnica (GPT, UEFI, NTFS…) | Todo automático |
| **Tutorial** | ❌ | ✅ Integrado paso a paso |
| **Descarga de ISO** | ❌ | ✅ Desde la propia app |
| **ISO recomendada** | ❌ | ✅ Windows 11 LTSC optimizado |
| **Guía post-instalación** | ❌ | ✅ Drivers, WiFi, updates |
| **Motor de grabado** | Rufus | Rufus (por debajo) |

---

## 🌟 Características

- 🧭 **Asistente guiado** — 9 pantallas que te llevan de la mano de principio a fin
- ⬇️ **Descarga de ISOs integrada** — Baja Windows desde la propia app, con barra de progreso
- ⭐ **ISO recomendada** — Windows 11 IoT LTSC 2024 optimizado por Poxi: sin bloatware, sin telemetría, máximo rendimiento para gaming
- ⚙️ **Todo automático** — GPT + UEFI + NTFS + bypass de TPM/SecureBoot/RAM configurados solos
- 🙅 **Cuenta local** — Sin obligarte a usar cuenta de Microsoft
- 🔐 **Permisos automáticos** — Pide administrador al abrirse (no hay que hacer "ejecutar como admin")
- 🏷️ **USB con nombre propio** — Se crea como `Poxi-WINDOWS`
- ⌨️ **Guía de arranque** — Tabla de teclas por marca (ASUS, MSI, HP, Lenovo, Dell…) y solución al "Secure Boot Violation"
- ✅ **Guía de instalación adaptativa** — Pasos marcables que cambian según tu equipo (🖥️ sobremesa / 💻 portátil) y tu caso (🆕 PC nuevo / ♻️ reinstalar)
- 🚀 **Guía post-instalación** — Qué hacer al terminar: internet, Windows Update y drivers del fabricante (WiFi/touchpad en portátiles, GPU/chipset en sobremesa)

---

## 📥 Descarga

<div align="center">

### 👉 **[Descargar la última versión](https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases)** 👈

</div>

Baja el archivo **`Ruxi-Portable.exe`** de la última release.
**No se instala** — doble clic y listo. ✨

> 🖥️ Requiere **Windows 10/11 (64 bits)**. Te pedirá permisos de administrador al abrirlo (es normal y necesario para grabar el USB).

---

## 🪟 ¿Qué Windows instalo?

Dentro de la app puedes descargar la ISO directamente, pero aquí tienes los enlaces:

| Versión | Enlace | Notas |
|---------|--------|-------|
| 🪟 **Windows 10** | [Descargar](https://drive.google.com/file/d/1YefHUkzusD1ep7aM8Iv38HHjWmQ7xZJg) | Descarga directa |
| 🪟 **Windows 11** | [microsoft.com](https://www.microsoft.com/es-es/software-download/windows11) | Oficial Microsoft |
| ⭐ **Windows 11 LTSC Poxi** | [Descargar](https://acortar.link/tIszzw) | **Recomendada** · Sin bloatware · Sin telemetría · Gaming |

---

## 🗺️ ¿Cómo funciona? (en 4 pasos)

1. 📥 **Descarga Windows** — desde la app o usa una ISO que ya tengas
2. 🔌 **Conecta un USB** (mínimo 8 GB — se borrará entero ⚠️)
3. 🚀 **Dale a empezar** — Ruxi formatea y graba todo solo
4. 📖 **Sigue la guía** — te explica cómo arrancar e instalar paso a paso

> ⏱️ Todo el proceso tarda entre 5 y 20 minutos según tu USB y tu PC.

---

## 👨‍💻 Para desarrolladores

<details>
<summary><b>Ver documentación técnica</b></summary>

<br>

### 📁 Estructura del proyecto

```
Ruxi-Custom-Rufus/
├── src/                     ← Motor Rufus (C) modificado
│   ├── rufus.c              ← Modo headless + UM_HEADLESS_INIT
│   ├── ui.c                 ← JSON progress → stdout
│   ├── stdio.c              ← Log a fichero (--logfile)
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
├── build-portable.bat       ← Build del portable (doble clic)
└── package.json
```

### 🔨 Compilar el motor (`rufus-engine.exe`)

El frontend Electron llama a `rufus-engine.exe` con el modo headless que añadimos:

1. Abre `rufus.sln` en **Visual Studio 2022**
2. Configuración **Release x64**
3. Build → Build Solution
4. Copia `x64\Release\rufus.exe` a `build\rufus-engine.exe`

#### ⚙️ Parámetros del motor headless

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

Salida JSON por stdout:
```json
{"status":"progress","percent":35}
{"status":"done"}
{"status":"error","message":"..."}
```

### 🏗️ Desarrollo y build

```bash
# Instalar dependencias
npm install

# Build portable (Ruxi-Portable.exe)
npm run build:portable

# Build instalador (requiere excluir app-builder.exe de Windows Defender)
npm run build:installer
```

O usa **`build-portable.bat`** (doble clic). El portable pide admin al abrirse gracias a `portable.requestExecutionLevel: "admin"` en `package.json`.

> 🔁 **Recuerda:** si tocas el C del motor, recompílalo en VS2022 y copia `x64\Release\rufus.exe` a `build\rufus-engine.exe` **antes** de hacer el build del portable.

> ⚠️ **Nota:** `npm start` no funciona en modo dev por un conflicto de resolución de módulos entre el paquete npm `electron` y el runtime. La app funciona perfectamente al hacer el build con electron-builder.

### 🧩 Modificaciones al código C de Rufus

Todos los cambios están marcados con comentarios `// Ruxi`:

- **`rufus.c`** — Flags CLI `--headless`, `--device`, `--username`, `--logfile`; mensaje `UM_HEADLESS_INIT` que se lanza **al terminar el escaneo de la ISO** (no antes, para evitar grabar sin imagen válida); selección automática de unidad y arranque del formato; etiqueta del volumen `Poxi-WINDOWS`; bypass del diálogo de actualización, del diálogo WUE, del aviso de bootloader UEFI revocado y de todas las confirmaciones modales cuando `bHeadless`; el resultado real (`done`/`error`) se emite desde `UM_FORMAT_COMPLETED`
- **`ui.c`** — `UpdateProgress` emite `{"status":"progress","percent":N}` a stdout cuando `bHeadless == TRUE`
- **`stdio.c`** — `uprintf` también vuelca el log a un archivo cuando se pasa `--logfile`
- **`rufus.h`** — `UM_HEADLESS_INIT` en el enum de mensajes; `extern BOOL bHeadless`
- **`wue.h`** — `extern char unattend_username[]`

</details>

---

## 🙏 Créditos

- 🛠️ **Motor** — [Rufus](https://github.com/pbatard/rufus) por Pete Batard (GPL v3)
- 🎨 **Frontend, diseño y concepto** — Poxi

Ruxi se distribuye bajo [**GPL v3**](LICENSE.txt), la misma licencia que Rufus.

---

<div align="center">

### ⭐ Si te ha servido, deja una estrella al repo ⭐

Hecho con 💜 por **Poxi**

[🌐 GitHub](https://github.com/PoxiiTV) · [📦 Releases](https://github.com/PoxiiTV/Ruxi-Custom-Rufus/releases)

</div>
