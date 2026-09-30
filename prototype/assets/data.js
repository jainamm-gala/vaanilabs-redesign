/* Vaani Labs prototype · data.js — fictional data on window.VAANI_DATA. Nothing here is real customer data: names are
   invented, phone numbers exist only in masked form (+91 •••••• 4821), domains use .example, amounts are INR.
   "Now" is fixed at Sun 27 Sep 2026, 11:24 am IST so every relative time ("Today 10:42 am") is stable.
   Shapes are documented in prototype/_foundation-notes.md §5. Read-only by convention: pages copy before mutating.
   Counts in VAANI_DATA.counts are the "server" totals (pipeline-wide); the record arrays are the loaded page. */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA = {};

  /* ---------- time helpers (IST, +05:30) ---------- */
  var NOW = '2026-09-27T11:24:00+05:30';
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* ist(daysAgo, 'HH:MM') -> ISO string in IST; daysAgo 0 = today (27 Sep 2026) */
  function ist(daysAgo, hm) {
    var d = new Date(Date.UTC(2026, 8, 27 - daysAgo));
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + (hm || '10:00') + ':00+05:30';
  }
  /* deterministic PRNG (mulberry32) so every reload shows the same data */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  D._util = { ist: ist, rng: rng, pad: pad };

  D.meta = { now: NOW, today: '2026-09-27', tz: 'Asia/Kolkata', tzLabel: 'IST', locale: 'en-IN', currency: 'INR', ratePerSec: 0.04 };

  /* ---------- workspace, user, team ---------- */
  D.org = {
    id: 'ws_sample', name: 'Sample Realty', initial: 'S', slug: 'sample-realty', address: 'sample-realty.vaanilabs.in',
    kind: 'b2b', plan: 'pay-as-you-go', role: 'Admin', billingLabel: 'Prepaid wallet',
    inboundNumber: { masked: '+91 80 •••• 2210', short: '•••• 2210', last4: '2210', status: 'verified', verifiedAt: ist(15, '12:10') },
    callerId: { masked: '+91 80 •••• 2210', status: 'verified' },
    callingHours: { tz: 'IST', days: [
      { day: 'Mon', open: true, from: '10:00 am', to: '7:00 pm' }, { day: 'Tue', open: true, from: '10:00 am', to: '7:00 pm' },
      { day: 'Wed', open: true, from: '10:00 am', to: '7:00 pm' }, { day: 'Thu', open: true, from: '10:00 am', to: '7:00 pm' },
      { day: 'Fri', open: true, from: '10:00 am', to: '7:00 pm' }, { day: 'Sat', open: true, from: '10:00 am', to: '7:00 pm' },
      { day: 'Sun', open: true, from: '11:00 am', to: '5:00 pm' }], openNow: true, closesAt: '5:00 pm' },
    transferTarget: { name: 'Rohit S.', masked: '+91 •••••• 4107' },
    members: [
      { id: 'u_anika', name: 'Anika Rao', short: 'Anika R.', initials: 'AR', role: 'Admin', email: 'anika.rao@samplerealty.example', lastActive: ist(0, '11:20'), you: true },
      { id: 'u_rohit', name: 'Rohit Sharma', short: 'Rohit S.', initials: 'RS', role: 'Admin', email: 'rohit.sharma@samplerealty.example', lastActive: ist(0, '10:05') },
      { id: 'u_dev', name: 'Dev Malhotra', short: 'Dev M.', initials: 'DM', role: 'Member', email: 'dev.malhotra@samplerealty.example', lastActive: ist(1, '17:42') },
      { id: 'u_farah', name: 'Farah Khan', short: 'Farah K.', initials: 'FK', role: 'Member', email: 'farah.khan@samplerealty.example', lastActive: ist(0, '09:58') },
      { id: 'u_kiran', name: 'Kiran Pillai', short: 'Kiran P.', initials: 'KP', role: 'Member', email: 'kiran.pillai@samplerealty.example', lastActive: ist(3, '15:12') },
      { id: 'u_meera', name: 'Meera Joshi', short: 'Meera J.', initials: 'MJ', role: 'Member', email: 'meera.joshi@samplerealty.example', invited: true, lastActive: null }
    ]
  };
  D.user = { id: 'u_anika', name: 'Anika Rao', short: 'Anika R.', initials: 'AR', role: 'Admin', email: 'anika.rao@samplerealty.example', phoneMasked: '+91 •••••• 3012', twoFactor: true, rep: { available: false } };
  D.workspaces = [
    { id: 'ws_sample', name: 'Sample Realty', role: 'Admin', current: true },
    { id: 'ws_demo', name: 'Demo Workspace', role: 'Member' }
  ];

  /* ---------- setup track (03-pages/00 §13). Default demo state mirrors the canonical render: 4 of 5 done. ---------- */
  D.setup = {
    completedAt: null, done: 4, total: 5, next: 'call yourself', nextStepId: 'call-yourself',
    steps: [
      { id: 'teach', title: 'Teach your agent', optional: true, state: 'done', proof: 'Indexed · 12 files · 418 passages', action: { label: 'Upload files', href: 'knowledge.html?upload=1' } },
      { id: 'publish', title: 'Publish a flow', state: 'done', proof: 'Site-visit qualifier v7 is published', action: { label: 'Open', href: 'flow-designer.html' } },
      { id: 'verify', title: 'Verify your calling number', state: 'done', proof: '+91 80 •••• 2210 · Verified', action: { label: 'Open', href: 'settings.html#phone/caller-id' } },
      { id: 'money', title: 'Add money', state: 'done', proof: '₹2,000 added · about 13 h of calls', action: { label: 'Top up…', href: 'billing.html?topup=1' } },
      { id: 'call-yourself', title: 'Call yourself', state: 'current', body: 'Hear the flow on your own phone before customers do. About 2 minutes, about ₹5.', action: { label: 'Call my number…' }, secondary: { label: 'Talk in browser instead', note: "This doesn’t test your phone line, so it doesn’t complete this step." } },
      { id: 'people', title: 'Add people to call', state: 'done', proof: '1,284 leads imported', action: { label: 'Import leads…', href: 'leads.html?import=1' } }
    ]
  };

  /* ---------- wallet (runway from the real per-second rate; 05-knowledge-billing) ---------- */
  D.wallet = {
    balance: 2340.50, state: 'healthy', runway: 'about 16 h of calls', runwayShort: '16 h', ratePerSec: 0.04,
    lowThresholdMin: 60, freeMeetingMinutes: { left: 29, of: 30 },
    autopay: { state: 'off', threshold: 200, amount: 1000, monthlyLimit: 5000, mandateValidUntil: null },
    presets: [100, 500, 1000], min: 100, max: 100000,
    states: {
      healthy: { balance: 2340.50, runway: 'about 16 h of calls' },
      low: { balance: 42.10, runway: 'about 17 min' },
      empty: { balance: 0, runway: null },
      pending: { balance: 42.10, runway: null },
      'autopay-failed': { balance: 42.10, runway: 'about 17 min' }
    }
  };

  /* ---------- workspace state: server counts behind badges, header meta and the Baseline ---------- */
  D.state = { liveCalls: 2, upNext: 3, flowsWithDrafts: 1, callbacksDueToday: 18, proposals: 3, tasksToConfirm: 1, assistantWaiting: 1, numberStatus: 'verified', myCall: null };
  D.counts = {
    leads: 1284, leadViews: { all: 1284, 'new': 312, callbacks: 18, interested: 96, notReached: 211 },
    /* call totals match the Call reports ledger (pages/call-reports-data.js: 90 days, test calls hidden) and usage[] (994 in 30 days) */
    calls: 2579, callsNeedReview: 9, callViews: { all: 2579, review: 9, positive: 461, negative: 189, mixed: 168, unscored: 1014 },
    flows: 16, flowsLive: 3, flowsDraft: 1, knowledge: 14, knowledgeIndexing: 1, meetingsPast: 12, meetingsLive: 1, tasks: 3
  };

  /* ---------- languages and voices (LanguageMark glyphs, data-nav §5.6) ---------- */
  D.languages = [
    { code: 'hi', name: 'Hindi', glyph: 'अ', lang: 'hi' }, { code: 'en', name: 'English', glyph: 'A', lang: 'en' },
    { code: 'hi-Latn', name: 'Hinglish', glyph: 'अA', lang: 'hi-Latn' }, { code: 'mr', name: 'Marathi', glyph: 'म', lang: 'mr' },
    { code: 'ta', name: 'Tamil', glyph: 'த', lang: 'ta' }, { code: 'te', name: 'Telugu', glyph: 'తె', lang: 'te' },
    { code: 'bn', name: 'Bengali', glyph: 'ব', lang: 'bn' }, { code: 'gu', name: 'Gujarati', glyph: 'ગ', lang: 'gu' },
    { code: 'kn', name: 'Kannada', glyph: 'ಕ', lang: 'kn' }, { code: 'ml', name: 'Malayalam', glyph: 'മ', lang: 'ml' },
    { code: 'pa', name: 'Punjabi', glyph: 'ਪ', lang: 'pa' }, { code: 'or', name: 'Odia', glyph: 'ଓ', lang: 'or' }
  ];
  D.voices = [
    { id: 'vaani', name: 'Vaani', tile: 'Va', languages: ['hi', 'en'], style: 'Warm, measured pace', descriptor: 'Female · warm · Hindi + English', isDefault: true, available: true },
    { id: 'vikash', name: 'Vikash', tile: 'Vi', languages: ['hi', 'en'], style: 'Calm, clear', descriptor: 'Male · calm · Hindi + English', available: true },
    { id: 'meenakshi', name: 'Meenakshi', tile: 'Me', languages: ['ta', 'en'], style: 'Bright, friendly', descriptor: 'Female · bright · Tamil + English', available: false, unavailableReason: 'Not available: this flow speaks Hindi and English' }
  ];

  /* ---------- flows (04-flow-designer). One full graph: Site-visit qualifier, Live v7 + Draft v8 (3 changes). ---------- */
  var SITE = {
    id: 'flow_7c21', shortId: 'flow_7c21', name: 'Site-visit qualifier', language: 'Auto · Hindi + English', voice: 'vaani',
    live: { version: 7, since: ist(15, '15:40'), publishedBy: 'Rohit S.', usedBy: ['Inbound +91 80 •••• 2210', "Batch · 'Weekend follow-ups'"], tested: { at: ist(0, '11:02'), by: 'Anika R.' } },
    draft: { version: 8, changes: 3, editedAt: ist(0, '11:24'), editors: ['Anika R.'], saveState: 'saved', savedAt: ist(0, '11:24') },
    stepCount: 9, editedAt: ist(0, '11:24'), status: 'live', usedFor: 'inbound+outbound',
    phases: { trigger: 2, logic: 1, action: 2, outcome: 4 },
    validation: { errors: 0, warnings: 1, issues: [{ level: 'warning', stepId: 'n4', rule: 'template_pending', text: 'Book site visit: template "visit_confirm" is pending approval.' }] },
    nodes: [
      { id: 'n1', no: 1, phase: 'trigger', type: 'Outbound batch', glyph: 'list', title: 'Outbound batch', summary: 'Calls leads in batches you schedule', meta: "Leads · 'Weekend follow-ups'", x: 0, y: 0, outputs: [{ id: 'out', target: 'n3' }] },
      { id: 'n2', no: 2, phase: 'trigger', type: 'Inbound call', glyph: 'phone-incoming', title: 'Inbound call', summary: 'Answers +91 80 •••• 2210', meta: 'Every inbound call', x: 0, y: 176, outputs: [{ id: 'out', target: 'n3' }] },
      { id: 'n3', no: 3, phase: 'logic', type: 'Question', glyph: 'diamond', title: 'Ask about a site visit', lang: 'hi-Latn',
        prompt: 'Aapne metro ke paas 2 BHK ke baare mein poocha tha. Kya aap is hafte site visit karna chahenge?',
        answers: [
          { id: 'yes', label: 'Yes', examples: 'haan, zaroor · हाँ', target: 'n4' },
          { id: 'later', label: 'Later', examples: 'baad mein · kal', target: 'n7' },
          { id: 'no', label: 'No', examples: 'nahi · नहीं', target: 'n5' },
          { id: 'noreply', label: 'No reply', examples: 'after 6 s', fallback: true, target: 'n9' }],
        x: 336, y: 40 },
      { id: 'n4', no: 4, phase: 'action', type: 'Book meeting', glyph: 'calendar-plus', title: 'Book site visit', summary: 'Books a slot and sends "visit_confirm" on WhatsApp', warning: 'Template "visit_confirm" is pending approval',
        results: [{ id: 'booked', label: 'Booked', target: 'n6' }, { id: 'notbooked', label: 'Not booked', target: 'n7' }], x: 720, y: 0 },
      { id: 'n5', no: 5, phase: 'action', type: 'Speak', glyph: 'message-square', title: 'Polite close', summary: 'Koi baat nahi. Dhanyavaad, aapka din shubh ho.', lang: 'hi-Latn', outputs: [{ id: 'out', target: 'n8' }], x: 720, y: 232 },
      { id: 'n6', no: 6, phase: 'outcome', type: 'End with outcome', glyph: 'flag', title: 'Visit booked', writes: { status: 'converted', label: 'Converted', tone: 'success' }, x: 1088, y: 0 },
      { id: 'n7', no: 7, phase: 'outcome', type: 'End with outcome', glyph: 'flag', title: 'Callback set', writes: { status: 'callback_due', label: 'Callback due', tone: 'warning' }, x: 1088, y: 120 },
      { id: 'n8', no: 8, phase: 'outcome', type: 'End with outcome', glyph: 'flag', title: 'Not interested', writes: { status: 'not_interested', label: 'Not interested', tone: 'neutral' }, x: 1088, y: 240 },
      { id: 'n9', no: 9, phase: 'outcome', type: 'End with outcome', glyph: 'flag', title: 'No answer', writes: { status: 'not_reached', label: 'Not reached', tone: 'neutral' }, x: 1088, y: 360 }
    ],
    edges: [
      { id: 'e1', from: 'n1', port: 'out', to: 'n3' }, { id: 'e2', from: 'n2', port: 'out', to: 'n3' },
      { id: 'e3', from: 'n3', port: 'yes', to: 'n4', label: 'Yes' }, { id: 'e4', from: 'n3', port: 'later', to: 'n7', label: 'Later' },
      { id: 'e5', from: 'n3', port: 'no', to: 'n5', label: 'No' }, { id: 'e6', from: 'n3', port: 'noreply', to: 'n9', label: 'No reply', fallback: true },
      { id: 'e7', from: 'n4', port: 'booked', to: 'n6', label: 'Booked' }, { id: 'e8', from: 'n4', port: 'notbooked', to: 'n7', label: 'Not booked' },
      { id: 'e9', from: 'n5', port: 'out', to: 'n8' }
    ],
    diff: [
      { stepId: 'n3', kind: 'changed', text: 'Ask about a site visit: question now offers "this weekend"' },
      { stepId: 'n4', kind: 'changed', text: 'Book site visit: slots are Saturday and Sunday only' },
      { stepId: 'n5', kind: 'changed', text: 'Polite close: shorter goodbye' }
    ],
    versions: [
      { version: 8, kind: 'draft', at: ist(0, '11:24'), by: 'Anika R.', note: '3 changes' },
      { version: 7, kind: 'live', at: ist(15, '15:40'), by: 'Rohit S.', note: 'Weekend slots' },
      { version: 6, at: ist(21, '12:05'), by: 'Rohit S.', note: 'Hindi greeting' },
      { version: 5, at: ist(24, '17:30'), by: 'Anika R.', note: 'Added callback path' }
    ],
    frames: [{ id: 'f1', title: 'Qualification', tint: 'neel', nodes: ['n3', 'n4'] }]
  };
  function f(id, name, status, extra) { var o = { id: id, shortId: id, name: name, status: status, stepCount: 6, editedAt: ist(9, '14:00'), language: 'Auto · Hindi + English', voice: 'vaani' }; for (var k in extra) o[k] = extra[k]; return o; }
  D.flows = [SITE,
    f('flow_3b90', 'Home-loan follow-up', 'live', { live: { version: 3, since: ist(20, '11:00'), usedBy: ['Outbound batches'] }, stepCount: 12, editedAt: ist(4, '16:20') }),
    f('flow_9e14', 'Booking amount reminder', 'live', { live: { version: 12, since: ist(6, '10:15'), usedBy: ['Outbound batches'] }, stepCount: 8, editedAt: ist(6, '10:15') }),
    f('flow_c552', 'COD confirmation', 'draft', { stepCount: 7, editedAt: ist(2, '12:40'), draft: { version: 1, changes: 7 } }),
    f('flow_a117', 'Appointment reminder', 'not-published', { stepCount: 5 }),
    f('flow_d0c3', 'Support FAQ', 'not-published', { stepCount: 14, editedAt: ist(11, '11:30') }),
    f('flow_58af', 'Payment link follow-up', 'not-published', { stepCount: 6 }),
    f('flow_27de', 'Feedback survey', 'not-published', { stepCount: 9, editedAt: ist(13, '18:05') }),
    f('flow_e8b1', 'Lead re-engagement', 'not-published', { stepCount: 10 }),
    f('flow_41c9', 'Plot enquiry · Nashik', 'not-published', { stepCount: 11, language: 'Auto · Marathi + Hindi' }),
    f('flow_77f0', 'Rental enquiry', 'not-published', { stepCount: 7 }),
    f('flow_0bd4', 'Walk-in follow-up', 'not-published', { stepCount: 6 }),
    f('flow_6a3e', 'Channel partner intro', 'not-published', { stepCount: 8 }),
    f('flow_f219', 'Festive offer callback', 'not-published', { stepCount: 5, editedAt: ist(1, '19:10') }),
    f('flow_85c7', 'Possession update', 'not-published', { stepCount: 9 }),
    f('flow_12aa', 'Brochure request', 'archived', { stepCount: 4, archived: true })
  ];
  D.templates = [
    { id: 'tpl_qualify', name: 'Lead qualification', desc: 'Checks budget, timeline and interest, then books a callback.', strip: ['Outbound batch', 'Ask budget', 'Book callback', 'Interested'] },
    { id: 'tpl_site', name: 'Site visit', desc: 'Offers a site visit and books a slot.', strip: ['Outbound batch', 'Ask about a site visit', 'Book site visit', 'Visit booked'] },
    { id: 'tpl_emi', name: 'EMI reminder', desc: 'Reminds a customer of a payment and sends a link.', strip: ['Outbound batch', 'Confirm payment date', 'Send WhatsApp', 'Promise to pay'] },
    { id: 'tpl_cod', name: 'COD confirmation', desc: 'Confirms a cash-on-delivery order before dispatch.', strip: ['Outbound batch', 'Confirm order', 'CRM lookup', 'Confirmed'] },
    { id: 'tpl_appt', name: 'Appointment', desc: 'Confirms or reschedules an appointment.', strip: ['Outbound batch', 'Confirm time', 'Book meeting', 'Booked'] },
    { id: 'tpl_faq', name: 'Support FAQ', desc: 'Answers inbound questions from your documents.', strip: ['Inbound call', 'What do you need?', 'Knowledge lookup', 'Resolved'] }
  ];
})(window);

