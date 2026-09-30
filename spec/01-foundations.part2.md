## 3. Colour

Graphite chrome, one Neel accent, and green, amber and red only for real state (P2). Teal, ochre and rose exist only inside charts.

### 3.1 Graphite: the neutral ramp (0–1000)

Cool graphite continuing today's `#111725` ink (the neutral ramp the audit says to keep). The steps are uneven on purpose: each exists because a contrast threshold or a role needs it.

| Step | Hex | Light-theme job | Dark-theme job |
|---|---|---|---|
| 0 | `#FFFFFF` | surface, raised, overlay; text on ink | label on accent fills |
| 25 | `#F6F7F9` | bg, canvas | |
| 50 | `#F1F3F6` | surface-2 (inset, hover) | |
| 100 | `#E8EBF0` | surface-3 | text; inverse surface (toasts) |
| 150 | `#E3E6EC` | border (hairline) | |
| 200 | `#C9CED8` | border-strong, border-overlay; Baseline text (11.36:1 on ink) | |
| 250 | `#B3BAC6` | | text-2; Baseline text |
| 300 | `#A3AAB7` | disabled text | |
| 350 | `#8C94A2` | | text-3 (≥ 4.91:1 on every dark plane) |
| 400 | `#7E8695` | control borders (≥ 3.06:1 on every light plane); edges (both themes) | edges |
| 500 | `#6A7281` | | control borders (≥ 3.01:1 on every dark plane) |
| 550 | `#5F6878` | text-3 (≥ 4.70:1 on every light plane) | disabled text |
| 600 | `#434B5B` | text-2 | secondary text on the inverse toast |
| 650 | `#3A4250` | | border-overlay; Baseline top hairline |
| 700 | `#333A45` | Baseline separators | border-strong; Baseline separators |
| 750 | `#262B33` | | border |
| 800 | `#222730` | | surface-3; Baseline band |
| 850 | `#1A1E24` | | surface-2 |
| 900 | `#14171C` | | surface, raised, overlay |
| 950 | `#101318` | | canvas |
| 1000 | `#0D0F13` | | bg |
| `ink` | `#121722` | text, Baseline band, ink tile, inverse surface | text on light fills |

`ink` is a separate primitive: it sits at graphite-900's lightness with more blue, so it reads as ink rather than grey, and it never becomes a dark-theme surface.

### 3.2 Neel: the only accent (50–950)

One hue in both themes, **keyed to indigo dye** (OKLCH ≈ 260°, HSL ≈ 218°, about a third less chroma than a screen blue). It never turns violet or periwinkle (F-VIS-004). **Re-keyed on 2026-09-27** (direction §1.3, §5): the first ramp sat at HSL ≈ 230°, about 5° from Linear's indigo, and its dark text read periwinkle. Every step below moved to the new hue; every pair was re-proven by `check-contrast.mjs` (460 of 460 pass).

