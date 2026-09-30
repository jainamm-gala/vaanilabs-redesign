
### 3.6 States (with copy)

| State | Treatment and copy |
|---|---|
| **First use (no calls ever)** | StatStrip hidden; one page-level EmptyState in place of the sections: icon `chart-column`, "No calls to analyse yet", "Trends, drop-off and intents appear after your agent's first calls.", action `Place a test call…` (secondary), link "Finish setup (3 of 5)" while setup is incomplete |
| **Empty range** | StatStrip cells show "0" (server-confirmed) with "No calls in the previous 30 days" as the delta when both are empty; each chart's EmptyState inside its plot: "No calls in the last 7 days." + `Show 30 days` (link button) |
| **Not enough data** | Fewer than 7 daily points: the trend preview reads "Not enough data yet"; charts still draw what exists; the sentiment chart adds "Trends appear after 7 days of calls." as a footnote |
| **Loading** | Header, range, StatStrip labels and section headers render at once; after 200 ms the cells skeleton their values, charts draw axes and gridlines with no marks, BarList and Funnel show 4 skeleton rows; `aria-busy` per section; never "0 calls analysed" (F-UX-036) |
| **Range change** | Previous values stay; each section's meta reads "Updating…"; plots crossfade over 90 ms when new data arrives |
| **Partial: one section failed** | SectionError in that section: "Couldn't load sentiment. Retry" (other sections unaffected); with last good data, keep it and add "Couldn't refresh · Retry · Updated 4:12 pm" |
| **Degraded: intents** | "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry" (warning StatusText above the last good BarList); with no previous result: "Intent insights are temporarily unavailable. Retry" |
| **Stale: intents** | Computed longer ago than its refresh interval: meta "Updated 21 Sep" + warning StatusText "Stale · computed 5 days ago · Recompute" (admins) or "· an admin can recompute" (members) |
| **Partial: intents not computed for range** | "Intents are computed for 30 and 90 days. Switch to 30 days" (link) when the chosen range is shorter than the clustering window |
| **Funnel: flow has no calls in range** | "No calls reached Site-visit qualifier v7 in the last 30 days." + FlowSwitcher open hint "Choose another flow" |
| **Funnel: no flows** | "Publish a flow to see where callers drop off." + `Open Flows` |
| **Number section states** (B9) | Pending: StatusTag warning "Pending" + "Your inbound number is being set up. Calls to it will show here." + `Open Phone setup`. None: "No inbound number yet. Request one in Phone setup." + `Open Phone setup`. Ready, no calls: "No calls to +91 80 •••• 2210 in the last 30 days." Never a link to Billing (F-UX-015) |
| **Offline** | ConnectionBar; sections keep data with "Showing data from 4:12 pm"; range changes and exports are `aria-disabled` with "You're offline" |
| **Permission** | Page: `Forbidden` "Only admins and team leads can see Analytics. Ask Anika R. for access." (if the product owner gates it, Q4). Action: Recompute hidden for members; "Include test calls" available to all |
| **Export** | CSV: downloads the data of every section (one sheet per section in XLSX later) named `vaani-analytics-2026-08-28-to-2026-09-26.csv`; PDF: progress toast "Preparing report…" → "Report ready · Download". Disabled with reason while loading: "Wait for the page to finish loading." |
| **Success** | Recompute: StatusText "Recomputing… · about 1 min", then "Updated 4:36 pm"; exports as above. No celebratory states |

### 3.7 Interactions and keyboard

