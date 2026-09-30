/* Vaani Labs prototype · Flow Designer · store: state, the one history stack (FD2 §14.4), the save machine (FD2 §4.3,
   §4.9 interim I1) and every graph mutation. Viewing never writes: selection, zoom, panels and theme never touch this. */
(function (w) {
  'use strict';
  var VF = w.VaaniFlow, V = VF.V, S = VF.S;
  S.sel = []; S.focus = null; S.issues = []; S.checking = true; S.hist = { undo: [], redo: [] };
  S.save = { state: 'saved', at: null, edits: 0 }; S.lastTest = null; S.recent = [];

  /* ---------- selection (never dirties the draft) ---------- */
  VF.step = function (id) { var st = S.m ? S.m.steps : []; for (var i = 0; i < st.length; i++) if (st[i].id === id) return st[i]; return null; };
  VF.select = function (ids, o) {
    o = o || {}; var prev = S.sel.join(); S.sel = ids.filter(function (id) { return VF.step(id); });
    if (S.sel.length === 1) S.focus = S.sel[0];
    if (prev !== S.sel.join()) { VF.emit('selection', o); if (S.sel.length > 1 && !o.quiet) V.announce(S.sel.length + ' steps selected', { dedupeKey: 'sel' }); }
    VF.syncUrl();
  };
  VF.toggleSel = function (id) { var i = S.sel.indexOf(id); var n = S.sel.slice(); if (i >= 0) n.splice(i, 1); else n.push(id); VF.select(n); };
  VF.syncUrl = function () {
    try { var u = new URL(w.location.href); if (S.sel.length === 1 && !S.viewing) u.searchParams.set('node', S.sel[0]); else u.searchParams.delete('node'); w.history.replaceState(null, '', u.toString()); } catch (e) { /* file:// may refuse; the URL is a convenience */ }
  };

  /* ---------- history: every graph change is one entry; typing coalesces per field focus ---------- */
  function snap() { return { steps: VF.clone(S.m.steps), maxNo: S.m.maxNo, frames: VF.clone(S.m.frames || []), notes: VF.clone(S.m.notes || []) }; }
  function restore(e) { S.m.steps = e.s.steps; S.m.maxNo = e.s.maxNo; if (e.s.frames) S.m.frames = e.s.frames; if (e.s.notes) S.m.notes = e.s.notes; }
  VF.act = function (label, fn, o) {
    o = o || {};
    if (VF.readOnlyReason()) { VF.explainReadOnly(); return false; }
    var top = S.hist.undo[S.hist.undo.length - 1];
    if (!(o.coalesce && top && top.coalesce === o.coalesce)) S.hist.undo.push({ label: label, coalesce: o.coalesce || null, s: snap() });
    if (S.hist.undo.length > 100) S.hist.undo.shift();
    S.hist.redo = [];
    var res = fn();
    VF.changed(o);
    return res === undefined ? true : res;
  };
  VF.changed = function (o) {
    o = o || {};
    S.m.steps.forEach(function (s) { if (s.outs) s.outs.forEach(function (x) { if (x.to && !VF.step(x.to)) x.to = null; }); });
    VF.save.touch();
    if (S.test && S.test.status !== 'idle' && !o.keepTest) VF.emit('testinvalid');
    VF.revalidate();
    VF.emit('change', o);
  };
  VF.undo = function () {
    var e = S.hist.undo.pop(); if (!e) { V.announce('Nothing to undo'); return; }
    S.hist.redo.push({ label: e.label, s: snap() }); restore(e);
    S.sel = S.sel.filter(VF.step); if (S.focus && !VF.step(S.focus)) S.focus = null;
    VF.changed({ structure: true }); V.announce('Undid ' + e.label);
  };
  VF.redo = function () {
    var e = S.hist.redo.pop(); if (!e) { V.announce('Nothing to redo'); return; }
    S.hist.undo.push({ label: e.label, s: snap() }); restore(e);
    S.sel = S.sel.filter(VF.step); VF.changed({ structure: true }); V.announce('Redid ' + e.label);
  };

  /* ---------- the save machine ---------- */
  var saveT = null, showT = null;
  VF.save = {
    touch: function () {
      var sc = S.scen; S.save.edits += 1; clearTimeout(saveT); clearTimeout(showT);
      if (sc === 'volatile') { S.save.state = 'volatile'; VF.emit('save'); return; }
      if (sc === 'offline') { S.save.state = 'offline'; VF.emit('save'); return; }
      if (S.save.state === 'error' || S.save.state === 'conflict') { VF.emit('save'); return; }
      showT = setTimeout(function () { S.save.state = 'saving'; VF.emit('save'); }, 200);
      saveT = setTimeout(function () {
        clearTimeout(showT);
        if (sc === 'save-failed' && !S.save.retried) { S.save.state = 'error'; w.document.title = "Couldn’t save · " + S.m.meta.name + ' · Flows · Vaani Labs'; VF.emit('save'); return; }
        if (sc === 'conflict' && !S.save.resolved) { S.save.state = 'conflict'; VF.emit('save'); VF.emit('conflict'); return; }
        S.save.state = sc === 'interim' ? 'device' : 'saved'; S.save.at = VF.clock(); S.save.edits = 0; VF.emit('save');
      }, 700);
    },
    retry: function () { S.save.retried = true; S.save.state = 'saving'; VF.emit('save'); setTimeout(function () { S.save.state = S.scen === 'interim' ? 'device' : 'saved'; S.save.at = VF.clock(); S.save.edits = 0; w.document.title = S.m.meta.name + ' · Flows · Vaani Labs'; VF.emit('save'); }, 600); },
    flush: function (cb) { if (S.save.state === 'saving' || saveT) { setTimeout(cb, 750); } else cb(); }
  };

  /* ---------- validation: recompute 300 ms after a change; announce counts after 1.5 s without edits ---------- */
  var valT = null, annT = null, lastCounts = null;
  VF.revalidate = function (now) {
    clearTimeout(valT);
    var run = function () {
      S.issues = VF.validate(S.m.steps); S.checking = false; VF.emit('issues');
      var c = VF.counts(S.issues), key = c.errors + '/' + c.warnings;
      if (lastCounts !== null && key !== lastCounts) { clearTimeout(annT); annT = setTimeout(function () { V.announce(VF.issueWords(c), { dedupeKey: 'issues' }); }, 1500); }
      lastCounts = key;
    };
    if (now) run(); else valT = setTimeout(run, 300);
  };

  /* ---------- helpers ---------- */
  VF.readOnlyReason = function () {
    if (S.loading) return 'loading';
    if (S.viewing) return 'version';
    if (S.compare) return 'compare';
    if (S.scen === 'viewonly') return 'viewonly';
    if (S.scen === 'offline-ro') return 'offline';
    if (S.mode === 'review' || S.mode === 'phone') return S.mode;
    if (S.conflictOpen) return 'conflict';
    return null;
  };
  VF.explainReadOnly = function () {
    var r = VF.readOnlyReason(), msg = { review: 'Edit this step on a screen at least 1024 px wide. Your draft is safe.', phone: 'Edit this step on a screen at least 1024 px wide. Your draft is safe.', viewonly: 'You can view this flow. Ask Rohit S. (admin) to change it.', version: 'Viewing an old version. Go back to the draft to edit.', compare: 'Exit compare to edit.', loading: 'The flow is still loading.', conflict: 'Editing is paused until you choose which changes to keep.' }[r];
    if (r === 'review' || r === 'phone') V.announce(msg); else if (msg) V.toast.info(msg);
  };
  VF.defaultTitle = function (type, preset) {
    var base = preset || VF.REG[type].name, taken = {}, n = 2;
    S.m.steps.forEach(function (s) { taken[s.title] = 1; });
    if (!taken[base]) return base; while (taken[base + ' ' + n]) n++; return base + ' ' + n;
  };
  VF.newStep = function (type, preset) {
    var r = VF.REG[type], no = ++S.m.maxNo, id = 'n' + no + '_' + Math.random().toString(36).slice(2, 5);
    var s = { id: id, no: no, type: type, title: VF.defaultTitle(type, preset), x: 0, y: 0, f: {}, outs: [], by: 'you' };
    if (r.phase === 'trigger') { s.outs = [{ id: 'out', to: null }]; if (type === 'trigger.inbound') s.f = { numbers: [], when: 'Always', outside: 'Say a message and end' }; if (type === 'trigger.outbound') s.f = { batch: '', callerId: VF.WS.callerIds[0], hours: 'Mon to Sat, 10 am to 7 pm IST', retries: 1, interval: '2 h', concurrency: 5, ifNobody: 'No answer', voicemail: 'Hang up' }; }
    else if (type === 'logic.question') { s.f = { prompt: '', wait: 6, unclear: 'Ask again once', interrupt: true }; s.outs = [{ id: 'yes', label: 'Yes', ex: ['haan', 'हाँ'], to: null }, { id: 'no', label: 'No', ex: ['nahi', 'नहीं'], to: null }, { id: 'noreply', label: 'No reply', ex: [], fb: true, to: null }]; }
    else if (type === 'logic.branch') { s.f = { decide: 'Rules', cases: [{ v: 'budget', op: 'more than', val: '1,00,00,000' }] }; s.outs = [{ id: 'c1', label: 'Budget over ₹1 Cr', ex: [], to: null }, { id: 'else', label: 'Else', ex: [], fb: true, to: null }]; }
    else if (type === 'logic.verify') { s.f = { prompt: 'To confirm it’s you, what are the last 4 digits of your loan account?', against: 'A lead field', match: 'Last 4 digits', attempts: 2, hide: true }; s.outs = [{ id: 'ok', label: 'Verified', ex: [], to: null }, { id: 'fail', label: 'Not verified', ex: [], to: null }, { id: 'noreply', label: 'No reply', ex: [], fb: true, to: null }]; }
    else if (r.rows === 'results') { s.outs = [{ id: 'ok', label: r.ok, res: 'ok', to: null }, { id: 'fail', label: r.fb, res: 'fail', fb: true, to: null }]; }
    else if (r.phase === 'action') s.outs = [{ id: 'out', to: null }];
    if (type === 'action.speak') s.f = { prompt: '', interrupt: true };
    if (type === 'action.meeting') s.f = { prompt: 'Which day suits you for the site visit this week?', mtype: 'Phone call', length: '30 min', offer: VF.WS.calendar === 'connected' ? 'Google Calendar free time' : 'Set hours', confirmWa: false, saveTo: 'meeting_time' };
    if (type === 'action.whatsapp') s.f = { template: '', sendTo: "Caller’s number", tell: "I’ve sent the details on WhatsApp." };
    if (type === 'action.transfer') s.f = { to: 'Rep console', queue: 'Any available rep', say: 'Connecting you to our site manager. Please hold.', ring: 30, brief: true };
    if (type === 'action.knowledge') s.f = { searchIn: 'All indexed sources', lookUp: 'What the caller asked', style: 'In the agent’s own words' };
    if (type === 'action.crm') s.f = { connector: 'crm_sample', findBy: "Caller’s phone number" };
    if (type === 'outcome.end') { var o = preset || 'Interested'; s.f = { outcome: o, lead: VF.outcomeLead(o), say: 'Thank you for your time. Have a good day.' }; s.title = VF.defaultTitle(type, o); }
    return s;
  };

  /* Inserting between two connected steps (FD1 §8.1, §7.3): with room for a column (the step plus the 128 rank gap on
     both sides) it takes the next layer, level with the source socket; in a tighter gap it is centred between them, so
     both connectors still run forward with at least 64 px; with less than that it takes the next layer below the target.
     Existing steps never move; a tight insert says that Tidy spaces the flow out. */
  function sockY(a, outId) { var g = VF.geom(a.id), i = Math.max(0, a.outs.map(function (q) { return q.id; }).indexOf(outId)); return g && g.outs && g.outs[outId] != null ? g.outs[outId] : 42 + i * 28; }
  function insertPos(a, outId, b, s) {
    var ga = VF.geom(a.id), wa = Math.max(VF.width(a), ga ? ga.w : 0), ws = VF.width(s), gap = b.x - (a.x + wa), y = a.y + sockY(a, outId) - 42;
    if (gap >= ws + 2 * 128) return { x: a.x + wa + 128, y: y };
    /* FD-R1-26 (FD1 §8.1, §7.3): an insert keeps the rank gap on both sides. The steps from the downstream one rightwards
       move right by the missing amount, in the same undo step, so connectors keep room for their labels. */
    var need = Math.ceil((ws + 2 * 128 - gap) / 16) * 16, edge = b.x - 8;
    S.m.steps.forEach(function (t) { if (t !== a && t.x >= edge) t.x += need; });
    (S.m.notes || []).forEach(function (n) { if (!n.pin && n.x >= edge) n.x += need; });
    return { x: a.x + wa + 128, y: y, shifted: true };
  }
  /* Add a step (FD1 §8.1): after a socket or the selected step, at a point, or between a connection’s two steps. */
  VF.addStep = function (type, o) {
    o = o || {}; var added = null, conn = null, tight = false;
    var ok = VF.act('add ' + VF.REG[type].name, function () {
      var s = VF.newStep(type, o.preset), src = o.from ? VF.step(o.from.stepId) : null;
      if (!src && !o.at && !o.between && S.sel.length === 1) { src = VF.step(S.sel[0]); }
      var outId = o.from && o.from.outId;
      if (src && !outId) { var free = src.outs.filter(function (x) { return !x.to; }); outId = free.length ? free[0].id : null; }
      var x, y;
      var so0 = src && outId ? src.outs.filter(function (q) { return q.id === outId; })[0] : null, nxt0 = so0 && so0.to && VF.phaseOf(s) !== 'outcome' && VF.phaseOf(s) !== 'trigger' ? VF.step(so0.to) : null;
      if (o.between) { var a = VF.step(o.between.from), b = VF.step(a.outs.filter(function (q) { return q.id === o.between.outId; })[0].to), ip = insertPos(a, o.between.outId, b, s); x = ip.x; y = ip.y; tight = !!ip.shifted; }
      else if (o.at) { x = o.at.x; y = o.at.y; }
      else if (src && nxt0) { var ip2 = insertPos(src, outId, nxt0, s); x = ip2.x; y = ip2.y; tight = !!ip2.shifted; }
      else if (src) { x = src.x + VF.width(src) + 128; y = src.y + (outId ? Math.max(0, src.outs.map(function (q) { return q.id; }).indexOf(outId)) * 28 : 0); }
      else { var c = VF.viewCenter ? VF.viewCenter() : { x: 200, y: 200 }; var k = (S.cascade = (S.cascade || 0) + 1) % 6; x = c.x - 120 + k * 32; y = c.y - 60 + k * 32; }
      var p = o.exact ? { x: Math.round(x / 16) * 16, y: Math.round(y / 16) * 16 } : VF.place(S.m.steps, s, x, y); s.x = p.x; s.y = p.y;
      S.m.steps.push(s);
      if (o.between) { var a2 = VF.step(o.between.from), oo = a2.outs.filter(function (q) { return q.id === o.between.outId; })[0], old = oo.to; oo.to = s.id; if (s.outs[0]) s.outs[0].to = old; conn = { between: [a2.title, (VF.step(old) || {}).title] }; }
      else if (src && outId && VF.phaseOf(s) !== 'trigger') { var so = src.outs.filter(function (q) { return q.id === outId; })[0]; if (so) { var prevTo = so.to; so.to = s.id; if (prevTo && s.outs[0] && VF.phaseOf(s) !== 'outcome') s.outs[0].to = prevTo; conn = { from: src, out: so }; } }
      if (o.then && s.outs[0]) s.outs[0].to = o.then;
      added = s;
    });
    if (!ok || !added) return null;
    S.recent = [type + '|' + (o.preset || '')].concat(S.recent.filter(function (x) { return x !== type + '|' + (o.preset || ''); })).slice(0, 4);
    VF.select([added.id], { quiet: true }); S.focus = added.id;
    var msg = conn && conn.between ? 'Added ' + added.title + ' between ' + conn.between[0] + ' and ' + conn.between[1] + '.' : conn ? 'Added ' + added.title + ' after ' + conn.from.title + (conn.out.label ? ', connected from ' + conn.out.label : ', connected') + '.' : 'Added ' + added.title + ', not connected. Press C to connect.';
    if (tight) msg += ' The steps after it moved right to make room.';
    V.announce(msg); VF.emit('added', { step: added, keyboard: !!o.keyboard });
    return added;
  };
  VF.connect = function (stepId, outId, targetId) {
    var s = VF.step(stepId), o = s && s.outs.filter(function (q) { return q.id === outId; })[0], t = VF.step(targetId);
    if (!o || !t || t.id === s.id || VF.phaseOf(t) === 'trigger') { V.announce("That step can’t take a connection."); return false; }
    var was = o.to && VF.step(o.to);
    VF.act('connect ' + (o.label || s.title), function () { o.to = targetId; }, { structure: true });
    V.announce(was ? (o.label || s.title) + ' now goes to ' + t.title + ' instead of ' + was.title : 'Connected ' + (o.label || s.title) + ' to ' + t.title);
    return true;
  };
  VF.disconnect = function (stepId, outId, o) {
    var s = VF.step(stepId), x = s && s.outs.filter(function (q) { return q.id === outId; })[0]; if (!x || !x.to) return;
    VF.act('remove connection', function () { x.to = null; }, { structure: true });
    V.announce('Disconnected ' + (x.label || s.title));
    if (!(o && o.quiet)) V.toast.undo('Removed the connection from ' + (x.label ? '"' + x.label + '"' : '"' + s.title + '"'), { action: { label: 'Undo', onClick: VF.undo } });
  };

  /* Delete with Undo (FD1 §10.3, FD2 §14.1): no dialog; consecutive deletes coalesce into one toast. */
  var delToast = null, delGroup = 0;
  VF.deleteSteps = function (ids, o) {
    o = o || {}; ids = ids.filter(VF.step); if (!ids.length) return;
    var trig = S.m.steps.filter(function (s) { return VF.phaseOf(s) === 'trigger'; });
    if (trig.length && trig.every(function (t) { return ids.indexOf(t.id) >= 0; })) { V.toast.info('A flow needs a trigger. Add another trigger first.'); return; }
    if (S.test && S.test.status === 'running') { V.toast.info('Stop the test to edit.'); return; }
    var order = VF.callOrder(S.m.steps).order, first = VF.step(ids[0]), conns = 0, rec = null;
    S.m.steps.forEach(function (s) { s.outs.forEach(function (x) { if (x.to && (ids.indexOf(x.to) >= 0 || ids.indexOf(s.id) >= 0)) conns++; }); });
    if (o.reconnect && ids.length === 1) { var inc = VF.incoming(S.m.steps, ids[0]), outs = first.outs.filter(function (x) { return x.to; }); if (inc.length === 1 && outs.length === 1) rec = { src: inc[0], to: outs[0].to }; }
    var idx = order.indexOf(ids[0]), inc0 = VF.incoming(S.m.steps, ids[0]).map(function (x) { return x.from.id; }).filter(function (id) { return ids.indexOf(id) < 0; }), before = inc0[0] || order.slice(0, Math.max(0, idx)).reverse().filter(function (id) { return ids.indexOf(id) < 0; })[0] || order.slice(idx + 1).filter(function (id) { return ids.indexOf(id) < 0; })[0];
    VF.act('delete ' + (ids.length === 1 ? "'" + first.title + "'" : ids.length + ' steps'), function () {
      if (VF.pruneFrames) VF.pruneFrames(ids);
      S.m.steps = S.m.steps.filter(function (s) { return ids.indexOf(s.id) < 0; });
      if (rec) { var src = VF.step(rec.src.from.id); src.outs.filter(function (x) { return x.id === rec.src.out.id; })[0].to = rec.to; }
    }, { structure: true });
    var land = before || (S.m.steps[0] && S.m.steps[0].id);
    S.sel = []; S.focus = land; VF.emit('selection', {}); VF.emit('deleted', { focus: land, from: o.from || null });
    delGroup = delToast && !delToast.gone ? delGroup + 1 : 1;
    var msg = rec ? "Deleted '" + first.title + "' · reconnected '" + VF.step(rec.src.from.id).title + "' to '" + (VF.step(rec.to) || {}).title + "'" : ids.length === 1 && delGroup === 1 ? "Deleted '" + first.title + "'" + (conns ? ' and ' + conns + ' connection' + (conns === 1 ? '' : 's') : '') : 'Deleted ' + (delGroup > 1 ? delGroup : ids.length) + ' steps' + (conns && delGroup === 1 ? ' and ' + conns + ' connections' : '');
    if (delToast && !delToast.gone) delToast.dismiss();
    var n = delGroup, t = V.toast.undo(msg, { action: { label: 'Undo', onClick: function () { for (var i = 0; i < n; i++) VF.undo(); } }, onDismiss: function () { t.gone = true; } });
    delToast = t; V.announce("Deleted '" + first.title + "'" + (ids.length > 1 ? ' and ' + (ids.length - 1) + ' more' : '') + '. Press Control Z to undo.');
  };
  VF.moveSteps = function (ids, dx, dy, o) {
    if (!dx && !dy) return;
    VF.act('move ' + (ids.length === 1 ? VF.step(ids[0]).title : ids.length + ' steps'), function () { ids.forEach(function (id) { var s = VF.step(id); s.x += dx; s.y += dy; }); }, { coalesce: o && o.coalesce, keepTest: true });
    if (!(o && o.quiet)) V.announce('Moved ' + (ids.length === 1 ? VF.step(ids[0]).title : ids.length + ' steps'), { dedupeKey: 'move' });
  };
  VF.setField = function (id, key, value, o) { var s = VF.step(id); if (!s) return; VF.act('edit ' + s.title, function () { if (key === 'title') s.title = value; else s.f[key] = value; if (s.invalid) delete s.invalid[key]; }, { coalesce: (o && o.coalesce) || id + ':' + key, keepTest: false, field: true }); };
  VF.setInvalid = function (id, key, msg) { var s = VF.step(id); if (!s) return; s.invalid = s.invalid || {}; if (msg) s.invalid[key] = msg; else delete s.invalid[key]; VF.revalidate(); VF.emit('change', { field: true }); };
  VF.setOuts = function (id, fn, label) { var s = VF.step(id); VF.act(label || 'edit answers', function () { fn(s.outs, s); }, { structure: true }); };
  VF.tidyAll = function (only) {
    var pos = VF.tidy(S.m.steps, only), moved = 0;
    S.m.steps.forEach(function (s) { var p = pos[s.id]; if (p && (p.x !== s.x || p.y !== s.y)) moved++; });
    if (!moved) { V.toast.info('Already tidy. Nothing moved.'); return; }
    VF.act('tidy', function () { S.m.steps.forEach(function (s) { var p = pos[s.id]; if (p) { s.x = p.x; s.y = p.y; } }); }, { tidy: true, keepTest: true });
    var n = only ? Object.keys(only).length : S.m.steps.length;
    V.toast.success('Tidied ' + n + ' steps', { action: { label: 'Undo', onClick: VF.undo } });
  };

  /* Clipboard (FD1 §10.2): internal connections kept, fresh ids and numbers, " (copy)" suffix, never overlapping. */
  VF.copy = function (ids) {
    ids = ids.filter(VF.step); if (!ids.length) return;
    VF.clip = { flow: S.m.meta.id, steps: VF.clone(ids.map(VF.step)) }; V.announce('Copied ' + ids.length + ' step' + (ids.length === 1 ? '' : 's'));
  };
  VF.paste = function (at, o) {
    if (!VF.clip) { V.announce('Nothing to paste'); return; }
    var src = VF.clip.steps, map = {}, dropped = 0, made = [];
    var minX = Math.min.apply(null, src.map(function (s) { return s.x; })), minY = Math.min.apply(null, src.map(function (s) { return s.y; }));
    VF.act((o && o.label) || 'paste', function () {
      src.forEach(function (s0) { var s = VF.clone(s0); s.no = ++S.m.maxNo; map[s0.id] = s.id = 'n' + s.no + '_' + Math.random().toString(36).slice(2, 5); if (S.m.steps.some(function (x) { return x.title === s.title; })) s.title = s.title + ' (copy)'; made.push(s); });
      made.forEach(function (s) { s.outs.forEach(function (x) { if (x.to && map[x.to]) x.to = map[x.to]; else { if (x.to) dropped++; x.to = null; } }); });
      var base = at || { x: minX + 32, y: minY + 32 };
      made.forEach(function (s, i) { var p = VF.place(S.m.steps, s, base.x + (src[i].x - minX), base.y + (src[i].y - minY)); s.x = p.x; s.y = p.y; S.m.steps.push(s); });
    }, { structure: true });
    VF.select(made.map(function (s) { return s.id; }), { quiet: true });
    setTimeout(function () { if (VF.revealIds) VF.revealIds(made.map(function (s) { return s.id; })); }, 0);
    V.announce('Pasted ' + made.length + ' step' + (made.length === 1 ? '' : 's') + '.' + (dropped ? ' ' + dropped + ' outside connection' + (dropped === 1 ? '' : 's') + ' not copied.' : ''));
  };
  /* Cut (FD1 §10.2): copy, then delete with Undo. */
  VF.cut = function (ids, o) { ids = ids.filter(VF.step); if (!ids.length) return; if (VF.readOnlyReason()) return VF.explainReadOnly(); VF.copy(ids); VF.deleteSteps(ids, o); };
  VF.duplicate = function (ids) { var keep = VF.clip; VF.copy(ids); VF.paste(null, { label: 'duplicate' }); VF.clip = keep; };
  VF.convert = function (id, type) {
    var s = VF.step(id); if (!s) return;
    VF.act('convert ' + s.title, function () {
      var n = VF.newStep(type); S.m.maxNo--; var inTo = s.outs.filter(function (x) { return x.to; })[0];
      var prompt = s.f.prompt || s.f.stored || ''; s.type = type; s.f = n.f; if (prompt && ('prompt' in n.f || type === 'action.speak')) s.f.prompt = prompt; else if (prompt && type === 'action.transfer') s.f.say = prompt;
      s.outs = n.outs; if (inTo && s.outs[0]) s.outs[0].to = inTo.to; delete s.raw;
    }, { structure: true });
    V.announce('Converted ' + s.title + ' to ' + VF.REG[type].name);
  };
})(window);
