/* Vaani Labs prototype · pages/billing-topup.js — TopUpSheet (03-pages/05 §2.7; gate §5.6 money gate) and UpiPayment (§3).
   Step 1 Amount: presets radiogroup ₹100 · ₹500 · ₹1,000 in sync with a CurrencyInput (parses "Rs 1,000", validates on blur
   and submit, never clamps), the runway it buys, the server quote (credit · GST · You pay · New balance; tax row only when
   the quote has tax), Pay names the amount charged. Step 2 Pay: QR first on fine pointers, "Open UPI app" first on coarse
   ones, Pay using UPI ID, a text countdown. Results: Preparing · Waiting · Confirming · Success · Declined · Expired ·
   No answer yet; closing mid-payment leaves Payment pending and a toast on confirmation. One idempotency key per open sheet. */
(function (w, d) {
  'use strict';
  var B = w.VaaniBilling, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var MIN = 100, MAX = 100000, PRESETS = [100, 500, 1000];
  var T = B.topup = {}, st = null, timers = [];
  var coarse = function () { return V.bp.coarse() || new URLSearchParams(w.location.search).get('upi') === 'intent'; };

  function clearTimers() { timers.forEach(clearTimeout); timers = []; if (st && st.tick) { clearInterval(st.tick); st.tick = null; } }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function parse(raw) {
    var s = String(raw || '').replace(/₹|rs\.?|inr/gi, '').replace(/[\s,]/g, '');
    if (!s) return { err: 'Enter an amount, like 500.' };
    if (!/^-?\d+(\.\d+)?$/.test(s)) return { err: 'Enter an amount, like 500.' };
    var n = Number(s); if (/\.\d*[1-9]/.test(s)) return { err: 'Enter the amount in whole rupees.' };
    if (n < MIN || n > MAX) return { err: 'Enter an amount from ₹100 to ₹1,00,000.' };
    return { value: Math.round(n) };
  }
  function quote(n) { var tax = B.tax ? Math.round(n * 18) / 100 : 0; return { credit: n, tax: tax, total: Math.round((n + tax) * 100) / 100 }; }
  function payLabel() { var p = parse(st.raw); return p.value && !B.quoteError ? 'Pay ' + V.fmt.money(quote(p.value).total, { auto: true }) + ' via UPI' : 'Pay via UPI'; }
  function sub() {
    var bal = B.balance, low = bal / B.rate < 3600, rw = bal > 0 ? ' · ' + B.runway(bal) + ' of calls' : ' · phone calls paused';
    return (low ? '<span class="bill-sub-low">' + V.icon('triangle-alert', 'xs') + 'Low</span> · ' : '') + 'Balance ' + esc(V.fmt.money(bal)) + esc(rw);
  }

  /* ---------- UpiPayment (mode payment | mandate): QR (illustrative), steps, countdown, UPI ID, Open UPI app ---------- */
  B.upi = {
    qr: function (label) {
      var n = 29, q = 4, seed = 7, cells = '';
      function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
      function box(x, y) { for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) if (i === 0 || i === 6 || j === 0 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5)) cells += '<rect x="' + (x + i + q) + '" y="' + (y + j + q) + '" width="1" height="1"/>'; }
      function reserved(x, y) { return (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8); }
      box(0, 0); box(n - 7, 0); box(0, n - 7);
      for (var x = 0; x < n; x++) for (var y = 0; y < n; y++) { if (reserved(x, y)) continue; var on = (x === 6 || y === 6) ? (x + y) % 2 === 0 : rnd() > 0.52; if (on) cells += '<rect x="' + (x + q) + '" y="' + (y + q) + '" width="1" height="1"/>'; }
      return '<div class="bill-qr" role="img" aria-label="' + esc(label) + '"><svg viewBox="0 0 ' + (n + 2 * q) + ' ' + (n + 2 * q) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + cells + '</svg></div>';
    },
    html: function (o) {
      var amt = V.fmt.money(o.amount), mandate = o.mode === 'mandate', qrLabel = mandate ? 'UPI QR code to approve the autopay mandate for Vaani Labs' : 'UPI QR code to pay ' + amt + ' to Vaani Labs';
      var steps = '<ol class="bill-steps"><li><span class="bill-step-n" aria-hidden="true">1</span>Open any UPI app on your phone</li><li><span class="bill-step-n" aria-hidden="true">2</span>' + (o.coarse ? 'Choose Vaani Labs' : 'Scan this code') + '</li><li><span class="bill-step-n" aria-hidden="true">3</span>' + (mandate ? 'Approve the mandate with your UPI PIN' : 'Approve ' + esc(amt) + ' with your UPI PIN') + '</li></ol>';
      var wait = '<p class="status status--md status--progress bill-wait">' + V.icon('loader-circle', 'md', { className: 'spinner' }) + '<span>' + (o.vpa ? 'Approve the request in the UPI app for <span translate="no">' + esc(o.vpa) + '</span>' : 'Waiting for ' + (mandate ? 'approval' : 'payment')) + ' · <span class="num" id="' + o.id + '-cd">' + esc(V.fmt.timecode(o.left)) + '</span> left</span></p>';
      var vpa = o.collect === false ? '' : '<div class="field"><label class="field-label" for="' + o.id + '-vpa">Pay using UPI ID</label><div class="bill-vpa-row"><div class="input"><input id="' + o.id + '-vpa" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="name@bank" aria-describedby="' + o.id + '-vh ' + o.id + '-ve"></div><button class="btn" type="button" data-upi-collect>Send request</button></div><p class="field-hint" id="' + o.id + '-vh">We’ll send a ' + (mandate ? 'mandate' : 'payment') + ' request to this UPI ID.</p><p class="field-error" id="' + o.id + '-ve" hidden></p></div>';
      var proto = '<div class="bill-proto-box" role="group" aria-label="Prototype only: simulate what UPI reports"><p class="type-label-12">Prototype only · the QR is illustrative. Simulate what UPI reports:</p><div class="l-cluster l-cluster--xs"><button class="btn btn--sm" type="button" data-sim="approve">Approve</button><button class="btn btn--sm" type="button" data-sim="decline">Decline</button><button class="btn btn--sm" type="button" data-sim="expire">Let it expire</button><button class="btn btn--sm" type="button" data-sim="noanswer">No answer</button></div></div>';
      if (o.coarse) return '<a class="btn btn--primary btn--lg btn--full" href="#pay" data-upi-intent>' + V.icon('smartphone') + 'Open UPI app</a>' + wait + vpa + '<button class="btn btn--link bill-showqr" type="button" data-upi-showqr aria-expanded="false" aria-controls="' + o.id + '-qrbox">Show QR code</button><div id="' + o.id + '-qrbox" class="bill-upi" hidden>' + B.upi.qr(qrLabel) + steps + '</div>' + proto;
      return '<div class="bill-upi">' + B.upi.qr(qrLabel) + '<div class="bill-upi-side">' + steps + wait + '</div></div>' + (o.collect === false ? '' : '<p class="bill-or"><span>or</span></p>') + vpa + proto;
    }
  };

  /* ---------- render per step ---------- */
  function body(html) { $('#bill-tu-body').innerHTML = html; V.initAll($('#bill-tu-body')); }
  function foot(html) { $('#bill-tu-foot').innerHTML = html; V.initAll($('#bill-tu-foot')); }
  function focusHead(id) { var h = $('#' + id); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus(); } }
  function amountStep(focus) {
    st.step = 'amount'; clearTimers(); busy(false);
    var p = parse(st.raw), q = p.value ? quote(p.value) : null, nb = p.value ? B.balance + p.value : null;
    body('<div class="field bill-amt-field"><label class="field-label" for="bill-amt">Top-up amount<span class="sr-only">, in rupees</span></label>' +
      '<div class="bill-amt-row"><div class="seg bill-presets" role="radiogroup" aria-label="Choose an amount">' + PRESETS.map(function (n) { return '<button type="button" role="radio" data-value="' + n + '" aria-checked="' + (p.value === n) + '">' + esc(V.fmt.money(n, { whole: true })) + '</button>'; }).join('') + '</div>' +
      '<div class="input input--lg bill-amt-input"><span class="input-prefix" aria-hidden="true">₹</span><input id="bill-amt" inputmode="numeric" autocomplete="off" enterkeyhint="go" value="' + esc(st.raw) + '" aria-describedby="bill-amt-h bill-amt-e"' + (st.err ? ' aria-invalid="true"' : '') + ' data-autofocus></div></div>' +
      '<p class="field-hint" id="bill-amt-h">Minimum ₹100 · maximum ₹1,00,000</p><p class="field-error" id="bill-amt-e"' + (st.err ? '' : ' hidden') + '>' + (st.err ? V.icon('circle-alert', 'sm') + esc(st.err) : '') + '</p>' +
      '<p class="bill-adds" id="bill-adds">' + (p.value ? 'Adds ' + esc(B.runway(p.value)) + ' of phone calls at ' + B.data.perSec(B.rate) + '.' : '&nbsp;') + '</p><span class="sr-only" id="bill-adds-live" aria-live="polite"></span></div>' +
      (B.quoteError ? '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t get a price for this amount. <button class="btn btn--link" type="button" data-tu-requote>Retry</button></span></div></div>' : '') +
      '<dl class="kv kv--rows bill-quote" aria-label="Quote">' +
      (B.quoteError ? '' : '<div class="kv-row"><dt>Wallet credit</dt><dd>' + (q ? esc(V.fmt.money(q.credit)) : '–') + '</dd></div>' + (B.tax ? '<div class="kv-row"><dt>GST (18%)</dt><dd>' + (q ? esc(V.fmt.money(q.tax)) : '–') + '</dd></div>' : '') +
        '<div class="kv-row bill-quote-total"><dt>You pay</dt><dd>' + (q ? esc(V.fmt.money(q.total)) : '–') + '</dd></div>') +
      '<div class="kv-row"><dt>New balance</dt><dd>' + (nb != null ? esc(V.fmt.money(nb)) + ' · ' + esc(B.runway(nb)) + ' of calls' : '–') + '</dd></div></dl>' +
      '<p class="gate-note">Pay with any UPI app. Money is added when your UPI app confirms. Nothing is charged until you approve in your UPI app.</p>');
    var nudge = B.autopay.state === 'off' && B.balance / B.rate < 86400;
    foot((nudge ? '<span class="gate-reason">Autopay is off · <a href="#autopay" data-tu-autopay>Set up autopay</a></span>' : '') + '<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button>' +
      '<button class="btn btn--primary" type="button" data-tu-pay aria-keyshortcuts="Control+Enter" data-tooltip="Continue to UPI" data-kbd="mod+enter"' + (B.quoteError ? ' aria-disabled="true" aria-describedby="bill-tu-why"' : '') + '>' + esc(payLabel()) + '</button>' + (B.quoteError ? '<span class="sr-only" id="bill-tu-why">Couldn’t get a price for this amount.</span>' : ''));
    if (focus) { var i = $('#bill-amt'); if (i) i.focus(); }
  }
  function syncAmount() {
    var p = parse(st.raw), q = p.value ? quote(p.value) : null, nb = p.value ? B.balance + p.value : null;
    $$('.bill-presets [role="radio"]').forEach(function (r) { var on = +r.getAttribute('data-value') === p.value; r.setAttribute('aria-checked', on ? 'true' : 'false'); r.setAttribute('tabindex', on ? '0' : '-1'); });
    if (!$$('.bill-presets [aria-checked="true"]').length) { var f = $('.bill-presets [role="radio"]'); if (f) f.setAttribute('tabindex', '0'); }
    $('#bill-adds').innerHTML = p.value ? 'Adds ' + esc(B.runway(p.value)) + ' of phone calls at ' + B.data.perSec(B.rate) + '.' : '&nbsp;';
    var dds = $$('.bill-quote dd'), vals = B.quoteError ? [] : [q ? V.fmt.money(q.credit) : '–'].concat(B.tax ? [q ? V.fmt.money(q.tax) : '–'] : []).concat([q ? V.fmt.money(q.total) : '–']);
    vals.push(nb != null ? V.fmt.money(nb) + ' · ' + B.runway(nb) + ' of calls' : '–');
    dds.forEach(function (dd, i) { dd.textContent = vals[i]; });
    var pay = $('[data-tu-pay]'); if (pay) pay.textContent = payLabel();
    clearTimeout(st.liveT); st.liveT = setTimeout(function () { var l = $('#bill-adds-live'); if (l && p.value) l.textContent = 'Adds ' + B.runway(p.value) + ' of phone calls.'; }, 2000);
  }
  function showErr(msg) {
    st.err = msg; var e = $('#bill-amt-e'), i = $('#bill-amt'); if (!e) return;
    if (msg) { e.innerHTML = V.icon('circle-alert', 'sm') + esc(msg); e.hidden = false; i.setAttribute('aria-invalid', 'true'); } else { e.hidden = true; e.innerHTML = ''; i.removeAttribute('aria-invalid'); }
  }
  function busy(on) { V.overlays.stack.forEach(function (e) { if (e.el && e.el.id === 'bill-topup-sheet') e.busy = !!on; }); }

  function pay() {
    if (st.step !== 'amount' || st.paying) return;
    var p = parse(st.raw), btn = $('[data-tu-pay]');
    if (btn && btn.getAttribute('aria-disabled') === 'true') { V.announce('Couldn’t get a price for this amount.'); return; }
    if (!p.value) { showErr(p.err); $('#bill-amt').focus(); return; }
    st.paying = true; st.amount = p.value; st.q = quote(p.value); st.vpa = null;
    st.step = 'preparing';
    body('<p class="back-slot"></p><p class="status status--md status--progress">' + V.icon('loader-circle', 'md', { className: 'spinner' }) + '<span>Preparing your payment…</span></p>');
    foot('<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button>');
    later(function () { st.paying = false; waiting(); }, 900);
  }
  function waiting(vpa) {
    st.step = 'waiting'; if (vpa !== undefined) st.vpa = vpa; if (!st.left || vpa === undefined) st.left = 300;
    body('<button class="btn btn--link bill-back" type="button" data-tu-back>' + V.icon('chevron-left', 'sm') + 'Change amount</button><h3 class="type-title-16 bill-pay-h" id="bill-pay-h">Pay ' + esc(V.fmt.money(st.q.total)) + ' with any UPI app</h3>' +
      B.upi.html({ id: 'bill-tu', mode: 'payment', amount: st.q.total, coarse: coarse(), left: st.left, vpa: st.vpa }));
    foot('<span class="gate-reason">Keep this open, or close it: we’ll add the money when UPI confirms.</span><button class="btn btn--tertiary" type="button" data-tu-cancelpay>Cancel payment</button>');
    focusHead('bill-pay-h');
    if (st.tick) clearInterval(st.tick);
    st.tick = setInterval(function () {
      st.left -= 1; var cd = $('#bill-tu-cd'); if (cd) cd.textContent = V.fmt.timecode(Math.max(0, st.left));
      if (st.left === 60) V.announce('1 minute left to pay.');
      if (st.left <= 0) { clearInterval(st.tick); st.tick = null; result('expire'); }
    }, 1000);
  }
  /* Declined / Expired / No answer: the result is a Notice whose title is the result heading (an h3, like Success) */
  function resNotice(tone, role, icon, title, text, acts) {
    return '<div class="notice notice--' + tone + ' notice--multi bill-res-notice" role="' + role + '">' + V.icon(icon) + '<div class="notice-body"><h3 class="notice-title bill-res-title" id="bill-res-h">' + title + '</h3> ' + text + '</div>' + (acts ? '<span class="notice-acts">' + acts + '</span>' : '') + '</div>';
  }
  function result(kind) {
    clearTimers();
    if (kind === 'approve') {
      st.step = 'confirming'; busy(true);
      body('<p class="status status--md status--progress bill-confirm">' + V.icon('loader-circle', 'md', { className: 'spinner' }) + '<span>Payment received. Adding it to your wallet…</span></p>'); foot('');
      later(function () { busy(false); success(); }, 1200); return;
    }
    if (kind === 'decline') {
      st.step = 'declined';
      body(resNotice('danger', 'alert', 'circle-x', 'UPI payment didn’t complete.', 'You were not charged. Declined by your bank.'));
      foot('<button class="btn btn--tertiary" type="button" data-tu-back>Change amount</button><button class="btn btn--primary" type="button" data-tu-retry>Try again</button>');
    } else if (kind === 'expire') {
      st.step = 'expired'; V.announce('The payment request expired.');
      body(resNotice('neutral', 'status', 'timer-off', 'This payment request expired.', 'Nothing was charged.'));
      foot('<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" data-tu-retry>Create a new request</button>');
    } else if (kind === 'noanswer') {
      st.step = 'noanswer';
      body(resNotice('warning', 'alert', 'triangle-alert', 'We haven’t heard back from UPI yet.', 'If money left your account, it will be added here or returned by your bank.', '<button class="btn btn--sm" type="button" data-tu-check>Check status</button>'));
      foot('<button class="btn" type="button" data-drawer-close>Close</button>');
    }
    /* §2.15: a result moves focus to the result heading (same as Success); the footer action is the next Tab stop */
    focusHead('bill-res-h');
  }
  function success() {
    st.step = 'success'; st.shownSuccess = true;
    var nb = B.balance + st.amount, inv = 'INV-2026-0927', utr = '6254 1873 9931';
    body('<div class="bill-result" role="status">' + V.icon('check', 'xl', { className: 'u-fg-success' }) + '<h3 class="type-title-16" id="bill-res-h">' + esc(V.fmt.money(st.amount, { whole: true })) + ' added</h3><p class="type-body-14 u-fg-2">New balance ' + esc(V.fmt.money(nb)) + ' · ' + esc(B.runway(nb)) + ' of calls.' + (st.entry === 'call_reason' ? ' You can place the call now.' : '') + '</p></div>' +
      B.kv([['Amount paid', esc(V.fmt.money(st.q.total))], ['UPI reference', '<span class="id-text">' + utr + '</span><button class="ibtn ibtn--sm" type="button" data-bill-copy="' + utr + '" aria-label="Copy UPI reference">' + V.icon('copy', 'sm') + '</button>'], ['Invoice', '<span class="id-text">' + inv + '</span>']], 'kv--rows'));
    foot('<button class="btn btn--tertiary" type="button" data-tu-invoice>' + V.icon('download') + 'Download invoice</button><button class="btn btn--primary" type="button" data-drawer-close>Done</button>');
    B.credit(st.amount, { invoice: inv, utr: utr, vpa: st.vpa || B.data.upi.anika });
    $('#bill-tu-sub').innerHTML = sub();
    V.announce(V.fmt.money(st.amount, { whole: true }) + ' added. Wallet ' + V.fmt.money(nb) + '.');
    focusHead('bill-res-h');
  }

  /* ---------- open / close ---------- */
  T.open = function (entry, returnTo) {
    var el = $('#bill-topup-sheet'); if (V.drawer.isOpen(el)) return;
    var amt = new URLSearchParams(w.location.search).get('amount');
    st = { entry: entry || 'app', raw: amt && parse(amt).value ? String(parse(amt).value) : '500', key: 'idem-' + Date.now().toString(36), step: 'amount', err: null };
    $('#bill-tu-sub').innerHTML = sub();
    amountStep(false);
    if (V.drawer.isOpen('bill-rec')) V.drawer.close('bill-rec', 'swap');
    V.drawer.open(el, { returnTo: returnTo || d.activeElement, onClose: onClose });
  };
  function onClose() {
    var was = st && st.step, amount = st && st.amount, q = st && st.q, shown = st && st.shownSuccess; clearTimers();
    try { var p = new URLSearchParams(w.location.search); if (p.has('topup') || p.has('amount')) { p.delete('topup'); p.delete('amount'); w.history.replaceState(null, '', w.location.pathname + (p.toString() ? '?' + p : '') + w.location.hash); } } catch (e) { /* file:// */ }
    if (was === 'waiting' || was === 'preparing' || was === 'noanswer') {
      /* the order continues on the server: Payment pending until UPI reports, then a toast (never money we haven’t received) */
      B.wallet = 'pending'; V.wallet.set({ state: 'pending', balance: B.balance });
      B.ledger.unshift({ id: 'txn_pend', at: V.fmt.now().toISOString(), kind: 'topup', label: 'Top-up via UPI', amount: amount, tax: q.tax, status: 'pending', ref: 'TXN-260927-0142', method: 'UPI · ' + B.data.upi.anika, balanceAfter: B.balance });
      B.render();
      setTimeout(function () { var nb = B.balance + amount; B.wallet = 'healthy'; B.credit(amount, {}); if (!shown) V.toast.success(V.fmt.money(amount, { whole: true }) + ' added. Wallet ' + V.fmt.money(nb) + ' · ' + B.runway(nb) + ' of calls.'); }, 9000);
    }
    st = null;
  }

  d.addEventListener('DOMContentLoaded', function () {
    var el = $('#bill-topup-sheet');
    el.addEventListener('input', function (e) { if (e.target.id === 'bill-amt') { st.raw = e.target.value; if (st.err && parse(st.raw).value) showErr(null); syncAmount(); } });
    el.addEventListener('focusout', function (e) { if (e.target.id === 'bill-amt' && st && st.step === 'amount') { var p = parse(e.target.value); if (!e.target.value.trim()) return; showErr(p.err || null); if (p.value) { e.target.value = V.fmt.count(p.value); st.raw = e.target.value; } } });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'bill-amt' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); pay(); } });
    el.addEventListener('vaani:change', function (e) { if (e.target.closest('.bill-presets')) { st.raw = String(e.detail.value); var i = $('#bill-amt'); i.value = V.fmt.count(+e.detail.value); showErr(null); syncAmount(); } });
    el.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-tu-pay]')) { pay(); return; }
      if (t.closest('[data-tu-back]')) { amountStep(true); return; }
      if (t.closest('[data-tu-retry]')) { st.step = 'amount'; pay(); return; }
      if (t.closest('[data-tu-requote]')) { B.quoteError = false; amountStep(true); return; }
      if (t.closest('[data-tu-cancelpay]')) { clearTimers(); st.step = 'cancelled'; V.drawer.close(el, 'cancel'); V.toast.info('Payment cancelled. Nothing was charged.'); return; }
      if (t.closest('[data-tu-check]')) { V.toast.info('Still no answer from UPI. We keep checking and add the money when it arrives.'); return; }
      if (t.closest('[data-tu-invoice]')) { V.toast.info('INV-2026-0927 downloads as a PDF in the product. This prototype has no files.'); return; }
      if (t.closest('[data-tu-autopay]')) { e.preventDefault(); V.drawer.close(el, 'navigate'); w.location.hash = '#autopay'; return; }
      var sim = t.closest('[data-sim]'); if (sim) { result(sim.getAttribute('data-sim')); return; }
      if (t.closest('[data-upi-intent]')) { e.preventDefault(); V.toast.info('Your UPI app opens here in the product. Use the prototype buttons to simulate the result.'); return; }
      var sq = t.closest('[data-upi-showqr]'); if (sq) { var on = sq.getAttribute('aria-expanded') !== 'true'; sq.setAttribute('aria-expanded', on); $('#bill-tu-qrbox').hidden = !on; sq.textContent = on ? 'Hide QR code' : 'Show QR code'; return; }
      if (t.closest('[data-upi-collect]')) {
        var inp = $('#bill-tu-vpa'), err = $('#bill-tu-ve'), v = inp.value.trim();
        if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(v)) { err.innerHTML = V.icon('circle-alert', 'sm') + 'Enter a UPI ID, like name@bank.'; err.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
        waiting(B.maskUpi(v)); V.announce('Request sent. Approve it in your UPI app.');
      }
      var c = t.closest('[data-bill-copy]'); if (c) { try { navigator.clipboard.writeText(c.getAttribute('data-bill-copy')); } catch (x) { /* blocked */ } V.toast.success('UPI reference copied.'); }
    });
    V.shortcuts.register('mod+enter', function () { pay(); }, { description: 'Pay (Top-up sheet)', group: 'Forms', inFields: true, when: function () { return st && st.step === 'amount' && V.drawer.isOpen('bill-topup-sheet'); } });
  });
})(window, document);