- **Range:** the SegmentedControl is one tab stop; ←/→ move and select (a selection re-queries every section, so the control debounces 250 ms before querying while arrowing). `Custom…` opens the DateRangePicker (presets list, two months at ≥ 1024, typeable segments); Esc cancels. The applied range writes `?range=` with `pushState`, so Back restores the previous range.
- **StatStrip cells:** each is one link (no Card); its name includes value, delta and scope ("Calls, 212, up 12 % vs previous 30 days, last 30 days"). The ⓘ definition is a separate IconButton inside the cell's label row, before the link in the tab order, so the definition is reachable without following the link. **Trend preview:** hovering a cell for 300 ms (`--timing-tooltip-delay`) or focusing its link shows the 30-day line under the cell (§4.6); it never takes focus, Esc hides it, and moving to the next cell moves it. It is not shown on touch; the same facts are in the link's description.
- **Charts** (data-nav §11.8): each interactive plot is one tab stop; ←/→ move between periods or hours, Home/End jump; the hovered or focused period turns `--chart-highlight` over a `surface-2` band while the rest stay `--chart-neutral`; **Enter opens the calls behind the focused period** in Call reports (§1.3), Esc hides the tooltip. The tooltip ends with "Open calls ›" on pointer devices; on touch, the first tap shows the tooltip and a tap on "Open calls" follows it (never a navigation on the first tap).
- **View as table:** a ghost small toggle in each section header swaps the plot for a framed compact DataTable of the same data (`?table=calls,sentiment`); the toggle is `aria-pressed`. Tables are the accessible and printable truth of each chart.
- **Funnel:** the FlowSwitcher in the section header lists flows with calls in the range ("Site-visit qualifier v7 · 96 calls"); each step has two links: the label (opens the step in the Flow Designer at that version) and the drop value (opens the dropped calls in Call reports).
- **Intents:** "Examples" is a disclosure button per row (`aria-expanded`), showing three one-line summaries, each a link to its call. The disclosure never covers other controls (today's tooltip hid Refresh, EXPLORE-DATA-15 area).
- **Freshness:** the header meta says "updated 4:34 pm". Returning to the tab after 5 minutes refreshes quietly (sections keep values, meta shows "Updating…"); the `⋯` menu has "Refresh" for an explicit refresh. Nothing polls while the tab is hidden.
- **Export:** `⋯` › Export CSV downloads at once; Export PDF report shows a progress toast; both carry the range and the test-call rule in the file name and header row.
- **No single-key shortcuts** on this page. `?` still opens the shortcut sheet, `⌘/Ctrl+K` the palette.
- **Motion:** no entrance animation, no counting numbers, no growing bars. Data changes crossfade plot opacity over 90 ms; tooltips fade over 90 ms. Nothing loops (F-A11Y-022).

### 3.8 Microcopy (before → after)

| Where | Before | After |
|---|---|---|
| H1 | "ANALYTICS" (15 px, tracked) + "the dispatch from your line" | "Analytics" + meta "212 calls · last 30 days · updated 4:34 pm" |
| Header actions | "UPDATED 16:34 · REFRESH · CSV · EXPORT PDF" | Range control, `Custom…`, `⋯` (Export CSV, Export PDF report, Include test calls, Refresh) |
| Section titles | "§ 01 Identity — who is on the line", "§ 02 Headline — this past week, in numerals", "§ 03 Sentiment — how the calls felt", "§ 04 Flow — where they hang up", "§ 05 Intents — why they called", "§ 06 Phone — the geography of your line", "§ 07 Recent — the latest ten", "§ 08 Recordings — hear the line itself" | Section titles (`h2`, `title-16`) as questions or quantities: "Calls per day", "Sentiment by day", "Where callers drop off", "Why people call", "When calls come in", "Calls to your number" |
| KPI labels | "TOTAL CALLS" (lifetime), "THIS WEEK +200%", "AVG DURATION +70%", "TOTAL MINUTES +2533%" | "Calls", "Answered", "Avg talk time", "Minutes used", each with a range-scoped value and "▲ +12% vs previous 30 days"; one scope line under the strip |
| Range | "LAST 30D" + "7D · 30D · 90D" inside the Sentiment card | "7 days · 30 days · 90 days" in the header; every section meta says "Last 30 days" |
| Sentiment legend | "WOW SHIFT · positive 0pp · neutral −25pp · negative +13pp · mixed +10pp" | Legend "Positive 58 · Neutral 113 · Mixed 14 · Negative 21"; the comparison lives in each day's tooltip ("Negative 4 · +2 vs previous Thu") |
| Funnel | "{flow name} (v2) · 38 CALLS ANALYSED · colour warms with drop-off — peacock to red"; "Condition Check CONDITION · 1 reached · 0.0% drop" | "Where callers drop off" · "Site-visit qualifier v7 · 96 calls entered · last 30 days"; "3 · Ask about a site visit · 71 · 54% drop · largest" |
| Intents meta | "WINDOW 30D · 97 CALLS ANALYSED · last computed 21 Sept, 16:31, next 21 Sept, 17:01" | "Last 30 days · 188 of 212 calls analysed · updated 26 Sep, 4:01 pm" |
| Intents error | "Intent analysis unavailable — Intent clustering temporarily unavailable (LLM call failed)." | "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry" |
| Number | "ALLOCATED DID · PENDING · not allocated yet · Allocate a number from billing to start receiving calls." | "Calls to your number" · "Your inbound number is being set up. Calls to it will show here." · `Open Phone setup` |
| Phone section zeros | "CALLS ON LINE 0 · UNIQUE CALLERS 0 · NO DATA — No callers yet — share your number —" | "No calls to +91 80 •••• 2210 in the last 30 days." (only when the number is Ready) |
| Recent | "— → — INBOUND" / "— → +91••••••XXXX OUTBOUND", "COMPLETED", link-blue durations | Removed; "Open these calls in Call reports" at the end of the StatStrip scope line (D12) |
| Recordings | "LAST 20 · private bucket — links expire in 1 hour · NO DATA — No call recordings yet." | Removed; each call states its own recording status |
| Footer | "VAANI ANALYTICS · MUMBAI · 2026" | Removed (the Baseline is the only footer) |

### 3.9 Accessibility

- **Headings:** H1 "Analytics"; a visually hidden `h2` "Overview" labels the StatStrip; each section title is an `h2`. Section order in the DOM equals the visual order at every breakpoint (F-A11Y-030); the ReportGrid never reorders with CSS.
- **Charts:** static summaries in `aria-label` state the finding ("Calls per day, last 30 days: from 3 on 28 Aug to 31 on 24 Sep"); interactive plots follow data-nav §11.8 with a visually hidden polite region reading the focused period. Every chart has View as table. Labels are ≥ 12 px at every width (F-VIS-012).
- **Colour:** sentiment has words and icons in the legend and tooltip; deltas carry an arrow, a sign and "vs previous 30 days"; the funnel's largest drop says "largest" in words; the Neel period is also the one with the tooltip and the `surface-2` band, and its values are read out, so the colour change is never the only signal; hour bars have text values on focus and in the table view (F-A11Y-019, F-VIS-011).
- **Contrast:** chart labels on `--chart-label` (`text-3`, ≥ 4.70:1); every mark ≥ 3:1 on `surface` and on the `surface-2` hover band (`--chart-neutral` 11.46:1 light and 9.20:1 dark, `--chart-highlight` 8.52:1 and 8.33:1; validated palette).
- **Names:** StatStrip cell links as in §3.7; "View Calls per day as a table"; FlowSwitcher "Flow for drop-off"; Examples "Show example calls for Price enquiry".
- **Announcements:** range change ("Showing the last 7 days"), section failures ("Couldn't load sentiment"), exports ready. Never the values while arrowing through a chart except through the chart's own region.
- **Targets and touch:** chart periods expose ≥ 24 px hit bands on fine pointers and ≥ 44 px on touch (the band is the full column height, not the bar).
- **Reduced motion and forced colours:** nothing moves; swatches and marks keep `data-mark` borders; focus rings stay visible on plots; in forced colours the hovered or focused bar takes `Highlight` and the others `CanvasText`, and the ReportGrid hairlines stay visible as `CanvasText` borders.

### 3.10 Responsive behaviour (summary)

| Width | Header | StatStrip | Charts | Funnel / Intents | By hour / Number |
|---|---|---|---|---|---|
| ≥ 1440 | H1 + meta + range + Custom… + `⋯` on one row | 4 cells, `num-28`, trend preview on hover or focus | ReportGrid, 2 per row, 240 plots | 2 per row | 2 per row |
| 1280–1439 | Same | Same | 2 per row, 240 | 2 per row | 2 per row |
| 1024–1279 | Meta may wrap under the H1 | 4 cells | 2 per row, 200 | 2 per row | 2 per row |
| 768–1023 | H1 in TopBar; row: meta, range, `⋯` (Custom moves into `⋯`) | 4 cells; no preview on touch | 1 per row, 200 | 1 per row | 1 per row |
| 320–767 | Meta + `⋯`; full-width range row, sticky under the TopBar | 2 × 2 grid with hairline rules, `num-20`, no preview | 1 per row, 160; 3–4 x labels; legend wraps above | Labels wrap to 2 lines; values on their own line | 24 bars, labels every 6 h; number section below |

The page scroller has `overflow-x: clip`, so no header or chart can push the page sideways (F-RWD-008). No section has a fixed height; text wraps. Below 1024 the ReportGrid's vertical rule disappears and every section starts with a full-width hairline.

### 3.11 Telemetry hooks (optional, consent-gated)

Same consent and privacy rules as §2.12.

| Event | Properties |
|---|---|
| `analytics.viewed` | `range`, `test_calls_included`, `sections_failed` (count) |
| `analytics.range_changed` | `from`, `to`, `custom` |
| `analytics.drilldown` | `source` (stat_calls, stat_answered, strip_scope_link, bars, sentiment, funnel_drop, funnel_step_to_flow, intent, hour), `range` |
| `analytics.stat_trend_previewed` | `metric`, `input` (hover, focus) |
| `analytics.table_view_toggled` | `section` |
| `analytics.flow_switched` | `flow_calls_bucket` |
| `analytics.intents_examples_opened` / `.intents_retry` / `.recompute` | `state` (ok, degraded, stale) |
| `analytics.exported` | `format` (csv, pdf), `range` |

Questions these answer: which sections lead to Call reports (and so earn their space); whether anyone opens a KPI's trend preview (if not, it can go); whether people read the funnel and then open the Flow Designer; whether View as table is used (a sign a chart is hard to read).

### 3.12 Acceptance criteria (Analytics)

**Data truth**
- [ ] For the same range and test-call rule, Calls, talk time and sentiment counts equal Call reports' ViewSummary and view counts (one endpoint, §1.1).
- [ ] Each StatStrip cell's delta compares with the previous equal-length window; with no previous calls it reads "No calls in the previous 30 days"; no delta is ever "+∞%".
- [ ] Deltas are coloured by `deltaTone` (negative sentiment up is danger, positive up is success, duration and minutes neutral) and always carry an arrow, sign and words (F-VIS-011).
- [ ] Changing the range changes every section, and every section's meta names the range (F-UX-036); reload restores it.
- [ ] The funnel's fills render for every non-zero step; step labels are "n · label"; the funnel only counts calls on the selected flow version (F-QA-019).
- [ ] A browser test counts once, and test calls are excluded unless "Include test calls" is on (F-QA-006).

**Drill-down**
- [ ] Every element in §1.3 opens Call reports with the listed URL, and the number of rows there equals the number clicked.
- [ ] Enter on a focused chart period opens the same URL as a click.

**Layout and responsive**
- [ ] At 1440×900 the StatStrip and both trend charts are fully visible without scrolling.
- [ ] No horizontal page scroll at 320, 360, 390, 768, 1024, 1280, 1440, 1920 (F-RWD-008); chart text ≥ 12 px at 390 and 1920 (F-VIS-012).
- [ ] At 390 the funnel and intent labels show in full (wrapping), and the StatStrip shows all four values in a 2 × 2 grid without horizontal scrolling (F-UX-048).

**Accessibility**
- [ ] Every chart has View as table; every interactive plot is one tab stop with arrow-key navigation and a spoken summary.
- [ ] axe reports no contrast failures, unnamed controls or heading-order issues in both themes.
- [ ] Under reduced motion nothing animates; no element loops at any time.

**Copy and visuals**
- [ ] No § markers, serif or italic text, uppercase labels, mono labels, HUD brackets, hatch or grid textures; one H1 at `title-20` (F-VIS-010, F-VIS-022).
- [ ] No Card component, border box or background plane in the page body: the StatStrip and the sections are divided by hairlines only, and no table or list sits in a frame inside a section (P7, anti-pattern 7).
- [ ] Every single-series mark (calls per day, funnel fills, intent bars, hour bars, the trend preview line) renders in `--chart-neutral`; only the hovered, focused or selected period is `--chart-highlight`; at rest no chart mark on the page is Neel.
- [ ] No sparkline renders at rest; the trend preview appears on hover (after 300 ms) or on keyboard focus of a StatStrip cell, never on touch, and says "Not enough data yet" under 7 points.
- [ ] The page has no "Latest calls" block; "Open these calls in Call reports" opens `/call-reports?when=30d` with the page's test-call rule.
- [ ] No raw error strings (no "LLM", no vendor names); degraded and stale intents show the last good result with a date.
- [ ] No link on the page points at Billing for anything number-related; the number section links to Settings › Phone setup (F-UX-015).
