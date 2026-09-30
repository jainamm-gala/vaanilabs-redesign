/* Home (index.html) · 03-pages/00 §13, 02-components-gate §5.3, direction §6.1.
   One step model drives the setup track, its progress heading, the aside, the palette’s "Continue setup" row and every demo
   state. The track is computed like the server would compute it: the count covers the five required steps only, and the
   current step is the first required step, in order, that is neither done nor waiting on someone else.
   Overlays (Call gate, Top-up sheet, Invite dialog) live in index-overlays.js; after setup, index-overview.js renders the page. */
(function (w, d, V) {
  'use strict';
  if (!V) return;
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, DATA = V.data, fmt = V.fmt, icon = V.icon;
  var qs = new URLSearchParams(w.location.search);
  var H = w.VaaniHome = w.VaaniHome || {};
  var org = DATA.org, FLOW = DATA.flows[0];
  var ADMINS = org.members.filter(function (m) { return m.role === 'Admin' && !m.invited; }).length;
  /* Every runway on this page (step copy, proof line, Top-up sheet, toast) comes from formatRunway at the workspace’s rate, so the
     same amount reads the same everywhere (05-knowledge-billing §3: floored to 5 min between 1 and 10 h). */
  var RATE = DATA.meta.ratePerSec || 0.04;
  function runwayFor(amount) { return fmt.runway(amount, RATE); }
  function phone(p) { return V.ui.phoneText(p); }
  H.phone = phone;

  /* ---------- the step catalogue (§13.3). Order = the brief’s order with Money before Call yourself (D1). ---------- */
  var ORDER = ['teach', 'publish', 'verify', 'money', 'call', 'people'];
  var REQUIRED = ['publish', 'verify', 'money', 'call', 'people'];
  var CAT = {
    teach: { title: 'Teach your agent', optional: true,
      body: 'Upload a price sheet, brochure or FAQ so the agent can quote it on calls. Skip this if your calls don’t need facts.',
      action: { label: 'Upload files', icon: 'upload', href: 'knowledge.html?upload=1' },
      proof: 'Indexed · 12 files · 418 passages', end: { label: 'Change', href: 'knowledge.html' },
      progress: 'Indexing 1 file… 60%', failed: 'Couldn’t index price-sheet.pdf', retry: { label: 'Retry', act: 'retry-teach' } },
    publish: { title: 'Publish a flow',
      body: 'Pick a template and adjust it. Callers hear it only after you publish.',
      action: { label: 'Choose a template…', icon: 'workflow', href: 'flow-designer.html?new=1' },
      proof: FLOW.name + ' v' + FLOW.live.version + ' is published', end: { label: 'Open', href: 'flow-designer.html?flow=' + FLOW.id } },
    verify: { title: 'Verify your calling number', admin: 'Only admins can verify numbers.',
      body: 'Customers see this number when you call, and inbound calls reach your agent through it.',
      action: { label: 'Verify number…', icon: 'shield-check', href: 'settings.html#phone/caller-id' },
      proofHtml: phone(org.inboundNumber.masked) + ' · Verified', end: { label: 'Open', href: 'settings.html#phone' },
      progress: 'Step 2 of 3 · documents under review', failed: 'Documents weren’t accepted', retry: { label: 'See why', href: 'settings.html#phone/caller-id' },
      attention: 'Number not verified · calls can’t be placed' },
    money: { title: 'Add money', admin: 'Only admins can add money.',
      body: 'Calls are prepaid from your wallet. ' + fmt.money(500, { whole: true }) + ' covers ' + runwayFor(500) + ' at your rate.',
      action: { label: 'Top up…', icon: 'wallet', act: 'topup' }, hint: 'UPI first · ₹100, ₹500 or ₹1,000',
      proof: fmt.money(2000, { whole: true }) + ' added · ' + runwayFor(2000) + ' of calls', end: { label: 'Billing', href: 'billing.html' },
      progress: 'Payment pending · updates when UPI confirms', failed: 'UPI payment didn’t complete. You were not charged.', retry: { label: 'Try again', act: 'topup' } },
    call: { title: 'Call yourself', needs: ['publish', 'verify', 'money'],
      body: 'Hear the flow on your own phone before customers do. About 2 minutes, about ₹5.',
      action: { label: 'Call my number…', icon: 'phone', act: 'call' }, retryLabel: 'Try again…',
      secondary: { label: 'Talk in browser instead', href: 'flow-designer.html?flow=' + FLOW.id + '&test=browser' },
      note: 'Talking in the browser doesn’t test your phone line, so it doesn’t complete this step.',
      proof: 'Connected · 1m 52s · Today 11:02 am', proofLink: { label: 'Listen', href: 'call-reports.html?tests=1' },
      progressHtml: 'Calling ' + phone(DATA.user.phoneMasked) + '… · <a href="cockpit.html">Open in Cockpit</a>',
      failed: 'Didn’t connect · No answer', retry: { label: 'Try again', act: 'call' } },
    people: { title: 'Add people to call',
      body: 'Import a list of leads, or send inbound calls on your number to this flow.',
      action: { label: 'Import leads…', icon: 'upload', href: 'leads.html?import=1' },
      secondary: { label: 'Connect inbound', href: 'settings.html#phone' },
      proof: fmt.count(DATA.counts.leads) + ' leads imported', end: { label: 'Open', href: 'leads.html' } }
  };
  var NEEDS = { publish: 'a published flow', verify: 'a verified number', money: 'money in the wallet' };
  var HELP = { guide: 'https://help.vaanilabs.example/setup', support: 'support@vaanilabs.in' };
  var WORD = { done: 'Done', todo: 'To do', progress: 'In progress', blocked: 'Blocked', admin: 'Needs an admin', failed: 'Failed', attention: 'Needs attention' };
  H.CAT = CAT; H.ORDER = ORDER;

  /* ---------- demo scenarios (the server’s step states). Links in the Prototype states card set ?demo=. ---------- */
  function all(s) { var o = {}; ORDER.forEach(function (id) { o[id] = s; }); return o; }
  var SCEN = {
    base: { teach: 'done', publish: 'done', verify: 'done', money: 'done', call: 'todo', people: 'done' },
    'first-run': { teach: 'done', publish: 'done', verify: 'done', money: 'todo', call: 'todo', people: 'todo' },
    'new': all('todo'),
    waiting: { teach: 'progress', publish: 'done', verify: 'progress', money: 'progress', call: 'todo', people: 'todo' },
    failed: { teach: 'failed', publish: 'done', verify: 'done', money: 'done', call: 'failed', people: 'done' },
    member: { teach: 'done', publish: 'done', verify: 'todo', money: 'todo', call: 'todo', people: 'todo' },
    complete: all('done'), regression: { teach: 'done', publish: 'done', verify: 'attention', money: 'done', call: 'done', people: 'done' }
  };
  var demo = qs.get('demo') || '';
  var done = V.setupComplete();
  H.s = {
    mode: done ? 'done' : 'setup', demo: demo, role: demo === 'member' ? 'Member' : 'Admin',
    page: demo === 'loading' ? 'loading' : demo === 'error' ? 'error' : 'ready', offline: demo === 'offline',
    steps: {}, open: {}, invited: 0
  };
  var scen = SCEN[done ? (demo === 'regression' ? 'regression' : 'complete') : (SCEN[demo] ? demo : 'base')];
  ORDER.forEach(function (id) { H.s.steps[id] = { state: scen[id] }; });
  if (H.s.role === 'Member') DATA.user.role = 'Member';          /* page-local: hides the admins-only Knowledge badge */

  /* ---------- derived state: blocked by another step, needs an admin, the current step, the count ---------- */
  H.derive = function () {
    var out = {}, S = H.s;
    ORDER.forEach(function (id) {
      var st = S.steps[id].state;
      if ((st === 'todo' || st === 'failed') && S.role === 'Member' && CAT[id].admin) st = 'admin';
      out[id] = { id: id, cat: CAT[id], state: st, proof: S.steps[id].proof };
    });
    var c = out.call;
    if (c.state === 'todo' || c.state === 'failed') { var miss = CAT.call.needs.filter(function (n) { return out[n].state !== 'done'; }); if (miss.length) { c.state = 'blocked'; c.missing = miss; } }
    var cur = S.mode === 'setup' ? REQUIRED.filter(function (id) { return out[id].state === 'todo' || out[id].state === 'failed'; })[0] : null;
    if (cur) out[cur].current = true;
    return { steps: out, done: REQUIRED.filter(function (id) { return out[id].state === 'done'; }).length, total: 5, current: cur };
  };

  /* ---------- markup ---------- */
  function markHtml(s) {
    var st = s.state;
    if (st === 'done') return '<span class="smark smark--done" data-mark>' + icon('check', 'xs') + '</span>';
    if (st === 'failed') return '<span class="smark smark--failed" data-mark>' + icon('x', 'xs') + '</span>';
    if (st === 'attention') return '<span class="smark smark--waiting" data-mark>' + icon('triangle-alert', 'xs') + '</span>';
    if (st === 'blocked' || st === 'admin') return '<span class="smark smark--blocked" data-mark>' + icon('lock', 'xs') + '</span>';
    if (st === 'progress') return '<span class="smark smark--progress" data-mark>' + icon('loader-circle', 'xs', { className: 'spinner' }) + '</span>';
    return '<span class="smark ' + (s.current ? 'smark--current' : 'smark--todo') + '" data-mark></span>';
  }
  function btnHtml(a, primary, extra) {
    var cls = 'btn' + (primary ? ' btn--primary' : '') + (V.bp.phone() ? ' btn--lg' : ''), ic = a.icon ? icon(a.icon) : '';
    if (H.s.offline) return '<button type="button" class="' + cls + '" aria-disabled="true" data-tooltip="You’re offline">' + ic + esc(a.label) + '</button>';
    if (a.href) return '<a class="' + cls + '" href="' + a.href + '">' + ic + esc(a.label) + '</a>';
    return '<button type="button" class="' + cls + '" data-home-act="' + a.act + '" aria-haspopup="dialog"' + (extra || '') + '>' + ic + esc(a.label) + '</button>';
  }
  function linkHtml(a, obj) {
    var sr = obj ? '<span class="sr-only"> ' + esc(obj) + '</span>' : '';
    if (H.s.offline) return '<button type="button" class="btn btn--link" aria-disabled="true" data-tooltip="You’re offline">' + esc(a.label) + sr + '</button>';
    if (a.href) return '<a class="btn btn--link" href="' + a.href + '">' + esc(a.label) + sr + '</a>';
    return '<button type="button" class="btn btn--link" data-home-act="' + a.act + '">' + esc(a.label) + sr + '</button>';
  }
  function statusHtml(tone, ic, html) { return '<span class="status status--md status--' + tone + '">' + (ic ? icon(ic, 'md', ic === 'loader-circle' ? { className: 'spinner' } : null) : '') + '<span>' + html + '</span></span>'; }
  function proofLine(html) { return '<p class="setup-step-proof">' + html + '</p>'; }

  H.stepHtml = function (s) {
    var c = s.cat, st = s.state, cur = !!s.current, phoneBp = V.bp.phone(), id = s.id;
    var word = cur && st === 'failed' ? 'Failed, current step' : cur ? 'Current step' : WORD[st];
    var tag = c.optional ? ' <span class="tag tag--outline">Optional</span>' : '';
    var title = '<span class="sr-only">' + word + ': </span>' + esc(c.title);
    var h = '<li class="setup-step' + (st === 'blocked' || st === 'admin' ? ' is-blocked' : '') + '" id="step-' + id + '"' + (cur ? ' aria-current="step"' : '') + '>' + markHtml(s) + '<div class="home-step">';
    if (st === 'done') {
      var proof = proofLine((s.proof ? esc(s.proof) : c.proofHtml || esc(c.proof)) + (c.proofLink ? ' · ' + linkHtml(c.proofLink, 'your test call') : ''));
      var end = c.end ? linkHtml(c.end, c.title) : '';
      if (phoneBp) {
        var open = !!H.s.open[id];
        return h + '<h3 class="setup-step-title" id="step-' + id + '-t"><button type="button" class="home-disclosure" aria-expanded="' + open + '" aria-controls="step-' + id + '-more" data-home-act="toggle" data-step="' + id + '">' + title + tag + icon('chevron-down', 'sm') + '</button></h3>' +
          '<div class="home-step-more" id="step-' + id + '-more"' + (open ? '' : ' hidden') + '>' + proof + (end ? '<p class="setup-step-proof">' + end + '</p>' : '') + '</div></div></li>';
      }
      return h + '<h3 class="setup-step-title" id="step-' + id + '-t" tabindex="-1" data-focus-target>' + title + tag + '</h3>' + proof + '</div>' + (end ? end.replace('class="btn btn--link"', 'class="btn btn--link setup-step-end"') : '') + '</li>';
    }
    h += '<h3 class="setup-step-title" id="step-' + id + '-t" tabindex="-1" data-focus-target>' + title + tag + '</h3>';
    if (st === 'progress') return h + proofLine(statusHtml('progress', 'loader-circle', c.progressHtml || esc(c.progress))) + '</div></li>';
    if (st === 'attention') return h + proofLine(statusHtml('warning', 'triangle-alert', esc(c.attention))) + '<div class="setup-step-actions">' + btnHtml(c.action, false) + '</div></div></li>';
    h += '<p class="setup-step-body">' + esc(c.body) + '</p>';
    if (st === 'blocked') {
      var links = (s.missing || []).map(function (n) { return '<a href="#step-' + n + '" data-home-act="goto" data-step="' + n + '">' + NEEDS[n] + '</a>'; });
      var list = links.length > 1 ? links.slice(0, -1).join(', ') + ' and ' + links[links.length - 1] : links[0];
      return h + proofLine('Blocked: needs ' + list + '.') + '</div></li>';
    }
    if (st === 'admin') return h + proofLine(esc(c.admin) + ' Ask an admin (' + ADMINS + ' in this workspace). ' + linkHtml({ label: 'Copy request link', act: 'copy-request' })) + '</div></li>';
    if (st === 'failed') {
      h += proofLine(statusHtml('danger', 'circle-x', esc(c.failed) + (cur ? '' : ' · ' + linkHtml(c.retry, c.title))));
      if (!cur) return h + '</div></li>';
    }
    var primary = cur && st === 'failed' ? { label: c.retryLabel || c.retry.label, icon: c.action.icon, act: c.action.act, href: c.action.href } : c.action;
    h += '<div class="setup-step-actions">' + btnHtml(primary, cur && !c.optional);
    if (c.hint) h += '<span class="type-meta-12 u-fg-3">' + esc(c.hint) + '</span>';
    if (c.secondary) h += linkHtml(c.secondary);
    h += '</div>';
    if (c.note && (cur || st === 'todo')) h += '<p class="setup-step-proof">' + esc(c.note) + '</p>';
    return h + '</div></li>';
  };

  function progressHtml(n) {
    return '<div class="progress home-progress" role="progressbar" aria-labelledby="home-trk-h" aria-valuemin="0" aria-valuemax="5" aria-valuenow="' + n + '" aria-valuetext="' + n + ' of 5 done"><i data-p="' + (n / 5) + '"></i></div>';
  }
  function skeletonHtml() {
    var row = '<li class="setup-step" aria-hidden="true"><span class="sk sk--block home-sk-mark"></span><div class="home-step home-sk"><span class="sk-line"><span class="sk sk--title home-sk-30"></span></span><span class="sk-line"><span class="sk home-sk-60"></span></span></div></li>';
    return '<ol class="setup-track" aria-busy="true" aria-label="Setup steps, loading">' + new Array(7).join(row) + '</ol><p class="sr-only" role="status">Loading your setup…</p>';
  }
  function errorHtml() {
    return '<div class="card"><div class="ierr" role="' + (H.s.retried ? 'alert' : 'status') + '"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t load your setup. <button type="button" class="btn btn--link" data-home-act="retry-load">Retry</button></span></div>' +
      '<details class="details"><summary>Details</summary><div class="raw"><code>GET /api/setup · 503 upstream timeout · request_id req_7d20a1</code><button type="button" class="ibtn ibtn--sm" data-home-act="copy-error" aria-label="Copy error details">' + icon('copy', 'sm') + '</button></div></details></div></div>';
  }
  function completeHtml() {
    return '<div class="card home-live" id="home-live"><div class="l-stack l-stack--sm">' +
      '<div class="l-cluster l-cluster--nowrap"><span class="u-fg-success">' + icon('circle-check', 'lg') + '</span><h2 class="type-title-24" id="home-trk-h" tabindex="-1" data-focus-target>Your workspace is live.</h2></div>' +
      '<p class="type-body-14 u-fg-2">Callers on ' + phone(org.inboundNumber.masked) + ' hear <span translate="no">' + esc(FLOW.name) + '</span> v' + FLOW.live.version + '.</p>' +
      '<div class="l-cluster l-cluster--md home-live-acts"><a class="btn btn--primary" href="leads.html?view=new">' + icon('phone-outgoing') + 'Call your first leads…</a><a class="btn btn--tertiary" href="cockpit.html">Go to Cockpit</a></div></div></div>';
  }

  /* The track region (setup mode). Loading and error never show a step as done or current (§13.6). */
  H.trackHtml = function () {
    var S = H.s;
    if (S.page === 'loading') return '<section class="home-track" aria-labelledby="home-trk-h" aria-busy="true"><div class="home-track-head"><h2 class="type-title-16" id="home-trk-h">Setup</h2><span class="sk-line"><span class="sk sk--meta home-sk-count"></span></span></div>' + skeletonHtml() + '</section>';
    if (S.page === 'error') return '<section class="home-track" aria-labelledby="home-trk-h"><div class="home-track-head"><h2 class="type-title-16" id="home-trk-h">Setup</h2></div>' + errorHtml() + '</section>';
    var m = H.derive();
    var head = m.done === 5 ? completeHtml() : '<div class="home-track-head"><h2 class="type-title-16" id="home-trk-h" tabindex="-1" data-focus-target>Setup · <span class="u-num">' + m.done + ' of 5 done</span>' +
      (S.offline ? '<span class="type-meta-12 u-fg-3"> · as of 11:20 am</span>' : '') + '</h2>' + progressHtml(m.done) + '</div>';
    return '<section class="home-track" aria-labelledby="home-trk-h">' + head + '<ol class="setup-track" aria-label="Setup steps, ' + m.done + ' of 5 done">' + ORDER.map(function (id) { return H.stepHtml(m.steps[id]); }).join('') + '</ol></section>';
  };

  /* ---------- the aside: workspace, teammates, help (a row of three at 768–1279) ---------- */
  H.workspaceCard = function () {
    var S = H.s, member = S.role === 'Member';
    var team = org.members.filter(function (m) { return !m.invited; }).length, invited = org.members.filter(function (m) { return m.invited; }).length + S.invited;
    var inv = member ? '<span class="u-fg-3">Ask an admin to invite</span>' : '<button type="button" class="btn btn--link" data-home-act="invite" aria-haspopup="dialog"' +
      (S.offline ? ' aria-disabled="true" data-tooltip="You’re offline"' : '') + '>Invite teammates…</button>';
    /* Help: the setup guide is a docs page (new tab); "Talk to us" is a contact channel, the support address from the claims sheet
       (08-public-auth §2, contact.support), so it opens the mail app instead of the guide. */
    var guide = '<a href="' + HELP.guide + '" target="_blank" rel="noopener" data-vaani-action="help">Setup guide<span class="sr-only"> (opens in a new tab)</span></a>' + icon('external-link', 'xs', { className: 'u-fg-3' });
    var talk = '<a href="mailto:' + HELP.support + '?subject=' + encodeURIComponent('Help with setup') + '">Talk to us<span class="sr-only"> (opens your email app to write to ' + esc(HELP.support) + ')</span></a>' + icon('mail', 'xs', { className: 'u-fg-3' });
    var row = function (k, v) { return '<div class="kv-row"><dt>' + k + '</dt><dd>' + v + '</dd></div>'; };
    return '<section class="card" aria-labelledby="home-ws-h"><div class="card-head"><h2 class="card-title" id="home-ws-h">Your workspace</h2></div>' +
      '<dl class="kv home-facts' + (w.matchMedia('(min-width: 768px) and (max-width: 1279.98px)').matches ? ' kv--stacked' : '') + '">' +
      row('Workspace', '<span translate="no">' + esc(org.name) + '</span><span class="u-fg-3">· ' + esc(S.role) + '</span>') +
      row('Teammates', '<span class="u-num">' + team + '</span>' + (invited ? '<span class="u-fg-3 u-num">· ' + invited + ' invited</span>' : '') + inv) +
      row('Help', guide + '<span class="u-fg-3" aria-hidden="true">·</span>' + talk) + '</dl></section>';
  };

  /* ---------- render ---------- */
  var regions = $('#home-regions'), aside = $('#home-aside');
  H.render = function () {
    var hadFocus = regions.contains(d.activeElement) || aside.contains(d.activeElement);
    if (H.s.mode === 'done' && H.renderOverview) H.renderOverview(regions, aside);
    else { regions.innerHTML = H.trackHtml(); aside.innerHTML = H.workspaceCard(); }
    V.initAll(regions); V.initAll(aside);
    $$('.progress > i[data-p]', regions).forEach(function (i) { i.style.width = (parseFloat(i.getAttribute('data-p')) * 100) + '%'; });
    var m = H.derive();
    if (DATA.setup) { DATA.setup.done = m.done; DATA.setup.next = m.current ? CAT[m.current].title.toLowerCase() : 'waiting on others'; }
    return hadFocus;
  };
  H.focusStep = function (id) { var t = $('#step-' + id + '-t') || $('#step-' + id + ' .home-disclosure') || $('#home-trk-h'); if (t) { t.focus({ preventScroll: true }); t.scrollIntoView({ block: 'nearest' }); } };

  /* Change one step’s state (what the server would push), then announce and move focus only if it was lost. */
  H.setStep = function (id, state, o) {
    o = o || {}; var was = H.derive().done;
    H.s.steps[id].state = state; if (o.proof) H.s.steps[id].proof = o.proof;
    var hadFocus = H.render(), m = H.derive();
    if (state === 'done' && !CAT[id].optional && m.done > was) {
      if (m.done === 5) { V.baseline.facts({ setupComplete: true }); V.baseline.set('activity'); V.toast.success('Setup complete. Your workspace is live.'); H.focusStep('none'); return; }
      V.announce(CAT[id].title + ': done. ' + m.done + ' of 5.');
    }
    if (hadFocus || d.activeElement === d.body || !d.contains(d.activeElement)) H.focusStep(o.focus || (m.current && state === 'done' ? m.current : id));
  };

  /* ---------- delegated actions ---------- */
  d.getElementById('main').addEventListener('click', function (e) {
    var t = e.target.closest('[data-home-act]'); if (!t) return;
    var act = t.getAttribute('data-home-act'), step = t.getAttribute('data-step');
    if (t.getAttribute('aria-disabled') === 'true') { e.preventDefault(); V.announce(t.getAttribute('data-tooltip') || 'Not available'); return; }
    if (act === 'toggle') { H.s.open[step] = !H.s.open[step]; t.setAttribute('aria-expanded', String(H.s.open[step])); $('#step-' + step + '-more').hidden = !H.s.open[step]; }
    else if (act === 'goto') { e.preventDefault(); H.focusStep(step); }
    else if (act === 'call' && H.openCallGate) H.openCallGate(t);
    else if (act === 'topup') V.openTopUp('setup');
    else if (act === 'invite' && H.openInvite) H.openInvite(t);
    else if (act === 'copy-request') { H.copy('https://sample-realty.vaanilabs.example/request?step=setup'); V.toast.success('Request link copied. Send it to an admin.'); }
    else if (act === 'copy-error') { H.copy('GET /api/setup · 503 upstream timeout · request_id req_7d20a1'); V.toast.success('Error details copied.'); }
    else if (act === 'retry-load') { H.s.page = 'loading'; H.s.retried = true; H.render(); $('#home-trk-h').focus(); setTimeout(function () { H.s.page = 'ready'; H.render(); H.focusStep('none'); V.announce('Setup loaded. ' + H.derive().done + ' of 5 done.'); }, 900); }
    else if (act === 'retry-teach') { H.setStep('teach', 'progress'); setTimeout(function () { H.setStep('teach', 'done', { proof: 'Indexed · 13 files · 431 passages' }); V.announce('Teach your agent: done.'); }, 2600); }
  });
  H.copy = function (text) { try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {}); } catch (err) { /* file:// may refuse the clipboard; the toast still confirms the intent */ } };

  /* Re-render on breakpoint changes: done rows collapse on phones and the facts become a row of three at 768–1279. */
  var mqs = ['(max-width: 767.98px)', '(min-width: 768px) and (max-width: 1279.98px)'].map(function (q) { return w.matchMedia(q); });
  mqs.forEach(function (mq) { var fn = function () { H.render(); }; if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn); });

  /* ---------- start: page-local workspace state for the demo (nav badges, Baseline) then the first render ---------- */
  /* line-none and line-verifying are shared Baseline segments (shell.js); line-none reads the live setup count */
  if (H.s.mode === 'done') { d.body.removeAttribute('data-baseline'); V.baseline.set(demo === 'regression' ? 'unverified' : null); }
  else if (demo === 'new') V.baseline.set(['flow-none', 'line-none', 'wallet']);
  else if (demo === 'waiting') V.baseline.set(['flow-published', 'line-verifying', 'wallet']);
  else if (demo === 'complete') { V.baseline.facts({ setupComplete: true }); V.baseline.set('activity'); }
  if (demo === 'new' || demo === 'regression') DATA.state.numberStatus = 'unverified';
  quietWorkspace();
  if (H.s.offline) $('#home-cbar').innerHTML = '<div class="cbar" role="status">' + icon('cloud-off') + '<span><b>You’re offline.</b> Showing data from 11:20 am.</span></div>';
  H.render();
  V.shell.render();   /* nav badges, Baseline and BaselineChip re-read the page-local workspace state set above */

  /* No false activity (F-UX-006, overlay-feedback P1 "report only what is proven"). Until all five checks pass no customer call has
     been placed, so nothing derived from calls exists yet: no call in progress (Cockpit badge, Baseline "calls in progress"), no
     running batch, no callbacks due, no answers proposed from calls, no call reports. A brand-new workspace (New, First run) also
     has no flow drafts, Assistant plans or Personal-agent tasks yet. After setup, a workspace whose calls are paused (number lost
     its verification, wallet ₹0) has no call in progress either. */
  function quietWorkspace() {
    var st = DATA.state;
    if (H.s.mode === 'setup') {
      st.liveCalls = 0; st.upNext = 0; st.callbacksDueToday = 0; st.proposals = 0; st.myCall = null;
      DATA.live = []; DATA.upNext = []; DATA.calls = [];
      if (demo === 'new' || demo === 'first-run') { st.flowsWithDrafts = 0; st.assistantWaiting = 0; st.tasksToConfirm = 0; }
    } else if (demo === 'regression' || V.walletState() === 'empty') { st.liveCalls = 0; st.myCall = null; DATA.live = []; }
  }
})(window, document, window.Vaani);
