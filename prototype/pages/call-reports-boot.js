/* Vaani Labs prototype · Call reports · wiring and start-up (views, search, sort, paging, open, shortcuts, Back, states). */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, P = NS.page, $ = U.$, $$ = U.$$, esc = U.esc, fmt = V.fmt, store = U.store;

  /* ---------- views (manual activation), the compact-height View select, saved views ---------- */
  function loadUserViews() { try { P.userViews = JSON.parse(store.get('vaani:call-reports:views') || '[]'); } catch (e) { P.userViews = []; } }
  function selectView(id) {
    var u = (P.userViews || []).filter(function (x) { return x.id === id; })[0];
    if (u) { P.userView = u; P.set({ view: u.st.view || 'all', q: u.st.q || '', when: u.st.when || '', f: u.st.f || {} }); return; }
    P.userView = null; P.set({ view: id });
  }
  d.addEventListener('vaani:tabchange', function (e) { if (e.target.id === 'cr-tablist') selectView(e.detail.tab.getAttribute('data-view')); });
  d.addEventListener('vaani:change', function (e) {
    if (e.target.id === 'cr-viewsel') selectView(e.detail.value);
    if (e.target.classList && e.target.classList.contains('cr-size')) P.set({ size: +e.detail.value });
  });
  $('#cr-saveview').addEventListener('click', function (e) { $('#cr-saveview-scope').textContent = 'Saves: ' + P.scopeWords(); $('#cr-saveview-name').value = ''; V.dialog.open('cr-saveview-dlg', { returnTo: e.currentTarget }); });
  $('#cr-saveview-ok').addEventListener('click', function () {
    var name = $('#cr-saveview-name').value.trim() || 'My view'; loadUserViews();
    var u = { id: 'uv_' + (Date.now() % 100000), label: name, st: { view: P.st.view, q: P.st.q, when: P.st.when, f: P.st.f } };
    P.userViews.push(u); store.set('vaani:call-reports:views', JSON.stringify(P.userViews)); P.userView = u;
    V.dialog.close('cr-saveview-dlg', 'confirm'); NS.renderViews(); V.toast.success('View saved · ' + name);
  });

  /* ---------- search, filters, test calls, totals, export, columns ---------- */
  var qt = null;
  $('#cr-q').addEventListener('input', function (e) { $('#cr-q-clear').hidden = !e.target.value; clearTimeout(qt); qt = setTimeout(function () { P.set({ q: e.target.value.trim() }, { push: false }); }, 300); });
  $('#cr-search-form').addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(qt); P.set({ q: $('#cr-q').value.trim() }); });
  $('#cr-q-clear').addEventListener('click', function () { $('#cr-q').value = ''; $('#cr-q').focus(); P.set({ q: '' }); });
  $('#cr-filter-btn').addEventListener('click', function (e) { if (e.currentTarget.getAttribute('aria-disabled') !== 'true') NS.openFilter(e.currentTarget); });
  $('#cr-clear').addEventListener('click', function () { if (!P.offline()) P.set({ f: {}, when: '' }); });
  $('#cr-tokens').addEventListener('click', function (e) {
    var ed = e.target.closest('[data-edit]'), rm = e.target.closest('[data-remove]'); if (P.offline()) return;
    if (ed) NS.openFilter(ed, ed.getAttribute('data-edit'));
    if (rm) { var id = rm.getAttribute('data-remove'), f = JSON.parse(JSON.stringify(P.st.f)); if (id === 'when') P.set({ when: '' }); else { delete f[id]; if (id === 'flow') delete f.last_step; P.set({ f: f }); } $('#cr-filter-btn').focus(); }
  });
  $('#cr-test').addEventListener('click', function () { P.set({ test: !P.st.test }); });
  $('#cr-count').addEventListener('click', function (e) { NS.renderTotals(); if (e.currentTarget.getAttribute('aria-expanded') === 'true') V.popover.close('cr-totals'); else V.popover.open(e.currentTarget, 'cr-totals', { placement: 'bottom-end' }); });
  function openExport(trigger) { NS.renderExport(); V.popover.open(trigger, 'cr-export', { placement: 'bottom-end' }); }
  $('#cr-export-btn').addEventListener('click', function (e) { openExport(e.currentTarget); });
  /* The Columns menu is rebuilt in the capture phase, before the shell opens it (click, which Enter and Space also fire, or
     ArrowDown/ArrowUp), so the shell’s roving focus lands on the fresh items. Rebuilding after it opened replaced the
     focused item and left the keyboard nothing to move through. */
  function colsBeforeOpen(e) { var b = e.target.closest && e.target.closest('#cr-cols-btn'); if (b && b.getAttribute('aria-expanded') !== 'true') NS.renderColsMenu(); }
  d.addEventListener('click', colsBeforeOpen, true);
  d.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') colsBeforeOpen(e); }, true);
  d.addEventListener('click', function (e) {
    var go = e.target.closest('#cr-x-go'); if (go && go.getAttribute('aria-disabled') !== 'true') NS.runExport();
    if (e.target.closest('[data-retry]')) { P._retried = true; if (/error/.test(P.proto || '')) { P.proto = null; P.st.state = null; P.writeUrl(false); } P.updatedAt = fmt.now().toISOString(); P.run(); NS.render(); V.announce('Calls loaded'); }
    if (e.target.closest('[data-retry-stats]')) { P.proto = null; P.st.state = null; P.writeUrl(false); P.run(); NS.render(); NS.renderTotals(); }
    if (e.target.closest('[data-clear-search]')) { P.set({ q: '' }); $('#cr-q').focus(); }
    if (e.target.closest('[data-clear-filters]')) { P.set({ f: {}, when: '', q: '' }, { keepSnapshot: true, after: function () { var c = NS.callById(P.openId); if (c) NS.renderSheet(c); } }); }
    if (e.target.closest('[data-docs]')) V.toast.info('How call reports work opens the help centre, outside this prototype.');
    if (e.target.closest('#cr-show-new')) showNew();
  });
  d.addEventListener('vaani:menuselect', function (e) {
    var it = e.detail.item; if (!it.closest('#cr-more-menu')) return;
    if (it.getAttribute('data-act') === 'refresh') refresh(); else openExport($('.ph-more'));
  });
  function refresh() {
    P.keep = {}; P.updatedAt = fmt.now().toISOString(); var lab = $('#cr-refresh-label');
    P.set({}, { keepPage: true, push: false, after: function () { lab.textContent = 'Updated ' + fmt.time(P.updatedAt); setTimeout(function () { lab.textContent = 'Refresh'; }, 4000); if (P.flag('refresh-error')) { P._retried = false; NS.renderNotice(); } } });
  }
  $('#cr-refresh').addEventListener('click', refresh);

  /* ---------- sort, paging, opening a call ---------- */
  $('#cr-thead').addEventListener('click', function (e) {
    var b = e.target.closest('.th-sort'); if (!b || P.offline()) return; var col = b.closest('th').getAttribute('data-col'), s = P.st.sort;
    var dir = s.col === col ? (s.dir === 'desc' ? 'asc' : 'desc') : (col === 'lead' || col === 'flow' || col === 'direction' || col === 'outcome' || col === 'sentiment' || col === 'result' ? 'asc' : 'desc');
    P.set({ sort: { col: col, dir: dir } }, { quiet: true, after: function () { var th = $('#cr-thead th[data-col="' + col + '"] .th-sort'); if (th) th.focus(); V.announce($('#cr-caption').textContent.replace('Calls, sorted', 'Sorted')); } });
  });
  $('#cr-pager').addEventListener('click', function (e) {
    var b = e.target.closest('#cr-prev, #cr-next'); if (!b || b.getAttribute('aria-disabled') === 'true') return;
    var id = b.id; P.set({ page: P.st.page + (id === 'cr-next' ? 1 : -1) }, { keepPage: true, quiet: true, after: function () { var n = $('#' + id); if (n && n.getAttribute('aria-disabled') !== 'true') n.focus(); else { var r = $('#cr-tbody tr'); if (r) r.focus(); } V.announce($('#cr-pager .cr-range').textContent); $('#cr-scroll').scrollTop = 0; } });
  });
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-open]'); if (!a) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
    e.preventDefault(); if (P.flag('loading')) return;
    NS.openCall(a.getAttribute('data-open'), { returnTo: a.closest('tr') || a, snapshot: true });
  });

  /* ---------- keyboard: J/K in the sheet, C on a row, Shift+D, F6 (06-accessibility §8) ---------- */
  V.shortcuts.register('j', function () { NS.step(1); }, { scope: 'cr-sheet', group: 'Records and sheets', description: 'Next call', when: function () { return !!P.openId && !$('#cr-sheet').classList.contains('cs-is-gone'); } });
  V.shortcuts.register('k', function () { NS.step(-1); }, { scope: 'cr-sheet', group: 'Records and sheets', description: 'Previous call', when: function () { return !!P.openId; } });
  V.shortcuts.register('mod+enter', null, { displayOnly: true, group: 'Records and sheets', description: 'Mark reviewed (and next in Needs review)' });
  V.shortcuts.register('mod+f', null, { displayOnly: true, group: 'Records and sheets', description: 'Search the transcript (focus in the sheet)' });
  /* C on a focused row: the gate anchors to the row’s ⋯ (or its Lead link when ⋯ steps aside beside the docked sheet) and
     returns focus to the row itself on Esc or Cancel (03 §8.2), like Leads. A global blocker (wallet ₹0, caller ID, offline)
     never opens it: NS.openGate announces the reason and shows the toast with its fix (gate §4.4 rule 1). */
  V.shortcuts.register('c', function () {
    var r = d.activeElement && d.activeElement.closest('#cr-tbody tr'); if (!r) return false;
    var mb = $('[data-rowmenu]', r), anchor = mb && U.visible(mb) ? mb : ($('a[data-open]', r) || r);
    NS.openGate(NS.callById(r.getAttribute('data-id')), anchor, { returnTo: r });
  }, { scope: 'cr-table', group: 'Lists and tables', description: 'Call back the lead of the focused call…' });
  V.shortcuts.register('shift+d', function () { var seg = $('#cr-density'), next = $('[aria-checked="false"]', seg); if (next) V.seg.select(next); }, { group: 'Lists and tables', description: 'Switch density' });
  V.shortcuts.register('f6', function () {
    if (!P.openId) return false; var inSheet = d.activeElement && d.activeElement.closest('#cr-sheet');
    if (inSheet) { var r = $('#cr-tbody tr[data-id="' + P.openId + '"]') || $('#cr-tbody tr'); if (r && U.visible(r)) r.focus(); else return false; } else $('#cs-title').focus();
  }, { group: 'Records and sheets', description: 'Move between the table and the call sheet' });
  NS.bindSheetKeys();

  /* ---------- Back and forward restore the whole state (§1.4) ---------- */
  w.addEventListener('popstate', function () {
    var st = NS.readState(w.location.search); st.state = P.proto; P.st = st; P.keep = {}; P.run(); NS.render();
    if (st.call && st.call !== P.openId) NS.openCall(st.call, { push: false });
    else if (!st.call && P.openId) NS.closeSheet('x');
  });
  V.on('breakpoint', function () {
    NS.renderTable(); NS.renderPager();
    if (P.openId) { var want = w.innerWidth >= 1440 ? 'docked' : V.bp.desktopShell() ? 'overlay' : 'modal'; if (want !== P.sheetMode) { var id = P.openId, tab = P.st.tab; NS.closeSheet('replace'); /* reopen once the old layer has left (its exit animation re-homes the sheet) */ setTimeout(function () { P.st.tab = tab; NS.openCall(id, { push: false, tab: tab }); P.writeUrl(false); }, 240); } }
  });
  w.addEventListener('resize', function () { NS.syncPins(); });

  /* ---------- new calls (poll every 60 s while visible; here after a moment in the demo state) ---------- */
  function newCalls() {
    var base = NS.calls.filter(function (c) { return !c.test && c.result === 'completed'; }).slice(3, 6);
    P.pending = base.map(function (b, i) { var c = {}; for (var k in b) c[k] = b[k]; c.id = 'call_n0' + i + 'e1'; c.at = V.data._util.ist(0, '11:2' + (4 - i)); c.sec = 5 + i * 11; c._text = null; c.reviewed = null; c.candidate = false; if (i === 0) { c.pendingAnalysis = true; c.sentiment = 'unscored'; c.summary = null; } NS.byId[c.id] = c; return c; });
    NS.renderMeta(); V.announce(P.pending.length + ' new calls');
  }
  function showNew() {
    P.extra = P.pending.concat(P.extra); P.pending = []; P.updatedAt = fmt.now().toISOString();
    P.set({ page: 1 }, { after: function () { var r = $('#cr-tbody tr'); if (r) r.focus(); setTimeout(function () { var c = P.extra[0]; if (!c || !c.pendingAnalysis) return; c.pendingAnalysis = false; c.sentiment = 'positive'; c.summary = NS.callById('call_n00e1') ? c.summary || 'Wants a Saturday site visit near the metro.' : c.summary; NS.renderTable(); V.announce('Analysis complete for the newest call'); }, 4000); } });
  }

  /* ---------- Prototype states (prototype only; a demo control, not part of the product) ---------- */
  function protoMenu() {
    var third = (NS.query({ view: 'all', q: '', when: '', f: {}, sort: { col: 'when', dir: 'desc' }, test: false }).rows[120] || NS.calls[0]).id;
    var stale = NS.calls.filter(function (c) { return c.staleSince; })[0], first = NS.calls[0];
    var states = [['', 'Default'], ['first-use', 'First use · no calls yet'], ['loading', 'Loading · first load'], ['error', 'Error · first load'], ['refresh-error', 'Error · refresh failed'], ['stats-error', 'Totals failed · rows load'], ['new-calls', 'New calls arrive'], ['offline', 'Offline'], ['forbidden', 'Permission · no access'], ['member', 'Permission · member actions'], ['no-callerid', 'Setup · no verified caller ID'],['colleague', 'Review run · a colleague reviews a call'], ['review-fail', 'Review run · saving fails'], ['transcript-error', 'Sheet · transcript fails'], ['sheet-loading', 'Sheet · loading']];
    var links = [['?view=review', 'Needs review · start a review run'], ['?call=' + third, 'Deep link · a call on page 3'], ['?call=call_deleted', 'Deep link · deleted call'], ['?when=30d&f.intent=int_price', 'Drill-in from Analytics'], ['?f.flow=flow_3b90@3', 'One flow version · captured columns'], ['?wallet=empty&call=' + first.id, 'Wallet empty · Call back blocked'], ['?call=' + (stale ? stale.id : first.id), 'Stale call · timed out'], ['?q=site%20visit', 'Search · “site visit”'], ['?q=zzqx', 'Search · no results'], ['?view=positive&when=7d&f.result=failed', 'Filtered to nothing']];
    $('#cr-proto-menu').innerHTML = '<span class="menu-group-label">Prototype only · page states</span>' + states.map(function (s) { return '<button class="menu-item" role="menuitemradio" type="button" aria-checked="' + ((P.proto || '') === s[0]) + '" data-state="' + s[0] + '"><span class="menu-check">' + V.icon('check') + '</span><span class="menu-text"><span>' + esc(s[1]) + '</span></span></button>'; }).join('') +
      '<div class="menu-sep" role="separator"></div><span class="menu-group-label">Jump to</span>' + links.map(function (l) { return '<a class="menu-item" role="menuitem" href="call-reports.html' + l[0] + '"><span class="menu-check"></span><span class="menu-text"><span>' + esc(l[1]) + '</span></span></a>'; }).join('');
  }
  d.addEventListener('vaani:menuselect', function (e) { var it = e.detail.item; if (!it.closest('#cr-proto-menu') || !it.hasAttribute('data-state')) return; var s = it.getAttribute('data-state'); w.location.href = 'call-reports.html' + (s ? '?state=' + s : ''); });

  /* ---------- start ---------- */
  function start() {
    loadUserViews(); protoMenu();
    var dens = V.density.get('call-reports'); $('#cr-work').setAttribute('data-density', dens); var sel = $('#cr-density [data-value="' + dens + '"]'); if (sel) V.seg.select(sel);
    if (P.flag('loading')) { P.rows = []; P.pageRows = []; P.viewTotal = 0; P.pages = 1; P.start = 0; P.counts = null; NS.render(); V.announce('Loading calls…'); return; }
    if (P.firstUse()) { P.rows = []; P.pageRows = []; P.viewTotal = 0; P.pages = 1; P.start = 0; P.counts = { all: 0, review: 0, positive: 0, negative: 0, mixed: 0, unscored: 0 }; P.stats = NS.stats([]); NS.render(); return; }
    P.run(); NS.render();
    if (P.flag('forbidden')) { $('#cr-meta').textContent = ''; return; }
    if (P.flag('new-calls')) setTimeout(newCalls, 1500);
    if (P.st.call) {
      var c = NS.callById(P.st.call), r = $('#cr-tbody tr[data-id="' + P.st.call + '"]');
      NS.openCall(P.st.call, { push: false, returnTo: r || $('#page-title'), tab: P.st.tab, t: P.st.t, snapshot: true });
      if (!c) V.announce('This call was deleted, or you no longer have access.');
    } else if (P.hasFilters() || P.st.view !== 'all') { $('#page-title').focus(); V.announce(P.resultWords() + ' match'); }
  }
  V.ready(start);
})(window, document);
