/* Vaani Labs prototype · pages/settings-account.js — Overview (§7.0), Profile (§7.1), Notifications (§7.3).
   Shared row helpers (SettingRow, SegmentedControl, switch) live here too; later modules reuse them. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st, SD = S.SD;

  /* ---------- Shared markup helpers ---------- */
  S.row = function (o) {
    return '<div class="setting-row' + (o.cls ? ' ' + o.cls : '') + '"' + (o.attrs || '') + '><div class="setting-row-text"><span class="setting-row-label"' + (o.labelId ? ' id="' + o.labelId + '"' : '') + '>' + o.label + '</span>' +
      (o.desc ? '<span class="setting-row-desc"' + (o.descId ? ' id="' + o.descId + '"' : '') + '>' + o.desc + '</span>' : '') +
      (o.slot ? '<span class="setting-row-status" data-inst-status role="status"></span>' : '') + '</div>' + (o.control ? '<div class="settings-row-ctl">' + o.control + '</div>' : '') + '</div>';
  };
  S.seg = function (id, labelId, opts, val, extra) {
    return '<div class="seg" role="radiogroup" id="' + id + '" aria-labelledby="' + labelId + '"' + (extra || '') + '>' + opts.map(function (o) { return '<button type="button" role="radio" aria-checked="' + (o[0] === val) + '" data-value="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
  };
  S.sw = function (on, attrs) { return '<button type="button" class="switch" role="switch" aria-checked="' + (!!on) + '" data-manual' + (attrs || '') + '><span class="switch-thumb"></span></button>'; };
  S.shortName = function (n) { var p = String(n || '').trim().split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1][0] + '.' : p[0] || ''; };
  S.kv = function (rows, cls) { return '<dl class="kv kv--rows' + (cls ? ' ' + cls : '') + '">' + rows.map(function (r) { return '<div class="kv-row"><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; };
  S.userEmail = function () { return S.admin() ? 'anika.rao@samplerealty.example' : 'farah.khan@samplerealty.example'; };

  /* =================================== Overview (§7.0) =================================== */
  S.attention = function () {
    var a = [];
    if (S.demo('no-admin')) a.push({ id: 'admin', text: 'This workspace has no admin, so nobody can invite teammates or connect apps.', act: 'Contact support', href: '#organization' });
    if (st.phone.inbound.state === 'none') a.push({ id: 'inbound', text: 'No inbound number yet. Callers can’t reach your agent.', act: 'Set up', href: '#phone/inbound' });
    else if (st.phone.callerId.stage !== 'verified') a.push({ id: 'caller-id', text: 'Caller ID isn’t verified. Customers see an unknown number.', act: 'Verify', href: '#phone/caller-id' });
    st.integrations.filter(function (x) { return x.state === 'attention'; }).forEach(function (x) { a.push({ id: 'reconnect', text: x.name + ' needs you to sign in again.', act: 'Reconnect', href: '#integrations/' + x.id }); });
    st.webhooks.filter(function (x) { return x.status === 'failing'; }).forEach(function (x) { a.push({ id: 'webhook', text: '“' + x.name + '” is failing: its last ' + x.streak + ' deliveries didn’t arrive.', act: 'Review', href: '#webhooks' }); });
    if (!st.security.twoFactor && !st.dismissed.twofa) a.push({ id: 'twofa', text: 'Two-factor is off for your account.', act: 'Turn on', href: '#security/two-factor', dismiss: true });
    return a;
  };
  function idxStatus(id) {
    var ro = !S.admin() && /organization|integrations|assistant|phone|api-keys|webhooks|embed/.test(id);
    var b = S.badge(id);
    if (b) return { text: id === 'phone' ? (st.phone.inbound.state === 'none' ? 'No inbound number' : 'Caller ID not verified') : id === 'integrations' ? 'Reconnect needed' : b.text, warn: true };
    if (ro) return { text: 'View only' };
    var conn = st.integrations.filter(function (x) { return x.state === 'connected'; }).length, waOn = st.profile.whatsapp.state === 'verified';
    switch (id) {
      case 'profile': return { text: S.shortName(st.profile.name) };
      case 'notifications': return { text: 'Email on · WhatsApp ' + (waOn ? 'on' : 'off') };
      case 'security': return { text: 'Two-factor ' + (st.security.twoFactor ? 'on' : 'off') };
      case 'organization': var ppl = st.members.filter(function (m) { return !m.invited; }).length, inv = st.members.length - ppl; return { text: S.plural(ppl, 'person', 'people') + (inv ? ' · ' + inv + ' invite pending' : '') };
      case 'integrations': return { text: conn ? conn + ' connected' : 'None connected' };
      case 'assistant': return { text: SD.modes[+st.mode.workspace - 1].title };
      case 'phone': return { text: 'Inbound ready · Caller ID verified' };
      case 'api-keys': return { text: st.keys.length ? S.plural(st.keys.filter(function (k) { return !k.revoked; }).length, 'key') : 'No keys yet' };
      case 'webhooks': return { text: st.webhooks.length ? S.plural(st.webhooks.length, 'webhook') : 'None yet' };
      case 'embed': return { text: st.keys.some(function (k) { return k.scopes.indexOf('textvoice') >= 0 && !k.revoked; }) ? 'Ready to add' : 'Needs a key' };
      case 'activity': return { text: st.activity.length ? 'Recording since ' + F.date(st.activity[st.activity.length - 1].at) : 'Nothing recorded yet' };
      case 'export': return { text: { ready: 'Last export ready', expired: 'Link expired', running: 'Preparing an export…', none: 'No exports yet' }[st.exp.state] };
      default: return { text: '' };
    }
  }
  S.page('overview', {
    meta: function () {
      if (S.demo('status-failed')) return 'Couldn’t load status · <button type="button" class="btn btn--link" data-act="demo-clear" data-demo="status-failed">Retry</button>';
      return esc(st.workspace.name) + ' · ' + (S.admin() ? 'You’re an admin' : 'You’re a member');
    },
    render: function () {
      var att = S.attention(), phone = V.bp.phone(), lim = phone ? 1 : 3, html = '';
      if (att.length && !S.demo('loading') && !S.demo('status-failed')) {
        var shown = S.st.attAll ? att : att.slice(0, lim), more = att.length - shown.length;
        html += '<div class="notice notice--warning notice--multi settings-att">' + S.icon('triangle-alert') + '<div class="notice-body"><p class="notice-title settings-att-title">' + (att.length === 1 ? '1 thing needs attention' : att.length + ' things need attention') + '</p><ul class="settings-att-list">' +
          shown.map(function (a) { return '<li>' + esc(a.text) + ' <a class="notice-act" href="' + a.href + '" data-att="' + a.id + '">' + esc(a.act) + '</a>' + (a.dismiss ? ' · <button type="button" class="notice-act settings-att-dismiss" data-act="att-dismiss">Dismiss</button>' : '') + '</li>'; }).join('') + '</ul>' +
          (more ? '<button type="button" class="btn btn--link settings-att-more" data-act="att-more">and ' + more + ' more</button>' : '') + '</div></div>';
      }
      SD.nav.forEach(function (g) {
        if (g.id === 'top') return;
        html += '<div class="settings-idx-g"><h2 class="settings-idx-label" id="idx-' + g.id + '">' + esc(g.label) + '</h2><ul class="settings-idx-list" aria-labelledby="idx-' + g.id + '">' + g.items.map(function (it) {
          var s = S.demo('status-failed') ? null : idxStatus(it.id), sid = 'idx-s-' + it.id;
          var stHtml = S.demo('loading') ? '<span class="sk sk--meta settings-idx-sk" aria-hidden="true"></span>' : s && s.text ? '<span class="settings-idx-status' + (s.warn ? ' settings-idx-status--warn' : '') + '" id="' + sid + '">' + (s.warn ? S.icon('triangle-alert', 'xs') : '') + esc(s.text) + '</span>' : '';
          return '<li><a class="settings-idx-row" href="#' + it.id + '"' + (s && s.text ? ' aria-describedby="' + sid + '"' : '') + '><span class="settings-idx-ic">' + S.icon(it.icon) + '</span><span class="settings-idx-text"><span class="settings-idx-name' + (it.danger ? ' settings-idx-name--danger' : '') + '">' + esc(it.label) + '</span><span class="settings-idx-desc">' + esc(it.desc) + '</span></span>' + stHtml + '<span class="settings-idx-ch">' + S.icon('chevron-right', 'sm') + '</span></a></li>';
        }).join('') + '</ul></div>';
      });
      return html;
    }
  });
  S.act('att-more', function () { st.attAll = true; S.rerender(); var l = $('.settings-att-list li:last-child a'); if (l) l.focus(); });
  S.act('att-dismiss', function () { st.dismissed.twofa = true; S.rerender(); S.focusH1(); V.toast.info('Hidden for you. Turn it on any time in Security.'); });
  V.on('breakpoint', function () { var r = S.route(); if (r && r.page === 'overview') S.rerender(); });

  /* =================================== Profile (§7.1) =================================== */
  var TZ = 'India Standard Time (IST) · set by the workspace';
  function waRow() {
    var wa = st.profile.whatsapp;
    if (wa.state === 'verified') return S.row({ label: S.phone(wa.masked), desc: S.status('success', 'Verified ' + F.date(wa.at)), control: '<button type="button" class="btn btn--tertiary btn--sm" data-act="wa-add" data-needs-online>Change…</button><button type="button" class="ibtn" aria-label="More actions for your WhatsApp number" aria-haspopup="menu" aria-controls="st-wa-menu" aria-expanded="false">' + S.icon('ellipsis') + '</button>' });
    if (wa.state === 'sent') return S.row({ label: 'Code sent', desc: 'Code sent to ' + esc(wa.full) + ' at ' + F.time(wa.at), control: '<button type="button" class="btn btn--sm" data-act="wa-add" data-step="2" data-needs-online>Enter code…</button>' });
    return S.row({ label: 'Not added', desc: 'Alerts go to your email until you add one.', control: '<button type="button" class="btn btn--sm" data-act="wa-add" data-needs-online>Add WhatsApp number…</button>' });
  }
  S.page('profile', {
    meta: function () { return esc(S.shortName(st.profile.name)) + ' · ' + (S.admin() ? 'Admin' : 'Member') + ' in ' + esc(st.workspace.name); },
    render: function () {
      var p = st.profile, sc = V.shortcuts.enabled(), den = V.density.get(), th = V.theme.get();
      return S.sec({ id: 'details', title: 'Personal details', form: 'details', body:
          S.ui.field({ name: 'name', label: 'Full name', value: p.name, attrs: ' autocomplete="name" required maxlength="60"', width: 'medium' }) +
          S.kv([['Email', '<span class="u-wrap-anywhere">' + esc(S.userEmail()) + '</span><a class="settings-kv-link" href="#security/email">Change in Security</a>']], 'settings-kv-flush') +
          S.ui.field({ name: 'mobile', label: 'Mobile number', optional: true, prefix: '+91', value: p.mobile, type: 'tel', attrs: ' inputmode="tel" autocomplete="tel-national"', width: 'medium', hint: 'Teammates and Vaani Labs support can reach you here. It isn’t a caller ID.' }) }) +
        S.sec({ id: 'whatsapp', title: 'WhatsApp number', desc: 'Get alerts on WhatsApp. We send a code to check the number.', body: waRow() +
          '<div class="menu" id="st-wa-menu" role="menu" aria-label="WhatsApp number actions" hidden><button class="menu-item menu-item--danger" role="menuitem" type="button" data-act="wa-remove">' + S.icon('trash-2') + '<span class="menu-text"><span>Remove…</span></span></button></div>' }) +
        S.sec({ id: 'preferences', title: 'Preferences', desc: 'Changes save automatically and apply on this page at once.', body:
          S.row({ label: 'Theme', labelId: 'pref-theme-l', slot: true, cls: 'settings-row--seg', control: S.seg('pref-theme', 'pref-theme-l', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], th, ' data-instant="theme"') }) +
          S.row({ label: 'Single-key shortcuts', labelId: 'pref-sk-l', desc: 'Turn off if you use speech input or a switch device.', descId: 'pref-sk-d', slot: true, control: S.sw(sc, ' id="pref-sk" aria-labelledby="pref-sk-l" aria-describedby="pref-sk-d" data-instant="shortcuts"') }) +
          S.row({ label: 'Table density', labelId: 'pref-den-l', desc: 'The default for tables. Shift+D still switches one table.', slot: true, cls: 'settings-row--seg', control: S.seg('pref-den', 'pref-den-l', [['standard', 'Standard'], ['compact', 'Compact']], den, ' data-instant="density"') }) +
          S.row({ label: 'Time zone', desc: TZ }) });
    },
    mount: function (root) {
      [['#pref-theme', function (v) { V.theme.set(v); }, function () { return V.theme.get(); }], ['#pref-den', function (v) { V.density.set(null, v); }, function () { return V.density.get(); }]].forEach(function (c) {
        var seg = $(c[0], root); if (!seg) return; seg._prev = c[2]();
        seg.addEventListener('vaani:change', function (e) {
          var v = e.detail.value, old = seg._prev; if (seg._quiet || v === old) return; seg._prev = v;
          S.instant({ slot: $('[data-inst-status]', seg.closest('.setting-row')), apply: function () { c[1](v); }, revert: function () { seg._prev = old; c[1](old); S.segQuiet(seg, old); } });
        });
      });
    }
  });
  V.on('shortcuts', function (on) { var b = $('#pref-sk'); if (b) b.setAttribute('aria-checked', String(!!on)); });
  S.segQuiet = function (seg, v) { var r = seg && $('[data-value="' + v + '"]', seg); if (!r) return; seg._quiet = true; V.seg.select(r); seg._quiet = false; seg._prev = v; };
  V.on('theme', function () { var seg = $('#pref-theme'); if (seg && seg._prev !== V.theme.get()) S.segQuiet(seg, V.theme.get()); });
  d.addEventListener('click', function (e) {
    var b = e.target.closest('#pref-sk'); if (!b || S.blocked(b)) return;
    var nv = b.getAttribute('aria-checked') !== 'true';
    S.instant({ slot: $('[data-inst-status]', b.closest('.setting-row')), apply: function () { b.setAttribute('aria-checked', String(nv)); V.shortcuts.setEnabled(nv); }, revert: function () { b.setAttribute('aria-checked', String(!nv)); V.shortcuts.setEnabled(!nv); } });
  });
  S.formDef('details', {
    label: 'Personal details',
    saved: function () { return { name: st.profile.name, mobile: st.profile.mobile }; },
    validate: function (v) { return { name: S.valid.name(v.name), mobile: S.valid.mobile(v.mobile) }; },
    commit: function (v) { st.profile.name = v.name.trim(); st.profile.mobile = v.mobile.trim(); }
  });

  /* WhatsApp number: Action (Add or Change… with a code; Remove… tier 2 when alerts use it) */
  S.act('wa-add', function (b) {
    var p = st.profile, id = U.uid('wa'), step = +b.getAttribute('data-step') || 1, same = !!p.mobile, target = p.whatsapp.full || ('+91 ' + p.mobile), timer = null, left = 30;
    var dl = S.ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' + S.ui.head(id, p.whatsapp.state === 'verified' ? 'Change WhatsApp number' : 'Add WhatsApp number') + '<div class="dlg-body" data-wa-body></div><div class="dlg-foot" data-wa-foot></div></div>', { returnTo: b, onClose: function () { clearInterval(timer); } });
    var body = $('[data-wa-body]', dl.el), foot = $('[data-wa-foot]', dl.el);
    function one() {
      body.innerHTML = (p.mobile ? '<label class="check"><input type="checkbox" class="cb" data-wa-same' + (same ? ' checked' : '') + '><span class="check-text">Same as my mobile number<span class="check-desc">+91 ' + esc(p.mobile) + '</span></span></label>' : '') +
        '<div data-wa-num' + (same ? ' hidden' : '') + '>' + S.ui.field({ id: id + '-n', name: 'wa', label: 'WhatsApp number', prefix: '+91', type: 'tel', attrs: ' inputmode="tel" autocomplete="tel-national"', hint: 'A mobile number that has WhatsApp.' }) + '</div>';
      foot.innerHTML = '<button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-wa-send>' + S.icon('send', 'sm') + 'Send code</button>';
      var cb = $('[data-wa-same]', body); if (cb) cb.addEventListener('change', function () { same = cb.checked; $('[data-wa-num]', body).hidden = same; if (!same) $('#' + id + '-n', body).focus(); });
    }
    function two() {
      body.innerHTML = '<p>We sent a 6-digit code to <b class="phone-text" translate="no">' + esc(target) + '</b> on WhatsApp.</p>' + S.ui.field({ id: id + '-c', name: 'code', label: 'Code', width: 'short', attrs: ' inputmode="numeric" autocomplete="one-time-code" maxlength="6" data-autofocus', hint: '<span data-wa-cd>Resend code in 30 s</span>', hintLive: false }) +
        '<p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> Any 6 digits work; 000000 shows the wrong-code error.</p>';
      foot.innerHTML = '<button type="button" class="btn btn--tertiary" data-wa-back>Change number</button><button type="button" class="btn btn--primary" data-wa-verify>Verify</button>';
      $('#' + id + '-c', body).focus(); left = 30; clearInterval(timer);
      timer = setInterval(function () { left -= 1; var cd = $('[data-wa-cd]', body); if (!cd) return clearInterval(timer); if (left <= 0) { clearInterval(timer); cd.innerHTML = '<button type="button" class="btn btn--link" data-wa-resend>Resend code</button>'; } else cd.textContent = 'Resend code in ' + left + ' s'; }, 1000);
      p.whatsapp = { state: 'sent', full: target, at: S.DATA.meta.now }; refreshWa();
    }
    dl.el.addEventListener('click', function (e) {
      if (e.target.closest('[data-wa-send]')) {
        if (!same) { var inp = $('#' + id + '-n', body), m = S.valid.mobile(inp.value) || (inp.value.trim() ? '' : 'Enter a 10-digit mobile number, like 98765 43210.'); S.ui.setError(inp, m); if (m) return inp.focus(); target = '+91 ' + inp.value.trim(); } else target = '+91 ' + p.mobile;
        var sb = e.target.closest('[data-wa-send]'); S.ui.busy(sb, 'Sending…'); S.ui.wait(600).then(two);
      }
      if (e.target.closest('[data-wa-back]')) { clearInterval(timer); one(); }
      if (e.target.closest('[data-wa-resend]')) { two(); V.announce('Code sent again'); }
      if (e.target.closest('[data-wa-verify]')) {
        var c = $('#' + id + '-c', body), v = c.value.trim();
        if (!/^\d{6}$/.test(v)) { S.ui.setError(c, 'Enter the 6-digit code from the WhatsApp message.'); return c.focus(); }
        if (v === '000000') { S.ui.setError(c, 'That code isn’t right. Check the latest WhatsApp message.'); return c.focus(); }
        var vb = e.target.closest('[data-wa-verify]'); S.ui.busy(vb, 'Verifying…');
        S.ui.wait(600).then(function () { p.whatsapp = { state: 'verified', full: target, masked: '+91 •••••• ' + target.replace(/\D/g, '').slice(-4), at: S.DATA.meta.now }; dl.close('done'); refreshWa(); S.refreshMeta(); var t = $('[data-sec="whatsapp"] .settings-sec-title'); if (t) t.focus(); });
      }
    });
    dl.el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); var go = $('[data-wa-verify], [data-wa-send]', foot); if (go) go.click(); } });
    if (step === 2) two(); else one();
  });
  function refreshWa() { var s = $('[data-sec="whatsapp"] .settings-sec-body'); if (!s) return; var menu = $('#st-wa-menu'); s.innerHTML = waRow(); if (menu) s.appendChild(menu); V.initAll(s); }
  S.act('wa-remove', function () {
    var n = Object.keys(st.notif).filter(function (k) { return st.notif[k].wa; }).length;
    S.ui.confirm({ title: 'Remove your WhatsApp number?', body: n ? n + ' alert' + (n === 1 ? '' : 's') + ' will stop coming on WhatsApp. Email alerts are not affected.' : 'You won’t get alerts on WhatsApp. Email alerts are not affected.', confirmLabel: 'Remove number', tone: 'danger' })
      .then(function (ok) { if (!ok) return; st.profile.whatsapp = { state: 'none' }; refreshWa(); S.refreshMeta(); V.toast.success('WhatsApp number removed'); });
  });

  /* =================================== Notifications (§7.3) =================================== */
  function waReady() { return st.profile.whatsapp.state === 'verified'; }
  function nmRow(e) {
    var n = st.notif[e.id], lid = 'nm-' + e.id + '-l', did = 'nm-' + e.id + '-d';
    var em = S.sw(n.email, ' aria-label="Email for ' + esc(e.label) + '" data-nm="' + e.id + '" data-ch="email"' + (e.locked ? ' aria-disabled="true" aria-describedby="' + did + '"' : e.desc ? ' aria-describedby="' + did + '"' : ''));
    var wa = e.wa === null ? '<span class="settings-nm-none"><span aria-hidden="true">–</span><span class="sr-only">WhatsApp isn’t offered for ' + esc(e.label) + '</span></span>'
      : S.sw(waReady() && n.wa, ' aria-label="WhatsApp for ' + esc(e.label) + '" data-nm="' + e.id + '" data-ch="wa"' + (!waReady() ? ' aria-disabled="true" aria-describedby="nm-wa-why"' : ''));
    return '<div class="settings-nm-row" role="group" aria-labelledby="' + lid + '"><div class="setting-row-text"><span class="setting-row-label" id="' + lid + '">' + esc(e.label) + '</span>' +
      (e.desc || e.locked ? '<span class="setting-row-desc" id="' + did + '">' + esc(e.locked || e.desc) + '</span>' : '') + '<span class="setting-row-status" data-inst-status role="status"></span></div>' +
      '<div class="settings-nm-cell settings-nm-cell--email">' + em + '</div><div class="settings-nm-cell settings-nm-cell--wa">' + wa + '</div></div>';
  }
  S.page('notifications', {
    meta: function () { return 'Changes save automatically'; },
    actions: function () { return '<button type="button" class="btn btn--tertiary" data-act="nm-reset" data-needs-online>Reset to defaults</button>'; },
    render: function (r) {
      var ch = (S.qp('channel') === 'whatsapp') ? 'whatsapp' : 'email', html = '<div class="settings-nm-channel u-only-phone">' + S.seg('nm-ch', 'nm-ch-l', [['email', 'Email'], ['whatsapp', 'WhatsApp']], ch, ' data-nm-channel') + '<span class="sr-only" id="nm-ch-l">Show switches for</span></div>';
      html += S.sec({ id: 'deliver-to', title: 'Deliver to', body: S.kv([
        ['Email', '<span class="u-wrap-anywhere">' + esc(S.userEmail()) + '</span><a class="settings-kv-link" href="#security/email">Change in Security</a>'],
        ['WhatsApp', waReady() ? S.phone(st.profile.whatsapp.masked) + S.status('success', 'Verified') : '<span class="u-fg-2">Not added. Add a number in Profile to get alerts there.</span><a class="settings-kv-link" href="#profile/whatsapp">Add number</a>']]) +
        (!waReady() ? '<p class="settings-nm-why" id="nm-wa-why">' + S.icon('info', 'sm') + 'Add a WhatsApp number in Profile to get these on WhatsApp.</p>' : '') });
      SD.notif.forEach(function (g) {
        var ev = g.events.filter(function (e) { return S.admin() || !e.admin; }); if (!ev.length) return;
        html += S.sec({ id: g.id, title: g.title, body: '<div class="settings-nm" data-channel="' + ch + '"><div class="settings-nm-head" aria-hidden="true"><span></span><span class="settings-nm-cell--email">Email</span><span class="settings-nm-cell--wa">WhatsApp</span></div>' + ev.map(nmRow).join('') + '</div>' });
      });
      return html;
    },
    mount: function (root) {
      var seg = $('#nm-ch', root); if (seg) seg.addEventListener('vaani:change', function (e) { $$('.settings-nm', root).forEach(function (m) { m.setAttribute('data-channel', e.detail.value); }); w.history.replaceState(null, '', w.location.pathname + w.location.search + '#notifications?channel=' + e.detail.value); });
    }
  });
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-nm]'); if (!b) return;
    if (b.getAttribute('aria-disabled') === 'true') { var why = b.getAttribute('aria-describedby'); V.announce(why && d.getElementById(why) ? d.getElementById(why).textContent : 'Not available'); return; }
    var id = b.getAttribute('data-nm'), ch = b.getAttribute('data-ch'), nv = b.getAttribute('aria-checked') !== 'true';
    S.instant({ slot: $('[data-inst-status]', b.closest('.settings-nm-row')), apply: function () { b.setAttribute('aria-checked', String(nv)); st.notif[id][ch] = nv; }, revert: function () { b.setAttribute('aria-checked', String(!nv)); st.notif[id][ch] = !nv; } });
  });
  S.act('nm-reset', function () {
    var before = S.clone(st.notif);
    SD.notif.forEach(function (g) { g.events.forEach(function (e) { st.notif[e.id] = { email: e.email, wa: e.wa }; }); });
    S.rerender();
    V.toast({ kind: 'undo', message: 'Notification settings reset', action: { label: 'Undo', onClick: function () { st.notif = before; S.rerender(); V.toast.success('Your notification settings are back'); } } });
  });
})(window, document);
