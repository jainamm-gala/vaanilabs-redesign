/* Vaani Labs prototype · pages/assistant-gates.js — the Call gate (02-components-gate §5.1, batch) and the Publish gate (§5.2),
   opened from the ApprovalCard’s launcher with the step’s idempotency key. Opening sends the preflight, never the action;
   focus lands on the gate title; only the gate’s primary (or ⌘/Ctrl+Enter inside it) confirms. Cancel leaves the step
   waiting and returns focus to the launcher; Done reports the server-confirmed result on the step. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA;
  var G = null;

  function mark(kind) { var m = { pass: ['pass', 'check', 'Passed: '], block: ['block', 'x', 'Blocking: '], adjusted: ['adjusted', 'minus', 'Adjusted: '], advisory: ['advisory', 'info', 'Note: '], warn: ['advisory-warn', 'triangle-alert', 'Warning: '] }[kind];
    return kind === 'checking' ? ['<span class="gate-mark gate-mark--checking" aria-hidden="true">' + A.spin('xs') + '</span>', 'Checking: '] : ['<span class="gate-mark gate-mark--' + m[0] + '" data-mark aria-hidden="true">' + A.ic(m[1]) + '</span>', m[2]]; }
  function row(kind, text, meta, act) { var m = mark(kind); return '<li class="gate-row">' + m[0] + '<span class="gate-text' + (kind === 'checking' ? ' u-fg-2' : '') + '"><span class="sr-only">' + m[1] + '</span>' + text + (meta ? '<span class="gate-meta">' + meta + '</span>' : '') + '</span>' + (act ? '<span class="gate-act">' + act + '</span>' : '<span></span>') + '</li>'; }
  function head(id, title, sub) {
    return '<div class="gate-head"><div class="as-gh"><h2 class="gate-title" id="' + id + '-t" tabindex="-1" data-focus-target>' + esc(title) + '</h2><button type="button" class="ibtn ibtn--sm" data-g="cancel" aria-label="Close"' + (G && G.busy ? ' aria-disabled="true"' : '') + '>' + A.ic('x', 'sm') + '</button></div><div class="gate-sub" id="' + id + '-s">' + sub + '</div></div>';
  }
  function primary(label, busyLabel, dis, why) {
    return '<button type="button" class="btn btn--primary" data-g="confirm"' + (dis ? ' aria-disabled="true"' : '') + (G.busy ? ' aria-busy="true"' : '') + ' aria-describedby="' + G.id + '-why" aria-keyshortcuts="' + (U.isMac ? 'Meta+Enter' : 'Control+Enter') + '" data-tooltip="' + esc(dis ? why : label) + '" data-kbd="mod+enter">' + (G.busy ? A.spin('md') + esc(busyLabel) : esc(label)) + '</button>';
  }

  /* ================= Call gate ================= */
  function callRows() {
    var rows = A.apRows(G.step);
    G.skip = rows.filter(function (r) { return r.id === AD.scheduledId || r.id === AD.dndId; });
    G.call = rows.filter(function (r) { return G.skip.indexOf(r) < 0; });
    return rows;
  }
  function callHtml() {
    var ap = G.step.ap, f = A.flowById(ap.flowId), v = A.voiceById(ap.voice), W = A.wallet(), n = G.call.length, c = A.costParts(n);
    var ready = G.phase === 'ready' || G.phase === 'confirming' || G.phase === 'failed', sched = G.choice === 'schedule';
    var label = (sched ? 'Schedule ' : 'Start ') + A.plural(n, 'call'), why = !ready ? 'Checking…' : sched ? 'Calls start at ' + F.time(DATA._util.ist(0, G.time)) + ' IST, in order.' : 'Calls start in order within a minute.';
    var must, sum;
    if (!ready) { sum = '<span class="gate-sum" role="status">' + A.spin('sm') + 'Checking ' + A.plural(G.rows.length, 'lead') + '…</span>'; must = ['Checking the flow…', 'Checking caller ID…', 'Checking calling hours…', 'Checking the DND registry…'].map(function (t) { return row('checking', esc(t)); }).join(''); }
    else {
      sum = '<span class="gate-sum gate-sum--ok" role="status">' + A.ic('check', 'sm') + A.plural(n, 'call') + ' ready · ' + A.plural(G.skip.length, 'lead') + ' skipped</span>';
      must = row('pass', '<span translate="no">' + esc(f.name) + ' v' + f.v + '</span> is live', f.id === 'flow_7c21' ? 'Test call on this version today, ' + esc(F.time(DATA.flows[0].live.tested.at)) : '') +
        row('pass', 'Caller ID verified', V.ui.phoneText(DATA.org.callerId.masked)) +
        row('pass', sched ? 'Scheduled inside calling hours' : 'Inside calling hours', sched ? esc(F.time(DATA._util.ist(0, G.time))) + ' IST' : 'Open until ' + esc(A.closesAt()) + ' IST') +
        row('pass', 'Wallet covers this batch', esc(A.money(W.balance)) + ' · ' + esc(W.runway)) +
        row('pass', 'DND registry: ' + (G.rows.length - 1) + ' of ' + G.rows.length + ' clear');
    }
    var adj = !ready ? '' : '<div class="gate-group">Adjusted</div><ul class="gate-list">' +
      (G.skip.some(function (r) { return r.id === AD.scheduledId; }) ? row('adjusted', '1 lead is already scheduled in “Weekend follow-ups” · Skipped', 'Including it would dial twice.', '<a class="btn btn--link" href="cockpit.html">View in Cockpit</a>') : '') +
      (G.skip.some(function (r) { return r.id === AD.dndId; }) ? row('adjusted', '1 lead is on the DND registry · Skipped', '<span translate="no">Sameer Qureshi</span> has no recorded consent, so they can’t be included.') : '') + '</ul>' +
      '<div class="gate-group">Good to know</div><ul class="gate-list">' + row('advisory', '1 lead prefers Marathi. ' + esc(v.name) + ' speaks Hindi and English.', '<span translate="no">Arjun Deshpande</span> · Nashik') + row('advisory', 'Calls say they are recorded') + '</ul>';
    var body = '<dl class="kv as-cg-scope"><div class="kv-row"><dt>To</dt><dd>' + A.plural(G.rows.length, 'lead') + ' from step ' + A.stepIndex(G.step) + '</dd></div><div class="kv-row"><dt>Flow</dt><dd translate="no">' + esc(f.name) + ' v' + f.v + '</dd></div><div class="kv-row"><dt>Voice</dt><dd>' + esc(v.name) + ' · Auto language</dd></div><div class="kv-row"><dt>Caller ID</dt><dd>' + V.ui.phoneText(DATA.org.callerId.masked) + '</dd></div></dl>' +
      (G.error ? '<div class="ierr" role="alert"><div class="ierr-line">' + A.ic('circle-alert') + '<span>Couldn’t start the calls. Nothing was dialled. <button type="button" class="btn btn--link" data-g="confirm">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>Idempotency key ' + esc(G.key) + ' · 503 upstream timeout</code></div></details></div>' : '') +
      '<div class="gate-group">Must pass' + sum + '</div><ul class="gate-list">' + must + '</ul>' + adj +
      '<div class="gate-cost"><span>' + esc(c[0]) + '</span><b>' + esc(c[1]) + '</b></div><p class="gate-note">Wallet ' + esc(A.money(W.balance)) + ' · ' + esc(W.runway) + '</p>' +
      '<div class="rcards as-cg-choice" role="radiogroup" aria-label="When to call">' +
      '<label class="rcard"><input type="radio" class="radio" name="as-cg-when" value="now"' + (sched ? '' : ' checked') + (G.busy ? ' disabled' : '') + '><span class="rcard-body"><span class="rcard-title">Place now</span><span class="rcard-desc">Calls start in order within a minute.</span></span></label>' +
      '<label class="rcard"><input type="radio" class="radio" name="as-cg-when" value="schedule"' + (sched ? ' checked' : '') + (G.busy ? ' disabled' : '') + '><span class="rcard-body"><span class="rcard-title">Schedule…</span><span class="rcard-desc">Pick a time inside calling hours (IST).</span></span></label></div>' +
      (sched ? '<div class="field"><label class="field-label" for="as-cg-time">Start at</label><select class="select-native" id="as-cg-time">' + ['12:00', '14:00', '15:00', '16:00'].map(function (t) { return '<option value="' + t + '"' + (t === G.time ? ' selected' : '') + '>Today ' + F.time(DATA._util.ist(0, t)) + ' IST</option>'; }).join('') + '</select></div>' : '');
    return head(G.id, 'Call ' + A.plural(n, 'lead'), 'Nothing dials until you start. · <span class="u-fg-3">' + (ready ? 'Checked just now' : 'Checking…') + '</span>') +
      '<div class="gate-body">' + body + '</div><div class="gate-foot"><span class="gate-reason" id="' + G.id + '-why">' + esc(why) + '</span><button type="button" class="btn btn--tertiary" data-g="cancel"' + (G.busy ? ' aria-disabled="true"' : '') + '>Cancel</button>' + primary(label, 'Starting…', !ready, why) + '</div>';
  }
  function paint(focusSel) {
    var el = G.el, keep = el.contains(d.activeElement) ? (d.activeElement.getAttribute('data-g') || d.activeElement.id || (d.activeElement.name ? 'name:' + d.activeElement.value : '')) : null;
    var sc = $('.gate-body', el), top = sc ? sc.scrollTop : 0;
    el.innerHTML = G.kind === 'call' ? callHtml() : pubHtml();
    V.initAll(el);
    if (G.entry && !G.entry.closed && G.entry.reposition) G.entry.reposition();
    if ($('.gate-body', el)) $('.gate-body', el).scrollTop = top;
    if (G.kind === 'publish' && $('.as-pg-scroll', el)) $('.as-pg-scroll', el).scrollTop = G.scroll || 0;
    var f = focusSel ? $(focusSel, el) : keep ? (keep.indexOf('name:') === 0 ? $('input[value="' + keep.slice(5) + '"]', el) : $('[data-g="' + keep + '"]', el) || $('#' + keep, el)) : null;
    if (f) f.focus({ preventScroll: true });
  }

  A.openCallGate = function (s, trigger) {
    var el = $('#as-call-gate');
    G = { kind: 'call', step: s, el: el, trigger: trigger, id: 'as-cg', choice: 'now', time: '14:00', phase: 'checking', busy: false, key: s.key || (s.key = 'idem_' + s.id + '_' + Math.random().toString(36).slice(2, 8)) };
    G.rows = callRows(); callRows(); el.innerHTML = callHtml(); V.initAll(el);
    G.entry = V.popover.open(trigger, 'as-call-gate', { modal: true, placement: 'top-end', onClose: function (r) { onClose(r); } });
    setTimeout(function () { if (!G || G.el !== el) return; G.phase = 'ready'; paint(); A.say(A.plural(G.call.length, 'call') + ' ready. ' + A.plural(G.skip.length, 'lead') + ' skipped.', false, 'gate'); }, 700);
  };

  /* ================= Publish gate ================= */
  function pubHtml() {
    var ack = G.ack, dis = !ack, why = ack ? 'Callers hear v1 from the next batch.' : 'Confirm 1 warning to publish.';
    var label = ack ? 'Publish without testing' : 'Publish v1';
    var steps = ['Greet and confirm the lead', 'Explain the Diwali price for Tower B', 'Answer: possession date', 'Answer: payment plan', 'Offer a site visit'];
    return head(G.id, 'Publish v1', '<span translate="no">Festive offer callback</span> · new flow · drafted by the Assistant. Callers hear v1 only after you publish.') +
      '<div class="as-pg-scroll"><div class="gate-body">' +
      (G.error ? '<div class="ierr" role="alert"><div class="ierr-line">' + A.ic('circle-alert') + '<span>Couldn’t publish. Nothing changed: callers don’t hear this flow yet. <button type="button" class="btn btn--link" data-g="confirm">Retry</button></span></div></div>' : '') +
      '<section class="as-pg-sec" aria-labelledby="as-pg-ch"><div class="gate-group"><h3 class="as-pg-h" id="as-pg-ch">Checks</h3><span class="gate-sum ' + (ack ? 'gate-sum--ok' : 'gate-sum--warn') + '" role="status">' + A.ic(ack ? 'check' : 'triangle-alert', 'sm') + (ack ? 'Ready to publish' : 'Ready · 1 warning to confirm') + '</span></div><ul class="gate-list">' +
      row('pass', 'No errors in 5 steps') + row('pass', 'Vaani speaks the flow’s languages', 'Hindi and English') +
      row('warn', 'No test call on this draft yet', 'Hear it before callers do: Talk in browser or place a test call.', '<a class="btn btn--link" href="flow-designer.html?flow=flow_f219&test=1">Test now</a>').replace('</span><span class="gate-act">', '<label class="check as-pg-ack" for="as-pg-ack"><input type="checkbox" class="cb" id="as-pg-ack"' + (ack ? ' checked' : '') + (G.busy ? ' disabled' : '') + '><span class="check-text">Publish without testing</span></label></span><span class="gate-act">') +
      row('advisory', 'Publishing costs nothing. Wallet and calling hours don’t affect it.') + '</ul>' +
      (ack ? '<div class="field as-pg-reason"><span class="field-label" id="as-pg-r-l">Reason <span class="field-opt">(optional)</span></span><button type="button" class="select" data-select aria-controls="as-pg-r" aria-labelledby="as-pg-r-l as-pg-r-v"><span class="select-value" id="as-pg-r-v">Wording change only</span>' + A.ic('chevron-down') + '</button><div class="listbox" id="as-pg-r" role="listbox" aria-labelledby="as-pg-r-l" hidden>' + ['Wording change only', 'Urgent fix', 'Tested another way', 'Other'].map(function (o, i) { return '<div class="option" role="option" aria-selected="' + (i === 0) + '" data-value="' + i + '"><span class="option-main"><span class="option-label">' + o + '</span></span>' + A.ic('check', 'md', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>' : '') + '</section>' +
      '<section class="as-pg-sec" aria-labelledby="as-pg-wh"><h3 class="as-pg-h" id="as-pg-wh">Where it goes live</h3><ul class="as-pg-list"><li>' + A.ic('phone-outgoing', 'sm', { className: 'u-fg-3' }) + '<span>Outbound batches · new batches can use v1</span></li><li>' + A.ic('phone-incoming', 'sm', { className: 'u-fg-3' }) + '<span>Inbound ' + V.ui.phoneText(DATA.org.inboundNumber.masked) + ' · not affected, keeps <span translate="no">Site-visit qualifier</span> v7</span></li></ul><p class="gate-note">No calls are in progress on this flow.</p></section>' +
      '<section class="as-pg-sec" aria-labelledby="as-pg-cg"><h3 class="as-pg-h" id="as-pg-cg">Changes</h3><p class="as-pg-p">New flow · 5 steps</p><ol class="as-pg-list as-pg-steps">' + steps.map(function (t, i) { return '<li><span class="num u-fg-3">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ol></section>' +
      '<section class="as-pg-sec"><div class="field"><label class="field-label" for="as-pg-note">Note for this version <span class="field-opt">(optional)</span></label><textarea class="textarea as-pg-note" id="as-pg-note" rows="1"' + (G.busy ? ' readonly' : '') + '>' + esc(G.note || '') + '</textarea></div></section>' +
      '</div></div><div class="gate-foot"><span class="gate-reason" id="' + G.id + '-why">' + esc(why) + '</span><button type="button" class="btn btn--tertiary" data-g="cancel"' + (G.busy ? ' aria-disabled="true"' : '') + '>Cancel</button>' + primary(label, 'Publishing…', dis, why) + '</div>';
  }
  A.openPublishGate = function (s, trigger) {
    var el = $('#as-pub-gate');
    G = { kind: 'publish', step: s, el: el, id: 'as-pg', ack: false, busy: false, key: s.key || (s.key = 'idem_' + s.id) };
    el.innerHTML = pubHtml(); V.initAll(el);
    G.entry = V.drawer.open('as-pub-gate', { returnTo: trigger, onClose: function (r) { onClose(r); } });
  };

  /* ================= shared behaviour ================= */
  function onClose(reason) {
    if (!G) return; var g = G; G = null;
    if (reason === 'done') return;
    A.say(g.kind === 'call' ? 'Call gate closed. Nothing dialled. Step ' + A.stepIndex(g.step) + ' is still waiting.' : 'Publish gate closed. Nothing was published.', false, 'gateclose');
  }
  function confirm() {
    var btn = $('[data-g="confirm"]:not(.btn--link)', G.el);
    if (!btn || G.busy) return;
    if (btn.getAttribute('aria-disabled') === 'true') { A.say($('#' + G.id + '-why').textContent, false, 'why'); return; }
    G.busy = true; G.error = false; if (G.entry) G.entry.busy = true;
    if (G.kind === 'publish') { var n = $('#as-pg-note', G.el); G.note = n ? n.value : ''; var sc = $('.as-pg-scroll', G.el); G.scroll = sc ? sc.scrollTop : 0; }
    paint('[data-g="confirm"]');
    var g = G;
    setTimeout(function () {
      if (G !== g) return;
      if (A.S.demo === 'gate-fail' && !g.failedOnce) { g.failedOnce = true; g.busy = false; g.error = true; if (g.entry) g.entry.busy = false; paint('.ierr .btn--link'); A.say(g.kind === 'call' ? 'Couldn’t start the calls. Nothing was dialled.' : 'Couldn’t publish. Nothing changed.', true, 'gatefail'); return; }
      g.entry.busy = false; done(g);
    }, 1000);
  }
  function done(g) {
    var s = g.step; s.status = 'done'; A.S.lastDone = s.id;
    if (g.kind === 'call') {
      var n = g.call.length, k = g.skip.length, at = g.choice === 'schedule' ? ' for today ' + F.time(DATA._util.ist(0, g.time)) : '';
      s.result = { word: 'Scheduled', text: A.plural(n, 'call') + at + ' · ' + k + ' skipped by the checks', link: { label: 'Open in Cockpit', href: 'cockpit.html' } };
      s.closing = 'Scheduled ' + A.plural(n, 'call') + (at || ' to start now') + '; ' + k + ' were skipped by the call checks.';
      A.addChange({ icon: 'phone-outgoing', html: 'Scheduled <b>' + A.plural(n, 'call') + '</b>' + esc(at || ' to start now') + ' · batch “Callbacks · ' + F.dateShort(A.nowIso()) + '”', acts: [{ label: 'Open in Cockpit', href: 'cockpit.html' }], step: s.id });
      g.entry.close('done'); A.say(A.plural(n, 'call') + ' scheduled. ' + k + ' skipped by the checks.', false, 'gatedone');
    } else {
      s.result = { word: 'Live', text: 'v1 is live on outbound batches', rollback: true };
      s.closing = 'Published Festive offer callback as v1. It’s live on outbound batches; the inbound number still answers with Site-visit qualifier v7.';
      A.addChange({ icon: 'upload', html: 'Published <b translate="no">Festive offer callback</b> v1', acts: [{ label: 'Open in Flows', href: 'flow-designer.html?flow=flow_f219' }, { label: 'Roll back…', href: 'flow-designer.html?flow=flow_f219&versions=1' }], step: s.id });
      g.entry.close('done'); A.say('Version 1 is live.', false, 'gatedone');
    }
    A.focusResult(s); A.advance();
  }
  function onClick(e) {
    if (!G) return; var t = e.target.closest('[data-g]');
    if (t && t.getAttribute('data-g') === 'cancel') { if (G.busy) return; G.entry.close('cancel'); return; }
    if (t && t.getAttribute('data-g') === 'confirm') { confirm(); return; }
  }
  function onChange(e) {
    if (!G) return; var t = e.target;
    if (t.name === 'as-cg-when') { G.choice = t.value; paint('input[value="' + t.value + '"]'); A.say(G.choice === 'schedule' ? 'Schedule ' + A.plural(G.call.length, 'call') : 'Start ' + A.plural(G.call.length, 'call')); }
    if (t.id === 'as-cg-time') { G.time = t.value; paint('#as-cg-time'); }
    if (t.id === 'as-pg-ack') { G.ack = t.checked; var n = $('#as-pg-note', G.el); G.note = n ? n.value : ''; var sc = $('.as-pg-scroll', G.el); G.scroll = sc ? sc.scrollTop : 0; paint('#as-pg-ack'); A.say(G.ack ? 'Ready to publish.' : 'Confirm 1 warning to publish.', false, 'gate'); }
  }
  function onKey(e) {
    if (!G) return;
    if (e.key === 'Enter' && (U.isMac ? e.metaKey : e.ctrlKey)) { e.preventDefault(); confirm(); }
  }
  [$('#as-call-gate'), $('#as-pub-gate')].forEach(function (el) { el.addEventListener('click', onClick); el.addEventListener('change', onChange); el.addEventListener('keydown', onKey); });
})(window, document);
