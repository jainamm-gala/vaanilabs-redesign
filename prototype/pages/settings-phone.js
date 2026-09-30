/* Vaani Labs prototype · pages/settings-phone.js — Phone setup (§7.6): Inbound number (Action; Change flow… tier 2),
   Caller ID (StageProgress Owned → Compliance → Authorized, the model for every setup flow), Transfers and Calling hours
   (Section forms; a route change confirms), Test call (Action → Call gate, tier 4), Danger zone (Release… tier 3, Remove
   caller ID… tier 2). The nav badge, the Baseline line segment and this page’s meta read one state. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st, DATA = S.DATA;
  var NOW = DATA.meta.now, DAYS = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
  function P() { return st.phone; }
  function liveFlows() { return DATA.flows.filter(function (f) { return f.status === 'live'; }); }
  function flow(id) { return DATA.flows.filter(function (f) { return f.id === id; })[0]; }
  function flowLabel(f) { return f ? f.name + ' v' + f.live.version : ''; }
  function ro() { return !S.admin(); }
  S.syncShell = function (noRender) {
    var ok = P().callerId.stage === 'verified' && P().inbound.state !== 'none'; DATA.state.numberStatus = ok ? 'verified' : 'unverified';
    /* One fact, every place: the sidebar badge, this nav, the page meta and the Baseline line segment. */
    V.baseline.set(ok ? null : ((DATA.state || {}).liveCalls ? ['flow', 'line-unverified', 'wallet', 'activity'] : ['flow', 'line-unverified', 'wallet']));
    if (!noRender) { V.shell.render(); S.renderNav(); }
  };

  function metaText() {
    var i = P().inbound, c = P().callerId.stage;
    var a = i.state === 'none' ? 'No inbound number' : i.state === 'requested' ? 'Inbound number requested' : !i.flowId ? 'Inbound not answering' : 'Inbound ready';
    var b = { verified: 'Caller ID verified', owned: 'Caller ID not verified', compliance: 'Caller ID verifying (2 of 3)', authorized: 'Caller ID verifying (3 of 3)', failed: 'Caller ID check failed' }[c];
    return a + ' · ' + b;
  }

  /* ---------- Inbound number ---------- */
  function secInbound() {
    var i = P().inbound, body;
    if (i.state === 'none') body = '<div class="empty empty--compact settings-only">' + S.icon('phone-incoming') + '<span>No inbound number yet. Callers can’t reach your agent.</span>' + (ro() ? '' : '<button type="button" class="btn btn--sm" data-act="ph-request" data-needs-online>Request a number…</button>') + '</div>';
    else if (i.state === 'requested') body = S.kv([['Number', S.status('progress', 'Requested ' + F.date(i.requestedAt))], ['Next', 'We’ll email you when it’s ready. You can set up the rest of this page meanwhile.']]);
    else {
      var f = flow(i.flowId);
      body = S.kv([
        ['Number', '<span class="settings-num">' + S.phone(i.masked) + '</span>' + (ro() ? '' : '<button type="button" class="ibtn ibtn--sm" data-act="ph-copy" aria-label="Copy inbound number">' + S.icon('copy', 'sm') + '</button>') + (f ? S.status('success', 'Ready') : S.status('warning', 'Not answering: no live flow.') + ' <a class="settings-kv-link" href="flow-designer.html">Publish a flow</a>')],
        ['Answers with', f ? '<a href="flow-designer.html?flow=' + f.id + '">' + esc(f.name) + '</a>' + V.ui.statusTag('flow', 'live', { v: f.live.version }) + (ro() ? '' : '<button type="button" class="btn btn--link settings-kv-link" aria-haspopup="menu" aria-controls="ph-flow-menu" aria-expanded="false" data-placement="bottom-end">Change flow…</button>') : '<span class="kv-empty">No live flow</span>'],
        ['Since', F.date(i.since)]]) +
        '<div class="menu" id="ph-flow-menu" role="menu" aria-label="Answer with a live flow" hidden><span class="menu-group-label" role="presentation">Live flows</span>' + liveFlows().map(function (x) { return '<button class="menu-item" role="menuitemradio" type="button" aria-checked="' + (x.id === i.flowId) + '" data-value="' + x.id + '"><span class="menu-check">' + S.icon('check') + '</span><span class="menu-text"><span>' + esc(x.name) + '</span><span class="menu-desc">Live v' + x.live.version + '</span></span></button>'; }).join('') + '</div>';
    }
    return S.sec({ id: 'inbound', title: 'Inbound number', desc: 'Callers who ring this number reach your agent.', body: body });
  }
  S.act('ph-copy', function (b) { S.ui.copy(P().inbound.full, { btn: null, toast: 'Number copied' }); });
  d.addEventListener('vaani:menuselect', function (e) {
    if (e.target.id !== 'ph-flow-menu') return; var i = P().inbound, to = flow(e.detail.value), from = flow(i.flowId);
    if (!to || to === from) return;
    S.ui.confirm({ title: 'Answer ' + i.masked + ' with ' + flowLabel(to) + '?', body: 'New calls hear it from now on. Calls in progress stay on ' + from.name + '.', confirmLabel: 'Change flow', returnTo: $('[aria-controls="ph-flow-menu"]') })
      .then(function (ok) { if (ok) { i.flowId = to.id; S.log('Changed the inbound flow', 'Phone setup', ['Answers with', flowLabel(from), flowLabel(to)]); } redraw('inbound', secInbound()); if (ok) V.announce('Inbound calls now reach ' + flowLabel(to)); });
  });
  S.act('ph-request', function (b) {
    var id = U.uid('rq');
    var dl = S.ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' + S.ui.head(id, 'Request an inbound number') + '<div class="dlg-body">' + S.ui.field({ id: id + '-a', name: 'area', label: 'Preferred area code', optional: true, width: 'short', attrs: ' inputmode="numeric" maxlength="4" data-autofocus', hint: 'Like 80 for Bengaluru. We’ll offer the nearest available.' }) + '</div><div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Send request</button></div></div>', { returnTo: b });
    dl.on('[data-go]', function (btn, e) { var a = $('#' + id + '-a', dl.el); if (a.value && !/^\d{2,4}$/.test(a.value.trim())) { S.ui.setError(a, 'Enter 2 to 4 digits, like 80.'); return a.focus(); } S.ui.busy(btn, 'Sending…'); S.ui.wait(600).then(function () { P().inbound.state = 'requested'; P().inbound.requestedAt = NOW; dl.close('done'); redraw('inbound', secInbound()); S.syncShell(); }); });
  });

  /* ---------- Caller ID: StageProgress ---------- */
  function stage(state, title, meta, extra, sr) {
    var mark = { done: '<span class="smark smark--done" data-mark>' + S.icon('check') + '</span>', current: '<span class="smark smark--current" data-mark></span>', progress: '<span class="smark smark--progress" data-mark>' + S.icon('loader-circle', 'xs', { className: 'spinner' }) + '</span>', todo: '<span class="smark smark--todo" data-mark="hollow"></span>', failed: '<span class="smark smark--failed" data-mark>' + S.icon('x') + '</span>' }[state];
    return '<li class="stage settings-stage"' + (state === 'current' || state === 'progress' ? ' aria-current="step"' : '') + '>' + mark + '<div class="settings-stage-main"><span class="settings-stage-title"><span class="sr-only">' + esc(title) + ', ' + sr + '. </span><span aria-hidden="true">' + esc(title) + '</span>' + (state === 'progress' ? ' <span class="u-fg-3">In progress</span>' : '') + '</span>' + (meta ? '<span class="stage-meta">' + meta + '</span>' : '') + (extra || '') + '</div></li>';
  }
  function ownedForm() {
    var c = P().callerId, sent = c.sentTo;
    if (ro()) return '';
    if (sent) return '<div class="settings-stage-form" data-cid-form><p class="stage-meta">We sent a code to <b class="phone-text" translate="no">' + esc(sent) + '</b> by ' + (c.by === 'call' ? 'phone call' : 'text message') + '.</p>' +
      S.ui.field({ id: 'cid-code', name: 'cidcode', label: 'Code', width: 'short', attrs: ' inputmode="numeric" autocomplete="one-time-code" maxlength="6"', hint: '<span data-cid-cd>Resend code in 30 s</span>' }) +
      '<div class="settings-btnrow"><button type="button" class="btn btn--primary" data-act="cid-verify">Verify</button><button type="button" class="btn btn--tertiary" data-act="cid-change">Change number</button></div><p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> Any 6 digits work; 000000 is wrong, 999999 is too many tries.</p></div>';
    return '<div class="settings-stage-form" data-cid-form>' + (c.replacing ? '<p class="stage-meta">Your current caller ID stays in use until the new one is verified. <button type="button" class="btn btn--link" data-act="cid-cancel-replace">Keep the current one</button></p>' : '') +
      S.ui.field({ id: 'cid-num', name: 'cidnum', label: 'Number to verify', prefix: '+91', type: 'tel', value: c.draft || '', attrs: ' inputmode="tel" autocomplete="tel-national"', width: 'medium', hint: 'A mobile, or a landline with its STD code' }) +
      '<div class="field"><span class="field-label" id="cid-by-l">Send the code by</span>' + S.seg('cid-by', 'cid-by-l', [['text', 'Text'], ['call', 'Call']], c.by || 'text') + '<p class="field-hint" id="cid-by-h" hidden>Landlines get the code by call.</p></div>' +
      '<div class="settings-btnrow"><button type="button" class="btn btn--primary" data-act="cid-send" data-needs-online>' + S.icon('send', 'sm') + 'Send code</button></div></div>';
  }
  function secCaller() {
    var c = P().callerId, s = c.stage, body = '';
    if (s === 'verified' && !c.replacing) {
      body = S.kv([['Caller ID', '<span class="settings-num">' + S.phone(c.masked) + '</span>' + S.status('success', 'Verified ' + F.date(c.verifiedAt))], ['Used for', 'Every outbound call and batch']]) +
        (ro() ? '' : '<div class="settings-btnrow"><button type="button" class="btn btn--sm" data-act="cid-replace" data-needs-online>Replace number…</button></div>');
      return S.sec({ id: 'caller-id', title: 'Caller ID', desc: 'The number customers see when your agent calls them.', body: body });
    }
    if (!c.replacing) body += S.notice('warning', '<b>Phone calls can’t be placed until this is verified.</b>' + (s === 'compliance' ? ' The compliance check is running. We’ll email you when it’s done.' : ''));
    var owned = s === 'owned' || c.replacing, conf = '+91 80 •••• 2210 · code confirmed ' + F.dateShort(c.codeAt || NOW);
    body += '<ol class="stages settings-stages" aria-label="Caller ID verification, ' + (owned ? 'step 1' : s === 'authorized' ? 'step 3' : 'step 2') + ' of 3">' +
      (owned ? stage('current', 'Owned', 'Prove the number is yours with a code.', ownedForm(), 'current step') : stage('done', 'Owned', conf, '', 'done')) +
      (owned ? stage('todo', 'Compliance', 'Checking the number is registered to your business.', '', 'not started')
        : s === 'failed' ? stage('failed', 'Compliance', '', '<p class="settings-stage-err">' + S.status('danger', 'Compliance check failed: the number isn’t registered to ' + esc(st.workspace.name) + '.') + ' <button type="button" class="btn btn--link" data-act="cid-details">Details</button> · <button type="button" class="btn btn--link" data-act="cid-restart">Start again</button></p>', 'failed')
          : s === 'compliance' ? stage('progress', 'Compliance', 'Checking the number is registered to your business.', '<p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> <button type="button" class="btn btn--link" data-act="cid-sim">Finish the check</button></p>', 'in progress') : stage('done', 'Compliance', 'Registered to ' + esc(st.workspace.name), '', 'done')) +
      (s === 'authorized' ? stage('progress', 'Authorized', 'The carrier approves it as your caller ID.', '<p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> <button type="button" class="btn btn--link" data-act="cid-sim">Finish</button></p>', 'in progress') : stage('todo', 'Authorized', 'The carrier approves it as your caller ID.', '', 'not started')) + '</ol>';
    return S.sec({ id: 'caller-id', title: 'Caller ID', desc: 'The number customers see when your agent calls them.', body: body });
  }
  function cidMount(root) {
    var seg = $('#cid-by', root), num = $('#cid-num', root), hint = $('#cid-by-h', root);
    if (num && seg) num.addEventListener('input', function () { var land = /^[2-5]/.test(num.value.replace(/\D/g, '')); var t = $('[data-value="text"]', seg); if (land) { t.setAttribute('aria-disabled', 'true'); if (t.getAttribute('aria-checked') === 'true') V.seg.select($('[data-value="call"]', seg)); } else t.removeAttribute('aria-disabled'); hint.hidden = !land; P().callerId.draft = num.value; if (num.getAttribute('aria-invalid')) S.ui.setError(num, S.valid.anyPhone(num.value)); });
    if (seg) seg.addEventListener('vaani:change', function (e) { P().callerId.by = e.detail.value; });
    var cd = $('[data-cid-cd]', root); if (cd) { var left = 30, t = setInterval(function () { if (!d.contains(cd)) return clearInterval(t); left -= 1; if (left <= 0) { clearInterval(t); cd.innerHTML = '<button type="button" class="btn btn--link" data-act="cid-resend">Resend code</button>'; } else cd.textContent = 'Resend code in ' + left + ' s'; }, 1000); }
  }
  function redrawCaller(focus) { redraw('caller-id', secCaller(), focus); cidMount($('[data-sec="caller-id"]')); S.refreshMeta(); }
  S.act('cid-send', function (b) {
    var num = $('#cid-num'), m = S.valid.anyPhone(num.value); S.ui.setError(num, m); if (m) return num.focus();
    S.ui.busy(b, 'Sending…'); S.ui.wait(700).then(function () { var c = P().callerId; c.sentTo = '+91 ' + num.value.trim(); c.by = c.by || 'text'; redrawCaller(false); var i = $('#cid-code'); if (i) i.focus(); });
  });
  S.act('cid-verify', function (b) {
    var i = $('#cid-code'), v = i.value.trim(), m = !/^\d{6}$/.test(v) ? 'Enter the 6-digit code.' : v === '000000' ? 'That code isn’t right. Check the latest message.' : v === '999999' ? 'Too many tries. Request a new code in 10 min.' : '';
    S.ui.setError(i, m); if (m) return i.focus();
    S.ui.busy(b, 'Verifying…'); S.ui.wait(700).then(function () { var c = P().callerId; c.stage = 'compliance'; c.codeAt = NOW; c.masked = '+91 ' + c.sentTo.replace(/\D/g, '').slice(2, 4) + ' •••• ' + c.sentTo.replace(/\D/g, '').slice(-4); c.sentTo = null; c.replacing = false; S.log('Confirmed a caller ID code', 'Phone setup'); redrawCaller(); S.syncShell(); });
  });
  S.act('cid-resend', function () { redrawCaller(false); V.announce('Code sent again'); });
  S.act('cid-change', function () { P().callerId.sentTo = null; redrawCaller(false); var n = $('#cid-num'); if (n) n.focus(); });
  S.act('cid-replace', function () { P().callerId.replacing = true; redrawCaller(false); var n = $('#cid-num'); if (n) n.focus(); });
  S.act('cid-cancel-replace', function () { P().callerId.replacing = false; P().callerId.sentTo = null; redrawCaller(); });
  S.act('cid-restart', function () { P().callerId.stage = 'owned'; redrawCaller(); S.syncShell(); });
  S.act('cid-details', function () { V.toast.info('The registry lists this number under a different business name. Upload a letter on your letterhead, or verify another number.'); });
  S.act('cid-sim', function () { var c = P().callerId; if (c.stage === 'compliance') c.stage = 'authorized'; else { c.stage = 'verified'; c.verifiedAt = NOW; } redrawCaller(); S.syncShell(); if (c.stage === 'verified') V.toast.success('Caller ID verified'); });

  /* ---------- Transfers (Section form; a route change confirms, tier 2) ---------- */
  function secTransfer() {
    var t = P().transfer;
    if (ro()) return S.sec({ id: 'transfer', title: 'Transfers', desc: 'When a caller asks for a person, the agent transfers the call to:', body: S.kv([['Route', t.route === 'rep' ? 'Rep console, then a phone number' : 'A phone number'], ['Transfer number', S.phone('+91 •••••• ' + t.number.replace(/\D/g, '').slice(-4))]]) });
    return S.sec({ id: 'transfer', title: 'Transfers', desc: 'When a caller asks for a person, the agent transfers the call to:', form: 'transfer', body:
      '<fieldset class="fieldset"><legend class="sr-only">Transfer route</legend><div class="settings-rcards2">' + [['phone', 'A phone number', 'Rings the transfer number below.'], ['rep', 'Rep console, then a phone number', 'Reps online in Rep console get the call in their browser. If no one picks up in 20 s, it rings the number.']].map(function (r) { return '<label class="rcard"><input type="radio" class="radio" name="route" value="' + r[0] + '"' + (t.route === r[0] ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">' + r[1] + '</span><span class="rcard-desc">' + r[2] + '</span></span></label>'; }).join('') + '</div></fieldset>' +
      '<div class="settings-field-row">' + S.ui.field({ name: 'tnum', label: 'Transfer number', prefix: '+91', type: 'tel', value: t.number, attrs: ' inputmode="tel" autocomplete="tel-national"', width: 'medium', hint: 'Any Indian number, or an overseas office with its country code.' }) + '<button type="button" class="btn btn--link settings-field-aside" data-act="tr-mine"' + (st.profile.mobile ? '' : ' aria-disabled="true" data-tooltip="Add your mobile number in Profile first."') + '>Use my mobile number</button></div>' });
  }
  S.act('tr-mine', function () { var i = $('[name="tnum"]'); if (!i) return; i.value = st.profile.mobile; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); });
  S.formDef('transfer', {
    label: 'Transfers', saved: function () { return { route: P().transfer.route, tnum: P().transfer.number }; },
    validate: function (v) { return { tnum: !v.tnum.trim() ? 'Enter the number transfers should ring.' : S.valid.anyPhone(v.tnum, true) }; },
    confirm: function (v, saved) {
      if (v.route === saved.route) return true;
      return S.ui.confirm(v.route === 'rep' ? { title: 'Send transfers to Rep console first?', body: 'From now on, transfers ring reps who are online, then +91 ' + v.tnum.trim() + '. Calls in progress aren’t affected.', confirmLabel: 'Change route' } : { title: 'Send transfers straight to the phone?', body: 'From now on, transfers ring +91 ' + v.tnum.trim() + ' directly. Calls in progress aren’t affected.', confirmLabel: 'Change route' });
    },
    commit: function (v) { P().transfer = { route: v.route, number: v.tnum.trim() }; S.log('Changed transfers', 'Phone setup'); },
    theirs: function (saved) { P().transfer.number = '98220 14999'; return { route: saved.route, tnum: '98220 14999' }; }
  });

  /* ---------- Calling hours (Section form; CallingHours recipe C §7.1) ---------- */
  function secHours() {
    var h = st.hours;
    if (ro()) return S.sec({ id: 'hours', title: 'Calling hours · IST', desc: 'Outbound calls and batches start only inside these hours.', body: S.kv(h.map(function (x) { return [DAYS[x.day], x.open ? S.to12(x.from) + ' to ' + S.to12(x.to) : 'Closed']; })) });
    return S.sec({ id: 'hours', title: 'Calling hours · IST', desc: 'Outbound calls and batches start only inside these hours. The Call gate blocks a start outside them.', form: 'hours', body:
      '<div class="settings-hours">' + h.map(function (x) { var k = x.day.toLowerCase(), n = DAYS[x.day]; return '<div class="settings-hours-row" role="group" aria-labelledby="hr-' + k + '-l"><span class="settings-hours-day" id="hr-' + k + '-l">' + n + '</span>' +
        '<label class="check check--dense settings-hours-open"><input type="checkbox" class="cb" name="' + k + '_open"' + (x.open ? ' checked' : '') + '><span class="check-text">Open</span></label>' +
        '<span class="settings-hours-times"><span class="input input--sm settings-hours-time"><input type="time" name="' + k + '_from" value="' + x.from + '" step="900" aria-label="' + n + ' from"' + (x.open ? '' : ' disabled') + '></span><span class="settings-hours-to" aria-hidden="true">to</span>' +
        '<span class="input input--sm settings-hours-time"><input type="time" name="' + k + '_to" value="' + x.to + '" step="900" aria-label="' + n + ' to"' + (x.open ? '' : ' disabled') + '></span><span class="settings-hours-tz">IST</span></span></div>'; }).join('') + '</div>' +
      '<div><button type="button" class="btn btn--link" data-act="hr-copy">Copy Monday to weekdays</button></div>' });
  }
  function hoursVals() { var v = {}; st.hours.forEach(function (x) { var k = x.day.toLowerCase(); v[k + '_open'] = x.open ? '1' : ''; v[k + '_from'] = x.from; v[k + '_to'] = x.to; }); return v; }
  function syncDisabled(form) { st.hours.forEach(function (x) { var k = x.day.toLowerCase(), on = $('[name="' + k + '_open"]', form).checked; [k + '_from', k + '_to'].forEach(function (n) { $('[name="' + n + '"]', form).disabled = !on; }); }); }
  S.act('hr-copy', function () { var f = $('form[data-form="hours"]'); if (!f) return; var m = S.forms.read(f); ['tue', 'wed', 'thu', 'fri'].forEach(function (k) { $('[name="' + k + '_open"]', f).checked = !!m.mon_open; $('[name="' + k + '_from"]', f).value = m.mon_from; $('[name="' + k + '_to"]', f).value = m.mon_to; }); syncDisabled(f); S.forms.update('hours'); V.announce('Copied Monday’s hours to Tuesday to Friday'); });
  S.formDef('hours', {
    label: 'Calling hours', saved: hoursVals,
    onChange: function (v, form) { syncDisabled(form); }, onWrite: function (form) { syncDisabled(form); },
    validate: function (v) { var e = {}; st.hours.forEach(function (x) { var k = x.day.toLowerCase(); if (v[k + '_open'] && v[k + '_from'] && v[k + '_to'] && v[k + '_to'] <= v[k + '_from']) e[k + '_to'] = 'End after the start time.'; if (v[k + '_open'] && (!v[k + '_from'] || !v[k + '_to'])) e[k + (v[k + '_from'] ? '_to' : '_from')] = 'Enter a time.'; }); return e; },
    commit: function (v) { st.hours.forEach(function (x) { var k = x.day.toLowerCase(); x.open = !!v[k + '_open']; x.from = v[k + '_from']; x.to = v[k + '_to']; }); S.log('Changed calling hours', 'Phone setup'); },
    theirs: function () { st.hours[5].to = '18:00'; return hoursVals(); }
  });

  /* ---------- Test call (Action → Call gate, tier 4) ---------- */
  function openNow() { var x = st.hours[6]; return x.open && x.from <= '11:24' && x.to > '11:24' ? x : null; }
  function testBlock() {
    if (P().callerId.stage !== 'verified') return { why: 'Verify a caller ID first.' };
    if (!P().inbound.flowId) return { why: 'Publish a flow first.' };
    if (V.walletState() === 'empty') return { why: 'Wallet is ₹0. Top up to place calls.', topup: true };
    if (!st.profile.mobile) return { why: 'Add your mobile number in Profile.' };
    return null;
  }
  function secTest() {
    var bl = testBlock(), lt = P().lastTest;
    return S.sec({ id: 'test', title: 'Test call', desc: 'Hear what callers hear. We call your mobile with the live flow.', body:
      '<div class="settings-test"><button type="button" class="btn" data-act="ph-test"' + (bl ? ' aria-disabled="true" aria-describedby="ph-test-why" data-reason="' + esc(bl.why) + '"' : '') + ' data-needs-online>' + S.icon('phone-outgoing', 'sm') + 'Call yourself…</button>' +
      (bl ? '<p class="settings-why" id="ph-test-why">' + esc(bl.why) + (bl.topup ? ' <a href="billing.html?topup=1" data-vaani-action="topup">Top up</a>' : '') + '</p>' : '') + '</div>' +
      '<p class="settings-sec-foot">' + (lt ? 'Last test: ' + F.when(lt.at) + ' · ' + V.ui.statusTag('callResult', 'completed') + ' · ' + F.duration(lt.sec) + ' · <a href="call-reports.html">Open report</a>' : 'No test call yet. It takes about 2 minutes and costs about ₹5.') + '</p>' });
  }
  S.act('ph-test', function (b) {
    var old = $('#st-gate'); if (old) old.remove(); var o = openNow(), f = flow(P().inbound.flowId), wal = V.walletState() === 'low';
    var row = function (kind, text, meta) { return '<li class="gate-row"><span class="gate-mark gate-mark--' + kind + '" data-mark>' + S.icon(kind === 'pass' ? 'check' : kind === 'block' ? 'x' : 'info') + '</span><span class="gate-text"><span class="sr-only">' + (kind === 'pass' ? 'Passed: ' : kind === 'block' ? 'Blocking: ' : 'Note: ') + '</span>' + text + (meta ? '<span class="gate-meta">' + meta + '</span>' : '') + '</span></li>'; };
    var el = U.h('<div class="gate settings-gate" id="st-gate" role="dialog" aria-modal="true" aria-labelledby="st-gate-t" hidden><div class="gate-head"><h2 class="gate-title" id="st-gate-t">Call your mobile</h2><div class="gate-sub">Your phone rings when you start. · Checked just now</div></div>' +
      '<div class="gate-body"><div class="gate-group">Must pass<span class="gate-sum gate-sum--' + (o ? 'ok' : 'blocked') + '">' + S.icon(o ? 'check' : 'x', 'sm') + (o ? 'Ready' : 'Blocked · 1 thing to fix') + '</span></div><ul class="gate-list">' +
      row('pass', 'Caller ID ' + P().callerId.masked + ' verified') + row(o ? 'pass' : 'block', o ? 'Inside calling hours' : 'Outside calling hours. Opens 10 am IST.', o ? 'Open until ' + S.to12(o.to) + ' IST' : '') + row('pass', 'Answers with ' + esc(flowLabel(f))) + '</ul>' +
      '<div class="gate-group">Good to know</div><ul class="gate-list">' + row('advisory', 'The call says it’s recorded') + row('advisory', 'It rings ' + S.phone('+91 •••••• ' + st.profile.mobile.replace(/\D/g, '').slice(-4))) + '</ul>' +
      '<div class="gate-cost"><span>1 call · about 1 to 2 min</span><b>₹2 to ₹5</b></div><p class="gate-note">Wallet ' + (wal ? '₹42.10 · about 17 min of calls' : F.money(DATA.wallet.balance) + ' · ' + esc(DATA.wallet.runway)) + '</p></div>' +
      '<div class="gate-foot"><span class="gate-reason' + (o ? '' : ' u-fg-danger') + '" id="st-gate-why">' + (o ? 'Your mobile rings within a minute.' : 'Calls can’t start outside calling hours.') + '</span><button class="btn btn--tertiary" type="button" data-popover-close>Cancel</button><button class="btn btn--primary" type="button" data-gate-go' + (o ? '' : ' aria-disabled="true" aria-describedby="st-gate-why"') + '>Call my mobile</button></div></div>');
    d.body.appendChild(el); V.initAll(el);
    V.popover.open(b, 'st-gate', { modal: true, placement: 'bottom-start' });
    $('[data-gate-go]', el).addEventListener('click', function (e) {
      if (S.blocked(e.currentTarget)) return; V.popover.close('st-gate');
      var t = V.toast.progress('Calling your mobile…');
      S.ui.wait(2200).then(function () { P().lastTest = { at: NOW, sec: 72 }; if (t && t.done) t.done('success', 'Test call connected · 1m 12s'); redraw('test', secTest(), false); S.log('Placed a test call', 'Phone setup'); });
    });
  });

  /* ---------- Danger zone ---------- */
  function secDanger() {
    if (ro()) return ''; var rows = [], i = P().inbound, c = P().callerId;
    if (i.state === 'active') rows.push({ title: 'Release inbound number', desc: 'Callers get a “number not in service” message' + (i.flowId ? ', and ' + esc(flow(i.flowId).name) + ' stops answering' : '') + '. You may not get this number back.', label: 'Release inbound number…', act: 'ph-release' });
    if (c.stage === 'verified') rows.push({ title: 'Remove caller ID', desc: 'Phone calls can’t be placed until you verify another caller ID. Scheduled batches pause.', label: 'Remove caller ID…', act: 'ph-remove-cid' });
    return rows.length ? S.dangerZone(rows) : '';
  }
  S.act('ph-release', function (b) {
    var i = P().inbound, f = flow(i.flowId);
    S.ui.reauth('release the inbound number', { returnTo: b }).then(function (ok) {
      if (!ok) return;
      S.ui.confirm({ title: 'Release ' + i.masked + '?', body: 'Callers get a “number not in service” message' + (f ? ', and ' + f.name + ' stops answering' : '') + '. You may not get this number back.', confirmLabel: 'Release number', tone: 'danger', returnTo: b, typed: { value: i.last4, label: 'Type the last 4 digits, ' + i.last4 + ', to confirm', numeric: true, short: true, hint: 'Type the last 4 digits to release it' } })
        .then(function (go) { if (!go) return; i.state = 'none'; S.log('Released the inbound number', i.masked); S.rerender(); S.syncShell(); V.toast.success('Released ' + i.masked); S.target('inbound'); });
    });
  });
  S.act('ph-remove-cid', function (b) {
    var c = P().callerId;
    S.ui.confirm({ title: 'Remove ' + c.masked + '?', body: 'Phone calls can’t be placed until you verify another caller ID. Scheduled batches pause.', confirmLabel: 'Remove caller ID', tone: 'danger', returnTo: b })
      .then(function (ok) { if (!ok) return; c.stage = 'owned'; S.log('Removed the caller ID', c.masked); S.rerender(); S.syncShell(); S.target('caller-id'); });
  });

  function redraw(id, html, focus) { var old = $('[data-sec="' + id + '"]'); if (!old) return; var n = U.h(html); old.replaceWith(n); V.initAll(n); S.applyOffline(n); S.refreshMeta(); if (focus !== false) { var t = $('.settings-sec-title', n); if (t) t.focus(); } }
  S.page('phone', {
    meta: metaText,
    render: function () { return (ro() ? S.readOnlyNotice('change phone setup') : '') + secInbound() + secCaller() + secTransfer() + secHours() + secTest() + secDanger(); },
    mount: function (root) { cidMount(root); },
    onQuery: function () { if (S.qp('verify') === 'caller-id') S.target('caller-id'); }
  });
})(window, document);
