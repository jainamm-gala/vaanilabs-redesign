/* Vaani Labs prototype · pages/agents-task-sheet.js — the task sheet (03-pages/07 §2.10; record 440, docked ≥1440,
   overlay 1024–1439, modal below): Progress (pending decision, TaskPlan, Limits, Result) · Activity (Timeline) ·
   Details (KeyValueList + inline Edit limits). Pause / Resume (tier 0), Cancel task… (tier 2, "Keep task" focused),
   Duplicate as new task…, Raise limit…, Previous / Next (J / K). Also the task table’s row menu and clicks. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt, P = A.pa, DATA = A.data;
  var TS = A.taskSheet = {}, el, cur = null, editing = false;
  var ACTIVE = ['queued', 'working', 'waiting', 'scheduled', 'paused', 'limit', 'blocked'];
  var MARK = { done: ['smark--done', 'check', 'Done: '], progress: ['smark--current', null, 'In progress: '], waiting: ['smark--waiting', 'pause', 'Waiting for you: '], todo: ['smark--todo', null, 'Next: '],
    skipped: ['smark--skipped', 'minus', 'Skipped: '], failed: ['smark--failed', 'x', 'Failed: '], blocked: ['smark--blocked', 'lock', 'Blocked: '] };
  function limitsSentence(t) {
    var L = t.limits, parts = [];
    if (L.maxCalls) parts.push(L.maxCalls + ' call' + (L.maxCalls === 1 ? '' : 's')); if (L.spendCap) parts.push(A.money(L.spendCap, { whole: true }));
    var s = parts.length ? 'Stops after ' + parts.join(' or ') : 'No limits'; if (L.finishBy) s += ', by ' + F.weekday(L.finishBy) + ' ' + F.dateShort(L.finishBy) + ', ' + F.time(L.finishBy) + ' IST'; if (L.repeat) s += ' · ' + L.repeat;
    return s + '.';
  }
  TS.limitsSentence = limitsSentence;
  function chanText(c) { var cap = DATA.capGroups[0].caps.filter(function (x) { return x.id === c; })[0]; var n = { calls: 'Calls', whatsapp: 'WhatsApp messages', email: 'Email' }[c]; return n + ' · ' + (cap && cap.value === 'auto' ? 'runs on its own within the limits' : 'asks you first'); }

  function progressTab(t) {
    var a = A.approvals.forTask(t.id), top = '';
    if (a) {
      var dockedBeside = el.classList.contains('is-docked') && $('#pa-waiting');
      top = dockedBeside ? '<div class="notice notice--warning" role="status">' + icon('pause') + '<span class="notice-body"><b class="notice-title">Waiting for you.</b> ' + esc(a.title) + '. <button type="button" class="notice-act" data-ts="to-card" data-ap-id="' + a.id + '">Review</button></span></div>' : A.approvals.card(a, 'sheet');
    } else { var dec = P.approvals.filter(function (x) { return x.taskId === t.id && x.decided; })[0]; if (dec) top = A.approvals.card(dec, 'sheet'); }
    var plan = t.plan && t.plan.length ? '<h3 class="ag-h3">Plan</h3><ol class="stages" aria-label="Plan">' + t.plan.map(function (s) {
      var m = MARK[s.state] || MARK.todo;
      return '<li class="stage"><span class="smark ' + m[0] + '" data-mark' + (s.state === 'todo' ? '="hollow"' : '') + ' aria-hidden="true">' + (m[1] ? icon(m[1]) : '') + '</span><span><span class="sr-only">' + m[2] + '</span>' + esc(s.label) +
        (s.meta ? '<span class="stage-meta">' + esc(s.meta) + (s.evidence ? ' · <a href="call-reports.html?q=' + encodeURIComponent('task:' + t.id) + '">' + esc(s.evidence) + '</a>' : '') + '</span>' : '') + '</span></li>';
    }).join('') + '</ol>' : '<p class="ag-note">The agent plans the steps when the task starts.</p>';
    var L = t.limits, lim = '<h3 class="ag-h3">Limits</h3>' + A.kv([L.maxCalls ? ['Calls', '<span class="num">' + t.used.calls + ' of ' + L.maxCalls + '</span>'] : null, ['Spent', '<span class="num">' + P.spent(t) + '</span>'],
      L.finishBy ? ['Finish by', F.weekday(L.finishBy) + ' ' + F.dateShort(L.finishBy) + ', ' + F.time(L.finishBy) + ' IST'] : null, L.repeat ? ['Repeats', esc(L.repeat)] : null, t.contacts ? ['Contacts', esc(t.contacts.kind === 'me' ? 'Only you' : t.contacts.label)] : null], 'kv--rows');
    var res = t.state === 'done' ? '<h3 class="ag-h3">Result</h3><p class="type-read-15">' + esc(t.result) + '.</p>' + (/comparison|quote|Booked/.test(t.result) ? '<ul class="file-list"><li class="file-row">' + icon('file-text') + '<span class="file-main"><span class="file-name">' + (/comparison/.test(t.result) ? 'crm-comparison.pdf' : 'quotes-summary.pdf') + '</span><span class="file-meta">184 KB · made by your agent</span></span><button class="btn btn--sm btn--tertiary" type="button" data-ts="download">' + icon('download', 'sm') + 'Download</button></li></ul>' : '') : '';
    return top + plan + lim + res;
  }
  function activityTab(t) {
    var days = {}; (t.activity || []).forEach(function (e) { var k = F.when(e.at).replace(/ \d.*$/, ''); (days[k] = days[k] || []).push(e); });
    return '<div class="tl">' + Object.keys(days).map(function (k) {
      return '<h3 class="tl-day">' + esc(k === 'Today' ? 'Today' : k) + '</h3><ol class="tl-list">' + days[k].map(function (e) {
        return '<li class="tl-item"><span class="tl-node' + (e.tone ? ' tl-node--' + e.tone : '') + '" aria-hidden="true">' + icon(e.icon || 'circle-dot') + '</span><span class="tl-text">' + (e.link ? '<a href="call-reports.html?q=' + encodeURIComponent(e.text.split(' · ')[0].replace('Called ', '')) + '">' + esc(e.text.split(' · ')[0]) + '</a>' + esc(e.text.slice(e.text.indexOf(' · '))) : esc(e.text)) + '</span><time class="tl-time" datetime="' + e.at + '">' + F.time(e.at) + '</time></li>';
      }).join('') + '</ol>';
    }).join('') + '</div>';
  }
  function detailsTab(t) {
    var L = t.limits, form = editing ? '<form class="ag-limits-form card" id="ts-limits" novalidate aria-labelledby="ts-lim-h"><h3 class="ag-h3" id="ts-lim-h">Edit limits</h3>' +
      '<div class="ag-grid2"><div class="field"><label class="field-label" for="ts-calls">Max calls</label><div class="input"><input id="ts-calls" inputmode="numeric" value="' + (L.maxCalls || '') + '" aria-describedby="ts-calls-e"></div><p class="field-error" id="ts-calls-e" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="ts-spend">Spend limit</label><div class="input"><span class="input-prefix">₹</span><input id="ts-spend" inputmode="decimal" value="' + (L.spendCap || '') + '" aria-describedby="ts-spend-e"></div><p class="field-error" id="ts-spend-e" hidden></p></div></div>' +
      '<div class="form-actions"><button class="btn btn--tertiary" type="button" data-ts="lim-cancel">Cancel</button><button class="btn btn--primary" type="button" data-primary data-ts="lim-save">Save changes</button></div></form>' : '';
    return form + A.kv([['Goal', esc(t.full || t.goal)], ['Who it can contact', esc(t.contacts.kind === 'me' ? 'Only you' : t.contacts.label)],
      ['How it may reach them', t.channels.length ? t.channels.map(function (c) { return '<span class="u-block">' + esc(chanText(c)) + '</span>'; }).join('') : 'Reaches only you, on WhatsApp'],
      ['Limits', esc(limitsSentence(t)) + (ACTIVE.indexOf(t.state) >= 0 && !editing ? ' <button type="button" class="btn btn--link" data-ts="edit-limits">Edit limits…</button>' : '')], ['Repeats', esc(L.repeat || 'Doesn’t repeat')],
      ['Number', '<span class="ag-code-12" translate="no">' + esc(DATA.number.masked) + '</span>'], ['Confirmations go to', 'WhatsApp · <span class="phone-text" translate="no">' + esc(DATA.contact.whatsapp) + '</span>'],
      ['Created', esc(t.createdBy) + ' · ' + F.when(t.createdAt, { time: true })], ['Task id', '<span class="ag-code-12">' + t.id + '</span><button class="ibtn ibtn--sm" type="button" data-ts="copy-id" aria-label="Copy task id">' + icon('copy', 'sm') + '</button>']], 'kv--rows');
  }
  function footer(t) {
    var off = A.offline ? ' aria-disabled="true" data-tooltip="' + A.offlineReason + '"' : '';
    if (t.state === 'paused') return '<button class="btn btn--primary" type="button" data-ts="resume"' + off + '>' + icon('play') + 'Resume task</button>';
    if (t.state === 'limit') return '<button class="btn btn--primary" type="button" data-ts="raise"' + off + '>Raise limit…</button>';
    if (t.state === 'failed') return '<button class="btn btn--primary" type="button" data-ts="retry"' + off + '>' + icon('rotate-cw') + 'Retry task</button>';
    if (ACTIVE.indexOf(t.state) < 0) return '<button class="btn" type="button" data-ts="duplicate">' + icon('copy') + 'Duplicate as new task…</button>';
    return '<button class="btn" type="button" data-ts="pause"' + off + '>' + icon('pause') + 'Pause task</button>';
  }
  function menuItems(t, forRow) {
    var act = ACTIVE.indexOf(t.state) >= 0, off = A.offline;
    return (forRow ? [{ label: 'Open', icon: 'panel-left', act: 'open' }] : []).concat(act ? [t.state === 'paused' ? { label: 'Resume', icon: 'play', act: 'resume', disabled: off, reason: A.offlineReason } : { label: 'Pause', icon: 'pause', act: 'pause', disabled: off, reason: A.offlineReason }] : [])
      .concat([{ label: 'Duplicate as new task…', icon: 'copy', act: 'duplicate' }]).concat(!forRow && act ? [{ label: 'Edit limits…', icon: 'sliders-horizontal', act: 'edit-limits' }] : [])
      .concat(act ? [{ sep: 1 }, { label: 'Cancel task…', icon: 'circle-slash', act: 'cancel', danger: 1, disabled: off, reason: A.offlineReason }] : []);
  }

  TS.open = function (id, trigger, o) {
    o = o || {}; el = $('#pa-task-sheet'); var t = P.find(id); cur = id; P.sheetId = id; editing = !!o.editLimits;
    var list = P.visible(), i = list.indexOf(t), tab = o.tab || A.q('tab') || 'progress';
    if (!t) {
      el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back to Personal agents">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="pa-task-t">Task not found</h2></div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close">' + icon('x') + '</button></div></div>' +
        '<div class="sheet-body"><div class="empty">' + icon('search-x', 'lg') + '<h3>This task was deleted, or you no longer have access.</h3><div class="empty-actions"><button class="btn" type="button" data-drawer-close>Back to tasks</button></div></div></div>';
    } else {
      var pausable = ['working', 'waiting', 'scheduled', 'queued', 'blocked'].indexOf(t.state) >= 0;
      el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back to Personal agents">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="pa-task-t" data-tooltip-overflow>' + esc(t.goal) + '</h2><p class="sheet-meta">' + V.ui.statusTag('task', t.state) + ' since ' + (F.when(t.since) === 'Today ' + F.time(t.since) ? F.time(t.since) : F.when(t.since, { time: true })) + '</p></div><div class="sheet-actions">' +
        (pausable || t.state === 'paused' ? '<button class="ibtn" type="button" data-ts="' + (t.state === 'paused' ? 'resume' : 'pause') + '" aria-label="' + (t.state === 'paused' ? 'Resume task' : 'Pause task') + '"' + (A.offline ? ' aria-disabled="true"' : '') + '>' + icon(t.state === 'paused' ? 'play' : 'pause') + '</button>' : '') +
        '<button class="ibtn u-hide-phone" type="button" data-ts="prev" aria-label="Previous task" data-kbd="K"' + (i <= 0 ? ' aria-disabled="true"' : '') + '>' + icon('chevron-up') + '</button><button class="ibtn u-hide-phone" type="button" data-ts="next" aria-label="Next task" data-kbd="J"' + (i < 0 || i >= list.length - 1 ? ' aria-disabled="true"' : '') + '>' + icon('chevron-down') + '</button>' +
        '<button class="ibtn" type="button" data-ts="menu" aria-label="More actions for this task" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis') + '</button><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close task">' + icon('x') + '</button></div></div>' +
        '<div class="vtabs vtabs--panel"><div class="vtabs-list" role="tablist" aria-label="Task">' + [['progress', 'Progress'], ['activity', 'Activity'], ['details', 'Details']].map(function (x) { return '<button class="vtab" role="tab" type="button" id="ts-tab-' + x[0] + '" aria-controls="ts-p-' + x[0] + '" aria-selected="' + (x[0] === tab) + '" data-value="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
        ['progress', 'activity', 'details'].map(function (x) { return '<div class="sheet-body" id="ts-p-' + x + '" role="tabpanel" aria-labelledby="ts-tab-' + x + '" tabindex="0"' + (x === tab ? '' : ' hidden') + '></div>'; }).join('') +
        '<div class="sheet-foot sheet-foot--end" id="ts-foot"></div>';
    }
    var wasOpen = V.drawer.isOpen(el);
    if (!wasOpen) V.drawer.open(el, { returnTo: trigger, onClose: function () { cur = null; P.sheetId = null; A.url.set({ task: null, tab: null }); markRows(); A.dock(); V.setTitle(null); } });
    TS.refresh(); A.url.set({ task: id, tab: tab === 'progress' ? null : tab }); markRows(); A.dock(); V.setTitle(t ? t.goal : 'Not found');
    if (wasOpen && !o.keepFocus) { var tt = $('.sheet-title', el); tt.setAttribute('tabindex', '-1'); tt.focus({ preventScroll: true }); }
    var tl = $('[role="tablist"]', el); if (tl) tl.addEventListener('vaani:tabchange', function (e) { A.url.set({ tab: e.detail.value === 'progress' ? null : e.detail.value }); });
    if (editing) { var c = $('#ts-calls', el); if (c) c.focus(); }
  };
  TS.refresh = function () {
    if (!el || !cur || el.hidden) return; var t = P.find(cur); if (!t) return;
    $('#ts-p-progress', el).innerHTML = progressTab(t); $('#ts-p-activity', el).innerHTML = activityTab(t); $('#ts-p-details', el).innerHTML = detailsTab(t); $('#ts-foot', el).innerHTML = footer(t);
    var meta = $('.sheet-meta', el); if (meta) meta.innerHTML = V.ui.statusTag('task', t.state) + ' since ' + F.time(t.since);
    V.initAll(el);
  };
  function markRows() { $$('#pa-tbody tr').forEach(function (r) { if (r.getAttribute('data-id') === P.sheetId) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); }); }
  TS.step = function (dir) { var list = P.visible(), i = list.map(function (x) { return x.id; }).indexOf(cur), n = list[i + dir]; if (n) TS.open(n.id); };

  /* ---------- actions ---------- */
  /* tier 2 (O §3): the shared ConfirmDialog, danger tone, focus on "Keep task" */
  function keepConfirm(t, trigger) {
    V.dialog.confirm({ title: 'Cancel ‘' + t.goal + '’?', body: 'The agent stops now. Calls and messages already sent stay sent, and their records stay in Call reports.', tone: 'danger', confirmLabel: 'Cancel task', cancelLabel: 'Keep task', focusCancel: true, returnTo: trigger })
      .then(function (ok) { if (!ok) return; t.state = 'cancelled'; t.since = t.updatedAt = F.now().toISOString(); t.progress = 'Cancelled by you at ' + F.time(t.since); (P.approvals || []).forEach(function (a) { if (a.taskId === t.id && !a.decided) { a.decided = { text: 'Task cancelled', at: F.time(t.since), tone: 'neutral' }; V.data.state.tasksToConfirm = 0; } }); P.update(); A.approvals.renderAll(); TS.refresh(); V.announce('Cancelled ' + t.goal); });
  }
  TS.act = function (act, t, trigger) {
    if (act === 'open') TS.open(t.id, trigger);
    else if (act === 'pause') { var prev = t.state; t._prev = prev; t.state = 'paused'; t.since = F.now().toISOString(); t.progress = 'Paused by you at ' + F.time(t.since); P.update(); TS.refresh(); V.toast.success('Paused ‘' + t.goal + '’', { action: { label: 'Resume', onClick: function () { TS.act('resume', t); } } }); }
    else if (act === 'resume') { t.state = t._prev && t._prev !== 'paused' ? t._prev : 'working'; t.since = F.now().toISOString(); t.progress = t.state === 'working' ? 'Resumed · picking up where it stopped' : t.progress; P.update(); TS.refresh(); V.announce('Resumed ' + t.goal); }
    else if (act === 'cancel') keepConfirm(t, trigger);
    else if (act === 'duplicate') A.newTask.open({ duplicate: t, returnTo: trigger });
    else if (act === 'edit-limits' || act === 'raise') { if (cur === t.id && el && !el.hidden) { editing = true; V.tabs.select($('#ts-tab-details', el)); TS.refresh(); $('#ts-calls', el).focus(); } else TS.open(t.id, trigger, { tab: 'details', editLimits: true }); }
    else if (act === 'retry') { t.state = 'queued'; t.since = F.now().toISOString(); t.progress = 'Starts in a moment'; P.update(); TS.refresh(); V.announce('Retrying ' + t.goal); }
  };
  function saveLimits(t) {
    var c = $('#ts-calls', el), s = $('#ts-spend', el), ce = $('#ts-calls-e', el), se = $('#ts-spend-e', el), ok = true;
    var cv = c.value.trim() === '' ? null : +c.value, sv = +String(s.value).replace(/[₹,\s]/g, '');
    var cMsg = cv != null && !(Number.isInteger(cv) && cv >= 1 && cv <= 200) ? 'Enter a number from 1 to 200.' : cv != null && cv < t.used.calls ? t.used.calls + ' calls are already made. Set a limit above that.' : '';
    var sMsg = !(sv >= 50 && sv <= 10000) ? 'Enter an amount from ₹50 to ₹10,000.' : sv < t.used.spent ? A.money(t.used.spent) + ' is already spent. Set a limit above that.' : '';
    [[c, ce, cMsg], [s, se, sMsg]].forEach(function (x) { x[1].hidden = !x[2]; x[1].innerHTML = x[2] ? icon('circle-alert', 'sm') + '<span>' + esc(x[2]) + '</span>' : ''; x[0].setAttribute('aria-invalid', x[2] ? 'true' : 'false'); if (x[2] && ok) { x[0].focus(); ok = false; } });
    if (!ok) return;
    t.limits.maxCalls = cv; t.limits.spendCap = sv; if (t.state === 'limit') { t.state = 'working'; t.progress = 'Resumed with the new limit'; }
    editing = false; P.update(); TS.refresh(); V.announce('Limits saved. ' + limitsSentence(t)); var h = $('#ts-tab-details', el); if (h) h.focus();
  }
  d.addEventListener('click', function (e) {
    if (A.view !== 'personal-agents') return;
    var b = e.target.closest('[data-ts]');
    if (b) { var t = P.find(cur), a = b.getAttribute('data-ts'); if (!t || A.blocked(b)) return;
      if (a === 'menu') A.openMenu(b, 'ag-sheet-menu', menuItems(t, false), function (x) { TS.act(x, t, b); }, 'Actions for this task');
      else if (a === 'prev') TS.step(-1); else if (a === 'next') TS.step(1);
      else if (a === 'copy-id') A.copy(t.id, 'Task id copied', b);
      else if (a === 'download') V.toast.success('Downloaded the file');
      else if (a === 'lim-cancel') { editing = false; TS.refresh(); var dt = $('#ts-tab-details', el); if (dt) dt.focus(); }
      else if (a === 'lim-save') saveLimits(t);
      else if (a === 'to-card') { var c = $('#pa-cards [data-approval="' + b.getAttribute('data-ap-id') + '"] [data-primary]'); if (c) { c.scrollIntoView({ block: 'center' }); c.focus(); } }
      else TS.act(a, t, b);
      return; }
    var p = e.target.closest('[data-pa]'); if (!p) return; var act = p.getAttribute('data-pa'), task = P.find(p.getAttribute('data-id'));
    if (act === 'row-menu') { A.openMenu(p, 'ag-row-menu', menuItems(task, true), function (x) { TS.act(x, task, p); }, 'Actions for ' + task.goal); }
    else if (act === 'review') TS.open(task.id, p, { tab: 'progress' });
    else if (act === 'raise') TS.act('raise', task, p);
    else if (act === 'retry' && task) TS.act('retry', task, p);
  });
  d.addEventListener('click', function (e) {
    if (A.view !== 'personal-agents') return; var l = e.target.closest('#pa-tbody .c-key a, [data-pa-open]'); if (!l || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); TS.open(l.getAttribute('data-pa-open') || l.closest('tr').getAttribute('data-id'), l.closest('tr') || l);
  });
})(window, document, window.Vaani, window.VaaniAgents);
