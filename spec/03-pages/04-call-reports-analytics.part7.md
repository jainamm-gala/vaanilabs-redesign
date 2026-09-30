
---

## 4. New components needed

Everything else on both pages is an existing component used as specified. These are the gaps, specified here so nobody invents them locally. Build them in `components/ui/data/` next to the DataTable and chart set.

### 4.1 `ViewSummary` (shared with Leads)

**Purpose.** One quiet line of computed totals for exactly what the table shows (view + search + filters + range), so a data page gets its "KPIs" without mixing scopes or spending 100 px (F-QA-014, F-QA-015). `03-leads` uses the same component with lead metrics. **Don't** use it for trends or deltas (StatTile on Analytics), or for numbers computed in the browser from a loaded page.

| Part | Tokens and rules |
|---|---|
| Bar | height `var(--space-32)` (`--size-view-summary`, registered in 01-foundations §18; counted in the chrome budget); padding `0 var(--page-margin)`; `surface`; bottom hairline `border`; flex, `gap: var(--space-12)`; `white-space: nowrap; overflow: hidden` |
| Lead-in | "In this view" `label-12` `text-3`, followed by a tooltip trigger (the whole lead-in) listing the scope in words: "All calls · search “visit” · When: Last 30 days · test calls hidden" |
| Facts | `meta-12` `text-2`, values in `--fw-medium` `text`, tabular, separated by " · " (`text-3`); ordered by importance; the last facts drop first when space runs out (they stay in the tooltip) |
| Link (optional) | right-aligned link button `meta-12` ("Trends in Analytics"), carrying the range and filters Analytics understands |

