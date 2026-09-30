/* Vaani Labs prototype · Call reports + Analytics · the call ledger fixture (stands in for GET /api/calls).
   One ledger for both pages (spec 03-pages/04 D3): the 60 shared calls in VAANI_DATA.calls keep their ids and fields,
   and older conversations are generated deterministically. For the last 30 days the daily volume, connected calls and
   billable minutes follow VAANI_DATA.usage, so Billing › Usage, Analytics and Call reports agree. Everything is fictional. */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA, U = D._util, NS = w.VaaniCallReports = w.VaaniCallReports || {};
  var r = U.rng(2604);
  function pick(a) { return a[Math.floor(r() * a.length)]; }
  function chance(p) { return r() < p; }
  function weighted(pairs) { var t = 0, i; for (i = 0; i < pairs.length; i++) t += pairs[i][1]; var x = r() * t; for (i = 0; i < pairs.length; i++) { x -= pairs[i][1]; if (x <= 0) return pairs[i][0]; } return pairs[0][0]; }
  function dateOf(daysAgo) { return U.ist(daysAgo, '00:00').slice(0, 10); }

  /* ---------- flow versions: steps (node id → [number, label]), funnel rows, captured fields in step order ---------- */
  function sv(v) { return { id: 'flow_7c21', name: 'Site-visit qualifier', version: v, recording: true,
    steps: { n3: [3, 'Ask about a site visit'], n4: [4, 'Book site visit'], n5: [5, 'Polite close'], n6: [6, 'Visit booked'], n7: [7, 'Callback set'], n8: [8, 'Not interested'] },
    funnel: ['n3', 'n4', 'n6'], fields: [{ key: 'Budget', step: 'n3' }, { key: 'Preferred day', step: 'n3' }, { key: 'Site visit', step: 'n4' }, { key: 'Callback time', step: 'n7' }] }; }
  function br(v) { return { id: 'flow_9e14', name: 'Booking amount reminder', version: v, recording: false,
    steps: { n2: [2, 'Remind about the payment'], n3: [3, 'Ask for a date'], n5: [5, 'Promise to pay'], n6: [6, 'Callback set'] },
    funnel: ['n2', 'n3', 'n5'], fields: [{ key: 'Promise date', step: 'n3' }, { key: 'Amount promised', step: 'n3' }, { key: 'Payment mode', step: 'n5' }] }; }
  NS.FLOWS = {
    'flow_7c21@7': sv(7), 'flow_7c21@6': sv(6), 'flow_7c21@8': (function () { var f = sv(8); f.draft = true; return f; })(),
    'flow_3b90@3': { id: 'flow_3b90', name: 'Home-loan follow-up', version: 3, recording: true,
      steps: { n2: [2, 'Confirm interest'], n4: [4, 'Ask loan amount'], n5: [5, 'Condition check'], n6: [6, 'Condition check'], n7: [7, 'Transfer to advisor'], n8: [8, 'Callback set'] },
      funnel: ['n2', 'n4', 'n7'], fields: [{ key: 'Loan amount', step: 'n4' }, { key: 'Condition check', step: 'n5' }, { key: 'Condition check', step: 'n6' }, { key: 'Callback time', step: 'n8' }] },
    'flow_9e14@12': br(12), 'flow_9e14@11': br(11)
  };
  NS.flowKey = function (c) { return c.flow ? c.flow.id + '@' + c.flow.version : null; };

  /* ---------- people: the 40 loaded leads plus the rest of the 1,284 (generated, fictional) ---------- */
  var FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Ananya', 'Diya', 'Ishaan', 'Kavya', 'Riya', 'Meera', 'Rohan', 'Zoya', 'Pranav', 'Nandini', 'Harsh', 'Sunita', 'Kabir', 'Isha', 'Farhan', 'Leela', 'Dev', 'Ritu', 'Omar', 'Tanvi', 'Nikhil', 'Pooja', 'Rahul', 'Sneha', 'Varun', 'Gauri', 'Kunal', 'Neha', 'Siddharth', 'Anjali', 'Yash', 'Divya', 'Manish', 'Swati', 'Tejas', 'Arjun', 'Saanvi'];
  var LAST = ['Sharma', 'Verma', 'Iyer', 'Nair', 'Kulkarni', 'Deshpande', 'Joshi', 'Patil', 'Shah', 'Mehta', 'Reddy', 'Rao', 'Das', 'Banerjee', 'Khan', 'Siddiqui', 'Pillai', 'Menon', 'Gupta', 'Agarwal', 'Chopra', 'Bhat', 'Hegde', 'Gowda', 'Jain', 'Kapoor', 'Saxena', 'Sinha', 'Pandey', 'Thakur', 'Ghosh'];
  function genLead(i) {
    var f = FIRST[(i * 7 + i % 5) % FIRST.length], l = LAST[(i * 11 + 3) % LAST.length], l4 = String(1000 + (i * 7919 + 311) % 9000);
    return { id: 'lead_' + (2000 + i), name: f + ' ' + l, first: f, phone: { masked: '+91 •••••• ' + l4, short: '•••• ' + l4, last4: l4 },
      dnd: i % 89 === 0, language: ['hi', 'hi-Latn', 'en', 'hi-Latn', 'hi'][i % 5], unit: ['1 BHK', '2 BHK', '3 BHK', '2 BHK'][i % 4] };
  }
  NS.shortName = function (name) { if (!name) return null; var p = String(name).split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1][0] + '.' : p[0]; };

  /* ---------- scripts for generated transcripts (Hindi in Devanagari, Hinglish in Latin, English) ---------- */
  var L = {
    greet: ['नमस्ते {first} जी, मैं Sample Realty से वाणी बोल रही हूँ। क्या अभी दो मिनट बात हो सकती है?', 'Namaste {first} ji, main Sample Realty se Vaani bol rahi hoon. Kya abhi do minute baat ho sakti hai?', 'Hello {first}, this is Vaani from Sample Realty. Is this a good time for two minutes?'],
    ok: ['हाँ जी, बोलिए।', 'Haan ji, boliye.', 'Yes, go ahead.'],
    budget: ['आपका बजट लगभग कितना है?', 'Aapka budget lagbhag kitna hai?', 'Roughly what budget do you have in mind?'],
    budgetA: ['85 लाख से एक करोड़ तक।', '85 lakh se ek crore tak.', 'Between 85 lakh and one crore.'],
    ask: ['आपने मेट्रो के पास {unit} के बारे में पूछा था। क्या आप इस हफ़्ते साइट विज़िट करना चाहेंगे?', 'Aapne metro ke paas {unit} ke baare mein poocha tha. Kya aap is hafte site visit karna chahenge?', 'You had asked about a {unit} near the metro. Would you like to visit the site this week?'],
    yes: ['हाँ, शनिवार सुबह ठीक रहेगा।', 'Haan, Saturday morning theek rahega.', 'Yes, Saturday morning works for me.'],
    booked: ['बहुत बढ़िया। शनिवार सुबह 11 बजे का स्लॉट बुक हो गया है।', 'Bahut badhiya. Saturday 11 baje ka slot book ho gaya hai.', "Great. I’ve booked Saturday at 11 am for you."],
    later: ['अभी थोड़ा व्यस्त हूँ, कल शाम को फ़ोन कीजिए।', 'Abhi thoda busy hoon, kal shaam ko call kijiye.', "I’m busy right now. Can you call me tomorrow evening?"],
    callback: ['ज़रूर। मैं कल शाम 6 बजे फ़ोन करूँगी।', 'Zaroor. Main kal shaam 6 baje call karungi.', "Sure. I’ll call you tomorrow at 6 pm."],
    price: ['2 BHK का प्राइस क्या है?', 'Price kya hai 2 BHK ka?', "What’s the price for the 2 BHK?"],
    priceA: ['2 BHK 78 लाख से शुरू होते हैं, पार्किंग के साथ।', '2 BHK 78 lakh se shuru hote hain, parking ke saath.', 'The 2 BHK starts at 78 lakh, with parking.'],
    no: ['नहीं, हमने पहले ही फ़्लैट ले लिया है।', 'Nahi, humne already flat le liya hai.', "No thanks, we’ve already bought a flat."],
    close: ['कोई बात नहीं। धन्यवाद, आपका दिन शुभ हो।', 'Koi baat nahi. Dhanyavaad, aapka din shubh ho.', 'No problem. Thank you, have a good day.'],
    loan: ['मुझे होम लोन के बारे में बात करनी है।', 'Mujhe home loan ke baare mein baat karni hai.', "I’d like to talk about the home loan."],
    transfer: ['मैं आपको हमारे लोन एडवाइज़र से जोड़ रही हूँ।', 'Main aapko hamare loan advisor se jod rahi hoon.', "I’m connecting you to our loan advisor."],
    remind: ['{first} जी, आपकी बुकिंग राशि का भुगतान बाकी है।', '{first} ji, aapki booking amount ka payment pending hai.', '{first}, your booking amount payment is still pending.'],
    promise: ['मैं शुक्रवार तक UPI से भेज दूँगा।', 'Main Friday tak UPI se bhej dunga.', "I’ll pay by UPI before Friday."],
    hang: ['एक मिनट…', 'Ek minute…', 'Hold on a second…'],
    vm: ['नमस्ते, Sample Realty से वाणी। हम कल फिर फ़ोन करेंगे।', 'Namaste, Sample Realty se Vaani. Hum kal phir call karenge.', "Hello, this is Vaani from Sample Realty. We’ll call again tomorrow."]
  };
  var SCRIPT = {
    'Visit booked': ['a:greet:n3', 'c:ok', 'a:budget:n3', 'c:budgetA', 'a:ask:n3', 'c:yes', 's:Moved to step 4 · Book site visit', 'a:booked:n4', 's:Outcome · Visit booked'],
    'Callback': ['a:greet:n3', 'c:later', 'a:callback:n7', 's:Callback set for Tomorrow 6:00 pm'],
    'Interested': ['a:greet:n3', 'c:ok', 'a:ask:n3', 'c:price', 's:Knowledge lookup · price-sheet.pdf · 2 passages', 'a:priceA:n3'],
    'Not interested': ['a:greet:n3', 'c:ok', 'a:ask:n3', 'c:no', 'a:close:n5', 's:Outcome · Not interested'],
    'Transferred': ['a:greet:n2', 'c:loan', 'a:transfer:n7', 's:Transferred to a person'],
    'Promise to pay': ['a:remind:n2', 'c:ok', 'a:budget:n3', 'c:promise', 's:Outcome · Promise to pay'],
    'Call later': ['a:remind:n2', 'c:later', 'a:callback:n6'],
    none: ['a:greet:n3', 'c:ok', 'a:ask:n3', 'c:hang', 's:Caller hung up'],
    Voicemail: ['a:vm']
  };
  var SUMMARY = {
    'Visit booked': '{first} wants to see the {unit} near the metro and booked a site visit for Saturday at 11 am. Budget ₹85 L to ₹1 Cr.',
    'Callback': '{first} was busy and asked for a call tomorrow evening. No details captured yet.',
    'Interested': '{first} asked about the {unit} price and has a budget up to ₹85 L. The brochure was sent on WhatsApp.',
    'Not interested': '{first} has already bought a flat and is not looking.',
    'Transferred': '{first} wanted to discuss a home loan and was transferred to the loan advisor.',
    'Promise to pay': '{first} promised to pay the booking amount by UPI before Friday.',
    'Call later': '{first} asked for a call later about the pending booking amount.',
    none: '{first} hung up while the agent asked about a site visit. No outcome was written.',
    Voicemail: 'Reached voicemail. The agent left a short message.'
  };
  var CAPTURE = {
    'Visit booked': { 'Budget': '₹85 L to ₹1 Cr', 'Preferred day': 'Saturday, morning', 'Site visit': 'Booked · Sat 3 Oct, 11:00 am' },
    'Callback': { 'Preferred day': 'Tomorrow evening', 'Callback time': 'Tomorrow, 6:00 pm' },
    'Interested': { 'Budget': 'Up to ₹85 L', 'Loan amount': '₹60 L' },
    'Not interested': { 'Site visit': 'Declined' },
    'Transferred': { 'Loan amount': '₹55 L', 'Condition check': 'Salaried' },
    'Promise to pay': { 'Promise date': 'Fri 2 Oct', 'Amount promised': '₹2,00,000', 'Payment mode': 'UPI' },
    'Call later': { 'Promise date': 'Next week' },
    none: { 'Budget': '₹70 L to ₹80 L' }
  };
  NS.SUMMARY = SUMMARY;
  function fill(s, lead) { return String(s).replace(/\{first\}/g, lead.first || 'The caller').replace(/\{unit\}/g, lead.unit || '2 BHK'); }
  var STYLE = { hi: 0, 'hi-Latn': 1, en: 2 };

  /* Turns for a generated call, timed across its talk time (per-turn timing, B6). */
  NS.buildTurns = function (c) {
    var key = c.result === 'voicemail' ? 'Voicemail' : (c.outcome && SCRIPT[c.outcome] ? c.outcome : (c.result === 'completed' ? 'none' : null));
    if (!key || !c.durationSec) return [];
    var lines = SCRIPT[key], st = STYLE[c.style] != null ? STYLE[c.style] : 1, lead = c._lead || { first: c.leadName ? c.leadName.split(' ')[0] : null };
    var weights = lines.map(function (l) { var p = l.split(':'); return p[0] === 's' ? 0 : (L[p[1]] ? L[p[1]][st].length : 30) + 20; });
    var total = weights.reduce(function (a, b) { return a + b; }, 0) || 1, span = Math.max(8, c.durationSec - 3), t = 2, fk = NS.flowKey(c), F = NS.FLOWS[fk];
    return lines.map(function (l, k) {
      var p = l.split(':'), startMs = Math.round(t * 1000);
      if (p[0] === 's') return { id: 't' + k, speaker: 'system', text: p.slice(1).join(':'), startMs: startMs };
      var dur = span * weights[k] / total, txt = fill(L[p[1]][st], lead); t += dur;
      var step = p[2] && F && F.steps[p[2]] ? { label: F.steps[p[2]][1], href: 'flow-designer.html?node=' + p[2], node: p[2] } : undefined;
      return { id: 't' + k, speaker: p[0] === 'a' ? 'agent' : 'caller', name: p[0] === 'a' ? 'Vaani' : 'Caller', startMs: startMs, endMs: Math.round((t - 0.4) * 1000),
        text: txt, lang: c.perTurnLanguage ? (st === 0 ? 'hi' : st === 2 ? 'en' : 'hi-Latn') : undefined, final: true, step: step,
        source: p[1] === 'priceA' ? { kind: 'knowledge', label: 'Knowledge · price-sheet.pdf' } : undefined };
    });
  };

  /* Captured fields from the flow run log: one source for values and "Not captured" (spec §2.6.3). */
  NS.capturedOf = function (c) {
    var F = NS.FLOWS[NS.flowKey(c)]; if (!F || c.kind === 'browser' && !c.durationSec) return [];
    var src = CAPTURE[c.outcome || (c.result === 'completed' ? 'none' : '')] || {}, used = {};
    var at = Math.max(12, Math.round((c.durationSec || 60) * 0.35));
    return F.fields.map(function (f, i) {
      var v = src[f.key] != null && !used[f.key] ? src[f.key] : null; if (v) used[f.key] = 1;
      if (f.key === 'Condition check' && c.outcome === 'Transferred' && i === 2) v = 'Existing loan · none';
      return { key: f.key, step: f.step, stepNo: F.steps[f.step][0], stepLabel: F.steps[f.step][1], value: c.result === 'completed' ? v : null, atSec: v ? Math.min(c.durationSec - 2, at + i * 9) : null };
    });
  };

  /* ---------- the ledger ---------- */
  var MEMBERS = ['Dev M.', 'Rohit S.', 'Farah K.', 'Kiran P.'];
  var sentFor = {
    'Visit booked': [['positive', 85], ['neutral', 15]], 'Interested': [['positive', 60], ['neutral', 40]], 'Callback': [['neutral', 78], ['mixed', 10], ['positive', 12]],
    'Not interested': [['negative', 45], ['neutral', 55]], 'Transferred': [['mixed', 50], ['neutral', 30], ['positive', 20]], none: [['negative', 40], ['mixed', 30], ['neutral', 30]],
    'Promise to pay': [['positive', 50], ['neutral', 50]], 'Call later': [['neutral', 85], ['mixed', 15]]
  };
  var outFor = {
    'flow_7c21': [['Visit booked', 22], ['Callback', 22], ['Interested', 14], ['Not interested', 16], ['Transferred', 4], ['none', 12]],
    'flow_3b90': [['Transferred', 25], ['Interested', 15], ['Callback', 25], ['Not interested', 20], ['none', 15]],
    'flow_9e14': [['Promise to pay', 40], ['Callback', 25], ['Call later', 15], ['none', 20]]
  };
  var INTENT = { 'Visit booked': [['int_visit', 80], ['int_location', 12], ['int_parking', 8]], 'Interested': [['int_price', 60], ['int_visit', 20], ['int_possession', 20]],
    'Callback': [['int_callback', 70], ['int_price', 15], ['int_location', 15]], 'Not interested': [['int_price', 30], ['int_other', 40], ['int_possession', 30]],
    'Transferred': [['int_loan', 100]], none: [['int_price', 40], ['int_location', 30], ['int_other', 30]], 'Promise to pay': [['int_payment', 100]], 'Call later': [['int_payment', 70], ['int_callback', 30]] };
  var HOURS = [[10, 7], [11, 12], [12, 12], [13, 9], [14, 7], [15, 7], [16, 8], [17, 11], [18, 11]];
  var IN_HOURS = [[8, 2], [9, 4], [10, 7], [11, 10], [12, 10], [13, 7], [14, 6], [15, 6], [16, 7], [17, 9], [18, 9], [19, 6], [20, 3]];
  var seq = 0;
  function makeCall(d, o) {
    seq += 1; var id = 'call_' + (0xa00000 + seq * 2731).toString(16).slice(-6);
    var inbound = o.direction === 'inbound', h = d === 0 ? (10 + (seq % 2)) : weighted(inbound ? IN_HOURS : HOURS), m = Math.floor(r() * 60);
    if (d === 0 && h === 11 && m > 22) m = m % 22;
    var lead = o.unknown ? null : (chance(0.07) ? pick(D.leads) : genLead(Math.floor(r() * 1244)));
    var fl = o.flow, answered = o.answered, result = answered ? (o.voicemail ? 'voicemail' : 'completed') : weighted([['no_answer', 70], ['busy', 18], ['failed', 12]]);
    var outcome = null, sentiment = 'unscored';
    if (result === 'completed') { var oc = weighted(outFor[fl.id]); outcome = oc === 'none' ? null : oc; sentiment = o.durationSec < 20 ? 'unscored' : weighted(sentFor[oc]); }
    else if (result === 'voicemail') outcome = 'Voicemail';
    else outcome = result === 'no_answer' ? 'No answer' : result === 'busy' ? 'Busy' : 'Failed';
    var style = lead ? (lead.language === 'hi' ? 'hi' : lead.language === 'en' || lead.language === 'ta' ? 'en' : 'hi-Latn') : 'hi-Latn';
    var c = { id: id, leadId: lead ? lead.id : null, leadName: lead ? lead.name : null, phone: o.withheld ? null : (lead ? lead.phone : { masked: '+91 •••••• ' + (5000 + seq % 4000), last4: String(5000 + seq % 4000) }),
      at: U.ist(d, U.pad(h) + ':' + U.pad(m)), sec: seq % 60, direction: o.direction || 'outbound', kind: o.kind || 'real', test: !!o.kind && o.kind !== 'real', legs: o.kind === 'browser' ? 2 : 1,
      durationSec: result === 'completed' || result === 'voicemail' ? o.durationSec : 0, ringSec: 4 + seq % 9, result: result, outcome: outcome, sentiment: sentiment,
      flow: { id: fl.id, name: fl.name, version: fl.version, draft: !!fl.draft }, style: style, languages: style === 'en' ? ['en'] : style === 'hi' ? ['hi', 'en'] : ['hi-Latn'],
      perTurnLanguage: chance(0.85), generated: true, _lead: lead };
    if (result === 'failed') c.failReason = 'Call dropped after 00:18';
    return c;
  }
  var calls = [];
  /* The shared 60: copied (never mutated), browser tests re-labelled with the shared call model’s kinds (legs 2 = Browser test). */
  D.calls.forEach(function (s) {
    var c = {}; for (var k in s) c[k] = s[k];
    c.kind = s.test ? 'browser' : 'real'; c.sec = (parseInt(s.id.slice(-2), 16) % 60); c.ringSec = 5; c.generated = false;
    c.style = s.languages[0] === 'en' ? 'en' : s.languages[0] === 'hi' ? 'hi' : 'hi-Latn';
    if (c.outcome === 'Test call') c.outcome = 'Interested';   /* the draft’s scripted test ends at Interested */
    c._lead = D.leads.filter(function (l) { return l.id === s.leadId; })[0] || null;
    calls.push(c);
  });
  var usage = {}; (D.usage || []).forEach(function (u) { usage[u.date] = u; });
  function flowFor(d, inbound) {
    var f = inbound ? 'flow_7c21' : weighted([['flow_7c21', 62], ['flow_3b90', 22], ['flow_9e14', 16]]);
    if (f === 'flow_7c21') return NS.FLOWS[d >= 15 ? 'flow_7c21@6' : 'flow_7c21@7'];
    if (f === 'flow_9e14') return NS.FLOWS[d >= 6 ? 'flow_9e14@11' : 'flow_9e14@12'];
    return NS.FLOWS['flow_3b90@3'];
  }
  for (var d = 0; d < 90; d++) {
    var date = dateOf(d), u = usage[date];
    var mine = calls.filter(function (c) { return c.kind === 'real' && c.at.slice(0, 10) === date; });
    var target = u ? u.calls : Math.max(12, Math.round(29 - (d - 30) * 0.1 + (r() - 0.5) * 16));
    var conn = u ? u.connected : Math.round(target * (0.6 + r() * 0.1));
    var mins = u ? u.minutes : Math.round(conn * (1.5 + r() * 0.7));
    var shConn = mine.filter(function (c) { return c.result === 'completed' || c.result === 'voicemail'; });
    var shSec = shConn.reduce(function (a, c) { return a + c.durationSec; }, 0);
    var gen = Math.max(0, target - mine.length), genConn = Math.max(0, Math.min(gen, conn - shConn.length));
    var secLeft = Math.max(genConn * 30, mins * 60 - shSec), ws = [], wsum = 0, i;
    for (i = 0; i < genConn; i++) { var wgt = 0.35 + r() * 1.3; ws.push(wgt); wsum += wgt; }
    for (i = 0; i < gen; i++) {
      var answered = i < genConn, inbound = answered ? chance(0.15) : (d % 11 === 3 && i === genConn), vm = answered && chance(0.07);
      var dur = answered ? Math.max(vm ? 22 : 14, Math.round(secLeft * ws[i] / wsum)) : 0;
      calls.push(makeCall(d, { answered: answered, voicemail: vm, durationSec: vm ? Math.min(dur, 34) : dur, direction: inbound ? 'inbound' : 'outbound',
        unknown: inbound && chance(0.1), withheld: inbound && i % 23 === 7, flow: flowFor(d, inbound) }));
    }
    if (u && u.testCalls && !calls.some(function (c) { return c.test && c.at.slice(0, 10) === date; })) {
      calls.push(makeCall(d, { answered: true, durationSec: 96, kind: 'browser', flow: NS.FLOWS['flow_7c21@8'] }));
      calls.push(makeCall(d, { answered: true, durationSec: 71, kind: 'test', flow: NS.FLOWS['flow_7c21@8'] }));
    }
  }
  /* One call stuck in "queued" past the reaper window reads Timed out (F-QA-037). */
  var stale = makeCall(29, { answered: false, flow: NS.FLOWS['flow_7c21@6'] });
  stale.at = U.ist(30, '23:45'); stale.result = 'timed_out'; stale.outcome = null; stale.staleSince = stale.at; delete stale.failReason; calls.push(stale);

  calls.sort(function (a, b) { return a.at === b.at ? (a.id < b.id ? 1 : -1) : (a.at < b.at ? 1 : -1); });
  /* Derived per-call facts shared by both pages: intent, path through the flow, review state, cost, recording. */
  var reviewLeft = 9;
  calls.forEach(function (c) {
    var fk = NS.flowKey(c), F = NS.FLOWS[fk], talked = c.result === 'completed';
    c.captured = NS.capturedOf(c);
    c.intent = talked && c.sentiment !== 'unscored' ? weighted(INTENT[c.outcome] || INTENT.none) : null;
    /* Path through the funnel steps: a success outcome reaches the last step; Interested the second; a call with no
       outcome dropped at its last step (the drop-off the funnel reports). */
    var reach = !talked || !F ? 0 : c.outcome === 'Visit booked' || c.outcome === 'Transferred' || c.outcome === 'Promise to pay' ? 3
      : c.outcome === 'Interested' ? 2 : c.outcome ? 1 : (c.id.charCodeAt(c.id.length - 1) % 3 === 0 ? 2 : 1);
    c.path = F ? F.funnel.slice(0, reach) : [];
    c.lastStep = c.path.length ? c.path[c.path.length - 1] : null;
    if (!c.summary && c.result !== 'no_answer' && c.result !== 'busy' && c.result !== 'failed' && c.result !== 'timed_out') c.summary = fill(SUMMARY[c.outcome || 'none'] || SUMMARY.none, c._lead || {});
    if (c.test && c.flow.draft) c.summary = 'Test call on the draft. Greeting and site-visit question played in Hindi and English.';
    c.cost = c.kind === 'browser' ? null : Math.round(c.durationSec * 0.04 * 100) / 100;
    var off = c.kind === 'browser' ? 'Recording is off for browser tests.' : !talked ? "The call didn’t connect." : F && !F.recording ? 'Recording was turned off for this flow.' : null;
    c.recording = { available: !off && talked, disclosedAtSec: 1, offReason: off };
    c.candidate = !c.test && (c.sentiment === 'negative' || c.sentiment === 'mixed' || c.result === 'failed' || c.result === 'timed_out' || (talked && !c.outcome));
    c.reviewed = null;
    if (c.candidate) { if (reviewLeft > 0 && c.result !== 'timed_out') reviewLeft -= 1; else { var hrs = 2 + c.id.charCodeAt(6) % 20; c.reviewed = { by: MEMBERS[c.id.charCodeAt(7) % MEMBERS.length], at: new Date(new Date(c.at).getTime() + hrs * 3600000).toISOString() }; } }
    c.satisfaction = c.sentiment === 'positive' ? 'High' : c.sentiment === 'negative' ? 'Low' : c.sentiment === 'unscored' ? null : 'Medium';
    c.analysedAt = c.sentiment !== 'unscored' || talked ? new Date(new Date(c.at).getTime() + ((c.durationSec || 0) + 180) * 1000).toISOString() : null;
  });
  NS.calls = calls;
  NS.byId = {}; calls.forEach(function (c) { NS.byId[c.id] = c; });
  /* The shared transcripts cover the first minute of each call; spread them across the talk time so the talk strip and
     the timecodes describe the whole recording. */
  function spread(c) {
    var T = (c.turns || []).map(function (t) { var x = {}; for (var k in t) x[k] = t[k]; return x; });
    var last = T.reduce(function (m, t) { return Math.max(m, t.endMs || t.startMs || 0); }, 0);
    if (!last || !c.durationSec || last > c.durationSec * 800) return T;
    var f = (c.durationSec - 4) * 1000 / last;
    T.forEach(function (t) { t.startMs = Math.round(t.startMs * f); if (t.endMs) t.endMs = Math.round(t.endMs * f); });
    return T;
  }
  NS.turnsOf = function (c) { if (!c._turns) c._turns = c.generated ? NS.buildTurns(c) : spread(c); return c._turns; };
})(window);
