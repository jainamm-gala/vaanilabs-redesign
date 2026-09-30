/* Vaani Labs prototype · pages/billing-usage.js — Billing › Usage (03-pages/05 §2.9). Everything is computed from the same
   ledger rows as Wallet › Transactions, so for any range Spend = the sum of charge rows = the By product total (the §2.9
   reconciliation rule). Calls count calls, not legs; browser test calls have their own row and are not charged.
   StatGrid (4 tiles with definitions and deltas), "Spend per day" stacked bars in the categorical palette (keyboard, tooltip,
   "View as table"), and the By product table with a total row. */
(function (w, d) {
  'use strict';
  var B = w.VaaniBilling, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var RANGES = [['month', 'This month'], ['last-month', 'Last month'], ['30d', 'Last 30 days'], ['fy', 'This financial year']];
  var ui = { range: 'month', table: false }, active = -1, tip = null;
  var PRODUCTS = [['call', 'Phone calls', 'series-1'], ['agent', 'Meeting agent', 'series-2'], ['meeting', 'Meetings', 'series-3'], ['api', 'API text voice', 'series-4']];

  /* [from, to, previous from, previous to]; earlier periods fall before the prototype’s data (1 Aug) and show "No earlier data" */
  function bounds(r) { return r === 'last-month' ? ['2026-08-01', '2026-08-31', null, null] : r === '30d' ? ['2026-08-29', '2026-09-27', null, null] : r === 'fy' ? ['2026-04-01', '2026-09-27', null, null] : ['2026-09-01', '2026-09-27', '2026-08-01', '2026-08-27']; }
  function scopeText(r) { var b = bounds(r); return (r === 'fy' ? '1 Apr to 27 Sep 2026 · data in this prototype starts 1 Aug' : r === 'last-month' ? '1–31 Aug 2026' : r === '30d' ? '29 Aug to 27 Sep 2026' : '1–27 Sep 2026') + ' · calls, not legs · test calls shown separately'; void b; }
  function agg(from, to) {
    var a = { spend: 0, call: { n: 0, sec: 0, amt: 0 }, agent: { n: 0, sec: 0, amt: 0 }, api: { sec: 0, amt: 0 }, meeting: { n: 0, sec: 0 }, tests: 0, days: {} };
    if (!from) return null;
    B.ledger.forEach(function (x) {
      var day = x.at.slice(0, 10); if (day < from || day > to || x.status !== 'completed' || x.amount >= 0) return;
      var amt = -x.amount; a.spend += amt; var dd = a.days[day] = a.days[day] || { call: 0, agent: 0, meeting: 0, api: 0 };
      if (x.kind === 'calls') { a.call.n += x.calls; a.call.sec += x.sec; a.call.amt += amt; dd.call += amt; a.tests += x.tests || 0; }
      if (x.kind === 'meeting') { a.agent.n += x.meetings || 1; a.agent.sec += x.sec; a.agent.amt += amt; dd.agent += amt; }
      if (x.kind === 'api') { a.api.sec += x.sec; a.api.amt += amt; dd.api += amt; }
    });
    if (from <= '2026-09-27' && to >= '2026-09-01') { a.meeting.n = 1; a.meeting.sec = 60; }
    a.spend = Math.round(a.spend * 100) / 100; return a;
  }
  function delta(cur, prev, tone, fmt) {
    if (!prev) return '<span class="delta delta--flat">' + V.icon('minus') + 'No earlier data</span>';
    var pc = prev ? Math.round((cur - prev) / prev * 100) : 0, up = pc > 0, cls = pc === 0 || tone === 'neutral' ? 'delta--flat' : up ? 'delta--good' : 'delta--bad';
    return '<span class="delta ' + cls + '">' + V.icon(pc === 0 ? 'minus' : up ? 'arrow-up' : 'arrow-down') + (pc === 0 ? 'No change' : (up ? '+' : '−') + Math.abs(pc) + '% vs 1–27 Aug') + '</span>';
    void fmt;
  }
  function tile(label, def, value, foot, scope) {
    return '<section class="card stat"><span class="stat-label">' + esc(label) + '<button type="button" class="ibtn ibtn--sm" aria-label="What ' + esc(label.toLowerCase()) + ' counts" data-tooltip="' + esc(def) + '">' + V.icon('info', 'sm') + '</button></span><span class="stat-value">' + value + '</span><div class="stat-foot">' + foot + '</div><span class="stat-scope">' + esc(scope) + '</span></section>';
  }
  function days(a) { return Object.keys(a.days).sort(); }
  function productRows(a) {
    var tot = a.call.amt + a.agent.amt + a.api.amt, D = B.data, R = D.rate;
    /* rates come from the one rates source in billing-data.js (R1A-12), never typed here */
    var r = [
      ['Phone calls (voice agent)', D.perSec(R.call), V.fmt.count(a.call.n) + ' calls · ' + D.fmtDur(a.call.sec), '–', a.call.amt],
      ['Meeting agent', D.perSec(R.agent), a.agent.n + (a.agent.n === 1 ? ' meeting · ' : ' meetings · ') + D.fmtDur(a.agent.sec), '–', a.agent.amt],
      ['Meetings', D.perSec(R.meeting) + ' after free minutes', a.meeting.n ? a.meeting.n + (a.meeting.n === 1 ? ' meeting · ' : ' meetings · ') + D.fmtDur(a.meeting.sec) : 'None', a.meeting.n ? D.freeUsed + ' of ' + D.freeMin + ' free min used' : D.freeMin + ' free min each month', 0],
      ['API text voice', D.perSec(R.api), a.api.sec ? D.fmtDur(a.api.sec) : 'None', '–', a.api.amt]
    ];
    var html = r.map(function (x) { return '<tr><td class="c-key">' + esc(x[0]) + '</td><td data-label="Rate">' + esc(x[1]) + '</td><td class="num" data-label="Used">' + esc(x[2]) + '</td><td class="c-muted" data-label="Free allowance">' + esc(x[3]) + '</td><td class="c-num c-trail">' + esc(V.fmt.money(x[4])) + '</td></tr>'; }).join('');
    html += '<tr><td class="c-key"><span class="bill-test-row">Browser test calls<span class="tag tag--outline">Test calls</span></span></td><td data-label="Rate">Not charged</td><td class="num" data-label="Used">' + a.tests + ' tests · ' + B.data.fmtDur(a.tests * 56) + ' <span class="c-muted">(2 legs counted once)</span></td><td class="c-muted" data-label="Free allowance">–</td><td class="c-num c-trail">' + esc(V.fmt.money(0)) + '</td></tr>';
    return { body: html, total: Math.round(tot * 100) / 100 };
  }

  B.tabs.usage = {
    html: function () {
      var head = '<div class="bill-usage-head"><span class="sr-only" id="bill-urange-l">Range</span><button type="button" class="select select--auto bill-urange" data-select aria-controls="bill-urange-lb" aria-labelledby="bill-urange-l bill-urange-v">' + V.icon('calendar', 'sm') + '<span class="select-value" id="bill-urange-v">' + esc(RANGES.filter(function (r) { return r[0] === ui.range; })[0][1]) + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
        '<div class="listbox" id="bill-urange-lb" role="listbox" aria-labelledby="bill-urange-l" hidden>' + RANGES.map(function (r) { return '<div class="option" role="option" data-value="' + r[0] + '" aria-selected="' + (r[0] === ui.range) + '"><span class="option-main"><span class="option-label">' + r[1] + '</span></span>' + V.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div>' +
        '<p class="bill-scope">' + esc(scopeText(ui.range)) + '</p></div>';
      if (B.state === 'loading') return '<h2 class="sr-only">Usage</h2>' + head + '<div class="stat-grid bill-stats" aria-busy="true">' + [0, 1, 2, 3].map(function () { return '<section class="card stat" aria-hidden="true"><span class="sk-line"><span class="sk bill-sk-w2"></span></span><span class="sk-line bill-sk-num"><span class="sk sk--num bill-sk-w3"></span></span><span class="sk-line"><span class="sk sk--meta bill-sk-w4"></span></span></section>'; }).join('') + '</div><div class="card bill-chart-card" aria-busy="true"><span class="sk sk--block bill-sk-chart" aria-hidden="true"></span></div>';
      if (B.state === 'error') return '<h2 class="sr-only">Usage</h2>' + head + B.sectionError('Usage couldn’t load.');
      if (B.state === 'first-use') return '<h2 class="sr-only">Usage</h2><div class="card"><div class="empty empty--page">' + V.icon('chart-column', 'lg') + '<h3 class="empty-title">No usage yet</h3><p>Usage appears here after your first call.</p></div></div>' + rates();
      var b = bounds(ui.range), a = agg(b[0], b[1]), prev = agg(b[2], b[3]), pr = productRows(a), avg = a.call.n ? a.call.amt / a.call.n : 0;
      var stats = '<div class="stat-grid bill-stats">' +
        tile('Spend', 'Everything charged to your wallet in this range: calls, meetings and API use. Top-ups are not spend.', esc(V.fmt.money(a.spend)), delta(a.spend, prev && prev.spend, 'neutral'), 'Wallet charges · ' + RANGES.filter(function (r) { return r[0] === ui.range; })[0][1].toLowerCase()) +
        tile('Calls', 'Phone conversations placed or received. A browser test uses two legs and counts once; tests are listed separately.', esc(V.fmt.count(a.call.n)), delta(a.call.n, prev && prev.call.n, 'good'), 'Calls, not legs · test calls excluded') +
        tile('Phone call time', 'Billed talk time on phone calls, per second.', esc(B.data.fmtDur(a.call.sec)), delta(a.call.sec, prev && prev.call.sec, 'neutral'), 'Billed talk time') +
        tile('Average cost per call', 'Phone call charges divided by calls in this range.', esc(V.fmt.money(avg)), delta(avg, prev && prev.call.n ? prev.call.amt / prev.call.n : 0, 'neutral'), 'Median ' + V.fmt.money(Math.round(avg * 0.92 * 10) / 10)) + '</div>';
      var legend = '<ul class="legend" aria-label="Products">' + PRODUCTS.map(function (p) { var v = p[0] === 'call' ? a.call.amt : p[0] === 'agent' ? a.agent.amt : p[0] === 'api' ? a.api.amt : 0; return '<li class="legend-item"><span class="legend-sw ' + p[2] + '" data-mark></span>' + p[1] + ' <b>' + esc(V.fmt.money(v)) + '</b></li>'; }).join('') + '</ul>';
      var ds = days(a), maxDay = ds.reduce(function (m, k) { var t = a.days[k].call + a.days[k].agent + a.days[k].api; return t > m.v ? { v: t, k: k } : m; }, { v: 0, k: null });
      var chart = '<section class="card chart-frame bill-chart-card" aria-labelledby="bill-chart-t"><div class="card-head"><h2 class="card-title" id="bill-chart-t">Spend per day</h2><span class="card-meta">' + esc(RANGES.filter(function (r) { return r[0] === ui.range; })[0][1]) + ' · wallet charges by product</span></div>' + legend +
        '<div class="chart bill-chart" id="bill-chart" tabindex="0" role="img" aria-roledescription="chart" aria-label="Spend per day, ' + esc(scopeText(ui.range).split(' · ')[0]) + '. Highest ' + (maxDay.k ? esc(V.fmt.dateShort(maxDay.k + 'T12:00:00+05:30')) + ', ' + esc(V.fmt.money(maxDay.v)) : 'none') + '. Use the arrow keys to read each day."></div><span class="sr-only" id="bill-chart-live" aria-live="polite"></span>' +
        '<div class="bill-chart-foot"><button class="btn btn--sm btn--tertiary" type="button" data-u-table aria-expanded="' + ui.table + '" aria-controls="bill-chart-table">' + V.icon('list', 'sm') + (ui.table ? 'Hide table' : 'View as table') + '</button></div>' +
        '<div class="bill-chart-table" id="bill-chart-table"' + (ui.table ? '' : ' hidden') + '><div class="dt-wrap dt-wrap--framed"><table class="dt"><caption class="sr-only">Spend per day by product</caption><thead><tr><th scope="col">Day</th>' + PRODUCTS.map(function (p) { return '<th scope="col" class="c-num">' + p[1] + '</th>'; }).join('') + '<th scope="col" class="c-num">Total</th></tr></thead><tbody>' +
        ds.map(function (k) { var x = a.days[k]; return '<tr><td class="c-key">' + esc(V.fmt.dateShort(k + 'T12:00:00+05:30')) + '</td><td class="c-num">' + esc(V.fmt.money(x.call)) + '</td><td class="c-num">' + esc(V.fmt.money(x.agent)) + '</td><td class="c-num">' + esc(V.fmt.money(0)) + '</td><td class="c-num">' + esc(V.fmt.money(x.api)) + '</td><td class="c-num">' + esc(V.fmt.money(x.call + x.agent + x.api)) + '</td></tr>'; }).join('') + '</tbody></table></div></div></section>';
      var table = '<section class="bill-sec" aria-labelledby="bill-prod-t"><div class="bill-sec-head"><h2 class="section-title" id="bill-prod-t">By product</h2></div><div class="bill-frame"><div class="dt-wrap"><table class="dt dt--stack bill-prod"><caption class="sr-only">Usage and charges by product, ' + esc(scopeText(ui.range).split(' · ')[0]) + '</caption><thead><tr><th scope="col">Product</th><th scope="col">Rate</th><th scope="col">Used</th><th scope="col">Free allowance</th><th scope="col" class="c-num">Charged</th></tr></thead><tbody>' + pr.body +
        '<tr class="bill-total"><td class="c-key">Total</td><td></td><td></td><td></td><td class="c-num c-trail"><b class="u-semibold">' + esc(V.fmt.money(pr.total)) + '</b></td></tr></tbody></table></div></div>' +
        '<p class="bill-foot-note">Browser test calls are stored as two legs and counted once here. Rates are examples from the public API docs; the rates endpoint is the only source in the product. <a href="call-reports.html?range=' + (ui.range === 'month' ? 'this-month' : ui.range) + '&amp;columns=%2Bcost&amp;sort=cost:desc">See cost per call in Call reports</a></p></section>';
      return '<h2 class="sr-only">Usage</h2>' + head + stats + chart + table;
    },
    after: function (panel) {
      /* B.onSelect returns focus to the rebuilt range trigger once the listbox closes (O §4) */
      var rv = $('#bill-urange-v', panel); if (rv) B.onSelect(rv.parentNode, function (e) { ui.range = e.detail.value; active = -1; B.render(); });
      var el = $('#bill-chart', panel); if (!el) return;
      var b = bounds(ui.range), a = agg(b[0], b[1]), ds = days(a);
      draw(el, a, ds);
      if (w.ResizeObserver) { var ro = new ResizeObserver(function () { if (d.contains(el)) draw(el, a, ds); else ro.disconnect(); }); ro.observe(el); }
      el.addEventListener('keydown', function (e) { var n = null; if (e.key === 'ArrowRight') n = Math.min(ds.length - 1, active + 1); else if (e.key === 'ArrowLeft') n = Math.max(0, active < 0 ? ds.length - 1 : active - 1); else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = ds.length - 1; else if (e.key === 'Escape') { active = -1; draw(el, a, ds); return; } if (n == null) return; e.preventDefault(); active = n; draw(el, a, ds); var x = a.days[ds[n]]; $('#bill-chart-live').textContent = V.fmt.dateShort(ds[n] + 'T12:00:00+05:30') + ': ' + V.fmt.money(x.call + x.agent + x.api) + '. Phone calls ' + V.fmt.money(x.call) + (x.agent ? ', meeting agent ' + V.fmt.money(x.agent) : '') + (x.api ? ', API ' + V.fmt.money(x.api) : '') + '.'; });
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(), g = el._geo; if (!g) return; var i = Math.floor((e.clientX - r.left - g.left) / g.band); if (i >= 0 && i < ds.length && i !== active) { active = i; draw(el, a, ds); } });
      el.addEventListener('pointerleave', function () { active = -1; draw(el, a, ds); });
      el.addEventListener('blur', function () { active = -1; draw(el, a, ds); });
      if (!panel._uTable) { panel._uTable = true; panel.addEventListener('click', function (e) { var t = e.target.closest('[data-u-table]'); if (t && B.tab === 'usage') { ui.table = !ui.table; B.render(); var nt = $('[data-u-table]'); if (nt) nt.focus(); } }); }
    }
  };

  function draw(el, a, ds) {
    var W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    var totals = ds.map(function (k) { var x = a.days[k]; return x.call + x.agent + x.api; }), mx = Math.max.apply(null, totals.concat([1]));
    var p10 = Math.pow(10, Math.floor(Math.log10(mx / 4))), step = [1, 2, 2.5, 5, 10].map(function (m) { return m * p10; }).filter(function (x) { return x * 4 >= mx; })[0], max = step * 4, top = 14, bottom = 24, left = 8 + V.fmt.money(max, { whole: true }).length * 7 + 8, right = 4;
    var pw = W - left - right, ph = H - top - bottom, band = pw / Math.max(1, ds.length), bw = Math.max(2, Math.min(band * 0.6, 24)), every = Math.max(1, Math.ceil(44 / band));
    el._geo = { left: left, band: band };
    var s = '<svg width="' + W + '" height="' + H + '" aria-hidden="true" focusable="false">';
    for (var t = 0; t <= 4; t++) { var y = top + ph - ph * t / 4; s += '<line class="' + (t ? 'chart-grid' : 'chart-axis') + '" x1="' + left + '" x2="' + (W - right) + '" y1="' + y + '" y2="' + y + '"/><text class="chart-label" x="' + (left - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(V.fmt.money(Math.round(max * t / 4), { whole: true })) + '</text>'; }
    ds.forEach(function (k, i) {
      var cx = left + band * i + band / 2, x = a.days[k], y0 = top + ph;
      if (i === active) s += '<rect class="chart-band" x="' + (cx - band / 2) + '" y="' + top + '" width="' + band + '" height="' + ph + '"/>';
      [['call', 'series-1'], ['agent', 'series-2'], ['api', 'series-4']].forEach(function (p) { var h = ph * x[p[0]] / max; if (h <= 0) return; s += '<rect class="' + p[1] + '" x="' + (cx - bw / 2) + '" y="' + (y0 - h) + '" width="' + bw + '" height="' + h + '"/>'; y0 -= h; });
      if (i % every === 0) s += '<text class="chart-label" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + (+k.slice(8)) + '</text>';
    });
    el.innerHTML = s + '</svg>';
    if (!tip) { tip = d.createElement('div'); tip.className = 'ctip'; tip.hidden = true; d.body.appendChild(tip); }
    if (active >= 0 && ds[active]) {
      var xx = a.days[ds[active]], bx = el.getBoundingClientRect(), ax = bx.left + left + band * active + band / 2;
      tip.innerHTML = '<div class="ctip-head">' + esc(V.fmt.weekday(ds[active] + 'T12:00:00+05:30') + ' ' + V.fmt.dateShort(ds[active] + 'T12:00:00+05:30')) + '</div>' + [['Phone calls', xx.call, 'series-1'], ['Meeting agent', xx.agent, 'series-2'], ['API text voice', xx.api, 'series-4']].filter(function (r) { return r[1] > 0; }).map(function (r) { return '<div class="ctip-row"><span class="legend-sw ' + r[2] + '" data-mark></span>' + r[0] + '<b>' + esc(V.fmt.money(r[1])) + '</b></div>'; }).join('') + '<div class="ctip-row">Total<b>' + esc(V.fmt.money(xx.call + xx.agent + xx.api)) + '</b></div>';
      tip.hidden = false; var tw = tip.offsetWidth; tip.style.left = Math.min(w.innerWidth - tw - 8, Math.max(8, ax - tw / 2)) + 'px'; tip.style.top = Math.max(8, bx.top - tip.offsetHeight - 8) + 'px';
    } else tip.hidden = true;
  }
  function rates() { return ''; }
  B.usageTotals = function () { var b = bounds('month'); return agg(b[0], b[1]); };
})(window, document);
