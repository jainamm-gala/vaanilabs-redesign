/* Vaani Labs prototype · Call reports · the call detail sheet (spec §2.6): 560 px, docked ≥ 1440, non-modal overlay
   1024–1439, modal below 1024, full screen below 768. The body is the only scroll container. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, NS = w.VaaniCallReports, P = NS.page, $ = U.$, $$ = U.$$, esc = U.esc, fmt = V.fmt;
  var sheet = function () { return $('#cr-sheet'); };
  NS.callById = function (id) { return NS.byId[id] || P.extra.filter(function (c) { return c.id === id; })[0] || null; };

  /* ---------- open, step, close ---------- */
  NS.openCall = function (id, o) {
    o = o || {};
    var c = NS.callById(id), el = sheet(), first = !V.drawer.isOpen(el);
    P.openId = id; P.st.call = id; P.st.tab = o.tab || (first ? P.st.tab || 'transcript' : P.st.tab) || 'transcript'; P.st.t = o.t != null ? o.t : null;
    if (first || o.snapshot) P.snap = { ids: P.rows.map(function (x) { return x.id; }), asOf: fmt.now().toISOString(), view: P.st.view, skipped: {} };
    if (first) {
      P.sheetEntry = V.drawer.open(el, { returnTo: o.returnTo || d.activeElement, onClose: onClose });
      P.sheetMode = P.sheetEntry.mode;
      el.setAttribute('data-mode', P.sheetMode);
      if (P.sheetMode === 'docked') NS.renderTable();
    }
    NS.renderSheet(c);
    if (o.push !== false) P.writeUrl(!!first && !o.replace);
    if (c) V.commandPalette.addRecent({ title: P.callTitle(c), meta: 'Call reports', icon: 'file-text', href: P.href(c) });
    if (c) V.setTitle(P.callTitle(c));
    NS.markOpenRow();
    if (!first && o.focusTitle !== false) $('#cs-title').focus({ preventScroll: true });
    if (first && !P.sheetMode) $('#cs-title').focus();
    return c;
  };
  function onClose(reason) {
    NS.player && NS.player.stop();
    var id = P.openId; P.openId = null; P.st.call = null; P.st.tab = 'transcript'; P.st.t = null; P.snap = null;
    var wasDocked = P.sheetMode === 'docked'; P.sheetMode = null; sheet().removeAttribute('data-mode');
    if (reason !== 'navigate') P.writeUrl(false);
    V.setTitle(null);
    if (wasDocked) NS.renderTable(); else NS.markOpenRow();
    var r = $('#cr-tbody tr[data-id="' + id + '"]'), li = $('#cr-list a[data-open="' + id + '"]');
    var back = V.bp.phone() ? li : r;
    if (P.sheetEntry && back && U.visible(back)) P.sheetEntry.returnTo = back;
    if (back && r) $$('#cr-tbody tr').forEach(function (x) { x.setAttribute('tabindex', x === r ? '0' : '-1'); });
    P.sheetEntry = null;
  }
  NS.closeSheet = function (reason) { V.drawer.close(sheet(), reason || 'x'); };
  NS.markOpenRow = function () {
    $$('#cr-tbody tr').forEach(function (r) { if (r.getAttribute('data-id') === P.openId) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); });
    $$('#cr-list a[data-open]').forEach(function (a) { if (a.getAttribute('data-open') === P.openId) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  /* After every table render: keep the open row marked and make Esc return to the fresh row element. */
  NS.sheetSync = function () {
    NS.markOpenRow();
    if (P.sheetEntry && P.openId) { var r = V.bp.phone() ? $('#cr-list a[data-open="' + P.openId + '"]') : $('#cr-tbody tr[data-id="' + P.openId + '"]'); if (r) P.sheetEntry.returnTo = r; }
  };
  /* J/K and the chevrons walk the snapshot taken when the sheet opened, across pages (§2.6.4 rule 1). */
  NS.step = function (dir) {
    if (!P.snap || !P.openId) return;
    var ids = P.snap.ids, i = ids.indexOf(P.openId), j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) { V.announce(dir > 0 ? 'Last call in this list' : 'First call in this list'); return; }
    NS.goTo(ids[j], { announce: true });
  };
  NS.goTo = function (id, o) {
    o = o || {};
    var ids = P.snap ? P.snap.ids : [], j = ids.indexOf(id), page = j >= 0 ? Math.floor(j / P.st.size) + 1 : P.st.page;
    if (page !== P.st.page) { P.st.page = page; P.run(); NS.render(); }
    NS.openCall(id, { push: true, replace: true, focusTitle: o.focusTitle !== false });
    if (o.announce && j >= 0) V.announce('Call ' + fmt.count(j + 1) + ' of ' + fmt.count(ids.length), { dedupeKey: 'cr-step' });
    var r = $('#cr-tbody tr[data-id="' + id + '"]'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'nearest' });
  };

  /* ---------- render ---------- */
  function capturedCount(c) { return (c.captured || []).filter(function (x) { return x.value; }).length; }
  function firstSentence(s) { var m = /^(.+?[.!?])(\s|$)/.exec(s || ''); return m ? m[1] : s; }
  NS.metaLine = function (c) {
    var bits = [c.direction === 'inbound' ? 'Inbound' : 'Outbound', c.durationSec ? fmt.duration(c.durationSec) : 'no talk time'];
    if (c.flow) bits.push(c.flow.name + ' v' + c.flow.version);
    if (c.recording && c.recording.available) bits.push('recording disclosed at ' + fmt.timecode(c.recording.disclosedAtSec));
    return bits.join(' · ');
  };
  NS.renderSheet = function (c) {
    var el = sheet(), title = $('#cs-title');
    $('#cs-bnotice').hidden = true; $('#cs-done').hidden = true; $('#cs-ierr').hidden = true;
    $$('.cs-panel', el).forEach(function (p) { p.innerHTML = ''; });
    el.classList.remove('cs-is-done', 'cs-is-gone');
    if (!c) { /* Sheet: call gone (§2.7) */
      title.textContent = 'Call not found'; el.classList.add('cs-is-gone');
      $('#cs-glance').innerHTML = ''; $('#cs-foot').innerHTML = '';
      var done = $('#cs-done'); done.hidden = false;
      done.innerHTML = '<div class="empty empty--compact">' + V.icon('file-minus', 'lg') + '<h3 class="empty-title">This call was deleted, or you no longer have access.</h3><div class="empty-actions"><button type="button" class="btn" data-close-sheet>Close</button></div></div>';
      $$('.cs-panel', el).forEach(function (p) { p.hidden = true; }); $('#cs-tabs').hidden = true;
      return;
    }
    $('#cs-tabs').hidden = false;
    title.innerHTML = '<span translate="no">' + esc(P.callWho(c)) + '</span> · ' + esc(fmt.when(c.at, { time: true }));
    var q = [];
    if (c.test) q.push(NS.kindTag(c));
    if (c.legs === 2) q.push('<span class="tag tag--outline" data-tooltip="Recorded as two legs. Counted once." tabindex="0">2 legs</span>');
    if (c.reviewed) q.push(V.ui.statusTag('review', 'reviewed'));
    var langs = (c.languages || []).map(function (x) { return V.ui.langMark(x, 'full'); }).join('');
    var talked = c.result === 'completed' || c.result === 'voicemail';
    var sum = !talked ? '' : c.pendingAnalysis ? '<p class="cs-sum cs-sum--none">Analysing this call…</p>' : c.summary ? '<div class="cs-sumrow"><p class="cs-sum">' + esc(firstSentence(c.summary)) + '</p><button type="button" class="btn btn--link cs-full" data-full-summary>Full summary</button></div>' : '<p class="cs-sum cs-sum--none">Not analysed yet</p>';
    $('#cs-glance').innerHTML = '<div class="cs-glance-row">' + NS.outcomeHtml(c, { size: 'lg' }) + NS.sentimentHtml(c) + langs + '</div>' +
      '<div class="cs-glance-row cs-meta"><span>' + esc(NS.metaLine(c)) + '</span>' + q.join('') + '</div>' + sum;
    var n = capturedCount(c), total = (c.captured || []).length;
    $('#cs-capcount').textContent = total ? String(n) : '';
    $('#cs-capcount').hidden = !total;
    var notice = null;
    if (P.snap && P.snap.ids.indexOf(c.id) < 0 && P.rows.map(function (x) { return x.id; }).indexOf(c.id) < 0) notice = '<div class="notice notice--neutral" role="status">' + V.icon('info') + '<span class="notice-body">Not in the current results.</span><span class="notice-acts"><button type="button" class="notice-act" data-clear-filters>Clear filters</button></span></div>';
    if (c.staleSince) notice = '<div class="notice notice--warning notice--multi" role="status">' + V.icon('clock') + '<span class="notice-body">No update since ' + esc(fmt.dateShort(c.staleSince) + ', ' + fmt.time(c.staleSince)) + '. The call probably didn’t connect.</span></div>';
    if (notice) { $('#cs-bnotice').hidden = false; $('#cs-bnotice').innerHTML = notice; }
    setTab(P.st.tab || 'transcript');
    renderPanel(c, P.st.tab || 'transcript');
    NS.renderFoot && NS.renderFoot(c);
    $('#cs-prev').setAttribute('aria-disabled', P.snap && P.snap.ids.indexOf(c.id) > 0 ? 'false' : 'true');
    $('#cs-next').setAttribute('aria-disabled', P.snap && P.snap.ids.indexOf(c.id) >= 0 && P.snap.ids.indexOf(c.id) < P.snap.ids.length - 1 ? 'false' : 'true');
    V.initAll($('#cs-glance'));
    $('#cs-body').scrollTop = 0;
  };
  /* Select a panel tab without firing tabchange (the sheet renders the panel itself). */
  function setTab(tab) {
    $$('#cs-tablist [role="tab"]').forEach(function (t) { var on = t.getAttribute('data-value') === tab; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.setAttribute('tabindex', on ? '0' : '-1'); $('#' + t.getAttribute('aria-controls')).hidden = !on; });
  }
  function renderPanel(c, tab) {
    var p = $('#cs-p-' + tab); if (!p) return;
    if (P.flag('sheet-loading')) { p.innerHTML = skeleton(); p.setAttribute('aria-busy', 'true'); return; }
    p.removeAttribute('aria-busy');
    if (tab === 'transcript') NS.renderTranscript(c, p);
    else if (tab === 'summary') p.innerHTML = summaryHtml(c);
    else p.innerHTML = capturedHtml(c);
    V.initAll(p);
  }
  NS.renderPanel = renderPanel;
  function skeleton() { return '<div class="cs-sk" aria-hidden="true"><span class="sk sk--block cr-sk-player"></span>' + [70, 54, 82, 40, 66].map(function (x) { return '<span class="sk" style="width: ' + x + '%"></span>'; }).join('') + '</div><span class="sr-only">Loading call…</span>'; }
  function kv(rows) { return rows.filter(Boolean).map(function (r) { return '<div class="kv-row' + (r[2] ? ' ' + r[2] : '') + '"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join(''); }
  var SUGGEST = { 'Not interested': ['Ask whether they are still looking before offering a site visit.'], none: ['Callers hang up after the site-visit question. Offer two slots instead of asking an open question.', 'Say the price range earlier: 3 of the last 10 callers asked for it first.'],
    'Callback': ['Offer the next free slot when the caller is busy, instead of an open callback.'], 'Transferred': ['Ask for the loan amount before transferring, so the advisor has it.'] };
  function summaryHtml(c) {
    var busy = P.reanalysing === c.id;
    var status = busy ? '<p class="status status--progress">' + V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Re-analysing… · about 20 s</p>'
      : c.analysedAt ? '<p class="status">' + V.icon('check', 'sm') + 'Analysed ' + esc(fmt.dateShort(c.analysedAt) + ', ' + fmt.time(c.analysedAt)) + ' · <button type="button" class="btn btn--link" data-reanalyse' + (P.offline() ? ' aria-disabled="true" data-tooltip="You’re offline"' : '') + ' data-tooltip-kind="label">Re-analyse call</button></p>' : '<p class="status">Not analysed yet</p>';
    var sug = SUGGEST[c.outcome || (c.result === 'completed' ? 'none' : '')] || [];
    var topics = (c.topics && c.topics.length ? c.topics : c.intent ? [NS.intentLabel(c.intent)] : []);
    var voice = (V.data.voices || [])[0];
    var cost = c.kind === 'browser' ? 'Not billed · browser test' : c.cost ? fmt.money(c.cost) + ' <span class="kv-src">₹0.04/s</span>' : 'Not billed';
    var rec = c.recording && c.recording.available ? 'Disclosed at ' + fmt.timecode(c.recording.disclosedAtSec) : esc(c.recording && c.recording.offReason ? c.recording.offReason.replace(/\.$/, '') : 'No recording');
    var started = fmt.date(c.at) + ', ' + fmt.time(c.at).replace(/(\d+:\d+)/, '$1:' + (c.sec < 10 ? '0' : '') + c.sec) + ' IST';
    return '<section class="cs-sec" aria-labelledby="cs-an-h"><h3 class="cs-h" id="cs-an-h">Analysis</h3><dl class="kv">' + kv([
      ['Sentiment', NS.sentimentHtml(c)],
      c.satisfaction ? ['Caller satisfaction', esc(c.satisfaction)] : null,
      ['Summary', c.summary ? '<span class="cs-read">' + esc(c.summary) + '</span>' : '<span class="kv-empty">Not analysed yet</span>', 'cs-kv-stack'],
      ['Topics', topics.length ? topics.slice(0, 6).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') : '<span class="kv-empty">None yet</span>']
    ]) + '</dl>' + (sug.length ? '<h4 class="cs-h4">Suggestions for this flow</h4><ul class="cs-sug">' + sug.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '') + status + '</section>' +
      '<section class="cs-sec" aria-labelledby="cs-call-h"><h3 class="cs-h" id="cs-call-h">Call</h3><dl class="kv">' + kv([
      ['Result', V.ui.statusTag('callResult', c.result)],
      ['Outcome', c.outcome ? V.ui.statusTag('outcome', c.outcome) : '<span class="kv-empty">No outcome</span>'],
      ['Direction', NS.dirHtml(c)],
      ['Kind', c.kind === 'browser' ? 'Browser test' : c.kind === 'test' ? 'Test call' : 'Real call'],
      ['Phone', c.phone ? V.ui.phoneText(c.phone) + (P.member ? '' : ' <button type="button" class="btn btn--link" data-reveal>Reveal</button>') : '<span class="kv-empty">Withheld</span>'],
      ['Caller ID used', esc((V.data.org.callerId || {}).masked || '')],
      ['Flow', c.flow ? '<a href="flow-designer.html?flow=' + esc(c.flow.id) + '&amp;version=' + c.flow.version + '">' + esc(c.flow.name + ' v' + c.flow.version) + '</a>' : '<span class="kv-empty">No flow</span>'],
      ['Voice', voice ? V.ui.avatar(voice.name, { kind: 'voice', tile: voice.tile, size: 28 }) + '<span translate="no">' + esc(voice.name) + '</span>' : ''],
      ['Languages', (c.languages || []).map(function (x) { return V.langByCode(x).name; }).join(', ') || '–'],
      ['Started', esc(started)],
      ['Talk time', c.durationSec ? esc(fmt.duration(c.durationSec)) : '<span class="kv-empty">No talk time</span>'],
      ['Ring time', esc(fmt.duration(c.ringSec || 5))],
      ['Cost', cost],
      c.legs === 2 ? ['Legs', '2 legs · counted once'] : null,
      ['Call id', '<span class="id-text">' + esc(c.id) + '</span><button type="button" class="ibtn ibtn--sm" data-copy-id aria-label="Copy call id"><i data-icon="copy"></i></button>'],
      ['Recording', rec]
    ]) + '</dl></section>';
  }
  function capturedHtml(c) {
    var list = c.captured || [], got = list.filter(function (x) { return x.value; }).length;
    if (!list.length) return '<p class="empty empty--compact">Nothing captured on this call.</p>';
    var rows = list.map(function (x) {
      var key = esc(x.key) + (list.filter(function (y) { return y.key === x.key; }).length > 1 ? ' <span class="kv-src">step ' + x.stepNo + '</span>' : '');
      var val = x.value ? esc(x.value) + ' <button type="button" class="btn btn--link kv-src" data-seek-cap="' + x.atSec + '" aria-label="' + esc('Play from ' + fmt.timecode(x.atSec) + ', ' + x.stepLabel) + '">at ' + fmt.timecode(x.atSec) + ' · ' + esc(x.stepLabel) + '</button>' : '<span class="kv-empty">Not captured</span>';
      return '<div class="kv-row"><dt>' + key + '</dt><dd>' + val + '</dd></div>';
    }).join('');
    var effect = c.test ? "Test calls don’t change the lead." : c.outcome && c.leadName ? 'Lead status set to ' + (c.outcome === 'Visit booked' ? 'Converted' : c.outcome === 'Callback' || c.outcome === 'Call later' ? 'Callback due' : c.outcome === 'Not interested' ? 'Not interested' : 'Interested') + ' by the Outcome step.' : c.leadName ? 'No outcome was written, so the lead did not change.' : 'No lead is linked to this call.';
    return '<section class="cs-sec" aria-labelledby="cs-cap-h"><h3 class="cs-h" id="cs-cap-h">Captured · ' + got + ' of ' + list.length + '</h3><dl class="kv kv--rows">' + rows + '</dl><p class="cs-effect">' + V.icon('info', 'sm') + esc(effect) + '</p></section>';
  }

  /* ---------- tabs (automatic activation) ---------- */
  d.addEventListener('vaani:tabchange', function (e) {
    if (!e.target.closest || e.target.id !== 'cs-tablist') return;
    var tab = e.detail.value, c = NS.callById(P.openId); P.st.tab = tab; P.writeUrl(false);
    if (c) renderPanel(c, tab);
  });
  NS.showTab = function (tab, focus) { var t = $('#cs-t-' + tab); if (t) V.tabs.select(t, !!focus); };
})(window, document);
