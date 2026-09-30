/* Vaani Labs prototype · Flow Designer · core (04-flow-designer parts 1 and 2).
   Namespace window.VaaniFlow (VF), the one step-type registry (FD1 §4.3, FD2 §7.2), workspace facts, the fictional flow
   data converted into the editor model, and pure graph helpers (call order, layers, diff, placement, Tidy).
   Step model: { id, no (stable #n, D7), type, title, x, y, f: {fields}, outs: [{ id, label, ex[], fb, res, to }] }. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, DATA = w.VAANI_DATA || {};
  var VF = w.VaaniFlow = { V: V, S: {} };
  VF.esc = V.util.esc;
  VF.$ = V.util.$; VF.$$ = V.util.$$;
  VF.store = { get: function (k) { return V.util.store.get('vaani:flow-designer:' + k); }, set: function (k, v) { V.util.store.set('vaani:flow-designer:' + k, v); } };

  VF.icon = function (n, s, o) { return V.icon(n, s, o); };

  /* ---------- tiny event bus ---------- */
  var bus = {};
  VF.on = function (e, fn) { (bus[e] = bus[e] || []).push(fn); };
  VF.emit = function (e, x) { (bus[e] || []).slice().forEach(function (f) { f(x); }); };

  /* ---------- the demo clock: 27 Sep 2026 11:24 am IST plus the real time since load ---------- */
  var T0 = Date.now();
  VF.nowIso = function () { return new Date(V.fmt.now().getTime() + (Date.now() - T0)).toISOString(); };
  VF.clock = function () { return V.fmt.time(VF.nowIso()); };

  /* ---------- the one step-type registry (FD1 §4.3 drawing, FD2 §7.2 names and palette descriptions) ---------- */
  VF.PHASES = {
    trigger: { name: 'Trigger', desc: 'When a call starts', tile: 'gt--ink', icon: 'phone-incoming' },
    logic: { name: 'Logic', desc: 'Listen and decide', tile: 'gt--line', icon: 'diamond' },
    action: { name: 'Action', desc: 'Do something for the caller', tile: 'gt--tint', icon: 'message-square' },
    outcome: { name: 'Outcome', desc: 'How the call ended', tile: 'gt--neutral', icon: 'flag' }
  };
  VF.PHASE_ORDER = ['trigger', 'logic', 'action', 'outcome'];
  VF.REG = {
    'trigger.inbound': { name: 'Inbound call', phase: 'trigger', icon: 'phone-incoming', desc: 'When someone calls your number', syn: ['incoming', 'inbound', 'number', 'call in'] },
    'trigger.outbound': { name: 'Outbound batch', phase: 'trigger', icon: 'list', desc: 'When a batch from Leads calls someone', syn: ['batch', 'campaign', 'dial', 'outbound'] },
    'trigger.api': { name: 'API or webhook', phase: 'trigger', icon: 'webhook', desc: 'When your system starts a call', syn: ['api', 'webhook', 'http', 'integration'] },
    'trigger.test': { name: 'Browser test', phase: 'trigger', icon: 'monitor', desc: 'When you test in the browser', syn: ['test', 'browser', 'try'] },
    'logic.question': { name: 'Question', phase: 'logic', icon: 'diamond', desc: 'Ask, then follow the answer', rows: 'answers', fb: 'No reply', syn: ['ask', 'sawaal', 'prompt', 'question', 'answer'] },
    'logic.branch': { name: 'Branch', phase: 'logic', icon: 'diamond', desc: 'Decide from what you know', rows: 'answers', fb: 'Else', syn: ['if', 'condition', 'rule', 'branch', 'decide'] },
    'logic.verify': { name: 'Verify caller', phase: 'logic', icon: 'diamond', desc: 'Check who is calling', rows: 'answers', fb: 'No reply', syn: ['verify', 'otp', 'identity', 'authenticate'] },
    'action.speak': { name: 'Speak', phase: 'action', icon: 'message-square', desc: 'Say a line', syn: ['say', 'greet', 'tell', 'speak', 'line', 'bolo'] },
    'action.knowledge': { name: 'Knowledge lookup', phase: 'action', icon: 'book-open', desc: 'Answer from your documents', rows: 'results', ok: 'Found', fb: 'Not found', syn: ['faq', 'docs', 'pdf', 'knowledge', 'search'] },
    'action.crm': { name: 'CRM lookup', phase: 'action', icon: 'database', desc: 'Fetch a record from your CRM', rows: 'results', ok: 'Found', fb: 'Not found', syn: ['crm', 'record', 'lookup', 'customer'] },
    'action.meeting': { name: 'Book meeting', phase: 'action', icon: 'calendar-plus', desc: 'Offer times and book one', rows: 'results', ok: 'Booked', fb: 'Not booked', syn: ['meeting', 'schedule', 'appointment', 'visit', 'book', 'calendar'] },
    'action.whatsapp': { name: 'Send WhatsApp', phase: 'action', icon: 'message-circle', desc: 'Send an approved template', syn: ['sms', 'message', 'whatsapp', 'text', 'link'] },
    'action.transfer': { name: 'Transfer to a person', phase: 'action', icon: 'phone-forwarded', desc: 'Hand the call to a person', rows: 'results', ok: 'Connected', fb: "Didn’t connect", syn: ['transfer', 'handoff', 'human', 'agent', 'rep', 'person'] },
    'outcome.end': { name: 'End with outcome', phase: 'outcome', icon: 'flag', desc: 'Finish and record the result', syn: ['end', 'hang up', 'finish', 'outcome', 'close'] },
    'unknown': { name: 'Unsupported step', phase: null, icon: 'circle-help', desc: '' }
  };
  /* Outcome presets (FD1 §8.2, FD2 §7.14): the outcome and the lead status it writes by default. */
  VF.OUTCOMES = [
    ['Interested', 'interested'], ['Callback', 'callback_due'], ['Not interested', 'not_interested'], ['No answer', 'not_reached'],
    ['Transferred', 'contacted'], ['Do not call', 'do_not_call'], ['Failed', null], ['Ended', null]
  ];
  VF.outcomeLead = function (o) { for (var i = 0; i < VF.OUTCOMES.length; i++) if (VF.OUTCOMES[i][0] === o) return VF.OUTCOMES[i][1]; return null; };
  VF.reg = function (s) { return VF.REG[s.type] || VF.REG.unknown; };
  VF.phaseOf = function (s) { return VF.reg(s).phase; };
  VF.width = function (s) { var p = VF.phaseOf(s); return p === 'trigger' ? 208 : p === 'logic' ? 256 : 240; };
  VF.leadWord = function (st) { var def = st && V.statusDef('lead', st); return def ? def[0] : null; };
  VF.tileClass = function (s) {
    var p = VF.phaseOf(s); if (!p) return 'gt--line';
    if (p !== 'outcome') return VF.PHASES[p].tile;
    var def = s.f.lead && V.statusDef('lead', s.f.lead); return 'gt--' + (def ? def[2] : 'neutral');
  };
  VF.typeLabel = function (s) { var r = VF.reg(s), p = r.phase; return p ? VF.PHASES[p].name + (r.name !== VF.PHASES[p].name && p !== 'outcome' ? ' · ' + r.name : '') : 'Unsupported step'; };

  /* ---------- workspace facts the rules and fields read (FD8, FD5; fictional) ---------- */
  VF.WS = {
    numbers: [
      { masked: '+91 80 •••• 2210', status: 'verified', flow: 'flow_7c21', note: 'answers with this flow' },
      { masked: '+91 22 •••• 7781', status: 'verified', flow: 'flow_3b90', note: "answers with 'Home-loan follow-up' v3" },
      { masked: '+91 20 •••• 4410', status: 'unverified', note: 'Not verified yet. Verify it in Phone setup.' }
    ],
    callerIds: ['+91 80 •••• 2210'],
    ownNumber: (DATA.user && DATA.user.phoneMasked) || '+91 •••••• 3012',
    calendar: 'connected', whatsapp: 'connected', crm: [{ id: 'crm_sample', name: 'Sample CRM', status: 'connected' }],
    templates: [
      { id: 'visit_confirm', status: 'pending', text: 'Namaste {{1}}, aapki site visit {{2}} ko confirm hai. Location: Sample Realty site office. – Sample Realty' },
      { id: 'visit_reminder', status: 'approved', text: 'Reminder: your site visit is on {{1}}. Reply 1 to confirm. – Sample Realty' },
      { id: 'brochure_link', status: 'approved', text: 'Namaste {{1}}, here is the brochure you asked for: {{2}} – Sample Realty' },
      { id: 'visit_old', status: 'rejected', text: 'Visit booked.', rejected: '20 Sep' }
    ],
    batch: { name: 'Weekend follow-ups', queued: 46 },
    queues: ['Any available rep', 'Site managers', 'Loan desk'],
    sources: (DATA.knowledge || []).filter(function (k) { return k.status === 'indexed'; }).map(function (k) { return k.name; })
  };

  /* ---------- variables (FD2 §8.1). Captured variables come from the flow itself. ---------- */
  VF.VARS = [
    { name: 'lead_name', label: 'Lead name', group: 'Lead', type: 'Text', sample: 'Anika' },
    { name: 'lead_city', label: 'Lead city', group: 'Lead', type: 'Text', sample: 'Pune' },
    { name: 'lead_language', label: 'Lead language', group: 'Lead', type: 'Text', sample: 'Hinglish' },
    { name: 'lead_email', label: 'Lead email', group: 'Lead', type: 'Text', sample: 'anika@example.com' },
    { name: 'budget', label: 'Budget', group: 'Lead', type: 'Number', sample: '95,00,000' },
    { name: 'call_direction', label: 'Call direction', group: 'Call', type: 'Option', sample: 'Outbound' },
    { name: 'call_date', label: 'Call date', group: 'Call', type: 'Date', sample: '27 Sep 2026' },
    { name: 'caller_number', label: 'Caller number', group: 'Call', type: 'Text', sample: '+91 •••••• 4821' },
    { name: 'callback_time', label: 'Callback time the caller asked for', group: 'Call', type: 'Date', sample: 'Tomorrow, 6 pm' },
    { name: 'company_name', label: 'Company name', group: 'Workspace', type: 'Text', sample: 'Sample Realty' },
    { name: 'agent_name', label: 'Agent name', group: 'Workspace', type: 'Text', sample: 'Vaani' }
  ];
  VF.captured = function (steps) {
    var out = [];
    steps.forEach(function (s) {
      var v = s.f && s.f.saveTo; if (v) out.push({ name: v, label: 'Captured by ' + s.title, group: 'Captured in this flow', type: s.type === 'logic.question' ? 'Option' : 'Date', by: s.id, sample: s.type === 'action.meeting' ? 'Sat, 11 am' : (s.outs[0] && s.outs[0].label) || 'Yes' });
      if (s.type === 'logic.verify') out.push({ name: 'verified', label: 'Verified by ' + s.title, group: 'Captured in this flow', type: 'Yes/No', by: s.id, sample: 'Yes' });
    });
    return out;
  };
  VF.allVars = function (steps) { return VF.captured(steps).concat(VF.VARS); };
  VF.varNames = function (text) { var out = [], re = /\{\{\s*([\w]+)\s*\}\}/g, m; while ((m = re.exec(text || ''))) out.push(m[1]); return out; };

  /* ---------- helpers ---------- */
  VF.clone = function (x) { return JSON.parse(JSON.stringify(x)); };
  VF.byId = function (steps) { var m = {}; steps.forEach(function (s) { m[s.id] = s; }); return m; };
  VF.examples = function (str) { return String(str || '').split(' · ').map(function (x) { return x.trim(); }).filter(Boolean); };
  VF.langOf = function (t) { return /[ऀ-ॿ]/.test(t) ? 'hi' : 'hi-Latn'; };
  VF.incoming = function (steps, id) { var r = []; steps.forEach(function (s) { s.outs.forEach(function (o) { if (o.to === id) r.push({ from: s, out: o }); }); }); return r; };
  VF.hash = function (steps) { var s = JSON.stringify(steps.map(function (x) { return [x.id, x.type, x.title, x.f, x.outs]; })), h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; };
  VF.outName = function (s, o) { var r = VF.reg(s); if (!r.rows) return 'Output'; return (r.rows === 'results' ? 'Result ' : 'Answer ') + o.label; };

  /* Call order (D7, FD2 §16.2): depth-first from the first Trigger, answers in listed order, unreachable steps last. */
  VF.callOrder = function (steps) {
    var by = VF.byId(steps), order = [], seen = {};
    function visit(s) { if (!s || seen[s.id]) return; seen[s.id] = 1; order.push(s.id); s.outs.forEach(function (o) { if (o.to) visit(by[o.to]); }); }
    var trig = steps.filter(function (s) { return VF.phaseOf(s) === 'trigger'; }).sort(function (a, b) { return a.no - b.no; });
    trig.forEach(visit);
    var reach = {}; order.forEach(function (id) { reach[id] = 1; });
    steps.slice().sort(function (a, b) { return a.no - b.no; }).forEach(function (s) { if (!seen[s.id]) visit(s); });
    return { order: order, reach: reach };
  };

  /* Layers: longest path from the Triggers; Triggers first, Outcomes last (FD1 D1, §9.4). */
  VF.backEdges = function (steps) {
    var by = VF.byId(steps), st = {}, back = {};
    function dfs(s) { st[s.id] = 1; s.outs.forEach(function (o) { var t = by[o.to]; if (!t) return; if (st[t.id] === 1) back[s.id + '|' + o.id] = 1; else if (!st[t.id]) dfs(t); }); st[s.id] = 2; }
    steps.filter(function (s) { return VF.phaseOf(s) === 'trigger'; }).sort(function (a, b) { return a.no - b.no; }).forEach(function (s) { if (!st[s.id]) dfs(s); });
    steps.forEach(function (s) { if (!st[s.id]) dfs(s); });
    return back;
  };
  VF.layers = function (steps) {
    var by = VF.byId(steps), L = {}, back = VF.backEdges(steps);
    steps.forEach(function (s) { L[s.id] = VF.phaseOf(s) === 'trigger' ? 0 : 1; });
    for (var pass = 0; pass < steps.length + 1; pass++) {
      var changed = false;
      steps.forEach(function (s) { s.outs.forEach(function (o) { var t = by[o.to]; if (!t || back[s.id + '|' + o.id] || VF.phaseOf(t) === 'trigger') return; if (L[s.id] + 1 > L[t.id]) { L[t.id] = L[s.id] + 1; changed = true; } }); });
      if (!changed) break;
    }
    var max = 0; steps.forEach(function (s) { if (VF.phaseOf(s) !== 'outcome') max = Math.max(max, L[s.id]); });
    steps.forEach(function (s) { if (VF.phaseOf(s) === 'outcome') L[s.id] = max + 1; });
    return L;
  };

  /* Size estimate in flow px at touch height (answer and result rows counted at 44, FD1 §6.1), used by Tidy and placement. */
  VF.estimate = function (s) {
    var r = VF.reg(s), h = 12 + 20 + 20 + 10;
    if (s.f && s.f.prompt && r.phase !== 'trigger' && r.phase !== 'outcome') h += 42;
    h += 22; var rows = r.rows || s.type === 'unknown' ? s.outs.length || 1 : 0;
    return { w: VF.width(s), h: h + rows * 44 };
  };
  VF.boxOf = function (s) { var e = s._h ? { w: VF.width(s), h: Math.max(s._h, VF.estimate(s).h) } : VF.estimate(s); return { x: s.x, y: s.y, w: e.w, h: e.h }; };
  function hit(a, b, m) { return a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y; }
  VF.overlaps = function (steps) { var ids = {}; for (var i = 0; i < steps.length; i++) for (var j = i + 1; j < steps.length; j++) if (hit(VF.boxOf(steps[i]), VF.boxOf(steps[j]), 0)) { ids[steps[i].id] = 1; ids[steps[j].id] = 1; } return Object.keys(ids).length; };
  /* Placement never overlaps (FD1 §8.1): walk down then up the column in 16 px steps, else below the lowest step. */
  VF.place = function (steps, s, x, y) {
    var box = VF.estimate(s), snap = function (v) { return Math.round(v / 16) * 16; };
    x = snap(x); y = snap(y);
    function free(yy) { var b = { x: x, y: yy, w: box.w, h: box.h }; return !steps.some(function (o) { return o !== s && hit(b, VF.boxOf(o), 24); }); }
    for (var k = 0; k < 60; k++) { if (free(y + k * 16)) return { x: x, y: y + k * 16 }; if (k && free(y - k * 16)) return { x: x, y: y - k * 16 }; }
    var low = 0; steps.forEach(function (o) { var b = VF.boxOf(o); if (b.x < x + box.w && b.x + b.w > x) low = Math.max(low, b.y + b.h); });
    return { x: x, y: snap(low + 48) };
  };
  /* Tidy (FD1 §9.4): layered, left to right, rank gap 128, every layer at least 240 wide, node gap 24 at touch height. */
  VF.tidy = function (steps, only) {
    var L = VF.layers(steps), cols = {}, co = VF.callOrder(steps).order, pos = {};
    co.forEach(function (id, i) { pos[id] = i; });
    steps.forEach(function (s) { if (only && !only[s.id]) return; (cols[L[s.id]] = cols[L[s.id]] || []).push(s); });
    var keys = Object.keys(cols).map(Number).sort(function (a, b) { return a - b; }), x = 0, res = {}, heights = [];
    keys.forEach(function (k) { cols[k].sort(function (a, b) { return pos[a.id] - pos[b.id]; }); var hsum = cols[k].reduce(function (t, s) { return t + VF.estimate(s).h + 24; }, -24); heights.push(hsum); });
    var maxH = Math.max.apply(null, heights.concat([0]));
    var ox = 0, oy = 0; if (only) { var sel = steps.filter(function (s) { return only[s.id]; }); ox = Math.min.apply(null, sel.map(function (s) { return s.x; })); oy = Math.min.apply(null, sel.map(function (s) { return s.y; })); }
    keys.forEach(function (k, i) {
      var colW = Math.max(240, Math.max.apply(null, cols[k].map(VF.width))), y = Math.round((maxH - heights[i]) / 2 / 16) * 16;
      cols[k].forEach(function (s) { res[s.id] = { x: ox + x, y: oy + y }; y += Math.ceil((VF.estimate(s).h + 24) / 16) * 16; });
      x += colW + 128;
    });
    return res;
  };

  /* ---------- diff between the Draft and a version (FD2 §4.1: steps and settings that differ, not edits) ---------- */
  var FIELD_WORDS = { prompt: 'prompt edited', hours: 'meeting hours changed', template: 'template changed', outcome: 'outcome changed', lead: 'lead status changed', numbers: 'numbers changed', batch: 'batch changed', say: 'closing line edited', target: 'destination changed', mtype: 'meeting type changed' };
  VF.diff = function (draft, base) {
    var bd = VF.byId(base || []), dd = VF.byId(draft), rows = [], moved = 0;
    draft.forEach(function (s) {
      var b = bd[s.id];
      if (!b) { rows.push({ kind: 'added', id: s.id, label: s.title, summary: 'new ' + VF.reg(s).name.toLowerCase() + ' step', by: s.by || 'you' }); return; }
      var what = [];
      if (s.title !== b.title) what.push('renamed from "' + b.title + '"');
      if (s.type !== b.type) what.push('converted to ' + VF.reg(s).name);
      Object.keys(Object.assign({}, s.f, b.f)).forEach(function (k) { if (JSON.stringify(s.f[k]) !== JSON.stringify(b.f[k])) what.push(FIELD_WORDS[k] || k.replace(/([A-Z])/g, ' $1').toLowerCase() + ' changed'); });
      var so = JSON.stringify(s.outs.map(function (o) { return [o.id, o.label, o.ex]; })), bo = JSON.stringify(b.outs.map(function (o) { return [o.id, o.label, o.ex]; }));
      if (so !== bo) what.push('answers changed');
      if (JSON.stringify(s.outs.map(function (o) { return o.to; })) !== JSON.stringify(b.outs.map(function (o) { return o.to; }))) what.push('connections changed');
      if (what.length) rows.push({ kind: 'changed', id: s.id, label: s.title, summary: what.filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', '), by: s.by || 'you' });
      else if (s.x !== b.x || s.y !== b.y) moved++;
    });
    (base || []).forEach(function (b) { if (!dd[b.id]) rows.push({ kind: 'removed', id: b.id, label: b.title, summary: 'step deleted', by: 'you', ghost: b }); });
    var steps = rows.length; if (moved && steps) rows.push({ kind: 'layout', id: null, label: 'Layout tidied', summary: moved + ' step' + (moved === 1 ? '' : 's') + ' moved', by: 'you' });
    return { rows: rows, count: steps, added: rows.filter(function (r) { return r.kind === 'added'; }).length, changed: rows.filter(function (r) { return r.kind === 'changed'; }).length, removed: rows.filter(function (r) { return r.kind === 'removed'; }).length };
  };
})(window, document);
