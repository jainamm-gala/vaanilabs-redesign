/* Not found, no access and page errors (404.html) · 03-pages/00 §15, 02-components-overlay-feedback §16.
   Inside the shell, a plain sentence, one way back and Search. The way back is the landing route (§2.5): Home while setup is
   incomplete, else Cockpit, never the marketing site. Focus is not moved on a hard load (foundation rule); in the app, a route
   change moves focus to the H1, which is focusable here for that reason. */
(function (w, d, V) {
  'use strict';
  if (!V) return;
  var U = V.util, $ = U.$, esc = U.esc, icon = V.icon, DATA = V.data;
  var demo = new URLSearchParams(w.location.search).get('demo') || '';
  var landing = V.setupComplete() ? { label: 'Go to Cockpit', href: 'cockpit.html' } : { label: 'Go to Home', href: 'index.html' };
  var ADMINS = DATA.org.members.filter(function (m) { return m.role === 'Admin' && !m.invited; }).length;
  var ERR = 'GET /api/call-reports · 500 · error id err_5c81d2 · 27 Sep 2026, 11:24 am IST';
  function link(a, cls) { return '<a class="btn ' + (cls || '') + '" href="' + a.href + '">' + esc(a.label) + '</a>'; }
  var SEARCH = '<button class="btn" type="button" data-vaani-action="palette" aria-haspopup="dialog">' + icon('search') + 'Search</button>';

  /* The page matrix (§15.1). H1 = the destination’s label (or "Page not found" for unknown routes), so the page stays identified. */
  var V8 = {
    '': { h1: 'Page not found', doc: 'Page not found · Vaani Labs', ic: 'search-x', head: 'This page doesn’t exist.', body: 'The link may be old, or the page was moved.', acts: link(landing, 'btn--primary') + SEARCH },
    record: { nav: 'leads', h1: 'Leads', doc: 'Not found · Leads · Vaani Labs', ic: 'search-x', head: 'This lead was deleted, or the link is wrong.', body: 'Deleted leads can’t be restored after 7 days.',
      acts: link({ label: 'Go to Leads', href: 'leads.html' }, 'btn--primary') + SEARCH },
    forbidden: { nav: 'knowledge', member: true, crumb: ['Knowledge', 'knowledge.html'], h1: 'Proposals', doc: 'No access · Knowledge · Vaani Labs', ic: 'lock',
      head: 'Only organization admins can review proposals.', body: 'Ask an admin (' + ADMINS + ' in this workspace) to change your role or review them for you.',
      acts: '<button class="btn btn--primary" type="button" data-nf="copy">' + icon('copy') + 'Copy request link</button>' + link({ label: 'Go back', href: 'knowledge.html' }) },
    error: { nav: 'call-reports', h1: 'Call reports', doc: 'Couldn’t load · Call reports · Vaani Labs', ic: 'circle-alert', danger: true,
      head: 'Call reports couldn’t load.', body: 'Your calls are safe. This is a problem on our side or with your connection.',
      acts: '<button class="btn btn--primary" type="button" data-nf="retry">' + icon('refresh-cw') + 'Retry</button>' + link(V.setupComplete() ? { label: 'Go to Cockpit', href: 'cockpit.html' } : landing, 'btn--tertiary'),
      details: true }
  };
  var v = V8[demo] || V8[''];

  /* ---------- render ---------- */
  var block = $('#nf-block');
  if (v.member) DATA.user.role = 'Member';                         /* page-local: a member hits the admins-only route */
  if (v.crumb) {
    d.body.setAttribute('data-back-href', v.crumb[1]); d.body.setAttribute('data-back-label', v.crumb[0]);
    var cr = $('#nf-crumbs'); cr.hidden = false; cr.innerHTML = '<a href="' + v.crumb[1] + '">' + esc(v.crumb[0]) + '</a>' + icon('chevron-right', 'sm');
  }
  $('#page-title').textContent = v.h1;
  block.className = 'empty empty--page nf-block' + (v.danger ? ' empty--danger' : '');
  block.innerHTML = icon(v.ic, 'lg') + '<h2 class="empty-title" id="nf-t">' + esc(v.head) + '</h2><p id="nf-body">' + esc(v.body) + '</p>' +
    '<div class="empty-actions" id="nf-actions">' + v.acts + '</div>' + '<p class="nf-retry" id="nf-retry" hidden></p>' +
    (v.details ? '<details class="details"><summary>Details</summary><div class="raw"><code>' + esc(ERR) + '</code><button type="button" class="ibtn ibtn--sm" data-nf="copy-error" aria-label="Copy error details">' + icon('copy', 'sm') + '</button></div></details>' : '');
  if (v.nav) V.nav.setCurrent(v.nav); else if (v.member) V.shell.render();
  d.title = v.doc;
  V.initAll(block);

  /* ---------- actions ---------- */
  d.getElementById('main').addEventListener('click', function (e) {
    var t = e.target.closest('[data-nf]'); if (!t) return;
    var a = t.getAttribute('data-nf');
    if (a === 'copy') { copy('https://sample-realty.vaanilabs.example/request?route=knowledge-proposals'); V.toast.success('Request link copied. Send it to an admin.'); }
    else if (a === 'copy-error') { copy(ERR); V.toast.success('Error details copied.'); }
    else if (a === 'retry') {
      if (t.getAttribute('aria-busy') === 'true') return;
      t.setAttribute('aria-busy', 'true'); t.innerHTML = icon('loader-circle', null, { className: 'spinner' }) + 'Retrying…';
      setTimeout(function () {
        t.removeAttribute('aria-busy'); t.innerHTML = icon('refresh-cw') + 'Retry';
        var r = $('#nf-retry'); r.hidden = false; r.setAttribute('role', 'alert');
        r.innerHTML = '<span class="status status--md status--danger">' + icon('circle-x', 'md') + '<span>Still couldn’t load. Tried again at 11:24 am.</span></span>';
      }, 1200);
    }
    else if (a === 'session') { V.dialog.open('nf-session', { returnTo: t }); }
  });
  $('#nf-signin').addEventListener('click', function () { V.dialog.close('nf-session', 'done'); V.toast.info('Sign in opens /login?next=… outside this prototype.'); });
  function copy(text) { try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {}); } catch (err) { /* file:// may refuse the clipboard */ } }

  /* ---------- prototype states (not part of the design) ---------- */
  var P = [['', 'Unknown route · NotFound'], ['record', 'Deleted lead · NotFound in Leads'], ['forbidden', 'Member · Forbidden'], ['error', 'Call reports · PageError']];
  $('#nf-proto-list').innerHTML = P.map(function (p) {
    var on = p[0] === demo;
    return '<li><a class="btn btn--sm" href="404.html' + (p[0] ? '?demo=' + p[0] : '') + '"' + (on ? ' aria-current="page"' : '') + '>' + (on ? icon('check', 'sm') : '') + esc(p[1]) + '</a></li>';
  }).join('') + '<li><button class="btn btn--sm" type="button" data-nf="session" aria-haspopup="dialog">' + icon('log-in', 'sm') + 'SessionExpired dialog</button></li>';
})(window, document, window.Vaani);
