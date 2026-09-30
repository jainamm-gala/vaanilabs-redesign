/* Vaani Labs prototype · pages/knowledge.js — Knowledge page core (03-pages/05 §1).
   State, URL state (§0.3), status sentences (§1.6), header meta, the section Notice, the Test panel’s three homes
   (docked ≥1440 · overlay 1024–1439 · "Test" pane below 1024), view routing (Sources · Proposals) and the prototype-only
   states menu. Modules: knowledge-table.js (toolbar, table, rows, menus, source sheet), knowledge-test.js (Test a question),
   knowledge-add.js (Add knowledge, drop target), knowledge-proposals.js (Proposals, Forbidden). Boot runs on DOMContentLoaded,
   after every deferred module has registered itself on window.VaaniKnowledge. */
(function (w, d) {
  'use strict';
  var K = w.VaaniKnowledge = w.VaaniKnowledge || {};
  var V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$, store = U.store;
  var P = new URLSearchParams(w.location.search);

  /* ---------- page state ---------- */
  K.role = P.get('role') === 'member' || P.get('role') === 'viewer' ? P.get('role') : 'admin';
  K.state = P.get('state') || '';
  K.offline = K.state === 'offline';
  K.sources = K.state === 'first-use' ? [] : K.data.sources.map(function (s) { var c = {}; for (var k in s) c[k] = s[k]; c.direct = (s.direct || []).slice(); return c; });
  K.byId = function (id) { for (var i = 0; i < K.sources.length; i++) if (K.sources[i].id === id) return K.sources[i]; return null; };
  K.canAdd = function () { return K.role !== 'viewer'; };
  K.canDeleteUsed = function () { return K.role === 'admin'; };
  K.isAdmin = function () { return K.role === 'admin'; };

  /* ---------- URL state: every view parameter is restorable by reload, Back and a pasted link ---------- */
  K.url = {
    get: function (k) { return new URLSearchParams(w.location.search).get(k); },
    list: function (k) { var v = K.url.get(k); return v ? v.split(',').filter(Boolean) : []; },
    set: function (obj, push) {
      var p = new URLSearchParams(w.location.search);
      Object.keys(obj).forEach(function (k) { var v = obj[k]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) p.delete(k); else p.set(k, Array.isArray(v) ? v.join(',') : v); });
      var s = p.toString().replace(/%2C/g, ','), href = w.location.pathname + (s ? '?' + s : '') + w.location.hash;
      if (href === w.location.pathname + w.location.search + w.location.hash) return;
      try { if (push) w.history.pushState(null, '', href); else w.history.replaceState(null, '', href); } catch (e) { /* file:// may refuse; the view still works */ }
    }
  };

  /* ---------- DataTable keyboard model (N §7.9): one tab stop for the body; only the active row’s controls are tabbable ---------- */
  K.rove = function (table) {
    if (!table) return;
    var sync = function () { $$('tbody tr', table).forEach(function (tr) { var on = tr.getAttribute('tabindex') === '0'; $$('a[href], button, input', tr).forEach(function (c) { c.tabIndex = on ? 0 : -1; }); }); };
    sync();
    if (!table._rove) { table._rove = true; table.addEventListener('focusin', function () { setTimeout(sync, 0); }); table.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !V.overlays.top() && $$('tbody [data-select-row]:checked', table).length) { e.preventDefault(); $$('tbody [data-select-row]', table).forEach(function (c) { c.checked = false; }); V.table.syncSelection(table); V.announce('Selection cleared'); } }); }
  };

  /* ---------- kinds, sizes, status sentences (lib/knowledge.ts + domain `knowledge` in lib/status.ts) ---------- */
  var KIND = { file: ['file-text', null], table: ['sheet', 'Table'], web: ['globe', 'Web page'], text: ['text', 'Text'], answers: ['message-square', 'Answers from calls'] };
  K.kindIcon = function (s) { return (KIND[s.kind] || KIND.file)[0]; };
  K.kindWord = function (s) { return s.kind === 'file' ? s.format : (KIND[s.kind] || KIND.file)[1]; };
  K.typeSize = function (s) {
    if (s.kind === 'table') return 'Table · ' + V.fmt.count(s.rows || 0) + ' rows';
    if (s.kind === 'web') return 'Web page · ' + (s.fetchedAt ? 'fetched ' + V.fmt.dateShort(s.fetchedAt) : 'not fetched yet');
    if (s.kind === 'text' || s.kind === 'answers') return 'Text · ' + V.fmt.count(s.chars || 0) + ' characters';
    return s.format + ' · ' + V.fmt.bytes(s.size || 0);
  };
  K.reason = function (s) { return K.data.reasons[s.reason] || K.data.reasons.internal; };
  K.isFailed = function (s) { return s.status === 'failed' || s.status === 'upload_failed'; };
  K.inProgress = function (s) { return s.status === 'indexing' || s.status === 'reading' || s.status === 'uploading'; };
  /* { tone, icon, text, tag } — the sentence carries the state, never the colour alone */
  K.sentence = function (s) {
    var unit = s.kind === 'table' ? (s.passages === 1 ? ' row' : ' rows') : (s.passages === 1 ? ' passage' : ' passages');
    switch (s.status) {
      case 'indexed': return { tone: 'success', icon: 'check', text: 'Indexed · ' + V.fmt.count(s.passages || 0) + unit };
      case 'indexing': return { tone: 'progress', icon: 'spinner', text: 'Indexing… ' + (s.progress || 0) + '%' };
      case 'reading': return { tone: 'progress', icon: 'spinner', text: 'Reading…' };
      case 'uploading': return { tone: 'progress', icon: 'spinner', text: 'Uploading… ' + (s.progress || 0) + '%', bar: true };
      case 'queued': return { tone: 'neutral', icon: 'clock', text: 'Queued' };
      case 'upload_failed': return { tone: 'danger', icon: 'circle-x', text: "Couldn’t upload · " + K.reason(s).short };
      default: return { tone: 'danger', icon: 'circle-x', text: "Couldn’t index · " + K.reason(s).short };
    }
  };
  function glyph(name, size) { return name === 'spinner' ? V.icon('loader-circle', size, { className: 'spinner' }) : V.icon(name, size); }
  /* StatusText md in the Status cell; the failure’s full sentence and fix are in a visually hidden span and the tooltip */
  K.statusText = function (s, o) {
    o = o || {}; var st = K.sentence(s), size = o.small ? 'sm' : 'md';
    var cls = 'status' + (o.small ? '' : ' status--md') + (st.tone === 'neutral' ? '' : ' status--' + st.tone);
    var fix = K.isFailed(s) ? K.reason(s).sentence + ' ' + K.fixSentence(s) : '';
    var html = '<span class="' + cls + '"' + (fix && !o.noTip ? ' data-tooltip="' + esc(fix) + '"' : '') + '>' + glyph(st.icon, size) + '<span>' + esc(st.text) + '</span>' + (fix ? '<span class="sr-only">. ' + esc(fix) + '</span>' : '') + '</span>';
    if (st.bar) html += '<span class="pbar pbar--thin kn-row-bar" aria-hidden="true"><span class="pbar-track"><span class="pbar-fill" style="--p: ' + ((s.progress || 0) / 100) + '"></span></span></span>';
    return html;
  };
  K.statusTag = function (s, o) { return V.ui.statusTag('knowledge', s.status, { n: s.progress || 0, size: o && o.size }); };
  K.fixes = function (s) {
    var r = K.reason(s), out = [];
    (r.fixes || []).forEach(function (f) {
      if (f === 'replace') out.push({ act: 'replace', label: 'Replace file…', icon: 'upload' });
      if (f === 'paste') out.push({ act: 'paste', label: 'Paste the text instead…', icon: 'sticky-note' });
      if (f === 'address') out.push({ act: 'address', label: 'Edit address…', icon: 'pencil' });
      if (f === 'retry') out.push({ act: 'retry', label: 'Retry', icon: 'rotate-cw' });
      if (f === 'delete') out.push({ act: 'delete', label: 'Delete source…', icon: 'trash-2', danger: true });
    });
    if (s.status === 'upload_failed' && !out.length) out.push({ act: 'retry', label: 'Retry', icon: 'rotate-cw' });
    return out;
  };
  K.fixSentence = function (s) { var f = K.fixes(s)[0]; return f ? 'Fix: ' + f.label.replace('…', '') + '.' : ''; };

  /* Used by: flows that reach the source directly, plus flows whose lookup targets all sources (indexed sources only) */
  K.usedBy = function (s) { var all = s.status === 'indexed' ? K.data.allSources : []; return { direct: s.direct || [], all: all, count: (s.direct || []).length + all.length }; };
  K.flowState = function (f) { return f.state === 'live' ? 'Live v' + f.version : 'Not published'; };
  K.usedLabel = function (s) { var n = K.usedBy(s).count; return n ? n + (n === 1 ? ' flow' : ' flows') : 'Not used'; };
  K.usedTip = function (s) {
    var u = K.usedBy(s), parts = [];
    if (u.direct.length) parts.push('Looks it up directly: ' + u.direct.map(function (f) { return f.name + ' (' + K.flowState(f) + ')'; }).join(', ') + '.');
    if (u.all.length) parts.push('Look up all sources: ' + u.all.map(function (f) { return f.name + ' (' + K.flowState(f) + ')'; }).join(', ') + '.');
    return parts.join(' ');
  };

  /* One counting rule for "not searchable yet" (header meta, Test caveat): the same two groups as the Status filter and
     the row sentences: in progress (uploading, reading, indexing) and queued. Failed sources are counted by the Notice. */
  K.pendingCounts = function (list) {
    var c = { indexing: 0, queued: 0 };
    (list || K.sources).forEach(function (s) { if (K.inProgress(s)) c.indexing += 1; else if (s.status === 'queued') c.queued += 1; });
    c.total = c.indexing + c.queued; return c;
  };

  /* ---------- header meta: "14 sources · 418 passages · 1 indexing · 1 queued" (never "0" while loading) ---------- */
  K.renderMeta = function () {
    var el = $('#kn-meta'); if (!el) return;
    if (K.view === 'proposals') { var n = K.props ? K.props.pendingCount() : 0; el.textContent = n + ' pending · from calls in the last 30 days'; return; }
    if (K.state === 'loading') { el.innerHTML = '<span class="sk sk--meta kn-sk-meta" aria-hidden="true"></span><span class="sr-only">Loading sources</span>'; return; }
    if (K.state === 'error') { el.textContent = ''; return; }
    if (!K.sources.length) { el.textContent = 'No sources yet'; return; }
    var passages = 0, pc = K.pendingCounts(); K.sources.forEach(function (s) { if (s.status === 'indexed') passages += s.passages || 0; });
    el.innerHTML = '<span class="kn-meta-part">' + esc(V.fmt.count(K.sources.length) + (K.sources.length === 1 ? ' source' : ' sources')) + '</span><span class="kn-meta-passages"> · ' + esc(V.fmt.count(passages)) + ' passages</span>' +
      (pc.indexing ? ' <span class="kn-meta-part">· ' + pc.indexing + ' indexing</span>' : '') + (pc.queued ? ' <span class="kn-meta-part">· ' + pc.queued + ' queued</span>' : '');
  };

  /* ---------- the one page Notice (a real, fixable condition; not dismissible) ---------- */
  K.renderNotice = function () {
    var box = $('#kn-notice'); if (!box) return;
    var html = '';
    if (K.state === 'error-refresh') {
      html = '<div class="notice notice--warning" role="status">' + V.icon('triangle-alert') + '<span class="notice-body">Showing sources from 11:24&nbsp;am. Couldn’t refresh.</span><span class="notice-acts"><button type="button" class="notice-act" data-kn-retry>Retry</button></span></div>';
    } else if (K.state !== 'loading' && K.state !== 'error') {
      var failed = K.sources.filter(K.isFailed);
      if (failed.length) {
        var one = failed.length === 1;
        html = '<div class="notice notice--warning" role="status">' + V.icon('triangle-alert') + '<span class="notice-body"><span class="notice-title">' + (one ? '1 source couldn’t be indexed.' : failed.length + ' sources couldn’t be indexed.') + '</span> Callers get no answers from ' + (one ? 'it' : 'them') + '.</span><span class="notice-acts"><button type="button" class="notice-act" data-kn-show-failed>' + (one ? 'Show it' : 'Show them') + '</button></span></div>';
      }
    }
    box.innerHTML = html; box.hidden = !html;
  };

  /* ---------- Test panel homes (§1.9, §1.16) ---------- */
  var dockPref = function () { return store.get('vaani:knowledge:dock') !== 'closed'; };
  K.dock = {
    mode: function () { if (!V.bp.desktopShell()) return 'pane'; return w.innerWidth >= 1440 ? 'dock' : 'overlay'; },
    overlayOpen: function () { return V.drawer.isOpen('kn-test'); },
    sourceDocked: function () { var s = $('#kn-source'); return s && s.classList.contains('is-docked') && !s.hidden; },
    apply: function () {
      var t = $('#kn-test'), btn = $('#kn-test-open'), mode = K.dock.mode(), list = $('#kn-list'), pane = K.url.get('pane') === 'test' ? 'test' : 'sources';
      if (!t) return;
      t.classList.toggle('kn-test--pane', mode === 'pane');
      if (mode === 'dock') {
        var show = dockPref() && !K.dock.sourceDocked() && K.view === 'sources';
        t.hidden = !show; t.classList.toggle('is-docked', show);
        if (btn) btn.hidden = show;
        if (list) list.hidden = false;
      } else if (mode === 'overlay') {
        if (!K.dock.overlayOpen()) { t.hidden = true; t.classList.remove('is-docked'); }
        if (btn) btn.hidden = false; if (list) list.hidden = false;
      } else {
        var testPane = pane === 'test' && K.view === 'sources';
        t.hidden = !testPane; t.classList.toggle('is-docked', testPane);
        if (list) list.hidden = testPane;
        var seg = $('#kn-pane'); if (seg) $$('[role="radio"]', seg).forEach(function (r) { var on = r.getAttribute('data-value') === pane; r.setAttribute('aria-checked', on ? 'true' : 'false'); r.setAttribute('tabindex', on ? '0' : '-1'); });
      }
    },
    /* open from the header button, "Test with this source", Try it, and the palette */
    open: function (focusQuestion) {
      var mode = K.dock.mode(), t = $('#kn-test');
      if (mode === 'dock') { store.remove('vaani:knowledge:dock'); if (K.dock.sourceDocked()) V.drawer.close('kn-source', 'swap'); K.dock.apply(); }
      else if (mode === 'overlay') { if (V.drawer.isOpen('kn-source')) V.drawer.close('kn-source', 'swap'); if (!K.dock.overlayOpen()) V.drawer.open(t, { mode: 'overlay', returnTo: $('#kn-test-open'), onClose: function () { K.dock.apply(); } }); }
      else { K.url.set({ pane: 'test' }); K.dock.apply(); }
      if (focusQuestion) setTimeout(function () { var q = $('#kn-q'); if (q) q.focus(); }, 30);
      else if (mode === 'dock') { var h = $('#kn-test-t'); h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus(); }
    },
    close: function () {
      var mode = K.dock.mode();
      if (mode === 'dock') { store.set('vaani:knowledge:dock', 'closed'); K.dock.apply(); var b = $('#kn-test-open'); if (b) b.focus(); }
      else if (mode === 'overlay') V.drawer.close('kn-test', 'x');
      else { K.url.set({ pane: null }); K.dock.apply(); }
    }
  };

  /* ---------- views: Sources · Proposals (RouteTabs are links; admins only) ---------- */
  K.setView = function (view, push) {
    if (view === 'proposals' && K.role !== 'admin') view = 'forbidden';
    K.view = view;
    var routes = $('#kn-routes');
    if (routes) {
      routes.hidden = K.role !== 'admin';
      $$('.vtab', routes).forEach(function (a) { if (a.getAttribute('data-view') === (view === 'forbidden' ? 'proposals' : view)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    }
    $('#kn-sources-view').hidden = view !== 'sources';
    $('#kn-props-view').hidden = view === 'sources';
    $('#kn-add').hidden = view !== 'sources';
    $$('.kn-how-label, .kn-how-icon', $('.ph')).forEach(function (b) { b.hidden = view !== 'sources'; });
    /* ⋯ stays in every view below 1024: it carries "Prototype states…"; "How knowledge works" is a Sources-only item */
    var howItem = $('#kn-more-menu [data-act="how"]'); if (howItem) howItem.hidden = view !== 'sources';
    if (view !== 'sources') { if (V.drawer.isOpen('kn-source')) V.drawer.close('kn-source', 'navigate'); if (K.dock.overlayOpen()) V.drawer.close('kn-test', 'navigate'); $('#kn-test-open').hidden = true; }
    if (push !== undefined) K.url.set({ view: view === 'sources' ? null : 'proposals', source: null, tab: null, proposal: null }, push);
    V.setTitle(view === 'sources' ? null : 'Proposals');
    K.renderMeta();
    if (view === 'sources') { K.dock.apply(); if (K.table) K.table.render(); }
    else if (K.props) K.props.render(view === 'forbidden');
  };

  /* ---------- prototype-only states (clearly marked; not product UI) ---------- */
  var STATES = [
    ['Default: 1 failed, 1 indexing, 1 queued', ''], ['First use (no sources)', 'state=first-use'], ['Loading (skeleton)', 'state=loading'],
    ['Error on first load', 'state=error'], ['Error on refresh (rows kept)', 'state=error-refresh'], ['Offline', 'state=offline'],
    ['No results for a search', 'q=floor+plan+pdf'], ['Filtered to nothing', 'f.type=web&f.status=failed'],
    ['Test panel: search fails', 'state=test-error&test=2BHK+ka+price+kya+hai%3F'], ['Test panel: strong matches', 'test=2BHK+ka+price+kya+hai%3F'], ['Test panel: weak matches only', 'test=Is+there+a+swimming+pool%3F'],
    ['Test panel: nothing matched', 'test=Do+you+have+a+helipad%3F'], ['Source sheet: failed source', 'source=kb_09'], ['Source sheet: record gone', 'source=kb_99'],
    ['Add knowledge: sample uploads', 'add=files&demo=uploads'], ['Add knowledge: CSV table step', 'add=files&demo=csv'], ['Add knowledge: text', 'add=text'], ['Add knowledge: web page', 'add=web'],
    ['Proposals (admin)', 'view=proposals'], ['Proposals: none waiting', 'view=proposals&state=no-proposals'], ['Member: no Proposals tab', 'role=member'],
    ['Member visits Proposals (Forbidden)', 'role=member&view=proposals'], ['Viewer: cannot add knowledge', 'role=viewer']
  ];
  function renderProtoMenu() {
    var m = $('#kn-proto-menu'), cur = w.location.search.replace(/^\?/, '');
    m.innerHTML = '<div class="menu-head"><b>Prototype states</b><span>Not product UI. Reloads the page with a demo state.</span></div>' + STATES.map(function (s) {
      return '<a class="menu-item" role="menuitemradio" aria-checked="' + (cur === s[1] ? 'true' : 'false') + '" href="knowledge.html' + (s[1] ? '?' + s[1] : '') + '"><span class="menu-check">' + V.icon('check') + '</span><span class="menu-text"><span>' + esc(s[0]) + '</span></span></a>';
    }).join('');
  }

  /* ---------- offline and loading presentation ---------- */
  function offlineBar() { var main = $('#main'); if (!main || $('.cbar', main)) return; main.insertAdjacentHTML('afterbegin', '<div class="cbar" role="status">' + V.icon('cloud-off') + '<span><b>You’re offline.</b> Showing sources from 11:24&nbsp;am. Uploads resume when you reconnect.</span></div>'); }
  K.offlineReason = "You’re offline";

  /* ---------- boot ---------- */
  K.boot = function () {
    if (K._booted) return; K._booted = true;
    renderProtoMenu();
    if (K.offline) offlineBar();
    var add = $('#kn-add');
    if (!K.canAdd()) { add.setAttribute('aria-disabled', 'true'); add.setAttribute('data-tooltip', 'Only admins can add knowledge. Ask Anika R.'); }
    else if (K.offline) { add.setAttribute('aria-disabled', 'true'); add.setAttribute('data-tooltip', K.offlineReason); }
    add.addEventListener('click', function () { if (add.getAttribute('aria-disabled') === 'true') { V.announce(add.getAttribute('data-tooltip')); return; } K.add && K.add.open('files', { entry: 'header', returnTo: add }); });
    $('#kn-test-open').addEventListener('click', function () { K.dock.open(false); });
    $('#kn-test-close').addEventListener('click', function () { K.dock.close(); });
    $('#kn-pane').addEventListener('vaani:change', function (e) { K.url.set({ pane: e.detail.value === 'test' ? 'test' : null }); K.dock.apply(); });
    $('#kn-more-menu').addEventListener('vaani:menuselect', function (e) {
      var act = e.detail.value || e.detail.item.getAttribute('data-act');
      if (act === 'how') setTimeout(function () { V.popover.open($('.ph-more'), 'kn-how', { placement: 'bottom-end' }); }, 0);
      if (act === 'proto') setTimeout(function () { V.menu.open($('.ph-more'), 'kn-proto-menu', { placement: 'bottom-end' }); }, 0);
    });
    $('[data-kn-docs]').addEventListener('click', function (e) { e.preventDefault(); V.toast.info('Docs open outside this prototype.'); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-kn-retry]')) { e.preventDefault(); w.location.href = 'knowledge.html'; }
      if (e.target.closest('[data-kn-show-failed]')) { e.preventDefault(); K.table.setFilter('status', ['failed']); var s = $('#kn-search'); if (s) s.focus(); }
    });
    $$('#kn-routes .vtab').forEach(function (a) { a.addEventListener('click', function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); K.setView(a.getAttribute('data-view'), true); var h = $('#page-title'); if (h) h.focus(); }); });
    w.addEventListener('popstate', function () { var v = K.url.get('view') === 'proposals' ? 'proposals' : 'sources'; if (v !== K.view && !(v === 'proposals' && K.view === 'forbidden')) K.setView(v); });

    if (K.table) K.table.init();
    $('#kn-how-steps').innerHTML = K.howSteps().map(function (t) { return '<li>' + t + '</li>'; }).join('');
    if (K.test) K.test.init();
    if (K.add) K.add.init();
    if (K.props) K.props.init();
    $('#kn-prop-count').textContent = K.props ? K.props.pendingCount() : 3;

    V.commandPalette.register([
      { group: 'actions', title: 'Add knowledge…', icon: 'plus', keywords: ['upload', 'documents', 'files'], rank: 'top', perform: function () { K.add.open('files', { entry: 'palette' }); } },
      { group: 'actions', title: 'Test a question', icon: 'search', keywords: ['knowledge', 'search'], rank: 'top', perform: function () { K.setView('sources', false); K.dock.open(true); } }
    ]);
    V.on('breakpoint', function () { if (K.dock.overlayOpen() && K.dock.mode() !== 'overlay') V.drawer.close('kn-test', 'resize'); K.dock.apply(); });

    K.setView(K.url.get('view') === 'proposals' ? 'proposals' : 'sources');
    if (K.view === 'forbidden') { var h1 = $('#page-title'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); } }
    /* documented entry parameters (palette and setup links): ?upload=1, ?add=, ?file= / ?source=, ?test= */
    if (K.view === 'sources') {
      var addP = K.url.get('add') || (K.url.get('upload') === '1' ? 'files' : null);
      if (addP && K.canAdd() && !K.offline && K.add) setTimeout(function () { K.add.open(addP, { entry: 'url', demo: K.url.get('demo') }); }, 60);
      var src = K.url.get('source') || K.url.get('file');
      if (src && !addP) setTimeout(function () { K.table.openSource(src, K.url.get('tab') || 'overview', { fromUrl: true }); }, 60);
    }
  };
  d.addEventListener('DOMContentLoaded', function () { V.ready(K.boot); });
})(window, document);
