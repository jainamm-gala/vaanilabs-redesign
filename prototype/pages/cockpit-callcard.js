/* Vaani Labs prototype · Cockpit · the call card (CK §3.5–3.6): CallHeader (state, flow, timer, who, kind or recording,
   CallStepper), TalkStrip, NowInFlow, facts (voice, LineQuality, cost, caller ID), Captured so far, Lead details, the
   sticky CallControls; then Wrap-up (WrapUpForm), Test ended, or a recent call. TransferPicker is at the end. */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  var CV = CK.cardView = {};
  var V, esc, st, C;
  function init() { V = CK.V; esc = CK.esc; st = CK.st; C = CK.call; }

  function stateTag(c) {
    if (c.transfer && c.transfer.state === 'pending') return '<span class="cs cs--hold">' + V.icon('phone-forwarded', 'xs') + 'Transferring to ' + esc(c.transfer.to) + '…</span>';
    if (c.transfer && c.transfer.state === 'done' && !C.active(c)) return '<span class="cs cs--ended">' + V.icon('phone-forwarded', 'xs') + 'Transferred to ' + esc(c.transfer.to) + '</span>';
    if (c.recent) return V.ui.statusTag('callResult', c.recent.result);
    if (c.kind === 'browser' && c.state === 'dialling') return '<span class="cs cs--dialling">' + V.icon('monitor', 'xs') + 'Connecting…</span>';
    if (c.state === 'ringing' || c.state === 'dialling') { var s = V.CALL_STATE[c.state]; return '<span class="cs cs--' + s[2] + '">' + V.icon(s[1], 'xs') + s[0] + (c.stale ? '' : ' <span class="cs-t num" role="timer" data-ck-timer="' + c.id + '" data-ck-mode="state">' + CK.tc(C.inState(c)) + '</span>') + '</span>'; }
    var html = V.ui.callState(c.state, { pulse: c.state === 'live' && c.pulse && !CK.rm() });
    if (c.state === 'live') c.pulse = false;
    return html;
  }
  function stepper(c) {
    if (c.recent) return '';
    var T = c.stateTimes, steps = c.kind === 'browser' ? [['dialling', 'Connecting'], ['live', 'Live'], ['ended', 'Ended']] : [['dialling', 'Dialling'], ['ringing', 'Ringing'], ['live', 'Live'], ['wrapup', c.mine && c.kind === 'real' ? 'Wrap-up' : 'Ended']];
    var terminal = ['no_answer', 'busy', 'voicemail', 'failed'].indexOf(c.state) >= 0, order = steps.map(function (s) { return s[0]; });
    var cur = c.state === 'hold' ? 'live' : c.state === 'ended' ? (c.kind === 'browser' ? 'ended' : 'wrapup') : c.state;
    var ci = order.indexOf(cur), html = '';
    steps.forEach(function (s, i) {
      if (terminal && T[s[0]] == null) { if (!html.match(/ck-term/)) html += '<li class="now ck-term" aria-current="step">' + V.ui.callState(c.state) + '<span class="stepper-t">' + CK.tc(C.elapsed(c)) + '</span></li>'; return; }
      var fin = c.state === 'wrapup' || c.state === 'ended', done = !terminal && (i < ci || fin), now = !terminal && !fin && i === ci, t = T[s[0]] != null ? T[s[0]] : (fin && (s[0] === 'wrapup' || s[0] === 'ended') ? (T.wrapup != null ? T.wrapup : T.ended) : null);
      html += '<li class="' + (done || (terminal && t != null) ? 'done' : now ? 'now' : '') + '"' + (now ? ' aria-current="step"' : '') + '><span class="stepper-dot"' + (now ? ' data-mark' : '') + '></span>' + s[1] + '<span class="stepper-t">' + (t != null ? CK.tc(t) : 'next') + '</span></li>';
    });
    return '<ol class="stepper' + (steps.length === 3 ? ' ck-stepper-3' : '') + '" aria-label="Call progress">' + html + '</ol>';
  }
  function who(c) {
    if (c.kind === 'browser') return '<div class="call-who">' + V.ui.avatar('Vaani', { kind: 'voice', size: 32, tile: 'Va' }) + '<span class="ck-who"><h2 class="call-who-name" id="ck-call-h" tabindex="-1" data-focus-target><span class="sr-only">Browser test with </span><span translate="no">Vaani</span></h2><span class="u-fg-2 type-meta-12">You’re the caller</span></span></div>';
    var name = c.lead ? c.lead.name : c.who, ph = c.phoneTyped ? '<span class="phone-text" translate="no">' + esc(c.phoneTyped) + '</span>' : c.lead ? V.ui.phoneText(c.lead.phone) : c.phoneMasked ? V.ui.phoneText(c.phoneMasked) : '';
    return '<div class="call-who">' + (c.lead ? V.ui.avatar(name, { size: 32 }) : '<span class="av av--32" aria-hidden="true">' + V.icon(c.kind === 'test' ? 'smartphone' : 'phone', 'sm') + '</span>') + '<span class="ck-who"><h2 class="call-who-name" id="ck-call-h" tabindex="-1" data-focus-target><span class="sr-only">Call with </span><span translate="no">' + esc(name) + '</span></h2>' + ph + '</span></div>';
  }
  function tags(c) {
    var t = CK.kindTag(c.kind);
    if (c.kind === 'real' && c.recording && c.stateTimes.live != null && !c.recent) t += '<span class="tag tag--outline">' + V.icon('circle-dot', 'xs') + 'Recording · disclosed ' + CK.tc(c.stateTimes.live + 1) + '</span>';
    if (c.takenOver && C.active(c)) t += '<span class="tag">' + V.icon('headphones', 'xs') + 'You’re talking</span>';
    return t;
  }
  function flowLine(c) { return (c.kind === 'browser' ? 'Browser test' : c.direction === 'inbound' ? 'Inbound' : 'Outbound') + ' · <span translate="no">' + esc(c.flow.name) + '</span> ' + (c.flow.draft ? 'Draft v' : 'v') + c.flow.version; }
  function head(c) {
    /* Not a live region (CK §4.5 "Never timers"): the tag holds the time-in-state timer, and state words are announced once,
       debounced, through the shell announcer (CK.announceState in C.setState). */
    return '<div class="call-head" id="ck-call-head"><div class="call-head-row"><span class="ck-cs" id="ck-cs">' + stateTag(c) + '</span><span class="call-head-flow">' + flowLine(c) + '</span>' +
      (c.stale ? '' : '<span class="call-timer" role="timer" data-ck-timer="' + c.id + '">' + CK.tc(C.elapsed(c)) + '</span>') + '</div>' +
      (c.stale ? '<p class="call-stale">' + V.icon('triangle-alert', 'sm') + ' No update for 60 s · <button type="button" class="btn btn--link" data-cc="check"' + (st.online ? '' : offAttr('You’re offline. Check the status when you reconnect.')) + '>Check status</button></p>' : '') +
      '<div class="call-head-row">' + who(c) + '<span class="ck-tags">' + tags(c) + '</span></div>' + stepper(c) + '</div>';
  }
  function captured(c) { var n = c.captured.filter(function (k) { return k.value; }).length; return { n: n, of: c.captured.length }; }

  /* ---------- the details blocks (disclosure on phones) ---------- */
  function blocks(c) {
    var active = C.active(c), live = c.state === 'live', cap = captured(c), v = CK.voiceById(c.voiceId), html = '';
    if (!st.online && c.kind !== 'browser' && active) html += '<div class="notice notice--warning notice--multi" role="status">' + V.icon('cloud-off') + '<div class="notice-body">You’re offline. The call continues on the phone line. The transcript catches up when you reconnect.</div></div>';
    if (c.kind === 'browser' && active) html += '<div class="ck-mic">' + '<span class="ck-mic-l">Your microphone</span><span class="lvl ck-lvl" role="meter" aria-label="Microphone level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (c.muted ? 0 : 60) + '" id="ck-mic-meter"><i></i><i></i><i></i><i></i></span><span class="type-meta-12 u-fg-3">' + (c.muted ? 'Muted' : 'We can hear you') + '</span></div>';
    if (live && c.kind !== 'browser') html += '<section class="ck-block" aria-labelledby="ck-talk-h"><div class="ck-block-head"><h3 class="ck-h3" id="ck-talk-h">Talk</h3><span class="type-meta-12 u-fg-3">Agent above · caller below</span></div><div class="talk ck-talk-strip" role="img" id="ck-talk"><div class="talk-lane talk-lane--agent" id="ck-lane-a"></div><div class="talk-lane talk-lane--caller" id="ck-lane-c"></div></div><div class="talk-legend" id="ck-talk-leg"></div></section>';
    if (c.step && active) {
      var tile = { trigger: 'gt--ink', logic: 'gt--line', action: 'gt--tint', outcome: 'gt--success' }[c.step.phase];
      html += '<section class="ck-block" aria-labelledby="ck-now-h"><h3 class="ck-h3 sr-only" id="ck-now-h">Now in the flow</h3><div class="ck-now"><span class="gt ' + tile + '" aria-hidden="true">' + V.icon(c.step.glyph, 'sm') + '</span><div class="ck-now-t"><span class="type-meta-12 u-fg-3">Now in <span translate="no">' + esc(c.flow.name) + '</span> v' + c.flow.version + ' · step ' + c.step.no + ' of ' + c.step.of + '</span><span class="type-title-14">' + esc(c.step.label) + '</span>' +
        (c.takenOver ? '<span class="status status--plain">' + V.icon('pause', 'sm') + 'Vaani is paused</span>' : '') + '</div><a class="ck-link" href="flow-designer.html?flow=' + esc(c.flow.id) + '&amp;node=' + esc(c.step.node) + '" target="_blank" rel="noopener">Open in flow' + CK.srOpenNew + '</a></div></section>';
    }
    var line = c.kind === 'browser' ? 'Your connection' : 'Line';
    html += '<dl class="kv ck-facts"><div class="kv-row"><dt>Voice</dt><dd translate="no">' + esc(CK.voiceLine(v)) + '</dd></div>' +
      (active ? '<div class="kv-row"><dt>' + line + '</dt><dd>' + (st.online || c.kind === 'browser' ? '<button type="button" class="lq lq--' + c.line.level + '" aria-label="' + line + ' quality: Good, ' + c.line.rtt + ' milliseconds" data-tooltip="Round trip ' + c.line.rtt + ' ms · no packet loss"><span class="lq-bars" aria-hidden="true" data-mark><i></i><i></i><i></i></span><span class="lq-word">Good</span><span class="lq-ms">' + c.line.rtt + '&nbsp;ms</span></button>' : '<span class="lq lq--reconnecting"><span class="lq-word">Reconnecting…</span></span>') + '</dd></div>' : '') +
      '<div class="kv-row"><dt>Cost</dt><dd class="num">' + (c.kind === 'browser' ? 'Not billed · browser tests are free' : !C.connected(c) ? (active ? '₹0 · billing starts when the call is answered' : '₹0 · not billed') : '<span data-ck-cost="' + c.id + '">' + CK.money(C.billed(c) * CK.RATE) + '</span>&nbsp;' + (active ? 'so far · ' : '· ') + '₹' + CK.RATE.toFixed(2) + '/s') + '</dd></div>' +
      (c.kind !== 'browser' ? '<div class="kv-row"><dt>Caller ID</dt><dd>' + V.ui.phoneText(CK.D.org.callerId.masked) + '</dd></div>' : '') + '</dl>';
    if (c.kind !== 'browser' || c.captured.some(function (k) { return k.value; })) html += '<section class="ck-block" aria-labelledby="ck-cap-h"><div class="ck-block-head"><h3 class="ck-h3" id="ck-cap-h">Captured so far</h3><span class="type-meta-12 u-fg-3 num">' + cap.n + ' of ' + cap.of + '</span></div><dl class="kv kv--rows">' +
      c.captured.map(function (k) { return '<div class="kv-row"><dt>' + esc(k.key) + '</dt><dd>' + (k.value ? esc(k.value) : '<span class="kv-empty">' + (active ? 'Waiting for an answer…' : 'Not captured') + '</span>') + '</dd></div>'; }).join('') + '</dl></section>';
    if (c.lead) { var r = CK.newcall.leadRows(c.lead); html += '<details class="ck-details"><summary><span>Lead details · ' + r.count + ' from Leads</span>' + V.icon('chevron-down', 'sm', { className: 'ck-chev' }) + '</summary><div class="ck-details-body">' + r.html + '<a class="ck-link" href="leads.html?lead=' + esc(c.lead.id) + '" target="_blank" rel="noopener">Open lead' + CK.srOpenNew + '</a></div></details>'; }
    return html;
  }
  /* ---------- wrap-up, test ended, recent ---------- */
  /* Outcome options: the flow’s Outcome steps plus the call results (CK §7.10). "Talked" is the result of a call that was
     answered but ended before the flow’s Outcome step (the operator pressed End call early); it maps to Contacted. */
  var OUT = ['Visit booked', 'Interested', 'Callback', 'Talked', 'Not interested', 'No answer', 'Busy', 'Voicemail', 'Transferred', 'Failed', 'Do not call'];
  var MAP = { 'Visit booked': 'converted', Interested: 'interested', Callback: 'callback_due', Talked: 'contacted', 'Not interested': 'not_interested', 'No answer': 'not_reached', Busy: 'not_reached', Voicemail: 'not_reached', Transferred: 'contacted', Failed: 'not_reached', 'Do not call': 'do_not_call' };
  var TERM = { no_answer: 'No answer', busy: 'Busy', voicemail: 'Voicemail', failed: 'Failed' };
  /* A value that isn’t an option falls back to the first option, so the form always renders. */
  function pick(opts, val) { return opts.filter(function (o) { return o[0] === val; })[0] || opts[0]; }
  function sel(id, label, opts, val, hint) {
    var cur = pick(opts, val);
    return '<div class="field"><span class="field-label" id="' + id + '-l">' + label + '</span><button type="button" class="select" data-select aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v" id="' + id + '" data-value="' + esc(cur[0]) + '"' + (hint ? ' aria-describedby="' + id + '-h"' : '') + '><span class="select-value" id="' + id + '-v">' + esc(cur[1]) + '</span>' + V.icon('chevron-down') + '</button>' +
      '<div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === cur[0]) + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div>' + (hint ? '<p class="field-hint" id="' + id + '-h">' + hint + '</p>' : '') + '</div>';
  }
  /* Set a rendered Select’s value in place (no re-render, so focus stays where it is). */
  function setSel(id, val) {
    var t = d.getElementById(id), lb = d.getElementById(id + '-lb'); if (!t || !lb) return null;
    var os = CK.$$('[role="option"]', lb), o = os.filter(function (x) { return x.getAttribute('data-value') === val; })[0] || os[0]; if (!o) return null;
    os.forEach(function (x) { x.setAttribute('aria-selected', x === o ? 'true' : 'false'); });
    var label = (o.querySelector('.option-label') || o).textContent.trim(); t.querySelector('.select-value').textContent = label; t.setAttribute('data-value', o.getAttribute('data-value'));
    return label;
  }
  /* Where the pre-filled outcome came from (CK §3.6): the flow’s Outcome step, the transfer, or the call result. */
  function outPrefill(c) { return TERM[c.state] || c.outcome || 'Talked'; }
  function outHint(c) {
    var src = TERM[c.state] ? 'call' : c.outcome === 'Transferred' ? 'transfer' : c.outcomeFrom === 'flow' ? 'flow' : 'call', orig = outPrefill(c);
    if (c.wrap && c.wrap.outcome && c.wrap.outcome !== orig) return 'Changed by you · ' + { flow: 'the flow set ', call: 'the call result was ', transfer: 'the transfer set ' }[src] + orig;
    return { flow: 'From the flow', call: 'From the call result', transfer: 'From the transfer' }[src];
  }
  /* Network actions are aria-disabled offline with the reason (CK §4.1); the delegated click handler announces it. */
  function offAttr(reason) { return ' aria-disabled="true" data-tooltip="' + esc(reason) + '"'; }
  /* The summary follows what actually happened: nothing said → "Summary unavailable" (CK §3.6); ended early → what was said. */
  function summaryText(c) {
    var f = c.lead ? c.lead.first : 'The caller', said = c.turns.some(function (t) { return t.speaker === 'caller'; }), cap = function (k) { var x = c.captured.filter(function (y) { return y.key === k; })[0]; return x && x.value; };
    if (c.outcome === 'Transferred') return f + ' asked for a person and was transferred to ' + (c.transfer ? c.transfer.to : 'a rep') + '. Budget and preferred day were captured first.';
    if (c.outcome === 'Visit booked') return f + ' wants to see the ' + (c.lead ? c.lead.unit : '2 BHK') + ' near the metro and booked a site visit for Saturday at 11 am. Budget is up to ₹85 L.';
    if (!said) return null;
    return f + ' answered, and the call ended before the flow reached its outcome.' + (cap('Budget') ? ' Budget is ' + cap('Budget').replace(/^Up/, 'up') + '.' : '') + (cap('Preferred day') ? ' Prefers ' + cap('Preferred day').toLowerCase() + '.' : '');
  }
  function sumReady(c) {
    var t = summaryText(c);
    if (!t) return '<div class="ck-sum"><p class="status status--md status--plain" role="status">' + V.icon('circle-dashed', 'md') + 'Summary unavailable for this call.</p><p class="type-body-14 u-fg-2">' + (c.lead ? esc(c.lead.first) : 'The caller') + ' didn’t say anything before the call ended.</p></div>';
    return '<div class="ck-sum"><p class="status status--md status--success" role="status">' + V.icon('check', 'md') + 'Summary ready</p><p class="type-body-14 u-fg-2">' + esc(t) + '</p><a class="ck-link" href="call-reports.html?call=' + esc(c.id) + '">Open call report</a></div>';
  }
  function wrapHtml(c) {
    var term = TERM[c.state], w2 = c.wrap, out = OUT.indexOf(w2.outcome || outPrefill(c)) >= 0 ? (w2.outcome || outPrefill(c)) : 'Talked', stat = w2.status || MAP[out] || 'contacted';
    var sum = term ? '<p class="status status--md status--plain">' + V.icon(c.state === 'failed' ? 'circle-x' : 'phone-missed', 'md') + esc(c.reason || term) + '</p>'
      : w2.summary === 'pending' ? '<p class="status status--md status--progress" role="status">' + V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Summarising…</p>'
      : sumReady(c);
    return '<section class="ck-wrap" aria-labelledby="ck-wrap-h"><h3 class="ck-card-title" id="ck-wrap-h" tabindex="-1" data-focus-target>Wrap-up</h3>' + sum +
      (w2.error ? '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t save the outcome. <button type="button" class="btn btn--link" data-cc="save">Retry</button></span></div></div>' : '') +
      '<form class="ck-form" id="ck-wrap-form" novalidate>' +
      sel('ck-w-out', 'Outcome', OUT.map(function (o) { return [o, o]; }), out, esc(outHint(c))) +
      (c.lead ? sel('ck-w-st', 'Lead status', Object.keys(V.STATUS.lead).map(function (k) { return [k, V.STATUS.lead[k][0]]; }), stat, w2.statusByYou ? 'Set by you' : 'Matches the outcome') : '') +
      /* Callback date and time: always in the DOM, shown only for Callback, so changing the outcome never re-renders the form */
      '<div class="ck-pair ck-pair--always" id="ck-w-cb"' + (out === 'Callback' ? '' : ' hidden') + '><div class="field"><label class="field-label" for="ck-w-date">Call back on (IST)</label><div class="input"><input type="date" id="ck-w-date" value="' + esc(w2.date || '2026-09-28') + '"></div></div><div class="field"><label class="field-label" for="ck-w-time">Time (IST)</label><div class="input"><input type="time" id="ck-w-time" value="' + esc(w2.time || '18:00') + '"></div></div></div>' +
      '<div class="field"><label class="field-label" for="ck-w-notes">Notes <span class="field-opt">(optional)</span></label><textarea class="textarea" id="ck-w-notes" rows="3">' + esc(w2.notes || '') + '</textarea></div></form>' +
      (!c.lead ? '<p class="form-note">This number isn’t a lead, so the outcome is saved to the call report only.</p>' : '') + '</section>';
  }
  function endedHtml(c) {
    if (c.recent) { var k = c.recent; return '<section class="ck-wrap" aria-labelledby="ck-ended-h"><h3 class="ck-h3" id="ck-ended-h">Summary</h3><p class="type-body-14 u-fg-2">' + esc(k.summary || 'No summary for this call.') + '</p><dl class="kv"><div class="kv-row"><dt>Outcome</dt><dd>' + V.ui.statusTag('outcome', k.outcome) + '</dd></div><div class="kv-row"><dt>Duration</dt><dd class="num">' + esc(V.fmt.duration(k.durationSec) || 'Not answered') + '</dd></div><div class="kv-row"><dt>Sentiment</dt><dd>' + V.ui.statusTag('sentiment', k.sentiment) + '</dd></div></dl><a class="ck-link" href="call-reports.html?call=' + esc(k.id) + '">Open call report</a></section>'; }
    var test = c.kind !== 'real';
    return '<section class="ck-wrap" aria-labelledby="ck-ended-h"><h3 class="ck-card-title" id="ck-ended-h" tabindex="-1" data-focus-target>' + (test ? 'Test ended · ' + CK.tc(C.elapsed(c)) : 'Call ended · ' + CK.tc(C.elapsed(c))) + '</h3>' +
      '<p class="type-body-14 u-fg-2">' + (test ? 'Not counted in reports. ' + (c.kind === 'browser' ? 'Stored as one conversation, tagged Test.' : 'Lead status was not changed.') : (c.outcomeFrom === 'flow' ? 'Vaani wrote the outcome from the flow: ' : 'Outcome from the call result: ') + esc(c.outcome || 'Talked') + '.') + '</p>' +
      '<a class="ck-link" href="call-reports.html?call=' + esc(c.id) + '">Open call report</a></section>';
  }
  function controls(c) {
    var b = function (a, cls, icon, label, extra) { return '<button type="button" class="btn ' + (cls || '') + '" data-cc="' + a + '"' + (extra || '') + '>' + V.icon(icon) + label + '</button>'; };
    if (c.recent) return b('again', 'btn--primary', 'phone', 'Call again…');
    /* Offline, a phone call keeps going on the line, but nothing that needs the server can be sent (CK §4.1). */
    var off = !st.online && c.kind !== 'browser', offCall = off ? offAttr('You’re offline. The call continues on the phone line. Try again when you reconnect.') : '';
    if (C.active(c)) {
      var endBtn = b('end', 'btn--danger ck-end', 'phone-off', c.kind === 'browser' ? 'End test' : 'End call', offCall);
      if (c.kind === 'browser') return b('mute', '', c.muted ? 'mic-off' : 'mic', c.muted ? 'Unmute' : 'Mute', ' aria-pressed="' + !!c.muted + '"') + endBtn;
      if (c.state !== 'live' || (c.transfer && c.transfer.state === 'pending')) return endBtn;
      var micBad = st.mic === 'blocked' || st.mic === 'none', mb = off ? offCall : micBad ? ' aria-disabled="true" data-tooltip="Microphone blocked. Allow it in your browser’s site settings, then Retry."' : '';
      /* Taken over, the bar holds Hand back, Mute and End call; Transfer… moves into ⋯ (as it does on phones) so End call keeps its row. */
      return (c.takenOver ? b('takeover', '', 'bot', 'Hand back', ' id="ck-cc-handback" aria-label="Hand back to Vaani" data-tooltip="Hand back to Vaani"') + b('mute', '', c.muted ? 'mic-off' : 'mic', c.muted ? 'Unmute' : 'Mute', ' aria-pressed="' + !!c.muted + '" data-kbd="m"') : b('takeover', '', 'headphones', 'Take over', ' aria-pressed="false" id="ck-cc-takeover"' + mb)) +
        (c.takenOver ? '' : b('transfer', 'u-hide-phone', 'phone-forwarded', 'Transfer…', ' aria-haspopup="dialog" aria-expanded="false" id="ck-cc-transfer"' + offCall)) +
        '<button type="button" class="ibtn ibtn--secondary' + (c.takenOver ? '' : ' u-only-phone') + '" aria-label="More call controls" aria-haspopup="menu" aria-controls="ck-bar-menu" aria-expanded="false">' + V.icon('ellipsis') + '</button>' + endBtn;
    }
    if (c.wrap && c.mine && c.kind === 'real') return (TERM[c.state] ? b('retry', '', 'phone', 'Try again…') : '') + '<span class="u-ml-auto"></span>' + '<button type="button" class="btn btn--tertiary" data-cc="skip">Skip</button>' + '<button type="button" class="btn btn--primary" data-cc="save"' + (c.wrap.saving ? ' aria-busy="true"' : off ? offAttr('You’re offline. Save the outcome when you reconnect.') : '') + '>' + (c.wrap.saving ? V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Saving…' : 'Save') + '</button>';
    if (c.kind === 'test' || c.kind === 'browser') return b('talk', '', 'mic', 'Talk in browser') + b('callself', 'btn--primary', 'phone', 'Call my phone…');
    return b('new', '', 'plus', 'New call');
  }

  /* ---------- render and update ---------- */
  CV.render = function (c, o) {
    init(); o = o || {};
    var card = d.getElementById('ck-card'), a = d.activeElement, keep = o.keepFocus || (a && card.contains(a) ? a.getAttribute('data-cc') || a.id : null);
    var name = c.kind === 'browser' ? 'Browser test' : 'Call with ' + (c.lead ? c.lead.name : c.who);
    card.removeAttribute('aria-labelledby'); card.setAttribute('aria-label', name);
    var cap = captured(c), open = card.getAttribute('data-more') === 'true', active = C.active(c);
    var ended = !active && !(c.wrap && c.mine && c.kind === 'real');
    card.innerHTML = '<div class="ck-call-top">' + head(c) +
      (active && c.kind !== 'browser' ? '<p class="u-only-phone ck-leave-note">' + V.icon('info', 'sm') + 'The call continues if you leave this page. Open it again from Cockpit.</p>' : '') +
      '<div class="seg seg--full ck-panes" role="radiogroup" aria-label="Show"><button type="button" role="radio" aria-checked="' + (st.pane === 'call') + '" data-value="call">Call</button><button type="button" role="radio" aria-checked="' + (st.pane === 'transcript') + '" data-value="transcript">Transcript<span class="vtab-count" id="ck-new-count">' + (c.newTurns ? ' (' + c.newTurns + ' new)' : '') + '</span></button></div>' +
      (active ? '<button type="button" class="ck-disc u-only-phone" id="ck-more-btn" aria-expanded="' + open + '" aria-controls="ck-call-more"><span class="ck-disc-t">Call details</span><span class="ck-disc-v">' + (c.step ? 'step ' + c.step.no + ' of ' + c.step.of + ' · ' : '') + cap.n + ' of ' + cap.of + ' captured</span>' + V.icon('chevron-down', 'sm', { className: 'ck-chev' }) + '</button>' : '') + '</div>' +
      '<div class="ck-card-scroll" id="ck-call-scroll"><div class="ck-pad ck-call-body">' +
        (active ? '' : (c.wrap && c.mine && c.kind === 'real' ? wrapHtml(c) : endedHtml(c))) +
        '<div class="ck-call-more" id="ck-call-more">' + blocks(c) + '</div></div></div>' +
      '<div class="ck-foot ck-controls" role="toolbar" aria-label="Call controls">' + controls(c) + '</div>';
    card.setAttribute('data-ended', ended ? 'true' : 'false');
    V.initAll(card); CV.talk(c, true); CV.meter(c);
    var seg = card.querySelector('.ck-panes'); seg.addEventListener('vaani:change', function (e) { CK.setPane(e.detail.value); });
    var mb = card.querySelector('#ck-more-btn'); if (mb) mb.addEventListener('click', function () { var op = mb.getAttribute('aria-expanded') !== 'true'; mb.setAttribute('aria-expanded', op); card.setAttribute('data-more', op); });
    var form = card.querySelector('#ck-wrap-form'); if (form) wireWrap(c, form);
    if (keep) { var n = card.querySelector('[data-cc="' + keep + '"]') || card.querySelector('#' + keep) || (keep === 'handback' ? card.querySelector('#ck-cc-handback') : keep === 'takeover' ? card.querySelector('#ck-cc-takeover') : null); if (n) n.focus(); else if (o.stateOnly && card.contains(a) === false && a === d.body) CK.focus(d.getElementById('ck-call-h')); else if (a && !a.isConnected) { var f = card.querySelector('[data-cc="end"]:not([aria-disabled="true"])') || d.getElementById('ck-call-h'); if (f) CK.focus ? CK.focus(f) : f.focus(); } }   /* R3C-07: the control that held focus is gone (Transfer while Transferring…): focus the next logical control, never <body> */
    CK.title(c.recent ? 'Call ended' : c.kind === 'browser' && active ? 'Browser test' : { dialling: 'Dialling', ringing: 'Ringing', live: 'Live call', hold: 'On hold', wrapup: 'Wrap-up', ended: 'Call ended', no_answer: 'No answer', busy: 'Busy', voicemail: 'Voicemail', failed: 'Call failed' }[c.state]);
  };
  CV.update = function (c) {
    init();
    if (st.selected !== c.id) return;
    var more = d.getElementById('ck-call-more');
    if (more) { var a = d.activeElement, inside = more.contains(a), det = more.querySelector('details'), was = det && det.open; more.innerHTML = blocks(c); V.initAll(more); var nd = more.querySelector('details'); if (nd && was) nd.open = true; CV.talk(c, true); CV.meter(c); if (inside) CK.focus(d.getElementById('ck-call-h')); }
    var cap = captured(c), mb = d.getElementById('ck-more-btn'); if (mb) mb.querySelector('.ck-disc-v').textContent = (c.step ? 'step ' + c.step.no + ' of ' + c.step.of + ' · ' : '') + cap.n + ' of ' + cap.of + ' captured';
    if (c.wrap && c.wrap.summary === 'ready' && d.querySelector('#ck-wrap-h') && !d.querySelector('.ck-sum')) { var s = d.querySelector('.ck-wrap .status--progress'); if (s) s.outerHTML = sumReady(c); }
    var ctl = d.querySelector('.ck-controls'); if (ctl && C.active(c)) { var mute = ctl.querySelector('[data-cc="mute"]'); if (mute) { mute.setAttribute('aria-pressed', !!c.muted); mute.innerHTML = V.icon(c.muted ? 'mic-off' : 'mic') + (c.muted ? 'Unmute' : 'Mute'); } }
  };
  /* LevelMeter (07-motion §12.5): ≤ 15 fps while your microphone is live; one static level under reduced motion. Simulated input here. */
  var meterT = null;
  CV.meter = function (c) {
    clearInterval(meterT); var m = d.getElementById('ck-mic-meter'); if (!m) return;
    var bars = CK.$$('i', m), k = 0, set = function (v) { bars.forEach(function (b2, j) { b2.style.setProperty('--l', Math.max(0.15, Math.min(1, v * [0.55, 1, 0.8, 0.45][j]))); }); m.setAttribute('aria-valuenow', String(Math.round(v * 10) * 10)); };
    if (c.muted) { set(0); return; } if (CK.rm()) { set(0.6); return; }
    meterT = setInterval(function () { if (!d.contains(m) || c.muted || !C.active(c)) { clearInterval(meterT); return; } k += 1; set(0.35 + 0.6 * Math.abs(Math.sin(k * 0.9) * Math.cos(k * 0.37))); }, 80);
  };
  /* TalkStrip: drawn only from real per-turn timing; its sentence (role="img") updates at most every 10 s. */
  CV.talk = function (c, force) {
    init();
    var la = d.getElementById('ck-lane-a'), lc = d.getElementById('ck-lane-c'); if (!la || !lc) return;
    var total = Math.max(1, C.elapsed(c)) * 1000, ag = 0, ca = 0, seg = function (t) { var s = t.startMs || 0, e = t.final === false ? (CK.sec() - c.start) * 1000 : Math.max(t.endMs || 0, s + Math.max(1500, String(t.text).length * 65)); return [s, Math.max(s + 400, e)]; };
    var ha = '', hc = '';
    c.turns.forEach(function (t) { if (t.speaker === 'system') return; var r = seg(t), x = '<i' + (t.final === false ? ' class="is-partial"' : '') + ' data-l="' + (r[0] / total * 100).toFixed(2) + '" data-w="' + ((r[1] - r[0]) / total * 100).toFixed(2) + '"></i>'; if (t.speaker === 'caller') { hc += x; ca += r[1] - r[0]; } else { ha += x; ag += r[1] - r[0]; } });
    la.innerHTML = ha; lc.innerHTML = hc;
    CK.$$('i[data-l]', la.parentNode).forEach(function (i) { var l = Math.min(99, +i.getAttribute('data-l')); i.style.left = l + '%'; i.style.width = Math.max(0.6, Math.min(+i.getAttribute('data-w'), 100 - l)) + '%'; });
    /* No ratio until someone has spoken: 0 + 0 is not "Caller 100%". */
    var leg = d.getElementById('ck-talk-leg'), strip = d.getElementById('ck-talk'), now = Date.now(), spoke = ag + ca > 0, was = strip.getAttribute('data-spoke') === 'true';
    if (!spoke) { leg.innerHTML = '<span class="u-fg-3">No speech yet</span>'; strip.setAttribute('aria-label', 'Talk time: no speech yet'); strip.setAttribute('data-spoke', 'false'); return; }
    var ap = Math.round(ag / (ag + ca) * 100), ints = (c.talk.interruptions || 0) + ' interruption' + (c.talk.interruptions === 1 ? '' : 's'), sentence = 'Agent ' + ap + '% · Caller ' + (100 - ap) + '% · ' + ints;
    leg.innerHTML = '<span><i class="talk-sw talk-sw--agent" data-mark></i>Agent ' + ap + '%</span><span><i class="talk-sw talk-sw--caller" data-mark></i>Caller ' + (100 - ap) + '%</span><span>' + ints + '</span>';
    strip.setAttribute('data-spoke', 'true');
    if (force || !was || !c.talkAt || now - c.talkAt > 10000) { c.talkAt = now; strip.setAttribute('aria-label', 'Talk time: ' + sentence.replace(/ · /g, ', ')); }
  };

  /* ---------- wrap-up behaviour ---------- */
  /* The Outcome Select updates its dependants in place (Lead status, the Callback date and time, its own hint). The form is
     never re-rendered here, so the Select can return focus to its trigger (WCAG 2.4.3). */
  function wireWrap(c, form) {
    var out = d.getElementById('ck-w-out');
    out.addEventListener('vaani:change', function (e) {
      if (!c.wrap) return;
      var v = e.detail.value; c.wrap.outcome = v; c.wrap.status = MAP[v] || 'contacted'; c.wrap.statusByYou = false;
      var stLabel = setSel('ck-w-st', c.wrap.status), sh = d.getElementById('ck-w-st-h'); if (sh) sh.textContent = 'Matches the outcome';
      var cb = d.getElementById('ck-w-cb'); if (cb) cb.hidden = v !== 'Callback';
      var oh = d.getElementById('ck-w-out-h'); if (oh) oh.textContent = outHint(c);
      if (stLabel) V.announce('Lead status set to ' + stLabel + '.' + (v === 'Callback' ? ' Choose when to call back.' : ''));
    });
    var stEl = d.getElementById('ck-w-st'); if (stEl) stEl.addEventListener('vaani:change', function (e) { if (!c.wrap) return; c.wrap.status = e.detail.value; c.wrap.statusByYou = true; var sh = d.getElementById('ck-w-st-h'); if (sh) sh.textContent = 'Set by you'; });
    /* keep what was typed across any later re-render (offline, a failed save) */
    form.addEventListener('input', function (e) { if (!c.wrap) return; var id = e.target.id; if (id === 'ck-w-notes') c.wrap.notes = e.target.value; else if (id === 'ck-w-date') c.wrap.date = e.target.value; else if (id === 'ck-w-time') c.wrap.time = e.target.value; });
  }
  CV.save = function (c) {
    init();
    if (c.wrap.saving) return;
    c.wrap.notes = (d.getElementById('ck-w-notes') || {}).value; c.wrap.saving = true; c.wrap.error = false;
    /* R3C-08: Retry removes the InlineError first (as Rep console does), so progress is never announced as an alert */
    var err = d.querySelector('#ck-card .ierr'), wasRetry = !!(err && err.contains(d.activeElement)); if (err) err.remove();
    var btn = d.querySelector('#ck-card .ck-controls [data-cc="save"]') || d.querySelector('[data-cc="save"]'); if (wasRetry && btn) btn.focus(); if (btn) { btn.setAttribute('aria-busy', 'true'); btn.innerHTML = V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Saving…'; }
    setTimeout(function () {
      c.wrap.saving = false;
      if (CK.has('save-fail') && !c.wrap.failedOnce) { c.wrap.failedOnce = true; c.wrap.error = true; CV.render(c, { keepFocus: 'save' }); return; }   /* the InlineError (role=alert) is the one announcement (R2C-07 family) */
      c.wrap = null; c.state = 'ended'; c.saved = true;
      var lead = c.lead;
      V.toast.success(lead ? 'Saved to ' + lead.name : 'Saved to the call report', lead ? { action: { label: 'Open lead', onClick: function () { w.location.href = 'leads.html?lead=' + lead.id; } } } : {});
      CK.newcall.setTarget(null, { silent: true }); CK.select('new', { focus: true }); CK.list.render();
    }, 800);
  };

  /* ---------- TransferPicker (CK §7.8) ---------- */
  CV.openTransfer = function (c, trigger) {
    init();
    var pop = d.getElementById('ck-transfer');
    pop.innerHTML = '<div class="pop-head"><h2 class="pop-title" id="ck-tr-t">Transfer the call</h2><button type="button" class="ibtn ibtn--sm" data-popover-close aria-label="Close">' + V.icon('x', 'sm') + '</button></div>' +
      '<div class="pop-body"><fieldset class="fieldset"><legend>Available reps</legend>' +
      '<label class="check"><input type="radio" class="radio" name="ck-tr" value="Rohit S." checked><span class="check-text"><span translate="no">Rohit S.</span><span class="check-desc">' + V.icon('circle-dot', 'xs') + ' Available · Rep console</span></span></label>' +
      '<label class="check"><input type="radio" class="radio" name="ck-tr" value="Farah K." disabled aria-describedby="ck-tr-busy"><span class="check-text"><span translate="no">Farah K.</span><span class="check-desc" id="ck-tr-busy">On call · can’t take a transfer</span></span></label>' +
      '<label class="check"><input type="radio" class="radio" name="ck-tr" value="number"><span class="check-text">A phone number</span></label></fieldset>' +
      '<div class="field" id="ck-tr-num" hidden><label class="field-label" for="ck-tr-in">Phone number</label><div class="input"><span class="input-prefix">+91</span><input id="ck-tr-in" inputmode="tel" autocomplete="off" placeholder="98765 43210" aria-describedby="ck-tr-note"></div></div>' +
      '<p class="form-note" id="ck-tr-note">Transfers to a phone are billed at ₹0.04/s.</p></div>' +
      '<div class="pop-foot"><button type="button" class="btn btn--tertiary" data-popover-close>Cancel</button><button type="button" class="btn btn--primary" id="ck-tr-go">Transfer</button></div>';
    pop.setAttribute('aria-labelledby', 'ck-tr-t');
    CK.$$('input[name="ck-tr"]', pop).forEach(function (r) { r.addEventListener('change', function () { d.getElementById('ck-tr-num').hidden = r.value !== 'number' || !r.checked; }); });
    pop.querySelector('#ck-tr-go').addEventListener('click', function () {
      var v = pop.querySelector('input[name="ck-tr"]:checked').value, to = v;
      if (v === 'number') { var n = CK.newcall.parseNumber(d.getElementById('ck-tr-in').value); if (!n) { V.announce('Enter a 10-digit mobile number, like 98765 43210.'); d.getElementById('ck-tr-in').focus(); return; } to = n.display; }
      var go = pop.querySelector('#ck-tr-go'); go.setAttribute('aria-busy', 'true'); go.innerHTML = V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Transferring…';
      setTimeout(function () { V.popover.close('ck-transfer'); C.transfer(c, to); }, 600);
    });
    V.popover.open(trigger, 'ck-transfer', { placement: 'top-start', modal: true });
  };
})(window, document);
