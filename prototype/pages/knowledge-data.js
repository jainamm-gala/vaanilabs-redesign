/* Vaani Labs prototype · pages/knowledge-data.js — local, page-owned data for knowledge.html.
   It enriches the shared VAANI_DATA.knowledge records (same ids, so palette links ?file=kb_0X still open the right source)
   with what 03-pages/05 §1 needs and data.js does not carry yet: a display title, the source kind (file · table · web · text ·
   answers), page or row counts, failure reason codes, the flows that use each source, sample passages for the Test panel,
   and the proposals' call context. Everything is fictional (Sample Realty, Pune). Read-only: knowledge.js copies it. */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA || {}, ist = (D._util && D._util.ist) || function () { return D.meta && D.meta.now; };
  var byId = {}; (D.knowledge || []).forEach(function (k) { byId[k.id] = k; });
  function base(id) { return byId[id] || {}; }

  /* Flows that look a source up directly (a Knowledge lookup step pointing at it) and flows whose lookup targets
     "All sources". An all-sources lookup reaches only indexed sources. */
  var FLOW = {
    svq: { id: 'flow_7c21', name: 'Site-visit qualifier', state: 'live', version: 7, node: 'n3', step: 3, stepLabel: 'Ask about a site visit' },
    hlf: { id: 'flow_3b90', name: 'Home-loan follow-up', state: 'live', version: 3, node: 'n3', step: 4, stepLabel: 'Answer loan questions' },
    bar: { id: 'flow_9e14', name: 'Booking amount reminder', state: 'live', version: 12, node: 'n4', step: 4, stepLabel: 'Explain payment plans' },
    faq: { id: 'flow_d0c3', name: 'Support FAQ', state: 'not-published', node: 'n2', step: 2, stepLabel: 'Look up the answer' },
    nsk: { id: 'flow_41c9', name: 'Plot enquiry · Nashik', state: 'not-published', node: 'n3', step: 3, stepLabel: 'Quote plot rates' },
    ren: { id: 'flow_77f0', name: 'Rental enquiry', state: 'not-published', node: 'n3', step: 3, stepLabel: 'Match a listing' },
    fes: { id: 'flow_f219', name: 'Festive offer callback', state: 'not-published', node: 'n2', step: 2, stepLabel: 'Explain the offer' }
  };
  var ALL_SOURCES = [FLOW.hlf, FLOW.faq];

  function src(id, o) {
    var b = base(id), r = {
      id: id, fileName: b.name || o.fileName, size: b.size || o.size || 0, status: o.status || b.status || 'indexed',
      passages: o.passages != null ? o.passages : b.passages, progress: o.progress != null ? o.progress : b.progress,
      updatedAt: b.updatedAt || o.updatedAt, addedAt: o.addedAt || b.updatedAt, by: b.by || o.by || 'Anika R.'
    };
    for (var k in o) if (!(k in r) || r[k] == null) r[k] = o[k];
    r.title = o.title; r.kind = o.kind; r.format = o.format; r.direct = o.direct || [];
    return r;
  }

  var SOURCES = [
    src('kb_01', { title: 'Price sheet (Sep 2026)', kind: 'file', format: 'PDF', pages: 12, passages: 42, languages: ['en'], direct: [FLOW.svq], addedAt: ist(6, '10:02') }),
    src('kb_02', { title: 'Site plan brochure', kind: 'file', format: 'PDF', pages: 36, passages: 148, languages: ['en'], direct: [FLOW.svq, FLOW.faq], addedAt: ist(20, '12:30') }),
    src('kb_03', { title: 'Home loan FAQ', kind: 'file', format: 'DOCX', pages: 9, passages: 58, languages: ['en', 'hi'], direct: [FLOW.hlf], addedAt: ist(40, '15:10') }),
    src('kb_04', { title: 'Payment plans', kind: 'table', format: 'CSV', rows: 12, passages: 12, languages: ['en'], direct: [FLOW.bar], addedAt: ist(40, '15:14') }),
    src('kb_05', { title: 'Project amenities', kind: 'web', format: 'Web page', url: 'https://samplerealty.example/projects/aranya/amenities', fetchedAt: ist(8, '13:30'), passages: 9, languages: ['en'], addedAt: ist(30, '11:00') }),
    src('kb_06', { title: 'RERA registration', kind: 'file', format: 'PDF', pages: 6, passages: 21, languages: ['en', 'mr'], direct: [FLOW.faq], addedAt: ist(52, '10:20') }),
    src('kb_07', { title: 'Possession timeline', kind: 'file', format: 'PDF', pages: 4, status: 'indexing', progress: 60, languages: ['en'], addedAt: ist(0, '11:17') }),
    src('kb_08', { title: 'Cancellation policy', kind: 'file', format: 'PDF', pages: 5, passages: 17, languages: ['en'], direct: [FLOW.faq], addedAt: ist(60, '15:00') }),
    src('kb_09', { title: 'Parking allotment', kind: 'file', format: 'DOCX', pages: 3, status: 'failed', reason: 'encrypted', languages: [], addedAt: ist(1, '18:20') }),
    src('kb_10', { title: 'Nashik plot rates', kind: 'table', format: 'CSV', rows: 30, passages: 30, languages: ['en'], direct: [FLOW.nsk], addedAt: ist(45, '12:44') }),
    src('kb_11', { title: 'Channel partner terms', kind: 'file', format: 'PDF', pages: 8, passages: 26, languages: ['en'], addedAt: ist(70, '17:10') }),
    src('kb_12', { title: 'Rental listings', kind: 'table', format: 'CSV', rows: 44, passages: 44, languages: ['en'], direct: [FLOW.ren], addedAt: ist(18, '10:55') }),
    src('kb_13', { title: 'Festive offer 2026', kind: 'file', format: 'PDF', pages: 2, passages: 11, languages: ['en', 'hi'], direct: [FLOW.fes], addedAt: ist(2, '19:02') }),
    src('kb_14', { title: 'Site visit checklist', kind: 'text', format: 'Text', chars: 2840, status: 'queued', languages: [], addedAt: ist(0, '11:22') })
  ];

  /* Failure reason code -> short reason (Status cell, phone meta), sentence (tooltip, sheet Notice) and fixes (§1.6). */
  var REASONS = {
    no_text: { short: 'No text found', sentence: 'No text found. It may be a scanned PDF.', fixes: ['replace', 'paste'] },
    encrypted: { short: 'Password-protected', sentence: 'The file is password-protected.', fixes: ['replace'] },
    too_large: { short: 'Larger than 10 MB', sentence: 'Larger than 10 MB. Split it into smaller files.', fixes: ['replace'] },
    fetch_blocked: { short: 'Site blocked reading', sentence: "The website didn’t let us read this page.", fixes: ['paste'] },
    fetch_login: { short: 'Needs a sign-in', sentence: 'The page needs a sign-in.', fixes: ['paste'] },
    fetch_not_found: { short: 'Page not found', sentence: "The page wasn’t found. Check the address.", fixes: ['address'] },
    empty: { short: 'No text', sentence: 'This source has no text.', fixes: ['replace', 'delete'] },
    internal: { short: 'Something went wrong', sentence: 'Something went wrong on our side.', fixes: ['retry'], errorId: 'kb-err-7f31c2' },
    connection: { short: 'Connection lost', sentence: 'The upload stopped because the connection was lost.', fixes: ['retry'] }
  };

  /* Passages the Test panel searches (a small stand-in for the live lookup). keys: words that make a passage match. */
  var PASSAGES = [
    { src: 'kb_01', loc: 'page 2', lang: 'en', keys: ['2bhk', 'price', 'floor', 'parking', 'cost', 'rate'], base: 0.84, text: 'Tower B 2BHK units (1,150 sq ft) start at ₹85 L including one covered parking. Floor rise of ₹25,000 per floor above the 5th floor.' },
    { src: 'kb_01', loc: 'page 3', lang: 'en', keys: ['3bhk', 'price', 'cost', 'rate', 'floor'], base: 0.78, text: 'Tower A 3BHK units (1,480 sq ft) start at ₹1.12 Cr. Corner units carry a preferential location charge of ₹1.5 L.' },
    { src: 'kb_04', loc: 'row 3', lang: 'en', keys: ['2bhk', 'price', 'booking', 'payment', 'plan', 'emi'], base: 0.79, text: 'Tower B 2BHK: Size 1,150 sq ft · Price ₹85 L · Booking amount ₹5 L · Plan Construction-linked' },
    { src: 'kb_04', loc: 'row 7', lang: 'en', keys: ['booking', 'payment', 'plan', 'instalment', 'emi'], base: 0.74, text: 'Construction-linked plan: 10% on booking, then 8 instalments tied to slab completion. Home loans from partner banks.' },
    { src: 'kb_02', loc: 'page 14', lang: 'en', keys: ['2bhk', 'floor', 'plan', 'size', 'carpet'], base: 0.72, text: 'Typical 2BHK floor plan: carpet area 780 sq ft, two balconies facing the central garden, east-facing entrance.' },
    { src: 'kb_02', loc: 'page 21', lang: 'en', keys: ['metro', 'location', 'school', 'hospital', 'distance'], base: 0.8, text: 'Aranya is 900 m from Vanaz metro station, 2 km from Symbiosis school and 3 km from Sahyadri hospital.' },
    { src: 'kb_03', loc: 'page 3', lang: 'en', keys: ['loan', 'emi', 'bank', 'interest', 'eligibility'], base: 0.83, text: 'Partner banks offer home loans up to 80% of the agreement value. Interest starts at 8.4% a year for salaried applicants.' },
    { src: 'kb_03', loc: 'page 5', lang: 'hi', keys: ['loan', 'emi', 'documents', 'kagaz'], base: 0.76, text: 'लोन के लिए पिछले तीन महीने की सैलरी स्लिप, पैन कार्ड और छह महीने का बैंक स्टेटमेंट चाहिए।' },
    { src: 'kb_05', loc: 'section 2', lang: 'en', keys: ['pool', 'swimming', 'gym', 'clubhouse', 'amenities', 'play'], base: 0.73, text: 'Amenities include a 25 m swimming pool, a gym, a clubhouse with a party hall and a children’s play area.' },
    { src: 'kb_06', loc: 'page 1', lang: 'en', keys: ['rera', 'registration', 'approved', 'legal'], base: 0.86, text: 'Aranya Phase 1 is registered with MahaRERA under registration number P5210000XXXX (fictional sample).' },
    { src: 'kb_08', loc: 'page 2', lang: 'en', keys: ['cancel', 'refund', 'cancellation'], base: 0.81, text: 'Bookings cancelled within 30 days get a full refund minus ₹25,000 processing. After 30 days, 2% of the agreement value is kept.' },
    { src: 'kb_13', loc: 'page 1', lang: 'hi', keys: ['offer', 'festive', 'diwali', 'discount'], base: 0.8, text: 'दिवाली ऑफ़र: 31 अक्टूबर तक बुकिंग पर स्टैम्प ड्यूटी में ₹1 लाख की छूट।' },
    { src: 'kb_12', loc: 'row 14', lang: 'en', keys: ['rent', 'rental', '2bhk', 'lease'], base: 0.66, text: 'Kothrud 2BHK, semi-furnished · Rent ₹28,000 a month · Deposit ₹1 L · Available 1 Oct' },
    { src: 'kb_10', loc: 'row 9', lang: 'en', keys: ['plot', 'nashik', 'rate', 'price'], base: 0.64, text: 'Nashik, Gangapur Road · Plot 1,500 sq ft · ₹2,450 per sq ft · Clear title' },
    { src: 'kb_11', loc: 'page 4', lang: 'en', keys: ['commission', 'partner', 'broker', 'brokerage'], base: 0.77, text: 'Channel partners earn 2% of the agreement value, paid within 30 days of the buyer’s registration.' }
  ];
  /* Words callers use, folded to the keys above (Hindi, Hinglish and English). */
  var SYNONYMS = {
    kitna: 'price', kitne: 'price', kya: '', hai: '', ka: '', ki: '', ke: '', daam: 'price', keemat: 'price', price: 'price', prices: 'price', cost: 'cost', rate: 'rate', rates: 'rate',
    '2bhk': '2bhk', '2': '', bhk: '2bhk', '3bhk': '3bhk', flat: '2bhk', loan: 'loan', emi: 'emi', bank: 'bank', possession: 'possession', kab: 'possession', milega: 'possession',
    pool: 'pool', swimming: 'swimming', gym: 'gym', clubhouse: 'clubhouse', amenities: 'amenities', metro: 'metro', school: 'school', cancel: 'cancel', refund: 'refund',
    rera: 'rera', booking: 'booking', payment: 'payment', plan: 'plan', offer: 'offer', diwali: 'diwali', rent: 'rent', parking: 'parking', plot: 'plot', nashik: 'nashik', commission: 'commission'
  };

  var UNANSWERED = [
    { q: 'Possession kab milega?', lang: 'hi-Latn', times: 6 },
    { q: 'Is there a clubhouse fee?', lang: 'en', times: 4 },
    { q: 'क्या पालतू जानवर रख सकते हैं?', lang: 'hi', times: 3 },
    { q: 'Visitor parking kahan hai?', lang: 'hi-Latn', times: 2 }
  ];
  var SUGGESTED = ['2BHK ka price kya hai?', 'Is there a swimming pool?', 'Do you have a helipad?'];

  /* Proposals: the shared records plus the call context the review sheet shows (§1.10). */
  var PROP_EXTRA = {
    kp_1: { lang: 'en', durationSec: 134, callId: 'call_7c61ec', by: 'Vaani', at: ist(0, '10:42'), turns: [
      { id: 'p1a', speaker: 'caller', startMs: 62000, text: 'Is there a clubhouse fee, or is it included?', lang: 'en', final: true },
      { id: 'p1b', speaker: 'agent', name: 'Vaani', startMs: 66000, text: "I’m not sure about the clubhouse fee. I’ll ask the team to confirm it for you.", lang: 'en', final: true },
      { id: 'p1c', speaker: 'caller', startMs: 72000, text: 'Okay, please send it on WhatsApp.', lang: 'en', final: true }] },
    kp_2: { lang: 'hi-Latn', durationSec: 201, callId: 'call_7c71ef', by: 'Anika R.', at: ist(1, '15:20'), turns: [
      { id: 'p2a', speaker: 'caller', startMs: 88000, text: 'Humare paas ek dog hai, pets allowed hain kya?', lang: 'hi-Latn', final: true },
      { id: 'p2b', speaker: 'agent', name: 'Vaani', startMs: 93000, text: 'Main yeh confirm karke aapko batati hoon.', lang: 'hi-Latn', final: true }] },
    kp_3: { lang: 'en', durationSec: 176, callId: 'call_7c51e9', by: 'Vaani', at: ist(2, '12:02'), turns: [
      { id: 'p3a', speaker: 'caller', startMs: 41000, text: 'When is possession for Tower B?', lang: 'en', final: true },
      { id: 'p3b', speaker: 'agent', name: 'Vaani', startMs: 45000, text: 'The team is finalising the possession date. I can have someone call you back.', lang: 'en', final: true }] }
  };
  var PROPOSALS = (D.proposals || []).map(function (p) { var x = {}; for (var k in p) x[k] = p[k]; var e = PROP_EXTRA[p.id] || {}; for (var j in e) x[j] = e[j]; return x; });
  PROPOSALS.push(
    { id: 'kp_4', status: 'added', question: 'Is the society gated?', answer: 'Yes. Aranya has one gated entry with 24-hour security and visitor logs.', lang: 'en', durationSec: 98, callId: 'call_7c61ec', by: 'Vaani', at: ist(5, '11:10'), turns: [] },
    { id: 'kp_5', status: 'dismissed', question: 'Can I get a discount?', answer: 'We give 10% off to everyone.', lang: 'hi-Latn', durationSec: 150, callId: 'call_7c71ef', by: 'Vaani', at: ist(6, '17:34'), turns: [] }
  );

  w.VaaniKnowledge = w.VaaniKnowledge || {};
  w.VaaniKnowledge.data = { sources: SOURCES, reasons: REASONS, passages: PASSAGES, synonyms: SYNONYMS, unanswered: UNANSWERED, suggested: SUGGESTED, proposals: PROPOSALS, allSources: ALL_SOURCES, flows: FLOW, threshold: 0.7, admins: 2 };
})(window);
