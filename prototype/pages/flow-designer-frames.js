/* Vaani Labs prototype · Flow Designer · FrameNode and NoteNode (FD1 D10, §8.2, §10.1, §10.5, §12.4, §12.5, §20.1).
   A frame groups steps visually: a low-chroma tint (or None), a 32 px header (collapse, title, count, ⋯) that stays 32
   screen px at every zoom, and a collapsed form: one 240 px block with a summary that rolls up member issues, an input port
   when something enters, and one exit socket per distinct target ("To Visit booked"). A note is a comment on the canvas,
   pinned to a step when dropped within 24 px of it. Both are Draft content (in the undo stack) that is never compiled,
   validated or counted; collapsing is a per-user view preference, so it never marks the draft dirty.
   This file: model, drawing and operations. Keyboard, pointer and menus: flow-designer-frames-input.js. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, E = VF.el, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var PAD = 16, HEAD = 32, NOTE_W = 220;
  VF.FRAME_TINTS = [[null, 'None'], ['neel', 'Neel'], ['teal', 'Teal'], ['ochre', 'Ochre'], ['rose', 'Rose'], ['slate', 'Slate']];
  S.fcol = null; S.fexpand = null; S.focusX = null; S.noteEdit = null;
  function me() { var u = V.data && V.data.user; return (u && u.short) || 'Anika R.'; }
  function norm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* ---------- model ---------- */
  var load = VF.loadFlow;
  VF.loadFlow = function (id, scen) {
    var m = load(id, scen); m.frames = m.frames || []; m.notes = m.notes || [];
    if (scen === 'large') demo(m);
    return m;
  };
  /* The 26-step flow is drawn the way the spec’s large-flow mock is: an Opening frame, the first step of each answer
     grouped in a second frame, and a note pinned to the greeting (FD1 §12.1, mock section 7). */
  function demo(m) {
    var by = VF.byId(m.steps), q = m.steps.filter(function (s) { return s.type === 'logic.question'; })[0], g = m.steps.filter(function (s) { return s.title === 'Greeting'; })[0];
    if (!q) return;
    m.frames.push({ id: 'fr1', title: 'Opening', tint: 'neel', members: [g && g.id, q.id].filter(Boolean) });
    var first = q.outs.filter(function (o) { return !o.fb && by[o.to] && VF.phaseOf(by[o.to]) !== 'outcome'; }).map(function (o) { return o.to; });
    if (first.length) m.frames.push({ id: 'fr2', title: 'First answers', tint: 'ochre', members: first });
    if (g) m.notes.push({ id: 'nt1', text: 'Weekend batches use the Saturday script.', by: 'Rohit S.', at: new Date(V.fmt.now().getTime() - 2 * 864e5).toISOString(), pin: g.id, dx: 0, dy: 132, x: g.x, y: g.y + 132, auto: true });
  }
  function frames() { return (S.m && !S.viewing && S.m.frames) || []; }
  function notes() { return (S.m && !S.viewing && S.m.notes) || []; }
  VF.frames = frames; VF.notes = notes;
  VF.frameById = function (id) { return frames().filter(function (f) { return f.id === id; })[0] || null; };
  VF.noteById = function (id) { return notes().filter(function (n) { return n.id === id; })[0] || null; };
  VF.frameOf = function (id) { var fs = frames(); for (var i = 0; i < fs.length; i++) if (fs[i].members.indexOf(id) >= 0) return fs[i]; return null; };
  function pref() { if (!S.fcol) { try { S.fcol = JSON.parse(VF.store.get('frames-collapsed:' + S.m.meta.id) || '{}') || {}; } catch (e) { S.fcol = {}; } } return S.fcol; }
  function members(f) { return f.members.map(VF.step).filter(Boolean); }
  VF.isCollapsed = function (f) { return !!(f && pref()[f.id] && S.fexpand !== f.id && !S.compare && members(f).length); };
  VF.repOf = function (id) { var f = VF.frameOf(id); return f && VF.isCollapsed(f) ? 'frame:' + f.id : id; };
  VF.hiddenSet = function () { var h = null; frames().forEach(function (f) { if (VF.isCollapsed(f)) f.members.forEach(function (id) { (h = h || {})[id] = 1; }); }); return h; };
  /* Find (FD1 §12.2): a match inside a collapsed frame expands it while it is the current match. */
  VF.expandFor = function (id) { var f = id ? VF.frameOf(id) : null, want = f && pref()[f.id] ? f.id : null; if (want === S.fexpand) return false; S.fexpand = want; return true; };

  /* ---------- geometry ---------- */
  function boxOf(s) { var g = VF.geom(s.id); return { x: s.x, y: s.y, w: g ? g.w : VF.width(s), h: g ? g.h : VF.estimate(s).h }; }
  function headH() { return HEAD / (S.view.q || 1); }
  /* An expanded frame hugs its members: 16 px padding, plus the header above them (counter-scaled, so its flow height
     grows as the zoom falls). */
  VF.frameRect = function (f, skip) {
    var ms = members(f).filter(function (s) { return !skip || !skip[s.id]; }); if (!ms.length) return null;
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    ms.forEach(function (s) { var b = boxOf(s); x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); });
    var hh = headH(); return { x: x1 - PAD, y: y1 - PAD - hh, w: x2 - x1 + 2 * PAD, h: y2 - y1 + 2 * PAD + hh };
  };
  VF.layoutFrames = function () {
    if (!E.nl) return;
    $$('.fd-frame', E.nl).forEach(function (el) { var f = VF.frameById(el.getAttribute('data-frame')), r = f && VF.frameRect(f); if (!r) return; el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; });
    $$('.fd-note', E.nl).forEach(function (el) { var n = VF.noteById(el.getAttribute('data-note')); if (!n) return; var p = noteXY(n); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; });
  };
  function noteXY(n) { var s = n.pin && VF.step(n.pin); return s ? { x: s.x + (n.dx || 0), y: s.y + (n.dy || 0) } : { x: n.x, y: n.y }; }
  VF.noteXY = noteXY;
  /* Fit counts frame headers and notes as part of the drawing. */
  VF.frameBounds = function (b) {
    frames().forEach(function (f) { if (VF.isCollapsed(f)) return; var r = VF.frameRect(f); if (!r) return; b.x1 = Math.min(b.x1, r.x); b.y1 = Math.min(b.y1, r.y); b.x2 = Math.max(b.x2, r.x + r.w); b.y2 = Math.max(b.y2, r.y + r.h); });
    notes().forEach(function (n) { if (n.pin && VF.repOf(n.pin) !== n.pin) return; var p = noteXY(n); b.x1 = Math.min(b.x1, p.x); b.y1 = Math.min(b.y1, p.y); b.x2 = Math.max(b.x2, p.x + (n.w || NOTE_W)); b.y2 = Math.max(b.y2, p.y + 72); });
  };

  /* ---------- drawing ---------- */
  function tint(f) { return f.tint ? ' flow-frame--' + f.tint : ' fd-frame--none'; }
  function plural(n, w1) { return n + ' ' + w1 + (n === 1 ? '' : 's'); }
  VF.framesHtml = function (ctx) {
    return frames().map(function (f) {
      var ms = members(f); if (!ms.length || VF.isCollapsed(f)) return '';
      return '<div class="flow-frame fd-frame' + tint(f) + '" data-frame="' + esc(f.id) + '" role="group" aria-label="' + esc('Frame ' + f.title + ', ' + plural(ms.length, 'step') + ', expanded') + '">' +
        '<div class="flow-frame-head fd-frame-head" data-fr-head>' +
        '<button type="button" class="fd-frame-btn" data-fr="toggle" tabindex="-1" aria-expanded="true" aria-label="' + esc('Frame ' + f.title + ', ' + plural(ms.length, 'step') + '. Collapse') + '" aria-keyshortcuts="Enter">' + VF.icon('chevron-down', 'sm') + '</button>' +
        (S.frameRename && S.frameRename.id === f.id ? '<input class="fd-frame-in" id="fd-frame-in" maxlength="60" spellcheck="false" aria-label="Frame title" value="' + esc(S.frameRename.value) + '">' : '<span class="fd-frame-t" translate="no">' + (VF.markHtml ? VF.markHtml(f.title) : esc(f.title)) + '</span>') + '<span class="fd-frame-n">' + plural(ms.length, 'step') + '</span>' +
        '<button type="button" class="fd-frame-btn fd-frame-more" data-fr="menu" tabindex="-1" aria-haspopup="menu" aria-label="' + esc('Frame menu: ' + f.title) + '">' + VF.icon('ellipsis', 'sm') + '</button></div></div>';
    }).join('');
    void ctx;
  };
  function issuesOf(ids) { var set = {}; ids.forEach(function (id) { set[id] = 1; }); return S.issues.filter(function (i) { return set[i.stepId]; }); }
  function exitsOf(f, set) {
    var out = [], seen = {};
    members(f).forEach(function (m) { m.outs.forEach(function (o) {
      if (!o.to || set[o.to]) return; var t = VF.step(o.to); if (!t) return; var rep = VF.repOf(t.id); if (seen[rep]) { if (!o.fb) seen[rep].fb = false; return; }
      var fr = rep.indexOf('frame:') === 0 ? VF.frameById(rep.slice(6)) : null, e = { key: 'to:' + rep, label: fr ? fr.title : t.title, fb: !!o.fb };
      seen[rep] = e; out.push(e);
    }); });
    return out;
  }
  function blockHtml(f, ctx) {
    var ms = members(f), set = {}, co = VF.callOrder(S.m.steps).order; ms.forEach(function (m) { set[m.id] = 1; });
    var lead = ms.slice().sort(function (a, b) { var ia = co.indexOf(a.id), ib = co.indexOf(b.id); return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib) || a.y - b.y; })[0], x = lead.x, y = lead.y;
    var c = VF.counts(issuesOf(f.members)), n = c.errors + c.warnings, ex = exitsOf(f, set), band = ctx.band;
    var hasIn = S.m.steps.some(function (s) { return !set[s.id] && s.outs.some(function (o) { return set[o.to]; }); });
    var hits = (VF.findMatches ? VF.findMatches() : []).filter(function (id) { return set[id]; }).length;
    var sum = plural(ms.length, 'step') + (n ? ' · ' + VF.issueWords(c) : '') + (hits ? ' · ' + plural(hits, 'match').replace('matchs', 'matches') : '');
    var name = 'Frame ' + f.title + ', ' + plural(ms.length, 'step') + ', collapsed. ' + (n ? VF.issueWords(c) + '. ' : '') + (ex.length ? 'Exits: ' + ex.map(function (e) { return 'to ' + e.label; }).join('; ') + '. ' : '') + 'Press Enter to expand.';
    var focus = !S.focusX && set[S.focus], sel = S.sel.some(function (id) { return set[id]; });
    var cls = 'node fd-fblock' + tint(f) + (band === 'block' ? ' node--block' : band === 'compact' ? ' node--compact' : '') + (c.errors ? ' node--error' : c.warnings ? ' node--warning' : '') + (sel ? ' is-selected' : '') + (ctx.dim && ms.every(function (m) { return ctx.dim[m.id]; }) ? ' node--dim' : '');
    var badge = n ? '<div class="node-badges" aria-hidden="true"><span class="tag tag--' + (c.errors ? 'danger' : 'warning') + '">' + VF.icon(c.errors ? 'circle-x' : 'triangle-alert', 'xs') + (band === 'full' ? VF.issueWords(c) : n) + '</span></div>' : '';
    var inPort = hasIn ? '<span class="sock sock--in" aria-hidden="true" data-mark></span>' : '';
    var attrs = ' role="group" aria-roledescription="frame" tabindex="' + (focus ? 0 : -1) + '" data-id="frame:' + esc(f.id) + '" data-frame-block="' + esc(f.id) + '" aria-label="' + esc(name) + '" aria-keyshortcuts="Enter" style="left:' + x + 'px;top:' + y + 'px"';
    var tile = '<span class="gt gt--line" aria-hidden="true">' + VF.icon('layout-grid', band === 'block' ? 'lg' : 'sm') + '</span>';
    if (band === 'block') {
      var k = ex.length;
      return '<div class="' + cls + '"' + attrs + '>' + badge + inPort + tile + '<span class="node-blocklabel" aria-hidden="true"><i>Frame</i><wbr>' + esc(f.title) + ' · ' + esc(sum) + '</span>' + ex.map(function (e, i) { return '<span class="fd-stub" style="top:' + Math.round((i + 1) * 100 / (k + 1)) + '%"><button type="button" class="sock" tabindex="-1" data-out="' + esc(e.key) + '" aria-label="' + esc('Exit to ' + e.label + ' from frame ' + f.title) + '" data-mark></button></span>'; }).join('') + '</div>';
    }
    return '<div class="' + cls + '"' + attrs + '>' + badge + inPort + '<div class="node-head">' + tile + '<div class="node-text"><div class="node-phase"><span>Frame · collapsed</span></div><div class="node-title" translate="no">' + esc(f.title) + '</div>' + (band === 'full' ? '<div class="node-meta">' + esc(sum) + '</div>' : '') + '</div></div>' +
      ex.map(function (e) { return '<div class="res-row fd-exit' + (e.fb ? ' res-row--fallback' : '') + '" data-row="' + esc(e.key) + '">' + VF.icon('arrow-right', 'xs') + '<span class="res-label">To ' + esc(e.label) + '</span><button type="button" class="sock" tabindex="-1" data-out="' + esc(e.key) + '" aria-label="' + esc('Exit to ' + e.label + ' from frame ' + f.title + '. Press Enter to go there.') + '" data-mark></button></div>'; }).join('') + '</div>';
  }
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); }
  /* note headers are narrow: today's notes show the time alone ("11:24 am"), older ones the relative day */
  function when(iso) { return iso ? String(V.fmt.when(iso)).replace(/^Today /, '') : 'just now'; }
  function noteHtml(n, ctx) {
    var p = noteXY(n), q = VF.findQ ? VF.findQ() : '', dim = (q && norm(n.text).indexOf(q) < 0) || (ctx.dim && S.emph), edit = S.noteEdit && S.noteEdit.id === n.id, pin = n.pin && VF.step(n.pin);
    var body = edit ? '<label class="sr-only" for="fd-note-ta">Note text</label><textarea class="textarea fd-note-ta" id="fd-note-ta" rows="3" maxlength="500" placeholder="Write a note…">' + esc(S.noteEdit.text) + '</textarea><p class="fd-note-hint">' + V.ui.kbd('mod+Enter') + ' saves · ' + V.ui.kbd('Esc') + ' cancels</p>'
      : '<p>' + (n.text ? (ctx.band === 'block' ? VF.icon('sticky-note', 'xs') + ' ' + esc(n.text.split(/\n/)[0]) : linkify(n.text)) : '<span class="u-fg-3">Empty note</span>') + '</p>';
    return '<div class="cnote fd-note' + (ctx.band === 'block' ? ' fd-note--block' : '') + (dim ? ' fd-note--dim' : '') + (edit ? ' is-editing' : '') + '" data-note="' + esc(n.id) + '" role="group" aria-roledescription="note" tabindex="-1" aria-label="' + esc('Note by ' + n.by + ': ' + (n.text || 'empty') + (pin ? (/[.!?]$/.test(n.text || '') ? ' ' : '. ') + 'Pinned to step ' + pin.no : '')) + '" aria-keyshortcuts="Enter Delete" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + (n.w || NOTE_W) + 'px">' +
      '<div class="cnote-head">' + VF.icon('sticky-note', 'xs') + '<span class="fd-note-by"><span class="sr-only">Note · </span>' + esc(n.by) + '</span><span class="fd-note-at">· ' + esc(when(n.at)) + '</span>' + (pin ? '<span class="fd-note-pin" aria-hidden="true">' + VF.icon('link', 'xs') + '#' + pin.no + '</span>' : '') + '</div>' + body + '</div>';
  }
  /* Collapsed blocks and notes draw above the connectors, below the steps. */
  VF.notesHtml = function (ctx) {
    var list = notes().slice(); if (S.noteEdit && S.noteEdit.fresh && !VF.noteById(S.noteEdit.id)) list.push(S.noteEdit.note);
    return frames().filter(VF.isCollapsed).map(function (f) { return blockHtml(f, ctx); }).join('') +
      list.map(function (n) { return n.pin && VF.step(n.pin) && VF.repOf(n.pin) !== n.pin ? '' : noteHtml(n, ctx); }).join('');
  };
  /* After a canvas render: the roving tab stop follows a focused frame header or note; an open note editor gets focus back. */
  VF.afterCanvas = function () {
    if (placeAutoNotes()) { setTimeout(VF.renderCanvas, 0); }
    var fi = $('#fd-frame-in'); if (fi && S.frameRename) { $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); fi.focus({ preventScroll: true }); if (!S.frameRename.typed) fi.select(); else { var FL = fi.value.length; fi.setSelectionRange(FL, FL); } return true; }
    var ta = $('#fd-note-ta'); if (ta && S.noteEdit) { $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); var nn = ta.closest('.fd-note'); if (nn) nn.tabIndex = 0; ta.focus({ preventScroll: true }); var L = ta.value.length; ta.setSelectionRange(L, L); return true; }
    var x = S.focusX, el = x && (x.kind === 'note' ? E.nl.querySelector('[data-note="' + x.id + '"]') : E.nl.querySelector('[data-frame="' + x.id + '"] [data-fr="' + (x.k || 'toggle') + '"]'));
    if (x && !el) { S.focusX = null; return false; }
    if (el) { $$('.node[tabindex="0"], .sock[tabindex="0"]', E.nl).forEach(function (n) { n.tabIndex = -1; }); el.tabIndex = 0; }
    return false;
  };
  /* Roving focus onto a frame control or a note (one tab stop for the whole canvas, FD1 §11.1). */
  VF.roveTo = function (el, o) {
    if (!el) return; $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; });
    var nt = el.closest('[data-note]'), fr = el.closest('[data-frame]');
    S.focusX = nt ? { kind: 'note', id: nt.getAttribute('data-note') } : fr && el.hasAttribute('data-fr') ? { kind: 'fr', id: fr.getAttribute('data-frame'), k: el.getAttribute('data-fr') } : null;
    el.tabIndex = 0; el.focus({ preventScroll: true });
    if (!(o && o.reveal === false)) { var host = nt || fr, r = host && host.getBoundingClientRect(), cr = E.canvas.getBoundingClientRect(); if (r) { var a = VF.toFlow(r.left - cr.left, r.top - cr.top); VF.reveal(null, { box: { x: a.x, y: a.y, w: r.width / S.view.zoom, h: Math.min(r.height, 240) / S.view.zoom } }); } }
  };
  VF.focusFrameHeader = function (fid, k) { var el = E.nl.querySelector('[data-frame="' + fid + '"] [data-fr="' + (k || 'toggle') + '"]'); if (el) VF.roveTo(el); return !!el; };
  VF.focusNote = function (id) { var el = E.nl.querySelector('[data-note="' + id + '"]'); if (el) VF.roveTo(el); return !!el; };

  /* ---------- frame operations ---------- */
  function ro() { if (VF.readOnlyReason()) { VF.explainReadOnly(); return true; } return false; }
  function nextNo() { var n = 0; frames().forEach(function (f) { var m = /^Frame (\d+)$/.exec(f.title); if (m) n = Math.max(n, +m[1]); }); return n + 1; }
  /* Ctrl+G, the selection bar, the palette’s Canvas group, the canvas and step menus. A step is in at most one frame. */
  VF.frameSelection = function (ids) {
    ids = (ids || []).filter(VF.step); if (!ids.length) { V.toast.info('Select the steps to frame first. Shift-click adds steps to the selection.'); return; }
    if (ro()) return;
    var f = { id: 'fr' + Date.now().toString(36), title: 'Frame ' + nextNo(), tint: null, members: ids.slice() };
    VF.act('frame ' + plural(ids.length, 'step'), function () { S.m.frames.forEach(function (g) { g.members = g.members.filter(function (x) { return ids.indexOf(x) < 0; }); }); S.m.frames = S.m.frames.filter(function (g) { return g.members.length; }); S.m.frames.push(f); }, { keepTest: true });
    V.announce('Framed ' + plural(ids.length, 'step') + ' as ' + f.title + '. Type a title, then press Enter.');
    setTimeout(function () { VF.renameFrame(f.id); }, 0);
    return f;
  };
  VF.addToFrame = function (ids, fid) {
    var f = VF.frameById(fid); ids = ids.filter(VF.step); if (!f || !ids.length || ro()) return;
    VF.act('add to frame', function () { S.m.frames.forEach(function (g) { if (g.id !== fid) g.members = g.members.filter(function (x) { return ids.indexOf(x) < 0; }); }); ids.forEach(function (id) { if (f.members.indexOf(id) < 0) f.members.push(id); }); S.m.frames = S.m.frames.filter(function (g) { return g.members.length; }); }, { keepTest: true });
    V.announce('Added ' + plural(ids.length, 'step') + ' to ' + f.title);
  };
  VF.removeFromFrame = function (ids) {
    ids = ids.filter(VF.frameOf); if (!ids.length || ro()) return; var f = VF.frameOf(ids[0]);
    VF.act('remove from frame', function () { S.m.frames.forEach(function (g) { g.members = g.members.filter(function (x) { return ids.indexOf(x) < 0; }); }); S.m.frames = S.m.frames.filter(function (g) { return g.members.length; }); }, { keepTest: true });
    V.announce('Removed ' + plural(ids.length, 'step') + ' from ' + f.title);
  };
  VF.ungroupFrame = function (fid, o) {
    var f = VF.frameById(fid); if (!f || ro()) return; var focusId = members(f)[0] && members(f)[0].id;
    VF.act((o && o.label) || 'ungroup ' + f.title, function () { S.m.frames = S.m.frames.filter(function (g) { return g.id !== fid; }); }, { keepTest: true });
    delete pref()[fid]; VF.store.set('frames-collapsed:' + S.m.meta.id, JSON.stringify(pref()));
    if (o && o.toast) V.toast.undo("Deleted frame '" + f.title + "'. Its steps stay.", { action: { label: 'Undo', onClick: VF.undo } }); else V.announce('Ungrouped ' + f.title + '. Its steps stay.');
    if (focusId) setTimeout(function () { VF.focusStep(focusId, { reveal: false }); }, 0);
  };
  VF.setFrameTint = function (fid, t) { var f = VF.frameById(fid); if (!f || ro()) return; VF.act('colour ' + f.title, function () { f.tint = t; }, { keepTest: true }); V.announce(f.title + ': ' + (t ? t.charAt(0).toUpperCase() + t.slice(1) : 'no colour')); };
  /* Collapse is a view preference per user and flow (like the viewport): it never touches the draft or the undo stack. */
  VF.toggleFrame = function (fid, force) {
    var f = VF.frameById(fid); if (!f) return; var p = pref(), was = VF.isCollapsed(f), now = force != null ? force : !was;
    if (now) p[fid] = true; else delete p[fid]; if (S.fexpand === fid) S.fexpand = null;
    VF.store.set('frames-collapsed:' + S.m.meta.id, JSON.stringify(p));
    S.focusX = now ? null : { kind: 'fr', id: fid, k: 'toggle' };
    if (now) { var inside = f.members.indexOf(S.focus) >= 0 ? S.focus : f.members.filter(VF.step)[0]; if (inside) S.focus = inside; }
    VF.renderCanvas(); VF.renderMinimap();
    var el = now ? E.nl.querySelector('.node[data-id="frame:' + fid + '"]') : E.nl.querySelector('[data-frame="' + fid + '"] [data-fr="toggle"]');
    if (el) { if (now) { $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); el.tabIndex = 0; el.focus({ preventScroll: true }); VF.reveal(null, { box: VF.drawnBox('frame:' + fid) }); } else VF.roveTo(el); }
    V.announce(f.title + (now ? ' collapsed' : ' expanded'));
  };
  /* Rename: the title becomes a field in the header (state-backed, so re-renders keep the text); Enter keeps it, Esc
     cancels, leaving the field keeps it. */
  VF.renameFrame = function (fid) {
    var f = VF.frameById(fid); if (!f) return; if (VF.readOnlyReason()) return VF.explainReadOnly();
    if (VF.isCollapsed(f)) { var p = pref(); delete p[fid]; VF.store.set('frames-collapsed:' + S.m.meta.id, JSON.stringify(p)); }
    S.frameRename = { id: fid, value: f.title, sel: true }; VF.renderCanvas();
  };
  VF.commitFrameRename = function (keep) {
    var r = S.frameRename; if (!r) return; var f = VF.frameById(r.id), v = String(r.value || '').trim(); S.frameRename = null; S.focusX = { kind: 'fr', id: r.id, k: 'toggle' };
    if (keep && f && v && v !== f.title && !VF.readOnlyReason()) { VF.act('rename frame', function () { f.title = v; }, { keepTest: true }); V.announce('Frame renamed to ' + v); } else VF.renderCanvas();
    VF.focusFrameHeader(r.id);
  };
  /* Deleted steps leave their frames (an emptied frame goes); notes pinned to them stay where they were. */
  VF.pruneFrames = function (ids) {
    if (!S.m.frames) return; var gone = {}; ids.forEach(function (id) { gone[id] = 1; });
    S.m.frames.forEach(function (f) { f.members = f.members.filter(function (id) { return !gone[id]; }); });
    S.m.frames = S.m.frames.filter(function (f) { return f.members.length; });
    (S.m.notes || []).forEach(function (n) { if (n.pin && gone[n.pin]) { var p = noteXY(n); n.x = p.x; n.y = p.y; n.pin = null; } });
  };
  /* Drag membership (FD1 §10.4): dropping a step on a frame’s body adds it; dragging it out of its frame removes it. */
  VF.frameDrop = function (ids, key) {
    var changes = [];
    ids.forEach(function (id) {
      var s = VF.step(id); if (!s) return; var b = boxOf(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, skip = {}; ids.forEach(function (x) { skip[x] = 1; });
      var cur = VF.frameOf(id), inside = function (f) { var r = VF.frameRect(f, skip); return r && cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h; };
      var into = frames().filter(function (f) { return f !== cur && !VF.isCollapsed(f) && inside(f); })[0];
      if (into) changes.push({ id: id, to: into.id }); else if (cur && members(cur).some(function (m) { return !skip[m.id]; }) && !inside(cur)) changes.push({ id: id, to: null });
    });
    if (!changes.length) return;
    VF.act('frame membership', function () { changes.forEach(function (c) { S.m.frames.forEach(function (f) { f.members = f.members.filter(function (x) { return x !== c.id; }); }); if (c.to) VF.frameById(c.to).members.push(c.id); }); S.m.frames = S.m.frames.filter(function (f) { return f.members.length; }); }, { coalesce: key, keepTest: true });
    var c0 = changes[0], t = c0.to && VF.frameById(c0.to); V.announce(t ? 'Added to ' + t.title : 'Removed from its frame');
  };
  VF.frameTarget = function (ids) {
    $$('.fd-frame--target', E.nl).forEach(function (el) { el.classList.remove('fd-frame--target'); }); if (!ids) return;
    var s = VF.step(ids[0]); if (!s) return; var b = boxOf(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, skip = {}; ids.forEach(function (x) { skip[x] = 1; }); var cur = VF.frameOf(s.id);
    frames().forEach(function (f) { if (f === cur || VF.isCollapsed(f)) return; var r = VF.frameRect(f, skip); if (r && cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h) { var el = E.nl.querySelector('[data-frame="' + f.id + '"]'); if (el) el.classList.add('fd-frame--target'); } });
  };

  /* ---------- note placement (FD-R2-04; FD1 §12.4, §12.5) ----------
     A note never hides flow content: steps, connectors, their label pills and other notes are obstacles, and a note sits
     wholly inside or wholly outside every expanded frame. Candidates go below the step first, then above, then beside. */
  var NOTE_H = 96;
  function noteObstacles(skipId) {
    var obs = [];
    S.m.steps.forEach(function (s) { if (VF.repOf(s.id) !== s.id) return; var b = boxOf(s); obs.push({ x: b.x - 16, y: b.y - 16, w: b.w + 32, h: b.h + 32 }); });
    notes().forEach(function (n) { if (n.id === skipId || n.auto) return; var p = noteXY(n); obs.push({ x: p.x - 8, y: p.y - 8, w: (n.w || NOTE_W) + 16, h: NOTE_H + 16 }); });
    (VF.edges || []).forEach(function (e) {
      var v = (String(e.d).match(/-?\d+(?:\.\d+)?/g) || []).map(Number), pts = [];
      for (var i = 0; i + 1 < v.length; i += 2) pts.push({ x: v[i], y: v[i + 1] });
      for (var j = 1; j < pts.length; j++) { var a = pts[j - 1], b = pts[j]; obs.push({ x: Math.min(a.x, b.x) - 12, y: Math.min(a.y, b.y) - 12, w: Math.abs(a.x - b.x) + 24, h: Math.abs(a.y - b.y) + 24 }); }
      if (e.label && e.run) obs.push({ x: e.run.x - 64, y: e.run.y - 18, w: 128, h: 36 });
    });
    return obs;
  }
  function crossesFrame(r) {
    return frames().some(function (f) {
      if (VF.isCollapsed(f)) return false; var R = VF.frameRect(f); if (!R) return false;
      var inside = r.x >= R.x && r.y >= R.y && r.x + r.w <= R.x + R.w && r.y + r.h <= R.y + R.h;
      var apart = r.x + r.w <= R.x || r.x >= R.x + R.w || r.y + r.h <= R.y || r.y >= R.y + R.h;
      return !inside && !apart;
    });
  }
  VF.noteSpot = function (s, skipId) {
    var b = boxOf(s), W = NOTE_W, H = NOTE_H, obs = noteObstacles(skipId), best = null, snap = function (v) { return Math.round(v / 16) * 16; };
    var xs = [s.x, s.x + b.w - W, s.x + b.w + 40, s.x - W - 40], ys = [];
    for (var k = 0; k < 8; k++) { ys.push(s.y + b.h + 24 + k * 48); ys.push(s.y - H - 40 - k * 48); }
    ys.push(s.y);
    for (var yi = 0; yi < ys.length; yi++) for (var xi = 0; xi < xs.length; xi++) {
      var r = { x: snap(xs[xi]), y: snap(ys[yi]), w: W, h: H }, n = 0;
      obs.forEach(function (o) { if (r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y) n++; });
      if (crossesFrame(r)) n += 4;
      if (!n) return { x: r.x, y: r.y };
      if (!best || n < best.n) best = { x: r.x, y: r.y, n: n };
    }
    return best;
  };
  /* Notes seeded by the demo data are placed once the steps and connectors have their geometry. */
  function placeAutoNotes() {
    var moved = false;
    notes().forEach(function (n) { if (!n.auto) return; delete n.auto; var s = n.pin && VF.step(n.pin); if (!s || VF.repOf(s.id) !== s.id) return; var p = VF.noteSpot(s, n.id); if (!p) return; n.x = p.x; n.y = p.y; n.dx = p.x - s.x; n.dy = p.y - s.y; moved = true; });
    return moved;
  }

  /* ---------- note operations ---------- */
  function pinFor(x, y, w) { var box = { x: x, y: y, w: w || NOTE_W, h: 72 }, best = null; S.m.steps.forEach(function (s) { if (VF.repOf(s.id) !== s.id) return; var b = boxOf(s), dx = Math.max(b.x - (box.x + box.w), box.x - (b.x + b.w), 0), dy = Math.max(b.y - (box.y + box.h), box.y - (b.y + b.h), 0), dd = Math.max(dx, dy); if (dd <= 24 && (!best || dd < best.d)) best = { s: s, d: dd }; }); return best && best.s; }
  VF.pinNote = function (n) { var p = noteXY(n), s = pinFor(p.x, p.y, n.w); n.x = p.x; n.y = p.y; if (s) { n.pin = s.id; n.dx = p.x - s.x; n.dy = p.y - s.y; } else { n.pin = null; } return s; };
  VF.addNote = function (o) {
    o = o || {}; if (ro()) return; var s = o.near && VF.step(o.near), x, y;
    if (s) { var sp = VF.noteSpot(s); x = sp.x; y = sp.y; } else if (o.at) { x = Math.round(o.at.x / 16) * 16; y = Math.round(o.at.y / 16) * 16; } else { var c = VF.viewCenter(); x = Math.round((c.x - NOTE_W / 2) / 16) * 16; y = Math.round((c.y - 36) / 16) * 16; }
    var n = { id: 'nt' + Date.now().toString(36), text: '', by: me(), at: VF.nowIso(), x: x, y: y, pin: null, dx: 0, dy: 0 };
    VF.pinNote(n); if (s && !n.pin) { n.pin = s.id; n.dx = x - s.x; n.dy = y - s.y; }
    S.noteEdit = { id: n.id, text: '', fresh: true, note: n }; S.focusX = { kind: 'note', id: n.id };
    VF.renderCanvas(); VF.reveal(null, { box: { x: n.x, y: n.y, w: NOTE_W, h: 120 } });
    V.announce(n.pin ? 'New note pinned to ' + VF.step(n.pin).title + '. Type it, then press Control Enter.' : 'New note. Type it, then press Control Enter.');
  };
  VF.editNote = function (id) { var n = VF.noteById(id); if (!n || ro()) return; S.noteEdit = { id: id, text: n.text, fresh: false }; S.focusX = { kind: 'note', id: id }; VF.renderCanvas(); };
  VF.commitNote = function (keep) {
    var e = S.noteEdit; if (!e) return; var ta = $('#fd-note-ta'), v = (ta ? ta.value : e.text).trim().slice(0, 500); S.noteEdit = null;
    if (e.fresh) {
      if (keep && v) { S.focusX = { kind: 'note', id: e.id }; VF.act('add note', function () { e.note.text = v; e.note.at = VF.nowIso(); S.m.notes.push(e.note); }, { keepTest: true }); V.announce('Note added'); VF.focusNote(e.id); }
      else { S.focusX = null; VF.renderCanvas(); if (S.focus) VF.focusStep(S.focus, { reveal: false }); V.announce('Note discarded'); }
      return;
    }
    var n = VF.noteById(e.id); if (!n) return;
    S.focusX = { kind: 'note', id: e.id };
    if (keep && v !== n.text) { if (!v) { S.focusX = null; VF.deleteNote(e.id); return; } VF.act('edit note', function () { n.text = v; n.at = VF.nowIso(); }, { keepTest: true }); V.announce('Note saved'); }
    else VF.renderCanvas();
    VF.focusNote(e.id);
  };
  VF.deleteNote = function (id) {
    var n = VF.noteById(id); if (!n || ro()) return; var back = n.pin && VF.step(n.pin) ? n.pin : S.focus;
    VF.act('delete note', function () { S.m.notes = S.m.notes.filter(function (x) { return x.id !== id; }); }, { keepTest: true });
    S.focusX = null; V.toast.undo('Deleted note', { action: { label: 'Undo', onClick: VF.undo } }); V.announce('Deleted note. Press Control Z to undo.');
    setTimeout(function () { if (back) VF.focusStep(back, { reveal: false }); }, 0);
  };
  VF.duplicateNote = function (id) { var n = VF.noteById(id); if (!n || ro()) return; var p = noteXY(n), c = VF.clone(n); c.id = 'nt' + Date.now().toString(36); c.x = p.x + 32; c.y = p.y + 32; c.pin = null; c.by = me(); c.at = VF.nowIso(); VF.pinNote(c); VF.act('duplicate note', function () { S.m.notes.push(c); }, { keepTest: true }); S.focusX = { kind: 'note', id: c.id }; VF.renderCanvas(); VF.focusNote(c.id); V.announce('Duplicated the note'); };
  VF.moveNote = function (id, dx, dy, o) {
    var n = VF.noteById(id); if (!n || ro() || (!dx && !dy)) return; var p = noteXY(n);
    VF.act('move note', function () { n.x = p.x + dx; n.y = p.y + dy; n.pin = null; var s = VF.pinNote(n); if (o && o.announce !== false) V.announce(s ? 'Note pinned to ' + s.title : 'Note moved', { dedupeKey: 'move' }); }, { coalesce: o && o.coalesce, keepTest: true });
  };
})(window, document);