/* ---------- leads (40 loaded rows of 1,284; fictional names; masked phones only) ---------- */
(function (D) {
  'use strict';
  var ist = D._util.ist, r = D._util.rng(1042);
  var NAMES = ['Aarav Mehta', 'Priya Nair', 'Rohan Kulkarni', 'Ananya Iyer', 'Vikram Singh', 'Kavya Reddy', 'Arjun Deshpande', 'Isha Kapoor',
    'Siddharth Rao', 'Neha Sharma', 'Kabir Malhotra', 'Aditya Patil', 'Pooja Menon', 'Rahul Verma', 'Sneha Gupta', 'Karan Bhatia',
    'Diya Chatterjee', 'Varun Pillai', 'Riya Saxena', 'Nikhil Jain', 'Tanvi Shetty', 'Harsh Agarwal', 'Aditi Banerjee', 'Manish Yadav',
    'Shreya Das', 'Yash Thakur', 'Nandini Krishnan', 'Omkar Pawar', 'Zoya Siddiqui', 'Gurpreet Kaur', 'Imran Shaikh', 'Lakshmi Subramanian',
    'Deepak Chauhan', 'Anjali Mishra', 'Sameer Qureshi', 'Bhavna Trivedi', 'Tushar Bose', 'Ritika Arora', 'Prakash Hegde', 'Mehul Parekh'];
  var CITIES = ['Pune', 'Mumbai', 'Thane', 'Navi Mumbai', 'Bengaluru', 'Hyderabad', 'Nashik', 'Chennai', 'Ahmedabad', 'Kochi', 'Indore', 'Nagpur'];
  var STATUS = ['interested', 'callback_due', 'new', 'not_reached', 'interested', 'contacted', 'callback_due', 'new', 'not_interested', 'interested',
    'converted', 'new', 'not_reached', 'callback_due', 'contacted', 'interested', 'new', 'not_reached', 'callback_due', 'interested',
    'contacted', 'new', 'not_interested', 'interested', 'not_reached', 'callback_due', 'new', 'converted', 'interested', 'not_reached',
    'contacted', 'new', 'not_interested', 'do_not_call', 'callback_due', 'contacted', 'new', 'not_reached', 'not_interested', 'contacted'];
  var LANGS = ['hi', 'hi-Latn', 'en', 'hi', 'hi-Latn', 'en', 'mr', 'hi-Latn', 'hi', 'en', 'ta', 'hi-Latn'];
  var SOURCES = ['Website form', 'Facebook ad', 'Property portal', 'Walk-in', 'Referral', 'CSV import'];
  var UNITS = ['1 BHK', '2 BHK', '2 BHK', '3 BHK', '2 BHK', '3 BHK'];
  var BUDGETS = ['₹45 L to ₹60 L', '₹60 L to ₹85 L', '₹85 L to ₹1 Cr', '₹1 Cr to ₹1.4 Cr', '₹70 L to ₹90 L'];
  var OWNERS = ['Anika R.', 'Rohit S.', 'Dev M.', 'Farah K.', 'Kiran P.'];
  var OUTCOME = { interested: 'Interested', callback_due: 'Call later', not_reached: 'No answer', contacted: 'Talked', not_interested: 'Not interested', converted: 'Visit booked', do_not_call: 'Asked not to call' };
  var flows = ['flow_7c21', 'flow_7c21', 'flow_7c21', 'flow_3b90', 'flow_7c21', 'flow_9e14'];
  D.leads = NAMES.map(function (name, i) {
    var no = 1042 + i * 7 + (i % 3);
    var last4 = String(1000 + Math.floor(r() * 8999));
    var st = STATUS[i];
    var daysAgo = st === 'new' ? null : Math.floor(r() * 9);
    var hh = 10 + Math.floor(r() * 8), mm = Math.floor(r() * 12) * 5;
    if (daysAgo === 0) hh = 10;   /* nothing today is later than now (11:24 am) */
    var interest = st === 'new' ? null : st === 'converted' ? 92 : st === 'interested' ? 70 + Math.floor(r() * 25) : st === 'not_interested' || st === 'do_not_call' ? 5 + Math.floor(r() * 20) : 30 + Math.floor(r() * 35);
    var first = name.split(' ')[0];
    return {
      id: 'lead_' + no, no: no, name: name, first: first, initials: name.split(' ').map(function (p) { return p[0]; }).join(''),
      city: CITIES[i % CITIES.length], phone: { masked: '+91 •••••• ' + last4, short: '•••• ' + last4, last4: last4 },
      status: st, interest: interest, language: LANGS[i % LANGS.length], flowId: flows[i % flows.length],
      owner: OWNERS[i % OWNERS.length], source: SOURCES[i % SOURCES.length], unit: UNITS[i % UNITS.length], budget: BUDGETS[i % BUDGETS.length],
      createdAt: ist(10 + (i % 17), '1' + (i % 8) + ':15'),
      lastCall: daysAgo == null ? null : { outcome: OUTCOME[st], at: ist(daysAgo, D._util.pad(hh) + ':' + D._util.pad(mm)), result: st === 'not_reached' ? 'no_answer' : 'completed' },
      callbackAt: st === 'callback_due' ? ist(0, (15 + (i % 4)) + ':00') : null,
      dnd: st === 'do_not_call', consent: st !== 'do_not_call',
      notes: i % 4 === 0 ? [{ by: OWNERS[(i + 1) % OWNERS.length], at: ist(2, '12:30'), text: 'Prefers a call after 6 pm. Asked about parking and possession date.' }] : []
    };
  });
  /* Lead 1042 is the running example across the spec ("Lead 1042", "+91 •••••• 4821"). */
  D.leads[0].phone = { masked: '+91 •••••• 4821', short: '•••• 4821', last4: '4821' };
  D.leads[0].lastCall = { outcome: 'Visit booked', at: ist(0, '10:42'), result: 'completed' };
  D.leads[0].status = 'interested'; D.leads[0].interest = 82; D.leads[0].language = 'hi';
  D.leads[1].phone = { masked: '+91 •••••• 3307', short: '•••• 3307', last4: '3307' };
  D.leadFields = [
    { id: 'name', label: 'Lead', priority: 1 }, { id: 'phone', label: 'Phone', priority: 2 }, { id: 'status', label: 'Status', priority: 1 },
    { id: 'lastCall', label: 'Last call', priority: 1 }, { id: 'interest', label: 'Interest', priority: 2, align: 'end' },
    { id: 'language', label: 'Language', priority: 3 }, { id: 'flow', label: 'Flow', priority: 3 }, { id: 'owner', label: 'Owner', priority: 4 },
    { id: 'source', label: 'Source', priority: 4 }, { id: 'createdAt', label: 'Created', priority: 4 }
  ];
  D.leadViews = [
    { id: 'all', label: 'All', count: 1284 }, { id: 'new', label: 'New', count: 312 }, { id: 'callbacks', label: 'Callbacks due', count: 18 },
    { id: 'interested', label: 'Interested', count: 96 }, { id: 'not-reached', label: 'Not reached', count: 211 }
  ];
})(window.VAANI_DATA);

