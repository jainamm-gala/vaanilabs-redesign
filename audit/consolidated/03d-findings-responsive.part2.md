
### F-RWD-006 — Meeting Agent content is wider than the screen below 513px, so Create Room, the session-mode switch and the room controls are cut off or overlap
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-02
- **Pages:** /meeting-agent
- **Evidence:**
  - The layout breaks at 512px and below. At 500 the scroller has sw = cw = 500; at 480 it has sw 489 > cw 480.
  - At 390:
    - the `div.lg:col-span-2` column spans l=24 to r=489 (465px wide);
    - the scroller `div.flex-1.overflow-y-auto` has sw 489 vs cw 380;
    - the document itself does not overflow.
  - The overflow is 99px at 390, 105px at 375 and 129px at 360.
  - **Cause:** five past-meeting URL anchors are `white-space:nowrap` at 274px each, and their titles are 202px. None has `min-w-0` or truncation, so together they set the column's minimum width. The active-room URL *is* truncated (78px with an ellipsis).
  - Measured at 390:
    - "Conversation flow" segment: l=257 to r=464;
    - Create Room: r=465;
    - Refresh: r=465;
    - room buttons all on one line: Agent 177–247, Intel 255–324, Record 332–408, Delete room 416–448.
  - What the user sees at 390:
    - Agent is drawn over the "Open" and "1 participant" labels;
    - Record is cut and Delete room is off-screen;
    - the title wraps to 3 lines ("Meeting / Agent — / Vikash") because the "Free minutes" pill shares its row.
  - **Why medium, not high:** the controls can be reached by scrolling sideways, and on a phone the page can only be opened by URL (F-RWD-001).
- **Screenshots:** audit/screenshots/va-verify-responsive-a/meeting-agent_390.png, audit/screenshots/va-verify-responsive-a/meeting-agent_390_rooms.png, audit/screenshots/va-responsive-a/meeting-agent_360.png, audit/screenshots/va-responsive-a/meeting-agent_360_rooms.png, audit/screenshots/va-explore-core/meeting_agent_mobile.png
- **Recommendation:**
  - Add `min-width:0` (`min-w-0`) to the grid column and to the flex items in each row.
  - Truncate every meeting URL (`truncate` plus a Copy button), or let it wrap with `overflow-wrap:anywhere`.
  - Below 640:
    - stack the room metadata above the room actions;
    - lay the actions out as a full-width 2x2 grid of 44px buttons;
    - keep Delete room at least 8px from its neighbours, or move it into an overflow menu with a confirmation step;
    - move the "Free minutes" pill below the title.
  - Add `overflow-x:clip` to the page scroller as a safety net.

### F-RWD-007 — Personal Agents header never wraps, so "New task" (the page's only primary button) is pushed off-screen on phones
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-A-03
- **Pages:** /personal-agents
- **Evidence:**
  - The header row is `flex-wrap:nowrap`.
  - At 390:
    - NEW TASK spans l=362 to r=438 and is 77x50 (its label wraps to 2 lines);
    - `main.overflow-y-auto` has sw 438 vs cw 380;
    - SETTINGS spans 143–248 and REFRESH spans 256–354;
    - the h1 wraps to "Personal / Agents" (107px wide), and the description runs to about 14 narrow lines;
    - only the blue "+" edge of the button shows at the right edge.
  - The button's right edge passes the viewport below about 440px. From 768 down, its label already wraps to 2 lines.
  - The empty-state text "Click New task" is a plain SPAN with no click handler, so it cannot stand in for the button.
  - **Why medium, not high:** the button can be reached by scrolling `main` sideways, and on phones the page can only be opened by URL.
- **Screenshots:** audit/screenshots/va-verify-responsive-a/personal-agents_390.png, audit/screenshots/va-verify-responsive-a/personal-agents_390_bottom.png, audit/screenshots/va-responsive-a/personal-agents_360.png, audit/screenshots/va-responsive-a/personal-agents_768.png
- **Recommendation:**
  - Make the header `flex-wrap:wrap` (or `flex-col` below `md`), with the actions on their own row.
  - Keep button labels on one line with `white-space:nowrap`, and let the container wrap instead.
  - On phones, show "New task" either as a full-width button or as a FAB positioned at `bottom: calc(56px + 16px + env(safe-area-inset-bottom))`.
  - Make the "New task" link in the empty state a real `<button>` that opens the same dialog.

