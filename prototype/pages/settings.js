/* Vaani Labs prototype · pages/settings.js — Settings frame (03-pages/06 §0.3, §2, §3): state, demo flags, hash router,
   SettingsNav, PageHeader, section markup, delegated actions, anchors and Copy link, palette and shortcuts, boot.
   Routes: settings.html#<page>[/<section>][?view-state]. The frame never reloads between Settings pages: only the
   column swaps (§3.6). Page modules register with S.page(id, { meta, actions, render, mount }). Namespace: window.VaaniSettings. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, esc = U.esc, $ = U.$, $$ = U.$$, F = V.fmt, DATA = V.data;
  var S = w.VaaniSettings = w.VaaniSettings || {}, SD = S.SD;
  S.V = V; S.esc = esc; S.$ = $; S.$$ = $$; S.F = F; S.DATA = DATA;
  S.icon = function (n, s, o) { return V.icon(n, s, o); };
  S.pages = {}; S.acts = {};
  S.page = function (id, def) { S.pages[id] = def; };
  S.act = function (name, fn) { S.acts[name] = fn; };
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  S.clone = clone;
  S.plural = function (n, one, many) { return F.count(n) + ' ' + (n === 1 ? one : (many || one + 's')); };


  /* ---------- Demo flags (prototype only): ?demo=a,b — see settings-proto.js ---------- */
  var params = new URLSearchParams(w.location.search), demo = {};
  (params.get('demo') || '').split(',').forEach(function (k) { if (k) demo[k] = true; });
  S.demo = function (k) { return !!demo[k]; };
  S.demoList = function () { return Object.keys(demo); };
  S.setDemo = function (k, on) {
    if (on) demo[k] = true; else delete demo[k];
    var p = new URLSearchParams(w.location.search), l = Object.keys(demo);
    if (l.length) p.set('demo', l.join(',')); else p.delete('demo');
    var qs = p.toString(); w.history.replaceState(null, '', w.location.pathname + (qs ? '?' + qs : '') + w.location.hash);
  };
  S.admin = function () { return !S.demo('member'); };

  /* ---------- Mutable state, copied from the page data (never mutates VAANI_DATA records other pages read) ---------- */
  var st = S.st = {};
  S.resetState = function () {
    var member = S.demo('member');
    st.profile = clone(member ? SD.memberProfile : SD.profile);
    if (!member && S.demo('wa-none')) st.profile.whatsapp = { state: 'none' };
    if (!member && S.demo('wa-sent')) st.profile.whatsapp = { state: 'sent', full: '+91 98765 43012', at: DATA._util.ist(0, '10:42') };
    st.notif = {}; SD.notif.forEach(function (g) { g.events.forEach(function (e) { st.notif[e.id] = { email: e.email, wa: e.wa }; }); });
    st.security = clone(SD.security); st.security.twoFactor = !S.demo('twofa-off'); st.security.emailPending = S.demo('email-pending');
    st.sessions = clone(SD.sessions);
    st.workspace = clone(SD.workspace);
    st.members = clone(DATA.org.members).map(function (m) { return { id: m.id, name: m.name, short: m.short, email: m.email, role: m.role, lastActive: m.lastActive, you: m.you, invited: !!m.invited }; });
    if (member) st.members.forEach(function (m) { m.you = m.id === 'u_farah'; });
    if (S.demo('only-member')) st.members = st.members.filter(function (m) { return m.you; });
    if (S.demo('sole-admin')) st.members.forEach(function (m) { if (!m.you && m.role === 'Admin') m.role = 'Member'; });
    st.integrations = clone(SD.integrations);
    if (member) st.integrations.forEach(function (x) { if (x.group === 'yours' && x.account) x.account = 'farah.khan@samplerealty.example'; });
    if (S.demo('int-none')) st.integrations.forEach(function (x) { if (x.state !== 'coming-soon') x.state = 'not-connected'; });
    st.mode = { workspace: '2', mine: '2' };
    st.phone = clone(SD.phone);
    var cid = st.phone.callerId;
    if (S.demo('cid-start')) cid.stage = 'owned';
    if (S.demo('cid-verifying')) cid.stage = 'compliance';
    if (S.demo('cid-failed')) cid.stage = 'failed';
    if (S.demo('inbound-none')) st.phone.inbound.state = 'none';
    if (S.demo('inbound-requested')) st.phone.inbound.state = 'requested';
    if (S.demo('no-flow')) st.phone.inbound.flowId = null;
    st.hours = clone(DATA.org.callingHours.days).map(function (x) { return { day: x.day, open: x.open, from: S.to24(x.from), to: S.to24(x.to) }; });
    st.keys = S.demo('keys-empty') ? [] : clone(SD.apiKeys);
    st.webhooks = S.demo('hooks-empty') ? [] : clone(SD.webhooks);
    st.deliveries = S.demo('hooks-empty') ? [] : clone(SD.deliveries);
    st.embed = clone(SD.embed);
    st.activity = S.demo('activity-empty') ? [] : clone(SD.activity);
    st.exp = { state: S.demo('export-expired') ? 'expired' : S.demo('export-running') ? 'running' : S.demo('export-none') ? 'none' : 'ready', latest: clone(SD.exportLatest) };
    st.reauthAt = 0;
    st.dismissed = {};
  };
  S.to24 = function (s) { var m = /(\d+):(\d+)\s*(am|pm)/i.exec(s || ''); if (!m) return s; var hh = +m[1] % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0); return (hh < 10 ? '0' : '') + hh + ':' + m[2]; };
  S.to12 = function (s) { var p = String(s || '').split(':'), hh = +p[0], mm = p[1] || '00', ap = hh >= 12 ? 'pm' : 'am'; hh = hh % 12 || 12; return hh + (mm === '00' ? '' : ':' + mm) + ' ' + ap; };

  /* People named in read-only notices: the admins, up to 2, then "and 1 more" (§2.3). */
  S.admins = function () { return st.members.filter(function (m) { return m.role === 'Admin' && !m.invited && !m.you; }); };
  S.askAdmin = function () {
    var a = S.admins().map(function (m) { return m.short; });
    if (!a.length) return 'Ask support to assign an admin.';
    var t = 'Ask an admin: ' + (a.length <= 2 ? a.join(' or ') : a.slice(0, 2).join(', ') + ' and ' + (a.length - 2) + ' more'); return /\.$/.test(t) ? t : t + '.';
  };
  S.you = function () { return st.members.filter(function (m) { return m.you; })[0] || st.members[0]; };
  S.soleAdmin = function () { return S.admin() && !S.admins().length; };

  /* ---------- Nav config lookups ---------- */
  var ITEMS = {}; SD.nav.forEach(function (g) { g.items.forEach(function (it) { it.group = g; ITEMS[it.id] = it; }); });
  S.item = function (id) { return ITEMS[id] || null; };
  S.label = function (id) { return ITEMS[id] ? ITEMS[id].label : (SD.subPages[id] || {}).label || 'Settings'; };
  function navOwner(id) { if (ITEMS[id]) return id; var sp = SD.subPages[id]; return sp ? sp.parent : null; }
  function widthOf(id) { var it = ITEMS[id] || SD.subPages[id]; return it && it.width === 'data' ? 'data' : 'form'; }

  /* Computed nav badges (§2.1, N §1.5): one fact, one source. */
  S.badge = function (id) {
    if (id === 'organization' && S.demo('no-admin')) return { text: 'No admin', sr: 'this workspace has no admin' };
    if (id === 'integrations' && st.integrations.some(function (x) { return x.state === 'attention'; })) return { text: 'Reconnect', sr: 'a connection needs you to sign in again' };
    if (id === 'phone') { if (st.phone.inbound.state === 'none') return { text: 'Set up', sr: 'no inbound number' }; if (st.phone.callerId.stage !== 'verified') return { text: 'Verify', sr: 'caller ID not verified' }; }
    if (id === 'webhooks' && st.webhooks.some(function (x) { return x.status === 'failing'; })) return { text: 'Failing', sr: "a webhook’s last 5 deliveries failed" };
    return null;
  };

  /* ---------- Router ---------- */
  var cur = null, booted = false;
  S.route = function () { return cur; };
  S.parse = function (hash) {
    var h = String(hash || '').replace(/^#/, ''); try { h = decodeURIComponent(h); } catch (e) { /* keep raw */ }
    var qi = h.indexOf('?'), q = qi >= 0 ? h.slice(qi + 1) : ''; if (qi >= 0) h = h.slice(0, qi);
    h = h.replace(/^\/+|\/+$/g, '');
    var red = SD.redirects[h] || SD.redirects[h.split('/')[0]] && !S.pages[h.split('/')[0]] && SD.redirects[h.split('/')[0]];
    if (red) return { redirect: red, from: h };
    var parts = h.split('/'), page = parts[0] || 'overview';
    return { page: page, section: parts[1] || null, q: new URLSearchParams(q), hash: h, known: !!S.pages[page] };
  };
  S.href = function (page, section, q) { return '#' + page + (section ? '/' + section : '') + (q ? '?' + q : ''); };
  S.go = function (hash) { if (w.location.hash === hash) S.onHash(); else w.location.hash = hash; };
  S.qp = function (k) { return cur && cur.q.get(k) != null ? cur.q.get(k) : params.get(k); };
  S.clearQ = function () { if (!cur) return; var keep = cur.page + (cur.section ? '/' + cur.section : ''); cur.q = new URLSearchParams(); w.history.replaceState(null, '', w.location.pathname + w.location.search + '#' + keep); };

  S.onHash = function () {
    var r = S.parse(w.location.hash);
    if (r.redirect) {
      if (r.redirect.indexOf('billing:') === 0) { w.location.replace(r.redirect.slice(8)); return; }
      if (r.redirect === 'help:') { w.history.replaceState(null, '', w.location.pathname + w.location.search); V.toast.info('Help and docs live in the account menu.'); r = S.parse(''); }
      else { w.history.replaceState(null, '', w.location.pathname + w.location.search + '#' + r.redirect); r = S.parse('#' + r.redirect); }
    }
    if (cur && S.forms && S.forms.blocking(r, cur)) return;
    var samePage = cur && cur.page === r.page && booted;
    var initial = !booted;
    cur = r; booted = true;
    if (!samePage) render(r, initial);
    else if (S.pages[r.page] && S.pages[r.page].onQuery) S.pages[r.page].onQuery(r);
    if (r.section) setTimeout(function () { S.target(r.section, { focus: true }); }, initial ? 60 : 0);
    else if (!samePage && !initial) S.focusH1();
    else clearTarget();
  };

  /* ---------- Frame rendering ---------- */
  var main, pane, pageEl, h1, meta, acts, crumbs, navEl, cbar;
  S.els = function () { return { main: main, pane: pane, page: pageEl, h1: h1, meta: meta, acts: acts }; };
  S.scroller = function () { return pane && pane.scrollHeight > pane.clientHeight + 1 && getComputedStyle(pane).overflowY !== 'visible' ? pane : (d.scrollingElement || d.documentElement); };

  function renderNav() {
    var id = cur ? navOwner(cur.page) || cur.page : 'overview', html = '';
    SD.nav.forEach(function (g) {
      var gid = 'snav-g-' + g.id;
      html += '<div class="settings-nav-g">' + (g.label ? '<span class="settings-nav-label" id="' + gid + '">' + esc(g.label) + '</span>' : '') +
        '<ul class="settings-nav-list" role="list"' + (g.label ? ' aria-labelledby="' + gid + '"' : '') + '>' + g.items.map(function (it) {
          var b = S.badge(it.id);
          return '<li><a class="settings-nav-item' + (it.danger ? ' settings-nav-item--danger' : '') + '" href="#' + (it.id === 'overview' ? 'overview' : it.id) + '"' + (it.id === id ? ' aria-current="page"' : '') + '><span class="settings-nav-text">' + esc(it.label) + '</span>' +
            (b ? '<span class="nav-badge nav-badge--warn">' + S.icon('triangle-alert', 'xs') + '<span aria-hidden="true">' + esc(b.text) + '</span><span class="sr-only">, ' + esc(b.sr) + '</span></span>' : '') + '</a></li>';
        }).join('') + '</ul></div>';
    });
    navEl.innerHTML = html;
  }
  S.renderNav = function () { if (navEl) renderNav(); };

  S.renderHeader = function () {
    var P = S.pages[cur.page], ov = cur.page === 'overview' || !P;
    h1 = d.getElementById('page-title');
    h1.textContent = !P ? 'Page not found' : ov ? 'Settings' : S.label(cur.page);
    crumbs.hidden = ov; var bk = d.getElementById('settings-back'); if (bk) { var spb = SD.subPages[cur.page]; bk.hidden = ov || !P; bk.setAttribute('href', spb ? '#' + spb.parent : '#overview'); bk.lastChild.textContent = spb ? S.label(spb.parent) : 'Settings'; }
    var sp = SD.subPages[cur.page];
    crumbs.innerHTML = '<a href="#overview">Settings</a>' + S.icon('chevron-right', 'sm') + (sp ? '<a href="#' + sp.parent + '">' + esc(S.label(sp.parent)) + '</a>' + S.icon('chevron-right', 'sm') : '');
    if (S.demo('loading') && P && !ov) meta.innerHTML = '<span class="sk sk--meta settings-sk-meta" aria-hidden="true"></span><span class="sr-only">Loading ' + esc(S.label(cur.page).toLowerCase()) + '…</span>';
    else meta.innerHTML = P && P.meta ? P.meta() : '';
    acts.innerHTML = P && P.actions && !S.demo('page-error') && !S.demo('loading') ? P.actions() : '';
    V.initAll(acts);
  };

  function render(r, initial) {
    var P = S.pages[r.page];
    if (V.overlays && V.overlays.closeAll && !initial) V.overlays.closeAll();
    main.setAttribute('data-width', widthOf(r.page));
    main.setAttribute('data-route', r.page);
    var ov = r.page === 'overview';
    var back = ov ? null : (SD.subPages[r.page] ? '#' + SD.subPages[r.page].parent : '#overview');
    var backLabel = SD.subPages[r.page] ? S.label(SD.subPages[r.page].parent) : 'Settings';
    var changedBack = d.body.getAttribute('data-back-href') !== back || d.body.getAttribute('data-back-label') !== backLabel;
    if (back) { d.body.setAttribute('data-back-href', back); d.body.setAttribute('data-back-label', backLabel); } else { d.body.removeAttribute('data-back-href'); d.body.removeAttribute('data-back-label'); }
    d.title = (P ? (ov ? '' : S.label(r.page) + ' · ') : 'Page not found · ') + 'Settings · Vaani Labs';
    S.renderHeader();
    if (changedBack || initial) V.shell.render();
    renderNav();
    if (S.forms) S.forms.reset();
    var html, own = false;
    if (!P) html = S.notFound();
    else if (S.demo('page-error') && !ov) html = S.pageError();
    else if (S.demo('forbidden') && !ov && /workspace|calling|developer/.test((ITEMS[navOwner(r.page)] || { group: {} }).group.id || '')) html = S.forbidden(r.page);
    else if (S.demo('loading') && !ov) html = P.skeleton ? P.skeleton() : S.skeleton(r.page);
    else { html = P.render(r); own = true; }
    pageEl.innerHTML = html;
    pageEl.setAttribute('aria-busy', S.demo('loading') ? 'true' : 'false');
    V.initAll(pageEl);
    if (own && P.mount) P.mount(pageEl, r);
    if (S.forms) S.forms.scan(pageEl);
    S.applyOffline(pageEl);
    var sc = S.scroller(); if (!initial && !r.section && sc) sc.scrollTop = 0;
  }
  S.rerender = function () { if (!cur) return; var sc = S.scroller(), top = sc ? sc.scrollTop : 0; render(cur, false); if (sc) sc.scrollTop = top; };
  S.refreshMeta = function () { if (!cur) return; var P = S.pages[cur.page]; if (P && P.meta && !S.demo('loading')) meta.innerHTML = P.meta(); renderNav(); };

  S.focusH1 = function () { var t = d.getElementById('page-title'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } };

  /* ---------- Anchors (§0.3): scroll below the sticky header, focus the heading, a static 2 px bar marks the target ---------- */
  function clearTarget() { $$('[data-targeted]', pageEl).forEach(function (x) { x.removeAttribute('data-targeted'); }); }
  S.target = function (id, o) {
    o = o || {}; var sec = $('[data-sec="' + id + '"]', pageEl); if (!sec) return;
    clearTarget(); sec.setAttribute('data-targeted', 'true');
    sec.scrollIntoView({ block: 'start', behavior: V.reducedMotion() || o.instant ? 'auto' : 'smooth' });
    var t = $('.settings-sec-title, [data-anchor-focus]', sec) || sec;
    if (o.focus !== false) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.setAttribute('data-focus-target', ''); t.focus({ preventScroll: true }); }
  };

  /* ---------- Section markup (SettingsSection §14): h2 + Copy link + status slot + description + body ---------- */
  S.sec = function (o) {
    var tid = 'sec-' + o.id + '-t', link = (cur ? cur.page : '') + '/' + o.id;
    return '<section class="settings-sec' + (o.cls ? ' ' + o.cls : '') + '" data-sec="' + o.id + '" aria-labelledby="' + tid + '">' +
      '<div class="settings-sec-head"><h2 class="settings-sec-title" id="' + tid + '" tabindex="-1" data-focus-target>' + esc(o.title) + '</h2>' +
      (o.copy === false ? '' : '<button type="button" class="ibtn ibtn--sm settings-copy" data-act="copy-link" data-link="' + link + '" aria-label="Copy link to ' + esc(o.title) + '"><i data-icon="link" data-size="sm"></i></button>') +
      '<span class="settings-sec-status" data-sec-status role="status">' + (o.status || '') + '</span>' + (o.headEnd || '') + '</div>' +
      (o.desc ? '<p class="settings-sec-desc">' + o.desc + '</p>' : '') +
      (o.form ? '<form class="settings-sec-body" data-form="' + o.form + '" novalidate>' + o.body + S.footHtml() + '</form>' : '<div class="settings-sec-body">' + (o.body || '') + '</div>') +
      '</section>';
  };
  S.footHtml = function () {
    return '<div class="settings-form-err" data-form-error hidden></div><div class="settings-foot" data-form-foot hidden><span class="status status--md" data-form-count>Unsaved changes</span>' +
      '<div class="settings-foot-acts"><p class="dlg-why settings-foot-why" data-form-why hidden></p><button type="button" class="btn btn--tertiary" data-form-discard>Discard</button><button type="submit" class="btn btn--primary" data-form-save>Save changes</button></div></div>';
  };
  S.notice = function (tone, html, o) {
    o = o || {}; var ic = { warning: 'triangle-alert', danger: 'circle-alert', info: 'info', success: 'circle-check', neutral: 'lock' }[tone] || 'info';
    return '<div class="notice notice--' + tone + (o.multi ? ' notice--multi' : '') + (o.cls ? ' ' + o.cls : '') + '"' + (o.role ? ' role="' + o.role + '"' : '') + '>' + S.icon(o.icon || ic) + '<div class="notice-body">' + html + '</div>' + (o.acts ? '<div class="notice-acts">' + o.acts + '</div>' : '') + '</div>';
  };
  S.readOnlyNotice = function (what) { return S.notice('neutral', 'Only admins can ' + what + '. ' + esc(S.askAdmin()), { cls: 'settings-page-notice' }); };
  S.status = function (tone, text, icon) { return '<span class="status status--' + tone + '">' + (icon !== false ? S.icon(icon || { success: 'check', warning: 'triangle-alert', danger: 'circle-x', progress: 'loader-circle' }[tone] || 'info', 'sm', tone === 'progress' ? { className: 'spinner' } : null) : '') + text + '</span>'; };
  S.phone = function (masked, o) { return V.ui.phoneText(masked, o); };

  /* Shared page states (§6) */
  S.skeleton = function (page) {
    var sec = function (n) { var r = ''; for (var i = 0; i < n; i++) r += '<div class="settings-sk-field"><span class="sk sk--meta settings-sk-w1"></span><span class="sk sk--block settings-sk-box"></span></div>'; return r; };
    return '<p class="sr-only">Loading ' + esc(S.label(page).toLowerCase()) + '…</p><div class="settings-sk" aria-hidden="true">' + [3, 2, 2].map(function (n) { return '<div class="settings-sk-sec"><span class="sk sk--title settings-sk-w2"></span><span class="sk settings-sk-w3"></span>' + sec(n) + '</div>'; }).join('') + '</div>';
  };
  S.pageError = function () { return '<div class="empty empty--page" role="alert">' + S.icon('cloud-off', 'lg') + '<h2 class="empty-title">Settings couldn’t load</h2><p>Your settings are safe. This is a problem on our side or with your connection.</p><div class="empty-actions"><button class="btn" type="button" data-act="demo-clear" data-demo="page-error">' + S.icon('refresh-cw') + 'Retry</button></div></div>'; };
  S.forbidden = function (page) { return '<div class="empty empty--page">' + S.icon('lock', 'lg') + '<h2 class="empty-title">Only admins can manage ' + esc(S.label(page).toLowerCase()) + '</h2><p>' + esc(S.askAdmin()) + '</p><div class="empty-actions"><a class="btn" href="#overview">Go back</a></div></div>'; };
  S.notFound = function () { return '<div class="empty empty--page">' + S.icon('search-x', 'lg') + '<h2 class="empty-title">This setting doesn’t exist</h2><p>It may have moved. Every setting is listed on the Settings overview.</p><div class="empty-actions"><a class="btn btn--primary" href="#overview">Go to Settings</a></div></div>'; };
  S.sectionError = function (what) { return '<div class="ierr" role="alert"><div class="ierr-line">' + S.icon('circle-alert') + '<span>Couldn’t load ' + esc(what) + '. <button type="button" class="btn btn--link" data-act="demo-clear" data-demo="section-error">Retry</button></span></div></div>'; };

  /* Offline (§6): Saves and Actions aria-disabled with the reason; switches too; the ConnectionBar above the frame. */
  S.applyOffline = function (root) {
    var off = S.demo('offline'); cbar.hidden = !off;
    cbar.innerHTML = off ? '<div class="cbar" role="status">' + S.icon('cloud-off', 'sm') + '<span><b>You’re offline.</b> Your edits stay on this device until you reconnect.</span></div>' : '';
    if (!off) return;
    $$('[data-instant], .switch, [data-needs-online], [data-form-save]', root).forEach(function (b) { b.setAttribute('aria-disabled', 'true'); if (!b.hasAttribute('data-tooltip')) b.setAttribute('data-tooltip', 'You’re offline.'); });
    $$('[data-form-why]', root).forEach(function (p) { p.hidden = false; p.textContent = 'You’re offline.'; });
  };
  S.blocked = function (el) { if (el && el.getAttribute('aria-disabled') === 'true') { V.announce(el.getAttribute('data-tooltip') || el.getAttribute('data-reason') || 'Not available'); return true; } return false; };

  /* ---------- Delegated actions: [data-act] anywhere (page, header, dialogs and sheets in the portal) ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || !S.acts[b.getAttribute('data-act')]) return;
    if (b.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey)) return;
    if (S.blocked(b)) { e.preventDefault(); return; }
    if (b.tagName === 'A' || b.type === 'submit') e.preventDefault();
    S.acts[b.getAttribute('data-act')](b, e);
  });
  S.act('copy-link', function (b) { S.ui.copy(w.location.href.split('#')[0].split('?')[0] + '#' + b.getAttribute('data-link'), { toast: 'Link copied' }); });
  S.act('demo-clear', function (b) { S.setDemo(b.getAttribute('data-demo'), false); S.rerender(); V.toast.success('Loaded'); });

  /* ---------- Boot ---------- */
  function boot() {
    main = $('#main'); pane = $('#settings-pane'); pageEl = $('#settings-page'); meta = $('#settings-meta'); acts = $('#settings-actions');
    crumbs = $('#settings-crumbs'); navEl = $('#settings-nav'); cbar = $('#settings-cbar');
    S.resetState();
    if (S.demo('member')) { DATA.user = { id: 'u_farah', name: 'Farah Khan', short: 'Farah K.', initials: 'FK', role: 'Member', email: 'farah.khan@samplerealty.example', twoFactor: false }; DATA.org.role = 'Member'; }
    if (S.syncShell) S.syncShell(true);
    w.addEventListener('hashchange', S.onHash);
    S.onHash();
    if (S.boot2) S.boot2();
  }
  S.navOwner = navOwner;

  /* ⌘K "Settings" results reach sections as well as pages (§8, §14), with the Shell §8 synonyms. */
  function palette() {
    if (!V.commandPalette || !V.commandPalette.register) return;
    var here = /settings\.html$/.test(w.location.pathname) ? '' : 'settings.html';
    [['Inbound number', 'phone/inbound', ['DID', 'virtual number', 'incoming']], ['Caller ID', 'phone/caller-id', ['calling number', 'verify number', 'CLI']], ['Transfers', 'phone/transfer', ['call channel', 'forward', 'rep console']],
      ['Calling hours', 'phone/hours', ['hours', 'schedule', 'timing']], ['Test call', 'phone/test', ['call yourself', 'call myself']], ['Two-factor', 'security/two-factor', ['2FA', 'authenticator', 'OTP']],
      ['Where you’re signed in', 'security/sessions', ['sessions', 'sign out everywhere', 'devices']], ['Change email', 'security/email', ['email address', 'login']], ['Members', 'organization/members', ['team', 'roles', 'people']],
      ['Invite teammates…', 'organization?invite=1', ['invite', 'add user']], ['WhatsApp brochure', 'organization/assets', ['brochure', 'shared assets']], ['WhatsApp number', 'profile/whatsapp', ['whatsapp alerts']],
      ['Theme and shortcuts', 'profile/preferences', ['dark mode', 'single-key', 'density']], ['Create API key…', 'api-keys?create=1', ['token', 'key']], ['New webhook…', 'webhooks?create=1', ['webhook', 'endpoint']],
      ['Verifying signatures', 'webhooks/signatures', ['HMAC', 'signature']], ['Webhook deliveries', 'webhook-deliveries', ['redeliver', 'failed deliveries']], ['Assistant mode', 'assistant/workspace-mode', ['autonomy', 'permissions']]
    ].forEach(function (x) { V.commandPalette.register([{ group: 'settings', title: x[0], meta: 'Settings › ' + S.label(x[1].split(/[/?]/)[0]), icon: 'sliders-horizontal', keywords: x[2], perform: function () { if (here) w.location.href = here + '#' + x[1]; else S.go('#' + x[1]); } }]); });
  }
  var prevBoot2 = S.boot2; S.boot2 = function () { if (prevBoot2) prevBoot2(); palette(); };
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})(window, document);