/* ---------- calls (60 loaded of 121) with per-turn transcripts in Hindi (Devanagari), Hinglish (hi-Latn) and English ---------- */
(function (D) {
  'use strict';
  var ist = D._util.ist, pad = D._util.pad, r = D._util.rng(707);
  /* Turn scripts. Each line: [speaker, key]; text per language style. {first} {unit} fill in per lead. */
  var T = {
    greet: { hi: 'नमस्ते {first} जी, मैं Sample Realty से वाणी बोल रही हूँ। क्या अभी दो मिनट बात हो सकती है?', 'hi-Latn': 'Namaste {first} ji, main Sample Realty se Vaani bol rahi hoon. Kya abhi do minute baat ho sakti hai?', en: 'Hello {first}, this is Vaani calling from Sample Realty. Is this a good time to talk for two minutes?' },
    ok: { hi: 'हाँ जी, बोलिए।', 'hi-Latn': 'Haan ji, boliye.', en: 'Yes, go ahead.' },
    ask: { hi: 'आपने मेट्रो के पास {unit} के बारे में पूछा था। क्या आप इस हफ़्ते साइट विज़िट करना चाहेंगे?', 'hi-Latn': 'Aapne metro ke paas {unit} ke baare mein poocha tha. Kya aap is hafte site visit karna chahenge?', en: 'You had asked about a {unit} near the metro. Would you like to visit the site this week?' },
    yes: { hi: 'हाँ, शनिवार सुबह ठीक रहेगा।', 'hi-Latn': 'Haan, Saturday ho sakta hai, but morning mein.', en: 'Yes, Saturday morning works for me.' },
    booked: { hi: 'बहुत बढ़िया। मैंने शनिवार सुबह 11 बजे का स्लॉट बुक कर दिया है। कन्फ़र्मेशन WhatsApp पर आ जाएगा।', 'hi-Latn': 'Bahut badhiya. Maine Saturday 11 baje ka slot book kar diya hai. Confirmation WhatsApp par aa jayega.', en: "Great. I’ve booked Saturday at 11 am. You’ll get a confirmation on WhatsApp." },
    later: { hi: 'अभी थोड़ा व्यस्त हूँ, कल शाम को फ़ोन कीजिए।', 'hi-Latn': 'Abhi thoda busy hoon, kal shaam ko call kijiye.', en: "I’m driving right now. Can you call me tomorrow evening?" },
    callback: { hi: 'ज़रूर। मैं कल शाम 6 बजे फ़ोन करूँगी।', 'hi-Latn': 'Zaroor. Main kal shaam 6 baje call karungi.', en: "Sure. I’ll call you tomorrow at 6 pm." },
    price: { hi: '2 BHK का प्राइस क्या है? बजट 85 लाख तक है।', 'hi-Latn': 'Price kya hai 2 BHK ka? Budget 85 lakh tak hai.', en: "What’s the price for the 2 BHK? My budget is up to 85 lakh." },
    priceAns: { hi: '2 BHK 78 लाख से शुरू होते हैं, पार्किंग के साथ। क्या मैं आपको ब्रोशर WhatsApp कर दूँ?', 'hi-Latn': '2 BHK 78 lakh se shuru hote hain, parking ke saath. Kya main aapko brochure WhatsApp kar doon?', en: 'The 2 BHK starts at 78 lakh, with parking. Shall I send you the brochure on WhatsApp?' },
    send: { hi: 'हाँ, भेज दीजिए।', 'hi-Latn': 'Haan, bhej dijiye.', en: 'Yes, please send it.' },
    no: { hi: 'नहीं, हमने पहले ही फ़्लैट ले लिया है।', 'hi-Latn': 'Nahi, humne already flat le liya hai.', en: "No thanks, we’ve already bought a flat." },
    close: { hi: 'कोई बात नहीं। धन्यवाद, आपका दिन शुभ हो।', 'hi-Latn': 'Koi baat nahi. Dhanyavaad, aapka din shubh ho.', en: 'No problem. Thank you, have a good day.' },
    loan: { hi: 'मुझे होम लोन के बारे में किसी से बात करनी है।', 'hi-Latn': 'Mujhe home loan ke baare mein kisi se baat karni hai.', en: "I’d like to speak to someone about the home loan." },
    transfer: { hi: 'मैं आपको हमारे लोन एडवाइज़र से जोड़ रही हूँ। एक मिनट।', 'hi-Latn': 'Main aapko hamare loan advisor se jod rahi hoon. Ek minute.', en: "I’m connecting you to our loan advisor. One moment." },
    vm: { hi: 'नमस्ते, Sample Realty से वाणी। साइट विज़िट के लिए फ़ोन किया था। हम कल फिर फ़ोन करेंगे।', 'hi-Latn': 'Namaste, Sample Realty se Vaani. Site visit ke liye call kiya tha. Hum kal phir call karenge.', en: "Hello, this is Vaani from Sample Realty about your site visit. We’ll call again tomorrow." }
  };
  var STEP = { greet: 'Greeting', ask: 'Ask about a site visit', booked: 'Book site visit', callback: 'Callback set', priceAns: 'Ask about a site visit', close: 'Polite close', transfer: 'Transfer to a person', vm: 'Greeting' };
  var SCRIPTS = {
    'Visit booked': [['a', 'greet'], ['c', 'ok'], ['a', 'ask'], ['c', 'yes'], ['s', 'Moved to step 4 · Book site visit'], ['a', 'booked'], ['s', 'Outcome · Visit booked']],
    'Callback': [['a', 'greet'], ['c', 'later'], ['a', 'callback'], ['s', 'Callback set for Tomorrow 6:00 pm']],
    'Interested': [['a', 'greet'], ['c', 'ok'], ['a', 'ask'], ['c', 'price'], ['s', 'Knowledge lookup · price-sheet.pdf · 2 passages'], ['a', 'priceAns'], ['c', 'send']],
    'Not interested': [['a', 'greet'], ['c', 'ok'], ['a', 'ask'], ['c', 'no'], ['a', 'close'], ['s', 'Outcome · Not interested']],
    'Transferred': [['a', 'greet'], ['c', 'ok'], ['a', 'ask'], ['c', 'loan'], ['a', 'transfer'], ['s', 'Transferred to a person']],
    'Voicemail': [['a', 'vm']]
  };
  var PLAN = [ // [result, outcome, sentiment, count]
    ['completed', 'Visit booked', 'positive', 12], ['completed', 'Callback', 'neutral', 10], ['completed', 'Interested', 'positive', 6],
    ['completed', 'Not interested', 'negative', 5], ['completed', 'Not interested', 'neutral', 3], ['completed', 'Transferred', 'mixed', 3],
    ['no_answer', 'No answer', 'unscored', 10], ['busy', 'Busy', 'unscored', 3], ['voicemail', 'Voicemail', 'unscored', 3],
    ['failed', 'Failed', 'unscored', 2], ['completed', 'Test call', 'neutral', 3]];
  var list = [];
  PLAN.forEach(function (p) { for (var i = 0; i < p[3]; i++) list.push(p); });
  // deterministic shuffle
  for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; }
  var flowsFor = [['flow_7c21', 'Site-visit qualifier', 7], ['flow_7c21', 'Site-visit qualifier', 7], ['flow_7c21', 'Site-visit qualifier', 7], ['flow_3b90', 'Home-loan follow-up', 3], ['flow_7c21', 'Site-visit qualifier', 6], ['flow_9e14', 'Booking amount reminder', 12]];
  var CAPTURE = {
    'Visit booked': [['Budget', '₹85 L to ₹1 Cr'], ['Preferred day', 'Saturday, morning'], ['Site visit', 'Booked · Sat 3 Oct, 11:00 am']],
    'Callback': [['Budget', null], ['Preferred day', 'Tomorrow evening'], ['Site visit', null]],
    'Interested': [['Budget', 'Up to ₹85 L'], ['Preferred day', null], ['Site visit', null]],
    'Not interested': [['Budget', null], ['Preferred day', null], ['Site visit', 'Declined']],
    'Transferred': [['Budget', null], ['Preferred day', null], ['Site visit', null]]
  };
  var SUMMARY = {
    'Visit booked': '{first} wants to see the {unit} near the metro and booked a site visit for Saturday at 11 am. Asked about parking.',
    'Callback': '{first} was busy and asked for a call tomorrow evening. No details captured yet.',
    'Interested': '{first} asked about the {unit} price and has a budget up to ₹85 L. The brochure was sent on WhatsApp.',
    'Not interested': '{first} has already bought a flat and is not looking.',
    'Transferred': '{first} wanted to discuss a home loan and was transferred to the loan advisor.',
    'Voicemail': 'Reached voicemail. The agent left a short message.',
    'Test call': 'Test call on the draft. Greeting and site-visit question played in Hindi and English.'
  };
  function fill(s, lead) { return s.replace(/\{first\}/g, lead.first).replace(/\{unit\}/g, lead.unit); }
  var leads = D.leads, pos = 0;
  D.calls = list.map(function (p, n) {
    var lead = leads[(n * 7 + 3) % leads.length];
    var daysAgo = n < 6 ? 0 : Math.min(6, 1 + Math.floor((n - 6) / 9));
    var hh = daysAgo === 0 ? 10 + Math.floor(n / 4) : 10 + Math.floor(r() * 9), mm = daysAgo === 0 ? (n * 13) % 60 : Math.floor(r() * 60);
    if (daysAgo === 0 && hh === 11 && mm > 20) mm = 20;
    var result = p[0], outcome = p[1], sentiment = p[2], isTest = outcome === 'Test call';
    var style = isTest ? 'hi-Latn' : (lead.language === 'hi' ? 'hi' : lead.language === 'en' || lead.language === 'ta' ? 'en' : 'hi-Latn');
    var dur = result === 'completed' ? 55 + Math.floor(r() * 190) : result === 'voicemail' ? 24 + Math.floor(r() * 10) : result === 'failed' ? 18 : 0;
    var fl = flowsFor[n % flowsFor.length];
    var script = SCRIPTS[isTest ? 'Interested' : outcome] || (result === 'voicemail' ? SCRIPTS.Voicemail : []);
    var turns = [], tsec = 2, perTurn = n % 5 !== 4;
    script.forEach(function (line, k) {
      var sp = line[0], key = line[1];
      if (sp === 's') { turns.push({ id: 't' + k, speaker: 'system', text: key, startMs: tsec * 1000 }); return; }
      var txt = T[key] ? fill(T[key][style], lead) : key;
      var turnLang = style === 'hi' && sp === 'a' && key === 'booked' ? 'hi' : style;
      turns.push({ id: 't' + k, speaker: sp === 'a' ? 'agent' : 'caller', name: sp === 'a' ? 'Vaani' : 'Caller', startMs: tsec * 1000,
        endMs: (tsec + 4 + Math.floor(txt.length / 18)) * 1000, text: txt, lang: perTurn ? turnLang : undefined, final: true,
        step: sp === 'a' && STEP[key] ? { label: STEP[key], href: 'flow-designer.html?node=' + (key === 'ask' || key === 'priceAns' ? 'n3' : key === 'booked' ? 'n4' : key === 'close' ? 'n5' : 'n1') } : undefined,
        source: key === 'priceAns' ? { kind: 'knowledge', label: 'Knowledge · price-sheet.pdf' } : undefined });
      tsec += 5 + Math.floor(txt.length / 14) + Math.floor(r() * 3);
    });
    if (result === 'completed' && tsec < dur) { /* keep the transcript within the call */ } else if (result === 'completed') { dur = tsec + 6; }
    var id = 'call_' + (0x7c21e0 + n * 4099).toString(16).slice(-6);
    var cap = (CAPTURE[outcome] || []).map(function (c) { return { key: c[0], value: c[1] }; });
    return {
      id: id, leadId: lead.id, leadName: lead.name, phone: lead.phone, at: ist(daysAgo, pad(hh) + ':' + pad(mm)),
      direction: n % 6 === 5 ? 'inbound' : 'outbound', kind: isTest ? 'test' : 'real', test: isTest, legs: isTest ? 2 : 1,
      durationSec: dur, result: result, outcome: outcome, sentiment: sentiment,
      flow: { id: fl[0], name: fl[1], version: isTest ? 8 : fl[2], draft: isTest },
      languages: style === 'en' ? ['en'] : style === 'hi' ? ['hi', 'en'] : ['hi-Latn'], perTurnLanguage: perTurn && turns.length > 0,
      cost: Math.round(dur * 0.04 * 100) / 100, recording: { available: result === 'completed' && !isTest, disclosedAtSec: 1, offReason: isTest ? 'Recording is off for browser tests.' : null },
      captured: cap, summary: SUMMARY[outcome] ? fill(SUMMARY[outcome], lead) : null,
      topics: outcome === 'Visit booked' ? ['Site visit', 'Parking'] : outcome === 'Interested' ? ['Price', 'Brochure'] : outcome === 'Transferred' ? ['Home loan'] : [],
      reviewed: n % 9 === 0, needsReview: (sentiment === 'negative' && dur > 150) || outcome === 'Transferred' ? true : false,
      failReason: result === 'failed' ? 'Call dropped after 00:18' : null, turns: turns
    };
  }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  /* One record everywhere for the running example, Priya Nair (lead_1050; R2C-05, R2D-10): her last call was yesterday at 1:20 pm,
     1m 0s on Site-visit qualifier v7, and she asked for a callback at 6 pm that is now overdue. Leads, Cockpit (Lead details,
     Previous calls, the gate) and Call reports all read this one call. */
  (function () {
    var pr = leads[1]; if (!pr) return;
    var mine = D.calls.filter(function (c) { return c.leadId === pr.id && !c.test; })[0];
    if (mine) {
      mine.at = ist(1, '13:20'); mine.durationSec = 60; mine.result = 'completed'; mine.outcome = 'Callback'; mine.sentiment = 'neutral';
      mine.flow = { id: 'flow_7c21', name: 'Site-visit qualifier', version: 7, draft: false }; mine.cost = 2.4;
      mine.summary = pr.first + ' was busy and asked for a call back at 6 pm. No details captured yet.';
      mine.captured = [{ key: 'Budget', value: null }, { key: 'Preferred day', value: 'Today evening' }, { key: 'Site visit', value: null }];
      mine.turns = mine.turns.filter(function (t) { return t.startMs < 60000; });
      D.calls.sort(function (a, b) { return a.at < b.at ? 1 : -1; });
    }
    pr.lastCall = { outcome: 'Call later', at: ist(1, '13:20'), result: 'completed', durationSec: 60, callId: mine ? mine.id : null };
    pr.callbackAt = ist(1, '18:00');
  })();
  /* Live now (Cockpit): the focal call and one ringing; the batch in Up next. Timers are computed from startedAt. */
  var L0 = leads[0], L1 = leads[5];
  D.live = [
    { id: 'call_live01', leadId: L0.id, leadName: L0.name, phone: L0.phone, state: 'live', direction: 'outbound', startedAt: '2026-09-27T11:21:46+05:30', stateTimes: { dialling: 0, ringing: 3, live: 9 },
      flow: { id: 'flow_7c21', name: 'Site-visit qualifier', version: 7 }, voice: 'vaani', language: 'Auto · Hindi + English', lineQuality: { level: 'good', rttMs: 180 },
      step: { label: 'Ask about a site visit', no: 3, of: 8 }, costSoFar: 5.36, talk: { agentPct: 58, callerPct: 42, interruptions: 1 },
      captured: [{ key: 'Budget', value: '₹85 L to ₹1 Cr' }, { key: 'Preferred day', value: 'Saturday, morning' }, { key: 'Site visit', value: null, pending: true }],
      turns: [
        { id: 'l1', speaker: 'agent', name: 'Vaani', startMs: 9000, text: 'नमस्ते आरव जी, मैं Sample Realty से वाणी बोल रही हूँ। क्या अभी दो मिनट बात हो सकती है?', lang: 'hi', final: true, step: { label: 'Greeting', href: 'flow-designer.html?node=n1' } },
        { id: 'l2', speaker: 'caller', name: 'Caller', startMs: 17000, text: 'हाँ जी, बोलिए।', lang: 'hi', final: true },
        { id: 'l3', speaker: 'agent', name: 'Vaani', startMs: 21000, text: 'You had asked about a 2 BHK near the metro. Would you like to visit the site this week?', lang: 'en', final: true, step: { label: 'Ask about a site visit', href: 'flow-designer.html?node=n3' }, source: { kind: 'knowledge', label: 'Knowledge · price-sheet.pdf' } },
        { id: 'l4', speaker: 'system', startMs: 30000, text: 'Knowledge lookup · price-sheet.pdf · 2 passages' },
        { id: 'l5', speaker: 'caller', name: 'Caller', startMs: 132000, text: 'Haan, Saturday morning theek rahega', lang: 'hi-Latn', final: false }
      ] },
    { id: 'call_live02', leadId: L1.id, leadName: L1.name, phone: L1.phone, state: 'ringing', direction: 'outbound', startedAt: '2026-09-27T11:23:52+05:30', stateTimes: { dialling: 0, ringing: 4 },
      flow: { id: 'flow_7c21', name: 'Site-visit qualifier', version: 7 }, voice: 'vaani' }
  ];
  D.upNext = [{ id: 'batch_weekend', name: 'Weekend follow-ups', state: 'running', placed: 12, total: 40, flow: 'Site-visit qualifier v7', startedAt: '2026-09-27T10:30:00+05:30' },
    { id: 'batch_loan', name: 'Home-loan callbacks', state: 'scheduled', total: 18, at: '2026-09-27T16:00:00+05:30', flow: 'Home-loan follow-up v3' }];
})(window.VAANI_DATA);

