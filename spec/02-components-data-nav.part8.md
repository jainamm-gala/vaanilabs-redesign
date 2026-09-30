---

## 11. Chart styling rules

### 11.1 Purpose and chart choice
Charts answer one question each, with the range and the counting rule stated. The chart palette is separate from chrome (foundations §3.6). No chart library is installed today (hand-built SVGs distort at every width, F-VIS-012).

| Question | Form | Component |
|---|---|---|
| How many per day or week? | vertical bars (discrete periods); a line only above 31 points | `BarChart`, `LineChart` |
| How is it split over time? (sentiment) | stacked bars in a fixed order | `StackedBarChart` |
| Which are the biggest? (intents, flows, reasons) | a ranked bar list with readable labels | `BarList` |
| Where do callers drop off? | step rows with reached count and drop %, each linking to its step | `Funnel` |
| When are calls busiest? | a 24-cell sequential strip (IST) | `HeatStrip` |
| What is the shape behind a KPI? | a sparkline in a StatTile | `Sparkline` (§4.5) |

**Never:** pies or donuts, gauges, 3D, dual axes, radar, stacked areas with gradients, animated counters.

### 11.2 ChartFrame anatomy
A `Card` (§4) holding: header (title `title-14` as a question-shaped noun, meta `meta-12` `text-3` with range and counting rule, and a ghost small "View as table" toggle), the legend row (when there are 2+ series), the plot, and an optional footnote (`meta-12` `text-3`, e.g. "Test calls excluded").

### 11.3 Plot sizing
- The SVG is drawn at 1:1 with its container: a ResizeObserver reads the width and the SVG `width`/`height` equal it. No `viewBox` stretching and no `preserveAspectRatio="none"`, so text is never squashed (F-VIS-012).
- Heights: `calc(var(--space-40) * 6)` (240) for the main chart on Analytics at ≥1280; `calc(var(--space-40) * 5)` (200) default; `calc(var(--space-40) * 4)` (160) below 768 (the `--size-chart-lg`, `-md` and `-sm` tokens, §0.5).
- Inner margins: top `space-8`, right `space-4`, bottom `space-24` (x labels), left `space-32` grown to the widest measured y label plus `space-8`.

### 11.4 Axes, ticks and gridlines

| Element | Rule |
|---|---|
| Y axis | no axis line; 4–6 "nice" ticks (`d3.scaleLinear().nice()`, `ticks(4)`); labels `meta-12` in `--chart-label`, tabular, right-aligned `space-8` left of the plot; bars and counts start at 0 |
| X axis | the only axis line: 1 px `--chart-axis` on the baseline; labels `meta-12` `--chart-label`, centred under each band; dates "21 Sep"; labels are thinned (keep at least 56 px per label: 7 for a week on desktop, 3–4 on phones), never rotated, never cut mid-word |
| Gridlines | horizontal only, 1 px `--chart-grid`, solid (dashes mean one thing: the canvas fallback path), `shape-rendering: crispEdges`; no vertical gridlines, no plot background other than `surface` |
| Units | in the title or meta ("Calls per day"), not as a rotated axis title |

### 11.5 Marks and colour

| Mark | Rule |
|---|---|
| Bars | width `min(56% of the band, var(--space-48))`; radius-2 on the data end only; single-series and nominal bars all in `--chart-neutral` (no rainbow categories); the hovered, focused or selected period switches to `--chart-highlight` (foundations §3.6) |
| Stacked bars | fixed order from the baseline: positive, neutral, mixed, negative (`--sentiment-*`), separated by a `--bw-strong` gap so green never touches red; radius-2 on the top segment's top edge |
| Lines | 2 px (`--bw-strong`), round joins; points hidden except the hovered or focused one and the last point; at most 4 identity series plus Other, direct end labels when there are 4 or fewer |
| Categorical colour | `--chart-1` Ink, `--chart-2` Teal, `--chart-3` Ochre, `--chart-4` Rose in fixed order, never cycled; everything past four is `--chart-other` ("Other", always labelled). No Neel series: Neel is only `--chart-highlight` (foundations §3.6) |
| Sequential colour | `--seq-1`…`--seq-5` (one teal hue), labels on cells in `--seq-n-fg`; zero or missing uses `--seq-empty` with a "No calls" legend entry, never the lightest step |
| Sentiment colour | only for sentiment data; neutral is grey, not mustard (F-VIS-011) |
| Never | state colours (success, warning, danger) as series; area fills or gradients; decoration |
| Hover | bars: a `surface-2` band behind the hovered period; lines: a 1 px `--chart-axis` crosshair |

