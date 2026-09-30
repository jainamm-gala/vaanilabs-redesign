/* Vaani Labs prototype · pages/assistant-engine.js — Send, the quiet streamed reply and its phases (02 §13.3), failures that
   keep the user’s words (§13.4), Stop, Answer again, plan creation (§9.3: a plan appears whole, Look ups run on their own,
   the plan pauses at the first step that needs you) and the closing turn with confirmed results only. Replies are canned
   by intent: this is a static prototype, nothing is sent anywhere. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, esc = U.esc, F = V.fmt, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA, H = A.ACT = A.ACT || {};
  var SPEED = 45;

  function tid() { return U.uid('t'); }
  A.titleFrom = function (text) { var t = String(text).replace(/\s+/g, ' ').trim().replace(/[.?!:]+$/, ''); if (t.length > 60) t = t.slice(0, 60).replace(/\s+\S*$/, ''); return t.charAt(0).toUpperCase() + t.slice(1); };

  /* ---------- the stream ---------- */
  var S = null;
  A.streaming = function () { return !!S; };
  function sched(ms, fn) { var id = setTimeout(function () { if (S && S.timers) S.timers.splice(S.timers.indexOf(id), 1); fn(); }, ms); S.timers.push(id); }
  function paint(t) { A.renderTurn(t); A.follow(); }
  function streamText(t, html, cb) {
    var plain = String(html).replace(/<[^>]+>/g, ''), words = plain.split(/(\s+)/), i = 0, b = { t: 'text', html: '<p></p>' };
    t.blocks.push(b); paint(t);
    var el = function () { var a = d.getElementById(t.id); return a && a.querySelectorAll('.as-body > *')[t.blocks.indexOf(b)]; };
    (function tick() {
      if (!S || S.turn !== t) return;
      i = Math.min(words.length, i + 6); var p = el(); b.html = '<p>' + esc(words.slice(0, i).join('')) + '</p>';
      if (p) p.innerHTML = b.html; A.follow();
      if (i >= words.length) { b.html = /^\s*</.test(html) ? html : '<p>' + esc(html) + '</p>'; if (p) p.innerHTML = b.html; cb(); return; }
      if (A.S.demo === 'midway' && !S.failedMid && i > words.length / 2 && t.blocks.filter(function (x) { return x.t === 'text'; }).length === 1) { S.failedMid = true; return fail(t, 'The answer stopped before it finished.', 'stream closed at 1,204 bytes'); }
      sched(SPEED, tick);
    })();
  }
  function fail(t, text, details) { t.state = 'error'; t.status = null; t.error = { text: text, retry: 'retry', details: details }; end(); paint(t); A.say(text, true, 'replyfail'); }
  function end() { if (!S) return; S.timers.forEach(clearTimeout); S = null; A.composerState(); }

  function run(t, sc, ops, i) {
    if (!S || S.turn !== t) return;
    if (i >= ops.length) return complete(t, sc);
    var op = ops[i], next = function () { run(t, sc, ops, i + 1); };
    if (op.status) { t.status = op.status; paint(t);
      if (A.S.demo === 'slow' || A.S.demo === 'timeout') { return sched(4000, function () { t.slow = true; paint(t); sched(3500, function () { if (A.S.demo === 'timeout') return fail(t, 'The answer took too long and stopped.', 'no reply within 90 s'); t.slow = false; next(); }); }); }
      return sched(op.wait || 400, next); }
    if (op.plan) { var p = sc.plan(); A.replacePlan(p, t); p.planning = true; t.plan = p.id; A.renderPlan(); return sched(500, function () { p.planning = false; A.renderPlan(); next(); }); }
    if (op.act || op.runStep) {
      var a = op.act, st = op.runStep && A.S.chat.plan.steps.filter(function (x) { return x.id === op.runStep; })[0];
      if (a) { a.state = 'running'; t.activity.push(a); t.status = null; paint(t); }
      if (st) { st.status = 'running'; A.renderPlan(); }
      return sched(600, function () { if (a) a.state = 'done'; if (st) st.status = 'done'; paint(t); A.renderPlan(); next(); });
    }
    if (op.text || op.html) { t.status = null; return streamText(t, op.html || op.text, next); }
    if (op.block) { t.blocks.push(op.block); paint(t); return sched(200, next); }
    if (op.advance) {
      var pl = A.S.chat.plan; if (pl) pl.steps.forEach(function (s) { if (s.status === 'done' && s.onDone === 'draft' && !s.changed) { s.changed = true; A.addChange({ icon: 'workflow', html: 'Created draft flow <b translate="no">' + esc(s.title.replace('Create draft flow ', '')) + '</b>', acts: [{ label: 'Open in Flows', href: 'flow-designer.html?new=1' }], undo: true, undoTip: 'Deletes the draft while nobody has edited it', step: s.id }); } });
      A.advance(); if (pl && A.planState(pl) === 'done') pl.closed = true; t.stepsRan = true; return next();
    }
    if (op.wait) return sched(op.wait, next);
    next();
  }
  function complete(t, sc) {
    t.state = 'complete'; t.status = null; t.sources = sc.sources; t.followups = sc.followups;
    if (sc.planChange) planChanged(sc.planChange);
    end(); A.renderThread(); A.renderPlan(); A.follow(true);
    var w0 = A.waitingStep();
    if (t.plan && w0) A.say('Assistant replied with a plan of ' + A.S.chat.plan.steps.length + ' steps. Step ' + A.stepIndex(w0) + ' needs your approval.', false, 'reply');
    else A.say('Assistant replied: ' + A.firstSentence((t.blocks[0] || {}).html || ''), false, 'reply');
    if (A.S.voice && A.voiceSpeak) A.voiceSpeak();
  }
  function planChanged(s) {
    var ap = A.ensureAp(s); ap.changed = true; A.renderPlan();
    setTimeout(function () { ap.excluded['lead_1084'] = true; ap.changed = false; ap.checkedAt = A.nowIso(); A.renderPlan(); A.say('Step ' + A.stepIndex(s) + ' changed. Call 11 leads.', false, 'changed'); }, 1400);
  }

  /* One active plan per chat (§9.3 item 7): a new plan cancels the old one’s waiting and queued steps. */
  A.replacePlan = function (p, t) {
    var ch = A.S.chat, old = ch.plan;
    if (old && ['waiting', 'running', 'blocked'].indexOf(A.planState(old)) >= 0) {
      old.steps.forEach(function (s) { if (['waiting', 'queued', 'pending'].indexOf(s.status) >= 0) { s.status = 'cancelled'; s.cancelText = 'Replaced by a new plan'; } });
      t.blocks.push({ t: 'note', html: 'This replaces the earlier plan. Its waiting step won’t run.' });
    }
    ch.plan = p; A.S.lastDone = null; A.S.tab = 'plan';
  };

  A.reply = function (userTurn, sc) {
    var ch = A.S.chat;
    var t = { id: tid(), role: 'assistant', at: A.nowIso(), state: 'streaming', activity: [], blocks: [], lang: sc.lang !== 'en' ? sc.lang : null, voice: !!A.S.voice, forTurn: userTurn.id };
    ch.turns.push(t); S = { turn: t, timers: [], sc: sc }; A.composerState(); A.renderThread(); A.follow(true);
    run(t, sc, sc.ops, 0);
  };
  A.stop = function () {
    if (!S) return; var t = S.turn; t.state = 'stopped'; t.status = null; t.slow = false;
    var p = A.S.chat.plan; if (p && t.plan === p.id) p.steps.forEach(function (s) { if (s.status === 'queued' || s.status === 'running') { s.status = 'cancelled'; s.cancelText = 'Not run: answer stopped'; p.state = 'stopped'; } });
    end(); A.renderThread(); A.renderPlan(); A.say('Stopped. The partial answer is kept.');
    $('#as-input').focus();
  };

  /* ---------- Send ---------- */
  A.send = function (text, atts, o) {
    o = o || {};
    if (!A.S.chat.id) A.createChat(text);
    var ch = A.S.chat, u = o.turn || { id: tid(), role: 'user', at: A.nowIso(), text: text, attachments: atts || [], lang: A.lang(text) !== 'en' ? A.lang(text) : null, voice: !!A.S.voice };
    u.state = 'sending'; if (!o.turn) ch.turns.push(u);
    A.renderThread(); A.follow(true);
    var mode = !o.retry && (A.S.demo === 'send-network' || A.S.demo === 'send-server') && !A.S.sendFailed ? A.S.demo : null;
    setTimeout(function () {
      if (mode) { A.S.sendFailed = true; u.state = 'failed'; u.failText = mode === 'send-network' ? 'Not sent. Can’t reach Vaani Labs. Check your connection.' : 'Not sent. Something went wrong on our side. Your message is safe.'; A.renderThread(); A.say(u.failText, true, 'sendfail'); return; }
      u.state = 'sent'; u.at = A.nowIso(); A.clearDraft(); A.renderThread();
      var sc = A.script(u.text, u.attachments); if (sc.plan) u.planRef = 'pending';
      A.reply(u, sc); if (sc.plan) u.planRef = A.S.chat.plan && A.S.chat.plan.id;
    }, 450);
  };
  A.postClosing = function (text) {
    var ch = A.S.chat, t = { id: tid(), role: 'assistant', at: A.nowIso(), state: 'complete', activity: [], blocks: [{ t: 'text', html: '<p>' + esc(text) + '</p>' }], plan: ch.plan && ch.plan.id, closing: true, stepsRan: true };
    ch.turns.push(t); A.renderThread(); A.follow(); A.say('Plan finished. ' + text, false, 'closing');
  };
  A.stopPlan = function () {
    var p = A.S.chat.plan; if (!p) return; var at = null;
    p.steps.forEach(function (s) { if (['waiting', 'queued', 'pending', 'blocked'].indexOf(s.status) >= 0) { if (!at) at = s; s.status = 'cancelled'; s.cancelText = 'Not run: plan stopped'; } });
    p.state = 'stopped'; p.closed = true;
    var done = p.steps.filter(function (s) { return s.status === 'done' && s.closing; }).map(function (s) { return s.closing; });
    A.renderPlan(); A.postClosing('Stopped the plan at step ' + (at ? A.stepIndex(at) : p.steps.length) + '. ' + (done.length ? done.join(' ') + ' ' : '') + 'Nothing else will run.');
    var h = $('#as-plan-title'); if (h && U.visible(h)) { h.setAttribute('tabindex', '-1'); h.focus(); }
  };

  /* ---------- turn actions ---------- */
  function turnOf(el) { var a = el.closest('article'); var id = a && a.id; return A.S.chat.turns.filter(function (t) { return t.id === id; })[0]; }
  H.retry = function (el) {
    var t = turnOf(el); if (!t || el.getAttribute('aria-disabled') === 'true' || S) return;
    var ch = A.S.chat, i = ch.turns.indexOf(t), u = ch.turns.filter(function (x) { return x.id === t.forTurn; })[0] || ch.turns[i - 1];
    ch.turns.splice(i, 1); A.S.demo = A.S.demo === 'midway' || A.S.demo === 'timeout' || A.S.demo === 'slow' ? null : A.S.demo;
    A.reply(u, A.script(u.text, u.attachments));
  };
  H.stop = function () { A.stop(); };
  H.resend = function (el) { var u = turnOf(el); A.send(u.text, u.attachments, { turn: u, retry: true }); };
  H['edit-failed'] = function (el) { var u = turnOf(el), ch = A.S.chat; ch.turns.splice(ch.turns.indexOf(u), 1); A.renderThread(); A.insertText(u.text, { replace: true }); };
  H.edit = function (el) { var u = turnOf(el), last = A.S.chat.turns[A.S.chat.turns.length - 1]; if (last === u) { A.insertText(u.text, { replace: true }); A.S.chat.turns.pop(); A.renderThread(); return; } u.confirmEdit = true; A.renderThread(); var b = $('#' + u.id + ' [data-act="edit-keep"]'); if (b) b.focus(); };
  H['edit-keep'] = function (el) { var u = turnOf(el); u.confirmEdit = false; A.renderThread(); var b = $('#' + u.id + ' [data-act="edit"]'); if (b) b.focus(); };
  H['edit-replace'] = function (el) {
    var u = turnOf(el), ch = A.S.chat, i = ch.turns.indexOf(u); ch.turns.splice(i);
    if (ch.plan && u.planRef === ch.plan.id) ch.plan = null;
    A.renderThread(); A.renderPlan(); A.insertText(u.text, { replace: true }); A.say('Your message is back in the message box. The answer was removed.');
  };
  H['ask-again'] = function (el) { var s = A.stepOf(el); if (s) A.send('Publish ' + s.title.replace('Publish ', '').replace(' as v1', '') + ' as v1.', []); };
  H.review = function () { var w0 = A.waitingStep(); if (w0) A.revealStep(w0.id, true); };
  H['view-changes'] = function () { A.S.tab = 'changes'; A.renderPlan(); if (A.panelVisible()) { var t = $('#as-tab-changes'); t.focus(); } else A.openPlanSheet(); };
})(window, document);
