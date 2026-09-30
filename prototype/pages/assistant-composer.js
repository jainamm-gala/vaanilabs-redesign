/* Vaani Labs prototype · pages/assistant-composer.js — the Composer (02 §8), insert-only suggestions (§7.6), attachments
   (§8.4), Dictate (§11.1) and the Beta voice conversation (§11.2). Your words are never lost: unsent text is kept per chat
   on this device; Enter never sends during an IME composition; suggestions and speech only ever fill the box. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, store = U.store;
  var A = w.VaaniAssistant;
  var ta = $('#as-input'), send = $('#as-send'), stop = $('#as-stop'), dict = $('#as-dictate'), atts = [], DI = { state: 'idle' };
  var TYPES = /\.(pdf|docx|txt|csv|xlsx|json)$/i, MAX = 10 * 1048576;
  function fine() { return w.matchMedia('(pointer: fine)').matches; }

  /* ---------- autosize: 1 row growing to 5, then it scrolls inside (cap 40% of the viewport in CSS) ---------- */
  function size() { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  A.draftKey = function () { return 'vaani:assistant:draft:' + (A.S.chat && A.S.chat.id || 'new'); };
  var saveT = null;
  function saveDraft() { clearTimeout(saveT); saveT = setTimeout(function () { if (ta.value.trim()) store.set(A.draftKey(), ta.value); else store.remove(A.draftKey()); }, 300); }
  A.clearDraft = function () { store.remove(A.draftKey()); };
  A.restoreDraft = function () { var v = store.get(A.draftKey()); ta.value = v || ''; size(); A.composerState(); };

  /* ---------- state of Send / Stop / Dictate / Attach ---------- */
  A.composerState = function () {
    var streaming = A.streaming && A.streaming(), up = atts.filter(function (a) { return a.state === 'uploading'; }).length, ready = atts.filter(function (a) { return a.state === 'ready'; }).length;
    var r = A.S.offline ? 'You’re offline. Your message stays here.' : A.S.loading ? 'Loading this chat…' : A.S.unavailable ? 'The Assistant is unavailable right now. Try again in a few minutes.' : A.S.limit ? 'You’ve reached today’s Assistant limit.' : A.S.rate > 0 ? 'Too many requests. Try again in ' + A.S.rate + ' s.' :
      DI.state !== 'idle' ? 'Stop dictation to send' : up ? 'Wait for ' + A.plural(up, 'file') + ' to finish uploading.' : !ta.value.trim() && !ready ? 'Type a message to send' : '';
    send.hidden = !!streaming; stop.hidden = !streaming;
    if (r) send.setAttribute('aria-disabled', 'true'); else send.removeAttribute('aria-disabled');
    send.setAttribute('data-tooltip', r || 'Send'); if (r) send.removeAttribute('data-kbd'); else send.setAttribute('data-kbd', 'enter');
    $('#as-send-why').textContent = r;
    var dr = A.S.offline ? 'You’re offline.' : A.S.demo === 'mic-busy' ? 'Your microphone is in use by a call in Cockpit.' : A.S.demo === 'mic-unsupported' ? 'Dictation isn’t available in this browser.' : '';
    if (dr) { dict.setAttribute('aria-disabled', 'true'); dict.setAttribute('data-tooltip', dr); } else { dict.removeAttribute('aria-disabled'); dict.setAttribute('data-tooltip', DI.state === 'listening' ? 'Stop dictation · Esc' : 'Dictate'); }
    $('#as-hint').hidden = !fine() || +(store.get('vaani:assistant:sends') || 0) >= 3;
  };

  /* ---------- inserting text (suggestions, "Ask for a different plan", Edit) ---------- */
  A.insertText = function (text, o) {
    o = o || {};
    if (o.replace || !ta.value.trim()) ta.value = text; else ta.value = ta.value.replace(/\s+$/, '') + '\n' + text;
    size(); saveDraft(); A.composerState();
    ta.focus({ preventScroll: true }); var end = ta.value.length; ta.setSelectionRange(end, end);
    if (!o.quiet) A.say(o.replace ? 'Your message is in the message box.' : 'Added to your message. Edit it, then press Send.', false, 'insert');
  };
  function onSug(btn) {
    if (btn.getAttribute('data-action') === 'attach') { pickFor = btn.getAttribute('data-insert'); $('#as-file').click(); return; }
    A.insertText(btn.getAttribute('data-insert'));
  }
  A.onSug = onSug;

  /* ---------- sending ---------- */
  function submit() {
    if (A.streaming()) return;
    var reason = send.getAttribute('aria-disabled') === 'true' ? $('#as-send-why').textContent : '';
    if (reason) { A.say(reason, false, 'send'); return; }
    if (A.S.demo === 'rate-limit' && !A.S.rated) { A.S.rated = true; rateLimit(); return; }
    var text = ta.value.trim(), ready = atts.filter(function (a) { return a.state === 'ready'; }).map(function (a) { return { name: a.name, size: a.size }; });
    if (!text && ready.length) text = 'Take a look at ' + (ready.length === 1 ? 'this file' : 'these files') + '.';
    ta.value = ''; size(); atts = []; renderAtts(); $('#as-cerr').innerHTML = '';
    store.set('vaani:assistant:sends', String(+(store.get('vaani:assistant:sends') || 0) + 1));
    A.send(text, ready); A.composerState(); ta.focus({ preventScroll: true });
  }
  function rateLimit() {
    A.S.rate = 30; A.composerState();
    var box = $('#as-cerr'); box.innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + A.ic('clock') + '<span>Too many requests in a short time. Try again in <span class="num" id="as-rate-n">30</span> s.</span></div></div>';
    var iv = setInterval(function () { A.S.rate -= 1; var n = $('#as-rate-n'); if (n) n.textContent = A.S.rate; if (A.S.rate <= 0) { clearInterval(iv); box.innerHTML = ''; } A.composerState(); }, 1000);
  }
  $('#as-composer').addEventListener('submit', function (e) { e.preventDefault(); submit(); });
  stop.addEventListener('click', function () { A.stop(); });
  ta.addEventListener('keydown', function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === 'Escape') { if (A.streaming()) { e.preventDefault(); e.stopPropagation(); A.stop(); return; } if (DI.state === 'listening') { e.preventDefault(); e.stopPropagation(); finishDictation(); return; } }
    if (DI.state === 'listening' && e.key.length === 1) finishDictation();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); return; }
    if (e.key === 'Enter' && !e.shiftKey && fine() && !w.matchMedia('(pointer: coarse)').matches) { e.preventDefault(); submit(); }
  });
  ta.addEventListener('input', function () { size(); saveDraft(); A.composerState(); });
  ta.addEventListener('paste', function (e) {
    var cd = e.clipboardData; if (!cd) return;
    if (cd.files && cd.files.length) { e.preventDefault(); addFiles(cd.files); return; }
    var txt = cd.getData('text'); if (txt && txt.length > 8000) setTimeout(function () {
      $('#as-cerr').innerHTML = '<p class="as-longhint" role="status">Long text works better as a file. <button type="button" class="btn btn--link" id="as-asfile">Attach as a file</button></p>';
      $('#as-asfile').addEventListener('click', function () { ta.value = ta.value.replace(txt, '').trim(); size(); saveDraft(); $('#as-cerr').innerHTML = ''; addFiles([{ name: 'pasted-text.txt', size: txt.length }]); ta.focus(); });
    }, 0);
  });

  /* ---------- attachments ---------- */
  var pickFor = null;
  $('#as-attach').addEventListener('click', function () { pickFor = null; $('#as-file').click(); });
  $('#as-file').addEventListener('change', function (e) { var f = e.target.files; if (f && f.length) { addFiles(f); if (pickFor) { A.insertText(pickFor, { quiet: true }); A.say('Attached. Turn this document into a draft flow was added to your message.'); } } pickFor = null; e.target.value = ''; });
  function addFiles(list) {
    Array.prototype.slice.call(list).forEach(function (f) {
      if (atts.length >= 5) { A.say('Up to 5 files per message.'); return; }
      var a = { id: U.uid('att'), name: f.name, size: f.size || 1024, state: 'uploading', p: 0 };
      if (!TYPES.test(f.name)) { a.state = 'rejected'; a.why = 'Not a supported file. Attach PDF, DOCX, TXT, CSV, XLSX or JSON.'; }
      else if (a.size > MAX) { a.state = 'rejected'; a.why = 'Larger than 10 MB. Compress it or split it.'; }
      atts.push(a); if (a.state === 'uploading') upload(a);
    });
    renderAtts(); A.composerState();
  }
  A.addFiles = addFiles;
  function upload(a) {
    var iv = setInterval(function () {
      a.p = Math.min(100, a.p + 20);
      if (a.p >= 100) { clearInterval(iv); a.state = A.S.demo === 'upload-fail' && !A.S.upFailed ? (A.S.upFailed = true, 'failed') : 'ready'; A.say(a.state === 'ready' ? a.name + ' is ready.' : 'Couldn’t upload ' + a.name + '.', a.state === 'failed', 'up'); A.composerState(); }
      renderAtts();
    }, 220);
  }
  function renderAtts() {
    var ul = $('#as-atts'); ul.hidden = !atts.length;
    ul.innerHTML = atts.map(function (a) {
      var st = a.state === 'uploading' ? 'Uploading… ' + a.p + '%' : a.state === 'ready' ? 'Ready' : a.state === 'failed' ? 'Couldn’t upload' : a.why;
      return '<li class="as-att as-att--' + a.state + '">' + A.ic(a.state === 'rejected' || a.state === 'failed' ? 'circle-alert' : 'file-text', 'sm') + '<span class="as-att-n" translate="no" title="' + esc(a.name) + '">' + esc(A.midTrunc(a.name)) + '</span>' +
        '<span class="as-att-s num">' + esc(F.bytes(a.size)) + '</span><span class="as-att-st">' + esc(st) + '</span>' + (a.state === 'failed' ? '<button type="button" class="btn btn--link" data-att-retry="' + a.id + '">Retry</button>' : '') +
        '<button type="button" class="ibtn ibtn--sm" data-att-rm="' + a.id + '" aria-label="Remove ' + esc(a.name) + '">' + A.ic('x', 'sm') + '</button>' + (a.state === 'uploading' ? '<span class="as-att-bar" aria-hidden="true"><i style="--p:' + a.p / 100 + '"></i></span>' : '') + '</li>';
    }).join('');
  }
  $('#as-atts').addEventListener('click', function (e) {
    var rm = e.target.closest('[data-att-rm]'), rt = e.target.closest('[data-att-retry]');
    if (rm) { var i = atts.findIndex(function (a) { return a.id === rm.getAttribute('data-att-rm'); }); var nm = atts[i].name; atts.splice(i, 1); renderAtts(); A.composerState(); A.say(nm + ' removed.'); ta.focus(); }
    if (rt) { var a = atts.filter(function (x) { return x.id === rt.getAttribute('data-att-retry'); })[0]; a.state = 'uploading'; a.p = 0; upload(a); renderAtts(); }
  });
  var convo = $('#as-convo'), drop = $('#as-drop'), depth = 0;
  convo.addEventListener('dragenter', function (e) { if (!e.dataTransfer || [].indexOf.call(e.dataTransfer.types || [], 'Files') < 0) return; depth++; drop.hidden = false; });
  convo.addEventListener('dragleave', function () { depth = Math.max(0, depth - 1); if (!depth) drop.hidden = true; });
  convo.addEventListener('dragover', function (e) { if (!drop.hidden) e.preventDefault(); });
  convo.addEventListener('drop', function (e) { if (drop.hidden) return; e.preventDefault(); depth = 0; drop.hidden = true; addFiles(e.dataTransfer.files); ta.focus(); });

  /* ---------- Dictate (simulated speech: the prototype never opens the microphone) ---------- */
  var PHRASE = 'Kal Pune wale leads ko call karne ka plan banao, sirf jinhone site visit ke baare mein poocha tha';
  function setDict(state) {
    DI.state = state; var on = state === 'listening';
    dict.setAttribute('aria-pressed', on ? 'true' : 'false');
    dict.innerHTML = state === 'asking' || state === 'finishing' ? A.spin('md') : A.ic(on ? 'square' : 'mic');
    if (state === 'asking' || state === 'finishing') dict.setAttribute('aria-busy', 'true'); else dict.removeAttribute('aria-busy');
    var strip = $('#as-dict'), im = $('#as-interim');
    strip.hidden = state === 'idle'; im.hidden = state !== 'listening';
    if (state === 'asking') strip.innerHTML = '<span class="as-dict-t">' + A.ic('mic', 'sm') + 'Allow the microphone in your browser’s prompt.</span>';
    if (state === 'listening') strip.innerHTML = '<span class="lvl" data-mark aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Listening…</span><span class="num u-fg-3" id="as-dict-time">00:00</span>' + V.ui.langMark('hi-Latn', 'full');
    if (state === 'finishing') strip.innerHTML = '<span class="status status--progress">' + A.spin('sm') + 'Finishing…</span>';
    A.composerState();
  }
  function micError(msg, act) {
    $('#as-cerr').innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + A.ic('mic-off') + '<span>' + esc(msg) + (act ? ' <button type="button" class="btn btn--link" id="as-mic-act">' + esc(act) + '</button>' : '') + '</span></div></div>';
    var b = $('#as-mic-act'); if (b) b.addEventListener('click', function () { if (act === 'Try again') { A.S.demo = null; $('#as-cerr').innerHTML = ''; startDictation(); } else V.toast.info('Opens the help article on allowing the microphone.'); });
  }
  function startDictation() {
    if (dict.getAttribute('aria-disabled') === 'true') { A.say(dict.getAttribute('data-tooltip')); return; }
    if (DI.state === 'listening') return finishDictation();
    if (DI.state !== 'idle') return;
    if (store.get('vaani:assistant:mic') !== 'ok') { V.popover.open(dict, 'as-mic-pop', { placement: 'top-end' }); return; }
    $('#as-cerr').innerHTML = ''; setDict('asking');
    setTimeout(function () {
      if (A.S.demo === 'mic-denied') { setDict('idle'); return micError('The microphone is blocked for this site. Allow it in your browser’s site settings, then try again.', 'How to allow'); }
      if (A.S.demo === 'mic-none') { setDict('idle'); return micError('No microphone found. Connect one, then try again.', 'Try again'); }
      listen();
    }, 900);
  }
  function listen() {
    setDict('listening'); A.say('Listening', false, 'dict');
    var words = PHRASE.split(' '), i = 0, t0 = Date.now(), reduce = V.reducedMotion();
    DI.sel = [ta.selectionStart, ta.selectionEnd]; DI.text = '';
    DI.meter = setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000), tm = $('#as-dict-time'); if (tm) tm.textContent = F.timecode(s);
      if (!reduce) $$('#as-dict .lvl > i').forEach(function (b) { b.style.setProperty('--l', (0.2 + Math.random() * 0.8).toFixed(2)); });
    }, 80);
    DI.words = setInterval(function () {
      i++; DI.text = words.slice(0, i).join(' '); $('#as-interim').innerHTML = '<span class="u-fg-3">' + esc(DI.text) + '…</span>';
      if (i >= words.length) { clearInterval(DI.words); DI.silence = setTimeout(finishDictation, 2000); }
    }, 260);
  }
  function finishDictation() {
    if (DI.state !== 'listening') return;
    clearInterval(DI.meter); clearInterval(DI.words); clearTimeout(DI.silence);
    var text = DI.text; setDict('finishing');
    setTimeout(function () {
      setDict('idle');
      if (A.S.demo === 'mic-failed') return micError('Couldn’t turn your speech into text. Try again, or type instead.', 'Try again');
      if (text) { var a = DI.sel[0], b = DI.sel[1], v = ta.value, pre = v.slice(0, a), ins = (pre && !/\s$/.test(pre) ? ' ' : '') + text; ta.value = pre + ins + v.slice(b); size(); saveDraft(); A.composerState(); ta.focus(); ta.setSelectionRange(a + ins.length, a + ins.length); A.say('Dictation added. Review it, then press Send.', false, 'dict'); }
      else ta.focus();
    }, 600);
  }
  dict.addEventListener('click', startDictation);
  $('#as-mic-no').addEventListener('click', function () { V.popover.close('as-mic-pop'); });
  $('#as-mic-yes').addEventListener('click', function () { store.set('vaani:assistant:mic', 'ok'); V.popover.close('as-mic-pop'); setTimeout(startDictation, 0); });

  /* ---------- Voice conversation (Beta): voice never approves; nothing connects before the explainer ---------- */
  A.openVoice = function (trigger) { V.popover.open(trigger || $('#as-more-btn'), 'as-voice-pop', { placement: 'bottom-end' }); };
  $('#as-voice-yes').addEventListener('click', function () { V.popover.close('as-voice-pop'); startVoice(); });
  function startVoice() {
    A.S.voice = true; $('#as-composer').hidden = true;
    var bar = U.h('<div class="as-voicebar" id="as-voicebar" role="group" aria-label="Voice conversation"><span class="tag tag--outline">Beta</span><span class="as-vstate" id="as-vstate" role="status">Connecting…</span>' +
      '<button type="button" class="lq lq--good" aria-label="Your connection: Good, 120 milliseconds"><span class="lq-key">Your connection</span><span class="lq-bars" aria-hidden="true" data-mark><i></i><i></i><i></i></span><span class="lq-word">Good</span><span class="lq-ms">120&nbsp;ms</span></button><span class="as-tools-sp"></span>' +
      '<button type="button" class="ibtn" id="as-vmute" aria-label="Mute" aria-pressed="false">' + A.ic('mic-off') + '</button><button type="button" class="btn has-lead" id="as-vend">' + A.ic('phone-off') + 'End voice</button></div>');
    $('#as-dock').appendChild(bar);
    $('#as-vmute').addEventListener('click', function () { var m = this.getAttribute('aria-pressed') !== 'true'; this.setAttribute('aria-pressed', m ? 'true' : 'false'); vstate(m ? 'Muted' : 'Listening'); });
    $('#as-vend').addEventListener('click', endVoice);
    $('#as-vend').focus();
    setTimeout(function () { if (!A.S.voice) return; vstate('Listening');
      A.S.vTimer = setTimeout(function () { if (!A.S.voice) return; vstate('Speaking'); A.send('Haan, un sabko abhi call kar do', []); }, 2600); }, 900);
  }
  function vstate(s) { var e = $('#as-vstate'); if (e) e.textContent = s; }
  A.voiceSpeak = function () { vstate('Speaking'); setTimeout(function () { if (A.S.voice) vstate('Listening'); }, 1600); };
  function endVoice() { A.S.voice = false; clearTimeout(A.S.vTimer); var b = $('#as-voicebar'); if (b) b.remove(); $('#as-composer').hidden = false; ta.focus(); A.say('Voice conversation ended.'); }
})(window, document);
