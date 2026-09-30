/* Vaani Labs prototype · pages/assistant-actions.js — what the ApprovalCard’s controls do (02 §10.3): approve (tiers 1–3),
   Skip step, Edit… (inline form, recomputes the preview), Include, Recheck, View all, typed confirm; plan progression
   (§9.3): Look up and Draft steps run on their own, the plan pauses at the first step that needs you, mode 3 runs
   undoable changes of ≤ 50 records on its own with an Undo toast, and a finished plan gets a closing turn. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA;
  A.ACT = A.ACT || {};
  function stepOf(el) { var id = el.getAttribute('data-step') || (el.closest('[data-step]') || {}).getAttribute && el.closest('[data-step]').getAttribute('data-step'); var p = A.S.chat && A.S.chat.plan; return p && p.steps.filter(function (s) { return s.id === id; })[0]; }
  A.stepOf = stepOf;
  function later(ms, fn) { return setTimeout(fn, ms); }
  function focusResult(s) {
    A.renderPlan(); A.renderThread();
    var el = A.cardPlace() === 'panel' ? $('#res-' + s.id) : $('#res-inline-' + s.id) || $('#res-' + s.id);
    if (el && U.visible(el)) el.focus({ preventScroll: false });
  }
  A.focusResult = focusResult;

  /* ---------- results per variant ---------- */
  var DONE = {
    'import': function (s, n) { var c = A.addChange({ icon: 'user-plus', html: 'Added <b>' + n + ' leads</b> from <span translate="no">expo-visitors.csv</span>', acts: [{ label: 'View', href: 'leads.html?q=expo-visitors' }], undo: true, undoTip: 'Undo available until tomorrow ' + F.time(A.nowIso()), step: s.id });
      s.result = { text: n + ' added', link: { label: 'View in Leads', href: 'leads.html?q=expo-visitors' }, undo: true, undoTip: c.undoTip }; s.closing = 'Added ' + n + ' leads from expo-visitors.csv.' + (A.ensureAp(s).include ? '' : ' 3 were already in Leads, so I skipped them.'); return 'Added ' + n + ' leads'; },
    mark: function (s, n) { var c = A.addChange({ icon: 'check', html: 'Marked <b>' + n + ' leads</b> Contacted', acts: [{ label: 'View', href: 'leads.html?status=contacted' }], undo: true, undoTip: 'Undo available until tomorrow ' + F.time(A.nowIso()), step: s.id });
      s.result = { text: n + ' marked Contacted', link: { label: 'View in Leads', href: 'leads.html?status=contacted' }, undo: true, undoTip: c.undoTip }; s.closing = n + ' answered, and I marked them Contacted.'; return 'Marked ' + n + ' leads Contacted'; },
    'delete': function (s) { var c = A.addChange({ icon: 'trash-2', html: 'Deleted <b>64 leads</b> marked Not interested', undo: true, undoTip: 'Restore available for 7 days', step: s.id });
      s.result = { text: '64 deleted', undo: true, undoTip: c.undoTip }; s.closing = 'Deleted 64 leads. You can restore them for 7 days.'; return 'Deleted 64 leads'; },
    editdraft: function (s, n) { var c = A.addChange({ icon: 'git-compare', html: 'Applied ' + n + ' changes to the <b translate="no">Site-visit qualifier</b> draft', acts: [{ label: 'Open diff', href: 'flow-designer.html?view=diff' }], undo: true, undoTip: 'Restores draft revision 14', step: s.id });
      s.result = { text: n + ' changes applied to draft v8', link: { label: 'Open diff', href: 'flow-designer.html?view=diff' }, undo: true, undoTip: c.undoTip }; s.closing = 'Applied ' + n + ' changes to the Site-visit qualifier draft. Callers hear v7 until you publish.'; return 'Applied ' + n + ' changes'; }
  };

  /* ---------- approve (tiers 1–3). Tier 4 launches the gate. ---------- */
  A.approve = function (s, btn) {
    var ap = A.ensureAp(s), b = A.blockedReason(s);
    if (btn && btn.getAttribute('aria-disabled') === 'true') { A.say((b ? b.text : '') || $('#why-' + s.id).textContent || 'Not available yet.', false, 'why'); return; }
    if (s.approval === 'call') return A.openCallGate(s, btn);
    if (s.approval === 'publish') return A.openPublishGate(s, btn);
    if (ap.busy) return;
    ap.busy = true; A.renderPlan();
    later(900, function () {
      ap.busy = false;
      if (A.S.demo === 'changed' && !s.sinceOnce) { s.sinceOnce = true; ap.since = true; A.renderPlan(); A.say('Changed since you approved. Review again.', true); var t = $('[data-step="' + s.id + '"] .as-card-title'); if (t) t.focus(); return; }
      if (A.S.demo === 'step-fail' && s.approval === 'import' && !s.failedOnce) {
        s.failedOnce = true; s.status = 'failed'; s.failText = 'Couldn’t add 3 of 24 leads. Their numbers aren’t valid mobile numbers.'; s.failAct = { act: 'step-retry', label: 'Retry step' }; s.failAct2 = { label: 'View the 3', href: 'leads.html?q=invalid-number' };
        A.renderPlan(); A.renderThread(); A.say('Step ' + A.stepIndex(s) + ' failed. Couldn’t add 3 of 24 leads.', true, 'stepfail');
        var r = A.cardPlace() === 'panel' ? $('#panel-' + s.id + ' .as-step-err') : null; if (r) { r.setAttribute('tabindex', '-1'); r.focus(); }
        return;
      }
      finish(s, A.apCount(s));
    });
  };
  function finish(s, n, auto) {
    s.status = 'done'; A.S.lastDone = s.id;
    var what = DONE[s.approval](s, n);
    A.say('Step ' + A.stepIndex(s) + ' done. ' + what + '.', false, 'step');
    if (auto) {
      var c = A.S.chat.changes[A.S.chat.changes.length - 1];
      V.toast.undo(what, { action: { label: 'Undo', onClick: function () { A.undoChange(c); } } });
    }
    if (auto) { A.renderPlan(); A.renderThread(); } else focusResult(s);
    A.advance();
  }
  A.finishStep = finish;

  /* ---------- plan progression ---------- */
  A.advance = function () {
    var ch = A.S.chat, p = ch.plan; if (!p || p.state === 'stopped') return;
    var next = p.steps.filter(function (s) { return s.status === 'queued' || s.status === 'pending'; })[0];
    if (!next) { if (!p.steps.some(function (s) { return s.status === 'waiting' || s.status === 'running'; })) planDone(p); A.renderPlan(); A.renderThread(); return; }
    if (next.status === 'pending') return;
    if (next.after === 'calls') {
      next.status = 'pending'; next.queuedText = 'Waiting for the calls to finish · asks you first'; A.renderPlan(); A.renderThread();
      /* Prototype: the batch "finishes" after a few seconds so the next approval can be seen. */
      later(6000, function () { if (A.S.chat !== ch || next.status !== 'pending' || p.state === 'stopped') return; next.status = 'queued'; next.after = null; A.advance(); });
      return;
    }
    if (next.kind === 'Open') { next.status = 'open'; A.advance(); return; }
    if (!next.approval) { next.status = 'running'; A.renderPlan(); later(800, function () { next.status = 'done'; A.advance(); }); return; }
    if (A.S.mode === 1) { next.status = 'open'; A.advance(); return; }
    if (A.S.mode === 3 && (next.approval === 'import' || next.approval === 'mark') && A.apCount(next) <= 50) {
      next.status = 'running'; next.runningText = 'Running on its own (undoable)…'; A.renderPlan();
      later(900, function () { finish(next, A.apCount(next), true); });
      return;
    }
    next.status = 'waiting'; A.ensureAp(next);
    A.renderPlan(); A.renderThread();
    A.say('Step ' + A.stepIndex(next) + (A.blockedReason(next) ? ' is blocked. ' + A.blockedReason(next).text : ' needs your approval'), false, 'wait');
    if (A.cardPlace() === 'panel') A.scrollPanelToWaiting();
  };
  function planDone(p) {
    if (p.closed) return; p.closed = true;
    var lines = p.steps.map(function (s) { return s.status === 'done' ? s.closing : null; }).filter(Boolean);
    if (lines.length && A.postClosing) A.postClosing(lines.join(' '));
  }
  A.planDone = planDone;

  /* ---------- Skip step (dependants skip with "Needs step N") ---------- */
  A.skip = function (s) {
    var i = A.stepIndex(s);
    s.status = 'skipped'; s.skipText = s.approval === 'editdraft' ? 'Discarded by you' : 'Skipped by you';
    A.S.chat.plan.steps.forEach(function (x) { if (x.dependsOn === s.id && (x.status === 'queued' || x.status === 'pending')) { x.status = 'skipped'; x.skipText = 'Needs step ' + i; } });
    A.S.lastDone = s.id; A.say('Step ' + i + ' skipped.');
    focusResult(s); A.advance();
  };

  /* ---------- Edit… : the step’s parameters as real fields ---------- */
  function checkList(s, rows, keyFn, labelFn, max) {
    var ap = s.ap;
    return '<div class="as-ed-scroll"><fieldset class="fieldset as-ed-list"><legend>' + (s.approval === 'editdraft' ? 'Changes to apply' : 'Include') + '</legend>' + rows.slice(0, max || rows.length).map(function (r, i) {
      var k = keyFn(r, i), id = 'ed-' + s.id + '-' + i;
      return '<label class="check check--dense" for="' + id + '"><input class="cb" type="checkbox" id="' + id + '" data-key="' + esc(k) + '"' + (ap.draftEx && ap.draftEx[k] ? '' : ' checked') + '><span class="check-text">' + labelFn(r) + '</span></label>';
    }).join('') + '</fieldset></div>';
  }
  function select(id, label, opts, val) {
    var cur = opts.filter(function (o) { return o[0] === val; })[0] || opts[0];
    return '<div class="field"><span class="field-label" id="' + id + '-l">' + esc(label) + '</span><button type="button" class="select" data-select data-field="' + id + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v">' + esc(cur[1]) + '</span>' + A.ic('chevron-down') + '</button>' +
      '<div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === cur[0]) + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span>' + A.ic('check', 'md', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>';
  }
  A.editFormHtml = function (s) {
    var ap = s.ap, all = s.approval === 'import' ? AD.expo : s.approval === 'call' ? AD.callbacks : s.approval === 'mark' ? A.apRowsAll(s) : A.DRAFT_CHANGES;
    var h = '<div class="as-ed" data-step="' + s.id + '"><p class="as-ed-note">Changes apply to this step only. Nothing runs until you approve.</p>';
    if (s.approval === 'call') {
      h += select('ed-flow-' + s.id, 'Flow', AD.liveFlows.map(function (f) { return [f.id, f.name + ' v' + f.v + ' · Live']; }), ap.flowId);
      h += select('ed-voice-' + s.id, 'Voice', AD.voices.map(function (v) { return [v.id, v.name + ' · ' + v.style]; }), ap.voice);
      h += select('ed-when-' + s.id, 'When', [['now', 'Now · until ' + A.closesAt() + ' IST'], ['14:00', 'Today 2:00 pm IST'], ['15:00', 'Today 3:00 pm IST'], ['16:00', 'Today 4:00 pm IST']], ap.when === 'now' ? 'now' : ap.time);
    }
    if (s.approval === 'import') {
      h += select('ed-status-' + s.id, 'Status for new leads', [['new', 'New'], ['interested', 'Interested'], ['callback_due', 'Callback due']], ap.status);
      h += select('ed-flow-' + s.id, 'Flow', AD.liveFlows.map(function (f) { return [f.id, f.name + ' v' + f.v]; }), ap.flowId);
    }
    if (s.approval !== 'delete') h += checkList(s, all, function (r, i) { return r.id || r.name || String(i); }, function (r) { return '<span>' + (r.text ? esc(r.kind) + ': ' + esc(r.text) : '<span translate="no">' + esc(r.name) + '</span> <span class="u-fg-3">· ' + esc(r.city) + '</span>') + '</span>'; }, s.approval === 'import' ? 8 : null);
    if (s.approval === 'import') h += '<p class="gate-note">Showing 8 of 24 rows. Edit the rest in Leads after adding.</p>';
    if (s.approval === 'delete') h += '<p class="as-ed-note">To delete a different set of leads, ask for a different plan.</p>';
    return h + '<p class="as-ed-alt"><button type="button" class="btn btn--link" data-act="ask-different" data-step="' + s.id + '">Ask for a different plan</button></p><div class="as-ap-foot"><button type="button" class="btn btn--tertiary" data-act="cancel-edit" data-step="' + s.id + '">Cancel</button><button type="button" class="btn btn--primary" data-act="save-edit" data-step="' + s.id + '">Save changes</button></div></div>';
  };
  A.apRowsAll = function (s) { var ex = s.ap.excluded; s.ap.excluded = {}; var r = A.apRows(s); s.ap.excluded = ex; return r; };
  function recheck(s, msg) {
    var ap = s.ap; ap.checking = true; A.renderPlan();
    later(600, function () { ap.checking = false; ap.checkedAt = A.nowIso(); ap.changed = false; A.renderPlan(); var t = $('[data-step="' + s.id + '"] .as-card-title');
      /* Focus the title and keep it in view: inline, fit the card between the TopBar and the dock; in the panel, its own scroll (WCAG 2.4.11). */
      var slot = $('#as-inline-card');
      if (t && U.visible(t)) { t.focus({ preventScroll: true }); if (slot && slot.contains(t)) A.showCard(slot, { top: true }); else t.scrollIntoView({ block: 'nearest' }); }
      A.say(msg || 'Checked just now.'); });
  }
  A.recheck = recheck;

  /* ---------- handlers ---------- */
  var H = A.ACT;
  H.approve = function (el) { var s = stepOf(el); if (s) A.approve(s, el); };
  H.skip = function (el) { var s = stepOf(el); if (s && el.getAttribute('aria-disabled') !== 'true') A.skip(s); };
  H['edit-step'] = function (el) { var s = stepOf(el); if (!s || el.getAttribute('aria-disabled') === 'true') return; s.ap.editing = true; s.ap.draftEx = JSON.parse(JSON.stringify(s.ap.excluded)); A.renderPlan(); var f = $('[data-step="' + s.id + '"] .as-ed .select, [data-step="' + s.id + '"] .as-ed input'); if (f) f.focus(); };
  H['cancel-edit'] = function (el) { var s = stepOf(el); s.ap.editing = false; A.renderPlan(); var b = $('[data-step="' + s.id + '"] [data-act="edit-step"]'); if (b) b.focus(); };
  H['save-edit'] = function (el) {
    var s = stepOf(el), ap = s.ap, form = el.closest('.as-ed'), ex = {};
    $$('input[type="checkbox"][data-key]', form).forEach(function (c) { if (!c.checked) ex[c.getAttribute('data-key')] = true; });
    ap.excluded = ex;
    $$('[data-select][data-field]', form).forEach(function (b) {
      var id = b.getAttribute('data-field'), v = ($('#' + id + '-lb [aria-selected="true"]') || {}).getAttribute ? $('#' + id + '-lb [aria-selected="true"]').getAttribute('data-value') : null; if (!v) return;
      if (id.indexOf('ed-flow') === 0) ap.flowId = v; else if (id.indexOf('ed-voice') === 0) ap.voice = v; else if (id.indexOf('ed-status') === 0) ap.status = v;
      else if (id.indexOf('ed-when') === 0) { if (v === 'now') ap.when = 'now'; else { ap.when = 'later'; ap.time = v; } }
    });
    ap.editing = false; recheck(s, 'Preview updated. ' + $('[data-step="' + s.id + '"] .as-card-title', d).textContent.replace(/\s+/g, ' ') + '.');
  };
  H['ask-different'] = function (el) { var s = stepOf(el); s.ap.editing = false; A.renderPlan(); A.insertText('Change step ' + A.stepIndex(s) + ': ', { newLine: true }); };
  H.include = function (el) { var s = stepOf(el); s.ap.include = !s.ap.include; A.renderPlan(); A.say(s.ap.include ? '3 leads included. Add 27 leads.' : '3 leads skipped. Add 24 leads.'); var b = $('[data-step="' + s.id + '"] [data-act="include"]'); if (b) b.focus(); };
  H.recheck = function (el) { recheck(stepOf(el)); };
  H['review-again'] = function (el) { var s = stepOf(el); s.ap.since = false; recheck(s, 'Preview refreshed. Review it, then approve again.'); };
  H['view-all'] = function (el) {
    var s = stepOf(el), rows = A.apRows(s), body = $('#as-rcp-body'), call = s.approval === 'call';
    $('#as-rcp-t').textContent = (call ? 'Recipients · ' : s.approval === 'import' ? 'Leads to add · ' : 'Leads · ') + A.plural(rows.length, 'lead');
    body.innerHTML = '<div class="dt-wrap dt-wrap--framed as-rcp-table"><table class="dt"><caption class="sr-only">' + esc($('#as-rcp-t').textContent) + '</caption><thead><tr><th scope="col">Lead</th><th scope="col">Phone</th><th scope="col">City</th>' + (call ? '<th scope="col">Due</th><th scope="col">Language</th>' : '') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td class="c-key" translate="no">' + esc(r.name) + '</td><td>' + V.ui.phoneText(r.phone) + '</td><td>' + esc(r.city) + '</td>' + (call ? '<td class="num">' + esc(F.time(r.due)) + '</td><td>' + V.ui.langMark(r.lang) + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>';
    V.dialog.open('as-rcp', { returnTo: el });
  };
  H['undo-step'] = function (el) { var s = stepOf(el); var c = (A.S.chat.changes || []).filter(function (x) { return x.step === s.id; })[0]; A.undoChange(c); var r = $('#res-' + s.id) || $('#res-inline-' + s.id); if (r) r.focus(); };
  H['undo-change'] = function (el) { var id = el.getAttribute('data-change'); A.undoChange((A.S.chat.changes || []).filter(function (c) { return c.id === id; })[0]); var t = $('#as-tab-changes'); if (t && U.visible(t)) t.focus(); };
  H['step-retry'] = function (el) { var s = stepOf(el); s.status = 'waiting'; s.ap.busy = true; A.renderPlan(); later(900, function () { s.ap.busy = false; finish(s, 21); s.result.text = '21 added · 3 need a valid mobile number'; A.renderPlan(); }); };
  H['ask-admin'] = function () { V.toast.info('Request copied. Admins in this workspace: Anika R. and Rohit S.'); };
  H['copy-draft-link'] = function () { V.toast.info('Link to the Festive offer callback draft copied.'); };
  H['goto-card'] = function (el) { var id = el.getAttribute('data-step'); V.drawer.close('as-plan-sheet', 'navigate'); setTimeout(function () { A.revealStep(id, true); }, 30); };
  H['stop-plan'] = function () { A.stopPlan(); };
  H.rollback = function () { w.location.href = 'flow-designer.html?flow=flow_f219&versions=1'; };

  /* ⌘/Ctrl+Enter inside a card activates its primary; the typed-confirm field updates the primary in place. */
  A.cardKeydown = function (e) {
    var card = e.target.closest && e.target.closest('.as-ap'); if (!card) return;
    if (e.key === 'Enter' && (U.isMac ? e.metaKey : e.ctrlKey)) { e.preventDefault(); var p = $('.as-ap-primary', card), s = stepOf(card); if (p && s) A.approve(s, p); }
  };
  A.cardInput = function (e) {
    var t = e.target; if (t.getAttribute('data-act') !== 'typed') return;
    var s = stepOf(t), ok = t.value.trim() === '64', p = t.closest('.as-ap').querySelector('.as-ap-primary'); s.ap.typed = t.value;
    if (ok && !A.blockedReason(s)) p.removeAttribute('aria-disabled'); else p.setAttribute('aria-disabled', 'true');
    $('#why-' + s.id).textContent = ok ? '' : 'Type 64 to confirm.'; p.setAttribute('data-tooltip', ok ? 'Delete 64 leads' : 'Type 64 to confirm.');
  };
})(window, document);
