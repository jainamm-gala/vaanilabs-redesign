---

## 4. Cards and KPI tiles

### 4.1 Card: purpose
One level of containment for a titled region on overview pages (Home, Analytics, Billing › Wallet), for choosable items (template gallery, voice options) and for KPI tiles. **Don't** use cards to lay out a page, to wrap a table on a data page (tables sit flush), to wrap a field, or inside another card (F-VIS-016, direction anti-pattern 7).

### 4.2 Card anatomy and tokens

| Part | Tokens |
|---|---|
| Container | `surface`; 1 px `border`; radius-8; padding `--space-panel-pad` (16); `e0` (no shadow); `min-width: 0` |
| Header | flex, baseline-aligned, gap `space-8`, margin-bottom `space-12`; title `title-14` as `h2`/`h3` (per page outline); meta `meta-12` `text-3` on the right ("Last 7 days"); optional action: ghost small Button or link |
| Body | `body-14` `text-2`, or the content component (chart, key-value list, list) |
| Footer (optional) | top hairline `border`, padding-top `space-12`, one link or ghost Button |
| Check (selectable) | `circle-check` 16 `accent-text`, top-right at `space-12` |

### 4.3 Variants and states

| Variant | Element | Hover | Pressed | Focus | Selected | Disabled |
|---|---|---|---|---|---|---|
| `plain` | `section` | none | none | none | n/a | n/a |
| `interactive` (the whole card is one link or button) | `a` / `button` (or a stretched-link pattern when the card holds text to select) | `surface-2` fill + `border-strong` over `--dur-fast` | `surface-3` | focus ring, offset 2 | n/a | `aria-disabled`, `surface-2`, title `text-dis`, reason in `text-3` (legible) |
| `selectable` (radio or checkbox card) | `role="radio"` / `"checkbox"` in a group | as interactive | as interactive | focus ring | `accent-soft` fill + 1 px `accent-mark` border + check icon; focus and selection both show | as interactive, reason via `aria-describedby` |

Loading: static skeleton blocks (`--skeleton`, radius-2) after `--timing-skeleton-delay`; no shimmer. Error: a Notice inside the body with Retry; the card keeps its title.

**Content:** titles are nouns ("Call volume", "Where callers drop off"); meta states scope; no decorative icons, § numerals or serif kickers (F-VIS-010). **Responsive:** cards reflow in the page grid (`--grid-columns` 12/8/4, gutter `--grid-gutter`); never fixed heights, so text wraps instead of clipping. **Motion:** fill changes `--dur-fast` only; no hover lift.

**Resolves:** F-VIS-016, F-VIS-010, F-VIS-023 (shared loading and error), F-VIS-034.

### 4.4 StatTile (KPI) purpose
A single number with its scope, its change and, when there is enough history, its shape. **Use** on Home, Analytics, Call reports, Leads (pipeline) and Billing › Usage. **Don't** use it for numbers without a defined scope, for numbers computed from a loaded page (F-QA-014, F-QA-015), or to decorate a page with vanity totals.

### 4.5 StatTile anatomy and tokens

```
Calls ⓘ                          label + definition tooltip
184                               value (num-28) [unit]
▲ +12% vs previous 7 days         Delta
╱╲__╱‾                            Sparkline (32 px)
Last 7 days · calls, not legs     scope
```

| Part | Tokens |
|---|---|
| Tile | a `Card` (plain or interactive when it links to the full chart); grid gap `space-4` |
| Label | `label-13` `text-2`; optional `info` 14 `text-3` IconButton opening a Tooltip with the metric definition (F-UX-011) |
| Value | `num-28` with tracking, tabular, `text`; unit or suffix in `body-14` `text-3`; money via `formatMoney` (KPIs 0 decimals, balances 2) |
| Delta | `label-12`, tabular; `arrow-up` / `arrow-down` / `minus` 12; sign always written ("+12%", "−4"); colour by desirability: `success-text` (good), `danger-text` (bad), `text-2` (neutral or flat); comparison words from the range ("vs previous 7 days") |
| Sparkline | height `space-32`, full width, margin-top `space-8`; one polyline in `chart-neutral` at `--icon-stroke`, `vector-effect: non-scaling-stroke`, round joins; no fill, no axes, no dots, `aria-hidden` |
| Not enough data | replaces the sparkline: "Not enough data yet" in `meta-12` `text-3` above a hairline, shown when fewer than 7 points exist |
| Scope | `meta-12` `text-3`: window + counting rule ("Last 7 days · calls, not legs · test calls excluded", "In this filter · 96 leads", "All time") |

