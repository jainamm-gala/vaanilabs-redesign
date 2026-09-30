/* Vaani Labs prototype · pages/billing-wallet.js — Billing › Wallet (03-pages/05 §2.3, §2.5, §2.6): the balance card (value,
   runway with its rate, month spend; low StatusText, empty Notice), the Autopay summary card, and Transactions (date range,
   Kind filter, Export CSV, a framed ledger with balance-after and daily roll-ups; ListRows on phones), the transaction sheet. */
(function (w, d) {
  'use strict';
  var B = w.VaaniBilling, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var KINDS = [['topup', 'Top-up'], ['autopay', 'Autopay top-up'], ['calls', 'Call charges'], ['meeting', 'Meeting charges'], ['api', 'API charges'], ['refund', 'Refund'], ['adjustment', 'Adjustment']];
  var RANGES = [['month', 'This month'], ['last-month', 'Last month'], ['30d', 'Last 30 days'], ['fy', 'This financial year'], ['custom', 'Custom…']];
  var P = new URLSearchParams(w.location.search);
  var ui = { range: RANGES.some(function (r) { return r[0] === P.get('range'); }) ? P.get('range') : '30d', kinds: (P.get('f.kind') || '').split(',').filter(Boolean), page: 1, size: 25, from: '2026-09-01', to: '2026-09-27' };

  function inRange(x) {
    var day = x.at.slice(0, 10);
    if (ui.range === 'month') return day >= '2026-09-01';
    if (ui.range === 'last-month') return day >= '2026-08-01' && day <= '2026-08-31';
    if (ui.range === '30d') return day >= '2026-08-29';
    if (ui.range === 'custom') return day >= ui.from && day <= ui.to;
    return day >= '2026-04-01';
  }
  function rows() { return B.ledger.filter(function (x) { return inRange(x) && (!ui.kinds.length || ui.kinds.indexOf(x.kind) >= 0); }); }
  function rangeLabel() { if (ui.range === 'custom') return V.fmt.dateShort(ui.from + 'T12:00:00+05:30') + ' to ' + V.fmt.dateShort(ui.to + 'T12:00:00+05:30'); return RANGES.filter(function (r) { return r[0] === ui.range; })[0][1]; }
  /* payments carry their time; daily roll-ups carry only the day ("Today", "Yesterday", "25 Sep 2026") */
  function whenText(x) {
    var day = V.fmt.when(x.at).replace(/ \d{1,2}:\d{2}\s?[ap]m$/, '');
    if (/ago$/.test(day)) day = V.fmt.date(x.at);
    if (x.kind === 'topup' || x.kind === 'autopay' || x.kind === 'refund') return day + (/\d{4}$/.test(day) ? ', ' : ' ') + V.fmt.time(x.at);
    return day;
  }
  function desc(x) { return x.detail ? x.label + ' · ' + x.detail : x.label; }
  /* Status column (05 §2.6, P2): every row carries its payment StatusTag, "✓ Completed" included (05 §2.5 wireframe) */
  function statusCell(x) { return V.ui.statusTag('payment', x.status); }
  function amountCell(x) { var credit = x.amount > 0, live = x.status === 'completed' || x.status === 'refunded'; return '<span class="sr-only">' + (live ? (credit ? 'Credit ' : 'Debit ') : 'Not added ') + '</span><span' + (live ? '' : ' class="u-fg-3"') + ' aria-hidden="true">' + esc(B.signed(x.amount)) + '</span><span class="sr-only">' + esc(V.fmt.money(Math.abs(x.amount))) + '</span>'; }

  function balanceCard() {
    var bal = B.balance, st = B.state;
    if (st === 'loading') return '<section class="card bill-bal" aria-busy="true" aria-label="Wallet balance, loading"><span class="stat-label">Wallet balance</span><span class="sk-line bill-sk-num"><span class="sk sk--num bill-sk-w3"></span></span><span class="sk-line"><span class="sk bill-sk-w4"></span></span></section>';
    if (st === 'error') return '<section class="card bill-bal" aria-labelledby="bill-bal-l"><span class="stat-label" id="bill-bal-l">Wallet balance</span><p class="bill-bal-v type-num-28">–</p><div class="ierr" role="status"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t load your balance. <button class="btn btn--link" type="button" data-bill-retry>Retry</button></span></div></div></section>';
    var rw = B.runway(bal), words = 'Wallet balance ' + V.fmt.money(bal) + (bal > 0 ? ', ' + B.runwayWords(bal) + ' of phone calls' : ', phone calls are paused');
    var extra = '';
    if (bal <= 0) extra = '<div class="notice notice--warning notice--multi" role="status">' + V.icon('triangle-alert') + '<span class="notice-body"><span class="notice-title">Wallet is ₹0.</span> Phone calls are paused. Browser tests and free meeting minutes still work. <a href="#topup" data-bill-topup="empty_notice"' + (B.offline || B.member ? ' aria-disabled="true" data-tooltip="' + esc(B.offline ? 'You’re offline' : B.adminAsk('add money')) + '"' : '') + '>Top up</a></span></div>';
    else if (bal / B.rate < 3600) extra = '<p class="status status--md status--warning bill-low">' + V.icon('triangle-alert', 'md') + '<span>Low balance · ' + esc(rw) + ' of calls left. Calls pause at ₹0.</span></p>';
    return '<section class="card bill-bal" aria-labelledby="bill-bal-sr"><span class="sr-only" id="bill-bal-sr">' + esc(words) + '</span>' +
      '<div class="stat-label"><span aria-hidden="true">Wallet balance</span><button class="ibtn ibtn--sm bill-info" type="button" aria-label="About the wallet balance" data-tooltip="Prepaid. Calls, meetings and API use are charged from this balance.">' + V.icon('info', 'sm') + '</button></div>' +
      '<p class="bill-bal-v type-num-28" aria-hidden="true">' + esc(V.fmt.money(bal)) + '</p>' +
      (bal > 0 ? '<p class="bill-bal-r" aria-hidden="true">' + esc(rw.charAt(0).toUpperCase() + rw.slice(1)) + ' of phone calls at ' + B.data.perSec(B.rate) + (B.offline ? ' · as of 11:24&nbsp;am' : '') + '</p>' : '') + extra +
      '<p class="bill-bal-m">Spent ' + esc(V.fmt.money(B.monthSpend())) + ' this month · <a href="#usage">See usage</a></p></section>';
  }
  function autopayCard() {
    var a = B.autopay, s = a.state, body = '', act = '', dis = B.member ? ' aria-disabled="true" data-tooltip="' + esc(B.adminAsk('change autopay')) + '"' : B.offline ? ' aria-disabled="true" data-tooltip="You’re offline"' : '';
    if (B.state === 'loading') return '<section class="card bill-ap" aria-busy="true" aria-label="Autopay, loading"><span class="sk-line"><span class="sk sk--title bill-sk-w2"></span></span><span class="sk-line"><span class="sk bill-sk-w4"></span></span><span class="sk-line"><span class="sk bill-sk-w3"></span></span></section>';
    if (s === 'on') { body = 'When below ' + V.fmt.money(a.threshold, { whole: true }) + ', add ' + V.fmt.money(a.amount, { whole: true }) + ' · UPI <span translate="no">' + esc(a.vpa) + '</span>'; act = '<a class="btn" href="#autopay">Manage</a>'; }
    else if (s === 'paused') { body = 'Couldn’t top up on 24 Sep. The bank declined the debit.'; act = '<a class="btn" href="#autopay"' + dis + '>Fix autopay…</a>'; }
    else if (s === 'renewal') { body = 'Mandate ends 30 Sep. Renew it to keep automatic top-ups.'; act = '<a class="btn" href="#autopay"' + dis + '>Renew mandate…</a>'; }
    else if (s === 'waiting') { body = 'Approve the mandate in your UPI app. The request expires at 11:39&nbsp;am.'; act = '<a class="btn" href="#autopay">View</a>'; }
    else if (s === 'cancelled') { body = 'Autopay was cancelled from your UPI app on 22 Sep. Set it up again to resume automatic top-ups.'; act = '<a class="btn" href="#autopay"' + dis + '>Set up again…</a>'; }
    else { body = 'Top up automatically when your balance runs low, so calls never pause. You approve a UPI Autopay mandate once, in your UPI app.'; act = '<a class="btn" href="#autopay"' + dis + '>Set up autopay…</a>'; }
    return '<section class="card bill-ap" aria-labelledby="bill-apc-t"><div class="card-head"><h2 class="card-title" id="bill-apc-t">Autopay</h2>' + B.autopayTag() + '</div><p class="card-body bill-ap-body">' + body + '</p><div class="bill-ap-act">' + act + '</div></section>';
  }

  function ledgerTable(list, slice) {
    return '<div class="bill-frame"><div class="dt-wrap"><table class="dt" id="bill-ledger"><caption class="sr-only">Transactions, ' + esc(rangeLabel().toLowerCase()) + ', newest first</caption><thead><tr>' +
      '<th scope="col" aria-sort="descending" class="bill-c-when">When</th><th scope="col" class="bill-c-desc">Description</th><th scope="col" class="c-num">Amount</th><th scope="col" class="c-num bill-c-bal">Balance after</th><th scope="col" class="bill-c-status">Status</th><th scope="col" class="bill-c-ref">Reference</th><th scope="col" class="bill-c-method">Method</th></tr></thead><tbody>' +
      slice.map(function (x) {
        return '<tr data-id="' + esc(x.id) + '"' + (x.fresh ? ' class="bill-fresh"' : '') + '><td class="c-muted bill-c-when"><time datetime="' + esc(x.at) + '">' + esc(whenText(x)) + '</time></td>' +
          /* Description (P1 key): one line, ellipsis; the full text in the Tooltip (shown only when cut) and the sheet (N §7.3) */
          '<td class="c-key bill-c-desc"><a class="bill-desc" href="#wallet" data-txn="' + esc(x.id) + '" data-tooltip-overflow>' + esc(x.label) + (x.detail ? '<span class="c-muted"> · ' + esc(x.detail) + '</span>' : '') + '</a></td>' +
          '<td class="c-num bill-amt">' + amountCell(x) + '</td><td class="c-num bill-c-bal">' + esc(V.fmt.money(x.balanceAfter)) + '</td><td class="bill-c-status">' + statusCell(x) + '</td>' +
          '<td class="bill-c-ref"><span class="id-text">' + esc(x.ref) + '</span></td><td class="c-muted bill-c-method" translate="no">' + esc(x.method || 'Wallet') + '</td></tr>';
      }).join('') + '</tbody></table></div>' + pager(list) + '</div>' +
      '<ul class="bill-rows" aria-label="Transactions">' + slice.map(function (x) {
        return '<li><a class="li bill-li" href="#wallet" data-txn="' + esc(x.id) + '"><span class="li-title">' + esc(desc(x)) + '</span><span class="bill-li-amt">' + amountCell(x) + '</span><span class="li-meta">' + esc(V.fmt.when(x.at)) + ' · ' + esc(V.statusDef('payment', x.status)[0]) + ' · ' + esc(V.fmt.money(x.balanceAfter)) + '</span></a></li>';
      }).join('') + '</ul>' + phonePager(list);
  }
  function phonePager(list) {
    var pages = Math.max(1, Math.ceil(list.length / ui.size)), from = list.length ? (ui.page - 1) * ui.size + 1 : 0, to = Math.min(list.length, ui.page * ui.size);
    return '<div class="pager bill-pager-phone"><span>' + from + '–' + to + ' of ' + list.length + '</span><span class="pager-sp"></span><span class="pager-btns"><button class="ibtn" type="button" data-bill-page="-1" aria-label="Previous page"' + (ui.page <= 1 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-left') + '</button><button class="ibtn" type="button" data-bill-page="1" aria-label="Next page"' + (ui.page >= pages ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-right') + '</button></span></div>';
  }
  function pager(list) {
    var pages = Math.max(1, Math.ceil(list.length / ui.size)), from = list.length ? (ui.page - 1) * ui.size + 1 : 0, to = Math.min(list.length, ui.page * ui.size);
    return '<div class="pager bill-pager"><span role="status">' + from + '–' + to + ' of ' + list.length + ' transactions</span><span class="pager-sp"></span>' +
      '<span class="bill-pager-size u-hide-phone"><span id="bill-size-l">Rows per page</span><button type="button" class="select select--sm select--auto" data-select aria-controls="bill-size-lb" aria-labelledby="bill-size-l bill-size-v"><span class="select-value" id="bill-size-v">' + ui.size + '</span>' + V.icon('chevron-down', 'sm') + '</button><div class="listbox" id="bill-size-lb" role="listbox" aria-labelledby="bill-size-l" hidden>' + [25, 50, 100].map(function (n) { return '<div class="option" role="option" data-value="' + n + '" aria-selected="' + (n === ui.size) + '"><span class="option-main"><span class="option-label">' + n + '</span></span></div>'; }).join('') + '</div></span>' +
      '<span>Page ' + ui.page + ' of ' + pages + '</span><span class="pager-btns"><button class="ibtn ibtn--sm" type="button" data-bill-page="-1" aria-label="Previous page"' + (ui.page <= 1 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-left', 'sm') + '</button><button class="ibtn ibtn--sm" type="button" data-bill-page="1" aria-label="Next page"' + (ui.page >= pages ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-right', 'sm') + '</button></span></div>';
  }
  function transactions() {
    var head = '<div class="bill-sec-head"><h2 class="section-title" id="bill-txn-t">Transactions</h2>';
    if (B.state === 'loading') return '<section class="bill-sec" aria-labelledby="bill-txn-t" aria-busy="true">' + head + '</div><div class="bill-frame"><div class="dt-wrap"><table class="dt" aria-label="Transactions, loading"><thead><tr><th scope="col">When</th><th scope="col">Description</th><th scope="col" class="c-num">Amount</th><th scope="col" class="c-num">Balance after</th></tr></thead><tbody>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<tr aria-hidden="true"><td><span class="sk-line"><span class="sk bill-sk-w2"></span></span></td><td><span class="sk-line"><span class="sk bill-sk-w' + (3 + i % 2) + '"></span></span></td><td class="c-num"><span class="sk-line bill-sk-end"><span class="sk bill-sk-w1"></span></span></td><td class="c-num"><span class="sk-line bill-sk-end"><span class="sk bill-sk-w1"></span></span></td></tr>'; }).join('') + '</tbody></table></div><div class="pager"><span>Loading…</span></div></div></section>';
    if (B.state === 'error') return '<section class="bill-sec" aria-labelledby="bill-txn-t">' + head + '</div><div class="notice notice--danger" role="alert">' + V.icon('circle-alert') + '<span class="notice-body">Couldn’t load transactions. Check your connection and try again.</span><span class="notice-acts"><button type="button" class="notice-act" data-bill-retry>Retry</button></span></div></section>';
    if (!B.ledger.length) return '<section class="bill-sec" aria-labelledby="bill-txn-t">' + head + '</div><div class="card"><div class="empty">' + V.icon('receipt', 'lg') + '<h3 class="empty-title">No transactions yet</h3><p>Top-ups and charges appear here with the balance after each one.</p></div></div></section>';
    var list = rows(), pages = Math.max(1, Math.ceil(list.length / ui.size)); if (ui.page > pages) ui.page = pages;
    var slice = list.slice((ui.page - 1) * ui.size, ui.page * ui.size), nk = ui.kinds.length;
    head += '<span class="bill-sec-meta">' + esc(rangeLabel()) + ' · ' + list.length + (list.length === 1 ? ' transaction' : ' transactions') + '</span><div class="bill-sec-tools">' +
      '<span class="sr-only" id="bill-range-l">Date range</span><button type="button" class="select select--sm select--auto bill-range" data-select aria-controls="bill-range-lb" aria-labelledby="bill-range-l bill-range-v">' + V.icon('calendar', 'sm') + '<span class="select-value" id="bill-range-v">' + esc(rangeLabel()) + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="bill-range-lb" role="listbox" aria-labelledby="bill-range-l" hidden>' + RANGES.map(function (r) { return '<div class="option" role="option" data-value="' + r[0] + '" aria-selected="' + (r[0] === ui.range) + '"><span class="option-main"><span class="option-label">' + r[1] + '</span></span>' + V.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div>' +
      '<button class="btn btn--sm" type="button" data-popover="bill-kind-pop" aria-haspopup="dialog" aria-expanded="false" id="bill-kind-btn">' + V.icon('list-filter', 'sm') + 'Filter' + (nk ? '<span class="fcount" aria-label="' + nk + ' active">' + nk + '</span>' : '') + '</button>' +
      '<button class="btn btn--sm btn--tertiary u-hide-phone" type="button" data-bill-export>' + V.icon('download', 'sm') + 'Export CSV</button></div></div>';
    return '<section class="bill-sec" aria-labelledby="bill-txn-t">' + head + (list.length ? ledgerTable(list, slice) : '<div class="card"><div class="empty">' + V.icon('list-filter', 'lg') + '<h3 class="empty-title">No transactions match these filters.</h3><p>' + (B.ledger.length - list.length) + ' transactions are hidden by the date range or filters.</p><div class="empty-actions"><button class="btn" type="button" data-bill-clearf>Clear filters</button></div></div></div>') + '</section>';
  }

  /* ---------- transaction sheet ---------- */
  function txnSheet(x) {
    var meta = V.fmt.whenAbs(x.at), body = '';
    if (x.kind === 'topup' || x.kind === 'autopay') {
      var tax = B.tax ? (x.tax || 0) : 0;
      body = (x.status === 'failed' ? '<div class="notice notice--danger" role="status">' + V.icon('circle-x') + '<span class="notice-body"><span class="notice-title">' + (x.kind === 'autopay' ? 'Autopay couldn’t top up.' : 'UPI payment didn’t complete.') + '</span> ' + esc(x.reason || 'You were not charged.') + '</span></div>' : x.status === 'pending' ? '<div class="notice notice--info" role="status">' + V.icon('clock') + '<span class="notice-body"><span class="notice-title">Payment pending.</span> Your wallet updates when UPI confirms.</span></div>' : '') +
        B.kv([['Wallet credit', esc(V.fmt.money(x.amount))], tax ? ['Tax (GST 18%)', esc(V.fmt.money(tax))] : null, ['Total charged', x.status === 'completed' ? '<b class="u-semibold">' + esc(V.fmt.money(x.amount + tax)) + '</b>' : '<span class="kv-empty">Nothing charged</span>'],
          ['Method', '<span translate="no">' + esc(x.method) + '</span>'], x.utr ? ['UPI reference', '<span class="id-text">' + esc(x.utr) + '</span><button class="ibtn ibtn--sm" type="button" data-bill-copy="' + esc(x.utr) + '" aria-label="Copy UPI reference">' + V.icon('copy', 'sm') + '</button>'] : null,
          ['Status', V.ui.statusTag('payment', x.status)], ['Started', esc(V.fmt.whenAbs(x.at))], x.confirmedAt ? ['Confirmed', esc(V.fmt.whenAbs(x.confirmedAt))] : null,
          x.invoice ? ['Invoice', '<span class="id-text">' + esc(x.invoice) + '</span> · <button class="btn btn--link" type="button" data-bill-pdf="' + esc(x.invoice) + '">Download PDF</button>'] : null, ['Reference', '<span class="id-text">' + esc(x.ref) + '</span>']], 'kv--rows');
    } else if (x.kind === 'refund') {
      body = B.kv([['Credited', esc(V.fmt.money(x.amount))], ['Why', 'Calls that dropped because of a network fault are refunded'], ['Status', V.ui.statusTag('payment', 'refunded')], ['Reference', '<span class="id-text">' + esc(x.ref) + '</span>']], 'kv--rows');
    } else {
      var R = B.data.rate, ps = B.data.perSec;   /* the one rates source (billing-data.js, R1A-12) */
      var prod = x.kind === 'calls' ? ['Phone calls (voice agent)', V.fmt.count(x.calls) + ' calls · ' + B.data.fmtDur(x.sec), ps(R.call)] : x.kind === 'meeting' ? ['Meeting agent', x.detail, ps(R.agent)] : ['API text voice', B.data.fmtDur(x.sec), ps(R.api)];
      var day = x.at.slice(0, 10);
      /* the sheet carries everything the truncated ledger Description can cut, the batch included (N §7.3) */
      body = '<p class="type-body-14 u-fg-2">Charges are added up once a day, so hundreds of calls don’t bury your top-ups.</p>' +
        B.kv([['Product', esc(prod[0])], ['Used', esc(prod[1])], x.batch ? ['Includes', 'Batch <span translate="no">‘' + esc(x.batch) + '’</span>'] : null, ['Rate', esc(prod[2])], ['Charged', '<b class="u-semibold">' + esc(V.fmt.money(-x.amount)) + '</b>'], ['Balance after', esc(V.fmt.money(x.balanceAfter))], ['Reference', '<span class="id-text">' + esc(x.ref) + '</span>']], 'kv--rows') +
        (x.kind === 'calls' ? '<a class="btn" href="call-reports.html?range=' + day + '&amp;columns=%2Bcost">' + V.icon('file-text') + 'Open these calls in Call reports</a>' : '');
    }
    return B.sheetHead(x.label, meta, 'Wallet') + '<div class="sheet-body">' + body + '</div>';
  }

  /* ---------- CSV export: exactly the rows in view ---------- */
  function exportCsv() {
    var list = rows(), q = function (s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; };
    var csv = ['When,Description,Amount (INR),Balance after (INR),Status,Reference'].concat(list.map(function (x) { return [q(x.at), q(desc(x)), x.amount.toFixed(2), x.balanceAfter.toFixed(2), q(V.statusDef('payment', x.status)[0]), q(x.ref)].join(','); })).join('\n');
    try { var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'vaani-transactions-' + ui.range + '.csv'; d.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* blocked */ }
    V.toast.success('Exported ' + list.length + ' transactions as CSV.');
  }
  /* The Kind filter body is built once, before the popover can open (V.popover.open picks the first body control to focus
     before it fires vaani:open), and later refreshes only sync the checked states in place, so the focused checkbox
     (overlay §1.3: first control in reading order, "Top-up") is never replaced under the keyboard user. */
  function kindCount() { var n = rows().length; $('#bill-kind-apply').textContent = 'Show ' + n + (n === 1 ? ' transaction' : ' transactions'); }
  function kindBody() {
    var body = $('#bill-kind-body'), cbs = $$('input.cb', body);
    if (!cbs.length) body.innerHTML = '<fieldset class="fieldset"><legend>Kind</legend>' + KINDS.map(function (k) { return '<label class="check check--dense"><input type="checkbox" class="cb" value="' + k[0] + '"' + (ui.kinds.indexOf(k[0]) >= 0 ? ' checked' : '') + '><span class="check-text">' + k[1] + '</span></label>'; }).join('') + '</fieldset>';
    else cbs.forEach(function (cb) { cb.checked = ui.kinds.indexOf(cb.value) >= 0; });
    kindCount();
  }
  function syncUrl() { var p = new URLSearchParams(w.location.search); if (ui.range !== '30d') p.set('range', ui.range); else p.delete('range'); if (ui.kinds.length) p.set('f.kind', ui.kinds.join(',')); else p.delete('f.kind'); try { w.history.replaceState(null, '', w.location.pathname + (p.toString() ? '?' + p.toString().replace(/%2C/g, ',') : '') + w.location.hash); } catch (e) { /* file:// */ } }
  function rerender(focusSel) { B.render(); if (focusSel) { var f = $(focusSel); if (f) f.focus(); } }

  B.tabs.wallet = {
    html: function () { return B.pageNotice() + '<div class="bill-top">' + balanceCard() + autopayCard() + '</div>' + transactions(); },
    after: function (panel) {
      var t = $('#bill-ledger', panel); if (t) { $$('tbody tr', t).forEach(function (r, i) { r.setAttribute('tabindex', i ? '-1' : '0'); }); B.rove(t); }
      /* B.onSelect returns focus to the rebuilt trigger once the listbox closes (O §4) */
      var rv = $('#bill-range-v', panel); if (rv) B.onSelect(rv.parentNode, function (e) { if (e.detail.value === 'custom') { setTimeout(function () { V.popover.open(rv.parentNode, 'bill-custom-pop', { placement: 'bottom-start' }); }, 0); return; } ui.range = e.detail.value; ui.page = 1; syncUrl(); rerender(); });
      var sv = $('#bill-size-v', panel); if (sv) B.onSelect(sv.parentNode, function (e) { ui.size = +e.detail.value; ui.page = 1; rerender(); });
    }
  };
  B.walletUi = ui;

  d.addEventListener('DOMContentLoaded', function () {
    var panel = $('#bill-panel');
    panel.addEventListener('click', function (e) {
      var tx = e.target.closest('[data-txn]'); if (tx) { e.preventDefault(); var x = B.ledger.filter(function (r) { return r.id === tx.getAttribute('data-txn'); })[0]; if (x) { var tr = tx.closest('tr'); B.openRecord(txnSheet(x), x.label, tr || tx); $$('#bill-ledger tr[aria-current]').forEach(function (r) { r.removeAttribute('aria-current'); }); if (tr) tr.setAttribute('aria-current', 'true'); } return; }
      var pg = e.target.closest('[data-bill-page]'); if (pg && pg.getAttribute('aria-disabled') !== 'true') { ui.page += +pg.getAttribute('data-bill-page'); rerender('[data-bill-page="' + pg.getAttribute('data-bill-page') + '"]'); return; }
      if (e.target.closest('[data-bill-export]')) { exportCsv(); return; }
      if (e.target.closest('[data-bill-clearf]')) { ui.kinds = []; ui.range = '30d'; syncUrl(); rerender('#bill-kind-btn'); }
    });
    $('#bill-rec').addEventListener('click', function (e) {
      var c = e.target.closest('[data-bill-copy]'); if (c) { try { navigator.clipboard.writeText(c.getAttribute('data-bill-copy')); } catch (x) { /* blocked */ } V.toast.success('UPI reference copied.'); return; }
      var pdf = e.target.closest('[data-bill-pdf]'); if (pdf) V.toast.info(pdf.getAttribute('data-bill-pdf') + ' downloads as a PDF in the product. This prototype has no files.');
    });
    kindBody();
    $('#bill-kind-pop').addEventListener('vaani:open', kindBody);
    $('#bill-kind-body').addEventListener('change', function () { ui.kinds = $$('#bill-kind-body input:checked').map(function (x) { return x.value; }); ui.page = 1; syncUrl(); kindCount(); });
    $('#bill-kind-clear').addEventListener('click', function () { ui.kinds = []; syncUrl(); kindBody(); });
    V.on('overlayclose', function (e) { if (e && e.el && e.el.id === 'bill-kind-pop' && B.tab === 'wallet') setTimeout(function () { rerender('#bill-kind-btn'); }, 0); });
    /* "Custom…" dismissed without Apply: the Select already reads "Custom…", so put back the range that is still applied
       (in place, so the trigger that just got focus back is not replaced) */
    V.on('overlayclose', function (e) {
      if (!e || !e.el || e.el.id !== 'bill-custom-pop' || B.tab !== 'wallet') return;
      var v = $('#bill-range-v'); if (!v || v.textContent === rangeLabel()) return;
      v.textContent = rangeLabel(); v.parentNode.setAttribute('data-value', ui.range);
      $$('#bill-range-lb [role="option"]').forEach(function (o) { o.setAttribute('aria-selected', String(o.getAttribute('data-value') === ui.range)); });
    });
    $('#bill-custom-apply').addEventListener('click', function () {
      var f = $('#bill-from').value, t = $('#bill-to').value, err = $('#bill-custom-e');
      if (!f || !t || f > t) { err.innerHTML = V.icon('circle-alert', 'sm') + 'Choose a start date on or before the end date.'; err.hidden = false; return; }
      err.hidden = true; ui.range = 'custom'; ui.from = f; ui.to = t; ui.page = 1; V.popover.close('bill-custom-pop'); syncUrl(); rerender('.bill-range');
    });
  });
})(window, document);
