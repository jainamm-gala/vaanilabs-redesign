/* Vaani Labs prototype · Cockpit · the New call card (ReadyToCallCard, CK §3.3 and §7.1): ContactField, Lead details with
   "Edit for this call", the inline readiness (GateChecklist context="inline" collapse="passing"), the kind line and the
   sticky footer. Flow, Voice and Language pickers are in cockpit-pickers.js. */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  var NC = CK.newcall = {};
  var V, esc, st, $;
  function init() { V = CK.V; esc = CK.esc; st = CK.st; $ = CK.$; }

  /* ---------- card frame ---------- */
  NC.render = function () {
    init();
    var card = d.getElementById('ck-card');
    card.setAttribute('aria-labelledby', 'ck-card-h'); card.removeAttribute('aria-label');
    card.innerHTML =
      '<div class="ck-card-scroll" id="ck-nc-scroll"><div class="ck-pad">' +
        '<h2 class="ck-card-title" id="ck-card-h" tabindex="-1" data-focus-target>New call</h2>' +
        '<div class="ck-form" id="ck-nc-form"' + (st.loading ? ' aria-busy="true"' : '') + '>' + (st.loading ? skeleton() : formHtml()) + '</div>' +
      '</div></div>' +
      '<div class="ck-foot" id="ck-nc-foot">' +
        '<p class="ck-kind status" id="ck-kind"></p><span class="sr-only" id="ck-kind-sr"></span>' +
        '<div class="ck-actions">' +
          '<button type="button" class="btn ck-talk" id="ck-talk" aria-describedby="ck-talk-desc ck-talk-why">' + V.icon('mic') + 'Talk in browser</button>' +
          '<button type="button" class="btn btn--primary ck-go" id="ck-call" aria-describedby="ck-kind-sr ck-why">' + V.icon('phone') + '<span class="u-hide-phone" id="ck-call-full">Place call…</span><span class="u-only-phone" id="ck-call-short">Place call…</span></button>' +
        '</div>' +
        '<p class="ck-why status status--wrap" id="ck-why" hidden></p><p class="ck-why status status--wrap" id="ck-talk-why" hidden></p>' +
        '<span class="sr-only" id="ck-talk-desc">Uses your microphone. Nobody else is called.</span>' +
      '</div>';
    V.initAll(card);
    if (!st.loading) { wireContact(); CK.pickers.wire(); }
    card.querySelector('#ck-talk').addEventListener('click', onTalk);
    card.querySelector('#ck-call').addEventListener('click', onCall);
    NC.sync();
  };
  function skeleton() {
    var f = function (w2) { return '<div class="ck-sk-field"><span class="sk-line sk-line--meta"><span class="sk sk--meta ck-sk-' + w2 + '"></span></span><span class="sk sk--block ck-sk-box"></span></div>'; };
    return f('s') + f('m') + f('m') + f('s') + '<div class="ck-sk-field"><span class="sk-line"><span class="sk sk--title ck-sk-s"></span></span><span class="sk-line"><span class="sk ck-sk-l"></span></span><span class="sk-line"><span class="sk ck-sk-m"></span></span></div>';
  }
  function formHtml() {
    return '<div class="field ck-contact" id="ck-contact-field">' +
        '<label class="field-label" for="ck-contact">Contact</label>' +
        '<div class="input" id="ck-contact-box">' + V.icon('search') +
          '<input id="ck-contact" type="text" role="combobox" aria-expanded="false" aria-controls="ck-contact-lb" aria-autocomplete="list" aria-describedby="ck-contact-hint ck-contact-sr" autocomplete="off" spellcheck="false" placeholder="Name or number…" enterkeyhint="done">' +
          '<button type="button" class="input-btn" id="ck-contact-clear" aria-label="Clear contact" hidden>' + V.icon('x', 'sm') + '</button>' +
          '<kbd class="kbd" data-single-key aria-hidden="true">/</kbd>' +
        '</div>' +
        '<p class="field-hint" id="ck-contact-hint">Search leads by name or number, or type a number.</p>' +
        '<p class="field-error" id="ck-contact-err" role="alert" hidden></p><span class="sr-only" id="ck-contact-sr">Indian number, +91</span>' +
        '<p class="field-hint ck-self" id="ck-self-row"><button type="button" class="btn btn--link" id="ck-self-link">' + V.icon('smartphone', 'sm') + 'Use my phone · <span class="phone-text phone-text--sm" translate="no">' + esc(CK.self.masked) + '</span></button></p>' +
      '</div>' +
      '<div id="ck-lead"></div>' +
      '<div id="ck-flow-field"></div>' +
      '<button type="button" class="ck-disc u-only-phone" id="ck-vl-btn" aria-haspopup="dialog" aria-expanded="false"><span class="ck-disc-t">Voice and language</span><span class="ck-disc-v" id="ck-vl-sum"></span>' + V.icon('chevron-right', 'sm', { className: 'ck-chev' }) + '</button>' +
      '<div class="ck-vl u-hide-phone" id="ck-vl-home"></div>' +
      '<section class="ck-ready" id="ck-ready" aria-labelledby="ck-ready-h"></section>';
  }

  /* ---------- ContactField (CK §7.3): one input that searches leads or takes a number ---------- */
  var lb = null, entry = null, activeIdx = -1;
  NC.parseNumber = function (raw) {
    var dg = String(raw || '').replace(/[\s\-().]/g, '');
    if (!/^\+?\d+$/.test(dg)) return null;
    dg = dg.replace(/^\+/, ''); if (dg.length === 12 && dg.indexOf('91') === 0) dg = dg.slice(2); if (dg.length === 11 && dg[0] === '0') dg = dg.slice(1);
    return /^[6-9]\d{9}$/.test(dg) ? { e164: '+91' + dg, display: '+91 ' + dg.slice(0, 5) + ' ' + dg.slice(5) } : null;
  };
  function input() { return d.getElementById('ck-contact'); }
  function options(qs) {
    var qv = qs.trim().toLowerCase(), digits = qv.replace(/[^\d]/g, ''), html = '', items = [];
    function opt(val, label, desc, tags, icon) { items.push(val); return '<div class="option option--2" role="option" id="ck-co-' + items.length + '" data-value="' + esc(val) + '" aria-selected="false">' + (icon || '') + '<span class="option-main"><span class="option-label" translate="no">' + label + '</span><span class="option-desc">' + desc + '</span></span>' + (tags ? '<span class="option-tags">' + tags + '</span>' : '') + '</div>'; }
    if (!qv || 'my phone'.indexOf(qv) >= 0 || (digits && CK.self.masked.replace(/\D/g, '').indexOf(digits) >= 0 && digits.length <= 4)) {
      html += '<div role="group" aria-labelledby="ck-co-g1"><span class="listbox-group-label" id="ck-co-g1">You</span>' + opt('self', 'My phone', '<span class="phone-text phone-text--sm">' + esc(CK.self.masked) + '</span> · Verified', '<span class="tag tag--outline">' + V.icon('flask-conical', 'xs') + 'Test call</span>', V.icon('smartphone')) + '</div>';
    }
    if (!CK.has('no-leads')) {
      var hits = CK.leads.filter(function (l) { return !qv || l.name.toLowerCase().indexOf(qv) >= 0 || (digits.length >= 2 && l.phone.last4.indexOf(digits) >= 0) || String(l.no).indexOf(digits || '#') >= 0; });
      if (!qv) hits = hits.filter(function (l) { return l.callbackAt || l.status === 'new'; });
      hits = hits.slice(0, qv ? 8 : 5);
      if (hits.length) html += '<div role="group" aria-labelledby="ck-co-g2"><span class="listbox-group-label" id="ck-co-g2">' + (qv ? 'Leads' : 'Leads · callbacks and new') + '</span>' + hits.map(function (l) {
        return opt('lead:' + l.id, hl(l.name, qv), '<span class="phone-text phone-text--sm">' + esc(l.phone.masked) + '</span> · ' + esc(l.city) + ' · ' + esc(V.langByCode(l.language).name), V.ui.statusTag('lead', l.status));
      }).join('') + '</div>';
    }
    var num = NC.parseNumber(qs);
    if (digits.length >= 5 && /^[\d\s+\-()]+$/.test(qs.trim())) {
      html += '<div role="group" aria-labelledby="ck-co-g3"><span class="listbox-group-label" id="ck-co-g3">Number</span>' + (num
        ? opt('num:' + num.e164, 'Call ' + esc(num.display), num.e164.slice(-4) === '4821' ? 'Already a lead · Aarav Mehta' : 'Not in your leads · a real call', '', V.icon('phone'))
        : '<div class="listbox-empty">Keep typing: a 10-digit mobile number, like 98765 43210.</div>') + '</div>';
    }
    if (!items.length && !num) html += CK.has('no-leads') && !qv ? '<div class="listbox-empty">No leads yet. <a href="leads.html?import=1">Import leads…</a></div>' : '<div class="listbox-empty">No leads match ‘' + esc(qs.trim()) + '’. Type a 10-digit number to call it.</div>';
    if (CK.has('no-leads') && qv && !num && items.length) html += '<div class="listbox-empty">No leads yet. <a href="leads.html?import=1">Import leads…</a></div>';
    return { html: html, count: items.length };
  }
  function hl(name, qv) { var i = qv ? name.toLowerCase().indexOf(qv) : -1; return i < 0 ? esc(name) : esc(name.slice(0, i)) + '<b>' + esc(name.slice(i, i + qv.length)) + '</b>' + esc(name.slice(i + qv.length)); }
  function opts() { return lb ? CK.$$('[role="option"]', lb) : []; }
  function setActive(i) {
    var o = opts(); activeIdx = Math.max(-1, Math.min(o.length - 1, i));
    o.forEach(function (x, k) { x.classList.toggle('is-active', k === activeIdx); });
    if (activeIdx >= 0) { input().setAttribute('aria-activedescendant', o[activeIdx].id); o[activeIdx].scrollIntoView({ block: 'nearest' }); } else input().removeAttribute('aria-activedescendant');
  }
  function fill() {
    var r = options(st.target ? '' : input().value); lb.innerHTML = r.html; setActive(input().value && r.count ? 0 : -1);
    clearTimeout(fill.t); fill.t = setTimeout(function () { V.announce(r.count + (r.count === 1 ? ' result' : ' results'), { dedupeKey: 'ck-contact' }); }, 400);
  }
  function openList() {
    if (entry && !entry.closed) { fill(); return; }
    if (!lb) { lb = CK.h('<div class="listbox listbox--wide ck-contact-lb" id="ck-contact-lb" role="listbox" aria-label="Contacts" hidden></div>'); d.body.appendChild(lb); lb.addEventListener('mousedown', function (e) { if (!e.target.closest('a')) e.preventDefault(); }); lb.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (o) pick(o.getAttribute('data-value')); }); }
    fill();
    entry = V.util.float(lb, d.getElementById('ck-contact-box'), { kind: 'popover', placement: 'bottom-start', sheetOnPhone: false });
    lb.style.width = d.getElementById('ck-contact-box').offsetWidth + 'px';
    input().setAttribute('aria-expanded', 'true');
  }
  function closeList() { if (entry && !entry.closed) entry.close('x'); entry = null; if (input()) { input().setAttribute('aria-expanded', 'false'); input().removeAttribute('aria-activedescendant'); } }
  NC.setTarget = function (t, o) {
    init();
    o = o || {};
    st.target = t; st.contactError = null; st.overrides = null; NC.editing = false;
    var el = input();
    if (el) { el.value = t ? (t.kind === 'lead' ? t.lead.name + ' · ' + t.lead.phone.masked : t.kind === 'self' ? 'My phone · ' + CK.self.masked : t.display) : ''; }
    CK.url({ lead: t && t.kind === 'lead' ? t.lead.id : null, target: t && t.kind === 'self' ? 'self' : null, 'new': t ? 1 : null });
    if (t && t.kind === 'number') CK.session.set('number', t.e164); else CK.session.remove('number');
    NC.sync(); if (CK.feed) CK.feed.render();
    if (!o.silent) { var s = CK.summary(CK.readiness(CK.kindOf(t), 'card')); if (s.tone === 'blocked') CK.announceState(s.text.replace(' · ', '. ')); }
  };
  function pick(val) {
    if (!val) return; closeList();
    if (val === 'self') NC.setTarget({ kind: 'self' });
    else if (val.indexOf('lead:') === 0) NC.setTarget({ kind: 'lead', lead: CK.leadById(val.slice(5)) });
    else if (val.indexOf('num:') === 0) { var n = NC.parseNumber(val.slice(4)); NC.setTarget({ kind: 'number', e164: n.e164, display: n.display }); }
    input().focus();
  }
  function validate() {
    var v = input().value.trim();
    if (st.target || !v) { st.contactError = null; }
    else { var n = NC.parseNumber(v); if (n) { NC.setTarget({ kind: 'number', e164: n.e164, display: n.display }, { silent: true }); return; } st.contactError = 'Enter a 10-digit mobile number, like 98765 43210.'; }
    NC.sync();
  }
  function wireContact() {
    var el = input(), clear = d.getElementById('ck-contact-clear');
    el.addEventListener('input', function () { if (st.target) { st.target = null; st.overrides = null; CK.url({ lead: null, target: null }); NC.sync(); CK.feed && CK.feed.render(); } st.contactError = null; syncContact(); openList(); });
    el.addEventListener('focus', function () { if (st.target) el.select(); });
    el.addEventListener('click', function () { if (!st.target && !(entry && !entry.closed)) openList(); });
    el.addEventListener('blur', function () { setTimeout(function () { if (d.activeElement !== el) { closeList(); validate(); } }, 120); });
    el.addEventListener('keydown', function (e) {
      var open = entry && !entry.closed;
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) openList(); else setActive(activeIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (open) setActive(activeIdx - 1); }
      else if (e.key === 'Enter') { if (open && activeIdx >= 0) { e.preventDefault(); pick(opts()[activeIdx].getAttribute('data-value')); } else { e.preventDefault(); closeList(); validate(); } }
      else if (e.key === 'Escape') { if (open) { e.preventDefault(); e.stopPropagation(); closeList(); } else if (el.value) { e.preventDefault(); e.stopPropagation(); NC.setTarget(null); } }
      else if (e.key === 'Tab') closeList();
    });
    clear.addEventListener('click', function () { NC.setTarget(null); el.focus(); });
    d.getElementById('ck-self-link').addEventListener('click', function () { NC.setTarget({ kind: 'self' }); d.getElementById('ck-call').focus(); });
    if (st.target) NC.setTarget(st.target, { silent: true });
  }
  function syncContact() {
    var el = input(); if (!el) return;
    var has = !!el.value;
    d.getElementById('ck-contact-clear').hidden = !has;
    d.getElementById('ck-self-row').hidden = has || !!st.target;
    var err = d.getElementById('ck-contact-err');
    err.hidden = !st.contactError; err.innerHTML = st.contactError ? V.icon('circle-alert', 'sm') + esc(st.contactError) : '';
    el.setAttribute('aria-invalid', st.contactError ? 'true' : 'false');
    el.setAttribute('aria-describedby', (st.contactError ? 'ck-contact-err ' : '') + 'ck-contact-hint ck-contact-sr');
  }

  /* ---------- Lead details (sourced or absent, D7) + Edit for this call (§3.3.1) ---------- */
  var FIELDS = [['city', 'City'], ['budget', 'Budget'], ['unit', 'Unit interest'], ['day', 'Preferred day']];
  function leadVal(l, k) { var o = st.overrides || {}; if (o[k] != null && o[k] !== '') return { v: o[k], local: true }; return { v: k === 'day' ? null : l[k], local: false }; }
  NC.leadRows = function (l) {
    init();
    var rows = '<div class="kv-row"><dt>Status</dt><dd>' + V.ui.statusTag('lead', l.status) + '</dd></div>', n = 0;
    FIELDS.forEach(function (f) {
      var x = leadVal(l, f[0]);
      if (f[0] === 'city') rows += '<div class="kv-row"><dt>' + f[1] + '</dt><dd>' + (x.v ? esc(x.v) + ' <span class="kv-src">' + (x.local ? 'for this call' : 'from Leads') + '</span>' : '<span class="kv-empty">Not captured</span>') + '</dd></div>';
      if (x.v && !x.local) n += 1;
      if (f[0] === 'city') rows += '<div class="kv-row"><dt>Language</dt><dd>' + V.ui.langMark(l.language, 'name') + '</dd></div><div class="kv-row"><dt>Last call</dt><dd>' + (l.lastCall ? esc(V.fmt.when(l.lastCall.at, { time: true }) + ' · ' + l.lastCall.outcome) : '<span class="kv-empty">No calls yet</span>') + '</dd></div>';
      else rows += '<div class="kv-row"><dt>' + f[1] + '</dt><dd>' + (x.v ? esc(x.v) + (x.local ? ' <span class="kv-src">for this call</span>' : '') : '<span class="kv-empty">Not captured</span>') + '</dd></div>';
    });
    return { html: '<dl class="kv">' + rows + '</dl>', count: n + 2 };
  };
  function renderLead() {
    var box = d.getElementById('ck-lead'); if (!box) return;
    var t = st.target;
    if (!t || t.kind !== 'lead') { box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    var l = t.lead, r = NC.leadRows(l), open = box.getAttribute('data-open') === 'true';
    var body = NC.editing ? editForm(l) : r.html + '<button type="button" class="btn btn--link ck-edit-link" id="ck-ld-edit">' + V.icon('square-pen', 'sm') + 'Edit for this call…</button>';
    box.className = 'ck-block ck-lead';
    var ae = d.activeElement, keepId = ae && box.contains(ae) && ae.id ? ae.id : null;   /* R3C-07: refocus the same control after the re-render */
    box.innerHTML = '<div class="ck-block-head"><h3 class="ck-h3"><span class="u-hide-phone">Lead details</span><button type="button" class="ck-disc ck-disc--h u-only-phone" aria-expanded="' + open + '" aria-controls="ck-ld-body"><span class="ck-disc-t">Lead details</span><span class="ck-disc-v">' + r.count + ' from Leads</span>' + V.icon('chevron-down', 'sm', { className: 'ck-chev' }) + '</button></h3>' +
      '<span class="ck-head-end"><span class="save" id="ck-ld-save" hidden></span><a class="ck-link u-hide-phone" href="leads.html?lead=' + esc(l.id) + '" target="_blank" rel="noopener">Open lead' + CK.srOpenNew + '</a></span></div>' +
      '<div class="ck-ld-body" id="ck-ld-body">' + body + '</div>';
    V.initAll(box);
    var disc = box.querySelector('.ck-disc'); disc.addEventListener('click', function () { var o = disc.getAttribute('aria-expanded') !== 'true'; disc.setAttribute('aria-expanded', o); box.setAttribute('data-open', o); });
    var ed = box.querySelector('#ck-ld-edit'); if (ed) ed.addEventListener('click', function () { NC.editing = true; renderLead(); var f = box.querySelector('input'); if (f) f.focus(); });
    var form = box.querySelector('form'); if (form) wireEdit(form, l);
    if (keepId && !d.getElementById(keepId) || keepId && ae !== d.activeElement) { var kn = d.getElementById(keepId) || box.querySelector('#ck-ld-edit') || box.querySelector('.ck-h3'); if (kn) { if (!kn.matches('a,button,input,select,textarea,[tabindex]')) kn.setAttribute('tabindex', '-1'); kn.focus({ preventScroll: true }); } }
    if (NC.saveChip) { var s = box.querySelector('#ck-ld-save'); s.hidden = false; V.saveState.set(s, NC.saveChip.state, { at: NC.saveChip.at ? V.fmt.time(NC.saveChip.at) : undefined, tooltip: NC.saveChip.state === 'error' ? 'Retry saving these details to the lead.' : 'These details are saved to the lead in Leads.', silent: true }); }
  }
  function editForm(l) {
    return '<form class="ck-edit" id="ck-edit" novalidate aria-label="Edit lead details for this call">' + FIELDS.map(function (f) {
      var x = leadVal(l, f[0]);
      return '<div class="field"><label class="field-label" for="ck-ed-' + f[0] + '">' + f[1] + '</label><div class="input input--sm"><input id="ck-ed-' + f[0] + '" name="' + f[0] + '" value="' + esc(x.v || '') + '" autocomplete="off"></div></div>';
    }).join('') + '<label class="check check--dense"><input type="checkbox" class="cb" id="ck-ed-save"><span class="check-text">Also save to <span translate="no">' + esc(l.name) + '</span></span></label>' +
      '<div class="ck-edit-acts"><button type="submit" class="btn btn--sm" id="ck-ed-use">Use for this call</button><button type="button" class="btn btn--sm btn--tertiary" id="ck-ed-cancel">Cancel</button></div></form>';
  }
  function wireEdit(form, l) {
    var cb = form.querySelector('#ck-ed-save'), use = form.querySelector('#ck-ed-use');
    cb.addEventListener('change', function () { use.textContent = cb.checked ? 'Use and save to lead' : 'Use for this call'; });
    form.querySelector('#ck-ed-cancel').addEventListener('click', function () { NC.editing = false; renderLead(); d.getElementById('ck-ld-edit').focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = {}; FIELDS.forEach(function (f) { var v = form.querySelector('[name="' + f[0] + '"]').value.trim(), base = f[0] === 'day' ? null : l[f[0]]; if (v !== (base || '')) o[f[0]] = v; });
      st.overrides = o; NC.editing = false; var save = cb.checked;
      if (save) { NC.saveChip = { state: 'saving' }; runSave(l, o); } else NC.saveChip = null;
      renderLead(); d.getElementById('ck-ld-edit').focus();
      V.announce(save ? 'Using these details for this call. Saving to the lead.' : 'Using these details for this call only.');
    });
  }
  function runSave(l, o) {
    setTimeout(function () {
      if (CK.has('lead-save-fail')) { NC.saveChip = { state: 'error' }; renderLead(); V.announce("Couldn’t save to the lead.", { politeness: 'assertive' });
        var chip = d.getElementById('ck-ld-save'); if (chip) chip.addEventListener('vaani:retry', function () { CK.demo['lead-save-fail'] = false; NC.saveChip = { state: 'saving' }; renderLead(); runSave(l, o); }); return; }
      Object.keys(o).forEach(function (k) { if (k !== 'day') l[k] = o[k]; });
      NC.saveChip = { state: 'saved', at: CK.nowIso() }; renderLead(); V.announce('Saved to ' + l.name + '.');
    }, 900);
  }

  /* ---------- readiness (inline, collapse passing; "Show all" remembered per user) ---------- */
  function renderReady(kind, rows) {
    var box = d.getElementById('ck-ready'); if (!box) return;
    var shown = rows.filter(function (r) { return r.kind !== 'pass'; }), pass = rows.filter(function (r) { return r.kind === 'pass'; });
    var all = V.util.store.get('vaani:cockpit:checks') === 'all', s = CK.summary(rows);
    box.innerHTML = '<h3 class="ck-h3" id="ck-ready-h">Readiness</h3><div role="status" class="ck-ready-sum">' + CK.sumHtml(s) + '</div>' +
      (shown.length ? '<ul class="gate-list" role="list">' + shown.map(CK.rowHtml).join('') + '</ul>' : '') +
      (pass.length ? '<button type="button" class="btn btn--link ck-showall" id="ck-showall" aria-expanded="' + all + '" aria-controls="ck-ready-pass">' + (all ? 'Hide passing checks' : 'Show all ' + rows.length + ' checks') + '</button><ul class="gate-list" role="list" id="ck-ready-pass"' + (all ? '' : ' hidden') + '>' + pass.map(CK.rowHtml).join('') + '</ul>' : '');
    var b = box.querySelector('#ck-showall'); if (b) b.addEventListener('click', function () { V.util.store.set('vaani:cockpit:checks', all ? 'passing' : 'all'); renderReady(kind, rows); d.getElementById('ck-showall').focus(); });
  }
  function checkingReady() {
    var box = d.getElementById('ck-ready'); if (!box) return;
    box.innerHTML = '<h3 class="ck-h3" id="ck-ready-h">Readiness</h3><p class="status status--md status--progress" role="status">' + V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Checking…</p>';
  }

  /* ---------- footer: the kind line, both actions and their reasons ---------- */
  NC.state = function () {
    init();
    var t = st.target, kind = CK.kindOf(t), rows = st.loading ? [] : CK.readiness(kind, 'card');
    var p = { reason: null, tone: 'warn', hidden: false, global: null }, tk = { reason: null };
    if (st.loading) { p.reason = tk.reason = 'Checking readiness…'; p.tone = 'plain'; }
    else if (!CK.flow()) { p.reason = tk.reason = CK.has('flows-failed') ? "Couldn’t load flows." : 'Create a flow first.'; }
    else {
      if (!st.online) tk.reason = "You’re offline.";
      else if (st.mic === 'blocked') tk.reason = "Microphone blocked. Allow it in your browser’s site settings, then Retry.";
      else if (st.mic === 'none') tk.reason = 'No microphone found. Connect one, then Retry.';
      else if (st.micSession) tk.reason = "You’re already talking on " + st.micSession + '.';
      if (st.role !== 'admin') p.hidden = true;
      else if (st.contactError) p.reason = st.contactError;
      else if (!t) { var g0 = rows.filter(function (r) { return r.global && r.kind === 'blocking'; })[0]; if (g0) { p.reason = g0.text; p.global = g0; } else { p.reason = 'Choose a lead or enter a number.'; p.tone = 'plain'; } }
      else { var b = rows.filter(function (r) { return r.kind === 'blocking' || r.kind === 'unknown'; })[0]; if (b) { p.reason = b.kind === 'unknown' ? "Can’t confirm your balance yet." : b.text; p.global = b.global ? b : null; } }
    }
    return { kind: kind, rows: rows, primary: p, talk: tk };
  };
  NC.sync = function () {
    init();
    if (st.selected !== 'new' || !d.getElementById('ck-call')) return;
    var s = NC.state(), t = st.target, lbl = CK.primaryLabel(t), desc = CK.describe(s.kind, t);
    if (!st.loading) { syncContact(); renderLead(); CK.pickers.sync(); if (!CK.flow() && CK.has('flows-failed')) { /* the flow field carries the error */ } renderReady(s.kind, s.rows); } else checkingReady();
    var kindEl = d.getElementById('ck-kind');
    kindEl.hidden = !desc.line || !!s.primary.reason && !t || !!s.primary.hidden;   /* R3C-11: the kind line describes the primary; it hides with it */
    kindEl.innerHTML = desc.line ? CK.kindTag(s.kind) + '<span>' + esc(desc.line) + '</span>' : '';
    d.getElementById('ck-kind-sr').textContent = desc.sr;
    var call = d.getElementById('ck-call'), talk = d.getElementById('ck-talk');
    d.getElementById('ck-call-full').textContent = lbl.full; d.getElementById('ck-call-short').textContent = lbl.short;
    call.hidden = s.primary.hidden;
    setBlocked(call, s.primary.reason, 'ck-why', s.primary.tone);
    setBlocked(talk, s.talk.reason, 'ck-talk-why', 'warn');
    CK.$('#ck-talk-why').hidden = !s.talk.reason || s.talk.reason === s.primary.reason;
    NC.last = s;
  };
  function setBlocked(btn, reason, whyId, tone) {
    var why = d.getElementById(whyId);
    if (reason) { btn.setAttribute('aria-disabled', 'true'); btn.setAttribute('data-tooltip', reason); } else { btn.removeAttribute('aria-disabled'); btn.removeAttribute('data-tooltip'); }
    why.hidden = !reason; why.className = 'ck-why status status--wrap' + (tone === 'plain' ? ' status--plain' : ' status--warning');
    why.innerHTML = reason ? V.icon(tone === 'plain' ? 'info' : 'triangle-alert', 'sm') + '<span>' + esc(reason) + (whyId === 'ck-talk-why' && CK.st.mic === 'blocked' ? ' <button type="button" class="btn btn--link" data-ck-act="retry-mic">Retry</button>' : '') + '</span>' : '';
  }

  /* ---------- actions ---------- */
  function onTalk() {
    var b = d.getElementById('ck-talk');
    if (b.getAttribute('aria-disabled') === 'true') { V.announce(b.getAttribute('data-tooltip') || 'Not available'); return; }
    CK.call.startBrowser(b);
  }
  function onCall() { NC.tryCall(d.getElementById('ck-call')); }
  /* The primary or C: opens the gate, never dials (D3). A blocked primary says why; a global blocker offers its fix. */
  NC.tryCall = function (btn, fromKey) {
    init();
    var s = NC.state();
    if (s.primary.hidden) { V.announce("Your role can’t place phone calls."); return; }
    if (s.primary.reason) {
      V.announce(s.primary.reason);
      var g = s.primary.global;
      if (g && g.act) V.toast.info(g.text, { action: { label: g.act.label, onClick: function () { if (g.act.href) w.location.href = g.act.href; else CK.act(g.act.run); } } });
      if ((!st.target || st.contactError) && (fromKey || !g)) { var el = input(); if (el) { el.focus(); if (!st.contactError && !el.value) { st.contactError = null; } } }
      return;
    }
    CK.gate.open(btn);
  };
})(window, document);
