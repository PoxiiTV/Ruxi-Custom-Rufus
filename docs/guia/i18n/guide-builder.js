/* ══════════════════════════════════════════════════════════════════
   Ruxi — Constructor de la guía (la lógica vive aquí UNA sola vez).
   Los textos salen de I18N vía t('g.*'), así que la guía es multiidioma
   sin duplicar código. Compartido entre la app y la guía móvil (docs/guia).

   API:  window.GUIDE_BUILD.install({ laptop, reinstall, backup })
         window.GUIDE_BUILD.post({ laptop, backup })
         window.GUIDE_BUILD.tips()
   Cada paso puede tener: { t, d, crit, advanced, why, tip, action{label,url}, builder }
══════════════════════════════════════════════════════════════════ */
(function () {
  var NINITE_URL = 'https://ninite.com/chrome-vlc-winrar/ninite.exe';
  var MAS_URL = 'https://github.com/massgravel/Microsoft-Activation-Scripts';

  function buildInstallSteps(opts) {
    opts = opts || {};
    var lap = !!opts.laptop, re = !!opts.reinstall, backup = !!opts.backup;
    var s = [];
    s.push({ t: t('g.i.setup.t'), d: t('g.i.setup.d') });
    s.push({ t: t('g.i.key.t'), d: t('g.i.key.d') });
    s.push({ t: t('g.i.edition.t'), d: t('g.i.edition.d') });
    s.push({ t: t('g.i.terms.t'), d: t('g.i.terms.d') });
    s.push({ t: t('g.i.type.t'), d: t('g.i.type.d') });
    if (re) s.push({ crit: 1, t: t('g.i.partWipe.t'), d: t('g.i.partWipe.d'), why: t('g.i.partWipe.why'), tip: lap ? t('g.i.partWipe.tipLap') : t('g.i.partWipe.tipDesk') });
    else s.push({ crit: 1, t: t('g.i.partNew.t'), d: t('g.i.partNew.d'), why: t('g.i.partNew.why'), tip: lap ? t('g.i.partNew.tipLap') : t('g.i.partNew.tipDesk') });
    s.push({ t: t('g.i.installing.t'), d: t('g.i.installing.d') + (lap ? t('g.i.installing.dLap') : '') });
    s.push({ t: t('g.i.config.t'), d: t('g.i.config.dPre') + (lap ? t('g.i.config.dLap') : t('g.i.config.dDesk')) + t('g.i.config.dPost') });
    s.push({ t: t('g.i.desktop.t'), d: t('g.i.desktop.d') });
    // Si conserva archivos: paso "copia tus archivos" al principio
    if (backup) s.unshift({ crit: 1, t: t('bk.start.t'), d: t('bk.start.d'), tip: t('bk.start.tip') });
    return s;
  }

  function buildPostSteps(opts) {
    opts = opts || {};
    var lap = !!opts.laptop, backup = !!opts.backup;
    var s = [];
    s.push({ t: t('g.p.net.t'), d: lap ? t('g.p.net.dLap') : t('g.p.net.dDesk') });
    s.push({ t: t('g.p.update.t'), d: t('g.p.update.d') });
    if (lap) s.push({ t: t('g.p.drvLap.t'), d: t('g.p.drvLap.d'), tip: t('g.p.drvLap.tip') });
    else s.push({ t: t('g.p.drvDesk.t'), d: t('g.p.drvDesk.d'), tip: t('g.p.drvDesk.tip') });
    s.push({ t: t('g.p.check.t'), d: t('g.p.check.d') + (lap ? t('g.p.check.dLap') : '') });
    s.push({ t: t('g.p.ninite.t'), d: t('g.p.ninite.d'), action: { label: t('g.p.ninite.action'), url: NINITE_URL }, builder: true, tip: t('g.p.ninite.tip') });
    s.push({ advanced: true, t: t('g.p.mas.t'), d: t('g.p.mas.d'), action: { label: t('g.p.mas.action'), url: MAS_URL }, tip: t('g.p.mas.tip') });
    // Si conserva archivos: paso "devuelve tus archivos" al final
    if (backup) s.push({ t: t('bk.end.t'), d: t('bk.end.d') });
    return s;
  }

  function getTips() {
    var out = [];
    for (var i = 1; i <= 10; i++) out.push(t('g.tip' + i));
    return out;
  }

  window.GUIDE_BUILD = { install: buildInstallSteps, post: buildPostSteps, tips: getTips };
})();
