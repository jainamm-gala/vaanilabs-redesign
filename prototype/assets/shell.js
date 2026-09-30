/* =====================================================================================================
   Vaani Labs prototype · shell.js — app shell behaviours and shared UI helpers on window.Vaani.
   Load after icons.js and data.js (all three with `defer`). Pages then use window.Vaani in pages/<page>.js.
   Modules (each an IIFE on window.Vaani): 1 core (utils, fmt, nav config, status map, ui helpers, prefs, announce)
   · 2 overlays (layers, focus trap, dialog, confirm, drawer/sheet, popover, menu, tooltip, positioning)
   · 3 toast, saveState, shortcuts + the ? sheet, command palette · 4 shell chrome (sidebar, rail, top bar, bottom bar,
   nav sheet, More sheet, Baseline, account and workspace menus) · 5 widgets (tabs, segmented, select, combobox,
   switch, slider, password toggle, tables) and boot.
   The public contract is documented in prototype/_foundation-notes.md. Everything else is private.
   ===================================================================================================== */
(function (w, d) {
  'use strict';
  var V = w.Vaani = w.Vaani || {};
  V.version = '1.0.0';
  var DATA = w.VAANI_DATA || {};
  V.data = DATA;
  /* The shared demo role (?role=admin|member|viewer, 05 §1.10): one switch for the workspace switcher, the account menu,
     admin-only nav badges and every page that reads DATA.user.role. Pages may still narrow it page-locally. */
  (function () {
    var q = ''; try { q = (new URLSearchParams(w.location.search).get('role') || '').toLowerCase(); } catch (e) { /* no search */ }
    if (q !== 'admin' && q !== 'member' && q !== 'viewer') return;
    var R = q.charAt(0).toUpperCase() + q.slice(1);
    if (DATA.user) DATA.user.role = R; if (DATA.org) DATA.org.role = R;
    (DATA.workspaces || []).forEach(function (x) { if (x.current) x.role = R; });
  })();
  V.role = function () { return (DATA.user && DATA.user.role) || (DATA.org && DATA.org.role) || 'Admin'; };
  V.isAdmin = function () { return V.role() === 'Admin'; };

  /* ---------- utilities ---------- */
  function esc(s) { return s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(sel, root) { return (root || d).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }
  function h(html) { var t = d.createElement('template'); t.innerHTML = String(html).trim(); return t.content.firstElementChild; }
  function icon(name, size, opts) { return w.VaaniIcon ? w.VaaniIcon(name, size, opts) : ''; }
  var uidN = 0;
  function uid(prefix) { uidN += 1; return (prefix || 'v') + '-' + uidN; }
  var store = {
    get: function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { w.localStorage.setItem(k, v); } catch (e) { /* storage blocked: preference stays for this page only */ } },
    remove: function (k) { try { w.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  function on(evt, fn) { d.addEventListener('vaani:' + evt, function (e) { fn(e.detail); }); }
  function emit(evt, detail) { d.dispatchEvent(new CustomEvent('vaani:' + evt, { detail: detail })); }
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
  function mq(q) { return w.matchMedia(q).matches; }
  V.util = { esc: esc, $: $, $$: $$, h: h, icon: icon, uid: uid, store: store, isMac: isMac };
  V.icon = icon; V.on = on; V.emit = emit;

  /* ---------- breakpoints (05-responsive §2.4; CSS decides layout, JS only follows) ---------- */
  V.bp = {
    shell: function () { var W = w.innerWidth, H = w.innerHeight; if (W < 768) return 'bottombar'; if (W < 1024 || H < 600) return 'topbar'; return W < 1280 ? 'rail' : 'sidebar'; },
    current: function () { var W = w.innerWidth; return W < 768 ? 'phone' : W < 1024 ? 'tablet' : W < 1280 ? 'laptop-s' : W < 1440 ? 'laptop' : 'desktop'; },
    phone: function () { return w.innerWidth < 768; },
    desktopShell: function () { return w.innerWidth >= 1024 && w.innerHeight >= 600; },
    coarse: function () { return mq('(pointer: coarse)'); },
    compactHeight: function () { return w.innerWidth >= 1024 && w.innerHeight <= 720 && w.innerHeight >= 600; }
  };
  V.reducedMotion = function () { return d.documentElement.getAttribute('data-motion') === 'reduce' || mq('(prefers-reduced-motion: reduce)'); };

  /* ---------- formatting (lib/format.ts equivalent; en-IN, IST, lowercase am/pm) ---------- */
  var NOW = new Date(DATA.meta ? DATA.meta.now : Date.now());
  var IST = 330 * 60000;
  function parts(iso) { var t = new Date(iso); var z = new Date(t.getTime() + IST); return { y: z.getUTCFullYear(), m: z.getUTCMonth(), d: z.getUTCDate(), H: z.getUTCHours(), M: z.getUTCMinutes(), wd: z.getUTCDay(), t: t }; }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var nfCount = new Intl.NumberFormat('en-IN');
  var nfMoney2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nfMoney0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  var NBSP = ' ', MINUS = '−';
  function dayIndex(p) { return Date.UTC(p.y, p.m, p.d) / 86400000; }
  V.fmt = {
    now: function () { return NOW; },
    count: function (n, o) { if (n == null) return '–'; if (o && o.compact && n > 99999) return (n / 100000).toFixed(1).replace(/\.0$/, '') + ' L'; return nfCount.format(n); },
    money: function (v, o) { if (v == null) return '–'; o = o || {}; var s = (o.whole || (Math.round(v) === v && o.auto)) ? nfMoney0.format(Math.abs(v)) : nfMoney2.format(Math.abs(v)); return (v < 0 ? MINUS : '') + '₹' + s; },
    moneyShort: function (v) { var a = Math.abs(v), s = a >= 1e7 ? (a / 1e7).toFixed(1).replace(/\.0$/, '') + ' Cr' : a >= 1e5 ? (a / 1e5).toFixed(0) + ' L' : nfMoney0.format(a); return (v < 0 ? MINUS : '') + '₹' + s; },
    duration: function (sec) { if (!sec) return '–'; var hh = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60); return hh ? hh + 'h ' + m + 'm' : m ? m + 'm ' + s + 's' : s + 's'; },
    timecode: function (sec) { sec = Math.max(0, Math.round(sec)); var hh = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; var mm = (m < 10 ? '0' : '') + m, ss = (s < 10 ? '0' : '') + s; return hh ? hh + ':' + mm + ':' + ss : mm + ':' + ss; },
    time: function (iso) { var p = parts(iso), H = p.H % 12 || 12; return H + ':' + (p.M < 10 ? '0' : '') + p.M + NBSP + (p.H < 12 ? 'am' : 'pm'); },
    date: function (iso) { var p = parts(iso); return p.d + ' ' + MON[p.m] + ' ' + p.y; },
    dateShort: function (iso) { var p = parts(iso); return p.d + ' ' + MON[p.m]; },
    weekday: function (iso) { return WD[parts(iso).wd]; },
    /* Today 10:42 am · Yesterday · 3 days ago · 21 Sep 2026 (direction §4.2 rule 6); o.time adds the time to Yesterday */
    when: function (iso, o) {
      if (!iso) return '–'; var p = parts(iso), n = parts(NOW.toISOString()), diff = dayIndex(n) - dayIndex(p);
      if (diff === 0) return 'Today ' + V.fmt.time(iso);
      if (diff === -1) return 'Tomorrow ' + V.fmt.time(iso);
      if (diff === 1) return 'Yesterday' + (o && o.time ? ' ' + V.fmt.time(iso) : '');
      if (diff > 1 && diff < 7) return diff + ' days ago';
      return V.fmt.date(iso);
    },
    whenAbs: function (iso) { var p = parts(iso); return WD[p.wd] + ', ' + p.d + ' ' + MON[p.m] + ' ' + p.y + ', ' + V.fmt.time(iso) + ' IST'; },
    latency: function (ms) { return Math.round(ms) + NBSP + 'ms'; },
    pct: function (x) { return Math.round(x * 100) + '%'; },
    bytes: function (b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + NBSP + 'MB' : Math.max(1, Math.round(b / 1024)) + NBSP + 'KB'; },
    /* formatRunway (05-knowledge-billing §3, lib/format.ts): floored, conservative. under a minute · about N min · 1–10 h to
       5 min ("about 3 h 25 min") · 10–99 h whole hours · 100 h and more floored to 10 h. Pair it with the rate it used. */
    runway: function (balance, rate) {
      var s = Math.floor((balance || 0) / (rate || 0.04)); if (s < 60) return 'under a minute';
      if (s < 3600) return 'about ' + Math.floor(s / 60) + ' min';
      var hh = Math.floor(s / 3600);
      if (hh < 10) { var m = Math.floor(s % 3600 / 60 / 5) * 5; return 'about ' + hh + ' h' + (m ? ' ' + m + ' min' : ''); }
      return 'about ' + (hh < 100 ? hh : Math.floor(hh / 10) * 10) + ' h';
    },
    /* "2 calls · about 1 to 2 min each · ₹5 to ₹10" (gate §3.2): lo and hi in minutes, n after adjustments */
    callRange: function (n, lo, hi, rate) { rate = rate || 0.04; var low = Math.floor(n * lo * 60 * rate), high = Math.ceil(n * hi * 60 * rate); return n + ' call' + (n === 1 ? '' : 's') + ' · about ' + lo + ' to ' + hi + ' min' + (n > 1 ? ' each' : '') + ' · ₹' + nfCount.format(low) + ' to ₹' + nfCount.format(high); }
  };

  /* ---------- the one nav config (03-pages/00 §2.6). Hrefs point at the prototype’s page files. ---------- */
  V.NAV = [
    { id: 'home', label: 'Home', href: 'index.html', icon: 'house', group: 'operate', keywords: ['setup', 'checklist', 'get started', 'first call'], visible: function () { return !V.setupComplete(); } },
    { id: 'cockpit', label: 'Cockpit', href: 'cockpit.html', icon: 'activity', group: 'operate', phoneSlot: 1, keywords: ['dashboard', 'agent view', 'live calls', 'test call'], badge: function (s) { return s.liveCalls > 0 ? { kind: 'live', text: s.liveCalls + ' live', sr: s.liveCalls + ' live calls' } : null; } },
    { id: 'assistant', label: 'Assistant', href: 'assistant.html', icon: 'bot', group: 'operate', keywords: ['chat', 'copilot', 'ask'], badge: function (s) { var n = s.assistantWaiting; return n ? { kind: 'count', text: (n > 99 ? '99+' : n) + ' waiting', sr: n + (n === 1 ? ' plan' : ' plans') + ' waiting for your approval' } : null; } },
    { id: 'rep-console', label: 'Rep console', href: 'rep-console.html', icon: 'headphones', group: 'operate', keywords: ['softphone', 'transfer', 'human'], badge: function (s) { var p = s.repPresence; return p === 'available' ? { kind: 'live', text: 'Available', sr: 'available' } : p === 'ringing' ? { kind: 'pending', icon: 'phone-call', text: 'Ringing', sr: 'incoming call' } : p === 'oncall' || p === 'hold' ? { kind: 'live', text: 'On call', sr: 'on a call' } : null; } },
    { id: 'meetings', label: 'Meetings', href: 'agents.html?view=meetings', icon: 'video', group: 'operate', keywords: ['meeting agent', 'meet', 'rooms', 'notes'] },
    { id: 'personal-agents', label: 'Personal agents', href: 'agents.html?view=personal-agents', icon: 'list-checks', group: 'operate', keywords: ['tasks', 'delegate'], badge: function (s) { return count(s.tasksToConfirm, 'to confirm', 'tasks waiting for you to confirm', 'task waiting for you to confirm'); } },
    { id: 'flows', label: 'Flows', href: 'flow-designer.html', icon: 'workflow', group: 'build', phoneSlot: 4, keywords: ['flow builder', 'flow designer', 'script', 'call flow'], badge: function (s) { return count(s.flowsWithDrafts, 'draft', 'flows with unpublished changes', 'flow with unpublished changes'); } },
    { id: 'knowledge', label: 'Knowledge', href: 'knowledge.html', icon: 'book-open', group: 'build', keywords: ['documents', 'files', 'faq', 'price sheet'], badge: function (s) { return V.isAdmin() ? count(s.proposals, 'to review', 'proposals to review', 'proposal to review') : null; } },
    { id: 'leads', label: 'Leads', href: 'leads.html', icon: 'users', group: 'data', phoneSlot: 2, keywords: ['contacts', 'crm', 'customers'], badge: function (s) { return count(s.callbacksDueToday, 'due', 'callbacks due today', 'callback due today'); } },
    { id: 'call-reports', label: 'Call reports', href: 'call-reports.html', icon: 'file-text', group: 'data', phoneSlot: 3, keywords: ['reports', 'call log', 'history', 'transcripts', 'recordings'] },
    { id: 'analytics', label: 'Analytics', href: 'analytics.html', icon: 'chart-column', group: 'data', keywords: ['insights', 'sentiment', 'intents'] },
    { id: 'billing', label: 'Billing', href: 'billing.html', icon: 'wallet', group: 'account', keywords: ['wallet', 'recharge', 'top up', 'invoices', 'usage', 'plans', 'autopay'], badge: function () { var st = V.walletState(); return st === 'low' ? warn('Low', 'wallet low') : st === 'empty' ? warn('Empty', 'wallet empty') : st === 'autopay-failed' ? warn('Blocked', 'autopay failed') : null; } },
    { id: 'settings', label: 'Settings', href: 'settings.html', icon: 'sliders-horizontal', group: 'account', keywords: ['preferences', 'profile', 'api keys'], badge: function (s) { return s.numberStatus === 'unverified' ? warn('Verify', 'calling number not verified') : null; } }
  ];
  V.GROUPS = { operate: 'Operate', build: 'Build', data: 'Data', account: 'Account' };
  function count(n, word, srMany, srOne) { if (!n) return null; var t = n > 99 ? '99+' : String(n); return { kind: 'count', text: t + ' ' + word, sr: t + ' ' + (n === 1 && srOne ? srOne : srMany) }; }
  function warn(word, sr) { return { kind: 'warning', text: word, sr: sr }; }
  V.navById = function (id) { for (var i = 0; i < V.NAV.length; i++) if (V.NAV[i].id === id) return V.NAV[i]; return null; };
  V.navVisible = function () { return V.NAV.filter(function (n) { return !n.visible || n.visible(); }); };
  /* One coherent default workspace (R2C-04, F-UX-006): the demo data holds 2,579 placed calls, so the default workspace has finished setup.
     ?setup=incomplete (Home’s Prototype states, sign-up) shows the setup track and persists for the session; ?setup=done restores the default. */
  V.setupComplete = function () { var q = new URLSearchParams(w.location.search).get('setup'); if (q === 'done') store.set('vaani:setup', 'done'); if (q === 'incomplete') store.set('vaani:setup', 'incomplete'); return !!(DATA.setup && DATA.setup.completedAt) || store.get('vaani:setup') !== 'incomplete'; };
  V.walletState = function () { if (V.wallet && V.wallet._set) return V.wallet._set.state; var q = new URLSearchParams(w.location.search).get('wallet'); return q || (DATA.wallet && DATA.wallet.state) || 'healthy'; };
  V.badge = function (entry) { return entry.badge ? entry.badge(DATA.state || {}) : null; };

  /* ---------- the one status map (data-nav §5.3, lib/status.ts): word · icon · tone. Never Neel for a record state. ---------- */
  V.STATUS = {
    lead: { 'new': ['New', 'circle-dot', 'neutral'], contacted: ['Contacted', 'phone', 'neutral'], callback_due: ['Callback due', 'clock', 'warning'], interested: ['Interested', 'thumbs-up', 'success'], not_interested: ['Not interested', 'circle-slash', 'neutral'], not_reached: ['Not reached', 'phone-missed', 'neutral'], converted: ['Converted', 'circle-check', 'success'], do_not_call: ['Do not call', 'ban', 'danger'] },
    callResult: { completed: ['Completed', 'check', 'success'], no_answer: ['No answer', 'phone-missed', 'neutral'], busy: ['Busy', 'phone-off', 'neutral'], voicemail: ['Voicemail', 'voicemail', 'neutral'], failed: ['Failed', 'circle-x', 'danger'], timed_out: ['Timed out', 'clock', 'warning'] },
    outcome: { 'Visit booked': ['Visit booked', 'circle-check', 'success'], Interested: ['Interested', 'thumbs-up', 'success'], Callback: ['Callback', 'clock', 'warning'], 'Call later': ['Call later', 'clock', 'warning'], 'Not interested': ['Not interested', 'circle-slash', 'neutral'], 'No answer': ['No answer', 'phone-missed', 'neutral'], Busy: ['Busy', 'phone-off', 'neutral'], Voicemail: ['Voicemail', 'voicemail', 'neutral'], Transferred: ['Transferred', 'phone-forwarded', 'neutral'], Failed: ['Failed', 'circle-x', 'danger'], 'Do not call': ['Do not call', 'ban', 'danger'], 'Test call': ['Test call', 'check', 'neutral'], 'Promise to pay': ['Promise to pay', 'check', 'neutral'], Talked: ['Talked', 'check', 'neutral'] },
    sentiment: { positive: ['Positive', 'smile', 'success'], neutral: ['Neutral', 'meh', 'neutral'], mixed: ['Mixed', 'contrast', 'neutral'], negative: ['Negative', 'frown', 'danger'], unscored: ['Unscored', 'circle-dashed', 'outline'] },
    flow: { live: ['Live v{v}', 'live-dot', 'success'], draft: ['Draft · {n} changes', 'chevron-down', 'neutral'], 'not-published': ['Not published', null, 'outline'], publishing: ['Publishing…', 'spinner', 'info'], 'save-failed': ["Couldn’t save", 'triangle-alert', 'danger'], archived: ['Archived', null, 'outline'] },
    validation: { ok: ['No issues', 'check', 'success'], warning: ['{n} warning', 'triangle-alert', 'warning'], warnings: ['{n} warnings', 'triangle-alert', 'warning'], error: ['{n} error', 'circle-x', 'danger'], errors: ['{n} errors', 'circle-x', 'danger'] },
    knowledge: { indexed: ['Indexed', 'check', 'success'], queued: ['Queued', 'clock', 'neutral'], uploading: ['Uploading…', 'spinner', 'info'], reading: ['Reading…', 'spinner', 'info'], indexing: ['Indexing… {n}%', 'spinner', 'info'], upload_failed: ["Couldn’t upload", 'circle-x', 'danger'], failed: ["Couldn’t index", 'circle-x', 'danger'] },
    autopay: { on: ['On', 'check', 'success'], off: ['Off', null, 'outline'], waiting: ['Waiting for approval', 'clock', 'info'], paused: ['Paused', 'circle-pause', 'warning'], renewal: ['Needs mandate renewal', 'triangle-alert', 'warning'] },
    payment: { completed: ['Completed', 'check', 'success'], pending: ['Pending', 'clock', 'info'], failed: ['Failed', 'circle-x', 'danger'], refunded: ['Refunded', 'undo-2', 'neutral'], expired: ['Expired', 'timer-off', 'neutral'] },
    invoice: { paid: ['Paid', 'check', 'success'], refunded: ['Refunded', 'undo-2', 'neutral'], 'credit-note': ['Credit note', 'file-minus', 'outline'] },
    proposal: { pending: ['Pending', 'clock', 'info'], added: ['Added', 'check', 'success'], dismissed: ['Dismissed', 'x', 'neutral'] },
    room: { live: ['Live', 'live-dot', 'success'], open: ['Open', 'door-open', 'neutral'], 'long-open': ['Open {n}', 'triangle-alert', 'warning'], scheduled: ['Scheduled', 'calendar-clock', 'info'], ending: ['Ending…', 'spinner', 'info'], ended: ['Ended', null, 'neutral'], stale: ['Stale', 'triangle-alert', 'warning'] },
    notes: { ready: ['Summary ready', 'check', 'success'], writing: ['Writing notes…', 'spinner', 'info'], off: ['Notes off', null, 'outline'], failed: ["Couldn’t write notes", 'circle-x', 'danger'] },
    plan: { waiting: ['Waiting for you', 'pause', 'warning'], running: ['Running', 'spinner', 'info'], done: ['Done', 'check', 'success'], blocked: ['Blocked', 'lock', 'warning'], failed: ['Failed', 'circle-x', 'danger'], skipped: ['Skipped', 'minus', 'neutral'], expired: ['Expired', 'timer-off', 'neutral'], stopped: ['Stopped', 'circle-slash', 'neutral'] },
    task: { queued: ['Queued', 'clock', 'neutral'], working: ['Working', 'play', 'info'], waiting: ['Waiting for you', 'pause', 'warning'], scheduled: ['Scheduled', 'calendar-clock', 'info'], paused: ['Paused', 'circle-pause', 'neutral'], limit: ['Stopped at limit', 'octagon-pause', 'warning'], blocked: ['Blocked', 'lock', 'warning'], done: ['Done', 'check', 'success'], failed: ['Failed', 'circle-x', 'danger'], cancelled: ['Cancelled', 'circle-slash', 'neutral'] },
    integration: { connected: ['Connected', 'check', 'success'], attention: ['Reconnect needed', 'triangle-alert', 'warning'], 'not-connected': ['Not connected', null, 'outline'], connecting: ['Connecting…', 'spinner', 'info'] },
    webhook: { healthy: ['Active', 'check', 'success'], failing: ['Failing', 'circle-x', 'danger'], paused: ['Paused', 'circle-pause', 'outline'] },
    /* webhook deliveries (06-settings §7.9): statusTag('delivery', 'error', { n: 500 }) */
    delivery: { ok: ['200 OK', 'check', 'success'], error: ['{n}', 'circle-x', 'danger'], timeout: ['Timed out', 'clock', 'warning'] },
    apiKey: { active: ['Active', 'check', 'success'], revoked: ['Revoked {v}', null, 'neutral'] },
    /* the inbound number (Analytics “Calls to your number”, Settings › Phone setup) */
    number: { ready: ['Ready', 'check', 'success'], pending: ['Pending', 'clock', 'warning'], none: ['No number', null, 'outline'] },
    review: { reviewed: ['Reviewed', 'check', 'outline'] }
  };
  var TONE = { neutral: 'tag', success: 'tag tag--success', warning: 'tag tag--warning', danger: 'tag tag--danger', info: 'tag tag--info', outline: 'tag tag--outline' };
  function glyph(name, size) { return name === 'live-dot' ? '<span class="live-dot" data-mark></span>' : name === 'spinner' ? icon('loader-circle', size, { className: 'spinner' }) : name ? icon(name, size) : ''; }
  /* StatusTag: domain + value only (no tone/icon/label props). o.v version, o.n count, o.size 'lg', o.plain (icon + word, no fill). */
  V.statusDef = function (domain, value) { var m = V.STATUS[domain]; return m && m[value] ? m[value] : null; };
  V.ui = {};
  V.ui.statusTag = function (domain, value, o) {
    o = o || {}; var def = V.statusDef(domain, value);
    if (!def) { if (w.console) console.warn('StatusTag: unknown ' + domain + '/' + value); def = [String(value), null, 'neutral']; }
    var word = def[0].replace('{v}', o.v != null ? o.v : '').replace('{n}', o.n != null ? o.n : '');
    if (o.plain) return '<span class="status status--md status--plain">' + glyph(def[1], 'md') + esc(word) + '</span>';
    return '<span class="' + TONE[def[2]] + (o.size === 'lg' ? ' tag--lg' : '') + '">' + glyph(def[1], 'xs') + esc(word) + '</span>';
  };
  /* CallStateTag (data-nav §12.1): one call-state machine, word + icon + tone, optional timer */
  V.CALL_STATE = { idle: ['Idle', 'phone', 'idle'], dialling: ['Dialling…', 'phone-outgoing', 'dialling'], ringing: ['Ringing…', 'phone-call', 'ringing'], live: ['Live', 'live-dot', 'live'], hold: ['On hold', 'pause', 'hold'], wrapup: ['Wrap-up', 'clipboard-check', 'wrapup'], ended: ['Ended', 'phone-off', 'ended'], no_answer: ['No answer', 'phone-missed', 'ended'], busy: ['Busy', 'phone-off', 'ended'], voicemail: ['Voicemail', 'voicemail', 'ended'], failed: ['Failed', 'circle-x', 'failed'] };
  V.ui.callState = function (state, o) {
    o = o || {}; var s = V.CALL_STATE[state] || V.CALL_STATE.idle;
    var g = state === 'live' ? '<span class="live-dot' + (o.pulse ? ' live-dot--pulse' : '') + '" data-mark></span>' : icon(s[1], 'xs');
    return '<span class="cs cs--' + s[2] + '">' + g + esc(s[0]) + (o.timer ? ' <span class="cs-t num" role="timer">' + esc(o.timer) + '</span>' : '') + '</span>';
  };
  V.langByCode = function (code) { var L = DATA.languages || []; for (var i = 0; i < L.length; i++) if (L[i].code === code) return L[i]; return { code: code, name: code, glyph: code, lang: code }; };
  /* LanguageMark: 'name' (tables, lists) · 'full' (pickers, call-header legend) · 'compact' (turn rows only) */
  V.ui.langMark = function (code, variant) {
    var L = V.langByCode(code);
    if (variant === 'compact') return '<span class="lm-g" role="img" aria-label="' + esc(L.name) + '" lang="' + esc(L.lang) + '">' + esc(L.glyph) + '</span>';
    if (variant === 'full') return '<span class="lm"><span class="lm-g" lang="' + esc(L.lang) + '" aria-hidden="true">' + esc(L.glyph) + '</span>' + esc(L.name) + '</span>';
    return '<span class="lm">' + esc(L.name) + '</span>';
  };
  V.ui.phoneText = function (phone, o) {
    var masked = typeof phone === 'string' ? phone : phone.masked, last4 = masked.slice(-4);
    return '<span class="phone-text' + (o && o.size === 'sm' ? ' phone-text--sm' : '') + '" translate="no" aria-label="Phone ending ' + esc(last4) + '">' + esc(masked) + '</span>';
  };
  V.ui.initials = function (name) { return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join(''); };
  /* Avatar: person (round), voice (square tile), ws (ink tile). Hidden from AT when the name is adjacent. */
  V.ui.avatar = function (name, o) {
    o = o || {}; var size = o.size || 28, kind = o.kind || 'person';
    var cls = 'av' + (size === 20 ? ' av--20' : size === 32 ? ' av--32' : '') + (kind === 'voice' ? ' av--voice' : kind === 'ws' ? ' av--ws' : '');
    var text = kind === 'voice' ? (o.tile || String(name).slice(0, 2)) : size === 20 ? V.ui.initials(name).slice(0, 1) : V.ui.initials(name);
    return '<span class="' + cls + '"' + (o.label ? ' role="img" aria-label="' + esc(name) + '"' : ' aria-hidden="true"') + '>' + esc(text) + '</span>';
  };
  /* Kbd: platform-aware keycaps; single-key hints carry data-single-key so the shortcut switch hides them. */
  V.ui.kbd = function (keys, o) {
    keys = Array.isArray(keys) ? keys : String(keys).split('+');
    var single = keys.length === 1 && /^.$/.test(keys[0]) || (o && o.single);
    var inner = keys.map(function (k) {
      var lk = k.toLowerCase();
      if (lk === 'mod') return isMac ? '<kbd class="kbd"><span class="sr-only">Command</span>' + icon('command', 'xs') + '</kbd>' : '<kbd class="kbd">Ctrl</kbd>';
      if (lk === 'shift') return isMac ? '<kbd class="kbd"><span class="sr-only">Shift</span>' + icon('arrow-big-up', 'xs') + '</kbd>' : '<kbd class="kbd">Shift</kbd>';
      if (lk === 'alt') return isMac ? '<kbd class="kbd"><span class="sr-only">Option</span>' + icon('option', 'xs') + '</kbd>' : '<kbd class="kbd">Alt</kbd>';
      if (lk === 'enter') return '<kbd class="kbd"><span class="sr-only">Enter</span>' + icon('corner-down-left', 'xs') + '</kbd>';
      if (lk === 'escape' || lk === 'esc') return '<kbd class="kbd">Esc</kbd>';
      if (lk === 'up') return '<kbd class="kbd"><span class="sr-only">Up</span>' + icon('arrow-up', 'xs') + '</kbd>';
      if (lk === 'down') return '<kbd class="kbd"><span class="sr-only">Down</span>' + icon('arrow-down', 'xs') + '</kbd>';
      /* named keys in title case: F6, F10, Delete, Home, Space, Tab (never "f6" or "delete") */
      var name = k.length === 1 ? k.toUpperCase() : /^f\d{1,2}$/i.test(k) ? k.toUpperCase() : /^[a-z]/.test(k) ? k.charAt(0).toUpperCase() + k.slice(1) : k;
      return '<kbd class="kbd">' + esc(name) + '</kbd>';
    }).join('');
    return '<kbd class="kbd-set"' + (single ? ' data-single-key' : '') + '>' + inner + '</kbd>';
  };

  /* ---------- preferences: theme, motion, single-key shortcuts (all in localStorage, wrapped in try/catch) ---------- */
  var root = d.documentElement, darkMq = w.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    var pref = V.theme.get(), t = pref === 'light' || pref === 'dark' ? pref : (darkMq.matches ? 'dark' : 'light');
    root.setAttribute('data-theme', t);
    var meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
  }
  V.theme = {
    get: function () { var t = store.get('vaani:theme'); return t === 'light' || t === 'dark' ? t : 'system'; },
    resolved: function () { return root.getAttribute('data-theme') || 'light'; },
    set: function (v) { if (v === 'light' || v === 'dark') store.set('vaani:theme', v); else store.remove('vaani:theme'); applyTheme(); emit('theme', V.theme.get()); }
  };
  (darkMq.addEventListener ? darkMq.addEventListener.bind(darkMq, 'change') : darkMq.addListener.bind(darkMq))(function () { if (V.theme.get() === 'system') applyTheme(); });
  V.motion = {
    get: function () { return store.get('vaani:motion') === 'reduce' ? 'reduce' : 'system'; },
    set: function (v) { if (v === 'reduce') { store.set('vaani:motion', 'reduce'); root.setAttribute('data-motion', 'reduce'); } else { store.remove('vaani:motion'); root.removeAttribute('data-motion'); } emit('motion', V.motion.get()); }
  };
  V.density = {
    get: function (key) { return store.get('vaani:density:' + (key || 'default')) === 'compact' ? 'compact' : 'standard'; },
    set: function (el, value, key) { if (el) el.setAttribute('data-density', value); store.set('vaani:density:' + (key || 'default'), value); emit('density', { key: key, value: value }); }
  };
  applyTheme();
  if (V.motion.get() === 'reduce') root.setAttribute('data-motion', 'reduce');

  /* ---------- announcer: one polite region (+ an assertive one for failures the user must act on) ---------- */
  /* Throttled per dedupeKey (2 s). Every message gets a sequence number; a deferred message is dropped when a newer
     message has already been spoken in the same region, so a stale "Call 9 of 9" never lands after "All 9 calls reviewed"
     (04 §2.10). Speaking a message also cancels the region’s older deferred messages. */
  var last = {}, timers = {}, seq = 0, spoken = { polite: 0, assertive: 0 };
  function region(assertive) {
    var sel = assertive ? '[data-vaani="announcer-assertive"]' : '[data-vaani="announcer"]', el = $(sel);
    if (!el) { el = h('<div class="sr-only" ' + (assertive ? 'role="alert" aria-live="assertive"' : 'role="status" aria-live="polite"') + ' data-vaani="' + (assertive ? 'announcer-assertive' : 'announcer') + '"></div>'); d.body.appendChild(el); }
    return el;
  }
  V.announce = function (msg, o) {
    o = o || {}; var key = o.dedupeKey || msg, now = Date.now(), rk = o.politeness === 'assertive' ? 'assertive' : 'polite', el = region(rk === 'assertive');
    seq += 1; var mine = seq, tk = rk + '\u0000' + key;
    var speak = function () {
      delete timers[tk];
      if (spoken[rk] > mine) return;                       /* a newer message already went out: this one is stale */
      spoken[rk] = mine; last[key] = Date.now();
      Object.keys(timers).forEach(function (k) { if (k.indexOf(rk + '\u0000') === 0) { clearTimeout(timers[k].t); delete timers[k]; } });
      el.textContent = ''; setTimeout(function () { if (spoken[rk] === mine) el.textContent = msg; }, 30);
    };
    if (last[key] && now - last[key] < 2000) { if (timers[tk]) clearTimeout(timers[tk].t); timers[tk] = { t: setTimeout(speak, 2000 - (now - last[key])) }; return; }
    speak();
  };
})(window, document);

/* ---------- 2a. Overlays: portal, stack, focus trap, dialog, confirm, drawer (overlay §1–4) ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, h = U.h, esc = U.esc;
  var FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  function visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden'; }
  function focusables(root) { return $$(FOCUSABLE, root).filter(function (el) { return visible(el) && !el.closest('[inert]'); }); }
  function byId(x) { return typeof x === 'string' ? d.getElementById(x.replace(/^#/, '')) : x; }
  function portal() { var p = $('[data-vaani="portal"]'); if (!p) { p = h('<div class="portal" data-vaani="portal"></div>'); d.body.appendChild(p); } return p; }
  V.util.focusables = focusables; V.util.portal = portal; V.util.byId = byId; V.util.visible = visible;
  /* Focus moved by the overlay system (open, return) is programmatic: it must not open a tooltip, or the first Esc
     only hides that tooltip and a second Esc is needed to close the overlay (overlay §1.3–1.4). */
  var quiet = false;
  function focusQuiet(el) { if (!el) return; quiet = true; try { el.focus({ preventScroll: true }); } finally { quiet = false; } }
  V.util.focusQuiet = focusQuiet; V.util.isQuietFocus = function () { return quiet; };

  /* The overlay stack. Esc closes the top-most entry; modal entries make .app inert and trap Tab. */
  var stack = [];
  V.overlays = { stack: stack, top: function () { return stack[stack.length - 1] || null; }, closeAll: function () { while (stack.length) stack[stack.length - 1].close('all'); } };
  function syncInert() {
    var modal = stack.some(function (e) { return e.modal; });
    [$('.app'), $('.skip-link')].concat($$('[data-inert-root]')).forEach(function (el) { if (!el) return; if (modal) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    d.documentElement.style.overflow = modal && V.bp.phone() ? 'hidden' : '';
    /* a modal opened over another overlay (a phone gate over the call sheet) makes every overlay below it inert too (R2D-04) */
    var topModal = -1; stack.forEach(function (e, i) { if (e.modal) topModal = i; });
    stack.forEach(function (e, i) { var n = e.el && (e.el.closest('.layer') || e.el); if (!n) return;
      if (i < topModal) { if (!n.hasAttribute('inert')) { n.setAttribute('inert', ''); n._vStackInert = true; } }
      else if (n._vStackInert) { n.removeAttribute('inert'); n._vStackInert = false; } });
  }
  function resolveDetached(t) {
    var n = t.id && d.getElementById(t.id); if (n) return n;
    var ac = t.getAttribute && t.getAttribute('aria-controls'); if (ac) { n = d.querySelector('[aria-controls="' + ac + '"]'); if (n) return n; }
    var nm = t.getAttribute && t.getAttribute('data-name'); if (nm) { n = d.querySelector('[data-select][data-name="' + nm + '"]'); if (n) return n; }
    return null;
  }
  V.util = V.util || {}; V.util.resolveDetached = resolveDetached;
  function fallbackFocus() { return $('#page-title') || $('main h1') || $('main'); }
  function returnFocus(entry) {
    var t = entry.returnTo;
    if (t && t.nodeType === 1 && !d.contains(t)) t = resolveDetached(t) || t;   /* the trigger was re-rendered: find its replacement */
    if (t && d.contains(t) && visible(t) && !t.closest('[inert]')) { focusQuiet(t); return; }
    var f = entry.fallback || fallbackFocus(); if (f) { if (!f.hasAttribute('tabindex') && !f.matches(FOCUSABLE)) f.setAttribute('tabindex', '-1'); focusQuiet(f); }
  }
  function leave(el, done) {
    if (!el || V.reducedMotion()) { done(); return; }
    el.classList.add('is-leaving'); var finished = false;
    var fin = function () { if (finished) return; finished = true; el.classList.remove('is-leaving'); done(); };
    el.addEventListener('animationend', fin, { once: true }); setTimeout(fin, 160);
  }
  V.util.leave = leave;
  /* push(entry): entry = { el, modal, onClose(reason), returnTo, fallback, closable() } -> adds close() */
  function push(entry) {
    entry.close = function (reason) {
      if (entry.closed) return; if (entry.guard && entry.guard(reason) === false) return;
      entry.closed = true; var i = stack.indexOf(entry); if (i >= 0) stack.splice(i, 1);
      syncInert(); if (entry.onClose) entry.onClose(reason);
      if (reason !== 'navigate' && reason !== 'replace' && !entry.noReturn) returnFocus(entry);   /* noReturn: focus already left for a real target */
      V.emit('overlayclose', { el: entry.el, reason: reason });
    };
    stack.push(entry); syncInert(); return entry;
  }
  V.overlays.push = push;

  d.addEventListener('keydown', function (e) {
    var top = V.overlays.top(); if (!top) return;
    if (e.key === 'Escape' && !e.defaultPrevented) {
      if (top.busy) { e.preventDefault(); return; }
      e.preventDefault(); top.close('escape'); return;
    }
    if (e.key === 'Tab' && top.modal) {
      var f = focusables(top.el); if (!f.length) { e.preventDefault(); return; }
      var first = f[0], lastEl = f[f.length - 1], a = d.activeElement;
      if (!top.el.contains(a)) { e.preventDefault(); (e.shiftKey ? lastEl : first).focus(); return; }
      /* focus can sit on a non-tabbable target inside the overlay (the title with tabindex -1, the dialog itself):
         treat it as "before the first control" so Shift+Tab wraps to the last one instead of leaving the modal (gate §4.5) */
      var idx = f.indexOf(a);
      if (e.shiftKey && (a === first || idx < 0)) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && a === lastEl) { e.preventDefault(); first.focus(); }
    }
  });

  /* Mount a page-authored (or generated) overlay element into a layer in the portal; remember where it came from. */
  function mount(el, kind, o) {
    o = o || {};
    if (el._vFinishLeave) el._vFinishLeave();   /* reopened while its last close is still animating out: finish that close first */
    var layer = h('<div class="layer layer--' + kind + '"></div>');
    if (o.scrim !== false) layer.appendChild(h('<div class="scrim" data-vaani-scrim></div>'));
    var ph = null;
    if (el.parentNode && !o.generated) { ph = d.createComment('vaani-overlay-home'); el.parentNode.insertBefore(ph, el); }
    layer.appendChild(el); el.hidden = false; portal().appendChild(layer);
    return { layer: layer, unmount: function () {
      var finished = false, finish = function () { if (finished) return; finished = true; el._vFinishLeave = null; if (ph && ph.parentNode) { el.hidden = true; ph.parentNode.insertBefore(el, ph); ph.remove(); } else if (!o.generated) { el.hidden = true; } layer.remove(); };
      el._vFinishLeave = finish; leave(layer, finish);
    } };
  }
  function initialFocus(el, tone) {
    var t = $('[data-autofocus]', el) || (tone === 'danger' || tone === 'cancel' ? $('[data-cancel]', el) : null) || $('.dlg-title, .sheet-title, .gate-title, h2', el);
    if (!t) t = focusables(el)[0] || el;
    if (!t.matches(FOCUSABLE) || t.getAttribute('tabindex') === '-1' && /^(H\d|DIV|P|SPAN|SECTION)$/.test(t.tagName)) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.setAttribute('data-focus-target', ''); }
    focusQuiet(t);
  }

  V.overlays.mount = mount; V.overlays.initialFocus = initialFocus;

  /* ---------- Dialog (O §2): one modal at a time; inline discard state when dirty (O §2.5) ----------
     The footer’s own nodes are set aside (not re-serialised), so listeners bound to its buttons survive "Keep editing".
     Labels: data-discard (the sentence), data-keep-label, data-discard-label on the dialog or sheet (or o.discard). */
  function discardState(entry, noun) {
    var el = entry.el, foot = $('.dlg-foot, .sheet-foot', el); if (!foot || entry.discarding) return false;
    entry.discarding = true; var was = el.contains(d.activeElement) ? d.activeElement : null, frag = d.createDocumentFragment();
    while (foot.firstChild) frag.appendChild(foot.firstChild);
    noun = noun || el.getAttribute('data-discard') || 'Discard changes? What you typed will be lost.';
    foot.innerHTML = '<p class="dlg-why" role="status">' + esc(noun) + '</p><button type="button" class="btn" data-keep>' + esc(el.getAttribute('data-keep-label') || 'Keep editing') + '</button><button type="button" class="btn btn--danger" data-discard-now>' + esc(el.getAttribute('data-discard-label') || 'Discard') + '</button>';
    var restore = function () { foot.innerHTML = ''; foot.appendChild(frag); entry.discarding = false; };
    var keep = function () { restore(); var b = was && el.contains(was) ? was : focusables(el)[0]; if (b) b.focus(); if (entry.onKeep) entry.onKeep(); };
    $('[data-keep]', foot).addEventListener('click', keep);
    $('[data-discard-now]', foot).addEventListener('click', function () { el.removeAttribute('data-dirty'); restore(); entry.close('discard'); });
    $('[data-keep]', foot).focus(); entry.keep = keep; return true;
  }
  /* The close guard for dialogs and sheets: dirty = o.dirty() or data-dirty="true"; Esc in the discard state means "Keep editing". */
  function discardGuard(entry, o) {
    return function (reason) {
      if (entry.discarding) { if (reason === 'escape') { entry.keep(); return false; } if (reason === 'scrim' || reason === 'x' || reason === 'cancel') return false; return; }
      var dirty = o.dirty ? o.dirty() : entry.el.getAttribute('data-dirty') === 'true';
      if ((reason === 'escape' || reason === 'scrim' || reason === 'x' || reason === 'cancel') && dirty) { discardState(entry, o.discard); return false; }
    };
  }
  V.overlays.discardGuard = discardGuard;
  V.dialog = {
    open: function (x, o) {
      o = o || {}; var el = byId(x); if (!el) return null;
      if (V.overlays.top() && V.overlays.top().kind === 'dialog' && !o.replace) V.overlays.top().close('replace');
      var m = mount(el, 'dialog', { generated: o.generated });
      var entry = push({ el: el, kind: 'dialog', modal: true, returnTo: o.returnTo || d.activeElement, fallback: o.fallback,
        guard: function (reason) { return entry.guardFn(reason); },
        onClose: function (reason) { m.unmount(); if (o.onClose) o.onClose(reason); el.dispatchEvent(new CustomEvent('vaani:close', { detail: { reason: reason } })); } });
      entry.guardFn = discardGuard(entry, o);
      $('[data-vaani-scrim]', m.layer).addEventListener('click', function () { entry.close('scrim'); });
      m.layer.addEventListener('mousedown', function (e) { if (e.target === m.layer) entry.close('scrim'); });
      initialFocus(el, o.tone);
      el.dispatchEvent(new CustomEvent('vaani:open'));
      return entry;
    },
    close: function (x, reason) {
      var el = x ? byId(x) : null;
      for (var i = stack.length - 1; i >= 0; i--) if (stack[i].kind === 'dialog' && (!el || stack[i].el === el)) { stack[i].close(reason || 'x'); return; }
    },
    setBusy: function (x, busy) { var el = byId(x); stack.forEach(function (e) { if (e.el === el) e.busy = !!busy; }); if (el) el.setAttribute('aria-busy', busy ? 'true' : 'false'); },
    /* ConfirmDialog (O §3): title names the object; danger = outline danger button, focus on Cancel; typedConfirm for tier 3.
       o: { title, body | bodyHtml, bodyClass, impact: [{ icon, text | html }], confirmLabel, cancelLabel, tone: 'danger', focusCancel,
       typedConfirm: { value, label, hint, numeric, inputClass }, returnTo } -> Promise<boolean>. Tier 3 gets a close button;
       Enter in the typed field confirms once it matches; activating the disabled primary says why. */
    confirm: function (o) {
      return new Promise(function (resolve) {
        var id = U.uid('confirm'), danger = o.tone === 'danger', typed = o.typedConfirm, why = typed ? (typed.hint || 'Type the name to confirm.') : '';
        var html = '<div class="dlg dlg--sm" role="alertdialog" aria-modal="true" aria-labelledby="' + id + '-t" aria-describedby="' + id + '-b">' +
          '<div class="dlg-head"><h2 class="dlg-title" id="' + id + '-t">' + esc(o.title) + '</h2>' + (typed ? '<button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + V.icon('x') + '</button>' : '') + '</div>' +
          '<div class="dlg-body">' + (o.bodyHtml ? '<div id="' + id + '-b"' + (o.bodyClass ? ' class="' + esc(o.bodyClass) + '"' : '') + '>' + o.bodyHtml + '</div>' : '<p id="' + id + '-b">' + esc(o.body || '') + '</p>') +
          (o.impact ? '<ul class="impact">' + o.impact.map(function (i) { return '<li>' + V.icon(i.icon) + '<span>' + (i.html || esc(i.text)) + '</span></li>'; }).join('') + '</ul>' : '') +
          (typed ? '<div class="field"><label class="field-label" for="' + id + '-in">' + (typed.label ? esc(typed.label) : 'Type <b>&nbsp;' + esc(typed.value) + '&nbsp;</b> to confirm') + '</label><div class="input' + (typed.inputClass ? ' ' + esc(typed.inputClass) : '') + '"><input id="' + id + '-in" autocomplete="off" spellcheck="false"' + (typed.numeric ? ' inputmode="numeric"' : '') + ' data-autofocus></div></div>' : '') + '</div>' +
          '<div class="dlg-foot">' + (typed ? '<p class="dlg-why" id="' + id + '-why">' + esc(why) + '</p>' : '') +
          '<button type="button" class="btn btn--tertiary" data-cancel>' + esc(o.cancelLabel || 'Cancel') + '</button>' +
          '<button type="button" class="btn ' + (danger ? 'btn--danger' : 'btn--primary') + '" data-ok' + (typed ? ' aria-disabled="true" aria-describedby="' + id + '-why"' : '') + '>' + esc(o.confirmLabel || 'Confirm') + '</button></div></div>';
        var el = h(html), result = false;
        var entry = V.dialog.open(el, { generated: true, tone: o.focusCancel ? 'cancel' : o.tone, returnTo: o.returnTo, onClose: function () { resolve(result); } });
        var ok = $('[data-ok]', el), inp = typed ? $('input', el) : null;
        if (inp) {
          inp.addEventListener('input', function () {
            var match = inp.value.trim().normalize('NFC').toLowerCase() === String(typed.value).trim().normalize('NFC').toLowerCase();
            if (match) ok.removeAttribute('aria-disabled'); else ok.setAttribute('aria-disabled', 'true');
            $('#' + id + '-why', el).textContent = match ? '' : why;
          });
          inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } });
        }
        $('[data-cancel]', el).addEventListener('click', function () { entry.close('cancel'); });
        ok.addEventListener('click', function () { if (ok.getAttribute('aria-disabled') === 'true') { V.announce(why); return; } result = true; entry.close('confirm'); });
      });
    }
  };

  /* ---------- Drawer / Sheet (O §4): auto mode = docked ≥1440 (data-dockable in a .with-sheet), overlay 1024–1439, modal below ---------- */
  function headerBottom() { var ph = $('main .ph') || $('main [data-drawer-top]'); var top = ph ? ph.getBoundingClientRect().bottom : 0; return Math.max(0, Math.round(top)); }
  V.drawer = {
    open: function (x, o) {
      o = o || {}; var el = byId(x); if (!el) return null;
      V.drawer.close(el, 'replace'); if (el._vFinishLeave) el._vFinishLeave();
      var gate = el.classList.contains('gate') || el.classList.contains('sheet--gate');
      var mode = o.mode || 'auto', W = w.innerWidth;
      if (mode === 'auto') mode = gate ? 'modal' : (W >= 1440 && el.hasAttribute('data-dockable') && el.closest('.with-sheet') ? 'docked' : V.bp.desktopShell() ? 'overlay' : 'modal');
      var entry, m = null;
      if (mode === 'modal') {
        m = mount(el, 'sheet');
        entry = push({ el: el, kind: 'sheet', modal: true, returnTo: o.returnTo || d.activeElement, onClose: function (r) { m.unmount(); after(r); } });
        $('[data-vaani-scrim]', m.layer).addEventListener('click', function () { entry.close('scrim'); });
        el.setAttribute('aria-modal', 'true');
      } else {
        el.hidden = false; el.removeAttribute('aria-modal');
        el.classList.toggle('is-docked', mode === 'docked'); el.classList.toggle('is-overlay', mode === 'overlay');
        if (mode === 'overlay') { el.style.top = headerBottom() + 'px'; var bl = $('.app-col > .bl'); el.style.bottom = (bl && visible(bl) ? bl.offsetHeight : 0) + 'px'; }
        entry = push({ el: el, kind: 'sheet', modal: false, returnTo: o.returnTo || d.activeElement, onClose: function (r) {
          var fin = false, done = function () { if (fin) return; fin = true; el._vFinishLeave = null; el.hidden = true; el.classList.remove('is-docked', 'is-overlay', 'is-leaving'); el.style.top = el.style.bottom = ''; after(r); };
          if (mode === 'overlay') { el._vFinishLeave = done; leave(el, done); } else done(); } });
      }
      entry.mode = mode;
      /* o.dirty (function) or data-dirty="true" turns Esc, the scrim, × and Cancel into the inline discard state in .sheet-foot */
      entry.guard = discardGuard(entry, o);
      function after(r) { if (o.onClose) o.onClose(r); el.dispatchEvent(new CustomEvent('vaani:close', { detail: { reason: r } })); V.emit('drawerclose', { el: el, reason: r }); }
      if (mode === 'modal') initialFocus(el); else { var t = $('.sheet-title, .gate-title, h2', el) || el; if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.setAttribute('data-focus-target', ''); t.focus({ preventScroll: true }); }
      el.dispatchEvent(new CustomEvent('vaani:open', { detail: { mode: mode } }));
      V.emit('draweropen', { el: el, mode: mode });
      return entry;
    },
    close: function (x, reason) {
      var el = x ? byId(x) : null;
      for (var i = stack.length - 1; i >= 0; i--) if (stack[i].kind === 'sheet' && (!el || stack[i].el === el)) { stack[i].close(reason || 'x'); return true; }
      return false;
    },
    isOpen: function (x) { var el = byId(x); return stack.some(function (e) { return e.kind === 'sheet' && e.el === el; }); }
  };

  /* Declarative triggers: data-dialog-open / data-dialog-close / data-drawer-open / data-drawer-close / data-confirm */
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-dialog-open],[data-drawer-open],[data-dialog-close],[data-drawer-close]'); if (!t) return;
    if (t.getAttribute('aria-disabled') === 'true') return;
    if (t.hasAttribute('data-dialog-open')) { e.preventDefault(); V.dialog.open(t.getAttribute('data-dialog-open'), { returnTo: t }); }
    else if (t.hasAttribute('data-drawer-open')) { e.preventDefault(); V.drawer.open(t.getAttribute('data-drawer-open'), { returnTo: t }); }
    else if (t.hasAttribute('data-dialog-close')) { e.preventDefault(); var dl = t.closest('.dlg'); V.dialog.close(dl, 'x'); }
    else if (t.hasAttribute('data-drawer-close')) { e.preventDefault(); V.drawer.close(t.closest('.sheet, .gate'), 'x'); }
  });
})(window, document, window.Vaani);

