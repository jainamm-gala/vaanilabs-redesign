/* Vaani Labs prototype · pages/settings-data.js — Settings page data (03-pages/06). Fictional: "Sample Realty", Pune.
   People come from VAANI_DATA.org.members; numbers are masked except the ones you typed yourself into your own profile.
   The shared VAANI_DATA.settings block predates the final spec (old grouping, vl_ key prefix), so this page keeps its own
   copy here, shaped by the spec. Everything below is read by settings.js into mutable state on load. */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA, ist = D._util.ist;
  var SD = {};

  /* SettingsNav / SettingsIndex config (§2.1): group label, page label (= H1), index icon, description. */
  SD.nav = [
    { id: 'top', label: '', items: [{ id: 'overview', label: 'Overview', icon: 'layout-list', desc: 'Everything in Settings, and what needs attention' }] },
    { id: 'account', label: 'Your account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-round', desc: 'Your name, mobile and WhatsApp number, and preferences' },
      { id: 'notifications', label: 'Notifications', icon: 'bell', desc: 'What we email or WhatsApp you about' },
      { id: 'security', label: 'Security', icon: 'shield', desc: "Email address, password, two-factor and where you’re signed in" }] },
    { id: 'workspace', label: 'Workspace', items: [
      { id: 'organization', label: 'Organization and team', icon: 'building-2', desc: 'Workspace name and address, teammates and roles, shared files' },
      { id: 'integrations', label: 'Integrations', icon: 'plug', desc: 'Calendars, CRMs and WhatsApp Business' },
      { id: 'assistant', label: 'Assistant', icon: 'bot', desc: 'What the Assistant may do without asking' }] },
    { id: 'calling', label: 'Calling', items: [
      { id: 'phone', label: 'Phone setup', icon: 'phone', desc: 'Inbound number, caller ID, transfers and calling hours' }] },
    { id: 'developer', label: 'Developer', items: [
      { id: 'api-keys', label: 'API keys', icon: 'key-round', desc: 'Keys for calling the Vaani Labs API', width: 'data' },
      { id: 'webhooks', label: 'Webhooks', icon: 'webhook', desc: 'Send call and lead events to your systems', width: 'data', match: ['webhook-deliveries'] },
      { id: 'embed', label: 'Embed', icon: 'code-xml', desc: 'Put a Vaani voice widget on your website' }] },
    { id: 'data', label: 'Data', items: [
      { id: 'activity', label: 'Activity', icon: 'history', desc: 'Who did what, and when', width: 'data' },
      { id: 'export', label: 'Export data', icon: 'download', desc: 'Download a copy of your data' },
      { id: 'delete', label: 'Delete account', icon: 'trash-2', desc: 'Close your account', danger: true }] }
  ];
  /* Pages that are not in the nav: Webhook deliveries (Settings › Webhooks › Webhook deliveries). */
  SD.subPages = { 'webhook-deliveries': { label: 'Webhook deliveries', parent: 'webhooks', width: 'data' } };

  /* Legacy routes and hashes (§0.3) → new hash routes. "billing:" targets leave Settings (S7: no money in Settings). */
  SD.redirects = {
    'calling-number': 'phone/caller-id', 'call-channel': 'phone/transfer', 'calendly': 'integrations/calendly', 'change-email': 'security/email',
    'data-export': 'export', 'danger-zone': 'organization/danger', 'admin': 'organization', 'organizations': 'organization', 'members': 'organization/members',
    'invite': 'organization?invite=1', 'two-factor': 'security/two-factor', '2fa': 'security/two-factor', 'sessions': 'security/sessions', 'delete-account': 'delete',
    'webhooks/deliveries': 'webhook-deliveries', 'api-keys/embed': 'embed', 'notifications/whatsapp': 'profile/whatsapp',
    'wallet': 'billing:billing.html?topup=1', 'autopay': 'billing:billing.html#autopay', 'meetings-billing': 'billing:billing.html#plans',
    'personal-agent': 'billing:agents.html?view=personal-agents', 'docs': 'help:'
  };

  /* Profile (§7.1). Your own mobile is shown in full only in your own editable field. */
  SD.profile = { name: 'Anika Rao', mobile: '98765 43012', whatsapp: { state: 'verified', masked: '+91 •••••• 3012', full: '+91 98765 43012', at: ist(6, '10:42') } };
  SD.memberProfile = { name: 'Farah Khan', mobile: '', whatsapp: { state: 'none' } };

  /* Notifications (§7.3): events and defaults from Shell §11.1. wa: null = not offered ("–"). admin: shown to admins only. */
  SD.notif = [
    { id: 'calls', title: 'Calls and leads', events: [
      { id: 'summaries', label: 'Call summaries', desc: 'After each call: the outcome and a short summary.', email: true, wa: false },
      { id: 'batch', label: 'Batch finished', email: true, wa: false },
      { id: 'callbacks', label: 'Callbacks due today', desc: 'A digest at 9:00 am IST.', email: false, wa: false }] },
    { id: 'money', title: 'Money', events: [
      { id: 'wallet', label: 'Wallet low or empty', desc: 'When about an hour of calls is left, and when it reaches ₹0.', email: true, wa: false, admin: true },
      { id: 'autopay', label: "Autopay couldn’t top up", email: true, wa: false, admin: true },
      { id: 'receipts', label: 'Payment receipts', email: true, wa: null }] },
    { id: 'tasks', title: 'Tasks and approvals', events: [
      { id: 'task', label: 'A task needs your confirmation', desc: 'Personal agents wait for you before they go on.', email: true, wa: true },
      { id: 'proposals', label: 'Knowledge proposals to review', email: false, wa: false, admin: true }] },
    { id: 'workspace', title: 'Workspace', events: [
      { id: 'number', label: 'Number or caller ID status changed', email: true, wa: false, admin: true },
      { id: 'incident', label: 'Calling incident or maintenance', email: true, wa: false, admin: true },
      { id: 'published', label: 'A teammate published a flow', email: false, wa: false }] },
    { id: 'security', title: 'Security', events: [
      { id: 'signin', label: 'New sign-ins, password or email changes', email: true, wa: false, locked: "Security alerts can’t be turned off." }] },
    { id: 'news', title: 'News', events: [
      { id: 'product', label: 'Product updates', email: false, wa: null }] }
  ];

  /* Security (§7.7) */
  SD.security = { passwordChanged: ist(96, '10:00'), twoFactorSince: ist(6, '10:30'), recoveryLeft: 8, setupKey: 'JBSW Y3DP EHPK 3PXP 7Q2M 4VNC' };
  SD.sessions = [
    { id: 's1', device: 'Chrome on Windows', place: 'Pune (approx.)', at: ist(0, '11:24'), current: true },
    { id: 's2', device: 'Safari on iPhone', place: 'Pune (approx.)', at: ist(0, '09:18') },
    { id: 's3', device: 'Chrome on macOS', place: 'Mumbai (approx.)', at: ist(15, '14:05') }
  ];

  /* Organization (§7.2): the address can change 2 more times; brochure used by 2 live flows. */
  SD.workspace = { name: 'Sample Realty', slug: 'sample-realty', changesLeft: 2, brochure: { name: 'brochure.pdf', size: 1258291, at: ist(6, '12:40'), usedBy: 2 } };
  SD.inviteExpires = '6 days';

  /* Integrations (§7.4). group: yours | workspace. state: not-connected · connecting · connected · attention · coming-soon. */
  SD.integrations = [
    { id: 'google', group: 'yours', name: 'Google', mark: 'google', purpose: 'Send email from Gmail and add meetings to your Google Calendar.', state: 'attention', account: 'anika.rao@samplerealty.example', since: ist(6, '10:05'),
      scopes: ['Send email from your Gmail address', 'Add events to your Google Calendar'], usedBy: [{ label: 'Book a site visit · Site-visit qualifier v7', href: 'flow-designer.html?node=n6' }, { label: 'Book a callback · Home-loan follow-up v3', href: 'flow-designer.html?flow=flow_3b90' }],
      options: [{ id: 'invite', label: 'Add the lead as a guest on the event', on: true }], attention: 'Google needs you to sign in again.' },
    { id: 'microsoft', group: 'yours', name: 'Microsoft', mark: 'microsoft', purpose: 'Send email from Outlook and add meetings to your Outlook calendar.', state: 'not-connected',
      scopes: ['Send email from your Outlook address', 'Add events to your Outlook calendar'] },
    { id: 'calendly', group: 'yours', name: 'Calendly', mark: 'calendar-clock', purpose: 'Let your agent book on your Calendly event types.', state: 'connected', account: 'anika.rao@samplerealty.example', since: ist(12, '16:20'),
      scopes: ['See your event types', 'Book meetings on your event types'], usedBy: [], options: [{ id: 'buffer', label: 'Leave 15 minutes between bookings', on: true }] },
    { id: 'whatsapp', group: 'workspace', name: 'WhatsApp Business', mark: 'message-circle', purpose: 'Send and receive messages as your business, and capture click-to-WhatsApp leads.', state: 'connected', account: 'Sample Realty · +91 80 •••• 2210', by: 'Rohit S.', since: ist(15, '11:00'),
      scopes: ['Send messages from your business number', 'Receive replies and click-to-WhatsApp leads'], usedBy: [{ label: 'Send WhatsApp · Site-visit qualifier v7', href: 'flow-designer.html?node=n8' }],
      options: [{ id: 'leads', label: 'Create leads from new WhatsApp chats', on: true }, { id: 'brochure', label: 'Attach the brochure when a caller asks for details', on: true }] },
    { id: 'hubspot', group: 'workspace', name: 'HubSpot', mark: 'database', purpose: 'Send call outcomes and new leads to HubSpot.', state: 'not-connected',
      scopes: ['Create and update contacts', 'Log calls on contacts'], options: [{ id: 'contacts', label: 'Create HubSpot contacts for new leads', on: true }, { id: 'log', label: 'Log each call on the contact', on: true }],
      note: "Sync goes one way: changes in HubSpot don’t come back.", usedBy: [{ label: 'CRM lookup · Booking amount reminder v12', href: 'flow-designer.html?flow=flow_9e14' }] },
    { id: 'salesforce', group: 'workspace', name: 'Salesforce', mark: 'database', purpose: 'Let your agent look up Salesforce contacts during calls.', state: 'not-connected',
      scopes: ['Read contacts', 'Find a contact by phone number'] },
    { id: 'instagram', group: 'workspace', name: 'Instagram', mark: 'instagram', purpose: 'Capture leads from Instagram lead ads and messages.', state: 'coming-soon' },
    { id: 'facebook', group: 'workspace', name: 'Facebook', mark: 'facebook', purpose: 'Capture leads from Facebook lead forms and Messenger.', state: 'coming-soon' }
  ];

  /* Assistant (§7.5; assistant spec §10.2). One string source for the modes and the "Always" list. */
  SD.modes = [
    { id: '1', title: 'Suggest only', desc: 'Suggests steps. You make every change.' },
    { id: '2', title: 'Ask before changes', desc: 'Asks before changing anything.' },
    { id: '3', title: 'Undoable changes on its own', desc: 'Makes undoable changes, asks for the rest.' }
  ];
  SD.always = ['Calls go through the Call gate', 'Publishing goes through the Publish gate', 'Deleting always asks', "It acts with your role’s permissions", "It can’t top up, change billing or change settings"];

  /* Phone setup (§7.6) */
  SD.phone = {
    inbound: { state: 'active', masked: '+91 80 •••• 2210', full: '+91 80 4567 2210', last4: '2210', since: ist(15, '12:10'), flowId: 'flow_7c21', requestedAt: ist(6, '10:00') },
    callerId: { stage: 'verified', masked: '+91 80 •••• 2210', verifiedAt: ist(15, '12:10'), codeAt: ist(16, '17:30') },
    transfer: { route: 'phone', number: '98220 14107' },
    lastTest: null
  };

  /* API keys (§7.8). Only the prefix and last 4 are ever stored for display. */
  SD.scopes = [
    { id: 'textvoice', label: 'Web voice agent', desc: 'Voice conversations in a browser or app' },
    { id: 'voicebot', label: 'Phone agent', desc: 'Outbound and inbound phone calls' },
    { id: 'meeting_agent', label: 'Meeting agent', desc: 'The agent joins a meeting room' },
    { id: 'meeting', label: 'Meeting rooms', desc: 'Rooms without an agent' }
  ];
  SD.apiKeys = [
    { id: 'key_3fa2', name: 'CRM sync', last4: '3fa2', scopes: ['voicebot', 'textvoice'], rate: 60, lastUsed: ist(0, '10:42'), lastIp: '103.21.•••.•••', created: ist(6, '12:15'), by: 'Anika R.', requests: 18240 },
    { id: 'key_91c0', name: 'Website', last4: '91c0', scopes: ['textvoice'], rate: 120, lastUsed: null, created: ist(15, '16:40'), by: 'Rohit S.', requests: 0 }
  ];

  /* Webhooks (§7.9) */
  SD.events = [
    { id: 'call.completed', desc: 'A call ended with an outcome' }, { id: 'call.failed', desc: "A call couldn’t connect or dropped" },
    { id: 'meeting.ended', desc: 'A meeting finished' }, { id: 'lead.created', desc: 'A lead was added' },
    { id: 'usage.charged', desc: 'Your wallet was charged' }, { id: 'low_balance.warned', desc: 'Your wallet is low' }
  ];
  SD.webhooks = [
    { id: 'wh_crm', name: 'CRM hook', url: 'https://crm.samplerealty.example/hooks/vaani/events', events: ['call.completed', 'call.failed', 'lead.created'], status: 'failing', streak: 5, last: { at: ist(0, '10:40'), code: 500 } },
    { id: 'wh_etl', name: 'Analytics', url: 'https://etl.samplerealty.example/in', events: ['call.completed'], status: 'healthy', last: { at: ist(0, '10:41'), code: 200 } }
  ];
  var ev = ['call.completed', 'lead.created', 'call.completed', 'call.failed', 'call.completed', 'usage.charged', 'call.completed', 'lead.created', 'call.completed', 'call.completed', 'call.failed', 'call.completed'];
  SD.deliveries = ev.map(function (e, i) {
    var crm = i % 3 !== 1, fail = crm && i < 5, mm = 40 - i * 7;
    var at = mm >= 0 ? ist(0, '10:' + D._util.pad(mm)) : ist(0, '09:' + D._util.pad(60 + mm));
    return { id: 'dlv_' + (8120 - i), at: at, event: e, webhook: crm ? 'wh_crm' : 'wh_etl', code: fail ? (i === 3 ? 0 : 500) : 200, ms: fail ? (i === 3 ? 10000 : 412) : 120 + (i * 37) % 180, attempts: fail ? 3 : 1 };
  });
  SD.deliveryTotals = { all: 1204, failed: 5 };

  /* Embed (§7.10) */
  SD.embed = { style: 'floating', position: 'bottom-right', text: 'Talk to us' };

  /* Activity (§7.11): past-tense sentences; persons, API keys, the Assistant. Recording since the oldest row. */
  SD.activity = [
    { id: 'ev_214', at: ist(0, '10:42'), cat: 'Flows', event: 'Published a flow', who: 'Anika R.', target: 'Site-visit qualifier', href: 'flow-designer.html', ip: '103.21.•••.•••', device: 'Chrome on Windows', change: ['Version', 'v6', 'v7'] },
    { id: 'ev_213', at: ist(0, '10:05'), cat: 'Sign-in', event: 'Signed in', who: 'Rohit S.', target: '–', ip: '49.36.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_212', at: ist(0, '09:15'), cat: 'API keys and webhooks', event: 'Created an API key', who: 'Anika R.', target: 'CRM sync', href: '#api-keys', ip: '103.21.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_211', at: ist(1, '18:40'), cat: 'Leads', event: 'Imported 212 leads', who: 'Farah K.', target: 'Leads', href: 'leads.html', ip: '157.48.•••.•••', device: 'Safari on macOS' },
    { id: 'ev_210', at: ist(1, '16:02'), cat: 'Phone setup', event: 'Changed calling hours', who: 'Anika R. via Assistant', target: 'Phone setup', href: '#phone/hours', ip: '–', device: '–', change: ['Saturday', 'Closed', '10:00 am to 7:00 pm'] },
    { id: 'ev_209', at: ist(2, '12:30'), cat: 'Workspace', event: 'Invited a teammate', who: 'Rohit S.', target: 'm•••@samplerealty.example', ip: '49.36.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_208', at: ist(3, '15:12'), cat: 'Knowledge', event: 'Added a file', who: 'Kiran P.', target: 'price-sheet-sep.pdf', href: 'knowledge.html', ip: '106.51.•••.•••', device: 'Chrome on Android' },
    { id: 'ev_207', at: ist(4, '11:48'), cat: 'API keys and webhooks', event: 'Webhook deliveries started failing', who: 'Vaani Labs', target: 'CRM hook', href: '#webhooks', ip: '–', device: '–' },
    { id: 'ev_206', at: ist(6, '10:42'), cat: 'Account', event: 'Verified a WhatsApp number', who: 'Anika R.', target: 'Profile', href: '#profile/whatsapp', ip: '103.21.•••.•••', device: 'Safari on iPhone' },
    { id: 'ev_205', at: ist(6, '10:30'), cat: 'Account', event: 'Turned on two-factor', who: 'Anika R.', target: 'Security', href: '#security/two-factor', ip: '103.21.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_204', at: ist(7, '14:12'), cat: 'Billing', event: 'Topped up the wallet', who: 'Anika R.', target: '₹2,000', href: 'billing.html', ip: '103.21.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_203', at: ist(12, '16:20'), cat: 'Integrations', event: 'Connected Calendly', who: 'Anika R.', target: 'Integrations', href: '#integrations/calendly', ip: '103.21.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_202', at: ist(15, '12:10'), cat: 'Phone setup', event: 'Caller ID verified', who: 'Vaani Labs', target: '+91 80 •••• 2210', href: '#phone/caller-id', ip: '–', device: '–' },
    { id: 'ev_201', at: ist(15, '11:00'), cat: 'Integrations', event: 'Connected WhatsApp Business', who: 'Rohit S.', target: 'Integrations', href: '#integrations/whatsapp', ip: '49.36.•••.•••', device: 'Chrome on Windows' },
    { id: 'ev_200', at: ist(20, '12:00'), cat: 'Workspace', event: 'Changed a role', who: 'Anika R.', target: 'Rohit S.', ip: '103.21.•••.•••', device: 'Chrome on Windows', change: ['Role', 'Member', 'Admin'] },
    { id: 'ev_199', at: ist(25, '09:40'), cat: 'Workspace', event: 'Created the workspace', who: 'Anika R.', target: 'Sample Realty', ip: '103.21.•••.•••', device: 'Chrome on Windows' }
  ];
  SD.activityTotal = 214;
  SD.categories = ['Sign-in', 'Account', 'Flows', 'Leads', 'Knowledge', 'Phone setup', 'Integrations', 'API keys and webhooks', 'Billing', 'Workspace', 'Assistant'];

  /* Export data (§7.12): one export every 24 hours; links last 4 hours. */
  SD.exportLatest = { requested: ist(0, '08:24'), ready: ist(0, '08:26'), size: 135885, expiresMin: 52, nextAt: ist(-1, '08:24'), nextIn: '21 h' };

  (w.VaaniSettings = w.VaaniSettings || {}).SD = SD;
})(window);
