/* Vaani Labs prototype · pages/knowledge-test.js — "Test a question" (03-pages/05 §1.9, §1.12 own states): Scope combobox
   (All sources or one source), Question field + Search, the verdict in the Flow Designer’s words, RetrievalResult rows with a
   4-step Meter, the below-threshold Collapsible, the indexing caveat, Unanswered on calls, and the InlineError under the field.
   The search is a local stand-in for the live lookup (keyword match against knowledge-data.js passages, threshold 0.70). */
(function (w, d) {
  'use strict';
  var K = w.VaaniKnowledge, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$, store = U.store;
  var T = K.test = {}, scope = 'all', failNext = K.state === 'test-error', busy = false, lastQ = '';
  var TH = K.data.threshold;

  function strength(sc) { return sc >= 0.82 ? ['strong', 4, 'Strong match'] : sc >= 0.76 ? ['good', 3, 'Good match'] : sc >= TH ? ['weak', 2, 'Weak match'] : ['below', 1, 'Below threshold']; }
  function tokens(q) {
    return q.toLowerCase().replace(/[?.,!।]/g, ' ').split(/\s+/).filter(Boolean).map(function (t) { var m = K.data.synonyms[t]; return m === undefined ? t : m; }).filter(Boolean);
  }
  T.search = function (q, sc) {
    var tk = tokens(q), seen = {}; tk = tk.filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; });
    var out = [];
    K.data.passages.forEach(function (p) {
      var s = K.byId(p.src); if (!s || s.status !== 'indexed') return; if (sc !== 'all' && sc !== p.src) return;
      var m = tk.filter(function (t) { return p.keys.indexOf(t) >= 0; }).length; if (!m) return;
      var score = m >= 2 ? Math.min(0.93, p.base + 0.03 * (m - 2)) : p.base - 0.08;
      out.push({ p: p, s: s, score: Math.round(score * 100) / 100 });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return { above: out.filter(function (r) { return r.score >= TH; }).slice(0, 5), below: out.filter(function (r) { return r.score < TH; }).slice(0, 3) };
  };

  function meter(sc) {
    var st = strength(sc), i, html = '<span class="kn-meter" role="img" aria-label="' + st[2] + ', score ' + sc.toFixed(2) + '" data-tooltip="Score ' + sc.toFixed(2) + ' · calls use ' + TH.toFixed(2) + ' and above">';
    for (i = 0; i < 4; i++) html += i < st[1] ? '<i class="kn-meter-on" data-mark></i>' : '<i></i>';
    return html + '</span>';
  }
  function rrHtml(r, rank, below) {
    var st = strength(r.score), long = r.p.text.length > 150;
    return '<li class="kn-rr' + (below ? ' kn-rr--below' : '') + '"><span class="kn-rr-rank" aria-hidden="true">' + rank + '</span><div class="kn-rr-main">' +
      '<p class="kn-rr-l1"><a href="?source=' + esc(r.s.id) + '" class="kn-rr-src" data-kn-open="' + esc(r.s.id) + '" translate="no">' + esc(r.s.title) + '</a><span class="kn-rr-loc">' + esc(r.p.loc) + '</span>' + meter(r.score) + '<span class="kn-rr-word" aria-hidden="true">' + st[2] + '</span></p>' +
      '<p class="type-read-15 kn-rr-text' + (long ? ' kn-clamp4' : '') + '" lang="' + esc(r.p.lang) + '">' + esc(r.p.text) + '</p>' + (long ? '<button class="btn btn--link kn-rr-more" type="button" data-kn-rr-more aria-expanded="false">Show all</button>' : '') + '</div></li>';
  }
  function skeleton() { var h = ''; for (var i = 0; i < 3; i++) h += '<li class="kn-rr" aria-hidden="true"><span class="kn-rr-rank"></span><div class="kn-rr-main"><span class="sk-line"><span class="sk kn-sk-w1"></span></span><span class="sk-line"><span class="sk kn-sk-w0"></span></span><span class="sk-line"><span class="sk kn-sk-w2"></span></span></div></li>'; return '<ol class="kn-rr-list" aria-hidden="true">' + h + '</ol>'; }
  /* Same counting rule as the header meta (K.pendingCounts): "indexing" and "queued" are named separately */
  function caveat() {
    var c = K.pendingCounts(K.sources.filter(function (s) { return scope === 'all' || s.id === scope; }));
    if (!c.total) return '';
    var subj = function (n) { return n === 1 ? '1 source is' : n + ' sources are'; }, t;
    if (c.indexing && c.queued) t = subj(c.indexing) + ' still indexing and ' + c.queued + (c.queued === 1 ? ' is' : ' are') + ' queued.';
    else if (c.indexing) t = subj(c.indexing) + ' still indexing.';
    else t = subj(c.queued) + ' queued for indexing.';
    return '<p class="status status--md kn-caveat">' + V.icon('info', 'md') + '<span>' + t + ' Results can change when ' + (c.total === 1 ? 'it finishes' : 'they finish') + '.</span></p>';
  }
  function scopeName() { if (scope === 'all') return 'All sources'; var s = K.byId(scope); return s ? s.title : 'All sources'; }

  function renderBody() {
    var body = $('#kn-test-body'), off = K.offline;
    var opts = '<div class="option" role="option" data-value="all" aria-selected="' + (scope === 'all') + '"><span class="option-main"><span class="option-label">All sources</span></span></div>' +
      K.sources.map(function (s) { return '<div class="option" role="option" data-value="' + esc(s.id) + '" aria-selected="' + (scope === s.id) + '"><span class="option-main"><span class="option-label" translate="no">' + esc(s.title) + '</span><span class="option-desc">' + esc(K.sentence(s).text) + '</span></span></div>'; }).join('');
    if (!K.sources.length) { body.innerHTML = '<p class="empty empty--compact">Add a source first. Test a question searches your indexed sources the way a live call does.</p>'; return; }
    body.innerHTML =
      '<form class="kn-test-form" id="kn-test-form" role="search" aria-label="Test a question" novalidate>' +
      '<div class="field"><label class="field-label" id="kn-scope-l" for="kn-scope">Search in</label><div class="input" data-combobox id="kn-scope-box"><input id="kn-scope" role="combobox" aria-controls="kn-scope-lb" value="' + esc(scopeName()) + '" spellcheck="false"><button type="button" class="input-btn" tabindex="-1" aria-label="Show sources">' + V.icon('chevron-down', 'sm') + '</button></div>' +
      '<div class="listbox listbox--wide" id="kn-scope-lb" role="listbox" aria-labelledby="kn-scope-l" hidden>' + opts + '</div></div>' +
      '<div class="field"><label class="field-label" for="kn-q">Question</label><div class="kn-q-row"><div class="input"><input id="kn-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="Ask the way a caller would…" aria-describedby="kn-q-hint" value="' + esc(lastQ) + '"></div>' +
      '<button class="btn" type="submit" id="kn-q-go"' + (off ? ' aria-disabled="true" data-tooltip="' + K.offlineReason + '"' : '') + '>Search</button></div>' +
      '<p class="field-hint" id="kn-q-hint">Hindi, English or Hinglish. Uses the same search as live calls.</p><div id="kn-q-err"></div></div></form>' +
      '<div id="kn-recent"></div><div class="kn-verdict" id="kn-verdict" role="status" aria-live="polite"></div><div id="kn-results" aria-busy="false"></div>' + unanswered();
    V.initAll(body);
    $('#kn-scope-box').addEventListener('vaani:change', function (e) { T.setScope(e.detail.value, true); });
    renderRecent();
  }
  function unanswered() {
    return '<section class="kn-unans" aria-labelledby="kn-unans-t"><h3 class="type-title-14" id="kn-unans-t">Unanswered on calls · last 7 days</h3><ul class="kn-unans-list">' + K.data.unanswered.map(function (u, i) {
      return '<li class="kn-unans-row"><span class="kn-unans-q" lang="' + esc(V.langByCode(u.lang).lang) + '">' + esc(u.q) + '</span><span class="kn-unans-meta">' + V.ui.langMark(u.lang, 'name') + '<span>asked ' + u.times + ' times</span></span>' +
        '<span class="kn-unans-acts"><button class="btn btn--link" type="button" data-kn-try="' + i + '" aria-label="Try it: ' + esc(u.q) + '">Try it</button><button class="btn btn--link" type="button" data-kn-answer="' + i + '" aria-label="Add an answer for ' + esc(u.q) + '">Add an answer…</button></span></li>';
    }).join('') + '</ul><a class="kn-unans-link" href="call-reports.html?when=7d&amp;f.knowledge=not_found">See these calls in Call reports</a></section>';
  }
  function recentList() { try { return JSON.parse(store.get('vaani:knowledge:recent') || '[]'); } catch (e) { return []; } }
  function renderRecent() {
    var box = $('#kn-recent'); if (!box) return; if (lastQ) { box.innerHTML = ''; return; }
    var r = recentList(), list = r.length ? r : K.data.suggested;
    box.innerHTML = '<div class="kn-recent"><p class="type-label-12 u-fg-3">' + (r.length ? 'Recent questions' : 'Try a question') + '</p><ul class="kn-recent-list">' + list.slice(0, 4).map(function (q) { return '<li><button class="btn btn--sm btn--tertiary kn-recent-q" type="button" data-kn-q="' + esc(q) + '">' + esc(q) + '</button></li>'; }).join('') + '</ul></div>';
  }

  T.setScope = function (id, fromCombo) {
    scope = id && (id === 'all' || K.byId(id)) ? id : 'all';
    K.url.set({ scope: scope === 'all' ? null : scope });
    if (!fromCombo) { var inp = $('#kn-scope'); if (inp) inp.value = scopeName(); $$('#kn-scope-lb [role="option"]').forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-value') === scope ? 'true' : 'false'); }); }
    if (lastQ && fromCombo) T.run(lastQ);
  };

  T.run = function (q) {
    q = (q || '').trim(); var err = $('#kn-q-err'), go = $('#kn-q-go'), res = $('#kn-results'), ver = $('#kn-verdict'), inp = $('#kn-q');
    if (!inp) return;
    if (K.offline) { V.announce(K.offlineReason); return; }
    if (!q) { err.innerHTML = '<p class="field-error" id="kn-q-e">' + V.icon('circle-alert', 'sm') + 'Enter a question, like the way a caller would ask it.</p>'; inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', 'kn-q-hint kn-q-e'); inp.focus(); return; }
    if (busy) return; busy = true; lastQ = q; inp.value = q; inp.removeAttribute('aria-invalid'); inp.setAttribute('aria-describedby', 'kn-q-hint'); err.innerHTML = '';
    K.url.set({ test: q, scope: scope === 'all' ? null : scope });
    var r = recentList().filter(function (x) { return x !== q; }); r.unshift(q); store.set('vaani:knowledge:recent', JSON.stringify(r.slice(0, 5))); renderRecent();
    go.setAttribute('aria-busy', 'true'); go.innerHTML = V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Searching…';
    res.setAttribute('aria-busy', 'true'); ver.innerHTML = '';
    var skT = setTimeout(function () { res.innerHTML = skeleton(); }, 200);
    setTimeout(function () {
      clearTimeout(skT); busy = false; go.removeAttribute('aria-busy'); go.textContent = 'Search'; res.setAttribute('aria-busy', 'false');
      if (failNext) {
        failNext = false; res.innerHTML = '';
        err.innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t search. Check your connection and try again. <button class="btn btn--link" type="button" data-kn-retry-test>Retry</button></span></div></div>';
        return;
      }
      render(T.search(q, scope), q);
    }, 700);
  };
  function render(r, q) {
    var ver = $('#kn-verdict'), res = $('#kn-results'), strong = r.above.filter(function (x) { return x.score >= 0.76; }).length, v;
    if (r.above.length && strong) v = ['success', 'check', 'Would answer from ' + r.above.length + (r.above.length === 1 ? ' passage' : ' passages')];
    else if (r.above.length) v = ['warning', 'triangle-alert', 'Only weak matches. The agent may say it doesn’t know.'];
    else v = ['', 'circle-slash', 'Nothing matched well enough. A Knowledge lookup step would take its Not found path.'];
    var searched = K.sources.filter(function (s) { return s.status === 'indexed' && (scope === 'all' || s.id === scope); }).length;
    var meta = 'Searched ' + searched + (searched === 1 ? ' source' : ' sources') + ' · calls use matches of ' + TH.toFixed(2) + ' and above';
    /* The verdict is a polite live region announced once per search (§1.15): each part ends as a sentence and parts are
       separated by a space, so it reads "Would answer from 3 passages. Searched 11 sources · …", never "passagesSearched".
       The full stops the visible copy leaves out are visually hidden. */
    var stop = function (t) { return /[.?!…]$/.test(t) ? '' : '<span class="sr-only">.</span>'; };
    ver.innerHTML = '<p class="status status--md' + (v[0] ? ' status--' + v[0] : '') + '">' + V.icon(v[1], 'md') + '<span>' + esc(v[2]) + stop(v[2]) + '</span></p> <p class="type-meta-12 u-fg-3">' + esc(meta) + stop(meta) + '</p>' +
      (!r.above.length ? ' <p><button class="btn btn--sm" type="button" data-kn-add-answer>' + V.icon('plus', 'sm') + 'Add an answer…</button></p>' : '');
    var html = caveat();
    if (r.above.length) html += '<ol class="kn-rr-list" aria-label="Matching passages">' + r.above.map(function (x, i) { return rrHtml(x, i + 1, false); }).join('') + '</ol>';
    if (r.below.length) html += '<div class="kn-below"><button class="kn-below-toggle" type="button" aria-expanded="false" aria-controls="kn-below-list">' + V.icon('chevron-right', 'sm', { className: 'kn-below-ch' }) + r.below.length + ' more below the match threshold (not used on calls)</button>' +
      '<ol class="kn-rr-list" id="kn-below-list" aria-label="Passages below the match threshold" hidden>' + r.below.map(function (x, i) { return rrHtml(x, r.above.length + i + 1, true); }).join('') + '</ol></div>';
    res.innerHTML = html;
    if (w.VaaniIcon) w.VaaniIcon.hydrate(res);
  }

  T.init = function () {
    lastQ = K.url.get('test') || ''; var sc = K.url.get('scope'); if (sc && K.byId(sc)) scope = sc;
    renderBody();
    var body = $('#kn-test-body');
    body.addEventListener('submit', function (e) { e.preventDefault(); var go = $('#kn-q-go'); if (go.getAttribute('aria-disabled') === 'true') { V.announce(go.getAttribute('data-tooltip')); return; } T.run($('#kn-q').value); });
    body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-kn-try]'); if (t) { T.run(K.data.unanswered[+t.getAttribute('data-kn-try')].q); $('#kn-q').focus(); return; }
      var a = e.target.closest('[data-kn-answer]'); if (a) { K.add.open('text', { entry: 'test_answer', title: K.data.unanswered[+a.getAttribute('data-kn-answer')].q, returnTo: a }); return; }
      if (e.target.closest('[data-kn-add-answer]')) { K.add.open('text', { entry: 'test_answer', title: lastQ, returnTo: e.target.closest('[data-kn-add-answer]') }); return; }
      if (e.target.closest('[data-kn-retry-test]')) { T.run(lastQ); return; }
      var rq = e.target.closest('[data-kn-q]'); if (rq) { T.run(rq.getAttribute('data-kn-q')); $('#kn-q').focus(); return; }
      var more = e.target.closest('[data-kn-rr-more]'); if (more) { var p = more.previousElementSibling, open = p.classList.toggle('kn-clamp4'); more.textContent = open ? 'Show all' : 'Show less'; more.setAttribute('aria-expanded', open ? 'false' : 'true'); return; }
      var tg = e.target.closest('.kn-below-toggle'); if (tg) { var on = tg.getAttribute('aria-expanded') !== 'true'; tg.setAttribute('aria-expanded', on); $('#kn-below-list').hidden = !on; }
    });
    body.addEventListener('input', function (e) { if (e.target.id === 'kn-q' && !e.target.value) { lastQ = ''; renderRecent(); } });
    if (lastQ && !K.offline && K.sources.length) setTimeout(function () { T.run(lastQ); }, 80);
  };
})(window, document);
