/* Vaani Labs prototype · pages/settings-records.js — Activity (§7.11), Export data (§7.12), Delete account (§7.13), and
   S.log (every save, key, webhook, invite, role and integration change in this prototype writes an Activity row). */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st, SD = S.SD;
  var NOW = S.DATA.meta.now;
  S.log = function (event, target, change) { st.activity.unshift({ id: 'ev_' + (215 + st.activity.length), at: NOW, cat: 'Workspace', event: event, who: S.you().short, target: target || '–', ip: '103.21.•••.•••', device: 'Chrome on Windows', change: change }); };
  function daysAgo(iso) { return (new Date(NOW) - new Date(iso)) / 864e5; }
  /* TableSkeleton with the real column names and the same priorities, so it hides the same columns as the table */
  S.tableSkeleton = function (cols, n) { cols = cols.filter(function (c) { return c[0]; }); var cl = function (c) { return c[1] ? ' class="' + c[1] + '"' : ''; }; return '<p class="sr-only">Loading…</p><div class="dt-wrap dt-wrap--framed" aria-hidden="true"><table class="dt"><thead><tr>' + cols.map(function (c) { return '<th' + cl(c) + '>' + esc(c[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' + Array(n || 5).join('.').split('.').map(function (_, i) { return '<tr>' + cols.map(function (c, j) { return '<td' + cl(c) + '><span class="sk settings-sk-cell settings-sk-cell--' + ((i + j) % 3) + '"></span></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><p class="settings-pager-note">Loading…</p>'; };
  S.pages['api-keys'].skeleton = function () { return S.tableSkeleton(S.keyCols); };
  S.pages.webhooks.skeleton = function () { return S.tableSkeleton(S.hookCols); };
  S.pages['webhook-deliveries'].skeleton = function () { return S.tableSkeleton(S.dlvCols); };

  /* =================================== Activity =================================== */
  var RANGES = [['1', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['all', 'All time']], COLS = [['When', 'sticky-l'], ['Event', ''], ['Person', ''], ['Target', ''], ['IP', 'settings-p4'], ['Device', 'settings-p3']];
  /* Activity columns [label, header class] (N 7.5): When, Event, Person and Target are P1 (who did what to what, when;
     the same four make the phone ListRow); Device is P3 (browser and OS in plain words); IP is P4, off by default: it is
     masked anyway and stays in the event Sheet and the CSV. When pins left; there is no actions column (the row opens
     the Sheet). */
  var af = { q: '', cat: 'any', who: 'everyone', range: '30' };
  function since() { var a = SD.activity; return F.date(a[a.length - 1].at); }
  function rangeLabel() { return RANGES.filter(function (r) { return r[0] === af.range; })[0][1]; }
  function rows() {
    var me = S.you().short;
    return st.activity.filter(function (e) {
      if (!S.admin() && e.who.indexOf(me) !== 0) return false;
      if (af.cat !== 'any' && e.cat !== af.cat) return false;
      if (af.who === 'me' && e.who.indexOf(me) !== 0) return false; if (af.who !== 'everyone' && af.who !== 'me' && e.who.indexOf(af.who) !== 0) return false;
      if (af.range !== 'all' && daysAgo(e.at) > +af.range) return false;
      if (af.q && (e.event + ' ' + e.who + ' ' + e.target).toLowerCase().indexOf(af.q.toLowerCase()) < 0) return false;
      return true;
    });
  }
  function select(id, label, opts, val) {
    return '<div class="field settings-filter"><span class="field-label" id="' + id + '-l">' + label + '</span><button type="button" class="select select--sm select--auto" data-select id="' + id + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v">' + esc((opts.filter(function (o) { return o[0] === val; })[0] || opts[0])[1]) + '</span>' + S.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" aria-selected="' + (o[0] === val) + '" data-value="' + esc(o[0]) + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span>' + S.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>';
  }
  function table() {
    if (S.demo('section-error')) return S.sectionError('activity');
    var list = rows();
    if (!list.length) {
      var filtered = af.cat !== 'any' || af.who !== 'everyone' || af.q;
      return '<div class="empty empty--page settings-empty">' + S.icon(filtered ? 'search-x' : 'history', 'lg') + '<h2 class="empty-title">' + (filtered ? 'No ' + (af.cat !== 'any' ? af.cat.toLowerCase() + ' ' : '') + 'events in ' + (af.range === 'all' ? 'any range' : 'the ' + rangeLabel().toLowerCase()) : 'Nothing recorded in this range') + '</h2><p>Recording since ' + since() + '.' + (filtered ? '' : ' Events appear here as people and apps change things.') + '</p><div class="empty-actions">' + (filtered ? '<button type="button" class="btn" data-act="act-clear">Clear filters</button>' : af.range !== 'all' ? '<button type="button" class="btn" data-act="act-all">Show all time</button>' : '') + '</div></div>';
    }
    return '<div class="dt-wrap dt-wrap--framed u-hide-phone"><table class="dt" aria-label="Activity, newest first">' + S.thead(COLS) + '<tbody>' +
      list.map(function (e) { return '<tr><td class="c-key sticky-l"><a href="#activity?event=' + e.id + '" data-act="act-open" data-id="' + e.id + '"><time datetime="' + e.at + '" data-tooltip="' + esc(F.whenAbs ? F.whenAbs(e.at) : F.date(e.at)) + '">' + esc(F.when(e.at)) + '</time></a></td><td class="settings-td-wrap">' + esc(e.event) + '</td><td><span class="settings-person">' + V.ui.avatar(e.who.replace(/ via .*/, ''), { size: 20 }) + '<span>' + esc(e.who) + '</span></span></td><td class="settings-td-wrap">' + (e.href ? '<a href="' + e.href + '">' + esc(e.target) + '</a>' : esc(e.target)) + '</td><td class="settings-p4"><span class="u-mono settings-mono-12">' + esc(e.ip) + '</span></td><td class="u-fg-2 settings-p3">' + esc(e.device) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<ul class="settings-list u-only-phone" aria-label="Activity, newest first">' + list.map(function (e) { return '<li class="settings-list-row"><a class="settings-list-main" href="#activity?event=' + e.id + '" data-act="act-open" data-id="' + e.id + '"><span class="settings-list-title">' + esc(e.event) + '</span><span class="settings-list-meta">' + esc(e.who) + ' · ' + esc(F.when(e.at)) + (e.target !== '–' ? ' · ' + esc(e.target) : '') + '</span></a></li>'; }).join('') + '</ul>' +
      '<p class="settings-pager-note">1–' + list.length + ' of ' + (af.cat === 'any' && af.who === 'everyone' && !af.q && af.range === '30' && S.admin() ? SD.activityTotal : list.length) + ' · Entries can’t be edited or deleted. IP addresses are partly hidden. Kept for 365 days.</p>';
  }
  S.page('activity', {
    meta: function () { return (S.admin() ? (af.who === 'me' ? 'Your activity' : 'Everyone') : 'Your activity') + ' · ' + rangeLabel() + ' · recording since ' + since(); },
    actions: function () { return '<a class="btn btn--tertiary" href="#security/sessions">Something looks wrong?</a><button type="button" class="btn btn--tertiary" data-act="act-csv">' + S.icon('download', 'sm') + 'Export CSV</button>'; },
    skeleton: function () { return S.tableSkeleton(COLS, 6); },
    render: function (r) {
      var q = r.q; if (q.get('category')) af.cat = SD.categories.indexOf(q.get('category')) >= 0 ? q.get('category') : 'any'; if (q.get('actor')) af.who = q.get('actor') === 'me' ? 'me' : af.who; if (q.get('range')) af.range = q.get('range');
      var people = [['everyone', 'Everyone'], ['me', 'You']].concat(st.members.filter(function (m) { return !m.invited && !m.you; }).map(function (m) { return [m.short, m.short]; })).concat([['API key', 'An API key']]);
      return '<div class="settings-filters" role="group" aria-label="Filter activity"><form class="search settings-search" role="search" data-act-search><label class="sr-only" for="act-q">Search events</label>' + S.icon('search', 'sm') + '<input id="act-q" type="search" placeholder="Search events…" value="' + esc(af.q) + '" data-page-search autocomplete="off"></form>' +
        select('act-cat', 'Category', [['any', 'Any']].concat(SD.categories.map(function (c) { return [c, c]; })), af.cat) + (S.admin() ? select('act-who', 'Person', people, af.who) : '') + select('act-rg', 'Range', RANGES, af.range) + '</div><div data-sec="table">' + table() + '</div>';
    },
    mount: function (root) {
      function upd() { var s = $('[data-sec="table"]', root); s.innerHTML = table(); V.initAll(s); S.refreshMeta(); }
      [['#act-cat', 'cat'], ['#act-who', 'who'], ['#act-rg', 'range']].forEach(function (c) { var el = $(c[0], root); if (el) el.addEventListener('vaani:change', function (e) { af[c[1]] = e.detail.value; upd(); }); });
      var qi = $('#act-q', root), t = null; qi.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { af.q = qi.value.trim(); upd(); }, 250); });
      $('[data-act-search]', root).addEventListener('submit', function (e) { e.preventDefault(); af.q = qi.value.trim(); upd(); });
      var ev = S.qp('event'); if (ev) setTimeout(function () { openEvent(ev); }, 60);
    }
  });
  S.act('act-clear', function () { af = { q: '', cat: 'any', who: 'everyone', range: af.range }; w.history.replaceState(null, '', w.location.pathname + w.location.search + '#activity'); S.rerender(); });
  S.act('act-all', function () { af.range = 'all'; S.rerender(); });
  S.act('act-csv', function () { var n = rows().length; V.toast.success('Exported ' + S.plural(n, 'event') + ' as CSV'); });
  function openEvent(id) {
    var e = st.activity.filter(function (x) { return x.id === id; })[0]; if (!e) return; var old = $('#st-ev'); if (old) old.remove();
    var el = U.h('<div class="sheet settings-sheet" id="st-ev" role="dialog" aria-labelledby="st-ev-t" hidden><div class="sheet-head"><div class="sheet-heading"><h2 class="sheet-title" id="st-ev-t" tabindex="-1" data-focus-target>' + esc(e.event) + '</h2><p class="sheet-meta">' + esc(F.when(e.at)) + ' · ' + esc(e.who) + '</p></div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close event">' + S.icon('x') + '</button></div></div>' +
      '<div class="sheet-body">' + S.kv([['When', esc(F.date(e.at)) + ', ' + esc(F.time(e.at))], ['Person', esc(e.who)], ['Category', esc(e.cat)], ['Target', e.href ? '<a href="' + e.href + '">' + esc(e.target) + '</a>' : esc(e.target)], ['IP address', '<span class="u-mono">' + esc(e.ip) + '</span>'], ['Device', esc(e.device)], ['Event id', '<span class="u-mono">' + e.id + '</span>']]) +
      (e.change ? '<h3 class="settings-sub">What changed</h3>' + S.kv([[esc(e.change[0]), (e.change[1] ? '<span class="settings-before">' + esc(e.change[1]) + '</span>' + S.icon('arrow-right', 'sm') : '') + '<b>' + esc(e.change[2]) + '</b>']]) : '') + '<p class="form-note">Entries can’t be edited or deleted.</p></div></div>');
    d.body.appendChild(el); V.initAll(el);
    V.drawer.open(el, { returnTo: $('[data-act="act-open"][data-id="' + e.id + '"]'), onClose: function () { if (S.route() && S.route().q.get('event')) S.clearQ(); } });
    $('#st-ev-t', el).focus();
  }
  S.act('act-open', function (b) { w.history.replaceState(null, '', w.location.pathname + w.location.search + '#activity?event=' + b.getAttribute('data-id')); openEvent(b.getAttribute('data-id')); });

  /* =================================== Export data =================================== */
  function exSize() { return F.bytes(st.exp.latest.size); }
  function secLatest() {
    var x = st.exp, L = x.latest, body;
    if (x.state === 'none') body = '<p class="u-fg-2">No exports yet. Request one below; it takes a few minutes.</p>';
    else if (x.state === 'running') body = '<ol class="stages settings-stages" aria-label="Export, step 1 of 2"><li class="stage" aria-current="step"><span class="smark smark--progress" data-mark>' + S.icon('loader-circle', 'xs', { className: 'spinner' }) + '</span><span>Preparing archive<span class="stage-meta">Started ' + esc(F.time(NOW)) + '. You can leave this page; we’ll tell you when it’s ready.</span></span></li><li class="stage"><span class="smark smark--todo" data-mark="hollow"></span><span>Ready</span></li></ol>';
    else body = S.kv([['Requested', esc(F.date(L.requested)) + ', ' + esc(F.time(L.requested))], ['Ready', esc(F.date(L.ready)) + ', ' + esc(F.time(L.ready)) + ' · ' + exSize()], ['Link', x.state === 'expired' ? S.status('warning', 'Link expired') : 'Expires in ' + (L.expiresMin >= 60 ? Math.round(L.expiresMin / 60) + ' h' : L.expiresMin + ' min')]]) +
      '<div class="settings-btnrow settings-sticky-acts">' + (x.state === 'expired' ? '<button type="button" class="btn btn--primary" data-act="ex-relink" data-needs-online>Get a new link</button>' : '<button type="button" class="btn btn--primary" data-act="ex-download">' + S.icon('download', 'sm') + 'Download .zip</button>') + '</div>';
    return S.sec({ id: 'latest', title: 'Latest export', body: body });
  }
  function limited() { return st.exp.state !== 'none'; }
  function secRequest() {
    var lim = limited(), why = 'You can request one export every 24 hours. Available again in ' + SD.exportLatest.nextIn + ' (tomorrow, ' + F.time(SD.exportLatest.nextAt) + ').';
    return S.sec({ id: 'request', title: 'Request a new export', desc: S.admin() ? 'A copy of everything in ' + esc(st.workspace.name) + ', as a .zip of CSV and JSON files.' : 'A copy of your own data, as a .zip of CSV and JSON files.', body: '<div class="settings-test"><button type="button" class="btn" data-act="ex-request" data-needs-online' + (lim ? ' aria-disabled="true" aria-describedby="ex-why" data-reason="' + esc(why) + '"' : '') + '>Request new export</button>' + (lim ? '<p class="settings-why" id="ex-why">' + esc(why) + '</p>' : '<p class="settings-why">You can request one export every 24 hours.</p>') + '</div>' });
  }
  S.page('export', {
    meta: function () { var x = st.exp.state; return (S.admin() ? 'Workspace export' : 'Your data only') + ' · ' + { ready: 'Last export ready · ' + exSize(), expired: 'Last export’s link expired', running: 'Preparing an export…', none: 'No exports yet' }[x]; },
    render: function () {
      return secLatest() + secRequest() + S.sec({ id: 'contents', title: 'What’s in an export', body: S.kv([['Included', 'Profile, flows and their versions, leads, call reports and transcripts, knowledge files, settings'], ['Not included', '<span>Call recordings (download them from <a href="call-reports.html">Call reports</a>), API key values</span>']]) });
    }
  });
  S.act('ex-download', function () { V.toast.info('Prototype: sample-realty-export-27-sep-2026.zip (' + exSize() + ') would download.'); });
  S.act('ex-relink', function (b) { S.ui.busy(b, 'Getting a link…'); S.ui.wait(600).then(function () { st.exp.state = 'ready'; st.exp.latest.expiresMin = 240; S.rerender(); V.announce('New link ready. It expires in 4 hours.'); var dl = $('[data-act="ex-download"]'); if (dl) dl.focus(); }); });
  S.act('ex-request', function (b) {
    st.exp.state = 'running'; S.rerender(); var t = V.toast.progress('Preparing your export…');
    S.ui.wait(3000).then(function () { st.exp.state = 'ready'; st.exp.latest = { requested: NOW, ready: NOW, size: 135885, expiresMin: 240 }; if (S.route().page === 'export') S.rerender(); if (t && t.dismiss) t.dismiss(); V.toast({ kind: 'success', message: 'Export ready', action: { label: 'Download', onClick: function () { S.acts['ex-download'](); } } }); });
  });

  /* =================================== Delete account =================================== */
  function blockRule() { var others = st.members.filter(function (m) { return !m.you && !m.invited; }).length; return S.soleAdmin() && others ? others : 0; }
  S.page('delete', {
    meta: function () { return 'Closes after 7 days · sign in within 7 days to undo'; },
    render: function () {
      var only = st.members.filter(function (m) { return !m.invited; }).length === 1, c = S.DATA.counts, blk = blockRule(), email = S.userEmail();
      var del = ['Your profile and sign-in', 'Your API keys and sessions', 'Your notification settings'].concat(only ? [esc(st.workspace.name) + ': ' + c.flows + ' flows, ' + F.count(c.leads) + ' leads, ' + c.calls + ' call reports', 'Inbound number ' + st.phone.inbound.masked + ' is released', S.plural(S.DATA.upNext.length, 'scheduled batch', 'scheduled batches') + ' are cancelled'] : []);
      return S.sec({ id: 'what', title: 'What happens', body: '<p class="settings-lead-strong">Your account closes now and is deleted after 7 days. To undo, sign in within 7 days and choose Restore account.</p>' +
          '<div class="settings-cols2"><div><h3 class="settings-col-label">Deleted after 7 days</h3><ul class="settings-plain-list">' + del.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div><div><h3 class="settings-col-label">Kept</h3><ul class="settings-plain-list"><li>A minimal audit entry, without your name</li><li>Tax records the law requires us to keep</li></ul></div></div>' +
          (blk ? S.notice('warning', '<b>You’re the only admin of ' + esc(st.workspace.name) + ', which has ' + S.plural(blk, 'other member') + '.</b> Make someone else an admin, or delete the workspace first.', { acts: '<a class="notice-act" href="#organization/members">Go to Members</a><a class="notice-act" href="#organization/danger">Delete workspace</a>', cls: 'settings-mt' }) : '') }) +
        S.sec({ id: 'confirm', title: 'Delete your account', body: S.ui.field({ id: 'del-why', name: 'why', label: 'Why are you leaving?', optional: true, textarea: true, attrs: ' rows="3" maxlength="1200"', hint: 'Only our team reads it.' }) +
          S.ui.field({ id: 'del-typed', name: 'typed', label: 'Type ' + email + ' to confirm', attrs: ' autocomplete="off" spellcheck="false" autocapitalize="off"', cls: 'settings-typed' }) +
          '<div class="settings-btnrow settings-sticky-acts settings-del-acts"><p class="settings-why" id="del-why-t">' + (blk ? 'Hand over or delete the workspace first.' : 'Type your email to confirm.') + '</p><a class="btn btn--tertiary" href="#overview">Cancel</a><button type="button" class="btn btn--danger" data-act="del-go" aria-disabled="true" aria-describedby="del-why-t">Delete account</button></div>' });
    },
    mount: function (root) {
      var inp = $('#del-typed', root), btn = $('[data-act="del-go"]', root), why = $('#del-why-t', root), blk = blockRule();
      inp.addEventListener('input', function () { var ok = inp.value.trim().toLowerCase() === S.userEmail(); if (ok && !blk) { btn.removeAttribute('aria-disabled'); why.textContent = ''; } else { btn.setAttribute('aria-disabled', 'true'); why.textContent = blk ? 'Hand over or delete the workspace first.' : 'Type your email to confirm.'; } });
    }
  });
  S.act('del-go', function (b) {
    S.ui.reauth('delete your account', { returnTo: b }).then(function (ok) {
      if (!ok) return; S.ui.busy(b, 'Deleting…');
      S.ui.wait(900).then(function () { S.ui.unbusy(b); V.toast.info('Prototype: you’d be signed out to the sign-in page: “Your account is closed. Sign in within 7 days to restore it.”', { persistent: true }); });
    });
  });
})(window, document);
