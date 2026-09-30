/* Vaani Labs prototype · pages/knowledge-sheet.js — the source sheet (Sheet record 440, 03-pages/05 §1.8): header with
   Previous / Next, Copy link and ⋯; the state line (StatusTag lg + sentence, danger Notice with the fix when failed);
   PanelTabs Overview · Passages · Used by (?tab=); the record-gone state. Docked at ≥1440 (swaps with Test), overlay
   1024–1439, modal below (full screen with a Back link on phones). */
(function (w, d) {
  'use strict';
  var K = w.VaaniKnowledge, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var S = K.sheet = {}, cur = null, tab = 'overview', pq = '', ppage = 1, expanded = {};
  S.currentId = function () { return V.drawer.isOpen('kn-source') ? cur : null; };

  function order() { return K.table.filtered().map(function (s) { return s.id; }); }
  function passagesFor(s) {
    var own = K.data.passages.filter(function (p) { return p.src === s.id; }), n = s.status === 'indexed' ? s.passages || 0 : 0, out = [];
    for (var i = 0; i < n; i++) {
      var p = own[i % Math.max(1, own.length)];
      var loc = s.kind === 'table' ? 'row ' + (i + 1) : s.kind === 'file' ? 'page ' + (Math.floor(i / Math.max(1, Math.ceil(n / (s.pages || 1)))) + 1) : 'section ' + (Math.floor(i / 4) + 1);
      out.push({ no: i + 1, loc: loc, lang: p ? p.lang : 'en', text: p && i < own.length ? p.text : sampleText(s, i) });
    }
    return out;
  }
  function sampleText(s, i) {
    var t = s.kind === 'table' ? s.title + ' row ' + (i + 1) + ': Tower ' + 'ABC'[i % 3] + ' · ' + (2 + i % 2) + 'BHK · Floor ' + (3 + i % 9) + ' · ' + (i % 2 ? 'East' : 'North') + ' facing' :
      s.title + ', passage ' + (i + 1) + '. Sample Realty answers this on calls from the source text, in short sentences a caller can follow. Details repeat the figures exactly as the document states them, without rounding, so the agent never quotes a number the document does not contain.';
    return t;
  }

  function head(s) {
    var ids = order(), i = s ? ids.indexOf(s.id) : -1;
    return '<div class="sheet-head"><button class="btn btn--tertiary sheet-back" type="button" data-drawer-close>' + V.icon('chevron-left') + 'Sources</button>' +
      '<div class="sheet-heading"><h2 class="sheet-title" id="kn-source-t" tabindex="-1" data-focus-target translate="no">' + esc(s ? s.title : 'Source') + '</h2>' + (s ? '<p class="sheet-meta">' + esc(metaLine(s)) + '</p>' : '') + '</div>' +
      '<div class="sheet-actions">' + (s ? '<button class="ibtn u-hide-phone" type="button" data-sh-step="-1" aria-label="Previous source" data-kbd="k"' + (i <= 0 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-up') + '</button>' +
      '<button class="ibtn u-hide-phone" type="button" data-sh-step="1" aria-label="Next source" data-kbd="j"' + (i < 0 || i >= ids.length - 1 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-down') + '</button>' +
      '<button class="ibtn" type="button" data-sh-copy aria-label="Copy link to this source">' + V.icon('link') + '</button>' +
      '<button class="ibtn" type="button" data-sh-menu aria-label="More actions for ' + esc(s.title) + '" aria-haspopup="menu" aria-expanded="false">' + V.icon('ellipsis') + '</button>' : '') +
      '<button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close source">' + V.icon('x') + '</button></div></div>';
  }
  function metaLine(s) {
    var what = s.kind === 'file' ? s.format + ' · ' + s.pages + (s.pages === 1 ? ' page' : ' pages') : s.kind === 'table' ? 'Table · ' + s.rows + ' rows' : s.kind === 'web' ? 'Web page' : 'Pasted text';
    return what + ' · added ' + V.fmt.dateShort(s.addedAt || s.updatedAt) + ' by ' + s.by;
  }
  function stateLine(s) {
    var st = K.sentence(s), rest = st.text.indexOf(' · ') > 0 ? st.text.slice(st.text.indexOf(' · ') + 3) : '';
    var html = '<div class="kn-sh-state">' + K.statusTag(s, { size: 'lg' }) + (rest ? '<span class="kn-sh-sentence">' + esc(rest) + '</span>' : '') + '</div>';
    if (K.isFailed(s)) {
      var r = K.reason(s), fx = K.fixes(s).filter(function (f) { return f.act !== 'delete'; });
      html += '<div class="notice notice--danger" role="status">' + V.icon('circle-x') + '<span class="notice-body"><span class="notice-title">' + esc(r.sentence) + '</span> Callers get no answers from this source until it is fixed.' +
        (r.errorId ? '<details class="details"><summary>Details</summary><div class="raw"><code>' + esc(r.errorId) + '</code></div></details>' : '') + '</span>' +
        '<span class="notice-acts">' + fx.map(function (f, i) { return i === 0 ? '<button class="btn btn--sm" type="button" data-sh-act="' + f.act + '">' + esc(f.label) + '</button>' : '<button class="notice-act" type="button" data-sh-act="' + f.act + '">' + esc(f.label) + '</button>'; }).join('') + '</span></div>';
    }
    return html;
  }
  function tabs() {
    var T = [['overview', 'Overview'], ['passages', 'Passages'], ['used-by', 'Used by']];
    return '<div class="vtabs vtabs--panel"><div class="vtabs-list" role="tablist" aria-label="Source details">' + T.map(function (t) {
      return '<button class="vtab" role="tab" type="button" id="kn-sh-tab-' + t[0] + '" aria-controls="kn-sh-panel" data-tab="' + t[0] + '" aria-selected="' + (tab === t[0]) + '" tabindex="' + (tab === t[0] ? 0 : -1) + '">' + t[1] + '</button>';
    }).join('') + '</div></div>';
  }
  function overview(s) {
    var rows = [['Status', esc(K.sentence(s).text)], ['Passages', s.status === 'indexed' ? V.fmt.count(s.passages) : '<span class="kv-empty">Not indexed yet</span>'],
      ['Type', esc(s.kind === 'file' ? s.format + ', ' + s.pages + ' pages' : s.kind === 'table' ? 'Table, ' + s.rows + ' rows' : s.kind === 'web' ? 'Web page' : 'Text, ' + V.fmt.count(s.chars || 0) + ' characters')],
      ['Source', s.kind === 'web' ? '<a href="' + esc(s.url) + '" data-sh-ext class="u-wrap-anywhere">' + esc(s.url.replace(/^https:\/\//, '')) + V.icon('external-link', 'xs') + '</a>' : s.kind === 'text' || s.kind === 'answers' ? 'Pasted text' : '<span translate="no" class="u-wrap-anywhere">' + esc(s.fileName) + '</span>']];
    if (s.kind === 'web') rows.push(['Fetched', s.fetchedAt ? esc(V.fmt.when(s.fetchedAt)) : '<span class="kv-empty">Not yet</span>']);
    rows.push(['Added', esc(V.fmt.date(s.addedAt || s.updatedAt)) + ' · ' + esc(s.by)]);
    rows.push(['Last indexed', s.status === 'indexed' ? '<time datetime="' + esc(s.updatedAt) + '">' + esc(V.fmt.when(s.updatedAt)) + '</time>' : '<span class="kv-empty">Not yet</span>']);
    if (s.languages && s.languages.length) rows.push(['Languages', s.languages.map(function (c) { return V.ui.langMark(c, 'full'); }).join('')]);
    return '<dl class="kv">' + rows.map(function (r) { return '<div class="kv-row"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="l-cluster">' + (s.status === 'indexed' ? '<button class="btn" type="button" data-sh-act="test">' + V.icon('search') + 'Test with this source</button>' : '') + (K.isFailed(s) ? '<button class="btn btn--tertiary" type="button" data-sh-act="retry">' + V.icon('rotate-cw') + 'Retry</button>' : '') + '</div>';
  }
  function passagesPanel(s) {
    var all = passagesFor(s); if (!all.length) return '<p class="empty empty--compact">Passages appear here once this source is indexed.</p>';
    var q = pq.trim().toLowerCase(), list = q ? all.filter(function (p) { return p.text.toLowerCase().indexOf(q) >= 0; }) : all, size = 10, pages = Math.max(1, Math.ceil(list.length / size));
    if (ppage > pages) ppage = pages;
    var slice = list.slice((ppage - 1) * size, ppage * size);
    return '<form class="search search--full" role="search" aria-label="Find in passages" data-sh-find>' + V.icon('search') + '<input type="search" aria-label="Find in passages" placeholder="Find in passages…" value="' + esc(pq) + '"></form>' +
      (slice.length ? '<ol class="kn-pass" aria-label="Passages">' + slice.map(function (p) {
        var open = expanded[s.id + ':' + p.no];
        return '<li class="kn-pass-item"><p class="kn-pass-loc">Passage ' + p.no + ' · ' + esc(p.loc) + '</p><p class="type-read-15 kn-pass-text' + (open ? '' : ' kn-clamp6') + '" lang="' + esc(p.lang) + '">' + esc(p.text) + '</p>' + (p.text.length > 260 ? '<button class="btn btn--link kn-pass-more" type="button" data-sh-more="' + p.no + '" aria-expanded="' + !!open + '">' + (open ? 'Show less' : 'Show more') + '</button>' : '') + '</li>';
      }).join('') + '</ol>' : '<p class="empty empty--compact">No passages contain ‘' + esc(pq) + '’.</p>') +
      '<div class="kn-sh-pager"><span role="status">' + (list.length ? ((ppage - 1) * size + 1) + '–' + Math.min(list.length, ppage * size) : 0) + ' of ' + list.length + '</span><span class="pager-btns"><button class="ibtn ibtn--sm" type="button" data-sh-pp="-1" aria-label="Previous passages"' + (ppage <= 1 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-left', 'sm') + '</button><button class="ibtn ibtn--sm" type="button" data-sh-pp="1" aria-label="Next passages"' + (ppage >= pages ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-right', 'sm') + '</button></span></div>';
  }
  function usedPanel(s) {
    var u = K.usedBy(s), html = '';
    if (!u.count) return '<p class="empty empty--compact">No flow looks this source up yet. ' + (s.status === 'indexed' ? '' : 'Flows that look up all sources find it once it is indexed.') + '</p>';
    if (u.direct.length) html += '<ul class="kn-used" aria-label="Flows that look it up directly">' + u.direct.map(function (f) {
      return '<li class="kn-used-row"><span class="kn-used-main"><span class="kn-used-name" translate="no">' + esc(f.name) + '</span><span class="kn-used-meta">' + esc(K.flowState(f)) + ' · step ' + f.step + ', ' + esc(f.stepLabel) + '</span></span><a class="btn btn--sm" href="flow-designer.html?flow=' + esc(f.id) + '&amp;node=' + esc(f.node) + '">Open in flow</a></li>';
    }).join('') + '</ul>';
    if (u.all.length) html += '<div class="kn-used-all"><p class="type-label-13">' + u.all.length + ' flows look up all sources</p><p class="type-meta-12 u-fg-3">' + u.all.map(function (f) { return esc(f.name) + ' (' + esc(K.flowState(f)) + ')'; }).join(' · ') + '</p></div>';
    if (s.status === 'indexed') html += '<p class="kn-quoted">Quoted on ' + (8 + (s.passages || 0) % 13) + ' calls in the last 7 days · <a href="call-reports.html?when=7d&amp;f.knowledge=found">Open in Call reports</a></p>';
    return html;
  }

  S.render = function (id, newTab, keepFocus) {
    var el = $('#kn-source'), s = K.byId(id), active = d.activeElement, keepAct = keepFocus && el.contains(active) ? (active.getAttribute('data-sh-step') || active.getAttribute('data-tab')) : null;
    if (id !== cur) { pq = ''; ppage = 1; }
    cur = id; if (newTab) tab = newTab;
    if (!s) { el.innerHTML = head(null) + '<div class="sheet-body"><p class="empty empty--compact">This source was deleted, or you no longer have access.</p><div><button class="btn" type="button" data-drawer-close>Close</button></div></div>'; hydrate(el); return; }
    var panel = tab === 'passages' ? passagesPanel(s) : tab === 'used-by' ? usedPanel(s) : overview(s);
    el.innerHTML = head(s) + tabs() + '<div class="sheet-body">' + stateLine(s) + '<div id="kn-sh-panel" role="tabpanel" aria-labelledby="kn-sh-tab-' + tab + '" class="l-stack l-stack--md">' + panel + '</div></div>';
    V.initAll(el);
    if (keepAct) { var again = $('[data-sh-step="' + keepAct + '"]', el) || $('[data-tab="' + keepAct + '"]', el); if (again) again.focus(); }
    V.setTitle(s.title);
    markRow(id);
  };
  function markRow(id) { $$('#kn-tbody tr[data-id]').forEach(function (r) { if (id && r.getAttribute('data-id') === id) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); }); }
  S.markRow = function () { markRow(S.currentId()); };
  function hydrate(root) { if (w.VaaniIcon) w.VaaniIcon.hydrate(root); }
  /* the visible row for a source: the table row at ≥768, the ListRow link below */
  function rowFor(id) {
    var tr = $('#kn-tbody tr[data-id="' + id + '"]'), li = $('#kn-rows li[data-id="' + id + '"] .li');
    return tr && tr.getClientRects().length ? tr : li && li.getClientRects().length ? li : null;
  }

  S.open = function (id, t, o) {
    o = o || {}; var el = $('#kn-source');
    if (K.dock.overlayOpen()) V.drawer.close('kn-test', 'swap');
    S.render(id, t || 'overview');
    var back = o.returnTo || d.activeElement;
    if (!back || back === d.body || back === $('#main')) back = rowFor(id) || back;   /* opened from a link or ?source=: Esc returns to its row */
    V.drawer.open(el, { returnTo: back, onClose: function () { cur = null; markRow(null); K.url.set({ source: null, tab: null, file: null }); V.setTitle(null); K.dock.apply(); } });
    K.dock.apply();
    K.url.set({ source: id, tab: tab === 'overview' ? null : tab, file: null });
    var s = K.byId(id); if (s) V.commandPalette.addRecent({ title: s.title, meta: 'Knowledge', icon: 'file', href: 'knowledge.html?source=' + id });
  };
  K.table.openSource = S.open;
  S.follow = function (id, tr) {
    if (id === cur) return; S.render(id, null);
    V.overlays.stack.forEach(function (e) { if (e.el === $('#kn-source')) e.returnTo = tr; });
    K.url.set({ source: id });
  };
  /* J / K and the header Previous / Next: the sheet follows, focus stays in the sheet (on the control that had it, else the
     title, which the re-render replaced) and "Source n of N" is announced, as in Leads and Call reports */
  function step(dir) {
    var ids = order(), i = ids.indexOf(cur), n = ids[i + dir]; if (!n) return;
    var el = $('#kn-source'), entry = null;
    S.render(n, null, true);
    if (!el.contains(d.activeElement)) { var t = $('#kn-source-t', el); if (t) t.focus({ preventScroll: true }); }
    V.overlays.stack.forEach(function (e) { if (e.el === el) entry = e; });
    var tr = $('#kn-tbody tr[data-id="' + n + '"]');
    if (tr) { $$('#kn-tbody tr').forEach(function (r) { r.setAttribute('tabindex', r === tr ? '0' : '-1'); }); }
    var back = rowFor(n);
    if (back && entry) { entry.returnTo = back; if (entry.mode !== 'modal') back.scrollIntoView({ block: 'nearest' }); }
    K.url.set({ source: n });
    V.announce('Source ' + (ids.indexOf(n) + 1) + ' of ' + ids.length, { dedupeKey: 'kn-follow' });
  }

  d.addEventListener('DOMContentLoaded', function () {
    var el = $('#kn-source'); if (!el) return;
    el.addEventListener('vaani:tabchange', function (e) { tab = e.detail.tab.getAttribute('data-tab'); K.url.set({ tab: tab === 'overview' ? null : tab }); S.render(cur, tab, true); var t = $('[data-tab="' + tab + '"]', el); if (t) t.focus(); });
    el.addEventListener('click', function (e) {
      var st = e.target.closest('[data-sh-step]'); if (st) { if (st.getAttribute('aria-disabled') !== 'true') step(+st.getAttribute('data-sh-step')); return; }
      if (e.target.closest('[data-sh-copy]')) { try { navigator.clipboard.writeText(w.location.href.split('?')[0] + '?source=' + cur); } catch (x) { /* blocked */ } V.toast.success('Link copied.'); return; }
      var m = e.target.closest('[data-sh-menu]'); if (m) { var s = K.byId(cur); $('#kn-sheet-menu').innerHTML = K.table.menuHtml(s); if (m.getAttribute('aria-expanded') === 'true') V.menu.close(); else V.menu.open(m, 'kn-sheet-menu'); return; }
      var a = e.target.closest('[data-sh-act]'); if (a) { var act = a.getAttribute('data-sh-act'); if (act === 'test') V.drawer.close(el, 'swap'); K.table.act(act, cur, a); return; }
      var mo = e.target.closest('[data-sh-more]'); if (mo) { var key = cur + ':' + mo.getAttribute('data-sh-more'); expanded[key] = !expanded[key]; var p = mo.previousElementSibling; p.classList.toggle('kn-clamp6', !expanded[key]); mo.textContent = expanded[key] ? 'Show less' : 'Show more'; mo.setAttribute('aria-expanded', !!expanded[key]); return; }
      var pp = e.target.closest('[data-sh-pp]'); if (pp && pp.getAttribute('aria-disabled') !== 'true') { ppage += +pp.getAttribute('data-sh-pp'); S.render(cur, null); var again = $('[data-sh-pp="' + pp.getAttribute('data-sh-pp') + '"]', el); if (again) again.focus(); return; }
      if (e.target.closest('[data-sh-ext]')) { e.preventDefault(); V.toast.info('External pages open outside this prototype.'); }
    });
    el.addEventListener('input', function (e) { if (e.target.closest('[data-sh-find]')) { pq = e.target.value; ppage = 1; var pos = e.target.selectionStart; S.render(cur, null); var inp = $('[data-sh-find] input', el); inp.focus(); try { inp.setSelectionRange(pos, pos); } catch (x) { /* ignore */ } } });
    el.addEventListener('submit', function (e) { e.preventDefault(); });
    $('#kn-sheet-menu').addEventListener('vaani:menuselect', function (e) { var id = cur, trig = $('[data-sh-menu]', el); setTimeout(function () { if (e.detail.value === 'test') V.drawer.close(el, 'swap'); K.table.act(e.detail.value, id, trig); }, 0); });
    V.shortcuts.register('j', function () { step(1); }, { description: 'Next source', group: 'Records and sheets', when: function () { return V.drawer.isOpen('kn-source') && $('#kn-source').contains(d.activeElement); } });
    V.shortcuts.register('k', function () { step(-1); }, { description: 'Previous source', group: 'Records and sheets', when: function () { return V.drawer.isOpen('kn-source') && $('#kn-source').contains(d.activeElement); } });
  });
})(window, document);
