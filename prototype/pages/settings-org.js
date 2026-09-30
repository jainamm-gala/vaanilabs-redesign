/* Vaani Labs prototype · pages/settings-org.js — Organization and team (§7.2): Workspace (Section form, address change
   confirms), Members (Action; role change and removal tier 2, revoke invite tier 1 with Undo), Shared assets (FileField),
   Danger zone (Leave tier 2; Delete workspace tier 3 + Confirm it’s you). No-workspace, no-admin, member, only-member and
   sole-admin states never dead-end (F-UX-001). */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st;
  var NOW = S.DATA.meta.now, TAKEN = ['sample', 'vaani', 'realty', 'sample-homes-taken'];
  function people() { return st.members.filter(function (m) { return !m.invited; }); }
  function invites() { return st.members.filter(function (m) { return m.invited; }); }
  function maskEmail(e) { var p = String(e).split('@'); return p[0][0] + '•••@' + p[1]; }
  function nameOf(m) { return m.invited ? maskEmail(m.email) : m.name; }

  S.page('organization', {
    meta: function () { if (S.demo('no-workspace')) return 'No workspace yet'; var i = invites().length; return esc(st.workspace.name) + ' · ' + S.plural(people().length, 'person', 'people') + (i ? ' · ' + S.plural(i, 'invite') + ' pending' : ''); },
    actions: function () { return S.admin() && !S.demo('no-workspace') && !S.demo('no-admin') ? '<button type="button" class="btn btn--primary" data-act="org-invite" data-needs-online>' + S.icon('user-plus') + 'Invite…</button>' : ''; },
    render: function () {
      if (S.demo('no-workspace')) return '<div class="empty empty--page">' + S.icon('building-2', 'lg') + '<h2 class="empty-title">You’re not in a workspace yet</h2><p>Create one for your team, or ask a teammate to invite you. Invites, phone setup and integrations live in a workspace.</p><div class="empty-actions"><button type="button" class="btn btn--primary" data-act="org-create">Create workspace…</button><a class="btn btn--link" href="#organization/members" data-act="org-how">How invites work</a></div></div>';
      var html = '';
      if (S.demo('no-admin')) html += S.notice('warning', 'This workspace has no admin, so nobody can invite teammates or connect apps. <a href="#overview" data-act="org-support">Contact support</a> to assign one.', { cls: 'settings-page-notice' });
      else if (!S.admin()) html += S.readOnlyNotice('invite teammates or change the workspace');
      return html + secWorkspace() + secMembers() + secAssets() + secDanger();
    },
    onQuery: function () { if (S.qp('invite') === '1' && S.admin()) { S.clearQ(); S.acts['org-invite']($('[data-act="org-invite"]')); } },
    mount: function () { setTimeout(function () { S.pages.organization.onQuery(); }, 50); }
  });

  /* ---------- Workspace (Section form) ---------- */
  function addrHint() { var n = st.workspace.changesLeft; return n ? 'Used in links you share. You can change it ' + (n === 1 ? '1 more time' : n + ' more times') + '. Old links keep working.' : 'You’ve used both address changes. Contact support to change it again.'; }
  function secWorkspace() {
    var ws = st.workspace, ro = !S.admin() || S.demo('no-admin');
    if (ro) return S.sec({ id: 'workspace', title: 'Workspace', body: S.kv([['Workspace name', esc(ws.name)], ['Workspace address', '<span class="u-mono">' + esc(ws.slug) + '.vaanilabs.in</span>']]) });
    return S.sec({ id: 'workspace', title: 'Workspace', form: 'workspace', body:
      S.ui.field({ name: 'wsname', label: 'Workspace name', value: ws.name, attrs: ' autocomplete="organization" maxlength="60"' }) +
      S.ui.field({ name: 'slug', label: 'Workspace address', value: ws.slug, suffix: '.vaanilabs.in', width: 'medium', cls: 'settings-field-addr', readonly: !ws.changesLeft, attrs: ' spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="f-slug-av f-slug-h"', hint: addrHint(), extra: '<p class="field-hint" id="f-slug-av" aria-live="polite" data-avail></p>' }) });
  }
  var avT = null, avState = {};
  function checkAddr(inp) {
    var v = inp.value.trim().toLowerCase(), out = $('[data-avail]'); if (!out) return;
    clearTimeout(avT); avState = {};
    if (!v || v === st.workspace.slug) { out.innerHTML = ''; out.className = 'field-hint'; return; }
    if (!/^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(v)) { out.innerHTML = ''; return; }
    out.className = 'field-hint'; out.innerHTML = S.icon('loader-circle', 'sm', { className: 'spinner' }) + ' Checking availability…';
    avT = setTimeout(function () { avState[v] = TAKEN.indexOf(v) < 0; if (avState[v]) { out.className = 'field-hint field-hint--ok'; out.innerHTML = S.icon('check', 'sm') + ' Available'; S.ui.setError(inp, ''); } else { out.innerHTML = ''; S.ui.setError(inp, 'Taken. Try ' + v + '-2'); } }, 600);
  }
  d.addEventListener('input', function (e) { if (e.target.id === 'f-slug') checkAddr(e.target); });
  S.formDef('workspace', {
    label: 'Workspace',
    saved: function () { return { wsname: st.workspace.name, slug: st.workspace.slug }; },
    validate: function (v) { var s = v.slug.trim().toLowerCase(); return { wsname: !v.wsname.trim() ? 'Enter the workspace name.' : v.wsname.trim().length < 2 ? 'Use at least 2 characters.' : '', slug: !s ? 'Enter an address.' : !/^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(s) ? 'Use lowercase letters, numbers and hyphens, like sample-homes.' : TAKEN.indexOf(s) >= 0 ? 'Taken. Try ' + s + '-2' : '' }; },
    confirm: function (v, saved) {
      var s = v.slug.trim().toLowerCase(); if (s === saved.slug) return true; var left = st.workspace.changesLeft - 1;
      return S.ui.confirm({ title: 'Change your workspace address to ' + s + '.vaanilabs.in?', body: 'Links with the old address keep working. Bookmarks may need updating. ' + (left ? 'You can change it ' + (left === 1 ? '1 more time' : left + ' more times') + ' after this.' : 'This is your last change.'), confirmLabel: 'Change address' });
    },
    commit: function (v) { var s = v.slug.trim().toLowerCase(); if (s !== st.workspace.slug) st.workspace.changesLeft = Math.max(0, st.workspace.changesLeft - 1); st.workspace.name = v.wsname.trim(); st.workspace.slug = s; },
    after: function () { var h = $('#f-slug-h'); if (h) h.textContent = addrHint(); var a = $('[data-avail]'); if (a) a.innerHTML = ''; }
  });

  /* ---------- Members (Action) ---------- */
  function roleCell(m) {
    if (!S.admin() || m.invited || S.demo('no-admin')) return '<span>' + esc(m.role) + '</span>';
    var sole = m.you && S.soleAdmin(), id = m.id;
    return '<span class="sr-only" id="role-l-' + id + '">Role for ' + esc(m.name) + '</span><button type="button" class="select select--sm select--auto" data-select data-role-for="' + id + '" aria-controls="role-lb-' + id + '" aria-labelledby="role-l-' + id + ' role-v-' + id + '"' + (sole ? ' aria-disabled="true" data-tooltip="You’re the only admin"' : '') + '><span class="select-value" id="role-v-' + id + '">' + esc(m.role) + '</span>' + S.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="role-lb-' + id + '" role="listbox" aria-label="Role for ' + esc(m.name) + '" hidden>' + ['Admin', 'Member'].map(function (r) { return '<div class="option" role="option" aria-selected="' + (r === m.role) + '" data-value="' + r + '"><span class="option-main"><span class="option-label">' + r + '</span><span class="option-desc">' + (r === 'Admin' ? 'Everything, including phone setup' : 'Flows, leads, calls and reports') + '</span></span>' + S.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div>';
  }
  function whenCell(m) { return m.invited ? '<span class="tag tag--outline">Invited</span> <span class="u-fg-3">expires in ' + esc(S.SD.inviteExpires) + '</span>' : esc(m.lastActive ? F.when(m.lastActive) : '–'); }
  function more(m) { var can = S.admin() && !S.demo('no-admin') ? true : m.you; return can ? '<button type="button" class="ibtn" aria-haspopup="menu" aria-controls="org-row-menu" aria-expanded="false" data-row="' + m.id + '" aria-label="More actions for ' + esc(nameOf(m)) + '">' + S.icon('ellipsis') + '</button>' : ''; }
  /* Last active as a line of the Person cell (P2): shown only where the Last active column folds away, below 1024 and on
     coarse pointers (Settings §11 "Person + Role + ⋯"; 05 R9). Hidden with the column shown, so it is never read twice. */
  function whenLine(m) {
    if (m.invited) return '<span class="settings-person-when"><span class="tag tag--outline">Invited</span> expires in ' + esc(S.SD.inviteExpires) + '</span>';
    var t = m.lastActive ? F.when(m.lastActive) : ''; return t ? '<span class="settings-person-when">Active ' + esc(t.charAt(0).toLowerCase() + t.slice(1)) + '</span>' : '';
  }
  function person(m, inTable) { return '<span class="settings-person">' + V.ui.avatar(m.invited ? m.email.split('@')[0] : m.name, { size: 28 }) + '<span class="settings-person-text"><span class="settings-person-name">' + esc(nameOf(m)) + (m.you ? ' <span class="tag tag--outline">You</span>' : '') + (m.invited && !inTable ? '<span class="sr-only">, invited, expires in ' + esc(S.SD.inviteExpires) + '</span>' : '') + '</span>' + (m.invited ? '' : '<span class="settings-person-meta u-wrap-anywhere">' + esc(m.email) + '</span>') + (inTable ? whenLine(m) : '') + '</span></span>'; }
  function secMembers() {
    if (S.demo('section-error')) return S.sec({ id: 'members', title: 'Members', body: S.sectionError('members') });
    var rows = st.members.slice().sort(function (a, b) { return (b.you ? 1 : 0) - (a.you ? 1 : 0) || (a.invited ? 1 : 0) - (b.invited ? 1 : 0); });
    var table = '<div class="dt-wrap dt-wrap--framed u-hide-phone"><table class="dt settings-members" aria-label="Members of ' + esc(st.workspace.name) + '"><thead><tr><th scope="col" class="sticky-l">Person</th><th scope="col">Role</th><th scope="col" class="settings-c-when">Last active</th><th scope="col" class="c-act sticky-r"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
      rows.map(function (m) { return '<tr data-member="' + m.id + '"><td class="c-key sticky-l">' + person(m, true) + '</td><td>' + roleCell(m) + '</td><td class="settings-td-when settings-c-when">' + whenCell(m) + '</td><td class="c-act sticky-r">' + more(m) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    var list = '<ul class="settings-list u-only-phone" aria-label="Members">' + rows.map(function (m) { return '<li class="settings-list-row">' + person(m) + '<span class="settings-list-end"><span class="settings-list-meta">' + esc(m.role) + ' · ' + (m.invited ? 'Invited' : esc(m.lastActive ? F.when(m.lastActive) : '–')) + '</span>' + more(m) + '</span></li>'; }).join('') + '</ul>';
    var only = rows.length === 1 && S.admin() ? '<div class="empty empty--compact settings-only">' + S.icon('users') + '<span>Invite teammates to share flows, leads and call reports.</span><button type="button" class="btn btn--sm" data-act="org-invite">Invite…</button></div>' : '';
    return S.sec({ id: 'members', title: 'Members', body: table + list + only +
      '<details class="settings-roles"><summary>What each role can do</summary>' + S.kv([['Admin', 'Everything, including phone setup, integrations, keys and teammates.'], ['Member', 'Flows, leads, calls and reports. Members see workspace settings read-only.']]) + '</details>' +
      '<div class="menu" id="org-row-menu" role="menu" aria-label="Member actions" hidden></div>' });
  }
  function redrawMembers() { var s = $('[data-sec="members"]'); if (!s) return; var n = U.h(secMembers()); s.replaceWith(n); V.initAll(n); S.applyOffline(n); S.refreshMeta(); }
  function byId(id) { return st.members.filter(function (m) { return m.id === id; })[0]; }
  function menuFor(trigger) {
    var m = byId(trigger.getAttribute('data-row')), menu = $('#org-row-menu'); if (!m || !menu) return;
    var it = function (act, icon, label, danger) { return '<button class="menu-item' + (danger ? ' menu-item--danger' : '') + '" role="menuitem" type="button" data-act="' + act + '" data-id="' + m.id + '">' + S.icon(icon) + '<span class="menu-text"><span>' + label + '</span></span></button>'; };
    var h = '';
    if (m.invited) h = it('org-resend', 'send', 'Resend invite') + it('org-revoke', 'x', 'Revoke invite');
    else if (m.you) h = it('org-leave', 'log-out', 'Leave workspace…', true);
    else h = it('org-role-menu', 'repeat', m.role === 'Admin' ? 'Make member…' : 'Make admin…') + '<div class="menu-sep" role="separator"></div>' + it('org-remove', 'trash-2', 'Remove from workspace…', true);
    menu.innerHTML = h; menu.setAttribute('aria-label', 'Actions for ' + nameOf(m));
  }
  d.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[aria-controls="org-row-menu"]'); if (t) menuFor(t); }, true);
  d.addEventListener('keydown', function (e) { var t = e.target.closest && e.target.closest('[aria-controls="org-row-menu"]'); if (t && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) menuFor(t); }, true);
  function changeRole(m, role, returnTo) {
    var toAdmin = role === 'Admin';
    return S.ui.confirm({ title: 'Make ' + m.short + ' ' + (toAdmin ? 'an admin' : 'a member') + '?', body: toAdmin ? 'They’ll be able to change phone setup, integrations, keys and teammates.' : 'They’ll no longer change phone setup, integrations or keys.', confirmLabel: toAdmin ? 'Make admin' : 'Make member', returnTo: returnTo })
      .then(function (ok) { if (ok) { m.role = role; S.log('Changed a role', m.short, ['Role', toAdmin ? 'Member' : 'Admin', role]); } redrawMembers(); if (ok) V.announce(m.short + ' is now ' + (toAdmin ? 'an admin' : 'a member')); var b = $('[data-role-for="' + m.id + '"]') || $('[data-row="' + m.id + '"]'); if (b) b.focus(); });
  }
  d.addEventListener('vaani:change', function (e) { var t = e.target.closest && e.target.closest('[data-role-for]'); if (!t) return; var m = byId(t.getAttribute('data-role-for')); if (m && e.detail.value !== m.role) changeRole(m, e.detail.value, t); });
  S.act('org-role-menu', function (b) { var m = byId(b.getAttribute('data-id')); changeRole(m, m.role === 'Admin' ? 'Member' : 'Admin', $('[data-row="' + m.id + '"]')); });
  S.act('org-resend', function (b) { var m = byId(b.getAttribute('data-id')); V.toast.success('Invite sent again to ' + maskEmail(m.email)); });
  S.act('org-revoke', function (b) {
    var m = byId(b.getAttribute('data-id')), i = st.members.indexOf(m); st.members.splice(i, 1); redrawMembers();
    V.toast({ kind: 'undo', message: 'Invite to ' + maskEmail(m.email) + ' revoked', action: { label: 'Undo', onClick: function () { st.members.splice(i, 0, m); redrawMembers(); V.toast.success('Invite restored'); } } });
  });
  S.act('org-remove', function (b) {
    var m = byId(b.getAttribute('data-id'));
    S.ui.confirm({ title: 'Remove ' + m.short + ' from ' + st.workspace.name + '?', body: 'They lose access now. Their call history stays.', confirmLabel: 'Remove', tone: 'danger', returnTo: $('[data-row="' + m.id + '"]') })
      .then(function (ok) { if (!ok) return; st.members = st.members.filter(function (x) { return x !== m; }); S.log('Removed a teammate', m.short); redrawMembers(); V.toast.success('Removed ' + m.short); var h = $('[data-sec="members"] .settings-sec-title'); if (h) h.focus(); });
  });

  /* Invite teammates (Dialog md) */
  S.act('org-invite', function (b) {
    if (!S.admin()) return; var id = U.uid('inv');
    var dl = S.ui.open('<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" data-discard="Discard these invites? What you typed will be lost.">' + S.ui.head(id, 'Invite teammates') + '<div class="dlg-body">' +
      S.ui.field({ id: id + '-e', name: 'emails', label: 'Email addresses', textarea: true, attrs: ' rows="3" spellcheck="false" data-autofocus', hint: 'Separate with commas or new lines. Up to 20.' }) +
      '<fieldset class="fieldset"><legend>Role</legend><div class="settings-rcol">' + [['Member', 'Flows, leads, calls and reports.'], ['Admin', 'Everything, including phone setup, integrations, keys and teammates.']].map(function (r, i) { return '<label class="rcard"><input type="radio" class="radio" name="' + id + '-role" value="' + r[0] + '"' + (i ? '' : ' checked') + '><span class="rcard-body"><span class="rcard-title">' + r[0] + '</span><span class="rcard-desc">' + r[1] + '</span></span></label>'; }).join('') + '</div></fieldset></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-send>Send invites</button></div></div>', { returnTo: b });
    var ta = $('#' + id + '-e', dl.el);
    function parse() { return ta.value.split(/[\s,;]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
    ta.addEventListener('input', function () { var n = parse().length; var sb = $('[data-send]', dl.el); if (sb && !sb.getAttribute('aria-busy')) sb.textContent = n ? 'Send ' + n + ' invite' + (n === 1 ? '' : 's') : 'Send invites'; dl.el.setAttribute('data-dirty', n ? 'true' : 'false'); if (ta.getAttribute('aria-invalid')) S.ui.setError(ta, ''); });
    dl.on('[data-send]', function (btn) {
      var list = parse(), bad = list.filter(function (x) { return S.valid.email(x); }), have = list.filter(function (x) { return st.members.some(function (m) { return m.email.toLowerCase() === x.toLowerCase(); }); });
      var msg = !list.length ? 'Enter at least one email address.' : list.length > 20 ? 'Invite up to 20 people at a time.' : bad.length ? (bad.length === 1 ? '1 address isn’t valid: ' : bad.length + ' addresses aren’t valid: ') + bad.join(' and ') + '.' : '';
      S.ui.setError(ta, msg); if (msg) return ta.focus();
      var go = list.filter(function (x) { return have.indexOf(x) < 0; }), role = $('input[name="' + id + '-role"]:checked', dl.el).value;
      if (!go.length) { S.ui.setError(ta, have[0] + ' is already in the workspace.'); return ta.focus(); }
      S.ui.busy(btn, 'Sending…');
      S.ui.wait(700).then(function () {
        go.forEach(function (e, i) { st.members.push({ id: 'inv_' + Date.now() + i, name: e, short: e, email: e, role: role, invited: true }); });
        S.log('Invited ' + S.plural(go.length, 'teammate'), go.length + ' people');
        dl.el.removeAttribute('data-dirty'); dl.close('done'); redrawMembers();
        V.toast.success('Invites sent to ' + S.plural(go.length, 'person', 'people') + (have.length ? '. ' + have[0] + ' is already in the workspace.' : ''));
      });
    });
  });
  S.act('org-create', function (b) {
    var id = U.uid('cw');
    var dl = S.ui.open('<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' + S.ui.head(id, 'Create workspace') + '<div class="dlg-body">' + S.ui.field({ id: id + '-n', name: 'n', label: 'Workspace name', attrs: ' data-autofocus autocomplete="organization"', hint: 'Your company or team, like Sample Realty.' }) + S.ui.field({ id: id + '-a', name: 'a', label: 'Workspace address', suffix: '.vaanilabs.in', attrs: ' spellcheck="false"', hint: 'Used in links you share.' }) + '</div><div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Create workspace</button></div></div>', { returnTo: b });
    $('#' + id + '-n', dl.el).addEventListener('input', function (e) { $('#' + id + '-a', dl.el).value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); });
    dl.on('[data-go]', function (btn, e) { var n = $('#' + id + '-n', dl.el); if (!n.value.trim()) { S.ui.setError(n, 'Enter the workspace name.'); return n.focus(); } S.ui.busy(btn, 'Creating…'); S.ui.wait(700).then(function () { st.workspace.name = n.value.trim(); S.setDemo('no-workspace', false); dl.close('done'); S.rerender(); V.toast.success('Workspace created. You’re its admin.'); }); });
  });
  S.act('org-support', function () { V.toast.info('Support opens outside this prototype.'); });
  S.act('org-how', function () { V.toast.info('Help and docs open from the account menu.'); });

  /* ---------- Shared assets (FileField: uploads on choose, Remove… tier 2 when a flow uses it) ---------- */
  function secAssets() {
    var bro = st.workspace.brochure, ro = !S.admin();
    var row = bro ? '<ul class="file-list"><li class="file-row">' + S.icon('file-text') + '<span class="file-main"><span class="file-name">' + esc(bro.name) + '</span><span class="file-meta">' + F.bytes(bro.size) + ' · uploaded ' + F.date(bro.at) + '</span></span>' +
      (ro ? '' : '<button type="button" class="btn btn--tertiary btn--sm" data-act="asset-pick" aria-label="Replace WhatsApp brochure">Replace</button><button type="button" class="btn btn--tertiary btn--sm" data-act="asset-remove" aria-label="Remove WhatsApp brochure…">Remove…</button>') + '</li></ul>'
      : (ro ? '<p class="u-fg-3">No brochure yet.</p>' : '<div><button type="button" class="btn" data-act="asset-pick">' + S.icon('upload') + 'Choose file</button></div>');
    return S.sec({ id: 'assets', title: 'Shared assets', body: '<div class="field"><span class="field-label" id="asset-l">WhatsApp brochure <span class="field-opt">(optional)</span></span>' + row + '<div data-asset-progress></div>' +
      '<input type="file" class="sr-only" id="asset-file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" aria-label="WhatsApp brochure" tabindex="-1">' +
      '<p class="field-hint">Your agent sends it on WhatsApp when a caller asks for details. PDF, JPG or PNG, up to 10 MB.</p>' +
      (bro && bro.usedBy ? '<p class="field-hint">Used by: <a href="flow-designer.html?node=n8">Send WhatsApp</a> in ' + S.plural(bro.usedBy, 'live flow') + '</p>' : '') + '</div>' });
  }
  function redrawAssets() { var s = $('[data-sec="assets"]'); if (!s) return; var n = U.h(secAssets()); s.replaceWith(n); V.initAll(n); }
  S.act('asset-pick', function () { var f = $('#asset-file'); if (f) f.click(); });
  d.addEventListener('change', function (e) {
    if (e.target.id !== 'asset-file' || !e.target.files.length) return;
    var f = e.target.files[0], box = $('[data-asset-progress]'), ok = /\.(pdf|jpe?g|png)$/i.test(f.name);
    if (!ok || f.size > 10485760) { box.innerHTML = '<p class="field-error">' + S.icon('circle-alert', 'sm') + '<span>' + esc(f.name) + (ok ? ' is over 10 MB.' : ' isn’t a PDF, JPG or PNG.') + '</span></p>'; return; }
    box.innerHTML = '<div class="pbar" role="progressbar" aria-label="Uploading ' + esc(f.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="pbar-row"><span class="pbar-label">' + esc(f.name) + '</span><span class="pbar-value">0%</span></div><div class="pbar-track"><i class="pbar-fill"></i></div></div>';
    var p = 0, bar = $('.pbar', box), t = setInterval(function () { p = Math.min(100, p + 20); bar.setAttribute('aria-valuenow', p); $('.pbar-value', bar).textContent = p + '%'; $('.pbar-fill', bar).style.setProperty('--p', p / 100); if (p >= 100) { clearInterval(t); st.workspace.brochure = { name: f.name, size: f.size, at: NOW, usedBy: 2 }; redrawAssets(); V.announce(f.name + ' uploaded'); } }, 180);
  });
  S.act('asset-remove', function (b) {
    var bro = st.workspace.brochure;
    S.ui.confirm({ title: 'Remove ' + bro.name + '?', body: 'The Send WhatsApp step in ' + S.plural(bro.usedBy, 'live flow') + ' will send the message without it.', confirmLabel: 'Remove file', tone: 'danger', returnTo: b })
      .then(function (ok) { if (!ok) return; st.workspace.brochure = null; redrawAssets(); V.toast.success('Brochure removed'); var h = $('[data-sec="assets"] .settings-sec-title'); if (h) h.focus(); });
  });

  /* ---------- Danger zone (§5.1) ---------- */
  S.dangerZone = function (rows) {
    return '<section class="settings-sec settings-sec--box" data-sec="danger" aria-labelledby="sec-danger-t"><div class="danger-zone"><h2 class="settings-sec-title" id="sec-danger-t" tabindex="-1" data-focus-target>Danger zone</h2>' +
      rows.map(function (r) { var why = r.why ? U.uid('dzw') : ''; return '<div class="danger-zone-row"><div class="settings-dz-text"><h3 class="settings-dz-title">' + esc(r.title) + '</h3><p class="settings-dz-desc">' + r.desc + '</p>' + (r.why ? '<p class="settings-dz-why" id="' + why + '">' + esc(r.why) + '</p>' : '') + '</div>' +
        '<button type="button" class="btn btn--danger settings-dz-btn" data-act="' + r.act + '" data-needs-online' + (r.why ? ' aria-disabled="true" aria-describedby="' + why + '" data-reason="' + esc(r.why) + '"' : '') + '>' + esc(r.label) + '</button></div>'; }).join('') + '</div></section>';
  };
  function secDanger() {
    var rows = [{ title: 'Leave ' + st.workspace.name, desc: 'You lose access to its flows, leads and call reports. An admin can invite you again.', label: 'Leave workspace…', act: 'org-leave', why: S.soleAdmin() ? 'You’re the only admin. Make someone else an admin first, or delete the workspace.' : '' }];
    if (S.admin() && !S.demo('no-admin')) { var c = S.DATA.counts; rows.push({ title: 'Delete workspace', desc: 'Deletes ' + c.flows + ' flows, ' + F.count(c.leads) + ' leads and ' + c.calls + ' call reports after 7 days, releases ' + S.phone(st.phone.inbound.masked) + ' and cancels ' + S.plural(S.DATA.upNext.length, 'scheduled batch', 'scheduled batches') + '.', label: 'Delete workspace…', act: 'org-delete' }); }
    return S.dangerZone(rows);
  }
  S.act('org-leave', function (b) {
    S.ui.confirm({ title: 'Leave ' + st.workspace.name + '?', body: 'You lose access to its flows, leads and call reports. An admin can invite you again.', confirmLabel: 'Leave workspace', tone: 'danger', returnTo: b })
      .then(function (ok) { if (ok) V.toast.info('Prototype: you’d move to your next workspace, Demo Workspace.'); });
  });
  S.act('org-delete', function (b) {
    var c = S.DATA.counts, ws = st.workspace.name;
    S.ui.reauth('delete the workspace', { returnTo: b }).then(function (ok) {
      if (!ok) return;
      S.ui.confirm({ title: 'Delete ‘' + ws + '’?', tone: 'danger', confirmLabel: 'Delete workspace', returnTo: b,
        bodyHtml: '<p>Calls stop now. After 7 days we delete everything below. Any wallet balance is handled under the <a href="billing.html" target="_blank" rel="noopener">refund policy ' + S.icon('external-link', 'xs') + '<span class="sr-only"> (opens in a new tab)</span></a>. Admins can restore the workspace until then.</p>',
        impact: [{ icon: 'workflow', html: c.flows + ' flows and their versions' }, { icon: 'users', html: F.count(c.leads) + ' leads and ' + c.calls + ' call reports with recordings' }, { icon: 'phone', html: 'Inbound number ' + S.phone(st.phone.inbound.masked) + ' is released' }, { icon: 'list-checks', html: S.plural(S.DATA.upNext.length, 'scheduled batch is', 'scheduled batches are') + ' cancelled' }],
        typed: { value: ws, hint: 'Type the workspace name to delete it' } })
        .then(function (go) { if (go) V.toast.info('Prototype: ' + ws + ' would be deleted on 4 Oct 2026. Every admin gets an email with Restore.'); });
    });
  });
})(window, document);
