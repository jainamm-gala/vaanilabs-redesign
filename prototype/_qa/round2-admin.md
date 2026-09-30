# QA round 2: admin and auth pages

Pages: billing.html (5 tabs, top-up, autopay, record sheet, member state), settings.html (all 15 routes incl. webhook deliveries), assistant.html (new, chat_1/2/3, import, delete, edit draft, publish with errors, send failure, Call gate, History), agents.html (Meetings, Start sheet, Room ready, room/meeting sheets, deck dialog, Personal agents, New task, task sheet, Agent settings), login.html, signup.html, forgot-password.html.

Method: Playwright in isolated cookie-less contexts. 1440, 1366×768, 1280, 1024 (fine and coarse pointer), 768 touch, 390/375/360/320 mobile emulation. axe-core 4.10.2 (light and dark), keyboard walkthroughs, focus tracing (activeElement sampled every 150–250 ms), effective hit-area probe (elementFromPoint scan, so `::before/::after` expansions count), text-size scan, reduced motion. Every bug below was reproduced at least twice.
Screenshots: `_shots/qa-r2-admin/` (129 files).

## Summary

Round 1 fixes landed well: 18 of the 19 round-1 bugs are fixed. R1A-05 (touch targets) is only partly fixed and is reopened. axe reports 0 violations on every page and state tested, in both themes. There were 0 console errors and 0 `pageerror`s. No page scrolls sideways at any width from 320 to 1920.

New problems:
- A shared keyboard bug: non-modal popovers leak focus to `<body>` and stay open.
- Settings data tables scroll sideways inside their frames on laptops and tablets, which pushes row actions off-screen.
- On the most common Indian laptop size, the Assistant's waiting step hides its own primary action.
- A handful of smaller focus, copy and visual issues.

| Severity | Count |
|---|---|
| Blocker | 0 |
| Major | 3 |
| Minor | 11 (incl. reopened R1A-05) |

## Round 1 regression check

| Id | Status | Evidence |
|---|---|---|
| R1A-01 Top up leaves the page | Fixed | `settings.html?topup=1` and Assistant `chat_1&wallet=empty` open the shared sheet in place; Esc returns focus to the trigger (`assistant-topup.png`) |
| R1A-02 Autopay approve → body | Fixed | Focus lands on `H2#bill-ap-h` |
| R1A-03 Assistant 390 primary under dock | Fixed | "Review and call…" at y 613–657, hit-test hits itself (`assistant-390-chat1.png`) |
| R1A-04 ConsentBar covers focus | Fixed | 1024 and 390 walks: no focused element under `.auth-consent` |
| R1A-05 Touch targets | **Partly fixed, reopened** | See below |
| R1A-06 Range picker → H1 | Fixed | Focus returns to the range trigger |
| R1A-07 Filter focus on Clear | Fixed | First checkbox is focused |
| R1A-08 Declined result focus | Fixed for top-up | Declined focuses `H3#bill-res-h`. The same pattern remains in the Autopay gate (R2A-05) |
| R1A-09 Empty Status column | Fixed | "✓ Completed" tags |
| R1A-10 Method column overflow | Fixed | Ledger 1143/1143 in autopay-failed |
| R1A-11 "Ask Anika R.." | Fixed | Member is Kiran P.; the tooltip reads "Ask Anika R." |
| R1A-12 Meetings rate conflict | Fixed | Rates table and PAYG card both show ₹2.40/min after 30 free minutes |
| R1A-13 New mandate history | Fixed | "₹0 used" and "None yet" |
| R1A-14 Members table at touch | Fixed | 0 px in-frame overflow at 768/1024 touch |
| R1A-15 Agent settings alignment | Fixed | H1 and form both at x 256 |
| R1A-16 Agent settings save | Fixed | "✓ Saved 11:24 am" by the section; focus stays on the radio; no toast |
| R1A-17 New task order | Fixed | New task is first in Active; a double click creates 1 |
| R1A-18 Phone header wrap | Fixed | Actions stay on the meta row at 320/360/390; no line starts with "·" |
| R1A-19 Prototype states covers content | Fixed | The button is in the PageHeader on every page |

## Metrics

| Page | axe light / dark | Console errors | Page overflow 320→1920 | In-frame overflow | Notes |
|---|---|---|---|---|---|
| billing | 0 / 0 (5 tabs, top-up amount + UPI step) | 0 | 0 | 0 at all widths | Top-up validation matrix passes on both the Billing sheet and the shared sheet |
| settings | 0 / 0 (15 routes) | 0 | 0 | Activity +30 (1440), +190 (1280), +270 (1024), +303 (touch 768–1024); API keys +60 (1024), +128 (touch); Webhooks +47 (1024), +107 (touch) | Guard dialog, typed-email delete, Confirm it's you, and Save → "Saved 11:24 am" all work |
| assistant | 0 / 0 (9 states + Call gate) | 0 | 0 | 0 | 720 conversation / 440 panel at 1440. Thread 613 px at 390×844, 586 px at 360×780 |
| agents | 0 / 0 (8 states) | 0 | 0 | 0 | Empty title error, dirty-close discard, and a single room on double Ctrl+Enter all work |
| login / signup / forgot | 0 / 0 (5 states) | 0 | 0 | 0 | 16 px / 44 px inputs on phones; `noValidate`; `?method=link` + Back |

