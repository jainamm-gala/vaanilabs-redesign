/* Vaani Labs prototype · Flow Designer · Configure fields per step type (FD2 §7.3–§7.15, §8, §9). Invalid values stay in
   their field and are not committed; the step keeps its last valid value and is reported invalid until fixed (L7). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var LABELS = { title: 'Label', prompt: 'Agent says', numbers: 'Answer calls on', when: 'When to answer', outside: 'Outside these hours', callerId: 'Caller ID', retries: 'Retries if no answer', interval: 'Retry after', concurrency: 'Calls at a time', ifNobody: 'If nobody answers', voicemail: 'Voicemail', wait: 'No reply after', unclear: 'If the answer is unclear', saveTo: 'Save answer to', interrupt: 'Let the caller interrupt', lang: 'Language', mtype: 'Meeting type', address: 'Address', length: 'Length', offer: 'Offer times from', hours: 'Meeting hours', confirmWa: 'Send WhatsApp confirmation', template: 'Template', email: 'Send email', outcome: 'Outcome', lead: 'Set lead status to', cbTime: 'Callback time', say: 'Say before ending', note: 'Add a note to the lead', to: 'Transfer to', number: 'Phone number', queue: 'Queue', ring: 'Ring for', brief: 'Brief the person first', attempts: 'Attempts', searchIn: 'Search in', lookUp: 'Look up', style: 'Answer style', connector: 'Connector', findBy: 'Find the record by', sendTo: 'Send to', tell: 'Tell the caller', batch: 'Batch', against: 'Check against', match: 'Match', decide: 'Decide by' };
  VF.fieldLabel = function (k) { return k === '__title' ? 'Label' : LABELS[k] || k; };
  var cur = null, issues = [];
  function fid(k) { return 'fd-f-' + String(k).replace(/[^\w-]/g, '_'); }
  function fieldErr(k) { if (cur && cur._fresh) return null; var i = issues.filter(function (x) { return x.field === k; })[0]; return i ? i.short || i.msg : null; }
  function foot(k, hint, count) { var e = fieldErr(k); return (e || hint || count) ? '<div class="field-foot">' + (e ? '<p class="field-error" id="' + fid(k) + '-e">' + VF.icon('circle-alert', 'sm') + esc(e) + '</p>' : hint ? '<p class="field-hint" id="' + fid(k) + '-h">' + hint + '</p>' : '') + (count ? '<span class="field-count" id="' + fid(k) + '-c">' + count + '</span>' : '') + '</div>' : ''; }
  function desc(k) { return fieldErr(k) ? ' aria-describedby="' + fid(k) + '-e" aria-invalid="true"' : ' aria-describedby="' + fid(k) + '-h"'; }
  var F = VF.F = {
    text: function (k, label, v, o) { o = o || {}; return '<div class="field"><label class="field-label" for="' + fid(k) + '">' + esc(label) + (o.opt ? ' <span class="field-opt">(optional)</span>' : '') + '</label><div class="input' + (o.mono ? ' input--mono' : '') + (fieldErr(k) ? ' input--invalid' : '') + '">' + (o.affix ? '<span class="input-affix">' + o.affix + '</span>' : '') + '<input id="' + fid(k) + '" type="' + (o.type || 'text') + '" data-k="' + k + '" value="' + esc(v == null ? '' : v) + '"' + (o.num ? ' inputmode="numeric"' : '') + desc(k) + ' autocomplete="off">' + (o.suffix ? '<span class="input-suffix">' + esc(o.suffix) + '</span>' : '') + '</div>' + foot(k, o.hint) + '</div>'; },
    num: function (k, label, v, o) { return F.text(k, label, v, { num: true, suffix: o.unit, hint: o.hint, opt: o.opt }).replace('data-k="' + k + '"', 'data-k="' + k + '" data-min="' + o.min + '" data-max="' + o.max + '"'); },
    area: function (k, label, v, o) {
      o = o || {}; var n = String(v || '').length;
      return '<div class="field fd-pf"><div class="fd-pf-top"><label class="field-label" for="' + fid(k) + '">' + esc(label) + (o.opt ? ' <span class="field-opt">(optional)</span>' : '') + '</label><button type="button" class="ibtn ibtn--sm" data-var="' + k + '" aria-label="Insert variable" data-tooltip="Insert variable">' + VF.icon('braces', 'sm') + '</button></div>' +
        '<div class="fd-pf-box' + (fieldErr(k) ? ' is-invalid' : '') + '"><div class="fd-pf-mirror" aria-hidden="true">' + mirror(v) + '</div><textarea class="fd-pf-ta" id="' + fid(k) + '" data-k="' + k + '" rows="' + (o.rows || 3) + '" spellcheck="true"' + (cur && cur.f.lang ? ' lang="' + esc(cur.f.lang) + '"' : '') + desc(k) + '>' + esc(v || '') + '</textarea></div>' +
        foot(k, o.hint || 'Type {{ to add a variable.', o.count ? 'About ' + Math.max(1, Math.round(n / 14)) + ' s spoken · ' + n + ' of 600' : '') +
        (v ? '<p class="fd-sounds"><span>Sounds like: “' + esc(sounds(v)) + '”</span></p>' : '') + '</div>';
    },
    select: function (k, label, v, opts, o) {
      o = o || {}; var sel = opts.filter(function (x) { return x.v === v; })[0];
      return '<div class="field"><span class="field-label" id="' + fid(k) + '-l">' + esc(label) + (o.opt ? ' <span class="field-opt">(optional)</span>' : '') + '</span><button type="button" class="select' + (o.sm ? ' select--sm' : '') + '" data-select data-k="' + k + '" id="' + fid(k) + '" aria-controls="' + fid(k) + '-lb" aria-labelledby="' + fid(k) + '-l ' + fid(k) + '-v"' + (fieldErr(k) ? ' aria-invalid="true" aria-describedby="' + fid(k) + '-e"' : '') + '><span class="select-value' + (sel ? '' : ' is-placeholder') + '" id="' + fid(k) + '-v" data-placeholder="' + esc(o.ph || 'Choose…') + '">' + (sel ? esc(sel.l) : '') + '</span>' + VF.icon('chevron-down', 'sm') + '</button>' +
        '<div class="listbox' + (o.wide ? ' listbox--wide' : '') + '" id="' + fid(k) + '-lb" role="listbox" aria-labelledby="' + fid(k) + '-l" hidden>' + opts.map(function (x) { if (x.group) return '<span class="listbox-group-label">' + esc(x.group) + '</span>'; return '<div class="option' + (x.d ? ' option--2' : '') + '" role="option" data-value="' + esc(x.v) + '" aria-selected="' + (x.v === v) + '"' + (x.dis ? ' aria-disabled="true"' : '') + '>' + (x.tile || '') + '<span class="option-main"><span class="option-label">' + esc(x.l) + '</span>' + (x.d ? '<span class="option-desc">' + esc(x.d) + '</span>' : '') + '</span>' + (x.tag || '') + '<span class="option-check">' + VF.icon('check', 'sm') + '</span></div>'; }).join('') + '</div>' + foot(k, o.hint) + '</div>';
    },
    seg: function (k, label, v, opts, o) { return '<div class="field"><span class="field-label" id="' + fid(k) + '-l">' + esc(label) + '</span><div class="seg seg--full" role="radiogroup" data-k="' + k + '" aria-labelledby="' + fid(k) + '-l">' + opts.map(function (x) { return '<button type="button" role="radio" aria-checked="' + (x === v) + '" data-value="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>' + foot(k, o && o.hint) + '</div>'; },
    sw: function (k, label, v, hint, o) { return '<div class="setting-row fd-sw"><div class="setting-row-text"><span class="setting-row-label" id="' + fid(k) + '-l">' + esc(label) + '</span>' + (hint ? '<span class="setting-row-desc">' + esc(hint) + '</span>' : '') + '</div><button type="button" class="switch" role="switch" data-k="' + k + '" aria-checked="' + !!v + '" aria-labelledby="' + fid(k) + '-l"' + (o && o.locked ? ' aria-disabled="true" data-tooltip="' + esc(o.locked) + '" data-manual' : '') + '><span class="switch-thumb"></span></button></div>'; },
    radios: function (k, label, v, opts) { return '<fieldset class="fieldset"><legend>' + esc(label) + '</legend>' + opts.map(function (x, i) { var val = x.v || x; return '<label class="check check--dense"><input type="radio" class="radio" name="' + fid(k) + '" data-k="' + k + '" value="' + esc(val) + '"' + (val === v ? ' checked' : '') + (x.dis ? ' disabled' : '') + '><span class="check-text"><span>' + esc(x.l || x) + '</span>' + (x.d ? '<span class="check-desc">' + esc(x.d) + '</span>' : '') + '</span></label>'; void i; }).join('') + '</fieldset>'; },
    check: function (k, label, v, o) { o = o || {}; return '<label class="check check--dense"><input type="checkbox" class="cb" data-k="' + k + '"' + (v ? ' checked' : '') + (o.dis ? ' disabled aria-describedby="' + fid(k) + '-why"' : '') + '><span class="check-text"><span>' + esc(label) + '</span>' + (o.desc || o.dis ? '<span class="check-desc" id="' + fid(k) + '-why">' + esc(o.dis || o.desc) + '</span>' : '') + '</span></label>'; },
    ro: function (label, html) { return '<div class="field"><span class="field-label">' + esc(label) + '</span><p class="fd-ro">' + html + '</p></div>'; },
    integ: function (name, icon, ok) { return '<div class="fd-integ"><span class="gt gt--sm gt--tint" aria-hidden="true">' + VF.icon(icon, 'xs') + '</span><span class="status status--md ' + (ok ? 'status--success' : 'status--warning') + '">' + VF.icon(ok ? 'check' : 'triangle-alert', 'md') + '<span>' + esc(name) + ' · ' + (ok ? 'Connected' : 'Not connected') + '</span></span>' + (ok ? '' : '<button type="button" class="btn btn--link" data-connect>Connect</button>') + '</div>'; },
    section: function (title, body) { return '<section class="form-section fd-sec"><h3 class="fd-sec-t">' + esc(title) + '</h3>' + body + '</section>'; }
  };
  function sample(n) { if (S.samples[n] != null) return S.samples[n]; var v = VF.allVars(S.m.steps).filter(function (x) { return x.name === n; })[0]; return v ? v.sample : '(empty)'; }
  function sounds(t) { return String(t).replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, n) { return sample(n); }); }
  function mirror(t) { var known = VF.allVars(S.m.steps).map(function (v) { return v.name; }); return esc(t || '').replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, n) { return '<mark class="fd-tok' + (known.indexOf(n) < 0 ? ' fd-tok--bad' : '') + '">' + m + '</mark>'; }) + '\n'; }
  VF.soundsLike = sounds;

  /* ---------- Go to select, the answer editor and outputs (FD2 §7.7, GoToSelect §24) ---------- */
  function gotoSelect(s, o) {
    var opts = [{ v: '__none', l: 'Not connected' }];
    VF.PHASE_ORDER.forEach(function (p) { if (p === 'trigger') return; var list = S.m.steps.filter(function (x) { return VF.phaseOf(x) === p && x.id !== s.id; }).sort(function (a, b) { return a.no - b.no; }); if (!list.length) return; opts.push({ group: VF.PHASES[p].name }); list.forEach(function (x) { opts.push({ v: x.id, l: x.title, tile: '<span class="gt gt--sm ' + VF.tileClass(x) + '" aria-hidden="true">' + VF.icon(VF.reg(x).icon, 'xs') + '</span>', tag: '<span class="menu-end">#' + x.no + '</span>' }); }); });
    opts.push({ v: '__new', l: '+ New step here…' });
    var html = F.select('goto-' + o.id, 'Go to', o.to || '__none', opts, { sm: true, wide: true });
    return html.replace('class="field"', 'class="field fd-goto' + (o.to ? '' : ' fd-goto--open') + '"').replace('>Go to<', '><span class="sr-only">' + esc((o.label || 'Next step') + ' ') + '</span>Go to<');
  }
  function answers(s) {
    var r = VF.reg(s), rowsHtml = s.outs.map(function (o, i) {
      if (r.rows !== 'answers') return '<li class="fd-ae-row' + (o.fb ? ' fd-ae-row--fb' : '') + '"><span class="fd-ae-ico" aria-hidden="true">' + VF.icon(o.res === 'ok' ? 'check' : 'x', 'sm') + '</span><span class="fd-ae-lab">' + esc(o.label) + (o.fb ? '<span class="field-hint">fallback</span>' : '') + '</span>' + gotoSelect(s, o) + '</li>';
      if (o.fb) return '<li class="fd-ae-row fd-ae-row--fb"><span class="fd-ae-ico" aria-hidden="true"></span><span class="fd-ae-lab">' + esc(o.label) + '<span class="field-hint">' + (o.label === 'No reply' ? 'after ' + (s.f.wait || 6) + ' s · required' : 'anything else · required') + '</span></span>' + gotoSelect(s, o) + '</li>';
      return '<li class="fd-ae-row" data-ans="' + esc(o.id) + '"><span class="fd-ae-grip" aria-hidden="true">' + VF.icon('grip-vertical', 'sm') + '</span><div class="fd-ae-main"><div class="input input--sm"><input type="text" data-ans="' + esc(o.id) + '" data-part="label" value="' + esc(o.label) + '" aria-label="Answer ' + (i + 1) + ' label"></div>' +
        '<div class="input input--sm input--multi fd-ae-ex" data-ex="' + esc(o.id) + '">' + (o.ex || []).map(function (e, j) { return '<span class="token" lang="' + VF.langOf(e) + '">' + esc(e) + '<button type="button" data-rmex="' + j + '" aria-label="Remove example ' + esc(e) + '">' + VF.icon('x', 'xs') + '</button></span>'; }).join('') + '<input type="text" data-ans="' + esc(o.id) + '" data-part="ex" placeholder="' + ((o.ex || []).length ? '' : 'Add examples: haan, zaroor…') + '" aria-label="Answer ' + (i + 1) + ' examples. Enter or comma adds one."></div></div>' +
        '<div class="fd-ae-end">' + gotoSelect(s, o) + '<button type="button" class="ibtn ibtn--sm" data-ansmenu="' + esc(o.id) + '" aria-label="More for answer ' + esc(o.label) + '" aria-haspopup="menu">' + VF.icon('ellipsis', 'sm') + '</button></div></li>';
    }).join('');
    var named = s.outs.filter(function (o) { return !o.fb; }).length;
    return '<ul class="fd-ae">' + rowsHtml + '</ul>' + (r.rows === 'answers' && s.type !== 'logic.verify' ? '<button type="button" class="btn btn--tertiary btn--sm fd-ae-add" data-addans' + (named >= 8 ? ' aria-disabled="true" data-tooltip="Up to 8 answers. Use a Branch for more."' : '') + '>' + VF.icon('plus', 'sm') + (s.type === 'logic.branch' ? 'Add case' : 'Add answer') + '</button>' : '');
  }

  var LANGS = [{ v: '', l: 'Auto · Hindi + English' }, { v: 'hi', l: 'Hindi' }, { v: 'en', l: 'English' }, { v: 'hi-Latn', l: 'Hinglish' }];
  var outcomeOpts = VF.OUTCOMES.map(function (o) { return { v: o[0], l: o[0], d: o[1] ? 'Sets the lead to ' + VF.leadWord(o[1]) : 'Leaves the lead unchanged' }; });
  function leadOpts() { return Object.keys(V.STATUS.lead).map(function (k) { return { v: k, l: V.STATUS.lead[k][0] }; }); }
  function tplOpts() { return VF.WS.templates.map(function (t) { return { v: t.id, l: t.id, dis: t.status === 'rejected', d: t.status === 'rejected' ? 'Rejected on ' + t.rejected + '. Pick another.' : t.text.slice(0, 60) + '…', tag: '<span class="tag tag--' + (t.status === 'approved' ? 'success' : t.status === 'pending' ? 'warning' : 'danger') + '">' + (t.status === 'approved' ? 'Approved' : t.status === 'pending' ? 'Pending' : 'Rejected') + '</span>' }; }); }

  VF.configureHtml = function (s, iss) {
    cur = s; issues = iss; var f = s.f || {}, h = [], out = [], t = s.type;
    function outputs() { return F.section(VF.reg(s).rows === 'results' ? 'Results' : VF.reg(s).rows ? (t === 'logic.branch' ? 'Cases · first match wins' : 'Answers to listen for') : 'Next step', VF.reg(s).rows ? answers(s) : s.outs.length ? gotoSelect(s, s.outs[0]) : ''); }
    if (t === 'unknown') return '<div class="notice notice--warning notice--multi">' + VF.icon('triangle-alert') + '<div class="notice-body">This step uses a type Vaani doesn’t recognise: <code>' + esc(s.raw) + '</code>. Calls can’t run it. Convert it or delete it.</div></div>' + F.ro('Label', esc(s.title)) + F.ro('Stored text', esc(f.stored || '–')) + F.select('convert', 'Convert to…', '', VF.convertTargets(s).map(function (k) { return { v: k, l: VF.REG[k].name }; }), { ph: 'Choose a step type' });
    if (t === 'action.crm') h.push(F.integ('Sample CRM', 'database', true));
    if (t === 'action.meeting') h.push(F.integ('Google Calendar', 'calendar', VF.WS.calendar === 'connected'));
    if (t === 'action.whatsapp') h.push(F.integ('WhatsApp Business', 'message-circle', VF.WS.whatsapp === 'connected'));
    if (t === 'outcome.end') { h.push(F.select('outcome', 'Outcome', f.outcome, outcomeOpts)); }
    h.push(F.text('title', 'Label', s.title));
    if (t === 'trigger.inbound') {
      h.push('<fieldset class="fieldset"><legend>Answer calls on</legend>' + VF.WS.numbers.map(function (n, i) { var on = (f.numbers || []).indexOf(n.masked) >= 0, other = n.flow && n.flow !== S.m.meta.id; return F.check('num-' + i, n.masked, on, { dis: n.status !== 'verified' ? n.note : null, desc: other ? (on ? "Moves from 'Home-loan follow-up' to this flow when you publish." : n.note) : n.status === 'verified' ? 'Verified' : '' }).replace('data-k="num-' + i + '"', 'data-num="' + esc(n.masked) + '"'); }).join('') + foot('numbers') + '</fieldset>');
      h.push(F.seg('when', 'When to answer', f.when || 'Always', ['Always', 'Set hours']));
      if (f.when === 'Set hours') h.push(F.ro('Answer hours · IST', 'Mon to Sat, 10 am to 7 pm'));
      h.push(F.select('outside', 'Outside these hours', f.outside, ['Say a message and end', 'Transfer to a person', 'Take a voicemail'].map(function (x) { return { v: x, l: x }; })));
      h.push(F.ro('Recording notice', 'Callers hear the recording notice first: “This call may be recorded for quality.” · <a href="settings.html">Change in Settings</a>'));
    }
    if (t === 'trigger.outbound') {
      h.push(F.ro('Batch', f.batch ? 'Batch “' + esc(f.batch) + '” uses this flow · <a href="leads.html">Change in Leads</a>' : 'No batch linked yet. Choose this flow in a Leads batch.'));
      h.push(F.select('callerId', 'Caller ID', f.callerId, VF.WS.callerIds.map(function (x) { return { v: x, l: x, d: 'Verified' }; })));
      h.push(F.ro('Calling hours · IST', esc(f.hours || 'Mon to Sat, 10 am to 7 pm') + '<br><span class="u-fg-3">Batches wait for these hours. DND numbers are always skipped.</span>'));
      h.push('<div class="l-pair">' + F.num('retries', 'Retries if no answer', f.retries, { min: 0, max: 3, unit: 'retries', hint: '0 to 3 retries' }) + F.select('interval', 'Retry after', f.interval, ['1 h', '2 h', '4 h', 'next day'].map(function (x) { return { v: x, l: x }; })) + '</div>');
      h.push(F.num('concurrency', 'Calls at a time', f.concurrency, { min: 1, max: 20, hint: '1 to 20 calls at a time' }));
      h.push(F.select('ifNobody', 'If nobody answers', f.ifNobody, ['No answer', 'Callback', 'Not interested'].map(function (x) { return { v: x, l: x }; }), { hint: 'Written to the lead after the last retry; no step runs.' }));
      h.push(F.seg('voicemail', 'Voicemail', f.voicemail || 'Hang up', ['Hang up', 'Leave a message']));
    }
    if (t === 'logic.question' || t === 'logic.verify' || t === 'action.meeting') h.push(F.area('prompt', 'Agent asks', f.prompt, { hint: t === 'logic.question' ? 'Ask one thing. The agent speaks it in the caller’s language. Type {{ to add a variable.' : null }));
    if (t === 'action.speak') h.push(F.area('prompt', 'Agent says', f.prompt, { count: true }));
    if (t === 'logic.question') { h.push(outputs()); h.push(F.select('unclear', 'If the answer is unclear', f.unclear, ['Ask again once', 'Ask again twice', 'Go to No reply'].map(function (x) { return { v: x, l: x }; }))); h.push(F.num('wait', 'No reply after', f.wait, { min: 3, max: 15, unit: 's', hint: '3 to 15 seconds' })); h.push(F.text('saveTo', 'Save answer to', f.saveTo, { opt: true, affix: '{{', suffix: '}}', mono: true, hint: 'Lowercase letters, numbers and _ only.' })); }
    if (t === 'logic.branch') { h.push(F.seg('decide', 'Decide by', f.decide || 'Rules', ['Rules', 'Description'], { hint: f.decide === 'Description' ? 'The agent judges descriptions and can be wrong. Use rules when the value is saved in a variable.' : 'Cases are checked top to bottom; the first match wins. Empty values take Else.' })); out.push(outputs()); }
    if (t === 'logic.verify') { h.push(F.select('against', 'Check against', f.against, ['A lead field', 'A CRM record', 'A knowledge table'].map(function (x) { return { v: x, l: x }; }))); h.push(F.seg('match', 'Match', f.match || 'Last 4 digits', ['Last 4 digits', 'Full value', 'Exact wording'])); h.push(F.num('attempts', 'Attempts', f.attempts, { min: 1, max: 5, hint: '1 to 5 attempts.' })); h.push(F.sw('hide', 'Hide spoken digits in transcripts', f.hide !== false, 'Shown as •••• in Call reports.', { locked: f.match === 'Last 4 digits' ? 'Always on when the match is digits' : null })); out.push(outputs()); }
    if (t === 'action.speak' || t === 'logic.question') h.push(F.sw('interrupt', 'Let the caller interrupt', f.interrupt !== false, t === 'logic.question' ? 'Callers can answer before the question ends.' : null));
    if (t === 'action.knowledge') { h.push(F.radios('searchIn', 'Search in', f.searchIn, ['All indexed sources', 'Chosen sources', "This step’s Q&A"])); h.push(F.seg('lookUp', 'Look up', f.lookUp || 'What the caller asked', ['What the caller asked', 'A set query'])); h.push(F.select('style', 'Answer style', f.style, ['In the agent’s own words', 'Read the passage closely'].map(function (x) { return { v: x, l: x }; }), { hint: 'Use “closely” for prices and policy wording.' })); h.push('<div class="field"><label class="field-label" for="fd-try">Try a question</label><div class="input input--sm">' + VF.icon('search', 'sm') + '<input type="search" id="fd-try" placeholder="What is the price of a 2 BHK?"></div><p class="field-hint" id="fd-try-out" aria-live="polite"></p></div>'); out.push(outputs()); }
    if (t === 'action.crm') { h.push(F.select('connector', 'Connector', f.connector, VF.WS.crm.map(function (c) { return { v: c.id, l: c.name, d: 'Connected' }; }))); h.push(F.select('findBy', 'Find the record by', f.findBy, ["Caller’s phone number", 'A variable'].map(function (x) { return { v: x, l: x }; }))); out.push(outputs() + '<p class="form-note">If no record matches, the agent says so and never guesses.</p>'); }
    if (t === 'action.meeting') {
      h.push(F.seg('mtype', 'Meeting type', f.mtype || 'Phone call', ['Phone call', 'Video call', 'In person']));
      if (f.mtype === 'In person') h.push(F.text('address', 'Address', f.address));
      h.push(F.select('length', 'Length', f.length, ['15 min', '30 min', '45 min', '60 min', '90 min', '120 min'].map(function (x) { return { v: x, l: x }; })));
      h.push(F.radios('offer', 'Offer times from', f.offer, [{ v: 'Google Calendar free time', l: 'Google Calendar free time' }, { v: 'Set hours', l: 'Set hours' }]));
      if (f.offer === 'Set hours') h.push(F.ro('Meeting hours · IST', esc(f.hours || 'Mon to Sat, 10 am to 6 pm')));
      h.push('<fieldset class="fieldset"><legend>Confirm by</legend>' + F.check('confirmWa', 'Send WhatsApp confirmation', f.confirmWa, { dis: VF.WS.whatsapp !== 'connected' ? 'Needs WhatsApp. Connect it in Settings.' : null }) + (f.confirmWa ? F.select('template', 'Template', f.template, tplOpts(), { sm: true, wide: true }) : '') + F.check('email', 'Send email', f.email, { desc: 'Some leads have no email. They won’t get one.' }) + F.check('gcal', 'Add to Google Calendar', f.gcal, { dis: VF.WS.calendar !== 'connected' ? 'Needs Google Calendar.' : null }) + '</fieldset>');
      h.push(F.text('saveTo', 'Save the booked time to', f.saveTo || 'meeting_time', { affix: '{{', suffix: '}}', mono: true }));
      out.push(outputs());
    }
    if (t === 'action.whatsapp') {
      h.push(F.select('template', 'Template', f.template, tplOpts(), { wide: true }));
      var tp = VF.WS.templates.filter(function (x) { return x.id === f.template; })[0];
      if (tp) h.push('<div class="field"><span class="field-label">Preview</span><p class="fd-wa type-read-15">' + esc(tp.text.replace('{{1}}', sample('lead_name')).replace('{{2}}', 'Sat, 11 am')) + '</p></div>');
      h.push(F.select('sendTo', 'Send to', f.sendTo, ["Caller’s number", 'A variable'].map(function (x) { return { v: x, l: x }; })));
      h.push(F.area('tell', 'Tell the caller', f.tell, { opt: true, rows: 2 }));
    }
    if (t === 'action.transfer') {
      h.push(F.radios('to', 'Transfer to', f.to, ['A phone number', 'Rep console', 'A variable']));
      if (f.to === 'A phone number') h.push(F.text('number', 'Phone number', f._numDraft != null ? f._numDraft : f.number, { hint: 'Include the country code, like +91 98765 43210.', type: 'tel' }));
      if (f.to === 'Rep console') h.push(F.select('queue', 'Queue', f.queue, VF.WS.queues.map(function (x) { return { v: x, l: x }; })));
      h.push(F.area('say', 'Say before transferring', f.say, { rows: 2 }));
      h.push(F.num('ring', 'Ring for', f.ring, { min: 10, max: 60, unit: 's', hint: '10 to 60 seconds' }));
      h.push(F.sw('brief', 'Brief the person first', f.brief !== false, 'They hear a one-line summary before the caller joins.'));
      out.push(outputs());
    }
    if (t === 'outcome.end') {
      h.push(F.select('lead', 'Set lead status to', f.lead || '', [{ v: '', l: 'Leave unchanged' }].concat(leadOpts()), { hint: f.lead === 'do_not_call' ? 'This lead won’t be called again.' : null }));
      if (f.outcome === 'Callback') h.push(F.text('cbTime', 'Callback time', f.cbTime, { affix: '{{', suffix: '}}', mono: true, hint: 'A variable saved on an earlier question.' }));
      h.push(F.area('say', 'Say before ending', f.say, { opt: true, rows: 2 }));
      h.push(F.area('note', 'Add a note to the lead', f.note, { opt: true, rows: 2 }));
      h.push('<p class="form-note">Test calls and browser tests never write lead status or notes.</p>');
    }
    if (VF.phaseOf(s) === 'trigger') out.push(outputs());
    var lang = (t === 'logic.question' || t === 'action.speak' || t === 'logic.verify') ? F.select('lang', 'Language', f.lang || '', LANGS, { hint: 'Steps on Auto speak the caller’s language from this flow’s list.' }) : '';
    var adv = '<details class="details fd-adv"><summary>Advanced</summary><div class="l-stack l-stack--sm u-mt-8"><div class="l-cluster"><span class="id-text">' + esc(S.m.meta.shortId + '/step_' + s.no) + '</span><button type="button" class="btn btn--link" data-copyid>Copy</button></div><span class="field-label">What the agent is told</span><pre class="codeblock fd-code">' + esc(VF.compileStep(s, S.m.steps)) + '</pre><p class="form-note">Created by Anika R. · last edited ' + esc(V.fmt.when(S.m.draftEditedAt || VF.nowIso())) + '</p></div></details>';
    return '<div class="form fd-form">' + h.join('') + out.join('') + lang + adv + '</div>';
  };

  /* Plain-text pairs for read-only sheets (tablet, phone, old versions). */
  VF.fieldSummary = function (s) {
    var f = s.f || {}, rows = [];
    Object.keys(f).forEach(function (k) {
      if (/^_/.test(k) || !LABELS[k] || f[k] === '' || f[k] == null) return; var v = f[k];
      if (k === 'lead') v = VF.leadWord(v); if (k === 'lang') v = V.langByCode(v).name; if (k === 'wait' || k === 'ring') v = v + ' s'; if (typeof v === 'boolean') v = v ? 'On' : 'Off'; if (Array.isArray(v)) v = v.join(', ');
      var lab = k === 'prompt' && (s.type === 'logic.question' || s.type === 'logic.verify' || s.type === 'action.meeting') ? 'Agent asks' : k === 'saveTo' && s.type === 'action.meeting' ? 'Save the booked time to' : LABELS[k];
      rows.push([lab, '<span' + (k === 'prompt' && s.f.lang ? ' lang="' + esc(s.f.lang) + '"' : '') + '>' + (k === 'prompt' || k === 'say' || k === 'tell' || k === 'note' ? VF.tokens(String(v)) : esc(String(v))) + '</span>']);
    });
    return rows;
  };
})(window, document);
