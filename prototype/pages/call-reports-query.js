/* Vaani Labs prototype · Call reports + Analytics · the one metrics layer (stands in for lib/metrics.ts,
   GET /api/calls?… and GET /api/calls/stats). Both pages call these functions, so every number agrees (spec D3, §1.1). */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA, NS = w.VaaniCallReports, U = D._util;
  var TODAY = D.meta.today;
  NS.dateAgo = function (n) { return U.ist(n, '00:00').slice(0, 10); };
  function dayOf(c) { return c.at.slice(0, 10); }
  function hourOf(c) { return +c.at.slice(11, 13); }
  NS.dayOf = dayOf; NS.hourOf = hourOf;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dparts(s) { return { y: +s.slice(0, 4), m: +s.slice(5, 7) - 1, d: +s.slice(8, 10) }; }
  NS.dayLabel = function (s, o) { var p = dparts(s); return p.d + ' ' + MON[p.m] + (o && o.year ? ' ' + p.y : ''); };
  NS.dayIndex = function (s) { var p = dparts(s); return Date.UTC(p.y, p.m, p.d) / 86400000; };
  NS.addDays = function (s, n) { var t = new Date((NS.dayIndex(s) + n) * 86400000); return t.getUTCFullYear() + '-' + U.pad(t.getUTCMonth() + 1) + '-' + U.pad(t.getUTCDate()); };
  NS.weekday = function (s) { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(NS.dayIndex(s) * 86400000).getUTCDay()]; };

  /* ---------- metric definitions (tooltip text verbatim from spec §1.1) ---------- */
  NS.METRICS = {
    calls: { label: 'Calls', up: 'good', def: 'Conversations placed or received in the range. A browser test counts once, even if it was stored as two legs. Test calls and browser tests are excluded unless you include them.' },
    answered: { label: 'Answered', up: 'good', def: 'Share of outbound calls that connected to a person or voicemail. Inbound calls always count as answered.' },
    talk_time: { label: 'Talk time', up: 'neutral', def: 'Total time with the line connected, across all calls in the range.' },
    avg_talk: { label: 'Avg talk time', up: 'neutral', def: "Mean talk time of answered calls. Unanswered calls are left out so they don’t pull the average down." },
    minutes_used: { label: 'Minutes used', up: 'neutral', def: 'Billable phone minutes, per-second billing rounded to the minute for display. Free minutes and anything the server marks as not billed are left out; see Billing › Usage.' },
    needs_review: { label: 'Needs review', up: 'bad', def: 'Calls with negative or mixed sentiment, a failed or timed-out result, or no outcome captured, that nobody has marked reviewed.' }
  };
  NS.INTENTS = [['int_visit', 'Site visit booking'], ['int_price', 'Price enquiry'], ['int_callback', 'Callback request'], ['int_loan', 'Loan eligibility'], ['int_payment', 'Payment plans'],
    ['int_location', 'Location and directions'], ['int_possession', 'Possession date'], ['int_parking', 'Parking'], ['int_other', 'Other']];
  NS.intentLabel = function (id) { for (var i = 0; i < NS.INTENTS.length; i++) if (NS.INTENTS[i][0] === id) return NS.INTENTS[i][1]; return id; };
  NS.flowLabel = function (key) { var F = NS.FLOWS[key]; return F ? F.name + ' v' + F.version : key; };

  /* ---------- ranges: today · 7d · 30d · 90d · YYYY-MM-DD · YYYY-MM-DD..YYYY-MM-DD (IST days) ---------- */
  NS.range = function (when) {
    if (!when) return null;
    var m = /^(\d+)d$/.exec(when);
    if (when === 'today') return { from: TODAY, to: TODAY, days: 1, label: 'Today', words: 'today' };
    if (m) { var n = +m[1]; return { from: NS.dateAgo(n - 1), to: TODAY, days: n, label: 'Last ' + n + ' days', words: 'last ' + n + ' days', preset: when }; }
    var p = when.split('..'), a = p[0], b = p[1] || p[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a) || !/^\d{4}-\d{2}-\d{2}$/.test(b)) return null;
    if (b < a) { var t = a; a = b; b = t; }
    var lab = a === b ? NS.dayLabel(a, { year: true }) : NS.rangeText(a, b);
    return { from: a, to: b, days: NS.dayIndex(b) - NS.dayIndex(a) + 1, label: lab, words: lab, custom: true };
  };
  NS.rangeText = function (a, b) { var A = dparts(a), B = dparts(b); if (A.y === B.y && A.m === B.m) return A.d + '–' + B.d + ' ' + MON[B.m] + ' ' + B.y; if (A.y === B.y) return A.d + ' ' + MON[A.m] + ' – ' + B.d + ' ' + MON[B.m] + ' ' + B.y; return NS.dayLabel(a, { year: true }) + ' – ' + NS.dayLabel(b, { year: true }); };
  NS.prevRange = function (R) { return { from: NS.addDays(R.from, -R.days), to: NS.addDays(R.from, -1), days: R.days }; };

  /* ---------- filter fields, in the Filter menu’s order (spec §2.5) ---------- */
  NS.FIELDS = [
    { id: 'result', label: 'Result', type: 'enum', domain: 'callResult', values: ['completed', 'no_answer', 'busy', 'voicemail', 'failed', 'timed_out'] },
    { id: 'outcome', label: 'Outcome', type: 'enum', domain: 'outcome', values: ['Visit booked', 'Interested', 'Callback', 'Call later', 'Promise to pay', 'Not interested', 'Transferred', 'No answer', 'Busy', 'Voicemail', 'Failed', 'none'] },
    { id: 'direction', label: 'Direction', type: 'enum', values: ['outbound', 'inbound'], names: { outbound: 'Outbound', inbound: 'Inbound' } },
    { id: 'flow', label: 'Flow', type: 'enum', values: ['flow_7c21@7', 'flow_7c21@6', 'flow_3b90@3', 'flow_9e14@12', 'flow_9e14@11'] },
    { id: 'language', label: 'Language', type: 'enum', values: ['hi', 'hi-Latn', 'en'] },
    { id: 'knowledge', label: 'Knowledge lookup', type: 'enum', values: ['found', 'not_found'], names: { found: 'Found', not_found: 'Not found' } },
    { id: 'sentiment', label: 'Sentiment', type: 'enum', values: ['positive', 'neutral', 'mixed', 'negative', 'unscored'], names: { positive: 'Positive', neutral: 'Neutral', mixed: 'Mixed', negative: 'Negative', unscored: 'Unscored' } },
    { id: 'duration', label: 'Duration', type: 'range' },
    { id: 'intent', label: 'Intent', type: 'enum', values: NS.INTENTS.map(function (x) { return x[0]; }) },
    { id: 'last_step', label: 'Last step reached', type: 'enum', needsOneFlow: true },
    { id: 'hour', label: 'Hour of day (IST)', type: 'enum', values: Array.apply(null, Array(24)).map(function (x, i) { return String(i); }) },
    { id: 'captured', label: 'Captured value', type: 'text' },
    { id: 'reviewed', label: 'Reviewed', type: 'enum', values: ['yes', 'no'], names: { yes: 'Reviewed', no: 'Not reviewed' } },
    { id: 'kind', label: 'Kind', type: 'enum', values: ['real', 'test', 'browser'], names: { real: 'Real call', test: 'Test call', browser: 'Browser test' }, onlyWithTests: true }
  ];
  /* Knowledge lookup on a call: Found when a turn quotes a source; Not found when the caller asked about possession or parking
     (the Unanswered questions on Knowledge) and nothing was quoted; otherwise no lookup ran. */
  NS.knowledgeOf = function (c) { var t = c.turns || []; if (t.some(function (x) { return x.source && x.source.kind === 'knowledge'; })) return 'found'; return c.intent === 'int_possession' || c.intent === 'int_parking' ? 'not_found' : 'none'; };
  NS.field = function (id) { for (var i = 0; i < NS.FIELDS.length; i++) if (NS.FIELDS[i].id === id) return NS.FIELDS[i]; return null; };
  NS.hourLabel = function (h) { h = +h; return (h % 12 || 12) + ' ' + (h < 12 ? 'am' : 'pm'); };
  NS.valueName = function (fid, v, st) {
    var F = NS.field(fid), V = w.Vaani;
    if (fid === 'flow') return NS.flowLabel(v);
    if (fid === 'intent') return NS.intentLabel(v);
    if (fid === 'hour') return NS.hourLabel(v) + ' to ' + NS.hourLabel((+v + 1) % 24);
    if (fid === 'language') return V.langByCode(v).name;
    if (fid === 'outcome' && v === 'none') return 'No outcome';
    if (fid === 'last_step') { var fk = st && st.f && st.f.flow && st.f.flow.length === 1 ? st.f.flow[0] : 'flow_7c21@7', FL = NS.FLOWS[fk]; return FL && FL.steps[v] ? FL.steps[v][0] + ' · ' + FL.steps[v][1] : v; }
    if (F && F.names && F.names[v]) return F.names[v];
    if (F && F.domain) { var d = V.statusDef(F.domain, v); if (d) return d[0]; }
    return v;
  };
  NS.langOf = function (c) { return c.languages && c.languages[0] === 'hi' && c.languages.length > 1 ? 'hi' : (c.languages || [])[0]; };

  /* ---------- predicates ---------- */
  function textOf(c) {
    if (c._text == null) c._text = [c.leadName || 'Unknown caller', c.phone ? c.phone.masked + ' ' + c.phone.last4 : '', c.summary || '',
      NS.turnsOf(c).map(function (t) { return t.text; }).join(' ')].join(' ').toLowerCase();
    return c._text;
  }
  function inFilter(c, fid, vals) {
    if (!vals || !vals.length) return true;
    switch (fid) {
      case 'result': return vals.indexOf(c.result) >= 0;
      case 'outcome': return vals.some(function (v) { return v === 'none' ? (c.result === 'completed' && !c.outcome) : c.outcome === v; });
      case 'direction': return vals.indexOf(c.direction) >= 0;
      case 'flow': return vals.indexOf(NS.flowKey(c)) >= 0;
      case 'language': return vals.indexOf(NS.langOf(c)) >= 0;
      case 'duration': var lo = +vals[0] || 0, hi = vals[1] === '' || vals[1] == null ? Infinity : +vals[1]; return c.durationSec >= lo && c.durationSec <= hi;
      case 'intent': return vals.indexOf(c.intent) >= 0;
      case 'last_step': return vals.indexOf(c.lastStep) >= 0;
      case 'hour': return vals.indexOf(String(hourOf(c))) >= 0;
      case 'captured': var q = String(vals[0] || '').toLowerCase(); return !q || (c.captured || []).some(function (x) { return x.value && x.value.toLowerCase().indexOf(q) >= 0; });
      case 'reviewed': return vals.indexOf(c.reviewed ? 'yes' : 'no') >= 0;
      case 'sentiment': return vals.indexOf(c.sentiment) >= 0;
      case 'knowledge': return vals.indexOf(NS.knowledgeOf(c)) >= 0;   /* R2D-11 */   /* R3D-04: Neutral has no view, so its drill-downs filter */
      case 'kind': return vals.indexOf(c.kind) >= 0;
    }
    return true;
  }
  NS.inRange = function (c, R) { if (!R) return true; var d = dayOf(c); return d >= R.from && d <= R.to; };
  NS.inView = function (c, view, keep) {
    switch (view) {
      case 'review': return c.candidate && (!c.reviewed || !!(keep && keep[c.id]));
      case 'positive': case 'negative': case 'mixed': case 'unscored': return c.sentiment === view;
      default: return true;
    }
  };
  NS.baseSet = function (test, extra) { var all = extra && extra.length ? extra.concat(NS.calls) : NS.calls; return test ? all : all.filter(function (c) { return !c.test; }); };
  /* query(st, {keep, extra}) → { rows, viewTotal } ; st = { view, q, when, f, sort, test } */
  NS.query = function (st, o) {
    o = o || {}; var R = NS.range(st.when), q = (st.q || '').trim().toLowerCase(), f = st.f || {};
    var base = NS.baseSet(st.test, o.extra), inView = base.filter(function (c) { return NS.inView(c, st.view, o.keep); });
    var rows = inView.filter(function (c) {
      if (R && !NS.inRange(c, R)) return false;
      for (var k in f) if (!inFilter(c, k, f[k])) return false;
      if (!st.test && c.test) return false;
      return !q || textOf(c).indexOf(q) >= 0;
    });
    return { rows: NS.sort(rows, st.sort), viewTotal: inView.length };
  };
  var SENT = { positive: 0, neutral: 1, mixed: 2, negative: 3, unscored: 4 };
  function sortVal(c, col) {
    switch (col) {
      case 'when': return c.at + ':' + (c.sec < 10 ? '0' : '') + c.sec;
      case 'lead': return c.leadName ? c.leadName.toLowerCase() : null;
      case 'duration': return c.durationSec || null;
      case 'outcome': return c.outcome || (c.result !== 'completed' ? c.result : null);
      case 'sentiment': return SENT[c.sentiment];
      case 'phone': return c.phone ? c.phone.last4 : null;
      case 'direction': return c.direction;
      case 'flow': return c.flow ? c.flow.name + ' ' + (100 + c.flow.version) : null;
      case 'result': return c.result;
      case 'cost': return c.cost || null;
      case 'id': return c.id;
    }
    return c.at;
  }
  /* Blanks sort last in both directions (F-UX-046). */
  NS.sort = function (rows, s) {
    s = s || { col: 'when', dir: 'desc' }; var sign = s.dir === 'asc' ? 1 : -1;
    return rows.map(function (c) { return [sortVal(c, s.col), c]; }).sort(function (a, b) {
      if (a[0] == null && b[0] == null) return 0; if (a[0] == null) return 1; if (b[0] == null) return -1;
      return a[0] < b[0] ? -sign : a[0] > b[0] ? sign : (a[1].at < b[1].at ? 1 : -1);
    }).map(function (x) { return x[1]; });
  };
  NS.viewCounts = function (test, keep, extra) {
    var base = NS.baseSet(test, extra), out = { all: base.length, review: 0, positive: 0, negative: 0, mixed: 0, unscored: 0 };
    base.forEach(function (c) { if (c.candidate && !c.reviewed) out.review += 1; if (out[c.sentiment] != null) out[c.sentiment] += 1; });
    return out;
  };

  /* ---------- stats (GET /api/calls/stats): the same definitions for the toolbar totals and Analytics ---------- */
  NS.answered = function (c) { return c.direction === 'inbound' || c.result === 'completed' || c.result === 'voicemail'; };
  NS.talked = function (c) { return (c.result === 'completed' || c.result === 'voicemail') && c.durationSec > 0; };
  NS.stats = function (rows) {
    var s = { calls: rows.length, talkSec: 0, talked: 0, answered: 0, outbound: 0, negative: 0, sentiment: { positive: 0, neutral: 0, mixed: 0, negative: 0, unscored: 0 } };
    rows.forEach(function (c) { if (NS.talked(c)) { s.talkSec += c.durationSec; s.talked += 1; } if (NS.answered(c)) s.answered += 1; s.sentiment[c.sentiment] += 1; });
    s.negative = s.sentiment.negative; s.avgTalk = s.talked ? Math.round(s.talkSec / s.talked) : 0; s.answeredPct = s.calls ? s.answered / s.calls : null;
    return s;
  };
  var usage = {}; (D.usage || []).forEach(function (u) { usage[u.date] = u; });
  /* Billable minutes per day: Billing’s usage figure where the server has one, else the rounded talk time. */
  NS.minutesOn = function (day, rows) { if (usage[day]) return usage[day].minutes; return Math.round(rows.filter(function (c) { return dayOf(c) === day && c.kind === 'real'; }).reduce(function (a, c) { return a + c.durationSec; }, 0) / 60); };
  NS.talkText = function (sec) { if (!sec) return '0m'; var h = Math.floor(sec / 3600), m = Math.round(sec % 3600 / 60); return h ? h + 'h ' + m + 'm' : m + 'm'; };

  /* ---------- URL state (spec §1.4): defaults are omitted from the URL ---------- */
  NS.readState = function (search) {
    var p = new URLSearchParams(search), f = {};
    p.forEach(function (v, k) { if (k.indexOf('f.') === 0 && v !== '') f[k.slice(2)] = k === 'f.captured' ? [v] : v.split(','); });
    var sort = (p.get('sort') || 'when:desc').split(':');
    return { view: p.get('view') || 'all', q: p.get('q') || '', when: p.get('when') || '', f: f, sort: { col: sort[0], dir: sort[1] === 'asc' ? 'asc' : 'desc' },
      page: Math.max(1, +p.get('page') || 1), size: [25, 50, 100].indexOf(+p.get('size')) >= 0 ? +p.get('size') : 50, test: p.get('test') === '1',
      cols: p.get('cols') ? p.get('cols').split(',') : null, call: p.get('call') || null, tab: p.get('tab') || 'transcript', t: p.get('t') != null ? +p.get('t') : null, state: p.get('state') || null };
  };
  NS.writeState = function (st) {
    var p = new URLSearchParams();
    if (st.view && st.view !== 'all') p.set('view', st.view);
    if (st.q) p.set('q', st.q);
    if (st.when) p.set('when', st.when);
    Object.keys(st.f || {}).forEach(function (k) { if (st.f[k] && st.f[k].length) p.set('f.' + k, st.f[k].join(',')); });
    if (st.sort && !(st.sort.col === 'when' && st.sort.dir === 'desc')) p.set('sort', st.sort.col + ':' + st.sort.dir);
    if (st.page > 1) p.set('page', st.page);
    if (st.size !== 50) p.set('size', st.size);
    if (st.test) p.set('test', '1');
    if (st.cols) p.set('cols', st.cols.join(','));
    if (st.call) { p.set('call', st.call); if (st.tab && st.tab !== 'transcript') p.set('tab', st.tab); if (st.t != null) p.set('t', st.t); }
    if (st.state) p.set('state', st.state);
    var s = p.toString().replace(/%2C/g, ',').replace(/%40/g, '@');
    return s ? '?' + s : '';
  };
  NS.reportsHref = function (o) { var st = { view: o.view || 'all', q: '', when: o.when || '', f: o.f || {}, sort: null, page: 1, size: 50, test: !!o.test }; return 'call-reports.html' + NS.writeState(st); };
})(window);