Reduced motion: the longest transition is 0.14 s, animations are 0.001 s, and no infinite animations run. Note: axe itself logs file:// CORS XHR errors unless `preload:false` is passed. These are not page errors.

## Bugs

### Major

**R2A-01 · shared · Non-modal popovers lose focus to `<body>` on Tab and stay open** (`assets/shell.js`, `V.popover.open`)
- Repro:
  - Billing: focus "Filter", press Enter, then Tab 10 times.
  - The same happens with Meetings "Filter" and Assistant "History".
- Result:
  - After the last control ("Show 42 transactions"), `activeElement` is BODY.
  - The next Tab lands on "Skip to main content" at the top of the page.
  - The popover stays open (`hidden=false`) over the content.
- Expected: O §421 "Tab past the last element closes and continues (non-modal)". Also WCAG 2.4.3.
- Cause: popovers are portaled at the end of `<body>`. The `focusout` handler only closes when `relatedTarget` is an element outside the popover. Tabbing off the document end gives `relatedTarget === null`, so it never closes.
- Fix: in a `keydown` handler for non-modal popovers, when Tab is pressed on the last focusable (or Shift+Tab on the first), `preventDefault()`, close with reason `tab`, and focus the next (or previous) tabbable element after the trigger in DOM order. Also treat `relatedTarget == null` as leaving the popover.

**R2A-02 · settings · Activity, API keys and Webhooks tables scroll sideways inside their frames on laptop and tablet; row ⋯ actions are off-screen**
- Repro: `settings.html#activity` at 1440×900. The table scrolls +30 px and "Device" is cut ("Chrome on Windo", `settings-activity-1440.png`). At 1280 it is +190 px (IP and Device clipped).
- Repro: `#api-keys` and `#webhooks` at 1024×768 with touch, or 768×1024 touch. "More actions for CRM hook" sits at x 834, past the frame edge at 744 (`settings-api-keys-1024-touch.png`, `settings-webhooks-768t.png`).
- Expected (N §7.5/§7.13, S §11): show P1–P3 at ≥1280 and P1–P2 at 1024–1279 with no sideways scroll by default. At 768–1023, scroll with the key column pinned left and the actions column pinned right, so ⋯ is always visible.
- Fix:
  - Give each Settings DataTable column a priority. Activity: IP and Device are P3/P4. API keys: Created and Last used are P2/P3. Webhooks: Last delivery is P2.
  - Hide them by breakpoint, as Agents does with `.ag-p2`.
  - Make the first `th/td` `position:sticky; left:0` and the actions cell `right:0` inside `.dt-wrap`. Use `data-scrolled-x` for the pinned-edge hairline.

**R2A-03 · assistant · At 1280×800 and 1366×768 the waiting step's actions are hidden below the plan panel on load**
- Repro: `assistant.html?chat=chat_1` at 1366×768. The panel auto-scrolls to the step (`scrollTop` 200), but "Skip step · Edit… · Review and call…" are at y 721–753. The panel body ends at 703 and `elementFromPoint` hits `.as-plan-foot` (`assistant-1366x768.png`). The same happens at 1280×800 (panel ends at 735).
- For comparison: at 1024 the action row is `position: sticky` (visible), and at 1440×900 it fits.
- Expected: the page's main task (Review and call) is visible without hunting at the reference laptop size (05-responsive, 1366×768 "common Indian office laptop"). "A waiting ApprovalCard … usable at every breakpoint". Same class of issue as R1A-03 on phones.
- Fix: apply the 1024 sticky action row (`position: sticky; bottom: 0`) to the ApprovalCard actions whenever the card is taller than the panel viewport. Alternatively, after the auto-scroll, call `actions.scrollIntoView({ block: 'nearest' })` so the actions end above `.as-plan-foot`.

### Minor

