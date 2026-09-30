/* Vaani Labs prototype · pages/leads-forms.js — New lead dialog (03 §6.11, core §4.1 PhoneInput, §8.2 validation),
   Export popover (§6.13), "Add note to n leads" and CSV downloads (template, export, skipped rows). */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, L = w.VaaniLeads, S = L.S, DATA = V.data;

  /* ---------- downloads ---------- */
  function csvCell(v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  L.download = function (name, text) { var blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }), a = d.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; d.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  var EXPORT = { name: ['Name', function (l) { return l.name; }], phone: ['Phone', function (l) { return l.phone.masked; }], status: ['Status', function (l) { return V.statusDef('lead', l.status)[0]; }],
    last_call: ['Last call', function (l) { return l.lastCall ? (l.lastCall.outcome || 'Timed out') + ' · ' + F.whenAbs(l.lastCall.at) : ''; }], interest: ['Interest', function (l) { return l.interest; }], language: ['Language', function (l) { return l.language ? V.langByCode(l.language).name : ''; }],
    flow: ['Flow', function (l) { return l.flowId ? L.flowLabel(l.flowId) : 'Workspace default'; }], callback: ['Callback', function (l) { return l.callbackAt ? F.whenAbs(l.callbackAt) : ''; }], created: ['Created', function (l) { return F.date(l.createdAt); }], source: ['Source', function (l) { return l.source; }],
    owner: ['Owner', function (l) { return l.owner || ''; }], city: ['City', function (l) { return l.city || ''; }], email: ['Email', function (l) { return l.email || ''; }], calls: ['Calls', function (l) { return l.calls; }], budget: ['Budget', function (l) { return l.budget || ''; }], unit: ['Unit', function (l) { return l.unit || ''; }] };
  L.exportRows = function (list, name, msg, cols) {
    cols = cols || Object.keys(EXPORT); var lines = [cols.map(function (c) { return csvCell(EXPORT[c][0]); }).join(',')];
    list.forEach(function (l) { lines.push(cols.map(function (c) { return csvCell(EXPORT[c][1](l)); }).join(',')); });
    L.download(name, lines.join('\n')); V.toast.success(msg || 'Exported ' + L.plural(list.length, 'lead'));
  };
  L.downloadTemplate = function () { L.download('leads-template.csv', 'Name,Phone,Email,City,Language,Source\nAarav Mehta,98765 43210,aarav.mehta@mail.example,Pune,Hindi,Website\n'); V.toast.success('Downloaded leads-template.csv'); };

  /* ---------- Export popover ---------- */
  var exp = { scope: 'view' };
  L.openExport = function (trigger, o) {
    o = o || {}; var q = L.last, nSel = L.selCount();
    exp.scope = o.selected && nSel ? 'selected' : 'view';
    var radio = function (name, val, label, checked, extra) { return '<label class="check check--dense"><input type="radio" class="radio" name="' + name + '" value="' + val + '"' + (checked ? ' checked' : '') + (extra || '') + '><span class="check-text"><span>' + label + '</span></span></label>'; };
    $('#leads-exp-body').innerHTML =
      '<fieldset class="fieldset"><legend>Which leads</legend>' + radio('lx-scope', 'view', 'This view <span class="u-fg-3 num">(' + F.count(q.total) + ')</span>', exp.scope === 'view') + (nSel ? radio('lx-scope', 'selected', 'Selected <span class="u-fg-3 num">(' + F.count(nSel) + ')</span>', exp.scope === 'selected') : '') + radio('lx-scope', 'all', 'All leads <span class="u-fg-3 num">(' + F.count(q.all) + ')</span>', false) + '</fieldset>' +
      '<div class="field"><span class="field-label" id="lx-fmt-l">Format</span><div class="seg seg--sm" role="radiogroup" aria-labelledby="lx-fmt-l" id="lx-fmt"><button type="button" role="radio" aria-checked="true" data-value="csv">CSV</button><button type="button" role="radio" aria-checked="false" data-value="xlsx">XLSX</button></div></div>' +
      '<fieldset class="fieldset"><legend>Columns</legend>' + radio('lx-cols', 'visible', 'Visible columns', true) + radio('lx-cols', 'all', 'All fields', false) + '</fieldset>' +
      '<fieldset class="fieldset"><legend>Phone numbers</legend>' + radio('lx-phone', 'masked', 'Masked', true) + radio('lx-phone', 'full', L.isAdmin() ? 'Full numbers <span class="check-desc">Logged in Activity &amp; audit</span>' : 'Full numbers · admins only', false, L.isAdmin() ? '' : ' disabled') + '</fieldset><p class="field-hint" id="lx-note" hidden>This prototype exports masked numbers only.</p>';
    V.initAll($('#leads-exp-body')); syncExp();
    V.popover.open(trigger, 'leads-exp-pop', { placement: 'bottom-end' });
  };
  function expList() { var sc = ($('input[name="lx-scope"]:checked') || {}).value || 'view'; return sc === 'selected' ? L.selectedLeads() : sc === 'all' ? L.all.filter(function (l) { return !l.deleted; }) : L.last.rows; }
  function syncExp() { var n = expList().length; $('#leads-exp-go').textContent = 'Export ' + L.plural(n, 'lead'); $('#lx-note').hidden = (($('input[name="lx-phone"]:checked') || {}).value) !== 'full'; }

  /* ---------- New lead ---------- */
  function norm(v) { var raw = v.trim(); if (/[a-z]/i.test(raw)) return { err: 'Enter a 10-digit mobile number, like 98765 43210.' }; var dg = raw.replace(/[\s\-().]/g, '').replace(/^\+91/, ''); if (/^\+/.test(dg)) return { err: 'Enter an Indian number. International numbers aren’t supported for leads yet.' };
    if (dg.length === 12 && dg.indexOf('91') === 0) dg = dg.slice(2); else if (dg.length === 11 && dg[0] === '0') dg = dg.slice(1);
    if (!/^\d+$/.test(dg)) return { err: 'Enter a 10-digit mobile number, like 98765 43210.' };
    if (dg.length !== 10) return { err: 'This number has ' + dg.length + ' digit' + (dg.length === 1 ? '' : 's') + '. Mobile numbers have 10.' };
    if (/^[6-9]/.test(dg)) return { e164: '+91' + dg, show: dg.slice(0, 5) + ' ' + dg.slice(5), last4: dg.slice(-4) };
    if (/^[1-5]/.test(dg)) return { e164: '+91' + dg, show: dg.slice(0, 2) + ' ' + dg.slice(2, 6) + ' ' + dg.slice(6), last4: dg.slice(-4) };
    return { err: 'Enter a 10-digit mobile number, like 98765 43210.' }; }
  var nl = { touched: {} };
  function fld(id) { return $('#' + id); }
  function setErr(id, msg) { var inp = fld(id), e = fld(id + '-e'), h = fld(id + '-h'); if (msg) { inp.setAttribute('aria-invalid', 'true'); e.innerHTML = V.icon('circle-alert') + '<span>' + msg + '</span>'; e.hidden = false; if (h) h.hidden = true; inp.setAttribute('aria-describedby', id + '-e' + (id === 'nl-phone' ? ' nl-phone-sr' : '')); } else { inp.removeAttribute('aria-invalid'); e.hidden = true; e.innerHTML = ''; if (h) h.hidden = false; inp.setAttribute('aria-describedby', (h ? id + '-h' : '') + (id === 'nl-phone' ? ' nl-phone-sr' : '')); } }
  function validate(id, show) {
    var v = fld(id).value, msg = '';
    if (id === 'nl-name') msg = v.trim() ? '' : 'Enter the lead’s name.';
    if (id === 'nl-phone') { var p = norm(v); msg = !v.trim() ? 'Enter a phone number.' : p.err || ''; if (!msg && show) { fld(id).value = p.show; var dup = L.all.filter(function (l) { return l.base && l.phone.last4 === p.last4 && !l.deleted; })[0], h = fld('nl-phone-h'); h.innerHTML = dup ? 'This number is already a lead. <button type="button" class="btn btn--link" data-nl-open="' + dup.id + '">Open lead</button>' : '10-digit mobile, like 98765 43210'; } }
    if (id === 'nl-email') msg = !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email like name@company.com.';
    if (show) setErr(id, msg); return !msg;
  }
  function selV(id) { return fld(id).getAttribute('data-value'); }
  function resetForm(keep) {
    ['nl-name', 'nl-phone', 'nl-email', 'nl-city', 'nl-state', 'nl-note'].forEach(function (id) { var x = fld(id); if (x) { x.value = ''; x.removeAttribute('aria-invalid'); } var e = fld(id + '-e'); if (e) { e.hidden = true; } });
    fld('nl-phone-h').textContent = '10-digit mobile, like 98765 43210'; fld('nl-phone-h').hidden = false; $('#leads-new-err').innerHTML = ''; nl.touched = {};
    if (!keep) { setSel('nl-lang', 'none'); setSel('nl-source', 'Manual'); setSel('nl-flow', 'default'); }
    setSel('nl-status', 'new'); setSel('nl-owner', DATA.user.short);
    $('#leads-new').removeAttribute('data-dirty');
  }
  function setSel(id, v) { var t = fld(id), lb = fld(id + '-lb'), o = $('[data-value="' + v + '"]', lb); if (!o) return; t.setAttribute('data-value', v); $('.select-value', t).textContent = $('.option-label', o).textContent; $$('.option', lb).forEach(function (x) { x.setAttribute('aria-selected', x === o ? 'true' : 'false'); }); }
  L.openNewLead = function (trigger) { resetForm(); $('#nl-more').setAttribute('aria-expanded', 'false'); $('#nl-more-body').hidden = true; V.dialog.open('leads-new', { returnTo: trigger || $('#leads-new-btn') }); };
  function create(another) {
    if ($('#leads-new [aria-busy="true"]')) return;   /* a second press while creating does nothing */
    var ids = ['nl-name', 'nl-phone', 'nl-email'], bad = ids.filter(function (id) { return !validate(id, true); });
    if (bad.length) { fld(bad[0]).focus(); V.announce(bad.length === 1 ? 'Fix 1 field.' : 'Fix ' + bad.length + ' fields.', { politeness: 'assertive' }); return; }
    var btn = another ? $('#nl-another') : $('#nl-create'), label = btn.innerHTML; btn.setAttribute('aria-busy', 'true'); btn.setAttribute('aria-disabled', 'true'); btn.innerHTML = V.icon('loader-circle', 'md', { className: 'spinner' }) + 'Creating lead…'; V.dialog.setBusy('leads-new', true);
    setTimeout(function () {
      V.dialog.setBusy('leads-new', false); btn.removeAttribute('aria-busy'); btn.removeAttribute('aria-disabled'); btn.innerHTML = label;
      if (L.demo('create-fail')) { $('#leads-new-err').innerHTML = L.noticeHtml('danger', 'Couldn’t create the lead.', 'This number is already in Leads.', '<button type="button" class="notice-act" data-nl-open="lead_1042">Open existing lead</button>', { role: 'alert' }); $('#leads-new-err [data-nl-open]').focus(); return; }
      var p = norm(fld('nl-phone').value), name = fld('nl-name').value.trim(), no = L.nextNo(), lang = selV('nl-lang'), owner = selV('nl-owner'), flow = selV('nl-flow');
      var l = { id: 'lead_' + no, no: no, name: name, first: name.split(' ')[0], initials: V.ui.initials(name), city: fld('nl-city').value.trim() || null, state: fld('nl-state').value.trim(), phone: { masked: '+91 •••••• ' + p.last4, short: '•••• ' + p.last4, last4: p.last4 },
        status: selV('nl-status'), interest: null, language: lang === 'none' ? null : lang, flowId: flow === 'default' ? null : flow, owner: owner === 'none' ? null : owner, source: selV('nl-source'), importFile: null, email: fld('nl-email').value.trim() || null,
        createdAt: DATA.meta.now, lastCall: null, callbackAt: null, dnd: false, consent: true, notes: fld('nl-note').value.trim() ? [{ by: DATA.user.short, at: DATA.meta.now, text: fld('nl-note').value.trim() }] : [], reached: false, calls: 0 };
      L.all.unshift(l); L.byId[l.id] = l; L.render();
      var shown = L.last.rows.indexOf(l) >= 0;
      if (another) { resetForm(true); fld('nl-name').focus(); V.announce('Lead added'); nl.added = (nl.added || 0) + 1; return; }
      $('#leads-new').removeAttribute('data-dirty'); V.dialog.close('leads-new', 'confirm');
      if (shown) V.toast.success('Lead added', { action: { label: 'Open', onClick: function () { L.openLead(l.id); } } });
      else V.toast.success('Lead added. It’s hidden by your current filters.', { action: { label: 'Show', onClick: function () { L.S.view = 'all'; L.clearFilters(); L.openLead(l.id); } } });
    }, 700);
  }

  /* ---------- Add a note to n leads ---------- */
  var noteList = [];
  L.openBulkNote = function (list, trigger) { noteList = list; $('#leads-note-t').textContent = 'Add a note to ' + L.plural(list.length, 'lead'); $('#leads-note-text').value = ''; $('#leads-note-e').hidden = true; V.dialog.open('leads-note', { returnTo: trigger }); };

  L.initForms = function () {
    /* export */
    $('#leads-exp-pop').addEventListener('change', syncExp); $('#leads-exp-pop').addEventListener('vaani:change', syncExp);
    $('#leads-exp-go').addEventListener('click', function () {
      var list = expList(), fmt = ($('#lx-fmt [aria-checked="true"]') || {}).getAttribute ? $('#lx-fmt [aria-checked="true"]').getAttribute('data-value') : 'csv', cols = (($('input[name="lx-cols"]:checked') || {}).value === 'all') ? null : ['name', 'phone'].concat((L.shownCols || []).map(function (c) { return c.id; }).filter(function (c) { return c !== 'name' && c !== 'phone'; }));
      V.popover.close('leads-exp-pop');
      L.exportRows(list, 'leads-' + (S.view || 'all') + '-2026-09-27.csv', 'Exported ' + L.plural(list.length, 'lead') + (fmt === 'xlsx' ? ' (the prototype saves XLSX as CSV)' : ''), cols);
    });
    /* new lead: language options and the "More details" fields (State · Source · Status · Owner · Flow · Note) */
    var opt = function (list) { return list.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="false">' + (o[2] ? '<span class="lm-g" lang="' + esc(o[2].lang) + '" aria-hidden="true">' + esc(o[2].glyph) + '</span>' : '') + '<span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join(''); };
    var sel = function (id, label, list) { return '<div class="field field--medium"><span class="field-label" id="' + id + '-l">' + esc(label) + '</span><button type="button" class="select" data-select id="' + id + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v"></span>' + V.icon('chevron-down') + '</button><div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opt(list) + '</div></div>'; };
    $('#nl-lang-lb').innerHTML = opt([['none', 'Not set']].concat(DATA.languages.map(function (x) { return [x.code, x.name, x]; })));
    $('#nl-more-body').innerHTML = '<div class="field field--medium"><label class="field-label" for="nl-state">State <span class="field-opt">(optional)</span></label><div class="input"><input id="nl-state" autocomplete="off"></div></div>' +
      sel('nl-source', 'Source', L.SOURCES.filter(function (s) { return s !== 'Sample data' && s !== 'Import'; }).map(function (s) { return [s, s]; })) +
      sel('nl-status', 'Status', L.STATUS_ORDER.filter(function (s) { return s !== 'do_not_call'; }).map(function (s) { return [s, V.statusDef('lead', s)[0]]; })) +
      sel('nl-owner', 'Owner', ['Anika R.', 'Rohit S.', 'Dev M.', 'Farah K.', 'Kiran P.'].map(function (o) { return [o, o + (o === DATA.user.short ? ' (you)' : '')]; }).concat([['none', 'Unassigned']])) +
      sel('nl-flow', 'Flow', [['default', 'Workspace default · Site-visit qualifier v7']].concat(DATA.flows.filter(function (f) { return f.status === 'live'; }).map(function (f) { return [f.id, f.name + ' v' + f.live.version]; }))) +
      '<div class="field"><label class="field-label" for="nl-note">Note <span class="field-opt">(optional)</span></label><textarea class="textarea" id="nl-note" rows="2" placeholder="Asked for the brochure in Hindi…"></textarea></div>';
    V.initAll($('#leads-new'));
    /* new lead */
    var dlg = $('#leads-new');
    dlg.addEventListener('input', function (e) { dlg.setAttribute('data-dirty', 'true'); var id = e.target.id; if (id && fld(id + '-e') && !fld(id + '-e').hidden) validate(id, false) && setErr(id, ''); });
    dlg.addEventListener('focusout', function (e) { var id = e.target.id; if (['nl-name', 'nl-phone', 'nl-email'].indexOf(id) < 0) return; if (e.target.value !== '' || nl.touched[id]) { nl.touched[id] = true; validate(id, true); } });
    dlg.addEventListener('vaani:change', function () { dlg.setAttribute('data-dirty', 'true'); });
    /* delegated: the dialog’s inline discard state rebuilds the footer, so direct listeners would be lost */
    dlg.addEventListener('click', function (e) { if (e.target.closest('#nl-create')) create(false); else if (e.target.closest('#nl-another')) create(true); });
    $('#leads-new-form').addEventListener('submit', function (e) { e.preventDefault(); create(false); });
    $('#nl-more').addEventListener('click', function (e) { var b = e.currentTarget, on = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', on); $('#nl-more-body').hidden = !on; b.querySelector('svg').outerHTML = V.icon(on ? 'chevron-up' : 'chevron-down', 'sm'); });
    dlg.addEventListener('click', function (e) {
      var o = e.target.closest('[data-nl-open]'); if (o) { var id = o.getAttribute('data-nl-open'); dlg.removeAttribute('data-dirty'); V.dialog.close('leads-new', 'navigate'); L.openLead(id); return; }
      if (e.target.closest('[data-new-import]')) { if (dlg.getAttribute('data-dirty') === 'true') { V.dialog.close('leads-new', 'x'); return; } V.dialog.close('leads-new', 'replace'); L.openImport($('#leads-import-btn')); }
    });
    /* bulk note */
    $('#leads-note').addEventListener('click', function (e) { if (!e.target.closest('#leads-note-go')) return; var t = $('#leads-note-text'), tx = t.value.trim(); if (!tx) { t.setAttribute('aria-invalid', 'true'); $('#leads-note-e').hidden = false; t.focus(); return; } noteList.forEach(function (l) { l.notes.unshift({ by: DATA.user.short, at: DATA.meta.now, text: tx }); }); V.dialog.close('leads-note', 'confirm'); V.toast.success('Added a note to ' + L.who(noteList)); if (L.refreshSheet) L.refreshSheet(); });
    $('#leads-note-text').addEventListener('input', function (e) { $('#leads-note').setAttribute('data-dirty', e.target.value ? 'true' : 'false'); if (e.target.value.trim()) { e.target.removeAttribute('aria-invalid'); $('#leads-note-e').hidden = true; } });
  };
})(window, document);
