/* Vaani Labs prototype · pages/billing-autopay.js — Billing › Autopay (03-pages/05 §2.8): Off (the rule form with three
   CurrencyInputs, a live summary, "Review and approve…"), the Autopay gate sheet (money gate, UpiPayment mode="mandate",
   no in-app primary while waiting), Waiting for approval, On (the rule, monthly limit with a ProgressBar, Edit rule…,
   Turn off autopay… with a ConfirmDialog), Paused (danger Notice with "Retry ₹500 now"), Needs renewal, and cancelled from
   the UPI app. One status word per state (no duplicate "Status:" line). */
(function (w, d) {
  'use strict';
  var B = w.VaaniBilling, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var form = { threshold: '200', amount: '500', limit: '2,500', errs: {} }, gate = null;
  /* The mandate’s own history: the last automatic top-up ({ date, amount, ok }) or null ("None yet"). The fixtures
     (§2.8) have one on 21 Sep (₹500 used this month); Paused adds the declined 24 Sep debit; a mandate that is still
     waiting for approval, or was just approved, has none, so "₹0 used" and "None yet" agree (R1A-13). */
  (function () {
    var a = B.autopay; if (!a || a.last !== undefined) return;
    if (a.state === 'waiting') { a.last = null; a.usedThisMonth = 0; }
    else a.last = a.state === 'paused' ? { date: '24 Sep 2026', amount: a.amount, ok: false } : { date: '21 Sep 2026', amount: a.amount, ok: true };
  })();
  /* After a sheet, dialog or re-render removes the control that had focus, focus lands on the Autopay heading — never
     <body> (02-components-gate §4, 06 §7.3). */
  function focusHead() { var h = $('#bill-ap-h'); if (!h) return; h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus(); }
  function lostFocus() { var a = d.activeElement; return !a || a === d.body || !d.contains(a); }
  function num(v) { var s = String(v || '').replace(/₹|rs\.?|inr|[\s,]/gi, ''); return /^\d+$/.test(s) ? +s : null; }
  function money(n) { return V.fmt.money(n, { whole: true }); }
  function ro() { return B.member || B.offline; }
  function roReason() { return B.offline ? 'You’re offline' : B.adminAsk('change autopay'); }
  function validate() {
    var e = {}, t = num(form.threshold), a = num(form.amount), l = form.limit.trim() ? num(form.limit) : null;
    if (t == null || t < 100 || t > 100000) e.threshold = 'Enter an amount from ₹100 to ₹1,00,000.';
    if (a == null || a < 100 || a > 100000) e.amount = 'Enter an amount from ₹100 to ₹1,00,000.';
    if (form.limit.trim() && (l == null || (a != null && l < a))) e.limit = 'Set a limit of at least ' + (a ? money(a) : '₹500') + ', the amount added each time.';
    return e;
  }
  function field(id, label, key, hint, presets, opt) {
    var err = form.errs[key];
    return '<div class="field"><label class="field-label" for="ap-' + id + '">' + esc(label) + (opt ? ' <span class="field-opt">(optional)</span>' : '') + '<span class="sr-only">, in rupees</span></label>' +
      (presets ? '<div class="bill-amt-row"><div class="seg bill-presets" role="radiogroup" aria-label="Choose an amount to add" data-ap-presets>' + presets.map(function (n) { return '<button type="button" role="radio" data-value="' + n + '" aria-checked="' + (num(form[key]) === n) + '">' + money(n) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="input field--short"><span class="input-prefix" aria-hidden="true">₹</span><input id="ap-' + id + '" data-ap-key="' + key + '" inputmode="numeric" autocomplete="off" value="' + esc(form[key]) + '" aria-describedby="ap-' + id + '-h ap-' + id + '-e"' + (err ? ' aria-invalid="true"' : '') + (ro() ? ' readonly' : '') + '></div>' + (presets ? '</div>' : '') +
      '<p class="field-hint" id="ap-' + id + '-h">' + hint + '</p><p class="field-error" id="ap-' + id + '-e"' + (err ? '' : ' hidden') + '>' + (err ? V.icon('circle-alert', 'sm') + esc(err) : '') + '</p></div>';
  }
  function summary() {
    var t = num(form.threshold), a = num(form.amount), l = form.limit.trim() ? num(form.limit) : null;
    if (t == null || a == null) return 'Enter a balance and an amount to see the rule.';
    return 'When your wallet falls below ' + money(t) + ', we add ' + money(a) + ' from your UPI account' + (l ? ', at most ' + money(l) + ' a month.' : '.');
  }
  function offForm() {
    var t = num(form.threshold), a = num(form.amount);
    return '<div class="card bill-ap-form"><form class="form" id="ap-form" novalidate><div class="form-section">' +
      field('th', 'Top up when the balance falls below', 'threshold', (t ? esc(B.runway(t).replace(/^about/, 'About')) + ' of calls. ' : '') + 'Your bank notifies you before each automatic debit, so money can take up to a day to arrive.') +
      field('am', 'Amount to add', 'amount', a ? 'Adds ' + esc(B.runway(a)) + ' of calls each time.' : 'Minimum ₹100 · maximum ₹1,00,000', [500, 1000, 2000]) +
      field('li', 'Monthly limit', 'limit', 'Autopay stops for the rest of the month after this.', null, true) + '</div>' +
      '<div class="notice notice--neutral" role="status" aria-live="polite" id="ap-sum">' + V.icon('repeat') + '<span class="notice-body">' + esc(summary()) + '</span></div>' +
      '<div class="form-actions"><button class="btn btn--primary" type="submit"' + (ro() ? ' aria-disabled="true" data-tooltip="' + esc(roReason()) + '"' : '') + '>Review and approve…</button></div></form></div>';
  }
  function details(st) {
    var a = B.autopay, used = a.usedThisMonth || 0, last = a.last;
    /* no monthly limit (the optional field left empty): say so, and drop the bar — there is nothing to fill against */
    var limit = a.limit ? '<span>' + money(a.limit) + ' · ' + money(used) + ' used in September</span><span class="pbar pbar--thin bill-limit-bar"><span class="pbar-track" role="progressbar" aria-label="Monthly limit used" aria-valuemin="0" aria-valuemax="' + a.limit + '" aria-valuenow="' + used + '" aria-valuetext="' + money(used) + ' of ' + money(a.limit) + '"><span class="pbar-fill" style="--p: ' + Math.min(1, used / a.limit).toFixed(2) + '"></span></span></span>' : '<span>No limit · ' + money(used) + ' used in September</span>';
    return '<div class="card"><dl class="kv kv--rows">' +
      '<div class="kv-row"><dt>Rule</dt><dd>When below ' + money(a.threshold) + ', add ' + money(a.amount) + '</dd></div>' +
      '<div class="kv-row"><dt>Monthly limit</dt><dd class="bill-limit">' + limit + '</dd></div>' +
      '<div class="kv-row"><dt>UPI account</dt><dd translate="no">' + esc(a.vpa) + '</dd></div>' +
      '<div class="kv-row"><dt>Mandate valid until</dt><dd>' + (st === 'renewal' ? '30 Sep 2026' : esc(a.validUntil)) + '</dd></div>' +
      '<div class="kv-row"><dt>Last automatic top-up</dt><dd>' + (!last ? 'None yet' : esc(last.date) + ' · ' + money(last.amount) + ' · ' + (last.ok ? 'Completed' : V.ui.statusTag('payment', 'failed'))) + '</dd></div></dl>' +
      '<p class="gate-note">Your bank notifies you before each automatic debit.</p><div class="l-cluster u-mt-16"><button class="btn" type="button" data-ap-edit' + (ro() ? ' aria-disabled="true" data-tooltip="' + esc(roReason()) + '"' : '') + '>Edit rule…</button></div></div>' +
      '<div class="bill-ap-off"><button class="btn btn--tertiary" type="button" data-ap-off' + (ro() ? ' aria-disabled="true" data-tooltip="' + esc(roReason()) + '"' : '') + '>Turn off autopay…</button></div>';
  }

  B.tabs.autopay = {
    html: function () {
      var a = B.autopay, s = a.state, head = '<div class="bill-ap-head"><h2 class="section-title" id="bill-ap-h">Autopay</h2>' + B.autopayTag() + '</div>';
      if (B.state === 'loading') return '<div class="bill-form" aria-busy="true"><h2 class="sr-only">Autopay</h2><div class="card">' + [4, 3, 4, 3].map(function (n) { return '<span class="sk-line"><span class="sk bill-sk-w' + n + '"></span></span>'; }).join('') + '</div></div>';
      if (B.state === 'error') return '<div class="bill-form"><h2 class="sr-only">Autopay</h2>' + B.sectionError('Autopay couldn’t load.') + '</div>';
      var html = '<section class="bill-form" aria-labelledby="bill-ap-h">' + head;
      if (B.member) html += '<p class="status status--md">' + V.icon('lock', 'md') + '<span>' + esc(B.adminAsk('change autopay')) + '</span></p>';
      if (s === 'off' || s === 'cancelled') {
        html += '<p class="section-desc">Top up automatically when your balance runs low, so calls never pause. You approve a UPI Autopay mandate once, in your UPI app.</p>';
        if (s === 'cancelled') html += '<div class="notice notice--neutral" role="status">' + V.icon('info') + '<span class="notice-body">Autopay was cancelled from your UPI app on 22 Sep. Set it up again to resume automatic top-ups.</span></div>';
        if (B.balance / B.rate < 3600 && s === 'off') html += '<p class="status status--md status--warning">' + V.icon('triangle-alert', 'md') + '<span>Your wallet is low. Autopay would have topped it up.</span></p>';
        html += offForm();
      } else if (s === 'waiting') {
        html += '<div class="notice notice--info" role="status">' + V.icon('clock') + '<span class="notice-body"><span class="notice-title">Waiting for your approval.</span> Approve the autopay mandate in your UPI app with your UPI PIN. The request expires at 11:39&nbsp;am.</span><span class="notice-acts"><button class="btn btn--sm" type="button" data-ap-review>Show approval steps</button></span></div>' + details('on').replace(/<div class="bill-ap-off">[\s\S]*$/, '');
      } else {
        if (s === 'paused') html += '<div class="notice notice--danger" role="status">' + V.icon('circle-x') + '<span class="notice-body"><span class="notice-title">Autopay couldn’t top up on 24 Sep.</span> Your bank declined the debit (insufficient balance). Calls pause at ₹0.</span><span class="notice-acts"><button class="btn btn--sm" type="button" data-ap-retry' + (ro() ? ' aria-disabled="true" data-tooltip="' + esc(roReason()) + '"' : '') + '>Retry ' + money(a.amount) + ' now</button><a class="notice-act" href="#topup" data-bill-topup="autopay_notice">Top up manually</a></span></div>';
        if (s === 'renewal') html += '<div class="notice notice--warning" role="status">' + V.icon('triangle-alert') + '<span class="notice-body"><span class="notice-title">Your autopay mandate ends on 30 Sep.</span> Renew it to keep automatic top-ups.</span><span class="notice-acts"><button class="btn btn--sm" type="button" data-ap-renew' + (ro() ? ' aria-disabled="true" data-tooltip="' + esc(roReason()) + '"' : '') + '>Renew mandate…</button></span></div>';
        html += details(s);
      }
      return B.pageNotice().indexOf('Payment pending') >= 0 ? B.pageNotice() + html + '</section>' : html + '</section>';
    }
  };

  /* ---------- Autopay gate sheet (mandate) ---------- */
  function openGate(renew, trigger) {
    var t = num(form.threshold) || B.autopay.threshold, a = num(form.amount) || B.autopay.amount, l = form.limit.trim() ? num(form.limit) : null;
    gate = { renew: renew, t: t, a: a, l: l, left: 300, step: 'waiting' };
    $('#bill-ap-t').textContent = renew ? 'Renew autopay' : 'Set up autopay';
    $('#bill-ap-sub').textContent = 'Nothing is charged now. You approve the mandate once, in your UPI app.';
    renderGate();
    V.drawer.open('bill-ap-sheet', { returnTo: trigger, onClose: function () { if (gate && gate.tick) clearInterval(gate.tick); gate = null; } });
  }
  function renderGate() {
    var g = gate, body = $('#bill-ap-body'), foot = $('#bill-ap-foot');
    if (g.tick) { clearInterval(g.tick); g.tick = null; }
    var rule = B.kv([['Trigger', 'When your wallet falls below ' + money(g.t)], ['Amount', money(g.a) + ' each time'], ['Monthly limit', g.l ? money(g.l) : 'No limit'], ['Mandate valid until', '26 Sep 2027'], ['Largest single debit', money(g.a)]], 'kv--rows');
    var adv = '<div class="gate-group">Good to know</div><ul class="gate-list"><li class="gate-row"><span class="gate-mark gate-mark--advisory" data-mark>' + V.icon('info') + '</span><span class="gate-text"><span class="sr-only">Note: </span>Your bank tells you before each automatic debit.</span></li><li class="gate-row"><span class="gate-mark gate-mark--advisory" data-mark>' + V.icon('info') + '</span><span class="gate-text"><span class="sr-only">Note: </span>You can pause or cancel the mandate from your UPI app at any time.</span></li></ul>';
    if (g.step === 'waiting') {
      body.innerHTML = rule + adv + '<h3 class="type-title-16" id="bill-ap-pay-h">Approve once with your UPI PIN</h3>' + B.upi.html({ id: 'bill-ap', mode: 'mandate', amount: g.a, coarse: V.bp.coarse() || new URLSearchParams(w.location.search).get('upi') === 'intent', left: g.left, collect: false });
      foot.innerHTML = '<span class="gate-reason">You approve with your UPI PIN, in your UPI app. Nothing to press here.</span><button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button>';
      g.tick = setInterval(function () { g.left -= 1; var cd = $('#bill-ap-cd'); if (cd) cd.textContent = V.fmt.timecode(Math.max(0, g.left)); if (g.left === 60) V.announce('1 minute left to approve.'); if (g.left <= 0) { g.step = 'expired'; renderGate(); } }, 1000);
    } else if (g.step === 'declined') {
      body.innerHTML = '<div class="notice notice--danger notice--multi" role="alert">' + V.icon('circle-x') + '<span class="notice-body"><span class="notice-title">The mandate wasn’t approved.</span> Nothing was set up and nothing was charged.</span></div>';
      foot.innerHTML = '<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" data-ap-again>Try again</button>';
    } else if (g.step === 'expired') {
      body.innerHTML = '<div class="notice notice--neutral notice--multi" role="status">' + V.icon('timer-off') + '<span class="notice-body"><span class="notice-title">This approval request expired.</span> Nothing was set up.</span></div>';
      foot.innerHTML = '<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" data-ap-again>Create a new request</button>';
    }
    V.initAll($('#bill-ap-sheet'));
    var f = g.step === 'waiting' ? $('#bill-ap-pay-h') : $('#bill-ap-foot .btn--primary'); if (f) { if (!f.matches('button')) { f.setAttribute('tabindex', '-1'); f.setAttribute('data-focus-target', ''); } setTimeout(function () { f.focus(); }, 0); }
  }
  function approved() {
    var g = gate, a = B.autopay; a.state = 'on'; a.threshold = g.t; a.amount = g.a; a.limit = g.l || null;
    /* A new mandate starts with no automatic top-ups: "None yet" and ₹0 used. Renewing (or re-approving a larger amount)
       keeps this month’s history, which already counted against the monthly limit. */
    if (!g.renew) { a.usedThisMonth = 0; a.last = null; }
    V.drawer.close('bill-ap-sheet', 'confirm');   /* returns focus to "Review and approve…", which B.render() then replaces */
    V.toast.success('Autopay is on. We’ll add ' + money(g.a) + ' when your wallet falls below ' + money(g.t) + '.');
    B.render(); focusHead();
  }

  /* ---------- Edit rule (Dialog md) ---------- */
  function editRule(trigger) {
    var el = $('#bill-rule-dlg'), a = B.autopay;
    form.threshold = V.fmt.count(a.threshold); form.amount = V.fmt.count(a.amount); form.limit = a.limit ? V.fmt.count(a.limit) : ''; form.errs = {};
    el.innerHTML = '<div class="dlg-head"><h2 class="dlg-title" id="bill-rule-t">Edit autopay rule</h2><button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + V.icon('x') + '</button></div><div class="dlg-body" id="ap-rule-body">' +
      field('th', 'Top up when the balance falls below', 'threshold', 'Your bank notifies you before each automatic debit.') + field('am', 'Amount to add', 'amount', 'Up to ' + money(5000) + ' without a new approval.', [500, 1000, 2000]) + field('li', 'Monthly limit', 'limit', 'Autopay stops for the rest of the month after this.', null, true) +
      '<p class="dlg-why" id="ap-rule-note" hidden></p></div><div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-ap-save>Save rule</button></div>';
    V.initAll(el); V.dialog.open(el, { returnTo: trigger });
  }

  function onInput(e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-ap-key'); if (!k) return;
    form[k] = e.target.value; if (form.errs[k] && !validate()[k]) { form.errs[k] = null; var er = $('#' + e.target.id + '-e'); er.hidden = true; e.target.removeAttribute('aria-invalid'); }
    var root = e.target.closest('.form, .dlg-body');
    if (k === 'amount') $$('[data-ap-presets] [role="radio"]', root).forEach(function (r) { var on = +r.getAttribute('data-value') === num(form.amount); r.setAttribute('aria-checked', on); r.setAttribute('tabindex', on ? '0' : '-1'); });
    var sum = $('#ap-sum .notice-body'); if (sum) sum.textContent = summary();
    var note = $('#ap-rule-note'); if (note) { var big = num(form.amount) > 5000; note.hidden = !big; note.textContent = big ? 'You’ll approve the new amount in your UPI app.' : ''; }
    var th = $('#ap-th-h'); if (th && k === 'threshold' && num(form.threshold) && $('#ap-form')) th.textContent = B.runway(num(form.threshold)).replace(/^about/, 'About') + ' of calls. Your bank notifies you before each automatic debit, so money can take up to a day to arrive.';
    var am = $('#ap-am-h'); if (am && k === 'amount' && num(form.amount) && $('#ap-form')) am.textContent = 'Adds ' + B.runway(num(form.amount)) + ' of calls each time.';
  }
  function showErrs(root) {
    form.errs = validate();
    [['threshold', 'th'], ['amount', 'am'], ['limit', 'li']].forEach(function (p) { var i = $('#ap-' + p[1], root), e = $('#ap-' + p[1] + '-e', root), m = form.errs[p[0]]; if (!i) return; if (m) { e.innerHTML = V.icon('circle-alert', 'sm') + esc(m); e.hidden = false; i.setAttribute('aria-invalid', 'true'); } else { e.hidden = true; i.removeAttribute('aria-invalid'); } });
    var first = $('[aria-invalid="true"]', root); if (first) first.focus(); return !first;
  }

  d.addEventListener('DOMContentLoaded', function () {
    var panel = $('#bill-panel'), dlg = $('#bill-rule-dlg'), sheet = $('#bill-ap-sheet');
    [panel, dlg].forEach(function (root) {
      root.addEventListener('input', onInput);
      root.addEventListener('focusout', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-ap-key'); if (!k || !e.target.value.trim()) return; var m = validate()[k], er = $('#' + e.target.id + '-e'); form.errs[k] = m; if (m) { er.innerHTML = V.icon('circle-alert', 'sm') + esc(m); er.hidden = false; e.target.setAttribute('aria-invalid', 'true'); } else { var n = num(e.target.value); if (n != null) { e.target.value = V.fmt.count(n); form[k] = e.target.value; } } });
      root.addEventListener('vaani:change', function (e) { var g = e.target.closest('[data-ap-presets]'); if (!g) return; form.amount = String(e.detail.value); var i = $('#ap-am', root); if (i) { i.value = V.fmt.count(+e.detail.value); onInput({ target: i }); } });
    });
    panel.addEventListener('submit', function (e) { if (e.target.id !== 'ap-form') return; e.preventDefault(); var b = $('#ap-form [type="submit"]'); if (b.getAttribute('aria-disabled') === 'true') { V.announce(roReason()); return; } if (showErrs(panel)) openGate(false, b); });
    panel.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ap-edit],[data-ap-off],[data-ap-retry],[data-ap-renew],[data-ap-review]'); if (!t) return;
      if (t.getAttribute('aria-disabled') === 'true') { V.announce(roReason()); return; }
      if (t.hasAttribute('data-ap-edit')) editRule(t);
      else if (t.hasAttribute('data-ap-renew')) openGate(true, t);
      else if (t.hasAttribute('data-ap-review')) openGate(false, t);
      else if (t.hasAttribute('data-ap-off')) V.dialog.confirm({ title: 'Turn off autopay?', body: 'We’ll cancel the UPI mandate. Calls pause when your wallet reaches ₹0 unless you top up.', confirmLabel: 'Turn off autopay', tone: 'danger', returnTo: t }).then(function (ok) { if (!ok) return; B.autopay.state = 'off'; B.render(); V.toast.success('Autopay is off. We cancelled the UPI mandate.'); focusHead(); });
      else if (t.hasAttribute('data-ap-retry')) {
        if (t.getAttribute('aria-busy') === 'true') return; t.setAttribute('aria-busy', 'true'); t.innerHTML = V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Retrying…';
        setTimeout(function () {
          var a = B.autopay, had = lostFocus() || panel.contains(d.activeElement);
          a.state = 'on'; a.usedThisMonth = (a.usedThisMonth || 0) + a.amount; a.last = { date: V.fmt.date(V.fmt.now().toISOString()), amount: a.amount, ok: true };
          B.credit(a.amount, { kind: 'autopay', label: 'Autopay top-up', invoice: 'INV-2026-0927' });
          V.toast.success(money(a.amount) + ' added by autopay. Autopay is on again.');
          if (had && B.tab === 'autopay') focusHead();   /* the re-render replaced the Retry button (and its Notice) */
        }, 1400);
      }
    });
    dlg.addEventListener('click', function (e) {
      if (!e.target.closest('[data-ap-save]')) return;
      if (!showErrs(dlg)) return;
      var big = num(form.amount) > 5000; dlg.removeAttribute('data-dirty');
      V.dialog.close(dlg, 'confirm');
      if (big) { openGate(true, $('[data-ap-edit]')); return; }
      B.autopay.threshold = num(form.threshold); B.autopay.amount = num(form.amount); B.autopay.limit = form.limit.trim() ? num(form.limit) : null; B.render(); V.toast.success('Autopay rule saved.');
      /* the dialog returned focus to "Edit rule…", which the re-render replaced: move it to the new one */
      var eb = $('#bill-panel [data-ap-edit]'); if (eb) eb.focus(); else focusHead();
    });
    dlg.addEventListener('input', function () { dlg.setAttribute('data-dirty', 'true'); });
    sheet.addEventListener('click', function (e) {
      var s = e.target.closest('[data-sim]'); if (s && gate) { var k = s.getAttribute('data-sim'); if (k === 'approve') { approved(); return; } gate.step = k === 'decline' ? 'declined' : 'expired'; if (k === 'noanswer') { V.toast.info('Still waiting for the mandate approval. We’ll update Autopay when the bank confirms.'); return; } renderGate(); return; }
      if (e.target.closest('[data-ap-again]') && gate) { gate.step = 'waiting'; gate.left = 300; renderGate(); return; }
      if (e.target.closest('[data-upi-intent]')) { e.preventDefault(); V.toast.info('Your UPI app opens here in the product. Use the prototype buttons to simulate the result.'); return; }
      var sq = e.target.closest('[data-upi-showqr]'); if (sq) { var on = sq.getAttribute('aria-expanded') !== 'true'; sq.setAttribute('aria-expanded', on); $('#bill-ap-qrbox').hidden = !on; sq.textContent = on ? 'Hide QR code' : 'Show QR code'; }
    });
  });
})(window, document);
