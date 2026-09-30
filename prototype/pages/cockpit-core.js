/* Vaani Labs prototype · Cockpit core (03-pages/01-agent-cockpit.md). Shared state, demo flags, the readiness engine
   (G §5.1 catalogue as the card and the gate read it), the call-kind sentence (CK §7.5), announcements and the clock.
   Loaded first; the other cockpit-*.js modules add to window.VaaniCockpit; cockpit.js boots. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, D = V.data, esc = U.esc;
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  CK.V = V; CK.D = D;

  CK.icon = function (n, s, o) { return V.icon(n, s, o); };

  /* ---------- URL state (CK §1.5) and prototype demo flags (?demo=a,b) ---------- */
  var q = new URLSearchParams(w.location.search);
  CK.q = q;
  CK.demo = {};
  (q.get('demo') || '').split(',').forEach(function (f) { if (f) CK.demo[f.trim()] = true; });
  if (CK.demo.setup) { CK.demo.unverified = true; }
  CK.has = function (f) { return !!CK.demo[f]; };
  /* Write session picks with replaceState; shared params (wallet, setup, demo) are kept. Never a typed number or a name. */
  CK.url = function (patch) {
    var p = new URLSearchParams(w.location.search);
    Object.keys(patch).forEach(function (k) { if (patch[k] == null || patch[k] === '') p.delete(k); else p.set(k, patch[k]); });
    var s = p.toString();
    try { w.history.replaceState(null, '', w.location.pathname + (s ? '?' + s : '')); } catch (e) { /* file:// in some browsers */ }
  };
  /* sessionStorage for a typed number (this tab only, cleared after the call). */
  CK.session = {
    get: function (k) { try { return w.sessionStorage.getItem('vaani:cockpit:' + k); } catch (e) { return null; } },
    set: function (k, v) { try { w.sessionStorage.setItem('vaani:cockpit:' + k, v); } catch (e) { /* private mode */ } },
    remove: function (k) { try { w.sessionStorage.removeItem('vaani:cockpit:' + k); } catch (e) { /* ignore */ } }
  };

  /* ---------- the demo clock: meta.now (Sun 27 Sep 2026, 11:24 am IST) + real seconds since load ---------- */
  var T0 = Date.now(), NOW0 = Date.parse(D.meta.now) + (CK.has('after-hours') ? (8 * 3600 + 16 * 60) * 1000 : 0);
  CK.now = function () { return NOW0 + (Date.now() - T0); };
  CK.nowIso = function () { return new Date(CK.now()).toISOString(); };
  CK.sec = function () { return (Date.now() - T0) / 1000; };           /* page seconds, the call machine’s time base */
  CK.tc = function (s) { return V.fmt.timecode(Math.max(0, Math.floor(s))); };
  CK.money = function (v) { return V.fmt.money(v); };
  CK.RATE = D.meta.ratePerSec || 0.04;

  /* ---------- data (copies; shared records are never mutated) ---------- */
  CK.leads = (D.leads || []).map(function (l) { return Object.assign({}, l); });
  CK.leadById = function (id) { for (var i = 0; i < CK.leads.length; i++) if (CK.leads[i].id === id) return CK.leads[i]; return null; };
  CK.self = { masked: (D.user && D.user.phoneMasked) || '+91 •••••• 3012', verified: true };
  CK.voices = D.voices || [];
  CK.voiceById = function (id) { for (var i = 0; i < CK.voices.length; i++) if (CK.voices[i].id === id) return CK.voices[i]; return CK.voices[0]; };
  CK.voiceLine = function (v) { return v.name + ' · ' + v.languages.map(function (c) { return V.langByCode(c).name; }).join(' + '); };
  CK.LANGS = [
    { value: 'auto', label: 'Auto · Hindi + English', glyph: 'अA', lang: 'hi-Latn', hint: 'Follows the caller' },
    { value: 'hi', label: 'Hindi', glyph: 'अ', lang: 'hi' }, { value: 'en', label: 'English', glyph: 'A', lang: 'en' },
    { value: 'hi-Latn', label: 'Hinglish', glyph: 'अA', lang: 'hi-Latn' }];
  CK.langLabel = function (v) { for (var i = 0; i < CK.LANGS.length; i++) if (CK.LANGS[i].value === v) return CK.LANGS[i].label; return CK.LANGS[0].label; };
  /* Callable revisions for FlowSwitcher purpose="call": every live revision, and drafts as "test calls only". */
  CK.flows = (D.flows || []).filter(function (f) { return f.status !== 'archived'; });
  CK.flowById = function (id) { for (var i = 0; i < CK.flows.length; i++) if (CK.flows[i].id === id) return CK.flows[i]; return null; };
  CK.DEFAULT_FLOW = 'flow_7c21';
  CK.rev = function (f, rev) {
    if (!f) return null;
    var hasLive = !!f.live, draftV = f.draft ? f.draft.version : (hasLive ? null : 1);
    if (rev === 'draft' && draftV) return { id: f.id, name: f.name, rev: 'draft', version: draftV, draft: true, live: f.live || null, tested: null };
    if (hasLive) return { id: f.id, name: f.name, rev: 'live', version: f.live.version, draft: false, live: f.live, tested: f.live.tested || null };
    return { id: f.id, name: f.name, rev: 'draft', version: draftV || 1, draft: true, live: null, tested: null };
  };

  /* ---------- page state ---------- */
  var st = CK.st = {
    wallet: V.walletState(), target: null, contactError: null,
    flowId: q.get('flow') || CK.DEFAULT_FLOW, revPick: q.get('rev') === 'draft' ? 'draft' : 'live',
    voiceId: q.get('voice') || 'vaani', lang: q.get('lang') || 'auto',
    overrides: null, mic: CK.has('mic-blocked') ? 'blocked' : CK.has('mic-none') ? 'none' : 'prompt',
    online: !CK.has('offline'), role: CK.has('role') ? 'viewer' : 'admin',
    loading: CK.has('loading'), selected: 'new', pane: q.get('tab') === 'transcript' ? 'transcript' : 'call',
    defaults: { flowId: CK.DEFAULT_FLOW, voiceId: 'vaani' }, walletUnknown: CK.has('partial'), micSession: null
  };
  if (!CK.flowById(st.flowId)) st.flowId = CK.DEFAULT_FLOW;
  CK.flow = function () { return CK.has('no-flows') || CK.has('flows-failed') ? null : CK.rev(CK.flowById(st.flowId), st.revPick); };
  CK.walletBal = function () { var s = (D.wallet.states || {})[st.wallet]; return s ? s.balance : D.wallet.balance; };
  CK.walletLine = function () { var s = (D.wallet.states || {})[st.wallet] || {}; return 'Wallet ' + CK.money(s.balance != null ? s.balance : D.wallet.balance) + (s.runway ? ' · ' + s.runway + (/calls/.test(s.runway) ? '' : ' of calls') : ''); };

  /* ---------- the call kind (CK §1.1): computed from the target and the revision, never chosen ---------- */
  CK.kindOf = function (target) { return !target ? 'none' : target.kind === 'self' ? 'test' : 'real'; };
  CK.targetName = function (t) { return !t ? '' : t.kind === 'lead' ? t.lead.name : t.kind === 'self' ? 'your phone' : t.display; };
  CK.kindTag = function (kind) {
    if (kind === 'test') return '<span class="tag tag--outline">' + V.icon('flask-conical', 'xs') + 'Test call</span>';
    if (kind === 'browser') return '<span class="tag tag--outline">' + V.icon('monitor', 'xs') + 'Browser test</span>';
    return '';
  };
  /* describeCallKind(kind, target, rate): the one sentence for the card, the gate subtitle and aria-describedby */
  CK.describe = function (kind, t) {
    var rate = '₹' + CK.RATE.toFixed(2) + '/s';
    if (kind === 'test') return { line: 'Test call to your phone ' + CK.self.masked + ' · billed at ' + rate + ' · not counted in reports', sr: 'Test call to your phone. Billed at ' + rate.replace('/s', ' per second') + '. Not counted in reports.' };
    if (kind === 'real') return { line: 'Real call to ' + CK.targetName(t) + ' · billed at ' + rate, sr: 'Real call. Billed at ' + rate.replace('/s', ' per second') + '.' };
    if (kind === 'browser') return { line: 'Uses your microphone. Nobody else is called.', sr: 'Uses your microphone. Nobody else is called.' };
    return { line: '', sr: '' };
  };
  CK.primaryLabel = function (t) {
    if (!t) return { full: 'Place call…', short: 'Place call…' };
    if (t.kind === 'self') return { full: 'Call my phone…', short: 'Call my phone…' };
    if (t.kind === 'lead') return { full: 'Call ' + t.lead.name + '…', short: 'Call lead…' };
    return { full: 'Call ' + t.display + '…', short: 'Call number…' };
  };
  CK.liveCallFor = function (lead) { return (CK.calls || []).filter(function (c) { return c.lead && lead && c.lead.id === lead.id && ['dialling', 'ringing', 'live', 'hold'].indexOf(c.state) >= 0; })[0] || null; };

  /* ---------- readiness: the G §5.1 catalogue for this page (CK §1.3). ctx 'card' collapses passing rows; 'gate' shows all. ---------- */
  function hoursOpen() { return !CK.has('after-hours'); }
  /* the same callback wording as Leads: due today at a time, or overdue with when it was due (R2C-05) */
  function cbText(at) { var t = Date.parse(at); return t < CK.now() ? 'callback overdue · was due ' + V.fmt.when(at, { time: true }).replace(/^Yesterday/, 'yesterday').replace(/^Today/, 'today') : 'callback due today, ' + V.fmt.time(at); }
  CK.hoursText = function () { return hoursOpen() ? 'Inside calling hours · open until 5 pm IST' : 'Outside calling hours. Opens 10 am IST tomorrow.'; };
  CK.readiness = function (kind, ctx) {
    var rows = [], f = CK.flow(), t = st.target, lead = t && t.kind === 'lead' ? t.lead : null;
    var phone = kind === 'real' || kind === 'test' || kind === 'none';
    function add(r) { rows.push(r); }
    if (!phone) return rows;
    if (!st.online) add({ id: 'connection', kind: 'blocking', global: true, text: "You’re offline.", meta: 'Calls start again when you reconnect.' });
    if (st.role !== 'admin') add({ id: 'role', kind: 'blocking', global: true, text: "Your role can’t place phone calls. Ask an admin.", act: { label: 'Ask an admin', run: 'ask-admin' } });
    if (st.walletUnknown) add({ id: 'wallet', kind: 'unknown', text: "Couldn’t check the wallet.", meta: "Can’t confirm your balance yet.", act: { label: 'Retry', run: 'retry-wallet' } });
    else if (st.wallet === 'empty') add({ id: 'wallet', kind: 'blocking', global: true, text: 'Wallet is ₹0. Top up to place phone calls.', act: { label: 'Top up', run: 'topup' } });
    else if (st.wallet === 'low') add({ id: 'wallet', kind: 'advisory-warn', text: '₹42.10 left · about 17 min of calls', act: { label: 'Top up', run: 'topup' } });
    else if (st.wallet === 'autopay-failed') add({ id: 'wallet', kind: 'advisory-warn', text: "Autopay couldn’t top up. ₹42.10 left · about 17 min of calls", act: { label: 'Fix autopay', href: 'billing.html#autopay' } });
    else if (st.wallet === 'pending') add({ id: 'wallet', kind: 'advisory', text: 'Payment pending · ₹42.10 available now', meta: 'Your wallet updates when UPI confirms.' });
    else add({ id: 'wallet', kind: 'pass', text: CK.walletLine() });
    if (CK.has('unverified')) add({ id: 'caller_id', kind: 'blocking', global: true, text: 'Verify a caller ID before placing phone calls.', act: { label: 'Phone setup', href: 'settings.html#phone/caller-id' } });
    else add({ id: 'caller_id', kind: 'pass', text: 'Caller ID ' + D.org.callerId.masked + ' verified' });
    if (!f) {
      if (!CK.has('flows-failed')) add({ id: 'flow_live', kind: 'blocking', global: true, text: 'No live flow. Publish a flow to call leads.', act: { label: 'New flow', href: 'flow-designer.html?new=1' } });
    } else if (kind === 'test') {
      add({ id: 'flow_live', kind: 'pass', text: f.name + (f.draft ? ' Draft v' + f.version + ' · test calls only' : ' v' + f.version + ' is live'), meta: f.tested ? 'Test call on this version ' + V.fmt.when(f.tested.at, { time: true }).replace(/^Today/, 'today') : 'Not tested since it was saved' });
    } else if (f.draft && kind !== 'none') {
      var liveV = f.live ? f.live.version : null;
      add({ id: 'flow_live', kind: 'blocking', text: 'Draft v' + f.version + ' can only call your own number.' + (liveV ? ' Use Live v' + liveV + ' or Call my phone.' : ' Call my phone to test it.'), links: (liveV ? [{ label: 'Use Live v' + liveV, run: 'use-live' }] : []).concat([{ label: 'Call my phone', run: 'use-self' }]) });
    } else if (f.draft) {
      add({ id: 'flow_live', kind: 'advisory', text: 'Draft v' + f.version + ' calls only your own number.', meta: 'Real calls need a live version.' });
    } else {
      add({ id: 'flow_live', kind: 'pass', text: f.name + ' v' + f.version + ' is live', meta: f.tested ? 'Test call on this version ' + V.fmt.when(f.tested.at, { time: true }).replace(/^Today/, 'today') : null });
      if (!f.tested || CK.has('untested')) add({ id: 'flow_tested', kind: 'advisory', text: 'Live v' + f.version + " hasn’t been tested since it was published. Talk in browser first.", act: { label: 'Talk in browser', run: 'talk' } });
    }
    if (kind === 'real' || kind === 'none') {
      if (hoursOpen()) add({ id: 'calling_hours', kind: 'pass', text: CK.hoursText() });
      else add({ id: 'calling_hours', kind: ctx === 'gate' && !CK.st.gateSchedule ? 'blocking' : 'advisory-warn', text: CK.hoursText(), meta: 'Sunday calling hours ended at 11 am IST · Mon to Sat, 10 am to 7 pm IST', act: ctx === 'gate' ? { label: 'Schedule', run: 'schedule' } : { label: 'Schedule…', run: 'open-gate' }, hours: true });
    }
    if (lead && kind === 'real') {
      var busy = CK.liveCallFor(lead);
      if (busy) add({ id: 'in_call', kind: 'blocking', text: lead.name + ' is on a call right now.', meta: 'Started by Vaani · ' + busy.flow.name + ' v' + busy.flow.version, act: { label: 'Open call', run: 'open-call:' + busy.id } });
      if (lead.status === 'do_not_call') add({ id: 'do_not_call', kind: 'blocking', text: lead.name + ' is marked Do not call.', meta: 'Asked not to be called · change it on the lead', act: { label: 'Open lead', href: 'leads.html?lead=' + lead.id } });
      else if (CK.has('dnd')) add({ id: 'dnd', kind: 'blocking', text: "This number is on the DND list. It can’t be called for promotions.", act: { label: 'Open lead', href: 'leads.html?lead=' + lead.id } });
      else add({ id: 'dnd', kind: 'pass', text: 'Not on the DND list' });
      var lc = lead.lastCall;
      if (lc && CK.now() - Date.parse(lc.at) < 24 * 3600 * 1000) {
        var mins = Math.round((CK.now() - Date.parse(lc.at)) / 60000), ago = mins < 60 ? mins + ' min ago' : Math.round(mins / 60) + ' h ago';
        add({ id: 'recent_call', kind: 'advisory', text: 'Called ' + ago + ' · ' + lc.outcome + (lead.callbackAt ? ' · ' + cbText(lead.callbackAt) : '') });
      } else if (lead.callbackAt) add({ id: 'recent_call', kind: 'advisory', text: cbText(lead.callbackAt).replace(/^c/, 'C') });
    }
    var ORDER = { blocking: 0, unknown: 1, checking: 2, adjusted: 3, 'advisory-warn': 4, advisory: 5, pass: 6 };
    return rows.sort(function (a, b) { return ORDER[a.kind] - ORDER[b.kind]; });
  };
  CK.summary = function (rows, noun) {
    var bl = rows.filter(function (r) { return r.kind === 'blocking'; }).length, un = rows.filter(function (r) { return r.kind === 'unknown'; }).length;
    var adv = rows.filter(function (r) { return /advisory|adjusted/.test(r.kind); }).length, n = rows.length;
    if (bl + un && bl) return { tone: 'blocked', icon: 'circle-x', text: (noun || 'Phone calls') + ' blocked · ' + (bl + un) + ' thing' + (bl + un > 1 ? 's' : '') + ' to fix' };
    if (un) return { tone: 'warn', icon: 'circle-help', text: "Couldn’t finish the checks · Retry" };
    if (adv) return { tone: 'ok', icon: 'circle-check', text: 'Ready · ' + adv + ' thing' + (adv > 1 ? 's' : '') + ' to know' };
    return { tone: 'ok', icon: 'circle-check', text: 'All ' + n + ' checks pass' };
  };
  var MARK = { pass: ['pass', 'check', 'Passed: '], blocking: ['block', 'x', 'Blocking: '], unknown: ['unknown', 'circle-help', "Couldn’t check: "], advisory: ['advisory', 'info', 'Note: '], 'advisory-warn': ['advisory-warn', 'triangle-alert', 'Warning: '], adjusted: ['adjusted', 'minus', 'Adjusted: '] };
  /* GateCheckRow markup (G §2.2); actions carry data-ck-act so one delegated handler runs them. */
  CK.rowHtml = function (r) {
    var m = MARK[r.kind] || MARK.advisory, act = '';
    if (r.act) act = r.act.href ? '<a class="gate-act" href="' + esc(r.act.href) + '">' + esc(r.act.label) + '</a>' : '<button type="button" class="btn btn--link gate-act" data-ck-act="' + esc(r.act.run) + '">' + esc(r.act.label) + '</button>';
    var links = r.links ? '<span class="gate-meta ck-row-links">' + r.links.map(function (l) { return '<button type="button" class="btn btn--link" data-ck-act="' + esc(l.run) + '">' + esc(l.label) + '</button>'; }).join(' · ') + '</span>' : '';
    return '<li class="gate-row" data-check="' + esc(r.id) + '"><span class="gate-mark gate-mark--' + m[0] + '" data-mark aria-hidden="true">' + V.icon(m[1]) + '</span><span class="gate-text"><span class="sr-only">' + m[2] + '</span>' + esc(r.text) + (r.meta ? '<span class="gate-meta">' + esc(r.meta) + '</span>' : '') + links + '</span>' + act + '</li>';
  };
  CK.sumHtml = function (s, id) { return '<p class="gate-sum gate-sum--' + s.tone + '"' + (id ? ' id="' + id + '"' : '') + '>' + V.icon(s.icon, 'sm') + esc(s.text) + '</p>'; };

  /* ---------- announcements: state changes debounced (--timing-state-announce 500 ms); turns throttled (2 s) ---------- */
  var stateT = null;
  CK.announceState = function (msg) { clearTimeout(stateT); stateT = setTimeout(function () { V.announce(msg, { dedupeKey: 'ck-state' }); }, 500); };
  var lastTurnAt = 0, pendingTurn = null, pendingMore = 0, turnT = null;
  CK.readAloud = true;
  CK.announceTurn = function (who, text) {
    if (!CK.readAloud) return;
    var now = Date.now();
    if (now - lastTurnAt >= 2000 && !turnT) { lastTurnAt = now; V.announce(who + ': ' + text, { dedupeKey: 'ck-turn' }); return; }
    if (pendingTurn) pendingMore += 1; pendingTurn = { who: who, text: text };
    if (!turnT) turnT = setTimeout(function () { turnT = null; lastTurnAt = Date.now(); var p = pendingTurn; pendingTurn = null; V.announce(p.who + ': ' + p.text + (pendingMore ? ', and ' + pendingMore + ' more' : ''), { dedupeKey: 'ck-turn' }); pendingMore = 0; }, Math.max(0, 2000 - (now - lastTurnAt)));
  };
  /* <title>: the state word only, never a name or a ticking timer (CK §1.4, R §11.5) */
  CK.title = function (word) { V.setTitle(null, word || null); };

  /* ---------- small helpers ---------- */
  CK.$ = U.$; CK.$$ = U.$$; CK.h = U.h; CK.esc = esc;
  CK.rm = function () { return V.reducedMotion(); };
  CK.phone = function () { return V.bp.phone(); };
  CK.desk = function () { return V.bp.desktopShell(); };
  CK.wide = function () { return V.bp.desktopShell() && w.innerWidth >= 1440; };
  /* Programmatic focus (06-accessibility, focus table): a non-interactive target (a heading, a status line, a region) gets
     tabindex="-1" plus data-focus-target, so it draws no ring; controls and roving items keep their focus ring. */
  CK.focus = function (el) {
    if (!el) return;
    if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName)) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      if (el.getAttribute('tabindex') === '-1' && !el.hasAttribute('role') && !el.hasAttribute('data-roving')) el.setAttribute('data-focus-target', '');
    }
    el.focus({ preventScroll: false });
  };
  CK.srOpenNew = '<span class="sr-only"> (opens in a new tab)</span>';
})(window, document);
