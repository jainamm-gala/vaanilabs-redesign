/* Vaani Labs prototype · Cockpit · the transcript column (TranscriptFeed mode="live", data-nav §12.4; previous calls; the
   empty state, CK §3.7) and the Calls column / CallSwitcher (CK §3.2, §7.4: New call, Live now, Up next, Recent). */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  var F = CK.feed = {}, L = CK.list = {};
  var V, esc, st, C;
  function init() { V = CK.V; esc = CK.esc; st = CK.st; C = CK.call; }

  /* ---------- recent calls (today, from Call reports data) as read-only call objects ---------- */
  var today = function (iso) { return iso.slice(0, 10) === CK.D.meta.today; };
  F.recent = function () { init(); return (CK.D.calls || []).filter(function (k) { return today(k.at); }).slice(0, 20); };
  CK.recentCall = function (id) {
    init();
    var k = (CK.D.calls || []).filter(function (x) { return x.id === id; })[0]; if (!k) return null;
    return { id: k.id, recent: k, lead: CK.leadById(k.leadId), who: k.leadName, kind: k.test ? 'test' : 'real', direction: k.direction, flow: k.flow, voiceId: 'vaani', turns: k.turns.map(function (t) { return Object.assign({}, t); }),
      captured: k.captured.map(function (c) { return { key: c.key, value: c.value }; }), state: 'ended', start: 0, endAt: k.durationSec, since: 0, stateTimes: { dialling: 0, ringing: 3, live: 9 }, line: { level: 'good', rtt: 180 }, talk: {}, perTurn: k.perTurnLanguage, languages: k.languages, queue: [] };
  };

  /* ---------- transcript column ---------- */
  function turnHtml(c, t) {
    var h = V.ui.turn(t, { perTurnLanguage: c.perTurn !== false, who: t.rep || (t.speaker === 'caller' && c.kind !== 'real') ? 'You' : null });
    return h.replace(/^<li /, '<li data-turn="' + esc(t.id) + '" ');
  }
  function emptyHtml() {
    return '<div class="ck-tx-empty"><h2 class="ck-tx-empty-t" id="ck-tx-h">The transcript appears here once a call connects.</h2><p>Calls from this page appear in Call reports when they end.</p></div>';
  }
  function prevHtml(lead) {
    var list = (CK.D.calls || []).filter(function (k) { return k.leadId === lead.id; }).slice(0, 3);
    if (lead.lastCall && (!list[0] || Date.parse(lead.lastCall.at) > Date.parse(list[0].at) + 60000)) list.unshift({ id: null, at: lead.lastCall.at, outcome: lead.lastCall.outcome === 'Asked not to call' ? 'Do not call' : lead.lastCall.outcome, durationSec: lead.lastCall.result === 'no_answer' ? 0 : 131, result: lead.lastCall.result, summary: lead.lastCall.result === 'no_answer' ? null : lead.first + ' asked to be called back to discuss a site visit.', flow: { name: 'Site-visit qualifier', version: 7 } });
    list = list.slice(0, 3);
    if (!list.length) return '<div class="ck-tx-pad"><h2 class="ck-card-title" id="ck-tx-h">Previous calls with <span translate="no">' + esc(lead.name) + '</span></h2><p class="type-body-14 u-fg-2 ck-gap">No calls yet. This will be the first.</p></div>';
    var tone = function (o) { var def = V.statusDef('outcome', o); return def ? def[2] : 'neutral'; };
    return '<div class="ck-tx-pad"><h2 class="ck-card-title" id="ck-tx-h">Previous calls with <span translate="no">' + esc(lead.name) + '</span></h2><div class="tl ck-gap"><ol class="tl-list">' + list.map(function (k) {
      var def = V.statusDef('outcome', k.outcome) || ['Talked', 'phone', 'neutral'], tn = tone(k.outcome);
      return '<li class="tl-item"><span class="tl-node' + (tn === 'success' || tn === 'warning' || tn === 'danger' ? ' tl-node--' + tn : '') + '" aria-hidden="true">' + V.icon(def[1], 'sm') + '</span>' +
        '<span class="tl-text"><b>' + esc(def[0]) + '</b> · ' + esc(k.durationSec ? V.fmt.duration(k.durationSec) : 'not answered') + ' · <span translate="no">' + esc(k.flow.name) + '</span> v' + k.flow.version + '</span><span class="tl-time">' + esc(V.fmt.when(k.at, { time: true })) + '</span>' +
        (k.summary ? '<p class="tl-detail">' + esc(k.summary) + '</p>' : '') +
        '<div class="tl-actions">' + (k.id ? '<a class="ck-link" href="call-reports.html?call=' + esc(k.id) + '">Open call report</a>' : '<span class="type-meta-12 u-fg-3">Report is being prepared</span>') + '</div></li>';
    }).join('') + '</ol></div><a class="ck-link" href="call-reports.html?q=' + encodeURIComponent(lead.name) + '">All calls in Call reports</a></div>';
  }
  function feedState(c) {
    if (c.recent || (!C.active(c) && c.state !== 'wrapup')) return ['Ended', 'tag'];
    if (c.state === 'wrapup') return ['Ended', 'tag'];
    if (!st.online && c.kind !== 'browser') return ['Reconnecting…', 'tag tag--warning'];
    if (c.state === 'dialling' || c.state === 'ringing') return ['Waiting', 'tag'];
    return ['Streaming', 'tag tag--info'];
  }
  F.render = function () {
    init();
    var col = d.getElementById('ck-tx'), sel = st.selected;
    col.setAttribute('aria-labelledby', 'ck-tx-h');
    if (sel === 'new') {
      var t = st.target;
      col.setAttribute('data-kind', t && t.kind === 'lead' ? 'prev' : 'empty');
      col.innerHTML = t && t.kind === 'lead' && !st.loading ? prevHtml(t.lead) : emptyHtml();
      return;
    }
    var c = C.byId(sel) || CK.recentCall(sel); if (!c) return;
    col.setAttribute('data-kind', 'feed');
    var fs = feedState(c), langs = c.perTurn === false && c.languages ? '<span class="ck-tx-langs">' + c.languages.map(function (l) { return V.ui.langMark(l, 'full'); }).join('') + '</span>' : '';
    col.innerHTML = '<div class="tr-head"><h2 id="ck-tx-h">Transcript</h2><span class="' + fs[1] + '" id="ck-tx-state">' + fs[0] + '</span>' + langs + '<span class="l-spacer"></span>' +
      '<button type="button" class="ibtn ibtn--sm" id="ck-tx-search-btn" aria-label="Search the transcript" aria-expanded="false" aria-controls="ck-tx-search" data-kbd="mod+F">' + V.icon('search', 'sm') + '</button>' +
      '<button type="button" class="ibtn ibtn--sm" id="ck-tx-copy" aria-label="Copy transcript">' + V.icon('copy', 'sm') + '</button>' +
      '<button type="button" class="ibtn ibtn--sm" aria-label="Transcript options" aria-haspopup="menu" aria-controls="ck-tx-menu" aria-expanded="false">' + V.icon('ellipsis', 'sm') + '</button></div>' +
      '<div class="ck-tx-search" id="ck-tx-search" hidden><div class="input input--sm">' + V.icon('search', 'sm') + '<input id="ck-tx-q" type="search" aria-label="Search the transcript" placeholder="Search this call…" autocomplete="off"></div><span class="type-meta-12 u-fg-3 num" id="ck-tx-count" role="status"></span>' +
        '<button type="button" class="ibtn ibtn--sm" id="ck-tx-prev" aria-label="Previous match">' + V.icon('chevron-up', 'sm') + '</button><button type="button" class="ibtn ibtn--sm" id="ck-tx-next" aria-label="Next match">' + V.icon('chevron-down', 'sm') + '</button><button type="button" class="ibtn ibtn--sm" id="ck-tx-close" aria-label="Close search">' + V.icon('x', 'sm') + '</button></div>' +
      (!st.online && c.kind !== 'browser' && C.active(c) ? '<div class="notice notice--warning ck-tx-notice" role="status">' + V.icon('cloud-off') + '<div class="notice-body">Transcript paused while the line reconnects. Missing turns will fill in.</div></div>' : '') +
      '<div class="tr-body" id="ck-tx-body" tabindex="0" aria-labelledby="ck-tx-h" data-shortcut-scope="ck-tx">' + (c.turns.length ? '' : '<p class="tr-empty" id="ck-tx-wait">' + (C.active(c) ? 'Waiting for the first words…' : 'Nothing was said on this call.') + '</p>') +
        '<ol aria-label="Transcript" id="ck-tx-list">' + c.turns.map(function (t) { return turnHtml(c, t); }).join('') + '</ol></div>' +
      '<div class="ck-jump"><button type="button" class="btn btn--sm jump-latest" id="ck-jump" hidden>' + V.icon('arrow-down') + '<span id="ck-jump-t">Jump to latest</span></button></div>' +
      (!C.active(c) ? '<div class="tr-foot">' + V.icon('check', 'sm') + '<span>' + (c.kind === 'real' ? 'Call ended' : 'Test ended') + ' · ' + CK.tc(C.elapsed(c)) + (c.turns.some(function (t) { return t.speaker === 'caller'; }) ? ' · Summary ' + (c.wrap && c.wrap.summary === 'pending' ? 'on its way' : 'ready') : '') + '</span><a class="ck-link u-ml-auto" href="call-reports.html?call=' + esc(c.id) + '">Open call report</a></div>' : '');
    V.initAll(col);
    c.newTurns = 0; F.pinned = true; wire(c, col);
    requestAnimationFrame(function () { F.toBottom(false); });
  };
  function body() { return d.getElementById('ck-tx-body'); }
  function docScroller() { return !CK.desk(); }
  /* Follow mode: pinned while within 48 px of the bottom; any scroll up unpins; Jump to latest re-pins. */
  F.isPinned = function () {
    if (docScroller()) { var se = d.scrollingElement; return se.scrollTop + w.innerHeight >= se.scrollHeight - 48 - (CK.phone() ? 120 : 60); }
    var b = body(); return !b || b.scrollTop + b.clientHeight >= b.scrollHeight - 48;
  };
  F.toBottom = function (smooth) {
    init();
    var beh = smooth && !CK.rm() ? 'smooth' : 'auto';
    if (docScroller()) { if (st.pane === 'transcript' || CK.phone()) { /* the document owns the scroll below 1024 */ } else return; }
    else { var b = body(); if (b) b.scrollTo({ top: b.scrollHeight, behavior: beh }); }
    F.pinned = true; var c = C.byId(st.selected); if (c) c.newTurns = 0; jumpUi(c);
  };
  function jumpUi(c) {
    var j = d.getElementById('ck-jump'); if (!j) return;
    j.hidden = F.pinned || !c || !c.newTurns;
    d.getElementById('ck-jump-t').textContent = 'Jump to latest' + (c && c.newTurns ? ' · ' + c.newTurns + ' new' : '');
    var n = d.getElementById('ck-new-count'); if (n) n.textContent = c && c.newTurns && st.pane !== 'transcript' ? ' (' + c.newTurns + ' new)' : '';
  }
  /* State changes: the feed tag updates in place; an ended call gets its footer. */
  F.state = function (c) {
    init();
    if (st.selected !== c.id) return;
    if (!C.active(c)) { var b0 = body(), top = b0 ? b0.scrollTop : 0, pin = F.isPinned(); F.render(); var b1 = body(); if (b1 && !pin) b1.scrollTop = top; return; }
    var tag = d.getElementById('ck-tx-state'); if (!tag) return; var fs = feedState(c); tag.className = fs[1]; tag.textContent = fs[0];
  };
  F.addTurn = function (c, t) {
    init();
    var list = d.getElementById('ck-tx-list'); if (!list) return;
    var wait = d.getElementById('ck-tx-wait'); if (wait) wait.remove();
    var pinned = F.isPinned();
    list.insertAdjacentHTML('beforeend', turnHtml(c, t));
    if (t.speaker === 'system' || t.final !== false) countNew(c, pinned);
    if (pinned && !docScroller()) F.toBottom(true); else if (!pinned) F.pinned = false;
    highlight();
  };
  F.updateTurn = function (c, t) {
    init();
    var li = d.querySelector('#ck-tx-list [data-turn="' + t.id + '"]'); if (!li) return;
    var pinned = F.isPinned(); li.outerHTML = turnHtml(c, t);
    countNew(c, pinned); if (pinned && !docScroller()) F.toBottom(true); highlight();
  };
  function countNew(c, pinned) { if (!pinned || (docScroller() && st.pane !== 'transcript' && !CK.phone())) { c.newTurns = (c.newTurns || 0) + 1; F.pinned = false; } jumpUi(c); }
  /* Search (⌘/Ctrl+F inside the panel): marks matches, "2 of 7", previous and next; Esc closes and returns focus. */
  var hits = [], hi = 0;
  function highlight() {
    var qEl = d.getElementById('ck-tx-q'); if (!qEl) return;
    var qv = qEl.value.trim().toLowerCase(); hits = [];
    CK.$$('#ck-tx-list .turn-u').forEach(function (p) {
      if (!p._t) p._t = p.textContent; var t0 = p._t;
      if (!qv) { p.textContent = t0; return; }
      var out = '', i = 0, k, low = t0.toLowerCase();
      while ((k = low.indexOf(qv, i)) >= 0) { out += esc(t0.slice(i, k)) + '<mark>' + esc(t0.slice(k, k + qv.length)) + '</mark>'; i = k + qv.length; }
      p.innerHTML = out + esc(t0.slice(i)); CK.$$('mark', p).forEach(function (m) { hits.push(m); });
    });
    var cnt = d.getElementById('ck-tx-count'); if (cnt) cnt.textContent = qv ? (hits.length ? (Math.min(hi, hits.length - 1) + 1) + ' of ' + hits.length : 'No matches') : '';
  }
  function go(dir) { if (!hits.length) return; hi = (hi + dir + hits.length) % hits.length; hits[hi].scrollIntoView({ block: 'center', behavior: CK.rm() ? 'auto' : 'smooth' }); d.getElementById('ck-tx-count').textContent = (hi + 1) + ' of ' + hits.length; F.pinned = false; }
  F.openSearch = function () { var s = d.getElementById('ck-tx-search'); if (!s) return; s.hidden = false; d.getElementById('ck-tx-search-btn').setAttribute('aria-expanded', 'true'); d.getElementById('ck-tx-q').focus(); };
  function closeSearch() { var s = d.getElementById('ck-tx-search'); d.getElementById('ck-tx-q').value = ''; highlight(); s.hidden = true; var b = d.getElementById('ck-tx-search-btn'); b.setAttribute('aria-expanded', 'false'); b.focus(); }
  function wire(c, col) {
    var b = body();
    b.addEventListener('scroll', function () { if (docScroller()) return; F.pinned = F.isPinned(); if (F.pinned) c.newTurns = 0; jumpUi(c); }, { passive: true });
    b.addEventListener('keydown', function (e) { if (e.key === 'End') { e.preventDefault(); F.toBottom(true); } else if (e.key === 'Home') { e.preventDefault(); b.scrollTo({ top: 0 }); F.pinned = false; } });
    d.getElementById('ck-jump').addEventListener('click', function () { if (docScroller()) { var last = CK.$$('#ck-tx-list > li'); last = last[last.length - 1]; if (last) last.scrollIntoView({ block: 'end', behavior: CK.rm() ? 'auto' : 'smooth' }); } F.toBottom(true); var bb = body(); if (bb) bb.focus({ preventScroll: true }); });
    d.getElementById('ck-tx-search-btn').addEventListener('click', function () { if (d.getElementById('ck-tx-search').hidden) F.openSearch(); else closeSearch(); });
    var qEl = d.getElementById('ck-tx-q');
    qEl.addEventListener('input', function () { hi = 0; highlight(); if (hits[0]) hits[0].scrollIntoView({ block: 'center' }); });
    qEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? -1 : 1); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeSearch(); } });
    d.getElementById('ck-tx-prev').addEventListener('click', function () { go(-1); });
    d.getElementById('ck-tx-next').addEventListener('click', function () { go(1); });
    d.getElementById('ck-tx-close').addEventListener('click', closeSearch);
    d.getElementById('ck-tx-copy').addEventListener('click', function () {
      var text = c.turns.filter(function (t) { return t.final !== false; }).map(function (t) { return CK.tc((t.startMs || 0) / 1000) + ' ' + (t.speaker === 'system' ? '·' : t.speaker === 'caller' ? 'Caller' : (t.name || 'Vaani')) + ': ' + t.text; }).join('\n');
      var ok = function () { V.toast.success('Transcript copied · ' + c.turns.length + ' turns'); };
      try { w.navigator.clipboard.writeText(text).then(ok, function () { V.toast.info("Couldn’t copy here. Use Download .txt instead."); }); } catch (e) { V.toast.info("Couldn’t copy here. Use Download .txt instead."); }
    });
  }
  F.download = function () {
    init();
    var c = C.byId(st.selected) || CK.recentCall(st.selected); if (!c) return;
    var text = c.turns.filter(function (t) { return t.final !== false; }).map(function (t) { return CK.tc((t.startMs || 0) / 1000) + ' ' + (t.speaker === 'caller' ? 'Caller' : t.speaker === 'system' ? '·' : (t.name || 'Vaani')) + ': ' + t.text; }).join('\n');
    try { var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'transcript-' + c.id + '.txt'; d.body.appendChild(a); a.click(); a.remove(); } catch (e) { V.toast.info("Couldn’t download here."); }
  };

  /* ---------- Calls column and CallSwitcher: one list, a roving tab stop (↑ ↓ Home End, Enter opens) ---------- */
  L.batches = null;
  var OFFLINE_BATCH = 'You’re offline. Try again when you reconnect.';
  function batches() { if (!L.batches) L.batches = (CK.D.upNext || []).map(function (b) { return Object.assign({ paused: false }, b); }); return L.batches; }
  L.schedule = function (t, f) { batches().push({ id: 'sched_' + batches().length, name: CK.targetName(t).replace(/^your phone$/, 'Your phone'), single: true, state: 'scheduled', total: 1, at: '2026-09-28T10:00:00+05:30', flow: f.name + ' v' + f.version, lead: t.kind === 'lead' }); L.render(); CK.header(); };
  function item(c, p) {
    var cur = st.selected === c.id, name = c.kind === 'browser' ? 'Browser test' : c.lead ? c.lead.name : c.who;
    var stateHtml = c.stale ? '<span class="call-stale">No update for 60 s</span>' : c.state === 'ringing' || c.state === 'dialling' ? '<span class="cs cs--' + V.CALL_STATE[c.state][2] + '">' + V.icon(V.CALL_STATE[c.state][1], 'xs') + V.CALL_STATE[c.state][0] + '</span>' : V.ui.callState(c.state);
    return '<li><button type="button" class="ck-item" data-call="' + c.id + '" data-roving tabindex="-1"' + (cur ? ' aria-current="true"' : '') + '><span class="ck-item-l1"><span class="ck-item-name" translate="no">' + esc(name) + '</span>' + (c.stale ? '' : '<span class="ck-item-time num" data-ck-timer="' + c.id + '">' + CK.tc(C.elapsed(c)) + '</span>') + '</span>' +
      '<span class="ck-item-l2">' + stateHtml + '<span class="ck-item-meta"><span translate="no">' + esc(shortFlow(c.flow)) + '</span></span>' + (c.kind !== 'real' ? CK.kindTag(c.kind).replace('Test call', 'Test').replace('Browser test', 'Test') : '') + (c.direction === 'inbound' ? V.icon('phone-incoming', 'xs', { label: 'Inbound' }) : '') + '</span></button></li>';
  }
  function shortFlow(f) { return f.name.split(' ')[0] + ' ' + (f.draft ? 'Draft v' : 'v') + f.version; }
  function recentItem(k, p) {
    var cur = st.selected === k.id;
    return '<li><button type="button" class="ck-item" data-call="' + k.id + '" data-roving tabindex="-1"' + (cur ? ' aria-current="true"' : '') + '><span class="ck-item-l1"><span class="ck-item-name" translate="no">' + esc(k.leadName) + '</span><span class="ck-item-time">' + esc(V.fmt.time(k.at)) + '</span></span>' +
      '<span class="ck-item-l2">' + V.ui.statusTag('outcome', k.outcome) + '<span class="ck-item-meta" translate="no">' + esc(shortFlow(k.flow)) + '</span>' + (k.test ? '<span class="tag tag--outline">Test</span>' : '') + (k.direction === 'inbound' ? V.icon('phone-incoming', 'xs', { label: 'Inbound' }) : '') + '</span></button></li>';
  }
  function batchHtml(b, p) {
    var next = b.state === 'scheduled' ? (b.single ? 'Scheduled · Mon 10:00 am' : b.total + ' calls · starts ' + V.fmt.time(b.at)) : b.placed + ' of ' + b.total + (b.paused ? ' · Paused' : ' · Next · 11:30 am');
    /* Pause and Cancel… are network actions: aria-disabled with the reason while offline (CK §4.1); the click announces it. */
    var off = st.online ? '' : ' aria-disabled="true" data-tooltip="' + esc(OFFLINE_BATCH) + '"';
    return '<li class="ck-batch"><div class="ck-item ck-item--batch" data-roving tabindex="-1" data-batch="' + b.id + '"><span class="ck-item-l1"><span class="ck-item-name" translate="no">' + esc(b.name) + '</span></span><span class="ck-item-l2 num"><span class="ck-item-meta">' + esc(next) + '</span></span></div>' +
      '<div class="ck-batch-acts">' + (b.single ? '' : '<button type="button" class="btn btn--sm" data-batch-act="pause" data-id="' + b.id + '"' + off + '>' + (b.paused ? 'Resume' : 'Pause') + '</button>') + '<button type="button" class="btn btn--sm btn--tertiary" data-batch-act="cancel" data-id="' + b.id + '"' + off + '>Cancel…</button></div></li>';
  }
  function listHtml(p) {
    init();
    if (st.loading) return '<div class="ck-cl" aria-busy="true">' + [1, 2, 3, 4].map(function () { return '<div class="ck-sk-item"><span class="sk-line"><span class="sk ck-sk-m"></span></span><span class="sk-line sk-line--meta"><span class="sk sk--meta ck-sk-s"></span></span></div>'; }).join('') + '</div>';
    var live = C.live(), recentMine = CK.calls.filter(function (c) { return !C.active(c); }), rec = F.recent(), bs = batches();
    return '<div class="ck-cl" data-roving-list>' +
      '<button type="button" class="ck-item ck-item--new" data-call="new" data-roving tabindex="-1"' + (st.selected === 'new' ? ' aria-current="true"' : '') + '>' + V.icon('plus') + '<span>New call</span></button>' +
      '<section class="ck-grp" aria-labelledby="' + p + '-g1"><h3 class="ck-grp-h" id="' + p + '-g1">Live now <span class="count-badge">' + live.length + '</span></h3>' + (live.length ? '<ul class="ck-items">' + live.map(function (c) { return item(c, p); }).join('') + '</ul>' : '<p class="ck-grp-empty">No calls live.</p>') + '</section>' +
      '<section class="ck-grp" aria-labelledby="' + p + '-g2"><h3 class="ck-grp-h" id="' + p + '-g2">Up next · Scheduled <span class="count-badge">' + bs.length + '</span></h3>' + (bs.length ? '<ul class="ck-items">' + bs.map(function (b) { return batchHtml(b, p); }).join('') + '</ul>' : '<p class="ck-grp-empty">Nothing scheduled.</p>') + '</section>' +
      '<section class="ck-grp" aria-labelledby="' + p + '-g3"><h3 class="ck-grp-h" id="' + p + '-g3">Recent</h3>' + (recentMine.length + rec.length ? '<ul class="ck-items">' + recentMine.reverse().map(function (c) { return item(c, p); }).join('') + rec.map(function (k) { return recentItem(k, p); }).join('') + '</ul><a class="ck-link ck-grp-more" href="call-reports.html">Open Call reports</a>' : '<p class="ck-grp-empty">No calls yet today.</p>') + '</section></div>';
  }
  L.render = function () {
    init();
    [['ck-calls-list', 'ckc'], ['ck-switcher-list', 'cks']].forEach(function (x) {
      var box = d.getElementById(x[0]); if (!box) return;
      var a = d.activeElement, focusCall = a && box.contains(a) ? a.getAttribute('data-call') || a.getAttribute('data-batch') || (a.getAttribute('data-batch-act') ? a.getAttribute('data-batch-act') + ':' + a.getAttribute('data-id') : null) : null;
      box.innerHTML = listHtml(x[1]); V.initAll(box); roving(box);
      if (focusCall) { var n = box.querySelector('[data-call="' + focusCall + '"],[data-batch="' + focusCall + '"]') || (focusCall.indexOf(':') > 0 ? box.querySelector('[data-batch-act="' + focusCall.split(':')[0] + '"][data-id="' + focusCall.split(':')[1] + '"]') : null); if (n) { if (n.hasAttribute('data-roving')) setRove(box, n); n.focus({ preventScroll: true }); } }
    });
  };
  function rovers(box) { return CK.$$('[data-roving]', box); }
  function setRove(box, el) { rovers(box).forEach(function (r) { r.setAttribute('tabindex', r === el ? '0' : '-1'); }); }
  function roving(box) { var cur = box.querySelector('[data-roving][aria-current="true"]') || rovers(box)[0]; if (cur) setRove(box, cur); }
  d.addEventListener('keydown', function (e) {
    var r = e.target.closest && e.target.closest('[data-roving]'); if (!r) return;
    var box = r.closest('[data-roving-list]'), l = rovers(box), i = l.indexOf(r), n = null;
    if (e.key === 'ArrowDown') n = l[Math.min(l.length - 1, i + 1)]; else if (e.key === 'ArrowUp') n = l[Math.max(0, i - 1)]; else if (e.key === 'Home') n = l[0]; else if (e.key === 'End') n = l[l.length - 1];
    if (n) { e.preventDefault(); setRove(box, n); n.focus(); }
  });
  d.addEventListener('click', function (e) {
    var it = e.target.closest('[data-call]'); if (it && it.closest('.ck-cl')) { var inPop = it.closest('#ck-switcher-list'); CK.select(it.getAttribute('data-call'), { focus: !!inPop }); if (inPop) V.popover.close('ck-switcher-pop'); return; }
    var ba = e.target.closest('[data-batch-act]'); if (!ba) return;
    var b = batches().filter(function (x) { return x.id === ba.getAttribute('data-id'); })[0]; if (!b) return;
    if (ba.getAttribute('aria-disabled') === 'true') { V.announce(ba.getAttribute('data-tooltip') || OFFLINE_BATCH); return; }
    if (ba.getAttribute('data-batch-act') === 'pause') { b.paused = !b.paused; V.toast.info(b.name + (b.paused ? ' paused. No new calls start until you resume.' : ' resumed.')); L.render(); return; }
    var left = b.single ? 1 : b.total - (b.placed || 0);
    V.dialog.confirm({ title: 'Cancel ‘' + b.name + '’?', body: left + (left === 1 ? ' call won’t' : ' calls won’t') + ' be placed. Calls already placed stay in Call reports.', confirmLabel: 'Cancel ' + (b.single ? 'call' : 'batch'), cancelLabel: 'Keep ' + (b.single ? 'call' : 'batch'), tone: 'danger', returnTo: ba }).then(function (ok) {
      if (!ok) return; L.batches = batches().filter(function (x) { return x !== b; }); L.render(); CK.header(); V.toast.success(b.name + ' cancelled.');
    });
  });
})(window, document);
