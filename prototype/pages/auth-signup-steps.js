/* =====================================================================================================
   Vaani Labs prototype · pages/auth-signup-steps.js — the steps after "Create account" (08-public-auth §9.5–§9.6,
   §12; 00-app-shell-ia §12.2): confirm your email (link or code, advancing by itself when the link is opened in
   another tab), the transient landings, the OAuth confirm screen, create your workspace, and pending approval.
   Loaded before auth-signup.js, which owns the form, invites and the route.
   ===================================================================================================== */
(function (w, d, V, A) {
  'use strict';
  var U = V.util, $ = U.$, esc = U.esc;
  var S = A.signup = A.signup || {};
  S.afterConfirm = function () { return A.access() === 'approval' ? 'pending' : 'workspace'; };
  S.goStep = function (name, replace) { A.show(name, { url: A.url('signup.html', { step: name }), replace: !!replace, focus: 'h1' }); };
  S.common = function (r, form, api) {
    if (r === 'ratelimit') { A.formError(form, 'ratelimit'); return true; }
    if (r === 'network') { A.formError(form, 'network', { onRetry: api.submit }); return true; }
    if (r === 'server') { A.formError(form, 'server'); return true; }
    if (r === 'down') { A.formError(form, 'down', { text: 'Sign-up isn’t working right now. Your details are safe. Try again in a few minutes.' }); return true; }
    return false;
  };
  S.send = function (form, api, label, then) {
    var btn = $('[data-auth-primary]', form); api.setSending(true); A.busy(btn, label);
    A.request().then(function (r) { A.unbusy(btn).then(function () { api.setSending(false); then(r); }); });
  };
  var TERMS = 'By creating an account, you agree to the <a href="#" data-offsite="The terms">Terms</a> and the <a href="#" data-offsite="The privacy policy">Privacy policy</a>.';
  S.TERMS = TERMS;

  /* Another tab confirming the email advances this one (BroadcastChannel, with a storage-event fallback for file://). */
  var chan = null; try { chan = new BroadcastChannel('vaani-auth'); } catch (e) { chan = null; }
  S.broadcastVerified = function () {
    try { if (chan) chan.postMessage({ type: 'email-verified' }); } catch (e) { /* ignore */ }
    U.store.set('vaani:auth:verified-at', String(Date.now()));
  };
  function onVerified(fn) {
    var done = false, go = function () { if (done || A.current() !== 'verify') return; done = true; V.announce('Email confirmed.'); setTimeout(fn, 600); };
    if (chan) chan.onmessage = function (e) { if (e.data && e.data.type === 'email-verified') go(); };
    w.addEventListener('storage', function (e) { if (e.key === 'vaani:auth:verified-at') go(); });
  }

  /* ---------- /signup/verify ---------- */
  A.view('verify', {
    title: 'Confirm your email',
    html: function () {
      var mail = A.email.get() || A.user.email;
      return '<h1 class="auth-h1">Confirm your email</h1><p class="auth-sub">We sent a link and a 6-digit code to <span class="auth-strong" data-sent-to>' + esc(mail) + '</span>. Open the link on any device, or enter the code here.</p>' +
        A.codeForm('sv', 'Code from the email', 'We’ll check it as soon as you enter 6 digits.', 'Confirm', 'You’re offline. Connect to confirm your email.') +
        '<div class="auth-resend"><div class="auth-row auth-row--start"><button type="button" class="auth-link auth-link--block" data-resend>Resend email</button></div><p class="auth-status-line" role="status" data-resend-status></p></div>' +
        '<p class="auth-sub">Wrong address? <button type="button" class="auth-link" data-change aria-expanded="false" aria-controls="sv-change">Change email</button></p>' +
        '<form class="auth-inline" id="sv-change" action="signup.html" method="post" novalidate hidden><div class="field"><label class="field-label" for="sv-new">New email</label><div class="input input--lg"><input id="sv-new" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required></div></div>' +
        '<div class="auth-formerr" data-formerr></div><div class="auth-inline-acts"><button type="submit" class="btn" data-auth-primary data-offline="You’re offline. Connect to change the address."><span data-label>Send to this address</span></button><button type="button" class="btn btn--tertiary" data-change-cancel><span data-label>Cancel</span></button></div></form>';
    },
    bind: function (root) {
      var form = $('#sv-form', root), code = $('#sv-code', root), status = $('[data-resend-status]', root);
      var rs = A.resend($('[data-resend]', root), status, { seconds: 30 });
      var next = function () { S.goStep(S.afterConfirm()); };
      var api, otp = A.otp(code, {
        onComplete: function () {
          return A.request(800).then(function (r) {
            if (r === 'wrong') return { error: 'That code didn’t work. Check the latest email from Vaani Labs.' };
            if (r === 'expired') { rs.enable(); return { error: 'That code has expired. Send a new email.' }; }
            if (S.common(r, form, api)) return {};
            next(); return { done: true };
          });
        }
      });
      api = A.form(form, { fields: [{ el: code, name: 'code', label: 'Code', live: false, required: 'Enter the 6-digit code from the email.', check: A.codeCheck }], submit: function () { otp.run(); } });
      onVerified(next);
      /* Wrong address: an inline field, no trip back to the form. */
      var change = $('#sv-change', root), open = $('[data-change]', root), neu = $('#sv-new', root);
      function toggle(on) { change.hidden = !on; open.setAttribute('aria-expanded', String(on)); if (on) { neu.value = ''; neu.focus(); } else open.focus(); }
      open.addEventListener('click', function () { toggle(change.hidden); });
      $('[data-change-cancel]', root).addEventListener('click', function () { A.fieldError(neu, null); toggle(false); });
      A.form(change, {
        fields: [{ el: neu, name: 'email', label: 'New email', required: 'Enter your email.', check: function (v) { return A.isEmail(v) ? null : 'Enter an email address, like name@company.com.'; } }],
        submit: function (v, a) {
          S.send(change, a, 'Sending…', function (r) {
            if (S.common(r, change, a)) return;
            A.email.set(v.email); $('[data-sent-to]', root).textContent = v.email;
            status.innerHTML = '<span class="status status--success">' + V.icon('check', 'sm') + 'Sent to ' + esc(v.email) + ' at ' + esc(A.nowText()) + '.</span>';
            otp.reset(); A.fieldError(code, null); toggle(false);
          });
        }
      });
    }
  });

  /* ---------- Transient landings: nothing for 200 ms, then one line ---------- */
  function transient(text, run) {
    return { title: text === 'Confirming your email…' ? 'Confirming' : 'Signing in', panelClass: 'auth-panel--transient', html: '<h1 class="auth-transient" hidden>' + text + '</h1>',
      bind: function (root) { var h = $('h1', root); setTimeout(function () { h.hidden = false; }, 200); run(); } };
  }
  /* /auth/verify?token= : the emailed link. With no session here it goes to sign in (§9.5). */
  A.view('confirming', transient('Confirming your email…', function () {
    A.request(1200).then(function (r) {
      if (r === 'expired' || r === 'wrong') { A.go('signup.html?step=verify', true); return; }
      S.broadcastVerified();
      if (A.qs().get('nosession') === '1') A.go(A.url('login.html', { reason: 'verified' }), true);
      else S.goStep(S.afterConfirm(), true);
    });
  }));
  /* /auth/callback/<provider> for a sign-up or an invite. */
  A.view('signing-in', transient('Signing you in…', function () {
    var q = A.qs(), via = A.PROVIDERS[q.get('via')] ? q.get('via') : 'google', invite = q.get('invite');
    A.request(1300).then(function (r) {
      if (invite) {
        if (r === 'wrong') return A.go('signup.html?invite=mismatch&provider=' + via, true);
        if (r === 'oauth-cancelled' || r === 'oauth-failed' || r === 'network' || r === 'server' || r === 'down') return A.go('signup.html?invite=new&reason=' + (r === 'oauth-cancelled' ? 'oauth-cancelled' : 'oauth-failed') + '&provider=' + via, true);
        A.setLastMethod(via); return A.go('index.html', true);
      }
      if (r === 'oauth-cancelled') return A.go(A.url('signup.html', { reason: 'oauth-cancelled', provider: via }), true);
      if (r === 'oauth-failed' || r === 'network' || r === 'server' || r === 'down') return A.go(A.url('signup.html', { reason: 'oauth-failed', provider: via }), true);
      if (r === 'oauth-unlinked') return A.go(A.url('login.html', { reason: 'oauth-link', provider: via }), true);
      A.show('confirm', { url: A.url('signup.html', { step: 'confirm', provider: via }), replace: true, focus: 'h1' });
    });
  }));

  /* ---------- /signup/confirm: a new account through Google or Facebook ---------- */
  A.view('confirm', {
    title: 'Create account',
    html: function () {
      var P = A.PROVIDERS[A.provider()].name, appr = A.access() === 'approval';
      return '<h1 class="auth-h1">Create your Vaani Labs account</h1><p class="auth-sub">You’re signing up as <span class="auth-strong">' + esc(A.user.name) + '</span> (anika.rao@example.com) with ' + P + '.</p>' +
        '<form class="auth-form" id="sc-form" action="signup.html" method="post" novalidate>' +
        (appr ? '<div class="field"><label class="field-label" for="sc-company">Company</label><div class="input input--lg"><input id="sc-company" name="company" autocomplete="organization" required></div></div>' : '') +
        '<p class="auth-terms">' + TERMS + '</p><div class="auth-actions"><div class="auth-formerr" data-formerr></div>' +
        '<button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="You’re offline. Connect to create your account."><span data-label>' + (appr ? 'Request access' : 'Create account') + '</span></button>' +
        '<a class="btn btn--tertiary btn--lg btn--full" href="signup.html" data-other><span data-label>Use a different account</span></a></div></form>';
    },
    bind: function (root) {
      var form = $('#sc-form', root), co = $('#sc-company', root), appr = !!co;
      $('[data-other]', root).setAttribute('href', A.url('signup.html'));
      A.form(form, {
        fields: co ? [{ el: co, name: 'company', label: 'Company', required: 'Enter your company’s name.' }] : [],
        submit: function (v, api) {
          S.send(form, api, appr ? 'Sending request…' : 'Creating account…', function (r) {
            if (S.common(r, form, api)) return;
            A.setLastMethod(A.provider());
            S.goStep(appr ? 'pending' : 'workspace');   /* the provider already verified the address */
          });
        }
      });
    }
  });

  /* ---------- /signup/workspace (00-app-shell-ia §12.2): created with you as Admin, then Home ---------- */
  var TAKEN = ['sample-realty', 'vaani', 'vaani-labs', 'demo', 'test', 'admin', 'app', 'www'];
  function slug(v) { return String(v || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }
  var GOALS = [['qualify', 'Qualify new leads'], ['remind', 'Remind customers'], ['inbound', 'Answer inbound calls'], ['other', 'Something else']];
  A.view('workspace', {
    title: 'Create workspace',
    html: function () {
      return '<h1 class="auth-h1">Create your workspace</h1><p class="auth-sub">Teammates, numbers and billing live here.</p>' +
        '<form class="auth-form" id="ws-form" action="signup.html" method="post" novalidate>' +
        '<div class="field"><label class="field-label" for="ws-name">Workspace name</label><div class="input input--lg"><input id="ws-name" name="workspace" autocomplete="organization" maxlength="60" enterkeyhint="next" required></div></div>' +
        '<div class="field"><label class="field-label" for="ws-addr">Workspace address</label><div class="input input--lg"><input id="ws-addr" name="subdomain" autocapitalize="none" spellcheck="false" autocomplete="off" aria-describedby="ws-addr-h" required><span class="input-suffix">.vaanilabs.in</span></div>' +
        '<p class="field-hint" id="ws-addr-h">Letters, numbers and hyphens. You can change it twice later.</p></div>' +
        '<fieldset class="auth-goals"><legend>What should your agent do first? <span class="field-opt">(optional)</span></legend>' +
        GOALS.map(function (g) { return '<label class="rcard"><input type="radio" class="radio" name="goal" value="' + g[0] + '"><span class="rcard-body"><span class="rcard-title">' + g[1] + '</span></span></label>'; }).join('') + '</fieldset>' +
        '<div class="auth-actions"><div class="auth-formerr" data-formerr></div><button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="You’re offline. Connect to create the workspace."><span data-label>Create workspace</span></button>' +
        '<p class="auth-hint auth-center">You’ll be the admin. You can invite teammates from Home or Settings.</p></div></form>';
    },
    bind: function (root) {
      var form = $('#ws-form', root), name = $('#ws-name', root), addr = $('#ws-addr', root), hint = $('#ws-addr-h', root);
      var touched = false, timer = null, pending = null, state = 'idle', sugg = '';
      function paint(s, sug) {
        state = s; if (sug) sugg = sug;
        if (s === 'taken') { A.fieldError(addr, { html: 'Taken. Try <button type="button" class="auth-link" data-suggest="' + esc(sug) + '" aria-label="Use ' + esc(sug) + '">' + esc(sug) + '</button>' }); V.announce('Taken. Try ' + sug + '.'); return; }
        if (addr.getAttribute('aria-invalid') === 'true' && s !== 'bad') A.fieldError(addr, null);
        hint.className = 'field-hint' + (s === 'ok' ? ' field-hint--ok' : '');
        hint.innerHTML = s === 'checking' ? V.icon('loader-circle', 'sm', { className: 'spinner' }) + ' Checking…' : s === 'ok' ? V.icon('check', 'sm') + 'Available · you can change it twice later' : 'Letters, numbers and hyphens. You can change it twice later.';
      }
      function valid(v) { return /^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(v) && v.length >= 3; }
      function check(v) {                                   /* V5: async, debounced; submit waits for it */
        clearTimeout(timer); if (!v || !valid(v)) { paint('idle'); return Promise.resolve(); }
        paint('checking');
        pending = new Promise(function (res) {
          timer = setTimeout(function () {
            var taken = TAKEN.indexOf(v) >= 0 || A.result() === 'taken';
            if (addr.value.trim() === v) { if (taken) paint('taken', v.replace(/-\d+$/, '') + '-2'); else paint('ok'); }
            pending = null; res();
          }, 600);
        });
        return pending;
      }
      name.addEventListener('input', function () { if (!touched) { addr.value = slug(name.value); if (addr.value) check(addr.value); else paint('idle'); } });
      addr.addEventListener('input', function () { touched = true; var v = addr.value.trim(); clearTimeout(timer); timer = setTimeout(function () { check(v); }, 300); });
      addr.addEventListener('blur', function () { var v = addr.value.trim(); if (v !== v.toLowerCase()) addr.value = v.toLowerCase(); });   /* V8: visible, on blur */
      form.addEventListener('click', function (e) { var b = e.target.closest('[data-suggest]'); if (!b) return; addr.value = b.getAttribute('data-suggest'); touched = true; check(addr.value); addr.focus(); });
      A.form(form, {
        fields: [
          { el: name, name: 'workspace', label: 'Workspace name', required: 'Enter a workspace name.', check: function (v) { return v.length < 2 ? 'Use at least 2 characters.' : null; } },
          { el: addr, name: 'subdomain', label: 'Workspace address', required: 'Choose a workspace address.', check: function (v) { return valid(v.toLowerCase()) ? null : 'Use letters, numbers and hyphens.'; } }
        ],
        submit: function (v, api) {
          var btn = $('[data-auth-primary]', form); api.setSending(true); A.busy(btn, 'Creating workspace…');
          Promise.resolve(pending || (state === 'ok' || state === 'taken' ? null : check(addr.value.trim()))).then(function () {
            if (state === 'taken') { A.unbusy(btn).then(function () { api.setSending(false); paint('taken', sugg); addr.focus(); }); return; }
            A.request(1000).then(function (r) {
              A.unbusy(btn).then(function () {
                api.setSending(false);
                if (r === 'network' || r === 'server' || r === 'down') { A.formError(form, 'network', { text: 'Couldn’t create the workspace. Your details are kept.', onRetry: api.submit }); return; }
                if (r === 'ratelimit') { A.formError(form, 'ratelimit'); return; }
                A.email.clear();
                A.go('index.html?setup=incomplete&demo=new', true);   /* /home replaces this entry; Home: 0 of 5 */
              });
            });
          });
        }
      });
    }
  });

  /* ---------- /signup/pending (approval mode only) ---------- */
  A.view('pending', {
    title: 'Request received',
    html: function () {
      var rt = A.claims.access.reviewTime;
      return '<h1 class="auth-h1">We’re reviewing your request</h1><p class="auth-sub">We’ll email you at the address you signed up with.' + (rt ? ' Most requests are reviewed ' + esc(rt) + '.' : '') + '</p>' +
        '<ol class="stages" aria-label="Your request">' +
        '<li class="stage"><span class="smark smark--done">' + V.icon('check', 'xs') + '</span><span>Email confirmed</span><span class="sr-only">Done</span></li>' +
        '<li class="stage" aria-current="step"><span class="smark smark--current" aria-hidden="true"></span><span>We review your request<span class="stage-meta">We email you when it’s approved.</span></span></li>' +
        '<li class="stage"><span class="smark smark--todo" aria-hidden="true"></span><span>Create your workspace<span class="stage-meta">After approval, sign in and name it.</span></span></li></ol>' +
        '<div class="auth-row auth-row--start"><a class="auth-link auth-link--block" href="mailto:' + A.claims.contact.sales + '">Talk to us</a><a class="auth-link auth-link--block" href="login.html?reason=signed-out">Sign out</a></div>';
    }
  });
})(window, document, window.Vaani, window.VaaniAuth);
