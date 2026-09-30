/* Vaani Labs prototype · Flow Designer · canvas input (FD1 §6.2, §7.5, §9.1, §10, §11; 06-accessibility §9.6).
   The canvas is one tab stop with a roving tabindex in call order; sockets are reached with ↑/↓ inside a step.
   Drag is always optional: every drag has a keyboard or menu path (Connect to…, A, Alt+Arrow, M). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, E = VF.el, $ = VF.$, $$ = VF.$$;
  var drag = null, pointers = {}, pinch = null, wheelT = null, spaceHeld = false, spacePending = null;
  function single() { return V.shortcuts.enabled(); }
  function nodeEl(id) { return E.nl.querySelector('.node[data-id="' + id + '"]'); }
  function stepOfEl(el) { var n = el && el.closest && el.closest('.node'); return n && !n.classList.contains('fd-ghost') ? VF.step(n.getAttribute('data-id')) || (S.viewing && S.viewing.steps.filter(function (s) { return s.id === n.getAttribute('data-id'); })[0]) : null; }
  function local(e) { var r = E.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function ro() { return !!VF.readOnlyReason(); }
  function canDrag() { return !ro() && !S.opts.locked && !(V.bp.coarse() && S.opts.touch === 'navigate'); }

  /* ---------- roving focus ---------- */
  VF.focusStep = function (id, o) {
    o = o || {}; var n = nodeEl(id) || (VF.repOf && VF.repOf(id) !== id ? nodeEl(VF.repOf(id)) : null); if (!n) return;
    $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; });
    S.focus = id; S.focusX = null; n.tabIndex = 0; n.focus({ preventScroll: true });
    if (o.reveal !== false) VF.reveal(id, o);
  };
  function focusSock(n, k) { $$('.sock[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); n.tabIndex = -1; k.tabIndex = 0; k.focus({ preventScroll: true }); VF.renderLabels(); }
  function layerMates(s) { var steps = VF.visibleSteps(), w0 = VF.width(s); return steps.filter(function (o) { return o.x < s.x + w0 && o.x + VF.width(o) > s.x; }).sort(function (a, b) { return a.y - b.y; }); }

  /* ---------- keyboard (06 §9.6, the only canvas key map) ---------- */
  function onKey(e) {
    if (e.isComposing || e.keyCode === 229) return;
    var t = e.target, n = t.closest && t.closest('.node'); if (!n || n.classList.contains('fd-ghost')) return;
    if (n.classList.contains('fd-fblock')) { if (VF.frameBlockKey) VF.frameBlockKey(e, n); return; }
    var s = stepOfEl(n); if (!s) return;
    var sock = t.matches('.sock[data-out]') ? t : null, k = e.key, mod = V.util.isMac ? e.metaKey : e.ctrlKey, steps = VF.visibleSteps(), by = VF.byId(steps);
    var co = VF.callOrder(steps).order, sgl = single() && !mod && !e.altKey;
    if (S.moveMode) return moveModeKey(e, s);
    function handled() { e.preventDefault(); e.stopPropagation(); }
    if (sock) {
      var list = $$('.sock[data-out]', n), i = list.indexOf(sock), out = s.outs.filter(function (o) { return o.id === sock.getAttribute('data-out'); })[0];
      if (k === 'ArrowDown') { handled(); if (list[i + 1]) focusSock(n, list[i + 1]); return; }
      if (k === 'ArrowUp') { handled(); if (i > 0) focusSock(n, list[i - 1]); else VF.focusStep(s.id); return; }
      if (k === 'Escape') { handled(); VF.focusStep(s.id); return; }
      if (k === 'ArrowRight' && out.to) { handled(); S.arrivedFrom = s.id; VF.focusStep(out.to); return; }
      if (k === 'Enter' || k === ' ' || (sgl && k.toLowerCase() === 'c')) { handled(); if (out.to && k === 'Enter') VF.openEdgePop(s.id, out.id, sock); else VF.openConnect(s.id, out.id, sock); return; }
      if (sgl && k.toLowerCase() === 'a') { handled(); if (!ro()) VF.openPicker({ stepId: s.id, outId: out.id }, sock); return; }
      if ((k === 'Delete' || k === 'Backspace') && out.to) { handled(); VF.disconnect(s.id, out.id); return; }
      return;
    }
    if (k === 'ArrowRight' && !e.altKey) { handled(); var nx = s.outs.filter(function (o) { return by[o.to]; })[0]; if (nx) { S.arrivedFrom = s.id; VF.focusStep(nx.to); } return; }
    if (k === 'ArrowLeft' && !e.altKey) { handled(); var inc = VF.incoming(steps, s.id), back = inc.filter(function (x) { return x.from.id === S.arrivedFrom; })[0] || inc[0]; if (back) VF.focusStep(back.from.id); return; }
    if ((k === 'ArrowDown' || k === 'ArrowUp') && !e.altKey) {
      handled(); var socks = $$('.sock[data-out]', n);
      if (k === 'ArrowDown' && socks.length && VF.reg(s).rows) { focusSock(n, socks[0]); return; }
      var mates = layerMates(s), j = mates.indexOf(s), to = mates[j + (k === 'ArrowDown' ? 1 : -1)];
      if (VF.spatialStep && VF.spatialStep(s, to, k === 'ArrowDown' ? 1 : -1)) return;
      if (to) VF.focusStep(to.id); return;
    }
    if (e.altKey && /^Arrow/.test(k)) { handled(); if (ro()) return VF.explainReadOnly(); var ids = S.sel.indexOf(s.id) >= 0 ? S.sel.slice() : [s.id], st = e.shiftKey ? 64 : 16; VF.moveSteps(ids, k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0, k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0, { coalesce: 'nudge:' + Math.floor(Date.now() / 1000) }); return; }
    if (k === 'Home' || k === 'End') { handled(); VF.focusStep(k === 'Home' ? co[0] : co[co.length - 1]); return; }
    if (k === 'Enter' || k === 'F2') { handled(); VF.select([s.id]); VF.openInspector(s.id, { focusLabel: true }); return; }
    if (k === ' ' && !e.shiftKey) { handled(); if (!spaceHeld) { spaceHeld = true; spacePending = s.id; } return; }
    if (k === ' ' && e.shiftKey) { handled(); VF.toggleSel(s.id); return; }
    if (k === 'Escape') { if (S.sel.length) { handled(); VF.select([]); V.announce('Selection cleared'); } else if (S.emph) { handled(); VF.setEmphasis(null); } return; }
    if (mod && k.toLowerCase() === 'a') { handled(); VF.select(steps.map(function (x) { return x.id; })); return; }
    if (mod && k.toLowerCase() === 'd') { handled(); if (!ro()) VF.duplicate(S.sel.length ? S.sel : [s.id]); return; }
    if (mod && k.toLowerCase() === 'c') { handled(); VF.copy(S.sel.length ? S.sel : [s.id]); return; }
    if (mod && k.toLowerCase() === 'x') { handled(); if (ro()) return VF.explainReadOnly(); VF.cut(S.sel.length ? S.sel.slice() : [s.id]); return; }
    /* ⌘/Ctrl+G frames the selection (or this step); ⌘/Ctrl+Shift+G ungroups its frame (FD1 §11.2, §12.4). */
    if (mod && k.toLowerCase() === 'g') { handled(); if (ro()) return VF.explainReadOnly(); if (e.shiftKey) { var F = VF.frameOf && VF.frameOf(s.id); if (F) VF.ungroupFrame(F.id); else V.announce('This step is not in a frame.'); } else if (VF.frameSelection) VF.frameSelection(S.sel.indexOf(s.id) >= 0 ? S.sel.slice() : [s.id]); return; }
    if (mod && k.toLowerCase() === 'v') { handled(); if (ro()) return VF.explainReadOnly(); VF.paste(null); return; }
    if (k === 'Delete' || k === 'Backspace') { handled(); if (ro()) return VF.explainReadOnly(); VF.deleteSteps(S.sel.indexOf(s.id) >= 0 ? S.sel.slice() : [s.id], { reconnect: e.altKey }); return; }
    if ((e.shiftKey && k === 'F10') || k === 'ContextMenu') { handled(); VF.openStepMenu(s.id, n); return; }
    if (!sgl) return;
    var lk = k.toLowerCase();
    if (lk === 'c' && !e.shiftKey) { handled(); var fo = s.outs.filter(function (o) { return !o.to; })[0] || s.outs[0]; if (!fo) return V.announce('An outcome has no output to connect.'); if (ro()) return VF.explainReadOnly(); var se = n.querySelector('.sock[data-out="' + fo.id + '"]') || n; VF.openConnect(s.id, fo.id, se); return; }
    if (lk === 'a' && !e.shiftKey) { handled(); if (ro()) return VF.explainReadOnly(); var fa = s.outs.filter(function (o) { return !o.to; })[0] || s.outs[0]; VF.openPicker(fa ? { stepId: s.id, outId: fa.id } : null, (fa && n.querySelector('.sock[data-out="' + fa.id + '"]')) || n); return; }
    if (lk === 'm' && !e.shiftKey) { handled(); if (ro()) return VF.explainReadOnly(); startMoveMode(S.sel.indexOf(s.id) >= 0 ? S.sel.slice() : [s.id]); return; }
    if (k === '+' || k === '=') { handled(); VF.zoomBy(1.25); return; }
    if (k === '-' || k === '_') { handled(); VF.zoomBy(0.8); return; }
    if (e.shiftKey && e.code === 'Digit1') { handled(); VF.fit(); return; }
    if (e.shiftKey && e.code === 'Digit2') { handled(); VF.fit(S.sel.length ? S.sel : [s.id]); return; }
    if (e.shiftKey && e.code === 'Digit0') { handled(); VF.zoomTo(1, null, null, { announce: true }); return; }
  }
  function onKeyUp(e) { if (e.key === ' ' && spaceHeld) { spaceHeld = false; if (spacePending) { VF.select([spacePending]); spacePending = null; } } }

  /* Move mode (06 §16.1): the announced, single-pointer and keyboard alternative to dragging. */
  function startMoveMode(ids) { S.moveMode = { ids: ids, orig: ids.map(function (id) { var s = VF.step(id); return { id: id, x: s.x, y: s.y }; }) }; V.announce('Move mode. Arrow keys move ' + (ids.length === 1 ? VF.step(ids[0]).title : ids.length + ' steps') + '. Enter places, Escape cancels.', { politeness: 'assertive' }); VF.emit('movemode'); }
  VF.startMoveMode = startMoveMode;
  function moveModeKey(e, s) {
    var mm = S.moveMode, k = e.key; e.preventDefault(); e.stopPropagation();
    if (/^Arrow/.test(k)) { var st = e.shiftKey ? 64 : 16; mm.ids.forEach(function (id) { var x = VF.step(id); x.x += k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0; x.y += k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0; var n = nodeEl(id); if (n) { n.style.left = x.x + 'px'; n.style.top = x.y + 'px'; } }); VF.renderEdges(); if (VF.layoutFrames) VF.layoutFrames(); VF.reveal(s.id); return; }
    if (k === 'Enter' || k === 'Escape') {
      var cur = mm.ids.map(function (id) { var x = VF.step(id); return { id: id, x: x.x, y: x.y }; });
      mm.orig.forEach(function (o) { var x = VF.step(o.id); x.x = o.x; x.y = o.y; }); S.moveMode = null;
      if (k === 'Enter') { var dx = cur[0].x - mm.orig[0].x, dy = cur[0].y - mm.orig[0].y; if (dx || dy) VF.moveSteps(mm.ids, dx, dy); else VF.renderCanvas(); }
      else { VF.renderCanvas(); V.announce('Move cancelled'); }
      VF.emit('movemode'); VF.focusStep(s.id, { reveal: false });
    }
  }

  /* ---------- pointer ---------- */
  function onDown(e) {
    if (e.button === 2) return;
    var t = e.target, p = local(e);
    pointers[e.pointerId] = p;
    if (Object.keys(pointers).length === 2) { var ks = Object.keys(pointers), a = pointers[ks[0]], b = pointers[ks[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: S.view.zoom, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, tx: S.view.tx, ty: S.view.ty }; drag = null; return; }
    if (t.closest('.minimap, .findbar, .canvas-ctl, .bulk, .fd-empty, .notice, .fd-canvas-top button, .elb, .fd-edge-plus')) return;
    var plus = t.closest('.fd-plus'); if (plus) { e.preventDefault(); var ps = stepOfEl(plus); VF.openPicker({ stepId: ps.id, outId: plus.getAttribute('data-plus') }, plus.parentNode.querySelector('.sock[data-out]') || plus); return; }
    if (t.closest('[data-convert]')) { var cs = stepOfEl(t); VF.openConvertMenu(cs.id, t.closest('[data-convert]')); return; }
    var sock = t.closest('.sock[data-out]'), node = t.closest('.node'), edge = t.closest('[data-edge]');
    if (VF.stopAnim) VF.stopAnim();
    E.canvas.setPointerCapture && E.canvas.setPointerCapture(e.pointerId);
    if (sock && node) { var s = stepOfEl(node); drag = { kind: 'sock', s: s, out: sock.getAttribute('data-out'), el: sock, start: p, moved: false }; e.preventDefault(); return; }
    if (node && !node.classList.contains('fd-ghost')) {
      var st = stepOfEl(node); if (!st) return;
      var mod = e.shiftKey || e.ctrlKey || e.metaKey;
      if (mod) { VF.toggleSel(st.id); drag = null; } else if (S.sel.indexOf(st.id) < 0) VF.select([st.id]);
      S.focus = st.id; if (!mod) VF.focusStep(st.id, { reveal: false });
      if (!mod && (canDrag() && !spaceHeld)) drag = { kind: 'move', ids: S.sel.slice(), start: p, moved: false, orig: S.sel.map(function (id) { var x = VF.step(id); return { id: id, x: x.x, y: x.y }; }), primary: st.id };
      else if (!mod) drag = { kind: 'pan', start: p, tx: S.view.tx, ty: S.view.ty, moved: false, click: st.id };
      e.preventDefault(); return;
    }
    if (edge) { drag = { kind: 'edge', key: edge.getAttribute('data-edge'), start: p }; return; }
    var marquee = e.shiftKey || (V.bp.coarse() && S.opts.touch === 'arrange' && !ro());
    drag = marquee ? { kind: 'marquee', start: p, moved: false, add: e.shiftKey } : { kind: 'pan', start: p, tx: S.view.tx, ty: S.view.ty, moved: false };
  }
  function onMove(e) {
    var p = local(e); if (pointers[e.pointerId]) pointers[e.pointerId] = p;
    if (pinch && Object.keys(pointers).length === 2) { var ks = Object.keys(pointers), a = pointers[ks[0]], b = pointers[ks[1]], dd = Math.hypot(a.x - b.x, a.y - b.y), z = Math.max(0.25, Math.min(2, pinch.z * dd / pinch.d)), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; var fx = (pinch.cx - pinch.tx) / pinch.z, fy = (pinch.cy - pinch.ty) / pinch.z; S.view.zoom = z; S.view.tx = cx - fx * z; S.view.ty = cy - fy * z; VF.applyView(); VF.userMoved = true; return; }
    if (!drag) { hoverEdge(e); return; }
    var dx = p.x - drag.start.x, dy = p.y - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    if (drag.kind === 'pan') { S.view.tx = drag.tx + dx; S.view.ty = drag.ty + dy; VF.applyView(); VF.userMoved = true; E.canvas.classList.add('fd-panning'); return; }
    if (drag.kind === 'move') { moveDrag(drag, dx, dy, e.altKey); autoPan(p); return; }
    if (drag.kind === 'sock') { if (ro() || S.opts.locked) return; connectDrag(drag, p, e); autoPan(p); return; }
    if (drag.kind === 'marquee') { marqueeDrag(drag, p); }
  }
  function onUp(e) {
    delete pointers[e.pointerId]; if (pinch) { if (Object.keys(pointers).length < 2) { pinch = null; VF.applyView(true); VF.saveViewport(); } return; }
    var g = drag; drag = null; E.canvas.classList.remove('fd-panning'); clearGuides(); if (!g) return;
    if (g.kind === 'pan') { if (g.moved) { VF.saveViewport(); } else if (g.click) VF.select([g.click]); else if (!e.target.closest('.node')) { VF.select([]); S.selEdge = null; VF.renderEdges(); } return; }
    if (g.kind === 'move') {
      if (!g.moved) { if (!e.shiftKey && !e.ctrlKey && !e.metaKey) VF.select([g.primary]); return; }
      var first = g.orig[0], s0 = VF.step(first.id), dx = s0.x - first.x, dy = s0.y - first.y;
      g.orig.forEach(function (o) { var s = VF.step(o.id); s.x = o.x; s.y = o.y; });
      if (VF.frameTarget) VF.frameTarget(null);
      var mkey = 'drag:' + Date.now(); VF.moveSteps(g.ids, dx, dy, { coalesce: mkey }); if (VF.frameDrop) VF.frameDrop(g.ids, mkey); return;
    }
    if (g.kind === 'sock') {
      removeGhost(); var out = g.s.outs.filter(function (o) { return o.id === g.out; })[0];
      if (!g.moved) { if (out && out.to) VF.openEdgePop(g.s.id, g.out, g.el); else if (!ro()) VF.openConnect(g.s.id, g.out, g.el); else VF.explainReadOnly(); return; }
      if (ro() || S.opts.locked) return;
      var tgt = targetAt(e); if (tgt && tgt.id !== g.s.id && VF.phaseOf(tgt) !== 'trigger') { VF.connect(g.s.id, g.out, tgt.id); return; }
      if (!tgt) { var f = VF.toFlow(local(e).x, local(e).y); VF.openPicker({ stepId: g.s.id, outId: g.out, at: f }, g.el); }
      return;
    }
    if (g.kind === 'edge') { var parts = g.key.split('|'), se = d.querySelector('.node[data-id="' + parts[0] + '"] .sock[data-out="' + parts[1] + '"]'); S.selEdge = g.key; VF.renderEdges(); VF.openEdgePop(parts[0], parts[1], se, { point: e }); return; }
    if (g.kind === 'marquee') { var mq = $('.fd-marquee', E.canvas); if (mq) mq.remove(); if (g.hits) { var ids = g.add ? S.sel.concat(g.hits.filter(function (x) { return S.sel.indexOf(x) < 0; })) : g.hits; VF.select(ids); } }
  }
  function moveDrag(g, dx, dy, alt) {
    var z = S.view.zoom, fdx = dx / z, fdy = dy / z, prim = g.orig.filter(function (o) { return o.id === g.primary; })[0], s = VF.step(g.primary);
    var nx = prim.x + fdx, ny = prim.y + fdy;
    if (!alt && S.opts.snap) { nx = Math.round(nx / 16) * 16; ny = Math.round(ny / 16) * 16; }
    var gu = alt ? null : guides(s, nx, ny); if (gu) { nx = gu.x; ny = gu.y; }
    var ddx = nx - prim.x, ddy = ny - prim.y;
    g.orig.forEach(function (o) { var x = VF.step(o.id); x.x = o.x + ddx; x.y = o.y + ddy; var n = nodeEl(o.id); if (n) { n.style.left = x.x + 'px'; n.style.top = x.y + 'px'; n.classList.add('fd-dragging'); } });
    VF.renderEdges(); drawGuides(gu); if (VF.layoutFrames) VF.layoutFrames(); if (VF.frameTarget) VF.frameTarget(g.ids);
  }
  /* Alignment guides (FD1 §10.4): left, centre, right, top, middle, bottom within 4 screen px; guides beat the grid. */
  function guides(s, x, y) {
    var g = VF.geom(s.id) || { w: VF.width(s), h: 100 }, tol = 4 / S.view.zoom, best = { x: null, y: null }, lines = [];
    VF.visibleSteps().forEach(function (o) {
      if (S.sel.indexOf(o.id) >= 0 || o.id === s.id) return; var og = VF.geom(o.id); if (!og) return;
      [[x, o.x], [x + g.w / 2, o.x + og.w / 2], [x + g.w, o.x + og.w]].forEach(function (pp, i) { var dd = Math.abs(pp[0] - pp[1]); if (dd < tol && (best.x == null || dd < best.dx)) { best.x = x + pp[1] - pp[0]; best.dx = dd; best.vx = pp[1]; } void i; });
      [[y, o.y], [y + g.h / 2, o.y + og.h / 2], [y + g.h, o.y + og.h]].forEach(function (pp) { var dd = Math.abs(pp[0] - pp[1]); if (dd < tol && (best.y == null || dd < best.dy)) { best.y = y + pp[1] - pp[0]; best.dy = dd; best.hy = pp[1]; } });
    });
    if (best.x == null && best.y == null) return null;
    if (best.vx != null) lines.push({ v: best.vx }); if (best.hy != null) lines.push({ h: best.hy });
    return { x: best.x != null ? best.x : x, y: best.y != null ? best.y : y, lines: lines };
  }
  function drawGuides(gu) {
    var sv = $('.fd-guides', E.canvas); if (!gu) { if (sv) sv.innerHTML = ''; return; }
    if (!sv) { sv = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'fd-guides'); sv.setAttribute('aria-hidden', 'true'); E.canvas.appendChild(sv); }
    var r = E.canvas.getBoundingClientRect();
    sv.innerHTML = gu.lines.map(function (l) { if (l.v != null) { var x = VF.toScreen(l.v, 0).x; return '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + r.height + '"/>'; } var y = VF.toScreen(0, l.h).y; return '<line x1="0" y1="' + y + '" x2="' + r.width + '" y2="' + y + '"/>'; }).join('');
  }
  function clearGuides() { var sv = $('.fd-guides', E.canvas); if (sv) sv.innerHTML = ''; $$('.fd-dragging', E.nl).forEach(function (n) { n.classList.remove('fd-dragging'); }); }
  function autoPan(p) { var r = E.canvas.getBoundingClientRect(), dx = p.x < 48 ? 8 : p.x > r.width - 48 ? -8 : 0, dy = p.y < 48 ? 8 : p.y > r.height - 48 ? -8 : 0; if (dx || dy) { S.view.tx += dx; S.view.ty += dy; VF.applyView(); } }
  function targetAt(e) { var el = d.elementFromPoint(e.clientX, e.clientY), n = el && el.closest && el.closest('.node'); return n && E.nl.contains(n) ? stepOfEl(n) : null; }
  function connectDrag(g, p, e) {
    var sv = $('.fd-ghostline', E.canvas); if (!sv) { sv = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'fd-ghostline'); sv.setAttribute('aria-hidden', 'true'); E.canvas.appendChild(sv); }
    var geo = VF.geom(g.s.id), a = VF.toScreen(g.s.x + geo.w, g.s.y + (geo.outs[g.out] || 42)), tgt = targetAt(e);
    $$('.fd-drop', E.nl).forEach(function (n) { n.classList.remove('fd-drop', 'fd-nodrop'); });
    if (tgt && tgt.id !== g.s.id) { var tn = nodeEl(tgt.id); tn.classList.add(VF.phaseOf(tgt) === 'trigger' ? 'fd-nodrop' : 'fd-drop'); }
    sv.innerHTML = '<path class="fe fe--ghost" d="M' + a.x + ' ' + a.y + ' C' + (a.x + 60) + ' ' + a.y + ' ' + (p.x - 60) + ' ' + p.y + ' ' + p.x + ' ' + p.y + '"/>';
  }
  function removeGhost() { var sv = $('.fd-ghostline', E.canvas); if (sv) sv.remove(); $$('.fd-drop, .fd-nodrop', E.nl).forEach(function (n) { n.classList.remove('fd-drop', 'fd-nodrop'); }); }
  function marqueeDrag(g, p) {
    var mq = $('.fd-marquee', E.canvas); if (!mq) { mq = d.createElement('div'); mq.className = 'fd-marquee'; mq.setAttribute('aria-hidden', 'true'); E.canvas.appendChild(mq); }
    var x1 = Math.min(g.start.x, p.x), y1 = Math.min(g.start.y, p.y), x2 = Math.max(g.start.x, p.x), y2 = Math.max(g.start.y, p.y);
    mq.style.left = x1 + 'px'; mq.style.top = y1 + 'px'; mq.style.width = (x2 - x1) + 'px'; mq.style.height = (y2 - y1) + 'px';
    var a = VF.toFlow(x1, y1), b = VF.toFlow(x2, y2);
    g.hits = VF.visibleSteps().filter(function (s) { var gg = VF.geom(s.id) || { w: VF.width(s), h: 100 }; return s.x < b.x && s.x + gg.w > a.x && s.y < b.y && s.y + gg.h > a.y; }).map(function (s) { return s.id; });
  }
  var hoverKey = null, hoverT = null;
  function hoverEdge(e) {
    var h = e.target.closest && e.target.closest('.fd-ehit'), key = h ? h.getAttribute('data-edge') : null;
    if (key === hoverKey) return; hoverKey = key; clearTimeout(hoverT);
    $$('.fe--hover', E.nl).forEach(function (p) { p.classList.remove('fe--hover'); });
    if (key) { var line = E.nl.querySelector('.fe[data-edge="' + key + '"]'); if (line) line.classList.add('fe--hover'); var ed = VF.edges.filter(function (x) { return x.key === key; })[0]; if (ed) h.setAttribute('data-tooltip', ed.from.title + (ed.label ? ', ' + (VF.reg(ed.from).rows === 'results' ? 'result ' : 'answer ') + ed.label : '') + ', to ' + ed.to.title); }
    S.hoverEdge = key; hoverT = setTimeout(VF.renderLabels, key ? 0 : 150);
  }
  function onWheel(e) {
    e.preventDefault(); if (VF.stopAnim) VF.stopAnim(); var p = local(e), zoomIt = e.ctrlKey || e.metaKey || S.opts.scrollZoom;
    if (zoomIt) { var f = Math.exp(-e.deltaY * (e.ctrlKey && !S.opts.scrollZoom ? 0.01 : 0.002)), z = Math.max(0.25, Math.min(2, S.view.zoom * f)), v = S.view, fx = (p.x - v.tx) / v.zoom, fy = (p.y - v.ty) / v.zoom; v.zoom = z; v.tx = p.x - fx * z; v.ty = p.y - fy * z; }
    else { S.view.tx -= e.shiftKey ? e.deltaY : e.deltaX; S.view.ty -= e.shiftKey ? 0 : e.deltaY; }
    VF.userMoved = true; VF.applyView();
    clearTimeout(wheelT); wheelT = setTimeout(function () { VF.applyView(true); VF.saveViewport(); }, 150);
  }
  function onContext(e) {
    var n = e.target.closest('.node'); e.preventDefault();
    if (n && !n.classList.contains('fd-ghost')) { var s = stepOfEl(n); if (S.sel.indexOf(s.id) < 0) VF.select([s.id]); VF.openStepMenu(s.id, n); return; }
    VF.openCanvasMenu(VF.toFlow(local(e).x, local(e).y), e);
  }

  /* Palette drops (FD1 §8.1): onto a connection inserts, onto a free socket connects, elsewhere lands where dropped. */
  VF.dropAt = function (cx, cy, type, preset) {
    var el = d.elementFromPoint(cx, cy), r = E.canvas.getBoundingClientRect();
    if (!el || !E.canvas.contains(el)) return false;
    var hitEdge = el.closest('[data-edge]'), sock = el.closest('.sock[data-out]'), f = VF.toFlow(cx - r.left, cy - r.top);
    if (hitEdge) { var k = hitEdge.getAttribute('data-edge').split('|'); VF.addStep(type, { preset: preset, between: { from: k[0], outId: k[1] }, method: 'drop_on_edge' }); return true; }
    if (sock) { var s = stepOfEl(sock); var o = s.outs.filter(function (q) { return q.id === sock.getAttribute('data-out'); })[0]; if (o && !o.to) { VF.addStep(type, { preset: preset, from: { stepId: s.id, outId: o.id } }); return true; } }
    VF.addStep(type, { preset: preset, at: { x: f.x - 100, y: f.y - 30 } }); return true;
  };
  VF.dropHint = function (cx, cy) {
    var el = d.elementFromPoint(cx, cy); $$('.fe--active.fd-hint', E.nl).forEach(function (p) { p.classList.remove('fe--active', 'fd-hint'); });
    var hitEdge = el && el.closest && el.closest('[data-edge]'); if (!hitEdge || !E.canvas.contains(hitEdge)) return null;
    var key = hitEdge.getAttribute('data-edge'), line = E.nl.querySelector('.fe[data-edge="' + key + '"]'); if (line) line.classList.add('fe--active', 'fd-hint');
    var ed = VF.edges.filter(function (x) { return x.key === key; })[0]; return ed ? 'Insert between ' + ed.from.title + ' and ' + ed.to.title : null;
  };

  VF.inputInit = function () {
    var c = E.canvas;
    c.addEventListener('keydown', onKey); c.addEventListener('keyup', onKeyUp);
    c.addEventListener('pointerdown', onDown); c.addEventListener('pointermove', onMove); c.addEventListener('pointerup', onUp); c.addEventListener('pointercancel', onUp);
    c.addEventListener('wheel', onWheel, { passive: false }); c.addEventListener('contextmenu', onContext);
    c.addEventListener('dblclick', function (e) { var n = e.target.closest('.node'); if (n && !n.classList.contains('fd-ghost')) VF.openInspector(n.getAttribute('data-id'), { focusLabel: true }); });
    c.addEventListener('focusin', function (e) {
      var n = e.target.closest && e.target.closest('.node'); if (n) { n.classList.remove('node--dim'); if (e.target === n && !n.classList.contains('fd-fblock')) { S.focus = n.getAttribute('data-id'); VF.emit('focusstep', S.focus); } }
      if (e.target.matches && e.target.matches('.sock[data-out]')) VF.renderLabels();
    });
    c.addEventListener('focusout', function () { setTimeout(function () { if (!c.contains(d.activeElement)) VF.renderLabels(); }, 0); });
    c.addEventListener('pointerover', function (e) { var n = e.target.closest && e.target.closest('.node--dim'); if (n) { n.classList.remove('node--dim'); n.setAttribute('data-undim', ''); } });
    c.addEventListener('pointerout', function (e) { var n = e.target.closest && e.target.closest('[data-undim]'); if (n && !n.contains(e.relatedTarget) && d.activeElement !== n) { n.classList.add('node--dim'); n.removeAttribute('data-undim'); } });
  };
})(window, document);
