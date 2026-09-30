/* Vaani Labs prototype · Flow Designer · boot and orchestration. Four modes switch live on matchMedia (FD1 D11, §17;
   05-responsive §10.6): full ≥ 1280 · compact 1024–1279 · review 768–1023 (Outline + read-only canvas; Test and Publish
   work) · phone < 768 or < 480 tall (the Outline is the page). Below 600 tall at ≥ 1024 the tablet shell shows (S.short). URL: ?flow= ?node= ?panel= ?tab= ?v= ?compare= ?test= ?new=1 ?state=. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var Q = new URLSearchParams(w.location.search);
  S.scen = Q.get('new') === '1' ? 'blank' : (Q.get('state') || 'default');
  if (S.scen === 'default-published') S.scen = 'default';

  /* The one resolver (05 §2.4 flowMode, with the shell’s height classes): phone below 768 wide or 480 tall, review below
     1024, compact below 1280. Below 600 tall at ≥ 1024 the shell shows the tablet TopBar (05 §2.2), so the designer drops
     its own crumb, title and wallet and folds the phase ruler into a Phases menu (FD1 §17): S.short. A phone-by-height
     window (landscape phone, 844 × 390) is S.landscape: one chip row with Publish, no sticky bar (05 §10.5). */
  VF.modeFor = function () { var W = w.innerWidth, H = w.innerHeight; return W < 768 || H < 480 ? 'phone' : W < 1024 ? 'review' : W < 1280 ? 'compact' : 'full'; };
  VF.applyMode = function (force) {
    var m = VF.modeFor(), prev = S.mode, W = w.innerWidth, H = w.innerHeight, short = W >= 1024 && H < 600, land = m === 'phone' && W >= 768;
    if (m === prev && short === !!S.short && land === !!S.landscape && !force) return;
    var fd = $('#fd'); S.short = short; S.landscape = land;
    fd.setAttribute('data-short', short ? 'true' : 'false'); fd.setAttribute('data-landscape', land ? 'true' : 'false');
    S.mode = m; fd.setAttribute('data-mode', m);
    /* A mode switch keeps the selected step and the open sheet, re-mounted in its new placement (05 §10.9). */
    var insp = S.insp ? { id: S.insp.id, tab: S.insp.tab } : null, ins = $('#fd-insp'), inspFocus = !!(ins && ins.contains(d.activeElement));
    if (prev && prev !== m) {
      if (V.drawer.isOpen('fd-insp')) { S.remounting = true; V.drawer.close('fd-insp', 'replace'); S.remounting = false; }
      if (V.drawer.isOpen('fd-test')) { V.drawer.close('fd-test', 'replace'); S.testOpen = true; }
    }
    if (insp && !S.insp && VF.stepAny && VF.stepAny(insp.id)) S.insp = insp;
    if ((m === 'review' || m === 'phone') && S.left) S.left = null;
    fd.setAttribute('data-phoneview', S.phoneView === 'canvas' ? 'canvas' : 'outline');
    if (!S.m || S.loading || S.loadError) { VF.renderHeader && S.m && VF.renderHeader(); return; }
    VF.renderAll();
    if (S.insp) { VF.placeInspector(); VF.emit('inspector'); if (inspFocus && (d.activeElement === d.body || !d.activeElement)) { var t = $('#fd-insp-t'); if (t) t.focus({ preventScroll: true }); } }
    if (S.testOpen) { S.testOpen = false; VF.toggleTest({ open: true }); }
    if (prev && prev !== m) setTimeout(function () { if (S.sel[0]) VF.reveal(S.sel[0]); else if (!VF.userMoved) fitOpen(); }, 60);
  };
  VF.renderAll = function () {
    if (!S.m) return;
    VF.renderHeader(); VF.renderNotices(); VF.renderLeft(); VF.renderCanvas(); VF.renderControls(); VF.renderPbar(); VF.renderSelBar();
    if (S.insp) VF.renderInspector();
  };

  /* ---------- change orchestration ---------- */
  var hdrT = null;
  VF.on('change', function (o) {
    o = o || {}; VF.renderCanvas(); VF.renderSelBar(); VF.renderNotices();
    clearTimeout(hdrT); hdrT = setTimeout(function () { VF.renderHeader(); VF.renderPbar(); }, o.field ? 120 : 0);
    if (!o.field) VF.refreshLeft(); else if (S.left === 'outline' || S.mode === 'review') { clearTimeout(VF._olT); VF._olT = setTimeout(VF.refreshLeft, 250); }
    if (S.insp && !o.field) VF.renderInspector();
  });
  VF.on('issues', function () { VF.renderCanvas(); VF.renderHeader(); VF.renderPbar(); if (S.left === 'outline' || S.mode === 'review' || S.mode === 'phone') VF.refreshLeft(); var c = $('#fd-tab-iss .vtab-count'); if (c && S.insp) c.textContent = S.issues.filter(function (i) { return i.stepId === S.insp.id; }).length; });
  VF.on('selection', function () {
    S.m.steps.forEach(function (s) { if (s._fresh && S.sel.indexOf(s.id) < 0) delete s._fresh; });
    VF.renderCanvas(); VF.renderSelBar();
    if (S.sel.length === 1 && !S.compare) VF.openInspector(S.sel[0]);
    else if (S.sel.length !== 1 && S.insp) VF.closeInspector({ returnFocus: false });
    var fz = $('#fd-zoom-menu'); void fz;
  });
  VF.on('added', function (e) { e.step._fresh = true; VF.renderCanvas(); VF.reveal(e.step.id); VF.openInspector(e.step.id, { focusLabel: e.keyboard }); });
  VF.on('deleted', function (e) { VF.closeInspector({ returnFocus: false }); if (e.from === 'outline') return; setTimeout(function () { if (e.focus && (S.mode === 'full' || S.mode === 'compact')) VF.focusStep(e.focus); }, 0); });
  VF.on('panels', function () { setTimeout(function () { VF.renderControls(); VF.renderMinimap(); VF.renderHeader(); VF.renderPbar(); }, 0); });
  VF.on('inspector', function () { var ins = $('#fd-insp'); $('#fd').classList.toggle('fd--insp', !!S.insp && !ins.hidden); setTimeout(function () { VF.renderMinimap(); VF.renderControls(); }, 0); });
  VF.on('options', function () { VF.renderHeader(); });
  VF.on('movemode', function () { $('#fd-canvas').classList.toggle('fd-moving', !!S.moveMode); });

  /* ---------- shortcuts: registered once, listed in the ? sheet (06 §9.6) ---------- */
  function registerShortcuts() {
    var R = V.shortcuts.register, G = { group: 'Flow Designer' }, inCanvas = function () { return $('#fd-canvas').contains(d.activeElement); };
    /* FD-R1-15 (FD1 §11.3, FD2 §16.5): the ? sheet opens on a Flow Designer tab grouped Navigate · Edit · Select · View · Test,
       plus a Legend tab. Each registration names its section. */
    var SEC = { 'Outline': 'View', 'Variables': 'View', 'Test panel': 'Test', 'Find steps': 'Navigate', 'Undo': 'Edit', 'Redo': 'Edit', 'Next issue': 'Navigate', 'Previous issue': 'Navigate',
      'Next change (compare)': 'Navigate', 'Previous change (compare)': 'Navigate', 'Follow connections': 'Navigate', 'Steps in the same layer, or sockets': 'Navigate', 'First Trigger · last step': 'Navigate',
      'Open the inspector': 'Navigate', 'Select only this step': 'Select', 'Toggle this step in the selection': 'Select', 'Select all': 'Select', 'Zoom in': 'View', 'Zoom out': 'View', 'Fit flow': 'View',
      'Fit selection': 'View', 'Zoom 100 %': 'View' };
    function o(x) { var r = { group: 'Flow Designer' }; for (var k in x) r[k] = x[k]; if (!r.section) r.section = SEC[r.description] || 'Edit'; return r; }
    V.shortcuts.addTab({ id: 'fd', label: 'Flow Designer', groups: ['Flow Designer'], sections: ['Navigate', 'Edit', 'Select', 'View', 'Test'], first: true });
    V.shortcuts.addTab({ id: 'legend', label: 'Legend', html: legendHtml });
    R('o', function () { VF.openLeft('outline', { trigger: $('#fd-tools [data-tool="outline"]') }); }, o({ description: 'Outline', when: function () { return S.mode === 'full' || S.mode === 'compact'; } }));
    R('v', function () { VF.openLeft('variables', { trigger: $('#fd-tools [data-tool="variables"]') }); }, o({ description: 'Variables', when: function () { return S.mode === 'full' || S.mode === 'compact'; } }));
    R('t', function () { VF.toggleTest({}); }, o({ description: 'Test panel' }));
    R('mod+f', function () { if (S.mode === 'full' || S.mode === 'compact') VF.openFind(); else { var q = $('#fd-ol-q'); if (q) q.focus(); } }, o({ description: 'Find steps' }));
    R('mod+z', function () { VF.undo(); }, o({ description: 'Undo', when: function () { return !VF.readOnlyReason(); } }));
    R('mod+shift+z', function () { VF.redo(); }, o({ description: 'Redo · also ' + (V.util.isMac ? '⌘Y' : 'Ctrl+Y'), section: 'Edit', when: function () { return !VF.readOnlyReason(); } }));
    R('mod+y', function () { VF.redo(); }, o({ description: '', section: 'Edit', when: function () { return !VF.readOnlyReason(); } }));   /* one Redo row in the sheet */
    R('alt+.', function () { VF.walkIssue(1); }, o({ description: 'Next issue', label: ['alt', '.'] }));
    R('alt+,', function () { VF.walkIssue(-1); }, o({ description: 'Previous issue', label: ['alt', ','] }));
    R(']', function () { VF.compareStep(1); }, o({ description: 'Next change (compare)', when: function () { return !!S.compare; } }));
    R('[', function () { VF.compareStep(-1); }, o({ description: 'Previous change (compare)', when: function () { return !!S.compare; } }));
    R('escape', function () { if (S.compare) VF.exitCompare(); else if (S.moveMode) return false; else if (VF.findOpen()) VF.closeFind(); else return false; }, o({ description: '', when: function () { return !!S.compare || VF.findOpen(); } }));
    [['Follow connections', ['→', '←']], ['Steps in the same layer, or sockets', ['↑', '↓']], ['First Trigger · last step', ['Home', 'End']], ['Open the inspector', 'Enter'], ['Select only this step', 'space'], ['Toggle this step in the selection', ['shift', 'space']], ['Connect to…', 'C'], ['Add a step after', 'A'], ['Move mode', 'M'], ['Delete with Undo', 'Delete'], ['Delete and reconnect', ['alt', 'Delete']], ['Move steps 16 px (Shift: 64)', ['alt', '↑']], ['Duplicate', ['mod', 'D']], ['Cut', ['mod', 'X']], ['Frame the selection', ['mod', 'G']], ['Ungroup the frame', ['mod', 'shift', 'G']], ['Select all', ['mod', 'A']], ['Zoom in', ['+']], ['Zoom out', ['−']], ['Fit flow', ['shift', '1']], ['Fit selection', ['shift', '2']], ['Zoom 100 %', ['shift', '0']], ['Step menu', ['shift', 'F10']]].forEach(function (x) {
      R('display:' + x[0], null, o({ description: x[0], label: Array.isArray(x[1]) ? x[1] : [x[1]], displayOnly: true, singleKey: /^[CAM+−]$/.test(x[1]) || x[1][0] === '+' || x[1][0] === '−' }));
    });
    void G; void inCanvas;
  }
  /* The Legend tab: the four phase silhouettes, Path and Fallback lines, issue badges, Now and Reached (FD2 §16.5) */
  function legendHtml() {
    var ph = VF.PHASE_ORDER.map(function (p) { var x = VF.PHASES[p]; return '<li class="kbd-row"><span class="fd-lg-item"><span class="gt ' + x.tile + '" aria-hidden="true">' + VF.icon(x.icon, 'sm') + '</span><b>' + x.name + '</b></span><span class="u-fg-3">' + x.desc + '</span></li>'; }).join('');
    var line = function (dash) { return '<svg class="fd-lg-line" viewBox="0 0 32 8" aria-hidden="true"><line x1="0" y1="4" x2="32" y2="4"' + (dash ? ' stroke-dasharray="4 3"' : '') + '/></svg>'; };
    return '<section class="kbd-group"><h3>Steps</h3><ul class="kbd-list">' + ph + '</ul></section>' +
      '<section class="kbd-group"><h3>Connections</h3><ul class="kbd-list"><li class="kbd-row"><span class="fd-lg-item">' + line(false) + '<b>Path</b></span><span class="u-fg-3">An answer or result leads here</span></li><li class="kbd-row"><span class="fd-lg-item">' + line(true) + '<b>Fallback</b></span><span class="u-fg-3">No reply, Else or a failed result</span></li></ul></section>' +
      '<section class="kbd-group"><h3>Badges</h3><ul class="kbd-list"><li class="kbd-row"><span class="tag tag--warning">' + VF.icon('triangle-alert', 'xs') + '1 warning</span><span class="u-fg-3">Publishes, with a check in the gate</span></li><li class="kbd-row"><span class="tag tag--danger">' + VF.icon('circle-x', 'xs') + '1 error</span><span class="u-fg-3">Blocks Publish until fixed</span></li>' +
      '<li class="kbd-row"><span class="tag tag--info">Now</span><span class="u-fg-3">Where a test is right now</span></li><li class="kbd-row"><span class="tag">Reached</span><span class="u-fg-3">A step the test has passed through</span></li></ul></section>';
  }

  /* ---------- initial viewport (FD1 §9.2): restore, else fit clamped to the Full band, anchored on the first Trigger ---------- */
  VF.fitOpen = function () { fitOpen(); };
  function fitOpen() {
    if (S.mode === 'review') VF.fit(null, { instant: true, min: 0.5, max: 0.75 });
    else if (S.mode === 'phone') VF.fit(null, { instant: true, min: 0.25, max: 0.6, anchorFirst: true });   /* FD-R2-06: phones anchor the opening fit on the first Trigger too */
    else if (S.m.blank) { S.view.zoom = 1; var r = $('#fd-canvas').getBoundingClientRect(); S.view.tx = Math.max(48, (r.width - 864) / 2); S.view.ty = 96; VF.applyView(true); }
    else VF.fit(null, { instant: true, min: 0.75, max: 1, anchorFirst: true });
  }

  /* ---------- loading, errors, first use ---------- */
  function skeleton() {
    var c = $('#fd-canvas'), sk = d.createElement('div'); sk.className = 'fd-skel'; sk.setAttribute('aria-hidden', 'true');
    sk.innerHTML = [[48, 120, 'fd-sk--cap'], [320, 60, 'fd-sk--logic'], [640, 40, ''], [940, 120, 'fd-sk--end']].map(function (x) { return '<div class="fd-sk ' + x[2] + '" style="left:' + x[0] + 'px;top:' + x[1] + 'px"><span class="sk sk--block fd-sk-tile"></span><span class="fd-sk-lines"><span class="sk sk--meta"></span><span class="sk sk--title"></span></span></div>'; }).join('');
    c.appendChild(sk);
  }
  function pageState(kind) {
    var fd = $('#fd'), titles = { error: ['Couldn’t load this flow.', 'Check your connection and try again.', 'circle-alert'], notfound: ['This flow doesn’t exist or was deleted.', 'The link may be old, or someone deleted the flow.', 'search-x'], 'private': ['This flow is private to Rohit S.', 'Only its owner can open it. Ask Rohit S. to share it with the workspace.', 'lock'] }[kind];
    if (kind === 'error') { S.loadError = true; VF.renderHeader(); $('#fd-canvas').innerHTML = '<h2 class="sr-only" id="fd-canvas-h">Canvas</h2><div class="empty empty--page empty--danger fd-state" role="alert">' + VF.icon(titles[2], 'xl') + '<h3 class="empty-title">' + titles[0] + '</h3><p>' + titles[1] + '</p><div class="empty-actions"><button type="button" class="btn btn--primary" data-s="retry">' + VF.icon('refresh-cw') + 'Retry</button><a class="btn btn--tertiary" href="flow-designer.html">Back to Flows</a></div></div>'; $('[data-s="retry"]').onclick = function () { w.location.href = 'flow-designer.html'; }; return; }
    fd.innerHTML = '<div class="fd-head"><div class="fd-head-l"><h1 class="fd-title fd-title--plain" id="page-title">Flows</h1></div></div><section class="fd-state-page" aria-labelledby="fd-st-t"><div class="empty empty--page">' + VF.icon(titles[2], 'xl') + '<h2 class="empty-title" id="fd-st-t">' + titles[0] + '</h2><p>' + titles[1] + '</p><div class="empty-actions"><a class="btn btn--primary" href="flow-designer.html">Go to Flows</a></div></div></section>';
    d.body.setAttribute('data-topbar-title', 'Flows'); V.shell.render(); d.title = (kind === 'notfound' ? 'Not found' : 'Private flow') + ' · Flows · Vaani Labs';
  }
  VF.renderEmptyCard = function () {
    var top = $('#fd-canvas-top'), old = $('.fd-empty', top), plus = $('.fd-edge-plus', top); if (old) old.remove(); if (plus) plus.remove();
    if (!S.m || !S.m.blank || S.m.steps.length > 2 || S.viewing || (S.mode !== 'full' && S.mode !== 'compact')) return;
    var t = S.m.steps.filter(function (s) { return VF.phaseOf(s) === 'trigger'; })[0], e = S.m.steps.filter(function (s) { return VF.phaseOf(s) === 'outcome'; })[0]; if (!t || !e || t.outs[0].to !== e.id) return;
    var g = VF.geom(t.id) || { w: 208 }, mx = (t.x + g.w + e.x) / 2, my = t.y + 42;
    top.insertAdjacentHTML('beforeend', '<button type="button" class="fd-edge-plus" data-flow-x="' + mx + '" data-flow-y="' + my + '" aria-label="Insert a step between ' + esc(t.title) + ' and ' + esc(e.title) + '">' + VF.icon('plus', 'sm') + '</button>' +
      '<section class="fd-empty" data-flow-x="' + mx + '" data-flow-y="' + (my + 40) + '" aria-labelledby="fd-empty-t"><div class="empty empty--compact"><h3 class="empty-title" id="fd-empty-t">What happens when the call connects?</h3><p>Add the first step. Most flows greet the caller, then ask one question.</p><div class="empty-actions"><button type="button" class="btn btn--sm" data-e="speak">' + VF.icon('message-square', 'sm') + 'Add Speak</button><button type="button" class="btn btn--sm" data-e="question">' + VF.icon('diamond', 'sm') + 'Add Question</button><button type="button" class="btn btn--link" data-e="all">All steps</button></div></div></section>');
    VF.positionOverlays();
    top.querySelector('.fd-edge-plus').onclick = function (ev) { VF.openInsert({ stepId: t.id, outId: 'out' }, ev.currentTarget); };
    top.querySelector('.fd-empty').onclick = function (ev) { var b = ev.target.closest('[data-e]'); if (!b) return; var k = b.getAttribute('data-e'); if (k === 'all') VF.openLeft('add', { trigger: b }); else VF.addStep(k === 'speak' ? 'action.speak' : 'logic.question', { between: { from: t.id, outId: 'out' }, keyboard: true }); };
  };

  /* ---------- Prototype states (prototype only) ---------- */
  var STATES = [
    ['Designer', [['default', 'Default: Live v7 with a v8 draft (3 changes, 1 warning)'], ['loading', 'Loading: canvas skeleton'], ['error', 'Load failed'], ['notfound', 'Flow not found'], ['private', 'Private flow (not yours)'], ['blank', 'First use: a blank flow'], ['unpublished', 'Never published (Publish v1…)'], ['clean', 'Clean draft: nothing to publish'], ['large', 'Large flow: 26 steps, Outline docked'], ['viewonly', 'View-only role'], ['locked', 'Locked canvas']]],
    ['Validation', [['errors', '2 errors and 1 warning'], ['unsupported', 'Unsupported step type'], ['overlap', 'Overlapping steps (notice)'], ['topdown', 'Old top-down layout (notice)']]],
    ['Saving and lifecycle', [['save-failed', 'Couldn’t save · Retry'], ['offline', 'Offline with edits on this device'], ['conflict', 'Changed elsewhere (conflict sheet)'], ['interim', 'Interim I1: device draft'], ['volatile', 'Interim I1: browser storage blocked'], ['interim-stale', 'Interim I1: published from another browser (open Publish)'], ['version', 'Viewing an old version (v5)'], ['compare', 'Compare with live']]],
    ['Publish gate (open Publish…)', [['gate-network', 'Network failure while publishing'], ['gate-422', 'The server finds 1 more error'], ['gate-409', 'Someone published while the gate was open']]],
    ['Test panel', [['test', 'A text test in progress (marks on the canvas)'], ['test-error', 'Test service error'], ['mic-blocked', 'Browser voice: microphone blocked']]]
  ];
  VF.openProto = function (trigger) {
    var b = $('#fd-proto-body');
    b.innerHTML = STATES.map(function (g) { return '<section class="l-stack l-stack--sm"><h3 class="type-label-12 u-fg-3">' + esc(g[0]) + '</h3><ul class="fd-proto-list">' + g[1].map(function (s) { return '<li><a class="fd-proto-link" href="flow-designer.html?state=' + s[0] + '"' + (S.scen === s[0] ? ' aria-current="page"' : '') + '>' + esc(s[1]) + (S.scen === s[0] ? ' <span class="tag tag--info">Showing</span>' : '') + '</a></li>'; }).join('') + '</ul></section>'; }).join('') + '<p class="form-note">Wallet states use the shared parameter: <a href="flow-designer.html?wallet=empty">wallet ₹0</a> · <a href="flow-designer.html?wallet=low">wallet low</a>.</p>';
    V.dialog.open('fd-proto', { returnTo: trigger });
  };

  /* ---------- boot ---------- */
  function hydrate() {
    var flowId = Q.get('flow'); S.m = VF.loadFlow(flowId, S.scen); S.loading = false;
    $('#fd').removeAttribute('aria-busy'); $('#fd-load-status').textContent = 'Loaded ' + S.m.meta.name + '.'; var sk = $('.fd-skel'); if (sk) sk.remove();
    V.setTitle(S.m.meta.name); d.body.setAttribute('data-topbar-title', S.m.meta.name);
    /* Phone TopBar: "‹ Flows" Back (FD1 §3.2, 05 §10.5). Flows lives at flow-designer.html in this prototype (the shell’s
       nav href); the click goes through the router guard so unsaved edits are asked about first (FD2 §4.7). */
    d.body.setAttribute('data-back-href', 'flow-designer.html'); d.body.setAttribute('data-back-label', 'Flows');
    V.shell.render();
    S.save = { state: S.scen === 'interim' || S.scen === 'interim-stale' ? 'device' : S.scen === 'volatile' ? 'volatile' : S.scen === 'save-failed' ? 'error' : S.scen === 'offline' ? 'offline' : S.scen === 'blank' || !S.m.meta.live ? 'saved' : 'saved', at: /^Today/.test(V.fmt.when(S.m.draftEditedAt || VF.nowIso())) ? V.fmt.time(S.m.draftEditedAt || VF.nowIso()) : V.fmt.dateShort(S.m.draftEditedAt), edits: S.scen === 'save-failed' ? 2 : S.scen === 'offline' ? 3 : 0 };
    if (S.scen === 'save-failed') d.title = "Couldn’t save · " + S.m.meta.name + ' · Flows · Vaani Labs';
    w.addEventListener('beforeunload', function (e) { if (['error', 'offline', 'conflict', 'volatile', 'saving'].indexOf(S.save.state) >= 0) { e.preventDefault(); e.returnValue = ''; } });
    if (S.scen === 'locked') S.opts.locked = true;
    if (S.m.live && S.m.meta.live && S.m.meta.live.version === 7 && S.scen !== 'clean') S.lastTest = { hash: VF.hash(S.m.steps), at: V.data.flows[0].live.tested.at, kind: 'Text test', reached: 'Visit booked' };
    S.overlapN = VF.overlaps(S.m.steps);
    VF.revalidate(true); S.checking = true;
    VF.renderAll();
    setTimeout(function () { S.checking = false; VF.renderHeader(); VF.renderPbar(); }, 450);
    if (S.m.blank && w.innerWidth >= 1440) VF.openLeft('add', { focus: false });
    var large = S.m.steps.length > 20 && S.mode === 'full' && VF.store.get('outline-large') !== 'off';
    if (large) VF.openLeft('outline', { large: true, focus: false });
    var node = Q.get('node'); if (node && VF.step(node)) { VF.select([node]); VF.openInspector(node, { tab: Q.get('tab') === 'issues' ? 'iss' : Q.get('tab') === 'test-data' ? 'data' : 'conf' }); }
    /* ?test=browser (Home’s 'Talk in browser instead', Call reports' 'Place a test call…') opens the Test panel */
    if (Q.get('test') && !S.m.blank) setTimeout(function () { VF.toggleTest({ open: true }); }, 0);
    var panel = Q.get('panel'); if (panel === 'outline' || panel === 'variables' || panel === 'history') VF.openLeft(panel, { focus: false }); if (panel === 'problems') VF.toggleProblems(true); if (panel === 'test' || Q.get('test') || S.scen === 'test' || S.scen === 'test-error' || S.scen === 'mic-blocked') { VF.toggleTest({ open: true }); }
    VF.renderCanvas(); fitOpen(); if (!node && !S.m.blank && S.scen === 'default') VF.restoreViewport();
    if (node && VF.step(node)) setTimeout(function () { VF.reveal(node, { minZoom: 0.75 }); }, 40);
    VF.canvasBox = $('#fd-canvas').getBoundingClientRect();
    if (S.scen === 'test') setTimeout(function () { var b = $('#fd-test [data-t="start"]'); if (b) b.click(); setTimeout(function () { var r = $('#fd-test [data-reply="yes"]'); if (r) r.click(); }, 1400); }, 200);
    if (S.scen === 'mic-blocked') setTimeout(function () { var r = $('#fd-test [data-tk="mode"] [data-value="voice"]'); if (r) r.click(); }, 60);
    /* ?version= (Call reports, Analytics) is an alias of ?v=; the live version opens the flow itself, and ?node= wins over it */
    var qv = !node && Q.get('version'); if (qv && +qv === ((S.m.meta || {}).live || {}).version) qv = null;
    var v = Q.get('v') || qv || (S.scen === 'version' ? '5' : null); if (v) VF.viewVersion(+v);
    if (Q.get('compare') || S.scen === 'compare') setTimeout(function () { VF.enterCompare('live'); }, 0);
    if (S.scen === 'conflict') { S.save.state = 'conflict'; S.save.edits = 2; VF.renderHeader(); setTimeout(function () { VF.emit('conflict'); }, 500); }
    if (S.scen === 'offline') $('#fd').insertAdjacentHTML('afterbegin', '<div class="cbar" role="status">' + VF.icon('cloud-off') + '<span><b>You’re offline.</b> Showing data from 11:24 am. Edits stay on this device.</span></div>');
  }
  function boot() {
    VF.canvasInit(); VF.inputInit(); VF.pickInit(); VF.inspectorInit(); VF.paletteInit(); VF.pbarInit(); VF.headerInit(); VF.publishInit(); VF.testInit();
    S.mode = null; VF.applyMode(true); registerShortcuts();
    if (S.scen === 'notfound' || S.scen === 'private') { S.loading = false; return pageState(S.scen); }
    S.loading = true; S.m = { meta: { name: (VF.flowList().filter(function (f) { return f.id === Q.get('flow'); })[0] || VF.flowList()[0]).name, live: null, id: 'x', shortId: 'x' }, steps: [], live: null, versions: [] };
    VF.renderHeader(); var skT = setTimeout(skeleton, 200);
    if (S.scen === 'loading') return;
    if (S.scen === 'error') { setTimeout(function () { clearTimeout(skT); var sk = $('.fd-skel'); if (sk) sk.remove(); S.loading = false; $('#fd').removeAttribute('aria-busy'); pageState('error'); }, 300); return; }
    setTimeout(function () { clearTimeout(skT); hydrate(); }, 120);
    d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.topbar .topbar-back'); if (!b || !S.m || S.loading) return; e.preventDefault(); VF.leave(b.getAttribute('href') || 'flow-designer.html'); });
    ['(min-width: 768px)', '(min-width: 1024px)', '(min-width: 1280px)', '(min-width: 1440px)', '(min-height: 480px)', '(min-height: 600px)'].forEach(function (q) { w.matchMedia(q).addEventListener('change', function () { VF.applyMode(); if (S.left) { S.leftDocked = S.mode === 'full' && (w.innerWidth >= 1440 || S.left === 'outline' && S.m.steps.length > 20); VF.renderLeft(); } }); });
    var ro = null, rt = null;
    if (w.ResizeObserver) { ro = new ResizeObserver(function () {
      var r = $('#fd-canvas').getBoundingClientRect(), pr = VF.canvasBox; VF.canvasBox = r; if (!pr || S.loading || !S.m.steps.length) return;
      if (pr.width < 10 && r.width > 10) { fitOpen(); return; } var dl = r.left - pr.left, dt = r.top - pr.top; if (dl || dt) { S.view.tx -= dl; S.view.ty -= dt; VF.applyView(); }
      clearTimeout(rt); rt = setTimeout(function () { if (S.sel[0] && VF.step(S.sel[0])) VF.reveal(S.sel[0]); VF.renderMinimap(); VF.renderControls(); }, 150); }); ro.observe($('#fd-canvas')); }
  }
  V.ready(boot);
})(window, document);
