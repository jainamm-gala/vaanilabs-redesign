/* Vaani Labs prototype · Analytics (spec 03-pages/04 §3) · core: range, StatStrip, scope, exports, states.
   Numbers come from the same metrics layer as Call reports (pages/call-reports-query.js), so every drill-down opens
   exactly the calls it counted. Sections are drawn by analytics-sections.js. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, esc = U.esc, fmt = V.fmt, $ = U.$, $$ = U.$$;
  var A = NS.an, P = A.page = {};
  var q = new URLSearchParams(w.location.search);
  P.range = q.get('range') || '30d'; P.test = q.get('test') === '1'; P.flow = q.get('flow') || null;
  P.tables = (q.get('table') || '').split(',').filter(Boolean); P.proto = q.get('state') || null;
  P.member = P.proto === 'member'; P.updatedAt = fmt.now().toISOString();
  P.flag = function (s) { return P.proto === s; };
  var MINUS = '−';

  /* ---------- data for the range (the stats endpoint) ---------- */
  P.compute = function () {
    P.R = NS.range(P.range) || NS.range('30d');
    if (!NS.range(P.range)) P.range = '30d';
    var base = NS.baseSet(P.test);
    P.base = base;
    P.rows = base.filter(function (c) { return NS.inRange(c, P.R); });
    P.prevR = NS.prevRange(P.R); P.prev = base.filter(function (c) { return NS.inRange(c, P.prevR); });
    P.days = []; for (var i = 0; i < P.R.days; i++) P.days.push(NS.addDays(P.R.from, i));
    P.byDay = {}; P.days.forEach(function (x) { P.byDay[x] = []; }); P.rows.forEach(function (c) { var k = NS.dayOf(c); if (P.byDay[k]) P.byDay[k].push(c); });
    P.stats = NS.stats(P.rows); P.prevStats = NS.stats(P.prev);
    P.minutes = P.days.reduce(function (a, x) { return a + NS.minutesOn(x, P.byDay[x]); }, 0);
    var pd = []; for (var j = 0; j < P.prevR.days; j++) pd.push(NS.addDays(P.prevR.from, j));
    P.prevMinutes = pd.reduce(function (a, x) { return a + NS.minutesOn(x, P.prev); }, 0);
    if (P.flag('first-use')) { P.rows = []; P.prev = []; P.stats = NS.stats([]); P.prevStats = NS.stats([]); P.minutes = 0; P.prevMinutes = 0; P.days.forEach(function (x) { P.byDay[x] = []; }); }
  };
  P.rangeWords = function () { return P.R.custom ? P.R.label : P.R.words; };           /* "last 30 days" or "1–26 Sep 2026" */
  P.RangeWords = function () { var s = P.rangeWords(); return s.charAt(0).toUpperCase() + s.slice(1); };
  P.prevWords = function () { return P.R.days === 1 ? 'previous day' : 'previous ' + P.R.days + ' days'; };
  P.whenParam = function () { return P.R.preset ? P.R.preset : P.R.from === P.R.to ? P.R.from : P.R.from + '..' + P.R.to; };
  P.href = function (o) { o = o || {}; return NS.reportsHref({ view: o.view, when: o.when || P.whenParam(), f: o.f, test: P.test }); };

  /* ---------- deltas: arrow + sign + words, coloured by deltaTone (§1.1, data-nav §4.7) ---------- */
  function delta(v, pv, up, points) {
    if (!P.prev.length) return { cls: 'delta--flat', icon: 'minus', text: 'No calls in the ' + P.prevWords(), words: 'no calls in the ' + P.prevWords() };
    var diff = points ? Math.round((v - pv) * 100) : (pv ? (v - pv) / pv : 0), small = points ? Math.abs(diff) < 1 : Math.abs(diff) < 0.01 || Math.abs(v - pv) < 1;
    if (small) return { cls: 'delta--flat', icon: 'minus', text: 'No change', words: 'no change vs ' + P.prevWords() };
    var rise = diff > 0, n = points ? Math.abs(diff) + ' pts' : Math.round(Math.abs(diff) * 100) + '%';
    var cls = up === 'neutral' ? 'delta--flat' : (rise === (up === 'good') ? 'delta--good' : 'delta--bad');
    return { cls: cls, icon: rise ? 'arrow-up' : 'arrow-down', text: (rise ? '+' : MINUS) + n + ' vs ' + P.prevWords(), short: (rise ? '+' : MINUS) + n + ' vs prev. ' + (P.R.days === 1 ? 'day' : P.R.days + ' days'), words: (rise ? 'up ' : 'down ') + n + ' vs ' + P.prevWords() };
  }
  /* Delta text wraps inside its cell (§4.6); "30 days" never splits. The phone 2 × 2 grid shows "vs prev. 30 days"; the
     link’s accessible name always carries the full words. */
  function deltaText(dl) {
    var nb = function (s) { return esc(s).replace(/ (\d+) days$/, ' $1&nbsp;days'); };
    return dl.short ? '<span class="an-dl-l">' + nb(dl.text) + '</span><span class="an-dl-s">' + nb(dl.short) + '</span>' : '<span>' + nb(dl.text) + '</span>';
  }
  function series(metric) {
    return P.days.map(function (x) { var r = P.byDay[x], s = NS.stats(r); return metric === 'calls' ? r.length : metric === 'answered' ? (s.calls ? Math.round(s.answeredPct * 100) : 0) : metric === 'avg_talk' ? s.avgTalk : NS.minutesOn(x, r); });
  }
  function valText(metric, v) { return metric === 'answered' ? v + '%' : metric === 'avg_talk' ? fmt.duration(v) || '0s' : metric === 'minutes_used' ? fmt.count(v) + ' min' : fmt.count(v); }

  /* ---------- StatStrip (spec §4.6): hairline cells, each one link, ⓘ before it, trend preview on hover or focus ---------- */
  P.renderStrip = function () {
    var s = P.stats, ps = P.prevStats, loading = P.flag('loading');
    var cells = [
      { id: 'calls', v: s.calls, pv: ps.calls, show: fmt.count(s.calls), href: P.href() },
      { id: 'answered', v: s.answeredPct || 0, pv: ps.answeredPct || 0, show: s.calls ? Math.round(s.answeredPct * 100) : '–', unit: s.calls ? '%' : '', points: true, href: P.href({ f: { result: ['completed', 'voicemail'] } }) },
      { id: 'avg_talk', v: s.avgTalk, pv: ps.avgTalk, show: s.talked ? fmt.duration(s.avgTalk) : '–', href: P.href({ f: { result: ['completed', 'voicemail'] } }) },
      { id: 'minutes_used', v: P.minutes, pv: P.prevMinutes, show: fmt.count(P.minutes), unit: 'min', href: 'billing.html#usage' }
    ];
    $('#an-strip').setAttribute('aria-busy', loading ? 'true' : 'false');
    $('#an-strip').innerHTML = cells.map(function (c) {
      var M = NS.METRICS[c.id], dl = delta(c.v, c.pv, M.up, c.points), ser = series(c.id);
      var facts = ser.length < 7 ? 'Not enough data yet for a trend.' : 'From ' + valText(c.id, ser[0]) + ' on ' + NS.dayLabel(P.days[0]) + ' to ' + valText(c.id, ser[ser.length - 1]) + ' on ' + NS.dayLabel(P.days[P.days.length - 1]) + ', low ' + valText(c.id, Math.min.apply(null, ser)) + ', high ' + valText(c.id, Math.max.apply(null, ser)) + '.';
      var val = loading ? '<span class="sk sk--num an-sk-val" aria-hidden="true"></span>' : '<span class="stat-value">' + esc(c.show) + (c.unit ? (c.unit === '%' ? '%' : '<span class="stat-unit">' + c.unit + '</span>') : '') + '</span>';
      var del = loading ? '<span class="sk sk--meta an-sk-delta" aria-hidden="true"></span>' : '<span class="delta ' + dl.cls + '">' + V.icon(dl.icon, 'xs') + deltaText(dl) + '</span>';
      var name = M.label + ', ' + (loading ? 'loading' : c.show + (c.unit === 'min' ? ' minutes' : c.unit || '') + ', ' + dl.words + ', ' + P.rangeWords());
      /* loading (§3.6, §4.6): no values anywhere until the data arrives, so the trend sentence is not rendered either */
      var described = loading ? '' : ' aria-describedby="an-tr-' + c.id + '"', factsEl = loading ? '' : '<span class="sr-only" id="an-tr-' + c.id + '">' + esc(facts) + '</span>';
      return '<div class="kstrip-cell an-cell" data-metric="' + c.id + '"><div class="stat-label"><span>' + esc(M.label) + '</span><button class="ibtn" type="button" aria-label="About ' + esc(M.label) + '" data-tooltip="' + esc(M.def) + '"><i data-icon="info" data-size="sm"></i></button></div>' +
        '<a class="an-cell-link" href="' + esc(c.href) + '" aria-label="' + esc(name) + '"' + described + '>' + val + del + '</a>' + factsEl + '</div>';
    }).join('');
    V.initAll($('#an-strip'));
    $('#an-scope').innerHTML = esc(P.RangeWords() + ' · calls, not legs · test calls ' + (P.test ? 'included' : 'excluded')) + ' · <a href="' + esc(P.href()) + '">Open these calls in Call reports</a>';
  };
  /* Trend preview: a ChartTooltip under the cell, never on touch, never focusable; Esc hides it. */
  var trend = null, trendT = null;
  function showTrend(cell) {
    if (V.bp.coarse() || P.flag('loading')) return;
    var id = cell.getAttribute('data-metric'), M = NS.METRICS[id], ser = series(id);
    if (!trend) { trend = d.createElement('div'); trend.className = 'ctip an-trend'; trend.setAttribute('aria-hidden', 'true'); d.body.appendChild(trend); }
    trend.innerHTML = '<div class="ctip-head">' + esc(M.label + ' · ' + P.rangeWords()) + '</div>' + (ser.length < 7 ? '<p class="an-trend-row">Not enough data yet</p>' :
      A.trendSvg(ser) + '<p class="an-trend-row u-fg-2">' + esc(NS.dayLabel(P.days[0]) + ' ' + valText(id, ser[0]) + ' → ' + NS.dayLabel(P.days[P.days.length - 1]) + ' ' + valText(id, ser[ser.length - 1])) + '</p><p class="an-trend-row">' + esc('Low ' + valText(id, Math.min.apply(null, ser)) + ' · high ' + valText(id, Math.max.apply(null, ser))) + '</p>');
    if (A.dismissTip) A.dismissTip();   /* one chart tooltip at a time: an open plot tooltip closes first */
    trend.hidden = false;
    var r = cell.getBoundingClientRect(), tw = trend.offsetWidth, th = trend.offsetHeight;
    trend.style.left = Math.min(w.innerWidth - tw - 8, Math.max(8, r.left + 12)) + 'px';
    trend.style.top = (r.bottom + 8 + th > w.innerHeight ? r.top - th - 8 : r.bottom + 8) + 'px';
  }
  function hideTrend() { clearTimeout(trendT); if (trend) trend.hidden = true; }
  A.hideTrend = hideTrend;
  /* R2D-09 (WCAG 1.4.13): one hover overlay at a time. Over the "About …" info button its tooltip wins, and Esc hides both. */
  d.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest('.stat-label button, .stat-label [data-tooltip]')) { hideTrend(); return; } var c = e.target.closest && e.target.closest('.an-cell'); if (!c || e.pointerType === 'touch') return; if (trend && !trend.hidden && trend._cell === c) return; clearTimeout(trendT); trendT = setTimeout(function () { showTrend(c); trend && (trend._cell = c); }, 300); });
  d.addEventListener('pointerout', function (e) { var c = e.target.closest && e.target.closest('.an-cell'); if (c && !c.contains(e.relatedTarget) && !(d.activeElement && d.activeElement.closest('.an-cell') === c)) hideTrend(); });
  d.addEventListener('focusin', function (e) { var a = e.target.closest && e.target.closest('.an-cell-link'); if (a) { showTrend(a.closest('.an-cell')); trend && (trend._cell = a.closest('.an-cell')); } else hideTrend(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && trend && !trend.hidden) { hideTrend(); } }, true);
  w.addEventListener('scroll', hideTrend, true);

  /* ---------- header: meta, range, custom range ---------- */
  P.renderHead = function () {
    var m = $('#an-meta');
    if (P.flag('loading')) return;
    m.innerHTML = esc(fmt.count(P.stats.calls) + ' calls · ' + P.rangeWords()) + '<span class="an-meta-upd"> · ' + esc(P.updating ? 'Updating…' : P.flag('offline') ? 'showing data from ' + fmt.time(P.updatedAt) : 'updated ' + fmt.time(P.updatedAt)) + '</span>';
    $$('.an-range').forEach(function (g) { $$('[role="radio"]', g).forEach(function (r, i) { var on = r.getAttribute('data-value') === P.range; r.setAttribute('aria-checked', on ? 'true' : 'false'); r.setAttribute('tabindex', on || (P.R.custom && i === 0) ? '0' : '-1'); if (P.flag('offline')) r.setAttribute('aria-disabled', 'true'); }); });
    $('#an-custom-l').textContent = P.R.custom ? P.R.label : 'Custom…';
    $('#an-test-item').setAttribute('aria-checked', P.test ? 'true' : 'false');
    if (P.flag('offline')) { $('#an-custom').setAttribute('aria-disabled', 'true'); $('#an-custom').setAttribute('data-tooltip', "You’re offline"); }
  };
  P.writeUrl = function (push) {
    var s = new URLSearchParams(); if (P.range !== '30d') s.set('range', P.range); if (P.test) s.set('test', '1'); if (P.flow) s.set('flow', P.flow); if (P.tables.length) s.set('table', P.tables.join(',')); if (P.proto) s.set('state', P.proto);
    var url = 'analytics.html' + (s.toString() ? '?' + s.toString().replace(/%2C/g, ',').replace(/%40/g, '@') : '');
    try { if (push) w.history.pushState({}, '', url); else w.history.replaceState({}, '', url); } catch (e) { /* ignore */ }
  };
  var rt = null;
  P.setRange = function (r, o) {
    if (P.flag('offline')) return;
    P.range = r; P.updating = true; P.renderHead(); A.renderSectionMetas && A.renderSectionMetas('Updating…');
    clearTimeout(rt); rt = setTimeout(function () { P.updating = false; P.writeUrl(true); P.all(true); V.announce('Showing ' + P.rangeWords()); }, (o && o.now) ? 0 : 250);
  };
  P.all = function (fade) { P.compute(); P.renderHead(); P.renderState(); if (P.flag('forbidden') || P.flag('first-use')) return; P.renderStrip(); A.renderSections(fade); };
  P.renderState = function () {
    var box = $('#an-state'), cb = $('#an-cbar'), ov = $('#an-overview'), grid = $('#an-grid');
    cb.hidden = !P.flag('offline'); cb.innerHTML = P.flag('offline') ? '<div class="cbar" role="status">' + V.icon('cloud-off') + '<span><b>You’re offline.</b> Showing data from ' + esc(fmt.time(P.updatedAt)) + '. Range changes and exports come back when you reconnect.</span></div>' : '';
    var html = '';
    if (P.flag('forbidden')) html = '<div class="empty empty--page">' + V.icon('lock', 'lg') + '<h2 class="empty-title">Only admins and team leads can see Analytics.</h2><p>Ask Rohit S. for access.</p><div class="empty-actions"><a class="btn" href="cockpit.html">Go to Cockpit</a></div></div>';
    else if (P.flag('first-use')) html = '<div class="empty empty--page">' + V.icon('chart-column', 'lg') + '<h2 class="empty-title">No calls to analyse yet</h2><p>Trends, drop-off and intents appear after your agent’s first calls.</p><div class="empty-actions"><a class="btn" href="cockpit.html?test=browser">Place a test call…</a>' + (V.setupComplete() ? '' : '<a class="btn btn--link" href="index.html">Finish setup (' + V.data.setup.done + ' of ' + V.data.setup.total + ')</a>') + '</div></div>';
    box.hidden = !html; box.innerHTML = html; ov.hidden = grid.hidden = !!html;
    $$('.an-range, #an-custom').forEach(function (x) { x.hidden = !!html && P.flag('forbidden'); });
  };

  /* ---------- exports (CSV at once; the PDF report prints this page with the same tokens) ---------- */
  function exportCsv() {
    if (P.flag('offline') || P.flag('loading')) { V.toast.info(P.flag('offline') ? "You’re offline" : 'Wait for the page to finish loading.'); return; }
    var lines = [['Section', 'Label', 'Value'].join(',')], add = function (a, b, c) { lines.push([a, b, c].map(function (x) { x = String(x); return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(',')); };
    add('Scope', P.RangeWords(), 'calls, not legs · test calls ' + (P.test ? 'included' : 'excluded'));
    add('Overview', 'Calls', P.stats.calls); add('Overview', 'Answered', Math.round((P.stats.answeredPct || 0) * 100) + '%'); add('Overview', 'Avg talk time', fmt.duration(P.stats.avgTalk)); add('Overview', 'Minutes used', P.minutes);
    (A.exportRows ? A.exportRows() : []).forEach(function (r) { add(r[0], r[1], r[2]); });
    var name = 'vaani-analytics-' + P.R.from + '-to-' + P.R.to + (P.test ? '-with-tests' : '') + '.csv';
    try { var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })); a.download = name; d.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 300); } catch (e) { /* ignore */ }
    V.toast.success('Exported ' + name);
  }
  function exportPdf() {
    if (P.flag('offline')) { V.toast.info("You’re offline"); return; }
    var t = V.toast.progress('Preparing report…', { value: 30 });
    setTimeout(function () { t.dismiss(); V.toast({ kind: 'success', message: 'Report ready', persistent: true, action: { label: 'Download', onClick: function () { w.print(); } } }); }, 1100);
  }
  d.addEventListener('vaani:menuselect', function (e) {
    var it = e.detail.item; if (!it.closest('#an-more-menu')) return; var a = it.getAttribute('data-act');
    if (a === 'csv') exportCsv(); else if (a === 'pdf') exportPdf();
    else if (a === 'test') { P.test = e.detail.checked; P.writeUrl(true); P.all(true); V.announce(P.test ? 'Test calls included' : 'Test calls excluded'); }
    else if (a === 'refresh') { P.updatedAt = fmt.now().toISOString(); P.all(true); V.announce('Analytics refreshed'); }
    else if (a === 'custom') setTimeout(function () { openCustom($('#an-more')); }, 0);
  });
  /* Custom… opens the DateRangePicker (core §7.1), drawn by pages/analytics-range.js */
  function openCustom(trigger) { if (P.flag('offline') || !A.openCustom) return; A.openCustom(trigger); }
  $('#an-custom').addEventListener('click', function (e) { if (e.currentTarget.getAttribute('aria-disabled') !== 'true') openCustom(e.currentTarget); });
  d.addEventListener('vaani:change', function (e) { if (e.target.classList && e.target.classList.contains('an-range') && e.detail.value) P.setRange(e.detail.value); });
  w.addEventListener('popstate', function () { var s = new URLSearchParams(w.location.search); P.range = s.get('range') || '30d'; P.test = s.get('test') === '1'; P.flow = s.get('flow'); P.all(true); });

  /* ---------- Prototype states (prototype only) ---------- */
  function protoMenu() {
    var S = [['', 'Default'], ['loading', 'Loading'], ['first-use', 'First use · no calls yet'], ['sentiment-error', 'Section failed · sentiment'], ['intents-degraded', 'Intents degraded · last good result'], ['intents-stale', 'Intents stale · Recompute'], ['number-pending', 'Inbound number pending'], ['number-none', 'No inbound number'], ['number-nocalls', 'Number ready · no calls'], ['offline', 'Offline'], ['forbidden', 'Permission · no access'], ['member', 'Permission · member (no Recompute)']];
    var L = [['?range=2026-06-01..2026-06-07', 'Empty range · before the first call'], ['?range=2026-09-23..2026-09-27', 'Not enough data · 5 days'], ['?range=90d', '90 days · weekly bars, no previous period'], ['?range=7d', '7 days · intents not computed'], ['?test=1', 'Include test calls'], ['?table=calls,sentiment,hours', 'Every chart as a table']];
    $('#an-proto-menu').innerHTML = '<span class="menu-group-label">Prototype only · page states</span>' + S.map(function (s) { return '<button class="menu-item" role="menuitemradio" type="button" aria-checked="' + ((P.proto || '') === s[0]) + '" data-state="' + s[0] + '"><span class="menu-check">' + V.icon('check') + '</span><span class="menu-text"><span>' + esc(s[1]) + '</span></span></button>'; }).join('') +
      '<div class="menu-sep" role="separator"></div><span class="menu-group-label">Jump to</span>' + L.map(function (l) { return '<a class="menu-item" role="menuitem" href="analytics.html' + l[0] + '"><span class="menu-check"></span><span class="menu-text"><span>' + esc(l[1]) + '</span></span></a>'; }).join('');
  }
  d.addEventListener('vaani:menuselect', function (e) { var it = e.detail.item; if (!it.closest('#an-proto-menu') || !it.hasAttribute('data-state')) return; var s = it.getAttribute('data-state'); w.location.href = 'analytics.html' + (s ? '?state=' + s : ''); });

  V.ready(function () {
    protoMenu();
    P.compute(); P.renderHead(); P.renderState();
    if (P.flag('forbidden') || P.flag('first-use')) { $('#an-meta').textContent = P.flag('first-use') ? '0 calls · ' + P.rangeWords() : ''; return; }
    P.renderStrip(); A.renderSections(false);
    if (P.flag('loading')) { $('#an-scope').textContent = 'Updated when loaded'; V.announce('Loading analytics…'); }
  });
})(window, document);
