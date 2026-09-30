/* Vaani Labs prototype · pages/leads-data.js — the Leads page’s local dataset (03-pages/03 §3.2 stand-in for the API).
   VAANI_DATA.leads holds the 40 shared records; this file copies them (never mutates them) and adds fictional leads
   so the pipeline is the whole 1,284 the counts promise: views, search, filters, sort, paging and stats are computed
   from one list, the way /api/leads and /api/leads/stats would. Names are invented, numbers exist only masked. */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA, ist = D._util.ist, pad = D._util.pad;
  var L = w.VaaniLeads = w.VaaniLeads || {};
  var r = D._util.rng(20260927);
  function pick(a) { return a[Math.floor(r() * a.length)]; }
  function weighted(pairs) { var t = 0, x; pairs.forEach(function (p) { t += p[1]; }); x = r() * t; for (var i = 0; i < pairs.length; i++) { x -= pairs[i][1]; if (x < 0) return pairs[i][0]; } return pairs[0][0]; }

  var FIRST = ['Aditya', 'Akash', 'Alok', 'Amit', 'Ananya', 'Anil', 'Anjali', 'Ankita', 'Arjun', 'Aruna', 'Ashwin', 'Bhavesh', 'Chetan', 'Deepa', 'Devika', 'Dhruv', 'Divya', 'Farhan', 'Gaurav', 'Geeta', 'Harini', 'Hemant', 'Ishaan', 'Jaya', 'Jyoti', 'Kamal', 'Karthik', 'Kavita', 'Kiran', 'Kunal', 'Leela', 'Madhav', 'Mahesh', 'Meenal', 'Mohit', 'Nandita', 'Naveen', 'Neelam', 'Nitin', 'Pallavi', 'Pankaj', 'Parth', 'Prachi', 'Pranav', 'Preeti', 'Rajat', 'Ramesh', 'Rashmi', 'Ravi', 'Reema', 'Rohit', 'Rupal', 'Sachin', 'Sagar', 'Sakshi', 'Sanjay', 'Sapna', 'Seema', 'Shalini', 'Shankar', 'Shruti', 'Simran', 'Sonal', 'Srinivas', 'Suhas', 'Sunita', 'Suresh', 'Swati', 'Tanmay', 'Tara', 'Uday', 'Usha', 'Varsha', 'Vasudha', 'Vinay', 'Vishal', 'Yamini', 'Zubin'];
  var LAST = ['Acharya', 'Ahuja', 'Bajaj', 'Bhatt', 'Chandra', 'Chopra', 'Dalvi', 'Desai', 'Dixit', 'Gaikwad', 'Ghosh', 'Gokhale', 'Hegde', 'Iyengar', 'Jadhav', 'Joshi', 'Kamat', 'Khanna', 'Kohli', 'Kulkarni', 'Mathur', 'Menon', 'Mishra', 'Mukherjee', 'Naidu', 'Nair', 'Pandey', 'Patel', 'Pillai', 'Rane', 'Rao', 'Rathore', 'Sawant', 'Sen', 'Sethi', 'Shah', 'Shinde', 'Sinha', 'Sood', 'Srinivasan', 'Tiwari', 'Upadhyay', 'Varma', 'Wagh', 'Zaveri'];
  var CITIES = [['Pune', 'Maharashtra', 30], ['Mumbai', 'Maharashtra', 16], ['Thane', 'Maharashtra', 9], ['Navi Mumbai', 'Maharashtra', 6], ['Nashik', 'Maharashtra', 6], ['Nagpur', 'Maharashtra', 3], ['Bengaluru', 'Karnataka', 8], ['Hyderabad', 'Telangana', 6], ['Chennai', 'Tamil Nadu', 5], ['Ahmedabad', 'Gujarat', 4], ['Kochi', 'Kerala', 3], ['Indore', 'Madhya Pradesh', 3]];
  var STATE_OF = {}; CITIES.forEach(function (c) { STATE_OF[c[0]] = c[1]; });
  var LANGS = [['hi', 30], ['hi-Latn', 24], ['en', 20], ['mr', 9], ['ta', 5], ['te', 4], ['bn', 4], ['gu', 2], ['kn', 2]];
  var OWNERS = ['Anika R.', 'Rohit S.', 'Dev M.', 'Farah K.', 'Kiran P.'];
  var UNITS = ['1 BHK', '2 BHK', '2 BHK', '3 BHK', '2 BHK', '3 BHK', '4 BHK'];
  var BUDGETS = ['₹45 L to ₹60 L', '₹60 L to ₹85 L', '₹85 L to ₹1 Cr', '₹1 Cr to ₹1.4 Cr', '₹70 L to ₹90 L'];

  /* Past imports ("Imported from" filter, sheet meta). leads-sept.csv matches Home’s activity feed: 212 leads by Farah K. */
  L.IMPORTS = [
    { file: 'expo-walkins-aug.csv', at: ist(30, '16:05'), by: 'Rohit S.' },
    { file: 'portal-export-sep.xlsx', at: ist(13, '12:40'), by: 'Anika R.' },
    { file: 'leads-sept.csv', at: ist(1, '18:40'), by: 'Farah K.' }
  ];
  L.SOURCES = ['Manual', 'Import', 'Website', 'Facebook', 'Instagram', 'Google', 'WhatsApp', 'API', 'Sample data'];
  var SRC_MAP = { 'Website form': 'Website', 'Facebook ad': 'Facebook', 'Property portal': 'Import', 'Walk-in': 'Manual', Referral: 'Manual', 'CSV import': 'Import' };
  L.STATUS_ORDER = ['new', 'contacted', 'not_reached', 'callback_due', 'interested', 'converted', 'not_interested', 'do_not_call'];
  L.RESULTS = ['completed', 'no_answer', 'busy', 'voicemail', 'failed', 'timed_out'];
  L.OUTCOMES = ['Visit booked', 'Interested', 'Callback', 'Call later', 'Talked', 'Transferred', 'Not interested', 'Do not call'];
  L.flowById = function (id) { return (D.flows || []).filter(function (f) { return f.id === id; })[0] || null; };
  L.flowLabel = function (id) { var f = L.flowById(id); return f ? f.name + (f.live ? ' v' + f.live.version : '') : 'Workspace default'; };
  L.DEFAULT_FLOW = 'flow_7c21';

  function minutesAgo(iso) { return (Date.parse(D.meta.now) - Date.parse(iso)) / 60000; }
  L.minutesAgo = minutesAgo;
  /* a time in the past: n days ago (0 = today, never after 11:24 am) */
  function pastAt(days) {
    var hh = 10 + Math.floor(r() * 9), mm = Math.floor(r() * 12) * 5;
    if (days === 0) { hh = 9 + Math.floor(r() * 2); mm = Math.floor(r() * 5) * 5 + (hh === 10 ? 30 : 0); }
    return ist(days, pad(hh) + ':' + pad(mm));
  }

  function lastCallFor(status, days) {
    var at = pastAt(days);
    switch (status) {
      case 'new': return null;
      case 'contacted': return { result: 'completed', outcome: weighted([['Talked', 6], ['Transferred', 1], ['Callback', 2]]), at: at };
      case 'interested': return { result: 'completed', outcome: weighted([['Interested', 7], ['Visit booked', 3]]), at: at };
      case 'callback_due': return { result: 'completed', outcome: weighted([['Call later', 3], ['Callback', 2]]), at: at };
      case 'not_interested': return { result: 'completed', outcome: 'Not interested', at: at };
      case 'converted': return { result: 'completed', outcome: 'Visit booked', at: at };
      case 'do_not_call': return { result: 'completed', outcome: 'Do not call', at: at };
      default: {
        var res = weighted([['no_answer', 55], ['busy', 20], ['voicemail', 15], ['failed', 7], ['timed_out', 3]]);
        return { result: res, outcome: res === 'timed_out' ? null : { no_answer: 'No answer', busy: 'Busy', voicemail: 'Voicemail', failed: 'Failed' }[res], at: at };
      }
    }
  }
  function interestFor(status) {
    if (status === 'new') return null;
    if (status === 'converted') return 85 + Math.floor(r() * 11);
    if (status === 'interested') return 66 + Math.floor(r() * 28);
    if (status === 'not_interested' || status === 'do_not_call') return 4 + Math.floor(r() * 20);
    if (status === 'not_reached') return r() < 0.35 ? null : 20 + Math.floor(r() * 35);
    return 30 + Math.floor(r() * 40);
  }

  /* ---------- 1. copy the 40 shared leads ---------- */
  var list = (D.leads || []).map(function (s, i) {
    var l = JSON.parse(JSON.stringify(s));
    var src = SRC_MAP[l.source] || 'Manual';
    l.importFile = l.source === 'CSV import' ? 'leads-sept.csv' : l.source === 'Property portal' ? 'portal-export-sep.xlsx' : null;
    l.source = src;
    l.state = STATE_OF[l.city] || '';
    l.email = i % 3 === 2 ? null : l.first.toLowerCase() + '.' + l.name.split(' ')[1].toLowerCase() + '@mail.example';
    l.flowId = i % 5 === 2 ? null : l.flowId;
    if (l.lastCall && l.status === 'not_reached') { l.lastCall.outcome = 'No answer'; }
    if (l.lastCall && l.status === 'contacted') l.lastCall.outcome = i % 2 ? 'Talked' : 'Callback';
    l.reached = ['contacted', 'interested', 'callback_due', 'not_interested', 'converted', 'do_not_call'].indexOf(l.status) >= 0;
    l.calls = l.lastCall ? 1 + (i % 3) : 0;
    l.base = true;
    return l;
  });
  /* the running example and the ringing call (Cockpit’s call_live01 / call_live02): their Last call is a live state */
  var live = D.live || [];
  live.forEach(function (c) { var l = list.filter(function (x) { return x.id === c.leadId; })[0]; if (l) l.liveState = c.state; });
  /* two shared leads were called in the last 24 h (the gate’s "recent call" skip) and one callback is overdue */
  if (list[1]) { list[1].lastCall.at = ist(1, '13:20'); list[1].callbackAt = ist(1, '18:00'); }
  if (list[6] && list[6].lastCall) list[6].lastCall.at = ist(0, '09:40');
  /* everyone else was last called two or more days ago, so a batch from the top of All skips about three leads, not all */
  list.forEach(function (l, i) { if (i === 0 || i === 1 || i === 6 || !l.lastCall) return; if (minutesAgo(l.lastCall.at) < 2 * 1440) l.lastCall.at = pastAt(2 + (i % 4)); });

  /* ---------- 2. add fictional leads until the pipeline matches the server counts ---------- */
  var TARGET = { 'new': 312, interested: 96, callback_due: 18, not_reached: 211, contacted: 420, not_interested: 160, converted: 41, do_not_call: 26 };
  var have = {}; list.forEach(function (l) { have[l.status] = (have[l.status] || 0) + 1; });
  var bag = [];
  Object.keys(TARGET).forEach(function (s) { for (var k = (have[s] || 0); k < TARGET[s]; k++) bag.push(s); });
  for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
  var used = {}; list.forEach(function (l) { used[l.name] = 1; });
  /* generated leads are lead_2000…: the ids Call reports' ledger gives the same people (step 2b) */
  var no = 2000, cbSlot = 0;
  bag.forEach(function (status, n) {
    var name, guard = 0;
    do { name = pick(FIRST) + ' ' + pick(LAST); guard += 1; } while (used[name] && guard < 40);
    if (used[name]) name = name.split(' ')[0] + ' ' + pick(LAST) + '-' + pick(LAST); used[name] = 1;
    var city = weighted(CITIES.map(function (c) { return [c[0], c[2]]; }));
    var src = weighted([['Website', 26], ['Facebook', 16], ['Import', 24], ['Instagram', 7], ['Google', 9], ['WhatsApp', 6], ['API', 5], ['Manual', 7]]);
    var imp = src === 'Import' ? (status === 'new' ? weighted([['leads-sept.csv', 5], ['portal-export-sep.xlsx', 2], ['expo-walkins-aug.csv', 1]]) : weighted([['portal-export-sep.xlsx', 4], ['expo-walkins-aug.csv', 3]])) : null;
    var created = imp ? L.IMPORTS.filter(function (x) { return x.file === imp; })[0].at : pastAt(3 + Math.floor(r() * 140));
    var createdDays = Math.max(0, Math.round(minutesAgo(created) / 1440));
    var days = status === 'new' ? null : Math.max(2, Math.min(createdDays, 2 + Math.floor(Math.pow(r(), 1.2) * 24)));
    var lc = days == null ? null : lastCallFor(status, days);
    var first = name.split(' ')[0], last4 = String(1000 + Math.floor(r() * 8999));
    var l = {
      id: 'lead_' + no, no: no, name: name, first: first, initials: name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2),
      city: city, state: STATE_OF[city], phone: { masked: '+91 •••••• ' + last4, short: '•••• ' + last4, last4: last4 },
      status: status, interest: interestFor(status), language: weighted(LANGS),
      flowId: weighted([['flow_7c21', 50], ['flow_3b90', 14], ['flow_9e14', 9], [null, 27]]),
      owner: r() < 0.1 ? null : pick(OWNERS), source: src, importFile: imp, unit: pick(UNITS), budget: pick(BUDGETS),
      email: r() < 0.6 ? first.toLowerCase() + '.' + name.split(' ')[1].toLowerCase() + '@mail.example' : null,
      createdAt: created, lastCall: lc, callbackAt: null, dnd: status === 'do_not_call' || r() < 0.025, consent: status !== 'do_not_call',
      notes: r() < 0.22 ? [{ by: pick(OWNERS), at: pastAt(1 + Math.floor(r() * 8)), text: pick(['Wants a 2 BHK near the metro. Asked about parking.', 'Prefers WhatsApp for documents. Call after 6 pm.', 'Budget flexible if possession is before March.', 'Asked for the brochure in Hindi.', 'Visiting with family on the weekend.']) }] : [],
      reached: ['contacted', 'interested', 'callback_due', 'not_interested', 'converted', 'do_not_call'].indexOf(status) >= 0 || (status === 'not_reached' && r() < 0.1),
      calls: lc ? 1 + Math.floor(r() * 3) : 0
    };
    if (l.dnd && status !== 'do_not_call') l.consent = false;
    if (status === 'callback_due') { var slots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '18:45', '11:30', '12:00', '14:15']; l.callbackAt = cbSlot === 0 ? ist(1, '18:00') : ist(0, slots[cbSlot % slots.length]); cbSlot += 1; }
    else if ((status === 'contacted' || status === 'interested') && r() < 0.08) l.callbackAt = ist(-(1 + Math.floor(r() * 6)), pick(['11:00', '12:30', '16:00', '17:30', '18:00']));
    list.push(l); no += 1;
  });

  /* ---------- 2b. one call ledger for Leads and Call reports (03 §6.9 "from the same source"; 04 D3) ----------
     pages/call-reports-data.js (loaded before this file) is the ledger GET /api/calls stands for. Its people are the 40
     shared leads plus lead_2000…, the ids the generated leads above carry. Each called lead is paired with a ledger person
     whose latest call fits the lead’s status: that call becomes the lead’s Last call, the person’s earlier calls its
     Calls history, and the lead takes the person’s name and number. So "Open call report" (?call=) opens this lead’s own
     call, and Call reports' "Open lead" lands on the same person. Leads never called get the people the ledger never
     called. Ledger names that repeat (or repeat a shared lead’s) are not adopted, so Leads never shows two "Aarav Mehta"s. */
  var FITS = { contacted: ['Talked', 'Callback', 'Transferred'], interested: ['Interested', 'Visit booked'], callback_due: ['Call later', 'Callback'], not_interested: ['Not interested'], converted: ['Visit booked'], do_not_call: ['Do not call'], not_reached: ['No answer', 'Busy', 'Voicemail', 'Failed'] };
  /* A ledger call in Leads' words: a completed call with no outcome written is "Talked"; the ledger has no "Do not call"
     outcome, so for a Do not call lead its "Not interested" call is the one that asked not to be called. */
  function leadOutcome(c, l) {
    var o = c.result === 'completed' && !c.outcome ? 'Talked' : c.outcome;
    if (l && l.status === 'do_not_call' && o === 'Not interested') o = 'Do not call';
    return o;
  }
  function fitsStatus(c, l) { var o = leadOutcome(c, l); return !!o && (FITS[l.status] || []).indexOf(o) >= 0; }
  /* The ledger call a lead’s own Last call links to when it was not adopted (the shared leads keep their curated Last
     call): the same outcome, else one that fits the status, not newer than the Last call when there is one. None fits:
     no ?call=, and "Open call report" lists this lead’s calls (L.reportHref) instead of another conversation’s report. */
  function bestCall(l, calls) {
    var lc = l.lastCall, t = Date.parse(lc.at), same = function (c) { return leadOutcome(c, l) === lc.outcome && c.result === lc.result; }, before = function (c) { return Date.parse(c.at) <= t; };
    var fit = calls.filter(function (c) { return same(c) || fitsStatus(c, l); });
    return fit.filter(function (c) { return same(c) && before(c); })[0] || fit.filter(before)[0] || fit.filter(same)[0] || fit[0] || null;
  }
  function logFor(l, ref, calls) {
    l.lastCall.id = ref ? ref.id : null;
    var to = Date.parse(l.lastCall.at), from = Date.parse(l.createdAt);
    l.callLog = [{ last: l.lastCall, ref: ref }].concat(calls.filter(function (c) { var t = Date.parse(c.at); return c !== ref && t < to && t > from; }).map(function (c) { return { ref: c }; }));
    l.calls = l.callLog.length;
  }
  (function alignWithLedger() {
    var CR = w.VaaniCallReports; if (!CR || !CR.calls) return;
    var P = {}, nameOf = {}, count = {};
    CR.calls.forEach(function (c) { if (!c.leadId || c.test || c.kind !== 'real') return; (P[c.leadId] = P[c.leadId] || { who: c._lead, calls: [] }).calls.push(c); });   /* newest first */
    Object.keys(P).forEach(function (id) { if (P[id].who) nameOf[id] = P[id].who.name; });
    list.forEach(function (l) { if (l.base) nameOf[l.id] = l.name; });
    Object.keys(nameOf).forEach(function (id) { count[nameOf[id]] = (count[nameOf[id]] || 0) + 1; });
    list.forEach(function (l) { if (l.base && l.lastCall && P[l.id]) logFor(l, bestCall(l, P[l.id].calls), P[l.id].calls); });
    var gen = list.filter(function (l) { return !l.base; }), slots = gen.map(function (l) { return l.id; }), taken = {};
    var good = slots.filter(function (id) { return P[id] && P[id].who && count[P[id].who.name] === 1; });
    /* an adopted Last call is two or more days old (the gate’s 24 h skip is curated on the shared leads) and after the lead was added */
    var ok = function (c, l) { return minutesAgo(c.at) >= 2 * 1440 && Date.parse(c.at) > Date.parse(l.createdAt); };
    var tests = [function (l, p) { var c = p.calls[0]; return leadOutcome(c, l) === l.lastCall.outcome && ok(c, l) ? c : null; },
      function (l, p) { var c = p.calls[0]; return fitsStatus(c, l) && ok(c, l) ? c : null; },
      function (l, p) { return p.calls.filter(function (c) { return fitsStatus(c, l) && ok(c, l); })[0] || null; }];
    var pairs = [], left = gen.filter(function (l) { return l.lastCall; });
    tests.forEach(function (test) {
      left = left.filter(function (l) {
        for (var i = 0; i < good.length; i++) { var id = good[i]; if (taken[id]) continue; var c = test(l, P[id]); if (c) { taken[id] = 1; pairs.push([l, id, c]); return false; } }
        return true;
      });
    });
    var rest = function (goodFirst) { var g = good.filter(function (id) { return !taken[id]; }), s = slots.filter(function (id) { return !taken[id] && good.indexOf(id) < 0; }); return goodFirst ? g.concat(s) : s.concat(g); };
    /* no call to adopt (too recent, or before the lead was added): a person with a fitting call still gives Open call report a target */
    left = left.filter(function (l) {
      for (var i = 0; i < good.length; i++) { var id = good[i]; if (taken[id] || !P[id].calls.some(function (c) { return fitsStatus(c, l); })) continue; taken[id] = 1; pairs.push([l, id, null]); return false; }
      return true;
    });
    var pool = rest(true); left.forEach(function (l) { var id = pool.shift(); taken[id] = 1; pairs.push([l, id, null]); });
    pool = rest(false); gen.filter(function (l) { return !l.lastCall; }).forEach(function (l) { var id = pool.shift(); taken[id] = 1; pairs.push([l, id, null]); });
    pairs.forEach(function (x) {
      var l = x[0], id = x[1], anchor = x[2], p = P[id], who = p && p.who && count[p.who.name] === 1 ? p.who : null;
      l.id = id; l.no = +id.slice(5);
      if (who) {
        var parts = who.name.split(' ');
        l.name = who.name; l.first = parts[0]; l.initials = parts.map(function (s) { return s[0]; }).join('').slice(0, 2);
        l.phone = { masked: who.phone.masked, short: '•••• ' + who.phone.last4, last4: who.phone.last4 };
        if (l.email) l.email = parts[0].toLowerCase() + '.' + parts[parts.length - 1].toLowerCase() + '@mail.example';
      }
      if (!who || !l.lastCall) return;   /* a person whose ledger name repeats is never linked: the report would name someone else */
      if (anchor) {
        l.lastCall.result = anchor.result; l.lastCall.outcome = leadOutcome(anchor, l); l.lastCall.at = anchor.at;
        /* "heard on the call": Hindi, Hinglish and English leads take the language the call was held in */
        if (['hi', 'hi-Latn', 'en'].indexOf(l.language) >= 0 && anchor.style) l.language = anchor.style;
      }
      logFor(l, anchor || bestCall(l, p.calls), p.calls);
    });
    /* a lead that kept its own name must not repeat an adopted one (a separate generator, so nothing above shifts) */
    var seen = {}, rn = D._util.rng(1284);
    list.forEach(function (l) { if (l.base || nameOf[l.id] === l.name) seen[l.name] = 1; });
    list.forEach(function (l) {
      if (l.base || nameOf[l.id] === l.name) return;
      var guard = 0; while (seen[l.name] && guard < 60) { l.name = FIRST[Math.floor(rn() * FIRST.length)] + ' ' + LAST[Math.floor(rn() * LAST.length)]; guard += 1; }
      seen[l.name] = 1; var parts = l.name.split(' '); l.first = parts[0]; l.initials = parts.map(function (s) { return s[0]; }).join('').slice(0, 2);
      if (l.email) l.email = parts[0].toLowerCase() + '.' + parts[parts.length - 1].toLowerCase() + '@mail.example';
    });
    L.ledger = CR;
  })();
  L.all = list;
  L.byId = {}; list.forEach(function (l) { L.byId[l.id] = l; });

  /* ---------- 3. derived facts used by the table, the sheet and the gate ---------- */
  L.effectiveFlow = function (l) { return l.flowId || L.DEFAULT_FLOW; };
  L.recentlyCalled = function (l) { return !!(l.lastCall && minutesAgo(l.lastCall.at) < 24 * 60); };
  L.callbackOverdue = function (l) { return !!(l.callbackAt && minutesAgo(l.callbackAt) > 0); };
  L.callbackDueToday = function (l) { return l.status === 'callback_due' && !!l.callbackAt && Date.parse(l.callbackAt) < Date.parse(ist(-1, '00:00')); };
  L.notReached = function (l) { return !!(l.lastCall && ['no_answer', 'busy', 'voicemail', 'failed', 'timed_out'].indexOf(l.lastCall.result) >= 0) && ['converted', 'not_interested', 'do_not_call'].indexOf(l.status) < 0; };

  /* Calls and history for the sheet’s Calls tab (conversations, not legs; the count matches the row’s Calls). */
  var CALL_MIN = { completed: [55, 240], voicemail: [24, 34], failed: [18, 18] };
  function ledgerFlow(c) { return c.flow ? c.flow.name + ' v' + c.flow.version : L.flowLabel(L.DEFAULT_FLOW); }
  /* the caller’s key turn: their longest line (the budget, the day, the reason), not "Haan ji, boliye" */
  function keyTurn(c) { var CR = w.VaaniCallReports, t = CR && CR.turnsOf ? CR.turnsOf(c) : (c.turns || []); return (t || []).filter(function (x) { return x.speaker === 'caller'; }).reduce(function (m, x) { return !m || x.text.length > m.text.length ? x : m; }, null); }
  /* a ledger call as a Calls-tab item; lc (the lead’s own Last call) keeps the lead’s facts when the outcomes differ */
  function ledgerItem(l, c, lc) {
    if (!c) return { kind: 'call', id: null, q: l.phone.last4, at: lc.at, result: lc.result, outcome: lc.outcome, durationSec: lc.result === 'completed' ? 60 + (l.no * 37) % 150 : (CALL_MIN[lc.result] || [0])[0], flow: L.flowLabel(L.effectiveFlow(l)) };
    var o = leadOutcome(c, l), same = !lc || (o === lc.outcome && c.result === lc.result), f = lc || { at: c.at, result: c.result, outcome: leadOutcome(c) };
    return { kind: 'call', id: c.id, at: f.at, result: f.result, outcome: f.outcome, durationSec: same ? c.durationSec : (f.result === 'completed' ? 60 + (l.no * 37) % 150 : (CALL_MIN[f.result] || [0])[0]),
      flow: same ? ledgerFlow(c) : L.flowLabel(L.effectiveFlow(l)), turn: same ? keyTurn(c) : null, captured: same ? c.captured : null };
  }
  L.historyFor = function (l) {
    var rr = D._util.rng(l.no * 31), out = [];
    var shared = (D.calls || []).filter(function (c) { return c.leadId === l.id && !c.test; });
    if (l.lastCall && l.callLog) {
      /* a call placed on this page (the gate’s simulation) is newer than the ledger; the report opens with today’s calls */
      if (l.callLog[0].last !== l.lastCall) out.push({ kind: 'call', id: null, at: l.lastCall.at, result: l.lastCall.result, outcome: l.lastCall.outcome, durationSec: l.lastCall.result === 'completed' ? 60 + Math.floor(rr() * 150) : 0, flow: L.flowLabel(L.effectiveFlow(l)) });
      l.callLog.forEach(function (e) { out.push(ledgerItem(l, e.ref, e.last)); });
    } else if (l.lastCall) {
      var sc = shared.filter(function (c) { return c.outcome === l.lastCall.outcome; })[0];
      var dur = l.lastCall.result === 'completed' ? 60 + Math.floor(rr() * 150) : (CALL_MIN[l.lastCall.result] || [0])[0];
      out.push({ kind: 'call', id: sc ? sc.id : null, q: sc || l.lastCall.at.slice(0, 10) === D.meta.today ? null : l.phone.last4, at: l.lastCall.at, result: l.lastCall.result, outcome: l.lastCall.outcome, durationSec: sc ? sc.durationSec : dur, flow: L.flowLabel(L.effectiveFlow(l)), turn: sc ? (sc.turns || []).filter(function (t) { return t.speaker === 'caller'; })[0] : null, captured: sc ? sc.captured : null });
      for (var k = 1; k < l.calls; k++) {
        var at = new Date(Date.parse(l.lastCall.at) - (k * 2 + Math.floor(rr() * 3)) * 86400000).toISOString();
        var res = rr() < 0.5 ? 'no_answer' : 'completed';
        out.push({ kind: 'call', q: l.phone.last4, at: at, result: res, outcome: res === 'completed' ? 'Talked' : 'No answer', durationSec: res === 'completed' ? 40 + Math.floor(rr() * 80) : 0, flow: L.flowLabel(L.effectiveFlow(l)) });
      }
    }
    if (l.status !== 'new' && l.lastCall) out.push({ kind: 'status', at: new Date(Date.parse(l.lastCall.at) + 120000).toISOString(), from: 'New', to: (V().statusDef('lead', l.status) || [''])[0] });
    if (l.callbackAt) out.push({ kind: 'callback', at: l.lastCall ? new Date(Date.parse(l.lastCall.at) + 60000).toISOString() : l.createdAt, when: l.callbackAt });
    out.push({ kind: 'created', at: l.createdAt, source: l.source, file: l.importFile });
    return out.sort(function (a, b) { return Date.parse(b.at) - Date.parse(a.at); });
  };
  L.capturedFor = function (l) {
    var h = L.historyFor(l).filter(function (x) { return x.kind === 'call' && x.result === 'completed'; })[0];
    if (!h) return null;
    if (h.captured && h.captured.length) return h.captured;
    var o = l.lastCall && l.lastCall.outcome;
    return [{ key: 'Budget', value: o === 'Visit booked' || o === 'Interested' ? l.budget : null }, { key: 'Preferred day', value: o === 'Visit booked' ? 'Saturday, morning' : o === 'Call later' || o === 'Callback' ? 'Weekday evening' : null }, { key: 'Site visit', value: o === 'Visit booked' ? 'Booked · Sat 3 Oct, 11:00 am' : o === 'Not interested' ? 'Declined' : null }];
  };

  /* ---------- 4. stats over a result set (GET /api/leads/stats: filters apply, pagination never does) ---------- */
  L.statsOf = function (rows) {
    var s = { leads: rows.length, open: 0, reached: 0, interested: 0, converted: 0, scored: 0, sum: 0 };
    rows.forEach(function (l) {
      if (['converted', 'not_interested', 'do_not_call'].indexOf(l.status) < 0) s.open += 1;
      if (l.reached) s.reached += 1;
      if (l.status === 'interested') s.interested += 1;
      if (l.status === 'converted') s.converted += 1;
      if (l.interest != null) { s.scored += 1; s.sum += l.interest; }
    });
    s.avg = s.scored >= 5 ? Math.round(s.sum / s.scored) : null;
    return s;
  };
  function V() { return w.Vaani; }

  /* Fictional rows for an import (sample file or the rows parsed from a chosen CSV). */
  L.makeImported = function (n, file, o) {
    o = o || {}; var rows = [], rr = D._util.rng(n * 7 + file.length);
    for (var k = 0; k < n; k++) {
      var src = o.rows && o.rows[k] ? o.rows[k] : null;
      var nm = src && src.name ? src.name : FIRST[Math.floor(rr() * FIRST.length)] + ' ' + LAST[Math.floor(rr() * LAST.length)];
      var city = src && src.city ? src.city : CITIES[Math.floor(rr() * CITIES.length)][0];
      var last4 = src && src.last4 ? src.last4 : String(1000 + Math.floor(rr() * 8999));
      var lead = { id: 'lead_' + no, no: no, name: nm, first: nm.split(' ')[0], initials: nm.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2), city: city, state: STATE_OF[city] || '',
        phone: { masked: '+91 •••••• ' + last4, short: '•••• ' + last4, last4: last4 }, status: 'new', interest: null, language: (src && src.language) || o.language || null,
        flowId: o.flowId || null, owner: null, source: 'Import', importFile: file, unit: null, budget: src && src.custom ? src.custom : null, email: src && src.email ? src.email : null,
        createdAt: D.meta.now, lastCall: null, callbackAt: null, dnd: false, consent: true, notes: [], reached: false, calls: 0, fresh: true };
      rows.push(lead); no += 1;
    }
    return rows;
  };
  L.nextNo = function () { no += 1; return no - 1; };
})(window);
