/* Vaani Labs prototype · pages/assistant-scripts.js — canned replies by intent for the static prototype (02 §7, §9, §13.4):
   callbacks plan (Call gate), CSV import (Change), delete (typed), edit draft (diff), publish (Publish gate), draft flow,
   summaries, analytics numbers from the Analytics aggregates, out-of-reach and no-data answers, Hindi and Hinglish replies. */
(function (w, d) {
  'use strict';
  var V = w.Vaani, U = V.util, esc = U.esc, F = V.fmt, DATA = V.data;
  var A = w.VaaniAssistant, AD = A.DATA;
  function lang(text) { if (/[ऀ-ॿ]/.test(text)) return 'hi'; if (/\b(kya|hai|hain|karo|kar do|batao|aaj|kal|mujhe|sabko|chahiye|wale|kitne)\b/i.test(text)) return 'hi-Latn'; return 'en'; }
  function T(l, en, hi, hl) { return l === 'hi' && hi ? hi : l === 'hi-Latn' && hl ? hl : en; }

  /* ---------- plans ---------- */
  function step(id, kind, title, o) { o = o || {}; o.id = id; o.kind = kind; o.title = title; o.status = 'queued'; return o; }
  function planCallbacks() {
    var m1 = A.S.mode === 1;
    return { id: U.uid('plan'), steps: [
      step('s1', 'Look up', 'Find callbacks due today', { result: { text: '18 leads', link: { label: 'View in Leads', href: 'leads.html?view=callbacks' } }, details: 'Status is Callback due · Due today' }),
      step('s2', 'Look up', 'Leave out leads called in the last 24 h', { result: { text: '6 left out · 12 remain' } }),
      m1 ? step('s3', 'Open', 'Call 12 leads from Leads', { openLink: { label: 'Open Leads with these 12 leads selected', href: 'leads.html?view=callbacks&select=12' } })
        : step('s3', 'Call', 'Call 12 leads with Site-visit qualifier v7', { approval: 'call', details: 'Status is Callback due · Due today · Not called in the last 24 h' }),
      m1 ? step('s4', 'Open', 'Mark answered leads Contacted', { openLink: { label: 'Open Leads', href: 'leads.html?view=callbacks' } })
        : step('s4', 'Change', 'Mark answered leads Contacted', { approval: 'mark', after: 'calls', dependsOn: 's3', queuedText: 'After the calls · asks you first' })
    ] };
  }
  function simplePlan(steps) { return { id: U.uid('plan'), steps: steps }; }

  /* ---------- scripts by intent ---------- */
  function script(text, atts) {
    var l = lang(text), s = { lang: l }, low = text.toLowerCase(), csv = (atts || []).some(function (f) { return /\.(csv|xlsx)$/i.test(f.name); }), doc = (atts || []).some(function (f) { return /\.(pdf|docx|txt)$/i.test(f.name); });
    var noCalls = A.S.demo === 'no-calls', wait = A.waitingStep();
    if (A.S.voice && /\b(yes|haan|call (them|kar)|sabko)\b/i.test(text)) return { lang: l, ops: [{ status: 'Working on it…', wait: 400 }, { text: 'Review the calls on screen before they start. Nothing dials from a voice reply.' }], sources: 'none', voice: true };
    if (wait && wait.approval === 'call' && /\b(skip|leave out|exclude|also|except|without)\b/.test(low)) return { lang: l, planChange: wait, ops: [{ status: 'Working on it…', wait: 400 }, { act: { icon: 'users', running: 'Checking the 12 leads…', text: 'Checked the 12 leads · 1 in Nashik', ms: '0.3 s' } }, { text: 'I left out Arjun Deshpande from Nashik. Step 3 now calls 11 leads. Review it again before you start.' }], sources: [{ label: '12 leads', href: 'leads.html?view=callbacks' }] };
    if (noCalls && /call|analytic|summar|lead/.test(low) && !/set up|flow do/.test(low)) return { lang: l, ops: [{ status: 'Working on it…', wait: 500 }, { text: 'There are no calls in this workspace yet.' }, { block: { t: 'note', html: '<a class="as-a" href="cockpit.html?kind=test">Place a test call…</a>' } }], sources: 'none' };
    if (/\bcallbacks\b|\bcalls?\b.*\b(today|due)\b|\bplan\b.*\bcalls?\b|कॉलबैक|कॉल/.test(low) && !/\b(publish|activate|delete|remove|import|draft)\b/.test(low)) {
      var rows = AD.callbacks.slice(0, 5), t = F.time(DATA._util.ist(1, '10:42'));
      return { lang: l, plan: planCallbacks, title: "Plan calls for today’s callbacks", ops: [
        { status: T(l, 'Planning…', 'प्लान बन रहा है…', 'Plan ban raha hai…'), wait: 500 }, { plan: 1 },
        { runStep: 's1', act: { icon: 'search', running: 'Looking up callbacks…', text: 'Looked up 18 callbacks due today', link: { label: 'Leads', href: 'leads.html?view=callbacks' }, ms: '0.8 s' } },
        { runStep: 's2', act: { icon: 'phone', running: 'Checking calls since yesterday…', text: 'Checked calls since yesterday ' + t, link: { label: 'Call reports', href: 'call-reports.html?range=24h' }, ms: '0.4 s' } },
        { text: T(l, '18 callbacks are due today. 6 of them were called in the last 24 hours, so I left them out. These 12 remain:', 'आज 18 कॉलबैक बाकी हैं। इनमें से 6 को पिछले 24 घंटों में कॉल किया गया था, इसलिए उन्हें छोड़ दिया है। ये 12 बचे हैं:', 'Aaj 18 callbacks due hain. Inmein se 6 ko pichhle 24 ghante mein call kiya gaya tha, isliye unhe chhod diya. Ye 12 bache hain:') },
        { block: { t: 'table', kind: 'callbacks', total: 12, rows: rows, link: { label: 'Open all 12 in Leads', href: 'leads.html?view=callbacks&q=due-today' } } },
        { text: A.S.mode === 1 ? 'In Suggest only mode I don’t place calls. Open Leads with these 12 leads selected, then press C to review the calls.' : T(l, 'I’ll call them with Site-visit qualifier v7, the live version. Nothing dials until you review the calls.', 'इन्हें Site-visit qualifier v7 से कॉल किया जाएगा, जो लाइव वर्शन है। आपके रिव्यू करने तक कोई कॉल नहीं लगेगी।', 'Inhe Site-visit qualifier v7 se call kiya jayega, jo live version hai. Aapke review karne tak koi call nahi lagegi.') },
        { advance: 1 }], sources: [{ label: '18 leads', href: 'leads.html?view=callbacks' }, { label: '31 calls', href: 'call-reports.html?range=24h' }], followups: ['Show only Hindi speakers', 'Draft a callback script for these leads'] };
    }
    if (csv || /\b(add|import)\b.*\blead|expo/.test(low)) return { lang: l, title: 'Add expo visitors to Leads', plan: function () { return simplePlan([step('s1', 'Look up', 'Read expo-visitors.csv', { result: { text: '27 rows' } }), step('s2', 'Look up', 'Check the numbers against Leads', { result: { text: '3 already in Leads' } }), A.S.mode === 1 ? step('s3', 'Open', 'Add 24 leads from Leads', { openLink: { label: 'Open Leads import with this file', href: 'leads.html?import=1' } }) : step('s3', 'Change', 'Add 24 leads', { approval: 'import' })]); },
      ops: [{ status: 'Reading expo-visitors.csv…', wait: 500 }, { plan: 1 }, { runStep: 's1', act: { icon: 'file-text', running: 'Reading expo-visitors.csv…', text: 'Read expo-visitors.csv · 27 rows', ms: '0.6 s' } }, { runStep: 's2', act: { icon: 'users', running: 'Checking numbers against Leads…', text: 'Checked 27 numbers against', link: { label: 'Leads', href: 'leads.html' }, tail: '3 already there', ms: '0.9 s' } },
        { text: 'expo-visitors.csv has 27 rows with a name, phone and city. 3 phone numbers are already in Leads, so I’ll skip them unless you include them. ' + (A.S.mode === 3 ? 'Adding leads can be undone, so it runs on its own; Undo stays available for 24 h.' : A.S.mode === 1 ? 'In Suggest only mode you add them from Leads.' : 'Nothing is added until you approve.') }, { advance: 1 }], sources: [{ label: 'expo-visitors.csv', href: '#' }, { label: 'Leads', href: 'leads.html' }] };
    if (/\b(delete|remove)\b.*\blead/.test(low)) return { lang: l, title: 'Delete old Not interested leads', plan: function () { return simplePlan([step('s1', 'Look up', 'Find Not interested leads with no call since 29 Jun', { result: { text: '64 leads', link: { label: 'View in Leads', href: 'leads.html?status=not_interested' } } }), step('s2', 'Delete', 'Delete 64 leads', { approval: 'delete' })]); },
      ops: [{ status: 'Planning…', wait: 400 }, { plan: 1 }, { runStep: 's1', act: { icon: 'users', running: 'Finding leads…', text: 'Found 64 leads in', link: { label: 'Leads', href: 'leads.html?status=not_interested' }, ms: '0.5 s' } }, { text: '64 leads are marked Not interested and haven’t been called since 29 Jun 2026. Deleting more than 50 leads asks you to type the count.' }, { advance: 1 }], sources: [{ label: '64 leads', href: 'leads.html?status=not_interested' }] };
    if (/\b(change|edit|update|improve)\b.*\b(draft|flow|step|greeting)/.test(low)) return { lang: l, title: 'Improve the Site-visit qualifier draft', plan: function () { return simplePlan([step('s1', 'Look up', 'Read the Site-visit qualifier draft', { result: { text: 'Draft v8 · 3 changes by others' } }), step('s2', 'Edit draft', 'Apply 4 changes to the draft', { approval: 'editdraft' })]); },
      ops: [{ status: 'Checking the draft…', wait: 400 }, { plan: 1 }, { runStep: 's1', act: { icon: 'workflow', running: 'Checking the draft…', text: 'Read', link: { label: 'Site-visit qualifier', href: 'flow-designer.html' }, tail: 'draft v8 · No issues', ms: '0.5 s' } }, { text: 'I prepared 4 changes to the draft: 3 new steps and a new greeting. Live v7 isn’t touched; callers hear it until you publish.' }, { advance: 1 }], sources: [{ label: 'Site-visit qualifier draft', href: 'flow-designer.html' }, { label: 'parking-allotment.docx', href: 'knowledge.html?q=parking' }] };
    if (/\b(publish|activate|go live|make it live)\b/.test(low)) return { lang: l, title: 'Publish Festive offer callback', plan: function () { return simplePlan([step('s1', 'Look up', 'Check the Festive offer callback draft', { result: { text: 'No issues' } }), A.S.mode === 1 ? step('s2', 'Open', 'Publish from Flows', { openLink: { label: 'Open the draft in Flows', href: 'flow-designer.html?flow=flow_f219' } }) : step('s2', 'Publish', 'Publish Festive offer callback as v1', { approval: 'publish' })]); },
      ops: [{ status: 'Checking the draft…', wait: 400 }, { plan: 1 }, { runStep: 's1', act: { icon: 'workflow', running: 'Checking the draft…', text: 'Checked', link: { label: 'Festive offer callback', href: 'flow-designer.html?flow=flow_f219' }, tail: 'draft · No issues', ms: '0.5 s' } },
        { text: (/activate/.test(low) ? 'Going live is called publishing. ' : '') + 'Festive offer callback has no issues. Publishing makes it live for outbound batches, so it goes through the Publish gate with its checks.' }, { advance: 1 }], sources: [{ label: 'Festive offer callback', href: 'flow-designer.html?flow=flow_f219' }] };
    if (/draft|build|create|flow/.test(low) && /flow|document|brochure/.test(low + (doc ? ' document' : ''))) {
      var nm = doc ? 'Brochure qualifier' : 'Sales qualifier';
      return { lang: l, title: doc ? 'Turn a document into a draft flow' : null, plan: function () { return simplePlan([step('s1', 'Look up', doc ? 'Read the attached document' : 'Read your templates and knowledge', { result: { text: doc ? '3 pages' : '3 passages' } }), A.S.mode === 1 ? step('s2', 'Open', 'Create the draft in Flows', { openLink: { label: 'Create draft in Flows', href: 'flow-designer.html?new=1' } }) : step('s2', 'Draft', 'Create draft flow ' + nm, { result: { text: 'Not published · 6 steps', link: { label: 'Open in Flows', href: 'flow-designer.html?new=1' } }, onDone: 'draft' })]); },
        ops: [{ status: 'Planning…', wait: 400 }, { plan: 1 }, { runStep: 's1', act: doc ? { icon: 'file-text', running: 'Reading the document…', text: 'Read ' + (atts[0] ? atts[0].name : 'the document') + ' · 3 pages', ms: '1.1 s' } : { icon: 'book-open', running: 'Searching knowledge…', text: 'Found 3 passages in', link: { label: 'price-sheet.pdf', href: 'knowledge.html?q=price-sheet' }, ms: '0.4 s' } },
          { runStep: 's2', act: { icon: 'workflow', running: 'Checking the draft…', text: 'Checked', link: { label: nm, href: 'flow-designer.html?new=1' }, tail: 'draft · No issues', ms: '0.5 s' } },
          { text: 'I drafted ' + nm + ': it greets the lead, asks about budget and timeline, answers price questions from price-sheet.pdf and offers a site visit.' + (doc ? ' The 6 steps come from pages 1 to 3.' : '') },
          { block: { t: 'flowcard', name: nm, href: 'flow-designer.html?new=1', meta: '6 steps · Trigger 1 · Logic 2 · Action 1 · Outcome 2' } },
          { text: 'It’s a draft, so callers hear nothing until you publish it.' }, { advance: 1 }], sources: [{ label: 'price-sheet.pdf', href: 'knowledge.html?q=price-sheet' }], followups: ['Publish it', 'Add a step that asks about home loans'] };
    }
    if (/summar|last 10 calls|सार/.test(low)) {
      var calls = DATA.calls.slice(0, 10), c0 = calls.filter(function (c) { return c.turns && c.turns.length > 2; })[0];
      var booked = calls.filter(function (c) { return c.outcome === 'Visit booked'; }).length, cb = calls.filter(function (c) { return c.outcome === 'Callback' || c.outcome === 'Call later'; }).length, na = calls.filter(function (c) { return c.result !== 'completed'; }).length;
      return { lang: l, ops: [{ status: 'Reading calls…', wait: 400 }, { act: { icon: 'phone', running: 'Reading the last 10 calls…', text: 'Read 10 calls', link: { label: 'Call reports', href: 'call-reports.html' }, ms: '1.2 s' } },
        { text: 'Of your last 10 calls, ' + booked + ' booked a site visit, ' + cb + ' asked for a callback and ' + na + ' didn’t connect. Most callers asked about the possession date and parking.' },
        { block: { t: 'rows', caption: 'Last 5 of 10 calls', cols: [{ label: 'Lead' }, { label: 'Result' }, { label: 'Outcome' }], rows: calls.slice(0, 5).map(function (c) { return [esc(c.leadName), V.ui.statusTag('callResult', c.result), V.ui.statusTag('outcome', c.outcome)]; }) } },
        c0 ? { block: { t: 'quote', call: c0, turns: c0.turns.filter(function (x) { return x.speaker !== 'system'; }).slice(0, 2) } } : { wait: 1 },
        { text: 'Nothing needs your action right now.' }], sources: [{ label: '10 calls', href: 'call-reports.html' }], followups: ['Which of them asked about parking?', 'Plan calls for the callbacks'] };
    }
    if (/analytic|this week|how many|numbers|stats/.test(low)) {
      var u = AD.usage, a = u.last7, b = u.prev7;
      return { lang: l, ops: [{ status: 'Reading analytics…', wait: 400 }, { act: { icon: 'chart-column', running: 'Reading call totals…', text: 'Read call totals for the last 7 days', link: { label: 'Analytics', href: 'analytics.html?range=7d' }, ms: '0.5 s' } },
        { text: 'This week you placed ' + F.count(a.calls) + ' calls and ' + F.count(a.connected) + ' connected (' + F.pct(a.connected / a.calls) + ').' },
        { block: { t: 'stats', scope: 'Last 7 days · calls, not legs · test calls excluded', items: [{ label: 'Calls', value: F.count(a.calls), delta: { n: a.calls - b.calls, vs: 'vs the 7 days before' } }, { label: 'Connected', value: F.count(a.connected), unit: F.pct(a.connected / a.calls) }, { label: 'Minutes', value: F.count(a.minutes), delta: { n: a.minutes - b.minutes, vs: 'vs the 7 days before' } }, { label: 'Spend', value: F.money(a.spend, { whole: true }) }] } },
        { text: 'The same numbers are in Analytics for this range.' }], sources: [{ label: 'Analytics · last 7 days', href: 'analytics.html?range=7d' }], followups: ['Why did calls drop on Thursday?', 'Show connected calls by hour'] };
    }
    var reach = low.match(/autopay|invoice|top ?up|billing|wallet|api key|webhook|setting|whatsapp|sms/);
    if (reach) { var k = reach[0], cant = /invoice/.test(k) ? 'I can’t see invoices. Open <a class="as-a" href="billing.html#invoices">Billing › Invoices</a>.' : /api key|webhook|setting/.test(k) ? 'I can’t change settings, API keys or webhooks. You can in <a class="as-a" href="settings.html">Settings</a>.' : /whatsapp|sms/.test(k) ? 'I can’t send WhatsApp or SMS messages. Flows can send them on calls; see <a class="as-a" href="flow-designer.html">Flows</a>.' : 'I can’t change autopay, top up or billing. You can in <a class="as-a" href="billing.html#autopay">Billing › Autopay</a>.';
      return { lang: l, ops: [{ status: 'Working on it…', wait: 400 }, { html: '<p>' + cant + '</p>' }], sources: 'none' }; }
    if (/last year|2025|last month|january|june/.test(low)) return { lang: l, ops: [{ status: 'Looking up calls…', wait: 400 }, { act: { icon: 'phone', running: 'Looking up calls…', text: 'Looked up calls in', link: { label: 'Call reports', href: 'call-reports.html' }, ms: '0.3 s' } }, { text: 'I couldn’t find calls from then. This workspace has calls from ' + F.date(DATA.usage[0].date + 'T10:00:00+05:30') + ' to 27 Sep 2026.' }], sources: [{ label: 'Call reports', href: 'call-reports.html' }], followups: ['Summarise the last 10 calls'] };
    return { lang: l, ops: [{ status: T(l, 'Working on it…', 'काम हो रहा है…', 'Kaam ho raha hai…'), wait: 500 }, { text: T(l, 'I can help with calls, leads, flows and analytics in Sample Realty: plan today’s callbacks, summarise recent calls, answer questions about your leads or draft a call flow. What would you like to do?', 'इस वर्कस्पेस में कॉल, लीड, फ़्लो और एनालिटिक्स से जुड़ा कोई भी काम बताइए: आज के कॉलबैक प्लान करना, हाल के कॉल का सार, या नया कॉल फ़्लो ड्राफ़्ट करना।', 'Is workspace mein calls, leads, flows aur analytics ka koi bhi kaam bataiye: aaj ke callbacks plan karna, recent calls ka summary, ya naya call flow draft karna.') }], sources: 'none', followups: ["Plan today’s callbacks", 'Summarise my last 10 calls'] };
  }
  A.script = script;
  A.lang = lang;
})(window, document);
