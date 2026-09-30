/* Vaani Labs prototype · Rep console · views (03-pages/01-agent-cockpit.md §5.5–5.7, §7.11–7.12): AvailabilityControl and
   AvailabilityTag, the inline readiness (GateChecklist collapse="passing"), Audio devices (MicCheck), IncomingCallCard, the
   rep CallHeader with two LineQuality legs, notes, WrapUpForm variant="rep", and the context column. */
(function (w, d) {
  'use strict';
  var RC = w.VaaniRep = w.VaaniRep || {};
  var RV = RC.view = {};
  var V, esc;
  function init() { V = w.Vaani; esc = V.util.esc; }
  RV.tc = function (s) { return V.fmt.timecode(Math.max(0, Math.floor(s))); };

  /* Live regions: the softphone is re-rendered as a whole on every presence change, so no live region lives inside this
     markup (a re-inserted region re-announces, and the tag’s timer would be read every tick, CK §4.5, G §4.7). State words
     are announced once per change by rep-console.js through the shell announcer (V.announce); ringing uses its one
     assertive announcement (§5.10). An InlineError carries role="alert" only on the render where it first appears. */

  /* AvailabilityTag (§5.3): the words and tones of the presence machine */
  RV.tag = function (R) {
    var p = R.presence;
    if (p === 'loading') return '<span class="sk-line"><span class="sk sk--title rc-sk-tag"></span></span>';
    if (p === 'connecting') return '<span class="tag tag--info tag--lg">' + V.icon('loader-circle', 'xs', { className: 'spinner' }) + 'Connecting…</span>';
    if (p === 'available') return '<span class="tag tag--success tag--lg"><span class="live-dot" data-mark></span>Available</span>';
    if (p === 'ringing' || p === 'answering') return '<span class="cs cs--ringing">' + V.icon('phone-call', 'xs') + 'Ringing… <span class="cs-t num" data-rc-timer="state">' + RV.tc(RC.inState()) + '</span></span>';
    if (p === 'oncall') return '<span class="cs cs--live"><span class="live-dot' + (R.call && R.call.pulse && !V.reducedMotion() ? ' live-dot--pulse' : '') + '" data-mark></span>Live</span>';   /* R2C-14: the call timer sits once, beside the tag (CK §5.5), as in Cockpit */
    if (p === 'hold') return '<span class="cs cs--hold">' + V.icon('pause', 'xs') + 'On hold <span class="cs-t num" data-rc-timer="state">' + RV.tc(RC.inState()) + '</span></span>';
    if (p === 'wrapup') return '<span class="cs cs--wrapup">' + V.icon('clipboard-check', 'xs') + 'Wrap-up</span>';
    if (p === 'dropped') return '<span class="cs cs--failed">' + V.icon('circle-x', 'xs') + 'Call dropped</span>';
    return '<span class="tag tag--lg">' + V.icon('circle-dot', 'xs') + 'Offline</span>';
  };

  /* ---------- readiness rows (G §5.1 inline additions: call_channel, microphone, speaker, notifications, connection) ---------- */
  RV.rows = function (R) {
    var rows = [], add = function (r) { rows.push(r); };
    if (R.route === 'pstn') add({ id: 'call_channel', kind: 'blocking', text: 'Transfers ring the phone (PSTN), not this page.', meta: R.role === 'admin' ? 'Call channel: Phone (PSTN)' : 'Ask an admin to set the call channel to Browser.', act: R.role === 'admin' ? { label: 'Change in Phone setup', href: 'settings.html#phone' } : { label: 'Ask an admin', run: 'ask-admin' } });
    else add({ id: 'call_channel', kind: 'pass', text: 'Transfers ring here · Call channel: Browser' });
    if (R.mic === 'blocked') add({ id: 'microphone', kind: 'blocking', text: "Microphone blocked. Allow it in your browser’s site settings, then Retry.", act: { label: 'Retry', run: 'retry-mic' }, info: true });
    else if (R.mic === 'none') add({ id: 'microphone', kind: 'blocking', text: 'No microphone found. Connect a headset, then Retry.', act: { label: 'Retry', run: 'retry-mic' } });
    else if (R.mic === 'granted') add({ id: 'microphone', kind: 'pass', text: 'Microphone allowed · ' + R.micDevice });
    else add({ id: 'microphone', kind: 'advisory', text: 'Asks for your microphone when you go available' });
    if (R.sink) add({ id: 'speaker', kind: 'pass', text: 'Speaker · ' + (R.mic === 'granted' ? R.spkDevice : 'system default') });
    else add({ id: 'speaker', kind: 'advisory', text: 'Your browser plays calls through the system speaker' });
    if (R.notif === 'on') add({ id: 'notifications', kind: 'pass', text: 'Notifications on · they never show a name or number' });
    else add({ id: 'notifications', kind: 'advisory', text: 'Notifications off', meta: 'Hear about transfers when this tab is hidden.', act: { label: 'Turn on', run: 'notif' } });
    if (['available', 'ringing', 'answering', 'oncall', 'hold'].indexOf(R.presence) >= 0) add({ id: 'connection', kind: 'pass', text: 'Connected · ' + (R.reconnecting ? 'reconnecting' : '120 ms') });
    var ORDER = { blocking: 0, unknown: 1, advisory: 5, pass: 6 };
    return rows.sort(function (a, b) { return ORDER[a.kind] - ORDER[b.kind]; });
  };
  var MARK = { pass: ['pass', 'check', 'Passed: '], blocking: ['block', 'x', 'Blocking: '], advisory: ['advisory', 'info', 'Note: '] };
  function row(r) {
    var m = MARK[r.kind], act = r.act ? (r.act.href ? '<a class="gate-act" href="' + esc(r.act.href) + '">' + esc(r.act.label) + '</a>' : '<button type="button" class="btn btn--link gate-act" data-rc-act="' + r.act.run + '">' + esc(r.act.label) + '</button>') : '';
    return '<li class="gate-row"><span class="gate-mark gate-mark--' + m[0] + '" data-mark aria-hidden="true">' + V.icon(m[1]) + '</span><span class="gate-text"><span class="sr-only">' + m[2] + '</span>' + esc(r.text) + (r.meta ? '<span class="gate-meta">' + esc(r.meta) + '</span>' : '') +
      (r.info ? '<span class="gate-meta"><button type="button" class="btn btn--link" data-popover="rc-mic-pop" aria-haspopup="dialog" aria-expanded="false">How to allow it</button></span>' : '') + '</span>' + act + '</li>';
  }
  RV.summary = function (rows) {
    var bl = rows.filter(function (r) { return r.kind === 'blocking'; }).length, adv = rows.filter(function (r) { return r.kind === 'advisory'; }).length;
    if (bl) return ['blocked', 'circle-x', "Can’t go available · " + bl + ' thing' + (bl > 1 ? 's' : '') + ' to fix'];
    if (adv) return ['ok', 'circle-check', 'Ready · ' + adv + ' thing' + (adv > 1 ? 's' : '') + ' to know'];
    return ['ok', 'circle-check', 'All ' + rows.length + ' checks pass'];
  };
  RV.readiness = function (R) {
    if (R.presence === 'loading') return '<section class="rc-block" aria-labelledby="rc-ready-h" aria-busy="true"><h3 class="rc-h3" id="rc-ready-h">Readiness</h3>' + [1, 2, 3].map(function () { return '<div class="rc-sk-row"><span class="sk sk--block rc-sk-mark"></span><span class="sk-line"><span class="sk rc-sk-m"></span></span></div>'; }).join('') + '</section>';
    var rows = RV.rows(R), shown = rows.filter(function (r) { return r.kind !== 'pass'; }), pass = rows.filter(function (r) { return r.kind === 'pass'; }), s = RV.summary(rows), all = R.showAll;
    if (R.presence === 'ringing' || R.presence === 'answering') { shown = []; }
    return '<section class="rc-block rc-ready" aria-labelledby="rc-ready-h"><h3 class="rc-h3" id="rc-ready-h">Readiness</h3><div><p class="gate-sum gate-sum--' + s[0] + '">' + V.icon(s[1], 'sm') + esc(s[2]) + '</p></div>' +
      (shown.length ? '<ul class="gate-list" role="list">' + shown.map(row).join('') + '</ul>' : '') +
      (pass.length ? '<button type="button" class="btn btn--link rc-showall" data-rc-act="show-all" aria-expanded="' + !!all + '" aria-controls="rc-ready-pass">' + (all ? 'Hide passing checks' : 'Show all ' + rows.length + ' checks') + '</button><ul class="gate-list" role="list" id="rc-ready-pass"' + (all ? '' : ' hidden') + '>' + pass.map(row).join('') + '</ul>' : '') + '</section>';
  };

  /* ---------- AvailabilityControl (§7.11) ---------- */
  /* While ringing (wireframe E): the availability line and Go offline stay under the IncomingCallCard, with the same #rc-go id */
  RV.ringAvail = function (R) {
    if (R.presence !== 'ringing') return '';
    return '<section class="rc-block rc-avail" aria-label="Availability"><p class="rc-sentence">You’re available. Going offline stops the ring and Vaani offers a callback.</p>' +
      '<div class="rc-go-row"><button type="button" class="btn" id="rc-go" data-rc-act="go-offline">' + V.icon('circle-dot') + 'Go offline</button></div></section>';
  };
  RV.availability = function (R) {
    var p = R.presence, blocked = RC.blockReason(), btn;
    var sentence = p === 'available' ? 'Transferred calls ring here. Keep this tab open.' : p === 'connecting' ? 'Checking the route, your microphone and the connection…' : p === 'loading' ? 'Checking your setup…' : "Transferred calls don’t ring here while you’re offline.";
    /* One button, one id (#rc-go) in every state, so focus stays on it: Go available → Connecting… (busy) → Go offline (§5.3) */
    if (p === 'available') btn = '<button type="button" class="btn" id="rc-go" data-rc-act="go-offline">' + V.icon('circle-dot') + 'Go offline</button>';
    else if (p === 'connecting') btn = '<button type="button" class="btn btn--primary rc-go" id="rc-go" aria-busy="true" aria-disabled="true">' + V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Connecting…</button>';
    else btn = '<button type="button" class="btn btn--primary rc-go" id="rc-go" data-rc-act="go-available"' + (blocked ? ' aria-disabled="true" aria-describedby="rc-go-why" data-tooltip="' + esc(blocked) + '"' : '') + '>' + V.icon('headphones') + 'Go available</button>';
    var err = R.err ? '<div class="ierr"' + (R.err.said ? '' : ' role="alert"') + '><div class="ierr-line">' + V.icon('circle-alert') + '<span>' + esc(R.err.text) + (R.err.retry ? ' <button type="button" class="btn btn--link" data-rc-act="go-available">Retry</button>' : '') + '</span></div>' +
      (R.err.raw ? '<details class="details"><summary>Details</summary><div class="raw"><code id="rc-raw">' + esc(R.err.raw) + '</code><button type="button" class="ibtn ibtn--sm" data-rc-act="copy-raw" aria-label="Copy details">' + V.icon('copy', 'sm') + '</button></div></details>' : '') + '</div>' : '';
    var info = R.offlineReason && p === 'offline' ? '<p class="status status--md status--plain rc-reason">' + V.icon('info', 'md') + '<span>' + esc(R.offlineReason) + '</span></p>' : '';
    return '<section class="rc-block rc-avail" aria-label="Availability"><div class="rc-tagwrap">' + RV.tag(R) + '</div><p class="rc-sentence">' + sentence + '</p>' + info +
      '<div class="rc-go-row">' + btn + '</div>' + (blocked && p !== 'connecting' && p !== 'available' ? '<p class="status status--warning status--wrap rc-why" id="rc-go-why">' + V.icon('triangle-alert', 'sm') + '<span>' + esc(blocked) + '</span></p>' : '') + err + '</section>';
  };
  RV.missed = function (R) {
    if (!R.missedAt) return '';
    return '<div class="notice notice--warning notice--multi">' + V.icon('triangle-alert') + '<div class="notice-body">' + (R.missed >= 2 ? 'You were set offline after 2 missed transfers. <button type="button" class="notice-act" data-rc-act="go-available">Go available</button>' : 'You missed a transfer at ' + esc(R.missedAt) + '. Vaani offered a callback.') + '</div></div>';
  };
  /* MicCheck (§7.9): devices, a live meter while open, Play test sound, and "We can hear you" only after real input */
  RV.devices = function (R) {
    var ok = R.mic === 'granted', mics = ok ? [['usb', 'Headset (USB)'], ['built-in', 'Built-in microphone']] : [['default', 'Default microphone']], spks = ok ? [['usb', 'Headset (USB)'], ['built-in', 'Built-in speakers']] : [['default', 'Default speaker']];
    var sel = function (id, label, opts, v) { return '<div class="field"><span class="field-label" id="' + id + '-l">' + label + '</span><button type="button" class="select" data-select aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v" id="' + id + '"><span class="select-value" id="' + id + '-v">' + esc(opts.filter(function (o) { return o[1] === v; })[0][1]) + '</span>' + V.icon('chevron-down') + '</button><div class="listbox" role="listbox" id="' + id + '-lb" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + o[1] + '" aria-selected="' + (o[1] === v) + '"><span class="option-main"><span class="option-label">' + o[1] + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div></div>'; };
    return '<details class="rc-details" id="rc-devices"' + (R.devicesOpen ? ' open' : '') + '><summary><span>Audio devices</span><span class="rc-sum-v">' + esc(ok ? R.micDevice : 'Default devices') + '</span>' + V.icon('chevron-down', 'sm', { className: 'rc-chev' }) + '</summary><div class="rc-details-body">' +
      sel('rc-mic', 'Microphone', mics, ok ? R.micDevice : 'Default microphone') + '<div class="rc-meter-row"><span class="lvl rc-lvl" role="meter" aria-label="Microphone level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="rc-meter"><i></i><i></i><i></i><i></i></span><span class="type-meta-12 u-fg-3" id="rc-hear">' + (R.heard ? 'We can hear you' : R.mic === 'granted' ? 'Say something to test it' : 'Allow the microphone to see device names') + '</span></div>' +
      sel('rc-spk', 'Speaker', spks, ok ? R.spkDevice : 'Default speaker') +
      '<div class="rc-inline"><button type="button" class="btn btn--sm" data-rc-act="test-sound"' + (R.testing ? ' aria-busy="true"' : '') + '>' + (R.testing ? V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Playing…' : V.icon('volume-2', 'sm') + 'Play test sound') + '</button></div>' +
      '<div class="slider" data-slider data-suffix="%" data-step="10" id="rc-vol"><div class="slider-row"><span class="field-label" id="rc-vol-l">Ring volume</span><output class="slider-out">' + R.volume + '%</output></div><div class="slider-track"><span class="slider-range"></span><span class="slider-thumb" role="slider" tabindex="0" aria-labelledby="rc-vol-l" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + R.volume + '" aria-valuetext="' + R.volume + '%"></span></div></div>' +
      '</div></details>';
  };
  RV.connDetails = function () { return '<details class="rc-details"><summary><span>Connection details</span>' + V.icon('chevron-down', 'sm', { className: 'rc-chev' }) + '</summary><div class="rc-details-body"><div class="rc-id"><span class="id-text" id="rc-room">rep_room_7f21c0a4</span><button type="button" class="ibtn ibtn--sm" data-rc-act="copy-room" aria-label="Copy connection id">' + V.icon('copy', 'sm') + '</button></div><p class="type-meta-12 u-fg-3">Share this with support if transfers stop ringing.</p></div></details>'; };

  /* ---------- IncomingCallCard (§7.12): no pulse, no shake; the ring is audio ---------- */
  RV.incoming = function (R) {
    var c = R.call, l = c.lead, busy = R.presence === 'answering';
    return '<section class="rc-incoming" aria-labelledby="rc-inc-h"><div class="rc-inc-top"><span>' + RV.tag(R) + '</span><span class="type-meta-12 u-fg-3 u-hide-phone">Answer with ' + V.ui.kbd('mod+enter') + '</span></div>' +
      '<div class="call-who">' + V.ui.avatar(l.name, { size: 32 }) + '<span class="rc-who"><h3 class="call-who-name" id="rc-inc-h" translate="no">' + esc(l.name) + '</h3><span class="rc-who-meta">' + V.ui.phoneText(l.phone, { size: 'sm' }) + ' · ' + V.ui.langMark(l.language, 'full') + '</span></span></div>' +
      '<dl class="kv rc-kv-tight"><div class="kv-row"><dt>Transferred by</dt><dd>Vaani</dd></div><div class="kv-row"><dt>Flow</dt><dd><span translate="no">Site-visit qualifier</span> v7</dd></div><div class="kv-row"><dt>Step</dt><dd>Transfer to sales</dd></div><div class="kv-row"><dt>Reason</dt><dd>“Caller asked for a person”</dd></div></dl>' +
      '<div class="rc-answer u-hide-phone"><button type="button" class="btn btn--primary btn--lg rc-grow" data-rc-act="answer"' + (busy ? ' aria-busy="true"' : '') + ' aria-keyshortcuts="' + (V.util.isMac ? 'Meta+Enter' : 'Control+Enter') + '">' + (busy ? V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Answering…' : V.icon('phone') + 'Answer') + '</button><button type="button" class="btn btn--lg" data-rc-act="decline">Decline</button></div>' +
      '<p class="type-meta-12 u-fg-3">If you don’t answer in 20 s, Vaani continues with: Offer a callback.</p></section>';
  };
  /* ---------- the call (CallHeader + LineQuality legs + notes) ---------- */
  function lq(key, ms, rec) { return '<div class="rc-leg"><span class="lq-key">' + key + '</span>' + (rec ? '<span class="lq lq--reconnecting"><span class="lq-bars" aria-hidden="true" data-mark><i></i><i></i><i></i></span><span class="lq-word">Reconnecting… ' + rec + ' s</span></span>' : '<button type="button" class="lq lq--good" aria-label="' + key + ' quality: Good, ' + ms + ' milliseconds"><span class="lq-bars" aria-hidden="true" data-mark><i></i><i></i><i></i></span><span class="lq-word">Good</span><span class="lq-ms">' + ms + '&nbsp;ms</span></button>') + '</div>'; }
  RV.call = function (R) {
    var c = R.call, l = c.lead;
    return '<section class="rc-call" aria-labelledby="rc-call-h"><div class="call-head"><div class="call-head-row"><span>' + RV.tag(R) + '</span><span class="call-head-flow">Transferred · <span translate="no">Site-visit qualifier</span> v7</span><span class="call-timer" role="timer" data-rc-timer="call">' + RV.tc(RC.callSec()) + '</span></div>' +
      '<div class="call-head-row"><div class="call-who">' + V.ui.avatar(l.name, { size: 32 }) + '<span class="rc-who"><h3 class="call-who-name" id="rc-call-h" tabindex="-1" data-focus-target><span class="sr-only">Call with </span><span translate="no">' + esc(l.name) + '</span></h3>' + V.ui.phoneText(l.phone, { size: 'sm' }) + '</span></div><span class="tag tag--outline">' + V.icon('circle-dot', 'xs') + 'Recording · disclosed 00:10</span>' + (c.muted ? '<span class="tag">' + V.icon('mic-off', 'xs') + 'Muted</span>' : '') + '</div></div>' +
      (R.reconnecting ? '<div class="notice notice--warning">' + V.icon('triangle-alert') + '<div class="notice-body">Your connection is unstable. The caller may hear a gap.</div></div>' : '') +
      '<div class="rc-legs">' + lq('Your connection', 120, R.reconnecting ? 4 : 0) + lq('Phone line', 180, 0) + '</div>' +
      '<div class="field"><div class="rc-notes-head"><label class="field-label" for="rc-notes">Notes <span class="field-opt">(saved to this call)</span></label><span class="save" id="rc-notes-save" hidden></span></div><textarea class="textarea" id="rc-notes" rows="3" placeholder="What to follow up on…">' + esc(c.notes || '') + '</textarea></div></section>';
  };
  RV.dropped = function (R) { return '<section class="rc-call" aria-labelledby="rc-drop-h"><div>' + RV.tag(R) + '</div><h3 class="rc-h3" id="rc-drop-h" tabindex="-1" data-focus-target>The caller was disconnected at ' + esc(R.droppedAt) + '.</h3><p class="type-body-14 u-fg-2"><a class="rc-link" href="cockpit.html?new=1&amp;lead=' + esc(R.call.lead.id) + '">Call back…</a> opens the Call gate in Cockpit.</p></section>'; };
  var OUT = ['Visit booked', 'Interested', 'Callback', 'Not interested', 'Transferred', 'Do not call'];
  RV.wrap = function (R) {
    var c = R.call, out = c.outcome || 'Interested';
    var sel = function (id, label, opts, v) { return '<div class="field"><span class="field-label" id="' + id + '-l">' + label + '</span><button type="button" class="select" data-select aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v" id="' + id + '"><span class="select-value" id="' + id + '-v">' + esc(opts.filter(function (o) { return o[0] === v; })[0][1]) + '</span>' + V.icon('chevron-down') + '</button><div class="listbox" role="listbox" id="' + id + '-lb" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === v) + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div></div>'; };
    var st = { 'Visit booked': 'converted', Interested: 'interested', Callback: 'callback_due', 'Not interested': 'not_interested', Transferred: 'contacted', 'Do not call': 'do_not_call' }[out];
    return '<section class="rc-wrap" aria-labelledby="rc-wrap-h"><div>' + RV.tag(R) + '</div><h3 class="rc-card-title" id="rc-wrap-h" tabindex="-1" data-focus-target>Wrap-up</h3><p class="type-body-14 u-fg-2">You won’t get new transfers until you save or skip.</p>' +
      (c.saveError ? '<div class="ierr"' + (c.saveErrSaid ? '' : ' role="alert"') + '><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t save the outcome. <button type="button" class="btn btn--link" data-rc-act="save-available">Retry</button></span></div></div>' : '') +
      '<form class="rc-form" novalidate>' + sel('rc-w-out', 'Outcome', OUT.map(function (o) { return [o, o]; }), out) +
      sel('rc-w-st', 'Lead status', Object.keys(V.STATUS.lead).map(function (k) { return [k, V.STATUS.lead[k][0]]; }), st) +
      (out === 'Callback' ? '<div class="rc-pair"><div class="field"><label class="field-label" for="rc-w-date">Call back on (IST)</label><div class="input"><input type="date" id="rc-w-date" value="2026-09-28"></div></div><div class="field"><label class="field-label" for="rc-w-time">Time (IST)</label><div class="input"><input type="time" id="rc-w-time" value="18:00"></div></div></div>' : '') +
      '<div class="field"><label class="field-label" for="rc-w-notes">Notes <span class="field-opt">(optional)</span></label><textarea class="textarea" id="rc-w-notes" rows="3">' + esc(c.notes || '') + '</textarea></div></form></section>';
  };

  /* ---------- the context column ---------- */
  RV.turns = function (c) { return '<ol class="rc-turns" aria-label="Transcript">' + c.turns.map(function (t) { return V.ui.turn(t, { who: t.rep ? 'You' : null }); }).join('') + '</ol>'; };
  RV.context = function (R) {
    var p = R.presence, c = R.call;
    if (p === 'loading') return '<h2 class="rc-colhead" id="rc-ctx-h">Today</h2><div class="rc-sk-row"><span class="sk-line"><span class="sk rc-sk-m"></span></span></div>';
    if (c && ['ringing', 'answering', 'oncall', 'hold', 'wrapup', 'dropped'].indexOf(p) >= 0) {
      var cap = c.captured.filter(function (k) { return k.value; }).length, desk = V.bp.desktopShell();
      return '<h2 class="rc-colhead" id="rc-ctx-h">' + (p === 'ringing' || p === 'answering' ? 'Before you pick up' : 'Call context') + '</h2>' +
        '<section class="rc-block" aria-labelledby="rc-sum-h"><div class="rc-block-head"><h3 class="rc-h3" id="rc-sum-h">Summary so far</h3><span class="type-meta-12 u-fg-3">from the call · 1m 02s</span></div><p class="type-read-15 rc-sum">Wants a site visit on Saturday morning. Asked about the price range, then asked to speak to a person.</p></section>' +
        '<section class="rc-block" aria-labelledby="rc-cap-h"><div class="rc-block-head"><h3 class="rc-h3" id="rc-cap-h">Captured so far</h3><span class="type-meta-12 u-fg-3 num">' + cap + ' of ' + c.captured.length + '</span></div><dl class="kv kv--rows">' + c.captured.map(function (k) { return '<div class="kv-row"><dt>' + esc(k.key) + '</dt><dd>' + (k.value ? esc(k.value) : '<span class="kv-empty">Not captured</span>') + '</dd></div>'; }).join('') + '</dl></section>' +
        '<details class="rc-details rc-tx" id="rc-tx"' + (desk || R.txOpen ? ' open' : '') + '><summary><span>' + (p === 'ringing' || p === 'answering' ? 'Transcript so far' : 'Transcript') + '</span><span class="rc-sum-v">' + c.turns.length + ' turns</span>' + V.icon('chevron-down', 'sm', { className: 'rc-chev' }) + '</summary><div class="rc-tr" id="rc-tr">' + RV.turns(c) + '</div></details>';
    }
    var H = R.history;
    return '<h2 class="rc-colhead" id="rc-ctx-h">Today</h2><dl class="kv kv--tight rc-today"><div class="kv-row"><dt>Calls taken</dt><dd class="num">' + R.stats.taken + '</dd></div><div class="kv-row"><dt>Talk time</dt><dd class="num">' + R.stats.talk + ' min</dd></div><div class="kv-row"><dt>Missed</dt><dd class="num">' + R.stats.missed + '</dd></div></dl>' +
      '<section class="rc-block" aria-labelledby="rc-hist-h"><h3 class="rc-h3" id="rc-hist-h">Recent transfers</h3>' + (H.length ? '<div class="tl rc-gap"><ol class="tl-list">' + H.map(function (x) {
        return '<li class="tl-item"><span class="tl-node' + (x.missed ? ' tl-node--warning' : x.tone ? ' tl-node--' + x.tone : '') + '" aria-hidden="true">' + V.icon(x.missed ? 'phone-missed' : 'phone-incoming', 'sm') + '</span><span class="tl-text"><b translate="no">' + esc(x.name) + '</b> · ' + (x.missed ? 'Missed · Vaani offered a callback' : 'Answered · ' + esc(x.dur) + ' · ' + esc(x.outcome)) + '</span><span class="tl-time">' + esc(x.at) + '</span></li>'; }).join('') + '</ol></div>' : '<p class="empty empty--compact">No transfers yet today.</p>') + '</section>' +
      '<section class="rc-block" aria-labelledby="rc-how-h"><h3 class="rc-h3" id="rc-how-h">How transfers reach you</h3><p class="type-body-14 u-fg-2">A flow’s Transfer step hands the caller to an available rep. If nobody answers in 20 s, the flow’s fallback runs. Only one tab can be available at a time.</p></section>';
  };
  /* ---------- the control bar (rep variant): Mute, Hold, Keypad, Transfer…, End call; phones keep Mute and End call ---------- */
  RV.bar = function (R) {
    var p = R.presence, c = R.call, b = function (a, cls, ic, label, extra) { return '<button type="button" class="btn ' + (cls || '') + '" data-rc-act="' + a + '"' + (extra || '') + '>' + V.icon(ic) + label + '</button>'; };
    if (p === 'ringing' || p === 'answering') return '<div class="rc-answer rc-answer--bar">' + b('answer', 'btn--primary rc-grow', 'phone', p === 'answering' ? 'Answering…' : 'Answer', p === 'answering' ? ' aria-busy="true"' : '') + b('decline', 'rc-grow', 'x', 'Decline') + '</div>';
    if (p === 'oncall' || p === 'hold') return b('mute', '', c.muted ? 'mic-off' : 'mic', c.muted ? 'Unmute' : 'Mute', ' aria-pressed="' + !!c.muted + '" data-kbd="m" data-tooltip="' + (c.muted ? 'Unmute' : 'Mute') + '"') +
      b('hold', 'u-hide-phone', p === 'hold' ? 'play' : 'pause', p === 'hold' ? 'Resume' : 'Hold', ' aria-pressed="' + (p === 'hold') + '" data-kbd="h" data-tooltip="' + (p === 'hold' ? 'Resume' : 'Hold') + '"') +
      '<button type="button" class="ibtn ibtn--secondary u-hide-phone" data-rc-act="keypad" aria-label="Keypad" aria-haspopup="dialog" aria-expanded="false">' + V.icon('grid-3x3') + '</button>' +
      '<button type="button" class="ibtn ibtn--secondary u-hide-phone" data-rc-act="transfer" aria-label="Transfer…" aria-haspopup="dialog" aria-expanded="false">' + V.icon('phone-forwarded') + '</button>' +
      '<button type="button" class="ibtn ibtn--secondary u-only-phone" id="rc-bar-more" aria-label="More call controls" aria-haspopup="menu" aria-controls="rc-bar-menu" aria-expanded="false">' + V.icon('ellipsis') + '</button>' + b('end', 'btn--danger rc-end', 'phone-off', 'End call');
    if (p === 'wrapup' || p === 'dropped') return '<div class="rc-wrapbar"><button type="button" class="btn btn--primary rc-wrap-main" data-rc-act="save-available"' + (c.saving ? ' aria-busy="true"' : '') + '>' + (c.saving ? V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Saving…' : 'Save and go available') + '</button><button type="button" class="btn" data-rc-act="save-offline">Save and go offline</button><button type="button" class="btn btn--tertiary" data-rc-act="skip">Skip</button></div>';
    return '';
  };
  RV.keypad = function (digits) {
    var K = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
    return '<div class="input input--readonly"><input id="rc-dtmf" readonly aria-label="Tones sent" value="' + esc(digits) + '"></div><div class="rc-keys" role="group" aria-label="Keys">' + K.map(function (k) { return '<button type="button" class="btn rc-key" data-key="' + k[0] + '" aria-label="' + (k[0] === '*' ? 'Star' : k[0] === '#' ? 'Hash' : k[0]) + '"><span class="type-mono-13" aria-hidden="true">' + k[0] + '</span><span class="type-meta-12 u-fg-3" aria-hidden="true">' + (k[1] || '&nbsp;') + '</span></button>'; }).join('') + '</div>';
  };
  RV.init = init;
})(window, document);