**Compact** (`size="compact"`): value `num-20`; no sparkline; used on phones and in dense cards.

### 4.6 StatTile states

| State | Treatment |
|---|---|
| Ready | as above |
| Loading | label real; value skeleton `space-28` tall, half width; delta skeleton; scope reads "Updated when loaded"; `aria-busy="true"` |
| Error | value "–" in `text-3`; delta slot "Couldn't load" with `alert-triangle` in `danger-text`; ghost Retry; scope kept |
| Empty (no events in range) | value `0` is allowed only when the server says 0; the delta reads "No calls in the previous 7 days" instead of "+∞%" |
| Filtered | scope switches to "In this filter" or "In this view" (F-QA-014) |
| Interactive hover / focus | Card interactive states; `aria-label` includes the value and delta in words |

### 4.7 Delta desirability (`deltaTone`)

| Metric | Up is | Metric | Up is |
|---|---|---|---|
| Calls, connected calls, interested leads, conversion rate | good | Negative sentiment, failed calls, drop-off at a step | bad |
| Positive sentiment, answered rate | good | Wallet runway | good (a fall is bad) |
| Average duration, minutes used, spend | neutral (`text-2`) | Anything with abs(change) below 1 % or 1 unit | flat: "No change" with `minus` |

`deltaTone(metricId, delta)` lives in `lib/metrics.ts` next to the metric definitions, so Analytics, Call reports and Billing agree (F-VIS-011, F-UX-011).

### 4.8 StatGrid responsive

| Width | Layout |
|---|---|
| ≥1024 | `grid-template-columns: repeat(auto-fit, minmax(calc(var(--space-40) * 5), 1fr))`, gap `space-12`: 4 across at 1280+ |
| 768–1023 | 2 across |
| 320–767 | one horizontally scrolling row of compact tiles, each `min-width: calc(var(--space-40) * 4)`, `scroll-snap-type: x mandatory`, edge fade; sparklines hidden; the page scroller keeps the strip inside the page (F-RWD-004, F-RWD-011) |

**ARIA:** each tile is a `section` or `a` named by its label; the Sparkline is `aria-hidden` because the value, delta and scope carry the meaning; the definition tooltip is `aria-describedby` on the label. **Motion:** none (numbers do not count up). **Content:** labels are the metric's name from `lib/metrics.ts`; never "TOTAL CALLS" caps; never a number without a window.

**Do:** serve every KPI from one server aggregate endpoint with shared definitions. **Don't:** mix a server total with averages of 50 loaded rows (F-QA-014); colour a delta by its sign (F-VIS-011).

**Resolves:** F-QA-014, F-QA-015, F-VIS-011, F-UX-011, F-UX-030, F-UX-036, F-RWD-004, F-RWD-011.

```tsx
<StatTile label="Calls" definition="Conversations placed or received. Two browser legs count once."
  value={184} format="count" delta={{ value: 0.12, kind: 'percent', metric: 'calls', comparison: 'vs previous 7 days' }}
  series={daily} minPoints={7} scope="Last 7 days · calls, not legs · test calls excluded"
  state="ready" href="/analytics?range=7d#calls" size="default" />
```

---

## 5. Tags, status tags, live dot, count badge, language marks

### 5.1 Tag: purpose
A small, non-interactive label for a state or a qualifier. **Use** one per table cell at most, and at most two per list row (status plus one qualifier). **Don't** use tags as filters (FilterToken), as buttons (except the lifecycle chip below), as decoration, or stacked three per row (anti-pattern 6). 20 badge styles collapse into this one (F-VIS-017).

