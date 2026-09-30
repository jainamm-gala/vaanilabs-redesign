/* Vaani Labs prototype · Flow Designer · FlowHeader (FD1 §3.3, FD2 §4.3): VersionChip, SaveState, Live chip, Undo/Redo,
   Tidy, wallet chip, IssuesChip, Test, Publish v8… (the one Neel fill), ⋯. PhaseRuler + LiveNote (FD1 §4.4), ToolRail,
   the phone chip row and sticky action bar. The action group never shrinks; the name truncates first (F-RWD-003). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var cache = null;
  /* Loading, or the load failed: nothing in the header works on the placeholder model (FD1 §14). */
  function ld() { return !!(S.loading || S.loadError); }
  VF.unloaded = ld;
  VF.draftDiff = function () { if (!S.m.live) return { rows: [], count: 0, added: 0, changed: 0, removed: 0 }; var h = VF.hash(S.m.steps) + ':' + VF.hash(S.m.live); if (!cache || cache.h !== h) cache = { h: h, d: VF.diff(S.m.steps, S.m.live) }; return cache.d; };
  VF.nextV = function () { return S.m.meta.live ? S.m.meta.live.version + 1 : 1; };
  function word(dom, v, o) { var def = V.statusDef(dom, v); return def ? def[0].replace('{v}', o && o.v != null ? o.v : '').replace('{n}', o && o.n != null ? o.n : '') : v; }
  /* Why Publish is disabled (FD2 §4.3); null when it can open the gate. */
  VF.publishReason = function () {
    var c = VF.counts(S.issues), live = S.m.meta.live;
    if (S.save.state === 'error') return "Your last " + Math.max(1, S.save.edits) + " edits haven’t saved. Retry, then publish.";
    if (S.save.state === 'offline') return "You’re offline.";
    if (S.save.state === 'conflict') return 'Review the other changes first.';
    if (live && !VF.draftDiff().count && S.scen !== 'interim' && S.scen !== 'volatile') return 'Nothing to publish. Your draft matches Live v' + live.version + '.';
    if (c.errors) return 'Fix ' + c.errors + ' error' + (c.errors === 1 ? '' : 's') + ' to publish.';
    return null;
  };
  VF.publishLabel = function () { return S.scen === 'interim' || S.scen === 'volatile' ? 'Publish…' : S.m.meta.live && !VF.draftDiff().count ? 'Publish…' : 'Publish v' + VF.nextV() + '…'; };
  function issuesChip(compact) {
    var c = VF.counts(S.issues), tone = S.checking ? '' : c.errors ? ' tag--danger' : c.warnings ? ' tag--warning' : ' tag--success', ic = S.checking ? 'loader-circle' : c.errors ? 'circle-x' : c.warnings ? 'triangle-alert' : 'check', wds = S.checking ? 'Checking…' : VF.issueWords(c);
    return '<button type="button" class="tag tag--lg' + tone + ' fd-issues-chip" data-h="issues" aria-label="' + esc(wds) + '. Open problems">' + VF.icon(ic, 'xs', S.checking ? { className: 'spinner' } : null) + '<span' + (compact ? ' class="sr-only"' : '') + '>' + esc(wds) + '</span>' + (compact && !S.checking ? '<span aria-hidden="true">' + (c.errors + c.warnings || '') + '</span>' : '') + '</button>';
  }
  function versionChip(compact) {
    if (ld()) return '';
    if (S.viewing) return '<span class="tag tag--lg tag--info">Viewing v' + S.viewing.v + ' · read-only</span><button type="button" class="btn btn--link fd-back-draft" data-h="backdraft">Back to draft</button>';
    if (S.scen === 'viewonly') return '<span class="tag tag--lg tag--outline">View only</span>';
    if (S.publishing) return '<span class="tag tag--lg tag--info">' + VF.icon('loader-circle', 'xs', { className: 'spinner' }) + word('flow', 'publishing').replace('…', ' v' + VF.nextV() + '…') + '</span>';
    var n = VF.draftDiff().count, interim = S.scen === 'interim' || S.scen === 'volatile';
    if (!S.m.meta.live && !interim) return '<span class="tag tag--lg">Not live yet</span>';
    if (!n && !interim) return '';
    var txt = interim ? (compact ? 'On this device · ' + n : 'Draft on this device · ' + n + ' change' + (n === 1 ? '' : 's')) : compact ? word('flow', 'draft', { n: n }).replace(/ changes?$/, '') : word('flow', 'draft', { n: n }).replace('1 changes', '1 change');
    return '<button type="button" class="tag tag--lg fd-vchip" data-h="version" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc((interim ? 'Draft on this device, ' : 'Draft, ') + n + ' change' + (n === 1 ? '' : 's') + '. Version menu') + '">' + esc(txt) + VF.icon('chevron-down', 'xs') + '</button>';
  }
  function liveChip() {
    if (ld()) return ''; if (S.scen === 'interim' || S.scen === 'volatile') return '<span class="tag tag--lg">Saved flow</span>';
    if (!S.m.meta.live) return '';
    var tag = V.ui.statusTag('flow', 'live', { v: S.m.meta.live.version, size: 'lg' });
    /* Below 600 px tall the live note folds into the Live chip’s tooltip (FD1 §17); its words stay in the name. */
    if (S.short && (S.mode === 'full' || S.mode === 'compact')) { var t = liveNoteText(); tag = '<span class="fd-livechip" tabindex="0" data-tooltip="' + esc(t) + '">' + tag + '<span class="sr-only">. ' + esc(t) + '</span></span>'; }
    return tag;
  }
  function publishBtns(sticky) {
    if (ld()) return '';
    if (S.viewing) return '<button type="button" class="btn btn--sm" data-h="restore">Restore as draft…</button><button type="button" class="btn btn--primary btn--sm" data-h="rollback-view">Roll back to v' + S.viewing.v + '…</button>';
    if (S.scen === 'viewonly') return '<button type="button" class="btn btn--sm" data-h="duplicate">Duplicate to edit</button>';
    var why = VF.publishReason(), busy = S.publishing;
    return '<button type="button" class="btn btn--primary' + (sticky ? '' : ' btn--sm') + ' fd-publish" data-h="publish"' + (busy ? ' aria-busy="true"' : '') + (why ? ' aria-disabled="true" data-tooltip="' + esc(why) + '" aria-describedby="fd-pub-why' + (sticky ? '2' : '') + '"' : '') + '>' + esc(VF.publishLabel()) + '</button>' + (why ? '<span class="sr-only" id="fd-pub-why' + (sticky ? '2' : '') + '">' + esc(why) + '</span>' : '');
  }
  function walletChip(force) {
    var st = V.walletState(), W = (V.data.wallet.states || {})[st] || { balance: V.data.wallet.balance }, warn = st !== 'healthy';
    if (!force && !warn) return '';
    return '<a class="chip' + (warn ? ' chip--warn' : '') + ' fd-wallet" href="billing.html?topup=1" data-vaani-action="topup" aria-label="Wallet ' + esc(V.fmt.money(W.balance)) + (warn ? ', ' + st.replace('-', ' ') : '') + '. Top up">' + VF.icon(warn ? 'triangle-alert' : 'wallet', 'sm') + esc(V.fmt.money(W.balance)) + '</a>';
  }

  function focusKey() { var a = d.activeElement; if (!a || !a.closest) return null; var host = a.closest('#fd-head, #fd-phone, #fd-sticky, #fd-ruler, #fd-tools'); if (!host) return null; var k = a.getAttribute('data-h') || a.getAttribute('data-tool') || a.getAttribute('data-phase') || (a.getAttribute('data-value') && 'seg:' + a.getAttribute('data-value')); return k ? { host: host.id, k: k } : null; }
  function refocus(f) { if (!f) return; var host = $('#' + f.host), n = host && $$('[data-h], [data-tool], [data-phase], [data-value]', host).filter(function (x) { return (x.getAttribute('data-h') || x.getAttribute('data-tool') || x.getAttribute('data-phase') || 'seg:' + x.getAttribute('data-value')) === f.k; })[0]; if (n && d.activeElement !== n) n.focus({ preventScroll: true }); }
  VF.renderHeader = function () { var fk = focusKey(); renderHeader(); refocus(fk); };
  function renderHeader() {
    if (!S.m) return; var m = S.mode, wide = m === 'full', compact = m === 'compact', hist = S.hist;
    $('#fd-switch-v').innerHTML = '<span class="fd-title-t" translate="no">' + esc(S.m.meta.name) + '</span>'; d.body.setAttribute('data-topbar-title', S.m.meta.name);
    $('#fd-switch').tabIndex = m === 'full' || m === 'compact' ? 0 : -1;
    var state = '';
    if (m === 'full' || m === 'compact') {
      state = versionChip(compact) + (ld() || S.viewing || S.scen === 'viewonly' ? '' : '<span id="fd-save" class="save"></span>') + liveChip() + (S.short && !ld() ? phasesBtn() : '');
      if (!ld() && !S.viewing && S.scen !== 'viewonly') state += '<span class="fd-sep" aria-hidden="true"></span><div class="fd-hist" role="group" aria-label="History"><button type="button" class="ibtn ibtn--sm" data-h="undo" aria-label="Undo" data-kbd="mod+Z"' + (hist.undo.length ? ' data-tooltip="Undo ' + esc(hist.undo[hist.undo.length - 1].label) + '"' : ' aria-disabled="true" data-tooltip="Nothing to undo"') + '>' + VF.icon('undo-2', 'sm') + '</button><button type="button" class="ibtn ibtn--sm" data-h="redo" aria-label="Redo" data-kbd="mod+shift+Z"' + (hist.redo.length ? '' : ' aria-disabled="true" data-tooltip="Nothing to redo"') + '>' + VF.icon('redo-2', 'sm') + '</button></div>' +
        (wide ? '<button type="button" class="btn btn--tertiary btn--sm" data-h="tidy"' + (S.opts.locked ? ' aria-disabled="true" data-tooltip="Unlock the canvas to tidy."' : '') + '>' + VF.icon('network', 'sm') + 'Tidy</button>' : '');
    } else if (m === 'review') state = versionChip(false) + liveChip();
    $('#fd-head-state').innerHTML = state;
    var right = '';
    if (m === 'full' || m === 'compact' || m === 'review') right = (S.short ? '' : m === 'full' ? walletChip(true) : m === 'compact' ? walletChip(false) : '') + (ld() || S.viewing ? '' : issuesChip(compact)) + (ld() ? '' : '<button type="button" class="btn btn--sm" data-h="test"' + (S.viewing ? ' data-tooltip="Test this version"' : '') + '>' + VF.icon('play', 'sm') + 'Test</button>') + publishBtns(false) + '<button type="button" class="ibtn ibtn--sm" data-h="more" aria-label="More flow actions" aria-haspopup="menu">' + VF.icon('ellipsis', 'sm') + '</button>';
    $('#fd-head-r').innerHTML = right;
    paintSave(true);
    renderRuler(); renderTools(); renderPhone(); VF.renderSwitcher();
  };
  /* SaveState (FD1 §3.3, 05 §10.7): "Saved 11:24 am" at ≥ 1280; in Compact the short "Saved" with the time in its tooltip
     and its accessible name. Error, offline, conflict and volatile labels never shorten. */
  function paintSave(silent) {
    var sv = $('#fd-save'); if (!sv) return;
    var st = S.save.state, at = S.save.at || VF.clock(), shortL = S.mode === 'compact' && (st === 'saved' || st === 'device');
    var tip = st === 'volatile' ? "This browser won’t keep your edits. Publish them, or they are lost when this tab closes." : st === 'saved' ? 'Saved ' + at + '. All changes are saved to the draft. Callers hear the live version until you publish.' : st === 'device' ? 'Saved on this device ' + at + '. Edits stay on this device until you publish.' : null;
    V.saveState.set(sv, st, { at: at, edits: S.save.edits, silent: silent, tooltip: tip });
    var sb = sv.querySelector('[role="button"]') || sv; if (st === 'conflict') sb.setAttribute('aria-haspopup', 'dialog'); else sb.removeAttribute('aria-haspopup');   /* FD-R2-03 */
    if (shortL) { var sp = sv.querySelector('span'); if (sp) sp.outerHTML = '<span>' + (st === 'device' ? 'Saved on this device' : 'Saved') + '</span><span class="sr-only"> ' + esc(at) + '</span>'; }
  }
  VF.on('save', function () { paintSave(false); if (S.save.state === 'error' || S.save.state === 'saved' || S.save.state === 'device' || S.save.state === 'offline' || S.save.state === 'conflict') VF.renderHeader(); });
  /* Short windows (< 600 px tall at ≥ 1024): the ruler folds into this menu (FD1 §17). */
  function phasesBtn() { return '<button type="button" class="btn btn--tertiary btn--sm fd-phases" data-h="phases" aria-haspopup="menu"' + (S.emph ? ' aria-describedby="fd-phases-d"' : '') + '>' + VF.icon('columns-3', 'sm') + 'Phases' + VF.icon('chevron-down', 'sm') + '</button>' + (S.emph ? '<span class="sr-only" id="fd-phases-d">Showing ' + VF.PHASES[S.emph].name + ' steps</span>' : ''); }
  function liveNoteText() { var t = d.createElement('div'); t.innerHTML = liveNote(false); $$('button', t).forEach(function (b) { b.remove(); }); return t.textContent.replace(/\s+/g, ' ').trim(); }
  VF.openPhasesMenu = function (b) {
    var counts = { trigger: 0, logic: 0, action: 0, outcome: 0 }; VF.visibleSteps().forEach(function (x) { var p = VF.phaseOf(x); if (p) counts[p]++; });
    VF.menu('fd-phases-menu', 'Phases', VF.PHASE_ORDER.map(function (p) { return { label: 'Emphasise ' + VF.PHASES[p].name + ' · ' + counts[p], check: S.emph === p, icon: null, fn: function () { VF.setEmphasis(S.emph === p ? null : p); } }; }).concat([{ sep: 1 }, { label: 'Phase columns', check: !!S.opts.phaseCols, fn: function (v) { S.opts.phaseCols = !!v; VF.store.set('phase-columns', v ? 'on' : 'off'); VF.renderBands(); V.announce(v ? 'Phase columns on' : 'Phase columns off'); } }]), b, { placement: 'bottom-start' });
  };

  /* ---------- PhaseRuler + LiveNote ---------- */
  function liveNote(short) {
    var live = S.m.meta.live, n = VF.draftDiff().count;
    if (S.scen === 'interim' || S.scen === 'volatile') return '<span class="fd-live-note">Edits stay on this device until you publish. Callers hear the saved flow.</span>';
    if (!live) return '<span class="fd-live-note">Not live. Nothing calls this flow until you publish.</span>';
    if (!n) return '<span class="fd-live-note u-fg-3">No unpublished changes</span>';
    if (short) return '<span class="fd-live-note">Callers hear v' + live.version + ' until you publish.</span><button type="button" class="btn btn--link fd-note-link" data-h="compare">Compare</button>';
    var ub = live.usedBy || [], nums = ub.filter(function (u) { return u.kind === 'inbound'; }), bat = ub.filter(function (u) { return u.kind === 'batch'; });
    var what = (nums.length === 1 ? 'answers ' + V.ui.phoneText(nums[0].label, { size: 'sm' }) : nums.length ? 'answers ' + nums.length + ' numbers' : '') + (bat.length ? (nums.length ? ' and runs ' : 'runs ') + bat.length + ' batch' + (bat.length === 1 ? '' : 'es') : '');
    return '<span class="fd-live-note"><span class="live-dot" data-mark aria-hidden="true"></span><b>Live v' + live.version + '</b> ' + what + ' since ' + esc(V.fmt.dateShort(live.since)) + '. Callers hear v' + live.version + ' until you publish.</span><button type="button" class="btn btn--link fd-note-link" data-h="compare">Compare with live</button>';
  }
  function renderRuler() {
    var r = $('#fd-ruler'); if ((S.mode !== 'full' && S.mode !== 'compact') || S.short) { r.innerHTML = ''; r.hidden = true; return; }
    r.hidden = false; var counts = { trigger: 0, logic: 0, action: 0, outcome: 0 };
    VF.visibleSteps().forEach(function (s) { var p = VF.phaseOf(s); if (p) counts[p]++; });
    r.innerHTML = '<div class="fd-ruler-bar" role="toolbar" aria-label="Phases"><div class="phase-bar">' + VF.PHASE_ORDER.map(function (p, i) {
      return (i ? '<span class="phase-arrow" aria-hidden="true">' + VF.icon('arrow-right') + '</span>' : '') + '<button type="button" class="phase-seg" data-phase="' + p + '" aria-pressed="' + (S.emph === p) + '" aria-label="' + VF.PHASES[p].name + ', ' + counts[p] + ' step' + (counts[p] === 1 ? '' : 's') + '. Emphasise ' + VF.PHASES[p].name + '" tabindex="' + (i === 0 ? 0 : -1) + '"><span class="gt ' + (p === 'outcome' ? 'gt--neutral' : VF.PHASES[p].tile) + '" aria-hidden="true">' + VF.icon(VF.PHASES[p].icon === 'message-square' ? 'message-square' : VF.PHASES[p].icon) + '</span>' + VF.PHASES[p].name + ' <b>' + (ld() ? '–' : counts[p]) + '</b></button>';
    }).join('') + '</div><button type="button" class="ibtn ibtn--sm phase-cols" data-h="cols" aria-pressed="' + S.opts.phaseCols + '" aria-label="Phase columns" tabindex="-1">' + VF.icon('columns-3', 'sm') + '</button></div>' + (ld() ? '' : '<div class="fd-ruler-note">' + liveNote(S.mode === 'compact') + '</div>');
  }
  VF.setEmphasis = function (p) { S.emph = p; VF.renderCanvas(); renderRuler(); V.announce(p ? 'Showing ' + VF.PHASES[p].name + ' steps' : 'Showing all steps'); };

  /* ---------- ToolRail ---------- */
  function renderTools() {
    var t = $('#fd-tools'); if (S.mode !== 'full' && S.mode !== 'compact') { t.innerHTML = ''; return; }
    var tools = [['add', 'plus', 'Add step', 'A'], ['outline', 'list-tree', 'Outline', 'O'], ['variables', 'braces', 'Variables', 'V'], ['find', 'search', 'Find', 'mod+F'], ['history', 'history', 'Version history', null], ['settings', 'sliders-horizontal', 'Flow settings', null]];
    var ro = !!VF.readOnlyReason(), un = ld(), stop = S.toolStop || 'add';
    /* Load failed or still loading: nothing works on data that is not there (FD1 §14); Prototype states stays usable. */
    var unWhy = S.loadError ? 'This flow didn’t load. Retry first.' : 'The flow is still loading.';
    t.innerHTML = tools.map(function (x) { var pressed = x[0] === 'find' ? VF.findOpen() : S.left === x[0]; return '<button type="button" class="ibtn" data-tool="' + x[0] + '" aria-label="' + x[2] + '"' + (x[0] !== 'settings' ? ' aria-pressed="' + !!pressed + '"' : ' aria-haspopup="dialog"') + (x[3] ? ' data-kbd="' + x[3] + '" aria-keyshortcuts="' + (x[3] === 'mod+F' ? (V.util.isMac ? 'Meta+F' : 'Control+F') : x[3]) + '"' : '') + ' data-tooltip-side="right" tabindex="' + (x[0] === stop ? 0 : -1) + '"' + (un ? ' aria-disabled="true" data-tooltip="' + esc(unWhy) + '"' : x[0] === 'add' && ro ? ' aria-disabled="true" data-tooltip="' + esc(VF.readOnlyReason() === 'viewonly' ? 'You can view this flow. Ask Rohit S. (admin) to change it.' : 'Read only right now') + '"' : '') + '>' + VF.icon(x[1]) + '</button>'; }).join('') +
      '<span class="fd-tools-sp"></span><button type="button" class="ibtn" data-tool="proto" aria-label="Prototype states (prototype only)" aria-haspopup="dialog" data-tooltip-side="right" tabindex="' + (stop === 'proto' ? 0 : -1) + '">' + VF.icon('presentation') + '</button>';
  }

  /* ---------- phone chip row, Outline | Canvas, sticky Test · Publish ---------- */
  function renderPhone() {
    var p = $('#fd-phone'), st = $('#fd-sticky');
    if (S.mode !== 'phone') { p.innerHTML = ''; p.hidden = true; st.innerHTML = ''; st.hidden = true; return; }
    p.hidden = false; st.hidden = false;
    /* Landscape phone (phone by height): one row with Test and Publish, no sticky bar (05 §10.5). */
    var land = !!S.landscape;
    p.innerHTML = '<div class="fd-chiprow">' + versionChip(land) + liveChip() + (ld() ? '' : issuesChip(false)) + (land && !ld() ? '<span class="fd-chiprow-acts"><button type="button" class="btn btn--sm" data-h="test">' + VF.icon('play', 'sm') + 'Test</button>' + publishBtns(false) + '</span>' : '') + '<button type="button" class="ibtn fd-chiprow-more" data-h="more" aria-label="More flow actions" aria-haspopup="menu">' + VF.icon('ellipsis') + '</button></div>' +
      '<div class="seg seg--full fd-phone-seg" role="radiogroup" aria-label="View"><button type="button" role="radio" aria-checked="' + (S.phoneView !== 'canvas') + '" data-value="outline">Outline</button><button type="button" role="radio" aria-checked="' + (S.phoneView === 'canvas') + '" data-value="canvas">Canvas</button></div>';
    if (land) { st.innerHTML = ''; st.hidden = true; V.initAll(p); return; }
    var why = VF.publishReason();
    st.innerHTML = (why && !S.viewing ? '<p class="fd-sticky-why" id="fd-sticky-why" hidden>' + esc(why) + '</p>' : '') + '<button type="button" class="btn btn--lg" data-h="test">' + VF.icon('play') + 'Test</button>' + publishBtns(true).replace(/btn--sm/g, 'btn--lg');
    V.initAll(p);
  }

  /* ---------- FlowSwitcher (core §5.4): line 1 name, line 2 status, edited, steps ---------- */
  VF.renderSwitcher = function () {
    var lb = $('#fd-switch-lb'); if (lb.getAttribute('data-for') === S.m.meta.id) return; lb.setAttribute('data-for', S.m.meta.id);
    lb.innerHTML = VF.flowList().map(function (f) { var st = f.live ? 'Live v' + f.live.version + (f.draft && f.draft.changes && f.id === 'flow_7c21' ? ' · Draft, ' + f.draft.changes + ' changes' : '') : 'Not published'; return '<div class="option option--2" role="option" data-value="' + f.id + '" aria-selected="' + (f.id === S.m.meta.id) + '"><span class="option-main"><span class="option-label">' + esc(f.name) + '</span><span class="option-desc">' + esc(st + ' · edited ' + V.fmt.when(f.editedAt).replace(/^Today .*/, 'today') + ' · ' + f.stepCount + ' steps') + '</span></span><span class="option-check">' + VF.icon('check', 'sm') + '</span></div>'; }).join('');
  };

  /* ---------- header actions ---------- */
  VF.headerInit = function () {
    var fd = $('#fd');
    fd.addEventListener('click', function (e) {
      var b = e.target.closest('[data-h], [data-tool], [data-phase]'); if (!b || !$('#fd').contains(b)) return;
      if (b.hasAttribute('data-phase')) { var p = b.getAttribute('data-phase'); VF.setEmphasis(S.emph === p ? null : p); return; }
      var tool = b.getAttribute('data-tool');
      if (tool) {
        if (b.getAttribute('aria-disabled') === 'true' && tool !== 'proto') { V.announce(b.getAttribute('data-tooltip') || 'Not available'); return; }
        S.toolStop = tool;
        /* Dialogs return focus to their trigger (FD1 §16.2): re-render the rail first and hand the dialog the new button. */
        if (tool === 'settings' || tool === 'proto') { renderTools(); var db = $('#fd-tools [data-tool="' + tool + '"]') || b; if (tool === 'settings') VF.openSettings(db); else VF.openProto(db); return; }
        if (tool === 'find') VF.openFind(); else VF.openLeft(tool, { trigger: b }); renderTools(); var nb = $('#fd-tools [data-tool="' + tool + '"]'); if (nb && d.activeElement === d.body) nb.focus(); return;
      }
      var a = b.getAttribute('data-h');
      if (b.getAttribute('aria-disabled') === 'true') { if (a === 'publish') { var why = $('#fd-sticky-why'); if (why) why.hidden = false; V.announce(VF.publishReason()); } return; }
      ({
        undo: VF.undo, redo: VF.redo, tidy: function () { VF.tidyAll(); }, issues: function () { VF.toggleProblems(); }, test: function () { VF.toggleTest({ trigger: b }); },
        publish: function () { VF.openPublish({ trigger: b }); }, more: function () { VF.openMoreMenu(b); }, version: function () { VF.openVersionMenu(b); }, phases: function () { VF.openPhasesMenu(b); },
        compare: function () { VF.enterCompare('live'); }, cols: function () { S.opts.phaseCols = !S.opts.phaseCols; VF.store.set('phase-columns', S.opts.phaseCols ? 'on' : 'off'); b.setAttribute('aria-pressed', S.opts.phaseCols); VF.renderBands(); V.announce(S.opts.phaseCols ? 'Phase columns on' : 'Phase columns off'); },
        backdraft: function () { VF.exitVersion(); }, restore: function () { VF.restoreVersion(S.viewing.v); }, 'rollback-view': function () { VF.openPublish({ rollback: S.viewing.v, trigger: b }); },
        duplicate: function () { V.toast.success('Duplicated as ‘' + S.m.meta.name + ' (copy)’', { action: { label: 'Open', onClick: function () {} } }); }
      }[a] || function () {})();
    });
    $('#fd-tools').addEventListener('focusin', function (e) { var t = e.target.closest && e.target.closest('[data-tool]'); if (t) S.toolStop = t.getAttribute('data-tool'); });
    fd.addEventListener('keydown', function (e) {
      var bar = e.target.closest('[role="toolbar"]'); if (!bar || !/^Arrow/.test(e.key) || e.target.tagName === 'INPUT') return;
      var vertical = bar.getAttribute('aria-orientation') === 'vertical', items = $$('button', bar).filter(V.util.visible), i = items.indexOf(e.target);
      var dir = (vertical ? { ArrowDown: 1, ArrowUp: -1 } : { ArrowRight: 1, ArrowLeft: -1 })[e.key]; if (!dir || i < 0) return;
      e.preventDefault(); var n = items[(i + dir + items.length) % items.length]; items.forEach(function (x) { x.tabIndex = -1; }); n.tabIndex = 0; n.focus();
    });
    fd.addEventListener('vaani:change', function (e) { if (e.target.closest('.fd-phone-seg')) { S.phoneView = e.detail.value; VF.applyMode(true); if (S.phoneView === 'canvas') setTimeout(function () { VF.fitOpen(); }, 40); var r = $('.fd-phone-seg [data-value="' + S.phoneView + '"]'); if (r) r.focus(); } });
    $('#fd-switch').addEventListener('vaani:change', function (e) { var id = e.detail.value; if (id === S.m.meta.id) return; VF.leave('flow-designer.html?flow=' + id); });
    $('#fd-crumb').addEventListener('click', function () { $('#fd-switch').click(); });
  };

  VF.openVersionMenu = function (b) {
    var live = S.m.meta.live, diff = VF.draftDiff(), items = [];
    if (S.lastPublished) items.push({ label: 'Roll back to v' + S.lastPublished.from + '…', icon: 'rotate-ccw', fn: function () { VF.openPublish({ rollback: S.lastPublished.from, trigger: b }); } });
    if (live) items.push({ label: 'Compare with Live v' + live.version, icon: 'git-compare', fn: function () { VF.enterCompare('live'); } });
    items.push({ label: 'Version history', icon: 'history', fn: function () { VF.openLeft('history', { trigger: b }); } });
    if (diff.count) {
      var sub = diff.rows.filter(function (r) { return r.id; }).map(function (r) { return { label: (r.kind === 'added' ? 'Added' : r.kind === 'removed' ? 'Removed' : 'Changed') + ' · ' + r.label, desc: r.summary, fn: function () { if (VF.step(r.id)) { VF.select([r.id]); VF.focusStep(r.id); VF.openInspector(r.id); } else VF.enterCompare('live'); } }; });
      VF.menu('fd-changes-menu', 'What changed', sub, null, { build: true });
      items.push({ label: 'What changed (' + diff.count + ')', icon: 'list', sub: 'fd-changes-menu', end: VF.icon('chevron-right', 'sm') });
      items.push({ sep: 1 }, { label: 'Discard draft changes…', icon: 'trash-2', danger: 1, fn: function () { VF.discardDraft(b); } });
    }
    VF.menu('fd-version-menu', 'Version', items, b, { placement: 'bottom-start' });
  };
  VF.openMoreMenu = function (b) {
    if (ld()) { VF.menu('fd-more-menu', 'More flow actions', [{ label: 'Keyboard shortcuts', icon: 'keyboard', kbd: '?', fn: function () { V.shortcuts.openSheet(); } }, { sep: 1 }, { head: 'Prototype only' }, { label: 'Prototype states…', icon: 'presentation', fn: function () { VF.openProto(b); } }], b); return; }
    var m = S.mode, live = S.m.meta.live, ro = VF.readOnlyReason(), items = [
      { label: 'Preview agent script', icon: 'file-text', fn: function () { VF.openSettings(b, { section: 'advanced' }); } },
      { label: 'Duplicate flow…', icon: 'copy', fn: function () { V.toast.success('Duplicated as ‘' + S.m.meta.name + ' (copy)’', { action: { label: 'Open', onClick: function () {} } }); } },
      { label: 'Export JSON', icon: 'download', fn: function () { V.toast.info('Exported ' + S.m.meta.shortId + '.json (simulated in this prototype).'); } },
      { label: 'Import JSON…', icon: 'upload', disabled: m === 'phone' ? 'Import on a larger screen' : null, fn: function () { V.toast.info('Import always creates a new flow. It never replaces this one.'); } },
      { label: 'Keyboard shortcuts', icon: 'keyboard', kbd: '?', fn: function () { V.shortcuts.openSheet(); } },
      { label: 'Flow settings', icon: 'sliders-horizontal', fn: function () { VF.openSettings(b); } }
    ];
    if (m === 'compact') items.splice(0, 0, { label: 'Tidy', icon: 'network', disabled: ro || S.opts.locked ? 'Unlock the canvas to tidy.' : null, fn: function () { VF.tidyAll(); } }, { label: 'Wallet · ' + V.fmt.money((V.data.wallet.states[V.walletState()] || {}).balance), icon: 'wallet', fn: function () { V.openTopUp('flow'); } });
    if (m === 'review' || m === 'phone') items.splice(0, 0, { label: 'Switch flow…', icon: 'workflow', fn: function () { VF.openSwitchSheet(b); } }, { label: 'Version history', icon: 'history', fn: function () { VF.openHistorySheet(); } }, { label: 'Compare with live', icon: 'git-compare', disabled: live ? null : 'Not live yet', fn: function () { VF.enterCompare('live'); } }, { label: 'Roll back to v' + (live ? (live.version > 1 ? live.version - 1 : live.version) : 1) + '…', icon: 'rotate-ccw', disabled: live && live.version > 1 ? null : 'No earlier version', fn: function () { VF.openPublish({ rollback: live.version - 1, trigger: b }); } }, { label: 'Discard draft changes…', icon: 'trash-2', disabled: VF.draftDiff().count ? null : 'Nothing to discard', fn: function () { VF.discardDraft(b); } });
    items.push({ sep: 1 }, { head: 'Prototype only' }, { label: 'Prototype states…', icon: 'presentation', fn: function () { VF.openProto(b); } }, { sep: 1 }, { label: 'Delete flow…', icon: 'trash-2', danger: 1, disabled: S.scen === 'viewonly' ? 'Only admins can delete this flow' : null, fn: function () { VF.deleteFlow(b); } });
    VF.menu('fd-more-menu', 'More flow actions', items, b);
  };
  /* Router guard (FD2 §4.7): leaving with unsaved edits asks first; otherwise pending saves flush before routing. */
  VF.leave = function (href) {
    var st = S.save.state, n = Math.max(1, S.save.edits);
    if (['error', 'offline', 'conflict', 'volatile'].indexOf(st) >= 0) { V.dialog.confirm({ title: 'Leave with ' + n + ' unsaved edit' + (n === 1 ? '' : 's') + '?', body: st === 'volatile' ? 'This browser won’t keep them. Publish them, or they are lost.' : 'They stay on this device and come back when you reopen this flow.', confirmLabel: 'Leave', focusCancel: true }).then(function (ok) { if (ok) { S.save.state = 'saved'; w.location.href = href; } }); return; }
    VF.save.flush(function () { w.location.href = href; });
  };
  VF.openSwitchSheet = function (b) { var t = $('#fd-switch'); t.tabIndex = 0; VF.menu('fd-switch-menu', 'Switch flow', VF.flowList().map(function (f) { return { label: f.name, desc: f.live ? 'Live v' + f.live.version : 'Not published', fn: function () { VF.leave('flow-designer.html?flow=' + f.id); } }; }), b); };
})(window, document);
