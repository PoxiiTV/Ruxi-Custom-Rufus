/* ══════════════════════════════════════════════════════════════════
   Ruxi — i18n (Español / English)
   - window.I18N: textos planos de la UI (innerHTML, admite <strong> etc.)
   - window.GUIDE: contenido dinámico de la guía por idioma
   - t(key), getLang(), setLang(l), applyI18n()
══════════════════════════════════════════════════════════════════ */

window.I18N = {
  es: {
    // Title bar / overlays
    'tb.faq': 'Ayuda y preguntas frecuentes',
    'tb.settings': 'Ajustes',
    'settings.title': '⚙️ Ajustes',
    'settings.lang': '🌍 Idioma',
    'settings.theme': '🎨 Tema de color',
    'tb.lang': 'Cambiar idioma',
    'tb.min': 'Minimizar',
    'tb.close': 'Cerrar',
    'faq.title': '❓ Ayuda y problemas comunes',
    'qr.title': '📱 Llévate la guía al móvil',
    'qr.intro': 'Escanea este código con la cámara del móvil y abre la guía ahí. Útil porque el PC estará ocupado instalando. 📲',

    // FAQ
    'faq.q1': 'El USB no aparece al arrancar el PC',
    'faq.a1': 'Asegúrate de pulsar la tecla de arranque correcta (mira la tabla en la guía, según tu marca) <strong>nada más encender</strong>, repetidamente. Si aún no sale, entra en la BIOS y activa <strong>"USB Boot"</strong> y desactiva <strong>"Secure Boot"</strong> y <strong>"Fast Boot"</strong>. Prueba también otro puerto USB (mejor uno trasero y de color negro/azul).',
    'faq.q2': 'Sale "Secure Boot Violation"',
    'faq.a2': 'Entra en la BIOS (tecla de tu marca), busca <strong>"Secure Boot"</strong> (suele estar en la pestaña "Boot" o "Security") y ponlo en <strong>"Disabled"</strong>. Guarda con <strong>F10</strong> y vuelve a arrancar desde el USB.',
    'faq.q3': 'No sé cómo entrar en la BIOS',
    'faq.a3': 'Apaga el PC. Enciéndelo y pulsa <strong>repetidamente</strong> la tecla de tu marca nada más ver el logo: normalmente <strong>Supr (Del)</strong>, <strong>F2</strong>, <strong>F10</strong> o <strong>Esc</strong>. En la guía tienes la tabla por marca.',
    'faq.q4': 'Se queda parado en un porcentaje',
    'faq.a4': 'Es normal que en algunos puntos parezca atascado un rato (sobre todo copiando <em>install.wim</em>). Espera unos minutos. Si pasan más de 15-20 min totalmente parado, cancela, prueba con otro USB o vuelve a descargar la ISO.',
    'faq.q5': '¿Voy a perder los archivos de mi PC?',
    'faq.a5': 'Crear el USB <strong>solo borra el USB</strong>, no tu PC. Tus archivos se pierden al <strong>instalar</strong> Windows si formateas el disco. Si no quieres perderlos, haz copia antes. La guía te avisa en el paso de las particiones.',
    'faq.q6': '¿Necesito una clave de producto de Windows?',
    'faq.a6': 'No para instalar. En el instalador pulsa <em>"No tengo clave de producto"</em>. Windows funciona sin activar (con marca de agua); puedes activarlo después cuando quieras.',
    'faq.q7': 'El WiFi no funciona tras instalar Windows',
    'faq.a7': 'Falta el driver de red. Conéctate con un <strong>cable de red</strong> temporalmente, o comparte internet desde el móvil por USB ("anclaje USB"), y pasa <strong>Windows Update</strong>. Luego instala los drivers de tu marca (en portátiles, la app del fabricante los instala todos).',
    'faq.q8': '¿Por qué hay que ejecutar como administrador?',
    'faq.a8': 'Grabar un USB a bajo nivel necesita permisos de administrador. Es totalmente normal y seguro; sin ellos Windows no deja formatear la unidad.',

    // Welcome
    'wel.sub': 'Instala Windows en minutos.<br/>Sin complicaciones. Para todos.',
    'wc.create.t': 'Crear USB e instalar Windows',
    'wc.create.d': 'Descarga Windows y prepara el USB de instalación',
    'wc.guide.t': 'Ya tengo el USB, ver la guía',
    'wc.guide.d': 'Cómo arrancar e instalar Windows paso a paso',
    'wc.help.t': 'Tengo un problema / Ayuda',
    'wc.help.d': 'Preguntas frecuentes y soluciones',
    'wel.note': 'Hecho por <strong>Poxi</strong> · basado en Rufus',

    // Screen 1
    's1.title': '¿Qué Windows quieres instalar?',
    's1.hint': 'Elige una opción. Si ya tienes la ISO descargada, salta este paso.',
    'iso.win10.d': 'Descarga directa. Un clic.',
    'iso.win11.d': 'Descarga oficial de Microsoft',
    'iso.poxi.d': 'Sin bloatware · Sin telemetría · Máximo rendimiento',
    'iso.poxi.f1': 'Más RAM y CPU libre para juegos',
    'iso.poxi.f2': 'Sin actualizaciones automáticas',
    'iso.poxi.f3': 'Sin Candy Crush, Teams, TikTok',
    'iso.poxi.f4': 'Sin Copilot ni iconos que no pediste',
    'iso.dl': '⬇ Descargar aquí',
    'iso.openweb': 'Abrir web →',
    'iso.recommended': '⭐ Recomendado',
    'btn.skipIso': 'Ya tengo la ISO →',

    // Screen 2
    's2.title': 'Selecciona tu archivo ISO',
    's2.hint': 'Busca el archivo <code>.iso</code> que descargaste (normalmente en la carpeta <strong>Descargas</strong>).',
    'iso.droplabel': 'Haz clic para buscar la ISO',
    'iso.droplabel.sel': 'ISO seleccionada:',
    'iso.checking': 'Comprobando ISO...',
    'btn.cancelDl': '✕ Cancelar',
    'btn.back': '← Atrás',
    'btn.continue': 'Continuar →',

    // Screen 3
    's3.title': 'Conecta tu USB',
    's3.hint': 'El USB debe tener <strong>mínimo 8 GB</strong>. Todo lo que contenga <strong>se borrará</strong>.',
    's3.warn': '⚠️ <strong>ATENCIÓN:</strong> TODO lo que haya dentro del USB se borrará sin excepción. Haz una copia si tienes algo importante.',
    'usb.searching': 'Buscando dispositivos USB...',
    'usb.none': 'No se detectaron unidades. Conecta tu USB e intenta de nuevo.',
    'usb.noneUsb': 'No se detectó ningún USB. Conéctalo, o pulsa "Mostrar discos internos" si quieres instalar en un disco fijo.',
    'usb.system': 'Aquí está tu Windows actual — no se puede usar',
    'usb.badgeSystem': 'Disco del sistema',
    'usb.badgeInternal': '⚠️ Disco interno',
    'usb.tooSmall': '— mín. 8 GB',
    'btn.showInternal': '⚙️ Mostrar discos internos',
    'btn.showUsbOnly': '💾 Mostrar solo USB',
    'btn.search': '🔄 Buscar',
    'btn.searching': '⏳ Buscando...',
    'btn.usbOk': 'Este es mi USB →',

    // Screen 4
    's4.title': '¿Cómo quieres llamarte?',
    's4.hint': 'Este será tu nombre de usuario en Windows. Se creará una <strong>cuenta local</strong> — sin Microsoft.',
    's4.label': 'Tu nombre en Windows',
    's4.placeholder': 'Ej: Poxi',
    's4.fieldhint': 'Sin espacios ni caracteres especiales. Máximo 20 letras.',

    // Screen 5
    's5.title': 'Todo listo',
    'sum.iso': 'ISO',
    'sum.usb': 'USB',
    'sum.user': 'Usuario',
    'autocfg.title': 'Se configurará automáticamente:',
    'autocfg.1': 'GPT + UEFI (compatible con PCs modernos)',
    'autocfg.2': 'Sin requisito de TPM ni RAM extra para Windows 11',
    'autocfg.3': 'Cuenta local — sin cuenta Microsoft obligatoria',
    'autocfg.4': 'Sin telemetría ni seguimiento de Microsoft',
    'autocfg.5': 'Sin bloatware preinstalado',
    's5.warn': '⚠️ El USB se formateará y <strong>TODO su contenido se perderá</strong>.',
    'btn.start': '🚀 EMPEZAR',

    // Screen 6
    's6.title': 'Grabando USB...',
    's6.warn': '🚫 <strong>NO desconectes el USB del PC</strong> durante este proceso.',
    'progress.starting': 'Iniciando...',
    'progress.preparing': 'Preparando...',
    'progress.processing': 'Procesando...',
    'progress.completed': '¡Completado!',
    'flash.title': '¿Qué está pasando ahora?',
    'flash.s1.t': 'Se borra el USB por completo',
    'flash.s1.d': 'Para que Windows pueda instalarse, el USB tiene que quedar totalmente vacío y configurado de una forma específica.',
    'flash.s2.t': 'Se copia Windows al USB',
    'flash.s2.d': 'Se transfieren todos los archivos de Windows desde la ISO al USB. Esto es lo que más tarda — puede llevar varios minutos.',
    'flash.s3.t': 'Se configura el arranque',
    'flash.s3.d': 'Se prepara el USB para que el PC pueda arrancar desde él y empezar a instalar Windows.',
    'flash.s4.t': 'Listo para instalar',
    'flash.s4.d': 'Cuando acabe, te diremos cómo usar el USB para instalar Windows en tu PC.',
    'tip.label': '💡 Mientras esperas',
    'btn.cancel': 'Cancelar',
    'eta.minLeft': 'restantes',
    'eta.minUnit': 'min',
    'eta.secUnit': 's',

    // Screen 7
    's7.title': '¡USB listo!',
    's7.sub': 'Ahora sigue estos pasos para instalar Windows:',
    's7.step1': 'Apaga el PC dejando el USB conectado',
    's7.step2': 'Enciéndelo y pulsa repetidamente la tecla de arranque',
    'boot.brand': 'Marca',
    'boot.bios': 'Tecla BIOS',
    'boot.boot': 'Tecla Boot',
    's7.step3.t': 'Selecciona tu USB de la lista',
    's7.step3.d': 'Sale la marca y capacidad del USB. Usa las flechas del teclado y pulsa Enter.',
    's7.step4': 'Espera a que cargue el instalador de Windows',
    'sb.toggle': '¿Te sale error "Secure Boot Violation"? Haz clic aquí',
    'sb.intro': 'Tu PC tiene Secure Boot activado. Hay que desactivarlo temporalmente:',
    'sb.1': 'Reinicia el PC y entra al BIOS (tecla de tu marca, tabla de arriba)',
    'sb.2': 'Busca la opción <strong>"Secure Boot"</strong> (en la pestaña "Boot" o "Security")',
    'sb.3': 'Cámbiala a <strong>"Disabled"</strong>',
    'sb.4': 'Guarda y sal (normalmente <strong>F10</strong>)',
    'sb.5': 'Intenta arrancar desde USB de nuevo',
    'btn.toGuide': 'Ver guía de instalación →',
    'pc.detect': '💻 Tu PC parece un <strong>{brand}</strong>{extra} → tecla de arranque normalmente <strong>{key}</strong> (resaltada abajo).',
    'pc.detectGeneric': '💻 Tu PC: <strong>{name}</strong>{extra}. Busca tu marca en la tabla.',

    // Screen 8
    's8.title': 'Instalar Windows',
    's8.hint': 'Cuéntanos sobre tu PC y te damos los pasos exactos para tu caso. <strong>No desconectes el USB.</strong>',
    'cfg.device': '¿Qué tipo de equipo es?',
    'chip.desktop': '🖥️ Sobremesa',
    'chip.laptop': '💻 Portátil',
    'cfg.scenario': '¿Qué vas a hacer?',
    'chip.new': '🆕 PC nuevo (sin sistema)',
    'chip.reinstall': '♻️ Reinstalar (borrar lo que hay)',
    'btn.qr': '📱 Llévatela al móvil',
    'btn.pdf': '📄 Guardar en PDF',
    'btn.pdf.gen': '⏳ Generando...',
    'sec.during': '📀 Durante la instalación',
    'sec.after': '🚀 Después de instalar (déjalo perfecto)',
    'done.title': '¡Todo listo!',
    'done.sub': 'Windows está instalado y configurado. Ya puedes quitar el USB y disfrutar de tu PC.',
    'guide.progress': '{done} de {total}',
    'btn.finish': 'Cerrar',

    // Status / update / changelog
    'status.ready': 'Listo',
    'status.step': 'Paso {n} de 9',
    'status.flashing': 'Grabando USB...',
    'status.usbReady': 'USB listo',
    'status.error': 'Error',
    'update.available': '✨ Hay una nueva versión de Ruxi disponible ({v})',
    'update.btn': 'Descargar',
    'update.btnNews': 'Ver novedades',
    'changelog.title': '📋 Novedades',
    'changelog.loading': 'Cargando novedades...',
    'changelog.error': 'No se pudieron cargar las novedades. Mira las releases en GitHub.',

    // Confirmaciones / errores / dinámicos
    'confirm.start': '¿Seguro que quieres continuar?\n\nTodo el contenido del USB "{drive}" se borrará de forma permanente.',
    'confirm.cancel': '¿Cancelar el proceso? El USB podría quedar inutilizable.',
    'confirm.internal': '⚠️ "{model}" es un DISCO INTERNO, no un USB.\n\nTodo su contenido se borrará. ¿Seguro que es aquí donde quieres instalar Windows?',
    'err.username.empty': 'Escribe un nombre de usuario.',
    'err.username.invalid': 'El nombre no puede tener espacios ni caracteres especiales. Solo letras, números, guión o guión bajo.',
    'err.usb.noletter': 'El USB no tiene letra de unidad asignada. Abre el Explorador de Windows, asigna una letra y vuelve.',
    'err.iso.tooSmall': '⚠️ Este archivo es demasiado pequeño para ser una ISO de Windows válida.',
    'err.iso.invalid': '⚠️ No se pudo leer el archivo como una ISO válida.',
    'err.iso.notWindows': '⚠️ Esto no parece una ISO de Windows. Puedes continuar, pero comprueba que es la correcta.',
    'iso.labelSuffix': ' · etiqueta: {label}',
    'inspect.checking': 'Comprobando qué hay en el USB...',
    'inspect.empty.t': '✅ El USB está vacío',
    'inspect.empty.d': '{label} · {gb} GB. No hay nada que perder.',
    'inspect.has.t': '⚠️ Este USB tiene cosas dentro',
    'inspect.has.sub': '{label} · {used} GB usados de {total} GB · {count} elementos',
    'inspect.more': '…y {n} más',
    'inspect.warn': 'Todo esto se borrará <strong>para siempre</strong>. Si hay algo importante, cópialo antes a otro sitio.',
    'pdf.error': 'No se pudo crear el PDF: {error}',
    'pdf.docTitle': '🪟 Guía de instalación de Windows — Ruxi',
    'pdf.meta': 'Equipo: <strong>{device}</strong> · Caso: <strong>{case}</strong>',
    'pdf.bootTitle': '⌨️ Tecla para arrancar desde el USB (según tu marca)',
    'pdf.bootIntro': 'Apaga el PC con el USB puesto, enciéndelo y pulsa repetidamente la tecla "Boot":',
    'pdf.foot': 'Generado por Ruxi · github.com/PoxiiTV/Ruxi-Custom-Rufus',

    // Language picker
    'lang.title': 'Elige tu idioma',
    'lang.sub': 'Choose your language',
  },

  en: {
    'tb.faq': 'Help and FAQ',
    'tb.settings': 'Settings',
    'settings.title': '⚙️ Settings',
    'settings.lang': '🌍 Language',
    'settings.theme': '🎨 Color theme',
    'tb.lang': 'Change language',
    'tb.min': 'Minimize',
    'tb.close': 'Close',
    'faq.title': '❓ Help & common problems',
    'qr.title': '📱 Take the guide on your phone',
    'qr.intro': 'Scan this code with your phone camera and open the guide there. Handy because the PC will be busy installing. 📲',

    'faq.q1': "The USB doesn't show up when starting the PC",
    'faq.a1': "Make sure you press the right boot key (see the table in the guide, by brand) <strong>right after powering on</strong>, repeatedly. If it still doesn't appear, enter the BIOS and enable <strong>\"USB Boot\"</strong> and disable <strong>\"Secure Boot\"</strong> and <strong>\"Fast Boot\"</strong>. Also try another USB port (preferably a rear black/blue one).",
    'faq.q2': 'It says "Secure Boot Violation"',
    'faq.a2': 'Enter the BIOS (your brand\'s key), find <strong>"Secure Boot"</strong> (usually under the "Boot" or "Security" tab) and set it to <strong>"Disabled"</strong>. Save with <strong>F10</strong> and boot from the USB again.',
    'faq.q3': "I don't know how to enter the BIOS",
    'faq.a3': "Turn off the PC. Power it on and press your brand's key <strong>repeatedly</strong> as soon as you see the logo: usually <strong>Del</strong>, <strong>F2</strong>, <strong>F10</strong> or <strong>Esc</strong>. The guide has the table by brand.",
    'faq.q4': 'It gets stuck at a percentage',
    'faq.a4': "It's normal for it to seem stuck for a while at some points (especially copying <em>install.wim</em>). Wait a few minutes. If it stays fully frozen for more than 15-20 min, cancel, try another USB or re-download the ISO.",
    'faq.q5': 'Will I lose the files on my PC?',
    'faq.a5': 'Creating the USB <strong>only erases the USB</strong>, not your PC. Your files are lost when <strong>installing</strong> Windows if you format the disk. If you want to keep them, back them up first. The guide warns you at the partitions step.',
    'faq.q6': 'Do I need a Windows product key?',
    'faq.a6': 'Not to install. In the installer click <em>"I don\'t have a product key"</em>. Windows works unactivated (with a watermark); you can activate it later whenever you want.',
    'faq.q7': "WiFi doesn't work after installing Windows",
    'faq.a7': 'The network driver is missing. Connect with an <strong>ethernet cable</strong> temporarily, or share internet from your phone via USB ("USB tethering"), and run <strong>Windows Update</strong>. Then install your brand\'s drivers (on laptops, the manufacturer app installs them all).',
    'faq.q8': 'Why do I have to run as administrator?',
    'faq.a8': 'Writing a USB at a low level needs administrator permissions. It\'s completely normal and safe; without them Windows won\'t let it format the drive.',

    'wel.sub': 'Install Windows in minutes.<br/>No hassle. For everyone.',
    'wc.create.t': 'Create USB & install Windows',
    'wc.create.d': 'Download Windows and prepare the install USB',
    'wc.guide.t': 'I already have the USB, show the guide',
    'wc.guide.d': 'How to boot and install Windows step by step',
    'wc.help.t': 'I have a problem / Help',
    'wc.help.d': 'Frequently asked questions and fixes',
    'wel.note': 'Made by <strong>Poxi</strong> · based on Rufus',

    's1.title': 'Which Windows do you want to install?',
    's1.hint': 'Pick an option. If you already downloaded the ISO, skip this step.',
    'iso.win10.d': 'Direct download. One click.',
    'iso.win11.d': 'Official Microsoft download',
    'iso.poxi.d': 'No bloatware · No telemetry · Maximum performance',
    'iso.poxi.f1': 'More free RAM and CPU for gaming',
    'iso.poxi.f2': 'No automatic updates',
    'iso.poxi.f3': 'No Candy Crush, Teams, TikTok',
    'iso.poxi.f4': 'No Copilot or icons you never asked for',
    'iso.dl': '⬇ Download here',
    'iso.openweb': 'Open website →',
    'iso.recommended': '⭐ Recommended',
    'btn.skipIso': 'I already have the ISO →',

    's2.title': 'Select your ISO file',
    's2.hint': 'Find the <code>.iso</code> file you downloaded (usually in your <strong>Downloads</strong> folder).',
    'iso.droplabel': 'Click to browse for the ISO',
    'iso.droplabel.sel': 'Selected ISO:',
    'iso.checking': 'Checking ISO...',
    'btn.cancelDl': '✕ Cancel',
    'btn.back': '← Back',
    'btn.continue': 'Continue →',

    's3.title': 'Plug in your USB',
    's3.hint': 'The USB must be <strong>at least 8 GB</strong>. Everything on it <strong>will be erased</strong>.',
    's3.warn': '⚠️ <strong>WARNING:</strong> EVERYTHING on the USB will be erased, no exceptions. Make a backup if you have anything important.',
    'usb.searching': 'Searching for USB devices...',
    'usb.none': 'No drives detected. Plug in your USB and try again.',
    'usb.noneUsb': 'No USB detected. Plug it in, or click "Show internal disks" if you want to install on a fixed disk.',
    'usb.system': "This is your current Windows — it can't be used",
    'usb.badgeSystem': 'System disk',
    'usb.badgeInternal': '⚠️ Internal disk',
    'usb.tooSmall': '— min. 8 GB',
    'btn.showInternal': '⚙️ Show internal disks',
    'btn.showUsbOnly': '💾 Show USB only',
    'btn.search': '🔄 Search',
    'btn.searching': '⏳ Searching...',
    'btn.usbOk': 'This is my USB →',

    's4.title': 'What should we call you?',
    's4.hint': 'This will be your Windows username. A <strong>local account</strong> will be created — no Microsoft.',
    's4.label': 'Your name in Windows',
    's4.placeholder': 'e.g. Poxi',
    's4.fieldhint': 'No spaces or special characters. Max 20 letters.',

    's5.title': 'All set',
    'sum.iso': 'ISO',
    'sum.usb': 'USB',
    'sum.user': 'User',
    'autocfg.title': 'Will be configured automatically:',
    'autocfg.1': 'GPT + UEFI (compatible with modern PCs)',
    'autocfg.2': 'No TPM or extra RAM requirement for Windows 11',
    'autocfg.3': 'Local account — no mandatory Microsoft account',
    'autocfg.4': 'No telemetry or Microsoft tracking',
    'autocfg.5': 'No preinstalled bloatware',
    's5.warn': '⚠️ The USB will be formatted and <strong>ALL its contents will be lost</strong>.',
    'btn.start': '🚀 START',

    's6.title': 'Writing USB...',
    's6.warn': '🚫 <strong>DO NOT unplug the USB</strong> during this process.',
    'progress.starting': 'Starting...',
    'progress.preparing': 'Preparing...',
    'progress.processing': 'Processing...',
    'progress.completed': 'Done!',
    'flash.title': "What's happening now?",
    'flash.s1.t': 'The USB is fully erased',
    'flash.s1.d': 'For Windows to install, the USB has to be completely empty and configured in a specific way.',
    'flash.s2.t': 'Windows is copied to the USB',
    'flash.s2.d': 'All Windows files are transferred from the ISO to the USB. This is the slowest part — it can take several minutes.',
    'flash.s3.t': 'Boot is configured',
    'flash.s3.d': 'The USB is prepared so the PC can boot from it and start installing Windows.',
    'flash.s4.t': 'Ready to install',
    'flash.s4.d': "When it's done, we'll tell you how to use the USB to install Windows on your PC.",
    'tip.label': '💡 While you wait',
    'btn.cancel': 'Cancel',
    'eta.minLeft': 'left',
    'eta.minUnit': 'min',
    'eta.secUnit': 's',

    's7.title': 'USB ready!',
    's7.sub': 'Now follow these steps to install Windows:',
    's7.step1': 'Turn off the PC leaving the USB connected',
    's7.step2': 'Turn it on and repeatedly press the boot key',
    'boot.brand': 'Brand',
    'boot.bios': 'BIOS key',
    'boot.boot': 'Boot key',
    's7.step3.t': 'Select your USB from the list',
    's7.step3.d': 'It shows the brand and capacity of the USB. Use the arrow keys and press Enter.',
    's7.step4': 'Wait for the Windows installer to load',
    'sb.toggle': 'Getting a "Secure Boot Violation" error? Click here',
    'sb.intro': 'Your PC has Secure Boot enabled. You need to disable it temporarily:',
    'sb.1': 'Restart the PC and enter the BIOS (your brand\'s key, table above)',
    'sb.2': 'Find the <strong>"Secure Boot"</strong> option (under the "Boot" or "Security" tab)',
    'sb.3': 'Set it to <strong>"Disabled"</strong>',
    'sb.4': 'Save and exit (usually <strong>F10</strong>)',
    'sb.5': 'Try booting from USB again',
    'btn.toGuide': 'See installation guide →',
    'pc.detect': '💻 Your PC looks like a <strong>{brand}</strong>{extra} → boot key is usually <strong>{key}</strong> (highlighted below).',
    'pc.detectGeneric': '💻 Your PC: <strong>{name}</strong>{extra}. Find your brand in the table.',

    's8.title': 'Install Windows',
    's8.hint': 'Tell us about your PC and we give you the exact steps for your case. <strong>Do not unplug the USB.</strong>',
    'cfg.device': 'What kind of computer is it?',
    'chip.desktop': '🖥️ Desktop',
    'chip.laptop': '💻 Laptop',
    'cfg.scenario': 'What are you doing?',
    'chip.new': '🆕 New PC (no system)',
    'chip.reinstall': '♻️ Reinstall (wipe what\'s there)',
    'btn.qr': '📱 Take it on your phone',
    'btn.pdf': '📄 Save as PDF',
    'btn.pdf.gen': '⏳ Generating...',
    'sec.during': '📀 During installation',
    'sec.after': '🚀 After installing (make it perfect)',
    'done.title': 'All done!',
    'done.sub': 'Windows is installed and configured. You can now remove the USB and enjoy your PC.',
    'guide.progress': '{done} of {total}',
    'btn.finish': 'Close',

    'status.ready': 'Ready',
    'status.step': 'Step {n} of 9',
    'status.flashing': 'Writing USB...',
    'status.usbReady': 'USB ready',
    'status.error': 'Error',
    'update.available': '✨ A new version of Ruxi is available ({v})',
    'update.btn': 'Download',
    'update.btnNews': "See what's new",
    'changelog.title': "📋 What's new",
    'changelog.loading': 'Loading release notes...',
    'changelog.error': "Couldn't load release notes. Check the releases on GitHub.",

    'confirm.start': 'Are you sure you want to continue?\n\nAll contents of the USB "{drive}" will be erased permanently.',
    'confirm.cancel': 'Cancel the process? The USB might become unusable.',
    'confirm.internal': '⚠️ "{model}" is an INTERNAL DISK, not a USB.\n\nAll its contents will be erased. Are you sure this is where you want to install Windows?',
    'err.username.empty': 'Type a username.',
    'err.username.invalid': 'The name cannot have spaces or special characters. Only letters, numbers, hyphen or underscore.',
    'err.usb.noletter': 'The USB has no drive letter assigned. Open Windows Explorer, assign a letter and come back.',
    'err.iso.tooSmall': '⚠️ This file is too small to be a valid Windows ISO.',
    'err.iso.invalid': '⚠️ Could not read the file as a valid ISO.',
    'err.iso.notWindows': "⚠️ This doesn't look like a Windows ISO. You can continue, but check it's the right one.",
    'iso.labelSuffix': ' · label: {label}',
    'inspect.checking': "Checking what's on the USB...",
    'inspect.empty.t': '✅ The USB is empty',
    'inspect.empty.d': '{label} · {gb} GB. Nothing to lose.',
    'inspect.has.t': '⚠️ This USB has stuff on it',
    'inspect.has.sub': '{label} · {used} GB used of {total} GB · {count} items',
    'inspect.more': '…and {n} more',
    'inspect.warn': 'All of this will be erased <strong>forever</strong>. If anything is important, copy it somewhere else first.',
    'pdf.error': 'Could not create the PDF: {error}',
    'pdf.docTitle': '🪟 Windows installation guide — Ruxi',
    'pdf.meta': 'Computer: <strong>{device}</strong> · Case: <strong>{case}</strong>',
    'pdf.bootTitle': '⌨️ Key to boot from the USB (by brand)',
    'pdf.bootIntro': 'Turn off the PC with the USB plugged in, power it on and repeatedly press the "Boot" key:',
    'pdf.foot': 'Generated by Ruxi · github.com/PoxiiTV/Ruxi-Custom-Rufus',

    'lang.title': 'Choose your language',
    'lang.sub': 'Elige tu idioma',
  },
};

