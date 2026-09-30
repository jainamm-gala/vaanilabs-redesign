/* Vaani Labs prototype · pages/knowledge-add.js — Add knowledge (Dialog md 560, lg 720 for the table step; 03-pages/05 §1.7):
   SegmentedControl Files · Text · Web page (?add=), Dropzone with a labelled "Choose files" (the hidden input is "Knowledge
   files"), file rows that walk the status sentences live, duplicate and rejection rows, the CSV table step (RadioCards,
   columns, "Name each row by", a 5-row passage preview, "Add n rows"), Text and Web page forms with blur validation, the
   progress toast when the dialog closes mid-upload, and the page drop target (enhancement). */
(function (w, d) {
  'use strict';
  var K = w.VaaniKnowledge, V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$;
  var A = K.add = {}, mode = 'files', rows = [], entry = null, seq = 0, csvRow = null, prefill = {};
  var MAX = 10 * 1048576, OK = /\.(pdf|docx|txt|csv)$/i;
  /* The demo table (?demo=csv, ?demo=uploads: rows with no File behind them). A CSV the reviewer actually chooses is parsed
     instead (readTable), so the file row and the table step show its own name, size, row count, columns and first rows. */
  var CSV = { rows: 200, cols: [['Tower', 'B'], ['Type', '2BHK'], ['Size', '1,150 sq ft'], ['Price', '₹85 L'], ['Floor', '7'], ['Facing', 'East'], ['Internal code', 'TB-0714']] };
  var CSV_ROWS = [['B', '2BHK', '1,150 sq ft', '₹85 L', '7', 'East', 'TB-0714'], ['B', '3BHK', '1,480 sq ft', '₹1.12 Cr', '9', 'North', 'TB-0921'], ['C', '2BHK', '1,090 sq ft', '₹79 L', '3', 'West', 'TC-0308'], ['A', '1BHK', '640 sq ft', '₹52 L', '5', 'East', 'TA-0502'], ['A', '3BHK', '1,520 sq ft', '₹1.18 Cr', '11', 'South', 'TA-1104']];
  var ROW_LIMIT = 5000;
  function cannedTable(r) { return { canned: true, rows: CSV.rows, chars: r.size, cols: CSV.cols, sample: CSV_ROWS, how: 'rows', include: [true, true, true, true, true, true, false], nameBy: 'Tower and Type', nameOpts: ['Tower and Type', 'Tower', 'Internal code'] }; }

  function dlg() { return $('#kn-add-dlg'); }
  function frame(title, desc, body, foot, lg) {
    var el = dlg(); el.classList.toggle('dlg--lg', !!lg);
    el.innerHTML = '<div class="dlg-head"><h2 class="dlg-title" id="kn-add-t">' + esc(title) + '</h2>' + (desc ? '<p class="dlg-desc" id="kn-add-d">' + esc(desc) + '</p>' : '') + '<button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + V.icon('x') + '</button></div>' +
      '<div class="dlg-body">' + body + '</div><div class="dlg-foot">' + foot + '</div>';
    if (!desc) el.removeAttribute('aria-describedby'); else el.setAttribute('aria-describedby', 'kn-add-d');
    V.initAll(el);
  }
  function typeSeg() {
    return '<div class="field"><span class="field-label" id="kn-type-l">Source type</span><div class="seg kn-type-seg" role="radiogroup" aria-labelledby="kn-type-l" id="kn-type">' +
      [['files', 'Files', 'upload'], ['text', 'Text', 'text'], ['web', 'Web page', 'globe']].map(function (t) { return '<button type="button" role="radio" data-value="' + t[0] + '" aria-checked="' + (mode === t[0]) + '">' + V.icon(t[2], 'sm') + t[1] + '</button>'; }).join('') + '</div></div>';
  }
  var WHY = '<p class="dlg-why">Sources reach live calls as soon as they’re indexed.</p>';

  /* ---------- Files ---------- */
  function fileRowHtml(r) {
    var s = r.sourceId && K.byId(r.sourceId), meta = '', act = '';
    if (r.rejected) meta = esc(r.rejected);
    else if (r.duplicate) meta = 'Already in Knowledge as ‘' + esc(r.duplicate) + '’. <button class="btn btn--link" type="button" data-f-dup="replace" data-f="' + r.id + '">Replace it</button> · <button class="btn btn--link" type="button" data-f-dup="add" data-f="' + r.id + '">Add anyway</button>';
    else if (r.csvPending) meta = esc(V.fmt.bytes(r.size)) + ' · Table · ' + (r.table ? esc(rowsLabel(r.table.rows)) + ' · <button class="btn btn--link" type="button" data-f-csv="' + r.id + '">Choose how to read it</button>' : 'Reading rows…');
    else if (s) {
      if (K.isFailed(s)) { var fx = K.fixes(s)[0]; meta = esc(V.fmt.bytes(r.size)) + ' · ' + K.statusText(s, { small: true, noTip: true }) + (fx ? ' · <button class="btn btn--link" type="button" data-f-fix="' + fx.act + '" data-f="' + r.id + '">' + esc(fx.label) + '</button>' : ''); }
      else meta = esc(V.fmt.bytes(r.size)) + ' · ' + K.statusText(s, { small: true, noTip: true });
    }
    var inFlight = s && (K.inProgress(s) || s.status === 'queued');
    act = '<button type="button" class="ibtn ibtn--sm" data-f-rm="' + r.id + '" aria-label="' + (inFlight ? 'Stop adding ' : 'Remove ') + esc(r.name) + ' from this list">' + V.icon('x', 'sm') + '</button>';
    var bar = s && s.status === 'uploading' ? '<span class="pbar pbar--thin" aria-hidden="true"><span class="pbar-track"><span class="pbar-fill" style="--p: ' + (s.progress / 100) + '"></span></span></span>' : '';
    return '<li class="file-row' + (r.rejected ? ' file-row--rejected' : '') + '" data-f-row="' + r.id + '">' + V.icon(/\.csv$/i.test(r.name) ? 'sheet' : 'file-text') + '<span class="file-main"><span class="file-name" translate="no">' + esc(r.name) + '</span><span class="file-meta">' + meta + '</span>' + bar + '</span>' + act + '</li>';
  }
  function renderRows() { var l = $('#kn-file-list'); if (!l) return; l.innerHTML = rows.map(fileRowHtml).join(''); l.hidden = !rows.length; if (w.VaaniIcon) w.VaaniIcon.hydrate(l); }
  function filesView() {
    var coarse = V.bp.coarse();
    frame('Add knowledge', 'Your agent can quote these on calls once they’re indexed.',
      typeSeg() + '<div class="field"><span class="field-label" id="kn-files-l">Knowledge files</span><div class="dropzone" id="kn-dz">' + V.icon('upload', 'lg') +
      '<div class="dropzone-line">' + (coarse ? '' : '<span>Drag files here or</span>') + '<button class="btn btn--sm" type="button" id="kn-choose" aria-describedby="kn-dz-note">Choose files</button></div><div class="dropzone-note" id="kn-dz-note">PDF, DOCX, TXT or CSV · up to 10 MB each · up to 20 files</div>' +
      '<input type="file" id="kn-file-in" class="sr-only" multiple accept=".pdf,.docx,.txt,.csv" aria-label="Knowledge files" tabindex="-1"></div></div><ul class="file-list" id="kn-file-list" aria-label="Files you added" hidden></ul>',
      WHY + '<button type="button" class="btn" data-dialog-close>Done</button>');
    renderRows();
  }
  function addFiles(list, demo) {
    var rejected = 0, added = 0;
    Array.prototype.forEach.call(list, function (f) {
      if (rows.length >= 20) { rejected += 1; return; }
      seq += 1; var r = { id: 'f' + seq, name: f.name, size: f.size || 0, demo: f.demo, file: w.Blob && f instanceof w.Blob ? f : null };
      if (!OK.test(f.name)) { r.rejected = 'Not a PDF, DOCX, TXT or CSV file. Choose another file.'; rejected += 1; }
      else if (r.size > MAX) { r.rejected = 'Larger than 10 MB. Split it into smaller files.'; rejected += 1; }
      else {
        if (/\.csv$/i.test(f.name)) readTable(r);
        var dup = K.sources.filter(function (s) { return s.fileName === f.name; })[0]; if (dup) r.duplicate = dup.title; else start(r); added += 1;
      }
      rows.push(r);
    });
    renderRows();
    if (added) V.announce('Adding ' + added + (added === 1 ? ' file.' : ' files.'));
    if (rejected) V.announce(rejected + (rejected === 1 ? ' file was' : ' files were') + ' not added. See the list for why.', { dedupeKey: 'kn-rej' });
  }
  function titleOf(name) { var t = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); }
  function start(r) {
    var csv = /\.csv$/i.test(r.name), id = 'kb_new' + seq;
    var s = { id: id, title: titleOf(r.name), fileName: r.name, size: r.size, kind: csv ? 'table' : 'file', format: (r.name.split('.').pop() || 'PDF').toUpperCase(), pages: 4, rows: csv && r.table ? r.table.rows : undefined,
      status: 'uploading', progress: 0, passages: 0, updatedAt: V.fmt.now().toISOString(), addedAt: V.fmt.now().toISOString(), by: V.data.user.short, direct: [], languages: ['en'], session: true };
    r.sourceId = id; K.table.addSource(s);
    var o = { upload: true, fast: true, onStep: function () { renderRows(); } };
    if (csv) { o = { fast: true, onStep: function () { renderRows(); } }; uploadOnly(s, r); return; }
    if (r.demo === 'fail') o.fail = 'no_text'; o.passages = r.demo === 'big' ? 38 : 18;
    o.onDone = function () { renderRows(); A.progressTick(); };
    K.table.simulate(id, o);
  }
  /* A CSV uploads, then waits for "How should the agent read it?": nothing is indexed before "Add n rows" */
  function uploadOnly(s, r) {
    var p = 0; (function step() { p += 50; s.progress = Math.min(100, p); s.status = 'uploading'; K.table.updateRow(s.id); renderRows(); if (p < 100) setTimeout(step, 450); else { s.status = 'queued'; r.csvPending = true; K.table.updateRow(s.id); renderRows(); if (r.demo === 'csv-open') setTimeout(function () { tableStep(r); }, 200); } })();
  }

  /* ---------- CSV: read the chosen file (header, row count, a sample value per column, the first 5 rows) ---------- */
  function rowsLabel(n) { return V.fmt.count(n) + (n === 1 ? ' row' : ' rows'); }
  function parseCsv(text) {
    var first = text.split(/\r?\n/, 1)[0] || '', sep = [',', ';', '\t'].sort(function (a, b) { return first.split(b).length - first.split(a).length; })[0];
    var out = [], row = [], cell = '', q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text.charAt(i);
      if (q) { if (c === '"') { if (text.charAt(i + 1) === '"') { cell += '"'; i += 1; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text.charAt(i + 1) === '\n') i += 1; row.push(cell); out.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); out.push(row); }
    return out.filter(function (x) { return x.some(function (v) { return v.trim(); }); });
  }
  function tableFrom(text) {
    var all = parseCsv(text.replace(/^﻿/, '')), head = (all[0] || []).map(function (h) { return h.trim(); }), data = all.slice(1), one = data[0] || [];
    var num = function (v) { return /\d/.test(v) && /^[\s₹$+\-.,%\d]+$/.test(v); };
    var cols = head.map(function (h, i) { return [h || 'Column ' + (i + 1), (one[i] || '').trim()]; });
    var byText = cols.filter(function (c) { return c[1] && !num(c[1]); })[0] || cols[0];
    var t = { rows: data.length, chars: text.length, cols: cols, sample: data.slice(0, 5).map(function (x) { return cols.map(function (c, i) { return (x[i] || '').trim(); }); }),
      how: 'rows', include: cols.map(function () { return true; }), nameBy: byText ? byText[0] : '', nameOpts: cols.map(function (c) { return c[0]; }) };
    if (!head.length || head.every(function (h) { return !h || num(h); })) t.error = 'The first row should hold column names, like Tower, Type and Price.';
    else if (data.length > ROW_LIMIT) t.error = 'This table has ' + V.fmt.count(data.length) + ' rows. Split it into files of ' + V.fmt.count(ROW_LIMIT) + ' rows or fewer.';
    else if (!data.length) t.error = 'This table has column names but no rows under them. Add the rows and choose the file again.';
    return t;
  }
  function readTable(r) {
    if (!r.file) { r.table = cannedTable(r); return; }
    var done = function (text) { r.table = tableFrom(text || ''); var s = r.sourceId && K.byId(r.sourceId); if (s) { s.rows = r.table.rows; K.table.updateRow(s.id); } renderRows(); };
    try {
      if (r.file.text) r.file.text().then(done, function () { done(''); });
      else { var fr = new w.FileReader(); fr.onload = function () { done(String(fr.result)); }; fr.onerror = function () { done(''); }; fr.readAsText(r.file); }
    } catch (e) { done(''); }
  }

  /* ---------- CSV table step (Dialog lg) ---------- */
  function preview(t) {
    var nb = t.nameOpts.indexOf(t.nameBy);
    return t.sample.map(function (row) {
      if (t.how === 'text') return row.filter(Boolean).join(', ');
      if (t.canned) {
        var name = t.nameBy === 'Tower' ? 'Tower ' + row[0] : t.nameBy === 'Internal code' ? row[6] : 'Tower ' + row[0] + ' ' + row[1];
        return name + ': ' + [2, 3, 4, 5].filter(function (i) { return t.include[i]; }).map(function (i) { return t.cols[i][0] + ' ' + row[i]; }).join(' · ');
      }
      var body = t.cols.map(function (c, i) { return t.include[i] && i !== nb && row[i] ? c[0] + ' ' + row[i] : ''; }).filter(Boolean).join(' · ');
      return (nb >= 0 && row[nb] ? row[nb] + ': ' : '') + body;
    });
  }
  function previewHtml(t) { return preview(t).map(function (p) { return '<li class="kn-preview-row">' + esc(p) + '</li>'; }).join(''); }
  function tableStep(r) {
    csvRow = r; var t = r.table || (r.table = cannedTable(r));
    var meta = '<p class="type-meta-12 u-fg-3 num">' + esc(V.fmt.bytes(r.size)) + ' · ' + esc(rowsLabel(t.rows)) + ' · ' + t.cols.length + (t.cols.length === 1 ? ' column' : ' columns') + '</p>';
    var title = 'How should the agent read ‘' + r.name + '’?';
    if (t.error) {
      frame(title, null, meta + '<div class="notice notice--danger" role="alert">' + V.icon('circle-x') + '<span class="notice-body">' + esc(t.error) + '</span></div>',
        '<button type="button" class="btn btn--tertiary" data-t-back>Back</button><button type="button" class="btn btn--primary" data-t-other>Choose another file</button>', true);
    } else {
      var cut = function (v) { return v.length > 28 ? v.slice(0, 27) + '…' : v; };
      var cols = t.cols.map(function (c, i) { return '<label class="check check--dense"><input type="checkbox" class="cb" data-t-col="' + i + '"' + (t.include[i] ? ' checked' : '') + '><span class="check-text"><span>' + esc(c[0]) + (c[1] ? ' <span class="u-fg-3">' + esc(cut(c[1])) + '</span>' : '') + '</span></span></label>'; }).join('');
      var shown = Math.min(5, t.rows);
      frame(title, null, meta +
        '<fieldset class="fieldset"><legend>Read it</legend><div class="rcards">' +
        '<label class="rcard"><input type="radio" class="radio" name="kn-how" value="rows"' + (t.how === 'rows' ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">Row by row</span><span class="rcard-desc">Best for price lists, inventories and directories. Each row becomes one passage.</span></span></label>' +
        '<label class="rcard"><input type="radio" class="radio" name="kn-how" value="text"' + (t.how === 'text' ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">As plain text</span><span class="rcard-desc">The whole file is read as one document.</span></span></label></div></fieldset>' +
        (t.how === 'rows' ? '<fieldset class="fieldset"><legend>Columns to include</legend><div class="kn-cols3">' + cols + '</div></fieldset>' +
          '<div class="field field--medium"><span class="field-label" id="kn-nb-l">Name each row by</span><button type="button" class="select" data-select aria-controls="kn-nb-lb" aria-labelledby="kn-nb-l kn-nb-v"><span class="select-value" id="kn-nb-v">' + esc(t.nameBy) + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
          '<div class="listbox" id="kn-nb-lb" role="listbox" aria-labelledby="kn-nb-l" hidden>' + t.nameOpts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o) + '" aria-selected="' + (o === t.nameBy) + '"><span class="option-main"><span class="option-label">' + esc(o) + '</span></span></div>'; }).join('') + '</div></div>' : '') +
        '<section aria-labelledby="kn-prev-t"><p class="field-label kn-prev-h" id="kn-prev-t">Preview <span class="field-opt">first ' + shown + ' of ' + (t.how === 'rows' ? V.fmt.count(t.rows) + ' passages' : rowsLabel(t.rows)) + '</span></p><ol class="kn-preview">' + previewHtml(t) + '</ol></section>',
        '<p class="dlg-why">Each row reaches live calls once it is indexed.</p><button type="button" class="btn btn--tertiary" data-t-back>Back</button><button type="button" class="btn btn--primary" data-t-add>' + (t.how === 'rows' ? 'Add ' + rowsLabel(t.rows) : 'Add as text') + '</button>', true);
    }
    var nb = $('#kn-nb-v'); if (nb) nb.parentNode.addEventListener('vaani:change', function (e) { t.nameBy = e.detail.value; tableStep(csvRow); var s = $('[data-select]', dlg()); if (s) s.focus(); });
    var h = $('.dlg-title', dlg()); h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus();
  }

  /* ---------- Text and Web page ---------- */
  function textView() {
    frame('Add knowledge', 'Your agent can quote these on calls once they’re indexed.', typeSeg() +
      '<div class="field"><label class="field-label" for="kn-tt">Title</label><div class="input"><input id="kn-tt" maxlength="100" autocomplete="off" value="' + esc(prefill.title || '') + '" aria-describedby="kn-tt-h kn-tt-e"></div><p class="field-hint" id="kn-tt-h">Shown in the sources list and in call reports when the agent quotes it.</p><p class="field-error" id="kn-tt-e" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="kn-tx">Text</label><textarea class="textarea kn-textarea" id="kn-tx" rows="8" placeholder="Paste product details, FAQs, policies or scripts…" aria-describedby="kn-tx-c kn-tx-e"></textarea><div class="field-foot"><p class="field-error" id="kn-tx-e" hidden></p><span class="field-count" id="kn-tx-c">0 of 50,000</span></div></div>',
      WHY + '<button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-add-text>Add text</button>');
  }
  function webView() {
    frame('Add knowledge', 'Your agent can quote these on calls once they’re indexed.', typeSeg() +
      '<div class="field"><label class="field-label" for="kn-url">Page address</label><div class="input">' + V.icon('globe', 'sm') + '<input id="kn-url" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://yourcompany.in/pricing…" value="' + esc(prefill.url || '') + '" aria-describedby="kn-url-h kn-url-e"></div><p class="field-hint" id="kn-url-h">We read this one page, not the whole site. Re-fetch it from the source’s menu when the page changes.</p><p class="field-error" id="kn-url-e" hidden></p></div>' +
      '<div class="field"><label class="field-label" for="kn-ut">Title <span class="field-opt">(optional)</span></label><div class="input"><input id="kn-ut" maxlength="100" autocomplete="off" value="' + esc(prefill.title || '') + '" aria-describedby="kn-ut-h"></div><p class="field-hint" id="kn-ut-h">Defaults to the page’s own title.</p></div>',
      WHY + '<button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-add-web>Add page</button>');
  }
  function fieldErr(inputId, errId, msg) { var i = $('#' + inputId), e = $('#' + errId); if (msg) { e.innerHTML = V.icon('circle-alert', 'sm') + esc(msg); e.hidden = false; i.setAttribute('aria-invalid', 'true'); } else { e.hidden = true; e.innerHTML = ''; i.removeAttribute('aria-invalid'); } return !!msg; }
  function urlError(v) { v = v.trim(); if (!v) return 'Enter the page address.'; return /^https:\/\/[^\s.]+\.[^\s]{2,}/i.test(v) ? '' : 'Enter a full address starting with https://.'; }
  function newSource(kind, title, extra) {
    seq += 1; var s = { id: 'kb_new' + seq, title: title, kind: kind, format: kind === 'web' ? 'Web page' : 'Text', status: 'reading', passages: 0, updatedAt: V.fmt.now().toISOString(), addedAt: V.fmt.now().toISOString(), by: V.data.user.short, direct: [], languages: ['en'], session: true };
    for (var k in extra) s[k] = extra[k]; K.table.addSource(s); return s;
  }

  function show(m) { mode = m; if (m === 'text') textView(); else if (m === 'web') webView(); else filesView(); K.url.set({ add: m }); dlg().removeAttribute('data-dirty'); }

  /* ---------- progress toast when the dialog closes with uploads still running (O §9.2) ---------- */
  var ptoast = null;
  A.progressTick = function () {
    if (!ptoast) return;
    var mine = rows.filter(function (r) { return r.sourceId && K.byId(r.sourceId); }).map(function (r) { return K.byId(r.sourceId); });
    var done = mine.filter(function (s) { return s.status === 'indexed' || K.isFailed(s); }).length, ix = mine.filter(function (s) { return s.status === 'indexed'; }).length;
    if (done >= mine.length) { ptoast.done('success', mine.length + (mine.length === 1 ? ' source added.' : ' sources added.') + (mine.length - ix ? ' ' + (mine.length - ix) + ' couldn’t be indexed.' : '')); ptoast = null; rows = []; return; }
    ptoast.update({ message: 'Adding ' + mine.length + ' sources… ' + ix + ' indexed', value: Math.round(done / mine.length * 100) });
  };

  A.open = function (m, o) {
    o = o || {}; prefill = { title: o.title || '', url: o.url || '' };
    if (!K.canAdd()) { V.toast.info('Only admins can add knowledge. Ask Anika R.'); return; }
    if (K.offline) { V.announce(K.offlineReason); return; }
    if (K.view !== 'sources') K.setView('sources', true);
    if (entry && !entry.closed) { show(m || 'files'); return; }
    rows = rows.filter(function (r) { var s = r.sourceId && K.byId(r.sourceId); return s && (K.inProgress(s) || s.status === 'queued'); });
    show(m || 'files');
    entry = V.dialog.open(dlg(), { returnTo: o.returnTo || $('#kn-add'), onClose: function () {
      K.url.set({ add: null, demo: null });
      var busy = rows.filter(function (r) { var s = r.sourceId && K.byId(r.sourceId); return s && (K.inProgress(s) || (s.status === 'queued' && !r.csvPending)); });
      if (busy.length && !ptoast) { ptoast = V.toast.progress('Adding ' + busy.length + ' sources…', { action: { label: 'View', onClick: function () { var tr = $('#kn-tbody tr[data-id]'); if (tr) tr.focus(); } } }); A.progressTick(); }
    } });
    if (o.demo === 'uploads') setTimeout(function () { addFiles([{ name: 'Site visit FAQ.docx', size: 40038 }, { name: 'Price sheet (Oct 2026).pdf', size: 2516582, demo: 'big' }, { name: 'Unit inventory.csv', size: 90112 }, { name: 'Brochure scan.pdf', size: 4299161, demo: 'fail' }, { name: 'price-sheet.pdf', size: 2457600 }, { name: 'Master plan (print).pdf', size: 18350080 }]); }, 150);
    if (o.demo === 'csv') setTimeout(function () { addFiles([{ name: 'Unit inventory.csv', size: 90112, demo: 'csv-open' }]); }, 150);
  };

  A.init = function () {
    var el = dlg();
    el.addEventListener('vaani:change', function (e) { var g = e.target.closest('#kn-type'); if (g) { show(e.detail.value); var r = $('#kn-type [aria-checked="true"]'); if (r) r.focus(); } });
    el.addEventListener('click', function (e) {
      if (e.target.closest('#kn-choose')) { $('#kn-file-in').click(); return; }
      var rm = e.target.closest('[data-f-rm]'); if (rm) { var id = rm.getAttribute('data-f-rm'), r = rows.filter(function (x) { return x.id === id; })[0]; if (r && r.sourceId) { var s = K.byId(r.sourceId); if (s && (K.inProgress(s) || s.status === 'queued')) { K.sources = K.sources.filter(function (x) { return x.id !== r.sourceId; }); K.table.render(); } } rows = rows.filter(function (x) { return x.id !== id; }); renderRows(); var c = $('#kn-choose'); if (c) c.focus(); return; }
      var dp = e.target.closest('[data-f-dup]'); if (dp) { var r2 = rows.filter(function (x) { return x.id === dp.getAttribute('data-f'); })[0]; if (r2) { if (dp.getAttribute('data-f-dup') === 'replace') { var old = K.sources.filter(function (s) { return s.fileName === r2.name; })[0]; if (old) { r2.duplicate = null; r2.sourceId = old.id; K.table.simulate(old.id, { upload: true, fast: true, passages: old.passages, onStep: renderRows, onDone: function () { renderRows(); A.progressTick(); } }); } } else { r2.duplicate = null; start(r2); } renderRows(); var ch = $('#kn-choose'); if (ch) ch.focus(); } return; }
      var cv = e.target.closest('[data-f-csv]'); if (cv) { tableStep(rows.filter(function (x) { return x.id === cv.getAttribute('data-f-csv'); })[0]); return; }
      var fx = e.target.closest('[data-f-fix]'); if (fx) { var r3 = rows.filter(function (x) { return x.id === fx.getAttribute('data-f'); })[0]; if (fx.getAttribute('data-f-fix') === 'paste') { prefill.title = r3 ? titleOf(r3.name) : ''; show('text'); } else if (r3) K.table.act(fx.getAttribute('data-f-fix'), r3.sourceId, fx); return; }
      if (e.target.closest('[data-t-back]')) { el.classList.remove('dlg--lg'); show('files'); return; }
      if (e.target.closest('[data-t-add]')) {
        var tb = csvRow.table, s3 = K.byId(csvRow.sourceId); csvRow.csvPending = false;
        if (s3) { s3.kind = tb.how === 'rows' ? 'table' : 'text'; s3.rows = tb.rows; s3.chars = tb.chars; K.table.simulate(s3.id, { fast: true, passages: tb.how === 'rows' ? tb.rows : Math.max(1, Math.ceil((tb.chars || 0) / 400)), onStep: renderRows, onDone: function () { renderRows(); A.progressTick(); } }); }
        show('files'); var c2 = $('#kn-choose'); if (c2) c2.focus(); return;
      }
      /* a table the step can’t read: drop it (and its queued source) and pick another file */
      if (e.target.closest('[data-t-other]')) {
        var gone = csvRow; if (gone && gone.sourceId) { K.sources = K.sources.filter(function (x) { return x.id !== gone.sourceId; }); K.table.render(); }
        rows = rows.filter(function (x) { return x !== gone; }); show('files'); var c3 = $('#kn-choose'); if (c3) c3.focus(); $('#kn-file-in').click(); return;
      }
      if (e.target.closest('[data-add-text]')) {
        var t = $('#kn-tt').value.trim(), x = $('#kn-tx').value.trim(), bad = fieldErr('kn-tt', 'kn-tt-e', t ? '' : 'Enter a title.') ; bad = fieldErr('kn-tx', 'kn-tx-e', x ? '' : 'Paste the text you want your agent to use.') || bad;
        if (bad) { (t ? $('#kn-tx') : $('#kn-tt')).focus(); return; }
        var s = newSource('text', t, { chars: x.length }); el.removeAttribute('data-dirty'); V.dialog.close(el, 'confirm');
        K.table.simulate(s.id, { fast: true, passages: Math.max(1, Math.ceil(x.length / 400)) }); return;
      }
      if (e.target.closest('[data-add-web]')) {
        var u = $('#kn-url').value.trim(); if (fieldErr('kn-url', 'kn-url-e', urlError(u))) { $('#kn-url').focus(); return; }
        var tt = $('#kn-ut').value.trim() || u.replace(/^https:\/\//, '').split('/')[0], fail = /login|signin/i.test(u) ? 'fetch_login' : /notfound|404/i.test(u) ? 'fetch_not_found' : null;
        var sw = newSource('web', tt, { url: u, fetchedAt: V.fmt.now().toISOString() }); el.removeAttribute('data-dirty'); V.dialog.close(el, 'confirm');
        K.table.simulate(sw.id, { fast: true, passages: 7, fail: fail });
      }
    });
    el.addEventListener('change', function (e) {
      if (e.target.id === 'kn-file-in') { addFiles(e.target.files); e.target.value = ''; return; }
      if (e.target.name === 'kn-how') { csvRow.table.how = e.target.value; tableStep(csvRow); var r = $('input[name="kn-how"]:checked', el); if (r) r.focus(); return; }
      if (e.target.hasAttribute('data-t-col')) { csvRow.table.include[+e.target.getAttribute('data-t-col')] = e.target.checked; var list = $('.kn-preview', el); if (list) list.innerHTML = previewHtml(csvRow.table); }
    });
    el.addEventListener('input', function (e) {
      if (e.target.id === 'kn-tx' || e.target.id === 'kn-tt' || e.target.id === 'kn-url' || e.target.id === 'kn-ut') el.setAttribute('data-dirty', 'true');
      if (e.target.id === 'kn-tx') { var n = e.target.value.length, c = $('#kn-tx-c'); c.textContent = V.fmt.count(n) + ' of 50,000'; c.classList.toggle('field-count--warn', n > 45000 && n <= 50000); c.classList.toggle('field-count--over', n > 50000); }
    });
    el.addEventListener('focusout', function (e) { if (e.target.id === 'kn-url' && e.target.value.trim()) fieldErr('kn-url', 'kn-url-e', urlError(e.target.value)); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.target.id === 'kn-url' || e.target.id === 'kn-ut' || e.target.id === 'kn-tt')) { e.preventDefault(); var b = $('[data-add-web],[data-add-text]', el); if (b) b.click(); } });
    el.addEventListener('dragover', function (e) { var z = $('#kn-dz'); if (z && e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) { e.preventDefault(); z.classList.add('is-over'); } });
    el.addEventListener('dragleave', function (e) { var z = $('#kn-dz'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
    el.addEventListener('drop', function (e) { var z = $('#kn-dz'); if (!z) return; e.preventDefault(); z.classList.remove('is-over'); if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });

    /* Page drop target: files dragged over the content column (never drags that start inside the page) */
    var inside = false, drop = $('#kn-drop'), depth = 0;
    d.addEventListener('dragstart', function () { inside = true; }); d.addEventListener('dragend', function () { inside = false; });
    function hasFiles(e) { return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0; }
    function place() { var m = $('#kn-sources-view').getBoundingClientRect(); drop.style.top = m.top + 'px'; drop.style.left = m.left + 'px'; drop.style.width = m.width + 'px'; drop.style.height = m.height + 'px'; }
    d.addEventListener('dragenter', function (e) { if (inside || !hasFiles(e) || K.view !== 'sources' || (entry && !entry.closed) || !K.canAdd() || K.offline) return; depth += 1; if (drop.hidden) { place(); drop.hidden = false; V.announce('Drop files to add them to Knowledge'); } });
    d.addEventListener('dragleave', function () { if (drop.hidden) return; depth -= 1; if (depth <= 0) { depth = 0; drop.hidden = true; } });
    d.addEventListener('dragover', function (e) { if (!drop.hidden) e.preventDefault(); });
    d.addEventListener('drop', function (e) { if (drop.hidden) return; e.preventDefault(); drop.hidden = true; depth = 0; var files = e.dataTransfer.files; A.open('files', { entry: 'drop' }); setTimeout(function () { addFiles(files); }, 60); });
  };
})(window, document);
