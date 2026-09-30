/* =====================================================================================================
   Vaani Labs prototype · pages/auth-login.js — /login and its steps (08-public-auth §8).
   Views: password (the static markup in login.html) · link (?method=link) · check-email · code (two-factor, or a
   recovery code) · signing-in (transient landing for the email link and OAuth) · signed-in (SignedInPanel) ·
   link-other (the link belongs to another account than the one signed in here).
   ===================================================================================================== */
(function (w, d, V, A) {
  'use strict';
  var U = V.util, $ = U.$, esc = U.esc;
  var T_PASSWORD = A.root().innerHTML;          /* the one source of the password view: the static markup */
  var REASONS_PW = ['expired', 'signed-out', 'password-changed', 'oauth-cancelled', 'oauth-failed', 'oauth-link', 'approved', 'verified'];
  var REASONS_LINK = ['link-expired', 'link-used', 'expired', 'signed-out'];
  var EMAIL_ERR = 'Enter an email address, like name@company.com.';
  function emailCheck(v) { return A.isEmail(v) ? null : EMAIL_ERR; }

  /* ---------- shared bits ---------- */
  function notices(root, allowed) {
    var slot = $('[data-notice]', root); if (!slot) return;
    var r = A.qs().get('reason'), off = A.qs().get('account') === 'off';
    slot.innerHTML = A.cookieNotice() + (off ? offNotice('status') : '') + (allowed.indexOf(r) >= 0 ? A.reasonNotice(r) : '');
  }
  function offNotice(role) {
    return A.notice('danger', 'This account is turned off.', 'Contact <a href="mailto:' + A.claims.contact.support + '">' + A.claims.contact.support + '</a> to turn it back on.', { role: role });
  }
  function crossLink(root) {
    var cl = $('[data-crosslink]', root); if (!cl) return; var appr = A.access() === 'approval';
    cl.innerHTML = (appr ? 'Need access? ' : 'New to Vaani Labs? ') + '<a class="auth-link" href="' + esc(A.url('signup.html')) + '">' + (appr ? 'Request access' : 'Create an account') + '</a>';
  }
  function lastUsed(root) {
    var m = A.lastMethod(), tag = '<span class="tag tag--outline">Last used</span>';
    var t = m === 'link' ? $('[data-mode="link"]', root) : $('[data-oauth-provider="' + m + '"]', root);
    if (t && !$('.tag', t)) t.insertAdjacentHTML('beforeend', tag);
  }
  function modeLink(root, sel, name, url) {
    var a = $(sel, root); if (!a) return; a.setAttribute('href', url);
    a.addEventListener('click', function (e) { e.preventDefault(); A.show(name, { url: url, focus: 'h1' }); });
  }
  function success(method) {
    A.setLastMethod(method || 'password'); A.email.clear();
    var r = A.qs().get('reason');
    A.go(r === 'verified' || r === 'approved' ? 'signup.html?step=workspace' : A.landing(), true);
  }
  /* Results every submit shares; returns true when it handled the result. */
  function common(r, form, api) {
    if (r === 'ratelimit') { A.formError(form, 'ratelimit'); return true; }
    if (r === 'network') { A.formError(form, 'network', { onRetry: api.submit }); return true; }
    if (r === 'server') { A.formError(form, 'server'); return true; }
    if (r === 'down') { A.formError(form, 'down'); return true; }
    return false;
  }
  function send(form, api, label, then) {
    var btn = $('[data-auth-primary]', form); api.setSending(true); A.busy(btn, label);
    A.request().then(function (r) { A.unbusy(btn).then(function () { api.setSending(false); then(r); }); });
  }

  /* ---------- Password ---------- */
  A.view('password', {
    title: 'Sign in', html: function () { return T_PASSWORD; },
    bind: function (root) {
      crossLink(root); notices(root, REASONS_PW); lastUsed(root);
      var form = $('#login-form', root), email = $('#login-email', root), pw = $('#login-password', root);
      email.value = A.email.get();
      email.addEventListener('input', function () { A.email.set(email.value); });
      $('a[href="forgot-password.html"]', root).setAttribute('href', A.url('forgot-password.html'));
      modeLink(root, '[data-mode="link"]', 'link', A.url('login.html', { method: 'link' }));
      A.capsLock(pw);
      A.form(form, {
        fields: [
          { el: email, name: 'email', label: 'Email', required: 'Enter your email.', check: emailCheck },
          { el: pw, name: 'password', label: 'Password', required: 'Enter your password.' }
        ],
        submit: function (v, api) {
          A.email.set(v.email);
          send(form, api, 'Signing in…', function (r) {
            if (common(r, form, api)) return;
            if (r === 'wrong') {                    /* never says whether the account exists */
              pw.value = ''; pw.focus();
              A.formError(form, 'credentials', { html: 'That email and password don’t match. If you signed up with Google or Facebook, use that button instead. <a class="auth-link" href="' + esc(A.url('forgot-password.html')) + '">Reset your password</a>' });
              return;
            }
            if (r === 'disabled') { var s = $('[data-notice]', root); s.innerHTML = offNotice('alert'); return; }
            if (r === 'unverified') { A.go('signup.html?step=verify'); return; }
            if (r === 'pending') { A.go('signup.html?step=pending'); return; }
            if (r === 'twofactor') { A.ss.set('vaani:auth:method', 'password'); A.show('code', { url: A.url('login.html', { step: 'code', reason: A.qs().get('reason') }), focus: 'h1' }); return; }
            success('password');
          });
        }
      });
    }
  });

  /* ---------- Email-link mode (PA6: a mode, not a direct-send button) ---------- */
  A.view('link', {
    title: 'Sign in',
    html: function () {
      return '<h1 class="auth-h1">Sign in with an email link</h1><p class="auth-sub">No password needed. We’ll email you a link and a 6-digit code.</p>' +
        '<div class="auth-notice-slot" data-notice></div>' + A.oauthButtons('login') + '<div class="auth-or" aria-hidden="true">or</div>' +
        '<form class="auth-form" id="link-form" action="login.html" method="post" novalidate><div class="field"><label class="field-label" for="link-email">Email</label>' +
        '<div class="input input--lg"><input id="link-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" enterkeyhint="send" required></div></div>' +
        '<div class="auth-actions"><div class="auth-formerr" data-formerr></div><button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="You’re offline. Connect to get a sign-in link."><span data-label>Email me a link</span></button>' +
        '<a class="auth-link auth-link--block" href="login.html" data-mode="password">Sign in with a password instead</a></div></form>';
    },
    bind: function (root) {
      notices(root, REASONS_LINK);
      var form = $('#link-form', root), email = $('#link-email', root);
      email.value = A.email.get(); email.addEventListener('input', function () { A.email.set(email.value); });
      modeLink(root, '[data-mode="password"]', 'password', A.url('login.html'));
      A.form(form, {
        fields: [{ el: email, name: 'email', label: 'Email', required: 'Enter your email.', check: emailCheck }],
        submit: function (v, api) {
          A.email.set(v.email);
          send(form, api, 'Sending…', function (r) {
            if (common(r, form, api)) return;
            A.show('check-email', { url: A.url('login.html', { step: 'check-email' }), focus: 'h1' });   /* no toast */
          });
        }
      });
    }
  });

  /* ---------- Check your email: the link, or the 6-digit code on this device ---------- */
  A.view('check-email', {
    title: 'Check your email',
    html: function () {
      var mail = A.email.get() || A.user.email;
      return '<h1 class="auth-h1">Check your email</h1><p class="auth-sub">We sent a sign-in link to <span class="auth-strong">' + esc(mail) + '</span>. It works for ' + A.claims.expiry.link + ' minutes.</p>' +
        A.codeForm('ce', 'Or enter the code from the email', 'We’ll check it as soon as you enter 6 digits.', 'Sign in', 'You’re offline. Connect to sign in.') +
        '<div class="auth-resend"><div class="auth-row"><button type="button" class="auth-link auth-link--block" data-resend>Resend email</button><a class="auth-link auth-link--block" href="login.html?method=link" data-mode="link">Use a different email</a></div>' +
        '<p class="auth-status-line" role="status" data-resend-status></p></div><p class="auth-hint">Can’t find it? Check spam, or search your inbox for Vaani Labs.</p>';
    },
    bind: function (root) {
      var form = $('#ce-form', root), code = $('#ce-code', root);
      var rs = A.resend($('[data-resend]', root), $('[data-resend-status]', root), { seconds: 30 });
      modeLink(root, '[data-mode="link"]', 'link', A.url('login.html', { method: 'link' }));
      function check(v) {
        return A.request(800).then(function (r) {
          if (r === 'wrong') return { error: 'That code didn’t work. Check the latest email from Vaani Labs.' };
          if (r === 'expired') { rs.enable(); return { error: 'That code has expired. Send a new email.' }; }
          if (common(r, form, api)) return {};
          if (r === 'twofactor') { A.ss.set('vaani:auth:method', 'link'); A.show('code', { url: A.url('login.html', { step: 'code' }), focus: 'h1' }); return { done: true }; }
          success('link'); return { done: true };
        });
      }
      var otp = A.otp(code, { onComplete: check });
      var api = A.form(form, {
        fields: [{ el: code, name: 'code', label: 'Code', live: false, required: 'Enter the 6-digit code from the email.', check: A.codeCheck }],
        submit: function () { otp.run(); }
      });
    }
  });

  /* ---------- Two-factor code (TOTP), or a recovery code ---------- */
  var fails = 0;
  A.view('code', {
    title: 'Two-factor code',
    html: function () {
      return '<h1 class="auth-h1">Enter your code</h1><p class="auth-sub">Open your authenticator app and enter the 6-digit code for Vaani Labs.</p>' +
        A.codeForm('tf', 'Two-factor code', 'Codes change every 30 seconds. We’ll check it as soon as you enter 6 digits.', 'Verify', 'You’re offline. Connect to sign in.') +
        '<div class="auth-row"><button type="button" class="auth-link auth-link--block" data-recovery aria-controls="tf-form">Use a recovery code instead</button><a class="auth-link auth-link--block" href="login.html" data-other>Sign in as someone else</a></div>';
    },
    bind: function (root) {
      var form = $('#tf-form', root), code = $('#tf-code', root), recovery = false, otp;
      /* "Trust this browser for 30 days" only if the provider supports it (§19 Q8); off by default. */
      $('.auth-actions', form).insertAdjacentHTML('beforebegin', '<label class="check"><input type="checkbox" class="cb" name="trust" id="tf-trust"><span class="check-text">Trust this browser for 30 days</span></label>');
      $('[data-other]', root).setAttribute('href', A.url('login.html'));
      function verdict(r) {
        if (r === 'wrong') {
          fails += 1;
          if (fails >= 2 && !$('#tf-skew', form)) {
            $('.auth-otp', form).insertAdjacentHTML('beforeend', '<p class="auth-hint" id="tf-skew">Codes depend on your device’s clock. Check that it’s set automatically.</p>');
            code.setAttribute('data-desc', (code.getAttribute('data-desc') || '') + ' tf-skew');
          }
          return { error: recovery ? 'That recovery code didn’t work. Check it against the codes you saved.' : 'That code didn’t work. Codes change every 30 seconds, so use the newest one.' };
        }
        if (common(r, form, api)) return {};
        success(A.ss.get('vaani:auth:method') || 'password'); return { done: true };
      }
      otp = A.otp(code, { when: function () { return !recovery; }, onComplete: function () { return A.request(800).then(verdict); } });
      var api = A.form(form, {
        fields: [{ el: code, name: 'code', label: 'Code', live: false, required: 'Enter the code.', check: function (v) { return recovery ? (/^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/.test(v) ? null : 'Enter the whole recovery code, like 4F7K-9Q2M.') : A.codeCheck(v); } }],
        submit: function (v, a) {
          if (!recovery) { otp.run(); return; }
          send(form, a, 'Verifying…', function (r) { var res = verdict(r); if (res.error) { A.fieldError(code, res.error); code.focus(); } });
        }
      });
      $('[data-recovery]', root).addEventListener('click', function (e) {
        recovery = !recovery; var f = $('.auth-otp', form), lab = $('label', f), hint = $('.field-hint', f);
        A.fieldError(code, null); code.value = '';
        f.classList.toggle('auth-otp--recovery', recovery);
        lab.textContent = recovery ? 'Recovery code' : 'Two-factor code';
        hint.textContent = recovery ? 'Like 4F7K-9Q2M. Each recovery code works once.' : 'Codes change every 30 seconds. We’ll check it as soon as you enter 6 digits.';
        code.setAttribute('inputmode', recovery ? 'text' : 'numeric'); code.setAttribute('autocomplete', recovery ? 'off' : 'one-time-code'); code.setAttribute('autocapitalize', recovery ? 'characters' : 'none');
        e.currentTarget.textContent = recovery ? 'Use your authenticator app instead' : 'Use a recovery code instead';
        code.focus();
      });
    }
  });

  /* ---------- Transient landing: /auth/link?token= and /auth/callback/<provider> ---------- */
  A.view('signing-in', {
    title: 'Signing in', panelClass: 'auth-panel--transient',
    html: '<h1 class="auth-transient" hidden>Signing you in…</h1>',
    bind: function (root) {
      var h = $('h1', root), via = A.qs().get('via') || 'link', P = A.PROVIDERS[via] ? via : null;
      setTimeout(function () { h.hidden = false; }, 200);                  /* nothing for 200 ms, then one line */
      A.request(1300).then(function (r) {
        if (r === 'twofactor') { A.ss.set('vaani:auth:method', via); A.show('code', { url: A.url('login.html', { step: 'code' }), replace: true, focus: 'h1' }); return; }
        if (r === 'pending') return A.go('signup.html?step=pending', true);
        if (!P) {                                                             /* the email link */
          if (r === 'expired') return A.go(A.url('login.html', { method: 'link', reason: 'link-expired' }), true);
          if (r === 'wrong') return A.go(A.url('login.html', { method: 'link', reason: 'link-used' }), true);
          if (r === 'disabled') return A.go(A.url('login.html', { account: 'off' }), true);
          return success('link');
        }
        if (r === 'oauth-new') return A.go(A.url('signup.html', { step: 'confirm', provider: P }), true);
        if (r === 'oauth-unlinked') return A.go(A.url('login.html', { reason: 'oauth-link', provider: P }), true);
        if (r === 'oauth-cancelled') return A.go(A.url('login.html', { reason: 'oauth-cancelled', provider: P }), true);
        if (r === 'disabled') return A.go(A.url('login.html', { account: 'off' }), true);
        if (r !== 'success' && r !== 'wrong' && r !== 'expired' && r !== 'unverified' && r !== 'taken') return A.go(A.url('login.html', { reason: 'oauth-failed', provider: P }), true);
        success(P);
      });
    }
  });

  /* ---------- SignedInPanel (PA10): never a silent redirect ---------- */
  function who(u, meta) {
    return '<div class="auth-who">' + V.ui.avatar(u.name, { size: 32 }) + '<span class="auth-who-text"><span class="auth-who-name">' + esc(u.short) + '</span><span class="auth-who-meta">' + esc(meta) + '</span></span></div>';
  }
  A.view('signed-in', {
    title: 'Sign in',
    html: function () {
      return '<h1 class="auth-h1">You’re signed in</h1>' + who(A.user, A.mask(A.user.email) + ' · ' + A.org.name) +
        '<div class="auth-actions"><a class="btn btn--primary btn--lg btn--full" href="' + esc(A.landing()) + '"><span data-label>Continue to Vaani Labs</span></a>' +
        '<button type="button" class="btn btn--tertiary btn--lg btn--full" data-switch><span data-label>Use a different account</span></button></div>';
    },
    bind: function (root) {
      $('[data-switch]', root).addEventListener('click', function () { var q = A.qs(); q.delete('session'); var s = q.toString(); A.go('login.html' + (s ? '?' + s : '')); });
    }
  });
  A.view('link-other', {
    title: 'Sign in',
    html: function () {
      var other = ((A.org.members || [])[1] || { email: 'rohit.sharma@samplerealty.example' }).email;
      return '<h1 class="auth-h1">This link is for another account</h1><p class="auth-sub">It signs in ' + esc(A.mask(other)) + '. This browser is signed in as:</p>' +
        who(A.user, A.mask(A.user.email) + ' · ' + A.org.name) +
        '<div class="auth-actions"><a class="btn btn--primary btn--lg btn--full" href="' + esc(A.landing()) + '"><span data-label>Continue as ' + esc(A.user.short) + '</span></a>' +
        '<a class="btn btn--tertiary btn--lg btn--full" href="' + esc(A.url('login.html', { step: 'signing-in', via: 'link' })) + '"><span data-label>Sign in as ' + esc(A.mask(other)) + ' instead</span></a></div>';
    }
  });

  /* ---------- Route and prototype states ---------- */
  function route() {
    var q = A.qs(), s = q.get('step'), r = q.get('reason');
    if (A.signedIn()) return 'signed-in';
    if (['check-email', 'code', 'signing-in', 'link-other'].indexOf(s) >= 0) return s;
    return q.get('method') === 'link' || r === 'link-expired' || r === 'link-used' ? 'link' : 'password';
  }
  var L = function (label, href, note) { return [label, href, note]; };
  A.boot({
    route: function (o) { A.show(route(), { initial: o.initial, focus: o.popstate ? 'h1' : null }); },
    proto: {
      sections: [
        { id: 'ap-screens', title: 'Sign-in screens', links: [L('Password', 'login.html'), L('Email-link mode', 'login.html?method=link'), L('Check your email', 'login.html?step=check-email'), L('Two-factor code', 'login.html?step=code'), L('Signing you in… (email link)', 'login.html?step=signing-in&via=link'), L('Already signed in', 'login.html?session=1'), L('Link for another account', 'login.html?step=link-other'), L('Account turned off', 'login.html?account=off'), L('Cookies blocked', 'login.html?cookies=blocked')] },
        { id: 'ap-reasons', title: 'Arrive with a reason', links: [L('Session expired, back to a flow', 'login.html?reason=expired&next=flow-designer.html'), L('Signed out', 'login.html?reason=signed-out'), L('Password changed, others signed out', 'login.html?reason=password-changed&others=1'), L('Link expired', 'login.html?method=link&reason=link-expired'), L('Link already used', 'login.html?method=link&reason=link-used'), L('Google cancelled', 'login.html?reason=oauth-cancelled&provider=google'), L('Facebook failed', 'login.html?reason=oauth-failed&provider=facebook'), L('Connect Google to a password account', 'login.html?reason=oauth-link&provider=google'), L('Access approved', 'login.html?reason=approved&access=approval'), L('Email confirmed', 'login.html?reason=verified')] },
        { id: 'ap-mode', title: 'Access mode (claims sheet)', links: [L('Self-serve', 'login.html?access=self-serve', 'Get started · Create account'), L('Approval', 'login.html?access=approval', 'Request access')] },
        { id: 'ap-other', title: 'Other auth pages', links: [L('Create account', 'signup.html'), L('Confirm your email', 'signup.html?step=verify'), L('Create your workspace', 'signup.html?step=workspace'), L('Invite', 'signup.html?invite=new'), L('Reset your password', 'forgot-password.html'), L('Set a new password', 'forgot-password.html?token=valid')] }
      ],
      results: ['success', 'twofactor', 'wrong', 'expired', 'ratelimit', 'unverified', 'pending', 'disabled', 'network', 'server', 'down', 'oauth-new', 'oauth-unlinked', 'oauth-cancelled', 'oauth-failed']
    }
  });
})(window, document, window.Vaani, window.VaaniAuth);
