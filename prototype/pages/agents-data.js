/* Vaani Labs prototype · pages/agents-data.js — page-local fictional data for Meetings and Personal agents
   (spec 03-pages/07). Built from window.VAANI_DATA (flows, leads, members, wallet) and extended with the rooms, past
   meetings, tasks, approvals, templates and capabilities the spec describes. Nothing here is real customer data:
   people are invented, phone numbers exist only masked, links use .example. Demo clock: Sun 27 Sep 2026, 11:24 am IST. */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA, ist = D._util.ist;
  var A = w.VaaniAgents = w.VaaniAgents || {};

  var turnsWeekly = [
    { id: 't1', speaker: 'agent', name: 'Vikash', startMs: 4000, endMs: 15000, lang: 'en', text: 'Good afternoon, everyone. I will walk you through the Q3 pricing for Tower A and Tower B, and then take your questions.' },
    { id: 't2', speaker: 'guest', name: 'Rohan Kulkarni', startMs: 16000, endMs: 22000, lang: 'hi-Latn', text: 'Theek hai. Pehle bataiye, 2 BHK ka starting price kya hai?' },
    { id: 't3', speaker: 'agent', name: 'Vikash', startMs: 23000, endMs: 36000, lang: 'hi-Latn', text: 'Tower A mein 2 BHK ₹78 lakh se shuru hota hai, aur Tower B mein ₹84 lakh se. Slide 4 par poori list hai.' },
    { id: 't4', speaker: 'guest', name: 'Priya Nair', startMs: 38000, endMs: 46000, lang: 'en', text: 'Is the festive offer still valid if we book after the 15th of October?' },
    { id: 't5', speaker: 'agent', name: 'Vikash', startMs: 47000, endMs: 61000, lang: 'en', text: 'The festive offer runs until 31 October. Bookings before then get the waived floor-rise charge and a free modular kitchen.' },
    { id: 't6', speaker: 'host', name: 'Anika R.', startMs: 63000, endMs: 72000, lang: 'en', text: 'Vikash, can you show the payment plan slide? Priya asked about the 20:80 plan last week.' },
    { id: 't7', speaker: 'agent', name: 'Vikash', startMs: 73000, endMs: 88000, lang: 'hi', text: '20:80 योजना में आप बुकिंग पर 20 प्रतिशत देते हैं और बाकी 80 प्रतिशत पज़ेशन के समय।' },
    { id: 't8', speaker: 'guest', name: 'Rohan Kulkarni', startMs: 90000, endMs: 97000, lang: 'hi-Latn', text: 'Site visit is Saturday ho sakta hai? Main apni family ke saath aana chahta hoon.' },
    { id: 't9', speaker: 'host', name: 'Anika R.', startMs: 98000, endMs: 106000, lang: 'en', text: 'Yes, I will book Saturday at 11 for you and send the location on WhatsApp.' },
    { id: 't10', speaker: 'agent', name: 'Vikash', startMs: 108000, endMs: 118000, lang: 'en', text: 'To recap: Tower A from ₹78 lakh, the festive offer until 31 October, and a site visit on Saturday at 11 am.' }
  ];
  var liveTurns = [
    { id: 'l1', speaker: 'agent', name: 'Vikash', startMs: 60000, endMs: 72000, lang: 'en', text: 'This slide compares the Q3 prices with last quarter. Tower B is up 3 percent after the metro announcement.' },
    { id: 'l2', speaker: 'guest', name: 'Rohan Kulkarni', startMs: 74000, endMs: 80000, lang: 'hi-Latn', text: 'Parking ka charge alag se lagega kya?' },
    { id: 'l3', speaker: 'agent', name: 'Vikash', startMs: 81000, endMs: 92000, lang: 'hi-Latn', text: 'Ek covered parking price mein shamil hai. Doosri parking ₹3.5 lakh ki hai.' },
    { id: 'l4', speaker: 'host', name: 'Anika R.', startMs: 94000, endMs: 99000, lang: 'en', text: 'Let us move to the payment plans next.' }
  ];

  function past(id, title, days, hm, mins, people, agent, notes, extra) {
    var o = { id: id, title: title, at: ist(days, hm), mins: mins, people: people, agent: agent, notes: notes,
      code: extra && extra.code || 'mtg-' + id.slice(-2) + 'x-pq', privacy: 'key', createdBy: 'Anika R.', recording: 0, agentMin: 0, cost: 0, summary: null, items: [], turns: [] };
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
    return o;
  }
  function guests(names) { return names.map(function (n, i) { return { name: n, kind: i === 0 ? 'host' : n === 'Vikash' ? 'agent' : 'guest' }; }); }

  A.data = {
    voice: { id: 'vikash', name: 'Vikash', tile: 'Vi', style: 'Male · warm, measured', languages: ['hi', 'en'], role: 'Meeting agent' },
    capabilitiesShipped: ['Present slides', 'run a flow', 'take notes'],
    seats: { used: 1, total: 3 },
    free: { used: 1, of: 30 },
    rates: { roomPerMin: 2.40, agentPerSec: 0.08 },
    month: { agentMin: 25, agentCost: 120, meetings: 12 },
    knowledgeCount: (D.knowledge || []).length || 14,
    decks: [{ id: 'deck_q3', name: 'Q3 pricing.pdf', slides: 14, size: 2457600 }, { id: 'deck_fest', name: 'festive-offer-2026.pdf', slides: 9, size: 1363148 }],

    rooms: [
      { id: 'room_qdr', title: 'Weekly demo · Sample Realty', status: 'live', createdAt: ist(0, '11:04'), startedAt: ist(0, '11:06'), code: 'qdr-hkte-mzp', keyRequired: true, keyShown: false,
        createdBy: 'Anika R.', mode: 'slides', does: 'Presents slides · Q3 pricing.pdf, 14 slides', doesShort: 'Presents slides · Q3 pricing.pdf',
        agent: { state: 'in', since: ist(0, '11:07'), doing: 'presenting Q3 pricing.pdf' }, notes: { on: true, turns: 42 }, recording: { on: false },
        people: [{ name: 'Anika R.', kind: 'host', joined: ist(0, '11:05') }, { name: 'Vikash', kind: 'agent', joined: ist(0, '11:07') }, { name: 'Rohan Kulkarni', kind: 'guest', joined: ist(0, '11:09') }],
        left: [{ name: 'Guest 2', joined: ist(0, '11:08'), left: ist(0, '11:15') }, { name: 'Farah K.', joined: ist(0, '11:06'), left: ist(0, '11:18') }], turns: liveTurns },
      { id: 'room_vbn', title: 'Site walkthrough prep', status: 'long_open', createdAt: ist(3, '10:40'), startedAt: ist(3, '10:41'), lastSeen: ist(3, '11:32'), code: 'vbn-pqpe-1rt', keyRequired: false,
        createdBy: 'Dev M.', mode: 'none', does: 'No agent has joined', doesShort: 'No agent', agent: { state: 'none' }, notes: { on: false }, recording: { on: false },
        people: [], left: [{ name: 'Dev M.', joined: ist(3, '10:41'), left: ist(3, '11:32') }, { name: 'Kiran P.', joined: ist(3, '10:52'), left: ist(3, '11:30') }], turns: [] }
    ],

    past: [
      past('mtg_12', 'Pricing walkthrough', 0, '10:38', 42, 4, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented Q3 pricing.pdf' }, 'writing',
        { code: 'prc-wlkt-8ha', agentMin: 16, cost: 76.80, recording: 42, endedBy: 'Anika R.' }),
      past('mtg_11', 'Weekly demo · Sample Realty', 1, '16:23', 42, 4, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented Q3 pricing.pdf' }, 'ready',
        { code: 'qdr-hkte-mzp', agentMin: 18, cost: 86.40, recording: 42, endedBy: 'Anika R.', langs: ['hi', 'en'],
          summary: 'Vikash walked Rohan Kulkarni and Priya Nair through Q3 pricing for Tower A and Tower B. Rohan wants a 2 BHK in Tower A and asked for a Saturday site visit with his family. Priya asked whether the festive offer holds after 15 October; it runs until 31 October. Anika agreed to share the 20:80 payment plan and to book the visit.',
          decisions: ['Site visit for Rohan Kulkarni on Saturday at 11 am', 'Priya gets the 20:80 payment plan by email'],
          questions: ['Does the free modular kitchen apply to Tower B?'],
          items: [
            { text: 'Book a Saturday 11 am site visit for Rohan Kulkarni and send the location on WhatsApp', owner: 'Anika R.', due: ist(-1, '10:00'), atMs: 98000 },
            { text: 'Email Priya Nair the 20:80 payment plan and the festive offer terms', owner: 'Anika R.', due: null, atMs: 63000 },
            { text: 'Check whether the free modular kitchen applies to Tower B and reply to both guests', owner: null, due: null, atMs: 118000 }],
          turns: turnsWeekly,
          roster: [{ name: 'Anika R.', kind: 'host', joined: '4:21 pm', left: '5:05 pm' }, { name: 'Vikash', kind: 'agent', joined: '4:24 pm', left: '4:42 pm' }, { name: 'Rohan Kulkarni', kind: 'guest', joined: '4:23 pm', left: '5:04 pm' }, { name: 'Priya Nair', kind: 'guest', joined: '4:26 pm', left: '5:05 pm' }] }),
      past('mtg_10', 'Investor Q&A prep', 5, '15:00', 18, 2, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented rera-registration.pdf' }, 'off', { agentMin: 12, cost: 57.60, privacy: 'link' }),
      past('mtg_09', 'Channel partner onboarding', 8, '12:10', 55, 6, { kind: 'flow', label: 'Ran Site-visit qualifier v7', detail: 'Ran Site-visit qualifier v7 · reached 6 of 9 steps' }, 'ready',
        { agentMin: 31, cost: 148.80, summary: 'Six channel partners joined. Vikash ran the site-visit script end to end so partners could hear how leads are qualified. Partners asked for a shorter version for walk-ins.', items: [{ text: 'Share the partner commission sheet with all six partners', owner: 'Rohit S.', due: ist(5, '18:00'), atMs: 1520000 }] }),
      past('mtg_08', 'Site visit briefing', 11, '09:30', 12, 2, { kind: 'none', label: 'No agent', detail: 'No agent joined' }, 'off', { privacy: 'link', createdBy: 'Dev M.' }),
      past('mtg_07', 'Weekly demo · Sample Realty', 7, '16:30', 29, 3, { kind: 'flow', label: 'Ran Site-visit qualifier v7', detail: 'Ran Site-visit qualifier v7 · reached 5 of 9 steps' }, 'failed', { agentMin: 14, cost: 67.20, recording: 29 }),
      past('mtg_06', 'Home-loan partner call', 15, '12:00', 41, 4, { kind: 'flow', label: 'Ran Home-loan follow-up v3', detail: 'Ran Home-loan follow-up v3 · reached 8 of 12 steps' }, 'ready',
        { agentMin: 20, cost: 96.00, createdBy: 'Farah K.', summary: 'Two bank partners reviewed the home-loan follow-up flow. They asked to add a question on existing EMIs before the eligibility step.', items: [{ text: 'Add an existing-EMI question before the eligibility step', owner: 'Farah K.', due: null, atMs: 910000 }] }),
      past('mtg_05', 'Weekly demo · Sample Realty', 14, '16:30', 33, 4, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented site-plan-brochure.pdf' }, 'ready',
        { agentMin: 17, cost: 81.60, summary: 'Vikash presented the site plan to three buyers. Two asked about possession dates for Tower B.', items: [{ text: 'Send the possession timeline to both buyers', owner: 'Anika R.', due: null, atMs: 1210000 }] }),
      past('mtg_04', 'Festive offer planning', 17, '11:00', 36, 5, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented festive-offer-2026.pdf' }, 'ready',
        { agentMin: 10, cost: 48.00, createdBy: 'Rohit S.', summary: 'The team agreed the festive offer: floor-rise waiver and a free modular kitchen for bookings before 31 October.', items: [{ text: 'Publish the festive offer callback flow', owner: 'Rohit S.', due: ist(15, '18:00'), atMs: 1800000 }] }),
      past('mtg_03', 'Tower B possession update', 22, '15:30', 24, 3, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented possession-timeline.pdf' }, 'off', { agentMin: 9, cost: 43.20 }),
      past('mtg_02', 'Sales stand-up', 25, '10:00', 18, 5, { kind: 'none', label: 'No agent', detail: 'No agent joined' }, 'off', { privacy: 'link' }),
      past('mtg_01', 'Nashik plots walkthrough', 29, '14:00', 27, 3, { kind: 'slides', label: 'Presented slides', detail: 'Vikash presented nashik-plots-rates.csv as slides' }, 'ready',
        { agentMin: 15, cost: 72.00, createdBy: 'Dev M.', summary: 'Vikash walked two buyers through Nashik plot rates. One asked for a weekday site visit.', items: [{ text: 'Book a weekday Nashik site visit', owner: null, due: null, atMs: 1400000 }] })
    ],

    templates: [
      { id: 'followups', title: 'Outbound follow-ups', desc: 'Payment reminders, lead call-backs, appointment confirmations.',
        goal: 'Call the leads in my Callbacks due view, agree a new time with each and update their status.',
        contacts: 'view', view: 'callbacks', channels: ['calls'], limits: { maxCalls: 20, spendCap: 200, finishBy: ist(0, '19:00'), repeat: 'none' } },
      { id: 'errands', title: 'Multi-step errands', desc: 'Research, compare, draft, then call you with the result.',
        goal: "Compare three CRM tools for a 20-person sales team, draft a one-page comparison and call me when it’s ready.",
        contacts: 'me', channels: [], limits: { maxCalls: 1, spendCap: 50, finishBy: ist(-2, '18:00'), repeat: 'none' } },
      { id: 'standing', title: 'Standing jobs', desc: 'Goals that repeat on a schedule, like a weekly digest.',
        goal: 'Every Monday at 9 am, send me a summary of competitor price changes on WhatsApp.',
        contacts: 'me', channels: [], limits: { maxCalls: 1, spendCap: 50, finishBy: null, repeat: 'weekly' } }
    ],

    leadViews: [{ id: 'callbacks', label: 'Callbacks due', count: 18 }, { id: 'new', label: 'New', count: 312 }, { id: 'interested', label: 'Interested', count: 96 }, { id: 'not-reached', label: 'Not reached', count: 211 }],

    /* Capability autonomy (§2.11). def = the workspace default (reversible → auto, irreversible → confirm, money → 2fa). */
    capGroups: [
      { id: 'sales', label: 'Sales follow-up', caps: [
        { id: 'calls', label: 'Calls', desc: 'Calls people from your agent’s number.', def: 'confirm', value: 'confirm', contacts: true },
        { id: 'whatsapp', label: 'WhatsApp messages', desc: 'Sends WhatsApp messages. Messages can’t be unsent.', def: 'confirm', value: 'confirm', contacts: true },
        { id: 'email', label: 'Email', desc: 'Sends email from your workspace address.', def: 'confirm', value: 'auto', contacts: true }] },
      { id: 'scheduling', label: 'Scheduling', caps: [{ id: 'book', label: 'Book appointments', desc: 'Books site visits and meetings in your calendar.', def: 'confirm', value: 'confirm' }] },
      { id: 'research', label: 'Research', caps: [
        { id: 'web', label: 'Web research', desc: 'Reads public web pages.', def: 'auto', value: 'auto' },
        { id: 'news', label: 'News digest', desc: 'Summarises news on topics you name.', def: 'auto', value: 'auto' }] },
      { id: 'documents', label: 'Documents', caps: [
        { id: 'pdf', label: 'Read PDFs', desc: 'Reads PDFs you share with it.', def: 'auto', value: 'auto' },
        { id: 'sheets', label: 'Read spreadsheets', desc: 'Reads CSV and XLSX files.', def: 'auto', value: 'auto' },
        { id: 'draft', label: 'Draft a document', desc: 'Writes a draft for you to review.', def: 'auto', value: 'auto' },
        { id: 'mksheet', label: 'Make a spreadsheet', desc: 'Builds a spreadsheet from what it found.', def: 'auto', value: 'auto' },
        { id: 'deck', label: 'Make a presentation', desc: 'Builds a short deck.', def: 'auto', value: 'auto' }] },
      { id: 'knowledge', label: 'Knowledge', caps: [{ id: 'kb', label: 'Look up your knowledge', desc: 'Answers from your Knowledge sources.', def: 'auto', value: 'auto' }] },
      { id: 'meetings', label: 'Meetings', caps: [{ id: 'meet', label: 'Run a video meeting', desc: 'Opens a room and joins it. Agent time is charged.', def: 'confirm', value: 'confirm' }] },
      { id: 'money', label: 'Money', caps: [{ id: 'pay', label: 'Payments', desc: 'Always asks, with two-factor authentication.', def: '2fa', value: '2fa', locked: 'Payments always need Confirm + 2FA.' }] }
    ],

    contact: { pref: 'whatsapp', whatsapp: D.user.phoneMasked, call: D.user.phoneMasked, email: 'a•••@samplerealty.example', whatsappVerified: true },
    number: { masked: D.org.inboundNumber.masked, assignedBy: 'Rohit S.', assignedAt: ist(15, '12:10') },
    defaults: { calls: 20, spend: 200 }
  };

  /* Tasks (§2.8). used = counters so far; limits per task. */
  function task(id, goal, state, o) { var t = { id: id, goal: goal, state: state, createdBy: 'Anika R.', contacts: { kind: 'me' }, channels: [], used: { calls: 0, spent: 0 }, limits: {}, plan: [], activity: [] }; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) t[k] = o[k]; return t; }
  A.data.tasks = [
    task('task_31', "Chase this week’s overdue EMIs", 'waiting', {
      full: "Chase this week’s overdue EMIs. Call each person whose EMI is overdue, agree a payment date, and send a payment link on WhatsApp to anyone who promises to pay. Message me a summary when it’s done.",
      createdAt: ist(0, '09:12'), since: ist(0, '11:20'), updatedAt: ist(0, '11:20'), progress: '3 of 4 steps', waitingOn: 'Send payment links',
      contacts: { kind: 'specific', label: '5 leads with an overdue EMI' }, channels: ['calls', 'whatsapp'],
      limits: { maxCalls: 10, spendCap: 200, finishBy: ist(-5, '18:00') }, used: { calls: 5, spent: 18.40 },
      plan: [
        { label: 'Find overdue EMIs in Leads', state: 'done', meta: '5 found' },
        { label: 'Call each person', state: 'done', meta: '5 calls · 3 promised to pay', evidence: 'View 5 calls' },
        { label: 'Send payment links on WhatsApp', state: 'waiting', meta: 'Waiting for you since 11:20 am' },
        { label: 'Message you a summary', state: 'todo' }],
      activity: [
        { at: ist(0, '09:12'), icon: 'play', text: 'You started the task' },
        { at: ist(0, '09:14'), icon: 'search', text: 'Found 5 leads with an overdue EMI' },
        { at: ist(0, '10:05'), icon: 'phone', tone: 'success', text: 'Called Lead 1042 · promised to pay by Monday · 2m 31s', link: true },
        { at: ist(0, '10:11'), icon: 'phone', text: 'Called Lead 1187 · promised to pay on 1 Oct · 1m 48s', link: true },
        { at: ist(0, '10:18'), icon: 'minus', text: 'Skipped Lead 1250 · on the DND list' },
        { at: ist(0, '10:40'), icon: 'phone', text: 'Called Lead 1203 · promised to pay today · 2m 05s', link: true },
        { at: ist(0, '11:20'), icon: 'pause', tone: 'warning', text: 'Asked you: Send payment links (3)' }] }),
    task('task_30', 'Call new leads and book site visits', 'working', {
      full: 'Call new leads and book site visits. Offer this weekend’s slots for Tower A and Tower B and book the visit in the calendar.',
      createdAt: ist(0, '10:30'), since: ist(0, '10:30'), updatedAt: ist(0, '11:23'), progress: '7 of 20 calls',
      contacts: { kind: 'view', label: 'Leads in New · 312' }, channels: ['calls'], limits: { maxCalls: 20, spendCap: 200, finishBy: ist(0, '19:00') }, used: { calls: 7, spent: 24.60 },
      plan: [{ label: 'Pick 20 new leads', state: 'done', meta: '20 picked · 2 on DND skipped' }, { label: 'Call each lead', state: 'progress', meta: '7 of 20 calls · 3 visits booked', evidence: 'View 7 calls' }, { label: 'Book visits in the calendar', state: 'progress', meta: '3 booked' }, { label: 'Message you a summary', state: 'todo' }],
      activity: [{ at: ist(0, '10:30'), icon: 'play', text: 'You started the task' }, { at: ist(0, '10:44'), icon: 'calendar-plus', tone: 'success', text: 'Booked a site visit for Lead 1311 · Sat 3 Oct, 11:00 am' }, { at: ist(0, '11:23'), icon: 'phone', text: 'Called Lead 1318 · call later · 1m 12s', link: true }] }),
    task('task_29', 'Weekly competitor price digest', 'scheduled', {
      full: 'Every Monday at 9 am, send me a summary of competitor price changes on WhatsApp.', createdAt: ist(6, '18:02'), since: ist(6, '18:02'), updatedAt: ist(6, '18:02'),
      progress: 'Next Mon 28 Sep, 9:00 am IST', next: ist(-1, '09:00'), contacts: { kind: 'me' }, channels: [], limits: { maxCalls: 1, spendCap: 50, repeat: 'Every Monday, 9:00 am IST' }, used: { calls: 0, spent: 0 },
      plan: [{ label: 'Read competitor listings', state: 'todo' }, { label: 'Compare with last week', state: 'todo' }, { label: 'Send you the digest on WhatsApp', state: 'todo' }],
      activity: [{ at: ist(6, '18:02'), icon: 'play', text: 'You scheduled the task' }, { at: ist(6, '09:00'), icon: 'message-circle', text: 'Sent you last week’s digest on WhatsApp' }] })
  ];
  var done = [
    ['task_28', 'Confirm Saturday site visits with 6 leads', 'done', 1, '18:10', '5 of 6 confirmed · summary sent to you', 21.60],
    ['task_27', 'Find a caterer for the Diwali open house', 'done', 2, '17:40', '3 quotes compared · Annapurna Caterers shortlisted', 6.20],
    ['task_26', 'Compare three CRM tools for our sales team', 'done', 3, '15:05', 'One-page comparison ready · called you with the result', 2.40],
    ['task_25', 'Remind festive-offer leads about the Sunday deadline', 'cancelled', 4, '14:40', 'Cancelled by you at 2:40 pm', 8.80],
    ['task_24', 'Call back leads who missed the Nashik webinar', 'failed', 5, '12:15', "Couldn’t reach the calling service.", 0],
    ['task_23', 'Collect RERA documents for Tower B buyers', 'done', 6, '16:20', '11 of 12 received · 1 reminder sent', 9.60],
    ['task_22', 'Send possession-date updates to Tower A buyers', 'done', 8, '12:30', '24 messages sent · 2 replies need you', 0],
    ['task_21', 'Book a photographer for the sample flat', 'done', 9, '11:00', 'Booked for Thu 24 Sep · quote attached', 4.80],
    ['task_20', 'Follow up on 9 home-loan applications', 'done', 12, '17:55', '7 of 9 submitted · 2 need documents', 19.20],
    ['task_19', 'Confirm Sunday visits with 4 leads', 'done', 14, '13:10', '4 of 4 confirmed', 11.00],
    ['task_18', 'Research co-working spaces near Baner', 'done', 18, '15:45', '5 options compared · summary sent to you', 0],
    ['task_17', 'Summarise last month’s call reports', 'done', 26, '10:20', 'Summary sent to you on WhatsApp', 0]
  ];
  done.forEach(function (r) {
    A.data.tasks.push(task(r[0], r[1], r[2], { full: r[1] + '.', createdAt: ist(r[3], '09:30'), since: ist(r[3], r[4]), updatedAt: ist(r[3], r[4]), progress: r[5], result: r[5], used: { calls: 0, spent: r[6] }, limits: { spendCap: 200 },
      plan: [{ label: 'Plan the steps', state: 'done' }, { label: 'Do the work', state: r[2] === 'done' ? 'done' : r[2] === 'failed' ? 'failed' : 'skipped', meta: r[5] }],
      activity: [{ at: ist(r[3], '09:30'), icon: 'play', text: 'You started the task' }, { at: ist(r[3], r[4]), icon: r[2] === 'done' ? 'check' : r[2] === 'failed' ? 'circle-x' : 'circle-slash', tone: r[2] === 'done' ? 'success' : r[2] === 'failed' ? 'danger' : null, text: r[5] }] }));
  });

  /* Pending decisions (§2.7, PA2). kind: message · call · money. */
  A.data.approvals = [
    { id: 'ap_1', taskId: 'task_31', kind: 'message', title: 'Send payment links to 3 people on WhatsApp', askedAt: ist(0, '11:20'), expiresAt: ist(0, '13:20'),
      recipients: [{ label: 'Lead 1042', city: 'Pune', due: 12400 }, { label: 'Lead 1187', city: 'Nashik', due: 8900 }, { label: 'Lead 1203', city: 'Pune', due: 6150 }],
      message: 'Namaste! Aapki ₹12,400 ki EMI 25 Sep ko due thi. Aap is link se abhi pay kar sakte hain: pay.samplerealty.example/emi/1042. Dhanyavaad, Sample Realty.', messageLang: 'hi-Latn',
      checks: [{ kind: 'adjusted', text: 'Lead 1250 is on the DND list · skipped', meta: '4 people reached this step; 3 get a message' }],
      impact: '3 WhatsApp messages from ' + D.org.inboundNumber.masked + ' · messages can’t be unsent', primary: 'Send 3 messages', done: 'Sent 3 messages' },
    { id: 'ap_2', taskId: 'task_30', kind: 'call', demo: true, title: 'Call 3 people who aren’t in this task’s list', askedAt: ist(0, '11:18'), expiresAt: ist(0, '15:18'),
      recipients: [{ label: 'Lead 1402', city: 'Pune', note: 'referred by Lead 1311' }, { label: 'Lead 1405', city: 'Thane', note: 'referred by Lead 1311' }, { label: 'Lead 1409', city: 'Pune', note: 'asked for a call back' }],
      checks: [{ kind: 'advisory', text: 'Calls only inside calling hours. Open until 5 pm IST today.' }],
      impact: '3 calls · about 1 to 2 min each · ₹7 to ₹15', primary: 'Review and call…', done: 'Calls scheduled for 3 people' },
    { id: 'ap_3', taskId: 'task_32', kind: 'money', demo: true, title: 'Pay ₹4,999 for a listing upgrade', askedAt: ist(0, '11:10'), expiresAt: ist(0, '23:59'),
      kv: [['Pay to', 'PropertyPortal.example · Featured listing'], ['Listing', 'Baner 2 BHK · 30 days'], ['Amount', '₹4,999.00 incl. GST']],
      checks: [{ kind: 'advisory', text: 'Payments always ask you, with two-factor authentication.' }],
      impact: '₹4,999.00 from the workspace card ending 4417 · refundable only by the portal', primary: 'Approve with 2FA…', done: 'Paid ₹4,999 for the listing upgrade' }
  ];
  A.data.demoTasks = [
    task('task_32', 'List the Baner 2 BHK on two property portals', 'waiting', { full: 'List the Baner 2 BHK on two property portals and upgrade the listing that gets more views.', createdAt: ist(0, '08:40'), since: ist(0, '11:10'), updatedAt: ist(0, '11:10'), progress: '2 of 3 steps', waitingOn: 'Pay for a listing upgrade', used: { calls: 0, spent: 0 }, limits: { spendCap: 5000 }, plan: [{ label: 'Create both listings', state: 'done', meta: '2 listings live' }, { label: 'Compare views after 2 days', state: 'done', meta: 'PropertyPortal.example: 3× views' }, { label: 'Pay for a listing upgrade', state: 'waiting', meta: 'Needs Confirm + 2FA' }] }),
    task('task_33', 'Remind 40 leads about Sunday open house', 'limit', { full: 'Remind 40 leads about the Sunday open house.', createdAt: ist(0, '09:00'), since: ist(0, '10:52'), updatedAt: ist(0, '10:52'), progress: 'Reached the ₹50 spend limit', used: { calls: 14, spent: 50 }, limits: { maxCalls: 40, spendCap: 50 }, plan: [{ label: 'Call each lead', state: 'blocked', meta: '14 of 40 calls · stopped at ₹50' }] }),
    task('task_34', 'Call walk-in visitors from Saturday', 'blocked', { full: 'Call walk-in visitors from Saturday and thank them.', createdAt: ist(0, '10:10'), since: ist(0, '10:10'), updatedAt: ist(0, '10:10'), progress: 'Needs calendar access to book visits', used: { calls: 0, spent: 0 }, limits: { maxCalls: 12, spendCap: 100 } }),
    task('task_35', 'Draft a brochure for the Baner launch', 'paused', { full: 'Draft a two-page brochure for the Baner launch.', createdAt: ist(0, '08:15'), since: ist(0, '11:02'), updatedAt: ist(0, '11:02'), progress: 'Paused by you at 11:02 am', used: { calls: 0, spent: 0 } }),
    task('task_36', 'Summarise today’s call reports', 'queued', { full: 'Summarise today’s call reports and message me.', createdAt: ist(0, '11:24'), since: ist(0, '11:24'), updatedAt: ist(0, '11:24'), progress: 'Starts in a moment', used: { calls: 0, spent: 0 } })
  ];
})(window);
