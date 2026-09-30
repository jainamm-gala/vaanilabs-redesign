/* Vaani Labs prototype · Cockpit · session-only pickers (D6): FlowSwitcher purpose="call" (core §5.4), VoicePicker compact
   (data-nav §12.3) and Language (Select). Picks live in the URL (replaceState) and never write a default; "Make default"
   is its own link with an Undo toast (F-UX-014). Phones get "Voice and language" as a bottom sheet (CK §2.4). */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  var P = CK.pickers = {};
  var V, esc, st;
  function init() { V = CK.V; esc = CK.esc; st = CK.st; }

  function flowTag(f) { return f.draft ? '<span class="tag">' + esc('Draft v' + f.version) + '</span>' : V.ui.statusTag('flow', 'live', { v: f.version }); }
  function testedLine(f) {
    if (f.draft) return 'Draft v' + f.version + ' · test calls only';
    return f.tested ? 'Tested ' + V.fmt.when(f.tested.at, { time: true }).replace(/^Today/, 'today') : 'Not tested since publish';
  }

  /* ---------- the fields (re-rendered on every sync; small) ---------- */
  P.sync = function () {
    init();
    var box = d.getElementById('ck-flow-field'); if (!box) return;
    var f = CK.flow();
    if (CK.has('no-flows')) box.innerHTML = '<div class="field"><span class="field-label">Flow</span><div class="empty empty--compact ck-empty-flow">' + V.icon('workflow') + '<span>No flows yet. Create one to test it here. <a href="flow-designer.html?new=1">New flow</a></span></div></div>';
    else if (CK.has('flows-failed')) box.innerHTML = '<div class="field"><span class="field-label">Flow</span><div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t load flows. <button type="button" class="btn btn--link" data-ck-act="retry-flows">Retry</button></span></div></div></div>';
    else {
      var def = f.id === st.defaults.flowId && !f.draft;
      box.innerHTML = '<div class="field"><span class="field-label" id="ck-flow-l">Flow</span>' +
        '<button type="button" class="select ck-flow-btn" id="ck-flow" aria-haspopup="dialog" aria-expanded="false" aria-labelledby="ck-flow-l ck-flow-v ck-flow-t"><span class="select-value" id="ck-flow-v" translate="no" data-tooltip-overflow>' + esc(f.name) + '</span><span id="ck-flow-t" class="ck-flow-tag">' + flowTag(f) + '</span>' + V.icon('chevrons-up-down') + '</button>' +
        '<p class="field-hint ck-flow-hint">' + esc(testedLine(f)) + ' · <a href="flow-designer.html?flow=' + esc(f.id) + '" target="_blank" rel="noopener">Open in flow' + CK.srOpenNew + '</a>' +
        (def ? '' : ' · <button type="button" class="btn btn--link" data-ck-act="default-flow">Make default</button>') + '</p></div>';
      d.getElementById('ck-flow').addEventListener('click', openFlows);
    }
    var home = d.getElementById('ck-vl-home');
    if (home && !home.firstChild) { home.innerHTML = vlHtml(); V.initAll(home); wireVl(home); }
    else if (home) updateVl(home);
    var sum = d.getElementById('ck-vl-sum'); if (sum) sum.textContent = CK.voiceById(st.voiceId).name + ' · ' + (st.lang === 'auto' ? 'Auto' : CK.langLabel(st.lang));
  };
  function vlHtml() {
    var v = CK.voiceById(st.voiceId), langOpts = CK.LANGS.map(function (L) { return '<div class="option" role="option" data-value="' + L.value + '" aria-selected="' + (L.value === st.lang) + '"><span class="lm-g" lang="' + L.lang + '" aria-hidden="true">' + L.glyph + '</span><span class="option-main"><span class="option-label">' + esc(L.label) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('');
    return '<div class="ck-pair">' +
      '<div class="field"><span class="field-label" id="ck-voice-l">Voice</span>' +
        '<div class="voice-compact ck-voice-row">' + V.ui.avatar(v.name, { kind: 'voice', tile: v.tile }) + '<span id="ck-voice-v" translate="no">' + esc(CK.voiceLine(v)) + '</span>' +
          '<span class="lvl ck-lvl" id="ck-voice-lvl" aria-hidden="true" hidden><i></i><i></i><i></i><i></i></span>' +
          '<button type="button" class="ibtn ibtn--sm" id="ck-voice-play" aria-pressed="false" aria-label="Hear ' + esc(v.name) + '">' + V.icon('play', 'sm') + '</button>' +
          '<button type="button" class="ibtn ibtn--sm" id="ck-voice-open" aria-haspopup="dialog" aria-expanded="false" aria-label="Change voice" data-tooltip="Change voice">' + V.icon('chevron-down', 'sm') + '</button></div>' +
        '<p class="field-hint" id="ck-voice-hint">' + voiceHint() + '</p></div>' +
      '<div class="field"><span class="field-label" id="ck-lang-l">Language</span>' +
        '<button type="button" class="select" data-select aria-controls="ck-lang-lb" aria-labelledby="ck-lang-l ck-lang-v" id="ck-lang"><span class="select-value" id="ck-lang-v">' + esc(CK.langLabel(st.lang)) + '</span>' + V.icon('chevron-down') + '</button>' +
        '<div class="listbox" id="ck-lang-lb" role="listbox" aria-labelledby="ck-lang-l" hidden>' + langOpts + '</div>' +
        '<p class="field-hint">Auto follows the caller.</p></div></div>';
  }
  function voiceHint() { return 'For this call only' + (st.voiceId !== st.defaults.voiceId ? ' · <button type="button" class="btn btn--link" data-ck-act="default-voice">Make default</button>' : ''); }
  /* Update in place, so a trigger that just closed its listbox keeps focus. */
  function updateVl(root) {
    var v = CK.voiceById(st.voiceId), av = root.querySelector('.ck-voice-row .av');
    if (av) av.outerHTML = V.ui.avatar(v.name, { kind: 'voice', tile: v.tile });
    root.querySelector('#ck-voice-v').textContent = CK.voiceLine(v);
    var pb = root.querySelector('#ck-voice-play'); if (pb && pb.getAttribute('aria-pressed') !== 'true') pb.setAttribute('aria-label', 'Hear ' + v.name);
    var hint = root.querySelector('#ck-voice-hint'); if (hint.innerHTML !== voiceHint()) hint.innerHTML = voiceHint();
    var lv = d.getElementById('ck-lang-v'); if (lv) lv.textContent = CK.langLabel(st.lang);
    CK.$$('#ck-lang-lb [role="option"]').forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-value') === st.lang ? 'true' : 'false'); });
  }
  function wireVl(root) {
    root.querySelector('#ck-voice-open').addEventListener('click', function (e) { openVoices(e.currentTarget); });
    root.querySelector('#ck-voice-play').addEventListener('click', function (e) { preview(e.currentTarget); });
    root.querySelector('#ck-lang').addEventListener('vaani:change', function (e) { setLang(e.detail.value); });
  }
  function setLang(v) { st.lang = v; CK.url({ lang: v === 'auto' ? null : v }); V.announce('Language for this call: ' + CK.langLabel(v)); CK.newcall.sync(); }
  function setVoice(id) {
    var v = CK.voiceById(id); if (!v.available) return;
    st.voiceId = id; CK.url({ voice: id === 'vaani' ? null : id }); stopPreview(); CK.newcall.sync();
  }

  /* ---------- VoicePicker: a real-looking preview (≈ 4 s here), one at a time; the meter is static under reduced motion ---------- */
  var pv = null;
  function stopPreview() { if (!pv) return; clearInterval(pv.i); clearTimeout(pv.t); var b = pv.btn; pv = null; if (d.contains(b)) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Hear ' + CK.voiceById(st.voiceId).name); b.innerHTML = V.icon('play', 'sm'); } var m = d.getElementById('ck-voice-lvl'); if (m) m.hidden = true; }
  function preview(btn) {
    if (pv) { stopPreview(); return; }
    var v = CK.voiceById(st.voiceId), m = d.getElementById('ck-voice-lvl');
    btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Stop preview of ' + v.name); btn.innerHTML = V.icon('square', 'sm');
    if (m) m.hidden = false;
    var bars = m ? CK.$$('i', m) : [], k = 0, seq = [.4, .9, .6, .3, .7, 1, .5, .2, .8, .6, .4, .9];
    pv = { btn: btn, i: setInterval(function () { if (CK.rm()) { bars.forEach(function (b2, j) { b2.style.setProperty('--l', [.4, .7, .5, .3][j]); }); return; } k += 1; bars.forEach(function (b2, j) { b2.style.setProperty('--l', seq[(k + j * 3) % seq.length]); }); }, 125), t: setTimeout(stopPreview, 4200) };
    V.announce('Playing a preview of ' + v.name + ' in Hindi and English.');
  }
  function voicesHtml(name) {
    return '<div class="voices" role="radiogroup" aria-label="Voice for this call" id="' + name + '">' + CK.voices.map(function (v) {
      var on = v.id === st.voiceId, id = name + '-' + v.id;
      return '<div class="voice"><div class="voice-radio" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-value="' + v.id + '" aria-describedby="' + id + '-m"' + (v.available ? '' : ' aria-disabled="true"') + '>' + V.ui.avatar(v.name, { kind: 'voice', size: 32, tile: v.tile }) +
        '<span><span class="voice-name" translate="no">' + esc(v.name) + (v.id === st.defaults.voiceId ? ' <span class="tag tag--outline">Workspace default</span>' : '') + '</span><span class="voice-meta" id="' + id + '-m">' + v.languages.map(function (c) { return '<span class="lm lm--compact"><span class="lm-g" lang="' + V.langByCode(c).lang + '" aria-hidden="true">' + esc(V.langByCode(c).glyph) + '</span>' + esc(V.langByCode(c).name) + '</span>'; }).join('') + esc(v.available ? v.style : v.unavailableReason) + '</span></span></div>' +
        '<div class="voice-end"><span class="voice-check">' + V.icon('circle-check') + '</span></div></div>';
    }).join('') + '</div>';
  }
  function openVoices(btn) {
    var body = d.getElementById('ck-voice-body'); body.innerHTML = voicesHtml('ck-vo'); V.initAll(body);
    var g = body.querySelector('.voices');
    g.addEventListener('vaani:change', function (e) { setVoice(e.detail.value); });
    g.addEventListener('click', function (e) { var r = e.target.closest('[role="radio"]'); if (r && r.getAttribute('aria-disabled') !== 'true') V.popover.close('ck-voice-pop'); });
    V.popover.open(btn, 'ck-voice-pop', { placement: 'bottom-end' });
    var sel = g.querySelector('[aria-checked="true"]'); if (sel) sel.focus();
  }

  /* ---------- phone: Voice and language as a bottom sheet (cards + a radio list; no nested popovers) ---------- */
  P.openSheet = function (btn) {
    init();
    var body = d.getElementById('ck-vl-body');
    body.innerHTML = '<div class="l-stack l-stack--md"><span class="field-label" id="ck-vs-l">Voice</span>' + voicesHtml('ck-vs') + '<p class="field-hint">For this call only.</p>' +
      '<fieldset class="fieldset"><legend>Language</legend>' + CK.LANGS.map(function (L) { return '<label class="check"><input type="radio" class="radio" name="ck-vs-lang" value="' + L.value + '"' + (L.value === st.lang ? ' checked' : '') + '><span class="check-text">' + esc(L.label) + (L.hint ? '<span class="check-desc">' + L.hint + '</span>' : '') + '</span></label>'; }).join('') + '</fieldset></div>';
    V.initAll(body);
    body.querySelector('.voices').addEventListener('vaani:change', function (e) { setVoice(e.detail.value); });
    CK.$$('input[name="ck-vs-lang"]', body).forEach(function (r) { r.addEventListener('change', function () { setLang(r.value); }); });
    P.sheetOpen = true;
    V.popover.open(btn, 'ck-vl-pop', { modal: true, onClose: function () { P.sheetOpen = false; P.sync(); } });
  };

  /* ---------- FlowSwitcher purpose="call": search-first popover, Live and Drafts (test calls only) ---------- */
  function flowItems(qs) {
    var qv = (qs || '').trim().toLowerCase(), live = [], drafts = [];
    CK.flows.forEach(function (f) {
      var hit = !qv || f.name.toLowerCase().indexOf(qv) >= 0 || f.id.indexOf(qv) >= 0;
      if (f.live && (hit || ('v' + f.live.version).indexOf(qv) === 0)) live.push(CK.rev(f, 'live'));
      if ((f.draft || !f.live) && (hit || ('v' + (f.draft ? f.draft.version : 1)).indexOf(qv) === 0)) drafts.push(CK.rev(f, 'draft'));
    });
    return { live: live, drafts: drafts };
  }
  function flowOpt(r) {
    var f = CK.flowById(r.id), cur = CK.flow(), on = cur && cur.id === r.id && cur.rev === r.rev;
    var used = f.live && f.live.usedBy && f.live.usedBy[0] ? ' · ' + f.live.usedBy[0] : '';
    var meta = 'Edited ' + V.fmt.when(f.editedAt).toLowerCase().replace(/^today.*/, 'today') + ' · ' + f.stepCount + ' steps' + (r.draft ? '' : used);
    var tags = (r.draft ? '<span class="tag">' + (f.draft ? 'Draft · ' + f.draft.changes + ' changes' : 'Not published') + '</span>' : V.ui.statusTag('flow', 'live', { v: r.version })) + (r.id === st.defaults.flowId && !r.draft ? '<span class="tag tag--outline">Cockpit default</span>' : '');
    return '<div class="option option--2" role="option" id="ck-fo-' + r.id + '-' + r.rev + '" data-value="' + r.id + ':' + r.rev + '" aria-selected="' + !!on + '" aria-describedby="ck-fo-' + r.id + '-' + r.rev + '-m"><span class="option-main"><span class="option-label" translate="no">' + esc(r.name) + (r.draft ? ' · v' + r.version : '') + '</span><span class="option-desc" id="ck-fo-' + r.id + '-' + r.rev + '-m">' + esc(r.draft ? 'Draft · test calls only · ' + meta : meta) + '</span></span><span class="option-tags">' + tags + '</span></div>';
  }
  var fEntry = null, fActive = -1;
  function renderFlowList(qs) {
    var it = flowItems(qs), list = d.getElementById('ck-flow-lb');
    list.innerHTML = (it.live.length ? '<div role="group" aria-labelledby="ck-fg-1"><span class="listbox-group-label" id="ck-fg-1">Live</span>' + it.live.map(flowOpt).join('') + '</div>' : '') +
      (it.drafts.length ? '<div role="group" aria-labelledby="ck-fg-2"><span class="listbox-group-label" id="ck-fg-2">Drafts · test calls only</span>' + it.drafts.map(flowOpt).join('') + '</div>' : '') +
      (!it.live.length && !it.drafts.length ? '<div class="listbox-empty">No flows match ‘' + esc(qs) + '’.</div>' : '');
    var o = CK.$$('[role="option"]', list); fActive = -1;
    var sel = o.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0];
    setFActive(qs ? 0 : (sel ? o.indexOf(sel) : 0));
    clearTimeout(renderFlowList.t); renderFlowList.t = setTimeout(function () { V.announce(o.length + ' flows', { dedupeKey: 'ck-flows' }); }, 400);
  }
  function setFActive(i) {
    var o = CK.$$('#ck-flow-lb [role="option"]'); if (!o.length) return; fActive = Math.max(0, Math.min(o.length - 1, i));
    o.forEach(function (x, k) { x.classList.toggle('is-active', k === fActive); });
    d.getElementById('ck-flow-q').setAttribute('aria-activedescendant', o[fActive].id); o[fActive].scrollIntoView({ block: 'nearest' });
  }
  function openFlows(e) {
    var btn = e.currentTarget, pop = d.getElementById('ck-flow-pop');
    pop.innerHTML = '<div class="listbox-search"><div class="input input--sm">' + V.icon('search', 'sm') + '<input id="ck-flow-q" type="search" role="combobox" aria-expanded="true" aria-controls="ck-flow-lb" aria-autocomplete="list" aria-label="Search flows by name or number" placeholder="Search flows by name or number…" autocomplete="off"></div></div>' +
      '<div role="listbox" id="ck-flow-lb" aria-label="Flows"></div>' +
      '<div class="listbox-foot"><a class="btn btn--sm btn--tertiary" href="flow-designer.html?new=1">' + V.icon('plus', 'sm') + 'New flow…</a><a class="btn btn--sm btn--link u-ml-auto" href="flow-designer.html">All flows</a></div>';
    var qEl = pop.querySelector('#ck-flow-q');
    renderFlowList('');
    fEntry = V.util.float(pop, btn, { kind: 'popover', modal: false, placement: 'bottom-start' });
    qEl.focus();
    qEl.addEventListener('input', function () { renderFlowList(qEl.value); });
    qEl.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setFActive(fActive + 1); } else if (ev.key === 'ArrowUp') { ev.preventDefault(); setFActive(fActive - 1); }
      else if (ev.key === 'Enter') { ev.preventDefault(); var o = CK.$$('#ck-flow-lb [role="option"]')[fActive]; if (o) chooseFlow(o.getAttribute('data-value')); }
      else if (ev.key === 'Tab') { fEntry.close('tab'); }
    });
    pop.querySelector('#ck-flow-lb').addEventListener('click', function (ev) { var o = ev.target.closest('[role="option"]'); if (o) chooseFlow(o.getAttribute('data-value')); });
    pop.addEventListener('focusout', function (ev) { var to = ev.relatedTarget; if (fEntry && !fEntry.closed && to && !pop.contains(to)) fEntry.close('tab'); });
  }
  function chooseFlow(val) {
    var p = val.split(':'); st.flowId = p[0]; st.revPick = p[1];
    if (fEntry && !fEntry.closed) fEntry.close('select');
    CK.url({ flow: p[0] === CK.DEFAULT_FLOW ? null : p[0], rev: p[1] === 'draft' ? 'draft' : null });
    var f = CK.flow(); V.announce('Flow for this call: ' + f.name + (f.draft ? ', draft version ' + f.version + ', test calls only' : ', live version ' + f.version));
    CK.newcall.sync();
    var b = d.getElementById('ck-flow'); if (b) b.focus();
  }

  /* ---------- Make default: a separate action with Undo (F-UX-014); the pick itself never writes ---------- */
  P.makeDefault = function (what) {
    init();
    var key = what === 'flow' ? 'flowId' : 'voiceId', prev = st.defaults[key];
    st.defaults[key] = what === 'flow' ? st.flowId : st.voiceId;
    V.toast.success(what === 'flow' ? 'Default flow updated · used by Cockpit, Meetings and Leads' : 'Default voice updated · used by Cockpit and Meetings', { action: { label: 'Undo', onClick: function () { st.defaults[key] = prev; CK.newcall.sync(); V.announce('Default restored.'); } } });
    CK.newcall.sync();
    var back = d.getElementById(what === 'flow' ? 'ck-flow' : 'ck-voice-open'); if (back) back.focus();
  };
  P.wire = function () {
    init();
    var btn = d.getElementById('ck-vl-btn'); if (btn) btn.addEventListener('click', function () { P.openSheet(btn); });
  };
})(window, document);