### F-RWD-008 — Analytics header actions push the whole page sideways below about 543px
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-B-04, EXPLORE-DATA-16 (Analytics part)
- **Pages:** /analytics
- **Evidence:**
  - The header action group ("UPDATED hh:mm · REFRESH · CSV · EXPORT PDF", about 357px) does not wrap and cannot shrink.
  - Its buttons sit at fixed x positions: Refresh 257–360, CSV 368–439, Export PDF 447–543.
  - Because of this, the main scroller (`div.relative.flex.flex-1.min-h-0.flex-col.overflow-y-auto`) has scrollWidth 543 at every width of 560 or less.
  - Measured overflow:

    | Width | Overflow |
    |---|---|
    | 560 and 552 | none |
    | 540 | 3px |
    | 390 | 153px |
    | 360 | 193px (max scrollLeft 193.6) |

  - All page content pans sideways, and CSV and Export PDF start off-screen. The document itself does not overflow.
  - Related, also at 360: the KPI cards clip their content (cw 156 vs sw 160–163). Sentiment-chart tick labels render 4.8px tall at 390 (RESPONSIVE-B-15, reported in another section).
- **Screenshots:** audit/screenshots/va-verify-responsive-b/analytics_390.png, audit/screenshots/va-verify-responsive-b/analytics_360_hscrolled.png, audit/screenshots/va-explore-data/r2_m_analytics.png
- **Recommendation:**
  - Below `sm`, move CSV and Export PDF into a "⋯" menu. Keep Refresh as an icon button with an `aria-label`.
  - Move "Updated hh:mm" under the title.
  - Give the header `flex-wrap:wrap` and `min-width:0`.
  - Add `overflow-x:clip` to the page scroller so one wide child can never pan the whole page again.

### F-RWD-009 — Call Reports search shrinks to 52px on phones, and the sentiment pills run off-screen at 360
- **Severity:** medium · **Confidence:** verified
- **Source findings:** RESPONSIVE-B-07, EXPLORE-DATA-16 (Call Reports part)
- **Pages:** /call-reports
- **Evidence:**
  - Search input width by viewport:

    | Width | Search input |
    |---|---|
    | 1024 | 600px |
    | 768 | 344px |
    | 560 | 224px |
    | 430 | 94px |
    | 390 | 54px |
    | 360 | 52px |

  - The placeholder ("Search transcripts, summaries…") shows the icon plus one letter at 390, and only the icon at 360.
  - At 360 the Neutral pill spans x 304–372, so it runs 12px past the screen edge and its label is visibly clipped. It fits at 390 (right edge 374).
  - The input can still be tapped and typed into.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/callreports_390.png, audit/screenshots/va-verify-responsive-b/callreports_360.png, audit/screenshots/va-explore-data/r2_m_callreports.png
- **Recommendation:**
  - Below `sm`, put search on its own full-width row (`flex: 1 1 100%; min-width: 12rem`) above the sentiment filter.
  - Make the filter either a segmented control or a horizontally scrolling chip row with an edge fade (`mask-image`) and `scroll-snap-type:x`.
  - Shorten the placeholder to "Search calls".

### F-RWD-010 — Call Reports table has no mobile or tablet layout (18 columns, 2,617px wide)
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** RESPONSIVE-B-05
- **Pages:** /call-reports
- **Evidence:**
  - The page uses a real `<table>` with 18 columns and a width of 2,617px at every width once loaded.
  - Its wrapper (`flex-1 overflow-auto`) is 1838px wide at 1920, 1358 at 1440 and 390 at 390, so the table scrolls sideways at every width, even 1920.
  - At 390 only Type, To and Started are fully visible. Sentiment and Summary, the columns users need, are 6th and 7th.
  - `thead` is sticky, but the first `th` and `td` are `position:static`, so no column stays frozen while scrolling sideways.
  - Type shows "BROWSER" on every row.
  - In the first 30 rows, 287 of the 330 extracted-field cells (87%) are "—".
  - Extracted text is cut at `max-w-[220px]`, with no way to see the full value on touch.
  - Verifier correction: the auditor's "16 columns at 1920" was a load-timing artefact; 1920 also has 18 columns.
  - Lowered to medium because a wide scrolling table is normal for desktop reports.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/callreports_1920.png, audit/screenshots/va-verify-responsive-b/callreports_390.png, audit/screenshots/va-responsive-b/callreports_1024.png, audit/screenshots/va-responsive-b/callreports_768.png
