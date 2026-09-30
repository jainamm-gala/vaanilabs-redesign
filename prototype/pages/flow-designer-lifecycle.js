/* Vaani Labs prototype · Flow Designer · lifecycle surfaces: Compare with live (FD2 §4.5, CompareBar), viewing an old
   version (§6.2), VersionHistory (§6.1), the conflict sheet (§4.6), Flow settings (§11) and the page and canvas Notices
   (one page Notice at most; canvas notices sit at the top of the canvas). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;

  /* ---------- Compare ---------- */
  VF.enterCompare = function (against, focusId) {
    if (!S.m.live) { V.toast.info('Not live yet. There is nothing to compare with.'); return; }
    if (S.viewing) VF.exitVersion({ quiet: true });
    var base = against === 'live' ? S.m.live : VF.versionSteps(S.m, against);
    S.compare = { against: against, base: base, label: against === 'live' ? 'Live v' + S.m.meta.live.version : 'v' + against, diff: VF.diff(S.m.steps, base), idx: -1 };
    S.compare.list = S.compare.diff.rows.filter(function (r) { return r.id; });
    VF.renderAll(); var D = S.compare.diff;
    V.announce('Comparing draft with ' + S.compare.label + ' · ' + D.added + ' added · ' + D.changed + ' changed · ' + D.removed + ' removed');
    if (focusId) { var i = S.compare.list.map(function (r) { return r.id; }).indexOf(focusId); VF.compareStep(0, i < 0 ? 0 : i); } else { var b = $('.fd-cmpbar [data-c="next"]'); if (b) b.focus(); }
  };
  VF.exitCompare = function () { if (!S.compare) return; S.compare = null; VF.renderAll(); V.announce('Compare closed'); var b = $('.fd-note-link') || $('#fd-head-r .fd-publish'); if (b) b.focus(); };
  VF.compareStep = function (dir, abs) {
    var c = S.compare; if (!c || !c.list.length) return; c.idx = abs != null ? abs : ((c.idx + dir) % c.list.length + c.list.length) % c.list.length;
    var r = c.list[c.idx]; VF.renderCompareBar($('#fd-pbar'));
    V.announce('Change ' + (c.idx + 1) + ' of ' + c.list.length + ': ' + r.label + ', ' + r.kind);
    if (VF.step(r.id)) { VF.select([r.id]); VF.focusStep(r.id); VF.openInspector(r.id); } else { var g = $('.fd-ghost[data-id="' + r.id + '"]'); if (g) VF.reveal(r.id); }
  };
  VF.renderCompareBar = function (bar) {
    var c = S.compare, D = c.diff, n = c.list.length;
    bar.innerHTML = '<div class="fd-pb-l"><span class="fd-cmp-t">' + VF.icon('git-compare', 'sm') + 'Comparing draft with ' + esc(c.label) + ' · ' + D.added + ' added · ' + D.changed + ' changed · ' + D.removed + ' removed</span></div><div class="fd-pb-r"><button type="button" class="btn btn--tertiary btn--sm" data-c="prev"' + (n ? '' : ' aria-disabled="true"') + ' data-kbd="[">' + VF.icon('chevron-left', 'sm') + 'Previous change</button>' + (n && c.idx >= 0 ? '<span class="count-badge">' + (c.idx + 1) + ' of ' + n + '</span>' : '') + '<button type="button" class="btn btn--tertiary btn--sm" data-c="next"' + (n ? '' : ' aria-disabled="true"') + ' data-kbd="]">Next change' + VF.icon('chevron-right', 'sm') + '</button><button type="button" class="btn btn--tertiary btn--sm" data-c="exit" data-kbd="Esc">Exit compare</button></div>';
    bar.onclick = function (e) { var b = e.target.closest('[data-c]'); if (!b || b.getAttribute('aria-disabled') === 'true') return; var a = b.getAttribute('data-c'); if (a === 'exit') VF.exitCompare(); else VF.compareStep(a === 'next' ? 1 : -1); };
  };

  /* ---------- Viewing an old version (?v=5) ---------- */
  VF.viewVersion = function (v) {
    var ver = S.m.versions.filter(function (x) { return x.v === v; })[0]; if (!ver) return;
    S.compare = null; S.viewing = { v: v, ver: ver, steps: VF.versionSteps(S.m, v) }; S.sel = []; VF.closeInspector({ returnFocus: false });
    VF.renderAll(); VF.fit(null, { instant: true, min: 0.5, max: 1 }); V.announce('Viewing v' + v + '. Read-only.');
    var n = $('#fd-canvas-top .notice'); if (n) { var l = n.querySelector('button'); if (l) l.focus(); }
  };
  VF.exitVersion = function (o) { if (!S.viewing) return; S.viewing = null; S.sel = []; VF.closeInspector({ returnFocus: false }); VF.renderAll(); if (!(o && o.quiet)) { V.announce('Back to the draft'); VF.focusStep(S.focus || VF.callOrder(S.m.steps).order[0], { reveal: false }); } };

  /* ---------- VersionHistory (left panel at ≥ 1024, a sheet below) ---------- */
  function historyHtml() {
    var live = S.m.meta.live, n = VF.draftDiff().count, vs = S.m.versions;
    var draft = '<li class="tl-item fd-ver fd-ver--draft"><span class="tl-node tl-node--info" aria-hidden="true">' + VF.icon('square-pen', 'sm') + '</span><div class="tl-text"><b>Draft</b>' + (live ? ' · ' + (n ? n + ' change' + (n === 1 ? '' : 's') + ' since v' + live.version : 'matches v' + live.version) : ' · not published') + '<span class="gate-meta">Edited by you, ' + esc(V.fmt.when(S.m.draftEditedAt || VF.nowIso())) + '</span></div><span class="tag tag--info">Current</span></li>';
    var list = (S.histAll ? vs : vs.slice(0, 4)).map(function (x) {
      var isLive = live && x.v === live.version;
      return '<li class="tl-item fd-ver"><span class="tl-node' + (isLive ? ' tl-node--success' : '') + '" aria-hidden="true">' + (isLive ? '<span class="live-dot" data-mark></span>' : VF.icon('history', 'sm')) + '</span><div class="tl-text"><b class="num">v' + x.v + '</b> ' + (isLive ? V.ui.statusTag('flow', 'live', { v: x.v }).replace('Live v' + x.v, 'Live') : '') +
        '<span class="gate-meta">' + esc(V.fmt.dateShort(x.from)) + (x.to ? ' to ' + esc(V.fmt.dateShort(x.to)) : ', ' + esc(V.fmt.time(x.from))) + ' · ' + esc(x.by) + '</span>' + (x.note ? '<span class="fd-ver-note">“' + esc(x.note) + '”</span>' : '') + '<span class="gate-meta">' + esc(x.tested || '') + (x.calls ? ' · <a href="call-reports.html?f.flow=' + S.m.meta.id + '&amp;f.version=' + x.v + '">' + V.fmt.count(x.calls) + ' calls</a>' : '') + '</span></div>' +
        '<button type="button" class="ibtn ibtn--sm" data-ver="' + x.v + '" aria-haspopup="menu" aria-label="Actions for v' + x.v + '">' + VF.icon('ellipsis', 'sm') + '</button></li>';
    }).join('');
    return '<ol class="tl-list fd-verlist" aria-label="Versions">' + draft + list + '</ol>' + (vs.length > 4 && !S.histAll ? '<button type="button" class="btn btn--tertiary btn--sm" data-histall>Show older versions</button>' : '') + (!vs.length ? '<div class="empty empty--compact">No versions yet. Publishing creates v1.</div>' : '');
  }
  function wireHistory(root, closeFirst) {
    root.onclick = function (e) {
      if (e.target.closest('[data-histall]')) { S.histAll = true; VF.refreshLeft(); return; }
      var b = e.target.closest('[data-ver]'); if (!b) return; var v = +b.getAttribute('data-ver'), live = S.m.meta.live, isLive = live && v === live.version;
      function go(fn) { return function () { if (closeFirst) closeFirst(); setTimeout(fn, 0); }; }
      VF.menu('fd-ver-menu', 'Actions for v' + v, [
        { label: 'View', icon: 'eye', fn: go(function () { VF.viewVersion(v); }) },
        { label: 'Compare with draft', icon: 'git-compare', fn: go(function () { VF.enterCompare(isLive ? 'live' : v); }) },
        { label: 'Compare with previous', icon: 'git-compare', disabled: v > 1 && S.m.versions.some(function (x) { return x.v === v - 1; }) ? null : 'No earlier version', fn: go(function () { VF.enterCompare(v - 1); }) },
        { label: 'Restore as draft…', icon: 'rotate-ccw', disabled: S.mode === 'phone' ? 'Restore on a larger screen' : null, fn: go(function () { VF.restoreVersion(v); }) },
        { label: 'Roll back to this version…', icon: 'rotate-ccw', disabled: isLive ? 'This version is live' : null, fn: go(function () { VF.openPublish({ rollback: v, trigger: b }); }) },
        { label: 'Copy link', icon: 'link', fn: function () { V.toast.success('Link to v' + v + ' copied'); } }
      ], b);
    };
  }
  VF.leftViews.history = function (b) { b.innerHTML = historyHtml(); wireHistory(b); };
  VF.openHistorySheet = function () {
    var sh = $('#fd-histsheet');
    sh.innerHTML = '<div class="sheet-head"><button type="button" class="ibtn sheet-back" data-drawer-close aria-label="Back">' + VF.icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="fd-histsheet-t">Version history</h2><p class="sheet-meta">' + esc(S.m.meta.name) + '</p></div><div class="sheet-actions"><button type="button" class="ibtn sheet-close" data-drawer-close aria-label="Close version history">' + VF.icon('x') + '</button></div></div><div class="sheet-body">' + historyHtml() + '</div>';
    wireHistory(sh, function () { V.drawer.close('fd-histsheet', 'navigate'); });
    V.drawer.open('fd-histsheet', { mode: 'modal', returnTo: d.activeElement });
  };

  /* ---------- Conflict sheet (409, FD2 §4.6): no default choice; Continue once chosen ---------- */
  VF.on('conflict', function () {
    var sh = $('#fd-conflict'), mine = Math.max(1, S.save.edits);
    sh.innerHTML = '<div class="sheet-head"><div class="sheet-heading"><h2 class="sheet-title" id="fd-conflict-t">This flow changed while you were editing</h2></div><div class="sheet-actions"><button type="button" class="ibtn sheet-close" data-drawer-close aria-label="Close">' + VF.icon('x') + '</button></div></div>' +
      '<div class="sheet-body"><p class="type-body-14">Rohit S. saved the draft at 11:31 am. Your last ' + mine + ' edit' + (mine === 1 ? '' : 's') + ' haven’t been saved yet.</p><div class="l-pair fd-conflict-cols"><section><h3 class="type-label-13">Their changes (2)</h3><ul class="fd-ro-list"><li>Changed · Polite close</li><li>Added · Send brochure</li></ul></section><section><h3 class="type-label-13">Your unsaved edits (' + mine + ')</h3><ul class="fd-ro-list"><li>Changed · ' + esc((VF.step(S.sel[0]) || S.m.steps[2]).title) + '</li></ul></section></div>' +
      '<fieldset class="fieldset"><legend>Which version should the draft keep?</legend><div class="rcards"><label class="rcard"><input type="radio" class="radio" name="fd-cf" value="theirs"><span class="rcard-body"><span class="rcard-title">Use their version</span><span class="rcard-desc">Your ' + mine + ' edit' + (mine === 1 ? ' is' : 's are') + ' discarded.</span></span></label><label class="rcard"><input type="radio" class="radio" name="fd-cf" value="copy"><span class="rcard-body"><span class="rcard-title">Keep both</span><span class="rcard-desc">Save my version as a new flow “' + esc(S.m.meta.name) + ' (my copy)”.</span></span></label></div></fieldset></div>' +
      '<div class="sheet-foot sheet-foot--end"><button type="button" class="btn btn--tertiary" data-drawer-close>Cancel</button><button type="button" class="btn btn--primary" data-cf="go" aria-disabled="true" aria-describedby="fd-cf-why">Continue</button><span class="sr-only" id="fd-cf-why">Choose which version to keep.</span></div>';
    S.conflictOpen = true;
    sh.onchange = function () { var b = $('[data-cf="go"]', sh); b.removeAttribute('aria-disabled'); };
    sh.onclick = function (e) {
      var b = e.target.closest('[data-cf]'); if (!b || b.getAttribute('aria-disabled') === 'true') return; var v = (sh.querySelector('input[name="fd-cf"]:checked') || {}).value;
      S.save.resolved = true; S.conflictOpen = false; S.save.state = 'saved'; S.save.at = VF.clock(); S.save.edits = 0; V.drawer.close('fd-conflict', 'navigate');
      if (v === 'theirs') { var p = S.m.steps.filter(function (s) { return s.id === 'n5'; })[0]; if (p) p.f.prompt = 'Koi baat nahi, dhanyavaad.'; V.toast.success('Using Rohit S.’s version. Your edits were discarded.'); }
      else V.toast.success('Saved your version as “' + S.m.meta.name + ' (my copy)”', { action: { label: 'Open', onClick: function () {} } });
      VF.renderAll();
    };
    /* FD-R2-03: the header re-renders on close, so the trigger is re-queried afterwards; focus returns to the save chip, never the H1 */
    V.drawer.open('fd-conflict', { mode: 'modal', returnTo: $('#fd-save [role="button"]') || $('#fd-save'), onClose: function (r) { VF.renderAll(); if (r !== 'navigate') setTimeout(function () { var s = $('#fd-save [role="button"]') || $('#fd-save'); if (s) { if (!s.matches('button, [tabindex]')) s.setAttribute('tabindex', '-1'); s.focus(); } }, 0); } });
  });
  d.addEventListener('vaani:review', function () { VF.emit('conflict'); });
  d.addEventListener('vaani:retry', function () { VF.save.retry(); });

  /* ---------- Flow settings (FD2 §11): Identity · Agent · Call behaviour · Security · Advanced ---------- */
  VF.openSettings = function (trigger, o) {
    var sh = $('#fd-settings'), m = S.m.meta, st = m.settings = m.settings || { voice: 'vaani', pace: 'Normal', wait: 6, longest: 10, verify: false, switching: 'Follow the caller’s language', instructions: 'Warm and brief. Never promise a discount. Address callers as ji.' }, ro = !!VF.readOnlyReason() && VF.readOnlyReason() !== 'review' && VF.readOnlyReason() !== 'phone', F = VF.F;
    function sec(id, title, desc, tag, body) { return '<section class="form-section fd-set-sec" aria-labelledby="fd-set-' + id + '" id="fd-set-sec-' + id + '"><div class="form-section-head"><div class="l-cluster"><h3 class="form-section-title" id="fd-set-' + id + '">' + title + '</h3><span class="tag tag--outline">' + tag + '</span></div><p class="form-section-desc">' + desc + '</p></div>' + body + '</section>'; }
    var voices = (V.data.voices || []).map(function (v) { return { v: v.id, l: v.name, d: v.descriptor + (v.available ? '' : ' · ' + v.unavailableReason), dis: !v.available }; });
    sh.innerHTML = '<div class="sheet-head"><button type="button" class="ibtn sheet-back" data-drawer-close aria-label="Back">' + VF.icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="fd-settings-t">Flow settings</h2><p class="sheet-meta">' + esc(m.name) + '</p></div><div class="sheet-actions"><button type="button" class="ibtn sheet-close" data-drawer-close aria-label="Close flow settings">' + VF.icon('x') + '</button></div></div><div class="sheet-body"><div class="form fd-set">' +
      sec('id', 'Identity', 'Name, description and who can see this flow.', 'Applies now', F.text('set-name', 'Name', m.name) + F.text('set-desc', 'Description', 'Qualifies site-visit leads from the weekend batch and inbound calls.', { opt: true }) + F.select('set-cat', 'Category', m.category, ['Sales', 'Support', 'Collections', 'Scheduling', 'Other'].map(function (x) { return { v: x, l: x }; })) + F.select('set-vis', 'Visibility', m.visibility, [{ v: 'Workspace', l: 'Workspace' }, { v: 'Only me', l: 'Only me', dis: !!m.live, d: m.live ? 'Live on +91 80 •••• 2210. Teammates who run calls must see it.' : '' }])) +
      sec('agent', 'Agent', 'Voice, languages and pace. Changes save to the draft.', 'Saved to the draft', F.select('set-voice', 'Voice', st.voice, voices) + '<div class="field"><span class="field-label">Languages</span><p class="fd-ro">' + V.ui.langMark('hi', 'full') + ' ' + V.ui.langMark('en', 'full') + '</p><p class="field-hint">Hindi first. Speak Hinglish when the caller mixes Hindi and English.</p></div>' + F.radios('set-switch', 'Switching', st.switching, ['Follow the caller’s language', 'Stay in the primary language']) + F.seg('set-pace', 'Pace', st.pace, ['Slower', 'Normal', 'Faster']) + F.num('set-wait', 'Wait for a reply', st.wait, { min: 3, max: 15, unit: 's', hint: '3 to 15 seconds. New questions start with this.' }) + '<div class="field"><label class="field-label" for="fd-set-ins">Agent instructions</label><textarea class="textarea" id="fd-set-ins" rows="3">' + esc(st.instructions) + '</textarea><p class="field-hint">The agent’s personality and limits for this flow: tone, what it must never promise, how to address callers.</p></div>') +
      sec('call', 'Call behaviour', 'Limits for every call on this flow.', 'Saved to the draft', F.num('set-long', 'Longest call', st.longest, { min: 1, max: 30, unit: 'min', hint: 'At the limit the agent closes politely and ends the call.' }) + F.ro('Recording notice', '“This call may be recorded for quality.” · <a href="settings.html">Change in Settings</a>')) +
      sec('sec', 'Security', 'Voice checks and actions that wait for verification.', 'Saved to the draft', F.sw('set-verify', 'Check the caller’s voice, with consent', st.verify, 'Consent is always asked first.')) +
      sec('adv', 'Advanced', 'What the agent is told, step by step.', 'Read only', '<pre class="codeblock fd-code fd-code--tall" tabindex="0" aria-label="What the agent is told">' + esc(VF.compileFlow(S.m)) + '</pre><div class="l-cluster"><button type="button" class="btn btn--sm">' + VF.icon('download', 'sm') + 'Export JSON</button><span class="id-text">' + esc(m.shortId) + '</span></div>') +
      '</div></div><div class="sheet-foot"><span class="save save--saved">' + VF.icon('check', 'sm') + '<span>Saved ' + esc(S.save.at || VF.clock()) + '</span></span><span class="l-spacer"></span><button type="button" class="btn" data-drawer-close>Done</button></div>';
    V.initAll(sh);
    if (ro) $$('input, textarea', sh).forEach(function (x) { x.readOnly = true; });
    sh.oninput = function (e) { if (e.target.id === 'fd-f-set-name' && e.target.value.trim()) { m.name = e.target.value.trim(); VF.renderHeader(); } };
    sh.onfocusout = function (e) { if (e.target.id === 'fd-f-set-name' && !e.target.value.trim()) { e.target.value = m.name; V.announce('A flow needs a name. Kept ‘' + m.name + '’.'); } };
    sh.addEventListener('vaani:change', function (e) { var k = e.target.getAttribute('data-k'); if (k === 'set-voice') st.voice = e.detail.value; if (k === 'set-pace') st.pace = e.detail.value; });
    V.drawer.open('fd-settings', { mode: 'modal', returnTo: trigger });
    if (o && o.section === 'advanced') setTimeout(function () { var a = $('#fd-set-sec-adv'); if (a) a.scrollIntoView(); var c = $('.fd-code--tall', sh); if (c) c.focus(); }, 60);
  };

  /* ---------- Notices: one page Notice; canvas notices at the top of the canvas ---------- */
  VF.renderNotices = function () {
    var page = $('#fd-noticeslot'), top = $('#fd-canvas-top'), p = '', c = '';
    if (S.loading) { page.innerHTML = ''; top.innerHTML = ''; return; }
    if (S.mode === 'review') p = notice('info', 'info', 'Editing steps needs a screen at least 1024 px wide. You can review, test and publish here.' + (S.m.blank ? ' Add steps on a screen at least 1024 px wide.' : ''));
    else if (S.scen === 'viewonly') p = notice('neutral', 'eye', 'You can view this flow. Ask Rohit S. (admin) to change it.');
    else if (S.scen === 'offline') p = notice('warning', 'cloud-off', 'You’re offline. Your edits stay on this device and save when you reconnect.');
    else if (S.scen === 'interim' || S.scen === 'volatile') p = notice('neutral', 'hard-drive', 'You have unpublished edits on this device only. Teammates and other browsers see the published flow.');
    if (S.viewing) c = notice('info', 'history', 'Viewing v' + S.viewing.v + ' (live ' + V.fmt.dateShort(S.viewing.ver.from) + (S.viewing.ver.to ? ' to ' + V.fmt.dateShort(S.viewing.ver.to) : '') + '). Read-only.', '<button type="button" class="notice-act" data-n="back">Back to draft</button>');
    else if (S.conflictOpen) c = notice('neutral', 'pause', 'Editing is paused until you choose which changes to keep.', '<button type="button" class="notice-act" data-n="review">Review</button>');
    else if (S.scen === 'topdown' && !S.overlapDismissed) c = notice('info', 'info', 'This flow is laid out top to bottom.', '<button type="button" class="notice-act" data-n="tidy">Re-layout as draft</button>');
    else if (S.overlapN && !S.overlapDismissed && S.mode !== 'phone') c = notice('info', 'info', S.overlapN + ' steps overlap.', '<button type="button" class="notice-act" data-n="tidy">Tidy</button><button type="button" class="notice-act" data-n="dismiss">Dismiss</button>');
    page.innerHTML = p; top.innerHTML = c;
    top.onclick = page.onclick = function (e) { var b = e.target.closest('[data-n]'); if (!b) return; var a = b.getAttribute('data-n'); if (a === 'back') VF.exitVersion(); if (a === 'review') VF.emit('conflict'); if (a === 'tidy') { S.overlapDismissed = true; VF.tidyAll(); VF.fit(); } if (a === 'dismiss') { S.overlapDismissed = true; VF.renderNotices(); VF.focusStep(S.focus, { reveal: false }); } };
    if (VF.renderEmptyCard) VF.renderEmptyCard();
  };
  function notice(tone, icon, text, acts) { return '<div class="notice notice--' + tone + '" role="' + (tone === 'warning' ? 'status' : 'note') + '">' + VF.icon(icon) + '<div class="notice-body">' + esc(text) + '</div>' + (acts ? '<div class="notice-acts">' + acts + '</div>' : '') + '</div>'; }
})(window, document);