/* ---------- 2b. Anchored overlays: positioning, popover (incl. the gate popover), menu, tooltip (overlay §5–7) ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, h = U.h, esc = U.esc, byId = U.byId;
  var PAD = 8, OFFSET = 4;
  /* place(el, anchor, placement): fixed positioning with flip and shift, never covering the trigger. */
  function place(el, anchor, placement) {
    placement = placement || 'bottom-start';
    var side = placement.split('-')[0], align = placement.split('-')[1] || 'center';
    var r = anchor.getBoundingClientRect(), vw = d.documentElement.clientWidth, vh = w.innerHeight;
    el.style.left = '0px'; el.style.top = '0px'; el.style.maxHeight = '';
    var b = el.getBoundingClientRect(), x, y;
    if (side === 'bottom' || side === 'top') {
      var below = vh - r.bottom - OFFSET - PAD, above = r.top - OFFSET - PAD;
      if (side === 'bottom' && b.height > below && above > below) side = 'top';
      if (side === 'top' && b.height > above && below > above) side = 'bottom';
      var room = side === 'bottom' ? below : above; if (b.height > room) { el.style.maxHeight = Math.max(120, room) + 'px'; b = el.getBoundingClientRect(); }
      y = side === 'bottom' ? r.bottom + OFFSET : r.top - OFFSET - b.height;
      x = align === 'start' ? r.left : align === 'end' ? r.right - b.width : r.left + r.width / 2 - b.width / 2;
    } else {
      var right = vw - r.right - OFFSET - PAD; if (side === 'right' && b.width > right) side = 'left';
      x = side === 'right' ? r.right + OFFSET * 2 : r.left - OFFSET * 2 - b.width;
      y = align === 'start' ? r.top : r.top + r.height / 2 - b.height / 2;
    }
    x = Math.min(Math.max(PAD, x), vw - b.width - PAD); y = Math.min(Math.max(PAD, y), vh - b.height - PAD);
    el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
    el.setAttribute('data-side', side);
  }
  V.util.place = place;

  /* Float an element in the portal next to its trigger; returns an overlay entry. Phones get a bottom sheet. */
  function float(el, trigger, o) {
    o = o || {};
    if (el._vFinishLeave) el._vFinishLeave();   /* reopened while its last close is still animating out: finish that close first */
    var home = d.createComment('vaani-float-home'); if (el.parentNode) el.parentNode.insertBefore(home, el);
    var sheet = V.bp.phone() && o.sheetOnPhone !== false, scrim = null;
    U.portal().appendChild(el); el.hidden = false; el.classList.add('is-floating');
    if (sheet) { el.classList.add('is-sheet'); scrim = h('<div class="float-scrim"></div>'); U.portal().insertBefore(scrim, el); }
    else place(el, trigger, o.placement);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    var reposition = function () { if (!sheet && d.contains(trigger)) place(el, trigger, o.placement); };
    w.addEventListener('resize', reposition); w.addEventListener('scroll', reposition, true);
    var entry = V.overlays.push({ el: el, kind: o.kind || 'popover', modal: !!o.modal || sheet, returnTo: trigger,
      onClose: function (reason) {
        w.removeEventListener('resize', reposition); w.removeEventListener('scroll', reposition, true);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        if (scrim) scrim.remove();
        /* inert while it animates out: a Tab that continues from the trigger must never land back inside it */
        var fin = false, done = function () { if (fin) return; fin = true; el._vFinishLeave = null; el.removeAttribute('inert'); el.classList.remove('is-floating', 'is-sheet', 'is-leaving'); el.hidden = true; el.style.left = el.style.top = el.style.maxHeight = ''; if (home.parentNode) { home.parentNode.insertBefore(el, home); home.remove(); } };
        el.setAttribute('inert', ''); el._vFinishLeave = done; U.leave(el, done);
        if (o.onClose) o.onClose(reason);
      } });
    if (scrim) scrim.addEventListener('click', function () { entry.close('scrim'); });
    entry.reposition = reposition;   /* call after the content grows (a gate’s preflight rows), so it stays clear of the trigger */
    return entry;
  }
  V.util.float = float;
  /* Outside pointer closes non-modal floats (and modal anchored gates, which have no scrim). */
  d.addEventListener('pointerdown', function (e) {
    var top = V.overlays.top(); if (!top || (top.kind !== 'popover' && top.kind !== 'menu')) return;
    if (top.el.contains(e.target) || (top.returnTo && top.returnTo.contains(e.target))) return;
    if (e.target.closest('.is-floating, .tooltip')) return;
    top.close('outside');
  }, true);

  /* ---------- Popover ---------- */
  function isCloser(x) { var l = (x.getAttribute('aria-label') || '').toLowerCase(); return x.hasAttribute('data-popover-close') || x.hasAttribute('data-drawer-close') || x.hasAttribute('data-dialog-close') || x.classList.contains('pop-close') || x.classList.contains('gate-close') || x.classList.contains('dlg-close') || l === 'close' || l.indexOf('close ') === 0; }
  V.popover = {
    open: function (trigger, x, o) {
      o = o || {}; var el = byId(x || trigger.getAttribute('data-popover')); if (!el) return null;
      var modal = o.modal != null ? o.modal : (el.classList.contains('gate') || el.getAttribute('aria-modal') === 'true');
      if (!el.getAttribute('role')) el.setAttribute('role', 'dialog');
      var entry = float(el, trigger, { kind: 'popover', modal: modal, placement: o.placement || trigger.getAttribute('data-placement') || 'bottom-start', onClose: o.onClose });
      /* Focus (overlay §1.3): data-autofocus, else the title of a modal gate, else the first meaningful control in the
         body (never the close button), else the title (read-mostly popovers), else the popover itself. */
      var title = $('.gate-title, .pop-title, h2, h3', el);
      var body = U.focusables(el).filter(function (x) { return !isCloser(x) && !x.closest('.pop-head, .gate-head, .pop-foot, .gate-foot'); });
      var first = $('[data-autofocus]', el) || (modal ? title : body[0] || title || U.focusables(el).filter(function (x) { return !isCloser(x); })[0]) || el;
      if (!first.hasAttribute('tabindex') && !first.matches('button, a, input, select, textarea')) { first.setAttribute('tabindex', '-1'); first.setAttribute('data-focus-target', ''); }
      U.focusQuiet(first);
      /* Non-modal (O §5.3): Tab past the last element closes and continues; see the Tab handler below. Focus moved out
         some other way (a script, an assistive tech’s cursor) closes it too, and stays where it went. */
      if (!modal) {
        entry.tabOut = true;
        el.addEventListener('focusout', function onOut(ev) { if (entry.closed) { el.removeEventListener('focusout', onOut); return; } var to = ev.relatedTarget; if (to && !el.contains(to) && !to.closest('.is-floating')) { el.removeEventListener('focusout', onOut); entry.noReturn = true; entry.close('tab'); } });
      }
      el.dispatchEvent(new CustomEvent('vaani:open'));
      return entry;
    },
    close: function (x) { var el = x ? byId(x) : null; var s = V.overlays.stack; for (var i = s.length - 1; i >= 0; i--) if (s[i].kind === 'popover' && (!el || s[i].el === el)) { s[i].close('x'); return; } },
    toggle: function (trigger, x, o) { if (trigger.getAttribute('aria-expanded') === 'true') V.popover.close(x); else V.popover.open(trigger, x, o); }
  };
  /* Tab out of a non-modal popover (O §5.3 "Tab past the last element closes and continues"; WCAG 2.4.3). The popover
     is portaled at the end of <body>, so the browser’s own next stop after its last control is the address bar and the
     one before its first is the end of the page: focus used to fall to <body> with the popover still open.
     Tab on the last tab stop: close (focus returns to the trigger), then move to the next tab stop after the trigger in
     DOM order. Shift+Tab on the first tab stop: close and land on the trigger, which precedes the popover in reading
     order. Runs at the document, after a Select or Menu opened inside the popover has closed on the same Tab.
     (The key’s default action is not reused: Chrome drops it once a keydown handler has moved focus.) */
  function tabStops(root, a) {
    var group = a && a.type === 'radio' && a.name ? a.name : null;
    return U.focusables(root).filter(function (x) {
      if (x.tabIndex < 0) return false;
      if (x.type === 'radio' && x.name && x !== a) {   /* one stop per radio group: the checked radio, else the first */
        if (x.name === group) return false;
        var g = $$('input[type="radio"]', x.form || d).filter(function (r) { return r.name === x.name; }), on = g.filter(function (r) { return r.checked; })[0];
        return on ? on === x : g[0] === x;
      }
      return true;
    });
  }
  function hasStop(root, a, back) {
    var bit = back ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
    return tabStops(root, a).some(function (x) { return x !== a && (a.compareDocumentPosition(x) & bit); });
  }
  /* The next tab stop after `from` (the closing popover is inert by now, so it is skipped). Inside a modal overlay the
     order wraps, as that overlay’s focus trap does. */
  function nextStop(from) {
    var top = V.overlays.top(), scope = top && top.modal && top.el.contains(from) ? top.el : d.body, all = tabStops(scope, from);
    return all.filter(function (x) { return x !== from && (from.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING); })[0] || (scope !== d.body ? all[0] : null) || null;
  }
  V.util.nextTabStop = nextStop;
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var top = V.overlays.top(); if (!top || !top.tabOut || top.modal || top.closed) return;
    var a = d.activeElement; if (!a || !top.el.contains(a) || hasStop(top.el, a, e.shiftKey)) return;
    e.preventDefault();
    top.close('tab');
    if (e.shiftKey) return;
    var from = d.activeElement, n = from && from !== d.body ? nextStop(from) : null;
    if (n) n.focus();
  });

  /* ---------- Menu (roving focus, typeahead, checkbox and radio items, one level of submenu) ---------- */
  function items(menu) { return $$('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]', menu).filter(function (i) { return i.closest('[role="menu"]') === menu && U.visible(i); }); }
  function openMenu(trigger, menu, o) {
    o = o || {};
    if (!menu.getAttribute('role')) menu.setAttribute('role', 'menu');
    items(menu).forEach(function (i) { i.setAttribute('tabindex', '-1'); });
    var many = items(menu).length > 5 || !!$('.menu-item--danger', menu);
    var entry = float(menu, trigger, { kind: 'menu', placement: o.placement || trigger.getAttribute('data-placement') || 'bottom-end', sheetOnPhone: many && !o.submenu, onClose: o.onClose });
    entry.submenu = !!o.submenu;
    var list = items(menu), start = o.last ? list[list.length - 1] : (list.filter(function (i) { return i.getAttribute('aria-disabled') !== 'true'; })[0] || list[0]);
    if (start) start.focus();
    var typed = '', typedAt = 0;
    menu.onkeydown = function (e) {
      var l = items(menu), i = l.indexOf(d.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (l[(i + 1) % l.length] || l[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (l[(i - 1 + l.length) % l.length] || l[0]).focus(); }
      else if (e.key === 'Home') { e.preventDefault(); l[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); l[l.length - 1].focus(); }
      else if (e.key === 'ArrowRight' && d.activeElement.hasAttribute('data-submenu')) { e.preventDefault(); d.activeElement.click(); }
      else if (e.key === 'ArrowLeft' && entry.submenu) { e.preventDefault(); entry.close('left'); }
      else if (e.key === 'Tab') { entry.close('tab'); var parent = V.overlays.top(); if (parent && parent.kind === 'menu') parent.close('tab'); }
      else if (e.key === 'Enter' || e.key === ' ') { if (d.activeElement && d.activeElement.getAttribute('role') && d.activeElement.getAttribute('role').indexOf('menuitem') === 0) { e.preventDefault(); d.activeElement.click(); } }
      else if (e.key.length === 1 && /\S/.test(e.key)) {
        var now = Date.now(); typed = now - typedAt > 700 ? e.key.toLowerCase() : typed + e.key.toLowerCase(); typedAt = now;
        var hit = l.filter(function (it) { return it.textContent.trim().toLowerCase().indexOf(typed) === 0; })[0]; if (hit) hit.focus();
      }
    };
    menu.onclick = function (e) {
      var it = e.target.closest('[role^="menuitem"]'); if (!it || it.closest('[role="menu"]') !== menu) return;
      if (it.getAttribute('aria-disabled') === 'true') { e.preventDefault(); V.announce(it.getAttribute('data-reason') || 'Not available'); return; }
      var role = it.getAttribute('role');
      if (it.hasAttribute('data-submenu')) { e.preventDefault(); var sub = byId(it.getAttribute('data-submenu')); if (sub) openMenu(it, sub, { placement: 'right-start', submenu: true }); return; }
      if (role === 'menuitemcheckbox') { it.setAttribute('aria-checked', it.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); }
      if (role === 'menuitemradio') { var g = it.closest('[role="group"]') || menu; $$('[role="menuitemradio"]', g).forEach(function (r) { r.setAttribute('aria-checked', r === it ? 'true' : 'false'); }); }
      menu.dispatchEvent(new CustomEvent('vaani:menuselect', { bubbles: true, detail: { item: it, value: it.getAttribute('data-value'), checked: it.getAttribute('aria-checked') === 'true' } }));
      if (role === 'menuitem' && !it.hasAttribute('data-keep-open')) { var s = V.overlays.stack; for (var k = s.length - 1; k >= 0; k--) if (s[k].kind === 'menu') s[k].close('select'); }
    };
    menu.onmouseover = function (e) { var it = e.target.closest('[role^="menuitem"]'); if (it && it.closest('[role="menu"]') === menu && d.activeElement !== it) it.focus({ preventScroll: true }); };
    return entry;
  }
  V.menu = {
    open: function (trigger, x, o) { var el = byId(x || trigger.getAttribute('data-menu') || trigger.getAttribute('aria-controls')); return el ? openMenu(trigger, el, o) : null; },
    close: function () { var s = V.overlays.stack; for (var i = s.length - 1; i >= 0; i--) if (s[i].kind === 'menu') s[i].close('x'); }
  };
  /* Declarative wiring: [data-menu="id"] (or aria-haspopup="menu" + aria-controls), [data-popover="id"], [data-popover-close] */
  d.addEventListener('click', function (e) { var pc = e.target.closest('[data-popover-close]'); if (pc) { var pe = pc.closest('.pop, .gate, [role="dialog"]'); V.popover.close(pe && pe.id ? pe.id : null); } });
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-menu],[aria-haspopup="menu"][aria-controls],[data-popover]'); if (!t || t.closest('[role="menu"]')) return;
    if (t.getAttribute('aria-disabled') === 'true') return;
    e.preventDefault();
    if (t.getAttribute('aria-expanded') === 'true') { if (t.hasAttribute('data-popover')) V.popover.close(t.getAttribute('data-popover')); else V.menu.close(); return; }
    if (t.hasAttribute('data-popover')) V.popover.open(t); else V.menu.open(t);
  });
  d.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('[data-menu],[aria-haspopup="menu"][aria-controls]');
    if (!t || t.closest('[role="menu"]') || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault(); if (t.getAttribute('aria-expanded') !== 'true') V.menu.open(t, null, { last: e.key === 'ArrowUp' });
  });

  /* ---------- Tooltip: 300 ms on hover, immediately on keyboard focus, hoverable, Esc hides without moving focus ---------- */
  var tip = null, tipFor = null, showTimer = null, lastHide = 0;
  function tipEl() { if (!tip) { tip = h('<div class="tooltip" role="tooltip" data-surface="inverse" id="vaani-tooltip" hidden></div>'); d.body.appendChild(tip); tip.addEventListener('pointerleave', function (e) { if (tipFor && !tipFor.contains(e.relatedTarget)) hideTip(); }); } return tip; }
  function tipTarget(el) { return el && el.closest ? el.closest('[data-tooltip],.ibtn[aria-label],.rail-item[aria-label],[data-tooltip-overflow]') : null; }
  function showTip(target) {
    var text = target.getAttribute('data-tooltip') || target.getAttribute('aria-label') || '';
    if (target.hasAttribute('data-tooltip-overflow')) { if (target.scrollWidth <= target.clientWidth) return; text = target.textContent.trim(); }
    if (!text || target.getAttribute('aria-expanded') === 'true') return;
    var t = tipEl(); var kbd = target.getAttribute('data-kbd');
    t.innerHTML = '<span>' + esc(text) + '</span>' + (kbd && !V.bp.coarse() ? V.ui.kbd(kbd) : '');
    t.hidden = false; tipFor = target;
    var label = target.getAttribute('aria-label');
    if (label !== text && target.getAttribute('data-tooltip-kind') !== 'label') target.setAttribute('aria-describedby', ((target.getAttribute('aria-describedby') || '').replace('vaani-tooltip', '') + ' vaani-tooltip').trim());
    place(t, target, (target.getAttribute('data-tooltip-side') || 'top') + '-center');
  }
  function hideTip() {
    clearTimeout(showTimer); if (!tip || tip.hidden) return;
    tip.hidden = true; lastHide = Date.now();
    if (tipFor) { var db = (tipFor.getAttribute('aria-describedby') || '').replace('vaani-tooltip', '').trim(); if (db) tipFor.setAttribute('aria-describedby', db); else tipFor.removeAttribute('aria-describedby'); }
    tipFor = null;
  }
  V.tooltip = { show: showTip, hide: hideTip, init: function () { /* delegated; nothing to bind per element */ } };
  d.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || w.matchMedia('(hover: none)').matches) return;
    var t = tipTarget(e.target); if (!t || t === tipFor) return;
    clearTimeout(showTimer);
    var delay = Date.now() - lastHide < 300 ? 0 : 300;
    showTimer = setTimeout(function () { hideTip(); showTip(t); }, delay);
  });
  d.addEventListener('pointerout', function (e) { var t = tipTarget(e.target); if (!t) return; if (t.contains(e.relatedTarget) || (tip && tip.contains(e.relatedTarget))) return; clearTimeout(showTimer); if (t === tipFor) hideTip(); });
  d.addEventListener('focusin', function (e) { var t = tipTarget(e.target); if (!t) { hideTip(); return; } if (U.isQuietFocus()) { hideTip(); return; } var kb = false; try { kb = t.matches(':focus-visible'); } catch (x) { kb = true; } if (kb) { hideTip(); showTip(t); } });
  d.addEventListener('focusout', function (e) { if (tipTarget(e.target) === tipFor) hideTip(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tip && !tip.hidden) { hideTip(); e.stopPropagation(); } }, true);
  d.addEventListener('pointerdown', function () { hideTip(); }, true);
  w.addEventListener('scroll', function () { hideTip(); }, true);
})(window, document, window.Vaani);

