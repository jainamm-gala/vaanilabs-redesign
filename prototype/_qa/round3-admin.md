# QA round 3: admin and auth pages

Pages: billing.html (5 tabs, top-up, autopay gate, 19 prototype states), settings.html (15 routes, guard, save, delete + Confirm it's you), assistant.html (new, chat_1/2/3, import, delete, edit draft, publish with and without errors, Call and Publish gates, History, send failure, 20 demo states), agents.html (Meetings, filter, room and meeting sheets, End room, Personal agents, New task, Send decision, Agent settings), login.html, signup.html, forgot-password.html.

Method: Playwright, isolated cookie-less contexts. Widths 1920, 1600, 1536, 1440, 1366×768, 1280×800, 1024×768 (fine and touch), 768×1024 touch, 390×844 / 375 / 360×780 / 320 mobile emulation. axe-core 4.10.2 (light and dark, desktop and 390), keyboard walkthroughs with `activeElement` sampled every 120–200 ms, an effective hit-area probe (`elementFromPoint` walk from each control's centre, so `::after` expansions count), text-size scan, reduced motion, forced `data-theme`. Every bug below was reproduced at least twice. Screenshots: `_shots/qa-r3-admin/` (114 files).

## Summary

- **R2A-03 (the only bug carried into this round) is fixed.** At 1366×768, 1280×800, 1024 and 1440, and with `?step=s3`, "Review and call…" is on screen and hit-tests to itself (`assistant-chat1-1366x768.png`).
- **Also fixed from round 2:**
  - R2A-01: non-modal popovers close on Tab-out and never leave focus on `<body>`.
  - R2A-02: Settings tables no longer scroll sideways at 1440, 1280 or 1024 (fine or touch), and row ⋯ stays visible at 768 touch.
  - Part of R1A-05: the wallet chip, the Agent settings back link and the Settings ListRow (the row click is delegated) now meet 44 px.
- **Still open from round 2:** R2A-04 through R2A-13 are all still reproducible, with R2A-08 now worse, plus the rest of R1A-05. They are listed again below with their ids.
- **New problems:**
  - The Meetings Filter popover is empty.
  - The ConsentBar covers the Create account button and the live password rules on the reference laptop.
  - Six smaller layout, focus and copy issues.
- **Checks that came back clean:**
  - axe: 0 violations in every state tested (81 runs).
  - 0 console errors and 0 `pageerror`s.
  - No page scrolls sideways at any width from 320 to 1920.
  - Reduced motion: the longest transition is 0.14 s and no animations run.

| Severity | Count |
|---|---|
| Blocker | 0 |
| Major | 3 (R3A-01, R3A-02, R2A-08 raised) |
| Minor | 18 |

## Round 2 regression check

| Id | Status | Evidence |
|---|---|---|
| R2A-03 Waiting step hidden at 1366/1280 | **Fixed** | Action row is sticky. At 1366×768 the buttons sit at y 659–691 and the plan foot at 703. At 1280×800 they sit at 691–723 and the foot at 735. |
| R2A-01 Popover Tab-out | **Fixed** | Billing Filter, Meetings Filter and Assistant History all close on Tab-out, and no focus lands on body. Billing has a small follow-up: R3A-10. |
| R2A-02 Settings tables scroll sideways | **Fixed** | Activity, API keys and Webhooks show 0 px in-frame overflow at 1440/1280/1024 and at 1024/768 touch. The 6 px left on Deliveries is part of R3A-04. |
| R2A-04 Focus on body in transient states | Open | See below |
| R2A-05 Autopay Declined/Expired focus | Open | See below |
| R2A-06 "Low" at ₹0 | Open | See below |
| R2A-07 No pager on Deliveries/Activity | Open | See below |
| R2A-08 Emails on phones | **Open, worse** | Text now overlaps; see below |
| R2A-09 StatTile strip at x 0 | Open | See below |
| R2A-10 Quote and passage touch | Open | See below |
| R2A-11 Publish-errors demo contradicts | Open | See below |
| R2A-12 Rail hides current item (1024 touch) | Open | See below |
| R2A-13 Auth lockup and legal links | Open | See below |
| R1A-05 Touch targets | Partly fixed | Wallet chip, Agent settings back link and Settings ListRow now pass. The rest is below. |

## Bugs

### Major

**R3A-01 · agents · The Meetings "Filter" popover has no filter options**
- Repro:
  1. Open `agents.html?view=meetings`.
  2. Under Past meetings, press **Filter**.
- Result:
  - The popover shows only the title "Filter past meetings", **Clear** and **Show meetings**. `#mt-filter-body` is empty (`innerHTML.length` 0, 0 inputs).
  - The same happens at 1440 and 390 (`agents-meetings-filter.png`, `agents-meetings-filter-390.png`).
  - The Agent and Notes filters cannot be used.
- Cause:
  - `pages/agents-boot.js:44` listens with `d.addEventListener('vaani:open', …)`.
  - `assets/shell.js` (lines 394, 462, 571) dispatches `new CustomEvent('vaani:open')` on the popover without `bubbles: true`, so the document listener never runs `M.renderFilter()`.
  - Billing and Knowledge attach the listener to the element, so they work.
- Fix: `$('#mt-filter-pop').addEventListener('vaani:open', M.renderFilter)`. Alternatively, dispatch `vaani:open` and `vaani:close` with `{ bubbles: true }` in shell.js, which also makes the document-level `vaani:close` in agents-boot.js:96 work.

**R3A-02 · auth · The ConsentBar covers the primary and the live password rules on the reference laptop**
- Repro 1: `signup.html` at 1366×768, first visit. The bar sits at [24, 600, 424, 744].
  - It covers the left 127 px of **Create account** (y 691–731).
  - It covers all three password rules ("At least 10 characters…", y 614–665), which update as you type.
  - It overlaps the bottom 9 px of the Password field (`signup-1366x768.png`).
- Repro 2: at 1280×800 it covers Create account and the Terms sentence.
- Repro 3: at 1440×900 it covers the Terms sentence (`signup-1440.png`).
- Repro 4: at 1024×768 on `login.html` it covers "Email me a sign-in link instead".
- Expected: 08 §4.4 "A non-modal panel … that never blocks the page". Sign-up happens on the first visit, which is exactly when the bar shows. The `scroll-padding-bottom` (184 px) protects only the focused element, not the rule feedback beside it.
- Fix:
  - On auth pages at ≥768, dock the bar below the auth panel, or give `.auth-page` a bottom padding equal to the bar height plus `--space-16`, so the panel can never sit under it.
  - Alternatively, place the bar bottom-left only when `(100vw − panel width) / 2 ≥ 400 + 2 × page margin`, and otherwise make it a full-width bottom band with matching page padding.

**R2A-08 (reopened, raised to major) · settings · Emails break mid-word on phones, and the invited row overlaps its role text**
- Repro 1: `settings.html#organization` at 320 and 360. In the invited row, "m•••@samplerealty.example" (`.settings-person-name`, right edge 219) runs over "Member · Invited" (left edge 165 at 320, 205 at 360). That is 54 px and 14 px of overlapping text (`settings-org-320-invited.png`).
- Repro 2: member emails wrap to 3–4 lines at 320 ("farah.kha / n@sample / realty.exa / mple") and names wrap ("Farah / Khan").
- Repro 3: at 360, Profile shows "anika.rao@samplerealty.exampl / e" beside a vertically centred label (`settings-profile-360.png`).
- Fix:
  - Below 480, stack the ListRow: name, then email on its own full-width line with `text-overflow: ellipsis` and the full address in a tooltip, then "Role · Last active" on a meta line.
  - Stack KeyValueList label above value below 480.
  - Never let `.settings-person-name` sit beside the meta without `min-width: 0`.

### Minor

**R3A-03 · shared · The Assistant header meta spills below the header and overlaps the thread at 1280 and 1024**
- Repro: `assistant.html?chat=chat_1` at 1280×800 or 1024×768.
  - The title and the meta wrap to two lines. The meta sits at y 40–60, but `#as-ph` stays 56 px tall.
  - "Started today 10:42 am · 0 changes" straddles the hairline.
  - At 1024 touch it overprints the scrolled thread text (`assistant-1024-header-chat1.png`, `assistant-chat1-1024t.png`).
- Cause: `.ph` is a flex item of `.app-main--frame` (column flex, `assets/components.css:757`) with the default `flex-shrink: 1`, so it is squeezed to its 56 px min-height.
- Fix: `.app-main--frame > .ph { flex-shrink: 0; }`.

**R3A-04 · settings · Webhook deliveries on phones hide the Response status; tablet frame scrolls 6 px**
- Repro: `settings.html#webhook-deliveries` at 390. The page renders a 2-column table (When, Event) with ⋯. Response (500 / 200 OK / Timed out), Webhook and Attempts are hidden, so you cannot see which deliveries failed (`settings-webhook-deliveries-390.png`).
- Repro: at 768 or 1024 touch the frame scrolls sideways by 6 px, with a visible scrollbar (`settings-deliveries-768t.png`).
- Expected: S line 1358, "API keys, Webhooks, Deliveries, Activity … phones: ListRows" (title = event, trailing = Response StatusTag, meta = webhook · when · attempts), as Activity and API keys already do.
- Fix: add the ListRow rendering for Deliveries below 768 and trim one column at touch 768–1023.

**R3A-05 · agents · The Personal agents task table clips its row ⋯ at 1024×768 touch**
- Repro: `agents.html?view=personal-agents` at 1024×768 with touch.
  - The frame scrolls sideways by 30 px.
  - "More actions for …" sits at x 987–1023, but the frame ends at 1009, so only "••" shows (`agents-pa-table-1024t-zoom.png`).
  - The header `th.c-act` is `position: sticky`, but the body `td` cells are `static`.
- For comparison: at 1100 touch and at 1024 fine pointer there is no overflow.
- Expected: 07 §2 "1024–1279: P1–P2 (Task, Status, Progress)" and ⋯ always reachable.
- Fix:
  - Make `tbody td.c-act` sticky (`right: 0`, surface background).
  - Hide Spent and Updated below 1100 when the pointer is coarse (they are P2 and 44 px buttons widen the actions column).

**R3A-06 · shared · Calling-hours time fields are 36 px on touch with no 44 px hit area**
- Repro: `settings.html#phone` at 390 or 768 touch. The 14 "Monday from…Sunday to" inputs are `input input--sm`, 36 px tall, and the hit area is 36 px (`settings-phone-hours-390.png`).
- Expected: C §3 "`sm` 36 (44 hit) (toolbars on data surfaces only)". Settings §13 asks for 44 px touch targets at 320.
- Fix:
  - Use the md field in this form.
  - Separately, give `.input--sm` a coarse-pointer hit area in `components.css` (`min-height: var(--size-hit-touch)` under `(pointer: coarse)`).

**R3A-07 · shared · On wide screens the Billing header does not line up with the centred content**
- Repro: `billing.html` (any tab) at 1600×900 and 1920×969. H1 and tabs sit at x 256, but the content in `.l-container` starts at 268 (1600) and 428 (1920) (`billing-1920.png`).
- Expected: 05 §151 "overview and form pages centre in their container, and the PageHeader aligns with that container, never with the viewport edge (F-VIS-034)". Settings already aligns.
- Fix: on overview pages, give `.ph` and the `.vtabs` inner row the same `max-width: calc(var(--size-container-page) + 2 * var(--page-margin)); margin-inline: auto` as `.l-container` (base.css:183), for example with a `.ph--contained` modifier.

**R3A-08 · assistant · The Call and Publish gates draw a focus ring on their titles**
- Repro: `assistant.html?chat=chat_1`, then Enter on "Review and call…". `H2#as-cg-t` "Call 10 leads" is focused with a solid outline box. The same happens with `H2#as-pg-t` "Publish v1" in `?scenario=publish` (`assistant-callgate-1440.png`, `assistant-publish-gate.png`).
- Expected: 06 §294 "Non-interactive programmatic targets (main, the H1, sheet titles) carry `data-focus-target` and draw no outline". Billing's gates do this (`#bill-ap-pay-h`, `#bill-pay-h`).
- Fix: add `data-focus-target` to both titles in `pages/assistant-gates.js`.

**R3A-09 · shared · Nav badge screen-reader labels don't pluralise**
- Repro: on any app page the Personal agents nav link reads "Personal agents 1 to confirm, **1 tasks** waiting for you to confirm".
- Cause: `count()` in `assets/shell.js:125` appends a fixed string. The same bug gives "2 flow with unpublished changes", "1 proposals to review", "1 callbacks due today" and "1 live calls".
- Fix: pass singular and plural (`count(n, 'to confirm', ['task waiting for you to confirm', 'tasks waiting for you to confirm'])`), as the Assistant badge already does.

**R3A-10 · billing · Tab-out of the Filter popover returns focus to the trigger instead of continuing**
- Repro: `billing.html`, Filter, then Tab past "Show 42 transactions". The popover closes, but focus lands on **Filter** again; the next Tab goes to Export CSV (`billing-filter-tabout.png`).
- For comparison: Meetings Filter and Assistant History continue to the next control.
- Cause: `pages/billing-wallet.js:170`, whose `overlayclose` handler re-renders and refocuses `#bill-kind-btn` for every close reason.
- Fix: skip the refocus when the close reason is `tab`, or refocus whatever the shell moved focus to.

**R2A-04 (reopened) · billing, agents · Focus drops to `<body>` during transient states**
- Repro 1: `billing.html`, Top up, then Ctrl+Enter. `activeElement` is BODY for about 900 ms (6 samples at 150 ms) while "Preparing your payment…" shows, until `H3#bill-pay-h`.
  - Cause: `pages/billing-topup.js` `pay()` (lines 93–103) replaces the body and footer without moving focus.
- Repro 2: Meetings, "End room…", Tab, Enter. Focus is BODY for about 840 ms before it lands on "Weekly demo · Sample Realty" (`agents-endroom-after.png`).
- Fix:
  - In `pay()`, call `focusHead('bill-tu-t')` (or focus the status line with `tabindex=-1`) before swapping.
  - In `pages/agents-rooms.js`, focus the next card title or `#mt-live-h` right after `R.refresh(r)`.

**R2A-05 (reopened) · billing · The Autopay gate's Declined and Expired results focus the button, not the result**
- Repro: Autopay, "Review and approve…", then prototype **Decline**. Focus goes to "Try again". **Let it expire** focuses "Create a new request" (`billing-autopay-Decline.png`). Approve correctly focuses `H2#bill-ap-h`.
- Fix: in `pages/billing-autopay.js` `renderGate()`, focus the notice title (`tabindex=-1`, `data-focus-target`) for the `declined` and `expired` steps.

**R2A-06 (reopened) · shared · The Top-up header says "Low" at ₹0**
- Repro: `billing.html?wallet=empty&topup=1` and `settings.html?wallet=empty&topup=1`. The subtitle reads "⚠ Low · Balance ₹0.00 · phone calls paused".
- Fix: in `sub()` (`pages/billing-topup.js:26` and `assets/topup.js`), show "Empty" (danger) at ₹0 and "Low" only when 0 < runway < 1 h.

**R2A-07 (reopened) · settings · Webhook deliveries and Activity have no pager**
- Repro: `#webhook-deliveries` reads "1–12 of 1,204 · newest first" and `#activity` reads "1–16 of 214 …", with no Previous or Next (`settings-webhook-deliveries-1440-bottom.png`, `settings-activity-1440-bottom.png`).
- Fix: render the shared pager and keep `page` in the hash query.

**R2A-09 (reopened) · shared · The phone StatTile strip starts at x 0**
- Repro: `billing.html#usage` at 375. `.stat-grid` has `scrollLeft` 16, the first tile starts at 0, and `scroll-padding-inline` is `auto` (`billing-usage-375.png`).
- Fix: add `scroll-padding-inline: var(--page-margin)` to `.stat-grid`.

**R2A-10 (reopened) · assistant · The transcript quote touches the text above and the passage below**
- Repro: `?chat=chat_2` at 1440. The paragraph ends at 290 and the quote starts at 290. The quote ends at 499 and the passage starts at 499. Both have `margin: 0px` (`assistant-chat2-1440.png`).
- Fix: `.as-quote, .as-passage { margin-inline: 0; margin-bottom: 0 }`, keeping the `.as-body > * + *` top margin.

**R2A-11 (reopened) · assistant · The "Publish: 2 errors" demo contradicts itself**
- Repro: `?scenario=publish&demo=publish-errors`.
  - The answer says "Festive offer callback has no issues".
  - The lookup line and step 1 say "No issues".
  - The card shows "✕ 2 errors" with a disabled "Review and publish…" (`assistant-puberr-1440.png`).
- Fix: switch the answer text, lookup line and step 1 result when `demo=publish-errors`.

**R2A-12 (reopened) · shared · At 1024×768 touch the rail hides the current page**
- Repro: `settings.html` with touch. `.rail-list` scrolls (645/547, `scrollTop` 0).
  - Settings (`aria-current`) sits at y 714–758, below the list's bottom (662), and hit-tests to the avatar.
  - The same happens with Billing on `billing.html` (668–712).
  - The Billing and Settings icons don't show at all (`settings-1024t-rail.png`).
- Fix: after rendering the rail, call `scrollIntoView({ block: 'nearest' })` on the `[aria-current=page]` item, or tighten the 44 px rail rows so the 13 items fit at 768 px tall.

**R2A-13 (reopened) · auth · Lockup and legal links miss 44 px on phones**
- Repro: login, signup or forgot at 390 touch.
  - "Vaani Labs home" has a 113×24 box with a 25 px hit area.
  - The footer "Privacy" hit area is 41 px wide; "Terms" and "Status" are 35 px wide.
- Fix: in `auth.css` under `(pointer: coarse)`, give `.auth-lockup` `min-block-size: var(--hit)`, and give legal links `min-inline-size: var(--hit)` with centred text.

**R1A-05 (reopened) · shared + pages · Remaining touch targets under 44 px**
- Measured by hit-testing at 390×844, 768 touch or 1024 touch:
  - Personal agents ApprovalCard "and 1 more · View all 3": 33 px tall.
  - Assistant chat_2:
    - "Open call": 17 px.
    - "Play from 00:02" (`.turn-tc`): 56×19.
    - "Open step: Greeting": 17 px.
    - Sources links "26 calls" and "Analytics · Thu 24 Sep": 18 px.
    - "Copy answer" and "Answer again": 39 px wide (adjacent hit areas).
  - Pager "Previous page" (Billing, Meetings, Personal agents): 41 px wide.
  - Settings `<summary>` "What each role can do": 29 px, with the UA triangle.
  - Meetings RoomCard title links: 21 px.
- Fix:
  - Give standalone `.as-a`, `.turn-tc`, `.turn-step` and `.btn--link` a coarse `::after` hit area (the pattern at `components.css:151`).
  - Use `gap: var(--space-8)` between adjacent `.ibtn--sm`.
  - Give `summary` `min-block-size: var(--hit)` and a Lucide chevron.

## Metrics

| Page | axe light / dark (states) | Console errors | Page overflow 320→1920 | Notes |
|---|---|---|---|---|
| billing | 0 / 0 (5 tabs, top-up amount + waiting, autopay; 390) | 0 (19 prototype states) | 0 | One filled button on Wallet in every wallet state. The top-up matrix 0/−50/5/99/100001/abc/"Rs 1,000"/750/500 passes. Double Pay gives 1 pending order. No ₹0.00 while loading. |
| settings | 0 / 0 (15 routes; 390) | 0 | 0 | In-frame overflow is 0 everywhere except Deliveries at touch (+6, R3A-04). The guard dialog, Save → "Saved 11:24 am", typed email (case-insensitive) → Confirm it's you trap and Esc all work. |
| assistant | 0 / 0 (new, chat_1/2/3, Call gate, publish-errors; 390) | 0 (20 demo states) | 0 | 720/440 at 1440; 720 composer at 1920. The thread is 658 px at 390×844 and 594 px at 360×780. The send-network failure announces once, assertively. `?step=s3` focuses the step. Delete needs "64". |
| agents | 0 / 0 (Meetings, Personal agents, Agent settings, Start, room sheet, meeting sheet, deck; 390) | 0 | 0 | Sheet overflow at 1024 touch is +30 px (R3A-05). Empty goal → "Describe the goal in a sentence."; dirty Esc → "Keep editing". Send updates Waiting and the badge. |
| login / signup / forgot | 0 / 0 (incl. `?method=link`) | 0 | 0 | 16 px / 44 px fields. The wrong-credential error clears the password and keeps focus. Link mode + Back works. Signup names the unmet rule and moves to verify with the H1 focused. |

- Reduced motion: the longest transition is 0.14 s, animations are 0.001 s, and no infinite or running animations.
- Forced `data-theme` light or dark overrides `prefers-color-scheme` on both app and auth pages.
- The skip link is the first Tab stop and moves focus to `main`. Focus rings are 2 px outlines (1.6 px computed at this host's 125 % DPR).

## Observations (not filed)

- On phones the ApprovalCard stacks differently on two pages:
  - Assistant: Skip · Edit, then the primary below.
  - Personal agents: the primary first, then Edit · Skip.
- Each follows its own page spec (02 §938 vs 07 §872), so the specs should agree on one order.
- Webhook deliveries uses a SegmentedControl "Show All · Failed" where S §7.9 says ViewTabs. Its label also sits 4 px higher than the neighbouring field labels.
- Esc on a gate while a focus tooltip is showing closes the tooltip first and the gate on the second Esc. This is correct per WCAG 1.4.13.
