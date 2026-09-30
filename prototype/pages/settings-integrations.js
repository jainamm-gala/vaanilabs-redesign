/* Vaani Labs prototype · pages/settings-integrations.js — Integrations (§7.4) and Assistant (§7.5).
   IntegrationRow + ServiceMark; Connect… explains the OAuth round trip before leaving; Manage opens a detail Sheet with
   Instant options and a one-row Danger zone; members see one sentence naming the admins, never disabled Connect buttons. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st, SD = S.SD;
  var ORDER = { attention: 0, connecting: 1, connected: 2, 'not-connected': 3, 'coming-soon': 4 };
  function app(id) { return st.integrations.filter(function (x) { return x.id === id; })[0]; }
  function locked(x) { return x.group === 'workspace' && (!S.admin() || S.demo('no-admin')); }
  function acct(x) { return x.group === 'yours' ? S.userEmail() : 'Sample Realty'; }

  function statusHtml(x) {
    if (x.id === 'hubspot' && S.demo('int-outage') && x.state === 'not-connected') return S.status('warning', 'Can’t reach HubSpot right now') + ' <button type="button" class="btn btn--link settings-irow-retry" data-act="int-retry">Retry</button>';
    switch (x.state) {
      case 'connected': return V.ui.statusTag('integration', 'connected');
      case 'attention': return V.ui.statusTag('integration', 'attention');
      case 'connecting': return S.status('progress', 'Finishing connection…');
      case 'coming-soon': return '<span class="tag tag--outline">Coming soon</span>';
      default: return '<span class="settings-irow-meta">Not connected</span>';
    }
  }
  function metaLine(x) {
    if (x.state !== 'connected' && x.state !== 'attention') return '';
    var who = x.group === 'yours' ? 'Connected as <span class="u-wrap-anywhere">' + esc(x.account || acct(x)) + '</span>' : 'Connected' + (x.by ? ' by ' + esc(x.by) : '');
    return '<p class="settings-irow-meta">' + who + ' · since ' + F.date(x.since || S.DATA.meta.now) + '</p>';
  }
  function actionHtml(x) {
    if (x.state === 'coming-soon' || x.state === 'connecting') return '';
    if (locked(x)) return '<span class="tag tag--outline">' + S.icon('lock', 'xs') + 'Admins only</span>';
    if (x.state === 'connected') return '<button type="button" class="btn btn--tertiary btn--sm" data-act="int-manage" data-id="' + x.id + '" aria-label="Manage ' + esc(x.name) + '">Manage</button>';
    if (x.state === 'attention') return '<button type="button" class="btn btn--sm" data-act="int-connect" data-id="' + x.id + '" data-needs-online aria-label="Reconnect ' + esc(x.name) + '…">Reconnect…</button>';
    return '<button type="button" class="btn btn--sm" data-act="int-connect" data-id="' + x.id + '" data-needs-online aria-label="Connect ' + esc(x.name) + '…">Connect…</button>';
  }
  function row(x) {
    var err = x.err ? '<div class="settings-irow-err ierr" role="alert"><div class="ierr-line">' + S.icon('circle-alert') + '<span>' + x.err + '</span></div></div>' : '';
    return '<div class="settings-irow" data-sec="' + x.id + '" data-state="' + x.state + '">' + S.ui.mark(x.mark) + '<div class="settings-irow-main"><h3 class="settings-irow-name" tabindex="-1" data-anchor-focus data-focus-target>' + esc(x.name) + '</h3><p class="settings-irow-purpose">' + esc(x.purpose) + '</p>' + metaLine(x) + '</div>' +
      '<div class="settings-irow-status">' + statusHtml(x) + '</div><div class="settings-irow-act">' + actionHtml(x) + '</div>' + err + '</div>';
  }
  function group(g) {
    var list = st.integrations.filter(function (x) { return x.group === g; }).sort(function (a, b) { return ORDER[a.state] - ORDER[b.state]; });
    var att = list.filter(function (x) { return x.state === 'attention'; })[0], html = '';
    if (att) html += S.notice('warning', '<b>' + esc(att.attention || att.name + ' needs you to sign in again.') + '</b> ' + (att.usedBy && att.usedBy.length ? S.plural(att.usedBy.length, 'live flow') + ' can’t book meetings on your calendar until you do.' : 'It stops working until you do.'), { acts: '<button type="button" class="notice-act" data-act="int-connect" data-id="' + att.id + '">Reconnect</button>' });
    if (g === 'workspace' && (!S.admin() || S.demo('no-admin'))) html += S.notice('neutral', 'Only admins can connect workspace apps. ' + esc(S.askAdmin()), { icon: 'lock' });
    if (g === 'workspace' && S.demo('no-workspace')) return '<div class="empty empty--compact settings-only">' + S.icon('building-2') + '<span>Create a workspace to connect apps for your team.</span><a class="btn btn--sm" href="#organization">Create workspace…</a></div>';
    return html + '<div class="settings-irows">' + list.map(row).join('') + '</div>';
  }
  S.page('integrations', {
    meta: function () { var c = st.integrations.filter(function (x) { return x.state === 'connected'; }).length, a = st.integrations.filter(function (x) { return x.state === 'attention'; }).length; return c + a ? (c + a) + ' connected' + (a ? ' · ' + a + ' needs you' : '') : 'None connected'; },
    render: function () {
      return S.sec({ id: 'yours', title: 'Your connections', desc: 'Your own accounts. Only you can use them, for example to book on your calendar.', body: group('yours') }) +
        S.sec({ id: 'workspace-apps', title: 'Workspace connections', desc: 'Shared by everyone in ' + esc(st.workspace.name) + '. Only admins can connect or remove them.', body: group('workspace') });
    },
    mount: function () { oauthReturn(); var m = S.qp('manage'); if (m && app(m) && app(m).state === 'connected') setTimeout(function () { manage(app(m), $('[data-act="int-manage"][data-id="' + m + '"]')); }, 60); },
    onQuery: function () { var m = S.qp('manage'); if (m && app(m)) manage(app(m), $('[data-act="int-manage"][data-id="' + m + '"]')); }
  });
  function redraw(focusId) { S.rerender(); if (focusId) { var b = $('[data-act][data-id="' + focusId + '"]') || $('[data-sec="' + focusId + '"] .settings-irow-name'); if (b) b.focus(); } }

  /* OAuth return (?connected=<app>, ?connect_error=<code>&app=<app>): read, then removed with replaceState. */
  function oauthReturn() {
    var ok = S.qp('connected'), bad = S.qp('connect_error'), a = app(ok || S.qp('app'));
    if (!a || (!ok && !bad)) return;
    S.clearQ(); var p = new URLSearchParams(w.location.search); ['connected', 'connect_error', 'app'].forEach(function (k) { p.delete(k); }); var qs = p.toString(); w.history.replaceState(null, '', w.location.pathname + (qs ? '?' + qs : '') + w.location.hash);
    if (bad) { a.err = bad === 'denied' ? esc(a.name) + ' said no: your account can’t grant contact access. Ask your ' + esc(a.name) + ' admin. <button type="button" class="btn btn--link" data-act="int-details">Details</button>' : esc(a.name) + ' didn’t connect. You closed the sign-in window. <button type="button" class="btn btn--link" data-act="int-connect" data-id="' + a.id + '">Try again</button>'; redraw(); return; }
    finish(a);
  }
  function finish(a) {
    a.err = null; a.state = 'connecting'; redraw();
    S.ui.wait(1400).then(function () { a.state = 'connected'; a.since = S.DATA.meta.now; a.account = acct(a); if (a.group === 'workspace') a.by = S.you().short; S.log('Connected ' + a.name, 'Integrations'); redraw(a.id); V.toast.success(a.name + ' connected'); });
  }
  S.act('int-connect', function (b) {
    var a = app(b.getAttribute('data-id')), id = U.uid('oa'), re = a.state === 'attention';
    var dl = S.ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" aria-describedby="' + id + '-b">' + S.ui.head(id, (re ? 'Reconnect ' : 'Connect ') + a.name) +
      '<div class="dlg-body"><div class="settings-oauth-head">' + S.ui.mark(a.mark) + '<p id="' + id + '-b">You’ll sign in to ' + esc(a.name) + ' in a new window and allow Vaani Labs to:</p></div><ul class="impact">' + (a.scopes || ['Read your account details']).map(function (s) { return '<li>' + S.icon('check') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="form-note">You can disconnect at any time from this page.</p><p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> No window opens; the connection finishes here.</p></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Continue to ' + esc(a.name) + S.icon('external-link', 'sm') + '<span class="sr-only"> (opens a new window)</span></button></div></div>', { returnTo: b });
    dl.on('[data-go]', function (btn) { dl.close('done'); if (S.demo('oauth-error')) { S.setDemo('oauth-error', false); a.err = esc(a.name) + ' didn’t connect. You closed the sign-in window. <button type="button" class="btn btn--link" data-act="int-connect" data-id="' + a.id + '">Try again</button>'; redraw(a.id); return; } finish(a); });
  });
  S.act('int-retry', function () { S.setDemo('int-outage', false); S.rerender(); V.toast.success('HubSpot is reachable again'); });
  S.act('int-details', function () { V.toast.info('HubSpot error: insufficient_scopes (contacts.write). Your HubSpot admin can grant it.'); });

  /* Manage (Sheet, ?manage=<app>) */
  function manage(a, returnTo) {
    var old = $('#st-manage'); if (old) old.remove();
    var ro = locked(a), used = a.usedBy || [];
    var el = U.h('<div class="sheet settings-sheet" id="st-manage" role="dialog" aria-labelledby="st-manage-t" hidden><div class="sheet-head">' + S.ui.mark(a.mark) + '<div class="sheet-heading"><h2 class="sheet-title" id="st-manage-t" tabindex="-1" data-focus-target>' + esc(a.name) + '</h2><p class="sheet-meta">' + (a.group === 'yours' ? 'Your connection' : 'Workspace connection') + '</p></div>' +
      '<div class="sheet-actions">' + V.ui.statusTag('integration', a.state) + '<button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close ' + esc(a.name) + '">' + S.icon('x') + '</button></div></div>' +
      '<div class="sheet-body">' + S.kv([['Connected as', '<span class="u-wrap-anywhere">' + esc(a.account || acct(a)) + '</span>'], ['Connected by', esc(a.by || S.you().short)], ['Since', F.date(a.since || S.DATA.meta.now)], ['Permissions', '<ul class="settings-plain-list">' + (a.scopes || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>'],
        ['Used by', used.length ? '<ul class="settings-plain-list">' + used.map(function (u) { return '<li><a href="' + u.href + '">' + esc(u.label) + '</a></li>'; }).join('') + '</ul>' : '<span class="kv-empty">No flow uses it yet</span>']]) +
      ((a.options || []).length ? '<h3 class="settings-sub">Options</h3><div>' + a.options.map(function (o) { var lid = 'opt-' + a.id + '-' + o.id; return S.row({ label: esc(o.label), labelId: lid, slot: true, control: S.sw(o.on, ' aria-labelledby="' + lid + '" data-opt="' + o.id + '"' + (ro ? ' aria-disabled="true" data-tooltip="Only admins can change this."' : '')) }); }).join('') + '</div>' : '') +
      (a.note ? '<p class="form-note">' + esc(a.note) + '</p>' : '') +
      (ro ? '' : S.dangerZone([{ title: 'Disconnect ' + a.name, desc: used.length ? S.plural(used.length, 'flow uses', 'flows use') + ' it today.' : 'Nothing else changes.', label: 'Disconnect ' + a.name + '…', act: 'int-disconnect' }]).replace('data-sec="danger"', 'data-sec="manage-danger"').replace(/sec-danger-t/g, 'st-manage-dz')) + '</div></div>');
    d.body.appendChild(el); V.initAll(el);
    el.addEventListener('click', function (e) {
      var s = e.target.closest('[data-opt]'); if (!s || S.blocked(s)) return; var o = a.options.filter(function (x) { return x.id === s.getAttribute('data-opt'); })[0], nv = !o.on;
      S.instant({ slot: $('[data-inst-status]', s.closest('.setting-row')), apply: function () { o.on = nv; s.setAttribute('aria-checked', String(nv)); }, revert: function () { o.on = !nv; s.setAttribute('aria-checked', String(!nv)); } });
    });
    el._app = a.id;
    V.drawer.open(el, { returnTo: returnTo, onClose: function () { if (S.route() && S.route().q.get('manage')) S.clearQ(); } });
    var t = $('#st-manage-t', el); if (t) t.focus();
  }
  S.act('int-manage', function (b) { var a = app(b.getAttribute('data-id')); w.history.replaceState(null, '', w.location.pathname + w.location.search + '#integrations?manage=' + a.id); manage(a, b); });
  S.act('int-disconnect', function (b) {
    var a = app($('#st-manage')._app), used = a.usedBy || [];
    var effect = { google: 'Meetings stop being added to your calendar now.', calendly: 'Your agent stops booking on your event types now.', whatsapp: 'WhatsApp messages stop now.', hubspot: 'Call outcomes stop syncing now.' }[a.id] || 'It stops working now.';
    S.ui.confirm({ title: 'Disconnect ' + a.name + '?', bodyHtml: '<p>' + esc(effect) + (used.length ? ' ' + used.map(function (u) { return 'The ' + esc(u.label.split(' · ')[0]) + ' step in ' + esc(u.label.split(' · ')[1]); }).join(' and ') + (a.id === 'hubspot' ? ' will take its Not found path.' : ' will skip it.') : '') + '</p>', confirmLabel: 'Disconnect', tone: 'danger', returnTo: b })
      .then(function (ok) { if (!ok) return; V.drawer.close(); a.state = 'not-connected'; S.log('Disconnected ' + a.name, 'Integrations'); redraw(a.id); V.announce(a.name + ' disconnected'); });
  });

  /* =================================== Assistant (§7.5) =================================== */
  function cards(name, val, maxLoose, ro) {
    return '<fieldset class="fieldset"><legend class="sr-only">' + (name === 'wsmode' ? 'Workspace mode' : 'Your mode') + '</legend><div class="settings-rcol">' + SD.modes.map(function (m) {
      var loose = maxLoose && +m.id > +maxLoose, dis = ro || loose, wid = 'mode-' + name + '-' + m.id + '-w';
      return '<label class="rcard"><input type="radio" class="radio" name="' + name + '" value="' + m.id + '"' + (m.id === val ? ' checked' : '') + (dis ? ' aria-disabled="true"' + (loose ? ' aria-describedby="' + wid + '"' : '') : '') + '><span class="rcard-body"><span class="rcard-title">' + esc(m.title) + (m.id === '2' ? ' <span class="tag tag--outline">Default</span>' : '') + '</span><span class="rcard-desc">' + esc(m.desc) + '</span>' +
        (loose ? '<span class="rcard-desc settings-rcard-why" id="' + wid + '">Your workspace allows up to ‘' + esc(SD.modes[+maxLoose - 1].desc.replace(/\.$/, '')) + '’.</span>' : '') + '</span></label>';
    }).join('') + '</div></fieldset>';
  }
  S.page('assistant', {
    meta: function () { return 'Workspace: ' + esc(SD.modes[+st.mode.workspace - 1].desc); },
    render: function () {
      var admin = S.admin();
      return (admin ? '' : S.readOnlyNotice('change the workspace mode')) +
        S.sec({ id: 'workspace-mode', title: 'Workspace mode', desc: 'How much the Assistant may do on its own for everyone in ' + esc(st.workspace.name) + '.', form: admin ? 'ws-mode' : null, body: cards('wsmode', st.mode.workspace, null, !admin) }) +
        S.sec({ id: 'your-mode', title: 'Your mode', desc: 'Choose the same mode or a stricter one for yourself.', form: 'my-mode', body: cards('mymode', st.mode.mine, st.mode.workspace) }) +
        S.sec({ id: 'always', title: 'Always, in every mode', body: '<ul class="impact settings-always">' + SD.always.map(function (s) { return '<li>' + S.icon('shield-check') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul><p class="form-note">Mode changes are recorded in <a href="#activity?category=Assistant">Activity</a>.</p>' });
    }
  });
  /* aria-disabled radio cards stay focusable and say why; choosing one snaps back. */
  d.addEventListener('change', function (e) {
    var r = e.target; if (r.type !== 'radio' || r.getAttribute('aria-disabled') !== 'true') return;
    var f = r.closest('form, fieldset'), prev = r.name === 'wsmode' ? st.mode.workspace : st.mode.mine, live = S.forms.live(r.name === 'wsmode' ? 'ws-mode' : 'my-mode');
    var back = live ? S.forms.read(live.form)[r.name] : prev; e.stopImmediatePropagation();
    $$('input[name="' + r.name + '"]', f).forEach(function (x) { x.checked = x.value === (back && back !== r.value ? back : prev); });
    var why = r.getAttribute('aria-describedby'); V.announce(why ? d.getElementById(why).textContent : 'Only admins can change the workspace mode.');
  }, true);
  S.formDef('ws-mode', {
    label: 'Workspace mode', saved: function () { return { wsmode: st.mode.workspace }; },
    commit: function (v) { st.mode.workspace = v.wsmode; if (+st.mode.mine > +v.wsmode) st.mode.mine = v.wsmode; S.log('Changed the Assistant’s workspace mode', 'Assistant', ['Mode', '', SD.modes[+v.wsmode - 1].title]); },
    after: function () { var y = $('[data-sec="your-mode"]'); if (y && !(S.forms.live('my-mode') || {}).dirty) { var n = U.h(S.sec({ id: 'your-mode', title: 'Your mode', desc: 'Choose the same mode or a stricter one for yourself.', form: 'my-mode', body: cards('mymode', st.mode.mine, st.mode.workspace) })); y.replaceWith(n); V.initAll(n); S.forms.scan(n.parentNode); } }
  });
  S.formDef('my-mode', { label: 'Your mode', saved: function () { return { mymode: st.mode.mine }; }, commit: function (v) { st.mode.mine = v.mymode; S.log('Changed their Assistant mode', 'Assistant'); } });
})(window, document);
