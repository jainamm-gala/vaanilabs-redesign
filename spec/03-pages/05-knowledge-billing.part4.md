## 2. Billing (`/billing/*`) and the Top-up sheet

### 2.1 Purpose and jobs to be done

**Primary job:** *When my calls depend on a prepaid balance, I want to know how long it will last, add money in seconds with UPI, and never be surprised by a pause, so calls keep flowing.* The user is the buyer or ops lead (01-product-understanding part 1, persona 1), often on a phone.

**Secondary jobs:** see what calls and meetings cost and where the money went (Usage, Transactions); set up autopay once and trust it; download GST invoices for accounts; compare meeting-minute plans.

**Not this page's job:** allocating an inbound number (Settings › Phone setup; Analytics' "Allocate a number from billing" is corrected there, F-UX-015, EXPLORE-DATA-21), or per-call cost analysis (Call reports' Cost column; Usage links to it).

### 2.2 Findings addressed and what changes

| Finding | Today | Change |
|---|---|---|
| F-UX-002, F-QA-004 (high) | Banner "Top up" and "Enable autopay" open Settings › Profile, even from /billing | Every Top up opens the Top-up sheet in place (`?topup=1`); legacy hashes redirect (§0.3); CI link check |
| F-UX-021 (medium) | No rate, usage, invoices or GST; "use Pricing" contradiction; four competing blue buttons; placeholder-only amount fields; 0, −50 and 9,999,999 accepted; autopay status shown twice; meeting plans in Settings | Five route tabs; one primary ("Top up"); CurrencyInput with visible bounds, validation on blur and no silent rewrite; one autopay StatusTag; Plans tab absorbs Meetings Billing with fixed PAYG copy |
| F-UX-011 (high), F-QA-006 | 158 min used vs ₹0 and 0 transactions; two legs per test call | Usage counts calls, not legs, test calls separate; the ledger reconciles top-ups and charges with balance-after |
| F-QA-011 (high) | Public docs say per-second billing and also "round up to whole minutes" | Plans › Your rates states the unit and rounding the backend actually applies (BL1); one sentence reused on /pricing and docs (open question 1) |
| F-QA-021 (medium) | Top-up accepts any number | `inr(min, max)` schema; Pay disabled only for outside reasons, field errors on submit (C §8.2 V6) |
| F-UX-028, F-A11Y-015, F-RWD-013, F-QA-036 | 42 px assertive banner on every page including Billing, 3 s late, 4 lines at 320 | No banner on Billing; the balance card carries low and empty states; the WalletNotice ladder elsewhere (O §10.2) |
| F-A11Y-009 (high) | Black on blue at 3.27–3.83:1 | Button primary with `--on-accent` (7.68 / 6.21:1) |
| F-A11Y-016, F-A11Y-020 | Preset chips without state; labels by placeholder | Presets are a radiogroup; every field has a Field label |
| F-UX-030 | "Auto top-up amount ₹0.00" flash while loading | Skeletons; money is never rendered before it is known |
| F-VIS-001, F-VIS-005 | "BILLING" in caps, mono body, blue mono labels | PageHeader "Billing", Hanken, sentence case |
| F-RWD-005 | Rail hides Billing at laptop heights | Shell short mode (N §1.2); Billing also reachable from the Baseline wallet segment and ⌘K ("wallet", "recharge", "UPI" keywords) |

### 2.3 Information hierarchy (Wallet tab, the default)

1. **First: balance and runway.** "₹2,340.50" at `num-28` with "About 16 h of phone calls at ₹0.04/s" directly under it. The runway answers the real question (how long until calls stop); the balance proves it.
2. **Second: Top up.** The page's only filled button, at the right of the header; then the autopay state in the card beside the balance (the way to stop thinking about top-ups).
3. **Third: Transactions.** Where the money went, with balance-after on every row.

Usage, Plans, Invoices and Autopay are one click away as route tabs; nothing from them repeats on Wallet except a one-line "Spent ₹1,284.60 this month · See usage".

### 2.4 Information architecture and entry points

**Route tabs** (`RouteTabs label="Billing sections"`, N §3): **Wallet** · **Usage** · **Plans** · **Invoices** · **Autopay**. The Autopay tab carries a 12 px `alert-triangle` in `--warning-text` with the hidden word "needs attention" when autopay is Paused or Needs renewal. The shell nav badge on Billing ("Low", "Blocked", N §1.5) is the only other place a billing state reaches the chrome besides the Baseline.

**Every way into money, and where it lands:**

| Entry point | Target |
|---|---|
| Baseline wallet segment `Wallet ₹2,340.50 · about 16 h of calls` (D §6.1) | `/billing/wallet` |
| Baseline low or blocked segment's "Top up" link · wallet chip in the low state (tablet, phone, Flow Designer) | Top-up sheet in place (`?topup=1`) |
| WalletNotice "Top up" (Cockpit, Leads, Flows, Rep console, Personal agents; O §10.2) | Top-up sheet in place |
| Disabled Call action reason "Wallet is ₹0. **Top up** to place calls." (C §1.6) | Top-up sheet in place; on success, focus returns to the call control, now enabled, with "You can place the call now." |
| WalletNotice "Turn on autopay" · autopay-failed "Fix autopay" | `/billing/autopay` |
| ⌘K "Top up…" / "Billing" / "Autopay" | Sheet / Wallet / Autopay |
| Billing header "Top up" | Sheet over the current Billing tab |

### 2.5 Wallet tab layout

**Desktop ≥1440** (content 1208; overview container `--size-container-page` 1280, so fluid here; cards on the 12-column grid 7 + 5).

```
┌ Sidebar ┬─ Billing   Prepaid wallet · last top-up 21 Sep 2026 ··························· [Top up] ┐ 56
│ Account ├─ Wallet  Usage  Plans  Invoices  Autopay ─────────────────────────────────────────────────┤ 40
│▸Billing │ ┌ Wallet balance ⓘ ─────────────────────────────┐ ┌ Autopay ·················· [Off] ┐   │
│         │ │ ₹2,340.50                                      │ │ Top up automatically when your   │   │
│         │ │ About 16 h of phone calls at ₹0.04/s           │ │ balance runs low, so calls never │   │
│         │ │ Spent ₹1,284.60 this month · See usage         │ │ pause.        [Set up autopay…]  │   │
│         │ └────────────────────────────────────────────────┘ └──────────────────────────────────┘   │
│         │ Transactions  Last 30 days · 64 transactions   [📅 Last 30 days ▾] [≡ Filter] [Export CSV] │
│         │ ┌ When ↓        Description                         Amount   Balance after  Status   Ref ┐ │
│         │ │ Today         Call charges · 38 calls · 1h 12m    −₹172.80    ₹2,340.50  ✓ Completed … │ │
│         │ │ Yesterday     Meeting charges · 2 meetings        −₹98.40     ₹2,513.30  ✓ Completed … │ │
│         │ │ 21 Sep 2026   Top-up via UPI                     +₹500.00    ₹2,611.70  ✓ Completed … │ │
│         │ └ 1–25 of 64 transactions            Rows per page 25 ▾   Page 1 of 3   ‹  › ───────────┘ │
├─────────┴─────────────────────────────────────────────────────────────────────────────────────────┤
│ Baseline                                                                                            │ 28
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Laptop 1280–1439:** identical, cards 7 + 5. **1024–1279** (rail): cards 6 + 6; transactions P1–P2 (When, Description, Amount, Balance after, Status). **Tablet 768–1023:** the TopBar carries the H1 and the wallet chip; the header row keeps meta and **Top up**; route tabs scroll with an edge fade; the balance card is full width and the autopay card sits below it; the table shows P1 with the key column pinned. **Phone 320–767:** one column in the same order; transactions become ListRows.

```
┌ Billing              [₹2,340][⌕] ┐ 52
│ Last top-up 21 Sep     [Top up]  │ 48
│ Wallet Usage Plans Invoices Aut→ │ 40 (scrolls)
│ ┌ Wallet balance ──────────────┐ │
│ │ ₹2,340.50                    │ │ num-28 kept on phones
│ │ About 16 h of phone calls    │ │
│ │ at ₹0.04/s                   │ │
│ │ Spent ₹1,284.60 this month   │ │
│ └──────────────────────────────┘ │
│ ┌ Autopay ──────────────── Off ┐ │
│ │ Top up automatically…        │ │
│ │ [ Set up autopay…          ] │ │ full width, 44
│ └──────────────────────────────┘ │
│ Transactions            [Filter] │
│ Call charges · 38 calls −₹172.80 │ ListRow line 1 (amount trailing)
│ Today · Completed · ₹2,340.50    │ line 2: when · status · balance after
│ Top-up via UPI         +₹500.00  │
│ 21 Sep · Completed · ₹2,611.70   │
│ 1–25 of 64                ‹  ›   │
├──────────────────────────────────┤
│ BottomBar · More current         │ 56
└──────────────────────────────────┘
```

### 2.6 Wallet components and configuration

| Region | Component | Configuration |
|---|---|---|
| Header | `PageHeader` `variant="page"` (N §2), shared by all tabs | `navId="billing"`; meta "Prepaid wallet · last top-up 21 Sep 2026" (or "No top-ups yet"); primary **Top up** (`wallet` icon), `aria-disabled` with reason when offline or not permitted |
| Tabs | `RouteTabs` | §2.4 |
| Balance | `Card` plain (N §4) | Label `label-13` `--text-2` "Wallet balance" + info Tooltip "Prepaid. Calls, meetings and API use are charged from this balance."; value `num-28` tabular, 2 decimals (`formatMoney`); runway `body-14` `--text-2` from `formatRunway` (§3); meta `meta-12` "Spent ₹1,284.60 this month · **See usage**" |
| Balance: low | `StatusText` md warning inside the card | "Low balance · about 17 min of calls left. Calls pause at ₹0." (threshold: O §21 Q1) |
| Balance: empty | `Notice` `tone="warning" scope="inline"` inside the card | "**Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. **Top up**" (a link to the same sheet) |
| Autopay summary | `Card` plain + `StatusTag` (domain `autopay`, N §5.3) | Off: sentence + secondary "Set up autopay…" (→ `/billing/autopay`). On: "When below ₹200, add ₹500 · UPI a•••••@okaxis · **Manage**". Paused: "Couldn't top up on 24 Sep. The bank declined the debit." + secondary "Fix autopay…". Needs renewal: "Mandate ends 30 Sep." + secondary "Renew mandate…" |
| Transactions | Section heading `title-16` + `DateRangePicker` (C §7.1, presets This month · Last month · Last 30 days · This financial year · Custom) + `FilterBar` field Kind (Top-up, Autopay top-up, Call charges, Meeting charges, API charges, Refund, Adjustment) + tertiary "Export CSV" | `DataTable id="wallet-ledger" frame="framed"`, pager 25 · 50 · 100 |
| Ledger columns | When (P1, date for daily roll-ups, time for payments) · Description (P1, key link) · Amount (P1, right, tabular, "+₹500.00" / "−₹172.80" with a real minus, never coloured: the sign carries the direction, P2) · Balance after (P2, right) · Status (P2, `StatusTag` domain `payment`) · Reference (P3, `mono-12`) · Method (P4, "UPI · a•••••@okaxis") | Call and meeting charges are **daily roll-ups** (BL6), so 400 calls do not bury the top-ups |
| Transaction sheet | `Sheet variant="record"` + `KeyValueList` | Top-up: Wallet credit · Tax · Total charged · Method · UPI reference (mono, Copy) · Status · Started / Confirmed · Invoice "INV-2026-0142 · Download PDF". Roll-up: charge by product, "Open these calls in Call reports" (`/call-reports?range=<day>&columns=+cost`) |

UPI IDs are personal data: they are masked everywhere (first character, bullets, the handle: "a•••••@okaxis") and never placed in URLs or analytics.

### 2.7 Top-up sheet (`TopUpSheet`, new composition §3; `Sheet variant="gate"` 640, modal)

Mounted once in the AppShell and opened by `?topup=1` on any route (B2). It is a **money gate** (tier 4, O §3.1; `spec/02-components-gate.md` §5.6): the server quote is its consequence line and "Pay ₹590 via UPI" its one confirming action; this section configures the steps and copy.

**Step 1 · Amount**

```
┌ Top up wallet ················································· [×] ┐
│ Balance ₹42.10 · about 17 min of calls                                │
├───────────────────────────────────────────────────────────────────────┤
│ Top-up amount                                                         │
│ [ ₹100 ][▣ ₹500 ][ ₹1,000 ]   [₹ 500                         ]         │
│ Minimum ₹100 · maximum ₹1,00,000                                       │
│ Adds about 3 h 25 min of phone calls at ₹0.04/s.                      │
│                                                                       │
│ Wallet credit                                         ₹500.00         │
│ GST (18%)                                              ₹90.00         │
│ You pay                                               ₹590.00         │
│ New balance                     ₹542.10 · about 3 h 45 min of calls   │
│                                                                       │
│ Pay with any UPI app. Money is added when your UPI app confirms.      │
├───────────────────────────────────────────────────────────────────────┤
│ Autopay is off · Set up autopay               [Cancel] [Pay ₹590 via UPI] │
└───────────────────────────────────────────────────────────────────────┘
```

- `CurrencyInput` (C §4.2) `size="lg"`, label "Top-up amount", presets ₹100 · ₹500 · ₹1,000 (a radiogroup; ₹500 preselected, or `?amount=`), bounds and tax from the quote (BL3). Validation on blur and submit: "Enter an amount from ₹100 to ₹1,00,000." Never clamped (F-QA-021).
- Summary `KeyValueList` (rows variant, tabular, right-aligned values) comes from the server quote, so the client never computes tax. **The tax row renders only if the quote has one** (whether GST is added on top or included is open question 2).
- Runway lines are `aria-live="polite"`, throttled to 2 s (C §4.2).
- Footer: why-text "Autopay is off · **Set up autopay**" (only when autopay is off and the runway is under a day) · Cancel (tertiary) · primary **Pay ₹590 via UPI** (names the amount charged; "Pay via UPI" while the amount is invalid). Enter in the amount field = Pay. An idempotency key is created when the sheet opens (C §8.2 V11).

**Step 2 · Pay** (the body is replaced; header and a "Change amount" back link stay; uses **UpiPayment**, new §3)

```
┌ Top up wallet ················································· [×] ┐
│ ‹ Change amount                                                       │
│ Pay ₹590.00 with any UPI app                                          │
│ ┌────────────┐  1  Open any UPI app on your phone                     │
│ │  QR code   │  2  Scan this code                                     │
│ │  200 × 200 │  3  Approve ₹590.00 with your UPI PIN                  │
│ └────────────┘  Waiting for payment · 04:32 left                      │
│ ───────────────────────────── or ──────────────────────────────       │
│ UPI ID  [name@bank…                        ]  [Send request]          │
├───────────────────────────────────────────────────────────────────────┤
│ Keep this open, or close it: we'll add the money when UPI confirms.   │
│                                                     [Cancel payment]  │
└───────────────────────────────────────────────────────────────────────┘
```

- **Fine pointer / ≥768:** QR first (server-generated UPI intent string rendered as a QR, `role="img"` "UPI QR code to pay ₹590.00 to Vaani Labs"), then "Pay using UPI ID" (TextInput, validated "Enter a UPI ID, like name@bank.") where the provider supports collect requests.
- **Phone / coarse pointer:** primary full-width **Open UPI app** (the intent link), then "Pay using UPI ID", then a link "Show QR code" for paying from another phone. iOS app-switching is open question 3.
- The countdown is a `Timecode` in `meta-12` with tabular figures (a timer, F §2.3; Hanken, not mono), not announced except once at 1 minute left.
- **Hosted-checkout fallback** (BL4 interim): the body reads "Complete the payment in the payment window. Keep this tab open." Every result state below is unchanged.

**Result states** (all driven by the payment status from the server; "not charged" is claimed only when the server confirms it, O §16.2):

| State | Body | Footer |
|---|---|---|
| Preparing | Spinner md + "Preparing your payment…" | Cancel |
| Waiting | As drawn; request sent to a UPI ID: "Approve the request in the UPI app for a•••••@okaxis." | Cancel payment |
| Confirming | "Payment received. Adding it to your wallet…" | (none, Esc disabled briefly) |
| **Success** | `check` in `--success-text` + `title-16` "₹500 added" + "New balance ₹542.10 · about 3 h 45 min of calls" + KeyValueList: Amount paid ₹590.00 · UPI reference (mono, Copy) · Invoice INV-2026-0142 | Download invoice (tertiary) · **Done** (primary) |
| Declined | danger Notice "**UPI payment didn't complete.** You were not charged." + the bank's reason when given ("Declined by your bank", "Incorrect UPI PIN") | Change amount · **Try again** |
| Expired | neutral Notice "This payment request expired. Nothing was charged." | **Create a new request** |
| No answer yet | warning Notice "We haven't heard back from UPI yet. If money left your account, it will be added here or returned by your bank." · **Check status** | Close |
| Closed while waiting | The order continues on the server. The app shows **Payment pending** (info WalletNotice on money pages, O §10.2; info page Notice on Billing; a Pending ledger row) until the final state, then the toast "₹500 added. Wallet ₹542.10 · about 3 h 45 min of calls." | – |

The success toast is suppressed when the sheet itself showed Success (no double report); toasts that arrive while the sheet is open queue until it closes (O §1.6).

### 2.8 Autopay tab (`/billing/autopay`)

A form page in the `--size-container-form` (720) column. Setting up or renewing a mandate is a tier-4 gate: the page collects the rule, and the **Autopay gate sheet** (a money gate, G §5.6: gate 640, the same UpiPayment component in `mode="mandate"`) collects the one-time approval.

**Off** (and never set up):
- `title-16` "Autopay" + `StatusTag` Off. Body: "Top up automatically when your balance runs low, so calls never pause. You approve a UPI Autopay mandate once, in your UPI app."
- Field "Top up when the balance falls below" (CurrencyInput; default about 24 h of the workspace's median daily spend, rounded to ₹100, minimum ₹100). Hint: "About 5 h of calls. Your bank notifies you before each automatic debit, so money can take up to a day to arrive." (pre-debit timing: open question 4).
- Field "Amount to add" (CurrencyInput, presets ₹500 · ₹1,000 · ₹2,000). Hint: "Adds about 3 h 25 min of calls each time."
- Field "Monthly limit (optional)" (CurrencyInput). Hint: "Autopay stops for the rest of the month after this." Error: "Set a limit of at least ₹500, the amount added each time."
- Summary (inline `Notice` neutral): "When your wallet falls below ₹200, we add ₹500 from your UPI account, at most ₹2,500 a month."
- Primary **Review and approve…** → Autopay gate sheet: the summary as a KeyValueList (Trigger · Amount · Monthly limit · Mandate valid until · Largest single debit) + UpiPayment "Approve once with your UPI PIN". States: waiting for approval (countdown) · approved → the page shows **On** and a toast "Autopay is on. We'll add ₹500 when your wallet falls below ₹200." · declined · expired (same copy pattern as §2.7).

**On:** `StatusTag` On + `KeyValueList` rows: Rule "When below ₹200, add ₹500" · Monthly limit "₹2,500 · ₹500 used in September" with a ProgressBar · UPI account "a•••••@okaxis" · Mandate valid until "26 Sep 2027" · Last automatic top-up "21 Sep 2026 · ₹500 · Completed". Actions: secondary **Edit rule…** (Dialog md; raising the amount above the mandate's limit says "You'll approve the new amount in your UPI app" and routes through the gate) · tertiary **Turn off autopay…** at the end of the page, after a hairline (ConfirmDialog tier 2: "Turn off autopay? We'll cancel the UPI mandate. Calls pause when your wallet reaches ₹0 unless you top up." · Cancel · **Turn off autopay**).

**Paused** (a debit failed): page `Notice` danger, `role="status"`: "**Autopay couldn't top up on 24 Sep.** Your bank declined the debit (insufficient balance). Calls pause at ₹0." Actions, inside the Notice (O §10.1: one small secondary button plus one link): **Retry ₹500 now** (uses the approved mandate; the button names the amount) · link "Top up manually". The page's one primary stays "Top up" in the header. If the mandate itself was revoked, the action is **Set up again…**.

**Needs mandate renewal:** page `Notice` warning: "**Your autopay mandate ends on 30 Sep.** Renew it to keep automatic top-ups." Action inside the Notice: small secondary **Renew mandate…** (gate sheet, `mode="mandate"`).

**Cancelled outside Vaani** (from the UPI app): state Off with a neutral Notice "Autopay was cancelled from your UPI app on 22 Sep. Set it up again to resume automatic top-ups."