- **Recommendation:**
  - Reorder the columns by priority: Started, Status, Sentiment, Duration, Summary, To. Show Type as an icon.
  - Move the extracted fields into the details pane, or behind a "Fields" column picker that is off by default. Auto-hide any column that is empty in more than 80% of rows.
  - At 768 and wider, freeze the first column (`position:sticky; left:0`, with a background colour and a right border).
  - Below 768, render each call as a card:
    - line 1: time and duration;
    - line 2: a status chip and a sentiment chip;
    - below that: a two-line summary.

### F-RWD-011 — Leads hides Status and Interest on phones and shows only 2–3 leads per screen
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** RESPONSIVE-B-08
- **Pages:** /leads
- **Evidence:**
  - The Interest header is hidden below 768: visible at 800, hidden at 640.
  - The Status header and badges show at 640 and are hidden at 620 and 600. The number of visible "NEW" elements drops from 25 to 1, and the remaining one is the filter chip.
  - Nothing replaces them. Each row shows only the name, the masked phone number and a 32x32 call button.
  - The keyboard-shortcut legend (7 `kbd` keys, 45–70px tall) still shows under touch emulation.
  - With true mobile emulation (verified):
    - at 390x844, the first-row call buttons are at y 567, 632 and 696, and the tab bar starts at 788, so 3 rows are visible;
    - at 360x780, they are at y 585, 650 and 715, and the bar starts at 724, so 2 rows are fully visible.
  - In landscape at 844x390, the first screen shows no lead rows at all.
  - The space above the list goes to: a stacked header, 4 KPI cards (2x2), the legend, search, and 2 chip rows.
  - Verifier correction: the auditor's "1 row at 360" was a Playwright screenshot re-layout artefact (DPR 1, desktop scrollbars). The true figure is 2 rows.
- **Screenshots:** audit/screenshots/va-verify-responsive-b/leads_390.png, audit/screenshots/va-verify-responsive-b/leads_360.png, audit/screenshots/va-responsive-b/leads_landscape_844x390.png
- **Recommendation:**
  - On phones, keep the status chip in the row, under the name next to the phone number, and show Interest as a small meter.
  - Hide the shortcut legend under `(hover:none), (pointer:coarse)`.
  - Collapse the KPIs into one scrolling summary strip.
  - Move Refresh, Export and Import into an overflow menu, so the header fits on one line. Keep "New lead" as a header icon button or a FAB.
  - Keep the row's call button at least 8px from the row's tap area, to prevent accidental outbound calls.

### F-RWD-012 — Leads filter rows overflow from 1024px with no visual cue, and the column headers scroll away
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** RESPONSIVE-B-10, EXPLORE-DATA-16 (Leads part)
- **Pages:** /leads
- **Evidence:**
  - The Source chip row overflows by 27px at 1024, 151 at 900, 283 at 768 and 549 at 390.
  - The Status chip row overflows from 820 down: 21px at 820 and 363 at 390.
  - At 1024 the "ANY OUTCOME" dropdown is clipped and an inner scrollbar appears under the chips.
  - At 390 the "Any language" and "Any outcome" selects sit 540px off-screen to the right.
  - The chip rows scroll with a visible scrollbar but have no fade or arrow to show there is more.
  - Only the search and chip block is sticky (`div.sticky.top-0.z-20`, 136–146px tall). The LEAD / STATUS / INTEREST / CALL header row and the page header (with "New lead") scroll away.
  - At 390 the sticky block and the wallet banner cover about 194 of the 788px above the tab bar.
  - Explore-data saw the same things on a phone: a legend shown on touch, scrollbars on the chip rows, and selects off-screen.
- **Screenshots:** audit/screenshots/va-responsive-b/leads_1024.png, audit/screenshots/va-responsive-b/leads_768.png, audit/screenshots/va-responsive-b/leads_1280_scrolled.png, audit/screenshots/va-responsive-b/leads_390_scrolled.png, audit/screenshots/va-explore-data/r2_m_leads.png
- **Recommendation:**
  - Below 1280, move Source, Language and Outcome into one "Filters" button, with a count of active filters. It opens a popover on desktop and a bottom sheet on phones.
  - Keep Status as a single scrolling segmented row, with an edge fade and `scroll-snap`.
  - On desktop, include the column header row in the sticky block.
