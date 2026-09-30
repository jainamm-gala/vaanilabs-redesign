/* Vaani Labs prototype · pages/assistant-cards.js — the ApprovalCard (02 §10.3–10.5, gate §5.7): an inline, non-modal card
   built from the gate’s parts (header grammar, check rows, the cost or impact line, one primary that repeats the verb and
   count, ⌘/Ctrl+Enter inside the card). Tier 4 steps (Call, Publish) only LAUNCH their gate; the gate confirms. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, esc = U.esc, F = V.fmt, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA;
  var RATE = DATA.meta.ratePerSec || 0.04;

  function wallet() { var st = V.walletState(), s = (DATA.wallet.states || {})[st] || DATA.wallet; return { state: st, balance: s.balance != null ? s.balance : DATA.wallet.balance, runway: s.runway || DATA.wallet.runway }; }
  A.wallet = wallet;
  A.flowById = function (id) { return AD.liveFlows.filter(function (f) { return f.id === id; })[0] || AD.liveFlows[0]; };
  A.voiceById = function (id) { return AD.voices.filter(function (v) { return v.id === id; })[0] || AD.voices[0]; };
  A.closesAt = function () { return (DATA.org.callingHours.closesAt || '7:00 pm').replace(':00', ''); };

  /* ---------- preview state per step (what the card shows; Edit… changes it) ---------- */
  A.ensureAp = function (s) {
    if (s.ap) return s.ap;
    var ap = s.ap = { excluded: {}, checkedAt: A.S.demo === 'stale' ? new Date(F.now().getTime() - 12 * 60000).toISOString() : A.nowIso() };
    if (s.approval === 'call') { ap.flowId = 'flow_7c21'; ap.voice = 'vaani'; ap.when = 'now'; ap.time = '14:00'; }
    if (s.approval === 'import') { ap.include = false; ap.status = 'new'; ap.flowId = 'flow_7c21'; }
    if (s.approval === 'delete') { ap.typed = ''; }
    return ap;
  };
  A.apRows = function (s) {
    var ap = A.ensureAp(s), rows;
    if (s.approval === 'call') rows = AD.callbacks;
    else if (s.approval === 'mark') rows = AD.callbacks.filter(function (r) { return r.id !== AD.scheduledId && r.id !== AD.dndId; }).slice(0, 7);
    else if (s.approval === 'import') rows = AD.expo.concat(ap.include ? AD.expoDupes : []);
    else if (s.approval === 'editdraft') rows = A.DRAFT_CHANGES;
    else rows = [];
    return rows.filter(function (r, i) { return !ap.excluded[r.id || r.name || i]; });
  };
  A.apCount = function (s) { return s.approval === 'delete' ? 64 : A.apRows(s).length; };
  A.DRAFT_CHANGES = [
    { id: 'd1', kind: 'Added', text: 'Ask about parking', meta: 'After “Ask about a site visit”' },
    { id: 'd2', kind: 'Added', text: 'Offer a weekday slot', meta: 'When the lead says “weekend is busy”' },
    { id: 'd3', kind: 'Added', text: 'Send the brochure on WhatsApp', meta: 'Uses the approved “brochure_v2” template' },
    { id: 'd4', kind: 'Changed', text: 'Greeting', meta: 'Mentions the Diwali price for Tower B' }
  ];

  /* ---------- blocked reasons (§10.4, §13.5): the step shows Blocked; the primary is aria-disabled with the reason ---------- */
  A.blockedReason = function (s) {
    var demo = A.S.demo;
    if (s.approval === 'call') {
      if (wallet().state === 'empty') return { text: 'Wallet is ₹0.', fixText: 'to place calls.', fix: { label: 'Top up', act: 'topup' } };
      if (demo === 'no-caller-id') return { text: 'No verified caller ID yet.', fix: { label: 'Finish setup (3 of 5)', href: 'index.html' } };
      if (demo === 'role') return { text: 'Your role can’t place calls. Ask an admin.', fix: { label: 'Ask an admin', act: 'ask-admin' } };
      if (demo === 'no-live') return { text: 'Site-visit qualifier has no live version. Publish it first, or', fix: { label: 'call yourself to test', href: 'cockpit.html?kind=test' } };
    }
    if (s.approval === 'publish' && demo === 'role') return { text: 'Only admins can publish flows. Ask an admin to publish the draft from Flows.', fix: { label: 'Copy link to the draft', act: 'copy-draft-link' } };
    return null;
  };
  function blockedNotice(b) {
    var fix = !b.fix ? '' : b.fix.act === 'topup' ? '<a class="notice-act" href="billing.html?topup=1" data-vaani-action="topup">' + esc(b.fix.label) + '</a>' : b.fix.href ? '<a class="notice-act" href="' + esc(b.fix.href) + '">' + esc(b.fix.label) + '</a>' : '<button type="button" class="notice-act" data-act="' + b.fix.act + '">' + esc(b.fix.label) + '</button>';
    return '<div class="notice notice--warning as-ap-notice">' + A.ic('lock') + '<div class="notice-body">' + esc(b.text) + ' ' + fix + (b.fixText ? ' ' + esc(b.fixText) : '') + '</div></div>';
  }

  /* ---------- parts ---------- */
  function checked(ap) {
    var mins = Math.floor((new Date(A.nowIso()) - new Date(ap.checkedAt)) / 60000);
    if (ap.checking) return '<span class="status status--progress">' + A.spin('sm') + 'Checking…</span>';
    return mins < 1 ? 'Checked just now' : 'Checked ' + mins + ' min ago · <button type="button" class="btn btn--link" data-act="recheck">Recheck</button>';
  }
  function costParts(n) { var r = F.callRange(n, 1, 2, RATE), i = r.lastIndexOf(' · '); return [r.slice(0, i), r.slice(i + 3)]; }
  A.costParts = costParts;
  function kv(rows) { return '<dl class="kv as-ap-kv">' + rows.map(function (r) { return '<div class="kv-row"' + (r[2] ? ' data-kv="' + r[2] + '"' : '') + '><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; }
  function rowList(rows, max, fn, label, total, sid) {
    var more = total - Math.min(max, rows.length);
    return '<div class="as-rcp"><p class="as-rcp-h">' + esc(label) + '</p><ul class="as-rcp-list">' + rows.slice(0, max).map(fn).join('') + '</ul>' +
      (more > 0 ? '<button type="button" class="btn btn--link as-rcp-more" data-act="view-all" data-step="' + sid + '">and ' + more + ' more · View all ' + total + '</button>' : '') + '</div>';
  }
  function person(r) { return '<li><span translate="no">' + esc(r.name) + '</span><span class="as-rcp-c">' + esc(r.city) + '</span>' + V.ui.phoneText(r.phone) + (r.due ? '<span class="num u-fg-3">' + esc(F.time(r.due)) + '</span>' : '<span></span>') + '</li>'; }
  function checkRow(kind, text, meta, act) {
    var m = { adjusted: ['adjusted', 'minus', 'Adjusted: '], warn: ['advisory-warn', 'triangle-alert', 'Warning: '], block: ['block', 'x', 'Blocking: '], advisory: ['advisory', 'info', 'Note: '] }[kind];
    return '<li class="gate-row"><span class="gate-mark gate-mark--' + m[0] + '" data-mark aria-hidden="true">' + A.ic(m[1]) + '</span><span class="gate-text"><span class="sr-only">' + m[2] + '</span>' + text + (meta ? '<span class="gate-meta">' + meta + '</span>' : '') + '</span>' + (act || '<span></span>') + '</li>';
  }
  function foot(s, primary, o) {
    o = o || {};
    var b = A.blockedReason(s), ap = s.ap, why = b ? b.text + (b.fix ? ' ' + b.fix.label + (b.fixText ? ' ' + b.fixText : '') : '') : o.why || '';
    var dis = b || o.disabled || ap.changed || ap.checking || ap.since || A.S.offline;
    if (!why && A.S.offline) why = 'You’re offline. Approvals come back when you reconnect.';
    if (!why && ap.changed) why = 'The plan changed. Review again.';
    if (!why && ap.since) why = 'Changed since you approved. Review again.';
    if (!why && ap.checking) why = 'Checking…';
    var busy = ap.busy;
    var pri = '<button type="button" class="btn ' + (o.danger ? 'btn--danger' : 'btn--primary') + ' has-lead as-ap-primary" data-act="approve" data-step="' + s.id + '"' + (o.gate ? ' aria-haspopup="dialog"' : '') +
      (dis ? ' aria-disabled="true"' : '') + (busy ? ' aria-busy="true"' : '') + ' aria-describedby="why-' + s.id + '" aria-keyshortcuts="' + (U.isMac ? 'Meta+Enter' : 'Control+Enter') + '" data-tooltip="' + esc(why || (o.gate ? 'Opens the checks. Nothing happens yet.' : primary)) + '" data-kbd="mod+enter">' +
      (busy ? A.spin('md') + esc(o.busyLabel) : A.ic(o.icon || 'check') + esc(primary)) + '</button>';
    var skip = '<button type="button" class="btn btn--tertiary" data-act="skip" data-step="' + s.id + '"' + (busy ? ' aria-disabled="true"' : '') + '>' + esc(o.skipLabel || 'Skip step') + '</button>';
    var sec = o.secondary || '<button type="button" class="btn" data-act="edit-step" data-step="' + s.id + '"' + (busy || b ? ' aria-disabled="true"' : '') + '>Edit…</button>';
    return '<div class="as-ap-foot"><span class="sr-only" id="why-' + s.id + '">' + esc(why) + '</span>' + skip + sec + pri + '</div>';
  }
  function frame(s, title, inner, footHtml) {
    var ap = A.ensureAp(s), b = A.blockedReason(s);
    return '<div class="as-ap" role="group" aria-labelledby="ap-' + s.id + '-t" data-step="' + s.id + '"' + (ap.busy ? ' aria-busy="true"' : '') + '>' +
      (ap.changed ? '<div class="notice notice--info as-ap-notice" role="status">' + A.ic('info') + '<div class="notice-body">The plan changed. Review again.</div></div>' : '') +
      (ap.since ? '<div class="notice notice--warning as-ap-notice">' + A.ic('triangle-alert') + '<div class="notice-body">Changed since you approved. Nothing was changed. <button type="button" class="notice-act" data-act="review-again" data-step="' + s.id + '">Review again</button></div></div>' : '') +
      '<div class="as-ap-head"><h3 class="as-card-title" id="ap-' + s.id + '-t" tabindex="-1" data-focus-target>' + esc(title) + '</h3><p class="as-ap-meta">' + checked(ap) + '</p></div>' +
      (ap.editing ? A.editFormHtml(s) : inner) + (b ? blockedNotice(b) : '') + (ap.editing ? '' : footHtml) + '</div>';
  }

  /* ---------- variants ---------- */
  var CARD = {
    call: function (s) {
      var ap = A.ensureAp(s), rows = A.apRows(s), n = rows.length, f = A.flowById(ap.flowId), v = A.voiceById(ap.voice), W = wallet(), c = costParts(n);
      var when = ap.when === 'now' ? 'Now · calling hours until ' + A.closesAt() + ' IST' : 'Today ' + F.time(DATA._util.ist(0, ap.time)) + ' IST';
      var inner = kv([
        ['Flow', '<span translate="no">' + esc(f.name) + ' v' + f.v + '</span>' + V.ui.statusTag('flow', 'live', { v: f.v })],
        ['Voice', V.ui.avatar(v.name, { kind: 'voice', tile: v.tile }) + '<span translate="no">' + esc(v.name) + '</span> · Hindi + English'],
        ['When', esc(when)],
        ['Caller ID', V.ui.phoneText(DATA.org.callerId.masked)],
        ['Recipients', A.plural(n, 'lead') + ' · <button type="button" class="btn btn--link" data-act="view-all" data-step="' + s.id + '">View all</button>', 'rcp']
      ]) + rowList(rows, 3, person, 'Recipients', n, s.id) +
        '<div class="as-ap-cost"><div class="gate-cost"><span>' + esc(c[0]) + '</span><b>' + esc(c[1]) + '</b></div><p class="gate-note">Wallet ' + esc(A.money(W.balance)) + ' · ' + esc(W.runway) + '</p></div>' +
        '<p class="gate-note">Calling hours, DND and recent calls are checked again before anything dials.</p>';
      return frame(s, 'Call ' + A.plural(n, 'lead'), inner, foot(s, 'Review and call…', { gate: true, icon: 'phone-outgoing' }));
    },
    mark: function (s) {
      var rows = A.apRows(s), n = rows.length;
      var inner = kv([['Status', V.ui.statusTag('lead', 'callback_due') + A.ic('arrow-right', 'sm', { className: 'u-fg-3' }) + V.ui.statusTag('lead', 'contacted')], ['Which', 'Leads who answered today’s calls']]) +
        rowList(rows, 3, person, 'Leads', n, s.id) + impact('Affects ' + A.plural(n, 'lead') + ' · Undo available for 24 h');
      return frame(s, 'Mark ' + A.plural(n, 'lead') + ' Contacted', inner, foot(s, 'Mark ' + A.plural(n, 'lead') + ' Contacted', { busyLabel: 'Marking…' }));
    },
    'import': function (s) {
      var ap = A.ensureAp(s), rows = A.apRows(s), n = rows.length;
      var table = '<div class="dt-wrap dt-wrap--framed as-mt as-ap-table"><table class="dt"><caption class="sr-only">First 5 of ' + n + ' leads to add</caption><thead><tr><th scope="col">Name</th><th scope="col">Phone</th><th scope="col" class="as-col-lang">City</th></tr></thead><tbody>' +
        rows.slice(0, 5).map(function (r) { return '<tr><td class="c-key" translate="no">' + esc(r.name) + '</td><td>' + V.ui.phoneText(r.phone) + '</td><td class="as-col-lang">' + esc(r.city) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        (n > 5 ? '<button type="button" class="btn btn--link as-rcp-more" data-act="view-all" data-step="' + s.id + '">and ' + (n - 5) + ' more · View all ' + n + '</button>' : '');
      var chk = '<ul class="gate-list as-ap-checks">' + (ap.include ? checkRow('advisory', '3 phone numbers are already in Leads · Included', 'They will be added again as new leads.', '<button type="button" class="btn btn--link gate-act" data-act="include" data-step="' + s.id + '">Skip them</button>')
        : checkRow('adjusted', '3 phone numbers are already in Leads · Skipped', 'Skipped to avoid duplicates.', '<button type="button" class="btn btn--link gate-act" data-act="include" data-step="' + s.id + '" aria-label="Include 3 leads already in Leads">Include</button>')) + '</ul>';
      var inner = kv([['From', '<span translate="no">expo-visitors.csv</span> · 27 rows'], ['Status', V.ui.statusTag('lead', ap.status)], ['Flow', '<span translate="no">' + esc(A.flowById(ap.flowId).name) + '</span>']]) + table + chk + impact('Affects ' + A.plural(n, 'lead') + ' · Undo available for 24 h');
      return frame(s, 'Add ' + A.plural(n, 'lead'), inner, foot(s, 'Add ' + A.plural(n, 'lead'), { busyLabel: 'Adding…', icon: 'user-plus' }));
    },
    'delete': function (s) {
      var ap = A.ensureAp(s), ok = ap.typed.trim() === '64';
      var inner = kv([['Which', V.ui.statusTag('lead', 'not_interested') + '<span>No call since 29 Jun 2026</span>'], ['For example', '<span><span translate="no">Siddharth Rao, Aditi Banerjee, Deepak Chauhan</span> and 61 more</span>']]) +
        impact('Deleted leads can’t be restored after 7 days') +
        '<div class="field as-typed"><label class="field-label" for="typed-' + s.id + '">Type <b>64</b> to confirm</label><div class="input"><input id="typed-' + s.id + '" inputmode="numeric" autocomplete="off" data-act="typed" data-step="' + s.id + '" value="' + esc(ap.typed) + '"' + (ap.busy ? ' readonly' : '') + '></div></div>';
      return frame(s, 'Delete 64 leads', inner, foot(s, 'Delete 64 leads', { danger: true, busyLabel: 'Deleting…', icon: 'trash-2', disabled: !ok, why: ok ? '' : 'Type 64 to confirm.' }));
    },
    editdraft: function (s) {
      var rows = A.apRows(s);
      var inner = '<div class="as-diff"><p class="as-diff-sum">' + rows.filter(function (r) { return r.kind === 'Added'; }).length + ' steps added · ' + rows.filter(function (r) { return r.kind === 'Changed'; }).length + ' changed · <a class="as-a" href="flow-designer.html?view=diff">Open diff</a></p><ul class="as-diff-list">' +
        rows.map(function (r) { return '<li><span class="tag ' + (r.kind === 'Added' ? 'tag--success' : 'tag--info') + '">' + esc(r.kind) + '</span><span><span class="as-diff-t">' + esc(r.text) + '</span><span class="as-diff-m">' + esc(r.meta) + '</span></span></li>'; }).join('') + '</ul></div>' +
        '<p class="gate-note">Callers hear v7 until you publish. Live is not touched.</p>' + impact('Changes the shared draft v8 · Undo restores the previous draft');
      return frame(s, 'Apply ' + A.plural(rows.length, 'change') + ' to the Site-visit qualifier draft', inner, foot(s, 'Apply to draft', { busyLabel: 'Applying…', skipLabel: 'Discard', icon: 'check' }));
    },
    publish: function (s) {
      var errs = A.S.demo === 'publish-errors';
      var inner = kv([
        ['Validation', errs ? V.ui.statusTag('validation', 'errors', { n: 2 }) : V.ui.statusTag('validation', 'ok')],
        ['Goes live on', 'Outbound batches only · no inbound number'],
        ['Changes', 'New flow · 5 steps']
      ]) + '<p class="gate-note">Callers hear it only after you publish. Publishing costs nothing.</p>';
      var sec = '<a class="btn" href="flow-designer.html?flow=flow_f219">Open in Flows</a>';
      return frame(s, 'Publish Festive offer callback as v1', inner, foot(s, 'Review and publish…', { gate: true, icon: 'upload', secondary: sec, disabled: errs, why: errs ? 'Fix 2 errors to publish. Open in Flows.' : '' }));
    }
  };
  function impact(text) { return '<div class="as-ap-impact"><p class="as-ap-imp">' + esc(text) + '</p><p class="gate-note">Runs as you · ' + esc(DATA.user.role) + '</p></div>'; }
  A.cardHtml = function (s) { return (CARD[s.approval] || CARD.mark)(s); };
})(window, document);
