
### 2.8 Interactions and keyboard

**Table** (data-nav §7.9, one tab stop for the body): ↑/↓ (and J/K when single-key shortcuts are on) move rows; Home/End, PageUp/PageDown; **Enter** opens the call; Tab moves through the focused row's controls (key link, Undo on a row reviewed during this visit, `⋯`); **Esc** closes the sheet, focus returns to the row. There is no row selection in v1, so Space and X do nothing here (Q3). **C** opens the Call gate for the focused row's lead (never dials; hidden when shortcuts are off). **/** focuses search. **Shift+D** toggles density. **?** opens the shortcut sheet.

**With the sheet open:** J/K (or the header chevrons) move to the next or previous call **in the snapshot taken when the sheet opened** (§2.6.4), and the sheet follows; the polite region says "Call 4 of 38". At a page edge, J/K fetch the next or previous page of the same snapshot (same `as_of`). **⌘/Ctrl+Enter** runs the footer's review action (in Needs review: mark reviewed and open the next unreviewed call, focus on its title). **F6** moves focus between the table and the sheet. Browser Back closes the sheet (it pushed `?call=`).

**Inside the sheet:** ←/→ between tabs (automatic activation); ⌘/Ctrl+F searches the transcript when focus is in the sheet (otherwise the browser's find); in the player group, Space or K play and pause (never grabbed from the page), the scrubber takes ←/→ 5 s, Shift+←/→ 15 s, PageUp/PageDown 30 s, Home/End; Enter on a timecode seeks and plays. Media keys work through the Media Session API.

**Pointer:** clicking anywhere on a row that isn't a control opens the call (delegated to the key link; ignored while text is selected); middle-click or ⌘/Ctrl-click on the key cell opens a new tab. Hovering or focusing a row for 150 ms prefetches its detail, so the sheet usually opens without a skeleton.

**Drill-in from Analytics** (§1.3) lands with filters as FilterTokens and focus on the H1, and announces "38 calls match". A `?call=` landing opens the sheet with focus on its title.

**Motion:** the sheet slides in over 200 ms (`--dur-slow`) at 1024–1439 and appears without motion when docked; row fills and the row `⋯` fade over 90 ms; nothing else moves except the playhead during playback.

### 2.9 Microcopy (before → after)

| Where | Before (live product) | After |
|---|---|---|
| H1 and nav | "Call Reports" (H1), "Reports" (phone bar), "121 calls" pill | "Call reports" everywhere; meta "212 calls · 9 need review · updated 11:24 am" |
| Subtitle | "Recordings, transcripts, sentiment & extracted flow fields" | None (data pages have no description; P1: it promised recordings that often don't exist) |
| Header buttons | "Refresh", solid blue "Export CSV" | Ghost "Refresh" (then "Updated 11:24 am"), tertiary "Export…" |
| KPI cards | "Total Calls 121 · Avg Duration 90s · Positive 4 · Negative 10" | ViewSummary "In this view · 212 calls · 4h 36m talk time · avg 1m 40s · 21 negative" |
| Search | "Search transcripts, summaries…" | "Search calls and transcripts…" (label "Search calls") |
| Sentiment chips | "All · Positive · Negative · Neutral" | Views "All · Needs review · Positive · Negative · Mixed · Unscored" with counts |
| Type column | "BROWSER" pill on every row | Direction "Outbound" / "Inbound" with an icon; "Test call" or "Browser test" outline tag only when test calls are shown |
| Status column | "COMPLETED" outlined pill | Outcome "Visit booked" (or the result "Completed", "No answer", "Timed out") |
| Sentiment | "NEUTRAL" mustard pill | "Neutral" with `meh`: icon and word in `text-2`, no tag, no tint (only Outcome is tinted) |
| Review | none (no review state today) | "Mark reviewed and next" in Needs review, "Mark reviewed" elsewhere; row tag "Reviewed · Undo"; end state "All 9 calls reviewed" · "Back to Call reports" |
| Empty cells | "—" at 50 % alpha | "Not captured", "No outcome", "Not analysed yet" in solid `text-3`, or "–" with a hidden label |
| Flow-field headers | "Condition Check" ×4, "Green & Identity" typo | "Condition check · step 3" (labels from the flow version; typos fixed at the source) |
| Duration | "1:27" (table), "87s" (panel), "90s" (KPI) | "1m 27s" everywhere |
| Dates | "23 Sept, 06:13" | "Today 10:42 am", "Yesterday", "3 days ago", "21 Sep 2026" |
| Filtered empty | "No calls found. No call records match the current search or filters. Calls appear here once your agents start dialing." | "No calls match “site visit”." + what search covers + `Clear search`; or "No calls match Negative in the last 7 days." + `Clear filters` |
| Panel title | "CALL DETAILS" | "Meera S. · Today 10:42 am" |
| Panel sections | "KEY ELEMENTS EXTRACTED", "FLOW BUILDER FIELDS: not collected", "ANALYSIS", "AI SUGGESTIONS" | "Captured · 3 of 4", "Not captured" per field, "Analysis", "Suggestions for this flow" |
| Recording | "No recording is available for this call." | "No recording for this call. Recording is off for browser tests. The transcript is still available." |
| Transcript turns | "ASSISTANT • 2S" / "USER • 15S" | "00:02 Vaani" / "00:15 Caller", with language mark and step |
| Actions | "Re-analyze Transcript", tooltip "Re-run AI analysis from scratch (force=true)" | "Re-analyse call", tooltip "Runs the summary, sentiment and captured fields again." |
| Actions | "Learn from this call" | "Suggest knowledge from this call…" |
| Actions | "Export This Call" | "Export call (CSV)" in `⋯` |
| Close | unnamed "×" | "Close call details" |

### 2.10 Accessibility

- **Keyboard parity (F-A11Y-002, critical):** every call opens from the keyboard; the sheet takes focus on open and returns it on close; F6 cycles regions; nothing on the page needs a pointer (the talk strip is a slider, timecodes are buttons, drag is never required).
- **Table semantics (F-A11Y-018):** `<table role="grid" aria-labelledby="page-title" aria-rowcount={total + 1}>`, visually hidden caption "Calls, sorted by When, newest first", `th scope="col"`, `aria-sort` on the sorted header only, a hidden "Actions" header, `aria-rowindex` absolute across pages, `aria-current="true"` on the open row.
- **Names:** row `⋯` is "More actions for the call with Meera S. at 10:42 am"; sort buttons read "When, sorted newest first"; the Test calls switch is "Show test calls" with its state; the player's Play is "Play recording" ↔ "Pause recording".
- **Announcements** (shell announcer, polite, debounced): result counts after filtering ("38 of 212 calls"), sort changes, page range, "Call 4 of 38" when stepping in the sheet, "Marked reviewed. Call 2 of 9, Pranav I. 8 left to review." in a review run, "All 9 calls reviewed" at its end, "Review undone", "3 new calls", analysis complete. Never announced: playback time, turn text during playback, counts while typing.
- **Colour is never alone (F-A11Y-019):** outcome, result and sentiment carry a word and an icon; the direction carries a word; the open row has the inset bar plus `aria-current`.
- **Contrast (F-A11Y-008, F-VIS-003):** all text on `text`, `text-2`, `text-3` (≥ 4.70:1 on every plane); StatusTags ≥ 5.47:1; no alpha dashes.
- **Language:** each turn has `lang`; Devanagari turns use `read-15-deva`; names carry `translate="no"`; the language column shows names only (LanguageMark `name`); glyph tiles appear only in the call header legend and on turns.
- **Targets (F-A11Y-023):** row `⋯` and sheet header IconButtons are 32 px (hit ≥ 24) on fine pointers and 44 px on touch; the Test calls switch has a 44 px hit area on touch.
- **Reflow and zoom:** at 320 px and at 400 % zoom the page is the phone layout; nothing scrolls sideways except the view tabs strip and the table's own scroller at 768–1023 (with pinned columns).
- **Forced colours:** open and focused rows, the playing turn, tags and the playhead keep visible outlines (`Highlight`, `CanvasText`).
- **Reduced motion:** the sheet fades instead of sliding; smooth scrolling to the playing turn becomes instant.

### 2.11 Responsive behaviour (summary)

| Width | Shell | Views | FilterBar | Table | Sheet |
|---|---|---|---|---|---|
| ≥ 1920 | Sidebar 232 | Full row | One row, 3 tokens inline | P1–P3 (9 columns) stay visible beside the docked sheet | Docked 560 |
| 1440–1919 | Sidebar 232 | Full row | One row | P1–P3; P1–P2 while the sheet is docked (R2) | Docked 560 |
| 1280–1439 | Sidebar 232 | Full row | One row | P1–P3 | Overlay right, non-modal |
| 1024–1279 | Rail 56 | Full row | 2 tokens; Columns icon-only | P1–P2 | Overlay right, non-modal |
| 768–1023 | TopBar 52 + nav sheet | Scrolls, edge fade | Tokens fold into Filter (count) | P1 + user columns; pinned When/Lead and `⋯`; horizontal scroll | Modal, full height, min(560, 100%) |
| 320–767 | TopBar + BottomBar ("Call reports" is slot 3) | Scrolls | Search full width and sticky; Filter + tokens in a scrolling row; pickers open as bottom sheets with "Show 38 calls" | ListRow list | Full screen, player sticky, footer sticky above the safe area; BottomBar hidden while open |
| Height ≤ 720 | Baseline folds into a header chip | "View: All ▾" Select in the toolbar | – | ≥ 10 rows | – |

ViewSummary: one line at ≥ 768 (it truncates the last facts first and keeps "In this view · {n} calls"); on phones it wraps to two lines and scrolls away with the header. The Test calls switch moves into the Filter sheet on phones.

### 2.12 Telemetry hooks (optional, consent-gated)

Events fire only after the user has accepted analytics cookies (F-QA-033 found a 365-day analytics cookie set before consent). No payload contains a name, phone number, search text, transcript text or captured value.

| Event | Properties |
|---|---|
| `call_reports.viewed` | `view`, `has_filters`, `result_count_bucket` (0, 1–10, 11–100, 101–1k, 1k+), `test_calls_shown` |
| `call_reports.filter_changed` | `field` (id only), `action` (add, edit, remove, clear) |
| `call_reports.searched` | `query_length_bucket`, `result_count_bucket`, `latency_ms` |
| `call_reports.call_opened` | `source` (row_click, keyboard, deep_link, analytics_drilldown, j_k), `position_on_page`, `tab` |
| `call_reports.tab_viewed` | `tab`, `dwell_ms` on leave |
| `call_reports.recording_played` | `scrubber_variant` (talk_strip, waveform, track), `pct_listened_bucket`, `speed` |
| `call_reports.transcript_searched` | `match_count_bucket` |
| `call_reports.reanalysed` / `.exported` | `format`, `columns`, `include_transcripts`, `row_count_bucket` |
| `call_reports.marked_reviewed` / `.review_undone` | `view`, `advanced` (true when "and next" moved on), `position_in_run`, `run_size_bucket`, `input` (click, shortcut) |
| `call_reports.review_run_finished` | `run_size_bucket`, `skipped_count`, `duration_s_bucket` |
| `call_reports.error_shown` | `surface` (table, stats, transcript, recording), `code` |

Questions these answer: do reviewers use views or search; how often the transcript is read versus the summary; whether the player gets used when a recording exists; how often drill-downs from Analytics end in an opened call.

### 2.13 Acceptance criteria (Call reports)

**Data truth**
- [ ] With 212 fixture calls, the oldest call is reachable through the pager, and a search for a phrase in its transcript finds it (F-QA-005).
- [ ] One browser test call produces one row, and the ViewSummary and view counts count it once; with test calls hidden it is not counted at all (F-QA-006).
- [ ] ViewSummary, view counts and the Analytics StatStrip return identical numbers for the same range and filters (both call `/api/calls/stats`) (F-QA-014, F-UX-011).
- [ ] No number renders as "0" while loading; skeletons or "–" only (F-UX-030).
- [ ] Captured values and "Not captured" in the sheet never contradict each other for any fixture call (F-UX-010).

**Layout**
- [ ] At 1440×900, ≥ 15 rows show in Standard; at 1366×768 and 1280×720, ≥ 10 (chrome budget).
- [ ] No horizontal page scroll at 320, 360, 390, 768, 1024, 1280, 1440, 1920; at 768–1023 only the table scroller moves sideways and When and Lead stay pinned.
- [ ] At most 9 columns show by default; Captured and per-field columns appear only as specified in §2.5; repeated field labels read "Field · step n".
- [ ] At 360×780 at least 8 ListRows are visible and the search field is full width (F-RWD-004, F-RWD-009).

**Keyboard and screen reader**
- [ ] Tab into the table, press ↓ twice and Enter: the sheet opens with focus on its title; Esc returns focus to the same row (F-A11Y-002).
- [ ] J/K in the open sheet step through calls and announce "Call n of N"; Back closes the sheet.
- [ ] In Needs review with 9 calls, ⌘/Ctrl+Enter on call 1 marks it reviewed, opens the next unreviewed call and puts focus on its title; nine presses review all nine, and the sheet then shows "All 9 calls reviewed" with Back to Call reports, which returns focus to the last reviewed row.
- [ ] A reviewed row stays at the same position and height with "Reviewed · Undo" until Refresh or re-entering the view; no row above or below the pointer moves while reviewing.
- [ ] The Needs review tab count, the header meta and the ViewSummary drop by one as each call is marked, rise again on Undo, and match the server after the response; a failed request reverts them and keeps the sheet on the call.
- [ ] Previous and Next walk the snapshot taken when the sheet opened: a call reviewed, or a call that arrives, during the run does not change "Call n of N"; a call reviewed by a colleague is skipped by "and next".
- [ ] Space does not start playback unless focus is inside the player; ←/→ on the scrubber seek 5 s; a timecode seeks and plays.
- [ ] Pressing `c` on a focused row opens the Call gate and never sends a call request.
- [ ] axe reports no `empty-table-header`, no unnamed buttons and no contrast failures on the page, the sheet and the Export popover, in both themes.

**URL and state**
- [ ] Reload and a pasted link restore view, search, filters, range, sort, page, columns, the open call, its tab and `?t=` (F-UX-031, F-QA-016).
- [ ] A `?call=` for a call on page 5 opens the sheet from page 1.
- [ ] Filtering the open call out of the results keeps the sheet open with "Not in the current results. Clear filters".

**Copy and visuals**
- [ ] No uppercase labels, no text below 12 px, no mono outside ids (phones and timecodes are Hanken tabular), no `force=true`, no em-dash separators (lint list, direction §4.4).
- [ ] Each row carries at most one tinted element (the Outcome tag); Sentiment renders as icon + word in `text-2` with no fill or outline, in the table, the sheet and the phone list (direction §6.4).
- [ ] Every "no recording" state states its reason when B7 provides one.
- [ ] The page has no filled Neel element except the focus ring, the selected-tab indicator, the playing turn and links (the Export popover's confirm is the one primary inside that popover).
