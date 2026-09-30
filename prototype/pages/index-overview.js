/* Home after setup (index.html?setup=done) · 03-pages/00 §13.5 and open question 6.
   Once all five checks pass, Home leaves the nav and stays reachable from Help › Setup checklist and ⌘K. The spec keeps the
   five checks here with their current state (a regression shows amber). Answering open question 6 in the direction’s terms,
   the page also carries computed facts only: what needs you next, today’s calls, and the wallet. Nothing here is decorative. */
(function (w, d, V) {
  'use strict';
  if (!V) return;
  var U = V.util, $ = U.$, esc = U.esc, DATA = V.data, fmt = V.fmt, icon = V.icon;
  var H = w.VaaniHome = w.VaaniHome || {};
  var FLOW = DATA.flows[0], W = DATA.wallet;

  /* ---------- wallet facts (the ?wallet= state, or a balance a top-up on this page just added) ---------- */
  H.walletFacts = function () {
    if (H._wallet) return H._wallet;
    var st = V.walletState(), s = W.states[st] || W.states.healthy;
    return { state: st, balance: s.balance, runway: s.runway };
  };
  function runwayText(f) { return f.runway ? f.runway.replace(/ of calls$/, '') + ' of calls' : null; }
  function row(k, v) { return '<div class="kv-row"><dt>' + k + '</dt><dd>' + v + '</dd></div>'; }
  function status(tone, ic, text) { return '<span class="status status--md status--' + tone + '">' + icon(ic, 'md') + '<span>' + text + '</span></span>'; }
  function today() { return DATA.usage[DATA.usage.length - 1]; }

  H.walletCard = function () {
    var f = H.walletFacts(), st = f.state, u = today();
    var note = {
      low: status('warning', 'triangle-alert', 'Wallet is low. ' + esc((runwayText(f) || '').replace(/^about/, 'About')) + ' left.'),
      empty: status('warning', 'triangle-alert', 'Phone calls are paused. Browser tests and free meeting minutes still work.'),
      pending: status('progress', 'clock', 'Payment pending · updates when UPI confirms'),
      'autopay-failed': status('danger', 'circle-x', 'Autopay couldn’t top up. Calls pause at ₹0.')
    }[st];
    var last = DATA.transactions.filter(function (t) { return t.kind === 'topup' && t.status === 'completed'; })[0];
    var fix = st === 'autopay-failed' ? '<a class="btn btn--link" href="billing.html#autopay">Fix autopay</a>' : W.autopay.state === 'off' ? '<a class="btn btn--link" href="billing.html#autopay">Turn on autopay</a>' : '';
    return '<section class="card" aria-labelledby="home-wal-h"><div class="card-head"><h2 class="card-title" id="home-wal-h">Wallet</h2><a class="type-label-13" href="billing.html">Billing</a></div>' +
      '<div class="stat"><span class="stat-value u-num">' + fmt.money(f.balance) + '</span><span class="stat-scope">' + (runwayText(f) ? esc(runwayText(f)) + ' at ₹0.04/s' : st === 'empty' ? 'Calls paused' : 'Runway updates when the payment arrives') + '</span></div>' +
      (note ? '<p class="u-mt-8">' + note + '</p>' : '') +
      '<dl class="kv u-mt-8">' + row('Spent today', '<span class="u-num">' + fmt.money(u.spend) + '</span><span class="u-fg-3">· ' + u.calls + ' calls</span>') +
      row('Autopay', V.ui.statusTag('autopay', W.autopay.state)) +
      (last ? row('Last top-up', '<span class="u-num">' + fmt.money(last.amount, { whole: true }) + '</span><span class="u-fg-3">· ' + esc(fmt.when(last.at)) + '</span>') : '') + '</dl>' +
      '<div class="l-cluster l-cluster--md u-mt-16"><button type="button" class="btn" data-home-act="topup" aria-haspopup="dialog">' + icon('wallet') + 'Top up…</button>' + fix + '</div></section>';
  };

  /* ---------- what needs you next: computed from the same workspace state as the nav badges (never 0, never passive) ---------- */
  function nextHtml(reg) {
    var S = DATA.state, items = [];
    if (reg) items.push({ warn: true, ic: 'triangle-alert', title: 'Verify your calling number again', meta: 'Calls are paused until it’s verified', href: 'settings.html#phone/caller-id', end: 'Verify' });
    if (S.callbacksDueToday) items.push({ ic: 'clock', title: fmt.count(S.callbacksDueToday) + ' callbacks due today', meta: 'Leads · Callbacks due', href: 'leads.html?view=callbacks', end: 'Open' });
    if (FLOW.draft) items.push({ ic: 'workflow', title: FLOW.draft.changes + ' unpublished changes', meta: FLOW.name + ' · Draft v' + FLOW.draft.version + ' · edited ' + fmt.when(FLOW.draft.editedAt), href: 'flow-designer.html?flow=' + FLOW.id, end: 'Review' });
    if (DATA.user.role === 'Admin' && S.proposals) items.push({ ic: 'book-open', title: S.proposals + ' answers to review', meta: 'Knowledge · proposed from calls', href: 'knowledge.html?view=proposals', end: 'Review' });
    if (S.tasksToConfirm) items.push({ ic: 'list-checks', title: S.tasksToConfirm + ' task waiting for you', meta: 'Personal agents · confirm to continue', href: 'agents.html?view=personal-agents', end: 'Confirm' });
    if (!items.length) return '';
    return '<section class="card card--flush" aria-labelledby="home-next-h"><div class="card-head"><h2 class="card-title" id="home-next-h">Next steps</h2><span class="card-meta u-num">' + items.length + ' things</span></div>' +
      '<ul class="home-list">' + items.map(function (i) {
        return '<li><a class="li home-li" href="' + i.href + '"><span class="li-title"><span class="' + (i.warn ? 'u-fg-warning' : 'u-fg-3') + '">' + icon(i.ic) + '</span><span class="u-truncate">' + esc(i.title) + '</span></span>' +
          '<span class="li-meta home-li-meta">' + esc(i.meta) + '</span><span class="li-end"><span class="type-label-13 u-fg-accent">' + esc(i.end) + '</span>' + icon('chevron-right', 'sm', { className: 'u-fg-3' }) + '</span></a></li>';
      }).join('') + '</ul></section>';
  }

  /* ---------- today: the server’s day totals, then the five latest calls (tests excluded, as in Call reports) ---------- */
  function todayHtml() {
    var u = today(), t = DATA.meta.today;
    var calls = DATA.calls.filter(function (c) { return c.at.slice(0, 10) === t && !c.test; }).slice(0, 5);
    var cell = function (k, v) { return '<div class="kstrip-cell"><span class="stat-label">' + k + '</span><span class="stat-value u-num">' + v + '</span></div>'; };
    var rows = calls.map(function (c) {
      var meta = fmt.when(c.at) + (c.durationSec ? ' · ' + fmt.duration(c.durationSec) : '') + ' · ' + c.flow.name + ' v' + c.flow.version;
      return '<li><a class="li home-li" href="call-reports.html?call=' + c.id + '"><span class="li-title" translate="no">' + esc(c.leadName) + '</span>' + V.ui.statusTag('outcome', c.outcome) +
        '<span class="li-meta">' + esc(meta) + '</span>' + V.ui.langMark(c.languages[0]) + '</a></li>';
    }).join('');
    return '<section class="card card--flush" aria-labelledby="home-today-h"><div class="card-head"><h2 class="card-title" id="home-today-h">Today</h2><span class="card-meta">Updated ' + fmt.time(fmt.now().toISOString ? fmt.now().toISOString() : fmt.now()) + '</span></div>' +
      '<div class="kstrip home-kstrip">' + cell('Calls', fmt.count(u.calls)) + cell('Connected', fmt.count(u.connected)) + cell('Talk time', u.minutes + '<span class="stat-unit">min</span>') + cell('Spent', fmt.money(u.spend)) + '</div>' +
      '<h3 class="type-label-12 u-fg-3 home-sub-h" id="home-recent-h">Latest calls</h3>' +
      (rows ? '<ul class="home-list" aria-labelledby="home-recent-h">' + rows + '</ul>' : '<p class="empty empty--compact">No calls yet today.</p>') +
      '<div class="home-card-foot"><a class="type-label-13" href="call-reports.html">All call reports</a><span class="type-meta-12 u-fg-3">Test calls are left out</span></div></section>';
  }

  /* ---------- the setup checks with their current state (§13.5): a regression shows amber here ---------- */
  function checksHtml() {
    var m = H.derive(), n = m.done;
    return '<section class="home-track" aria-labelledby="home-chk-h"><div class="home-track-head"><h2 class="type-title-16" id="home-chk-h">Setup checks · <span class="u-num">' + n + ' of 5 pass</span></h2></div>' +
      '<ol class="setup-track" aria-label="Setup checks, ' + n + ' of 5 pass">' + H.ORDER.map(function (id) { return H.stepHtml(m.steps[id]); }).join('') + '</ol></section>';
  }

  H.renderOverview = function (regions, aside) {
    var reg = H.s.demo === 'regression', title = $('#page-title'), lede = $('#home-lede');
    title.textContent = reg ? 'Calls can’t be placed right now' : 'Your workspace is live.';
    lede.innerHTML = reg ? 'Your calling number lost its verification, so calls are paused. Verify it again to resume.'
      : 'Callers on ' + H.phone(DATA.org.inboundNumber.masked) + ' hear <span translate="no">' + esc(FLOW.name) + '</span> v' + FLOW.live.version + '.';
    regions.innerHTML = nextHtml(reg) + todayHtml() + checksHtml();
    aside.innerHTML = H.walletCard() + H.workspaceCard();
  };
})(window, document, window.Vaani);
