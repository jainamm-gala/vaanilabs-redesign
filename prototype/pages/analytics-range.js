/* Vaani Labs prototype · Analytics · DateRangePicker (core §7.1, page §3.7, §4.3 RangeControl).
   Presets on the left (a preset applies at once and closes); typeable dd / mm / yyyy segments (a group of spinbuttons,
   digits and ↑/↓, the numeric keypad on phones); the RangeCalendar with the shared .cal-* classes: two months side by
   side at ≥ 1024, one below, a bottom sheet with 44 px cells on phones (the shell’s popover). A custom range applies on
   the second click in the calendar, or with "Apply range" after typing. Esc cancels (the overlay stack).
   Grid keyboard: ←/→ day, ↑/↓ week, Home/End week start/end, PageUp/PageDown month (Shift: year), Enter/Space select.
   No shared DateRangePicker exists in assets/ yet, so it lives here; reported as a shared gap. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, esc = U.esc, $ = U.$, $$ = U.$$;
  var A = NS.an = NS.an || {};
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var PRESETS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days'], ['this-month', 'This month'], ['last-month', 'Last month']];
  var SEGS = [['d', 'Day', 'dd', 2], ['m', 'Month', 'mm', 2], ['y', 'Year', 'yyyy', 4]];
  var S = { from: null, to: null, anchor: null, hover: null, focus: null, view: null, months: 1, open: false };

  /* ---------- dates (ISO 'YYYY-MM-DD' strings compare in order) ---------- */
  function today() { return V.data.meta.today; }
  function minDay() { return NS.dateAgo(179); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(y, m, dd) { return y + '-' + pad(m + 1) + '-' + pad(dd); }
  function parts(s) { return { y: +s.slice(0, 4), m: +s.slice(5, 7) - 1, d: +s.slice(8, 10) }; }
  function dim(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function dow(s) { return new Date(NS.dayIndex(s) * 86400000).getUTCDay(); }
  function addMonths(v, n) { var t = v.y * 12 + v.m + n; return { y: Math.floor(t / 12), m: t % 12 }; }
  function mkey(v) { return v.y * 12 + v.m; }
  function shiftMonths(s, n) { var p = parts(s), v = addMonths(p, n); return iso(v.y, v.m, Math.min(p.d, dim(v.y, v.m))); }
  function clamp(s) { var lo = iso(parts(minDay()).y, parts(minDay()).m, 1), t = parts(today()), hi = iso(t.y, t.m, dim(t.y, t.m)); return s < lo ? lo : s > hi ? hi : s; }
  function available(s) { return s >= minDay() && s <= today(); }
  function short(s) { var p = parts(s); return p.d + ' ' + MON[p.m] + ' ' + p.y; }
  function words(s) { var p = parts(s); return DAYS[dow(s)] + ', ' + p.d + ' ' + MON[p.m] + ' ' + p.y; }
  function spoken(s) { var p = parts(s); return DAYS[dow(s)] + ' ' + p.d + ' ' + MONTHS[p.m] + ' ' + p.y; }
  function presetRange(k) {
    var t = today(), p = parts(t);
    if (k === 'today') return t;
    if (k === 'yesterday') return NS.addDays(t, -1);
    if (k === 'this-month') { var f = iso(p.y, p.m, 1); return f === t ? t : f + '..' + t; }
    if (k === 'last-month') { var v = addMonths(p, -1); return iso(v.y, v.m, 1) + '..' + iso(v.y, v.m, dim(v.y, v.m)); }
    return k;
  }
  function wide() { return w.matchMedia ? w.matchMedia('(min-width: 1024px)').matches : w.innerWidth >= 1024; }

  /* ---------- presets ---------- */
  function renderPresets() {
    var cur = A.page.range;
    $('#an-drp-presets').innerHTML = PRESETS.map(function (x) {
      var on = presetRange(x[0]) === cur;
      return '<button type="button" class="an-preset" data-preset="' + x[0] + '"' + (on ? ' aria-current="true"' : '') + '><span>' + esc(x[1]) + '</span>' + (on ? V.icon('check', 'sm') : '') + '</button>';
    }).join('');
  }

  /* ---------- DateFields: a group of spinbutton segments (dd / mm / yyyy, en-IN order) ---------- */
  function renderFields() {
    $$('.an-df').forEach(function (g) {
      var f = g.getAttribute('data-df');
      g.innerHTML = SEGS.map(function (s, i) {
        return (i ? '<span class="an-df-sl" aria-hidden="true">/</span>' : '') + '<input class="an-seg an-seg--' + s[0] + '" type="text" inputmode="numeric" role="spinbutton" autocomplete="off" spellcheck="false" enterkeyhint="done" data-seg="' + s[0] + '" data-f="' + f + '" aria-label="' + s[1] + '" placeholder="' + s[2] + '" maxlength="' + s[3] + '" size="' + s[3] + '">';
      }).join('');
    });
  }
  function segs(f) { return $$('.an-df[data-df="' + f + '"] .an-seg'); }
  function bounds(inp) {
    var s = inp.getAttribute('data-seg'), f = inp.getAttribute('data-f'), v = read(f);
    if (s === 'd') return [1, v.m && v.y ? dim(+v.y, +v.m - 1) : 31];
    if (s === 'm') return [1, 12];
    return [parts(minDay()).y, parts(today()).y];
  }
  function sync(inp) {
    var v = inp.value, b = bounds(inp), s = inp.getAttribute('data-seg');
    inp.setAttribute('aria-valuemin', b[0]); inp.setAttribute('aria-valuemax', b[1]);
    if (v === '') { inp.removeAttribute('aria-valuenow'); inp.setAttribute('aria-valuetext', 'Empty'); return; }
    inp.setAttribute('aria-valuenow', +v); inp.setAttribute('aria-valuetext', s === 'm' && +v >= 1 && +v <= 12 ? v + ', ' + MONTHS[+v - 1] : String(+v));
  }
  function read(f) { var o = {}; segs(f).forEach(function (i) { o[i.getAttribute('data-seg')] = i.value; }); return o; }
  function fill(f, s) { var p = s ? parts(s) : null; segs(f).forEach(function (i) { var k = i.getAttribute('data-seg'); i.value = !p ? '' : k === 'd' ? pad(p.d) : k === 'm' ? pad(p.m + 1) : String(p.y); sync(i); }); }
  /* → { iso } for a complete, real, in-range date; { err } otherwise; {} when empty */
  function parse(f) {
    var v = read(f); if (!v.d && !v.m && !v.y) return {};
    if (!v.d || !v.m || v.y.length !== 4) return { err: 'Enter a full date: dd / mm / yyyy.' };
    var y = +v.y, m = +v.m - 1, dd = +v.d;
    if (m < 0 || m > 11 || dd < 1 || dd > dim(y, m)) return { err: 'Enter a real date.' };
    var s = iso(y, m, dd);
    if (!available(s)) return { err: 'Choose a day from ' + short(minDay()) + ' to today.' };
    return { iso: s };
  }
  function segKey(e) {
    var inp = e.target, f = inp.getAttribute('data-f'), list = segs(f), i = list.indexOf(inp), k = e.key;
    if (k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault(); var b = bounds(inp), n = inp.value === '' ? (k === 'ArrowUp' ? b[0] : b[1]) : +inp.value + (k === 'ArrowUp' ? 1 : -1);
      if (n > b[1]) n = b[0]; if (n < b[0]) n = b[1];
      inp.value = inp.getAttribute('data-seg') === 'y' ? String(n) : pad(n); sync(inp); changed(f); inp.select();
    } else if (k === 'ArrowLeft' && i > 0) { e.preventDefault(); list[i - 1].focus(); }   /* segments are cells: ←/→ move between them */
    else if (k === 'ArrowRight' && i < list.length - 1) { e.preventDefault(); list[i + 1].focus(); }
    else if (k === 'Backspace' && inp.value === '' && i > 0) { e.preventDefault(); list[i - 1].focus(); }
    else if ((k === '/' || k === '.' || k === '-') && i < list.length - 1) { e.preventDefault(); if (inp.value.length === 1) inp.value = pad(+inp.value); sync(inp); list[i + 1].focus(); }
    else if (k === 'Enter') { e.preventDefault(); applyTyped(); }
  }
  function segInput(e) {
    var inp = e.target, s = inp.getAttribute('data-seg'), f = inp.getAttribute('data-f'), list = segs(f), i = list.indexOf(inp);
    var v = inp.value.replace(/\D/g, '').slice(0, s === 'y' ? 4 : 2); inp.value = v;
    var done = s === 'y' ? v.length === 4 : v.length === 2 || (v.length === 1 && +v > (s === 'd' ? 3 : 1));
    if (done && s !== 'y' && v.length === 1) inp.value = pad(+v);
    sync(inp); changed(f);
    if (done && i < list.length - 1) list[i + 1].focus();
  }
  /* a typed date that is complete moves the calendar to it; errors wait for the field to be left (§7.1 States) */
  function changed(f) {
    var r = parse(f);
    if (r.iso) { S[f] = r.iso; S.anchor = null; S.hover = null; S.focus = r.iso; showMonthOf(r.iso, f === 'from' ? 0 : S.months - 1); err(''); renderCals(); }
    summary();
  }
  function blurField(e) {
    var g = e.currentTarget, f = g.getAttribute('data-df'); if (e.relatedTarget && g.contains(e.relatedTarget)) return;
    var r = parse(f); segs(f).forEach(function (i) { i.setAttribute('aria-invalid', r.err ? 'true' : 'false'); });
    if (r.err) err((f === 'from' ? 'From: ' : 'To: ') + r.err);
  }
  function err(t) { var el = $('#an-drp-err'); el.hidden = !t; el.innerHTML = t ? V.icon('circle-alert', 'sm') + '<span>' + esc(t) + '</span>' : ''; if (!t) $$('.an-seg').forEach(function (i) { i.setAttribute('aria-invalid', 'false'); }); }
  function summary() {
    var el = $('#an-drp-sum');
    if (S.anchor) { el.textContent = words(S.anchor) + ' · now choose the end day'; return; }
    /* the summary echoes what the fields say, so it never shows a range the fields no longer hold */
    var fa = parse('from'), fb = parse('to');
    if (!fa.iso || fb.err) { el.textContent = 'Choose a start and an end day.'; return; }
    var a = fa.iso, b = fb.iso || fa.iso;
    var lo = a < b ? a : b, hi = a < b ? b : a, n = NS.dayIndex(hi) - NS.dayIndex(lo) + 1;
    el.textContent = (lo === hi ? words(lo) : words(lo) + ' to ' + words(hi)) + ' · ' + n + (n === 1 ? '\u00a0day' : '\u00a0days');
  }

  /* ---------- RangeCalendar ---------- */
  function showMonthOf(s, slot) {
    var p = parts(s), v = { y: p.y, m: p.m }, right = addMonths(v, S.months - 1 - (slot || 0));
    var t = parts(today()), last = { y: t.y, m: t.m }, first = addMonths(parts(minDay()), S.months - 1);
    if (mkey(right) > mkey(last)) right = last; if (mkey(right) < mkey(first)) right = first;
    S.view = right;
  }
  function visible(s) { var p = parts(s), k = mkey(p); return k <= mkey(S.view) && k > mkey(S.view) - S.months; }
  function monthHtml(v, i) {
    var id = 'an-cal-t-' + i, first = iso(v.y, v.m, 1), lead = dow(first), n = dim(v.y, v.m), cells = [], rows = '';
    var t = parts(today()), lo = parts(minDay());
    var prevOff = mkey(v) <= mkey(lo), nextOff = mkey(v) >= t.y * 12 + t.m;
    var prev = i === 0 ? '<button type="button" class="ibtn ibtn--sm" data-cal="prev" aria-label="Previous month"' + (prevOff ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-left', 'sm') + '</button>' : '<span></span>';
    var next = i === S.months - 1 ? '<button type="button" class="ibtn ibtn--sm" data-cal="next" aria-label="Next month"' + (nextOff ? ' aria-disabled="true"' : '') + '>' + V.icon('chevron-right', 'sm') + '</button>' : '<span></span>';
    for (var b = 0; b < lead; b++) cells.push('<span role="gridcell" class="an-cal-blank"></span>');
    for (var dd = 1; dd <= n; dd++) { var s = iso(v.y, v.m, dd); cells.push('<span role="gridcell" class="cal-day" data-date="' + s + '"' + (s === today() ? ' aria-current="date"' : '') + (available(s) ? '' : ' aria-disabled="true"') + ' tabindex="-1">' + dd + '</span>'); }
    while (cells.length % 7) cells.push('<span role="gridcell" class="an-cal-blank"></span>');
    for (var r = 0; r < cells.length; r += 7) rows += '<div role="row" class="an-cal-row">' + cells.slice(r, r + 7).join('') + '</div>';
    return '<div class="an-cal"><div class="cal-head an-cal-head">' + prev + '<h3 class="cal-title" id="' + id + '">' + MONTHS[v.m] + ' ' + v.y + '</h3>' + next + '</div>' +
      '<div class="cal-grid" role="grid" aria-labelledby="' + id + '"><div role="row" class="an-cal-row">' + WD.map(function (x, k) { return '<span role="columnheader" class="cal-wd" aria-label="' + DAYS[k] + '">' + x + '</span>'; }).join('') + '</div>' + rows + '</div></div>';
  }
  function renderCals(keepFocus) {
    var box = $('#an-drp-cals'), had = keepFocus || (d.activeElement && box.contains(d.activeElement) && d.activeElement.classList.contains('cal-day'));
    var html = ''; for (var i = 0; i < S.months; i++) html += monthHtml(addMonths(S.view, i - S.months + 1), i);
    box.innerHTML = html; box.setAttribute('data-months', S.months);
    if (!S.focus || !visible(S.focus)) { var cand = [S.from, S.to, today()].filter(function (x) { return x && visible(x); })[0]; S.focus = cand || iso(S.view.y, S.view.m, 1); }
    paint();
    if (had) { var c = $('.cal-day[data-date="' + S.focus + '"]', box); if (c) c.focus(); }
  }
  function paint() {
    var lo, hi, a = S.anchor, h = S.hover;
    if (a) { lo = h && h < a ? h : a; hi = h && h > a ? h : a; } else if (S.from) { var b = S.to || S.from; lo = S.from < b ? S.from : b; hi = S.from < b ? b : S.from; }
    $$('#an-drp-cals .cal-day').forEach(function (c) {
      var s = c.getAttribute('data-date'), inR = !!lo && s >= lo && s <= hi, end = inR && (s === lo || s === hi);
      c.setAttribute('aria-selected', inR ? 'true' : 'false'); c.classList.toggle('an-cal-mid', inR && !end);
      c.setAttribute('tabindex', s === S.focus ? '0' : '-1');
      c.setAttribute('aria-label', spoken(s) + (s === today() ? ', today' : '') + (inR && s === lo && lo !== hi ? ', start of range' : '') + (inR && s === hi && lo !== hi ? ', end of range' : '') + (available(s) ? '' : ', unavailable'));
    });
  }
  function pick(s) {
    if (!available(s)) { live(spoken(s) + ' is unavailable. Choose a day from ' + short(minDay()) + ' to today.'); return; }
    S.focus = s;
    if (!S.anchor) { S.anchor = s; S.from = s; S.to = null; S.hover = null; fill('from', s); fill('to', null); err(''); paint(); summary(); live('Start ' + spoken(s) + '. Now choose the end day.'); return; }
    var lo = S.anchor < s ? S.anchor : s, hi = S.anchor < s ? s : S.anchor; S.anchor = null;
    apply(lo, hi);   /* a custom range applies on the second click (core §7.1) */
  }
  function move(s) {
    s = clamp(s); S.focus = s; if (S.anchor && available(s)) S.hover = s;
    if (!visible(s)) { S.view = parts(s).y * 12 + parts(s).m > mkey(S.view) ? { y: parts(s).y, m: parts(s).m } : addMonths({ y: parts(s).y, m: parts(s).m }, S.months - 1); renderCals(true); live(MONTHS[parts(s).m] + ' ' + parts(s).y); }
    else { paint(); var c = $('#an-drp-cals .cal-day[data-date="' + s + '"]'); if (c) c.focus(); }
  }
  function gridKey(e) {
    var c = e.target.closest && e.target.closest('.cal-day'); if (!c) return;
    var s = c.getAttribute('data-date'), k = e.key, n = null;
    if (k === 'ArrowLeft') n = NS.addDays(s, -1); else if (k === 'ArrowRight') n = NS.addDays(s, 1);
    else if (k === 'ArrowUp') n = NS.addDays(s, -7); else if (k === 'ArrowDown') n = NS.addDays(s, 7);
    else if (k === 'Home') n = NS.addDays(s, -dow(s)); else if (k === 'End') n = NS.addDays(s, 6 - dow(s));
    else if (k === 'PageUp') n = shiftMonths(s, e.shiftKey ? -12 : -1); else if (k === 'PageDown') n = shiftMonths(s, e.shiftKey ? 12 : 1);
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); pick(s); return; }
    if (n) { e.preventDefault(); move(n); }
  }
  function live(t) { var el = $('#an-drp-live'); el.textContent = ''; setTimeout(function () { el.textContent = t; }, 30); }

  /* ---------- apply ---------- */
  function apply(lo, hi) {
    if (!S.open) return;
    V.popover.close('an-range-pop');
    A.page.setRange(lo === hi ? lo : lo + '..' + hi, { now: true });
  }
  function applyTyped() {
    var a = parse('from'), b = parse('to');
    if (a.err || b.err || !a.iso) { var f = a.err || !a.iso ? 'from' : 'to'; err((f === 'from' ? 'From: ' : 'To: ') + ((f === 'from' ? a.err : b.err) || 'Enter a start date.')); segs(f).forEach(function (i) { i.setAttribute('aria-invalid', 'true'); }); var bad = segs(f).filter(function (i) { return !i.value; })[0] || segs(f)[0]; bad.focus(); return; }
    var hi = b.iso || a.iso, lo = a.iso;
    if (hi < lo) { var t = lo; lo = hi; hi = t; }
    apply(lo, hi);
  }

  /* ---------- open ---------- */
  A.openCustom = function (trigger) {
    var R = A.page.R, lo = minDay();
    S.months = wide() ? 2 : 1; S.anchor = null; S.hover = null;
    S.from = R.from < lo ? lo : R.from; S.to = R.to > today() ? today() : R.to; S.focus = S.from;
    renderPresets(); renderFields(); fill('from', S.from); fill('to', S.to); err(''); summary();
    showMonthOf(S.to, S.months - 1); renderCals();
    S.open = true;
    V.popover.open(trigger, 'an-range-pop', { placement: 'bottom-end', onClose: function () { S.open = false; } });
  };

  V.ready(function () {
    var pop = $('#an-range-pop'); if (!pop) return;
    pop.addEventListener('click', function (e) {
      var p = e.target.closest('[data-preset]');
      if (p) { var r = presetRange(p.getAttribute('data-preset')), R = NS.range(r); if (!R) return; V.popover.close('an-range-pop'); A.page.setRange(r, { now: true }); return; }
      var nav = e.target.closest('[data-cal]');
      if (nav) { if (nav.getAttribute('aria-disabled') === 'true') return; S.view = addMonths(S.view, nav.getAttribute('data-cal') === 'next' ? 1 : -1); var keep = nav.getAttribute('data-cal'); renderCals(); var again = $('[data-cal="' + keep + '"]', pop); if (again) again.focus(); var first = addMonths(S.view, 1 - S.months); live(MONTHS[first.m] + ' ' + first.y + (S.months > 1 ? ' and ' + MONTHS[S.view.m] + ' ' + S.view.y : '')); return; }
      var c = e.target.closest('.cal-day'); if (c) pick(c.getAttribute('data-date'));
    });
    pop.addEventListener('pointerover', function (e) { if (!S.anchor) return; var c = e.target.closest && e.target.closest('.cal-day'); if (c && available(c.getAttribute('data-date'))) { S.hover = c.getAttribute('data-date'); paint(); } });
    $('#an-drp-cals').addEventListener('keydown', gridKey);
    pop.addEventListener('keydown', function (e) { if (e.target.classList && e.target.classList.contains('an-seg')) segKey(e); });
    pop.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('an-seg')) segInput(e); });
    pop.addEventListener('focusin', function (e) { if (e.target.classList && e.target.classList.contains('an-seg')) { var t = e.target; setTimeout(function () { try { t.select(); } catch (x) { /* ignore */ } }, 0); } });
    $$('.an-df', pop).forEach(function (g) { g.addEventListener('focusout', blurField); });
    $('#an-range-apply').addEventListener('click', applyTyped);
    /* two months at ≥ 1024, one below: follow the viewport while open */
    if (w.matchMedia) { var mq = w.matchMedia('(min-width: 1024px)'), on = function () { if (!S.open) return; S.months = mq.matches ? 2 : 1; showMonthOf(S.focus || S.to || today(), S.months - 1); renderCals(); }; if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on); }
  });
})(window, document);
