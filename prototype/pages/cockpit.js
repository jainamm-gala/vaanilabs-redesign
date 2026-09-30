/* Vaani Labs prototype · Cockpit · page boot (03-pages/01-agent-cockpit.md). The PageHeader (computed meta, CallSwitcher,
   New call), the one page notice (ConnectionBar or WalletNotice), selection and panes, the delegated actions, shortcuts
   (/ · C · M · F6 · ⌘/Ctrl+F), leave guards while the microphone is in use, the Prototype states menu, and the ticker. */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit, V = w.Vaani, st = CK.st, esc = CK.esc, C = CK.call;

  /* ---------- PageHeader: H1 "Cockpit", meta of computed facts, actions only while a call is shown ---------- */
  CK.header = function () {
    /* One count (C.live: Dialling, Ringing, Live, On hold) for the meta, the CallSwitcher, "Live now" and the nav badge (CK §3.1–3.2). */
    var meta = d.getElementById('ck-meta'), n = C.live().length, next = (CK.list.batches || CK.D.upNext || []).length;
    if (st.loading) meta.innerHTML = '<span class="sk sk--meta ck-sk-meta" aria-hidden="true"></span><span class="sr-only">Checking calls…</span>';
    else meta.textContent = (n ? n + ' live ' + (n === 1 ? 'call' : 'calls') : 'No calls in progress') + (next ? ' · ' + next + ' up next' : '');
    d.getElementById('ck-switcher-label').textContent = st.loading ? 'Calls' : 'Calls · ' + (n ? n + ' live' : 'none live');
    d.getElementById('ck-new-btn').hidden = st.selected === 'new';
  };
  /* ---------- the one page notice: offline first, then the WalletNotice (a spending page) ---------- */
  var LIVE_GOES_ON = 'Calls that are already live continue on the phone line.';
  CK.notice = function () {
    var box = d.getElementById('ck-notice'), html = '', ws = st.wallet, dismissed = CK.session.get('wallet-dismissed') === ws;
    /* Offline: the shell’s ConnectionBar (a real 'offline' event puts it at the top of main) is the one bar; this page only
       adds its sentence to it. Without a shell bar (?demo=offline) the page shows the same bar in its notice slot. */
    var shellBar = d.querySelector('#main > .cbar');
    if (!st.online) {
      if (shellBar) { if (!shellBar.querySelector('.ck-cbar-more')) { var sp = shellBar.querySelector('span') || shellBar; sp.insertAdjacentHTML('beforeend', '<span class="ck-cbar-more"> ' + LIVE_GOES_ON + '</span>'); } }
      else html = '<div class="cbar" role="status">' + V.icon('cloud-off') + '<span><b>You’re offline.</b> Showing data from ' + esc(V.fmt.time(CK.nowIso())) + '. ' + LIVE_GOES_ON + '</span></div>';
    }
    else if (!dismissed && (ws === 'empty' || ws === 'low' || ws === 'autopay-failed' || ws === 'pending')) {
      var N = { empty: ['warning', 'Wallet is ₹0.', 'Phone calls are paused. Browser tests and free meeting minutes still work.', 'Wallet ₹0 · calls paused', [['Top up', 'topup']]],
        low: ['warning', 'Wallet is low.', '₹42.10 left, about 17 min of calls.', 'Wallet ₹42 · 17 min', [['Top up', 'topup'], ['Turn on autopay', 'autopay']]],
        'autopay-failed': ['danger', 'Autopay couldn’t top up.', 'Your UPI mandate was declined. Calls pause at ₹0.', 'Autopay failed', [['Fix autopay', 'autopay']]],
        pending: ['info', 'Payment pending.', 'Your wallet updates when UPI confirms.', 'Payment pending', []] }[ws];
      html = '<div class="notice notice--' + N[0] + '" role="status">' + V.icon(N[0] === 'info' ? 'info' : 'triangle-alert') + '<div class="notice-body"><span class="u-hide-phone"><b class="notice-title">' + N[1] + '</b> ' + N[2] + '</span><span class="u-only-phone"><b class="notice-title">' + N[3] + '</b></span></div>' +
        (N[4].length ? '<div class="notice-acts">' + N[4].map(function (a, i) { return '<button type="button" class="notice-act' + (i ? ' u-hide-below-lg' : '') + '" data-ck-act="' + a[1] + '">' + a[0] + '</button>'; }).join('') + '</div>' : '') +
        '<button type="button" class="ibtn ibtn--sm" data-ck-act="dismiss-wallet" aria-label="Dismiss wallet notice">' + V.icon('x', 'sm') + '</button></div>';
    }
    box.innerHTML = html; box.hidden = !html;
    if (!st.online) box.setAttribute('data-bar', ''); else box.removeAttribute('data-bar');
  };
  /* ---------- selection: the card and the transcript swap content; the frame never moves (D5) ---------- */
  CK.select = function (id, o) {
    o = o || {};
    var c = id === 'new' ? null : (C.byId(id) || CK.recentCall(id));
    if (id !== 'new' && !c) id = 'new';
    st.selected = id;
    CK.url({ call: id === 'new' ? null : id });
    d.getElementById('ck-body').setAttribute('data-mode', id === 'new' ? 'new' : 'call');
    if (id === 'new') { CK.newcall.render(); CK.title(null); } else CK.cardView.render(c);
    CK.feed.render(); CK.list.render(); CK.header(); CK.setPane(st.pane, true);
    if (o.focus) CK.focus(d.getElementById(id === 'new' ? 'ck-card-h' : 'ck-call-h'));
  };
  CK.setPane = function (p, quiet) {
    st.pane = p === 'transcript' ? 'transcript' : 'call';
    d.getElementById('ck-body').setAttribute('data-pane', st.pane);
    if (!quiet) { CK.url({ tab: st.pane === 'transcript' ? 'transcript' : null }); var c = C.byId(st.selected); if (c && st.pane === 'transcript') { c.newTurns = 0; CK.feed.toBottom(false); } }
    CK.$$('.ck-panes [role="radio"]').forEach(function (r) { r.setAttribute('aria-checked', r.getAttribute('data-value') === st.pane ? 'true' : 'false'); r.setAttribute('tabindex', r.getAttribute('data-value') === st.pane ? '0' : '-1'); });
  };

  /* ---------- delegated actions: readiness rows, notices, the call controls ---------- */
  CK.act = function (run, el) {
    if (run === 'topup') { if (CK.gate.isOpen()) CK.gate.close('navigate'); V.openTopUp('cockpit'); }
    else if (run === 'autopay') w.location.href = 'billing.html#autopay';
    else if (run === 'dismiss-wallet') { CK.session.set('wallet-dismissed', st.wallet); CK.notice(); CK.focus(d.getElementById('page-title')); }
    else if (run === 'retry-wallet') { st.walletUnknown = false; CK.demo.partial = false; CK.newcall.sync(); V.announce('Wallet checked. ' + CK.walletLine() + '.'); }
    else if (run === 'retry-flows') { CK.demo['flows-failed'] = false; CK.newcall.render(); V.announce('Flows loaded.'); }
    else if (run === 'retry-mic') { st.mic = 'prompt'; CK.demo['mic-blocked'] = false; CK.newcall.sync(); V.announce('Microphone allowed.'); }
    else if (run === 'ask-admin') V.toast.info('Request copied. Paste it to an admin: "Please let me place phone calls in Sample Realty."');
    else if (run === 'use-live') { st.revPick = 'live'; CK.url({ rev: null }); CK.newcall.sync(); V.announce('Using the live version.'); }
    else if (run === 'use-self') { CK.newcall.setTarget({ kind: 'self' }); d.getElementById('ck-call').focus(); }
    else if (run === 'talk') d.getElementById('ck-talk').click();
    else if (run === 'open-gate') CK.newcall.tryCall(d.getElementById('ck-call'));
    else if (run === 'schedule') CK.gate.schedule();
    else if (run === 'default-flow') CK.pickers.makeDefault('flow');
    else if (run === 'default-voice') CK.pickers.makeDefault('voice');
    else if (run.indexOf('open-call:') === 0) CK.select(run.slice(10), { focus: true });
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-ck-act]'); if (a) { e.preventDefault(); CK.act(a.getAttribute('data-ck-act'), a); return; }
    var cc = e.target.closest('[data-cc]'); if (!cc || !d.getElementById('ck-card').contains(cc)) return;
    if (cc.getAttribute('aria-disabled') === 'true') { V.announce(cc.getAttribute('data-tooltip') || 'Not available'); return; }
    var c = C.byId(st.selected) || CK.recentCall(st.selected), k = cc.getAttribute('data-cc');
    if (k === 'end') C.end(c, true);
    else if (k === 'takeover') C.takeOver(c);
    else if (k === 'mute') C.mute(c);
    else if (k === 'transfer') CK.cardView.openTransfer(c, cc);
    else if (k === 'save') CK.cardView.save(c);
    else if (k === 'skip') { c.wrap = null; c.state = 'ended'; V.announce('Skipped. ' + (c.lead ? c.lead.name + ' was not changed.' : 'Nothing was saved.')); CK.newcall.setTarget(null, { silent: true }); CK.select('new', { focus: true }); }
    else if (k === 'retry' || k === 'again') { var lead = c.lead; CK.select('new'); CK.newcall.setTarget(lead ? { kind: 'lead', lead: lead } : null, { silent: true }); if (k === 'retry') CK.newcall.tryCall(d.getElementById('ck-call')); else d.getElementById('ck-call').focus(); }
    else if (k === 'talk') { CK.select('new'); d.getElementById('ck-talk').click(); }
    else if (k === 'callself') { CK.select('new'); CK.newcall.setTarget({ kind: 'self' }, { silent: true }); CK.newcall.tryCall(d.getElementById('ck-call')); }
    else if (k === 'new') CK.select('new', { focus: true });
    else if (k === 'check') { V.toast.info('Asked the phone line for the latest status. Still ringing with no answer.'); }
  });
  d.addEventListener('vaani:menuselect', function (e) {
    var v = e.detail.value;
    if (v === 'download') CK.feed.download();
    else if (v === 'aloud') { CK.readAloud = e.detail.checked; V.util.store.set('vaani:cockpit:aloud', e.detail.checked ? 'on' : 'off'); V.announce(e.detail.checked ? 'New turns will be read aloud.' : 'New turns will not be read aloud.'); }
    else if (v === 'transfer') { var c = C.byId(st.selected); if (!c) return; if (!st.online) { V.announce('You’re offline. The call continues on the phone line. Try again when you reconnect.'); return; } CK.cardView.openTransfer(c, d.querySelector('.ck-controls [aria-controls="ck-bar-menu"]')); }
  });
  d.getElementById('ck-new-btn').addEventListener('click', function () { CK.select('new', { focus: true }); });

  /* ---------- leaving while your microphone is in use (Browser test or Take over) ---------- */
  w.addEventListener('beforeunload', function (e) { if (st.micSession) { e.preventDefault(); e.returnValue = ''; } });
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (!a || !st.micSession || a.target === '_blank' || e.defaultPrevented || a.getAttribute('href').charAt(0) === '#') return;
    e.preventDefault();
    V.dialog.confirm({ title: 'Leave the Cockpit?', body: st.micSession === 'this browser test' ? 'Your browser test ends when you leave.' : 'Your microphone stops when you leave. Vaani takes the call back.', confirmLabel: st.micSession === 'this browser test' ? 'Leave and end test' : 'Leave and hand back', tone: 'danger', focusCancel: true, returnTo: a })
      .then(function (ok) { if (ok) { st.micSession = null; w.location.href = a.href; } });
  }, true);

  /* ---------- shortcuts (CK §4.3): single keys follow the account switch and never fire in fields ---------- */
  V.shortcuts.register('/', function () { if (st.selected !== 'new') CK.select('new'); var el = d.getElementById('ck-contact'); if (!el) return false; el.focus(); }, { description: 'Focus the Contact field', group: 'Everywhere' });
  V.shortcuts.register('c', function () { if (st.selected !== 'new') CK.select('new'); var b = d.getElementById('ck-call'); if (!b) return false; CK.newcall.tryCall(b, true); }, { description: 'Open the Call gate (never dials)', group: 'Everywhere' });
  V.shortcuts.register('m', function () { var c = C.byId(st.selected); if (!c || !C.active(c) || !(c.kind === 'browser' || c.takenOver)) return false; C.mute(c); }, { description: 'Mute or unmute your microphone (browser test or take over)', group: 'Everywhere' });
  V.shortcuts.register('mod+f', function () { CK.feed.openSearch(); }, { description: 'Search the transcript', scope: 'ck-tx', inFields: false });
  function regions() {
    var nav = CK.$$('.app > .sb, .app > .rail, .app > .topbar, .app > .bbar').filter(V.util.visible)[0];
    return [nav, d.getElementById('ck-ph'), d.getElementById('ck-calls'), d.getElementById('ck-card'), d.getElementById('ck-tx'), CK.$('.app-col > .bl')].filter(function (x) { return x && V.util.visible(x); });
  }
  V.shortcuts.register('f6', function (e) {
    var r = regions(), a = d.activeElement, i = r.findIndex(function (x) { return x.contains(a); }), n = r[(i + (e.shiftKey ? -1 : 1) + r.length) % r.length];
    var t = n.querySelector('[aria-current="page"], [aria-current="true"][data-roving], h1, h2[tabindex], #ck-card-h, #ck-call-h, #ck-tx-h') || V.util.focusables(n)[0] || n;
    CK.focus(t);
  }, { description: 'Move between regions: header, Calls, card, transcript' });

  /* ---------- connection ---------- */
  w.addEventListener('offline', function () { st.online = false; CK.notice(); refresh(); });
  w.addEventListener('online', function () { st.online = true; CK.notice(); refresh(); });
  function refresh() { if (st.selected === 'new') CK.newcall.sync(); else { var c = C.byId(st.selected); if (c) CK.cardView.render(c); CK.feed.render(); } CK.list.render(); }

  /* ---------- Prototype states (prototype only): every state the spec lists, as reloadable URLs ---------- */
  var P = 'new=1&lead=lead_1050';
  var GROUPS = [
    ['New call card', [['Nothing chosen yet', ''], ['A lead chosen · ready', P], ['Test call to my phone', 'new=1&target=self'], ['Flow not tested yet (advisory)', P + '&flow=flow_3b90'],
      ['Blocked · a draft flow and a lead', P + '&rev=draft'], ['Blocked · wallet ₹0', P + '&wallet=empty'], ['Wallet low', P + '&wallet=low'], ['Outside calling hours · gate offers Schedule', P + '&demo=after-hours'],
      ['Blocked · lead marked Do not call', 'new=1&lead=lead_1273'], ['Blocked · number on the DND list', P + '&demo=dnd'], ['Blocked · lead already on a call', 'new=1&lead=lead_1042'],
      ["Couldn’t check the wallet (partial)", P + '&demo=partial'], ['Setup incomplete · 2 things to fix', P + '&demo=setup&wallet=empty'], ["Role can’t place phone calls", P + '&demo=role'],
      ['Microphone blocked', P + '&demo=mic-blocked'], ['Typed “abc” (invalid number)', 'demo=typed-abc'], ["Saving to the lead fails", P + '&demo=lead-save-fail']]],
    ['Call gate', [['Checks change on confirm', P + '&demo=gate-changed'], ["Placing fails, then Retry", P + '&demo=gate-fail']]],
    ['Page', [['Loading', 'demo=loading'], ['First use · no flows', 'demo=no-flows'], ['No leads yet', 'demo=no-leads'], ["Flows didn’t load", 'demo=flows-failed'], ['Page error', 'demo=page-error'], ['Offline', P + '&demo=offline']]],
    ['Calls', [['Supervise a live call', 'call=call_live01'], ['A ringing call', 'call=call_live02'], ['Stuck · no update for 60 s', 'call=call_live02&demo=stuck'],
      ['Real call from Dialling', 'demo=run&lead=lead_1050'], ['Test call to my phone', 'demo=run-test'], ['Browser test', 'demo=browser'], ['Taken over · you are talking', 'demo=takeover&lead=lead_1050'],
      ["Transfer doesn’t connect", 'demo=transfer-fail&lead=lead_1050'], ['Offline during a phone call', 'demo=offline-call&lead=lead_1050'],
      ['No answer', 'demo=no-answer&lead=lead_1050'], ['Busy', 'demo=busy&lead=lead_1050'], ['Voicemail', 'demo=voicemail&lead=lead_1050'], ['Failed', 'demo=failed&lead=lead_1050'],
      ['Wrap-up', 'demo=wrapup&lead=lead_1050'], ['Wrap-up · saving fails', 'demo=wrapup,save-fail&lead=lead_1050'], ['Test ended', 'demo=test-ended'], ['A recent call (today)', 'call=call_7c61ec']]]];
  function protoMenu() {
    var cur = w.location.search.replace(/^\?/, '');
    d.getElementById('ck-proto-body').innerHTML = '<p class="ck-proto-note">Reloads the page into a state from the spec (03-pages/01 §4.1, §5.7). Not part of the product.</p>' + GROUPS.map(function (g, i) {
      return '<section class="ck-proto-grp" aria-labelledby="ck-pg-' + i + '"><h3 class="ck-proto-h" id="ck-pg-' + i + '">' + esc(g[0]) + '</h3><ul class="ck-proto-list">' + g[1].map(function (x) {
        return '<li><a class="ck-proto-link" href="cockpit.html' + (x[1] ? '?' + x[1] : '') + '"' + (x[1] === cur && (x[1] || !cur) ? ' aria-current="page"' : '') + '>' + esc(x[0]) + '</a></li>'; }).join('') + '</ul></section>';
    }).join('');
  }

  /* ---------- page error (PageError inside the shell) ---------- */
  /* PageError (03-pages/00 §15.1–15.3): the same pattern as 404.html?demo=error. Retry refetches in place (no reload), the
     secondary is tertiary, and Details carries the error id, the time and Copy. */
  var ERR = 'GET /api/cockpit · 503 · upstream_unavailable · error id err_7f21c0 · 27 Sep 2026, 11:24 am IST';
  function pageError() {
    var body = d.getElementById('ck-body');
    body.innerHTML = '<div class="ck-error"><div class="empty empty--page empty--danger ck-error-block">' + V.icon('circle-alert', 'lg') + '<h2 class="empty-title">Cockpit couldn’t load.</h2><p>No calls were placed. This is a problem on our side or with your connection.</p>' +
      '<div class="empty-actions"><button class="btn btn--primary" type="button" data-ck-err="retry">' + V.icon('refresh-cw') + 'Retry</button><a class="btn btn--tertiary" href="call-reports.html">Go to Call reports</a></div>' +
      '<p class="ck-err-retry" id="ck-err-retry" hidden></p>' +
      '<details class="details"><summary>Details</summary><div class="raw"><code>' + CK.esc(ERR) + '</code><button type="button" class="ibtn ibtn--sm" data-ck-err="copy" aria-label="Copy error details">' + V.icon('copy', 'sm') + '</button></div></details></div></div>';
    V.initAll(body);
    body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ck-err]'); if (!t) return;
      if (t.getAttribute('data-ck-err') === 'copy') { try { if (navigator.clipboard) navigator.clipboard.writeText(ERR).catch(function () {}); } catch (x) { /* file:// may refuse */ } V.toast.success('Error details copied.'); return; }
      if (t.getAttribute('aria-busy') === 'true') return;
      t.setAttribute('aria-busy', 'true'); t.innerHTML = V.icon('loader-circle', null, { className: 'spinner' }) + 'Retrying…';
      setTimeout(function () {
        t.removeAttribute('aria-busy'); t.innerHTML = V.icon('refresh-cw') + 'Retry';
        var r = d.getElementById('ck-err-retry'); r.hidden = false; r.setAttribute('role', 'alert');
        r.innerHTML = '<span class="status status--md status--danger">' + V.icon('circle-x', 'md') + '<span>Still couldn’t load. Tried again at 11:24 am.</span></span>';
      }, 1200);
    });
    d.getElementById('ck-meta').textContent = 'Couldn’t load calls'; d.getElementById('ck-switcher').hidden = true;
    /* <title> "Couldn’t load · Cockpit · Vaani Labs" (03-pages/00 §15.1) */
    CK.title('Couldn’t load');
  }

  /* ---------- boot ---------- */
  V.ready(function () {
    if (V.util.store.get('vaani:cockpit:aloud') === 'off') { CK.readAloud = false; var mi = d.querySelector('#ck-tx-menu [data-value="aloud"]'); if (mi) mi.setAttribute('aria-checked', 'false'); }
    protoMenu();
    CK.notice();
    /* ?demo=offline: tell the shell too, so the Baseline reads "as of" and it keeps this page’s bar as the one bar */
    if (!st.online && V.connection) V.connection.offline();
    if (CK.has('page-error')) { pageError(); return; }
    C.seed();
    var q = CK.q, leadId = q.get('lead'), lead = leadId ? CK.leadById(leadId) : null;
    /* ?test=browser|phone (Call reports and Flows 'Place a test call…') opens the new-call card on a test call to yourself */
    if (q.get('target') === 'self' || q.get('test')) st.target = { kind: 'self' };
    else if (lead) st.target = { kind: 'lead', lead: lead };
    else { var num = CK.session.get('number'), n = num && CK.newcall.parseNumber(num); if (n) st.target = { kind: 'number', e164: n.e164, display: n.display }; }
    var callId = q.get('call');
    C.chrome();
    CK.select(callId && (C.byId(callId) || CK.recentCall(callId)) ? callId : 'new');
    if (st.loading) CK.list.render();
    /* documented handoff: Leads "Open in Cockpit" (?new=1&lead=) focuses the primary, never the gate */
    if (q.get('new') === '1' && lead && !q.get('demo')) { var b = d.getElementById('ck-call'); if (b) b.focus({ preventScroll: true }); }
    var dm = CK.demo, runLead = lead || CK.leadById('lead_1050');
    var run = function (target, ff) { var f = CK.flow() || CK.rev(CK.flowById(CK.DEFAULT_FLOW), 'live'); st.target = target; var c = C.place({ target: target, flow: target.kind === 'self' ? f : (f.draft ? CK.rev(CK.flowById(f.id), 'live') : f), voiceId: st.voiceId, lang: st.lang, key: 'demo' }); if (ff) C.ff(c, ff); return c; };
    if (dm.run || dm['no-answer'] || dm.busy || dm.voicemail || dm.failed || dm['transfer-fail']) run({ kind: 'lead', lead: runLead }, dm['transfer-fail'] ? 14 : 0);
    else if (dm['run-test']) run({ kind: 'self' }, 0);
    else if (dm.browser) { st.mic = 'granted'; C.startBrowser(d.getElementById('ck-talk')); }
    else if (dm.takeover) { var c1 = run({ kind: 'lead', lead: runLead }, 16); C.takeOver(c1); }
    else if (dm['offline-call']) { run({ kind: 'lead', lead: runLead }, 12); st.online = false; CK.notice(); if (V.connection) V.connection.offline(); refresh(); }
    else if (dm.wrapup) run({ kind: 'lead', lead: runLead }, 52);
    else if (dm['test-ended']) run({ kind: 'self' }, 52);
    else if (dm['typed-abc']) { var el = d.getElementById('ck-contact'); if (el) { el.value = 'abc'; st.contactError = 'Enter a 10-digit mobile number, like 98765 43210.'; CK.newcall.sync(); } }
    setInterval(C.tick, 250);
    V.on('breakpoint', function () { CK.header(); });
  });
})(window, document);
