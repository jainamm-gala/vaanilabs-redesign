/* Vaani Labs prototype · pages/leads-gate.js — CallGate (02-components-gate §5.1, configured by 03 §6.10). Every call
   entry point opens this popover gate; nothing dials until Start (or ⌘/Ctrl+Enter). Preflight, checks, adjustments,
   cost range, wallet, choice, stale/changed/failed states, then a simulated batch that updates rows in place. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, L = w.VaaniLeads, S = L.S, DATA = V.data;
  var RATE = DATA.meta.ratePerSec || 0.04, LO = 1, HI = 2, G = null;
  var VOICE_LANGS = { vaani: ['hi', 'en', 'hi-Latn'], vikash: ['hi', 'en', 'hi-Latn'] };

  function mark(kind) { var m = { pass: ['pass', 'check', 'Passed: '], block: ['block', 'x', 'Blocking: '], adjusted: ['adjusted', 'minus', 'Adjusted: '], advisory: ['advisory', 'info', 'Note: '], warn: ['advisory-warn', 'triangle-alert', 'Warning: '], checking: ['checking', null, 'Checking: '] }[kind];
    return ['<span class="gate-mark gate-mark--' + m[0] + '"' + (kind === 'checking' ? '' : ' data-mark') + ' aria-hidden="true">' + (m[1] ? V.icon(m[1]) : V.icon('loader-circle', 'xs', { className: 'spinner' })) + '</span>', m[2]]; }
  function row(kind, text, o) {
    o = o || {}; var m = mark(kind);
    return '<li class="gate-row">' + m[0] + '<span class="gate-text' + (kind === 'checking' ? ' u-fg-2' : '') + '"><span class="sr-only">' + m[1] + '</span>' + text + (o.meta ? '<span class="gate-meta">' + o.meta + '</span>' : '') + (o.members || '') + '</span>' + (o.act ? '<span class="gate-act">' + o.act + '</span>' : '<span></span>') + '</li>';
  }
  function act(label, attr, name) { return '<button type="button" class="btn btn--link" ' + attr + (name ? ' aria-label="' + esc(name) + '"' : '') + '>' + esc(label) + '</button>'; }
  function phoneTxt(t) { return '<span class="phone-text" translate="no">' + esc(t) + '</span>'; }
  function flowName(id) { var f = L.flowById(id); return f ? esc(f.name) + ' v' + f.live.version : 'Workspace default'; }
  function hoursToday() { var ch = DATA.org.callingHours; return { open: !L.demo('gate-hours'), closes: (ch.closesAt || '7:00 pm').replace(':00', '') }; }

  /* ---------- preflight: what the server would return (checks, scope, count, cost) ---------- */
  function preflight() {
    var req = G.leads, skip = { dnc: [], sched: [], dnd: [], recent: [] }, callable = [];
    req.forEach(function (l) {
      if (l.status === 'do_not_call') skip.dnc.push(l);
      else if (S.scheduled[l.id] || (S.live[l.id] && S.live[l.id] !== 'ended') || l.liveState) skip.sched.push(l);
      else if (!G.noEstimate && l.dnd && G.mode === 'batch') skip.dnd.push(l);
      else if (!G.noEstimate && L.recentlyCalled(l) && !G.included[l.id] && G.mode === 'batch') skip.recent.push(l);
      else callable.push(l);
    });
    if (G.extraSkip) { var x = callable.pop(); if (x) skip.recent.push(x); }
    G.skip = skip; G.callable = callable; G.n = callable.length;
  }
  function checks() {
    var must = [], adj = [], know = [], hrs = hoursToday(), W = L.wallet(), single = G.mode === 'single', l0 = G.leads[0];
    var flows = {}; G.callable.forEach(function (l) { var f = G.settings.flow === 'each' ? L.effectiveFlow(l) : G.settings.flow; flows[f] = (flows[f] || 0) + 1; });
    var fids = Object.keys(flows); if (!fids.length) fids = [G.settings.flow === 'each' ? L.effectiveFlow(l0) : G.settings.flow];
    if (G.wallet0) must.push(row('block', 'Wallet is ₹0. Top up to place calls.', { act: '<a class="btn btn--link" href="billing.html?topup=1" data-vaani-action="topup">Top up</a>' }));
    if (!hrs.open && G.choice !== 'schedule') must.push(row('block', 'Outside calling hours', { meta: 'Opens 10 am IST tomorrow', act: act('Schedule', 'data-g="schedule"', 'Schedule for the next opening') }));
    var tested = DATA.flows[0].live.tested;
    must.push(row('pass', fids.length > 1 ? fids.length + ' flows are live' : '<span translate="no">' + flowName(fids[0]) + '</span> is live', { meta: fids.length > 1 ? fids.map(function (f) { return esc(flowName(f)) + ' (' + flows[f] + ')'; }).join(' · ') : fids[0] === 'flow_7c21' ? 'Test call on this version today, ' + F.time(tested.at) : '' }));
    must.push(row('pass', 'Caller ID verified', { meta: phoneTxt(DATA.org.callerId.masked) }));
    if (!G.noEstimate) {
      if (hrs.open) must.push(row('pass', 'Inside calling hours', { meta: 'Open until ' + hrs.closes + ' IST' }));
      else if (G.choice === 'schedule') must.push(row('pass', 'Scheduled inside calling hours', { meta: esc(G.whenLabel) + ' IST' }));
    }
    var low = W.state === 'low' || W.state === 'autopay-failed' || W.state === 'pending', high = Math.ceil(G.n * HI * 60 * RATE);
    if (!low && !G.wallet0) must.push(row('pass', single ? 'Wallet ' + L.money(W.balance) + ' · ' + esc(W.runway || '') : 'Wallet covers this batch'));
    if (!G.noEstimate) {
      if (single && l0.status === 'do_not_call') must.unshift(row('block', '<span translate="no">' + esc(l0.name) + '</span> is marked Do not call.', { meta: 'Calls to this lead are blocked. Change the status on the lead to call.', act: act('Open lead', 'data-g="openlead"') }));
      else if (single && l0.dnd && l0.status !== 'do_not_call') must.unshift(row('block', 'This number is on the DND list. It can’t be called for promotions.', { meta: 'Only leads with recorded consent can be called.', act: act('Open lead', 'data-g="openlead"') }));
      else if (!single && !G.skip.dnd.length) must.push(row('pass', 'DND registry: ' + F.count(G.leads.length) + ' of ' + F.count(G.leads.length) + ' clear'));
      else if (single) must.push(row('pass', 'Not on the DND list'));
    }
    /* adjusted (batch) */
    if (G.skip.dnc.length && !single) adj.push(row('adjusted', L.plural(G.skip.dnc.length, 'lead') + (G.skip.dnc.length === 1 ? ' is' : ' are') + ' marked Do not call · Skipped'));
    if (G.skip.sched.length) adj.push(row('adjusted', L.plural(G.skip.sched.length, 'lead') + (G.skip.sched.length === 1 ? ' is' : ' are') + ' already in a batch or on a call · Skipped', { meta: 'Including them would dial twice.', act: '<a class="btn btn--link" href="cockpit.html">View in Cockpit</a>' }));
    if (G.skip.dnd.length) adj.push(row('adjusted', L.plural(G.skip.dnd.length, 'lead') + (G.skip.dnd.length === 1 ? ' is' : ' are') + ' on the DND registry · Skipped', { meta: F.count(G.leads.length - G.skip.dnd.length) + ' of ' + F.count(G.leads.length) + ' clear · no recorded consent to include them' }));
    var rec = G.leads.filter(function (l) { return L.recentlyCalled(l) && l.status !== 'do_not_call' && !l.dnd && !S.scheduled[l.id] && !l.liveState; });
    if (!single && !G.noEstimate && rec.length) {
      var nSk = G.skip.recent.length, open = G.showRecent;
      var members = open ? '<ul class="gate-members">' + rec.slice(0, 5).map(function (l) { var inc = !!G.included[l.id]; return '<li><span class="u-grow" translate="no">' + esc(l.name) + '</span>' + phoneTxt(l.phone.short) + act(inc ? 'Skip' : 'Include', 'data-g="inc1" data-id="' + l.id + '"', (inc ? 'Skip ' : 'Include ') + l.name) + '</li>'; }).join('') + (rec.length > 5 ? '<li class="u-fg-3">and ' + (rec.length - 5) + ' more</li>' : '') + '</ul>' : '';
      adj.push(row(nSk ? 'adjusted' : 'pass', nSk ? L.plural(nSk, 'lead') + (nSk === 1 ? ' was' : ' were') + ' called in the last 24 h' : L.plural(rec.length, 'lead') + ' called in the last 24 h · included', { meta: (nSk ? 'Skipped to avoid a repeat call · ' : '') + '<button type="button" class="btn btn--link" data-g="members" aria-expanded="' + !!open + '">' + (open ? 'Hide' : 'Show') + ' ' + L.plural(rec.length, 'lead') + '</button>', members: members, act: nSk ? act('Include', 'data-g="incall"', 'Include ' + L.plural(nSk, 'lead') + ' called in the last 24 h') : act('Skip', 'data-g="skipall"', 'Skip leads called in the last 24 h') }));
    }
    if (single && !G.noEstimate && L.recentlyCalled(l0)) know.push(row('advisory', 'Called ' + Math.round(L.minutesAgo(l0.lastCall.at) / 60) + ' h ago', { meta: l0.callbackAt ? (L.callbackOverdue(l0) ? 'Callback overdue · was due ' : 'Callback due ') + esc(F.when(l0.callbackAt, { time: true }).toLowerCase()) : esc(l0.lastCall.outcome || '') }));
    /* good to know */
    var voice = VOICE_LANGS[G.settings.voice] || VOICE_LANGS.vaani, other = {}; G.callable.forEach(function (l) { if (l.language && voice.indexOf(l.language) < 0) other[l.language] = (other[l.language] || 0) + 1; });
    var ol = Object.keys(other); if (ol.length && G.settings.language === 'auto') { var nn = ol.reduce(function (a, k) { return a + other[k]; }, 0), names = ol.map(function (k) { return V.langByCode(k).name; });
      know.push(row('advisory', (single ? esc(l0.first) + ' prefers ' : L.plural(nn, 'lead') + ' prefer' + (nn === 1 ? 's ' : ' ')) + esc(names.slice(0, 2).join(' or ')) + (names.length > 2 ? ' and others' : '') + '. ' + (G.settings.voice === 'vikash' ? 'Vikash' : 'Vaani') + ' speaks Hindi and English.', { meta: G.kept ? 'Kept · they hear Hindi and English' : '', act: G.kept ? '' : '<span class="leads-gacts">' + act('Choose voice', 'data-g="voice"') + act('Keep', 'data-g="keep"', 'Keep Hindi and English') + '</span>' })); }
    fids.filter(function (f) { return f !== 'flow_7c21'; }).forEach(function (f) { know.push(row('advisory', 'No test call on <span translate="no">' + flowName(f) + '</span> yet', { act: '<a class="btn btn--link" href="cockpit.html">Test it…</a>' })); });
    if (low) know.push(row('warn', L.money(W.balance) + ' left · ' + esc(W.runway || 'payment pending'), { act: '<a class="btn btn--link" href="billing.html?topup=1" data-vaani-action="topup">Top up</a>' }));
    if (!low && high > W.balance && !G.wallet0) know.push(row('warn', 'Wallet covers about ' + Math.floor(W.balance / (HI * 60 * RATE)) + ' of ' + G.n + ' calls. Calls pause at ₹0.', { act: '<a class="btn btn--link" href="billing.html?topup=1" data-vaani-action="topup">Top up</a>' }));
    if (G.noEstimate) know.push(row('advisory', 'Calling hours, DND and recent calls aren’t checked here yet.'));
    return { must: must, adj: adj, know: know, blocked: must.some(function (h) { return h.indexOf('gate-mark--block') >= 0; }) };
  }

  /* ---------- render ---------- */
  function sel(id, label, value, opts) {
    return '<div class="field"><span class="field-label" id="' + id + '-l">' + esc(label) + '</span><button type="button" class="select select--sm" data-select aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v" data-gset="' + id + '"><span class="select-value" id="' + id + '-v">' + esc((opts.filter(function (o) { return o[0] === value; })[0] || opts[0])[1]) + '</span>' + V.icon('chevron-down') + '</button>' +
      '<div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === value) + '"' + (o[3] ? ' aria-disabled="true"' : '') + '><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span>' + (o[2] ? '<span class="option-desc">' + esc(o[2]) + '</span>' : '') + '</span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div></div>';
  }
  function scopeLine() {
    var st = G.settings, flowTxt = st.flow === 'each' ? 'Uses each lead’s flow' : flowName(st.flow);
    return flowTxt + ' · ' + (st.voice === 'vikash' ? 'Vikash' : 'Vaani') + ' · ' + (st.language === 'auto' ? 'Auto language' : V.langByCode(st.language).name) + ' · Caller ID ' + phoneTxt(DATA.org.callerId.masked.replace('+91 80 ', ''));
  }
  function scheduleSlots() {
    var days = [], now = Date.parse(DATA.meta.now);
    for (var k = 0; k < 7; k++) { var iso = DATA._util.ist(-k, '00:00'), wd = F.weekday(iso), open = wd === 'Sun' ? [11, 17] : [10, 19], label = k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : wd + ' ' + F.dateShort(iso), times = [];
      for (var h = open[0]; h < open[1]; h++) ['00', '30'].forEach(function (m) { var t = DATA._util.ist(-k, (h < 10 ? '0' : '') + h + ':' + m); if (Date.parse(t) > now + 15 * 60000) times.push([t, F.time(t)]); });
      if (times.length) days.push([String(k), label, times]); }
    return days;
  }
  function render() {
    var single = G.mode === 'single', l0 = G.leads[0], body = $('#leads-gate-body'), checking = G.phase === 'checking';
    /* R3D-07 (gate §1.4): the title names what was asked; skips are explained in the rows and the why-text */
    $('#leads-gate-t').innerHTML = single ? 'Call <span translate="no">' + esc(l0.name) + '</span>' : 'Call ' + esc(L.plural(G.leads.length, 'lead'));
    $('#leads-gate-cons').textContent = single ? 'Their phone rings when you place the call.' : 'Nothing dials until you start.';
    renderFresh();
    var h = '';
    if (G.phase === 'failed') h += '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>' + (single ? 'Couldn’t reach the phone line. The call was not placed and you were not charged.' : 'Couldn’t start the calls. Nothing was dialled.') + ' ' + act('Retry', 'data-g="retry"') + '</span></div><details class="details"><summary>Details</summary><div class="raw"><code>request_id: req_' + G.key.slice(0, 6) + ' · 503 upstream timeout · idempotency key kept</code></div></details></div>';
    if (G.changed) h += '<div class="notice notice--warning" role="status">' + V.icon('triangle-alert') + '<span class="notice-body">Checks changed since you opened this. Review and ' + (single ? 'place the call' : 'start') + ' again.</span></div>';
    h += '<div class="gate-scope"><span><span class="u-fg-3">Settings</span> ' + scopeLine() + '</span><button type="button" class="btn btn--tertiary btn--sm" data-g="change" aria-expanded="' + !!G.edit + '" aria-controls="leads-gate-edit">Change' + V.icon(G.edit ? 'chevron-up' : 'chevron-down', 'sm') + '</button></div>';
    if (G.edit) h += '<div class="leads-gate-edit" id="leads-gate-edit">' +
      sel('lg-flow', 'Flow', G.settings.flow, (single ? [] : [['each', 'Use each lead’s flow', 'Site-visit qualifier v7 unless a lead has its own']]).concat(DATA.flows.filter(function (f) { return f.status === 'live'; }).map(function (f) { return [f.id, f.name + ' v' + f.live.version, 'Live']; }))) +
      sel('lg-voice', 'Voice', G.settings.voice, DATA.voices.map(function (v) { return [v.id, v.name, v.descriptor, !v.available]; })) +
      sel('lg-lang', 'Language', G.settings.language, [['auto', 'Auto: each lead’s language, else Hindi and English'], ['hi', 'Hindi'], ['en', 'English'], ['hi-Latn', 'Hinglish']]) +
      sel('lg-cid', 'Caller ID', 'cid', [['cid', DATA.org.callerId.masked + ' · verified']]) + '<p class="gate-note">Changes apply to this ' + (single ? 'call' : 'batch') + ' only.</p></div>';
    var c = checking ? null : checks(); G.blocked = c && c.blocked;
    var sum = checking ? '<span class="gate-sum">' + V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Checking ' + (single ? '' : L.plural(G.leads.length, 'lead')) + '…</span>' : summary(c);
    h += '<div class="gate-group"><span>Must pass</span><span id="leads-gate-sum" tabindex="-1">' + sum + '</span></div>';
    if (checking) h += '<ul class="gate-list">' + ['Flow is live', 'Caller ID', 'Calling hours', 'Wallet', single ? 'DND registry' : 'DND registry and recent calls'].map(function (t) { return row('checking', 'Checking ' + t.toLowerCase() + '…'); }).join('') + '</ul>';
    else { h += '<ul class="gate-list">' + c.must.join('') + '</ul>'; if (c.adj.length) h += '<div class="gate-group">Adjusted</div><ul class="gate-list">' + c.adj.join('') + '</ul>'; if (c.know.length) h += '<div class="gate-group">Good to know</div><ul class="gate-list">' + c.know.join('') + '</ul>'; }
    var n = checking ? G.leads.length : G.n, low = Math.floor(n * LO * 60 * RATE), high = Math.ceil(n * HI * 60 * RATE), W = L.wallet();
    h += G.noEstimate ? '<div class="gate-cost"><span>' + esc(L.plural(n, 'call')) + '</span><b>Rate ₹' + RATE + '/s</b></div><p class="gate-note">Wallet ' + L.money(W.balance) + '</p>'
      : !n ? '<div class="gate-cost"><span>No calls to place</span></div>' : '<div class="gate-cost"><span>' + esc(L.plural(n, 'call')) + ' · about ' + LO + ' to ' + HI + ' min' + (n > 1 ? ' each' : '') + '</span><b class="u-nowrap">₹' + F.count(low) + ' to ₹' + F.count(high) + '</b></div><p class="gate-note">Wallet ' + L.money(W.balance) + (W.runway ? ' · ' + esc(W.runway) + (/calls$/.test(W.runway) ? '' : ' of calls') : '') + '</p>';
    h += '<div class="gate-choice" role="radiogroup" aria-label="When"><label class="rcard"><input type="radio" class="radio" name="lg-when" value="now"' + (G.choice === 'now' ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">' + (single ? 'Place now' : 'Place now') + '</span><span class="rcard-desc">' + (hoursToday().open ? (single ? 'Rings within a few seconds' : 'Calls start in order within a minute') : 'Outside calling hours') + '</span></span></label>' +
      '<label class="rcard"><input type="radio" class="radio" name="lg-when" value="schedule"' + (G.choice === 'schedule' ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">Schedule…</span><span class="rcard-desc">Pick a time inside calling hours</span></span></label></div>';
    if (G.choice === 'schedule') { var days = scheduleSlots(), day = days.filter(function (x) { return x[0] === G.day; })[0] || days[0]; G.day = day[0]; if (!day[2].some(function (t) { return t[0] === G.time; })) G.time = day[2][0][0]; G.whenLabel = (day[1] === 'Today' || day[1] === 'Tomorrow' ? day[1] + ', ' : day[1] + ', ') + F.time(G.time);
      h += '<div class="leads-gate-when">' + sel('lg-day', 'Day', G.day, days.map(function (x) { return [x[0], x[1]]; })) + sel('lg-time', 'Time (IST)', G.time, day[2].map(function (t) { return [t[0], t[1]]; })) + '</div>'; }
    body.innerHTML = h; V.initAll(body);
    var go = $('#leads-gate-go'), why = $('#leads-gate-why'), schedule = G.choice === 'schedule';
    var label = single ? (schedule ? 'Schedule call' : 'Place call') : (!n && !checking ? 'Start calls' : schedule ? 'Schedule ' + L.plural(n, 'call') : 'Start ' + L.plural(n, 'call'));
    var reason = checking ? 'Checking…' : G.blocked ? blockSentence() : G.n === 0 ? 'All ' + L.plural(G.leads.length, 'lead') + ' were skipped. Include some, or cancel.' : schedule ? 'Calls start at ' + G.whenLabel + ' IST.' : single ? 'Their phone rings within a few seconds.' : 'Calls start in order within a minute.';
    if (G.phase === 'confirming') { go.innerHTML = V.icon('loader-circle', 'md', { className: 'spinner' }) + (single ? 'Placing call…' : 'Starting…'); go.setAttribute('aria-busy', 'true'); }
    else { go.innerHTML = V.icon('phone') + esc(label); go.removeAttribute('aria-busy'); }
    var off = checking || G.blocked || G.n === 0 || G.phase === 'confirming';
    if (off) go.setAttribute('aria-disabled', 'true'); else go.removeAttribute('aria-disabled');
    go.setAttribute('data-tooltip', label); go.setAttribute('data-kbd', 'mod+enter');
    why.textContent = reason; why.classList.toggle('u-fg-danger', !!(G.blocked || (G.n === 0 && !checking)));
    $('[data-gate-cancel]').setAttribute('aria-disabled', G.phase === 'confirming' ? 'true' : 'false');
    body.inert = G.phase === 'confirming';
    if (G.entry && !G.entry.closed && G.entry.reposition) G.entry.reposition();
  }
  function blockSentence() { return G.wallet0 ? 'Wallet is ₹0. Top up to place calls.' : !hoursToday().open && G.choice !== 'schedule' ? 'Calls can’t start outside calling hours.' : 'This number is on the DND list. It can’t be called for promotions.'; }
  function summary(c) {
    if (c.blocked) { var nb = c.must.filter(function (x) { return x.indexOf('gate-mark--block') >= 0; }).length; return '<span class="gate-sum gate-sum--blocked">' + V.icon('circle-x', 'sm') + 'Phone calls blocked · ' + nb + ' thing' + (nb === 1 ? '' : 's') + ' to fix</span>'; }
    var skipped = G.leads.length - G.n, know = c.know.length;
    var t = G.mode === 'batch' ? (skipped ? L.plural(G.n, 'call') + ' ready · ' + L.plural(skipped, 'lead') + ' skipped' : know ? 'Ready · ' + know + ' thing' + (know === 1 ? '' : 's') + ' to know' : 'All ' + c.must.length + ' checks pass') : know ? 'Ready · ' + know + ' thing' + (know === 1 ? '' : 's') + ' to know' : 'Ready';
    return '<span class="gate-sum gate-sum--' + (G.n ? 'ok' : 'warn') + '">' + V.icon(G.n ? 'check' : 'triangle-alert', 'sm') + esc(G.n ? t : 'All leads skipped') + '</span>';
  }
  function announceSummary() { var s = $('#leads-gate-sum'); if (s) V.announce(s.textContent.replace(' · ', '. ') + '.', { dedupeKey: 'gate' }); }
  function renderFresh() {
    var mins = Math.floor((Date.now() - G.checkedAt) / 60000) + (L.demo('gate-stale') ? 2 : 0), stale = mins >= 2;
    G.stale = stale; $('#leads-gate-fresh').innerHTML = G.phase === 'checking' ? 'Checking…' : mins < 1 ? 'Checked just now' : 'Checked ' + mins + ' min ago' + (stale ? ' · <button type="button" class="btn btn--link" data-g="recheck">Recheck</button>' : '');
  }
  function check(then) { G.phase = 'checking'; render(); clearTimeout(G.t); G.t = setTimeout(function () { preflight(); G.phase = 'ready'; G.checkedAt = Date.now(); render(); announceSummary(); if (then) then(); }, G.first ? 700 : 350); G.first = false; }

  /* ---------- confirm: token freshness, Changed, Confirming, Failed, Done ---------- */
  function confirm() {
    var go = $('#leads-gate-go');
    if (go.getAttribute('aria-disabled') === 'true') { V.announce($('#leads-gate-why').textContent, { dedupeKey: 'gatewhy' }); return; }
    if (G.stale) { check(function () { if (L.demo('gate-changed') && !G.changedOnce) return toChanged(); confirm(); }); return; }
    if (L.demo('gate-changed') && !G.changedOnce) return toChanged();
    G.phase = 'confirming'; G.entry.busy = true; render();
    setTimeout(function () {
      G.entry.busy = false;
      if (L.demo('gate-fail') && !G.failedOnce) { G.failedOnce = true; G.phase = 'failed'; render(); /* the InlineError (role=alert) is the one announcement (R2C-07) */ $('#leads-gate-go').focus(); return; }
      done();
    }, 900);
  }
  function toChanged() { G.changedOnce = true; G.changed = true; G.extraSkip = G.mode === 'batch' && G.n > 1; preflight(); G.phase = 'ready'; G.checkedAt = Date.now(); render(); var s = $('#leads-gate-sum'); if (s) s.focus(); announceSummary(); }
  function done() {
    var list = G.callable.slice(), single = G.mode === 'single', schedule = G.choice === 'schedule', whenLabel = G.whenLabel, entry = G.entry, trigger = G.trigger;
    if (!single) { var r = $('#leads-tbody tr[tabindex="0"]'); if (!trigger || !d.contains(trigger) || trigger.closest('#leads-bulk')) entry.returnTo = G.returnTo && d.contains(G.returnTo) && !G.returnTo.closest('#leads-bulk') ? G.returnTo : (r || $('#page-title')); }
    else if (G.returnTo) entry.returnTo = G.returnTo;
    G.phase = 'done'; V.popover.close('leads-gate');
    if (!single) { L.clearSelection(); if (S.selectMode) L.setSelectMode(false); }
    if (schedule) { list.forEach(function (l) { S.scheduled[l.id] = whenLabel; }); L.render();
      V.toast.success((single ? 'Call to ' + list[0].name + ' scheduled' : L.plural(list.length, 'call') + ' scheduled') + ' for ' + whenLabel + ' IST', { action: { label: 'View in Cockpit', onClick: function () { w.location.href = 'cockpit.html'; } } });
      V.announce(single ? 'Call scheduled.' : L.plural(list.length, 'call') + ' scheduled. Selection cleared.'); return; }
    L.render();
    if (single) V.toast.success('Calling ' + list[0].name, { action: { label: 'Open in Cockpit', onClick: function () { w.location.href = 'cockpit.html'; } } });
    V.announce(single ? 'Dialling ' + list[0].name + '.' : L.plural(list.length, 'call') + ' scheduled. Selection cleared.');
    simulate(list, single, resultsHref(list));
  }
  /* "View results" (03 §6.10 Done): Call reports filtered to this batch. batch= is the batch’s id (the API’s filter); the
     prototype ledger has no batch field, so today’s outbound calls on the batch’s flow are the nearest filter it can show. */
  function resultsHref(list) {
    var fl = {}; list.forEach(function (l) { fl[G.settings.flow === 'each' ? L.effectiveFlow(l) : G.settings.flow] = 1; });
    var ids = Object.keys(fl), f = ids.length === 1 ? L.flowById(ids[0]) : null;
    return 'call-reports.html?when=today&f.direction=outbound' + (f && f.live ? '&f.flow=' + f.id + '@' + f.live.version : '') + '&batch=b_' + G.key.slice(0, 8);
  }

  /* ---------- a batch in progress: rows change in place, a progress toast, then the result ---------- */
  var OUT = [['completed', 'Interested', 'interested'], ['completed', 'Visit booked', 'interested'], ['no_answer', 'No answer', 'not_reached'], ['completed', 'Call later', 'callback_due'], ['completed', 'Talked', 'contacted'], ['busy', 'Busy', 'not_reached'], ['completed', 'Not interested', 'not_interested']];
  function simulate(list, single, href) {
    var placed = 0, finished = 0, interested = 0, total = list.length, toast = single ? null : V.toast.progress('Starting ' + L.plural(total, 'call'), { value: 0, action: { label: 'View in Cockpit', onClick: function () { w.location.href = 'cockpit.html'; } } });
    var conc = Math.min(3, total), idx = 0, base = (DATA.state || {}).liveCalls || 0;
    /* the Baseline says what is running: 'Batch · 3 of 8 placed' for a batch, one more call in progress for a single call */
    function chrome(done) { if (single) V.baseline.facts({ liveCalls: done ? null : base + 1 }); else { V.baseline.facts({ batch: done ? null : { placed: placed, total: total } }); V.baseline.set(done ? null : 'batch'); } }
    function step(l, k) {
      S.live[l.id] = 'dialling'; L.updateLeadCells(l.id); placed += 1; chrome(false); if (toast) toast.update({ message: 'Starting ' + L.plural(total, 'call') + ' · ' + placed + ' of ' + total + ' placed', value: Math.round(placed / total * 100) });
      setTimeout(function () { S.live[l.id] = 'ringing'; L.updateLeadCells(l.id); }, 900);
      var o = OUT[(l.no + k) % OUT.length], answered = o[0] === 'completed';
      setTimeout(function () { if (answered) { S.live[l.id] = 'live'; L.updateLeadCells(l.id); } }, 2000);
      setTimeout(function () {
        S.live[l.id] = 'ended'; l.lastCall = { result: o[0], outcome: o[1], at: DATA.meta.now }; l.calls += 1; if (answered) l.reached = true; if (l.status !== 'converted') l.status = o[2]; if (o[2] === 'interested') interested += 1;
        delete S.live[l.id]; L.updateLeadCells(l.id); if (L.refreshSheet && S.leadId === l.id) L.refreshSheet(); finished += 1;
        if (idx < total) { step(list[idx], idx); idx += 1; }
        if (finished === total) { chrome(true); if (toast) toast.dismiss(); if (single) V.toast.info('Call with ' + l.name + ' ended · ' + o[1], { action: { label: 'Open call report', onClick: function () { w.location.href = L.reportHref({ at: DATA.meta.now }); } } });
          else V.toast.success(L.plural(total, 'call') + ' finished · ' + interested + ' interested', { action: { label: 'View results', onClick: function () { w.location.href = href; } } }); }
      }, answered ? 4200 + (k % 3) * 700 : 3000);
    }
    for (; idx < conc; idx++) step(list[idx], idx);
  }

  /* ---------- open ---------- */
  L.openGate = function (o) {
    var blk = L.globalBlocker(); if (blk) { L.blockedActivation(blk); return; }
    if (V.overlays.top() && V.overlays.top().el && V.overlays.top().el.id === 'leads-gate') return;
    var leads = o.leads.filter(Boolean); if (!leads.length) return;
    var flowsUsed = {}; leads.forEach(function (l) { flowsUsed[L.effectiveFlow(l)] = 1; });
    G = { mode: o.mode === 'single' || leads.length === 1 && o.mode !== 'batch' ? 'single' : o.mode, leads: leads, trigger: o.trigger, returnTo: o.returnTo, included: {}, kept: false, edit: false, choice: hoursToday().open ? 'now' : 'schedule', day: hoursToday().open ? '0' : '1', time: null, phase: 'checking', first: true, checkedAt: Date.now(),
      key: (Date.now().toString(16) + Math.random().toString(16).slice(2)).slice(0, 16), noEstimate: L.demo('gate-estimate'),
      settings: { flow: o.mode === 'single' || Object.keys(flowsUsed).length === 1 ? L.effectiveFlow(leads[0]) : 'each', voice: 'vaani', language: 'auto' } };
    if (!hoursToday().open) G.choice = 'now';
    preflight(); render();
    var fromFoot = o.trigger && (o.trigger.closest('#leads-bulk') || o.trigger.closest('.sheet-foot'));
    G.placement = fromFoot ? 'top-end' : 'bottom-end';
    G.entry = V.popover.open(o.trigger, 'leads-gate', { placement: G.placement, onClose: function () { clearTimeout(G.t); clearInterval(G.fresh); } });
    if (o.returnTo) G.entry.returnTo = o.returnTo;
    check(); G.fresh = setInterval(function () { if (G && G.phase !== 'checking') renderFresh(); }, 30000);
    if (L.demo('gate-wallet0')) setTimeout(function () { if (G && G.phase === 'ready') { G.wallet0 = true; render(); announceSummary(); } }, 2200);
  };

  L.initGate = function () {
    var gate = $('#leads-gate');
    gate.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g],[data-gate-close],[data-gate-cancel],#leads-gate-go'); if (!b || !G) return;
      if (b.id === 'leads-gate-go') { confirm(); return; }
      if (b.hasAttribute('data-gate-close') || b.hasAttribute('data-gate-cancel')) { if (b.getAttribute('aria-disabled') === 'true' || G.phase === 'confirming') return; V.popover.close('leads-gate'); return; }
      var k = b.getAttribute('data-g');
      if (k === 'change') { G.edit = !G.edit; render(); $('[data-g="change"]', gate).focus(); }
      else if (k === 'schedule') { G.choice = 'schedule'; G.day = '1'; render(); announceSummary(); var r = $('input[value="schedule"]', gate); if (r) r.focus(); }
      else if (k === 'incall') { G.skip.recent.forEach(function (l) { G.included[l.id] = 1; }); G.extraSkip = false; check(function () { var x = $('[data-g="skipall"]', gate); if (x) x.focus(); }); }
      else if (k === 'skipall') { G.included = {}; check(function () { var x = $('[data-g="incall"]', gate); if (x) x.focus(); }); }
      else if (k === 'inc1') { var id = b.getAttribute('data-id'); if (G.included[id]) delete G.included[id]; else G.included[id] = 1; preflight(); render(); announceSummary(); var x2 = $('[data-g="inc1"][data-id="' + id + '"]', gate); if (x2) x2.focus(); }
      else if (k === 'members') { G.showRecent = !G.showRecent; render(); $('[data-g="members"]', gate).focus(); }
      else if (k === 'voice') { G.edit = true; render(); var v = $('[data-gset="lg-voice"]', gate); if (v) v.focus(); }
      else if (k === 'keep') { G.kept = true; render(); var s = $('#leads-gate-sum'); if (s) s.focus(); }
      else if (k === 'recheck') { check(function () { var t = $('#leads-gate-t'); if (t) t.focus(); }); }
      else if (k === 'retry') { G.phase = 'ready'; confirm(); }
      else if (k === 'openlead') { var l = G.leads[0]; V.popover.close('leads-gate'); L.openLead(l.id); }
    });
    gate.addEventListener('change', function (e) { if (e.target.name === 'lg-when' && G) { G.choice = e.target.value; render(); announceSummary(); var r = $('input[name="lg-when"][value="' + G.choice + '"]', gate); if (r) r.focus(); } });
    gate.addEventListener('vaani:change', function (e) {
      if (!G) return; var id = e.target.getAttribute('data-gset'), v = e.detail.value, st = G.settings;
      if (id === 'lg-flow') st.flow = v; else if (id === 'lg-voice') st.voice = v; else if (id === 'lg-lang') st.language = v; else if (id === 'lg-day') { G.day = v; G.time = null; } else if (id === 'lg-time') G.time = v; else return;
      var refocus = function () { var t = $('[data-gset="' + id + '"]', gate); if (t) t.focus(); };
      if (id === 'lg-day' || id === 'lg-time') { render(); refocus(); } else setTimeout(function () { check(refocus); }, 300);
    });
    gate.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.stopPropagation(); confirm(); } });
    if (U.isMac) $('#leads-gate-go').setAttribute('aria-keyshortcuts', 'Meta+Enter');
  };
})(window, document);
