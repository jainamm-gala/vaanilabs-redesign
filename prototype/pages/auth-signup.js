/* =====================================================================================================
   Vaani Labs prototype · pages/auth-signup.js — /signup (08-public-auth §9), invites (§11), the SignedInPanel,
   the route and the prototype states. The steps after the form are in auth-signup-steps.js.
   Self-serve: "Create your account" · Create account. Approval (?access=approval): "Request access", a Company field,
   and step 2 of the aside reads "We review your request". No phone field (PA7). The Terms sentence shows before any
   account is created, by email or by a provider (PA8).
   ===================================================================================================== */
(function (w, d, V, A) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, S = A.signup;
  var T_FORM = A.root().innerHTML;                 /* the one source of the form view: the static markup */
  var EMAIL_ERR = 'Enter an email address, like name@company.com.';
  var INVITEE = ((A.org.members || []).filter(function (m) { return m.invited; })[0]) || { name: 'Meera Joshi', short: 'Meera J.', email: 'meera.joshi@samplerealty.example' };
  var INVITER = A.user;

  /* Form state (not the password) survives a trip to the Terms and Back (§9.4). */
  function saved() { try { return JSON.parse(A.ss.get('vaani:auth:signup') || '{}'); } catch (e) { return {}; } }
  function save(k, v) { var o = saved(); o[k] = v; A.ss.set('vaani:auth:signup', JSON.stringify(o)); }

  function oauthNotice(r) {
    var P = A.PROVIDERS[A.provider()].name;
    if (r === 'oauth-cancelled') return A.notice('neutral', P + ' sign-up was cancelled.', 'Choose another way to create your account.');
    if (r === 'oauth-failed') return A.notice('danger', 'Couldn’t continue with ' + P + '.', 'Try again, or use your email.');
    return '';
  }

  /* ---------- /signup ---------- */
  A.view('form', {
    title: 'Create account', layout: 'pair', html: function () { return T_FORM; },
    bind: function (root) {
      var appr = A.access() === 'approval', form = $('#su-form', root);
      $('[data-h1]', root).textContent = appr ? 'Request access' : 'Create your account';
      $('[data-crosslink]', root).innerHTML = 'Already have an account? <a class="auth-link" href="' + esc(A.url('login.html')) + '">Sign in</a>';
      $('[data-notice]', root).innerHTML = A.cookieNotice() + oauthNotice(A.qs().get('reason'));
      $$('[data-oauth-provider]', root).forEach(function (a) { a.setAttribute('href', A.url('signup.html?step=signing-in', { via: a.getAttribute('data-oauth-provider'), intent: 'signup' })); });
      var two = $('[data-step-two]');
      if (appr) {
        $('[data-after-email]', root).insertAdjacentHTML('afterend', '<div class="field"><label class="field-label" for="su-company">Company</label><div class="input input--lg"><input id="su-company" name="company" autocomplete="organization" enterkeyhint="next" required></div></div>');
        var btn = $('[data-auth-primary]', form); $('[data-label]', btn).textContent = 'Request access'; btn.setAttribute('data-offline', 'You’re offline. Connect to send your request.');
        $('[data-next-line]', root).textContent = 'Next: confirm your email, then we review your request.';
        if (two) { $('.auth-step-title', two).textContent = 'We review your request'; $('.auth-step-body', two).textContent = (A.claims.access.reviewTime ? 'We review requests ' + A.claims.access.reviewTime + '. ' : '') + 'We email you when it’s approved.'; }
      } else if (two) { $('.auth-step-title', two).textContent = 'Name your workspace'; $('.auth-step-body', two).textContent = 'Teammates, numbers and billing live there. You’ll be its admin.'; }
      var name = $('#su-name', root), email = $('#su-email', root), co = $('#su-company', root), pw = $('#su-password', root), st = saved();
      name.value = st.name || ''; email.value = st.email || A.email.get(); if (co) co.value = st.company || '';
      [name, email, co].forEach(function (el) { if (el) el.addEventListener('input', function () { save(el.name, el.value); if (el === email) A.email.set(el.value); }); });
      var rules = A.passwordRules(pw, $('#su-password-rules', root), function () { return email.value.trim(); });
      email.addEventListener('input', rules.update);
      A.capsLock(pw);
      var fields = [
        { el: name, name: 'name', label: 'Full name', required: 'Enter your name.', check: function (v) { return v.length < 2 ? 'Enter your full name.' : null; } },
        { el: email, name: 'email', label: 'Work email', required: 'Enter your email.', check: function (v) { return A.isEmail(v) ? null : EMAIL_ERR; } }
      ];
      if (co) fields.push({ el: co, name: 'company', label: 'Company', required: 'Enter your company’s name.' });
      fields.push({ el: pw, name: 'password', label: 'Password', required: 'Create a password.', blur: false, check: function (v) { return rules.check(v); } });
      A.form(form, {
        fields: fields,
        onInvalid: function (bad) { if (bad.some(function (f) { return f.el === pw; }) && pw.value) rules.announce(); },
        submit: function (v, api) {
          A.email.set(v.email);
          S.send(form, api, appr ? 'Sending request…' : 'Creating account…', function (r) {
            if (S.common(r, form, api)) return;
            A.ss.set('vaani:auth:signup', null);
            /* An address that already has an account takes the same path (no enumeration); its owner gets an email. */
            S.goStep('verify');
          });
        }
      });
    }
  });

  /* ---------- /invite/<token> (§11) ---------- */
  function who(u, meta) {
    return '<div class="auth-who">' + V.ui.avatar(u.name, { size: 32 }) + '<span class="auth-who-text"><span class="auth-who-name">' + esc(u.short || u.name) + '</span><span class="auth-who-meta">' + esc(meta) + '</span></span></div>';
  }
  function btn(href, label, kind) { return '<a class="btn ' + (kind || 'btn--primary') + ' btn--lg btn--full" href="' + esc(href) + '"><span data-label>' + esc(label) + '</span></a>'; }
  var JOIN = 'Join ' + A.org.name;
  A.view('invite', {
    title: JOIN,
    html: function () {
      var s = A.qs().get('invite'), org = esc(A.org.name), P = A.PROVIDERS[A.provider()].name, h = '';
      var head = function (t, sub) { return '<h1 class="auth-h1">' + t + '</h1>' + (sub ? '<p class="auth-sub">' + sub + '</p>' : ''); };
      if (s === 'existing') return head(JOIN, 'Sign in as <span class="auth-strong">' + esc(INVITEE.email) + '</span> to join.') +
        '<div class="auth-actions">' + btn(A.url('login.html', { next: 'signup.html?invite=signed-in' }), 'Sign in to join') + '</div>';
      if (s === 'signed-in') return head(JOIN, 'You’ll join as a Member.') + who(INVITEE, INVITEE.email) +
        '<form class="auth-form" id="iv-form" action="signup.html" method="post" novalidate><div class="auth-actions"><div class="auth-formerr" data-formerr></div><button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="You’re offline. Connect to join."><span data-label>' + esc(JOIN) + '</span></button>' + btn('index.html', 'Not now', 'btn--tertiary') + '</div></form>';
      if (s === 'other') return head('This invite is for another account', 'It was sent to ' + esc(A.mask(INVITEE.email)) + '. You’re signed in as ' + esc(A.mask(A.user.email)) + '.') +
        '<div class="auth-actions">' + btn('signup.html?invite=new', 'Sign out and continue') + btn('index.html', 'Stay signed in', 'btn--tertiary') + '</div>';
      if (s === 'expired') return head('This invite has expired', 'Invites work for ' + A.claims.expiry.invite + ' days. Ask ' + esc(INVITER.short) + ' to send a new one.') + '<div class="auth-actions">' + btn('login.html', 'Go to Vaani Labs') + '</div>';
      if (s === 'withdrawn') return head('This invite was withdrawn', 'Ask your workspace admin if you still need access.') + '<div class="auth-actions">' + btn('login.html', 'Go to Vaani Labs') + '</div>';
      if (s === 'accepted') return head('You’re already in ' + org, '') + '<div class="auth-actions">' + btn('index.html', 'Open ' + A.org.name) + '</div>';
      /* new (and mismatch: a provider returned another address) */
      h = head(JOIN, esc(INVITER.short) + ' invited you as a Member. You’ll join with <span class="auth-strong">' + esc(INVITEE.email) + '</span>.') + '<div class="auth-notice-slot" data-notice>' +
        (s === 'mismatch' ? A.notice('warning', 'This invite is for ' + A.mask(INVITEE.email) + '.', 'Continue with the ' + P + ' account that uses that address, or set a password below.') : '') + oauthNotice(A.qs().get('reason')) + '</div>' +
        '<form class="auth-form" id="iv-form" action="signup.html" method="post" novalidate>' +
        '<div class="field"><label class="field-label" for="iv-email">Email</label><div class="input input--lg"><input id="iv-email" name="email" type="email" autocomplete="username" value="' + esc(INVITEE.email) + '" readonly data-ro aria-describedby="iv-email-h"></div><p class="field-hint" id="iv-email-h">The invite was sent to this address, so you don’t need to confirm it.</p></div>' +
        '<div class="field"><label class="field-label" for="iv-name">Full name</label><div class="input input--lg"><input id="iv-name" name="name" autocomplete="name" autocapitalize="words" maxlength="80" required></div></div>' +
        '<div class="field"><label class="field-label" for="iv-pw">Password</label><div class="input input--lg"><input id="iv-pw" name="password" type="password" autocomplete="new-password" aria-describedby="iv-pw-rules" required><button type="button" class="input-btn" data-password-toggle aria-controls="iv-pw" aria-pressed="false" aria-label="Show password">' + V.icon('eye') + '</button></div>' + A.rulesHtml('iv-pw-rules') + '</div>' +
        '<p class="auth-terms">By joining, you agree to the <a href="#" data-offsite="The terms">Terms</a> and the <a href="#" data-offsite="The privacy policy">Privacy policy</a>.</p>' +
        '<div class="auth-actions"><div class="auth-formerr" data-formerr></div><button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="You’re offline. Connect to join."><span data-label>' + esc(JOIN) + '</span></button></div></form>' +
        '<div class="auth-or" aria-hidden="true">or</div>' + A.oauthButtons('invite', { invite: 'new' });
      return h;
    },
    bind: function (root) {
      var form = $('#iv-form', root); if (!form) return;
      var pw = $('#iv-pw', root), name = $('#iv-name', root), fields = [], rules = null;
      if (pw) {
        rules = A.passwordRules(pw, $('#iv-pw-rules', root), function () { return INVITEE.email; }); A.capsLock(pw);
        fields = [{ el: name, name: 'name', label: 'Full name', required: 'Enter your name.' }, { el: pw, name: 'password', label: 'Password', required: 'Create a password.', blur: false, check: function (v) { return rules.check(v); } }];
      }
      A.form(form, {
        fields: fields,
        onInvalid: function () { if (rules && pw.value) rules.announce(); },
        submit: function (v, api) {
          S.send(form, api, 'Joining…', function (r) {
            if (S.common(r, form, api)) return;
            if (r === 'expired') { A.show('invite', { url: 'signup.html?invite=expired', replace: true, focus: 'h1' }); return; }
            A.go('index.html', true);           /* the landing route; the app says "You joined Sample Realty." */
          });
        }
      });
    }
  });

  /* ---------- Signed in already (PA10) ---------- */
  A.view('signed-in', {
    title: 'Create account',
    html: function () {
      return '<h1 class="auth-h1">You already have an account</h1>' + who(A.user, A.mask(A.user.email) + ' · ' + A.org.name) +
        '<div class="auth-actions">' + btn(A.landing(), 'Continue to Vaani Labs') + '<button type="button" class="btn btn--tertiary btn--lg btn--full" data-switch><span data-label>Use a different account</span></button></div>';
    },
    bind: function (root) {
      $('[data-switch]', root).addEventListener('click', function () { var q = A.qs(); q.delete('session'); var s = q.toString(); A.go('signup.html' + (s ? '?' + s : '')); });
    }
  });

  /* ---------- Route and prototype states ---------- */
  var STEPS = ['verify', 'confirming', 'signing-in', 'confirm', 'workspace', 'pending'];
  function route() {
    var q = A.qs(), s = q.get('step');
    if (s === 'signing-in') return s;
    if (q.get('invite')) return 'invite';
    if (A.signedIn()) return 'signed-in';
    return STEPS.indexOf(s) >= 0 ? s : 'form';
  }
  var L = function (label, href, note, blank) { return [label, href, note, blank]; };
  A.boot({
    route: function (o) { A.show(route(), { initial: o.initial, focus: o.popstate ? 'h1' : null }); },
    proto: {
      sections: [
        { id: 'ap-screens', title: 'Sign-up screens', links: [L('Create your account (self-serve)', 'signup.html?access=self-serve'), L('Request access (approval)', 'signup.html?access=approval'), L('Confirm your email', 'signup.html?step=verify'), L('Open the emailed link in a new tab', 'signup.html?step=confirming', 'the confirm tab advances by itself', true), L('Emailed link, no session in this browser', 'signup.html?step=confirming&nosession=1'), L('New account through Google', 'signup.html?step=confirm&provider=google'), L('Create your workspace', 'signup.html?step=workspace', 'try the name “Sample Realty”'), L('Pending approval', 'signup.html?step=pending&access=approval'), L('Already signed in', 'signup.html?session=1'), L('Cookies blocked', 'signup.html?cookies=blocked')] },
        { id: 'ap-invite', title: 'Invite (/invite/<token>)', links: [L('New to Vaani Labs', 'signup.html?invite=new'), L('Has an account', 'signup.html?invite=existing'), L('Signed in as the invitee', 'signup.html?invite=signed-in'), L('Signed in as someone else', 'signup.html?invite=other'), L('Provider returned another address', 'signup.html?invite=mismatch&provider=google'), L('Expired', 'signup.html?invite=expired'), L('Withdrawn', 'signup.html?invite=withdrawn'), L('Already accepted', 'signup.html?invite=accepted')] },
        { id: 'ap-other', title: 'Other auth pages', links: [L('Sign in', 'login.html'), L('Reset your password', 'forgot-password.html'), L('Set a new password', 'forgot-password.html?token=valid')] }
      ],
      results: ['success', 'wrong', 'expired', 'ratelimit', 'network', 'server', 'down', 'taken', 'oauth-unlinked', 'oauth-cancelled', 'oauth-failed']
    }
  });
})(window, document, window.Vaani, window.VaaniAuth);