**R1A-05 (reopened) · shared + pages · Remaining touch targets below 44 px on coarse pointers**
- Fixed since round 1: `.ibtn--sm` alone, `.th-sort`, `.vtab`, `.select--sm`, the wallet info button, and the "‹ Settings" back link now reach 44.
- Still small, measured by hit-testing at 390×844 or 768 touch:
  - `.btn--link` "and 1 more · View all 3" (Personal agents ApprovalCard): 32 px tall.
  - Assistant `.as-a` standalone links: "and 9 more · Open in Leads" is 18 px.
  - Transcript quote controls: `.turn-tc` "Play from 00:02" is 56×18 and `.turn-step` "Open step: Greeting" is 16 px.
  - Assistant answer actions ("Copy answer", "Answer again", "Copy message") are 38×44. Their hit areas overlap because the gap is only about 2 px.
  - Pager "Previous page": 40×44.
  - Settings Activity phone ListRow link: 38 px inside a 56 px row. It is not stretched; spec N §7.13 says "key link covers the row".
  - `<summary>` "What each role can do": 28 px, with the default UA triangle marker.
  - Meetings RoomCard title links on phones: 20 px.
  - Agent settings back link "Personal agents": 33 px.
  - TopBar wallet chip: 42.4 px, because `.topbar .chip::before` offsets are computed from the border-box height but positioned against the padding box.
- Fix:
  - Give standalone links a `min-block-size: var(--hit)` inline-flex box, or a `::after` hit area under `(pointer: coarse)`.
  - Use `gap: var(--space-8)` between adjacent `.ibtn--sm`.
  - Use the stretched-link pattern on `.settings-list-main` (`::after { inset: 0 }` on the row).
  - Chip: `top/bottom: calc((var(--size-hit-touch) - var(--size-chip)) / -2 - var(--bw-hairline))`.

**R2A-04 · billing, agents · Focus drops to `<body>` during transient states**
- Repro 1: `billing.html?topup=1`, then Ctrl+Enter. `activeElement` is BODY for about 900 ms while "Preparing your payment…" shows. `pages/billing-topup.js:100` replaces the body and footer and removes the Pay button. The shared `assets/topup.js` already calls `focusHead('vaani-tu-t')` here.
- Repro 2: Meetings, "End room…", Tab to "End room", then Enter. Focus is BODY for about 750–900 ms until it moves to the next card title. `R.refresh(r)` in `pages/agents-rooms.js` re-renders the card and removes the restored trigger.
- Expected: focus never lands on body (06 §7.3; gate §4.1 Confirming keeps a busy primary).
- Fix: in billing, focus `#bill-tu-t` (tabindex -1) before swapping the body, or let Billing use `V.topUpSheet`. In agents, focus the ending card's title (or `#mt-live-h`) immediately after `R.refresh(r)`.

**R2A-05 · billing · Autopay gate Declined and Expired results move focus to the button, not the result**
- Repro: Autopay → "Review and approve…" → prototype "Decline". Focus goes to "Try again". "Let it expire" focuses "Create a new request".
- Expected: the result notice or heading is focused (05 §2.15, as the R1A-08 fix did for top-up).
- Fix: `pages/billing-autopay.js` `renderGate()` line 117: for the `declined` and `expired` steps, give the notice title an id with `tabindex=-1` and focus it instead of `#bill-ap-foot .btn--primary`.

**R2A-06 · shared · The Top-up sheet header says "Low" when the wallet is ₹0**
- Repro: `billing.html?wallet=empty&topup=1` or `settings.html?wallet=empty&topup=1`. The subtitle reads "⚠ Low · Balance ₹0.00 · phone calls paused". The nav badge and Baseline say "Empty", and the spec header is "Balance ₹42.10 · about 17 min of calls" with no tag.
- Fix: in `assets/topup.js` `sub()` (and `billing-topup.js`), use "Empty" (danger) at ₹0 and "Low" only for 0 < runway < 1 h, or drop the tag as the §2.7 wireframe does.

**R2A-07 · settings · Webhook deliveries and Activity have no pager**
- Repro: `#webhook-deliveries` reads "1–12 of 1,204 · newest first" and `#activity` reads "1–16 of 214 …", but neither has Previous or Next. The other 1,192 deliveries are unreachable.
- Expected: S §7.9/§7.11 "DataTable, server-paginated (N §7.11)", `page` URL param.
- Fix: render the shared pager (as on Billing and Personal agents) and keep `page` in the hash query.

**R2A-08 · settings · Emails break mid-word on phones**
- Repro: Profile at 360 shows "anika.rao@samplerealty.exampl" with "e" alone on the next line, beside a vertically centred "Email" label (`settings-profile-360t.png`). Organization members at 390 show "rohit.sharma@samplere / alty.example" (`settings-organization-390.png`).
- Fix: below 480, stack KeyValueList label above value. In member ListRows, put the email on its own line with `text-overflow: ellipsis` and the full address in a tooltip. Keep `overflow-wrap:anywhere` only as a last resort.

