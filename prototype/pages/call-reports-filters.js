/* Vaani Labs prototype · Call reports · toolbar: search, filter builder and tokens, test calls, columns, totals, export. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, P = NS.page, $ = U.$, $$ = U.$$, esc = U.esc, fmt = V.fmt, store = U.store;
  var WHEN = [['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days']];

  /* ---------- tokens ---------- */
  function tokenList() {
    var out = [], R = NS.range(P.st.when);
    if (R) out.push({ id: 'when', label: 'When', value: R.label });
    NS.FIELDS.forEach(function (F) { var v = P.st.f[F.id]; if (!v || !v.length) return;
      var val = F.id === 'duration' ? durWords(v) : F.id === 'captured' ? 'contains “' + v[0] + '”' : v.map(function (x) { return NS.valueName(F.id, x, P.st); }).join(', ');
      out.push({ id: F.id, label: F.label, value: val }); });
    return out;
  }
  function durWords(v) { var lo = +v[0] || 0, hi = v[1] === '' || v[1] == null ? null : +v[1]; return hi == null ? 'over ' + fmt.duration(lo) : lo ? fmt.duration(lo) + ' to ' + fmt.duration(hi) : 'under ' + fmt.duration(hi); }
  function tokenHtml(x, off) {
    return '<span class="ftoken"><button class="ftoken-body" type="button" data-edit="' + x.id + '" aria-haspopup="dialog" aria-label="' + esc(x.label + ' is ' + x.value + '. Edit filter') + '"' + (off ? ' aria-disabled="true"' : '') + '><span class="ftoken-f">' + esc(x.label) + '</span><span class="ftoken-v">' + esc(x.value) + '</span></button>' +
      '<button class="ftoken-x" type="button" data-remove="' + x.id + '" aria-label="' + esc('Remove ' + x.label + ' filter') + '"' + (off ? ' aria-disabled="true"' : '') + '>' + V.icon('x', 'sm') + '</button></span>';
  }
  /* FilterBar widths (data-nav §6.7, 05-responsive §5.3): phones show every token in the scrolling row; 768–1023 folds
     them into the Filter button’s count; ≥ 1024 shows up to 3 inline (2 below 1280) and the rest behind "+n filters". */
  function inlineLimit() { var W = w.innerWidth; return W < 768 ? 99 : W < 1024 ? 0 : W < 1280 ? 2 : 3; }
  var tokEntry = null;
  function drawTokens(t, lim, off) {
    var inl = t.slice(0, lim), more = w.innerWidth >= 1024 ? t.length - inl.length : 0;
    $('#cr-tokens').innerHTML = inl.map(function (x) { return tokenHtml(x, off); }).join('') + (more > 0 ? '<button class="btn btn--sm cr-moretok" type="button" id="cr-moretok" aria-haspopup="dialog" aria-controls="cr-tokens-pop" aria-expanded="' + !!tokEntry + '"' + (off ? ' aria-disabled="true" data-tooltip="You’re offline"' : '') + '>+' + more + ' filter' + (more === 1 ? '' : 's') + '</button>' : '');
  }
  /* One toolbar row at ≥ 1024, nothing clipped and nothing under the count. The search keeps its placeholder width, so
     when the row is full the right group folds in steps, each kept only if it brings more tokens inline: 1 the density
     switch (Shift+D still switches), like Leads. Only when no token would show at all: 2 the Columns label (icon-only, as
     below 1280), 3 the Test calls switch, which moves into the Filter popover as it does on phones (the 1024 wireframe in
     04 §2.4 shows neither). Tokens that still don’t fit wait behind "+n filters". */
  var FOLDS = [[], ['cr-tb--nodensity'], ['cr-tb--nodensity', 'cr-tb--nocolslabel'], ['cr-tb--nodensity', 'cr-tb--nocolslabel', 'cr-tb--notest']];
  var ALLFOLDS = FOLDS[FOLDS.length - 1];
  function overflowing() { var g = $('#cr-filters'), tb = $('#cr-tb'); return g.scrollWidth > g.clientWidth + 1 || tb.scrollWidth > tb.clientWidth + 1; }
  function fold(tb, cls) { ALLFOLDS.forEach(function (c) { tb.classList.toggle(c, cls.indexOf(c) >= 0); }); }
  function fitTokens(t, off) {
    var tb = $('#cr-tb'), max = Math.min(inlineLimit(), t.length), best = null;
    fold(tb, []); drawTokens(t, max, off);
    if (w.innerWidth < 1024 || tb.hidden || !tb.offsetWidth) return;
    for (var i = 0; i < FOLDS.length; i++) {
      if (i >= 2 && best && best.lim >= Math.min(1, max)) break;   /* steps 2–3 only rescue a row that would show no token */
      if (i === 2 && w.innerWidth < 1280) continue;   /* the Columns label is already hidden below 1280 */
      fold(tb, FOLDS[i]);
      for (var lim = max; lim >= 0; lim--) { drawTokens(t, lim, off); if (!overflowing()) break; }
      if (lim >= 0 && (!best || lim > best.lim)) best = { i: i, lim: lim };
      if (best && best.lim === max) break;
    }
    if (!best) best = { i: FOLDS.length - 1, lim: 0 };   /* nothing fits: fold all; the filter group scrolls sideways */
    fold(tb, FOLDS[best.i]); drawTokens(t, best.lim, off);
  }
  NS.testFolded = function () { var tb = $('#cr-tb'); return !!tb && tb.classList.contains('cr-tb--notest'); };
  /* Re-rendering replaces the token buttons: keep keyboard focus on the same control (or the next sensible one). */
  function focusKey() {
    var a = d.activeElement; if (!a || !a.closest || !a.closest('#cr-tokens')) return null;
    return a.id === 'cr-moretok' ? '#cr-moretok' : a.hasAttribute('data-edit') ? '[data-edit="' + a.getAttribute('data-edit') + '"]' : a.hasAttribute('data-remove') ? '[data-remove="' + a.getAttribute('data-remove') + '"]' : '#cr-moretok';
  }
  function restoreFocus(key) { if (!key) return; var n = $('#cr-tokens ' + key) || $('#cr-moretok') || $('#cr-tokens [data-edit]') || $('#cr-filter-btn'); if (n && U.visible(n)) n.focus({ preventScroll: true }); else $('#cr-filter-btn').focus({ preventScroll: true }); }
  NS.fitToolbar = function () { if (!P.st) return; var key = focusKey(); fitTokens(tokenList(), P.offline()); syncTokensPop(); restoreFocus(key); };
  NS.renderToolbar = function () {
    var t = tokenList(), off = P.offline(), key = focusKey();
    var fc = $('#cr-fcount'); fc.hidden = !t.length; fc.textContent = t.length; fc.setAttribute('aria-label', t.length + ' filters');
    $('#cr-filter-btn').setAttribute('aria-label', 'Filter' + (t.length ? ', ' + t.length + ' active' : ''));
    $('#cr-clear').hidden = !t.length;
    $('#cr-tokens').setAttribute('data-n', t.length);
    var q = $('#cr-q'); if (d.activeElement !== q) q.value = P.st.q; $('#cr-q-clear').hidden = !q.value;
    [q, $('#cr-filter-btn'), $('#cr-clear')].forEach(function (el) { if (off) { el.setAttribute('aria-disabled', 'true'); el.setAttribute('data-tooltip', "You’re offline"); } else { el.removeAttribute('aria-disabled'); el.removeAttribute('data-tooltip'); } });
    if (off) q.setAttribute('readonly', ''); else q.removeAttribute('readonly');
    $('#cr-test').setAttribute('aria-checked', P.st.test ? 'true' : 'false');
    /* last: the fit measures the finished row (Clear, the count and the switch included) */
    fitTokens(t, off); syncTokensPop(); restoreFocus(key);
  };

  /* ---------- "+n filters": a Popover with every active token and Add filter (data-nav §6.7) ---------- */
  function fillTokensPop() {
    var t = tokenList(), off = P.offline();
    $('#cr-tokens-body').innerHTML = t.length ? '<div class="cr-tokens-stack">' + t.map(function (x) { return tokenHtml(x, off); }).join('') + '</div>' : '<p class="cr-note">No filters.</p>';
  }
  function syncTokensPop() {
    if (!tokEntry) return; var mb = $('#cr-moretok');
    if (mb) mb.setAttribute('aria-expanded', 'true');
    tokEntry.returnTo = mb || $('#cr-filter-btn');
    /* the redraw replaced the anchor: keep the open Popover under the new "+n filters" */
    if (mb && V.util.place && !V.bp.phone()) V.util.place($('#cr-tokens-pop'), mb, 'bottom-start');
  }
  function openTokensPop(btn) {
    fillTokensPop();
    tokEntry = V.popover.open(btn, 'cr-tokens-pop', { placement: 'bottom-start', onClose: function () { tokEntry = null; var mb = $('#cr-moretok'); if (mb) mb.setAttribute('aria-expanded', 'false'); } });
  }
  NS.removeFilter = function (id) {
    if (id === 'when') { P.set({ when: '' }); return; }
    var f = JSON.parse(JSON.stringify(P.st.f)); delete f[id]; if (id === 'flow') delete f.last_step; P.set({ f: f });
  };
  /* Remove one token and move focus to the next token (or the previous, or the Filter button), data-nav §6.5. */
  function removeToken(id, box) {
    var ids = tokenList().map(function (x) { return x.id; }), i = ids.indexOf(id), label = (tokenList()[i] || {}).label || 'Filter';
    NS.removeFilter(id);
    if (box === 'pop') fillTokensPop();
    var left = $$((box === 'pop' ? '#cr-tokens-body' : '#cr-tokens') + ' [data-edit]').filter(function (b) { return b.getAttribute('data-edit') !== id; });
    var next = left[i] || (box === 'pop' ? null : $('#cr-moretok')) || left[i - 1] || left[left.length - 1] || null;
    if (box === 'pop' && !left.length) V.popover.close('cr-tokens-pop');
    else if (next) next.focus(); else $('#cr-filter-btn').focus();
    V.announce(label + ' filter removed', { dedupeKey: 'cr-tok' });
  }
  d.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var mt = e.target.closest('#cr-moretok');
    if (mt) { if (mt.getAttribute('aria-disabled') !== 'true') { if (tokEntry) V.popover.close('cr-tokens-pop'); else openTokensPop(mt); } return; }
    if (!e.target.closest('#cr-tokens-pop') || P.offline()) return;
    var rm = e.target.closest('[data-remove]'), ed = e.target.closest('[data-edit]');
    if (rm) { removeToken(rm.getAttribute('data-remove'), 'pop'); return; }
    if (ed) { var fid = ed.getAttribute('data-edit'); V.popover.close('cr-tokens-pop'); setTimeout(function () { NS.openFilter($('#cr-moretok') || $('#cr-filter-btn'), fid); }, 0); return; }
    if (e.target.closest('#cr-addfilter')) { V.popover.close('cr-tokens-pop'); setTimeout(function () { NS.openFilter($('#cr-filter-btn')); }, 0); }
  });
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;
    var b = e.target.closest && e.target.closest('#cr-tokens [data-edit], #cr-tokens-pop [data-edit]'); if (!b || P.offline()) return;
    e.preventDefault(); removeToken(b.getAttribute('data-edit'), b.closest('#cr-tokens-pop') ? 'pop' : 'bar');
  });
  /* Width changes inside a band re-fit the row; crossing a band redraws the tokens for its limit. */
  var fitRaf = 0, lastBase = null;
  w.addEventListener('resize', function () {
    cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(function () { var base = inlineLimit(); if (P.rows && (w.innerWidth >= 1024 || base !== lastBase)) NS.fitToolbar(); lastBase = base; });
  });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { if (P.rows) NS.fitToolbar(); });

  /* ---------- filter builder (Popover; bottom sheet on phones) ---------- */
  var draft = null, editing = null;
  function countWith(fid, vals) { var st = {}; for (var k in P.st) st[k] = P.st[k]; st.f = {}; for (var j in draft.f) st.f[j] = draft.f[j]; st.when = draft.when; if (fid === 'when') st.when = vals; else if (fid) { st.f[fid] = vals; } return NS.query(st, { keep: P.keep, extra: P.extra }).rows.length; }
  function fieldList() {
    var fields = NS.FIELDS.filter(function (F) { return (!F.onlyWithTests || P.st.test) && (!F.needsOneFlow || P.oneFlow()); });
    var R = NS.range(draft.when);
    var items = [{ id: 'when', label: 'When', val: R ? R.label : 'Any time' }].concat(fields.map(function (F) { var v = draft.f[F.id]; return { id: F.id, label: F.label, val: v && v.length ? (F.id === 'duration' ? durWords(v) : F.id === 'captured' ? '“' + v[0] + '”' : v.length + ' selected') : '' }; }));
    return '<div class="pop-head"><h2 class="pop-title" id="cr-filter-t">Filter calls</h2><button type="button" class="ibtn ibtn--sm" data-popover-close aria-label="Close"><i data-icon="x"></i></button></div>' +
      '<div class="pop-body cr-fbody">' + (V.bp.phone() || NS.testFolded() ? '<div class="setting-row cr-fsw"><span class="setting-row-text"><span class="setting-row-label" id="cr-ftest-l">Show test calls</span><span class="setting-row-desc">Includes test calls and browser tests</span></span><button type="button" class="switch" role="switch" data-manual id="cr-ftest" aria-checked="' + P.st.test + '" aria-labelledby="cr-ftest-l"><span class="switch-thumb"></span></button></div>' : '') +
      '<ul class="cr-flist" aria-label="Fields">' + items.map(function (x) { return '<li><button type="button" class="menu-item" data-field="' + x.id + '"><span class="menu-text"><span>' + esc(x.label) + '</span></span><span class="menu-end">' + esc(x.val) + V.icon('chevron-right', 'sm') + '</span></button></li>'; }).join('') + '</ul></div>' +
      '<div class="pop-foot"><button type="button" class="btn btn--sm btn--tertiary" data-fclear>Clear filters</button><button type="button" class="btn btn--sm btn--primary" data-fapply>' + showLabel(countWith(null)) + '</button></div>';
  }
  function showLabel(n) { return 'Show ' + fmt.count(n) + ' call' + (n === 1 ? '' : 's'); }
  function editor(fid) {
    var F = NS.field(fid), cur = fid === 'when' ? draft.when : (draft.f[fid] || []), body = '', title = fid === 'when' ? 'When' : F.label;
    if (fid === 'when') {
      var R = NS.range(cur), custom = R && R.custom;
      body = '<fieldset class="fieldset"><legend class="sr-only">When</legend>' + [['', 'Any time']].concat(WHEN).map(function (o) { return '<label class="check check--dense"><input type="radio" class="radio" name="cr-when" value="' + o[0] + '"' + ((cur || '') === o[0] ? ' checked' : '') + '><span class="check-text"><span>' + o[1] + '</span></span></label>'; }).join('') +
        '<label class="check check--dense"><input type="radio" class="radio" name="cr-when" value="custom"' + (custom ? ' checked' : '') + '><span class="check-text"><span>Custom range (IST)</span></span></label></fieldset>' +
        '<div class="l-pair cr-fdates"><div class="field"><label class="field-label" for="cr-from">From</label><div class="input input--sm"><input type="date" id="cr-from" value="' + (custom ? R.from : NS.dateAgo(6)) + '" min="' + NS.dateAgo(89) + '" max="' + V.data.meta.today + '"></div></div>' +
        '<div class="field"><label class="field-label" for="cr-to">To</label><div class="input input--sm"><input type="date" id="cr-to" value="' + (custom ? R.to : V.data.meta.today) + '" min="' + NS.dateAgo(89) + '" max="' + V.data.meta.today + '"></div></div></div>';
    } else if (fid === 'duration') {
      body = '<div class="l-pair"><div class="field"><label class="field-label" for="cr-dmin">At least (s)</label><div class="input input--sm"><input type="number" inputmode="numeric" id="cr-dmin" min="0" value="' + esc(cur[0] || '') + '"></div></div><div class="field"><label class="field-label" for="cr-dmax">At most (s)</label><div class="input input--sm"><input type="number" inputmode="numeric" id="cr-dmax" min="0" value="' + esc(cur[1] || '') + '"></div></div></div>';
    } else if (fid === 'captured') {
      body = '<div class="field"><label class="field-label" for="cr-cap">Captured value contains</label><div class="input input--sm"><input id="cr-cap" autocomplete="off" value="' + esc(cur[0] || '') + '" placeholder="Saturday"></div><span class="field-hint">Matches any captured field, such as Budget or Preferred day.</span></div>';
    } else {
      var vals = fid === 'last_step' ? NS.FLOWS[P.oneFlow()].funnel.concat(['n5']).filter(function (x, i, a) { return a.indexOf(x) === i && NS.FLOWS[P.oneFlow()].steps[x]; }) : F.values;
      body = '<fieldset class="fieldset' + (fid === 'hour' ? ' cr-fhours' : '') + '"><legend class="sr-only">' + esc(F.label) + '</legend>' + vals.map(function (v) {
        var n = countWith(fid, [v]);
        return '<label class="check check--dense"><input type="checkbox" class="cb" value="' + esc(v) + '"' + (cur.indexOf(v) >= 0 ? ' checked' : '') + '><span class="check-text"><span>' + esc(fid === 'hour' ? NS.hourLabel(v) : NS.valueName(fid, v, { f: draft.f })) + ' <span class="u-fg-3 u-num">' + fmt.count(n) + '</span></span></span></label>';
      }).join('') + '</fieldset>';
    }
    return '<div class="pop-head"><button type="button" class="btn btn--sm btn--tertiary cr-fback" data-back>' + V.icon('chevron-left', 'sm') + 'Filters</button><h2 class="pop-title" id="cr-filter-t">' + esc(title) + '</h2><button type="button" class="ibtn ibtn--sm" data-popover-close aria-label="Close"><i data-icon="x"></i></button></div>' +
      '<div class="pop-body cr-fbody" data-editor="' + fid + '">' + body + '</div>' +
      '<div class="pop-foot"><button type="button" class="btn btn--sm btn--tertiary" data-fclear-one>Clear</button><button type="button" class="btn btn--sm btn--primary" data-fapply>' + showLabel(countWith(null)) + '</button></div>';
  }
  function readEditor() {
    var box = $('#cr-filter [data-editor]'); if (!box) return; var fid = box.getAttribute('data-editor');
    if (fid === 'when') { var r = $('input[name="cr-when"]:checked', box), v = r ? r.value : ''; if (v === 'custom') { var a = $('#cr-from').value, b = $('#cr-to').value; v = a && b ? (a === b ? a : a + '..' + b) : ''; } draft.when = v; }
    else if (fid === 'duration') { var lo = $('#cr-dmin').value, hi = $('#cr-dmax').value; draft.f.duration = lo || hi ? [lo || '0', hi] : []; }
    else if (fid === 'captured') { var t = $('#cr-cap').value.trim(); draft.f.captured = t ? [t] : []; }
    else draft.f[fid] = $$('input[type="checkbox"]:checked', box).map(function (x) { return x.value; });
    var ap = $('#cr-filter [data-fapply]'); if (ap) ap.textContent = showLabel(countWith(null));
  }
  function paint(fid) { var pop = $('#cr-filter'); editing = fid || null; pop.innerHTML = fid ? editor(fid) : fieldList(); V.initAll(pop); var f = fid ? ($('input', $('[data-editor]', pop)) || $('[data-back]', pop)) : $('[data-field]', pop); if (f) f.focus(); }
  NS.openFilter = function (trigger, fid) {
    if (P.offline()) return;
    draft = { when: P.st.when, f: JSON.parse(JSON.stringify(P.st.f)) };
    var pop = $('#cr-filter'); pop.innerHTML = fid ? editor(fid) : fieldList();
    V.popover.open(trigger, 'cr-filter', { placement: 'bottom-start' }); V.initAll(pop); editing = fid || null;
    var f = fid ? $('input', $('[data-editor]', pop)) : null; if (f) f.focus();
  };
  function apply() { readEditor(); var f = {}; for (var k in draft.f) if (draft.f[k] && draft.f[k].length) f[k] = draft.f[k]; if (f.last_step && !(f.flow && f.flow.length === 1)) delete f.last_step; V.popover.close('cr-filter'); P.set({ f: f, when: draft.when }); }
  d.addEventListener('click', function (e) {
    var pop = e.target.closest('#cr-filter'); if (!pop) return;
    var t = e.target.closest('[data-field],[data-back],[data-fapply],[data-fclear],[data-fclear-one],#cr-ftest'); if (!t) return;
    if (t.hasAttribute('data-field')) paint(t.getAttribute('data-field'));
    else if (t.hasAttribute('data-back')) { readEditor(); var was = editing; paint(null); var b = $('[data-field="' + was + '"]', pop); if (b) b.focus(); }
    else if (t.hasAttribute('data-fapply')) apply();
    else if (t.hasAttribute('data-fclear')) { draft = { when: '', f: {} }; apply(); }
    else if (t.hasAttribute('data-fclear-one')) { if (editing === 'when') draft.when = ''; else delete draft.f[editing]; paint(editing); }
    else if (t.id === 'cr-ftest') { var on = t.getAttribute('aria-checked') !== 'true'; t.setAttribute('aria-checked', on); P.set({ test: on }, { keepPage: false }); }
  });
  d.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('#cr-filter [data-editor]')) readEditor(); });
  d.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('#cr-filter [data-editor]') && e.target.type !== 'checkbox') { clearTimeout(readEditor._t); readEditor._t = setTimeout(readEditor, 200); } });
  d.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.closest && e.target.closest('#cr-filter [data-editor]') && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') { e.preventDefault(); apply(); } });

  /* ---------- columns menu ---------- */
  NS.renderColsMenu = function () {
    var chosen = P.menuCols(), fcols = P.fieldCols(), m = $('#cr-cols-menu');
    var item = function (c, locked, emptyNote) { var on = chosen.indexOf(c.id) >= 0 || !!locked; return '<button class="menu-item" role="menuitemcheckbox" type="button" data-keep-open data-col="' + c.id + '" aria-checked="' + on + '"' + (locked ? ' aria-disabled="true" data-reason="' + esc(c.label) + ' is always shown"' : '') + '><span class="menu-check">' + V.icon('check') + '</span><span class="menu-text"><span>' + esc(c.label) + '</span>' + (emptyNote ? '<span class="menu-desc">Empty in these results</span>' : '') + '</span></button>'; };
    var html = '<span class="menu-group-label">Columns</span>' + NS.COLS.filter(function (c) { return c.p <= 3; }).map(function (c) { return item(c, c.p === 1); }).join('') +
      '<div class="menu-sep" role="separator"></div><span class="menu-group-label">More columns</span>' + NS.COLS.filter(function (c) { return c.p === 4; }).map(function (c) { return item(c); }).join('');
    if (fcols.length) {
      var F = NS.FLOWS[P.oneFlow()];
      var filled = fcols.filter(function (c) { return P.rows.some(function (r) { return r.captured[c.field] && r.captured[c.field].value; }); });
      var emptyC = fcols.filter(function (c) { return filled.indexOf(c) < 0; });
      html += '<div class="menu-sep" role="separator"></div><span class="menu-group-label">Captured by ' + esc(F.name + ' v' + F.version) + '</span>' + filled.map(function (c) { return item(c); }).join('') + emptyC.map(function (c) { return item(c, false, true); }).join('');
    }
    html += '<div class="menu-sep" role="separator"></div><button class="menu-item" role="menuitem" type="button" data-cols-reset>' + V.icon('undo-2') + '<span class="menu-text"><span>Reset to default columns</span></span></button>';
    m.innerHTML = html;
  };
  d.addEventListener('vaani:menuselect', function (e) {
    var it = e.detail.item; if (!it.closest('#cr-cols-menu')) return;
    if (it.hasAttribute('data-cols-reset')) { store.remove('vaani:call-reports:cols'); P.st.cols = null; P.writeUrl(true); NS.renderTable(); V.announce('Default columns'); return; }
    var id = it.getAttribute('data-col'), chosen = P.menuCols().slice(), on = e.detail.checked;
    if (on && chosen.indexOf(id) < 0) chosen.push(id); if (!on) chosen = chosen.filter(function (x) { return x !== id; });
    store.set('vaani:call-reports:cols', chosen.join(',')); P.st.cols = chosen; P.writeUrl(false); NS.renderTable();
    V.announce(it.textContent.trim() + (on ? ' column shown' : ' column hidden'));
  });

  /* ---------- totals popover (the toolbar count’s breakdown; replaces the "In this view" band, direction §6.4) ---------- */
  NS.renderTotals = function () {
    var b = $('#cr-totals-body'), s = P.stats, justNow = Object.keys(P.keep).filter(function (id) { var c = NS.byId[id]; return c && c.reviewed && c.reviewed.by === P.me; }).length;
    if (P.flag('stats-error')) { b.innerHTML = '<p class="status status--md">' + V.icon('circle-alert') + 'Couldn’t load totals · <button type="button" class="btn btn--link" data-retry-stats>Retry</button></p>'; return; }
    var R = NS.range(P.st.when), range = R && R.preset && R.preset !== 'today' ? R.preset : '30d';
    var facts = [['Calls', fmt.count(s.calls)], ['Talk time', NS.talkText(s.talkSec)], ['Avg talk time', s.talked ? fmt.duration(s.avgTalk) : '–'], ['Negative', fmt.count(s.negative)]];
    if (justNow) facts.push(['Reviewed just now', fmt.count(justNow)]);
    b.innerHTML = '<dl class="kv">' + facts.map(function (f) { return '<div class="kv-row"><dt>' + f[0] + '</dt><dd class="u-num">' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="cr-scope">' + esc(P.scopeWords()) + '</p><a class="cr-trends" href="analytics.html?range=' + range + (P.st.test ? '&amp;test=1' : '') + '">Trends in Analytics</a>';
  };

  /* ---------- export popover (§2.6.5) ---------- */
  NS.renderExport = function () {
    var n = P.rows.length, e = $('#cr-export'), none = !n, off = P.offline(), why = none ? 'Nothing to export in this view.' : off ? "You’re offline" : '';
    e.innerHTML = '<div class="pop-head"><h2 class="pop-title" id="cr-export-t">Export ' + fmt.count(n) + ' call' + (n === 1 ? '' : 's') + '</h2><button type="button" class="ibtn ibtn--sm" data-popover-close aria-label="Close"><i data-icon="x"></i></button></div>' +
      '<div class="pop-body"><div class="field"><span class="field-label" id="cr-xf-l">Format</span><div class="seg seg--sm" role="radiogroup" aria-labelledby="cr-xf-l" id="cr-xf"><button type="button" role="radio" aria-checked="true" data-value="csv">CSV</button><button type="button" role="radio" aria-checked="false" data-value="xlsx">XLSX</button></div></div>' +
      '<fieldset class="fieldset"><legend>Columns</legend><label class="check check--dense"><input type="radio" class="radio" name="cr-xc" value="visible" checked><span class="check-text"><span>Visible columns</span></span></label><label class="check check--dense"><input type="radio" class="radio" name="cr-xc" value="all"><span class="check-text"><span>All columns, including captured fields</span></span></label></fieldset>' +
      '<label class="check check--dense"><input type="checkbox" class="cb" id="cr-xt"><span class="check-text"><span>Include transcripts</span><span class="check-desc">Adds one text column. Large files take longer.</span></span></label>' +
      '<p class="cr-note">Phone numbers stay masked. Exports are logged.</p></div>' +
      '<div class="pop-foot">' + (why ? '<span class="cr-why" id="cr-x-why">' + esc(why) + '</span>' : '') + '<button type="button" class="btn btn--sm btn--primary" id="cr-x-go"' + (why ? ' aria-disabled="true" aria-describedby="cr-x-why"' : '') + '>Export ' + fmt.count(n) + ' call' + (n === 1 ? '' : 's') + '</button></div>';
    V.initAll(e);
  };
  NS.runExport = function () {
    var n = P.rows.length; if (!n || P.offline()) return;
    var xlsx = $('#cr-xf [aria-checked="true"]').getAttribute('data-value') === 'xlsx', all = $('input[name="cr-xc"]:checked').value === 'all', tx = $('#cr-xt').checked;
    var cols = all ? NS.COLS.concat(P.fieldCols()) : P.visibleCols(), name = P.fileStamp() + (xlsx ? '.xlsx.csv' : '.csv');
    V.popover.close('cr-export');
    var csv = P.csvOf(P.rows, cols, tx);
    if (xlsx || n > 5000) {
      var t = V.toast.progress('Preparing export… ' + fmt.count(n) + ' calls', { value: 20 });
      setTimeout(function () { t.update({ value: 70 }); }, 500);
      setTimeout(function () { t.dismiss(); V.toast({ kind: 'success', message: 'Export ready · link valid 1 h', action: { label: 'Download', onClick: function () { P.download(name, csv, 'text/csv'); } }, persistent: true }); }, 1200);
    } else { P.download(name, csv, 'text/csv'); V.toast.success('Exported ' + fmt.count(n) + ' calls · ' + name); }
  };
})(window, document);
