/* Vaani Labs prototype · pages/agents.js — core for agents.html (spec 03-pages/07): view routing (Meetings ·
   Personal agents · Agent settings), URL state, demo-state flags, and the page-owned helpers the view modules share:
   GateCheckRow and summary markup, KeyValueList rows, copy with confirmation, row/card menus built per trigger, the
   inline discard state for gate sheets, ⌘/Ctrl+Enter for the open gate, and the prototype-only states menu. */
(function (w, d, V) {
  'use strict';
  var A = w.VaaniAgents = w.VaaniAgents || {};
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, icon = V.icon;
  A.V = V; A.$ = $; A.$$ = $$; A.esc = esc; A.icon = icon;
  A.fmt = V.fmt;
  A.money = function (v, o) { return V.fmt.money(v, o); };
  A.now = function () { return V.fmt.now().getTime(); };

  /* ---------- URL state (useUrlState): read, write without reload, never names or goal text ---------- */
  var P = new URLSearchParams(w.location.search);
  A.q = function (k) { return P.get(k); };
  A.url = {
    set: function (o, push) {
      Object.keys(o).forEach(function (k) { if (o[k] == null || o[k] === '') P.delete(k); else P.set(k, o[k]); });
      var s = P.toString(); var href = w.location.pathname.split('/').pop() + (s ? '?' + s : '');
      try { w.history[push ? 'pushState' : 'replaceState'](null, '', href); } catch (e) { /* file:// may refuse; the state still lives in memory */ }
    }
  };
  var v = P.get('view');
  A.view = v === 'personal-agents' ? 'personal-agents' : v === 'agent-settings' ? 'agent-settings' : 'meetings';

  /* Demo flags (prototype only): ?state=…, ?role=member|viewer, ?wallet=… (shared) */
  A.state = P.get('state') || '';
  A.role = P.get('role') || 'admin';
  A.is = function (s) { return A.state.split(',').indexOf(s) >= 0; };
  A.offline = A.is('offline');
  A.offlineReason = 'You’re offline';
  var ws = V.walletState(), wst = (V.data.wallet.states || {})[ws] || { balance: V.data.wallet.balance };
  A.wallet = { state: ws, balance: wst.balance, empty: ws === 'empty' || wst.balance === 0, low: ws === 'low' || ws === 'autopay-failed' || (wst.balance > 0 && wst.balance < 100) };
  A.walletLine = function () { return 'Wallet ' + A.money(A.wallet.balance) + (A.wallet.balance > 0 ? ' · ' + V.fmt.runway(A.wallet.balance, 0.04) + ' of calls' : ''); };

  /* ---------- small markup helpers ---------- */
  var KIND = { pass: ['gate-mark--pass', 'check', 'Passed: '], blocking: ['gate-mark--block', 'x', 'Blocking: '], adjusted: ['gate-mark--adjusted', 'minus', 'Adjusted: '],
    advisory: ['gate-mark--advisory', 'info', 'Note: '], warning: ['gate-mark--advisory-warn', 'triangle-alert', 'Warning: '], unknown: ['gate-mark--unknown', 'circle-help', 'Couldn’t check: '], checking: ['gate-mark--checking', null, 'Checking: '] };
  /* GateCheckRow: kind · sentence (HTML allowed, caller escapes) · o.meta · o.act (HTML of one link or button) */
  A.row = function (kind, html, o) {
    o = o || {}; var k = KIND[kind] || KIND.advisory;
    var mark = kind === 'checking' ? '<span class="gate-mark gate-mark--checking" aria-hidden="true">' + icon('loader-circle', 'xs', { className: 'spinner' }) + '</span>'
      : '<span class="gate-mark ' + k[0] + '" data-mark aria-hidden="true">' + icon(k[1]) + '</span>';
    return '<li class="gate-row"' + (o.id ? ' id="' + o.id + '"' : '') + ' data-kind="' + kind + '">' + mark + '<span class="gate-text' + (kind === 'checking' ? ' u-fg-2' : '') + '"><span class="sr-only">' + k[2] + '</span>' + html +
      (o.meta ? '<span class="gate-meta">' + o.meta + '</span>' : '') + '</span>' + (o.act || '') + '</li>';
  };
  A.sortRows = function (rows) { var order = { blocking: 0, unknown: 1, checking: 2, adjusted: 3, warning: 4, advisory: 5, pass: 6 }; return rows.slice().sort(function (a, b) { return order[a.kind] - order[b.kind]; }); };
  /* Summary StatusText for a list of {kind} rows: returns { tone, text, blocked } */
  A.summary = function (rows, noun) {
    var n = function (k) { return rows.filter(function (r) { return r.kind === k; }).length; };
    if (n('checking')) return { tone: 'progress', text: 'Checking…', blocked: true };
    if (n('blocking') || n('unknown')) { var b = n('blocking') + n('unknown'); return { tone: 'danger', text: (noun || 'Blocked') + ' · ' + b + ' thing' + (b > 1 ? 's' : '') + ' to fix', blocked: true }; }
    var know = n('adjusted') + n('warning') + n('advisory');
    return { tone: 'success', text: know ? 'Ready · ' + know + ' thing' + (know > 1 ? 's' : '') + ' to know' : 'Ready', blocked: false };
  };
  A.statusHtml = function (tone, text, o) {
    o = o || {}; var ic = { success: 'check', danger: 'x', warning: 'triangle-alert', progress: null, info: 'info', neutral: 'circle-dot' }[tone];
    var g = tone === 'progress' ? icon('loader-circle', 'sm', { className: 'spinner' }) : ic ? icon(ic, 'sm') : '';
    return '<span class="status status--' + (tone === 'neutral' ? 'plain' : tone) + (o.md ? ' status--md' : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + (o.live ? ' role="status"' : '') + '>' + g + '<span class="status-t">' + text + '</span></span>';
  };
  A.kv = function (rows, cls) {
    return '<dl class="kv' + (cls ? ' ' + cls : '') + '">' + rows.filter(Boolean).map(function (r) { return '<div class="kv-row"><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  };
  A.facts = function (rows) { return '<dl class="ag-facts">' + rows.filter(Boolean).map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>'; };
  A.sk = function (cls) { return '<span class="sk ' + (cls || '') + '"></span>'; };
  A.plural = function (n, one, many) { return V.fmt.count(n) + ' ' + (n === 1 ? one : (many || one + 's')); };
  A.idem = function () { return 'idem-' + Math.random().toString(36).slice(2, 10); };
  A.langList = function (codes) { return codes.map(function (c) { return V.ui.langMark(c, 'full'); }).join(''); };

  /* ---------- copy: clipboard when allowed, a toast either way; the button’s icon swaps to a check for the toast’s life ---------- */
  A.copy = function (text, confirm, btn) {
    try { if (w.navigator.clipboard && w.isSecureContext) w.navigator.clipboard.writeText(text).catch(function () {}); } catch (e) { /* ignore */ }
    V.toast.success(confirm || 'Copied');
    if (btn && btn.querySelector('svg')) {
      var old = btn.innerHTML; btn.innerHTML = icon('check', btn.classList.contains('ibtn--sm') ? 'sm' : null);
      clearTimeout(btn._t); btn._t = setTimeout(function () { btn.innerHTML = old; }, 6000);
    }
  };

  /* ---------- menus built for their trigger: items [{label, icon, act, danger, sep, disabled, reason, desc, sub, href}] ---------- */
  A.menuHtml = function (items) {
    return items.map(function (it) {
      if (it.sep) return '<div class="menu-sep" role="separator"></div>';
      if (it.group) return '<span class="menu-group-label" aria-hidden="true">' + esc(it.group) + '</span>';
      var attrs = ' role="menuitem" type="button" data-act="' + esc(it.act || '') + '"' + (it.value != null ? ' data-value="' + esc(it.value) + '"' : '') +
        (it.disabled ? ' aria-disabled="true" data-reason="' + esc(it.reason || 'Not available') + '"' : '') + (it.sub ? ' data-submenu="' + it.sub + '" aria-haspopup="menu" aria-expanded="false"' : '');
      var body = (it.icon ? icon(it.icon) : '') + '<span class="menu-text"><span>' + esc(it.label) + '</span>' + (it.desc ? '<span class="menu-desc">' + esc(it.desc) + '</span>' : '') + '</span>' + (it.sub ? '<span class="menu-end">' + icon('chevron-right', 'sm') + '</span>' : '') + (it.end ? '<span class="menu-end">' + it.end + '</span>' : '');
      var cls = 'menu-item' + (it.danger ? ' menu-item--danger' : '') + (it.only ? ' ' + it.only : '');
      return it.href ? '<a class="' + cls + '" href="' + esc(it.href) + '"' + attrs.replace(' type="button"', '') + '>' + body + '</a>' : '<button class="' + cls + '"' + attrs + '>' + body + '</button>';
    }).join('');
  };
  var menuHandlers = {};
  A.openMenu = function (trigger, id, items, onSelect, label) {
    var m = $('#' + id); m.innerHTML = A.menuHtml(items); if (label) m.setAttribute('aria-label', label);
    menuHandlers[id] = onSelect; trigger.setAttribute('aria-controls', id); V.menu.open(trigger, id);
  };
  d.addEventListener('vaani:menuselect', function (e) {
    var m = e.target.closest && e.target.closest('.menu'); if (!m || !menuHandlers[m.id]) return;
    var it = e.detail.item; if (it.getAttribute('data-submenu')) return;
    var fn = menuHandlers[m.id]; setTimeout(function () { fn(it.getAttribute('data-act'), it.getAttribute('data-value'), it); }, 0);
  });

  /* ---------- gate sheets: open modal, focus the first field, guard a dirty close with the inline discard state (O §2.5) ---------- */
  A.openGateSheet = function (el, o) {
    o = o || {};
    /* the shared drawer guards a dirty close with the inline discard state in .sheet-foot (o.dirty, o.discard) */
    return V.drawer.open(el, { mode: 'modal', returnTo: o.returnTo, onClose: o.onClose, dirty: o.dirty, discard: o.discard });
  };
  /* ⌘/Ctrl+Enter: the open gate’s primary (or the focused ApprovalCard’s); announces the why-text when it is aria-disabled */
  A.primaryIn = function (root) { return root && $('[data-primary]', root); };
  function confirmChord() {
    var top = V.overlays.top(), root = top && (top.kind === 'sheet' || top.kind === 'popover' || top.kind === 'dialog') ? top.el : null;
    if (!root) { var a = d.activeElement; root = a && a.closest && a.closest('[data-approval], .ag-limits-form'); }
    var p = A.primaryIn(root); if (!p || !U.visible(p)) return false;
    if (p.getAttribute('aria-disabled') === 'true') { var why = p.getAttribute('aria-describedby') && d.getElementById(p.getAttribute('aria-describedby').split(' ')[0]); V.announce(why ? why.textContent : 'Not available yet'); return; }
    p.click();
  }
  V.shortcuts.register('mod+enter', confirmChord, { description: 'Confirm the open gate or approval', group: 'Forms', inFields: true });

  /* aria-disabled actions: announce the reason and do nothing (C §1.6) */
  A.blocked = function (btn) { if (btn && btn.getAttribute('aria-disabled') === 'true') { V.announce(btn.getAttribute('data-tooltip') || btn.getAttribute('data-reason') || 'Not available'); return true; } return false; };
  A.disable = function (btn, reason) { if (!btn) return; btn.setAttribute('aria-disabled', 'true'); if (reason) btn.setAttribute('data-tooltip', reason); };

  /* ---------- MetaLine: "a · b · c" as items (HTML, caller escapes). The dots are drawn by .ag-mline (agents.css) as
     ::before in the gap, so a wrapped line never starts with a separator; empty items are dropped. ---------- */
  A.mline = function (items) { return (items || []).filter(Boolean).map(function (h) { return '<span class="ag-mi">' + h + '</span>'; }).join(''); };

  /* ---------- page header per view (≤ 3 actions, one primary, last) ---------- */
  A.header = function (o) {
    var h1 = $('#page-title'); if (h1) h1.textContent = o.title;
    var meta = $('#ag-meta'); meta.innerHTML = o.meta || '';
    var desc = $('#ag-desc'); desc.hidden = !o.desc; desc.innerHTML = o.desc || ''; $('#ag-desc-break').hidden = !o.desc;
    $('#ag-ph').classList.toggle('ag-ph--desc', !!o.desc);
    var cr = $('#ag-crumbs'); cr.hidden = !o.crumbs; if (o.crumbs) cr.innerHTML = o.crumbs;
    $('#ag-actions').innerHTML = o.actions || ''; V.initAll($('#ag-actions'));
    V.shell.syncTitle && V.shell.syncTitle();
  };

  /* ---------- skeleton delay: data regions skeletonise after 200 ms (O §13) ---------- */
  A.later = function (fn, ms) { return setTimeout(fn, ms == null ? 200 : ms); };

  /* ---------- prototype-only states menu (clearly marked; not product UI) ---------- */
  var MT = [
    ['Meetings · default', 'view=meetings'], ['First use (no meetings yet)', 'view=meetings&state=first-use'], ['Nothing open', 'view=meetings&state=none-open'],
    ['Loading (skeletons)', 'view=meetings&state=loading'], ['Error on first load', 'view=meetings&state=error'], ['Partial: seats and usage fail', 'view=meetings&state=partial'],
    ['Error on refresh (data kept)', 'view=meetings&state=error-refresh'], ['Offline', 'view=meetings&state=offline'], ['Member: can’t start meetings', 'view=meetings&role=member'],
    ['Wallet ₹0', 'view=meetings&wallet=empty'], ['Free minutes used up', 'view=meetings&state=minutes-used'], ['All agent seats in use', 'view=meetings&state=seats-full'],
    ['Stale room (nobody for 45 min)', 'view=meetings&state=stale'], ['Agent couldn’t join', 'view=meetings&state=agent-failed'], ['Filtered to nothing', 'view=meetings&q=roadmap'],
    ['Start a meeting', 'view=meetings&start=1'], ['Start: run a flow', 'view=meetings&start=1&mode=flow'], ['Start: wallet ₹0', 'view=meetings&start=1&wallet=empty'], ['Start: create fails', 'view=meetings&start=1&state=create-fail'],
    ['Room sheet', 'view=meetings&room=room_qdr'], ['Past meeting: summary', 'view=meetings&meeting=mtg_11'], ['Past meeting: writing notes', 'view=meetings&meeting=mtg_12'],
    ['Past meeting: notes off', 'view=meetings&meeting=mtg_10'], ['Past meeting: couldn’t write notes', 'view=meetings&meeting=mtg_07'], ['Past meeting: not found', 'view=meetings&meeting=mtg_99'],
    ['Generate a deck', 'view=meetings&generate=1'], ['Generate a deck: fails', 'view=meetings&generate=1&state=deck-fail']
  ];
  var PA = [
    ['Personal agents · default', 'view=personal-agents'], ['First use · member, no number', 'view=personal-agents&state=first-use&role=member'], ['No number (admin)', 'view=personal-agents&state=no-number'],
    ['Loading (skeletons)', 'view=personal-agents&state=loading'], ['Partial: readiness and approvals fail', 'view=personal-agents&state=partial'], ['Error on first load', 'view=personal-agents&state=error'],
    ['Error on refresh (rows kept)', 'view=personal-agents&state=error-refresh'], ['Offline', 'view=personal-agents&state=offline'], ['Wallet low', 'view=personal-agents&wallet=low'], ['Wallet ₹0', 'view=personal-agents&wallet=empty'],
    ['Every task state', 'view=personal-agents&state=all-states'], ['Every decision kind (message, call, 2FA)', 'view=personal-agents&state=approvals'], ['Nothing waiting', 'view=personal-agents&state=no-waiting'],
    ['All done (no active tasks)', 'view=personal-agents&state=all-done'], ['Filtered to nothing', 'view=personal-agents&list=all&q=invoice'], ['Forbidden for the role', 'view=personal-agents&role=viewer'],
    ['New task', 'view=personal-agents&new=1'], ['New task from a template', 'view=personal-agents&new=1&template=followups'], ['New task from a meeting item', 'view=personal-agents&new=1&from=meeting:mtg_11:item:1'],
    ['New task: start fails', 'view=personal-agents&new=1&state=start-fail'], ['Task sheet: waiting for you', 'view=personal-agents&task=task_31'], ['Task sheet: done', 'view=personal-agents&task=task_28'],
    ['Task sheet: record gone', 'view=personal-agents&task=task_99'], ['Agent settings', 'view=agent-settings'], ['Agent settings: no number', 'view=agent-settings&state=no-number']
  ];
  A.renderProto = function () {
    var m = $('#ag-proto-menu'), cur = w.location.search.replace(/^\?/, ''), list = A.view === 'meetings' ? MT.concat([['Go to Personal agents states', 'view=personal-agents']]) : PA.concat([['Go to Meetings states', 'view=meetings']]);
    m.innerHTML = '<div class="menu-head"><b>Prototype states</b><span>Not product UI. Reloads the page in a demo state.</span></div>' + list.map(function (s) {
      return '<a class="menu-item" role="menuitemradio" aria-checked="' + (cur === s[1] ? 'true' : 'false') + '" href="agents.html?' + s[1] + '"><span class="menu-check">' + icon('check') + '</span><span class="menu-text"><span>' + esc(s[0]) + '</span></span></a>';
    }).join('');
  };
  A.offlineBar = function (what) { var main = $('#main'); if (!main || $('.cbar', main)) return; main.insertAdjacentHTML('afterbegin', '<div class="cbar" role="status">' + icon('cloud-off') + '<span><b>You’re offline.</b> Showing ' + esc(what) + ' from 11:24&nbsp;am. Copying links still works.</span></div>'); };
})(window, document, window.Vaani);
