/* Vaani Labs prototype · pages/agents-tasks.js — Personal agents (03-pages/07 §2.3–2.8, §2.12): PageHeader (overview
   variant on first use), WalletNotice, the Readiness GateChecklist (collapse="all-pass"), Start from a template, Waiting
   for you (ApprovalCards from agents-approvals.js), ViewTabs + search + task table (ListRows on phones) + pager,
   and every page state. The task sheet and New task live in their own modules. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt, DATA = A.data;
  var P = A.pa = {};
  var copy = function (x) { return JSON.parse(JSON.stringify(x)); };

  P.tasks = copy(DATA.tasks); P.approvals = copy(DATA.approvals.filter(function (a) { return !a.demo; }));
  P.hasNumber = !(A.is('first-use') || A.is('no-number'));
  if (A.is('first-use')) { P.tasks = []; P.approvals = []; }
  if (A.is('all-states')) P.tasks = copy(DATA.demoTasks.slice(1)).concat(P.tasks);
  if (A.is('approvals')) { P.approvals = copy(DATA.approvals); P.tasks.unshift(copy(DATA.demoTasks[0])); }
  if (A.is('no-waiting')) { P.approvals = []; P.tasks[0].state = 'working'; P.tasks[0].progress = 'Step 3 of 4 · sending payment links'; }
  if (A.is('all-done')) { P.approvals = []; P.tasks = P.tasks.filter(function (t) { return ['done', 'failed', 'cancelled'].indexOf(t.state) >= 0; }); }
  if (!P.hasNumber || A.wallet.empty) P.tasks.forEach(function (t) { if ((t.state === 'working') && t.channels.indexOf('calls') >= 0) { t.state = 'blocked'; t.progress = !P.hasNumber ? 'Needs a phone number' : 'Wallet is ₹0'; } });
  P.list = A.q('list') || 'active'; P.q = A.q('q') || '';
  P.loading = A.is('loading'); P.forbidden = A.role === 'viewer';

  var ACTIVE = ['queued', 'working', 'waiting', 'scheduled', 'paused', 'limit', 'blocked'], NEEDS = ['waiting', 'limit', 'blocked'];
  P.find = function (id) { return P.tasks.filter(function (t) { return t.id === id; })[0]; };
  P.inView = function (t, v) { return v === 'all' || (v === 'active' ? ACTIVE.indexOf(t.state) >= 0 : v === 'waiting' ? t.state === 'waiting' : ACTIVE.indexOf(t.state) < 0); };
  P.count = function (v) { return P.tasks.filter(function (t) { return P.inView(t, v); }).length; };
  P.pending = function () { return P.approvals.filter(function (a) { return !a.decided; }); };
  /* Tasks started in this session (newest first). 07 §2.9 "After Start" / §2.18: the new task appears first in Active,
     so it is pinned above the "needs you first, then newest" order (§2.7) until the next load; nothing is persisted. */
  P.fresh = [];
  P.visible = function () {
    var q = P.q.trim().toLowerCase();
    var list = P.tasks.filter(function (t) { return P.inView(t, P.list) && (!q || (t.goal + ' ' + (t.full || '')).toLowerCase().indexOf(q) >= 0); });
    return list.sort(function (a, b) {
      var fa = P.fresh.indexOf(a.id), fb = P.fresh.indexOf(b.id);
      if (fa !== fb) return fa < 0 ? 1 : fb < 0 ? -1 : fa - fb;
      if (P.list === 'active') { var na = NEEDS.indexOf(a.state) >= 0, nb = NEEDS.indexOf(b.state) >= 0; if (na !== nb) return na ? -1 : 1; }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  };
  P.spent = function (t) { return A.money(t.used.spent) + (t.limits.spendCap ? ' of ' + A.money(t.limits.spendCap, { whole: true }) : ''); };
  P.progress = function (t) {
    if (t.state === 'limit') return esc(t.progress) + ' · <button type="button" class="btn btn--link" data-pa="raise" data-id="' + t.id + '">Raise limit…</button>';
    if (t.state === 'blocked') return esc(t.progress) + ' · ' + (t.progress.indexOf('Wallet') === 0 ? '<button type="button" class="btn btn--link" data-vaani-action="topup">Top up</button>' : '<button type="button" class="btn btn--link" data-pa="ask-admin">Ask an admin</button>');
    if (t.state === 'failed') return esc(t.progress) + ' <button type="button" class="btn btn--link" data-pa="retry" data-id="' + t.id + '">Retry</button>';
    if (t.state === 'waiting') return esc(t.waitingOn || 'Waiting') + ' · waiting ' + Math.max(1, Math.round((A.now() - new Date(t.since).getTime()) / 60000)) + ' min';
    return esc(t.progress);
  };
  P.firstUse = function () { return !P.tasks.length; };

  /* ---------- header ---------- */
  P.renderHeader = function () {
    var active = P.count('active'), wait = P.pending().length, meta = '';
    if (P.loading) meta = '<span class="ag-sk-meta">' + A.sk('sk--meta') + '</span><span class="sr-only">Loading tasks…</span>';
    else if (!P.firstUse() && !P.forbidden && !A.is('error')) meta = A.mline([A.plural(active, 'task'), wait ? wait + ' waiting for you' : '']);
    var dis = A.offline ? A.offlineReason : '';
    A.header({ title: 'Personal agents', meta: meta, desc: P.firstUse() && !P.loading && !P.forbidden ? 'Give an agent a goal instead of a script. It calls, messages and looks things up from its own number until the job is done, and asks you before anything it can’t undo. For one scripted call, <a href="flow-designer.html">build a flow</a> instead.' : '',
      actions: P.forbidden ? '' : '<a class="btn btn--tertiary u-hide-below-xl" href="agents.html?view=agent-settings">' + icon('sliders-horizontal') + 'Agent settings</a>' +
        '<button class="ibtn ph-fold" type="button" id="pa-refresh" aria-label="Refresh" data-tooltip="Refresh · Updated 11:24 am">' + icon('refresh-cw') + '</button>' +
        '<button class="ibtn" type="button" id="ag-more" aria-label="More actions" aria-haspopup="menu" aria-controls="ag-more-menu" aria-expanded="false">' + icon('ellipsis') + '</button>' +
        '<button class="btn btn--primary" type="button" id="pa-new-btn" data-kbd="N" aria-keyshortcuts="N"' + (dis ? ' aria-disabled="true" data-tooltip="' + dis + '"' : ' data-tooltip="New task"') + '>' + icon('plus') + 'New task</button>' });
  };
  P.moreItems = function () {
    return [{ label: 'How personal agents work', icon: 'info', act: 'how' }, { label: 'Agent settings', icon: 'sliders-horizontal', act: 'settings', href: 'agents.html?view=agent-settings', only: 'u-only-below-xl' }, { label: 'Refresh', icon: 'refresh-cw', act: 'refresh', only: 'u-only-below-lg' }];
  };

  /* ---------- WalletNotice (page scope; a spending page) ---------- */
  P.walletNotice = function () {
    var ws = A.wallet.state; if (ws === 'healthy' || A.offline) return '';
    var N = { empty: ['warning', 'Wallet is ₹0.', 'Your agent’s calls are paused. Research, writing and messages to you still work.', 'Wallet ₹0 · calls paused'], low: ['warning', 'Wallet is low.', '₹42.10 left, about 17 min of calls.', 'Wallet ₹42 · 17 min'],
      'autopay-failed': ['danger', 'Autopay couldn’t top up.', 'Your UPI mandate was declined. Calls pause at ₹0.', 'Autopay failed'], pending: ['info', 'Payment pending.', 'Your wallet updates when UPI confirms.', 'Payment pending'] }[ws];
    if (!N) return '';
    return '<div class="notice notice--' + N[0] + '" role="status">' + icon(N[0] === 'info' ? 'info' : 'triangle-alert') + '<div class="notice-body"><span class="u-hide-phone"><b class="notice-title">' + N[1] + '</b> ' + N[2] + '</span><span class="u-only-phone"><b class="notice-title">' + N[3] + '</b></span></div>' +
      (ws !== 'pending' ? '<div class="notice-acts"><button type="button" class="notice-act" data-vaani-action="topup">' + (ws === 'autopay-failed' ? 'Fix autopay' : 'Top up') + '</button></div>' : '') + '<button type="button" class="ibtn ibtn--sm" data-pa="dismiss-wallet" aria-label="Dismiss wallet notice for 24 hours">' + icon('x', 'sm') + '</button></div>';
  };

  /* ---------- Readiness (GateChecklist, context inline, collapse all-pass) ---------- */
  P.readyRows = function () {
    var C = DATA.contact, member = A.role !== 'admin', rows = [];
    rows.push(P.hasNumber ? { kind: 'pass', html: 'Works from <span class="phone-text" translate="no">' + esc(DATA.number.masked) + '</span>.' }
      : { kind: 'blocking', html: 'No phone number yet. Your agent can research and write, but can’t call or message anyone until an admin assigns one.', meta: member ? 'Only admins can assign numbers · 2 in this workspace' : 'Assign one in Settings › Phone setup',
        act: member ? '<button type="button" class="btn btn--link gate-act" data-pa="ask-admin">Ask an admin</button>' : '<a class="gate-act" href="settings.html#phone">Assign a number</a>' });
    rows.push({ kind: 'pass', html: 'Confirmations go to WhatsApp · <span class="phone-text" translate="no">' + esc(C.whatsapp) + '</span>.', act: '<a class="gate-act" href="agents.html?view=agent-settings#contact">Change</a>' });
    var calls = DATA.capGroups[0].caps[0].value;
    rows.push({ kind: 'advisory', html: calls === 'auto' ? 'Calls run on their own within each task’s limits.' : 'Calls and messages ask you first.', act: '<a class="gate-act" href="agents.html?view=agent-settings#autonomy">Review</a>' });
    return rows;
  };
  P.renderReady = function () {
    var box = $('#pa-ready'); if (!box) return;
    if (P.loading) { box.className = 'card ag-ready'; box.innerHTML = '<div class="ag-before-head"><h2 class="card-title" id="pa-ready-h">Before your agent can work</h2>' + A.statusHtml('progress', 'Checking…', { live: true }) + '</div><ul class="gate-list">' + ['Checking the phone number…', 'Checking how it reaches you…', 'Checking what it may do alone…'].map(function (t) { return A.row('checking', t); }).join('') + '</ul>'; return; }
    if (A.is('partial')) { box.className = 'card ag-ready'; box.innerHTML = '<h2 class="card-title" id="pa-ready-h">Before your agent can work</h2><div class="ierr ag-mt8"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t check your agent’s setup. <button type="button" class="btn btn--link" data-pa="retry-all">Retry</button></span></div></div>'; return; }
    var rows = A.sortRows(P.readyRows()), blocked = rows.some(function (r) { return r.kind === 'blocking'; }), collapsed = !blocked && !P.firstUse();
    if (collapsed) {
      box.className = 'ag-ready ag-ready--line';
      box.innerHTML = '<h2 class="sr-only" id="pa-ready-h">Before your agent can work</h2><a class="ag-ready-link" href="agents.html?view=agent-settings"><span role="status" class="status status--md status--success">' + icon('check', 'sm') + '<span>Ready</span></span>' +
        '<span class="ag-ready-rest u-hide-phone"> · <span class="phone-text" translate="no">' + esc(DATA.number.masked) + '</span> · confirmations on WhatsApp · <span class="ag-ready-a">Agent settings</span></span><span class="ag-ready-rest u-only-phone"> · WhatsApp · <span class="ag-ready-a">Settings</span></span></a>';
      return;
    }
    box.className = 'card ag-ready';
    box.innerHTML = '<div class="ag-before-head"><h2 class="card-title" id="pa-ready-h">Before your agent can work</h2>' + (blocked ? A.statusHtml('danger', 'Your agent can’t call or message yet', { live: true }) : A.statusHtml('success', 'Ready', { live: true })) + '</div>' +
      '<ul class="gate-list">' + rows.map(function (r) { return A.row(r.kind, r.html, { meta: r.meta, act: r.act }); }).join('') + '</ul>';
  };

  /* ---------- templates (first use): real buttons that open New task pre-filled ---------- */
  P.templatesHtml = function () {
    return '<section class="ag-sec2" aria-labelledby="pa-tpl-h"><h2 class="section-title ag-mb12" id="pa-tpl-h">Start from a template</h2><ul class="ag-templates" role="list">' + DATA.templates.map(function (t) {
      return '<li><button type="button" class="card card--interactive ag-tpl" data-pa="template" data-tpl="' + t.id + '"' + (A.offline ? ' aria-disabled="true" data-tooltip="' + A.offlineReason + '"' : '') + '><span class="ag-tpl-title">' + esc(t.title) + '</span><span class="ag-tpl-desc">' + esc(t.desc) + '</span><span class="ag-tpl-go">Use template' + icon('arrow-right') + '</span></button></li>';
    }).join('') + '</ul></section>';
  };

  /* ---------- the task table + phone rows ---------- */
  function rowHtml(t, i) {
    var wait = t.state === 'waiting';
    return '<tr data-id="' + t.id + '" tabindex="' + (i === 0 ? '0' : '-1') + '"' + (P.sheetId === t.id ? ' aria-current="true"' : '') + '><td class="c-key"><a href="agents.html?view=personal-agents&amp;task=' + t.id + '" class="ag-cell-goal" data-tooltip="' + esc(t.full || t.goal) + '">' + esc(t.goal) + '</a></td>' +
      '<td>' + V.ui.statusTag('task', t.state) + '</td><td class="ag-cell-prog"><span class="status status--plain">' + P.progress(t) + '</span></td>' +
      '<td class="c-num ag-p2">' + P.spent(t) + '</td><td class="ag-p2b">' + F.when(t.updatedAt, { time: true }) + '</td><td class="ag-p3">' + (t.limits.finishBy ? F.weekday(t.limits.finishBy) + ' ' + F.dateShort(t.limits.finishBy) : t.limits.repeat ? 'Repeats' : '–') + '</td>' +
      '<td class="c-act"><span class="ag-row-acts">' + (wait ? '<button class="btn btn--sm" type="button" data-pa="review" data-id="' + t.id + '" aria-label="Review ' + esc(t.goal) + '">Review…</button>' : '') +
      '<button class="ibtn ibtn--sm" type="button" data-pa="row-menu" data-id="' + t.id + '" aria-label="More actions for ' + esc(t.goal) + '" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis', 'sm') + '</button></span></td></tr>';
  }
  function liHtml(t) {
    return '<li><a class="li" href="agents.html?view=personal-agents&amp;task=' + t.id + '" data-pa-open="' + t.id + '"><span class="li-title">' + esc(t.goal) + '</span>' + V.ui.statusTag('task', t.state) +
      '<span class="li-meta">' + esc(t.state === 'waiting' ? (t.waitingOn || 'Waiting') : t.progress) + ' · ' + A.money(t.used.spent) + ' · ' + F.when(t.updatedAt) + '</span></a></li>';
  }
  P.renderTabs = function () {
    var v = [['active', 'Active'], ['waiting', 'Waiting for you'], ['done', 'Done'], ['all', 'All']];
    $('#pa-tabs-list').innerHTML = v.map(function (x) { var n = x[0] === 'waiting' && A.is('partial') ? '–' : P.loading ? '' : F.count(P.count(x[0])); return '<button class="vtab" role="tab" type="button" aria-selected="' + (P.list === x[0]) + '" data-value="' + x[0] + '" aria-controls="pa-tasks-panel">' + x[1] + (n !== '' ? ' <span class="vtab-count">' + n + '</span>' : '') + '</button>'; }).join('');
    V.tabs.init($('#pa-tabs'));
  };
  P.renderTable = function () {
    var tb = $('#pa-tbody'), ul = $('#pa-rows'), st = $('#pa-table-state'); if (!tb) return;
    var wrap = $('#pa-dt'), cnt = $('#pa-count'), pager = $('#pa-pager');
    if (P.loading) { tb.innerHTML = [0, 1, 2].map(function () { return '<tr aria-hidden="true"><td><span class="sk ag-sk-70"></span></td><td><span class="sk sk--block ag-sk-tag"></span></td><td><span class="sk ag-sk-60"></span></td><td class="ag-p2"><span class="sk ag-sk-40"></span></td><td class="ag-p2"><span class="sk ag-sk-40"></span></td><td class="ag-p3"><span class="sk ag-sk-40"></span></td><td></td></tr>'; }).join(''); pager.innerHTML = '<span>Loading…</span>'; return; }
    if (A.is('error')) {
      wrap.hidden = true; ul.hidden = true; pager.hidden = true; if (cnt) cnt.textContent = '';
      st.innerHTML = '<div class="empty empty--danger ag-table-state">' + icon('circle-alert', 'lg') + '<h3>Couldn’t load your tasks.</h3><p>Check your connection and try again.</p><div class="empty-actions"><button class="btn" type="button" data-pa="retry-all">Retry</button></div><details class="details"><summary>Details</summary><div class="raw"><code>GET /api/personal-agents/tasks · 500 · "upstream connect error or disconnect/reset before headers" · request_id req_5b90e3</code></div></details></div>';
      return;
    }
    var list = P.visible(); if (cnt) cnt.innerHTML = '<b>' + F.count(list.length) + '</b> ' + (list.length === 1 ? 'task' : 'tasks');
    wrap.hidden = !list.length; ul.hidden = !list.length; pager.hidden = !list.length;
    if (!list.length) {
      var q = P.q.trim();
      st.innerHTML = P.firstUse() ? '<div class="empty ag-table-state">' + icon('list-checks', 'lg') + '<h3>No tasks yet</h3><p>Tasks you give your agent appear here with their progress.</p><div class="empty-actions"><button class="btn" type="button" data-pa="new">' + icon('plus') + 'New task</button></div></div>'
        : q ? '<div class="empty ag-table-state">' + icon('search-x', 'lg') + '<h3>No tasks match ‘<span class="empty-query">' + esc(q) + '</span>’.</h3><div class="empty-actions"><button class="btn" type="button" data-pa="clear">Clear search</button></div></div>'
        : P.list === 'active' ? '<div class="empty ag-table-state">' + icon('circle-check', 'lg') + '<h3>No active tasks.</h3><p>Finished tasks are under Done.</p><div class="empty-actions"><button class="btn" type="button" data-pa="view-done">View done</button></div></div>'
        : '<div class="empty ag-table-state"><p>Nothing here.</p></div>';
    } else st.innerHTML = '';
    tb.innerHTML = list.map(rowHtml).join(''); ul.innerHTML = list.map(liHtml).join('');
    pager.innerHTML = '<span>1–' + list.length + ' of ' + A.plural(list.length, 'task') + '</span><span class="pager-sp"></span><span>Page 1 of 1</span><span class="pager-btns"><button class="ibtn ibtn--sm" type="button" aria-label="Previous page" aria-disabled="true">' + icon('chevron-left', 'sm') + '</button><button class="ibtn ibtn--sm" type="button" aria-label="Next page" aria-disabled="true">' + icon('chevron-right', 'sm') + '</button></span>';
    V.initAll(tb);
  };

  /* ---------- whole view ---------- */
  P.render = function () {
    var root = $('#pa-scroll'); P.renderHeader();
    if (P.forbidden) {
      root.innerHTML = '<div class="ag-pad"><div class="card ag-state"><div class="empty empty--page">' + icon('lock', 'lg') + '<h2 class="empty-title">Personal agents aren’t turned on for your role.</h2><p>Ask an admin (2 in this workspace) to turn them on for you.</p><div class="empty-actions"><button class="btn" type="button" data-pa="ask-admin">Copy request</button><a class="btn btn--tertiary" href="cockpit.html">Go to Cockpit</a></div></div></div></div>';
      return;
    }
    var pend = P.pending(), first = P.firstUse() && !P.loading;
    if (!P.loading && !A.is('partial') && V.data.state.tasksToConfirm !== pend.length) { V.data.state.tasksToConfirm = pend.length; V.shell.render(); }
    root.innerHTML = '<div class="ag-pad ag-pa-top">' + P.walletNotice() + '<section id="pa-ready" aria-labelledby="pa-ready-h"></section>' + (first ? P.templatesHtml() : '') +
      (!P.loading && (pend.length || A.is('partial')) ? '<section class="ag-sec2" id="pa-waiting" aria-labelledby="pa-waiting-h"><h2 class="section-title ag-mb12" id="pa-waiting-h" tabindex="-1" data-focus-target>Waiting for you <span class="count-badge">' + (A.is('partial') ? '' : '· ' + pend.length) + '</span></h2><div id="pa-cards" class="ag-cards"></div></section>' : '') + '</div>' +
      '<section class="ag-tasks" id="pa-tasks" aria-labelledby="pa-tasks-h"' + (P.loading ? ' aria-busy="true"' : '') + '><h2 class="' + (first ? 'section-title ag-pad-x' : 'sr-only') + '" id="pa-tasks-h">Tasks</h2>' +
        (first ? '' : '<div class="vtabs" id="pa-tabs"><div class="vtabs-list" role="tablist" aria-label="Task views" data-activation="manual" id="pa-tabs-list"></div><span class="ag-tabs-status" id="pa-refresh-status">' + (A.is('error-refresh') ? A.statusHtml('warning', 'Couldn’t refresh · <button type="button" class="btn btn--link" data-pa="retry-all">Retry</button> · Updated 11:20&nbsp;am') : '') + '</span></div>' +
        '<div class="tb"><form class="search" role="search" aria-label="Search tasks" id="pa-search-form">' + icon('search') + '<input type="search" id="pa-search" data-page-search aria-label="Search tasks" placeholder="Search tasks…" autocomplete="off" value="' + esc(P.q) + '"><kbd class="kbd" data-single-key>/</kbd></form><span class="tb-spacer"></span><span class="ag-count" id="pa-count" role="status"></span></div>') +
        '<div id="pa-tasks-panel"' + (first ? '' : ' role="tabpanel" aria-labelledby="pa-tasks-h"') + '><div id="pa-table-state"></div><div class="dt-wrap ag-dt" id="pa-dt"><table class="dt" id="pa-table"><caption class="sr-only">Tasks, needing you first, then newest</caption><thead><tr><th scope="col" class="ag-c-goal">Task</th><th scope="col">Status</th><th scope="col">Progress</th><th scope="col" class="c-num ag-p2">Spent</th><th scope="col" class="ag-p2b" aria-sort="descending">Updated</th><th scope="col" class="ag-p3">Due</th><th scope="col" class="c-act"><span class="sr-only">Actions</span></th></tr></thead><tbody id="pa-tbody"></tbody></table></div>' +
        '<ul class="ag-rows" id="pa-rows" aria-label="Tasks"></ul><div class="pager" id="pa-pager"></div></div></section>';
    P.renderReady(); if (!first) P.renderTabs(); if (A.approvals) A.approvals.renderAll(); P.renderTable();
    V.initAll(root); if (A.offline) A.offlineBar('tasks');
  };
  P.update = function () { P.renderHeader(); if ($('#pa-tabs-list')) P.renderTabs(); P.renderTable(); var h = $('#pa-waiting-h .count-badge'); if (h) h.textContent = P.pending().length ? '· ' + P.pending().length : ''; V.shell.render(); };
})(window, document, window.Vaani, window.VaaniAgents);
