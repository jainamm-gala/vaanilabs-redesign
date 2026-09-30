/* Vaani Labs prototype · pages/settings-hooks.js — Webhooks and Webhook deliveries (§7.9).
   New webhook… is a real dialog (named close, focus trap); "not-a-url" shows the URL error on blur and on Create, and nothing
   is sent. Pause is Instant; Rotate signing secret… is tier 2 after "Confirm it’s you"; Delete webhook… is tier 2.
   Deliveries works without a webhook id (all webhooks), with filters as view state. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F, st = S.st, SD = S.SD;
  var NOW = S.DATA.meta.now;
  function hook(id) { return st.webhooks.filter(function (h) { return h.id === id; })[0]; }
  /* Endpoint, middle-truncated by CSS (settings.css): the head ellipsizes to fit the column, the last 12 characters stay */
  function endpoint(u) { var cut = Math.max(0, u.length - 12); return '<span class="settings-mid-h">' + esc(u.slice(0, cut)) + '</span><span class="settings-mid-t">' + esc(u.slice(cut)) + '</span>'; }
  /* [label, header class] (see S.thead in settings-keys.js): Name, Endpoint and Status are P1 (the phone ListRow’s title
     and URL); Events and Last delivery are P2 (at 1024 and wider). Deliveries fit their frame at every width, so all their
     columns stay P1. Both tables pin the key column left and the actions column right. */
  var COLS = S.hookCols = [['Name', 'sticky-l'], ['Endpoint', 'settings-c-endpoint'], ['Events', 'c-num settings-p2'], ['Status', ''], ['Last delivery', 'settings-p2'], ['', 'c-act sticky-r']];
  var DCOLS = S.dlvCols = [['When', 'sticky-l'], ['Event', ''], ['Webhook', ''], ['Response', ''], ['Duration', 'c-num'], ['Attempts', 'c-num'], ['', 'c-act sticky-r']];
  /* the delivery response as a StatusTag from the shared map: 200 OK · 500 · Timed out */
  function code(c) { return c === 200 ? V.ui.statusTag('delivery', 'ok') : c === 0 ? V.ui.statusTag('delivery', 'timeout') : V.ui.statusTag('delivery', 'error', { n: c }); }
  function secretStr() { var a = 'abcdef0123456789', r = S.DATA._util.rng(Date.now() % 9999), s = 'whsec_'; for (var i = 0; i < 32; i++) s += a[Math.floor(r() * 16)]; return s; }

  /* =================================== Webhooks =================================== */
  function statusCell(h) {
    var t = V.ui.statusTag('webhook', h.status) + (h.status === 'failing' ? '<span class="settings-irow-meta">' + h.streak + ' in a row</span>' : '');
    if (h.test === 'ok') t += '<span class="settings-cell-note">' + S.status('success', 'Test sent · 200 OK in 180 ms') + '</span>';
    if (h.test === 'fail') t += '<span class="settings-cell-note">' + S.status('danger', 'Test failed · 500') + ' <a href="#webhook-deliveries?webhook=' + h.id + '&amp;status=failed">View delivery</a></span>';
    if (h.test === 'sending') t += '<span class="settings-cell-note">' + S.status('progress', 'Sending test…') + '</span>';
    return '<span class="settings-cell-stack">' + t + '</span>';
  }
  function more(h) { return '<button type="button" class="ibtn" aria-haspopup="menu" aria-controls="hook-menu" aria-expanded="false" data-hook="' + h.id + '" aria-label="More actions for ' + esc(h.name) + '">' + S.icon('ellipsis') + '</button>'; }
  function hooksBody() {
    if (S.demo('section-error')) return S.sectionError('webhooks');
    if (!st.webhooks.length) return '<div class="empty empty--page settings-empty">' + S.icon('webhook', 'lg') + '<h2 class="empty-title">No webhooks yet</h2><p>Send call and lead events to your systems as they happen.</p>' + (S.admin() ? '<div class="empty-actions"><button type="button" class="btn btn--primary" data-act="hook-new" data-needs-online>New webhook…</button></div>' : '<p>' + esc(S.askAdmin()) + '</p>') + '</div>';
    return '<div class="dt-wrap dt-wrap--framed u-hide-phone"><table class="dt" aria-label="Webhooks">' + S.thead(COLS) + '<tbody>' +
      st.webhooks.map(function (h) { return '<tr><td class="c-key sticky-l">' + esc(h.name) + '</td><td class="settings-c-endpoint"><span class="u-mono settings-mono settings-endpoint" data-tooltip="' + esc(h.url) + '" tabindex="0" aria-label="Endpoint ' + esc(h.url) + '" translate="no">' + endpoint(h.url) + '</span></td><td class="c-num settings-p2"><button type="button" class="count-badge settings-badge-btn" data-tooltip="' + esc(h.events.join(', ')) + '" aria-label="' + h.events.length + ' events: ' + esc(h.events.join(', ')) + '">' + h.events.length + '</button></td><td>' + statusCell(h) + '</td><td class="settings-p2">' + (h.last ? esc(F.when(h.last.at)) + ' · <span class="' + (h.last.code === 200 ? 'u-fg-2' : 'u-fg-danger') + '">' + h.last.code + '</span>' : '<span class="u-fg-3">No deliveries yet</span>') + '</td><td class="c-act sticky-r">' + more(h) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<ul class="settings-list u-only-phone" aria-label="Webhooks">' + st.webhooks.map(function (h) { return '<li class="settings-list-row"><span class="settings-list-main"><span class="settings-list-title">' + esc(h.name) + ' ' + V.ui.statusTag('webhook', h.status) + '</span><span class="settings-list-meta u-mono u-wrap-anywhere">' + esc(h.url) + '</span><span class="settings-list-meta">' + S.plural(h.events.length, 'event') + (h.last ? ' · last ' + esc(F.when(h.last.at)) + ' · ' + h.last.code : '') + '</span></span>' + more(h) + '</li>'; }).join('') + '</ul>' +
      '<div class="menu" id="hook-menu" role="menu" aria-label="Webhook actions" hidden></div>';
  }
  var NODE = "import crypto from 'node:crypto';\n\n// rawBody: the request body exactly as received (a Buffer), before any JSON parsing\nexport function isFromVaani(rawBody, header, secret) {\n  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');\n  const a = Buffer.from(expected);\n  const b = Buffer.from(header || '');\n  return a.length === b.length && crypto.timingSafeEqual(a, b);\n}";
  var PY = "import hashlib, hmac\n\n# raw_body: the request body exactly as received (bytes), before any JSON parsing\ndef is_from_vaani(raw_body: bytes, header: str, secret: str) -> bool:\n    expected = 'sha256=' + hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(expected, header or '')";
  S.page('webhooks', {
    meta: function () { var f = st.webhooks.filter(function (h) { return h.status === 'failing'; }).length; return st.webhooks.length ? S.plural(st.webhooks.length, 'webhook') + (f ? ' · ' + f + ' failing' : '') : 'No webhooks yet'; },
    actions: function () { return (st.webhooks.length ? '<a class="btn btn--tertiary" href="#webhook-deliveries">View deliveries</a>' : '') + (st.webhooks.length ? '<button type="button" class="btn btn--primary" data-act="hook-new" data-needs-online' + (S.admin() ? '' : ' aria-disabled="true" data-tooltip="Only admins can add webhooks. ' + esc(S.askAdmin()) + '"') + '>' + S.icon('plus') + 'New webhook…</button>' : ''); },
    render: function () {
      return (S.admin() ? '' : S.readOnlyNotice('add or change webhooks')) + '<div class="settings-sec" data-sec="hooks">' + hooksBody() + '</div>' +
        S.sec({ id: 'signatures', title: 'Verifying signatures', desc: 'Every request carries <code class="settings-code-inline" translate="no">X-Vaani-Signature: sha256=&lt;hex&gt;</code>, an HMAC of the raw body with your signing secret. Compare it in constant time before you trust the event.', body:
          '<div class="settings-tabs"><div class="vtabs vtabs--panel"><div class="vtabs-list" role="tablist" aria-label="Language"><button class="vtab" role="tab" type="button" id="sig-t-node" aria-selected="true" aria-controls="sig-p-node">Node.js</button><button class="vtab" role="tab" type="button" id="sig-t-py" aria-selected="false" aria-controls="sig-p-py">Python</button></div></div>' +
          '<div role="tabpanel" id="sig-p-node" aria-labelledby="sig-t-node">' + S.ui.code(NODE, { label: 'Node.js example', id: 'sig-node' }) + '</div><div role="tabpanel" id="sig-p-py" aria-labelledby="sig-t-py" hidden>' + S.ui.code(PY, { label: 'Python example', id: 'sig-py' }) + '</div></div>' +
          '<p class="form-note">Integrations built before 1 Oct 2026 can keep reading <span class="u-mono">X-VaaniVoice-Signature</span>; we send both headers.</p>' });
    },
    mount: function () { setTimeout(function () { if (S.qp('create') === '1' && S.admin()) { S.clearQ(); S.acts['hook-new']($('[data-act="hook-new"]')); } var e = S.qp('webhook'); if (e && hook(e) && S.admin()) { S.clearQ(); edit(hook(e)); } }, 50); }
  });
  function redrawHooks(focusId) { S.refreshMeta(); S.renderHeader(); var s = $('[data-sec="hooks"]'); if (!s) return; s.innerHTML = hooksBody(); V.initAll(s); S.applyOffline(s); if (focusId) { var b = $('[data-hook="' + focusId + '"]', s); if (b && b.offsetParent) b.focus(); } }
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[aria-controls="hook-menu"]'); if (!t) return; var h = hook(t.getAttribute('data-hook')), m = $('#hook-menu'), a = S.admin();
    var it = function (act, icon, label, danger) { return '<button class="menu-item' + (danger ? ' menu-item--danger' : '') + '" role="menuitem" type="button" data-act="' + act + '" data-id="' + h.id + '">' + S.icon(icon) + '<span class="menu-text"><span>' + label + '</span></span></button>'; };
    m.innerHTML = (a ? it('hook-test', 'send', 'Send test event') : '') + it('hook-deliveries', 'history', 'View deliveries') + (a ? it('hook-edit', 'pencil', 'Edit…') + it('hook-pause', h.status === 'paused' ? 'play' : 'pause', h.status === 'paused' ? 'Resume' : 'Pause') + it('hook-rotate', 'rotate-cw', 'Rotate signing secret…') + '<div class="menu-sep" role="separator"></div>' + it('hook-delete', 'trash-2', 'Delete webhook…', true) : '');
    m.setAttribute('aria-label', 'Actions for ' + h.name);
  }, true);
  S.act('hook-deliveries', function (b) { S.go('#webhook-deliveries?webhook=' + b.getAttribute('data-id')); });
  S.act('hook-test', function (b) { var h = hook(b.getAttribute('data-id')); h.test = 'sending'; redrawHooks(); S.ui.wait(900).then(function () { h.test = h.status === 'failing' ? 'fail' : 'ok'; redrawHooks(h.id); V.announce(h.test === 'ok' ? 'Test sent, 200 OK in 180 milliseconds' : 'Test failed with 500'); }); });
  S.act('hook-pause', function (b) { var h = hook(b.getAttribute('data-id')), was = h.status; h.status = was === 'paused' ? (h.streak ? 'failing' : 'healthy') : 'paused'; redrawHooks(h.id); V.toast.success((h.status === 'paused' ? 'Paused ' : 'Resumed ') + h.name); });
  S.act('hook-delete', function (b) {
    var h = hook(b.getAttribute('data-id'));
    S.ui.confirm({ title: 'Delete ‘' + h.name + '’?', body: 'Events stop now. Its delivery history is deleted too.', confirmLabel: 'Delete webhook', tone: 'danger', returnTo: $('[data-hook="' + h.id + '"]') })
      .then(function (ok) { if (!ok) return; st.webhooks = st.webhooks.filter(function (x) { return x !== h; }); st.deliveries = st.deliveries.filter(function (x) { return x.webhook !== h.id; }); S.log('Deleted a webhook', h.name); redrawHooks(); S.focusH1(); V.toast.success('Deleted ' + h.name); });
  });
  S.act('hook-rotate', function (b) {
    var h = hook(b.getAttribute('data-id')), ret = $('[data-hook="' + h.id + '"]');
    S.ui.reauth('rotate a signing secret', { returnTo: ret }).then(function (ok) {
      if (!ok) return;
      S.ui.confirm({ title: 'Rotate the secret for ‘' + h.name + '’?', body: 'The old secret keeps working for 24 hours so you can update your server.', confirmLabel: 'Rotate secret', returnTo: ret }).then(function (go) {
        if (!go) return; S.log('Rotated a signing secret', h.name);
        S.ui.secret({ title: 'Copy your signing secret', body: 'This is the only time we show it. The old secret stops working in 24 hours.', label: 'Signing secret', secret: secretStr(), noun: 'secret', notice: 'Keep it on your server. Use it only to check signatures.', returnTo: ret });
      });
    });
  });
  function edit(h, trigger) {
    var id = U.uid('wh'), isNew = !h, v = h || { name: '', url: '', events: [] };
    var dl = S.ui.open('<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t" data-discard="Discard this webhook? What you typed will be lost.">' + S.ui.head(id, isNew ? 'New webhook' : 'Edit ' + h.name) + '<div class="dlg-body">' +
      S.ui.field({ id: id + '-n', name: 'n', label: 'Name', value: v.name, attrs: ' maxlength="40" data-autofocus', hint: 'Like CRM hook' }) +
      S.ui.field({ id: id + '-u', name: 'u', label: 'Endpoint URL', value: v.url, type: 'url', mono: true, attrs: ' spellcheck="false" autocapitalize="off" inputmode="url"', hint: 'We send a POST request with a JSON body.' }) +
      '<fieldset class="fieldset" aria-describedby="' + id + '-ee"><legend>Events</legend>' + SD.events.map(function (e) { return '<label class="check"><input type="checkbox" class="cb" name="ev" value="' + e.id + '"' + (v.events.indexOf(e.id) >= 0 ? ' checked' : '') + '><span class="check-text"><span class="u-mono">' + e.id + '</span><span class="check-desc">' + esc(e.desc) + '</span></span></label>'; }).join('') + '<p class="field-error" id="' + id + '-ee" hidden>' + S.icon('circle-alert', 'sm') + '<span>Choose at least one event.</span></p></fieldset></div>' +
      '<div class="dlg-foot"><button type="button" class="btn btn--tertiary" data-dialog-close>Cancel</button><button type="button" class="btn btn--primary" data-go>' + (isNew ? 'Create webhook' : 'Save changes') + '</button></div></div>', { returnTo: trigger || $('[data-hook="' + (h && h.id) + '"]') });
    var n = $('#' + id + '-n', dl.el), u = $('#' + id + '-u', dl.el);
    dl.el.addEventListener('input', function () { dl.el.setAttribute('data-dirty', 'true'); if (u.getAttribute('aria-invalid')) S.ui.setError(u, S.valid.https(u.value)); if (n.getAttribute('aria-invalid') && n.value.trim()) S.ui.setError(n, ''); });
    dl.el.addEventListener('change', function (e) { if (e.target.name === 'ev') $('#' + id + '-ee', dl.el).hidden = true; });
    u.addEventListener('blur', function () { if (u.value.trim()) S.ui.setError(u, S.valid.https(u.value)); });
    dl.on('[data-go]', function (btn, e) {
      var ev = $$('input[name="ev"]:checked', dl.el).map(function (x) { return x.value; }), m1 = n.value.trim() ? '' : 'Enter a name.', m2 = S.valid.https(u.value);
      S.ui.setError(n, m1); S.ui.setError(u, m2); $('#' + id + '-ee', dl.el).hidden = !!ev.length;
      if (m1) return n.focus(); if (m2) return u.focus(); if (!ev.length) return $('input[name="ev"]', dl.el).focus();
      S.ui.busy(btn, isNew ? 'Creating…' : 'Saving…');
      S.ui.wait(700).then(function () {
        dl.el.removeAttribute('data-dirty'); dl.close('done');
        if (!isNew) { h.name = n.value.trim(); h.url = u.value.trim(); h.events = ev; redrawHooks(h.id); V.announce('Saved ' + h.name); return; }
        var nh = { id: 'wh_' + Date.now().toString(36), name: n.value.trim(), url: u.value.trim(), events: ev, status: 'healthy', streak: 0, last: null };
        S.ui.secret({ title: 'Copy your signing secret', body: 'This is the only time we show it. Use it to check that requests come from Vaani Labs.', label: 'Signing secret', secret: secretStr(), noun: 'secret', notice: 'Keep it on your server. Use it only to check signatures.', returnTo: trigger }).then(function () { st.webhooks.push(nh); S.log('Created a webhook', nh.name); redrawHooks(nh.id); });
      });
    });
  }
  S.act('hook-new', function (b) { if (S.admin()) edit(null, b); });
  S.act('hook-edit', function (b) { edit(hook(b.getAttribute('data-id'))); });

  /* =================================== Webhook deliveries =================================== */
  var flt = { webhook: 'all', status: 'all', event: 'all', range: '30' };
  function filtered() { return st.deliveries.filter(function (x) { return (flt.webhook === 'all' || x.webhook === flt.webhook) && (flt.status === 'all' || (flt.status === 'failed' ? x.code !== 200 : x.code === 200)) && (flt.event === 'all' || x.event === flt.event); }); }
  function sel(id, label, opts, val) {
    return '<div class="field settings-filter"><span class="field-label" id="' + id + '-l">' + label + '</span><button type="button" class="select select--sm select--auto" data-select id="' + id + '" aria-controls="' + id + '-lb" aria-labelledby="' + id + '-l ' + id + '-v"><span class="select-value" id="' + id + '-v">' + esc((opts.filter(function (o) { return o[0] === val; })[0] || opts[0])[1]) + '</span>' + S.icon('chevron-down', 'sm') + '</button>' +
      '<div class="listbox" id="' + id + '-lb" role="listbox" aria-labelledby="' + id + '-l" hidden>' + opts.map(function (o) { return '<div class="option" role="option" aria-selected="' + (o[0] === val) + '" data-value="' + o[0] + '"><span class="option-main"><span class="option-label">' + esc(o[1]) + '</span></span>' + S.icon('check', 'sm', { className: 'option-check' }) + '</div>'; }).join('') + '</div></div>';
  }
  function dlvBody() {
    var list = filtered();
    if (!st.deliveries.length) return '<div class="empty empty--page settings-empty">' + S.icon('history', 'lg') + '<h2 class="empty-title">No deliveries yet</h2><p>Deliveries appear here after an event is sent to one of your webhooks.</p></div>';
    if (!list.length) return '<div class="empty empty--page settings-empty">' + S.icon('search-x', 'lg') + '<h2 class="empty-title">No ' + (flt.status === 'failed' ? 'failed ' : '') + 'deliveries match</h2><p>Nothing in the last ' + (flt.range === '1' ? 'day' : flt.range + ' days') + ' for these filters.</p><div class="empty-actions"><button type="button" class="btn" data-act="dlv-clear">Clear filters</button></div></div>';
    return '<div class="dt-wrap dt-wrap--framed"><table class="dt settings-dlv" aria-label="Webhook deliveries, newest first">' + S.thead(DCOLS) + '<tbody>' +
      list.map(function (x) { var h = hook(x.webhook) || { name: 'Deleted webhook' }; return '<tr><td class="c-key sticky-l"><a href="#webhook-deliveries?delivery=' + x.id + '" data-act="dlv-open" data-id="' + x.id + '"><time datetime="' + x.at + '">' + esc(F.when(x.at)) + '</time></a></td><td><span class="u-mono">' + esc(x.event) + '</span></td><td>' + esc(h.name) + '</td><td><span class="settings-cell-stack">' + code(x.code) + (x.redone ? '<span class="settings-cell-note">' + S.status('success', 'Redelivered · 200 OK') + '</span>' : '') + '</span></td><td class="c-num">' + (x.code === 0 ? '10 s' : x.ms + ' ms') + '</td><td class="c-num">' + x.attempts + '</td><td class="c-act sticky-r"><button type="button" class="ibtn" aria-haspopup="menu" aria-controls="dlv-menu" aria-expanded="false" data-dlv="' + x.id + '" aria-label="More actions for delivery ' + x.id + '">' + S.icon('ellipsis') + '</button></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="settings-pager-note">1–' + list.length + ' of ' + F.count(flt.status === 'failed' ? S.SD.deliveryTotals.failed : S.SD.deliveryTotals.all) + ' · newest first</p><div class="menu" id="dlv-menu" role="menu" aria-label="Delivery actions" hidden></div>';
  }
  S.page('webhook-deliveries', {
    meta: function () { return 'Last ' + (flt.range === '1' ? 'day' : flt.range + ' days') + ' · ' + F.count(S.SD.deliveryTotals.all) + ' deliveries · ' + S.SD.deliveryTotals.failed + ' failed'; },
    render: function () {
      var q = S.route().q; flt.webhook = q.get('webhook') && hook(q.get('webhook')) ? q.get('webhook') : 'all'; flt.status = q.get('status') === 'failed' ? 'failed' : 'all';
      return '<div class="settings-filters" role="group" aria-label="Filter deliveries">' + '<div class="field settings-filter"><span class="field-label" id="dlv-st-l">Show</span>' + S.seg('dlv-st', 'dlv-st-l', [['all', 'All'], ['failed', 'Failed']], flt.status) + '</div>' +
        sel('dlv-wh', 'Webhook', [['all', 'All webhooks']].concat(st.webhooks.map(function (h) { return [h.id, h.name]; })), flt.webhook) +
        sel('dlv-ev', 'Event', [['all', 'All events']].concat(SD.events.map(function (e) { return [e.id, e.id]; })), flt.event) +
        sel('dlv-rg', 'Range', [['1', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days']], flt.range) + '</div><div data-sec="deliveries">' + dlvBody() + '</div>';
    },
    mount: function (root) {
      function upd() { var s = $('[data-sec="deliveries"]', root); s.innerHTML = dlvBody(); V.initAll(s); S.refreshMeta(); var p = new URLSearchParams(); if (flt.webhook !== 'all') p.set('webhook', flt.webhook); if (flt.status !== 'all') p.set('status', flt.status); w.history.replaceState(null, '', w.location.pathname + w.location.search + '#webhook-deliveries' + (p.toString() ? '?' + p : '')); }
      $('#dlv-st', root).addEventListener('vaani:change', function (e) { flt.status = e.detail.value; upd(); });
      [['#dlv-wh', 'webhook'], ['#dlv-ev', 'event'], ['#dlv-rg', 'range']].forEach(function (c) { $(c[0], root).addEventListener('vaani:change', function (e) { flt[c[1]] = e.detail.value; upd(); }); });
      var dq = S.qp('delivery'); if (dq) setTimeout(function () { openDlv(dq); }, 60);
    }
  });
  S.act('dlv-clear', function () { flt = { webhook: 'all', status: 'all', event: 'all', range: '30' }; w.history.replaceState(null, '', w.location.pathname + w.location.search + '#webhook-deliveries'); S.rerender(); var s = $('#dlv-st [aria-checked="true"]'); if (s) s.focus(); });
  d.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[aria-controls="dlv-menu"]'); if (!t) return; var id = t.getAttribute('data-dlv'); $('#dlv-menu').innerHTML = '<button class="menu-item" role="menuitem" type="button" data-act="dlv-redo" data-id="' + id + '">' + S.icon('rotate-cw') + '<span class="menu-text"><span>Redeliver</span></span></button><button class="menu-item" role="menuitem" type="button" data-act="dlv-copy" data-id="' + id + '">' + S.icon('copy') + '<span class="menu-text"><span>Copy delivery id</span></span></button>'; }, true);
  function dlv(id) { return st.deliveries.filter(function (x) { return x.id === id; })[0]; }
  S.act('dlv-copy', function (b) { S.ui.copy(b.getAttribute('data-id'), { toast: 'Delivery id copied' }); });
  S.act('dlv-redo', function (b) { var x = dlv(b.getAttribute('data-id')); x.redone = true; S.rerender(); V.announce('Redelivered, 200 OK'); var t = $('[data-dlv="' + x.id + '"]'); if (t) t.focus(); });
  function openDlv(id) {
    var x = dlv(id); if (!x) return; var h = hook(x.webhook) || { name: 'Deleted webhook', url: '' }, old = $('#st-dlv'); if (old) old.remove();
    var body = JSON.stringify({ id: 'evt_' + x.id.slice(4), type: x.event, created_at: x.at, data: x.event.indexOf('call') === 0 ? { call_id: 'call_7c21e0', outcome: 'Visit booked', duration_sec: 151 } : { lead_id: 'lead_1042', source: 'Website form' } }, null, 2);
    var req = 'POST ' + (h.url || '/') + '\nContent-Type: application/json\nX-Vaani-Signature: sha256=3f9c…e21a\nX-VaaniVoice-Signature: sha256=3f9c…e21a\nX-Vaani-Delivery: ' + x.id;
    var resp = x.code === 0 ? 'No response in 10 s' : x.code === 200 ? 'HTTP 200\n{"ok":true}' : 'HTTP ' + x.code + '\n<html><body><h1>Internal Server Error</h1></body></html>';
    var el = U.h('<div class="sheet settings-sheet" id="st-dlv" role="dialog" aria-labelledby="st-dlv-t" hidden><div class="sheet-head"><div class="sheet-heading"><h2 class="sheet-title" id="st-dlv-t" tabindex="-1" data-focus-target>' + esc(x.event) + '</h2><p class="sheet-meta">' + esc(h.name) + ' · ' + esc(F.when(x.at)) + '</p></div><div class="sheet-actions">' + code(x.code) + '<button class="ibtn sheet-close" type="button" data-drawer-close aria-label="Close delivery">' + S.icon('x') + '</button></div></div>' +
      '<div class="sheet-body">' + S.kv([['Delivery id', '<span class="u-mono">' + x.id + '</span>'], ['Attempts', String(x.attempts)], ['Duration', x.code === 0 ? '10 s (timed out)' : x.ms + ' ms']]) + '<h3 class="settings-sub">Request</h3>' + S.ui.code(req, { label: 'Request headers', wrap: true }) + S.ui.code(body, { label: 'Request body' }) + '<h3 class="settings-sub">Response</h3>' + S.ui.code(resp, { label: 'Response (first 2 KB)', wrap: true }) +
      '<div class="settings-btnrow"><button type="button" class="btn btn--sm" data-act="dlv-redo" data-id="' + x.id + '">' + S.icon('rotate-cw', 'sm') + 'Redeliver</button></div></div></div>');
    d.body.appendChild(el); V.initAll(el);
    V.drawer.open(el, { returnTo: $('[data-act="dlv-open"][data-id="' + x.id + '"]'), onClose: function () { if (S.route() && S.route().q.get('delivery')) S.clearQ(); } });
    $('#st-dlv-t', el).focus();
  }
  S.act('dlv-open', function (b) { w.history.replaceState(null, '', w.location.pathname + w.location.search + '#webhook-deliveries?delivery=' + b.getAttribute('data-id')); openDlv(b.getAttribute('data-id')); });
})(window, document);
