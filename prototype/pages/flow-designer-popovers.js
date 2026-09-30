/* Vaani Labs prototype · Flow Designer · popovers and menus: ConnectToPopover (FD2 §16.4), StepPicker (FD1 §8.4),
   EdgePopover (FD1 §7.5), step / canvas / zoom / view-options menus (FD1 §9.1, §10.5), CanvasControls and FindBar (§12.2). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, E = VF.el, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  function norm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* ---------- generated menus (shell Menu: roving focus, typeahead, Esc returns focus) ---------- */
  VF.menu = function (id, label, items, trigger, o) {
    o = o || {}; var old = d.getElementById(id); if (old) old.remove();
    var m = d.createElement('div'); m.className = 'menu'; m.id = id; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', label); m.hidden = true;
    m.innerHTML = items.map(function (it, i) {
      if (it.sep) return '<div class="menu-sep" role="separator"></div>';
      if (it.head) return '<span class="menu-group-label" role="presentation">' + esc(it.head) + '</span>';
      var chk = it.check != null;
      return '<button type="button" class="menu-item' + (it.danger ? ' menu-item--danger' : '') + '" role="' + (chk ? 'menuitemcheckbox' : 'menuitem') + '" data-i="' + i + '"' + (chk ? ' aria-checked="' + !!it.check + '"' : '') + (it.disabled ? ' aria-disabled="true" data-reason="' + esc(it.disabled) + '"' : '') + (it.sub ? ' aria-haspopup="menu" data-submenu="' + it.sub + '"' : '') + '>' +
        (chk ? '<span class="menu-check">' + VF.icon('check') + '</span>' : '') + (it.icon ? VF.icon(it.icon) : '') + '<span class="menu-text"><span>' + esc(it.label) + '</span>' + (it.desc || it.disabled ? '<span class="menu-desc">' + esc(it.desc || it.disabled) + '</span>' : '') + '</span>' + (it.kbd ? '<span class="menu-end">' + V.ui.kbd(it.kbd) + '</span>' : it.end ? '<span class="menu-end">' + it.end + '</span>' : '') + '</button>';
    }).join('');
    $('#fd-menus').appendChild(m);
    m.addEventListener('vaani:menuselect', function (e) { var it = items[+e.detail.item.getAttribute('data-i')]; if (it && it.fn) setTimeout(function () { it.fn(e.detail.checked); }, 0); });
    if (o.build) return m;
    var bare = trigger && !trigger.matches('button, a, [role="button"]');
    var entry = V.menu.open(trigger, id, { placement: o.placement, onClose: function () { if (bare) trigger.removeAttribute('aria-expanded'); if (o.onClose) o.onClose(); } });
    if (bare) trigger.removeAttribute('aria-expanded');
    return entry;
  };

  /* ---------- the searchable step list shared by Connect to… and Add step ---------- */
  var pick = { mode: null, items: [], active: 0 };
  function reaches(fromId, toId) { var by = VF.byId(S.m.steps), seen = {}, st = [fromId]; while (st.length) { var id = st.pop(); if (id === toId) return true; if (seen[id]) continue; seen[id] = 1; var s = by[id]; if (s) s.outs.forEach(function (o) { if (o.to) st.push(o.to); }); } return false; }
  function renderPick() {
    var q = norm($('#fd-pick-q').value.trim()), list = $('#fd-pick-list'), html = '', groups = {}, n = 0;
    var num = (q.match(/^(?:#|step\s*)?(\d+)$/) || [])[1];
    pick.shown = pick.items.filter(function (it) { if (it.always) return true; if (!q) return true; if (num && it.no === +num) return true; return norm(it.label + ' ' + (it.keys || '')).indexOf(q) >= 0; });
    if (q && pick.shown[pick.active] && pick.shown[pick.active].always && !pick.touched) { var fi = pick.shown.map(function (it) { return !it.always; }).indexOf(true); if (fi >= 0) pick.active = fi; }
    pick.shown.forEach(function (it) { (groups[it.group] = groups[it.group] || []).push(it); });
    Object.keys(groups).forEach(function (g, gi) {
      html += '<div role="group" aria-labelledby="fd-pg-' + gi + '">' + (g !== '_' ? '<span class="listbox-group-label" id="fd-pg-' + gi + '">' + esc(g) + '</span>' : '<span class="sr-only" id="fd-pg-' + gi + '">Actions</span>');
      groups[g].forEach(function (it) { var i = pick.shown.indexOf(it); n++; html += '<div class="option' + (it.desc ? ' option--2' : '') + (i === pick.active ? ' is-active' : '') + '" role="option" id="fd-po-' + i + '" data-i="' + i + '" aria-selected="' + (i === pick.active) + '"' + (it.disabled ? ' aria-disabled="true"' : '') + '>' + (it.tile ? '<span class="gt gt--sm ' + it.tile + '" aria-hidden="true">' + VF.icon(it.icon, 'xs') + '</span>' : it.icon ? VF.icon(it.icon, 'sm') : '') + '<span class="option-main"><span class="option-label">' + esc(it.label) + '</span>' + (it.desc ? '<span class="option-desc">' + esc(it.desc) + '</span>' : '') + '</span>' + (it.end ? '<span class="menu-end">' + esc(it.end) + '</span>' : '') + '</div>'; });
      html += '</div>';
    });
    if (!n) html = '<p class="listbox-empty">No steps match “' + esc($('#fd-pick-q').value) + '”. Try “transfer” or “ask”.</p>';
    list.innerHTML = html; if (pick.active >= pick.shown.length) pick.active = 0;
    $('#fd-pick-q').setAttribute('aria-activedescendant', pick.shown.length ? 'fd-po-' + pick.active : '');
    var a = $('#fd-po-' + pick.active); if (a) a.scrollIntoView({ block: 'nearest' });
  }
  function choose(i) { var it = pick.shown[i]; if (!it || it.disabled) return; var fn = it.fn; V.popover.close('fd-pick'); setTimeout(fn, V.reducedMotion() ? 0 : 200); }
  function openPick(trigger, title, note, items, placeholder) {
    pick.items = items; pick.active = 0; pick.touched = false; $('#fd-pick-t').textContent = title; $('#fd-pick-note').textContent = note; var q = $('#fd-pick-q'); q.value = ''; q.placeholder = placeholder || 'Search steps…';
    renderPick(); V.popover.open(trigger, 'fd-pick', { placement: 'right-start' });
  }
  VF.pickInit = function () {
    var q = $('#fd-pick-q');
    q.addEventListener('input', function () { pick.active = 0; pick.touched = false; renderPick(); });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var n = pick.shown.length; if (!n) return; pick.touched = true; pick.active = (pick.active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; renderPick(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(pick.active); }
    });
    $('#fd-pick-list').addEventListener('click', function (e) { var o = e.target.closest('[data-i]'); if (o) choose(+o.getAttribute('data-i')); });
    $('#fd-pick-list').addEventListener('mousedown', function (e) { e.preventDefault(); });
  };
  function stepItems(origin, fn) {
    var src = VF.step(origin.stepId), out = src && src.outs.filter(function (o) { return o.id === origin.outId; })[0], items = [];
    VF.PHASE_ORDER.forEach(function (p) {
      S.m.steps.filter(function (s) { return VF.phaseOf(s) === p && p !== 'trigger' && s.id !== origin.stepId; }).sort(function (a, b) { return a.no - b.no; }).forEach(function (s) {
        var loop = reaches(s.id, origin.stepId), cur = out && out.to === s.id;
        items.push({ group: VF.PHASES[p].name, label: s.title + (cur ? ' (current)' : ''), keys: '#' + s.no + ' ' + (VF.reg(s).syn || []).join(' ') + ' ' + VF.reg(s).name, no: s.no, tile: VF.tileClass(s), icon: VF.reg(s).icon, desc: 'step ' + s.no + (loop ? ' · Creates a loop' : ''), fn: function () { fn(s.id); } });
      });
    });
    return items;
  }
  VF.openConnect = function (stepId, outId, trigger) {
    if (VF.readOnlyReason()) return VF.explainReadOnly();
    var s = VF.step(stepId), o = s.outs.filter(function (x) { return x.id === outId; })[0], name = o.label || s.title;
    var items = [{ group: '_', always: true, label: 'New step…', icon: 'plus', fn: function () { VF.openPicker({ stepId: stepId, outId: outId }, trigger); } }]
      .concat(stepItems({ stepId: stepId, outId: outId }, function (id) { VF.connect(stepId, outId, id); }));
    if (o.to) items.push({ group: '_', always: true, label: 'Disconnect', icon: 'unlink', fn: function () { VF.disconnect(stepId, outId); } });
    openPick(trigger, 'Connect ‘' + name + '’ to…', 'Type a name, a step number or a kind of step. Enter connects.', items, 'Search steps or #number…');
  };
  /* StepPicker: suggested first, then the registry by phase, then Connect to an existing step (C). */
  VF.openPicker = function (origin, trigger) {
    if (VF.readOnlyReason()) return VF.explainReadOnly();
    var src = origin && VF.step(origin.stepId), out = src && src.outs.filter(function (x) { return x.id === origin.outId; })[0], anchorName = out ? (out.label || src.title) : null;
    function add(type, preset) { return function () { VF.addStep(type, { preset: preset, from: origin && origin.stepId ? origin : null, at: origin && origin.at ? { x: origin.at.x, y: origin.at.y - 30 } : null, keyboard: true }); }; }
    var items = [], sug = [];
    if (out && VF.reg(src).rows === 'answers') { var m = { later: 'Callback', no: 'Not interested', noreply: 'No answer', yes: 'Interested' }[out.id] || (/later|baad/i.test(out.label) ? 'Callback' : /no reply/i.test(out.label) ? 'No answer' : null); sug = [['action.speak'], ['logic.question']]; if (m) sug.push(['outcome.end', m]); }
    else if (src && src.type === 'action.speak') sug = [['logic.question'], ['outcome.end', 'Interested']];
    else sug = [['action.speak'], ['logic.question']];
    sug.slice(0, 4).forEach(function (sg) { var r = VF.REG[sg[0]]; items.push({ group: 'Suggested', label: sg[1] ? 'End as ' + sg[1] : r.name, keys: r.syn.join(' '), tile: sg[1] ? 'gt--' + ((V.statusDef('lead', VF.outcomeLead(sg[1])) || [])[2] || 'neutral') : VF.PHASES[r.phase].tile, icon: r.icon, desc: sg[1] ? 'Sets lead status to ' + (VF.leadWord(VF.outcomeLead(sg[1])) || 'unchanged') : r.desc, fn: add(sg[0], sg[1]) }); });
    VF.PHASE_ORDER.forEach(function (p) {
      if (p === 'trigger' && origin) return;
      if (p === 'outcome') { VF.OUTCOMES.slice(0, 7).forEach(function (oc) { items.push({ group: 'Outcome', label: oc[0], keys: 'end outcome hang up ' + oc[0], tile: 'gt--' + ((V.statusDef('lead', oc[1]) || [])[2] || 'neutral'), icon: 'flag', desc: oc[1] ? 'Sets lead status to ' + VF.leadWord(oc[1]) : 'Leaves the lead status unchanged', fn: add('outcome.end', oc[0]) }); }); return; }
      Object.keys(VF.REG).forEach(function (k) { var r = VF.REG[k]; if (r.phase !== p) return; items.push({ group: VF.PHASES[p].name, label: r.name, keys: r.syn.join(' '), tile: VF.PHASES[p].tile, icon: r.icon, desc: r.desc, fn: add(k) }); });
    });
    if (origin && out) items.push({ group: '_', always: true, label: 'Connect to an existing step…', icon: 'corner-down-right', end: 'C', fn: function () { VF.openConnect(origin.stepId, origin.outId, trigger); } });
    openPick(trigger, 'Add step', anchorName ? 'Adds the step after “' + anchorName + '”, already connected. ↑ ↓ choose, Enter adds.' : 'Adds the step where you chose. ↑ ↓ choose, Enter adds.', items, anchorName ? 'Add after “' + anchorName + '”…' : 'Search steps…');
  };

  /* ---------- edge popover: Insert step… · Change target… · Delete connection ---------- */
  VF.openEdgePop = function (stepId, outId, trigger) {
    var s = VF.step(stepId) || { title: '' }, o = (s.outs || []).filter(function (x) { return x.id === outId; })[0], t = o && VF.step(o.to); if (!o) return;
    S.selEdge = stepId + '|' + outId; VF.renderEdges();
    $('#fd-edgepop-t').textContent = (o.label ? o.label + ', to ' : 'To ') + (t ? t.title : '…');
    var ro = !!VF.readOnlyReason();
    $('#fd-edgepop-body').innerHTML = ro ? '<p class="form-note">Read only. Edit connections on a screen at least 1024 px wide.</p>' :
      '<button type="button" class="menu-item" data-a="insert">' + VF.icon('plus') + '<span class="menu-text"><span>Insert step…</span></span></button>' +
      '<button type="button" class="menu-item" data-a="retarget">' + VF.icon('corner-down-right') + '<span class="menu-text"><span>Change target…</span></span><span class="menu-end">' + V.ui.kbd('C') + '</span></button>' +
      '<div class="menu-sep" role="separator"></div><button type="button" class="menu-item menu-item--danger" data-a="delete">' + VF.icon('trash-2') + '<span class="menu-text"><span>Delete connection</span></span><span class="menu-end">' + V.ui.kbd('Delete') + '</span></button>';
    var body = $('#fd-edgepop-body');
    body.onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; var a = b.getAttribute('data-a'); V.popover.close('fd-edgepop'); setTimeout(function () {
      if (a === 'insert') { var ins = { stepId: stepId, outId: outId, between: true }; VF.openInsert(ins, trigger); }
      if (a === 'retarget') VF.openConnect(stepId, outId, trigger);
      if (a === 'delete') VF.disconnect(stepId, outId);
    }, 0); };
    body.onkeydown = function (e) { var l = $$('.menu-item', body), i = l.indexOf(d.activeElement); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); (l[(i + (e.key === 'ArrowDown' ? 1 : -1) + l.length) % l.length] || l[0]).focus(); } };
    V.popover.open(trigger, 'fd-edgepop', { placement: 'right-start', onClose: function () { S.selEdge = null; VF.renderEdges(); } });
  };
  VF.openInsert = function (ins, trigger) {
    var s = VF.step(ins.stepId), o = s.outs.filter(function (x) { return x.id === ins.outId; })[0], t = VF.step(o.to), items = [];
    Object.keys(VF.REG).forEach(function (k) { var r = VF.REG[k]; if (!r.phase || r.phase === 'trigger' || r.phase === 'outcome') return; items.push({ group: VF.PHASES[r.phase].name, label: r.name, keys: r.syn.join(' '), tile: VF.PHASES[r.phase].tile, icon: r.icon, desc: r.desc, fn: function () { VF.addStep(k, { between: { from: ins.stepId, outId: ins.outId } }); } }); });
    openPick(trigger, 'Insert step', 'Inserts between ' + s.title + ' and ' + (t ? t.title : 'its target') + ', connected on both sides.', items, 'Insert between ' + s.title + ' and ' + (t ? t.title : '…') + '…');
  };

  /* ---------- step and canvas menus (ContextMenu, FD1 §10.5) ---------- */
  VF.openStepMenu = function (id, trigger) {
    var s = VF.step(id); if (!s) return; var ro = !!VF.readOnlyReason(), inc = VF.incoming(S.m.steps, id), outs = s.outs.filter(function (o) { return o.to; });
    var lastTrig = VF.phaseOf(s) === 'trigger' && S.m.steps.filter(function (x) { return VF.phaseOf(x) === 'trigger'; }).length === 1;
    var roR = ro ? 'Read only here' : null, items = [
      { label: 'Open', icon: 'square-pen', kbd: 'Enter', fn: function () { VF.select([id]); VF.openInspector(id, { focusLabel: true }); } },
      { label: 'Add step after…', icon: 'plus', kbd: 'A', disabled: roR || (!s.outs.length ? 'An outcome ends the call' : null), fn: function () { var fo = s.outs.filter(function (o) { return !o.to; })[0] || s.outs[0]; VF.openPicker({ stepId: id, outId: fo.id }, trigger); } },
      { label: 'Connect to…', icon: 'corner-down-right', kbd: 'C', disabled: roR || (!s.outs.length ? 'An outcome ends the call' : null), fn: function () { var fo = s.outs.filter(function (o) { return !o.to; })[0] || s.outs[0]; VF.openConnect(id, fo.id, trigger); } },
      { label: 'Move step', icon: 'move', kbd: 'M', disabled: roR, fn: function () { VF.focusStep(id); VF.startMoveMode(S.sel.indexOf(id) >= 0 ? S.sel.slice() : [id]); } },
      { label: 'Duplicate', icon: 'copy', kbd: 'mod+D', disabled: roR, fn: function () { VF.duplicate(S.sel.length ? S.sel : [id]); } },
      { label: 'Copy', icon: 'copy', kbd: 'mod+C', fn: function () { VF.copy(S.sel.length ? S.sel : [id]); } },
      { label: 'Cut', icon: 'copy', kbd: 'mod+X', disabled: roR || (lastTrig ? 'A flow needs a trigger. Add another trigger first.' : null), fn: function () { VF.cut(S.sel.indexOf(id) >= 0 ? S.sel.slice() : [id]); } }
    ];
    /* Add to frame ▸ and Convert to… ▸ (same phase; the Unsupported step’s list for an unknown type), one undo step each. */
    var ids = S.sel.indexOf(id) >= 0 ? S.sel.slice() : [id];
    if (VF.frameMenuItems) { VF.menu('fd-step-frame-sub', 'Add to frame', VF.frameMenuItems(ids), null, { build: true }); items.push({ label: 'Add to frame', icon: 'layout-grid', sub: 'fd-step-frame-sub', disabled: roR, end: VF.icon('chevron-right', 'sm') }); }
    var conv = VF.convertTargets(s);
    VF.menu('fd-step-conv-sub', 'Convert to', conv.map(function (k) { return { label: VF.REG[k].name, icon: VF.REG[k].icon, desc: VF.REG[k].desc, fn: function () { VF.convert(id, k); } }; }), null, { build: true });
    items.push({ label: 'Convert to…', icon: 'refresh-cw', sub: conv.length && !roR ? 'fd-step-conv-sub' : null, disabled: roR || (conv.length ? null : 'No other step type in this phase'), end: conv.length && !roR ? VF.icon('chevron-right', 'sm') : null });
    items.push({ sep: 1 });
    items.push({ label: 'Delete and reconnect', icon: 'trash-2', danger: 1, kbd: 'alt+Delete', disabled: roR || (inc.length === 1 && outs.length === 1 ? null : 'Needs exactly one connection in and one out'), fn: function () { VF.deleteSteps([id], { reconnect: true }); } });
    items.push({ label: 'Delete step', icon: 'trash-2', danger: 1, kbd: 'Delete', disabled: roR || (lastTrig ? 'A flow needs a trigger. Add another trigger first.' : null), fn: function () { VF.deleteSteps(S.sel.indexOf(id) >= 0 ? S.sel.slice() : [id]); } });
    VF.menu('fd-step-menu', 'Step menu: ' + s.title, items, trigger, { onClose: function () { if (!d.querySelector('.is-floating')) setTimeout(function () { if (d.activeElement === d.body) VF.focusStep(id, { reveal: false }); }, 0); } });
  };
  VF.openConvertMenu = function (id, trigger) {
    VF.menu('fd-convert-menu', 'Convert to', ['action.speak', 'action.transfer', 'outcome.end'].map(function (k) { return { label: VF.REG[k].name, icon: VF.REG[k].icon, fn: function () { VF.convert(id, k); } }; }), trigger);
  };
  VF.openCanvasMenu = function (f, e) {
    var a = $('#fd-ctx-anchor'); if (!a) { a = d.createElement('span'); a.id = 'fd-ctx-anchor'; a.className = 'fd-anchor'; a.tabIndex = -1; E.canvas.appendChild(a); }
    var r = E.canvas.getBoundingClientRect(); a.style.left = (e.clientX - r.left) + 'px'; a.style.top = (e.clientY - r.top) + 'px';
    var roR = VF.readOnlyReason() ? 'Read only here' : null;
    VF.menu('fd-canvas-menu', 'Canvas menu', [
      { label: 'Add step here…', icon: 'plus', disabled: roR, fn: function () { VF.openPicker({ at: f }, a); } },
      { label: 'Add note here', icon: 'sticky-note', disabled: roR, fn: function () { if (VF.addNote) VF.addNote({ at: f, edit: true }); } },
      { label: 'Frame selection', icon: 'layout-grid', kbd: 'mod+G', disabled: roR || (S.sel.length ? null : 'Select steps first'), fn: function () { if (VF.frameSelection) VF.frameSelection(S.sel.slice()); } },
      { label: 'Paste here', icon: 'copy', kbd: 'mod+V', disabled: roR || (VF.clip ? null : 'Nothing copied yet'), fn: function () { VF.paste(f); } },
      { label: 'Select all', kbd: 'mod+A', fn: function () { VF.select(S.m.steps.map(function (s) { return s.id; })); } },
      { label: 'Tidy', icon: 'network', disabled: roR || (S.opts.locked ? 'Unlock the canvas to tidy.' : null), fn: function () { VF.tidyAll(); } },
      { label: 'Fit', icon: 'scan', kbd: ['shift', '1'], fn: function () { VF.fit(); } }
    ], a, { placement: 'bottom-start', onClose: function () { setTimeout(function () { if (d.activeElement === a || d.activeElement === d.body) VF.focusStep(S.focus, { reveal: false }); }, 0); } });
  };

  /* ---------- CanvasControls (FD1 §9.1): [− 85% +] · [Fit] · [map] [⋯] ---------- */
  VF.renderControls = function () {
    var old = $('.canvas-ctl', E.canvas); if (old) old.remove();
    var c = d.createElement('div'); c.className = 'canvas-ctl'; var full = S.mode === 'full' || S.mode === 'compact', coarse = V.bp.coarse() && full;
    c.innerHTML = '<div class="canvas-ctl-group" role="group" aria-label="Zoom"><button type="button" data-z="out" aria-label="Zoom out" data-tooltip="Zoom out" data-kbd="-">' + VF.icon('minus', 'sm') + '</button><button type="button" id="fd-zoompct" aria-haspopup="menu" aria-label="Zoom ' + Math.round(S.view.zoom * 100) + ' %, choose a zoom level">' + Math.round(S.view.zoom * 100) + '%</button><button type="button" data-z="in" aria-label="Zoom in" data-tooltip="Zoom in" data-kbd="+">' + VF.icon('plus', 'sm') + '</button></div>' +
      '<div class="canvas-ctl-group"><button type="button" data-z="fit" data-tooltip="Fit the whole flow" data-kbd="shift+1">' + VF.icon('scan', 'sm') + 'Fit</button></div>' +
      (full ? '<div class="canvas-ctl-group">' + (S.mode === 'full' && E.canvas.offsetWidth >= 640 ? '<button type="button" data-z="map" aria-pressed="' + S.opts.minimap + '" aria-label="Minimap" data-tooltip="Minimap">' + VF.icon('map', 'sm') + '</button>' : '') + '<button type="button" id="fd-viewopts" aria-haspopup="menu" aria-label="View options" data-tooltip="View options">' + VF.icon('ellipsis', 'sm') + '</button></div>' : '') +
      (S.opts.locked ? '<div class="canvas-ctl-group"><span class="tag fd-locktag">' + VF.icon('lock', 'xs') + 'Locked</span><button type="button" data-z="unlock">' + VF.icon('lock-open', 'sm') + 'Unlock</button></div>' : '') +
      (coarse && !VF.readOnlyReason() ? '<div class="seg seg--sm fd-touchmode" role="radiogroup" aria-label="Touch mode"><button type="button" role="radio" aria-checked="' + (S.opts.touch === 'navigate') + '" data-value="navigate">Navigate</button><button type="button" role="radio" aria-checked="' + (S.opts.touch === 'arrange') + '" data-value="arrange">Arrange</button></div>' : '');
    E.canvas.appendChild(c); V.initAll(c);
    c.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var z = b.getAttribute('data-z');
      if (z === 'in') VF.zoomBy(1.25); if (z === 'out') VF.zoomBy(0.8); if (z === 'fit') VF.fit();
      if (z === 'map') { S.opts.minimap = !S.opts.minimap; VF.store.set('minimap', S.opts.minimap ? 'on' : 'off'); b.setAttribute('aria-pressed', S.opts.minimap); VF.renderMinimap(); }
      if (z === 'unlock') { S.opts.locked = false; VF.renderControls(); V.announce('Canvas unlocked'); VF.emit('options'); }
      if (b.id === 'fd-zoompct') VF.menu('fd-zoom-menu', 'Zoom level', [50, 75, 100, 150, 200].map(function (p) { return { label: p + ' %', kbd: p === 100 ? ['shift', '0'] : null, fn: function () { VF.zoomTo(p / 100, null, null, { announce: true }); } }; }).concat([{ sep: 1 }, { label: 'Fit flow', kbd: ['shift', '1'], fn: function () { VF.fit(); } }, { label: 'Fit selection', kbd: ['shift', '2'], disabled: S.sel.length ? null : 'Select a step first', fn: function () { VF.fit(S.sel); } }]), b, { placement: 'top-start' });
      if (b.id === 'fd-viewopts') VF.menu('fd-view-menu', 'View options', [
        { label: 'Snap to grid', check: S.opts.snap, fn: function (v) { S.opts.snap = v; } },
        { label: 'Show connection labels', check: S.opts.labels, fn: function (v) { S.opts.labels = v; VF.renderLabels(); } },
        { label: 'Show changes since live', check: S.opts.changes, fn: function (v) { S.opts.changes = v; VF.renderCanvas(); } },
        { label: 'Lock canvas', check: S.opts.locked, fn: function (v) { S.opts.locked = v; VF.renderControls(); VF.emit('options'); V.announce(v ? 'Canvas locked' : 'Canvas unlocked'); } },
        { label: 'Scroll to zoom', check: S.opts.scrollZoom, fn: function (v) { S.opts.scrollZoom = v; } },
        { sep: 1 }, { label: 'Keyboard shortcuts…', kbd: '?', fn: function () { V.shortcuts.openSheet(); } }
      ], b, { placement: 'top-start' });
    });
    c.addEventListener('vaani:change', function (e) { S.opts.touch = e.detail.value; V.announce(e.detail.value === 'arrange' ? 'Arrange. Drag steps to move them.' : 'Navigate. Drag to pan.'); });
  };
  VF.on('view', function () { var b = $('#fd-zoompct'); if (b) { b.textContent = Math.round(S.view.zoom * 100) + '%'; b.setAttribute('aria-label', 'Zoom ' + Math.round(S.view.zoom * 100) + ' %, choose a zoom level'); } });

  /* ---------- FindBar (FD1 §12.2): dims non-matches, walks matches, "#9" jumps to step 9 ---------- */
  var find = { q: '', matches: [], cur: -1, t: null };
  VF.dimSet = function () {
    var dm = null, st = VF.visibleSteps();
    if (find.open && find.q && find.matches.length) { dm = {}; st.forEach(function (s) { if (find.matches.indexOf(s.id) < 0) dm[s.id] = 1; }); }
    else if (S.emph) { dm = {}; st.forEach(function (s) { if (VF.phaseOf(s) !== S.emph) dm[s.id] = 1; }); }
    return dm;
  };
  function matchSteps(q) {
    var n = norm(q.trim()), num = (n.match(/^(?:#|step\s*)?(\d+)$/) || [])[1], out = [];
    if (!n) return out;
    VF.visibleSteps().forEach(function (s) { if (num && s.no === +num) out.unshift(s.id); });
    VF.callOrder(VF.visibleSteps()).order.forEach(function (id) { var s = VF.visibleSteps().filter(function (x) { return x.id === id; })[0]; if (out.indexOf(id) >= 0) return; var hay = norm([s.title, s.f.prompt, s.f.say, s.outs.map(function (o) { return (o.label || '') + ' ' + (o.ex || []).join(' '); }).join(' '), VF.reg(s).name, (VF.reg(s).syn || []).join(' ')].join(' ')); if (hay.indexOf(n) >= 0) out.push(id); });
    return out;
  }
  VF.openFind = function (q) {
    if (VF.unloaded && VF.unloaded()) return;
    var fb = $('.findbar', E.canvas);
    if (!fb) {
      fb = d.createElement('div'); fb.className = 'findbar'; fb.setAttribute('role', 'search'); fb.setAttribute('aria-label', 'Find steps');
      fb.innerHTML = '<div class="input input--sm fd-find-in">' + VF.icon('search', 'sm') + '<input type="text" id="fd-find-q" aria-label="Find steps" placeholder="Find steps…" autocomplete="off" spellcheck="false"></div><span class="count-badge fd-find-n" id="fd-find-n" aria-live="polite"></span>' +
        '<button type="button" class="ibtn ibtn--sm" data-f="prev" aria-label="Previous match" data-kbd="shift+Enter">' + VF.icon('chevron-up', 'sm') + '</button><button type="button" class="ibtn ibtn--sm" data-f="next" aria-label="Next match" data-kbd="Enter">' + VF.icon('chevron-down', 'sm') + '</button><button type="button" class="ibtn ibtn--sm" data-f="close" aria-label="Close Find">' + VF.icon('x', 'sm') + '</button>';
      E.canvas.appendChild(fb); find.open = true;
      var inp = $('#fd-find-q');
      inp.addEventListener('input', function () { clearTimeout(find.t); find.t = setTimeout(function () { run(inp.value, true); }, 300); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(find.t); if (find.q !== inp.value) run(inp.value, true); else walk(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); VF.closeFind(); } });
      fb.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; var a = b.getAttribute('data-f'); if (a === 'close') VF.closeFind(); else walk(a === 'next' ? 1 : -1); });
      VF.emit('panels');
    }
    var i2 = $('#fd-find-q'); if (q != null) { i2.value = q; run(q, true); } i2.focus(); i2.select();
  };
  VF.findQ = function () { return find.open && find.q && find.q.trim() && find.matches.length ? norm(find.q.trim()) : ''; };
  VF.findMatches = function () { return find.open ? find.matches.slice() : []; };
  function run(q, jump) {
    find.q = q; find.matches = matchSteps(q); find.cur = find.matches.length ? 0 : -1;
    var n = $('#fd-find-n'); if (n) n.textContent = !q.trim() ? '' : find.matches.length ? (find.cur + 1) + ' of ' + find.matches.length : 'No matches';
    VF.renderCanvas(); if (jump && find.cur >= 0) show();
  }
  function walk(dir) { if (!find.matches.length) return; find.cur = (find.cur + dir + find.matches.length) % find.matches.length; $('#fd-find-n').textContent = (find.cur + 1) + ' of ' + find.matches.length; show(); }
  function show() { var id = find.matches[find.cur]; if (VF.expandFor && VF.expandFor(id)) VF.renderCanvas(); VF.reveal(id, { minZoom: S.view.zoom < 0.5 ? 0.75 : null }); $$('.node.is-focus', E.nl).forEach(function (n) { n.classList.remove('is-focus'); }); var n = E.nl.querySelector('.node[data-id="' + id + '"]'); if (n) n.classList.add('is-focus'); }
  VF.closeFind = function () { var fb = $('.findbar', E.canvas); var cur = find.matches[find.cur]; if (fb) fb.remove(); find = { q: '', matches: [], cur: -1, t: null }; if (VF.expandFor) VF.expandFor(null); VF.renderCanvas(); VF.emit('panels'); if (cur) VF.focusStep(cur); else if (S.focus) VF.focusStep(S.focus, { reveal: false }); };
  VF.findOpen = function () { return !!find.open && !!$('.findbar', E.canvas); };
})(window, document);
