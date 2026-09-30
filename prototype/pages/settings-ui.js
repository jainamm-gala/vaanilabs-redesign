/* Vaani Labs prototype · pages/settings-ui.js — Settings UI helpers (03-pages/06 §5, §14): ConfirmDialog with custom
   labels and typed confirmation, ReauthDialog "Confirm it’s you" (10-minute window), OneTimeSecret, CodeBlock (shown text ===
   copied text), ServiceMark, Field markup, validators (C §8.2 copy), clipboard. Local versions of components the shared
   layer does not have yet; each is listed in the hand-in’s shared requests. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$;
  var ui = S.ui = {};

  /* ---------- Clipboard: navigator.clipboard, then a textarea fallback (file:// has no secure context in some browsers) ---------- */
  ui.copy = function (text, o) {
    o = o || {};
    function done(ok) {
      if (o.btn) { var lab = $('[data-copy-label]', o.btn) || o.btn, was = lab.textContent; if (!o.btn._was) o.btn._was = was; lab.textContent = ok ? 'Copied' : 'Couldn’t copy'; clearTimeout(o.btn._t); o.btn._t = setTimeout(function () { lab.textContent = o.btn._was; o.btn._was = null; }, 2000); }
      if (ok && o.toast) V.toast.success(o.toast); else V.announce(ok ? 'Copied' : 'Couldn’t copy. Select the text and copy it.');
      if (o.onCopied && ok) o.onCopied();
    }
    function fallback() { var t = d.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.className = 'sr-only'; d.body.appendChild(t); t.select(); var ok = false; try { ok = d.execCommand('copy'); } catch (e) { ok = false; } t.remove(); done(ok || true); }
    try { if (navigator.clipboard && w.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback(); } catch (e) { fallback(); }
  };

  /* ---------- Generated dialog ---------- */
  ui.open = function (html, o) {
    o = o || {}; var el = U.h(html);
    var entry = V.dialog.open(el, { generated: true, returnTo: o.returnTo, tone: o.tone, onClose: o.onClose });
    V.initAll(el);
    /* Delegated: the shell’s inline discard state re-renders the footer, so footer buttons are never bound directly. */
    function on(sel, fn) { el.addEventListener('click', function (e) { var t = e.target.closest(sel); if (t && el.contains(t)) fn(t, e); }); }
    return { el: el, entry: entry, on: on, close: function (r) { entry.close(r || 'done'); } };
  };
  ui.head = function (id, title, desc) { return '<div class="dlg-head"><h2 class="dlg-title" id="' + id + '-t">' + esc(title) + '</h2>' + (desc ? '<p class="dlg-desc" id="' + id + '-d">' + desc + '</p>' : '') + '<button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + S.icon('x') + '</button></div>'; };
  ui.busy = function (btn, label) { if (!btn) return; btn._label = btn.innerHTML; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = S.icon('loader-circle', 'sm', { className: 'spinner' }) + esc(label); };
  ui.unbusy = function (btn) { if (!btn || btn._label == null) return; btn.removeAttribute('aria-busy'); btn.innerHTML = btn._label; btn._label = null; };
  ui.wait = function (ms) { return new Promise(function (r) { setTimeout(r, S.demo('slow') ? ms * 4 : ms); }); };

  /* ---------- ConfirmDialog (O §3): the shared Vaani.dialog.confirm (tier 2 plain, tier 3 typed); this maps the page’s option names ---------- */
  ui.confirm = function (o) {
    var t = o.typed;
    return V.dialog.confirm({ title: o.title, body: o.body, bodyHtml: o.bodyHtml, bodyClass: 'settings-dlg-copy', impact: o.impact, confirmLabel: o.confirmLabel, cancelLabel: o.cancelLabel, tone: o.tone, focusCancel: o.focusCancel, returnTo: o.returnTo,
      typedConfirm: t ? { value: t.value, label: t.label || ('Type ' + t.value + ' to confirm'), hint: t.hint || 'Type it exactly to confirm.', numeric: t.numeric, inputClass: t.short ? 'settings-typed-short' : null } : null });
  };

  /* ---------- "Confirm it’s you" (§5.3): code (2FA on) or password; remembered for 10 minutes (ST9) ---------- */
  ui.reauth = function (phrase, o) {
    o = o || {};
    if (S.st.reauthAt && Date.now() - S.st.reauthAt < 10 * 60 * 1000) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var el = d.getElementById('st-reauth'), code = S.st.security.twoFactor, recovery = false, ok = false;
      function draw() {
        el.innerHTML = '<div class="dlg-head"><h2 class="dlg-title" id="st-reauth-t">Confirm it’s you</h2><button type="button" class="ibtn dlg-close" data-dialog-close aria-label="Close">' + S.icon('x') + '</button></div>' +
          '<div class="dlg-body"><p id="st-reauth-d">' + (code ? (recovery ? 'Enter one of your recovery codes to ' : 'Enter the 6-digit code from your authenticator app to ') : 'Enter your password to ') + esc(phrase) + '.</p>' +
          '<div class="field' + (code && !recovery ? ' field--short' : '') + '"><label class="field-label" for="st-reauth-in">' + (code ? (recovery ? 'Recovery code' : 'Authenticator code') : 'Password') + '</label>' +
          '<div class="input"><input id="st-reauth-in" ' + (code ? (recovery ? 'autocomplete="off" spellcheck="false"' : 'inputmode="numeric" autocomplete="one-time-code" maxlength="6"') : 'type="password" autocomplete="current-password"') + ' aria-describedby="st-reauth-h" data-autofocus>' +
          (!code ? '<button type="button" class="input-btn" data-password-toggle aria-controls="st-reauth-in" aria-pressed="false" aria-label="Show password">' + S.icon('eye') + '</button>' : '') + '</div>' +
          '<p class="field-hint" id="st-reauth-h">' + (code ? '<button type="button" class="btn btn--link" data-reauth-swap>' + (recovery ? 'Use the authenticator code' : 'Or use a recovery code') + '</button>' : '<a href="#security/password">Forgot it? Reset it</a>') + '</p></div>' +
          '<p class="settings-proto-note"><span class="tag tag--outline">Prototype only</span> ' + (code ? 'Any 6 digits work; 000000 shows the expired-code error.' : 'Any password works; “wrong” shows the error.') + '</p></div>' +
          '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-reauth-ok>Confirm</button></div>';
        V.initAll(el);
      }
      draw();
      var entry = V.dialog.open(el, { returnTo: o.returnTo, onClose: function () { resolve(ok); } });
      function err(msg) {
        var inp = $('#st-reauth-in', el), f = inp.closest('.field'), e = $('.field-error', f);
        if (!e) { e = U.h('<p class="field-error" id="st-reauth-e">' + S.icon('circle-alert', 'sm') + '<span></span></p>'); inp.closest('.input').after(e); }
        $('span', e).textContent = msg; inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', 'st-reauth-e st-reauth-h'); inp.focus();
      }
      el.onclick = function (e) {
        if (e.target.closest('[data-reauth-swap]')) { recovery = !recovery; draw(); $('#st-reauth-in', el).focus(); return; }
        if (!e.target.closest('[data-reauth-ok]')) return;
        var btn = $('[data-reauth-ok]', el), v = $('#st-reauth-in', el).value.trim();
        if (code && !recovery && !/^\d{6}$/.test(v)) return err('Enter the 6-digit code from your authenticator app.');
        if (code && !recovery && v === '000000') return err('That code has expired. Enter the new one.');
        if (code && recovery && v.length < 8) return err('Recovery codes have 10 characters, like 7F3K-92QD-4M.');
        if (!code && !v) return err('Enter your password.');
        if (!code && v.toLowerCase() === 'wrong') return err('That password isn’t right. Try again or reset it.');
        ui.busy(btn, 'Confirming…'); V.dialog.setBusy(el, true);
        ui.wait(500).then(function () { V.dialog.setBusy(el, false); ui.unbusy(btn); ok = true; S.st.reauthAt = Date.now(); entry.close('confirm'); });
      };
      el.onkeydown = function (e) { if (e.key === 'Enter' && e.target.id === 'st-reauth-in') { e.preventDefault(); $('[data-reauth-ok]', el).click(); } };
    });
  };

  /* ---------- OneTimeSecret (§14): shown once; closing before Copy asks first (O §2.5) ---------- */
  ui.secret = function (o) {
    return new Promise(function (resolve) {
      var id = U.uid('ots');
      var dl = ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" aria-describedby="' + id + '-b" data-dirty="true" data-discard="Close without copying? You won’t see this ' + esc(o.noun || 'key') + ' again." data-keep-label="Keep open" data-discard-label="Close">' +
        ui.head(id, o.title) + '<div class="dlg-body"><p id="' + id + '-b">' + esc(o.body) + '</p>' +
        '<div class="field"><label class="field-label" for="' + id + '-v">' + esc(o.label) + '</label><div class="input input--mono input--readonly"><input id="' + id + '-v" readonly value="' + esc(o.secret) + '" spellcheck="false" translate="no">' +
        '<button type="button" class="input-btn" data-ots-copy aria-label="Copy ' + esc(o.label.toLowerCase()) + '">' + S.icon('copy') + '</button></div><p class="field-hint" data-ots-hint>Not copied yet.</p></div>' +
        S.notice('info', esc(o.notice || 'Keep it on your server. Never put it in a web page or app.')) + '</div>' +
        '<div class="dlg-foot"><button type="button" class="btn btn--primary" data-ots-done>Done</button></div></div>', { returnTo: o.returnTo, onClose: function () { resolve(); } });
      dl.on('[data-ots-copy]', function () { ui.copy(o.secret, { onCopied: function () { dl.el.removeAttribute('data-dirty'); $('[data-ots-hint]', dl.el).innerHTML = S.icon('check', 'sm') + ' Copied. You can close this now.'; $('[data-ots-hint]', dl.el).className = 'field-hint field-hint--ok'; } }); });
      $('#' + id + '-v', dl.el).addEventListener('focus', function (e) { e.target.select(); });
      dl.on('[data-ots-done]', function () { V.dialog.close(dl.el, 'x'); });
    });
  };

  /* ---------- CodeBlock (§14): rendered and copied from one raw string; textContent === code ---------- */
  ui.codes = {};
  ui.code = function (code, o) {
    o = o || {}; var id = o.id || U.uid('code'); ui.codes[id] = code;
    return '<div class="settings-code" data-code-block="' + id + '"><div class="settings-code-head"><span class="settings-code-label" id="' + id + '-l">' + esc(o.label || 'Code') + '</span>' +
      '<button type="button" class="btn btn--tertiary btn--sm" data-act="copy-code" data-code="' + id + '" aria-label="Copy ' + esc((o.label || 'code').toLowerCase()) + '">' + S.icon('copy', 'sm') + '<span data-copy-label>Copy</span></button></div>' +
      '<pre class="codeblock settings-code-pre" role="region" aria-labelledby="' + id + '-l" tabindex="0"><code class="settings-code-text' + (o.wrap ? ' settings-code-text--wrap' : '') + '" translate="no">' + esc(code) + '</code></pre></div>';
  };
  ui.setCode = function (id, code) { ui.codes[id] = code; var b = $('[data-code-block="' + id + '"] code'); if (b) b.textContent = code; };
  S.act('copy-code', function (b) { ui.copy(ui.codes[b.getAttribute('data-code')], { btn: b }); });

  /* ---------- ServiceMark (§14): the vendor’s single-colour glyph in currentColor on a neutral tile, or the Lucide fallback ---------- */
  var MARKS = {
    google: '<path d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z"/><path d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/>',
    microsoft: '<rect x="1" y="1" width="10.5" height="10.5"/><rect x="12.5" y="1" width="10.5" height="10.5"/><rect x="1" y="12.5" width="10.5" height="10.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5"/>',
    instagram: '<path fill-rule="evenodd" d="M7.2 1.5h9.6a5.7 5.7 0 0 1 5.7 5.7v9.6a5.7 5.7 0 0 1-5.7 5.7H7.2a5.7 5.7 0 0 1-5.7-5.7V7.2a5.7 5.7 0 0 1 5.7-5.7zm0 2.1a3.6 3.6 0 0 0-3.6 3.6v9.6a3.6 3.6 0 0 0 3.6 3.6h9.6a3.6 3.6 0 0 0 3.6-3.6V7.2a3.6 3.6 0 0 0-3.6-3.6zM12 6.7a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 2.1a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z"/><circle cx="17.6" cy="6.4" r="1.3"/>',
    facebook: '<path fill-rule="evenodd" d="M.5 12a11.5 11.5 0 1 0 23 0 11.5 11.5 0 1 0-23 0zM16.6 15.5l.5-3.4h-3.3V9.9c0-.9.5-1.9 2-1.9h1.5V5.2s-1.4-.2-2.7-.2c-2.7 0-4.5 1.6-4.5 4.6v2.5H7.1v3.4h3v7.9h3.7v-7.9z"/>'
  };
  ui.mark = function (m, size) {
    var g = MARKS[m] ? '<svg class="settings-bm" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + MARKS[m] + '</svg>' : S.icon(m);
    return '<span class="settings-svc' + (size === 'sm' ? ' settings-svc--sm' : '') + '" aria-hidden="true">' + g + '</span>';
  };

  /* ---------- Fields (C §3): label above, hint below, error wired through aria-describedby ---------- */
  ui.field = function (o) {
    var id = o.id || 'f-' + o.name, hid = o.hint ? id + '-h' : '';
    var attrs = (o.type ? ' type="' + o.type + '"' : '') + (o.attrs || '') + (hid ? ' aria-describedby="' + hid + '"' : '') + (o.readonly ? ' readonly' : '');
    var control = o.textarea ? '<textarea class="textarea" id="' + id + '" name="' + o.name + '"' + attrs + '>' + esc(o.value || '') + '</textarea>'
      : '<div class="input' + (o.mono ? ' input--mono' : '') + (o.readonly ? ' input--readonly' : '') + '">' + (o.prefix ? '<span class="input-prefix">' + esc(o.prefix) + '</span>' : '') +
        '<input id="' + id + '" name="' + o.name + '" value="' + esc(o.value || '') + '"' + attrs + '>' + (o.suffix ? '<span class="input-suffix">' + esc(o.suffix) + '</span>' : '') + (o.after || '') + '</div>';
    return '<div class="field' + (o.width ? ' field--' + o.width : '') + (o.cls ? ' ' + o.cls : '') + '" data-field="' + o.name + '"><label class="field-label" for="' + id + '">' + esc(o.label) + (o.optional ? ' <span class="field-opt">(optional)</span>' : '') + '</label>' +
      control + (o.hint ? '<p class="field-hint" id="' + hid + '"' + (o.hintLive ? ' aria-live="polite"' : '') + '>' + o.hint + '</p>' : '') + (o.extra || '') + '</div>';
  };
  ui.setError = function (input, msg) {
    if (!input) return; var f = input.closest('.field, [data-field]') || input.parentNode, eid = (input.id || input.name) + '-e', e = d.getElementById(eid);
    var desc = (input.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== eid; });
    if (!msg) { if (e) e.remove(); input.removeAttribute('aria-invalid'); if (desc.length) input.setAttribute('aria-describedby', desc.join(' ')); else input.removeAttribute('aria-describedby'); return; }
    if (!e) { e = U.h('<p class="field-error" id="' + eid + '">' + S.icon('circle-alert', 'sm') + '<span></span></p>'); var box = input.closest('.input') || input; (box.parentNode === f ? box : f.lastElementChild).after(e); }
    $('span', e).textContent = msg; input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', [eid].concat(desc).join(' '));
  };

  /* ---------- Validators (C §8.2 copy) ---------- */
  function digits(v) { return String(v || '').replace(/[\s()-]/g, ''); }
  S.valid = {
    name: function (v) { v = String(v || '').trim(); return !v ? 'Enter your name.' : v.length < 2 ? 'Use at least 2 characters.' : v.length > 60 ? 'Use 60 characters or fewer.' : ''; },
    mobile: function (v) {
      var s = digits(v).replace(/^\+91/, ''); if (!s) return '';
      if (/\D/.test(s)) return 'Enter a 10-digit mobile number, like 98765 43210.';
      if (s.length !== 10) return 'This number has ' + s.length + ' digit' + (s.length === 1 ? '' : 's') + '. Mobile numbers have 10.';
      return /^[6-9]/.test(s) ? '' : 'Mobile numbers start with 6, 7, 8 or 9.';
    },
    anyPhone: function (v, intl) {
      var s = digits(v); if (!s) return 'Enter a phone number.';
      if (intl && /^\+(?!91)\d{7,14}$/.test(s)) return '';
      s = s.replace(/^\+91/, '').replace(/^0/, '');
      return /^\d{10}$/.test(s) ? '' : 'Enter a phone number with its STD code, like 80 4567 2210.';
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()) ? '' : 'Enter an email address, like name@company.com.'; },
    https: function (v) { try { var u = new URL(String(v || '').trim()); return u.protocol === 'https:' && u.hostname.indexOf('.') > 0 ? '' : 'Enter a full URL starting with https://.'; } catch (e) { return 'Enter a full URL starting with https://.'; } }
  };
})(window, document);
