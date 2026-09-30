/* Vaani Labs prototype · pages/billing.js — Billing core (03-pages/05 §2): state (wallet, autopay, role, demo states),
   formatRunway and maskUpiId (§3 library additions), the five route tabs (hash routes standing in for /billing/wallet …
   /billing/autopay; /billing replaces itself with #wallet), the header, the one page Notice, the record sheet host, the
   Baseline update after a confirmed top-up, and the prototype-only states menu. Tabs: billing-wallet.js, billing-usage.js,
   billing-plans.js (Plans, Invoices), billing-autopay.js; the Top-up sheet: billing-topup.js. */
(function (w, d) {
  'use strict';
  var B = w.VaaniBilling = w.VaaniBilling || {};
  var V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var P = new URLSearchParams(w.location.search);

  B.state = P.get('state') || '';                    /* loading · error · offline · first-use · permission */
  B.offline = B.state === 'offline';
  /* Member without billing access (BL9): the page’s own demo state, or the shared ?role=member switch (05 §1.10) */
  B.member = B.state === 'permission' || !V.isAdmin();
  B.wallet = V.walletState();                         /* healthy · low · empty · pending · autopay-failed (shared ?wallet=) */
  B.tax = P.get('tax') !== '0';                       /* the quote carries GST unless ?tax=0 (partial state) */
  B.quoteError = P.get('quote') === 'error';
  B.rate = B.data.rate.call;                          /* phone-call rate for runway, from the one rates source (billing-data.js) */

  /* ---------- who is signed in, and which admin the page names ----------
     The "Member without billing access" demo state is seen by a member, never by the admin it names: the signed-in user
     becomes Kiran Pillai (Member) for this page, the same way Settings swaps in a member for its member demo. The shell
     re-reads DATA.user on every render (boot calls V.shell.render()). The admin named in "Ask …" is the first active
     admin who is not the signed-in user, so the copy never tells someone to ask themselves. */
  var DATA = V.data, ORG = DATA.org || {}, MEMBERS = ORG.members || [];
  if (B.state === 'permission') {
    var kiran = MEMBERS.filter(function (m) { return m.id === 'u_kiran'; })[0];
    if (kiran) {
      MEMBERS.forEach(function (m) { m.you = m.id === kiran.id; });
      DATA.user = { id: kiran.id, name: kiran.name, short: kiran.short, initials: kiran.initials, role: 'Member', email: kiran.email, twoFactor: false };
      ORG.role = 'Member';
      (DATA.workspaces || []).forEach(function (x) { if (x.current) x.role = 'Member'; });
    }
  }
  var youId = (DATA.user || {}).id;
  var admin = MEMBERS.filter(function (m) { return m.role === 'Admin' && !m.invited && m.id !== youId; })[0];
  B.adminName = admin ? admin.short : 'an admin';                /* "Anika R." (a short name keeps its initial’s full stop) */
  /* One sentence for every admin-only control: "Only admins can add money. Ask Anika R." A short name that already ends in
     a full stop closes the sentence itself, so no second stop is appended ("Ask Anika R.", never "Ask Anika R.."). */
  B.adminAsk = function (what) { return 'Only admins can ' + what + '. Ask ' + String(B.adminName).replace(/\.+$/, '') + '.'; };

  /* ---------- DataTable keyboard model (N §7.9): only the active row’s controls are tabbable ---------- */
  B.rove = function (table) {
    if (!table) return;
    var sync = function () { $$('tbody tr', table).forEach(function (tr) { var on = tr.getAttribute('tabindex') === '0'; $$('a[href], button, input', tr).forEach(function (c) { c.tabIndex = on ? 0 : -1; }); }); };
    sync(); if (!table._rove) { table._rove = true; table.addEventListener('focusin', function () { setTimeout(sync, 0); }); }
  };

  /* ---------- a Select whose choice re-renders the tab it sits in (date range, rows per page, FY) ----------
     The shared Select fires vaani:change *before* it closes its listbox, and the close returns focus to the trigger
     (O §4). Re-rendering in the handler detaches that trigger, so focus used to fall back to the page title. After fn()
     re-renders, point the still-open listbox’s return at the rebuilt trigger (same aria-controls); with no listbox open
     (typeahead on the closed trigger) focus the rebuilt trigger directly. The keyboard user keeps their place. */
  B.onSelect = function (trigger, fn) {
    if (!trigger) return;
    var lbId = trigger.getAttribute('aria-controls');
    trigger.addEventListener('vaani:change', function (e) {
      var entry = V.overlays.stack.filter(function (x) { return x.returnTo === trigger && !x.closed; })[0], had = d.activeElement === trigger;
      fn(e);
      var nt = $('#bill-panel [aria-controls="' + lbId + '"]');
      if (!nt || nt === trigger || d.contains(trigger)) return;   /* no re-render (e.g. "Custom…" opens its own popover) */
      if (entry && !entry.closed) entry.returnTo = nt;
      else if (had || d.activeElement === d.body || !d.activeElement) nt.focus();
    });
  };

  /* ---------- formatRunway (lib/format.ts, §3): the shared Vaani.fmt.runway, always paired with its rate ---------- */
  B.runway = function (balance, rate) { return V.fmt.runway(balance || 0, rate || B.rate); };
  B.runwayWords = function (balance) { return B.runway(balance).replace(/ h\b/, ' hours').replace(/ min\b/, ' minutes'); };
  B.maskUpi = function (vpa) { var p = String(vpa).split('@'); return p[0].charAt(0) + '•••••@' + (p[1] || ''); };
  B.money = function (v, o) { return V.fmt.money(v, o); };
  B.signed = function (v) { return (v > 0 ? '+' : '') + V.fmt.money(v); };
  B.ist = function (m, dd, hm) { return '2026-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd + 'T' + (hm || '12:00') + ':00+05:30'; };

  /* ---------- the wallet: a copy of the local ledger, adjusted for the ?wallet= demo states ---------- */
  var L = B.data.ledger.map(function (x) { var c = {}; for (var k in x) c[k] = x[k]; return c; });
  var target = { healthy: 2340.5, low: 42.1, empty: 0, pending: 42.1, 'autopay-failed': 42.1 }[B.wallet];
  if (target == null) target = 2340.5;
  if (B.state === 'first-use') { L = []; target = 0; }
  else if (target !== L[0].balanceAfter) {
    /* a large batch today spent the difference (keeps every balance-after, the usage totals and the ledger consistent) */
    var extra = Math.round((L[0].balanceAfter - target) * 100) / 100, t = L[0], sec = Math.round(extra / B.rate), calls = Math.round(sec / 48);
    t.amount = Math.round((t.amount - extra) * 100) / 100; t.sec += sec; t.calls += calls; t.batch = 'Weekend follow-ups'; t.detail = V.fmt.count(t.calls) + ' calls · ' + B.data.fmtDur(t.sec) + ' · includes batch ‘' + t.batch + '’';
    t.balanceAfter = target;
    if (B.wallet === 'autopay-failed') {
      L.push({ id: 'txn_ap24', at: B.ist(9, 24, '06:00'), kind: 'autopay', label: 'Autopay top-up', amount: 500, tax: 90, status: 'failed', ref: 'AP-TXN-260924', method: 'UPI Autopay · ' + B.data.upi.anika, reason: 'Your bank declined the debit (insufficient balance). You were not charged.' });
      L.sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
      L.forEach(function (x, i) { if (x.id === 'txn_ap24') x.balanceAfter = L[i + 1] ? L[i + 1].balanceAfter : target; });
    }
  }
  if (B.wallet === 'pending') L.unshift({ id: 'txn_pend', at: B.ist(9, 27, '10:42'), kind: 'topup', label: 'Top-up via UPI', amount: 500, tax: 90, status: 'pending', ref: 'TXN-260927-0142', method: 'UPI · ' + B.data.upi.anika, balanceAfter: target, by: 'Anika R.' });
  B.ledger = L;
  B.balance = target;
  B.lastTopup = function () { var t = B.ledger.filter(function (x) { return (x.kind === 'topup' || x.kind === 'autopay') && x.status === 'completed'; })[0]; return t || null; };
  B.monthSpend = function () { return -B.ledger.filter(function (x) { return x.at >= '2026-09-01' && x.amount < 0 && x.status === 'completed'; }).reduce(function (a, x) { return a + x.amount; }, 0); };

  /* ---------- autopay state: ?autopay=off|on|paused|renewal|waiting|cancelled (autopay-failed wallet → paused) ---------- */
  B.autopay = { state: B.wallet === 'autopay-failed' ? 'paused' : (['on', 'paused', 'renewal', 'waiting', 'cancelled'].indexOf(P.get('autopay')) >= 0 ? P.get('autopay') : 'off'), threshold: 200, amount: 500, limit: 2500, usedThisMonth: 500, vpa: B.data.upi.anika, validUntil: '26 Sep 2027' };
  B.autopayTag = function () { var s = B.autopay.state; return V.ui.statusTag('autopay', s === 'cancelled' ? 'off' : s); };

  /* ---------- header, tabs, notice ---------- */
  B.renderMeta = function () {
    var el = $('#bill-meta'), t = B.lastTopup();
    if (B.state === 'loading') { el.innerHTML = '<span class="sk sk--meta bill-sk-meta" aria-hidden="true"></span><span class="sr-only">Loading billing</span>'; return; }
    el.innerHTML = '<span class="u-hide-phone">Prepaid wallet · </span>' + (t ? '<span class="u-hide-phone">last top-up </span><span class="u-only-phone">Last top-up </span>' + esc(V.fmt.date(t.at)).replace(/ 2026$/, '<span class="u-hide-phone"> 2026</span>') : 'No top-ups yet');
  };
  B.renderTabs = function () {
    $$('#bill-tabs .vtab').forEach(function (a) { if (a.getAttribute('data-tab') === B.tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var warn = B.autopay.state === 'paused' || B.autopay.state === 'renewal'; $('#bill-ap-warn').hidden = !warn;
    var cur = $('#bill-tabs .vtab[aria-current="page"]'), nav = $('#bill-tabs');
    if (cur && nav.scrollWidth > nav.clientWidth) { var l = cur.offsetLeft - nav.offsetLeft, r = l + cur.offsetWidth; if (r > nav.scrollLeft + nav.clientWidth || l < nav.scrollLeft) nav.scrollLeft = Math.max(0, l - 24); }
  };
  /* The one page Notice: Payment pending (info) or Autopay failed (danger, role="status": a standing condition) */
  B.pageNotice = function () {
    if (B.state === 'loading' || B.state === 'error') return '';
    if (B.wallet === 'pending') { var p = B.ledger.filter(function (x) { return x.status === 'pending'; })[0]; if (p) return '<div class="notice notice--info bill-notice" role="status">' + V.icon('clock') + '<span class="notice-body"><span class="notice-title">Payment pending.</span> ' + esc(V.fmt.money(p.amount + (B.tax ? p.tax : 0))) + ' started at ' + esc(V.fmt.time(p.at)) + '. Your wallet updates when UPI confirms.</span><span class="notice-acts"><button type="button" class="notice-act" data-bill-check>Check status</button></span></div>'; }
    if (B.autopay.state === 'paused' && B.tab === 'wallet') return '<div class="notice notice--danger bill-notice" role="status">' + V.icon('circle-x') + '<span class="notice-body"><span class="notice-title">Autopay couldn’t top up on 24 Sep.</span> Your bank declined the debit (insufficient balance). Calls pause at ₹0.</span><span class="notice-acts"><a class="notice-act" href="#autopay">Fix autopay</a></span></div>';
    return '';
  };

  /* ---------- record sheet host (transactions and invoices) ---------- */
  B.openRecord = function (html, title, returnTo) {
    var el = $('#bill-rec'); el.innerHTML = html; V.initAll(el);
    if (!V.drawer.isOpen(el)) V.drawer.open(el, { returnTo: returnTo || d.activeElement, onClose: function () { V.setTitle(null); $$('#bill-panel tr[aria-current]').forEach(function (r) { r.removeAttribute('aria-current'); }); } });
    else { var h = $('#bill-rec-t'); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus(); } }
    V.setTitle(title);
  };
  B.sheetHead = function (title, meta, back) {
    return '<div class="sheet-head"><button class="btn btn--tertiary sheet-back" type="button" data-drawer-close>' + V.icon('chevron-left') + esc(back || 'Billing') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="bill-rec-t">' + esc(title) + '</h2>' + (meta ? '<p class="sheet-meta">' + esc(meta) + '</p>' : '') + '</div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close">' + V.icon('x') + '</button></div></div>';
  };
  B.kv = function (rows, cls) { return '<dl class="kv' + (cls ? ' ' + cls : '') + '">' + rows.filter(Boolean).map(function (r) { return '<div class="kv-row"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; };

  /* ---------- after the payment provider confirms: balance, ledger, header, Baseline and chips update in place ---------- */
  B.credit = function (amount, o) {
    o = o || {};
    B.ledger = B.ledger.filter(function (x) { return x.status !== 'pending'; });
    var nb = Math.round((B.balance + amount) * 100) / 100;
    B.ledger.unshift({ id: 'txn_new' + Date.now(), at: V.fmt.now().toISOString(), kind: o.kind || 'topup', label: o.label || 'Top-up via UPI', amount: amount, tax: B.tax ? Math.round(amount * 18) / 100 : 0, status: 'completed', ref: 'TXN-260927-0' + (140 + B.ledger.length), method: 'UPI · ' + (o.vpa || B.data.upi.anika), utr: o.utr || '6254 1873 9931', invoice: o.invoice || 'INV-2026-0927', by: 'Anika R.', balanceAfter: nb, confirmedAt: V.fmt.now().toISOString(), fresh: true });
    B.balance = nb; if (B.wallet !== 'healthy') B.wallet = nb > 60 * 60 * B.rate ? 'healthy' : B.wallet;
    B.invoiceAdd && B.invoiceAdd(o.invoice || 'INV-2026-0927', amount);
    /* the chrome follows through the shared wallet API: Baseline wallet segment, TopBar chip, BaselineChip and nav badge */
    V.wallet.set({ balance: nb, state: B.wallet, runway: B.runway(nb) });
    B.renderMeta(); B.render();
  };

  /* ---------- routing ---------- */
  B.tabs = {};
  var TABS = ['wallet', 'usage', 'plans', 'invoices', 'autopay'];
  B.render = function () {
    var panel = $('#bill-panel'), fn = B.tabs[B.tab];
    if (B.state === 'error' && B.tab !== 'autopay' && B.tab !== 'wallet') { panel.innerHTML = B.sectionError(); }
    else if (fn) panel.innerHTML = fn.html();
    V.initAll(panel);
    if (fn && fn.after) fn.after(panel);
    B.renderTabs();
  };
  B.sectionError = function (what) { return '<div class="card"><div class="empty empty--danger">' + V.icon('circle-alert', 'lg') + '<h2 class="empty-title">' + esc(what || 'This section couldn’t load.') + '</h2><p>Your balance and payments are safe. This is a problem on our side or with your connection.</p><div class="empty-actions"><button class="btn btn--primary" type="button" data-bill-retry>Retry</button></div><details class="details"><summary>Details</summary><div class="raw"><code>bill-err-5c02e1</code></div></details></div></div>'; };
  function route(fromUser) {
    var h = (w.location.hash || '').replace('#', '');
    if (TABS.indexOf(h) < 0) { h = 'wallet'; try { w.history.replaceState(null, '', w.location.pathname + w.location.search + '#wallet'); } catch (e) { /* file:// */ } }
    var changed = B.tab !== h; B.tab = h;
    if (V.drawer.isOpen('bill-rec') && changed) V.drawer.close('bill-rec', 'navigate');
    B.render();
    V.setTitle(null);
    if (fromUser && changed) { $('#bill-scroll').scrollTop = 0; w.scrollTo(0, 0); }
  }

  /* ---------- prototype-only states (clearly marked; not product UI) ---------- */
  var STATES = [
    ['Wallet healthy (default)', ''], ['Wallet low', 'wallet=low'], ['Wallet empty (₹0)', 'wallet=empty'], ['Payment pending', 'wallet=pending'], ['Autopay failed', 'wallet=autopay-failed'],
    ['Top-up sheet open', 'topup=1'], ['Top-up sheet, ₹1,000 preset', 'topup=1&amount=1000'], ['Top-up: price quote fails', 'topup=1&quote=error'], ['Top-up: no tax in the quote', 'topup=1&tax=0'], ['Top-up on a phone-style coarse pointer', 'topup=1&upi=intent'],
    ['First use (never topped up)', 'state=first-use'], ['Loading (skeletons)', 'state=loading'], ['Error', 'state=error'], ['Offline', 'state=offline'], ['Member without billing access', 'state=permission'],
    ['Autopay: off', 'autopay=off#autopay'], ['Autopay: waiting for approval', 'autopay=waiting#autopay'], ['Autopay: on', 'autopay=on#autopay'], ['Autopay: paused', 'autopay=paused#autopay'], ['Autopay: needs renewal', 'autopay=renewal#autopay'], ['Autopay: cancelled from the UPI app', 'autopay=cancelled#autopay'],
    ['Invoices: no GSTIN yet', 'gstin=none#invoices'], ['Plans: wallet too low to switch', 'wallet=low#plans']
  ];
  function renderProtoMenu() {
    var cur = (w.location.search.replace(/^\?/, '') + (w.location.hash && w.location.hash !== '#wallet' ? w.location.hash : '')).replace(/^#wallet$/, '');
    $('#bill-proto-menu').innerHTML = '<div class="menu-head"><b>Prototype states</b><span>Not product UI. Reloads the page with a demo state.</span></div>' + STATES.map(function (s) {
      var q = s[1].split('#'), href = 'billing.html' + (q[0] ? '?' + q[0] : '') + (q[1] ? '#' + q[1] : '');
      return '<a class="menu-item" role="menuitemradio" aria-checked="' + (cur === s[1]) + '" href="' + href + '" data-proto-href><span class="menu-check">' + V.icon('check') + '</span><span class="menu-text"><span>' + esc(s[0]) + '</span></span></a>';
    }).join('');
  }

  B.boot = function () {
    if (B._booted) return; B._booted = true;
    if (B.state === 'permission' && V.shell && V.shell.render) V.shell.render();   /* sidebar, rail and account menu show the member */
    renderProtoMenu();
    $('#bill-proto-menu').addEventListener('click', function (e) {
      var a = e.target.closest('[data-proto-href]'); if (!a) return; e.preventDefault();
      var href = a.getAttribute('href'), same = href.split('#')[0] === 'billing.html' + w.location.search;
      w.location.href = href; if (same) setTimeout(function () { w.location.reload(); }, 30);
    });
    if (B.offline) { var main = $('#main'); main.insertAdjacentHTML('afterbegin', '<div class="cbar" role="status">' + V.icon('cloud-off') + '<span><b>You’re offline.</b> Showing billing from 11:24&nbsp;am.</span></div>'); }
    var tu = $('#bill-topup');
    if (B.offline) { tu.setAttribute('aria-disabled', 'true'); tu.setAttribute('data-tooltip', 'You’re offline'); }
    else if (B.member) { tu.setAttribute('aria-disabled', 'true'); tu.setAttribute('data-tooltip', B.adminAsk('add money')); }
    tu.addEventListener('click', function () { if (tu.getAttribute('aria-disabled') === 'true') { V.announce(tu.getAttribute('data-tooltip')); return; } B.topup.open('billing_header', tu); });
    V.topUp.register(function (src) { if (B.offline || B.member) { V.toast.info(B.offline ? 'You’re offline. Top up when you reconnect.' : B.adminAsk('add money')); return; } B.topup.open(src === 'url' ? 'url' : src, src === 'url' ? tu : d.activeElement); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-bill-retry]')) { e.preventDefault(); w.location.href = 'billing.html' + w.location.hash; }
      if (e.target.closest('[data-bill-topup]')) { e.preventDefault(); var b = e.target.closest('[data-bill-topup]'); if (b.getAttribute('aria-disabled') === 'true') { if (b.getAttribute('data-tooltip')) V.announce(b.getAttribute('data-tooltip')); return; } B.topup.open(b.getAttribute('data-bill-topup') || 'billing', b); }
      if (e.target.closest('[data-bill-check]')) { e.preventDefault(); V.toast.info('Still waiting for UPI. We check again every few seconds.'); }
    });
    w.addEventListener('hashchange', function () { route(true); });
    /* first use: the chrome shows the same ₹0 the page shows (Baseline, TopBar chip, nav badge) */
    if (B.state === 'first-use' && V.walletState() === 'healthy') V.wallet.set({ state: 'empty', balance: 0 });
    B.renderMeta();
    route(false);
    V.commandPalette.register([{ group: 'actions', title: 'Set up autopay…', icon: 'repeat', keywords: ['autopay', 'mandate', 'auto top up'], perform: function () { w.location.hash = '#autopay'; } }]);
  };
  d.addEventListener('DOMContentLoaded', function () { V.ready(B.boot); });
})(window, document);
