/* Home overlays · the Call gate for "Call yourself" (gate §5.1/§5.3), the Top-up sheet opened in place (03-pages/00 D9,
   05-knowledge-billing §2.7), Invite teammates (06-settings Members), the palette’s "Continue setup" row (03-pages/00 §8.3)
   and the prototype-only state switcher. Nothing dials, bills or invites before its confirming action. */
(function (w, d, V) {
  'use strict';
  var H = w.VaaniHome; if (!V || !H) return;
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, DATA = V.data, fmt = V.fmt, icon = V.icon;
  var qs = new URLSearchParams(w.location.search), RATE = DATA.meta.ratePerSec || 0.04;
  function spin(label) { return icon('loader-circle', null, { className: 'spinner' }) + esc(label); }
  function runway(bal) { return fmt.runway(bal, RATE) + ' of calls'; }

  /* ================= Call gate ("Call your phone") ================= */
  var gate = $('#home-call-gate'), gBody = $('#hcg-body'), gGo = $('#hcg-go'), gWhy = $('#hcg-why');
  function gateRow(kind, text, meta, act) {
    var K = { pass: ['pass', 'check', 'Passed'], block: ['block', 'x', 'Blocking'], warn: ['advisory-warn', 'triangle-alert', 'Warning'], note: ['advisory', 'info', 'Note'] }[kind];
    return '<li class="gate-row"><span class="gate-mark gate-mark--' + K[0] + '" data-mark>' + icon(K[1]) + '</span><span class="gate-text"><span class="sr-only">' + K[2] + ': </span>' + text +
      (meta ? '<span class="gate-meta">' + meta + '</span>' : '') + '</span>' + (act || '') + '</li>';
  }
  H.openCallGate = function (trigger) {
    var f = H.walletFacts(), st = f.state, blocked = st === 'empty' || f.balance <= 0, low = st === 'low' || st === 'autopay-failed';
    var rows = [], notes = [gateRow('note', 'Calls say they are recorded')];
    if (blocked) rows.push(gateRow('block', 'Wallet is ₹0. Top up to place calls.', null, '<button type="button" class="btn btn--link gate-act" data-gate-act="topup">Top up</button>'));
    rows.push(gateRow('pass', 'Rings your verified mobile ' + H.phone(DATA.user.phoneMasked), 'Change it in Settings › Profile'));
    rows.push(gateRow('pass', '<span translate="no">' + esc(DATA.flows[0].name) + '</span> v' + DATA.flows[0].live.version + ' is published'));
    rows.push(gateRow('pass', 'Inside calling hours', 'Open until 5 pm IST today'));
    if (!blocked && !low) rows.push(gateRow('pass', 'Wallet ' + fmt.money(f.balance) + ' · ' + esc(runway(f.balance))));
    if (low) notes.unshift(gateRow('warn', fmt.money(f.balance) + ' left · ' + esc(runway(f.balance)), null, '<a class="gate-act" href="#top-up" data-gate-act="topup">Top up</a>'));
    var things = notes.length, sum = blocked ? '<span class="gate-sum gate-sum--blocked">' + icon('x', 'sm') + 'Phone calls blocked · 1 thing to fix</span>'
      : '<span class="gate-sum gate-sum--ok">' + icon('check', 'sm') + 'Ready · ' + things + (things === 1 ? ' thing' : ' things') + ' to know</span>';
    var cost = fmt.callRange(1, 1, 2, RATE).split(' · ');
    gBody.innerHTML = '<div class="gate-group">Must pass' + sum + '</div><ul class="gate-list">' + rows.join('') + '</ul><div class="gate-group">Good to know</div><ul class="gate-list">' + notes.join('') + '</ul>' +
      '<div class="gate-cost"><span>' + esc(cost[0] + ' · ' + cost[1]) + '</span><b>' + esc(cost[2]) + '</b></div>';
    gGo.setAttribute('aria-disabled', blocked ? 'true' : 'false'); gGo.removeAttribute('aria-busy'); gGo.textContent = 'Place call';
    gWhy.textContent = blocked ? 'Wallet is ₹0. Top up to place calls.' : 'Your phone rings within a few seconds.';
    gWhy.className = 'gate-reason' + (blocked ? ' u-fg-danger' : '');
    V.initAll(gBody);
    V.popover.open(trigger, 'home-call-gate', { placement: 'bottom-start' });
  };
  function placeCall() {
    if (gGo.getAttribute('aria-disabled') === 'true') { V.announce(gWhy.textContent); return; }
    if (gGo.getAttribute('aria-busy') === 'true') return;
    gGo.setAttribute('aria-busy', 'true'); gGo.innerHTML = spin('Placing call…');
    setTimeout(function () {
      V.popover.close('home-call-gate');
      H.setStep('call', 'progress'); V.announce('Calling your phone.');
      setTimeout(function () { H.setStep('call', 'done', { proof: 'Connected · 1m 52s · Today ' + fmt.time(fmt.now().toISOString ? fmt.now().toISOString() : fmt.now()) }); }, 4200);
    }, 1100);
  }
  gGo.addEventListener('click', placeCall);
  gate.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); placeCall(); } });
  gate.addEventListener('click', function (e) { if (e.target.closest('[data-gate-close]')) { V.popover.close('home-call-gate'); return; } });   /* R2C-08: the gate header's Close (gate §1) */
  gate.addEventListener('click', function (e) { var t = e.target.closest('[data-gate-act="topup"]'); if (t) { e.preventDefault(); V.popover.close('home-call-gate'); setTimeout(function () { V.openTopUp('gate'); }, 0); } });

  /* ================= Top-up sheet (in place) ================= */
  var sheet = $('#home-topup'), tBody = $('#htu-body'), tFoot = $('#htu-foot'), tMeta = $('#htu-meta');
  var TU = { amount: 500, step: 1, timer: null, prev: null };
  function quote(a) { var gst = Math.round(a * 0.18 * 100) / 100; return { credit: a, gst: gst, pay: a + gst }; }
  function valid(a) { return a >= 100 && a <= 100000 && Math.round(a) === a; }
  function kv(k, v, id) { return '<div class="kv-row"><dt>' + k + '</dt><dd class="u-num"' + (id ? ' id="' + id + '"' : '') + '>' + v + '</dd></div>'; }
  function renderQuote() {
    var a = TU.amount, ok = valid(a), q = quote(ok ? a : 0), f = H.walletFacts(), nb = f.balance + (ok ? a : 0);
    $('#htu-credit').textContent = ok ? fmt.money(q.credit) : '–'; $('#htu-gst').textContent = ok ? fmt.money(q.gst) : '–';
    $('#htu-pay-v').textContent = ok ? fmt.money(q.pay) : '–'; $('#htu-new').textContent = ok ? fmt.money(nb) + ' · ' + runway(nb) : '–';
    $('#htu-runway').textContent = ok ? 'Adds ' + fmt.runway(a, RATE) + ' of phone calls at ₹' + RATE + '/s.' : 'Enter an amount to see how many minutes it adds.';
    var pay = $('#htu-pay'); if (pay) pay.textContent = ok ? 'Pay ' + fmt.money(q.pay, { whole: Math.round(q.pay) === q.pay }) + ' via UPI' : 'Pay via UPI';
    $$('#htu-presets [role="radio"]').forEach(function (r) { r.setAttribute('aria-checked', String(+r.getAttribute('data-value') === a)); });
  }
  function showError(on) {
    var e = $('#htu-amt-e'), inp = $('#htu-amt'); if (!e) return;
    e.hidden = !on; e.innerHTML = on ? icon('circle-alert') + 'Enter an amount from ₹100 to ₹1,00,000.' : '';
    if (on) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
  }
  function step1() {
    TU.step = 1; var f = H.walletFacts();
    tMeta.textContent = 'Balance ' + fmt.money(f.balance) + (f.balance > 0 ? ' · ' + runway(f.balance) : ' · calls paused');
    tBody.innerHTML = '<div class="field"><label class="field-label" for="htu-amt">Top-up amount</label>' +
      '<div class="seg" role="radiogroup" aria-label="Preset amounts" id="htu-presets">' + DATA.wallet.presets.map(function (p) { return '<button type="button" role="radio" aria-checked="' + (p === TU.amount) + '" data-value="' + p + '">₹' + fmt.count(p) + '</button>'; }).join('') + '</div>' +
      '<div class="input input--lg"><span class="input-prefix">₹</span><input id="htu-amt" type="text" inputmode="numeric" autocomplete="off" value="' + TU.amount + '" aria-describedby="htu-amt-h htu-amt-e"></div>' +
      '<p class="field-hint" id="htu-amt-h">Minimum ₹100 · maximum ₹1,00,000</p><p class="field-error" id="htu-amt-e" hidden></p></div>' +
      '<p class="type-body-14 u-fg-2" id="htu-runway" aria-live="polite"></p>' +
      '<dl class="kv kv--rows home-quote">' + kv('Wallet credit', '', 'htu-credit') + kv('GST (18%)', '', 'htu-gst') + kv('<b>You pay</b>', '', 'htu-pay-v') + kv('New balance', '', 'htu-new') + '</dl>' +
      '<p class="type-meta-12 u-fg-3">Pay with any UPI app. Money is added when your UPI app confirms.</p>';
    tFoot.innerHTML = (DATA.wallet.autopay.state === 'off' ? '<p class="type-meta-12 u-fg-3 home-foot-why">Autopay is off · <a href="billing.html#autopay">Set up autopay</a></p>' : '') +
      '<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" id="htu-pay"></button>';
    V.initAll(tBody); renderQuote();
  }
  function step2() {
    TU.step = 2; var q = quote(TU.amount), pay = fmt.money(q.pay);
    tBody.innerHTML = '<button type="button" class="btn btn--link home-back" data-tu="back">' + icon('chevron-left') + 'Change amount</button>' +
      '<h3 class="type-title-16" id="htu-pay-h" tabindex="-1" data-focus-target>Pay ' + pay + ' with any UPI app</h3>' +
      '<ol class="stages">' + ['Open any UPI app on your phone', 'Approve the request from Vaani Labs for ' + pay, 'Enter your UPI PIN'].map(function (t, i) { return '<li class="stage"><span class="smark smark--num" aria-hidden="true">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ol>' +
      '<p><span class="status status--md status--progress">' + icon('loader-circle', 'md', { className: 'spinner' }) + '<span>Waiting for payment · 04:32 left</span></span></p>' +
      '<div class="notice notice--neutral"><i data-icon="info"></i><span class="notice-body"><span class="notice-title">Prototype only.</span> The UPI QR code and collect request belong to Billing’s top-up sheet. <button type="button" class="btn btn--link" data-tu="confirm">Simulate UPI confirmation</button></span></div>';
    tFoot.innerHTML = '<p class="type-meta-12 u-fg-3 home-foot-why">Keep this open, or close it: we’ll add the money when UPI confirms.</p><button class="btn btn--tertiary" type="button" data-tu="cancel">Cancel payment</button>';
    V.initAll(tBody); $('#htu-pay-h').focus();
    if (H.s.mode === 'setup' && H.s.steps.money.state !== 'done') { TU.prev = H.s.steps.money.state; H.setStep('money', 'progress', { focus: 'money' }); $('#htu-pay-h').focus(); }
  }
  function confirmPayment() {
    clearTimeout(TU.timer); if (TU.step !== 2) return; TU.step = 0;
    var f = H.walletFacts(), nb = Math.round((f.balance + TU.amount) * 100) / 100;
    H._wallet = { state: 'healthy', balance: nb, runway: runway(nb) };
    var run = fmt.runway(nb, RATE);
    if (qs.has('wallet')) { qs.delete('wallet'); w.history.replaceState(null, '', w.location.pathname + (qs.toString() ? '?' + qs : '') + w.location.hash); }
    if (V.drawer.isOpen(sheet)) V.drawer.close(sheet, 'done');
    V.wallet.set({ balance: nb, state: 'healthy', runway: run });   /* Baseline, TopBar chip, BaselineChip and nav badge follow */
    var msg = fmt.money(TU.amount, { whole: true }) + ' added. Wallet ' + fmt.money(nb) + ' · ' + run + ' of calls.';
    if (H.s.mode === 'setup' && H.s.steps.money.state !== 'done') H.setStep('money', 'done', { proof: fmt.money(TU.amount, { whole: true }) + ' added · ' + fmt.runway(TU.amount, RATE) + ' of calls' });
    else H.render();
    if (H.s.mode === 'setup') H.focusStep(H.derive().current || 'money');
    V.toast.success(msg);
  }
  H.openTopUp = function () {
    if (V.drawer.isOpen(sheet)) return;
    TU.amount = 500; step1();
    V.drawer.open(sheet, { mode: 'modal', returnTo: d.activeElement, onClose: function () { if (TU.step === 2) TU.timer = setTimeout(confirmPayment, 6000); } });
  };
  V.topUp.register(function () { H.openTopUp(); });
  sheet.addEventListener('vaani:change', function (e) { if (e.target.id === 'htu-presets') { TU.amount = +e.detail.value; $('#htu-amt').value = TU.amount; showError(false); renderQuote(); } });
  sheet.addEventListener('input', function (e) { if (e.target.id === 'htu-amt') { TU.amount = +String(e.target.value).replace(/[^\d]/g, '') || 0; renderQuote(); if (valid(TU.amount)) showError(false); } });
  sheet.addEventListener('focusout', function (e) { if (e.target.id === 'htu-amt' && e.target.value) showError(!valid(TU.amount)); });
  sheet.addEventListener('keydown', function (e) { if (e.target.id === 'htu-amt' && e.key === 'Enter') { e.preventDefault(); $('#htu-pay').click(); } });
  sheet.addEventListener('click', function (e) {
    var t = e.target.closest('#htu-pay, [data-tu]'); if (!t) return;
    var a = t.id === 'htu-pay' ? 'pay' : t.getAttribute('data-tu');
    if (a === 'pay') { if (!valid(TU.amount)) { showError(true); $('#htu-amt').focus(); return; } t.setAttribute('aria-busy', 'true'); t.innerHTML = spin('Creating request…'); setTimeout(step2, 700); }
    else if (a === 'back') { step1(); $('#htu-amt').focus(); }
    else if (a === 'confirm') confirmPayment();
    else if (a === 'cancel') { TU.step = 0; V.drawer.close(sheet, 'cancel'); if (TU.prev) H.setStep('money', TU.prev, { focus: 'money' }); V.announce('Payment cancelled. Nothing was charged.'); }
  });

  /* ================= Invite teammates ================= */
  var inv = $('#home-invite'), ta = $('#hin-emails'), err = $('#hin-emails-e'), send = $('#hin-send');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function emails() { return ta.value.split(/[\s,;]+/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function label() { var n = emails().length; send.textContent = n > 1 ? 'Send ' + n + ' invites' : 'Send invite'; inv.setAttribute('data-dirty', n ? 'true' : 'false'); }
  function validate() {
    var list = emails(), bad = list.filter(function (x) { return !EMAIL.test(x); }), msg = '';
    if (!list.length) msg = 'Enter at least one email address.';
    else if (bad.length) msg = (bad.length === 1 ? 'Check this address: ' : 'Check these addresses: ') + bad.join(', ');
    else if (list.length > 20) msg = 'Up to 20 at a time. Remove ' + (list.length - 20) + '.';
    err.hidden = !msg; err.innerHTML = msg ? icon('circle-alert') + esc(msg) : '';
    if (msg) ta.setAttribute('aria-invalid', 'true'); else ta.removeAttribute('aria-invalid');
    return !msg;
  }
  H.openInvite = function (trigger) { ta.value = ''; err.hidden = true; ta.removeAttribute('aria-invalid'); label(); V.dialog.open(inv, { returnTo: trigger }); };
  function sendInvites() {
    if (send.getAttribute('aria-busy') === 'true') return;
    if (!validate()) { ta.focus(); return; }
    var n = emails().length; send.setAttribute('aria-busy', 'true'); send.innerHTML = spin('Sending…');
    setTimeout(function () {
      send.removeAttribute('aria-busy'); inv.setAttribute('data-dirty', 'false'); V.dialog.close(inv, 'done');
      H.s.invited += n; H.render(); V.toast.success(n + (n === 1 ? ' invite' : ' invites') + ' sent. They expire in 7 days.');
    }, 800);
  }
  ta.addEventListener('input', function () { label(); if (!err.hidden) validate(); });
  ta.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); sendInvites(); } });
  send.addEventListener('click', sendInvites);

  /* ================= Palette: during setup the first suggested action is the next setup step (§8.3) ================= */
  function runCurrent() {
    var m = H.derive(); if (!m.current) { H.focusStep('none'); return; }
    var li = $('#step-' + m.current), b = li && $('.setup-step-actions .btn--primary', li);
    if (!b) { H.focusStep(m.current); return; }
    li.scrollIntoView({ block: 'center' });
    if (b.tagName === 'A') { w.location.href = b.getAttribute('href'); return; }
    b.focus(); b.click();
  }
  if (H.s.mode === 'setup') V.commandPalette.register([{ id: 'continue-setup', group: 'actions', rank: 'top', icon: 'list-checks', keywords: ['setup', 'next step', 'continue', 'checklist', 'finish setup'],
    get title() { var m = H.derive(); return m.current ? 'Continue setup: ' + H.CAT[m.current].title + '…' : 'Continue setup'; },
    get meta() { return 'Home · ' + H.derive().done + ' of 5 done'; },
    perform: runCurrent }]);

  /* ================= Prototype states (not part of the design) ================= */
  var cur = { mode: H.s.mode, demo: H.s.demo, wallet: new URLSearchParams(w.location.search).get('wallet') || '' };
  var GROUPS = [
    ['Setup track', 'setup', [['', 'Setup · 4 of 5'], ['first-run', 'First run · 2 of 5, wallet ₹0', 'empty'], ['new', 'New workspace · 0 of 5', 'empty'], ['waiting', 'Waiting on others', 'pending'], ['failed', 'Failed steps'], ['member', 'Member · needs an admin'], ['complete', 'Just completed · 5 of 5']]],
    ['Page states', 'setup', [['loading', 'Loading'], ['error', 'Couldn’t load'], ['offline', 'Offline']]],
    ['After setup', 'done', [['', 'Overview'], ['regression', 'Regression · number unverified'], ['', 'Overview · wallet low', 'low'], ['', 'Overview · autopay failed', 'autopay-failed']]]
  ];
  $('#home-proto-groups').innerHTML = GROUPS.map(function (g, gi) {
    return '<div class="home-proto-group"><h3 class="type-label-12 u-fg-3" id="home-proto-g' + gi + '">' + g[0] + '</h3><ul class="home-proto-list" aria-labelledby="home-proto-g' + gi + '">' + g[2].map(function (s) {
      var on = cur.mode === g[1] && cur.demo === s[0] && cur.wallet === (s[2] || '');
      var href = 'index.html?setup=' + (g[1] === 'setup' ? 'incomplete' : 'done') + (s[0] ? '&demo=' + s[0] : '') + (s[2] ? '&wallet=' + s[2] : '');
      return '<li><a class="btn btn--sm' + (on ? ' home-proto-on' : '') + '" href="' + href + '"' + (on ? ' aria-current="page"' : '') + '>' + (on ? icon('check', 'sm') : '') + esc(s[1]) + '</a></li>';
    }).join('') + '</ul></div>';
  }).join('');
  V.initAll($('#home-proto'));
})(window, document, window.Vaani);
