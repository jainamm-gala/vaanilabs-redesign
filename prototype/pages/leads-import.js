/* Vaani Labs prototype · pages/leads-import.js — Import leads (03 §6.12, §7.5): 1 choose a file (type and size
   checks, a real CSV is parsed in the browser) · 2 map columns with row checks · 3 importing with progress, result,
   stopped. Importing never places calls. A sample file is offered so reviewers can walk the flow without a CSV. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, L = w.VaaniLeads, S = L.S, DATA = V.data;
  var MAX = 5 * 1024 * 1024, I = null;
  var AS = [['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['city', 'City'], ['state', 'State'], ['language', 'Language'], ['source', 'Source'], ['status', 'Status'], ['owner', 'Owner'], ['callback', 'Callback'], ['custom', 'Custom field'], ['skip', 'Don’t import']];
  var SYN = { phone: ['phone', 'mobile', 'mobile no', 'mobile number', 'contact', 'contact number', 'number', 'whatsapp', 'फ़ोन', 'फोन'], name: ['name', 'full name', 'customer', 'customer name', 'lead', 'lead name'], email: ['email', 'e-mail', 'mail'], city: ['city', 'town', 'location'], state: ['state'], language: ['language', 'lang', 'bhasha'], source: ['source'], status: ['status'], owner: ['owner', 'agent', 'assigned to'], callback: ['callback', 'call back'] };

  function guess(h) { var k = h.trim().toLowerCase().replace(/[.:]/g, '').replace(/\s+/g, ' '); for (var f in SYN) if (SYN[f].indexOf(k) >= 0) return f; return /note|remark|comment/.test(k) ? 'skip' : 'custom'; }
  function parseCsv(text) {
    var rows = [], row = [], cur = '', q = false, i = 0, c;
    text = text.replace(/^﻿/, '');
    for (; i < text.length; i++) { c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(function (x) { return x.trim(); })) rows.push(row); row = []; } else cur += c; }
    if (cur || row.length) { row.push(cur); if (row.some(function (x) { return x.trim(); })) rows.push(row); }
    return rows;
  }
  function digits(v) { var dg = String(v || '').replace(/[\s\-().+]/g, ''); if (dg.length === 12 && dg.indexOf('91') === 0) dg = dg.slice(2); else if (dg.length === 11 && dg[0] === '0') dg = dg.slice(1); return dg; }
  function sampleFile() {
    var FIRST = ['Aditya', 'Prachi', 'Kunal', 'Meenal', 'Sagar', 'Rupal', 'Tanmay', 'Leela'], LAST = ['Rane', 'Shah', 'Joshi', 'Menon', 'Patel', 'Gokhale'];
    var head = ['Mobile No.', 'Customer', 'City', 'Lang', 'Budget', 'Agent notes'], phones = [], r = DATA._util.rng(1252), k;
    for (k = 0; k < 1212; k++) phones.push('97' + String(10000000 + k * 7919 % 89999999).slice(0, 8));   /* ready, unique */
    var extra = [];
    for (k = 0; k < 12; k++) extra.push('982001' + L.all[k].phone.last4);                                 /* already leads */
    for (k = 0; k < 18; k++) extra.push('');                                                                /* no phone */
    for (k = 0; k < 6; k++) extra.push('98' + (120 + k * 37));                                              /* not valid */
    for (k = 0; k < 4; k++) extra.push(phones[40 + k * 11]);                                                /* repeats */
    extra.forEach(function (p, i) { phones.splice(3 + Math.floor(r() * (phones.length - 3)), 0, p); });
    var rows = phones.map(function (ph, i) { return [ph ? ph.slice(0, 5) + ' ' + ph.slice(5) : '', FIRST[i % 8] + ' ' + LAST[(i * 5) % 6], ['Pune', 'Nashik', 'Thane', 'Mumbai'][i % 4], ['Hindi', 'Marathi', 'English', ''][i % 4], ['85 L', '1.2 Cr', '60 L'][i % 3], i % 5 ? '' : 'called twice']; });
    return { name: 'site-expo-sept.csv', size: 188 * 1024, head: head, rows: rows, sample: true };
  }
  /* row checks over every row (the server does this for the whole file in the product) */
  function rowChecks() {
    var pi = I.map.indexOf('phone'), res = { ready: [], none: [], bad: [], rep: [], dup: [] };
    if (pi < 0) return null;
    var seen = {}, base = {}; L.all.forEach(function (l) { if (l.base) base[l.phone.last4] = 1; });
    I.rows.forEach(function (row, n) { var dg = digits(row[pi]);
      if (!dg) res.none.push(n); else if (!/^\d{10}$/.test(dg) || !/^[1-9]/.test(dg)) res.bad.push(n); else if (seen[dg]) res.rep.push(n); else { seen[dg] = 1; if (/^982001/.test(dg) && base[dg.slice(-4)]) res.dup.push(n); else res.ready.push(n); } });
    return res;
  }
  function importCount(c) { return c.ready.length + (I.dupMode === 'skip' ? 0 : c.dup.length); }

  /* ---------- steps ---------- */
  /* StageProgress (overlay §14.3): done ✓ · current · to do; when the import ends every stage is done, or Importing failed ×. */
  function stepsHtml(n, end) {
    var names = ['Checking file', 'Mapping columns', 'Importing'], label = end === 'done' ? 'Import leads, finished' : end === 'failed' ? 'Import leads, stopped' : 'Import leads, step ' + n + ' of 3';
    return '<ol class="leads-steps" aria-label="' + label + '">' + names.map(function (s, i) {
      var st = i + 1 < n ? 'done' : i + 1 === n ? (end || 'current') : 'todo';
      return '<li class="leads-step"' + (st === 'current' ? ' aria-current="step"' : '') + '><span class="smark smark--' + st + '" data-mark' + (st === 'todo' ? '="hollow"' : '') + '>' + (st === 'done' ? V.icon('check') : st === 'failed' ? V.icon('x') : '') + '</span><span class="' + (st === 'todo' ? 'u-fg-3' : '') + '">' + (st === 'done' ? '<span class="sr-only">Done: </span>' : st === 'failed' ? '<span class="sr-only">Failed: </span>' : '') + s + '</span></li>';
    }).join('') + '</ol>';
  }
  function render() {
    var dlg = $('#leads-import'), body = $('#leads-imp-body'), foot = $('#leads-imp-foot'), step = I.step;
    dlg.classList.toggle('dlg--lg', step > 1);
    $('#leads-imp-steps').innerHTML = stepsHtml(step, step === 3 && I.state === 'done' ? 'done' : step === 3 && I.state === 'stopped' ? 'failed' : null);
    var desc = $('#leads-imp-d');
    if (step === 1) {
      desc.textContent = 'CSV or XLSX, up to 5 MB. A phone column is required.';
      var f = I.file;
      body.innerHTML = '<div class="dropzone' + (I.over ? ' is-over' : '') + '" id="leads-drop">' + V.icon('upload', 'lg') + '<p class="dropzone-line">Drop a file here, or <button type="button" class="btn btn--sm" id="leads-choose">Choose file…</button></p><p class="dropzone-note">CSV or XLSX · up to 5 MB · one file</p></div>' +
        (f ? '<ul class="file-list"><li class="file-row' + (f.reject ? ' file-row--rejected' : '') + '">' + V.icon(f.reject ? 'circle-alert' : 'file') + '<span class="file-main"><span class="file-name" translate="no">' + esc(f.name) + '</span><span class="file-meta">' + (f.reject ? esc(f.reject) : f.parseErr ? '' : esc(F.bytes(f.size)) + ' · ' + L.plural(f.rows.length, 'row') + ' · ' + L.plural(f.head.length, 'column')) + '</span></span><button type="button" class="ibtn ibtn--sm" data-imp="remove" aria-label="Remove ' + esc(f.name) + '">' + V.icon('x') + '</button></li></ul>' : '') +
        (f && f.parseErr ? '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t read this file. Save it as CSV (UTF-8) and try again.</span></div><details class="details"><summary>Details</summary><div class="raw"><code>' + esc(f.parseErr) + '</code></div></details></div>' : '') +
        '<p class="type-meta-12 u-fg-3"><button type="button" class="btn btn--link" data-leads-template>Download the template (CSV)</button> · <button type="button" class="btn btn--link" data-imp="sample">Use a sample file</button> <span class="u-fg-3">(prototype)</span></p>';
      var ok = f && !f.reject && !f.parseErr;
      foot.innerHTML = '<p class="dlg-why" id="leads-imp-why">' + (ok ? 'Next, you check how each column is imported.' : 'Choose a CSV or XLSX file to continue.') + '</p><button class="btn btn--tertiary" type="button" data-dialog-close>Cancel</button><button class="btn btn--primary" type="button" data-imp="next"' + (ok ? '' : ' aria-disabled="true" aria-describedby="leads-imp-why"') + '>Next: map columns</button>';
    } else if (step === 2) {
      desc.innerHTML = '<span translate="no">' + esc(I.file.name) + '</span> · ' + L.plural(I.rows.length, 'row') + ' · ' + L.plural(I.head.length, 'column') + ' · <button type="button" class="btn btn--link" data-imp="change">Change file</button>';
      var c = rowChecks(), phoneCols = I.map.filter(function (m) { return m === 'phone'; }).length;
      var rowsHtml = I.head.map(function (h, i) {
        var samples = I.rows.slice(0, 3).map(function (r) { var v = r[i] || ''; return I.map[i] === 'phone' && digits(v).length >= 4 ? '•••• ' + digits(v).slice(-4) : v; }).filter(Boolean).join(', ');
        var m = I.map[i], auto = I.auto[i] === m && m !== 'custom' && m !== 'skip';
        var chk = m === 'skip' ? '<span class="status status--md">' + V.icon('circle-slash') + 'Not imported</span>' : m === 'custom' ? '<span class="status status--md">' + V.icon('circle-dot') + 'Saved as “' + esc(h) + '”</span>' : m === 'phone' && phoneCols > 1 ? '<span class="status status--md status--danger">' + V.icon('circle-x') + 'Two columns are Phone</span>' : '<span class="status status--md status--success">' + V.icon('check') + (auto && h.trim().toLowerCase() !== m ? 'Matched from “' + esc(h) + '”' : 'Matched') + '</span>';
        return '<tr><td class="c-key" data-label="Column">' + esc(h) + '</td><td class="u-fg-3" data-label="Sample"><span class="cell-t leads-imp-sample">' + esc(samples || '–') + (samples ? '…' : '') + '</span></td><td data-label="Import as"><button type="button" class="select select--sm select--auto leads-imp-as" data-select data-mapcol="' + i + '" aria-controls="lim-' + i + '-lb" aria-label="Import ' + esc(h) + ' as: ' + esc(AS.filter(function (a) { return a[0] === m; })[0][1]) + '"><span class="select-value">' + esc(AS.filter(function (a) { return a[0] === m; })[0][1]) + '</span>' + V.icon('chevron-down', 'sm') + '</button><div class="listbox" id="lim-' + i + '-lb" role="listbox" aria-label="Import ' + esc(h) + ' as" hidden>' + AS.map(function (a) { return '<div class="option" role="option" data-value="' + a[0] + '" aria-selected="' + (a[0] === m) + '"><span class="option-main"><span class="option-label">' + esc(a[1]) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div></td><td class="c-trail" data-label="Check">' + chk + '</td></tr>';
      }).join('');
      var checks = '';
      if (!c) checks = '<ul class="gate-list"><li class="gate-row"><span class="gate-mark gate-mark--block" data-mark aria-hidden="true">' + V.icon('x') + '</span><span class="gate-text"><span class="sr-only">Blocking: </span>Choose the column that holds phone numbers.</span><span></span></li></ul>';
      else { var grp = function (kind, list, text, key, extra) { if (!list.length) return ''; var open = I.show === key; return '<li class="gate-row"><span class="gate-mark gate-mark--' + kind + '" data-mark aria-hidden="true">' + V.icon(kind === 'pass' ? 'check' : 'minus') + '</span><span class="gate-text"><span class="sr-only">' + (kind === 'pass' ? 'Passed: ' : 'Skipped: ') + '</span>' + text + (extra || '') + (open ? '<ul class="gate-members">' + list.slice(0, 20).map(function (n) { return '<li>Row ' + (n + 2) + ' · ' + esc(key === 'none' ? 'no phone number' : key === 'bad' ? '“' + (I.rows[n][I.map.indexOf('phone')] || '') + '” isn’t a valid number' : key === 'rep' ? 'repeats an earlier row' : 'number ending ' + digits(I.rows[n][I.map.indexOf('phone')]).slice(-4) + ' is already a lead') + '</li>'; }).join('') + '</ul>' : '') + '</span>' + (key ? '<span class="gate-act"><button type="button" class="btn btn--link" data-imp="show" data-k="' + key + '" aria-expanded="' + open + '">' + (open ? 'Hide rows' : 'Show rows') + '</button></span>' : '<span></span>') + '</li>'; };
        checks = '<ul class="gate-list">' + grp('pass', c.ready, F.count(c.ready.length) + ' row' + (c.ready.length === 1 ? ' is' : 's are') + ' ready') + grp('adjusted', c.none, L.plural(c.none.length, 'row') + (c.none.length === 1 ? ' has' : ' have') + ' no phone number · skipped', 'none') + grp('adjusted', c.bad, L.plural(c.bad.length, 'phone number') + (c.bad.length === 1 ? ' isn’t' : ' aren’t') + ' valid · skipped', 'bad') + grp('adjusted', c.rep, L.plural(c.rep.length, 'number') + (c.rep.length === 1 ? ' repeats' : ' repeat') + ' inside the file · first kept', 'rep') +
          grp('adjusted', c.dup, L.plural(c.dup.length, 'number') + (c.dup.length === 1 ? ' is already a lead' : ' are already leads'), 'dup', '<span class="leads-imp-dup" role="radiogroup" aria-label="Numbers already in Leads">' + [['skip', 'Skip'], ['update', 'Update empty fields'], ['overwrite', 'Overwrite']].map(function (o) { return '<label class="check check--dense"><input type="radio" class="radio" name="lim-dup" value="' + o[0] + '"' + (I.dupMode === o[0] ? ' checked' : '') + '><span class="check-text"><span>' + o[1] + '</span></span></label>'; }).join('') + '</span>') + '</ul>'; }
      var flows = [['default', 'Workspace default']].concat(DATA.flows.filter(function (f) { return f.status === 'live'; }).map(function (f) { return [f.id, f.name + ' v' + f.live.version]; })), langs = [['none', 'Not set']].concat(DATA.languages.slice(0, 7).map(function (x) { return [x.code, x.name]; }));
      var sl = function (id, label, val, list) { return '<div class="field"><span class="field-label" id="' + id + '-l">' + esc(label) + '</span><button type="button" class="select" data-select id="' + id + '" data-value="' + val + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v">' + esc(list.filter(function (x) { return x[0] === val; })[0][1]) + '</span>' + V.icon('chevron-down') + '</button><div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + list.map(function (x) { return '<div class="option" role="option" data-value="' + x[0] + '" aria-selected="' + (x[0] === val) + '"><span class="option-main"><span class="option-label">' + esc(x[1]) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div></div>'; };
      body.innerHTML = '<div class="dt-wrap dt-wrap--framed leads-imp-map"><table class="dt dt--stack" aria-label="Columns in ' + esc(I.file.name) + '"><thead><tr><th scope="col">Column in file</th><th scope="col">Sample values</th><th scope="col">Import as</th><th scope="col">Check</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' +
        '<section aria-labelledby="lim-rc"><h3 class="gate-group" id="lim-rc">Row checks</h3>' + checks + '</section>' +
        '<section class="leads-imp-opts" aria-label="Options"><div class="field"><label class="field-label" for="lim-src">Source for these leads</label><div class="input"><input id="lim-src" value="' + esc(I.src) + '"></div></div>' + sl('lim-flow', 'Flow', I.flow, flows) + sl('lim-lang', 'Language for rows without one', I.lang, langs) + '</section>' +
        '<label class="check"><input type="checkbox" class="cb" id="lim-consent"' + (I.consent ? ' checked' : '') + '><span class="check-text"><span>These people agreed to be contacted by Sample Realty</span><span class="check-desc">Optional for now. Whether this is required is an open question for the product owner.</span></span></label>' +
        '<p class="gate-note">Extra columns are saved as custom fields. Importing never places calls.</p>';
      var blocked = !c || phoneCols > 1, n = c ? importCount(c) : 0;
      foot.innerHTML = '<p class="dlg-why' + (blocked ? ' dlg-why--danger' : '') + '" id="leads-imp-why">' + (blocked ? (c ? 'Choose one column for phone numbers.' : 'Choose the column that holds phone numbers.') : !n ? 'No rows have a valid phone number.' : 'Source: ' + esc(I.src) + ' · Flow: ' + esc(flows.filter(function (f) { return f[0] === I.flow; })[0][1])) + '</p><button class="btn btn--tertiary" type="button" data-imp="back">Back</button><button class="btn btn--tertiary" type="button" data-dialog-close>Cancel</button><button class="btn btn--primary" type="button" data-imp="go"' + (blocked || !n ? ' aria-disabled="true" aria-describedby="leads-imp-why"' : '') + '>Import ' + L.plural(n, 'lead') + (c && I.dupMode !== 'skip' && c.dup.length ? ' and update ' + c.dup.length : '') + '</button>';
    } else {
      desc.innerHTML = '<span translate="no">' + esc(I.file.name) + '</span> · ' + L.plural(I.total, 'lead');
      var pct = I.done / I.total, st = I.state;
      body.innerHTML = (st === 'stopped' ? '<div class="pbar pbar--danger" role="progressbar" aria-label="Import" aria-valuemin="0" aria-valuemax="' + I.total + '" aria-valuenow="' + I.done + '"><div class="pbar-row"><span class="pbar-label">Import stopped at row ' + F.count(I.done + 1) + '.</span><span class="pbar-value">' + F.count(I.done) + ' of ' + F.count(I.total) + '</span></div><div class="pbar-track"><span class="pbar-fill" style="--p: ' + pct.toFixed(3) + '"></span></div></div><p class="status status--md status--danger" role="alert">' + V.icon('circle-x') + L.plural(I.done, 'lead') + (I.done === 1 ? ' was' : ' were') + ' imported. The rest were not.</p>'
        : st === 'done' ? '<p class="status status--md status--success" role="status">' + V.icon('check') + F.count(I.total) + ' imported · ' + F.count(I.skipped) + ' skipped</p><p>They’re in Leads with the status New. Nothing was called.</p>'
        : '<div class="pbar" role="progressbar" aria-label="Import" aria-valuemin="0" aria-valuemax="' + I.total + '" aria-valuenow="' + I.done + '" aria-valuetext="' + F.count(I.done) + ' of ' + F.count(I.total) + '"><div class="pbar-row"><span class="pbar-label">Importing…</span><span class="pbar-value">' + F.count(I.done) + ' of ' + F.count(I.total) + '</span></div><div class="pbar-track"><span class="pbar-fill" style="--p: ' + pct.toFixed(3) + '"></span></div></div><p>You can close this. The import continues, and a notification appears when it’s done.</p>');
      foot.innerHTML = st === 'done' ? '<button class="btn" type="button" data-imp="skipped">' + V.icon('download') + 'Download skipped rows (CSV)</button><button class="btn btn--primary" type="button" data-imp="view">View imported leads</button>'
        : st === 'stopped' ? '<button class="btn" type="button" data-imp="skipped">' + V.icon('download') + 'Download skipped rows</button><button class="btn btn--primary" type="button" data-imp="retry">Retry the rest</button>'
        : '<p class="dlg-why">Importing never places calls.</p><button class="btn" type="button" data-imp="close">Close</button>';
    }
    V.initAll(body); V.initAll(foot);
  }
  function accept(file, text) {
    var f = { name: file.name, size: file.size }, ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['csv', 'xlsx'].indexOf(ext) < 0) f.reject = 'Not a CSV or XLSX file. Choose another file.';
    else if (file.size > MAX) f.reject = 'Larger than 5 MB. Split it into smaller files.';
    I.file = f; if (f.reject) { render(); V.announce(f.reject, { politeness: 'assertive' }); var c = $('#leads-choose'); if (c) c.focus(); return; }
    if (ext === 'xlsx') { var s = sampleFile(); f.head = s.head; f.rows = s.rows; f.note = 'xlsx'; }
    else { var rows = text != null ? parseCsv(text) : []; if (L.demo('import-parse-fail') || rows.length < 2) { f.parseErr = rows.length < 2 ? 'row 1: no header row and no data rows were found' : 'row 214: unexpected quote in an unquoted field'; f.head = []; f.rows = []; } else { f.head = rows[0]; f.rows = rows.slice(1); } }
    render(); V.announce(f.parseErr ? 'Couldn’t read this file.' : f.name + ' is ready. ' + L.plural(f.rows.length, 'row') + '.');
    var nx = $('[data-imp="next"]'); if (nx && nx.getAttribute('aria-disabled') !== 'true') nx.focus();
  }
  function toStep2() { var f = I.file; I.head = f.head; I.rows = f.rows; I.auto = f.head.map(guess); I.map = I.auto.slice(); I.src = 'Import · ' + f.name; I.show = null; I.step = 2; render(); $('#leads-imp-t').focus(); }
  function start() {
    var c = rowChecks(); I.total = importCount(c); I.skipped = I.rows.length - I.total; I.done = 0; I.state = 'running'; I.step = 3; I.readyRows = c.ready; render(); $('#leads-imp-t').focus();
    var stopAt = L.demo('import-stop') && !I.retried ? Math.floor(I.total * 0.66) : null;
    clearInterval(I.timer); I.timer = setInterval(function () {
      I.done = Math.min(I.total, I.done + Math.max(1, Math.ceil(I.total / 14)));
      if (stopAt && I.done >= stopAt) { I.done = stopAt; I.state = 'stopped'; clearInterval(I.timer); }
      else if (I.done >= I.total) { I.state = 'done'; clearInterval(I.timer); finish(); }
      if (I.toast) { if (I.state === 'done') { I.toast.dismiss(); I.toast = null; V.toast.success(F.count(I.total) + ' imported · ' + F.count(I.skipped) + ' skipped', { action: { label: 'View imported leads', onClick: viewImported } }); } else if (I.state === 'stopped') { I.toast.dismiss(); I.toast = null; V.toast.error('Import stopped at row ' + F.count(I.done + 1) + '. ' + L.plural(I.done, 'lead') + (I.done === 1 ? ' was' : ' were') + ' imported.', { action: { label: 'Review', onClick: reopen } }); } else I.toast.update({ message: 'Importing ' + L.plural(I.total, 'lead') + '… ' + F.count(I.done) + ' done', value: Math.round(I.done / I.total * 100) }); }
      if (I.open) { render(); if (I.state !== 'running') { var p = $('[data-imp="view"], [data-imp="retry"]'); if (p) p.focus(); } }
    }, 330);
  }
  function finish() {
    var ni = I.map.indexOf('name'), ci = I.map.indexOf('city'), pi = I.map.indexOf('phone'), li = I.map.indexOf('language');
    var rows = I.file.sample ? null : I.readyRows.map(function (n) { var r = I.rows[n], lang = li >= 0 ? (DATA.languages.filter(function (x) { return x.name.toLowerCase() === String(r[li] || '').trim().toLowerCase(); })[0] || {}).code : null; return { name: ni >= 0 ? r[ni] : null, city: ci >= 0 ? r[ci] : null, last4: digits(r[pi]).slice(-4), language: lang }; });
    var made = L.makeImported(I.total, I.file.name, { rows: rows, flowId: I.flow === 'default' ? null : I.flow, language: I.lang === 'none' ? null : I.lang });
    made.forEach(function (l) { L.all.push(l); L.byId[l.id] = l; });
    if (!L.IMPORTS.some(function (x) { return x.file === I.file.name; })) L.IMPORTS.push({ file: I.file.name, at: DATA.meta.now, by: DATA.user.short });
    L.render();
  }
  function viewImported() { if (I.open) V.dialog.close('leads-import', 'confirm'); S.view = 'all'; S.q = ''; S.filters = { imported: { values: [I.file.name] } }; S.page = 1; L.pushUrl(); L.render({ announce: true }); }
  function reopen() { I.open = true; V.dialog.open('leads-import', { returnTo: $('#leads-import-btn'), onClose: onClose }); render(); }
  function onClose() { I.open = false; if (I.step === 3 && I.state === 'running') I.toast = V.toast.progress('Importing ' + L.plural(I.total, 'lead') + '… ' + F.count(I.done) + ' done', { value: Math.round(I.done / I.total * 100), action: { label: 'View', onClick: reopen } }); }
  L.openImport = function (trigger) {
    if (I && I.step === 3 && I.state === 'running') { reopen(); return; }
    I = { step: 1, file: null, dupMode: 'skip', flow: 'default', lang: 'none', consent: false, open: true };
    render(); V.dialog.open('leads-import', { returnTo: trigger || $('#leads-import-btn'), onClose: onClose });
  };
  L.initForms2 = function () {
    var dlg = $('#leads-import'), inp = $('#leads-file');
    inp.addEventListener('change', function () { var f = inp.files && inp.files[0]; if (!f) return; if (/\.csv$/i.test(f.name) && f.size <= MAX) { var rd = new FileReader(); rd.onload = function () { accept(f, String(rd.result)); }; rd.onerror = function () { accept(f, ''); }; rd.readAsText(f); } else accept(f, null); inp.value = ''; });
    dlg.addEventListener('dragover', function (e) { var z = e.target.closest('#leads-drop'); if (!z) return; e.preventDefault(); if (!z.classList.contains('is-over')) z.classList.add('is-over'); });
    dlg.addEventListener('dragleave', function (e) { var z = e.target.closest('#leads-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
    dlg.addEventListener('drop', function (e) { var z = e.target.closest('#leads-drop'); if (!z) return; e.preventDefault(); z.classList.remove('is-over'); var files = e.dataTransfer.files; if (files.length > 1) { I.file = { name: files.length + ' files', size: 0, reject: 'Choose one file. Import takes one file at a time.' }; render(); return; } var f = files[0]; if (!f) return; if (/\.csv$/i.test(f.name) && f.size <= MAX) f.text().then(function (t) { accept(f, t); }); else accept(f, null); });
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('#leads-choose')) { inp.click(); return; }
      var b = e.target.closest('[data-imp]'); if (!b) return; var k = b.getAttribute('data-imp');
      if (b.getAttribute('aria-disabled') === 'true') { V.announce($('#leads-imp-why').textContent); return; }
      if (k === 'sample') { var s = sampleFile(); I.file = { name: s.name, size: s.size, head: s.head, rows: s.rows, sample: true }; render(); V.announce(s.name + ' is ready. 1,252 rows.'); $('[data-imp="next"]').focus(); }
      else if (k === 'remove') { I.file = null; render(); $('#leads-choose').focus(); }
      else if (k === 'next') toStep2();
      else if (k === 'change' || k === 'back') { I.step = 1; render(); $('#leads-imp-t').focus(); }
      else if (k === 'show') { var key = b.getAttribute('data-k'); I.show = I.show === key ? null : key; render(); var nb = $('[data-imp="show"][data-k="' + key + '"]'); if (nb) nb.focus(); }
      else if (k === 'go') { I.src = $('#lim-src').value; start(); }
      else if (k === 'close') V.dialog.close('leads-import', 'x');
      else if (k === 'view') viewImported();
      else if (k === 'retry') { I.retried = true; I.state = 'running'; var keep = I.done; start(); I.done = keep; }
      else if (k === 'skipped') { var c = rowChecks(), pi = I.map.indexOf('phone'), lines = ['Row,Reason,Phone'].concat(c.none.map(function (n) { return (n + 2) + ',No phone number,'; })).concat(c.bad.map(function (n) { return (n + 2) + ',Not a valid number,"' + String(I.rows[n][pi] || '').replace(/"/g, '""') + '"'; })).concat(c.rep.map(function (n) { return (n + 2) + ',Repeats an earlier row,'; })); L.download('skipped-rows-' + I.file.name.replace(/\.\w+$/, '') + '.csv', lines.join('\n')); V.toast.success('Downloaded the skipped rows'); }
    });
    dlg.addEventListener('change', function (e) { if (e.target.name === 'lim-dup') { I.dupMode = e.target.value; render(); var r = $('input[name="lim-dup"][value="' + I.dupMode + '"]'); if (r) r.focus(); } if (e.target.id === 'lim-consent') I.consent = e.target.checked; });
    dlg.addEventListener('input', function (e) { if (e.target.id === 'lim-src') I.src = e.target.value; });
    dlg.addEventListener('vaani:change', function (e) {
      var i = e.target.getAttribute('data-mapcol'); if (i != null) { I.map[+i] = e.detail.value; render(); var t = $('[data-mapcol="' + i + '"]'); if (t) t.focus(); V.announce(I.head[+i] + ' imports as ' + e.detail.label); return; }
      if (e.target.id === 'lim-flow') I.flow = e.detail.value; if (e.target.id === 'lim-lang') I.lang = e.detail.value;
    });
  };
  var prevInit = L.initForms; L.initForms = function () { if (prevInit) prevInit(); L.initForms2(); };
})(window, document);
