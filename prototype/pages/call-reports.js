/* Vaani Labs prototype · Call reports (spec 03-pages/04 §2) · core: state, URL, simulated server, render orchestration.
   The page namespace is window.VaaniCallReports (NS); runtime state lives on NS.page (P). Modules: -table (rows, list,
   pager), -filters (toolbar, filter builder, columns, totals, export), -sheet (call detail), -player (recording and
   transcript), -review (review run, Call gate, menus), -boot (wiring, prototype states). */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, esc = U.esc, store = U.store;
  var P = NS.page = {};
  P.st = NS.readState(w.location.search);
  P.proto = P.st.state || null;          /* ?state= : prototype-only demo states (Prototype states menu) */
  P.keep = {};                            /* ids reviewed during this visit: they keep their row until a refresh */
  P.extra = [];                           /* calls that arrived and were shown with "Show" */
  P.pending = [];                         /* calls that arrived but are not shown yet */
  P.updatedAt = V.fmt.now().toISOString();
  P.busy = false;
  P.me = (V.data.user || {}).short || 'you';
  P.member = P.proto === 'member';
  if (P.member) P.me = 'Dev M.';

  /* ---------- columns (spec §2.5 table; direction §6.4 order) ---------- */
  NS.COLS = [
    { id: 'when', label: 'When', p: 1, sort: 'when' },
    { id: 'lead', label: 'Lead', p: 1, sort: 'lead' },
    { id: 'phone', label: 'Phone', p: 3, sort: 'phone' },
    { id: 'direction', label: 'Direction', p: 3, sort: 'direction' },
    { id: 'duration', label: 'Duration', p: 2, sort: 'duration', num: true },
    { id: 'outcome', label: 'Outcome', p: 1, sort: 'outcome' },
    { id: 'sentiment', label: 'Sentiment', p: 2, sort: 'sentiment' },
    { id: 'flow', label: 'Flow', p: 3, sort: 'flow' },
    { id: 'language', label: 'Language', p: 3 },
    { id: 'captured', label: 'Captured', p: 4 },
    { id: 'summary', label: 'Summary', p: 4 },
    { id: 'result', label: 'Result', p: 4, sort: 'result' },
    { id: 'cost', label: 'Cost', p: 4, sort: 'cost', num: true },
    { id: 'callid', label: 'Call id', p: 4, sort: 'id' }
  ];
  NS.col = function (id) { for (var i = 0; i < NS.COLS.length; i++) if (NS.COLS[i].id === id) return NS.COLS[i]; return P.fieldCols().filter(function (c) { return c.id === id; })[0] || null; };
  /* Per-field captured columns exist only when exactly one flow version is filtered (D7); repeated labels read "Field · step n". */
  P.oneFlow = function () { var f = P.st.f.flow; return f && f.length === 1 && NS.FLOWS[f[0]] ? f[0] : null; };
  P.fieldCols = function () {
    var fk = P.oneFlow(); if (!fk) return [];
    var F = NS.FLOWS[fk], seen = {};
    F.fields.forEach(function (f) { seen[f.key] = (seen[f.key] || 0) + 1; });
    return F.fields.map(function (f, i) { return { id: 'cf' + i, label: seen[f.key] > 1 ? f.key + ' · step ' + F.steps[f.step][0] : f.key, p: 4, field: i }; });
  };
  P.defaultCols = function () {
    var ids = NS.COLS.filter(function (c) { return c.p <= 3; }).map(function (c) { return c.id; });
    if (P.st.view === 'review') { ids = ids.filter(function (x) { return x !== 'language'; }); ids.push('captured'); }
    return ids;
  };
  P.chosenCols = function () {
    var saved = P.st.cols || (store.get('vaani:call-reports:cols') || '').split(',').filter(Boolean);
    return saved.length ? saved : P.defaultCols();
  };
  P.userCols = function () { return !!(P.st.cols || store.get('vaani:call-reports:cols')); };
  /* What renders (data-nav §7.5, 05-responsive §5.2, spec §2.11): the table shows what fits the breakpoint — P1–P3 at
     ≥ 1280, P1–P2 at 1024–1279, P1 (When, Lead, Outcome) at 768–1023 — until the user picks columns, whose choice then
     overrides priority. Beside the docked sheet below 1920 the table keeps P1–P2 whatever was picked (R2). */
  P.visibleCols = function () {
    var chosen = P.chosenCols(), user = P.userCols(), W = w.innerWidth;
    var docked = P.sheetMode === 'docked', limit = 9;
    if (docked && W < 1920) limit = 2;
    else if (!user && W >= 1024 && W < 1280) limit = 2;
    else if (!user && W < 1024) limit = 1;
    var all = NS.COLS.concat(P.fieldCols());
    return all.filter(function (c) { return chosen.indexOf(c.id) >= 0 && (c.p <= limit || c.p === 1); });
  };
  /* The Columns menu checks what is on screen, so a column that priority hides reads as off and turning it on shows it
     ("P1 plus any the user adds" at 768–1023). Beside the docked sheet it keeps the saved choice (the sheet trims it). */
  P.menuCols = function () {
    if (P.userCols() || P.sheetMode === 'docked') return P.chosenCols();
    return P.visibleCols().map(function (c) { return c.id; });
  };

  /* ---------- the simulated server ---------- */
  P.run = function () {
    var res = NS.query(P.st, { keep: P.keep, extra: P.extra });
    P.rows = res.rows; P.viewTotal = res.viewTotal;
    P.pages = Math.max(1, Math.ceil(P.rows.length / P.st.size));
    if (P.st.page > P.pages) P.st.page = P.pages;
    var start = (P.st.page - 1) * P.st.size;
    P.pageRows = P.rows.slice(start, start + P.st.size);
    P.start = start;
    P.counts = NS.viewCounts(P.st.test, P.keep, P.extra);
    P.stats = NS.stats(P.rows);
  };
  P.flag = function (name) { return P.proto === name; };
  P.firstUse = function () { return P.flag('first-use'); };
  P.offline = function () { return P.flag('offline'); };

  /* ---------- URL: discrete changes push, typing replaces (spec §1.4) ---------- */
  P.writeUrl = function (push) {
    var s = NS.writeState(P.st), url = w.location.pathname.split('/').pop() + s + w.location.hash;
    try { if (push) w.history.pushState({ cr: 1 }, '', url); else w.history.replaceState({ cr: 1 }, '', url); } catch (e) { /* file:// history can refuse; state still applies */ }
  };
  /* set(changes, {push, keepPage, quiet}) → applies, shows "Updating…" for a moment (the server round trip), renders. */
  /* R3D-01: a re-render replaces the pager and toolbar controls; put focus back on the replacement (never <body>). */
  function keepFocus(fn) {
    var ae = d.activeElement, id = ae && ae !== d.body ? ae.id : '', ac = ae && ae.getAttribute ? ae.getAttribute('aria-controls') : '';
    fn();
    var now = d.activeElement;
    if (now && now !== d.body && now.isConnected) return;
    var n = (id && d.getElementById(id)) || (ac && d.querySelector('[aria-controls="' + ac + '"]'));
    if (n && n.isConnected) n.focus({ preventScroll: true });
  }
  P.set = function (changes, o) {
    o = o || {};
    if (P.offline() && !o.force) { V.announce("You’re offline"); return; }
    for (var k in changes) P.st[k] = changes[k];
    if (!o.keepPage) P.st.page = 1;
    if (!o.keepSnapshot) P.keep = {};
    P.writeUrl(o.push !== false);
    P.busy = true; keepFocus(function () { NS.renderStatus && NS.renderStatus(); });
    clearTimeout(P._t);
    P._t = setTimeout(function () {
      P.busy = false; P.run(); keepFocus(NS.render);
      if (!o.quiet) V.announce(P.resultWords(), { dedupeKey: 'cr-count' });
      if (o.after) o.after();
    }, V.reducedMotion() ? 120 : 260);
  };
  P.resultWords = function () {
    var n = P.rows.length, all = P.viewTotal;
    return n === all ? V.fmt.count(n) + ' calls' : V.fmt.count(n) + ' of ' + V.fmt.count(all) + ' calls';
  };
  P.hasFilters = function () { return !!(P.st.q || P.st.when || Object.keys(P.st.f).some(function (k) { return P.st.f[k] && P.st.f[k].length; })); };
  /* Scope in words (the totals popover and the export note): "All calls · search “visit” · When: Last 30 days · test calls hidden". */
  P.scopeWords = function () {
    var out = [], lab = { all: 'All calls', review: 'Needs review', positive: 'Positive', negative: 'Negative', mixed: 'Mixed', unscored: 'Unscored' };
    out.push(lab[P.st.view] || (P.userView ? P.userView.label : 'All calls'));
    if (P.st.q) out.push('search “' + P.st.q + '”');
    var R = NS.range(P.st.when); if (R) out.push('When: ' + R.label);
    Object.keys(P.st.f).forEach(function (k) { var F = NS.field(k); if (F && P.st.f[k].length) out.push(F.label + ': ' + P.st.f[k].map(function (v) { return NS.valueName(k, v, P.st); }).join(', ')); });
    out.push(P.st.test ? 'test calls included' : 'test calls hidden');
    return out.join(' · ');
  };

  /* ---------- small helpers shared by the modules ---------- */
  P.callWho = function (c) { return c.leadName ? NS.shortName(c.leadName) : c.phone ? c.phone.masked : 'Unknown caller'; };
  P.callTitle = function (c) { return P.callWho(c) + ' · ' + V.fmt.when(c.at, { time: true }); };
  P.callName = function (c) { return 'the call with ' + P.callWho(c) + ' at ' + V.fmt.time(c.at); };
  P.href = function (c, extra) { var st = {}; for (var k in P.st) st[k] = P.st[k]; st.call = c.id; st.tab = extra && extra.tab || 'transcript'; st.t = extra && extra.t != null ? extra.t : null; return 'call-reports.html' + NS.writeState(st); };
  P.copy = function (text, done) {
    var ok = function () { V.toast.success(done); }, fail = function () { V.toast.info(done + ' (copy blocked by the browser: ' + text + ')'); };
    try { if (navigator.clipboard && w.isSecureContext) navigator.clipboard.writeText(text).then(ok, fail); else fail(); } catch (e) { fail(); }
  };
  P.download = function (name, text, type) {
    try { var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })); a.download = name; d.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400); } catch (e) { /* ignore */ }
  };
  P.csvOf = function (rows, cols, withTranscript) {
    var q = function (s) { s = s == null ? '' : String(s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    var head = cols.map(function (c) { return c.label; }); if (withTranscript) head.push('Transcript');
    var lines = [head.map(q).join(',')];
    rows.forEach(function (c) {
      var vals = cols.map(function (col) { return NS.cellText(c, col); });
      if (withTranscript) vals.push(NS.turnsOf(c).map(function (t) { return V.fmt.timecode(t.startMs / 1000) + ' ' + (t.speaker === 'caller' ? 'Caller' : t.speaker === 'system' ? '·' : 'Vaani') + ': ' + t.text; }).join(' | '));
      lines.push(vals.map(q).join(','));
    });
    return lines.join('\n');
  };
  P.fileStamp = function () { return 'vaani-calls-' + V.data.meta.today; };
  P.lead = function (c) { return c._lead || null; };
  P.updatedWords = function () { return 'updated ' + V.fmt.time(P.updatedAt); };
  NS.esc = esc;
})(window, document);
