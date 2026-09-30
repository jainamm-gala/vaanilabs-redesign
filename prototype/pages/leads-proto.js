/* Vaani Labs prototype · pages/leads-proto.js — "Prototype states": a reviewer-only popover (not part of the product)
   that switches every state 03 §7 lists, deep-linkable as ?demo=a,b. Wallet states use the shell’s ?wallet=. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, $ = U.$, $$ = U.$$, esc = U.esc, L = w.VaaniLeads, S = L.S;
  var GROUPS = [
    ['Page', [['loading', 'Loading (first load)'], ['refreshing', 'Refreshing (rows stay, “Updating…”)'], ['first-use', 'First use: no leads yet'], ['error', 'Error on first load'], ['error-refresh', 'Error on refresh, data on screen'], ['counts-failed', 'Partial: counts didn’t load'], ['calls-failed', 'Partial: last-call details didn’t load'], ['gaps', 'Backend gaps B3–B5: language, outcome and callbacks absent'], ['offline', 'Offline'], ['forbidden', 'No permission to see leads'], ['setup-blocked', 'Setup blocks calling (no verified caller ID)'], ['no-flow', 'No live flow'], ['member', 'Member role (no Reveal, no delete)'], ['page-out', 'Page out of range (page 30)']]],
    ['Call gate · applies the next time it opens', [['gate-hours', 'Outside calling hours'], ['gate-estimate', 'Estimate unavailable (preflight B7 missing)'], ['gate-stale', 'Checks stale: token expired'], ['gate-changed', 'Checks change when you start'], ['gate-fail', 'Start fails once, then Retry works'], ['gate-wallet0', 'Wallet reaches ₹0 while the gate is open']]],
    ['Lead sheet', [['sheet-loading', 'Loading'], ['sheet-deleted', 'Deleted or no access'], ['sheet-calls-failed', 'Calls tab couldn’t load'], ['sheet-save-fail', 'Status change fails to save']]],
    ['New lead and Import', [['create-fail', 'Create lead fails'], ['import-parse-fail', 'The CSV can’t be read'], ['import-stop', 'Import stops part-way']]]
  ];
  var WALLET = [['healthy', 'Healthy ₹2,340.50'], ['low', 'Low ₹42.10'], ['empty', 'Empty ₹0 (calls blocked)'], ['pending', 'Payment pending'], ['autopay-failed', 'Autopay failed']];
  L.readDemo = function () { S.demo = {}; (new URLSearchParams(w.location.search).get('demo') || '').split(',').filter(Boolean).forEach(function (k) { S.demo[k] = true; }); };
  L.syncDemoUrl = function () {
    try { var p = new URLSearchParams(w.location.search), keys = Object.keys(S.demo).filter(function (k) { return S.demo[k]; }); if (keys.length) p.set('demo', keys.join(',')); else p.delete('demo'); var qs = p.toString().replace(/%2C/g, ','); w.history.replaceState(w.history.state, '', w.location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// may refuse */ }
  };
  function body() {
    var ws = V.walletState();
    return '<p class="type-meta-12 u-fg-3">For reviewers only: this panel is not part of the Leads page. Each state can be deep-linked with <span class="u-mono">?demo=</span>.</p>' +
      GROUPS.map(function (g, gi) { return '<fieldset class="fieldset"><legend>' + esc(g[0]) + '</legend>' + g[1].map(function (s) { return '<label class="check check--dense"><input type="checkbox" class="cb" data-demo="' + s[0] + '"' + (S.demo[s[0]] ? ' checked' : '') + '><span class="check-text"><span>' + esc(s[1]) + '</span></span></label>'; }).join('') + '</fieldset>'; }).join('') +
      '<fieldset class="fieldset"><legend>Wallet (reloads the page)</legend>' + WALLET.map(function (x) { return '<label class="check check--dense"><input type="radio" class="radio" name="leads-demo-wallet" value="' + x[0] + '"' + (ws === x[0] ? ' checked' : '') + '><span class="check-text"><span>' + esc(x[1]) + '</span></span></label>'; }).join('') + '</fieldset>' +
      '<fieldset class="fieldset"><legend>Shortcuts to a state</legend><div class="l-cluster">' +
      [['nores', 'Search with no results'], ['nofilter', 'Filters with no results'], ['outside', 'Open a lead outside the results'], ['batch', 'Select 12 leads and call them…'], ['empty-view', 'An empty view']].map(function (a) { return '<button type="button" class="btn btn--sm" data-demo-go="' + a[0] + '">' + esc(a[1]) + '</button>'; }).join('') + '</div></fieldset>';
  }
  L.openProto = function (trigger) { $('#leads-proto-body').innerHTML = body(); V.popover.open(trigger || $('#leads-proto-btn'), 'leads-proto-pop', { placement: 'bottom-end' }); };
  function apply(k, on) {
    if (on) S.demo[k] = true; else delete S.demo[k];
    if (k === 'member') S.role = on ? 'Member' : (V.data.user || {}).role || 'Admin';
    if (k === 'page-out' && on) S.page = 30;
    if (k === 'offline') w.dispatchEvent(new Event(on ? 'offline' : 'online'));
    L.syncDemoUrl(); L.render(); if (L.refreshSheet) L.refreshSheet({ keepScroll: true });
    V.announce((on ? 'On: ' : 'Off: ') + k.replace(/-/g, ' '));
  }
  L.initProto = function () {
    var pop = $('#leads-proto-pop');
    $('#leads-proto-btn').addEventListener('click', function (e) { var b = e.currentTarget; if (b.getAttribute('aria-expanded') === 'true') V.popover.close('leads-proto-pop'); else L.openProto(b); });
    pop.addEventListener('change', function (e) {
      var k = e.target.getAttribute('data-demo'); if (k) { apply(k, e.target.checked); return; }
      if (e.target.name === 'leads-demo-wallet') { var p = new URLSearchParams(w.location.search); if (e.target.value === 'healthy') p.delete('wallet'); else p.set('wallet', e.target.value); w.location.search = p.toString().replace(/%2C/g, ','); }
    });
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-demo-go]'); if (!b) return; var k = b.getAttribute('data-demo-go'); V.popover.close('leads-proto-pop');
      setTimeout(function () {
        if (k === 'nores') { S.view = 'all'; S.filters = {}; L.setQuery('zzqx', true); $('#leads-q').value = 'zzqx'; }
        else if (k === 'nofilter') { S.view = 'all'; S.q = ''; S.filters = { language: { values: ['ta'] }, last_called: { value: 'today' } }; S.page = 1; L.pushUrl(); L.render({ announce: true }); }
        else if (k === 'outside') { S.view = 'interested'; S.q = ''; S.filters = {}; S.page = 1; L.pushUrl(); L.render(); var o = L.all.filter(function (l) { return l.status === 'not_interested' && !l.deleted; })[0]; L.openLead(o.id); }
        else if (k === 'empty-view') { L.all.filter(L.callbackDueToday).forEach(function (l) { l.status = 'contacted'; }); S.view = 'callbacks'; S.q = ''; S.filters = {}; S.page = 1; L.pushUrl(); L.render(); V.toast.info('Prototype: today’s callbacks were marked Contacted, so the view is empty.'); }
        else if (k === 'batch') { S.view = 'all'; S.q = ''; S.filters = {}; S.page = 1; L.pushUrl(); L.render(); var pick = L.last.pageRows.slice(0, 10).concat(L.all.filter(function (l) { return l.status === 'do_not_call'; }).slice(0, 1)).concat(L.all.filter(function (l) { return l.dnd && l.status !== 'do_not_call'; }).slice(0, 1)); L.clearSelection(true); pick.forEach(function (l) { S.sel.ids[l.id] = 1; }); S.sel.n = pick.length; L.syncSelectionUi(); L.renderBulk(); var c = $('#leads-bulk-call'); if (c) { c.focus(); c.click(); } }
      }, 0);
    });
  };
})(window, document);
