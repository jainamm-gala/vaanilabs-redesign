## 4. Page header, top bar and `<title>` conventions

### 4.1 Fixed rules (every page spec follows them)

1. **One `PageHeader` per page, one H1.** The H1 is the destination's `label` from `lib/nav.ts`, or the record's own name on record pages. Today there are 13 H1 treatments, including 15 px tracked caps under 27 px section titles (F-VIS-005, F-VIS-010).
2. **One meta line of computed facts** (`data-13`, `--text-3`): counts first, then freshness, joined by " · ". Counts are pipeline-wide from the server, never the loaded page (F-QA-015). While loading, the meta is a skeleton bar, never "0" (F-UX-030).
3. **At most three visible actions and at most one primary**, which is always last. Destructive actions live in `⋯`, after a separator, in `--danger-text`, ending in "…" (F-UX-035, F-UX-047).
4. **Description row** only on overview, setup and form pages, never on data pages.
5. **Below the header**, in this order and only when they apply: one page `Notice` (the blocking-notice rule; part 3 §6), then view tabs, then the toolbar. Nothing global sits between the header and the work.
6. **Below 1024 px** the H1 moves into the TopBar title, secondary and tertiary actions fold into `⋯`, and the primary keeps its label. Headers wrap and never push the page sideways (F-RWD-007, F-RWD-008).

### 4.2 Per destination

Page specs may change which actions appear, within the rules above. The meta formulas are shell contracts: the Baseline, badges and meta use the same server numbers, so they never disagree (F-UX-011).

| Destination | H1 | Meta (examples; all computed) | Primary | Other visible actions |
|---|---|---|---|---|
| Home | Home | "2 of 5 done" | none in the header: the current setup step holds the page's one primary | Invite teammates… (tertiary, admins) |
| Cockpit | Cockpit | "2 live · 3 up next" / "No calls in progress" | none in the header: the Ready card holds **Place call…** | none |
| Assistant | Assistant | none | New chat | none |
| Rep console | Rep console | "You're available" / "You're not taking transfers" | Go available / Go unavailable | none |
| Meetings | Meetings | "1 live · 12 past" | Start a meeting | none |
| Personal agents | Personal agents | "3 tasks · 1 waiting for you" | New task | none |
| Flows | Flows | "16 flows · 3 live · 1 draft" | New flow | Import JSON… (tertiary) |
| Knowledge | Knowledge | "14 files · 1 indexing" | Upload files | Review proposals (admins; tertiary) |
| Leads | Leads | "1,284 leads · synced 11:24 am" | New lead | Import…, Export |
| Call reports | Call reports | "121 calls · 3 need review" (calls, not legs; tests excluded unless shown) | none | Export |
| Analytics | Analytics | "Last 7 days · updated 11:24 am" | none | Range select (in the toolbar, not the header) |
| Billing | Billing | "Wallet ₹2,340.50 · about 16 h of calls" | Top up | none; tabs below: Wallet · Usage · Plans · Invoices · Autopay |
| Settings › page | page name, e.g. "Phone setup" | none, or the page's status ("Verified", "Step 2 of 3") | none: forms save through the UnsavedChangesBar | none |

**Record and sub-pages** use `PageHeader variant="nested"`: a breadcrumb to the parent, the record name as H1 (`translate="no"`), and one state `Tag` ("Live v7"). Billing tabs are `RouteTabs` under the "Billing" H1; the tab name goes into `<title>`, not the H1. Settings pages show the "Settings" breadcrumb and their own H1; the 200 px Settings sub-nav stays visible on every Settings page (F-UX-027).

### 4.3 Top bar (tablet and phone)

| Slot | Tablet 768–1023 | Phone 320–767 |
|---|---|---|
| Leading | Menu button (`menu`, opens NavSheet) | Back link (`chevron-left` + parent label) on record and sub-pages, else nothing. **Never a menu button** |
| Title | The page H1 (`title-16`, one line, ellipsis, full text in a tooltip) | same |
| Chips | Call chip `● Live 02:14` (only during a call) · Wallet chip: `wallet` icon + `₹2,340`; warn: `triangle-alert` + `₹42.10 · Top up` / `₹0 · Top up` | same, with the priority rule (part 2 §3.4) |
| Trailing | Search (opens ⌘K) | Search (opens the full-screen palette) |

