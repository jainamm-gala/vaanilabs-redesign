/* Vaani Labs prototype · Flow Designer · frames and notes: keyboard, pointer and menus (FD1 §10.5, §11.1, §12.4, §12.5).
   Roving order: a frame’s header comes before its members (↑ from the top member reaches it, ↓ from it enters the frame);
   notes are reached with ↑ / ↓ from the steps above and below them. Enter toggles a frame or edits a note; Shift+F10 opens
   their menus; Ctrl/⌘+G frames the selection and Ctrl/⌘+Shift+G ungroups. Every pointer path has a key or menu path. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, E = VF.el, $ = VF.$, $$ = VF.$$;
  function isMod(e) { return V.util.isMac ? e.metaKey : e.ctrlKey; }
  function plural(n, w1) { return n + ' ' + w1 + (n === 1 ? '' : 's'); }
  function boxOf(s) { var g = VF.geom(s.id); return { x: s.x, y: s.y, w: g ? g.w : VF.width(s), h: g ? g.h : VF.estimate(s).h }; }
  function topMember(f) { return f.members.map(VF.step).filter(Boolean).sort(function (a, b) { return a.y - b.y || a.x - b.x; })[0] || null; }
  function co() { return VF.callOrder(VF.visibleSteps()).order; }
  function roveSock(n, k) { $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); n.tabIndex = -1; k.tabIndex = 0; k.focus({ preventScroll: true }); }
  function focusBlock(n) { $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); n.tabIndex = 0; n.focus({ preventScroll: true }); }
  /* The step (or frame block) an exit key leads to. */
  function goRep(rep) { if (rep.indexOf('frame:') === 0) { var f = VF.frameById(rep.slice(6)), m = f && topMember(f); if (m) VF.focusStep(m.id); } else VF.focusStep(rep); }

  /* ---------- menus ---------- */
  VF.openFrameMenu = function (fid, trigger) {
    var f = VF.frameById(fid); if (!f) return; var roR = VF.readOnlyReason() ? 'Read only here' : null, col = VF.isCollapsed(f), ms = f.members.filter(VF.step);
    var trig = S.m.steps.filter(function (s) { return VF.phaseOf(s) === 'trigger'; }), allTrig = trig.length && trig.every(function (t) { return ms.indexOf(t.id) >= 0; });
    /* A single choice that closes the menu: plain items, the current colour marked with a check and "Current". */
    VF.menu('fd-frame-tint', 'Colour', VF.FRAME_TINTS.map(function (t) { var cur = (f.tint || null) === t[0]; return { label: t[1], icon: cur ? 'check' : 'circle-dashed', desc: cur ? 'Current' : null, fn: function () { if (!cur) VF.setFrameTint(fid, t[0]); } }; }), null, { build: true });
    VF.menu('fd-frame-menu', 'Frame menu: ' + f.title, [
      { label: 'Rename', icon: 'pencil', kbd: 'F2', disabled: roR, fn: function () { VF.renameFrame(fid); } },
      { label: 'Colour', icon: 'layout-grid', sub: roR ? null : 'fd-frame-tint', disabled: roR, end: roR ? null : VF.icon('chevron-right', 'sm') },
      { label: col ? 'Expand' : 'Collapse', icon: col ? 'chevron-right' : 'chevron-down', kbd: 'Enter', fn: function () { VF.toggleFrame(fid); } },
      { label: 'Ungroup', icon: 'unlink', kbd: 'mod+shift+G', disabled: roR, fn: function () { VF.ungroupFrame(fid); } },
      { sep: 1 },
      { label: 'Delete frame (keeps steps)', icon: 'trash-2', danger: 1, disabled: roR, fn: function () { VF.ungroupFrame(fid, { toast: true, label: 'delete frame ' + f.title }); } },
      { label: 'Delete frame and ' + plural(ms.length, 'step'), icon: 'trash-2', danger: 1, disabled: roR || (allTrig ? 'A flow needs a trigger. Add another trigger first.' : null), fn: function () { VF.deleteSteps(ms.map(function (s) { return s.id; })); } }
    ], trigger, { placement: 'bottom-start', onClose: function () { setTimeout(function () { if (d.activeElement === d.body && !d.querySelector('.is-floating')) { if (!VF.focusFrameHeader(fid)) { var b = E.nl.querySelector('.node[data-id="frame:' + fid + '"]'); if (b) focusBlock(b); } } }, 0); } });
  };
  /* "Add to frame ▸" in the step menu. */
  VF.frameMenuItems = function (ids) {
    var cur = VF.frameOf(ids[0]), list = VF.frames().filter(function (f) { return f !== cur; }).map(function (f) { return { label: f.title, icon: 'layout-grid', fn: function () { VF.addToFrame(ids, f.id); } }; });
    if (list.length) list.push({ sep: 1 });
    list.push({ label: 'New frame', icon: 'plus', kbd: 'mod+G', fn: function () { VF.frameSelection(ids); } });
    if (cur) list.push({ label: 'Remove from ' + cur.title, icon: 'unlink', fn: function () { VF.removeFromFrame(ids); } });
    return list;
  };
  VF.openNoteMenu = function (id, trigger) {
    var n = VF.noteById(id); if (!n) return; var roR = VF.readOnlyReason() ? 'Read only here' : null, pin = n.pin && VF.step(n.pin);
    VF.menu('fd-note-menu', 'Note menu', [
      { label: 'Edit', icon: 'pencil', kbd: 'Enter', disabled: roR, fn: function () { VF.editNote(id); } },
      { label: 'Duplicate', icon: 'copy', kbd: 'mod+D', disabled: roR, fn: function () { VF.duplicateNote(id); } }
    ].concat(pin ? [{ label: 'Pinned to step ' + pin.no + ' · Unpin', icon: 'unlink', disabled: roR, fn: function () { var p = VF.noteXY(n); VF.act('unpin note', function () { n.x = p.x; n.y = p.y; n.pin = null; }, { keepTest: true }); V.announce('Note unpinned'); VF.focusNote(id); } }] : []).concat([
      { sep: 1 }, { label: 'Delete', icon: 'trash-2', danger: 1, kbd: 'Delete', disabled: roR, fn: function () { VF.deleteNote(id); } }
    ]), trigger, { placement: 'bottom-start', onClose: function () { setTimeout(function () { if (d.activeElement === d.body && !d.querySelector('.is-floating')) VF.focusNote(id); }, 0); } });
  };

  /* ---------- keyboard ---------- */
  /* ↑ / ↓ between steps also visit frame headers and notes (FD1 §11.1 roving order). Returns true when it moved focus. */
  VF.spatialStep = function (s, to, dir) {
    var F = VF.frameOf(s.id); if (F && VF.isCollapsed(F)) F = null;
    if (dir < 0 && F && (!to || VF.frameOf(to.id) !== F)) { if (VF.focusFrameHeader(F.id)) return true; }
    var b = boxOf(s), limit = to ? to.y : (dir > 0 ? Infinity : -Infinity), best = null;
    VF.notes().forEach(function (n) { if (n.pin && VF.repOf(n.pin) !== n.pin) return; var p = VF.noteXY(n), nw = n.w || 220; if (p.x >= b.x + b.w || p.x + nw <= b.x) return; var ok = dir > 0 ? p.y > b.y && p.y < limit : p.y < b.y && p.y > limit; if (ok && (!best || Math.abs(p.y - b.y) < Math.abs(best.y - b.y))) best = { id: n.id, y: p.y }; });
    if (best && VF.focusNote(best.id)) return true;
    var G = to && VF.frameOf(to.id); if (dir > 0 && G && G !== VF.frameOf(s.id) && !VF.isCollapsed(G) && topMember(G) === to) { if (VF.focusFrameHeader(G.id)) return true; }
    return false;
  };
  function stepNear(x1, x2, y, dir, skipFrame) {
    var best = null; VF.visibleSteps().forEach(function (s) { if (skipFrame && VF.frameOf(s.id) === skipFrame) return; var b = boxOf(s); if (b.x >= x2 || b.x + b.w <= x1) return; var ok = dir > 0 ? b.y > y : b.y + b.h < y; if (ok && (!best || Math.abs(b.y - y) < Math.abs(best.y - y))) best = { id: s.id, y: b.y }; });
    return best && best.id;
  }
  function headerKey(e, btn) {
    var fr = btn.closest('[data-frame]'), fid = fr.getAttribute('data-frame'), f = VF.frameById(fid), k = e.key; if (!f) return;
    function pd() { e.preventDefault(); e.stopPropagation(); }
    if (k === 'ArrowRight' || k === 'ArrowLeft') { pd(); var other = fr.querySelector('[data-fr="' + (btn.getAttribute('data-fr') === 'toggle' ? 'menu' : 'toggle') + '"]'); if (other) VF.roveTo(other, { reveal: false }); return; }
    if (k === 'ArrowDown' || k === 'Escape') { pd(); var m = topMember(f); if (m) VF.focusStep(m.id); return; }
    if (k === 'ArrowUp') { pd(); var r = VF.frameRect(f), up = r && stepNear(r.x, r.x + r.w, r.y, -1, f); if (up) VF.focusStep(up); return; }
    if (k === 'Home' || k === 'End') { pd(); var o = co(); VF.focusStep(k === 'Home' ? o[0] : o[o.length - 1]); return; }
    if ((e.shiftKey && k === 'F10') || k === 'ContextMenu') { pd(); VF.openFrameMenu(fid, btn); return; }
    if (k === 'F2') { pd(); if (VF.readOnlyReason()) return VF.explainReadOnly(); VF.renameFrame(fid); return; }
    if (isMod(e) && e.shiftKey && k.toLowerCase() === 'g') { pd(); VF.ungroupFrame(fid); return; }
    if (k === 'Delete' || k === 'Backspace') { pd(); V.announce('To delete a frame, open its menu with Shift F10.'); }
  }
  function noteKey(e, el) {
    var id = el.getAttribute('data-note'), n = VF.noteById(id), k = e.key; if (!n) return;
    function pd() { e.preventDefault(); e.stopPropagation(); }
    var p = VF.noteXY(n), nw = n.w || 220;
    if (k === 'Enter' || k === 'F2') { pd(); if (VF.readOnlyReason()) return VF.explainReadOnly(); VF.editNote(id); return; }
    if (k === 'Delete' || k === 'Backspace') { pd(); VF.deleteNote(id); return; }
    if ((e.shiftKey && k === 'F10') || k === 'ContextMenu') { pd(); VF.openNoteMenu(id, el); return; }
    if (e.altKey && /^Arrow/.test(k)) { pd(); var st = e.shiftKey ? 64 : 16; VF.moveNote(id, k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0, k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0, { coalesce: 'nudge-note:' + Math.floor(Date.now() / 1000) }); return; }
    if (k === 'ArrowUp' || k === 'ArrowDown') { pd(); var to = k === 'ArrowUp' && n.pin && VF.step(n.pin) ? n.pin : stepNear(p.x, p.x + nw, k === 'ArrowUp' ? p.y : p.y + el.offsetHeight, k === 'ArrowUp' ? -1 : 1); if (to) VF.focusStep(to); return; }
    if (k === 'Escape') { pd(); var back = n.pin && VF.step(n.pin) ? n.pin : S.focus; if (back) VF.focusStep(back); return; }
    if (k === 'Home' || k === 'End') { pd(); var o = co(); VF.focusStep(k === 'Home' ? o[0] : o[o.length - 1]); return; }
    if (isMod(e) && k.toLowerCase() === 'd') { pd(); VF.duplicateNote(id); }
  }
  /* A collapsed frame’s block: Enter expands; → follows its first exit, ← its first way in; ↓ walks its exits. */
  VF.frameBlockKey = function (e, n) {
    var fid = n.getAttribute('data-frame-block'), f = VF.frameById(fid), k = e.key, t = e.target; if (!f) return;
    function pd() { e.preventDefault(); e.stopPropagation(); }
    var set = {}; f.members.forEach(function (id) { set[id] = 1; });
    if (t.matches('.sock[data-out]')) {
      var list = $$('.sock[data-out]', n), i = list.indexOf(t);
      if (k === 'ArrowDown') { pd(); if (list[i + 1]) roveSock(n, list[i + 1]); return; }
      if (k === 'ArrowUp') { pd(); if (i > 0) roveSock(n, list[i - 1]); else focusBlock(n); return; }
      if (k === 'Escape') { pd(); focusBlock(n); return; }
      if (k === 'Enter' || k === ' ' || k === 'ArrowRight') { pd(); goRep(t.getAttribute('data-out').slice(3)); return; }
      return;
    }
    if (k === 'Enter' || k === ' ') { pd(); VF.toggleFrame(fid, false); return; }
    if (k === 'ArrowDown') { pd(); var s0 = n.querySelector('.sock[data-out]'); if (s0) roveSock(n, s0); return; }
    if (k === 'ArrowRight') { pd(); var x = n.querySelector('.sock[data-out]'); if (x) goRep(x.getAttribute('data-out').slice(3)); return; }
    if (k === 'ArrowLeft') { pd(); var inc = null; S.m.steps.forEach(function (s) { if (!inc && !set[s.id] && s.outs.some(function (o) { return set[o.to]; })) inc = s; }); if (inc) VF.focusStep(inc.id); return; }
    if (k === 'ArrowUp') { pd(); var b = VF.drawnBox('frame:' + fid), up = b && stepNear(b.x, b.x + b.w, b.y, -1, f); if (up) VF.focusStep(up); return; }
    if (k === 'Home' || k === 'End') { pd(); var o = co(); VF.focusStep(k === 'Home' ? o[0] : o[o.length - 1]); return; }
    if ((e.shiftKey && k === 'F10') || k === 'ContextMenu') { pd(); VF.openFrameMenu(fid, n); return; }
    if (isMod(e) && e.shiftKey && k.toLowerCase() === 'g') { pd(); VF.ungroupFrame(fid); return; }
    if (k === 'Escape' && S.sel.length) { pd(); VF.select([]); V.announce('Selection cleared'); return; }
    if (k === '+' || k === '=') { pd(); VF.zoomBy(1.25); } else if (k === '-' || k === '_') { pd(); VF.zoomBy(0.8); } else if (e.shiftKey && e.code === 'Digit1') { pd(); VF.fit(); }
  };
  function onKey(e) {
    if (e.isComposing) return; var t = e.target;
    if (t.id === 'fd-frame-in') { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); VF.commitFrameRename(true); } else if (e.key === 'Escape') { e.preventDefault(); VF.commitFrameRename(false); } return; }
    if (t.id === 'fd-note-ta') { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); VF.commitNote(false); } else if (e.key === 'Enter' && isMod(e)) { e.preventDefault(); VF.commitNote(true); } return; }
    var fr = t.closest && t.closest('[data-fr]'); if (fr && !t.matches('input')) return headerKey(e, fr);
    if (t.matches && t.matches('[data-note]')) return noteKey(e, t);
  }

  /* ---------- pointer: drag a frame by its header, drag a note, pan over a collapsed block ---------- */
  var drag = null;
  function local(e) { var r = E.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function onDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    var t = e.target, head = t.closest('[data-fr-head]'), note = t.closest('[data-note]'), block = t.closest('.fd-fblock');
    if (!head && !note && !block) return;
    e.stopPropagation(); if (VF.stopAnim) VF.stopAnim();
    if (t.closest('button, a, input, textarea')) { if (block && t.matches('.sock[data-out]')) drag = { kind: 'exit', el: t, start: local(e) }; return; }
    var ro = !!VF.readOnlyReason() || S.opts.locked || (V.bp.coarse() && S.opts.touch === 'navigate'), p = local(e);
    if (head && !ro) { var f = VF.frameById(head.closest('[data-frame]').getAttribute('data-frame')), ids = f.members.filter(VF.step); drag = { kind: 'frame', f: f, ids: ids, orig: ids.map(function (id) { var s = VF.step(id); return { id: id, x: s.x, y: s.y }; }), start: p, moved: false, head: head }; }
    else if (note && !ro) drag = { kind: 'note', id: note.getAttribute('data-note'), el: note, x0: parseFloat(note.style.left), y0: parseFloat(note.style.top), start: p, moved: false };
    else drag = { kind: 'pan', start: p, tx: S.view.tx, ty: S.view.ty, moved: false, el: note || block || head };
    try { E.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    e.preventDefault();
  }
  function onMove(e) {
    if (!drag || drag.kind === 'exit') return; var p = local(e), dx = p.x - drag.start.x, dy = p.y - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return; drag.moved = true; e.stopPropagation();
    var z = S.view.zoom, fx = Math.round(dx / z / 16) * 16, fy = Math.round(dy / z / 16) * 16;
    if (drag.kind === 'pan') { S.view.tx = drag.tx + dx; S.view.ty = drag.ty + dy; VF.applyView(); VF.userMoved = true; return; }
    if (drag.kind === 'note') { drag.dx = fx; drag.dy = fy; drag.el.style.left = (drag.x0 + fx) + 'px'; drag.el.style.top = (drag.y0 + fy) + 'px'; return; }
    if (drag.kind === 'frame') { drag.dx = fx; drag.dy = fy; drag.orig.forEach(function (o) { var s = VF.step(o.id); s.x = o.x + fx; s.y = o.y + fy; var n = E.nl.querySelector('.node[data-id="' + o.id + '"]'); if (n) { n.style.left = s.x + 'px'; n.style.top = s.y + 'px'; } }); VF.layoutFrames(); VF.renderEdges(); }
  }
  function onUp(e) {
    var g = drag; drag = null; if (!g) return; e.stopPropagation();
    if (g.kind === 'exit') { var rep = g.el.getAttribute('data-out').slice(3); goRep(rep); return; }
    if (g.kind === 'pan') { if (g.moved) { VF.applyView(true); VF.saveViewport(); } else if (g.el && g.el.matches('.fd-fblock')) focusBlock(g.el); else if (g.el && g.el.matches('[data-note]')) VF.roveTo(g.el, { reveal: false }); return; }
    if (g.kind === 'note') { if (!g.moved) { VF.roveTo(g.el, { reveal: false }); return; } VF.moveNote(g.id, g.dx || 0, g.dy || 0); VF.focusNote(g.id); return; }
    if (g.kind === 'frame') {
      g.orig.forEach(function (o) { var s = VF.step(o.id); s.x = o.x; s.y = o.y; });
      if (!g.moved || (!g.dx && !g.dy)) { VF.renderCanvas(); VF.focusFrameHeader(g.f.id); return; }
      VF.moveSteps(g.ids, g.dx, g.dy, { quiet: true }); V.announce('Moved frame ' + g.f.title); VF.focusFrameHeader(g.f.id);
    }
  }

  VF.on('rendered', function () {
    var fi = $('#fd-frame-in'); if (fi && !fi._wired) { fi._wired = true; fi.addEventListener('input', function () { if (S.frameRename) { S.frameRename.value = fi.value; S.frameRename.typed = true; } }); fi.addEventListener('blur', function () { setTimeout(function () { if (S.frameRename && (!d.activeElement || d.activeElement.id !== 'fd-frame-in')) VF.commitFrameRename(true); }, 0); }); }
    var nt = $('#fd-note-ta'); if (nt && !nt._synced) { nt._synced = true; nt.addEventListener('input', function () { if (S.noteEdit) S.noteEdit.text = nt.value; }); }
    if (S.noteEdit) { var ta = $('#fd-note-ta'); if (ta && !ta._wired) { ta._wired = true; ta.addEventListener('blur', function () { setTimeout(function () { if (S.noteEdit && d.activeElement && d.activeElement.id !== 'fd-note-ta' && !d.querySelector('.is-floating')) VF.commitNote(true); }, 0); }); } } });
  V.ready(function () {
    var c = E.canvas || $('#fd-canvas'); if (!c) return;
    c.addEventListener('keydown', onKey);
    c.addEventListener('pointerdown', onDown, true); c.addEventListener('pointermove', onMove, true); c.addEventListener('pointerup', onUp, true); c.addEventListener('pointercancel', function () { drag = null; }, true);
    c.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-fr]'); if (!b || !c.contains(b)) return; var fid = b.closest('[data-frame]').getAttribute('data-frame'); if (b.getAttribute('data-fr') === 'toggle') VF.toggleFrame(fid); else VF.openFrameMenu(fid, b); });
    c.addEventListener('dblclick', function (e) { var bl = e.target.closest && e.target.closest('.fd-fblock'); if (bl) { e.stopPropagation(); VF.toggleFrame(bl.getAttribute('data-frame-block'), false); return; } var nt = e.target.closest && e.target.closest('[data-note]'); if (nt && !e.target.closest('textarea, a')) { e.stopPropagation(); VF.editNote(nt.getAttribute('data-note')); } }, true);
    c.addEventListener('contextmenu', function (e) { var hd = e.target.closest && e.target.closest('[data-fr-head]'), nt = e.target.closest && e.target.closest('[data-note]'), bl = e.target.closest && e.target.closest('.fd-fblock'); if (!hd && !nt && !bl) return; e.preventDefault(); e.stopPropagation(); if (nt) { if (!e.target.closest('textarea')) VF.openNoteMenu(nt.getAttribute('data-note'), nt); } else if (bl) VF.openFrameMenu(bl.getAttribute('data-frame-block'), bl); else VF.openFrameMenu(hd.closest('[data-frame]').getAttribute('data-frame'), hd.querySelector('[data-fr="menu"]') || hd); }, true);
    c.addEventListener('focusin', function (e) { var t = e.target; if (t.matches && t.matches('[data-note]')) S.focusX = { kind: 'note', id: t.getAttribute('data-note') }; else if (t.matches && t.matches('[data-fr]')) S.focusX = { kind: 'fr', id: t.closest('[data-frame]').getAttribute('data-frame'), k: t.getAttribute('data-fr') }; else if (t.closest && t.closest('.node') && !t.closest('.fd-fblock')) S.focusX = null; });
  });
})(window, document);
