/* Vaani Labs prototype · pages/settings-keys.js — API keys (§7.8) and Embed (§7.10).
   Create key… passes "Confirm it’s you", chooses scopes (none preselected, least access) and a rate limit, and shows the
   key once in a OneTimeSecret. The table never shows more than the prefix and last 4. Embed renders and copies one raw string. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st, SD = S.SD;
  var NOW = S.DATA.meta.now;
  function key(id) { return st.keys.filter(function (k) { return k.id === id; })[0]; }
  function scopeLabel(id) { return (SD.scopes.filter(function (s) { return s.id === id; })[0] || { label: id }).label; }
  function masked(k) { return 'vv_live_•••• ' + k.last4; }
  function rnd(n) { var a = 'abcdefghijkmnopqrstuvwxyz23456789', r = S.DATA._util.rng(Date.now() % 100000), s = ''; for (var i = 0; i < n; i++) s += a[Math.floor(r() * a.length)]; return s; }
  S.act('ext-docs', function () { V.toast.info('The API reference opens outside this prototype.'); });

  /* =================================== API keys =================================== */
  /* Record-table columns as [label, header class] (settings.css "Record tables"): key pinned left, ⋯ pinned right; settings-p2/p3/p4
     = column priority (N §7.5). Name, Key, Scopes and Last used are P1 (what exists, what is used: §7.8 hierarchy, and the
     phone ListRow); Rate limit P2; Created P3. S.thead and S.tableSkeleton (settings-records.js) read the same list. */
  S.thead = function (cols) { return '<thead><tr>' + cols.map(function (c) { return '<th scope="col"' + (c[1] ? ' class="' + c[1] + '"' : '') + '>' + (c[0] ? esc(c[0]) : '<span class="sr-only">Actions</span>') + '</th>'; }).join('') + '</tr></thead>'; };
  var COLS = S.keyCols = [['Name', 'sticky-l'], ['Key', ''], ['Scopes', ''], ['Rate limit', 'c-num settings-p2'], ['Last used', ''], ['Created', 'settings-p3'], ['', 'c-act sticky-r']];
  function scopesCell(k) {
    var more = k.scopes.length - 1, all = k.scopes.map(scopeLabel).join(', ');
    return '<span class="tag">' + esc(scopeLabel(k.scopes[0])) + '</span>' + (more > 0 ? ' <button type="button" class="count-badge settings-badge-btn" data-tooltip="' + esc(all) + '" aria-label="' + more + ' more scope' + (more === 1 ? '' : 's') + ': ' + esc(k.scopes.slice(1).map(scopeLabel).join(', ')) + '">+' + more + '</button>' : '');
  }
  function more(k) { return k.revoked ? '' : '<button type="button" class="ibtn" aria-haspopup="menu" aria-controls="key-menu" aria-expanded="false" data-key="' + k.id + '" aria-label="More actions for ' + esc(k.name) + '">' + S.icon('ellipsis') + '</button>'; }
  function keysBody() {
    if (S.demo('section-error')) return S.sectionError('API keys');
    if (!st.keys.length) return '<div class="empty empty--page settings-empty">' + S.icon('key-round', 'lg') + '<h2 class="empty-title">No API keys yet</h2><p>Create a key to call the Vaani API from your systems.</p>' + (S.admin() ? '<div class="empty-actions"><button type="button" class="btn btn--primary" data-act="key-create" data-needs-online>Create key…</button></div>' : '<p>' + esc(S.askAdmin()) + '</p>') + '</div>';
    var rows = st.keys;
    return '<div class="dt-wrap dt-wrap--framed u-hide-phone"><table class="dt" aria-label="API keys">' + S.thead(COLS) + '<tbody>' +
      rows.map(function (k) { return '<tr' + (k.revoked ? ' class="settings-row-muted"' : '') + '><td class="c-key sticky-l"><a href="#api-keys?key=' + k.id + '" data-act="key-open" data-id="' + k.id + '" translate="no">' + esc(k.name) + '</a></td><td><span class="u-mono settings-mono">' + esc(masked(k)) + '</span></td><td>' + (k.revoked ? V.ui.statusTag('apiKey', 'revoked', { v: F.dateShort(k.revoked) }) : scopesCell(k)) + '</td><td class="c-num settings-p2">' + k.rate + ' / min</td><td>' + (k.lastUsed ? esc(F.when(k.lastUsed)) : '<span class="u-fg-3">Never</span>') + '</td><td class="settings-p3">' + F.date(k.created) + ' · ' + esc(k.by) + '</td><td class="c-act sticky-r">' + more(k) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<ul class="settings-list u-only-phone" aria-label="API keys">' + rows.map(function (k) { return '<li class="settings-list-row"><a class="settings-list-main" href="#api-keys?key=' + k.id + '" data-act="key-open" data-id="' + k.id + '"><span class="settings-list-title">' + esc(k.name) + (k.revoked ? ' ' + V.ui.statusTag('apiKey', 'revoked', { v: F.dateShort(k.revoked) }) : '') + '</span><span class="settings-list-meta"><span class="u-mono">' + esc(masked(k)) + '</span> · ' + (k.lastUsed ? 'used ' + esc(F.when(k.lastUsed)) : 'never used') + '</span></a>' + more(k) + '</li>'; }).join('') + '</ul>' +
      '<div class="menu" id="key-menu" role="menu" aria-label="Key actions" hidden></div>';
  }
  S.page('api-keys', {
    meta: function () { var n = st.keys.filter(function (k) { return !k.revoked; }).length; return (n ? S.plural(n, 'key') : 'No keys yet') + ' · requests are billed to your wallet'; },
    actions: function () {
      return '<a class="btn btn--tertiary" href="#" data-act="ext-docs">API reference' + S.icon('external-link', 'sm') + '<span class="sr-only"> (opens in a new tab)</span></a>' +
        (st.keys.length ? '<button type="button" class="btn btn--primary" data-act="key-create" data-needs-online' + (S.admin() ? '' : ' aria-disabled="true" data-tooltip="Only admins can create keys. ' + esc(S.askAdmin()) + '"') + '>' + S.icon('plus') + 'Create key…</button>' : '');
    },
    render: function () { return '<p class="settings-lead">Send a key as a Bearer token: <code class="settings-code-inline" translate="no">Authorization: Bearer vv_live_…</code></p>' + (S.admin() ? '' : S.readOnlyNotice('create or revoke keys')) + '<div class="settings-sec" data-sec="keys">' + keysBody() + '</div>'; },
    mount: function () { setTimeout(function () { S.pages['api-keys'].onQuery(); }, 50); },
    onQuery: function () { var c = S.qp('create'), k = S.qp('key'); if (c === '1' && S.admin()) { S.clearQ(); S.acts['key-create']($('[data-act="key-create"]')); } else if (k && key(k)) openKey(key(k), $('[data-act="key-open"][data-id="' + k + '"]')); }
  });
  function redrawKeys(focusId) { S.refreshMeta(); S.renderHeader(); var s = $('[data-sec="keys"]'); if (!s) return; s.innerHTML = keysBody(); V.initAll(s); S.applyOffline(s); if (focusId) { var b = $('[data-act="key-open"][data-id="' + focusId + '"]', s); if (b && b.offsetParent) b.focus(); } }
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[aria-controls="key-menu"]'); if (!t) return; var k = key(t.getAttribute('data-key')), m = $('#key-menu');
    var it = function (act, icon, label, danger) { return '<button class="menu-item' + (danger ? ' menu-item--danger' : '') + '" role="menuitem" type="button" data-act="' + act + '" data-id="' + k.id + '">' + S.icon(icon) + '<span class="menu-text"><span>' + label + '</span></span></button>'; };
    m.innerHTML = it('key-open', 'panel-left', 'Open') + (S.admin() ? it('key-rename', 'pencil', 'Rename…') + '<div class="menu-sep" role="separator"></div>' + it('key-revoke', 'ban', 'Revoke key…', true) : ''); m.setAttribute('aria-label', 'Actions for ' + k.name);
  }, true);

  S.act('key-create', function (b) {
    if (!S.admin()) return;
    S.ui.reauth('create an API key', { returnTo: b }).then(function (ok) {
      if (!ok) return; var id = U.uid('ck');
      var dl = S.ui.open('<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" data-discard="Discard this key? Nothing was created.">' + S.ui.head(id, 'Create API key') + '<div class="dlg-body">' +
        S.ui.field({ id: id + '-n', name: 'n', label: 'Name', attrs: ' maxlength="40" data-autofocus spellcheck="false"', hint: 'Like CRM sync. Only your team sees it.' }) +
        '<fieldset class="fieldset" aria-describedby="' + id + '-se"><legend>Scopes</legend>' + SD.scopes.map(function (s) { return '<label class="check"><input type="checkbox" class="cb" name="scope" value="' + s.id + '"><span class="check-text">' + esc(s.label) + '<span class="check-desc">' + esc(s.desc) + ' · <span class="u-mono">' + esc(s.id) + '</span></span></span></label>'; }).join('') + '<p class="field-error" id="' + id + '-se" hidden>' + S.icon('circle-alert', 'sm') + '<span>Choose at least one scope.</span></p></fieldset>' +
        '<div class="settings-rate"><div class="slider" data-slider data-suffix=" / min" data-step="1"><div class="slider-row"><span class="field-label" id="' + id + '-rl">Rate limit</span><output class="slider-out" for="' + id + '-th">60 / min</output></div><div class="slider-track"><span class="slider-range"></span><span class="slider-mark" style="left: 10%"></span><span class="slider-thumb" id="' + id + '-th" role="slider" tabindex="0" aria-labelledby="' + id + '-rl" aria-valuemin="1" aria-valuemax="600" aria-valuenow="60"></span></div><div class="slider-marks"><span style="left: 10%">Recommended 60</span></div></div>' +
        S.ui.field({ id: id + '-r', name: 'r', label: 'Requests per minute', value: '60', type: 'number', attrs: ' min="1" max="600" inputmode="numeric"', width: 'short', hint: 'Requests above this get HTTP 429.' }) + '</div></div>' +
        '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Create key</button></div></div>', { returnTo: b });
      var sl = $('.slider', dl.el);
      var num = $('#' + id + '-r', dl.el), nm = $('#' + id + '-n', dl.el);
      sl.addEventListener('vaani:change', function (e) { num.value = e.detail.value; S.ui.setError(num, ''); });
      num.addEventListener('input', function () { var v = Math.round(+num.value); if (v >= 1 && v <= 600) { V.slider.set(sl, v, false); S.ui.setError(num, ''); } });
      dl.el.addEventListener('input', function () { dl.el.setAttribute('data-dirty', 'true'); });
      dl.el.addEventListener('change', function (e) { if (e.target.name === 'scope') $('#' + id + '-se', dl.el).hidden = true; });
      dl.on('[data-go]', function (btn, e) {
        var name = nm.value.trim(), sc = $$('input[name="scope"]:checked', dl.el).map(function (x) { return x.value; }), r = Math.round(+num.value);
        var m1 = !name ? 'Enter a name.' : st.keys.some(function (k) { return !k.revoked && k.name.toLowerCase() === name.toLowerCase(); }) ? 'You already have a key called ' + name + '.' : '', m3 = r >= 1 && r <= 600 ? '' : 'Enter a number from 1 to 600.';
        S.ui.setError(nm, m1); S.ui.setError(num, m3); $('#' + id + '-se', dl.el).hidden = !!sc.length;
        if (m1) return nm.focus(); if (!sc.length) return $('input[name="scope"]', dl.el).focus(); if (m3) return num.focus();
        S.ui.busy(btn, 'Creating…');
        S.ui.wait(700).then(function () {
          var secret = 'vv_live_' + rnd(32), k = { id: 'key_' + secret.slice(-4), name: name, last4: secret.slice(-4), scopes: sc, rate: r, lastUsed: null, created: NOW, by: S.you().short, requests: 0 };
          dl.el.removeAttribute('data-dirty'); dl.close('done');
          S.ui.secret({ title: 'Copy your key now', body: 'This is the only time we show it. We keep only a hash, so we can’t show it again.', label: 'API key', secret: secret, noun: 'key', returnTo: b }).then(function () { st.keys.push(k); S.log('Created an API key', k.name); redrawKeys(k.id); V.announce('Key ' + k.name + ' created'); });
        });
      });
    });
  });
  function openKey(k, returnTo) {
    var old = $('#st-key'); if (old) old.remove();
    var el = U.h('<div class="sheet settings-sheet" id="st-key" role="dialog" aria-labelledby="st-key-t" hidden><div class="sheet-head"><div class="sheet-heading"><h2 class="sheet-title" id="st-key-t" tabindex="-1" data-focus-target translate="no">' + esc(k.name) + '</h2><p class="sheet-meta u-mono">' + esc(masked(k)) + '</p></div><div class="sheet-actions"><button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close ' + esc(k.name) + '">' + S.icon('x') + '</button></div></div>' +
      '<div class="sheet-body">' + (k.revoked ? S.notice('neutral', 'Revoked ' + F.date(k.revoked) + '. It stays listed for 7 days so a failing integration can be traced.', { icon: 'ban' }) : '') + S.kv([['Key', '<span class="u-mono">' + esc(masked(k)) + '</span>'], ['Scopes', '<ul class="settings-plain-list">' + k.scopes.map(function (s) { return '<li>' + esc(scopeLabel(s)) + ' <span class="u-mono u-fg-3">' + esc(s) + '</span></li>'; }).join('') + '</ul>'], ['Rate limit', k.rate + ' requests per minute'], ['Created', F.date(k.created) + ' by ' + esc(k.by)], ['Last used', k.lastUsed ? esc(F.when(k.lastUsed)) + ' from <span class="u-mono">' + esc(k.lastIp || '–') + '</span>' : 'Never'], ['Requests this month', F.count(k.requests)]]) +
      (S.admin() && !k.revoked ? '<div class="settings-btnrow"><button type="button" class="btn btn--sm" data-act="key-rename" data-id="' + k.id + '">Rename…</button></div>' + S.dangerZone([{ title: 'Revoke key', desc: 'Apps using it stop working now. This can’t be undone.', label: 'Revoke key…', act: 'key-revoke' }]).replace('data-sec="danger"', 'data-sec="key-danger" data-id="' + k.id + '"').replace(/sec-danger-t/g, 'st-key-dz') : '') + '</div></div>');
    d.body.appendChild(el); V.initAll(el); el._key = k.id;
    V.drawer.open(el, { returnTo: returnTo, onClose: function () { if (S.route() && S.route().q.get('key')) S.clearQ(); } });
    $('#st-key-t', el).focus();
  }
  S.act('key-open', function (b) { var k = key(b.getAttribute('data-id')); w.history.replaceState(null, '', w.location.pathname + w.location.search + '#api-keys?key=' + k.id); openKey(k, $('[data-act="key-open"][data-id="' + k.id + '"]') || b); });
  S.act('key-rename', function (b) {
    var k = key(b.getAttribute('data-id')), id = U.uid('rn');
    var dl = S.ui.open('<div class="dlg dlg--sm" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t">' + S.ui.head(id, 'Rename key') + '<div class="dlg-body">' + S.ui.field({ id: id + '-n', name: 'n', label: 'Name', value: k.name, attrs: ' maxlength="40" data-autofocus', hint: 'Only your team sees it.' }) + '</div><div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>Rename</button></div></div>', { returnTo: b });
    var n = $('#' + id + '-n', dl.el); n.select();
    dl.on('[data-go]', function (btn) { var v = n.value.trim(); if (!v) { S.ui.setError(n, 'Enter a name.'); return n.focus(); } k.name = v; dl.close('done'); V.drawer.close(); redrawKeys(k.id); V.announce('Renamed to ' + v); });
    n.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('[data-go]', dl.el).click(); });
  });
  S.act('key-revoke', function (b) {
    var k = key(b.getAttribute('data-id') || ($('#st-key') || {})._key);
    S.ui.confirm({ title: 'Revoke ‘' + k.name + '’?', body: 'Apps using it stop working now. This can’t be undone.', confirmLabel: 'Revoke key', tone: 'danger', returnTo: b })
      .then(function (ok) { if (!ok) return; V.drawer.close(); k.revoked = NOW; S.log('Revoked an API key', k.name); redrawKeys(k.id); V.toast.success('Revoked ' + k.name + '. It stays listed for 7 days.'); });
  });

  /* =================================== Embed =================================== */
  function webKeys() { return st.keys.filter(function (k) { return !k.revoked && k.scopes.indexOf('textvoice') >= 0; }); }
  function snippet() {
    var e = st.embed, k = key(e.key) || webKeys()[0];
    return '<div id="vaani-voice" data-key-id="' + (k ? k.id : '') + '" data-style="' + e.style + '"' + (e.style === 'floating' ? ' data-position="' + e.position + '"' : '') + ' data-button-text="' + e.text.replace(/"/g, '&quot;') + '"></div>\n<script src="https://cdn.vaanilabs.in/embed/v1/vaani-voice.js" defer></script>';
  }
  function preview() {
    var e = st.embed, btn = '<span class="settings-widget-btn">' + S.icon('mic', 'sm') + esc(e.text || 'Talk to us') + '</span>';
    return '<div class="settings-preview-frame" data-style="' + e.style + '" data-position="' + e.position + '" aria-hidden="true"><div class="settings-pv-bar"><span class="settings-pv-logo"></span><span class="settings-pv-nav"></span></div><div class="settings-pv-body"><span class="settings-pv-h"></span><span class="settings-pv-l"></span><span class="settings-pv-l settings-pv-l--short"></span>' +
      (e.style === 'inline' ? '<div class="settings-pv-panel"><span class="settings-pv-ptitle">Ask about prices, site visits and availability</span>' + btn + '</div>' : '<span class="settings-pv-l"></span><span class="settings-pv-l settings-pv-l--short"></span>') + '</div>' + (e.style === 'floating' ? '<div class="settings-pv-float">' + btn + '</div>' : '') + '</div>';
  }
  S.page('embed', {
    meta: function () { return 'Add a Vaani voice widget to your website'; },
    render: function () {
      var ks = webKeys(), e = st.embed; if (!key(e.key) && ks[0]) e.key = ks[0].id;
      if (!ks.length) return S.sec({ id: 'key', title: 'API key', body: '<div class="empty empty--compact settings-only">' + S.icon('key-round') + '<span>Create a key with the Web voice agent scope to use the widget.</span><a class="btn btn--sm" href="#api-keys?create=1">Create key…</a></div>' });
      var cur = key(e.key);
      return S.sec({ id: 'key', title: 'API key', desc: 'Keys with the Web voice agent scope. The snippet names the key; the key itself stays on our servers.', body: '<div class="settings-field-row"><div class="field field--medium"><span class="field-label" id="em-key-l">API key</span><button type="button" class="select" data-select id="em-key" aria-controls="em-key-lb" aria-labelledby="em-key-l em-key-v"><span class="select-value" id="em-key-v">' + esc(cur.name + ' · ' + masked(cur)) + '</span>' + S.icon('chevron-down', 'sm') + '</button>' +
          '<div class="listbox" id="em-key-lb" role="listbox" aria-labelledby="em-key-l" hidden>' + ks.map(function (k) { return '<div class="option" role="option" aria-selected="' + (k.id === e.key) + '" data-value="' + k.id + '"><span class="option-main"><span class="option-label">' + esc(k.name + ' · ' + masked(k)) + '</span></span>' + S.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div><a class="btn btn--link settings-field-aside" href="#api-keys?create=1">Create key…</a></div>' }) +
        S.sec({ id: 'snippet', title: 'Snippet', desc: 'Paste it before &lt;/body&gt; on every page that should show the widget.', body: S.ui.code(snippet(), { label: 'HTML snippet', id: 'em-code', wrap: true }) }) +
        S.sec({ id: 'options', title: 'Options', desc: 'These change the snippet only. Nothing is saved.', body: '<div class="settings-options">' +
          '<div class="field"><span class="field-label" id="em-style-l">Style</span>' + S.seg('em-style', 'em-style-l', [['floating', 'Floating button'], ['inline', 'Inline panel']], e.style) + '</div>' +
          (e.style === 'floating' ? '<div class="field"><span class="field-label" id="em-pos-l">Position</span><button type="button" class="select select--auto" data-select id="em-pos" aria-controls="em-pos-lb" aria-labelledby="em-pos-l em-pos-v"><span class="select-value" id="em-pos-v">' + (e.position === 'bottom-left' ? 'Bottom left' : 'Bottom right') + '</span>' + S.icon('chevron-down', 'sm') + '</button><div class="listbox" id="em-pos-lb" role="listbox" aria-labelledby="em-pos-l" hidden>' + [['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left']].map(function (p) { return '<div class="option" role="option" aria-selected="' + (p[0] === e.position) + '" data-value="' + p[0] + '"><span class="option-main"><span class="option-label">' + p[1] + '</span></span>' + S.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>' : '') +
          S.ui.field({ id: 'em-text', name: 'btntext', label: 'Button text', value: e.text, attrs: ' maxlength="24"', width: 'medium' }) + '</div>' }) +
        S.sec({ id: 'preview', title: 'Preview', desc: 'A sample page with the widget. Visual only: your site uses your key and your live flow.', body: '<div class="settings-preview" id="em-preview">' + preview() + '</div>' });
    },
    mount: function (root) {
      function upd(full) { S.ui.setCode('em-code', snippet()); var p = $('#em-preview', root); if (p) { p.innerHTML = preview(); fit(); } if (full) { S.rerender(); } }
      var ks = $('#em-key', root); if (ks) ks.addEventListener('vaani:change', function (e) { st.embed.key = e.detail.value; upd(); });
      var sg = $('#em-style', root); if (sg) sg.addEventListener('vaani:change', function (e) { st.embed.style = e.detail.value; upd(true); var s = $('#em-style [aria-checked="true"]'); if (s) s.focus(); });
      var ps = $('#em-pos', root); if (ps) ps.addEventListener('vaani:change', function (e) { st.embed.position = e.detail.value; upd(); });
      var tx = $('#em-text', root); if (tx) tx.addEventListener('input', function () { st.embed.text = tx.value; upd(); });
      fit();
    }
  });
  /* The preview is never narrower than 360 or clipped: below 400 px it scales down as a whole (runtime transform). */
  function fit() { var p = $('#em-preview'), f = p && $('.settings-preview-frame', p); if (!f) return; var wdt = p.clientWidth, base = 400; if (wdt < base) { var k = wdt / base; f.style.width = base + 'px'; f.style.transform = 'scale(' + k + ')'; f.style.transformOrigin = 'top left'; p.style.height = Math.round(f.offsetHeight * k) + 'px'; } else { f.style.width = ''; f.style.transform = ''; p.style.height = ''; } }
  w.addEventListener('resize', fit);
})(window, document);