**R2A-09 · shared · The phone StatTile strip starts flush at x 0 instead of the page margin**
- Repro: `billing.html#usage` at 375. The first tile's left edge is 0 px while the range select is at 16 px (`billing-usage-375.png`).
- Cause: `.stat-grid` (`assets/components.css:1426`) has `margin-inline:-16px; padding-inline:16px; scroll-snap-type:x mandatory` with `scroll-snap-align:start` and no scroll padding. The browser snaps `scrollLeft` to 16 on load.
- Fix: add `scroll-padding-inline: var(--page-margin)` to `.stat-grid`.

**R2A-10 · assistant · The transcript quote and the Knowledge passage in an answer touch**
- Repro: `assistant.html?chat=chat_2`. `figure.as-quote` ends at y 499 and `blockquote.as-passage` starts at 499 (0 px gap). The quote also sits about 4 px under the paragraph above it. Two different sources (a call and a file) read as one block (`assistant-chat2-zoom.png`).
- Cause: `.as-quote{margin:0}` and `.as-passage{margin:0}` (assistant.css:84/87) override `.as-body > * + * { margin-top: var(--space-12) }`, which has the same specificity and comes earlier.
- Fix: use `margin-inline:0; margin-bottom:0` on both, or wrap the spacing rule in `:where()`.

**R2A-11 · assistant · The "Publish: 2 errors" demo contradicts itself**
- Repro: `assistant.html?scenario=publish&demo=publish-errors`. The answer says "Festive offer callback has no issues" and step 1 says "Done · No issues", but the Publish card shows "✕ 2 errors" with a disabled "Review and publish…" (tooltip "Fix 2 errors to publish").
- Fix: switch the answer text and step 1 result with the demo flag, for example "Festive offer callback has 2 errors. Fix them in Flows before publishing." (P1 honesty).

**R2A-12 · shared · At 1024×768 with a coarse pointer, the rail hides the current page's item**
- Repro: `settings.html` at 1024×768 touch. `.rail-list` scrolls (593/563) and "Settings" (`aria-current`) sits at y 658–698. It is clipped by the list and `elementFromPoint` hits "Expand navigation". Only a sliver of the current marker shows (`settings-1024t-rail.png`).
- Fix: after rendering the rail, `scrollIntoView({ block: 'nearest' })` the `[aria-current=page]` rail item.

**R2A-13 · auth · Lockup and legal links miss 44 px on phones**
- Repro: login, signup or forgot-password at 390×844 touch.
  - The "Vaani Labs home" lockup's hit area is 24 px tall.
  - The footer "Privacy", "Terms" and "Status" hit areas are 40, 34 and 34 px wide (44 tall).
- Expected: 08 §8.12 "At 390 × 844 … every target is ≥ 44 px".
- Fix: in `auth.css`, under `(pointer: coarse)` give `.auth-lockup` `min-block-size: var(--hit)`. Give each legal link `min-inline-size: var(--hit)` with centred text, or a `::after` hit area plus `gap: var(--space-8)`.

## Checked and working (no action)

- **Billing**
  - Exactly one filled button.
  - Tabs are links with `aria-current` that survive Back.
  - Row clicks are delegated to the key link, and Esc returns focus to the row.
  - Arrow keys move between rows; menus support Home, End and Esc.
  - At 375/320 the top-up sheet is full screen with a sticky footer, 3×44 presets and "Open UPI app" first.
  - Plans prices don't wrap at 1024 or 375. Invoice Download buttons are named per invoice.
- **Settings**
  - The guard names the section and Esc restores the nav link.
  - Save moves focus to the section heading and shows "Saved 11:24 am".
  - Delete needs the email typed (case-insensitive), then Confirm it's you. API key creation asks for Confirm it's you first.
  - Exactly one back link below 1024.
- **Assistant**
  - Suggestions insert text without sending, adding a new line when text exists.
  - Call gate: trap, Esc, and focus return to "Review and call…".
  - The disabled publish shows "Fix 2 errors to publish"; the delete step asks for "64" to be typed.
  - Composer labels are correct.
- **Agents**
  - Start sheet: validation, dirty close, a single create, and a key shown once.
  - End room confirm focuses Cancel, and Esc returns focus.
  - Deck: 999 is rejected on submit with "Enter a number from 3 to 7.".
  - The task ⋯ menu supports arrows and End. Cancel task focuses "Keep task".
- **Auth**
  - One H1 in `main`, `noValidate`, correct autocomplete tokens, and no placeholder on email.
  - Empty-submit errors focus Email; the wrong-credentials error clears the password and focuses it.
  - The toggle has `aria-pressed`. Link mode and Back work, and the reason notice has `role=status`.
  - Signup names the unmet rule and moves to the verify step, with focus on its H1.
  - Forgot password sends and focuses the new H1. Keyboard Decline on consent moves focus to `main`, not body.