**One source.** TopBar, BottomBar and MoreSheet read only `lib/nav.ts` (§2.6) and the §5.2 copy. The BottomBar is the four `phoneSlot` entries in slot order plus More (`ellipsis`), with full labels ("Call reports", never "Reports"). It shows on every phone destination page, including the Flow Designer outline (Flows current; 05-responsive §4.1, §10.5), and hides only while a full-screen sheet or full-screen task flow is open (record sheet, Call gate, Publish gate, text test, New task, Top up) or the on-screen keyboard is up (05-responsive §7.3). Reference mocks render all three from `spec/components/shell-partials.js`.

### 4.4 `<title>`

Pattern: `[state · ][record · ]Label · Vaani Labs`, joined by " · " (a middle dot with spaces), sentence case. Today every route is "Vaani Labs - The Voice AI that speaks India" (F-A11Y-013).

| Context | `<title>` |
|---|---|
| Destination | `Leads · Vaani Labs` |
| Tab or sub-page | `Usage · Billing · Vaani Labs` · `Phone setup · Settings · Vaani Labs` |
| Record sheet open | `Lead 1042 · Leads · Vaani Labs` · `Call on 21 Sep · Call reports · Vaani Labs` |
| Flow Designer | `Site-visit qualifier · Flows · Vaani Labs` |
| Flow Designer with a failed save | `Couldn't save · Site-visit qualifier · Flows · Vaani Labs` |
| Your own call is live | `On call · Cockpit · Vaani Labs` (no ticking timer in the title) |
| Home | `Home · Vaani Labs` |
| Not found · no access · page error | `Page not found · Vaani Labs` · `No access · Knowledge · Vaani Labs` · `Couldn't load · Call reports · Vaani Labs` |
| Auth (bare) | `Sign in · Vaani Labs` · `Create account · Vaani Labs` · `Create workspace · Vaani Labs` · `Reset password · Vaani Labs` |

Rules: record names are truncated at 60 characters with "…"; overlays (palette, dialogs) never change the title; the title is set from `lib/nav.ts` plus the record name, never typed by a page. Telemetry uses the route template, never `document.title`, because titles can contain lead names (F-UX-045).

### 4.5 Acceptance criteria: headers and titles

- [ ] Every signed-in route has exactly one `h1`, styled `title-20` (≥1024) or `title-16` in the TopBar (<1024); its text equals `NAV[id].label` or the record name.
- [ ] No meta line shows "0" while its query is pending; a failed count reads "Couldn't load counts · Retry".
- [ ] No header shows more than one filled Neel button; no destructive action is outside `⋯`.
- [ ] At 360 px no header scrolls the page sideways (`documentElement.scrollWidth === innerWidth`) and the primary stays visible (F-RWD-007, F-RWD-008).
- [ ] `document.title` is unique per route and matches the table; a crawl of every route in §2.3 finds no duplicate titles.

---

## 5. The Baseline (workspace status band)

**Purpose.** A 28 px ink band under every desktop and laptop screen that states **only computed facts** about the workspace: what is live, whether calls can be placed, the wallet and its runway, and calls in progress. It replaces the 42 px wallet banner and the fake "SYS: ONLINE · 12ms · RGN" footer (F-UX-028, F-UX-018). It is the product's first signature (direction §6.1). **Not specified in the component specs; this section is its spec** (part 6 lists it as a new component).

### 5.1 Anatomy and tokens

| Part | Value |
|---|---|
| Band | height `--size-baseline`; `--bl-bg`; top border `--bw-hairline` `--bl-line` (visible in dark only); padding `0 var(--space-12)`; `meta-12` in `--bl-text`; `white-space: nowrap; overflow: hidden`; `z-chrome`; it spans the content column, not the sidebar |
| Segment | inline-flex, gap `--space-6`; text only, except the warn `triangle-alert` (`--icon-sm`, `currentColor`) and your call's `LiveDot`; values (version, number, amounts, counts) in `--bl-strong` 500; the number and timers in `mono-12`, all else Hanken `meta-12`; separated by a 1×12 px `--bl-sep` rule and `--space-12` |
| Link | each segment is one `<a>`; underline on hover; focus `outline: 2px solid var(--bl-focus); outline-offset: -2px` |
| Warn segment | `--bl-warn` text and a `triangle-alert` icon; the action word ("Top up") is underlined; the only third colour allowed in the band |
| Live mark | `LiveDot` (8 px, `--live`, `data-mark`), pulsing only during your own live call |
| Right cluster | "Shortcuts" (opens the `?` sheet) · "Search" (opens ⌘K), as text buttons in `--bl-text` |