/* ---------- 3a. Toast, SaveState chip, shortcuts registry and the ? sheet (overlay §9, §18; 06-accessibility §8) ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, h = U.h, esc = U.esc, store = U.store;

  /* ---------- Toast: inverse, max 3 visible; success/info/publish 6 s (paused on hover and focus); error/undo stay ---------- */
  var ICON = { success: 'check', info: 'info', error: 'circle-alert', undo: 'undo-2', publish: 'check', progress: 'spinner' };
  var queue = [], lastFocus = null;
  function region() { var r = $('[data-vaani="toasts"]'); if (!r) { r = h('<div class="toast-region" role="region" aria-label="Notifications" data-vaani="toasts"></div>'); d.body.appendChild(r); } return r; }
  function modalOpen() { return V.overlays && V.overlays.stack.some(function (e) { return e.modal; }); }
  function toast(o) {
    if (typeof o === 'string') o = { message: o };
    var kind = o.kind || 'info';
    if (modalOpen() && !o.force) { queue.push(o); return { dismiss: function () {}, update: function () {}, done: function () {} }; }
    var r = region(), persistent = kind === 'error' || kind === 'undo' || kind === 'progress' || o.persistent;
    if (kind === 'error') { var same = $$('.toast[data-kind="error"]', r).filter(function (t) { return t.getAttribute('data-msg') === o.message; })[0]; if (same) { var n = +(same.getAttribute('data-n') || 1) + 1; same.setAttribute('data-n', n); $('.toast-msg', same).textContent = o.message + ' (' + n + ')'; return same._h; } }
    var el = h('<div class="toast" data-surface="inverse" data-kind="' + kind + '" role="' + (kind === 'error' ? 'alert' : 'status') + '" tabindex="-1">' +
      (ICON[kind] === 'spinner' ? V.icon('loader-circle', 'md', { className: 'spinner' }) : V.icon(ICON[kind] || 'info')) +
      '<p class="toast-msg">' + esc(o.message) + '</p>' +
      (o.action ? '<button type="button" class="toast-act">' + esc(o.action.label) + '</button>' : '') +
      '<button type="button" class="ibtn ibtn--sm" aria-label="Dismiss">' + V.icon('x', 'sm') + '</button>' +
      (kind === 'progress' ? '<span class="toast-bar" aria-hidden="true"><i style="--p:' + (o.value || 0) / 100 + '"></i></span>' : '') + '</div>');
    el.setAttribute('data-msg', o.message);
    var timer = null, remaining = 6000, started = 0;
    function start() { if (persistent) return; started = Date.now(); timer = setTimeout(dismiss, remaining); }
    function pause() { if (!timer) return; clearTimeout(timer); timer = null; remaining -= Date.now() - started; }
    function dismiss() { clearTimeout(timer); if (!el.parentNode) return; var hadFocus = el.contains(d.activeElement); U.leave(el, function () { el.remove(); }); if (hadFocus && lastFocus && d.contains(lastFocus)) lastFocus.focus(); if (o.onDismiss) o.onDismiss(); }
    var handle = {
      el: el, dismiss: dismiss,
      update: function (u) { if (u.message) { $('.toast-msg', el).textContent = u.message; } if (u.value != null) { var i = $('.toast-bar i', el); if (i) i.style.setProperty('--p', u.value / 100); } },
      done: function (k, msg) { el.remove(); return toast({ kind: k === 'error' ? 'error' : 'success', message: msg }); }
    };
    el._h = handle;
    el.querySelector('.ibtn').addEventListener('click', dismiss);
    if (o.action) $('.toast-act', el).addEventListener('click', function () { o.action.onClick && o.action.onClick(); dismiss(); });
    el.addEventListener('pointerenter', pause); el.addEventListener('pointerleave', function () { if (!timer && !persistent && !el.contains(d.activeElement)) start(); });
    el.addEventListener('focusin', pause); el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) start(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dismiss(); } });
    r.appendChild(el);
    var list = $$('.toast', r); if (list.length > 3) { var drop = list.filter(function (t) { var k = t.getAttribute('data-kind'); return k !== 'error' && k !== 'undo'; })[0] || list[0]; drop.remove(); }
    start();
    return handle;
  }
  ['success', 'info', 'error', 'undo', 'progress', 'publish'].forEach(function (k) { toast[k] = function (m, o) { o = o || {}; o.kind = k; o.message = m; return toast(o); }; });
  toast.focusNewest = function () { var l = $$('.toast', region()); var t = l[l.length - 1]; if (t) { lastFocus = d.activeElement; (t.querySelector('.toast-act') || t).focus(); } };
  V.toast = toast;
  V.on('overlayclose', function () { if (!modalOpen() && queue.length) { var q = queue.splice(0); q.forEach(function (o) { toast(o); }); } });

  /* ---------- SaveState chip (O §18.1): a pure view of the save machine; never "Up to date" ---------- */
  var SAVE = {
    saved: ['check', 'Saved {at}'], dirty: ['circle-dot', 'Unsaved changes'], saving: ['spinner', 'Saving…'], error: ['circle-alert', "Couldn’t save · Retry"],
    'new': ['circle-dot', 'Not saved yet'], offline: ['cloud-off', 'Offline · {edits} edits on this device'], conflict: ['triangle-alert', 'Changed elsewhere · Review'],
    device: ['hard-drive', 'Saved on this device {at}'], volatile: ['circle-alert', 'Not saved · this tab only']
  };
  V.saveState = {
    set: function (el, state, o) {
      o = o || {}; el = U.byId(el); if (!el) return; var def = SAVE[state] || SAVE.saved, prev = el.getAttribute('data-state');
      var label = def[1].replace('{at}', o.at || V.fmt.time(V.fmt.now().toISOString())).replace('{edits}', o.edits || 1);
      el.className = 'save save--' + state; el.setAttribute('data-state', state);
      el.innerHTML = (def[0] === 'spinner' ? V.icon('loader-circle', 'sm', { className: 'spinner' }) : V.icon(def[0], 'sm')) + '<span>' + esc(label) + '</span>';
      var interactive = state === 'error' || state === 'conflict';
      if (interactive) { el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); } else { el.removeAttribute('role'); el.removeAttribute('tabindex'); }
      if (o.tooltip) el.setAttribute('data-tooltip', o.tooltip); else el.removeAttribute('data-tooltip');
      if (!el._wired) { el._wired = true; var act = function () { var s = el.getAttribute('data-state'); if (s === 'error') el.dispatchEvent(new CustomEvent('vaani:retry', { bubbles: true })); if (s === 'conflict') el.dispatchEvent(new CustomEvent('vaani:review', { bubbles: true })); };
        el.addEventListener('click', act); el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }); }
      if (state !== prev) {
        if (state === 'error') { V.announce("Couldn’t save. Your edits are on this device.", { politeness: 'assertive', dedupeKey: 'save' }); if (!o.silent) V.toast.error("Couldn’t save. Your last edits are on this device.", { action: { label: 'Retry', onClick: function () { el.dispatchEvent(new CustomEvent('vaani:retry', { bubbles: true })); } } }); }
        else if (state === 'conflict' || state === 'volatile') V.announce(label, { politeness: 'assertive', dedupeKey: 'save' });
        else if (state === 'offline') V.announce(label, { dedupeKey: 'save' });
        else if (state === 'saved' && (prev === 'error' || prev === 'offline')) V.announce('Saved', { dedupeKey: 'save' });
      }
    }
  };

  /* ---------- Shortcuts: one document listener; single keys obey the switch (06-accessibility §8) ---------- */
  var REG = [], rid = 0;
  function norm(k) { return String(k).toLowerCase().replace(/\s+/g, '').replace('ctrl+', 'mod+').replace('cmd+', 'mod+').replace('meta+', 'mod+').replace('esc', 'escape').replace('escapeape', 'escape'); }
  function comboOf(e) {
    var k = e.key; if (!k) return '';
    if (k === '?') return '?';
    var mod = U.isMac ? e.metaKey : e.ctrlKey; var parts = [];
    if (mod) parts.push('mod'); if (e.altKey) parts.push('alt');
    var key = k.length === 1 ? k.toLowerCase() : k.toLowerCase();
    if (e.altKey && e.code && /^(Key|Digit)/.test(e.code)) key = e.code.replace(/^(Key|Digit)/, '').toLowerCase();
    /* Shift+digit and Alt+. / Alt+, by physical key, so 'shift+1' and 'alt+.' work on every layout and with macOS Option (06 §9.6) */
    if (e.shiftKey && e.code && /^Digitd$/.test(e.code)) key = e.code.slice(5);
    if (e.altKey && (e.code === 'Period' || e.code === 'Comma')) key = e.code === 'Period' ? '.' : ',';
    if (e.shiftKey && key.length === 1 && /[a-z0-9]/.test(key)) parts.push('shift');
    else if (e.shiftKey && key.length > 1) parts.push('shift');
    parts.push(key === ' ' ? 'space' : key);
    return parts.join('+');
  }
  function isSingle(k) { return k.indexOf('mod+') < 0 && k.indexOf('alt+') < 0 && !/^(shift\+)?f\d+$/.test(k) && k !== 'escape'; }
  var FIELD = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="combobox"], [role="textbox"]';
  function inScope(s) { if (!s.scope || s.scope === 'global' || s.scope === 'page') return true; var a = d.activeElement; return !!(a && a.closest && a.closest('[data-shortcut-scope~="' + s.scope + '"]')); }
  d.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.isComposing || e.keyCode === 229) return;
    var combo = comboOf(e), t = e.target;
    for (var i = REG.length - 1; i >= 0; i--) {
      var s = REG[i]; if (s.displayOnly || s.key !== combo) continue;
      if (s.singleKey && (!V.shortcuts.enabled() || e.repeat)) continue;
      if (t.closest && t.closest(FIELD) && (s.singleKey || (s.key !== 'mod+k' && !s.inFields))) continue;
      /* Enter or Space on a control activates it; chords with Ctrl/⌘ (Ctrl+Enter confirms a gate) still reach the registry */
      if ((e.key === 'Enter' || e.key === ' ') && combo.indexOf('mod+') !== 0 && t.closest && t.closest('button, a, [role="button"], [role="link"], summary')) continue;
      if (!inScope(s)) continue;
      var top = V.overlays && V.overlays.top();
      if (s.singleKey && top && top.modal && !(s.scope && top.el.contains(d.activeElement))) continue;
      if (s.when && !s.when(e)) continue;
      var res = s.handler(e); if (res !== false) e.preventDefault();
      return;
    }
  });
  V.shortcuts = {
    register: function (key, handler, o) {
      o = o || {}; var k = norm(key); rid += 1;
      var s = { id: rid, key: k, handler: handler || function () {}, description: o.description || '', group: o.group || 'Everywhere', section: o.section || null, scope: o.scope || 'global', singleKey: o.singleKey != null ? o.singleKey : isSingle(k), displayOnly: !!o.displayOnly, inFields: !!o.inFields, when: o.when, label: o.label, hidden: o.hidden };
      REG.push(s);
      /* F6 handlers read e.shiftKey for the previous region: the same handler also answers Shift+F6 unless the page registers its own */
      var twin = null; if (k === 'f6' && !o.displayOnly) { twin = { id: rid + 0.5, key: 'shift+f6', handler: s.handler, description: s.description, group: s.group, scope: s.scope, singleKey: false, displayOnly: false, inFields: s.inFields, when: s.when, hidden: function () { return true; } }; REG.push(twin); }
      return function () { [s, twin].forEach(function (x) { var i = REG.indexOf(x); if (i >= 0) REG.splice(i, 1); }); };
    },
    list: function () { return REG.slice(); },
    /* Page tabs in the ? sheet (FD1 §11.3): { id, label, groups: ['Flow Designer'] (registry groups this tab lists, split by
       each shortcut’s o.section in the order of t.sections), html: string | () => string (static content, e.g. a Legend),
       first: true (the sheet opens on it) }. Groups a tab claims leave the general "Everywhere" tab. Same id replaces. */
    addTab: function (t) { if (!t || !t.id) return; TABS = TABS.filter(function (x) { return x.id !== t.id; }); TABS.push(t); },
    removeTab: function (id) { TABS = TABS.filter(function (x) { return x.id !== id; }); },
    enabled: function () { return store.get('vaani:shortcuts') !== 'off'; },
    setEnabled: function (on) { if (on) store.remove('vaani:shortcuts'); else store.set('vaani:shortcuts', 'off'); d.documentElement.setAttribute('data-shortcuts', on ? 'on' : 'off'); V.announce(on ? 'Single-key shortcuts on' : 'Single-key shortcuts off'); V.emit('shortcuts', on); },
    openSheet: openSheet
  };
  d.documentElement.setAttribute('data-shortcuts', V.shortcuts.enabled() ? 'on' : 'off');

  /* The ? sheet: a real lg dialog, generated from the registry, with the single-key switch at the top. */
  var ORDER = ['Everywhere', 'Lists and tables', 'Records and sheets', 'Flow Designer', 'Forms'], TABS = [];
  function rowsOf(list) {
    var seen = {};
    return list.filter(function (s) { if (!s.description || seen[s.key + s.description] || (s.hidden && s.hidden())) return false; seen[s.key + s.description] = 1; return true; });
  }
  /* groups: [[name, [shortcuts]]]. Empty groups are skipped (a page without a search lists no "Lists and tables").
     The sheet flows in two balanced CSS columns at ≥768 (row by row, so one long group splits instead of running
     down one side); short groups stay whole. */
  function groupsHtml(groups) {
    return groups.map(function (g) {
      var rows = rowsOf(g[1]); if (!rows.length) return '';
      return '<section class="kbd-group' + (rows.length > 8 ? ' kbd-group--long' : '') + '"><h3>' + esc(g[0]) + '</h3><ul class="kbd-list">' + rows.map(function (s) {
        return '<li class="kbd-row"><span>' + esc(s.description) + '</span>' + V.ui.kbd(s.label || s.key.split('+'), { single: s.singleKey }) + (s.singleKey ? '<span class="kbd-row-off">Off</span>' : '') + '</li>';
      }).join('') + '</ul></section>';
    }).join('');
  }
  function openSheet(returnTo, o) {
    if (returnTo && !returnTo.nodeType) returnTo = null;   /* registered directly as a key handler: the argument is the event */
    o = o && !o.nodeType && typeof o === 'object' ? o : {};
    var on = V.shortcuts.enabled(), byGroup = {}, id = U.uid('kbd');
    REG.forEach(function (s) { (byGroup[s.group] = byGroup[s.group] || []).push(s); });
    var claimed = {}; TABS.forEach(function (t) { (t.groups || []).forEach(function (g) { claimed[g] = 1; }); });
    var general = Object.keys(byGroup).filter(function (g) { return !claimed[g]; }).sort(function (a, b) { var ia = ORDER.indexOf(a), ib = ORDER.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); }).map(function (g) { return [g, byGroup[g]]; });
    var panels = [];
    TABS.filter(function (t) { return t.groups; }).forEach(function (t) {
      var secs = {}, order = (t.sections || []).slice();
      t.groups.forEach(function (g) { (byGroup[g] || []).forEach(function (s) { var k = s.section || g; if (!secs[k]) { secs[k] = []; if (order.indexOf(k) < 0) order.push(k); } secs[k].push(s); }); });
      var html = groupsHtml(order.filter(function (k) { return secs[k]; }).map(function (k) { return [k, secs[k]]; }));
      if (html) panels.push({ id: t.id, label: t.label, html: '<div class="kbd-sheet">' + html + '</div>', first: t.first });
    });
    var gen = groupsHtml(general); if (gen) panels.push({ id: 'general', label: 'Everywhere', html: '<div class="kbd-sheet">' + gen + '</div>' });
    TABS.filter(function (t) { return !t.groups && t.html; }).forEach(function (t) { var x = typeof t.html === 'function' ? t.html() : t.html; if (x) panels.push({ id: t.id, label: t.label, html: '<div class="kbd-legend">' + x + '</div>', first: t.first }); });
    var start = panels.filter(function (p) { return o.tab ? p.id === o.tab : p.first; })[0] || panels[0];
    var content = panels.length < 2 ? (panels[0] ? panels[0].html : '<p class="type-body-14 u-fg-2">No shortcuts on this page.</p>')
      : '<div class="vtabs vtabs--panel kbd-tabs" role="tablist" aria-label="Shortcut sets">' + panels.map(function (p) { var sel = p === start; return '<button type="button" class="vtab" role="tab" id="' + id + '-tab-' + p.id + '" aria-controls="' + id + '-p-' + p.id + '" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '">' + esc(p.label) + '</button>'; }).join('') + '</div>' +
        panels.map(function (p) { return '<div class="kbd-panel" role="tabpanel" id="' + id + '-p-' + p.id + '" aria-labelledby="' + id + '-tab-' + p.id + '" tabindex="0"' + (p === start ? '' : ' hidden') + '>' + p.html + '</div>'; }).join('');
    var el = h('<div class="dlg dlg--lg dlg--kbd" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' +
      '<div class="dlg-head"><h2 class="dlg-title" id="' + id + '-t">Keyboard shortcuts</h2>' +
      '<button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + V.icon('x') + '</button></div>' +
      '<div class="dlg-body"><div class="setting-row"><div class="setting-row-text"><span class="setting-row-label" id="' + id + '-sw">Single-key shortcuts</span><span class="setting-row-desc">Turn off if you use speech input or a switch device. Shortcuts with Ctrl or ⌘ keep working.</span></div>' +
      '<button type="button" class="switch" role="switch" data-manual aria-checked="' + on + '" aria-labelledby="' + id + '-sw"><span class="switch-thumb"></span></button></div>' +
      content + '</div></div>');
    V.dialog.open(el, { generated: true, returnTo: returnTo || d.activeElement });
    $('.switch', el).addEventListener('click', function (e) { var b = e.currentTarget, nv = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', nv); V.shortcuts.setEnabled(nv); });
  }
})(window, document, window.Vaani);

/* ---------- 3b. CommandPalette "Search or jump" (overlay §8, 03-pages/00 §8). Never dials, bills or publishes. ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, h = U.h, esc = U.esc, store = U.store, DATA = V.data;
  var GROUPS = [['recent', 'Recent'], ['goto', 'Go to'], ['flows', 'Flows'], ['leads', 'Leads'], ['calls', 'Calls'], ['knowledge', 'Knowledge'], ['settings', 'Settings'], ['actions', 'Actions'], ['help', 'Help'], ['proto', 'Prototype pages']];
  /* Typed queries order the groups by their best match (§8.3 ranking); ties keep this order, so an action beats a destination. */
  var TIE = ['recent', 'actions', 'goto', 'settings', 'flows', 'leads', 'calls', 'knowledge', 'help', 'proto'];
  var extra = [];
  function go(href) { return function () { w.location.href = href; }; }
  function soon(what) { return function () { V.toast.info(what + ' opens outside this prototype.'); }; }
  function staticItems() {
    var list = [];
    V.navVisible().forEach(function (n) { list.push({ group: 'goto', title: n.label, icon: n.icon, keywords: n.keywords || [], end: 'Jump', perform: go(n.href) }); });
    [['Profile', 'profile', []], ['Organization and team', 'organization', ['members', 'invite', 'team']], ['Notifications', 'notifications', []], ['Integrations', 'integrations', ['calendly', 'crm', 'whatsapp']],
      ['Phone setup', 'phone', ['DID', 'virtual number', 'caller ID', 'calling number', 'call channel', 'inbound number']], ['API keys', 'api-keys', ['developer', 'token']], ['Webhooks', 'webhooks', []], ['Embed', 'embed', ['widget']],
      ['Security', 'security', ['2FA', 'password', 'sessions', 'email']], ['Activity', 'activity', ['audit', 'log']], ['Export data', 'export', []], ['Delete account', 'delete', []]
    ].forEach(function (s) { list.push({ group: 'settings', title: s[0], meta: 'Settings', icon: 'sliders-horizontal', keywords: s[2], perform: go('settings.html#' + s[1]) }); });
    ['Wallet', 'Usage', 'Plans', 'Invoices', 'Autopay'].forEach(function (t) { list.push({ group: 'settings', title: t, meta: 'Billing', icon: 'wallet', keywords: t === 'Wallet' ? ['recharge', 'balance'] : [], perform: go('billing.html#' + t.toLowerCase()) }); });
    var A = [
      ['New lead…', 'plus', 'leads.html?new=1', ['add lead', 'create lead']], ['Import leads…', 'upload', 'leads.html?import=1', ['csv', 'xlsx']], ['New flow…', 'workflow', 'flow-designer.html?new=1', ['template']],
      ['Upload files…', 'upload', 'knowledge.html?upload=1', ['documents']], ['Start a meeting…', 'video', 'agents.html?view=meetings&start=1', []], ['New task…', 'list-checks', 'agents.html?view=personal-agents&new=1', ['delegate']],
      ['Invite teammates…', 'user-plus', 'settings.html#organization?invite=1', ['members', 'team', 'invite']]];
    A.forEach(function (a) { list.push({ group: 'actions', title: a[0], icon: a[1], keywords: a[3], perform: go(a[2]) }); });
    list.push({ group: 'actions', title: 'Top up…', icon: 'wallet', keywords: ['recharge', 'wallet', 'add money'], perform: function () { V.openTopUp && V.openTopUp('palette'); } });
    ['System', 'Light', 'Dark'].forEach(function (t) { list.push({ group: 'actions', title: 'Theme: ' + t, icon: t === 'Dark' ? 'moon' : 'sun', keywords: ['theme', 'appearance', 'dark mode'], perform: function () { V.theme.set(t.toLowerCase()); V.toast.success('Theme: ' + t); } }); });
    list.push({ group: 'actions', title: V.motion.get() === 'reduce' ? 'Motion: Match system' : 'Motion: Reduce motion', icon: 'activity', keywords: ['animation', 'motion'], perform: function () { V.motion.set(V.motion.get() === 'reduce' ? 'system' : 'reduce'); } });
    list.push({ group: 'actions', title: V.shortcuts.enabled() ? 'Turn single-key shortcuts off' : 'Turn single-key shortcuts on', icon: 'keyboard', keywords: ['shortcuts', 'keyboard'], perform: function () { V.shortcuts.setEnabled(!V.shortcuts.enabled()); } });
    list.push({ group: 'actions', title: 'Keyboard shortcuts', icon: 'keyboard', kbd: '?', perform: function () { V.shortcuts.openSheet(); } });
    if (w.innerWidth >= 1280) list.push({ group: 'actions', title: d.documentElement.getAttribute('data-sidebar') === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar', icon: 'panel-left', kbd: '[', perform: function () { V.shell && V.shell.toggleSidebar(); } });
    list.push({ group: 'actions', title: 'Sign out…', icon: 'log-out', keywords: ['logout', 'exit'], perform: function () { V.shell && V.shell.signOut(); } });
    /* §8.3 Context: during setup the first suggested action on every route is the next step. Home replaces it (same id) with one that runs the step in place. */
    if (!V.setupComplete() && DATA.setup && DATA.setup.next) {
      var nx = String(DATA.setup.next); nx = nx.charAt(0).toUpperCase() + nx.slice(1);
      list.push({ id: 'continue-setup', group: 'actions', rank: 'top', icon: 'list-checks', title: 'Continue setup: ' + nx + '…', meta: 'Home · ' + DATA.setup.done + ' of ' + DATA.setup.total + ' done', keywords: ['setup', 'next step', 'continue', 'checklist', 'finish setup'], perform: go('index.html') });
    }
    /* Density: Standard / Compact drives the page’s own density control (the segmented control marked data-density-for). */
    var dens = $$('[data-density-for]').filter(function (g) { return U.visible(g); })[0];
    if (dens) ['standard', 'compact'].forEach(function (v) { list.push({ group: 'actions', title: 'Density: ' + (v === 'standard' ? 'Standard' : 'Compact'), icon: 'rows-3', keywords: ['density', 'compact', 'rows'], perform: function () { var r = $('[role="radio"][data-value="' + v + '"]', dens); if (r) { V.seg.select(r, false); V.toast.success('Density: ' + (v === 'standard' ? 'Standard' : 'Compact')); } } }); });
    list.push({ group: 'help', title: 'Setup checklist', icon: 'list-checks', perform: go('index.html') });
    [['Docs', 'book-open'], ['Service status', 'activity'], ['Contact support', 'mail'], ["What’s new", 'info']].forEach(function (x) { list.push({ group: 'help', title: x[0], icon: x[1], external: true, perform: soon(x[0]) }); });
    /* Reviewers: every prototype page that is not a nav destination (sign-in pages, 404, the component gallery). */
    [['Component gallery', 'components.html', 'layout-grid', ['components', 'design system', 'gallery']], ['Sign in', 'login.html', 'log-in', ['login', 'auth']], ['Create account', 'signup.html', 'user-plus', ['signup', 'register', 'auth']],
      ['Reset password', 'forgot-password.html', 'key-round', ['forgot password', 'auth']], ['Page not found', '404.html', 'circle-help', ['404', 'error', 'not found']]
    ].forEach(function (x) { list.push({ group: 'proto', title: x[0], meta: 'Prototype page', icon: x[2], keywords: x[3], end: 'Open', perform: go(x[1]) }); });
    return list;
  }
  function recordItems() {
    var list = [];
    (DATA.flows || []).forEach(function (f) { if (f.archived) return; list.push({ group: 'flows', title: f.name, icon: 'workflow', meta: (f.live ? 'Live v' + f.live.version : 'Not live yet') + (f.draft && f.draft.changes && f.live ? ' · Draft, ' + f.draft.changes + ' changes' : ''), keywords: [f.shortId], perform: go('flow-designer.html?flow=' + f.id) }); });
    (DATA.leads || []).forEach(function (l) { list.push({ group: 'leads', title: l.name, icon: 'users', meta: l.phone.masked + ' · ' + (V.statusDef('lead', l.status) || [''])[0], keywords: [l.phone.last4, 'lead ' + l.no, l.city], lead: l, perform: go('leads.html?lead=' + l.id) }); });
    (DATA.calls || []).slice(0, 60).forEach(function (c) { var tx = (c.turns || []).map(function (t) { return t.text; }).join(' '); list.push({ group: 'calls', title: V.fmt.when(c.at, { time: true }), icon: 'file-text', meta: (c.durationSec ? V.fmt.duration(c.durationSec) + ' · ' : '') + c.outcome + ' · ' + c.leadName, keywords: [c.leadName, c.outcome], transcript: tx, perform: go('call-reports.html?call=' + c.id) }); });
    (DATA.knowledge || []).forEach(function (k) { list.push({ group: 'knowledge', title: k.name, icon: 'file', meta: (V.statusDef('knowledge', k.status) || [''])[0].replace(' {n}%', ''), perform: go('knowledge.html?file=' + k.id) }); });
    return list;
  }
  function score(it, q) {
    var t = it.title.toLowerCase();
    if (t === q) return 100; if (t.indexOf(q) === 0) return 80;
    if ((it.keywords || []).some(function (k) { return String(k).toLowerCase() === q || String(k).toLowerCase().indexOf(q) === 0; })) return 70;
    if (t.indexOf(q) > 0) return 50;
    if ((it.meta || '').toLowerCase().indexOf(q) >= 0 || (it.keywords || []).some(function (k) { return String(k).toLowerCase().indexOf(q) >= 0; })) return 30;
    if (it.transcript && q.length >= 3 && /[a-z0-9ऀ-ॿ]/.test(q) && it.transcript.toLowerCase().indexOf(q) >= 0) { it.inTranscript = true; return 20; }
    return 0;
  }
  function mark(title, q) { if (!q) return esc(title); var i = title.toLowerCase().indexOf(q); return i < 0 ? esc(title) : esc(title.slice(0, i)) + '<mark>' + esc(title.slice(i, i + q.length)) + '</mark>' + esc(title.slice(i + q.length)); }
  var SHOWALL = { leads: 'leads.html', calls: 'call-reports.html', flows: 'flow-designer.html', knowledge: 'knowledge.html' };
  function allItems() {
    var st = staticItems(), ids = {}; extra.forEach(function (i) { if (i.id) ids[i.id] = 1; });
    return st.filter(function (i) { return !i.id || !ids[i.id]; }).concat(extra);
  }
  function build(q) {
    q = q.trim().toLowerCase(); var out = {}, all = allItems(), recs = navigator.onLine === false ? [] : recordItems(), counts = {};
    if (!q) {
      out.recent = V.commandPalette.recent().slice(0, 5).map(function (r) { return { group: 'recent', title: r.title, meta: r.meta, icon: r.icon || 'history', perform: go(r.href) }; });
      out['goto'] = all.filter(function (i) { return i.group === 'goto'; });
      /* §8.5: 4 suggested actions; the next setup step and the page’s own actions first */
      var acts = all.filter(function (i) { return i.group === 'actions' && (i.rank === 'top' || extra.indexOf(i) >= 0); });
      acts.sort(function (a, b) { return (b.rank === 'top') - (a.rank === 'top'); });
      out.actions = acts.concat(['New lead…', 'New flow…', 'Import leads…', 'Top up…'].map(function (t) { return all.filter(function (i) { return i.title === t; })[0]; }).filter(function (i) { return i && acts.indexOf(i) < 0; })).slice(0, 4);
      return { groups: out, counts: counts, order: GROUPS.map(function (g) { return g[0]; }) };
    }
    var callM = /^call\s+(.+)$/.exec(q);
    if (callM) {
      var who = callM[1];
      out.actions = recs.filter(function (i) { return i.group === 'leads' && (i.title.toLowerCase().indexOf(who) >= 0 || i.lead.phone.last4.indexOf(who) >= 0); }).slice(0, 3).map(function (i) {
        var lc = (DATA.live || []).filter(function (c) { return c.leadId === i.lead.id && c.state !== 'ended'; })[0];
        if (lc) return { group: 'actions', title: i.title + ' · on a call now', icon: 'phone-call', meta: 'Open in Cockpit', perform: go('cockpit.html?call=' + lc.id) };
        var here = /cockpit\.html$/.test(w.location.pathname);
        return { group: 'actions', title: 'Call ' + i.title + '…', icon: 'phone', meta: i.lead.phone.masked + (here ? ' · ready to call' : ' · opens the Call gate'), perform: go(here ? 'cockpit.html?new=1&lead=' + i.lead.id : 'leads.html?lead=' + i.lead.id + '&gate=call') }; });
    }
    all.concat(recs).forEach(function (it) { it.inTranscript = false; var s = score(it, q); if (!s) return; if (q.length <= 3 && /flows|leads|calls|knowledge/.test(it.group)) s -= 25; it._s = s + (it.rank === 'top' ? 40 : 0); (out[it.group] = out[it.group] || []).push(it); });
    Object.keys(out).forEach(function (g) { out[g].sort(function (a, b) { return b._s - a._s; }); counts[g] = out[g].length; if (g !== 'actions' || !callM) out[g] = out[g].slice(0, 5); });
    if (navigator.onLine === false && q.length > 1) out.offline = [{ group: 'offline', title: 'Offline. Records can’t be searched.', icon: 'cloud-off', inert: true }];
    var order = GROUPS.map(function (g) { return g[0]; }).concat(['offline']).filter(function (g) { return out[g] && out[g].length; });
    var best = function (g) { return g === 'offline' ? -1 : (out[g][0] && out[g][0]._s) || 0; }, tie = function (g) { var i = TIE.indexOf(g); return i < 0 ? 50 : i; };
    order.sort(function (a, b) { return best(b) - best(a) || tie(a) - tie(b); });
    return { groups: out, counts: counts, q: q, order: order };
  }
  var state = null;
  function render(q) {
    var res = build(q), html = '', n = 0, id = state.id;
    state.items = [];
    var labels = {}; GROUPS.forEach(function (g) { labels[g[0]] = g[1]; }); labels.offline = 'Records';
    res.order.map(function (k) { return [k, labels[k] || k]; }).forEach(function (g) {
      var items = res.groups[g[0]]; if (!items || !items.length) return;
      html += '<div role="group" aria-labelledby="' + id + '-g-' + g[0] + '"><span class="pal-group-label" id="' + id + '-g-' + g[0] + '">' + g[1] + '</span>';
      items.forEach(function (it) {
        var rid = id + '-o' + n; state.items.push(it); n += 1;
        var meta = it.inTranscript ? (it.meta ? it.meta + ' · ' : '') + 'Matched in transcript' : it.meta;
        html += '<div class="pal-row" role="option" id="' + rid + '" aria-selected="false" data-i="' + (n - 1) + '">' + V.icon(it.icon || 'arrow-right') +
          '<span class="pal-row-title">' + mark(it.title, res.q) + '</span>' + (meta ? '<span class="pal-row-meta">' + esc(meta) + '</span>' : '') +
          '<span class="pal-row-end">' + (it.kbd ? V.ui.kbd(it.kbd) : it.external ? V.icon('external-link', 'sm') : esc(it.end || '')) + '</span></div>';
      });
      if (res.q && SHOWALL[g[0]] && res.counts[g[0]] > 5) { var all = { title: 'Show all ' + res.counts[g[0]] + ' ' + g[1].toLowerCase() + " matching '" + res.q + "'", perform: go(SHOWALL[g[0]] + '?q=' + encodeURIComponent(res.q)) }; state.items.push(all); html += '<div class="pal-row pal-row--all" role="option" id="' + id + '-o' + n + '" aria-selected="false" data-i="' + n + '">' + V.icon('search') + '<span class="pal-row-title">' + esc(all.title) + '</span></div>'; n += 1; }
      html += '</div>';
    });
    if (!n) html = '<div class="pal-empty"><p>No matches for ‘' + esc(q.trim()) + '’.</p><p>Search covers lead names and numbers, call transcripts, flows and files.</p></div>';
    state.list.innerHTML = html; state.active = -1; setActive(n ? 0 : -1);
    clearTimeout(state.t); state.t = setTimeout(function () { if (q.trim()) V.announce(n ? n + ' results' : 'No results', { dedupeKey: 'palette' }); }, 400);
  }
  function setActive(i) {
    var rows = $$('.pal-row', state.list); if (!rows.length) { state.input.removeAttribute('aria-activedescendant'); return; }
    i = (i + rows.length) % rows.length; rows.forEach(function (r, k) { r.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    state.active = i; state.input.setAttribute('aria-activedescendant', rows[i].id); rows[i].scrollIntoView({ block: 'nearest' });
  }
  function perform(i) { var row = $$('.pal-row', state.list)[i]; if (!row) return; var it = state.items[+row.getAttribute('data-i')]; if (!it || it.inert) return; state.entry.close('navigate'); setTimeout(function () { it.perform && it.perform(); }, 0); }
  V.commandPalette = {
    open: function (o) {
      if (state && !state.entry.closed) { state.input.focus(); return; }
      var id = U.uid('pal');
      var el = h('<div class="dlg pal" role="dialog" aria-modal="true" aria-label="Search or jump">' +
        '<div class="pal-input">' + V.icon('search') + '<input type="text" role="combobox" aria-expanded="true" aria-controls="' + id + '-list" aria-autocomplete="list" aria-label="Search or jump" placeholder="Search leads, calls, flows or jump to…" autocomplete="off" spellcheck="false" data-autofocus>' +
        '<button type="button" class="ibtn ibtn--sm" aria-label="Clear search" hidden data-clear>' + V.icon('x', 'sm') + '</button><button type="button" class="btn btn--tertiary btn--sm pal-cancel" data-dialog-close>Cancel</button></div>' +
        '<div class="pal-list" role="listbox" id="' + id + '-list" aria-label="Results"></div>' +
        '<div class="pal-foot" aria-hidden="true"><span>' + V.ui.kbd('up') + V.ui.kbd('down') + ' to move</span><span>' + V.ui.kbd('enter') + ' to open</span><span>' + V.ui.kbd('esc') + ' to close</span></div></div>');
      state = { id: id, el: el, input: $('input', el), list: $('.pal-list', el), clear: $('[data-clear]', el) };
      state.entry = V.dialog.open(el, { generated: true, returnTo: (o && o.returnTo) || d.activeElement, replace: true });
      state.input.addEventListener('input', function () { state.clear.hidden = !state.input.value; render(state.input.value); });
      state.clear.addEventListener('click', function () { state.input.value = ''; state.clear.hidden = true; render(''); state.input.focus(); });
      state.input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(state.active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(state.active - 1); }
        else if ((e.key === 'Home' || e.key === 'End') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setActive(e.key === 'Home' ? 0 : -1); }
        else if (e.key === 'Enter') { e.preventDefault(); if (state.active >= 0) perform(state.active); }
        else if (e.key === 'Escape' && state.input.value) { e.preventDefault(); e.stopPropagation(); state.input.value = ''; state.clear.hidden = true; render(''); }
      });
      state.list.addEventListener('click', function (e) { var r = e.target.closest('.pal-row'); if (r) perform($$('.pal-row', state.list).indexOf(r)); });
      state.list.addEventListener('mousemove', function (e) { var r = e.target.closest('.pal-row'); if (r) { var i = $$('.pal-row', state.list).indexOf(r); if (i !== state.active) setActive(i); } });
      render('');
    },
    close: function () { if (state && !state.entry.closed) state.entry.close('x'); },
    toggle: function () { if (state && !state.entry.closed) V.commandPalette.close(); else V.commandPalette.open(); },
    /* Pages add items: { id?, group: 'actions', title: 'New lead…', meta, icon, keywords, kbd, rank: 'top', perform() }. An item with
       the id of an earlier one (a shared item such as 'continue-setup') replaces it. */
    register: function (items) { (items || []).forEach(function (it) { if (it.id) extra = extra.filter(function (x) { return x.id !== it.id; }); extra.push(it); }); },
    /* A page-owned group: addGroup('chats', 'Assistant chats', 'recent'); its items use group: 'chats'. */
    addGroup: function (key, label, after) { if (GROUPS.some(function (g) { return g[0] === key; })) return; var i = -1; GROUPS.forEach(function (g, k) { if (g[0] === after) i = k; }); GROUPS.splice(i < 0 ? GROUPS.length : i + 1, 0, [key, label]); if (TIE.indexOf(key) < 0) TIE.splice(TIE.indexOf('goto'), 0, key); },
    recent: function () { try { return JSON.parse(store.get('vaani:recent:' + ((DATA.org || {}).id || 'ws')) || '[]'); } catch (e) { return []; } },
    addRecent: function (r) { var l = V.commandPalette.recent().filter(function (x) { return x.href !== r.href; }); l.unshift(r); store.set('vaani:recent:' + ((DATA.org || {}).id || 'ws'), JSON.stringify(l.slice(0, 5))); }
  };
})(window, document, window.Vaani);

/* ---------- 4a. Shell chrome markup from the one nav config and the one Baseline copy module (03-pages/00 §2–5) ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, h = U.h, esc = U.esc, icon = V.icon, DATA = V.data;
  var S = V.shell = V.shell || {};
  var MARK = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" data-vaani="sprite"><symbol id="vl-mark" viewBox="0 0 32 32"><mask id="vl-mark-a" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="white"/><path d="M18.9 13.56L21.1 18.44" stroke="black" stroke-width="4.85"/></mask><mask id="vl-mark-b" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="white"/><path d="M10.9 13.56L13.1 18.44" stroke="black" stroke-width="4.85"/></mask><rect width="32" height="32" rx="7" style="fill:var(--mark-bg)"/><g fill="none" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--mark-fg)"><path mask="url(#vl-mark-a)" d="M3.5 16C6.8 16 8.45 8.1 12 16C15.6 24 16.4 24 20 16C23.55 8.1 25.2 16 28.5 16"/><path mask="url(#vl-mark-b)" d="M3.5 16C6.8 16 8.45 23.9 12 16C15.6 8 16.4 8 20 16C23.55 23.9 25.2 16 28.5 16"/></g></symbol></svg>';
  S.markSvg = function (cls) { return '<svg class="mark' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#vl-mark"/></svg>'; };
  S.injectSprite = function () { if (!$('[data-vaani="sprite"]')) d.body.insertAdjacentHTML('afterbegin', MARK); };

  /* current destination: an explicit setCurrent, else the exact href (file + ?view), else body[data-page], else the file */
  var forced = null;
  S.currentId = function () {
    if (forced) return forced;
    var file = (w.location.pathname.split('/').pop() || 'index.html'), view = new URLSearchParams(w.location.search).get('view');
    var exact = V.NAV.filter(function (n) { var p = n.href.split('?'); if (p[0] !== file) return false; var hv = new URLSearchParams(p[1] || '').get('view'); return hv ? hv === view : !view; })[0];
    if (exact) return exact.id;
    var page = d.body.getAttribute('data-page'); if (page && V.navById(page)) return page;
    var f = V.NAV.filter(function (n) { return n.href.split('?')[0] === file; })[0]; return f ? f.id : null;
  };
  V.nav = { setCurrent: function (id) { forced = id; S.render(); }, current: function () { return S.currentId(); } };

  function badgeHtml(b) {
    if (!b) return '';
    /* kinds: live (green dot) · pending (amber, own icon: a ringing transfer, CK §5.3) · warning · count */
    var vis = b.kind === 'live' ? '<span class="live-dot" data-mark></span>' + esc(b.text) : b.kind === 'warning' ? icon('triangle-alert', 'xs') + esc(b.text) : b.kind === 'pending' ? icon(b.icon || 'clock', 'xs') + esc(b.text) : esc(b.text);
    return '<span class="nav-badge' + (b.kind === 'live' ? ' nav-badge--live' : b.kind === 'warning' ? ' nav-badge--warn' : b.kind === 'pending' ? ' nav-badge--pending' : '') + '"><span class="nav-badge-v" aria-hidden="true">' + vis + '</span><span class="sr-only">, ' + esc(b.sr) + '</span></span>';
  }
  function groupsOf(filter) { var g = {}; V.navVisible().forEach(function (n) { if (filter && !filter(n)) return; (g[n.group] = g[n.group] || []).push(n); }); return g; }
  function navLists(prefix, itemFn) {
    var g = groupsOf(), cur = S.currentId(), html = '';
    Object.keys(V.GROUPS).forEach(function (k) { if (!g[k]) return;
      html += '<div class="nav-g"><span class="nav-g-label" id="' + prefix + '-' + k + '">' + V.GROUPS[k] + '</span><ul class="nav-list" aria-labelledby="' + prefix + '-' + k + '">' +
        g[k].map(function (n) { return '<li>' + itemFn(n, n.id === cur) + '</li>'; }).join('') + '</ul></div>'; });
    return html;
  }
  function navItem(n, current) { return '<a class="nav-item" href="' + n.href + '"' + (current ? ' aria-current="page"' : '') + '>' + icon(n.icon) + '<span>' + esc(n.label) + '</span>' + badgeHtml(V.badge(n)) + '</a>'; }
  S.setupVisible = function () { return !V.setupComplete() && S.currentId() !== 'home' && !!DATA.setup; };
  function setupCard() {
    if (!S.setupVisible()) return ''; var s = DATA.setup;
    return '<a class="setup" href="index.html" aria-label="Finish setup, ' + s.done + ' of ' + s.total + ' done. Next: ' + esc(s.next) + '"><span class="setup-top">Finish setup <span class="count-badge">' + s.done + ' of ' + s.total + '</span></span>' +
      '<span class="progress" aria-hidden="true"><i style="width:' + Math.round(s.done / s.total * 100) + '%"></i></span><span class="setup-next">Next: ' + esc(s.next) + '</span></a>';
  }
  /* org and user are re-read on every render: pages may swap DATA.user or narrow the role (?role=member) after boot */
  var org, user;
  function who() { org = DATA.org || { name: 'Workspace', role: 'Admin' }; user = DATA.user || { short: 'You', initials: 'Y' }; if (DATA.user && DATA.user.role && org.role !== DATA.user.role) org.role = DATA.user.role; }
  who();
  function wsButton() { who(); return '<button class="ws" type="button" aria-haspopup="menu" aria-controls="vaani-ws-menu" aria-expanded="false" aria-label="Workspace: ' + esc(org.name) + ', ' + esc(org.role) + '. Switch workspace">' + S.markSvg() + '<span class="ws-text"><span class="ws-name" translate="no">' + esc(org.name) + '</span><span class="ws-role">Workspace · ' + esc(org.role) + '</span></span>' + icon('chevron-down', 'sm') + '</button>'; }
  function jumpButton() { return '<button class="jump" type="button" data-vaani-action="palette" data-tooltip="Search or jump" data-kbd="mod+K" aria-keyshortcuts="' + (U.isMac ? 'Meta+K' : 'Control+K') + '">' + icon('search') + '<span>Search</span></button>'; }
  function acctButton() { return '<button class="acct" type="button" aria-haspopup="menu" aria-controls="vaani-acct-menu" aria-expanded="false" aria-label="Account: ' + esc(user.short) + '">' + V.ui.avatar(user.name) + '<span translate="no">' + esc(user.short) + '</span>' + icon('chevron-down', 'sm') + '</button>'; }

  S.sidebarHtml = function () { return wsButton() + jumpButton() + '<div class="sb-scroll">' + navLists('vaani-nav', navItem) + '</div>' + setupCard() + acctButton(); };
  S.railHtml = function () {
    who(); var g = groupsOf(), cur = S.currentId(), items = '', first = true;
    Object.keys(V.GROUPS).forEach(function (k) { if (!g[k]) return; if (!first) items += '<span class="rail-sep" aria-hidden="true"></span>'; first = false;
      g[k].forEach(function (n) { var b = V.badge(n), name = n.label + (b ? ', ' + b.sr : ''), tipText = n.label + (b ? ' · ' + b.text : '');
        items += '<a class="rail-item" href="' + n.href + '"' + (n.id === cur ? ' aria-current="page"' : '') + ' aria-label="' + esc(name) + '" data-tooltip="' + esc(tipText) + '" data-tooltip-kind="label" data-tooltip-side="right">' + icon(n.icon) + (b && b.kind !== 'count' ? '<span class="rail-mark' + (b.kind === 'warning' ? ' rail-mark--warn' : b.kind === 'pending' ? ' rail-mark--pending' : '') + '" data-mark></span>' : '') + '</a>'; }); });
    var setup = S.setupVisible() ? ', setup ' + DATA.setup.done + ' of ' + DATA.setup.total + ' done' : '';
    return '<button class="rail-item" type="button" aria-haspopup="menu" aria-controls="vaani-ws-menu" aria-expanded="false" aria-label="Workspace: ' + esc(org.name) + ', ' + esc(org.role) + '" data-tooltip-side="right">' + S.markSvg() + '</button>' +
      '<button class="rail-item" type="button" data-vaani-action="palette" aria-label="Search or jump" data-kbd="mod+K" data-tooltip-side="right">' + icon('search') + '</button>' +
      '<span class="rail-sep" aria-hidden="true"></span><div class="rail-list">' + items + '</div>' +
      '<div class="rail-end"><button class="rail-item" type="button" data-vaani-action="expand" aria-expanded="false" aria-keyshortcuts="[" data-kbd="[" data-tooltip-side="right" aria-label="Expand navigation' + setup + '" data-tooltip="Expand navigation" data-tooltip-kind="label">' + icon('panel-left') + (setup ? '<span class="rail-dot" data-mark></span>' : '') + '</button>' +
      '<button class="rail-item" type="button" aria-haspopup="menu" aria-controls="vaani-acct-menu" aria-expanded="false" aria-label="Account: ' + esc(user.short) + '" data-tooltip-side="right">' + V.ui.avatar(user.name) + '</button></div>';
  };

  /* ---------- Baseline copy module (03-pages/00 §5.2): one source for the band, the chip, the list and the TopBar wallet chip ----------
     Static segments live in S.SEG (pages may add their own keys). Segments whose words depend on runtime facts (setup progress,
     wallet balance, calls in progress, a batch, your own call) are built on demand from DATA plus V.baseline.facts() and
     V.wallet.set(), so every page renders the same band for the same state (§5.7 "byte-identical"). */
  var live = (DATA.flows || [])[0] || { name: 'Site-visit qualifier', id: 'flow', live: { version: 7 } };
  var NUMS = (org.inboundNumber || {}).masked || '+91 80 •••• 2210';
  var NUM = '<span class="phone-text" translate="no">' + esc(NUMS) + '</span>';
  function money(v) { return v === 0 ? V.fmt.money(0, { whole: true }) : V.fmt.money(v); }
  function words(runway) { return String(runway).replace(/ min\b/, ' minutes').replace(/ h\b/, ' hours'); }
  S.SEG = {
    'flow': { id: 'flow', html: '<b>Live v' + live.live.version + '</b> · ' + esc(live.name), short: '<b>Live v' + live.live.version + '</b>', full: 'Live v' + live.live.version + ' · ' + live.name, href: 'flow-designer.html?flow=' + live.id },
    'flow-published': { id: 'flow', html: '<b>Published v' + live.live.version + '</b> · ' + esc(live.name), short: '<b>Published v' + live.live.version + '</b>', full: 'Published v' + live.live.version + ' · ' + live.name, href: 'flow-designer.html?flow=' + live.id },
    'flow-none': { id: 'flow', warn: 1, html: 'No live flow · <u>Publish one</u>', full: 'No live flow. Publish one', href: 'flow-designer.html' },
    'line': { id: 'line', html: 'Inbound ' + NUM + ' · Ready', short: 'Inbound · Ready', full: 'Inbound ' + NUMS + ' · Ready', href: 'settings.html#phone' },
    'line-verified': { id: 'line', html: 'Inbound ' + NUM + ' · Verified', short: 'Inbound · Verified', full: 'Inbound number verified', href: 'settings.html#phone' },
    'line-verifying': { id: 'line', html: 'Verifying number · step 2 of 3', short: 'Verifying · 2 of 3', full: 'Verifying number, step 2 of 3', href: 'settings.html#phone/caller-id' },
    'line-unverified': { id: 'line', warn: 1, html: 'Number not verified · <u>Verify</u>', full: 'Number not verified. Verify', href: 'settings.html#phone/caller-id' },
    'line-degraded': { id: 'line', warn: 1, html: 'Phone line degraded · <u>Status</u>', full: 'Phone line degraded. Status', href: '#status' },
    'you-rep': { id: 'you', html: 'Available for transfers', full: 'Available for transfers', href: 'rep-console.html' }
  };
  var facts = {};
  /* The wallet facts in force: V.wallet.set() (a confirmed top-up) wins, else the ?wallet= demo state, else data.js. */
  function walletFacts(name) {
    var W = DATA.wallet || { balance: 0 }, st = name || V.walletState(), set = V.wallet._set && V.wallet._set.state === st ? V.wallet._set : null, s = (W.states || {})[st] || {};
    var bal = set ? set.balance : s.balance != null ? s.balance : W.balance, rate = W.ratePerSec || 0.04;
    var run = set && set.runway ? set.runway : bal > 0 ? V.fmt.runway(bal, rate) : null;
    return { state: st, balance: bal, runway: run };
  }
  var DYN = {
    'line-none': function () { var s = DATA.setup || { done: 0, total: 5 }; return { id: 'line', warn: 1, html: 'No calling number · calls can’t be placed · <u>Finish setup (' + s.done + ' of ' + s.total + ')</u>', full: 'No calling number, calls can’t be placed. Finish setup, ' + s.done + ' of ' + s.total, href: 'index.html' }; },
    'wallet': function () { var f = walletFacts('healthy'), r = (f.runway || '').replace(/^about /, ''); return { id: 'wallet', html: 'Wallet <b>' + money(f.balance) + '</b>' + (f.runway ? ' · ' + esc(f.runway) + ' of calls' : ''), short: '<b>' + money(f.balance) + '</b>' + (r ? ' · ' + esc(r) : ''), chip: '₹' + V.fmt.count(Math.floor(f.balance)), full: 'Wallet ' + money(f.balance) + (f.runway ? ', ' + f.runway + ' of calls' : ''), href: 'billing.html' }; },
    'wallet-low': function () { var f = walletFacts('low'); return { id: 'wallet', warn: 1, topup: 1, html: 'Wallet <b>' + money(f.balance) + '</b> · ' + esc(f.runway || '') + ' · <u>Top up</u>', chip: money(f.balance) + ' · Top up', full: 'Wallet ' + money(f.balance) + ', ' + words(f.runway || '') + ' of calls. Top up', href: 'billing.html?topup=1' }; },
    'wallet-empty': function () { return { id: 'wallet', warn: 1, topup: 1, html: 'Wallet <b>₹0</b> · calls paused · <u>Top up</u>', chip: '₹0 · Top up', full: 'Wallet ₹0, calls paused. Top up', href: 'billing.html?topup=1' }; },
    'wallet-autopay': function () { return { id: 'wallet', warn: 1, html: 'Autopay failed · <u>Fix</u>', chip: 'Autopay failed', full: 'Autopay failed. Fix', href: 'billing.html#autopay' }; },
    'wallet-pending': function () { var f = walletFacts('pending'); return { id: 'wallet', html: 'Wallet <b>' + money(f.balance) + '</b> · payment pending', chip: '₹' + V.fmt.count(Math.floor(f.balance)) + ' · pending', full: 'Wallet ' + money(f.balance) + ', payment pending', href: 'billing.html' }; },
    /* §5.2 segment 4 counts the workspace’s OTHER calls: liveCalls is the workspace total (yours included), so your own
       call (segment 5, facts.call or DATA.state.myCall) is taken out here, once, for every page */
    'activity': function () { var total = facts.liveCalls != null ? facts.liveCalls : (DATA.state || {}).liveCalls || 0, mine = facts.call !== undefined ? facts.call : (DATA.state || {}).myCall; var n = Math.max(0, total - (mine ? 1 : 0)); if (!n) return null; return { id: 'activity', html: '<b>' + n + '</b> ' + (n === 1 ? 'call' : 'calls') + ' in progress', full: n + (n === 1 ? ' call' : ' calls') + ' in progress', href: 'cockpit.html' }; },
    'batch': function () { var b = facts.batch || { placed: 12, total: 40 }; return { id: 'activity', html: 'Batch · <b>' + V.fmt.count(b.placed) + ' of ' + V.fmt.count(b.total) + '</b> placed', full: 'Batch, ' + b.placed + ' of ' + b.total + ' placed', href: 'cockpit.html' }; },
    'you-call': function () {
      var l0 = (DATA.live || [])[0] || {}, c = facts.call || (DATA.state || {}).myCall || { id: l0.id || 'call_live01', timer: '02:14', kind: 'real', name: l0.leadName || 'Lead 1042' };
      var what = c.kind === 'test' ? 'On test call' : c.kind === 'browser' ? 'On browser test' : 'On call', t = c.timer || '00:00';
      return { id: 'you', live: 1, html: '<b>' + what + ' <span class="num" data-vaani="call-timer">' + esc(t) + '</span></b>' + (c.name ? ' · ' + esc(c.name) : ''), chipText: what + ' ' + t, full: what + (c.name ? ' with ' + c.name : ''), href: 'cockpit.html?call=' + esc(c.id || '') };
    }
  };
  function seg(k) { return DYN[k] ? DYN[k]() : S.SEG[k]; }
  S.segment = seg;
  var WALLET_SEG = { healthy: 'wallet', low: 'wallet-low', empty: 'wallet-empty', pending: 'wallet-pending', 'autopay-failed': 'wallet-autopay' };
  S.STATES = { 'default': ['flow', 'line', 'wallet'], activity: ['flow', 'line', 'wallet', 'activity'], batch: ['flow', 'line', 'wallet', 'batch'], oncall: ['flow', 'line', 'wallet', 'activity', 'you-call'], rep: ['flow', 'line', 'wallet', 'activity', 'you-rep'], degraded: ['flow', 'line-degraded', 'wallet'], unverified: ['flow', 'line-unverified', 'wallet'], setup: ['flow-none', 'line-verified', 'wallet'], home: ['flow-published', 'line-verified', 'wallet'] };
  var blOverride = null;
  S.segments = function () {
    var name = blOverride || d.body.getAttribute('data-baseline') || ((facts.liveCalls != null ? facts.liveCalls : (DATA.state || {}).liveCalls) ? 'activity' : 'default');
    var keys = Array.isArray(name) ? name.slice() : (S.STATES[name] || S.STATES['default']).slice();
    /* §5.5: while setup is incomplete nothing reads "Live" or "Ready"; the done steps read Published and Verified */
    var setup = !(facts.setupComplete || V.setupComplete());
    var ws = WALLET_SEG[V.walletState()] || 'wallet';
    keys = keys.map(function (k) { return k === 'wallet' ? ws : setup && k === 'flow' ? 'flow-published' : setup && k === 'line' ? 'line-verified' : k; });
    return keys.map(seg).filter(Boolean).map(stale);
  };
  /* §5.5 Offline: values stay and the wallet segment appends "· as of 11:42 am" (band, chip, list and TopBar chip alike) */
  var offlineAt = null;
  function stale(s) {
    if (!offlineAt || s.id !== 'wallet') return s;
    var t = ' · as of ' + offlineAt, x = {}; Object.keys(s).forEach(function (k) { x[k] = s[k]; });
    x.html = s.html + esc(t); if (s.short) x.short = s.short + esc(t); if (s.chip) { x.chip = s.chip + t; x.chipTop = s.chip; } x.full = s.full + ', as of ' + offlineAt;
    /* the TopBar chip keeps its short value on tablets and phones (the ConnectionBar right under it states the time);
       its accessible name still says "as of" */
    return x;
  }
  S.setOfflineAt = function (at) { offlineAt = at || null; };
  S.offlineAt = function () { return offlineAt; };
  function segHref(s) { return s.topup ? '?topup=1' : s.href; }
  S.baselineHtml = function (short) {
    var list = S.segments().filter(function (s) { return !(short >= 5 && s.id === 'activity'); }), html = '';
    list.forEach(function (s, i) {
      var useShort = !s.warn && s.short && ((s.id === 'flow' && short >= 1) || (s.id === 'line' && short >= 3) || (s.id === 'wallet' && short >= 4));
      if (i) html += '<span class="bl-sep" aria-hidden="true"></span>';
      html += '<a class="bl-seg' + (s.warn ? ' bl-seg--warn' : '') + '" href="' + segHref(s) + '"' + (s.topup ? ' data-vaani-action="topup"' : '') + (useShort || s.warn ? ' aria-label="' + esc(s.full) + '"' : '') + '>' + (s.warn ? icon('triangle-alert', 'sm') : '') + (s.live ? '<span class="live-dot" data-mark></span>' : '') + (useShort ? s.short : s.html) + '</a>';
    });
    html += '<span class="bl-end">' + (short >= 2
      ? '<button type="button" class="bl-btn" data-vaani-action="shortcuts" aria-label="Shortcuts" data-tooltip="Shortcuts" data-kbd="?">' + icon('keyboard', 'sm') + '</button><button type="button" class="bl-btn" data-vaani-action="palette" aria-label="Search" data-tooltip="Search" data-kbd="mod+K">' + icon('search', 'sm') + '</button>'
      : '<button type="button" class="bl-btn" data-vaani-action="shortcuts" aria-haspopup="dialog">Shortcuts</button><button type="button" class="bl-btn" data-vaani-action="palette" aria-haspopup="dialog">Search</button>') + '</span>';
    return html;
  };
  S.baselineListHtml = function () {
    var LI = { flow: 'workflow', line: 'phone', wallet: 'wallet', activity: 'activity', you: 'headphones' };
    return '<ul class="blist" aria-label="Workspace status">' + S.segments().map(function (s) {
      var lead = s.warn ? icon('triangle-alert', 'sm') : s.live ? '<span class="live-dot" data-mark></span>' : icon(LI[s.id], 'sm');
      return '<li><a href="' + segHref(s) + '"' + (s.warn ? ' class="blist--warn"' : '') + (s.topup ? ' data-vaani-action="topup"' : '') + '>' + lead + '<span class="blist-t">' + s.html + '</span>' + icon('chevron-right', 'sm', { className: 'blist-ch' }) + '</a></li>';
    }).join('') + '</ul>';
  };
  /* The BaselineChip’s one fact: an amber segment first, else your call, else the wallet short form (§5.4). */
  S.topFact = function () {
    var segs = S.segments(), warn = segs.filter(function (s) { return s.warn; })[0], you = segs.filter(function (s) { return s.id === 'you' && s.live; })[0], wal = segs.filter(function (s) { return s.id === 'wallet'; })[0];
    if (warn) return { warn: true, text: warn.chip || warn.full, full: warn.full, more: segs.length - 1 };
    if (you) return { live: true, text: you.chipText || you.full, full: you.full, more: segs.length - 1 };
    return { text: wal ? (wal.chip || '') : 'Status', full: wal ? wal.full : '', more: segs.length - 1 };
  };
  /* V.baseline.set(state | [keys] | null) picks the segments; V.baseline.facts({ liveCalls, batch: { placed, total }, call: { id,
     kind: 'real'|'test'|'browser', timer, name } | null }) feeds the runtime words; both re-render the band and the chip. */
  V.baseline = {
    set: function (state) { blOverride = state; S.renderBaseline(); },
    facts: function (o) { Object.keys(o || {}).forEach(function (k) { facts[k] = o[k]; }); if (S.render) S.render(); },
    segments: function () { return S.segments(); }
  };
  /* V.wallet.set({ balance, state: 'healthy'|'low'|…, runway? }) after a confirmed top-up: the Baseline wallet segment, the
     TopBar chip, the BaselineChip and the Billing nav badge all follow. V.wallet.get() returns the facts in force. */
  V.wallet = {
    _set: null,
    set: function (o) { var st = (o && o.state) || 'healthy'; V.wallet._set = { state: st, balance: o && o.balance != null ? o.balance : walletFacts(st).balance, runway: o && o.runway }; if (S.render) S.render(); V.emit('wallet', walletFacts()); },
    clear: function () { V.wallet._set = null; if (S.render) S.render(); V.emit('wallet', walletFacts()); },
    get: function () { return walletFacts(); }
  };

  /* ---------- TopBar and BottomBar ---------- */
  S.walletChipHtml = function () {
    var s = S.segments().filter(function (x) { return x.id === 'wallet'; })[0]; if (!s) return '';
    return '<a class="chip' + (s.warn ? ' chip--warn' : '') + '" href="' + segHref(s) + '"' + (s.topup ? ' data-vaani-action="topup"' : '') + ' data-chip="' + (s.warn ? 'wallet-warn' : 'wallet') + '" aria-label="' + esc(s.full) + '">' + icon(s.warn ? 'triangle-alert' : 'wallet', 'sm') + esc(s.chipTop || s.chip || '') + '</a>';
  };
  /* The TopBar call chip (my call only): its name says the kind ("Live test call, 01:12"); DATA.state.myCall = { id, timer, kind }. */
  S.callChipHtml = function () { var c = (DATA.state || {}).myCall; if (!c) return ''; var kind = c.kind === 'test' ? 'test call' : c.kind === 'browser' ? 'browser test' : 'call';
    return '<a class="chip chip--live" href="cockpit.html?call=' + esc(c.id) + '" data-chip="call" aria-label="Live ' + kind + ', ' + esc(c.timer || '00:00') + '"><span class="live-dot" data-mark></span>Live <span class="num" data-vaani="call-timer">' + esc(c.timer || '00:00') + '</span></a>'; };
  S.topbarHtml = function () {
    var back = d.body.getAttribute('data-back-href');
    return '<button class="ibtn ibtn--lg topbar-menu" type="button" data-vaani-action="navsheet" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded="false">' + icon('menu', 'lg') + '</button>' +
      (back ? '<a class="topbar-back" href="' + esc(back) + '">' + icon('chevron-left') + esc(d.body.getAttribute('data-back-label') || 'Back') + '</a>' : '') +
      '<div class="topbar-title" data-vaani="title-slot"></div>' + S.callChipHtml() + S.walletChipHtml() +
      '<button class="ibtn ibtn--lg" type="button" data-vaani-action="palette" aria-label="Search or jump" aria-haspopup="dialog">' + icon('search', 'lg') + '</button>';
  };
  S.bottombarHtml = function () {
    var cur = S.currentId(), slots = V.NAV.filter(function (n) { return n.phoneSlot; }).sort(function (a, b) { return a.phoneSlot - b.phoneSlot; });
    var inSlots = slots.some(function (n) { return n.id === cur; });
    return slots.map(function (n) { return '<a href="' + n.href + '"' + (n.id === cur ? ' aria-current="page"' : '') + '>' + icon(n.icon, 'lg') + '<span>' + esc(n.label) + '</span></a>'; }).join('') +
      '<button type="button" data-vaani-action="more" aria-haspopup="dialog" aria-expanded="false"' + (cur && !inSlots ? ' aria-current="page"' : '') + '>' + icon('ellipsis', 'lg') + '<span>More</span></button>';
  };

  /* ---------- NavSheet (tablet) and MoreSheet (phone) ---------- */
  S.navSheetHtml = function () {
    return '<div class="nav-sheet" role="dialog" aria-modal="true" aria-label="Navigation"><div class="nav-sheet-head">' + wsButton() + '<button type="button" class="ibtn ibtn--lg" data-vaani-close aria-label="Close navigation">' + icon('x', 'lg') + '</button></div>' +
      jumpButton() + '<div class="sb-scroll"><nav aria-label="Main">' + navLists('vaani-sheet', navItem) + '</nav>' + setupCard() + '<span class="sheet-section-label" id="vaani-ws-status">Workspace status</span>' + S.baselineListHtml() + '</div>' + acctButton() + '</div>';
  };
  S.moreSheetHtml = function () {
    who(); var cur = S.currentId(), g = groupsOf(function (n) { return !n.phoneSlot; }), body = '';
    Object.keys(V.GROUPS).forEach(function (k) { if (!g[k]) return;
      body += '<span class="more-label">' + V.GROUPS[k] + '</span><div class="more-cols">' + g[k].map(function (n) { var b = V.badge(n); return '<a class="more-item" href="' + n.href + '"' + (n.id === cur ? ' aria-current="page"' : '') + '>' + icon(n.icon, 'lg') + '<span>' + esc(n.label) + (b ? '<span class="sr-only">, ' + esc(b.sr) + '</span>' : '') + '</span></a>'; }).join('') + '</div>'; });
    var th = V.theme.get(), mo = V.motion.get();
    function seg(id, label, opts, val) { return '<div class="more-row"><span id="' + id + '">' + label + '</span><div class="seg seg--sm" role="radiogroup" aria-labelledby="' + id + '" data-vaani-pref="' + id + '">' + opts.map(function (o) { return '<button type="button" role="radio" aria-checked="' + (o[0] === val) + '" data-value="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div></div>'; }
    return '<div class="bsheet" role="dialog" aria-modal="true" aria-labelledby="vaani-more-t"><div class="bsheet-head"><h2 id="vaani-more-t">More</h2><button type="button" class="ibtn ibtn--lg" data-vaani-close aria-label="Close">' + icon('x', 'lg') + '</button></div>' +
      '<div class="bsheet-body"><nav aria-label="More destinations">' + body + '</nav>' + setupCard() + '<span class="more-label">Workspace status</span>' + S.baselineListHtml() + '<div class="more-sep"></div>' +
      '<a class="more-account" href="settings.html#profile">' + V.ui.avatar(user.name, { size: 32 }) + '<span><b translate="no">' + esc(user.short) + '</b><small>' + esc(org.role) + ' · ' + esc(org.name) + '</small></span>' + icon('chevron-right', 'sm') + '</a>' +
      seg('vaani-more-theme', 'Theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], th) + seg('vaani-more-motion', 'Motion', [['system', 'Match system'], ['reduce', 'Reduce motion']], mo) +
      '<button type="button" class="more-item" data-vaani-action="help">' + icon('circle-help', 'lg') + '<span>Help and docs</span></button><div class="more-sep"></div>' +
      '<button type="button" class="more-item more-item--danger" data-vaani-action="signout">' + icon('log-out', 'lg') + '<span>Sign out…</span></button></div></div>';
  };

  /* ---------- account and workspace menus (03-pages/00 §9) ---------- */
  function mi(role, label, o) {
    o = o || {}; var tag = o.href ? 'a' : 'button';
    return '<' + tag + ' class="menu-item' + (o.danger ? ' menu-item--danger' : '') + '" role="' + role + '"' + (o.href ? ' href="' + o.href + '"' : ' type="button"') + (o.checked != null ? ' aria-checked="' + o.checked + '"' : '') + (o.value ? ' data-value="' + o.value + '"' : '') + (o.act ? ' data-act="' + o.act + '"' : '') + (o.sub ? ' aria-haspopup="menu" data-submenu="' + o.sub + '"' : '') + '>' +
      (o.check ? '<span class="menu-check">' + icon('check') + '</span>' : '') + (o.icon ? icon(o.icon) : '') + '<span class="menu-text"><span>' + esc(label) + '</span>' + (o.desc ? '<span class="menu-desc">' + esc(o.desc) + '</span>' : '') + '</span>' + (o.end ? '<span class="menu-end">' + o.end + '</span>' : '') + '</' + tag + '>';
  }
  S.menusHtml = function () {
    who(); var th = V.theme.get(), mo = V.motion.get(), sc = V.shortcuts.enabled();
    var acct = '<div class="menu" id="vaani-acct-menu" role="menu" aria-label="Account" hidden><div class="menu-head" role="presentation"><b translate="no">' + esc(user.name) + '</b><span>' + esc(org.role) + ' · ' + esc(org.name) + '</span></div><div class="menu-sep" role="separator"></div>' +
      mi('menuitem', 'Profile', { href: 'settings.html#profile', check: 1 }) +
      '<span class="menu-group-label" id="vaani-m-theme">Theme</span><div role="group" aria-labelledby="vaani-m-theme">' + [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map(function (t) { return mi('menuitemradio', t[1], { checked: th === t[0], value: t[0], act: 'theme', check: 1 }); }).join('') + '</div>' +
      '<span class="menu-group-label" id="vaani-m-motion">Motion</span><div role="group" aria-labelledby="vaani-m-motion">' + [['system', 'Match system'], ['reduce', 'Reduce motion']].map(function (t) { return mi('menuitemradio', t[1], { checked: mo === t[0], value: t[0], act: 'motion', check: 1 }); }).join('') + '</div>' +
      '<div class="menu-sep" role="separator"></div>' + mi('menuitemcheckbox', 'Single-key shortcuts', { checked: sc, act: 'shortcuts', check: 1 }) +
      mi('menuitem', 'Keyboard shortcuts', { act: 'sheet', check: 1, end: V.ui.kbd('?') }) + mi('menuitem', 'Help and docs', { sub: 'vaani-help-menu', check: 1, end: icon('chevron-right', 'sm') }) +
      mi('menuitem', 'Back to website', { act: 'external', check: 1, end: icon('external-link', 'sm') }) + '<div class="menu-sep" role="separator"></div>' + mi('menuitem', 'Sign out…', { act: 'signout', danger: 1, check: 1 }) + '</div>';
    var help = '<div class="menu" id="vaani-help-menu" role="menu" aria-label="Help and docs" hidden>' + mi('menuitem', 'Docs', { act: 'external', end: icon('external-link', 'sm') }) + mi('menuitem', 'Setup checklist', { href: 'index.html' }) +
      mi('menuitem', 'Service status', { act: 'external', end: icon('external-link', 'sm') }) + mi('menuitem', 'Contact support', { act: 'external', end: icon('external-link', 'sm') }) + mi('menuitem', "What’s new", { act: 'external', end: icon('external-link', 'sm') }) + '</div>';
    var ws = '<div class="menu" id="vaani-ws-menu" role="menu" aria-label="Workspace" hidden><div class="menu-head" role="presentation"><b translate="no">' + esc(org.name) + '</b><span>' + esc(org.role) + ' · ' + esc(org.billingLabel || 'Prepaid wallet') + '</span></div><div class="menu-sep" role="separator"></div>' +
      mi('menuitem', 'Workspace settings', { href: 'settings.html#organization' }) + (V.isAdmin() ? mi('menuitem', 'Invite teammates…', { href: 'settings.html#organization?invite=1' }) : mi('menuitem', 'Ask an admin to invite', { act: 'ask-invite' })) + mi('menuitem', 'Billing', { href: 'billing.html' }) + '<div class="menu-sep" role="separator"></div>' +
      '<span class="menu-group-label" id="vaani-m-ws">Switch workspace</span><div role="group" aria-labelledby="vaani-m-ws">' + (DATA.workspaces || []).map(function (x) { return mi('menuitemradio', x.name, { checked: !!x.current, value: x.id, act: 'switch', check: 1, end: esc(x.role) }); }).join('') + '</div>' +
      mi('menuitem', 'Create workspace…', { act: 'external', check: 1 }) + '</div>';
    return acct + help + ws;
  };
})(window, document, window.Vaani);

/* ---------- 4b. Shell behaviour: mounting, H1 hand-off, rail overlay, sheets, Baseline fit, F6, top-up, sign out ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, h = U.h, esc = U.esc, icon = V.icon, store = U.store, S = V.shell, root = d.documentElement;
  var el = {};
  /* Create any shell part a page left out, in DOM order: skip link · sidebar · rail · top bar · (main) · Baseline · bottom bar. */
  function ensure() {
    var app = $('.app'); if (!app) return false;
    if (!$('.skip-link')) d.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main">Skip to main content</a>');
    var main = $('main', app); if (main && !main.id) main.id = 'main';
    if (main) { main.setAttribute('tabindex', '-1'); main.setAttribute('data-focus-target', ''); }
    var col = $('.app-col', app); if (!col && main) { col = h('<div class="app-col"></div>'); main.parentNode.insertBefore(col, main); col.appendChild(main); }
    function part(key, html, before) { var x = $('[data-vaani="' + key + '"]', app); if (!x) { x = h(html); app.insertBefore(x, before || null); } return x; }
    el.sidebar = part('sidebar', '<nav class="sb" aria-label="Main" data-vaani="sidebar"></nav>', app.firstChild);
    el.rail = part('rail', '<nav class="rail" aria-label="Main" data-vaani="rail"></nav>', el.sidebar.nextSibling);
    el.topbar = part('topbar', '<div class="topbar topbar--auto" data-vaani="topbar"></div>', el.rail.nextSibling);
    el.bbar = part('bottombar', '<nav class="bbar" aria-label="Main" data-vaani="bottombar"></nav>', null);
    /* The TopBar (tablet, phone) holds the moved H1 and the call and wallet chips: a named region so nothing sits outside a landmark (no <header> landmark, shell §3.1). */
    if (!el.topbar.hasAttribute('role')) { el.topbar.setAttribute('role', 'region'); el.topbar.setAttribute('aria-label', 'Page title and status'); }
    el.col = col; el.main = main;
    el.bl = $('[data-vaani="baseline"]'); if (!el.bl && col) { el.bl = h('<div class="bl" role="region" aria-label="Workspace status" data-baseline data-vaani="baseline"></div>'); col.appendChild(el.bl); }
    if (!$('[data-vaani="toasts"]')) d.body.appendChild(h('<div class="toast-region" role="region" aria-label="Notifications" data-vaani="toasts"></div>'));
    if (!$('[data-vaani="announcer"]')) d.body.appendChild(h('<div class="sr-only" role="status" aria-live="polite" data-vaani="announcer"></div>'));
    U.portal();
    return true;
  }
  var h1Home = null;
  function restoreH1() { var h1 = $('[data-vaani="title-slot"] h1'); if (h1 && h1Home && h1Home.parentNode) h1Home.parentNode.insertBefore(h1, h1Home); }
  S.syncTitle = function () {
    var slot = $('[data-vaani="title-slot"]'); if (!slot) return;
    var h1 = $('[data-vaani="title-slot"] h1') || $('main .ph h1') || $('#page-title');
    var small = V.bp.shell() === 'topbar' || V.bp.shell() === 'bottombar';
    if (h1 && !h1.id) h1.id = 'page-title';
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.setAttribute('data-focus-target', ''); }
    var movable = h1 && (h1.closest('.ph') || h1.closest('[data-vaani="title-slot"]'));
    if (movable) {
      if (small && h1.parentNode !== slot) { if (!h1Home) h1Home = d.createComment('vaani-h1-home'); h1.parentNode.insertBefore(h1Home, h1); slot.innerHTML = ''; slot.appendChild(h1); }
      else if (!small && h1.parentNode === slot) restoreH1();
      slot.title = h1.textContent.trim();
    } else if (!slot.firstChild) {
      var n = V.navById(S.currentId()); slot.innerHTML = '<span aria-hidden="true">' + esc(d.body.getAttribute('data-topbar-title') || (n ? n.label : '')) + '</span>';
    }
    fitTopbar();
  };
  function fitTopbar() {
    var slot = $('[data-vaani="title-slot"]'); if (!slot || !slot.offsetWidth) return;
    var chips = $$('[data-chip]', el.topbar); chips.forEach(function (c) { c.classList.remove('is-hidden'); });
    ['wallet', 'wallet-warn'].forEach(function (k) { if (slot.clientWidth < 120) { var c = $('[data-chip="' + k + '"]', el.topbar); if (c) c.classList.add('is-hidden'); } });
  }
  S.renderBaseline = function () {
    if (!el.bl) return;
    var short = 0; el.bl.innerHTML = S.baselineHtml(0);
    if (el.bl.offsetWidth) while (el.bl.scrollWidth > el.bl.clientWidth + 1 && short < 5) { short += 1; el.bl.innerHTML = S.baselineHtml(short); }
    var ph = $('main .ph'); if (!ph || d.body.getAttribute('data-shell') === 'focus') return;
    var f = S.topFact(), chip = $('.bl-chip', ph), html = '<button type="button" class="chip bl-chip' + (f.warn ? ' chip--warn' : '') + '" data-popover="vaani-bl-pop" aria-haspopup="dialog" aria-expanded="false" aria-label="Workspace status: ' + esc(f.full) + (f.more ? '. ' + f.more + ' more' : '') + '">' + (f.warn ? icon('triangle-alert', 'sm') : f.live ? '<span class="live-dot" data-mark></span>' : icon('wallet', 'sm')) + esc(f.text) + '</button>';
    if (chip) chip.outerHTML = html; else { var acts = $('.ph-actions', ph); if (acts) acts.insertAdjacentHTML('beforebegin', html); else ph.insertAdjacentHTML('beforeend', html); }
    var pop = $('#vaani-bl-pop'); if (pop) pop.remove();
    d.body.appendChild(h('<div class="pop" id="vaani-bl-pop" role="dialog" aria-labelledby="vaani-bl-pop-t" hidden><div class="pop-head"><h2 class="pop-title" id="vaani-bl-pop-t">Workspace status</h2></div><div class="pop-body">' + S.baselineListHtml() + '</div></div>'));
  };
  /* Re-rendering the chrome (theme, motion, shortcuts, nav badges) keeps focus and every overlay’s return target on the
     equivalent control: a control is keyed by its part and its index among that part’s controls. */
  var CHROME = ['sidebar', 'rail', 'topbar', 'bbar'], CTRL = 'a[href], button, [tabindex]';
  function chromeKey(n) { if (!n || !n.nodeType) return null; for (var i = 0; i < CHROME.length; i++) { var r = el[CHROME[i]]; if (r && r !== n && r.contains(n)) return { part: CHROME[i], i: $$(CTRL, r).indexOf(n) }; } return null; }
  function fromKey(k) { var r = k && el[k.part]; return r && k.i >= 0 ? $$(CTRL, r)[k.i] || null : null; }
  S.render = function () {
    if (!el.sidebar) return;
    var ae = d.activeElement, aeKey = chromeKey(ae), keys = V.overlays.stack.map(function (e) { return chromeKey(e.returnTo); });
    restoreH1();
    el.sidebar.innerHTML = S.sidebarHtml(); el.rail.innerHTML = S.railHtml(); el.topbar.innerHTML = S.topbarHtml(); el.bbar.innerHTML = S.bottombarHtml();
    /* shell menus are rebuilt too, except one that is open right now (its radio items already show the new choice) */
    var openEls = V.overlays.stack.map(function (e) { return e.el; }), tpl = d.createElement('template'); tpl.innerHTML = S.menusHtml();
    $$('[id]', tpl.content).forEach(function (m) { if (m.parentNode !== tpl.content) return; var old = d.getElementById(m.id); if (old && openEls.indexOf(old) >= 0) return; if (old) old.remove(); d.body.appendChild(m); });
    S.renderBaseline(); S.syncTitle();
    V.overlays.stack.forEach(function (e, i) { var n = fromKey(keys[i]); if (n) e.returnTo = n; });
    if (aeKey && !d.contains(ae)) { var nf = fromKey(aeKey); if (nf) nf.focus({ preventScroll: true }); }
    var cur = $('.sb .nav-item[aria-current="page"]'); if (cur && cur.scrollIntoView && el.sidebar.offsetWidth) { var sc = $('.sb-scroll', el.sidebar); if (sc && cur.offsetTop > sc.clientHeight) cur.scrollIntoView({ block: 'nearest' }); }
    edgeFade($('.rail-list', el.rail));
  };
  S.els = el;
  /* Edge fade on a vertical scroller (05 §5.8): data-overflow="start|end|both" on the side that has more; a cue, never a control */
  function edgeFade(list) {
    if (!list) return;
    var sync = function () { var more = list.scrollHeight - list.clientHeight > 1, top = list.scrollTop > 1, end = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
      var v = !more ? '' : top && end ? 'both' : top ? 'start' : end ? 'end' : ''; if (v) list.setAttribute('data-overflow', v); else list.removeAttribute('data-overflow'); };
    list.addEventListener('scroll', sync, { passive: true });
    if (w.ResizeObserver) new w.ResizeObserver(sync).observe(list); else w.addEventListener('resize', sync);
    sync();
  }

  /* ---------- rail overlay and sidebar collapse ([) ---------- */
  var railEntry = null;
  function openRail() {
    if (railEntry) return; var btn = $('[data-vaani-action="expand"]', el.rail);
    el.sidebar.classList.add('sb--overlay'); var scrim = h('<div class="rail-scrim"></div>'); el.sidebar.parentNode.insertBefore(scrim, el.sidebar);
    if (btn) btn.setAttribute('aria-expanded', 'true');
    railEntry = V.overlays.push({ el: el.sidebar, kind: 'rail', modal: false, returnTo: btn, onClose: function () { el.sidebar.classList.remove('sb--overlay'); scrim.remove(); if (btn) btn.setAttribute('aria-expanded', 'false'); railEntry = null; } });
    scrim.addEventListener('click', function () { railEntry && railEntry.close('scrim'); });
    var cur = $('.nav-item[aria-current="page"]', el.sidebar) || $('.nav-item', el.sidebar); if (cur) cur.focus();
  }
  S.toggleSidebar = function () {
    var focus = d.body.getAttribute('data-shell') === 'focus';
    if (!V.bp.desktopShell()) return;
    if (w.innerWidth >= 1280 && !focus) {
      var collapsed = root.getAttribute('data-sidebar') === 'collapsed';
      if (collapsed) { root.removeAttribute('data-sidebar'); store.remove('vaani:sidebar'); } else { root.setAttribute('data-sidebar', 'collapsed'); store.set('vaani:sidebar', 'collapsed'); }
      V.announce(collapsed ? 'Sidebar expanded' : 'Sidebar collapsed'); return;
    }
    if (railEntry) railEntry.close('toggle'); else openRail();
  };
  if (store.get('vaani:sidebar') === 'collapsed') root.setAttribute('data-sidebar', 'collapsed');

  /* ---------- NavSheet (tablet) and MoreSheet (phone): modal, focus to the current item, Esc and scrim close ---------- */
  function openSheet(html, kind, trigger, current) {
    var node = h(html), m = V.overlays.mount(node, kind, { generated: true });
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    var entry = V.overlays.push({ el: node, kind: 'navsheet', modal: true, returnTo: trigger, onClose: function () { m.unmount(); if (trigger) trigger.setAttribute('aria-expanded', 'false'); } });
    $('[data-vaani-scrim]', m.layer).addEventListener('click', function () { entry.close('scrim'); });
    $$('[data-vaani-close]', node).forEach(function (b) { b.addEventListener('click', function () { entry.close('x'); }); });
    $$('a[href]', node).forEach(function (a) { a.addEventListener('click', function () { if (a.getAttribute('data-vaani-action') !== 'topup') entry.close('navigate'); }); });
    var f = $(current, node) || U.focusables(node)[0]; if (f) f.focus();
    V.initAll(node); return entry;
  }
  S.openNavSheet = function (t) { return openSheet(S.navSheetHtml(), 'left', t, '.nav-item[aria-current="page"]'); };
  S.openMore = function (t) { return openSheet(S.moreSheetHtml(), 'bottom', t, '.more-item[aria-current="page"]'); };

  /* ---------- Top-up: every "Top up" opens the Top-up sheet in place when the page registered it, else Billing ---------- */
  /* 05-knowledge-billing §2.4/§2.7: the Top-up sheet opens over the current page from any route. A page may register its
     own sheet (Billing, Home); every other page gets the shared one (assets/topup.js, loaded on first use and injected
     into the portal). billing.html?topup=1 stays only as a deep link. o: { returnTo, focusAfter, amount, forCall, onDone } */
  var SHELL_SRC = (d.currentScript && d.currentScript.src) || ($$('script[src]').filter(function (x) { return /shell\.js(?:[?#].*)?$/.test(x.src); })[0] || { src: 'assets/shell.js' }).src;
  var topUpHandler = null, ASSETS = (SHELL_SRC || '').replace(/shell\.js(?:[?#].*)?$/, '');
  function loadTopUp(cb) {
    if (V.topUpSheet) { cb(); return; }
    var s = $('script[data-vaani="topup"]');
    if (!s) { s = d.createElement('script'); s.src = ASSETS + 'topup.js'; s.setAttribute('data-vaani', 'topup'); d.head.appendChild(s); }
    s.addEventListener('load', function () { if (V.topUpSheet) cb(); });
    s.addEventListener('error', function () { w.location.href = 'billing.html?topup=1'; });
  }
  V.openTopUp = function (source, o) {
    if (topUpHandler) return topUpHandler(source || 'app', o);
    o = o || {}; var rt = o.returnTo || (d.activeElement !== d.body ? d.activeElement : null);
    loadTopUp(function () { V.topUpSheet.open(source || 'app', { returnTo: rt, focusAfter: o.focusAfter, amount: o.amount, forCall: o.forCall, onDone: o.onDone }); });
  };
  V.topUp = { register: function (fn) { topUpHandler = fn; if (new URLSearchParams(w.location.search).get('topup') === '1') setTimeout(function () { fn('url'); }, 0); }, registered: function () { return !!topUpHandler; }, load: loadTopUp };
  /* ?topup=1 on a page without its own sheet: open the shared one once the page has rendered */
  w.addEventListener('load', function () { if (new URLSearchParams(w.location.search).get('topup') === '1' && $('.app')) setTimeout(function () { if (!topUpHandler) V.openTopUp('url'); }, 50); });

  S.signOut = function (returnTo) {
    V.dialog.confirm({ title: 'Sign out of Vaani Labs?', body: "You’ll be signed out on this device. Scheduled calls and batches keep running.", confirmLabel: 'Sign out', focusCancel: true, returnTo: returnTo })
      .then(function (ok) { if (ok) V.toast.info('Sign-out is not wired in this prototype. Nothing changed.'); });
  };
  V.setTitle = function (record, state) { var n = V.navById(S.currentId()); d.title = [state, record && String(record).slice(0, 60), n ? n.label : null, 'Vaani Labs'].filter(Boolean).join(' · '); };

  /* Skip link: move focus to main without touching location.hash (Billing and Settings route on the hash). */
  d.addEventListener('click', function (e) { var s = e.target.closest && e.target.closest('.skip-link'); if (!s) return; var t = d.getElementById((s.getAttribute('href') || '').replace(/^#/, '')); if (!t) return; e.preventDefault(); if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus(); });

  /* ---------- delegated shell actions and menu selections ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-vaani-action]'); if (!t) return;
    var a = t.getAttribute('data-vaani-action');
    if (a === 'palette') { e.preventDefault(); V.commandPalette.open({ returnTo: t }); }
    else if (a === 'shortcuts') { e.preventDefault(); V.shortcuts.openSheet(t); }
    else if (a === 'expand') { e.preventDefault(); S.toggleSidebar(); }
    else if (a === 'navsheet') { e.preventDefault(); S.openNavSheet(t); }
    else if (a === 'more') { e.preventDefault(); S.openMore(t); }
    else if (a === 'topup') { e.preventDefault(); V.overlays.stack.filter(function (x) { return x.kind === 'navsheet' || x.kind === 'popover'; }).forEach(function (x) { x.close('navigate'); }); V.openTopUp('shell', { returnTo: d.contains(t) ? t : null, forCall: !!t.closest('.gate, .gate-row, [data-topup-for="call"]') }); }
    else if (a === 'signout') { e.preventDefault(); V.overlays.closeAll(); S.signOut(); }
    else if (a === 'help') { e.preventDefault(); V.toast.info('Help and docs open outside this prototype.'); }
  });
  d.addEventListener('vaani:menuselect', function (e) {
    var it = e.detail.item, act = it.getAttribute('data-act'), v = e.detail.value; if (!act) return;
    if (act === 'theme') { V.theme.set(v); }
    else if (act === 'motion') { V.motion.set(v); }
    else if (act === 'shortcuts') { V.shortcuts.setEnabled(e.detail.checked); }
    else if (act === 'sheet') { setTimeout(function () { V.shortcuts.openSheet(); }, 0); }
    else if (act === 'signout') { setTimeout(function () { S.signOut(); }, 0); }
    else if (act === 'external') { V.toast.info('This link leaves the app and is not part of this prototype.'); }
    else if (act === 'ask-invite') { var ad = ((DATA.org || {}).members || []).filter(function (m) { return m.role === 'Admin' && !m.you && !m.invited; })[0]; try { navigator.clipboard.writeText('https://app.vaanilabs.in/settings/organization?invite=1'); } catch (x) { /* blocked */ } V.toast.info('Request link copied. Send it to ' + (ad ? ad.short : 'an admin') + ' to invite teammates.'); }
    else if (act === 'switch' && v !== 'ws_sample') { V.toast.info('Workspace switching is not wired in this prototype.'); }
  });
  d.addEventListener('vaani:change', function (e) {
    var g = e.target.closest && e.target.closest('[data-vaani-pref]'); if (!g) return;
    if (g.getAttribute('data-vaani-pref') === 'vaani-more-theme') V.theme.set(e.detail.value);
    if (g.getAttribute('data-vaani-pref') === 'vaani-more-motion') V.motion.set(e.detail.value);
  });

  /* ---------- F6 region cycling: navigation → main → open sheet → Baseline (06-accessibility §6.4) ---------- */
  function regions() {
    var nav = [el.sidebar, el.rail, el.topbar, el.bbar].filter(function (x) { return x && U.visible(x); })[0];
    var r = [nav, el.main];
    V.overlays.stack.forEach(function (x) { if (x.kind === 'sheet' && !x.modal) r.push(x.el); });
    if (el.bl && U.visible(el.bl)) r.push(el.bl);
    return r.filter(Boolean);
  }
  function focusRegion(reg) {
    var t = reg === el.main ? el.main : ($('[aria-current="page"]', reg) || $('.sheet-title', reg) || U.focusables(reg)[0] || reg);
    if (!t.hasAttribute('tabindex') && !t.matches('a,button,input,select,textarea')) t.setAttribute('tabindex', '-1'); t.focus();
  }

  /* ---------- offline: the ConnectionBar is the only app-wide bar (O §10.3) ---------- */
  /* Offline (03-pages/00 §5.5): the ConnectionBar says it once, and the Baseline keeps its values with the wallet segment
     reading "· as of 11:42 am". A page that draws its own ConnectionBar (a demo state, or its own copy) keeps it; the
     shell then reuses that bar’s time so the two never disagree. V.connection.offline({ at, bar }) lets a page declare a
     simulated offline state explicitly; V.connection.online() ends it. */
  var loadedAt = Date.now();
  function nowAt() { return V.fmt.time(new Date(V.fmt.now().getTime() + (Date.now() - loadedAt)).toISOString()); }
  function pageBar() { return el.main ? $$('.cbar', el.main).filter(function (c) { return !c.hasAttribute('data-vaani-cbar') && !!$('[data-icon="cloud-off"]', c) && U.visible(c); })[0] || null : null; }
  function barTime(c) { var m = c && /from\s+(\d{1,2}:\d{2})\s*([ap]m)/i.exec(c.textContent); return m ? m[1] + ' ' + m[2].toLowerCase() : null; }
  function offline(o) {
    o = o || {}; if (!el.main) return;
    setTimeout(function () {   /* let the page’s own 'offline' listener draw its bar first */
      var pb = pageBar(), mine = $('[data-vaani-cbar]', el.main);
      var at = o.at || barTime(pb) || (mine && mine.getAttribute('data-at')) || S.offlineAt() || nowAt();
      if (pb && mine) mine.remove();
      else if (!pb && !mine && o.bar !== false) el.main.insertAdjacentHTML('afterbegin', '<div class="cbar" role="status" data-vaani-cbar data-at="' + esc(at) + '">' + icon('cloud-off') + '<span><b>You’re offline.</b> Showing data from ' + esc(at) + '.</span></div>');
      if (S.offlineAt() !== at) { S.setOfflineAt(at); S.render(); }
    }, 0);
  }
  function online() {
    var c = el.main && $('[data-vaani-cbar]', el.main), was = !!S.offlineAt(); if (c) c.remove();
    if (was) { S.setOfflineAt(null); S.render(); V.toast.success('Back online.'); }
  }
  V.connection = { offline: function (o) { offline(o); }, online: online, isOffline: function () { return !!S.offlineAt(); }, at: function () { return S.offlineAt(); } };

  /* ---------- boot ---------- */
  function boot() {
    S.injectSprite();
    if (!ensure()) {
      /* No app shell (public pages, the component gallery). A page that opts in with body[data-palette] still gets Ctrl/⌘ K and ? */
      V.initAll(d);
      if (d.body.hasAttribute('data-palette')) { V.shortcuts.register('mod+k', function () { V.commandPalette.toggle(); }, { description: 'Search or jump', inFields: true }); V.shortcuts.register('?', function () { V.shortcuts.openSheet(); }, { description: 'Keyboard shortcuts' }); }
      V.emit('ready'); return;
    }
    S.render(); V.initAll(d);
    V.shortcuts.register('mod+k', function () { V.commandPalette.toggle(); }, { description: 'Search or jump', inFields: true });
    V.shortcuts.register('?', function () { V.shortcuts.openSheet(); }, { description: 'Keyboard shortcuts' });
    var focusMode = function () { return d.body.getAttribute('data-shell') === 'focus'; };
    V.shortcuts.register('[', function () { S.toggleSidebar(); }, { description: 'Collapse or expand the sidebar', when: function () { return !focusMode() && V.bp.desktopShell(); }, hidden: focusMode });
    var cycle = function (dir) { var r = regions(), a = d.activeElement, i = r.findIndex(function (x) { return x.contains(a); }); var n = i + dir; if (n >= r.length || n < 0) return false; focusRegion(r[n]); };
    V.shortcuts.register('f6', function () { return cycle(1); }, { description: 'Next region' });
    V.shortcuts.register('shift+f6', function () { return cycle(-1); }, { description: 'Previous region' });
    V.shortcuts.register('f8', function () { V.toast.focusNewest(); }, { description: 'Go to notifications' });
    V.shortcuts.register('escape', null, { description: 'Close the top-most overlay', displayOnly: true });
    /* '/' focuses the page search in view (pages may render or swap it after boot); nothing to do when there is none */
    var pageSearch = function () { return $$('[data-page-search]').filter(function (x) { return U.visible(x) && !x.closest('[inert]'); })[0] || null; };
    V.shortcuts.register('/', function () { var s = pageSearch(); if (!s) return false; s.focus(); if (s.select) s.select(); }, { description: 'Search this page', group: 'Lists and tables', when: function () { return !!pageSearch(); }, hidden: function () { return !pageSearch(); } });
    var rt = null;
    w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { S.syncTitle(); S.renderBaseline(); if (railEntry && V.bp.shell() !== 'rail' && d.body.getAttribute('data-shell') !== 'focus') railEntry.close('resize'); V.emit('breakpoint', V.bp.current()); }, 150); });
    if (w.visualViewport) w.visualViewport.addEventListener('resize', function () { var open = V.bp.phone() && w.visualViewport.height < w.innerHeight * 0.75; if (open) root.setAttribute('data-keyboard', 'open'); else root.removeAttribute('data-keyboard'); });
    w.addEventListener('offline', function () { offline(); }); w.addEventListener('online', online);
    if (navigator.onLine === false) offline();
    /* a page that renders a simulated offline state (?demo=offline) draws its ConnectionBar: the Baseline follows it */
    w.addEventListener('load', function () { setTimeout(function () { if (!S.offlineAt() && pageBar()) offline({ bar: false }); }, 250); });
    V.on('theme', function () { S.render(); });
    V.on('motion', function () { S.render(); });
    V.on('shortcuts', function () { S.render(); });
    /* pages render after shell.js runs; re-sync the H1 hand-off and the Baseline once their scripts have run */
    d.addEventListener('DOMContentLoaded', function () { S.syncTitle(); S.renderBaseline(); });
    w.addEventListener('load', function () { S.syncTitle(); S.renderBaseline(); });
    V.emit('ready');
  }
  V.ready = function (fn) { if (V._booted) fn(); else V.on('ready', fn); };
  V.on('ready', function () { V._booted = true; });
  S.boot = boot;   /* called once at the end of shell.js, after the widgets module */
})(window, document, window.Vaani);

/* ---------- 5. Widgets: tabs, segmented control, switch, select, combobox, slider, password toggle, data tables; boot ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc;
  function fire(el, name, detail) { el.dispatchEvent(new CustomEvent('vaani:' + name, { bubbles: true, detail: detail })); }

  /* Tabs: [role=tablist] > [role=tab]; roving tabindex; data-activation="manual" (ViewTabs) selects on Enter/Space only. */
  function tabsOf(list) { return $$('[role="tab"]', list).filter(function (t) { return t.closest('[role="tablist"]') === list; }); }
  function selectTab(tab, focus) {
    var list = tab.closest('[role="tablist"]'); if (!list || tab.getAttribute('aria-disabled') === 'true') return;
    tabsOf(list).forEach(function (t) { var on = t === tab; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.setAttribute('tabindex', on ? '0' : '-1'); var p = t.getAttribute('aria-controls'); var panel = p && d.getElementById(p); if (panel && panel.getAttribute('role') === 'tabpanel') panel.hidden = !on; });
    if (focus) tab.focus();
    fire(list, 'tabchange', { tab: tab, id: tab.id, value: tab.getAttribute('data-value') });
  }
  V.tabs = { select: selectTab, init: function (root) { $$('[role="tablist"]', root).forEach(function (list) { var t = tabsOf(list), sel = t.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0] || t[0]; t.forEach(function (x) { x.setAttribute('tabindex', x === sel ? '0' : '-1'); }); }); } };
  d.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t && t.tagName !== 'A') selectTab(t, false); });
  d.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('[role="tab"]'); if (!t) return;
    var list = t.closest('[role="tablist"]'), tabs = tabsOf(list), i = tabs.indexOf(t), vert = list.getAttribute('aria-orientation') === 'vertical', n = null;
    if (e.key === (vert ? 'ArrowDown' : 'ArrowRight')) n = tabs[(i + 1) % tabs.length];
    else if (e.key === (vert ? 'ArrowUp' : 'ArrowLeft')) n = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') n = tabs[0]; else if (e.key === 'End') n = tabs[tabs.length - 1];
    else if ((e.key === 'Enter' || e.key === ' ') && t.tagName !== 'A') { e.preventDefault(); selectTab(t, true); return; }
    if (!n) return; e.preventDefault();
    if (list.getAttribute('data-activation') === 'manual') { tabs.forEach(function (x) { x.setAttribute('tabindex', x === n ? '0' : '-1'); }); n.focus(); } else selectTab(n, true);
  });

  /* Segmented control and any radiogroup of role=radio buttons: arrows move and select; one tab stop. */
  function radios(g) { return $$('[role="radio"]', g).filter(function (r) { return r.closest('[role="radiogroup"]') === g; }); }
  function pick(r, focus) {
    var g = r.closest('[role="radiogroup"]'); if (!g || r.getAttribute('aria-disabled') === 'true') return;
    radios(g).forEach(function (x) { var on = x === r; x.setAttribute('aria-checked', on ? 'true' : 'false'); x.setAttribute('tabindex', on ? '0' : '-1'); if (on) x.setAttribute('data-selected', ''); else x.removeAttribute('data-selected'); });
    if (focus) r.focus();
    fire(g, 'change', { value: r.getAttribute('data-value'), item: r });
    var target = g.getAttribute('data-density-for'); if (target) { var t = d.querySelector(target); V.density.set(t, r.getAttribute('data-value'), g.getAttribute('data-density-key')); }
  }
  V.seg = { select: pick, init: function (root) { $$('[role="radiogroup"]', root).forEach(function (g) { var rs = radios(g); if (!rs.length) return; var sel = rs.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0] || rs[0]; rs.forEach(function (x) { x.setAttribute('tabindex', x === sel ? '0' : '-1'); if (x === sel) x.setAttribute('data-selected', ''); }); }); } };
  d.addEventListener('click', function (e) { var r = e.target.closest('[role="radio"]'); if (r && r.tagName !== 'INPUT') pick(r, false); });
  d.addEventListener('keydown', function (e) {
    var r = e.target.closest && e.target.closest('[role="radio"]'); if (!r || r.tagName === 'INPUT') return;
    var g = r.closest('[role="radiogroup"]'), rs = radios(g).filter(function (x) { return x.getAttribute('aria-disabled') !== 'true'; }), i = rs.indexOf(r), n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = rs[(i + 1) % rs.length]; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = rs[(i - 1 + rs.length) % rs.length]; else if (e.key === ' ') n = r;
    if (n) { e.preventDefault(); pick(n, true); }
  });

  /* Switch: <button role="switch" aria-checked>; applies at once; aria-disabled keeps it focusable with its reason. */
  d.addEventListener('click', function (e) {
    var s = e.target.closest('[role="switch"]'); if (!s || s.hasAttribute('data-manual') || s.tagName === 'INPUT') return;
    if (s.getAttribute('aria-disabled') === 'true' || s.disabled) return;
    var on = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', on ? 'true' : 'false'); fire(s, 'change', { checked: on });
  });

  /* Select: button.select[data-select] + .listbox[role=listbox] (aria-controls). Focus moves into the list; typeahead. */
  function opts(lb) { return $$('[role="option"]', lb).filter(function (o) { return U.visible(o) || !lb.hidden; }); }
  function activate(lb, o, ctl) { opts(lb).forEach(function (x) { x.classList.toggle('is-active', x === o); }); if (o) { (ctl || lb).setAttribute('aria-activedescendant', o.id || (o.id = U.uid('opt'))); o.scrollIntoView({ block: 'nearest' }); } }
  function choose(trigger, lb, o, entry) {
    if (!o || o.getAttribute('aria-disabled') === 'true') return false;
    opts(lb).forEach(function (x) { x.setAttribute('aria-selected', x === o ? 'true' : 'false'); });
    var label = (o.querySelector('.option-label') || o).textContent.trim(), val = o.getAttribute('data-value') || label;
    var v = trigger.querySelector('.select-value'); if (v) { v.textContent = label; v.classList.remove('is-placeholder'); }
    var input = trigger.getAttribute('data-name') && d.querySelector('input[name="' + trigger.getAttribute('data-name') + '"]'); if (input) input.value = val;
    trigger.setAttribute('data-value', val);
    /* close the listbox before the change fires: a page that re-renders on change replaces the trigger, so focus is re-resolved afterwards (never <body>) */
    if (entry) entry.close('select');
    fire(trigger, 'change', { value: val, label: label, option: o });
    if (entry && !trigger.isConnected && (!d.activeElement || d.activeElement === d.body || !d.activeElement.isConnected)) { var n = V.util.resolveDetached(trigger); if (n) n.focus(); }
    return true;
  }
  function openSelect(trigger, fromKey) {
    var lb = U.byId(trigger.getAttribute('aria-controls')); if (!lb) return;
    lb.style.minWidth = trigger.offsetWidth + 'px'; lb.setAttribute('tabindex', '-1');
    var entry = U.float(lb, trigger, { kind: 'popover', placement: 'bottom-start', onClose: function () { lb.removeAttribute('aria-activedescendant'); } });
    var cur = opts(lb).filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0] || opts(lb)[0];
    if (fromKey === 'ArrowUp') cur = opts(lb)[opts(lb).length - 1];
    lb.focus(); activate(lb, cur);
    var typed = '', at = 0;
    lb.onkeydown = function (e) {
      var l = opts(lb).filter(function (o) { return o.getAttribute('aria-disabled') !== 'true'; }), a = lb.querySelector('.is-active'), i = l.indexOf(a);
      if (e.key === 'ArrowDown') { e.preventDefault(); activate(lb, l[Math.min(l.length - 1, i + 1)]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activate(lb, l[Math.max(0, i - 1)]); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); activate(lb, e.key === 'Home' ? l[0] : l[l.length - 1]); }
      else if (e.key === 'PageDown' || e.key === 'PageUp') { e.preventDefault(); activate(lb, l[Math.max(0, Math.min(l.length - 1, i + (e.key === 'PageDown' ? 8 : -8)))]); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(trigger, lb, a, entry); }
      else if (e.key === 'Tab') { entry.close('tab'); }
      else if (e.key.length === 1) { var now = Date.now(); typed = now - at > 700 ? e.key.toLowerCase() : typed + e.key.toLowerCase(); at = now; var hit = l.filter(function (o) { return o.textContent.trim().toLowerCase().indexOf(typed) === 0; })[0]; if (hit) activate(lb, hit); }
    };
    lb.onclick = function (e) { var o = e.target.closest('[role="option"]'); if (o) choose(trigger, lb, o, entry); };
  }
  d.addEventListener('click', function (e) { var t = e.target.closest('[data-select]'); if (!t || t.getAttribute('aria-disabled') === 'true') return; e.preventDefault(); if (t.getAttribute('aria-expanded') === 'true') V.popover.close(t.getAttribute('aria-controls')); else openSelect(t); });
  d.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('[data-select]'); if (!t || t.getAttribute('aria-disabled') === 'true' || t.getAttribute('aria-expanded') === 'true') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openSelect(t, e.key); }
    else if (e.key.length === 1 && /\S/.test(e.key)) { var lb = U.byId(t.getAttribute('aria-controls')); var l = opts(lb), cur = l.findIndex(function (o) { return o.getAttribute('aria-selected') === 'true'; }); var k = e.key.toLowerCase(); for (var j = 1; j <= l.length; j++) { var o = l[(cur + j) % l.length]; if (o.textContent.trim().toLowerCase().indexOf(k) === 0 && o.getAttribute('aria-disabled') !== 'true') { choose(t, lb, o); break; } } }
  });

  /* Combobox: .input[data-combobox] > input[role=combobox] + optional .input-btn + .listbox. Filters by "contains". */
  function initCombo(box) {
    if (box._combo) return; box._combo = true;
    var input = $('input', box), lb = U.byId(input.getAttribute('aria-controls')), entry = null, btn = $('.input-btn', box);
    input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('autocomplete', 'off');
    function filter() {
      var q = input.value.trim().toLowerCase(), n = 0;
      opts(lb).forEach(function (o) { var txt = (o.textContent + ' ' + (o.getAttribute('data-aliases') || '')).toLowerCase(); var hit = !q || txt.indexOf(q) >= 0; o.hidden = !hit; if (hit) n += 1; var lab = o.querySelector('.option-label') || o; if (!lab._t) lab._t = lab.textContent; var t0 = lab._t, i = q ? t0.toLowerCase().indexOf(q) : -1; lab.innerHTML = i < 0 ? esc(t0) : esc(t0.slice(0, i)) + '<b>' + esc(t0.slice(i, i + q.length)) + '</b>' + esc(t0.slice(i + q.length)); });
      var empty = $('.listbox-empty', lb); if (!n && !empty) lb.insertAdjacentHTML('beforeend', '<div class="listbox-empty">No matches for ‘' + esc(input.value) + '’.</div>'); else if (n && empty) empty.remove(); else if (empty) empty.textContent = 'No matches for ‘' + input.value + '’.';
      activate(lb, opts(lb).filter(function (o) { return !o.hidden; })[0], input);
      clearTimeout(input._t); input._t = setTimeout(function () { V.announce(n + ' results', { dedupeKey: 'combo' }); }, 400);
    }
    function open() { if (entry && !entry.closed) return; lb.style.minWidth = box.offsetWidth + 'px'; entry = U.float(lb, box, { kind: 'popover', placement: 'bottom-start', sheetOnPhone: false }); input.setAttribute('aria-expanded', 'true'); input.focus(); filter(); }
    function close() { if (entry && !entry.closed) entry.close('x'); input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    function pickO(o) { if (!o || o.getAttribute('aria-disabled') === 'true') return; opts(lb).forEach(function (x) { x.setAttribute('aria-selected', x === o ? 'true' : 'false'); }); input.value = (o.querySelector('.option-label') || o).textContent.trim(); box.setAttribute('data-value', o.getAttribute('data-value') || input.value); close(); fire(box, 'change', { value: box.getAttribute('data-value'), label: input.value, option: o }); }
    input.addEventListener('input', function () { open(); filter(); });
    input.addEventListener('keydown', function (e) {
      var vis = opts(lb).filter(function (o) { return !o.hidden && o.getAttribute('aria-disabled') !== 'true'; }), a = lb.querySelector('.is-active'), i = vis.indexOf(a);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!entry || entry.closed) open(); else activate(lb, vis[Math.min(vis.length - 1, i + 1)], input); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activate(lb, vis[Math.max(0, i - 1)], input); }
      else if (e.key === 'Enter' && entry && !entry.closed) { e.preventDefault(); pickO(a); }
      else if (e.key === 'Escape') { if (entry && !entry.closed) { e.preventDefault(); e.stopPropagation(); close(); } else if (input.value) { e.preventDefault(); e.stopPropagation(); input.value = ''; } }
      else if (e.key === 'Tab') close();
    });
    lb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    lb.addEventListener('click', function (e) { pickO(e.target.closest('[role="option"]')); });
    if (btn) btn.addEventListener('click', function () { if (entry && !entry.closed) close(); else { open(); } });
  }

  /* Slider: .slider[data-slider] with a .slider-thumb[role=slider]; arrows, PageUp/PageDown ×10, Home/End, pointer drag. */
  function initSlider(s) {
    if (s._sl) return; s._sl = true;
    var th = $('.slider-thumb', s), track = $('.slider-track', s), range = $('.slider-range', s), out = $('.slider-out', s);
    var min = +th.getAttribute('aria-valuemin'), max = +th.getAttribute('aria-valuemax'), step = +(s.getAttribute('data-step') || 1), suffix = s.getAttribute('data-suffix') || '';
    function set(v, announce) { v = Math.min(max, Math.max(min, Math.round(v / step) * step)); var p = (v - min) / (max - min) * 100; th.style.left = p + '%'; range.style.width = p + '%'; th.setAttribute('aria-valuenow', v); th.setAttribute('aria-valuetext', v + suffix); if (out) out.textContent = v + suffix; if (announce !== false) fire(s, 'change', { value: v }); }
    set(+th.getAttribute('aria-valuenow'), false);
    s._set = set;
    /* Mark labels near either end align to that end so they never spill out of the field (set data-align yourself to override). */
    $$('.slider-marks span', s).forEach(function (m) { if (m.hasAttribute('data-align')) return; var pc = parseFloat(m.style.left); if (pc < 20) m.setAttribute('data-align', 'start'); else if (pc > 80) m.setAttribute('data-align', 'end'); });
    th.addEventListener('keydown', function (e) { if (s.getAttribute('aria-disabled') === 'true') return; var v = +th.getAttribute('aria-valuenow'), n = null; if (e.key === 'ArrowRight' || e.key === 'ArrowUp') n = v + step; else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') n = v - step; else if (e.key === 'PageUp') n = v + step * 10; else if (e.key === 'PageDown') n = v - step * 10; else if (e.key === 'Home') n = min; else if (e.key === 'End') n = max; if (n != null) { e.preventDefault(); set(n); } });
    function fromX(x) { var r = track.getBoundingClientRect(); return min + (x - r.left) / r.width * (max - min); }
    track.addEventListener('pointerdown', function (e) { if (s.getAttribute('aria-disabled') === 'true') return; e.preventDefault(); th.focus(); th.classList.add('is-drag'); set(fromX(e.clientX)); track.setPointerCapture(e.pointerId); var mv = function (ev) { set(fromX(ev.clientX)); }; track.addEventListener('pointermove', mv); track.addEventListener('pointerup', function up() { th.classList.remove('is-drag'); track.removeEventListener('pointermove', mv); track.removeEventListener('pointerup', up); }); });
  }

  /* Password show/hide: the toggle keeps focus and names the action ("Show password" / "Hide password"). */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-password-toggle]'); if (!b) return; var input = U.byId(b.getAttribute('aria-controls')) || $('input', b.closest('.input')); if (!input) return;
    var show = input.type === 'password'; input.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', show ? 'true' : 'false'); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); b.innerHTML = V.icon(show ? 'eye-off' : 'eye');
  });

  /* Data tables: select-all, row selection (aria-selected), row click to the key link, roving row focus (↑ ↓ J K, Space/X, Enter), scrolled-x flag, sort cycle. */
  function tableRows(t) { return $$('tbody tr', t).filter(function (r) { return !r.classList.contains('dt-empty'); }); }
  function syncSel(t) {
    var rows = tableRows(t), boxes = rows.map(function (r) { return $('[data-select-row]', r); }).filter(Boolean), n = 0;
    rows.forEach(function (r) { var b = $('[data-select-row]', r); if (!b) return; r.setAttribute('aria-selected', b.checked ? 'true' : 'false'); if (b.checked) n += 1; });
    var all = $('[data-select-all]', t); if (all) { all.checked = n > 0 && n === boxes.length; all.indeterminate = n > 0 && n < boxes.length; }
    fire(t, 'selection', { count: n, rows: rows.filter(function (r) { return r.getAttribute('aria-selected') === 'true'; }) });
  }
  function initTable(t) {
    if (t._dt) return; t._dt = true;
    var rows = tableRows(t); rows.forEach(function (r, i) { r.setAttribute('tabindex', i === 0 ? '0' : '-1'); });
    t.addEventListener('change', function (e) { if (e.target.matches('[data-select-all]')) { tableRows(t).forEach(function (r) { var b = $('[data-select-row]', r); if (b) b.checked = e.target.checked; }); } if (e.target.matches('[data-select-row],[data-select-all]')) syncSel(t); });
    t.addEventListener('click', function (e) {
      var r = e.target.closest('tbody tr'); if (!r || e.target.closest('a,button,input,select,label,[role="button"]') || String(w.getSelection && w.getSelection()).length) return;
      var link = $('.c-key a', r) || (r.getAttribute('data-href') ? { click: function () { w.location.href = r.getAttribute('data-href'); } } : null); if (link) link.click();
    });
    t.addEventListener('keydown', function (e) {
      var r = e.target.closest('tbody tr'); if (!r || e.target !== r) return;
      var list = tableRows(t), i = list.indexOf(r), n = null, k = e.key.toLowerCase();
      var singleOk = V.shortcuts.enabled();
      if (e.key === 'ArrowDown' || (k === 'j' && singleOk)) n = list[i + 1]; else if (e.key === 'ArrowUp' || (k === 'k' && singleOk)) n = list[i - 1];
      else if (e.key === 'Home') n = list[0]; else if (e.key === 'End') n = list[list.length - 1];
      else if (e.key === ' ' || (k === 'x' && singleOk)) { var b = $('[data-select-row]', r); if (b) { e.preventDefault(); b.checked = !b.checked; syncSel(t); } return; }
      else if (e.key === 'Enter') { var a = $('.c-key a', r); if (a) { e.preventDefault(); a.click(); } return; }
      if (n) { e.preventDefault(); list.forEach(function (x) { x.setAttribute('tabindex', x === n ? '0' : '-1'); }); n.focus(); }
    });
    t.addEventListener('focusin', function (e) { var r = e.target.closest('tbody tr'); if (r) tableRows(t).forEach(function (x) { x.setAttribute('tabindex', x === r ? '0' : '-1'); }); });
    var wrap = t.closest('.dt-wrap'); if (wrap) wrap.addEventListener('scroll', function () { if (wrap.scrollLeft > 0) wrap.setAttribute('data-scrolled-x', ''); else wrap.removeAttribute('data-scrolled-x'); }, { passive: true });
    $$('.th-sort', t).forEach(function (b) { b.addEventListener('click', function () { var th = b.closest('th'), cur = th.getAttribute('aria-sort'); $$('th[aria-sort]', t).forEach(function (x) { if (x !== th) x.setAttribute('aria-sort', 'none'); }); var nx = cur === 'descending' ? 'ascending' : 'descending'; th.setAttribute('aria-sort', nx); b.innerHTML = b.innerHTML.replace(/<svg[\s\S]*<\/svg>/, V.icon(nx === 'ascending' ? 'arrow-up' : 'arrow-down', 'xs')); fire(t, 'sort', { column: th.getAttribute('data-col') || b.textContent.trim(), direction: nx }); V.announce('Sorted by ' + b.textContent.trim() + ', ' + (nx === 'ascending' ? 'ascending' : 'descending')); }); });
  }

  V.initAll = function (root) {
    root = root || d;
    if (w.VaaniIcon) w.VaaniIcon.hydrate(root);
    V.tabs.init(root); V.seg.init(root);
    $$('[data-combobox]', root).forEach(initCombo); $$('[data-slider]', root).forEach(initSlider); $$('table.dt', root).forEach(initTable);
    $$('[data-select]', root).forEach(function (t) { t.setAttribute('aria-haspopup', 'listbox'); if (!t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', 'false'); });
  };
  V.table = { init: initTable, syncSelection: syncSel };
  /* Vaani.slider.set(el, value, announce?): move a Slider from code (a paired NumberInput, C §6.5); fires vaani:change unless announce === false */
  V.slider = { set: function (el, v, announce) { el = U.byId(el); if (!el) return; if (!el._sl) initSlider(el); el._set(v, announce); } };
  V.shell.boot();
})(window, document, window.Vaani);

/* ---------- 6. Chart helpers (data-nav §11): Sparkline and a 1:1 bar chart with hover, keyboard and a finding label ---------- */
(function (w, d, V) {
  'use strict';
  var U = V.util, esc = U.esc;
  /* Sparkline: one neutral polyline, no fill, no axes, aria-hidden; "Not enough data yet" under 7 points. */
  V.ui.sparkline = function (values) {
    if (!values || values.length < 7) return '<div class="spark-empty">Not enough data yet</div>';
    var max = Math.max.apply(null, values), min = Math.min.apply(null, values), span = max - min || 1;
    var pts = values.map(function (v, i) { return (i / (values.length - 1) * 100).toFixed(2) + ',' + (30 - (v - min) / span * 28).toFixed(2); }).join(' ');
    return '<svg class="spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline points="' + pts + '"/></svg>';
  };
  function nice(max) { if (max <= 0) return 4; var p = Math.pow(10, Math.floor(Math.log10(max / 4))), s = [1, 2, 2.5, 5, 10].map(function (m) { return m * p; }).filter(function (x) { return x * 4 >= max; })[0]; return s * 4; }
  /* bars(el, { data: [{ label, value, sub }], format(v), label: 'Calls per day, last 7 days…', unit: 'calls' }) */
  function bars(el, o) {
    var data = o.data || [], fmt = o.format || V.fmt.count, active = -1, tip = null;
    el.classList.add('chart'); el.setAttribute('tabindex', '0'); el.setAttribute('role', 'img'); el.setAttribute('aria-roledescription', 'chart');
    if (o.label) el.setAttribute('aria-label', o.label);
    var live = d.createElement('div'); live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); el.after(live);
    function draw() {
      var W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
      var max = nice(Math.max.apply(null, data.map(function (x) { return x.value; }).concat([1]))), top = 8, bottom = 24, left = 8 + String(fmt(max)).length * 7 + 8, right = 4;
      var pw = W - left - right, ph = H - top - bottom, band = pw / Math.max(1, data.length), bw = Math.min(band * 0.56, 48), every = Math.max(1, Math.ceil(56 / band));
      var s = '<svg width="' + W + '" height="' + H + '" aria-hidden="true" focusable="false">';
      for (var t = 0; t <= 4; t++) { var y = top + ph - ph * t / 4, v = max * t / 4; s += '<line class="' + (t ? 'chart-grid' : 'chart-axis') + '" x1="' + left + '" x2="' + (W - right) + '" y1="' + y + '" y2="' + y + '"/><text class="chart-label" x="' + (left - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(fmt(v)) + '</text>'; }
      data.forEach(function (x, i) {
        var cx = left + band * i + band / 2, bh = max ? ph * x.value / max : 0, y0 = top + ph, r = Math.min(2, bh);
        if (i === active) s += '<rect class="chart-band" x="' + (cx - band / 2) + '" y="' + top + '" width="' + band + '" height="' + ph + '"/>';
        s += '<path class="chart-bar' + (i === active ? ' is-hl' : '') + '" d="M' + (cx - bw / 2) + ',' + y0 + 'V' + (y0 - bh + r) + 'Q' + (cx - bw / 2) + ',' + (y0 - bh) + ' ' + (cx - bw / 2 + r) + ',' + (y0 - bh) + 'H' + (cx + bw / 2 - r) + 'Q' + (cx + bw / 2) + ',' + (y0 - bh) + ' ' + (cx + bw / 2) + ',' + (y0 - bh + r) + 'V' + y0 + 'Z"/>';
        if (i % every === 0) s += '<text class="chart-label" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(x.label) + '</text>';
      });
      el.innerHTML = s + '</svg>';
      if (active >= 0 && tip) { var bx = el.getBoundingClientRect(), ax = bx.left + left + band * active + band / 2; tip.hidden = false; tip.innerHTML = '<div class="ctip-head">' + esc(data[active].sub || data[active].label) + '</div><div class="ctip-row">' + esc(o.unit || 'Value') + '<b>' + esc(fmt(data[active].value)) + '</b></div>'; var tw = tip.offsetWidth; tip.style.left = Math.min(w.innerWidth - tw - 8, Math.max(8, ax - tw / 2)) + 'px'; tip.style.top = Math.max(8, bx.top - tip.offsetHeight - 8) + 'px'; }
      else if (tip) tip.hidden = true;
    }
    function setActive(i, say) { active = i; if (!tip) { tip = d.createElement('div'); tip.className = 'ctip'; tip.hidden = true; d.body.appendChild(tip); } draw(); if (say && i >= 0) live.textContent = (data[i].sub || data[i].label) + ': ' + fmt(data[i].value) + ' ' + (o.unit || ''); }
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(), left = el.querySelector('line') ? +el.querySelector('line').getAttribute('x1') : 0, band = (r.width - left - 4) / data.length, i = Math.floor((e.clientX - r.left - left) / band); if (i >= 0 && i < data.length && i !== active) setActive(i); });
    el.addEventListener('pointerleave', function () { setActive(-1); });
    el.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); setActive(Math.min(data.length - 1, active + 1), true); } else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(Math.max(0, active - 1), true); } else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setActive(e.key === 'Home' ? 0 : data.length - 1, true); } else if (e.key === 'Escape') setActive(-1); });
    el.addEventListener('blur', function () { setActive(-1); });
    if (w.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(el); else draw();
    draw();
    return { redraw: draw, setData: function (nd) { data = nd; draw(); } };
  }
  V.charts = { bars: bars };
})(window, document, window.Vaani);

