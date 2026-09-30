/* =====================================================================================================
   Vaani Labs prototype · assets/topup.js — the shared TopUpSheet (03-pages/05 §2.7; gate §5.6 money gate) and UpiPayment.
   "Mounted once in the AppShell and opened by ?topup=1 on any route": shell.js loads this file on the first
   V.openTopUp() of a page that did not register its own sheet (Billing and Home keep their page-owned sheets), and on
   load when the URL carries ?topup=1. The sheet opens over the current page, so a chat, a gate’s context or a form stays.
   API: V.topUpSheet.open(source, { returnTo, focusAfter: () => element, amount, onDone(result) })
     - returnTo: the trigger (default: the focused element). focusAfter: the control to focus after a successful top-up
       (the now-enabled call control, §2.4); else the trigger if it still exists, else the first visible [data-after-topup].
     - onDone({ state: 'success'|'pending'|'cancelled'|'closed', amount, balance })
   Emits V.emit('topup', { amount, balance }) and calls V.wallet.set(): the Baseline, the TopBar chip, the Billing nav badge
   and any page listening to V.on('wallet') follow. Demo params (shared with Billing): ?amount= ?tax=0 ?quote=error ?upi=intent.
   ===================================================================================================== */
(function (w, d) {
  'use strict';
  var V = w.Vaani; if (!V || V.topUpSheet) return;
  var U = V.util, esc = U.esc, $ = U.$, $$ = U.$$, DATA = V.data || {}, W = DATA.wallet || {};
  var MIN = W.min || 100, MAX = W.max || 100000, PRESETS = W.presets || [100, 500, 1000], RATE = W.ratePerSec || DATA.meta && DATA.meta.ratePerSec || 0.04;
  var Q = new URLSearchParams(w.location.search), TAX = Q.get('tax') !== '0', st = null, timers = [], el = null, quoteError = Q.get('quote') === 'error';
  var money = function (v, o) { return V.fmt.money(v, o); };
  var runway = function (b) { return V.fmt.runway(b, RATE); };
  var coarse = function () { return V.bp.coarse() || Q.get('upi') === 'intent'; };
  var icon = V.icon;

  function clearTimers() { timers.forEach(clearTimeout); timers = []; if (st && st.tick) { clearInterval(st.tick); st.tick = null; } }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function bal() { return (V.wallet.get() || {}).balance || 0; }
  function parse(raw) {
    var s = String(raw || '').replace(/₹|rs\.?|inr/gi, '').replace(/[\s,]/g, '');
    if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return { err: 'Enter an amount, like 500.' };
    if (/\.\d*[1-9]/.test(s)) return { err: 'Enter the amount in whole rupees.' };
    var n = Number(s); if (n < MIN || n > MAX) return { err: 'Enter an amount from ₹100 to ₹1,00,000.' };
    return { value: Math.round(n) };
  }
  /* the server quote (§2.7): the client never computes tax in the product; here it stands in for the quote */
  function quote(n) { var tax = TAX ? Math.round(n * 18) / 100 : 0; return { credit: n, tax: tax, total: Math.round((n + tax) * 100) / 100 }; }
  function payLabel() { var p = parse(st.raw); return p.value && !quoteError ? 'Pay ' + money(quote(p.value).total, { auto: true }) + ' via UPI' : 'Pay via UPI'; }
  function sub() {
    var b = bal(), low = b / RATE < 3600, rw = b > 0 ? ' · ' + runway(b) + ' of calls' : ' · phone calls paused';
    return (low ? '<span class="tu-low">' + icon('triangle-alert', 'xs') + 'Low</span> · ' : '') + 'Balance ' + esc(money(b)) + esc(rw);
  }
  function mask(v) { var p = String(v).split('@'); return p[0].charAt(0) + '•••••' + (p[1] ? '@' + p[1] : ''); }

  /* ---------- UpiPayment: an illustrative QR, three steps, a text countdown, Pay using UPI ID, Open UPI app ---------- */
  function qr(label) {
    var n = 29, q = 4, seed = 7, cells = '';
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    function box(x, y) { for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) if (i === 0 || i === 6 || j === 0 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5)) cells += '<rect x="' + (x + i + q) + '" y="' + (y + j + q) + '" width="1" height="1"/>'; }
    function reserved(x, y) { return (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8); }
    box(0, 0); box(n - 7, 0); box(0, n - 7);
    for (var x = 0; x < n; x++) for (var y = 0; y < n; y++) { if (reserved(x, y)) continue; if ((x === 6 || y === 6) ? (x + y) % 2 === 0 : rnd() > 0.52) cells += '<rect x="' + (x + q) + '" y="' + (y + q) + '" width="1" height="1"/>'; }
    return '<div class="tu-qr" role="img" aria-label="' + esc(label) + '"><svg viewBox="0 0 ' + (n + 2 * q) + ' ' + (n + 2 * q) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + cells + '</svg></div>';
  }
  function upiHtml() {
    var amt = money(st.q.total), label = 'UPI QR code to pay ' + amt + ' to Vaani Labs', c = coarse();
    var steps = '<ol class="tu-steps"><li><span class="tu-step-n" aria-hidden="true">1</span>Open any UPI app on your phone</li><li><span class="tu-step-n" aria-hidden="true">2</span>' + (c ? 'Choose Vaani Labs' : 'Scan this code') + '</li><li><span class="tu-step-n" aria-hidden="true">3</span>Approve ' + esc(amt) + ' with your UPI PIN</li></ol>';
    var wait = '<p class="status status--md status--progress tu-wait">' + icon('loader-circle', 'md', { className: 'spinner' }) + '<span>' + (st.vpa ? 'Approve the request in the UPI app for <span translate="no">' + esc(st.vpa) + '</span>' : 'Waiting for payment') + ' · <span class="num" id="vaani-tu-cd">' + esc(V.fmt.timecode(st.left)) + '</span> left</span></p>';
    var vpa = '<div class="field"><label class="field-label" for="vaani-tu-vpa">Pay using UPI ID</label><div class="tu-vpa-row"><div class="input"><input id="vaani-tu-vpa" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="name@bank" aria-describedby="vaani-tu-vh vaani-tu-ve"></div><button class="btn" type="button" data-tu-collect>Send request</button></div><p class="field-hint" id="vaani-tu-vh">We’ll send a payment request to this UPI ID.</p><p class="field-error" id="vaani-tu-ve" hidden></p></div>';
    var proto = '<div class="tu-proto" role="group" aria-label="Prototype only: simulate what UPI reports"><p class="type-label-12">Prototype only · the QR is illustrative. Simulate what UPI reports:</p><div class="l-cluster l-cluster--xs"><button class="btn btn--sm" type="button" data-tu-sim="approve">Approve</button><button class="btn btn--sm" type="button" data-tu-sim="decline">Decline</button><button class="btn btn--sm" type="button" data-tu-sim="expire">Let it expire</button><button class="btn btn--sm" type="button" data-tu-sim="noanswer">No answer</button></div></div>';
    if (c) return '<a class="btn btn--primary btn--lg btn--full" href="#pay" data-tu-intent>' + icon('smartphone') + 'Open UPI app</a>' + wait + vpa + '<button class="btn btn--link tu-showqr" type="button" data-tu-showqr aria-expanded="false" aria-controls="vaani-tu-qrbox">Show QR code</button><div id="vaani-tu-qrbox" class="tu-upi" hidden>' + qr(label) + steps + '</div>' + proto;
    return '<div class="tu-upi">' + qr(label) + '<div class="tu-upi-side">' + steps + wait + '</div></div><p class="tu-or"><span>or</span></p>' + vpa + proto;
  }

  /* ---------- steps ---------- */
  function body(html) { var b = $('#vaani-tu-body'); b.innerHTML = html; V.initAll(b); }
  function foot(html) { var f = $('#vaani-tu-foot'); f.innerHTML = html; V.initAll(f); }
  function focusHead(id) { var h = $('#' + id); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); U.focusQuiet(h); } }
  function busy(on) { V.overlays.stack.forEach(function (e) { if (e.el === el) e.busy = !!on; }); }
  function kvRow(k, v, cls) { return '<div class="kv-row' + (cls ? ' ' + cls : '') + '"><dt>' + k + '</dt><dd>' + v + '</dd></div>'; }
  function quoteRows(p) {
    var q = p.value ? quote(p.value) : null, nb = p.value ? bal() + p.value : null;
    return (quoteError ? '' : kvRow('Wallet credit', q ? esc(money(q.credit)) : '–') + (TAX ? kvRow('GST (18%)', q ? esc(money(q.tax)) : '–') : '') + kvRow('You pay', q ? esc(money(q.total)) : '–', 'tu-quote-total')) +
      kvRow('New balance', nb != null ? esc(money(nb)) + ' · ' + esc(runway(nb)) + ' of calls' : '–');
  }
  function amountStep(focus) {
    st.step = 'amount'; clearTimers(); busy(false);
    var p = parse(st.raw);
    body('<div class="field tu-amt-field"><label class="field-label" for="vaani-tu-amt">Top-up amount<span class="sr-only">, in rupees</span></label>' +
      '<div class="tu-amt-row"><div class="seg tu-presets" role="radiogroup" aria-label="Choose an amount">' + PRESETS.map(function (n) { return '<button type="button" role="radio" data-value="' + n + '" aria-checked="' + (p.value === n) + '">' + esc(money(n, { whole: true })) + '</button>'; }).join('') + '</div>' +
      '<div class="input input--lg tu-amt-input"><span class="input-prefix" aria-hidden="true">₹</span><input id="vaani-tu-amt" inputmode="numeric" autocomplete="off" enterkeyhint="go" value="' + esc(st.raw) + '" aria-describedby="vaani-tu-amt-h vaani-tu-amt-e"' + (st.err ? ' aria-invalid="true"' : '') + ' data-autofocus></div></div>' +
      '<p class="field-hint" id="vaani-tu-amt-h">Minimum ₹100 · maximum ₹1,00,000</p><p class="field-error" id="vaani-tu-amt-e"' + (st.err ? '' : ' hidden') + '>' + (st.err ? icon('circle-alert', 'sm') + esc(st.err) : '') + '</p>' +
      '<p class="tu-adds" id="vaani-tu-adds">' + (p.value ? 'Adds ' + esc(runway(p.value)) + ' of phone calls at ₹' + RATE + '/s.' : '&nbsp;') + '</p><span class="sr-only" id="vaani-tu-live" aria-live="polite"></span></div>' +
      (quoteError ? '<div class="ierr" role="alert"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t get a price for this amount. <button class="btn btn--link" type="button" data-tu-requote>Retry</button></span></div></div>' : '') +
      '<dl class="kv kv--rows tu-quote" aria-label="Quote">' + quoteRows(p) + '</dl>' +
      '<p class="gate-note">Pay with any UPI app. Money is added when your UPI app confirms. Nothing is charged until you approve in your UPI app.</p>');
    var nudge = (W.autopay || {}).state === 'off' && bal() / RATE < 86400;
    foot((nudge ? '<span class="gate-reason">Autopay is off · <a href="billing.html#autopay">Set up autopay</a></span>' : '') + '<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button>' +
      '<button class="btn btn--primary" type="button" data-tu-pay aria-keyshortcuts="Control+Enter" data-tooltip="Continue to UPI" data-kbd="mod+enter"' + (quoteError ? ' aria-disabled="true" aria-describedby="vaani-tu-why"' : '') + '>' + esc(payLabel()) + '</button>' + (quoteError ? '<span class="sr-only" id="vaani-tu-why">Couldn’t get a price for this amount.</span>' : ''));
    if (focus) { var i = $('#vaani-tu-amt'); if (i) i.focus(); }
  }
  function syncAmount() {
    var p = parse(st.raw);
    $$('.tu-presets [role="radio"]', el).forEach(function (r) { var on = +r.getAttribute('data-value') === p.value; r.setAttribute('aria-checked', on ? 'true' : 'false'); r.setAttribute('tabindex', on ? '0' : '-1'); });
    if (!$$('.tu-presets [aria-checked="true"]', el).length) { var f = $('.tu-presets [role="radio"]', el); if (f) f.setAttribute('tabindex', '0'); }
    $('#vaani-tu-adds').innerHTML = p.value ? 'Adds ' + esc(runway(p.value)) + ' of phone calls at ₹' + RATE + '/s.' : '&nbsp;';
    $('.tu-quote', el).innerHTML = quoteRows(p);
    var pay = $('[data-tu-pay]', el); if (pay) pay.textContent = payLabel();
    clearTimeout(st.liveT); st.liveT = setTimeout(function () { var l = $('#vaani-tu-live'); if (l && p.value) l.textContent = 'Adds ' + runway(p.value) + ' of phone calls.'; }, 2000);
  }
  function showErr(msg) {
    st.err = msg; var e = $('#vaani-tu-amt-e'), i = $('#vaani-tu-amt'); if (!e) return;
    if (msg) { e.innerHTML = icon('circle-alert', 'sm') + esc(msg); e.hidden = false; i.setAttribute('aria-invalid', 'true'); } else { e.hidden = true; e.innerHTML = ''; i.removeAttribute('aria-invalid'); }
  }
  function pay() {
    if (!st || st.step !== 'amount' || st.paying) return;
    var p = parse(st.raw), btn = $('[data-tu-pay]', el);
    if (btn && btn.getAttribute('aria-disabled') === 'true') { V.announce('Couldn’t get a price for this amount.'); return; }
    if (!p.value) { showErr(p.err); $('#vaani-tu-amt').focus(); return; }
    st.paying = true; st.amount = p.value; st.q = quote(p.value); st.vpa = null; st.step = 'preparing';
    body('<p class="status status--md status--progress tu-wait">' + icon('loader-circle', 'md', { className: 'spinner' }) + '<span>Preparing your payment…</span></p>');
    foot('<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button>');
    focusHead('vaani-tu-t');
    later(function () { st.paying = false; waiting(); }, 900);
  }
  function waiting(vpa) {
    st.step = 'waiting'; if (vpa !== undefined) st.vpa = vpa; if (!st.left || vpa === undefined) st.left = 300;
    body('<button class="btn btn--link tu-back" type="button" data-tu-back>' + icon('chevron-left', 'sm') + 'Change amount</button><h3 class="type-title-16 tu-pay-h" id="vaani-tu-pay-h">Pay ' + esc(money(st.q.total)) + ' with any UPI app</h3>' + upiHtml());
    foot('<span class="gate-reason">Keep this open, or close it: we’ll add the money when UPI confirms.</span><button class="btn btn--tertiary" type="button" data-tu-cancelpay>Cancel payment</button>');
    focusHead('vaani-tu-pay-h');
    if (st.tick) clearInterval(st.tick);
    st.tick = setInterval(function () {
      st.left -= 1; var cd = $('#vaani-tu-cd'); if (cd) cd.textContent = V.fmt.timecode(Math.max(0, st.left));
      if (st.left === 60) V.announce('1 minute left to pay.');
      if (st.left <= 0) { clearInterval(st.tick); st.tick = null; result('expire'); }
    }, 1000);
  }
  function result(kind) {
    clearTimers();
    if (kind === 'approve') {
      st.step = 'confirming'; busy(true);
      body('<p class="status status--md status--progress tu-wait">' + icon('loader-circle', 'md', { className: 'spinner' }) + '<span>Payment received. Adding it to your wallet…</span></p>'); foot('');
      focusHead('vaani-tu-t');
      later(function () { busy(false); success(); }, 1200); return;
    }
    if (kind === 'decline') {
      st.step = 'declined';
      body('<div class="notice notice--danger notice--multi" role="alert">' + icon('circle-x') + '<span class="notice-body"><span class="notice-title" id="vaani-tu-res-h">UPI payment didn’t complete.</span> You were not charged. Declined by your bank.</span></div>');
      foot('<button class="btn btn--tertiary" type="button" data-tu-back>Change amount</button><button class="btn btn--primary" type="button" data-tu-retry>Try again</button>');
    } else if (kind === 'expire') {
      st.step = 'expired'; V.announce('The payment request expired.');
      body('<div class="notice notice--neutral notice--multi" role="status">' + icon('timer-off') + '<span class="notice-body"><span class="notice-title" id="vaani-tu-res-h">This payment request expired.</span> Nothing was charged.</span></div>');
      foot('<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" data-tu-retry>Create a new request</button>');
    } else if (kind === 'noanswer') {
      st.step = 'noanswer';
      body('<div class="notice notice--warning notice--multi" role="alert">' + icon('triangle-alert') + '<span class="notice-body"><span class="notice-title" id="vaani-tu-res-h">We haven’t heard back from UPI yet.</span> If money left your account, it will be added here or returned by your bank.</span><span class="notice-acts"><button class="btn btn--sm" type="button" data-tu-check>Check status</button></span></div>');
      foot('<button class="btn" type="button" data-drawer-close>Close</button>');
    }
    var f = $('#vaani-tu-foot .btn--primary') || $('#vaani-tu-foot .btn'); if (f) f.focus();
  }
  function credit(amount) {
    var nb = Math.round((bal() + amount) * 100) / 100;
    V.wallet.set({ state: 'healthy', balance: nb, runway: runway(nb) });
    V.emit('topup', { amount: amount, balance: nb });
    return nb;
  }
  function success() {
    st.step = 'success'; st.shownSuccess = true;
    var nb = credit(st.amount), utr = '6254 1873 9931', inv = 'INV-2026-0927';
    body('<div class="tu-result" role="status">' + icon('check', 'xl', { className: 'u-fg-success' }) + '<h3 class="type-title-16" id="vaani-tu-res-h">' + esc(money(st.amount, { whole: true })) + ' added</h3><p class="type-body-14 u-fg-2">New balance ' + esc(money(nb)) + ' · ' + esc(runway(nb)) + ' of calls.' + (st.forCall ? ' You can place the call now.' : '') + '</p></div>' +
      '<dl class="kv kv--rows">' + kvRow('Amount paid', esc(money(st.q.total))) + kvRow('UPI reference', '<span class="id-text">' + utr + '</span><button class="ibtn ibtn--sm" type="button" data-tu-copy="' + utr + '" aria-label="Copy UPI reference">' + icon('copy', 'sm') + '</button>') + kvRow('Invoice', '<span class="id-text">' + inv + '</span>') + '</dl>');
    foot('<button class="btn btn--tertiary" type="button" data-tu-invoice>' + icon('download') + 'Download invoice</button><button class="btn btn--primary" type="button" data-drawer-close>Done</button>');
    $('#vaani-tu-sub').innerHTML = sub();
    V.announce(money(st.amount, { whole: true }) + ' added. Wallet ' + money(nb) + '.');
    focusHead('vaani-tu-res-h');
  }

  /* ---------- mount, open, close ---------- */
  function mount() {
    if (el) return el;
    el = U.h('<div class="gate gate--sheet tu" id="vaani-topup" role="dialog" aria-modal="true" aria-labelledby="vaani-tu-t" aria-describedby="vaani-tu-sub" hidden>' +
      '<div class="gate-head"><h2 class="gate-title" id="vaani-tu-t">Top up wallet</h2><button class="ibtn ibtn--sm gate-close" type="button" data-drawer-close aria-label="Close top-up">' + icon('x') + '</button><span class="gate-sub" id="vaani-tu-sub"></span></div>' +
      '<div class="tu-scroll"><div class="gate-body" id="vaani-tu-body"></div></div><div class="gate-foot" id="vaani-tu-foot"></div></div>');
    d.body.appendChild(el);
    el.addEventListener('input', function (e) { if (e.target.id === 'vaani-tu-amt') { st.raw = e.target.value; if (st.err && parse(st.raw).value) showErr(null); syncAmount(); } });
    el.addEventListener('focusout', function (e) { if (e.target.id === 'vaani-tu-amt' && st && st.step === 'amount') { var p = parse(e.target.value); if (!e.target.value.trim()) return; showErr(p.err || null); if (p.value) { e.target.value = V.fmt.count(p.value); st.raw = e.target.value; } } });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'vaani-tu-amt' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); pay(); } });
    el.addEventListener('vaani:change', function (e) { if (e.target.closest('.tu-presets')) { st.raw = String(e.detail.value); $('#vaani-tu-amt').value = V.fmt.count(+e.detail.value); showErr(null); syncAmount(); } });
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-tu-pay]')) { pay(); return; }
      if (t.closest('[data-tu-back]')) { amountStep(true); return; }
      if (t.closest('[data-tu-retry]')) { st.step = 'amount'; pay(); return; }
      if (t.closest('[data-tu-requote]')) { quoteError = false; amountStep(true); return; }
      if (t.closest('[data-tu-cancelpay]')) { clearTimers(); st.step = 'cancelled'; V.drawer.close(el, 'cancel'); V.toast.info('Payment cancelled. Nothing was charged.'); return; }
      if (t.closest('[data-tu-check]')) { V.toast.info('Still no answer from UPI. We keep checking and add the money when it arrives.'); return; }
      if (t.closest('[data-tu-invoice]')) { V.toast.info('INV-2026-0927 downloads as a PDF in the product. This prototype has no files.'); return; }
      var sim = t.closest('[data-tu-sim]'); if (sim) { result(sim.getAttribute('data-tu-sim')); return; }
      if (t.closest('[data-tu-intent]')) { e.preventDefault(); V.toast.info('Your UPI app opens here in the product. Use the prototype buttons to simulate the result.'); return; }
      var sq = t.closest('[data-tu-showqr]'); if (sq) { var on = sq.getAttribute('aria-expanded') !== 'true'; sq.setAttribute('aria-expanded', on); $('#vaani-tu-qrbox').hidden = !on; sq.textContent = on ? 'Hide QR code' : 'Show QR code'; return; }
      if (t.closest('[data-tu-collect]')) {
        var inp = $('#vaani-tu-vpa'), err = $('#vaani-tu-ve'), v = inp.value.trim();
        if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(v)) { err.innerHTML = icon('circle-alert', 'sm') + 'Enter a UPI ID, like name@bank.'; err.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
        waiting(mask(v)); V.announce('Request sent. Approve it in your UPI app.'); return;
      }
      var c = t.closest('[data-tu-copy]'); if (c) { try { navigator.clipboard.writeText(c.getAttribute('data-tu-copy')); } catch (x) { /* blocked */ } V.toast.success('UPI reference copied.'); }
    });
    V.shortcuts.register('mod+enter', function () { pay(); }, { description: 'Pay (Top-up sheet)', group: 'Forms', inFields: true, when: function () { return !!st && st.step === 'amount' && V.drawer.isOpen(el); }, hidden: function () { return !st; } });
    return el;
  }
  function resolveAfter(o) {
    var f = o.focusAfter ? o.focusAfter() : null; if (f && d.contains(f) && U.visible(f)) return f;
    if (o.returnTo && d.contains(o.returnTo) && U.visible(o.returnTo) && !o.returnTo.closest('[inert]')) return o.returnTo;
    return $$('[data-after-topup]').filter(function (x) { return U.visible(x) && !x.closest('[inert]'); })[0] || null;
  }
  function onClose(o) {
    var s = st; st = null; clearTimers(); if (!s) return;
    try { var p = new URLSearchParams(w.location.search); if (p.has('topup') || p.has('amount')) { p.delete('topup'); p.delete('amount'); w.history.replaceState(null, '', w.location.pathname + (p.toString() ? '?' + p : '') + w.location.hash); } } catch (e) { /* file:// */ }
    var was = s.step, res = { state: 'closed', amount: s.amount || null, balance: bal() };
    if (was === 'success') { res.state = 'success'; setTimeout(function () { var t = resolveAfter(o); if (t) t.focus({ preventScroll: false }); }, 0); }
    else if (was === 'cancelled') res.state = 'cancelled';
    else if (was === 'waiting' || was === 'preparing' || was === 'noanswer') {
      /* the order continues on the server: Payment pending until UPI reports, then one toast (never money not yet received) */
      res.state = 'pending'; var before = bal();
      V.wallet.set({ state: 'pending', balance: before });
      setTimeout(function () { var nb = credit(s.amount); V.toast.success(money(s.amount, { whole: true }) + ' added. Wallet ' + money(nb) + ' · ' + runway(nb) + ' of calls.'); }, 9000);
    }
    if (o.onDone) o.onDone(res);
  }
  V.topUpSheet = {
    open: function (source, o) {
      o = o || {}; source = source || 'app';
      if ((V.connection && V.connection.isOffline()) || navigator.onLine === false) { V.toast.info('You’re offline. Top up when you reconnect.'); return null; }
      if (V.isAdmin && !V.isAdmin()) { var ad = ((DATA.org || {}).members || []).filter(function (m) { return m.role === 'Admin' && !m.you && !m.invited; })[0]; V.toast.info('Only admins can add money. Ask ' + (ad ? ad.short : 'an admin') + '.'); return null; }
      mount(); if (V.drawer.isOpen(el)) return null;
      var amt = o.amount || Q.get('amount'), rt = o.returnTo || (d.activeElement !== d.body ? d.activeElement : null);
      st = { source: source, raw: amt && parse(amt).value ? String(parse(amt).value) : '500', key: 'idem-' + Date.now().toString(36), step: 'amount', err: null,
        forCall: o.forCall != null ? !!o.forCall : /call|gate|assistant|cockpit|leads|rep/.test(source) };
      $('#vaani-tu-sub').innerHTML = sub();
      amountStep(false);
      var opts = { returnTo: rt, focusAfter: o.focusAfter, onDone: o.onDone };
      return V.drawer.open(el, { mode: 'modal', returnTo: rt, onClose: function () { onClose(opts); } });
    },
    isOpen: function () { return !!el && V.drawer.isOpen(el); }
  };
})(window, document);