Values and labels always use text tokens, never the series colour. Chart marks carry no Neel except the one highlighted datum, which counts as the screen's selection.

### 11.6 Legend
Required with 2 or more series; above the plot, left-aligned; items `meta-12` `text-2`: an 8 px (`space-8`) swatch, radius-2, `data-mark` (forced colours), the series name, then its total in `--fw-medium` `text`, tabular. Order matches the stack order. Legend items may toggle series (`button`, `aria-pressed`), never as the only way to read a value.

### 11.7 Tooltip (`ChartTooltip`)
Floating UI, anchored to the hovered or focused band or point, offset `space-8`, flips and shifts at the plot edges (never covers the pointer, F-VIS-012); `surface-raised`, 1 px `border-overlay`, radius-6, `e2`, padding `space-8 space-10`, min-width `calc(var(--space-40) * 4)`, max `--size-tooltip-max`, `z-tooltip`, `pointer-events: none`. Header `label-12` `text` ("Thu 24 Sep"); rows: swatch, series name (`meta-12` `text-2`), value right-aligned (`--fw-medium` `text`, tabular); an optional comparison row ("vs previous Thu · +7"). It appears without delay on hover and on keyboard focus, fades over `--dur-fast`; on touch, a tap shows it and a tap elsewhere hides it.

### 11.8 Keyboard and accessibility
- A static chart is `role="img"` with an `aria-label` that states the finding ("Calls per day, last 7 days: from 9 on 27 Sep to 31 on 24 Sep").
- An interactive plot is one tab stop (`tabindex="0"`, `aria-roledescription="chart"`, labelled by the title): ←/→ move between periods, Home/End jump, Esc hides the tooltip; a visually hidden polite region reads the focused period ("Thursday 24 September: 31 calls, 7 more than the previous Thursday"). The focus ring sits on the plot.
- **View as table** renders the same data as a framed, compact DataTable (dates, series columns, totals), so no value depends on colour or hover.
- All text ≥12 px at every width; every mark ≥3:1 on `surface` (validated palette); swatches carry `data-mark`.

### 11.9 States

| State | Treatment |
|---|---|
| Loading | frame, title, meta and gridlines render; no marks; the legend shows skeleton bars; after `--timing-skeleton-delay`; `aria-busy` |
| Empty | inside the plot area, above the baseline: a 24 px icon in `text-3`, one `body-14` sentence and at most one action ("No calls to your number yet. Your number is still being verified." · Open Phone setup). Never 24 empty cells or a flat line pretending to be data (F-VIS-010, F-UX-011) |
| Not enough data | "Not enough data yet. Trends appear after 7 days of calls." |
| Partial | missing periods are gaps (no interpolation); the tooltip says "No data" |
| Stale | meta reads "Showing data from 21 Sep" with "Recompute" when the data is older than its refresh interval (F-UX-036) |
| Error | a Notice inside the plot with Retry; the frame keeps its height |

### 11.10 Responsive

| Width | Rules |
|---|---|
| ≥1280 | main chart 240; grids of 2–3 charts per row on Analytics |
| 768–1279 | 200; one or two per row |
| 320–767 | 160; one per row; ticks thinned; legend wraps above the plot; BarList labels move above their bars; HeatStrip becomes two rows of 12 (am, pm) below 480 px of container |