/* ---------- 7. TurnRow renderer (data-nav §12.4): one row for Cockpit, Call reports, Rep console, Meetings and Test ---------- */
(function (w, d, V) {
  'use strict';
  var esc = V.util.esc;
  /* V.ui.turn(turn, { review: bool (timecode is a seek button), active: bool, perTurnLanguage: bool, who: 'You' }) -> '<li class="turn">…'
     who overrides the speaker label (test calls and the Rep console show the person as "You"). speaker 'guest' (a named
     participant in a meeting) uses the caller lane with its own name. */
  V.ui.turn = function (t, o) {
    o = o || {};
    var tc = V.fmt.timecode((t.startMs || 0) / 1000);
    if (t.speaker === 'system') return '<li class="turn--sys">' + V.icon(t.icon || 'info', 'sm') + '<span>' + esc(t.text) + '</span></li>';
    var lane = t.speaker === 'caller' || t.speaker === 'guest';
    var cls = 'turn' + (lane ? ' turn--caller' : '') + (t.final === false ? ' turn--partial' : '') + (o.active ? ' turn--active' : '');
    var lang = t.lang ? ' lang="' + esc(t.lang) + '"' : '';
    var head = '<span class="turn-who" translate="no">' + esc(o.who || (t.speaker === 'caller' ? 'Caller' : (t.name || 'Vaani'))) + '</span>' +
      (t.lang && o.perTurnLanguage !== false ? V.ui.langMark(t.lang, 'compact') : '') +
      (t.step ? '<a class="turn-step" href="' + esc(t.step.href || '#') + '" aria-label="Open step: ' + esc(t.step.label) + '">Step · ' + esc(t.step.label) + '</a>' : '') +
      (t.source ? '<span class="turn-src">' + V.icon('book-open', 'xs') + esc(t.source.label) + '</span>' : '') +
      (t.final === false ? '<span>speaking…</span>' : '') + (o.active ? '<span>Playing</span>' : '');
    return '<li class="' + cls + '"' + lang + (o.active ? ' aria-current="true"' : '') + '>' +
      (o.review ? '<button type="button" class="turn-tc" aria-label="Play from ' + tc + '" data-seek="' + (t.startMs || 0) + '">' + tc + '</button>' : '<span class="turn-tc">' + tc + '</span>') +
      '<div class="turn-h">' + head + '</div><p class="turn-u">' + esc(t.text) + (t.final === false && !/…$/.test(t.text) ? '…' : '') + '</p></li>';
  };
})(window, document, window.Vaani);
