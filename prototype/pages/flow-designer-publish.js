/* Vaani Labs prototype · Flow Designer · PublishGate (FD2 §5, G §5.2): the one door to Live. Checks → Where it goes
   live → Changes → Note; errors block, each warning needs a tick, testing is advisory with a recorded reason. Roll back
   (§6.4) is the same gate. Restore as draft (§6.3), Discard draft (§4.4) and Delete flow (§14.1, tier 3). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var G = null;
  function mark(kind, icon) { return '<span class="gate-mark gate-mark--' + kind + '" aria-hidden="true">' + (kind === 'checking' ? VF.icon('loader-circle', 'xs', { className: 'spinner' }) : VF.icon(icon, 'sm')) + '</span>'; }
  function row(kind, icon, text, meta, act, extra) { return '<li class="gate-row">' + mark(kind, icon) + '<span class="gate-text">' + text + (meta ? '<span class="gate-meta">' + meta + '</span>' : '') + (extra || '') + '</span><span class="gate-act">' + (act || '') + '</span></li>'; }
  function authors(rows) { var a = []; rows.forEach(function (r) { if (a.indexOf(r.by) < 0) a.push(r.by); }); return a.join(' and '); }

  VF.openPublish = function (o) {
    o = o || {}; if (S.publishing || (VF.unloaded && VF.unloaded())) return;
    var live = S.m.meta.live, rb = o.rollback, steps = rb ? VF.versionSteps(S.m, rb) : S.m.steps;
    G = { rollback: rb, steps: steps, acks: {}, skipTest: false, reason: '', note: rb ? 'Rolled back from v' + (live ? live.version : '') + ' to v' + rb + '’s content' : '', resetDraft: false, checking: true, trigger: o.trigger, fail: null, server: [] };
    G.diff = rb ? VF.diff(steps, S.m.live) : S.m.live ? VF.draftDiff() : null;
    VF.save.flush(function () {
      render(); var entry = V.drawer.open('fd-gate', { mode: 'modal', returnTo: o.trigger, onClose: function () { G = null; } }); G.entry = entry;
      setTimeout(function () { if (!G) return; G.checking = false; if (S.scen === 'gate-422' && !G.retried) G.server = [{ id: 's1', level: 'error', stepId: 'n4', msg: '#4 Book site visit: WhatsApp template "visit_confirm" was rejected minutes ago. Pick another.', server: true }]; render(); if (G.server.length) { var sm = $('#fd-gate-sum'); if (sm) { sm.tabIndex = -1; sm.focus(); } } }, 650);
    });
  };
  function state() {
    var issues = VF.validate(G.steps).concat(G.server), c = VF.counts(issues), warns = issues.filter(function (i) { return i.level === 'warning'; }), unacked = warns.filter(function (i) { return !G.acks[i.msg]; }).length;
    var tested = !G.rollback && S.lastTest && S.lastTest.hash === VF.hash(S.m.steps), live = S.m.meta.live, nextV = VF.nextV();
    var blockSave = S.save.state === 'error', blockConflict = S.scen === 'gate-409' && !G.reviewed, blockStale = S.scen === 'interim-stale' && !G.reapplied;
    var why = G.checking ? 'Checking the draft…' : blockSave ? "Your last " + Math.max(1, S.save.edits) + " edits haven’t saved. Retry" : blockStale ? 'Choose how to handle the other browser’s version first.' : blockConflict ? 'Review the other changes first.' : c.errors ? 'Fix ' + c.errors + ' error' + (c.errors === 1 ? '' : 's') + ' to publish.' : unacked ? 'Confirm ' + unacked + ' warning' + (unacked === 1 ? '' : 's') + ' to publish.' : (!tested && !G.rollback && !G.skipTest) ? 'Test the draft, or tick “Publish without testing” with a reason.' : (!tested && !G.rollback && G.skipTest && !G.reason) ? 'Choose a reason for publishing without testing.' : null;
    var label = G.rollback ? 'Roll back to v' + G.rollback : (warns.length && !why ? 'Publish with ' + warns.length + ' warning' + (warns.length === 1 ? '' : 's') : !tested && G.skipTest ? 'Publish without testing' : S.scen === 'interim' || S.scen === 'volatile' ? 'Publish' : 'Publish v' + (blockConflict ? nextV + 1 : nextV));
    return { issues: issues, c: c, warns: warns, tested: tested, why: why, label: label, live: live, nextV: nextV };
  }
  /* Every re-render keeps focus where it was (the same control, else the title) and the scroll position, so the modal
     gate never drops focus to <body> while its checks finish or a tick re-renders it (O §1.3, FD2 §20). */
  function focusKey(g) {
    var a = d.activeElement; if (!a || a === d.body || !g.contains(a)) return a === d.body || !a ? { title: true } : null;
    if (a.id) return { sel: '#' + CSS.escape(a.id) };
    var attrs = ['data-g', 'data-ack', 'data-goto', 'data-show', 'data-drawer-close'];
    for (var i = 0; i < attrs.length; i++) if (a.hasAttribute(attrs[i])) { var all = $$('[' + attrs[i] + '="' + CSS.escape(a.getAttribute(attrs[i])) + '"]', g); return { sel: '[' + attrs[i] + '="' + CSS.escape(a.getAttribute(attrs[i])) + '"]', idx: all.indexOf(a) }; }
    return { title: true };
  }
  function render() {
    var g = $('#fd-gate'), open = !g.hidden && g.isConnected, fk = open ? focusKey(g) : null, sc = $('.fd-gate-scroll', g), top = sc ? sc.scrollTop : 0;
    paint();
    var sc2 = $('.fd-gate-scroll', g); if (sc2 && top) sc2.scrollTop = top;
    if (!fk) return;
    var n = null; if (fk.sel) { var list = $$(fk.sel, g); n = list[Math.max(0, fk.idx || 0)] || list[0] || null; }
    if (!n || !V.util.visible(n)) n = $('#fd-gate-t', g);
    if (n && d.activeElement !== n) n.focus({ preventScroll: true });
  }
  function paint() {
    var g = $('#fd-gate'), st = state(), live = st.live, interim = S.scen === 'interim' || S.scen === 'volatile' || S.scen === 'interim-stale', rb = G.rollback;
    var title = rb ? 'Roll back to v' + rb : interim ? 'Publish' : 'Publish v' + st.nextV;
    var sub = rb ? 'Publishes v' + rb + '’s content as v' + st.nextV + '. Calls already placed on v' + live.version + ' stay recorded on v' + live.version + '.' : esc(S.m.meta.name) + (live ? ' · draft from v' + live.version + ' · ' + G.diff.count + ' change' + (G.diff.count === 1 ? '' : 's') + (G.diff.rows.length ? ' by ' + esc(authors(G.diff.rows)) : '') : ' · first version · ' + S.m.steps.length + ' steps');
    var sumCls = G.checking ? '' : st.c.errors ? ' gate-sum--blocked' : st.warns.length ? ' gate-sum--warn' : ' gate-sum--ok';
    var sumTxt = G.checking ? 'Checking…' : G.server.length ? 'The server found ' + G.server.length + ' more error' : st.c.errors ? st.c.errors + ' error' + (st.c.errors === 1 ? '' : 's') + ' block' + (st.c.errors === 1 ? 's' : '') + ' publishing' : st.warns.length ? 'Ready · ' + st.warns.length + ' warning' + (st.warns.length === 1 ? '' : 's') + ' to confirm' : 'Ready to publish';
    var checks = '';
    if (S.scen === 'interim-stale' && !G.reapplied) checks += row('block', 'x', 'This flow was published from another browser at 11:31 am. Your draft is based on an older copy.', 'Re-apply my changes on top, or discard my draft.', '', '<span class="l-cluster u-mt-8"><button type="button" class="btn btn--sm" data-g="reapply">Re-apply my changes on top</button><button type="button" class="btn btn--sm btn--danger" data-g="discard">Discard my draft</button></span>');
    if (S.scen === 'gate-409' && !G.reviewed && !G.checking) checks += row('block', 'x', 'Rohit S. published v' + st.nextV + ' at 11:40 am while this was open. This draft now publishes as v' + (st.nextV + 1) + '.', null, '<button type="button" class="btn btn--link" data-g="review409">Review changes</button>');
    if (S.save.state === 'error') checks += row('block', 'x', "Your last " + Math.max(1, S.save.edits) + " edits haven’t saved.", null, '<button type="button" class="btn btn--link" data-g="retrysave">Retry</button>');
    if (G.checking) checks += row('checking', '', 'Checking the rules on this draft…', interim ? 'Checked on this device.' : 'The server runs the same rules.');
    else {
      var errs = st.issues.filter(function (i) { return i.level === 'error'; });
      checks += errs.length ? row('block', 'x', errs.length + ' error' + (errs.length === 1 ? '' : 's'), null, '', '<ul class="fd-gate-sub">' + errs.map(function (i) { return '<li>' + esc(i.msg) + (i.server ? ' <span class="u-fg-3">· Found when publishing</span>' : '') + ' <button type="button" class="btn btn--link" data-goto="' + esc(i.stepId || '') + '">Go to step</button></li>'; }).join('') + '</ul>')
        : row('pass', 'check', 'No errors', G.steps.length + ' steps checked just now. ' + (interim ? 'Checked on this device.' : 'The server runs the same rules.'));
      st.warns.forEach(function (i, k) { checks += row('advisory-warn', 'triangle-alert', esc(i.msg), null, i.stepId ? '<button type="button" class="btn btn--link" data-goto="' + esc(i.stepId) + '">Go to step</button>' : '', '<label class="check check--dense fd-ack"><input type="checkbox" class="cb" data-ack="' + esc(i.msg) + '"' + (G.acks[i.msg] ? ' checked' : '') + '><span class="check-text">Publish with this warning</span></label>'); void k; });
      if (!rb) checks += st.tested ? row('pass', 'check', 'Tested on this draft', esc(S.lastTest.kind) + ' · ' + esc(V.fmt.when(S.lastTest.at)) + (S.lastTest.reached ? ' · reached “' + esc(S.lastTest.reached) + '”' : ''))
        : row('advisory-warn', 'info', S.lastTest ? 'Tested before your last change.' : 'Not tested since your last change.', null, '<button type="button" class="btn btn--link" data-g="testnow">Test now</button>', '<label class="check check--dense fd-ack"><input type="checkbox" class="cb" data-g="skiptest"' + (G.skipTest ? ' checked' : '') + '><span class="check-text">Publish without testing</span></label>' + (G.skipTest ? '<div class="field fd-reason"><label class="field-label" for="fd-g-reason">Reason</label><select class="select-native" id="fd-g-reason"><option value="">Choose a reason</option>' + ['Wording change only', 'Urgent fix', 'Tested another way', 'Other'].map(function (x) { return '<option' + (G.reason === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' : ''));
      if (V.walletState() === 'empty') checks += row('advisory-warn', 'wallet', 'Wallet is ₹0. Calls on v' + st.nextV + ' won’t connect until you top up.', null, '<a class="btn btn--link" href="billing.html?topup=1">Top up</a>');
    }
    var used = interim ? '<ul class="fd-livelist"><li>' + VF.icon('house', 'md') + '<span>Your Cockpit default</span></li></ul><p class="gate-note">Where else this flow is used isn’t known yet.</p>'
      : live ? '<ul class="fd-livelist">' + live.usedBy.map(function (u) { return '<li>' + VF.icon(u.kind === 'inbound' ? 'phone-incoming' : u.kind === 'batch' ? 'list-checks' : 'house', 'md') + '<span>' + (u.kind === 'inbound' ? 'Inbound ' + V.ui.phoneText(u.label) : esc(u.label)) + (u.detail ? ' <span class="u-fg-3">· ' + esc(u.detail.replace('{next}', st.nextV)) + '</span>' : '') + '</span></li>'; }).join('') + '</ul><p class="gate-note">Calls in progress finish on v' + live.version + '. New calls use v' + st.nextV + '.</p>'
      : '<p class="gate-note">Nothing uses this flow yet. After publishing, choose it in Phone setup, a Leads batch or <b>Make workspace default</b>. Nothing called this flow before.</p>';
    var rows = G.diff ? G.diff.rows : [], shown = G.showAll ? rows : rows.slice(0, 8);
    var changes = !G.diff ? '<p class="gate-note">First version · ' + S.m.steps.length + ' steps</p>' : !rows.length ? '<p class="gate-note">No changes.</p>' : '<ul class="fd-difflist">' + shown.map(function (r) { return '<li><span class="fd-diff-kind">' + (r.kind === 'added' ? 'Added' : r.kind === 'removed' ? 'Removed' : r.kind === 'layout' ? 'Layout' : 'Changed') + '</span><span class="fd-diff-main"><span translate="no">' + esc(r.label) + '</span><span class="u-fg-2"> · ' + esc(r.summary) + '</span><span class="u-fg-3"> · by ' + esc(r.by) + '</span></span>' + (r.id && !rb ? '<button type="button" class="btn btn--link" data-show="' + esc(r.id) + '">Show</button>' : '') + '</li>'; }).join('') + '</ul>' + (rows.length > 8 && !G.showAll ? '<button type="button" class="btn btn--link" data-g="all">Show all ' + rows.length + ' changes</button>' : '');
    var resetDraft = rb && VF.draftDiff().count ? '<label class="check check--dense"><input type="checkbox" class="cb" data-g="reset"' + (G.resetDraft ? ' checked' : '') + '><span class="check-text"><span>Also reset my draft to v' + rb + '’s content (removes ' + VF.draftDiff().count + ' unpublished changes)</span><span class="check-desc">Left unticked, your draft keeps its changes and publishing it later brings them back.</span></span></label>' : '';
    var err = G.fail ? '<div class="ierr" role="alert"><div class="ierr-line">' + VF.icon('circle-alert') + '<span>Couldn’t publish. Nothing changed: callers still hear v' + live.version + '. <button type="button" class="btn btn--link" data-g="retry">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>POST /v1/flows/' + esc(S.m.meta.shortId) + '/publish · network error · request id req_4f21c</code></div></details></div>' : '';
    var foot = G.checking || st.why ? (G.checking ? 'Checking the draft…' : st.why) : rb ? 'Callers hear v' + rb + '’s content from the next call.' : 'Callers hear v' + st.nextV + ' from the next call.';
    g.innerHTML = '<div class="gate-head"><div class="fd-gate-top"><button type="button" class="ibtn fd-gate-back" data-drawer-close aria-label="Back">' + VF.icon('chevron-left') + '</button><h2 class="gate-title" id="fd-gate-t" tabindex="-1" data-focus-target>' + esc(title) + '</h2><button type="button" class="ibtn fd-gate-x" data-drawer-close aria-label="Close">' + VF.icon('x') + '</button></div><span class="gate-sub">' + sub + '</span></div>' +
      '<div class="fd-gate-scroll"><div class="gate-body">' + err +
      '<section class="fd-gate-sec" aria-labelledby="fd-gs-1"><div class="gate-group"><h3 class="fd-gate-h" id="fd-gs-1">Checks</h3><p class="gate-sum' + sumCls + '" id="fd-gate-sum" role="status">' + esc(sumTxt) + '</p></div><ul class="gate-list">' + checks + '</ul></section>' +
      '<section class="fd-gate-sec" aria-labelledby="fd-gs-2"><h3 class="fd-gate-h" id="fd-gs-2">Where it goes live</h3>' + used + '</section>' +
      '<section class="fd-gate-sec" aria-labelledby="fd-gs-3"><h3 class="fd-gate-h" id="fd-gs-3">Changes' + (G.diff ? ' (' + G.diff.count + ')' : '') + '</h3>' + changes + resetDraft + '</section>' +
      (interim ? '' : '<section class="fd-gate-sec"><div class="field"><label class="field-label" for="fd-g-note">Note <span class="field-opt">(optional)</span></label><textarea class="textarea" id="fd-g-note" rows="1" maxlength="600" placeholder="What changed and why…">' + esc(G.note) + '</textarea></div></section>') +
      '</div></div><div class="gate-foot"><span class="gate-reason" id="fd-gate-why">' + esc(foot) + '</span><button type="button" class="btn btn--tertiary" data-drawer-close' + (S.publishing ? ' aria-disabled="true"' : '') + '>Cancel</button><button type="button" class="btn btn--primary" data-g="go" aria-describedby="fd-gate-why"' + (S.publishing ? ' aria-busy="true" aria-disabled="true"' : G.checking || st.why ? ' aria-disabled="true"' : '') + '>' + (S.publishing ? VF.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Publishing…' : esc(st.label)) + '</button></div>';
  }
  VF.publishInit = function () {
    var g = $('#fd-gate');
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g], [data-goto], [data-show]'); if (!b || !G) return;
      if (b.hasAttribute('data-goto')) { var id = b.getAttribute('data-goto'); V.drawer.close('fd-gate', 'navigate'); if (id) setTimeout(function () { var i = S.issues.filter(function (x) { return x.stepId === id; })[0]; if (i) VF.goToIssue(i); else { VF.select([id]); VF.focusStep(id); VF.openInspector(id); } }, 0); return; }
      if (b.hasAttribute('data-show')) { var sid = b.getAttribute('data-show'); V.drawer.close('fd-gate', 'navigate'); setTimeout(function () { if (S.mode === 'phone') { VF.select([sid]); VF.openInspector(sid); } else { VF.enterCompare('live', sid); } }, 0); return; }
      var a = b.getAttribute('data-g');
      if (a === 'go') { if (b.getAttribute('aria-disabled') === 'true') { V.announce($('#fd-gate-why').textContent); return; } G.note = ($('#fd-g-note') || { value: '' }).value; publish(); }
      if (a === 'testnow') { V.drawer.close('fd-gate', 'navigate'); setTimeout(function () { VF.toggleTest({ open: true }); }, 0); }
      if (a === 'retry') { G.fail = null; G.retried = true; render(); publish(); }
      if (a === 'retrysave') { VF.save.retry(); setTimeout(function () { if (G) render(); }, 700); }
      if (a === 'review409') { G.reviewed = true; V.announce('Rohit S. changed Polite close. Your draft now publishes as v' + (VF.nextV() + 1) + '.'); render(); }
      if (a === 'reapply') { G.reapplied = true; V.announce('Your 3 changes were re-applied on top. No conflicts.'); render(); }
      if (a === 'discard') { V.drawer.close('fd-gate', 'navigate'); setTimeout(function () { VF.discardDraft(); }, 0); }
      if (a === 'all') { G.showAll = true; render(); }
    });
    g.addEventListener('change', function (e) {
      var t = e.target; if (!G) return;
      if (t.hasAttribute('data-ack')) { G.acks[t.getAttribute('data-ack')] = t.checked; rerender(t); }
      if (t.getAttribute('data-g') === 'skiptest') { G.skipTest = t.checked; rerender(t); }
      if (t.getAttribute('data-g') === 'reset') G.resetDraft = t.checked;
      if (t.id === 'fd-g-reason') { G.reason = t.value; rerender(t); }
    });
    g.addEventListener('input', function (e) { if (e.target.id === 'fd-g-note' && G) G.note = e.target.value; });
    g.addEventListener('keydown', function (e) { if ((V.util.isMac ? e.metaKey : e.ctrlKey) && e.key === 'Enter') { var b = $('[data-g="go"]', g); if (b && b.getAttribute('aria-disabled') !== 'true') { e.preventDefault(); b.click(); } } });
  };
  function rerender(t) { var sel = t.id ? '#' + t.id : t.hasAttribute('data-ack') ? '[data-ack="' + CSS.escape(t.getAttribute('data-ack')) + '"]' : '[data-g="' + t.getAttribute('data-g') + '"]'; render(); var n = $(sel, $('#fd-gate')); if (n) n.focus(); }
  function publish() {
    S.publishing = true; if (G.entry) G.entry.busy = true; render(); VF.renderHeader();
    setTimeout(function () {
      if (S.scen === 'gate-network' && !G.retried) { S.publishing = false; if (G.entry) G.entry.busy = false; G.fail = true; render(); VF.renderHeader(); var er = $('#fd-gate .ierr'); if (er) { er.tabIndex = -1; er.focus(); } return; }
      var live = S.m.meta.live, prev = live ? live.version : 0, next = VF.nextV(), rb = G.rollback, content = rb ? VF.clone(G.steps) : VF.clone(S.m.steps), note = G.note, reason = G.skipTest ? G.reason : null;
      if (!live) { S.m.meta.live = live = { version: 1, since: VF.nowIso(), publishedBy: 'Anika R.', usedBy: [] }; } else { live.version = next; live.since = VF.nowIso(); live.publishedBy = 'Anika R.'; }
      /* FD-R3-01 (FD2 §6.4, §23): the outgoing Live keeps a snapshot of its content, and the new version stores its own, so a later
         Roll back publishes exactly that version's content. A clean draft follows Live after a rollback. */
      var wasClean = !VF.draftDiff().count, old = (S.m.versions || []).filter(function (x) { return x.v === prev; })[0];
      if (old && !old.steps && S.m.live) old.steps = VF.clone(S.m.live);
      S.m.live = content; if (rb && (G.resetDraft || wasClean)) S.m.steps = VF.clone(content);
      S.m.versions.unshift({ v: next, from: VF.nowIso(), to: null, by: 'Anika R.', note: note, tested: reason ? 'Published without testing: ' + reason.toLowerCase() : S.lastTest ? 'Tested: ' + S.lastTest.kind.toLowerCase() : 'Not tested', calls: null, steps: VF.clone(content) });
      if (S.m.versions[1]) S.m.versions[1].to = VF.nowIso();
      S.lastPublished = { from: prev, to: next }; S.publishing = false;
      var trig = G.trigger; if (G.entry) G.entry.busy = false; V.drawer.close('fd-gate', 'navigate'); G = null;
      var interim = S.scen === 'interim' || S.scen === 'volatile' || S.scen === 'interim-stale';
      if (!interim) { S.save.state = 'saved'; S.save.at = VF.clock(); }
      VF.revalidate(true); VF.emit('change', { structure: true, keepTest: true, publish: true }); VF.renderHeader();
      var n = (live.usedBy || []).filter(function (u) { return u.kind === 'inbound'; }).length, b = (live.usedBy || []).filter(function (u) { return u.kind === 'batch'; }).length;
      if (interim) V.toast.publish('Published. Callers hear this version from the next call.');
      else if (next === 1) V.toast.publish('v1 is live. Choose where to use it', { action: { label: 'Where to use it', onClick: function () { V.toast.info('Phone setup, a Leads batch or Make workspace default.'); } } });
      else if (rb) V.toast.publish('v' + next + ' is live with v' + rb + '’s content. Calls on v' + prev + ' stay on v' + prev + '. Undo isn’t possible; roll back again from History.');
      else V.toast.publish('v' + next + ' is live on ' + n + ' number' + (n === 1 ? '' : 's') + ' and ' + b + ' batch' + (b === 1 ? '' : 'es'), { action: { label: 'Roll back to v' + prev + '…', onClick: function () { VF.openPublish({ rollback: prev, trigger: $('.fd-publish') }); } } });
      V.announce('Version ' + next + ' is live.');
      setTimeout(function () { var pb = S.mode === 'phone' ? $('#fd-sticky .fd-publish') : $('#fd-head-r .fd-publish'); (pb || $('#page-title')).focus(); }, 60); void trig;
    }, 900);
  }

  /* Restore as draft (FD2 §6.3): never changes Live. */
  VF.restoreVersion = function (v) {
    var n = VF.draftDiff().count, live = S.m.meta.live;
    function go() { VF.exitVersion({ quiet: true }); VF.act('restore v' + v + ' as draft', function () { S.m.steps = VF.versionSteps(S.m, v); }, { structure: true }); V.toast.success('Draft now matches v' + v + '. Live v' + live.version + ' is unchanged.', { action: { label: 'Undo', onClick: VF.undo } }); }
    if (!n) return go();
    V.dialog.confirm({ title: 'Replace your draft with v' + v + '?', body: 'Your ' + n + ' unpublished change' + (n === 1 ? ' is' : 's are') + ' removed. Live v' + live.version + ' is unchanged.', confirmLabel: 'Replace draft' }).then(function (ok) { if (ok) go(); });
  };
  /* Discard draft changes (FD2 §4.4, tier 2). */
  VF.discardDraft = function (trigger) {
    var diff = VF.draftDiff(), live = S.m.meta.live; if (!diff.count) return;
    var others = diff.rows.filter(function (r) { return r.by !== 'you'; }).length;
    V.dialog.confirm({ title: 'Discard draft changes?', body: 'Your draft goes back to Live v' + live.version + '. The ' + diff.count + ' change' + (diff.count === 1 ? '' : 's') + ' since then ' + (diff.count === 1 ? 'is' : 'are') + ' removed' + (others ? ', including ' + others + ' by Rohit S.' : '') + '.', confirmLabel: 'Discard changes', tone: 'danger', returnTo: trigger })
      .then(function (ok) { if (!ok) return; VF.act('discard draft', function () { S.m.steps = VF.clone(S.m.live); }, { structure: true }); VF.closeInspector({ returnFocus: false }); V.toast.success('Draft reset to Live v' + live.version, { action: { label: 'Undo', onClick: VF.undo } }); });
  };
  VF.deleteFlow = function (trigger) {
    var live = S.m.meta.live;
    V.dialog.confirm({ title: 'Delete ‘' + S.m.meta.name + '’?', body: live ? 'This flow is live. Choose a replacement for its number before deleting; call reports for its calls are kept.' : 'Its draft is removed. Call reports are kept.', impact: live ? [{ icon: 'phone-incoming', text: '+91 80 •••• 2210 answers with it · it will answer with EMI reminder' }, { icon: 'list-checks', text: "Batch 'Weekend follow-ups' · 46 queued calls will be cancelled" }] : null, confirmLabel: 'Delete flow', tone: 'danger', typedConfirm: live ? { value: S.m.meta.name, hint: 'Type the flow name to confirm.' } : null, returnTo: trigger })
      .then(function (ok) { if (ok) V.toast.info('Deleting flows is not wired in this prototype. Nothing changed.'); });
  };
})(window, document);
