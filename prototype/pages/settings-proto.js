/* Vaani Labs prototype · pages/settings-proto.js — PROTOTYPE ONLY, not part of the design. The "Prototype states"
   popover reaches every state the spec lists (§6 shared states and each page’s own) through ?demo=a,b so a state can be
   linked. Flags that shape the loaded data reload the page; one-shot flags (next save fails, conflict…) apply at once. */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, esc = S.esc, $ = S.$, $$ = S.$$;
  var LIVE = ['save-fail', 'conflict', 'instant-fail', 'oauth-error', 'slow', 'offline'];
  var GLOBAL = [['loading', 'Loading (skeletons)'], ['page-error', 'Page failed to load'], ['section-error', 'A section failed to load'], ['offline', 'Offline'], ['save-fail', 'Next section save fails'], ['conflict', 'Next section save conflicts (409)'], ['instant-fail', 'Instant saves fail (Retry works)'], ['slow', 'Slow network'], ['forbidden', 'No access (admin pages)'], ['no-workspace', 'No workspace'], ['no-admin', 'Workspace has no admin'], ['sole-admin', 'You’re the only admin'], ['only-member', 'You’re the only member']];
  var PAGE = {
    overview: [['check', 'status-failed', 'Statuses failed to load'], ['check', 'twofa-off', 'Two-factor off (advisory row)'], ['check', 'cid-verifying', 'Caller ID verifying']],
    profile: [['radio', 'wa', 'WhatsApp number', [['', 'Verified'], ['wa-sent', 'Code sent'], ['wa-none', 'Not added']]]],
    notifications: [['check', 'wa-none', 'No WhatsApp number (column locked)']],
    security: [['check', 'twofa-off', 'Two-factor off'], ['check', 'email-pending', 'Email change pending']],
    integrations: [['check', 'int-none', 'Nothing connected yet'], ['check', 'int-outage', 'HubSpot can’t be reached'], ['check', 'oauth-error', 'Next Connect… fails'], ['link', '?connected=hubspot#integrations', 'Return from HubSpot: connected'], ['link', '?connect_error=closed&app=hubspot#integrations', 'Return from HubSpot: window closed'], ['link', '?connect_error=denied&app=hubspot#integrations', 'Return from HubSpot: permission refused']],
    phone: [['radio', 'cid', 'Caller ID', [['', 'Verified'], ['cid-start', 'Not started'], ['cid-verifying', 'Verifying 2 of 3'], ['cid-failed', 'Check failed']]], ['radio', 'inb', 'Inbound number', [['', 'Ready'], ['inbound-requested', 'Requested'], ['inbound-none', 'None']]], ['check', 'no-flow', 'No live flow'], ['link', '?wallet=empty#phone/test', 'Wallet ₹0 (Test call blocked)']],
    'api-keys': [['check', 'keys-empty', 'No keys yet (first use)']],
    embed: [['check', 'keys-empty', 'No key with the web scope']],
    webhooks: [['check', 'hooks-empty', 'No webhooks yet']],
    'webhook-deliveries': [['check', 'hooks-empty', 'No deliveries yet']],
    activity: [['check', 'activity-empty', 'Nothing recorded yet']],
    export: [['radio', 'ex', 'Latest export', [['', 'Ready'], ['export-expired', 'Link expired'], ['export-running', 'Preparing'], ['export-none', 'None yet']]]],
    delete: [['check', 'sole-admin', 'Sole admin with teammates (blocked)'], ['check', 'only-member', 'Only member (workspace data listed)']],
    organization: [['link', '#organization?invite=1', 'Open with ?invite=1']]
  };
  function apply(k, on) { S.setDemo(k, on); if (LIVE.indexOf(k) >= 0) { if (k === 'offline' || k === 'slow') S.rerender(); render(); V.announce((on ? 'On: ' : 'Off: ') + k); return; } w.location.reload(); }
  function cb(k, label) { return '<label class="check check--dense"><input type="checkbox" class="cb" data-demo="' + k + '"' + (S.demo(k) ? ' checked' : '') + '><span class="check-text">' + esc(label) + '</span></label>'; }
  function render() {
    var body = $('#settings-proto-body'); if (!body) return; var r = S.route() || { page: 'overview' }, p = PAGE[r.page] || [];
    var html = '<p class="settings-proto-intro">Every state the spec lists, without a backend. States are in the URL (<span class="u-mono">?demo=</span>), so you can link one.</p>' +
      '<div class="settings-proto-g"><span class="settings-proto-label" id="sp-role-l">Role</span>' + S.seg('sp-role', 'sp-role-l', [['admin', 'Admin'], ['member', 'Member']], S.demo('member') ? 'member' : 'admin', ' data-demo-seg') + '</div>';
    if (p.length) html += '<div class="settings-proto-g"><span class="settings-proto-label">This page · ' + esc(S.label(r.page)) + '</span>' + p.map(function (x) {
      if (x[0] === 'check') return cb(x[1], x[2]);
      if (x[0] === 'link') return '<a class="btn btn--link settings-proto-link" href="settings.html' + x[1] + '">' + esc(x[2]) + '</a>';
      var cur = x[3].filter(function (o) { return o[0] && S.demo(o[0]); })[0]; cur = cur ? cur[0] : '';
      return '<div class="settings-proto-radio"><span class="settings-proto-sub" id="sp-' + x[1] + '-l">' + esc(x[2]) + '</span>' + S.seg('sp-' + x[1], 'sp-' + x[1] + '-l', x[3].map(function (o) { return [o[0] || 'default', o[1]]; }), cur || 'default', ' data-demo-group="' + x[3].map(function (o) { return o[0]; }).filter(Boolean).join(',') + '"') + '</div>';
    }).join('') + '</div>';
    html += '<div class="settings-proto-g"><span class="settings-proto-label">Everywhere</span>' + GLOBAL.map(function (g) { return cb(g[0], g[1]); }).join('') + '</div>' +
      '<div class="settings-proto-g settings-proto-acts"><button type="button" class="btn btn--sm" data-proto="session">Show “Session expired”</button><button type="button" class="btn btn--sm" data-proto="restored">Leave a dirty edit, then reload</button><button type="button" class="btn btn--sm btn--tertiary" data-proto="reset"' + (S.demoList().length ? '' : ' aria-disabled="true" data-tooltip="Nothing to reset"') + '>Reset all states</button></div>';
    body.innerHTML = html; V.initAll(body);
  }
  d.addEventListener('change', function (e) { var c = e.target.closest && e.target.closest('#settings-proto-body [data-demo]'); if (c) apply(c.getAttribute('data-demo'), c.checked); });
  d.addEventListener('vaani:change', function (e) {
    var g = e.target; if (!g.closest || !g.closest('#settings-proto-body')) return;
    if (g.hasAttribute('data-demo-seg')) { apply('member', e.detail.value === 'member'); return; }
    var grp = g.getAttribute('data-demo-group'); if (!grp) return; grp.split(',').forEach(function (k) { S.setDemo(k, false); }); if (e.detail.value !== 'default') S.setDemo(e.detail.value, true); w.location.reload();
  });
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-proto]'); if (!b || S.blocked(b)) return; var k = b.getAttribute('data-proto');
    if (k === 'reset') { S.demoList().forEach(function (x) { S.setDemo(x, false); }); try { Object.keys(w.sessionStorage).forEach(function (x) { if (x.indexOf('vaani:settings:') === 0) w.sessionStorage.removeItem(x); }); } catch (er) { /* ignore */ } w.location.reload(); }
    if (k === 'session') { V.popover.close('settings-proto-pop'); S.ui.confirm({ title: 'Your session expired', body: 'Sign in again to keep working. Edits on this page stay on this device.', confirmLabel: 'Sign in again', cancelLabel: 'Not now' }).then(function (ok) { if (ok) V.toast.info('Prototype: the sign-in page would open, then bring you back here.'); }); }
    if (k === 'restored') { try { w.sessionStorage.setItem('vaani:settings:dirty:details', JSON.stringify({ name: 'Anika R. Rao', mobile: '98765 43012' })); } catch (er) { /* ignore */ } w.location.hash = '#profile'; w.location.reload(); }
  });
  w.addEventListener('hashchange', function () { setTimeout(render, 0); });
  var prev = S.boot2; S.boot2 = function () { if (prev) prev(); render(); };
})(window, document);
