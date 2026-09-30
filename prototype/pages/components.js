/* Vaani Labs prototype · components.html — fills the generated examples from the shared helpers (status map, language
   marks, sparkline, save chip, turn rows, charts, shell parts), clones every light pane into a dark pane, and wires
   the live overlay demos. Everything here uses the public window.Vaani API documented in _foundation-notes.md. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, D = w.VAANI_DATA, U = V.util, $ = U.$, $$ = U.$$;

  /* ---------- 1. generated examples (light panes only; they are cloned below) ---------- */
  $$('[data-gal-status]').forEach(function (el) {
    var dom = el.getAttribute('data-gal-status'), only = el.getAttribute('data-only'), keys = only ? only.split(',') : Object.keys(V.STATUS[dom]);
    el.innerHTML = keys.map(function (k) { return V.ui.statusTag(dom, k, { v: el.getAttribute('data-v'), n: el.getAttribute('data-n'), plain: el.hasAttribute('data-plain') }); }).join('');
  });
  $$('[data-gal-tag]').forEach(function (el) { var p = el.getAttribute('data-gal-tag').split(':'); el.outerHTML = V.ui.statusTag(p[0], p[1]); });
  $$('[data-gal-callstates]').forEach(function (el) {
    el.innerHTML = Object.keys(V.CALL_STATE).map(function (s) { return V.ui.callState(s, { timer: s === 'live' ? '02:14' : s === 'ringing' ? '00:07' : s === 'hold' ? '00:32' : null }); }).join('');
  });
  $$('[data-gal-langs]').forEach(function (el) {
    el.innerHTML = ['hi', 'en', 'hi-Latn', 'mr', 'ta', 'te', 'bn'].map(function (c) { return V.ui.langMark(c, 'full'); }).join('') + '<span class="gal-note">name only in tables:</span>' + V.ui.langMark('hi') + '<span class="gal-note">tile only in turn rows:</span>' + V.ui.langMark('hi', 'compact');
  });
  $$('[data-gal-spark]').forEach(function (el) { el.outerHTML = V.ui.sparkline(el.getAttribute('data-gal-spark').split(',').map(Number)); });
  $$('[data-gal-save]').forEach(function (el) {
    ['saved', 'dirty', 'saving', 'error', 'new', 'offline', 'conflict', 'device', 'volatile'].forEach(function (st) {
      var chip = d.createElement('span'); chip.setAttribute('data-state', st); el.appendChild(chip); V.saveState.set(chip, st, { at: '11:24 am', edits: 3, silent: true });
    });
  });
  $$('[data-gal-turns]').forEach(function (el) {
    var t = D.live[0].turns;
    el.innerHTML = V.ui.turn(t[0]) + V.ui.turn(t[1]) + V.ui.turn(t[2], { active: true }) + V.ui.turn(t[3]) + V.ui.turn(t[4]);
  });
  $$('[data-gal-heat]').forEach(function (el) {
    var v = [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 5, 4, 3, 3, 2, 3, 5, 4, 2, 1, 0, 0];
    el.innerHTML = v.map(function (x, h) { return '<i class="seq-' + x + '" title="' + h + ':00"></i>'; }).join('');
  });
  var shell = V.shell;
  $$('[data-gal-render]').forEach(function (el) {
    var k = el.getAttribute('data-gal-render');
    if (k === 'sidebar') el.innerHTML = shell.sidebarHtml();
    if (k === 'rail') el.innerHTML = shell.railHtml();
    if (k === 'bottombar') el.innerHTML = shell.bottombarHtml();
    if (k === 'topbar') { el.innerHTML = shell.topbarHtml(); var slot = $('[data-vaani="title-slot"]', el); slot.removeAttribute('data-vaani'); slot.innerHTML = '<span>Leads</span>'; var m = $('.topbar-menu', el); if (m) m.remove(); }
    if (k === 'blist') el.innerHTML = '<p class="sheet-section-label">Workspace status (BaselineList, 44 px rows)</p>' + shell.baselineListHtml();
  });
  $$('[data-gal-baselines]').forEach(function (el) {
    V.baseline.facts({ setupComplete: true });   /* the examples show the healthy fixture (§5.7), not the demo’s setup state */
    var states = [['flow', 'line', 'wallet', 'activity'], ['flow', 'line', 'wallet-low', 'activity', 'you-call'], ['flow-none', 'line-unverified', 'wallet-empty']], html = '';
    states.forEach(function (s) { V.baseline.set(s); html += '<div class="bl" role="group" aria-label="Baseline example">' + shell.baselineHtml(0) + '</div>'; });
    V.baseline.set(['flow', 'line', 'wallet', 'activity']); html += '<div class="bl" role="group" aria-label="Baseline example, short forms">' + shell.baselineHtml(5) + '</div>';
    V.baseline.set(null); V.baseline.facts({ setupComplete: false });
    html += '<div class="bl" role="group" aria-label="Baseline example, error"><button type="button" class="bl-btn">Couldn’t load workspace status · <u>Retry</u></button></div>';
    el.innerHTML = html;
  });
  $$('[data-indeterminate]').forEach(function (c) { c.indeterminate = true; });

  /* ---------- 2. clone each light pane into a dark pane; ids get a -d suffix, references follow ---------- */
  var REF = ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'data-dialog-open', 'data-drawer-open', 'data-popover', 'data-menu', 'data-submenu'];
  $$('.gal-pair').forEach(function (pair) {
    var light = $('.gal-pane[data-theme="light"]', pair); if (!light) return;
    var dark = light.cloneNode(true); dark.setAttribute('data-theme', 'dark');
    var lab = $('.gal-pane-label', dark); if (lab) lab.textContent = 'Dark';
    var ids = {};
    $$('[id]', dark).forEach(function (n) { ids[n.id] = n.id + '-d'; n.id = n.id + '-d'; });
    REF.forEach(function (a) { $$('[' + a + ']', dark).forEach(function (n) { n.setAttribute(a, n.getAttribute(a).split(/\s+/).map(function (x) { return ids[x] || x; }).join(' ')); }); });
    $$('input[name]', dark).forEach(function (n) { n.name = n.name + '-d'; });
    $$('input[type="checkbox"]', light).forEach(function (c, i) { var dc = $$('input[type="checkbox"]', dark)[i]; if (dc) dc.indeterminate = c.indeterminate; });
    pair.appendChild(dark); V.initAll(dark);
    /* landmarks in the dark copy get their own names so each landmark stays unique on the page */
    $$('nav, aside, form[role="search"], section[aria-label], section[aria-labelledby], [role="region"], [role="navigation"], [role="search"]', dark).forEach(function (n) {
      var by = n.getAttribute('aria-labelledby'), name = n.getAttribute('aria-label') || (by && U.byId(by) ? U.byId(by).textContent.trim() : '');
      if (!name) return; n.removeAttribute('aria-labelledby'); n.setAttribute('aria-label', name + ' (dark example)');
    });
  });
  $$('[data-gal-bars]').forEach(function (el) {
    var days = D.usage.slice(-7);
    V.charts.bars(el, { data: days.map(function (u) { return { label: V.fmt.dateShort(u.date + 'T12:00:00+05:30'), sub: V.fmt.weekday(u.date + 'T12:00:00+05:30') + ' ' + V.fmt.dateShort(u.date + 'T12:00:00+05:30'), value: u.calls }; }), unit: 'calls', label: 'Calls per day, last 7 days' });
  });

  /* ---------- 3. gallery controls: theme, panes ---------- */
  var themeSeg = $('#gal-theme'), paneSeg = $('#gal-panes');
  $$('[role="radio"]', themeSeg).forEach(function (r) { r.setAttribute('aria-checked', r.getAttribute('data-value') === V.theme.get() ? 'true' : 'false'); }); V.seg.init(themeSeg.parentNode);
  themeSeg.addEventListener('vaani:change', function (e) { V.theme.set(e.detail.value); if (w.innerWidth < 768) setPanes(null); });
  function setPanes(v) { var val = v || (w.innerWidth < 768 ? V.theme.resolved() : 'both'); if (val === 'both') d.documentElement.removeAttribute('data-panes'); else d.documentElement.setAttribute('data-panes', val); $$('[role="radio"]', paneSeg).forEach(function (r) { r.setAttribute('aria-checked', r.getAttribute('data-value') === val ? 'true' : 'false'); }); V.seg.init(paneSeg.parentNode); }
  paneSeg.addEventListener('vaani:change', function (e) { setPanes(e.detail.value); });
  setPanes(null);

  /* ---------- 4. live overlay demos ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-gal-confirm],[data-gal-confirm-item],[data-gal-toast],[data-gal-create]'); if (!t) return;
    if (t.hasAttribute('data-gal-confirm') || t.hasAttribute('data-gal-confirm-item')) {
      setTimeout(function () {
        V.dialog.confirm({ title: 'Delete ‘Site-visit qualifier’?', body: 'It stops answering +91 80 •••• 2210 and is removed from 1 scheduled batch. Call reports for its 121 calls are kept. This can’t be undone.', impact: [{ icon: 'phone-incoming', text: 'Inbound +91 80 •••• 2210' }, { icon: 'list', text: "Batch · 'Weekend follow-ups'" }], confirmLabel: 'Delete flow', tone: 'danger', typedConfirm: { value: 'Site-visit qualifier', hint: 'Type the flow name to delete it.' }, returnTo: t })
          .then(function (ok) { if (ok) V.toast.success('Deleted ‘Site-visit qualifier’'); });
      }, 0);
    }
    if (t.hasAttribute('data-gal-toast')) {
      var k = t.getAttribute('data-gal-toast');
      if (k === 'success') V.toast.success('Default flow updated · used by Cockpit, Meetings and Leads');
      if (k === 'undo') V.toast.undo('Deleted ‘Polite close’ and 2 connections', { action: { label: 'Undo', onClick: function () { V.toast.info('Restored ‘Polite close’'); } } });
      if (k === 'error') V.toast.error('Couldn’t save. Your last 2 edits are on this device.', { action: { label: 'Retry', onClick: function () {} } });
    }
    if (t.hasAttribute('data-gal-create')) { var dl = t.closest('.dlg'); dl.removeAttribute('data-dirty'); V.dialog.close(dl, 'done'); V.toast.success('Lead added'); }
  });
  d.addEventListener('input', function (e) { var dl = e.target.closest('#gov-newlead'); if (dl) dl.setAttribute('data-dirty', 'true'); });
  V.commandPalette.register([{ group: 'actions', title: 'Open the page template', icon: 'panel-left', rank: 'top', keywords: ['template', 'skeleton'], perform: function () { w.location.href = '_template.html'; } }]);
  /* R2C-16: keep each class name or spec file whole ("--link", "02-components-gate"); lines break only at spaces and the
     separators. Each word is its own nowrap token: a whole " · " part as one token (e.g. ".kbd — rendered by Vaani.ui…")
     could not wrap and pushed the gallery 72 px wide at 390 (final smoke, 27 Sep). */
  [].forEach.call(d.querySelectorAll('.gal-ref, .gal-meta'), function (el) {
    if (el.children.length) return;
    var parts = el.textContent.split(' · ');
    var x = function (v) { return v.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var tok = function (v) { return v.split(' ').map(function (wd) { return wd ? '<span class="gal-tok">' + x(wd) + '</span>' : ''; }).join(' '); };
    el.innerHTML = parts.map(function (t) { var m = /^(Spec: )(.*)$/.exec(t);
      return m ? x(m[1]) + tok(m[2]) : tok(t); }).join(' · ');
  });
})(window, document);
