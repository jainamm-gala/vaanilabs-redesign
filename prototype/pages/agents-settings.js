/* Vaani Labs prototype · pages/agents-settings.js — Agent settings (03-pages/07 §2.11; /personal-agents/settings, here
   agents.html?view=agent-settings): a form page in the 720 column under a nested PageHeader (breadcrumb "Personal
   agents"). Phone number · How your agent reaches you (RadioCards) · What it may do on its own (AutonomyRows:
   Auto · Confirm · Confirm + 2FA per capability, grouped by job; Payments locked) · Default limits. One save model:
   the UnsavedChangesBar (⌘/Ctrl+S; after saving the bar leaves, the changed sections' heads show "Saved 11:24 am" and
   focus stays put unless it was in the bar), and leaving with changes asks first. */
(function (w, d, V, A) {
  'use strict';
  var $ = A.$, $$ = A.$$, esc = A.esc, icon = A.icon, DATA = A.data;
  var S = A.settings = {}, saved, cur, hasNumber = !(A.is('no-number') || A.is('first-use'));
  var WORD = { auto: 'Auto', confirm: 'Confirm', '2fa': 'Confirm + 2FA' };
  function snapshot() { var o = { contact: DATA.contact.pref, calls: DATA.defaults.calls, spend: DATA.defaults.spend, caps: {} }; DATA.capGroups.forEach(function (g) { g.caps.forEach(function (c) { o.caps[c.id] = c.value; }); }); return o; }
  function changed() { var n = 0; if (cur.contact !== saved.contact) n++; if (+cur.calls !== +saved.calls) n++; if (+cur.spend !== +saved.spend) n++; Object.keys(cur.caps).forEach(function (k) { if (cur.caps[k] !== saved.caps[k]) n++; }); return n; }
  function capDef(id) { var c = null; DATA.capGroups.forEach(function (g) { g.caps.forEach(function (x) { if (x.id === id) c = x; }); }); return c; }

  function autonomyRow(c) {
    var v = cur.caps[c.id], id = 'ps-cap-' + c.id, diff = v !== c.def;
    return '<div class="ag-auto-row" id="' + id + '-row"><div class="ag-auto-text"><span class="ag-auto-name" id="' + id + '-n">' + esc(c.label) + (diff ? ' <span class="tag tag--outline">Default: ' + WORD[c.def] + '</span>' : '') + '</span><span class="ag-auto-desc" id="' + id + '-d">' + esc(c.locked ? c.locked : c.desc) + '</span></div>' +
      '<div class="seg seg--sm ag-auto-seg" role="radiogroup" aria-label="' + esc(c.label) + ': what the agent may do on its own" aria-describedby="' + id + '-d" data-cap="' + c.id + '">' +
      ['auto', 'confirm', '2fa'].map(function (k) { return '<button type="button" role="radio" aria-checked="' + (v === k) + '" data-value="' + k + '"' + (c.locked ? ' aria-disabled="true"' : '') + '>' + (c.locked && v === k ? icon('lock', 'xs') : '') + WORD[k] + '</button>'; }).join('') + '</div>' +
      (c.contacts && v === 'auto' ? '<div class="notice notice--neutral ag-auto-note">' + icon('info') + '<span class="notice-body">' + esc(c.label) + ' will run without asking, within each task’s limits.</span></div>' : '') + '</div>';
  }
  function contactCard(k, title, desc, glyph) {
    return '<label class="rcard"><input type="radio" class="radio" name="ps-contact" value="' + k + '"' + (cur.contact === k ? ' checked' : '') + '><span class="ag-svc" aria-hidden="true">' + glyph + '</span><span class="rcard-body"><span class="rcard-title">' + title + '</span><span class="rcard-desc">' + desc + '</span></span></label>';
  }
  var WA = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1z"/><path d="M9 8.5c0 3 2.5 6.5 6 6.5l1-1.6-2-1-1 .9c-1-.4-2.3-1.7-2.7-2.7l.9-1-1-2z"/></svg>';
  /* Section head: h2 + one-line description, plus (editable sections) the slot where "Saved 11:24 am" shows after a save
     (O §18.3). The slot is not a live region: the save is announced once, however many sections it touched. */
  function secHead(key, title, desc, slot) {
    return '<div class="form-section-head"><div class="ag-sec-row"><h2 class="form-section-title" id="ps-' + key + '-h">' + title + '</h2>' +
      (slot ? '<span class="ag-sec-status" id="ps-' + key + '-st"></span>' : '') + '</div><p class="form-section-desc">' + desc + '</p></div>';
  }
  /* which sections hold unsaved changes (the section each changed field lives in) */
  function dirtySecs() {
    var s = []; if (cur.contact !== saved.contact) s.push('con');
    if (Object.keys(cur.caps).some(function (k) { return cur.caps[k] !== saved.caps[k]; })) s.push('aut');
    if (+cur.calls !== +saved.calls || +cur.spend !== +saved.spend) s.push('lim');
    return s;
  }
  function toastMs() { var v = String(w.getComputedStyle(d.documentElement).getPropertyValue('--timing-toast')).trim(), n = parseFloat(v); return n > 0 ? (/ms$/.test(v) ? n : n * 1000) : 6000; }
  var flashT = null;
  function clearStatus(keys) { (keys || ['con', 'aut', 'lim']).forEach(function (k) { var s = d.getElementById('ps-' + k + '-st'); if (s) s.innerHTML = ''; }); }
  S.render = function () {
    var C = DATA.contact, member = A.role !== 'admin';
    A.header({ title: 'Agent settings', meta: '', crumbs: '<a href="agents.html?view=personal-agents">Personal agents</a><span aria-hidden="true">' + icon('chevron-right', 'xs') + '</span>', desc: 'Choose what your agent may do on its own and how it reaches you.', actions: '' });
    var num = hasNumber ? A.kv([['Number', '<span class="phone-text" translate="no">' + esc(DATA.number.masked) + '</span>'], ['Assigned', 'by ' + esc(DATA.number.assignedBy) + ' on ' + V.fmt.dateShort(DATA.number.assignedAt)]], 'kv--rows')
      : '<div class="notice notice--warning">' + icon('triangle-alert') + '<div class="notice-body"><b class="notice-title">No phone number yet.</b> Only an admin can assign one.</div><div class="notice-acts">' + (member ? '<button type="button" class="notice-act" data-pa="ask-admin">Ask an admin</button>' : '<a class="notice-act" href="settings.html#phone">Assign a number</a>') + '</div></div>';
    $('#ps-view').innerHTML = '<div class="l-container l-container--form l-page ag-ps"><form class="form" id="ps-form" novalidate aria-labelledby="page-title">' +
      '<section class="form-section" id="number" aria-labelledby="ps-num-h">' + secHead('num', 'Phone number', 'The number your agent calls and messages from.') + num + '</section>' +
      '<section class="form-section" id="contact" aria-labelledby="ps-con-h">' + secHead('con', 'How your agent reaches you', 'Where it asks for approval and sends results.', true) +
        '<fieldset class="fieldset"><legend class="sr-only">How your agent reaches you</legend><div class="ag-rcards-1">' + contactCard('whatsapp', 'WhatsApp', 'Messages you at <span class="phone-text" translate="no">' + esc(C.whatsapp) + '</span>. You can reply to approve.', WA) +
        contactCard('call', 'Call', 'Calls you at <span class="phone-text" translate="no">' + esc(C.call) + '</span> to confirm and report.', icon('phone')) + contactCard('email', 'Email', 'Emails you at ' + esc(C.email) + '.', icon('mail')) + '</div></fieldset></section>' +
      '<section class="form-section" id="autonomy" aria-labelledby="ps-aut-h">' + secHead('aut', 'What it may do on its own', 'Applies to every task. Calls and messages always stay within each task’s limits.', true) +
        A.kv([['Auto', 'Does it without asking.'], ['Confirm', 'Pauses and asks you first.'], ['Confirm + 2FA', 'Asks you, then you confirm with your second factor.']], 'ag-legend') +
        DATA.capGroups.map(function (g) { return '<div class="ag-auto-group" role="group" aria-labelledby="ps-g-' + g.id + '"><h3 class="ag-h3" id="ps-g-' + g.id + '">' + esc(g.label) + '</h3>' + g.caps.map(autonomyRow).join('') + '</div>'; }).join('') +
        '<div><button type="button" class="btn btn--tertiary" id="ps-reset">' + icon('rotate-ccw') + 'Reset to defaults…</button></div></section>' +
      '<section class="form-section" id="limits" aria-labelledby="ps-lim-h">' + secHead('lim', 'Default limits', 'New tasks start with these. You can change them per task.', true) +
        '<div class="ag-grid2"><div class="field"><label class="field-label" for="ps-calls">Calls per task</label><div class="input"><input id="ps-calls" inputmode="numeric" value="' + esc(cur.calls) + '" aria-describedby="ps-calls-h ps-calls-e"></div><p class="field-hint" id="ps-calls-h">1 to 200</p><p class="field-error" id="ps-calls-e" hidden></p></div>' +
        '<div class="field"><label class="field-label" for="ps-spend">Spend per task</label><div class="input"><span class="input-prefix">₹</span><input id="ps-spend" inputmode="decimal" value="' + esc(cur.spend) + '" aria-describedby="ps-spend-h ps-spend-e"></div><p class="field-hint" id="ps-spend-h">₹50 to ₹10,000</p><p class="field-error" id="ps-spend-e" hidden></p></div></div>' +
        A.kv([['Calling hours', '10 am to 7 pm IST · workspace setting' + (member ? '' : ' · <a href="settings.html#phone">Change in Phone setup</a>')]], 'kv--rows') + '</section></form>' +
      '<div class="savebar ag-savebar" role="region" aria-label="Unsaved changes" id="ps-bar" hidden><span class="savebar-text" id="ps-bar-t" role="status"></span><button class="btn btn--tertiary btn--sm" type="button" id="ps-discard">Discard</button><button class="btn btn--primary btn--sm" type="button" id="ps-save" aria-keyshortcuts="Control+S" data-tooltip="Save changes" data-kbd="mod+s">Save changes</button></div></div>';
    V.initAll($('#ps-view')); S.bar();
    if (w.location.hash) { var t = d.getElementById(w.location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView({ block: 'start' }); }, 0); }
  };
  S.bar = function () {
    var n = changed(), b = $('#ps-bar'); if (!b) return; var was = !b.hidden; b.hidden = !n; $('#ps-bar-t').textContent = n ? 'Unsaved changes · ' + n + ' field' + (n === 1 ? '' : 's') : '';
    if (n) clearStatus(dirtySecs());   /* a section being edited again no longer reads "Saved" */
    if (!was && n) V.announce('Unsaved changes');
  };
  function validate() {
    var ok = true; [['ps-calls', 1, 200, 'Enter a number from 1 to 200.'], ['ps-spend', 50, 10000, 'Enter an amount from ₹50 to ₹10,000.']].forEach(function (x) {
      var i = d.getElementById(x[0]), v = +String(i.value).replace(/[₹,\s]/g, ''), bad = !(v >= x[1] && v <= x[2] && (x[0] !== 'ps-calls' || Number.isInteger(v))), e = d.getElementById(x[0] + '-e');
      e.hidden = !bad; e.innerHTML = bad ? icon('circle-alert', 'sm') + '<span>' + x[3] + '</span>' : ''; i.setAttribute('aria-invalid', bad ? 'true' : 'false'); if (bad && ok) { i.focus(); ok = false; } });
    return ok;
  }
  S.save = function () {
    if (!changed()) return false; if (!validate()) return;
    var btn = $('#ps-save'); if (btn.getAttribute('aria-busy') === 'true') return; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = icon('loader-circle', 'sm', { className: 'spinner' }) + 'Saving…';
    setTimeout(function () {
      var secs = dirtySecs(), bar = $('#ps-bar'), a = d.activeElement;
      /* focus moves only if it would be lost: it sat in the bar that is about to hide (Save clicked), or nowhere */
      var moveFocus = !a || a === d.body || !d.contains(a) || (bar && bar.contains(a));
      DATA.contact.pref = cur.contact; DATA.defaults.calls = +cur.calls; DATA.defaults.spend = +cur.spend; DATA.capGroups.forEach(function (g) { g.caps.forEach(function (c) { c.value = cur.caps[c.id]; }); });
      saved = JSON.parse(JSON.stringify(cur)); btn.removeAttribute('aria-busy'); btn.textContent = 'Save changes'; S.bar();
      /* O §18.3: the bar leaves and each section that changed shows StatusText "Saved 11:24 am" for --timing-toast */
      var at = V.fmt.time(V.fmt.now().toISOString()), html = '<span class="status status--success">' + icon('check', 'sm') + '<span>Saved ' + esc(at) + '</span></span>';
      clearTimeout(flashT); clearStatus(); secs.forEach(function (k) { var s = d.getElementById('ps-' + k + '-st'); if (s) s.innerHTML = html; });
      flashT = setTimeout(function () { clearStatus(); }, toastMs());
      V.announce('Saved ' + at);
      if (moveFocus && secs.length) { var h = d.getElementById('ps-' + secs[0] + '-h'); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-focus-target', ''); h.focus(); } }
    }, 600);
  };
  S.discard = function () { cur = JSON.parse(JSON.stringify(saved)); S.render(); var h = $('#page-title'); if (h) h.focus(); V.announce('Changes discarded'); };
  S.dirty = function () { return !!cur && changed() > 0; };

  S.boot = function () {
    saved = snapshot(); cur = JSON.parse(JSON.stringify(saved)); S.render();
    d.addEventListener('vaani:change', function (e) {
      var g = e.target.closest && e.target.closest('[data-cap]'); if (!g) return; var id = g.getAttribute('data-cap'), c = capDef(id);
      cur.caps[id] = e.detail.value; var row = d.getElementById('ps-cap-' + id + '-row'); row.outerHTML = autonomyRow(c); V.initAll(d.getElementById('ps-cap-' + id + '-row'));
      var nb = $('#ps-cap-' + id + '-row [role="radio"][aria-checked="true"]'); if (nb) nb.focus(); S.bar();
    });
    d.addEventListener('change', function (e) { if (e.target.name === 'ps-contact') { cur.contact = e.target.value; S.bar(); } });
    d.addEventListener('input', function (e) { if (e.target.id === 'ps-calls') { cur.calls = e.target.value; S.bar(); } else if (e.target.id === 'ps-spend') { cur.spend = String(e.target.value).replace(/[₹,\s]/g, ''); S.bar(); } });
    d.addEventListener('click', function (e) {
      if (e.target.closest('#ps-save')) S.save(); else if (e.target.closest('#ps-discard')) S.discard();
      else if (e.target.closest('#ps-reset')) {
        var n = 0; DATA.capGroups.forEach(function (g) { g.caps.forEach(function (c) { if (cur.caps[c.id] !== c.def) n++; }); });
        if (!n) { V.toast.info('Everything already matches the defaults.'); return; }
        V.dialog.confirm({ title: 'Reset what your agent may do on its own?', body: 'Your ' + n + ' change' + (n === 1 ? '' : 's') + ' go back to the defaults. Save to apply.', confirmLabel: 'Reset to defaults', tone: 'danger', returnTo: e.target.closest('#ps-reset') })
          .then(function (ok) { if (!ok) return; DATA.capGroups.forEach(function (g) { g.caps.forEach(function (c) { cur.caps[c.id] = c.def; }); }); S.render(); $('#ps-reset').focus(); });
      } else {
        var a = e.target.closest('a[href]'); if (!a || !S.dirty() || e.defaultPrevented || a.getAttribute('href').charAt(0) === '#') return;
        e.preventDefault(); var href = a.href;
        V.dialog.confirm({ title: 'Discard changes to Agent settings?', body: 'You have ' + changed() + ' unsaved change' + (changed() === 1 ? '' : 's') + '. They will be lost.', confirmLabel: 'Discard changes', tone: 'danger', returnTo: a }).then(function (ok) { if (ok) { saved = cur; w.location.href = href; } });
      }
    }, true);
    V.shortcuts.register('mod+s', function () { if (A.view !== 'agent-settings') return false; if (S.save() === false) V.announce('No changes to save'); }, { description: 'Save changes', group: 'Forms', inFields: true });
    w.addEventListener('beforeunload', function (e) { if (S.dirty()) { e.preventDefault(); e.returnValue = ''; } });
  };
})(window, document, window.Vaani, window.VaaniAgents);
