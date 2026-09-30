/* Vaani Labs prototype · Flow Designer · data: VAANI_DATA.flows → the editor model, Live and old versions, and the
   prototype scenarios (?state=…). Everything is fictional; flows other than flows[0] get a generated graph of their
   stepCount so the FlowSwitcher opens something real. */
(function (w) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, DATA = w.VAANI_DATA || {};
  var ist = DATA._util ? DATA._util.ist : function () { return V.fmt.now().toISOString(); };

  function out(id, to, extra) { var o = { id: id, to: to || null }; for (var k in extra) o[k] = extra[k]; return o; }
  function ans(a) { return out(a.id, a.target, { label: a.label, ex: a.fallback ? [] : VF.examples(a.examples), fb: !!a.fallback }); }

  /* flows[0], "Site-visit qualifier": Live v7 plus a v8 Draft with 3 changes (data.js diff). */
  function siteVisit(f) {
    var by = {}; f.nodes.forEach(function (n) { by[n.id] = n; });
    var n3 = by.n3, n4 = by.n4;
    var steps = [
      { id: 'n1', no: 1, type: 'trigger.outbound', title: 'Outbound batch', x: 0, y: 0, f: { batch: 'Weekend follow-ups', callerId: '+91 80 •••• 2210', hours: 'Mon to Sat, 10 am to 7 pm IST', retries: 1, interval: '2 h', concurrency: 5, ifNobody: 'No answer', voicemail: 'Hang up' }, outs: [out('out', 'n3')] },
      { id: 'n2', no: 2, type: 'trigger.inbound', title: 'Inbound call', x: 0, y: 176, f: { numbers: ['+91 80 •••• 2210'], when: 'Always', outside: 'Say a message and end' }, outs: [out('out', 'n3')] },
      { id: 'n3', no: 3, type: 'logic.question', title: n3.title, x: n3.x, y: n3.y, by: 'you',
        f: { prompt: '{{lead_name}} ji, aapne metro ke paas 2 BHK ke baare mein poocha tha. Kya aap is weekend site visit karna chahenge? Hum Saturday aur Sunday dono din khule hain.', lang: 'hi-Latn', wait: 6, unclear: 'Ask again once', saveTo: 'visit_intent', interrupt: true },
        outs: n3.answers.map(ans) },
      { id: 'n4', no: 4, type: 'action.meeting', title: n4.title, x: n4.x, y: n4.y, by: 'Rohit S.',
        f: { prompt: 'Saturday ya Sunday, kaunsa din aapke liye theek rahega?', mtype: 'In person', address: 'Sample Realty site office, Baner, Pune', length: '30 min', offer: 'Set hours', hours: 'Sat and Sun, 10 am to 6 pm IST', confirmWa: true, template: 'visit_confirm', email: false, saveTo: 'meeting_time' },
        outs: [out('booked', 'n6', { label: 'Booked', res: 'ok' }), out('notbooked', 'n7', { label: 'Not booked', res: 'fail', fb: true })] },
      { id: 'n5', no: 5, type: 'action.speak', title: 'Polite close', x: 720, y: 232, by: 'you', f: { prompt: 'Koi baat nahi. Dhanyavaad, aapka din shubh ho.', lang: 'hi-Latn', interrupt: true }, outs: [out('out', 'n8')] },
      { id: 'n6', no: 6, type: 'outcome.end', title: 'Visit booked', x: 1088, y: 0, f: { outcome: 'Interested', lead: 'converted', say: 'Dhanyavaad! Aapki visit confirm ho gayi hai.', note: 'Visit booked for {{meeting_time}}.' }, outs: [] },
      { id: 'n7', no: 7, type: 'outcome.end', title: 'Callback set', x: 1088, y: 136, f: { outcome: 'Callback', lead: 'callback_due', cbTime: 'callback_time', say: 'Theek hai, hum aapko baad mein call karenge.' }, outs: [] },
      { id: 'n8', no: 8, type: 'outcome.end', title: 'Not interested', x: 1088, y: 272, f: { outcome: 'Not interested', lead: 'not_interested', say: '' }, outs: [] },
      { id: 'n9', no: 9, type: 'outcome.end', title: 'No answer', x: 1088, y: 400, f: { outcome: 'No answer', lead: 'not_reached', say: '' }, outs: [] }
    ];
    var live = VF.clone(steps);
    live.forEach(function (s) { delete s.by; });
    live[2].f.prompt = '{{lead_name}} ji, aapne metro ke paas 2 BHK ke baare mein poocha tha. Kya aap is hafte site visit karna chahenge?';
    live[3].f.hours = 'Mon to Sat, 10 am to 6 pm IST';
    live[4].f.prompt = 'Koi baat nahi. Aapka samay dene ke liye dhanyavaad. Aapka din shubh ho, namaste.';
    return { steps: steps, live: live };
  }

  /* A plausible graph of n steps for the other flows (Trigger → Greeting → Question → chain → Outcomes). */
  var POOL = [
    ['action.crm', 'Find the customer record', {}], ['action.speak', 'Share the details', { prompt: 'Main aapko details bata deti hoon: {{company_name}} ki taraf se yeh offer is mahine tak hai.' }],
    ['action.knowledge', 'Answer from the price sheet', { searchIn: 'All indexed sources', lookUp: 'What the caller asked', style: 'Read the passage closely' }],
    ['action.whatsapp', 'Send the link on WhatsApp', { template: 'brochure_link', sendTo: "Caller’s number", tell: "I’ve sent the details on WhatsApp." }],
    ['logic.question', 'Confirm the preferred time', { prompt: 'Aapke liye kaunsa samay theek rahega, subah ya shaam?', wait: 6, unclear: 'Ask again once' }],
    ['action.speak', 'Confirm the next step', { prompt: 'Bahut badhiya. Hamari team aapse jaldi sampark karegi.' }]
  ];
  function generated(f, n) {
    var inbound = /support|faq|enquiry/i.test(f.name), steps = [], no = 0, x = 0;
    function add(type, title, fields, outs) { no += 1; var s = { id: 's' + no, no: no, type: type, title: title, x: 0, y: 0, f: fields || {}, outs: outs || [] }; steps.push(s); return s; }
    var trig = add(inbound ? 'trigger.inbound' : 'trigger.outbound', inbound ? 'Inbound call' : 'Outbound batch', inbound ? { numbers: ['+91 22 •••• 7781'], when: 'Always', outside: 'Say a message and end' } : { batch: f.name + ' batch', callerId: '+91 80 •••• 2210', hours: 'Mon to Sat, 10 am to 7 pm IST', retries: 1, interval: '2 h', concurrency: 5, ifNobody: 'No answer', voicemail: 'Hang up' }, [out('out')]);
    var withGreet = n >= 6, withLater = n >= 7, chainLen = Math.max(0, n - 5 - (withGreet ? 1 : 0) - (withLater ? 1 : 0));
    var prev = trig;
    if (withGreet) { var g = add('action.speak', 'Greeting', { prompt: 'Namaste {{lead_name}} ji, main {{agent_name}}, {{company_name}} se bol rahi hoon.', interrupt: true }, [out('out')]); prev.outs[0].to = g.id; prev = g; }
    var q = add('logic.question', 'Ask about ' + f.name.toLowerCase().replace(/ ·.*$/, ''), { prompt: '{{lead_name}} ji, kya aap ' + f.name.toLowerCase() + ' ke baare mein baat karne ke liye do minute de sakte hain?', wait: 6, unclear: 'Ask again once', interrupt: true },
      [out('yes', null, { label: 'Yes', ex: ['haan, boliye', 'हाँ'] })].concat(withLater ? [out('later', null, { label: 'Later', ex: ['baad mein', 'abhi busy hoon'] })] : []).concat([out('no', null, { label: 'No', ex: ['nahi', 'नहीं'] }), out('noreply', null, { label: 'No reply', ex: [], fb: true })]));
    prev.outs[0].to = q.id;
    var br = chainLen > 6 && withLater ? ['yes', 'later', 'no'] : ['yes'], chains = { yes: [], later: [], no: [] };
    for (var i = 0; i < chainLen; i++) {
      var p = POOL[i % POOL.length], title = p[1] + (i >= POOL.length ? ' ' + (Math.floor(i / POOL.length) + 1) : '');
      var r = VF.REG[p[0]], outs = r.rows === 'results' ? [out('ok', null, { label: r.ok, res: 'ok' }), out('fail', '__not', { label: r.fb, res: 'fail', fb: true })] : r.rows === 'answers' ? [out('yes', null, { label: 'Morning', ex: ['subah', 'morning'] }), out('no', null, { label: 'Evening', ex: ['shaam', 'evening'] }), out('noreply', '__na', { label: 'No reply', ex: [], fb: true })] : [out('out')];
      var s = add(p[0], title, VF.clone(p[2]), outs);
      if (p[0] === 'action.crm') { s.f.connector = 'crm_sample'; s.f.findBy = "Caller’s phone number"; }
      var key = br.length === 1 ? 'yes' : ['yes', 'later', 'no'][i % 3], ch = chains[key];
      if (ch.length) ch[ch.length - 1].outs.forEach(function (o) { if (!o.to) o.to = s.id; });
      ch.push(s);
    }
    var yes = add('outcome.end', 'Interested', { outcome: 'Interested', lead: 'interested' }), not = add('outcome.end', 'Not interested', { outcome: 'Not interested', lead: 'not_interested' });
    var cb = withLater ? add('outcome.end', 'Callback set', { outcome: 'Callback', lead: 'callback_due', cbTime: 'callback_time' }) : null, na = add('outcome.end', 'No answer', { outcome: 'No answer', lead: 'not_reached' });
    var ends = { yes: yes, later: cb, no: not };
    Object.keys(chains).forEach(function (k) { var ch = chains[k]; if (ch.length) ch[ch.length - 1].outs.forEach(function (o) { if (!o.to) o.to = ends[k].id; }); });
    steps.forEach(function (s) { s.outs.forEach(function (o) { if (o.to === '__not') o.to = not.id; if (o.to === '__na') o.to = na.id; }); });
    q.outs.forEach(function (o) { var k = o.id; o.to = chains[k] && chains[k].length ? chains[k][0].id : k === 'yes' ? yes.id : k === 'later' ? cb.id : k === 'no' ? not.id : na.id; });
    var pos = VF.tidy(steps); steps.forEach(function (s) { s.x = pos[s.id].x; s.y = pos[s.id].y; });
    void x; return steps;
  }

  /* The flow list meta the header, switcher and Publish gate read. */
  function metaOf(f, scen) {
    var live = f.live && scen !== 'unpublished' && scen !== 'blank' ? { version: f.live.version, since: f.live.since, publishedBy: f.live.publishedBy || 'Rohit S.', usedBy: f.id === 'flow_7c21' ? [{ kind: 'inbound', label: '+91 80 •••• 2210', detail: 'Mon to Sat, 10 am to 7 pm IST' }, { kind: 'batch', label: "Batch 'Weekend follow-ups'", detail: '46 leads queued · the next call uses v{next}' }, { kind: 'default', label: 'Workspace default flow', detail: 'Cockpit, Leads and new batches start with it' }] : [{ kind: 'batch', label: 'Outbound batches', detail: 'the next call uses v{next}' }] } : null;
    return { id: f.id, shortId: f.shortId, name: f.name, languages: ['hi', 'en'], voice: 'vaani', category: 'Sales', visibility: 'Workspace', live: live, owner: 'Anika R.' };
  }
  function versionsOf(f, live) {
    if (!live) return [];
    var v = live.version, out = [{ v: v, from: live.since, to: null, by: live.publishedBy, note: f.id === 'flow_7c21' ? 'Weekend slots on the visit question' : 'Published', tested: 'Tested: test call', calls: 412 }];
    var notes = ['Hindi greeting', 'Added callback path', 'Shorter pitch', 'Added No reply path', 'Migrated · published before checks existed'];
    for (var i = 1; i < Math.min(v, 5); i++) out.push({ v: v - i, from: ist(15 + i * 6, '12:05'), to: out[i - 1].from, by: i % 2 ? 'Rohit S.' : 'Anika R.', note: v - i === 1 ? notes[4] : notes[(i - 1) % 4], tested: i === 2 ? 'Published without testing: urgent fix' : 'Tested: text test', calls: [1204, 356, 188, 97][i - 1] });
    return out;
  }

  /* Scenario mutations on the Site-visit graph (prototype states). */
  function applyScenario(scen, m) {
    var by = VF.byId(m.steps);
    if (scen === 'errors') {
      by.n3.outs[1].to = null;
      m.steps.push({ id: 'n10', no: 10, type: 'action.whatsapp', title: 'Send brochure', x: 720, y: 480, by: 'you', f: { template: 'brochure_link', sendTo: "Caller’s number", tell: "I’ve sent the brochure on WhatsApp." }, outs: [{ id: 'out', to: 'n8' }] });
      m.maxNo = 10;
    }
    if (scen === 'unsupported') {
      m.steps.push({ id: 'n10', no: 10, type: 'unknown', raw: 'ambulance_call', title: 'Call ambulance', x: 1088, y: 520, f: { stored: 'Connect the caller to emergency services.' }, outs: [] });
      by.n5.outs[0].to = 'n10'; m.steps[m.steps.length - 1].outs = [{ id: 'out', to: 'n8' }]; by.n5.y = 232; m.maxNo = 10;
      m.steps[m.steps.length - 1].x = 1088; m.steps[m.steps.length - 1].y = 520;
    }
    if (scen === 'overlap') { by.n5.y = 120; by.n5.x = 752; }
    if (scen === 'topdown') { m.steps.forEach(function (s, i) { s.x = 320 + (i % 2) * 40; s.y = i * 170; }); }
    if (scen === 'clean') { m.steps = VF.clone(m.live); }
  }

  VF.loadFlow = function (flowId, scen) {
    var list = (DATA.flows || []).filter(function (f) { return !f.archived; });
    var f = list.filter(function (x) { return x.id === flowId; })[0] || list[0];
    if (scen === 'large' && f.id === 'flow_7c21') f = list[1];
    var m = { meta: metaOf(f, scen), maxNo: 0 };
    if (scen === 'blank') {
      m.meta = { id: 'flow_n3w1', shortId: 'flow_n3w1', name: 'Site visit follow-up', languages: ['hi', 'en'], voice: 'vaani', category: 'Sales', visibility: 'Workspace', live: null, owner: 'Anika R.' };
      m.steps = [
        { id: 'b1', no: 1, type: 'trigger.outbound', title: 'Outbound batch', x: 0, y: 64, f: { batch: '', callerId: '+91 80 •••• 2210', hours: 'Mon to Sat, 10 am to 7 pm IST', retries: 1, interval: '2 h', concurrency: 5, ifNobody: 'No answer', voicemail: 'Hang up' }, outs: [{ id: 'out', to: 'b2' }] },
        { id: 'b2', no: 2, type: 'outcome.end', title: 'End with outcome', x: 624, y: 64, f: { outcome: null, lead: null }, outs: [] }
      ];
      m.live = null; m.maxNo = 2; m.versions = []; m.blank = true; return m;
    }
    if (f.id === 'flow_7c21') { var sv = siteVisit(f); m.steps = sv.steps; m.live = sv.live; m.maxNo = 9; }
    else { m.steps = generated(f, scen === 'large' ? 26 : f.stepCount || 7); m.live = f.live ? VF.clone(m.steps) : null; m.maxNo = m.steps.length; if (f.draft && f.draft.changes && m.live) { m.steps[1].f.prompt = (m.steps[1].f.prompt || '') + ' Aaj ka din kaisa raha?'; } }
    if (!m.meta.live) m.live = null;
    if (f.id === 'flow_7c21') applyScenario(scen, m);
    m.maxNo = Math.max(m.maxNo, m.steps.reduce(function (a, s) { return Math.max(a, s.no); }, 0));
    m.versions = versionsOf(f, m.meta.live);
    m.draftEditedAt = (f.draft && f.draft.editedAt) || f.editedAt;
    return m;
  };
  /* Content of an old version (read-only view, Restore as draft, Roll back): Live with the wording it had then. */
  VF.versionSteps = function (m, v) {
    /* FD-R3-01: a version published (or replaced) in this session keeps a snapshot of its content; only versions older than the
       demo data fall back to the reconstructed wording below */
    var snap = (m.versions || []).filter(function (x) { return x.v === v && x.steps; })[0];
    if (snap) return VF.clone(snap.steps);
    var steps = VF.clone(m.live || m.steps);
    if (m.meta.live && v < m.meta.live.version && steps[2] && steps[2].f.prompt) {
      steps[2].f.prompt = v <= 5 ? '{{lead_name}} ji, kya aap hamare naye project ki site visit karna chahenge?' : 'Namaste {{lead_name}} ji. Kya aap is hafte site visit karna chahenge?';
      if (v <= 5 && steps[3] && steps[3].f) steps[3].f.hours = 'Mon to Fri, 10 am to 6 pm IST';
    }
    return steps;
  };
  VF.flowList = function () { return (DATA.flows || []).filter(function (f) { return !f.archived; }); };
})(window);