### 11.11 Specific components

| Component | Tokens and rules |
|---|---|
| `BarList` | rows `minmax(0,14ch) minmax(0,1fr) auto`, gap `space-12`, row gap `space-8`; label `data-13` `text` with ellipsis and full text in a tooltip (F-VIS-013); track `space-8` tall in `surface-2`, fill `--chart-neutral` (Other in `--chart-other`; the hovered or focused row in `--chart-highlight`), radius-2 on the end; value "38 · 31%" outside the bar in `meta-12` `text-2`; top 8 then Other |
| `Funnel` | one row per step: label "3 · Ask about a site visit" as a link to that step in the flow (F-QA-019); value "88 · 15% drop" in `meta-12` `text-2`; a `space-8` track in `surface-3` with a `--chart-neutral` fill proportional to reached ÷ entered (`--chart-highlight` while its row is hovered or focused); the largest drop says "largest" in words; scoped to the page range, with the flow version in the meta |
| `HeatStrip` | 24 cells, gap `space-2`, height `space-20`, radius-2, `--seq-*`; axis labels "12 am · 6 am · 12 pm · 6 pm · 11 pm"; IST in the meta; legend "No calls · Fewer · More" |
| `Sparkline` | §4.5 |

### 11.12 Motion
No entrance animation (bars do not grow, numbers do not count up). A data change may crossfade the plot's `opacity` over `--dur-fast`; the tooltip fades over `--dur-fast`. Nothing loops.

### 11.13 Content
The title names the question or quantity ("Where callers drop off", "Calls per day"); the meta states the range and the counting rule ("Last 7 days · calls, not legs"); test calls are excluded by default with a footnote; numbers use en-IN grouping; step names carry their step number; no § markers, italic taglines or HUD brackets (F-VIS-010).

| Do | Don't |
|---|---|
| Draw at the container's pixel size with 12 px labels | A stretched 800×220 viewBox with 4.8 px labels (F-VIS-012) |
| Colour deltas and series by meaning; grey neutral | Green "negative +13pp" and mustard neutral (F-VIS-011) |
| A funnel whose fills render and whose steps link to the flow | Transparent bars and six steps named "Condition check" (F-QA-019) |
| One range in the header that every chart states | A range toggle inside one card that changes some sections (F-UX-036) |

**Resolves:** F-VIS-010, F-VIS-011, F-VIS-012, F-VIS-013, F-QA-019, F-UX-011, F-UX-036, F-A11Y-019 (marks and labels on tokens).

### 11.14 React

```tsx
<ChartFrame title="Calls per day" meta="Last 7 days · calls, not legs" status={status} onRetry={refetch}
  table={{ columns: ['Day', 'Calls'], rows }} empty={{ icon: Phone, text: 'No calls in the last 7 days.' }}>
  <BarChart data={daily} x="day" y="calls" format={formatCount}
    tooltip={(d) => [{ label: 'Calls', value: d.calls }, { label: 'vs previous', value: signed(d.delta) }]} />
</ChartFrame>
<StackedBarChart data={daily} keys={['positive', 'neutral', 'mixed', 'negative']} palette="sentiment" />
<BarList items={intents} max={8} valueFormat={(v, share) => `${v} · ${pct(share)}`} />
<Funnel steps={steps} getHref={(s) => `/flows/${flowId}?step=${s.id}`} />
<HeatStrip values={byHour} timezone="Asia/Kolkata" />
```

- Scales and paths from `d3-scale` and `d3-shape`; rendering is our own SVG and HTML, so every colour is a CSS class reading a token (`.bar { fill: var(--chart-neutral) }`), and dark mode needs no JS.
- `useElementSize` (ResizeObserver, rAF-throttled) feeds width; text measured once per font load for the left margin.
- Floating UI for the tooltip; the visually hidden live region comes from the shell announcer.
- If the team prefers a library (visx or Recharts), wrap it in `ChartFrame`, disable its animations, and pass token classes instead of colour props.
