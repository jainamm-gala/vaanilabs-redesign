/* Vaani Labs prototype · pages/billing-plans.js — Billing › Plans (03-pages/05 §2.10: Your rates with the billing unit,
   the meeting-minutes plan, PlanCards, the Plan change money gate) and Billing › Invoices (§2.11: Billed to with the
   Edit billing details dialog and GSTIN / PIN validation, financial-year select, Download all (ZIP), the framed invoices
   table with a named Download per row, the invoice sheet, empty and no-permission states). */
(function (w, d) {
  'use strict';
  var B = w.VaaniBilling, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var plans = B.data.plans.map(function (p) { var c = {}; for (var k in p) c[k] = p[k]; return c; });
  var invoices = B.data.invoices.map(function (x) { var c = {}; for (var k in x) c[k] = x[k]; return c; });
  var billedTo = {}; for (var k in B.data.billedTo) billedTo[k] = B.data.billedTo[k];
  if (new URLSearchParams(w.location.search).get('gstin') === 'none') billedTo.gstin = '';
  var inv = { fy: '2026', page: 1 }, target = null;
  function current() { return plans.filter(function (p) { return p.current; })[0]; }

  /* ---------- Plans ---------- */
  function planCard(p) {
    var cur = p.current;
    return '<section class="card bill-plan' + (cur ? ' bill-plan--current' : '') + '" aria-labelledby="bill-plan-' + p.id + '"><h3 class="type-title-16" id="bill-plan-' + p.id + '">' + esc(p.name) + '</h3>' +
      '<p class="type-body-14 u-fg-2 bill-plan-who">' + esc(p.who) + '</p><p class="bill-plan-price"><span class="type-num-20">' + esc(V.fmt.money(p.price, { whole: true })) + '</span><span class="bill-plan-per"> / month</span></p>' +
      '<p class="type-data-13 bill-plan-inc">' + esc(p.included) + '</p><ul class="bill-plan-pts">' + p.points.map(function (x) { return '<li>' + V.icon('check', 'xs', { className: 'bill-pt-ic' }) + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="bill-plan-act">' + (cur ? '<span class="tag tag--outline">Current plan</span>' : '<button class="btn" type="button" data-plan="' + p.id + '"' + (B.member || B.offline ? ' aria-disabled="true" data-tooltip="' + (B.offline ? 'You’re offline' : esc(B.adminAsk('change plans'))) + '"' : '') + '>Switch to ' + esc(p.name) + '…</button>') + '</div></section>';
  }
  B.tabs.plans = {
    html: function () {
      if (B.state === 'loading') return '<h2 class="sr-only">Plans</h2><div class="card" aria-busy="true"><span class="sk-line"><span class="sk sk--title bill-sk-w3"></span></span><span class="sk-line"><span class="sk bill-sk-w4"></span></span><span class="sk-line"><span class="sk bill-sk-w4"></span></span></div>';
      var c = current(), D = B.data, used = D.freeUsed, free = D.freeMin;
      /* one rates source (billing-data.js): the Meetings row is the current plan’s rate and allowance, so it always
         matches the plan card below it (R1A-12) */
      var rows = D.rates.map(function (r) { return r.id === 'meeting' ? { product: r.product, rate: c.meetRate, unit: 'Per second, after ' + c.allowance } : r; });
      return '<section class="bill-sec" aria-labelledby="bill-rates-t"><div class="bill-sec-head"><h2 class="section-title" id="bill-rates-t">Your rates</h2><span class="bill-sec-meta">Prepaid · charged from your wallet</span></div>' +
        '<div class="bill-frame"><div class="dt-wrap"><table class="dt dt--stack"><caption class="sr-only">Your rates by product</caption><thead><tr><th scope="col">Product</th><th scope="col" class="c-num">Rate</th><th scope="col" class="c-num">Per minute</th><th scope="col">Billing unit</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td class="c-key">' + esc(r.product) + '</td><td class="c-num" data-label="Rate">' + (r.rate ? esc(D.perSec(r.rate)) : '–') + '</td><td class="c-num" data-label="Per minute">' + (r.rate ? esc(D.perMin(r.rate)) : '–') + '</td><td data-label="Billing unit">' + esc(r.unit) + '</td></tr>'; }).join('') + '</tbody></table></div></div></section>' +
        '<section class="bill-sec" aria-labelledby="bill-mplan-t"><div class="bill-sec-head"><h2 class="section-title" id="bill-mplan-t">Meeting minutes plan</h2></div>' +
        '<div class="card bill-cur"><div class="bill-cur-head"><h3 class="type-title-14">' + esc(c.name) + '</h3><span class="tag tag--outline">Current plan</span></div>' +
        (c.id === 'payg' ? '<div class="pbar bill-cur-bar"><div class="pbar-row"><span class="pbar-label" id="bill-free-l">Free minutes this month</span><span class="pbar-value">' + used + ' of ' + free + ' used</span></div><div class="pbar-track" role="progressbar" aria-labelledby="bill-free-l" aria-valuemin="0" aria-valuemax="' + free + '" aria-valuenow="' + used + '" aria-valuetext="' + used + ' of ' + free + ' free minutes used"><span class="pbar-fill" style="--p: ' + (Math.round(used / free * 1000) / 1000) + '"></span></div></div>' : '<p class="type-data-13 u-fg-2">' + esc(c.included) + '</p>') +
        '<p class="type-meta-12 u-fg-3">Resets 1 Oct 2026</p></div>' +
        '<div class="bill-plans">' + plans.map(planCard).join('') + '</div>' +
        '<p class="bill-foot-note">Need higher volumes or a custom rate? <a href="#plans" data-talk-sales>Talk to sales</a></p></section>';
    }
  };

  /* Plan change sheet: a money gate. The wallet must cover the price; the primary names the money. */
  function openPlan(id, trigger) {
    var p = plans.filter(function (x) { return x.id === id; })[0], c = current(); if (!p) return; target = p;
    var down = p.price < c.price, covers = B.balance >= p.price, short = Math.ceil(p.price - B.balance);
    $('#bill-pl-t').textContent = 'Switch to ' + p.name;
    $('#bill-pl-sub').textContent = down ? c.name + ' stays active until 26 Oct.' : 'Nothing changes until you confirm.';
    var check = down ? '' : '<div class="gate-group">Must pass</div><ul class="gate-list"><li class="gate-row">' + (covers ? '<span class="gate-mark gate-mark--pass" data-mark>' + V.icon('check') + '</span><span class="gate-text"><span class="sr-only">Passed: </span>Your wallet covers ' + esc(V.fmt.money(p.price, { whole: true })) + '<span class="gate-meta">Wallet ' + esc(V.fmt.money(B.balance)) + '</span></span>' : '<span class="gate-mark gate-mark--block" data-mark>' + V.icon('x') + '</span><span class="gate-text"><span class="sr-only">Blocking: </span>Wallet is ' + esc(V.fmt.money(B.balance)) + '. Top up at least ' + esc(V.fmt.money(short, { whole: true })) + ' to switch.</span><a href="#topup" class="gate-act" data-plan-topup>Top up</a>') + '</li></ul>';
    $('#bill-pl-body').innerHTML = check + '<div class="gate-group">What happens</div>' + B.kv([['New plan', esc(p.name)], ['Price', esc(V.fmt.money(p.price, { whole: true })) + ' / month · includes GST'], ['Starts', down ? '26 Oct 2026' : 'Today, 27 Sep'], ['Charged', down ? 'Nothing today' : '<b class="u-semibold">' + esc(V.fmt.money(p.price, { whole: true })) + ' from your wallet today</b>'], ['Included', esc(p.perMonth)]], 'kv--rows') +
      (down ? '<p class="gate-note">' + esc(c.name) + ' stays active until 26 Oct. ' + esc(p.name) + ' starts then.</p>' : '<p class="gate-note">Your next ' + esc(p.name) + ' charge is on 27 Oct, from your wallet.</p>');
    var label = down ? 'Switch at the end of the period' : 'Pay ' + V.fmt.money(p.price, { whole: true }) + ' and switch';
    $('#bill-pl-foot').innerHTML = (!covers && !down ? '<span class="gate-reason u-fg-danger" id="bill-pl-why">Top up at least ' + esc(V.fmt.money(short, { whole: true })) + ' to switch.</span>' : '<span class="gate-reason">' + (down ? 'Nothing is charged today.' : 'Charged from your wallet as soon as you confirm.') + '</span>') +
      '<button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" data-plan-go aria-keyshortcuts="Control+Enter" data-tooltip="Confirm" data-kbd="mod+enter"' + (!covers && !down ? ' aria-disabled="true" aria-describedby="bill-pl-why"' : '') + '>' + esc(label) + '</button>';
    V.initAll($('#bill-plan-sheet'));
    V.drawer.open('bill-plan-sheet', { returnTo: trigger });
  }
  function confirmPlan() {
    var btn = $('[data-plan-go]'); if (!btn || !target) return;
    if (btn.getAttribute('aria-disabled') === 'true') { V.announce($('#bill-pl-why').textContent); return; }
    if (btn.getAttribute('aria-busy') === 'true') return;
    var p = target, c = current(), down = p.price < c.price;
    btn.setAttribute('aria-busy', 'true'); btn.innerHTML = V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Switching…';
    setTimeout(function () {
      V.drawer.close('bill-plan-sheet', 'confirm');
      if (!down) { plans.forEach(function (x) { x.current = x.id === p.id; }); B.debit(p.price, p.name + ' plan · Sep–Oct 2026'); V.toast.success('Switched to ' + p.name + '. ' + V.fmt.money(p.price, { whole: true }) + ' charged from your wallet.'); }
      else V.toast.success(p.name + ' starts on 26 Oct. ' + c.name + ' stays active until then.');
      B.render();
    }, 700);
  }
  B.debit = function (amount, label) {
    var nb = Math.round((B.balance - amount) * 100) / 100;
    B.ledger.unshift({ id: 'txn_plan' + Date.now(), at: V.fmt.now().toISOString(), kind: 'adjustment', label: label, amount: -amount, status: 'completed', ref: 'PL-260927', method: 'Wallet', balanceAfter: nb, fresh: true });
    B.balance = nb; B.renderMeta();
  };

  /* ---------- Invoices ---------- */
  function fyRows() { return inv.fy === '2026' ? invoices : []; }
  function invSheet(x) {
    var tx = B.ledger.filter(function (t) { return t.invoice === x.id; })[0];
    return B.sheetHead(x.id, V.fmt.date(x.at) + ' · ' + x.for, 'Invoices') + '<div class="sheet-body">' +
      B.kv([['Invoice', '<span class="id-text">' + esc(x.id) + '</span>'], ['Date', esc(V.fmt.date(x.at))], ['For', esc(x.for)], ['Taxable value', esc(V.fmt.money(x.taxable))], ['GST (18%)', esc(V.fmt.money(x.gst))], ['Total', '<b class="u-semibold">' + esc(V.fmt.money(x.total)) + '</b>'], ['Status', V.ui.statusTag('invoice', x.status)], ['Billed to', esc(billedTo.legal) + (billedTo.gstin ? ' · GSTIN <span class="id-text">' + esc(billedTo.gstin) + '</span>' : '')], ['Place of supply', esc(billedTo.state)]], 'kv--rows') +
      (tx ? '<p class="type-data-13"><a href="#wallet" data-inv-txn="' + esc(tx.id) + '">See the transaction in Wallet</a></p>' : '') + '</div><div class="sheet-foot sheet-foot--end"><button class="btn" type="button" data-inv-dl="' + esc(x.id) + '">' + V.icon('download') + 'Download PDF</button></div>';
  }
  B.tabs.invoices = {
    html: function () {
      if (B.member) return '<h2 class="sr-only">Invoices</h2><div class="card"><div class="empty empty--page">' + V.icon('lock', 'lg') + '<h3 class="empty-title">Only admins can see invoices.</h3><p>Ask ' + esc(B.adminName) + ' for access.</p></div></div>';
      if (B.state === 'loading') return '<h2 class="sr-only">Invoices</h2><div class="card" aria-busy="true"><span class="sk-line"><span class="sk sk--title bill-sk-w3"></span></span><span class="sk-line"><span class="sk bill-sk-w4"></span></span></div>';
      if (B.state === 'first-use') return '<h2 class="sr-only">Invoices</h2><div class="card"><div class="empty empty--page">' + V.icon('receipt', 'lg') + '<h3 class="empty-title">No invoices yet</h3><p>Invoices appear here after your first top-up.</p><div class="empty-actions"><button class="btn btn--primary" type="button" data-bill-topup="invoices_empty">' + V.icon('wallet') + 'Top up</button></div></div></div>';
      var list = fyRows(), size = 25, pages = Math.max(1, Math.ceil(list.length / size)); if (inv.page > pages) inv.page = pages;
      var slice = list.slice((inv.page - 1) * size, inv.page * size);
      var billed = '<section class="card bill-billed" aria-labelledby="bill-billed-t"><div class="card-head"><h2 class="card-title" id="bill-billed-t">Billed to</h2><button class="btn btn--sm" type="button" data-inv-edit' + (B.offline ? ' aria-disabled="true" data-tooltip="You’re offline"' : '') + '>Edit billing details…</button></div>' +
        B.kv([['Legal name', esc(billedTo.legal)], ['GSTIN', billedTo.gstin ? '<span class="id-text">' + esc(billedTo.gstin) + '</span>' : '<span class="kv-empty">Not added</span>'], ['State', esc(billedTo.state) + ' · place of supply'], ['Address', esc(billedTo.address)], billedTo.email ? ['Email for invoices', esc(billedTo.email)] : null]) +
        (billedTo.gstin ? '' : '<div class="notice notice--info" role="status">' + V.icon('info') + '<span class="notice-body">Add your GSTIN to claim input tax credit on your invoices.</span><span class="notice-acts"><button class="notice-act" type="button" data-inv-edit>Add GSTIN</button></span></div>') + '</section>';
      var tools = '<div class="bill-sec-head"><h2 class="section-title" id="bill-inv-t">Invoices</h2><div class="bill-sec-tools"><span class="sr-only" id="bill-fy-l">Financial year</span><button type="button" class="select select--sm select--auto" data-select aria-controls="bill-fy-lb" aria-labelledby="bill-fy-l bill-fy-v"><span class="select-value" id="bill-fy-v">FY ' + (inv.fy === '2026' ? '2026–27' : '2025–26') + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
        '<div class="listbox" id="bill-fy-lb" role="listbox" aria-labelledby="bill-fy-l" hidden><div class="option" role="option" data-value="2026" aria-selected="' + (inv.fy === '2026') + '"><span class="option-main"><span class="option-label">FY 2026–27</span><span class="option-desc">April 2026 to March 2027</span></span></div><div class="option" role="option" data-value="2025" aria-selected="' + (inv.fy === '2025') + '"><span class="option-main"><span class="option-label">FY 2025–26</span><span class="option-desc">April 2025 to March 2026</span></span></div></div>' +
        (list.length ? '<button class="btn btn--sm btn--tertiary" type="button" data-inv-zip aria-describedby="bill-zip-d">' + V.icon('download', 'sm') + 'Download all (ZIP)</button><span class="bill-sec-meta" id="bill-zip-d">' + list.length + ' PDF invoices for FY 2026–27</span>' : '') + '</div></div>';
      var table = list.length ? '<div class="bill-frame"><div class="dt-wrap"><table class="dt" id="bill-inv-table"><caption class="sr-only">Invoices for FY ' + (inv.fy === '2026' ? '2026–27' : '2025–26') + ', newest first</caption><thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col" class="bill-c-for">For</th><th scope="col" class="c-num bill-c-tax">Taxable value</th><th scope="col" class="c-num bill-c-tax">GST</th><th scope="col" class="c-num">Total</th><th scope="col">Status</th><th scope="col" class="c-act"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
        slice.map(function (x) { return '<tr data-id="' + esc(x.id) + '"><td class="c-key"><a href="#invoices" data-inv="' + esc(x.id) + '"><span class="id-text">' + esc(x.id) + '</span></a></td><td class="c-muted">' + esc(V.fmt.date(x.at)) + '</td><td class="bill-c-for">' + esc(x.for) + '</td><td class="c-num bill-c-tax">' + esc(V.fmt.money(x.taxable)) + '</td><td class="c-num bill-c-tax">' + esc(V.fmt.money(x.gst)) + '</td><td class="c-num">' + esc(V.fmt.money(x.total)) + '</td><td>' + V.ui.statusTag('invoice', x.status) + '</td>' +
          '<td class="c-act"><span class="bill-inv-acts"><button class="btn btn--sm btn--tertiary" type="button" data-inv-dl="' + esc(x.id) + '" aria-label="Download invoice ' + esc(x.id) + '">' + V.icon('download', 'sm') + '<span aria-hidden="true">Download</span></button><button class="ibtn ibtn--sm" type="button" data-inv-menu="' + esc(x.id) + '" aria-label="More actions for invoice ' + esc(x.id) + '" aria-haspopup="menu" aria-expanded="false">' + V.icon('ellipsis', 'sm') + '</button></span></td></tr>'; }).join('') +
        '</tbody></table></div><div class="pager"><span role="status">' + ((inv.page - 1) * size + 1) + '–' + Math.min(list.length, inv.page * size) + ' of ' + list.length + ' invoices</span><span class="pager-sp"></span><span>Page ' + inv.page + ' of ' + pages + '</span><span class="pager-btns"><button class="ibtn ibtn--sm" type="button" aria-label="Previous page"' + (inv.page <= 1 ? ' aria-disabled="true"' : '') + ' data-inv-page="-1">' + V.icon('chevron-left', 'sm') + '</button><button class="ibtn ibtn--sm" type="button" aria-label="Next page"' + (inv.page >= pages ? ' aria-disabled="true"' : '') + ' data-inv-page="1">' + V.icon('chevron-right', 'sm') + '</button></span></div></div>' +
        '<ul class="bill-rows" aria-label="Invoices">' + slice.map(function (x) { return '<li><a class="li bill-li" href="#invoices" data-inv="' + esc(x.id) + '"><span class="li-title"><span class="id-text">' + esc(x.id) + '</span></span><span class="bill-li-amt">' + esc(V.fmt.money(x.total)) + '</span><span class="li-meta">' + esc(V.fmt.date(x.at)) + ' · ' + esc(x.for) + ' · ' + esc(V.statusDef('invoice', x.status)[0]) + '</span></a></li>'; }).join('') + '</ul>'
        : '<div class="card"><p class="empty empty--compact">No invoices in FY 2025–26. This workspace started billing in April 2026.</p></div>';
      return billed + '<section class="bill-sec" aria-labelledby="bill-inv-t">' + tools + table + '</section>';
    },
    after: function (panel) {
      var fy = $('#bill-fy-v', panel); if (fy) B.onSelect(fy.parentNode, function (e) { inv.fy = e.detail.value; inv.page = 1; B.render(); });   /* focus returns to the rebuilt FY trigger (O §4) */
      var t = $('#bill-inv-table', panel); if (t) { $$('tbody tr', t).forEach(function (r, i) { r.setAttribute('tabindex', i ? '-1' : '0'); }); B.rove(t); }
    }
  };
  B.invoiceAdd = function (id, amount) { if (invoices.some(function (x) { return x.id === id; })) return; invoices.unshift({ id: id, at: V.fmt.now().toISOString(), for: 'Top-up', taxable: amount, gst: B.tax ? Math.round(amount * 18) / 100 : 0, total: B.tax ? Math.round(amount * 118) / 100 : amount, status: 'paid' }); };

  /* ---------- Edit billing details (Dialog md): GSTIN and PIN validate on blur ---------- */
  var STATES = ['Maharashtra (27)', 'Karnataka (29)', 'Gujarat (24)', 'Tamil Nadu (33)', 'Delhi (07)', 'Telangana (36)'];
  function editDetails(trigger) {
    var el = $('#bill-details-dlg'), pin = (billedTo.address.match(/\d{6}$/) || [''])[0], addr = billedTo.address.replace(/,?\s*Pune\s*\d{6}$/, '');
    el.innerHTML = '<div class="dlg-head"><h2 class="dlg-title" id="bill-dt-t">Billing details</h2><p class="dlg-desc" id="bill-dt-d">Changes apply to invoices issued from now on.</p><button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + V.icon('x') + '</button></div>' +
      '<div class="dlg-body"><div class="field"><label class="field-label" for="bd-legal">Legal name</label><div class="input"><input id="bd-legal" value="' + esc(billedTo.legal) + '" autocomplete="organization" aria-describedby="bd-legal-e"></div><p class="field-error" id="bd-legal-e" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="bd-gstin">GSTIN <span class="field-opt">(optional)</span></label><div class="input input--mono"><input id="bd-gstin" value="' + esc(billedTo.gstin) + '" maxlength="15" autocomplete="off" spellcheck="false" autocapitalize="characters" aria-describedby="bd-gstin-h bd-gstin-e"></div><p class="field-hint" id="bd-gstin-h">15 characters, on your GST registration certificate.</p><p class="field-error" id="bd-gstin-e" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="bd-addr">Address</label><div class="input"><input id="bd-addr" value="' + esc(addr) + '" autocomplete="street-address"></div></div>' +
      '<div class="l-pair"><div class="field"><label class="field-label" for="bd-city">City</label><div class="input"><input id="bd-city" value="Pune" autocomplete="address-level2"></div></div>' +
      '<div class="field"><span class="field-label" id="bd-state-l">State</span><button type="button" class="select" data-select aria-controls="bd-state-lb" aria-labelledby="bd-state-l bd-state-v"><span class="select-value" id="bd-state-v">' + esc(billedTo.state) + '</span>' + V.icon('chevron-down', 'sm') + '</button><div class="listbox" id="bd-state-lb" role="listbox" aria-labelledby="bd-state-l" hidden>' + STATES.map(function (s) { return '<div class="option" role="option" data-value="' + esc(s) + '" aria-selected="' + (s === billedTo.state) + '"><span class="option-main"><span class="option-label">' + esc(s) + '</span></span></div>'; }).join('') + '</div></div></div>' +
      '<div class="l-pair"><div class="field"><label class="field-label" for="bd-pin">PIN code</label><div class="input"><input id="bd-pin" value="' + esc(pin) + '" inputmode="numeric" maxlength="6" autocomplete="postal-code" aria-describedby="bd-pin-e"></div><p class="field-error" id="bd-pin-e" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="bd-email">Email for invoices <span class="field-opt">(optional)</span></label><div class="input"><input id="bd-email" type="email" value="' + esc(billedTo.email) + '" autocomplete="email"></div></div></div></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-bd-save>Save details</button></div>';
    V.initAll(el);
    V.dialog.open(el, { returnTo: trigger });
  }
  var CHECKS = { 'bd-gstin': function (v) { return !v || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.toUpperCase()) ? '' : 'Enter a 15-character GSTIN, like 27ABCDE1234F1Z5.'; }, 'bd-pin': function (v) { return /^[1-9]\d{5}$/.test(v) ? '' : 'Enter a 6-digit PIN code.'; }, 'bd-legal': function (v) { return v.trim() ? '' : 'Enter the legal name on your GST registration.'; } };
  function check(id) { var i = $('#' + id), e = $('#' + id + '-e'), msg = CHECKS[id](i.value.trim()); if (msg) { e.innerHTML = V.icon('circle-alert', 'sm') + esc(msg); e.hidden = false; i.setAttribute('aria-invalid', 'true'); } else { e.hidden = true; i.removeAttribute('aria-invalid'); } return !msg; }

  d.addEventListener('DOMContentLoaded', function () {
    var panel = $('#bill-panel');
    panel.addEventListener('click', function (e) {
      var p = e.target.closest('[data-plan]'); if (p) { if (p.getAttribute('aria-disabled') !== 'true') openPlan(p.getAttribute('data-plan'), p); return; }
      if (e.target.closest('[data-talk-sales]')) { e.preventDefault(); V.toast.info('Talk to sales opens a contact form in the product.'); return; }
      var i = e.target.closest('[data-inv]'); if (i) { e.preventDefault(); var x = invoices.filter(function (v) { return v.id === i.getAttribute('data-inv'); })[0]; if (x) { B.openRecord(invSheet(x), x.id, i.closest('tr') || i); var tr = i.closest('tr'); $$('#bill-inv-table tr[aria-current]').forEach(function (r) { r.removeAttribute('aria-current'); }); if (tr) tr.setAttribute('aria-current', 'true'); } return; }
      var dl = e.target.closest('[data-inv-dl]'); if (dl) { V.toast.info(dl.getAttribute('data-inv-dl') + ' downloads as a PDF in the product. This prototype has no files.'); return; }
      if (e.target.closest('[data-inv-zip]')) { V.toast.info('A ZIP of ' + invoices.length + ' PDF invoices downloads in the product.'); return; }
      var m = e.target.closest('[data-inv-menu]'); if (m) { B.invMenuFor = m.getAttribute('data-inv-menu'); if (m.getAttribute('aria-expanded') === 'true') V.menu.close(); else V.menu.open(m, 'bill-inv-menu'); return; }
      var ed = e.target.closest('[data-inv-edit]'); if (ed && ed.getAttribute('aria-disabled') !== 'true') { editDetails(ed); return; }
      var pg = e.target.closest('[data-inv-page]'); if (pg && pg.getAttribute('aria-disabled') !== 'true') { inv.page += +pg.getAttribute('data-inv-page'); B.render(); }
    });
    $('#bill-rec').addEventListener('click', function (e) {
      var dl = e.target.closest('[data-inv-dl]'); if (dl) { V.toast.info(dl.getAttribute('data-inv-dl') + ' downloads as a PDF in the product. This prototype has no files.'); return; }
      var tx = e.target.closest('[data-inv-txn]'); if (tx) { e.preventDefault(); V.drawer.close('bill-rec', 'navigate'); w.location.hash = '#wallet'; }
    });
    $('#bill-inv-menu').addEventListener('vaani:menuselect', function (e) { var id = B.invMenuFor; if (e.detail.value === 'copy') { try { navigator.clipboard.writeText(id); } catch (x) { /* blocked */ } V.toast.success('Copied ' + id + '.'); } else V.toast.info('Emailing ' + id + ' to ' + billedTo.email + ' is not wired in this prototype.'); });
    var sheet = $('#bill-plan-sheet');
    sheet.addEventListener('click', function (e) { if (e.target.closest('[data-plan-go]')) confirmPlan(); if (e.target.closest('[data-plan-topup]')) { e.preventDefault(); var ret = V.overlays.stack.filter(function (x) { return x.el === sheet; })[0]; var back = ret && ret.returnTo; V.drawer.close(sheet, 'navigate'); setTimeout(function () { B.topup.open('plan_change', back); }, 0); } });
    V.shortcuts.register('mod+enter', function () { confirmPlan(); }, { description: 'Confirm the plan change', group: 'Forms', inFields: true, when: function () { return V.drawer.isOpen('bill-plan-sheet'); } });
    var dlg = $('#bill-details-dlg');
    dlg.addEventListener('focusout', function (e) { if (CHECKS[e.target.id] && (e.target.value || e.target.id !== 'bd-gstin')) check(e.target.id); });
    dlg.addEventListener('input', function () { dlg.setAttribute('data-dirty', 'true'); });
    dlg.addEventListener('click', function (e) {
      if (!e.target.closest('[data-bd-save]')) return;
      var ok = ['bd-legal', 'bd-gstin', 'bd-pin'].map(check).every(Boolean); if (!ok) { var bad = $('[aria-invalid="true"]', dlg); if (bad) bad.focus(); return; }
      billedTo.legal = $('#bd-legal').value.trim(); billedTo.gstin = $('#bd-gstin').value.trim().toUpperCase(); billedTo.address = $('#bd-addr').value.trim() + ', ' + $('#bd-city').value.trim() + ' ' + $('#bd-pin').value.trim(); billedTo.state = $('#bd-state-v').textContent; billedTo.email = $('#bd-email').value.trim();
      dlg.removeAttribute('data-dirty'); V.dialog.close(dlg, 'confirm'); B.render(); V.toast.success('Billing details saved. They apply to invoices issued from now on.');
    });
  });
})(window, document);
