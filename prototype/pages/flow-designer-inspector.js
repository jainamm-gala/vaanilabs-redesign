/* Vaani Labs prototype · Flow Designer · StepInspector (FD2 §7.1): docked 320–480 at ≥ 1280, overlay at 1024–1279,
   read-only sheet on tablets, full-screen read-only sheet on phones. Configure · Test data · Issues. Selecting a step
   opens it without moving focus; Enter or F2 on a step focuses Label; Esc returns to the step. No Delete slab, no Apply. */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  S.insp = null; S.samples = {}; S.inspW = +(VF.store.get('inspector-width') || 320);
  function el() { return $('#fd-insp'); }
  function stepFor(id) { return (S.viewing ? S.viewing.steps : S.m.steps).filter(function (s) { return s.id === id; })[0] || null; }
  VF.inspectorOpen = function () { return !!S.insp && !el().hidden; };

  VF.openInspector = function (id, o) {
    o = o || {}; var s = stepFor(id); if (!s) return;
    var same = S.insp && S.insp.id === id && !el().hidden;
    S.insp = { id: id, tab: o.tab || (same ? S.insp.tab : 'conf') };
    render(); place();
    if (o.focusLabel) setTimeout(function () { var f = o.field && $('[data-k="' + o.field + '"]', el()) || $('[data-k="title"]', el()) || $('.sheet-title', el()); if (f) { f.focus(); if (f.select && !o.field) f.select(); } }, 30);
    VF.emit('inspector');
  };
  VF.closeInspector = function (o) {
    o = o || {}; if (!S.insp) return; var id = S.insp.id; S.insp = null;
    if (V.drawer.isOpen('fd-insp')) V.drawer.close('fd-insp', 'x'); else { el().hidden = true; el().classList.remove('is-docked', 'is-overlay'); }
    S.inspOverlay = false; VF.emit('inspector');
    if (o.returnFocus !== false && VF.step(id) && (S.mode === 'full' || S.mode === 'compact')) VF.focusStep(id, { reveal: false });
  };
  function place() {
    var e = el(), m = S.mode;
    e.classList.toggle('sheet--detail', m === 'review' || m === 'phone');
    if (m === 'phone') {
      e.classList.remove('is-docked', 'is-overlay'); e.style.width = ''; S.inspOverlay = false;
      if (!V.drawer.isOpen('fd-insp')) {
        /* The full-screen step sheet is modal: focus goes to its title and comes back to the Outline row it was opened
           from (05 §10.11). The row is re-queried on close because the Outline may have re-rendered meanwhile. */
        var from = d.activeElement, rowKey = from && from.closest && from.closest('[data-row]') ? from.closest('[data-row]').getAttribute('data-row') : null, stepId = S.insp.id;
        var entry = V.drawer.open('fd-insp', { mode: 'modal', returnTo: from, onClose: function () {
          var back = (rowKey && $('#fd-tree [data-row="' + CSS.escape(rowKey) + '"]')) || $('#fd-tree [data-row="step:' + CSS.escape(stepId) + '"]');
          if (back && entry) { entry.returnTo = back; S.olFocus = back.getAttribute('data-row'); $$('#fd-tree [role="treeitem"]').forEach(function (li) { li.tabIndex = li === back ? 0 : -1; }); }
          if (S.insp && !S.remounting) { S.insp = null; VF.emit('inspector'); }
        } });
      }
      return;
    }
    if (e._vFinishLeave) e._vFinishLeave();
    e.hidden = false;
    var overlay = m === 'compact' || m === 'review' || (m === 'full' && S.left && S.leftDocked && w.innerWidth < 1440);
    e.classList.toggle('is-overlay', overlay); e.classList.toggle('is-docked', !overlay); S.inspOverlay = overlay;
    e.style.width = m === 'full' && !overlay ? S.inspW + 'px' : '';
    if (overlay && S.insp && (m === 'compact' || m === 'review')) setTimeout(function () { VF.reveal(S.insp.id); }, 30);
  }
  VF.placeInspector = function () { if (S.insp) { render(); place(); } };

  function statusLine() {
    if (S.viewing) return "Read-only. You’re viewing v" + S.viewing.v + '.';
    if (VF.readOnlyReason() === 'viewonly') return 'You can view this flow. Ask Rohit S. (admin) to change it.';
    return S.m.meta.live ? 'Edits save to the draft. Callers hear Live v' + S.m.meta.live.version + ' until you publish.' : 'Edits save to the draft.';
  }
  function render() {
    var s = stepFor(S.insp.id), e = el(); if (!s) { VF.closeInspector({ returnFocus: false }); return; }
    var ro = !!VF.readOnlyReason() || S.mode === 'review' || S.mode === 'phone', r = VF.reg(s), iss = S.issues.filter(function (i) { return i.stepId === s.id; });
    var ae = d.activeElement, hadFocus = !!(ae && e.contains(ae)), keepK = hadFocus ? ae.getAttribute('data-k') || ae.id || null : null;
    var phase = (r.phase ? VF.PHASES[r.phase].name + (r.name !== VF.PHASES[r.phase].name && r.phase !== 'outcome' ? ' · ' + r.name : '') : 'Unsupported step') + ' · #' + s.no;
    var tabs = [['conf', 'Configure'], ['data', 'Test data'], ['iss', 'Issues']];
    e.setAttribute('aria-label', 'Step inspector');
    e.innerHTML =
      (S.mode === 'full' && !S.inspOverlay ? '<div class="fd-insp-grip" role="separator" aria-orientation="vertical" aria-label="Resize inspector" aria-valuemin="320" aria-valuemax="480" aria-valuenow="' + S.inspW + '" tabindex="0"></div>' : '') +
      '<div class="sheet-head fd-insp-head">' + (S.mode === 'phone' ? '<button type="button" class="topbar-back sheet-back fd-insp-back" data-a="close">' + VF.icon('chevron-left') + 'Outline</button>' : '<button type="button" class="ibtn sheet-back" data-a="close" aria-label="Back to Outline">' + VF.icon('chevron-left') + '</button>') + '<span class="gt ' + VF.tileClass(s) + '" aria-hidden="true">' + VF.icon(r.icon, 'sm') + '</span>' +
      '<div class="sheet-heading"><p class="sheet-meta">' + esc(phase) + '</p><h2 class="sheet-title" id="fd-insp-t" translate="no" data-tooltip-overflow tabindex="-1" data-focus-target>' + esc(s.title) + '</h2></div>' +
      '<div class="sheet-actions">' + (ro ? '' : '<button type="button" class="ibtn" data-a="more" aria-label="More actions for ' + esc(s.title) + '" aria-haspopup="menu">' + VF.icon('ellipsis') + '</button>') + '<button type="button" class="ibtn sheet-close" data-a="close" aria-label="Close inspector">' + VF.icon('x') + '</button></div></div>' +
      '<div class="vtabs vtabs--panel"><div class="vtabs-list" role="tablist" aria-label="Step inspector sections">' + tabs.map(function (t) { return '<button type="button" class="vtab" role="tab" id="fd-tab-' + t[0] + '" aria-controls="fd-panel-' + t[0] + '" aria-selected="' + (S.insp.tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + (t[0] === 'iss' ? ' <span class="vtab-count">' + iss.length + '</span>' : '') + '</button>'; }).join('') + '</div></div>' +
      '<div class="sheet-body fd-insp-body" role="tabpanel" id="fd-panel-conf" aria-labelledby="fd-tab-conf"' + (S.insp.tab === 'conf' ? '' : ' hidden') + '>' + (S.compare && !S.viewing ? compareHtml(s) : ro ? readOnlyHtml(s) : VF.configureHtml(s, iss)) + '</div>' +
      '<div class="sheet-body fd-insp-body" role="tabpanel" id="fd-panel-data" aria-labelledby="fd-tab-data"' + (S.insp.tab === 'data' ? '' : ' hidden') + '>' + testDataHtml(s) + '</div>' +
      '<div class="sheet-body fd-insp-body" role="tabpanel" id="fd-panel-iss" aria-labelledby="fd-tab-iss"' + (S.insp.tab === 'iss' ? '' : ' hidden') + '>' + issuesHtml(iss) + '</div>' +
      '<div class="sheet-foot fd-insp-foot">' + (S.mode === 'review' || S.mode === 'phone' ? '<p class="status status--plain">' + VF.icon('info', 'sm') + '<span>Edit this step on a screen at least 1024 px wide. Your draft is safe.</span></p><button type="button" class="btn btn--sm" data-a="copy">' + VF.icon('link', 'sm') + 'Copy link</button>' : '<p class="status status--plain">' + VF.icon('info', 'sm') + '<span>' + esc(statusLine()) + '</span></p><button type="button" class="btn btn--sm" data-a="done">Done</button>') + '</div>';
    V.initAll(e); if (VF.bindFields && !ro && !S.compare) VF.bindFields(e, s);
    if (keepK) { var k2 = $('[data-k="' + keepK + '"]', e) || d.getElementById(keepK); if (k2) k2.focus({ preventScroll: true }); else { var t2 = $('#fd-insp-t', e); if (t2) t2.focus({ preventScroll: true }); } }
    else if (hadFocus) { var t3 = $('#fd-insp-t', e); if (t3) t3.focus({ preventScroll: true }); }
  }
  VF.renderInspector = function () { if (S.insp && (!el().hidden || V.drawer.isOpen('fd-insp'))) render(); };

  /* ---------- read-only (tablet, phone, versions, view-only) ---------- */
  function kv(label, value) { return '<div class="kv-row"><dt>' + esc(label) + '</dt><dd>' + value + '</dd></div>'; }
  function readOnlyHtml(s) {
    var rows = VF.fieldSummary(s).map(function (p) { return kv(p[0], p[1]); }).join(''), by = VF.byId(VF.visibleSteps()), r = VF.reg(s);
    var outs = s.outs.filter(function (o) { return o.label; }).map(function (o) { var t = by[o.to]; return '<li class="fd-ro-ans"><span class="fd-ro-l">' + esc(o.label) + (o.fb ? ' <span class="u-fg-3">· fallback</span>' : '') + '</span><span>' + (t ? 'Go to ' + esc(t.title) + ' <span class="u-fg-3">#' + t.no + '</span>' : '<span class="u-fg-warning">' + VF.icon('triangle-alert', 'xs') + ' Not connected</span>') + '</span></li>'; }).join('');
    return '<dl class="kv kv--stacked">' + rows + '</dl>' + (outs ? '<section class="l-stack l-stack--sm"><h3 class="type-label-13">' + (r.rows === 'results' ? 'Results' : 'Answers to listen for') + '</h3><ul class="fd-ro-list">' + outs + '</ul></section>' : '') +
      (S.viewing ? '' : '<details class="details fd-adv"><summary>Advanced</summary><div class="l-stack l-stack--sm u-mt-8"><span class="id-text">' + esc(S.m.meta.shortId + '/step_' + s.no) + '</span><pre class="codeblock fd-code">' + esc(VF.compileStep(s, VF.visibleSteps())) + '</pre></div></details>');
  }
  /* Compare with live: Before (v7) and After (draft) per changed field; struck and underlined words (FD2 §4.5). */
  function wordDiff(a, b) {
    var A = String(a || '').split(/(\s+)/), B = String(b || '').split(/(\s+)/), i = 0, j = 0, out = { before: '', after: '' };
    while (i < A.length && j < B.length && A[i] === B[j]) { out.before += esc(A[i]); out.after += esc(B[j]); i++; j++; }
    var ai = A.length - 1, bj = B.length - 1, tailA = '', tailB = '';
    while (ai >= i && bj >= j && A[ai] === B[bj]) { tailA = esc(A[ai]) + tailA; tailB = esc(B[bj]) + tailB; ai--; bj--; }
    var del = A.slice(i, ai + 1).join(''), ins = B.slice(j, bj + 1).join('');
    out.before += (del ? '<del class="fd-del">' + esc(del) + '</del>' : '') + tailA; out.after += (ins ? '<ins class="fd-ins">' + esc(ins) + '</ins>' : '') + tailB;
    return out;
  }
  function compareHtml(s) {
    var base = S.compare.base.filter(function (x) { return x.id === s.id; })[0], v = S.compare.label;
    if (!base) return '<p class="notice notice--success">' + VF.icon('plus') + '<span class="notice-body">Added in the draft. It isn’t in ' + esc(v) + '.</span></p>' + readOnlyHtml(s);
    var rows = [], keys = Object.keys(Object.assign({}, s.f, base.f));
    if (s.title !== base.title) keys.unshift('__title');
    keys.forEach(function (k) { var a = k === '__title' ? base.title : base.f[k], b = k === '__title' ? s.title : s.f[k]; if (JSON.stringify(a) === JSON.stringify(b)) return; var wd = wordDiff(typeof a === 'string' ? a : JSON.stringify(a), typeof b === 'string' ? b : JSON.stringify(b)); rows.push('<section class="fd-diffrow"><h3 class="type-label-13">' + esc(VF.fieldLabel(k)) + '</h3><p class="fd-diff-l">Before (' + esc(v) + ')</p><p class="fd-diff-v">' + wd.before + '</p><p class="fd-diff-l">After (draft)</p><p class="fd-diff-v">' + wd.after + '</p></section>'); });
    return '<p class="status status--plain">' + VF.icon('git-compare', 'sm') + '<span>' + (rows.length ? 'Changed in draft' : 'Unchanged since ' + esc(v)) + '</span></p>' + rows.join('') + (rows.length ? '' : readOnlyHtml(s));
  }
  function testDataHtml(s) {
    var used = [], all = VF.allVars(S.m.steps);
    Object.keys(s.f || {}).forEach(function (k) { VF.varNames(s.f[k]).forEach(function (n) { if (used.indexOf(n) < 0) used.push(n); }); });
    ['lead_name', 'company_name'].forEach(function (n) { if (used.indexOf(n) < 0) used.push(n); });
    return '<p class="form-note">Sample values for this step. They stay with you on this flow and are never saved into the draft.</p><dl class="kv kv--rows">' + used.map(function (n) { var v = all.filter(function (x) { return x.name === n; })[0], val = S.samples[n] != null ? S.samples[n] : v ? v.sample : ''; return '<div class="kv-row"><dt><span class="u-mono" translate="no">' + esc(n) + '</span></dt><dd><div class="input input--sm"><input type="text" data-sample="' + esc(n) + '" value="' + esc(val) + '" aria-label="Sample value for ' + esc(n) + '"></div></dd></div>'; }).join('') + '</dl>' +
      (s.f && s.f.prompt ? '<div class="l-cluster"><button type="button" class="btn btn--sm" data-a="hear">' + VF.icon('play', 'sm') + 'Hear it</button><span class="form-note" id="fd-hear-st" aria-live="polite"></span></div>' : '');
  }
  function issuesHtml(iss) {
    if (!iss.length) return '<div class="empty empty--compact">No issues on this step.</div>';
    return '<ul class="fd-issues">' + iss.map(function (i) { return '<li><button type="button" class="fd-issue" data-issue="' + i.id + '">' + VF.icon(i.level === 'error' ? 'circle-x' : 'triangle-alert', 'md', { className: i.level === 'error' ? 'u-fg-danger' : 'u-fg-warning' }) + '<span class="fd-issue-t">' + esc(i.short || i.msg) + '</span><span class="fd-issue-a">' + (i.field ? 'Show field' : 'Go to step') + '</span></button></li>'; }).join('') + '</ul>';
  }

  /* ---------- behaviour ---------- */
  VF.inspectorInit = function () {
    var e = el();
    e.addEventListener('click', function (ev) {
      var a = ev.target.closest('[data-a]'), iss = ev.target.closest('[data-issue]');
      if (iss) { var i = S.issues.filter(function (x) { return x.id === iss.getAttribute('data-issue'); })[0]; if (i) VF.goToIssue(i); return; }
      if (!a) return; var act = a.getAttribute('data-a'), s = S.insp && stepFor(S.insp.id);
      if (act === 'close' || act === 'done') VF.closeInspector();
      if (act === 'more' && s) VF.menu('fd-insp-menu', 'More actions for ' + s.title, [
        { label: 'Duplicate', icon: 'copy', kbd: 'mod+D', fn: function () { VF.duplicate([s.id]); } },
        { label: 'Copy link to step', icon: 'link', fn: function () { copyLink(s); } },
        { label: 'Convert to…', icon: 'refresh-cw', disabled: VF.convertTargets(s).length ? null : 'No compatible step types', fn: function () { VF.menu('fd-conv2', 'Convert to', VF.convertTargets(s).map(function (k) { return { label: VF.REG[k].name, icon: VF.REG[k].icon, fn: function () { VF.convert(s.id, k); } }; }), a); } },
        { sep: 1 },
        { label: 'Delete and reconnect', icon: 'trash-2', danger: 1, kbd: 'alt+Delete', disabled: VF.incoming(S.m.steps, s.id).length === 1 && s.outs.filter(function (o) { return o.to; }).length === 1 ? null : 'Needs exactly one connection in and one out', fn: function () { VF.deleteSteps([s.id], { reconnect: true }); } },
        { label: 'Delete step', icon: 'trash-2', danger: 1, kbd: 'Delete', fn: function () { VF.deleteSteps([s.id]); } }
      ], a);
      if (act === 'copy' && s) copyLink(s);
      if (act === 'hear') { var st = $('#fd-hear-st'); a.setAttribute('aria-pressed', 'true'); if (st) st.textContent = 'Playing in Vaani’s voice with your sample values…'; setTimeout(function () { a.removeAttribute('aria-pressed'); if (st) st.textContent = 'Played. Audio is simulated in this prototype.'; }, 1600); }
    });
    e.addEventListener('vaani:tabchange', function (ev) { if (S.insp) S.insp.tab = ev.detail.tab.getAttribute('data-tab'); });
    e.addEventListener('input', function (ev) { var k = ev.target.getAttribute('data-sample'); if (k) { S.samples[k] = ev.target.value; VF.emit('samples'); } });
    e.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && S.insp && !VF.varPickOpen && !V.drawer.isOpen('fd-insp')) { var top = V.overlays.top(); if (top && top.el.contains(d.activeElement)) return; ev.preventDefault(); ev.stopPropagation(); if (VF.step(S.insp.id)) VF.focusStep(S.insp.id); }
      var g = ev.target.closest('.fd-insp-grip'); if (g && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) { ev.preventDefault(); resize(S.inspW + (ev.key === 'ArrowLeft' ? 16 : -16)); }
    });
    e.addEventListener('pointerdown', function (ev) { var g = ev.target.closest('.fd-insp-grip'); if (!g) return; ev.preventDefault(); var x0 = ev.clientX, w0 = S.inspW; g.setPointerCapture(ev.pointerId); g.onpointermove = function (m) { resize(w0 + (x0 - m.clientX)); }; g.onpointerup = function () { g.onpointermove = null; }; });
  };
  function resize(wd) { S.inspW = Math.max(320, Math.min(480, Math.round(wd))); el().style.width = S.inspW + 'px'; var g = $('.fd-insp-grip', el()); if (g) g.setAttribute('aria-valuenow', S.inspW); VF.store.set('inspector-width', S.inspW); }
  function copyLink(s) { var u = 'flow-designer.html?flow=' + S.m.meta.id + '&node=' + s.id; try { navigator.clipboard.writeText(u); } catch (x) { /* clipboard may be blocked on file:// */ } V.toast.success('Link to #' + s.no + ' ' + s.title + ' copied'); }
  /* Convert to… (FD1 §10.5 same phase; FD2 §7.1 Speak ⇄ Question keeps the prompt; an Unsupported step gets FD2 §7.15's list). */
  VF.convertTargets = function (s) {
    if (s.type === 'unknown') return ['action.speak', 'action.transfer', 'outcome.end'];
    var p = VF.phaseOf(s), out = Object.keys(VF.REG).filter(function (k) { return k !== s.type && k !== 'unknown' && VF.REG[k].phase === p; });
    if (s.type === 'action.speak') out.unshift('logic.question'); if (s.type === 'logic.question') out.unshift('action.speak');
    return out;
  };

  /* Go to step (FD2 §12.4): select, pan clear of every panel at ≥ 0.75 zoom, open Configure and focus the field. */
  VF.goToIssue = function (i) {
    if (!i.stepId) { V.announce(i.msg); return; }
    if (S.mode === 'review' || S.mode === 'phone') { VF.select([i.stepId]); VF.openInspector(i.stepId, { tab: 'conf' }); return; }
    VF.select([i.stepId]); VF.reveal(i.stepId, { minZoom: 0.75 });
    VF.openInspector(i.stepId, { tab: 'conf', focusLabel: true, field: i.field || (i.out ? 'goto-' + i.out : null) });
  };
})(window, document);