// ── Idioma actual + persistencia ──────────────────────────────────
function getLang() {
  return window.__ruxiLang || localStorage.getItem('ruxi-lang') || 'es';
}
function setLang(l) {
  window.__ruxiLang = (l === 'en') ? 'en' : 'es';
  try { localStorage.setItem('ruxi-lang', window.__ruxiLang); } catch {}
  document.documentElement.lang = window.__ruxiLang;
  applyI18n();
}
function t(key, vars) {
  const lang = getLang();
  let s = (window.I18N[lang] && window.I18N[lang][key]);
  if (s == null) s = (window.I18N.es[key] != null ? window.I18N.es[key] : key);
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
// Aplica las traducciones a todos los elementos marcados
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  if (typeof window.onLangChanged === 'function') window.onLangChanged();
}

// ── Contenido de la guía (pasos + tips) por idioma ────────────────
window.GUIDE = {
  es: {
    tips: [
      'Ve teniendo a mano la contraseña de tu WiFi para configurar Windows después.',
      'Si vas a instalar en un portátil, tenlo enchufado a la corriente.',
      'Es normal que tarde varios minutos. No cierres la ventana ni quites el USB.',
      'Cuanto más grande es la ISO, más se tarda en copiar. Paciencia 🙂',
      'Cuando acabe, te explicaremos paso a paso cómo arrancar e instalar.',
      '¿Sabías que un USB puede reescribirse miles de veces? Podrás reutilizarlo.',
      '"Bootear" significa arrancar el PC desde un dispositivo, como este USB.',
      'Apunta la tecla de arranque de tu PC (te la mostraremos al terminar).',
      'Si el USB va lento, uno USB 3.0 (azul por dentro) acelera mucho el proceso.',
      'Tranqui: si algo falla, te lo diremos claramente. No se rompe nada del PC.',
    ],
    install(lap, re) {
      const s = [];
      s.push({ t: 'Aparece "Instalación de Windows"', d: 'Sale una pantalla pidiendo idioma y teclado. Déjalo en <em>Español</em> → <strong>Siguiente</strong> → <strong>"Instalar ahora"</strong>.' });
      s.push({ t: 'Cuando pida la clave de producto', d: 'Pulsa abajo en <em>"No tengo clave de producto"</em>. Windows funcionará igual, lo puedes activar después.' });
      s.push({ t: 'Elige la edición (si te lo pregunta)', d: 'Normalmente <em>Windows Pro</em>. Si solo hay una opción, dale a Siguiente.' });
      s.push({ t: 'Acepta los términos', d: 'Marca la casilla de aceptar → Siguiente.' });
      s.push({ t: 'Tipo de instalación: "Personalizada"', d: 'Elige <strong>"Personalizada: instalar solo Windows"</strong>. <em>NUNCA</em> elijas "Actualización".' });
      if (re) s.push({ crit: 1, t: '⚠️ Momento clave — Borrar el disco viejo', d: 'Verás varias particiones (Recuperación, Sistema, EFI, Principal...). Identifica <strong>TU disco por el tamaño total</strong> y borra TODAS sus particiones una a una con <strong>"Eliminar"</strong>, hasta que quede una sola línea: <strong>"Espacio no asignado"</strong>. Selecciónala y pulsa <strong>Siguiente</strong>.', tip: lap ? '💡 Los portátiles suelen tener un solo disco: bórralo entero sin miedo. Si ves un disco aparte muy pequeño, suele ser de recuperación del fabricante.' : '💡 Si tienes VARIOS discos (ej. uno de datos de 1&nbsp;TB para fotos), NO toques sus particiones. Fíjate bien en el tamaño y borra SOLO las del disco donde quieres Windows.' });
      else s.push({ crit: 1, t: '⚠️ Momento clave — Elegir el disco', d: 'Verás tu disco como <strong>"Espacio no asignado"</strong>. Haz clic en él y pulsa <strong>Siguiente</strong>. Windows creará las particiones automáticamente, tú no tienes que hacer nada más.', tip: lap ? '💡 Si por algún motivo ya hubiera particiones, bórralas todas con "Eliminar" hasta dejar solo "Espacio no asignado".' : '💡 Si ves VARIOS discos, elige por el tamaño el que quieras usar para Windows. Si ya tuviera particiones, bórralas hasta dejar "Espacio no asignado".' });
      s.push({ t: 'Windows se instala solo', d: 'Copia los archivos y se reinicia varias veces. <strong>No toques nada</strong> y no quites el USB hasta que te pida configurar.' + (lap ? ' <strong>Mantén el portátil enchufado a la corriente.</strong>' : '') });
      s.push({ t: 'Configuración inicial de Windows', d: 'Elige país (España) y teclado. ' + (lap ? 'Cuando pida la red, <strong>conéctate a tu WiFi</strong> (te pedirá la contraseña).' : 'Si tienes cable de red, lo detecta solo; si usas WiFi, conéctala cuando lo pida.') + '<br>✨ Como Ruxi ya lo configuró todo, <strong>NO te obliga a poner cuenta de Microsoft</strong>: entrarás directo con tu usuario local.' });
      s.push({ t: '¡Llegaste al escritorio de Windows!', d: 'Ya está instalado. Ahora vamos a dejarlo perfecto con los pasos de abajo 👇' });
      return s;
    },
    post(lap) {
      const s = [];
      s.push({ t: 'Conéctate a internet', d: lap ? 'Clic en el icono de red (abajo a la derecha) → elige tu WiFi → contraseña. <br>Si el WiFi no aparece todavía, usa un cable de red, o comparte internet desde el móvil conectándolo por USB ("anclaje USB").' : 'Conecta el cable de red, o pulsa el icono de red (abajo a la derecha) y configura el WiFi.' });
      s.push({ t: 'Pasa Windows Update', d: 'Ve a <strong>Configuración → Windows Update → Buscar actualizaciones</strong>. Instala todo y reinicia si lo pide. Esto ya instala muchos drivers automáticamente.' });
      if (lap) s.push({ t: 'Instala los drivers de tu portátil', d: 'Entra en la web de soporte de tu marca (HP, Lenovo, ASUS, Acer, MSI...), busca tu <strong>modelo exacto</strong> y descarga los drivers. Lo más importante: <strong>WiFi/Bluetooth, touchpad y teclas Fn</strong>.', tip: '💡 Muchas marcas tienen una app que lo hace sola: <em>MyASUS, Lenovo Vantage, HP Support Assistant, MyDell...</em>. Y si el WiFi no va al principio, descarga el driver de red desde otro PC y pásalo por USB.' });
      else s.push({ t: 'Instala los drivers de tu sobremesa', d: 'Descarga el driver de tu <strong>tarjeta gráfica</strong>: <em>NVIDIA (GeForce Experience), AMD (Adrenalin) o Intel</em>. Y el <strong>chipset</strong> desde la web de tu placa base (ASUS, Gigabyte, MSI, ASRock...).', tip: '💡 Si no sabes qué placa tienes, pulsa Win+R, escribe <em>msinfo32</em> y mira "Fabricante/Modelo de la placa base".' });
      s.push({ t: 'Comprueba que todo funciona', d: 'Revisa sonido, los puertos USB e internet.' + (lap ? ' Y además: cámara, touchpad, teclas de brillo/volumen y el lector de huella si tiene.' : '') });
      s.push({ t: 'Instala los programas básicos de un golpe', d: 'Con <strong>Ninite</strong> instalas los programas más usados de una vez, sin anuncios ni basura: descarga un único instalador, ábrelo y él solo baja e instala todo (sin pulsar "Siguiente" mil veces ni marcar casillas raras). Incluye:<br>🌐 <strong>Chrome</strong> (navegador) · 🎬 <strong>VLC</strong> (vídeos) · 🗜️ <strong>WinRAR</strong> (abrir .zip y .rar)', action: { label: '📦 Descargar instalador (Chrome + VLC + WinRAR)', url: 'https://ninite.com/chrome-vlc-winrar/ninite.exe' }, tip: '💡 Es 100% seguro y gratis. Después puedes instalar lo que quieras más (juegos, ofimática...). ¡Tu PC ya está a punto! 🎉' });
      return s;
    },
  },
  en: {
    tips: [
      'Have your WiFi password handy to set up Windows afterwards.',
      "If you're installing on a laptop, keep it plugged into power.",
      "It's normal for it to take several minutes. Don't close the window or remove the USB.",
      'The bigger the ISO, the longer it takes to copy. Be patient 🙂',
      "When it's done, we'll walk you through booting and installing step by step.",
      'Did you know a USB can be rewritten thousands of times? You can reuse it.',
      '"Booting" means starting the PC from a device, like this USB.',
      "Note down your PC's boot key (we'll show it to you at the end).",
      'If the USB is slow, a USB 3.0 one (blue inside) speeds things up a lot.',
      "Relax: if something fails, we'll tell you clearly. Nothing on the PC breaks.",
    ],
    install(lap, re) {
      const s = [];
      s.push({ t: '"Windows Setup" appears', d: 'A screen asks for language and keyboard. Leave it on <em>English</em> → <strong>Next</strong> → <strong>"Install now"</strong>.' });
      s.push({ t: 'When it asks for the product key', d: 'Click <em>"I don\'t have a product key"</em> at the bottom. Windows works fine, you can activate it later.' });
      s.push({ t: 'Choose the edition (if asked)', d: 'Usually <em>Windows Pro</em>. If there\'s only one option, click Next.' });
      s.push({ t: 'Accept the terms', d: 'Tick the accept box → Next.' });
      s.push({ t: 'Installation type: "Custom"', d: 'Choose <strong>"Custom: install Windows only"</strong>. <em>NEVER</em> pick "Upgrade".' });
      if (re) s.push({ crit: 1, t: '⚠️ Key moment — Wipe the old disk', d: 'You\'ll see several partitions (Recovery, System, EFI, Primary...). Identify <strong>YOUR disk by its total size</strong> and delete ALL its partitions one by one with <strong>"Delete"</strong>, until a single line remains: <strong>"Unallocated space"</strong>. Select it and press <strong>Next</strong>.', tip: lap ? '💡 Laptops usually have a single disk: wipe it entirely without fear. If you see a small separate disk, it\'s usually the manufacturer\'s recovery.' : '💡 If you have SEVERAL disks (e.g. a 1&nbsp;TB data disk for photos), do NOT touch their partitions. Check the size carefully and delete ONLY those of the disk where you want Windows.' });
      else s.push({ crit: 1, t: '⚠️ Key moment — Choose the disk', d: 'You\'ll see your disk as <strong>"Unallocated space"</strong>. Click on it and press <strong>Next</strong>. Windows will create the partitions automatically, you don\'t have to do anything else.', tip: lap ? '💡 If for some reason there are already partitions, delete them all with "Delete" until only "Unallocated space" is left.' : '💡 If you see SEVERAL disks, pick by size the one you want for Windows. If it already has partitions, delete them until only "Unallocated space" remains.' });
      s.push({ t: 'Windows installs by itself', d: 'It copies files and restarts several times. <strong>Don\'t touch anything</strong> and don\'t remove the USB until it asks you to configure.' + (lap ? ' <strong>Keep the laptop plugged into power.</strong>' : '') });
      s.push({ t: 'Initial Windows setup', d: 'Choose country and keyboard. ' + (lap ? 'When it asks for the network, <strong>connect to your WiFi</strong> (it will ask for the password).' : 'If you have an ethernet cable it detects it automatically; if you use WiFi, connect it when asked.') + '<br>✨ Since Ruxi already configured everything, it <strong>does NOT force you to add a Microsoft account</strong>: you go straight in with your local user.' });
      s.push({ t: 'You reached the Windows desktop!', d: "It's installed. Now let's make it perfect with the steps below 👇" });
      return s;
    },
    post(lap) {
      const s = [];
      s.push({ t: 'Connect to the internet', d: lap ? 'Click the network icon (bottom right) → pick your WiFi → password. <br>If WiFi doesn\'t show up yet, use an ethernet cable, or share internet from your phone via USB ("USB tethering").' : 'Connect the ethernet cable, or click the network icon (bottom right) and set up WiFi.' });
      s.push({ t: 'Run Windows Update', d: 'Go to <strong>Settings → Windows Update → Check for updates</strong>. Install everything and restart if asked. This already installs many drivers automatically.' });
      if (lap) s.push({ t: 'Install your laptop drivers', d: 'Go to your brand\'s support website (HP, Lenovo, ASUS, Acer, MSI...), find your <strong>exact model</strong> and download the drivers. Most important: <strong>WiFi/Bluetooth, touchpad and Fn keys</strong>.', tip: '💡 Many brands have an app that does it for you: <em>MyASUS, Lenovo Vantage, HP Support Assistant, MyDell...</em>. And if WiFi doesn\'t work at first, download the network driver from another PC and copy it via USB.' });
      else s.push({ t: 'Install your desktop drivers', d: 'Download your <strong>graphics card</strong> driver: <em>NVIDIA (GeForce Experience), AMD (Adrenalin) or Intel</em>. And the <strong>chipset</strong> from your motherboard\'s website (ASUS, Gigabyte, MSI, ASRock...).', tip: '💡 If you don\'t know your motherboard, press Win+R, type <em>msinfo32</em> and look at "BaseBoard Manufacturer/Product".' });
      s.push({ t: 'Check that everything works', d: 'Check sound, the USB ports and internet.' + (lap ? ' And also: camera, touchpad, brightness/volume keys and the fingerprint reader if it has one.' : '') });
      s.push({ t: 'Install the basic programs in one go', d: 'With <strong>Ninite</strong> you install the most-used programs at once, with no ads or junk: download a single installer, open it and it downloads and installs everything by itself (no clicking "Next" a thousand times or ticking weird boxes). Includes:<br>🌐 <strong>Chrome</strong> (browser) · 🎬 <strong>VLC</strong> (videos) · 🗜️ <strong>WinRAR</strong> (open .zip and .rar)', action: { label: '📦 Download installer (Chrome + VLC + WinRAR)', url: 'https://ninite.com/chrome-vlc-winrar/ninite.exe' }, tip: '💡 It\'s 100% safe and free. Afterwards you can install whatever else you want (games, office...). Your PC is all set! 🎉' });
      return s;
    },
  },
};