### 5.2 Tag anatomy, sizes and tones

| Part | Tokens |
|---|---|
| Container | `inline-flex`, height `--tag-h` (20; 24 on touch); padding-inline `space-6`; gap `space-inline-xs`; radius-4 (never pill); 1 px transparent border; `white-space: nowrap`; never truncates (`min-width: max-content`) |
| Icon | 12 (`--icon-xs`), `currentColor`, `aria-hidden` |
| Text | `label-12`, sentence case, tabular numbers |
| Size `lg` | height `--size-chip` (24), padding-inline `space-8`; for page headers and the interactive lifecycle chip |

| Tone | Background | Text | Use |
|---|---|---|---|
| `neutral` | `surface-3` | `text-2` | categories and non-problem states (New, Contacted, Neutral, Ended) |
| `info` | `info-soft` (= `surface-2`) + 1 px `info-border` (= `border-strong`) | `info-text` (= `text-2`); icon `info` or the progress icon | system facts and progress (Scheduled, Publishing…, Indexing… 60%, Streaming). Graphite, never Neel: an info tag must not look like a selection (foundations §3.4) |
| `success` | `success-soft` | `success-text` | live, done, positive |
| `warning` | `warning-soft` | `warning-text` | pending, due, low, a warning |
| `danger` | `danger-soft` | `danger-text` | failed, error, destructive, negative |
| `outline` | transparent, 1 px `border-strong` | `text-2` | qualifiers (Test call, 2 legs, Workspace default, Not published, Unscored) |

Every status text pair is ≥ 5.47:1 on its tint in both themes (foundations §3.4), replacing the 2.3–3.6:1 chips of F-A11Y-019.

### 5.3 StatusTag and the domain maps (`lib/status.ts`)
One module maps each domain value to word, icon and tone, and **every status on every page and every mock renders through `<StatusTag domain value />`**, so "Callback due" looks the same in Leads, the shell, the Cockpit, Call reports and the accessibility examples (F-VIS-017). Every StatusTag carries a word and an icon (P2, F-A11Y-019).

**Enforcement**
1. `StatusTag` takes `domain` and `value` only: it has no `tone`, `icon` or `label` prop. `Tag` (§5.2) is for qualifiers, never for a status word; a lint rule rejects a `Tag` whose text is a status word from `lib/status.ts`.
2. The map is exhaustive (`satisfies Record<Domain, Record<Value, StatusDef>>`), so a new state fails the build until it has its word, icon and tone.
3. A record state is never Neel. Neel is for the primary action, focus, selection and links (P2); the only Neel-tinted tone is `info`, and it is reserved for system progress (Scheduled, Working, Publishing…, Indexing…, Writing notes…), never for a lead status or a call outcome. The tones are the six of §5.2.
4. **One icon per meaning in a column.** Two values that can share a column never share an icon (Waiting for you `pause`, Paused `circle-pause`; Pending `clock`, Expired `timer-off`).
5. **Callback due is always amber with `clock`**, and a call outcome that writes a lead status borrows that status's icon and tone (below), so "Callback" is never blue, never a triangle and never icon-less.

