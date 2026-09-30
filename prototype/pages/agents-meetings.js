/* Vaani Labs prototype · pages/agents-meetings.js — Meetings list (03-pages/07 §1.3–1.6, §1.12): PageHeader, Live now
   with RoomCards, Past meetings (toolbar, framed table ≥768, ListRows on phones, pager), the aside (AgentProfileCard,
   This month) and every page state. Sheets, gates and confirmations live in agents-rooms.js and agents-start.js. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt;
  var M = A.mt = {};
  var DATA = A.data;

  /* ---------- state (copies; demo flags adjust them) ---------- */
  M.rooms = JSON.parse(JSON.stringify(DATA.rooms));
  M.past = JSON.parse(JSON.stringify(DATA.past));
  M.seats = { used: DATA.seats.used, total: DATA.seats.total };
  M.free = { used: DATA.free.used, of: DATA.free.of };
  M.f = { q: A.q('q') || '', when: '30d', agent: [], notes: [] };
  M.sortDir = 'descending';
  if (A.is('first-use')) { M.rooms = []; M.past = []; M.seats.used = 0; M.free.used = 0; }
  if (A.is('none-open')) { M.rooms = []; M.seats.used = 0; }
  if (A.is('seats-full')) M.seats.used = 3;
  if (A.is('minutes-used')) M.free.used = 30;
  if (A.is('stale')) { var r2 = M.rooms[1]; r2.status = 'stale'; r2.createdAt = F.now().toISOString(); r2.lastSeen = new Date(A.now() - 45 * 60000).toISOString(); r2.closesAt = new Date(A.now() + 15 * 60000).toISOString(); }
  if (A.is('agent-failed')) { M.rooms[0].agent = { state: 'failed' }; M.seats.used = 0; }
  if (A.wallet.empty && M.rooms[0]) { M.rooms[0].agent = { state: 'left-wallet', at: new Date(A.now() - 4 * 60000).toISOString() }; M.seats.used = 0; }
  M.canStart = A.role === 'admin';
  M.loading = A.is('loading');

  function mins(fromIso) { return Math.max(0, Math.round((A.now() - new Date(fromIso).getTime()) / 60000)); }
  function openFor(r) { var h = (A.now() - new Date(r.createdAt).getTime()) / 3600000; return h >= 48 ? Math.floor(h / 24) + ' days' : Math.floor(h) + ' h'; }
  M.findRoom = function (id) { return M.rooms.filter(function (r) { return r.id === id; })[0]; };
  M.findPast = function (id) { return M.past.filter(function (m) { return m.id === id; })[0]; };
  M.needsAttention = function () { return M.rooms.filter(function (r) { return r.status === 'long_open' || r.status === 'stale'; }).length; };
  M.liveCount = function () { return M.rooms.filter(function (r) { return r.status === 'live'; }).length; };
  M.peopleText = function (r) { var n = r.people.length; return A.is('partial') ? 'People unknown' : n + (n === 1 ? ' person' : ' people'); };

  /* ---------- header ---------- */
  M.renderHeader = function () {
    var meta;
    if (M.loading) meta = '<span class="ag-sk-meta">' + A.sk('sk--meta') + '</span><span class="sr-only">Loading meetings…</span>';
    else if (A.is('error')) meta = '';
    else if (!M.rooms.length && !M.past.length) meta = 'No meetings yet';
    else { var na = M.needsAttention(); meta = A.mline([F.count(M.liveCount()) + ' live', F.count(M.past.length) + ' past', na ? F.count(na) + ' needs attention' : '']); }
    var startDis = !M.canStart ? 'Only admins can start meetings. Ask an admin.' : A.offline ? A.offlineReason : '';
    A.header({ title: 'Meetings', meta: meta, actions:
      '<button class="btn btn--tertiary ph-fold ag-how-label" type="button" data-popover="mt-how" aria-haspopup="dialog" aria-expanded="false" data-placement="bottom-end">' + icon('info') + 'How meetings work</button>' +
      '<button class="ibtn ph-fold ag-how-icon" type="button" data-popover="mt-how" aria-haspopup="dialog" aria-expanded="false" data-placement="bottom-end" aria-label="How meetings work">' + icon('info') + '</button>' +
      '<button class="ibtn" type="button" id="ag-more" aria-label="More actions" aria-haspopup="menu" aria-controls="ag-more-menu" aria-expanded="false">' + icon('ellipsis') + '</button>' +
      '<button class="btn btn--primary" type="button" id="mt-start-btn" data-kbd="N" aria-keyshortcuts="N"' + (startDis ? ' aria-disabled="true" data-tooltip="' + esc(startDis) + '"' : ' data-tooltip="Start a meeting"') + ' aria-label="Start a meeting">' + icon('plus') + '<span class="u-hide-phone">Start a meeting</span><span class="u-only-phone" aria-hidden="true">Start</span></button>' });
  };
  M.moreItems = function () {
    return [{ label: 'How meetings work', icon: 'info', act: 'how', only: 'u-only-below-lg' }, { label: 'Generate a deck…', icon: 'presentation', act: 'deck', disabled: A.offline, reason: A.offlineReason }, { label: 'Usage in Billing', icon: 'wallet', act: 'usage', href: 'billing.html#usage' }];
  };

  /* ---------- RoomCard (§1.6) ---------- */
  function agentText(r) {
    var a = r.agent || {};
    if (a.state === 'in') return A.statusHtml('success', 'In the room · ' + esc(a.doing ? 'presenting' : 'listening'));
    if (a.state === 'joining') return A.statusHtml('progress', 'Joining…');
    if (a.state === 'failed') return A.statusHtml('warning', 'Couldn’t join');
    if (a.state === 'left-wallet') return A.statusHtml('warning', 'Left at ' + F.time(a.at));
    if (a.state === 'first-guest') return A.statusHtml('neutral', 'Joins when the first guest arrives');
    return '<span class="status status--plain">Not in the room</span>';
  }
  M.agentText = agentText;
  function roomTag(r) {
    if (r.status === 'live') return V.ui.statusTag('room', 'live');
    if (r.status === 'long_open') return V.ui.statusTag('room', 'long-open', { n: openFor(r) });
    return V.ui.statusTag('room', r.status);
  }
  M.roomTag = roomTag;
  M.roomMeta = function (r) {
    if (r.status === 'live') return mins(r.startedAt) + ' min · ' + M.peopleText(r);
    if (r.status === 'open') return 'Created ' + mins(r.createdAt) + ' min ago · nobody here yet';
    if (r.status === 'long_open') return 'Nobody here since ' + F.dateShort(r.lastSeen);
    if (r.status === 'stale') return 'Nobody here for ' + mins(r.lastSeen) + ' min · closes at ' + F.time(r.closesAt) + ' unless someone joins';
    return '';
  };
  function roomCard(r) {
    var t = esc(r.title), idt = 'rc-' + r.id + '-t', stale = r.status === 'long_open' || r.status === 'stale';
    var warn = r.agent && r.agent.state === 'failed' ? A.statusHtml('warning', 'The agent couldn’t join. <button type="button" class="btn btn--link" data-room-act="retry" data-room="' + r.id + '">Retry</button>')
      : r.agent && r.agent.state === 'left-wallet' ? A.statusHtml('warning', 'Wallet is ₹0. The agent left at ' + F.time(r.agent.at) + '. <button type="button" class="btn btn--link" data-vaani-action="topup">Top up</button>') : '';
    var endDis = A.offline ? A.offlineReason : A.role !== 'admin' && r.createdBy !== V.data.user.short ? 'Only the host or an admin can end this room' : '';
    var act = stale ? '<button class="btn btn--sm btn--danger" type="button" data-room-act="end" data-room="' + r.id + '"' + (endDis ? ' aria-disabled="true" data-tooltip="' + esc(endDis) + '"' : '') + '>End room…</button>'
      : '<button class="btn btn--sm ag-room-open" type="button" data-room-act="open-ext" data-room="' + r.id + '"' + (A.offline ? ' aria-disabled="true" data-tooltip="' + A.offlineReason + '"' : '') + '>' + icon('external-link', 'sm') + 'Open room<span class="sr-only"> ' + t + ' (opens in a new tab)</span></button>';
    return '<section class="card ag-room' + (stale ? ' ag-room--stale' : '') + '" aria-labelledby="' + idt + '" data-room="' + r.id + '">' +
      '<h3 class="ag-room-title" id="' + idt + '"><a href="agents.html?view=meetings&amp;room=' + r.id + '" data-room-act="sheet" data-room="' + r.id + '" translate="no" data-tooltip-overflow>' + t + '</a></h3>' +
      '<p class="ag-room-state">' + roomTag(r) + '<span class="ag-meta">' + esc(M.roomMeta(r)) + '</span></p>' +
      '<p class="ag-room-join"><span class="ag-code" translate="no">' + esc(r.code) + '</span><button class="ibtn ibtn--sm" type="button" data-room-act="copy" data-room="' + r.id + '" aria-label="Copy link for ' + t + '" data-tooltip="Copy link">' + icon('copy', 'sm') + '</button>' +
        (r.keyRequired ? '<span class="tag tag--outline">' + icon('lock', 'xs') + 'Key required</span>' : '') + '</p>' +
      '<dl class="ag-ctl">' +
        '<div class="ag-ctl-row"><dt>Agent</dt><dd>' + agentText(r) + '</dd></div>' +
        '<div class="ag-ctl-row"><dt>Notes</dt><dd>' + (r.notes.on ? A.statusHtml('neutral', 'On · ' + r.notes.turns + ' turns so far') : '<span class="status status--plain">Off</span>') + '</dd></div>' +
        '<div class="ag-ctl-row"><dt>Recording</dt><dd>' + (r.recording.on ? '<span class="status status--plain">' + icon('disc', 'sm') + 'Recording since ' + F.time(r.recording.since) + '</span>' : '<span class="status status--plain">Off</span>') + '</dd></div>' +
      '</dl>' + (warn ? '<p class="ag-room-warn">' + warn + '</p>' : '') +
      '<div class="ag-room-acts">' + act + '<button class="ibtn" type="button" data-room-act="menu" data-room="' + r.id + '" aria-label="More actions for ' + t + '" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis') + '</button></div></section>';
  }
  function skCard() { return '<div class="card ag-room" aria-hidden="true"><span class="sk sk--title ag-sk-60"></span><span class="sk sk--block ag-sk-tag"></span><span class="sk ag-sk-40"></span><span class="sk ag-sk-80"></span><span class="sk ag-sk-70"></span><span class="sk ag-sk-60"></span></div>'; }

  function seatsMeta() {
    if (M.loading) return '';
    if (A.is('partial')) return A.statusHtml('warning', 'Agent seats unavailable · <button type="button" class="btn btn--link" data-mt-retry>Retry</button>');
    if (A.is('error-refresh')) return A.statusHtml('warning', 'Couldn’t refresh · <button type="button" class="btn btn--link" data-mt-retry>Retry</button> · Updated 11:20&nbsp;am');
    if (M.seats.used >= M.seats.total) return A.statusHtml('warning', 'All ' + M.seats.total + ' agent seats are in use');
    return '<span class="status status--plain">Agent seats: ' + M.seats.used + ' of ' + M.seats.total + ' in use</span>';
  }
  M.renderLive = function () {
    var box = $('#mt-rooms'), head = $('#mt-seats'); if (!box) return;
    head.innerHTML = seatsMeta();
    if (M.loading) { box.className = 'ag-rooms'; box.innerHTML = skCard() + skCard(); return; }
    if (!M.rooms.length) { box.className = 'ag-rooms-empty'; box.innerHTML = '<p class="empty empty--compact ag-empty-line">No rooms are open. <button type="button" class="btn btn--link" data-mt-start>Start a meeting</button></p>'; return; }
    box.className = 'ag-rooms'; var order = { live: 0, open: 1, long_open: 2, stale: 2, ending: 3 };
    box.innerHTML = M.rooms.slice().sort(function (a, b) { return order[a.status] - order[b.status]; }).slice(0, 6).map(roomCard).join('');
    V.initAll(box);
  };

  /* ---------- Past meetings: filter, sort, table (≥768) and ListRows (phones) ---------- */
  var WHEN = [['today', 'Today', 0], ['7d', 'Last 7 days', 7], ['30d', 'Last 30 days', 30], ['month', 'This month', 27]];
  M.whenLabel = function () { return (WHEN.filter(function (x) { return x[0] === M.f.when; })[0] || WHEN[2])[1]; };
  M.visible = function () {
    var q = M.f.q.trim().toLowerCase(), days = (WHEN.filter(function (x) { return x[0] === M.f.when; })[0] || WHEN[2])[2];
    var list = M.past.filter(function (m) {
      var age = (A.now() - new Date(m.at).getTime()) / 86400000; if (age > days + (days === 0 ? 0.47 : 0)) return false;
      if (q && (m.title + ' ' + (m.summary || '')).toLowerCase().indexOf(q) < 0) return false;
      if (M.f.agent.length && M.f.agent.indexOf(m.agent.kind) < 0) return false;
      if (M.f.notes.length && M.f.notes.indexOf(m.notes === 'ready' ? 'ready' : m.notes === 'off' ? 'off' : 'other') < 0) return false;
      return true;
    });
    list.sort(function (a, b) { return (M.sortDir === 'ascending' ? 1 : -1) * (new Date(a.at) - new Date(b.at)); });
    return list;
  };
  function whenCell(m) { return F.when(m.at, { time: true }); }
  function rowHtml(m, i) {
    return '<tr data-id="' + m.id + '" tabindex="' + (i === 0 ? '0' : '-1') + '">' +
      '<td class="c-key"><a href="agents.html?view=meetings&amp;meeting=' + m.id + '" class="ag-cell-title" translate="no" data-tooltip-overflow>' + esc(m.title) + '</a></td>' +
      '<td>' + whenCell(m) + '</td><td class="c-num ag-p2">' + m.mins + 'm</td><td class="c-num ag-p2">' + m.people + '</td>' +
      '<td class="ag-p3">' + esc(m.agent.label) + '</td><td>' + V.ui.statusTag('notes', m.notes) + '</td>' +
      '<td class="c-act"><button class="ibtn ibtn--sm" type="button" data-mt-row="' + m.id + '" aria-label="More actions for ' + esc(m.title) + ', ' + esc(whenCell(m)) + '" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis', 'sm') + '</button></td></tr>';
  }
  function liHtml(m) {
    return '<li><a class="li" href="agents.html?view=meetings&amp;meeting=' + m.id + '" data-mt-open="' + m.id + '"><span class="li-title" translate="no">' + esc(m.title) + '</span>' + V.ui.statusTag('notes', m.notes) +
      '<span class="li-meta">' + esc(whenCell(m)) + ' · ' + m.mins + 'm · ' + m.people + ' people</span></a></li>';
  }
  M.renderPast = function () {
    var tb = $('#mt-tbody'), ul = $('#mt-rows'), cnt = $('#mt-count'), pager = $('#mt-pager'), st = $('#mt-past-state'); if (!tb) return;
    if (M.loading) {
      tb.innerHTML = [0, 1, 2, 3, 4].map(function () { return '<tr aria-hidden="true"><td><span class="sk ag-sk-70"></span></td><td><span class="sk ag-sk-60"></span></td><td class="ag-p2"><span class="sk ag-sk-40"></span></td><td class="ag-p2"><span class="sk ag-sk-40"></span></td><td class="ag-p3"><span class="sk ag-sk-60"></span></td><td><span class="sk sk--block ag-sk-tag"></span></td><td></td></tr>'; }).join('');
      ul.innerHTML = ''; cnt.textContent = ''; pager.innerHTML = '<span>Loading…</span>'; st.innerHTML = ''; M.renderTokens(); return;
    }
    var list = M.visible();
    cnt.innerHTML = '<b>' + F.count(list.length) + '</b> ' + (list.length === 1 ? 'meeting' : 'meetings');
    $('#mt-frame').hidden = !list.length; ul.hidden = !list.length;
    if (!list.length) {
      var q = M.f.q.trim();
      st.innerHTML = '<div class="card ag-state"><div class="empty">' + icon('search-x', 'lg') + '<h3>No meetings match ' + (q ? '‘<span class="empty-query">' + esc(q) + '</span>’ ' : 'these filters ') + 'in the ' + esc(M.whenLabel().toLowerCase()) + '.</h3><p>Try a shorter search or another date range.</p><div class="empty-actions"><button class="btn" type="button" data-mt-clear>Clear filters</button></div></div></div>';
    } else st.innerHTML = '';
    tb.innerHTML = list.map(rowHtml).join('');
    ul.innerHTML = list.map(liHtml).join('');
    pager.innerHTML = '<span>1–' + list.length + ' of ' + A.plural(list.length, 'meeting') + '</span><span class="pager-sp"></span><span class="u-hide-phone">Rows per page 25</span><span>Page 1 of 1</span><span class="pager-btns"><button class="ibtn ibtn--sm" type="button" aria-label="Previous page" aria-disabled="true">' + icon('chevron-left', 'sm') + '</button><button class="ibtn ibtn--sm" type="button" aria-label="Next page" aria-disabled="true">' + icon('chevron-right', 'sm') + '</button></span>';
    M.renderTokens();
    if (M.sheetOpenId) { var row = $('#mt-tbody tr[data-id="' + M.sheetOpenId + '"]'); if (row) row.setAttribute('aria-current', 'true'); }
  };
  M.renderTokens = function () {
    var n = M.f.agent.length + M.f.notes.length, fb = $('#mt-filter-btn'); if (!fb) return;
    fb.innerHTML = icon('list-filter') + 'Filter' + (n ? '<span class="fcount" aria-label="' + n + ' active">' + n + '</span>' : '');
    var AG = { slides: 'Presented slides', flow: 'Ran a flow', none: 'No agent' }, NO = { ready: 'Summary ready', off: 'Notes off' };
    $('#mt-tokens').innerHTML = M.f.agent.map(function (k) { return tok('agent', k, 'Agent', AG[k]); }).join('') + M.f.notes.map(function (k) { return tok('notes', k, 'Notes', NO[k]); }).join('') +
      (n || M.f.q ? '<button class="btn btn--sm btn--tertiary" type="button" data-mt-clear>Clear</button>' : '');
  };
  function tok(f, k, lab, val) { return '<span class="ftoken"><span class="ftoken-body"><span class="ftoken-f">' + lab + '</span><span class="ftoken-v">' + esc(val) + '</span></span><button class="ftoken-x" type="button" data-mt-untoken="' + f + ':' + k + '" aria-label="Remove filter ' + lab + ': ' + esc(val) + '">' + icon('x', 'xs') + '</button></span>'; }

  /* ---------- aside: AgentProfileCard + This month ---------- */
  M.renderAside = function () {
    var a = $('#mt-aside'), v = DATA.voice; if (!a) return;
    var usageErr = A.is('partial'), used = M.free.used, left = M.free.of - used, out = left <= 0;
    var month = M.loading ? '<div class="l-stack l-stack--sm" aria-hidden="true"><span class="sk ag-sk-80"></span><span class="sk sk--block ag-sk-bar"></span><span class="sk ag-sk-60"></span><span class="sk ag-sk-70"></span></div>'
      : usageErr ? '<p class="ierr"><span class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t load usage. <button type="button" class="btn btn--link" data-mt-retry>Retry</button></span></span></p>'
      : '<div class="pbar' + (out ? ' ag-pbar-full' : '') + '" role="progressbar" aria-label="Free minutes" aria-valuemin="0" aria-valuemax="' + M.free.of + '" aria-valuenow="' + used + '" aria-valuetext="' + used + ' of ' + M.free.of + ' used"><div class="pbar-row"><span class="pbar-label">Free minutes</span><span class="pbar-value">' + used + ' of ' + M.free.of + ' used</span></div><div class="pbar-track"><span class="pbar-fill" style="--p: ' + (used / M.free.of).toFixed(3) + '"></span></div></div>' +
        (out ? '<p class="ag-mt8">' + A.statusHtml('warning', 'Free minutes used up · room time is ' + A.money(DATA.rates.roomPerMin) + '/min') + '</p>' : '<p class="ag-note">' + left + ' of ' + M.free.of + ' free minutes left this month.</p>') +
        A.facts([['Free minutes left', '<span class="num">' + left + '</span>'], ['Agent time', '<span class="num">' + (M.past.length ? DATA.month.agentMin + ' min · ' + A.money(DATA.month.agentCost) : '0 min · ' + A.money(0)) + '</span>'], ['Meetings', '<span class="num">' + M.past.length + '</span>']]) +
        '<p class="ag-links"><a href="billing.html#usage">Usage in Billing</a><span aria-hidden="true"> · </span><a href="billing.html#plans">Plans</a></p>';
    a.innerHTML = '<section class="card ag-profile" aria-labelledby="mt-agent-h"><div class="card-head"><h2 class="card-title" id="mt-agent-h">Meeting agent</h2></div>' +
      '<div class="ag-profile-id"><span class="av av--voice av--32" aria-hidden="true">' + esc(v.tile) + '</span><span class="ag-profile-who"><b translate="no">' + esc(v.name) + '</b><span class="ag-meta">Voice for meetings</span></span>' +
      '<button class="ibtn ibtn--secondary" type="button" id="mt-hear" aria-pressed="false" aria-label="Hear Vikash">' + icon('play') + '</button></div>' +
      A.facts([['Voice', esc(v.style)], ['Speaks', A.langList(v.languages)], ['Knows', '<a href="knowledge.html">Knowledge · ' + DATA.knowledgeCount + ' sources</a>'], ['Can', esc(DATA.capabilitiesShipped.join(' · '))]]) + '</section>' +
      '<section class="card" aria-labelledby="mt-month-h"' + (M.loading ? ' aria-busy="true"' : '') + '><div class="card-head"><h2 class="card-title" id="mt-month-h">This month</h2><span class="card-meta">Resets 1 Oct</span></div>' + month + '</section>';
  };

  /* ---------- main column skeleton + page-level states ---------- */
  M.render = function () {
    var main = $('#mt-main'); M.renderHeader(); M.renderAside();
    if (A.is('error')) {
      main.innerHTML = '<div class="card ag-state"><div class="empty empty--page empty--danger" role="alert">' + icon('circle-alert', 'lg') + '<h2 class="empty-title">Meetings couldn’t load.</h2><p>Your rooms and notes are safe. This is a problem on our side or with your connection.</p><div class="empty-actions"><button class="btn btn--primary" type="button" data-mt-retry>Retry</button></div>' +
        '<details class="details"><summary>Details</summary><div class="raw"><code>GET /api/meetings/open · 503 upstream timeout · request_id req_7d21a0</code></div></details></div></div>';
      return;
    }
    if (!M.loading && !M.rooms.length && !M.past.length) {
      main.innerHTML = '<section class="card ag-state" aria-labelledby="mt-first-h"><div class="empty empty--page">' + icon('video', 'lg') + '<h2 class="empty-title" id="mt-first-h">Meetings you start appear here</h2><p>Open a video room that your meeting agent joins to present slides or talk through a flow. Notes and a summary follow each meeting.</p>' +
        '<div class="empty-actions"><button class="btn" type="button" data-mt-start' + (M.canStart ? '' : ' aria-disabled="true" data-tooltip="Only admins can start meetings. Ask an admin."') + '>' + icon('plus') + 'Start a meeting</button><button class="btn btn--link" type="button" data-popover="mt-how" aria-haspopup="dialog" aria-expanded="false">How meetings work</button></div></div></section>';
      return;
    }
    main.innerHTML =
      '<section class="ag-sec" aria-labelledby="mt-live-h" id="mt-live"' + (M.loading ? ' aria-busy="true"' : '') + '><div class="ag-sec-head"><h2 class="section-title" id="mt-live-h" tabindex="-1" data-focus-target>Live now</h2><span id="mt-seats"></span></div><div id="mt-rooms"></div></section>' +
      '<section class="ag-sec" aria-labelledby="mt-past-h" id="mt-past"' + (M.loading ? ' aria-busy="true"' : '') + '><div class="ag-sec-head"><h2 class="section-title" id="mt-past-h">Past meetings</h2><span class="status status--plain">' + esc(M.whenLabel()) + '</span></div>' +
        '<div class="ag-tools" role="group" aria-label="Search and filters">' +
          '<form class="search ag-search" role="search" aria-label="Search past meetings" id="mt-search-form">' + icon('search') + '<input type="search" id="mt-search" data-page-search aria-label="Search titles and notes" placeholder="Search titles and notes…" autocomplete="off" value="' + esc(M.f.q) + '"><kbd class="kbd" data-single-key>/</kbd></form>' +
          '<div class="ag-tools-row"><button type="button" class="select select--auto ag-date" data-select id="mt-date" aria-controls="mt-date-lb" aria-labelledby="mt-date-l mt-date-v"><span class="sr-only" id="mt-date-l">Date</span><span class="select-value" id="mt-date-v">' + esc(M.whenLabel()) + '</span>' + icon('chevron-down') + '</button>' +
          '<button class="btn" type="button" id="mt-filter-btn" data-popover="mt-filter-pop" aria-haspopup="dialog" aria-expanded="false"></button><span id="mt-tokens" class="ag-tokens"></span></div>' +
          '<span class="ag-count" id="mt-count" role="status"></span></div>' +
        '<div id="mt-past-state"></div>' +
        '<div class="ag-frame" id="mt-frame"><div class="dt-wrap"><table class="dt" id="mt-table"><caption class="sr-only">Past meetings, newest first</caption><thead><tr>' +
          '<th scope="col" class="ag-c-title">Meeting</th><th scope="col" aria-sort="' + M.sortDir + '" data-col="when"><button class="th-sort" type="button">When' + icon(M.sortDir === 'ascending' ? 'arrow-up' : 'arrow-down', 'xs') + '</button></th>' +
          '<th scope="col" class="c-num ag-p2">Length</th><th scope="col" class="c-num ag-p2">People</th><th scope="col" class="ag-p3">Agent</th><th scope="col">Notes</th><th scope="col" class="c-act"><span class="sr-only">Actions</span></th></tr></thead><tbody id="mt-tbody"></tbody></table></div>' +
          '<ul class="ag-rows" id="mt-rows" aria-label="Past meetings"></ul><div class="pager" id="mt-pager"></div></div></section>';
    $('#mt-date-lb').innerHTML = WHEN.map(function (x) { return '<div class="option" role="option" data-value="' + x[0] + '" aria-selected="' + (x[0] === M.f.when) + '"><span class="option-main"><span class="option-label">' + x[1] + '</span></span>' + icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('');
    V.initAll(main);
    M.renderLive(); M.renderPast();
    if (A.offline) A.offlineBar('rooms and meetings');
  };

  /* ---------- filter popover body ---------- */
  M.renderFilter = function () {
    var box = function (name, val, label, on) { return '<label class="check check--dense"><input type="checkbox" class="cb" name="' + name + '" value="' + val + '"' + (on ? ' checked' : '') + '><span class="check-text">' + label + '</span></label>'; };
    $('#mt-filter-body').innerHTML = '<fieldset class="fieldset"><legend>Agent</legend>' + box('agent', 'slides', 'Presented slides', M.f.agent.indexOf('slides') >= 0) + box('agent', 'flow', 'Ran a flow', M.f.agent.indexOf('flow') >= 0) + box('agent', 'none', 'No agent', M.f.agent.indexOf('none') >= 0) + '</fieldset>' +
      '<fieldset class="fieldset"><legend>Notes</legend>' + box('notes', 'ready', 'Summary ready', M.f.notes.indexOf('ready') >= 0) + box('notes', 'off', 'Notes off', M.f.notes.indexOf('off') >= 0) + '</fieldset>';
  };
  M.applyFilter = function () {
    M.f.agent = $$('#mt-filter-body input[name="agent"]:checked').map(function (x) { return x.value; });
    M.f.notes = $$('#mt-filter-body input[name="notes"]:checked').map(function (x) { return x.value; });
    M.renderPast(); V.announce(M.visible().length + ' meetings');
  };
  M.clearFilters = function () { M.f = { q: '', when: '30d', agent: [], notes: [] }; var s = $('#mt-search'); if (s) s.value = ''; A.url.set({ q: null }); var dv = $('#mt-date-v'); if (dv) dv.textContent = M.whenLabel(); M.renderPast(); V.announce(M.visible().length + ' meetings'); };
})(window, document, window.Vaani, window.VaaniAgents);
