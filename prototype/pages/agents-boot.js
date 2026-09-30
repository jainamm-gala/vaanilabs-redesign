/* Vaani Labs prototype · pages/agents-boot.js — start-up for agents.html: picks the view from ?view=, sets the nav item,
   title and body attributes, renders, wires the header, toolbar, tabs and shortcuts (N, /, J/K in sheets), and opens
   whatever the URL asks for (start=1, room=, meeting=[&full=1], generate=1, new=1[&template=|from=], task=). */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, icon = A.icon, M = A.mt, P = A.pa;

  /* the dock-swap: a docked sheet takes the aside’s place (Meetings) or the right column (Personal agents) */
  A.dock = function () { var changed = false; $$('.ag-work').forEach(function (w0) { var on = !!$('.sheet.is-docked:not([hidden])', w0); if (w0.classList.contains('ag-docked') !== on) changed = true; w0.classList.toggle('ag-docked', on); }); if (changed && A.taskSheet && A.view === 'personal-agents') A.taskSheet.refresh(); };

  function more(trigger) {
    var items = A.view === 'meetings' ? M.moreItems() : P.moreItems();
    A.openMenu(trigger, 'ag-more-menu', items, function (act) {
      if (act === 'how') V.popover.open(trigger, A.view === 'meetings' ? 'mt-how' : 'pa-how', { placement: 'bottom-end' });
      else if (act === 'deck') A.deck.open({ returnTo: trigger });
      else if (act === 'refresh') refresh();
    }, 'More actions');
  }
  function refresh() {
    var b = $('#pa-refresh'); if (b) { b.setAttribute('aria-busy', 'true'); b.innerHTML = icon('loader-circle', null, { className: 'spinner' }); }
    setTimeout(function () {
      if (b) { b.removeAttribute('aria-busy'); b.innerHTML = icon('refresh-cw'); b.setAttribute('data-tooltip', 'Refresh · Updated ' + V.fmt.time(V.fmt.now().toISOString())); }
      if (A.is('error-refresh')) { V.announce('Couldn’t refresh'); return; }
      V.announce('Updated ' + V.fmt.time(V.fmt.now().toISOString()));
    }, 700);
  }
  function askAdmin() { A.copy('Please assign me a personal-agent number in Vaani Labs, Settings › Phone setup.', 'Request copied. Send it to an admin.'); }

  function bootMeetings() {
    $('#mt-view').hidden = false; M.render();
    var q = A.q('meeting');
    if (q && A.q('full')) { A.mtg.renderPage(q); }
    d.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('#ag-more')) { e.preventDefault(); e.stopPropagation(); more(t.closest('#ag-more')); return; }
      if (t.closest('#mt-start-btn, [data-mt-start]')) { var b = t.closest('#mt-start-btn, [data-mt-start]'); if (A.blocked(b)) return; A.start.open({ returnTo: b }); return; }
      if (t.closest('[data-mt-retry]')) { w.location.href = 'agents.html?view=meetings'; return; }
      if (t.closest('[data-mt-clear]')) { M.clearFilters(); var s = $('#mt-search'); if (s) s.focus(); return; }
      var un = t.closest('[data-mt-untoken]'); if (un) { var p = un.getAttribute('data-mt-untoken').split(':'); M.f[p[0]] = M.f[p[0]].filter(function (x) { return x !== p[1]; }); M.renderPast(); $('#mt-filter-btn').focus(); return; }
      if (t.closest('#mt-filter-clear')) { $$('#mt-filter-body input').forEach(function (i) { i.checked = false; }); M.applyFilter(); return; }
      if (t.closest('#mt-filter-apply')) { M.applyFilter(); return; }
      if (t.closest('#mt-hear')) { var h = t.closest('#mt-hear'), on = h.getAttribute('aria-pressed') !== 'true'; h.setAttribute('aria-pressed', on); h.setAttribute('aria-label', on ? 'Stop preview of Vikash' : 'Hear Vikash'); h.innerHTML = icon(on ? 'square' : 'play'); if (on) { V.announce('Playing a sample of Vikash'); setTimeout(function () { if (h.getAttribute('aria-pressed') === 'true') h.click(); }, 4000); } }
    });
    d.addEventListener('vaani:open', function (e) { if (e.target.id === 'mt-filter-pop') M.renderFilter(); });
    d.addEventListener('input', function (e) { if (e.target.id !== 'mt-search') return; M.f.q = e.target.value; clearTimeout(M._t); M._t = setTimeout(function () { A.url.set({ q: M.f.q.trim() || null }); M.renderPast(); V.announce(M.visible().length + ' meetings', { dedupeKey: 'mtq' }); }, 250); });
    d.addEventListener('submit', function (e) { if (e.target.id === 'mt-search-form') e.preventDefault(); });
    d.addEventListener('vaani:change', function (e) { if (e.target.id === 'mt-date') { M.f.when = e.detail.value; M.renderPast(); var st = $('#mt-past .ag-sec-head .status'); if (st) st.textContent = M.whenLabel(); } });
    d.addEventListener('vaani:sort', function (e) { if (e.target.id === 'mt-table') { M.sortDir = e.detail.direction; M.renderPast(); } });
    d.addEventListener('focusin', function (e) { var r = e.target.closest && e.target.closest('#mt-tbody tr'); if (r && M.sheetOpenId && r.getAttribute('data-id') !== M.sheetOpenId && e.target === r) A.mtg.open(r.getAttribute('data-id'), null, { keepFocus: true }); });
    V.shortcuts.register('n', function () { var b = $('#mt-start-btn'); if (!b || V.overlays.top()) return false; if (A.blocked(b)) return; A.start.open({ returnTo: b }); }, { description: 'Start a meeting', group: 'Everywhere' });
    V.shortcuts.register('j', function () { if (!M.sheetOpenId || !$('#mt-mtg-sheet').contains(d.activeElement)) return false; A.mtg.step(1); }, { description: 'Next meeting (sheet open)', group: 'Records and sheets' });
    V.shortcuts.register('k', function () { if (!M.sheetOpenId || !$('#mt-mtg-sheet').contains(d.activeElement)) return false; A.mtg.step(-1); }, { description: 'Previous meeting (sheet open)', group: 'Records and sheets' });
    if (M.loading || A.is('error')) return;
    if (A.q('start') === '1') A.start.open({ mode: A.q('mode') });
    else if (A.q('room')) A.rooms.open(A.q('room'));
    else if (q && !A.q('full')) A.mtg.open(q);
    else if (A.q('generate') === '1') A.deck.open();
  }

  function bootTasks() {
    $('#pa-view').hidden = false; P.render();
    d.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('#ag-more')) { e.preventDefault(); e.stopPropagation(); more(t.closest('#ag-more')); return; }
      if (t.closest('#pa-refresh')) { refresh(); return; }
      var b = t.closest('#pa-new-btn, [data-pa="new"]'); if (b) { if (A.blocked(b)) return; A.newTask.open({ returnTo: b }); return; }
      var p = t.closest('[data-pa]'); if (!p) return; var a = p.getAttribute('data-pa');
      if (a === 'template') { if (A.blocked(p)) return; A.newTask.open({ template: p.getAttribute('data-tpl'), returnTo: p }); }
      else if (a === 'ask-admin') askAdmin();
      else if (a === 'retry-all') w.location.href = 'agents.html?view=personal-agents';
      else if (a === 'dismiss-wallet') { var n = p.closest('.notice'); n.remove(); V.announce('Wallet notice hidden for 24 hours'); var h = $('#page-title'); if (h) h.focus(); }
      else if (a === 'clear') { P.q = ''; $('#pa-search').value = ''; A.url.set({ q: null }); P.renderTable(); $('#pa-search').focus(); }
      else if (a === 'view-done' || a === 'view-waiting') { var tab = $('#pa-tabs-list [data-value="' + (a === 'view-done' ? 'done' : 'waiting') + '"]'); if (tab) { V.tabs.select(tab, true); } }
    });
    d.addEventListener('vaani:tabchange', function (e) { if (e.target.id !== 'pa-tabs-list') return; P.list = e.detail.value; A.url.set({ list: P.list === 'active' ? null : P.list }); P.renderTable(); V.announce(P.visible().length + ' tasks', { dedupeKey: 'patab' }); });
    d.addEventListener('input', function (e) { if (e.target.id !== 'pa-search') return; P.q = e.target.value; clearTimeout(P._t); P._t = setTimeout(function () { A.url.set({ q: P.q.trim() || null }); P.renderTable(); V.announce(P.visible().length + ' tasks', { dedupeKey: 'paq' }); }, 250); });
    d.addEventListener('submit', function (e) { if (e.target.id === 'pa-search-form') e.preventDefault(); });
    d.addEventListener('focusin', function (e) { var r = e.target.closest && e.target.closest('#pa-tbody tr'); if (r && P.sheetId && e.target === r && r.getAttribute('data-id') !== P.sheetId) A.taskSheet.open(r.getAttribute('data-id'), null, { keepFocus: true }); });
    V.shortcuts.register('n', function () { var b = $('#pa-new-btn'); if (!b || V.overlays.top()) return false; if (A.blocked(b)) return; A.newTask.open({ returnTo: b }); }, { description: 'New task', group: 'Everywhere' });
    V.shortcuts.register('j', function () { if (!P.sheetId || !$('#pa-task-sheet').contains(d.activeElement)) return false; A.taskSheet.step(1); }, { description: 'Next task (sheet open)', group: 'Records and sheets' });
    V.shortcuts.register('k', function () { if (!P.sheetId || !$('#pa-task-sheet').contains(d.activeElement)) return false; A.taskSheet.step(-1); }, { description: 'Previous task (sheet open)', group: 'Records and sheets' });
    if (P.loading || A.is('error') || P.forbidden) return;
    if (A.q('new') === '1') A.newTask.open({ template: A.q('template'), from: A.q('from') });
    else if (A.q('task')) A.taskSheet.open(A.q('task'));
  }

  function boot() {
    if (A._booted) return; A._booted = true;
    var main = $('#main');
    if (A.view === 'personal-agents' || A.view === 'agent-settings') { d.body.setAttribute('data-page', 'personal-agents'); if (A.view === 'agent-settings') V.nav.setCurrent('personal-agents'); }
    if (A.view === 'agent-settings') { main.classList.remove('app-main--frame'); d.body.setAttribute('data-back-href', 'agents.html?view=personal-agents'); d.body.setAttribute('data-back-label', 'Personal agents'); $('#ps-view').hidden = false; A.settings.boot(); V.shell.render(); V.setTitle('Agent settings'); }
    else if (A.view === 'personal-agents') { bootTasks(); if (!A.q('task')) V.setTitle(null); }
    else { if (A.q('meeting') && A.q('full')) { d.body.setAttribute('data-back-href', 'agents.html?view=meetings'); d.body.setAttribute('data-back-label', 'Meetings'); } bootMeetings(); if (A.q('meeting') && A.q('full')) V.shell.render(); if (!A.q('room') && !A.q('meeting')) V.setTitle(null); }
    A.renderProto();
    V.on('breakpoint', function () { A.dock(); });
    d.addEventListener('vaani:close', function () { setTimeout(A.dock, 0); });
    V.on('draweropen', function () { setTimeout(A.dock, 0); });
  }
  V.ready(boot);
})(window, document, window.Vaani, window.VaaniAgents);
