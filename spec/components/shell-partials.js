/* Vaani Labs · shared shell partials: markup generator for every reference mock. Styles: components.css (sections 7-10, 15).
   Load in <head>:  <script src="../components/shell-partials.js"></script>
   Source of truth: spec/03-pages/00-app-shell-ia.md §2.6 (nav config), §4.3 (TopBar), §5.2 (Baseline copy);
   spec/02-components-data-nav.md §1.6 and §1.8. In the product the same strings come from lib/nav.ts and
   the Baseline copy module; no page types a destination name or a Baseline sentence itself.

   Placeholders (replaced on DOMContentLoaded; every attribute that does not start with data-vl is kept):
     <div data-vl="baseline" data-vl-state="default" [data-vl-short="0-5"]></div>
     <div data-vl="baseline-list" data-vl-state="default"></div>
     <div data-vl="topbar" data-vl-title="Leads" [data-vl-mode="phone|tablet|auto"] [data-vl-back="Settings"]
          [data-vl-chips="wallet | call wallet | wallet-low | wallet-empty | call | none"] [data-vl-timer="02:14"]></div>
     <div data-vl="bottombar" data-vl-current="leads" [data-vl-expanded="true"]></div>
   Pages that build markup in script call VaaniShell.baseline(state, short), .topBar({...}), .bottomBar(id). */
