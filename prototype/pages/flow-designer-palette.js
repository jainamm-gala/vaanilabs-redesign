/* Vaani Labs prototype · Flow Designer · LeftPanel host (FD1 §3.1), StepPalette (FD1 §8.2, §8.3) and VariablesPanel
   (FD2 §8.4). The panel docks at ≥ 1440 (pushes the canvas) and overlays the canvas at 1024–1439. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  VF.leftViews = {}; S.left = null; S.leftDocked = false;
  var TITLES = { add: 'Add step', outline: 'Outline', variables: 'Variables', history: 'Version history' };
  function el() { return $('#fd-left'); }

  VF.openLeft = function (view, o) {
    o = o || {}; if (VF.unloaded && VF.unloaded()) return;
    if (S.mode === 'review' || S.mode === 'phone') { if (view === 'history') return VF.openHistorySheet(); if (view !== 'outline') return VF.explainReadOnly(); }
    if (S.left === view && !o.keep) { VF.closeLeft(); return; }
    S.left = view; S.leftTrigger = o.trigger || d.activeElement;
    S.leftDocked = S.mode === 'full' && (w.innerWidth >= 1440 || (view === 'outline' && o.large));
    VF.renderLeft(); VF.emit('panels');
    if (o.focus !== false) setTimeout(function () { var f = view === 'add' ? $('#fd-pal-q') : view === 'variables' ? $('#fd-var-q') : $('#fd-left-t'); if (f) { if (f.id === 'fd-left-t') f.tabIndex = -1; f.focus(); } }, 20);
    if (view === 'outline' && VF.store && o.large !== undefined) void 0;
  };
  VF.closeLeft = function (o) {
    var was = S.left; if (!was) return; S.left = null;
    if (was === 'outline' && S.m.steps.length > 20) VF.store.set('outline-large', 'off');
    VF.renderLeft(); VF.emit('panels');
    if (!(o && o.noFocus)) { var t = $('#fd-tools [data-tool="' + was + '"]'); if (t && V.util.visible(t)) t.focus(); }
  };
  VF.renderLeft = function () {
    var e = el(), m = S.mode;
    if (m === 'review' || m === 'phone') { e.hidden = false; e.className = 'fd-left fd-left--' + m; VF.renderReviewColumn(e); return; }
    if (!S.left) { e.hidden = true; e.className = 'fd-left'; return; }
    e.hidden = false; e.className = 'fd-left' + (S.leftDocked ? '' : ' is-overlay');
    e.innerHTML = '<div class="fd-left-head"><h2 class="fd-left-title" id="fd-left-t">' + TITLES[S.left] + '</h2><button type="button" class="ibtn ibtn--sm" data-a="close" aria-label="Close ' + TITLES[S.left] + '" data-kbd="Esc">' + VF.icon('x', 'sm') + '</button></div><div class="fd-left-body" id="fd-left-body"></div>';
    VF.leftViews[S.left]($('#fd-left-body'));
    V.initAll(e);
  };
  VF.refreshLeft = function () {
    if (S.mode === 'review' || S.mode === 'phone') { VF.renderReviewColumn(el()); return; }
    if (S.left && S.left !== 'add') { var b = $('#fd-left-body'); if (b) { var ae = d.activeElement, keep = ae && b.contains(ae) ? (ae.id || ae.getAttribute('data-row')) : null; VF.leftViews[S.left](b); V.initAll(b); if (keep) { var k = d.getElementById(keep) || b.querySelector('[data-row="' + keep + '"]'); if (k) k.focus({ preventScroll: true }); } } }
  };
  VF.paletteInit = function () {
    var e = el();
    e.addEventListener('click', function (ev) { var a = ev.target.closest('[data-a="close"]'); if (a) VF.closeLeft(); });
    e.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && S.left && !ev.defaultPrevented && !V.overlays.top() && (S.mode === 'full' || S.mode === 'compact')) { ev.preventDefault(); VF.closeLeft(); } });
  };

  /* ---------- StepPalette ---------- */
  var groupsOpen = {}; try { groupsOpen = JSON.parse(VF.store.get('palette-groups') || '{}'); } catch (x) { groupsOpen = {}; }
  var PATTERNS = [
    { id: 'retry', name: 'Ask, retry once, then end as No answer', desc: 'A question that asks again once, then ends the call as No answer.' },
    { id: 'lookup', name: 'Look up, with a not-found reply', desc: 'Knowledge lookup with a polite line when nothing matches.' },
    { id: 'book', name: 'Book, then confirm on WhatsApp', desc: 'Book meeting with an approved WhatsApp confirmation.' }
  ];
  function items() {
    var list = [];
    VF.PHASE_ORDER.forEach(function (p) {
      if (p === 'outcome') { VF.OUTCOMES.slice(0, 7).forEach(function (o) { list.push({ group: p, type: 'outcome.end', preset: o[0], name: o[0], desc: o[1] ? 'Sets lead status to ' + VF.leadWord(o[1]) : 'Leaves the lead status unchanged', tile: 'gt--' + ((V.statusDef('lead', o[1]) || [])[2] || 'neutral'), icon: 'flag', syn: VF.REG['outcome.end'].syn }); }); return; }
      Object.keys(VF.REG).forEach(function (k) { var r = VF.REG[k]; if (r.phase === p) list.push({ group: p, type: k, name: r.name, desc: r.desc, tile: VF.PHASES[p].tile, icon: r.icon, syn: r.syn }); });
    });
    PATTERNS.forEach(function (pt) { list.push({ group: 'patterns', type: 'pattern', preset: pt.id, name: pt.name, desc: pt.desc, tile: 'gt--tint', icon: 'workflow', syn: ['pattern'] }); });
    /* Canvas (FD1 §8.2): a Note and a Frame are drawing aids, not steps; never compiled, validated or counted. */
    list.push({ group: 'canvas', type: 'note', name: 'Note', desc: 'A comment on the canvas, not a step', tile: 'gt--neutral', icon: 'sticky-note', syn: ['note', 'comment', 'sticky', 'annotation'] });
    list.push({ group: 'canvas', type: 'frame', name: 'Frame', desc: 'Group the selected steps; collapse it to one block', tile: 'gt--neutral', icon: 'layout-grid', syn: ['frame', 'group', 'section', 'box', 'colour'] });
    return list;
  }
  function itemHtml(it) { return '<li><button type="button" class="fd-pal-item" data-type="' + it.type + '" data-preset="' + esc(it.preset || '') + '" aria-label="' + (it.type === 'frame' ? 'Frame the selected steps' : 'Add ' + esc(it.name) + (it.type === 'pattern' ? ' pattern' : it.type === 'note' ? '' : ' step')) + '. ' + esc(it.desc) + '"' + (it.type === 'frame' ? ' data-kbd="mod+G"' : '') + '><span class="gt ' + it.tile + '" aria-hidden="true">' + VF.icon(it.icon, 'sm') + '</span><span class="fd-pal-text"><span class="fd-pal-name">' + esc(it.name) + '</span><span class="fd-pal-desc">' + esc(it.desc) + '</span></span></button></li>'; }
  VF.leftViews.add = function (b) {
    var hasTrig = S.m.steps.some(function (s) { return VF.phaseOf(s) === 'trigger'; });
    b.innerHTML = '<div class="fd-pal-search"><div class="input input--sm">' + VF.icon('search', 'sm') + '<input type="search" id="fd-pal-q" placeholder="Search steps…" aria-label="Search steps" autocomplete="off">' + V.ui.kbd('/') + '</div></div>' +
      '<div class="fd-pal-recent"><span class="fd-pal-label" id="fd-pal-rl">Recently used</span><div class="fd-pal-recent-row" role="group" aria-labelledby="fd-pal-rl">' + recentHtml() + '</div></div>' +
      '<div class="fd-pal-list" id="fd-pal-list"></div><p class="form-note fd-pal-foot">Drag onto the canvas or a connection, or press Enter to add after the selected step.</p>';
    function renderList(q) {
      var all = items(), qq = String(q || '').trim().toLowerCase(), html = '';
      if (qq) { var hits = all.filter(function (it) { return (it.name + ' ' + it.desc + ' ' + (it.syn || []).join(' ')).toLowerCase().indexOf(qq) >= 0; }); html = hits.length ? '<ul class="fd-pal-items" aria-label="Matching steps">' + hits.map(itemHtml).join('') + '</ul>' : '<div class="empty empty--compact"><p>No steps match “' + esc(q) + '”. Try “transfer” or “ask”.</p><button type="button" class="btn btn--sm" data-clear>Clear search</button></div>'; }
      else ['trigger', 'logic', 'action', 'outcome', 'patterns', 'canvas'].forEach(function (g) {
        var open = groupsOpen[g] != null ? groupsOpen[g] : !(g === 'trigger' && hasTrig), ph = VF.PHASES[g], cv = g === 'canvas';
        html += '<section class="fd-pal-group" aria-labelledby="fd-pg-h-' + g + '"><h3 class="fd-pal-gh" id="fd-pg-h-' + g + '"><button type="button" aria-expanded="' + open + '" aria-controls="fd-pg-' + g + '" data-group="' + g + '"><span class="gt gt--sm ' + (ph ? ph.tile : cv ? 'gt--neutral' : 'gt--tint') + '" aria-hidden="true">' + VF.icon(ph ? (g === 'logic' ? 'diamond' : g === 'trigger' ? 'phone-incoming' : g === 'outcome' ? 'flag' : 'message-square') : cv ? 'layout-grid' : 'workflow', 'xs') + '</span><span class="fd-pal-text"><span class="fd-pal-name">' + (ph ? ph.name : cv ? 'Canvas' : 'Patterns') + '</span><span class="fd-pal-desc">' + (ph ? ph.desc : cv ? 'Note, Frame' : 'Pre-wired groups of steps') + '</span></span>' + VF.icon(open ? 'chevron-down' : 'chevron-right', 'sm') + '</button></h3><ul class="fd-pal-items" id="fd-pg-' + g + '"' + (open ? '' : ' hidden') + '>' + all.filter(function (it) { return it.group === g; }).map(itemHtml).join('') + '</ul></section>';
      });
      $('#fd-pal-list').innerHTML = html;
    }
    renderList('');
    var q = $('#fd-pal-q');
    q.addEventListener('input', function () { renderList(q.value); });
    b.onclick = function (e) {
      var g = e.target.closest('[data-group]'); if (g) { var k = g.getAttribute('data-group'), open = g.getAttribute('aria-expanded') !== 'true'; groupsOpen[k] = open; VF.store.set('palette-groups', JSON.stringify(groupsOpen)); renderList(''); $('[data-group="' + k + '"]').focus(); return; }
      if (e.target.closest('[data-clear]')) { q.value = ''; renderList(''); q.focus(); return; }
      var it = e.target.closest('[data-type]'); if (!it || S.palDragged) { S.palDragged = false; return; }
      addFromPalette(it.getAttribute('data-type'), it.getAttribute('data-preset') || null, e.detail === 0);
    };
    b.onpointerdown = function (e) { var it = e.target.closest('[data-type]'); if (it && e.button === 0) startDrag(e, it); };
  };
  function addFromPalette(type, preset, keyboard) {
    if (VF.readOnlyReason()) return VF.explainReadOnly();
    if (type === 'note') { if (VF.addNote) VF.addNote({ near: S.sel.length === 1 ? S.sel[0] : null, edit: true }); return; }
    if (type === 'frame') { if (VF.frameSelection) VF.frameSelection(S.sel.slice()); return; }
    var s = type === 'pattern' ? addPattern(preset) : VF.addStep(type, { preset: preset, keyboard: keyboard, method: 'palette_click' });
    if (!s) return;
    VF.reveal(s.id);
    if (keyboard) VF.openInspector(s.id, { focusLabel: true }); else VF.openInspector(s.id);
    if (S.left === 'add' && !S.leftDocked && !keyboard) { /* overlay stays open for repeated adds; closes after a drag */ }
  }
  function addPattern(id) {
    var first = null, sel = S.sel.length === 1 ? S.sel[0] : null;
    if (id === 'retry') { first = VF.addStep('logic.question', {}); if (!first) return null; VF.act('add pattern', function () { first.f.unclear = 'Ask again once'; var e = VF.newStep('outcome.end', 'No answer'); e.x = first.x + 256 + 128; e.y = first.y + 160; var p = VF.place(S.m.steps, e, e.x, e.y); e.x = p.x; e.y = p.y; S.m.steps.push(e); first.outs[2].to = e.id; }, { coalesce: 'pattern' }); }
    if (id === 'lookup') { first = VF.addStep('action.knowledge', {}); if (!first) return null; VF.act('add pattern', function () { var sp = VF.newStep('action.speak'); sp.title = 'Nothing found'; sp.f.prompt = 'Mujhe iski jaankari abhi nahi mili. Main hamari team se aapko call karwati hoon.'; var p = VF.place(S.m.steps, sp, first.x + 240 + 128, first.y + 96); sp.x = p.x; sp.y = p.y; S.m.steps.push(sp); first.outs[1].to = sp.id; }, { coalesce: 'pattern' }); }
    if (id === 'book') { first = VF.addStep('action.meeting', {}); if (!first) return null; VF.act('add pattern', function () { first.f.confirmWa = true; first.f.template = 'visit_reminder'; }, { coalesce: 'pattern' }); }
    void sel; return first;
  }

  /* DragGhost (FD1 §8.3): the real step silhouette at --opacity-drag, snapped; "Insert between …" over a connection. */
  function startDrag(e, it) {
    var x0 = e.clientX, y0 = e.clientY, ghost = null, tag = null, type = it.getAttribute('data-type'), preset = it.getAttribute('data-preset') || null, moved = false;
    if (type === 'pattern' || type === 'note' || type === 'frame' || VF.readOnlyReason()) return;
    function move(ev) {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      if (!moved) { moved = true; it.classList.add('fd-pal-dragging'); ghost = d.createElement('div'); ghost.className = 'fd-dragghost'; ghost.setAttribute('aria-hidden', 'true'); var r = VF.REG[type]; ghost.innerHTML = '<span class="gt ' + (type === 'outcome.end' ? 'gt--' + ((V.statusDef('lead', VF.outcomeLead(preset)) || [])[2] || 'neutral') : VF.PHASES[r.phase].tile) + '">' + VF.icon(r.icon, 'sm') + '</span><span class="fd-dragghost-t"><span>' + VF.PHASES[r.phase].name + '</span><b>' + esc(VF.defaultTitle(type, preset)) + '</b></span>'; d.body.appendChild(ghost); tag = d.createElement('span'); tag.className = 'tag tag--info fd-droptag'; tag.hidden = true; d.body.appendChild(tag); }
      ghost.style.left = ev.clientX + 12 + 'px'; ghost.style.top = ev.clientY + 12 + 'px';
      var hint = VF.dropHint(ev.clientX, ev.clientY); tag.hidden = !hint; if (hint) { tag.textContent = hint; tag.style.left = ev.clientX + 16 + 'px'; tag.style.top = ev.clientY - 28 + 'px'; }
    }
    function up(ev) {
      d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('keydown', esc2, true);
      if (!moved) return; S.palDragged = true; setTimeout(function () { S.palDragged = false; }, 50);
      it.classList.remove('fd-pal-dragging'); ghost.remove(); tag.remove(); VF.dropHint(-1, -1);
      if (VF.dropAt(ev.clientX, ev.clientY, type, preset)) { if (S.left === 'add' && !S.leftDocked) VF.closeLeft({ noFocus: true }); if (S.sel[0]) VF.openInspector(S.sel[0]); }
    }
    function esc2(ev) { if (ev.key === 'Escape' && moved) { ev.preventDefault(); ev.stopPropagation(); moved = false; it.classList.remove('fd-pal-dragging'); if (ghost) ghost.remove(); if (tag) tag.remove(); d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('keydown', esc2, true); V.announce('Drag cancelled'); } }
    d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('keydown', esc2, true);
  }

  /* Recently used (FD1 §8.2): one fixed 32 px row, updated after each add without moving the list below (F-FLOW-035). */
  function recentHtml() {
    return S.recent.length ? S.recent.map(function (k) { var p = k.split('|'), r = VF.REG[p[0]]; return '<button type="button" class="fd-pal-chip" data-type="' + p[0] + '" data-preset="' + esc(p[1]) + '" aria-label="Add ' + esc(p[1] || r.name) + ' step"><span class="gt gt--sm ' + (p[0] === 'outcome.end' ? 'gt--' + ((V.statusDef('lead', VF.outcomeLead(p[1])) || [])[2] || 'neutral') : VF.PHASES[r.phase].tile) + '" aria-hidden="true">' + VF.icon(r.icon, 'xs') + '</span>' + esc(p[1] || r.name) + '</button>'; }).join('') : '<span class="form-note">Steps you add appear here.</span>';
  }
  VF.on('added', function () { var row = $('#fd-left .fd-pal-recent-row'); if (!row || S.left !== 'add') return; var ae = d.activeElement, f = ae && row.contains(ae) ? ae.getAttribute('data-type') + '|' + ae.getAttribute('data-preset') : null; row.innerHTML = recentHtml(); if (f) { var b = $$('.fd-pal-chip', row).filter(function (x) { return x.getAttribute('data-type') + '|' + x.getAttribute('data-preset') === f; })[0]; if (b) b.focus(); } });

  /* ---------- VariablesPanel ---------- */
  VF.leftViews.variables = function (b) {
    var all = VF.allVars(S.m.steps), groups = {}, qv = (S.varQ || '').toLowerCase();
    all.filter(function (v) { return !qv || (v.name + ' ' + v.label).toLowerCase().indexOf(qv) >= 0; }).forEach(function (v) { (groups[v.group] = groups[v.group] || []).push(v); });
    function used(n) { return S.m.steps.filter(function (s) { return Object.keys(s.f || {}).some(function (k) { return typeof s.f[k] === 'string' && s.f[k].indexOf('{{' + n + '}}') >= 0 || s.f[k] === n && (k === 'cbTime'); }); }); }
    b.innerHTML = '<div class="fd-pal-search"><div class="input input--sm">' + VF.icon('search', 'sm') + '<input type="search" id="fd-var-q" placeholder="Search variables…" aria-label="Search variables" value="' + esc(S.varQ || '') + '"></div></div>' +
      Object.keys(groups).map(function (g) { return '<section class="fd-var-g" aria-labelledby="fd-vg-' + g.replace(/\W/g, '') + '"><h3 class="fd-pal-label" id="fd-vg-' + g.replace(/\W/g, '') + '">' + esc(g) + '</h3><ul class="fd-var-list">' + groups[g].map(function (v) { var u = used(v.name); return '<li class="fd-varrow"><div class="l-split"><span class="type-mono-13" translate="no">' + esc(v.name) + '</span><span class="fd-pal-desc">' + esc(v.type) + '</span></div><span class="fd-pal-desc">' + esc(v.label) + '</span><div class="l-cluster l-cluster--xs">' + (u.length ? '<button type="button" class="btn btn--link fd-var-used" data-find="' + esc(v.name) + '">Used in ' + u.length + ' step' + (u.length === 1 ? '' : 's') + '</button>' : '<span class="fd-pal-desc">Not used</span>') + (v.by ? ' · <button type="button" class="btn btn--link" data-goto="' + v.by + '">' + esc(v.label) + '</button>' : '') + '</div><div class="input input--sm"><input type="text" data-sample="' + esc(v.name) + '" value="' + esc(S.samples[v.name] != null ? S.samples[v.name] : v.sample) + '" aria-label="Sample value for ' + esc(v.name) + '"></div></li>'; }).join('') + '</ul></section>'; }).join('') +
      (all.length ? '' : '<div class="empty empty--compact">Variables appear when a step saves an answer or a lookup brings in fields.</div>');
    $('#fd-var-q', b).addEventListener('input', function (e) { S.varQ = e.target.value; VF.leftViews.variables(b); var q = $('#fd-var-q', b); q.focus(); q.setSelectionRange(q.value.length, q.value.length); });
    b.onclick = function (e) { var f = e.target.closest('[data-find]'), g = e.target.closest('[data-goto]'); if (f) VF.openFind('{{' + f.getAttribute('data-find')); if (g) { VF.select([g.getAttribute('data-goto')]); VF.focusStep(g.getAttribute('data-goto')); } };
    b.oninput = function (e) { var k = e.target.getAttribute('data-sample'); if (k) S.samples[k] = e.target.value; };
  };
})(window, document);
