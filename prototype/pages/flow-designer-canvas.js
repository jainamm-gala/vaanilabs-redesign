/* Vaani Labs prototype · Flow Designer · canvas rendering (FD1 §4–§7, §9): steps per level of detail, sockets, routed
   orthogonal connectors (one custom edge type), labels, viewport transform with the 12 px clamp (--z written once per
   gesture, quantised down to 0.05), minimap. Interaction lives in flow-designer-input.js. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var E = VF.el = {};
  S.view = { zoom: 1, tx: 0, ty: 0, q: 1, band: 'full' };
  S.opts = { snap: true, labels: true, changes: true, locked: false, scrollZoom: false, minimap: VF.store.get('minimap') !== 'off', phaseCols: VF.store.get('phase-columns') === 'on', touch: 'navigate' };
  var pos = {}; /* socket geometry per step: { w, h, inY, outs: { outId: y } } */

  VF.canvasInit = function () {
    E.canvas = $('#fd-canvas'); E.vp = $('#fd-vp'); E.nl = $('#fd-nl'); E.labels = $('#fd-labels'); E.top = $('#fd-canvas-top');
    E.bands = d.createElement('div'); E.bands.className = 'phase-bands fd-bands'; E.bands.setAttribute('aria-hidden', 'true'); E.canvas.insertBefore(E.bands, E.vp);
  };

  /* ---------- level of detail with 0.03 hysteresis (FD1 §5.5) ---------- */
  function bandFor(z, cur) {
    if (cur === 'full') return z < 0.72 ? (z < 0.47 ? 'block' : 'compact') : 'full';
    if (cur === 'compact') return z >= 0.75 ? 'full' : z < 0.47 ? 'block' : 'compact';
    return z >= 0.75 ? 'full' : z >= 0.5 ? 'compact' : 'block';
  }
  VF.applyView = function (commit) {
    var v = S.view; if (!E.nl) return;
    if (commit) { var q = Math.max(0.25, Math.floor(v.zoom * 20 + 1e-6) / 20), b = bandFor(v.zoom, v.band); var bandChanged = b !== v.band; v.q = q; E.nl.style.setProperty('--z', q); if (bandChanged) { v.band = b; VF.renderCanvas(); return; } }
    E.vp.style.transform = 'translate(' + v.tx + 'px,' + v.ty + 'px) scale(' + (v.zoom / v.q) + ')';
    var g = 16 * v.zoom; E.canvas.style.backgroundSize = g + 'px ' + g + 'px'; E.canvas.style.backgroundPosition = (v.tx % g) + 'px ' + (v.ty % g) + 'px';
    E.canvas.classList.toggle('fd-nodots', v.zoom < 0.4);
    if (commit && VF.layoutFrames) VF.layoutFrames();
    VF.positionOverlays(); if (commit && v.band === 'block') VF.layoutBlockLabels(); VF.emit('view');
  };
  /* Block labels that would collide: the lower priority one hides until its step is hovered or focused (FD1 §5.5). */
  VF.layoutBlockLabels = function () {
    if (S.view.band !== 'block' || !E.nl) return;
    var co = VF.callOrder(VF.visibleSteps()).order, list = $$('.node-blocklabel', E.nl).map(function (l) { var n = l.parentNode, id = n.getAttribute('data-id'), s = VF.stepAny ? VF.stepAny(id) : null, p = n.classList.contains('is-selected') ? 0 : id === S.focus ? 1 : /node--(error|warning|unreachable)/.test(n.className) ? 2 : s && /trigger|outcome/.test(VF.phaseOf(s) || '') ? 3 : 4; return { l: l, n: n, p: p, o: co.indexOf(id) }; });
    /* FD1 §5.5: a label runs 140 screen px from just right of its tile; where a step in the next column overlaps its
       height it stops 8 px before that column, and it never runs past the visible canvas (the inspector or panel edge). */
    var cr = E.canvas.getBoundingClientRect(), ins = VF.insets(), edge = cr.right - ins.r - 8, boxes = $$('.node', E.nl).map(function (n) { return { n: n, r: n.getBoundingClientRect() }; });
    list.forEach(function (x) {
      x.l.classList.remove('fd-bl-hide', 'fd-bl-stop'); x.l.style.removeProperty('--bw');
      var lr = x.l.getBoundingClientRect(), top = lr.top, bot = lr.top + Math.max(lr.height, 38), cap = 140;
      boxes.forEach(function (b) { if (b.n === x.n) return; if (b.r.left >= lr.left + 2 && b.r.top < bot && b.r.bottom > top) cap = Math.min(cap, b.r.left - 8 - lr.left); });
      cap = Math.min(cap, edge - lr.left);
      if (cap < 140) x.l.style.setProperty('--bw', Math.max(0, Math.floor(cap)) + 'px');
      x.stop = cap < 44;
    });
    list.sort(function (a, b) { return a.p - b.p || a.o - b.o; });
    var kept = [];
    list.forEach(function (x) { if (x.stop) { x.l.classList.add('fd-bl-hide', 'fd-bl-stop'); return; } var r = x.l.getBoundingClientRect(); if (kept.some(function (k) { return r.left < k.right + 2 && r.right > k.left - 2 && r.top < k.bottom + 2 && r.bottom > k.top - 2; })) x.l.classList.add('fd-bl-hide'); else kept.push(r); });
  };
  VF.toScreen = function (x, y) { return { x: S.view.tx + x * S.view.zoom, y: S.view.ty + y * S.view.zoom }; };
  VF.toFlow = function (sx, sy) { return { x: (sx - S.view.tx) / S.view.zoom, y: (sy - S.view.ty) / S.view.zoom }; };
  VF.viewCenter = function () { var r = E.canvas.getBoundingClientRect(); return VF.toFlow(r.width / 2, r.height / 2); };

  /* ---------- node markup ---------- */
  function tokens(text) { return esc(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, n) { return '<span class="node-var" translate="no">{{' + n + '}}</span>'; }); }
  VF.tokens = tokens;
  /* Find (FD1 §12.2): matched words get <mark> in the Full band, case- and accent-insensitive like the matcher. */
  function markHtml(text) {
    text = String(text == null ? '' : text); var q = S.view.band === 'full' && VF.findQ ? VF.findQ() : '';
    if (!q) return esc(text);
    var nm = '', map = [], i, j;
    for (i = 0; i < text.length; i++) { var c = text[i].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); for (j = 0; j < c.length; j++) { nm += c[j]; map.push(i); } }
    var out = '', last = 0, from = 0, k;
    while ((k = nm.indexOf(q, from)) >= 0) { var a = map[k], b = map[k + q.length - 1] + 1; if (a >= last) { out += esc(text.slice(last, a)) + '<mark class="fd-mark">' + esc(text.slice(a, b)) + '</mark>'; last = b; } from = k + q.length; }
    return out + esc(text.slice(last));
  }
  VF.markHtml = markHtml;
  function tokensMarked(text) { return String(text || '').split(/(\{\{\s*\w+\s*\}\})/).map(function (p, i) { return i % 2 ? '<span class="node-var" translate="no">' + markHtml(p.replace(/\s+/g, '')) + '</span>' : markHtml(p); }).join(''); }
  function langName(code) { return code ? V.langByCode(code).name : null; }
  function metaLine(s) {
    var f = s.f || {};
    switch (s.type) {
      case 'trigger.inbound': return (f.numbers || []).length ? '<span class="fd-num" translate="no">' + esc(f.numbers[0]) + '</span>' + ((f.numbers || []).length > 1 ? ' +' + (f.numbers.length - 1) : '') + ' · ' + (f.when === 'Set hours' ? '10 am to 7 pm IST' : 'every call') : '<span class="fd-danger">No number chosen</span>';
      case 'trigger.outbound': return f.batch ? esc(f.batch) + ' · 10 am to 7 pm IST' : 'No batch linked yet';
      case 'trigger.api': return 'POST /v1/calls · Sample CRM';
      case 'trigger.test': return 'Browser test · sample values';
      case 'logic.question': return (f.lang ? V.ui.langMark(f.lang, 'compact') + esc(langName(f.lang)) + ' · ' : '') + 'waits ' + (f.wait || 6) + ' s';
      case 'logic.verify': return 'up to ' + (f.attempts || 2) + ' tries';
      case 'logic.branch': return f.decide === 'Description' ? 'Judged by the agent' : 'Decides on {{' + ((f.cases || [])[0] || {}).v + '}}';
      case 'action.speak': return '1 line' + (f.lang ? ' · ' + esc(langName(f.lang)) : '');
      case 'action.knowledge': return f.searchIn === "This step’s Q&A" ? "This step’s Q&A" : esc((VF.WS.sources[0] || 'price-sheet.pdf')) + ' + ' + Math.max(0, VF.WS.sources.length - 1) + ' files';
      case 'action.crm': return f.connector ? 'By phone number · Sample CRM' : '<span class="fd-danger">No connector chosen</span>';
      case 'action.meeting': return (VF.WS.calendar === 'connected' ? (f.offer === 'Set hours' ? esc(f.mtype || 'Phone call') : 'Calendar') : '<span class="fd-danger">Calendar not connected</span>') + (f.confirmWa ? ', then WhatsApp' : '');
      case 'action.whatsapp': var t = VF.WS.templates.filter(function (x) { return x.id === f.template; })[0]; return t ? esc(t.id) + ' · ' + (t.status === 'pending' ? '<span class="fd-warn">pending approval</span>' : t.status === 'rejected' ? '<span class="fd-danger">rejected</span>' : 'approved') : '<span class="fd-danger">No template chosen</span>';
      case 'action.transfer': return f.to === 'A phone number' ? esc(f.number || 'No number') : 'Rep console · ' + esc((f.queue || 'Any available rep').toLowerCase());
      default: return '';
    }
  }
  function stepName(s, ctx) {
    var r = VF.reg(s), by = ctx.by, parts = ['#' + s.no + ' ' + s.title, 'step ' + (ctx.co.order.indexOf(s.id) + 1) + ' of ' + S.m.steps.length + ' in call order', r.phase ? VF.PHASES[r.phase].name + (r.name !== VF.PHASES[r.phase].name && r.phase !== 'outcome' ? ', ' + r.name : '') : 'Unsupported step'];
    var outs = s.outs.filter(function (o) { return o.label; });
    if (outs.length) parts.push((r.rows === 'results' ? 'Results: ' : 'Answers: ') + outs.map(function (o) { var t = by[o.to]; return o.label + (t ? ' goes to ' + t.title : ' is not connected'); }).join('; '));
    else if (s.outs[0]) { var t0 = by[s.outs[0].to]; parts.push(t0 ? 'Next: ' + t0.title : 'Not connected to a next step'); }
    if (s.type === 'outcome.end') parts.push(s.f.lead ? 'Sets lead to ' + VF.leadWord(s.f.lead) : 'Choose what this call records');
    var iss = ctx.iss[s.id]; if (iss) parts.push(VF.issueWords(VF.counts(iss)));
    return parts.join('. ') + '.';
  }
  function sockName(s, o, t) {
    var r = VF.reg(s);
    if (!o.label) return 'Next step of ' + s.title + (t ? ', goes to ' + t.title + '. Press Enter to change.' : ', not connected. Press C to connect.');
    var kind = r.rows === 'results' ? 'Result ' : o.fb ? '' : 'Answer ';
    return kind + o.label + (o.fb ? ' fallback' : '') + ' of ' + s.title + (t ? ', goes to ' + t.title + '. Press Enter to change.' : ', ' + (o.fb ? 'required, ' : '') + 'not connected. Press C to connect.');
  }
  function badges(s, ctx) {
    var b = [], band = ctx.band, iss = ctx.iss[s.id];
    if (S.test && S.test.current === s.id) b.push('<span class="tag tag--info">' + VF.icon('play', 'xs') + (band === 'full' ? 'Now' : '') + '</span>');
    else if (S.test && S.test.reached && S.test.reached.indexOf(s.id) >= 0) b.push('<span class="tag">' + VF.icon('check', 'xs') + (band === 'full' ? 'Reached' : '') + '</span>');
    if (ctx.cmp && ctx.cmp[s.id]) b.push(ctx.cmp[s.id] === 'added' ? '<span class="tag tag--success">Added</span>' : '<span class="tag">Changed</span>');
    if (iss) {
      var c = VF.counts(iss), un = iss.some(function (i) { return i.unreachable; });
      if (un && !c.warnings && c.errors === 1) b.push('<span class="tag tag--danger">' + VF.icon('unlink', 'xs') + (band === 'full' ? 'Not connected' : '') + '</span>');
      else if (c.errors) b.push('<span class="tag tag--danger">' + VF.icon('circle-x', 'xs') + (band === 'full' ? VF.issueWords({ errors: c.errors, warnings: 0 }) : c.errors + c.warnings) + '</span>');
      else b.push('<span class="tag tag--warning">' + VF.icon('triangle-alert', 'xs') + (band === 'full' ? VF.issueWords({ errors: 0, warnings: c.warnings }) : c.warnings) + '</span>');
    }
    return b.length ? '<div class="node-badges" aria-hidden="true">' + b.slice(0, 2).join('') + '</div>' : '';
  }
  function sockBtn(s, o, ctx, extra) {
    var t = ctx.by[o.to], sel = ctx.sel[s.id], cls = 'sock' + (extra || '') + (t ? (sel ? ' sock--active' : '') : s._fresh ? ' sock--free' : ' sock--open');
    var plus = !t && !ctx.ro ? '<button type="button" class="sock-add fd-plus" tabindex="-1" aria-label="Add a step after ' + esc(o.label || s.title) + '" data-plus="' + esc(o.id) + '">' + VF.icon('plus', 'xs') + '</button>' : '';
    return '<button type="button" class="' + cls + '" tabindex="-1" data-out="' + esc(o.id) + '" aria-label="' + esc(sockName(s, o, t)) + '" aria-keyshortcuts="C A Delete" data-mark' + (t ? '' : '="hollow"') + '></button>' + (!t && !s._fresh ? '<span class="sock-stub" aria-hidden="true"></span>' : '') + plus;
  }
  function row(s, o, ctx) {
    var r = VF.reg(s), t = ctx.by[o.to], open = !t && !s._fresh, band = ctx.band;
    if (r.rows === 'results') {
      return '<div class="res-row' + (o.fb ? ' res-row--fallback' : '') + '" data-row="' + esc(o.id) + '">' + VF.icon(o.res === 'ok' ? 'check' : 'x', 'xs') + '<span class="res-label">' + esc(o.label) + '</span>' + (open && band === 'full' ? '<span class="ans-ex fd-warn">Not connected</span>' : '') + sockBtn(s, o, ctx) + '</div>';
    }
    var ex = o.fb ? (o.label === 'No reply' ? 'after ' + ((s.f && s.f.wait) || 6) + ' s' + (s.f && s.f.unclear === 'Ask again once' ? ' · asks again once' : '') : 'anything else') : (o.ex || []).map(function (e) { return '<span lang="' + VF.langOf(e) + '">' + markHtml(e) + '</span>'; }).join(' · ');
    return '<div class="ans' + (o.fb ? ' ans--fallback' : '') + (open ? ' ans--open' : '') + '" data-row="' + esc(o.id) + '"><span class="ans-label">' + markHtml(o.label) + '</span>' + (band === 'full' ? '<span class="ans-ex">' + (open ? 'Not connected' : ex) + '</span>' : '') + sockBtn(s, o, ctx) + '</div>';
  }
  function nodeHtml(s, ctx) {
    var r = VF.reg(s), p = r.phase, band = ctx.band, iss = ctx.iss[s.id], c = iss ? VF.counts(iss) : null, id = esc(s.id);
    var cls = 'node' + (p === 'trigger' ? ' node--trigger' : p === 'logic' ? ' node--logic' : p === 'outcome' ? ' node--outcome' : '') + (band !== 'full' ? ' node--' + band : '');
    if (c && c.errors) cls += ' node--error'; else if (c && c.warnings) cls += ' node--warning';
    if (p !== 'trigger' && !ctx.co.reach[s.id]) cls += ' node--unreachable';
    if (ctx.dim && ctx.dim[s.id]) cls += ' node--dim';
    if (S.test && S.test.current === s.id) cls += ' node--now';
    if (ctx.cmp && ctx.cmp[s.id]) cls += ' node--' + ctx.cmp[s.id];
    if (ctx.sel[s.id]) cls += ' is-selected';
    if (!ctx.ro) cls += ' fd-node' + (!/node--(error|warning)| is-selected/.test(cls) ? ' fd-node--plain' : '');
    var tile = '<span class="gt ' + VF.tileClass(s) + '" aria-hidden="true">' + VF.icon(r.icon, band === 'block' ? 'lg' : 'sm') + '</span>';
    var hasIn = p !== 'trigger', inConn = hasIn && ctx.inc[s.id];
    var inPort = hasIn ? '<span class="sock sock--in' + (inConn ? '' : ' sock--free') + '" aria-hidden="true" data-mark' + (inConn ? '' : '="hollow"') + '></span>' : '';
    var attrs = ' role="group" aria-roledescription="step" tabindex="' + (ctx.focus === s.id ? '0' : '-1') + '" data-id="' + id + '" aria-label="' + esc(stepName(s, ctx)) + '" aria-describedby="fd-instr" style="left:' + s.x + 'px;top:' + s.y + 'px"';
    if (band === 'block') {
      var n = s.outs.length, stubs = s.outs.map(function (o, i) { return '<span class="fd-stub" style="top:' + Math.round((i + 1) * 100 / (n + 1)) + '%">' + sockBtn(s, o, ctx) + '</span>'; }).join('');
      return '<div class="' + cls + '"' + attrs + '>' + badges(s, ctx) + inPort + tile + '<span class="node-blocklabel" aria-hidden="true"><i>#' + s.no + '</i><wbr>' + esc(s.title) + '</span>' + stubs + '</div>';
    }
    var word = ctx.cmpWord && ctx.cmpWord[s.id] ? ctx.cmpWord[s.id] : '';
    var phaseTxt = (p ? VF.PHASES[p].name + (p !== 'trigger' && p !== 'outcome' && r.name !== VF.PHASES[p].name ? ' · ' + r.name : '') : 'Unsupported step') + (word ? ' · ' + word : '');
    var body = '<div class="node-phase"><span>' + esc(phaseTxt) + '</span><span class="node-no">#' + s.no + '</span></div><div class="node-title" translate="no">' + markHtml(s.title) + '</div>';
    if (band === 'full') {
      if (s.f.prompt && (p === 'logic' || p === 'action') && s.type !== 'action.meeting') body += '<div class="node-sum"' + (s.f.lang ? ' lang="' + esc(s.f.lang) + '"' : '') + '>' + tokensMarked(s.f.prompt) + '</div>';
      if (s.type === 'unknown') body += '<div class="node-meta">Type "' + esc(s.raw) + '" isn’t supported</div>';
      else if (p === 'outcome') body += s.f.lead ? '<div class="node-status">Lead' + VF.icon('arrow-right', 'xs') + '<b>' + esc(VF.leadWord(s.f.lead)) + '</b></div>' : '<div class="node-status">' + (s.f.outcome ? 'Lead unchanged' : 'Choose what this call records') + '</div>';
      else { var ml = metaLine(s); if (ml) body += '<div class="node-meta">' + ml + '</div>'; }
    }
    var rows = '';
    if (r.rows) rows = s.outs.map(function (o) { return row(s, o, ctx); }).join('');
    else if (s.type === 'unknown') rows = '<div class="ans fd-convert-row"><button type="button" class="btn btn--sm fd-convert-btn" tabindex="-1" data-convert>Convert to…</button></div>';
    var headSock = !r.rows && s.outs[0] ? sockBtn(s, s.outs[0], ctx, ' sock--head') : '';
    return '<div class="' + cls + '"' + attrs + '>' + badges(s, ctx) + inPort + '<div class="node-head">' + tile + '<div class="node-text">' + body + '</div></div>' + rows + headSock + '</div>';
  }

  /* ---------- context for one render ---------- */
  function context(steps) {
    var by = VF.byId(steps), iss = {}, inc = {}, sel = {}, ctx;
    (S.viewing ? (S.viewing.issues = S.viewing.issues || VF.validate(S.viewing.steps)) : S.issues).forEach(function (i) { if (i.stepId) (iss[i.stepId] = iss[i.stepId] || []).push(i); });
    steps.forEach(function (s) { s.outs.forEach(function (o) { if (o.to) inc[o.to] = 1; }); });
    S.sel.forEach(function (id) { sel[id] = 1; });
    ctx = { by: by, iss: iss, inc: inc, sel: sel, co: VF.callOrder(steps), band: S.view.band, focus: S.focus, ro: !!VF.readOnlyReason(), dim: VF.dimSet ? VF.dimSet() : null };
    if (S.compare) { ctx.cmp = {}; S.compare.diff.rows.forEach(function (r0) { if (r0.id && r0.kind !== 'removed') ctx.cmp[r0.id] = r0.kind; }); }
    else if (S.opts.changes && S.m.live && !S.viewing) { ctx.cmpWord = {}; VF.draftDiff().rows.forEach(function (r0) { if (r0.id) ctx.cmpWord[r0.id] = r0.kind === 'added' ? 'New' : 'Edited'; }); }
    return ctx;
  }
  VF.visibleSteps = function () { return S.viewing ? S.viewing.steps : S.m.steps; };

  /* ---------- render ---------- */
  /* Frames and notes (flow-designer-frames.js) draw under the steps; a collapsed frame draws one block in place of its
     members (FD1 §12.4). Focus is kept on the same step, socket, frame control or note across a re-render. */
  VF.renderCanvas = function () {
    if (!E.nl || !S.m) return;
    var steps = VF.visibleSteps(), ctx = context(steps), ae = d.activeElement, keep = null, hid = VF.hiddenSet ? VF.hiddenSet() : null;
    if (ae && E.nl.contains(ae)) { var nd = ae.closest('.node'), fr = ae.closest('[data-frame]'), nt = ae.closest('[data-note]'); keep = { id: nd && nd.getAttribute('data-id'), out: ae.getAttribute('data-out'), fr: !nd && fr ? fr.getAttribute('data-frame') : null, frk: ae.getAttribute('data-fr'), note: nt && nt.getAttribute('data-note') }; }
    if (S.focus && !ctx.by[S.focus]) S.focus = null;
    if (!S.focus && steps.length) { ctx.focus = S.focus = ctx.co.order[0]; }
    var ghosts = S.compare ? S.compare.diff.rows.filter(function (r0) { return r0.kind === 'removed'; }).map(function (r0) { return ghostHtml(r0.ghost, ctx); }).join('') : '';
    E.nl.innerHTML = (VF.framesHtml ? VF.framesHtml(ctx) : '') + '<svg class="edges" id="fd-edges" aria-hidden="true" focusable="false"></svg>' + ghosts + (VF.notesHtml ? VF.notesHtml(ctx) : '') + steps.filter(function (s) { return !hid || !hid[s.id]; }).map(function (s) { return nodeHtml(s, ctx); }).join('');
    E.nl.style.setProperty('--z', S.view.q);
    measure(steps);
    if (VF.layoutFrames) VF.layoutFrames();
    VF.renderEdges(ctx);
    var took = VF.afterCanvas ? VF.afterCanvas(ctx) : false;   /* an open frame-title or note editor keeps focus */
    if (keep && !took) {
      var t2 = null, R = VF.repOf || function (x) { return x; };
      if (keep.note) t2 = E.nl.querySelector('[data-note="' + keep.note + '"]');
      else if (keep.fr) t2 = E.nl.querySelector('[data-frame="' + keep.fr + '"] [data-fr="' + keep.frk + '"]') || E.nl.querySelector('.node[data-id="frame:' + keep.fr + '"]');
      else if (keep.id) {
        var n2 = E.nl.querySelector('.node[data-id="' + keep.id + '"]');
        if (!n2 && keep.id.indexOf('frame:') === 0) t2 = E.nl.querySelector('[data-frame="' + keep.id.slice(6) + '"] [data-fr="toggle"]');
        if (!n2 && !t2) n2 = E.nl.querySelector('.node[data-id="' + R(keep.id) + '"]');
        if (n2) { t2 = keep.out ? n2.querySelector('.sock[data-out="' + keep.out + '"]') || n2 : n2; if (keep.out && t2 !== n2) t2.tabIndex = 0; }
      }
      /* the focused thing went away (an undone frame, a deleted note): fall back to the roving step, never <body> */
      if (!t2 && S.focus && (keep.fr || keep.note || (keep.id && keep.id.indexOf('frame:') === 0))) t2 = E.nl.querySelector('.node[data-id="' + S.focus + '"]') || E.nl.querySelector('.node[data-id="' + R(S.focus) + '"]');
      if (t2) { if (t2.tabIndex < 0 && !t2.matches('.sock')) { $$('[tabindex="0"]', E.nl).forEach(function (x) { x.tabIndex = -1; }); t2.tabIndex = 0; } t2.focus({ preventScroll: true }); }
    }
    VF.applyView(); VF.layoutBlockLabels(); VF.renderMinimap(); VF.renderBands(ctx);
    VF.emit('rendered');
  };
  function ghostHtml(g, ctx) { var c = { by: ctx.by, iss: {}, inc: {}, sel: {}, co: ctx.co, band: ctx.band, focus: null, ro: true }; return nodeHtml(g, c).replace('class="node', 'class="node node--removed fd-ghost').replace(/ role="group"[^>]*tabindex="-?\d"/, ' aria-hidden="true" tabindex="-1"').replace('<div class="node-badges" aria-hidden="true">', '<div class="node-badges" aria-hidden="true"><span class="tag tag--danger">Removed</span>'); }
  function offsetIn(elm, root) { var y = 0; while (elm && elm !== root) { y += elm.offsetTop; elm = elm.offsetParent; } return y; }
  function measure(steps) {
    pos = {}; var by = {}; steps.forEach(function (x) { by[x.id] = x; });
    $$('.node', E.nl).forEach(function (n) {
      var id = n.getAttribute('data-id'), g = { w: n.offsetWidth, h: n.offsetHeight, x: n.offsetLeft, y: n.offsetTop, outs: {} }, s = by[id];
      var ip = n.querySelector('.sock--in'); g.inY = ip ? offsetIn(ip, n) + ip.offsetHeight / 2 : 42;
      $$('.sock[data-out]', n).forEach(function (k) { g.outs[k.getAttribute('data-out')] = offsetIn(k, n) + k.offsetHeight / 2; });
      if (id) { pos[id] = g; if (s && S.view.band === 'full') s._h = g.h; }
    });
  }
  VF.geom = function (id) { return pos[id]; };
  /* ---------- orthogonal routing with 8 px corners (FD1 §7.1) ---------- */
  function clearH(x1, x2, y, boxes) { var a = Math.min(x1, x2), b = Math.max(x1, x2); return !boxes.some(function (k) { return y > k.y - 6 && y < k.y + k.h + 6 && b > k.x - 6 && a < k.x + k.w + 6; }); }
  function clearV(x, y1, y2, boxes) { var a = Math.min(y1, y2), b = Math.max(y1, y2); return !boxes.some(function (k) { return x > k.x - 6 && x < k.x + k.w + 6 && b > k.y - 6 && a < k.y + k.h + 6; }); }
  function route(a, b, lane, boxes, low) {
    var end = { x: b.x - 7, y: b.y }, gx = a.x + 14 + 8 * Math.min(lane, 4), tx = b.x - 24;
    if (b.x - a.x >= 64) {
      if (Math.abs(a.y - b.y) < 1 && clearH(a.x, end.x, a.y, boxes)) return [a, end];
      if (clearV(gx, a.y, b.y, boxes) && clearH(gx, end.x, b.y, boxes)) return [a, { x: gx, y: a.y }, { x: gx, y: b.y }, end];
      if (clearH(a.x, tx, a.y, boxes) && clearV(tx, a.y, b.y, boxes)) return [a, { x: tx, y: a.y }, { x: tx, y: b.y }, end];
      var cands = [], best = null;
      boxes.forEach(function (k) { if (k.x + k.w > gx && k.x < tx) { cands.push(k.y - 20); cands.push(k.y + k.h + 20); } });
      cands.forEach(function (y) { if (clearH(gx, tx, y, boxes) && clearV(gx, a.y, y, boxes) && clearV(tx, y, b.y, boxes)) { var cost = Math.abs(y - a.y) + Math.abs(y - b.y); if (!best || cost < best.c) best = { y: y, c: cost }; } });
      var yc = best ? best.y : low;
      return [a, { x: gx, y: a.y }, { x: gx, y: yc }, { x: tx, y: yc }, { x: tx, y: b.y }, end];
    }
    return [a, { x: a.x + 16, y: a.y }, { x: a.x + 16, y: low }, { x: b.x - 16, y: low }, { x: b.x - 16, y: b.y }, end];
  }
  function pathD(p) {
    var q = [p[0]]; for (var i = 1; i < p.length; i++) { var l = q[q.length - 1]; if (Math.abs(l.x - p[i].x) > 0.5 || Math.abs(l.y - p[i].y) > 0.5) q.push(p[i]); }
    var dd = 'M' + q[0].x + ' ' + q[0].y;
    for (var j = 1; j < q.length - 1; j++) {
      var A = q[j - 1], B = q[j], C = q[j + 1], lab = Math.hypot(B.x - A.x, B.y - A.y), lbc = Math.hypot(C.x - B.x, C.y - B.y), r = Math.min(8, lab / 2, lbc / 2);
      var p1 = { x: B.x + (A.x - B.x) * r / lab, y: B.y + (A.y - B.y) * r / lab }, p2 = { x: B.x + (C.x - B.x) * r / lbc, y: B.y + (C.y - B.y) * r / lbc };
      dd += ' L' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1) + ' Q' + B.x + ' ' + B.y + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    var z = q[q.length - 1]; return { d: dd + ' L' + z.x + ' ' + z.y, pts: q };
  }
  function longestRun(pts) { var best = null; for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i]; if (Math.abs(a.y - b.y) < 0.5) { var len = Math.abs(b.x - a.x); if (!best || len > best.len) best = { len: len, x: (a.x + b.x) / 2, y: a.y }; } } return best || { x: pts[0].x + 24, y: pts[0].y, len: 0 }; }

  VF.edges = [];
  /* A connection into or out of a collapsed frame re-routes to the frame block’s input port or its exit socket for that
     target ("To Visit booked"); connections inside it are hidden (FD1 §12.4). */
  VF.renderEdges = function (ctx) {
    var svg = $('#fd-edges'); if (!svg) return; ctx = ctx || context(VF.visibleSteps());
    var steps = VF.visibleSteps(), boxes = [], minX = 0, minY = 0, maxX = 0, maxY = 0, L = VF.layers(steps), back = VF.backEdges(steps), R = VF.repOf || function (x) { return x; };
    function xy(id) { var s = ctx.by[id]; if (s && R(id) === id) return { x: s.x, y: s.y }; var g = pos[id]; return g ? { x: g.x, y: g.y } : null; }
    function add(b) { boxes.push(b); minX = Math.min(minX, b.x); minY = Math.min(minY, b.y); maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h); }
    steps.forEach(function (s) { if (R(s.id) !== s.id) return; var g = pos[s.id] || { w: VF.width(s), h: 100 }; add({ id: s.id, x: s.x, y: s.y, w: g.w, h: g.h }); });
    Object.keys(pos).forEach(function (id) { if (id.indexOf('frame:') === 0) { var g = pos[id]; add({ id: id, x: g.x, y: g.y, w: g.w, h: g.h }); } });
    var low = maxY + 32, list = [], seen = {}, sel = S.sel, selEdge = S.selEdge, trav = (S.test && S.test.edges) || [];
    steps.forEach(function (s) {
      var from = R(s.id), g = pos[from], A = g && xy(from); if (!A) return;
      s.outs.forEach(function (o, i) {
        var t = ctx.by[o.to]; if (!t) return; var to = R(t.id), tg = pos[to], B = tg && xy(to); if (!B || to === from) return;
        var ok = from === s.id ? o.id : 'to:' + to, dk = from + '|' + ok + '>' + to; if (seen[dk]) return; seen[dk] = 1;
        var a = { x: A.x + g.w, y: A.y + (g.outs[ok] != null ? g.outs[ok] : 42) }, b = { x: B.x, y: B.y + tg.inY };
        var others = boxes.filter(function (k) { return k.id !== from && k.id !== to; });
        var isBack = back[s.id + '|' + o.id] || b.x - a.x < 64;
        var lowHere = Math.max(A.y + g.h, B.y + tg.h) + 32; if (!isBack) lowHere = low;
        var P = pathD(route(a, b, i, others, lowHere)), key = s.id + '|' + o.id;
        var st = trav.indexOf(key) >= 0 || key === selEdge ? 'active' : (sel.indexOf(s.id) >= 0 || sel.indexOf(t.id) >= 0) ? 'connected' : '';
        var dim = ctx.dim && (ctx.dim[s.id] || ctx.dim[t.id]);
        var long = (L[t.id] - L[s.id] >= 2) || isBack;
        list.push({ key: key, d: P.d, fb: !!o.fb, st: st, dim: dim, label: from === s.id ? o.label || '' : '', long: long, run: longestRun(P.pts), ax: a.x, bx: b.x, from: s, to: t, out: o });
      });
    });
    VF.edges = list;
    var q = S.view.q, mk = function (id, cls) { return '<marker id="' + id + '" viewBox="0 0 8 8" refX="7" refY="4" markerUnits="userSpaceOnUse" markerWidth="' + (8 / q).toFixed(2) + '" markerHeight="' + (8 / q).toFixed(2) + '" orient="auto"><path class="fd-mk ' + cls + '" d="M0 0 L8 4 L0 8 z"/></marker>'; };
    var pad = 400; svg.setAttribute('viewBox', (minX - pad) + ' ' + (minY - pad) + ' ' + (maxX - minX + 2 * pad) + ' ' + (maxY - minY + 2 * pad));
    svg.style.left = (minX - pad) + 'px'; svg.style.top = (minY - pad) + 'px'; svg.style.width = (maxX - minX + 2 * pad) + 'px'; svg.style.height = (maxY - minY + 2 * pad) + 'px'; svg.style.right = 'auto'; svg.style.bottom = 'auto';
    svg.innerHTML = '<defs>' + mk('fd-mk', '') + mk('fd-mk-h', 'fd-mk--hover') + mk('fd-mk-a', 'fd-mk--active') + '</defs>' + list.map(function (e) {
      var m = e.st === 'active' ? 'fd-mk-a' : e.st === 'connected' ? 'fd-mk-h' : 'fd-mk';
      return '<path class="fe' + (e.fb ? ' fe--fallback' : '') + (e.st ? ' fe--' + e.st : '') + (e.dim ? ' fe--dim' : '') + '" data-edge="' + esc(e.key) + '" data-edge-line d="' + e.d + '" marker-end="url(#' + m + ')"/>';
    }).join('') + (VF.readOnlyReason() && !S.compare ? '' : list.map(function (e) { return '<path class="fd-ehit" data-edge="' + esc(e.key) + '" d="' + e.d + '"/>'; }).join(''));
    VF.renderLabels();
  };

  /* Edge labels: long branch edges, hover, selection or a focused socket; never in the Block band (FD1 §7.3). */
  VF.renderLabels = function () {
    if (!E.labels) return;
    var focusSock = d.activeElement && d.activeElement.matches && d.activeElement.matches('.sock[data-out]') ? d.activeElement.closest('.node').getAttribute('data-id') + '|' + d.activeElement.getAttribute('data-out') : null;
    var show = S.view.band !== 'block' && S.opts.labels;
    E.labels.innerHTML = !show ? '' : VF.edges.filter(function (e) { return e.label && (e.long || e.key === S.selEdge || e.key === S.hoverEdge || e.key === focusSock); }).map(function (e) {
      return '<span class="elb' + (e.key === S.selEdge ? ' elb--active' : '') + ' fd-elb" data-x="' + e.run.x + '" data-y="' + e.run.y + '"' + (e.bx > e.ax && e.run.x > e.ax && e.run.x < e.bx ? ' data-ax="' + e.ax + '" data-bx="' + e.bx + '"' : '') + '>' + esc(e.label) + '</span>';
    }).join('');
    VF.positionOverlays();
  };
  VF.positionOverlays = function () {
    if (!E.labels) return;
    /* A label on a short run between two close steps keeps 8 px clear of both (FD1 §7.3): its centre is clamped into the gap. */
    $$('.fd-elb', E.labels).forEach(function (l) {
      var p = VF.toScreen(+l.getAttribute('data-x'), +l.getAttribute('data-y'));
      if (l.hasAttribute('data-ax')) { var hw = l.offsetWidth / 2, lo = VF.toScreen(+l.getAttribute('data-ax'), 0).x + hw + 8, hi = VF.toScreen(+l.getAttribute('data-bx'), 0).x - hw - 8; p.x = lo <= hi ? Math.min(hi, Math.max(lo, p.x)) : (lo + hi) / 2; }
      l.style.left = p.x + 'px'; l.style.top = p.y + 'px';
    });
    $$('[data-flow-x]', E.top).forEach(function (l) { var p = VF.toScreen(+l.getAttribute('data-flow-x'), +l.getAttribute('data-flow-y')); l.style.left = p.x + 'px'; l.style.top = p.y + 'px'; });
    if (VF.renderMinimapView) VF.renderMinimapView();
    if (S.opts.phaseCols && VF._bandLayers) VF.positionBands();
  };

  /* ---------- fit, zoom, reveal ---------- */
  /* The box a step is drawn as: a member of a collapsed frame is drawn as its frame’s block (FD1 §12.4). */
  function drawnBox(s) {
    var rep = VF.repOf ? VF.repOf(s.id) : s.id, g = pos[rep];
    if (rep !== s.id && g) return { x: g.x, y: g.y, w: g.w, h: g.h };
    g = pos[s.id] || { w: VF.width(s), h: 120 }; return { x: s.x, y: s.y, w: g.w, h: g.h };
  }
  VF.drawnBox = function (id) { var s = VF.stepAny ? VF.stepAny(id) : VF.step(id); if (s) return drawnBox(s); var g = pos[id]; return g ? { x: g.x, y: g.y, w: g.w, h: g.h } : null; };
  VF.bounds = function (ids) {
    var st = VF.visibleSteps().filter(function (s) { return !ids || ids.indexOf(s.id) >= 0; }); if (!st.length) return null;
    var b = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
    st.forEach(function (s) { var k = drawnBox(s); b.x1 = Math.min(b.x1, k.x); b.y1 = Math.min(b.y1, k.y); b.x2 = Math.max(b.x2, k.x + k.w); b.y2 = Math.max(b.y2, k.y + k.h); });
    if (!ids && VF.frameBounds) VF.frameBounds(b);
    return b;
  };
  VF.insets = function () {
    var r = { l: 0, t: 0, r: 0, b: 0 }, ins = $('#fd-insp');
    if (S.inspOverlay && ins && !ins.hidden) r.r = ins.offsetWidth;
    var lp = $('#fd-left'); if (lp && !lp.hidden && lp.classList.contains('is-overlay')) r.l = lp.offsetWidth;
    var pp = $('.fd-ppanel'); if (pp) r.b = Math.max(r.b, pp.offsetHeight);
    return r;
  };
  /* Canvas chrome that floats over the steps: controls (bottom left), minimap (bottom right), selection bar (bottom
     centre), Find bar (top right) and canvas notices (top). Fit and auto-pan keep the selection clear of every one of them
     (FD1 §9.3 "never place the selection under it", §11.1, §16.2). Rects are canvas-local screen px. */
  VF.obstacles = function () {
    if (!E.canvas) return []; var cr = E.canvas.getBoundingClientRect(), out = [];
    $$('.minimap, .canvas-ctl, .fd-selbar, .findbar, .fd-canvas-top > .notice', E.canvas).forEach(function (el) { if (!el.offsetWidth) return; var r = el.getBoundingClientRect(); out.push({ l: r.left - cr.left, t: r.top - cr.top, r: r.right - cr.left, b: r.bottom - cr.top }); });
    if (VF.minimapOn() && !$('.minimap', E.canvas)) out.push({ l: cr.width - 188, t: cr.height - 124, r: cr.width - 12, b: cr.height - 12 });
    return out;
  };
  /* Nudge a pan (tx, ty) so the box clears every obstacle by 12 px, taking the smallest move that keeps it in the frame. */
  function clearOf(box, z, tx, ty, frame, obs) {
    var m = 12;
    for (var pass = 0; pass < 4; pass++) {
      var l = tx + box.x * z, t = ty + box.y * z, r = l + box.w * z, b = t + box.h * z, hit = null;
      obs.forEach(function (o) { if (!hit && l < o.r + m && r > o.l - m && t < o.b + m && b > o.t - m) hit = o; });
      if (!hit) break;
      var c = [{ dx: 0, dy: hit.t - m - b }, { dx: 0, dy: hit.b + m - t }, { dx: hit.l - m - r, dy: 0 }, { dx: hit.r + m - l, dy: 0 }]
        .filter(function (k) { return l + k.dx >= frame.l - 1 && r + k.dx <= frame.r + 1 && t + k.dy >= frame.t - 1 && b + k.dy <= frame.b + 1; })
        .sort(function (a, b2) { return Math.abs(a.dx) + Math.abs(a.dy) - Math.abs(b2.dx) - Math.abs(b2.dy); });
      if (!c.length) break; tx += c[0].dx; ty += c[0].dy;
    }
    return { tx: tx, ty: ty };
  }
  /* One animation at a time: a new pan or zoom (or a gesture) supersedes the one in flight. */
  var animTok = 0;
  VF.stopAnim = function () { animTok++; };
  VF.animateTo = function (z, tx, ty, o) {
    o = o || {}; var tok = ++animTok, v = S.view, z0 = v.zoom, x0 = v.tx, y0 = v.ty, dur = V.reducedMotion() || o.instant ? 0 : 200, t0 = performance.now();
    if (!dur) { v.zoom = z; v.tx = tx; v.ty = ty; VF.applyView(true); if (o.done) o.done(); return; }
    function step(now) { if (tok !== animTok) return; var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); v.zoom = z0 + (z - z0) * e; v.tx = x0 + (tx - x0) * e; v.ty = y0 + (ty - y0) * e; VF.applyView(k >= 1); if (k < 1) requestAnimationFrame(step); else if (o.done) o.done(); }
    requestAnimationFrame(step);
  };
  /* Fit (FD1 §9.1): every step with 48 px padding (8 % in Review and phone, 05 §10.7) plus the overlays. In the Block
     band each title is a label that starts 60 flow px into its step and runs 140 screen px (§5.5), so the last column’s
     labels count too. Clamped at the minimum zoom, the boxes stay on screen, left-aligned so the last labels get the most
     room; when even the boxes are wider than the canvas they are centred (or anchored on the Triggers, below). */
  VF.fit = function (ids, o) {
    o = o || {}; if (!ids && o.anchorFirst === undefined) o.anchorFirst = true;   /* whole-flow Fit keeps the start of the call in view when the flow can't fit (FD1 §9.2) */
    var b = VF.bounds(ids); if (!b || !E.canvas) return;
    var r = E.canvas.getBoundingClientRect(), ins = VF.insets(), ro = S.mode === 'review' || S.mode === 'phone', pad = ro ? Math.max(16, Math.round(r.width * 0.04)) : 48;
    var ctl = $('.canvas-ctl', E.canvas), reserve = VF.minimapOn() ? 136 : (ctl ? ctl.offsetHeight + 24 : 56);
    var W = r.width - ins.l - ins.r - 2 * pad, H = r.height - ins.b - pad - Math.max(pad, reserve); if (W < 80 || H < 80) { W = Math.max(80, r.width - 48); H = Math.max(80, r.height - 48); }
    var bw = Math.max(1, b.x2 - b.x1), bh = Math.max(1, b.y2 - b.y1), z = Math.min(W / bw, H / bh, 2);
    var fs = VF.visibleSteps().filter(function (s) { return !ids || ids.indexOf(s.id) >= 0; });
    function labelRight(zz) { var m = 0; fs.forEach(function (s) { var k = drawnBox(s); m = Math.max(m, (k.x - b.x1 + 60) * zz + 140); }); return m; }
    if (z < 0.5) fs.forEach(function (s) { var k = drawnBox(s), zl = (W - 140) / Math.max(1, k.x - b.x1 + 60); if (zl > 0 && zl < z) z = zl; });
    z = Math.max(o.min || 0.25, Math.min(o.max || 2, z));
    var cw = z < 0.5 ? Math.max(bw * z, labelRight(z)) : bw * z;
    var tx = ins.l + pad + (W - cw) / 2 - b.x1 * z, ty = pad + (H - bh * z) / 2 - b.y1 * z;
    /* Wider than the canvas: at the absolute minimum (25 %) centre the drawing; a mode’s own floor (Review 50 %) or the
       open-on-load fit keeps the start of the call, the Triggers, in view. */
    if (cw > W + 1) tx = bw * z <= W + 1 || o.anchorFirst || (o.min || 0.25) > 0.25 ? ins.l + pad - b.x1 * z : ins.l + pad + (W - bw * z) / 2 - b.x1 * z;
    if (o.anchorFirst && bw * z > W + 1) { var trig = VF.visibleSteps().filter(function (s) { return VF.phaseOf(s) === 'trigger'; })[0]; if (trig && bh * z > H + 1) ty = r.height / 2 - (trig.y + 42) * z; }
    VF.animateTo(z, tx, ty, { instant: o.instant });
  };
  VF.zoomBy = function (f, o) { var r = E.canvas.getBoundingClientRect(), ax = o && o.x != null ? o.x : r.width / 2, ay = o && o.y != null ? o.y : r.height / 2; VF.zoomTo(S.view.zoom * f, ax, ay, o); };
  VF.zoomTo = function (z, ax, ay, o) {
    z = Math.max(0.25, Math.min(2, z)); var v = S.view; if (ax == null) { var r = E.canvas.getBoundingClientRect(); ax = r.width / 2; ay = r.height / 2; }
    var fx = (ax - v.tx) / v.zoom, fy = (ay - v.ty) / v.zoom;
    VF.animateTo(z, ax - fx * z, ay - fy * z, { instant: o && o.instant });
    if (o && o.announce) V.announce('Zoom ' + Math.round(z * 100) + ' %');
  };
  /* Focus follows into view: pan (never zoom, unless minZoom asks) so the step, or o.box, clears every panel and every
     piece of canvas chrome: minimap, controls, selection bar, Find bar, notices (FD1 §9.3, §11.1). */
  VF.reveal = function (id, o) {
    o = o || {}; var s = id ? VF.step(id) || (S.viewing && S.viewing.steps.filter(function (x) { return x.id === id; })[0]) : null;
    var box = o.box || (s ? drawnBox(s) : id ? VF.drawnBox(id) : null); if (!box || !E.canvas) return;
    var v = S.view, r = E.canvas.getBoundingClientRect(), ins = VF.insets(), obs = VF.obstacles();
    var z = o.minZoom && v.zoom < o.minZoom ? o.minZoom : v.zoom;
    var left = ins.l + 24, top = 24, right = r.width - ins.r - 24, bottom = r.height - ins.b - 16;
    var sx = v.tx + box.x * z, sy = v.ty + box.y * z, w2 = box.w * z, h2 = box.h * z, tx = v.tx, ty = v.ty;
    if (z !== v.zoom) { tx = (left + right) / 2 - (box.x + box.w / 2) * z; ty = (top + bottom) / 2 - (box.y + box.h / 2) * z; }
    else {
      if (o.center || w2 > right - left) tx = (left + right) / 2 - (box.x + box.w / 2) * z; else if (sx < left) tx += left - sx; else if (sx + w2 > right) tx -= sx + w2 - right;
      if (o.center || h2 > bottom - top) ty = (top + bottom) / 2 - (box.y + box.h / 2) * z; else if (sy < top) ty += top - sy; else if (sy + h2 > bottom) ty -= sy + h2 - bottom;
    }
    var c = clearOf(box, z, tx, ty, { l: left, t: top, r: right, b: bottom }, obs); tx = c.tx; ty = c.ty;
    if (Math.abs(tx - v.tx) > 0.5 || Math.abs(ty - v.ty) > 0.5 || z !== v.zoom) VF.animateTo(z, tx, ty, { instant: o.instant });
  };
  /* Pasted and duplicated steps are panned fully into view as one group (FD1 §8.1 "panned into view"). */
  VF.revealIds = function (ids, o) { var b = VF.bounds(ids); if (!b) return; var x = {}; for (var k in (o || {})) x[k] = o[k]; x.box = { x: b.x1, y: b.y1, w: b.x2 - b.x1, h: b.y2 - b.y1 }; VF.reveal(null, x); };
  /* ---------- minimap (≥ 1280, aria-hidden; Fit, Find and the Outline are its keyboard equivalents) ---------- */
  VF.minimapOn = function () { return S.mode === 'full' && S.opts.minimap && E.canvas && E.canvas.offsetWidth >= 640 && !S.loading; };
  var mm = null, mmScale = null;
  VF.renderMinimap = function () {
    if (mm) { mm.remove(); mm = null; }
    if (!VF.minimapOn()) return;
    var b = VF.bounds(); if (!b) return;
    mm = d.createElement('div'); mm.className = 'minimap'; mm.setAttribute('aria-hidden', 'true');
    var W = 176 - 16, H = 112 - 16, k = Math.min(W / (b.x2 - b.x1), H / (b.y2 - b.y1)); mmScale = { k: k, b: b, ox: 8 + (W - (b.x2 - b.x1) * k) / 2, oy: 8 + (H - (b.y2 - b.y1) * k) / 2 };
    var errs = {}; S.issues.forEach(function (i) { if (i.level === 'error' && i.stepId) errs[i.stepId] = 1; });
    /* Frames draw first as their -border tint outline (FD1 §9.3); a collapsed frame’s members draw as its block. */
    var fr = (VF.frames ? VF.frames() : []).map(function (f) { var r = VF.isCollapsed(f) ? VF.drawnBox('frame:' + f.id) : VF.frameRect(f); if (!r) return ''; return '<i class="fd-mm-frame' + (f.tint ? ' fd-mm-frame--' + f.tint : '') + '" style="left:' + (mmScale.ox + (r.x - b.x1) * k).toFixed(1) + 'px;top:' + (mmScale.oy + (r.y - b.y1) * k).toFixed(1) + 'px;width:' + Math.max(2, r.w * k).toFixed(1) + 'px;height:' + Math.max(2, r.h * k).toFixed(1) + 'px"></i>'; }).join('');
    var hid = VF.hiddenSet ? VF.hiddenSet() : null;
    mm.innerHTML = fr + VF.visibleSteps().filter(function (s) { return !hid || !hid[s.id]; }).map(function (s) { var g = pos[s.id] || { w: 240, h: 100 }; return '<i class="' + (VF.phaseOf(s) === 'trigger' ? 'is-trigger' : errs[s.id] ? 'is-error' : '') + '" style="left:' + (mmScale.ox + (s.x - b.x1) * k).toFixed(1) + 'px;top:' + (mmScale.oy + (s.y - b.y1) * k).toFixed(1) + 'px;width:' + Math.max(2, g.w * k).toFixed(1) + 'px;height:' + Math.max(2, g.h * k).toFixed(1) + 'px"></i>'; }).join('') + '<span class="minimap-vp"></span>';
    E.canvas.appendChild(mm); VF.renderMinimapView();
    mm.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation(); mm.setPointerCapture(e.pointerId);
      var go = function (ev) { var rr = mm.getBoundingClientRect(), fx = mmScale.b.x1 + (ev.clientX - rr.left - mmScale.ox) / mmScale.k, fy = mmScale.b.y1 + (ev.clientY - rr.top - mmScale.oy) / mmScale.k, cr = E.canvas.getBoundingClientRect(); S.view.tx = cr.width / 2 - fx * S.view.zoom; S.view.ty = cr.height / 2 - fy * S.view.zoom; VF.applyView(); VF.userMoved = true; };
      go(e); mm.onpointermove = go; mm.onpointerup = function () { mm.onpointermove = null; VF.saveViewport(); };
    });
    mm.addEventListener('wheel', function (e) { e.preventDefault(); VF.zoomBy(e.deltaY < 0 ? 1.25 : 0.8); }, { passive: false });
  };
  VF.renderMinimapView = function () {
    if (!mm || !mmScale) return; var vpEl = mm.querySelector('.minimap-vp'), r = E.canvas.getBoundingClientRect(), a = VF.toFlow(0, 0), b2 = VF.toFlow(r.width, r.height), k = mmScale.k;
    var x1 = Math.max(0, mmScale.ox + (a.x - mmScale.b.x1) * k), y1 = Math.max(0, mmScale.oy + (a.y - mmScale.b.y1) * k), x2 = Math.min(176, mmScale.ox + (b2.x - mmScale.b.x1) * k), y2 = Math.min(112, mmScale.oy + (b2.y - mmScale.b.y1) * k);
    vpEl.style.left = x1 + 'px'; vpEl.style.top = y1 + 'px'; vpEl.style.width = Math.max(4, x2 - x1) + 'px'; vpEl.style.height = Math.max(4, y2 - y1) + 'px';
  };

  /* ---------- Phase columns view (FD1 §4.4): bands per layer behind the steps; a view preference only ---------- */
  VF.renderBands = function (ctx) {
    E.bands.innerHTML = ''; VF._bandLayers = null; if (!S.opts.phaseCols || S.view.q < 0.35) return;
    var steps = VF.visibleSteps(), L = VF.layers(steps), cols = {};
    steps.forEach(function (s) { var c = cols[L[s.id]] = cols[L[s.id]] || { x1: Infinity, x2: -Infinity, ph: {} }; var g = pos[s.id] || { w: VF.width(s) }; c.x1 = Math.min(c.x1, s.x); c.x2 = Math.max(c.x2, s.x + g.w); var p = VF.phaseOf(s) || 'action'; c.ph[p] = (c.ph[p] || 0) + 1; });
    VF._bandLayers = Object.keys(cols).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return cols[k]; });
    E.bands.innerHTML = VF._bandLayers.map(function (c) { var ph = Object.keys(c.ph).sort(function (a, b) { return c.ph[b] - c.ph[a]; }); return '<div class="phase-band"><div class="phase-band-head">' + ph.map(function (p) { return VF.PHASES[p].name + ' <b>' + c.ph[p] + '</b>'; }).join(' · ') + '</div></div>'; }).join('');
    VF.positionBands();
  };
  VF.positionBands = function () {
    var bs = $$('.phase-band', E.bands), L = VF._bandLayers || [], inl = VF.insets().l;
    bs.forEach(function (b, i) { var c = L[i], prev = L[i - 1], next = L[i + 1]; var x1 = prev ? (prev.x2 + c.x1) / 2 : c.x1 - 64, x2 = next ? (c.x2 + next.x1) / 2 : c.x2 + 64; var a = VF.toScreen(x1, 0), z = VF.toScreen(x2, 0); b.style.left = a.x + 'px'; b.style.width = Math.max(0, z.x - a.x) + 'px';
      /* The column header label never starts under the canvas edge or an overlay panel (it starts 8 px inside what shows). */
      var hd = b.firstChild, off = Math.max(0, inl - a.x); if (hd) hd.style.paddingLeft = off ? 'calc(var(--space-8) + ' + Math.round(off) + 'px)' : ''; });
  };

  /* ---------- viewport memory: per user and flow, never in the flow (D9, FD1 §9.2) ---------- */
  VF.saveViewport = function () { if (!S.m || S.viewing) return; VF.store.set('viewport:' + S.m.meta.id, JSON.stringify({ z: S.view.zoom, x: S.view.tx, y: S.view.ty })); };
  VF.restoreViewport = function () { try { var v = JSON.parse(VF.store.get('viewport:' + S.m.meta.id) || 'null'); if (v && v.z) { S.view.zoom = v.z; S.view.tx = v.x; S.view.ty = v.y; VF.applyView(true); return true; } } catch (e) { /* ignore */ } return false; };
})(window, document);
