/* Vaani Labs prototype · Flow Designer · inspector bindings: every change applies to the Draft at once (autosave),
   invalid numbers and phone numbers stay in their field uncommitted (FD2 §7.1, E09, E10), the answer editor (§7.7),
   GoToSelect wiring and the {{ variable picker (§8.2). */
(function (w, d) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S, esc = VF.esc, $ = VF.$, $$ = VF.$$;
  var RERENDER = ['when', 'mtype', 'offer', 'to', 'decide', 'confirmWa', 'template', 'lead', 'match', 'searchIn', 'lang'];
  function out(s, id) { return s.outs.filter(function (o) { return o.id === id; })[0]; }
  function refocus(sel) { setTimeout(function () { var x = $(sel, $('#fd-insp')); if (x) x.focus(); }, 0); }
  function showErr(input, msg) {
    var field = input.closest('.field'), box = input.closest('.input'), footEl = field.querySelector('.field-foot'), id = input.id + '-e';
    if (!footEl) { footEl = d.createElement('div'); footEl.className = 'field-foot'; field.appendChild(footEl); }
    var hint = footEl.querySelector('.field-hint'), err = footEl.querySelector('.field-error');
    if (msg) { if (!err) { err = d.createElement('p'); err.className = 'field-error'; err.id = id; footEl.insertBefore(err, footEl.firstChild); } err.innerHTML = VF.icon('circle-alert', 'sm') + esc(msg); if (hint) hint.hidden = true; box && box.classList.add('input--invalid'); input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id); }
    else { if (err) err.remove(); if (hint) { hint.hidden = false; input.setAttribute('aria-describedby', hint.id); } box && box.classList.remove('input--invalid'); input.removeAttribute('aria-invalid'); }
  }
  function updatePrompt(ta) {
    var box = ta.closest('.fd-pf'), m = box.querySelector('.fd-pf-mirror'), c = box.querySelector('.field-count'), sl = box.querySelector('.fd-sounds');
    var known = VF.allVars(S.m.steps).map(function (v) { return v.name; });
    m.innerHTML = esc(ta.value).replace(/\{\{\s*(\w+)\s*\}\}/g, function (x, n) { return '<mark class="fd-tok' + (known.indexOf(n) < 0 ? ' fd-tok--bad' : '') + '">' + x + '</mark>'; }) + '\n';
    m.scrollTop = ta.scrollTop;
    if (c) c.textContent = 'About ' + Math.max(1, Math.round(ta.value.length / 14)) + ' s spoken · ' + ta.value.length + ' of 600';
    if (sl) sl.firstChild.textContent = 'Sounds like: “' + VF.soundsLike(ta.value) + '”';
  }

  VF.bindFields = function (root, s0) {
    var id = s0.id;
    function s() { return VF.step(id); }
    root.oninput = function (e) {
      var t = e.target, k = t.getAttribute('data-k'), part = t.getAttribute('data-part');
      if (part === 'label') { var aid = t.getAttribute('data-ans'); VF.act('rename answer', function () { out(s(), aid).label = t.value; }, { coalesce: 'ans:' + id + ':' + aid }); return; }
      if (part === 'ex') { if (/,/.test(t.value)) addEx(t); return; }
      if (!k) { if (t.id === 'fd-try') { var q = t.value.trim(); $('#fd-try-out').textContent = !q ? '' : /price|rate|cost|bhk|kitna/i.test(q) ? 'Would answer from 3 passages · price-sheet.pdf' : 'Nothing matched well enough. The call takes Not found.'; } return; }
      if (t.matches('.fd-pf-ta')) { updatePrompt(t); VF.setField(id, k, t.value); varTrigger(t); return; }
      if (t.hasAttribute('data-min')) { var n = Number(String(t.value).replace(/,/g, '')), lo = +t.getAttribute('data-min'), hi = +t.getAttribute('data-max'); if (t.value.trim() === '' || isNaN(n) || n < lo || n > hi || Math.round(n) !== n) { var msg = 'Enter a number from ' + lo + ' to ' + hi + '.'; showErr(t, msg); VF.setInvalid(id, k, VF.fieldLabel(k) + ' must be ' + lo + ' to ' + hi + '. It’s ' + (t.value.trim() || 'empty') + '.'); } else { showErr(t, null); VF.setField(id, k, n); } return; }
      if (k === 'number') { s().f._numDraft = t.value; return; }
      if (k === 'saveTo' || k === 'cbTime') { if (t.value && !/^[a-z0-9_]+$/.test(t.value)) { showErr(t, 'Use lowercase letters, numbers and _ only.'); return; } showErr(t, null); }
      VF.setField(id, k, t.value);
      if (k === 'title') { var h = $('#fd-insp-t'); if (h) h.textContent = t.value; }
    };
    root.onfocusout = function (e) {
      var t = e.target; if (t.getAttribute('data-k') !== 'number') return;
      var v = t.value.trim(); if (/^\+\d{1,3}[\s\d]{8,14}$/.test(v)) { showErr(t, null); delete s().f._numDraft; VF.setField(id, 'number', v); VF.setInvalid(id, 'number', null); }
      else { showErr(t, 'Enter a number with the country code, like +91 98765 43210.'); VF.setInvalid(id, 'number', 'Transfer number needs the country code, like +91 98765 43210.'); }
    };
    root.onchange = function (e) {
      var t = e.target, k = t.getAttribute('data-k'), num = t.getAttribute('data-num');
      if (num) { var list = (s().f.numbers || []).slice(), i = list.indexOf(num); if (t.checked && i < 0) list.push(num); if (!t.checked && i >= 0) list.splice(i, 1); VF.setField(id, 'numbers', list); return; }
      if (!k || t.matches('[type="text"], textarea')) return;
      VF.setField(id, k, t.type === 'checkbox' ? t.checked : t.value, { coalesce: id + ':' + k + ':' + Date.now() });
      if (RERENDER.indexOf(k) >= 0) VF.renderInspector();
    };
    root.addEventListener('vaani:change', function (e) {
      var t = e.target.closest('[data-k]'); if (!t) return; var k = t.getAttribute('data-k'), v = e.detail.value != null ? e.detail.value : e.detail.checked;
      if (/^goto-/.test(k)) { var oid = k.slice(5); if (v === '__none') VF.disconnect(id, oid, { quiet: true }); else if (v === '__new') VF.openPicker({ stepId: id, outId: oid }, t); else VF.connect(id, oid, v); return; }
      if (k === 'convert') { VF.convert(id, v); return; }
      if (k === 'outcome') { VF.act('change outcome', function () { var x = s(); x.f.outcome = v; x.f.lead = VF.outcomeLead(v); }, { structure: true }); VF.renderInspector(); return; }
      if (t.getAttribute('role') === 'switch') v = e.detail.checked;
      VF.setField(id, k, v, { coalesce: id + ':' + k + ':' + Date.now() });
      if (RERENDER.indexOf(k) >= 0) VF.renderInspector();
    });
    root.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-rmex')) { var row = b.closest('[data-ex]'), aid = row.getAttribute('data-ex'), j = +b.getAttribute('data-rmex'); VF.act('remove example', function () { out(s(), aid).ex.splice(j, 1); }, { structure: true }); VF.renderInspector(); refocus('[data-ans="' + aid + '"][data-part="ex"]'); return; }
      if (b.hasAttribute('data-addans')) { if (b.getAttribute('aria-disabled') === 'true') return; var nid = 'a' + Date.now().toString(36); VF.act('add answer', function () { var x = s(), fb = x.outs.filter(function (o) { return o.fb; })[0], i = x.outs.indexOf(fb); x.outs.splice(i < 0 ? x.outs.length : i, 0, { id: nid, label: x.type === 'logic.branch' ? 'Case ' + x.outs.length : 'Answer ' + x.outs.length, ex: [], to: null }); }, { structure: true }); VF.renderInspector(); refocus('[data-ans="' + nid + '"][data-part="label"]'); V.announce('Answer added'); return; }
      if (b.hasAttribute('data-ansmenu')) { ansMenu(b.getAttribute('data-ansmenu'), b); return; }
      if (b.hasAttribute('data-var')) { openVars(root.querySelector('textarea[data-k="' + b.getAttribute('data-var') + '"]'), b); return; }
      if (b.hasAttribute('data-copyid')) { V.toast.success('Step id copied'); return; }
      if (b.hasAttribute('data-connect')) { V.toast.info('Settings › Integrations opens in a new tab. This row re-checks when you come back.'); }
    };
    root.onkeydown = function (e) {
      var t = e.target;
      if (t.getAttribute('data-part') === 'ex' && e.key === 'Enter') { e.preventDefault(); addEx(t); return; }
      if (t.getAttribute('data-part') === 'ex' && e.key === 'Backspace' && !t.value) { var aid = t.getAttribute('data-ans'), o = out(s(), aid); if (o.ex.length) { VF.act('remove example', function () { o.ex.pop(); }, { structure: true }); VF.renderInspector(); refocus('[data-ans="' + aid + '"][data-part="ex"]'); } return; }
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && t.closest('[data-ans]')) { e.preventDefault(); var ai = t.closest('[data-ans]').getAttribute('data-ans'); moveAns(ai, e.key === 'ArrowUp' ? -1 : 1, t.getAttribute('data-part')); return; }
      if (t.matches('.fd-pf-ta') && VF.varPickOpen && varKey(e, t)) return;
    };
    $$('.fd-pf-ta', root).forEach(function (ta) { ta.addEventListener('scroll', function () { ta.parentNode.querySelector('.fd-pf-mirror').scrollTop = ta.scrollTop; }); });
    function addEx(t) {
      var aid = t.getAttribute('data-ans'), vals = t.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean); if (!vals.length) { t.value = ''; return; }
      VF.act('add example', function () { var o = out(s(), aid); o.ex = (o.ex || []).concat(vals); }, { structure: true }); VF.renderInspector(); refocus('[data-ans="' + aid + '"][data-part="ex"]');
    }
    function moveAns(aid, dir, part) {
      var x = s(), named = x.outs.filter(function (o) { return !o.fb; }), i = named.map(function (o) { return o.id; }).indexOf(aid), j = i + dir; if (j < 0 || j >= named.length) { V.announce('Can’t move further'); return; }
      VF.act('move answer', function () { var a = x.outs.indexOf(named[i]), b = x.outs.indexOf(named[j]), tmp = x.outs[a]; x.outs[a] = x.outs[b]; x.outs[b] = tmp; }, { structure: true });
      VF.renderInspector(); refocus('[data-ans="' + aid + '"][data-part="' + (part || 'label') + '"]'); V.announce('Answer ' + out(x, aid).label + ' moved to position ' + (j + 1));
    }
    function ansMenu(aid, btn) {
      var x = s(), o = out(x, aid);
      VF.menu('fd-ans-menu', 'Answer ' + o.label, [
        { label: 'Move up', icon: 'arrow-up', kbd: 'alt+up', fn: function () { moveAns(aid, -1); } },
        { label: 'Move down', icon: 'arrow-down', kbd: 'alt+down', fn: function () { moveAns(aid, 1); } },
        { label: 'Connect to…', icon: 'corner-down-right', kbd: 'C', fn: function () { VF.openConnect(id, aid, btn); } },
        { sep: 1 },
        { label: 'Delete answer', icon: 'trash-2', danger: 1, disabled: x.outs.filter(function (q) { return !q.fb; }).length <= 1 ? 'A question needs at least one answer' : null, fn: function () { var had = !!o.to; VF.act("delete answer '" + o.label + "'", function () { x.outs.splice(x.outs.indexOf(o), 1); }, { structure: true }); VF.renderInspector(); V.toast.undo("Deleted answer '" + o.label + "'" + (had ? ' and its connection' : ''), { action: { label: 'Undo', onClick: function () { VF.undo(); VF.renderInspector(); } } }); } }
      ], btn);
    }
  };

  /* ---------- the variable picker: {{ opens it filtered; Insert variable opens it with focus inside ---------- */
  var vp = { el: null, entry: null, ta: null, start: -1, active: 0, shown: [] };
  function vpEl() { if (!vp.el) { vp.el = d.createElement('div'); vp.el.className = 'listbox listbox--wide'; vp.el.id = 'fd-varlb'; vp.el.setAttribute('role', 'listbox'); vp.el.setAttribute('aria-label', 'Variables'); vp.el.hidden = true; d.body.appendChild(vp.el); vp.el.addEventListener('mousedown', function (e) { e.preventDefault(); }); vp.el.addEventListener('click', function (e) { var o = e.target.closest('[data-v]'); if (o && o.getAttribute('aria-disabled') !== 'true') insertVar(o.getAttribute('data-v')); }); vp.el.addEventListener('keydown', function (e) { varKey(e, null); }); } return vp.el; }
  function renderVars(q) {
    var all = VF.allVars(S.m.steps), co = VF.callOrder(S.m.steps).order, here = S.insp ? co.indexOf(S.insp.id) : -1, groups = {}, html = '';
    vp.shown = all.filter(function (v) { return !q || v.name.indexOf(q) >= 0 || v.label.toLowerCase().indexOf(q) >= 0; });
    vp.shown.forEach(function (v) { v.dis = v.by && here >= 0 && co.indexOf(v.by) >= here ? 'Captured later, in ' + VF.step(v.by).title : null; (groups[v.group] = groups[v.group] || []).push(v); });
    vp.shown = [].concat.apply([], Object.keys(groups).map(function (g) { return groups[g].filter(function (v) { return !v.dis; }).concat(groups[g].filter(function (v) { return v.dis; })); }));
    Object.keys(groups).forEach(function (g) { html += '<span class="listbox-group-label">' + esc(g) + '</span>'; vp.shown.filter(function (v) { return v.group === g; }).forEach(function (v) { var i = vp.shown.indexOf(v); html += '<div class="option option--2' + (i === vp.active ? ' is-active' : '') + '" role="option" id="fd-vo-' + i + '" data-v="' + esc(v.name) + '" aria-selected="' + (i === vp.active) + '"' + (v.dis ? ' aria-disabled="true"' : '') + '><span class="option-main"><span class="option-label u-mono" translate="no">' + esc(v.name) + '</span><span class="option-desc">' + esc(v.dis || v.label + ' · sample: ' + v.sample) + '</span></span></div>'; }); });
    vpEl().innerHTML = html || '<p class="listbox-empty">No variables match.</p>';
    var a = $('#fd-vo-' + vp.active); if (a) a.scrollIntoView({ block: 'nearest' });
    if (vp.ta) vp.ta.setAttribute('aria-activedescendant', vp.shown.length ? 'fd-vo-' + vp.active : '');
  }
  function openVars(ta, anchor, typed) {
    if (!ta) return; vp.ta = ta; vp.active = 0; vp.start = typed ? ta.selectionStart : -1; renderVars('');
    if (vp.entry && !vp.entry.closed) vp.entry.close('replace');
    vp.entry = V.util.float(vpEl(), anchor || ta, { kind: 'popover', placement: 'bottom-start', sheetOnPhone: false, onClose: function () { VF.varPickOpen = false; if (vp.ta) vp.ta.removeAttribute('aria-activedescendant'); } });
    VF.varPickOpen = true;
    if (!typed) { vpEl().tabIndex = -1; vpEl().focus(); } else ta.focus();
  }
  function varTrigger(ta) {
    var pos = ta.selectionStart, before = ta.value.slice(0, pos), m = before.match(/\{\{(\w*)$/);
    if (m && !VF.varPickOpen) { openVars(ta, ta, true); vp.start = pos - m[1].length; }
    if (VF.varPickOpen && vp.start >= 0) { if (!m) { vp.entry.close('x'); return; } vp.active = 0; renderVars(m[1]); }
  }
  function varKey(e, ta) {
    var n = vp.shown.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (n) { vp.active = (vp.active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; renderVars(vp.start >= 0 && vp.ta ? (vp.ta.value.slice(0, vp.ta.selectionStart).match(/\{\{(\w*)$/) || [0, ''])[1] : ''); } return true; }
    if ((e.key === 'Enter' || e.key === 'Tab') && n) { var v = vp.shown[vp.active]; if (v && !v.dis) { e.preventDefault(); insertVar(v.name); return true; } }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); vp.entry.close('escape'); if (vp.ta) vp.ta.focus(); return true; }
    void ta; return false;
  }
  function insertVar(name) {
    var ta = vp.ta; if (!ta) return; var v = ta.value, pos = ta.selectionStart, from = vp.start >= 0 ? vp.start - 2 : pos, ins = '{{' + name + '}}';
    ta.value = v.slice(0, from) + ins + v.slice(pos); var caret = from + ins.length;
    vp.entry.close('select'); ta.focus(); ta.setSelectionRange(caret, caret);
    ta.dispatchEvent(new Event('input', { bubbles: true })); V.announce('Inserted ' + name.replace(/_/g, ' ') + ' variable');
  }
})(window, document);
