/* Vaani Labs prototype · Call reports · RecordingPlayer and TranscriptFeed in review mode (spec §2.6.2, data-nav §12.4–12.5).
   There is no audio in the prototype: playback is a clock that moves the playhead, the time and the playing turn. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, P = NS.page, $ = U.$, $$ = U.$$, esc = U.esc, fmt = V.fmt, store = U.store;
  var S = { c: null, t: 0, dur: 0, playing: false, speed: +(store.get('vaani:call-reports:speed') || 1), timer: null, active: -1, follow: true, q: '', hit: 0, hits: [] };
  function tc(s) { return fmt.timecode(s); }
  function turns() { return S.c ? NS.turnsOf(S.c) : []; }

  /* ---------- markup ---------- */
  function scrubber(c) {
    var T = turns().filter(function (t) { return t.speaker !== 'system'; }), dur = c.durationSec, pct = function (ms) { return Math.max(0, Math.min(100, ms / 10 / dur)).toFixed(2); };
    var attrs = 'role="slider" tabindex="0" aria-label="Recording position" aria-valuemin="0" aria-valuemax="' + dur + '" aria-valuenow="0" aria-valuetext="00:00 of ' + tc(dur) + '" id="cs-scrub"';
    if (T.length && T.every(function (t) { return t.startMs != null; })) {   /* R2D-13: per-turn timing, not per-turn language, decides the TalkStrip */
      var lane = function (who) { return T.filter(function (t) { return t.speaker === who; }).map(function (t) { return '<i style="left: ' + pct(t.startMs) + '%; width: ' + Math.max(0.6, pct((t.endMs || t.startMs + 3000) - t.startMs)) + '%"></i>'; }).join(''); };
      return '<div class="talk" ' + attrs + '><div class="talk-lane talk-lane--agent">' + lane('agent') + '</div><div class="talk-lane talk-lane--caller">' + lane('caller') + '</div><span class="playhead" id="cs-head"></span></div>';
    }
    /* No per-turn timing (B6 missing): waveform from the server’s peaks. */
    var r = c.id.charCodeAt(6) + c.id.charCodeAt(7), bars = []; for (var i = 0; i < 72; i++) bars.push('<i style="height: ' + (22 + Math.round(70 * Math.abs(Math.sin(i * 0.55 + dur) * Math.cos(i * 0.23 + r)))) + '%"></i>');
    return '<div class="talk cs-wave-wrap" ' + attrs + '><div class="wave" id="cs-wave">' + bars.join('') + '</div><span class="playhead" id="cs-head"></span></div>';
  }
  function talkShares(c) {
    var T = turns(), a = 0, b = 0; T.forEach(function (t) { var len = (t.endMs || t.startMs + 3000) - t.startMs; if (t.speaker === 'agent') a += len; else if (t.speaker === 'caller') b += len; });
    var tot = a + b || 1; return { agent: Math.round(a / tot * 100), caller: Math.round(b / tot * 100), turns: T.filter(function (t) { return t.speaker !== 'system'; }).length, inter: c.id.charCodeAt(7) % 3 === 0 ? 1 : 0 };
  }
  function playerHtml(c) {
    var rec = c.recording || {};
    if (P.offline()) return '<div class="notice notice--neutral">' + V.icon('cloud-off') + '<span class="notice-body">Recording needs a connection. The transcript below is still readable.</span></div>';
    if (!rec.available) return '<div class="notice notice--info notice--multi">' + V.icon('info') + '<span class="notice-body">No recording for this call. ' + esc(rec.offReason || '') + (turns().length ? ' The transcript is still available.' : '') + '</span></div>';
    var sh = talkShares(c), per = turns().length > 0 && turns().every(function (t) { return t.startMs != null; });   /* R2D-13: TalkStrip whenever per-turn timing exists; perTurnLanguage only drives the lang attributes */
    return '<div class="player cs-player" role="group" aria-label="Recording" id="cs-player"><div class="player-row">' +
      '<button class="ibtn ibtn--secondary" type="button" id="cs-play" aria-label="Play recording"><i data-icon="play"></i></button>' +
      '<button class="ibtn" type="button" data-skip="-5" aria-label="Back 5 seconds"><i data-icon="rotate-ccw"></i></button>' +
      '<button class="ibtn" type="button" data-skip="5" aria-label="Forward 5 seconds"><i data-icon="rotate-cw"></i></button>' +
      '<span class="player-time" id="cs-time">00:00 / ' + tc(c.durationSec) + '</span><span class="l-spacer"></span>' +
      '<button class="btn btn--sm btn--tertiary" type="button" id="cs-speed" aria-haspopup="menu" aria-controls="cs-speed-menu" aria-expanded="false" aria-label="Playback speed, ' + S.speed + '×">' + S.speed + '×' + V.icon('chevron-down', 'sm') + '</button></div>' +
      scrubber(c) + '<div class="talk-legend">' + (per ? '<span><i class="talk-sw talk-sw--agent" data-mark></i>Agent ' + sh.agent + '%</span><span><i class="talk-sw talk-sw--caller" data-mark></i>Caller ' + sh.caller + '%</span>' : '') +
      '<span>' + sh.turns + ' turns</span>' + (per ? '<span>' + (sh.inter ? '1 interruption' : 'No interruptions') + '</span>' : '<span>Waveform · per-turn timing not available</span>') +
      '<span class="u-ml-auto">Recording disclosed at ' + tc(rec.disclosedAtSec || 1) + '</span></div></div>';
  }
  function turnHtml(t, i) { return V.ui.turn(t, { review: !!(S.c.recording && S.c.recording.available && !P.offline()), active: false, perTurnLanguage: !!S.c.perTurnLanguage }).replace('<li class="turn', '<li data-i="' + i + '" class="turn').replace('<li class="turn--sys"', '<li data-i="' + i + '" class="turn--sys"'); }
  NS.renderTranscript = function (c, panel) {
    stop(); S.c = c; S.dur = c.durationSec || 0; S.t = 0; S.active = -1; S.follow = true; S.q = ''; S.hits = [];
    var T = turns();
    if (P.flag('transcript-error')) { panel.innerHTML = '<div class="cs-sticky">' + playerHtml(c) + '</div><div class="ierr" role="status"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t load the transcript. <button type="button" class="btn btn--link" data-retry-transcript>Retry</button></span></div></div>'; wire(); return; }
    var end = c.result === 'completed' || c.result === 'voicemail' ? '<p class="cs-end">' + V.icon('phone-off', 'sm') + 'Call ended · ' + tc(c.durationSec) + (c.outcome ? ' · Outcome written: ' + esc(c.outcome) : ' · No outcome written') + '</p>' : '';
    var feed = T.length ? '<section class="cs-feed" aria-labelledby="cs-feed-h"><div class="cs-feed-head"><h3 id="cs-feed-h">Transcript</h3><span class="count-badge">' + T.filter(function (t) { return t.speaker !== 'system'; }).length + ' turns</span><span class="l-spacer"></span>' +
      '<button class="ibtn ibtn--sm" type="button" id="cs-ts-btn" aria-label="Search transcript" aria-expanded="false" aria-controls="cs-ts" data-kbd="mod+f"><i data-icon="search"></i></button>' +
      '<button class="ibtn ibtn--sm" type="button" data-tcopy aria-label="Copy transcript"><i data-icon="copy"></i></button><button class="ibtn ibtn--sm" type="button" data-tdl aria-label="Download transcript (.txt)"><i data-icon="download"></i></button></div>' +
      '<div class="cs-ts" id="cs-ts" hidden><div class="input input--sm">' + V.icon('search') + '<input type="search" id="cs-ts-q" aria-label="Search transcript" placeholder="Search this transcript" autocomplete="off"></div><span class="cs-ts-n" id="cs-ts-n" aria-live="polite"></span>' +
      '<button class="ibtn ibtn--sm" type="button" data-ts="-1" aria-label="Previous match"><i data-icon="chevron-up"></i></button><button class="ibtn ibtn--sm" type="button" data-ts="1" aria-label="Next match"><i data-icon="chevron-down"></i></button><button class="ibtn ibtn--sm" type="button" data-ts="close" aria-label="Close transcript search"><i data-icon="x"></i></button></div>' +
      '<ol class="cs-turns" aria-label="Transcript" id="cs-turns">' + T.map(turnHtml).join('') + '</ol>' + end + '</section>'
      : '<p class="tr-empty">' + (c.result === 'no_answer' || c.result === 'busy' || c.result === 'failed' || c.result === 'timed_out' ? 'No transcript. The call didn’t connect.' : 'No transcript for this call.') + '</p>';
    panel.innerHTML = '<div class="cs-sticky">' + playerHtml(c) + '</div>' + feed + '<button class="btn btn--sm jump-latest cs-follow" type="button" id="cs-follow" hidden>' + V.icon('arrow-down', 'sm') + 'Follow playback</button>';
    wire();
    if (P.st.t != null && S.dur) { seek(P.st.t); }
  };
  function wire() { V.initAll($('#cs-p-transcript')); var sp = $('#cs-speed'); if (sp) setSpeedChecks(); }

  /* ---------- clock ---------- */
  function update(announceTurn) {
    var time = $('#cs-time'), head = $('#cs-head'), sc = $('#cs-scrub'), T = turns();
    if (time) time.textContent = tc(S.t) + ' / ' + tc(S.dur);
    if (head) head.style.left = (S.dur ? S.t / S.dur * 100 : 0).toFixed(2) + '%';
    var who = null, idx = -1;
    T.forEach(function (t, i) { if (t.speaker !== 'system' && t.startMs <= S.t * 1000 + 1) { idx = i; who = t.speaker; } });
    if (sc) { sc.setAttribute('aria-valuenow', Math.round(S.t)); sc.setAttribute('aria-valuetext', tc(S.t) + ' of ' + tc(S.dur) + (who ? ', ' + (who === 'caller' ? 'Caller' : 'Vaani') + ' speaking' : '')); }
    var wave = $('#cs-wave'); if (wave) $$('i', wave).forEach(function (b, i, a) { b.classList.toggle('is-played', i / a.length < S.t / S.dur); });
    if (idx !== S.active && (S.playing || announceTurn)) setActive(idx);
  }
  function setActive(idx) {
    var T = turns(), list = $('#cs-turns'); if (!list) { S.active = idx; return; }
    /* Update in place (never re-render the row: focus may sit on its timecode or step link). */
    var old = $('li[data-i="' + S.active + '"]', list); S.active = idx;
    if (old) { old.classList.remove('turn--active'); old.removeAttribute('aria-current'); var pl = $('.cs-playing', old); if (pl) pl.remove(); }
    var cur = $('li[data-i="' + idx + '"]', list); if (!cur || !cur.classList.contains('turn')) return;
    cur.classList.add('turn--active'); cur.setAttribute('aria-current', 'true');
    var h = $('.turn-h', cur); if (h && !$('.cs-playing', h)) { var sp = d.createElement('span'); sp.className = 'cs-playing'; sp.textContent = 'Playing'; var who = $('.turn-who', h); var after = who && who.nextElementSibling && who.nextElementSibling.classList.contains('lm-g') ? who.nextElementSibling : who; if (after) after.after(sp); else h.appendChild(sp); }
    if (S.follow && S.playing) { S.auto = Date.now(); cur.scrollIntoView({ block: 'nearest', behavior: V.reducedMotion() ? 'auto' : 'smooth' }); }
  }
  function tick() { S.t = Math.min(S.dur, S.t + 0.25 * S.speed); update(); if (S.t >= S.dur) pause(); }
  function play() {
    if (!S.dur) return; if (S.t >= S.dur) S.t = 0;
    S.playing = true; clearInterval(S.timer); S.timer = setInterval(tick, 250);
    var b = $('#cs-play'); if (b) { b.innerHTML = V.icon('pause'); b.setAttribute('aria-label', 'Pause recording'); }
    update(true);
  }
  function pause() { S.playing = false; clearInterval(S.timer); var b = $('#cs-play'); if (b) { b.innerHTML = V.icon('play'); b.setAttribute('aria-label', 'Play recording'); } $('#cs-follow') && ($('#cs-follow').hidden = true); }
  function stop() { pause(); S.c = null; }
  function seek(sec, andPlay) { S.t = Math.max(0, Math.min(S.dur, sec)); S.follow = true; if ($('#cs-follow')) $('#cs-follow').hidden = true; update(true); if (andPlay) play(); }
  NS.player = { stop: stop, pause: pause, seek: seek, time: function () { return Math.round(S.t); }, state: S };

  /* ---------- transcript search (⌘/Ctrl+F while focus is in the sheet) ---------- */
  function openSearch() { var box = $('#cs-ts'); if (!box) return; box.hidden = false; $('#cs-ts-btn').setAttribute('aria-expanded', 'true'); $('#cs-ts-q').focus(); }
  NS.openTranscriptSearch = function () { if (!$('#cs-p-transcript') || $('#cs-p-transcript').hidden) NS.showTab('transcript'); setTimeout(openSearch, 0); };
  function highlight() {
    var q = S.q.toLowerCase(); S.hits = [];
    $$('#cs-turns .turn-u').forEach(function (p) {
      var li = p.closest('li'), text = p.textContent; if (!q) { p.textContent = text; return; }
      var low = text.toLowerCase(), out = '', at = 0, i;
      while ((i = low.indexOf(q, at)) >= 0) { out += esc(text.slice(at, i)) + '<mark data-hit="' + S.hits.length + '">' + esc(text.slice(i, i + q.length)) + '</mark>'; S.hits.push(li); at = i + q.length; }
      p.innerHTML = out + esc(text.slice(at));
    });
    var n = $('#cs-ts-n'); if (n) n.textContent = !q ? '' : S.hits.length ? (S.hit + 1) + ' of ' + S.hits.length : 'No matches';
  }
  function goHit(dir) { if (!S.hits.length) return; S.hit = (S.hit + dir + S.hits.length) % S.hits.length; highlight(); var m = $('mark[data-hit="' + S.hit + '"]'); if (m) m.scrollIntoView({ block: 'center', behavior: V.reducedMotion() ? 'auto' : 'smooth' }); }

  /* ---------- events ---------- */
  d.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('#cr-sheet')) return;
    var t = e.target.closest('#cs-play,[data-skip],[data-seek],[data-seek-cap],#cs-ts-btn,[data-ts],[data-tcopy],[data-tdl],#cs-follow,[data-retry-transcript]'); if (!t) return;
    if (t.id === 'cs-play') { if (S.playing) pause(); else play(); }
    else if (t.hasAttribute('data-skip')) seek(S.t + +t.getAttribute('data-skip'));
    else if (t.hasAttribute('data-seek')) { e.preventDefault(); seek(+t.getAttribute('data-seek') / 1000, true); }
    else if (t.hasAttribute('data-seek-cap')) { var s = +t.getAttribute('data-seek-cap'); NS.showTab('transcript'); setTimeout(function () { seek(s, true); var b = $('#cs-play'); if (b) b.focus(); }, 0); }
    else if (t.id === 'cs-ts-btn') { var box = $('#cs-ts'); if (box.hidden) openSearch(); else closeSearch(); }
    else if (t.getAttribute('data-ts') === 'close') closeSearch();
    else if (t.hasAttribute('data-ts')) goHit(+t.getAttribute('data-ts'));
    else if (t.hasAttribute('data-tcopy')) P.copy(NS.transcriptText(S.c), 'Transcript copied');
    else if (t.hasAttribute('data-tdl')) NS.downloadTranscript(S.c);
    else if (t.id === 'cs-follow') { S.follow = true; t.hidden = true; setActive(S.active); }
    else if (t.hasAttribute('data-retry-transcript')) { P.proto = null; NS.renderPanel(NS.callById(P.openId), 'transcript'); }
  });
  function closeSearch() { var box = $('#cs-ts'); if (!box) return; box.hidden = true; S.q = ''; highlight(); $('#cs-ts-btn').setAttribute('aria-expanded', 'false'); $('#cs-ts-btn').focus(); }
  d.addEventListener('input', function (e) { if (e.target.id === 'cs-ts-q') { S.q = e.target.value.trim(); S.hit = 0; highlight(); if (S.hits.length) goHit(0); } });
  $('#cr-sheet').addEventListener('keydown', function (e) {
    if (e.target.id === 'cs-ts-q') { if (e.key === 'Enter') { e.preventDefault(); goHit(e.shiftKey ? -1 : 1); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeSearch(); } return; }
    var sc = e.target.closest && e.target.closest('#cs-scrub');
    if (sc) {
      var k = e.key, step = e.shiftKey ? 15 : 5, n = null;
      if (k === 'ArrowRight' || k === 'ArrowUp') n = S.t + step; else if (k === 'ArrowLeft' || k === 'ArrowDown') n = S.t - step;
      else if (k === 'PageUp') n = S.t + 30; else if (k === 'PageDown') n = S.t - 30; else if (k === 'Home') n = 0; else if (k === 'End') n = S.dur;
      if (n != null) { e.preventDefault(); seek(n); return; }
    }
    /* Space or K play and pause inside the player group only (never grabbed from the page). */
    if (e.target.closest && e.target.closest('#cs-player') && ((e.key === ' ' && e.target.tagName !== 'BUTTON') || e.key === 'k' || e.key === 'K') && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); if (S.playing) pause(); else play(); }
  });
  d.addEventListener('pointerdown', function (e) {
    var sc = e.target.closest && e.target.closest('#cs-scrub'); if (!sc || e.button > 0) return;
    e.preventDefault(); sc.focus();
    var at = function (x) { var r = sc.getBoundingClientRect(); seek((x - r.left) / r.width * S.dur); };
    at(e.clientX); var mv = function (ev) { at(ev.clientX); }, up = function () { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); };
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
  });
  /* Scrolling the transcript by hand while playing stops following; "Follow playback" brings it back. */
  ['wheel', 'touchmove'].forEach(function (ev) { d.addEventListener(ev, function (e) { if (S.playing && e.target.closest && e.target.closest('#cs-body') && Date.now() - (S.auto || 0) > 500) { S.follow = false; var f = $('#cs-follow'); if (f) f.hidden = false; } }, { passive: true }); });
  function setSpeedChecks() { $$('#cs-speed-menu [role="menuitemradio"]').forEach(function (m) { m.setAttribute('aria-checked', +m.getAttribute('data-value') === S.speed ? 'true' : 'false'); }); }
  d.addEventListener('vaani:menuselect', function (e) {
    if (!e.detail.item.closest('#cs-speed-menu')) return;
    S.speed = +e.detail.value; store.set('vaani:call-reports:speed', String(S.speed));
    var b = $('#cs-speed'); if (b) { b.innerHTML = S.speed + '×' + V.icon('chevron-down', 'sm'); b.setAttribute('aria-label', 'Playback speed, ' + S.speed + '×'); }
    setSpeedChecks(); V.announce('Speed ' + S.speed + '×');
  });
  NS.transcriptText = function (c) { return NS.turnsOf(c).map(function (t) { return tc(t.startMs / 1000) + '  ' + (t.speaker === 'system' ? '· ' : (t.speaker === 'caller' ? 'Caller' : 'Vaani') + ': ') + t.text; }).join('\n'); };
  NS.downloadTranscript = function (c) { if (!c) return; P.download('transcript-' + c.id + '.txt', P.callTitle(c) + '\n' + NS.metaLine(c) + '\n\n' + NS.transcriptText(c)); V.toast.success('Transcript downloaded · transcript-' + c.id + '.txt'); };
})(window, document);
