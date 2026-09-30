/* Vaani Labs prototype · pages/knowledge-proposals.js — Proposals (admins only, 03-pages/05 §1.10): ViewTabs Pending · Added ·
   Dismissed, the table (ListRows on phones) with Review and ⋯ Dismiss, BulkBar "Dismiss n" (no bulk add: a person reads every
   answer first), the Review sheet (Question, Answer, Where it came from, Already in knowledge, Add to), Undo toasts, the next
   pending proposal opening after each decision, the "done" empty state and Forbidden for members (no redirect). */
(function (w, d) {
  'use strict';
  var K = w.VaaniKnowledge, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var P = K.props = {}, list = [], view = 'pending', cur = null, sel = {}, addTo = 'answers';
  var VIEWS = [['pending', 'Pending'], ['added', 'Added'], ['dismissed', 'Dismissed']];

  P.pendingCount = function () { return list.filter(function (p) { return p.status === 'pending'; }).length; };
  function byId(id) { return list.filter(function (p) { return p.id === id; })[0]; }
  function visible() { return list.filter(function (p) { return p.status === view; }); }
  function fromCall(p) { return V.fmt.when(p.at, { time: true }) + ' · ' + V.fmt.duration(p.durationSec); }

  function forbidden() {
    var el = $('#kn-props-col');
    el.innerHTML = '<div class="kn-scroll"><div class="empty empty--page kn-forbidden">' + V.icon('lock', 'lg') + '<h2 class="empty-title">Only organization admins can review proposals.</h2><p>Ask an admin (' + K.data.admins + ' in this workspace) to change your role or review them for you.</p>' +
      '<div class="empty-actions"><button class="btn" type="button" data-p-copy>' + V.icon('link') + 'Copy request link</button><a class="btn btn--tertiary" href="knowledge.html' + (K.role !== 'admin' ? '?role=' + K.role : '') + '" data-p-back>Go back</a></div></div></div>';
    V.initAll(el);
    $('[data-p-copy]', el).addEventListener('click', function () { try { navigator.clipboard.writeText(w.location.href); } catch (e) { /* blocked */ } V.toast.success('Request link copied. Send it to an admin.'); });
    $('[data-p-back]', el).addEventListener('click', function (e) { if (w.history.length > 1 && d.referrer) { e.preventDefault(); w.history.back(); } });
  }
  function rowHtml(p) {
    var pend = p.status === 'pending';
    return '<tr data-id="' + p.id + '" aria-selected="' + !!sel[p.id] + '">' + (pend ? '<td class="c-sel"><input type="checkbox" class="cb" data-select-row aria-label="Select proposal: ' + esc(p.question) + '"' + (sel[p.id] ? ' checked' : '') + '></td>' : '') +
      '<td class="c-key kn-p-q"><a href="?view=proposals&amp;proposal=' + p.id + '" data-p-open="' + p.id + '" lang="' + esc(V.langByCode(p.lang).lang) + '"><span class="cell-t kn-cell-48">' + esc(p.question) + '</span></a></td>' +
      '<td class="kn-p-a"><span class="cell-t kn-cell-a" lang="' + esc(V.langByCode(p.lang).lang) + '">' + esc(p.answer) + '</span></td>' +
      '<td class="kn-p-call"><a href="call-reports.html?call=' + esc(p.callId) + '">' + esc(fromCall(p)) + '</a></td>' +
      '<td class="kn-p-lang">' + V.ui.langMark(p.lang, 'name') + '</td><td class="kn-p-by">' + esc(p.by) + '</td>' +
      '<td class="c-act">' + (pend ? '<span class="kn-p-acts"><button class="btn btn--sm" type="button" data-p-open="' + p.id + '">Review</button><button class="ibtn ibtn--sm" type="button" data-p-menu="' + p.id + '" aria-label="More actions for proposal: ' + esc(p.question) + '" aria-haspopup="menu" aria-expanded="false">' + V.icon('ellipsis', 'sm') + '</button></span>' : V.ui.statusTag('proposal', p.status)) + '</td></tr>';
  }
  function liHtml(p) {
    return '<li><a class="li" href="?view=proposals&amp;proposal=' + p.id + '" data-p-open="' + p.id + '"><span class="li-title" lang="' + esc(V.langByCode(p.lang).lang) + '">' + esc(p.question) + '</span>' + V.ui.langMark(p.lang, 'name') + '<span class="li-meta">' + esc(fromCall(p) + ' · ' + p.by) + '</span></a></li>';
  }
  P.render = function (isForbidden) {
    if (isForbidden) { forbidden(); return; }
    var el = $('#kn-props-col'), items = visible(), pend = view === 'pending';
    var empty = view === 'pending' ? '<div class="empty kn-empty">' + V.icon('check', 'lg') + '<h2 class="empty-title">No proposals waiting.</h2><p>Answers suggested from calls appear here for you to review.</p></div>' : '<p class="empty empty--compact">Nothing ' + view + ' in the last 30 days.</p>';
    el.innerHTML = '<div class="vtabs"><div class="vtabs-list" role="tablist" aria-label="Proposal views" data-activation="manual">' + VIEWS.map(function (v) {
      var n = list.filter(function (p) { return p.status === v[0]; }).length;
      return '<button class="vtab" role="tab" type="button" id="kn-pv-' + v[0] + '" aria-controls="kn-pv-panel" data-v="' + v[0] + '" aria-selected="' + (view === v[0]) + '">' + v[1] + (v[0] === 'pending' ? ' <span class="vtab-count">' + n + '</span>' : '') + '</button>';
    }).join('') + '</div></div>' +
      '<div class="kn-scroll" id="kn-pv-panel" role="tabpanel" aria-labelledby="kn-pv-' + view + '">' +
      (items.length ? '<div class="dt-wrap kn-props-wrap"><table class="dt" id="kn-props-table" aria-label="' + esc(VIEWS.filter(function (v) { return v[0] === view; })[0][1]) + ' proposals, newest first"><thead><tr>' + (pend ? '<th class="c-sel"><input type="checkbox" class="cb" data-select-all aria-label="Select all pending proposals"></th>' : '') +
        '<th scope="col">Question</th><th scope="col">Proposed answer</th><th scope="col" class="kn-p-call">From call</th><th scope="col" class="kn-p-lang">Language</th><th scope="col" class="kn-p-by">Suggested by</th><th scope="col" class="c-act">' + (pend ? '<span class="sr-only">Actions</span>' : 'Status') + '</th></tr></thead><tbody>' + items.map(rowHtml).join('') + '</tbody></table></div>' +
        '<ul class="kn-rows" aria-label="Proposals">' + items.map(liHtml).join('') + '</ul>' : '<div class="kn-p-empty">' + empty + '</div>') +
      '</div><div class="bulk" role="toolbar" aria-label="Selected proposals" id="kn-p-bulk" hidden></div><div class="pager"><span role="status">' + (items.length ? '1–' + items.length + ' of ' + items.length : '0') + ' proposals</span></div>';
    V.initAll(el);
    var t = $('#kn-props-table'); if (t) { $$('tbody tr', t).forEach(function (r, i) { r.setAttribute('tabindex', i ? '-1' : '0'); }); K.rove(t); t.addEventListener('vaani:selection', function (e) { sel = {}; e.detail.rows.forEach(function (r) { sel[r.getAttribute('data-id')] = true; }); bulk(e.detail.count); }); }
    $('[role="tablist"]', el).addEventListener('vaani:tabchange', function (e) { view = e.detail.tab.getAttribute('data-v'); sel = {}; K.url.set({ pview: view === 'pending' ? null : view }); P.render(); var nt = $('#kn-pv-' + view); if (nt) nt.focus(); });
    K.renderMeta(); $('#kn-prop-count').textContent = P.pendingCount();
  };
  function bulk(n) {
    var b = $('#kn-p-bulk'); if (!n) { b.hidden = true; return; }
    b.innerHTML = '<span class="bulk-count">' + n + ' selected</span><button class="btn btn--sm btn--tertiary" type="button" data-p-bulk-dismiss>Dismiss ' + n + '</button><button class="ibtn ibtn--sm" type="button" data-p-bulk-clear aria-label="Clear selection">' + V.icon('x', 'sm') + '</button>';
    b.hidden = false;
  }

  /* ---------- Review sheet ---------- */
  function textSources() { return K.sources.filter(function (s) { return (s.kind === 'text' || s.kind === 'answers') && s.id !== 'kb_answers'; }); }
  function sheetHtml(p) {
    var covered = K.test ? K.test.search(p.question, 'all').above.slice(0, 2) : [], strong = covered.filter(function (r) { return r.score >= 0.82; })[0];
    var opts = [['answers', 'Answers from calls' + (K.byId('kb_answers') ? '' : ' (created when you add)')]].concat(textSources().map(function (s) { return [s.id, s.title]; }));
    var cur2 = opts.filter(function (o) { return o[0] === addTo; })[0] || opts[0];
    return '<div class="sheet-head"><button class="btn btn--tertiary sheet-back" type="button" data-drawer-close>' + V.icon('chevron-left') + 'Proposals</button><div class="sheet-heading"><h2 class="sheet-title" id="kn-prop-t">Proposal</h2><p class="sheet-meta">From a call ' + esc(V.fmt.when(p.at, { time: true }).replace(/^Today/, 'today at').replace(/^Yesterday/, 'yesterday at')) + ' · suggested by ' + esc(p.by) + '</p></div>' +
      '<div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close proposal">' + V.icon('x') + '</button></div></div>' +
      '<div class="sheet-body"><div class="field"><label class="field-label" for="kn-pq">Question</label><div class="input"><input id="kn-pq" value="' + esc(p.question) + '" lang="' + esc(V.langByCode(p.lang).lang) + '"></div></div>' +
      '<div class="field"><label class="field-label" for="kn-pa">Answer</label><textarea class="textarea" id="kn-pa" rows="4" aria-describedby="kn-pa-h" lang="' + esc(V.langByCode(p.lang).lang) + '">' + esc(p.answer) + '</textarea><p class="field-hint" id="kn-pa-h">Your agent may read this out on calls. Keep it short and factual.</p></div>' +
      '<section aria-labelledby="kn-pw-t" class="l-stack l-stack--sm"><h3 class="type-title-14" id="kn-pw-t">Where it came from</h3>' + (p.turns && p.turns.length ? '<div class="tr"><div class="tr-body"><ol>' + p.turns.map(function (t) { return V.ui.turn(t, { review: true }); }).join('') + '</ol></div></div>' : '<p class="empty empty--compact">The transcript for this call is no longer kept.</p>') + '</section>' +
      '<section aria-labelledby="kn-pk-t" class="l-stack l-stack--sm"><h3 class="type-title-14" id="kn-pk-t">Already in knowledge</h3>' +
      (strong ? '<p class="status status--md status--warning kn-st">' + V.icon('triangle-alert', 'md') + '<span>Probably covered by ‘' + esc(strong.s.title) + '’ · Strong match</span></p>' : '<p class="status status--md kn-st">' + V.icon('circle-slash', 'md') + '<span>' + (covered.length ? 'Only partly covered. Adding it fills a gap.' : 'Not in knowledge yet. Adding it fills a gap.') + '</span></p>') +
      (covered.length ? '<ol class="kn-rr-list" aria-label="Closest passages">' + covered.map(function (r, i) { return '<li class="kn-rr"><span class="kn-rr-rank" aria-hidden="true">' + (i + 1) + '</span><div class="kn-rr-main"><p class="kn-rr-l1"><span class="kn-rr-src" translate="no">' + esc(r.s.title) + '</span><span class="kn-rr-loc">' + esc(r.p.loc) + '</span></p><p class="type-read-15 kn-rr-text kn-clamp4" lang="' + esc(r.p.lang) + '">' + esc(r.p.text) + '</p></div></li>'; }).join('') + '</ol>' : '') + '</section>' +
      '<div class="field field--medium"><span class="field-label" id="kn-pto-l">Add to</span><button type="button" class="select" data-select aria-controls="kn-pto-lb" aria-labelledby="kn-pto-l kn-pto-v"><span class="select-value" id="kn-pto-v">' + esc(cur2[1]) + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="kn-pto-lb" role="listbox" aria-labelledby="kn-pto-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === cur2[0]) + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span></div>'; }).join('') + '</div></div></div>' +
      '<div class="sheet-foot sheet-foot--end"><button class="btn btn--tertiary" type="button" data-p-dismiss>Dismiss</button><button class="btn btn--primary" type="button" data-p-add data-tooltip="Add to knowledge" data-kbd="mod+enter" aria-keyshortcuts="Control+Enter">Add to knowledge</button></div>';
  }
  P.open = function (id, returnTo) {
    var p = byId(id), el = $('#kn-prop-sheet'); if (!p || !el) return; cur = id;
    el.innerHTML = sheetHtml(p); V.initAll(el);
    $('#kn-pto-v').parentNode.addEventListener('vaani:change', function (e) { addTo = e.detail.value; });
    if (!V.drawer.isOpen(el)) V.drawer.open(el, { returnTo: returnTo || d.activeElement, onClose: function () { cur = null; K.url.set({ proposal: null }); } });
    else { var h = $('#kn-prop-t'); h.setAttribute('tabindex', '-1'); h.focus(); }
    K.url.set({ proposal: id }); $$('#kn-props-table tbody tr').forEach(function (r) { if (r.getAttribute('data-id') === id) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); });
  };
  function nextPending() { return list.filter(function (p) { return p.status === 'pending'; })[0]; }
  function decide(kind) {
    var p = byId(cur); if (!p) return; var prevStatus = p.status, snapshotAnswer = p.answer;
    if (kind === 'add') {
      p.question = $('#kn-pq').value.trim() || p.question; p.answer = $('#kn-pa').value.trim() || p.answer;
      var target = addTo === 'answers' ? ensureAnswers() : K.byId(addTo); if (target) { target.passages = (target.passages || 0) + 1; target.updatedAt = V.fmt.now().toISOString(); }
      p.status = 'added';
      var left = P.pendingCount();
      V.toast.undo('Added to ‘' + (target ? target.title : 'Answers from calls') + '’.', { action: { label: 'Undo', onClick: function () { p.status = prevStatus; p.answer = snapshotAnswer; if (target) target.passages -= 1; P.render(); } } });
      V.announce('Added. ' + left + (left === 1 ? ' proposal left.' : ' proposals left.'));
    } else {
      p.status = 'dismissed';
      V.toast.undo('Dismissed ‘' + p.question + '’.', { action: { label: 'Undo', onClick: function () { p.status = prevStatus; P.render(); } } });
    }
    var n = nextPending(); P.render();
    if (n) P.open(n.id); else { V.drawer.close('kn-prop-sheet', 'done'); var h = $('#page-title'); if (h) h.focus(); }
  }
  function ensureAnswers() {
    var s = K.byId('kb_answers');
    if (!s) { s = { id: 'kb_answers', title: 'Answers from calls', kind: 'answers', format: 'Text', chars: 0, status: 'indexed', passages: 0, updatedAt: V.fmt.now().toISOString(), addedAt: V.fmt.now().toISOString(), by: V.data.user.short, direct: [], languages: ['en', 'hi-Latn'] }; K.sources.unshift(s); }
    return s;
  }

  P.init = function () {
    list = K.state === 'no-proposals' ? [] : K.data.proposals.map(function (p) { var c = {}; for (var k in p) c[k] = p[k]; return c; });
    view = ['added', 'dismissed'].indexOf(K.url.get('pview')) >= 0 ? K.url.get('pview') : 'pending';
    function onClick(e) {
      var o = e.target.closest('[data-p-open]'); if (o) { e.preventDefault(); P.open(o.getAttribute('data-p-open'), o.closest('tr') || o); return; }
      var m = e.target.closest('[data-p-menu]'); if (m) { var id = m.getAttribute('data-p-menu'); var menu = $('#kn-row-menu'); menu.innerHTML = '<button class="menu-item" role="menuitem" type="button" data-value="p-dismiss">' + V.icon('x') + '<span class="menu-text"><span>Dismiss</span></span></button>'; P.menuFor = id; V.menu.open(m, 'kn-row-menu'); return; }
      if (e.target.closest('[data-p-dismiss]')) { decide('dismiss'); return; }
      if (e.target.closest('[data-p-add]')) { decide('add'); return; }
      if (e.target.closest('[data-p-bulk-dismiss]')) { var ids = Object.keys(sel); ids.forEach(function (i) { var p = byId(i); if (p) p.status = 'dismissed'; }); sel = {}; V.toast.undo('Dismissed ' + ids.length + (ids.length === 1 ? ' proposal.' : ' proposals.'), { action: { label: 'Undo', onClick: function () { ids.forEach(function (i) { var p = byId(i); if (p) p.status = 'pending'; }); P.render(); } } }); P.render(); var t = $('#kn-pv-pending'); if (t) t.focus(); return; }
      if (e.target.closest('[data-p-bulk-clear]')) { sel = {}; P.render(); return; }
      var seek = e.target.closest('[data-seek]'); if (seek && cur) { var p2 = byId(cur); w.location.href = 'call-reports.html?call=' + encodeURIComponent(p2.callId) + '&t=' + V.fmt.timecode(+seek.getAttribute('data-seek') / 1000); }
    }
    /* the sheet moves into the portal when modal, so it carries its own listener */
    $('#kn-props-col').addEventListener('click', onClick); $('#kn-prop-sheet').addEventListener('click', onClick);
    $('#kn-row-menu').addEventListener('vaani:menuselect', function (e) { if (e.detail.value === 'p-dismiss' && P.menuFor) { var p = byId(P.menuFor); if (p) { var prev = p.status; p.status = 'dismissed'; V.toast.undo('Dismissed ‘' + p.question + '’.', { action: { label: 'Undo', onClick: function () { p.status = prev; P.render(); } } }); } P.menuFor = null; setTimeout(function () { P.render(); var t = $('#kn-pv-pending'); if (t) t.focus(); }, 0); } });
    V.shortcuts.register('mod+enter', function () { decide('add'); }, { description: 'Add to knowledge', group: 'Records and sheets', inFields: true, when: function () { var s = $('#kn-prop-sheet'); return s && V.drawer.isOpen(s) && cur && s.contains(d.activeElement); } });
    if (K.url.get('view') === 'proposals' && K.role === 'admin' && K.url.get('proposal')) setTimeout(function () { P.open(K.url.get('proposal')); }, 80);
  };
})(window, document);
