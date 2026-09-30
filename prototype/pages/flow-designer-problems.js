/* Vaani Labs prototype · Flow Designer · ProblemsBar and ProblemsPanel (FD1 §3.4, FD2 §12.4), the Problems list for the
   tablet tab and the phone sheet, Alt+. / Alt+, issue walking, and the canvas SelectionBar (FD1 §10.1, no Neel primary). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  S.issueIdx = 0; S.ppanel = false; S.ppFilter = 'all'; S.ppH = 220;
  function tagFor(c) { var t = []; if (c.errors) t.push(V.ui.statusTag('validation', c.errors === 1 ? 'error' : 'errors', { n: c.errors })); if (c.warnings) t.push(V.ui.statusTag('validation', c.warnings === 1 ? 'warning' : 'warnings', { n: c.warnings })); return t.join(''); }
  function stepIssues() { return S.issues; }

  VF.renderPbar = function () {
    var bar = $('#fd-pbar'); if (!bar || !S.m) return;
    if (S.mode === 'review' || S.mode === 'phone') { bar.hidden = true; return; } bar.hidden = false;
    if (S.compare) { bar.setAttribute('aria-label', 'Compare'); bar.className = 'fd-pbar fd-cmpbar'; VF.renderCompareBar(bar); return; }
    bar.className = 'fd-pbar'; bar.setAttribute('aria-label', 'Problems');
    var iss = stepIssues(), c = VF.counts(iss), n = iss.length, cur = iss[Math.min(S.issueIdx, n - 1)], legend = w.innerWidth >= 1440;
    var left = S.checking ? '<span class="status status--progress">' + VF.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Checking…</span>'
      : S.viewing ? '<span class="status status--plain">' + VF.icon('eye', 'sm') + '<span>Read-only version. Problems show for the draft.</span></span>'
      : !n ? '<span class="status status--success">' + VF.icon('check', 'sm') + '<span>No issues · ' + S.m.steps.length + ' steps checked just now</span></span>'
      : '<button type="button" class="fd-pb-counts" data-p="panel" aria-expanded="' + S.ppanel + '" aria-controls="fd-ppanel" aria-label="' + esc(VF.issueWords(c)) + '. ' + (S.ppanel ? 'Close' : 'Open') + ' problems">' + tagFor(c) + '</button><span class="fd-pb-msg" data-tooltip-overflow tabindex="-1">' + esc(cur.msg) + '</span><button type="button" class="btn btn--link fd-pb-go" data-p="go">Go to step</button>' +
        '<span class="fd-pb-nav"><button type="button" class="ibtn ibtn--sm" data-p="prev" aria-label="Previous issue" data-kbd="alt+,">' + VF.icon('chevron-left', 'sm') + '</button><span class="count-badge num">' + (Math.min(S.issueIdx, n - 1) + 1) + ' of ' + n + '</span><button type="button" class="ibtn ibtn--sm" data-p="next" aria-label="Next issue" data-kbd="alt+.">' + VF.icon('chevron-right', 'sm') + '</button></span>';
    bar.innerHTML = '<div class="fd-pb-l">' + left + '</div>' + (legend ? '<span class="fd-legend" aria-hidden="true"><span><svg class="fd-swatch" viewBox="0 0 24 8"><path class="fe" d="M0 4H24"/></svg>Path</span><span><svg class="fd-swatch" viewBox="0 0 24 8"><path class="fe fe--fallback" d="M0 4H24"/></svg>Fallback</span></span>' : '') +
      '<div class="fd-pb-r"><button type="button" class="btn btn--tertiary btn--sm" data-p="outline" aria-pressed="' + (S.left === 'outline') + '">' + VF.icon('list-tree', 'sm') + 'Outline</button><button type="button" class="btn btn--tertiary btn--sm" data-p="test" aria-pressed="' + !!S.testOpen + '">' + VF.icon('play', 'sm') + 'Test panel</button></div>';
    renderPanel();
  };
  VF.pbarInit = function () {
    $('#fd-pbar').addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return; var a = b.getAttribute('data-p');
      if (a === 'panel') VF.toggleProblems(); if (a === 'go') { var i = S.issues[Math.min(S.issueIdx, S.issues.length - 1)]; if (i) VF.goToIssue(i); }
      if (a === 'next') VF.walkIssue(1, { stay: true }); if (a === 'prev') VF.walkIssue(-1, { stay: true });
      if (a === 'outline') VF.openLeft('outline', { trigger: b }); if (a === 'test') VF.toggleTest({ trigger: b });
    });
  };
  VF.toggleProblems = function (open) {
    if (S.mode === 'phone') return VF.openProblemsSheet(); if (S.mode === 'review') { S.reviewTab = 'problems'; VF.renderLeft(); var t = $('#fd-rt-p'); if (t) t.focus(); return; }
    S.ppanel = open != null ? open : !S.ppanel; VF.renderPbar(); VF.emit('panels');
    if (S.ppanel) { var h = $('#fd-pp-t'); if (h) { h.tabIndex = -1; h.focus(); } } else { var c = $('.fd-pb-counts'); if (c) c.focus(); }
  };
  /* Alt+. / Alt+, (06 §9.6): move focus to the step with the next or previous issue and select it. */
  VF.walkIssue = function (dir, o) {
    var n = S.issues.length; if (!n) { V.announce('No issues'); return; }
    S.issueIdx = ((S.issueIdx + dir) % n + n) % n; var i = S.issues[S.issueIdx];
    VF.renderPbar();
    if (o && o.stay) { V.announce('Issue ' + (S.issueIdx + 1) + ' of ' + n + ': ' + i.msg); return; }
    if (i.stepId) { VF.select([i.stepId]); VF.focusStep(i.stepId, { minZoom: 0.75 }); }
    V.announce('Issue ' + (S.issueIdx + 1) + ' of ' + n + ': ' + i.msg);
  };

  /* ---------- ProblemsPanel: every issue grouped by step; Go to step lands on the field ---------- */
  VF.problemsListHtml = function (o) {
    o = o || {}; var iss = S.issues.filter(function (i) { return S.ppFilter === 'all' || (S.ppFilter === 'errors' ? i.level === 'error' : i.level === 'warning'); }), groups = [], by = {};
    iss.forEach(function (i) { var k = i.stepId || '_flow'; if (!by[k]) { by[k] = []; groups.push(k); } by[k].push(i); });
    if (!S.issues.length) return '<div class="empty empty--compact"><span class="status status--success">' + VF.icon('check', 'sm') + '<span>No issues. ' + S.m.steps.length + ' steps checked just now.</span></span></div>';
    var c = VF.counts(S.issues);
    return '<div class="fd-pp-filter"><div class="seg seg--sm" role="radiogroup" aria-label="Show" data-ppf><button type="button" role="radio" aria-checked="' + (S.ppFilter === 'all') + '" data-value="all">All</button><button type="button" role="radio" aria-checked="' + (S.ppFilter === 'errors') + '" data-value="errors">Errors ' + c.errors + '</button><button type="button" role="radio" aria-checked="' + (S.ppFilter === 'warnings') + '" data-value="warnings">Warnings ' + c.warnings + '</button></div></div>' +
      '<div class="fd-pp-groups">' + groups.map(function (k) { var s = VF.step(k), r = s && VF.reg(s); return '<section class="fd-pp-g"><h3 class="fd-pp-gh">' + (s ? esc(s.title) + ' <span class="fd-pp-gm">step ' + s.no + ' · ' + esc(r.phase ? VF.PHASES[r.phase].name + (r.name !== VF.PHASES[r.phase].name ? ' · ' + r.name : '') : 'Unsupported step') + '</span>' : 'This flow') + '</h3><ul class="fd-issues">' + by[k].map(function (i) { return '<li><button type="button" class="fd-issue" data-issue="' + i.id + '">' + VF.icon(i.level === 'error' ? 'circle-x' : 'triangle-alert', 'md', { className: i.level === 'error' ? 'u-fg-danger' : 'u-fg-warning' }) + '<span class="fd-issue-t">' + esc(i.short || i.msg) + '</span><span class="fd-issue-a">' + (o.phone ? 'Show step' : i.field ? 'Show field' : 'Go to step') + '</span></button></li>'; }).join('') + '</ul></section>'; }).join('') + '</div>';
  };
  VF.wireProblemsList = function (root, o) {
    root.addEventListener('vaani:change', function (e) { if (e.target.closest('[data-ppf]')) { S.ppFilter = e.detail.value; if (o && o.rerender) o.rerender(); else VF.renderPbar(); } });
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-issue]'); if (!b) return; var i = S.issues.filter(function (x) { return x.id === b.getAttribute('data-issue'); })[0]; if (!i) return; if (o && o.before) o.before(); VF.goToIssue(i); });
  };
  function renderPanel() {
    var host = $('#fd-center'), p = $('#fd-ppanel');
    if (!S.ppanel || !S.issues.length || S.compare) { if (p) p.remove(); if (S.ppanel && !S.issues.length) S.ppanel = false; return; }
    var focusIn = p && p.contains(d.activeElement), c = VF.counts(S.issues);
    if (!p) { p = d.createElement('section'); p.className = 'fd-ppanel'; p.id = 'fd-ppanel'; p.setAttribute('aria-labelledby', 'fd-pp-t'); host.appendChild(p); VF.wireProblemsList(p); wireResize(p); }
    p.style.height = S.ppH + 'px';
    p.innerHTML = '<div class="fd-pp-grip" role="separator" aria-orientation="horizontal" aria-label="Resize problems" aria-valuemin="160" aria-valuemax="600" aria-valuenow="' + S.ppH + '" tabindex="0"></div><div class="fd-pp-head"><h2 class="fd-pp-title" id="fd-pp-t">Problems · ' + esc(VF.issueWords(c)) + '</h2><button type="button" class="btn btn--tertiary btn--sm" data-pp="collapse">' + VF.icon('chevron-down', 'sm') + 'Collapse</button></div><div class="fd-pp-body">' + VF.problemsListHtml() + '</div>';
    V.initAll(p); $('[data-pp="collapse"]', p).onclick = function () { VF.toggleProblems(false); };
    if (focusIn) { var h = $('#fd-pp-t'); h.tabIndex = -1; h.focus(); }
  }
  function wireResize(p) {
    p.addEventListener('keydown', function (e) { if (!e.target.classList.contains('fd-pp-grip')) return; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); S.ppH = Math.max(160, Math.min(600, S.ppH + (e.key === 'ArrowUp' ? 16 : -16))); p.style.height = S.ppH + 'px'; e.target.setAttribute('aria-valuenow', S.ppH); } if (e.key === 'Escape') { e.preventDefault(); VF.toggleProblems(false); } });
    p.addEventListener('pointerdown', function (e) { var g = e.target.closest('.fd-pp-grip'); if (!g) return; e.preventDefault(); var y0 = e.clientY, h0 = S.ppH, max = $('#fd-center').offsetHeight * 0.4; g.setPointerCapture(e.pointerId); g.onpointermove = function (m) { S.ppH = Math.max(160, Math.min(Math.max(160, max), h0 + (y0 - m.clientY))); p.style.height = S.ppH + 'px'; }; g.onpointerup = function () { g.onpointermove = null; }; });
  }
  VF.openProblemsSheet = function () {
    var sh = $('#fd-probsheet'), c = VF.counts(S.issues);
    function fill() { sh.innerHTML = '<div class="sheet-head"><button type="button" class="ibtn sheet-back" data-drawer-close aria-label="Back">' + VF.icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="fd-probsheet-t">Problems</h2><p class="sheet-meta">' + esc(VF.issueWords(c)) + '</p></div><div class="sheet-actions"><button type="button" class="ibtn sheet-close" data-drawer-close aria-label="Close problems">' + VF.icon('x') + '</button></div></div><div class="sheet-body">' + VF.problemsListHtml({ phone: true }) + '</div>'; V.initAll(sh); }
    fill(); if (!sh._wired) { sh._wired = true; VF.wireProblemsList(sh, { rerender: fill, before: function () { V.drawer.close('fd-probsheet', 'navigate'); } }); }
    V.drawer.open('fd-probsheet', { mode: 'modal', returnTo: d.activeElement });
  };

  /* ---------- SelectionBar for 2+ selected steps ---------- */
  VF.renderSelBar = function () {
    var c = $('#fd-canvas'), old = $('.fd-selbar', c); if (old) old.remove();
    if (S.sel.length < 2 || S.mode === 'review' || S.mode === 'phone') return;
    var b = d.createElement('div'), n = S.sel.length, ro = !!VF.readOnlyReason();
    b.className = 'bulk fd-selbar'; b.setAttribute('role', 'toolbar'); b.setAttribute('aria-label', 'Selection');
    b.innerHTML = '<span class="bulk-count">' + n + ' steps selected</span>' + (ro ? '' : '<button type="button" class="btn btn--tertiary btn--sm" data-sb="frame" data-kbd="mod+G">' + VF.icon('layout-grid', 'sm') + 'Frame</button><button type="button" class="btn btn--tertiary btn--sm" data-sb="align" aria-haspopup="menu">Align' + VF.icon('chevron-down', 'sm') + '</button><button type="button" class="btn btn--tertiary btn--sm" data-sb="dup">' + VF.icon('copy', 'sm') + 'Duplicate</button><button type="button" class="ibtn ibtn--sm" data-sb="more" aria-label="More for the selection" aria-haspopup="menu">' + VF.icon('ellipsis', 'sm') + '</button>') + '<button type="button" class="btn btn--tertiary btn--sm" data-sb="clear">Clear</button>';
    c.appendChild(b);
    b.onclick = function (e) {
      var t = e.target.closest('[data-sb]'); if (!t) return; var a = t.getAttribute('data-sb'), ids = S.sel.slice();
      if (a === 'clear') { VF.select([]); V.announce('Selection cleared'); }
      if (a === 'dup') VF.duplicate(ids);
      if (a === 'frame' && VF.frameSelection) VF.frameSelection(ids);
      if (a === 'more') VF.menu('fd-sel-menu', 'Selection', [{ label: 'Copy', icon: 'copy', kbd: 'mod+C', fn: function () { VF.copy(ids); } }, { label: 'Cut', kbd: 'mod+X', fn: function () { VF.cut(ids); } }, { label: 'Tidy selection', icon: 'network', disabled: S.opts.locked ? 'Unlock the canvas to tidy.' : null, fn: function () { var o = {}; ids.forEach(function (id) { o[id] = 1; }); VF.tidyAll(o); } }, { sep: 1 }, { label: 'Delete ' + ids.length + ' steps', icon: 'trash-2', danger: 1, kbd: 'Delete', fn: function () { VF.deleteSteps(ids); } }], t, { placement: 'top-end' });
      if (a === 'align') VF.menu('fd-align-menu', 'Align', [['Left', 'x', 0], ['Centre', 'x', 0.5], ['Right', 'x', 1], ['Top', 'y', 0], ['Middle', 'y', 0.5], ['Bottom', 'y', 1]].map(function (al) { return { label: 'Align ' + al[0].toLowerCase(), fn: function () { align(ids, al[1], al[2]); } }; }).concat(n >= 3 ? [{ sep: 1 }, { label: 'Distribute horizontally', fn: function () { dist(ids, 'x'); } }, { label: 'Distribute vertically', fn: function () { dist(ids, 'y'); } }] : []), t, { placement: 'top-start' });
    };
  };
  function size(s) { var g = VF.geom(s.id) || { w: VF.width(s), h: 100 }; return g; }
  function align(ids, axis, k) {
    var st = ids.map(VF.step), ref = axis === 'x' ? (k === 0 ? Math.min.apply(null, st.map(function (s) { return s.x; })) : k === 1 ? Math.max.apply(null, st.map(function (s) { return s.x + size(s).w; })) : st[0].x + size(st[0]).w / 2) : (k === 0 ? Math.min.apply(null, st.map(function (s) { return s.y; })) : k === 1 ? Math.max.apply(null, st.map(function (s) { return s.y + size(s).h; })) : st[0].y + size(st[0]).h / 2);
    VF.act('align', function () { st.forEach(function (s) { var g = size(s); if (axis === 'x') s.x = Math.round(ref - g.w * k); else s.y = Math.round(ref - g.h * k); }); }, { keepTest: true });
    V.announce('Aligned ' + ids.length + ' steps');
  }
  function dist(ids, axis) {
    var st = ids.map(VF.step).sort(function (a, b) { return a[axis] - b[axis]; }), first = st[0][axis], last = st[st.length - 1][axis], gap = (last - first) / (st.length - 1);
    VF.act('distribute', function () { st.forEach(function (s, i) { s[axis] = Math.round(first + gap * i); }); }, { keepTest: true });
  }
})(window, document);
