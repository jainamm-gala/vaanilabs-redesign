/* Vaani Labs prototype · Analytics · the six ReportSections (spec §3.5, §4.7): titled sections divided by hairlines,
   no cards. Single-series marks are --chart-neutral; only the hovered or focused period is --chart-highlight. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, esc = U.esc, fmt = V.fmt, $ = U.$, $$ = U.$$;
  var A = NS.an = NS.an || {};
  var SERIES = [{ key: 'positive', label: 'Positive', cls: 's-pos' }, { key: 'neutral', label: 'Neutral', cls: 's-neu' }, { key: 'mixed', label: 'Mixed', cls: 's-mix' }, { key: 'negative', label: 'Negative', cls: 's-neg' }];
  function P() { return A.page; }
  function head(id, title, meta, extra) { return '<div class="an-sec-head"><h2 id="an-h-' + id + '">' + esc(title) + '</h2><span class="an-sec-meta" id="an-m-' + id + '">' + meta + '</span><span class="l-spacer"></span>' + (extra || '') + '</div>'; }
  function tableBtn(id, title) { var on = P().tables.indexOf(id) >= 0; return '<button class="btn btn--sm btn--tertiary" type="button" aria-pressed="' + on + '" data-table="' + id + '" aria-label="View ' + esc(title) + ' as a table">View as table</button>'; }
  function foot(t) { return '<p class="an-foot">' + t + '</p>'; }
  function emptyPlot(words) { return '<div class="chart-empty an-empty">' + V.icon('chart-column', 'lg') + '<p>No calls ' + (P().R.custom ? (P().R.days === 1 ? 'on ' : 'in ') : 'in the ') + esc(words) + '.</p>' + (P().range !== '30d' ? '<button type="button" class="btn btn--link" data-range="30d">Show 30 days</button>' : '') + '</div>'; }
  function every(el, n, min) { var wd = el ? el.clientWidth || 600 : 600; return Math.max(1, Math.ceil(n / Math.max(2, Math.floor(wd / (min || 64))))); }
  function signed(n) { return n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0'; }
  /* Announcements use whole words (data-nav §11.8: "Thursday 24 September: 31 calls, 7 more than the previous Thursday");
     the tooltip keeps the short forms of NS.weekday() and NS.dayLabel(). */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function dayName(iso) { return DAYS[new Date(NS.dayIndex(iso) * 86400000).getUTCDay()]; }
  function longDate(iso) { var t = new Date(NS.dayIndex(iso) * 86400000); return t.getUTCDate() + ' ' + MONTHS[t.getUTCMonth()]; }
  function longDay(iso) { return dayName(iso) + ' ' + longDate(iso); }
  function vsPrev(diff, iso) { var p = 'the previous ' + dayName(iso); return diff > 0 ? diff + ' more than ' + p : diff < 0 ? Math.abs(diff) + ' fewer than ' + p : 'the same as ' + p; }
  function calls1(n) { return fmt.count(n) + (n === 1 ? ' call' : ' calls'); }
  function loadingPlot() { return '<div class="chart an-plot an-plot--loading" aria-hidden="true"><svg width="100%" height="100%"><line class="chart-grid" x1="0" x2="100%" y1="25%" y2="25%"/><line class="chart-grid" x1="0" x2="100%" y1="50%" y2="50%"/><line class="chart-grid" x1="0" x2="100%" y1="75%" y2="75%"/><line class="chart-axis" x1="0" x2="100%" y1="99%" y2="99%"/></svg></div>'; }
  function loadingRows() { return '<div class="an-skrows" aria-hidden="true">' + [72, 58, 44, 30].map(function (x) { return '<span class="sk" style="width: ' + x + '%"></span>'; }).join('') + '</div>'; }

  /* buckets: days (≤ 31) or weeks (> 31: "Calls per week", "Week of 15 Sep") */
  function buckets() {
    var p = P(), out = [];
    if (p.R.days <= 31) p.days.forEach(function (x) { out.push({ from: x, to: x, rows: p.byDay[x], label: NS.dayLabel(x), head: NS.weekday(x) + ' ' + NS.dayLabel(x), when: x }); });
    else for (var i = 0; i < p.days.length; i += 7) { var ds = p.days.slice(i, i + 7), rows = [].concat.apply([], ds.map(function (x) { return p.byDay[x]; })); out.push({ from: ds[0], to: ds[ds.length - 1], rows: rows, label: NS.dayLabel(ds[0]), head: 'Week of ' + NS.dayLabel(ds[0]), when: ds[0] + '..' + ds[ds.length - 1], weekly: true }); }
    out.forEach(function (b) { b.long = b.weekly ? 'Week of ' + longDate(b.from) : longDay(b.from); });
    return out;
  }
  function countOn(day) { return P().base.filter(function (c) { return NS.dayOf(c) === day; }).length; }

  /* ---------- 1 · Calls per day ---------- */
  function calls(fade) {
    var p = P(), sec = $('#an-s-calls'), B = buckets(), weekly = p.R.days > 31, title = weekly ? 'Calls per week' : 'Calls per day', loading = p.flag('loading');
    sec.innerHTML = head('calls', title, esc(loading ? 'Loading…' : p.RangeWords()), loading || !p.rows.length ? '' : tableBtn('calls', title)) + '<div class="an-sec-body" id="an-b-calls"></div>' + foot((p.test ? 'Test calls included' : 'Test calls excluded') + ' · Select a ' + (weekly ? 'week' : 'day') + ' to open its calls');
    var body = $('#an-b-calls');
    if (loading) { body.innerHTML = loadingPlot(); sec.setAttribute('aria-busy', 'true'); return; }
    sec.removeAttribute('aria-busy');
    if (!p.rows.length) { body.innerHTML = emptyPlot(p.rangeWords()); return; }
    var data = B.map(function (b) {
      var n = b.rows.length, rows = [['Calls', fmt.count(n)]], say = b.long + ': ' + calls1(n);
      if (!weekly) { var prev = countOn(NS.addDays(b.from, -7)); rows.push(['vs previous ' + NS.weekday(b.from), signed(n - prev)]); say += ', ' + vsPrev(n - prev, b.from); }
      return { label: b.label, head: b.head, long: b.long, value: n, rows: rows, say: say, href: p.href({ when: b.when }) };
    });
    var top = data.reduce(function (m, x) { return x.value > m.value ? x : m; }, data[0]);
    if (p.tables.indexOf('calls') >= 0) { body.innerHTML = A.table(title + ', ' + p.rangeWords(), [weekly ? 'Week' : 'Day', 'Calls'], data.map(function (x) { return ['<a href="' + esc(x.href) + '">' + esc(x.head) + '</a>', fmt.count(x.value)]; })); return; }
    body.innerHTML = '<div id="an-c-calls"></div>'; var el = $('#an-c-calls');
    A.chart(el, { kind: 'bars', data: data, periodWord: weekly ? 'weeks' : 'days', fade: fade,
      summary: title + ', ' + p.rangeWords() + ': from ' + data[0].value + ' on ' + data[0].long + ' to ' + data[data.length - 1].value + ' on ' + data[data.length - 1].long + '; most on ' + top.long + ' with ' + top.value,
      labelAt: function (i, n) { var e = every(el, n, 64); return (n - 1 - i) % e === 0; }, say: function (i) { return data[i].say; } });
  }

  /* ---------- 2 · Sentiment by day (fixed order, grey neutral; legend items are drill-down links, R4) ---------- */
  function sentiment(fade) {
    var p = P(), sec = $('#an-s-sent'), B = buckets(), weekly = p.R.days > 31, loading = p.flag('loading'), title = weekly ? 'Sentiment by week' : 'Sentiment by day';
    var tot = p.stats.sentiment;
    sec.innerHTML = head('sent', title, esc(loading ? 'Loading…' : p.RangeWords()), loading || !p.rows.length || p.flag('sentiment-error') ? '' : tableBtn('sentiment', title)) + '<div class="an-sec-body" id="an-b-sent"></div>';
    var body = $('#an-b-sent');
    if (loading) { body.innerHTML = loadingPlot(); sec.setAttribute('aria-busy', 'true'); return; }
    sec.removeAttribute('aria-busy');
    if (p.flag('sentiment-error')) { body.innerHTML = '<div class="ierr an-secerr" role="status"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t load sentiment. <button type="button" class="btn btn--link" data-retry-sent>Retry</button></span></div></div>'; return; }
    if (!p.rows.length) { body.innerHTML = emptyPlot(p.rangeWords()); return; }
    var legend = '<ul class="legend an-legend" aria-label="Sentiment totals, links to those calls">' + SERIES.map(function (s) { return '<li class="legend-item"><a href="' + esc(p.href(s.key === 'neutral' ? { f: { sentiment: ['neutral'] } } : { view: s.key })) + '"><span class="legend-sw ' + s.cls + '" data-mark></span>' + s.label + ' <b>' + fmt.count(tot[s.key]) + '</b></a></li>'; }).join('') + '</ul>';
    var data = B.map(function (b) {
      var parts = { positive: 0, neutral: 0, mixed: 0, negative: 0 }; b.rows.forEach(function (c) { if (parts[c.sentiment] != null) parts[c.sentiment] += 1; });
      var rows = SERIES.slice().reverse().map(function (s) { return [s.label, fmt.count(parts[s.key]), s.cls]; });
      if (!weekly) { var prevNeg = P().base.filter(function (c) { return NS.dayOf(c) === NS.addDays(b.from, -7) && c.sentiment === 'negative'; }).length; rows.push(['Negative vs previous ' + NS.weekday(b.from), signed(parts.negative - prevNeg)]); }
      return { label: b.label, head: b.head, long: b.long, parts: parts, rows: rows, hrefFor: function (key) { return p.href(key === 'neutral' ? { f: { sentiment: ['neutral'] }, when: b.when } : { view: key, when: b.when }); } };
    });
    /* tooltip rows list series top-down; the highlighted row follows the focused segment */
    data.forEach(function (x) { x.rows = SERIES.map(function (s) { return [s.label, fmt.count(x.parts[s.key]), s.cls]; }).concat(x.rows.slice(4)); });
    var fn = fmt.count(tot.unscored) + ' calls not scored' + (p.R.days < 7 ? ' · Trends appear after 7 days of calls.' : '') + ' · Legend items open those calls';
    if (p.tables.indexOf('sentiment') >= 0) { body.innerHTML = legend + A.table(title + ', ' + p.rangeWords(), [weekly ? 'Week' : 'Day'].concat(SERIES.map(function (s) { return s.label; })), data.map(function (x) { return [esc(x.head)].concat(SERIES.map(function (s) { return '<a href="' + esc(x.hrefFor(s.key)) + '">' + fmt.count(x.parts[s.key]) + '</a>'; })); })) + foot(fn); return; }
    body.innerHTML = legend + '<div id="an-c-sent"></div>' + foot(fn); var el = $('#an-c-sent');
    A.chart(el, { kind: 'stacked', data: data, series: SERIES, periodWord: weekly ? 'weeks, and up and down between sentiments' : 'days, and up and down between sentiments', fade: fade,
      summary: title + ', ' + p.rangeWords() + ': ' + SERIES.map(function (s) { return tot[s.key] + ' ' + s.label.toLowerCase(); }).join(', ') + '; ' + tot.unscored + ' not scored',
      labelAt: function (i, n) { var e = every(el, n, 64); return (n - 1 - i) % e === 0; },
      say: function (i, k) { var x = data[i]; return x.long + ', ' + SERIES[k].label + ' ' + x.parts[SERIES[k].key] + ' of ' + calls1(SERIES.reduce(function (a, s) { return a + x.parts[s.key]; }, 0)); } });
  }

  /* ---------- 3 · Where callers drop off (per flow version; versions never mix) ---------- */
  function funnel() {
    var p = P(), sec = $('#an-s-drop'), loading = p.flag('loading'), talked = p.rows.filter(function (c) { return c.result === 'completed' && c.path && c.path.length; });
    var counts = {}; talked.forEach(function (c) { var k = NS.flowKey(c); counts[k] = (counts[k] || 0) + 1; });
    var keys = Object.keys(counts).filter(function (k) { return NS.FLOWS[k] && !NS.FLOWS[k].draft; }).sort(function (a, b) { return counts[b] - counts[a]; });
    var sel = p.flow && NS.FLOWS[p.flow] ? p.flow : keys[0] || 'flow_7c21@7', F = NS.FLOWS[sel], entered = counts[sel] || 0;
    var opts = (keys.indexOf(sel) < 0 ? [sel].concat(keys) : keys).map(function (k) { return '<div class="option" role="option" data-value="' + k + '" aria-selected="' + (k === sel) + '"><span class="option-main"><span class="option-label">' + esc(NS.flowLabel(k)) + '</span><span class="option-desc">' + fmt.count(counts[k] || 0) + ' calls entered</span></span>' + V.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('');
    var switcher = loading ? '' : '<span class="sr-only" id="an-fs-l">Flow for drop-off</span><button type="button" class="select select--sm select--auto an-fs" data-select aria-controls="an-fs-lb" aria-labelledby="an-fs-l an-fs-v"><span class="select-value" id="an-fs-v">' + esc(NS.flowLabel(sel)) + '</span><i data-icon="chevron-down" data-size="sm"></i></button><div class="listbox" id="an-fs-lb" role="listbox" aria-labelledby="an-fs-l" hidden>' + opts + '</div>';
    sec.innerHTML = head('drop', 'Where callers drop off', '', switcher) + '<p class="an-sub" id="an-sub-drop">' + (loading ? 'Loading…' : esc(NS.flowLabel(sel) + ' · ' + fmt.count(entered) + ' calls entered · ' + p.rangeWords())) + '</p><div class="an-sec-body" id="an-b-drop"></div>';
    var body = $('#an-b-drop');
    if (loading) { body.innerHTML = loadingRows(); sec.setAttribute('aria-busy', 'true'); return; }
    sec.removeAttribute('aria-busy');
    if (!keys.length && !p.rows.length) { body.innerHTML = emptyPlot(p.rangeWords()); V.initAll(sec); return; }
    if (!entered) { body.innerHTML = '<p class="an-none">No calls reached ' + esc(NS.flowLabel(sel)) + (p.R.custom ? ' in ' : ' in the ') + esc(p.rangeWords()) + '. Choose another flow.</p>'; V.initAll(sec); return; }
    var rows = F.funnel.map(function (step) {
      var reached = talked.filter(function (c) { return NS.flowKey(c) === sel && c.path.indexOf(step) >= 0; }).length;
      var dropped = talked.filter(function (c) { return NS.flowKey(c) === sel && !c.outcome && c.lastStep === step; }).length;
      return { step: step, no: F.steps[step][0], label: F.steps[step][1], reached: reached, dropped: dropped, share: reached ? dropped / reached : 0 };
    });
    var worst = rows.reduce(function (m, r) { return r.share > m.share ? r : m; }, rows[0]);
    body.innerHTML = '<ol class="funnel an-funnel" aria-label="Drop-off by step">' + rows.map(function (r) {
      var drop = r.dropped ? '<a href="' + esc(p.href({ f: { flow: [sel], last_step: [r.step], outcome: ['none'] } })) + '" aria-label="' + esc('Open the ' + r.dropped + ' calls that dropped at step ' + r.no + ', ' + Math.round(r.share * 100) + '% drop') + '">' + Math.round(r.share * 100) + '% drop</a>' : 'no drop';
      return '<li class="funnel-step"><a class="an-fl" href="flow-designer.html?node=' + r.step + '&amp;flow=' + F.id + '&amp;version=' + F.version + '" aria-label="' + esc('Step ' + r.no + ', ' + r.label + '. Open in the Flow Designer') + '">' + r.no + ' · ' + esc(r.label) + '</a>' +
        '<span class="funnel-value">' + fmt.count(r.reached) + ' · ' + drop + (r === worst && r.dropped ? ' · <b class="an-largest">largest</b>' : '') + '</span><span class="funnel-track"><i style="width: ' + (entered ? (r.reached / entered * 100).toFixed(1) : 0) + '%"></i></span></li>';
    }).join('') + '</ol>' + foot('Drop-off counts calls that ended at a step without an outcome · other versions are not counted');
    V.initAll(sec);
  }

  /* Three example calls per intent: outcomes that fit the intent first, one per distinct summary. */
  var FIT = { int_visit: ['Visit booked'], int_price: ['Interested'], int_callback: ['Callback', 'Call later'], int_loan: ['Transferred'], int_payment: ['Promise to pay', 'Call later'], int_location: ['Visit booked', 'Callback'], int_possession: ['Interested', 'Not interested'], int_parking: ['Visit booked'], int_other: ['Not interested'] };
  function examples(list, intent) {
    var mine = list.filter(function (c) { return c.intent === intent && c.summary; }), fit = FIT[intent] || [], seen = {}, out = [];
    mine.filter(function (c) { return fit.indexOf(c.outcome) >= 0; }).concat(mine).forEach(function (c) { var k = c.outcome + '|' + (c.summary || '').replace(c.leadName ? c.leadName.split(' ')[0] : '', ''); if (out.length < 3 && !seen[k] && out.indexOf(c) < 0) { seen[k] = 1; out.push(c); } });
    if (out.length < 3) mine.forEach(function (c) { if (out.length < 3 && out.indexOf(c) < 0) out.push(c); });
    return out;
  }

  /* ---------- 4 · Why people call (intents; degraded, stale and short-range states) ---------- */
  function intents() {
    var p = P(), sec = $('#an-s-why'), loading = p.flag('loading'), analysed = p.rows.filter(function (c) { return c.intent; });
    var admin = !p.member, stale = p.flag('intents-stale'), degraded = p.flag('intents-degraded');
    /* shorter than the clustering window: the meta must not claim an analysis the body says does not exist (§3.6) */
    var notComputed = p.R.days < 30 && !p.R.custom;
    var meta = loading ? 'Loading…' : notComputed ? esc(p.RangeWords() + ' · not computed for this range') : !p.rows.length ? esc(p.RangeWords()) : stale || degraded ? esc(p.RangeWords() + ' · updated 21 Sep') : esc(p.RangeWords() + ' · ' + fmt.count(analysed.length) + ' of ' + fmt.count(p.rows.length) + ' calls analysed · updated ' + (A.recomputedAt ? fmt.time(A.recomputedAt) : '26 Sep, 4:01 pm'));
    sec.innerHTML = head('why', 'Why people call', meta, stale && admin && !notComputed ? '<button class="btn btn--sm btn--tertiary" type="button" data-recompute>Recompute</button>' : '') + '<div class="an-sec-body" id="an-b-why"></div>';
    var body = $('#an-b-why');
    if (loading) { body.innerHTML = loadingRows(); sec.setAttribute('aria-busy', 'true'); return; }
    sec.removeAttribute('aria-busy');
    if (notComputed) { body.innerHTML = '<p class="an-none">Intents are computed for 30 and 90 days. <button type="button" class="btn btn--link" data-range="30d">Switch to 30 days</button></p>'; return; }
    if (!p.rows.length) { body.innerHTML = emptyPlot(p.rangeWords()); return; }
    var cnt = {}; analysed.forEach(function (c) { cnt[c.intent] = (cnt[c.intent] || 0) + 1; });
    var list = NS.INTENTS.filter(function (x) { return x[0] !== 'int_other' && cnt[x[0]]; }).sort(function (a, b) { return cnt[b[0]] - cnt[a[0]]; });
    var top = list.slice(0, 8), other = (cnt.int_other || 0) + list.slice(8).reduce(function (a, x) { return a + cnt[x[0]]; }, 0), max = Math.max.apply(null, top.map(function (x) { return cnt[x[0]]; }).concat([other, 1]));
    if (other) top.push(['int_other', 'Other']);
    var status = degraded ? '<p class="status status--md status--warning an-intstatus">' + V.icon('triangle-alert') + 'Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. <button type="button" class="btn btn--link" data-retry-int>Retry</button></p>'
      : stale ? '<p class="status status--md status--warning an-intstatus">' + V.icon('triangle-alert') + 'Stale · computed 5 days ago' + (admin ? '' : ' · an admin can recompute') + '</p>' : A.recomputing ? '<p class="status status--md status--progress an-intstatus">' + V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Recomputing… · about 1 min</p>' : '';
    body.innerHTML = status + '<ol class="barlist an-intents" aria-label="Intents, share of analysed calls">' + top.map(function (x, i) {
      var n = x[0] === 'int_other' ? other : cnt[x[0]], ex = examples(analysed, x[0]), id = 'an-ex-' + i;
      return '<li class="an-int' + (x[0] === 'int_other' ? ' an-int--other' : '') + '"><a class="barlist-row' + (x[0] === 'int_other' ? ' barlist-row--other' : '') + '" href="' + esc(p.href({ f: { intent: [x[0]] } })) + '"><span class="barlist-label" data-tooltip-overflow><span class="an-il">' + esc(x[1]) + '</span></span><span class="barlist-track"><i style="width: ' + (n / max * 100).toFixed(1) + '%"></i></span><span class="barlist-value">' + fmt.count(n) + ' · ' + Math.round(n / analysed.length * 100) + '%</span></a>' +
        (ex.length ? '<button type="button" class="btn btn--link an-ex" aria-expanded="false" aria-controls="' + id + '" aria-label="Show example calls for ' + esc(x[1]) + '">Examples</button><ul class="an-exlist" id="' + id + '" hidden>' + ex.map(function (c) { var first = c.leadName ? c.leadName.split(' ')[0] : ''; return '<li><a href="call-reports.html?call=' + c.id + '">' + esc((first ? c.summary.split(first).join('The caller') : c.summary).replace(/^The caller /, 'The caller ')) + '</a></li>'; }).join('') + '</ul>' : '') + '</li>';
    }).join('') + '</ol>' + foot('Top 8 intents, then Other · one main intent per call');
  }

  /* ---------- 5 · When calls come in (24 hour bars, IST; replaces the HeatStrip, R10) ---------- */
  function hours(fade) {
    var p = P(), sec = $('#an-s-hour'), loading = p.flag('loading'), H = []; for (var h = 0; h < 24; h++) H.push(0);
    p.rows.forEach(function (c) { H[NS.hourOf(c)] += 1; });
    var max = Math.max.apply(null, H), hot = [], ranges = [], i;
    for (i = 0; i < 24; i++) if (max && H[i] >= max * 0.8) hot.push(i);
    hot.forEach(function (x) { var last = ranges[ranges.length - 1]; if (last && last[1] === x - 1) last[1] = x; else ranges.push([x, x]); });
    var firstNon = H.findIndex(function (x) { return x > 0; });
    /* loading (§3.6): no values anywhere until the data arrives, so no busiest-hours line either */
    var summary = max && !loading ? 'Busiest ' + ranges.map(function (r) { return NS.hourLabel(r[0]) + ' to ' + NS.hourLabel((r[1] + 1) % 24); }).join(' and ') + (firstNon > 0 ? ' · quietest before ' + NS.hourLabel(firstNon) : '') : '';
    sec.innerHTML = head('hour', 'When calls come in', esc(loading ? 'Loading…' : 'IST · ' + p.rangeWords()), loading || !p.rows.length ? '' : tableBtn('hours', 'When calls come in')) + (summary ? '<p class="an-sub">' + esc(summary) + '</p>' : '') + '<div class="an-sec-body" id="an-b-hour"></div>' + foot('All calls, inbound and outbound · Select an hour to open its calls');
    var body = $('#an-b-hour');
    if (loading) { body.innerHTML = loadingPlot(); sec.setAttribute('aria-busy', 'true'); return; }
    sec.removeAttribute('aria-busy');
    if (!p.rows.length) { body.innerHTML = emptyPlot(p.rangeWords()); return; }
    var data = H.map(function (n, x) { return { label: NS.hourLabel(x), head: NS.hourLabel(x) + ' to ' + NS.hourLabel((x + 1) % 24), value: n, rows: [['Calls', fmt.count(n)]], href: p.href({ f: { hour: [String(x)] } }) }; });
    if (p.tables.indexOf('hours') >= 0) { body.innerHTML = A.table('Calls by hour, IST, ' + p.rangeWords(), ['Hour (IST)', 'Calls'], data.map(function (x) { return ['<a href="' + esc(x.href) + '">' + esc(x.head) + '</a>', fmt.count(x.value)]; })); return; }
    body.innerHTML = '<div id="an-c-hour"></div>'; var el = $('#an-c-hour');
    A.chart(el, { kind: 'bars', data: data, periodWord: 'hours', fade: fade, summary: 'Calls by hour of day, IST, ' + p.rangeWords() + ': ' + summary, labelAt: function (x) { return x % 6 === 0; }, say: function (x) { return data[x].head + ': ' + data[x].value + ' calls'; } });
  }

  /* The inbound line’s state comes from the shell’s Baseline facts (03-pages/00 §5.5), so this section and the Baseline
     always say the same word: "Verified" while setup is incomplete, "Ready" only once it is complete, and the warning
     states (not verified, degraded) when the Baseline shows them. Never a hard-coded "Ready". */
  var LINE = { 'line': ['Ready', 'check', 'success'], 'line-verified': ['Verified', 'check', 'success'], 'line-verifying': ['Verifying · step 2 of 3', 'clock', 'progress'], 'line-unverified': ['Not verified', 'triangle-alert', 'warning'], 'line-degraded': ['Degraded', 'triangle-alert', 'warning'] };
  function lineState() {
    var segs = V.baseline && V.baseline.segments ? V.baseline.segments() : [], s = segs.filter(function (x) { return x.id === 'line'; })[0], SEG = (V.shell && V.shell.SEG) || {}, key = null;
    if (s) Object.keys(SEG).forEach(function (k) { if (SEG[k] === s) key = k; });
    if (!key && s) { var t = String(s.full || ''); key = /not verified/i.test(t) ? 'line-unverified' : /degraded/i.test(t) ? 'line-degraded' : /verifying/i.test(t) ? 'line-verifying' : /verified/i.test(t) ? 'line-verified' : /ready/i.test(t) ? 'line' : null; }
    if (!key) key = V.setupComplete() ? 'line' : 'line-verified';
    var L = LINE[key];
    return { key: key, html:'<span class="status status--' + L[2] + '">' + V.icon(L[1], 'sm') + esc(L[0]) + '</span>' };
  }

  /* ---------- 6 · Calls to your number (reads Phone setup; never links to Billing, F-UX-015) ---------- */
  function number() {
    var p = P(), sec = $('#an-s-num'), org = V.data.org, inb = p.rows.filter(function (c) { return c.direction === 'inbound'; });
    var uniq = {}; inb.forEach(function (c) { uniq[c.leadId || (c.phone ? c.phone.last4 : 'w' + c.id)] = 1; });
    var missed = inb.filter(function (c) { return c.result === 'no_answer' || c.result === 'busy' || c.result === 'failed'; }).length;
    var setup = '<a class="btn btn--sm" href="settings.html#phone">Open Phone setup</a>', body, line = lineState();
    var numRow = '<div class="kv-row"><dt>Inbound number</dt><dd>' + V.ui.phoneText(org.inboundNumber.masked) + line.html + '</dd></div>';
    if (p.flag('number-pending')) body = '<p class="an-numstate">' + V.ui.statusTag('number', 'pending') + ' Your inbound number is being set up. Calls to it will show here.</p>' + setup;
    else if (p.flag('number-none')) body = '<p class="an-numstate">No inbound number yet. Request one in Phone setup.</p>' + setup;
    else if (p.flag('number-nocalls') || (!inb.length && !p.flag('loading'))) body = '<dl class="kv kv--rows">' + numRow + '</dl><p class="an-none">No calls to ' + esc(org.inboundNumber.masked) + (p.R.custom ? ' in ' : ' in the ') + esc(p.rangeWords()) + '.</p>';
    else body = p.flag('loading') ? loadingRows() : '<dl class="kv kv--rows">' + numRow +
      '<div class="kv-row"><dt>Calls received</dt><dd><a href="' + esc(p.href({ f: { direction: ['inbound'] } })) + '">' + fmt.count(inb.length) + '</a></dd></div><div class="kv-row"><dt>Unique callers</dt><dd class="u-num">' + fmt.count(Object.keys(uniq).length) + '</dd></div>' +
      '<div class="kv-row"><dt>Missed</dt><dd><a href="' + esc(p.href({ f: { direction: ['inbound'], result: ['no_answer', 'busy', 'failed'] } })) + '">' + fmt.count(missed) + '</a></dd></div></dl>';
    sec.innerHTML = head('num', 'Calls to your number', esc(p.flag('loading') ? 'Loading…' : p.RangeWords())) + '<div class="an-sec-body">' + body + '</div>' + foot('Calls to your inbound number · number settings live in <a href="settings.html#phone">Phone setup</a>');
  }

  A.renderSections = function (fade) { calls(fade); sentiment(fade); funnel(); intents(); hours(fade); number(); V.initAll($('#an-grid')); };
  A.renderSectionMetas = function (t) { $$('.an-sec-meta').forEach(function (m) { m.textContent = t; }); };
  A.exportRows = function () {
    var p = P(), out = [];
    buckets().forEach(function (b) { out.push(['Calls per ' + (p.R.days > 31 ? 'week' : 'day'), b.head, b.rows.length]); });
    SERIES.forEach(function (s) { out.push(['Sentiment', s.label, p.stats.sentiment[s.key]]); }); out.push(['Sentiment', 'Unscored', p.stats.sentiment.unscored]);
    var H = []; for (var h = 0; h < 24; h++) H.push(0); p.rows.forEach(function (c) { H[NS.hourOf(c)] += 1; }); H.forEach(function (n, x) { out.push(['Calls by hour (IST)', NS.hourLabel(x), n]); });
    return out;
  };
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-table],[data-range],.an-ex,[data-retry-sent],[data-retry-int],[data-recompute]'); if (!t || !t.closest('#an-grid')) return;
    var p = P();
    if (t.hasAttribute('data-table')) { var id = t.getAttribute('data-table'), i = p.tables.indexOf(id); if (i >= 0) p.tables.splice(i, 1); else p.tables.push(id); p.writeUrl(false); A.renderSections(false); var b = $('[data-table="' + id + '"]'); if (b) b.focus(); }
    else if (t.hasAttribute('data-range')) p.setRange(t.getAttribute('data-range'), { now: true });
    else if (t.classList.contains('an-ex')) { var open = t.getAttribute('aria-expanded') !== 'true'; t.setAttribute('aria-expanded', open); $('#' + t.getAttribute('aria-controls')).hidden = !open; t.textContent = open ? 'Hide examples' : 'Examples'; }
    else if (t.hasAttribute('data-retry-sent')) { p.proto = null; p.writeUrl(false); sentiment(true); V.announce('Sentiment loaded'); }
    else if (t.hasAttribute('data-retry-int')) { p.proto = null; p.writeUrl(false); intents(); V.announce('Intents loaded'); }
    else if (t.hasAttribute('data-recompute')) { A.recomputing = true; p.proto = null; intents(); setTimeout(function () { A.recomputing = false; A.recomputedAt = fmt.now().toISOString(); intents(); V.announce('Intents updated'); }, 2200); }
  });
  d.addEventListener('vaani:change', function (e) { if (e.target.classList && e.target.classList.contains('an-fs')) { P().flow = e.detail.value; P().writeUrl(true); funnel(); var b = $('.an-fs'); if (b) b.focus(); } });
})(window, document);
