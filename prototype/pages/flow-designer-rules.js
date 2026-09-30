/* Vaani Labs prototype · Flow Designer · the one rule set (FD2 §12.1–12.2) and "What the agent is told" (FD2 §7.1, §11).
   Messages name steps by their stable number and label ("#5 Ask about budget"), never by a raw id (F-FLOW-004). */
(function (w) {
  'use strict';
  var VF = w.VaaniFlow;
  var PROMPT_FIELDS = { prompt: 'Agent says', say: 'Say before ending', tell: 'Tell the caller', note: 'Note to the lead', unclearAgain: 'Ask again with' };

  function lev(a, b) { var m = [], i, j; for (i = 0; i <= b.length; i++) m[i] = [i]; for (j = 0; j <= a.length; j++) m[0][j] = j; for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++) m[i][j] = Math.min(m[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1), m[i][j - 1] + 1, m[i - 1][j] + 1); return m[b.length][a.length]; }
  VF.suggestVar = function (name, known) { var best = null, bd = 3; known.forEach(function (k) { var dd = lev(name, k); if (dd < bd) { bd = dd; best = k; } }); return best; };

  VF.validate = function (steps) {
    var issues = [], co = VF.callOrder(steps), by = VF.byId(steps), n = 0;
    var known = VF.allVars(steps).map(function (v) { return v.name; });
    function add(level, rule, s, msg, extra) { n += 1; var i = { id: 'i' + n, level: level, rule: rule, stepId: s ? s.id : null, msg: msg }; for (var k in extra) i[k] = extra[k]; issues.push(i); }
    function nm(s) { return '#' + s.no + ' ' + s.title; }
    if (!steps.some(function (s) { return VF.phaseOf(s) === 'trigger'; })) add('error', 'E01', null, 'Add a trigger so calls can start this flow.');
    if (!steps.some(function (s) { return VF.phaseOf(s) === 'outcome'; })) add('error', 'E03', null, 'Add an outcome so every call ends somewhere.');
    var titles = {};
    steps.forEach(function (s) {
      var r = VF.reg(s), p = r.phase, f = s.f || {};
      (titles[s.title.trim().toLowerCase()] = titles[s.title.trim().toLowerCase()] || []).push(s);
      if (s.type === 'unknown') { add('error', 'E14', s, nm(s) + ' uses an unsupported type.', { short: 'This step uses a type Vaani doesn’t recognise. Convert it or delete it.' }); }
      if (p !== 'trigger' && !co.reach[s.id]) add('error', 'E02', s, nm(s) + " can’t be reached from any trigger.", { short: "Can’t be reached from any trigger.", unreachable: true });
      s.outs.forEach(function (o) {
        if (o.to && by[o.to]) return;
        if (o.fb) add('error', 'E06', s, nm(s) + ': "' + o.label + '" isn’t connected.', { out: o.id, short: '"' + o.label + '" isn’t connected.' });
        else if (o.label) add('error', 'E03', s, nm(s) + ': ' + (r.rows === 'results' ? 'result' : 'answer') + ' "' + o.label + '" isn’t connected.', { out: o.id, short: (r.rows === 'results' ? 'Result' : 'Answer') + ' "' + o.label + '" isn’t connected.' });
        else add('error', 'E03', s, nm(s) + ' isn’t connected to a next step.', { out: o.id, short: 'Isn’t connected to a next step.' });
      });
      if ((s.type === 'logic.question' || s.type === 'action.speak' || s.type === 'logic.verify' || s.type === 'action.meeting') && !String(f.prompt || '').trim()) add('error', 'E05', s, nm(s) + (s.type === 'action.speak' ? ' has nothing to say.' : ': add what the agent asks.'), { field: 'prompt', short: s.type === 'action.speak' ? 'Add what the agent says.' : 'Add what the agent asks.' });
      if (s.type === 'action.transfer' && !String(f.say || '').trim()) add('error', 'E05', s, nm(s) + ': add what the agent says before transferring.', { field: 'say', short: 'Add what the agent says before transferring.' });
      if (r.rows === 'answers' && !s.outs.some(function (o) { return !o.fb; })) add('error', 'E07', s, nm(s) + (s.type === 'logic.branch' ? ' has no cases.' : ' has no answers to listen for.'), { field: 'answers', short: 'Add at least one answer.' });
      var seen = {}; s.outs.forEach(function (o) { if (!o.label || o.fb) return; var k = o.label.trim().toLowerCase(); if (seen[k]) add('error', 'E08', s, 'Two answers in "' + s.title + '" are called "' + o.label + '".', { field: 'answers', out: o.id, short: 'Two answers are called "' + o.label + '".' }); seen[k] = 1; });
      Object.keys(s.invalid || {}).forEach(function (k) { add('error', k === 'number' ? 'E10' : 'E09', s, nm(s) + ': ' + s.invalid[k], { field: k, short: s.invalid[k] }); });
      Object.keys(PROMPT_FIELDS).forEach(function (k) {
        VF.varNames(f[k]).forEach(function (v) { if (known.indexOf(v) < 0) { var sg = VF.suggestVar(v, known); add('error', 'E11', s, '{{' + v + '}} in ' + nm(s) + ' isn’t a variable.' + (sg ? ' Did you mean {{' + sg + '}}?' : ''), { field: k, short: '{{' + v + '}} isn’t a variable.' + (sg ? ' Did you mean {{' + sg + '}}?' : ''), fix: sg ? [v, sg] : null }); } });
      });
      if (s.type === 'action.whatsapp' || (s.type === 'action.meeting' && f.confirmWa)) {
        var t = VF.WS.templates.filter(function (x) { return x.id === f.template; })[0];
        if (!t) add('error', 'E12', s, 'Choose a template for ' + nm(s) + '.', { field: 'template', short: 'Choose a WhatsApp template.' });
        else if (t.status === 'rejected') add('error', 'E12', s, nm(s) + ': "' + t.id + '" was rejected on ' + t.rejected + '. Pick another.', { field: 'template', short: '"' + t.id + '" was rejected. Pick another.' });
        else if (t.status === 'pending') add('warning', 'W01', s, nm(s) + ': WhatsApp template "' + t.id + '" is pending approval. Bookings still work; the confirmation waits.', { field: 'template', short: 'Template "' + t.id + '" is pending approval. Calls continue; the message waits.' });
      }
      if (s.type === 'action.crm' && !f.connector) add('error', 'E13', s, 'Choose a connector for ' + nm(s) + '.', { field: 'connector', short: 'Choose a connector.' });
      if (s.type === 'action.meeting' && f.mtype === 'In person' && !String(f.address || '').trim()) add('error', 'E17', s, nm(s) + ' needs an address for in-person meetings.', { field: 'address', short: 'Add an address for in-person meetings.' });
      if (s.type === 'logic.question') s.outs.forEach(function (o) { if (!o.fb && (o.ex || []).length < 2) add('warning', 'W04', s, nm(s) + ': answer "' + o.label + '" has ' + ((o.ex || []).length ? 'one example' : 'no examples') + '. Add 2 or more so the agent recognises it.', { field: 'answers', out: o.id, short: 'Answer "' + o.label + '" needs 2 or more examples.' }); });
      if (s.type === 'trigger.inbound' && !(f.numbers || []).length) add('warning', 'W08', s, '"' + s.title + '" doesn’t answer any number yet.', { field: 'numbers', short: 'This trigger doesn’t answer any number yet.' });
      if (s.type === 'action.speak' && String(f.prompt || '').length > 450) add('warning', 'W09', s, nm(s) + ' runs about ' + Math.round(String(f.prompt).length / 14) + ' s. Split it.', { field: 'prompt', short: 'Long lines lose callers. Split this into two steps or ask a question.' });
      if (s.type === 'outcome.end' && f.outcome === 'Callback' && !f.cbTime) add('warning', 'W10', s, nm(s) + ': callbacks need a time. Save one on an earlier question.', { field: 'cbTime', short: 'Callbacks need a time. Save one on an earlier question.' });
    });
    Object.keys(titles).forEach(function (k) { var l = titles[k]; if (l.length > 1) l.forEach(function (s) { add('warning', 'W05', s, l.length + ' steps are called "' + s.title + '" (' + l.map(function (x) { return '#' + x.no; }).join(' and ') + ').', { short: l.length + ' steps share this name.' }); }); });
    var pos = {}; co.order.forEach(function (id, i) { pos[id] = i; });
    issues.sort(function (a, b) { var pa = a.stepId ? pos[a.stepId] : -1, pb = b.stepId ? pos[b.stepId] : -1; return pa - pb || (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1); });
    return issues;
  };
  VF.counts = function (issues) { var e = 0, wn = 0; issues.forEach(function (i) { if (i.level === 'error') e++; else wn++; }); return { errors: e, warnings: wn }; };
  /* The IssuesChip words come from the validation status map (never typed by hand). */
  VF.issueWords = function (c) {
    function word(dom, v, n) { return V_def(dom, v).replace('{n}', n); }
    var parts = [];
    if (c.errors) parts.push(word('validation', c.errors === 1 ? 'error' : 'errors', c.errors));
    if (c.warnings) parts.push(word('validation', c.warnings === 1 ? 'warning' : 'warnings', c.warnings));
    return parts.length ? parts.join(' · ') : V_def('validation', 'ok');
  };
  function V_def(dom, v) { var d = VF.V.statusDef(dom, v); return d ? d[0] : v; }

  /* "What the agent is told": the compiled instruction, read-only (FD2 §7.1 Advanced, §11 Advanced). */
  VF.compileStep = function (s, steps) {
    var by = VF.byId(steps), f = s.f || {}, lines = ['Step ' + s.no + ' · ' + s.title + ' (' + VF.reg(s).name + ')'];
    function target(o) { var t = by[o.to]; return t ? 'go to step ' + t.no + ' (' + t.title + ')' : 'not connected'; }
    if (VF.phaseOf(s) === 'trigger') lines.push(s.type === 'trigger.inbound' ? 'Starts when someone calls ' + (f.numbers || []).join(', ') + '.' : 'Starts when the batch "' + (f.batch || 'not linked') + '" calls a lead, ' + (f.hours || 'in calling hours') + '.');
    if (f.prompt) lines.push((s.type === 'logic.question' || s.type === 'action.meeting' || s.type === 'logic.verify' ? 'Ask: ' : 'Say: ') + f.prompt);
    if (s.type === 'action.meeting') lines.push('Offer ' + (f.length || '30 min') + ' ' + String(f.mtype || 'phone call').toLowerCase() + ' slots from ' + (f.offer === 'Set hours' ? f.hours : 'Google Calendar free time') + '. Save the booked time to {{' + (f.saveTo || 'meeting_time') + '}}.');
    s.outs.forEach(function (o) { if (o.label) lines.push('If ' + (o.fb ? (o.label === 'No reply' ? 'there is no reply after ' + (f.wait || 6) + ' s' : o.label.toLowerCase()) : 'the caller says ' + o.label.toLowerCase() + ((o.ex || []).length ? ' (' + o.ex.join(', ') + ')' : '')) + ': ' + target(o) + '.'); else if (o.id === 'out') lines.push('Then ' + target(o) + '.'); });
    if (s.type === 'outcome.end') { if (f.say) lines.push('Say: ' + f.say); lines.push(f.outcome ? 'End the call. Record the outcome "' + f.outcome + '"' + (f.lead ? ' and set the lead to ' + VF.leadWord(f.lead) : '') + '.' : 'End the call. No outcome chosen yet.'); }
    if (s.type === 'unknown') lines.push('Unsupported type "' + s.raw + '". Calls stop here.');
    return lines.join('\n');
  };
  VF.compileFlow = function (m) {
    var co = VF.callOrder(m.steps), by = VF.byId(m.steps);
    return ['Flow: ' + m.meta.name + ' · speaks Hindi and English · voice Vaani', 'Agent instructions: Warm and brief. Never promise a discount. Address callers as ji.', ''].concat(co.order.map(function (id) { return VF.compileStep(by[id], m.steps) + '\n'; })).join('\n');
  };
})(window);
