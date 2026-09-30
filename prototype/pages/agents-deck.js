/* Vaani Labs prototype · pages/agents-deck.js — Generate a deck (03-pages/07 §1.10): one Dialog (md) whose body changes
   by step (Describe → Generating → Choose), no stacked modals. Slides 3 to 7 with a visible rule (999 is refused, not
   clamped); closing while generating keeps the job running with a progress toast; "Use in a meeting" opens the Start
   sheet with Present slides → Show my deck and the chosen deck attached. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon;
  var G = A.deck = {}, el, entry, st = { desc: '', slides: 5, step: 1, pick: 0, tried: false }, job = null;
  var OPTS = [{ t: 'New payment plans for channel partners', first: 'New payment plans' }, { t: 'Q3 pricing and partner payouts', first: 'Why the 20:80 plan' }, { t: 'Festive season partner kit', first: 'What changes on 1 October' }];

  function head(title, desc) { return '<div class="dlg-head"><h2 class="dlg-title" id="mt-deck-t">' + title + '</h2>' + (desc ? '<p class="dlg-desc">' + desc + '</p>' : '') + '<button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + icon('x') + '</button></div>'; }
  function step1(err) {
    el.innerHTML = head('Generate a deck', 'Describe the deck and choose from 3 options.') + '<div class="dlg-body">' + (err ? '<div class="ierr" role="alert"><div class="ierr-line">' + icon('circle-alert') + '<span>Couldn’t make the deck. Try again, or shorten the description. <button type="button" class="btn btn--link" data-dk="gen">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>deck_job dk_41f2 · model timeout after 60 s</code></div></details></div>' : '') +
      '<div class="field"><label class="field-label" for="dk-desc">Describe the deck</label><textarea class="textarea" id="dk-desc" rows="4" data-autofocus aria-describedby="dk-desc-e" placeholder="Quarterly pricing update for channel partners, with the new payment plans…">' + esc(st.desc) + '</textarea><p class="field-error" id="dk-desc-e" hidden></p></div>' +
      '<div class="field field--short"><label class="field-label" for="dk-n">Slides</label><div class="input"><input id="dk-n" inputmode="numeric" value="' + esc(st.slides) + '" aria-describedby="dk-n-h dk-n-e"><span class="input-stepper"><button type="button" data-dk="minus" aria-label="Fewer slides" tabindex="-1">' + icon('minus', 'sm') + '</button><button type="button" data-dk="plus" aria-label="More slides" tabindex="-1">' + icon('plus', 'sm') + '</button></span></div><p class="field-hint" id="dk-n-h">3 to 7 slides</p><p class="field-error" id="dk-n-e" hidden></p></div></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-primary data-dk="gen" aria-keyshortcuts="Control+Enter" data-tooltip="Generate" data-kbd="mod+enter">Generate 3 options</button></div>';
    V.initAll(el); el.setAttribute('data-dirty', st.desc ? 'true' : 'false');
  }
  function step2() {
    el.innerHTML = head('Generating 3 options', 'About a minute. You can close this; the deck keeps generating.') + '<div class="dlg-body"><ol class="stages" aria-label="Generating the deck">' +
      '<li class="stage"><span class="smark smark--done" data-mark>' + icon('check') + '</span><span>Planning the slides<span class="stage-meta">' + st.slides + ' slides</span></span></li>' +
      '<li class="stage"><span class="smark smark--progress" data-mark>' + icon('loader-circle', null, { className: 'spinner' }) + '</span><span>Writing</span></li><li class="stage"><span class="smark smark--todo" data-mark="hollow"></span><span>Designing</span></li></ol></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dk="cancel-gen">Cancel generation</button></div>';
    V.initAll(el); el.removeAttribute('data-dirty'); var t = $('.dlg-title', el); t.setAttribute('tabindex', '-1'); t.focus();
  }
  function step3() {
    el.innerHTML = head('Choose a deck', 'Three options from your description.') + '<div class="dlg-body"><fieldset class="fieldset"><legend class="sr-only">Deck options</legend><div class="ag-deck-opts">' + OPTS.map(function (o, i) {
      return '<label class="rcard"><input type="radio" class="radio" name="dk-pick" value="' + i + '"' + (i === st.pick ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">' + esc(o.t) + '</span><span class="rcard-desc">' + st.slides + ' slides · first slide: ' + esc(o.first) + '</span></span><button type="button" class="btn btn--link ag-deck-prev" data-dk="preview" data-i="' + i + '">Preview<span class="sr-only"> ' + esc(o.t) + ' (opens in a new tab)</span></button></label>';
    }).join('') + '</div></fieldset></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dk="restart">Start over</button><span class="l-spacer"></span><button type="button" class="btn" data-dk="download">' + icon('download') + 'Download PPTX</button><button type="button" class="btn btn--primary" data-primary data-dk="use">Use in a meeting</button></div>';
    V.initAll(el); var t = $('.dlg-title', el); t.setAttribute('tabindex', '-1'); t.focus(); V.announce('3 deck options ready');
  }
  function validate() {
    var desc = $('#dk-desc', el).value.trim(), n = $('#dk-n', el).value.trim(), ok = true;
    var de = $('#dk-desc-e', el), ne = $('#dk-n-e', el);
    de.hidden = !!desc; de.innerHTML = desc ? '' : icon('circle-alert', 'sm') + '<span>Describe the deck in a sentence or two.</span>'; $('#dk-desc', el).setAttribute('aria-invalid', desc ? 'false' : 'true');
    var num = /^\d+$/.test(n) ? +n : NaN, good = num >= 3 && num <= 7;
    ne.hidden = good; ne.innerHTML = good ? '' : icon('circle-alert', 'sm') + '<span>Enter a number from 3 to 7.</span>'; $('#dk-n', el).setAttribute('aria-invalid', good ? 'false' : 'true');
    if (!desc) { $('#dk-desc', el).focus(); ok = false; } else if (!good) { $('#dk-n', el).focus(); ok = false; }
    if (ok) { st.desc = desc; st.slides = num; }
    return ok;
  }
  function generate() {
    if (!validate()) return; step2(); A.url.set({ generate: 1 });
    job = { cancelled: false, closed: false, toast: null };
    var j = job;
    setTimeout(function () {
      if (j.cancelled) return;
      if (A.is('deck-fail') && !st.tried) { st.tried = true; if (j.closed) { if (j.toast) j.toast.done('error', 'Couldn’t make the deck. Open Generate a deck to retry.'); return; } step1(true); return; }
      if (j.closed) { if (j.toast) j.toast.dismiss(); V.toast.success('Your deck options are ready', { action: { label: 'Choose a deck', onClick: function () { G.open({ step: 3 }); } } }); st.step = 3; return; }
      st.step = 3; step3();
    }, 2600);
  }
  G.open = function (o) {
    o = o || {}; el = $('#mt-deck'); if (A.offline) { V.toast.info(A.offlineReason); return; }
    if (o.step === 3) step3(); else { st.step = 1; step1(); }
    G.fromStart = !!o.fromStart;
    entry = V.dialog.open(el, { returnTo: o.returnTo || $('#ag-more') || $('#page-title'), onClose: function () { A.url.set({ generate: null }); if (job && !job.cancelled && $('.stages', el)) { job.closed = true; job.toast = V.toast.progress('Generating your deck…', { value: 40 }); } } });
    A.url.set({ generate: 1 });
  };
  d.addEventListener('click', function (e) {
    var t = e.target.closest('#mt-deck [data-dk]'); if (!t) return; var a = t.getAttribute('data-dk');
    if (a === 'gen') generate();
    else if (a === 'minus' || a === 'plus') { var i = $('#dk-n', el), n = parseInt(i.value, 10) || 5; i.value = Math.max(3, Math.min(7, n + (a === 'plus' ? 1 : -1))); st.slides = +i.value; $('#dk-n-e', el).hidden = true; i.setAttribute('aria-invalid', 'false'); }
    else if (a === 'cancel-gen') { if (job) job.cancelled = true; st.step = 1; step1(); $('#dk-desc', el).focus(); V.announce('Generation cancelled'); }
    else if (a === 'restart') { st.step = 1; step1(); $('#dk-desc', el).focus(); }
    else if (a === 'preview') { e.preventDefault(); V.toast.info('The PDF preview opens in a new tab. Not part of this prototype.'); }
    else if (a === 'download') V.toast.success('Downloaded ' + OPTS[st.pick].t.toLowerCase().replace(/[^\w]+/g, '-') + '.pptx');
    else if (a === 'use') {
      var deck = { name: OPTS[st.pick].t + '.pptx', slides: st.slides, size: 1843200 };
      try { var draft = JSON.parse(w.sessionStorage.getItem('vaani:agents:start-draft') || 'null'); if (draft) { draft.mode = 'slides'; draft.slides = 'deck'; draft.deck = deck; draft.deckState = 'ready'; w.sessionStorage.setItem('vaani:agents:start-draft', JSON.stringify(draft)); } } catch (x) { /* ignore */ }
      entry.close('navigate'); setTimeout(function () { A.start.open({ mode: 'slides', deck: deck }); }, 0);
    }
  });
  d.addEventListener('change', function (e) { if (e.target.name === 'dk-pick') st.pick = +e.target.value; });
  d.addEventListener('input', function (e) { if (e.target.id === 'dk-desc') { st.desc = e.target.value; el.setAttribute('data-dirty', e.target.value.trim() ? 'true' : 'false'); } });
  d.addEventListener('keydown', function (e) { if (e.target.id !== 'dk-n') return; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); $('[data-dk="' + (e.key === 'ArrowUp' ? 'plus' : 'minus') + '"]', el).click(); } });
})(window, document, window.Vaani, window.VaaniAgents);
