/* Vaani Labs prototype · Call reports · sheet footer and the review run (spec §2.6.4), the Call gate for "Call back…"
   (02-components-gate: nothing dials without a gate), the sheet and row menus, Re-analyse and Suggest knowledge. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, P = NS.page, $ = U.$, $$ = U.$$, esc = U.esc, fmt = V.fmt;
  function inRun() { return P.snap && P.snap.view === 'review'; }
  function nowIso() { return fmt.now().toISOString(); }
  function canUndo(c) { return c.reviewed && (c.reviewed.by === P.me || !P.member); }

  /* ---------- Call back… blockers (02-components-gate §4.4, as on Leads) ---------- */
  /* A global blocker is known before the gate opens: every entry point (Call back…, C on a row) stays aria-disabled, and
     activating one never opens the gate; it announces the reason and shows an info toast with the fix. Admins and members
     can both place calls, so no role blocks here. `inline` is the reason beside "Call back…" (spec §2.2, §2.6). */
  var TOPUP_LINK = '<a href="billing.html?topup=1" data-vaani-action="topup" data-topup-for="call">Top up</a>';
  NS.globalBlocker = function () {
    if (P.offline() || (V.connection && V.connection.isOffline())) return { reason: "You’re offline", inline: 'You’re offline. Calls need a connection.' };
    if (V.walletState() === 'empty') return { reason: 'Wallet is ₹0. Top up to place calls.', inline: 'Wallet is ₹0. ' + TOPUP_LINK + ' to place calls.',
      fix: { label: 'Top up', run: function (from) { V.openTopUp('call-reports', { forCall: true, returnTo: from, focusAfter: function () { return from && d.contains(from) && U.visible(from) ? from : $('#cs-callback'); } }); } } };
    var cid = (V.data.org || {}).callerId || {};
    if (P.flag('no-callerid') || cid.status !== 'verified') return { reason: 'No verified caller ID. Verify one in Settings › Phone setup.', inline: 'No verified caller ID. <a href="settings.html#phone/caller-id">Verify a number</a>',
      fix: { label: 'Verify a number', run: function () { w.location.href = 'settings.html#phone/caller-id'; } } };
    return null;
  };
  /* The footer’s reason adds this call’s own blocking check (DND, spec §2.6); from C that stays an in-gate row (gate §4.4 rule 5). */
  function blockReason(c) {
    return NS.globalBlocker() || (c._lead && c._lead.dnd ? { reason: 'On the DND list', inline: 'On the DND list. This number can’t be called.' } : null);
  }
  NS.blockedActivation = function (b) {
    var from = d.activeElement && d.activeElement !== d.body ? d.activeElement : null;
    V.announce(b.reason, { dedupeKey: 'cr-blocked' });
    /* force: the phone sheet is modal and would hold the toast back until it closes */
    V.toast.info(b.reason, b.fix ? { force: true, action: { label: b.fix.label, onClick: function () { b.fix.run(from); } } } : { force: true });
  };
  NS.renderFoot = function (c) {
    var f = $('#cs-foot'), why = blockReason(c), r = c.reviewed;
    var cb = c.phone ? '<button class="btn" type="button" id="cs-callback" data-after-topup' + (why ? ' aria-disabled="true" aria-describedby="cs-cbwhy"' : '') + '><i data-icon="phone"></i>Call back…</button>' +
      (why ? '<span class="cs-cbwhy" id="cs-cbwhy">' + why.inline + '</span>' : '') : '';
    var rev;
    if (c.test) rev = '';
    else if (r) {
      var who = r.by === P.me ? 'you' : r.by;
      rev = '<span class="status status--md" id="cs-revstatus">' + V.icon('check') + 'Reviewed by ' + esc(who) + ' · ' + esc(fmt.time(r.at)) + (canUndo(c) ? ' · <button type="button" class="btn btn--link" data-undo="' + c.id + '" aria-label="' + esc('Undo review of ' + P.callName(c)) + '">Undo</button>' : '') + '</span>' +
        (inRun() && nextUnreviewed(c.id) ? '<button class="btn" type="button" id="cs-nextun">Next unreviewed call' + V.icon('chevron-down', 'sm') + '</button>' : '');
    } else {
      var label = inRun() ? 'Mark reviewed and next' : 'Mark reviewed';
      rev = '<button class="btn" type="button" id="cs-review" data-tooltip="' + label + '" data-kbd="mod+enter" data-tooltip-kind="label"><i data-icon="check"></i>' + label + '</button>';
    }
    f.innerHTML = cb + rev + '<span class="l-spacer"></span>' + (c.leadId ? '<a class="btn btn--tertiary cs-openlead" href="leads.html?lead=' + esc(c.leadId) + '">Open lead</a>' : '');
    f.hidden = false; V.initAll(f);
  };
  /* Below 1024 the sheet is modal and its footer is the bottom chrome: toasts rise above it through the shared
     --toast-offset hook (call-reports.css), so a toast never covers the focused "Call back…" (WCAG 2.4.11). */
  if (w.ResizeObserver) new ResizeObserver(function () { d.body.style.setProperty('--cr-foot-h', ($('#cs-foot').offsetHeight || 0) + 'px'); }).observe($('#cs-foot'));
  /* The wallet state is pushed (a top-up here or in another tab): "Call back…" and its reason follow it. */
  V.on('wallet', function () {
    var c = P.openId && NS.callById(P.openId), s = $('#cr-sheet'); if (!c || s.hidden || s.classList.contains('cs-is-done')) return;
    var had = d.activeElement && d.activeElement.id === 'cs-callback'; NS.renderFoot(c); if (had && $('#cs-callback')) $('#cs-callback').focus();
  });
  /* "Next" is the next unreviewed call after this one in the snapshot; past the end it continues from the first skipped. */
  function nextUnreviewed(fromId) {
    var ids = P.snap.ids, i = ids.indexOf(fromId), open = function (id) { var c = NS.callById(id); return c && c.candidate && !c.reviewed; };
    for (var j = i + 1; j < ids.length; j++) if (open(ids[j])) return ids[j];
    for (var k = 0; k < Math.max(0, i); k++) if (open(ids[k])) return ids[k];
    return null;
  }
  function leftToReview() { return P.snap.ids.filter(function (id) { var c = NS.callById(id); return c && c.candidate && !c.reviewed; }).length; }
  function recount() { P.counts = NS.viewCounts(P.st.test, P.keep, P.extra); P.stats = NS.stats(P.rows); NS.renderMeta(); NS.renderViews(); NS.renderTotals(); }

  NS.markReviewed = function () {
    var c = NS.callById(P.openId); if (!c || c.reviewed || c.test) return;
    var btn = $('#cs-review'), andNext = inRun();
    $('#cs-ierr').hidden = true;
    c.reviewed = { by: P.me, at: nowIso() }; P.keep[c.id] = true; recount();
    if (btn) { btn.setAttribute('aria-busy', 'true'); btn.setAttribute('aria-disabled', 'true'); }
    /* The colleague demo: the server reports the third call of the run as reviewed by Dev M. meanwhile. */
    if (P.flag('colleague') && andNext && !P._colleagueDone) { P._colleagueDone = true; var third = P.snap.ids.filter(function (id) { var x = NS.callById(id); return x.candidate && !x.reviewed && x.id !== c.id; })[1]; if (third) { var x = NS.callById(third); x.reviewed = { by: 'Dev M.', at: V.data._util.ist(0, '11:40').replace('+05:30', '+05:30') }; P.keep[x.id] = true; } }
    setTimeout(function () {
      if (P.flag('review-fail')) { c.reviewed = null; recount(); NS.renderTable(); NS.renderFoot(c); var e = $('#cs-ierr'); e.hidden = false; e.innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t mark this call as reviewed. <button type="button" class="btn btn--link" data-retry-review>Retry</button></span></div></div>'; V.initAll(e); var b = $('#cs-review'); if (b) b.focus(); return; }
      NS.renderTable();
      if (!andNext) { NS.renderSheet(c); var s = $('#cs-revstatus'); V.announce('Marked reviewed'); if (s) { var u = $('[data-undo]', s); (u || $('#cs-title')).focus(); } return; }
      var next = nextUnreviewed(c.id), left = leftToReview();
      if (!next) { done(c.id, false); return; }
      NS.goTo(next, { focusTitle: true });
      var n = NS.callById(next), pos = P.snap.ids.indexOf(next) + 1;
      var nm = P.callWho(n); V.announce('Marked reviewed. Call ' + fmt.count(pos) + ' of ' + fmt.count(P.snap.ids.length) + ', ' + nm + (/\.$/.test(nm) ? ' ' : '. ') + left + ' left to review.', { dedupeKey: 'cr-review' });
    }, 220);
  };
  function undo(id) {
    var c = NS.callById(id); if (!c || !c.reviewed) return;
    c.reviewed = null; P.keep[c.id] = true; recount(); NS.renderTable();
    if (P.openId === id) { NS.renderSheet(c); var b = $('#cs-review'); if (b) b.focus(); }
    else { var r = $('#cr-tbody tr[data-id="' + id + '"]'); if (r) r.focus(); }
    V.announce('Review undone');
  }
  /* End of the run: the sheet shows a compact all-done state in place of a call (§2.6.4 rule 5). */
  function done(lastId, skipped) {
    NS.player.stop(); var el = $('#cr-sheet'), total = P.snap.ids.length, left = leftToReview();
    el.classList.add('cs-is-done'); P.lastReviewed = lastId;
    $('#cs-title').textContent = 'Needs review'; $('#cs-glance').innerHTML = ''; $('#cs-tabs').hidden = true; $('#cs-foot').hidden = true; $('#cs-bnotice').hidden = true;
    $$('.cs-panel', el).forEach(function (p) { p.hidden = true; });
    var box = $('#cs-done'); box.hidden = false;
    box.innerHTML = left ? '<div class="empty cs-alldone">' + V.icon('check', 'xl') + '<h3 class="empty-title">End of the list</h3><p>' + left + ' call' + (left === 1 ? '' : 's') + ' still need' + (left === 1 ? 's' : '') + ' review.</p><div class="empty-actions"><button type="button" class="btn" data-open-skipped>Open it</button><button type="button" class="btn btn--tertiary" data-back-list>Back to Call reports</button></div></div>'
      : '<div class="empty cs-alldone">' + V.icon('check', 'xl') + '<h3 class="empty-title">All ' + total + ' calls reviewed</h3><p>They leave Needs review when you refresh the view.</p><div class="empty-actions"><button type="button" class="btn" data-back-list>Back to Call reports</button></div></div>';
    V.initAll(box);
    $('#cs-title').focus();
    V.announce(left ? 'End of the list. ' + left + ' still to review.' : 'All ' + total + ' calls reviewed');
  }
  NS.nextUnreviewedFromHere = function () { var id = nextUnreviewed(P.openId); if (id) NS.goTo(id, { announce: true }); else done(P.openId, true); };

  /* ---------- the Call gate (anchored popover; bottom sheet on phones) ---------- */
  /* trigger anchors the gate; o.returnTo (the focused row, when `c` opened it) takes focus back on Esc or Cancel (03 §8.2). */
  NS.openGate = function (c, trigger, o) {
    o = o || {};
    if (!c || !c.phone) return;
    /* one check for every entry point: a global blocker never opens the gate; the footer’s aria-disabled "Call back…" also
       answers its own DND reason instead of opening */
    var why = NS.globalBlocker() || (trigger && trigger.id === 'cs-callback' ? blockReason(c) : null);
    if (why) { NS.blockedActivation(why); return; }
    /* the wallet facts in force (a top-up made from here moves them), as the Baseline shows them */
    var W = V.wallet.get(), ws = W.state, bal = W.balance, lead = c._lead;
    var row = function (kind, text, meta, act) { var icon = { pass: 'check', block: 'x', advisory: 'info', 'advisory-warn': 'triangle-alert' }[kind]; var sr = { pass: 'Passed: ', block: 'Blocking: ', advisory: 'Note: ', 'advisory-warn': 'Warning: ' }[kind]; return '<li class="gate-row"><span class="gate-mark gate-mark--' + kind + '" data-mark>' + V.icon(icon) + '</span><span class="gate-text"><span class="sr-only">' + sr + '</span>' + text + (meta ? '<span class="gate-meta">' + meta + '</span>' : '') + '</span>' + (act || '') + '</li>'; };
    var must = [row('pass', 'Caller ID ' + esc(V.data.org.callerId.masked) + ' verified'), row('pass', 'Inside calling hours', 'Open until ' + esc(V.data.org.callingHours.closesAt) + ' IST'),
      lead && lead.dnd ? row('block', 'On the DND list', 'This number is registered on the national DND registry.') : row('pass', 'DND registry: clear'),
      bal <= 0 ? row('block', 'Wallet is ₹0. Top up to place calls.', null, '<a class="gate-act" href="billing.html?topup=1" data-vaani-action="topup">Top up</a>') : ws === 'low' ? row('advisory-warn', esc(fmt.money(bal)) + ' left · ' + esc(W.runway || ''), null, '<a class="gate-act" href="billing.html?topup=1" data-vaani-action="topup">Top up</a>') : row('pass', 'Wallet ' + esc(fmt.money(bal)))];
    var blocked = (lead && lead.dnd) || bal <= 0;
    var g = $('#cr-gate');
    /* R2D-12 (gate §1.1): the header carries Close; the flow moves to a scope line so the cost row stays on one line */
    var flowTxt = c.flow ? c.flow.name + ' v' + (c.flow.draft ? 7 : c.flow.version) : 'Site-visit qualifier v7';
    g.innerHTML = '<div class="gate-head"><h2 class="gate-title" id="cr-gate-t">Call <span translate="no">' + esc(P.callWho(c)) + '</span></h2><button class="ibtn ibtn--sm gate-close" type="button" data-popover-close aria-label="Close">' + V.icon('x', 'sm') + '</button><div class="gate-sub">Their phone rings when you place the call. · Checked just now</div></div>' +
      '<div class="gate-body"><div class="gate-group">Must pass<span class="gate-sum ' + (blocked ? 'gate-sum--blocked' : 'gate-sum--ok') + '">' + V.icon(blocked ? 'x' : 'check', 'sm') + (blocked ? 'Blocked · 1 thing to fix' : 'Ready') + '</span></div><ul class="gate-list">' + must.join('') + '</ul>' +
      '<div class="gate-group">Good to know</div><ul class="gate-list">' + row('advisory', 'Calls say they are recorded') + row('advisory', 'Last call ' + esc(fmt.when(c.at, { time: true })) + ' · ' + esc(c.outcome || V.statusDef('callResult', c.result)[0])) + '</ul>' +
      '<div class="gate-scope"><span><span class="u-fg-3">Flow</span> <span translate="no">' + esc(flowTxt) + '</span></span></div>' +
      '<div class="gate-cost"><span>1 call · about 1 to 2 min</span><b class="u-nowrap">' + esc(fmt.callRange(1, 1, 2).split(' · ').pop()) + '</b></div>' +
      '<p class="gate-note">Wallet ' + esc(fmt.money(bal)) + (W.runway ? ' · ' + esc(W.runway) : '') + '</p></div>' +
      '<div class="gate-foot"><span class="gate-reason' + (blocked ? ' u-fg-danger' : '') + '" id="cr-gate-why">' + (blocked ? (bal <= 0 ? 'Calls can’t start with an empty wallet.' : 'This number can’t be called.') : 'Nothing dials until you place the call.') + '</span>' +
      '<button class="btn btn--tertiary" type="button" data-popover-close>Cancel</button><button class="btn btn--primary" type="button" id="cr-gate-go" data-kbd="mod+enter" data-tooltip="Place call"' + (blocked ? ' aria-disabled="true" aria-describedby="cr-gate-why"' : '') + '>Place call</button></div>';
    P.gateCall = c;
    var anchor = trigger || $('#cs-callback') || $('#page-title'), plain = !anchor.hasAttribute('aria-haspopup');
    /* an anchor that is not a popup button (the Lead link beside the docked sheet) must not keep a stray aria-expanded */
    var entry = V.popover.open(anchor, 'cr-gate', { placement: 'top-start', onClose: function () { if (plain) anchor.removeAttribute('aria-expanded'); } });
    if (entry && o.returnTo) entry.returnTo = o.returnTo;
    V.initAll(g);
  };
  function placeCall() {
    var b = $('#cr-gate-go'); if (!b || b.getAttribute('aria-disabled') === 'true') return;
    var c = P.gateCall; V.popover.close('cr-gate');
    V.toast({ kind: 'info', message: 'Calling ' + P.callWho(c) + '. Follow the call in Cockpit.', action: { label: 'Open Cockpit', onClick: function () { w.location.href = 'cockpit.html'; } } });
  }

  /* ---------- menus ---------- */
  function sheetMenu() {
    var c = NS.callById(P.openId); if (!c) return;
    var t = NS.player.time(), rec = c.recording && c.recording.available;
    var item = function (act, icon, label, dis) { return '<button class="menu-item" role="menuitem" type="button" data-act="' + act + '"' + (dis ? ' aria-disabled="true" data-reason="' + esc(dis) + '"' : '') + '>' + V.icon(icon) + '<span class="menu-text"><span>' + esc(label) + '</span>' + (dis ? '<span class="menu-desc">' + esc(dis) + '</span>' : '') + '</span></button>'; };
    $('#cs-more-menu').innerHTML = (c.leadId && V.bp.phone() ? item('lead', 'user', 'Open lead') : '') + item('copyid', 'copy', 'Copy call id') + item('linkat', 'link', 'Copy link at ' + fmt.timecode(t)) + item('reanalyse', 'refresh-cw', 'Re-analyse call', P.offline() ? "You’re offline" : null) +
      item('txt', 'download', 'Download transcript (.txt)') + item('rec', 'volume-2', 'Download recording…', P.member ? 'Admins only' : !rec ? 'No recording for this call' : null) + item('csv', 'file', 'Export call (CSV)') +
      '<div class="menu-sep" role="separator"></div>' + item('suggest', 'book-open', 'Suggest knowledge from this call…');
  }
  function act(a, c, trigger) {
    if (!c) return;
    if (a === 'open') NS.openCall(c.id, { returnTo: $('#cr-tbody tr[data-id="' + c.id + '"]') || trigger });
    else if (a === 'lead') { if (c.leadId) w.location.href = 'leads.html?lead=' + c.leadId; }
    else if (a === 'link') P.copy(new URL(P.href(c), w.location.href).href, 'Link copied');
    else if (a === 'copyid') P.copy(c.id, 'Call id copied');
    else if (a === 'linkat') { var t = NS.player.time(); P.copy(new URL(P.href(c, { t: t }), w.location.href).href, 'Link at ' + fmt.timecode(t) + ' copied'); }
    else if (a === 'reanalyse') NS.reanalyse(c);
    else if (a === 'txt') NS.downloadTranscript(c);
    else if (a === 'csv') { P.download('call-' + c.id + '.csv', P.csvOf([c], NS.COLS.concat([]), true), 'text/csv'); V.toast.success('Exported call-' + c.id + '.csv'); }
    else if (a === 'rec') V.dialog.confirm({ title: 'Download the recording of ' + P.callName(c) + '?', body: 'The file name and the transcript keep the number masked. The download is logged in Activity & Audit.', confirmLabel: 'Download recording' }).then(function (ok) { if (ok) V.toast.success('Recording download started · ' + c.id + '.mp3'); });
    else if (a === 'suggest') { var T = NS.turnsOf(c).filter(function (x) { return x.speaker === 'agent'; }).sort(function (x, y) { return y.text.length - x.text.length; })[0]; $('#cr-suggest-text').value = T ? T.text : (c.summary || ''); V.dialog.open('cr-suggest', { returnTo: trigger }); }
  }
  NS.reanalyse = function (c) {
    if (P.offline() || P.reanalysing) return;
    P.reanalysing = c.id; if (P.openId === c.id && P.st.tab === 'summary') NS.renderPanel(c, 'summary');
    V.announce('Re-analysing the call');
    if (P.openId !== c.id) V.toast.info('Re-analysing ' + P.callName(c) + '… about 20 s');
    setTimeout(function () {
      var before = c.sentiment; P.reanalysing = null; c.analysedAt = nowIso();
      if (c.sentiment === 'neutral' && !c.outcome) c.sentiment = 'negative';
      if (P.openId === c.id) { NS.renderSheet(c); }
      NS.renderTable();
      var msg = 'Analysis updated' + (before !== c.sentiment ? ' · sentiment changed from ' + V.statusDef('sentiment', before)[0] + ' to ' + V.statusDef('sentiment', c.sentiment)[0] : '');
      if (P.openId !== c.id || d.hidden) V.toast.success(msg); else V.announce(msg);
    }, 2400);
  };

  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('#cs-review,#cs-nextun,[data-undo],#cs-callback,#cr-gate-go,[data-retry-review],[data-back-list],[data-open-skipped],[data-full-summary],[data-reanalyse],[data-copy-id],[data-reveal],#cs-more,#cs-more-phone,[data-rowmenu],#cs-link,#cs-prev,#cs-next,#cs-close,#cs-back,[data-close-sheet],#cr-suggest-send');
    if (!t) return;
    var c = NS.callById(P.openId);
    if (t.id === 'cs-review' || t.hasAttribute('data-retry-review')) NS.markReviewed();
    else if (t.id === 'cs-nextun') NS.nextUnreviewedFromHere();
    else if (t.hasAttribute('data-undo')) undo(t.getAttribute('data-undo'));
    else if (t.id === 'cs-callback') NS.openGate(c, t);
    else if (t.id === 'cr-gate-go') placeCall();
    else if (t.hasAttribute('data-back-list')) { var id = P.lastReviewed; NS.closeSheet('x'); var r = $('#cr-tbody tr[data-id="' + id + '"]'); if (r) r.focus(); }
    else if (t.hasAttribute('data-open-skipped')) { var s = nextUnreviewed(P.openId); $('#cr-sheet').classList.remove('cs-is-done'); $$('.cs-panel').forEach(function (p) { p.hidden = p.id !== 'cs-p-' + P.st.tab; }); if (s) NS.goTo(s, {}); }
    else if (t.hasAttribute('data-full-summary')) NS.showTab('summary', true);
    else if (t.hasAttribute('data-reanalyse')) { if (t.getAttribute('aria-disabled') !== 'true') NS.reanalyse(c); }
    else if (t.hasAttribute('data-copy-id')) P.copy(c.id, 'Call id copied');
    else if (t.hasAttribute('data-reveal')) { t.outerHTML = '<span class="kv-src">Revealed to you for 30 s · logged in Activity &amp; Audit (the prototype keeps numbers masked)</span>'; }
    else if (t.id === 'cs-more' || t.id === 'cs-more-phone') { e.preventDefault(); e.stopPropagation(); sheetMenu(); V.menu.open(t, 'cs-more-menu', { placement: 'bottom-end' }); }
    else if (t.hasAttribute('data-rowmenu')) { e.preventDefault(); e.stopPropagation(); var rc = NS.callById(t.getAttribute('data-rowmenu')); P.rowMenuId = rc.id; $('#cr-row-menu [data-act="lead"]').hidden = !rc.leadId; V.menu.open(t, 'cr-row-menu', { placement: 'bottom-end' }); }
    else if (t.id === 'cs-link') { if (c) P.copy(new URL(P.href(c), w.location.href).href, 'Link copied'); }
    else if (t.id === 'cs-prev') { if (t.getAttribute('aria-disabled') !== 'true') NS.step(-1); }
    else if (t.id === 'cs-next') { if (t.getAttribute('aria-disabled') !== 'true') NS.step(1); }
    else if (t.id === 'cs-close' || t.id === 'cs-back' || t.hasAttribute('data-close-sheet')) { e.preventDefault(); NS.closeSheet('x'); }
    else if (t.id === 'cr-suggest-send') { V.dialog.close('cr-suggest', 'confirm'); V.toast.success('Suggestion sent. An admin reviews it in Knowledge.'); }
  }, true);
  d.addEventListener('vaani:menuselect', function (e) {
    var m = e.detail.item.closest('#cs-more-menu, #cr-row-menu'); if (!m) return;
    var c = m.id === 'cr-row-menu' ? NS.callById(P.rowMenuId) : NS.callById(P.openId);
    act(e.detail.item.getAttribute('data-act'), c, m.id === 'cr-row-menu' ? $('[data-rowmenu="' + (c && c.id) + '"]') : $('#cs-more'));
  });
  /* ⌘/Ctrl+Enter runs the review action; ⌘/Ctrl+F searches the transcript while focus is in the sheet. */
  NS.bindSheetKeys = function () {
    $('#cr-sheet').addEventListener('keydown', function (e) {
      var mod = U.isMac ? e.metaKey : e.ctrlKey; if (!mod) return;
      if (e.key === 'Enter') { var b = $('#cs-review') || $('#cs-nextun'); if (b) { e.preventDefault(); b.click(); } }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); NS.openTranscriptSearch(); }
    });
    $('#cr-gate').addEventListener('keydown', function (e) { var mod = U.isMac ? e.metaKey : e.ctrlKey; if (mod && e.key === 'Enter') { e.preventDefault(); placeCall(); } });
  };
})(window, document);
