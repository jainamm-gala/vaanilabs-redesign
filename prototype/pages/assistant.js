/* Vaani Labs prototype · pages/assistant.js — boots the Assistant (03-pages/02): URL state (?chat, ?step, ?tab, ?mode, and the
   prototype-only ?demo / ?scenario), the page header (page vs nested), the thread with its empty, loading and error states,
   follow mode and "Jump to latest", the plan toggle and the one-place ApprovalCard rule, keyboard (F6 regions, Page Up/Down
   between turns, End/Home), palette actions, the waiting nav badge, and the Prototype states popover. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, store = U.store, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA, H = A.ACT = A.ACT || {};
  var q = new URLSearchParams(w.location.search);

  /* ---------- the Assistant nav badge: the shared NAV config reads DATA.state.assistantWaiting; this page keeps it current ---------- */
  A.waitingCount = function () { return A.S.chats.filter(function (c) { var ch = c.id === (A.S.chat && A.S.chat.id) ? A.S.chat : c; return ch.plan && A.waitingIn(ch.plan); }).length; };
  A.waitingIn = function (p) { return p.state !== 'stopped' && p.state !== 'expired' && p.steps.some(function (s) { return s.status === 'waiting'; }); };
  var lastBadge = null;

  /* ---------- state ---------- */
  var mode = +q.get('mode');
  A.S = { mode: mode === 1 || mode === 3 ? mode : 2, demo: q.get('demo'), chats: AD.build(), chat: null, tab: q.get('tab') === 'changes' ? 'changes' : 'plan',
    panelHidden: store.get('vaani:assistant:plan') === 'hidden', offline: q.get('demo') === 'offline' || navigator.onLine === false };
  A.S.unavailable = A.S.demo === 'unavailable'; A.S.limit = A.S.demo === 'limit'; A.S.rate = 0;
  if (A.S.demo === 'history-empty') A.S.chats = [];
  A.modeSentence = function () { return ['', 'Suggests steps. You make every change.', 'Asks before changing anything.', 'Makes undoable changes, asks for the rest.'][A.S.mode]; };

  /* ---------- header ---------- */
  A.renderHeader = function () {
    var c = A.S.chat, saved = c && c.id, h1 = $('#page-title');
    $('#as-crumbs').hidden = !saved;
    h1.textContent = saved ? c.title : 'Assistant';
    if (saved) h1.setAttribute('translate', 'no'); else h1.removeAttribute('translate');
    var n = saved ? (c.changes || []).filter(function (x) { return !x.undone; }).length : 0;
    $('#as-meta').textContent = saved ? 'Started ' + A.whenLower(c.startedAt) + ' · ' + A.plural(n, 'change') : A.modeSentence();
    V.setTitle(saved ? c.title : null);
    var back = saved ? 'assistant.html' : null;
    if (d.body.getAttribute('data-back-href') !== back) { if (back) { d.body.setAttribute('data-back-href', back); d.body.setAttribute('data-back-label', 'Assistant'); } else { d.body.removeAttribute('data-back-href'); d.body.removeAttribute('data-back-label'); } V.shell.render(); }
    else V.shell.syncTitle();
    $('#as-more-menu').innerHTML = (saved ? '<button class="menu-item" role="menuitem" type="button" data-value="rename">' + A.ic('pencil') + '<span class="menu-text"><span>Rename chat…</span></span></button>' : '') +
      '<a class="menu-item" role="menuitem" href="settings.html#assistant">' + A.ic('shield-check') + '<span class="menu-text"><span>Assistant permissions</span></span></a>' +
      '<button class="menu-item" role="menuitem" type="button" data-value="voice">' + A.ic('mic') + '<span class="menu-text"><span>Voice conversation</span></span><span class="menu-end"><span class="tag tag--outline">Beta</span></span></button>' +
      (saved ? '<div class="menu-sep" role="separator"></div><button class="menu-item menu-item--danger" role="menuitem" type="button" data-value="delete">' + A.ic('trash-2') + '<span class="menu-text"><span>Delete chat…</span></span></button>' : '');
  };

  /* ---------- thread ---------- */
  function welcome() {
    var ws = A.S.demo === 'no-calls', starters = ws ? AD.startersNoCalls.concat(AD.starters.filter(function (s) { return s.id === 'draft' || s.id === 'doc'; })) : AD.starters.concat(AD.workspaceSugs());
    var second = ['', 'I show you the plan and suggest each step; you make every change.', 'I show you the plan first and ask before changing anything.', 'I show you the plan first, make undoable changes on my own and ask before the rest.'][A.S.mode];
    return '<div class="as-empty">' + A.migrationHtml() + A.recentHtml() + '<div class="as-welcome">' + A.ic('bot', 'lg', { className: 'u-fg-3' }) + '<h3 class="as-welcome-h">What can I do for you?</h3>' +
      '<p class="as-welcome-p">I can summarise calls, answer questions about your leads and analytics, draft call flows and prepare calls. ' + esc(second) + '</p><p class="as-welcome-m">Answers use only this workspace’s data and link to their sources.</p>' +
      '<div class="as-sugs" role="group" aria-label="Suggestions">' + starters.map(function (s) { return A.sugButton(s); }).join('') + '</div></div></div>';
  }
  function pageState(icon, title, body, acts) { return '<div class="empty empty--page as-pagestate">' + A.ic(icon, 'xl') + '<h3 class="empty-title">' + esc(title) + '</h3><p>' + esc(body) + '</p><div class="empty-actions">' + acts + '</div></div>'; }
  A.renderThread = function () {
    var col = $('#as-col'), c = A.S.chat, dm = A.S.demo, keep = col.contains(d.activeElement) ? A.threadFocusKey(d.activeElement) : null, h = '';
    var blocked = dm === 'not-found' || dm === 'forbidden' || dm === 'turned-off';
    $('#as-dock').hidden = blocked; $('#as-work').setAttribute('data-state', blocked ? 'page' : c && c.id ? 'chat' : 'new');
    if (dm === 'not-found') h = pageState('search-x', 'This chat doesn’t exist', 'It may have been deleted.', '<button type="button" class="btn btn--primary has-lead" data-act="new">' + A.ic('square-pen') + 'New chat</button><button type="button" class="btn has-lead" data-act="history">' + A.ic('history') + 'History</button>');
    else if (dm === 'forbidden') h = pageState('lock', 'This chat is private', 'This chat is private to the person who started it.', '<a class="btn btn--primary" href="assistant.html">Go to Assistant</a>');
    else if (dm === 'turned-off') h = pageState('lock', 'The Assistant is turned off', 'The Assistant is turned off for this workspace. Ask an admin (2 in this workspace).', '<button type="button" class="btn has-lead" data-act="copy-request">' + A.ic('copy') + 'Copy request link</button>');
    else {
      if (A.S.unavailable) h += '<div class="notice notice--warning notice--multi as-degraded" role="status">' + A.ic('triangle-alert') + '<div class="notice-body">The Assistant is unavailable right now. Your chats and plans are safe. Try again in a few minutes.</div><div class="notice-acts"><button type="button" class="notice-act" data-act="unavail-retry">Retry</button></div></div>';
      if (A.S.loading) h += '<div class="as-feed" role="feed" aria-busy="true" aria-label="Conversation"><p class="sr-only">Loading chat…</p>' + [1, 2, 3].map(function () { return '<div class="as-sk-ex" aria-hidden="true"><div class="as-sk-you"><span class="sk as-w-60"></span><span class="sk as-w-40"></span></div><div class="as-sk-bot"><span class="sk as-w-90"></span><span class="sk as-w-80"></span><span class="sk as-w-50"></span></div></div>'; }).join('') + '</div>';
      else if (!c.id) h += welcome();
      else { var n = c.turns.length; h += '<div class="as-feed" role="feed" aria-busy="' + (A.streaming() ? 'true' : 'false') + '" aria-label="Conversation">' + c.turns.map(function (t, i) { return A.turnHtml(t, i, n); }).join('') + '</div>'; }
      h += '<div class="as-inline" id="as-inline-card" hidden></div>';
    }
    col.innerHTML = h; V.initAll(col);
    A.renderPlan && A.renderPlan();
    if (keep) A.restoreThreadFocus(keep);
    syncBadge();
  };
  A.threadFocusKey = function (el) { var a = el.closest('article'); return { turn: a && a.id, act: el.getAttribute('data-act'), sug: el.getAttribute('data-sug') }; };
  A.restoreThreadFocus = function (k) { var el = k.turn ? ($('#' + k.turn + ' [data-act="' + k.act + '"]') || $('#' + k.turn)) : k.sug ? $('[data-sug="' + k.sug + '"]') : null; if (el) el.focus({ preventScroll: true }); };
  A.renderAll = function () { A.renderHeader(); A.renderThread(); A.composerState(); renderNotices(); };
  function syncBadge() { var n = A.waitingCount(); if (n !== lastBadge) { lastBadge = n; V.data.state.assistantWaiting = n; V.shell.render(); } }
  function renderNotices() {
    $('#as-notices').innerHTML = A.S.offline && !$('main > .cbar') ? '<div class="cbar" role="status">' + A.ic('cloud-off') + '<span><b>You’re offline.</b> Your message stays here. Send, Dictate and approvals come back when you reconnect.</span></div>' : '';
    $('#as-limit').innerHTML = A.S.limit ? '<div class="notice notice--neutral as-limit-n" role="status">' + A.ic('clock') + '<div class="notice-body">You’ve reached today’s Assistant limit. It resets at 12:00 am IST.</div></div>' : '';
  }

  /* ---------- follow mode (TranscriptFeed rules) and Jump to latest ---------- */
  A.scroller = function () { return V.bp.desktopShell() ? $('#as-scroll') : d.scrollingElement; };
  var pinned = true;
  function gap() { var s = A.scroller(); return s.scrollHeight - s.scrollTop - s.clientHeight; }
  var quietUntil = 0;
  function onScroll() { if (Date.now() < quietUntil) return; pinned = gap() <= 48; setJump(pinned || !(A.S.chat && A.S.chat.id)); }
  /* "Jump to latest" floats just above the dock. Its footprint joins the scroll padding (A.syncDock). When the scroll that a
     focus move just caused is what brings it up, the newly focused control it would cover is nudged above it (WCAG 2.4.11);
     a reader’s own scrolling is never fought. */
  var focusedAt = 0; $('#as-col').addEventListener('focusin', function () { focusedAt = Date.now(); });
  function setJump(hide) {
    var j = $('#as-jump'), a = d.activeElement; if (j.hidden === hide) return; j.hidden = hide; A.syncDock();
    if (!hide && Date.now() - focusedAt < 300 && a && $('#as-col').contains(a) && a.getBoundingClientRect().bottom > j.getBoundingClientRect().top) a.scrollIntoView({ block: 'nearest' });
  }
  A.follow = function (force) { if (force) pinned = true; if (!pinned) { onScroll(); return; } var s = A.scroller(); s.scrollTop = s.scrollHeight; setJump(true); };
  $('#as-scroll').addEventListener('scroll', onScroll, { passive: true }); w.addEventListener('scroll', onScroll, { passive: true });
  d.addEventListener('selectionchange', function () { var sel = d.getSelection && d.getSelection(); if (sel && !sel.isCollapsed && $('#as-col').contains(sel.anchorNode)) pinned = false; });
  $('#as-jump').addEventListener('click', function () { var s = A.scroller(); s.scrollTo({ top: s.scrollHeight, behavior: V.reducedMotion() ? 'auto' : 'smooth' }); pinned = true; setJump(true); var arts = $$('#as-col article'); if (arts.length) arts[arts.length - 1].focus({ preventScroll: true }); });
  function land(step, again) {
    var w0 = A.waitingStep(), s = A.scroller(), c = A.S.chat; quietUntil = Date.now() + 400; setJump(true);
    if (step) A.revealStep(step, !again, { instant: !!again });
    else {
      s.scrollTop = s.scrollHeight; pinned = true;
      /* A waiting inline card: all of it when it fits between the TopBar and the dock, else its decision row just above the dock. */
      if (w0) A.showCard($('#as-inline-card'));
      if (w0) A.scrollPanelToWaiting();
    }
    /* Web fonts that finish loading after this reflow the thread (the card grows ~25 px at 390), which would push the decision
       row back under the dock. Land once more when they are ready, unless the reader has already scrolled, typed or tapped. */
    if (again || !d.fonts || d.fonts.status === 'loaded') return;
    var moved = false, evs = ['wheel', 'touchstart', 'pointerdown', 'keydown'], mark = function () { moved = true; };
    evs.forEach(function (ev) { w.addEventListener(ev, mark, { capture: true, passive: true }); });
    d.fonts.ready.then(function () {
      evs.forEach(function (ev) { w.removeEventListener(ev, mark, { capture: true }); });
      if (!moved && A.S.chat === c) w.requestAnimationFrame(function () { land(step, true); });
    });
  }

  /* ---------- routing ---------- */
  function setUrl(params, push) { try { var u = new URL(w.location.href); ['chat', 'step', 'tab', 'scenario'].forEach(function (k) { u.searchParams.delete(k); }); Object.keys(params).forEach(function (k) { if (params[k]) u.searchParams.set(k, params[k]); }); w.history[push ? 'pushState' : 'replaceState']({ chat: params.chat || null }, '', u.toString()); } catch (e) { /* file:// may refuse; the state still works */ } }
  A.openChat = function (id, o) {
    o = o || {}; var c = A.chatById(id);
    if (!c) { A.S.demo = 'not-found'; A.S.chat = { id: null, turns: [], plan: null, changes: [] }; A.renderAll(); return; }
    if (A.streaming()) A.stop();
    A.S.chat = c; A.S.lastDone = null; A.S.tab = o.tab || 'plan';
    if (o.push) setUrl({ chat: id }, true);
    A.renderAll(); A.restoreDraft();
    setTimeout(function () { land(o.step); }, 0);
    if (o.focusTitle) $('#page-title').focus({ preventScroll: true });
    V.commandPalette.addRecent({ title: c.title, meta: 'Assistant chat', icon: 'bot', href: 'assistant.html?chat=' + id });
  };
  A.newChat = function (o) {
    o = o || {}; if (A.streaming()) A.stop();
    if (A.S.demo === 'not-found' || A.S.demo === 'forbidden' || A.S.demo === 'turned-off') A.S.demo = null;
    A.S.chat = { id: null, title: null, turns: [], plan: null, changes: [] }; A.S.lastDone = null; A.S.tab = 'plan';
    if (o.push) setUrl({}, true);
    A.renderAll(); A.restoreDraft();
    if (o.focus === 'composer' || (o.initial && w.matchMedia('(pointer: fine)').matches)) $('#as-input').focus({ preventScroll: true });
  };
  var nChats = 0;
  A.createChat = function (text, title) {
    var c = A.S.chat; nChats += 1; c.id = 'chat_n' + nChats; c.title = title || A.titleFrom(text); c.startedAt = A.nowIso(); c.changes = c.changes || [];
    A.S.chats.push(c); store.remove('vaani:assistant:draft:new'); setUrl({ chat: c.id }, true); A.renderHeader();
  };
  w.addEventListener('popstate', function () { var p = new URLSearchParams(w.location.search), id = p.get('chat'); if (id) A.openChat(id, { step: p.get('step') }); else A.newChat({}); });

  /* ---------- clicks, keys, tabs ---------- */
  function onClick(e) {
    var sug = e.target.closest('.as-sugs [data-insert]'); if (sug) { A.onSug(sug); return; }
    var t = e.target.closest('[data-act]'); if (!t) return; var a = t.getAttribute('data-act');
    if (t.tagName === 'INPUT') return;
    if (t.getAttribute('aria-disabled') === 'true' && a !== 'approve') { e.preventDefault(); A.say(t.getAttribute('data-tooltip') || 'Not available.', false, 'dis'); return; }
    if (H[a]) { e.preventDefault(); H[a](t, e); }
  }
  [$('#main'), $('#as-plan-sheet'), $('#as-history')].forEach(function (r) { r.addEventListener('click', onClick); r.addEventListener('keydown', A.cardKeydown); r.addEventListener('input', A.cardInput); });
  H.copy = function (el) {
    var art = el.closest('article'), txt = $('.as-body', art).innerText.trim(), src = $('.as-sources', art);
    if (src) txt += '\n\n' + $$('a', src).map(function (a) { return '[' + a.textContent + '](' + a.href + ')'; }).join(' · ');
    var ok = function () { el.innerHTML = A.ic('check', 'sm'); A.say('Copied.', false, 'copy'); setTimeout(function () { el.innerHTML = A.ic('copy', 'sm'); }, 1500); };
    try { navigator.clipboard.writeText(txt).then(ok, ok); } catch (x) { ok(); }
  };
  H['copy-code'] = H.copy;
  H['turn-menu'] = function (el) { A.S.menuTurn = el.closest('article').id; V.menu.open(el, 'as-turn-menu'); };
  H.acts = function (el) { var art = el.closest('article'), t = A.S.chat.turns.filter(function (x) { return x.id === art.id; })[0]; t.actOpen = el.getAttribute('aria-expanded') !== 'true'; A.renderTurn(t); $('#' + t.id + ' [data-act="acts"]').focus(); };
  H['new'] = function () { A.newChat({ push: true, focus: 'composer' }); };
  H['copy-request'] = function () { V.toast.info('Request link copied. Admins: Anika R. and Rohit S.'); };
  H['unavail-retry'] = function (el) { el.setAttribute('aria-busy', 'true'); el.textContent = 'Retrying…'; setTimeout(function () { A.S.unavailable = false; A.renderAll(); A.say('The Assistant is back.'); $('#as-input').focus(); }, 900); };
  $('#main').addEventListener('keydown', function (e) {
    var art = e.target.closest && e.target.closest('#as-col article'); if (!art && !(e.target.closest && e.target.closest('#as-col'))) return;
    var arts = $$('#as-col .as-feed > article'), i = arts.indexOf(art);
    if (e.key === 'PageDown' && art) { e.preventDefault(); (arts[i + 1] || art).focus(); }
    if (e.key === 'PageUp' && art) { e.preventDefault(); (arts[i - 1] || art).focus(); }
    if ((e.key === 'End' || e.key === 'Home') && !e.target.closest('input,textarea') && arts.length) { e.preventDefault(); (e.key === 'End' ? arts[arts.length - 1] : arts[0]).focus(); if (e.key === 'End') A.follow(true); }
    var tc = e.target.closest('.as-quote .turn-tc'); if (tc && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tc.click(); }
  });
  $('#main').addEventListener('click', function (e) { var tc = e.target.closest('.as-quote .turn-tc'); if (!tc) return; var id = tc.closest('[data-call]').getAttribute('data-call'); w.location.href = 'call-reports.html?call=' + encodeURIComponent(id) + '&t=' + Math.round(+tc.getAttribute('data-seek') / 1000); });
  ['as-tabs', 'as-stabs'].forEach(function (id) { $('#' + id).addEventListener('vaani:tabchange', function (e) { A.S.tab = e.detail.tab.getAttribute('data-value'); A.renderPlan(); setUrl({ chat: A.S.chat.id, tab: A.S.tab === 'changes' ? 'changes' : null }); var t = $('#' + (id === 'as-tabs' ? 'as-tab-' : 'as-stab-') + A.S.tab); if (t) t.focus(); }); });
  d.addEventListener('vaani:menuselect', function (e) {
    var m = e.target.closest && e.target.closest('#as-more-menu, #as-turn-menu'); if (!m) return; var v = e.detail.value;
    setTimeout(function () {
      if (v === 'rename') A.rename(A.S.chat.id); if (v === 'delete') A.deleteChat(A.S.chat.id); if (v === 'voice') A.openVoice($('#as-more-btn'));
      if (v === 'helpful') V.toast.info('Thanks. Marked as helpful.');
      if (v === 'unhelpful' || v === 'report') { $('#as-fb-t').textContent = v === 'report' ? 'Report a problem' : 'Not helpful'; $('#as-fb-l').firstChild.textContent = v === 'report' ? 'What went wrong? ' : 'What was wrong? '; $('#as-fb-in').value = ''; V.dialog.open('as-fb', { returnTo: $('#' + A.S.menuTurn + ' [data-act="turn-menu"]') }); }
    }, 0);
  });
  $('#as-fb-send').addEventListener('click', function () { V.dialog.close('as-fb', 'save'); V.toast.info('Thanks. Your feedback was sent.'); });
  $('#as-session-in').addEventListener('click', function () { V.dialog.close('as-session', 'save'); V.toast.info('Sign-in is not wired in this prototype. Your message is still in the box.'); });
  $('#as-hist-btn').addEventListener('click', function () { A.openHistory(this); });
  $('#as-hist-ibtn').addEventListener('click', function () { A.openHistory(this); });
  $('#as-hist-new').addEventListener('click', function () { V.popover.close('as-history'); A.newChat({ push: true, focus: 'composer' }); });
  $('#as-new-btn').addEventListener('click', function () { A.newChat({ push: true, focus: 'composer' }); });
  $('#as-new-ibtn').addEventListener('click', function () { A.newChat({ push: true, focus: 'composer' }); });
  $('#as-planbar').addEventListener('click', function () { A.openPlanSheet(this); });
  $('#as-stop-plan').addEventListener('click', function () { A.stopPlan(); });
  function applyPanel() { var hid = A.S.panelHidden, b = $('#as-plan-toggle'); $('#as-work').setAttribute('data-plan', hid ? 'hidden' : 'shown'); b.setAttribute('aria-pressed', hid ? 'false' : 'true'); b.setAttribute('data-tooltip', hid ? 'Show plan' : 'Hide plan'); }
  $('#as-plan-toggle').addEventListener('click', function () { A.S.panelHidden = !A.S.panelHidden; store.set('vaani:assistant:plan', A.S.panelHidden ? 'hidden' : 'shown'); applyPanel(); A.renderPlan(); A.say(A.S.panelHidden ? 'Plan hidden. A waiting step shows in the conversation.' : 'Plan shown.'); });
  $('#as-plan-sheet').addEventListener('vaani:close', function () { A.renderPlan(); });
  V.on('breakpoint', function () { if (V.bp.desktopShell() && A.drawerOpen()) V.drawer.close('as-plan-sheet', 'resize'); A.renderPlan(); onScroll(); });
  w.addEventListener('offline', function () { A.S.offline = true; A.renderAll(); });
  w.addEventListener('online', function () { A.S.offline = false; A.renderAll(); });

  /* F6 cycles: navigation → conversation → plan → composer → Baseline (02 §14.1 extends the shell rule). */
  var cycleRegions = function (e) {
    var regs = [$$('.sb, .rail, .topbar, .bbar').filter(U.visible)[0], $('#as-convo'), U.visible($('#as-plan')) ? $('#as-plan') : null, $('#as-composer').hidden ? $('#as-voicebar') : $('#as-composer'), U.visible($('.bl')) ? $('.bl') : null].filter(Boolean);
    var a = d.activeElement, i = -1; regs.forEach(function (r, k) { if (r.contains(a)) i = k; }); var n = e.shiftKey ? i - 1 : i + 1; if (n < 0) n = regs.length - 1; if (n >= regs.length) n = 0;
    var r = regs[n], t = r.id === 'as-convo' ? ($$('#as-col article').pop() || U.focusables(r)[0]) : r.id === 'as-plan' ? $('#as-plan-title') : r.id === 'as-composer' ? $('#as-input') : ($('[aria-current="page"]', r) || U.focusables(r)[0]);
    if (t) { if (!t.matches('a,button,input,textarea') && !t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus(); }
  };
  V.shortcuts.register('f6', cycleRegions, { description: 'Next region: conversation, plan, composer', inFields: true });
  V.commandPalette.addGroup('chats', 'Assistant chats', 'recent');   /* the spec’s own palette group (02 §12) */
  V.commandPalette.register([
    { group: 'actions', title: 'New Assistant chat', icon: 'square-pen', keywords: ['assistant', 'chat', 'ask'], perform: function () { A.newChat({ push: true, focus: 'composer' }); } },
    { group: 'actions', title: 'Search Assistant chats…', icon: 'history', keywords: ['assistant', 'history', 'chats'], perform: function () { A.openHistory(V.bp.desktopShell() ? $('#as-hist-btn') : $('#as-hist-ibtn')); } }
  ].concat(A.S.chats.slice(0, 6).map(function (c) { return { group: 'chats', title: c.title, meta: 'Assistant chat', icon: 'bot', keywords: ['assistant', 'chat'], perform: function () { A.openChat(c.id, { push: true, focusTitle: true }); } }; })));

  /* ---------- boot ---------- */
  applyPanel();
  var chat = q.get('chat'), sc = q.get('scenario');
  if (A.S.demo === 'loading') { A.S.chat = A.chatById(chat || 'chat_1'); A.S.loading = true; A.renderAll(); }
  else if (A.S.demo === 'not-found' || A.S.demo === 'forbidden' || A.S.demo === 'turned-off') { A.S.chat = { id: null, turns: [], plan: null, changes: [] }; A.renderAll(); $('#page-title').textContent = 'Assistant'; }
  else if (chat) A.openChat(chat, { step: q.get('step'), tab: A.S.tab });
  else A.newChat({ initial: A.S.demo !== 'session' });
  var SCN = { import: ['Add these expo visitors to Leads.', [{ name: 'expo-visitors.csv', size: 38912 }]], 'delete': ['Delete the Not interested leads we haven’t called since June.', []], editdraft: ['Improve the Site-visit qualifier draft: ask about parking and offer a weekday slot.', []], publish: ['Publish the Festive offer callback flow.', []], callbacks: ['Plan calls for the 18 callbacks due today.', []] };
  if (sc && SCN[sc]) setTimeout(function () { A.send(SCN[sc][0], SCN[sc][1]); }, 300);
  if (A.S.demo === 'session') setTimeout(function () { V.dialog.open('as-session', { returnTo: $('#as-input') }); }, 300);
  onScroll();
})(window, document);
