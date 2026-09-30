/* Vaani Labs prototype · pages/settings-forms.js — the per-section save model (03-pages/06 §4):
   Section form (SectionFooter only while dirty, count of changed fields, Discard with Undo, "Saved 11:24 am", InlineError
   with Retry, 409 conflict with "Discard mine" / "Replace their version"), the UnsavedChangesBar as the off-screen reminder
   (always on phones), the navigation guard (sub-nav, sidebar, back, tab close), sessionStorage restore after a reload,
   Cmd/Ctrl+S, and the Instant model (optimistic, "Saved", revert with Retry). */
(function (w, d) {
  'use strict';
  var S = w.VaaniSettings, V = S.V, U = V.util, esc = S.esc, $ = S.$, $$ = S.$$, F = S.F;
  var defs = {}, live = {}, forms = S.forms = {};
  S.formDef = function (id, def) { defs[id] = def; };
  var KEY = 'vaani:settings:dirty:';
  function sget(id) { try { var v = w.sessionStorage.getItem(KEY + id); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function sset(id, v) { try { w.sessionStorage.setItem(KEY + id, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  function sdel(id) { try { w.sessionStorage.removeItem(KEY + id); } catch (e) { /* ignore */ } }
  function norm(x) { return String(x == null ? '' : x).trim(); }

  function read(form) {
    var v = {};
    $$('[name]', form).forEach(function (el) {
      if (el.type === 'radio') { if (!(el.name in v)) v[el.name] = ''; if (el.checked) v[el.name] = el.value; }
      else if (el.type === 'checkbox') v[el.name] = el.checked ? '1' : '';
      else v[el.name] = el.value;
    });
    return v;
  }
  function write(form, vals) {
    $$('[name]', form).forEach(function (el) {
      if (!(el.name in vals)) return;
      if (el.type === 'radio') el.checked = el.value === vals[el.name];
      else if (el.type === 'checkbox') el.checked = !!vals[el.name];
      else el.value = vals[el.name];
    });
    var id = form.getAttribute('data-form'); if (defs[id] && defs[id].onWrite) defs[id].onWrite(form, vals);
  }
  forms.read = read; forms.write = write;
  function changed(L) { var v = read(L.form); return Object.keys(L.saved).filter(function (k) { return norm(v[k]) !== norm(L.saved[k]); }); }
  function secOf(L) { return L.form.closest('.settings-sec'); }
  function statusSlot(L) { return $('[data-sec-status]', secOf(L)); }
  function flash(L, html, ms) { var s = statusSlot(L); if (!s) return; clearTimeout(L.flashT); s.innerHTML = html; L.flashT = setTimeout(function () { s.innerHTML = ''; }, ms || 6000); }
  function focusHead(L) { var t = $('.settings-sec-title', secOf(L)); if (t) t.focus({ preventScroll: false }); }

  forms.reset = function () { Object.keys(live).forEach(function (k) { clearTimeout(live[k].flashT); }); live = {}; syncBar(); syncUnload(); };
  forms.scan = function (root) {
    $$('form[data-form]', root).forEach(function (f) {
      var id = f.getAttribute('data-form'), def = defs[id] || {};
      var L = live[id] = { id: id, form: f, def: def, saved: def.saved ? def.saved() : read(f), label: def.label || ($('.settings-sec-title', f.closest('.settings-sec')) || {}).textContent || 'this section' };
      if (def.readOnly && def.readOnly()) { $('[data-form-foot]', f).remove(); return; }
      var stored = sget(id);
      if (stored && Object.keys(L.saved).some(function (k) { return k in stored && norm(stored[k]) !== norm(L.saved[k]); })) {
        write(f, stored); L.restored = true;
        flash(L, '<span class="status status--progress">' + S.icon('history', 'sm') + 'Restored your unsaved edits · <button type="button" class="btn btn--link" data-form-discard-restored>Discard</button></span>', 20000);
      }
      update(id);
    });
    syncBar();
  };
  forms.dirty = function () { return Object.keys(live).map(function (k) { return live[k]; }).filter(function (L) { return L.dirty; }); };
  forms.live = function (id) { return live[id]; };
  forms.markSaved = function (id) { var L = live[id]; if (!L) return; L.saved = L.def.saved ? L.def.saved() : read(L.form); update(id); };

  function update(id) {
    var L = live[id]; if (!L) return;
    var ch = changed(L); L.dirty = ch.length > 0;
    var foot = $('[data-form-foot]', L.form); if (!foot) return;
    foot.hidden = !L.dirty;
    $('[data-form-count]', L.form).textContent = 'Unsaved changes · ' + ch.length + ' field' + (ch.length === 1 ? '' : 's');
    if (L.dirty) sset(id, read(L.form)); else { sdel(id); setConflict(L, false); var er = $('[data-form-error]', L.form); if (er && !L.keepErr) { er.hidden = true; er.innerHTML = ''; } }
    if (L.def.onChange) L.def.onChange(read(L.form), L.form);
    syncBar(); syncUnload();
  }
  forms.update = update;

  /* Field validation timing (C §8.2): on blur when non-empty; refresh an error that is showing while typing; all on submit. */
  function fieldErrors(L) { return L.def.validate ? L.def.validate(read(L.form), L.form) || {} : {}; }
  function inputFor(L, name) { return $('[name="' + name + '"]', L.form); }
  d.addEventListener('focusout', function (e) {
    var el = e.target, f = el.closest && el.closest('form[data-form]'); if (!f || !el.name) return; var L = live[f.getAttribute('data-form')]; if (!L) return;
    var msg = fieldErrors(L)[el.name]; if (norm(el.value) && msg) S.ui.setError(el, msg); else if (!msg) S.ui.setError(el, '');
  });
  function onEdit(e) {
    var f = e.target.closest && e.target.closest('form[data-form]'); if (!f) return; var L = live[f.getAttribute('data-form')]; if (!L) return;
    if (e.target.getAttribute('aria-invalid') === 'true') S.ui.setError(e.target, fieldErrors(L)[e.target.name] || '');
    L.keepErr = false; update(L.id);
  }
  d.addEventListener('input', onEdit); d.addEventListener('change', onEdit);
  d.addEventListener('submit', function (e) { var f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); save(f.getAttribute('data-form')); });

  function save(id, o) {
    o = o || {}; var L = live[id]; if (!L || L.busy) return;
    if (S.demo('offline')) { V.announce('You’re offline. Your edits stay on this device until you reconnect.'); return; }
    if (!L.dirty && !o.force) return;
    var v = read(L.form), errs = fieldErrors(L), first = null, n = 0;
    Object.keys(v).forEach(function (k) { var inp = inputFor(L, k); if (!inp) return; S.ui.setError(inp, errs[k] || ''); if (errs[k]) { n += 1; if (!first) first = inp; } });
    Object.keys(errs).forEach(function (k) { if (errs[k] && !(k in v) && L.def.showError) { L.def.showError(k, errs[k]); n += 1; } });
    if (n) { if (first) first.focus(); V.announce(n === 1 ? 'Check 1 field.' : 'Check ' + n + ' fields.'); return; }
    Promise.resolve(L.def.confirm && !o.replace ? L.def.confirm(v, L.saved) : true).then(function (go) {
      if (!go) return;
      var btns = [$('[data-form-save]', L.form)], bar = $('#settings-savebar');
      if (bar._target === id) btns.push($('[data-bar-save]', bar));
      L.busy = true; btns.forEach(function (b) { S.ui.busy(b, 'Saving…'); });
      S.ui.wait(700).then(function () {
        L.busy = false; btns.forEach(function (b) { S.ui.unbusy(b); });
        if (S.demo('save-fail')) { S.setDemo('save-fail', false); fail(L); return; }
        if (S.demo('conflict') && !o.replace) { S.setDemo('conflict', false); setConflict(L, true); return; }
        commit(L, v);
      });
    });
  }
  forms.save = save;
  function commit(L, v) {
    if (L.def.commit) L.def.commit(v);
    L.saved = L.def.saved ? L.def.saved() : v; L.keepErr = false;
    sdel(L.id); setConflict(L, false); var er = $('[data-form-error]', L.form); er.hidden = true; er.innerHTML = '';
    update(L.id);
    flash(L, S.status('success', 'Saved ' + F.time(S.DATA.meta.now)));
    focusHead(L); S.refreshMeta();
    if (L.def.after) L.def.after(v);
  }
  function fail(L) {
    var er = $('[data-form-error]', L.form); L.keepErr = true; er.hidden = false;
    er.innerHTML = '<div class="ierr" role="alert"><div class="ierr-line">' + S.icon('circle-alert') + '<span>Couldn’t save ' + esc(L.label) + '. Your edits are kept. <button type="button" class="btn btn--link" data-form-retry>Retry</button></span></div>' +
      '<details class="details settings-err-details"><summary>Details</summary><div class="raw"><code>PATCH /api/settings/' + esc(L.id) + ' · 503 Service Unavailable · request req_7c21e0</code></div></details></div>';
  }
  function setConflict(L, on) {
    L.conflict = on; var er = $('[data-form-error]', L.form);
    var dis = $('[data-form-discard]', L.form), sv = $('[data-form-save]', L.form);
    if (dis) dis.textContent = on ? 'Discard mine' : 'Discard'; if (sv && !L.busy) sv.textContent = on ? 'Replace their version' : 'Save changes';
    if (on) { L.keepErr = true; er.hidden = false; er.innerHTML = S.notice('warning', '<b>' + esc((S.admins()[0] || { short: 'Rohit S.' }).short) + ' changed ' + esc(L.label) + ' at ' + F.time(S.DATA.meta.now) + '.</b> Your edits are kept. Keep yours with Replace their version, or load theirs with Discard mine.', { role: 'alert' }); }
    syncBar();
  }
  function discard(id) {
    var L = live[id]; if (!L) return;
    if (L.conflict) {
      var theirs = L.def.theirs ? L.def.theirs(L.saved) : L.saved; if (L.def.commit) L.def.commit(theirs); L.saved = L.def.saved ? L.def.saved() : theirs;
      write(L.form, L.saved); clearErrors(L); L.keepErr = false; setConflict(L, false); update(id); flash(L, S.status('progress', 'Loaded their version', 'history')); focusHead(L); S.refreshMeta(); return;
    }
    var typed = read(L.form); write(L.form, L.saved); clearErrors(L); L.keepErr = false; update(id); L.undo = typed;
    flash(L, '<span class="status">Changes discarded · <button type="button" class="btn btn--link" data-form-undo="' + id + '">Undo</button></span>');
    focusHead(L);
  }
  function clearErrors(L) { $$('[aria-invalid="true"]', L.form).forEach(function (x) { S.ui.setError(x, ''); }); var er = $('[data-form-error]', L.form); if (er) { er.hidden = true; er.innerHTML = ''; } }
  forms.discardAll = function () { forms.dirty().forEach(function (L) { write(L.form, L.saved); clearErrors(L); update(L.id); }); Object.keys(live).forEach(sdel); };

  d.addEventListener('click', function (e) {
    var t = e.target, f = t.closest('form[data-form]'), L = f && live[f.getAttribute('data-form')];
    if (t.closest('[data-form-discard]') && L) { discard(L.id); return; }
    if (t.closest('[data-form-retry]') && L) { save(L.id, { force: true }); return; }
    if (t.closest('[data-form-discard-restored]') && L) { write(L.form, L.saved); update(L.id); statusSlot(L).innerHTML = ''; focusHead(L); return; }
    var u = t.closest('[data-form-undo]'); if (u) { var X = live[u.getAttribute('data-form-undo')]; if (X && X.undo) { write(X.form, X.undo); update(X.id); statusSlot(X).innerHTML = ''; var fi = $('input, textarea', X.form); if (fi) fi.focus(); } return; }
    if (t.closest('[data-bar-save]')) { var bar = $('#settings-savebar'), B = live[bar._target]; if (B && B.conflict) save(B.id, { replace: true, force: true }); else if (B) save(B.id); return; }
    if (t.closest('[data-bar-discard]')) { discard($('#settings-savebar')._target); return; }
    if (t.closest('[data-bar-review]')) { var R = forms.dirty()[0]; if (R) { secOf(R).scrollIntoView({ block: 'start', behavior: V.reducedMotion() ? 'auto' : 'smooth' }); var sb = $('[data-form-save]', R.form); if (sb) sb.focus({ preventScroll: true }); } }
  });
  /* The conflict’s "Replace their version" is the footer Save; plain Save otherwise. */
  d.addEventListener('click', function (e) { var sv = e.target.closest('[data-form-save]'); if (!sv) return; var f = sv.closest('form[data-form]'), L = f && live[f.getAttribute('data-form')]; if (L && L.conflict) { e.preventDefault(); save(L.id, { replace: true, force: true }); } }, true);

  /* ---------- UnsavedChangesBar (§4.3) ---------- */
  function viewport() { var sc = S.scroller(); if (sc === d.scrollingElement || sc === d.documentElement) return { top: 0, bottom: w.innerHeight }; var r = sc.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }
  function footVisible(L) { var f = $('[data-form-foot]', L.form); if (!f || f.hidden || !f.offsetHeight) return false; var r = f.getBoundingClientRect(), vp = viewport(), half = r.height / 2; return r.bottom > vp.top + half && r.top < vp.bottom - half; }
  function inView(L) { var r = secOf(L).getBoundingClientRect(), vp = viewport(); return r.bottom > vp.top && r.top < vp.bottom; }
  var barShown = false;
  function syncBar() {
    var bar = $('#settings-savebar'); if (!bar) return;
    var dirty = forms.dirty(), phone = V.bp.phone(), off = dirty.filter(function (L) { return !footVisible(L); });
    if (!dirty.length || (!phone && !off.length)) { bar.hidden = true; barShown = false; bar._key = ''; bar._target = null; bar.innerHTML = ''; return; }
    var html, L = null;
    if (dirty.length === 1 || phone) {
      L = phone ? (dirty.filter(inView)[0] || dirty[0]) : off[0];
      html = '<span class="savebar-text">Unsaved changes in ' + esc(L.label) + (phone && dirty.length > 1 ? ' · 1 of ' + dirty.length + ' sections' : '') + '</span>' +
        '<button type="button" class="btn btn--tertiary" data-bar-discard>' + (L.conflict ? 'Discard mine' : 'Discard') + '</button><button type="button" class="btn btn--primary" data-bar-save' + (S.demo('offline') ? ' aria-disabled="true" data-tooltip="You’re offline."' : '') + '>' + (L.conflict ? 'Replace their version' : 'Save') + '</button>';
    } else html = '<span class="savebar-text">Unsaved changes in ' + dirty.length + ' sections</span><button type="button" class="btn btn--primary" data-bar-review>Review</button>';
    if (bar._key !== html && !(L && L.busy)) { bar.innerHTML = html; bar._key = html; }
    bar._target = L ? L.id : null;
    if (!barShown) { bar.hidden = false; barShown = true; V.announce(L ? 'Unsaved changes in ' + L.label : 'Unsaved changes in ' + dirty.length + ' sections', { dedupeKey: 'savebar' }); }
  }
  forms.syncBar = syncBar;
  var raf = 0; function later() { if (!raf) raf = w.requestAnimationFrame(function () { raf = 0; syncBar(); }); }
  w.addEventListener('scroll', later, { passive: true }); w.addEventListener('resize', later);
  d.addEventListener('DOMContentLoaded', function () { var p = $('#settings-pane'); if (p) p.addEventListener('scroll', later, { passive: true }); });
  V.on('breakpoint', later);

  /* ---------- Navigation guard (§4.5) ---------- */
  function unload(e) { e.preventDefault(); e.returnValue = ''; return ''; }
  var unloadOn = false;
  function syncUnload() { var need = forms.dirty().length > 0; if (need && !unloadOn) w.addEventListener('beforeunload', unload); if (!need && unloadOn) w.removeEventListener('beforeunload', unload); unloadOn = need; }
  forms.guard = function () {
    var dirty = forms.dirty(); if (!dirty.length) return Promise.resolve(true);
    var one = dirty.length === 1, n = one ? changed(dirty[0]).length : 0;
    return S.ui.confirm({
      title: one ? 'Discard changes to ' + dirty[0].label + '?' : 'Discard changes on ' + S.label(S.route().page) + '?',
      body: one ? 'You changed ' + n + ' field' + (n === 1 ? '' : 's') + ' and haven’t saved ' + (n === 1 ? 'it' : 'them') + '.' : dirty.map(function (L) { return L.label; }).join(' and ') + ' have unsaved changes.',
      confirmLabel: 'Discard', cancelLabel: 'Keep editing', tone: 'danger'
    }).then(function (ok) { if (ok) forms.discardAll(); return ok; });
  };
  forms.blocking = function (r, cur) {
    if (r.page === cur.page || !forms.dirty().length) return false;
    var target = w.location.hash;
    w.history.replaceState(null, '', w.location.pathname + w.location.search + '#' + (cur.hash || 'overview'));
    forms.guard().then(function (ok) { if (ok) w.location.hash = target; });
    return true;
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    if (!forms.dirty().length) return;
    var url; try { url = new URL(a.getAttribute('href'), w.location.href); } catch (x) { return; }
    if (url.pathname === w.location.pathname && url.search === w.location.search) return; /* same document: the hashchange guard decides */
    e.preventDefault(); e.stopPropagation();
    forms.guard().then(function (ok) { if (ok) { syncUnload(); w.location.href = a.href; } });
  }, true);

  /* ---------- Instant model (§4.1): optimistic; "Saved" for --timing-toast; revert with "Couldn’t save. Retry" ---------- */
  S.instant = function (o) {
    o.apply();
    var slot = o.slot; if (!slot) return;
    clearTimeout(slot._t); slot.classList.remove('setting-row-status--danger');
    S.ui.wait(350).then(function () {
      if (S.demo('instant-fail') && !o.retry) {
        o.revert(); slot.classList.add('setting-row-status--danger');
        slot.innerHTML = 'Couldn’t save. <button type="button" class="btn btn--link" data-instant-retry>Retry</button>';
        slot._retry = function () { o.retry = true; S.instant(o); }; return;
      }
      slot.innerHTML = S.status('success', 'Saved'); slot._t = setTimeout(function () { slot.innerHTML = ''; }, 6000);
    });
  };
  d.addEventListener('click', function (e) { var r = e.target.closest('[data-instant-retry]'); if (!r) return; var slot = r.parentNode; if (slot._retry) slot._retry(); });

  /* ---------- Cmd/Ctrl+S (§8) ---------- */
  function boot2() {
    V.shortcuts.register('mod+s', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var a = d.activeElement, f = a && a.closest && a.closest('form[data-form]'), L = f && live[f.getAttribute('data-form')], dirty = forms.dirty();
      if (L && L.dirty) save(L.id); else if (dirty.length === 1) save(dirty[0].id);
      else if (dirty.length > 1) { syncBar(); var rv = $('[data-bar-review]'); if (rv) rv.focus(); }
    }, { description: 'Save the section you’re editing', group: 'Forms', inFields: true });
  }
  var prev = S.boot2; S.boot2 = function () { if (prev) prev(); boot2(); };
})(window, document);
