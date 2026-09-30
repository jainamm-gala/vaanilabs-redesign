/* Vaani Labs prototype · pages/leads.js — Leads core (03-pages/03): state, URL state, query, header, views, toolbar,
   notices, pager and boot. Other modules: leads-data.js (dataset), leads-table.js (table, list, selection, bulk),
   leads-filters.js (filters, columns, count popover, views), leads-gate.js (Call gate), leads-sheet.js (lead sheet),
   leads-forms.js (New lead, Import, Export), leads-proto.js (prototype states). Namespace: window.VaaniLeads. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt;
  var L = w.VaaniLeads;
  var DATA = V.data;
  var S = L.S = {
    view: 'all', q: '', filters: {}, sort: null, page: 1, size: 50, leadId: null, tab: 'overview',
    sel: { ids: {}, all: false, n: 0 }, colOverride: {}, userViews: [], demo: {}, role: (DATA.user || {}).role || 'Admin',
    live: {}, scheduled: {}, loading: false, busy: false, pageClamped: null, selectMode: false
  };
  L.icon = V.icon;
  L.money = function (v) { return F.money(v); };
  L.count = function (n) { return F.count(n); };
  L.plural = function (n, one, many) { return F.count(n) + ' ' + (n === 1 ? one : (many || one + 's')); };
  L.isAdmin = function () { return S.role === 'Admin'; };
  L.demo = function (k) { return !!S.demo[k]; };
  L.walletState = function () { return V.walletState(); };
  L.wallet = function () { var W = DATA.wallet, st = (W.states || {})[L.walletState()] || W.states.healthy; return { balance: st.balance, runway: st.runway, state: L.walletState() }; };
  /* "Today 10:42 am", "Yesterday", "3 days ago", else "21 Sep" (the year only when it isn’t this year) */
  L.when = function (iso, o) { if (!iso) return ''; var s = F.when(iso, o); return /\d{4}$/.test(s) && s.slice(-4) === '2026' ? F.dateShort(iso) : s; };
  L.timeTag = function (iso, o) { return '<time datetime="' + esc(iso) + '" data-tooltip="' + esc(F.whenAbs(iso)) + '">' + esc(L.when(iso, o)) + '</time>'; };

  /* ---------- views (§6.4) ---------- */
  L.VIEWS = [
    { id: 'all', label: 'All', test: function () { return true; }, sort: ['last_call', 'desc'] },
    { id: 'new', label: 'New', test: function (l) { return l.status === 'new'; }, sort: ['created', 'desc'], preset: ['created'], done: 'No new leads. Leads you add or import start here.' },
    { id: 'callbacks', label: 'Callbacks due', test: L.callbackDueToday, sort: ['callback', 'asc'], preset: ['callback'], hide: ['last_call'], cap: 'B5', done: 'No callbacks due today.' },
    { id: 'interested', label: 'Interested', test: function (l) { return l.status === 'interested'; }, sort: ['interest', 'desc'], done: 'No interested leads yet. Leads your flows mark Interested appear here.' },
    { id: 'not-reached', label: 'Not reached', test: L.notReached, sort: ['last_call', 'asc'], cap: 'B4', done: 'Everyone in your pipeline has been reached.' }
  ];
  L.capOff = function (cap) { return L.demo('gaps') && (cap === 'B3' || cap === 'B4' || cap === 'B5'); };
  L.views = function () { return L.VIEWS.filter(function (v) { return !L.capOff(v.cap); }).concat(S.userViews); };
  L.viewDef = function (id) { return L.views().filter(function (v) { return v.id === id; })[0] || L.VIEWS[0]; };
  L.viewTest = function (v) { if (v.test) return v.test; var base = L.viewDef(v.base || 'all'); return base.test || function () { return true; }; };
  L.defaultSort = function () { var v = L.viewDef(S.view); return v.sort || ['last_call', 'desc']; };
  L.curSort = function () { return S.sort || L.defaultSort(); };

  /* ---------- sorting (§6.6: blanks last in both directions) ---------- */
  var SORTKEY = {
    name: function (l) { return l.name.toLowerCase(); }, status: function (l) { return L.STATUS_ORDER.indexOf(l.status); },
    last_call: function (l) { return l.lastCall ? Date.parse(l.lastCall.at) : null; }, interest: function (l) { return l.interest; },
    created: function (l) { return Date.parse(l.createdAt); }, callback: function (l) { return l.callbackAt ? Date.parse(l.callbackAt) : null; },
    flow: function (l) { return l.flowId ? L.flowLabel(l.flowId).toLowerCase() : null; }, owner: function (l) { return l.owner ? l.owner.toLowerCase() : null; },
    city: function (l) { return (l.city || '').toLowerCase() || null; }, calls: function (l) { return l.calls; }
  };
  L.sortRows = function (rows, s) {
    var key = SORTKEY[s[0]] || SORTKEY.last_call, dir = s[1] === 'asc' ? 1 : -1;
    return rows.map(function (l, i) { return [key(l), i, l]; }).sort(function (a, b) {
      if (a[0] == null && b[0] == null) return a[1] - b[1]; if (a[0] == null) return 1; if (b[0] == null) return -1;
      return a[0] < b[0] ? -dir : a[0] > b[0] ? dir : a[1] - b[1];
    }).map(function (x) { return x[2]; });
  };

  /* ---------- search and filter predicates (server-side in the product, F-QA-005) ---------- */
  L.matchQ = function (l, q) {
    q = q.trim().toLowerCase(); if (!q) return true;
    var digits = q.replace(/[\s-]/g, '');
    if (/^\d{4,}$/.test(digits)) return digits.slice(-4) === l.phone.last4 || (l.no + '').indexOf(digits) === 0;
    return (l.name + ' ' + (l.email || '') + ' ' + (l.city || '')).toLowerCase().indexOf(q) >= 0 || ('lead ' + l.no).indexOf(q) === 0;
  };
  function inRange(iso, key) {
    if (!iso) return key === 'never';
    if (/^range:/.test(key)) { var p = key.split(':'), day = new Date(Date.parse(iso) + 330 * 60000).toISOString().slice(0, 10); return day >= p[1] && day <= p[2]; }
    var m = L.minutesAgo(iso), dToday = L.minutesAgo(D0()); /* minutes since today 00:00 */
    if (key === 'today') return m >= 0 && m <= dToday; if (key === 'yesterday') return m > dToday && m <= dToday + 1440;
    if (key === '7d') return m >= 0 && m <= 7 * 1440; if (key === '30d') return m >= 0 && m <= 30 * 1440; if (key === 'month') return iso.slice(0, 7) === DATA.meta.today.slice(0, 7) && m >= 0;
    return false;
  }
  function D0() { return DATA._util.ist(0, '00:00'); }
  L.inRange = inRange;
  L.matchF = function (l, f) {
    for (var k in f) { if (!f.hasOwnProperty(k)) continue; var v = f[k], ok = true;
      switch (k) {
        case 'status': ok = v.values.indexOf(l.status) >= 0; break;
        case 'source': ok = v.values.indexOf(l.source) >= 0; break;
        case 'language': ok = v.values.indexOf(l.language || 'none') >= 0; break;
        case 'flow': ok = v.values.indexOf(l.flowId || 'default') >= 0; break;
        case 'owner': ok = v.values.indexOf(l.owner || 'none') >= 0; break;
        case 'imported': ok = v.values.indexOf(l.importFile || '') >= 0; break;
        case 'outcome': ok = !!l.lastCall && (v.values.indexOf('r:' + l.lastCall.result) >= 0 || v.values.indexOf('o:' + l.lastCall.outcome) >= 0); break;
        case 'last_called': ok = inRange(l.lastCall && l.lastCall.at, v.value); break;
        case 'created': ok = inRange(l.createdAt, v.value); break;
        case 'callback': ok = !!l.callbackAt && (v.value === 'overdue' ? L.callbackOverdue(l) : v.value === 'today' ? l.callbackAt.slice(0, 10) === DATA.meta.today : L.minutesAgo(l.callbackAt) <= 0 && L.minutesAgo(l.callbackAt) >= -7 * 1440); break;
        case 'interest': ok = l.interest == null ? !!v.ns : l.interest >= (v.min == null ? 0 : v.min) && l.interest <= (v.max == null ? 100 : v.max); break;
        case 'city': ok = (l.city || '').toLowerCase().indexOf(v.text.toLowerCase()) >= 0; break;
      }
      if (v.not) ok = !ok; if (!ok) return false; }
    return true;
  };
  L.hasNarrowing = function () { return !!S.q.trim() || Object.keys(S.filters).length > 0; };

  /* ---------- the query: view → search → filters → sort → page (one list, like GET /api/leads) ---------- */
  L.query = function () {
    var v = L.viewDef(S.view), test = L.viewTest(v), inView = L.all.filter(function (l) { return !l.deleted && test(l); });
    var rows = inView.filter(function (l) { return L.matchQ(l, S.q) && L.matchF(l, S.filters); });
    rows = L.sortRows(rows, L.curSort());
    var pages = Math.max(1, Math.ceil(rows.length / S.size));
    S.pageClamped = null; if (S.page > pages) { S.pageClamped = S.page; S.page = pages; }
    var start = (S.page - 1) * S.size;
    return { view: v, inView: inView, rows: rows, total: rows.length, pages: pages, start: start, pageRows: rows.slice(start, start + S.size), all: L.all.filter(function (l) { return !l.deleted; }).length };
  };
  L.viewCount = function (v) { var t = L.viewTest(v); return L.all.filter(function (l) { return !l.deleted && t(l) && (v.test || (L.matchQ(l, v.q || '') && L.matchF(l, v.filters || {}))); }).length; };

  /* ---------- URL state (§3.1): view, q, f.*, sort, page, size, lead, tab; push for discrete changes ---------- */
  L.FIELD_KIND = { status: 'enum', source: 'enum', language: 'enum', outcome: 'enum', last_called: 'date', callback: 'date', interest: 'number', flow: 'enum', owner: 'enum', city: 'text', created: 'date', imported: 'enum' };
  L.toUrl = function () {
    var p = new URLSearchParams(), keep = new URLSearchParams(w.location.search);
    ['wallet', 'setup', 'demo'].forEach(function (k) { if (keep.get(k)) p.set(k, keep.get(k)); });
    if (S.view !== 'all') p.set('view', S.view);
    if (S.q) p.set('q', S.q);
    Object.keys(S.filters).forEach(function (k) { var v = S.filters[k], key = 'f.' + k + (v.not ? '!' : ''), kind = L.FIELD_KIND[k];
      p.set(key, kind === 'enum' ? v.values.join(',') : kind === 'date' ? v.value : kind === 'number' ? (v.min == null ? '' : v.min) + '-' + (v.max == null ? '' : v.max) + (v.ns ? ',ns' : '') : v.text); });
    if (S.sort) p.set('sort', S.sort[0] + ':' + S.sort[1]);
    if (S.page > 1) p.set('page', S.page); if (S.size !== 50) p.set('size', S.size);
    if (S.leadId) { p.set('lead', S.leadId); if (S.tab !== 'overview') p.set('tab', S.tab); }
    var qs = p.toString(); return w.location.pathname + (qs ? '?' + qs.replace(/%2C/g, ',') : '');
  };
  L.pushUrl = function (replace) { try { var u = L.toUrl(); if (u === w.location.pathname + w.location.search) return; w.history[replace ? 'replaceState' : 'pushState']({ leads: 1 }, '', u); } catch (e) { /* file:// may refuse; state stays in memory */ } };
  L.fromUrl = function () {
    var p = new URLSearchParams(w.location.search);
    S.view = p.get('view') || 'all'; if (!L.views().some(function (v) { return v.id === S.view; })) S.view = 'all';
    S.q = p.get('q') || ''; S.filters = {};
    p.forEach(function (val, key) { var m = /^f\.([a-z_]+)(!?)$/.exec(key); if (!m || !L.FIELD_KIND[m[1]]) return; var k = m[1], kind = L.FIELD_KIND[k], v = { not: m[2] === '!' };
      if (kind === 'enum') v.values = val.split(',').filter(Boolean); else if (kind === 'date') v.value = val; else if (kind === 'text') v.text = val;
      else { var parts = val.split(','), mm = parts[0].split('-'); v.min = mm[0] === '' ? null : +mm[0]; v.max = mm[1] === '' || mm[1] == null ? null : +mm[1]; v.ns = parts[1] === 'ns'; }
      S.filters[k] = v; });
    var s = (p.get('sort') || '').split(':'); S.sort = s[0] && SORTKEY[s[0]] ? [s[0], s[1] === 'asc' ? 'asc' : 'desc'] : null;
    S.page = Math.max(1, parseInt(p.get('page'), 10) || 1); S.size = [25, 50, 100].indexOf(+p.get('size')) >= 0 ? +p.get('size') : 50;
    S.leadId = p.get('lead') && L.byId[p.get('lead')] ? p.get('lead') : null; S.tab = ['calls', 'notes'].indexOf(p.get('tab')) >= 0 ? p.get('tab') : 'overview';
  };

  /* ---------- changing the query (selection clears when view, search or filters change, §6.7) ---------- */
  function selectionCleared() { if (S.sel.n || S.sel.all) { L.clearSelection(true); V.announce('Selection cleared', { dedupeKey: 'sel' }); } }
  L.setView = function (id) { if (id === S.view) return; S.view = id; S.page = 1; var uv = L.viewDef(id); if (uv.user) { S.q = uv.q || ''; S.filters = JSON.parse(JSON.stringify(uv.filters || {})); S.sort = uv.sortSaved || null; } else S.sort = null; selectionCleared(); L.pushUrl(); L.render({ announce: true }); };
  L.setQuery = function (q, settle) { S.q = q; S.page = 1; selectionCleared(); L.pushUrl(!settle); L.render({ announce: true, keepSearch: true }); };
  L.setFilter = function (k, v) { if (JSON.stringify(S.filters[k] || null) === JSON.stringify(v == null ? null : v)) return;   /* nothing changed: no re-render, no count announcement */
    if (v == null) delete S.filters[k]; else S.filters[k] = v; S.page = 1; selectionCleared(); L.pushUrl(); L.render({ announce: true }); };
  L.clearFilters = function () { S.q = ''; S.filters = {}; S.page = 1; var inp = $('#leads-q'); if (inp) inp.value = ''; selectionCleared(); L.pushUrl(); L.render({ announce: true }); };
  L.setSort = function (s) { S.sort = s; S.page = 1; L.pushUrl(); L.render(); };
  L.setPage = function (n) { S.page = n; L.pushUrl(); L.render({ pageChange: true }); };

  /* ---------- global blockers for every call entry point (G §4.4) ---------- */
  L.globalBlocker = function () {
    if (S.offline || L.demo('offline')) return { reason: "You’re offline", fix: null };
    if (L.walletState() === 'empty') return { reason: 'Wallet is ₹0. Top up to place calls.', fix: { label: 'Top up', run: function () { V.openTopUp('leads'); } } };
    if (L.demo('setup-blocked')) return { reason: 'No verified caller ID. Verify one in Settings › Phone setup.', fix: { label: 'Verify a number', run: function () { w.location.href = 'settings.html#phone/caller-id'; } } };
    if (L.demo('no-flow')) return { reason: 'No live flow. Publish a flow to call leads.', fix: { label: 'Open Flows', run: function () { w.location.href = 'flow-designer.html'; } } };
    return null;
  };
  L.leadBlocker = function (l) {
    var g = L.globalBlocker(); if (g) return g;
    /* R3D-08 (gate §4.4 rule 5): Do not call is a selection-dependent check, so the gate opens Blocked with its row */
    var st = S.live[l.id] || l.liveState;
    if (st && st !== 'ended') { var lc = (V.data.live || []).filter(function (c) { return c.leadId === l.id; })[0], href = lc ? 'cockpit.html?call=' + lc.id : 'cockpit.html';
      return { reason: 'On a call now.', href: href, fix: { label: 'Open in Cockpit', run: function () { w.location.href = href; } } }; }
    return null;
  };
  L.blockedActivation = function (b) {
    V.announce(b.reason, { dedupeKey: 'blocked' });
    V.toast.info(b.reason, b.fix ? { action: { label: b.fix.label, onClick: b.fix.run } } : {});
  };

  /* ---------- header meta, views, toolbar pieces ---------- */
  function renderMeta(q) {
    var el = $('#leads-meta'), ph = $('#leads-meta-phone'), st = L.statsOf(q.rows);
    if (L.demo('loading')) { el.innerHTML = '<span class="leads-sk-meta sk sk--meta" aria-hidden="true"></span><span class="sr-only">Loading counts</span>'; ph.innerHTML = el.innerHTML; return; }
    if (L.demo('counts-failed')) { el.innerHTML = "Couldn’t load counts · <button type=\"button\" class=\"btn btn--link\" data-leads-retry>Retry</button>"; ph.innerHTML = el.innerHTML; return; }
    if (L.demo('first-use') || !q.all) { el.textContent = 'No leads yet'; ph.textContent = 'No leads yet'; return; }
    var stale = L.demo('error-refresh') || L.demo('offline');
    el.innerHTML = esc(L.plural(q.all, 'lead')) + ' · ' + (stale ? 'updated ' : 'synced ') + esc(F.time(DATA.meta.now));
    var narrowed = S.view !== 'all' || L.hasNarrowing();
    ph.innerHTML = S.selectMode ? esc((S.sel.all ? q.total : S.sel.n) + ' selected') : (narrowed ? '<b class="u-fg-2 u-medium">' + F.count(q.total) + '</b> of ' + F.count(q.all) : F.count(q.all) + ' leads') + ' · ' + F.count(st.interested) + ' interested';
  }
  function renderTabs(q) {
    var list = $('#leads-tabs'), counts = !L.demo('loading') && !L.demo('counts-failed');
    list.innerHTML = L.views().map(function (v) {
      var on = v.id === S.view, edited = on && v.user && L.viewEdited(v);
      return '<button class="vtab" type="button" role="tab" id="leads-tab-' + esc(v.id) + '" data-view="' + esc(v.id) + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" aria-controls="leads-table">' + esc(v.label) + (edited ? '<span class="u-fg-3"> · edited</span>' : '') + (counts ? ' <span class="vtab-count">' + F.count(L.viewCount(v)) + '</span>' : '') + '</button>';
    }).join('');
    var uv = L.viewDef(S.view), more = $('#leads-view-more'); more.hidden = !uv.user; if (uv.user) more.setAttribute('aria-label', 'More actions for the view ' + uv.label);
    var vs = $('#leads-viewsel-v'); if (vs) vs.textContent = 'View: ' + L.viewDef(S.view).label;
    var lb = $('#leads-viewsel-lb'); if (lb) lb.innerHTML = L.views().map(function (v) { return '<div class="option" role="option" data-value="' + esc(v.id) + '" aria-selected="' + (v.id === S.view) + '"><span class="option-main"><span class="option-label">' + esc(v.label) + '</span></span>' + (counts ? '<span class="count-badge">' + F.count(L.viewCount(v)) + '</span>' : '') + '<span class="option-check">' + V.icon('check') + '</span></div>'; }).join('');
  }
  function renderCount(q, o) {
    var b = $('#leads-count'), narrowed = S.view !== 'all' || L.hasNarrowing();
    if (L.demo('loading')) { b.innerHTML = 'Loading…'; return; }
    if (S.busy || L.demo('refreshing')) { b.innerHTML = 'Updating…'; return; }
    b.innerHTML = (narrowed ? '<b>' + F.count(q.total) + '</b> of ' + F.count(q.all) : '<b>' + F.count(q.all) + '</b> leads') + V.icon('chevron-down', 'sm');
    b.setAttribute('aria-label', (narrowed ? F.count(q.total) + ' of ' + F.count(q.all) + ' leads in this view' : F.count(q.all) + ' leads') + '. Show totals');
    /* the result count is announced only when the view, search or filters narrow it (§6.5): never "1,284 of 1,284 leads" */
    if (o && o.announce && q.total !== q.all) V.announce(F.count(q.total) + ' of ' + F.count(q.all) + ' leads', { dedupeKey: 'count' });
  }
  function renderPager(q, o) {
    var p = $('#leads-pager');
    var range = L.demo('loading') ? 'Loading…' : (S.busy || L.demo('refreshing')) ? 'Updating…' : q.total ? F.count(q.start + 1) + '–' + F.count(Math.min(q.total, q.start + S.size)) + ' of ' + L.plural(q.total, 'lead') : '0 leads';
    $('#leads-range').textContent = range;
    $('#leads-pageof').textContent = L.demo('loading') ? '' : 'Page ' + F.count(S.page) + ' of ' + F.count(q.pages);
    $('#leads-size-v').textContent = S.size;
    $$('#leads-size-lb .option').forEach(function (op) { op.setAttribute('aria-selected', +op.getAttribute('data-value') === S.size ? 'true' : 'false'); });
    var prev = $('#leads-prev'), next = $('#leads-next');
    prev.setAttribute('aria-disabled', S.page <= 1 ? 'true' : 'false'); next.setAttribute('aria-disabled', S.page >= q.pages ? 'true' : 'false');
    p.hidden = false;
    if (o && o.pageChange) V.announce('Showing ' + F.count(q.start + 1) + ' to ' + F.count(Math.min(q.total, q.start + S.size)) + ' of ' + F.count(q.total), { dedupeKey: 'page' });
  }

  /* ---------- notices: one page Notice (§6.1) and one section Notice above the table (§7.1, §7.2) ---------- */
  var WN = {
    low: ['warning', 'Wallet is low.', 'About 17 min of calls left (₹42.10). Calls pause at ₹0.', 'Top up'],
    empty: ['warning', 'Wallet is ₹0.', 'Phone calls are paused. Browser tests and free meeting minutes still work.', 'Top up'],
    'autopay-failed': ['danger', "Autopay couldn’t top up.", 'Your UPI mandate was declined. Calls pause at ₹0.', 'Fix autopay'],
    pending: ['info', 'Payment pending.', 'Your wallet updates when UPI confirms.', null]
  };
  function notice(tone, title, body, acts, o) {
    o = o || {};
    return '<div class="notice notice--' + tone + ' notice--multi"' + (o.role ? ' role="' + o.role + '"' : '') + '>' + V.icon(tone === 'danger' ? 'circle-alert' : tone === 'warning' ? 'triangle-alert' : tone === 'success' ? 'circle-check' : 'info') +
      '<span class="notice-body">' + (title ? '<span class="notice-title">' + esc(title) + '</span> ' : '') + body + '</span>' + (acts ? '<span class="notice-acts">' + acts + '</span>' : '') +
      (o.dismiss ? '<button type="button" class="ibtn ibtn--sm" data-leads-dismiss="' + esc(o.dismiss) + '" aria-label="Dismiss for 24 hours">' + V.icon('x') + '</button>' : '') + '</div>';
  }
  L.noticeHtml = notice;
  function renderNotices(q) {
    var page = $('#leads-page-notice'), sec = $('#leads-sec-notice'), html = '';
    if (L.demo('setup-blocked')) html = notice('warning', "Calls can’t be placed yet.", 'Verify your calling number to call leads.', '<a class="notice-act" href="index.html">Finish setup (3 of 5)</a>');
    else if (L.demo('no-flow')) html = notice('warning', "Calls can’t be placed yet.", 'Publish a flow to call leads.', '<a class="notice-act" href="flow-designer.html">Open Flows</a>');
    else { var ws = L.walletState(), wn = WN[ws]; if (wn && !V.bp.desktopShell() && !dismissed('wn:' + ws)) html = notice(wn[0], wn[1], esc(wn[2]), wn[3] ? '<a class="notice-act" href="billing.html?topup=1" data-vaani-action="topup">' + esc(wn[3]) + '</a>' : '', { dismiss: 'wn:' + ws }); }
    page.innerHTML = html; page.hidden = !html;
    var s = '';
    if (L.demo('forbidden') || L.demo('first-use') || L.demo('error')) s = '';
    else if (S.pageClamped) s = notice('info', null, 'Page ' + F.count(S.pageClamped) + " doesn’t exist. Showing page " + F.count(S.page) + '.', '', { role: 'status' });
    else if (L.demo('offline')) s = notice('warning', 'Showing leads from ' + F.time(DATA.meta.now) + '.', "You’re offline. Calls, edits and imports wait until you reconnect.", '', { role: 'status' });
    else if (L.demo('error-refresh')) s = notice('warning', 'Showing leads from ' + F.time(DATA.meta.now) + '.', "Couldn’t refresh.", '<button type="button" class="notice-act" data-leads-retry>Retry</button>', { role: 'status' });
    else if (L.demo('calls-failed')) s = notice('warning', "Last call details couldn’t load.", 'Statuses and names are current.', '<button type="button" class="notice-act" data-leads-retry>Retry</button>', { role: 'status' });
    sec.innerHTML = s; sec.hidden = !s;
  }
  function dismissed(k) { var t = +(U.store.get('vaani:leads:' + k) || 0); return t && Date.now() - t < 864e5; }

  /* ---------- whole-page states (§7.1) ---------- */
  function renderPageState(q) {
    var slot = $('#leads-state'), html = '', mode = 'data';
    if (L.demo('forbidden')) { mode = 'blank'; html = '<div class="empty empty--page">' + V.icon('lock', 'lg') + '<h2 class="empty-title">You can’t see leads</h2><p>Only admins and sales members can see leads. Ask an admin (2 in this workspace) to change your role.</p><div class="empty-actions"><button class="btn" type="button" data-leads-copyreq>' + V.icon('copy') + 'Copy request link</button></div></div>'; }
    else if (L.demo('first-use') || !q.all) { mode = 'blank'; html = '<div class="empty empty--page">' + V.icon('users', 'lg') + '<h2 class="empty-title">No leads yet</h2><p>Leads you add or import appear here with their status and last call.</p><div class="empty-actions"><button class="btn btn--primary" type="button" data-leads-import>' + V.icon('upload') + 'Import leads…</button><button class="btn" type="button" data-leads-new>' + V.icon('plus') + 'New lead</button></div><p class="u-mt-8"><button type="button" class="btn btn--link" data-leads-template>Download the CSV template</button></p></div>'; }
    else if (L.demo('error')) { mode = 'error'; html = '<div class="leads-state-pad">' + notice('danger', "Couldn’t load leads.", 'Check your connection and try again.', '<button type="button" class="notice-act" data-leads-retry>Retry</button>', { role: 'alert' }) + '</div>'; }
    slot.innerHTML = html; slot.hidden = !html;
    var main = $('#main'); main.setAttribute('data-leads-mode', mode);
    ['#leads-vtabs', '#leads-tb'].forEach(function (s) { $(s).hidden = mode === 'blank'; });
    ['#leads-dtwrap', '#leads-list', '#leads-pager'].forEach(function (s) { $(s).hidden = mode !== 'data'; });
    $('#leads-export-btn').hidden = mode === 'blank' || L.demo('forbidden');
    $('#leads-new-btn').hidden = L.demo('forbidden'); $('#leads-import-btn').hidden = L.demo('forbidden');
    $('#leads-select-btn').hidden = mode !== 'data';
    return mode;
  }

  /* ---------- render everything ---------- */
  L.render = function (o) {
    o = o || {};
    var q = L.last = L.query();
    renderNotices(q);
    var mode = renderPageState(q);
    renderMeta(q); renderTabs(q);
    if (mode !== 'blank') { renderCount(q, o); if (L.renderFilters) L.renderFilters(q); }
    if (mode === 'data') { if (L.renderRows) L.renderRows(q, o); renderPager(q, o); }
    if (L.renderBulk) L.renderBulk();
    if (L.sheetNotice) L.sheetNotice();   /* the open lead dropped out of the results (overlay §4.3) */
    var inp = $('#leads-q'); if (inp && !o.keepSearch && inp.value !== S.q) inp.value = S.q;
    var clr = $('#leads-q-clear'); if (clr) clr.hidden = !S.q;
    syncOffline();
    if (o.pageChange) { var wrap = $('#leads-dtwrap'); if (wrap) wrap.scrollTop = 0; }
  };

  /* Offline: network actions stay focusable, aria-disabled, with the reason (§7.1) */
  L.offline = function () { return !!(S.offline || L.demo('offline')); };
  function syncOffline() {
    ['#leads-new-btn', '#leads-import-btn', '#leads-export-btn'].forEach(function (id) { var b = $(id); if (!b) return;
      if (L.offline()) { b.setAttribute('aria-disabled', 'true'); b.setAttribute('data-tooltip', "You’re offline"); b.removeAttribute('data-kbd'); }
      else { b.removeAttribute('aria-disabled'); b.setAttribute('data-tooltip', id === '#leads-new-btn' ? 'New lead' : id === '#leads-import-btn' ? 'Import leads from a CSV or XLSX file' : 'Export leads'); if (id === '#leads-new-btn') b.setAttribute('data-kbd', 'n'); } });
  }
  function guarded(fn) { return function (e) { if (L.offline()) { L.blockedActivation({ reason: "You’re offline. This needs a connection." }); return; } fn(e); }; }

  /* ---------- wiring for the header, views, search, pager ---------- */
  function wire() {
    var q = $('#leads-q'), t = null;
    q.addEventListener('input', function () { $('#leads-q-clear').hidden = !q.value; clearTimeout(t); S.busy = true; renderCount(L.last); t = setTimeout(function () { S.busy = false; L.setQuery(q.value, true); }, 300); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (q.value) { e.preventDefault(); e.stopPropagation(); q.value = ''; L.setQuery('', true); } else { e.preventDefault(); e.stopPropagation(); q.blur(); var r = $('#leads-table tbody tr[tabindex="0"]'); if (r && U.visible(r)) r.focus(); } } else if (e.key === 'Enter') { e.preventDefault(); clearTimeout(t); S.busy = false; L.setQuery(q.value, true); } });
    $('#leads-q-form').addEventListener('submit', function (e) { e.preventDefault(); });
    $('#leads-q-clear').addEventListener('click', function () { q.value = ''; L.setQuery('', true); q.focus(); });
    $('#leads-tabs').addEventListener('vaani:tabchange', function (e) { L.setView(e.detail.tab.getAttribute('data-view')); var t2 = $('#leads-tab-' + S.view); if (t2) t2.focus(); });
    $('#leads-viewsel').addEventListener('vaani:change', function (e) { L.setView(e.detail.value); });
    $('#leads-size').addEventListener('vaani:change', function (e) { S.size = +e.detail.value; S.page = 1; U.store.set('vaani:leads:size', S.size); L.pushUrl(); L.render({ pageChange: true }); });
    $('#leads-prev').addEventListener('click', function () { if (S.page > 1) L.setPage(S.page - 1); });
    $('#leads-next').addEventListener('click', function () { if (S.page < L.last.pages) L.setPage(S.page + 1); });
    d.addEventListener('click', function (e) {
      var x = e.target.closest('[data-leads-retry],[data-leads-dismiss],[data-leads-new],[data-leads-import],[data-leads-template],[data-leads-copyreq],[data-leads-clear]'); if (!x) return;
      if (x.hasAttribute('data-leads-retry')) { ['error', 'error-refresh', 'calls-failed', 'counts-failed'].forEach(function (k) { delete S.demo[k]; }); if (L.syncDemoUrl) L.syncDemoUrl(); L.render(); V.toast.success('Leads refreshed'); }
      else if (x.hasAttribute('data-leads-dismiss')) { U.store.set('vaani:leads:' + x.getAttribute('data-leads-dismiss'), String(Date.now())); L.render(); $('#page-title').focus(); }
      else if (x.hasAttribute('data-leads-new')) L.openNewLead && L.openNewLead(x);
      else if (x.hasAttribute('data-leads-import')) L.openImport && L.openImport(x);
      else if (x.hasAttribute('data-leads-template')) L.downloadTemplate && L.downloadTemplate();
      else if (x.hasAttribute('data-leads-copyreq')) V.toast.success('Request link copied');
      else if (x.hasAttribute('data-leads-clear')) { L.clearFilters(); $('#leads-q').focus(); }
    });
    $('#leads-new-btn').addEventListener('click', guarded(function (e) { L.openNewLead(e.currentTarget); }));
    $('#leads-import-btn').addEventListener('click', guarded(function (e) { L.openImport(e.currentTarget); }));
    $('#leads-export-btn').addEventListener('click', guarded(function (e) { L.openExport(e.currentTarget); }));
    $('#page-more-menu').addEventListener('vaani:menuselect', function (e) { var v = e.detail.value, trig = $('#leads-more-btn');
      if ((v === 'export' || v === 'import') && L.offline()) { L.blockedActivation({ reason: "You’re offline. This needs a connection." }); return; }
      if (v === 'export') L.openExport(trig); else if (v === 'import') L.openImport(trig); else if (v === 'shortcuts') V.shortcuts.openSheet(trig); else if (v === 'proto') L.openProto && L.openProto(trig); });
    w.addEventListener('popstate', function () { var had = S.leadId; L.fromUrl(); L.render(); if (L.syncSheetFromUrl) L.syncSheetFromUrl(had); });
    var rt = null; V.on('breakpoint', function () { clearTimeout(rt); rt = setTimeout(function () { L.render(); }, 50); });
    w.addEventListener('offline', function () { S.offline = true; L.render(); });
    w.addEventListener('online', function () { S.offline = false; L.render(); });
  }

  /* ---------- shortcuts (§8.1): N, Shift+D; C, Ctrl/⌘+A and J/K live in leads-table.js ---------- */
  function shortcuts() {
    V.shortcuts.register('n', function () { if ($('#leads-new-btn').hidden) return false; if (L.offline()) { L.blockedActivation({ reason: "You’re offline. This needs a connection." }); return; } L.openNewLead($('#leads-new-btn')); }, { description: 'New lead', group: 'Lists and tables' });
    V.shortcuts.register('shift+d', function () { var seg = $('#leads-density'), cur = V.density.get('leads'), nx = cur === 'compact' ? 'standard' : 'compact'; var b = $('[data-value="' + nx + '"]', seg); if (b) V.seg.select(b, false); V.announce(nx === 'compact' ? 'Compact rows' : 'Standard rows'); }, { description: 'Standard or compact rows', group: 'Lists and tables', singleKey: false, label: ['Shift', 'D'] });
    V.commandPalette.register([
      { group: 'actions', title: 'Export leads…', icon: 'download', keywords: ['csv', 'xlsx', 'download'], perform: function () { L.openExport($('#leads-export-btn')); } },
      { group: 'actions', title: 'Prototype states…', icon: 'sliders-horizontal', keywords: ['demo', 'state', 'empty', 'error', 'loading'], perform: function () { L.openProto && L.openProto($('#leads-proto-btn')); } }
    ]);
  }

  /* ---------- boot ---------- */
  L.boot = function () {
    try { S.userViews = JSON.parse(U.store.get('vaani:leads:views') || '[]'); } catch (e) { S.userViews = []; }
    S.userViews.forEach(function (v) { v.user = true; });
    var sz = +(U.store.get('vaani:leads:size') || 0); if ([25, 50, 100].indexOf(sz) >= 0) S.size = sz;
    try { S.colOverride = JSON.parse(U.store.get('vaani:leads:cols') || '{}'); } catch (e) { S.colOverride = {}; }
    if (L.readDemo) L.readDemo();
    if (L.demo('member')) S.role = 'Member';
    L.fromUrl();
    if (!new URLSearchParams(w.location.search).get('size') && sz) S.size = sz;
    if (L.demo('page-out')) S.page = 30;
    wire(); shortcuts();
    if (L.initTable) L.initTable(); if (L.initFilters) L.initFilters(); if (L.initGate) L.initGate(); if (L.initSheet) L.initSheet(); if (L.initForms) L.initForms(); if (L.initProto) L.initProto();
    L.render();
    if (L.demo('page-out')) L.pushUrl(true);
    if (L.demo('offline')) setTimeout(function () { w.dispatchEvent(new Event('offline')); }, 0);
    V.setTitle && V.setTitle(null);
    var p = new URLSearchParams(w.location.search);
    if (S.leadId && L.openLead) L.openLead(S.leadId, { fromUrl: true, gate: p.get('gate') === 'call' });
    else if (p.get('new') === '1') L.openNewLead($('#leads-new-btn'));
    else if (p.get('import') === '1') L.openImport($('#leads-import-btn'));
  };
  d.addEventListener('DOMContentLoaded', function () { V.ready(L.boot); });
})(window, document);