### 5.2 Segments

Fixed order, left to right. A segment appears only when it has something true to say; at most five. **These strings are the copy contract**, exact to the word, case and " · " separator, followed by the words "Shortcuts" then "Search". One copy module (`lib/baseline-copy.ts`) feeds the band, BaselineChip, BaselineList and the TopBar wallet chip; no page composes its own. Zero states are omitted, never printed ("No calls in progress" is Cockpit header meta, §4.2, not a segment).

| # | Segment | Normal | Other states (in priority order) | Link |
|---|---|---|---|---|
| 1 | **Live flow** | `Live v7 · Site-visit qualifier` (the flow that answers the primary inbound number, else the outbound default); `+ 2 more` when more are live | ⚠ `No live flow · Publish one` · during setup, once published: `Published v1 · Site-visit qualifier` (neutral) · interim before revisions ship (Flow Designer part 2 §4.9, I1): `Saved flow · Site-visit qualifier` (no version claimed) | `/flows/<id>`; "+2 more" → `/flows?status=live` |
| 2 | **Phone line** | `Inbound +91 80 •••• 2210 · Ready` (`PhoneText`, tabular digits) | ⚠ `No calling number · calls can't be placed · Finish setup (3 of 5)` · `Verifying number · step 2 of 3` (neutral) · `Inbound +91 80 •••• 2210 · Verified` (neutral; another setup check still blocks calls) · ⚠ `Number not verified · Verify` · ⚠ `Phone line degraded · Status` (a real incident, §7) | `/settings/phone`; "Status" → the public status page (new tab) |
| 3 | **Wallet** | `Wallet ₹2,340.50 · about 16 h of calls` | ⚠ `Wallet ₹42.10 · about 17 min · Top up` · ⚠ `Wallet ₹0 · calls paused · Top up` · ⚠ `Autopay failed · Fix` · `Wallet ₹42.10 · payment pending` (neutral) · runway unknown: `Wallet ₹2,340.50` | `/billing/wallet`; "Top up" → `?topup=1`; "Fix" → `/billing/autopay` |
| 4 | **Activity** | `2 calls in progress` · `Batch · 12 of 40 placed` (the workspace's other calls; yours is segment 5) | omitted when nothing is running | `/cockpit` |
| 5 | **You** | during your own call: ● `On call 02:14 · Lead 1042` (tabular `Timer`) · for reps: `Available for transfers` | hidden otherwise | `/cockpit?call=<id>` · `/rep-console` |

Runway ("about 16 h") is computed from the real per-second rate and median call length; until those endpoints exist the runway is omitted, never estimated (direction §8, interim behaviour).

### 5.3 Width behaviour

Content widths below 1100 px (the rail layout, or a docked sheet) use short forms, applied in this order until the band fits: (1) the flow name drops (`Live v7`); (2) "Shortcuts" and "Search" become icon buttons with labels in their names and tooltips; (3) the number drops its digits (`Inbound · Ready`); (4) the word "Wallet" drops (`₹2,340.50 · 16 h`); (5) the Activity segment drops (the Cockpit badge still carries it). **An amber segment is never shortened below its action word and never dropped.**

### 5.4 Folded: BaselineChip and BaselineList

- **BaselineChip** (≥1024 wide, ≤720 tall): a `--size-chip` chip in the PageHeader, left of the actions. It shows the highest-priority fact: an amber segment if any (`₹0 · calls paused`), else your call (`● On call 02:14`), else the wallet short form (`₹2,340`). Warn styling = `warning-soft`/`warning-text`/`warning-border`, like the TopBar wallet chip. Activating it opens a Popover with the **BaselineList**. **It is not an edge case:** 1366×768 and 1280×720 laptops (inner viewports about 1366×657 and 1280×609, `05-responsive` §2.1) are always ≤720 tall, so on the most common office laptop the chip is the primary workspace-status surface. Its accessible name states the fact in full ("Workspace status: wallet ₹42.10, about 17 minutes of calls. Top up. 4 more"), it announces the same state changes as the band (§5.6), and the chrome budget and visual tests run at those sizes (§3.5, §3.10).
- **BaselineList**: the same segments as 44 px rows (icon · sentence · chevron), used in that Popover, in the tablet NavSheet and in the phone MoreSheet under the label "Workspace status". The tablet and phone TopBar chips still show call and wallet.

### 5.5 States

| State | Treatment |
|---|---|
| Loading | Segment labels render; values are `--bl-sep` bars 8 px tall (no shimmer) |
| Error | One neutral segment `Couldn't load workspace status · Retry`; nothing is shown as healthy |
| Offline | Values stay, and the wallet segment appends `· as of 11:42 am`; the ConnectionBar says the rest |
| Setup incomplete | Segments 1 and 2 state the blocking facts with `Finish setup (3 of 5)`, or `Published v1` / `Verified` once their step is done; nothing says "Live" or "Ready" until all five checks pass (F-UX-006) |

### 5.6 Accessibility

Region "Workspace status"; each link has a full name ("Wallet ₹42.10, about 17 minutes of calls. Top up"). **Only state changes are announced, debounced 2 s**: your call goes Live or Ended; the wallet crosses into Low or Empty; the line becomes degraded or recovers. Timers, wallet decrements and cost-so-far are never announced (direction §8). Forced colours: the band keeps `Canvas`/`CanvasText` with a 1 px `CanvasText` top border; warn segments keep their icon.

### 5.7 Acceptance criteria: Baseline

- [ ] Present on every desktop and laptop route except the Flow Designer; absent below 1024 and folded at ≤720 px tall.
- [ ] Every value traces to a server field; with the network blocked, no segment reads as healthy (no constant "online" state; F-UX-018).
- [ ] At 1024×768 in the rail layout, an amber wallet segment keeps "Top up" visible.
- [ ] A screen reader hears one announcement when the wallet crosses into Low, and none while a call timer runs.
- [ ] **Byte-identical for the same state.** Every route renders the band through the one `Baseline` fed by `useWorkspaceState()`; a snapshot test gives each route the same fixture and compares the band's `outerHTML`, which must match exactly (the reference mocks compare its inner markup, since each mock frame adds its own layout wrapper). For the healthy fixture it reads `Live v7 · Site-visit qualifier` | `Inbound +91 80 •••• 2210 · Ready` | `Wallet ₹2,340.50 · about 16 h of calls` | `Shortcuts` `Search`, with no Activity segment. Every page mock in `spec/03-pages/` passes the same check, because all of them render it from `spec/components/shell-partials.js`.

---

## 6. Wallet balance and low balance

### 6.1 What changes

| Today | After |
|---|---|
| A 42 px blue-tint `role="alert"` bar on every page, Billing included, 58–77 px on phones, rendered about 3 s late, pushing content down (F-UX-028, F-RWD-013, F-QA-036, F-A11Y-015) | A signal ladder that never takes permanent space (overlay §10.2) |
| "Top up" and "Enable autopay" open Settings › Profile, which has no wallet (F-UX-002, F-QA-004) | Every "Top up" opens the Top-up sheet in place; "Turn on autopay" opens `/billing/autopay` |
| "Wallet empty — top up now to keep calls flowing." while CONNECT stays enabled | "Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work." plus a reason on every Call action |
| Dismissal lasts one tab (`sessionStorage`) | Dismissal lasts 24 h per user and per state, stored server-side; a worse state brings it back |

### 6.2 States (computed server-side)

`healthy` · `low` (runway below the threshold; proposed 60 min, part 6) · `empty` (₹0 or below one minimum call) · `pending` (a UPI payment is awaiting confirmation) · `autopay-failed` · `unknown-runway` (rate endpoints not shipped).

### 6.3 Where each state shows

| Surface | healthy | low | empty | pending | autopay-failed |
|---|---|---|---|---|---|
| Baseline wallet segment (≥1024) | `Wallet ₹2,340.50 · about 16 h of calls` | ⚠ `Wallet ₹42.10 · about 17 min · Top up` | ⚠ `Wallet ₹0 · calls paused · Top up` | `Wallet ₹42.10 · payment pending` | ⚠ `Autopay failed · Fix` |
| TopBar wallet chip (<1024) and Flow header | `₹2,340` neutral | ⚠ `₹42 · 17 min` | ⚠ `₹0 · Top up` | `₹42 · pending` | ⚠ `Autopay failed` |
| Billing nav badge | none | ⚠ Low | ⚠ Empty | none | ⚠ Blocked |
| `WalletNotice` (page scope) on **Cockpit, Leads, Flows (Test call), Rep console, Personal agents** only | none | warning: **Wallet is low.** ₹42.10 left, about 17 min of calls. · Top up · Turn on autopay | warning: **Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. · Top up | info: **Payment pending.** Your wallet updates when UPI confirms. | danger: **Autopay couldn't top up.** Your UPI mandate was declined. Calls pause at ₹0. · Fix autopay |
| Every Call action and the Call gate | enabled | enabled; the gate shows the runway | disabled: "Wallet is ₹0. Top up to place calls." | enabled if the balance covers the call | as low or empty |
| Billing, Settings, Analytics, Knowledge, Call reports | **no notice**; the Billing page states the balance itself | | | | |

On phones the WalletNotice is one line ("Wallet ₹0 · calls paused") with a 44 px Top up and a 44 px Dismiss, 8 px apart (F-RWD-013). The state is resolved in the server layout, so the notice is in the first paint and never shifts content (F-QA-036).

### 6.4 Top-up links

- Any "Top up" control calls `openTopUp({ source })`, which adds `?topup=1` to the **current** URL and opens `TopUpSheet` over the page (Billing spec owns its content: UPI first, ₹100 / ₹500 / ₹1,000, the runway before paying). Closing it removes the param; Back closes it.
- From outside the app (emails, WhatsApp, docs): `/billing/wallet?topup=1` (`/billing?topup=1` also resolves).
- Legacy `/settings#wallet` → the referring page with `?topup=1` (in-app link) or `/billing/wallet?topup=1`; `/settings#autopay` → `/billing/autopay` (as in `05-knowledge-billing` §1).
- After the provider confirms: success toast "₹500 added. Wallet ₹540.10 · about 3 h of calls." Before confirmation: the pending state, never a balance that has not arrived (P1).
- **If the member role cannot pay** (open question): every "Top up" becomes "Ask an admin to top up", which copies a request link; the notice copy stays.

### 6.5 Acceptance criteria: wallet

- [ ] A link check finds no in-app href to `/settings#wallet` or `#autopay`; each Top up entry (Baseline, chip, notice, badge popover, palette, setup step) opens the Top-up sheet over the current page (F-UX-002).
- [ ] At ₹0 no Billing, Settings, Analytics, Knowledge or Call reports page shows a wallet notice, and no page shows more than one.
- [ ] Dismissing the empty notice survives a new tab and a reload for 24 h, and reappears when the state worsens to autopay-failed.
- [ ] The notice never uses `role="alert"`; dismissing it moves focus to the H1 (F-A11Y-015).
- [ ] Layout shift from the notice is 0 (CLS) because it is server-rendered.

---

## 7. System status

### 7.1 Removed

The rail footer's "SYS: ONLINE", the random 8–22 ms latency and "RGN: Mumbai-1" are deleted, along with the Cockpit's idle "LAT: 0ms" and "SESSION: IDLE" (F-UX-018; direction §4.4). Nothing in the idle product claims health.

### 7.2 Real signals and where they show

| Signal | Source | Shows as |
|---|---|---|
| This browser is offline | `offline` event, or two consecutive failed requests | `ConnectionBar` (overlay §10.3); on recovery a toast "Back online." |
| Our API is failing | 5xx or timeouts on a region's request | `SectionError` with the last good data ("Couldn't refresh · Retry · Updated 4:42 pm"); never an empty state |
| An incident affects calling (telephony or payments) | The status service's component state, read server-side every 60 s | Baseline line segment ⚠ `Phone line degraded · Status`, plus a warning `Notice` on the spending pages: **Calls may fail to connect right now.** We're working on it. Updated 11:40 am · Service status. On resolution: toast "Calling is back to normal." |
| Planned maintenance | Status service, 24 h ahead | info `Notice` on spending pages: **Maintenance on 30 Sep, 1 am to 2 am IST.** Calls can't be placed during this window. |
| Line quality on a live call | The call's media stats | `LineQuality` in the Cockpit call card ("Line · Good · 180 ms"); only during a call (data-nav §12.2) |
| Rep availability | Rep console presence | Rep console header meta and the Baseline "You" segment; never set on page load (F-UX-023) |

**Help › Service status** (account menu) opens the public status page in a new tab, with an `external-link` icon; it is the only place a user looks for overall health.

### 7.3 Acceptance criteria: status

- [ ] Grep finds no "SYS", "LAT:", "RGN" or `Math.random` in the shell bundle.
- [ ] With the tab offline for 12 s, the ConnectionBar appears within 2 s and no element anywhere reads "online" (the audit's reproduction, F-UX-018).
- [ ] A simulated calling incident shows the notice on Cockpit and Leads but not on Analytics, and turns the Baseline line segment amber.
