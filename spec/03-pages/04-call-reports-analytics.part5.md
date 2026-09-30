
---

## 3. Analytics (`/analytics`)

### 3.1 Purpose and jobs to be done

**Purpose.** Show how the voice agent is performing over a period, where and why callers drop off, and what they call about, with every number traceable to its calls.

| Who | Job |
|---|---|
| Founder or ops lead | When I check in weekly, I want call volume, answer rate, talk time and minutes against the previous period, so I can judge whether the agent is worth what it costs |
| Team lead, QA | When sentiment worsens, I want to see which days and open those calls, so I can find the cause |
| Flow builder | When a flow version is live, I want to see which step loses callers and hear those calls, so I can fix the step |
| Operations | When staffing or scheduling, I want to know which hours (IST) calls come in, and whether the inbound number is getting calls |

**Primary job:** "Is it working, and where is it breaking?" in one screen at 1440×900 without scrolling past the headline numbers and the two trend charts. **Secondary:** export the numbers for a report.

### 3.2 Audit findings addressed

| Finding | Today | Change |
|---|---|---|
| F-VIS-010 (medium) | 15 px tracked H1 under 27 px/800 section titles, § markers, serif italics, HUD brackets, hatch; Identity first, KPIs at y≈570 | `title-20` H1 via PageHeader; `title-16` section titles as questions; StatStrip first; Identity removed (D5) |
| Direction P7, anti-pattern 7 (design critique of the first mock) | The first redesign still read as a generic dashboard: four KPI cards with sparklines over a grid of chart cards, everything in Neel, and a "Latest calls" table in a card with its own frame | One hairline StatStrip (trend only in a hover or focus preview); sections with `h2`s and hairlines on `surface`, no cards; graphite single-series marks with Neel only for the hovered, focused or selected period; Latest calls removed (D12) |
| F-UX-036, EXPLORE-DATA-10 | The 7D/30D/90D toggle sits in the Sentiment card, changes Intents too but not Flow or Headline; not in the URL; resets to 30D | One range in the header (`?range=`), obeyed by every section, stated in every meta |
| F-UX-036 (intents part), F-UX-016 | "Intent clustering temporarily unavailable (LLM call failed)"; "next 21 Sept, 17:01" shown 5 days late | Degraded and stale states with plain copy and the last good result |
| F-UX-011, F-QA-014, F-QA-006 | Avg 1m 18s here vs 90 s on Call reports; "Headline — this past week" over a lifetime total; legs counted twice | Shared definitions (§1.1); the StatStrip states its scope once; conversations, not legs |
| F-VIS-011 | "negative +13pp" green; mustard neutral | `deltaTone` by desirability; grey neutral; arrow + sign + word |
| F-VIS-012 | Stretched 800×220 viewBox, 4.8 px labels on phones, uneven ticks, no legend | ChartFrame rules: 1:1 drawing, 12 px labels, nice ticks, legend with totals, View as table |
| F-QA-019 | Drop-off bars have no fill; six steps named "Condition Check" / "Knowledge Lookup"; always 38 calls | Funnel with fills, "3 · Ask about budget" labels, step links, range-scoped |
| F-UX-015, EXPLORE-DATA-21 | DID card: "Allocate a number from billing" (plain text; Billing can't) | "Calls to your number" section reading Phone setup, linking there |
| F-UX-011, EXPLORE-DATA-20 | §06 "CALLS ON LINE 0" beside §07's inbound calls; §08 "No call recordings yet" with no reason | Section scope states "calls to your inbound number"; Recordings section removed (D5) |
| F-QA-006 | §07 Recent shows each test call as INBOUND "— → —" + OUTBOUND pairs | §07 Recent removed; "Open these calls in Call reports" ends the StatStrip scope line, and Call reports lists one row per conversation |
| F-RWD-008 | Header actions push the page 153–193 px sideways at 390/360 | Wrapping PageHeader, actions in `⋯` below 768, `overflow-x: clip` |
| F-UX-048, EXPLORE-DATA-15, F-VIS-013 | Step names cut to 9 characters at 390; intent names "Appointment …" with room to spare | BarList and Funnel labels wrap to 2 lines on phones; tooltips carry full text elsewhere |
| F-A11Y-022 | 6 infinite animations (spinners, pulse, logo) | Nothing loops; skeletons are static |
| F-VIS-014, EXPLORE-DATA-12 | 70 px tooltips, 16 lines, clipped by cards | Tooltip max 280, portalled |
| F-UX-043, F-VIS-022 | "the dispatch from your line", "— who is on the line", graph-paper grid | Plain nouns; solid planes |
| F-A11Y-008 | 124 of 242 text nodes (51 %) fail contrast | `text-3` ≥ 4.70:1; chart labels on `--chart-label` |

### 3.3 Information hierarchy

1. **The range and the headline numbers** (StatStrip): what period, how many calls, answered, talk time, minutes, each with a delta; the scope stated once under the strip.
2. **Trend shape:** Calls per day and Sentiment by day, side by side.
3. **Diagnosis:** Where callers drop off (per flow version) and Why people call (intents).
4. **Context:** When calls come in (IST) and Calls to your number.

The page is a report, not a dashboard: one level of containment (P7). The only framed things are overlays (tooltips, the range picker). **Colour budget:** chrome is graphite; single-series marks are `--chart-neutral`; the one hovered, focused or selected period in a chart is `--chart-highlight` (Neel); sentiment uses its own palette. Nothing else on the page is Neel except the selected range segment, links and focus. If a screenshot of Analytics looks blue, something is misusing Neel (direction §3.1).

### 3.4 Layout and wireframes

A container page on `surface` (not `bg`): content max `--size-container-page` (1280), centred in the content column, page margin 24. The StatStrip spans the content width. Below it, sections sit in a 2-column **ReportGrid** (§4.7): each row starts with a full-width hairline, the two sections are separated by a vertical hairline, and each section has 24 px of inline padding on the side of the rule. No section has a border box, background, radius or shadow. The page scrolls as one (no inner 858 px scroller, F-VIS-010).

**Desktop ≥ 1440 (content 1160 wide at 1440)**

```
┌ Sidebar ─┬──────────────────────────────────────────────────────────────────────────────────────────┐
│          │ Analytics  212 calls · last 30 days · updated 4:34 pm   [7 days|30 days|90 days] Custom…  ⋯ │ 56
│          ├──────────────────────────────────────────────────────────────────────────────────────────┤
│          │ ────────────────────────────────────────────────────────────────────────────────────────  │
│          │  Calls ⓘ              │ Answered ⓘ            │ Avg talk time ⓘ       │ Minutes used ⓘ     │ StatStrip
│          │  212                  │ 78%                   │ 1m 40s                │ 276 min            │ 112
│          │  ▲ +12% vs prev. 30 d │ ▼ −3 pts vs prev.     │ – No change           │ ▲ +9% vs prev.     │
│          │ ────────────────────────────────────────────────────────────────────────────────────────  │
│          │ Last 30 days · calls, not legs · test calls excluded · Open these calls in Call reports    │ 20 scope
│          │ ────────────────────────────────────────────┬───────────────────────────────────────────── │ row rule
│          │ Calls per day  Last 30 days   View as table │ Sentiment by day  Last 30 days  View as table │ h2 title-16
│          │ 10 ┤      ▇ ▇▇  ▇▇▇                          │ ■Positive 58 ■Neutral 113 ■Mixed 14 ■Neg 21   │
│          │  5 ┤ ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ (graphite, one Neel) │ stacked bars, fixed order, 2 px gaps          │ 240 plots
│          │  0 ┴────────────────────────────────────────│───────────────────────────────────────────── │
│          │ Test calls excluded · Select a day…          │ 6 calls not scored                            │
│          │ ────────────────────────────────────────────┼───────────────────────────────────────────── │
│          │ Where callers drop off [Site-visit q. v7 ▾] │ Why people call  188 of 212 analysed          │
│          │ 1 · Greeting                 96 · 14% drop  │ Site visit booking ▇▇▇▇▇▇ 58 · 31%            │
│          │ 3 · Ask about a site visit   71 · 54% drop  │ Price enquiry      ▇▇▇▇▇  42 · 22%            │
│          │   largest                                   │ …                                             │
│          │ ────────────────────────────────────────────┼───────────────────────────────────────────── │
│          │ When calls come in  IST · last 30 days      │ Calls to your number  Last 30 days            │
│          │ ▁▁▁▁▁▁▂▃▅▆▇█▇▆▅▅▆▇▇▆▄▂▁▁ (24 hour bars)      │ Inbound number  +91 80 •••• 2210  ✓ Ready      │
│          │ 12 am    6 am    12 pm    6 pm              │ Calls received 41 · Unique callers 19 · …     │
│          ├──────────────────────────────────────────────────────────────────────────────────────────┤
│          │ Baseline                                                                                  │ 28
└──────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

Above the fold at 1440×900 (content from y≈56 to 872): header 56, 24 gap, StatStrip 112, scope line 28, the first section row (rule, 20 padding, 28 header, 240 plot, 24 footnote) ≈ 312 = 532 px, so the headline numbers and both trend charts are fully visible without scrolling, with the next row's titles showing below.

**Laptop 1280–1439.** Same as desktop; content 1000–1160 wide; the StatStrip keeps 4 cells; sections two per row (each ≥ 476 px after padding).

**Laptop 1024–1279 (rail).** Content 920–1175: 4 cells in the StatStrip; sections two per row at 200 px plot height.

**Tablet 768–1023**

```
┌──────────────────────────────────────────────────────┐
│ ☰  Analytics                          ₹2,340   ⌕     │ 52 TopBar
│ 212 calls · last 30 days             [7d|30d|90d] ⋯  │ 48 (range labels "7 days"…)
│ ──────────────────────────────────────────────────── │
│ Calls      │ Answered   │ Avg talk time │ Minutes    │ StatStrip, 4 cells (num-28)
│ 212        │ 78%        │ 1m 40s        │ 276 min    │
│ ──────────────────────────────────────────────────── │
│ Last 30 days · calls, not legs · test calls excluded │
│ ──────────────────────────────────────────────────── │
│ Calls per day                        View as table   │ one section per row, 200 plot
│ ──────────────────────────────────────────────────── │
│ Sentiment by day                                     │
│ ──────────────────────────────────────────────────── │
│ Where callers drop off · Why people call · When      │ (each its own row)
│ calls come in · Calls to your number                 │
└──────────────────────────────────────────────────────┘
```

**Phone 320–767**

```
┌──────────────────────────────┐
│ ☰ Analytics      ₹2,340   ⌕  │ 52
│ 212 calls · last 30 days   ⋯ │ 48 (⋯: Custom range…, Export CSV, Export PDF, Include test calls)
│ [ 7 days | 30 days | 90 days]│ 40 SegmentedControl, full width, sticky under the TopBar
│ Calls         │ Answered     │ StatStrip 2 × 2, hairline rules,
│ 212           │ 78%          │ num-20 values, no scroll strip
│ ▲ +12%        │ ▼ −3 pts     │
│ ──────────────┼───────────── │
│ Avg talk time │ Minutes used │
│ 1m 40s        │ 276 min      │
│ Last 30 days · calls, not legs│ scope line (wraps)
│ ──────────────────────────── │
│ Calls per day                │ 160 plot, 3–4 x labels
│ ──────────────────────────── │
│ Sentiment by day             │ legend wraps above the plot
│ ──────────────────────────── │
│ Where callers drop off       │ labels wrap to 2 lines, value under the label
│ Why people call              │ labels above their bars
│ When calls come in           │ 24 bars, labels every 6 h
│ Calls to your number         │
├──────────────────────────────┤
│ BottomBar · More current     │ Analytics lives in More
└──────────────────────────────┘
```

### 3.5 Components used, with configuration

| Region | Component (spec) | Configuration |
|---|---|---|
| Header | `PageHeader` variant `page`, `navId="analytics"` | Meta: "{calls} calls · {range words} · updated {time}". Actions: the range control (below), then `⋯` (Export CSV · Export PDF report · separator · checkbox item "Include test calls" `?test=1` · Refresh). No primary |
| Range | `SegmentedControl` (data-nav §3.6) "Range": **7 days · 30 days · 90 days**, plus a tertiary `Custom…` opening the `DateRangePicker` (core §7.1) | Writes `?range=`; with a custom range the segment shows no selection and the button reads "1–26 Sep 2026". Every section re-queries; the comparison period is the previous equal-length window. Phone: full-width SegmentedControl; Custom moves into `⋯` |
| Headline | `StatStrip` (**new**, §4.6) with 4 cells | `calls`, `answered`, `avg_talk`, `minutes_used` from §1.1. Each cell is one link (§1.3); Minutes used links to Billing › Usage. No sparkline at rest: the 30-day line appears in the cell's **trend preview** on hover or keyboard focus (§4.6), "Not enough data yet" under 7 points. One scope line under the strip ends with the link "Open these calls in Call reports" (`?when=30d`) |
| Section frame | `ReportSection` (**new layout recipe**, §4.7) in a `ReportGrid` | Replaces ChartFrame's Card on this page (R8): `h2` `title-16`, meta `meta-12` `text-3`, actions right, plot, footnote. No border box, background or radius |
| Calls per day | `ReportSection` + `BarChart` (data-nav §11) | Title "Calls per day", meta "Last 30 days"; bars `--chart-neutral`, the hovered or focused day `--chart-highlight` over a `surface-2` band; periods ≤ 31 as bars, 90 days as weekly bars ("Calls per week", tooltip "Week of 15 Sep"); tooltip "Thu 24 Sep · 31 calls · vs previous Thu +7"; Enter or click on a period drills down (§1.3); footnote "Test calls excluded" |
| Sentiment by day | `ReportSection` + `StackedBarChart` palette `sentiment` | Order positive, neutral, mixed, negative with 2 px gaps; Unscored is not stacked, it is stated in the footnote "6 calls not scored"; legend with totals, legend items are drill-down links (not series toggles, so one element does one thing); weekly at 90 days |
| Where callers drop off | `ReportSection` + `Funnel` (data-nav §11.11) + `FlowSwitcher` (core §5.4) in the section header | Default flow version: the one with most calls in range; options list name + version + calls in range. Rows "3 · Ask about a site visit" (step label links to the Flow Designer at that version, F-QA-019), value "71 · 54% drop" (drop part links to the dropped calls in Call reports), the drop share is "calls that ended at this step without an outcome ÷ calls that reached it" (`dropped_at_step`, §1.1); the largest drop says "largest". Fills `--chart-neutral`, the hovered or focused row `--chart-highlight`. Meta "Site-visit qualifier v7 · 96 calls entered · last 30 days". Steps that are not questions or actions (Start, pure logic) are collapsed into their next visible step. Versions never mix (a v6 call is not counted in v7) |
| Why people call | `ReportSection` + `BarList` (data-nav §11.11) | Top 8 intents, then Other in `--chart-other`; other fills `--chart-neutral`, the hovered or focused row `--chart-highlight`; label wraps on phones; each row links (§1.3); a disclosure "Examples" under a row shows 3 anonymised summary lines, each linking to its call. Meta "Last 30 days · 188 of 212 calls analysed · updated 26 Sep, 4:01 pm". `Recompute` (ghost, admins only, shown only when stale) |
| When calls come in | `ReportSection` + `BarChart` by hour (24 bars, IST) | Replaces the HeatStrip: bar length reads more precisely than five colour steps and needs no Neel ramp. Bars `--chart-neutral`, hovered or focused hour `--chart-highlight`; x labels "12 am · 6 am · 12 pm · 6 pm"; IST in the meta; summary line "Busiest 11 am to 1 pm and 5 to 7 pm · quietest before 8 am"; tooltip "11 am to 12 pm · 23 calls"; each hour links (§1.3) |
| Calls to your number | `ReportSection` + `KeyValueList` `rows` | Reads Phone setup (B9): "Inbound number +91 80 •••• 2210 · Ready" (StatusTag success "Ready"), "Calls received 41", "Unique callers 19", "Missed 3" (links to Call reports `f.direction=inbound`). Other states in §3.6 |

**What is gone and where it went:** §01 Identity → WorkspaceSwitcher and account menu (name, role), Billing › Plans (plan); DID → Settings › Phone setup + the "Calls to your number" section; §06 hour-of-day and recent callers → "When calls come in" (all calls) and the number section (inbound only); §07 Recent → removed (the StatStrip's "Open these calls in Call reports", and every chart period, open the calls); §08 Recordings → each call in Call reports. The first redesign's "Latest calls" card is removed too (D12).
