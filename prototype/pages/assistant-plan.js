/* Vaani Labs prototype · pages/assistant-plan.js — PlanPanel, PlanStep, PlanBar and the Changes tab (02 §9, §5.2).
   Rule (§5.2): the ApprovalCard renders in exactly ONE place: the plan panel when it is visible (≥ 1024 and not hidden),
   otherwise inline at the end of the thread. The plan sheet below 1024 lists the steps and points to the inline card. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt;
  var A = w.VaaniAssistant;

  var NEEDS = { waiting: 1, blocked: 1 };
  A.planState = function (p) {
    if (!p) return null;
    if (p.state === 'stopped' || p.state === 'failed' || p.state === 'expired') return p.state;
    var s = p.steps.map(function (x) { return A.stepStatus(x); });
    if (s.indexOf('failed') >= 0) return 'failed';
    if (s.indexOf('blocked') >= 0) return 'blocked';
    if (s.indexOf('waiting') >= 0) return 'waiting';
    if (s.indexOf('running') >= 0 || s.indexOf('queued') >= 0 || s.indexOf('pending') >= 0) return 'running';
    return 'done';
  };
  /* A waiting step whose guard can’t pass (wallet ₹0, role, setup…) shows as Blocked (02 §9.2, §10.4). */
  A.stepStatus = function (s) { return s.status === 'waiting' && A.blockedReason && A.blockedReason(s) ? 'blocked' : s.status; };
  A.waitingStep = function () { var p = A.S.chat && A.S.chat.plan; if (!p || p.state === 'stopped') return null; for (var i = 0; i < p.steps.length; i++) if (NEEDS[A.stepStatus(p.steps[i])]) return p.steps[i]; return null; };
  A.stepsRanFor = function (t) { var p = A.S.chat.plan; return !!(t.planRef && p && p.id === t.planRef && p.steps.some(function (s) { return s.status === 'done'; })); };
  A.stepIndex = function (s) { return A.S.chat.plan.steps.indexOf(s) + 1; };
  A.panelVisible = function () { return V.bp.desktopShell() && !A.S.panelHidden; };
  A.cardPlace = function () { return A.panelVisible() ? 'panel' : 'inline'; };

  var MARK = { done: ['done', 'check'], waiting: ['waiting', 'pause'], blocked: ['waiting', 'lock'], queued: ['todo', null], pending: ['todo', null], running: ['progress', 'spin'],
    failed: ['failed', 'x'], skipped: ['skipped', 'minus'], cancelled: ['skipped', 'minus'], expired: ['skipped', 'timer-off'], open: ['todo', null] };
  var WORD = { done: 'Done', waiting: 'Waiting for you', blocked: 'Blocked', queued: 'Queued', pending: 'Queued', running: 'Running', failed: 'Failed', skipped: 'Skipped', cancelled: 'Cancelled', expired: 'Expired', open: 'You do this step' };
  function mark(st) { var m = MARK[st] || MARK.queued; return '<span class="smark smark--' + m[0] + ' as-smark" data-mark aria-hidden="true">' + (m[1] === 'spin' ? A.spin('xs') : m[1] ? A.ic(m[1], 'xs') : '') + '</span>'; }
  A.markHtml = mark;

  function resultHtml(s, st) {
    var r = s.result || {}, bits = [];
    if (st === 'done') bits.push('<span class="status status--success">' + A.ic('check', 'sm') + esc(r.word || 'Done') + '</span>');
    if (st === 'running') bits.push('<span class="status status--progress">' + A.spin('sm') + esc(s.runningText || 'Running…') + '</span>');
    if (st === 'queued' || st === 'pending') bits.push('<span class="as-q">' + esc(s.queuedText || 'After step ' + (A.stepIndex(s) - 1)) + '</span>');
    if (st === 'skipped') bits.push('<span>' + esc(s.skipText || 'Skipped by you') + '</span>');
    if (st === 'cancelled') bits.push('<span>' + esc(s.cancelText || 'Not run: plan stopped') + '</span>');
    if (st === 'expired') bits.push('<span>Approval expired after 24 h</span> · <button type="button" class="btn btn--link" data-act="ask-again" data-step="' + s.id + '">Ask again</button>');
    if (st === 'blocked') bits.push('<span class="status status--warning">' + A.ic('lock', 'sm') + esc(A.blockedReason(s).text) + '</span>');
    if (st === 'failed') return '<div class="ierr as-step-err" role="group"><div class="ierr-line">' + A.ic('circle-alert') + '<span>' + esc(s.failText) + (s.failAct ? ' <button type="button" class="btn btn--link" data-act="' + s.failAct.act + '" data-step="' + s.id + '">' + esc(s.failAct.label) + '</button>' : '') + (s.failAct2 ? ' · ' + A.link(s.failAct2, 'btn btn--link') : '') + '</span></div></div>';
    if (st === 'open') bits.push('<span>You do this step</span>', A.link(s.openLink || (/editdraft|publish/.test(s.approval || '') ? { label: 'Open the draft in Flows', href: 'flow-designer.html' } : { label: 'Open Leads with these leads selected', href: 'leads.html' })));
    if (r.text && st === 'done') bits.push('<span>' + esc(r.text) + '</span>');
    if (r.link && st === 'done') bits.push(A.link(r.link));
    if (r.undo && st === 'done') bits.push(r.undone ? '<span>Undone ' + esc(F.time(r.undoneAt)) + '</span>' : '<button type="button" class="btn btn--link" data-act="undo-step" data-step="' + s.id + '"' + (r.undoTip ? ' data-tooltip="' + esc(r.undoTip) + '"' : '') + '>Undo</button>');
    if (r.rollback && st === 'done') bits.push('<button type="button" class="btn btn--link" data-act="rollback" data-step="' + s.id + '">Roll back…</button>');
    return bits.length ? '<p class="as-step-res" id="res-' + s.id + '" tabindex="-1">' + bits.join('<span class="as-dot" aria-hidden="true"> · </span>') + '</p>' : '';
  }

  function stepTitle(s) { return s.ap && /^(call|import|mark)$/.test(s.approval) ? s.title.replace(/\b\d+ leads?\b/, A.plural(A.apCount(s), 'lead')) : s.title; }
  A.stepHtml = function (s, where) {
    var st = A.stepStatus(s), i = A.stepIndex(s), n = A.S.chat.plan.steps.length;
    var needs = NEEDS[st] && A.S.chat.plan.state !== 'stopped';
    var h = '<li class="as-step as-step--' + st + '" id="' + where + '-' + s.id + '" data-step="' + s.id + '"' + (needs ? ' aria-current="step"' : '') + '>' + mark(st) +
      '<div class="as-step-main"><p class="as-step-kind"><span class="sr-only">Step ' + i + ' of ' + n + ', ' + esc(WORD[st] || st) + ': </span><span aria-hidden="true">' + i + ' · </span>' + esc(s.kind) + '</p><p class="as-step-title">' + esc(stepTitle(s)) + '</p>';
    if (needs) {
      if (where === 'panel' && A.cardPlace() === 'panel') h += '<div class="as-card-wrap">' + A.cardHtml(s) + '</div>';
      else if (where === 'sheet') h += '<p class="as-step-res">' + V.ui.statusTag('plan', st) + ' <button type="button" class="btn btn--link" data-act="goto-card" data-step="' + s.id + '">Review in the conversation</button></p>';
      else h += '<p class="as-step-res">' + V.ui.statusTag('plan', st) + '</p>';
    } else h += resultHtml(s, st);
    if (s.details) h += '<details class="as-step-det"><summary>Details</summary><p>' + esc(s.details) + '</p></details>';
    return h + '</div></li>';
  };

  function emptyHtml() {
    var m = A.S.mode;
    if (m === 1) return '<div class="as-plan-empty"><p>I suggest the steps. You make every change, from the page I link to.</p></div>';
    if (m === 3) return '<div class="as-plan-empty"><p>Undoable changes run on their own and are listed under Changes. Everything else waits for your approval.</p></div>';
    return '<div class="as-plan-empty"><p>The steps for each request appear here before they run.</p><ul class="as-rules">' +
      '<li>' + A.ic('search', 'md', { className: 'u-fg-3' }) + '<span>Look-ups and new drafts run on their own</span></li>' +
      '<li>' + A.ic('pause', 'md', { className: 'u-fg-3' }) + '<span>Changes to records and flows wait for your approval</span></li>' +
      '<li>' + A.ic('shield-check', 'md', { className: 'u-fg-3' }) + '<span>Calls and publishing go through their checks</span></li></ul></div>';
  }
  function changesHtml() {
    var ch = (A.S.chat && A.S.chat.changes) || [];
    if (!ch.length) return '<div class="empty empty--compact as-plan-empty"><p>Nothing has changed in this chat.</p></div>';
    var byDay = {}; ch.slice().reverse().forEach(function (c) { var k = F.when(c.at).replace(/ \d.*$/, ''); (byDay[k] = byDay[k] || []).push(c); });
    return Object.keys(byDay).map(function (k) {
      return '<div class="tl as-tl"><h3 class="tl-day">' + esc(k) + '</h3><ol class="tl-list">' + byDay[k].map(function (c) {
        var acts = (c.acts || []).map(function (a) { return a.href ? '<a class="btn btn--sm" href="' + esc(a.href) + '">' + esc(a.label) + '</a>' : '<button type="button" class="btn btn--sm" data-act="' + a.act + '" data-change="' + c.id + '">' + esc(a.label) + '</button>'; });
        if (c.undo && !c.undone) acts.push('<button type="button" class="btn btn--sm" data-act="undo-change" data-change="' + c.id + '" data-tooltip="' + esc(c.undoTip || 'Undo available for 24 h') + '">Undo</button>');
        return '<li class="tl-item"><span class="tl-node' + (c.undone ? '' : ' tl-node--success') + '" aria-hidden="true">' + A.ic(c.undone ? 'undo-2' : c.icon || 'check', 'sm') + '</span><div class="tl-text">' + c.html + (c.undone ? ' · <span class="u-fg-3">Undone ' + esc(F.time(c.undoneAt)) + '</span>' : '') + '<span class="as-tl-who">You via Assistant</span></div><span class="tl-time">' + esc(F.time(c.at)) + '</span>' + (acts.length ? '<div class="tl-actions">' + acts.join('') + '</div>' : '') + '</li>';
      }).join('') + '</ol></div>';
    }).join('');
  }
  function footHtml() {
    var s = A.modeSentence();
    return esc(s) + (A.S.demo === 'no-autonomy-api' ? '' : ' · <a class="as-a" href="settings.html#assistant">Assistant permissions</a>');
  }
  function metaText(p) {
    var st = A.planState(p), w = A.waitingStep(), i = w ? A.stepIndex(w) : 0, n = p.steps.length;
    if (st === 'done') return 'Done · ' + n + ' of ' + n;
    if (st === 'stopped') { var at = p.steps.filter(function (s) { return s.status === 'cancelled'; })[0]; return 'Stopped at step ' + (at ? A.stepIndex(at) : n); }
    if (w) return 'Step ' + i + ' of ' + n;
    var r = p.steps.filter(function (s) { return s.status === 'running' || s.status === 'queued' || s.status === 'pending'; })[0];
    return r ? 'Step ' + A.stepIndex(r) + ' of ' + n : n + ' steps';
  }

  function bodyHtml(where) {
    var ch = A.S.chat, p = ch && ch.plan;
    if (A.S.loading) return '<div class="as-sk-plan" aria-hidden="true">' + [1, 2, 3].map(function () { return '<div class="as-sk-step"><span class="as-sk-circle"><span class="sk"></span></span><div class="l-stack l-stack--xs"><span class="sk sk--meta as-w-30"></span><span class="sk as-w-80"></span></div></div>'; }).join('') + '</div>';
    if (A.S.tab === 'changes') return changesHtml();
    if (!p) return emptyHtml();
    if (p.planning) return '<p class="status status--progress as-planning">' + A.spin('sm') + '<span>Planning…</span></p>';
    return '<ol class="as-steps" aria-label="Plan steps">' + p.steps.map(function (s) { return A.stepHtml(s, where); }).join('') + '</ol>';
  }

  /* ---------- render everything plan-related ---------- */
  A.renderPlan = function () {
    var ch = A.S.chat, p = ch && ch.plan, st = A.planState(p), panel = $('#as-plan');
    var keep = d.activeElement && (panel.contains(d.activeElement) || $('#as-inline-card') && $('#as-inline-card').contains(d.activeElement)) ? A.focusKey(d.activeElement) : null;
    $('#as-plan-tag').innerHTML = p && !p.planning && !A.S.loading ? V.ui.statusTag('plan', st === 'stopped' ? 'stopped' : st) : '';
    $('#as-plan-meta').textContent = p && !p.planning && !A.S.loading ? metaText(p) : '';
    var running = p && (st === 'running' || st === 'waiting' || st === 'blocked') && p.state !== 'stopped' && !A.S.loading;
    $('#as-stop-plan').hidden = !running;
    var n = ch ? (ch.changes || []).filter(function (c) { return !c.undone; }).length : 0;
    $('#as-ch-count').textContent = n; $('#as-sch-count').textContent = n;
    ['as-tab-plan', 'as-stab-plan'].forEach(function (id) { var t = $('#' + id); t.setAttribute('aria-selected', A.S.tab === 'plan' ? 'true' : 'false'); t.tabIndex = A.S.tab === 'plan' ? 0 : -1; });
    ['as-tab-changes', 'as-stab-changes'].forEach(function (id) { var t = $('#' + id); t.setAttribute('aria-selected', A.S.tab === 'changes' ? 'true' : 'false'); t.tabIndex = A.S.tab === 'changes' ? 0 : -1; });
    $('#as-plan-body').setAttribute('aria-labelledby', A.S.tab === 'plan' ? 'as-tab-plan' : 'as-tab-changes');
    $('#as-ps-body').setAttribute('aria-labelledby', A.S.tab === 'plan' ? 'as-stab-plan' : 'as-stab-changes');
    $('#as-plan-body').innerHTML = bodyHtml('panel');
    $('#as-plan-foot').innerHTML = footHtml(); $('#as-ps-foot').innerHTML = footHtml();
    if (A.drawerOpen()) { $('#as-ps-body').innerHTML = bodyHtml('sheet'); $('#as-ps-meta').innerHTML = p ? esc(metaText(p)) : ''; }
    renderInline(); renderBar(st);
    [panel, $('#as-plan-sheet')].forEach(function (r) { V.initAll(r); });
    watchPanelCard();
    if (keep) A.restoreFocus(keep);
    A.wireCards && A.wireCards();
  };
  A.drawerOpen = function () { return V.drawer.isOpen('as-plan-sheet'); };

  /* ---------- the card’s decision row in the panel (§10.3 Footer; R2A-03) ----------
     "When the card is taller than its scroll area, the footer is sticky at the bottom of that area." That is every 320 panel
     at 1024×768, but also the 360 panel at 1366×768 and 1280×800, so it is measured, not tied to a breakpoint. The card’s
     scroll area is the panel body’s content box less the step heading above it ("3 · Call" + the step title), because the
     panel lands on the waiting step’s top (scrollPanelToWaiting): the card gets data-tall whenever step top → card bottom
     does not fit, on every render and whenever the panel or the card resizes (viewport, web fonts, the edit form). It is
     measured without data-tall, so the sticky row’s own padding can’t flip the answer. assistant.css sticks .as-ap-foot for
     [data-tall] cards and reserves the row’s height as the body’s scroll-padding-bottom, so focus moves and scrollIntoView
     stop above it (WCAG 2.4.11). */
  var tallRO = w.ResizeObserver ? new ResizeObserver(function () { w.requestAnimationFrame(A.fitPanelCard); }) : null;
  if (!tallRO) w.addEventListener('resize', function () { A.fitPanelCard(); });
  A.fitPanelCard = function () {
    var body = $('#as-plan-body'); if (!body) return;
    var cs = getComputedStyle(body), room = body.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0), stick = 0, top = body.scrollTop;
    $$('.as-ap', body).forEach(function (ap) {
      ap.removeAttribute('data-tall');
      var step = ap.closest('li') || ap;
      if (!A.panelVisible() || ap.getBoundingClientRect().bottom - step.getBoundingClientRect().top <= room) return;
      ap.setAttribute('data-tall', '');
      $$('.as-ap-foot', ap).forEach(function (f) { if (U.visible(f)) stick = Math.max(stick, Math.ceil(f.getBoundingClientRect().height)); });
    });
    if (stick) body.style.setProperty('--as-stick-h', stick + 'px'); else body.style.removeProperty('--as-stick-h');
    if (body.scrollTop !== top) body.scrollTop = top; /* measuring without the row’s 9 px can clamp a panel scrolled to its end */
  };
  function watchPanelCard() {
    var body = $('#as-plan-body'); if (!body) return;
    if (tallRO) { tallRO.disconnect(); tallRO.observe(body); $$('.as-ap', body).forEach(function (ap) { tallRO.observe(ap); }); }
    A.fitPanelCard();
  }

  function renderInline() {
    var slot = $('#as-inline-card'); if (!slot) return;
    var s = A.waitingStep(), p = A.S.chat && A.S.chat.plan;
    if (A.cardPlace() !== 'inline' || A.S.loading || !p) { slot.innerHTML = ''; slot.hidden = true; return; }
    if (!s) {
      /* The step that just finished keeps its result line here, so focus has somewhere to land (02 §14.2). */
      var last = A.S.lastDone && p.steps.filter(function (x) { return x.id === A.S.lastDone; })[0];
      if (!last) { slot.innerHTML = ''; slot.hidden = true; return; }
      var lst = A.stepStatus(last);
      slot.hidden = false;
      slot.innerHTML = '<div class="as-inline-step">' + mark(lst) + '<span>Step ' + A.stepIndex(last) + ' of ' + p.steps.length + ' · ' + esc(last.kind) + '</span></div>' + resultHtml(last, lst).replace('id="res-' + last.id + '"', 'id="res-inline-' + last.id + '"').replace('<p class="as-step-res"', '<p class="as-step-res as-inline-res"');
      V.initAll(slot); return;
    }
    var st = A.stepStatus(s), i = A.stepIndex(s), n = p.steps.length;
    slot.hidden = false;
    slot.innerHTML = '<div class="as-inline-step">' + mark(st) + '<span>Step ' + i + ' of ' + n + ' · ' + esc(s.kind) + '</span>' + V.ui.statusTag('plan', st) + '</div><div class="as-card-wrap">' + A.cardHtml(s) + '</div>';
    V.initAll(slot);
  }
  function renderBar(st) {
    var bar = $('#as-planbar'), p = A.S.chat && A.S.chat.plan;
    if (!p || p.planning || A.S.loading || V.bp.desktopShell()) { bar.hidden = true; return; }
    var w = A.waitingStep(), i = w ? A.stepIndex(w) : 0, n = p.steps.length;
    var txt = w ? 'Step ' + i + ' of ' + n + ' · <span class="as-need">' + (st === 'blocked' ? 'Step ' + i + ' is blocked' : '1 step needs you') + '</span>' : esc(metaText(p));
    bar.hidden = false;
    bar.innerHTML = A.ic('list-checks') + '<span class="as-planbar-t">Plan · ' + txt + '</span>' + A.ic('chevron-up', 'md', { className: 'u-fg-3' });
    bar.setAttribute('aria-label', 'Open plan. ' + bar.textContent.trim());
  }

  /* ---------- focus bookkeeping across re-renders ---------- */
  A.focusKey = function (el) { var host = el.closest('[data-step]'), act = el.getAttribute('data-act') || el.id || (el.className && String(el.className).split(' ')[0]); return { step: host && host.getAttribute('data-step'), act: act, inline: !!el.closest('#as-inline-card') }; };
  A.restoreFocus = function (k) {
    var root = k.inline ? $('#as-inline-card') : $('#as-plan'); if (!root) return;
    var sel = k.step ? '[data-step="' + k.step + '"] ' : '';
    var el = (k.act && ($(sel + '[data-act="' + k.act + '"]', root) || (k.act.indexOf('as-') === 0 && $('#' + k.act)))) || (k.step && $('#res-' + k.step));
    if (el && U.visible(el)) el.focus({ preventScroll: true });
  };

  /* ---------- scroll helpers: Review from the pointer, ?step= deep links ---------- */
  A.revealStep = function (id, focus, o) {
    var s = A.S.chat.plan && A.S.chat.plan.steps.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    var target, slot = $('#as-inline-card'), smooth = !(o && o.instant);
    if (NEEDS[A.stepStatus(s)] && A.cardPlace() === 'inline' && slot && !slot.hidden) {
      /* Inline: fit the card between the TopBar and the dock (A.showCard); when focus goes to the title, keep the title in view. */
      target = $('.as-card-title', slot) || slot; A.showCard(slot, { top: !!focus || d.activeElement === target, smooth: smooth });
      if (focus) { if (!target.hasAttribute('tabindex') && !target.matches('button,a')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      return;
    }
    if (A.panelVisible()) target = $('#panel-' + id + ' .as-card-title') || $('#res-' + id) || $('#panel-' + id);
    else { A.openPlanSheet(); target = $('#sheet-' + id); }
    if (!target) return;
    target.scrollIntoView({ block: 'nearest', behavior: V.reducedMotion() || !smooth ? 'auto' : 'smooth' });
    if (focus) { if (!target.hasAttribute('tabindex') && !target.matches('button,a')) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  };
  A.openPlanSheet = function (trigger) {
    if (A.drawerOpen()) return;
    $('#as-ps-body').innerHTML = bodyHtml('sheet');
    var p = A.S.chat && A.S.chat.plan; $('#as-ps-meta').textContent = p ? metaText(p) : '';
    V.initAll($('#as-plan-sheet'));
    V.drawer.open('as-plan-sheet', { mode: 'modal', returnTo: trigger || $('#as-planbar') });
  };
  A.scrollPanelToWaiting = function () {
    var body = $('#as-plan-body'), wEl = $('#as-plan-body [aria-current="step"]'); if (!body || !wEl || !A.panelVisible()) return;
    var top = wEl.offsetTop - body.offsetTop - 8, bottom = wEl.offsetTop + wEl.offsetHeight - body.offsetTop + 8;
    if (bottom > body.scrollTop + body.clientHeight) body.scrollTop = Math.min(top, bottom - body.clientHeight);
  };

  /* ---------- Changes (§9.5) ---------- */
  A.addChange = function (c) { c.id = c.id || U.uid('ch'); c.at = c.at || A.nowIso(); A.S.chat.changes = A.S.chat.changes || []; A.S.chat.changes.push(c); if (A.renderHeader) A.renderHeader(); return c; };
  A.undoChange = function (c, quiet) {
    if (!c || c.undone) return; c.undone = true; c.undoneAt = A.nowIso();
    if (c.step) { var s = A.S.chat.plan && A.S.chat.plan.steps.filter(function (x) { return x.id === c.step; })[0]; if (s && s.result) { s.result.undone = true; s.result.undoneAt = c.undoneAt; } }
    A.renderPlan(); A.renderThread && A.renderThread(); A.renderHeader && A.renderHeader();
    if (!quiet) A.say('Undone. ' + String(c.html).replace(/<[^>]+>/g, '') + ' was reversed.');
  };
})(window, document);
