/* =====================================================================================================
   Vaani Labs prototype · pages/auth-forms.js — form behaviour shared by the auth pages.
   - Validation timing, the one rule (02-components-core §8.2 V1–V11): no new errors while typing; format checked on
     blur of a changed field; everything on submit; ≤ 3 fields focus the first invalid one, longer forms show a summary.
   - Busy buttons (core §2.1): label switches to its "…" form, width locked, spinner after 200 ms, shown ≥ 400 ms.
   - InlineError above the primary, role="alert" (§8.2 V7); rate limit with a silent countdown.
   - PasswordInput (core §3.3): Caps Lock hint, live rules list for new passwords (silent; announced on a failed submit).
   - OneTimeCodeInput (08 §18): one field, digits only, paste of "482 017", "482-017" or a whole email line; checks at
     6 digits (the hint says so first, WCAG 3.2.2). ResendLink (§18): 30 s cooldown, silent countdown.
   ===================================================================================================== */
(function (w, d, V, A) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc;

  /* ---------- Field errors: under the field, aria-invalid, the error replaces the hint in aria-describedby ---------- */
  A.fieldError = function (input, msg) {
    var field = input.closest('.field') || input.parentNode, id = input.id + '-e', err = U.byId(id);
    if (!input.hasAttribute('data-desc')) input.setAttribute('data-desc', input.getAttribute('aria-describedby') || '');
    var base = input.getAttribute('data-desc').split(/\s+/).filter(Boolean);
    var hints = $$('.field-hint', field).map(function (h) { return h.id; });
    if (!msg) {
      if (err) err.remove(); input.removeAttribute('aria-invalid');
      $$('.field-hint', field).forEach(function (h) { h.hidden = false; });
      if (base.length) input.setAttribute('aria-describedby', base.join(' ')); else input.removeAttribute('aria-describedby');
      return;
    }
    if (!err) { err = d.createElement('p'); err.className = 'field-error'; err.id = id; (input.closest('.input') || input).insertAdjacentElement('afterend', err); }
    err.innerHTML = V.icon('circle-alert') + '<span>' + (typeof msg === 'object' ? msg.html : esc(msg)) + '</span>';
    input.setAttribute('aria-invalid', 'true');
    $$('.field-hint', field).forEach(function (h) { h.hidden = true; });
    input.setAttribute('aria-describedby', [id].concat(base.filter(function (x) { return hints.indexOf(x) < 0; })).join(' '));
  };

  /* ---------- Form engine ---------- */
  A.form = function (form, o) {
    form.noValidate = true;
    var fields = o.fields.filter(function (f) { return f.el; }), timer = null;
    function check(f) { var v = f.el.value.trim(); var m = !v ? f.required : (f.check ? f.check(v) : null); A.fieldError(f.el, m || null); return m; }
    fields.forEach(function (f) {
      f.el.addEventListener('input', function () {
        f.dirty = true;
        if (f.el.getAttribute('aria-invalid') !== 'true') return;
        if (f.live === false) { A.fieldError(f.el, null); return; }            /* codes: a new attempt clears the old error */
        clearTimeout(timer); timer = setTimeout(function () { check(f); }, 300);
      });
      f.el.addEventListener('blur', function () {
        if (f.el.type !== 'password' && f.el.value !== f.el.value.trim()) f.el.value = f.el.value.trim();   /* V8: trim on blur, visibly */
        if (f.dirty && f.el.value && f.check && f.blur !== false) { var m = f.check(f.el.value.trim()); if (m) A.fieldError(f.el, m); }
        if (f.onBlur) f.onBlur(f.el.value.trim());
      });
    });
    var api = {
      fields: fields,
      sending: false,
      setSending: function (on) {
        api.sending = on;
        fields.forEach(function (f) { if (f.el.type === 'radio' || f.el.type === 'checkbox') return; if (on) { f.el.setAttribute('readonly', ''); } else if (!f.el.hasAttribute('data-ro')) f.el.removeAttribute('readonly'); });
      },
      values: function () { var v = {}; fields.forEach(function (f) { v[f.name || f.el.name] = f.el.value.trim(); }); return v; },
      submit: function () { if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true })); }
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primary = $('[data-auth-primary]', form);
      if (api.sending || (primary && primary.getAttribute('aria-disabled') === 'true')) return;   /* V11: single submission */
      var bad = fields.filter(function (f) { return check(f); });
      var sum = $('[data-summary]', form.closest('[data-view-root]') || form);
      if (sum) sum.innerHTML = '';
      if (bad.length) {
        if (o.onInvalid) o.onInvalid(bad);
        if (sum && fields.length > 3) {                                     /* V4: longer forms get an error summary */
          sum.innerHTML = '<div class="notice notice--danger notice--multi" tabindex="-1" data-focus-target id="' + form.id + '-sum">' + V.icon('circle-alert') +
            '<div class="notice-body"><span class="notice-title">Fix ' + bad.length + (bad.length === 1 ? ' field' : ' fields') + ' to continue.</span><ul class="auth-sum-list">' +
            bad.map(function (f) { return '<li><a href="#' + f.el.id + '" data-focus-field="' + f.el.id + '">' + esc(f.label + ': ' + $('#' + f.el.id + '-e span').textContent) + '</a></li>'; }).join('') + '</ul></div></div>';
          $('.notice', sum).focus();
        } else bad[0].el.focus();
        return;
      }
      A.clearFormError(form);
      o.submit(api.values(), api);
    });
    return api;
  };
  d.addEventListener('click', function (e) { var a = e.target.closest('[data-focus-field]'); if (!a) return; e.preventDefault(); var t = U.byId(a.getAttribute('data-focus-field')); if (t) t.focus(); });

  /* ---------- Busy button or link ---------- */
  A.busy = function (btn, label) {
    if (!btn || btn._busy) return; var lab = $('[data-label]', btn);
    btn._busy = true; btn._label = lab.textContent; btn._spinAt = 0;
    btn.style.minInlineSize = btn.offsetWidth + 'px';
    lab.textContent = label; btn.setAttribute('aria-busy', 'true');
    btn._spinT = setTimeout(function () {
      var brand = $('.auth-brand', btn); if (brand) brand.setAttribute('hidden', '');
      lab.insertAdjacentHTML('beforebegin', V.icon('loader-circle', 'sm', { className: 'spinner' })); btn._spinAt = Date.now();
    }, 200);
  };
  A.unbusy = function (btn) {
    return new Promise(function (res) {
      if (!btn || !btn._busy) { res(); return; }
      clearTimeout(btn._spinT);
      var wait = btn._spinAt ? Math.max(0, 400 - (Date.now() - btn._spinAt)) : 0;
      setTimeout(function () {
        var sp = $('.spinner', btn); if (sp) sp.remove(); var brand = $('.auth-brand', btn); if (brand) brand.removeAttribute('hidden');
        $('[data-label]', btn).textContent = btn._label; btn.removeAttribute('aria-busy'); btn.style.minInlineSize = ''; btn._busy = false; res();
      }, wait);
    });
  };

  /* ---------- InlineError above the primary (role="alert"), one per form ---------- */
  var MSG = {
    network: 'Can’t reach Vaani Labs. Check your connection.',
    server: 'Something went wrong on our side. Try again in a minute.',
    down: 'Sign-in isn’t working right now. Your data is safe. Try again in a few minutes.'
  };
  A.clearFormError = function (form) {
    var slot = $('[data-formerr]', form); if (!slot || $('[data-offline-line]', slot)) return;
    slot.innerHTML = ''; var p = $('[data-auth-primary]', form);
    if (p && p._rl) { clearInterval(p._rl); p._rl = null; p.removeAttribute('aria-disabled'); p.removeAttribute('aria-describedby'); }
  };
  A.formError = function (form, kind, o) {
    o = o || {}; var slot = $('[data-formerr]', form); if (!slot) return;
    A.clearFormError(form);
    var id = (form.id || U.uid('f')) + '-err', text = o.html || esc(o.text || MSG[kind] || MSG.server), extra = '', primary = $('[data-auth-primary]', form);
    if (kind === 'network' && o.onRetry) extra = ' <button type="button" class="btn btn--link" data-retry>Retry</button>';
    if (kind === 'ratelimit') text = 'Too many attempts. Try again in <span aria-live="off" data-count>30 s</span>.';
    var details = kind === 'server' ? '<details class="details"><summary>Details</summary><div class="raw"><code>error id: req_7f3a91 · 503 upstream timeout · ' + esc(A.nowText()) + ' IST</code></div></details>' : '';
    slot.innerHTML = '<div class="ierr" role="alert" id="' + id + '"><div class="ierr-line">' + V.icon('circle-alert') + '<span>' + text + extra + '</span></div>' + details + '</div>';
    var r = $('[data-retry]', slot); if (r) r.addEventListener('click', function () { A.clearFormError(form); o.onRetry(); });
    if (kind === 'ratelimit' && primary) {
      var left = o.seconds || 30; primary.setAttribute('aria-disabled', 'true'); primary.setAttribute('aria-describedby', id);
      primary._rl = setInterval(function () {
        left -= 1; var c = $('[data-count]', slot); if (c) c.textContent = left + ' s';
        if (left <= 0) A.clearFormError(form);
      }, 1000);
    }
  };

  /* ---------- PasswordInput extras ---------- */
  A.capsLock = function (input) {
    var hint = d.createElement('p'); hint.className = 'auth-caps'; hint.id = input.id + '-caps'; hint.hidden = true;
    hint.innerHTML = V.icon('arrow-big-up', 'sm') + '<span>Caps Lock is on</span>';
    var rules = input.closest('.field').querySelector('.rules');
    if (rules) rules.insertAdjacentElement('beforebegin', hint); else (input.closest('.input')).insertAdjacentElement('afterend', hint);
    var desc = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean); desc.push(hint.id);
    input.setAttribute('aria-describedby', desc.join(' ')); input.removeAttribute('data-desc');
    function upd(e) { if (e.getModifierState) hint.hidden = !e.getModifierState('CapsLock'); }
    input.addEventListener('keydown', upd); input.addEventListener('keyup', upd);
    input.addEventListener('blur', function () { hint.hidden = true; });
  };
  var COMMON = ['password', 'password1', 'password123', '1234567890', '12345678910', 'qwertyuiop', 'iloveyou12', 'vaanilabs', 'vaanilabs1', 'vaanilabs123', 'welcome123', 'admin@1234', 'india@1234', 'abcdefghij', 'passw0rd123'];
  A.RULES = [
    { id: 'len', text: 'At least 10 characters', err: 'Your password needs at least 10 characters.', test: function (v) { return v.length >= 10; } },
    { id: 'common', text: 'Not a commonly used password', err: 'Choose a less common password. This one appears in lists of leaked passwords.', test: function (v) { var l = v.toLowerCase(); return v.length > 0 && COMMON.indexOf(l) < 0 && !/^(.)\1+$/.test(v) && !/^(0?123456789|qwerty)/.test(l); } },
    { id: 'email', text: 'Different from your email', err: 'Use a password that’s different from your email.', test: function (v, email) { var l = v.toLowerCase(), e = String(email || '').toLowerCase(); return v.length > 0 && (!e || (l !== e && l !== e.split('@')[0])); } }
  ];
  A.rulesHtml = function (id) {
    return '<ul class="rules" id="' + id + '">' + A.RULES.map(function (r) { return '<li data-rule="' + r.id + '" data-met="false">' + V.icon('circle', 'sm') + '<span>' + r.text + '</span><span class="sr-only">, not yet</span></li>'; }).join('') + '</ul>';
  };
  /* Live, silent update; returns check(v) giving the first unmet rule’s sentence, and announce() for a failed submit. */
  A.passwordRules = function (input, list, getEmail) {
    function upd() {
      var v = input.value;
      A.RULES.forEach(function (r) {
        var li = $('[data-rule="' + r.id + '"]', list), met = r.test(v, getEmail && getEmail());
        if (li.getAttribute('data-met') === String(met)) return;
        li.setAttribute('data-met', String(met)); li.firstElementChild.outerHTML = V.icon(met ? 'check' : 'circle', 'sm'); li.lastElementChild.textContent = met ? ', met' : ', not yet';
      });
    }
    input.addEventListener('input', upd); upd();
    return {
      update: upd,
      check: function (v) { var e = getEmail && getEmail(); var r = A.RULES.filter(function (x) { return !x.test(v, e); })[0]; return r ? r.err : null; },
      announce: function () { var e = getEmail && getEmail(), un = A.RULES.filter(function (x) { return !x.test(input.value, e); }); if (un.length) V.announce('Password rules not met yet: ' + un.map(function (x) { return x.text; }).join(', ') + '.', { dedupeKey: 'pw-rules-' + Date.now() }); }
    };
  };

  /* ---------- OneTimeCodeInput ---------- */
  /* One field (never six boxes): numeric keyboard, one-time-code autofill, the hint says it checks at 6 digits. */
  A.codeForm = function (id, label, hint, primary, offline) {
    return '<form class="auth-form" id="' + id + '-form" action="' + esc(location.pathname.split('/').pop()) + '" method="post" novalidate><div class="field auth-otp"><label class="field-label" for="' + id + '-code">' + label + '</label>' +
      '<div class="input input--lg"><input id="' + id + '-code" name="code" inputmode="numeric" autocomplete="one-time-code" enterkeyhint="done" spellcheck="false" aria-describedby="' + id + '-code-h" required></div>' +
      '<p class="field-hint" id="' + id + '-code-h">' + hint + '</p><div class="auth-check-line" data-check-line></div></div>' +
      '<div class="auth-actions"><div class="auth-formerr" data-formerr></div><button type="submit" class="btn btn--primary btn--lg btn--full" data-auth-primary data-offline="' + esc(offline || 'You’re offline. Connect to continue.') + '"><span data-label>' + primary + '</span></button></div></form>';
  };
  A.codeCheck = function (v) { return /^\d{6}$/.test(v) ? null : 'Enter all 6 digits of the code.'; };
  A.digits = function (text) {
    var m = String(text || '').match(/\d{3}[\s-]?\d{3}/); if (m) return m[0].replace(/\D/g, '');
    return String(text || '').replace(/\D/g, '').slice(0, 6);
  };
  A.otp = function (input, o) {
    var line = $('[data-check-line]', input.closest('.field')), busy = false;
    function run() {
      if (busy || input.value.length !== 6) return;
      busy = true; A.fieldError(input, null); input.setAttribute('readonly', '');
      var t = setTimeout(function () { if (line) line.innerHTML = '<span class="status status--progress">' + V.icon('loader-circle', 'sm', { className: 'spinner' }) + 'Checking code…</span>'; }, 200);
      V.announce('Checking code…');
      Promise.resolve(o.onComplete(input.value)).then(function (res) {
        clearTimeout(t); busy = false; if (line) line.innerHTML = '';
        if (res && res.done) return;                                   /* navigating away: stay read-only */
        input.removeAttribute('readonly');
        if (res && res.error) { A.fieldError(input, res.error); input.focus(); input.select(); }
      });
    }
    input.addEventListener('paste', function (e) {
      if (o.when && !o.when()) return;
      var text = (e.clipboardData || w.clipboardData).getData('text'); e.preventDefault();
      input.value = A.digits(text); input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('input', function () {
      if (o.when && !o.when()) return;
      var v = input.value.replace(/\D/g, '').slice(0, 6); if (v !== input.value) input.value = v;
      if (v.length === 6) run();
    });
    return { run: run, reset: function () { busy = false; input.removeAttribute('readonly'); input.value = ''; } };
  };

  /* ---------- ResendLink: a link button, aria-disabled for 30 s, "Resend email in 0:24", silent countdown ---------- */
  A.resend = function (btn, status, o) {
    o = o || {}; var left = o.seconds == null ? 30 : o.seconds, t = null;
    function paint() {
      if (left > 0) { btn.setAttribute('aria-disabled', 'true'); btn.textContent = 'Resend email in 0:' + (left < 10 ? '0' : '') + left; }
      else { btn.removeAttribute('aria-disabled'); btn.textContent = 'Resend email'; }
    }
    function start(s) { left = s; clearInterval(t); paint(); t = setInterval(function () { left -= 1; paint(); if (left <= 0) clearInterval(t); }, 1000); }
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-disabled') === 'true') return;
      btn.setAttribute('aria-disabled', 'true'); btn.textContent = 'Sending…';
      A.request(700).then(function (r) {
        if (r === 'network') { status.innerHTML = '<span class="status status--danger">' + V.icon('circle-alert', 'sm') + 'Couldn’t send. Check your connection.</span>'; start(0); return; }
        if (r === 'ratelimit') { status.innerHTML = '<span class="status status--warning">' + V.icon('triangle-alert', 'sm') + 'Too many emails. Try again in a minute.</span>'; start(60); return; }
        status.innerHTML = '<span class="status status--success">' + V.icon('check', 'sm') + 'Sent again at ' + esc(A.nowText()) + '.</span>';
        start(30); if (o.onSent) o.onSent();
      });
    });
    start(left);
    return { enable: function () { start(0); } };
  };
})(window, document, window.Vaani, window.VaaniAuth);
