/* Vaani Labs prototype · pages/agents-newtask.js — New task (03-pages/07 §2.9; gate §5.5 form gate): a modal gate sheet
   (640) with Goal, Who it can contact, How it may reach them (with each channel’s autonomy), LimitsSummary + Edit
   limits, Main tool, "Before it starts" checks, the capped cost line and Start task / Schedule task. Prefills travel by
   id (template=, from=meeting:…, Duplicate). Dirty close → inline discard; ⌘/Ctrl+Enter starts exactly one task. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt, P = A.pa, DATA = A.data;
  var N = A.newTask = {}, el, entry, f, snap, busy = false, key, retried = false;
  var REPEAT = [['none', 'Doesn’t repeat'], ['weekday', 'Every weekday'], ['weekly', 'Every week on Monday'], ['monthly', 'Every month on the 1st']];
  var TOOLS = [['auto', null, 'Let the agent decide'], ['calls', 'Sales follow-up', 'Calls, WhatsApp messages'], ['book', 'Scheduling', 'Book appointments'], ['web', 'Research', 'Web research'], ['news', 'Research', 'News digest'], ['pdf', 'Documents', 'Read PDFs'], ['sheets', 'Documents', 'Read spreadsheets'],
    ['draft', 'Documents', 'Draft a document'], ['mksheet', 'Documents', 'Make a spreadsheet'], ['deck', 'Documents', 'Make a presentation'], ['kb', 'Knowledge', 'Look up your knowledge'], ['meet', 'Meetings', 'Run a video meeting']];
  function cap(id) { var c = null; DATA.capGroups.forEach(function (g) { g.caps.forEach(function (x) { if (x.id === id) c = x; }); }); return c; }
  function blank() { return { goal: '', contacts: 'me', view: 'callbacks', leads: [], channels: [], limits: { maxCalls: DATA.defaults.calls, spendCap: DATA.defaults.spend, finishBy: new Date(A.now() + 5 * 86400000).toISOString().slice(0, 10) + 'T18:00:00+05:30', repeat: 'none' }, tool: 'auto', from: null, tpl: null }; }
  function fromPrefill(o) {
    var x = blank();
    if (o.template) { var t = DATA.templates.filter(function (y) { return y.id === o.template; })[0]; if (t) { x.goal = t.goal; x.contacts = t.contacts; x.view = t.view || 'callbacks'; x.channels = t.channels.slice(); x.limits = JSON.parse(JSON.stringify(t.limits)); x.tpl = t.id; } }
    if (o.from) { var p = /^meeting:(\w+):item:(\d+)$/.exec(o.from), m = p && A.mt && A.mt.findPast(p[1]), it = m && m.items[+p[2] - 1]; if (it) { x.goal = it.text + '.'; x.from = { id: m.id, title: m.title, at: m.at, n: +p[2] }; } }
    if (o.duplicate) { var u = o.duplicate; x.goal = u.full || u.goal; x.contacts = u.contacts.kind === 'view' ? 'view' : u.contacts.kind === 'specific' ? 'specific' : 'me'; x.channels = u.channels.slice(); x.limits.maxCalls = u.limits.maxCalls || x.limits.maxCalls; x.limits.spendCap = u.limits.spendCap || x.limits.spendCap; if (x.contacts === 'specific') x.leads = ['lead_1042', 'lead_1050']; }
    return x;
  }
  function calls() { return f.contacts !== 'me' && f.channels.indexOf('calls') >= 0; }
  function contactsOut() { return f.contacts !== 'me' && (f.channels.indexOf('calls') >= 0 || f.channels.indexOf('whatsapp') >= 0); }
  function viewById(id) { return DATA.leadViews.filter(function (v) { return v.id === id; })[0]; }
  function repeats() { return f.limits.repeat && f.limits.repeat !== 'none'; }
  function lim() {
    var L = f.limits, parts = []; if (calls() || f.contacts === 'me') parts.push(L.maxCalls + ' call' + (+L.maxCalls === 1 ? '' : 's')); parts.push(A.money(+L.spendCap, { whole: true }));
    return 'Stops after ' + parts.join(' or ') + (L.finishBy && !repeats() ? ', by ' + F.weekday(L.finishBy) + ' ' + F.dateShort(L.finishBy) + ', ' + F.time(L.finishBy) + ' IST' : '') + (repeats() ? ' · ' + REPEAT.filter(function (r) { return r[0] === L.repeat; })[0][1].toLowerCase() : '') + '.';
  }

  function checks() {
    var r = [], hasNum = P.hasNumber;
    if (contactsOut() && !hasNum) r.push({ kind: 'blocking', html: 'This task needs to call or message. No phone number yet. <button type="button" class="btn btn--link" data-pa="ask-admin">Ask an admin</button>, or untick Calls and WhatsApp.' });
    if (calls() && A.wallet.empty) r.push({ kind: 'blocking', html: 'Wallet is ₹0. Top up so your agent can call.', act: '<button type="button" class="btn btn--link gate-act" data-vaani-action="topup">Top up</button>' });
    else if (calls() && A.wallet.low) r.push({ kind: 'warning', html: 'Wallet ' + A.money(A.wallet.balance) + ' covers ' + F.runway(A.wallet.balance) + ' of calls. Calls pause at ₹0.', act: '<button type="button" class="btn btn--link gate-act" data-vaani-action="topup">Top up</button>' });
    if (f.contacts === 'view') { var v = viewById(f.view); r.push(f.view === 'callbacks' && !f.includeCalled ? { kind: 'adjusted', html: v.count + ' leads in ' + esc(v.label) + ' · 2 were called today and are skipped', act: '<button type="button" class="btn btn--link gate-act" data-nt="include">Include</button>' } : { kind: 'pass', html: F.count(v.count) + ' leads in ' + esc(v.label) }); }
    if (f.contacts === 'specific') r.push(f.leads.length ? { kind: 'pass', html: A.plural(f.leads.length, 'lead') + ' chosen' } : { kind: 'blocking', html: 'Choose at least one lead, or pick another option.' });
    if (f.contacts === 'new') r.push({ kind: 'advisory', html: 'It asks you before contacting each new person.' });
    if (calls()) { r.push({ kind: 'advisory', html: 'Calls only between 10 am and 7 pm IST; it waits outside those hours.' }); r.push({ kind: 'advisory', html: 'People on the DND list are skipped.' }); }
    if (!V.data.user.twoFactor && f.tool === 'pay') r.push({ kind: 'warning', html: 'Payments need two-factor authentication, which is off.' });
    if (!r.length) r.push({ kind: 'pass', html: f.contacts === 'me' ? 'It reports only to you, on WhatsApp.' : 'Nothing blocks this task.' });
    return A.sortRows(r);
  }
  function cost() {
    var L = f.limits, n = +L.maxCalls || 1;
    if (calls()) { var cr = F.callRange(n, 1, 2).replace(/^(\d+) call/, 'Up to $1 call'); return '<span>' + esc(cr) + '</span><b>never more than ' + A.money(+L.spendCap, { whole: true }) + '</b>'; }
    if (f.contacts === 'me') return '<span>Up to 1 call to you · about 1 to 2 min · ₹2 to ₹5</span><b>never more than ' + A.money(+L.spendCap, { whole: true }) + '</b>';
    return '<span>Messages only · Rate ₹0.04/s if it calls</span><b>never more than ' + A.money(+L.spendCap, { whole: true }) + '</b>';
  }

  function radio(val, title, desc) { return '<label class="check"><input type="radio" class="radio" name="nt-who" value="' + val + '"' + (f.contacts === val ? ' checked' : '') + '><span class="check-text">' + title + (desc ? '<span class="check-desc">' + desc + '</span>' : '') + '</span></label>'; }
  function chan(id, title) { var c = cap(id), auto = c && c.value === 'auto'; return '<label class="check"><input type="checkbox" class="cb" name="nt-ch" value="' + id + '"' + (f.channels.indexOf(id) >= 0 ? ' checked' : '') + '><span class="check-text">' + title + '<span class="check-desc">' + (auto ? 'Runs on its own within the limits' : 'Asks you first') + '</span></span></label>'; }
  function body() {
    var hasTasks = P.tasks.length > 0, v = viewById(f.view);
    var leads = (V.data.leads || []).slice(0, 14);
    return '<div id="nt-err"></div>' + (hasTasks && !f.goal ? '<div class="ag-startfrom"><span class="field-label">Start from</span><div class="l-cluster">' + DATA.templates.map(function (t) { return '<button type="button" class="btn btn--sm" data-nt="tpl" data-tpl="' + t.id + '">' + esc(t.title) + '</button>'; }).join('') + '</div></div>' : '') +
      '<div class="field"><label class="field-label" for="nt-goal">Goal</label><textarea class="textarea" id="nt-goal" rows="4" data-autofocus aria-describedby="nt-goal-h nt-goal-e" placeholder="Call the leads in my Callbacks due view and agree a new time with each…">' + esc(f.goal) + '</textarea>' +
        '<div class="field-foot"><p class="field-hint" id="nt-goal-h">Say what done looks like. The agent plans the steps.</p><span class="field-count" id="nt-goal-c"></span></div><p class="field-error" id="nt-goal-e" hidden></p>' +
        (f.from ? '<p>' + A.statusHtml('neutral', 'From <a href="agents.html?view=meetings&amp;meeting=' + f.from.id + '&amp;tab=actions" translate="no">' + esc(f.from.title) + '</a> · ' + F.date(f.from.at) + ' · action item ' + f.from.n) + '</p>' : '') + '</div>' +
      '<fieldset class="fieldset"><legend>Who it can contact</legend>' + radio('me', 'Only me', 'It reports to you and asks you questions. It contacts no one else.') + radio('view', 'Leads in a view', '') +
        (f.contacts === 'view' ? '<div class="field ag-indent"><span class="field-label" id="nt-view-l">View</span><button type="button" class="select" data-select id="nt-view" aria-controls="nt-view-lb" aria-labelledby="nt-view-l nt-view-v"><span class="select-value" id="nt-view-v">' + esc(v.label + ' · ' + F.count(v.count)) + '</span>' + icon('chevron-down') + '</button><div class="listbox" id="nt-view-lb" role="listbox" aria-labelledby="nt-view-l" hidden>' + DATA.leadViews.map(function (x) { return '<div class="option" role="option" data-value="' + x.id + '" aria-selected="' + (x.id === f.view) + '"><span class="option-main"><span class="option-label">' + esc(x.label + ' · ' + F.count(x.count)) + '</span></span>' + icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>' : '') +
        radio('specific', 'Specific leads', '') +
        (f.contacts === 'specific' ? '<div class="field ag-indent"><label class="field-label" for="nt-leads-in">Leads</label><div class="input input--multi" data-combobox id="nt-leads">' + f.leads.map(function (id) { var l = V.data.leads.filter(function (x) { return x.id === id; })[0]; return '<span class="token">Lead ' + l.no + '<button type="button" data-nt="unlead" data-id="' + id + '" aria-label="Remove Lead ' + l.no + '">' + icon('x', 'xs') + '</button></span>'; }).join('') +
          '<input id="nt-leads-in" role="combobox" aria-controls="nt-leads-lb" placeholder="' + (f.leads.length ? '' : 'Search leads by name or phone…') + '"></div><div class="listbox listbox--wide" id="nt-leads-lb" role="listbox" aria-label="Leads" hidden>' + leads.filter(function (l) { return f.leads.indexOf(l.id) < 0; }).map(function (l) { return '<div class="option option--2" role="option" data-value="' + l.id + '" data-aliases="' + l.phone.last4 + ' ' + l.no + '"><span class="option-main"><span class="option-label" translate="no">' + esc(l.name) + '</span><span class="option-desc">Lead ' + l.no + ' · ' + esc(l.phone.masked) + ' · ' + esc(l.city) + '</span></span></div>'; }).join('') + '</div></div>' : '') +
        radio('new', 'New people it finds', 'It asks you before contacting each new person.') + '</fieldset>' +
      (f.contacts !== 'me' ? '<fieldset class="fieldset"><legend>How it may reach them</legend>' + chan('calls', 'Calls') + chan('whatsapp', 'WhatsApp messages') + chan('email', 'Email') + '<p class="field-hint"><a href="agents.html?view=agent-settings#autonomy">Change in Agent settings</a></p></fieldset>' : '') +
      '<div class="field"><span class="field-label" id="nt-lim-l">Limits</span><div class="ag-limits"><p class="ag-limits-s" id="nt-lim-s">' + esc(lim()) + '</p><button type="button" class="btn btn--sm" data-nt="limits" aria-expanded="' + !!f.editLimits + '" aria-controls="nt-lim-f" aria-describedby="nt-lim-s">Edit limits</button></div>' +
        '<div class="ag-grid2 ag-lim-fields" id="nt-lim-f"' + (f.editLimits ? '' : ' hidden') + '>' +
        '<div class="field"><label class="field-label" for="nt-calls">Max calls</label><div class="input"><input id="nt-calls" inputmode="numeric" value="' + esc(f.limits.maxCalls) + '" aria-describedby="nt-calls-e"></div><p class="field-error" id="nt-calls-e" hidden></p></div>' +
        '<div class="field"><label class="field-label" for="nt-spend">Spend limit</label><div class="input"><span class="input-prefix">₹</span><input id="nt-spend" inputmode="decimal" value="' + esc(f.limits.spendCap) + '" aria-describedby="nt-spend-e"></div><p class="field-error" id="nt-spend-e" hidden></p></div>' +
        '<div class="field"><label class="field-label" for="nt-date">Finish by</label><div class="input"><input id="nt-date" type="date" value="' + (f.limits.finishBy ? f.limits.finishBy.slice(0, 10) : '') + '" min="2026-09-27"></div></div>' +
        '<div class="field"><span class="field-label" id="nt-rep-l">Repeats</span><button type="button" class="select" data-select id="nt-rep" aria-controls="nt-rep-lb" aria-labelledby="nt-rep-l nt-rep-v"><span class="select-value" id="nt-rep-v">' + REPEAT.filter(function (r) { return r[0] === f.limits.repeat; })[0][1] + '</span>' + icon('chevron-down') + '</button><div class="listbox" id="nt-rep-lb" role="listbox" aria-labelledby="nt-rep-l" hidden>' + REPEAT.map(function (r) { return '<div class="option" role="option" data-value="' + r[0] + '" aria-selected="' + (r[0] === f.limits.repeat) + '"><span class="option-main"><span class="option-label">' + r[1] + '</span></span>' + icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div></div></div>' +
      '<div class="field"><span class="field-label" id="nt-tool-l">Main tool <span class="field-opt">(optional)</span></span><button type="button" class="select" data-select id="nt-tool" aria-controls="nt-tool-lb" aria-labelledby="nt-tool-l nt-tool-v"><span class="select-value" id="nt-tool-v">' + TOOLS.filter(function (x) { return x[0] === f.tool; })[0][2] + '</span>' + icon('chevron-down') + '</button><div class="listbox" id="nt-tool-lb" role="listbox" aria-labelledby="nt-tool-l" hidden>' +
        TOOLS.map(function (x, i) { return (x[1] && (i === 0 || TOOLS[i - 1][1] !== x[1]) ? '<span class="listbox-group-label" aria-hidden="true">' + x[1] + '</span>' : '') + '<div class="option" role="option" data-value="' + x[0] + '" aria-selected="' + (x[0] === f.tool) + '"><span class="option-main"><span class="option-label">' + x[2] + '</span></span>' + icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>' +
      '<section class="ag-before" aria-labelledby="nt-before"><div class="ag-before-head"><h3 class="ag-h3" id="nt-before">Before it starts</h3><span id="nt-sum"></span></div><ul class="gate-list" id="nt-checks"></ul><div class="gate-cost ag-cost" id="nt-cost"></div><p class="gate-note">' + esc(A.walletLine()) + '</p></section>';
  }
  function renderChecks() {
    var rows = checks(), s = A.summary(rows, 'Can’t start'), block = rows.filter(function (r) { return r.kind === 'blocking'; })[0];
    $('#nt-checks', el).innerHTML = rows.map(function (r) { return A.row(r.kind, r.html, { act: r.act }); }).join(''); $('#nt-sum', el).innerHTML = A.statusHtml(s.tone, esc(s.text), { live: true });
    $('#nt-cost', el).innerHTML = cost(); $('#nt-lim-s', el).textContent = lim();
    var why = $('#nt-why', el), p = $('[data-primary]', el);
    if (why) { why.className = 'dlg-why ag-why' + (block ? ' dlg-why--danger' : ''); why.innerHTML = block ? block.html.replace(/<[^>]+>/g, '') : repeats() ? 'It runs on the schedule and messages you on WhatsApp.' : 'It starts now and messages you on WhatsApp when it needs you.'; }
    if (p) { if (block) p.setAttribute('aria-disabled', 'true'); else p.removeAttribute('aria-disabled'); p.textContent = repeats() ? 'Schedule task' : 'Start task'; }
    V.initAll($('#nt-checks', el));
  }
  function render(focusSel) {
    el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="pa-new-t">New task</h2></div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close New task">' + icon('x') + '</button></div></div>' +
      '<div class="sheet-body ag-form">' + body() + '</div><div class="sheet-foot"><p class="dlg-why ag-why" id="nt-why"></p><button class="btn btn--tertiary" type="button" data-nt="cancel">Cancel</button><button class="btn btn--primary" type="button" data-primary data-nt="start" aria-describedby="nt-why" aria-keyshortcuts="Control+Enter" data-tooltip="Start" data-kbd="mod+enter">Start task</button></div>';
    V.initAll(el); renderChecks(); countGoal();
    if (focusSel) { var n = $(focusSel, el); if (n) n.focus(); }
  }
  function countGoal() { var n = $('#nt-goal', el).value.length, c = $('#nt-goal-c', el); c.textContent = n >= 1800 ? F.count(n) + ' / 2,000' : ''; c.className = 'field-count' + (n > 2000 ? ' field-count--over' : n >= 1800 ? ' field-count--warn' : ''); }
  function dirty() { return JSON.stringify(f) !== snap; }

  N.open = function (o) {
    o = o || {}; if (A.offline) { V.announce(A.offlineReason); V.toast.info(A.offlineReason); return; }
    el = $('#pa-new'); busy = false; retried = false; key = A.idem(); f = fromPrefill(o); snap = JSON.stringify(blank());
    render();
    entry = A.openGateSheet(el, { returnTo: o.returnTo || $('#pa-new-btn'), dirty: dirty, discard: 'Discard this task? Your goal and limits will be lost.', onClose: function () { A.url.set({ 'new': null, template: null, from: null }); } });
    A.url.set({ 'new': 1, template: o.template || null, from: o.from || null });
  };
  function validLimits() {
    var ok = true, c = $('#nt-calls', el), s = $('#nt-spend', el); if (!c) return true;
    var cv = +c.value, sv = +String(s.value).replace(/[₹,\s]/g, '');
    var cm = Number.isInteger(cv) && cv >= 1 && cv <= 200 ? '' : 'Enter a number from 1 to 200.', sm = sv >= 50 && sv <= 10000 ? '' : 'Enter an amount from ₹50 to ₹10,000.';
    [[c, '#nt-calls-e', cm], [s, '#nt-spend-e', sm]].forEach(function (x) { var e = $(x[1], el); e.hidden = !x[2]; e.innerHTML = x[2] ? icon('circle-alert', 'sm') + '<span>' + x[2] + '</span>' : ''; x[0].setAttribute('aria-invalid', x[2] ? 'true' : 'false'); if (x[2] && ok) { ok = false; if (!f.editLimits) { f.editLimits = true; $('#nt-lim-f', el).hidden = false; $('[data-nt="limits"]', el).setAttribute('aria-expanded', 'true'); } x[0].focus(); } });
    return ok;
  }
  function start() {
    var g = $('#nt-goal', el), e = $('#nt-goal-e', el), p = $('[data-primary]', el); if (busy) return;
    g.value = g.value.trim(); f.goal = g.value;
    if (!f.goal) { e.hidden = false; e.innerHTML = icon('circle-alert', 'sm') + '<span>Describe the goal in a sentence.</span>'; g.setAttribute('aria-invalid', 'true'); g.focus(); return; }
    if (!validLimits()) return; if (A.blocked(p)) return;
    busy = true; entry.busy = true; p.setAttribute('aria-busy', 'true'); p.innerHTML = icon('loader-circle', null, { className: 'spinner' }) + 'Starting…'; $('.sheet-body', el).setAttribute('inert', '');
    setTimeout(function () {
      busy = false; entry.busy = false; $('.sheet-body', el).removeAttribute('inert');
      if (A.is('start-fail') && !retried) { retried = true; p.removeAttribute('aria-busy'); p.textContent = repeats() ? 'Schedule task' : 'Start task'; $('#nt-err', el).innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t start the task. Nothing was charged. <button type="button" class="btn btn--link" data-nt="start">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>POST /api/personal-agents/tasks · 503 · Idempotency-Key ' + key + '</code></div></details></div>'; $('#nt-err', el).scrollIntoView({ block: 'nearest' }); return; }
      var now = F.now().toISOString(), first = f.goal.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, ''), v = viewById(f.view);
      var t = { id: 'task_' + Date.now().toString(36), goal: first.length > 70 ? first.slice(0, 68) + '…' : first, full: f.goal, state: repeats() ? 'scheduled' : 'queued', createdBy: V.data.user.short, createdAt: now, since: now, updatedAt: now,
        progress: repeats() ? 'Next ' + REPEAT.filter(function (r) { return r[0] === f.limits.repeat; })[0][1].toLowerCase() : 'Starts in a moment · planning the steps…', contacts: f.contacts === 'me' ? { kind: 'me' } : { kind: f.contacts, label: f.contacts === 'view' ? 'Leads in ' + v.label + ' · ' + v.count : f.contacts === 'specific' ? A.plural(f.leads.length, 'lead') : 'New people it finds' },
        channels: f.contacts === 'me' ? [] : f.channels.slice(), limits: { maxCalls: +f.limits.maxCalls, spendCap: +f.limits.spendCap, finishBy: repeats() ? null : f.limits.finishBy, repeat: repeats() ? REPEAT.filter(function (r) { return r[0] === f.limits.repeat; })[0][1] : null }, used: { calls: 0, spent: 0 }, plan: [], activity: [{ at: now, icon: 'play', text: 'You started the task' }] };
      P.tasks.unshift(t); P.fresh.unshift(t.id); P.list = 'active';
      if (P.q && P.visible().indexOf(t) < 0) { P.q = ''; var sq = $('#pa-search'); if (sq) sq.value = ''; }
      A.url.set({ list: null, q: P.q.trim() || null }); snap = JSON.stringify(f); entry.close('done');
      if (!$('#pa-tabs')) P.render(); else P.update();
      if (V.bp.desktopShell()) A.taskSheet.open(t.id, null);
      else { V.toast.success('Task started', { action: { label: 'View', onClick: function () { A.taskSheet.open(t.id); } } }); var r = [$('#pa-tbody tr[data-id="' + t.id + '"]'), $('#pa-rows [data-pa-open="' + t.id + '"]')].filter(function (x) { return x && x.getClientRects().length; })[0]; if (r) r.focus(); }
      V.announce('Task started. ' + t.goal);
    }, 900);
  }

  d.addEventListener('click', function (e) {
    var b = e.target.closest('#pa-new [data-nt]'); if (!b) return; var a = b.getAttribute('data-nt');
    if (a === 'start') start(); else if (a === 'cancel') entry.close('cancel');
    else if (a === 'tpl') { var o = fromPrefill({ template: b.getAttribute('data-tpl') }); f = o; render('#nt-goal'); }
    else if (a === 'limits') { f.editLimits = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', f.editLimits); $('#nt-lim-f', el).hidden = !f.editLimits; if (f.editLimits) $('#nt-calls', el).focus(); }
    else if (a === 'include') { f.includeCalled = true; renderChecks(); V.announce('20 leads included'); }
    else if (a === 'unlead') { f.leads = f.leads.filter(function (x) { return x !== b.getAttribute('data-id'); }); render('#nt-leads-in'); }
  });
  d.addEventListener('change', function (e) {
    if (!e.target.closest || !e.target.closest('#pa-new')) return;
    if (e.target.name === 'nt-who') { f.contacts = e.target.value; if (f.contacts !== 'me' && !f.channels.length) f.channels = ['calls']; render('input[name="nt-who"]:checked'); }
    else if (e.target.name === 'nt-ch') { f.channels = $$('input[name="nt-ch"]:checked', el).map(function (x) { return x.value; }); renderChecks(); }
    else if (e.target.id === 'nt-date') { f.limits.finishBy = e.target.value ? e.target.value + 'T18:00:00+05:30' : null; renderChecks(); }
  });
  d.addEventListener('input', function (e) {
    if (!e.target.closest || !e.target.closest('#pa-new')) return; var id = e.target.id;
    if (id === 'nt-goal') { f.goal = e.target.value; countGoal(); if (f.goal.trim()) { $('#nt-goal-e', el).hidden = true; e.target.setAttribute('aria-invalid', 'false'); } }
    else if (id === 'nt-calls' || id === 'nt-spend') { var v = String(e.target.value).replace(/[₹,\s]/g, ''); if (/^\d+(\.\d+)?$/.test(v)) { f.limits[id === 'nt-calls' ? 'maxCalls' : 'spendCap'] = +v; $('#nt-cost', el).innerHTML = cost(); $('#nt-lim-s', el).textContent = lim(); } }
  });
  d.addEventListener('vaani:change', function (e) {
    var id = e.target.id; if (!id || id.indexOf('nt-') !== 0) return;
    if (id === 'nt-view') { f.view = e.detail.value; renderChecks(); }
    else if (id === 'nt-rep') { f.limits.repeat = e.detail.value; renderChecks(); }
    else if (id === 'nt-tool') f.tool = e.detail.value;
    else if (id === 'nt-leads') { if (f.leads.indexOf(e.detail.value) < 0) f.leads.push(e.detail.value); render('#nt-leads-in'); }
  });
})(window, document, window.Vaani, window.VaaniAgents);
