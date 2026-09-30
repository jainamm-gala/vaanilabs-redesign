# QA round 1 · data pages (Leads, Call reports, Analytics, Knowledge)

Date 2026-09-27 · Tester: QA agent (Playwright, isolated cookie-less contexts, file://) · Screenshots: `prototype/_shots/qa-r1-data/` (95 files).
Specs checked: `spec/03-pages/03-leads.md`, `04-call-reports-analytics.md`, `05-knowledge-billing.md` §1, `02-components-data-nav.md` §7–§11, `05-responsive.md` §touch table, `00-design-direction.md` §6.3–6.4 (toolbar count replaces the "In this view" band, so its absence is **not** a bug).

Every bug below was reproduced at least twice. "Shared" = root cause in `assets/*`.

## Summary

No blockers. All four pages load with **0 console errors** and **0 axe violations** (light and dark, plus the Leads Import steps 1–2, Leads Call gate in dark and the Knowledge Add dialog). No document-level horizontal scroll at 1440/1280/1024/768/390/360/320. Core journeys work: Leads Call gate (single, batch with Adjusted/Include, wallet ₹0 block, Start → selection cleared, Baseline "Batch · n of m placed", Cockpit-bound progress toast), New lead validation + inline discard, Import with type/size/phone-column checks, filters/sort/pager/deep links restored on reload and Back; Call reports review run (9× Ctrl+Enter → "All 9 calls reviewed", rows stay with "Reviewed · Undo", counts decrement), player slider/timecodes; Analytics range in URL + every section meta, chart keyboard drill-down to the documented Call reports URLs; Knowledge Test a question (verdict, meters, below-threshold collapse, ?test= restore), delete tiers (Undo vs ConfirmDialog naming flows), member Forbidden with focus on H1. Chrome budgets hold at 1440×900 (16 rows), 1366×657 (12, View select + Baseline chip), 1280×609 (10), 1536×730 (12). Reduced motion stops every animation.

The main problems: (1) toasts sit on top of the sticky pager, (2) the shared announcer can speak a stale message after a newer one, (3) several touch/min hit areas are below 44/24 px, (4) phone chrome is 14 px over budget so 360×780 shows 7 rows instead of 8, (5) focus loss after Leads delete and Knowledge J/K, (6) Call reports FilterBar clipping at 1024, (7) Analytics StatStrip deltas overflow at ≤360, (8) the floating Knowledge "Prototype states" button covers table rows.

## Metrics

| Page | axe (light / dark) | Console errors | Doc overflow (px) 1440·1280·1024·768·390·360·320 | Rows visible | Notes |
|---|---|---|---|---|---|
| Leads | 0 / 0 (+ Import step 1, step 2, gate dark: 0) | 0 | 0·0·0·0·0·0·0 | 16 @1440×900 · 12 @1366×657 · 10 @1280×609 · 12 @1536×730 · 9 @390×844 · **7 @360×780** (spec ≥ 8) | only intended scroller: phone view-tab strip |
| Call reports | 0 / 0 | 0 | 0 at all widths | 16 @1440×900 · 12 @1366×657 · 10 @1280×609 · 8 @390×844 · **7 @360×780** (spec ≥ 8) | 768: table scrolls inside `.cr-dtwrap` (When/Lead/⋯ pinned, works) |
| Analytics | 0 / 0 | 0 | 0 at all widths, but StatStrip content spills out of its cells at 360/320 (offenders `DIV.stat-label`, `A.an-cell-link`, `SPAN.delta`) | n/a | SVG chart text ≥ 12 px at 768/390/360; both trend charts above the fold at 1440×900 |
| Knowledge | 0 / 0 (+ Add knowledge dialog: 0) | 0 | 0 at all widths | n/a | |

- Text < 12 px: none found on any page at any tested width.
- Console: the only errors seen were `XMLHttpRequest … blocked by CORS` for the page's own CSS files, emitted by **axe-core itself** when injected on file:// (not a prototype bug).
- Focus ring widths report 1.6 px in computed style because the test browser runs at 125 % device scale (2 px token snapped to device pixels) — not a bug.
- Touch hit-area failures (probe: element must own the points ±21 px from its centre on `pointer: coarse`): `.vtab` 39 px tall (Leads/Call reports views, Knowledge RouteTabs), row/pager `.ibtn--sm` 36×36, Analytics ⓘ 20×20, table sort buttons 16 px tall at 768, Notice action "Show it" 43×20. See R1D-03.

## Bugs, most severe first

### R1D-01 · major · shared · interaction — Toasts cover the sticky pager (Prev / Next / Rows per page)
- **Pages:** Leads, Call reports, Knowledge (any page with a bottom pager) at ≥ 1024.
- **Repro:** `leads.html?wallet=empty` → Tab to a table row → press `C` → info toast appears at x 1016–1416, y 808–856. `document.elementFromPoint` on the centres of `#leads-next`, `#leads-prev` and the Rows-per-page button returns `DIV.toast` (covered). Same with the batch progress toast after "Start 10 calls" (stays until the batch ends) and Undo toasts, which the spec says stay until dismissed (`leads-gate-started.png`, `leads-wallet0.png`).
- **Expected:** Toasts sit bottom-right *above* the page's own bottom chrome; nothing interactive is hidden while a toast is up.
- **Fix:** `assets/components.css` line 915 `.toast-region { bottom: calc(var(--size-baseline) + var(--space-16)) }` ignores the 40 px pager. Add e.g. `body:has(.pager:not([hidden])) .toast-region { bottom: calc(var(--size-baseline) + var(--space-40) + var(--space-16)); }` (or a `--toast-offset` the data pages set).

### R1D-02 · major · shared · accessibility — Announcer speaks a stale message after a newer one
- **Page:** Call reports (also affects Leads J/K "Lead n of N", gate results, any rapid sequence).
- **Repro:** `call-reports.html?view=review` → open the first row → press Ctrl+Enter 9 times 300 ms apart, recording the polite region with a MutationObserver. Sequence heard: "Marked reviewed. Call 2 of 9…", "Marked reviewed. Call 8 of 9…", **"All 9 calls reviewed"**, then **"Marked reviewed. Call 9 of 9, Gauri D. 1 left to review."** The last (stale) message contradicts the end state.
- **Expected:** The final announcement is "All 9 calls reviewed" (04 §2.10); throttled messages never land after a newer one.
- **Fix:** `assets/shell.js` `V.announce` (≈ line 236) defers per `dedupeKey` with `setTimeout` but never cancels deferred timers of *other* keys when a newer message is spoken. In `speak()`, clear every pending timer (or record a sequence number and skip deferred messages older than the last spoken one).

### R1D-03 · major · shared · accessibility — Hit areas below 44 px on touch (and below 24 px on desktop for ⓘ)
- **Repro (768×1024 and 390×844, `hasTouch`, `pointer: coarse`):**
  - `.vtab` (Leads/Call reports view tabs, Knowledge "Sources · Proposals") are 39.2 px tall with no hit extension.
  - `.ibtn--sm` ("More actions for Aarav Mehta", Previous/Next page): `--btn-h-md` becomes 44 on touch but the button renders at `--btn-h-sm` 36, and `.ibtn::after { inset: min(0, (var(--btn-h-md) - var(--hit)) / 2) }` resolves to 0 → 36×36 hit. Probe at ±21 px hits `TD.c-act`.
  - Analytics StatStrip ⓘ ("About Calls" …) are 20×20 with a 19 px measured hit area at **1440 and 390** (spec floor 24, touch 44).
  - Column sort buttons at 768 touch are 16 px tall; Knowledge Notice action "Show it" is 43×20.
- **Expected:** 05-responsive touch table: every control ≥ 44×44 hit on coarse pointers (tabs "44 hit, 36 visual", "sm: 36 visible, 44 hit"), ≥ 24×24 everywhere else.
- **Fix (components.css):** make the hit pseudo independent of the declared size, e.g. `.ibtn::after{content:"";position:absolute;left:50%;top:50%;width:max(100%,var(--hit));height:max(100%,var(--hit));transform:translate(-50%,-50%)}`; add the same centred `::before` to `.vtab`, `.th-sort` and notice `.btn--link` under `(pointer: coarse)`. Remove the page-level 20 px override on the Analytics ⓘ or let it inherit the new pseudo.

### R1D-04 · major · shared · responsive — Phone chrome is 14 px over budget: 7 rows at 360×780 (Leads acceptance ≥ 8)
- **Repro:** `leads.html` at 360×780 touch: TopBar 0–52, `.ph` 52–105 (52.8 px: padding 4 + 44 button + hairline), `.vtabs` 105–145, `.tb` 145–258 (padding 8 + search 44 + gap 8 + filter row 44 + padding 8 = 113), first row at y 258, rows 59 px → 8th row bottom 730 > BottomBar top 724. Same 258 px offset on Call reports (`leads-360.png`, `call-reports-360.png`).
- **Expected:** 03 §5.5 budget: header row 48, search 52 (incl. padding), filter row 52 → rows start at 244, 8 rows at 360×780.
- **Fix:** phone rules for `.ph` (use `btn--sm` 36 visual / 44 hit for "New", padding 2 → 48) and `.tb` (padding 4, row-gap 4 → 104) in components.css.

### R1D-05 · major · page (Leads) · accessibility — Deleting a lead drops focus to the H1; Undo does too
- **Repro:** `leads.html` → Tab to row 2 (Arjun Deshpande) → Tab ×4 to "More actions for Arjun Deshpande" → Enter → End → Enter. Toast "Deleted Arjun Deshpande · Undo"; `document.activeElement` = `H1#page-title`. F8 → Enter on Undo → row restored, focus again on the H1.
- **Expected:** 03 §8.2 / overlay §1.3: focus moves to the next row (Priya Nair); after Undo, back to the restored row. (Knowledge does this correctly.)
- **Fix:** `pages/leads-table.js` `L.deleteLeads` → `go()`: remember the row index before `L.render()`, then set roving `tabindex=0` and focus the row now at that index; in the Undo `onClick`, focus the restored row.

### R1D-06 · major · page (Knowledge) · accessibility — J/K in the source sheet lose focus to `<body>`
- **Repro:** `knowledge.html?source=kb_09` (focus lands on the sheet title) → press `J`: sheet shows "Festive offer 2026", `activeElement` = BODY. Press `J` again: nothing happens (the shortcut's `when` requires focus inside `#kn-source`). No "Source n of N" announcement. The header "Next source" button keeps focus correctly.
- **Expected:** Like Leads and Call reports: focus stays on the sheet title, the sheet follows, the step is announced.
- **Fix:** `pages/knowledge-sheet.js` `step()`: after `S.render(n, null, true)` focus `#kn-source-t` (tabindex −1) and `V.announce('Source ' + (i+2) + ' of ' + ids.length)`.

### R1D-07 · major · page (Call reports) · responsive — FilterBar at 1024 clips tokens and hides the rest without "+n filters"
- **Repro:** 1024×768, `call-reports.html?when=7d&f.direction=outbound&f.language=hi&f.result=completed`. Only "When Last 7 days" and a truncated "Result Complete…" show; that token ends at x 629 while the count button starts at x 603, so its × is hidden under the count. Direction and Language tokens have width 0 and there is no "+2 filters" chip (Filter button shows "4") — `call-reports-1024-filters-zoom.png`. Leads handles the same case with "+3 filters".
- **Expected:** data-nav §6.7 / 04 §2.4: at 1024–1279 up to 2 tokens inline, then "+n filters"; nothing overlaps the count.
- **Fix:** reuse the Leads overflow logic in `pages/call-reports-filters.js` (measure, cap at 2 tokens below 1280, render the "+n filters" button that opens the tokens popover).

### R1D-08 · major · page (Analytics) · responsive — StatStrip deltas overflow their cells at 360 and 320
- **Repro:** 360×780: "↑ +15% vs previous 30 days" ends exactly on the vertical hairline (text right = cell right = 184; `analytics-360-statstrip.png`). 320×640: the Calls delta runs into the Answered cell and collides with "— No change", the Minutes delta is clipped at the viewport edge (`analytics-320.png`).
- **Expected:** 04 §4.6 phone 2×2 grid with `padding space-16/space-20`, text wraps, no horizontal overflow (acceptance: StatStrip "without horizontal scrolling" at 390, no overflow at 320).
- **Fix:** `pages/analytics.css`: `.delta { white-space: normal }` in the phone grid, `min-width: 0` on cells, keep inline padding; optionally shorten to "vs prev. 30 days" below 400 px.

### R1D-09 · major · page (Call reports) · responsive — Phone ListRows are 63–67 px, 7 rows at 360×780
- **Repro:** 360×780 touch: rows measure 67/63/67 px (line 2 carries a 16 px sentiment icon + 13 px word); 7 full rows above the BottomBar (acceptance 04 §2.13: ≥ 8 at 360×780). Combined with R1D-04.
- **Expected:** 60 px two-line ListRow like Leads (`.leads-li` 59 px).
- **Fix:** `pages/call-reports.css` phone list: sentiment icon `--icon-sm` (14), line 2 in `meta-12` line-height, same padding as `.leads-li`.

### R1D-10 · major · page (Knowledge) · visual — Floating "Prototype states" button covers table rows and list content
- **Repro:** `aside.kn-proto` is `position: fixed` at the bottom-left of the table. 1280×800 and 1024×768: covers the checkbox + name of "Nashik plot rates"/"Channel partner terms"; 768: covers "Rental listings"; 390/360: covers ListRow titles ("Site plan brochure", "Festive offer 2026") and the Test pane's Unanswered list; 1440: covers the 15th row once a source is added (`knowledge-1280.png`, `knowledge-1024.png`, `knowledge-390.png`, `knowledge-add-csv.png`). Clicks on the covered row part hit the button; a focused row behind it is obscured (WCAG 2.4.11).
- **Expected:** Consistent with Leads, Call reports and Analytics: reviewer control in the PageHeader actions (folds into ⋯ below 1024), never over content.
- **Fix:** move the button into `.ph-actions` in `knowledge.html` (class `ph-fold`), drop the fixed `aside.kn-proto` positioning.

### R1D-11 · minor · shared · accessibility — Popovers focus their Close button first; Esc must be pressed twice
- **Repro:** `leads.html` → focus Export → Enter: focus lands on the popover's Close (×) and its "Close" tooltip opens. Esc #1 only hides the tooltip (popover still open); Esc #2 closes and returns focus to Export. Same for Leads Columns, Call reports Export…, Analytics Custom…, Knowledge How knowledge works. (Save view correctly focuses its Name field.)
- **Expected:** overlay §1.4: first meaningful control (or the title) gets focus; one Esc closes.
- **Fix:** `assets/shell.js` `V.popover.open` (≈ line 523) picks `U.focusables(el)[0]`; skip close buttons (`.pop-close, [data-close], [aria-label="Close"]`) or focus `.pop-title` with tabindex −1. Also don't open tooltips on programmatic focus inside a just-opened overlay.

### R1D-12 · minor · shared · visual — Toolbar search shows two clear buttons
- **Repro:** type in the search of Leads, Call reports or Knowledge while focused: a blue native WebKit "×" appears next to the custom grey "×" (`search-clear-leads.png`, `call-reports-noresults.png`).
- **Fix:** components.css only hides the native button for `.input input[type=search]` (line 996); extend to `.search input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }`.

### R1D-13 · minor · shared · visual — Selected rows show their row actions
- **Repro:** Leads, select 12 rows with X: every selected row shows its "Call…" button (12 buttons) next to the BulkBar's "Call 12 leads…" (`leads-gate-batch.png`).
- **Expected:** data-nav §7.8: row actions fade in on hover, focused row and `:focus-within` only; the BulkBar's Call is the region's one primary.
- **Fix:** remove `.dt tr[aria-selected="true"] .row-actions` from the selector at components.css line 387.

### R1D-14 · minor · shared · visual — Search placeholder clipped at 1024–1280
- **Repro:** 1280×800 and 1024×768: "Search name, phor", "Search calls and tr" (`leads-1280.png`, `call-reports-1024.png`).
- **Fix:** `.search` flex-basis/min-width large enough for the placeholder at these widths, or a shorter placeholder below 1280 ("Search leads…", "Search calls…").

### R1D-15 · minor · shared · content — `?role=member` still shows "Workspace · Admin" and the Knowledge "3 to review" nav badge
- **Repro:** `knowledge.html?role=member&view=proposals` shows Forbidden correctly, but the workspace switcher says "Admin" and the sidebar Knowledge item keeps "3 to review" (a proposals count members can't open) (`knowledge-member-forbidden.png`).
- **Fix:** shell reads the shared `?role=` param for the switcher role and hides admin-only nav badges for members.

### R1D-16 · minor · page (Leads) · interaction — "Open call report" links don't open the call
- **Repro:** `leads.html?lead=lead_1050&tab=calls`: both "Open call report" links (and the Overview "Captured on the last call" link) have `href="call-reports.html"` with no `?call=` (lead calls have no ids in `leads-data.js`, `leads-sheet.js` line 64 only appends when `x.id`). The batch-finished toast "View results" also goes to plain `call-reports.html`.
- **Expected:** 03 §6.9: `/call-reports?call={id}`; "View results" = Call reports filtered to the batch.
- **Fix:** give lead calls ids that exist in `call-reports-data.js` and render `?call=`; pass a batch filter on "View results".

### R1D-17 · minor · page (Leads) · content — Import row checks are not pluralised
- **Repro:** Import a CSV with one phone-less and one invalid row → "1 row have no phone number · skipped", "1 phone number aren't valid · skipped" (`leads-import-step2.png`).
- **Fix:** `pages/leads-import.js` line 74: "has/have", "isn't/aren't" by count.

### R1D-18 · minor · page (Leads) · accessibility — Announcement formatting
- **Repro:** sheet open, press J → "Lead 4 of 1284" (no separator; `leads-sheet.js` line 124 uses the raw length). Filter › Language › Done with nothing ticked announces "1,284 of 1,284 leads".
- **Fix:** `F.count(...)`; announce the result count only when search/filters narrow the view.

### R1D-19 · minor · page (Leads) · spec-fidelity — "Not in the current results" notice hidden on non-Overview tabs
- **Repro:** `leads.html?view=interested&q=pune&f.language=hi&lead=lead_1050&tab=calls`: the notice exists only inside the hidden Overview panel (`#ls-p-overview`), so it is invisible on Calls (`leads-deeplink.png`).
- **Fix:** render the notice above the PanelTabs (overlay §4.3 "at the top").

### R1D-20 · minor · page (Leads) · visual — Import done state keeps "Importing" as the current stage
- **Repro:** finish an import: "2 imported · 2 skipped" but the third stage mark is still the current ring (`leads-import-step3.png`).
- **Fix:** mark all stages done (✓) on success, failed (×) on "Import stopped".

### R1D-21 · minor · page (Analytics) · accessibility — Interactive plots are `role="img"`
- **Repro:** `#an-c-calls` has `role="img"`, `tabindex="0"`, `aria-roledescription="chart"` and handles ←/→/Enter. Screen readers treat img as non-interactive, so in browse mode arrows move the virtual cursor, not the period.
- **Expected:** data-nav §11.8: `role="img"` only for static charts; interactive plot = one tab stop, roledescription "chart", labelled by the h2.
- **Fix:** `pages/analytics-charts.js`: `role="group"` (or `application`) + `aria-labelledby` the section h2; keep the live region.

### R1D-22 · minor · page (Analytics) · accessibility — Hover tooltip not dismissible with Esc; tooltips stack
- **Repro:** hover a bar in Calls per day (plot not focused) → press Esc → `.an-tip` stays (WCAG 1.4.13). Focus a bar then hover the Answered cell: chart tooltip and trend preview show together and cover the scope-line link "Open these calls in Call reports" (`analytics-trend-preview.png`).
- **Fix:** document-level Esc closes `.an-tip`; opening any ctip hides the others.

### R1D-23 · minor · page (Analytics) · content — Lower-case weekday in the period announcement
- **Repro:** focus the Calls plot, → : "Sat 29 Aug: 43 calls, +15 vs previous sat, press Enter…" (tooltip says "vs previous Sun").
- **Fix:** use the same `NS.weekday()` string in the announcement.

### R1D-24 · minor · page (Analytics) · content — Number section says "Ready" while the Baseline says "Verified"
- **Repro:** default demo (setup 4 of 5): "Calls to your number · Inbound number +91 80 •••• 2210 ✓ Ready" vs Baseline "Inbound +91 80 •••• 2210 · Verified" in the same viewport (`analytics-1440-bottom.png`). `_integration-notes.md`: never "Ready" until setup completes.
- **Fix:** read the line state from the shell baseline facts.

### R1D-25 · minor · page (Analytics) · spec-fidelity — "View as table" opens a nested 280 px scroller
- **Repro:** Calls per day › View as table: 30-row table inside a wrapper with `overflow-y: auto`, height 280 (`analytics-table-view.png`).
- **Expected:** 04 §3.4/§4.7: the page scrolls as one; tables are flush, no inner frame/scroller.
- **Fix:** remove the max-height on the table wrapper.

### R1D-26 · minor · page (Analytics) · content — 7-day intents meta contradicts the body
- **Repro:** `analytics.html?range=7d`: meta "Last 7 days · 119 of 195 calls analysed · updated 26 Sep, 4:01 pm" above "Intents are computed for 30 and 90 days. Switch to 30 days" (`analytics-7d.png`).
- **Fix:** meta "Last 7 days · not computed for this range".

### R1D-27 · minor · page (Analytics) · accessibility — Loading state exposes real values
- **Repro:** `analytics.html?state=loading`: values are skeletons, but the sr-only trend sentences ("From 43 on 29 Aug to 14 on 27 Sep…") and the visible "Busiest 11 am to 1 pm · quietest before 9 am" line render (`analytics-state-loading.png`).
- **Expected:** 04 §3.6 loading: no values until data arrives.
- **Fix:** skip describedby sentences and the busiest-hours summary while loading.

### R1D-28 · minor · page (Analytics) · spec-fidelity — Custom range uses native date inputs
- **Repro:** Custom… → presets + two `<input type=date>` ("14-09-2026") (`analytics-custom.png`).
- **Expected:** 04 §3.7: DateRangePicker (core §7.1) with two months at ≥ 1024 and typeable segments (a calendar exists in components.css `.cal-grid`).

### R1D-29 · minor · page (Knowledge) · content — CSV table step names a different file
- **Repro:** Add knowledge › Files › choose `leads-sept.csv` (1 KB, 4 rows): file row says "Table · 200 rows"; "Choose how to read it" opens "How should the agent read 'Unit inventory.csv'? · 88 KB · 200 rows · 7 columns" (`knowledge-table-step.png`).
- **Fix:** title/meta from the chosen file (name, size, parsed row count); canned preview rows are fine.

### R1D-30 · minor · page (Knowledge) · content — Indexing counts disagree; verdict announcement run together
- **Repro:** header "1 indexing" (one Queued + one Indexing) but Test caveat "2 sources are still indexing". After a search the live region reads "Would answer from 3 passagesSearched 11 sources · …" (no space).
- **Fix:** one counting rule for both; join verdict and meta with ". ".

### R1D-31 · minor · page (Call reports) · responsive — 768 shows all 9 columns
- **Repro:** 768×1024 touch: When, Lead, Phone, Direction, Duration, Outcome, Sentiment, Flow, Language in a horizontal scroller (`call-reports-768.png`).
- **Expected:** 04 §2.4/§2.11 tablet: P1 (When, Lead, Outcome) + user-added columns, pinned When/Lead/⋯.

### R1D-32 · minor · page (Call reports) · accessibility — Gate opened with C returns focus to the row's ⋯, not the row
- **Repro:** focus row 2 → `C` → gate "Call Saanvi H." → Esc: focus on "More actions for the call with Saanvi H.". Leads returns to the row.
- **Fix:** set the gate `returnTo` to the focused `<tr>` when opened by the shortcut.

## Checked and working (no bug)
Skip link → `#main`; one H1 per page and `<title>` updates with the open record; table grid semantics (`aria-rowcount`, absolute `aria-rowindex`, `aria-sort` on the sorted header only, hidden caption naming the sort); Leads Enter/Esc/J/K focus contract, Ctrl+A select-all + "Select all 1,284 leads in All", retired `A` toast, single-key shortcuts switch, `C` never dials, gate focus trap, Place call/Start with double click → one batch; New lead on-blur phone error, inline discard; Import rejects .txt and 6 MB CSV, blocks Import with no phone column; Call reports player slider (←/→ 5 s), timecode seek, test-calls switch (`?test=1`, pager suffix, outline tags), review run end state and Undo; Analytics drill-down URLs match 04 §1.3, Back restores range, View as table `aria-pressed` + `?table=`; Knowledge "Show it" → `?f.status=failed`, failed-row fix first in ⋯, used-source ConfirmDialog names flows, proposals Ctrl+Enter → Undo toast + next proposal + "Added. 2 proposals left.", member Forbidden with focus on H1; phone full-screen sheets with Back links; landscape budgets; dark theme; reduced motion.