| State | Treatment |
|---|---|
| Loading / refreshing | Lead-in real; facts as `--space-8` skeleton bars (first load) or unchanged values with "Updating…" (refresh) |
| Error | "Couldn't load totals · Retry" in `text-3`, Retry as a link button |
| Empty result | Hidden (the table's empty state speaks) |
| Unknown metric (backend not ready) | That fact is omitted, never "0" (P1) |

**ARIA:** `role="status"` region with `aria-label="Totals for this view"`; updates are announced only through the shell announcer's result-count message, not separately. **Responsive:** one line at ≥ 768; wraps to two lines on phones and scrolls away with the page header; hidden at viewport heights ≤ 720 when the table would drop below 10 rows (its facts move into the result-count tooltip). **Motion:** none.

```tsx
<ViewSummary label="In this view" scope={scopeWords}
  facts={[{ id: 'calls', label: 'calls', value: 212 }, { id: 'talk_time', label: 'talk time', value: '4h 36m' },
          { id: 'avg_talk', label: 'avg', value: '1m 40s', prefix: true }, { id: 'negative', label: 'negative', value: 21 }]}
  status={status} onRetry={refetch} link={{ label: 'Trends in Analytics', href }} />
```

### 4.2 Chart drill-down contract (extends the data-nav chart set and StatTile)

Every chart component (`BarChart`, `StackedBarChart`, `BarList`, `Funnel`), `StatTile` and each `StatStrip` cell gain an optional `getHref(datum, series?)` prop. When present:
- the focused or hovered period gets an "Open calls ›" row at the end of its `ChartTooltip`;
- Enter on a focused period, or a click on its hit band, navigates (a real link, so ⌘/Ctrl-click opens a new tab);
- on touch, the first tap shows the tooltip and only a tap on "Open calls" navigates;
- legend items become links (not series toggles) when `getLegendHref` is given; a chart never has both behaviours;
- the hit band is the full column (≥ 24 px wide, ≥ 44 px on touch), never the bar alone;
- the chart's `aria-roledescription` stays "chart"; the period's announcement ends with ", press Enter to open these calls".

### 4.3 `RangeControl` (composition recipe)

`SegmentedControl` (7 days · 30 days · 90 days) + a tertiary `Custom…` Button opening `DateRangePicker` (core §7.1), bound to one URL param. With a custom range, no segment is checked and the button label becomes the range ("1–26 Sep 2026"). Phone: the SegmentedControl goes full width in its own sticky row, and Custom moves into the page's `⋯`. The comparison period ("vs previous 30 days") is derived here and passed to every section, so no section computes its own. Used by Analytics, Billing › Usage and Home.

### 4.4 `ExportPopover` (recipe for data pages)

A Popover (400) titled "Export {n} {noun}" with Format (SegmentedControl CSV | XLSX), Columns (RadioGroup: Visible columns / All columns), page-specific options (Call reports: Include transcripts), a fixed privacy note ("Phone numbers stay masked. Exports are logged."), and one primary "Export {n} {noun}". Synchronous up to 5,000 rows, otherwise a progress toast that becomes "Export ready · Download" (link valid 1 h). Disabled with a reason on an empty view. Shared with Leads' Export, Knowledge and Invoices.

### 4.5 Small extensions (no new component)

| Extension | Where it's specified | Change |
|---|---|---|
| `KeyValueList` source note as a seek link | §2.6.3 | `source` may be `{ label, href }`; rendered as a `meta-12` link; for captured fields it seeks the player and switches to the Transcript tab |
| `StatusTag` domain `review` | §2.6.4 | Reviewed · `check` · neutral (outline); used as a qualifier tag in the sheet header, the optional Reviewed column, and in the actions cell of a row reviewed during this visit, followed by a link button "Undo" |
| `StatusTag` `appearance="plain"` | §2.5, §2.6 | The domain's icon (14, `text-3`) and word (`data-13` or `meta-12`, `text-2`) with no fill, border or tone colour. Used for Sentiment in Call reports' table, sheet and phone list, so each row carries one tint (Outcome) (direction §6.4). Unscored renders its word in `text-3` |
| `FilterBar` fields Intent, Last step reached, Hour of day (IST), Kind, Reviewed | §2.5, §1.3 | New field definitions only (enum, enum per flow version, number 0–23, enum, boolean) |
| `Pager` range suffix | §1.2 | "· test calls hidden" / "· test calls included" appended to the range text |

### 4.6 `StatStrip` (Analytics headline; replaces a row of StatTile cards)

**Purpose.** Four to five headline numbers for one range, read left to right as one band, each a link to its calls. It exists because four bordered cards with sparklines made Analytics read as a generic dashboard (D12, P7). **Use** on Analytics; Billing › Usage and Home may adopt it. **Don't** use it for a single number (use a StatTile), for more than five metrics, or inside a Card.

```
────────────────────────────────────────────────────────────────────────────────────
 Calls ⓘ               │ Answered ⓘ            │ Avg talk time ⓘ       │ Minutes used ⓘ
 212                   │ 78%                   │ 1m 40s                │ 276 min
 ▲ +12% vs previous 30 │ ▼ −3 pts vs previous… │ – No change           │ ▲ +9% vs previous…
────────────────────────────────────────────────────────────────────────────────────
Last 30 days · calls, not legs · test calls excluded · Open these calls in Call reports
```

| Part | Tokens and rules |
|---|---|
| Strip | `<section aria-labelledby>` with a visually hidden `h2` "Overview"; a grid of equal columns; `border-block: var(--bw-hairline) solid var(--border)`; no background, radius or shadow |
| Cell | `padding: var(--space-16) var(--space-20)`; cells 2 to n add `border-inline-start: var(--bw-hairline) solid var(--border)`; the value and delta sit inside one `<a>` (the cell link); hover fills the cell with `--row-hover` over `--dur-fast`; keyboard focus draws the 2 px ring around the link (`outline-offset: var(--space-2)`), inside the cell's padding, so it never touches the neighbouring cell, and opens the trend preview |
| Label row | `label-13` `text-2` + the ⓘ IconButton (14, `text-3`, definition tooltip from `lib/metrics.ts`), outside the link and before it in the tab order |
| Value | `num-28` with its tracking, tabular, `text`; unit in `body-14` `text-3`; `num-20` below 768 |
| Delta | as StatTile (data-nav §4.5, §4.7): `label-12`, arrow + sign + words, coloured by `deltaTone` |
| Scope line | one line under the strip, `meta-12` `text-3`, `margin-top: var(--space-8)`: window · counting rule · test-call rule, then the link "Open these calls in Call reports" (`meta-12` link) carrying the range and test-call rule (§1.2, §1.3). Cells carry no scope line of their own |
| Trend preview | a `ChartTooltip` (data-nav §11.7: `surface-raised`, 1 px `border-overlay`, radius-6, `e2`, `z-tooltip`, `pointer-events: none`), 240 wide, anchored under the cell with `space-8` offset and flipped at the viewport edge. Header `label-12` "Answered · last 30 days"; a 208 × 40 line in `--chart-neutral` at `--icon-stroke`, round joins, no axes, the last point a 6 px dot in `--chart-highlight`; row `meta-12` `text-2` "28 Aug 80% → 26 Sep 78%"; row `meta-12` `text-3` "Low 76% · high 81%". Opens after `--timing-tooltip-delay` on hover, at once on keyboard focus of the cell link, closes on leave, blur or Esc; never on `pointer: coarse`. Under 7 points it reads "Not enough data yet". The link's `aria-describedby` points at a visually hidden sentence with the same facts ("From 80% on 28 Aug to 78% on 26 Sep, low 76%, high 81%") |

| State | Treatment |
|---|---|
| Loading | labels real; values as `space-28` skeleton bars, half the cell width; deltas as `space-12` bars; the scope line reads "Updated when loaded"; `aria-busy` on the strip |
| Error (one metric) | value "–" in `text-3`, delta slot "Couldn't load · Retry" (danger icon, link button); the other cells unaffected |
| Empty range | "0" only when the server says 0; delta "No calls in the previous 30 days" |
| Filtered or custom range | the scope line names it ("1–26 Sep 2026 · calls, not legs · test calls included") |

**Responsive.** ≥ 768: one row of cells. 320–767: a 2 × 2 grid; the second column keeps its `border-inline-start`, the second row gets `border-block-start`; values `num-20`; no trend preview; the scope line wraps. No horizontal scrolling at any width (replaces StatGrid's phone scroll-snap strip on this page). **Motion:** the cell fill fades over `--dur-fast`; the preview fades over `--dur-fast`; no counting numbers. **Forced colours:** cell rules and the focus ring render as `CanvasText` and `Highlight`.

```tsx
<StatStrip label="Overview" scope={scopeWords} scopeLink={{ label: 'Open these calls in Call reports', href }}
  cells={[{ metric: 'calls', value: 212, delta, href, trend: daily }, /* answered, avg_talk, minutes_used */]} />
```

### 4.7 `ReportSection` and `ReportGrid` (layout recipe; no new primitive)

**Purpose.** Lay out a report page as titled sections divided by hairlines instead of cards, so there is one level of containment (P7, anti-pattern 7). Used by Analytics; Billing › Usage should follow.

| Part | Tokens and rules |
|---|---|
| ReportGrid | ≥ 1024: `grid-template-columns: repeat(2, minmax(0, 1fr))`, no gap; each row begins with a full-width hairline (`border-block-start` on both sections of the row). The right-hand section adds `border-inline-start: var(--bw-hairline) solid var(--border)` and `padding-inline-start: var(--space-24)`; the left one `padding-inline-end: var(--space-24)`. A section may span both columns (`grid-column: 1 / -1`). < 1024: one column, each section with its own top hairline. DOM order equals visual order |
| ReportSection | `<section aria-labelledby>`; `padding-block: var(--space-20) var(--space-32)`; no border box, background, radius or shadow; the page background is `surface` |
| Header | one row, baseline-aligned: `h2` `title-16` `text`, then meta `meta-12` `text-3` (range, counts, freshness), then right-aligned actions (ghost sm "View as table", a FlowSwitcher, Recompute); wraps under the title below 480 px of section width |
| Body | the chart (data-nav §11 rules, drawn on `surface`), a BarList, a Funnel or a KeyValueList. Tables shown by "View as table" render as a `flush` DataTable (no frame), so there is never a frame inside a section |
| Footnote | `meta-12` `text-3`, `margin-top: var(--space-8)` |

The ChartFrame header, legend, plot sizing and states (data-nav §11.2–11.9) apply unchanged; only the Card wrapper is replaced (R8).

---

## 5. Reconciliations with the component specs

Where two specs disagree, or a spec's rule cannot hold at a real width, this page decides as follows. The component spec owners should fold these back in.

| # | Conflict | Decision here |
|---|---|---|
| R1 | Call detail tab names differ: data-nav §3.1 "Summary · Transcript · Captured", overlay §4.1 "Summary · Transcript · Data"; data-nav §12.4 says the transcript is the default tab | **Transcript · Summary · Captured**, Transcript first and default. The sheet header carries the outcome, sentiment and first summary sentence, so the Summary tab is detail, not the first read. "Captured" is the glossary word (§1.6) |
| R2 | Overlay §4.6 says the table keeps at least 8 columns beside a docked 560 sheet at ≥ 1440 | At 1440 the table column is 1440 − 232 − 560 = 648 px, which fits 5 columns. The table drops to P1–P2 while the sheet is docked and restores P1–P3 when it closes; at 1920 (1,128 px) all 9 fit |
| R3 | Overlay §4.5 says the transcript inside the sheet uses `role="log"`; data-nav §12.4 says the feed is not `role="log"` (its implicit live region would read interim updates) | Follow data-nav §12.4: `<section>` + `<ol aria-label="Transcript">`, no `role="log"`, in both live and review modes |
| R4 | data-nav §11.6 lets legend items toggle series | On Analytics, legend items are drill-down links (§4.2). A legend never both toggles and navigates |
| R5 | data-nav §4.4 lists StatTile "on Call reports" and "on Analytics" | Call reports uses ViewSummary instead (D4); Analytics uses the StatStrip (§4.6, D12); StatTile stays for Home, Leads pipeline (per `03-leads`) and Billing › Usage |
| R6 | data-nav §7.8 "Call…" is the one inline row action on Leads | Call reports rows have no inline labelled action, only `⋯`; the row's main verb is "open", and "Call back…" lives in the sheet footer and on `C` |
| R7 | data-nav §7.5 lists Call reports P3 as Direction, Flow + version, Language and P4 as Captured, Channel, Call id, Cost | Same, plus Phone at P3 (direction §6.4 anchors it; data-nav omits it), Channel renamed **Kind** (shared call model), and Summary and Result added at P4 |
| R8 | data-nav §11.2 makes every ChartFrame a Card, which turns a report page into a grid of cards (anti-pattern 7) | On Analytics the ChartFrame renders inside a ReportSection (§4.7): same header, legend, plot and states, no Card |
| R9 | data-nav §11.5 and foundations §3.6 drew single-series bars, funnel fills and bar lists in a Neel `--chart-1`, so Analytics was all Neel | Token `--chart-neutral` (alias of `--chart-1`, now Ink: graphite-700 light, graphite-250 dark; 11.46:1 and 9.20:1 on `surface`) for every single-series mark, and `--chart-highlight` (alias of `--accent-mark`; 8.52:1 and 8.33:1) only for the hovered, focused or selected period. Folded into foundations §3.6 and data-nav §4.5, §11.5 and §11.11 in this revision |
| R10 | data-nav §11.1 answers "When are calls busiest?" with a Neel HeatStrip | Analytics uses a 24-bar BarChart by hour in `--chart-neutral` (length is read more precisely than five colour steps). HeatStrip has no other consumer and can be dropped from the component set |
| R11 | data-nav §5.3 renders sentiment as a toned StatusTag everywhere | In tables and lists where Outcome is already tinted, sentiment uses `appearance="plain"` (§4.5); toned sentiment tags remain for the sentiment chart's legend and tooltip |

---

## 6. Open questions for the product owner

1. **Average or median talk time?** This spec ships a mean of answered calls (§1.1). Confirm, or ask for a median as a second metric.
2. **Answered rate:** does voicemail count as answered? (Proposed: yes for outbound, since the line connected.)
3. **Bulk actions on Call reports:** v1 has none. Candidates for v2: Mark reviewed, Export selected, Call back selected (through the Call gate).
4. **Role gating:** should members see Call reports and Analytics (today they do)? Should Recompute and Reveal number be admin-only?
5. **Recording downloads:** which roles, masked or not, and how long the logged link lives (data-nav open question 9).
6. **Re-analyse history:** keep the previous analysis for 30 days so a re-analysis can be compared or reverted?
7. **Needs review:** confirm the definition (negative or mixed, failed or timed out, or no outcome; not yet reviewed) and whether "Reviewed" is per workspace or per reviewer.
8. **Intent clustering:** which windows are computed (7, 30, 90 days?), how often, and who may trigger Recompute.
9. **Browser test billing:** follows `01-agent-cockpit` Q2; the Cost cell and Minutes used definition read the server's rule.
10. **PDF report:** one page per card in the same tokens (proposed), or a shorter executive summary?
11. **New-call polling:** is 60 s acceptable load, or should Call reports subscribe to a server event stream?

---

## 7. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-A11Y-002 call details mouse-only | critical | §2.6, §2.8, §2.10, §2.13 |
| F-QA-005 50 of 121 calls | high | §1.5 B1, §2.2, §2.5, §2.13 |
| F-UX-009 17-column table, no anchor, mouse-only | high | §2.4, §2.5 (columns), §2.11 |
| F-UX-010 transcript buried in a 373 px panel | high | §2.6 |
| F-UX-011 metrics disagree across pages | high | §0 D3, §1.1, §1.2, §3.12 |
| F-QA-006 two legs per browser test | high | §1.1, §1.5 B3–B4, §2.6.1 |
| F-RWD-004 Call reports phone strip | high | §2.4 (phone), §2.11 |
| F-QA-014 KPI scopes mixed | medium | §0 D4, §4.1 |
| F-UX-036 range scope, raw LLM error, stale cache | medium | §0 D6, §3.5, §3.6, §4.3 |
| F-VIS-010 Analytics decoration and inverted hierarchy | medium | §0 D10, §3.3, §3.4, §3.8 |
| F-VIS-011 deltas by sign, mustard neutral | medium | §1.1, §3.5, §3.12 |
| F-VIS-012 distorted sentiment chart | medium | §3.5, §3.9 |
| F-QA-019 funnel without fills, ambiguous steps | medium | §3.5, §3.7 |
| F-UX-015 DID card points at Billing | medium | §0 D5, §3.5, §3.6 |
| F-A11Y-018 table structure | medium | §2.10 |
| F-A11Y-019, F-A11Y-008 contrast of chips, dashes, muted text | medium · high | §2.9, §2.10, §3.9 |
| F-VIS-024 date and duration formats | medium | §1.6, §2.9 |
| F-VIS-027, F-RWD-010 dash-filled columns, no mobile layout | low · medium | §0 D7, §2.5, §2.11 |
| F-RWD-008 Analytics header pushes the page sideways | medium | §3.4, §3.10 |
| F-RWD-009 search and pills overflow on phones | medium | §2.4, §2.11 |
| F-UX-031, F-QA-016 state not in the URL | medium | §1.4 |
| F-UX-030 zeros while loading | medium | §2.7, §3.6, §4.1 |
| F-UX-046 no Mixed, wrong empty copy, blanks first, duplicate headers | low | §2.5, §2.7, §2.9 |
| F-UX-048, EXPLORE-DATA-15, F-VIS-013 truncated names on phones | low · medium | §3.4, §3.10 |
| F-UX-016, F-UX-019 internal strings, raw errors | medium | §2.9, §3.6, §3.8 |
| F-UX-034, F-QA-018 "Learn from this call" dead end | medium | §2.6.4 |
| F-QA-037 stale queued calls | low | §2.7 |
| F-UX-043, F-VIS-022 editorial copy, textures | medium | §3.8, §3.12 |
| F-A11Y-014 silent status changes | medium | §2.10, §3.9 |
| F-A11Y-022 infinite animations on Analytics | medium | §3.7, §3.12 |
| F-VIS-014 clipped tooltips | medium | §3.2 (tooltip max 280, portalled) |
| F-VIS-037 duplicate flow names in pickers | low | §2.5 (FlowSwitcher), §3.5 |
| F-QA-033 analytics cookie before consent | medium | §2.12, §3.11 (telemetry only after consent) |
| F-UX-028, F-QA-036 wallet banner on every page | medium · low | §2.2 (no WalletNotice here; inline reason on Call back…) |
| Design critique: Analytics read as a generic card dashboard (KPI cards, sparklines, chart cards, all Neel, a framed table in a card) | major | §0 D12, §3.2–3.5, §3.10, §3.12, §4.6, §4.7, R8–R10 |
| Design critique: two tinted chips per Call reports row | major | §2.3, §2.5 (Sentiment column), §2.6.1, §4.5, R11, §2.13 |
| Usability critique: the review journey stops at one call | major | §2.6.4 (review run), §2.7, §2.8, §2.10, §2.12, §2.13 |
