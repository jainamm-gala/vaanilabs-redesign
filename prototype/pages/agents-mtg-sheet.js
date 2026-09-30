/* Vaani Labs prototype · pages/agents-mtg-sheet.js — a past meeting (03-pages/07 §1.9): the detail sheet (560) with
   Summary · Transcript · Action items · Details, the same tabs as a full page (?meeting=<id>&full=1, nested header),
   the RecordingPlayer + TalkStrip seeking the TranscriptFeed, "Hand to a personal agent…", the row ⋯ menu and
   Delete meeting…. States: writing notes (StageProgress), notes off, couldn’t write notes, record gone. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, F = V.fmt, M = A.mt, DATA = A.data;
  var S = A.mtg = {};
  var TABS = [['summary', 'Summary'], ['transcript', 'Transcript'], ['actions', 'Action items'], ['details', 'Details']];

  function scale(m) { var end = 0; (m.turns || []).forEach(function (t) { end = Math.max(end, t.endMs); }); return end ? (m.mins * 60000 * 0.95) / end : 1; }
  function tc(ms) { return F.timecode(ms / 1000); }
  function endIso(m) { return new Date(new Date(m.at).getTime() + m.mins * 60000).toISOString(); }
  S.meta = function (m) { return F.date(m.at) + ' · ' + F.time(m.at) + ' to ' + F.time(endIso(m)) + ' IST · ' + m.mins + ' min · ' + m.people + ' people'; };
  S.tabsFor = function (m) { return m.notes === 'ready' || m.notes === 'writing' ? TABS : [['details', 'Details']]; };

  function stages() {
    return '<ol class="stages" aria-label="Writing notes"><li class="stage"><span class="smark smark--done" data-mark>' + icon('check') + '</span><span>Transcribing<span class="stage-meta">Done</span></span></li>' +
      '<li class="stage"><span class="smark smark--progress" data-mark>' + icon('loader-circle', null, { className: 'spinner' }) + '</span><span>Summarising<span class="stage-meta">Usually under 2 minutes</span></span></li>' +
      '<li class="stage"><span class="smark smark--todo" data-mark="hollow"></span><span>Finding action items</span></li></ol>';
  }
  function summaryPanel(m) {
    if (m.notes === 'writing') return stages();
    var ends = endIso(m), k = scale(m);
    return A.statusHtml('success', 'Summary ready · written ' + F.time(new Date(new Date(ends).getTime() + 2 * 60000).toISOString())) +
      '<p class="type-read-15 ag-measure" lang="en">' + esc(m.summary || '') + '</p>' +
      (m.decisions ? '<h3 class="ag-h3">Decisions</h3><ul class="ag-list">' + m.decisions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      (m.questions ? '<h3 class="ag-h3">Open questions</h3><ul class="ag-list">' + m.questions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      A.kv([['Agent', esc(m.agent.detail)], m.agentMin ? ['Agent time', '<span class="num">' + m.agentMin + ' min · ' + A.money(m.cost) + '</span><span class="kv-src">from Billing</span>'] : null,
        ['Room time', '<span class="num">' + m.mins + ' min</span> · free minutes'], ['Languages', A.langList(m.langs || ['en'])],
        ['Recording', m.recording ? '<span class="num">' + m.recording + ' min</span> · <button type="button" class="btn btn--link" data-mg="play">Play</button>' : 'Not recorded']], 'kv--rows') + (k ? '' : '');
  }
  function transcriptPanel(m) {
    if (m.notes === 'writing') return stages();
    var k = scale(m), total = m.mins * 60000, turns = m.turns || [];
    var player = m.recording ? '<div class="player ag-player" role="group" aria-label="Recording, ' + m.recording + ' minutes"><div class="player-row">' +
      '<button class="ibtn ibtn--secondary" type="button" data-mg="toggle" aria-label="Play recording">' + icon('play') + '</button><button class="ibtn" type="button" data-mg="back" aria-label="Back 5 seconds">' + icon('rotate-ccw') + '</button><button class="ibtn" type="button" data-mg="fwd" aria-label="Forward 5 seconds">' + icon('rotate-cw') + '</button>' +
      '<span class="player-time" id="mg-time">00:00 / ' + tc(total) + '</span></div>' +
      '<div class="talk" id="mg-talk" role="slider" tabindex="0" aria-label="Recording position" aria-valuemin="0" aria-valuemax="' + Math.round(total / 1000) + '" aria-valuenow="0" aria-valuetext="00:00 of ' + tc(total) + '">' +
      ['agent', 'caller'].map(function (lane) { return '<div class="talk-lane talk-lane--' + lane + '">' + turns.filter(function (t) { return lane === 'agent' ? t.speaker === 'agent' : t.speaker !== 'agent'; }).map(function (t) { return '<i style="left: ' + (t.startMs * k / total * 100).toFixed(2) + '%; width: ' + ((t.endMs - t.startMs) * k / total * 100).toFixed(2) + '%"></i>'; }).join('') + '</div>'; }).join('') +
      '<span class="playhead" id="mg-head" style="left: 0%"></span></div><div class="talk-legend"><span><i class="talk-sw talk-sw--agent" data-mark></i>Agent</span><span><i class="talk-sw talk-sw--caller" data-mark></i>Guests</span><span>' + turns.length + ' turns</span></div></div>'
      : '<p class="notice notice--neutral">' + icon('info') + '<span class="notice-body">No recording. Recording was off for this meeting.</span></p>';
    var feed = '<div class="tr ag-tr"><div class="tr-head"><h3>Transcript</h3><span class="l-spacer"></span><div class="search ag-tr-search"><label class="sr-only" for="mg-find">Search the transcript</label>' + icon('search', 'sm') + '<input type="search" id="mg-find" placeholder="Search transcript…" autocomplete="off"></div></div>' +
      '<div class="tr-body"><ol id="mg-turns">' + (turns.length ? turns.map(function (t) { return A.turn({ id: t.id, speaker: t.speaker, name: t.name, startMs: Math.round(t.startMs * k), endMs: Math.round(t.endMs * k), text: t.text, lang: t.lang }, { review: !!m.recording }); }).join('') : '<li class="tr-empty">The transcript is short: nobody spoke for long in this meeting.</li>') + '</ol></div></div>';
    return player + feed;
  }
  function actionsPanel(m) {
    if (m.notes === 'writing') return stages();
    var k = scale(m); if (!m.items.length) return '<p class="empty empty--compact">No action items were found in this meeting.</p>';
    return '<div class="l-split"><span class="status status--plain">' + A.plural(m.items.length, 'action item') + '</span><button class="btn btn--sm" type="button" data-mg="copy-items">' + icon('copy', 'sm') + 'Copy all</button></div><ol class="ag-items">' + m.items.map(function (it, i) {
      return '<li class="ag-item"><p class="ag-item-text">' + esc(it.text) + '</p><p class="ag-meta">Owner · ' + esc(it.owner || 'Not captured') + ' · Due · ' + (it.due ? F.weekday(it.due) + ' ' + F.dateShort(it.due) : 'Not captured') +
        (m.turns && m.turns.length ? ' · <button type="button" class="btn btn--link" data-mg="seek" data-ms="' + Math.round(it.atMs * k) + '">at ' + tc(it.atMs * k) + '</button>' : '') + '</p>' +
        '<a class="btn btn--sm btn--tertiary ag-item-hand" href="agents.html?view=personal-agents&amp;new=1&amp;from=meeting:' + m.id + ':item:' + (i + 1) + '">' + icon('list-checks', 'sm') + 'Hand to a personal agent…<span class="sr-only"> ' + esc(it.text) + '</span></a></li>';
    }).join('') + '</ol>';
  }
  function detailsPanel(m) {
    var top = m.notes === 'off' ? '<div class="notice notice--neutral">' + icon('info') + '<span class="notice-body">Notes were off for this meeting. Turn on <b>Take notes</b> when you start a meeting to get a summary.</span></div>'
      : m.notes === 'failed' ? '<div class="ierr" role="alert"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t write the notes for this meeting. <button type="button" class="btn btn--link" data-mg="retry-notes">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>notes_job ' + m.id + ' · transcription timed out after 3 tries · request_id req_n0t35</code></div></details></div>' : '';
    var ppl = m.roster || null;
    return top + A.kv([['Room code', '<span class="ag-code-12" translate="no">' + esc(m.code) + '</span>'], ['Created by', esc(m.createdBy)], ['Started', F.when(m.at, { time: true })],
      ['Ended', F.time(endIso(m)) + ' · ' + (m.endedBy ? 'ended by ' + esc(m.endedBy) : 'ended automatically after 30 min with nobody in the room')], ['Who could join', m.privacy === 'key' ? 'Only people with the key' : 'Anyone with the link'],
      ['What the agent did', esc(m.agent.detail)], ['Voice', m.agent.kind === 'none' ? '–' : esc(DATA.voice.name) + ' · ' + A.langList(DATA.voice.languages)], ['Notes', m.notes === 'off' ? 'Off' : 'On'], ['Recording', m.recording ? m.recording + ' min' : 'Off']]
      .concat(ppl ? ppl.map(function (p) { return [p.kind === 'agent' ? 'Agent' : p.kind === 'host' ? 'Host' : 'Guest', '<span translate="no">' + esc(p.name) + '</span> · ' + esc(p.joined) + ' to ' + esc(p.left)]; }) : [['People', m.people + ' people']]), 'kv--rows');
  }
  var PANEL = { summary: summaryPanel, transcript: transcriptPanel, actions: actionsPanel, details: detailsPanel };

  S.tabsHtml = function (m, cur, pre) {
    var tabs = S.tabsFor(m); if (tabs.length < 2) return '';
    return '<div class="vtabs vtabs--panel ag-ptabs"><div class="vtabs-list" role="tablist" aria-label="Meeting outputs">' + tabs.map(function (t) { return '<button class="vtab" role="tab" type="button" id="' + pre + '-tab-' + t[0] + '" aria-controls="' + pre + '-p-' + t[0] + '" aria-selected="' + (t[0] === cur) + '" data-value="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
  };
  S.panelsHtml = function (m, cur, pre, cls) {
    var tabs = S.tabsFor(m), many = tabs.length > 1;
    return tabs.map(function (t) { return '<div class="' + cls + '" id="' + pre + '-p-' + t[0] + '"' + (many ? ' role="tabpanel" aria-labelledby="' + pre + '-tab-' + t[0] + '" tabindex="0"' : '') + (t[0] === cur ? '' : ' hidden') + '>' + PANEL[t[0]](m) + '</div>'; }).join('');
  };

  /* ---------- open (sheet) ---------- */
  S.open = function (id, trigger, o) {
    o = o || {};
    var m = M.findPast(id), el = $('#mt-mtg-sheet');
    if (A.mtSheet && A.mtSheet.roomId) V.drawer.close('mt-room-sheet', 'replace');
    A.mtSheet = { meetingId: id }; M.sheetOpenId = id;
    if (!m) {
      el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back to Meetings">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="mt-mtg-t">Meeting not found</h2></div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close">' + icon('x') + '</button></div></div>' +
        '<div class="sheet-body"><div class="empty">' + icon('search-x', 'lg') + '<h3>This meeting doesn’t exist. It may have been deleted.</h3><p>Deleted meetings keep their billing records; their notes are gone.</p><div class="empty-actions"><button class="btn" type="button" data-drawer-close>Go to Meetings</button></div></div></div>';
    } else {
      var tabs = S.tabsFor(m), q = A.q('tab'), cur = tabs.some(function (t) { return t[0] === q; }) ? q : tabs[0][0], list = M.visible(), i = list.indexOf(m);
      el.innerHTML = '<div class="sheet-head"><button class="ibtn sheet-back" type="button" data-drawer-close aria-label="Back to Meetings">' + icon('chevron-left') + '</button><div class="sheet-heading"><h2 class="sheet-title" id="mt-mtg-t" translate="no">' + esc(m.title) + '</h2><p class="sheet-meta">' + esc(S.meta(m)) + '</p></div>' +
        '<div class="sheet-actions"><button class="ibtn u-hide-phone" type="button" data-mg="prev" aria-label="Previous meeting" data-kbd="K"' + (i <= 0 ? ' aria-disabled="true"' : '') + '>' + icon('chevron-up') + '</button><button class="ibtn u-hide-phone" type="button" data-mg="next" aria-label="Next meeting" data-kbd="J"' + (i < 0 || i >= list.length - 1 ? ' aria-disabled="true"' : '') + '>' + icon('chevron-down') + '</button>' +
        '<button class="ibtn" type="button" data-mg="copy-link" aria-label="Copy link to this meeting">' + icon('link') + '</button><a class="ibtn u-hide-phone" href="agents.html?view=meetings&amp;meeting=' + m.id + '&amp;full=1" aria-label="Open full page">' + icon('maximize-2') + '</a>' +
        '<button class="ibtn" type="button" data-mg="menu" aria-label="More actions for this meeting" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis') + '</button><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close meeting">' + icon('x') + '</button></div></div>' +
        S.tabsHtml(m, cur, 'mg') + S.panelsHtml(m, cur, 'mg', 'sheet-body');
    }
    V.initAll(el); wireTabs(el, m);
    A.url.set({ meeting: id, room: null });
    var open = V.drawer.isOpen(el);
    if (!open) V.drawer.open(el, { returnTo: trigger, onClose: function () { if (A.mtSheet && A.mtSheet.meetingId) A.mtSheet = null; M.sheetOpenId = null; stop(); A.url.set({ meeting: null, tab: null }); markRow(); A.dock(); V.setTitle(null); } });
    else if (!o.keepFocus) { var t = $('.sheet-title', el); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    markRow(); A.dock(); V.setTitle(m ? m.title : 'Not found');
  };
  function markRow() { $$('#mt-tbody tr').forEach(function (r) { if (r.getAttribute('data-id') === M.sheetOpenId) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); }); }
  function wireTabs(root, m) { var tl = $('[role="tablist"]', root); if (tl) tl.addEventListener('vaani:tabchange', function (e) { A.url.set({ tab: e.detail.value === 'summary' ? null : e.detail.value }); }); if (m && A.is('mtg-seek')) S.seek(root, 0); }
  S.step = function (dir) { var list = M.visible(), i = list.map(function (x) { return x.id; }).indexOf(M.sheetOpenId), n = list[i + dir]; if (n) S.open(n.id); };

  /* ---------- the full page (/meetings/<id>) ---------- */
  S.renderPage = function (id) {
    var m = M.findPast(id), main = $('#mt-main');
    A.header({ title: m ? m.title : 'Meeting not found', meta: m ? A.mline(S.meta(m).split(' · ').map(esc)) : '', crumbs: '<a href="agents.html?view=meetings">Meetings</a>', actions: m ? '<button class="ibtn" type="button" data-mg="copy-link" aria-label="Copy link to this meeting">' + icon('link') + '</button><button class="ibtn" type="button" data-mg="menu" aria-label="More actions for this meeting" aria-haspopup="menu" aria-expanded="false">' + icon('ellipsis') + '</button>' : '' });
    d.body.setAttribute('data-back-href', 'agents.html?view=meetings'); d.body.setAttribute('data-back-label', 'Meetings');
    $('#page-title').setAttribute('translate', 'no'); A.mtSheet = null; M.sheetOpenId = id;
    if (!m) { main.innerHTML = '<div class="card ag-state"><div class="empty empty--page">' + icon('search-x', 'lg') + '<h2 class="empty-title">This meeting doesn’t exist. It may have been deleted.</h2><div class="empty-actions"><a class="btn" href="agents.html?view=meetings">Go to Meetings</a></div></div></div>'; return; }
    var tabs = S.tabsFor(m), q = A.q('tab'), cur = tabs.some(function (t) { return t[0] === q; }) ? q : tabs[0][0];
    main.innerHTML = '<div class="card card--flush ag-mtg-page">' + S.tabsHtml(m, cur, 'mp') + S.panelsHtml(m, cur, 'mp', 'ag-mtg-panel') + '</div>';
    V.initAll(main); wireTabs(main, m); V.setTitle(m.title);
  };

  /* ---------- player (plays only while asked; the playhead is the only moving part) ---------- */
  var timer = null, pos = 0;
  function stop() { clearInterval(timer); timer = null; var b = $('[data-mg="toggle"]'); if (b) { b.innerHTML = icon('play'); b.setAttribute('aria-label', 'Play recording'); } }
  S.seek = function (root, ms) {
    var talk = $('#mg-talk', root) || $('#mg-talk'); if (!talk) return; var max = +talk.getAttribute('aria-valuemax') * 1000; pos = Math.max(0, Math.min(max, ms));
    var p = (pos / max * 100).toFixed(2) + '%', head = $('#mg-head'); head.style.left = p;
    talk.setAttribute('aria-valuenow', Math.round(pos / 1000)); talk.setAttribute('aria-valuetext', tc(pos) + ' of ' + tc(max)); $('#mg-time').textContent = tc(pos) + ' / ' + tc(max);
    var best = null; $$('#mg-turns .turn-tc').forEach(function (b) { if (+b.getAttribute('data-seek') <= pos + 500) best = b; });
    $$('#mg-turns > li').forEach(function (li) { li.classList.remove('turn--active'); li.removeAttribute('aria-current'); });
    if (best) { var li = best.closest('li'); li.classList.add('turn--active'); li.setAttribute('aria-current', 'true'); }
  };
  function toggle(btn) { if (timer) { stop(); return; } btn.innerHTML = icon('pause'); btn.setAttribute('aria-label', 'Pause recording'); timer = setInterval(function () { if (!$('#mg-talk')) { stop(); return; } S.seek(null, pos + 1000); }, 1000); }

  /* ---------- actions ---------- */
  S.menuItems = function (m) {
    return [{ label: 'Open notes', icon: 'file-text', act: 'open' }, { label: 'Copy summary', icon: 'copy', act: 'copy-summary', disabled: m.notes !== 'ready', reason: 'No summary for this meeting' },
      { label: 'Download transcript (.txt)', icon: 'download', act: 'download', disabled: !(m.turns && m.turns.length), reason: 'No transcript for this meeting' },
      { label: 'Hand an action item to a personal agent', icon: 'list-checks', act: 'items', sub: m.items.length ? 'ag-sub-menu' : null, disabled: !m.items.length, reason: 'No action items in this meeting' },
      { sep: 1 }, { label: 'Delete meeting…', icon: 'trash-2', act: 'delete', danger: 1 }];
  };
  S.menu = function (trigger, m) {
    $('#ag-sub-menu').innerHTML = A.menuHtml(m.items.map(function (it, i) { return { label: it.text.length > 60 ? it.text.slice(0, 58) + '…' : it.text, act: 'hand', value: String(i + 1) }; }));
    A.openMenu(trigger, 'ag-row-menu', S.menuItems(m), function (act) { S.act(act, m, trigger); }, 'Actions for ' + m.title);
  };
  S.act = function (act, m, trigger) {
    if (act === 'open') S.open(m.id, trigger);
    else if (act === 'copy-summary') A.copy(m.summary, 'Summary copied');
    else if (act === 'download') V.toast.success('Downloaded ' + m.title.replace(/[^\w]+/g, '-').toLowerCase() + '-transcript.txt');
    else if (act === 'delete') V.dialog.confirm({ title: 'Delete ‘' + m.title + '’?', body: 'Its notes, transcript and recording are deleted. Billing records are kept. This can’t be undone.', confirmLabel: 'Delete meeting', tone: 'danger', returnTo: trigger }).then(function (ok) {
      if (!ok) return; var i = M.past.indexOf(m); M.past.splice(i, 1); if (M.sheetOpenId === m.id) V.drawer.close('mt-mtg-sheet', 'replace');
      if (A.q('full')) { w.location.href = 'agents.html?view=meetings'; return; }
      M.renderPast(); M.renderHeader(); V.toast.success('Deleted ' + m.title);
      var rows = $$('#mt-tbody tr'), n = rows[Math.min(i, rows.length - 1)]; (n && n.offsetParent ? n : $('#mt-past-h')).focus();
    });
  };
  d.addEventListener('vaani:menuselect', function (e) { if (e.target.id !== 'ag-sub-menu' && !(e.target.closest && e.target.closest('#ag-sub-menu'))) return; var m = M.findPast(M.menuFor); if (m) w.location.href = 'agents.html?view=personal-agents&new=1&from=meeting:' + m.id + ':item:' + e.detail.value; });

  d.addEventListener('click', function (e) {
    if (A.view !== 'meetings') return;
    var rowBtn = e.target.closest('[data-mt-row]'); if (rowBtn) { var pm = M.findPast(rowBtn.getAttribute('data-mt-row')); M.menuFor = pm.id; S.menu(rowBtn, pm); return; }
    var link = e.target.closest('#mt-tbody .c-key a, [data-mt-open]'); if (link && !(e.metaKey || e.ctrlKey || e.shiftKey)) { e.preventDefault(); var id = link.getAttribute('data-mt-open') || link.closest('tr').getAttribute('data-id'); S.open(id, link.closest('tr') || link); return; }
    var b = e.target.closest('[data-mg]'); if (!b) return; var act = b.getAttribute('data-mg'), m = M.findPast(M.sheetOpenId); if (!m || A.blocked(b)) return;
    var root = b.closest('.sheet, .ag-mtg-page, main');
    if (act === 'prev') S.step(-1); else if (act === 'next') S.step(1);
    else if (act === 'copy-link') A.copy(w.location.href.split('?')[0] + '?view=meetings&meeting=' + m.id, 'Link copied', b);
    else if (act === 'menu') { M.menuFor = m.id; S.menu(b, m); }
    else if (act === 'copy-items') A.copy(m.items.map(function (x, i) { return (i + 1) + '. ' + x.text; }).join('\n'), 'Action items copied', b);
    else if (act === 'play' || act === 'seek') { var tab = $('[role="tab"][data-value="transcript"]', root); if (tab) V.tabs.select(tab, true); if (act === 'seek') S.seek(root, +b.getAttribute('data-ms')); }
    else if (act === 'toggle') toggle(b); else if (act === 'back') S.seek(root, pos - 5000); else if (act === 'fwd') S.seek(root, pos + 5000);
    else if (act === 'retry-notes') { m.notes = 'writing'; S.open(m.id); M.renderPast(); }
    var sk = e.target.closest('.turn-tc'); if (sk) S.seek(root, +sk.getAttribute('data-seek'));
  });
  d.addEventListener('click', function (e) { var sk = e.target.closest('#mg-turns .turn-tc'); if (sk) S.seek(null, +sk.getAttribute('data-seek')); });
  d.addEventListener('keydown', function (e) { if (e.target.id !== 'mg-talk') return; var k = { ArrowRight: 5000, ArrowLeft: -5000, PageUp: 60000, PageDown: -60000 }[e.key]; if (k) { e.preventDefault(); S.seek(null, pos + k); } else if (e.key === 'Home') { e.preventDefault(); S.seek(null, 0); } });
  d.addEventListener('input', function (e) { if (e.target.id !== 'mg-find') return; var q = e.target.value.trim().toLowerCase(), n = 0; $$('#mg-turns > li').forEach(function (li) { var hit = !q || li.textContent.toLowerCase().indexOf(q) >= 0; li.hidden = !hit; if (hit) n++; }); V.announce(n + ' turns', { dedupeKey: 'mgfind' }); });
})(window, document, window.Vaani, window.VaaniAgents);
