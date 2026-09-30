/* Vaani Labs prototype · Call reports · rendering: header meta, views, count, DataTable, phone ListRows, pager, states. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, P = NS.page, $ = U.$, $$ = U.$$, esc = U.esc, fmt = V.fmt;
  var VIEWS = [['all', 'All'], ['review', 'Needs review'], ['positive', 'Positive'], ['negative', 'Negative'], ['mixed', 'Mixed'], ['unscored', 'Unscored']];
  NS.VIEWS = VIEWS;
  function muted(t) { return '<span class="c-muted">' + esc(t) + '</span>'; }
  function hidden(t) { return '<span class="sr-only">' + esc(t) + '</span>'; }

  /* ---------- cells ---------- */
  NS.outcomeHtml = function (c, o) {
    if (c.outcome) return V.ui.statusTag('outcome', c.outcome, o);
    if (c.result && c.result !== 'completed') return V.ui.statusTag('callResult', c.result, o);
    return muted('No outcome');
  };
  /* Sentiment is plain (icon + word, no tint) so Outcome stays the row’s only tint (§4.5, R11). Unscored reads in text-3. */
  NS.sentimentHtml = function (c) {
    if (c.pendingAnalysis) return '<span class="status status--md" data-tooltip="Analysis in progress" tabindex="-1">' + V.icon('circle-dashed') + 'Unscored</span>';
    if (c.sentiment === 'unscored') { var def = V.statusDef('sentiment', 'unscored'); return '<span class="status status--md">' + V.icon(def[1]) + esc(def[0]) + '</span>'; }
    return V.ui.statusTag('sentiment', c.sentiment, { plain: true });
  };
  NS.kindTag = function (c) {
    if (c.kind === 'browser') return '<span class="tag tag--outline">' + V.icon('monitor', 'xs') + 'Browser test</span>';
    if (c.kind === 'test') return '<span class="tag tag--outline">' + V.icon('flask-conical', 'xs') + 'Test call</span>';
    return '';
  };
  NS.dirHtml = function (c) { return '<span class="cr-dir">' + V.icon(c.direction === 'inbound' ? 'phone-incoming' : 'phone-outgoing', 'sm', { className: 'u-fg-3' }) + (c.direction === 'inbound' ? 'Inbound' : 'Outbound') + '</span>'; };
  NS.capturedText = function (c) {
    var got = (c.captured || []).filter(function (x) { return x.value; });
    if (!got.length) return null;
    var shown = got.slice(0, 2).map(function (x) { return x.key + ' ' + x.value; }).join(' · ');
    return shown + (got.length > 2 ? ' · +' + (got.length - 2) : '');
  };
  function langCell(c) {
    var L = c.languages || []; if (!L.length) return '–';
    var first = V.langByCode(L[0]).name;
    if (L.length === 1) return V.ui.langMark(L[0], 'name');
    return '<span class="lm" data-tooltip="' + esc(L.map(function (x) { return V.langByCode(x).name; }).join(' and ')) + '">' + esc(first) + ' +' + (L.length - 1) + '</span>';
  }
  function cell(c, col) {
    switch (col.id) {
      case 'when': return '<time datetime="' + esc(c.at) + '" data-tooltip="' + esc(fmt.whenAbs(c.at)) + '">' + esc(fmt.when(c.at, { time: true })) + '</time>';
      case 'lead':
        var who = c.leadName ? '<span translate="no">' + esc(NS.shortName(c.leadName)) + '</span>' : c.phone ? V.ui.phoneText(c.phone) : '<span class="c-muted">Unknown caller</span>';
        return '<a href="' + esc(P.href(c)) + '" data-open="' + c.id + '" aria-label="' + esc(P.callWho(c) + ', ' + fmt.when(c.at, { time: true })) + '">' + who + '</a>';
      case 'phone': return c.phone ? V.ui.phoneText(c.phone) : muted('Withheld');
      case 'direction': return NS.dirHtml(c) + (c.test ? ' ' + NS.kindTag(c) : '');
      case 'duration': return c.durationSec ? esc(fmt.duration(c.durationSec)) : '<span aria-hidden="true">–</span>' + hidden('No talk time');
      case 'outcome': return NS.outcomeHtml(c);
      case 'sentiment': return '<span class="cr-sent">' + NS.sentimentHtml(c) + '</span>';
      case 'flow': return c.flow ? '<a class="cr-flowlink" data-tooltip-overflow href="flow-designer.html?flow=' + esc(c.flow.id) + '&amp;version=' + c.flow.version + '">' + esc(c.flow.name) + ' <span class="c-muted">v' + c.flow.version + '</span></a>' : muted('No flow');
      case 'language': return langCell(c);
      case 'captured': var t = NS.capturedText(c); return t ? '<span class="cell-t cr-cap" data-tooltip-overflow>' + esc(t) + '</span>' : muted('Nothing captured');
      case 'summary': return c.summary ? '<span class="cell-t cr-sum" data-tooltip-overflow>' + esc(c.summary) + '</span>' : muted('Not analysed yet');
      case 'result': return V.ui.statusTag('callResult', c.result);
      case 'cost': return c.cost == null ? muted('Not billed') : c.cost ? esc(fmt.money(c.cost)) : muted('Not billed');
      case 'callid': return '<span class="id-text">' + esc(c.id) + '</span>';
    }
    if (col.field != null) { var x = (c.captured || [])[col.field]; return x && x.value ? esc(x.value) : muted('Not captured'); }
    return '';
  }
  NS.cellText = function (c, col) {
    switch (col.id) {
      case 'when': return fmt.whenAbs(c.at);
      case 'lead': return c.leadName || (c.phone ? c.phone.masked : 'Unknown caller');
      case 'phone': return c.phone ? c.phone.masked : 'Withheld';
      case 'direction': return (c.direction === 'inbound' ? 'Inbound' : 'Outbound') + (c.test ? ' · ' + (c.kind === 'browser' ? 'Browser test' : 'Test call') : '');
      case 'duration': return c.durationSec ? fmt.duration(c.durationSec) : '';
      case 'outcome': return c.outcome || (c.result !== 'completed' ? V.statusDef('callResult', c.result)[0] : 'No outcome');
      case 'sentiment': return V.statusDef('sentiment', c.sentiment)[0];
      case 'flow': return c.flow ? c.flow.name + ' v' + c.flow.version : 'No flow';
      case 'language': return (c.languages || []).map(function (x) { return V.langByCode(x).name; }).join(' + ');
      case 'captured': return (c.captured || []).map(function (x) { return x.key + ': ' + (x.value || 'Not captured'); }).join('; ');
      case 'summary': return c.summary || 'Not analysed yet';
      case 'result': return V.statusDef('callResult', c.result)[0];
      case 'cost': return c.cost ? fmt.money(c.cost) : 'Not billed';
      case 'callid': return c.id;
    }
    if (col.field != null) { var x = (c.captured || [])[col.field]; return x && x.value ? x.value : 'Not captured'; }
    return '';
  };

  /* ---------- header meta, views, count ---------- */
  NS.renderMeta = function () {
    var m = $('#cr-meta'); if (!m) return;
    if (P.flag('loading')) return;
    if (P.flag('stats-error')) { m.textContent = 'Totals unavailable · ' + P.updatedWords(); return; }
    var n = P.counts;
    m.innerHTML = esc(fmt.count(n.all) + ' calls · ' + fmt.count(n.review) + ' need review') + '<span class="cr-meta-upd"> · ' + esc(P.offline() ? 'showing data from ' + fmt.time(P.updatedAt) : P.updatedWords()) + '</span>' + (P.pending.length ? ' · <span class="cr-newcalls">' + P.pending.length + ' new calls · <button type="button" class="btn btn--link" id="cr-show-new">Show</button></span>' : '');
  };
  NS.renderViews = function () {
    var list = $('#cr-tablist'), n = P.counts || {}, err = P.flag('stats-error') || P.flag('loading');
    var views = VIEWS.map(function (v) { return { id: v[0], label: v[1], count: n[v[0]] }; }).concat((P.userViews || []).map(function (u) { return { id: u.id, label: u.label, user: true }; }));
    list.innerHTML = views.map(function (v) {
      var on = (P.userView ? P.userView.id : P.st.view) === v.id;
      var cnt = v.user ? '' : err ? '<span class="vtab-count">' + (P.flag('loading') ? '<span class="sk sk--meta cr-sk-tab" aria-hidden="true"></span><span class="sr-only">loading</span>' : '–') + '</span>' : '<span class="vtab-count">' + fmt.count(v.count) + '</span>';
      return '<button class="vtab" role="tab" type="button" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-view="' + esc(v.id) + '"' + (v.user ? ' data-user' : '') + '>' + esc(v.label) + ' ' + cnt + '</button>';
    }).join('');
    var lb = $('#cr-viewsel-lb'), cur = views.filter(function (v) { return (P.userView ? P.userView.id : P.st.view) === v.id; })[0] || views[0];
    lb.innerHTML = views.map(function (v) { var on = v === cur; return '<div class="option" role="option" aria-selected="' + on + '" data-value="' + esc(v.id) + '"><span class="option-main"><span class="option-label">' + esc(v.label) + '</span></span>' + (v.user || err ? '' : '<span class="count-badge">' + fmt.count(v.count) + '</span>') + V.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('');
    $('#cr-viewsel-v').textContent = 'View: ' + cur.label;
  };
  NS.renderStatus = function () {
    var b = $('#cr-count'), pg = $('#cr-pager .cr-range');
    if (P.busy || P.flag('loading')) {
      b.innerHTML = P.flag('loading') ? '<span class="sk sk--meta cr-sk-count" aria-hidden="true"></span><span class="sr-only">Loading calls…</span>' : 'Updating…';
      if (pg) pg.textContent = P.flag('loading') ? 'Loading…' : 'Updating…';
      $('#cr-scroll').setAttribute('aria-busy', 'true');
      return;
    }
    $('#cr-scroll').removeAttribute('aria-busy');
    var n = P.rows.length, all = P.viewTotal, words = n === all ? fmt.count(n) + ' calls' : fmt.count(n) + ' of ' + fmt.count(all);
    b.innerHTML = (n === all ? '<b>' + fmt.count(n) + '</b> calls' : '<b>' + fmt.count(n) + '</b> of ' + fmt.count(all)) + V.icon('chevron-down', 'sm');
    b.setAttribute('aria-label', words + (n === all ? '' : ' calls') + ' in this view. Show totals');
  };

  /* ---------- table ---------- */
  function thead(cols) {
    var s = P.st.sort;
    return '<tr>' + cols.map(function (col, i) {
      var pin = i < 2 ? ' sticky-l cr-pin' + i : '', cls = (col.num ? 'c-num' : '') + pin;
      if (!col.sort) return '<th scope="col" class="' + cls + '">' + esc(col.label) + '</th>';
      var on = s.col === col.sort, dirWord = col.sort === 'when' ? (s.dir === 'desc' ? 'newest first' : 'oldest first') : (s.dir === 'desc' ? 'descending' : 'ascending');
      return '<th scope="col" class="' + cls + '"' + (on ? ' aria-sort="' + (s.dir === 'desc' ? 'descending' : 'ascending') + '"' : '') + ' data-col="' + col.sort + '"><button class="th-sort" type="button"' + (on ? ' aria-label="' + esc(col.label + ', sorted ' + dirWord) + '"' : '') + '>' + esc(col.label) + V.icon(on ? (s.dir === 'desc' ? 'arrow-down' : 'arrow-up') : 'chevrons-up-down', 'xs') + '</button></th>';
    }).join('') + '<th scope="col" class="c-act sticky-r"><span class="sr-only">Actions</span></th></tr>';
  }
  function row(c, i, cols, focusIdx) {
    var open = P.openId === c.id, mine = P.keep[c.id] && c.reviewed && c.reviewed.by === P.me;
    var act = (mine ? '<span class="cr-rowrev">' + V.ui.statusTag('review', 'reviewed') + '<button type="button" class="btn btn--link cr-undo" data-undo="' + c.id + '" aria-label="' + esc('Undo review of ' + P.callName(c)) + '">Undo</button></span>' : '') +
      '<span class="row-actions"><button class="ibtn" type="button" aria-label="' + esc('More actions for ' + P.callName(c)) + '" aria-haspopup="menu" aria-expanded="false" data-rowmenu="' + c.id + '"><i data-icon="ellipsis"></i></button></span>';
    return '<tr data-id="' + c.id + '" tabindex="' + (i === focusIdx ? 0 : -1) + '" aria-rowindex="' + (P.start + i + 2) + '"' + (open ? ' aria-current="true"' : '') + '>' +
      cols.map(function (col, k) { var cls = (col.id === 'lead' ? 'c-key' : '') + (col.num ? ' c-num' : '') + (k < 2 ? ' sticky-l cr-pin' + k : ''); return '<td' + (cls.trim() ? ' class="' + cls.trim() + '"' : '') + '>' + cell(c, col) + '</td>'; }).join('') +
      '<td class="c-act sticky-r">' + act + '</td></tr>';
  }
  function listRow(c) {
    var meta = [fmt.when(c.at, { time: true }), c.durationSec ? fmt.duration(c.durationSec) : 'no talk time', c.direction === 'inbound' ? 'Inbound' : 'Outbound'].join(' · ');
    return '<li><a class="li cr-li" href="' + esc(P.href(c)) + '" data-open="' + c.id + '"' + (P.openId === c.id ? ' aria-current="true"' : '') + '>' +
      '<span class="li-title"><span translate="no">' + esc(P.callWho(c)) + '</span>' + (c.test ? NS.kindTag(c) : '') + '</span>' + '<span class="cr-li-trail">' + NS.outcomeHtml(c) + '</span>' +
      '<span class="li-meta">' + esc(meta) + (P.keep[c.id] && c.reviewed ? ' · Reviewed' : '') + '</span><span class="cr-li-trail">' + NS.sentimentHtml(c) + '</span></a></li>';
  }
  function skeleton(cols) {
    var W = [62, 48, 70, 40, 56, 44, 66, 52];
    return Array.apply(null, Array(10)).map(function (x, i) { return '<tr aria-hidden="true">' + cols.map(function (col, k) { return '<td' + (col.num ? ' class="c-num"' : '') + '><span class="sk' + (col.id === 'outcome' ? ' sk--block cr-sk-tag' : '') + '" style="width: ' + W[(i + k) % W.length] + '%"></span></td>'; }).join('') + '<td></td></tr>'; }).join('');
  }
  NS.renderTable = function () {
    var cols = P.visibleCols(), table = $('#cr-table'), focused = d.activeElement && d.activeElement.closest && d.activeElement.closest('#cr-tbody tr');
    var focusIdx = 0; if (focused) focusIdx = Math.max(0, Array.prototype.indexOf.call(focused.parentNode.children, focused));
    if (P.openId) { var oi = P.pageRows.map(function (c) { return c.id; }).indexOf(P.openId); if (oi >= 0 && !focused) focusIdx = oi; }
    P.cols = cols; $('#cr-work').classList.toggle('cr-docked', P.sheetMode === 'docked');
    $('#cr-thead').innerHTML = thead(cols);
    table.setAttribute('aria-rowcount', (P.flag('loading') ? -1 : P.rows.length + 1));
    var s = P.st.sort, sc = NS.col(s.col === 'id' ? 'callid' : s.col) || NS.COLS[0];
    $('#cr-caption').textContent = 'Calls, sorted by ' + sc.label + ', ' + (s.col === 'when' ? (s.dir === 'desc' ? 'newest first' : 'oldest first') : s.dir === 'desc' ? 'descending' : 'ascending');
    $('#cr-tbody').innerHTML = P.flag('loading') ? skeleton(cols) : P.pageRows.map(function (c, i) { return row(c, i, cols, focusIdx); }).join('');
    $('#cr-list').innerHTML = P.flag('loading') ? '' : P.pageRows.map(listRow).join('');
    V.initAll($('#cr-work')); V.table.init(table);
    if (focused) { var again = $('#cr-tbody tr:nth-child(' + (focusIdx + 1) + ')'); if (again) again.focus({ preventScroll: true }); }
    NS.syncPins();
  };
  /* Pinned When and Lead at 768–1023: the Lead column sticks after When’s width. */
  NS.syncPins = function () { var first = $('#cr-table th.cr-pin0'); if (first) $('#cr-table').style.setProperty('--cr-pin1', first.offsetWidth + 'px'); };

  /* ---------- pager ---------- */
  NS.renderPager = function () {
    var pg = $('#cr-pager'), n = P.rows.length, a = n ? P.start + 1 : 0, b = Math.min(n, P.start + P.st.size), off = P.offline();
    var range = fmt.count(a) + '–' + fmt.count(b) + ' of ' + fmt.count(n) + ' calls · test calls ' + (P.st.test ? 'included' : 'hidden');
    var dis = function (x) { return x ? ' aria-disabled="true"' : ''; };
    pg.innerHTML = '<span class="cr-range">' + (P.flag('loading') ? 'Loading…' : P.busy ? 'Updating…' : esc(range)) + '</span><span class="pager-sp"></span>' +
      '<span class="u-hide-phone" id="cr-size-l">Rows per page</span><button type="button" class="select select--sm select--quiet cr-size" data-select aria-controls="cr-size-lb" aria-labelledby="cr-size-l cr-size-v"' + dis(off) + (off ? ' data-tooltip="You’re offline"' : '') + '><span class="select-value" id="cr-size-v">' + P.st.size + '</span><i data-icon="chevron-down" data-size="sm"></i></button>' +
      '<div class="listbox" id="cr-size-lb" role="listbox" aria-label="Rows per page" hidden>' + [25, 50, 100].map(function (s) { return '<div class="option" role="option" data-value="' + s + '" aria-selected="' + (s === P.st.size) + '"><span class="option-main"><span class="option-label">' + s + '</span></span>' + V.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div>' +
      '<span>Page ' + fmt.count(P.st.page) + ' of ' + fmt.count(P.pages) + '</span><span class="pager-btns">' +
      '<button class="ibtn ibtn--sm" type="button" id="cr-prev" aria-label="Previous page"' + dis(P.st.page <= 1 || off) + (off ? ' data-tooltip="You’re offline"' : '') + '><i data-icon="chevron-left"></i></button>' +
      '<button class="ibtn ibtn--sm" type="button" id="cr-next" aria-label="Next page"' + dis(P.st.page >= P.pages || off) + (off ? ' data-tooltip="You’re offline"' : '') + '><i data-icon="chevron-right"></i></button></span>';
    V.initAll(pg);
  };

  /* ---------- empty, error and permission states (spec §2.7) ---------- */
  function empty(icon, title, body, actions, cls) {
    return '<div class="empty ' + (cls || '') + '">' + V.icon(icon, 'lg') + '<h2 class="empty-title">' + title + '</h2>' + (body ? '<p>' + body + '</p>' : '') + (actions ? '<div class="empty-actions">' + actions + '</div>' : '') + '</div>';
  }
  NS.emptyState = function () {
    if (P.flag('forbidden')) return empty('lock', 'Only admins and team leads can see call reports.', 'Ask Rohit S. for access.', '<a class="btn" href="cockpit.html">Go to Cockpit</a>', 'empty--page');
    if (P.flag('error')) return '<div class="notice notice--danger notice--multi cr-err" role="alert">' + V.icon('circle-alert') + '<div class="notice-body"><span class="notice-title">Couldn’t load calls.</span> Check your connection and try again.<details class="details u-mt-8"><summary>Details</summary><div class="raw"><code>request_id: req_7f31c2 · GET /api/calls · 503</code></div></details></div><span class="notice-acts"><button type="button" class="notice-act" data-retry>Retry</button></span></div>';
    if (P.firstUse()) return empty('file-text', 'No calls yet', 'Calls appear here after your agent places or answers one, with the transcript, summary and what was captured.', '<a class="btn" href="cockpit.html?test=browser">Place a test call…</a><button type="button" class="btn btn--link" data-docs>How call reports work</button>', 'empty--page');
    if (P.flag('loading') || P.rows.length) return '';
    if (P.st.view === 'review' && !P.hasFilters()) return empty('check', 'Nothing needs review.', 'Calls with negative or mixed sentiment, a failed result or no outcome appear here.', '', 'empty--page');
    if (P.st.q && !Object.keys(P.st.f).length && !P.st.when) return empty('search-x', 'No calls match <span class="empty-query">“' + esc(P.st.q) + '”</span>.', 'Search covers lead names, the last digits of numbers, summaries and transcripts.', '<button type="button" class="btn" data-clear-search>Clear search</button>', 'empty--page');
    var R = NS.range(P.st.when), view = VIEWS.filter(function (v) { return v[0] === P.st.view && v[0] !== 'all'; })[0];
    var what = view ? view[1] : 'these filters', when = R ? (R.preset || R.days === 1 && !R.custom ? ' ' + (R.label === 'Today' ? 'today' : 'in the ' + R.words) : (R.days === 1 ? ' on ' : ' in ') + R.label) : '';
    return empty('list-filter', 'No calls match ' + esc(what + when) + '.', fmt.count(P.viewTotal) + ' calls are hidden by filters.', '<button type="button" class="btn" data-clear-filters>Clear filters</button>', 'empty--page');
  };
  NS.renderEmpty = function () {
    var html = NS.emptyState(), box = $('#cr-empty'), has = !!html;
    box.hidden = !has; box.innerHTML = html;
    $('#cr-dtwrap').hidden = has; $('#cr-list').hidden = has;
    var hideChrome = P.firstUse() || P.flag('forbidden') || P.flag('error');
    $('#cr-pager').hidden = hideChrome || (has && !P.flag('loading'));
    $('#cr-filters').hidden = $('#cr-search-form').hidden = $('#cr-count').hidden = P.firstUse() || P.flag('forbidden');
    $('#cr-views').hidden = P.flag('forbidden');
    $('#cr-tb').hidden = P.flag('forbidden') || P.firstUse();
    $('#cr-count').hidden = $('#cr-count').hidden || P.flag('error');
    ['#cr-refresh', '#cr-export-btn', '.ph-more'].forEach(function (s) { var el = $(s); if (el) el.hidden = P.flag('forbidden'); });
    $('#cr-work').classList.toggle('cr-work--state', has);
  };
  NS.renderNotice = function () {
    var n = $('#cr-notice'), cb = $('#cr-cbar');
    if (P.flag('refresh-error') && !P._retried) { n.hidden = false; n.innerHTML = '<div class="notice notice--warning" role="status">' + V.icon('triangle-alert') + '<span class="notice-body">Showing results from ' + esc(fmt.time(P.updatedAt)) + '. Couldn’t refresh.</span><span class="notice-acts"><button type="button" class="notice-act" data-retry>Retry</button></span></div>'; }
    else { n.hidden = true; n.innerHTML = ''; }
    if (P.offline()) { cb.hidden = false; cb.innerHTML = '<div class="cbar" role="status">' + V.icon('cloud-off') + '<span><b>You’re offline.</b> Showing data from ' + esc(fmt.time(P.updatedAt)) + '. Search, filters and paging come back when you reconnect.</span></div>'; }
    else { cb.hidden = true; cb.innerHTML = ''; }
  };
  NS.render = function () {
    NS.renderMeta(); NS.renderViews(); NS.renderStatus(); NS.renderToolbar && NS.renderToolbar();   /* the count first: the toolbar fit measures it */
    NS.renderNotice(); NS.renderEmpty(); NS.renderTable(); NS.renderPager();
    if (NS.sheetSync) NS.sheetSync();
  };
})(window, document);
