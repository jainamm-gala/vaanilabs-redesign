/* Vaani Labs prototype · pages/agents-approvals.js — Waiting for you (03-pages/07 §2.7; gate §5.7 ApprovalCard): one
   inline card per pending decision, built from the gate’s parts (.gate--card): title (verb + object + count), From,
   recipients or the message, checks, the impact line and one primary that repeats the verb and count. Calls launch
   the Call gate (Review and call…); money opens "Confirm it’s you" (Approve with 2FA…). A decision is idempotent,
   updates every copy (section + task sheet) and the nav badge, and is replaced in place by its result line. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt, P = A.pa;
  var AP = A.approvals = {};
  function ago(iso) { var m = Math.round((A.now() - new Date(iso).getTime()) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; }
  function inH(iso) { var m = Math.round((new Date(iso).getTime() - A.now()) / 60000); return m < 60 ? 'in ' + m + ' min' : 'in ' + Math.round(m / 60) + ' h'; }
  AP.find = function (id) { return P.approvals.filter(function (a) { return a.id === id; })[0]; };
  AP.forTask = function (tid) { return P.approvals.filter(function (a) { return a.taskId === tid && !a.decided; })[0]; };
  function sel(a) { return a.recipients ? a.recipients.filter(function (r) { return !r.off; }) : []; }
  function primaryLabel(a) { if (a.kind !== 'message') return a.primary; var n = sel(a).length; return 'Send ' + n + ' message' + (n === 1 ? '' : 's'); }
  function titleOf(a) { if (a.kind !== 'message') return a.title; var n = sel(a).length; return 'Send payment links to ' + n + ' ' + (n === 1 ? 'person' : 'people') + ' on WhatsApp'; }

  AP.card = function (a, where) {
    var id = 'ap-' + a.id + '-' + where, t = P.find(a.taskId), off = A.offline, walletBlock = a.kind === 'call' && A.wallet.empty;
    if (a.decided) return '<p class="ag-decided" tabindex="-1" data-decided="' + a.id + '">' + A.statusHtml(a.decided.tone || 'success', esc(a.decided.text) + ' · ' + esc(a.decided.at)) + '</p>';
    var what = '';
    if (a.recipients) {
      var list = a.recipients, open = a.showAll || a.editing, shown = open ? list : list.slice(0, 2);
      what = '<ul class="ag-recips" aria-label="Recipients">' + shown.map(function (r, i) {
        var line = '<span translate="no">' + esc(r.label) + '</span> · ' + esc(r.city) + (r.note ? ' · ' + esc(r.note) : '');
        return '<li>' + (a.editing ? '<label class="check check--dense"><input type="checkbox" class="cb" data-ap-recip="' + i + '"' + (r.off ? '' : ' checked') + '><span class="check-text">' + line + '</span></label>' : '<span class="ag-recip-l">' + line + '</span>') + (r.due ? '<span class="num ag-recip-r">' + A.money(r.due, { whole: true }) + ' due</span>' : '') + '</li>';
      }).join('') + '</ul>' + (list.length > 2 && !a.editing ? '<button type="button" class="btn btn--link ag-more-link" data-ap="all" aria-expanded="' + !!a.showAll + '">' + (a.showAll ? 'Show fewer' : 'and ' + (list.length - 2) + ' more · View all ' + list.length) + '</button>' : '');
    }
    if (a.kv) what += A.facts(a.kv);
    if (a.message) what += a.editing ? '<div class="field"><label class="field-label" for="' + id + '-msg">Message</label><textarea class="textarea" id="' + id + '-msg" data-ap-msg rows="3" lang="' + a.messageLang + '">' + esc(a.message) + '</textarea></div>'
      : '<button type="button" class="btn btn--link ag-more-link" data-ap="msg" aria-expanded="' + !!a.showMsg + '" aria-controls="' + id + '-p">' + (a.showMsg ? 'Hide the message' : 'Show the message') + '</button><p class="ag-passage" id="' + id + '-p" lang="' + a.messageLang + '"' + (a.showMsg ? '' : ' hidden') + '>' + esc(a.message) + '</p>';
    var rows = (a.checks || []).map(function (c) { return A.row(c.kind, esc(c.text), { meta: c.meta ? esc(c.meta) : '' }); }).join('');
    if (walletBlock) rows = A.row('blocking', 'Wallet is ₹0. <button type="button" class="btn btn--link" data-vaani-action="topup">Top up</button> so your agent can call.') + rows;
    if (a.kind === 'money' && !V.data.user.twoFactor) rows = A.row('blocking', 'Turn on two-factor authentication to approve payments. <a href="settings.html#security">Security settings</a>') + rows;
    var why = off ? A.offlineReason : walletBlock ? 'Wallet is ₹0. Top up so your agent can call.' : '';
    var foot = a.editing ? '<button class="btn btn--tertiary" type="button" data-ap="edit-cancel">Cancel</button><button class="btn btn--primary" type="button" data-ap="edit-save">Save changes</button>'
      : '<span class="gate-reason' + (why ? ' u-fg-danger' : '') + '" id="' + id + '-why">' + (why || 'Checked ' + ago(a.checkedAt || F.now().toISOString())) + '</span><button class="btn btn--tertiary" type="button" data-ap="skip"' + (off ? ' aria-disabled="true" data-tooltip="' + A.offlineReason + '"' : '') + '>Skip step</button>' +
        (a.recipients || a.message ? '<button class="btn" type="button" data-ap="edit"' + (off ? ' aria-disabled="true" data-tooltip="' + A.offlineReason + '"' : '') + '>Edit…</button>' : '') +
        '<button class="btn btn--primary" type="button" data-primary data-ap="go" aria-describedby="' + id + '-why" aria-keyshortcuts="Control+Enter"' + (why ? ' aria-disabled="true"' : '') + '>' + esc(primaryLabel(a)) + '</button>';
    return '<div class="gate gate--card ag-approval" role="group" aria-labelledby="' + id + '-t" data-approval="' + a.id + '">' +
      '<div class="gate-head"><h3 class="gate-title" id="' + id + '-t">' + esc(titleOf(a)) + '</h3><div class="gate-sub ag-mline">' + A.mline(['From: <a href="agents.html?view=personal-agents&amp;task=' + a.taskId + '" data-pa-open="' + a.taskId + '">' + esc(t ? t.goal : 'a task') + '</a>', 'asked ' + ago(a.askedAt), 'expires ' + inH(a.expiresAt)]) + '</div></div>' +
      '<div class="gate-body">' + what + (rows ? '<ul class="gate-list">' + rows + '</ul>' : '') + '<div class="gate-cost"><span>' + esc(a.kind === 'message' ? sel(a).length + ' WhatsApp message' + (sel(a).length === 1 ? '' : 's') + ' from ' + V.data.org.inboundNumber.masked : a.impact.split(' · ')[0]) + '</span><b>' + esc(a.kind === 'message' ? 'messages can’t be unsent' : a.impact.split(' · ').slice(1).join(' · ')) + '</b></div></div>' +
      '<div class="gate-foot">' + foot + '</div></div>';
  };
  AP.renderAll = function () {
    var box = $('#pa-cards'); if (!box) return;
    if (A.is('partial')) { box.innerHTML = '<div class="ierr"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t load approvals. <button type="button" class="btn btn--link" data-pa="retry-all">Retry</button></span></div></div>'; return; }
    var list = P.approvals.slice().sort(function (a, b) { return new Date(a.expiresAt) - new Date(b.expiresAt); });
    box.innerHTML = list.slice(0, 3).map(function (a) { return AP.card(a, 'sec'); }).join('') + (list.length > 3 ? '<button class="btn btn--link" type="button" data-pa="view-waiting">Show all ' + list.length + ' waiting</button>' : '');
    V.initAll(box);
  };
  AP.sync = function (a, focus) {
    AP.renderAll(); if (A.taskSheet) A.taskSheet.refresh();
    if (focus) { var n = $$('[data-decided="' + a.id + '"]').filter(V.util.visible)[0]; if (n) n.focus(); }
  };

  /* ---------- decisions (idempotent: one key per decision; a double press decides once) ---------- */
  AP.decide = function (a, verb, btn) {
    if (a.decided || a.busy) return; a.busy = true;
    if (btn) { btn.setAttribute('aria-busy', 'true'); btn.innerHTML = icon('loader-circle', null, { className: 'spinner' }) + (verb === 'skip' ? 'Skipping…' : 'Sending…'); }
    setTimeout(function () {
      a.busy = false; var t = P.find(a.taskId), at = F.time(F.now().toISOString());
      a.decided = verb === 'skip' ? { text: 'Skipped: ' + (t && t.waitingOn || a.title) + ' · the agent moves on', at: at, tone: 'neutral' } : { text: a.kind === 'message' ? 'Sent ' + sel(a).length + ' message' + (sel(a).length === 1 ? '' : 's') : a.done, at: at };
      if (t) {
        t.state = 'working'; t.since = F.now().toISOString(); t.updatedAt = t.since; t.progress = verb === 'skip' ? 'Step 4 of 4 · messaging you a summary' : a.kind === 'message' ? 'Step 4 of 4 · messaging you a summary' : 'Step 3 of 3 · ' + a.done.toLowerCase();
        (t.plan || []).forEach(function (s) { if (s.state === 'waiting') { s.state = verb === 'skip' ? 'skipped' : 'done'; s.meta = verb === 'skip' ? 'Skipped by you' : a.decided.text; } else if (s.state === 'todo' && !t._next) { s.state = 'progress'; t._next = 1; } });
        t.activity.push({ at: t.since, icon: verb === 'skip' ? 'minus' : 'check', tone: verb === 'skip' ? null : 'success', text: verb === 'skip' ? 'You skipped: ' + a.title : 'You approved in the app: ' + a.decided.text });
      }
      V.data.state.tasksToConfirm = Math.max(0, (V.data.state.tasksToConfirm || 1) - 1);
      V.announce(a.decided.text); AP.sync(a, true); P.update();
    }, 700);
  };

  /* ---------- Call gate for a call decision (G §5.1, settings read-only; launched with the decision’s key) ---------- */
  AP.callGate = function (a, trigger) {
    var g = $('#pa-callgate'), n = sel(a).length, key = 'idem-' + a.id;
    var rows = [{ kind: 'pass', html: 'Caller ID <span class="phone-text" translate="no">' + esc(V.data.org.callerId.masked) + '</span> verified' }, { kind: 'pass', html: 'Inside calling hours', meta: 'Open until 5 pm IST today' }, { kind: 'pass', html: 'DND registry: ' + n + ' of ' + n + ' clear' }, { kind: 'advisory', html: 'Calls say they are recorded' }];
    g.innerHTML = '<div class="sheet-head"><div class="sheet-heading"><h2 class="sheet-title" id="pa-callgate-t">Call ' + n + ' people</h2><p class="sheet-meta">Nothing dials until you start · Checked just now</p></div><div class="sheet-actions"><button class="ibtn" type="button" data-drawer-close aria-label="Close">' + icon('x') + '</button></div></div>' +
      '<div class="sheet-body">' + A.kv([['For', esc(P.find(a.taskId).goal)], ['People', sel(a).map(function (r) { return esc(r.label); }).join(', ')], ['Voice', 'Vaani · Hindi, English'], ['Settings', 'From the task · read-only']], 'kv--rows') +
      '<div class="gate-group">Must pass<span class="gate-sum gate-sum--ok">' + icon('check', 'sm') + 'Ready · 1 thing to know</span></div><ul class="gate-list">' + rows.map(function (r) { return A.row(r.kind, r.html, { meta: r.meta }); }).join('') + '</ul>' +
      '<div class="gate-cost"><span>' + esc(F.callRange(n, 1, 2).split(' · ').slice(0, 2).join(' · ')) + '</span><b>' + esc(F.callRange(n, 1, 2).split(' · ')[2]) + '</b></div><p class="gate-note">' + esc(A.walletLine()) + '</p></div>' +
      '<div class="sheet-foot"><p class="dlg-why ag-why" id="pa-cg-why">Calls start in order within a minute.</p><button class="btn btn--tertiary" type="button" data-drawer-close>Cancel</button><button class="btn btn--primary" type="button" data-primary data-cg="start" aria-describedby="pa-cg-why">Start ' + n + ' calls</button></div>';
    V.initAll(g); g.setAttribute('data-idem', key);
    V.drawer.open(g, { mode: 'modal', returnTo: trigger });
    g.onclick = function (e) { var s = e.target.closest('[data-cg="start"]'); if (!s || a.busy) return; s.setAttribute('aria-busy', 'true'); s.innerHTML = icon('loader-circle', null, { className: 'spinner' }) + 'Starting…'; setTimeout(function () { V.drawer.close(g, 'done'); AP.decide(a, 'go'); }, 600); };
  };
  /* ---------- Confirm it’s you (ST §5) for Confirm + 2FA ---------- */
  AP.twoFactor = function (a, trigger) {
    var g = $('#pa-2fa');
    g.innerHTML = '<div class="dlg-head"><h2 class="dlg-title" id="pa-2fa-t">Confirm it’s you</h2><p class="dlg-desc">Enter the 6-digit code from your authenticator app to approve: ' + esc(a.title) + '.</p><button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + icon('x') + '</button></div>' +
      '<div class="dlg-body"><div class="field field--short"><label class="field-label" for="pa-2fa-code">Code</label><div class="input input--mono"><input id="pa-2fa-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" data-autofocus aria-describedby="pa-2fa-h pa-2fa-e"></div><p class="field-hint" id="pa-2fa-h">Prototype: any 6 digits work.</p><p class="field-error" id="pa-2fa-e" hidden></p></div></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-primary data-2fa="ok">Approve payment</button></div>';
    V.initAll(g); V.dialog.open(g, { returnTo: trigger });
    g.onclick = function (e) {
      if (!e.target.closest('[data-2fa="ok"]')) return; var v = $('#pa-2fa-code', g).value.trim(), er = $('#pa-2fa-e', g);
      if (!/^\d{6}$/.test(v)) { er.hidden = false; er.innerHTML = icon('circle-alert', 'sm') + '<span>Enter the 6-digit code.</span>'; $('#pa-2fa-code', g).setAttribute('aria-invalid', 'true'); $('#pa-2fa-code', g).focus(); return; }
      V.dialog.close(g, 'done'); AP.decide(a, 'go');
    };
  };

  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ap]'); if (!b) return; var card = b.closest('[data-approval]'), a = card && AP.find(card.getAttribute('data-approval')); if (!a) return;
    var act = b.getAttribute('data-ap'); if (A.blocked(b)) return;
    if (act === 'all') { a.showAll = !a.showAll; AP.sync(a); var nb = $('[data-approval="' + a.id + '"] [data-ap="all"]'); if (nb) nb.focus(); }
    else if (act === 'msg') { a.showMsg = !a.showMsg; AP.sync(a); var mb = $('[data-approval="' + a.id + '"] [data-ap="msg"]'); if (mb) mb.focus(); }
    else if (act === 'edit') { a.editing = true; a._undo = JSON.stringify({ r: a.recipients, m: a.message }); AP.sync(a); var f = $('[data-approval="' + a.id + '"] input, [data-approval="' + a.id + '"] textarea'); if (f) f.focus(); }
    else if (act === 'edit-cancel') { var u = JSON.parse(a._undo); a.recipients = u.r; a.message = u.m; a.editing = false; AP.sync(a); focusPrimary(a); }
    else if (act === 'edit-save') { if (!sel(a).length) { V.announce('Keep at least one person, or use Skip step.'); V.toast.info('Keep at least one person, or use Skip step.'); return; } a.editing = false; AP.sync(a); focusPrimary(a); V.announce('Saved. ' + primaryLabel(a)); }
    else if (act === 'skip') AP.decide(a, 'skip', b);
    else if (act === 'go') { if (a.kind === 'call') AP.callGate(a, b); else if (a.kind === 'money') AP.twoFactor(a, b); else AP.decide(a, 'go', b); }
  });
  function focusPrimary(a) { var p = $('[data-approval="' + a.id + '"] [data-primary]'); if (p) p.focus(); }
  d.addEventListener('change', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-ap-recip'); if (i == null) return; var a = AP.find(e.target.closest('[data-approval]').getAttribute('data-approval')); a.recipients[+i].off = !e.target.checked; var p = $('[data-approval="' + a.id + '"] .gate-title'); if (p) p.textContent = titleOf(a); });
  d.addEventListener('input', function (e) { if (!e.target.hasAttribute || !e.target.hasAttribute('data-ap-msg')) return; AP.find(e.target.closest('[data-approval]').getAttribute('data-approval')).message = e.target.value; });
})(window, document, window.Vaani, window.VaaniAgents);
