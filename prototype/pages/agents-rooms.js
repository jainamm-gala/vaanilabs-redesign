/* Vaani Labs prototype · pages/agents-rooms.js — an open room (03-pages/07 §1.8): the room sheet (Room · Live notes),
   RoomControlRows in full mode, JoinDetails, "In the room", the AddAgentGate popover (gate §5.4), End room… and
   Start recording… confirmations, the room ⋯ menu, copy actions, and the End room result (room → Past meetings). */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, esc = A.esc, icon = A.icon, F = V.fmt, M = A.mt, DATA = A.data;
  var R = A.rooms = {};
  var JOIN = 'https://meet.vaanilabs.in/';
  R.link = function (r) { return JOIN + r.code; };
  R.invite = function (r) { return 'Join ‘' + r.title + '’ on Vaani Labs: ' + R.link(r) + '.' + (r.keyRequired ? ' You’ll be asked for a key; the host will send it.' : ''); };

  /* ---------- room ⋯ menu (card and sheet) ---------- */
  R.menuItems = function (r) {
    var a = r.agent || {}, inRoom = a.state === 'in' || a.state === 'joining', off = A.offline, wal = A.wallet.empty;
    return [{ label: 'Copy link', icon: 'link', act: 'copy' }, { label: 'Copy invite', icon: 'copy', act: 'invite' }].concat(r.keyShown ? [{ label: 'Copy key', icon: 'key-round', act: 'key' }] : []).concat([{ sep: 1 },
      inRoom ? { label: 'Remove agent', icon: 'log-out', act: 'remove' } : { label: 'Add agent…', icon: 'user-plus', act: 'add', disabled: off || wal, reason: off ? A.offlineReason : 'Wallet is ₹0. Top up so the agent can join.' },
      { label: r.notes.on ? 'Turn notes off' : 'Turn notes on', icon: 'sticky-note', act: 'notes' },
      r.recording.on ? { label: 'Stop recording', icon: 'square', act: 'rec' } : { label: 'Start recording…', icon: 'disc', act: 'rec' },
      { label: 'Open room details', icon: 'panel-left', act: 'details' }, { sep: 1 },
      { label: 'End room…', icon: 'circle-x', act: 'end', danger: 1, disabled: off, reason: A.offlineReason }]);
  };
  R.menu = function (trigger, r) { A.openMenu(trigger, 'ag-row-menu', R.menuItems(r), function (act) { R.act(act, r, trigger); }, 'Actions for ' + r.title); };
  R.act = function (act, r, trigger) {
    if (act === 'copy') A.copy(R.link(r), 'Link copied', trigger && trigger.getAttribute('data-room-act') === 'copy' ? trigger : null);
    else if (act === 'invite') A.copy(R.invite(r), 'Invite copied. It doesn’t include the key.');
    else if (act === 'key') A.copy(r.key, 'Room key copied');
    else if (act === 'add') R.openAddGate(r, trigger);
    else if (act === 'remove') { r.agent = { state: 'none' }; M.seats.used = Math.max(0, M.seats.used - 1); R.refresh(r); V.toast.success(DATA.voice.name + ' left ' + r.title); }
    else if (act === 'notes') { r.notes.on = !r.notes.on; if (r.notes.on && !r.notes.turns) r.notes.turns = 0; R.refresh(r); V.announce('Notes ' + (r.notes.on ? 'on' : 'off') + ' in ' + r.title); }
    else if (act === 'rec') R.recording(r, trigger);
    else if (act === 'details') R.open(r.id, trigger);
    else if (act === 'end') R.end(r, trigger);
    else if (act === 'retry') { r.agent = { state: 'joining' }; R.refresh(r); setTimeout(function () { r.agent = { state: 'in', since: F.now().toISOString(), doing: 'presenting' }; R.refresh(r); V.announce(DATA.voice.name + ' joined ' + r.title); }, 1500); }
    else if (act === 'open-ext') V.toast.info('The room opens on meet.vaanilabs.in in a new tab. Not part of this prototype.');
  };
  R.recording = function (r, trigger) {
    if (r.recording.on) { r.recording = { on: false }; R.refresh(r); V.announce('Recording stopped in ' + r.title); return; }
    V.dialog.confirm({ title: 'Start recording ' + r.title + '?', body: 'Everyone in the room is told that recording has started. The recording is kept with this meeting’s notes.', confirmLabel: 'Start recording', returnTo: trigger })
      .then(function (ok) { if (!ok) return; r.recording = { on: true, since: F.now().toISOString() }; R.refresh(r); V.announce('Recording started in ' + r.title); });
  };

  /* ---------- End room… (tier 2, danger; no Undo) ---------- */
  R.end = function (r, trigger) {
    V.dialog.confirm({ title: 'End ‘' + r.title + '’?', body: 'Everyone is removed, the agent leaves and the link stops working. Notes and the recording are kept in Past meetings.', confirmLabel: 'End room', tone: 'danger', returnTo: trigger })
      .then(function (ok) {
        if (!ok) return;
        r.status = 'ending'; R.refresh(r);
        setTimeout(function () {
          var i = M.rooms.indexOf(r); if (i >= 0) M.rooms.splice(i, 1);
          if (r.agent && r.agent.state === 'in') M.seats.used = Math.max(0, M.seats.used - 1);
          var started = r.startedAt || r.createdAt, len = Math.max(1, Math.round((A.now() - new Date(started).getTime()) / 60000));
          M.past.unshift({ id: 'mtg_' + r.id, title: r.title, at: started, mins: Math.min(len, 999), people: r.people.length + r.left.length, agent: { kind: r.mode === 'slides' ? 'slides' : r.mode === 'flow' ? 'flow' : 'none', label: r.mode === 'slides' ? 'Presented slides' : r.mode === 'flow' ? 'Ran a flow' : 'No agent', detail: r.does },
            notes: r.notes.on ? 'writing' : 'off', code: r.code, privacy: r.keyRequired ? 'key' : 'link', createdBy: r.createdBy, endedBy: V.data.user.short, recording: r.recording.on ? len : 0, agentMin: 0, cost: 0, items: [], turns: [] });
          if (A.mtSheet && A.mtSheet.roomId === r.id) V.drawer.close('mt-room-sheet', 'replace');
          M.renderHeader(); M.renderLive(); M.renderPast(); M.renderAside();
          V.toast.success('Ended ' + r.title + (r.notes.on ? ' · writing notes' : ''));
          var next = $('#mt-rooms .ag-room-title a') || $('#mt-live-h'); if (next) next.focus();
        }, 900);
      });
  };

  /* ---------- AddAgentGate (gate §5.4): popover gate, bottom sheet on phones ---------- */
  R.openAddGate = function (r, trigger) {
    if (A.offline || A.wallet.empty) { var why = A.offline ? A.offlineReason : 'Wallet is ₹0. Top up so the agent can join.'; V.announce(why); V.toast.info(why, A.wallet.empty ? { action: { label: 'Top up', onClick: function () { V.openTopUp('meetings'); } } } : {}); return; }
    var g = $('#mt-addagent'), v = DATA.voice, full = M.seats.used >= M.seats.total, rows = [];
    rows.push(full ? { kind: 'blocking', html: 'All ' + M.seats.total + ' agent seats are in use. End another room to free one.', act: '<button type="button" class="btn btn--link gate-act" data-aa="rooms">Show open rooms</button>' }
      : { kind: 'pass', html: 'Agent seat available · ' + (M.seats.total - M.seats.used) + ' of ' + M.seats.total + ' free' });
    rows.push(A.wallet.low ? { kind: 'warning', html: 'Wallet ' + A.money(A.wallet.balance) + ' covers ' + F.runway(A.wallet.balance, DATA.rates.agentPerSec) + ' of agent time.', act: '<button type="button" class="btn btn--link gate-act" data-vaani-action="topup">Top up</button>' }
      : { kind: 'pass', html: 'Wallet ' + A.money(A.wallet.balance) + ' covers ' + F.runway(A.wallet.balance, DATA.rates.agentPerSec) + ' of agent time.' });
    rows = A.sortRows(rows); var s = A.summary(rows, 'Can’t add the agent');
    g.innerHTML = '<div class="gate-head"><h2 class="gate-title" id="mt-addagent-t">Add ' + esc(v.name) + ' to <span translate="no">' + esc(r.title) + '</span></h2><div class="gate-sub" id="mt-aa-sub">Agent time is charged only while the agent is in the room.</div></div>' +
      '<div class="gate-body">' + A.facts([['Does', esc(r.mode === 'none' ? 'Presents slides · Q3 pricing.pdf' : r.doesShort)], ['Voice', esc(v.name) + ' · Hindi, English']]) +
      '<div class="gate-group">Must pass<span class="gate-sum gate-sum--' + (s.blocked ? 'blocked' : 'ok') + '" role="status">' + icon(s.blocked ? 'x' : 'check', 'sm') + esc(s.text) + '</span></div>' +
      '<ul class="gate-list">' + rows.map(function (x) { return A.row(x.kind, x.html, { act: x.act }); }).join('') + '</ul>' +
      '<div class="gate-cost"><span>' + A.money(DATA.rates.agentPerSec) + '/s while the agent is in the room</span><b>about ' + A.money(DATA.rates.agentPerSec * 60) + ' a minute</b></div><p class="gate-note">' + esc('Wallet ' + A.money(A.wallet.balance) + ' · ' + F.runway(A.wallet.balance, DATA.rates.agentPerSec).replace(/ \d+ min$/, '') + ' of agent time') + '</p></div>' +
      '<div class="gate-foot"><span class="gate-reason' + (s.blocked ? ' u-fg-danger' : '') + '" id="mt-aa-why">' + (s.blocked ? 'All agent seats are in use.' : 'The agent joins within a few seconds.') + '</span><button class="btn btn--tertiary" type="button" data-popover-close>Cancel</button>' +
      '<button class="btn btn--primary" type="button" data-primary aria-describedby="mt-aa-why" aria-keyshortcuts="Control+Enter" data-tooltip="Add agent" data-kbd="mod+enter"' + (s.blocked ? ' aria-disabled="true"' : '') + '>Add agent</button></div>';
    V.initAll(g); g.setAttribute('aria-describedby', 'mt-aa-sub');
    var entry = V.popover.open(trigger && d.contains(trigger) ? trigger : $('#mt-rooms .ag-room[data-room="' + r.id + '"] [data-room-act="menu"]'), 'mt-addagent', { placement: 'bottom-end' });
    var key = A.idem(), busy = false;
    g.onclick = function (e) {
      if (e.target.closest('[data-aa="rooms"]')) { entry.close('navigate'); if (A.mtSheet && A.mtSheet.roomId) V.drawer.close('mt-room-sheet', 'navigate'); var h = $('#mt-live-h'); h.scrollIntoView({ block: 'start' }); h.focus(); return; }
      var p = e.target.closest('[data-primary]'); if (!p || busy) return; if (A.blocked(p)) return;
      busy = true; entry.busy = true; p.setAttribute('aria-busy', 'true'); p.innerHTML = icon('loader-circle', null, { className: 'spinner' }) + 'Adding…'; g.setAttribute('data-idem', key);
      setTimeout(function () {
        entry.busy = false; entry.close('done');
        r.agent = { state: 'joining' }; M.seats.used += 1; R.refresh(r);
        var row = $('#mt-room-sheet [data-ctl="agent"]'); if (row) row.focus();
        setTimeout(function () { r.agent = { state: 'in', since: F.now().toISOString(), doing: r.mode === 'flow' ? '' : 'presenting' }; if (r.mode === 'none') { r.mode = 'slides'; r.does = 'Presents slides · Q3 pricing.pdf, 14 slides'; r.doesShort = 'Presents slides · Q3 pricing.pdf'; } R.refresh(r); V.announce(v.name + ' joined ' + r.title); }, 1600);
      }, 900);
    };
  };

  /* ---------- room sheet (record 440): docked ≥1440 in place of the aside, overlay 1024–1439, modal below ---------- */
  function ctlRow(kind, label, sentence, action) { return '<li class="ag-ctlf" data-ctl="' + kind + '" tabindex="-1"><span class="ag-ctlf-l">' + label + '</span><span class="ag-ctlf-s">' + sentence + '</span>' + (action || '') + '</li>'; }
  function sheetCtl(r) {
    var a = r.agent || {}, v = DATA.voice, s, act, dis = A.offline ? A.offlineReason : A.wallet.empty ? 'Wallet is ₹0. Top up so the agent can join.' : '';
    var addBtn = '<button class="btn btn--sm" type="button" data-rs="add"' + (dis ? ' aria-disabled="true" data-tooltip="' + esc(dis) + '"' : '') + '>Add agent…</button>';
    if (a.state === 'in') { s = '<span class="ag-agent-line"><span class="av av--voice av--20" aria-hidden="true">' + esc(v.tile) + '</span>' + esc(v.name) + ' · in the room since ' + F.time(a.since) + (a.doing ? ' · ' + esc(a.doing) : '') + '</span>'; act = '<button class="btn btn--sm" type="button" data-rs="remove">Remove agent</button>'; }
    else if (a.state === 'joining') { s = A.statusHtml('progress', 'Joining…'); act = ''; }
    else if (a.state === 'failed') { s = A.statusHtml('warning', 'Couldn’t join. The seat was released and you were not charged.'); act = '<button class="btn btn--sm" type="button" data-rs="retry">Retry</button>'; }
    else if (a.state === 'left-wallet') { s = A.statusHtml('warning', 'Left at ' + F.time(a.at) + ' · the wallet reached ₹0 · <button type="button" class="btn btn--link" data-vaani-action="topup">Top up</button>'); act = addBtn; }
    else { s = '<span class="status status--plain">Not in the room</span>'; act = addBtn; }
    return '<ul class="ag-ctlf-list">' + ctlRow('agent', 'Agent', s, act) +
      ctlRow('notes', 'Notes', r.notes.on ? 'On · ' + r.notes.turns + ' turns so far' : 'Off', '<button class="btn btn--sm" type="button" data-rs="notes" data-tooltip="Everyone in the room sees whether notes are on">' + (r.notes.on ? 'Turn off' : 'Turn on') + '</button>') +
      ctlRow('recording', 'Recording', r.recording.on ? '<span class="tag tag--outline">' + icon('disc', 'xs') + 'Recording</span> since ' + F.time(r.recording.since) : 'Off', '<button class="btn btn--sm" type="button" data-rs="rec">' + (r.recording.on ? 'Stop recording' : 'Start recording…') + '</button>') + '</ul>';
  }
  function person(p) {
    var av = p.kind === 'agent' ? '<span class="av av--voice" aria-hidden="true">' + esc(DATA.voice.tile) + '</span>' : V.ui.avatar(p.name);
    return '<li class="ag-person">' + av + '<span class="ag-person-main"><span class="ag-person-name" translate="no">' + esc(p.name) + '</span><span class="ag-meta">' + (p.left ? 'joined ' + F.time(p.joined) + ' · left ' + F.time(p.left) : 'joined ' + F.time(p.joined)) + '</span></span>' +
      (p.kind === 'host' ? '<span class="tag tag--outline">Host</span>' : p.kind === 'agent' ? '<span class="tag tag--outline">Agent</span>' : '') + '</li>';
  }
  function roomBody(r) {
    var t = esc(r.title), keyPart = r.keyRequired ? (r.keyShown && r.key ? '<div class="field"><label class="field-label" for="mt-rs-key">Room key</label><div class="input input--mono input--readonly"><input id="mt-rs-key" readonly value="' + esc(r.key) + '"><button class="input-btn" type="button" data-rs="key" aria-label="Copy room key">' + icon('copy', 'sm') + '</button></div></div>'
      : '<p class="ag-note">' + icon('lock', 'sm') + ' Key required · the key was shown when the room was created.</p>') : '<p class="ag-note">Anyone with the link can join.</p>';
    return '<section class="ag-ssec" aria-labelledby="mt-rs-join"><h3 class="ag-h3" id="mt-rs-join">Join</h3>' +
        '<div class="field"><label class="field-label" for="mt-rs-link">Join link</label><div class="input input--readonly"><input id="mt-rs-link" readonly value="' + esc(R.link(r)) + '" translate="no"><button class="input-btn" type="button" data-rs="copy" aria-label="Copy join link">' + icon('copy', 'sm') + '</button></div></div>' + keyPart +
        '<div class="l-cluster"><button class="btn btn--sm" type="button" data-rs="invite">' + icon('copy', 'sm') + 'Copy invite</button><button class="btn btn--sm" type="button" data-rs="open-ext"' + (A.offline ? ' aria-disabled="true" data-tooltip="' + A.offlineReason + '"' : '') + '>' + icon('external-link', 'sm') + 'Open room<span class="sr-only"> ' + t + ' (opens in a new tab)</span></button></div></section>' +
      '<section class="ag-ssec" aria-labelledby="mt-rs-ctl"><h3 class="ag-h3" id="mt-rs-ctl">Agent, notes and recording</h3>' + sheetCtl(r) + '</section>' +
      '<section class="ag-ssec" aria-labelledby="mt-rs-in"><h3 class="ag-h3" id="mt-rs-in">In the room · ' + r.people.length + '</h3>' +
        (r.people.length ? '<ul class="ag-people">' + r.people.map(person).join('') + '</ul>' : '<p class="ag-note">Nobody is in the room.</p>') +
        (r.left.length ? '<button class="btn btn--link ag-left-toggle" type="button" aria-expanded="false" aria-controls="mt-rs-left">' + r.left.length + ' ' + (r.left.length === 1 ? 'person' : 'people') + ' left · Show</button><ul class="ag-people" id="mt-rs-left" hidden>' + r.left.map(person).join('') + '</ul>' : '') + '</section>' +
      '<section class="ag-ssec" aria-labelledby="mt-rs-det"><h3 class="ag-h3" id="mt-rs-det">Details</h3>' + A.kv([
        ['What the agent does', r.mode === 'flow' ? 'Runs <a href="flow-designer.html?flow=flow_7c21">Site-visit qualifier</a> · Live v7' : esc(r.does)],
        ['Voice', '<span class="av av--voice av--20" aria-hidden="true">' + esc(DATA.voice.tile) + '</span>' + esc(DATA.voice.name) + ' · ' + A.langList(DATA.voice.languages)],
        ['Who can join', r.keyRequired ? 'Only people with the key' : 'Anyone with the link'], ['Notes', r.notes.on ? 'On' : 'Off'], ['Recording', r.recording.on ? 'On' : 'Off'],
        ['Created by', esc(r.createdBy)], ['Created', F.when(r.createdAt, { time: true })],
        ['Room code', '<span class="ag-code-12" translate="no">' + esc(r.code) + '</span><button class="ibtn ibtn--sm" type="button" data-rs="copy" aria-label="Copy link for ' + t + '">' + icon('copy', 'sm') + '</button>']], 'kv--rows') + '</section>';
  }
  function notesBody(r) {
    if (!r.notes.on) return '<p class="tr-empty">Notes are off for this room. Turn them on from the Room tab.</p>';
    return '<div class="tr ag-tr"><div class="tr-head"><h3>Live notes</h3><span class="status status--plain">' + r.notes.turns + ' turns so far</span></div><div class="tr-body"><ol>' +
      (r.turns.length ? r.turns.map(function (t) { return A.turn(t); }).join('') : '<li class="tr-empty">Notes appear here when someone speaks.</li>') + '</ol></div></div>';
  }
  A.turn = function (t, o) { var s = V.ui.turn({ id: t.id, speaker: t.speaker === 'agent' ? 'agent' : 'guest', name: t.name, startMs: t.startMs, endMs: t.endMs, text: t.text, lang: t.lang, final: true }, o); return s; };   /* speaker 'guest' takes the caller lane with the participant’s name (shared TurnRow) */

  R.open = function (id, trigger) {
    var r = M.findRoom(id), el = $('#mt-room-sheet'); if (!r) { V.toast.info('This room has ended. Its notes are in Past meetings.'); A.url.set({ room: null }); return; }
    if (A.mtSheet && A.mtSheet.meetingId) V.drawer.close('mt-mtg-sheet', 'replace');
    A.mtSheet = { roomId: id };
    var tab = A.q('tab') === 'notes' ? 'notes' : 'room';
    el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back to Meetings">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="mt-room-t" translate="no">' + esc(r.title) + '</h2><p class="sheet-meta" id="mt-rs-meta"></p></div>' +
      '<div class="sheet-actions"><button class="ibtn" type="button" data-rs="copy" aria-label="Copy link">' + icon('link') + '</button><button class="ibtn" type="button" data-rs="menu" aria-label="More actions for this room" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis') + '</button><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close room details">' + icon('x') + '</button></div></div>' +
      (r.notes.on ? '<div class="vtabs vtabs--panel"><div class="vtabs-list" role="tablist" aria-label="Room"><button class="vtab" role="tab" type="button" id="mt-rs-tab-room" aria-controls="mt-rs-p-room" aria-selected="' + (tab === 'room') + '" data-value="room">Room</button><button class="vtab" role="tab" type="button" id="mt-rs-tab-notes" aria-controls="mt-rs-p-notes" aria-selected="' + (tab === 'notes') + '" data-value="notes">Live notes</button></div></div>' : '') +
      '<div class="sheet-body" id="mt-rs-p-room"' + (r.notes.on ? ' role="tabpanel" aria-labelledby="mt-rs-tab-room"' : '') + (tab === 'notes' && r.notes.on ? ' hidden' : '') + '></div>' +
      (r.notes.on ? '<div class="sheet-body" id="mt-rs-p-notes" role="tabpanel" aria-labelledby="mt-rs-tab-notes"' + (tab === 'notes' ? '' : ' hidden') + '></div>' : '');
    R.fill(r);
    A.url.set({ room: id, meeting: null, tab: tab === 'notes' ? 'notes' : null });
    V.drawer.open(el, { returnTo: trigger, onClose: function () { if (A.mtSheet && A.mtSheet.roomId === id) A.mtSheet = null; A.url.set({ room: null, tab: null }); A.dock(); } });
    A.dock(); V.setTitle(r.title);
    var tl = $('[role="tablist"]', el); if (tl) tl.addEventListener('vaani:tabchange', function (e) { A.url.set({ tab: e.detail.value === 'notes' ? 'notes' : null }); });
  };
  R.fill = function (r) {
    var el = $('#mt-room-sheet'); if (!el) return;
    $('#mt-rs-meta', el).innerHTML = M.roomTag(r) + ' ' + esc(r.status === 'live' ? M.roomMeta(r).split(' · ')[0] + ' · started ' + F.time(r.startedAt) : M.roomMeta(r));
    $('#mt-rs-p-room', el).innerHTML = roomBody(r); var nb = $('#mt-rs-p-notes', el); if (nb) nb.innerHTML = notesBody(r);
    V.initAll(el);
  };
  R.refresh = function (r) { M.renderLive(); M.renderHeader(); if (A.mtSheet && A.mtSheet.roomId === r.id) { var had = d.activeElement && d.activeElement.closest && d.activeElement.closest('[data-ctl]'); var k = had && had.getAttribute('data-ctl'); R.fill(r); if (k) { var n = $('#mt-room-sheet [data-ctl="' + k + '"]'); if (n) n.focus(); } } };

  /* ---------- delegated clicks: cards and the room sheet ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-room-act], [data-rs]'); if (!t || A.view !== 'meetings') return;
    if (t.hasAttribute('data-rs')) {
      var act = t.getAttribute('data-rs'), r = A.mtSheet && M.findRoom(A.mtSheet.roomId); if (!r) return;
      if (A.blocked(t)) return;
      if (act === 'menu') { R.menu(t, r); return; }
      if (act === 'copy') { A.copy(R.link(r), 'Link copied', t); return; }
      if (act === 'key') { A.copy(r.key, 'Room key copied', t); return; }
      R.act(act === 'open-ext' ? 'open-ext' : act, r, t); return;
    }
    var id = t.getAttribute('data-room'), room = M.findRoom(id), a = t.getAttribute('data-room-act'); if (!room) return;
    if (a === 'sheet') { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); R.open(id, t); return; }
    if (A.blocked(t)) return;
    if (a === 'menu') R.menu(t, room); else R.act(a, room, t);
  });
  d.addEventListener('click', function (e) { var b = e.target.closest('.ag-left-toggle'); if (!b) return; var l = d.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); l.hidden = !open; b.textContent = b.textContent.replace(open ? 'Show' : 'Hide', open ? 'Hide' : 'Show'); });
})(window, document, window.Vaani, window.VaaniAgents);
