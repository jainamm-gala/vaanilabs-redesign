/* Vaani Labs prototype · pages/assistant-data.js — fictional scenario data for the Assistant (03-pages/02).
   Everything here is made up: Sample Realty (Pune), leads from assets/data.js, masked phones only. Shared records are read,
   never mutated: this file copies what the page needs into window.VaaniAssistant.DATA. */
(function (w) {
  'use strict';
  var V = w.Vaani, D = V.data, F = V.fmt, esc = V.util.esc, ist = D._util.ist;
  var A = w.VaaniAssistant = w.VaaniAssistant || {};

  function lead(i) { return D.leads[i]; }
  function leadHref(l) { return 'leads.html?lead=' + l.id; }

  /* ---------- The 18 callbacks due today: 12 remain after leaving out the 6 called since yesterday 10:42 am ---------- */
  var DUE = ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:15', '16:30'];
  var REMAIN = [1, 6, 13, 25, 34, 4, 9, 12, 14, 20, 35, 37];
  var LEFT_OUT = [3, 17, 18, 23, 24, 29];
  var callbacks = REMAIN.map(function (idx, k) {
    var l = lead(idx);
    return { id: l.id, name: l.name, city: l.city, phone: l.phone, lang: l.language, due: ist(0, DUE[k]), last: l.lastCall ? l.lastCall.at : null, href: leadHref(l) };
  });
  /* In the Call gate: Tanvi Shetty is already in "Weekend follow-ups"; Sameer Qureshi is on the DND registry. */
  var SCHEDULED = 'lead_1184', DND = 'lead_1281';

  /* ---------- expo-visitors.csv: 27 rows, 3 already in Leads ---------- */
  var EXPO_NAMES = ['Meghna Kulkarni', 'Farhan Ali', 'Sunita Deshmukh', 'Rajat Khanna', 'Pallavi Joshi', 'Aman Gill', 'Rekha Nambiar', 'Vivek Tiwari',
    'Shalini Rao', 'Kunal Mehra', 'Divya Pillai', 'Sanjay Kamath', 'Ayesha Khan', 'Rohit Bansal', 'Mitali Sen', 'Gaurav Shinde', 'Leena Dsouza',
    'Abhishek Pandey', 'Naina Oberoi', 'Tarun Hegde', 'Swati Kale', 'Irfan Patel', 'Juhi Chawla', 'Ketan Shah'];
  var EXPO_CITY = ['Pune', 'Pune', 'Pimpri', 'Pune', 'Wakad', 'Hinjawadi', 'Pune', 'Baner'];
  var expo = EXPO_NAMES.map(function (n, i) {
    var last4 = String(2100 + i * 173).slice(-4);
    return { name: n, city: EXPO_CITY[i % EXPO_CITY.length], phone: { masked: '+91 •••••• ' + last4, last4: last4 }, unit: ['2 BHK', '3 BHK', '2 BHK', '1 BHK'][i % 4], lang: ['hi', 'en', 'hi-Latn', 'mr'][i % 4] };
  });
  var expoDupes = [lead(0), lead(12), lead(24)].map(function (l) { return { name: l.name, city: l.city, phone: l.phone }; });

  /* ---------- Numbers for the analytics answer come from the same daily aggregates Analytics uses (D.usage) ---------- */
  function usageFor(date) { for (var i = 0; i < D.usage.length; i++) if (D.usage[i].date === date) return D.usage[i]; return null; }
  function week(endIdx) { var s = { calls: 0, connected: 0, minutes: 0, spend: 0 }; for (var i = Math.max(0, endIdx - 6); i <= endIdx; i++) { var u = D.usage[i]; s.calls += u.calls; s.connected += u.connected; s.minutes += u.minutes; s.spend += u.spend; } return s; }
  var thu = usageFor('2026-09-24'), prevThu = usageFor('2026-09-17'), wed = usageFor('2026-09-23');
  var last7 = week(D.usage.length - 1), prev7 = week(D.usage.length - 8);

  /* ---------- turn builders ---------- */
  function you(id, at, text, o) { o = o || {}; return { id: id, role: 'user', at: at, text: text, lang: o.lang, attachments: o.attachments || [], state: 'sent', planRef: o.planRef }; }
  function bot(id, at, o) { o.id = id; o.role = 'assistant'; o.at = at; o.state = o.state || 'complete'; return o; }

  var cbRows = callbacks.slice(0, 5);
  function chat1() {
    return {
      id: 'chat_1', title: "Plan calls for today’s callbacks", startedAt: ist(0, '10:42'), changes: [],
      turns: [
        you('c1t1', ist(0, '10:42'), 'Plan calls for the 18 callbacks due today. Skip anyone we called in the last day.', { planRef: 'plan_1' }),
        bot('c1t2', ist(0, '10:42'), {
          activity: [
            { icon: 'search', text: 'Looked up 18 callbacks due today', link: { label: 'Leads', href: 'leads.html?view=callbacks' }, ms: '0.8 s' },
            { icon: 'phone', text: 'Checked calls since yesterday 10:42 am', link: { label: 'Call reports', href: 'call-reports.html?range=24h' }, ms: '0.4 s' }
          ],
          blocks: [
            { t: 'text', html: '<p>18 callbacks are due today. 6 of them were called in the last 24 hours, so I left them out. These 12 remain:</p>' },
            { t: 'table', kind: 'callbacks', total: 12, rows: cbRows, link: { label: 'Open all 12 in Leads', href: 'leads.html?view=callbacks&q=due-today' } },
            { t: 'text', html: '<p>I’ll call them with <span translate="no">Site-visit qualifier</span> v7, the live version. Nothing dials until you review the calls.</p>' }
          ],
          plan: 'plan_1',
          sources: [{ label: '18 leads', href: 'leads.html?view=callbacks' }, { label: '31 calls', href: 'call-reports.html?range=24h' }],
          followups: ['Show only Hindi speakers', 'Draft a callback script for these leads'],
          stepsRan: true
        })
      ],
      plan: {
        id: 'plan_1', state: 'waiting', steps: [
          { id: 's1', kind: 'Look up', title: 'Find callbacks due today', status: 'done', result: { text: '18 leads', link: { label: 'View in Leads', href: 'leads.html?view=callbacks' } }, details: 'Status is Callback due · Due today · Owner: anyone' },
          { id: 's2', kind: 'Look up', title: 'Leave out leads called in the last 24 h', status: 'done', result: { text: '6 left out · 12 remain' }, details: 'Last call after yesterday 10:42 am · 6 leads: ' + LEFT_OUT.map(function (i) { return lead(i).name; }).join(', ') },
          { id: 's3', kind: 'Call', title: 'Call 12 leads with Site-visit qualifier v7', status: 'waiting', approval: 'call', details: 'Status is Callback due · Due today · Not called in the last 24 h' },
          { id: 's4', kind: 'Change', title: 'Mark answered leads Contacted', status: 'queued', queuedText: 'After the calls · asks you first', approval: 'mark', after: 'calls', dependsOn: 's3' }
        ]
      }
    };
  }

  function chat2() {
    var call = D.calls.filter(function (c) { return c.id === 'call_7db22b'; })[0] || D.calls[0];
    return {
      id: 'chat_2', title: 'Why did calls drop on Thursday?', startedAt: ist(3, '15:22'), changes: [],
      turns: [
        you('c2t1', ist(3, '15:22'), 'Why did calls drop on Thursday?'),
        bot('c2t2', ist(3, '15:22'), {
          activity: [
            { icon: 'chart-column', text: 'Read call totals for Thu 24 Sep and the week before', link: { label: 'Analytics', href: 'analytics.html?range=7d' }, ms: '0.6 s' },
            { icon: 'phone', text: 'Read 9 calls from Thursday', link: { label: 'Call reports', href: 'call-reports.html?date=2026-09-24' }, ms: '0.9 s' },
            { icon: 'book-open', text: 'Found 1 passage in', link: { label: 'site-visit-checklist.txt', href: 'knowledge.html?q=site-visit-checklist' }, ms: '0.3 s' }
          ],
          blocks: [
            { t: 'text', html: '<p>Thursday had ' + thu.calls + ' calls, ' + (wed.calls - thu.calls) + ' fewer than Wednesday (' + wed.calls + '). Fewer people picked up too: ' + thu.connected + ' of ' + thu.calls + ' connected (' + F.pct(thu.connected / thu.calls) + '), against ' + wed.connected + ' of ' + wed.calls + ' on Wednesday.</p>' },
            { t: 'stats', scope: 'Thu 24 Sep 2026 · calls, not legs · test calls excluded', items: [
              { label: 'Calls', value: F.count(thu.calls), delta: { n: thu.calls - wed.calls, vs: 'vs Wed' } },
              { label: 'Connected', value: F.count(thu.connected), unit: F.pct(thu.connected / thu.calls), delta: { n: thu.connected - wed.connected, vs: 'vs Wed' } },
              { label: 'Minutes', value: F.count(thu.minutes), delta: wed ? { n: thu.minutes - wed.minutes, vs: 'vs Wed' } : null }
            ] },
            { t: 'text', html: '<p>In the 9 Thursday calls I can see, 4 were not answered and 1 went to voicemail. Most unanswered calls were placed between 10 and 11 am, when many leads are commuting. One caller who did answer said the timing was wrong:</p>' },
            { t: 'quote', call: call, turns: (call.turns || []).filter(function (x) { return x.speaker !== 'system'; }).slice(0, 2) },
            { t: 'passage', text: 'Call site-visit leads after 12 pm on weekdays. Morning calls reach voicemail more often.', source: 'site-visit-checklist.txt · line 4' },
            { t: 'text', html: '<p>Moving Thursday’s batch to the afternoon is worth a try. I haven’t changed anything.</p>' }
          ],
          sources: [{ label: thu.calls + ' calls', href: 'call-reports.html?date=2026-09-24' }, { label: 'Analytics · Thu 24 Sep', href: 'analytics.html?date=2026-09-24' }, { label: 'site-visit-checklist.txt', href: 'knowledge.html?q=site-visit-checklist' }],
          followups: ['Show unanswered calls by hour', 'Plan Thursday’s batch for 2 pm']
        })
      ],
      plan: null
    };
  }

  function chat3() {
    return {
      id: 'chat_3', title: 'Draft a festive offer flow', startedAt: ist(6, '12:10'), changes: [{ id: 'ch31', icon: 'workflow', at: ist(6, '12:11'), html: 'Created draft flow <b translate="no">Festive offer callback</b>', acts: [{ label: 'Open in Flows', href: 'flow-designer.html?flow=flow_f219' }], undone: false, noUndo: 'Someone edited the draft since' }],
      turns: [
        you('c3t1', ist(6, '12:10'), 'Draft a festive offer flow from the Diwali offer PDF and publish it.', { attachments: [{ name: 'festive-offer-2026.pdf', size: 1363148 }], planRef: 'plan_3' }),
        bot('c3t2', ist(6, '12:11'), {
          activity: [
            { icon: 'file-text', text: 'Read festive-offer-2026.pdf · 3 pages', ms: '1.4 s' },
            { icon: 'workflow', text: 'Checked', link: { label: 'Festive offer callback', href: 'flow-designer.html?flow=flow_f219' }, tail: 'draft · No issues', ms: '0.5 s' }
          ],
          blocks: [
            { t: 'text', html: '<p>I drafted a 5-step callback flow from pages 1 to 3 of the offer: it greets the lead, explains the Diwali price, answers two common questions and offers a site visit.</p>' },
            { t: 'flowcard', name: 'Festive offer callback', href: 'flow-designer.html?flow=flow_f219', meta: '5 steps · Trigger 1 · Logic 1 · Action 2 · Outcome 1' },
            { t: 'text', html: '<p>Publishing makes it live for outbound batches. That waits for you.</p>' }
          ],
          plan: 'plan_3',
          sources: [{ label: 'festive-offer-2026.pdf', href: 'knowledge.html?q=festive-offer-2026' }],
          stepsRan: true
        })
      ],
      plan: {
        id: 'plan_3', state: 'expired', steps: [
          { id: 's1', kind: 'Look up', title: 'Read festive-offer-2026.pdf', status: 'done', result: { text: '3 pages · 11 passages' } },
          { id: 's2', kind: 'Draft', title: 'Create draft flow Festive offer callback', status: 'done', result: { text: 'Not published · 5 steps', link: { label: 'Open in Flows', href: 'flow-designer.html?flow=flow_f219' } } },
          { id: 's3', kind: 'Publish', title: 'Publish Festive offer callback as v1', status: 'expired', approval: 'publish' }
        ]
      }
    };
  }

  /* Older chats: a short, finished exchange each (history content). */
  function simple(id, title, at, reply, sources, changes) {
    return { id: id, title: title, startedAt: at, changes: changes || [], plan: null, simple: true,
      turns: [you(id + 't1', at, title), bot(id + 't2', at, { blocks: [{ t: 'text', html: '<p>' + esc(reply) + '</p>' }], sources: sources || 'none' })] };
  }
  var OLDER = [
    simple('chat_4', "Summarise yesterday’s calls from Pune", ist(1, '18:10'), '9 calls to Pune leads yesterday: 6 connected, 2 booked a site visit and 1 asked for a call after Diwali.', [{ label: '9 calls', href: 'call-reports.html?date=2026-09-26&q=Pune' }]),
    simple('chat_5', 'Find leads who asked about parking', ist(4, '11:05'), '7 leads asked about parking in the last 30 days. Most asked whether a covered slot is included with 2 BHK units.', [{ label: '7 leads', href: 'leads.html?q=parking' }, { label: 'parking-allotment.docx', href: 'knowledge.html?q=parking' }]),
    simple('chat_6', 'Import expo visitors from the Pune fair', ist(8, '17:30'), 'Added 41 leads from pune-fair-visitors.csv. 5 were already in Leads, so I skipped them.', [{ label: '41 leads', href: 'leads.html?q=pune-fair' }], [1]),
    simple('chat_7', 'Which flow books more site visits?', ist(11, '10:20'), 'Site-visit qualifier v7 booked 38 visits in the last 30 days; Home-loan follow-up v3 booked 6.', [{ label: 'Analytics · last 30 days', href: 'analytics.html?range=30d' }]),
    simple('chat_8', 'Draft an EMI reminder in Hinglish', ist(15, '15:45'), 'Drafted Booking amount reminder as a Hinglish flow. It was published as v1 by Rohit S. the same day.', [{ label: 'Booking amount reminder', href: 'flow-designer.html?flow=flow_9e14' }], [1, 2]),
    simple('chat_9', 'How many leads came from the property portal?', ist(20, '12:30'), '214 of 1,284 leads came from the property portal. 31 of them are Interested.', [{ label: '214 leads', href: 'leads.html?q=Property%20portal' }])
  ];

  A.DATA = {
    callbacks: callbacks, leftOut: LEFT_OUT.map(lead), scheduledId: SCHEDULED, dndId: DND,
    expo: expo, expoDupes: expoDupes,
    usage: { thu: thu, prevThu: prevThu, last7: last7, prev7: prev7 },
    build: function () { return [chat1(), chat2(), chat3()].concat(OLDER.map(function (c) { return JSON.parse(JSON.stringify(c)); })); },
    olderCount: 3,  /* the last 3 load with "Show older chats" */
    /* The chat saved in this browser before the release (12.6); shown only in the migration demo state. */
    localChat: { title: 'Plan the Nashik plot enquiries', messages: 6 },
    liveFlows: D.flows.filter(function (f) { return f.status === 'live'; }).map(function (f) { return { id: f.id, name: f.name, v: f.live.version }; }),
    voices: D.voices.filter(function (v) { return v.available; }),
    starters: [
      { id: 'draft', label: 'Draft a sales call flow', icon: 'workflow', insert: 'Draft a sales call flow for ' },
      { id: 'summary', label: 'Summarise my last 10 calls', icon: 'file-text', insert: 'Summarise my last 10 calls' },
      { id: 'analytics', label: 'Show this week’s call analytics', icon: 'chart-column', insert: 'Show this week’s call analytics' },
      { id: 'doc', label: 'Turn a document into a flow…', icon: 'file-up', action: 'attach', insert: 'Turn this document into a draft flow.' }
    ],
    startersNoCalls: [
      { id: 'setup', label: 'Help me set up my first call', icon: 'phone', insert: 'Help me set up my first call' },
      { id: 'what', label: 'What can a call flow do?', icon: 'workflow', insert: 'What can a call flow do?' }
    ]
  };
  A.DATA.workspaceSugs = function () {
    var out = [], s = D.state || {}, c = D.counts || {};
    if (s.callbacksDueToday > 0) out.push({ id: 'ws-callbacks', label: s.callbacksDueToday + ' callbacks are due today. Plan the calls', icon: 'clock', insert: 'Plan calls for the ' + s.callbacksDueToday + ' callbacks due today.' });
    var y = D.calls.filter(function (x) { return x.at.slice(0, 10) === '2026-09-26' && x.result === 'failed'; }).length;
    if (y > 0) out.push({ id: 'ws-failed', label: y + ' calls failed yesterday. Find out why', icon: 'circle-alert', insert: 'Find out why ' + y + ' calls failed yesterday.' });
    else if (c.callsNeedReview > 0) out.push({ id: 'ws-review', label: c.callsNeedReview + ' calls need review. Summarise them', icon: 'list-checks', insert: 'Summarise the ' + c.callsNeedReview + ' calls that need review.' });
    return out.slice(0, 2);
  };
})(window);