| Domain | Value → word · icon · tone |
|---|---|
| Lead status | New · `circle-dot` · neutral; Contacted · `phone` · neutral; Callback due · `clock` · warning; Interested · `thumbs-up` · success; Not interested · `circle-slash` · neutral; Not reached · `phone-missed` · neutral; Converted · `circle-check` · success; Do not call · `ban` · danger |
| Call result | Completed · `check` · success; No answer · `phone-missed` · neutral; Busy · `phone-off` · neutral; Voicemail · `voicemail` · neutral; Failed · `circle-x` · danger; Timed out (a call stuck in queued or in progress past the reaper window) · `clock` · warning (F-QA-037) |
| Call outcome (written by the flow's Outcome step) | The outcome's own label with the **icon and tone of the lead status it writes** (direction §6.5): "Interested" · `thumbs-up` · success; "Callback" · `clock` · warning; "Not interested" · `circle-slash` · neutral; "Visit booked" · `circle-check` · success (writes Converted). An outcome that writes no status: its label · `check` · neutral |
| Sentiment | Positive · `smile` · success; Neutral · `meh` · neutral; Mixed · `contrast` · neutral; Negative · `frown` · danger; Unscored · `circle-dashed` · outline (F-UX-046) |
| Flow lifecycle | Live v7 · static LiveDot · success; Draft · 3 changes · `chevron-down` · neutral `lg` button (opens the version menu); Not published · outline; Publishing… · info; Couldn't save · `alert-triangle` · danger |
| Validation | No issues · `check` · success; 1 warning · `alert-triangle` · warning; 2 errors · `circle-x` · danger (computed, never permanent; F-UX-004) |
| Knowledge indexing | Indexed · `check` · success; Queued · `clock` · neutral; Uploading… · info; Reading… · info; Indexing… 60% · info; Couldn't upload · `circle-x` · danger; Couldn't index · `circle-x` · danger |
| Autopay | On · `check` · success; Off · outline; Waiting for approval · `clock` · info; Paused · `circle-pause` · warning; Needs mandate renewal · `alert-triangle` · warning |
| Payment · Invoice · Proposal (KB §3) | Payment: Completed · `check` · success; Pending · `clock` · info; Failed · `circle-x` · danger; Refunded · `undo-2` · neutral; Expired · `timer-off` · neutral. Invoice: Paid · `check` · success; Refunded · `undo-2` · neutral; Credit note · `file-minus` · outline. Proposal: Pending · `clock` · info; Added · `check` · success; Dismissed · `x` · neutral |
| Meeting room (MP §4) | Live · pulsing LiveDot · success; Open · `door-open` · neutral; Open 3 h (open too long) · `alert-triangle` · warning; Scheduled · `calendar-clock` · info; Ending… · info; Ended · neutral; Stale · `alert-triangle` · warning (F-UX-038) |
| Meeting notes (MP §4) | Summary ready · `check` · success; Writing notes… · info; Notes off · outline; Couldn't write notes · `circle-x` · danger |
| Assistant plan and step (AS §9.2) | **Waiting for you · `pause` · warning**; Running · Spinner · info; Done · `check` · success; Blocked · `lock` · warning; Failed · `circle-x` · danger; Skipped · `minus` · neutral; Expired · `timer-off` · neutral |
| Personal-agent task (MP §2.8) | Queued · `clock` · neutral; Working · `play` · info; **Waiting for you · `pause` · warning** (the same word, icon and tone as the Assistant); Scheduled · `calendar-clock` · info; Paused · `circle-pause` · neutral; Stopped at limit · `octagon-pause` · warning; Blocked · `lock` · warning; Done · `check` · success; Failed · `circle-x` · danger; Cancelled · `circle-slash` · neutral |

Call state (Idle, Dialling…, Ringing…, Live, On hold, Wrap-up, Ended and the rest) uses `CallStateTag` in §12.1 with the `--call-*` tokens. Gate check marks are not tags: they are the `GateCheckRow` marks of `spec/02-components-gate.md` §2.1.

### 5.4 LiveDot
8 px (`--size-live-dot`) circle in `--live` (≥3.58:1 on every plane), `data-mark`. **Static by default.** `pulsing` adds a `::after` ring that scales from 1 to 2.6 and fades from 0.55 to 0 over `--dur-pulse`, `animation-iteration-count: var(--live-pulse-cycles)` (3), `--ease-standard`, then holds solid. Only the **focal call's CallHeader** (and a meeting room's header) sets `pulsing`, and it restarts the 3 cycles each time the call *enters* Live (including a return from On hold, Reconnecting or a hand-back); every other live dot (table cells, nav badge, TopBar chip, Baseline, cards, a live *flow*) is static (07-motion MD3, 06-accessibility §14.2). Under reduced motion or the in-app Motion preference the dot never pulses (tokens zero `--live-pulse-cycles` and `--dur-pulse`; base.css caps iterations) and the word "Live" carries the state. Always next to a word.

