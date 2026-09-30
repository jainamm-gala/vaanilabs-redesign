/* Vaani Labs prototype · Cockpit · the call machine (CK §1.2, data-nav §12.1): Idle → Dialling… → Ringing… → Live ⇄ On hold →
   Wrap-up → Ended, with No answer · Busy · Voicemail · Failed as terminal outcomes. Calls are simulated on one page clock:
   scripted turns stream in (partial → final), captured values and the flow step update, the timer and cost run from the
   start time, and state changes are announced once (debounced 500 ms). Rendering is in cockpit-callcard.js. */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  var C = CK.call = {};
  var V, esc, st, D;
  CK.calls = [];
  C.n = 0;
  function init() { V = CK.V; esc = CK.esc; st = CK.st; D = CK.D; }
  C.byId = function (id) { for (var i = 0; i < CK.calls.length; i++) if (CK.calls[i].id === id) return CK.calls[i]; return null; };
  C.active = function (c) { return c && ['dialling', 'ringing', 'live', 'hold'].indexOf(c.state) >= 0; };
  /* The one live-call selector: every call in progress (Dialling, Ringing, Live, On hold). The header meta, the CallSwitcher,
     the "Live now" group and the nav badge / Baseline (through Vaani.baseline.facts) all count from it, so they agree. */
  C.live = function () { return CK.calls.filter(C.active); };
  C.elapsed = function (c) { return Math.max(0, (c.endAt != null ? c.endAt : CK.sec()) - c.start); };
  C.inState = function (c) { return Math.max(0, CK.sec() - c.since); };
  /* Billing counts connected seconds only (R3C-01, CK §4.1): from the moment the call went Live to its end. A call that never
     connected (Failed, Busy, No answer, still ringing) has billed 0 s. */
  C.connected = function (c) { return !!(c.stateTimes && c.stateTimes.live != null); };
  C.billed = function (c) { if (!C.connected(c)) return 0; var end = c.endAt != null ? c.endAt : CK.sec(); return Math.max(0, end - (c.start + c.stateTimes.live)); };

  /* ---------- scripts: the fictional turns (our own copy of data.js phrasing), per language style ---------- */
  var TX = {
    greet: { hi: 'नमस्ते {f} जी, मैं Sample Realty से वाणी बोल रही हूँ। क्या अभी दो मिनट बात हो सकती है?', 'hi-Latn': 'Namaste {f} ji, main Sample Realty se Vaani bol rahi hoon. Kya abhi do minute baat ho sakti hai?', en: 'Hello {f}, this is Vaani calling from Sample Realty. Is this a good time to talk for two minutes?' },
    ok: { hi: 'हाँ जी, बोलिए।', 'hi-Latn': 'Haan ji, boliye.', en: 'Yes, go ahead.' },
    ask: { hi: 'आपने मेट्रो के पास {u} के बारे में पूछा था। क्या आप इस हफ़्ते साइट विज़िट करना चाहेंगे?', 'hi-Latn': 'Aapne metro ke paas {u} ke baare mein poocha tha. Kya aap is hafte site visit karna chahenge?', en: 'You had asked about a {u} near the metro. Would you like to visit the site this week?' },
    price: { hi: 'प्राइस क्या है? बजट 85 लाख तक है।', 'hi-Latn': 'Price kya hai? Budget 85 lakh tak hai.', en: "What’s the price? My budget is up to 85 lakh." },
    priceAns: { hi: '{u} 78 लाख से शुरू होते हैं, पार्किंग के साथ। क्या शनिवार को साइट देखना ठीक रहेगा?', 'hi-Latn': '{u} 78 lakh se shuru hote hain, parking ke saath. Kya Saturday ko site dekhna theek rahega?', en: 'The {u} starts at 78 lakh, with parking. Would Saturday work for a site visit?' },
    yes: { hi: 'हाँ, शनिवार सुबह ठीक रहेगा।', 'hi-Latn': 'Haan, Saturday morning theek rahega.', en: 'Yes, Saturday morning works for me.' },
    booked: { hi: 'बहुत बढ़िया। मैंने शनिवार सुबह 11 बजे का स्लॉट बुक कर दिया है। कन्फ़र्मेशन WhatsApp पर आ जाएगा।', 'hi-Latn': 'Bahut badhiya. Maine Saturday 11 baje ka slot book kar diya hai. Confirmation WhatsApp par aa jayega.', en: "Great. I’ve booked Saturday at 11 am. You’ll get a confirmation on WhatsApp." },
    thanks: { hi: 'ठीक है, धन्यवाद।', 'hi-Latn': 'Theek hai, thank you.', en: 'Okay, thank you.' },
    close: { hi: 'धन्यवाद {f} जी, आपका दिन शुभ हो।', 'hi-Latn': 'Dhanyavaad {f} ji, aapka din shubh ho.', en: 'Thank you, {f}. Have a good day.' },
    vm: { hi: 'नमस्ते, Sample Realty से वाणी। हम कल फिर फ़ोन करेंगे।', 'hi-Latn': 'Namaste, Sample Realty se Vaani. Hum kal phir call karenge.', en: "Hello, this is Vaani from Sample Realty. We’ll call again tomorrow." }
  };
  function style(lang) { return lang === 'hi' || lang === 'mr' ? 'hi' : lang === 'en' || lang === 'ta' ? 'en' : 'hi-Latn'; }
  function say(k, s, f, u) { return TX[k][s].replace(/\{f\}/g, f).replace(/\{u\}/g, u || '2 BHK'); }
  var STEPS = { greet: ['Greeting', 1, 'trigger', 'phone-outgoing', 'n1'], ask: ['Ask about a site visit', 3, 'logic', 'diamond', 'n3'], book: ['Book site visit', 4, 'action', 'calendar-plus', 'n4'], out: ['Visit booked', 6, 'outcome', 'flag', 'n6'] };
  /* Offsets in seconds after Live. Caller turns are "You" on test calls and browser tests. */
  function outboundScript(c) {
    var s = style(c.lead ? c.lead.language : 'hi-Latn'), f = c.lead ? c.lead.first : 'Anika', u = c.lead ? c.lead.unit : '2 BHK';
    return [
      { o: 1, t: 'step', k: 'greet' }, { o: 1, t: 'turn', who: 'agent', k: 'greet', s: s, p: 2.4 },
      { o: 6, t: 'turn', who: 'caller', k: 'ok', s: s, p: 0.8 },
      { o: 8.5, t: 'step', k: 'ask' }, { o: 8.5, t: 'turn', who: 'agent', k: 'ask', s: s, p: 2.6 },
      { o: 14, t: 'turn', who: 'caller', k: 'price', s: s, p: 1.4 }, { o: 16, t: 'cap', key: 'Budget', value: 'Up to ₹85 L' },
      { o: 16.5, t: 'sys', text: 'Knowledge lookup · price-sheet.pdf · 2 passages', icon: 'book-open' },
      { o: 17.5, t: 'turn', who: 'agent', k: 'priceAns', s: s, p: 2.4, src: 'Knowledge · price-sheet.pdf' },
      { o: 24, t: 'turn', who: 'caller', k: 'yes', s: s, p: 1.4 }, { o: 26, t: 'cap', key: 'Preferred day', value: 'Saturday, morning' },
      { o: 27, t: 'sys', text: 'Moved to step 4 · Book site visit', icon: 'arrow-right' }, { o: 27, t: 'step', k: 'book' },
      { o: 28.5, t: 'turn', who: 'agent', k: 'booked', s: s, p: 2.6 }, { o: 32, t: 'cap', key: 'Site visit', value: 'Booked · Sat 3 Oct, 11:00 am' },
      { o: 36, t: 'turn', who: 'caller', k: 'thanks', s: s, p: 0.8 },
      { o: 38.5, t: 'turn', who: 'agent', k: 'close', s: s, p: 1.6 }, { o: 42, t: 'step', k: 'out' },
      { o: 42, t: 'sys', text: 'Outcome · Visit booked', icon: 'flag' }, { o: 44, t: 'end', result: 'completed', outcome: 'Visit booked' }
    ].map(function (e) { e.f = f; e.u = u; return e; });
  }
  /* The supervised calls continue from where data.js leaves them. */
  function live01Script() {
    return [{ at: 2.5, t: 'final', id: 'l5', text: 'Haan, Saturday morning theek rahega, bas address WhatsApp kar dijiye.' },
      { at: 4, t: 'sys', text: 'Moved to step 4 · Book site visit', icon: 'arrow-right' }, { at: 4, t: 'step', k: 'book' },
      { at: 5.5, t: 'turn', who: 'agent', k: 'booked', s: 'hi-Latn', p: 2.6, f: 'Aarav' }, { at: 9, t: 'cap', key: 'Site visit', value: 'Booked · Sat 3 Oct, 11:00 am' },
      { at: 16, t: 'turn', who: 'caller', k: 'thanks', s: 'hi-Latn', p: 1, f: 'Aarav' }, { at: 20, t: 'turn', who: 'agent', k: 'close', s: 'hi-Latn', p: 1.6, f: 'Aarav' },
      { at: 26, t: 'step', k: 'out' }, { at: 26, t: 'sys', text: 'Outcome · Visit booked', icon: 'flag' }, { at: 58, t: 'end', result: 'completed', outcome: 'Visit booked' }];
  }

  /* ---------- creating calls ---------- */
  function mk(o) {
    return Object.assign({ turns: [], queue: [], captured: [{ key: 'Budget', value: null }, { key: 'Preferred day', value: null }, { key: 'Site visit', value: null }], step: null,
      line: { level: 'good', rtt: 180 }, talk: { interruptions: 0 }, stateTimes: {}, takenOver: false, muted: false, transfer: null, mine: false, newTurns: 0, recording: true }, o);
  }
  C.seed = function () {
    init();
    var now0 = Date.parse(D.meta.now);
    (D.live || []).forEach(function (x) {
      var ago = (now0 - Date.parse(x.startedAt)) / 1000; if (x.id === 'call_live02' && CK.has('stuck')) ago = 68;
      var c = mk({ id: x.id, lead: CK.leadById(x.leadId), kind: 'real', direction: x.direction, flow: { id: x.flow.id, name: x.flow.name, version: x.flow.version, draft: false }, voiceId: x.voice || 'vaani', lang: 'auto', start: -ago, state: x.state });
      c.stateTimes = { dialling: 0, ringing: (x.stateTimes || {}).ringing || 3 }; if (x.state === 'live') c.stateTimes.live = x.stateTimes.live;
      c.since = -(ago - (c.stateTimes[x.state] || 0));
      if (x.turns) c.turns = x.turns.map(function (t) { return Object.assign({}, t); });
      if (x.captured) c.captured = x.captured.map(function (k) { return { key: k.key, value: k.value }; });
      if (x.step) c.step = { label: x.step.label, no: x.step.no, of: x.step.of, phase: 'logic', glyph: 'diamond', node: 'n3' };
      if (x.lineQuality) c.line = { level: x.lineQuality.level, rtt: x.lineQuality.rttMs };
      if (x.talk) c.talk = { interruptions: x.talk.interruptions };
      if (x.id === 'call_live01') c.queue = live01Script();
      if (x.id === 'call_live02' && !CK.has('stuck')) { c.queue = [{ at: 5, t: 'state', to: 'live' }]; c.onLive = true; }
      if (x.id === 'call_live02' && CK.has('stuck')) c.stale = true;
      CK.calls.push(c);
    });
  };
  function schedule(c, base) { outboundScript(c).forEach(function (e) { e.at = base + e.o; c.queue.push(e); }); c.queue.sort(function (a, b) { return a.at - b.at; }); }
  /* Done from the gate: the call exists only after the server returns its id; then Dialling. */
  C.place = function (o) {
    init();
    var t = o.target, kind = CK.kindOf(t), now = CK.sec();
    var c = mk({ id: 'call_new' + String(++C.n).padStart(2, '0'), mine: true, kind: kind, direction: 'outbound', lead: t.kind === 'lead' ? t.lead : null,
      who: t.kind === 'lead' ? t.lead.name : t.kind === 'self' ? 'Your phone' : t.display, phoneMasked: t.kind === 'lead' ? t.lead.phone.masked : t.kind === 'self' ? CK.self.masked : null, phoneTyped: t.kind === 'number' ? t.display : null,
      flow: { id: o.flow.id, name: o.flow.name, version: o.flow.version, draft: o.flow.draft }, voiceId: o.voiceId, lang: o.lang, start: now, since: now, state: 'dialling', key: o.key, overrides: st.overrides });
    c.stateTimes = { dialling: 0 };
    var endKind = CK.has('no-answer') ? 'no_answer' : CK.has('busy') ? 'busy' : CK.has('voicemail') ? 'voicemail' : CK.has('failed') ? 'failed' : null;
    if (endKind === 'failed') c.queue.push({ at: now + 2.5, t: 'terminal', to: 'failed', reason: "Couldn’t reach the phone line. You were not charged." });
    else {
      c.queue.push({ at: now + 2.2, t: 'state', to: 'ringing' });
      if (endKind === 'busy') c.queue.push({ at: now + 4.5, t: 'terminal', to: 'busy', reason: 'Busy.' });
      else if (endKind === 'no_answer') c.queue.push({ at: now + 9, t: 'terminal', to: 'no_answer', reason: 'No answer. It rang for 7 s.' });   /* the sentence matches the ring time the stepper shows (R3C-04) */
      else if (endKind === 'voicemail') { c.queue.push({ at: now + 6, t: 'turn', who: 'agent', k: 'vm', s: style(c.lead ? c.lead.language : 'hi'), p: 1.5, f: c.lead ? c.lead.first : '' }); c.queue.push({ at: now + 9.5, t: 'terminal', to: 'voicemail', reason: 'Reached voicemail. The agent left a short message.' }); }
      else { c.queue.push({ at: now + 5.2, t: 'state', to: 'live' }); c.onLive = true; }
    }
    CK.calls.push(c); CK.session.remove('number');
    CK.select(c.id, { focus: true });
    CK.announceState('Dialling'); C.chrome();
    return c;
  };
  /* Talk in browser: the microphone is asked on the click, then the Browser test starts directly (no gate; rings nobody). */
  C.startBrowser = function (btn) {
    init();
    var go = function () {
      var now = CK.sec(), f = CK.flow();
      var c = mk({ id: 'call_new' + String(++C.n).padStart(2, '0'), mine: true, kind: 'browser', direction: 'browser', lead: null, who: 'You', flow: { id: f.id, name: f.name, version: f.version, draft: f.draft },
        voiceId: st.voiceId, lang: st.lang, start: now, since: now, state: 'dialling', recording: false, line: { level: 'good', rtt: 90 } });
      c.stateTimes = { dialling: 0 }; c.queue.push({ at: now + 1.2, t: 'state', to: 'live' }); c.onLive = true;
      CK.calls.push(c); st.micSession = 'this browser test';
      CK.select(c.id, { focus: true }); CK.announceState('Connecting'); C.chrome();
    };
    if (st.mic === 'prompt') { btn.setAttribute('aria-busy', 'true'); V.announce('Asking for your microphone.'); setTimeout(function () { btn.removeAttribute('aria-busy'); st.mic = 'granted'; go(); }, 500); }
    else go();
  };

  /* ---------- the machine ---------- */
  var WORD = { dialling: 'Dialling', ringing: 'Ringing', live: 'Call live', hold: 'On hold', wrapup: 'Call ended. Wrap-up', ended: 'Call ended', no_answer: 'No answer', busy: 'Busy', voicemail: 'Reached voicemail', failed: 'Call failed' };
  C.setState = function (c, to, o) {
    init();
    o = o || {}; c.state = to; c.since = o.at != null ? o.at : CK.sec(); c.stateTimes[to] = c.since - c.start; c.stale = false;
    if (!C.active(c) && c.endAt == null) c.endAt = c.since;
    if (to === 'live' && c.onLive) { c.onLive = false; c.pulse = true; if (c.kind === 'browser') schedule(c, c.since); else schedule(c, c.since); }
    var sel = st.selected === c.id;
    if (sel || c.mine) CK.announceState(c.kind === 'browser' ? (to === 'live' ? 'Browser test live' : to === 'ended' ? 'Browser test ended' : WORD[to]) : (WORD[to] + (o.reason && !C.active(c) && to !== 'wrapup' ? '. ' + o.reason : '')));
    if (!C.active(c) && c.mine && (c.kind === 'browser' || c.takenOver)) st.micSession = null;
    if (sel) { CK.cardView.render(c, { stateOnly: true }); CK.feed.state(c); }
    CK.list.render(); CK.header(); C.chrome();
  };
  /* While you have taken over (CK §4.1 'Taken over'), Vaani is paused: the flow does not look up knowledge, capture, advance steps
     or end the call, and the agent's lines become yours, shown as "You" turns (as on Rep console). R3C-10. */
  var YOU = {
    hi: ['जी, 2 BHK 78 लाख से शुरू होते हैं, पार्किंग के साथ।', 'ठीक है, मैं शनिवार सुबह के लिए नोट कर लेती हूँ।', 'धन्यवाद, कन्फ़र्मेशन WhatsApp पर भेज दूँगी।'],
    'hi-Latn': ['Ji, 2 BHK 78 lakh se shuru hote hain, parking ke saath.', 'Theek hai, main Saturday morning ke liye note kar leti hoon.', 'Thank you, confirmation WhatsApp par bhej dungi.'],
    en: ['The 2 BHK starts at 78 lakh, with parking.', 'All right, I’ll note Saturday morning for you.', 'Thank you. I’ll send the confirmation on WhatsApp.']
  };
  function runEvent(c, e) {
    var T = e.at != null ? e.at : CK.sec();
    if (c.takenOver && (e.t === 'step' || e.t === 'cap' || e.t === 'sys' || e.t === 'end')) return;
    if (c.takenOver && e.t === 'turn' && e.who === 'agent') {
      var ys = YOU[e.s] || YOU.en, yt = ys[(c.youN = (c.youN || 0) + 1) % ys.length];
      C.addTurn(c, { id: 'y' + c.turns.length, speaker: 'agent', name: 'You', rep: true, startMs: (T - c.start) * 1000, text: yt, lang: e.s, final: true });
      return;
    }
    if (e.t === 'state') { C.setState(c, e.to, { at: T }); return; }
    if (e.t === 'terminal') { c.reason = e.reason; c.result = e.to; if (c.mine && c.kind === 'real') c.wrap = { phase: 'form', summary: 'none' }; C.setState(c, c.mine && c.kind === 'real' ? e.to : 'ended', { reason: e.reason, at: T }); return; }
    if (e.t === 'step') { var s = STEPS[e.k]; c.step = { label: s[0], no: s[1], of: 8, phase: s[2], glyph: s[3], node: s[4] }; if (st.selected === c.id) CK.cardView.update(c); return; }
    if (e.t === 'cap') { c.captured.forEach(function (k) { if (k.key === e.key) k.value = e.value; }); if (st.selected === c.id) CK.cardView.update(c); return; }
    if (e.t === 'sys') { C.addTurn(c, { id: 's' + c.turns.length, speaker: 'system', text: e.text, icon: e.icon, startMs: (T - c.start) * 1000 }); return; }
    if (e.t === 'final') { c.turns.forEach(function (t) { if (t.id === e.id) { t.text = e.text; t.final = true; t.endMs = (T - c.start) * 1000; C.turnFinal(c, t); } }); return; }
    if (e.t === 'turn') {
      var text = say(e.k, e.s, e.f, e.u), start = (T - c.start) * 1000, cut = text.split(' ');
      var turn = { id: 't' + c.turns.length + '_' + e.k, speaker: e.who, name: e.who === 'agent' ? 'Vaani' : 'Caller', startMs: start, text: cut.slice(0, Math.max(2, Math.ceil(cut.length * 0.55))).join(' '), lang: e.s, final: false,
        step: e.who === 'agent' && c.step ? { label: c.step.label, href: 'flow-designer.html?node=' + c.step.node } : undefined, source: e.src ? { kind: 'knowledge', label: e.src } : undefined, full: text };
      if (c.takenOver && e.who === 'agent') return;
      C.addTurn(c, turn);
      c.queue.push({ at: T + (e.p || 1.5), t: 'final', id: turn.id, text: text }); c.queue.sort(function (a, b) { return a.at - b.at; });
      return;
    }
    if (e.t === 'end') {
      c.result = 'completed'; c.outcome = e.outcome; c.outcomeFrom = 'flow';
      if (!c.mine) { c.wrap = null; C.setState(c, 'ended', { at: T }); return; }
      if (c.kind === 'real') { c.wrap = { phase: 'form', summary: 'pending' }; C.setState(c, 'wrapup', { at: T }); setTimeout(function () { if (!c.wrap) return; c.wrap.summary = 'ready'; if (st.selected === c.id) { CK.cardView.update(c); CK.feed.state(c); } }, 1600); }
      else C.setState(c, 'ended', { at: T });
    }
  }
  /* Prototype only: move a call forward in time so a demo state (?demo=wrapup, takeover…) opens mid-call. */
  C.ff = function (c, secs) { c.start -= secs; c.since -= secs; c.queue.forEach(function (e) { e.at -= secs; }); C.tick(); };
  C.addTurn = function (c, t) { c.turns.push(t); if (st.selected === c.id) { CK.feed.addTurn(c, t); if (t.speaker !== 'system') CK.cardView.talk(c); } };
  C.turnFinal = function (c, t) {
    if (st.selected === c.id) { CK.feed.updateTurn(c, t); if (t.speaker !== 'system') CK.announceTurn(t.speaker === 'caller' ? (c.kind === 'real' ? 'Caller' : 'You') : (t.name || 'Vaani'), t.text); CK.cardView.talk(c); }
  };
  /* One shared ticker: timers (1 s), due events (250 ms), stale rule (60 s without an event). */
  var lastSec = -1;
  C.tick = function () {
    init();
    var now = CK.sec();
    CK.calls.forEach(function (c) {
      while (c.queue.length && c.queue[0].at <= now && (C.active(c) || c.queue[0].t === 'final' || c.queue[0].t === 'cap')) runEvent(c, c.queue.shift());
      if (!c.stale && (c.state === 'ringing' || c.state === 'dialling') && now - c.since > 60) { c.stale = true; if (st.selected === c.id) CK.cardView.render(c, { stateOnly: true }); CK.list.render(); }
    });
    var s = Math.floor(now);
    if (s !== lastSec) { lastSec = s; CK.$$('[data-ck-timer]').forEach(function (el) { var c = C.byId(el.getAttribute('data-ck-timer')); if (!c) return; var mode = el.getAttribute('data-ck-mode'); el.textContent = CK.tc(mode === 'state' ? C.inState(c) : C.elapsed(c)); });
      CK.$$('[data-ck-cost]').forEach(function (el) { var c = C.byId(el.getAttribute('data-ck-cost')); if (c && C.connected(c) && !c.stale) el.textContent = CK.money(C.billed(c) * CK.RATE); });
      var mine = C.myActive(); if (mine) CK.$$('[data-vaani="call-timer"]').forEach(function (el) { el.textContent = CK.tc(C.elapsed(mine)); });
      CK.$$('[data-ck-chip]').forEach(function (el) { var c = C.byId(el.getAttribute('data-ck-chip')); if (c) el.setAttribute('aria-label', C.chipName(c)); });
      if (CK.gate) CK.gate.tick(); }
  };

  /* ---------- operator actions ---------- */
  C.myActive = function () { return CK.calls.filter(function (c) { return c.mine && C.active(c) && c.kind !== 'browser'; })[0] || CK.calls.filter(function (c) { return c.mine && C.active(c); })[0] || null; };
  C.end = function (c, byOperator) {
    init();
    c.queue = c.queue.filter(function (e) { return e.t === 'final'; });
    c.result = 'completed';
    /* Ended before the flow’s Outcome step: the outcome comes from the call result ("Talked" when nothing was captured). */
    if (!c.outcome) { c.outcome = c.step && c.step.no >= 4 ? 'Visit booked' : c.captured.some(function (k) { return k.value; }) ? 'Interested' : 'Talked'; c.outcomeFrom = 'call'; }
    if (c.kind === 'real' && (c.mine || c.takenOver)) { c.mine = true; c.wrap = { phase: 'form', summary: 'pending' }; C.setState(c, 'wrapup'); setTimeout(function () { if (!c.wrap) return; c.wrap.summary = 'ready'; if (st.selected === c.id) { CK.cardView.update(c); CK.feed.state(c); } }, 1600); }
    else C.setState(c, 'ended');
    if (byOperator && st.selected === c.id) { var h = d.getElementById('ck-wrap-h') || d.getElementById('ck-ended-h') || d.getElementById('ck-call-h'); CK.focus(h); }
  };
  C.takeOver = function (c) {
    init();
    if (st.mic === 'blocked' || st.mic === 'none') { V.announce("Microphone blocked. Allow it in your browser’s site settings, then Retry."); return; }
    c.takenOver = !c.takenOver; st.mic = 'granted'; st.micSession = c.takenOver ? (c.lead ? c.lead.name : c.who) : null; c.muted = false;
    C.addTurn(c, { id: 's' + c.turns.length, speaker: 'system', icon: 'headphones', text: c.takenOver ? 'You took over · Vaani is paused' : 'Vaani is back on the call', startMs: (CK.sec() - c.start) * 1000 });
    V.announce(c.takenOver ? "You’re talking. Vaani is paused." : 'Vaani is back on the call.');
    CK.cardView.render(c, { keepFocus: c.takenOver ? 'handback' : 'takeover' }); CK.newcall.sync();
  };
  C.mute = function (c) { init(); c.muted = !c.muted; V.announce(c.muted ? 'Microphone muted' : 'Microphone on'); CK.cardView.update(c); CK.cardView.meter(c); };
  C.transfer = function (c, to) {
    init();
    c.transfer = { state: 'pending', to: to }; CK.announceState('Transferring to ' + to);
    CK.cardView.render(c, { stateOnly: true });
    setTimeout(function () {
      if (CK.has('transfer-fail')) { c.transfer = null; C.addTurn(c, { id: 's' + c.turns.length, speaker: 'system', icon: 'phone-forwarded', text: "Transfer didn’t connect. Vaani is back on the call.", startMs: (CK.sec() - c.start) * 1000 }); V.announce("Transfer didn’t connect. Vaani is back on the call."); CK.cardView.render(c, { stateOnly: true }); return; }
      c.transfer = { state: 'done', to: to }; c.outcome = 'Transferred'; c.queue = [];
      C.addTurn(c, { id: 's' + c.turns.length, speaker: 'system', icon: 'phone-forwarded', text: 'Transferred to ' + to, startMs: (CK.sec() - c.start) * 1000 });
      if (c.kind === 'real') { c.mine = true; c.wrap = { phase: 'form', summary: 'pending' }; C.setState(c, 'wrapup', {}); setTimeout(function () { if (!c.wrap) return; c.wrap.summary = 'ready'; if (st.selected === c.id) { CK.cardView.update(c); CK.feed.state(c); } }, 1600); }
      else C.setState(c, 'ended');
    }, 2600);
  };
  /* The TopBar call chip and the Baseline "On call" segment for the operator’s own call, through the shared facts API
     (Vaani.baseline.facts): the band names the kind for tests ("On test call 01:12") and the chip’s name says it too. */
  C.chrome = function () {
    init();
    var mine = C.myActive(), stt = D.state;
    stt.liveCalls = C.live().length;
    stt.myCall = mine ? { id: mine.id, timer: CK.tc(C.elapsed(mine)), kind: mine.kind } : null;
    V.baseline.set(mine ? 'oncall' : stt.liveCalls ? 'activity' : 'default');
    V.baseline.facts({ liveCalls: stt.liveCalls, call: mine ? { id: mine.id, kind: mine.kind, timer: CK.tc(C.elapsed(mine)), name: mine.lead ? mine.lead.name : '' } : null });
  };

  /* ---------- the TopBar call chip on Cockpit (CK §2.4, §3.2, §4.6; R §11.1) ----------
     Below 1024 (the TopBar shell) the Calls column and the header CallSwitcher give way to this chip; it exists only while a
     call is in progress. One call: a CallStateTag chip, "(•) Live 02:14" or "Ringing… 00:07", that opens that call here.
     More than one: "(•) 2 live", which opens the CallSwitcher (a 320 px popover on tablet, a bottom sheet on phones). On
     Cockpit the chip covers every call in progress, not only the operator’s own: it is the supervisor’s way in. The shell
     builds the chip on every other page; this page supplies its own through the same V.shell.callChipHtml slot. */
  /* Its name carries the kind ("Live test call, 01:12", CK §4.5); the timer is the tag’s: the call’s time while live, the
     time in this state while Dialling, Ringing or On hold. The page ticker keeps both current. */
  function chipSec(c) { return c.state === 'live' ? C.elapsed(c) : C.inState(c); }
  C.chipName = function (c) {
    var noun = c.kind === 'test' ? 'test call' : c.kind === 'browser' ? 'browser test' : 'call';
    var name = c.state === 'live' ? 'Live ' + noun : c.state === 'hold' ? noun.charAt(0).toUpperCase() + noun.slice(1) + ' on hold' : (w.Vaani.CALL_STATE[c.state] || ['Live'])[0].replace('…', '') + ' ' + noun;
    return name + ', ' + CK.tc(chipSec(c));
  };
  w.Vaani.shell.callChipHtml = function () {
    init();
    var live = C.live(); if (!live.length) return '';
    if (live.length === 1) {
      var c = live[0], s = V.CALL_STATE[c.state], on = c.state === 'live';
      return '<a class="chip' + (on ? ' chip--live' : '') + '" href="cockpit.html?call=' + esc(c.id) + '" data-chip="call" data-ck-chip="' + esc(c.id) + '"' + (on ? '' : ' data-tone="ringing"') + ' aria-label="' + esc(C.chipName(c)) + '">' +
        (on ? '<span class="live-dot" data-mark></span>' : V.icon(s[1], 'xs')) + esc(s[0]) + ' <span class="num" data-ck-timer="' + esc(c.id) + '"' + (on ? '' : ' data-ck-mode="state"') + '>' + CK.tc(chipSec(c)) + '</span></a>';
    }
    var pop = d.getElementById('ck-switcher-pop'), open = !!(pop && pop.classList.contains('is-floating'));
    return '<button type="button" class="chip chip--live" data-chip="call" data-popover="ck-switcher-pop" data-placement="bottom-end" aria-haspopup="dialog" aria-controls="ck-switcher-pop" aria-expanded="' + open + '" aria-label="Calls, ' + live.length + ' live">' +
      '<span class="live-dot" data-mark></span>' + live.length + ' live' + V.icon('chevron-down', 'xs') + '</button>';
  };
  /* One call: the chip is a link to it (it still works opened in a new tab); here it swaps the card without a reload. Capture
     phase, registered before the leave guard in cockpit.js, which skips a click that is already handled. */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-ck-chip]'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    e.preventDefault();
    if (CK.gate && CK.gate.isOpen()) CK.gate.close('navigate');
    CK.select(a.getAttribute('data-ck-chip'), { focus: true });
  }, true);
})(window, document);