| Step | Hex | Job |
|---|---|---|
| 50 | `#EDF3FC` | Light accent-soft (the selection fill only; info is graphite since 1.1.0) |
| 75 | `#E5EDFA` | Light hover on a selected row |
| 100 | `#DAE6F8` | Light text selection |
| 200 | `#BFD3F3` | Reserve |
| 300 | `#A7C3F1` | Dark accent-soft text, dark link hover |
| 400 | `#8DB2EE` | Dark accent text, focus and marks (8.33:1 on the dark surface); focus inside the Baseline |
| 550 | `#356AC4` | Dark accent hover (white label 5.24:1, above the direction's 5:1 trap) |
| 600 | `#2F62C0` | Dark accent fill (white label 5.79:1) |
| 700 | `#1F4A94` | Light accent fill, text, focus and marks (white label 8.52:1); dark accent press |
| 800 | `#183C7A` | Light hover; light accent-soft text; Baseline separators |
| 900 | `#143368` | Light press; dark text selection |
| 925 | `#1C2739` | Dark hover on a selected row (1.1.0: lower chroma) |
| 950 | `#192231` | Dark accent-soft (1.1.0: OKLCH C 0.032, a tint rather than a navy slab) |
| ink | `#0F203D` | **Neel-ink**: the Baseline band in both themes and the mark tile (`--bl-bg`, `--mark-bg`). Indigo dye at its darkest; reads as navy, not black. White 16.22:1, Baseline text 10.28 / 8.31:1 |

**The accent budget:** on any screen, count the filled Neel elements: at most one primary button per region, plus the selection. If a screen looks blue, something is misusing it. **Neel has exactly seven jobs:** the primary fill, focus, selection (`--accent-soft` + `--accent-mark`), links, the active nav icon, the active or selected edge (`--edge-active`), and the highlighted chart datum (`--chart-highlight`). It is never info, never a chart series or heat ramp, never the talk strip, never a `{{variable}}` chip, never a compare tint, and never decoration, KPI numerals or durations (F-VIS-011).

**Why `--accent-mark` exists:** the dark fill `#2F62C0` is only 3.1:1 against the dark surface. That is fine behind a white label (the label carries the meaning), but not for a graphic that *is* the meaning. So every non-text Neel indicator uses `--accent-mark` (`#1F4A94` light / `#8DB2EE` dark, ≥ 6.9:1): selection borders and bars, the active tab underline, progress fills, the minimap viewport, the current setup step and the selected edge.

### 3.3 State and chart ramps

| Ramp | 50 | 300 | 400 | 500 | 550 | 600 | 700 | 950 |
|---|---|---|---|---|---|---|---|---|
| **green** (success, live) | `#E7F5EC` soft | `#6FD39A` dark text | `#4CC47F` dark solid, live | `#34A165` sentiment + | `#13923F` light live | `#15803D` light solid | `#11703F` light text | `#16271E` dark soft |
| **amber** (warning, pending) | `#FDF3E1` soft | `#F5B544` dark solid and text, Baseline warn | `#E29A21` | `#C8740F` | | `#B45309` light solid | `#8A4B00` light text | `#2C2312` dark soft |
| **red** (danger, failed) | `#FDECEA` soft | `#F28B82` dark solid and text | `#E5584D` | `#D63A2F` | 650: `#B03F37` dark sentiment − | `#C0271C` light solid | `#B42318` light text, sentiment − | `#2E1A1A` dark soft |

Steps 100, 200, 800 and 900 of each state ramp are listed in `tokens.json` for charts and future needs. **Chart-only hues:** teal `#008A7A` / `#23A090`, ochre `#B7791F` / `#BC8A2E`, rose `#C23F6E` / `#DD6593` (light / dark). No purple, plum or violet anywhere (anti-pattern 3).

### 3.4 Semantic colour tokens (light / dark)

Ratios are WCAG contrast from `contrast-report.md`.

**Planes and lines**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F6F7F9` | `#0D0F13` | Page background, the sidebar, around cards |
| `--surface` | `#FFFFFF` | `#14171C` | The working plane: tables, panels, forms, inputs |
| `--surface-2` (`--bg-subtle`) | `#F1F3F6` | `#1A1E24` | Hover rows, caller turns, fallback answer rows, gate footers, code |
| `--surface-3` (`--bg-muted`) | `#E8EBF0` | `#222730` | Pressed states, tracks, the tinted Action glyph tile, skeletons |
| `--surface-raised` | `#FFFFFF` | `#14171C` | Popovers, menus, nodes, the bulk bar (lifted by `--e1` / `--e2`) |
| `--surface-overlay` | `#FFFFFF` | `#14171C` | Dialogs, sheets, gates (lifted by `--e3` + `--border-overlay`) |
| `--surface-inverse` | `#121722` | `#E8EBF0` | Toasts, tooltips |
| `--border` | `#E3E6EC` | `#262B33` | Hairlines (decorative) |
| `--border-strong` | `#C9CED8` | `#333A45` | Node edges, secondary buttons, table frames, filter tokens |
| `--border-overlay` | `#C9CED8` | `#3A4250` | Edges of popovers, dialogs, sheets and gates |
| `--control` | `#7E8695` | `#6A7281` | Inputs, checkboxes, radios, the off switch track, sockets: ≥ 3.06 / 3.01:1 on every plane |

Raised and overlay planes keep the surface fill in both themes, so hovers, insets, turn rows and tags look the same on a page, in a popover and in a 560 px call-detail sheet. The lift comes from the shadow and the border (§8).

**Text**

| Token | Light | Dark | On surface (L / D) | Use |
|---|---|---|---|---|
| `--text` | `#121722` | `#E8EBF0` | 17.93 / 15.03 | Primary text and icons |
| `--text-2` (`--text-subtle`) | `#434B5B` | `#B3BAC6` | 8.76 / 9.20 | Idle nav, secondary body, non-key table cells |
| `--text-3` (`--text-muted`) | `#5F6878` | `#8C94A2` | 5.62 / 5.88 | Meta, helper text, **placeholders**, table headers, timecodes. ≥ 4.70:1 even on `surface-3` |
| `--text-dis` | `#A3AAB7` | `#5F6878` | exempt | Disabled text only, always with a reason nearby |
| `--text-inverse` / `--text-inverse-2` | `#FFFFFF` / `#C9CED8` | `#121722` / `#434B5B` | on inverse: 17.93 / 15.00 | Toast and tooltip text |

**Accent and focus**

| Token | Light | Dark | Proof (L / D) | Use |
|---|---|---|---|---|
| `--accent` | `#1F4A94` | `#2F62C0` | white 8.52 / 5.79 | Primary button fill, checked controls |
| `--accent-hover` / `--accent-press` | `#183C7A` / `#143368` | `#356AC4` / `#1F4A94` | white ≥ 5.24 | |
| `--on-accent` | `#FFFFFF` | `#FFFFFF` | | Label on accent |
| `--accent-text` (`--accent-fg`, `--link`) | `#1F4A94` | `#8DB2EE` | 8.52 / 8.33 | Links, the active nav icon |
| `--accent-soft` (`--accent-subtle`) | `#EDF3FC` | `#192231` | control on it 3.28 / 3.30 | **Selection only:** selected rows, chips and segments, the active phase segment, a selected step's header. Never an info notice (§3.4 Status), never a persistent panel-sized fill (see below) |
| `--accent-soft-hover` | `#E5EDFA` | `#1C2739` | text-3 on it 4.77 / 4.91 | Hover on a selected row |
| `--accent-soft-text` | `#183C7A` | `#A7C3F1` | 9.58 / 8.92 | Text on accent-soft (a selected chip, the active segment, a search match). `{{variable}}` chips use `--variable-*` (§3.9) |
| `--accent-mark` | `#1F4A94` | `#8DB2EE` | 8.52 / 8.33 | Non-text indicators (§3.2): selection bars, the nav thread segment, the active tab underline |
| `--focus` (`--focus-ring`) | `#1F4A94` | `#8DB2EE` | ≥ 7.13 / 6.95 on every plane | The focus outline |
| `--focus-inverse` | `#8DB2EE` | `#1F4A94` | | Focus on toasts and tooltips |
| `--bl-focus` | `#8DB2EE` | `#8DB2EE` | 7.52:1 on Neel-ink | Focus inside the Baseline |

**Where the selection tint may appear.** `--accent-soft` marks *a selected thing*: a row, a chip, a segment, a step header, a calendar day. At rest it never fills a panel, a card body, a sheet or a page region: a panel-sized area in dark `#192231` reads as a navy slab, and in both themes it would make the screen look blue. A "current" region (Home's current setup step, a playing turn) that is larger than a row uses `--surface-2` plus the 2 px `--accent-mark` inline-start bar. The one exception is transient: a drop-target overlay while files are dragged over it. The dark tint was lowered to OKLCH C 0.032 in 1.1.0 for the same reason.

**Status.** Each state has a solid (dots, borders, filled badges), a text colour, a soft tint, a border and an on-colour.

| State | Solid | Text | Soft | Text on soft (L / D) | On-solid | Means |
|---|---|---|---|---|---|---|
| success | `#15803D` / `#4CC47F` | `#11703F` / `#6FD39A` | `#E7F5EC` / `#16271E` | 5.47 / 8.53 | white / ink | Live, connected, done, positive |
| warning | `#B45309` / `#F5B544` | `#8A4B00` / `#F5B544` | `#FDF3E1` / `#2C2312` | 6.18 / 8.53 | white / ink | Pending (dialling, ringing, on hold), low balance, a warning in a flow |
| danger | `#C0271C` / `#F28B82` | `#B42318` / `#F28B82` | `#FDECEA` / `#2E1A1A` | 5.75 / 6.87 | white / ink | Failed, error, destructive, negative |
| info | `--text-2` (icon) | `--text-2` | `--surface-2`, edge `--border-strong` | 7.88 / 8.57 | | Neutral system facts and progress (Scheduled, Indexing…, Publishing…, Streaming, "No recording for this call", "Editing needs 1024 px"). **Info is graphite, not Neel:** an info notice or tag must never look like a selection. All four info tokens are role aliases, so they follow inverse planes |
| live | `#13923F` / `#4CC47F` | | | ≥ 3.58:1 on every plane | | The live dot. The only colour that pulses, and only 3 cycles per entry into Live (§11) |

`*-border` equals the solid for success, warning and danger in both themes, so a border that carries state is always ≥ 3:1 (for example a node's warning border, 5.02:1). `--info-border` is `--border-strong`: an info edge is structure, not state; the word and the `info` icon carry the meaning. Amber is never standalone text on a light plane except `--warning-text`. A state never relies on colour: every tag carries a word and an icon (F-A11Y-019).

**Baseline, canvas and utility**

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--bl-bg` | `#0F203D` | `#0F203D` | **Neel-ink in both themes** (re-keyed 2026-09-27; was ink / graphite). The only dark band in the light theme and the one place the brand colour appears at scale |
| `--bl-text` / `--bl-strong` | `#C9CED8` / `#FFFFFF` | `#B3BAC6` / `#E8EBF0` | 10.28 / 16.22:1 light, 8.31 / 13.58:1 dark |
| `--bl-sep` / `--bl-line` | `#183C7A` / `#0F203D` | `#183C7A` / `#3A4250` | Separators are a lighter Neel on the band; the hairline shows only in dark |
| `--bl-warn` | `#F5B544` | `#F5B544` | 8.94:1 on Neel-ink. The only third colour allowed in the Baseline |
| `--canvas` / `--canvas-dot` | `#F6F7F9` / ink 12% | `#101318` / `#E8EBF0` 8% | 1 px dots every 16 px, the only texture in the product |
| `--edge` / `--edge-active` | `#7E8695` / `#1F4A94` | `#7E8695` / `#8DB2EE` | edge 3.42:1 light; edge-active 7.95 / 8.63:1 on the canvas; dashed only for the fallback path |
| `--ink-tile` / `--ink-tile-fg` | `#121722` / `#FFFFFF` | `#E8EBF0` / `#121722` | Trigger glyph tile |
| `--mark-bg` / `--mark-fg` | `#0F203D` / `#FFFFFF` | `#0F203D` / `#FFFFFF` | The mark (the cord): white strands on a Neel-ink tile, 16.22:1, both themes (`spec/brand/mark.svg`) |
| `--scrim` | `rgba(18,23,34,.40)` | `rgba(0,0,0,.56)` | Flat, never blurred |
| `--text-selection` | `#DAE6F8` | `#143368` | `::selection` |

### 3.5 Call-state colours

One state machine, shared by Cockpit, Rep console, Call reports and the flow Test panel (direction §6.2). Each state has a word, an icon, a tone and an announcement.

| State | Word | Lucide icon | Tone | Tokens (fg / bg / mark) |
|---|---|---|---|---|
| Idle | Idle | `phone` | neutral | `--call-idle-*` → text-2 / surface-2 / control |
| Dialling | Dialling… | `phone-outgoing` | pending | `--call-dialling-*` → warning-text / warning-soft / warning |
| Ringing | Ringing… | `phone-call` | pending | `--call-ringing-*` → same as dialling |
| Live | Live | the live dot (pulses) | live | `--call-live-*` → success-text / success-soft / live |
| On hold | On hold | `pause` | pending | `--call-hold-*` → warning tokens |
| Wrap-up | Wrap-up | `clipboard-check` | neutral | `--call-wrapup-*` → text-2 / surface-2 / text-2 |
| Ended | Ended | `phone-off` | neutral | `--call-ended-*` → text-2 / surface-2 / control |
| No answer · Busy · Voicemail | as written | `phone-missed` · `phone-off` · `voicemail` | neutral | `--call-ended-*` |
| Failed | Failed | `circle-x` | failed | `--call-failed-*` → danger-text / danger-soft / danger |

Only the live dot moves: on the focal call's CallHeader it pulses 3 cycles each time the call enters Live, then holds still; every other live dot is static, and under reduced motion none moves (§11). State changes are announced politely, debounced; timers and cost are never announced.

### 3.6 Data visualisation

Charts get their own palette, separate from chrome, and **Neel is not a chart colour**: it appears in a chart only on the hovered, focused or selected datum (`--chart-highlight`, an alias of `--accent-mark`), the same job it has everywhere else (selection). The hue slots pass the dataviz validator's six checks (fixed order, lightness band, chroma floor ≥ 0.10, CVD separation under protanopia and deuteranopia, a normal-vision floor ≥ 15 ΔE, and marks ≥ 3:1). Slot 1 is ink: a deliberate neutral, exempt from the band and the chroma floor, and checked for separation instead.

**Categorical** (identity; fixed order, never cycled):

| Slot | Name | Light | Dark | Validator (worst adjacent) |
|---|---|---|---|---|
| `--chart-1` | Ink | `#333A45` | `#B3BAC6` | ≥ 18.3 ΔE (normal) and ≥ 11.7 (CVD) from every hue; 11.46 / 9.20:1 on `--surface`. Dark is graphite-250 because graphite-300 sits 14.5 from teal |
| `--chart-2` | Teal | `#008A7A` | `#23A090` | light: CVD ΔE 10.9 (protan), normal 18.0 |
| `--chart-3` | Ochre | `#B7791F` | `#BC8A2E` | dark: CVD ΔE 11.3 (deutan), normal 18.1 |
| `--chart-4` | Rose | `#C23F6E` | `#DD6593` | all marks ≥ 3:1 on `--surface` |
| `--chart-other` | Slate (Other) | `#8C94A2` | `#5F6878` | Always last, always labelled "Other", 2 px gap. CVD from rose 9.8 light / 7.9 dark (the 6–8 band is legal because the label and gap are mandatory); 3.06 / 3.20:1 |
| `--chart-neutral` | (alias of `--chart-1`) | | | Single-series and ranked marks: bars per period, funnel fills, bar lists, hour bars, sparklines, trend lines |
| `--chart-highlight` | (alias of `--accent-mark`) | `#1F4A94` | `#8DB2EE` | The hovered, focused or selected datum; 8.52 / 8.33:1 |

Rules: at most 4 identity series plus Other; a fifth becomes Other or small multiples. Scatter and small multiples carry at most 3 series. A legend whenever there are 2 or more series, direct labels when there are 4 or fewer. Values and labels use text tokens, never the series colour. No dual axes. Gridlines `--chart-grid`, the axis `--chart-axis`, labels `--chart-label` (`--text-3`). Charts sit on `--surface`. Nominal and single-series marks (calls per day, outcomes by count) take `--chart-neutral`; only the hovered, focused or selected period takes `--chart-highlight`, so a chart never turns a screen blue (direction §3.1: if a screen looks blue, something is misusing Neel).

**Sequential** (magnitude; one teal hue, OKLCH 186°, five OKLCH-even steps, validated as an ordinal ramp: monotone, ΔL ≥ 0.085, lightest step ≥ 2:1 on the surface). Teal, not Neel, so a heat strip never reads as a selection:

| Step | Light | Label on it | Dark | Label on it |
|---|---|---|---|---|
| `--seq-1` | `#6DC3B9` | ink | `#0E635B` | white |
| `--seq-2` | `#3CABA0` | ink | `#098077` | white |
| `--seq-3` | `#228F86` | ink | `#30A197` | ink |
| `--seq-4` | `#23716A` | white | `#6BC1B7` | ink |
| `--seq-5` | `#035750` | white | `#B0DFD9` | ink |

Each step has its label token (`--seq-n-fg`, ≥ 4.56:1). The lightest step is 2.07:1 (light) and the darkest 2.53:1 (dark) on the surface. Zero or missing values use `--seq-empty` (`--surface-2`) with a "No data" legend entry, never the lightest step.

**Talk strip** (Cockpit, Call reports, the recording player): the agent lane is `--talk-agent` (ink `#121722` / `#E8EBF0`), the caller lane `--talk-caller` (graphite `#7E8695` / `#6A7281`), both on the `--surface-2` lane track at 16.1 / 14.0:1 and 3.30 / 3.46:1. Position (agent above, caller below) and the "Agent 58% · Caller 42%" line carry identity; colour only separates.

**Sentiment** is the one chart that uses state hues, because the data is a state (F-VIS-011: neutral must be grey, not mustard). Positive `#34A165` (both themes), neutral `#7E8695` / `#6A7281`, mixed `#434B5B` / `#B3BAC6`, negative `#B42318` / `#B03F37`. Positive is deliberately lighter than negative is dark, which gives a deuteranopia ΔE of 12.9 light / 10.1 dark (the default green–red pair scored 4.8). In a stacked bar the order is positive, neutral, mixed, negative, with 2 px gaps, so green never touches red. The words and icons (`smile`, `meh`, circle-half, `frown`) are always present.

**Frame tints** (user-chosen canvas frames, the pressure valve for "we want colour back"): the five chart hues mixed at 6% (light) or 10% (dark) into the canvas, with a 30–35% edge. They carry less chroma than any status tint, so a frame never reads as a warning. Tokens: `--frame-{neel,teal,ochre,rose,slate}` and `-border`. Frame titles use `--text` (≥ 15:1).

### 3.7 Dark theme approach

- **Selected, not inverted:** every dark value is chosen and proven separately. Neel stays one hue: fill `#2F62C0` behind white, text and marks `#8DB2EE`.
- **A plane ladder plus borders:** bg `#0D0F13` → surface `#14171C` → surface-2 `#1A1E24` → surface-3 `#222730`. Overlays keep the surface fill and use `--border-overlay` plus a deep, ring-free shadow. There are no glows and no pure black (anti-pattern C6).
- **Status softs are dark tints, and status text is light** (for example `#F5B544` on `#2C2312`), so a tag never glows.
- **The selection tint is a tint:** dark `--accent-soft` is `#192231` (OKLCH C 0.032), close to the plane ladder, so a selected row reads as marked, not as a navy block (§3.4).
- **Charts** use darker, validated series (§3.6); sequential ramps flip so high values are light.

### 3.8 Contrast summary

`node spec/tokens/check-contrast.mjs` checks 460 required pairs (230 per theme): every text token on every plane, selected row, soft tint, canvas and frame; status text on its tint and on neutral planes; labels on every fill; controls, focus, marks, the live dot, edges and chart marks; and, since 1.1.0, the component colours (nav keys, the destructive hover, the QR code, the hovered edge), the talk-strip lanes, the chart highlight, the compare tints and `{{variable}}` chips. **All pass.** The tightest pairs, to watch when a value changes:

| Mode | Text (≥ 4.5) | UI (≥ 3) | Focus (≥ 3) |
|---|---|---|---|
| Light | `--seq-3-fg` on `--seq-3`, 4.56 | `--chart-other` on `--surface`, 3.06 | `--focus` on `--surface-3`, 7.13 |
| Dark | `--seq-2-fg` on `--seq-2`, 4.81 | `--sentiment-negative` on `--surface`, 3.09 | `--focus` on `--surface-3`, 6.95 |

### 3.9 Compare (diff) and `{{variable}}` tokens

Two jobs that used to borrow the selection tint now have their own role aliases, so neither can be mistaken for a selected step (all pairs in `check-contrast.mjs`):

| Token | Resolves to | Use |
|---|---|---|
| `--diff-added-bg` / `--diff-added-fg` | `--success-soft` / `--success-text` | An added step or row in Compare mode, **always with the word "Added"** (a `success` Tag) |
| `--diff-changed-bg` / `--diff-changed-bar` | `--surface-3` / `--text` (ink) | A changed step or row: the surface-3 header plus a 2 px ink inline-start bar and the word "Changed" (a `neutral` Tag) |
| `--diff-removed-bg` / `--diff-removed-fg` | `--danger-soft` / `--danger-text` | A removed step or row: the word "Removed" and a strike-through title |
| `--variable-bg` / `--variable-fg` | `--surface-3` / `--text` | `{{variable}}` chips: JetBrains Mono `mono-12`, radius 4, 15.00 / 12.54:1 |

Compare mode never uses `--accent-soft`: the selection keeps its own meaning while comparing.

The direction's CI traps hold: `--text-3` on `--surface-3` is 4.70 / 4.91, amber is never standalone text, and the dark accent hover keeps a white label at 5.37:1. No pair relies on the large-text allowance: every text pair clears 4.5:1, so type size never decides legibility. Reported but exempt: disabled text, hairlines, the canvas dot grid, and accent fills against planes (the label carries identity).
