/* Vaani Labs prototype · pages/leads-sheet.js — the lead sheet (03 §6.9, §7.3): record sheet 440, docked ≥1440,
   overlay 1024–1439, modal below; deep-linked ?lead=&tab=; Overview · Calls · Notes; J/K follow; Edit details with the
   inline discard state; the footer’s Call… opens the Call gate upward. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, F = V.fmt, L = w.VaaniLeads, S = L.S, DATA = V.data;
  var entry = null, edit = null, saved = {}, olderShown = false;
  function lead() { return L.byId[S.leadId]; }
  L.sheetOpen = function () { return !!entry && !entry.closed; };

  /* ---------- Overview ---------- */
  function kv(k, v, cls) { return '<div class="kv-row"><dt>' + esc(k) + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</dd></div>'; }
  function section(id, title, inner, end) { return '<section class="leads-sec" aria-labelledby="ls-h-' + id + '"><div class="leads-sec-head"><h3 class="type-title-14" id="ls-h-' + id + '">' + esc(title) + '</h3>' + (end || '') + '</div>' + inner + '</section>'; }
  function sel(id, label, value, opts) {
    var cur = opts.filter(function (o) { return o[0] === value; })[0] || opts[0];
    return '<button type="button" class="select select--sm select--auto" data-select data-ls="' + id + '" aria-controls="' + id + '-lb" aria-label="' + esc(label) + ': ' + esc(cur[1]) + '"><span class="select-value">' + esc(cur[1]) + '</span>' + V.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="' + id + '-lb" role="listbox" aria-label="' + esc(label) + '" hidden>' + opts.map(function (o) { return '<div class="option" role="option" data-value="' + esc(o[0]) + '" aria-selected="' + (o[0] === cur[0]) + '"' + (o[2] ? ' aria-disabled="true"' : '') + '><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span>' + (o[2] ? '<span class="option-desc">' + esc(o[2]) + '</span>' : '') + '</span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div>';
  }
  function src(t) { return ' <span class="kv-src">' + esc(t) + '</span>'; }
  function overview(l) {
    var h = '';
    var ns = '';
    if (l.callbackAt && !L.capOff('B5')) { var od = L.callbackOverdue(l); ns = '<p class="status status--md status--warning">' + V.icon('clock') + (od ? 'Callback overdue · was due ' + esc(F.when(l.callbackAt, { time: true }).toLowerCase()) + ' IST' : 'Callback due ' + esc(F.when(l.callbackAt, { time: true }).replace('Today', 'today').replace('Tomorrow', 'tomorrow')) + ' IST') + ' · <button type="button" class="btn btn--link" data-ls-act="callback">Reschedule</button></p>'; }
    else if (l.lastCall && l.lastCall.result === 'timed_out') ns = '<p class="status status--md status--warning">' + V.icon('clock') + 'Last call timed out · no update since ' + esc(F.date(l.lastCall.at)) + ', ' + esc(F.time(l.lastCall.at)) + ' · <button type="button" class="btn btn--link" data-ls-act="checkstatus">Check status</button></p>';
    if (ns) h += section('next', 'Next step', ns);
    var lang = l.language ? V.ui.langMark(l.language, 'name') + src(l.source === 'Import' ? 'from import' : l.lastCall ? 'heard on the call on ' + F.dateShort(l.lastCall.at) : 'set by hand') : '<span class="kv-empty">Not set</span>';
    var phone = V.ui.phoneText(l.phone) + (L.isAdmin() ? ' <button type="button" class="btn btn--link" data-ls-act="reveal" aria-label="Reveal the full number">Reveal</button>' : '<span class="kv-src">Only admins can see full numbers.</span>');
    if (edit) {
      h += section('contact', 'Contact', '<div class="leads-edit l-stack l-stack--md">' + field('ls-e-name', 'Name', l.name) + '<div class="field"><label class="field-label" for="ls-e-phone">Phone</label><div class="input input--readonly"><input id="ls-e-phone" value="' + esc(l.phone.masked) + '" readonly aria-describedby="ls-e-phone-h"></div><p class="field-hint" id="ls-e-phone-h">' + (L.isAdmin() ? 'Full numbers aren’t shown in this prototype. Admins edit the number here.' : 'Only admins can see full numbers.') + '</p></div>' +
        field('ls-e-email', 'Email', l.email || '', true, 'email') + field('ls-e-city', 'City', l.city || '', true) + field('ls-e-state', 'State', l.state || '', true) +
        '<div class="field"><span class="field-label" id="ls-e-lang-l">Language <span class="field-opt">(optional)</span></span>' + sel('ls-e-lang', 'Language', l.language || 'none', [['none', 'Not set']].concat(DATA.languages.map(function (x) { return [x.code, x.name]; }))) + '</div></div>', '');
    } else {
      h += section('contact', 'Contact', '<dl class="kv">' + kv('Phone', phone) + kv('Email', l.email ? esc(l.email) : 'Not captured', l.email ? '' : 'kv-empty') + kv('City', l.city ? esc(l.city) : 'Not captured', l.city ? '' : 'kv-empty') + kv('State', l.state ? esc(l.state) : 'Not captured', l.state ? '' : 'kv-empty') + kv('Language', lang) + kv('Source', esc(l.source) + (l.importFile ? src(l.importFile) : '')) + '</dl>',
        '<button type="button" class="btn btn--tertiary btn--sm" data-ls-act="edit">' + V.icon('pencil', 'sm') + 'Edit details…</button>');
    }
    var st = sel('ls-status', 'Status', l.status, L.STATUS_ORDER.filter(function (s) { return s === l.status || !(s === 'callback_due' && L.capOff('B5')); }).map(function (s) { return [s, V.statusDef('lead', s)[0]]; }));
    var interest = l.interest == null ? '<span class="kv-empty">Not scored</span>' : '<span class="meter" role="img" aria-label="Interest ' + l.interest + ' of 100">' + l.interest + '<i data-mark><b style="width: ' + l.interest + '%"></b></i></span>' + (l.lastCall ? src('from the call on ' + F.dateShort(l.lastCall.at)) : '');
    var cb = (l.callbackAt ? esc(F.when(l.callbackAt, { time: true })) + ' IST ' : '') + '<button type="button" class="btn btn--link" data-ls-act="callback">' + (l.callbackAt ? 'Change' : 'Set a callback…') + '</button>';
    var owners = [['none', 'Unassigned']].concat(['Anika R.', 'Rohit S.', 'Dev M.', 'Farah K.', 'Kiran P.'].map(function (o) { return [o, o]; }));
    var flows = [['default', 'Workspace default · Site-visit qualifier v7']].concat(DATA.flows.filter(function (f) { return f.status === 'live'; }).map(function (f) { return [f.id, f.name + ' v' + f.live.version]; }));
    h += section('pipe', 'Pipeline', '<dl class="kv">' + kv('Status', st + '<span class="leads-save" id="ls-status-save" role="status"></span>') + kv('Interest', interest) + (L.capOff('B5') ? '' : kv('Callback', cb)) + kv('Owner', sel('ls-owner', 'Owner', l.owner || 'none', owners)) + kv('Flow', sel('ls-flow', 'Flow', l.flowId || 'default', flows)) + '</dl>');
    var cap = L.capturedFor(l);
    if (cap) { var got = cap.filter(function (c) { return c.value; }).length, hist = L.historyFor(l).filter(function (x) { return x.kind === 'call' && x.result === 'completed'; })[0];
      h += section('cap', 'Captured on the last call', (got ? '<dl class="kv">' + cap.map(function (c) { return kv(c.key, c.value ? esc(c.value) : 'Not captured', c.value ? '' : 'kv-empty'); }).join('') + '</dl>' : '<p class="empty empty--compact">Nothing captured</p>') + (hist ? '<p><a class="btn btn--link" href="' + esc(L.reportHref(hist)) + '">Open call report</a></p>' : ''), '<span class="type-meta-12 u-fg-3 num">' + got + ' of ' + cap.length + '</span>'); }
    if (l.budget || l.unit) h += section('custom', 'Extra columns from import', '<dl class="kv">' + (l.budget ? kv('Budget', esc(l.budget)) : '') + (l.unit ? kv('Unit', esc(l.unit)) : '') + '</dl>');
    return h;
  }
  function field(id, label, value, opt, type) { return '<div class="field"><label class="field-label" for="' + id + '">' + esc(label) + (opt ? ' <span class="field-opt">(optional)</span>' : '') + '</label><div class="input"><input id="' + id + '"' + (type ? ' type="' + type + '"' : '') + ' value="' + esc(value) + '" data-orig="' + esc(value) + '" autocomplete="off"></div></div>'; }

  /* /call-reports?call={id} (03 §6.9). Without a ledger id: a call the fixture ledger lacks lists this lead’s calls (search by
     the number, x.q); a call placed on this page (not in the ledger yet) opens today’s outbound calls. */
  L.reportHref = function (x) { return 'call-reports.html' + (x.id ? '?call=' + encodeURIComponent(x.id) : x.q ? '?q=' + encodeURIComponent(x.q) : x.at && x.at.slice(0, 10) === DATA.meta.today ? '?when=today&f.direction=outbound' : ''); };
  /* overlay §4.3 "Not in current results": a neutral Notice at the top of the sheet, above the tabs, whichever tab is open */
  function notice(l) {
    var n = $('#ls-notice'), out = !!(l && !l.deleted && L.last && !L.last.rows.some(function (x) { return x.id === l.id; }));
    if (!out) { if (!n.hidden) { n.hidden = true; n.innerHTML = ''; n.removeAttribute('data-k'); } return; }
    /* search or filters hide it: Clear filters (the spec’s action); only the view hides it: Show all leads */
    var k = L.hasNarrowing() ? 'f' : 'v';
    if (n.hidden || n.getAttribute('data-k') !== k) { n.innerHTML = '<div class="notice notice--neutral" role="status">' + V.icon('info') + '<span class="notice-body">Not in the current results.</span><span class="notice-acts"><button type="button" class="notice-act" data-ls-act="clearf">' + (k === 'f' ? 'Clear filters' : 'Show all leads') + '</button></span></div>'; n.setAttribute('data-k', k); }
    n.hidden = false;
  }
  L.sheetNotice = function () { if (L.sheetOpen()) notice(lead()); };

  /* ---------- Calls tab (Timeline) ---------- */
  var TONE = { completed: 'success', no_answer: '', busy: '', voicemail: '', failed: 'danger', timed_out: 'warning' };
  function callsTab(l) {
    if (L.demo('sheet-calls-failed')) return '<div class="ierr" role="status"><div class="ierr-line">' + V.icon('circle-alert') + '<span>Couldn’t load calls. <button type="button" class="btn btn--link" data-ls-act="retrycalls">Retry</button></span></div></div>';
    var items = L.historyFor(l); if (!olderShown) items = items.slice(0, 6);
    if (!items.length) return '<p class="empty empty--compact">No calls yet.</p>';
    return '<div class="tl"><ol class="tl-list">' + items.map(function (x) {
      var time = '<time class="tl-time" datetime="' + esc(x.at) + '" data-tooltip="' + esc(F.whenAbs(x.at)) + '">' + esc(L.when(x.at, { time: true })) + '</time>';
      if (x.kind === 'call') {
        if (x.result === 'timed_out') return '<li class="tl-item"><span class="tl-node tl-node--warning">' + V.icon('clock') + '</span><span class="tl-text">Phone call · <b>Timed out</b> · no update since ' + esc(F.dateShort(x.at)) + ', ' + esc(F.time(x.at)) + '</span>' + time + '<div class="tl-actions"><button class="btn btn--sm btn--tertiary" type="button" data-ls-act="checkstatus">Check status</button></div></li>';
        var tone = TONE[x.result] || '', good = x.outcome === 'Visit booked' || x.outcome === 'Interested';
        return '<li class="tl-item"><span class="tl-node' + (good ? ' tl-node--success' : tone === 'danger' ? ' tl-node--danger' : '') + '">' + V.icon(x.result === 'completed' ? 'phone-outgoing' : 'phone-missed') + '</span><span class="tl-text"><b>Vaani</b> called · ' + esc(x.outcome || '') + (x.durationSec ? ' · <span class="num">' + esc(F.duration(x.durationSec)) + '</span>' : '') + '<span class="u-block type-meta-12 u-fg-3" translate="no">' + esc(x.flow) + '</span></span>' + time +
          (x.turn ? '<div class="tl-detail">' + V.ui.langMark(x.turn.lang || 'hi-Latn', 'compact') + ' <span lang="' + esc(x.turn.lang || 'hi-Latn') + '">“' + esc(x.turn.text) + '”</span></div>' : '') +
          (x.result === 'completed' ? '<div class="tl-actions"><a class="btn btn--sm btn--tertiary" href="' + esc(L.reportHref(x)) + '">Open call report</a></div>' : '') + '</li>';
      }
      if (x.kind === 'status') return '<li class="tl-item"><span class="tl-node">' + V.icon('circle-dot') + '</span><span class="tl-text">Status changed from <b>' + esc(x.from) + '</b> to <b>' + esc(x.to) + '</b> by the Outcome step</span>' + time + '</li>';
      if (x.kind === 'callback') return '<li class="tl-item"><span class="tl-node">' + V.icon('calendar-clock') + '</span><span class="tl-text">Callback set for <b>' + esc(F.when(x.when, { time: true })) + '</b></span>' + time + '</li>';
      return '<li class="tl-item"><span class="tl-node">' + V.icon(x.file ? 'upload' : 'user-plus') + '</span><span class="tl-text">Lead added · ' + esc(x.source) + (x.file ? ' · <span translate="no">' + esc(x.file) + '</span>' : '') + '</span>' + time + '</li>';
    }).join('') + '</ol></div>' + (!olderShown && L.historyFor(l).length > 6 ? '<button type="button" class="btn btn--tertiary btn--sm" data-ls-act="older">Show older activity</button>' : '');
  }
  /* ---------- Notes tab ---------- */
  function notesTab(l) {
    var mine = DATA.user.short;
    return '<div class="field"><label class="field-label" for="ls-note">Add a note</label><textarea class="textarea" id="ls-note" rows="3" placeholder="Asked for the brochure in Hindi…"></textarea><div class="field-foot"><p class="field-hint">Everyone in the workspace can read notes.</p><button type="button" class="btn btn--sm u-ml-auto" data-ls-act="addnote" data-tooltip="Add note" data-kbd="mod+enter">Add note</button></div></div>' +
      (l.notes.length ? '<div class="tl"><ol class="tl-list">' + l.notes.map(function (n, i) { return '<li class="tl-item">' + V.ui.avatar(n.by, { size: 20 }) + '<span class="tl-text"><b>' + esc(n.by) + '</b> added a note</span><time class="tl-time" datetime="' + esc(n.at) + '">' + esc(L.when(n.at, { time: true })) + '</time><div class="tl-detail" data-note="' + i + '">' + esc(n.text) + '</div>' + (n.by === mine ? '<div class="tl-actions"><button type="button" class="btn btn--sm btn--tertiary" data-ls-act="delnote" data-i="' + i + '" aria-label="Delete note from ' + esc(L.when(n.at, { time: true })) + '">' + V.icon('trash-2', 'sm') + 'Delete note</button></div>' : '') + '</li>'; }).join('') + '</ol></div>' : '<p class="empty empty--compact">No notes yet.</p>');
  }

  /* ---------- fill ---------- */
  function foot(l) {
    var f = $('#lead-sheet-foot');
    if (edit) { var n = dirtyCount(); f.innerHTML = '<span class="u-grow type-label-13" role="status">' + (n ? 'Unsaved changes · ' + L.plural(n, 'field') : 'No changes yet') + '</span><button class="btn btn--tertiary" type="button" data-ls-act="discard">Discard</button><button class="btn btn--primary" type="button" data-ls-act="saveedit">Save changes</button>'; return; }
    var b = L.leadBlocker(l);
    /* R3D-09 (core §1.6): a disabled Call… points at a visible reason, inline in the footer, with the way out as a link */
    var why = b ? '<p class="status status--warning status--wrap leads-foot-why" id="ls-call-why">' + V.icon('triangle-alert', 'sm') + '<span>' + esc(b.reason) + (b.href ? ' <a href="' + esc(b.href) + '">' + esc(b.fix.label) + '</a>' : '') + '</span></p>' : '';
    f.innerHTML = why + '<button class="btn btn--primary leads-foot-btn" type="button" id="ls-call" aria-haspopup="dialog" aria-label="Call ' + esc(l.name) + '…"' + (b ? ' aria-disabled="true" aria-describedby="ls-call-why" data-tooltip="' + esc(b.reason) + '"' : ' data-tooltip="Call…" data-kbd="c"') + '>' + V.icon('phone') + 'Call…</button><button class="btn leads-foot-btn" type="button" data-ls-act="whatsapp">WhatsApp…</button>';
  }
  L.refreshSheet = function (o) {
    o = o || {}; var l = lead(); if (!l || !L.sheetOpen()) return;
    var body = $('#lead-sheet-body');
    $('#lead-sheet-t').textContent = l.name || 'Unnamed lead · ' + l.phone.short;
    notice(L.demo('sheet-deleted') ? null : l);
    $('#lead-sheet-meta').innerHTML = V.ui.statusTag('lead', l.status) + ' Added ' + esc(F.date(l.createdAt)) + ' · ' + esc(l.source) + (l.importFile ? ' · ' + esc(l.importFile) : '');
    $('#ls-more').setAttribute('aria-label', 'More actions for ' + l.name);
    var idx = L.last ? L.last.rows.indexOf(l) : -1;
    $('#ls-prev').setAttribute('aria-disabled', idx <= 0 ? 'true' : 'false'); $('#ls-next').setAttribute('aria-disabled', idx < 0 || idx >= L.last.rows.length - 1 ? 'true' : 'false');
    var calls = L.historyFor(l).filter(function (x) { return x.kind === 'call'; }).length;
    $('#ls-tab-calls').innerHTML = 'Calls <span class="vtab-count">' + calls + '</span>'; $('#ls-tab-notes').innerHTML = 'Notes' + (l.notes.length ? ' <span class="vtab-count">' + l.notes.length + '</span>' : '');
    var keep = o.keepFocus && body.contains(d.activeElement) ? d.activeElement.id || d.activeElement.getAttribute('data-ls') : null, st = body.scrollTop;
    if (l.deleted || L.demo('sheet-deleted')) { body.innerHTML = '<div class="empty empty--compact">' + V.icon('circle-slash') + '<p>This lead was deleted, or you no longer have access.</p><button type="button" class="btn" data-drawer-close>Close</button></div>'; $('#lead-sheet-foot').hidden = true; return; }
    if (L.demo('sheet-loading')) { body.innerHTML = '<div class="l-stack l-stack--md" aria-busy="true"><span class="sr-only">Loading lead…</span>' + [60, 40, 75, 50, 66, 45, 70].map(function (x) { return '<span class="sk" style="width: ' + x + '%"></span>'; }).join('') + '</div>'; $('#lead-sheet-foot').hidden = true; return; }
    $('#lead-sheet-foot').hidden = false;
    body.innerHTML = '<div role="tabpanel" id="ls-p-overview" aria-labelledby="ls-tab-overview" class="leads-panel"' + (S.tab === 'overview' ? '' : ' hidden') + '>' + overview(l) + '</div>' +
      '<div role="tabpanel" id="ls-p-calls" aria-labelledby="ls-tab-calls" class="leads-panel"' + (S.tab === 'calls' ? '' : ' hidden') + '>' + callsTab(l) + '</div>' +
      '<div role="tabpanel" id="ls-p-notes" aria-labelledby="ls-tab-notes" class="leads-panel"' + (S.tab === 'notes' ? '' : ' hidden') + '>' + notesTab(l) + '</div>';
    $$('#lead-sheet [role="tab"]').forEach(function (t) { var on = t.getAttribute('data-value') === S.tab; t.setAttribute('aria-selected', on); t.setAttribute('tabindex', on ? '0' : '-1'); });
    V.initAll(body); foot(l); body.scrollTop = o.keepScroll ? st : 0;
    if (keep) { var k = d.getElementById(keep) || $('[data-ls="' + keep + '"]', body); if (k) k.focus({ preventScroll: true }); }
    $$('#leads-tbody tr[data-id]').forEach(function (r) { if (r.getAttribute('data-id') === l.id) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); });
  };

  /* ---------- open, follow, close ---------- */
  L.openLead = function (id, o) {
    o = o || {}; var l = L.byId[id]; if (!l) return;
    var was = L.sheetOpen(); if (was && edit && dirtyCount() && S.leadId !== id) { discardInline(); return; }
    edit = null; olderShown = false; S.leadId = id; S.tab = o.tab || (o.fromUrl ? S.tab : 'overview'); L.pushUrl(o.fromUrl);
    V.setTitle(l.name); V.commandPalette.addRecent && V.commandPalette.addRecent({ title: l.name, meta: 'Lead · ' + l.phone.masked, icon: 'users', href: 'leads.html?lead=' + id });
    if (was) { L.refreshSheet(); if (!o.follow) $('#lead-sheet-t').focus(); }
    else {
      L.refreshSheet.pending = true; var sh = $('#lead-sheet'); sh.hidden = false; entry = { closed: false }; L.refreshSheet(); sh.hidden = true;
      entry = V.drawer.open('lead-sheet', { returnTo: o.returnTo || d.activeElement, onClose: onClose });
      entry.guard = function (reason) { if (edit && dirtyCount() && (reason === 'escape' || reason === 'x' || reason === 'scrim')) { entry.pendingClose = true; discardInline(); return false; } };
      if (entry.mode === 'docked') requestAnimationFrame(function () { L.render(); });
    }
    if (o.focusNote) { selectTab('notes'); var ta = $('#ls-note'); if (ta) ta.focus(); }
    if (o.gate) setTimeout(function () { var b = $('#ls-call'); if (b && b.getAttribute('aria-disabled') !== 'true') L.openGate({ mode: 'single', leads: [l], trigger: b, entry: 'palette' }); else if (b) L.blockedActivation(L.leadBlocker(l)); }, 60);
  };
  L.followLead = function (id) { if (edit && dirtyCount()) return; L.openLead(id, { follow: true }); var i = L.last.rows.indexOf(L.byId[id]); V.announce('Lead ' + F.count(i + 1) + ' of ' + F.count(L.last.rows.length), { dedupeKey: 'follow' }); };
  function step(dir) {
    var l = lead(), rows = L.last.rows, i = rows.indexOf(l), n = rows[i + dir]; if (!n) return;
    var pg = Math.floor(rows.indexOf(n) / S.size) + 1; if (pg !== S.page) { S.page = pg; L.render(); }
    S.activeId = n.id; L.followLead(n.id);
    var r = $('#leads-tbody tr[data-id="' + n.id + '"]'); if (r) { $$('#leads-tbody tr[data-id]').forEach(function (x) { x.setAttribute('tabindex', x === r ? '0' : '-1'); }); if (entry && entry.mode !== 'modal') entry.returnTo = r; r.scrollIntoView({ block: 'nearest' }); }
  }
  function onClose(reason) {
    var id = S.leadId; entry = null; edit = null; S.leadId = null; if (reason !== 'popstate') L.pushUrl(); V.setTitle(null);
    $$('#leads-tbody tr[aria-current]').forEach(function (r) { r.removeAttribute('aria-current'); });
    requestAnimationFrame(function () { L.render(); var r = $('#leads-tbody tr[data-id="' + id + '"]'); if (reason === 'deleted' || (r && L.byId[id].deleted)) { var nx = $('#leads-tbody tr[tabindex="0"]'); if (nx) nx.focus(); } });
  }
  L.closeSheet = function (reason) { if (L.sheetOpen()) V.drawer.close('lead-sheet', reason || 'x'); };
  L.syncSheetFromUrl = function (had) { if (S.leadId && S.leadId !== had) L.openLead(S.leadId, { fromUrl: true }); else if (!S.leadId && had && L.sheetOpen()) { S.leadId = had; V.drawer.close('lead-sheet', 'popstate'); } };
  function selectTab(v) { S.tab = v; var t = $('#ls-tab-' + v); if (t) V.tabs.select(t, false); L.pushUrl(true); }

  /* ---------- edit details ---------- */
  function dirtyCount() { if (!edit) return 0; var n = 0; $$('#lead-sheet .leads-edit input[data-orig]').forEach(function (i) { if (i.value !== i.getAttribute('data-orig')) n += 1; }); if (edit.lang !== undefined && edit.lang !== (lead().language || 'none')) n += 1; return n; }
  function discardInline() {
    var f = $('#lead-sheet-foot'), l = lead();
    f.innerHTML = '<p class="u-grow type-meta-12 u-fg-2" role="status">Discard changes to <span translate="no">' + esc(l.name) + '</span>?</p><button class="btn" type="button" data-ls-act="keep">Keep editing</button><button class="btn btn--danger" type="button" data-ls-act="discardnow">Discard</button>';
    $('[data-ls-act="keep"]', f).focus();
  }

  L.initSheet = function () {
    var sh = $('#lead-sheet');
    $('#ls-prev').addEventListener('click', function (e) { if (e.currentTarget.getAttribute('aria-disabled') !== 'true') step(-1); });
    $('#ls-next').addEventListener('click', function (e) { if (e.currentTarget.getAttribute('aria-disabled') !== 'true') step(1); });
    $('#ls-copy').addEventListener('click', function () { L.copyLink(lead()); });
    $('#ls-more').addEventListener('click', function () { var del = $('#leads-sheet-menu [data-value="delete"]'), cp = $('#leads-sheet-menu [data-value="copynum"]'); cp.hidden = !L.isAdmin(); if (L.isAdmin()) { del.removeAttribute('aria-disabled'); } else { del.setAttribute('aria-disabled', 'true'); del.setAttribute('data-reason', 'Only admins can delete leads. Ask an admin.'); } }, true);
    $('#leads-sheet-menu').addEventListener('vaani:menuselect', function (e) {
      var v = e.detail.value, l = lead();
      if (v === 'edit') { selectTab('overview'); edit = {}; L.refreshSheet(); var i = $('#ls-e-name'); if (i) i.focus(); }
      else if (v === 'export') L.exportRows([l], 'lead-' + l.no + '.csv', 'Exported ' + l.name);
      else if (v === 'copynum') V.toast.info('Prototype: full numbers are never shown here. In the product this copies the number and logs it in Activity & audit.');
      else if (v === 'delete') L.deleteLeads([l], { returnTo: $('#ls-more') });
    });
    sh.addEventListener('vaani:tabchange', function (e) { S.tab = e.detail.value; L.pushUrl(true); });
    sh.addEventListener('input', function (e) { if (edit && e.target.closest('.leads-edit')) { var n = dirtyCount(), s = $('#lead-sheet-foot [role="status"]'); if (s) s.textContent = n ? 'Unsaved changes · ' + L.plural(n, 'field') : 'No changes yet'; } });
    sh.addEventListener('keydown', function (e) { if (e.target.id === 'ls-note' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('[data-ls-act="addnote"]').click(); } });
    sh.addEventListener('vaani:change', function (e) {
      var k = e.target.getAttribute('data-ls'), v = e.detail.value, l = lead(); if (!k || !l) return;
      if (k === 'ls-e-lang') { edit.lang = v; var s2 = $('#lead-sheet-foot [role="status"]'); if (s2) s2.textContent = 'Unsaved changes · ' + L.plural(dirtyCount(), 'field'); return; }
      var prev = { status: l.status, owner: l.owner, flow: l.flowId };
      if (k === 'ls-status') { if (L.demo('sheet-save-fail')) { var t = e.target, pv = V.statusDef('lead', prev.status)[0]; setTimeout(function () { $('.select-value', t).textContent = pv; $$('#ls-status-lb .option').forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-value') === prev.status ? 'true' : 'false'); }); $('#ls-status-save').innerHTML = '<span class="status status--danger">' + V.icon('circle-x') + 'Couldn’t save. <button type="button" class="btn btn--link" data-ls-act="retrystatus" data-v="' + v + '">Retry</button></span>'; }, 400); return; } l.status = v; }
      else if (k === 'ls-owner') l.owner = v === 'none' ? null : v; else if (k === 'ls-flow') l.flowId = v === 'default' ? null : v;
      e.target.setAttribute('aria-label', e.target.getAttribute('aria-label').split(':')[0] + ': ' + e.detail.label);
      L.updateLeadCells(l.id); L.render();
      if (k === 'ls-status') { $('#lead-sheet-meta').innerHTML = V.ui.statusTag('lead', l.status) + ' Added ' + esc(F.date(l.createdAt)) + ' · ' + esc(l.source); var sv = $('#ls-status-save'); sv.innerHTML = '<span class="status status--success">' + V.icon('check') + 'Saved</span>'; clearTimeout(saved.t); saved.t = setTimeout(function () { if (sv) sv.innerHTML = ''; }, 4000); }
    });
    sh.addEventListener('click', function (e) {
      if (e.target.closest('#ls-call')) { var l0 = lead(), b0 = L.leadBlocker(l0); if (b0) { L.blockedActivation(b0); return; } L.openGate({ mode: 'single', leads: [l0], trigger: $('#ls-call'), entry: 'sheet' }); return; }
      var a = e.target.closest('[data-ls-act]'); if (!a) return; var k = a.getAttribute('data-ls-act'), l = lead();
      if (k === 'clearf') { if (L.hasNarrowing()) L.clearFilters(); else L.setView('all'); L.refreshSheet(); $('#lead-sheet-t').focus(); }
      else if (k === 'reveal') V.toast.info('Prototype: full numbers are never shown here. In the product, Reveal shows the number to admins and logs it in Activity & audit.');
      else if (k === 'callback') L.openCallback(a, l);
      else if (k === 'checkstatus') V.toast.info('Asked the phone line for this call’s status. It updates here when it answers.');
      else if (k === 'whatsapp') V.toast.info('WhatsApp templates open here in the product. The “visit_confirm” template is pending approval.');
      else if (k === 'older') { olderShown = true; L.refreshSheet({ keepScroll: true }); }
      else if (k === 'retrycalls') { delete S.demo['sheet-calls-failed']; L.syncDemoUrl && L.syncDemoUrl(); L.refreshSheet(); }
      else if (k === 'retrystatus') { delete S.demo['sheet-save-fail']; L.syncDemoUrl && L.syncDemoUrl(); l.status = a.getAttribute('data-v'); L.render(); L.refreshSheet({ keepFocus: true }); $('#ls-status-save').innerHTML = '<span class="status status--success">' + V.icon('check') + 'Saved</span>'; $('[data-ls="ls-status"]').focus(); }
      else if (k === 'addnote') { var ta = $('#ls-note'), tx = ta.value.trim(); if (!tx) { ta.focus(); V.announce('Write a note first'); return; } l.notes.unshift({ by: DATA.user.short, at: DATA.meta.now, text: tx }); L.refreshSheet(); $('#ls-note').focus(); V.announce('Note added'); }
      else if (k === 'delnote') { var i = +a.getAttribute('data-i'), n = l.notes.splice(i, 1)[0]; L.refreshSheet(); $('#ls-note').focus(); V.toast.undo('Deleted note', { action: { label: 'Undo', onClick: function () { l.notes.splice(i, 0, n); L.refreshSheet(); } } }); }
      else if (k === 'edit') { edit = {}; L.refreshSheet(); $('#ls-e-name').focus(); }
      else if (k === 'discard' || k === 'discardnow') { edit = null; L.refreshSheet(); $('#lead-sheet-t').focus(); if (k === 'discardnow' && entry && entry.pendingClose) entry.close('x'); }
      else if (k === 'keep') { foot(l); var f0 = $('#lead-sheet .leads-edit input'); if (f0) f0.focus(); }
      else if (k === 'saveedit') { var nm = $('#ls-e-name').value.trim(); if (!nm) { $('#ls-e-name').setAttribute('aria-invalid', 'true'); $('#ls-e-name').focus(); V.announce('Enter the lead’s name.'); return; } l.name = nm; l.email = $('#ls-e-email').value.trim() || null; l.city = $('#ls-e-city').value.trim() || null; l.state = $('#ls-e-state').value.trim() || ''; if (edit.lang !== undefined) l.language = edit.lang === 'none' ? null : edit.lang; edit = null; L.render(); L.refreshSheet(); V.setTitle(l.name); $('#lead-sheet-t').focus(); V.announce('Saved'); }
    });
    V.shortcuts.register('j', function () { step(1); }, { description: 'Next lead in the open sheet', group: 'Records and sheets', scope: 'leads-sheet-head' });
    V.shortcuts.register('k', function () { step(-1); }, { description: 'Previous lead in the open sheet', group: 'Records and sheets', scope: 'leads-sheet-head' });
    /* callback popover */
    $('#leads-cb-form').addEventListener('submit', function (e) { e.preventDefault(); var l = lead(), day = +($('#lcb-day').getAttribute('data-value') || 0), tm = $('#lcb-time').getAttribute('data-value') || '16:00'; l.callbackAt = DATA._util.ist(-day, tm); V.popover.close('leads-cb-form'); L.render(); L.refreshSheet(); V.announce('Callback set for ' + F.when(l.callbackAt, { time: true })); });
    $('#leads-cb-clear').addEventListener('click', function () { var l = lead(); l.callbackAt = null; V.popover.close('leads-cb-form'); L.render(); L.refreshSheet(); V.announce('Callback cleared'); });
  };
  L.openCallback = function (trigger, l) {
    var days = [], times = []; for (var k = 0; k < 7; k++) { var iso = DATA._util.ist(-k, '00:00'); days.push([String(k), k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : F.weekday(iso) + ' ' + F.dateShort(iso)]); }
    for (var hh = 10; hh < 19; hh++) ['00', '30'].forEach(function (m) { var t = (hh < 10 ? '0' : '') + hh + ':' + m; times.push([t, F.time(DATA._util.ist(0, t))]); });
    var opt = function (id, label, list, cur) { return '<div class="field"><span class="field-label" id="' + id + '-l">' + label + '</span><button type="button" class="select select--sm" data-select id="' + id + '" data-value="' + cur + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v">' + esc(list.filter(function (x) { return x[0] === cur; })[0][1]) + '</span>' + V.icon('chevron-down', 'sm') + '</button><div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + list.map(function (x) { return '<div class="option" role="option" data-value="' + x[0] + '" aria-selected="' + (x[0] === cur) + '"><span class="option-main"><span class="option-label">' + esc(x[1]) + '</span></span><span class="option-check">' + V.icon('check') + '</span></div>'; }).join('') + '</div></div>'; };
    $('#leads-cb-body').innerHTML = '<div class="leads-pick-range">' + opt('lcb-day', 'Day', days, '1') + opt('lcb-time', 'Time (IST)', times, '16:00') + '</div><p class="field-hint">Inside calling hours: Mon–Sat 10 am to 7 pm, Sun 11 am to 5 pm.</p>';
    V.initAll($('#leads-cb-body')); $('#leads-cb-clear').hidden = !l.callbackAt;
    V.popover.open(trigger, 'leads-cb-form', { placement: 'bottom-start' });
  };
})(window, document);