/* ---------- knowledge, billing, meetings, personal agents, assistant, settings, activity ---------- */
(function (D) {
  'use strict';
  var ist = D._util.ist;
  D.knowledge = [
    { id: 'kb_01', name: 'price-sheet.pdf', type: 'PDF', size: 2457600, status: 'indexed', passages: 42, updatedAt: ist(0, '09:12'), by: 'Anika R.', usedBy: ['Site-visit qualifier'] },
    { id: 'kb_02', name: 'site-plan-brochure.pdf', type: 'PDF', size: 7864320, status: 'indexed', passages: 96, updatedAt: ist(3, '16:40'), by: 'Rohit S.', usedBy: ['Site-visit qualifier', 'Support FAQ'] },
    { id: 'kb_03', name: 'home-loan-faq.docx', type: 'DOCX', size: 409600, status: 'indexed', passages: 58, updatedAt: ist(6, '11:05'), by: 'Farah K.', usedBy: ['Home-loan follow-up'] },
    { id: 'kb_04', name: 'payment-plans.csv', type: 'CSV', size: 20480, status: 'indexed', passages: 12, updatedAt: ist(6, '11:08'), by: 'Farah K.', usedBy: ['Booking amount reminder'] },
    { id: 'kb_05', name: 'amenities-list.txt', type: 'TXT', size: 6144, status: 'indexed', passages: 9, updatedAt: ist(8, '13:30'), by: 'Dev M.', usedBy: [] },
    { id: 'kb_06', name: 'rera-registration.pdf', type: 'PDF', size: 1153434, status: 'indexed', passages: 21, updatedAt: ist(9, '10:20'), by: 'Rohit S.', usedBy: ['Support FAQ'] },
    { id: 'kb_07', name: 'possession-timeline.pdf', type: 'PDF', size: 870400, status: 'indexing', progress: 60, updatedAt: ist(0, '11:18'), by: 'Anika R.', usedBy: [] },
    { id: 'kb_08', name: 'cancellation-policy.pdf', type: 'PDF', size: 512000, status: 'indexed', passages: 17, updatedAt: ist(12, '15:00'), by: 'Rohit S.', usedBy: ['Support FAQ'] },
    { id: 'kb_09', name: 'parking-allotment.docx', type: 'DOCX', size: 245760, status: 'failed', error: "Couldn’t index · the file is password-protected", updatedAt: ist(1, '18:22'), by: 'Kiran P.', usedBy: [] },
    { id: 'kb_10', name: 'nashik-plots-rates.csv', type: 'CSV', size: 34816, status: 'indexed', passages: 30, updatedAt: ist(14, '12:44'), by: 'Dev M.', usedBy: ['Plot enquiry · Nashik'] },
    { id: 'kb_11', name: 'channel-partner-terms.pdf', type: 'PDF', size: 690176, status: 'indexed', passages: 26, updatedAt: ist(16, '17:10'), by: 'Anika R.', usedBy: [] },
    { id: 'kb_12', name: 'rental-listings.csv', type: 'CSV', size: 51200, status: 'indexed', passages: 44, updatedAt: ist(18, '10:55'), by: 'Farah K.', usedBy: ['Rental enquiry'] },
    { id: 'kb_13', name: 'festive-offer-2026.pdf', type: 'PDF', size: 1363148, status: 'indexed', passages: 11, updatedAt: ist(2, '19:02'), by: 'Anika R.', usedBy: ['Festive offer callback'] },
    { id: 'kb_14', name: 'site-visit-checklist.txt', type: 'TXT', size: 3072, status: 'queued', updatedAt: ist(0, '11:22'), by: 'Anika R.', usedBy: [] }
  ];
  D.proposals = [
    { id: 'kp_1', status: 'pending', question: 'Is there a clubhouse fee?', answer: 'Clubhouse membership is included for the first two years.', source: 'Call with Priya Nair · 26 Sep', at: ist(1, '15:20') },
    { id: 'kp_2', status: 'pending', question: 'Do you allow pets?', answer: 'Pets are allowed in all towers; no breed restrictions.', source: 'Call with Vikram Singh · 25 Sep', at: ist(2, '12:02') },
    { id: 'kp_3', status: 'pending', question: 'When is possession for Tower B?', answer: 'Tower B possession is planned for March 2027.', source: 'Call with Kavya Reddy · 24 Sep', at: ist(3, '17:45') }
  ];

  /* Billing: ledger (wallet), invoices (GST 18 %), daily usage (calls, not legs; tests separate), plans. */
  D.transactions = [
    { id: 'txn_9f31', at: ist(0, '11:00'), kind: 'debit', label: 'Calls · 14 calls', amount: -36.80, balanceAfter: 2340.50 },
    { id: 'txn_9f2c', at: ist(1, '23:59'), kind: 'debit', label: 'Calls · 38 calls', amount: -92.40, balanceAfter: 2377.30 },
    { id: 'txn_9f1a', at: ist(2, '23:59'), kind: 'debit', label: 'Calls · 41 calls', amount: -104.16, balanceAfter: 2469.70 },
    { id: 'txn_9e77', at: ist(7, '14:12'), kind: 'topup', label: 'Top up · UPI', method: 'UPI · a•••••@okbank', amount: 2000, balanceAfter: 2573.86, status: 'completed', invoice: 'INV-2026-0920' },
    { id: 'txn_9e40', at: ist(8, '23:59'), kind: 'debit', label: 'Calls · 29 calls', amount: -71.28, balanceAfter: 573.86 },
    { id: 'txn_9d02', at: ist(10, '10:41'), kind: 'topup', label: 'Top up · UPI', method: 'UPI · a•••••@okbank', amount: 500, balanceAfter: 645.14, status: 'failed', reason: 'UPI payment was declined by the bank. You were not charged.' },
    { id: 'txn_9c88', at: ist(15, '16:05'), kind: 'topup', label: 'Top up · UPI', method: 'UPI · r•••••@okbank', amount: 1000, balanceAfter: 1312.50, status: 'completed', invoice: 'INV-2026-0912' },
    { id: 'txn_9c10', at: ist(17, '12:30'), kind: 'refund', label: 'Refund · duplicate top-up', amount: -500, balanceAfter: 312.50, status: 'refunded' }
  ];
  D.invoices = [
    { id: 'INV-2026-0920', at: ist(7, '14:12'), description: 'Wallet top-up', credit: 2000, gst: 360, total: 2360, status: 'paid' },
    { id: 'INV-2026-0912', at: ist(15, '16:05'), description: 'Wallet top-up', credit: 1000, gst: 180, total: 1180, status: 'paid' },
    { id: 'INV-2026-0901', at: ist(26, '11:30'), description: 'Wallet top-up', credit: 3000, gst: 540, total: 3540, status: 'paid' },
    { id: 'CN-2026-0910', at: ist(17, '12:30'), description: 'Credit note · duplicate top-up', credit: -500, gst: -90, total: -590, status: 'credit-note' },
    { id: 'INV-2026-0822', at: ist(36, '10:02'), description: 'Wallet top-up', credit: 5000, gst: 900, total: 5900, status: 'paid' },
    { id: 'INV-2026-0806', at: ist(52, '15:47'), description: 'Wallet top-up', credit: 1000, gst: 180, total: 1180, status: 'refunded' }
  ];
  var r = D._util.rng(30);
  D.usage = [];
  for (var d = 29; d >= 0; d--) {
    var calls = d === 0 ? 14 : 18 + Math.floor(r() * 30), connected = Math.round(calls * (0.55 + r() * 0.2)), minutes = Math.round(connected * (1.4 + r() * 1.2));
    D.usage.push({ date: ist(d, '00:00').slice(0, 10), calls: calls, connected: connected, minutes: minutes, spend: Math.round(minutes * 60 * 0.04 * 100) / 100, testCalls: d % 6 === 0 ? 2 : 0 });
  }
  D.plans = [
    { id: 'payg', name: 'Pay as you go', price: 0, period: 'month', rate: 0.04, current: true, features: ['Calls at ₹0.04/s', '1 phone number', '3 teammates', '30 free meeting minutes'] },
    { id: 'starter', name: 'Starter', price: 499, period: 'month', rate: 0.035, features: ['Calls at ₹0.035/s', '2 phone numbers', '10 teammates', '120 free meeting minutes'] },
    { id: 'growth', name: 'Growth', price: 1999, period: 'month', rate: 0.03, features: ['Calls at ₹0.03/s', '5 phone numbers', 'Unlimited teammates', '600 free meeting minutes', 'Priority support'] }
  ];

  /* Meetings (07-meeting-personal-agents §1) and Personal agents (§2) */
  D.meetings = {
    rooms: [
      { id: 'room_1', title: 'Weekly demo', state: 'live', minutes: 12, people: 3, agent: { voice: 'vikash', state: 'in-room', does: 'Presents slides · Q3 pricing.pdf' }, notes: 'on', startedAt: ist(0, '11:12') },
      { id: 'room_2', title: 'Channel partner onboarding', state: 'long-open', openFor: '3 h', people: 0, agent: null, notes: 'off', startedAt: ist(0, '08:20') }
    ],
    past: [
      { id: 'mtg_31', title: 'Sales stand-up', at: ist(1, '10:00'), duration: '18 min', people: 5, notes: 'ready', summary: 'Reviewed 18 callbacks due; moved the Nashik campaign to next week.' },
      { id: 'mtg_30', title: 'Site walk-through prep', at: ist(2, '16:30'), duration: '32 min', people: 3, notes: 'ready', summary: 'Agreed on Saturday slots for Tower A visits.' },
      { id: 'mtg_29', title: 'Home-loan partner call', at: ist(3, '12:00'), duration: '41 min', people: 4, notes: 'writing', summary: null },
      { id: 'mtg_28', title: 'Weekly demo', at: ist(7, '11:00'), duration: '29 min', people: 6, notes: 'failed', summary: null }
    ]
  };
  D.tasks = [
    { id: 'task_1', goal: 'Confirm Saturday site visits with 6 leads', state: 'waiting', autonomy: 'confirm', decision: 'Call 6 leads…', limits: 'Up to 6 calls · about 1 to 2 min each · ₹15 to ₹29', updatedAt: ist(0, '11:05') },
    { id: 'task_2', goal: 'Send payment links to 3 people on WhatsApp', state: 'working', autonomy: 'auto', progress: '1 of 3 sent', updatedAt: ist(0, '11:15') },
    { id: 'task_3', goal: 'Find a caterer for the Diwali open house', state: 'done', autonomy: 'confirm', result: 'Booked Annapurna Caterers for 24 Oct · ₹38,000 quote attached', updatedAt: ist(2, '17:40') }
  ];
  D.assistant = {
    chats: [
      { id: 'chat_1', title: "Plan today’s callbacks", at: ist(0, '10:58'), waiting: true },
      { id: 'chat_2', title: 'Why did calls drop on Thursday?', at: ist(3, '15:22') },
      { id: 'chat_3', title: 'Draft a festive offer flow', at: ist(6, '12:10') }
    ],
    suggestions: ["Plan today’s calls…", 'Summarise yesterday’s calls…', 'Find leads who asked about parking…', 'Draft a flow for EMI reminders…']
  };

  /* Settings (06-settings) */
  D.settings = {
    nav: [
      { group: 'Workspace', items: [{ id: 'profile', label: 'Profile' }, { id: 'organization', label: 'Organization and team' }, { id: 'notifications', label: 'Notifications' }, { id: 'integrations', label: 'Integrations' }] },
      { group: 'Calling', items: [{ id: 'phone', label: 'Phone setup' }] },
      { group: 'Developer', items: [{ id: 'api-keys', label: 'API keys' }, { id: 'webhooks', label: 'Webhooks' }, { id: 'embed', label: 'Embed' }] },
      { group: 'Security', items: [{ id: 'security', label: 'Security' }] },
      { group: 'Data', items: [{ id: 'activity', label: 'Activity' }, { id: 'export', label: 'Export data' }, { id: 'delete', label: 'Delete account', danger: true }] }
    ],
    integrations: [
      { id: 'gcal', name: 'Google Calendar', purpose: 'Book site visits into a shared calendar', state: 'connected', by: 'Rohit S.', at: ist(20, '12:00') },
      { id: 'whatsapp', name: 'WhatsApp Business', purpose: 'Send confirmations and brochures', state: 'attention', note: 'Template "visit_confirm" is pending approval' },
      { id: 'zoho', name: 'Zoho CRM', purpose: 'Sync leads and call outcomes', state: 'not-connected' },
      { id: 'hubspot', name: 'HubSpot', purpose: 'Sync leads and call outcomes', state: 'not-connected' },
      { id: 'calendly', name: 'Calendly', purpose: 'Offer your booking page on calls', state: 'not-connected' }
    ],
    apiKeys: [
      { id: 'key_1', name: 'CRM sync', masked: 'vv_live_••••••••7c21', created: ist(40, '10:00'), lastUsed: ist(0, '11:10'), rateLimit: 60 },
      { id: 'key_2', name: 'Website form', masked: 'vv_live_••••••••a93e', created: ist(90, '15:30'), lastUsed: ist(1, '18:45'), rateLimit: 30 }
    ],
    webhooks: [{ id: 'wh_1', url: 'https://crm.samplerealty.example/hooks/vaani', events: ['call.ended', 'lead.updated'], state: 'healthy', lastDelivery: ist(0, '11:21'), failures24h: 0 }],
    sessions: [
      { id: 's1', device: 'Chrome on Windows', place: 'Pune', current: true, at: ist(0, '11:24') },
      { id: 's2', device: 'Safari on iPhone', place: 'Pune', at: ist(1, '21:10') }
    ],
    notifications: [
      { id: 'wallet', label: 'Wallet low or empty', email: true, whatsapp: true },
      { id: 'autopay', label: 'Autopay failed', email: true, whatsapp: true },
      { id: 'batch', label: 'Batch finished', email: false, whatsapp: false },
      { id: 'callbacks', label: 'Daily digest of callbacks due', email: true, whatsapp: false },
      { id: 'tasks', label: 'A personal-agent task needs you', email: true, whatsapp: true },
      { id: 'number', label: 'Calling number verification changed', email: true, whatsapp: false }
    ]
  };
  D.activity = [
    { id: 'a1', at: ist(0, '11:20'), actor: 'Anika R.', icon: 'square-pen', text: 'edited the draft of Site-visit qualifier' },
    { id: 'a2', at: ist(0, '10:05'), actor: 'Rohit S.', icon: 'log-in', text: 'signed in from Chrome on Windows · Pune' },
    { id: 'a3', at: ist(1, '18:40'), actor: 'Farah K.', icon: 'upload', text: 'imported 212 leads · 6 skipped' },
    { id: 'a4', at: ist(7, '14:12'), actor: 'Anika R.', icon: 'wallet', text: 'topped up ₹2,000' },
    { id: 'a5', at: ist(15, '15:40'), actor: 'Rohit S.', icon: 'workflow', text: 'published Site-visit qualifier v7' },
    { id: 'a6', at: ist(20, '12:00'), actor: 'Rohit S.', icon: 'plug', text: 'connected Google Calendar' }
  ];
})(window.VAANI_DATA);