(function (w) {
  'use strict';

  /* §2.6 — the one nav config (labels, icons, groups, phone slots) */
  var NAV = [
    { id: 'home', label: 'Home', icon: 'house', group: 'Operate' },
    { id: 'cockpit', label: 'Cockpit', icon: 'activity', group: 'Operate', phoneSlot: 1 },
    { id: 'assistant', label: 'Assistant', icon: 'bot', group: 'Operate' },
    { id: 'rep-console', label: 'Rep console', icon: 'headphones', group: 'Operate' },
    { id: 'meetings', label: 'Meetings', icon: 'video', group: 'Operate' },
    { id: 'personal-agents', label: 'Personal agents', icon: 'list-checks', group: 'Operate' },
    { id: 'flows', label: 'Flows', icon: 'workflow', group: 'Build', phoneSlot: 4 },
    { id: 'knowledge', label: 'Knowledge', icon: 'book-open', group: 'Build' },
    { id: 'leads', label: 'Leads', icon: 'users', group: 'Data', phoneSlot: 2 },
    { id: 'call-reports', label: 'Call reports', icon: 'file-text', group: 'Data', phoneSlot: 3 },
    { id: 'analytics', label: 'Analytics', icon: 'chart-column', group: 'Data' },
    { id: 'billing', label: 'Billing', icon: 'wallet', group: 'Account' },
    { id: 'settings', label: 'Settings', icon: 'sliders-horizontal', group: 'Account' }
  ];
  var MORE = { id: 'more', label: 'More', icon: 'ellipsis' }; /* the ellipsis glyph; `menu` is only the tablet NavSheet trigger */

  /* Lucide paths (ISC), 24 px grid */
  var ICONS = {
    'house': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'bot': '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
    'headphones': '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    'video': '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    'list-checks': '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
    'workflow': '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
    'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/>',
    'wallet': '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    'sliders-horizontal': '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
    'ellipsis': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'menu': '<path d="M4 12h16M4 6h16M4 18h16"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'keyboard': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
    'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    'triangle-alert': '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3M12 9v4M12 17h.01"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>'
  };
  function ic(name, size) {
    return '<svg class="ic' + (size && size !== 'md' ? ' ic--' + size : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }
  function navById(id) { for (var i = 0; i < NAV.length; i++) if (NAV[i].id === id) return NAV[i]; return null; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* §5.2 — Baseline copy. One entry per segment state; `short` is the §5.3 short form; warn segments never shorten. */
  var NUM = '<span class="phone-text" translate="no">+91 80 •••• 2210</span>';
  var SEG = {
    'flow':            { id: 'flow', html: '<b>Live v7</b> · Site-visit qualifier', short: '<b>Live v7</b>', full: 'Live v7 · Site-visit qualifier', route: '/flows/<id>' },
    'flow-more':       { id: 'flow', html: '<b>Live v7</b> · Site-visit qualifier · <u>+ 2 more</u>', short: '<b>Live v7</b> · <u>+ 2 more</u>', full: 'Live v7 · Site-visit qualifier · + 2 more', route: '/flows?status=live' },
    'flow-published':  { id: 'flow', html: '<b>Published v1</b> · Site-visit qualifier', short: '<b>Published v1</b>', full: 'Published v1 · Site-visit qualifier', route: '/flows/<id>' },
    'flow-none':       { id: 'flow', warn: 1, html: 'No live flow · <u>Publish one</u>', route: '/flows' },
    'flow-interim':    { id: 'flow', html: 'Active flow · Site-visit qualifier', short: 'Active flow', full: 'Active flow · Site-visit qualifier', route: '/flows/<id>' },
    'line':            { id: 'line', html: 'Inbound ' + NUM + ' · Ready', short: 'Inbound · Ready', full: 'Inbound +91 80 •••• 2210 · Ready', route: '/settings/phone' },
    'line-verified':   { id: 'line', html: 'Inbound ' + NUM + ' · Verified', short: 'Inbound · Verified', full: 'Inbound +91 80 •••• 2210 · Verified', route: '/settings/phone' },
    'line-none':       { id: 'line', warn: 1, html: 'No calling number · calls can’t be placed · <u>Finish setup (1 of 5)</u>', route: '/home' },
    'line-verifying':  { id: 'line', html: 'Verifying number · step 2 of 3', route: '/settings/phone' },
    'line-unverified': { id: 'line', warn: 1, html: 'Number not verified · <u>Verify</u>', route: '/settings/phone' },
    'line-degraded':   { id: 'line', warn: 1, html: 'Phone line degraded · <u>Status</u>', route: 'status page (new tab)' },
    'wallet':          { id: 'wallet', html: 'Wallet <b>₹2,340.50</b> · about 16 h of calls', short: '<b>₹2,340.50</b> · 16 h', full: 'Wallet ₹2,340.50 · about 16 h of calls', route: '/billing/wallet' },
    'wallet-setup':    { id: 'wallet', html: 'Wallet <b>₹500.00</b> · about 3 h 28 min of calls', short: '<b>₹500.00</b> · 3 h 28 min', full: 'Wallet ₹500.00 · about 3 h 28 min of calls', route: '/billing/wallet' },
    'wallet-norunway': { id: 'wallet', html: 'Wallet <b>₹2,340.50</b>', short: '<b>₹2,340.50</b>', full: 'Wallet ₹2,340.50', route: '/billing/wallet' },
    'wallet-low':      { id: 'wallet', warn: 1, html: 'Wallet <b>₹42.10</b> · about 17 min · <u>Top up</u>', route: '?topup=1' },
    'wallet-empty':    { id: 'wallet', warn: 1, html: 'Wallet <b>₹0</b> · calls paused · <u>Top up</u>', route: '?topup=1' },
    'wallet-autopay':  { id: 'wallet', warn: 1, html: 'Autopay failed · <u>Fix</u>', route: '/billing/autopay' },
    'wallet-pending':  { id: 'wallet', html: 'Wallet <b>₹42.10</b> · payment pending', route: '/billing/wallet' },
    /* Activity counts the workspace's other calls; your own call is segment 5 (You) */
    'activity':        { id: 'activity', html: '<b>2</b> calls in progress', route: '/cockpit' },
    'activity-1':      { id: 'activity', html: '<b>1</b> call in progress', route: '/cockpit' },
    'batch':           { id: 'activity', html: 'Batch · <b>12 of 40</b> placed', route: '/cockpit' },
    'you-call':        { id: 'you', live: 1, html: '<b>On call <span class="num">02:14</span></b> · Lead 1042', route: '/cockpit?call=<id>' },
    'you-rep':         { id: 'you', html: 'Available for transfers', route: '/rep-console' }
  };
  /* Named states. Every page mock that shows "the same state" uses the same name, so the output is byte-identical. */
  var STATES = {
    'default':      ['flow', 'line', 'wallet'],
    'activity':     ['flow', 'line', 'wallet', 'activity'],
    'activity-1':   ['flow', 'line', 'wallet', 'activity-1'],
    'batch':        ['flow', 'line', 'wallet', 'batch'],
    'low':          ['flow', 'line', 'wallet-low'],
    'low-activity': ['flow', 'line', 'wallet-low', 'activity'],
    'low-oncall':   ['flow', 'line', 'wallet-low', 'activity-1', 'you-call'],
    'empty':        ['flow', 'line', 'wallet-empty'],
    'oncall':       ['flow', 'line', 'wallet', 'you-call'],
    'oncall-activity': ['flow', 'line', 'wallet', 'activity-1', 'you-call'],
    'oncall-batch': ['flow', 'line', 'wallet', 'batch', 'you-call'],
    'rep':          ['flow', 'line', 'wallet', 'you-rep'],
    'degraded':     ['flow', 'line-degraded', 'wallet'],
    'unverified':   ['flow', 'line-unverified', 'wallet'],
    'setup':        ['flow-none', 'line-none', 'wallet-setup'],
    'home':         ['flow-published', 'line-verified', 'wallet-empty']
  };
  var LIST_ICON = { flow: 'workflow', line: 'phone', wallet: 'wallet', activity: 'activity', you: 'headphones' };

  function segList(state, segs) {
    var keys = segs ? String(segs).split(/\s+/) : (STATES[state || 'default'] || STATES['default']);
    return keys.map(function (k) { var s = SEG[k]; if (!s) throw new Error('Baseline: unknown segment ' + k); return s; });
  }

  /* §5.1–5.3: the band. short = how many §5.3 steps apply (0 = full width) */
  function baseline(state, short, segs) {
    short = +short || 0;
    if (state === 'error') {
      return '<div class="bl" data-baseline role="region" aria-label="Workspace status"><button type="button" class="bl-btn">Couldn’t load workspace status · <u>Retry</u></button></div>';
    }
    var list = segList(state, segs).filter(function (s) { return !(short >= 5 && s.id === 'activity'); });
    var h = '<div class="bl" data-baseline role="region" aria-label="Workspace status" data-baseline-state="' + esc((segs ? 'segs:' + segs : (state || 'default')) + (short ? '/short' + short : '')) + '">';
    list.forEach(function (s, i) {
      var useShort = !s.warn && s.short && ((s.id === 'flow' && short >= 1) || (s.id === 'line' && short >= 3) || (s.id === 'wallet' && short >= 4));
      if (i) h += '<span class="bl-sep" aria-hidden="true"></span>';
      h += '<a class="bl-seg' + (s.warn ? ' bl-seg--warn' : '') + '" href="#" data-route="' + esc(s.route) + '"' + (useShort ? ' aria-label="' + esc(s.full) + '"' : '') + '>';
      if (s.warn) h += ic('triangle-alert', 'sm');
      if (s.live) h += '<span class="live-dot live-dot--pulse" data-mark></span>';
      h += (useShort ? s.short : s.html) + '</a>';
    });
    h += '<span class="bl-end">';
    if (short >= 2) {
      h += '<button type="button" class="bl-btn" aria-haspopup="dialog" aria-label="Shortcuts" title="Shortcuts">' + ic('keyboard', 'sm') + '</button>' +
           '<button type="button" class="bl-btn" aria-haspopup="dialog" aria-label="Search" title="Search">' + ic('search', 'sm') + '</button>';
    } else {
      h += '<button type="button" class="bl-btn" aria-haspopup="dialog">Shortcuts</button>' +
           '<button type="button" class="bl-btn" aria-haspopup="dialog">Search</button>';
    }
    return h + '</span></div>';
  }

  /* §5.4: the same segments as 44 px rows (NavSheet, MoreSheet, BaselineChip popover). Same sentences, never short. */
  function baselineList(state, segs) {
    var h = '<ul class="blist" aria-label="Workspace status">';
    segList(state, segs).forEach(function (s) {
      var lead = s.warn ? ic('triangle-alert', 'sm') : (s.live ? '<span class="live-dot" data-mark></span>' : ic(LIST_ICON[s.id], 'sm'));
      h += '<li><a href="#" data-route="' + esc(s.route) + '"' + (s.warn ? ' class="blist--warn"' : '') + '>' + lead + '<span class="blist-t">' + s.html + '</span>' + ic('chevron-right', 'sm').replace('class="ic ', 'class="ic blist-ch ') + '</a></li>';
    });
    return h + '</ul>';
  }

  /* data-nav §1.6 + §4.3: TopBar. Phone: no menu button, ever; Back link on record and sub-pages. Tablet: menu button. */
  var CHIPS = {
    'wallet':       function () { return '<a class="chip" href="#" data-route="/billing/wallet" aria-label="Wallet ₹2,340.50">' + ic('wallet', 'xs') + '₹2,340</a>'; },
    'wallet-low':   function () { return '<a class="chip chip--warn" href="#" data-route="?topup=1" aria-label="Wallet low, ₹42.10 · Top up">' + ic('triangle-alert', 'xs') + '₹42.10 · Top up</a>'; },
    'wallet-empty': function () { return '<a class="chip chip--warn" href="#" data-route="?topup=1" aria-label="Wallet empty, ₹0 · Top up">' + ic('triangle-alert', 'xs') + '₹0 · Top up</a>'; },
    'call':         function (o) { return '<a class="chip chip--live" href="#" data-route="/cockpit?call=<id>"><span class="live-dot live-dot--pulse" data-mark></span>Live <span class="num">' + esc(o.timer || '02:14') + '</span></a>'; }
  };
  function topBar(o) {
    o = o || {};
    var mode = o.mode || 'phone', tag = o.tag || 'h1';
    var chips = (o.chips == null ? 'wallet' : String(o.chips)).split(/\s+/).filter(function (c) { return c && c !== 'none'; });
    var h = '<header class="topbar topbar--' + mode + '">';
    if (mode !== 'phone') h += '<button type="button" class="ibtn ibtn--lg topbar-menu" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded="false">' + ic('menu', 'lg') + '</button>';
    if (o.back && mode !== 'tablet') h += '<a class="topbar-back" href="#">' + ic('chevron-left', 'md') + esc(o.back) + '</a>';
    h += '<' + tag + ' class="topbar-title" title="' + esc(o.title || '') + '"' + (o.translate === false ? ' translate="no"' : '') + '>' + esc(o.title || '') + '</' + tag + '>';
    chips.forEach(function (c) { if (!CHIPS[c]) throw new Error('TopBar: unknown chip ' + c); h += CHIPS[c](o); });
    h += '<button type="button" class="ibtn ibtn--lg" aria-label="Search or jump" aria-haspopup="dialog">' + ic('search', 'lg') + '</button>';
    return h + '</header>';
  }

  /* data-nav §1.8: BottomBar from phoneSlot; More carries the current mark for every other destination. */
  function bottomBar(current, expanded) {
    var slots = NAV.filter(function (n) { return n.phoneSlot; }).sort(function (a, b) { return a.phoneSlot - b.phoneSlot; });
    var inSlots = slots.some(function (n) { return n.id === current; });
    var moreCurrent = current === 'more' || (!!current && !!navById(current) && !inSlots);
    var h = '<nav class="bbar" aria-label="Main">';
    slots.forEach(function (n) {
      h += '<a href="#"' + (n.id === current ? ' aria-current="page"' : '') + '>' + ic(n.icon, 'lg') + '<span>' + n.label + '</span></a>';
    });
    h += '<button type="button" aria-haspopup="dialog" aria-expanded="' + (expanded ? 'true' : 'false') + '"' + (moreCurrent ? ' aria-current="page"' : '') + '>' + ic(MORE.icon, 'lg') + '<span>' + MORE.label + '</span></button>';
    return h + '</nav>';
  }

  function render(el) {
    var d = function (k) { return el.getAttribute('data-vl-' + k); };
    switch (el.getAttribute('data-vl')) {
      case 'baseline': return baseline(d('state'), d('short'), d('segs'));
      case 'baseline-list': return baselineList(d('state'), d('segs'));
      case 'topbar': return topBar({ title: d('title'), mode: d('mode'), back: d('back'), chips: d('chips'), timer: d('timer'), tag: d('tag'), translate: d('translate') === 'no' ? false : undefined });
      case 'bottombar': return bottomBar(d('current'), d('expanded') === 'true');
    }
    return null;
  }
  function mount(root) {
    var els = (root || document).querySelectorAll('[data-vl]');
    Array.prototype.forEach.call(els, function (el) {
      var html = render(el); if (!html) return;
      var t = document.createElement('template'); t.innerHTML = html.trim();
      var node = t.content.firstElementChild;
      Array.prototype.forEach.call(el.attributes, function (a) {
        if (a.name === 'data-vl' || a.name.indexOf('data-vl-') === 0) return;
        if (a.name === 'class') node.setAttribute('class', node.getAttribute('class') + ' ' + a.value);
        else if (a.name === 'style') node.setAttribute('style', (node.getAttribute('style') || '') + a.value);
        else node.setAttribute(a.name, a.value);
      });
      el.replaceWith(node);
    });
  }

  w.VaaniShell = { NAV: NAV, SEG: SEG, STATES: STATES, icon: ic, baseline: baseline, baselineList: baselineList, topBar: topBar, bottomBar: bottomBar, mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
})(window);