### 5.5 CountBadge
Plain tabular numbers in `meta-12` `text-3` (`text-2` in a selected tab), formatted by `formatCount`. No filled bubbles, no red. Use inside tabs, nav items and group headers. While loading: a 16 px skeleton. Accessible name: part of the parent's name ("Callbacks due, 18").

### 5.6 LanguageMark
A language **name**, and, only where a glyph helps, a native-script glyph tile in front of it, so a Tamil reader is never asked to recognise a Telugu glyph (direction §4.5). The tile is a **filled tile with no stroke**: a bordered 18 to 20 px square is the `Kbd` keycap (core §7.3), and a keycap-looking token on every row is the HUD dialect that direction §1.3 removes.

| Part | Tokens |
|---|---|
| Glyph tile | min-width and height `--size-lang-mark` (18); padding-inline `space-2`; fill `surface-3`; **no stroke**: a 1 px `transparent` border that only forced colours draws (`CanvasText`); radius-4; glyph `label-12` `text`, `line-height: 1`, with `lang` set on the glyph. On a `surface-2` row (caller turns) the tile stays `surface-3` |
| Name | `data-13` `text-2` in tables and lists; `meta-12` `text-2` inside voice options and turn headers |

| Variant | Renders | Use | Never |
|---|---|---|---|
| `name` (default) | The name only, plain text in the surrounding role (`text-2`) | Table columns (Leads, Call reports, Flows, Knowledge proposals), phone ListRows, KeyValue values, filter tokens, the Call gate scope, record sheets | A glyph in a table cell or a list row: in dense lists it only repeats the name |
| `full` | Tile + name ("अ Hindi") | Pickers where a language or voice is chosen: VoiceOption and VoicePicker (§12.3), language `Select` and `MultiSelect` options; and the language legend in a CallHeader or TranscriptFeed header ("अ Hindi · A English"), which teaches the glyphs the turn rows use | Tables, lists, KeyValue values |
| `compact` | Tile only, `role="img"` + `aria-label="Hindi"` | The TurnRow speaker line (§12.4), only when per-turn language exists | Anywhere else |

Glyphs: Hindi अ · English A · Hinglish अA (`hi-Latn`) · Marathi म · Tamil த · Telugu తె · Bengali ব · Gujarati ગ · Kannada ಕ · Malayalam മ · Punjabi ਪ · Odia ଓ. Mixed calls with no per-turn language show one mark per language in the call header ("अ Hindi · A English"), never fake per-turn marks (P1). A table cell with two languages reads "Hindi, English" (or "Hindi +1" with both in the tooltip when the column is narrow).

### 5.7 Do / Don't

| Do | Don't |
|---|---|
| One StatusTag per cell, from the domain map: word + icon | Three uppercase pills per row (BROWSER, COMPLETED, NEUTRAL) (F-VIS-027) |
| "Callback due" amber with `clock` on every page; the "Callback" outcome borrows it | A Neel "Callback" on one page and an amber triangle on another (F-VIS-017) |
| "Live v7" computed from the published revision | A permanent green "FLOW VALIDATED" (F-UX-004) |
| "Hindi" as plain text in a table column; "अ Hindi" in a voice picker; the tile alone in a turn row | HI/EN mono boxes, a bordered glyph that reads as a keycap, or a bare glyph in a list (direction §1.3) |

**Resolves:** F-VIS-017, F-VIS-027, F-A11Y-019, F-VIS-011 (sentiment neutral is grey), F-UX-004, F-UX-005 (one "what is live" tag), F-UX-038, F-UX-046, F-QA-037.

```tsx
<Tag tone="outline">Test call</Tag>
<StatusTag domain="lead" value="callback_due" size="default" />   // no tone, icon or label props
<StatusTag domain="call-outcome" value="callback" />               // borrows Callback due: clock, warning
<StatusTag domain="flow" value="live" version={7} />
<LiveDot pulsing={call.state === 'live'} />
<LanguageMark code="hi" />                   // variant: 'name' (default) | 'full' | 'compact'
<LanguageMark code="hi" variant="full" />    // voice pickers, language options, call-header legend
```
