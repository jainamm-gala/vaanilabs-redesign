/* Vaani Labs prototype · pages/billing-data.js — local, page-owned billing data for billing.html (03-pages/05 §2).
   One internally consistent story, generated deterministically:
   - a wallet ledger from 1 Aug to "now" (27 Sep 2026, 11:24 am IST) with daily call, meeting-agent and API roll-ups,
     UPI top-ups, one failed top-up and one refund, each row with balance-after, ending at ₹2,340.50;
   - September charges reconcile exactly (§2.9 reconciliation rule): phone calls 412 calls · 7h 30m = ₹1,080.00,
     meeting agent 3 meetings · 25m = ₹120.00, API text voice 35m 15s = ₹84.60, meetings 1 min free = ₹0,
     total ₹1,284.60 = the Spend tile = the By product total = the sum of September charge rows;
   - invoices for FY 2026–27 (GST 18 % added on top: ₹500 credit, ₹90 GST, ₹590 charged — open question 2).
   UPI IDs exist only masked. Everything is fictional. The shared data.js billing arrays are not used because their ledger,
   usage and balance do not reconcile and carry unmasked UPI IDs (reported in shared_requests). */
(function (w) {
  'use strict';
  var D = w.VAANI_DATA || {}, pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function iso(m, d, hm) { return '2026-' + pad(m) + '-' + pad(d) + 'T' + (hm || '23:59') + ':00+05:30'; }
  function r2(x) { return Math.round(x * 100) / 100; }
  /* ---------- rates: ONE source for every rate on this page (the rates endpoint, BL1; F-QA-011; bug R1A-12) ----------
     Plans › Your rates, the PlanCards, the plan gate’s Included row, Usage › By product, the Wallet charge sheet, the
     top-up "Adds … at" line and the runway all derive from RATE and FREE_MIN below; no rate is typed as a string anywhere.
     Meetings (room time): the spec states two values, ₹2.40/min (§2.10 PlanCards, the Meetings page) and 1 paisa/s
     (§2.9 example, from the public API docs); that is KB §5 open question 1, raised with the spec owner. The prototype
     uses ₹0.04/s = ₹2.40/min: the value most of the spec uses, the one the plan ladder only makes sense with (paid plans
     lower the rate, never raise it) and the one the Meetings page already shows (agents-data.js roomPerMin). */
  var RATE = { call: 0.04, agent: 0.08, meeting: 0.04, api: 0.04 }, FREE_MIN = 30;
  function perSec(x) { return '₹' + x.toFixed(2) + '/s'; }
  function perMin(x) { return '₹' + (x * 60).toFixed(2) + '/min'; }
  var UPI = { anika: 'a•••••@okaxis', rohit: 'r•••••@okhdfc' };

  /* ---------- daily call usage: exact September totals, a gentler August ---------- */
  var r = rng(2026), days = [];
  function spread(n, total, weights) { var sum = weights.reduce(function (a, b) { return a + b; }, 0), out = weights.map(function (x) { return Math.floor(total * x / sum); }), left = total - out.reduce(function (a, b) { return a + b; }, 0); for (var i = 0; left > 0; i = (i + 1) % n, left--) out[i] += 1; return out; }
  var augW = [], sepW = [], sepCW = [];
  for (var i = 0; i < 31; i++) augW.push(0.7 + r() * 0.6);
  for (i = 0; i < 27; i++) { var wk = new Date(Date.UTC(2026, 8, i + 1)).getUTCDay(); sepW.push((wk === 0 ? 0.55 : 1) * (0.8 + r() * 0.5) * (i === 26 ? 0.35 : 1)); sepCW.push(sepW[i] * (0.9 + r() * 0.2)); }
  var sepSec = spread(27, 27000, sepW), sepCalls = spread(27, 412, sepCW), augSec = spread(31, 25200, augW), augCalls = spread(31, 389, augW);
  for (i = 0; i < 31; i++) days.push({ m: 8, d: i + 1, sec: augSec[i], calls: augCalls[i], tests: i % 5 === 0 ? 2 : i % 7 === 0 ? 1 : 0 });
  for (i = 0; i < 27; i++) days.push({ m: 9, d: i + 1, sec: sepSec[i], calls: sepCalls[i], tests: [2, 3, 1, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2, 1, 2, 0, 1, 2, 3, 2, 1][i] });
  /* September test calls: 41 tests · 38m, stored as two legs and counted once, not charged */

  var rows = [], seq = 0;
  function add(o) { seq += 1; o.id = 'txn_' + (1000 + seq); rows.push(o); }
  days.forEach(function (x) {
    var today = x.m === 9 && x.d === 27;
    add({ at: iso(x.m, x.d, today ? '11:00' : '23:59'), kind: 'calls', label: 'Call charges', detail: x.calls + ' calls · ' + fmtDur(x.sec), amount: -r2(x.sec * RATE.call), status: 'completed', ref: 'CH-26' + pad(x.m) + pad(x.d), product: 'call', sec: x.sec, calls: x.calls, tests: x.tests, method: 'Wallet' });
  });
  /* meeting agent: Aug 2 sessions, Sep 3 sessions (1500 s = ₹120.00) */
  [[8, 12, 900, 1], [8, 26, 720, 1], [9, 5, 480, 1], [9, 18, 600, 1], [9, 26, 420, 1]].forEach(function (a) { add({ at: iso(a[0], a[1], '18:30'), kind: 'meeting', label: 'Meeting charges', detail: a[3] + ' meeting · ' + fmtDur(a[2]), amount: -r2(a[2] * RATE.agent), status: 'completed', ref: 'MT-26' + pad(a[0]) + pad(a[1]), product: 'agent', sec: a[2], meetings: a[3], method: 'Wallet' }); });
  /* API text voice: Sep 2115 s = ₹84.60 */
  [[8, 20, 540], [9, 3, 570], [9, 11, 525], [9, 19, 600], [9, 23, 420]].forEach(function (a) { add({ at: iso(a[0], a[1], '20:10'), kind: 'api', label: 'API charges', detail: 'text voice · ' + fmtDur(a[2]), amount: -r2(a[2] * RATE.api), status: 'completed', ref: 'AP-26' + pad(a[0]) + pad(a[1]), product: 'api', sec: a[2], method: 'Wallet' }); });
  /* top-ups (UPI, GST on top), one failed, one refund of dropped calls */
  [[8, 8, '11:20', 1000, 'anika', 'INV-2026-0808', '6254 1873 9921'], [9, 1, '09:30', 500, 'anika', 'INV-2026-0901', '6254 2011 4410'], [9, 12, '16:05', 1000, 'rohit', 'INV-2026-0912', '6254 2230 0183'], [9, 20, '14:12', 2000, 'anika', 'INV-2026-0920', '6254 1873 9928']].forEach(function (a) {
    add({ at: iso(a[0], a[1], a[2]), kind: 'topup', label: 'Top-up via UPI', amount: a[3], tax: r2(a[3] * 0.18), status: 'completed', ref: 'TXN-26' + pad(a[0]) + pad(a[1]) + '-' + a[5].slice(-4), method: 'UPI · ' + UPI[a[4]], utr: a[6], invoice: a[5], by: a[4] === 'anika' ? 'Anika R.' : 'Rohit S.', confirmedAt: iso(a[0], a[1], a[2].slice(0, 3) + pad(+a[2].slice(3) + 1)) });
  });
  add({ at: iso(9, 17, '10:41'), kind: 'topup', label: 'Top-up via UPI', amount: 500, tax: 90, status: 'failed', ref: 'TXN-260917-0077', method: 'UPI · ' + UPI.anika, reason: 'Declined by your bank. You were not charged.', by: 'Anika R.' });
  add({ at: iso(9, 15, '12:30'), kind: 'refund', label: 'Refund · 3 dropped calls', amount: 7.2, status: 'refunded', ref: 'RF-260915', method: 'Wallet' });

  rows.sort(function (a, b) { return new Date(b.at) - new Date(a.at) || (b.kind === 'topup') - (a.kind === 'topup'); });
  /* balance-after, newest first, ending at the demo balance; a failed payment never moves the balance */
  var bal = D.wallet ? D.wallet.balance : 2340.5, min = Infinity;
  rows.forEach(function (x) { x.balanceAfter = r2(bal); if (x.status !== 'failed') bal = r2(bal - x.amount); min = Math.min(min, x.balanceAfter); });
  var opening = bal;

  function fmtDur(sec) { var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h ? h + 'h ' + m + 'm' : m ? m + 'm' + (s ? ' ' + s + 's' : '') : s + 's'; }

  /* invoices, FY 2026–27 (April to March, IST): 10 top-ups, a refunded duplicate and its credit note */
  var INV = [['INV-2026-0412', 4, 12, 2000, 'paid', 'Top-up'], ['INV-2026-0503', 5, 3, 1000, 'paid', 'Top-up'], ['INV-2026-0521', 5, 21, 1000, 'paid', 'Top-up'], ['INV-2026-0610', 6, 10, 2000, 'paid', 'Top-up'],
    ['INV-2026-0702', 7, 2, 1000, 'paid', 'Top-up'], ['INV-2026-0715', 7, 15, 1000, 'refunded', 'Top-up (duplicate)'], ['CN-2026-0716', 7, 16, -1000, 'credit-note', 'Credit note · duplicate top-up'],
    ['INV-2026-0719', 7, 19, 1000, 'paid', 'Top-up'], ['INV-2026-0808', 8, 8, 1000, 'paid', 'Top-up'], ['INV-2026-0901', 9, 1, 500, 'paid', 'Top-up'], ['INV-2026-0912', 9, 12, 1000, 'paid', 'Top-up'], ['INV-2026-0920', 9, 20, 2000, 'paid', 'Top-up']];
  var invoices = INV.map(function (a) { return { id: a[0], at: iso(a[1], a[2], '12:00'), for: a[5], taxable: a[3], gst: r2(a[3] * 0.18), total: r2(a[3] * 1.18), status: a[4] }; }).reverse();

  /* meeting-minute plans (Billing › Plans absorbs Settings › Meetings Billing, §2.10). Every string is built from the
     plan’s own numbers: hours included (0 = the free monthly minutes) and its per-second Meetings rate after them.
     Pay as you go and Starter use the base RATE.meeting (§2.10: both "then ₹2.40/min"); Growth and Scale, which the
     spec does not price, get whole-paise volume rates below it so "Per second" stays exact (₹0.03/s, ₹0.02/s). */
  function plan(id, name, who, price, hours, meet, points) {
    var then = ', then ' + perMin(meet);
    return { id: id, name: name, who: who, price: price, hours: hours, meetRate: meet, points: points,
      included: (hours ? hours + ' h of meetings included' : FREE_MIN + ' free minutes each month') + then,          /* PlanCard, §2.10 */
      perMonth: (hours ? hours + ' h of meetings each month' : FREE_MIN + ' free minutes each month') + then,         /* plan gate "Included" row */
      allowance: hours ? hours + ' included hours a month' : FREE_MIN + ' free minutes a month' };                        /* Your rates "Billing unit" */
  }
  var plans = [
    plan('payg', 'Pay as you go', 'For teams trying meetings now and then.', 0, 0, RATE.meeting, ['Meeting agent in any room', 'Notes and a summary after each meeting', 'Charged from your wallet']),
    plan('starter', 'Starter', 'For solo founders running a few demos a week.', 499, 10, RATE.meeting, ['Everything in Pay as you go', 'Recordings kept 90 days', 'Custom meeting agent voice']),
    plan('growth', 'Growth', 'For sales teams that meet buyers every day.', 1999, 50, 0.03, ['Everything in Starter', 'Reserved capacity at peak hours', 'Recordings kept 1 year']),
    plan('scale', 'Scale', 'For large teams with many rooms in parallel.', 4999, 150, 0.02, ['Everything in Growth', 'Up to 10 rooms at once', 'Priority support'])
  ];
  plans[0].current = true;
  /* Your rates (§2.10). The Meetings row is re-read from the current plan when it renders (billing-plans.js). */
  var rates = [
    { id: 'call', product: 'Phone calls (voice agent)', rate: RATE.call, unit: 'Per second' },
    { id: 'agent', product: 'Meeting agent', rate: RATE.agent, unit: 'Per second' },
    { id: 'meeting', product: 'Meetings', rate: RATE.meeting, unit: 'Per second, after ' + plans[0].allowance },
    { id: 'api', product: 'API text voice', rate: RATE.api, unit: 'Per second' },
    { id: 'test', product: 'Browser test calls', rate: 0, unit: 'Not charged' }
  ];

  w.VaaniBilling = w.VaaniBilling || {};
  w.VaaniBilling.data = {
    ledger: rows, opening: opening, minBalance: min, invoices: invoices, plans: plans, rates: rates, days: days, upi: UPI,
    usageSep: { calls: 412, callSec: 27000, agentSec: 1500, agentMeetings: 3, meetingSec: 60, meetings: 1, apiSec: 2115, tests: 41, testSec: 2280 },
    usageAug: { calls: 389, callSec: 25200, agentSec: 1620, agentMeetings: 2, meetingSec: 0, meetings: 0, apiSec: 540, tests: 34, testSec: 1980 },
    billedTo: { legal: 'Sample Realty Pvt Ltd', gstin: '27ABCDE1234F1Z5', state: 'Maharashtra (27)', address: 'Office 402, Sample Business Park, Baner Road, Pune 411045', email: 'accounts@samplerealty.example' },
    rate: RATE, freeMin: FREE_MIN, perSec: perSec, perMin: perMin,
    fmtDur: fmtDur
  };
  /* free meeting minutes used this month (quota API: 60 s used), one number for Plans and Usage */
  w.VaaniBilling.data.freeUsed = Math.ceil(w.VaaniBilling.data.usageSep.meetingSec / 60);
})(window);
