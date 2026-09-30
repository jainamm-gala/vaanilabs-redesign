/* Vaani Labs prototype · pages/leads-table.js — DataTable with fit-by-priority columns (03 §6.6), the phone ListRow list
   (§5.5), selection and BulkBar (§6.7), row actions, keyboard model (§8.1) and in-place live-call updates. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, L = w.VaaniLeads, S = L.S;

  /* ---------- columns: id, header, priority, min width (px for the fit maths; the CSS width is a token expression) ---------- */
  L.COLS = [
    { id: 'name', label: 'Lead', pri: 1, px: 160, w: 'calc(var(--space-40) * 4)', sort: 'asc', key: true },
    { id: 'phone', label: 'Phone', pri: 2, px: 160, w: 'calc(var(--space-40) * 4)' },
    { id: 'status', label: 'Status', pri: 1, px: 136, w: 'calc(var(--space-8) * 17)', sort: 'asc' },
    { id: 'last_call', label: 'Last call', pri: 1, px: 184, w: 'calc(var(--space-8) * 23)', sort: 'desc' },
    { id: 'callback', label: 'Callback', pri: 4, px: 152, w: 'calc(var(--space-8) * 19)', sort: 'asc', cap: 'B5' },
    { id: 'interest', label: 'Interest', pri: 2, px: 96, w: 'var(--space-96)', sort: 'desc', num: true },
    { id: 'language', label: 'Language', pri: 3, px: 120, w: 'calc(var(--space-40) * 3)', cap: 'B3' },
    { id: 'flow', label: 'Flow', pri: 3, px: 160, w: 'calc(var(--space-40) * 4)', sort: 'asc' },
    { id: 'created', label: 'Created', pri: 4, px: 120, w: 'calc(var(--space-40) * 3)', sort: 'desc' },
    { id: 'source', label: 'Source', pri: 4, px: 128, w: 'calc(var(--space-8) * 16)' },
    { id: 'owner', label: 'Owner', pri: 4, px: 140, w: 'calc(var(--space-20) * 7)', sort: 'asc' },
    { id: 'city', label: 'City', pri: 4, px: 120, w: 'calc(var(--space-40) * 3)', sort: 'asc' },
    { id: 'email', label: 'Email', pri: 4, px: 180, w: 'calc(var(--space-20) * 9)' },
    { id: 'calls', label: 'Calls', pri: 4, px: 72, w: 'calc(var(--space-8) * 9)', sort: 'desc', num: true },
    { id: 'budget', label: 'Budget', pri: 4, px: 140, w: 'calc(var(--space-20) * 7)', custom: true },
    { id: 'unit', label: 'Unit', pri: 4, px: 96, w: 'var(--space-96)', custom: true }
  ];
  var FIT = ['phone', 'interest', 'language', 'flow'];
  L.col = function (id) { return L.COLS.filter(function (c) { return c.id === id; })[0]; };
  L.colOrder = function () { var o = S.colOrder || []; return o.map(L.col).filter(Boolean).concat(L.COLS.filter(function (c) { return o.indexOf(c.id) < 0; })); };
  L.colAvailable = function (c) { return !(c.cap && L.capOff(c.cap)) && !(c.id === 'last_call' && L.demo('gaps') && false); };
  /* Which columns show: user choices first, then the view preset, then P1, then P2/P3 while their minimums fit the container. */
  L.visibleCols = function () {
    var v = L.viewDef(S.view), preset = v.preset || [], hide = v.hide || [], width = ($('#leads-col') || {}).clientWidth || 1200;
    var budget = 40 + 104, on = {};
    L.COLS.forEach(function (c) {
      if (!L.colAvailable(c)) return; var ov = S.colOverride[c.id];
      if (c.key || ov === true || (ov == null && (preset.indexOf(c.id) >= 0 || (c.pri === 1 && hide.indexOf(c.id) < 0)))) { on[c.id] = true; budget += c.px; }
    });
    FIT.forEach(function (id) { var c = L.col(id); if (on[id] || !L.colAvailable(c) || S.colOverride[id] === false) return; if (budget + c.px <= width) { on[id] = true; budget += c.px; } else budget = Infinity; });
    return L.colOrder().filter(function (c) { return on[c.id]; });
  };

  /* ---------- cells ---------- */
  var SORTWORDS = { name: ['A to Z', 'Z to A'], status: ['pipeline order', 'reverse pipeline order'], last_call: ['oldest first', 'newest first'], interest: ['lowest first', 'highest first'], created: ['oldest first', 'newest first'], callback: ['earliest first', 'latest first'], flow: ['A to Z', 'Z to A'], owner: ['A to Z', 'Z to A'], city: ['A to Z', 'Z to A'], calls: ['fewest first', 'most first'] };
  L.sortWords = function (s) { var c = L.col(s[0]); return (c ? c.label : s[0]) + ', ' + (SORTWORDS[s[0]] || ['ascending', 'descending'])[s[1] === 'asc' ? 0 : 1]; };
  function liveState(l) { var s = S.live[l.id] || l.liveState; return s && s !== 'ended' ? s : null; }
  L.lastCallHtml = function (l, o) {
    o = o || {}; var ls = liveState(l);
    if (ls) return V.ui.callState(ls, { pulse: ls === 'live' });
    if (S.scheduled[l.id]) return '<span class="u-fg-2">Scheduled</span> <span class="c-muted u-fg-3">· ' + esc(S.scheduled[l.id]) + '</span>';
    if (L.demo('calls-failed')) return '<span class="u-fg-3" aria-hidden="true">–</span><span class="sr-only">Not loaded</span>';
    if (!l.lastCall) return '<span class="u-fg-3">Not called yet</span>';
    if (l.lastCall.result === 'timed_out') return V.ui.statusTag('callResult', 'timed_out') + ' <span class="u-fg-3">· ' + L.timeTag(l.lastCall.at) + '</span>';
    return '<span class="u-fg-2">' + esc(l.lastCall.outcome) + '</span> <span class="u-fg-3">· ' + L.timeTag(l.lastCall.at) + '</span>';
  };
  L.callbackHtml = function (l) {
    if (!l.callbackAt) return '<span class="u-fg-3" aria-hidden="true">–</span><span class="sr-only">No callback</span>';
    if (L.callbackOverdue(l) && l.callbackAt.slice(0, 10) !== V.data.meta.today) return '<span class="u-fg-warning leads-inline">' + V.icon('clock', 'xs') + 'Overdue · ' + esc(F.when(l.callbackAt, { time: true })) + '</span>';
    return esc(F.when(l.callbackAt, { time: true }));
  };
  function cell(c, l) {
    switch (c.id) {
      case 'name': return '<td class="c-key sticky-l leads-c-key"><a class="cell-t" href="leads.html?lead=' + esc(l.id) + '" data-lead="' + esc(l.id) + '" translate="no" data-tooltip-overflow>' + esc(l.name || 'Unnamed lead') + '</a></td>';
      case 'phone': return '<td>' + V.ui.phoneText(l.phone) + '</td>';
      case 'status': return '<td data-col="status">' + V.ui.statusTag('lead', l.status) + '</td>';
      case 'last_call': return '<td data-col="last_call">' + L.lastCallHtml(l) + '</td>';
      case 'callback': return '<td>' + L.callbackHtml(l) + '</td>';
      case 'interest': return l.interest == null ? '<td class="c-num c-muted">Not scored</td>' : '<td class="c-num"><span class="meter" role="img" aria-label="Interest ' + l.interest + ' of 100">' + l.interest + '<i data-mark><b style="width: ' + l.interest + '%"></b></i></span></td>';
      case 'language': return l.language ? '<td><span class="lm">' + esc(V.langByCode(l.language).name) + '</span></td>' : '<td class="c-muted">Not set</td>';
      case 'flow': return l.flowId ? '<td><span class="cell-t leads-t20" translate="no" data-tooltip-overflow>' + esc(L.flowLabel(l.flowId)) + '</span></td>' : '<td class="c-muted">Workspace default</td>';
      case 'created': return '<td>' + L.timeTag(l.createdAt) + '</td>';
      case 'source': return '<td>' + esc(l.source) + '</td>';
      case 'owner': return l.owner ? '<td><span class="leads-inline">' + V.ui.avatar(l.owner, { size: 20 }) + esc(l.owner) + '</span></td>' : '<td class="c-muted">Unassigned</td>';
      case 'city': return l.city ? '<td>' + esc(l.city) + '</td>' : '<td class="c-muted">Not captured</td>';
      case 'email': return l.email ? '<td><span class="cell-t" data-tooltip-overflow>' + esc(l.email) + '</span></td>' : '<td class="c-muted">Not captured</td>';
      case 'calls': return '<td class="c-num">' + l.calls + '</td>';
      case 'budget': return l.budget ? '<td>' + esc(l.budget) + '</td>' : '<td class="c-muted">Not captured</td>';
      case 'unit': return l.unit ? '<td>' + esc(l.unit) + '</td>' : '<td class="c-muted">Not captured</td>';
    }
    return '<td></td>';
  }
  L.callBtnAttrs = function (l, label) {
    var b = L.leadBlocker(l);
    return b ? ' aria-disabled="true" data-tooltip="' + esc(b.reason) + '"' : ' data-tooltip="' + esc(label || 'Call…') + '" data-kbd="c"';
  };
  function actions(l, active) {
    var ti = active ? '' : ' tabindex="-1"';
    return '<td class="c-act sticky-r"><span class="row-actions"><button class="btn btn--sm leads-rowcall" type="button" data-call="' + esc(l.id) + '" aria-haspopup="dialog" aria-label="Call ' + esc(l.name) + '…"' + L.callBtnAttrs(l) + ti + '>' + V.icon('phone') + 'Call…</button>' +
      '<button class="ibtn ibtn--sm" type="button" data-row-menu="' + esc(l.id) + '" aria-haspopup="menu" aria-controls="leads-row-menu" aria-expanded="false" aria-label="More actions for ' + esc(l.name) + '"' + ti + '>' + V.icon('ellipsis') + '</button></span></td>';
  }
  L.isSelected = function (id) { return S.sel.all ? !!(L.selAllSet && L.selAllSet[id]) : !!S.sel.ids[id]; };

  /* ---------- render rows (table ≥768, ListRow below) ---------- */
  function captureFocus() {
    var a = d.activeElement; if (!a || !a.closest) return null;
    var row = a.closest('#leads-table tbody tr, #leads-list li'); if (!row) return null;
    var ctl = a === row ? 'row' : a.matches('[data-select-row],.leads-li-cb') ? 'cb' : a.matches('[data-lead]') ? 'link' : a.matches('[data-call]') ? 'call' : a.matches('[data-row-menu]') ? 'menu' : 'row';
    return { id: row.getAttribute('data-id'), ctl: ctl, list: !!a.closest('#leads-list') };
  }
  function restoreFocus(f) {
    if (!f) return; var row = $((f.list ? '#leads-list li' : '#leads-table tbody tr') + '[data-id="' + f.id + '"]'); if (!row) return;
    var t = f.ctl === 'cb' ? $('[data-select-row],.leads-li-cb', row) : f.ctl === 'link' ? $('[data-lead]', row) : f.ctl === 'call' ? $('[data-call]', row) : f.ctl === 'menu' ? $('[data-row-menu]', row) : row;
    (t || row).focus({ preventScroll: true });
  }
  L.renderRows = function (q, o) {
    var focus = captureFocus(), table = $('#leads-table'), cols = L.visibleCols(), rows = q.pageRows;
    L.shownCols = cols;
    /* pin selection, key and actions only when the table is wider than its container (so focus rings are never covered otherwise) */
    var need = 144 + cols.reduce(function (a, c) { return a + c.px; }, 0), pin = need > (($('#leads-col') || {}).clientWidth || 9999);
    table.classList.toggle('leads-pinned', pin);
    var s = L.curSort(), sortable = function (c) { return !!c.sort && !L.demo('loading'); };
    table.setAttribute('aria-rowcount', q.total + 1);
    table.setAttribute('aria-busy', S.busy || L.demo('refreshing') || L.demo('loading') ? 'true' : 'false');
    $('#leads-caption').textContent = 'Leads, sorted by ' + L.sortWords(s).toLowerCase().replace(/^([a-z])/, function (m) { return m; });
    var minW = 'calc(var(--space-40) + calc(var(--space-8) * 13)' + cols.map(function (c) { return ' + ' + c.w; }).join('') + ')';
    table.style.minWidth = minW;
    $('#leads-colgroup').innerHTML = '<col style="width: var(--space-40)">' + cols.map(function (c) { return c.key ? '<col>' : '<col style="width: ' + c.w + '">'; }).join('') + '<col style="width: calc(var(--space-8) * 13)">';
    $('#leads-thead').innerHTML = '<tr aria-rowindex="1"><th class="c-sel sticky-l" scope="col"><input type="checkbox" class="cb" data-select-all aria-label="Select all leads on this page"></th>' + cols.map(function (c) {
      var cls = (c.num ? 'c-num' : '') + (c.key ? ' sticky-l leads-c-key' : ''), on = s[0] === c.id;
      if (!sortable(c)) return '<th scope="col"' + (cls ? ' class="' + cls.trim() + '"' : '') + '>' + esc(c.label) + '</th>';
      return '<th scope="col"' + (cls ? ' class="' + cls.trim() + '"' : '') + ' aria-sort="' + (on ? (s[1] === 'asc' ? 'ascending' : 'descending') : 'none') + '" data-col="' + c.id + '"><button class="th-sort" type="button" data-sort="' + c.id + '">' + esc(c.label) + V.icon(on ? (s[1] === 'asc' ? 'arrow-up' : 'arrow-down') : 'chevrons-up-down', 'xs') + '</button></th>';
    }).join('') + '<th class="c-act sticky-r" scope="col"><span class="sr-only">Actions</span></th></tr>';
    var tb = $('#leads-tbody'), html = '';
    if (L.demo('loading')) {
      for (var k = 0; k < 14; k++) html += '<tr aria-hidden="true"><td class="c-sel"></td>' + cols.map(function (c, j) { var wd = [64, 48, 56, 40, 52][(k + j) % 5]; return c.id === 'status' ? '<td><span class="sk sk--block leads-sk-tag" style="width: ' + (40 + (k % 3) * 10) + '%"></span></td>' : '<td' + (c.num ? ' class="c-num"' : '') + '><span class="sk' + (c.num ? ' leads-sk-num' : '') + '" style="width: ' + wd + '%"></span></td>'; }).join('') + '<td class="c-act"></td></tr>';
      tb.innerHTML = html; $('#leads-list').innerHTML = '<li class="leads-li-empty"><span class="sr-only">Loading leads…</span>' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<div class="li" aria-hidden="true"><span class="sk leads-sk-li" style="width: ' + (40 + n * 5) + '%"></span><span class="sk sk--block leads-sk-tag leads-sk-tagw"></span><span class="sk sk--meta" style="width: ' + (55 + n * 3) + '%"></span><span class="sk sk--meta leads-sk-tagw"></span></div>'; }).join('') + '</li>';
      return;
    }
    if (!rows.length) { tb.innerHTML = '<tr class="dt-empty"><td colspan="' + (cols.length + 2) + '">' + emptyHtml(q) + '</td></tr>'; $('#leads-list').innerHTML = '<li class="leads-li-empty">' + emptyHtml(q) + '</li>'; L.syncSelectionUi(); return; }
    var activeId = S.activeId && rows.some(function (l) { return l.id === S.activeId; }) ? S.activeId : rows[0].id; S.activeId = activeId;
    rows.forEach(function (l, i) {
      var sel = L.isSelected(l.id), act = l.id === activeId, cur = S.leadId === l.id && L.sheetOpen && L.sheetOpen();
      html += '<tr data-id="' + esc(l.id) + '" aria-rowindex="' + (q.start + i + 2) + '" aria-selected="' + sel + '" tabindex="' + (act ? 0 : -1) + '"' + (cur ? ' aria-current="true"' : '') + '>' +
        '<td class="c-sel sticky-l"><input type="checkbox" class="cb" data-select-row aria-label="Select ' + esc(l.name) + '"' + (sel ? ' checked' : '') + (act ? '' : ' tabindex="-1"') + '></td>' +
        cols.map(function (c) { var h = cell(c, l); return act || c.id !== 'name' ? h : h.replace('<a class="cell-t"', '<a class="cell-t" tabindex="-1"'); }).join('') + actions(l, act) + '</tr>';
    });
    tb.innerHTML = html;
    $('#leads-list').innerHTML = rows.map(function (l) {
      var lc = liveState(l) ? V.CALL_STATE[liveState(l)][0] : S.scheduled[l.id] ? 'Scheduled' : l.lastCall ? (l.lastCall.outcome || 'Timed out') + ' · ' + L.when(l.lastCall.at) : 'Not called yet';
      return '<li class="leads-li' + (S.selectMode ? ' leads-li--sel' : '') + '" data-id="' + esc(l.id) + '">' + (S.selectMode ? '<input type="checkbox" class="cb leads-li-cb" aria-label="Select ' + esc(l.name) + '"' + (L.isSelected(l.id) ? ' checked' : '') + '>' : '') +
        '<a class="li" href="leads.html?lead=' + esc(l.id) + '" data-lead="' + esc(l.id) + '"><span class="li-title" translate="no">' + esc(l.name) + '</span>' + V.ui.statusTag('lead', l.status) +
        '<span class="li-meta">' + V.ui.phoneText(l.phone.short, { size: 'sm' }) + ' · ' + esc(lc) + '</span>' + (l.language ? '<span class="lm leads-li-lang">' + esc(V.langByCode(l.language).name) + '</span>' : '<span class="lm leads-li-lang u-fg-3">Not set</span>') + '</a></li>';
    }).join('');
    L.syncSelectionUi(); restoreFocus(focus); remapReturns();
  };
  /* Overlays remember the control that opened them; a re-render replaces rows, so point them at the new elements. */
  function remapReturns() {
    V.overlays.stack.forEach(function (e) {
      var t = e.returnTo; if (!t || d.contains(t) || !t.getAttribute) return;
      var id = t.getAttribute('data-id') || t.getAttribute('data-call') || t.getAttribute('data-row-menu') || t.getAttribute('data-lead'); if (!id) return;
      var sel = t.hasAttribute('data-call') ? '[data-call="' + id + '"]' : t.hasAttribute('data-row-menu') ? '[data-row-menu="' + id + '"]' : t.hasAttribute('data-lead') ? '[data-lead="' + id + '"]' : 'tr[data-id="' + id + '"]';
      var n = $((t.closest && t.closest('#leads-list') ? '#leads-list ' : '#leads-tbody ') + sel) || $('#leads-tbody tr[data-id="' + id + '"]'); if (n) e.returnTo = n;
    });
  }
  L.remapReturns = remapReturns;
  function emptyHtml(q) {
    var v = q.view;
    if (S.q.trim() && !Object.keys(S.filters).length) return '<div class="empty">' + V.icon('search-x', 'lg') + '<h3>No leads match ‘<span class="empty-query">' + esc(S.q.trim()) + '</span>’.</h3><p>Search covers name, phone, email and city.</p><div class="empty-actions"><button class="btn" type="button" data-leads-clear>Clear search</button></div></div>';
    if (L.hasNarrowing()) return '<div class="empty">' + V.icon('list-filter', 'lg') + '<h3>No leads match ' + esc(L.filterWords ? L.filterWords() : 'these filters') + '.</h3><p>' + esc(L.plural(q.inView.length, 'lead')) + (q.inView.length === 1 ? ' is' : ' are') + ' hidden by filters.</p><div class="empty-actions"><button class="btn" type="button" data-leads-clear>Clear filters</button></div></div>';
    return '<div class="empty">' + V.icon('check', 'lg') + '<h3>' + esc(v.done || 'No leads in this view.') + '</h3>' + (v.id === 'callbacks' ? '<div class="empty-actions"><button class="btn btn--link" type="button" data-leads-upcoming>See upcoming callbacks</button></div>' : '') + '</div>';
  }

  /* ---------- selection (§6.7): page checkboxes, server-side "all matching", survives paging ---------- */
  L.selCount = function () { return S.sel.all ? S.sel.allCount : S.sel.n; };
  L.selectedLeads = function () { return S.sel.all ? L.last.rows.slice() : Object.keys(S.sel.ids).map(function (id) { return L.byId[id]; }).filter(Boolean); };
  L.clearSelection = function (silent) { S.sel = { ids: {}, all: false, n: 0 }; L.selAllSet = null; if (!silent) { L.syncSelectionUi(); L.renderBulk(); } };
  L.selectAllMatching = function () { S.sel.all = true; S.sel.allCount = L.last.total; L.selAllSet = {}; L.last.rows.forEach(function (l) { L.selAllSet[l.id] = 1; }); L.syncSelectionUi(); L.renderBulk(); V.announce('All ' + F.count(L.last.total) + ' leads selected', { dedupeKey: 'sel' }); };
  function reconcile() {
    var rows = $$('#leads-tbody tr[data-id]');
    if (S.sel.all) { var un = rows.filter(function (r) { return !$('[data-select-row]', r).checked; }); if (!un.length) return; S.sel.all = false; S.sel.ids = {}; L.last.rows.forEach(function (l) { S.sel.ids[l.id] = 1; }); L.selAllSet = null; }
    rows.forEach(function (r) { var id = r.getAttribute('data-id'); if ($('[data-select-row]', r).checked) S.sel.ids[id] = 1; else delete S.sel.ids[id]; });
    afterSel();
  }
  function liToggle(id, on) {
    if (S.sel.all) { S.sel.all = false; S.sel.ids = {}; L.last.rows.forEach(function (x) { S.sel.ids[x.id] = 1; }); L.selAllSet = null; }
    if (on) S.sel.ids[id] = 1; else delete S.sel.ids[id]; afterSel();
  }
  L.selectPage = function () { L.last.pageRows.forEach(function (l) { S.sel.ids[l.id] = 1; }); afterSel(); };
  function afterSel() {
    S.sel.n = Object.keys(S.sel.ids).length;
    L.syncSelectionUi(); L.renderBulk();
    var n = L.selCount(); V.announce(n ? L.plural(n, 'lead') + ' selected' : 'Selection cleared', { dedupeKey: 'sel' });
    if (V.bp.phone()) { var ph = $('#leads-meta-phone'); if (ph && S.selectMode) ph.textContent = n + ' selected'; }
  }
  L.syncSelectionUi = function () {
    var rows = $$('#leads-tbody tr[data-id]'), n = 0;
    rows.forEach(function (r) { var on = L.isSelected(r.getAttribute('data-id')), cb = $('[data-select-row]', r); if (cb) cb.checked = on; r.setAttribute('aria-selected', on ? 'true' : 'false'); if (on) n += 1; });
    var all = $('#leads-thead [data-select-all]'); if (all) { all.checked = rows.length > 0 && n === rows.length; all.indeterminate = n > 0 && n < rows.length; }
    $$('#leads-list .leads-li-cb').forEach(function (cb) { cb.checked = L.isSelected(cb.closest('li').getAttribute('data-id')); });
  };

  /* ---------- BulkBar ---------- */
  L.renderBulk = function () {
    var bar = $('#leads-bulk'), n = L.selCount(), q = L.last;
    if (!n || !q) { if (bar.contains(d.activeElement)) { var r = $('#leads-tbody tr[tabindex="0"]'); if (r) r.focus(); } bar.hidden = true; bar.innerHTML = ''; $('#main').removeAttribute('data-leads-bulk'); return; }
    var pageAll = q.pageRows.length && q.pageRows.every(function (l) { return L.isSelected(l.id); }) && q.total > q.pageRows.length;
    var viewLabel = L.viewDef(S.view).label, blk = L.globalBlocker();
    var focusKey = bar.contains(d.activeElement) ? d.activeElement.getAttribute('data-bk') : null;
    bar.setAttribute('aria-label', L.plural(n, 'lead') + ' selected');
    bar.innerHTML = '<span class="bulk-count">' + (S.sel.all ? 'All ' + F.count(n) + ' selected' : F.count(n) + ' selected') + '</span>' +
      (S.sel.all ? '<button class="btn btn--sm btn--link u-hide-phone" type="button" data-bk="clearall">Clear selection</button>' : pageAll ? '<button class="btn btn--sm btn--link u-hide-phone" type="button" data-bk="all">Select all ' + F.count(q.total) + ' leads in ' + esc(viewLabel) + '</button>' : '') +
      '<button class="btn btn--sm btn--primary" type="button" id="leads-bulk-call" data-bk="call" aria-haspopup="dialog" aria-label="Call ' + L.plural(n, 'lead') + '…"' + (blk ? ' aria-disabled="true" data-tooltip="' + esc(blk.reason) + '"' : ' data-tooltip="Call…" data-kbd="c"') + '>' + V.icon('phone') + '<span class="u-hide-phone">Call ' + esc(L.plural(n, 'lead')) + '…</span><span class="u-only-phone">Call ' + F.count(n) + '…</span></button>' +
      '<button class="btn btn--sm btn--tertiary u-hide-phone" type="button" data-bk="status" aria-haspopup="menu" aria-controls="leads-status-menu" aria-expanded="false">Set status' + V.icon('chevron-down', 'sm') + '</button>' +
      '<button class="btn btn--sm btn--tertiary u-hide-phone" type="button" data-bk="flow" aria-haspopup="menu" aria-controls="leads-flow-menu" aria-expanded="false">Assign flow' + V.icon('chevron-down', 'sm') + '</button>' +
      '<button class="btn btn--sm btn--tertiary u-hide-phone" type="button" data-bk="export" aria-haspopup="dialog">Export</button>' +
      '<button class="ibtn ibtn--sm" type="button" data-bk="more" aria-haspopup="menu" aria-controls="leads-bulk-more" aria-expanded="false" aria-label="More actions for ' + L.plural(n, 'selected lead') + '">' + V.icon('ellipsis') + '</button>' +
      '<button class="ibtn ibtn--sm" type="button" data-bk="clear" aria-label="Clear selection" aria-keyshortcuts="Escape">' + V.icon('x') + '</button>';
    $('#leads-bulk-more-note').querySelector('.menu-text span').textContent = 'Add note to ' + L.plural(n, 'lead') + '…';
    var del = $('#leads-bulk-more-del'); del.querySelector('.menu-text span').textContent = 'Delete ' + L.plural(n, 'lead') + '…';
    if (L.isAdmin()) { del.removeAttribute('aria-disabled'); del.removeAttribute('data-reason'); } else { del.setAttribute('aria-disabled', 'true'); del.setAttribute('data-reason', 'Only admins can delete leads. Ask an admin.'); }
    var btns = $$('button', bar).filter(U.visible), first = focusKey ? $('[data-bk="' + focusKey + '"]', bar) : null;
    btns.forEach(function (b, i) { b.setAttribute('tabindex', (first ? b === first : i === 0) ? '0' : '-1'); });
    bar.hidden = false; $('#main').setAttribute('data-leads-bulk', '');
    if (first) first.focus();
  };

  /* ---------- in-place cell updates for live calls (no re-render, so focus never moves) ---------- */
  L.updateLeadCells = function (id) {
    var l = L.byId[id]; if (!l) return;
    var r = $('#leads-tbody tr[data-id="' + id + '"]');
    if (r) { var lc = $('td[data-col="last_call"]', r), st = $('td[data-col="status"]', r); if (lc) lc.innerHTML = L.lastCallHtml(l); if (st) st.innerHTML = V.ui.statusTag('lead', l.status); var cb = $('[data-call]', r); if (cb) { var b = L.leadBlocker(l); if (b) { cb.setAttribute('aria-disabled', 'true'); cb.setAttribute('data-tooltip', b.reason); cb.removeAttribute('data-kbd'); } else { cb.removeAttribute('aria-disabled'); cb.setAttribute('data-tooltip', 'Call…'); cb.setAttribute('data-kbd', 'c'); } } }
    var li = $('#leads-list li[data-id="' + id + '"] .li-meta'); if (li) { var ls = liveState(l), t = ls ? V.CALL_STATE[ls][0] : S.scheduled[id] ? 'Scheduled' : l.lastCall ? (l.lastCall.outcome || 'Timed out') + ' · ' + L.when(l.lastCall.at) : 'Not called yet'; li.innerHTML = V.ui.phoneText(l.phone.short, { size: 'sm' }) + ' · ' + esc(t); }
  };

  /* ---------- mutations with Undo (tier 1) or a confirm (tier 2/3), overlay §3.1 ---------- */
  function snapshot(list, key) { return list.map(function (l) { return [l, l[key]]; }); }
  function restore(snap, key) { snap.forEach(function (p) { p[0][key] = p[1]; }); L.render(); if (L.refreshSheet) L.refreshSheet(); V.announce('Undone'); }
  L.who = function (list) { return list.length === 1 ? list[0].name : L.plural(list.length, 'lead'); };
  L.setStatus = function (list, status, o) {
    o = o || {}; if (!list.length) return;
    var word = V.statusDef('lead', status)[0];
    var apply = function () { var snap = snapshot(list, 'status'); list.forEach(function (l) { l.status = status; }); if (o.clear) L.clearSelection(); L.render(); if (L.refreshSheet) L.refreshSheet();
      if (status === 'do_not_call') V.toast.success('Marked ' + L.who(list) + ' Do not call'); else V.toast.undo('Set ' + L.who(list) + ' to ' + word, { action: { label: 'Undo', onClick: function () { restore(snap, 'status'); } } }); };
    if (status !== 'do_not_call') return apply();
    V.dialog.confirm({ title: 'Mark ' + L.who(list) + ' Do not call?', body: (list.length === 1 ? 'They’re' : 'They’re') + ' skipped by every future call and batch. You can change this later.', confirmLabel: 'Mark Do not call', tone: 'danger', returnTo: o.returnTo }).then(function (ok) { if (ok) apply(); });
  };
  L.assignFlow = function (list, flowId, o) {
    o = o || {}; var snap = snapshot(list, 'flowId'); list.forEach(function (l) { l.flowId = flowId; }); if (o.clear) L.clearSelection(); L.render(); if (L.refreshSheet) L.refreshSheet();
    V.toast.undo((flowId ? 'Assigned ' + L.flowById(flowId).name : 'Set the workspace default flow') + ' to ' + L.who(list), { action: { label: 'Undo', onClick: function () { restore(snap, 'flowId'); } } });
  };
  /* Focus a lead’s row (table) or its ListRow link (phone) as the active row of the roving tabindex. Programmatic, so an
     open sheet does not follow it (J/K and arrow keys still do). Returns false when the lead is not on this page. */
  var quietFollow = false;
  L.focusLeadRow = function (id) {
    var ul = $('#leads-list');
    if (ul && U.visible(ul)) { var a = $('li[data-id="' + id + '"] a[data-lead]', ul); if (a) a.focus(); return !!a; }
    var r = $('#leads-tbody tr[data-id="' + id + '"]'); if (!r) return false;
    $$('#leads-tbody tr[data-id]').forEach(function (x) { x.setAttribute('tabindex', x === r ? '0' : '-1'); });
    quietFollow = true; try { r.focus(); } finally { quietFollow = false; }
    return true;
  };
  /* No rows left (a filtered view emptied): the empty state’s action, else the page H1. Never <body> (overlay §1.3). */
  function focusEmpty() {
    var b = $('#leads-tbody .empty button, #leads-list .empty button'); if (b && U.visible(b)) { b.focus(); return; }
    var h = $('#page-title'); if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus(); }
  }
  L.deleteLeads = function (list, o) {
    o = o || {}; if (!L.isAdmin()) { L.blockedActivation({ reason: 'Only admins can delete leads. Ask an admin.' }); return; }
    var ids = {}; list.forEach(function (l) { ids[l.id] = 1; });
    /* 03 §8.2 · overlay §1.3: focus moves to the row now in the deleted row’s place (the next row; the last row when it was
       the last); Undo returns it to the restored row. */
    var go = function (undo) {
      var at = -1; (L.last ? L.last.pageRows : []).some(function (l, i) { if (ids[l.id]) { at = i; return true; } return false; });
      V.menu.close();   /* a row ⋯ menu would otherwise hand focus back to a button the delete removes (then the H1) */
      list.forEach(function (l) { l.deleted = true; }); if (list.some(function (l) { return l.id === S.leadId; }) && L.closeSheet) L.closeSheet('deleted');
      quietFollow = true; try { L.clearSelection(); L.render(); } finally { quietFollow = false; }   /* an open sheet never follows focus to a row being deleted */
      var rows = L.last.pageRows, active = $('#leads-tbody tr[tabindex="0"]');
      var next = at >= 0 ? rows[Math.min(at, rows.length - 1)] : active ? L.byId[active.getAttribute('data-id')] : rows[0];
      if (!next || !L.focusLeadRow(next.id)) focusEmpty();
      if (undo) V.toast.undo('Deleted ' + L.who(list), { action: { label: 'Undo', onClick: function () {
        list.forEach(function (l) { delete l.deleted; });
        var back = list.filter(function (l) { return L.query().pageRows.indexOf(l) >= 0; })[0]; if (back) S.activeId = back.id;
        L.render(); if (!back || !L.focusLeadRow(back.id)) { var r = $('#leads-tbody tr[tabindex="0"]'); if (r && U.visible(r)) L.focusLeadRow(r.getAttribute('data-id')); else focusEmpty(); }
        V.announce(list.length === 1 ? 'Restored ' + list[0].name : 'Restored ' + L.plural(list.length, 'lead'));
      } } }); else V.toast.success('Deleted ' + L.who(list) + '. Their call reports are kept.'); };
    if (list.length <= 50 && !o.all) return go(true);
    V.dialog.confirm({ title: 'Delete ' + L.plural(list.length, 'lead') + '?', body: 'They’re removed from Leads and from every view and batch. Their call reports are kept.', impact: [{ icon: 'users', text: L.plural(list.length, 'lead') + ' removed' }, { icon: 'file-text', text: 'Call reports kept' }], confirmLabel: 'Delete ' + L.plural(list.length, 'lead'), tone: 'danger', typedConfirm: { value: F.count(list.length), hint: 'Type ' + F.count(list.length) + ' to confirm.' }, returnTo: o.returnTo }).then(function (ok) { if (ok) go(false); });
  };

  /* ---------- menus: row ⋯, status, flow, bulk ⋯ ---------- */
  var ctx = { kind: 'row', id: null, btn: null };
  function ctxLeads() { return ctx.kind === 'bulk' ? L.selectedLeads() : [L.byId[ctx.id]].filter(Boolean); }
  function prepRowMenu(btn) {
    ctx = { kind: 'row', id: btn.getAttribute('data-row-menu') || btn.getAttribute('data-lead-menu'), btn: btn };
    var l = L.byId[ctx.id], m = $('#leads-row-menu'), call = $('[data-value="call"]', m), del = $('[data-value="delete"]', m);
    call.hidden = !V.bp.coarse(); var b = L.leadBlocker(l); if (b) { call.setAttribute('aria-disabled', 'true'); call.setAttribute('data-reason', b.reason); } else { call.removeAttribute('aria-disabled'); call.removeAttribute('data-reason'); }
    if (L.isAdmin()) { del.removeAttribute('aria-disabled'); $('.menu-desc', del).hidden = true; } else { del.setAttribute('aria-disabled', 'true'); del.setAttribute('data-reason', 'Only admins can delete leads. Ask an admin.'); $('.menu-desc', del).hidden = false; }
    m.setAttribute('aria-label', 'More actions for ' + l.name);
    prepStatusMenu(); prepFlowMenu();
  }
  function prepStatusMenu() {
    var cur = ctx.kind === 'row' && L.byId[ctx.id] ? L.byId[ctx.id].status : null;
    $$('#leads-status-menu [role="menuitemradio"]').forEach(function (it) { it.setAttribute('aria-checked', it.getAttribute('data-value') === cur ? 'true' : 'false'); it.hidden = it.getAttribute('data-value') === 'callback_due' && L.capOff('B5'); });
  }
  function prepFlowMenu() {
    var cur = ctx.kind === 'row' && L.byId[ctx.id] ? (L.byId[ctx.id].flowId || 'default') : null;
    $$('#leads-flow-menu [role="menuitemradio"]').forEach(function (it) { it.setAttribute('aria-checked', it.getAttribute('data-value') === cur ? 'true' : 'false'); });
  }
  L.prepRowMenu = prepRowMenu; L.menuCtx = function (c) { ctx = c; prepStatusMenu(); prepFlowMenu(); };
  function buildMenus() {
    $('#leads-status-menu').innerHTML = L.STATUS_ORDER.filter(function (s) { return s !== 'do_not_call'; }).map(function (s) { var def = V.statusDef('lead', s); return '<button class="menu-item" role="menuitemradio" aria-checked="false" type="button" data-value="' + s + '">' + V.icon(def[1]) + '<span class="menu-text"><span>' + esc(def[0]) + '</span></span><span class="menu-check">' + V.icon('check') + '</span></button>'; }).join('') +
      '<div class="menu-sep" role="separator"></div><button class="menu-item" role="menuitem" type="button" data-value="do_not_call">' + V.icon('ban') + '<span class="menu-text"><span>Do not call…</span></span></button>';
    $('#leads-flow-menu').innerHTML = '<button class="menu-item" role="menuitemradio" aria-checked="false" type="button" data-value="default"><span class="menu-text"><span>Use workspace default</span><span class="menu-desc">Site-visit qualifier v7</span></span><span class="menu-check">' + V.icon('check') + '</span></button><div class="menu-sep" role="separator"></div>' +
      (V.data.flows || []).filter(function (f) { return !f.archived; }).map(function (f) { var live = f.live && f.status !== 'not-published'; return '<button class="menu-item" role="menuitemradio" aria-checked="false" type="button" data-value="' + f.id + '"' + (live ? '' : ' aria-disabled="true" data-reason="Not published yet. Publish it to use it for calls."') + '>' + V.icon('workflow') + '<span class="menu-text"><span translate="no">' + esc(f.name) + '</span><span class="menu-desc">' + (live ? 'Live v' + f.live.version : 'Not published yet. Publish it to use it for calls.') + '</span></span><span class="menu-check">' + V.icon('check') + '</span></button>'; }).join('');
  }

  /* ---------- keyboard model additions (the shell handles ↑ ↓ J K Home End Space X Enter) ---------- */
  var toldA = false;
  function onKey(e) {
    var r = e.target.closest && e.target.closest('#leads-tbody tr[data-id]'); if (!r || e.target !== r) return;
    var list = $$('#leads-tbody tr[data-id]'), i = list.indexOf(r);
    if (e.key === 'PageDown' || e.key === 'PageUp') { e.preventDefault(); var wrap = $('#leads-dtwrap'), step = Math.max(1, Math.floor((wrap.clientHeight - 40) / Math.max(1, r.offsetHeight))); var n = list[Math.max(0, Math.min(list.length - 1, i + (e.key === 'PageDown' ? step : -step)))]; if (n) n.focus(); return; }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.shiftKey) { var nr = d.activeElement; [r, nr].forEach(function (x) { var cb = x && $('[data-select-row]', x); if (cb) cb.checked = true; }); V.table.syncSelection($('#leads-table')); return; }
    if (e.key === 'Escape' && !V.overlays.top() && L.selCount()) { e.preventDefault(); L.clearSelection(); V.announce('Selection cleared', { dedupeKey: 'sel' }); return; }
    if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey && V.shortcuts.enabled() && !toldA) { toldA = true; V.toast.info('Select all is now Ctrl+A.'); }
  }
  function onFocusIn(e) {
    var row = e.target.closest('#leads-tbody tr[data-id]'); if (!row) return;
    var id = row.getAttribute('data-id'); if (id === S.activeId && $('[data-select-row]', row).getAttribute('tabindex') !== '-1') return;
    S.activeId = id;
    $$('#leads-tbody tr[data-id]').forEach(function (r) { var on = r === row; $$('input, a, button', r).forEach(function (c) { if (on) c.removeAttribute('tabindex'); else c.setAttribute('tabindex', '-1'); }); });
    if (e.target === row && !quietFollow && L.sheetOpen && L.sheetOpen() && S.leadId && S.leadId !== id && L.followLead) L.followLead(id);
  }

  /* ---------- init ---------- */
  L.initTable = function () {
    buildMenus();
    var t = $('#leads-table');
    t.setAttribute('data-density', V.density.get('leads'));
    $$('#leads-density [role="radio"]').forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-value') === V.density.get('leads') ? 'true' : 'false'); }); V.seg.init($('#leads-tb'));
    t.addEventListener('vaani:selection', reconcile);
    t.addEventListener('keydown', onKey);
    t.addEventListener('focusin', onFocusIn);
    t.addEventListener('click', function (e) {
      var sb = e.target.closest('[data-sort]'); if (sb) { var col = sb.getAttribute('data-sort'), c = L.col(col), s = L.curSort(), first = c.sort, rev = first === 'asc' ? 'desc' : 'asc';
        var nx = s[0] !== col ? [col, first] : s[1] === first ? [col, rev] : null; L.setSort(nx); V.announce('Sorted by ' + L.sortWords(L.curSort()).toLowerCase().replace(/^./, function (m) { return m.toUpperCase(); }), { dedupeKey: 'sort' }); var nb = $('#leads-thead [data-sort="' + col + '"]'); if (nb) nb.focus(); return; }
      var a = e.target.closest('a[data-lead]'); if (a) { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return; e.preventDefault(); L.openLead(a.getAttribute('data-lead'), { returnTo: a.closest('tr') }); return; }
      var cb = e.target.closest('[data-call]'); if (cb) { var l = L.byId[cb.getAttribute('data-call')], b = L.leadBlocker(l); if (b) { L.blockedActivation(b); return; } L.openGate({ mode: 'single', leads: [l], trigger: cb, entry: 'row' }); return; }
      var mb = e.target.closest('[data-row-menu]'); if (mb) prepRowMenu(mb);
    }, true);
    t.addEventListener('keydown', function (e) { var mb = e.target.closest && e.target.closest('[data-row-menu]'); if (mb && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) prepRowMenu(mb); }, true);
    /* phone selection mode: Select / Done, All */
    $('#leads-select-btn').addEventListener('click', function () { L.setSelectMode(!S.selectMode); V.announce(S.selectMode ? 'Selection mode. Tap leads to select them.' : 'Selection mode off'); });
    $('#leads-selall-btn').addEventListener('click', function () { L.selectPage(); });
    /* phone list */
    var ul = $('#leads-list');
    ul.addEventListener('click', function (e) {
      var up = e.target.closest('[data-leads-upcoming]'); if (up) { L.setFilter('callback', { value: '7d' }); return; }
      var cb = e.target.closest('.leads-li-cb'); if (cb) { liToggle(cb.closest('li').getAttribute('data-id'), cb.checked); return; }
      var a = e.target.closest('a[data-lead]'); if (!a) return; if (e.ctrlKey || e.metaKey) return; e.preventDefault();
      if (S.selectMode) { var box = $('.leads-li-cb', a.closest('li')); box.checked = !box.checked; liToggle(a.getAttribute('data-lead'), box.checked); return; }
      L.openLead(a.getAttribute('data-lead'), { returnTo: a });
    });
    $('#leads-tbody').addEventListener('click', function (e) { if (e.target.closest('[data-leads-upcoming]')) L.setFilter('callback', { value: '7d' }); });
    /* BulkBar */
    var bar = $('#leads-bulk');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bk]'); if (!b) return; var k = b.getAttribute('data-bk');
      if (k === 'call') { var blk = L.globalBlocker(); if (blk) { L.blockedActivation(blk); return; } L.openGate({ mode: 'batch', leads: L.selectedLeads(), trigger: b, entry: 'bulk', all: S.sel.all }); }
      else if (k === 'all') { L.selectAllMatching(); var c = $('[data-bk="call"]', bar); if (c) c.focus(); }
      else if (k === 'clearall' || k === 'clear') { L.clearSelection(); V.announce('Selection cleared', { dedupeKey: 'sel' }); if (S.selectMode && V.bp.phone()) L.setSelectMode(false); }
      else if (k === 'export') L.openExport(b, { selected: true });
      else if (k === 'status' || k === 'flow' || k === 'more') { ctx = { kind: 'bulk', btn: b }; prepStatusMenu(); prepFlowMenu(); $('#leads-bulk-phone-items').hidden = !V.bp.phone(); }
    }, true);
    bar.addEventListener('keydown', function (e) {
      var btns = $$('button', bar).filter(U.visible), i = btns.indexOf(d.activeElement), n = null;
      if (e.key === 'ArrowRight') n = btns[(i + 1) % btns.length]; else if (e.key === 'ArrowLeft') n = btns[(i - 1 + btns.length) % btns.length]; else if (e.key === 'Home') n = btns[0]; else if (e.key === 'End') n = btns[btns.length - 1];
      if (e.key === 'Escape' && !V.overlays.top()) { e.preventDefault(); L.clearSelection(); V.announce('Selection cleared', { dedupeKey: 'sel' }); return; }
      if (!n) return; e.preventDefault(); btns.forEach(function (b) { b.setAttribute('tabindex', b === n ? '0' : '-1'); }); n.focus();
    });
    /* menu selections */
    $('#leads-row-menu').addEventListener('vaani:menuselect', function (e) {
      var v = e.detail.value, l = L.byId[ctx.id], btn = ctx.btn; if (!l) return;
      if (v === 'open') L.openLead(l.id, { returnTo: btn.closest('tr') || btn });
      else if (v === 'call') { var b = L.leadBlocker(l); if (b) L.blockedActivation(b); else setTimeout(function () { L.openGate({ mode: 'single', leads: [l], trigger: btn, entry: 'row' }); }, 0); }
      else if (v === 'copy') L.copyLink(l);
      else if (v === 'flow') setTimeout(function () { ctx = { kind: 'row', id: l.id, btn: btn }; prepFlowMenu(); V.menu.open(btn, 'leads-flow-menu'); }, 0);
      else if (v === 'note') L.openLead(l.id, { tab: 'notes', focusNote: true, returnTo: btn.closest('tr') || btn });
      else if (v === 'delete') L.deleteLeads([l], { returnTo: btn });
    });
    $('#leads-status-menu').addEventListener('vaani:menuselect', function (e) { var v = e.detail.value; V.menu.close(); var list = ctxLeads(); if (!list.length) return; if (ctx.kind === 'row' && list[0].status === v) return; L.setStatus(list, v, { clear: ctx.kind === 'bulk', returnTo: ctx.btn }); });
    $('#leads-flow-menu').addEventListener('vaani:menuselect', function (e) { var v = e.detail.value; V.menu.close(); var list = ctxLeads(); if (!list.length) return; L.assignFlow(list, v === 'default' ? null : v, { clear: ctx.kind === 'bulk' }); });
    $('#leads-bulk-more').addEventListener('vaani:menuselect', function (e) {
      var v = e.detail.value, list = L.selectedLeads(), btn = ctx.btn;
      if (v === 'note') L.openBulkNote && L.openBulkNote(list, btn);
      else if (v === 'delete') L.deleteLeads(list, { all: S.sel.all, returnTo: btn });
      else if (v === 'export') L.openExport(btn, { selected: true });
      else if (v === 'status' || v === 'flow') setTimeout(function () { ctx = { kind: 'bulk', btn: btn }; prepStatusMenu(); prepFlowMenu(); V.menu.open(btn, v === 'status' ? 'leads-status-menu' : 'leads-flow-menu'); }, 0);
    });
    /* shortcuts scoped to the table (§8.1) */
    V.shortcuts.register('c', function () {
      var n = L.selCount(), row = d.activeElement && d.activeElement.closest('#leads-tbody tr[data-id]') || $('#leads-tbody tr[tabindex="0"]');
      var blk = L.globalBlocker(); if (blk) { L.blockedActivation(blk); return; }
      if (n) { L.openGate({ mode: 'batch', leads: L.selectedLeads(), trigger: $('#leads-bulk-call') || row, entry: 'shortcut', all: S.sel.all, returnTo: d.activeElement }); return; }
      if (!row) return false; var l = L.byId[row.getAttribute('data-id')], b = L.leadBlocker(l); if (b) { L.blockedActivation(b); return; }
      L.openGate({ mode: 'single', leads: [l], trigger: $('[data-call]', row) || row, entry: 'shortcut', returnTo: row });
    }, { description: 'Call the selection or the focused lead… (opens the Call gate)', group: 'Lists and tables', scope: 'leads-table' });
    V.shortcuts.register('mod+a', function () { $$('#leads-tbody [data-select-row]').forEach(function (cb) { cb.checked = true; }); V.table.syncSelection($('#leads-table')); }, { description: 'Select every lead on this page', group: 'Lists and tables', scope: 'leads-table', singleKey: false });
    V.shortcuts.register('x', null, { description: 'Select or clear the focused row', group: 'Lists and tables', displayOnly: true });
    V.shortcuts.register('j', null, { description: 'Next row (the open lead follows)', group: 'Lists and tables', displayOnly: true });
    V.shortcuts.register('k', null, { description: 'Previous row', group: 'Lists and tables', displayOnly: true });
    V.shortcuts.register('shift+down', null, { description: 'Extend the selection', group: 'Lists and tables', displayOnly: true, singleKey: false, label: ['Shift', 'down'] });
  };
  L.copyLink = function (l) { var url = w.location.href.split('?')[0] + '?lead=' + l.id; try { navigator.clipboard.writeText(url).then(function () {}, function () {}); } catch (e) { /* clipboard blocked */ } V.toast.success('Link to ' + l.name + ' copied'); };
  L.setSelectMode = function (on) { S.selectMode = on; if (!on) L.clearSelection(true); $('#leads-select-btn').setAttribute('aria-pressed', on ? 'true' : 'false'); $('#leads-select-btn').querySelector('span').textContent = on ? 'Done' : 'Select'; $('#leads-selall-btn').hidden = !on; L.render(); };
})(window, document);
