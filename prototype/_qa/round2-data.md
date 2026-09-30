# QA round 2 · data pages (Leads, Call reports, Analytics, Knowledge)

Date 2026-09-27 · Tester: QA agent (Playwright, isolated cookie-less contexts, file://) · Screenshots: `prototype/_shots/qa-r2-data/` (85 files).
Specs checked: `spec/03-pages/03-leads.md`, `04-call-reports-analytics.md`, `05-knowledge-billing.md` §1, `02-components-gate.md` §1, §4, `02-components-data-nav.md` §6.7, §12.5, `06-accessibility.md` §15, §17 and line 294 (focus targets), `05-responsive.md`.

I reproduced every bug below at least twice. "Shared" means the root cause is in `assets/*`.

## Summary

All 28 round-1 bugs assigned to these pages are fixed as reported (R1D-05 to R1D-10, R1D-13, R1D-15 to R1D-32). The shared round-1 bugs outside this list are also fixed: R1D-01 (the toast now sits above the pager), R1D-02 (the final announcement is "All 9 calls reviewed"), R1D-04 (8 rows at 360×780 on Leads and Call reports), R1D-11 (popovers focus their first control and one Esc closes them), R1D-12 (one clear button) and R1D-14 (placeholders fit at 1024). R1D-03 is fixed except for one leftover: the view tabs have a 42 px hit area on touch (see R2D-06).

- **0 console errors** on every page and state I opened (4 pages × 6 widths, all Knowledge `?state=` demos, overlays).
- **0 axe violations** in light and dark at 1440, and with overlays open: Call reports sheet + gate, Analytics Custom range, Knowledge Add › CSV step at 390, Leads sheet at 390.
- **No horizontal document overflow** at 1440, 1280, 1024, 768, 390, 360 or 320 on any page. The only intended scroller is the phone view-tab strip.
- **No text under 12 px** at any width.
- **Reduced motion:** `document.getAnimations()` returns no running animations on all four pages, including loading skeletons and the Knowledge indexing spinner.
- **Row budgets hold:** 16 rows at 1440×900, 12 at 1366×657 and 10 at 1280×609 on Leads and Call reports. At 360×780 there are 8 full rows of 59 px on both.

New problems found this round:
1. **Call reports ignores the wallet-₹0 global blocker.** `C` opens a Blocked gate. Leads does this correctly.
2. **The Call reports Columns menu cannot be used from the keyboard.**
3. **Leads hides active filters while a lead sheet is docked.** No tokens, no "+n filters" chip and no count show.
4. **The phone gate sheet is not modal against the call sheet behind it.**
5. Smaller issues:
   - Touch targets on Analytics, the tablet rail and the Baseline are under 44 px.
   - Programmatic focus targets draw a focus ring.
   - A Leads live region re-announces the result count.
   - Leads and Call reports disagree about the same calls.
   - The "Prototype states" control is inconsistent across pages.

## Round-1 verification

| id | status | evidence |
|---|---|---|
| R1D-05 | Fixed | Delete from row ⋯ moves focus to the next row (Priya Nair). Undo moves focus back to the restored row (Arjun Deshpande) and announces "Restored Arjun Deshpande" (`leads-delete-toast.png`) |
| R1D-06 | Fixed | `?source=kb_09`, J, J, K: focus stays on `H2#kn-source-t`, "Source 5 of 14" is announced, and Esc returns to the row (`knowledge-sheet-jk.png`) |
| R1D-07 | Fixed | 1024×768: "When Last 7 days" + "+3 filters" + Clear, with nothing overlapping the count. 1280 shows the same (`cr-1024-filters.png`, `cr-1280-filters.png`) |
| R1D-08 | Fixed | 360 and 320: deltas wrap ("+15% vs prev. / 30 days") and no content spills out of a cell (`analytics-320.png`) |
| R1D-09 | Fixed | Phone ListRows are 59 px, with 8 full rows at 360×780 (`call-reports-360.png`) |
| R1D-10 | Fixed | The control now sits in `.ph-actions` and folds into ⋯ below 1024. Nothing floats over rows at any width (`knowledge-1024.png`, `knowledge-390.png`) |
| R1D-13 | Fixed | 12 selected rows show 0 row-action groups. Only the focused row shows Call… (`leads-select12.png`) |
| R1D-15 | Fixed | `?role=member&view=proposals` shows "Workspace · Member" and no "3 to review" badge (`knowledge-member.png`) |
| R1D-16 | Fixed (see R2D-10) | Links now carry `?call=call_7e4246`. "View results" goes to `?when=today&f.direction=outbound&f.flow=…&batch=b_…`. However, the linked call's facts differ from the lead's timeline, which is filed as new bug R2D-10 |
| R1D-17 | Fixed | "1 row has no phone number · skipped", "1 phone number isn't valid · skipped" (`leads-import-2.png`) |
| R1D-18 | Fixed (see R2D-08) | J announces "Lead 2 of 1,284". Done with no language ticked announces nothing. A different re-announcement path is filed as R2D-08 |
| R1D-19 | Fixed | The notice sits above the PanelTabs and shows on the Calls tab (`leads-deeplink-calls.png`) |
| R1D-20 | Fixed | All three stages show ✓ after "2 imported · 2 skipped" (`leads-import-3.png`) |
| R1D-21 | Fixed | Plots are `role="application"`, `aria-roledescription="chart"`, `aria-labelledby="an-h-*"` |
| R1D-22 | Fixed (see R2D-09) | Esc hides a hovered bar tooltip, and a focused bar plus a hovered Answered cell show one tip. The ⓘ hover still stacks two overlays, filed as R2D-09 |
| R1D-23 | Fixed | "Saturday 29 August: 43 calls, 15 more than the previous Saturday…" |
| R1D-24 | Fixed | "Calls to your number" reads "Verified" |
| R1D-25 | Fixed | The table wrapper height equals the table height (1232 px), with no inner scroll (`analytics-table-view.png`) |
| R1D-26 | Fixed | "Last 7 days · not computed for this range" |
| R1D-27 | Fixed | The loading state shows no sr-only trend sentences and no busiest-hours line (`analytics-loading.png`) |
| R1D-28 | Fixed | The DateRangePicker shows two months, segmented From/To (IST) fields and no `input[type=date]` (`analytics-custom.png`) |
| R1D-29 | Fixed | "How should the agent read 'leads-sept.csv'? 1 KB · 4 rows · 3 columns" (`knowledge-add-table-step.png`) |
| R1D-30 | Fixed | Header reads "1 indexing · 1 queued" and the caveat reads "1 source is still indexing and 1 is queued". The live region reads "Would answer from 3 passages. Searched 11 sources · …" |
| R1D-31 | Fixed | 768 touch shows When, Lead, Outcome and ⋯ only (`call-reports-768.png`) |
| R1D-32 | Fixed | Row 2 → C → Esc returns focus to the row `TR` |

## Metrics

| Page | axe light / dark (1440) | axe with overlays | Console errors | Doc overflow px 1440·1280·1024·768·390·360·320 | Vertical doc scroll 768 touch | Text < 12 px |
|---|---|---|---|---|---|---|
| Leads | 0 / 0 | sheet 390: 0 | 0 | 0·0·0·0·0·0·– | **7 px** (R2D-15) | none |
| Call reports | 0 / 0 | sheet + gate: 0 | 0 | 0·0·0·0·0·0·– | page scroll (sticky pager) | none |
| Analytics | 0 / 0 | Custom range: 0 | 0 | 0·0·0·0·0·0·0 | page scroll | none |
| Knowledge | 0 / 0 | Add › CSV 390: 0 | 0 | 0·0·0·0·0·0·– | page scroll | none |

- Rows visible: Leads and Call reports show 16 @1440×900, 12 @1366×657, 10 @1280×609, 8 @360×780 and 9 @390×844.
- Touch hit areas measured with an `elementFromPoint` scan, `::after` included:
  - Leads and Call reports view tabs: 42 px at 390, 360 and 1024-touch. Knowledge's are 44.5.
  - Rail items at 1024×768 and 1024×690 touch: 40×40.
  - Baseline segments: 16 px tall.
  - Analytics drop-off step links: 20 px at 390, 768 and 1024-touch.
  - Analytics intent rows: 20 px at 768 and 1024-touch.
  - Analytics "Examples": 28 px at 768.
  - Everything else is ≥ 43 px on touch.
- Desktop targets under 24 px (legend links, bar-list rows, row checkboxes) meet the 2.5.8 spacing exception.
- The keyboard walkthrough works on all four pages:
  - Skip link → `main`. The shell nav comes before the header actions, and the view tabs take one tab stop.
  - Rows use a roving tabindex. Enter opens the sheet with focus on its title, J/K move the record, and Esc returns focus to the row.
  - Segmented range controls respond to the arrow keys.
  - Every menu and popover except Call reports Columns (R2D-02) takes focus on open and closes with one Esc.

## New bugs, most severe first

### R2D-01 · major · page (Call reports) · interaction — Wallet ₹0 does not block the Call gate on Call reports
- **Repro:**
  - `call-reports.html?wallet=empty`: focus row 2 (Saanvi H.) and press `C`. The gate "Call Saanvi H." opens in the Blocked state ("Blocked · 1 thing to fix", greyed Place call) (`cr-wallet0-c.png`).
  - `call-reports.html?wallet=empty&call=call_7c61ec`: focus "Call back…" (`aria-disabled`) and press Enter. Only its tooltip appears and the reason is announced. No info toast with **Top up** appears, and the footer has no inline reason (`cr-wallet0-callback.png`).
  - The Prototype states item "Wallet empty · Call back blocked" demonstrates this same broken path.
- **Expected:**
  - gate §4.4 rule 1: a global blocker known before opening keeps every entry point `aria-disabled`. Activating an entry point (click, Enter, `C`) does **not** open the gate. It announces the reason and shows the info toast "Wallet is ₹0. Top up to place calls. · Top up".
  - 04 §2.2 / F-UX-028: "Call back…" carries the wallet reason inline.
  - Leads already does all of this: `C` gives no gate, a toast and an announcement.
- **Fix:** in the Call reports `C` shortcut and the `#cs-callback` handler, run the global-blocker check (wallet ₹0, no caller ID, offline, role) before `openGate`. Reuse the Leads `blockedActivation` pattern (toast + `V.announce`). Render the reason inline next to "Call back…" in the sheet footer.

### R2D-02 · major · page (Call reports) · accessibility — The Columns menu cannot be used from the keyboard
- **Repro:**
  1. Tab to Columns (`#cr-cols-btn`) and press Enter or Space. The menu opens (`aria-expanded="true"`), but `document.activeElement` is still the trigger.
  2. ArrowDown does nothing.
  3. Tab closes the menu and moves on to "Standard". No column can be toggled without a mouse.
  4. A mouse click leaves focus on `BODY`. Clicking items still works.
- **Cause:** `pages/call-reports-boot.js` line 43 re-renders the menu (`NS.renderColsMenu()`) inside a document click listener that runs *after* the shell's delegated handler has opened the menu and focused its first enabled item. The rewritten `innerHTML` destroys the focused item, and the new items have no `tabindex="-1"`.
- **Expected:** WCAG 2.1.1 and data-nav §7 Columns menu: focus moves to the first enabled item, arrows move through the items, and Space toggles. Every other menu on the four pages does this.
- **Fix:** render the menu before it opens: a capture-phase `pointerdown`/`keydown` (Enter, Space, ArrowDown) on the trigger, or render at boot and after each column change. Alternatively, after rendering, set `tabindex="-1"` on the items and focus the first enabled one.

### R2D-03 · major · page (Leads) · spec-fidelity — Active filters vanish while a lead sheet is docked
- **Repro:** `leads.html?f.language=hi&f.status=interested&lead=lead_1050` at 1440×900. The toolbar shows only Search, "Filter", "Clear" and "25 of 1,284" (`leads-sheet-filters-2.png`). There are no tokens and no "+2 filters". The Filter count badge `#leads-fcount` is `display:none` on desktop, so nothing shows *which* filters apply. Call reports in the same state (sheet docked, 2 filters) shows both tokens (`call-reports-sheet-filters-3.png`).
- **Cause:** in `pages/leads-filters.js`, `fitToolbar()` cuts `lim` down to 0 while the toolbar wraps. `draw()` renders "+n filters" only when `more > 0 && lim > 0`.
- **Expected:** data-nav §6.7: tokens overflow into "+n filters" and applied filters are always visible. This is the same class of issue as R1D-07.
- **Fix:** render the "+n filters" button whenever `more > 0`, including when `lim === 0`. Also show the count badge when no token is inline.

### R2D-04 · minor · shared · interaction — The phone gate bottom sheet leaves the sheet behind it live and undimmed
- **Repro:** 390×844 touch, `call-reports.html?call=call_a00aab`:
  1. Tap "Call back…". The gate opens as a bottom sheet from y 257 (`cr-390-gate.png`).
  2. The call sheet above it is not dimmed. `elementFromPoint(100,222)` is the "Full summary" button.
  3. Tap it. The sheet switches to the Summary tab and the gate closes.
  - Leads has the same stacking: the top 16 px of the lead sheet header stays above the scrim.
- **Expected:** the gate is `role="dialog" aria-modal="true"`. Everything behind it is covered by the scrim and inert (overlay §1, gate §1 "Popover `modal` switch").
- **Fix:** `assets/components.css`: raise `.float-scrim` and floating gates above the phone full-screen `.sheet` (or lower the phone sheet's z-index), and set `inert` on the sheet while a gate is open.

### R2D-05 · minor · page (Analytics) · accessibility — Touch targets in the Diagnosis sections are 20–28 px
- **Repro (touch emulation; hit rectangles scanned with `elementFromPoint`, `::after` included):**
  - Drop-off step links (`.an-fl`, "3 · Ask about a site visit"): 20 px tall at 390, 768 and 1024×690. The "9% drop" link sits directly under them (`analytics-390-dropoff.png`).
  - Intent rows (`.barlist-row`): 20 px at 768 and 1024×690 (40 at 390).
  - "Examples" (`.an-ex`): 28 px at 768 and 1024.
- **Expected:** 06 §15 rule 2: on coarse pointers every target is ≥ 44×44 (TS-01 runs at 390 and 1024×690 with touch).
- **Fix:** in `pages/analytics.css` under `@media (pointer: coarse)`:
  - `.an-fl, .barlist-row { min-height: var(--size-hit-touch) }` (or a centred `::after` hit).
  - Give "Examples" and the drop links the same `::after` hit.
  - Keep ≥ `--space-8` between the step link and the drop link.

### R2D-06 · minor · shared · accessibility — Landscape-tablet and phone hit areas: rail 40 px, Baseline 16 px, view tabs 42 px
- **Repro:**
  - 1024×768 or 1024×690 with touch: every `.rail-item` hits 40×40, and the Baseline links (`.bl-seg`, e.g. "Published v7 · Site-visit qualifier") are 16 px tall.
  - 390, 360 and 1024-touch on Leads and Call reports: `.vtab` hits 97→139 px = 42 px. The sticky `.tb` (z-index 10) covers the bottom 2.5 px of `.vtab::before` (Knowledge, with no sticky toolbar, gets 44.5).
- **Expected:** 06 §15.2: "Rail items (1024–1279) … 44 × 44 on touch". Acceptance line 1015: every rail item ≥ 44×44 at 1024×690 touch. All targets are 44 on coarse pointers. This is the last part of R1D-03.
- **Fix (components.css):**
  - Rail: `@media (pointer: coarse) { .rail-item { width/height: var(--size-hit-touch) } }` and let the list scroll.
  - Baseline: add a centred `::after` hit on `.bl-seg` under coarse pointers.
  - View tabs: give `.vtabs` a z-index above the sticky `.tb`, or put the reach only on top and let `.tb` start below the extension.

### R2D-07 · minor · page (Leads, Call reports) · accessibility — Programmatic focus targets draw a focus ring
- **Repro:**
  - `call-reports.html?call=call_7e4246`: the sheet title "Priya N. · 4 days ago" gets a 2 px ring box that looks like a text field (`cr-call-deeplink-from-lead.png`, `cr-review-done.png`).
  - Leads: `C` on a row shows the same ring on "Call Arjun Deshpande" (`leads-gate-head-zoom.png`).
  - The Import dialog title does the same.
  - Cause: `#cs-title`, `#leads-gate-t` and `#leads-imp-t` have `tabindex="-1"` in markup but no `data-focus-target`. `shell.js` line 461 adds the attribute only when `tabindex` is missing. Knowledge and the Leads sheet title are correct.
- **Expected:** 06 line 294: non-interactive programmatic targets (main, H1, sheet and gate titles) carry `data-focus-target` and draw no outline.
- **Fix:** add `data-focus-target` to those three elements. Better, in `shell.js` always set `data-focus-target` on the heading the overlay focuses, whether or not it already has a `tabindex`.

### R2D-08 · minor · page (Leads) · accessibility — The pager range re-announces the count on every render
- **Repro:**
  - `leads.html`: focus row 1 and press Enter. About 1.7 s later the polite region reads "1–50 of 1,284 leads".
  - Press Esc: the same announcement again.
  - Deleting a lead reads "1–50 of 1,283 leads" as well.
  - Nothing narrowed or paged in any of these steps.
  - Cause: `SPAN#leads-range` has `role="status"`, so each `L.render()` that rewrites its text is spoken, bypassing `V.announce` throttling. Call reports and Knowledge ranges have no live role.
- **Expected:** 03 §6.5 and acceptance line 906: result counts are announced only when search or filters narrow the view and page ranges only on a page change, at most once per 2 s per key. This follows on from R1D-18.
- **Fix:** remove `role="status"` from `#leads-range`. Page changes already announce "Showing 26 to 50 of 1,284" through `V.announce(…, { dedupeKey: 'page' })`.

### R2D-09 · minor · page (Analytics) · accessibility — Hovering a StatStrip ⓘ opens two overlays, and Esc must be pressed twice
- **Repro:** hover "About Answered". The info tooltip opens above and the Answered trend preview (`.ctip.an-trend`) opens below, covering "Open these calls in Call reports" (`analytics-info-plus-trend.png`). Esc #1 closes only the tooltip. Esc #2 closes the preview. Keyboard focus on the ⓘ correctly shows only the tooltip.
- **Expected:** WCAG 1.4.13 and the R1D-22 fix intent: one hover overlay at a time, and Esc dismisses the hover content.
- **Fix:** in `pages/analytics-sections.js`, don't open the trend preview while the pointer is over `.stat-label button`. The document Esc handler should also hide an open `.ctip` in the same keypress as the tooltip.

### R2D-10 · minor · page (Leads, Call reports, Knowledge) · content — Leads, Call reports and Proposals disagree about the same call
- **Repro:**
  1. `leads.html?lead=lead_1050&tab=calls` says "Vaani called · Call later · 1m 0s · Site-visit qualifier v7 · Yesterday 1:20 pm" and "Callback set for Yesterday 6:00 pm". Its "Open call report" (`?call=call_7e4246`) opens "Priya N. · 4 days ago · 4m 0s · v6 · Callback set for Tomorrow 6:00 pm" (`cr-call-deeplink-from-lead.png`).
  2. `call-reports.html?call=call_7c61ec` shows Lakshmi S., Today 11:20 am, Callback. Its "Open lead" opens Lakshmi Subramanian with status **New** and a Calls tab showing only "Lead added".
  3. `call_7c71ef` shows Prakash H., Inbound, Today 11:05. `lead_1310` has no such call; its last call is "Not interested · 4 days ago".
  4. Knowledge › Proposals "From call" says "Today 10:42 am · 2m 14s" but opens Lakshmi S. Today 11:20 am 2m 8s. "Yesterday 3:20 pm · 3m 21s" opens Prakash H. Today 11:05 am 1m 55s.
- **Expected:** one record everywhere, with the same time, duration, flow version and outcome. The prototype is the developers' reference for these links.
- **Fix:** build the lead Calls timeline and the proposal "From call" labels from the ledger call they link to in `call-reports-data.js`. In `leads-data.js` `bestCall()`, adopt the ledger call's `at`, `durationSec` and flow into `l.lastCall` instead of keeping a curated one that contradicts it.

### R2D-11 · minor · page (Knowledge) · interaction — "See these calls in Call reports" lands on an unfiltered list
- **Repro:** Knowledge › Unanswered on calls · last 7 days › "See these calls in Call reports" goes to `call-reports.html?f.knowledge=not-found&range=7d`. Call reports ignores both parameters: it shows "2,579 calls", no tokens, all time (`cr-from-knowledge-notfound.png`). Call reports uses `when=`, not `range=`.
- **Expected:** the calls the section summarises: last 7 days and knowledge lookup Not found.
- **Fix:** link to `?when=7d&f.knowledge=not_found` and add a `knowledge` filter (Found / Not found) to `call-reports-query.js` and the Filter menu, with its token.

### R2D-12 · minor · page (Call reports) · spec-fidelity — Call gate has no Close button, and its amount wraps
- **Repro:** 1440, row 2 → `C`, or the sheet's "Call back…":
  - The header has no × (the Leads gate has `gate-close`).
  - The cost inset reads "1 call · about 1 to 2 min · Home-loan follow-up v3", with "₹2 to / ₹5" wrapped onto two lines at 1440 and 390 (`cr-gate-c.png`, `cr-390-gate.png`).
- **Expected:** gate §1 part 1: "Close: IconButton 28 in popovers". Part 4: count and duration on the left, the range on the right on one line (stacked only below 360 px).
- **Fix:** reuse the Leads gate header markup (`.gate-close`). Move the flow name to the scope line. Add `white-space: nowrap` to the amount.

### R2D-13 · minor · page (Call reports) · content — The player claims "per-turn timing not available" while the transcript shows per-turn times
- **Repro:** `call-reports.html?call=call_7c61ec`: the legend reads "3 turns · Waveform · per-turn timing not available", while the transcript turns show seekable timecodes 00:08, 00:56, 02:50 (`cr-390-sheet.png`).
- **Cause:** the player chooses TalkStrip vs Waveform from `c.perTurnLanguage`, not from timing.
- **Expected:** data-nav §12.5 / P1: TalkStrip with "Agent n% · Caller n%" whenever per-turn timing exists. Without timing, show no per-turn timecodes.
- **Fix:** in `call-reports-player.js`, base `per` on `turns().every(t => t.startMs != null)`. Keep `perTurnLanguage` only for the per-turn `lang` attributes.

### R2D-14 · minor · page (Leads) · visual — The phone lead-sheet header truncates the name to "Arjun Deshpan…" and the meta to "A…"
- **Repro:** 390×844, open Arjun Deshpande. Row 1 holds Back to Leads, the title, Previous, Next, Copy link and ⋯. The title gets 122 px, so the name is clipped and "Added 16 Sep…" collapses to "A…" (`leads-390-sheet.png`, `leads-390-sheet-head.png`).
- **Expected:** consistent with the Call reports phone sheet: Back and ⋯ on row 1, the full title on its own row (overlay §4 phone full-screen sheet).
- **Fix:** below 768, move Previous, Next and Copy link into ⋯ (or a second row) and give the title a full-width row.

### R2D-15 · minor · page (Leads) · responsive — 768×1024 touch: the document scrolls 7 px and the pager is cut off
- **Repro:** `leads.html` at 768×1024 touch: `scrollHeight` is 1031, `main` spans 52–1029 and `.pager` 989–1029, so the "Rows per page 50" select loses its bottom border (`leads-768.png`). Call reports and Knowledge don't have this.
- **Expected:** no page scroll on the inner-scroller layout. The pager is fully visible.
- **Fix:** `pages/leads.css`: size `.leads-body` with flex (`flex:1; min-height:0`) instead of a fixed `calc()`, which misses the 5 px coarse-pointer view-tab reach (`.vtabs` height 45 with −2.5 px margins).

### R2D-16 · minor · page (all four) · visual — The "Prototype states" control looks and behaves differently on each page
- **Repro (1440):**
  - Leads: borderless tertiary button, sliders icon, opens a **dialog**.
  - Knowledge: dashed tertiary, sliders icon, menu.
  - Call reports and Analytics: dashed tertiary, **flag** icon, menu.
  - At 768, Call reports and Analytics keep the labelled button in the header, while Leads and Knowledge fold it into ⋯ (`call-reports-768.png`, `analytics-768.png`, `leads-768.png`).
- **Expected:** one reviewer control across the prototype (R1D-10 fix intent): same style, icon, popup type and folding rule (`ph-fold` below 1024).
- **Fix:** one shared `.proto-btn` class (dashed, one icon, `aria-haspopup="menu"`), used with `ph-fold` on every page.

### R2D-17 · minor · page (all four) · accessibility — Page language is `en`, not `en-IN`, and one Hinglish suggestion has no `lang`
- **Repro:**
  - `<html lang="en">` on leads, call-reports, analytics, knowledge (and `_template.html`).
  - Knowledge's "Try a question" button "2BHK ka price kya hai?" inherits `en`, while the Unanswered questions carry `hi-Latn`.
- **Expected:** 06 §17: `<html lang="en-IN">` (voices read ₹, lakh and crore correctly), and Hinglish text carries `lang="hi-Latn"`.
- **Fix:** set `lang="en-IN"` in `_template.html` and every page. Add `lang="hi-Latn"` to the suggested-question buttons in `knowledge-test.js` line 79.

### R2D-18 · minor · page (Leads) · visual — The gate subtitle wraps with a dangling " ·"
- **Repro:** Leads single-call gate at 1440 and 390: line 2 reads "Their phone rings when you place the call. ·", then "Checked just now" on its own line (`leads-gate-head-zoom.png`, `leads-390-gate.png`). The Call reports gate fits on one line.
- **Expected:** gate §1 part 1: the consequence sentence then " · freshness", with the separator never orphaned.
- **Fix:** wrap " · Checked just now" in one `white-space: nowrap` span, and let `.gate-sub` span the full header width under the close button.

## Checked and working (no bug)
- **Leads:**
  - Delete/Undo focus contract, and J/K and selection announcements (throttled, final count correct).
  - Import pluralisation and stages.
  - Wallet ₹0: `C` and sheet Call… give a toast + announcement and no gate.
  - The single gate traps focus, Esc returns to the row, and the gate title gets initial focus.
  - The full deep link `view, f.language, sort=interest:desc, page=2, size=25` restores filter, sort (`aria-sort` on Interest) and page.
  - Filter › Language popover: search field focused, Clear/Done.
  - Phone full-screen sheet and phone gate sheet.
- **Call reports:**
  - Enter/J/Esc sheet contract with "Call 2 of 2,579" announced.
  - The review run ends with "All 9 calls reviewed" and "Reviewed · Undo" on rows.
  - The 1024 FilterBar overflow, and the P1 columns at 768.
  - The Test calls switch is "Show test calls" (`role=switch`).
  - Totals popover, Export popover focus, row ⋯ menus.
  - The search clear button is single.
- **Analytics:**
  - Range radiogroup arrows update `?range=90d` and every meta.
  - The ⋯ menu focuses its first item.
  - DateRangePicker keyboard.
  - View as table (`?table=calls`).
  - 7d intents meta, the loading state, and "Verified" line state.
  - Chart role and announcements.
- **Knowledge:**
  - J/K with focus kept and "Source n of N".
  - Esc returns to the row.
  - The Test a question verdict, meters and threshold collapse, with the announcement joined by ". ".
  - Add › CSV table step with the real file facts.
  - Member Forbidden with focus on the H1, and the member shell.
  - Every `?state=` demo renders without errors.
- **All pages:**
  - Skip link, one H1, landmarks, no skipped heading levels.
  - Dark theme contrast (axe 0).
  - Reduced motion.
