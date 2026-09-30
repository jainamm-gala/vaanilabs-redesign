/* Vaani Labs prototype · Flow Designer · TestPanel (FD2 §13): a text simulation of the Draft (or any version) turn by turn,
   quick replies from the current Logic step, simulated side effects that say so, Captured and Path, and the canvas marks
   (Now, Reached, traversed connectors with a one-shot trace; no trace under reduced motion). Call my phone opens a Call gate. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  S.testOpen = false; S.test = null; var T = { mode: 'text', rev: 'draft', start: null, follow: true };
  function steps() { return T.rev === 'draft' ? S.m.steps : S.m.live || S.m.steps; }
  function by(id) { return steps().filter(function (s) { return s.id === id; })[0]; }
  function lead() { var l = (V.data.leads || [])[0] || { name: 'Aarav Mehta', no: 1042 }; return l; }
  function sample(t) { return VF.soundsLike ? VF.soundsLike(t) : t; }

  VF.toggleTest = function (o) {
    o = o || {}; if (VF.unloaded && VF.unloaded()) return; var open = o.open != null ? o.open : !S.testOpen;
    if (!open) return closeTest();
    S.testOpen = true; if (!S.test) S.test = { status: 'idle', turns: [], path: [], reached: [], edges: [] };
    render();
    var sec = $('#fd-test');
    if (S.mode === 'full' || S.mode === 'compact') { $('#fd-testdock').hidden = false; sec.classList.add('is-docked'); VF.emit('panels'); setTimeout(function () { var f = $('[data-t="start"]', sec) || $('#fd-t-in', sec) || $('#fd-test-t'); if (f) { if (f.id === 'fd-test-t') f.tabIndex = -1; f.focus(); } }, 30); }
    else V.drawer.open('fd-test', { mode: 'modal', returnTo: o.trigger || d.activeElement, onClose: function () { S.testOpen = false; clearMarks(); } });
    S.testTrigger = o.trigger;
  };
  function closeTest() {
    S.testOpen = false; clearMarks();
    if (V.drawer.isOpen('fd-test')) V.drawer.close('fd-test', 'x'); else { $('#fd-testdock').hidden = true; }
    VF.emit('panels'); var t = S.testTrigger; if (t && d.contains(t) && V.util.visible(t)) t.focus(); else { var b = $('#fd-head-r [data-h="test"]'); if (b) b.focus(); }
  }
  function clearMarks() { if (S.test) { S.test.current = null; S.test.reached = []; S.test.edges = []; } VF.renderCanvas(); }
  VF.on('testinvalid', function () { if (!S.test || S.test.status === 'idle') return; S.test.stale = true; S.test.current = null; S.test.reached = []; S.test.edges = []; if (S.testOpen) render(); });

  function ensure() {
    var sec = $('#fd-test'); if (sec) return sec;
    sec = d.createElement('section'); sec.className = 'sheet sheet--detail fd-test'; sec.id = 'fd-test'; sec.setAttribute('aria-labelledby', 'fd-test-t'); sec.hidden = true; $('#fd-testdock').appendChild(sec);
    sec.addEventListener('click', onClick); sec.addEventListener('keydown', onKey); sec.addEventListener('vaani:change', onChange); return sec;
  }
  function sel(k, label, v, opts) { var id = 'fd-t-' + k; return '<span class="sr-only" id="' + id + '-l">' + label + '</span><button type="button" class="select select--sm select--auto" data-select data-tk="' + k + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v">' + esc(opts.filter(function (o) { return o[0] === v; })[0][1]) + '</span>' + VF.icon('chevron-down', 'sm') + '</button><div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === v) + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span></div>'; }).join('') + '</div>'; }
  function render() {
    var sec = ensure(), t = S.test, live = S.m.meta.live, trig = steps().filter(function (s) { return VF.phaseOf(s) === 'trigger'; });
    if (!T.start || !by(T.start)) T.start = trig[0] && trig[0].id;
    var phone = S.mode === 'phone', off = S.scen === 'offline';
    var modes = '<div class="seg seg--sm" role="radiogroup" aria-label="Test mode" data-tk="mode"><button type="button" role="radio" aria-checked="' + (T.mode === 'text') + '" data-value="text"' + (off ? ' aria-disabled="true"' : '') + '>Text</button><button type="button" role="radio" aria-checked="' + (T.mode === 'voice') + '" data-value="voice">Browser voice</button>' + (phone ? '' : '<button type="button" role="radio" aria-checked="false" data-value="phone"' + (off ? ' aria-disabled="true"' : '') + '>Call my phone…</button>') + '</div>';
    var head = '<div class="fd-test-head"><button type="button" class="ibtn sheet-back" data-t="close" aria-label="Back">' + VF.icon('chevron-left') + '</button><h2 class="fd-test-title" id="fd-test-t">Test</h2>' + modes +
      '<div class="fd-test-opts">' + sel('rev', 'Revision', T.rev, [['draft', 'Draft']].concat(live ? [['live', 'Live v' + live.version]] : [])) + sel('start', 'Start at', T.start, trig.map(function (s) { return [s.id, s.title]; })) + sel('sample', 'Sample', 'lead', [['lead', 'Lead ' + lead().no + ' · ' + lead().name], ['values', 'Sample values']]) + '</div>' +
      '<span class="l-spacer"></span><button type="button" class="btn btn--tertiary btn--sm" data-t="restart"' + (t.status === 'idle' ? ' aria-disabled="true"' : '') + '>' + VF.icon('rotate-ccw', 'sm') + 'Restart</button><button type="button" class="ibtn ibtn--sm sheet-close" data-t="close" aria-label="Close test panel">' + VF.icon('x', 'sm') + '</button></div>';
    var kind = '<p class="fd-test-kind">' + (T.mode === 'voice' ? 'Browser test on the ' : 'Text test on the ') + (T.rev === 'draft' ? 'draft' : 'Live version') + ' · nothing is sent or dialled' + (t.stale ? ' · <b>You changed the flow. Restart to test the latest draft.</b>' : '') + '</p>';
    var body;
    if (S.scen === 'test-error' && !T.retried) body = '<div class="fd-test-empty"><div class="ierr" role="alert"><div class="ierr-line">' + VF.icon('circle-alert') + '<span>Couldn’t reach the test service. Your draft is safe. <button type="button" class="btn btn--link" data-t="retry">Retry</button></span></div></div></div>';
    else if (off && T.mode !== 'voice') body = '<div class="fd-test-empty"><p class="status status--md status--warning">' + VF.icon('cloud-off', 'md') + '<span>You’re offline. Text tests and phone tests need a connection.</span></p></div>';
    else if (t.status === 'idle') body = '<div class="fd-test-empty"><div class="empty empty--compact">' + (T.mode === 'voice' ? (S.scen === 'mic-blocked' ? '<p class="status status--md status--warning">' + VF.icon('mic-off', 'md') + '<span>Microphone blocked. Allow it in your browser’s site settings, then Retry.</span></p><button type="button" class="btn btn--sm" data-t="micretry">Retry</button>' : '<p class="status status--md status--success">' + VF.icon('mic', 'md') + '<span>Microphone ready. Browser tests aren’t billed.</span></p><button type="button" class="btn btn--primary btn--sm" data-t="start">Start browser test</button>') : '<p>Test the draft before callers hear it. Nothing is sent or dialled in a text test.</p><button type="button" class="btn btn--primary btn--sm" data-t="start">Start text test</button>') + '</div></div>';
    else body = '<div class="fd-test-main"><div class="fd-test-feedcol"><ol class="fd-test-feed" id="fd-test-feed" aria-label="Transcript">' + t.turns.map(turnHtml).join('') + '</ol>' + replies() + '</div><div class="fd-test-side" role="region" aria-label="Captured values and path" tabindex="0">' + side() + '</div></div>';
    var grip = S.mode === 'full' || S.mode === 'compact' ? '<div class="fd-test-grip" role="separator" aria-orientation="horizontal" aria-label="Resize test panel" aria-valuemin="200" aria-valuemax="' + maxH() + '" aria-valuenow="' + (S.testH || 280) + '" tabindex="0"></div>' : '';
    sec.innerHTML = grip + head + kind + body; V.initAll(sec);
    var feed = $('#fd-test-feed'); if (feed) feed.scrollTop = feed.scrollHeight;
    if (S.mode === 'full' || S.mode === 'compact') sec.hidden = false;
  }
  function maxH() { var c = $('#fd-center'); return Math.max(200, Math.round((c ? c.offsetHeight : 800) / 2)); }
  function setH(h) { S.testH = Math.max(200, Math.min(maxH(), Math.round(h))); var dk = $('#fd-testdock'); dk.style.height = S.testH + 'px'; var g = $('.fd-test-grip'); if (g) g.setAttribute('aria-valuenow', S.testH); }
  d.addEventListener('keydown', function (e) { if (!e.target.classList || !e.target.classList.contains('fd-test-grip')) return; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setH((S.testH || 280) + (e.key === 'ArrowUp' ? 16 : -16)); } });
  d.addEventListener('pointerdown', function (e) { var g = e.target.closest && e.target.closest('.fd-test-grip'); if (!g) return; e.preventDefault(); var y0 = e.clientY, h0 = S.testH || $('#fd-testdock').offsetHeight; g.setPointerCapture(e.pointerId); g.onpointermove = function (m) { setH(h0 + (y0 - m.clientY)); }; g.onpointerup = function () { g.onpointermove = null; }; });
  function turnHtml(x) {
    if (x.sys) return '<li class="turn--sys' + (x.tone ? ' fd-turn--' + x.tone : '') + '">' + VF.icon(x.icon || 'info', 'sm') + '<span>' + esc(x.text) + '</span>' + (x.goto ? ' <button type="button" class="btn btn--link" data-goto="' + x.goto + '">Go to step</button>' : '') + '</li>';
    return '<li class="turn' + (x.caller ? ' turn--caller' : '') + (x.partial ? ' turn--partial' : '') + '"' + (x.lang ? ' lang="' + x.lang + '"' : '') + '><span class="turn-tc">' + V.fmt.timecode(x.t) + '</span><div class="turn-h"><span class="turn-who" translate="no">' + (x.caller ? 'You, as the caller' : 'Vaani') + '</span>' + (x.lang && !x.caller ? V.ui.langMark(x.lang, 'compact') : '') + (x.step ? '<button type="button" class="btn btn--link fd-turn-step" data-goto="' + x.step + '">Step · ' + esc((by(x.step) || {}).title || '') + '</button>' : '') + '</div><p class="turn-u">' + esc(x.text) + '</p></li>';
  }
  function replies() {
    var t = S.test, s = t.current && by(t.current), html = '';
    if (t.status === 'waiting' && s) {
      var rs = s.type === 'action.meeting' ? [['booked', 'Saturday 11 am'], ['notbooked', 'Not this week']] : s.outs.filter(function (o) { return !o.fb; }).map(function (o) { return [o.id, o.label + ((o.ex || [])[0] ? ' · ' + o.ex[0] : '')]; });
      var fb = s.outs.filter(function (o) { return o.fb; })[0];
      html = '<div class="fd-test-replies" role="group" aria-label="Reply as the caller"><span class="fd-pal-label">Reply as the caller</span>' + rs.map(function (r) { return '<button type="button" class="btn btn--sm" data-reply="' + esc(r[0]) + '">' + esc(r[1]) + '</button>'; }).join('') + (fb && s.type !== 'action.meeting' ? '<button type="button" class="btn btn--sm" data-reply="' + fb.id + '">' + esc(fb.label) + (fb.label === 'No reply' ? ' (' + (s.f.wait || 6) + ' s)' : '') + '</button>' : '') + '</div>';
    }
    var can = t.status === 'waiting';
    return html + '<div class="fd-test-comp"><label class="sr-only" for="fd-t-in">Type what the caller says</label><textarea class="textarea textarea--composer" id="fd-t-in" rows="1" placeholder="Type what the caller says…"' + (can ? '' : ' aria-disabled="true" readonly') + '></textarea><button type="button" class="btn btn--primary btn--sm" data-t="send"' + (can ? '' : ' aria-disabled="true"') + '>' + VF.icon('send', 'sm') + 'Send</button></div>';
  }
  function side() {
    var t = S.test, vars = VF.captured(steps()).map(function (v) { return v.name; });
    return '<h3 class="fd-pal-label">Captured</h3><dl class="kv">' + vars.map(function (n) { return '<div class="kv-row"><dt class="u-mono" translate="no">' + esc(n) + '</dt><dd>' + (t.captured[n] ? esc(t.captured[n]) : '<span class="kv-empty">not yet</span>') + '</dd></div>'; }).join('') + '</dl>' +
      '<h3 class="fd-pal-label">Path</h3><ol class="fd-test-path">' + t.path.map(function (id) { var s = by(id); var now = id === t.current && t.status === 'waiting'; return '<li>' + (now ? '<span class="smark smark--current" aria-hidden="true"></span>' : '<span class="smark smark--done" aria-hidden="true">' + VF.icon('check', 'xs') + '</span>') + '<span>' + esc(s ? s.title : '') + (now ? ' <span class="tag tag--info">Now</span>' : '') + '</span></li>'; }).join('') + '</ol>';
  }

  /* ---------- the run ---------- */
  function add(turn) { var t = S.test; turn.t = t.t; t.turns.push(turn); t.t += turn.caller ? 2 : Math.max(2, Math.round((turn.text || '').length / 14)); }
  function start() {
    var s0 = by(T.start); S.test = { status: 'running', turns: [], path: [], reached: [], edges: [], captured: {}, t: 0, asked: {} };
    add({ sys: true, icon: s0.type === 'trigger.inbound' ? 'phone-incoming' : 'list', text: (s0.type === 'trigger.inbound' ? 'Inbound call · +91 80 •••• 2210' : 'Outbound batch · Lead ' + lead().no + ' · ' + lead().name) + ' · test on the ' + (T.rev === 'draft' ? 'draft' : 'live version') });
    enter(s0.id); render();
  }
  function enter(id) { var t = S.test; t.current = id; if (t.path.indexOf(id) < 0) t.path.push(id); if (t.reached.indexOf(id) < 0) t.reached.push(id); VF.renderCanvas(); if (T.follow) VF.reveal(id); V.announce('Now at ' + by(id).title, { dedupeKey: 'testnow' }); setTimeout(function () { run(id); }, S.test.turns.length > 1 ? 450 : 150); }
  function follow(s, outId) {
    var o = s.outs.filter(function (x) { return x.id === outId; })[0] || s.outs[0], t = S.test;
    if (!o || !o.to || !by(o.to)) { stop(s, (o && o.label ? '“' + o.label + '” isn’t connected.' : 'the next step isn’t connected.')); return; }
    t.edges.push(s.id + '|' + o.id); trace(s.id + '|' + o.id); enter(o.to);
  }
  function stop(s, why) { var t = S.test; t.status = 'stopped'; t.current = s.id; add({ sys: true, icon: 'triangle-alert', tone: 'warning', text: 'Stopped at #' + s.no + ' ' + s.title + ': ' + why + ' Fix it, then Restart.', goto: s.id }); render(); VF.renderCanvas(); }
  function run(id) {
    var s = by(id), t = S.test, f = s.f || {}; if (!S.test || S.test.current !== id) return;
    var errs = VF.validate(steps()).filter(function (i) { return i.stepId === id && i.level === 'error' && !i.unreachable && !/^E0[36]$/.test(i.rule); });
    if (errs.length) { stop(s, (errs[0].short || errs[0].msg).replace(/\.$/, '').toLowerCase() + '.'); return; }
    var p = VF.phaseOf(s);
    if (p === 'trigger') return follow(s, 'out');
    if (s.type === 'action.speak') { add({ text: sample(f.prompt || ''), step: s.id, lang: f.lang }); render(); return setTimeout(function () { follow(s, 'out'); }, 350); }
    if (s.type === 'logic.question' || s.type === 'logic.verify' || s.type === 'action.meeting') { add({ text: sample(f.prompt || ''), step: s.id, lang: f.lang }); t.status = 'waiting'; render(); var c = $('#fd-t-in'); if (c && S.testOpen) c.focus(); return; }
    if (s.type === 'logic.branch') { add({ sys: true, icon: 'diamond', text: 'Branch decided from {{budget}} = 95,00,000 → ' + (s.outs[0].label || 'Case 1') }); render(); return follow(s, s.outs[0].id); }
    if (s.type === 'action.knowledge') { add({ sys: true, icon: 'book-open', text: 'Knowledge lookup · ' + (VF.WS.sources[0] || 'price-sheet.pdf') + ' · 2 passages · Found' }); render(); return follow(s, 'ok'); }
    if (s.type === 'action.crm') { add({ sys: true, icon: 'database', text: 'CRM lookup · sample result: Found · read-only' }); render(); return follow(s, 'ok'); }
    if (s.type === 'action.whatsapp') { add({ sys: true, icon: 'message-circle', text: 'Send WhatsApp · simulated · would send “' + (f.template || '') + '” to your number. Not sent.' }); if (f.tell) add({ text: sample(f.tell), step: s.id }); render(); return follow(s, 'out'); }
    if (s.type === 'action.transfer') { add({ sys: true, icon: 'phone-forwarded', text: 'Would transfer to ' + (f.to === 'Rep console' ? 'Rep console' : 'a phone number') + '. Nobody was called.' }); render(); return follow(s, 'ok'); }
    if (s.type === 'outcome.end') {
      if (f.say) add({ text: sample(f.say), step: s.id, lang: 'hi-Latn' });
      add({ sys: true, icon: 'flag', text: 'Outcome · ' + s.title + ' · would set Lead ' + lead().no + ' to ' + (VF.leadWord(f.lead) || 'unchanged') + '. Not written: this is a test.' });
      t.status = 'done'; var turns = t.turns.filter(function (x) { return !x.sys; }).length;
      add({ sys: true, icon: 'circle-check', tone: 'success', text: 'Reached “' + s.title + '” · ' + turns + ' turns · ' + t.path.length + ' steps · ' + V.fmt.duration(t.t) });
      if (T.rev === 'draft') S.lastTest = { hash: VF.hash(S.m.steps), at: VF.nowIso(), kind: T.mode === 'voice' ? 'Browser test' : 'Text test', reached: s.title };
      render(); VF.renderCanvas(); V.announce('Test finished. Reached ' + s.title + '.'); return;
    }
    follow(s, s.outs[0] && s.outs[0].id);
  }
  function reply(outId, text) {
    var t = S.test, s = by(t.current); if (!s || t.status !== 'waiting') return;
    var o = s.outs.filter(function (x) { return x.id === outId; })[0];
    add({ caller: true, text: text || (o ? (o.fb ? '(no reply)' : (o.ex || [])[0] || o.label) : ''), lang: 'hi-Latn' });
    if (s.type === 'action.meeting') { add({ sys: true, icon: 'calendar-plus', text: outId === 'booked' ? 'Book meeting · simulated · would book Sat 11 am. No invite sent.' : 'Book meeting · simulated · no time suited. Nothing booked.' }); if (outId === 'booked' && s.f.confirmWa) add({ sys: true, icon: 'message-circle', text: 'Send WhatsApp · simulated · would send “' + s.f.template + '”. Not sent.' }); if (s.f.saveTo && outId === 'booked') t.captured[s.f.saveTo] = 'Sat, 11 am'; }
    if (s.f.saveTo && s.type !== 'action.meeting' && o) t.captured[s.f.saveTo] = o.label;
    t.status = 'running'; render(); setTimeout(function () { follow(s, outId); }, 300);
  }
  function typed(text) {
    var t = S.test, s = by(t.current); if (!s || !text.trim()) return;
    var n = text.trim().toLowerCase(), hit = null;
    if (s.type === 'action.meeting') hit = /nahi|not|no|baad/.test(n) ? 'notbooked' : 'booked';
    else {
      /* FD-R2-05: examples are what the caller says. Split them on commas and " · ", normalise case, punctuation and Latin
         diacritics (Devanagari keeps its marks), and match a phrase that appears in the reply as whole words. */
      var norm = function (x) { return ' ' + String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?;:"'’“”()।…-]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; };
      var nn = norm(n);
      s.outs.forEach(function (o) { if (hit || o.fb) return; [o.label].concat(o.ex || []).forEach(function (e) {
        var whole = norm(e); if (whole.trim() && (nn.indexOf(whole) >= 0 || whole.indexOf(nn) >= 0)) { hit = o.id; return; }
        String(e).split(/,| · /).forEach(function (part) { var p = norm(part); if (!hit && p.trim() && nn.indexOf(p) >= 0) hit = o.id; }); }); });
    }
    if (hit) return reply(hit, text.trim());
    add({ caller: true, text: text.trim() });
    if (s.f.unclear !== 'Go to No reply' && !t.asked[s.id]) { t.asked[s.id] = 1; add({ text: 'Maaf kijiye, main samajh nahi paayi. ' + sample(s.f.prompt || ''), step: s.id, lang: s.f.lang }); render(); var c = $('#fd-t-in'); if (c) c.focus(); return; }
    var fb = s.outs.filter(function (o) { return o.fb; })[0]; t.status = 'running'; render(); setTimeout(function () { follow(s, fb ? fb.id : s.outs[0].id); }, 300);
  }
  /* One trace along the taken connector over --dur-trace; the connector then stays active (FD1 §7.2). */
  function trace(key) {
    setTimeout(function () {
      var line = $('#fd-edges .fe[data-edge="' + key + '"]'); if (!line || V.reducedMotion()) return;
      var p = line.cloneNode(); p.setAttribute('class', 'fe fe--active fd-trace'); p.removeAttribute('marker-end'); var len = line.getTotalLength ? line.getTotalLength() : 400; p.style.setProperty('--len', len); p.style.strokeDasharray = len; line.parentNode.appendChild(p);
      setTimeout(function () { p.remove(); }, 700);
    }, 30);
  }

  function onClick(e) {
    var b = e.target.closest('[data-t], [data-reply], [data-goto]'); if (!b || b.getAttribute('aria-disabled') === 'true') return;
    if (b.hasAttribute('data-reply')) return reply(b.getAttribute('data-reply'));
    if (b.hasAttribute('data-goto')) { var id = b.getAttribute('data-goto'); if (V.drawer.isOpen('fd-test')) V.drawer.close('fd-test', 'navigate'); VF.select([id]); VF.focusStep(id); VF.openInspector(id); return; }
    var a = b.getAttribute('data-t');
    if (a === 'close') closeTest(); if (a === 'start' || a === 'restart') start(); if (a === 'retry') { T.retried = true; render(); }
    if (a === 'micretry') V.announce('Still blocked. Allow the microphone in your browser’s site settings.');
    if (a === 'send') { var c = $('#fd-t-in'); typed(c.value); }
  }
  function onKey(e) {
    if (e.target.id === 'fd-t-in' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (S.test && S.test.status === 'waiting') typed(e.target.value); }
    if (e.target.id === 'fd-t-in' && e.key === 'Escape' && !V.drawer.isOpen('fd-test')) { e.preventDefault(); var cur = S.test && S.test.current; if (cur && VF.step(cur)) VF.focusStep(cur); }
  }
  function onChange(e) {
    var k = e.target.closest('[data-tk]'); if (!k) return; k = k.getAttribute('data-tk'); var v = e.detail.value;
    if (k === 'mode') { if (v === 'phone') { callGate(e.detail.item || e.target); return; } T.mode = v; S.test = { status: 'idle', turns: [], path: [], reached: [], edges: [] }; clearMarks(); render(); }
    if (k === 'rev') { T.rev = v; S.test.status = 'idle'; render(); }
    if (k === 'start') { T.start = v; S.test.status = 'idle'; render(); }
  }
  /* Call my phone… (FD2 §13.2): the Call gate, the user’s own verified number only; billed as a test call. */
  function callGate(anchor) {
    var g = $('#fd-callgate'), bal = (V.data.wallet.states[V.walletState()] || {}).balance, empty = bal <= 0;
    g.innerHTML = '<div class="gate-head"><h2 class="gate-title" id="fd-callgate-t">Call my phone</h2><span class="gate-sub">Test call on the draft · ' + esc(S.m.meta.name) + '</span></div><div class="gate-body"><ul class="gate-list">' +
      '<li class="gate-row"><span class="gate-mark gate-mark--pass" aria-hidden="true">' + VF.icon('check', 'sm') + '</span><span class="gate-text">Your verified number ' + V.ui.phoneText(VF.WS.ownNumber) + '<span class="gate-meta">A draft never calls anyone else.</span></span><span></span></li>' +
      '<li class="gate-row"><span class="gate-mark gate-mark--' + (empty ? 'block' : 'pass') + '" aria-hidden="true">' + VF.icon(empty ? 'x' : 'check', 'sm') + '</span><span class="gate-text">' + (empty ? 'Wallet is ₹0. Top up to place phone calls.' : 'Wallet ' + esc(V.fmt.money(bal))) + '</span><span></span></li>' +
      '<li class="gate-row"><span class="gate-mark gate-mark--pass" aria-hidden="true">' + VF.icon('check', 'sm') + '</span><span class="gate-text">Caller ID ' + V.ui.phoneText('+91 80 •••• 2210') + '</span><span></span></li></ul>' +
      '<div class="gate-cost"><span>' + esc(V.fmt.callRange(1, 1, 2, 0.04)) + '</span><b>Billed at ₹0.04/s</b></div><p class="gate-note">Not counted in reports. Side effects are simulated.</p></div>' +
      '<div class="gate-foot"><span class="gate-reason">' + (empty ? 'Top up to call.' : 'Your phone rings now.') + '</span><button type="button" class="btn btn--tertiary" data-popover-close>Cancel</button><button type="button" class="btn btn--primary" data-cg="go"' + (empty ? ' aria-disabled="true"' : '') + '>Call my phone</button></div>';
    g.onclick = function (ev) { var b = ev.target.closest('[data-cg]'); if (!b || b.getAttribute('aria-disabled') === 'true') return; V.popover.close('fd-callgate'); V.toast.info('Calling ' + VF.WS.ownNumber + '… This prototype places no call.'); };
    var trig = $('#fd-test [data-tk="mode"] [data-value="phone"]') || anchor;
    V.popover.open(trig, 'fd-callgate', { modal: true, placement: 'bottom-start', onClose: function () { var r = $('#fd-test [data-tk="mode"] [data-value="' + T.mode + '"]'); if (r) V.seg.select(r); } });
  }
  VF.testInit = function () { ensure(); };
})(window, document);
