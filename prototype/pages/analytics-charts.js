/* Vaani Labs prototype · Analytics · chart renderer with the drill-down contract (spec §4.2, data-nav §11.8).
   Vaani.charts.bars has no links, stacked series or custom tooltips, so this page draws its own plots with the shared
   chart classes (.chart .chart-bar .chart-band .chart-grid .chart-axis .chart-label .ctip .s-*). Reported as a gap.
   One tab stop per plot; ←/→ move between periods (↑/↓ between sentiment segments), Home/End jump, Enter opens the
   calls behind the focused period, Esc hides the tooltip. Pointer: hover shows the tooltip, click opens the calls
   (⌘/Ctrl-click in a new tab). Touch: the first tap shows the tooltip; only its "Open calls" link navigates. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, esc = U.esc;
  var A = NS.an = NS.an || {};
  var SVGNS = 'http://www.w3.org/2000/svg';
  /* R3D-11 (data-nav §11.4): 4 to 6 "nice" intervals, as d3's scaleLinear().nice() would give; the smallest top that holds max.
     47 → 0 to 50 in steps of 10. Returns { max, n } (n intervals). */
  function nice(max) {
    if (max <= 0) return { max: 4, n: 4 };
    var best = null;
    [4, 5, 6].forEach(function (n) { var p = Math.pow(10, Math.floor(Math.log10(max / n))); [1, 2, 2.5, 5, 10].forEach(function (m) { var s = m * p, top = s * n; if (s >= 1 && Math.round(s) === s && top >= max && (!best || top < best.max || top === best.max && n < best.n)) best = { max: top, n: n }; }); });
    return best || { max: Math.max(4, Math.ceil(max)), n: 4 };
  }
  var tip = null, tipOwner = null;
  /* The tooltip repeats what the plot’s live region says, so it is hidden from assistive tech except on touch, where it
     carries the real "Open calls" link. It lives inside main so it stays in a landmark. */
  function tipEl() { if (!tip) { tip = d.createElement('div'); tip.className = 'ctip an-tip'; tip.hidden = true; (d.getElementById('main') || d.body).appendChild(tip); } return tip; }
  function hideTip(owner) { if (tip && (!owner || tipOwner === owner)) { tip.hidden = true; tip.classList.remove('an-tip--touch'); tipOwner = null; } }
  A.hideTip = hideTip;
  /* Dismiss the open chart tooltip (WCAG 1.4.13, and "one chart tooltip at a time" with the StatStrip trend preview):
     a hovered-only plot also drops its highlighted period; a focused plot keeps its place so ←/→ resume from it. */
  A.dismissTip = function () {
    var o = tipOwner; if (!o || !tip || tip.hidden) return;
    if (d.activeElement === o) hideTip(); else setActive(o, -1);
  };
  w.addEventListener('scroll', function () { hideTip(); }, true);
  /* Esc hides hover content even when the plot does not have focus (a focused plot handles Esc itself). */
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tip && !tip.hidden) A.dismissTip(); });

  /* cfg: { kind: 'bars'|'stacked', data: [{ label, head, value | parts, href, rows: [[label, value, swatchClass]] }], series: [{ key, label, cls }],
     unit, summary, periodWord, labelAt(i, n) → bool, say(i, seg) → string, fade }
     ARIA (data-nav §11.8): role="img" is for static charts only. An interactive plot is one tab stop with
     aria-roledescription "chart", labelled by its section title (the h2) and described by its static summary.
     role="application" (announced as "chart") so screen readers in browse mode pass ←/→/Home/End/Enter to the plot
     instead of moving the virtual cursor; the polite live region reads the focused period. */
  A.chart = function (el, cfg) {
    var st = el._an || (el._an = { active: -1, seg: -1 });
    el._cfg = cfg; st.active = -1; st.seg = -1;
    el.classList.add('chart', 'an-plot'); el.tabIndex = 0;
    el.setAttribute('role', 'application'); el.setAttribute('aria-roledescription', 'chart');
    var sec = el.closest('section[aria-labelledby]'), lid = cfg.labelledby || (sec && sec.getAttribute('aria-labelledby'));
    var help = cfg.summary + '. Use the arrow keys to move between ' + (cfg.periodWord || 'days') + '; press Enter to open the calls.';
    if (lid && d.getElementById(lid)) { el.setAttribute('aria-labelledby', lid); el.removeAttribute('aria-label'); }
    else el.setAttribute('aria-label', cfg.summary);
    if (!el._desc) { el._desc = d.createElement('span'); el._desc.className = 'sr-only'; el._desc.id = (el.id || 'an-chart') + '-desc'; el.after(el._desc); }
    el._desc.textContent = help; el.setAttribute('aria-describedby', el._desc.id);
    if (!el._live) { el._live = d.createElement('div'); el._live.className = 'sr-only'; el._live.setAttribute('aria-live', 'polite'); el._desc.after(el._live); }
    if (!el._wired) wire(el);
    draw(el);
    if (cfg.fade && !V.reducedMotion()) { el.classList.remove('an-xfade'); void el.offsetWidth; el.classList.add('an-xfade'); }
  };
  function values(cfg) { return cfg.data.map(function (x) { return cfg.kind === 'stacked' ? cfg.series.reduce(function (a, s) { return a + (x.parts[s.key] || 0); }, 0) : x.value; }); }
  function geom(el) {
    var cfg = el._cfg, W = el.clientWidth, H = el.clientHeight, fmt = cfg.format || V.fmt.count;
    var nk = nice(Math.max.apply(null, values(cfg).concat([1]))), max = nk.max, top = 8, bottom = 24, left = 12 + String(fmt(max)).length * 7, right = 4;
    var pw = Math.max(10, W - left - right), ph = Math.max(10, H - top - bottom), n = Math.max(1, cfg.data.length), band = pw / n;
    return { W: W, H: H, max: max, ticks: nk.n, top: top, bottom: bottom, left: left, pw: pw, ph: ph, n: n, band: band, bw: Math.max(2, Math.min(band * 0.64, 28)), fmt: fmt };
  }
  function rect(cls, x, y, wd, ht, r) {
    if (ht <= 0) return '';
    r = Math.min(r || 0, ht, wd / 2);
    return '<path class="' + cls + '" d="M' + x + ',' + (y + ht) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + wd - r) + 'Q' + (x + wd) + ',' + y + ' ' + (x + wd) + ',' + (y + r) + 'V' + (y + ht) + 'Z"/>';
  }
  function draw(el) {
    var cfg = el._cfg, st = el._an, g = geom(el); if (!g.W || !g.H) return;
    var s = '<svg xmlns="' + SVGNS + '" width="' + g.W + '" height="' + g.H + '" aria-hidden="true" focusable="false">';
    for (var t = 0; t <= g.ticks; t++) { var y = g.top + g.ph - g.ph * t / g.ticks; s += '<line class="' + (t ? 'chart-grid' : 'chart-axis') + '" x1="' + g.left + '" x2="' + (g.W - 4) + '" y1="' + y + '" y2="' + y + '"/><text class="chart-label" x="' + (g.left - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(g.fmt(g.max * t / g.ticks)) + '</text>'; }
    cfg.data.forEach(function (x, i) {
      var cx = g.left + g.band * i + g.band / 2, x0 = cx - g.bw / 2, y0 = g.top + g.ph, on = i === st.active;
      if (on) s += '<rect class="chart-band" x="' + (g.left + g.band * i) + '" y="' + g.top + '" width="' + g.band + '" height="' + g.ph + '"/>';
      if (cfg.kind === 'stacked') {
        var acc = 0, gap = 2;
        cfg.series.forEach(function (sr, k) {
          var v = x.parts[sr.key] || 0; if (!v) return;
          var h = g.ph * v / g.max, yTop = y0 - (acc + v) / g.max * g.ph, hl = on && st.seg === k;
          var drawH = Math.max(1, h - (acc ? gap : 0));
          s += rect(sr.cls + (hl ? ' an-seg-hl' : ''), x0, yTop, g.bw, drawH, 0);
          acc += v;
        });
      } else {
        var bh = g.ph * x.value / g.max; s += rect('chart-bar' + (on ? ' is-hl' : ''), x0, y0 - bh, g.bw, bh, 2);
      }
      var show = cfg.labelAt ? cfg.labelAt(i, g.n) : i % Math.max(1, Math.ceil(56 / g.band)) === 0;
      if (show) { var half = String(x.label).length * 3.4, ax = cx, anc = 'middle'; if (cx + half > g.W - 2) { ax = g.W - 2; anc = 'end'; } else if (cx - half < g.left) { ax = g.left; anc = 'start'; } s += '<text class="chart-label" x="' + ax + '" y="' + (g.H - 6) + '" text-anchor="' + anc + '">' + esc(x.label) + '</text>'; }
    });
    el.innerHTML = s + '</svg>';
    if (st.active >= 0) placeTip(el, g); else hideTip(el);
  }
  function placeTip(el, g) {
    var cfg = el._cfg, st = el._an, x = cfg.data[st.active]; if (!x) return;
    var t = tipEl(); tipOwner = el;
    if (A.hideTrend) A.hideTrend();   /* one chart tooltip at a time: the StatStrip trend preview closes */
    var rows = (x.rows || []).map(function (r, k) { var hl = cfg.kind === 'stacked' && st.seg === k; return '<div class="ctip-row' + (hl ? ' an-tip-hl' : '') + '">' + (r[2] ? '<span class="legend-sw ' + r[2] + '" data-mark></span>' : '') + esc(r[0]) + '<b>' + esc(r[1]) + '</b></div>'; }).join('');
    var href = hrefOf(el), touch = st.touch;
    t.innerHTML = '<div class="ctip-head">' + esc(x.head) + '</div>' + rows + (href ? (touch ? '<a class="an-tip-open" href="' + esc(href) + '">Open calls ›</a>' : '<div class="an-tip-open">Open calls ›</div>') : '');
    t.classList.toggle('an-tip--touch', !!touch); t.hidden = false; if (touch) t.removeAttribute('aria-hidden'); else t.setAttribute('aria-hidden', 'true');
    var b = el.getBoundingClientRect(), ax = b.left + g.left + g.band * st.active + g.band / 2, tw = t.offsetWidth;
    t.style.left = Math.min(w.innerWidth - tw - 8, Math.max(8, ax - tw / 2)) + 'px';
    var top = b.top - t.offsetHeight - 8; t.style.top = (top < 8 ? b.bottom + 8 : top) + 'px';
  }
  function hrefOf(el) {
    var cfg = el._cfg, st = el._an, x = cfg.data[st.active]; if (!x) return null;
    if (cfg.kind === 'stacked') { var sr = cfg.series[st.seg >= 0 ? st.seg : 0]; return x.hrefFor ? x.hrefFor(sr.key) : null; }
    return x.href || null;
  }
  function setActive(el, i, seg, say) {
    var cfg = el._cfg, st = el._an; st.active = i;
    if (cfg.kind === 'stacked') { st.seg = seg != null ? seg : (st.seg >= 0 ? st.seg : firstSeg(cfg, i)); }
    draw(el);
    if (say && i >= 0 && cfg.say) el._live.textContent = cfg.say(i, st.seg) + (hrefOf(el) ? ', press Enter to open these calls' : '');
  }
  function firstSeg(cfg, i) { var x = cfg.data[i]; for (var k = cfg.series.length - 1; k >= 0; k--) if (x && x.parts[cfg.series[k].key]) return k; return 0; }
  function indexAt(el, e) { var g = geom(el), r = el.getBoundingClientRect(), i = Math.floor((e.clientX - r.left - g.left) / g.band); return i >= 0 && i < g.n ? i : -1; }
  function segAt(el, e, i) {
    var cfg = el._cfg; if (cfg.kind !== 'stacked' || i < 0) return -1;
    var g = geom(el), r = el.getBoundingClientRect(), y = e.clientY - r.top, y0 = g.top + g.ph, acc = 0, x = cfg.data[i];
    for (var k = 0; k < cfg.series.length; k++) { var v = x.parts[cfg.series[k].key] || 0; acc += v; if (v && y >= y0 - acc / g.max * g.ph) return k; }
    return firstSeg(cfg, i);
  }
  function go(el, newTab) { var h = hrefOf(el); if (!h) return; if (newTab) w.open(h, '_blank', 'noopener'); else w.location.href = h; }
  function wire(el) {
    el._wired = true;
    el.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var st = el._an, i = indexAt(el, e), k = segAt(el, e, i); st.touch = false; if (i !== st.active || k !== st.seg) setActive(el, i, k >= 0 ? k : null); });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch' || d.activeElement === el) return; setActive(el, -1); });
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch') return;
      var st = el._an, i = indexAt(el, e), k = segAt(el, e, i); st.touch = true; st.tapped = true;
      setActive(el, i, k >= 0 ? k : null, true);
    });
    el.addEventListener('click', function (e) {
      var st = el._an; if (st.tapped) { st.tapped = false; return; }   /* touch: first tap only shows the tooltip */
      var i = indexAt(el, e); if (i < 0) return; var k = segAt(el, e, i); setActive(el, i, k >= 0 ? k : null);
      go(el, e.metaKey || e.ctrlKey);
    });
    el.addEventListener('keydown', function (e) {
      var cfg = el._cfg, st = el._an, n = cfg.data.length, i = st.active;
      if (e.key === 'ArrowRight') { e.preventDefault(); setActive(el, Math.min(n - 1, i + 1), null, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(el, i < 0 ? n - 1 : Math.max(0, i - 1), null, true); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setActive(el, e.key === 'Home' ? 0 : n - 1, null, true); }
      else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && cfg.kind === 'stacked' && i >= 0) { e.preventDefault(); var k = st.seg, m = cfg.series.length; do { k = (k + (e.key === 'ArrowUp' ? 1 : -1) + m) % m; } while (!cfg.data[i].parts[cfg.series[k].key] && k !== st.seg); setActive(el, i, k, true); }
      else if (e.key === 'Enter' && i >= 0) { e.preventDefault(); go(el, e.metaKey || e.ctrlKey); }
      else if (e.key === 'Escape' && i >= 0 && tip && !tip.hidden) { e.preventDefault(); e.stopPropagation(); tip.hidden = true; }   /* R3D-03: Esc hides the tooltip only; the focused period and Enter stay */
    });
    el.addEventListener('blur', function () { setActive(el, -1); });
    if (w.ResizeObserver) new ResizeObserver(function () { draw(el); }).observe(el);
  }

  /* Small table for "View as table" (flush DataTable, no frame inside a section). */
  A.table = function (caption, head, rows) {
    return '<div class="dt-wrap an-tablewrap"><table class="dt"><caption class="sr-only">' + esc(caption) + '</caption><thead><tr>' + head.map(function (h, i) { return '<th scope="col"' + (i ? ' class="c-num"' : '') + '>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i ? ' class="c-num"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  };
  /* Trend preview line for a StatStrip cell: 208 × 40, neutral line, last point in --chart-highlight. */
  A.trendSvg = function (vals) {
    var W = 208, H = 40, max = Math.max.apply(null, vals), min = Math.min.apply(null, vals), span = max - min || 1;
    var pts = vals.map(function (v, i) { return [(i / (vals.length - 1) * (W - 8) + 4).toFixed(1), (H - 5 - (v - min) / span * (H - 10)).toFixed(1)]; });
    var last = pts[pts.length - 1];
    return '<svg class="an-trend-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false"><polyline class="chart-line an-trend-line" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/><circle class="an-trend-dot" cx="' + last[0] + '" cy="' + last[1] + '" r="3"/></svg>';
  };
})(window, document);
