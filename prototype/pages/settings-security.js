/* Vaani Labs prototype · pages/settings-security.js — Security (§7.7): email address, password, two-factor, where you’re
   signed in. Guarded actions pass "Confirm it’s you" once per 10 minutes (S9). */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st;
  var NOW = S.DATA.meta.now;
  function ago(iso) { var days = Math.round((new Date(NOW) - new Date(iso)) / 864e5); return days < 1 ? 'today' : days < 30 ? F.when(iso).toLowerCase() : Math.floor(days / 30) + ' month' + (days >= 60 ? 's' : '') + ' ago'; }
  function codes() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = S.DATA._util.rng(921 + st.security.recoveryLeft + (st.codesN = (st.codesN || 0) + 1)), out = []; for (var i = 0; i < 8; i++) { var c = ''; for (var k = 0; k < 10; k++) c += a[Math.floor(r() * a.length)]; out.push(c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8)); } return out; }
  function download(name, text) { try { var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name; d.body.appendChild(a); a.click(); a.remove(); V.toast.success('Downloaded ' + name); } catch (e) { V.toast.error('Couldn’t download. Copy the codes instead.'); } }
  /* A static, deterministic QR-style pattern for the prototype (a real build renders the otpauth:// URI). Tokens: --qr-fg on --qr-bg. */
  function qr() {
    var n = 25, r = S.DATA._util.rng(77), cells = '';
    function finder(x, y) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7"/><rect class="settings-qr-bg" x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && r() > 0.52) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; }
    return '<svg class="settings-qr" viewBox="-2 -2 29 29" role="img" aria-label="QR code for your authenticator app. Can’t scan it? Use the setup key below.">' + cells + finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7) + '</svg>';
  }

  function secEmail() {
    var p = st.security.emailPending;
    return S.sec({ id: 'email', title: 'Email address', body: (p ? S.notice('info', '<b>Email change pending.</b> Confirm from both inboxes. Sent at ' + F.time(p.at || NOW) + '.', { acts: '<button type="button" class="notice-act" data-act="sec-email-resend">Resend</button><button type="button" class="notice-act" data-act="sec-email-cancel">Cancel change</button>' }) : '') +
      S.row({ label: '<span class="u-wrap-anywhere">' + esc(S.userEmail()) + '</span>', desc: p ? 'Changing to ' + esc(p.to || 'anika@newdomain.example') + ' once both addresses confirm.' : 'Used to sign in and for alerts', control: '<button type="button" class="btn btn--sm" data-act="sec-email" data-needs-online>Change email…</button>' }) });
  }
  function secPassword() {
    return S.sec({ id: 'password', title: 'Password', body: S.row({ label: 'Last changed ' + ago(st.security.passwordChanged), control: '<button type="button" class="btn btn--sm" data-act="sec-password" data-needs-online>Change password…</button>' }) });
  }
  function secTwofa() {
    var s = st.security;
    if (!s.twoFactor) return S.sec({ id: 'two-factor', title: 'Two-factor', body: S.row({ label: 'Off', desc: 'Ask for a code from an authenticator app when you sign in.', control: '<button type="button" class="btn btn--sm" data-act="sec-2fa-on" data-needs-online>Turn on…</button>' }) + '<p class="form-note">Authenticator apps only for now. Security keys and SMS aren’t supported yet.</p>' });
    return S.sec({ id: 'two-factor', title: 'Two-factor', body: S.kv([
      ['Status', S.status('success', 'On') + '<span>Authenticator app · since ' + F.date(s.twoFactorSince) + '</span>'],
      ['Recovery codes', '<span>' + s.recoveryLeft + ' left</span><button type="button" class="btn btn--link" data-act="sec-codes" data-needs-online>Show new codes…</button>']]) +
      '<div class="settings-inline-danger"><button type="button" class="btn btn--danger btn--sm" data-act="sec-2fa-off" data-needs-online>Turn off…</button><span class="form-note">Signing in would need only your password.</span></div>' });
  }
  function secSessions() {
    var others = st.sessions.filter(function (x) { return !x.current; }).length;
    var rows = st.sessions.map(function (x) {
      var last = x.current ? 'Active now' : F.when(x.at);
      return { x: x, last: last, act: x.current ? '<span class="tag tag--outline">This device</span>' : '<button type="button" class="btn btn--tertiary btn--sm" data-act="sec-signout" data-id="' + x.id + '" aria-label="Sign out ' + esc(x.device) + '" data-needs-online>Sign out</button>' };
    });
    return S.sec({ id: 'sessions', title: 'Where you’re signed in', headEnd: others ? '<button type="button" class="btn btn--sm settings-sec-headact" data-act="sec-signout-all" data-needs-online>Sign out of all other sessions…</button>' : '', body:
      '<div class="dt-wrap dt-wrap--framed u-hide-phone"><table class="dt" aria-label="Where you’re signed in"><thead><tr><th scope="col">Device</th><th scope="col">Location</th><th scope="col">Last active</th><th scope="col" class="c-act"><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td class="c-key">' + esc(r.x.device) + (r.x.current ? '<span class="sr-only">, this device</span>' : '') + '</td><td>' + esc(r.x.place) + '</td><td class="num">' + esc(r.last) + '</td><td class="c-act">' + r.act + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<ul class="settings-list u-only-phone" aria-label="Where you’re signed in">' + rows.map(function (r) { return '<li class="settings-list-row"><span class="settings-list-main"><span class="settings-list-title">' + esc(r.x.device) + '</span><span class="settings-list-meta">' + esc(r.x.place) + ' · ' + esc(r.last) + '</span></span>' + r.act + '</li>'; }).join('') + '</ul>' +
      '<p class="settings-sec-foot"><a href="#activity?category=Sign-in&amp;actor=me">See sign-in history in Activity</a></p>' });
  }
  S.page('security', {
    meta: function () { return 'Two-factor ' + (st.security.twoFactor ? 'on' : 'off') + ' · ' + S.plural(st.sessions.length, 'session'); },
    render: function () { return secEmail() + secPassword() + secTwofa() + secSessions(); },
    onQuery: function () { var c = S.qp('change'); if (c === 'email') S.acts['sec-email']($('[data-act="sec-email"]')); if (c === 'password') S.acts['sec-password']($('[data-act="sec-password"]')); }
  });
  function redraw(id, html) { var old = $('[data-sec="' + id + '"]'); if (!old) return; var n = U.h(html); old.replaceWith(n); V.initAll(n); S.applyOffline(n); S.refreshMeta(); var t = $('.settings-sec-title', n); if (t) t.focus(); }

  /* Email address: Confirm it’s you → Change email (the kept dual-confirmation strength) */
  S.act('sec-email', function (b) {
    S.ui.reauth('change your email address', { returnTo: b }).then(function (ok) {
      if (!ok) return; var id = U.uid('em'), cur = S.userEmail();
      var dl = S.ui.open('<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" data-discard="Discard the new address?">' + S.ui.head(id, 'Change email') + '<div class="dlg-body">' + S.kv([['Current email', '<span class="u-wrap-anywhere">' + esc(cur) + '</span>']]) +
        S.ui.field({ id: id + '-n', name: 'email', label: 'New email', type: 'email', attrs: ' autocomplete="email" spellcheck="false" data-autofocus' }) +
        '<p>We’ll send a link to both addresses. You keep signing in with ' + esc(cur) + ' until both are confirmed.</p></div>' +
        '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Send confirmation links</button></div></div>', { returnTo: b });
      var inp = $('#' + id + '-n', dl.el);
      function check() { var v = inp.value.trim(); return !v ? 'Enter an email address, like name@company.com.' : S.valid.email(v) || (v.toLowerCase() === cur ? 'That’s already your email address.' : /^taken@/i.test(v) ? 'That email belongs to another Vaani Labs account. Use a different one.' : ''); }
      inp.addEventListener('input', function () { dl.el.setAttribute('data-dirty', inp.value ? 'true' : 'false'); if (inp.getAttribute('aria-invalid')) S.ui.setError(inp, check()); });
      inp.addEventListener('blur', function () { if (inp.value.trim()) S.ui.setError(inp, check()); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('[data-go]', dl.el).click(); });
      dl.on('[data-go]', function (btn, e) {
        var m = check(); S.ui.setError(inp, m); if (m) return inp.focus();
        S.ui.busy(btn, 'Sending…'); S.ui.wait(700).then(function () { st.security.emailPending = { to: inp.value.trim(), at: NOW }; dl.el.removeAttribute('data-dirty'); dl.close('done'); redraw('email', secEmail()); });
      });
    });
  });
  S.act('sec-email-resend', function () { V.toast.success('Links sent again to both addresses'); });
  S.act('sec-email-cancel', function () { st.security.emailPending = null; redraw('email', secEmail()); V.toast.info('Email change cancelled. You keep signing in with ' + S.userEmail() + '.'); });

  /* Password */
  S.act('sec-password', function (b) {
    S.ui.reauth('change your password', { returnTo: b }).then(function (ok) {
      if (!ok) return; var id = U.uid('pw');
      var pw = function (n, label, ac, extra) { return S.ui.field({ id: id + '-' + n, name: n, label: label, type: 'password', attrs: ' autocomplete="' + ac + '"' + (extra || ''), after: '<button type="button" class="input-btn" data-password-toggle aria-controls="' + id + '-' + n + '" aria-pressed="false" aria-label="Show password">' + S.icon('eye') + '</button>' }); };
      var dl = S.ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" data-discard="Discard the new password?">' + S.ui.head(id, 'Change password') + '<div class="dlg-body">' + pw('cur', 'Current password', 'current-password', ' data-autofocus') + pw('new', 'New password', 'new-password', ' aria-describedby="' + id + '-rules"') +
        '<ul class="rules" id="' + id + '-rules" aria-live="polite"><li data-rule="len">' + S.icon('check') + 'At least 8 characters</li><li data-rule="num">' + S.icon('check') + 'At least one number</li><li data-rule="mail">' + S.icon('check') + 'Not your email address</li></ul>' +
        '<label class="check"><input type="checkbox" class="cb" id="' + id + '-out" checked><span class="check-text">Sign out of other sessions</span></label></div>' +
        '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Change password</button></div></div>', { returnTo: b });
      var cur = $('#' + id + '-cur', dl.el), nw = $('#' + id + '-new', dl.el);
      function rules() { var v = nw.value, r = { len: v.length >= 8, num: /\d/.test(v), mail: v && v.toLowerCase() !== S.userEmail() }; $$('[data-rule]', dl.el).forEach(function (li) { li.setAttribute('data-met', String(!!r[li.getAttribute('data-rule')])); }); return r.len && r.num && r.mail; }
      nw.addEventListener('input', function () { rules(); dl.el.setAttribute('data-dirty', 'true'); if (nw.getAttribute('aria-invalid')) S.ui.setError(nw, rules() ? '' : 'Use at least 8 characters, with a number.'); });
      dl.on('[data-go]', function (btn, e) {
        var m1 = !cur.value ? 'Enter your current password.' : cur.value.toLowerCase() === 'wrong' ? 'That password isn’t right.' : '', m2 = rules() ? '' : 'Use at least 8 characters, with a number.';
        S.ui.setError(cur, m1); S.ui.setError(nw, m2); if (m1) return cur.focus(); if (m2) return nw.focus();
        var out = $('#' + id + '-out', dl.el).checked, n = st.sessions.filter(function (x) { return !x.current; }).length;
        S.ui.busy(btn, 'Changing…'); S.ui.wait(700).then(function () {
          st.security.passwordChanged = NOW; if (out) st.sessions = st.sessions.filter(function (x) { return x.current; });
          dl.el.removeAttribute('data-dirty'); dl.close('done'); redraw('password', secPassword()); if (out) { var s = $('[data-sec="sessions"]'); if (s) { var ns = U.h(secSessions()); s.replaceWith(ns); V.initAll(ns); } }
          V.toast.success('Password changed' + (out && n ? '. Signed out of ' + S.plural(n, 'other session') + '.' : ''));
        });
      });
    });
  });

  /* Two-factor: Turn on (Scan · Enter code · Save recovery codes), new codes, Turn off (tier 2 after Confirm it’s you) */
  function codesBlock(list, id) { return S.ui.code(list.join('\n'), { label: 'Recovery codes', id: id }) + '<div class="settings-btnrow"><button type="button" class="btn btn--sm" data-dl-codes>' + S.icon('download', 'sm') + 'Download</button></div>'; }
  S.act('sec-2fa-on', function (b) {
    var id = U.uid('tf'), step = 1, list = codes();
    var dl = S.ui.open('<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" data-discard="Stop setting up two-factor? It stays off.">' + S.ui.head(id, 'Turn on two-factor') + '<div class="dlg-body" data-body></div><div class="dlg-foot" data-foot></div></div>', { returnTo: b });
    var body = $('[data-body]', dl.el), foot = $('[data-foot]', dl.el);
    function steps() { return '<ol class="settings-steps" aria-label="Step ' + step + ' of 3">' + ['Scan', 'Enter code', 'Save recovery codes'].map(function (t, i) { var n = i + 1; return '<li' + (n === step ? ' aria-current="step"' : '') + ' data-done="' + (n < step) + '"><span class="smark smark--' + (n < step ? 'done' : n === step ? 'current' : 'todo') + '" data-mark>' + (n < step ? S.icon('check') : '') + '</span>' + t + '</li>'; }).join('') + '</ol>'; }
    function draw() {
      dl.el.setAttribute('data-dirty', 'true');
      if (step === 1) { body.innerHTML = steps() + '<p>Scan this with an authenticator app, such as Google Authenticator or Microsoft Authenticator.</p><div class="settings-qr-wrap">' + qr() + '</div>' + S.ui.field({ id: id + '-k', name: 'key', label: 'Can’t scan? Enter this key', value: st.security.setupKey, readonly: true, mono: true, after: '<button type="button" class="input-btn" data-copy-key aria-label="Copy setup key">' + S.icon('copy') + '</button>' }); foot.innerHTML = '<button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-next>Next</button>'; }
      if (step === 2) { body.innerHTML = steps() + S.ui.field({ id: id + '-c', name: 'code', label: 'Code from the app', width: 'short', attrs: ' inputmode="numeric" autocomplete="one-time-code" maxlength="6" data-autofocus', hint: 'Codes change every 30 seconds.' }) + '<p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> Any 6 digits work; 000000 shows the error.</p>'; foot.innerHTML = '<button type="button" class="btn btn--tertiary" data-back>Back</button><button type="button" class="btn btn--primary" data-verify>Verify</button>'; $('#' + id + '-c', body).focus(); }
      if (step === 3) { body.innerHTML = steps() + '<p>Each code works once, if you lose your phone. Keep them somewhere safe, like a password manager.</p>' + codesBlock(list, id + '-rc') + '<label class="check"><input type="checkbox" class="cb" data-saved><span class="check-text">I’ve saved these codes</span></label>'; foot.innerHTML = '<p class="dlg-why" id="' + id + '-why">Confirm you’ve saved the codes to finish.</p><button type="button" class="btn btn--primary" data-finish aria-disabled="true" aria-describedby="' + id + '-why">Finish</button>'; }
      V.initAll(body);
    }
    dl.el.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-copy-key]')) S.ui.copy(st.security.setupKey.replace(/\s/g, ''), { btn: null });
      if (t.closest('[data-next]')) { step = 2; draw(); }
      if (t.closest('[data-back]')) { step = 1; draw(); }
      if (t.closest('[data-dl-codes]')) download('vaani-recovery-codes.txt', list.join('\n'));
      if (t.closest('[data-verify]')) { var c = $('#' + id + '-c', body), v = c.value.trim(); var m = !/^\d{6}$/.test(v) ? 'Enter the 6-digit code from the app.' : v === '000000' ? 'That code isn’t right. Codes change every 30 seconds.' : ''; S.ui.setError(c, m); if (m) return c.focus(); step = 3; draw(); var sl = $('.settings-steps', body); sl.setAttribute('tabindex', '-1'); sl.setAttribute('data-focus-target', ''); sl.focus(); }
      if (t.closest('[data-finish]')) { if (t.closest('[data-finish]').getAttribute('aria-disabled') === 'true') return V.announce('Confirm you’ve saved the codes to finish.'); st.security.twoFactor = true; st.security.twoFactorSince = NOW; st.security.recoveryLeft = 8; dl.el.removeAttribute('data-dirty'); dl.close('done'); redraw('two-factor', secTwofa()); V.toast.success('Two-factor is on'); }
    });
    dl.el.addEventListener('change', function (e) { if (e.target.matches('[data-saved]')) { var f = $('[data-finish]', dl.el); if (e.target.checked) { f.removeAttribute('aria-disabled'); $('.dlg-why', dl.el).textContent = ''; } else { f.setAttribute('aria-disabled', 'true'); $('.dlg-why', dl.el).textContent = 'Confirm you’ve saved the codes to finish.'; } } });
    dl.el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === id + '-c') { e.preventDefault(); $('[data-verify]', dl.el).click(); } });
    draw();
  });
  S.act('sec-codes', function (b) {
    S.ui.reauth('show new recovery codes', { returnTo: b }).then(function (ok) {
      if (!ok) return; var id = U.uid('rc'), list = codes(); st.security.recoveryLeft = 8;
      var dl = S.ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' + S.ui.head(id, 'New recovery codes') + '<div class="dlg-body">' + S.notice('warning', 'Your old codes stopped working just now.') + codesBlock(list, id + '-c') + '</div><div class="dlg-foot"><button type="button" class="btn btn--primary" data-dialog-close>Done</button></div></div>', { returnTo: b, onClose: function () { redraw('two-factor', secTwofa()); } });
      dl.el.addEventListener('click', function (e) { if (e.target.closest('[data-dl-codes]')) download('vaani-recovery-codes.txt', list.join('\n')); });
    });
  });
  S.act('sec-2fa-off', function (b) {
    S.ui.reauth('turn off two-factor', { returnTo: b }).then(function (ok) {
      if (!ok) return;
      S.ui.confirm({ title: 'Turn off two-factor?', body: 'Signing in will need only your password.', confirmLabel: 'Turn off', tone: 'danger', returnTo: b }).then(function (go) { if (!go) return; st.security.twoFactor = false; redraw('two-factor', secTwofa()); V.toast.success('Two-factor is off'); });
    });
  });

  /* Sessions */
  S.act('sec-signout', function (b) { var x = st.sessions.filter(function (s) { return s.id === b.getAttribute('data-id'); })[0]; if (!x) return; st.sessions = st.sessions.filter(function (s) { return s !== x; }); redraw('sessions', secSessions()); V.toast.success('Signed out of ' + x.device); });
  S.act('sec-signout-all', function (b) {
    var n = st.sessions.filter(function (x) { return !x.current; }).length;
    S.ui.confirm({ title: 'Sign out of ' + S.plural(n, 'other session') + '?', body: 'You stay signed in here.', confirmLabel: 'Sign out', tone: 'danger', returnTo: b }).then(function (ok) { if (!ok) return; st.sessions = st.sessions.filter(function (x) { return x.current; }); redraw('sessions', secSessions()); V.toast.success('Signed out of ' + S.plural(n, 'session')); });
  });
})(window, document);
