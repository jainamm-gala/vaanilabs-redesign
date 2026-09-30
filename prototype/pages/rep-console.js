/* Vaani Labs prototype · Rep console (03-pages/01-agent-cockpit.md §5). The presence machine of §5.3 (usePresenceMachine):
   Offline → Connecting… → Available → Ringing → On call ⇄ On hold → Wrap-up → Available | Offline. Opening the page never
   registers presence, asks for a token or opens a socket (D8); Go available proves route, microphone, token, socket and
   presence first. One tab owns presence (BroadcastChannel). Everything below is simulated on the page clock. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, RC = w.VaaniRep, RV = RC.view, U = V.util, esc = U.esc, D = V.data;
  RV.init();
  var q = new URLSearchParams(w.location.search), demo = {};
  (q.get('demo') || '').split(',').forEach(function (f) { if (f) demo[f] = true; });
  var T0 = Date.now(); function sec() { return (Date.now() - T0) / 1000; }
  var lead = Object.assign({}, (D.leads || [])[0]);
  var R = RC.R = {
    presence: demo.loading ? 'loading' : 'offline', since: 0, route: demo.pstn || demo['pstn-member'] ? 'pstn' : 'browser', role: demo['pstn-member'] ? 'member' : 'admin', bridge: !demo['no-bridge'],
    mic: demo['mic-blocked'] ? 'blocked' : demo['mic-none'] ? 'none' : 'prompt', sink: !demo['no-sink'], notif: 'off', micDevice: 'Headset (USB)', spkDevice: 'Headset (USB)', volume: 80,
    err: null, missed: 0, missedAt: null, offlineReason: null, otherTab: false, showAll: U.store.get('vaani:rep:checks') === 'all', call: null, rang: false,
    stats: { taken: 3, talk: 11, missed: 1 },
    history: demo['no-history'] ? [] : [{ name: 'Vikram Singh', missed: true, at: '10:48 am' }, { name: 'Rohan Kulkarni', dur: '4m 12s', outcome: 'Interested', at: '10:31 am', tone: 'success' }, { name: 'Isha Kapoor', dur: '3m 05s', outcome: 'Visit booked', at: '10:12 am', tone: 'success' }, { name: 'Neha Sharma', dur: '3m 40s', outcome: 'Callback', at: '10:05 am', tone: 'warning' }]
  };
  if (demo['no-history']) R.stats = { taken: 0, talk: 0, missed: 0 };
  RC.inState = function () { return sec() - R.since; };
  RC.callSec = function () { return R.call ? sec() - R.call.start : 0; };
  RC.blockReason = function () {
    if (R.presence === 'loading') return 'Checking your setup…';
    if (!R.bridge) return "Browser transfers aren’t available yet.";
    if (R.route === 'pstn') return R.role === 'admin' ? 'Transfers ring the phone (PSTN), not this page. Change it in Phone setup.' : 'Ask an admin to set the call channel to Browser.';
    if (R.mic === 'blocked') return "Microphone blocked. Allow it in your browser’s site settings, then Retry.";
    if (R.mic === 'none') return 'No microphone found. Connect a headset, then Retry.';
    return null;
  };
  var TITLE = { loading: 'Offline', offline: 'Offline', connecting: 'Connecting', available: 'Available', ringing: 'Incoming call', answering: 'Incoming call', oncall: 'On call', hold: 'On hold', wrapup: 'Wrap-up', dropped: 'Call dropped' };
  var META = { loading: 'Checking your setup…', offline: 'Offline', connecting: 'Connecting…', ringing: 'Incoming call', answering: 'Answering…', oncall: 'On call', hold: 'On hold', wrapup: 'Wrap-up', dropped: 'Call dropped' };

  /* ---------- render ---------- */
  /* render(focus?): rebuilds the softphone, bar and context. Focus goes to `focus` when given; otherwise the focused control
     is found again in the new markup (by id first, so #rc-go keeps focus through Go available → Connecting… → Go offline,
     then by data-rc-act), else its section heading, else the Softphone heading. Focus is never dropped to <body> (§5.8). */
  function render(focus) {
    var p = R.presence, soft = d.getElementById('rc-soft'), a = d.activeElement, kId = null, kAct = null, kHead = null, kBar = false;
    if (a && a !== d.body && a.getAttribute) {
      kId = a.id || null; kAct = a.getAttribute('data-rc-act'); kBar = !!a.closest('#rc-bar');
      var sec0 = a.closest('section[aria-labelledby]'); kHead = sec0 ? sec0.getAttribute('aria-labelledby') : null;
    }
    d.getElementById('rc-body').setAttribute('data-state', p);
    var html = '';
    if (p === 'ringing' || p === 'answering') html = RV.incoming(R) + RV.ringAvail(R) + RV.readiness(R);   /* R3C-09: Go offline stays under the incoming card (wireframe E), so focus on it survives the ring */
    else if (p === 'oncall' || p === 'hold') html = RV.call(R);
    else if (p === 'wrapup') html = RV.wrap(R);
    else if (p === 'dropped') html = RV.dropped(R) + RV.wrap(R);
    else html = RV.missed(R) + RV.availability(R) + RV.readiness(R) + RV.devices(R) + (p === 'available' ? RV.connDetails() : '');
    soft.innerHTML = html;
    var bar = d.getElementById('rc-bar'), bh = RV.bar(R); bar.innerHTML = bh; bar.hidden = !bh; bar.setAttribute('data-kind', p);
    d.getElementById('rc-ctx').innerHTML = RV.context(R);
    V.initAll(d.getElementById('rc-body'));
    d.getElementById('rc-meta').textContent = p === 'available' ? 'Available since ' + R.availAt + ' · ' + R.stats.taken + ' calls today' : META[p];
    V.setTitle(null, TITLE[p]);
    notice(); wire(); tr();
    if (R.call) R.call.pulse = false;
    if (R.err) R.err.said = true;                                   /* the InlineError alerts once, on the render that adds it */
    if (R.call && R.call.saveError) R.call.saveErrSaid = true;
    var t = focus ? d.getElementById(focus) : null;
    if (!t && a && a !== d.body && !d.body.contains(a)) {
      var acts = kAct ? U.$$('[data-rc-act="' + kAct + '"]').filter(U.visible) : [];
      t = (kId && d.getElementById(kId)) || acts.filter(function (x) { return !!x.closest('#rc-bar') === kBar; })[0] || acts[0] || (kHead && d.getElementById(kHead)) || d.getElementById('rc-soft-h');
    }
    if (t && t !== d.activeElement) focusTarget(t);
  }
  /* Programmatic focus (06-accessibility, focus table): a heading or region gets tabindex="-1" plus data-focus-target, so it
     draws no ring; controls keep theirs. */
  function focusTarget(t) {
    if (!/^(BUTTON|A|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(t.tagName)) {
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      if (t.getAttribute('tabindex') === '-1' && !t.hasAttribute('role')) t.setAttribute('data-focus-target', '');
    }
    t.focus();
  }
  /* The one page notice: another tab · bridge unavailable · wallet ₹0 · the phone caveat while available */
  var noticeHtml = null;
  function notice() {
    var box = d.getElementById('rc-notice'), h = '';
    if (R.otherTab) h = '<div class="notice notice--neutral" role="status">' + V.icon('info') + '<div class="notice-body">Rep console is open in another tab.</div><div class="notice-acts"><button type="button" class="notice-act" data-rc-act="use-tab">Use this tab</button></div></div>';
    else if (!R.bridge) h = '<div class="notice notice--neutral" role="status">' + V.icon('info') + '<div class="notice-body">Browser transfers aren’t available yet. Transfers ring the number in Phone setup.</div></div>';
    else if (V.walletState() === 'empty') h = '<div class="notice notice--warning" role="status">' + V.icon('triangle-alert') + '<div class="notice-body"><b class="notice-title">Wallet is ₹0.</b> Phone calls are paused, so no transfers can reach you.</div><div class="notice-acts"><button type="button" class="notice-act" data-vaani-action="topup">Top up</button></div></div>';
    else if (V.bp.phone() && R.presence === 'available') h = '<div class="notice notice--neutral notice--multi" role="status">' + V.icon('smartphone') + '<div class="notice-body">Keep this screen on and this tab open. Phones pause background tabs, so transfers may not ring if you switch apps.</div></div>';
    if (h === noticeHtml) return;                                   /* unchanged: keep the node, so its status isn’t re-announced */
    noticeHtml = h; box.innerHTML = h; box.hidden = !h;
  }
  function tr() { var t = d.getElementById('rc-tr'); if (t && V.bp.desktopShell()) t.scrollTop = t.scrollHeight; }
  function wire() {
    var n = d.getElementById('rc-notes');
    if (n) n.addEventListener('input', function () { R.call.notes = n.value; var chip = d.getElementById('rc-notes-save'); chip.hidden = false; V.saveState.set(chip, 'saving', { silent: true }); clearTimeout(wire.t); wire.t = setTimeout(function () { V.saveState.set(chip, 'saved', { at: V.fmt.time(new Date(Date.parse(D.meta.now) + sec() * 1000).toISOString()), tooltip: 'Notes are saved to this call and carried into Wrap-up.', silent: true }); }, 700); });
    var out = d.getElementById('rc-w-out'); if (out) out.addEventListener('vaani:change', function (e) { R.call.outcome = e.detail.value; R.call.notes = (d.getElementById('rc-w-notes') || {}).value; render('rc-w-out'); });
    var dev = d.getElementById('rc-devices'); if (dev) dev.addEventListener('toggle', function () { R.devicesOpen = dev.open; meter(); });
    var txd = d.getElementById('rc-tx'); if (txd) txd.addEventListener('toggle', function () { R.txOpen = txd.open; });
    ['rc-mic', 'rc-spk'].forEach(function (id) { var s = d.getElementById(id); if (s) s.addEventListener('vaani:change', function (e) { if (id === 'rc-mic') R.micDevice = e.detail.value; else R.spkDevice = e.detail.value; V.announce((id === 'rc-mic' ? 'Microphone: ' : 'Speaker: ') + e.detail.value); }); });
    var vol = d.getElementById('rc-vol'); if (vol) vol.addEventListener('vaani:change', function (e) { R.volume = e.detail.value; });
    meter();
  }
  /* MicCheck meter: moves only while Audio devices is open and the microphone is allowed; static under reduced motion. */
  var mt = null;
  function meter() {
    clearInterval(mt); var m = d.getElementById('rc-meter'); if (!m || !R.devicesOpen || R.mic !== 'granted') return;
    var bars = U.$$('i', m), k = 0, set = function (v) { bars.forEach(function (b, j) { b.style.setProperty('--l', Math.max(0.15, v * [0.55, 1, 0.8, 0.45][j])); }); m.setAttribute('aria-valuenow', String(Math.round(v * 10) * 10)); };
    if (V.reducedMotion()) { set(0.6); } else mt = setInterval(function () { if (!d.contains(m)) { clearInterval(mt); return; } k += 1; set(0.3 + 0.65 * Math.abs(Math.sin(k * 0.8) * Math.cos(k * 0.31))); }, 80);
    setTimeout(function () { if (!R.heard && d.getElementById('rc-hear')) { R.heard = true; d.getElementById('rc-hear').textContent = 'We can hear you'; } }, 1500);
  }
  /* set(p, focus?, say?): one presence change → one announcement (CK §4.5: polite, debounced 500 ms, never a timer). `say`
     replaces the default words; false says nothing (ringing speaks its own assertive line; a failure speaks through its
     InlineError). Connecting… and Answering… are carried by the focused, busy button. `quiet` covers the prototype boot. */
  var SAY = { offline: "You’re offline. Transfers won’t ring here.", available: "You’re available. Transferred calls ring here.", oncall: 'Call live', hold: 'Caller on hold', wrapup: 'Call ended. Wrap-up.', dropped: 'Call dropped' };
  var sayT = null, quiet = false;
  function set(p, focus, say) {
    var changed = p !== R.presence;
    R.presence = p; R.since = sec(); presenceChrome(); render(focus);
    if (!changed) return;
    clearTimeout(sayT);                                             /* a newer state wins over a pending older one */
    var msg = say === false || quiet ? null : say || SAY[p];
    if (msg) sayT = setTimeout(function () { V.announce(msg); }, 500);
  }
  /* Nav badge "Available" / "On call" and the Baseline segment, only while presence is confirmed (§7.13). */
  function presenceChrome() {
    var p = R.presence;
    V.data.state.repPresence = p;   /* the shared NAV badge (kind presence) reads it */
    /* On a call (live or on hold) the rep’s own call is the workspace’s "my call": DATA.state.myCall and the Baseline facts
       carry it, and the TopBar shows the call chip "(•) Live 03:41" (CK §5.5 phone wireframe). Cleared on ringing, wrap-up
       and offline. */
    var on = (p === 'oncall' || p === 'hold') && R.call, call = on ? { id: 'rep_' + R.call.lead.id, kind: 'real', timer: RV.tc(RC.callSec()), name: R.call.lead.name } : null;
    V.data.state.myCall = call ? { id: call.id, kind: call.kind, timer: call.timer } : null;
    V.baseline.set(p === 'available' ? 'rep' : on ? 'oncall' : null);   /* R3C-05: segment 5 during your own call */
    V.baseline.facts({ call: call });   /* re-renders the shell chrome (TopBar, BottomBar, NAV badge, Baseline) */
  }
  /* The TopBar call chip (tablet and phone; data-nav §2 "Call chip", CallStateTag lg): the same state and timer as the
     softphone’s tag ("Live 03:41", "On hold 00:12"). This call lives on this page, so the chip brings the rep back to the
     call card here and never links to Cockpit (leaving would end the call). The shell’s chip is built for Cockpit calls,
     so this page supplies its own through the same V.shell.callChipHtml slot; the page ticker keeps its timer. */
  V.shell.callChipHtml = function () {
    var p = R.presence; if (!R.call || (p !== 'oncall' && p !== 'hold')) return '';
    var hold = p === 'hold', word = hold ? 'On hold' : 'Live', mode = hold ? 'state' : 'call';
    return '<a class="chip' + (hold ? '' : ' chip--live') + '" href="#rc-call-h" data-chip="call" data-rc-chip' + (hold ? ' data-tone="ringing"' : '') + ' aria-label="' + chipName() + '">' + (hold ? V.icon('pause', 'xs') : '<span class="live-dot" data-mark></span>') +
      word + ' <span class="num" data-rc-timer="' + mode + '">' + RV.tc(hold ? RC.inState() : RC.callSec()) + '</span></a>';
  };
  function chipName() { var hold = R.presence === 'hold'; return (hold ? 'Call on hold, ' : 'Live call, ') + RV.tc(hold ? RC.inState() : RC.callSec()); }
  function toCall() {
    var h = d.getElementById('rc-call-h'); if (h) focusTarget(h);
  }

  /* ---------- the machine ---------- */
  var chan = null; try { chan = new w.BroadcastChannel('vaani-rep'); chan.onmessage = function (e) { if (e.data === 'claim' && ['available', 'connecting'].indexOf(R.presence) >= 0) { R.otherTab = true; R.offlineReason = 'You went available in another tab, so this tab is offline.'; set('offline', null, R.offlineReason); } }; } catch (e) { chan = null; }
  var ringT = null, autoT = null, callT = [];
  function goAvailable() {
    if (R.presence === 'connecting') return;
    if (RC.blockReason()) { V.announce(RC.blockReason()); return; }
    R.err = null; R.offlineReason = null; R.otherTab = false; R.missedAt = R.missed >= 2 ? null : R.missedAt; if (R.missed >= 2) R.missed = 0;
    set('connecting', 'rc-go');                                     /* from Retry or a notice too: focus follows to the busy #rc-go */
    var stages = [['route', 200], ['mic', 450], ['token', 350], ['socket', 450], ['presence', 300]], i = 0;
    (function next() {
      if (i >= stages.length) { R.availAt = V.fmt.time(new Date(Date.parse(D.meta.now) + sec() * 1000).toISOString()); set('available'); if (chan) try { chan.postMessage('claim'); } catch (e) { /* ignore */ }
        if (!R.rang) { clearTimeout(autoT); autoT = setTimeout(function () { if (R.presence === 'available') ring(); }, demo.ringing ? 400 : 7000); } return; }
      var s = stages[i][0];
      setTimeout(function () {
        if (s === 'mic') { if (R.mic === 'prompt') R.mic = 'granted'; }
        var fail = s === 'token' && demo['token-denied'] ? { text: "Your role can’t take transferred calls. Ask an admin to add you as a rep.", retry: false } :
          s === 'socket' && demo['connect-failed'] ? { text: "Couldn’t connect to the call service. Check your connection and Retry.", retry: true, raw: 'Could not connect: could not establish signal connection: WebSocket closed during a (re)connection attempt · err_ws_1006 · 11:24:07 IST' } :
          s === 'presence' && demo['presence-failed'] ? { text: "Couldn’t mark you available.", retry: true } : null;
        if (fail) { demo['connect-failed'] = demo['presence-failed'] = false; R.err = fail; set('offline', 'rc-go', false); return; }
        i += 1; next();
      }, stages[i][1]);
    })();
  }
  /* goOffline(reason?, auto?): the rep’s own Go offline moves focus to #rc-go; a system change (misses, dropped connection) does not */
  function goOffline(reason, auto) { clearTimeout(autoT); clearTimeout(ringT); R.offlineReason = reason || null; set('offline', auto ? null : 'rc-go', reason || null); }
  function ring() {
    R.rang = true;
    R.call = { lead: lead, start: sec() - 62, captured: [{ key: 'Preferred day', value: 'Saturday, morning' }, { key: 'Budget', value: '₹85 L to ₹1 Cr' }, { key: 'Site visit', value: null }], muted: false, notes: '', pulse: true,
      turns: [{ id: 'r1', speaker: 'agent', name: 'Vaani', startMs: 9000, text: 'नमस्ते आरव जी, मैं Sample Realty से वाणी बोल रही हूँ। क्या अभी दो मिनट बात हो सकती है?', lang: 'hi', final: true, step: { label: 'Greeting', href: 'flow-designer.html?node=n1' } },
        { id: 'r2', speaker: 'caller', startMs: 17000, text: 'हाँ जी, बोलिए।', lang: 'hi', final: true },
        { id: 'r3', speaker: 'agent', name: 'Vaani', startMs: 21000, text: 'You had asked about a 2 BHK near the metro. Would you like to visit the site this week?', lang: 'en', final: true, step: { label: 'Ask about a site visit', href: 'flow-designer.html?node=n3' } },
        { id: 'r4', speaker: 'caller', startMs: 34000, text: 'Saturday ho sakta hai, but price thoda zyada lag raha hai. Kisi se baat kar sakta hoon?', lang: 'hi-Latn', final: true },
        { id: 'r5', speaker: 'agent', name: 'Vaani', startMs: 58000, text: 'Let me connect you to our team. One moment.', lang: 'en', final: true, step: { label: 'Transfer to sales', href: 'flow-designer.html?node=n10' } }] };
    set('ringing', null, false);                                    /* the one assertive line below is the only announcement (§5.10) */
    if (!quiet) V.announce('Incoming call from ' + lead.name + '. Press ' + (U.isMac ? 'Command' : 'Control') + ' Enter to answer.', { politeness: 'assertive' });
    clearTimeout(ringT); ringT = setTimeout(missed, 20000);
  }
  function missed() {
    if (R.presence !== 'ringing') return;
    R.missed += 1; R.stats.missed += 1; R.missedAt = V.fmt.time(new Date(Date.parse(D.meta.now) + sec() * 1000).toISOString()); R.history.unshift({ name: lead.name, missed: true, at: R.missedAt }); R.call = null;
    if (R.missed >= 2) { goOffline('You were set offline after 2 missed transfers.', true); return; }
    set('available', null, 'You missed a transfer. Vaani offered a callback.');
  }
  function answer() {
    if (R.presence !== 'ringing') return;
    clearTimeout(ringT); set('answering');
    setTimeout(function () {
      if (demo.hungup) { demo.hungup = false; R.call = null; set('available', null, 'The caller hung up before you answered. Vaani offered a callback.'); V.toast.info('The caller hung up before you answered. Vaani offered a callback.'); return; }
      R.call.pulse = true; R.call.connectedAt = sec(); set('oncall', 'rc-call-h', 'Call live with ' + lead.name + '.');
      script();
    }, 700);
  }
  function script() {
    var L = [[3, 'rep', 'Namaste Aarav ji, main Anika, Sample Realty sales team se. Aap price ke baare mein pooch rahe the?', 'hi-Latn'], [9, 'caller', 'Haan, 2 BHK ka final price kya hoga parking ke saath?', 'hi-Latn'],
      [15, 'rep', 'Parking ke saath 82 lakh hai, aur Saturday visit pe hum aapko payment plan bhi dikha denge.', 'hi-Latn'], [22, 'caller', 'Theek hai, Saturday 11 baje aata hoon.', 'hi-Latn']];
    callT.forEach(clearTimeout); callT = L.map(function (x) { return setTimeout(function () {
      if (!R.call || ['oncall', 'hold'].indexOf(R.presence) < 0) return;
      var t = { id: 'rt' + R.call.turns.length, speaker: x[1] === 'rep' ? 'agent' : 'caller', name: x[1] === 'rep' ? 'Anika' : 'Caller', rep: x[1] === 'rep', startMs: RC.callSec() * 1000, text: x[2], lang: x[3], final: true };
      R.call.turns.push(t); if (x[0] === 22) R.call.captured[2].value = 'Booked · Sat 3 Oct, 11:00 am';
      var box = d.getElementById('rc-tr'); if (box) { box.innerHTML = RV.turns(R.call); tr(); }
      var s = d.querySelector('#rc-tx .rc-sum-v'); if (s) s.textContent = R.call.turns.length + ' turns';
    }, x[0] * 1000); });
  }
  function endCall() { callT.forEach(clearTimeout); R.call.endedAt = RC.callSec(); R.call.outcome = R.call.captured[2].value ? 'Visit booked' : 'Interested'; set('wrapup', 'rc-wrap-h', 'Call ended. Wrap-up.'); }
  function save(next) {
    var c = R.call; if (c.saving) return; c.notes = (d.getElementById('rc-w-notes') || {}).value; c.saving = true; render();
    setTimeout(function () {
      c.saving = false;
      if (demo['save-fail'] && !c.failedOnce) { c.failedOnce = true; c.saveError = true; c.saveErrSaid = false; render(); return; }   /* its InlineError alerts once */
      R.stats.taken += 1; R.stats.talk += Math.max(1, Math.round((c.endedAt || 60) / 60)); R.history.unshift({ name: c.lead.name, dur: V.fmt.duration(Math.round(c.endedAt || 200)), outcome: c.outcome, at: R.availAt || '11:24 am', tone: 'success' });
      R.call = null; V.toast.success('Saved to ' + lead.name, { action: { label: 'Open lead', onClick: function () { w.location.href = 'leads.html?lead=' + lead.id; } } });
      if (next === 'available') set('available', 'rc-soft-h'); else goOffline();
    }, 700);
  }

  /* ---------- actions ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rc-act]'); if (!b) return;
    var a = b.getAttribute('data-rc-act');
    if (b.getAttribute('aria-disabled') === 'true') { V.announce(b.getAttribute('data-tooltip') || 'Not available'); return; }
    if (a === 'go-available') goAvailable();
    else if (a === 'go-offline') { if (R.presence === 'ringing' && R.call) { R.history.unshift({ name: R.call.lead.name, missed: true, at: '11:24 am' }); R.call = null; } goOffline(); }   /* §5.7: Go offline stops the ring; Vaani offers a callback */
    else if (a === 'answer') answer();
    else if (a === 'decline') { clearTimeout(ringT); R.call = null; R.history.unshift({ name: lead.name, missed: true, at: '11:24 am' }); set('available', 'rc-soft-h', 'Declined. Vaani offered a callback.'); }
    else if (a === 'mute') { R.call.muted = !R.call.muted; V.announce(R.call.muted ? 'Microphone muted' : 'Microphone on'); render(); }
    else if (a === 'hold') toggleHold();
    else if (a === 'keypad') openKeypad(b);
    else if (a === 'transfer') openTransfer(b);
    else if (a === 'end') endCall();
    else if (a === 'save-available') save('available');
    else if (a === 'save-offline') save('offline');
    else if (a === 'skip') { R.call = null; set('available', 'rc-soft-h', 'Skipped. The lead was not changed.'); }
    else if (a === 'show-all') { R.showAll = !R.showAll; U.store.set('vaani:rep:checks', R.showAll ? 'all' : 'passing'); render('rc-ready-h'); var sb = d.querySelector('[data-rc-act="show-all"]'); if (sb) sb.focus(); }
    else if (a === 'retry-mic') { R.mic = 'granted'; demo['mic-blocked'] = demo['mic-none'] = false; render(); V.announce('Microphone allowed. ' + RV.summary(RV.rows(R))[2] + '.'); }   /* the readiness summary, once per settled change (G §2.4) */
    else if (a === 'notif') { R.notif = 'on'; render(); V.toast.info('Notifications on. They say "Incoming transfer from Vaani" and never show a name or number.'); }
    else if (a === 'ask-admin') V.toast.info('Request copied. Paste it to an admin: "Please set the call channel to Browser so transfers reach me."');
    else if (a === 'use-tab') { R.otherTab = false; if (chan) try { chan.postMessage('claim'); } catch (x) { /* ignore */ } goAvailable(); }
    else if (a === 'test-sound') { R.testing = true; render(); setTimeout(function () { R.testing = false; render(); V.announce('Test sound played on ' + R.spkDevice + '.'); }, 1500); }
    else if (a === 'copy-raw' || a === 'copy-room') { var txt = d.getElementById(a === 'copy-raw' ? 'rc-raw' : 'rc-room').textContent; try { w.navigator.clipboard.writeText(txt).then(function () { V.toast.success('Copied'); }, function () { V.toast.info("Couldn’t copy here. Select the text instead."); }); } catch (x) { V.toast.info("Couldn’t copy here. Select the text instead."); } }
  });
  function toggleHold() { var on = R.presence === 'oncall'; set(on ? 'hold' : 'oncall', null, on ? 'Caller on hold' : 'Call resumed'); var hb = d.querySelector('[data-rc-act="hold"]'); if (hb && !V.bp.phone()) hb.focus(); }
  var digits = '';
  function openKeypad(trigger) {
    var body = d.getElementById('rc-keypad-body'); body.innerHTML = RV.keypad(digits);
    body.onclick = function (e) { var k = e.target.closest('[data-key]'); if (!k) return; digits += k.getAttribute('data-key'); d.getElementById('rc-dtmf').value = digits; };
    V.popover.open(trigger, 'rc-keypad', { placement: 'top-start', modal: true });
  }
  function openTransfer(trigger) {
    var pop = d.getElementById('rc-transfer');
    pop.innerHTML = '<div class="pop-head"><h2 class="pop-title" id="rc-tr-t">Transfer the call</h2><button type="button" class="ibtn ibtn--sm" data-popover-close aria-label="Close">' + V.icon('x', 'sm') + '</button></div><div class="pop-body"><fieldset class="fieldset"><legend>Available reps</legend>' +
      '<label class="check"><input type="radio" class="radio" name="rc-tr" value="Rohit S." checked><span class="check-text"><span translate="no">Rohit S.</span><span class="check-desc">Available · Rep console</span></span></label>' +
      '<label class="check"><input type="radio" class="radio" name="rc-tr" value="Farah K." disabled><span class="check-text"><span translate="no">Farah K.</span><span class="check-desc">On call · can’t take a transfer</span></span></label></fieldset>' +
      '<p class="form-note">Transfers to a phone number are billed at ₹0.04/s.</p></div><div class="pop-foot"><button type="button" class="btn btn--tertiary" data-popover-close>Cancel</button><button type="button" class="btn btn--primary" id="rc-tr-go">Transfer</button></div>';
    pop.querySelector('#rc-tr-go').addEventListener('click', function () { V.popover.close('rc-transfer'); callT.forEach(clearTimeout); R.call.outcome = 'Transferred'; R.call.endedAt = RC.callSec(); set('wrapup', 'rc-wrap-h', 'Transferred to Rohit S. Wrap-up.'); });
    V.popover.open(trigger, 'rc-transfer', { placement: 'top-start', modal: true });
  }
  /* Hold from the phone ⋯ menu re-renders the bar, so the menu’s own focus return finds a detached trigger: re-focus the new one */
  d.addEventListener('vaani:menuselect', function (e) { var v = e.detail.value, t = d.querySelector('#rc-bar [aria-controls="rc-bar-menu"]'); if (v === 'hold') { toggleHold(); setTimeout(function () { var m = d.getElementById('rc-bar-more'); if (m && U.visible(m)) m.focus(); }, 0); } else if (v === 'keypad') openKeypad(t); else if (v === 'transfer') openTransfer(t); });

  /* ---------- keys (§5.8): Ctrl/⌘+Enter answers without moving focus; M mutes; H holds; F6 moves between columns ---------- */
  V.shortcuts.register('mod+enter', function () { answer(); }, { description: 'Answer a ringing transfer', inFields: true, when: function () { return R.presence === 'ringing' && !V.overlays.top(); } });
  V.shortcuts.register('m', function () { if (R.presence !== 'oncall' && R.presence !== 'hold') return false; R.call.muted = !R.call.muted; V.announce(R.call.muted ? 'Microphone muted' : 'Microphone on'); render(); }, { description: 'Mute or unmute (on a call)' });
  V.shortcuts.register('h', function () { if (R.presence !== 'oncall' && R.presence !== 'hold') return false; toggleHold(); }, { description: 'Hold or resume (on a call)' });
  V.shortcuts.register('f6', function (e) {
    var r = [U.$$('.app > .sb, .app > .rail, .app > .topbar, .app > .bbar').filter(U.visible)[0], d.getElementById('rc-ph'), U.$('.rc-soft'), U.$('.rc-ctx'), U.$('.app-col > .bl')].filter(function (x) { return x && U.visible(x); });
    var i = r.findIndex(function (x) { return x.contains(d.activeElement); }), n = r[(i + (e.shiftKey ? -1 : 1) + r.length) % r.length];
    focusTarget(n.querySelector('[aria-current="page"], h1, h2') || U.focusables(n)[0] || n);
  }, { description: 'Move between Softphone and Context' });
  /* Leaving while ringing or on a call asks first; presence is cleared on pagehide (a beacon in the product). */
  w.addEventListener('beforeunload', function (e) { if (['ringing', 'oncall', 'hold'].indexOf(R.presence) >= 0) { e.preventDefault(); e.returnValue = ''; } });
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (a && a.matches('[data-chip="call"]')) { e.preventDefault(); toCall(); return; }
    if (!a || ['ringing', 'oncall', 'hold'].indexOf(R.presence) < 0 || a.target === '_blank' || a.getAttribute('href').charAt(0) === '#') return;
    e.preventDefault();
    V.dialog.confirm({ title: 'Leave the Rep console?', body: R.presence === 'ringing' ? 'The transfer stops ringing here and Vaani offers a callback.' : 'Your call ends when you leave this page.', confirmLabel: R.presence === 'ringing' ? 'Leave' : 'Leave and end call', tone: 'danger', focusCancel: true, returnTo: a }).then(function (ok) { if (ok) { R.presence = 'offline'; w.location.href = a.href; } });
  }, true);
  w.addEventListener('offline', function () { if (['available', 'connecting'].indexOf(R.presence) >= 0) goOffline('You were set offline at ' + V.fmt.time(new Date(Date.parse(D.meta.now) + sec() * 1000).toISOString()) + ' because the connection dropped.', true); });

  /* ---------- ticker, prototype states, boot ---------- */
  setInterval(function () {
    U.$$('[data-rc-timer]').forEach(function (el) { el.textContent = RV.tc(el.getAttribute('data-rc-timer') === 'call' ? RC.callSec() : RC.inState()); });
    /* the TopBar call chip’s name ("Live call, 03:41") follows its timer; myCall.timer keeps any shell re-render current */
    var my = V.data.state.myCall; if (my) { my.timer = RV.tc(RC.callSec()); U.$$('[data-rc-chip]').forEach(function (c) { c.setAttribute('aria-label', chipName()); }); }
  }, 500);
  var G = [['Availability', [['Offline · on page load', ''], ['Loading', 'demo=loading'], ['Routing blocked · admin', 'demo=pstn'], ['Routing blocked · member', 'demo=pstn-member'], ['Browser bridge unavailable', 'demo=no-bridge'], ['Microphone blocked', 'demo=mic-blocked'], ['No microphone', 'demo=mic-none'],
      ['Go available → token denied (403)', 'demo=token-denied'], ["Go available → couldn’t connect", 'demo=connect-failed'], ["Go available → couldn’t mark available", 'demo=presence-failed'], ['Available', 'demo=available'], ['Open in another tab', 'demo=other-tab'], ['Set offline: connection dropped', 'demo=net-drop'], ['Wallet ₹0', 'wallet=empty'], ['No transfers yet today', 'demo=no-history']]],
    ['Transfers', [['Ringing', 'demo=ringing'], ['Caller hangs up while you answer', 'demo=ringing,hungup'], ['On call', 'demo=oncall'], ['On hold', 'demo=hold'], ['Reconnecting during a call', 'demo=reconnecting'], ['Call dropped', 'demo=dropped'], ['Wrap-up', 'demo=wrapup'], ['Wrap-up · saving fails', 'demo=wrapup,save-fail'], ['Missed a transfer', 'demo=missed'], ['Set offline after 2 misses', 'demo=missed2']]]];
  var cur = w.location.search.replace(/^\?/, '');
  d.getElementById('rc-proto-body').innerHTML = '<p class="rc-proto-note">Reloads the page into a state from the spec (03-pages/01 §5.7). A transfer rings about 7 s after you go available. Not part of the product.</p>' + G.map(function (g, i) {
    return '<section class="rc-proto-grp" aria-labelledby="rc-pg-' + i + '"><h3 class="rc-proto-h" id="rc-pg-' + i + '">' + g[0] + '</h3><ul class="rc-proto-list">' + g[1].map(function (x) { return '<li><a class="rc-proto-link" href="rep-console.html' + (x[1] ? '?' + x[1] : '') + '"' + (x[1] === cur ? ' aria-current="page"' : '') + '>' + esc(x[0]) + '</a></li>'; }).join('') + '</ul></section>'; }).join('');
  V.ready(function () {
    presenceChrome(); render();
    if (demo.loading) return;
    /* The page opens straight into a prototype state without announcing the steps it skipped; only a ring is an event. */
    var fast = function (fn) { R.mic = 'granted'; R.availAt = '10:02 am'; quiet = true; try { fn(); } finally { quiet = false; } };
    if (demo['other-tab']) { R.otherTab = true; render(); }
    else if (demo['net-drop']) { R.offlineReason = 'You were set offline at 11:22 am because the connection dropped.'; render(); }
    else if (demo.available) fast(function () { R.rang = true; set('available'); });
    else if (demo.ringing) { fast(function () { set('available'); }); ring(); }
    else if (demo.oncall || demo.hold || demo.reconnecting || demo.wrapup || demo.dropped) fast(function () {
      ring(); clearTimeout(ringT); R.call.connectedAt = sec(); R.call.start = sec() - 221; R.call.notes = demo.wrapup ? 'Wants the payment plan on Saturday. Send the parking allotment PDF.' : '';
      R.reconnecting = !!demo.reconnecting; set('oncall'); script();
      if (demo.hold) set('hold'); if (demo.wrapup) endCall(); if (demo.dropped) { callT.forEach(clearTimeout); R.droppedAt = '03:52'; R.call.outcome = 'Interested'; set('dropped'); }
    });
    else if (demo.missed || demo.missed2) fast(function () { R.missed = demo.missed2 ? 2 : 1; R.missedAt = '11:20 am'; R.stats.missed += R.missed; if (demo.missed2) { R.offlineReason = null; set('offline'); } else { R.rang = true; set('available'); } });
  });
})(window, document);
