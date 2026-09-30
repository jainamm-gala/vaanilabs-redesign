/* Vaani Labs prototype · pages/leads-filters.js — FilterBar (data-nav §6, 03 §6.5): Filter menu, value pickers,
   FilterTokens, Clear, the toolbar count and its totals popover (the direction’s replacement for the ViewSummary band),
   ColumnsMenu, saved views (§6.4) and the phone Sort sheet (§5.5). */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, L = w.VaaniLeads, S = L.S;

  var DATES = { today: 'Today', yesterday: 'Yesterday', '7d': 'Last 7 days', '30d': 'Last 30 days', month: 'This month', never: 'Never called' };
  L.FIELDS = [
    { id: 'status', label: 'Status', kind: 'enum', icon: 'circle-dot', options: function () { return L.STATUS_ORDER.filter(function (s) { return !(s === 'callback_due' && L.capOff('B5')); }).map(function (s) { return [s, V.statusDef('lead', s)[0]]; }); } },
    { id: 'source', label: 'Source', kind: 'enum', icon: 'inbox', options: function () { return L.SOURCES.map(function (s) { return [s, s]; }); } },
    { id: 'language', label: 'Language', kind: 'enum', icon: 'globe', cap: 'B3', options: function () { return V.data.languages.filter(function (x) { return L.all.some(function (l) { return l.language === x.code; }); }).map(function (x) { return [x.code, x.name, x]; }).concat([['none', 'Not set']]); } },
    { id: 'outcome', label: 'Last call outcome', kind: 'enum', icon: 'phone', cap: 'B4', options: function () { return L.RESULTS.map(function (r) { return ['r:' + r, V.statusDef('callResult', r)[0], null, 'Result']; }).concat(L.OUTCOMES.map(function (o) { return ['o:' + o, o, null, 'Outcome']; })); } },
    { id: 'last_called', label: 'Last called', kind: 'date', icon: 'calendar', presets: ['today', 'yesterday', '7d', '30d', 'month', 'never'] },
    { id: 'callback', label: 'Callback', kind: 'date', icon: 'clock', cap: 'B5', presets: ['overdue', 'today', '7d'], words: { overdue: 'Overdue', today: 'Today', '7d': 'Next 7 days' } },
    { id: 'interest', label: 'Interest', kind: 'number', icon: 'trending-up' },
    { id: 'flow', label: 'Flow', kind: 'enum', icon: 'workflow', options: function () { return [['default', 'Workspace default']].concat((V.data.flows || []).filter(function (f) { return f.live && f.status === 'live'; }).map(function (f) { return [f.id, f.name, null, null, 'Live v' + f.live.version]; })); } },
    { id: 'owner', label: 'Owner', kind: 'enum', icon: 'user', options: function () { return ['Anika R.', 'Rohit S.', 'Dev M.', 'Farah K.', 'Kiran P.'].map(function (o) { return [o, o]; }).concat([['none', 'Unassigned']]); } },
    { id: 'city', label: 'City', kind: 'text', icon: 'map-pin' },
    { id: 'created', label: 'Created', kind: 'date', icon: 'calendar-plus', presets: ['today', 'yesterday', '7d', '30d', 'month'] },
    { id: 'imported', label: 'Imported from', kind: 'enum', icon: 'upload', options: function () { return L.IMPORTS.map(function (i) { return [i.file, i.file + ' · ' + F.dateShort(i.at)]; }); } }
  ];
  L.field = function (id) { return L.FIELDS.filter(function (f) { return f.id === id; })[0]; };
  function fieldsAvail() { return L.FIELDS.filter(function (f) { return !(f.cap && L.capOff(f.cap)); }); }

  /* token words: "Language is Hindi or English", values "Hindi, English", two values then "+2" */
  function valueWords(f, v, all) {
    if (f.kind === 'enum') { var o = f.options(), names = v.values.map(function (x) { var m = o.filter(function (p) { return p[0] === x; })[0]; return m ? m[1].split(' · ')[0] : x; }); return all ? names : names.slice(0, 2).join(', ') + (names.length > 2 ? ' +' + (names.length - 2) : ''); }
    if (f.kind === 'date') { if (/^range:/.test(v.value)) { var p = v.value.split(':'); return F.dateShort(p[1] + 'T00:00:00+05:30') + ' to ' + F.dateShort(p[2] + 'T00:00:00+05:30'); } return (f.words || DATES)[v.value] || v.value; }
    if (f.kind === 'number') return (v.min == null ? 0 : v.min) + ' to ' + (v.max == null ? 100 : v.max) + (v.ns ? ' or not scored' : '');
    return v.text;
  }
  function sentence(f, v) { var vals = valueWords(f, v, true); return f.label + (v.not ? (f.kind === 'text' ? ' does not contain ' : ' is not ') : (f.kind === 'text' ? ' contains ' : f.kind === 'enum' ? ' is ' : ' ')) + (Array.isArray(vals) ? vals.join(' or ') : vals); }
  L.filterWords = function () { var parts = Object.keys(S.filters).map(function (k) { return sentence(L.field(k), S.filters[k]); }); if (S.q.trim()) parts.unshift('‘' + S.q.trim() + '’'); return parts.join(' and '); };
  L.viewEdited = function (v) { return JSON.stringify(v.filters || {}) !== JSON.stringify(S.filters) || (v.q || '') !== S.q || JSON.stringify(v.sortSaved || null) !== JSON.stringify(S.sort); };

  /* ---------- tokens, Clear, view edits, Filter count ---------- */
  function tokenHtml(k) {
    var f = L.field(k), v = S.filters[k];
    return '<span class="ftoken" data-token="' + k + '"><button class="ftoken-body" type="button" data-token-body="' + k + '" aria-haspopup="dialog" aria-label="' + esc(sentence(f, v)) + '. Edit filter"><span class="ftoken-f">' + esc(f.label) + (v.not ? ' not' : '') + '</span><span class="ftoken-v">' + esc(valueWords(f, v)) + '</span></button><button class="ftoken-x" type="button" data-token-x="' + k + '" aria-label="Remove ' + esc(f.label) + ' filter">' + V.icon('x', 'sm') + '</button></span>';
  }
  /* FilterBar widths (data-nav §6.7, 05-responsive §5.3): phones show every token in the scrolling row; 768–1023 folds
     them into the Filter button’s count; ≥ 1024 shows up to 3 inline (2 below 1280) and the rest behind "+n filters". */
  function inlineLimit() { var W = w.innerWidth; return W < 768 ? 99 : W < 1024 ? 0 : W < 1280 ? 2 : 3; }
  /* Applied filters are always visible: at ≥ 1024 every token that is not inline sits behind "+n filters" (even when
     the row has room for none), and the Filter button carries the count wherever no token shows inline (always below
     1024, and at ≥ 1024 once a docked sheet leaves no room for one). */
  var tokEntry = null, tokWasOpen = false;
  function drawTokens(keys, lim) {
    var desk = w.innerWidth >= 1024, inl = keys.slice(0, lim), more = desk ? keys.length - inl.length : 0, fk = focusKey();
    $('#leads-tokens').innerHTML = inl.map(tokenHtml).join('') + (more > 0 ? '<button class="btn btn--sm" type="button" id="leads-moretok" aria-haspopup="dialog" aria-controls="leads-tokens-pop" aria-expanded="' + !!tokEntry + '" aria-label="+' + more + ' filter' + (more === 1 ? '' : 's') + ': ' + esc(keys.slice(lim).map(function (k) { return L.field(k).label; }).join(', ')) + '">+' + more + ' filter' + (more === 1 ? '' : 's') + '</button>' : '');
    var fc = $('#leads-fcount'); fc.textContent = keys.length; fc.hidden = !keys.length || (desk && inl.length > 0 && !sheetOver());
    if (tokEntry) tokEntry.returnTo = tokTrigger();
    restoreFocus(fk);
  }
  function tokTrigger() { var m = $('#leads-moretok'); return m && U.visible(m) ? m : $('#leads-filter-btn'); }
  /* Re-fitting replaces the token buttons: keep keyboard focus on the same control, or the next sensible one. */
  function focusKey() {
    var a = d.activeElement; if (!a || !a.closest || !a.closest('#leads-tokens')) return null;
    return a.id === 'leads-moretok' ? '#leads-moretok' : a.hasAttribute('data-token-body') ? '[data-token-body="' + a.getAttribute('data-token-body') + '"]' : a.hasAttribute('data-token-x') ? '[data-token-x="' + a.getAttribute('data-token-x') + '"]' : '#leads-moretok';
  }
  function restoreFocus(key) { if (!key) return; var n = $('#leads-tokens ' + key) || $('#leads-moretok') || $('#leads-tokens [data-token-body]'); (n && U.visible(n) ? n : $('#leads-filter-btn')).focus({ preventScroll: true }); }
  /* One toolbar row at ≥ 768 (§5.0 budget; a docked sheet narrows the column): if it wraps, fold density first, then
     tokens one by one into "+n filters", down to none inline. Only a row that still wraps with every token folded may
     wrap (the bar is flex-wrap by spec), and it still shows "+n filters" and the count. */
  function wraps(tb) {
    var r = [].slice.call(tb.children).filter(function (c) { return c.offsetWidth && c.offsetHeight; }).map(   /* not the empty spacer */function (c) { return c.getBoundingClientRect(); });
    return r.length > 1 && Math.max.apply(null, r.map(function (x) { return x.top; })) >= Math.min.apply(null, r.map(function (x) { return x.bottom; }));
  }
  /* R3D-02: an overlay lead sheet (1024–1439) covers the right of the row. The row then lays out in the width the sheet
     leaves (padding on its end), so tokens fold into "+n filters" and Clear and the count stay in view; the Filter button
     keeps the count while any sheet is open. */
  function sheetOver() { var sh = $('#lead-sheet'); return !!(sh && !sh.hidden && sh.offsetWidth && w.innerWidth >= 1024); }
  function sheetInset(tb) {
    tb.style.paddingInlineEnd = '';
    if (!sheetOver()) return;
    var sr = $('#lead-sheet').getBoundingClientRect(), tr = tb.getBoundingClientRect();
    var cover = Math.round(tr.right - sr.left);
    if (cover > 0 && cover < tr.width) tb.style.paddingInlineEnd = 'calc(' + cover + 'px + var(--space-12))';
  }
  function fitToolbar() {
    var tb = $('#leads-tb'), keys = Object.keys(S.filters), lim = Math.min(inlineLimit(), keys.length);
    if (!tb) return; sheetInset(tb); tb.classList.remove('leads-tb--nodensity'); drawTokens(keys, lim);
    if (w.innerWidth < 768 || tb.hidden || !tb.offsetWidth || !wraps(tb)) return;
    tb.classList.add('leads-tb--nodensity');
    while (lim > 0 && wraps(tb)) { lim -= 1; drawTokens(keys, lim); }
  }
  L.renderFilters = function (q) { draw(q); fitToolbar(); };
  function draw(q) {
    var keys = Object.keys(S.filters);
    $('#leads-filter-btn').setAttribute('aria-label', 'Filter' + (keys.length ? ', ' + keys.length + ' active' : ''));
    $('#leads-clear').hidden = !L.hasNarrowing();
    var uv = L.viewDef(S.view), ed = uv.user && L.viewEdited(uv); $('#leads-view-save').hidden = !ed; $('#leads-view-reset').hidden = !ed;
    var s = L.curSort(), c = L.col(s[0]); $('#leads-sort-v').textContent = c ? c.label : 'Sort';
    $('#leads-sort-btn').setAttribute('aria-label', 'Sort: ' + L.sortWords(s));
    renderSummary(q);
  }
  function removeToken(k, focusNext) {
    var keys = Object.keys(S.filters), i = keys.indexOf(k); L.setFilter(k, null); V.announce(L.field(k).label + ' filter removed', { dedupeKey: 'tok' });
    if (focusNext) { var nk = Object.keys(S.filters)[i] || Object.keys(S.filters)[i - 1]; var t = nk && $('[data-token-body="' + nk + '"]'); (t && U.visible(t) ? t : $('#leads-filter-btn')).focus(); }
  }

  /* ---------- the totals popover behind the toolbar count (one fact, one place: no "In this view" band) ---------- */
  function renderSummary(q) {
    var st = L.statsOf(q.rows), narrowed = S.view !== 'all' || L.hasNarrowing(), pct = st.leads ? Math.round(st.reached / st.leads * 100) : 0;
    $('#leads-sum-t').textContent = narrowed ? 'In this view' : 'All leads';
    var scope = [L.viewDef(S.view).label + ' view'].concat(L.hasNarrowing() ? [L.filterWords()] : []).join(' · ');
    var row = function (k, v, tip) { return '<div class="kv-row"><dt>' + esc(k) + '</dt><dd class="num">' + v + (tip ? ' <span class="kv-src">' + esc(tip) + '</span>' : '') + '</dd></div>'; };
    $('#leads-sum-body').innerHTML = '<p class="type-meta-12 u-fg-3">' + esc(scope) + '</p><dl class="kv kv--rows">' +
      row('Leads', F.count(st.leads)) + row('Open', F.count(st.open)) + row('Reached', F.count(st.reached) + ' (' + pct + '%)') + row('Interested', F.count(st.interested)) +
      (L.statsOf(L.all).converted ? row('Converted', F.count(st.converted)) : '') + row('Average interest', st.avg == null ? 'interest not scored yet' : String(st.avg), st.avg == null ? '' : 'across ' + F.count(st.scored) + ' scored') + '</dl>' +
      '<details class="details"><summary>What these mean</summary><p class="type-meta-12 u-fg-3 u-mt-8">Open: not Converted, Not interested or Do not call. Reached: at least one connected conversation; test calls don’t count. Average interest: the mean score of leads that have one. Totals cover every page, never just the rows loaded.</p></details>';
  }

  /* ---------- value pickers (data-nav §6.3) ---------- */
  var pk = { field: null, entry: null, trigger: null };
  function facet(fid, value) { var f = Object.assign({}, S.filters); delete f[fid]; var v = L.viewDef(S.view), t = L.viewTest(v); return L.all.filter(function (l) { return !l.deleted && t(l) && L.matchQ(l, S.q) && L.matchF(l, f); }).filter(function (l) { var o = {}; o[fid] = { values: [value], value: value }; return L.matchF(l, o); }).length; }
  function pickerBody(f) {
    var v = S.filters[f.id] || {}, id = 'lp-' + f.id, h = '';
    if (f.kind === 'enum' || f.kind === 'text') h += '<div class="seg seg--sm seg--full" role="radiogroup" aria-label="Match" id="' + id + '-op"><button type="button" role="radio" aria-checked="' + !v.not + '" data-value="is">' + (f.kind === 'text' ? 'Contains' : 'Is') + '</button><button type="button" role="radio" aria-checked="' + !!v.not + '" data-value="not">' + (f.kind === 'text' ? 'Doesn’t contain' : 'Is not') + '</button></div>';
    if (f.kind === 'enum') {
      var opts = f.options(), group = null, sel = v.values || [];
      if (opts.length > 8) h += '<div class="input input--sm"><i data-icon="search"></i><input type="search" id="' + id + '-find" aria-label="Find a ' + esc(f.label.toLowerCase()) + '" placeholder="Find…" autocomplete="off"></div>';
      h += '<div class="leads-pick-list" role="group" aria-label="' + esc(f.label) + '">' + opts.map(function (o) {
        var gh = o[3] && o[3] !== group ? '<span class="menu-group-label">' + esc(group = o[3]) + '</span>' : '';
        return gh + '<label class="check check--dense leads-pick-row" data-find="' + esc(o[1].toLowerCase()) + '"><input type="checkbox" class="cb" value="' + esc(o[0]) + '"' + (sel.indexOf(o[0]) >= 0 ? ' checked' : '') + '><span class="check-text"><span>' + (o[2] ? '<span class="lm-g" lang="' + esc(o[2].lang) + '" aria-hidden="true">' + esc(o[2].glyph) + '</span> ' : '') + esc(o[1]) + (o[4] ? ' <span class="tag tag--success">' + esc(o[4]) + '</span>' : '') + '</span></span><span class="u-fg-3 num type-meta-12 u-ml-auto">' + F.count(facet(f.id, o[0])) + '</span></label>';
      }).join('') + '</div>';
    } else if (f.kind === 'date') {
      var rg = /^range:/.test(v.value || '') ? v.value.split(':') : null;
      h += '<fieldset class="fieldset"><legend class="sr-only">' + esc(f.label) + '</legend>' + f.presets.map(function (p) { return '<label class="check check--dense"><input type="radio" class="radio" name="' + id + '" value="' + p + '"' + (v.value === p ? ' checked' : '') + '><span class="check-text"><span>' + esc((f.words || DATES)[p]) + '</span></span><span class="u-fg-3 num type-meta-12 u-ml-auto">' + F.count(facet(f.id, p)) + '</span></label>'; }).join('') +
        (f.id !== 'callback' ? '<label class="check check--dense"><input type="radio" class="radio" name="' + id + '" value="range"' + (rg ? ' checked' : '') + '><span class="check-text"><span>Custom range…</span></span></label>' : '') + '</fieldset>' +
        (f.id !== 'callback' ? '<div class="leads-pick-range" id="' + id + '-range"' + (rg ? '' : ' hidden') + '><div class="field"><label class="field-label" for="' + id + '-from">From</label><div class="input input--sm"><input type="date" id="' + id + '-from" value="' + (rg ? rg[1] : '2026-09-20') + '" max="2026-09-27"></div></div><div class="field"><label class="field-label" for="' + id + '-to">To</label><div class="input input--sm"><input type="date" id="' + id + '-to" value="' + (rg ? rg[2] : '2026-09-27') + '" max="2026-09-27"></div></div></div><p class="field-hint">Dates are in IST.</p>' : '');
    } else if (f.kind === 'number') {
      h += '<div class="leads-pick-range"><div class="field"><label class="field-label" for="' + id + '-min">Min</label><div class="input input--sm"><input id="' + id + '-min" inputmode="numeric" value="' + (v.min == null ? '' : v.min) + '" placeholder="0" aria-describedby="' + id + '-err"></div></div><div class="field"><label class="field-label" for="' + id + '-max">Max</label><div class="input input--sm"><input id="' + id + '-max" inputmode="numeric" value="' + (v.max == null ? '' : v.max) + '" placeholder="100" aria-describedby="' + id + '-err"></div></div></div><p class="field-error" id="' + id + '-err" hidden></p>' +
        '<label class="check check--dense"><input type="checkbox" class="cb" id="' + id + '-ns"' + (v.ns ? ' checked' : '') + '><span class="check-text"><span>Include leads not scored yet</span></span></label>';
    } else {
      h += '<div class="input input--sm"><input id="' + id + '-text" value="' + esc(v.text || '') + '" aria-label="' + esc(f.label) + '" placeholder="Pune…" autocomplete="off"></div>';
    }
    return h;
  }
  function readPicker(f) {
    var id = 'lp-' + f.id, pop = $('#leads-picker'), opEl = $('#' + id + '-op [aria-checked="true"]', pop), not = !!opEl && opEl.getAttribute('data-value') === 'not';
    if (f.kind === 'enum') { var vals = $$('.leads-pick-list input:checked', pop).map(function (c) { return c.value; }); return vals.length ? { values: vals, not: not } : null; }
    if (f.kind === 'date') { var r = $('input[name="' + id + '"]:checked', pop); if (!r) return null; var rg = $('#' + id + '-range', pop); if (rg) rg.hidden = r.value !== 'range'; if (r.value === 'range') { var a = $('#' + id + '-from', pop).value, b = $('#' + id + '-to', pop).value; return a && b ? { value: 'range:' + (a < b ? a : b) + ':' + (a < b ? b : a) } : null; } return { value: r.value }; }
    if (f.kind === 'number') {
      var mn = $('#' + id + '-min', pop).value.trim(), mx = $('#' + id + '-max', pop).value.trim(), ns = $('#' + id + '-ns', pop).checked, err = $('#' + id + '-err', pop), bad = [mn, mx].some(function (x) { return x !== '' && (!/^\d+$/.test(x) || +x > 100); });
      err.hidden = !bad; err.innerHTML = bad ? V.icon('circle-alert') + 'Enter a whole number from 0 to 100.' : ''; $$('input[inputmode]', pop).forEach(function (i) { i.setAttribute('aria-invalid', bad && i.value.trim() !== '' && (!/^\d+$/.test(i.value.trim()) || +i.value > 100) ? 'true' : 'false'); });
      if (bad) return undefined; if (mn === '' && mx === '' && !ns) return null; var lo = mn === '' ? null : +mn, hi = mx === '' ? null : +mx; if (lo != null && hi != null && lo > hi) { var t = lo; lo = hi; hi = t; } return { min: lo, max: hi, ns: ns };
    }
    var tx = $('#' + id + '-text', pop).value.trim(); return tx ? { text: tx, not: not } : null;
  }
  L.openPicker = function (fid, trigger) {
    var f = L.field(fid), pop = $('#leads-picker'); pk.field = fid; pk.trigger = trigger;
    $('#leads-picker-t').textContent = f.label; $('#leads-picker-body').innerHTML = pickerBody(f); V.initAll($('#leads-picker-body'));
    syncPickerFoot();
    pk.entry = V.popover.open(trigger, 'leads-picker', { placement: 'bottom-start', onClose: function () { var t = $('[data-token-body="' + fid + '"]'); if (pk.entry) pk.entry.returnTo = t && U.visible(t) ? t : $('#leads-filter-btn'); } });
    var first = $('input[type="search"], input:not([type]), input[inputmode], input:checked, input', $('#leads-picker-body')); if (first) first.focus();
  };
  function syncPickerFoot() { var n = L.last ? L.last.total : 0; $('#leads-picker-done').textContent = V.bp.phone() ? 'Show ' + L.plural(n, 'lead') : 'Done'; }
  function onPickerInput(e) {
    var f = L.field(pk.field); if (!f) return;
    if (e.target.matches('[id$="-find"]')) { var q = e.target.value.trim().toLowerCase(); $$('.leads-pick-row', $('#leads-picker')).forEach(function (r) { r.hidden = q && r.getAttribute('data-find').indexOf(q) < 0; }); return; }
    var v = readPicker(f); if (v === undefined) return;
    clearTimeout(pk.t); pk.t = setTimeout(function () { L.setFilter(f.id, v); syncPickerFoot(); }, f.kind === 'text' || f.kind === 'number' ? 300 : 0);
  }

  /* ---------- Columns (data-nav §7.5) ---------- */
  function renderColumns() {
    var shown = (L.shownCols || []).map(function (c) { return c.id; }), order = L.colOrder(), view = L.viewDef(S.view);
    var std = order.filter(function (c) { return !c.custom && L.colAvailable(c); }), custom = order.filter(function (c) { return c.custom; });
    var row = function (c, i, arr) { var on = shown.indexOf(c.id) >= 0 || c.key; return '<li class="leads-col-row"><label class="check check--dense"><input type="checkbox" class="cb" data-colcheck="' + c.id + '"' + (on ? ' checked' : '') + (c.key ? ' aria-disabled="true" aria-describedby="lc-always"' : '') + '><span class="check-text"><span>' + esc(c.label) + '</span>' + (c.key ? '<span class="check-desc" id="lc-always">Always shown</span>' : S.colOverride[c.id] == null && !on && FITS(c) ? '<span class="check-desc">Joins when the table is wider</span>' : '') + '</span></label><span class="leads-col-move"><button class="ibtn ibtn--sm" type="button" data-colmove="' + c.id + '" data-dir="-1" aria-label="Move ' + esc(c.label) + ' up"' + (i === 0 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-up') + '</button><button class="ibtn ibtn--sm" type="button" data-colmove="' + c.id + '" data-dir="1" aria-label="Move ' + esc(c.label) + ' down"' + (i === arr.length - 1 ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-down') + '</button></span></li>'; };
    $('#leads-cols-body').innerHTML = '<span class="menu-group-label">Columns</span><ul class="leads-col-list" role="list">' + std.map(row).join('') + '</ul><span class="menu-group-label">Custom fields · from imports</span><ul class="leads-col-list" role="list">' + custom.map(row).join('') + '</ul>' + (view.preset ? '<p class="type-meta-12 u-fg-3">The ' + esc(view.label) + ' view adds ' + esc(view.preset.map(function (p) { return L.col(p).label; }).join(', ')) + '.</p>' : '');
  }
  function FITS(c) { return ['phone', 'interest', 'language', 'flow'].indexOf(c.id) >= 0; }
  function saveCols() { U.store.set('vaani:leads:cols', JSON.stringify(S.colOverride)); U.store.set('vaani:leads:colorder', JSON.stringify(S.colOrder || [])); }

  /* ---------- saved views ---------- */
  function storeViews() { U.store.set('vaani:leads:views', JSON.stringify(S.userViews.map(function (v) { return { id: v.id, label: v.label, base: v.base, q: v.q, filters: v.filters, sortSaved: v.sortSaved, shared: v.shared }; }))); }
  var svMode = 'new';
  function openSaveView(trigger, mode) {
    svMode = mode || 'new'; var uv = L.viewDef(S.view);
    $('#leads-sv-t').textContent = svMode === 'rename' ? 'Rename view' : 'Save view'; $('#leads-sv-name').value = svMode === 'rename' ? uv.label : ''; $('#leads-sv-err').hidden = true; $('#leads-sv-name').removeAttribute('aria-invalid');
    $('#leads-sv-go').textContent = svMode === 'rename' ? 'Rename' : 'Save view';
    var share = $('#leads-sv-share'); if (L.isAdmin()) { share.removeAttribute('disabled'); $('#leads-sv-share-h').textContent = 'Everyone in Sample Realty sees this view.'; } else { share.setAttribute('disabled', ''); $('#leads-sv-share-h').textContent = 'Only admins can share views. Ask an admin.'; }
    $('#leads-sv-scope').textContent = L.hasNarrowing() ? 'Saves ' + L.filterWords() + ' in ' + L.viewDef(uv.user ? uv.base : S.view).label + ', with the sort.' : 'Saves the ' + L.viewDef(uv.user ? uv.base : S.view).label + ' view with the current sort.';
    V.popover.open(trigger, 'leads-sv-pop', { placement: 'bottom-start' }); $('#leads-sv-name').focus();
  }
  function saveView() {
    var name = $('#leads-sv-name').value.trim(), err = $('#leads-sv-err');
    if (!name) { err.hidden = false; $('#leads-sv-name').setAttribute('aria-invalid', 'true'); $('#leads-sv-name').focus(); return; }
    if (svMode === 'rename') { var uv = L.viewDef(S.view); uv.label = name; storeViews(); V.popover.close('leads-sv-pop'); L.render(); V.toast.success('Renamed the view to ' + name); return; }
    var cur = L.viewDef(S.view), nv = { id: 'v_' + Date.now().toString(36), label: name, base: cur.user ? cur.base : S.view, q: S.q, filters: JSON.parse(JSON.stringify(S.filters)), sortSaved: S.sort, shared: $('#leads-sv-share').checked, user: true };
    S.userViews.push(nv); storeViews(); V.popover.close('leads-sv-pop'); S.view = nv.id; L.pushUrl(); L.render();
    V.toast.success('Saved the view ' + name); var t = $('#leads-tab-' + nv.id); if (t) t.focus();
  }

  /* ---------- init ---------- */
  L.initFilters = function () {
    try { S.colOrder = JSON.parse(U.store.get('vaani:leads:colorder') || '[]'); } catch (e) { S.colOrder = []; }
    $('#leads-filter-menu').innerHTML = fieldsAvail().map(function (f) { return '<button class="menu-item" role="menuitem" type="button" data-value="' + f.id + '">' + V.icon(f.icon) + '<span class="menu-text"><span>' + esc(f.label) + '</span></span></button>'; }).join('');
    var fb = $('#leads-filter-btn');
    fb.addEventListener('click', function () {
      if (fb.getAttribute('aria-expanded') === 'true') { V.menu.close(); V.popover.close(); return; }
      if (Object.keys(S.filters).length && w.innerWidth >= 768 && w.innerWidth < 1024) { openTokensPop(fb); return; }
      $$('#leads-filter-menu .menu-item').forEach(function (it) { var k = it.getAttribute('data-value'), on = !!S.filters[k]; var desc = $('.menu-desc', it); if (desc) desc.remove(); if (on) $('.menu-text', it).insertAdjacentHTML('beforeend', '<span class="menu-desc">' + esc(valueWords(L.field(k), S.filters[k])) + '</span>'); });
      V.menu.open(fb, 'leads-filter-menu', { placement: 'bottom-start' });
    });
    $('#leads-filter-menu').addEventListener('vaani:menuselect', function (e) { var k = e.detail.value; setTimeout(function () { L.openPicker(k, fb); }, 0); });
    $('#leads-picker').addEventListener('change', onPickerInput); $('#leads-picker').addEventListener('input', onPickerInput);
    $('#leads-picker').addEventListener('vaani:change', function (e) { onPickerInput(e); });
    $('#leads-picker-clear').addEventListener('click', function () { L.setFilter(pk.field, null); $('#leads-picker-body').innerHTML = pickerBody(L.field(pk.field)); V.initAll($('#leads-picker-body')); syncPickerFoot(); });
    $('#leads-picker-done').addEventListener('click', function () { V.popover.close('leads-picker'); });
    /* tokens */
    var tb = $('#leads-tb');
    /* "+n filters" toggles: pressing it moves focus out of the open popover, which closes it before the click lands */
    tb.addEventListener('pointerdown', function (e) { tokWasOpen = !!tokEntry && !!e.target.closest('#leads-moretok'); }, true);
    tb.addEventListener('click', function (e) {
      var x = e.target.closest('[data-token-x]'); if (x) { removeToken(x.getAttribute('data-token-x'), true); return; }
      var b = e.target.closest('[data-token-body]'); if (b) { L.openPicker(b.getAttribute('data-token-body'), b); return; }
      if (e.target.closest('#leads-moretok')) { var was = tokWasOpen && e.detail > 0; tokWasOpen = false; if (was) { if (tokEntry) V.popover.close('leads-tokens-pop'); } else openTokensPop(e.target.closest('#leads-moretok')); }
      if (e.target.closest('#leads-clear')) { L.clearFilters(); $('#leads-q').focus(); V.announce('Search and filters cleared'); }
      if (e.target.closest('#leads-view-reset')) { var uv = L.viewDef(S.view); S.q = uv.q || ''; S.filters = JSON.parse(JSON.stringify(uv.filters || {})); S.sort = uv.sortSaved || null; L.pushUrl(); L.render({ announce: true }); $('#leads-q').focus(); }
      if (e.target.closest('#leads-view-save')) { var v2 = L.viewDef(S.view); v2.q = S.q; v2.filters = JSON.parse(JSON.stringify(S.filters)); v2.sortSaved = S.sort; storeViews(); L.render(); V.toast.success('Saved changes to ' + v2.label); $('#leads-q').focus(); }
      if (e.target.closest('#leads-sort-btn')) openSort(e.target.closest('#leads-sort-btn'));
    });
    tb.addEventListener('keydown', function (e) { var b = e.target.closest && e.target.closest('[data-token-body]'); if (b && (e.key === 'Backspace' || e.key === 'Delete')) { e.preventDefault(); removeToken(b.getAttribute('data-token-body'), true); } });
    $('#leads-tokens-pop').addEventListener('click', function (e) {
      var x = e.target.closest('[data-token-x]'); if (x) { L.setFilter(x.getAttribute('data-token-x'), null); fillTokensPop(); var n = $('#leads-tokens-pop [data-token-body]') || $('#leads-addfilter'); n.focus(); if (!Object.keys(S.filters).length) V.popover.close('leads-tokens-pop'); return; }
      var b = e.target.closest('[data-token-body]'); if (b) { var k = b.getAttribute('data-token-body'); V.popover.close('leads-tokens-pop'); setTimeout(function () { L.openPicker(k, fb); }, 0); return; }
      if (e.target.closest('#leads-addfilter')) { V.popover.close('leads-tokens-pop'); setTimeout(function () { V.menu.open(fb, 'leads-filter-menu', { placement: 'bottom-start' }); }, 0); }
    });
    /* count popover, columns, density */
    $('#leads-count').addEventListener('click', function () { renderSummary(L.last); }, true);
    $('#leads-cols-btn').addEventListener('click', renderColumns, true);
    $('#leads-cols-pop').addEventListener('change', function (e) { var c = e.target.getAttribute('data-colcheck'); if (!c || c === 'name') { if (c === 'name') e.target.checked = true; return; } S.colOverride[c] = e.target.checked; saveCols(); L.render(); renderColumns(); var n = $('#leads-cols-pop [data-colcheck="' + c + '"]'); if (n) n.focus(); V.announce(L.col(c).label + (e.target.checked ? ' shown' : ' hidden')); });
    $('#leads-cols-pop').addEventListener('click', function (e) {
      var m = e.target.closest('[data-colmove]'); if (m && m.getAttribute('aria-disabled') !== 'true') { var id = m.getAttribute('data-colmove'), dir = +m.getAttribute('data-dir'), order = L.colOrder().map(function (c) { return c.id; }), i = order.indexOf(id), j = i + dir; if (j < 0 || j >= order.length) return; order[i] = order[j]; order[j] = id; S.colOrder = order; saveCols(); L.render(); renderColumns(); var nb = $('#leads-cols-pop [data-colmove="' + id + '"][data-dir="' + dir + '"]'); if (nb && nb.getAttribute('aria-disabled') !== 'true') nb.focus(); else { nb = $('#leads-cols-pop [data-colmove="' + id + '"]'); if (nb) nb.focus(); } V.announce(L.col(id).label + ' moved ' + (dir < 0 ? 'up' : 'down')); }
      if (e.target.closest('#leads-cols-reset')) { S.colOverride = {}; S.colOrder = []; saveCols(); L.render(); renderColumns(); V.announce('Columns reset'); }
    });
    $('#leads-density').addEventListener('vaani:change', function () { setTimeout(function () { L.render(); }, 0); });
    /* saved views */
    $('#leads-saveview').addEventListener('click', function (e) { openSaveView(e.currentTarget, 'new'); });
    $('#leads-sv-pop').addEventListener('submit', function (e) { e.preventDefault(); saveView(); });
    $('#leads-view-menu').addEventListener('vaani:menuselect', function (e) {
      var v = e.detail.value, uv = L.viewDef(S.view), trig = $('#leads-view-more');
      if (v === 'rename') setTimeout(function () { openSaveView(trig, 'rename'); }, 0);
      else if (v === 'update') { uv.q = S.q; uv.filters = JSON.parse(JSON.stringify(S.filters)); uv.sortSaved = S.sort; storeViews(); L.render(); V.toast.success('Updated ' + uv.label + ' with the current filters'); }
      else if (v === 'copy') { try { navigator.clipboard.writeText(w.location.href).then(function () {}, function () {}); } catch (x) { /* blocked */ } V.toast.success('Link to ' + uv.label + ' copied'); }
      else if (v === 'delete') { var i = S.userViews.indexOf(uv); S.userViews.splice(i, 1); storeViews(); S.view = 'all'; L.pushUrl(); L.render(); $('#leads-tab-all').focus(); V.toast.undo('Deleted the view ' + uv.label, { action: { label: 'Undo', onClick: function () { S.userViews.splice(i, 0, uv); storeViews(); L.render(); } } }); }
    });
    /* phone sort sheet */
    $('#leads-sort-pop').addEventListener('change', function (e) { if (e.target.name === 'leads-sortby') { var c = L.col(e.target.value); L.setSort([c.id, c.sort]); fillSort(); V.announce('Sorted by ' + L.sortWords(L.curSort())); } });
    $('#leads-sort-pop').addEventListener('vaani:change', function (e) { var s = L.curSort(); L.setSort([s[0], e.detail.value]); V.announce('Sorted by ' + L.sortWords(L.curSort())); });
    V.on('breakpoint', function () { if (L.last) L.renderFilters(L.last); });
    /* The row answers to its own width, not only the window’s: a docked sheet, the rail or a resize inside a band
       re-fits it. Only a width change re-fits (the fit itself changes the height). Webfonts change widths too. */
    var fitRaf = 0, lastW = -1, refit = function () { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(function () { if (L.last) fitToolbar(); }); };
    if (w.ResizeObserver) new w.ResizeObserver(function (en) { var cw = Math.round(en[0].contentRect.width); if (cw !== lastW) { lastW = cw; refit(); } }).observe(tb);
    else w.addEventListener('resize', refit);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(refit);
    var sh = $('#lead-sheet'); if (sh && w.MutationObserver) new w.MutationObserver(refit).observe(sh, { attributes: true, attributeFilter: ['hidden', 'class'] });
  };
  function fillTokensPop() { var keys = Object.keys(S.filters); $('#leads-tokens-body').innerHTML = keys.length ? '<div class="leads-tokens-stack">' + keys.map(tokenHtml).join('') + '</div>' : '<p class="type-meta-12 u-fg-3">No filters yet.</p>'; }
  function openTokensPop(trigger) {
    if (tokEntry) { V.popover.close('leads-tokens-pop'); return; }
    fillTokensPop();
    tokEntry = V.popover.open(trigger, 'leads-tokens-pop', { placement: 'bottom-start', onClose: function () {
      var e = tokEntry; tokEntry = null; var m = $('#leads-moretok'); if (m) m.setAttribute('aria-expanded', 'false');
      if (e) e.returnTo = tokTrigger();   /* a re-fit may have replaced the "+n filters" button */
    } });
  }
  var SORTS = ['last_call', 'created', 'interest', 'name', 'callback'];
  function fillSort() {
    var s = L.curSort(), c = L.col(s[0]);
    $('#leads-sort-list').innerHTML = SORTS.filter(function (id) { return L.colAvailable(L.col(id)); }).map(function (id) { var col = L.col(id); return '<label class="check"><input type="radio" class="radio" name="leads-sortby" value="' + id + '"' + (s[0] === id ? ' checked' : '') + '><span class="check-text"><span>' + esc(col.label) + '</span></span></label>'; }).join('');
    var w2 = (SORTWORDS2[s[0]] || ['Ascending', 'Descending']);
    $('#leads-sort-dir').innerHTML = '<button type="button" role="radio" aria-checked="' + (s[1] === 'desc') + '" data-value="desc">' + esc(w2[1]) + '</button><button type="button" role="radio" aria-checked="' + (s[1] === 'asc') + '" data-value="asc">' + esc(w2[0]) + '</button>';
    V.seg.init($('#leads-sort-pop'));
    if (!c) return;
  }
  var SORTWORDS2 = { last_call: ['Oldest first', 'Newest first'], created: ['Oldest first', 'Newest first'], interest: ['Lowest first', 'Highest first'], name: ['A to Z', 'Z to A'], callback: ['Earliest first', 'Latest first'] };
  function openSort(trigger) { fillSort(); V.popover.open(trigger, 'leads-sort-pop', { placement: 'bottom-start' }); var c = $('#leads-sort-list input:checked'); if (c) c.focus(); }
})(window, document);
