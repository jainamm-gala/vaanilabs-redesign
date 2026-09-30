# QA round 3 · data pages (Leads, Call reports, Analytics, Knowledge)

Date 2026-09-27 · Tester: QA agent (Playwright, isolated cookie-less contexts, file://) · Screenshots: `prototype/_shots/qa-r3-data/` (83 files).
Specs checked: `03-pages/03-leads.md` §5, §6.10, §7.4, §13 · `03-pages/04-call-reports-analytics.md` §1.3, §2.4–2.13, §3.4–3.12 · `03-pages/05-knowledge-billing.md` §1 · `02-components-gate.md` §1, §4 · `02-components-core.md` §1.6 · `02-components-data-nav.md` §6.7, §11.4, §11.8 · `06-accessibility.md` §7, §15 · `00-design-direction.md` §6.
Phone and tablet runs use Playwright contexts with `isMobile` + `hasTouch` (the CDP override in the brief is reset by Playwright on navigation, so `innerWidth` stayed 768).

## Summary

**The three majors from round 2 are fixed.**

| id | status | evidence |
|---|---|---|
| R2D-01 | **Fixed** | `?wallet=empty`, row 2 + `C`: no gate, info toast "Wallet is ₹0. Top up to place calls. · Top up", announcement (`cr-wallet0-c.png`). `?wallet=empty&call=call_7c61ec`: "Call back…" is `aria-disabled`, `aria-describedby="cs-cbwhy"`, inline reason "Wallet is ₹0. Top up to place calls." in the footer; Enter gives the toast + announcement and no gate; the toast's Top up opens the Top-up sheet with focus in the amount (`cr-wallet0-callback.png`, `cr-wallet0-topup.png`). `?state=no-callerid` and `?state=offline` behave the same with their own reasons and fixes |
| R2D-02 | **Fixed** | Enter, Space, ArrowDown on Columns and a mouse click all put focus on the first enabled item (Phone). ArrowDown moves, Space toggles Duration off and keeps focus and the menu open, Esc returns to the trigger (`cr-columns-kb.png`) |
| R2D-03 | **Fixed** at 1440 | `leads.html?f.language=hi&f.status=interested&lead=lead_1050`: toolbar reads "Filter 2 · +2 filters · Clear · 25 of 1,284"; "+2 filters" opens a popover with both tokens and focus on the first; Esc returns to it (`leads-sheet-filters-pop.png`). The overlay sheet at 1024–1439 still hides them on Leads: new R3D-02 |

- The minors from round 2 (R2D-04 … R2D-18) were not in this round's fix list and none changed, except the rail part of R2D-06 (rail items now 44.5 × 44.5 at 1024×690 touch). They are re-listed below with their ids.
- **0 console errors** on every page, width and state opened (errors seen during axe runs are axe's own CSS fetches under file://).
- **0 axe violations:** Leads 1440 light, 1440 dark with the sheet; Call reports 1440 light with sheet + gate, 1440 dark with sheet, 390 with the phone gate; Analytics 1440 light, 1440 dark with a table view, 390 dark; Knowledge 1440 light with a source sheet, 1440 dark with test results.
- **No horizontal page overflow** at 1440, 1280, 1024, 768, 390, 360, 320 on any page. **No text under 12 px** anywhere (HTML and SVG).
- **Reduced motion:** `document.getAnimations()` shows 0 running animations on all four pages, including the loading states.
- **Row budgets hold:** Leads and Call reports 16 @1440×900, 12 @1366×657, 10 @1280×609; Leads 10 touch rows @1024×690; 9 ListRows @390×844.
- Keyboard walkthroughs pass for the main tasks: skip link, table as one stop with roving rows, Enter → sheet title, J/K "Lead n of N" / "Call n of N", Esc → same row, the full 9-call review run with Ctrl+Enter ending on "All 9 calls reviewed" and Back returning to the last row, the Leads single and batch gates (focus on title, trap, Esc returns to the row), New lead validation and focus return, Knowledge Add (radio arrows, `?add=text`, discard state), Proposals (Ctrl+Enter adds, next opens, "Added. 2 proposals left."), Analytics range radios, Custom range, ⋯ menu, chart arrows and Enter drill-down.

New problems found this round (13), most serious first: selects that re-render lose focus (to `<body>` on Call reports), the Leads overlay sheet still hides filters at 1024–1439, the Analytics chart forgets its position on Esc, the Neutral sentiment drill-down opens the wrong calls, Knowledge Undo drops focus, an invisible "View as table" pressed state, and several gate copy and touch-target issues.

## Metrics

| Page | axe (views run) | Console errors | Doc overflow px 1440·1280·1024·768·390·360·320 | Vertical doc scroll at 768 touch | Text < 12 px |
|---|---|---|---|---|---|
| Leads | 0 (1440 light; 1440 dark + sheet) | 0 | 0·0·0·0·0·0·0 | **7 px** (R2D-15) | none |
| Call reports | 0 (1440 light sheet + gate; dark sheet; 390 phone gate) | 0 | 0·0·0·0·0·0·0 | page scroll, sticky pager (by design) | none |
| Analytics | 0 (1440 light; dark + table; 390 dark) | 0 | 0·0·0·0·0·0·0 | page scroll | none |
| Knowledge | 0 (1440 light + sheet; dark + test results) | 0 | 0·0·0·0·0·0·0 | page scroll | none |

Touch hit areas (`elementFromPoint` scan, `::after` included; exceptions listed only):
- Leads and Call reports view tabs 42.5 px at 390, 360 and 1024 touch; Knowledge route tabs 42 at 1024 touch (R2D-06).
- Baseline segments 16.5 px at 1024×768 touch (R2D-06). Rail items now 44.5 (fixed).
- Pager Previous/Next 40 × 39 and Rows per page 41.5 at 1024×690 touch on Leads, Call reports and Knowledge (R3D-10).
- Analytics: `.an-fl` 20.5 at 390/360/768; `.barlist-row` 20.5 at 768, 40.5 at 390/360; "Examples" 53 × 28 at 768; "Missed 6" link 38.5 at 768 (R2D-05).
- Knowledge key-cell links are 20.5 tall at 768 but the whole row opens the sheet on tap, so they pass.

## New bugs (round 3), most severe first

### R3D-01 · major · shared · accessibility — Picking an option in a select that the page re-renders loses focus (to `<body>` on Call reports)
- **Repro (1440, keyboard or mouse, reproduced 2× each):**
  - `call-reports.html`: focus Rows per page, open it, choose 25 (or 100 with the mouse). `document.activeElement` is `BODY`.
  - `knowledge.html`: same with Rows per page. Focus lands on `H1#page-title`.
  - `analytics.html`: Where callers drop off › flow switcher, choose "Site-visit qualifier v7". Focus lands on `H1#page-title`, although `analytics-sections.js` line 218 focuses the new `.an-fs`.
  - `leads.html` Rows per page keeps focus on the select (correct).
- **Cause:** `assets/shell.js` `choose()` (line 1614) fires `vaani:change` before `entry.close('select')` (lines 1630, 1634). The page's change handler re-renders the pager or section and replaces the trigger; the close then returns focus to the detached trigger and falls back to the H1 or body.
- **Expected:** 06 §7 and gate §4.5: after a choice focus returns to the control (never `<body>`). WCAG 2.4.3.
- **Fix:** in `shell.js`, close the listbox first and fire `change` after, or make the float's return-focus step re-resolve a detached trigger by `[aria-controls="<listbox id>"]` before falling back. Either fixes all three pages.

### R3D-02 · minor · page (Leads) · spec-fidelity — With the overlay lead sheet (1024–1439) applied filters are hidden again
- **Repro:** `leads.html?f.language=hi&f.status=interested&lead=lead_1050` at 1024×768: "Language Hindi" is visible, "Status Interested", Clear and the count sit under the sheet (`elementFromPoint` hits the sheet), and `#leads-fcount` is hidden because one token is inline (`leads-1024-sheet-filters.png`). At 1280×800 Clear and the count are covered. Call reports in the same state keeps the Filter badge "2" visible.
- **Expected:** data-nav §6.7: applied filters stay visible (R2D-03, R1D-07).
- **Fix:** in `pages/leads-filters.js` fit the toolbar to the width left of an open overlay sheet (fold the rest into "+n filters"), and show `#leads-fcount` whenever a sheet is open, as Call reports does.

### R3D-03 · minor · page (Analytics) · interaction — Esc on a focused chart forgets the period: Enter then does nothing and the arrows restart at the end
- **Repro:** focus Calls per day, End, ←, ← (Fri 25 Sep, tooltip shown). Esc hides the tooltip, but Enter no longer opens the calls (URL stays `analytics.html`), the live region still says "…press Enter to open these calls", and the next ← jumps to Sun 27 Sep (`an-chart-after-esc.png`). Without Esc, Enter opens `?when=2026-09-26` with 40 rows (correct).
- **Cause:** `pages/analytics-charts.js` line 141 calls `setActive(el, -1)` on Esc.
- **Expected:** data-nav §11.8 and 04 §3.7: Esc hides the tooltip only; the focused period stays and Enter opens it.
- **Fix:** on Esc hide the tooltip and keep the index (optionally drop the highlight until the next arrow key).

### R3D-04 · minor · page (Analytics → Call reports) · spec-fidelity — Neutral drill-downs open all calls, not the neutral ones
- **Repro:** Sentiment by day legend "Neutral 285" links to `call-reports.html?view=neutral&when=30d`; Call reports has no Neutral view and shows "994 of 2,579" (All). A Neutral segment (27 Sep, 3 calls) opens `?view=neutral&when=2026-09-27` → "14 of 2,579". Positive, Mixed and Negative match (166, 69, 79).
- **Expected:** 04 §3.12: the rows in Call reports equal the number clicked.
- **Fix:** add a Sentiment filter to `call-reports-query.js` (and the Filter menu, with its token) and link Neutral as `?when=…&f.sentiment=neutral`, or add a Neutral view.

### R3D-05 · minor · page (Knowledge) · accessibility — Undo after deleting a source drops focus to `<body>`
- **Repro:** row 1 "Site visit checklist" › ⋯ › Delete source… → toast "Deleted 'Site visit checklist'. Undo". Activate Undo with the keyboard or the mouse: the row returns and "Restored…" is announced, but `activeElement` is `BODY` (reproduced 2×). Leads' Undo puts focus on the restored row.
- **Expected:** 06 §7 and the toast rules: focus goes to the restored row, never `<body>`.
- **Fix:** `pages/knowledge-table.js` line 215: after `T.render()` in the Undo handler, focus the restored row (`#kn-tbody tr[data-id=…]`).

### R3D-06 · minor · shared · accessibility — "View as table" shows no pressed state
- **Repro:** Analytics › Calls per day › View as table: the table shows and `aria-pressed="true"`, but the button looks identical to the unpressed one in the next section (same label, transparent background, same colour; `an-table-toggle.png`).
- **Expected:** 04 §3.7 toggle; the state must be visible (WCAG 1.4.1, 4.1.2).
- **Fix:** add `.btn[aria-pressed="true"]` to `assets/components.css` (e.g. `--surface-3` fill and `--text`, like `.ibtn[aria-pressed]`), or relabel to "View as chart" and drop `aria-pressed`.

### R3D-07 · minor · page (Leads) · content — Batch gate with every lead skipped reads "Call 0 leads" and "0 calls · about 1 to 2 min · ₹0 to ₹0"
- **Repro:** select Aarav Mehta (live) and Arjun Deshpande (called in the last 24 h) with X, press C. After checking, the title changes from "Call 2 leads" to "Call 0 leads", the primary reads "Start 0 calls" and the cost line "0 calls · about 1 to 2 min · ₹0 to ₹0" (`leads-batch-gate.png`). The why-text "All 2 leads were skipped. Include some, or cancel." is right.
- **Expected:** gate §1.4 and L §7.4: the title names what was asked ("Call 2 leads"); the cost line never shows a duration or a ₹0-to-₹0 "range" for nothing.
- **Fix:** `pages/leads-gate.js` line 94: use `G.leads.length` for the batch title; when `G.n === 0` render the cost line as "No calls to place" (keep the wallet line).

### R3D-08 · minor · page (Leads) · spec-fidelity — Calling a Do-not-call lead shows "Marked Do not call" instead of the gate's blocking row
- **Repro:** Isha Pillai (Do not call): row "Call…" is `aria-disabled` with tooltip "Marked Do not call"; clicking it or pressing C shows an info toast "Marked Do not call" (`leads-dnd-gate.png`). The words read like a confirmation that the status was just changed.
- **Expected:** gate §4.4 rule 5 and the `do_not_call` check (§5.1): selection-dependent conditions are in-gate rows; the gate opens Blocked with "Isha Pillai is marked Do not call." and a disabled primary.
- **Fix:** `pages/leads.js` `leadBlocker()` line 156: drop the DNC case so the gate opens with its blocking row. If the entry-point block is kept, reword to "Isha Pillai is marked Do not call. Calls to this lead are blocked."

### R3D-09 · minor · page (Leads) · accessibility — The disabled "Call…" reason is tooltip-only: invisible on touch, not described to screen readers
- **Repro:** 390×844 touch, `leads.html?lead=lead_1042` (Aarav Mehta, on a live call): the footer "Call…" is greyed; tapping it only announces "On a call now. Open it in Cockpit." Nothing visible appears (no toast, no inline text), and the button has no `aria-describedby` (`leads-390-call-disabled.png`). The same holds for row "Call…" on DNC leads at 1440. "Open it in Cockpit" is not a link anywhere.
- **Expected:** core §1.6: `aria-describedby` points at a visible reason, inline when there is room (the phone footer has room). Call reports shows its reason inline beside "Call back…".
- **Fix:** render the reason beside the sheet footer's "Call…" (as `cs-cbwhy`), with an "Open in Cockpit" link, and link it with `aria-describedby`; give the blocked-activation toast the same action.

### R3D-10 · minor · shared · responsive — Pager targets are under 44 px on a touch landscape tablet
- **Repro:** 1024×690 with touch on Leads, Call reports and Knowledge: Previous page 40 × 39, Next 44.5 × 39, Rows per page 62 × 41.5. The 40 px pager sits on the viewport bottom and the table's sticky actions cell (`td.c-act.sticky-r`) covers the top of the hit extension (`leads-1024x690-touch.png`).
- **Expected:** 06 §15.2: IconButton sm in pagers is 44 on touch; TS-01 runs at 1024×690 touch.
- **Fix:** `assets/components.css`: under `(pointer: coarse)` give `.pager` `height: var(--size-hit-touch)`, raise it above the sticky cells, and keep ≥ 44 px between the prev/next hit areas.

### R3D-11 · minor · page (Analytics) · visual — Calls per day axis runs to 80 for a maximum of 47
- **Repro:** 1440 and 390: the y-axis ticks are 0, 20, 40, 60, 80, while the tallest bar is 47, so the bars use 59 % of the plot (`analytics-1440.png`, `analytics-390-top.png`).
- **Expected:** data-nav §11.4: 4–6 nice ticks as `d3.scaleLinear().nice()` with `ticks(4)`, which gives 0–50 in steps of 10.
- **Fix:** `pages/analytics-charts.js` `nice()` line 12: allow 5 or 6 intervals (or add 1.25/1.5 steps) so 47 rounds to 50.

### R3D-12 · minor · page (Knowledge) · visual — Proposals table scrolls sideways by 3 px with the review sheet docked
- **Repro:** `knowledge.html?view=proposals` at 1440, Review on row 1: the table scroller is 771 wide in a 768 px column, so a horizontal scrollbar appears under three rows (`kn-proposal-sheet.png`).
- **Expected:** data-nav §7.5: fit by priority; no scrollbar when the priority columns fit.
- **Fix:** trim the fixed column widths (checkbox 28 + actions 119) or let the Proposed answer column shrink (`min-width: 0`) in `pages/knowledge.css`.

### R3D-13 · minor · page (Knowledge) · visual — Toolbar count reads "14  sources" with a double gap
- **Repro:** 1440, 1024 and 768: "14" and "sources" are separated by the flex `gap` plus a `&nbsp;` (`knowledge-1440.png`). Leads and Call reports read "1,284 leads", "2,579 calls".
- **Fix:** `pages/knowledge-table.js` line 148: drop the `&nbsp;` (the `.tb-count` gap already spaces it).

## Round-2 minors still open (re-verified this round, ids kept)

Full repro and fix text are in `round2-data.md`; only this round's evidence is given here.

| id | page · area | still reproduces |
|---|---|---|
| R2D-04 | shared · interaction | 390 touch `call-reports.html?call=call_a00aab` › Call back…: the gate sheet starts at y 257; `elementFromPoint(100, 227)` is the call sheet's "Full summary" button, the sheet is not `inert` (`.float-scrim` z 40 < gate 50, sheet not covered) (`cr-390-gate.png`) |
| R2D-05 | Analytics · accessibility | `.an-fl` 20.5 px tall at 390/360/768; `.barlist-row` 20.5 at 768; "Examples" 53 × 28 at 768; "Missed 6" 38.5 at 768 |
| R2D-06 | shared · accessibility | Rail fixed (44.5). Still: `.bl-seg` 16.5 px tall at 1024×768 touch; `.vtab` 42.5 at 390/360 and 42 at 1024 touch (Leads, Call reports, Knowledge route tabs) |
| R2D-07 | Leads, Call reports · accessibility | `#cs-title` (deep link and phone sheet) and `#leads-gate-t` still draw the 1.6 px outline box; neither has `data-focus-target` (`cr-title-focus.png`, `leads-gate-head.png`, `cr-390-sheet.png`) |
| R2D-08 | Leads · accessibility | `#leads-range` still `role="status"`; opening a lead and pressing Esc rewrites it twice with the same "1–50 of 1,284 leads" (MutationObserver). Knowledge's `#kn-count` (`role="status"`) does not re-render on sheet, J/K or selection, so it is fine |
| R2D-09 | Analytics · accessibility | Hover "About Answered": tooltip + `.ctip.an-trend` both show; Esc closes only the tooltip (`an-info-hover.png`) |
| R2D-10 | Leads, Call reports, Knowledge · content | `lead_1050` Calls tab: "Vaani called · Call later · 1m 0s · Site-visit qualifier v7 · Yesterday 1:20 pm"; its report `call_7e4246` opens "Priya N. · 4 days ago · 4m 0s · v6". `call_7c61ec` (Lakshmi S., Callback) opens `lead_1260` |
| R2D-11 | Knowledge → Call reports · interaction | "See these calls in Call reports" still `?f.knowledge=not-found&range=7d`; also the source sheet's Used by "Open in Call reports" uses `?f.source=<id>&range=7d`. Call reports reads neither `range` nor `f.knowledge` / `f.source` and shows all 2,579 calls. Fix as before, plus a Source filter |
| R2D-12 | Call reports · spec-fidelity | Gate has no Close (×); cost inset wraps "Home-loan follow-up / v3" and "₹2 to / ₹5" at 1440 and 390 (`cr-1440-gate.png`, `cr-390-gate.png`) |
| R2D-13 | Call reports · content | `call_7c61ec`: "3 turns · Waveform · per-turn timing not available" above turns timed 00:08, 00:56, 01:32 (`cr-wallet0-callback.png`) |
| R2D-14 | Leads · visual | 390: title box 122 px, meta collapses to "Add…" (`leads-390-sheet.png`). Also at 1440 docked the meta ends "Added 16 Sep 2026 · F…" |
| R2D-15 | Leads · responsive | 768×1024 touch: document scrolls 7 px; the Rows per page select loses its bottom border (`leads-768.png`) |
| R2D-16 | all four · visual | Leads: borderless, sliders icon, dialog. Knowledge: dashed, sliders, icon-only at 1024. Call reports and Analytics: dashed, flag, labelled at 1024 and 768 (`leads-1024.png`, `knowledge-1024.png`, `call-reports-768.png`) |
| R2D-17 | all four · accessibility | `<html lang="en">` on all four pages; the "Try a question" Hinglish suggestions have no `lang` |
| R2D-18 | Leads · visual | Gate subtitle still wraps "…place the call. ·" / "Checked just now" at 1440 (`leads-gate-head.png`) |

## Checked and working (no bug)

- **Leads:** wallet ₹0 on `C` (toast, no gate); single gate (focus on title, trap, Esc to row, Ctrl+Enter tooltip); batch gate checks, Adjusted rows with Include/Show; X selection announcements "1 lead selected", "2 leads selected"; Delete → next row, Undo → restored row; New lead ("abc" error on blur, Create → focus back on New lead, toast "Lead added · Open"); phone Filter › Status bottom sheet with "Show 1,284 leads"; tokens overflow at 1280 ("+1 filter") and 1024 ("+2 filters") without a sheet; 1920 shows all three tokens.
- **Call reports:** all three global blockers (wallet, caller ID, offline) on `C` and "Call back…", each with its inline reason; Columns menu keyboard; review run of 9 with "Marked reviewed. Call n of 9, …" and the end state; `/` focuses search, Esc clears it; "No calls match “zzqx”." with Clear search; 390 phone Filter as a bottom sheet with Show test calls.
- **Analytics:** range radios (`?range=7d`, "Showing last 7 days", intents "not computed for this range · Switch to 30 days"); ⋯ menu focuses Export CSV, Esc returns; Custom range opens with two months and future days struck out, Esc returns to Custom…; chart ←/→/End with the spoken period and tooltip; Enter drills to the day (40 rows = 40 clicked); intents, drop-off (19 and 10) and hour (154) drill-downs match; View as table (30 rows, caption, `?table=calls`); Examples disclosure (`aria-expanded`, 3 call links).
- **Knowledge:** Test a question (verdict live region, `ol` "Matching passages", meters `role="img"` "Strong match, score 0.84", below-threshold collapse, caveat, Not found path with Add an answer…); Add knowledge (radio arrows, `?add=text`, 48 of 50,000 counter, inline discard state); delete of a used source opens an alertdialog naming "Site-visit qualifier (Live v7) … step 3, and 2 flows look up all sources", Esc returns to the row ⋯; Proposals review (Ctrl+Enter, toast with Undo, next proposal, meta "2 pending"); 768 tap anywhere on a row opens the modal sheet; 390 Sources/Test switch.
- **All pages:** one H1, correct `<title>`, no skipped heading levels, skip link visible and targets `#main`, dark theme contrast (axe 0), reduced motion, 320 px reflow.

