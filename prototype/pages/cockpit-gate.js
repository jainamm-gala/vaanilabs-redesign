/* Vaani Labs prototype · Cockpit · the Call gate (CallGate mode="single" settings="readonly" choice="when-needed",
   G §5.1 and CK §3.4). Opening sends a preflight, never the call; only "Place call" or Ctrl/⌘+Enter confirms, with one
   idempotency key per opening, so a double press makes one call. States: checking · ready · blocked · stale · changed ·
   confirming · failed · done (G §4.1). */
(function (w, d) {
  'use strict';
  var CK = w.VaaniCockpit = w.VaaniCockpit || {};
  var G = CK.gate = {};
  var V, esc, st, el, entry = null, g = null;
  function init() { V = CK.V; esc = CK.esc; st = CK.st; el = d.getElementById('ck-gate'); }

  function title(t) { return t.kind === 'self' ? 'Call your phone' : 'Call ' + CK.targetName(t); }
  function sentence(kind) { return kind === 'test' ? 'Your phone rings when you place the call. Not counted in reports.' : 'Their phone rings when you place the call.'; }
  function scopeHtml(t, f) {
    var v = CK.voiceById(st.voiceId), to;
    /* "a · b · c": each part keeps its separator at the end and never breaks inside, so a line never starts with "·" */
    var segs = function (parts) { return parts.map(function (x, i) { return '<span class="u-nowrap">' + x + (i < parts.length - 1 ? '&nbsp;·' : '') + '</span>'; }).join(' '); };
    if (t.kind === 'lead') to = segs(['<span translate="no">' + esc(t.lead.name) + '</span>', V.ui.phoneText(t.lead.phone), esc(V.langByCode(t.lead.language).name)]);
    else if (t.kind === 'self') to = segs(['Your phone', V.ui.phoneText(CK.self.masked)]);
    else to = segs(['<span class="phone-text" translate="no">' + esc(t.display) + '</span>', 'not a lead']);
    var fl = '<span translate="no">' + esc(f.name) + '</span> ' + (f.draft ? '<span class="tag">Draft v' + f.version + '</span>' : V.ui.statusTag('flow', 'live', { v: f.version })) + '<span class="kv-src">' + (f.draft ? 'test calls only' : f.tested ? 'tested ' + V.fmt.when(f.tested.at).toLowerCase() : 'not tested since publish') + '</span>';
    return '<dl class="kv ck-gate-scope">' +
      '<div class="kv-row"><dt>To</dt><dd>' + to + '</dd></div><div class="kv-row"><dt>Flow</dt><dd>' + fl + '</dd></div>' +
      '<div class="kv-row"><dt>Voice</dt><dd translate="no">' + esc(CK.voiceLine(v)) + '</dd></div><div class="kv-row"><dt>Language</dt><dd>' + esc(CK.langLabel(st.lang)) + '</dd></div>' +
      '<div class="kv-row"><dt>Caller ID</dt><dd>' + V.ui.phoneText(CK.D.org.callerId.masked) + '</dd></div></dl>';
  }
  function checkingRows(kind) {
    var names = kind === 'test' ? ['Checking your wallet…', 'Checking the caller ID…', 'Checking the flow…'] : ['Checking your wallet…', 'Checking the caller ID…', 'Checking calling hours…', 'Checking the DND registry…'];
    return names.map(function (n) { return '<li class="gate-row"><span class="gate-mark gate-mark--checking" aria-hidden="true">' + V.icon('loader-circle', 'xs', { className: 'spinner' }) + '</span><span class="gate-text u-fg-2"><span class="sr-only">Checking: </span>' + n + '</span></li>'; }).join('');
  }
  /* In the gate the calling-hours row is blocking for Place now; choosing Schedule clears it (G §5.1). */
  function rows(kind) {
    var r = CK.readiness(kind, 'gate');
    if (st.gateSchedule) r = r.map(function (x) { return x.hours ? { id: x.id, kind: 'pass', text: 'Scheduled inside calling hours · Mon 28 Sep, 10:00 am IST' } : x; });
    if (g && g.changed) r.unshift({ id: 'wallet_low', kind: 'advisory-warn', text: '₹42.10 left · about 17 min of calls', meta: 'Other calls used your balance since you opened this.', act: { label: 'Top up', run: 'topup' } });
    return r.filter(function (x) { return !(x.id === 'wallet' && g && g.changed); });
  }
  function render() {
    var t = st.target, kind = CK.kindOf(t), f = CK.flow(), all = g.phase === 'checking' ? [] : rows(kind);
    var must = all.filter(function (r) { return !/advisory|adjusted/.test(r.kind); }), know = all.filter(function (r) { return /advisory/.test(r.kind); });
    var s = g.phase === 'checking' ? { tone: 'progress', icon: 'loader-circle', text: 'Checking…' } : CK.summary(all);
    var block = must.filter(function (r) { return r.kind === 'blocking' || r.kind === 'unknown'; })[0];
    var hoursChoice = kind === 'real' && CK.has('after-hours');
    g.blocked = g.phase === 'checking' || !!block; g.why = g.phase === 'checking' ? 'Checking…' : block ? (block.hours ? "Calls can’t start outside calling hours." : block.text) : (st.gateSchedule ? 'The call is placed at 10 am IST and appears in Up next.' : 'The call starts within a few seconds.');
    var fresh = g.stale ? 'Checked ' + Math.max(2, Math.round((CK.now() - g.checkedAt) / 60000)) + ' min ago · <button type="button" class="btn btn--link" data-gate="recheck">Recheck</button>' : 'Checked just now';
    var cost = V.fmt.callRange(1, 1, 2, CK.RATE).split(' · ');
    el.innerHTML =
      '<div class="gate-head"><div class="ck-gate-top"><h2 class="gate-title" id="ck-gate-t" tabindex="-1" data-focus-target>' + (t.kind === 'lead' ? 'Call <span translate="no">' + esc(t.lead.name) + '</span>' : esc(title(t))) + '</h2>' +
        '<button type="button" class="ibtn ibtn--sm" data-gate="close" aria-label="Close">' + V.icon('x', 'sm') + '</button></div>' +
        '<div class="gate-sub">' + CK.kindTag(kind) + '<span id="ck-gate-s" class="u-fg-2">' + esc(sentence(kind)) + '</span><span aria-hidden="true">·</span><span id="ck-gate-fresh">' + fresh + '</span></div></div>' +
      /* the body scrolls on short screens, so it takes focus for keyboard scrolling (axe scrollable-region-focusable) */
      '<div class="ck-gate-scroll" tabindex="0" role="region" aria-label="Call details and checks"' + (g.phase === 'confirming' ? ' inert' : '') + '><div class="gate-body">' +
        (g.error ? '<div class="ierr" role="alert"><div class="ierr-line">' + V.icon('circle-alert') + '<span>' + esc(g.error) + ' <button type="button" class="btn btn--link" data-gate="retry">Retry</button></span></div><details class="details"><summary>Details</summary><div class="raw"><code>POST /api/calls · 502 · telephony_unreachable · idempotency ' + esc(g.key) + '</code></div></details></div>' : '') +
        (g.changed && !g.error ? '<div class="notice notice--warning notice--multi" role="status">' + V.icon('triangle-alert') + '<div class="notice-body">Checks changed since you opened this. Review and place the call again.</div></div>' : '') +
        scopeHtml(t, f) +
        '<div class="gate-group">Must pass<span class="gate-sum gate-sum--' + s.tone + '" id="ck-gate-sum" tabindex="-1" data-focus-target>' + (g.phase === 'checking' ? V.icon('loader-circle', 'sm', { className: 'spinner' }) : V.icon(s.icon, 'sm')) + esc(s.text) + '</span></div>' +
        '<ul class="gate-list" role="list">' + (g.phase === 'checking' ? checkingRows(kind) : must.map(CK.rowHtml).join('')) + '</ul>' +
        (know.length ? '<div class="gate-group">Good to know</div><ul class="gate-list" role="list">' + know.map(CK.rowHtml).join('') + '</ul>' : '') +
        (hoursChoice && g.phase !== 'checking' ? '<div class="rcards ck-gate-choice" role="radiogroup" aria-label="When to call">' +
          '<label class="rcard"><input type="radio" class="radio" name="ck-when" value="now" disabled><span class="rcard-body"><span class="rcard-title">Place now</span><span class="rcard-desc">Outside calling hours</span></span></label>' +
          '<label class="rcard"><input type="radio" class="radio" name="ck-when" value="later"' + (st.gateSchedule ? ' checked' : '') + '><span class="rcard-body"><span class="rcard-title">Schedule for 10 am IST</span><span class="rcard-desc">Mon 28 Sep · the next opening</span></span></label></div>' : '') +
        '<div class="gate-cost"><span>' + esc(cost[0] + ' · ' + cost[1]) + '</span><b>' + esc(cost[2]) + '</b></div>' +
        '<p class="gate-note">' + esc(CK.walletLine()) + '</p>' +
        (kind === 'real' ? '<p class="gate-note">The agent says the call is recorded at the start.</p>' : '<p class="gate-note">Recording follows your workspace setting. Test calls never change lead status.</p>') +
      '</div></div>' +
      '<div class="gate-foot"><span class="gate-reason' + (block && g.phase !== 'checking' ? ' u-fg-danger' : '') + '" id="ck-gate-why">' + esc(g.why) + '</span>' +
        '<button type="button" class="btn btn--tertiary" data-gate="cancel"' + (g.phase === 'confirming' ? ' aria-disabled="true"' : '') + '>Cancel</button>' +
        '<button type="button" class="btn btn--primary" id="ck-gate-go" data-gate="go" aria-describedby="ck-gate-why" aria-keyshortcuts="' + (V.util.isMac ? 'Meta+Enter' : 'Control+Enter') + '" data-tooltip="' + (st.gateSchedule ? 'Schedule call' : 'Place call') + '" data-kbd="mod+enter"' +
          (g.blocked ? ' aria-disabled="true"' : '') + (g.phase === 'confirming' ? ' aria-busy="true"' : '') + '>' +
          (g.phase === 'confirming' ? V.icon('loader-circle', 'md', { className: 'spinner' }) + (st.gateSchedule ? 'Scheduling…' : 'Placing call…') : st.gateSchedule ? 'Schedule call' : 'Place call') + '</button></div>';
    if (entry && !entry.closed && entry.reposition) entry.reposition();   /* the shared float keeps it clear of the trigger as rows are added */
    var ch = el.querySelector('.ck-gate-choice');
    if (ch) ch.addEventListener('change', function () { st.gateSchedule = true; rerender(); });
  }
  function rerender(keepFocus) {
    var a = d.activeElement, key = a && el.contains(a) ? (a.getAttribute('data-gate') || a.id || (a.name ? 'name:' + a.name : null)) : null;
    render();
    if (keepFocus !== false && key) { var n = el.querySelector('[data-gate="' + key + '"]') || el.querySelector('#' + key) || (key.indexOf('name:') === 0 ? el.querySelector('[name="' + key.slice(5) + '"]:checked') : null); if (n) n.focus(); }
  }
  function preflight(announce) {
    g.phase = 'checking'; rerender();
    clearTimeout(g.pt); g.pt = setTimeout(function () {
      g.phase = 'ready'; g.checkedAt = CK.now(); g.stale = false; rerender();
      if (announce !== false) { var s = CK.summary(rows(CK.kindOf(st.target))); V.announce(s.text.replace(' · ', '. '), { dedupeKey: 'ck-gate' }); }
    }, CK.has('loading') ? 1200 : 450);
  }
  G.isOpen = function () { return !!(entry && !entry.closed); };
  G.open = function (trigger) {
    init();
    if (G.isOpen()) return;
    st.gateSchedule = false;
    g = { key: 'idem_' + Math.random().toString(16).slice(2, 10), phase: 'checking', changed: false, error: null, stale: false, trigger: trigger, tries: 0 };
    render();
    entry = V.popover.open(trigger, 'ck-gate', { placement: 'top-end', onClose: function () { clearTimeout(g.pt); clearTimeout(g.ct); } });
    preflight();
  };
  G.close = function (reason) { if (G.isOpen()) entry.close(reason || 'x'); };
  G.tick = function () { if (G.isOpen() && g.phase === 'ready' && !g.stale && CK.now() - g.checkedAt > 120000) { g.stale = true; var f = d.getElementById('ck-gate-fresh'); if (f) f.innerHTML = 'Checked 2 min ago · <button type="button" class="btn btn--link" data-gate="recheck">Recheck</button>'; } };
  /* Confirm: busy, body inert, Esc ignored; the server re-checks (changed), fails (retry with the same key) or places the call. */
  G.confirm = function () {
    if (!G.isOpen() || g.phase === 'confirming') return;
    var go = d.getElementById('ck-gate-go');
    if (g.blocked) { V.announce(g.why); return; }
    if (g.stale) { preflight(); return; }
    g.phase = 'confirming'; g.error = null; entry.busy = true; rerender(false); d.getElementById('ck-gate-go').focus();
    g.tries += 1;
    g.ct = setTimeout(function () {
      entry.busy = false;
      if (CK.has('gate-changed') && !g.changedOnce) { g.changedOnce = true; g.changed = true; g.phase = 'ready'; rerender(false); var sm = d.getElementById('ck-gate-sum'); if (sm) sm.focus(); V.announce('Checks changed since you opened this. Review and place the call again.'); return; }
      if (CK.has('gate-fail') && g.tries < 2) { g.phase = 'ready'; g.error = "Couldn’t reach the phone line. The call was not placed and you were not charged."; rerender(false); /* the gate’s InlineError (role=alert) is the one announcement (R2C-07) */ var r = el.querySelector('[data-gate="retry"]'); if (r) r.focus(); return; }
      var t = st.target, f = CK.flow(), sched = st.gateSchedule;
      entry.close('replace'); entry = null;
      if (sched) { CK.list.schedule(t, f); V.toast.success('Call scheduled for Mon 28 Sep, 10:00 am IST · in Up next'); CK.focus(d.getElementById('ck-call')); return; }
      CK.call.place({ target: t, flow: f, voiceId: st.voiceId, lang: st.lang, key: g.key });
    }, 900);
    void go;
  };
  d.addEventListener('click', function (e) {
    var b = e.target.closest('#ck-gate [data-gate]'); if (!b) return;
    var a = b.getAttribute('data-gate');
    if (a === 'close' || a === 'cancel') { if (g && g.phase === 'confirming') return; G.close(a === 'cancel' ? 'cancel' : 'x'); }
    else if (a === 'go') G.confirm();
    else if (a === 'recheck') { g.changed = false; preflight(); }
    else if (a === 'retry') G.confirm();
  });
  /* Ctrl/⌘+Enter confirms from anywhere inside the gate (the shared registry lets mod chords through on buttons) */
  w.Vaani.shortcuts.register('mod+enter', function () { G.confirm(); }, { description: 'Confirm the Call gate', group: 'Forms', inFields: true, when: function (e) { return G.isOpen() && (el.contains(e.target) || e.target === d.body); } });
  /* In-gate actions (Top up, Schedule) go through the page’s one action handler. */
  /* R2C-02: the Schedule row action re-renders the gate and its button goes away: focus the checked 'Schedule for 10 am IST' choice */
  G.schedule = function () { st.gateSchedule = true; rerender(false); var n = el && (el.querySelector('input[name="ck-when"]:checked') || el.querySelector('#ck-gate-go')); if (n) n.focus(); };
  G.refresh = function () { if (G.isOpen()) rerender(); };
})(window, document);
