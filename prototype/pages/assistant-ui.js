/* Vaani Labs prototype · pages/assistant-ui.js — shared helpers and the conversation renderer (02 §7): AssistantTurn,
   ActivityRow, answer blocks, plan pointer, sources, follow-ups and turn actions. No bubbles, no avatars: a turn is a block
   with a speaker line. Streamed text is never announced; one polite announcement per completed reply (engine). */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt;
  var A = w.VaaniAssistant = w.VaaniAssistant || {};


  /* ---------- small helpers ---------- */
  var T0 = Date.now(), NOW = F.now().getTime();
  /* The demo clock (27 Sep 2026, 11:24 am IST) plus the time this page has been open. */
  A.nowIso = function () { return new Date(NOW + (Date.now() - T0)).toISOString(); };
  A.ic = function (n, s, o) { return V.icon(n, s, o); };
  A.spin = function (s) { return V.icon('loader-circle', s || 'sm', { className: 'spinner' }); };
  A.plural = function (n, one, many) { return F.count(n) + ' ' + (n === 1 ? one : (many || one + 's')); };
  A.whenLower = function (iso) { return F.when(iso).replace(/^Today/, 'today').replace(/^Yesterday/, 'yesterday').replace(/^Tomorrow/, 'tomorrow'); };
  A.say = function (msg, assertive, key) { V.announce(msg, { politeness: assertive ? 'assertive' : 'polite', dedupeKey: key }); };
  A.money = function (v, whole) { return F.money(v, { whole: !!whole }); };
  A.link = function (l, cls) { return '<a class="' + (cls || 'as-a') + '" href="' + esc(l.href) + '">' + esc(l.label) + '</a>'; };
  A.firstSentence = function (html) { var t = String(html).replace(/<[^>]+>/g, '').trim(); var m = t.match(/^.*?[.!?](\s|$)/); t = (m ? m[0] : t).trim(); return t.length > 140 ? t.slice(0, 139) + '…' : t; };
  A.S = A.S || {};

  /* ---------- the dock and what the reader can see (02 §5.5–5.6; WCAG 2.4.11) ----------
     Below 1024 the PlanBar + composer stick to the bottom of the document (above the BottomBar on phones), so they cover
     the last ~120 px of the viewport. The dock’s height is published as --as-dock-h; assistant.css adds it to html’s
     scroll-padding-bottom, so focus moves, scrollIntoView and keyboard scrolling all stop above the dock. "Jump to latest"
     floats just above the dock (over the thread’s own scroll box at ≥ 1024); while it shows, its footprint is --as-jump-h. */
  var dockEl = d.getElementById('as-dock'), jumpEl = d.getElementById('as-jump');
  function syncDock() {
    var on = dockEl && !dockEl.hidden, db = on ? dockEl.getBoundingClientRect() : null, rs = d.documentElement.style;
    rs.setProperty('--as-dock-h', (on ? Math.ceil(db.height) : 0) + 'px');
    rs.setProperty('--as-jump-h', (on && jumpEl && !jumpEl.hidden ? Math.ceil(db.top - jumpEl.getBoundingClientRect().top) : 0) + 'px');
  }
  A.syncDock = syncDock;
  if (dockEl) { if (w.ResizeObserver) new ResizeObserver(syncDock).observe(dockEl, { box: 'border-box' }); else w.addEventListener('resize', syncDock); syncDock(); }
  /* The visible band of the conversation’s scroller, in viewport coordinates: its own box at ≥ 1024, otherwise the viewport;
     minus its scroll padding (the sticky TopBar above; the dock, Jump to latest and BottomBar below), so the two never disagree. */
  A.band = function () {
    syncDock(); var s = A.scroller(), doc = s === d.scrollingElement, r = doc ? { top: 0, bottom: s.clientHeight } : s.getBoundingClientRect(), cs = getComputedStyle(doc ? d.documentElement : s);
    return { top: r.top + (parseFloat(cs.scrollPaddingTop) || 0), bottom: r.bottom - (parseFloat(cs.scrollPaddingBottom) || 0) };
  };
  /* Bring the inline ApprovalCard into that band: the whole card when it fits; otherwise its top when focus is going to its
     title (o.top), else its decision row (Skip step · Edit… · the primary), which then ends just above the dock. */
  A.showCard = function (el, o) {
    o = o || {}; if (!el || el.hidden) return;
    var s = A.scroller(), b = A.band(), gap = 8, r = el.getBoundingClientRect(), feet = el.querySelectorAll('.as-ap-foot'), f = feet.length ? feet[feet.length - 1].getBoundingClientRect() : r, dy = 0;
    if (r.height <= b.bottom - b.top - 2 * gap) { if (r.top < b.top + gap) dy = r.top - b.top - gap; else if (r.bottom > b.bottom - gap) dy = r.bottom - b.bottom + gap; }
    else dy = o.top ? r.top - b.top - gap : f.bottom - b.bottom + gap;
    if (Math.abs(dy) >= 1) s.scrollTo({ top: s.scrollTop + dy, behavior: o.smooth && !V.reducedMotion() ? 'smooth' : 'auto' });
  };

  /* ---------- turns ---------- */
  function head(t) {
    var who = t.role === 'user' ? 'You' : 'Assistant';
    var when = t.state === 'sending' ? '<span class="as-when">Sending…</span>' : t.state === 'failed' ? '<span class="as-when as-when--bad">Not sent</span>' : '<time class="as-when" datetime="' + esc(t.at) + '">' + esc(F.time(t.at)) + '</time>';
    return '<div class="as-turn-head" id="' + t.id + '-h"><span class="as-who">' + who + '</span><span class="sr-only">, </span>' + when + (t.voice ? '<span class="tag tag--outline">Voice</span>' : '') + '</div>';
  }
  function actRow(a) {
    var running = a.state === 'running';
    return '<li class="as-act' + (running ? ' as-act--run' : '') + '">' + (running ? A.spin('sm') : A.ic(a.icon || 'search', 'sm')) + '<span>' +
      esc(running ? a.running : a.text) + (!running && a.link ? ' ' + (a.link.pre || '') + A.link(a.link, 'as-a as-a--quiet') : '') + (!running && a.tail ? ' · ' + esc(a.tail) : '') + (!running && a.ms ? ' · <span class="as-ms">' + esc(a.ms) + '</span>' : '') + '</span></li>';
  }
  A.activityHtml = function (t) {
    var list = t.activity || []; if (!list.length) return '';
    var collapsed = list.length > 3 && !t.actOpen && list.every(function (a) { return a.state !== 'running'; });
    if (collapsed) return '<div class="as-acts-wrap"><button type="button" class="as-acts-toggle" aria-expanded="false" data-act="acts" aria-controls="' + t.id + '-acts">' + A.ic('search', 'sm') + 'Looked at ' + list.length + ' sources · <span class="as-u">Show</span></button><ul class="as-acts" id="' + t.id + '-acts" hidden></ul></div>';
    return '<div class="as-acts-wrap">' + (list.length > 3 ? '<button type="button" class="as-acts-toggle" aria-expanded="true" data-act="acts" aria-controls="' + t.id + '-acts">' + A.ic('search', 'sm') + 'Looked at ' + list.length + ' sources · <span class="as-u">Hide</span></button>' : '') +
      '<ul class="as-acts" id="' + t.id + '-acts">' + list.map(actRow).join('') + '</ul></div>';
  };

  /* ---------- answer content blocks (02 §7.3) ---------- */
  function callbacksTable(b) {
    var rows = b.rows, more = b.total - rows.length;
    var tr = rows.map(function (r) {
      return '<tr><td class="c-key"><a href="' + esc(r.href) + '" translate="no">' + esc(r.name) + '</a><span class="as-city"> · ' + esc(r.city) + '</span></td><td class="num">' + esc(F.time(r.due)) + '</td><td>' + esc(r.last ? F.when(r.last) : 'Not called yet') + '</td><td class="as-col-lang">' + V.ui.langMark(r.lang) + '</td></tr>';
    }).join('');
    var ml = rows.slice(0, 3).map(function (r) {
      return '<li class="li"><span class="li-title"><span translate="no">' + esc(r.name) + '</span></span><span class="li-meta num as-li-end">Due ' + esc(F.time(r.due)) + '</span>' +
        '<span class="li-meta">' + V.ui.phoneText(r.phone, { size: 'sm' }) + ' · ' + esc(r.last ? F.when(r.last) : 'Not called yet') + '</span><span class="li-meta as-li-end">' + esc(V.langByCode(r.lang).name) + '</span></li>';
    }).join('');
    return '<div class="dt-wrap dt-wrap--framed as-mt"><table class="dt"><caption>Showing ' + rows.length + ' of ' + b.total + ' · ' + A.link(b.link) + '</caption>' +
      '<thead><tr><th scope="col">Lead</th><th scope="col">Due</th><th scope="col">Last call</th><th scope="col" class="as-col-lang">Language</th></tr></thead><tbody>' + tr + '</tbody></table></div>' +
      '<ul class="as-ml" aria-label="' + b.total + ' leads, showing 3">' + ml + '<li class="as-ml-more"><a class="as-a" href="' + esc(b.link.href) + '">and ' + (b.total - 3) + ' more · Open in Leads</a></li></ul>' + (more < 0 ? '' : '');
  }
  function stats(b) {
    return '<div class="as-statbox"><div class="as-stats">' + b.items.map(function (s) {
      var dl = s.delta ? '<span class="delta ' + (s.delta.n < 0 ? 'delta--bad' : s.delta.n > 0 ? 'delta--good' : 'delta--flat') + '">' + A.ic(s.delta.n < 0 ? 'arrow-down' : s.delta.n > 0 ? 'arrow-up' : 'minus', 'xs') + (s.delta.n > 0 ? '+' : s.delta.n < 0 ? '−' : '') + Math.abs(s.delta.n) + '</span><span class="stat-scope">' + esc(s.delta.vs) + '</span>' : '';
      return '<div class="stat stat--compact"><span class="stat-label">' + esc(s.label) + '</span><span class="stat-value">' + esc(s.value) + (s.unit ? '<span class="stat-unit">' + esc(s.unit) + '</span>' : '') + '</span><span class="stat-foot">' + dl + '</span></div>';
    }).join('') + '</div><p class="stat-scope as-scope">' + esc(b.scope) + '</p></div>';
  }
  function quote(b) {
    var c = b.call;
    return '<figure class="as-quote"><figcaption class="as-quote-h">' + A.ic('phone', 'sm') + '<span>Call with <span translate="no">' + esc(c.leadName) + '</span> · ' + esc(F.dateShort(c.at)) + ', ' + esc(F.time(c.at)) + ' · ' + A.link({ label: 'Open call', href: 'call-reports.html?call=' + c.id }) + '</span></figcaption>' +
      '<ol class="as-quote-list" data-call="' + esc(c.id) + '" aria-label="Transcript excerpt">' + b.turns.map(function (t) { return V.ui.turn(t, { review: true }); }).join('') + '</ol></figure>';
  }
  var BLOCK = {
    text: function (b) { return '<div class="as-text">' + b.html + '</div>'; },
    table: callbacksTable,
    rows: function (b) { return '<div class="dt-wrap dt-wrap--framed as-mt as-mt--plain"><table class="dt"><caption>' + esc(b.caption) + '</caption><thead><tr>' + b.cols.map(function (c) { return '<th scope="col"' + (c.num ? ' class="c-num"' : '') + '>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>' + b.rows.map(function (r) { return '<tr>' + r.map(function (v, i) { return '<td class="' + (i === 0 ? 'c-key' : '') + (b.cols[i].num ? ' c-num' : '') + '"' + (i === 0 ? ' translate="no"' : '') + '>' + v + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; },
    stats: stats,
    kv: function (b) { return '<dl class="kv as-kv">' + b.rows.map(function (r) { return '<div class="kv-row"><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; },
    flowcard: function (b) { return '<a class="card card--interactive as-flowcard" href="' + esc(b.href) + '"><span class="as-flowcard-in"><span class="as-flowcard-top">' + A.ic('workflow') + '<span class="as-flowcard-name" translate="no">' + esc(b.name) + '</span>' + V.ui.statusTag('flow', b.status || 'not-published', { v: b.v }) + '</span><span class="as-flowcard-meta">' + esc(b.meta) + '</span><span class="as-flowcard-open">Open in Flows' + A.ic('arrow-right', 'sm') + '</span></span></a>'; },
    quote: quote,
    passage: function (b) { return '<blockquote class="as-passage"><p>' + esc(b.text) + '</p><footer>' + A.ic('book-open', 'xs') + esc(b.source) + '</footer></blockquote>'; },
    code: function (b) { return '<div class="as-code"><pre class="codeblock">' + esc(b.text) + '</pre><button type="button" class="ibtn ibtn--sm as-code-copy" aria-label="Copy code" data-act="copy-code">' + A.ic('copy', 'sm') + '</button></div>'; },
    note: function (b) { return '<p class="as-note">' + b.html + '</p>'; }
  };
  A.blockHtml = function (b) { return (BLOCK[b.t] || BLOCK.text)(b); };

  /* ---------- footer parts ---------- */
  A.pointerHtml = function (t) {
    var p = A.S.chat && A.S.chat.plan; if (!t.plan || !p || p.id !== t.plan) return '';
    var later = A.S.chat.turns.slice(A.S.chat.turns.indexOf(t) + 1).some(function (x) { return x.plan === p.id; }); if (later) return '';
    var n = p.steps.length, st = A.planState(p);
    if (st === 'done' || st === 'stopped' || st === 'failed' || st === 'expired') {
      var ch = (A.S.chat.changes || []).filter(function (c) { return !c.undone; }).length;
      return '<div class="as-pointer">' + A.ic('list-checks', 'md', { className: 'u-fg-2' }) + '<span>Plan · ' + esc(V.statusDef('plan', st) ? V.statusDef('plan', st)[0] : st) + ' · ' + A.plural(ch, 'change') + '</span><button type="button" class="btn btn--link as-pointer-go" data-act="view-changes">View changes</button></div>';
    }
    return '<div class="as-pointer">' + A.ic('list-checks', 'md', { className: 'u-fg-2' }) + '<span>Plan · ' + A.plural(n, 'step') + '</span>' + V.ui.statusTag('plan', st) + '<button type="button" class="btn btn--link as-pointer-go" data-act="review">Review</button></div>';
  };
  A.sourcesHtml = function (t) {
    if (!t.sources) return '';
    if (t.sources === 'none') return '<p class="as-sources">Sources: none. This answer is general advice.</p>';
    return '<p class="as-sources"><span>Sources</span> · ' + t.sources.map(function (s) { return A.link(s, 'as-a as-a--quiet'); }).join(' · ') + '</p>';
  };
  A.sugButton = function (s, cls) {
    return '<button type="button" class="btn has-lead ' + (cls || '') + '" data-sug="' + esc(s.id || '') + '" data-insert="' + esc(s.insert || s.label) + '"' + (s.action ? ' data-action="' + esc(s.action) + '"' : '') + '>' + A.ic(s.icon || 'message-square', 'md', { className: 'u-fg-2' }) + '<span class="as-sug-l">' + esc(s.label) + '</span></button>';
  };
  function followups(t, isLast) {
    if (!isLast || !t.followups || !t.followups.length || A.waitingStep()) return '';
    return '<div class="as-sugs as-sugs--follow" role="group" aria-label="Suggestions">' + t.followups.slice(0, 3).map(function (f) { return A.sugButton({ id: 'follow', label: f, insert: f, icon: 'message-square' }); }).join('') + '</div>';
  }
  function actions(t, isLast) {
    if (t.role === 'user') {
      var canEdit = isLast && !t.stepsRan && A.S.chat && !A.stepsRanFor(t);
      return '<div class="as-tacts" role="group" aria-label="Message actions">' + '<button type="button" class="ibtn ibtn--sm" aria-label="Copy message" data-act="copy">' + A.ic('copy', 'sm') + '</button>' + (canEdit ? '<button type="button" class="ibtn ibtn--sm" aria-label="Edit message" data-act="edit">' + A.ic('pencil', 'sm') + '</button>' : '') + '</div>';
    }
    var ran = t.stepsRan;
    return '<div class="as-tacts' + (isLast ? ' as-tacts--on' : '') + '" role="group" aria-label="Answer actions"><button type="button" class="ibtn ibtn--sm" aria-label="Copy answer" data-act="copy">' + A.ic('copy', 'sm') + '</button>' +
      '<button type="button" class="ibtn ibtn--sm" aria-label="Answer again" data-act="retry"' + (ran ? ' aria-disabled="true" data-tooltip="Steps from this answer already ran. Ask again instead."' : '') + '>' + A.ic('refresh-cw', 'sm') + '</button>' +
      '<button type="button" class="ibtn ibtn--sm" aria-label="More actions for this answer" aria-haspopup="menu" aria-controls="as-turn-menu" aria-expanded="false" data-act="turn-menu">' + A.ic('ellipsis', 'sm') + '</button></div>';
  }
  function errorHtml(t) {
    var e = t.error; if (!e) return '';
    var id = 'as_' + t.id.slice(-4) + '7f3k';
    return '<div class="ierr as-ierr" role="alert"><div class="ierr-line">' + A.ic('circle-alert') + '<span>' + esc(e.text) + (e.retry ? ' <button type="button" class="btn btn--link" data-act="' + e.retry + '">' + esc(e.retryLabel || 'Retry') + '</button>' : '') + (e.edit ? ' · <button type="button" class="btn btn--link" data-act="edit-failed">Edit</button>' : '') + '</span></div>' +
      (e.details ? '<details class="details"><summary>Details</summary><div class="raw"><code>Error id ' + id + ' · ' + esc(e.details) + '</code></div></details>' : '') + '</div>';
  }

  A.turnHtml = function (t, i, n) {
    var isLast = i === n - 1, lastBot = isLast || (t.role === 'assistant' && i === n - 2 && A.S.chat.turns[n - 1].role === 'user' && A.S.chat.turns[n - 1].state === 'failed');
    var you = t.role === 'user', lang = t.lang ? ' lang="' + esc(t.lang) + '"' : '';
    var h = '<article class="as-turn as-turn--' + (you ? 'you' : 'bot') + '" id="' + t.id + '" aria-labelledby="' + t.id + '-h" aria-posinset="' + (i + 1) + '" aria-setsize="' + n + '" tabindex="-1"' + (t.state === 'streaming' ? ' aria-busy="true"' : '') + '>' + head(t);
    if (you) {
      h += '<div class="as-body as-body--you"' + lang + '>' + esc(t.text) + '</div>';
      if (t.attachments && t.attachments.length) h += '<ul class="as-tfiles">' + t.attachments.map(function (f) { return '<li>' + A.ic('file-text') + '<span class="as-tfile-n" translate="no">' + esc(A.midTrunc(f.name)) + '</span><span class="as-tfile-s">' + esc(F.bytes(f.size)) + '</span></li>'; }).join('') + '</ul>';
      if (t.state === 'failed') h += errorHtml({ id: t.id, error: { text: t.failText, retry: 'resend', edit: true } });
      if (t.confirmEdit) h += '<div class="as-inline-confirm" role="group" aria-labelledby="' + t.id + '-ce"><span id="' + t.id + '-ce">Replace the answer?</span><button type="button" class="btn btn--sm" data-act="edit-keep">Keep it</button><button type="button" class="btn btn--sm btn--primary" data-act="edit-replace">Replace</button></div>';
      else if (t.state !== 'sending') h += actions(t, isLast || (i === n - 2));
      return h + '</article>';
    }
    if (t.status) h += '<p class="status status--progress as-status" data-status>' + A.spin('sm') + '<span>' + esc(t.status) + '</span></p>';
    h += A.activityHtml(t);
    h += '<div class="as-body"' + lang + '>' + (t.blocks || []).map(A.blockHtml).join('') + '</div>';
    if (t.slow) h += '<p class="status status--progress as-slow">' + A.ic('clock', 'sm') + '<span>Still working. This is taking longer than usual.</span><button type="button" class="btn btn--link" data-act="stop">Stop</button></p>';
    if (t.state === 'stopped') h += '<p class="as-foot-note">Stopped. The partial answer is kept. <button type="button" class="btn btn--link" data-act="retry">Answer again</button></p>';
    h += errorHtml(t);
    if (t.state === 'complete' || t.state === 'stopped') {
      h += A.pointerHtml(t) + A.sourcesHtml(t) + followups(t, lastBot) + actions(t, lastBot);
    }
    return h + '</article>';
  };
  A.midTrunc = function (name) { name = String(name); if (name.length <= 34) return name; return name.slice(0, 20) + '…' + name.slice(-11); };

  /* Re-render one turn in place (keeps focus on an equivalent control where possible). */
  A.renderTurn = function (t) {
    var el = d.getElementById(t.id), turns = A.S.chat.turns, i = turns.indexOf(t); if (!el || i < 0) return;
    var had = el.contains(d.activeElement) ? d.activeElement.getAttribute('data-act') : null;
    var nu = U.h(A.turnHtml(t, i, turns.length)); el.replaceWith(nu); V.initAll(nu);
    if (had) { var f = $('[data-act="' + had + '"]', nu); if (f) f.focus({ preventScroll: true }); }
  };
})(window, document);
