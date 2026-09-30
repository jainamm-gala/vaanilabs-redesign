/* =====================================================================================================
   Vaani Labs prototype · pages/auth.js — shared behaviour of the auth pages (spec/03-pages/08-public-auth.md
   §3 routes, §4.2 AuthLayout, §4.4 ConsentBar, §8.5 OAuth, §8.7 reasons, §13.2 auth-level failures).
   window.VaaniAuth: URL and storage rules, the claims-sheet subset, the view router (every step has its own URL
   and H1), reason notices, OAuth buttons, the ConsentBar and the "Prototype states" dialog.
   Form behaviour (validation timing, busy buttons, InlineError, PasswordInput, OneTimeCodeInput, ResendLink) is in
   pages/auth-forms.js. Page files: auth-login.js, auth-signup.js, auth-recovery.js.
   Nothing here is a real auth call: VaaniAuth.request() waits and returns the result picked in Prototype states.
   ===================================================================================================== */
(function (w, d, V) {
  'use strict';
  var U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, store = U.store;
  var A = w.VaaniAuth = {};
  var DATA = V.data || {};
  A.user = DATA.user || { name: 'Anika Rao', short: 'Anika R.', initials: 'AR', email: 'anika.rao@samplerealty.example' };
  A.org = DATA.org || { name: 'Sample Realty' };
  var T0 = Date.now();

  /* ---------- Storage. sessionStorage only for what the spec names (the carried email, attribution); never the URL. ---------- */
  var ss = A.ss = {
    get: function (k) { try { return w.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { if (v == null || v === '') w.sessionStorage.removeItem(k); else w.sessionStorage.setItem(k, v); } catch (e) { /* blocked: the value lives for this page only */ } }
  };
  A.email = {
    get: function () { return ss.get('vaani:auth-email') || ''; },
    set: function (v) { ss.set('vaani:auth-email', String(v || '').trim()); },
    clear: function () { ss.set('vaani:auth-email', null); }
  };
  A.qs = function () { return new URLSearchParams(w.location.search); };
  A.nowText = function () { return V.fmt.time(new Date(V.fmt.now().getTime() + (Date.now() - T0))); };
  A.mask = function (email) { var p = String(email || '').split('@'); return p.length < 2 ? email : p[0].charAt(0) + '•••@' + p[1]; };
  A.isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

  /* ---------- Claims sheet (content/claims.ts, §3.3): the values the auth pages read. Placeholders the owner confirms. ---------- */
  A.claims = {
    auth: { providers: ['google', 'facebook'] },
    expiry: { link: 15, reset: 60, verify: 30, invite: 7 },
    access: { reviewTime: null },          // "within one working day" only once it is the real SLA (§19 Q1)
    contact: { sales: 'sales@vaanilabs.in', support: 'support@vaanilabs.in' },
    status: { live: false },
    facts: [['wallet', 'Prepaid in rupees, per-second rates.', true], ['map-pin', 'Data stored in India (AWS Mumbai)', false]]
  };
  A.PROVIDERS = { google: { name: 'Google', mark: '#auth-b-google' }, facebook: { name: 'Facebook', mark: '#auth-b-facebook' } };
  A.provider = function () { var p = A.qs().get('provider') || A.qs().get('via'); return A.PROVIDERS[p] ? p : 'google'; };

  /* Access mode (PA3): one flag; ?access=approval|self-serve sets it for this tab. */
  A.access = function () {
    var q = A.qs().get('access'); if (q === 'approval' || q === 'self-serve') ss.set('vaani:auth:access', q);
    return ss.get('vaani:auth:access') === 'approval' ? 'approval' : 'self-serve';
  };
  /* Prototype session: ?session=1 means a signed-in visitor (SignedInPanel, PA10). */
  A.signedIn = function () { return A.qs().get('session') === '1'; };

  /* next: a same-origin app route only (here: a prototype page). Anything else is dropped silently (no open redirect). */
  var NEXT_OK = /^(index|cockpit|assistant|agents|flow-designer|knowledge|leads|call-reports|analytics|billing|settings|rep-console|signup)\.html(\?[A-Za-z0-9_=&%.\-]*)?$/;
  A.next = function () { var n = A.qs().get('next'); return n && NEXT_OK.test(n) ? n : null; };
  A.landing = function () { return A.next() || 'index.html'; };
  A.url = function (base, extra) {
    var p = new URLSearchParams(), n = A.next(), i = base.indexOf('?'), file = i < 0 ? base : base.slice(0, i);
    if (i >= 0) new URLSearchParams(base.slice(i + 1)).forEach(function (v, k) { p.set(k, v); });
    Object.keys(extra || {}).forEach(function (k) { if (extra[k] != null) p.set(k, extra[k]); });
    if (n && !p.has('next')) p.set('next', n);
    var s = p.toString(); return file + (s ? '?' + s : '');
  };
  A.go = function (href, replace) { if (replace) w.location.replace(href); else w.location.href = href; };

  /* UTM and referrer: captured once into sessionStorage, sent with the sign-up request, then dropped from the URL. */
  (function attribution() {
    var q = A.qs(), keys = [], o = {};
    q.forEach(function (v, k) { if (/^utm_/.test(k)) { keys.push(k); o[k] = v.slice(0, 80); } });
    if (!keys.length) return;
    if (!ss.get('vaani:attribution')) ss.set('vaani:attribution', JSON.stringify(o));
    keys.forEach(function (k) { q.delete(k); });
    var s = q.toString(); history.replaceState(history.state, '', w.location.pathname + (s ? '?' + s : '') + w.location.hash);
  })();

  /* ---------- Prototype results: what the next submit, code check or provider returns ---------- */
  A.RESULTS = {
    success: 'Success', twofactor: 'Two-factor is on', wrong: 'Wrong email or password, or a wrong code', expired: 'The code or link has expired',
    ratelimit: 'Too many attempts (429)', unverified: 'Email not confirmed', pending: 'Pending approval', disabled: 'Account turned off',
    network: 'Network failure or timeout', server: 'Server error (5xx)', down: 'Sign-in service down',
    'oauth-new': 'Provider: no account yet', 'oauth-unlinked': 'Provider: address has a password account', 'oauth-cancelled': 'Provider: cancelled',
    'oauth-failed': 'Provider: error', taken: 'Workspace address taken'
  };
  A.result = function () { var r = ss.get('vaani:auth:result'); return A.RESULTS[r] ? r : 'success'; };
  A.setResult = function (r) { ss.set('vaani:auth:result', r === 'success' ? null : r); syncProtoLabel(); };
  A.offline = function () { return ss.get('vaani:auth:offline') === '1' || w.navigator.onLine === false; };
  A.request = function (ms) {
    return new Promise(function (res) { setTimeout(function () { res(A.offline() ? 'network' : A.result()); }, ms || 900); });
  };

  /* ---------- Views: every step is its own URL with its own H1 and <title> (§12.2 rule 1) ---------- */
  var views = {}, current = null;
  A.page = function () { return $('.auth-page'); };
  A.root = function () { return $('[data-view-root]'); };
  A.view = function (name, def) { views[name] = def; };
  A.current = function () { return current; };
  A.show = function (name, o) {
    o = o || {}; var def = views[name], root = A.root(); if (!def || !root) return;
    if (o.url) history[o.replace ? 'replaceState' : 'pushState']({ auth: name }, '', o.url);
    current = name;
    A.page().setAttribute('data-layout', def.layout || 'single');
    root.className = 'auth-panel' + (def.panelClass ? ' ' + def.panelClass : '');
    root.innerHTML = typeof def.html === 'function' ? def.html(o.ctx || {}) : def.html;
    V.initAll(root);
    d.title = (typeof def.title === 'function' ? def.title() : def.title) + ' · Vaani Labs';
    if (def.bind) def.bind(root, o.ctx || {});
    A.syncOffline();
    if (o.focus === 'h1') A.focusH1(); else if (o.initial) A.autofocus(root);
    markProtoCurrent();
  };
  A.focusH1 = function () { var h = $('h1', A.root()); if (!h) return; h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus({ preventScroll: false }); };
  /* Autofocus only on fine pointers at ≥ 1024 with no reason Notice, so phones never pop the keyboard (§4.2). */
  A.autofocus = function (root) {
    if (!w.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return;
    if ($('.auth-notice-slot .notice', root)) return;
    var f = $$('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([readonly])', root).filter(function (i) { return !i.value; })[0];
    if (f) f.focus();
  };
  w.addEventListener('popstate', function () { if (A.route) A.route({ popstate: true }); });

  /* ---------- Notices: reason on arrival is role=status under the H1; failures are role=alert ---------- */
  var TONE_ICON = { info: 'info', neutral: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert' };
  A.notice = function (tone, title, body, o) {
    o = o || {};
    return '<div class="notice notice--' + tone + ' notice--multi" role="' + (o.role || 'status') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '>' + V.icon(TONE_ICON[tone] || 'info') +
      '<div class="notice-body"><span class="notice-title">' + esc(title) + '</span>' + (body ? ' ' + body : '') + '</div></div>';
  };
  A.reasonNotice = function (reason) {
    var P = A.PROVIDERS[A.provider()].name, q = A.qs();
    var R = {
      expired: ['info', 'Your session expired.', 'Sign in again to go back to where you were.'],
      'signed-out': ['neutral', 'You’re signed out.', ''],
      'password-changed': ['success', 'Password changed.', 'Sign in with your new password.' + (q.get('others') === '1' ? ' Other devices were signed out.' : '')],
      'link-expired': ['warning', 'That sign-in link has expired.', 'Links work for ' + A.claims.expiry.link + ' minutes. Send a new one below.'],
      'link-used': ['warning', 'That sign-in link was already used.', 'Send a new one below.'],
      'oauth-cancelled': ['neutral', P + ' sign-in was cancelled.', 'Choose another way to sign in.'],
      'oauth-failed': ['danger', 'Couldn’t sign in with ' + P + '.', 'Try again, or use your email.'],
      'oauth-link': ['info', 'An account for ' + A.mask(A.user.email) + ' already exists.', 'Sign in with your password once to connect ' + P + '.'],
      approved: ['success', 'Your access is approved.', 'Sign in to create your workspace.'],
      verified: ['success', 'Email confirmed.', 'Sign in to continue.']
    }[reason];
    return R ? A.notice(R[0], R[1], esc(R[2])) : '';
  };
  /* Cookies blocked (§13.2): a warning under the H1 on every auth route. */
  A.cookieNotice = function () {
    return A.qs().get('cookies') === 'blocked' ? A.notice('warning', 'Your browser is blocking the cookies Vaani Labs needs to keep you signed in.', 'Allow cookies for vaanilabs.in and try again.') : '';
  };

  /* ---------- OAuthButtons (§18): links, secondary lg full width, 16 px brand mark, "Last used" from localStorage ---------- */
  A.lastMethod = function () { return store.get('vaani:last-auth-method') || ''; };
  A.setLastMethod = function (m) { store.set('vaani:last-auth-method', m); };
  A.oauthButtons = function (intent, o) {
    o = o || {}; var last = intent === 'login' ? A.lastMethod() : '';
    return '<div class="auth-oauth" role="group" aria-label="' + (intent === 'login' ? 'Sign in with' : 'Continue with') + ' another account">' + A.claims.auth.providers.map(function (p) {
      var P = A.PROVIDERS[p], href = A.url((o.file || (intent === 'login' ? 'login.html' : 'signup.html')) + '?step=signing-in', { via: p, intent: intent, invite: o.invite || null });
      return '<a class="btn btn--lg btn--full has-lead" href="' + esc(href) + '" data-oauth-provider="' + p + '"><svg class="auth-brand" aria-hidden="true" focusable="false"><use href="' + P.mark + '"/></svg>' +
        '<span data-label>Continue with ' + P.name + '</span>' + (last === p ? '<span class="tag tag--outline">Last used</span>' : '') + '</a>';
    }).join('') + '</div>';
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-oauth-provider]'); if (!a) return;
    e.preventDefault();
    if (a.getAttribute('aria-disabled') === 'true' || a.getAttribute('aria-busy') === 'true') return;
    var P = A.PROVIDERS[a.getAttribute('data-oauth-provider')];
    if (A.offline()) { V.toast.error('You’re offline. Connect to continue with ' + P.name + '.'); return; }
    A.busy(a, 'Opening ' + P.name + '…');
    $$('[data-oauth-provider]').forEach(function (o) { if (o !== a) { o.setAttribute('aria-disabled', 'true'); o.setAttribute('data-tooltip', 'Waiting for ' + P.name); } });
    setTimeout(function () { w.location.href = a.getAttribute('href'); }, 1100);
  });
  /* Pages the prototype does not include (the public site, legal pages): say so instead of a dead link. */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-offsite]'); if (!a) return;
    e.preventDefault(); V.toast.info(a.getAttribute('data-offsite') + ' is on the public website, which this prototype doesn’t include.');
  });

  /* ---------- Offline (§4.1 states, §8.7): the primary is aria-disabled with the reason beside it ---------- */
  A.syncOffline = function () {
    var off = A.offline();
    $$('[data-auth-primary]').forEach(function (b) {
      var form = b.closest('form') || b.parentNode, slot = $('[data-formerr]', form), line = slot && $('[data-offline-line]', slot);
      if (off) {
        if (!slot) return;
        if (!line) { slot.innerHTML = '<p class="status status--warning" data-offline-line id="' + U.uid('off') + '">' + V.icon('cloud-off', 'sm') + '<span>' + esc(b.getAttribute('data-offline') || 'You’re offline. Connect to continue.') + '</span></p>'; line = $('[data-offline-line]', slot); }
        b.setAttribute('aria-disabled', 'true'); b.setAttribute('aria-describedby', line.id);
      } else if (line) { slot.innerHTML = ''; b.removeAttribute('aria-disabled'); b.removeAttribute('aria-describedby'); }
    });
  };
  w.addEventListener('online', function () { A.syncOffline(); });
  w.addEventListener('offline', function () { A.syncOffline(); });

  /* ---------- ConsentBar (§4.4): first visit only, never with DNT/GPC, never takes focus, Allow = Decline in weight ---------- */
  /* It overlays the page (no push at the top, CLS §7), so while it shows, the page reserves its footprint at the bottom:
     --consent-h (on :root) is the distance from the bar’s top edge to the viewport’s bottom edge (its height plus its
     bottom offset: --page-margin at ≥ 768, the safe area on phones). auth.css turns it into
     .auth-body.has-consent .auth-page { padding-bottom } — so the last content and the Legal links can always scroll above the
     bar — and into html { scroll-padding-bottom }, so a focused element never lands under it (WCAG 2.4.11).
     Both go away the moment the visitor chooses. A hidden bar (while "Prototype states" is open) keeps the last value. */
  var consentBar = null, consentRO = null;
  function consentPad() {
    var bar = consentBar, root = d.documentElement;
    if (!bar || !bar.isConnected) {
      d.body.classList.remove('has-consent'); root.style.removeProperty('--consent-h');
      if (consentRO) { consentRO.disconnect(); consentRO = null; }
      consentBar = null; return;
    }
    if (bar.hidden) return;
    var h = Math.ceil(w.innerHeight - bar.getBoundingClientRect().top);
    if (h > 0) { root.style.setProperty('--consent-h', h + 'px'); d.body.classList.add('has-consent'); }
  }
  w.addEventListener('resize', consentPad);
  A.consent = function (force) {
    var bar = $('.auth-consent'); if (bar) bar.remove();
    consentPad();
    if (!force && store.get('vaani:auth:consent')) return;
    var nav = w.navigator; if (!force && (nav.doNotTrack === '1' || w.doNotTrack === '1' || nav.globalPrivacyControl === true)) return;
    bar = U.h('<div class="auth-consent" role="region" aria-label="Analytics choice"><p class="auth-consent-title">Allow analytics?</p>' +
      '<p class="auth-consent-text">We use one analytics tool to see which pages help. It stays off unless you allow it. <a href="#" data-offsite="The cookie policy">Cookie policy</a></p>' +
      '<div class="auth-consent-acts"><button type="button" class="btn" data-consent="allow">Allow</button><button type="button" class="btn" data-consent="decline">Decline</button></div></div>');
    var page = A.page(); page.parentNode.insertBefore(bar, page.nextSibling);
    consentBar = bar; consentPad();
    /* The bar’s height changes with the web fonts, the viewport width and when it is shown again. */
    if (w.ResizeObserver) { consentRO = new w.ResizeObserver(consentPad); consentRO.observe(bar); }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]'); if (!b) return;
      var had = bar.contains(d.activeElement);
      store.set('vaani:auth:consent', b.getAttribute('data-consent')); bar.remove(); consentPad();
      if (had) { var m = $('main'); m.focus({ preventScroll: true }); }
    });
  };

  /* ---------- Prototype states (not part of the design) ---------- */
  var protoCfg = null;
  function syncProtoLabel() {
    var t = $('[data-proto-result]'); if (!t) return; var r = A.result();
    t.textContent = r === 'success' && !A.offline() ? '' : 'Next result: ' + (A.offline() ? 'offline' : A.RESULTS[r]);
  }
  function markProtoCurrent() {
    var here = w.location.pathname.split('/').pop() + w.location.search;
    $$('#auth-proto a[data-proto-link]').forEach(function (a) { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  A.proto = function (cfg) {
    protoCfg = cfg;
    var aside = $('.auth-proto'); if (!aside) return;
    aside.innerHTML = '<button type="button" class="btn btn--sm btn--tertiary proto-btn" data-proto-open aria-haspopup="dialog"><i data-icon="sliders-horizontal"></i>Prototype states</button><span data-proto-result></span>';
    V.initAll(aside);
    var secs = cfg.sections.map(function (s) {
      return '<section class="auth-proto-sec" aria-labelledby="' + s.id + '"><h3 class="auth-proto-h" id="' + s.id + '">' + esc(s.title) + '</h3><ul class="auth-proto-list">' +
        s.links.map(function (l) {
          return '<li><a class="auth-link" data-proto-link href="' + esc(l[1]) + '"' + (l[3] ? ' target="_blank"' : '') + '>' + esc(l[0]) + (l[3] ? ' ' + V.icon('external-link', 'xs') + '<span class="sr-only">(opens in a new tab)</span>' : '') + '</a>' +
            (l[2] ? ' <span class="auth-hint">' + esc(l[2]) + '</span>' : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('');
    var radios = '<fieldset class="auth-proto-radios"><legend>Next submit, code check or provider returns</legend>' + cfg.results.map(function (r) {
      return '<label class="check check--dense"><input type="radio" class="radio" name="auth-proto-result" value="' + r + '"' + (A.result() === r ? ' checked' : '') + '><span class="check-text">' + esc(A.RESULTS[r]) + '</span></label>';
    }).join('') + '</fieldset>';
    var themeNow = V.theme ? V.theme.get() : 'system';
    var env = '<section class="auth-proto-sec" aria-labelledby="ap-env"><h3 class="auth-proto-h" id="ap-env">Environment</h3>' +
      '<label class="check check--dense"><input type="checkbox" class="cb" data-proto-offline' + (ss.get('vaani:auth:offline') === '1' ? ' checked' : '') + '><span class="check-text">Simulate offline</span></label>' +
      '<ul class="auth-proto-list"><li><button type="button" class="auth-link" data-proto-consent>Show the analytics bar again</button></li><li><button type="button" class="auth-link" data-proto-reset>Forget the carried email and last-used method</button></li></ul></section>' +
      '<section class="auth-proto-sec" aria-labelledby="ap-theme"><h3 class="auth-proto-h" id="ap-theme">Theme (auth pages follow the stored choice)</h3><div class="seg seg--sm" role="radiogroup" aria-labelledby="ap-theme" data-proto-theme>' +
      ['system', 'light', 'dark'].map(function (t) { return '<button type="button" role="radio" aria-checked="' + (themeNow === t) + '" data-value="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>'; }).join('') + '</div></section>';
    var dlg = U.h('<div class="dlg dlg--lg" id="auth-proto" role="dialog" aria-modal="true" aria-labelledby="auth-proto-t" aria-describedby="auth-proto-d" hidden>' +
      '<div class="dlg-head"><h2 class="dlg-title" id="auth-proto-t">Prototype states</h2><p class="dlg-desc" id="auth-proto-d">Prototype only, not part of the design. Links open this page the way that route or state would render. The result you pick applies to every submit until you change it.</p>' +
      '<button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close"><i data-icon="x"></i></button></div>' +
      '<div class="dlg-body"><div class="auth-proto-grid">' + secs + '<div class="auth-proto-sec auth-proto-sec--wide">' + radios + '</div>' + env + '</div></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--primary" data-dialog-close>Done</button></div></div>');
    d.body.appendChild(dlg); V.initAll(dlg);
    dlg.addEventListener('change', function (e) {
      if (e.target.name === 'auth-proto-result') A.setResult(e.target.value);
      if (e.target.hasAttribute('data-proto-offline')) { ss.set('vaani:auth:offline', e.target.checked ? '1' : null); A.syncOffline(); syncProtoLabel(); }
    });
    dlg.addEventListener('vaani:change', function (e) { if (e.target.closest('[data-proto-theme]') && V.theme) V.theme.set(e.detail.value); });
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-proto-consent]')) { store.set('vaani:auth:consent', ''); try { w.localStorage.removeItem('vaani:auth:consent'); } catch (x) { /* ignore */ } A.consent(true); var cb = $('.auth-consent'); if (cb) cb.hidden = true; V.toast.info('The analytics bar shows again when you close this dialog.'); }
      if (e.target.closest('[data-proto-reset]')) { A.email.clear(); try { w.localStorage.removeItem('vaani:last-auth-method'); } catch (x) { /* ignore */ } V.toast.info('Cleared. Reload to see the page without them.'); }
    });
    /* .auth-page carries data-inert-root, so the shell makes it inert behind any modal; the ConsentBar steps aside meanwhile. */
    dlg.addEventListener('vaani:open', function () { var c = $('.auth-consent'); if (c) c.hidden = true; });
    dlg.addEventListener('vaani:close', function () { var c = $('.auth-consent'); if (c) c.hidden = false; });
    $('[data-proto-open]', aside).addEventListener('click', function (e) { markProtoCurrent(); V.dialog.open('auth-proto', { returnTo: e.currentTarget }); });
    syncProtoLabel(); markProtoCurrent();
  };

  /* ---------- Boot shared parts ---------- */
  /* <meta name="theme-color"> follows --bg (§4.3); a theme change sends no request. */
  function themeColor() { var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', w.getComputedStyle(d.body).backgroundColor); }
  A.boot = function (cfg) {
    themeColor(); V.on('theme', function () { setTimeout(themeColor, 0); });
    A.route = cfg.route;
    if (cfg.proto) A.proto(cfg.proto);
    A.route({ initial: true });
    A.consent();
  };
})(window, document, window.Vaani);
