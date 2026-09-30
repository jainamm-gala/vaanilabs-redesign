/* Vaani Labs prototype · pages/assistant-proto.js — PROTOTYPE ONLY (not product UI): the "Prototype states" popover.
   Every state 03-pages/02 lists, as links that reload assistant.html into that state (?chat, ?scenario, ?mode, ?demo, ?wallet). */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, esc = U.esc, store = U.store;
  var A = w.VaaniAssistant;
  /* ---------- Prototype states (reviewers only) ---------- */
  var P = [
    ['Chats', [['New chat (first use)', ''], ['Plan waiting: Call step', 'chat=chat_1'], ['Answer with numbers and sources', 'chat=chat_2'], ['Expired Publish step · Ask again', 'chat=chat_3'], ['Add leads from a CSV (Change, tier 1)', 'scenario=import'], ['Delete 64 leads (typed, tier 3)', 'scenario=delete'], ['Edit a draft (diff, tier 2)', 'scenario=editdraft'], ['Publish a draft (Publish gate)', 'scenario=publish'], ['Opened at a waiting step (?step=)', 'chat=chat_1&step=s3'], ['Changes tab', 'chat=chat_1&tab=changes']]],
    ['Autonomy', [['Suggest only', 'mode=1&scenario=callbacks'], ['Ask before changes (default)', 'mode=2'], ['Undoable changes on its own', 'mode=3&scenario=import']]],
    ['Blocked steps', [['Wallet ₹0', 'chat=chat_1&wallet=empty'], ['No verified caller ID', 'chat=chat_1&demo=no-caller-id'], ['Role can’t place calls', 'chat=chat_1&demo=role'], ['Flow has no live version', 'chat=chat_1&demo=no-live'], ['Publish: 2 errors', 'scenario=publish&demo=publish-errors'], ['Publish: admins only', 'scenario=publish&demo=role'], ['Preview checked 12 min ago', 'chat=chat_1&demo=stale']]],
    ['Failures', [['Send fails: network', 'demo=send-network'], ['Send fails: server', 'demo=send-server'], ['Reply stops mid-way', 'demo=midway'], ['Slow reply', 'demo=slow'], ['Reply times out', 'demo=timeout'], ['Step fails (import)', 'scenario=import&demo=step-fail'], ['Changed since you approved', 'scenario=import&demo=changed'], ['Call gate fails once', 'chat=chat_1&demo=gate-fail'], ['Rate limited', 'demo=rate-limit'], ['Daily limit', 'demo=limit'], ['Assistant unavailable', 'demo=unavailable'], ['Offline', 'chat=chat_1&demo=offline'], ['Upload fails', 'demo=upload-fail']]],
    ['Page states', [['Loading chat', 'chat=chat_1&demo=loading'], ['Chat not found', 'demo=not-found'], ['Someone else’s chat', 'demo=forbidden'], ['Assistant turned off', 'demo=turned-off'], ['Session expired', 'chat=chat_1&demo=session'], ['New workspace, no calls', 'demo=no-calls'], ['Chat saved in this browser', 'demo=local-chat']]],
    ['History and voice', [['History: empty', 'demo=history-empty'], ['History: error', 'demo=history-error'], ['Dictate: permission denied', 'demo=mic-denied'], ['Dictate: no microphone', 'demo=mic-none'], ['Dictate: microphone in use', 'demo=mic-busy'], ['Dictate: transcription fails', 'demo=mic-failed'], ['Dictate: unsupported browser', 'demo=mic-unsupported']]]
  ];
  $('#as-proto-body').innerHTML = '<p class="as-proto-note">Each link reloads the page in that state. Reset the first-use Dictate explainer: <button type="button" class="btn btn--link" id="as-proto-mic">show it again</button>.</p><div class="as-proto-cols">' + P.map(function (g, gi) {
    return '<div class="as-proto-g"><h3 class="as-proto-h" id="as-pg' + gi + '">' + esc(g[0]) + '</h3><ul class="as-proto-list" aria-labelledby="as-pg' + gi + '">' + g[1].map(function (x) { var href = 'assistant.html' + (x[1] ? '?' + x[1] : ''), cur = w.location.search.replace(/^\?/, '') === x[1]; return '<li><a class="as-a" href="' + esc(href) + '"' + (cur ? ' aria-current="page"' : '') + '>' + esc(x[0]) + '</a></li>'; }).join('') + '</ul></div>';
  }).join('') + '</div>';
  $('#as-proto-mic').addEventListener('click', function () { store.remove('vaani:assistant:mic'); A.say('The Dictate explainer shows on the next Dictate.'); });
  $('#as-proto-btn').addEventListener('click', function () { V.popover.toggle(this, 'as-proto', { placement: 'bottom-end' }); });

})(window, document);
