/* =====================================================================================================
   Vaani Labs prototype · pages/auth-recovery.js — forgot and reset password (08-public-auth §10).
   /forgot-password: the same response whether or not the address has an account (no enumeration); "Check your email"
   replaces the form on the same URL and focus moves to the new H1.
   /reset-password?token=: valid · expired · already used · invalid, each with its own H1 and a working "Send a new
   link". The token leaves the address bar after load. Saving offers "Sign out of other devices" (checked, F-UX-044).
   ===================================================================================================== */
(function (w, d, V, A) {
  'use strict';
  var U = V.util, $ = U.$, esc = U.esc;
  var T_REQUEST = A.root().innerHTML;
  var MIN = A.claims.expiry.reset;
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
  function toRequest(e) { if (e) e.preventDefault(); A.show('request', { url: A.url('forgot-password.html'), focus: 'h1' }); }

  /* ---------- /forgot-password ---------- */
  A.view('request', {
    title: 'Reset password', html: function () { return T_REQUEST; },
    bind: function (root) {
      var form = $('#fp-form', root), email = $('#fp-email', root);
      $('[data-notice]', root).innerHTML = A.cookieNotice();
      $('[data-back]', root).setAttribute('href', A.url('login.html'));
      email.value = A.email.get(); email.addEventListener('input', function () { A.email.set(email.value); });
      A.form(form, {
        fields: [{ el: email, name: 'email', label: 'Email', required: 'Enter your email.', check: function (v) { return A.isEmail(v) ? null : 'Enter an email address, like name@company.com.'; } }],
        submit: function (v, api) {
          A.email.set(v.email);
          send(form, api, 'Sending…', function (r) { if (!common(r, form, api)) A.show('sent', { focus: 'h1' }); });
        }
      });
    }
  });
  A.view('sent', {
    title: 'Reset password',
    html: function () {
      return '<h1 class="auth-h1">Check your email</h1><p class="auth-sub">If an account exists for <span class="auth-strong">' + esc(A.email.get() || A.user.email) + '</span>, a reset link is on its way. It works for ' + MIN + ' minutes.</p>' +
        '<p class="auth-sub">Signed up with Google or Facebook? You don’t need a password. Use that button on the sign-in page.</p>' +
        '<div class="auth-resend"><div class="auth-row auth-row--start"><button type="button" class="auth-link auth-link--block" data-resend>Resend email</button></div><p class="auth-status-line" role="status" data-resend-status></p></div>' +
        '<div class="auth-row auth-row--start"><a class="auth-link auth-link--block" href="forgot-password.html" data-different>Use a different email</a><a class="auth-link auth-link--block" href="' + esc(A.url('login.html')) + '">Back to sign in</a></div>';
    },
    bind: function (root) {
      A.resend($('[data-resend]', root), $('[data-resend-status]', root), { seconds: 30 });
      $('[data-different]', root).addEventListener('click', function (e) {
        e.preventDefault(); A.show('request', { focus: 'h1' });
        var f = $('#fp-email', A.root()); f.focus(); f.select();
      });
    }
  });

  /* ---------- /reset-password?token= ---------- */
  A.view('reset', {
    title: 'Set a new password',
    html: function () {
      return '<h1 class="auth-h1">Set a new password</h1>' +
        '<form class="auth-form" id="rp-form" action="forgot-password.html" method="post" novalidate>' +
        /* The read-only username tells the password manager which entry to update. */
        '<div class="field"><label class="field-label" for="rp-email">Email</label><div class="input input--lg"><input id="rp-email" name="username" type="email" autocomplete="username" value="' + esc(A.user.email) + '" readonly data-ro></div></div>' +
        '<div class="field"><label class="field-label" for="rp-pw">New password</label><div class="input input--lg"><input id="rp-pw" name="password" type="password" autocomplete="new-password" aria-describedby="rp-pw-rules" required><button type="button" class="input-btn" data-password-toggle aria-controls="rp-pw" aria-pressed="false" aria-label="Show password">' + V.icon('eye') + '</button></div>' + A.rulesHtml('rp-pw-rules') + '</div>' +
        '<label class="check"><input type="checkbox" class="cb" name="signout" id="rp-others" checked><span class="check-text">Sign out of other devices<span class="check-desc">Phones and browsers signed in with the old password will need the new one.</span></span></label>' +
        '<div class="auth-actions"><div class="auth-formerr" data-formerr></div><button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="You’re offline. Connect to save your password."><span data-label>Save new password</span></button></div></form>';
    },
    bind: function (root) {
      var form = $('#rp-form', root), pw = $('#rp-pw', root);
      var rules = A.passwordRules(pw, $('#rp-pw-rules', root), function () { return A.user.email; });
      A.capsLock(pw);
      A.form(form, {
        fields: [{ el: pw, name: 'password', label: 'New password', required: 'Create a password.', blur: false, check: function (v) { return rules.check(v); } }],
        onInvalid: function () { if (pw.value) rules.announce(); },
        submit: function (v, api) {
          send(form, api, 'Saving…', function (r) {
            if (common(r, form, api)) return;
            if (r === 'expired') { A.show('link-expired', { url: 'forgot-password.html?step=link-expired', replace: true, focus: 'h1' }); return; }
            A.go(A.url('login.html', { reason: 'password-changed', others: $('#rp-others', root).checked ? '1' : null }), true);
          });
        }
      });
    }
  });
  function failure(name, h1, body, primary, secondary) {
    A.view(name, {
      title: 'Reset password',
      html: function () {
        return '<h1 class="auth-h1">' + h1 + '</h1><p class="auth-sub">' + body + '</p><div class="auth-actions">' +
          (primary[1] ? '<a class="btn btn--primary btn--lg btn--full" href="' + esc(primary[1]) + '"><span data-label>' + primary[0] + '</span></a>' : '<a class="btn btn--primary btn--lg btn--full" href="forgot-password.html" data-new-link><span data-label>' + primary[0] + '</span></a>') +
          (secondary[1] ? '<a class="auth-link auth-link--block" href="' + esc(secondary[1]) + '">' + secondary[0] + '</a>' : '<a class="auth-link auth-link--block" href="forgot-password.html" data-new-link>' + secondary[0] + '</a>') + '</div>';
      },
      bind: function (root) { U.$$('[data-new-link]', root).forEach(function (a) { a.addEventListener('click', toRequest); }); }
    });
  }
  failure('link-expired', 'This link has expired', 'Reset links work for ' + MIN + ' minutes.', ['Send a new link'], ['Back to sign in', 'login.html']);
  failure('link-used', 'This link was already used', 'Your password may already be changed.', ['Sign in', 'login.html'], ['Send a new link']);
  failure('link-invalid', 'This link doesn’t work', 'It may be incomplete. Copy the whole link from the email, or send a new one.', ['Send a new link'], ['Back to sign in', 'login.html']);

  /* ---------- Route: the token is exchanged, then dropped from the address bar ---------- */
  function route() {
    var q = A.qs(), t = q.get('token'), s = q.get('step');
    if (t) {
      var name = t === 'valid' ? 'reset' : t === 'expired' ? 'link-expired' : t === 'used' ? 'link-used' : 'link-invalid';
      history.replaceState({ auth: name }, '', 'forgot-password.html?step=' + name);
      return name;
    }
    return ['reset', 'link-expired', 'link-used', 'link-invalid'].indexOf(s) >= 0 ? s : 'request';
  }
  var L = function (label, href, note) { return [label, href, note]; };
  A.boot({
    route: function (o) { A.show(route(), { initial: o.initial, focus: o.popstate ? 'h1' : null }); },
    proto: {
      sections: [
        { id: 'ap-screens', title: 'Recovery screens', links: [L('Reset your password', 'forgot-password.html'), L('Set a new password (valid link)', 'forgot-password.html?token=valid'), L('Link expired', 'forgot-password.html?token=expired'), L('Link already used', 'forgot-password.html?token=used'), L('Link incomplete', 'forgot-password.html?token=f3a9'), L('Cookies blocked', 'forgot-password.html?cookies=blocked')] },
        { id: 'ap-other', title: 'Other auth pages', links: [L('Sign in', 'login.html'), L('After a reset: password changed', 'login.html?reason=password-changed&others=1'), L('Create account', 'signup.html')] }
      ],
      results: ['success', 'expired', 'ratelimit', 'network', 'server', 'down']
    }
  });
})(window, document, window.Vaani, window.VaaniAuth);
