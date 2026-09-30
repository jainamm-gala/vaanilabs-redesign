/* Vaani Labs prototype · pages/knowledge-table.js — Knowledge sources: FilterBar, DataTable (≥768), ListRows (<768), pager,
   BulkBar, row ⋯ menu, delete (Undo or ConfirmDialog), the status simulator and in-place row updates (03-pages/05 §1.6, §1.12). */
(function (w, d) {
  'use strict';
  var K = w.VaaniKnowledge, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$, store = U.store;
  var T = K.table = {};
  var FIELDS = {
    type: { label: 'Type', opts: [['file', 'File'], ['text', 'Text'], ['web', 'Web page'], ['table', 'Table']] },
    status: { label: 'Status', opts: [['indexed', 'Indexed'], ['progress', 'Indexing'], ['queued', 'Queued'], ['failed', "Couldn’t index"]] },
    used: { label: 'Used by', opts: [] }
  };
  var ui = { q: '', f: { type: [], status: [], used: [] }, sort: 'updated:desc', page: 1, size: 50, cols: { type: true, by: false }, sel: {} };

  function usedOpts() {
    var seen = {}, out = [];
    K.sources.forEach(function (s) { var u = K.usedBy(s); u.direct.concat(u.all).forEach(function (f) { if (!seen[f.id]) { seen[f.id] = 1; out.push([f.id, f.name]); } }); });
    out.sort(function (a, b) { return a[1].localeCompare(b[1]); }); out.push(['none', 'Not used']); return out;
  }
  function statusGroup(s) { return K.isFailed(s) ? 'failed' : K.inProgress(s) ? 'progress' : s.status === 'queued' ? 'queued' : 'indexed'; }
  var SEVERITY = { failed: 0, progress: 1, queued: 2, indexed: 3 };
  T.filtered = function () {
    var q = ui.q.trim().toLowerCase(), f = ui.f;
    var list = K.sources.filter(function (s) {
      if (q && (s.title + ' ' + (s.fileName || '') + ' ' + (s.url || '')).toLowerCase().indexOf(q) < 0) return false;
      if (f.type.length && f.type.indexOf(s.kind === 'answers' ? 'text' : s.kind) < 0) return false;
      if (f.status.length && f.status.indexOf(statusGroup(s)) < 0) return false;
      if (f.used.length) { var u = K.usedBy(s), ids = u.direct.concat(u.all).map(function (x) { return x.id; }); if (!f.used.some(function (v) { return v === 'none' ? !ids.length : ids.indexOf(v) >= 0; })) return false; }
      return true;
    });
    var sp = ui.sort.split(':'), dir = sp[1] === 'asc' ? 1 : -1;
    list.sort(function (a, b) {
      if (sp[0] === 'title') return dir * a.title.localeCompare(b.title);
      if (sp[0] === 'status') return dir * (SEVERITY[statusGroup(a)] - SEVERITY[statusGroup(b)]) || a.title.localeCompare(b.title);
      return dir * (new Date(a.updatedAt) - new Date(b.updatedAt));
    });
    return list;
  };
  function activeFilterCount() { return ui.f.type.length + ui.f.status.length + ui.f.used.length; }
  function syncUrl() { K.url.set({ q: ui.q || null, 'f.type': ui.f.type, 'f.status': ui.f.status, 'f.usedBy': ui.f.used, sort: ui.sort === 'updated:desc' ? null : ui.sort, page: ui.page > 1 ? ui.page : null, size: ui.size !== 50 ? ui.size : null }); }
  T.setFilter = function (field, values) { ui.f[field] = values.slice(); ui.page = 1; syncUrl(); T.render(); };

  /* ---------- toolbar: tokens, count, filter popover ---------- */
  function renderTokens() {
    var box = $('#kn-filters'); $$('.ftoken, [data-kn-clear]', box).forEach(function (x) { x.remove(); });
    FIELDS.used.opts = usedOpts();
    ['type', 'status', 'used'].forEach(function (k) {
      if (!ui.f[k].length) return;
      var names = ui.f[k].map(function (v) { var o = FIELDS[k].opts.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : v; }).join(', ');
      box.insertAdjacentHTML('beforeend', '<span class="ftoken"><button class="ftoken-body" type="button" data-kn-edit-filter aria-label="' + esc(FIELDS[k].label + ' is ' + names + '. Edit filter') + '"><span class="ftoken-f">' + esc(FIELDS[k].label) + '</span><span class="ftoken-v">' + esc(names) + '</span></button><button class="ftoken-x" type="button" data-kn-rm="' + k + '" aria-label="Remove ' + esc(FIELDS[k].label) + ' filter">' + V.icon('x', 'sm') + '</button></span>');
    });
    if (activeFilterCount()) box.insertAdjacentHTML('beforeend', '<button class="btn btn--sm btn--tertiary" type="button" data-kn-clear>Clear</button>');
    var fb = $('#kn-filter-btn'); fb.innerHTML = V.icon('list-filter') + 'Filter' + (activeFilterCount() ? '<span class="fcount" aria-label="' + activeFilterCount() + ' active">' + activeFilterCount() + '</span>' : '');
  }
  function renderFilterBody() {
    FIELDS.used.opts = usedOpts();
    var n = T.filtered().length;
    $('#kn-filter-body').innerHTML = ['type', 'status', 'used'].map(function (k) {
      return '<fieldset class="fieldset"><legend>' + esc(FIELDS[k].label) + '</legend>' + FIELDS[k].opts.map(function (o) {
        return '<label class="check check--dense"><input type="checkbox" class="cb" data-kn-f="' + k + '" value="' + esc(o[0]) + '"' + (ui.f[k].indexOf(o[0]) >= 0 ? ' checked' : '') + '><span class="check-text">' + esc(o[1]) + '</span></label>';
      }).join('') + '</fieldset>';
    }).join('');
    $('#kn-filter-apply').textContent = 'Show ' + n + (n === 1 ? ' source' : ' sources');
  }

  /* ---------- cells ---------- */
  function srcCell(s, link) {
    return '<span class="kn-src">' + V.icon(K.kindIcon(s), 'md', { className: 'kn-src-ic' }) + '<span class="sr-only">' + esc(K.kindWord(s)) + ': </span>' +
      (link ? '<a href="?source=' + esc(s.id) + '" class="kn-src-name" translate="no" data-kn-open="' + esc(s.id) + '" data-tooltip-overflow>' + esc(s.title) + '</a>' : '<span class="kn-src-name" translate="no">' + esc(s.title) + '</span>') + '</span>';
  }
  function usedCell(s) {
    var n = K.usedBy(s).count;
    return n ? '<a href="?source=' + esc(s.id) + '&amp;tab=used-by" data-kn-open="' + esc(s.id) + '" data-kn-tab="used-by" data-tooltip="' + esc(K.usedTip(s)) + '">' + esc(K.usedLabel(s)) + '</a>' : '<span class="c-muted">Not used</span>';
  }
  function rowCells(s) {
    return {
      status: K.statusText(s),
      used: usedCell(s),
      upd: '<time datetime="' + esc(s.updatedAt) + '">' + esc(V.fmt.when(s.updatedAt)) + '</time>',
      type: esc(K.typeSize(s)),
      by: '<span class="kn-by">' + V.ui.avatar(s.by, { size: 20 }) + esc(s.by) + '</span>'
    };
  }
  function rowHtml(s) {
    var c = rowCells(s), sel = !!ui.sel[s.id];
    return '<tr data-id="' + esc(s.id) + '" aria-selected="' + sel + '">' +
      '<td class="c-sel kn-c-sel"><input type="checkbox" class="cb" data-select-row aria-label="Select ' + esc(s.title) + '"' + (sel ? ' checked' : '') + '></td>' +
      '<td class="c-key kn-c-src sticky-l">' + srcCell(s, true) + '</td>' +
      '<td class="kn-c-status" data-cell="status">' + c.status + '</td>' +
      '<td class="kn-c-used" data-cell="used">' + c.used + '</td>' +
      '<td class="kn-c-upd c-muted" data-cell="upd">' + c.upd + '</td>' +
      '<td class="kn-c-type c-muted" data-cell="type">' + c.type + '</td>' +
      '<td class="kn-c-by" data-cell="by">' + c.by + '</td>' +
      '<td class="c-act sticky-r"><button class="ibtn ibtn--sm" type="button" data-kn-menu="' + esc(s.id) + '" aria-label="More actions for ' + esc(s.title) + '" aria-haspopup="menu" aria-expanded="false">' + V.icon('ellipsis', 'sm') + '</button></td></tr>';
  }
  function listMeta(s) {
    var st = K.sentence(s), bits = [K.kindWord(s)];
    if (s.status === 'indexed') bits.push(V.fmt.count(s.passages || 0) + (s.kind === 'table' ? ' rows' : ' passages'));
    else if (K.isFailed(s)) bits.push(K.reason(s).short);
    else if (s.status === 'indexing' || s.status === 'uploading') bits.push((s.progress || 0) + '%');
    bits.push(V.fmt.when(s.updatedAt));
    return { tone: st.tone, text: bits.join(' · ') };
  }
  function liHtml(s) {
    var m = listMeta(s);
    return '<li data-id="' + esc(s.id) + '"><a class="li" href="?source=' + esc(s.id) + '" data-kn-open="' + esc(s.id) + '"><span class="li-title" translate="no">' + esc(s.title) + '</span>' + K.statusTag(s) +
      '<span class="li-meta' + (m.tone === 'danger' ? ' u-fg-danger' : '') + '">' + esc(m.text) + '</span></a></li>';
  }

  /* ---------- region states (§1.12) ---------- */
  function stepsHtml() { return '<ol class="kn-steps kn-steps--empty">' + K.howSteps().map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>'; }
  K.howSteps = function () {
    return ['Add sources: files, pasted text or a web page.', 'Each source is split into short passages (a paragraph, or one table row) and indexed. Most are ready in under a minute.',
      'On a call, a <b>Knowledge lookup</b> step searches your passages for the caller’s question. The agent answers from the best matches, and the call report shows which source it used.',
      'If nothing matches well enough, the step takes its <b>Not found</b> path.', 'Only this workspace’s sources are searched. Changes reach live calls as soon as indexing finishes.'];
  };
  function stateHtml(kind, n) {
    if (kind === 'first-use') return '<div class="empty empty--page kn-first">' + V.icon('book-open', 'lg') + '<h2 class="empty-title">Teach your agent what it can say</h2><p>Add documents your agent can quote on calls.</p><div class="empty-actions"><button class="btn" type="button" data-kn-upload' + (K.canAdd() && !K.offline ? '' : ' aria-disabled="true" data-tooltip="' + esc(K.canAdd() ? K.offlineReason : 'Only admins can add knowledge. Ask Anika R.') + '"') + '>' + V.icon('upload') + 'Upload files</button><button class="btn btn--link" type="button" data-kn-add-text>Paste text or add a web page</button></div>' + stepsHtml() + '</div>';
    if (kind === 'no-results') return '<div class="empty kn-empty">' + V.icon('search-x', 'lg') + '<h2 class="empty-title">No sources match <span class="empty-query">‘' + esc(ui.q) + '’</span>.</h2><p>Search looks at source names. To search inside sources, use Test a question.</p><div class="empty-actions"><button class="btn" type="button" data-kn-clear-q>Clear search</button></div></div>';
    if (kind === 'filtered') {
      var words = ['type', 'status', 'used'].filter(function (k) { return ui.f[k].length; }).map(function (k) { return FIELDS[k].label + ': ' + ui.f[k].map(function (v) { var o = FIELDS[k].opts.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : v; }).join(' or '); }).join(' and ');
      return '<div class="empty kn-empty">' + V.icon('list-filter', 'lg') + '<h2 class="empty-title">No sources match ' + esc(words) + '.</h2><p>' + n + ' sources are hidden by filters.</p><div class="empty-actions"><button class="btn" type="button" data-kn-clear>Clear filters</button></div></div>';
    }
    if (kind === 'error') return '<div class="notice notice--danger kn-load-err" role="alert">' + V.icon('circle-alert') + '<span class="notice-body">Couldn’t load sources. Check your connection and try again.</span><span class="notice-acts"><button type="button" class="notice-act" data-kn-retry>Retry</button></span></div>';
    return '';
  }
  function skeletonRows(n) {
    var r = ''; for (var i = 0; i < n; i++) r += '<tr class="kn-sk-row" aria-hidden="true"><td class="c-sel kn-c-sel"></td><td class="kn-c-src sticky-l"><span class="sk-line"><span class="sk kn-sk-w' + (i % 3) + '"></span></span></td><td class="kn-c-status"><span class="sk-line"><span class="sk kn-sk-w1"></span></span></td><td class="kn-c-used"><span class="sk-line"><span class="sk kn-sk-w2"></span></span></td><td class="kn-c-upd"><span class="sk-line"><span class="sk kn-sk-w2"></span></span></td><td class="kn-c-type"><span class="sk-line"><span class="sk kn-sk-w1"></span></span></td><td class="kn-c-by"></td><td class="c-act sticky-r"></td></tr>';
    return r;
  }

  /* ---------- render ---------- */
  T.render = function () {
    var tbody = $('#kn-tbody'), rows = $('#kn-rows'), region = $('#kn-region-state'), tb = $('#kn-tb'), table = $('#kn-table'), pager = $('#kn-pager');
    K.renderMeta(); K.renderNotice();
    var first = K.state !== 'loading' && K.state !== 'error' && !K.sources.length;
    tb.hidden = first || K.state === 'error'; $('#kn-dt-wrap').hidden = first; rows.hidden = first; region.innerHTML = '';
    table.setAttribute('aria-busy', K.state === 'loading' ? 'true' : 'false');
    applyCols();
    if (K.state === 'loading') {
      tbody.innerHTML = skeletonRows(8); rows.innerHTML = '<li class="kn-sk-li" aria-hidden="true"><span class="sk kn-sk-w0"></span><span class="sk sk--meta kn-sk-w2"></span></li>'.repeat(6);
      $('#kn-count').textContent = ''; pager.innerHTML = '<span role="status">Loading…</span>'; renderTokens(); return;
    }
    if (K.state === 'error') { tbody.innerHTML = '<tr class="dt-empty"><td colspan="8">' + stateHtml('error') + '</td></tr>'; rows.innerHTML = '<li class="kn-li-state">' + stateHtml('error') + '</li>'; pager.innerHTML = ''; $('#kn-count').textContent = ''; return; }
    if (first) { region.innerHTML = stateHtml('first-use'); pager.innerHTML = ''; hydrate(region); return; }
    renderTokens();
    var all = T.filtered(), pages = Math.max(1, Math.ceil(all.length / ui.size)); if (ui.page > pages) ui.page = pages;
    var slice = all.slice((ui.page - 1) * ui.size, ui.page * ui.size);
    $('#kn-count').innerHTML = all.length === K.sources.length ? '<b>' + V.fmt.count(all.length) + '</b> ' + (all.length === 1 ? 'source' : 'sources') : '<b>' + V.fmt.count(all.length) + '</b> of ' + V.fmt.count(K.sources.length);
    $('#kn-caption').textContent = 'Sources, sorted by ' + { updated: 'updated', title: 'name', status: 'status' }[ui.sort.split(':')[0]] + ', ' + (ui.sort.split(':')[1] === 'asc' ? (ui.sort.indexOf('updated') === 0 ? 'oldest first' : 'A to Z') : (ui.sort.indexOf('updated') === 0 ? 'newest first' : 'Z to A'));
    if (!all.length) {
      var kind = ui.q ? 'no-results' : 'filtered', html = stateHtml(kind, K.sources.length);
      tbody.innerHTML = '<tr class="dt-empty"><td colspan="8">' + html + '</td></tr>'; rows.innerHTML = '<li class="kn-li-state">' + html + '</li>';
    } else {
      tbody.innerHTML = slice.map(rowHtml).join(''); rows.innerHTML = slice.map(liHtml).join('');
      var trs = $$('tr', tbody); trs.forEach(function (r, i) { r.setAttribute('tabindex', i === 0 ? '0' : '-1'); });
    }
    var from = all.length ? (ui.page - 1) * ui.size + 1 : 0, to = Math.min(all.length, ui.page * ui.size);
    pager.innerHTML = '<span role="status">' + (all.length ? from + '–' + to + ' of ' + V.fmt.count(all.length) + ' sources' : 'No sources to show') + '</span><span class="pager-sp"></span>' +
      '<span class="kn-pager-size u-hide-phone"><span id="kn-size-l">Rows per page</span><button type="button" class="select select--sm select--auto" data-select aria-controls="kn-size-lb" aria-labelledby="kn-size-l kn-size-v"><span class="select-value" id="kn-size-v">' + ui.size + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="kn-size-lb" role="listbox" aria-labelledby="kn-size-l" hidden>' + [25, 50, 100].map(function (n) { return '<div class="option" role="option" data-value="' + n + '" aria-selected="' + (n === ui.size) + '"><span class="option-main"><span class="option-label">' + n + '</span></span></div>'; }).join('') + '</div></span>' +
      '<span>Page ' + ui.page + ' of ' + pages + '</span><span class="pager-btns"><button class="ibtn ibtn--sm" type="button" data-kn-page="-1" aria-label="Previous page"' + (ui.page <= 1 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-left', 'sm') + '</button><button class="ibtn ibtn--sm" type="button" data-kn-page="1" aria-label="Next page"' + (ui.page >= pages ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-right', 'sm') + '</button></span>';
    V.initAll(pager);
    $('#kn-size-v').parentNode.addEventListener('vaani:change', function (e) { ui.size = +e.detail.value; ui.page = 1; syncUrl(); T.render(); });
    V.table.syncSelection($('#kn-table'));
    hydrate(tbody); hydrate(rows);
    if (K.sheet && K.sheet.markRow) K.sheet.markRow();
    K.rove($('#kn-table'));
  };
  function hydrate(root) { if (w.VaaniIcon) w.VaaniIcon.hydrate(root); }
  function applyCols() { var t = $('#kn-col'); t.classList.toggle('kn-hide-type', !ui.cols.type); t.classList.toggle('kn-hide-by', !ui.cols.by); }

  /* In-place row update: status, used by and updated change without re-rendering the table (focus stays put) */
  T.updateRow = function (id) {
    var s = K.byId(id); if (!s) return;
    var tr = $('#kn-tbody tr[data-id="' + id + '"]');
    if (tr) { var c = rowCells(s); ['status', 'used', 'upd', 'type'].forEach(function (k) { var td = $('[data-cell="' + k + '"]', tr); if (td) { td.innerHTML = c[k]; hydrate(td); } }); var nm = $('.kn-src-name', tr); if (nm) nm.textContent = s.title; }
    var li = $('#kn-rows li[data-id="' + id + '"]'); if (li) { li.outerHTML = liHtml(s); hydrate($('#kn-rows')); }
    K.rove($('#kn-table'));
    K.renderMeta(); K.renderNotice();
    if (K.sheet && K.sheet.currentId() === id) K.sheet.render(id, null, true);
  };

  /* ---------- status simulator: walks a source through the §1.6 sentences, then announces the result ---------- */
  T.simulate = function (id, o) {
    o = o || {}; var s = K.byId(id); if (!s) return;
    var steps = [];
    if (o.upload) for (var p = 20; p <= 100; p += 40) steps.push({ status: 'uploading', progress: Math.min(p, 100) });
    if (o.queue) steps.push({ status: 'queued' });
    steps.push({ status: 'reading' });
    [25, 60, 90].forEach(function (p) { steps.push({ status: 'indexing', progress: p }); });
    steps.push(o.fail ? { status: 'failed', reason: o.fail } : { status: 'indexed', passages: o.passages || s.passages || 8 });
    var i = 0, delay = o.fast ? 450 : 900;
    (function next() {
      var cur = K.byId(id); if (!cur) return;
      var st = steps[i]; for (var k in st) cur[k] = st[k]; cur.updatedAt = V.fmt.now().toISOString(); if (st.status !== 'failed') delete cur.reason;
      T.updateRow(id); if (o.onStep) o.onStep(cur);
      i += 1;
      if (i < steps.length) setTimeout(next, delay);
      else { V.announce(cur.status === 'indexed' ? cur.title + ' indexed, ' + cur.passages + (cur.kind === 'table' ? ' rows.' : ' passages.') : cur.title + " couldn’t be indexed. " + K.reason(cur).sentence, { dedupeKey: 'kn-' + id }); if (o.onDone) o.onDone(cur); }
    })();
  };
  T.addSource = function (s) { K.sources.unshift(s); ui.page = 1; T.render(); };

  /* ---------- delete (O §3.1): unused → at once with Undo; used → ConfirmDialog naming each flow ---------- */
  T.remove = function (ids, returnTo) {
    var list = ids.map(K.byId).filter(Boolean); if (!list.length) return;
    var used = list.filter(function (s) { return K.usedBy(s).count; });
    function doIt() {
      var snapshot = K.sources.slice();
      K.sources = K.sources.filter(function (s) { return ids.indexOf(s.id) < 0; });
      ids.forEach(function (id) { delete ui.sel[id]; });
      if (K.sheet && ids.indexOf(K.sheet.currentId()) >= 0) V.drawer.close('kn-source', 'deleted');
      T.render();
      var name = list.length === 1 ? '‘' + list[0].title + '’' : list.length + ' sources';
      if (!used.length) V.toast.undo('Deleted ' + name + '.', { action: { label: 'Undo', onClick: function () { K.sources = snapshot; T.render(); V.announce('Restored ' + name + '.');
        /* R3D-05: focus goes to the restored row, as in Leads, never <body> */
        setTimeout(function () { var r = $('#kn-tbody tr[data-id="' + ids[0] + '"]') || $('#kn-tbody tr') || $('#kn-list li[data-id="' + ids[0] + '"] a'); if (r) { if (!r.hasAttribute('tabindex')) r.setAttribute('tabindex', '-1'); r.focus(); } }, 0); } } });
      else { var flows = []; used.forEach(function (s) { s.direct.forEach(function (f) { if (flows.indexOf(f.name) < 0) flows.push(f.name); }); }); V.toast.success('Deleted ' + name + '.' + (flows.length ? ' ' + flows[0] + (flows.length > 1 ? ' and ' + (flows.length - 1) + ' more flows need' : ' needs') + ' a new source before the next publish.' : '')); }
      var f = $('#kn-tbody tr[tabindex="0"]') || $('#kn-search'); if (f && returnTo && !d.contains(returnTo)) f.focus();
    }
    if (!used.length) { doIt(); return; }
    var title = list.length === 1 ? 'Delete ‘' + list[0].title + '’?' : 'Delete ' + list.length + ' sources?';
    var passages = list.reduce(function (n, s) { return n + (s.status === 'indexed' ? s.passages || 0 : 0); }, 0), direct = [];
    used.forEach(function (s) { s.direct.forEach(function (f) { if (!direct.some(function (x) { return x.id === f.id; })) direct.push(f); }); });
    var all = K.data.allSources, body = 'Live calls stop finding ' + (list.length === 1 ? 'its ' : 'their ') + V.fmt.count(passages) + ' passages as soon as you delete ' + (list.length === 1 ? 'it' : 'them') + '. ';
    body += direct.map(function (f) { return f.name + ' (' + K.flowState(f) + ') looks it up in step ' + f.step; }).join(', ');
    if (used.some(function (s) { return K.usedBy(s).all.length; })) body += (direct.length ? ', and ' : '') + all.length + ' flows look up all sources';
    body += '. Call reports that quoted ' + (list.length === 1 ? 'it' : 'them') + ' are kept.';
    V.dialog.confirm({ title: title, body: body, confirmLabel: list.length === 1 ? 'Delete source' : 'Delete ' + list.length + ' sources', tone: 'danger', returnTo: returnTo }).then(function (ok) { if (ok) doIt(); });
  };

  /* ---------- row ⋯ menu (§1.6): the fix first on a failed row, Delete last after a separator ---------- */
  function mi(act, label, icon, o) { o = o || {}; return '<button class="menu-item' + (o.danger ? ' menu-item--danger' : '') + '" role="menuitem" type="button" data-value="' + act + '">' + V.icon(icon) + '<span class="menu-text"><span>' + esc(label) + '</span></span></button>'; }
  T.menuHtml = function (s) {
    var html = '', failed = K.isFailed(s), canDelete = K.role !== 'viewer' && (K.canDeleteUsed() || !K.usedBy(s).count);
    if (failed) { html += K.fixes(s).filter(function (f) { return f.act !== 'delete'; }).map(function (f, i) { return mi(f.act, i === 0 && f.act === 'retry' ? 'Retry indexing ' + s.title : f.label, f.icon); }).join(''); html += '<div class="menu-sep" role="separator"></div>'; }
    if (!failed) html += mi('test', 'Test with this source', 'search');
    if (K.canAdd()) {
      html += mi('rename', 'Rename…', 'pencil');
      if (s.kind === 'web') html += mi('refetch', 'Re-fetch page', 'refresh-cw'); else if (s.kind === 'text' || s.kind === 'answers') html += mi('edit', 'Edit text…', 'square-pen'); else if (!failed) html += mi('replace', 'Replace file…', 'upload');
      if (failed) html += mi('reindex', 'Re-index', 'rotate-cw');
    }
    if (s.kind === 'file' || s.kind === 'table') html += mi('download', 'Download original', 'download');
    html += mi('copy', 'Copy source id', 'copy');
    if (canDelete) html += '<div class="menu-sep" role="separator"></div>' + mi('delete', 'Delete source…', 'trash-2', { danger: true });
    return html;
  };
  var fileInput = null, replaceFor = null;
  function pickReplacement(id) {
    replaceFor = id;
    if (!fileInput) { fileInput = d.createElement('input'); fileInput.type = 'file'; fileInput.accept = '.pdf,.docx,.txt,.csv'; fileInput.hidden = true; fileInput.setAttribute('aria-label', 'Replacement file'); d.body.appendChild(fileInput);
      fileInput.addEventListener('change', function () { var f = fileInput.files && fileInput.files[0], s = K.byId(replaceFor); if (!f || !s) return; s.fileName = f.name; s.size = f.size; delete s.reason; T.simulate(s.id, { upload: true, passages: 14 }); fileInput.value = ''; }); }
    fileInput.click();
  }
  T.act = function (act, id, trigger) {
    var s = K.byId(id); if (!s) return;
    if (act === 'test') { if (K.test) K.test.setScope(id); K.dock.open(true); }
    else if (act === 'rename') T.rename(id, trigger);
    else if (act === 'replace') pickReplacement(id);
    else if (act === 'paste') K.add.open('text', { entry: 'fix', title: s.title, returnTo: trigger });
    else if (act === 'address') K.add.open('web', { entry: 'fix', url: s.url, title: s.title, returnTo: trigger });
    else if (act === 'retry' || act === 'reindex') T.simulate(id, { queue: true, fail: s.reason === 'encrypted' ? 'encrypted' : null, passages: 12 });
    else if (act === 'refetch') T.simulate(id, { fast: true, passages: s.passages || 9 });
    else if (act === 'edit') V.toast.info('Editing pasted text opens its editor in the product. Not wired in this prototype.');
    else if (act === 'download') V.toast.info('The original file downloads in the product. This prototype has no files.');
    else if (act === 'copy') { try { navigator.clipboard.writeText(id); } catch (e) { /* clipboard blocked */ } V.toast.success('Copied source id ' + id + '.'); }
    else if (act === 'delete') T.remove([id], trigger);
  };
  T.rename = function (id, trigger) {
    var s = K.byId(id), dl = $('#kn-rename-dlg'), inp = $('#kn-rename-in'), err = $('#kn-rename-e'); if (!s) return;
    inp.value = s.title; err.hidden = true; inp.removeAttribute('aria-invalid');
    V.dialog.open(dl, { returnTo: trigger });
    $('#kn-rename-ok').onclick = function () {
      var v = inp.value.trim();
      if (!v) { err.innerHTML = V.icon('circle-alert', 'sm') + 'Enter a title.'; err.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
      s.title = v; V.dialog.close(dl, 'confirm'); T.updateRow(id); V.toast.success('Renamed to ‘' + v + '’.');
    };
    inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#kn-rename-ok').click(); } };
  };

  /* ---------- BulkBar ---------- */
  function renderBulk(count) {
    var bar = $('#kn-bulk'); if (!count) { bar.hidden = true; bar.innerHTML = ''; return; }
    var ids = Object.keys(ui.sel), anyFailed = ids.some(function (id) { var s = K.byId(id); return s && K.isFailed(s); });
    bar.setAttribute('aria-label', count + (count === 1 ? ' source selected' : ' sources selected'));
    bar.innerHTML = '<span class="bulk-count">' + count + ' selected</span>' + (anyFailed && K.canAdd() ? '<button class="btn btn--sm btn--tertiary" type="button" data-kn-bulk="reindex">' + V.icon('rotate-cw', 'sm') + 'Re-index</button>' : '') +
      (K.role !== 'viewer' ? '<button class="ibtn ibtn--sm" type="button" aria-label="More bulk actions" aria-haspopup="menu" aria-controls="kn-bulk-menu" aria-expanded="false">' + V.icon('ellipsis', 'sm') + '</button>' : '') +
      '<button class="ibtn ibtn--sm" type="button" data-kn-bulk="clear" aria-label="Clear selection">' + V.icon('x', 'sm') + '</button>';
    $('#kn-bulk-menu').innerHTML = mi('delete', 'Delete ' + count + (count === 1 ? ' source…' : ' sources…'), 'trash-2', { danger: true });
    bar.hidden = false;
  }

  /* ---------- init ---------- */
  T.init = function () {
    ui.q = K.url.get('q') || ''; ui.f.type = K.url.list('f.type'); ui.f.status = K.url.list('f.status'); ui.f.used = K.url.list('f.usedBy');
    ui.sort = K.url.get('sort') || 'updated:desc'; ui.page = +(K.url.get('page') || 1); ui.size = [25, 50, 100].indexOf(+K.url.get('size')) >= 0 ? +K.url.get('size') : 50;
    try { var c = JSON.parse(store.get('vaani:knowledge:cols') || 'null'); if (c) ui.cols = c; } catch (e) { /* keep defaults */ }
    $$('#kn-cols-menu [data-col-toggle]').forEach(function (b) { b.setAttribute('aria-checked', ui.cols[b.getAttribute('data-col-toggle')] ? 'true' : 'false'); });
    var dens = V.density.get('knowledge'); $('#kn-table').setAttribute('data-density', dens);
    $$('.kn-density [role="radio"]').forEach(function (r) { var on = r.getAttribute('data-value') === dens; r.setAttribute('aria-checked', on); r.setAttribute('tabindex', on ? '0' : '-1'); });
    var search = $('#kn-search'); search.value = ui.q;
    var t = null;
    search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { ui.q = search.value; ui.page = 1; syncUrl(); T.render(); V.announce(T.filtered().length + ' sources', { dedupeKey: 'kn-count' }); }, 200); });
    search.addEventListener('keydown', function (e) { if (e.key === 'Escape' && search.value) { e.preventDefault(); e.stopPropagation(); search.value = ''; ui.q = ''; syncUrl(); T.render(); } });
    $('#kn-search-form').addEventListener('submit', function (e) { e.preventDefault(); });
    /* sort: the shared table flips aria-sort; the page re-orders its rows */
    var sortTh = $('th[aria-sort="descending"]', $('#kn-table')), sp = ui.sort.split(':');
    $$('#kn-table th[data-col]').forEach(function (th) { var on = th.getAttribute('data-col') === sp[0]; th.setAttribute('aria-sort', on ? (sp[1] === 'asc' ? 'ascending' : 'descending') : 'none'); });
    void sortTh;
    $('#kn-table').addEventListener('vaani:sort', function (e) { ui.sort = e.detail.column + ':' + (e.detail.direction === 'ascending' ? 'asc' : 'desc'); ui.page = 1; syncUrl(); T.render(); });
    $('#kn-table').addEventListener('vaani:selection', function (e) { ui.sel = {}; e.detail.rows.forEach(function (r) { ui.sel[r.getAttribute('data-id')] = true; }); renderBulk(e.detail.count); });
    $('#kn-filter-pop').addEventListener('vaani:open', renderFilterBody);
    $('#kn-filter-body').addEventListener('change', function (e) { var cb = e.target.closest('[data-kn-f]'); if (!cb) return; var k = cb.getAttribute('data-kn-f'); ui.f[k] = $$('[data-kn-f="' + k + '"]:checked').map(function (x) { return x.value; }); ui.page = 1; syncUrl(); T.render(); var n = T.filtered().length; $('#kn-filter-apply').textContent = 'Show ' + n + (n === 1 ? ' source' : ' sources'); });
    $('#kn-filter-clear').addEventListener('click', function () { ui.f = { type: [], status: [], used: [] }; syncUrl(); T.render(); renderFilterBody(); });
    $('#kn-cols-menu').addEventListener('vaani:menuselect', function (e) { var k = e.detail.item.getAttribute('data-col-toggle'); ui.cols[k] = e.detail.checked; store.set('vaani:knowledge:cols', JSON.stringify(ui.cols)); applyCols(); });
    $('#kn-row-menu').addEventListener('vaani:menuselect', function (e) { var id = T.menuFor, tr = T.menuTrigger; setTimeout(function () { T.act(e.detail.value, id, tr); }, 0); });
    $('#kn-bulk-menu').addEventListener('vaani:menuselect', function (e) { if (e.detail.value === 'delete') setTimeout(function () { T.remove(Object.keys(ui.sel), $('#kn-search')); }, 0); });
    d.addEventListener('click', function (e) {
      var m = e.target.closest('[data-kn-menu]');
      if (m) { e.preventDefault(); e.stopPropagation(); var s = K.byId(m.getAttribute('data-kn-menu')); if (!s) return; T.menuFor = s.id; T.menuTrigger = m; $('#kn-row-menu').innerHTML = T.menuHtml(s); $('#kn-row-menu').setAttribute('aria-label', 'Actions for ' + s.title); if (m.getAttribute('aria-expanded') === 'true') V.menu.close(); else V.menu.open(m, 'kn-row-menu'); return; }
      var o = e.target.closest('[data-kn-open]');
      if (o && !e.metaKey && !e.ctrlKey) { e.preventDefault(); T.openSource(o.getAttribute('data-kn-open'), o.getAttribute('data-kn-tab') || 'overview', { returnTo: o.closest('tr') || o }); return; }
      if (e.target.closest('[data-kn-rm]')) { var k = e.target.closest('[data-kn-rm]').getAttribute('data-kn-rm'); T.setFilter(k, []); $('#kn-filter-btn').focus(); return; }
      if (e.target.closest('[data-kn-clear]')) { ui.f = { type: [], status: [], used: [] }; ui.page = 1; syncUrl(); T.render(); $('#kn-filter-btn').focus(); return; }
      if (e.target.closest('[data-kn-edit-filter]')) { V.popover.open($('#kn-filter-btn'), 'kn-filter-pop'); return; }
      if (e.target.closest('[data-kn-clear-q]')) { ui.q = ''; $('#kn-search').value = ''; syncUrl(); T.render(); $('#kn-search').focus(); return; }
      if (e.target.closest('[data-kn-upload]')) { if (e.target.closest('[data-kn-upload]').getAttribute('aria-disabled') !== 'true') K.add.open('files', { entry: 'empty', returnTo: e.target.closest('[data-kn-upload]') }); return; }
      if (e.target.closest('[data-kn-add-text]')) { if (K.canAdd() && !K.offline) K.add.open('text', { entry: 'empty', returnTo: e.target.closest('[data-kn-add-text]') }); return; }
      var pg = e.target.closest('[data-kn-page]'); if (pg && pg.getAttribute('aria-disabled') !== 'true') { ui.page += +pg.getAttribute('data-kn-page'); syncUrl(); T.render(); return; }
      var b = e.target.closest('[data-kn-bulk]');
      if (b) { var a = b.getAttribute('data-kn-bulk'); if (a === 'clear') { ui.sel = {}; $$('#kn-tbody [data-select-row]').forEach(function (x) { x.checked = false; }); V.table.syncSelection($('#kn-table')); $('#kn-search').focus(); } if (a === 'reindex') { Object.keys(ui.sel).forEach(function (id) { var s2 = K.byId(id); if (s2 && K.isFailed(s2)) T.act('reindex', id); }); } }
    });
    /* With a sheet open, the sheet follows row focus (↑ ↓ J K) without taking focus from the table */
    $('#kn-tbody').addEventListener('focusin', function (e) { var tr = e.target.closest('tr[data-id]'); if (tr && e.target === tr && K.sheet && V.drawer.isOpen('kn-source')) K.sheet.follow(tr.getAttribute('data-id'), tr); });
    V.shortcuts.register('shift+d', function () { var next = V.density.get('knowledge') === 'compact' ? 'standard' : 'compact'; var r = $('.kn-density [data-value="' + next + '"]'); if (r) V.seg.select(r, false); V.announce(next === 'compact' ? 'Compact rows' : 'Standard rows'); }, { description: 'Standard or compact rows', group: 'Lists and tables', scope: 'kn-table' });
    V.shortcuts.register('f6', function () { var h = $('#kn-test-t'); h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus(); }, { description: 'Next region', when: function () { var t = $('#kn-test'); return t && !t.hidden && t.classList.contains('is-docked') && K.dock.mode() === 'dock' && $('#kn-col').contains(d.activeElement); } });
    V.shortcuts.register('shift+f6', function () { var r = $('#kn-tbody tr[tabindex="0"]') || $('#kn-search'); r.focus(); }, { description: 'Previous region', when: function () { var t = $('#kn-test'); return t && !t.hidden && t.contains(d.activeElement); } });
    T.render();
  };
})(window, document);
