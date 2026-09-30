/* Vaani Labs prototype · pages/agents-start.js — Start a meeting (03-pages/07 §1.7; gate §5.5 form gate): a modal
   gate sheet (640) with Title, What the agent does (+ Slides / Flow), Voice, When the agent joins, Notes, Recording,
   Who can join, "Before you start" checks, the cost line and one confirming action; then "Room ready" (link, key
   shown once, Copy invite, Open room). Dirty close → inline discard; ⌘/Ctrl+Enter creates exactly one room.
   The prototype shows the target state (MT3 notes, MT7 decks, MT8 join timing shipped). */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt, M = A.mt, DATA = A.data;
  var S = A.start = {}, U = V.util;
  var el, entry, f, snap, key, busy = false, ready = null;

  function defTitle() { return 'Meeting · ' + F.dateShort(F.now().toISOString()) + ', ' + F.time(F.now().toISOString()); }
  function live() { return (V.data.flows || []).filter(function (x) { return x.live && x.status === 'live'; }); }
  function fresh(o) {
    o = o || {}; var fl = live()[0];
    return { title: defTitle(), mode: o.mode === 'flow' ? 'flow' : 'slides', slides: o.deck ? 'deck' : 'live', deck: o.deck || null, deckState: o.deck ? 'ready' : null, flow: fl ? fl.id : null,
      voice: 'vikash', join: 'first', notes: true, rec: false, who: 'key' };
  }
  function flowById(id) { return (V.data.flows || []).filter(function (x) { return x.id === id; })[0]; }
  function flowLabel(x) { return x.name + (x.live ? ' · Live v' + x.live.version : ' · Not published'); }
  function voice() { return (V.data.voices || []).filter(function (v) { return v.id === f.voice; })[0] || { id: 'vikash', name: 'Vikash', tile: 'Vi', languages: ['hi', 'en'] }; }

  /* ---------- checks (GET /api/meetings/readiness; re-run when mode, voice, deck or join change) ---------- */
  function checks() {
    var rows = [], wal = A.wallet, free = M.free.of - M.free.used, seats = M.seats.total - M.seats.used, rate = DATA.rates.agentPerSec;
    if (wal.empty && free <= 0) rows.push({ kind: 'blocking', html: 'No free minutes left and the wallet is ₹0. Top up to start a meeting.', act: '<button type="button" class="btn btn--link gate-act" data-st="topup">Top up</button>' });
    else if (wal.empty && f.join === 'first') rows.push({ kind: 'blocking', html: 'Wallet is ₹0. The agent can’t join until you top up.', act: '<span class="ag-acts"><button type="button" class="btn btn--link gate-act" data-st="topup">Top up</button><button type="button" class="btn btn--link gate-act" data-st="later">Add the agent later</button></span>' });
    else if (wal.empty) rows.push({ kind: 'warning', html: 'Wallet is ₹0. The agent can’t join until you top up. The room still opens on free minutes.', act: '<button type="button" class="btn btn--link gate-act" data-st="topup">Top up</button>' });
    else if (wal.low) rows.push({ kind: 'warning', html: 'Wallet ' + A.money(wal.balance) + ' covers ' + F.runway(wal.balance, rate) + ' of agent time.', act: '<button type="button" class="btn btn--link gate-act" data-st="topup">Top up</button>' });
    else rows.push({ kind: 'pass', html: 'Wallet ' + A.money(wal.balance) + ' covers ' + F.runway(wal.balance, rate).replace(/ \d+ min$/, '') + ' of agent time.' });
    if (!(wal.empty && free <= 0)) rows.push(free > 0 ? { kind: 'pass', html: free + ' of ' + M.free.of + ' free minutes left this month.' } : { kind: 'advisory', html: 'Free minutes are used up. Room time is ' + A.money(DATA.rates.roomPerMin) + '/min from the wallet.' });
    rows.push(seats > 0 ? { kind: 'pass', html: 'Agent seat available · ' + seats + ' of ' + M.seats.total + ' free.' } : { kind: 'warning', html: 'All ' + M.seats.total + ' agent seats are in use right now. End a room before your guests arrive.', act: '<button type="button" class="btn btn--link gate-act" data-st="rooms">Show open rooms</button>' });
    if (f.mode === 'slides' && f.slides === 'deck') {
      if (f.deckState === 'uploading') rows.push({ kind: 'checking', html: 'Uploading deck… ' + (f.deckPct || 0) + '%' });
      else if (f.deckState === 'error') rows.push({ kind: 'blocking', html: 'Couldn’t read this deck. Choose another PPTX or PDF.', act: '<button type="button" class="btn btn--link gate-act" data-st="choose">Choose file</button>' });
      else if (f.deck) rows.push({ kind: 'pass', html: 'Deck ready · ' + f.deck.slides + ' slides.' });
      else rows.push({ kind: 'blocking', html: 'Add a deck, or choose Make slides as it talks.', act: '<button type="button" class="btn btn--link gate-act" data-st="choose">Choose file</button>' });
    }
    if (f.rec) rows.push({ kind: 'advisory', html: 'Guests are told the meeting is recorded.' });
    return A.sortRows(rows);
  }

  /* ---------- render ---------- */
  function fieldsHtml() {
    var flows = V.data.flows.filter(function (x) { return !x.archived; }), fl = flowById(f.flow), v = voice();
    var deckRow = f.deck ? '<ul class="file-list"><li class="file-row">' + icon('file-text') + '<span class="file-main"><span class="file-name" translate="no">' + esc(f.deck.name) + '</span><span class="file-meta">' + F.bytes(f.deck.size) + (f.deckState === 'uploading' ? ' · uploading ' + (f.deckPct || 0) + '%' : ' · ' + f.deck.slides + ' slides') + '</span></span><button class="btn btn--sm btn--tertiary" type="button" data-st="choose">Replace</button><button class="btn btn--sm btn--tertiary" type="button" data-st="remove-deck">Remove</button></li></ul>'
      : '<div class="dropzone ag-dropzone"><span class="dropzone-line">' + icon('upload', 'sm') + '<button type="button" class="btn btn--sm" data-st="choose">Choose a file</button><span class="u-hide-touch">or drop it here</span></span><span class="dropzone-note">PPTX or PDF, up to 20 MB</span></div>';
    return '<div class="ag-ierr-slot" id="mt-st-err"></div>' +
      '<div class="field"><label class="field-label" for="mt-st-title">Title</label><div class="input"><input id="mt-st-title" autocomplete="off" value="' + esc(f.title) + '" aria-describedby="mt-st-title-e mt-st-title-c" data-autofocus translate="no"></div><div class="field-foot"><p class="field-error" id="mt-st-title-e" hidden></p><span class="field-count" id="mt-st-title-c" aria-live="polite"></span></div></div>' +
      '<fieldset class="fieldset"><legend>What the agent does</legend><div class="rcards ag-rcards-2">' +
        rcard('mt-mode', 'slides', 'Present slides', 'Shows slides and answers questions about them. No flow runs.', f.mode === 'slides') + rcard('mt-mode', 'flow', 'Run a flow', 'Talks through a published flow, as it would on a call.', f.mode === 'flow') + '</div></fieldset>' +
      (f.mode === 'slides' ? '<fieldset class="fieldset"><legend>Slides</legend>' + radio('mt-slides', 'live', 'Make slides as it talks', 'Builds slides from the conversation and your knowledge.', f.slides === 'live') + radio('mt-slides', 'deck', 'Show my deck', 'Uses a PPTX or PDF you add.', f.slides === 'deck') +
        (f.slides === 'deck' ? '<div class="field ag-indent"><span class="field-label" id="mt-st-deck-l">Deck</span>' + deckRow + '<input type="file" id="mt-st-file" accept=".pptx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation" class="sr-only" tabindex="-1" aria-labelledby="mt-st-deck-l">' +
          '<p class="field-hint">Or pick a recent deck: ' + DATA.decks.map(function (x) { return '<button type="button" class="btn btn--link" data-st="recent" data-deck="' + x.id + '">' + esc(x.name) + '</button>'; }).join(' · ') + '</p></div>' : '') +
        '<p class="field-hint">No deck yet? <button type="button" class="btn btn--link" data-st="generate">Generate a deck</button></p></fieldset>'
      : '<div class="field"><span class="field-label" id="mt-st-flow-l">Flow</span><button type="button" class="select" data-select id="mt-st-flow" aria-controls="mt-st-flow-lb" aria-label="Flow: ' + esc(fl ? fl.name + ', live version ' + fl.live.version : 'none') + '. Change flow"><span class="select-value">' + esc(fl ? flowLabel(fl) : 'Choose a flow') + '</span>' + icon('chevron-down') + '</button>' +
        '<div class="listbox listbox--wide" id="mt-st-flow-lb" role="listbox" aria-labelledby="mt-st-flow-l" hidden><span class="listbox-group-label" aria-hidden="true">Live</span>' + flows.filter(function (x) { return x.live; }).map(function (x) { return opt(x, true); }).join('') +
        '<span class="listbox-group-label" aria-hidden="true">Not published</span>' + flows.filter(function (x) { return !x.live; }).slice(0, 6).map(function (x) { return opt(x, false); }).join('') + '</div><p class="field-hint">The agent uses the live version. Draft changes aren’t used.</p></div>') +
      '<div class="field"><span class="field-label" id="mt-st-voice-l">Voice</span><div class="voice-compact" role="group" aria-labelledby="mt-st-voice-l"><div class="av av--voice" aria-hidden="true">' + esc(v.tile) + '</div><span><span translate="no">' + esc(v.name) + '</span> · ' + v.languages.map(function (c) { return V.langByCode(c).name; }).join(', ') + '</span>' +
        '<button class="ibtn" type="button" data-st="hear" aria-pressed="false" aria-label="Hear ' + esc(v.name) + '">' + icon('play') + '</button><button type="button" class="btn btn--sm btn--tertiary" data-select id="mt-st-voice" aria-controls="mt-st-voice-lb" aria-label="Change voice"><span class="select-value">Change</span></button></div>' +
        '<div class="listbox" id="mt-st-voice-lb" role="listbox" aria-labelledby="mt-st-voice-l" hidden>' + V.data.voices.map(function (x) { return '<div class="option option--2" role="option" data-value="' + x.id + '" aria-selected="' + (x.id === f.voice) + '"' + (x.available ? '' : ' aria-disabled="true"') + '><span class="option-main"><span class="option-label">' + esc(x.name) + '</span><span class="option-desc">' + esc(x.available ? x.descriptor : 'Not available: speaks Tamil and English') + '</span></span>' + icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div>' +
        '<p class="field-hint">Used for this meeting only. <button type="button" class="btn btn--link" data-st="default-voice">Make default</button></p></div>' +
      '<fieldset class="fieldset"><legend>When the agent joins</legend>' + radio('mt-join', 'first', 'When the first guest joins', 'Agent time starts when it joins.', f.join === 'first') + radio('mt-join', 'manual', 'I’ll add it from the room', 'You add the agent with Add agent… when your guests arrive.', f.join === 'manual') + '</fieldset>' +
      '<div class="l-stack l-stack--sm">' + check('mt-notes', 'Take notes', 'Transcript, summary and action items after the meeting. Everyone in the room sees that notes are on.', f.notes) + check('mt-rec', 'Record the meeting', 'Guests are told the meeting is recorded before they join.', f.rec) + '</div>' +
      '<fieldset class="fieldset"><legend>Who can join</legend><div class="rcards ag-rcards-2">' + rcard('mt-who', 'link', 'Anyone with the link', 'Guests join from the link. Audio and video are encrypted in transit.', f.who === 'link') + rcard('mt-who', 'key', 'Only people with the key', 'Guests enter a key before joining. You’ll get the key after you create the room.', f.who === 'key') + '</div></fieldset>' +
      '<section class="ag-before" aria-labelledby="mt-st-before"><div class="ag-before-head"><h3 class="ag-h3" id="mt-st-before">Before you start</h3><span id="mt-st-sum"></span></div><ul class="gate-list" id="mt-st-checks"></ul>' +
      '<div class="gate-cost ag-cost"><span>Room time uses your free minutes first (' + Math.max(0, M.free.of - M.free.used) + ' of ' + M.free.of + ' left), then ' + A.money(DATA.rates.roomPerMin) + '/min.</span></div><p class="gate-note">Agent time is ' + A.money(DATA.rates.agentPerSec) + '/s while the agent is in the room, about ' + A.money(DATA.rates.agentPerSec * 60) + ' a minute.</p></section>';
  }
  function rcard(name, val, title, desc, on) { return '<label class="rcard"><input type="radio" class="radio" name="' + name + '" value="' + val + '"' + (on ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">' + title + '</span><span class="rcard-desc">' + desc + '</span></span></label>'; }
  function radio(name, val, title, desc, on) { return '<label class="check"><input type="radio" class="radio" name="' + name + '" value="' + val + '"' + (on ? ' checked' : '') + '><span class="check-text">' + title + '<span class="check-desc">' + desc + '</span></span></label>'; }
  function check(id, title, desc, on) { return '<label class="check"><input type="checkbox" class="cb" id="' + id + '"' + (on ? ' checked' : '') + '><span class="check-text">' + title + '<span class="check-desc">' + desc + '</span></span></label>'; }
  function opt(x, ok) { return '<div class="option option--2" role="option" data-value="' + x.id + '" aria-selected="' + (x.id === f.flow) + '"' + (ok ? '' : ' aria-disabled="true"') + '><span class="option-main"><span class="option-label">' + esc(x.name) + '</span><span class="option-desc">' + (ok ? 'Live v' + x.live.version + ' · ' + x.shortId : 'Not published yet. Publish it to use it in meetings.') + '</span></span>' + icon('check', 'sm', { className: 'option-check' }) + '</div>'; }

  function renderChecks() {
    var rows = checks(), s = A.summary(rows, 'Can’t start'), list = $('#mt-st-checks', el); if (!list) return;
    list.innerHTML = rows.map(function (r) { return A.row(r.kind, r.html, { act: r.act }); }).join('');
    $('#mt-st-sum', el).innerHTML = A.statusHtml(s.tone, esc(s.text === 'Ready' ? 'Ready to start' : s.text), { live: true });
    var why = $('#mt-st-why', el), p = $('[data-primary]', el); var block = rows.filter(function (r) { return r.kind === 'blocking' || r.kind === 'checking'; })[0];
    if (why && p) { why.className = 'dlg-why ag-why' + (block ? ' dlg-why--danger' : ''); why.innerHTML = block ? block.html.replace(/<[^>]+>/g, '') : 'You’ll get the link next.'; if (block) p.setAttribute('aria-disabled', 'true'); else p.removeAttribute('aria-disabled'); }
    V.initAll(list);
  }
  function render(focusSel) {
    el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="mt-start-t">Start a meeting</h2></div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close Start a meeting">' + icon('x') + '</button></div></div>' +
      '<div class="sheet-body ag-form">' + fieldsHtml() + '</div>' +
      '<div class="sheet-foot"><p class="dlg-why ag-why" id="mt-st-why"></p><button class="btn btn--tertiary" type="button" data-st="cancel">Cancel</button><button class="btn btn--primary" type="button" data-primary data-st="create" aria-describedby="mt-st-why" aria-keyshortcuts="Control+Enter" data-tooltip="Create room" data-kbd="mod+enter">Create room</button></div>';
    V.initAll(el); renderChecks(); count();
    if (focusSel) { var n = $(focusSel, el); if (n) n.focus(); }
  }
  function count() { var i = $('#mt-st-title', el), c = $('#mt-st-count'); var n = i.value.length, cc = $('#mt-st-title-c', el); cc.textContent = n >= 72 ? n + ' / 80' : ''; cc.className = 'field-count' + (n > 80 ? ' field-count--over' : n >= 72 ? ' field-count--warn' : ''); return c; }
  function titleError() {
    var v = $('#mt-st-title', el).value.trim(), e = $('#mt-st-title-e', el), msg = '';
    if (!v) msg = 'Enter a title for the meeting.';
    else if (M.rooms.some(function (r) { return r.title.toLowerCase() === v.toLowerCase() && r.status !== 'ending'; })) msg = 'A room called ‘' + v + '’ is already open. Choose another title, or open that room.';
    e.hidden = !msg; e.innerHTML = msg ? icon('circle-alert', 'sm') + '<span>' + esc(msg) + (msg.indexOf('already open') > 0 ? ' <button type="button" class="btn btn--link" data-st="open-dup">Open that room</button>' : '') + '</span>' : '';
    $('#mt-st-title', el).setAttribute('aria-invalid', msg ? 'true' : 'false'); return msg;
  }
  function dirty() { return !ready && JSON.stringify(f) !== snap; }

  /* ---------- open / create / room ready ---------- */
  S.open = function (o) {
    o = o || {}; var btn = $('#mt-start-btn');
    if (!M.canStart || A.offline) { var why = !M.canStart ? 'Only admins can start meetings. Ask an admin.' : A.offlineReason; V.announce(why); V.toast.info(why); return; }
    el = $('#mt-start'); ready = null; busy = false; key = A.idem();
    var draft = null; try { draft = JSON.parse(w.sessionStorage.getItem('vaani:agents:start-draft') || 'null'); w.sessionStorage.removeItem('vaani:agents:start-draft'); } catch (e) { draft = null; }
    f = draft || fresh(o); snap = JSON.stringify(fresh(o)); if (draft) snap = '';
    render();
    entry = A.openGateSheet(el, { returnTo: o.returnTo || btn, dirty: dirty, discard: 'Discard this meeting? Your choices will be lost.', onClose: function () { A.url.set({ start: null, mode: null }); if (S.newRoom) { var t = $('#mt-rooms [data-room="' + S.newRoom + '"] .ag-room-title a'); S.newRoom = null; if (t) setTimeout(function () { t.focus(); }, 0); } } });
    A.url.set({ start: 1 });
    var ti = $('#mt-st-title', el); ti.select();
  };
  function create() {
    var p = $('[data-primary]', el); if (busy) return;
    if (titleError()) { $('#mt-st-title', el).focus(); return; }
    if (A.blocked(p)) return;
    busy = true; entry.busy = true; p.setAttribute('aria-busy', 'true'); p.innerHTML = icon('loader-circle', null, { className: 'spinner' }) + 'Creating room…'; $('.sheet-body', el).setAttribute('inert', '');
    setTimeout(function () {
      busy = false; entry.busy = false; $('.sheet-body', el).removeAttribute('inert');
      if (A.is('create-fail') && !S.retried) {
        S.retried = true; p.removeAttribute('aria-busy'); p.textContent = 'Create room';
        $('#mt-st-err', el).innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t create the room. Nothing was charged. <button type="button" class="btn btn--link" data-st="create">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>POST /api/meetings · 502 · Idempotency-Key ' + key + '</code></div></details></div>';
        $('#mt-st-err', el).scrollIntoView({ block: 'nearest' }); return;
      }
      var title = $('#mt-st-title', el).value.trim(), code = ['kpt', 'wmz', 'rha', 'dfe'][M.rooms.length % 4] + '-' + 'nvqs'.slice(0, 4) + '-' + 'x7c', fl = flowById(f.flow);
      var room = { id: 'room_new' + Date.now().toString(36), title: title, status: 'open', createdAt: F.now().toISOString(), startedAt: F.now().toISOString(), code: code, keyRequired: f.who === 'key', key: f.who === 'key' ? '4TQ8-LM2K' : null, keyShown: true, createdBy: V.data.user.short,
        mode: f.mode, does: f.mode === 'flow' ? 'Runs ' + (fl ? fl.name + ' · Live v' + fl.live.version : 'a flow') : 'Presents slides · ' + (f.slides === 'deck' && f.deck ? f.deck.name + ', ' + f.deck.slides + ' slides' : 'made as it talks'), doesShort: f.mode === 'flow' ? 'Runs ' + (fl ? fl.name : 'a flow') : 'Presents slides',
        agent: { state: f.join === 'first' ? 'first-guest' : 'none' }, notes: { on: f.notes, turns: 0 }, recording: { on: false }, people: [], left: [], turns: [] };
      M.rooms.unshift(room); S.newRoom = room.id; ready = room; M.renderHeader(); M.renderLive();
      showReady(room);
    }, 1000);
  }
  function showReady(r) {
    var v = voice();
    $('.sheet-heading', el).innerHTML = '<h2 class="sheet-title" id="mt-start-t" translate="no" tabindex="-1" data-focus-target>' + esc(r.title) + '</h2>';
    $('.sheet-body', el).innerHTML = A.statusHtml('success', 'Room ready · created ' + F.time(r.createdAt), { md: true }) +
      '<div class="field"><label class="field-label" for="mt-rr-link">Join link</label><div class="input input--readonly"><input id="mt-rr-link" readonly value="' + esc(A.rooms.link(r)) + '"><button class="input-btn" type="button" data-st="copy-link" aria-label="Copy join link">' + icon('copy', 'sm') + '</button></div></div>' +
      (r.keyRequired ? '<div class="field"><label class="field-label" for="mt-rr-key">Room key</label><div class="input input--mono input--readonly"><input id="mt-rr-key" readonly value="' + esc(r.key) + '" aria-describedby="mt-rr-key-h"><button class="input-btn" type="button" data-st="copy-key" aria-label="Copy room key">' + icon('copy', 'sm') + '</button></div><p class="field-hint" id="mt-rr-key-h">Send the key separately from the link, for example in a message. It can’t be shown again.</p></div>' : '') +
      '<p>' + A.statusHtml('neutral', f.join === 'first' ? esc(v.name) + ' joins when the first guest arrives.' : 'Add the agent from the room when your guests arrive.') + '</p>';
    $('.sheet-foot', el).innerHTML = '<button class="btn" type="button" data-st="invite">' + icon('copy') + 'Copy invite</button><span class="l-spacer"></span><button class="btn btn--tertiary" type="button" data-st="done">Done</button><button class="btn btn--primary" type="button" data-st="open-ext">' + icon('external-link') + 'Open room<span class="sr-only"> (opens in a new tab)</span></button>';
    V.initAll(el); $('.sheet-title', el).focus(); V.announce('Room ready. ' + r.title);
  }

  /* ---------- events inside the sheet ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target.closest('#mt-start [data-st]'); if (!t) return; var a = t.getAttribute('data-st');
    if (a === 'create') { create(); return; }
    if (a === 'cancel') { entry.close('cancel'); return; }
    if (a === 'done') { entry.close('done'); return; }
    if (a === 'copy-link') { A.copy(A.rooms.link(ready), 'Link copied', t); return; }
    if (a === 'copy-key') { A.copy(ready.key, 'Room key copied', t); return; }
    if (a === 'invite') { A.copy(A.rooms.invite(ready), 'Invite copied. It doesn’t include the key.', t); return; }
    if (a === 'open-ext') { V.toast.info('The room opens on meet.vaanilabs.in in a new tab. Not part of this prototype.'); return; }
    if (a === 'later') { f.join = 'manual'; render('input[name="mt-join"][value="manual"]'); return; }
    if (a === 'rooms') { entry.close('navigate'); var h = $('#mt-live-h'); if (h) { h.scrollIntoView({ block: 'start' }); h.focus(); } return; }
    if (a === 'topup') { try { w.sessionStorage.setItem('vaani:agents:start-draft', JSON.stringify(f)); } catch (x) { /* ignore */ } entry.close('navigate'); V.openTopUp('meetings'); return; }
    if (a === 'generate') { try { w.sessionStorage.setItem('vaani:agents:start-draft', JSON.stringify(f)); } catch (x) { /* ignore */ } entry.close('navigate'); A.deck && A.deck.open({ fromStart: true }); return; }
    if (a === 'choose') { var fi = $('#mt-st-file', el); if (fi) fi.click(); else { f.slides = 'deck'; render(); } return; }
    if (a === 'remove-deck') { f.deck = null; f.deckState = null; render('[data-st="choose"]'); return; }
    if (a === 'recent') { var dk = DATA.decks.filter(function (x) { return x.id === t.getAttribute('data-deck'); })[0]; f.deck = { name: dk.name, slides: dk.slides, size: dk.size }; f.deckState = 'ready'; render('[data-st="remove-deck"]'); return; }
    if (a === 'hear') { var on = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', on); t.innerHTML = icon(on ? 'square' : 'play'); t.setAttribute('aria-label', (on ? 'Stop preview of ' : 'Hear ') + voice().name); if (on) setTimeout(function () { if (t.isConnected) { t.setAttribute('aria-pressed', 'false'); t.innerHTML = icon('play'); t.setAttribute('aria-label', 'Hear ' + voice().name); } }, 4000); return; }
    if (a === 'default-voice') { V.toast.undo(voice().name + ' is now the default meeting voice', { action: { label: 'Undo', onClick: function () { V.announce('Default voice unchanged'); } } }); return; }
    if (a === 'open-dup') { var dup = M.rooms.filter(function (r) { return r.title.toLowerCase() === $('#mt-st-title', el).value.trim().toLowerCase(); })[0]; entry.close('navigate'); if (dup) A.rooms.open(dup.id); }
  });
  d.addEventListener('change', function (e) {
    if (!e.target.closest || !e.target.closest('#mt-start')) return; var n = e.target.name, id = e.target.id;
    if (n === 'mt-mode') { f.mode = e.target.value; render('input[name="mt-mode"]:checked'); }
    else if (n === 'mt-slides') { f.slides = e.target.value; render('input[name="mt-slides"]:checked'); }
    else if (n === 'mt-join') { f.join = e.target.value; renderChecks(); }
    else if (n === 'mt-who') { f.who = e.target.value; }
    else if (id === 'mt-notes') f.notes = e.target.checked;
    else if (id === 'mt-rec') { f.rec = e.target.checked; renderChecks(); }
    else if (id === 'mt-st-file') {
      var file = e.target.files && e.target.files[0]; if (!file) return;
      var ok = /\.(pptx|pdf)$/i.test(file.name), small = file.size <= 20 * 1048576;
      if (!ok || !small) { f.deck = null; f.deckState = 'error'; render(); V.toast.error(file.name + ' wasn’t added: ' + (!ok ? 'only PPTX or PDF files work.' : 'it’s larger than 20 MB.')); return; }
      f.deck = { name: file.name, slides: 12, size: file.size }; f.deckState = 'uploading'; f.deckPct = 0; render();
      var tick = setInterval(function () { f.deckPct += 30; if (f.deckPct >= 100) { clearInterval(tick); f.deckState = 'ready'; } if ($('#mt-start') && !el.hidden) { render(); } }, 500);
    }
  });
  d.addEventListener('input', function (e) { if (e.target.id !== 'mt-st-title') return; f.title = e.target.value; count(); if (!$('#mt-st-title-e', el).hidden) titleError(); });
  d.addEventListener('focusout', function (e) { if (e.target.id !== 'mt-st-title') return; e.target.value = e.target.value.trim(); f.title = e.target.value; if (e.target.value === '' || $('#mt-st-title-e', el).hidden === false) titleError(); });
  d.addEventListener('vaani:change', function (e) {
    if (e.target.id === 'mt-st-flow') { f.flow = e.detail.value; render('#mt-st-flow'); }
    else if (e.target.id === 'mt-st-voice') { f.voice = e.detail.value; render('#mt-st-voice'); }
  });
})(window, document, window.Vaani, window.VaaniAgents);
