/* Vaani Labs prototype · pages/assistant-history.js — History (02 §12): a popover at ≥ 768 (a bottom sheet on phones) with
   search over titles and messages, day groups, a waiting tag instead of the meta, the current chat marked, Rename… and
   Delete chat… (tier 1: Undo toast), "Show older chats", loading / empty / no-results / error states, and the one-time
   "Save to account" for a chat saved only in this browser (§12.6). Keyboard: ↓ from search into the list, ↑/↓ move, Enter opens. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA, H = A.ACT = A.ACT || {};
  var H0 = { q: '', older: false, loading: false, timer: null };

  A.chatMeta = function (c) {
    if (c.id === (A.S.chat && A.S.chat.id)) c = A.S.chat;
    var waiting = c.plan && A.planState(c.plan) === 'waiting' || c.plan && A.planState(c.plan) === 'blocked';
    return { waiting: waiting, text: F.time(c.startedAt) + ' · ' + A.plural((c.changes || []).filter(function (x) { return !x.undone; }).length, 'change') };
  };
  function group(iso) {
    var s = F.when(iso); if (/^Today/.test(s)) return 'Today'; if (/^Yesterday/.test(s)) return 'Yesterday'; if (/days ago$/.test(s)) return 'This week'; return F.date(iso);
  }
  function visibleChats() {
    var list = A.S.chats.slice().sort(function (a, b) { return b.startedAt < a.startedAt ? -1 : 1; });
    return H0.older || H0.q ? list : list.slice(0, Math.max(0, list.length - AD.olderCount));
  }
  function matches(c, q) { if (!q) return true; q = q.toLowerCase(); return c.title.toLowerCase().indexOf(q) >= 0 || (c.turns || []).some(function (t) { return (t.text || '').toLowerCase().indexOf(q) >= 0 || (t.blocks || []).some(function (b) { return String(b.html || '').toLowerCase().indexOf(q) >= 0; }); }); }

  function rowHtml(c, compact) {
    var m = A.chatMeta(c), cur = A.S.chat && A.S.chat.id === c.id;
    var end = m.waiting ? V.ui.statusTag('plan', 'waiting') : '<span class="as-hlink-m">' + esc(compact ? F.when(c.startedAt).replace(/^Today /, '') : m.text) + '</span>';
    return '<li class="as-hrow"><a class="as-hlink" href="assistant.html?chat=' + esc(c.id) + '" data-chat="' + esc(c.id) + '"' + (cur ? ' aria-current="page"' : '') + ' data-tooltip-overflow data-tooltip="' + esc(c.title) + '"><span class="as-hlink-t" translate="no">' + esc(c.title) + '</span>' + end + '</a>' +
      (compact ? '' : '<button type="button" class="ibtn ibtn--sm as-hrow-more" aria-label="More actions for ' + esc(c.title) + '" aria-haspopup="menu" aria-controls="as-row-menu" aria-expanded="false" data-row-menu="' + esc(c.id) + '">' + A.ic('ellipsis', 'sm') + '</button>') + '</li>';
  }
  A.recentHtml = function () {
    if (A.S.demo === 'history-empty') return '';
    var list = A.S.chats.slice().sort(function (a, b) { return b.startedAt < a.startedAt ? -1 : 1; }).slice(0, 3); if (!list.length) return '';
    return '<div class="as-recent"><div class="as-recent-top"><h3 class="as-recent-h" id="as-recent-h">Recent chats</h3><button type="button" class="btn btn--link as-recent-all" data-act="history">All chats</button></div><ul class="as-hlist">' + list.map(function (c) { return rowHtml(c, true); }).join('') + '</ul></div>';
  };
  A.migrationHtml = function () {
    if (A.S.demo !== 'local-chat' || A.S.migrated) return '';
    return '<div class="notice notice--info notice--multi as-migrate">' + A.ic('info') + '<div class="notice-body"><span class="notice-title">1 chat is saved only in this browser.</span> Save it to your account to see it on other devices.</div><div class="notice-acts"><button type="button" class="notice-act" data-act="migrate-save">Save to account</button><button type="button" class="notice-act" data-act="migrate-discard">Discard…</button></div></div>';
  };

  function renderList() {
    var box = $('#as-hist-list'), q = H0.q.trim();
    $('#as-hist-notice').innerHTML = A.migrationHtml();
    if (H0.loading) { box.innerHTML = '<ul class="as-hlist" aria-busy="true" aria-label="Loading chats">' + [1, 2, 3, 4, 5, 6].map(function () { return '<li class="as-hrow as-hrow--sk"><span class="sk as-w-60"></span><span class="sk sk--meta as-w-20"></span></li>'; }).join('') + '</ul>'; return; }
    if (A.S.demo === 'history-error' && !H0.retried) { box.innerHTML = '<div class="ierr as-hist-err" role="alert"><div class="ierr-line">' + A.ic('circle-alert') + '<span>Couldn’t load your chats. <button type="button" class="btn btn--link" data-act="hist-retry">Retry</button></span></div></div>'; return; }
    var all = A.S.demo === 'history-empty' ? [] : visibleChats().filter(function (c) { return matches(c, q); });
    if (!A.S.chats.length || A.S.demo === 'history-empty') { box.innerHTML = '<p class="as-hist-empty">Your chats appear here. Each one keeps its plan and what it changed.</p>'; return; }
    if (!all.length) { box.innerHTML = '<div class="as-hist-empty"><p>No chats match ‘' + esc(q) + '’.</p><button type="button" class="btn btn--sm" data-act="hist-clear">Clear search</button></div>'; return; }
    var groups = [], by = {};
    all.forEach(function (c) { var g = group(c.startedAt); if (!by[g]) { by[g] = []; groups.push(g); } by[g].push(c); });
    box.innerHTML = groups.map(function (g, i) { return '<h3 class="as-hist-g" id="as-hg-' + i + '">' + esc(g) + '</h3><ul class="as-hlist" aria-labelledby="as-hg-' + i + '">' + by[g].map(function (c) { return rowHtml(c); }).join('') + '</ul>'; }).join('') +
      (!H0.older && !q && A.S.chats.length > visibleChats().length ? '<button type="button" class="btn btn--sm btn--tertiary as-hist-older" data-act="hist-older">Show older chats</button>' : '');
   
  }
  A.renderHistory = renderList;

  A.openHistory = function (trigger) {
    H0.q = ''; $('#as-hist-q').value = ''; H0.retried = false; H0.loading = false;
    renderList();
    V.popover.open(trigger, 'as-history', { placement: 'bottom-end' });
    /* a server fetch: skeleton rows only if it takes longer than 200 ms (it takes 450 here) */
    var done = false; setTimeout(function () { if (!done) { H0.loading = true; renderList(); } }, 200);
    setTimeout(function () { done = true; H0.loading = false; renderList(); }, 650);
  };

  /* ---------- search, keyboard, clicks ---------- */
  var st = null, at = 0;
  $('#as-hist-q').addEventListener('input', function (e) {
    clearTimeout(st); st = setTimeout(function () {
      H0.q = e.target.value; renderList();
      var n = $$('#as-hist-list .as-hlink').length, now = Date.now();
      if (H0.q.trim() && now - at > 2000) { at = now; $('#as-hist-count').textContent = n ? A.plural(n, 'chat') + ' match' : 'No chats match'; }
    }, 300);
  });
  $('#as-history').addEventListener('keydown', function (e) {
    var links = $$('#as-hist-list .as-hlink'), i = links.indexOf(d.activeElement);
    if (e.key === 'ArrowDown' && (e.target.id === 'as-hist-q' || i >= 0)) { e.preventDefault(); (links[i + 1] || links[0] || e.target).focus(); }
    if (e.key === 'ArrowUp' && i >= 0) { e.preventDefault(); (i === 0 ? $('#as-hist-q') : links[i - 1]).focus(); }
    if ((e.key === 'Home' || e.key === 'End') && i >= 0) { e.preventDefault(); links[e.key === 'Home' ? 0 : links.length - 1].focus(); }
  });
  function onListClick(e) {
    var a = e.target.closest('.as-hlink'), more = e.target.closest('[data-row-menu]'), act = e.target.closest('[data-act]');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); V.popover.close('as-history'); A.openChat(a.getAttribute('data-chat'), { push: true, focusTitle: true }); return; }
    if (more) { A.S.menuChat = more.getAttribute('data-row-menu'); V.menu.open(more, 'as-row-menu'); return; }
    if (act) { var n = act.getAttribute('data-act');
      if (n === 'hist-older') { H0.older = true; renderList(); var ls = $$('#as-hist-list .as-hlink'); var f = ls[ls.length - AD.olderCount]; if (f) f.focus(); }
      if (n === 'hist-clear') { H0.q = ''; $('#as-hist-q').value = ''; renderList(); $('#as-hist-q').focus(); }
      if (n === 'hist-retry') { H0.retried = true; H0.loading = true; renderList(); setTimeout(function () { H0.loading = false; renderList(); var l = $('#as-hist-list .as-hlink'); if (l) l.focus(); }, 500); }
    }
  }
  $('#as-history').addEventListener('click', onListClick);
  H['migrate-save'] = function () {
    A.S.migrated = true; var c = { id: 'chat_local', title: AD.localChat.title, startedAt: DATA._util.ist(9, '16:05'), changes: [], plan: null, turns: [{ id: 'lc1', role: 'user', at: DATA._util.ist(9, '16:05'), text: AD.localChat.title, state: 'sent' }, { id: 'lc2', role: 'assistant', at: DATA._util.ist(9, '16:05'), state: 'complete', activity: [], blocks: [{ t: 'text', html: '<p>12 plot enquiries from Nashik are waiting for a first call. Most came from the property portal.</p>' }], sources: [{ label: '12 leads', href: 'leads.html?q=Nashik' }] }] };
    A.S.chats.push(c); A.renderAll(); renderList(); A.say('Saved to your account. The chat is in History.');
    var t = $('#as-hist-q'); if (t && U.visible(t)) t.focus();
  };
  H['migrate-discard'] = function (el) {
    V.dialog.confirm({ title: 'Discard the chat saved in this browser?', body: 'It can’t be recovered.', confirmLabel: 'Discard chat', tone: 'danger', returnTo: el }).then(function (ok) { if (ok) { A.S.migrated = true; A.renderAll(); renderList(); A.say('The chat saved in this browser was discarded.'); } });
  };
  H.history = function (el) { A.openHistory(el); };

  /* ---------- Rename and Delete (row menu and the header ⋯) ---------- */
  d.addEventListener('vaani:menuselect', function (e) {
    var menu = e.target.closest && e.target.closest('#as-row-menu'); if (!menu) return;
    var id = A.S.menuChat, v = e.detail.value;
    setTimeout(function () { if (v === 'rename') A.rename(id); if (v === 'delete') A.deleteChat(id); }, 0);
  });
  A.chatById = function (id) { return A.S.chats.filter(function (c) { return c.id === id; })[0]; };
  A.rename = function (id, returnTo) {
    var c = A.chatById(id) || A.S.chat; if (!c) return; A.S.renameId = c.id;
    $('#as-rename-in').value = c.title; $('#as-rename-err').hidden = true; $('#as-rename-in').removeAttribute('aria-invalid');
    V.dialog.open('as-rename', { returnTo: returnTo || $('#as-more-btn') });
  };
  $('#as-rename-save').addEventListener('click', function () {
    var v = $('#as-rename-in').value.trim(), c = A.chatById(A.S.renameId);
    if (!v) { $('#as-rename-err').hidden = false; $('#as-rename-err').innerHTML = A.ic('circle-alert') + 'Enter a chat name.'; $('#as-rename-in').setAttribute('aria-invalid', 'true'); $('#as-rename-in').focus(); return; }
    c.title = v.slice(0, 60); V.dialog.close('as-rename', 'save'); A.renderHeader(); renderList(); A.say('Chat renamed to ' + c.title + '.');
  });
  $('#as-rename-in').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#as-rename-save').click(); } });
  A.deleteChat = function (id) {
    var c = A.chatById(id); if (!c) return; var i = A.S.chats.indexOf(c), wasCurrent = A.S.chat && A.S.chat.id === id;
    A.S.chats.splice(i, 1);
    if (wasCurrent) { V.overlays.closeAll(); A.newChat({ push: true, focus: 'composer' }); } else renderList();
    A.renderAll();
    V.toast.undo('Deleted ‘' + c.title + '’ · Undo', { action: { label: 'Undo', onClick: function () { A.S.chats.splice(i, 0, c); A.renderAll(); renderList(); A.say('Chat restored.'); } } });
  };
})(window, document);
