/* Vaani Labs prototype · Flow Designer · FlowOutline (FD2 §16, FD1 §12.3): nested by branch in call order, linear chains
   flat, merges and loops as "Go to #n" references, unreachable steps last. A complete non-spatial editor at ≥ 1024
   (A, C, F2, Delete, Alt+↑/↓, Shift+F10); read-only in tablet Review mode and on phones. role="tree", roving tabindex. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  S.olCollapsed = {}; S.olFocus = null; S.olFilter = '';
  function ro() { return !!VF.readOnlyReason(); }

  function buildRows(steps) {
    var by = VF.byId(steps), rows = [], seen = {}, co = VF.callOrder(steps);
    function emit(s, lvl, parent) {
      if (seen[s.id]) { rows.push({ kind: 'ref', key: 'ref:' + parent + ':' + s.id, id: s.id, lvl: lvl }); return; }
      seen[s.id] = 1; rows.push({ kind: 'step', key: 'step:' + s.id, id: s.id, lvl: lvl });
      var r = VF.reg(s);
      if (r.rows) s.outs.forEach(function (o) { rows.push({ kind: 'ans', key: 'ans:' + s.id + ':' + o.id, id: s.id, out: o.id, lvl: lvl + 1 }); var t = by[o.to]; if (t) emit(t, lvl + 2, s.id + o.id); else rows.push({ kind: 'open', key: 'open:' + s.id + ':' + o.id, id: s.id, out: o.id, lvl: lvl + 2 }); });
      else if (s.outs[0]) { var t2 = by[s.outs[0].to]; if (t2) emit(t2, lvl, s.id); else rows.push({ kind: 'open', key: 'open:' + s.id + ':' + s.outs[0].id, id: s.id, out: s.outs[0].id, lvl: lvl + 1 }); }
    }
    steps.filter(function (s) { return VF.phaseOf(s) === 'trigger'; }).sort(function (a, b) { return a.no - b.no; }).forEach(function (t) { emit(t, 1, 'root'); });
    var un = steps.filter(function (s) { return !seen[s.id]; });
    if (un.length) { rows.push({ kind: 'group', key: 'group:unreached', lvl: 1, n: un.length }); un.forEach(function (s) { if (!seen[s.id]) emit(s, 2, 'un'); }); }
    for (var i = 0; i < rows.length; i++) { rows[i].exp = rows[i + 1] && rows[i + 1].lvl > rows[i].lvl; var par = -1; for (var j = i - 1; j >= 0; j--) if (rows[j].lvl < rows[i].lvl) { par = j; break; } rows[i].parent = par; }
    rows.forEach(function (r0, i) { var sib = rows.filter(function (x) { return x.parent === r0.parent && x.lvl === r0.lvl; }); r0.size = sib.length; r0.pos = sib.indexOf(r0) + 1; void i; });
    void co; return rows;
  }
  function visible(rows, all) {
    var out = [], hideBelow = null, q = S.olFilter.trim().toLowerCase();
    rows.forEach(function (r0) {
      if (hideBelow != null) { if (r0.lvl > hideBelow) return; hideBelow = null; }
      out.push(r0); if (r0.exp && S.olCollapsed[r0.key]) hideBelow = r0.lvl;
    });
    if (!q || all) return out;
    return out.filter(function (r0) { return matches(r0, q); });
  }
  function matches(r0, q) { if (r0.kind !== 'step' && r0.kind !== 'ref') return false; var s = VF.stepAny(r0.id); return !!s && (s.title + ' ' + (s.f.prompt || '') + ' ' + VF.reg(s).name + ' ' + (VF.reg(s).syn || []).join(' ')).toLowerCase().indexOf(q) >= 0; }
  /* FD-R3-02 (FD2 §16.2): the filter keeps context. Each run of filtered-out steps collapses into one "n hidden" line at its depth. */
  function withHidden(rows) {
    var q = S.olFilter.trim().toLowerCase(), out = [], run = 0, lvl = 1;
    rows.forEach(function (r0) {
      if (r0.kind !== 'step' && r0.kind !== 'ref') return;
      if (matches(r0, q)) { if (run) out.push({ kind: 'hidden', n: run, lvl: lvl }); run = 0; out.push(r0); }
      else { if (!run) lvl = r0.lvl; run += 1; }
    });
    if (run) out.push({ kind: 'hidden', n: run, lvl: lvl });
    return out;
  }
  function hiddenHtml(h) { return '<li class="fd-ol-hidden" aria-hidden="true" style="--lvl:' + (h.lvl - 1) + '">' + h.n + ' hidden</li>'; }
  var olSaid = null;
  VF.stepAny = function (id) { return VF.visibleSteps().filter(function (s) { return s.id === id; })[0] || null; };
  function rowHtml(r0, iss, reached, touch) {
    var s = r0.id ? VF.stepAny(r0.id) : null, sel = s && S.sel.indexOf(s.id) >= 0 && r0.kind === 'step', o = s && r0.out ? s.outs.filter(function (x) { return x.id === r0.out; })[0] : null;
    var attrs = ' role="treeitem" aria-level="' + r0.lvl + '" aria-setsize="' + r0.size + '" aria-posinset="' + r0.pos + '"' + (r0.exp ? ' aria-expanded="' + !S.olCollapsed[r0.key] + '"' : '') + ' aria-selected="' + !!sel + '" tabindex="' + (S.olFocus === r0.key ? 0 : -1) + '" data-row="' + esc(r0.key) + '" style="--lvl:' + (r0.lvl - 1) + '"';
    var cls = 'fd-ol-row fd-ol-row--' + r0.kind + (sel ? ' is-sel' : '') + (touch ? ' fd-ol-row--touch' : '');
    if (r0.kind === 'group') return '<li class="' + cls + '"' + attrs + ' aria-label="Not connected to a trigger, ' + r0.n + ' step' + (r0.n === 1 ? '' : 's') + '"><span class="fd-ol-grp">Not connected to a trigger (' + r0.n + ')</span></li>';
    if (r0.kind === 'ref') return '<li class="' + cls + '"' + attrs + ' aria-label="Go to #' + s.no + ' ' + esc(s.title) + '">' + VF.icon('corner-down-right', 'sm') + '<span class="fd-ol-t">Go to #' + s.no + ' ' + esc(s.title) + '</span></li>';
    if (r0.kind === 'ans') { var ex = o.fb ? (o.label === 'No reply' ? 'after ' + (s.f.wait || 6) + ' s · fallback' : 'fallback') : (o.ex || []).join(' · '), t = o.to && VF.stepAny(o.to); return '<li class="' + cls + '"' + attrs + ' aria-label="' + (VF.reg(s).rows === 'results' ? 'Result ' : 'Answer ') + esc(o.label) + (t ? ', goes to ' + esc(t.title) : ', not connected') + '">' + VF.icon('corner-down-right', 'sm') + '<span class="fd-ol-t">If ' + esc(o.label) + (o.fb ? ' <span class="fd-ol-dash" aria-hidden="true"></span>' : '') + '</span><span class="fd-ol-m">' + esc(ex) + '</span></li>'; }
    if (r0.kind === 'open') return '<li class="' + cls + '"' + attrs + ' aria-label="Not connected. ' + (ro() ? '' : 'Press Enter to connect.') + '">' + VF.icon('triangle-alert', 'sm', { className: 'u-fg-warning' }) + '<span class="fd-ol-t u-fg-warning">Not connected</span>' + (ro() ? '' : '<span class="fd-ol-m">Connect…</span>') + '</li>';
    var r = VF.reg(s), si = iss[s.id], c = si ? VF.counts(si) : null, phase = r.phase ? VF.PHASES[r.phase].name + (r.name !== VF.PHASES[r.phase].name && r.phase !== 'outcome' ? ' · ' + r.name : '') : 'Unsupported step';
    var name = '#' + s.no + ' ' + s.title + ', ' + phase.replace(' · ', ', ') + (s.type === 'outcome.end' && s.f.lead ? ', sets lead to ' + VF.leadWord(s.f.lead) : '') + (c ? ', ' + VF.issueWords(c) : '') + (reached[s.id] ? ', reached in the last test' : '');
    return '<li class="' + cls + '"' + attrs + ' aria-label="' + esc(name) + '"><span class="gt ' + VF.tileClass(s) + '" aria-hidden="true">' + VF.icon(r.icon, 'sm') + '</span><span class="fd-ol-main"><span class="fd-ol-t" translate="no">' + esc(s.title) + '</span>' +
      (s.type === 'outcome.end' ? '<span class="fd-ol-m">' + (s.f.lead ? 'Lead → ' + esc(VF.leadWord(s.f.lead)) : 'Choose what this call records') + '</span>' : '<span class="fd-ol-m fd-ol-phase">' + esc(phase) + '</span>') + '</span>' +
      (c ? '<span class="tag tag--' + (c.errors ? 'danger' : 'warning') + '" aria-hidden="true">' + VF.icon(c.errors ? 'circle-x' : 'triangle-alert', 'xs') + (c.errors + c.warnings) + '</span>' : '') + (reached[s.id] ? '<span class="tag" aria-hidden="true">' + VF.icon('check', 'xs') + '</span>' : '') + '<span class="fd-ol-no" aria-hidden="true">#' + s.no + '</span></li>';
  }
  VF.outlineHtml = function (o) {
    o = o || {}; var steps = VF.visibleSteps(), rows = buildRows(steps), vis = visible(rows), iss = {}, reached = {};
    S.issues.forEach(function (i) { if (i.stepId) (iss[i.stepId] = iss[i.stepId] || []).push(i); });
    ((S.test && S.test.reached) || []).forEach(function (id) { reached[id] = 1; });
    if (!S.olFocus || !vis.some(function (r0) { return r0.key === S.olFocus; })) S.olFocus = vis[0] && vis[0].key;
    var q = S.olFilter.trim(), nMatch = q ? vis.filter(function (r0) { return r0.kind === 'step'; }).length : steps.length;
    var disp = q ? withHidden(visible(rows, true)) : vis;
    if (q && olSaid !== q) { olSaid = q; clearTimeout(VF._olAnn); VF._olAnn = setTimeout(function () { V.announce(nMatch + ' step' + (nMatch === 1 ? '' : 's') + ' match', { dedupeKey: 'ol-filter' }); }, 400); } else if (!q) olSaid = null;
    return '<div class="fd-ol-top"><div class="input input--sm">' + VF.icon('search', 'sm') + '<input type="search" id="fd-ol-q" placeholder="Filter steps…" aria-label="Filter steps" value="' + esc(S.olFilter) + '"></div><span class="fd-ol-count">' + (q ? nMatch + ' of ' + steps.length + ' steps' : steps.length + ' steps') + '</span></div>' +
      '<ul class="fd-tree" role="tree" id="fd-tree" aria-label="Flow outline, ' + esc(S.m.meta.name) + '" data-shortcut-scope="flow-outline">' + (vis.length ? disp.map(function (r0) { return r0.kind === 'hidden' ? hiddenHtml(r0) : rowHtml(r0, iss, reached, o.touch); }).join('') : '<li role="treeitem" aria-level="1" aria-setsize="1" aria-posinset="1" aria-selected="false" tabindex="0" class="fd-ol-row">No steps match “' + esc(S.olFilter) + '”.</li>') + '</ul>' +
      (!ro() && !o.touch ? '<button type="button" class="btn btn--tertiary btn--sm fd-ol-add" data-oladd>' + VF.icon('plus', 'sm') + 'Add step</button>' : '');
  };
  VF.leftViews.outline = function (b) { b.innerHTML = VF.outlineHtml(); wire(b); };

  function rowsNow() { return visible(buildRows(VF.visibleSteps())); }
  function focusRow(key) { S.olFocus = key; var t = $('#fd-tree'); if (!t) return; $$('[role="treeitem"]', t).forEach(function (li) { li.tabIndex = li.getAttribute('data-row') === key ? 0 : -1; }); var li = t.querySelector('[data-row="' + CSS.escape(key) + '"]'); if (li) { li.focus(); li.scrollIntoView({ block: 'nearest' }); } }
  function rowOf(key) { return buildRows(VF.visibleSteps()).filter(function (r0) { return r0.key === key; })[0]; }
  function wire(b) {
    var q = $('#fd-ol-q', b); if (q) q.oninput = function () { S.olFilter = q.value; VF.refreshLeft(); var q2 = $('#fd-ol-q'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } };
    var add = $('[data-oladd]', b); if (add) add.onclick = function () { VF.openPicker(S.sel.length === 1 ? pickOrigin(VF.step(S.sel[0])) : null, add); };
    var tree = $('#fd-tree', b); if (!tree) return;
    tree.onclick = function (e) { var li = e.target.closest('[role="treeitem"]'); if (!li) return; var r0 = rowOf(li.getAttribute('data-row')); if (!r0) return; S.olFocus = r0.key; activate(r0, li, { click: true }); };
    tree.onfocusin = function (e) { var li = e.target.closest('[role="treeitem"]'); if (li) S.olFocus = li.getAttribute('data-row'); };
    tree.onkeydown = onKey;
  }
  function pickOrigin(s) { if (!s) return null; var fo = s.outs.filter(function (o) { return !o.to; })[0] || s.outs[0]; return fo ? { stepId: s.id, outId: fo.id } : null; }
  function activate(r0, li, o) {
    o = o || {};
    if (r0.kind === 'group') { S.olCollapsed[r0.key] = !S.olCollapsed[r0.key]; VF.refreshLeft(); return; }
    if (r0.kind === 'ref') { var tk = 'step:' + r0.id; VF.select([r0.id]); VF.reveal(r0.id); focusRow(tk); return; }
    if (r0.kind === 'open' || r0.kind === 'ans') { if (r0.kind === 'ans' && o.click && !ro()) { var s1 = VF.stepAny(r0.id); if (s1.outs.filter(function (x) { return x.id === r0.out; })[0].to) return; } if (!ro()) VF.openConnect(r0.id, r0.out, li); return; }
    VF.select([r0.id]); VF.reveal(r0.id);
    if (S.mode === 'review' || S.mode === 'phone') VF.openInspector(r0.id); else VF.openInspector(r0.id, { focusLabel: !o.click });
  }
  function onKey(e) {
    var li = e.target.closest('[role="treeitem"]'); if (!li || e.target.tagName === 'INPUT') return;
    var list = rowsNow(), key = li.getAttribute('data-row'), i = list.map(function (r0) { return r0.key; }).indexOf(key), r0 = list[i], k = e.key, sgl = V.shortcuts.enabled() && !e.ctrlKey && !e.metaKey && !e.altKey;
    function done() { e.preventDefault(); e.stopPropagation(); }
    if (!r0) return;
    if (e.altKey && (k === 'ArrowUp' || k === 'ArrowDown')) { done(); if (ro()) return VF.explainReadOnly(); if (r0.kind === 'step') chainMove(r0.id, k === 'ArrowUp' ? -1 : 1); return; }
    if (k === 'ArrowDown') { done(); if (list[i + 1]) focusRow(list[i + 1].key); return; }
    if (k === 'ArrowUp') { done(); if (list[i - 1]) focusRow(list[i - 1].key); return; }
    if (k === 'Home' || k === 'End') { done(); focusRow(list[k === 'Home' ? 0 : list.length - 1].key); return; }
    if (k === 'ArrowRight') { done(); if (r0.exp && S.olCollapsed[r0.key]) { S.olCollapsed[r0.key] = false; VF.refreshLeft(); focusRow(key); } else if (r0.exp && list[i + 1]) focusRow(list[i + 1].key); return; }
    if (k === 'ArrowLeft') { done(); if (r0.exp && !S.olCollapsed[r0.key]) { S.olCollapsed[r0.key] = true; VF.refreshLeft(); focusRow(key); } else { for (var j = i - 1; j >= 0; j--) if (list[j].lvl < r0.lvl) { focusRow(list[j].key); break; } } return; }
    if (k === 'Enter') { done(); activate(r0, li); return; }
    if ((e.shiftKey && k === 'F10') || k === 'ContextMenu') { done(); rowMenu(r0, li); return; }
    if (k === 'F2' && r0.kind === 'step') { done(); if (ro()) return VF.explainReadOnly(); rename(r0, li); return; }
    if ((k === 'Delete' || k === 'Backspace') && !ro()) { done(); if (r0.kind === 'step') deleteFromOutline(r0.id, list, i); else if (r0.kind === 'ans') VF.disconnect(r0.id, r0.out); return; }
    if (sgl && k.toLowerCase() === 'a' && !ro()) { done(); var s = VF.step(r0.id); VF.openPicker(r0.out ? { stepId: r0.id, outId: r0.out } : pickOrigin(s), li); return; }
    if (sgl && k.toLowerCase() === 'c' && !ro()) { done(); var s2 = VF.step(r0.id); if (r0.out) VF.openConnect(r0.id, r0.out, li); else if (s2 && !VF.reg(s2).rows && s2.outs[0]) VF.openConnect(s2.id, s2.outs[0].id, li); else V.announce('Choose an answer row to connect it.'); return; }
    if (k.length === 1 && /\S/.test(k) && !e.ctrlKey && !e.metaKey) { var now = Date.now(); S.olType = now - (S.olTypeAt || 0) > 700 ? k.toLowerCase() : (S.olType || '') + k.toLowerCase(); S.olTypeAt = now; var hit = list.slice(i + 1).concat(list.slice(0, i + 1)).filter(function (x) { var st = x.kind === 'step' && VF.stepAny(x.id); return st && st.title.toLowerCase().indexOf(S.olType) === 0; })[0]; if (hit) { done(); focusRow(hit.key); } }
  }
  function rename(r0, li) {
    var s = VF.step(r0.id), t = li.querySelector('.fd-ol-t'), inp = d.createElement('input'); inp.className = 'fd-ol-rename'; inp.value = s.title; inp.setAttribute('aria-label', 'Rename ' + s.title);
    t.replaceWith(inp); inp.focus(); inp.select();
    inp.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); var v = inp.value.trim(); if (v && v !== s.title) { VF.setField(s.id, 'title', v, { coalesce: 'rename:' + Date.now() }); V.announce('Renamed to ' + v); } VF.refreshLeft(); focusRow(r0.key); } if (e.key === 'Escape') { e.preventDefault(); VF.refreshLeft(); focusRow(r0.key); } };
    inp.onblur = function () { setTimeout(function () { if (d.contains(inp)) { VF.refreshLeft(); } }, 0); };
  }
  function rowMenu(r0, li) {
    var s = VF.stepAny(r0.id); if (!s) return; var roR = ro() ? 'Read only here' : null;
    var single = !VF.reg(s).rows && s.outs.length === 1, inc = VF.incoming(S.m.steps, s.id);
    VF.menu('fd-ol-menu', 'Outline row menu', [
      { label: 'Open', icon: 'square-pen', kbd: 'Enter', fn: function () { activate(r0, li); } },
      { label: 'Add step after…', icon: 'plus', kbd: 'A', disabled: roR, fn: function () { VF.openPicker(r0.out ? { stepId: s.id, outId: r0.out } : pickOrigin(s), li); } },
      { label: 'Connect to…', icon: 'corner-down-right', kbd: 'C', disabled: roR || (r0.out || single ? null : 'Choose an answer row'), fn: function () { VF.openConnect(s.id, r0.out || s.outs[0].id, li); } },
      { label: 'Duplicate', icon: 'copy', disabled: roR, fn: function () { VF.duplicate([s.id]); } },
      { label: 'Move up', icon: 'arrow-up', kbd: 'alt+up', disabled: roR || (single && inc.length === 1 && VF.phaseOf(s) === 'action' ? null : 'Moves only steps inside a linear chain'), fn: function () { chainMove(s.id, -1); } },
      { label: 'Move down', icon: 'arrow-down', kbd: 'alt+down', disabled: roR || (single && VF.phaseOf(s) === 'action' ? null : 'Moves only steps inside a linear chain'), fn: function () { chainMove(s.id, 1); } },
      { sep: 1 }, { label: 'Delete step', icon: 'trash-2', danger: 1, kbd: 'Delete', disabled: roR, fn: function () { var l = rowsNow(), at = l.map(function (x) { return x.key; }).indexOf(r0.key); deleteFromOutline(s.id, l, at); } }
    ], li, { placement: 'bottom-start' });
  }
  /* Outline editing stays in the Outline (FD2 §16.3): after Delete, focus moves to the previous step row in the tree
     (else the next, else the first row), never out of the widget and never to <body>. */
  function deleteFromOutline(id, list, i) {
    var prev = null, j;
    for (j = i - 1; j >= 0 && !prev; j--) if (list[j].kind === 'step' && list[j].id !== id) prev = list[j].key;
    for (j = i + 1; j < list.length && !prev; j++) if (list[j].kind === 'step' && list[j].id !== id) prev = list[j].key;
    VF.deleteSteps([id], { from: 'outline' });
    setTimeout(function () { var t = $('#fd-tree'); if (!t) return; var to = (prev && t.querySelector('[data-row="' + CSS.escape(prev) + '"]')) || $('[role="treeitem"]', t); if (to) focusRow(to.getAttribute('data-row')); }, 0);
  }
  /* Alt+↑/↓ in a linear chain: swap with the neighbour and rewire the chain (one undo step). */
  function chainMove(id, dir) {
    var x = VF.step(id), ok = function (s) { return s && !VF.reg(s).rows && s.outs.length === 1 && VF.phaseOf(s) === 'action'; };
    if (!ok(x)) { V.announce('Only Speak and single-output steps in a linear chain can move. Logic steps stay put.'); return; }
    if (dir < 0) {
      var inc = VF.incoming(S.m.steps, id); if (inc.length !== 1 || !ok(inc[0].from)) { V.announce('Already the first step in this chain.'); return; }
      var p = inc[0].from, pin = VF.incoming(S.m.steps, p.id);
      VF.act('move ' + x.title + ' up', function () { var nxt = x.outs[0].to; pin.forEach(function (q) { q.out.to = x.id; }); x.outs[0].to = p.id; p.outs[0].to = nxt; }, { structure: true });
      V.announce('Moved ' + x.title + ' before ' + p.title);
    } else {
      var n = VF.step(x.outs[0].to); if (!ok(n)) { V.announce('Already the last step in this chain.'); return; }
      var xin = VF.incoming(S.m.steps, id);
      VF.act('move ' + x.title + ' down', function () { var after = n.outs[0].to; xin.forEach(function (q) { q.out.to = n.id; }); n.outs[0].to = x.id; x.outs[0].to = after; }, { structure: true });
      V.announce('Moved ' + x.title + ' after ' + n.title);
    }
    setTimeout(function () { focusRow('step:' + id); }, 0);
  }
  VF.on('selection', function () { var t = $('#fd-tree'); if (!t) return; $$('.fd-ol-row--step', t).forEach(function (li) { var id = li.getAttribute('data-row').slice(5), on = S.sel.indexOf(id) >= 0; li.setAttribute('aria-selected', on); li.classList.toggle('is-sel', on); if (on && S.sel.length === 1 && !t.contains(d.activeElement)) li.scrollIntoView({ block: 'nearest' }); }); });

  /* ---------- tablet Review column (Outline · Problems n) and the phone Outline page ---------- */
  VF.renderReviewColumn = function (e) {
    var tab = S.reviewTab || 'outline', c = VF.counts(S.issues), n = c.errors + c.warnings, phone = S.mode === 'phone';
    if (phone) { e.innerHTML = '<h2 class="sr-only" id="fd-left-t">Outline</h2>' + VF.outlineHtml({ touch: true }); wire(e); return; }
    e.innerHTML = '<h2 class="sr-only" id="fd-left-t">Review</h2><div class="vtabs vtabs--panel"><div class="vtabs-list" role="tablist" aria-label="Review">' +
      '<button type="button" class="vtab" role="tab" id="fd-rt-o" aria-controls="fd-rp-o" aria-selected="' + (tab === 'outline') + '" data-rt="outline">Outline</button>' +
      '<button type="button" class="vtab" role="tab" id="fd-rt-p" aria-controls="fd-rp-p" aria-selected="' + (tab === 'problems') + '" data-rt="problems">Problems <span class="vtab-count">' + n + '</span></button></div></div>' +
      '<div class="fd-left-body" role="tabpanel" id="fd-rp-o" aria-labelledby="fd-rt-o"' + (tab === 'outline' ? '' : ' hidden') + '>' + VF.outlineHtml({ touch: V.bp.coarse() }) + '</div>' +
      '<div class="fd-left-body" role="tabpanel" id="fd-rp-p" aria-labelledby="fd-rt-p"' + (tab === 'problems' ? '' : ' hidden') + '>' + VF.problemsListHtml() + '</div>';
    V.initAll(e); wire(e); VF.wireProblemsList(e);
    e.onclick = function (ev) { var t = ev.target.closest('[data-rt]'); if (t) S.reviewTab = t.getAttribute('data-rt'); };
  };
})(window, document);
