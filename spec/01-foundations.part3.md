## 4. Space

A 4 px base (F-VIS-016 found 19 padding values including off-grid 9 and 18 px). Tokens are named by their pixel value, so `--space-16` is 16 px. In Tailwind the keys keep the framework convention (`p-4` = 16 px).

| Tokens | Values |
|---|---|
| Scale | `--space-0` · `1` (hairline offsets only) · `2` · `4` · `6` · `8` · `10` · `12` · `16` · `20` · `24` · `28` · `32` · `40` · `48` · `56` · `64` · `80` · `96` |
| Half-steps | 2, 6 and 10 exist for component internals only (≤ 12 px): icon gaps, tag padding, keycap padding |

**Roles** (use these before raw steps):

| Token | Value | Use |
|---|---|---|
| `--space-label-gap` | 6 | Label to control; control to helper text |
| `--space-inline-xs` / `-sm` / `-md` / `-lg` | 4 / 6 / 8 / 12 | Icon to text in tags / in buttons and nav / between buttons / between toolbar groups |
| `--space-field-gap` | 16 | Between fields |
| `--space-group-gap` | 24 | Between field groups and between cards |
| `--space-section-gap` | 40 | Between page sections (32–48 on marketing) |
| `--space-panel-pad` / `-lg` | 16 / 20 | Panels, cards and the inspector / dialogs, sheets and gates |
| `--space-cell-px` | 12 | Table cell padding at Standard density (the density token `--cell-px` varies it) |

Nested radii are concentric: the inner radius is the outer radius minus the padding between them, never larger.

---

## 5. Layout grid per breakpoint

Five min-width breakpoints (F-VIS-035 found raw media queries at 420, 640, 720, 760, 767, 1079 and 1080 alongside Tailwind's):

| Token | Width | Tailwind | Meaning |
|---|---|---|---|
| `--bp-sm` | 480 | `sm:` | Large phone / landscape: two-column list items, wider sheets |
| `--bp-md` | 768 | `md:` | Tablet shell |
| `--bp-lg` | 1024 | `lg:` | Laptop: rail shell; the Flow Designer allows editing |
| `--bp-xl` | 1280 | `xl:` | Labelled sidebar |
| `--bp-2xl` | 1440 | `2xl:` | Desktop: docked sheets, the Cockpit calls column |

Media queries use literal values (CSS variables cannot appear in media queries); the tokens exist for JS (`matchMedia`). Panels whose layout depends on their parent (the inspector, the Cockpit card, the Embed preview) use container queries, not viewport breakpoints. Verify at 320, 375, 390, 768, 1024, 1280, 1366×768, 1440 and 1920, with always-visible scrollbars as on Windows.

| Range | Columns | Gutter | Page margin | Shell | Max content width |
|---|---|---|---|---|---|
| **Desktop ≥ 1440** | 12 | 24 | 24 | Labelled sidebar 232; records open as a docked 440 sheet; inspectors dock at 320 | Data surfaces (tables, canvas, Cockpit) fluid; overview pages 1280; forms 720 |
| **Laptop 1280–1439** | 12 | 24 | 24 | Sidebar 232; sheets overlay the right third | Same |
| **Laptop 1024–1279** | 12 | 24 | 24 | Rail 56 with label tooltips; `[` expands it to 232 as an overlay with a scrim | Same; the Cockpit calls column becomes a header switcher |
| **Tablet 768–1023** | 8 | 16 | 24 | Top bar 52 (menu, title, call chip, wallet chip, search); nav sheet 320 (max 85vw) from the left | Single pane; sheets are 100% height, width min(560, 100%) |
| **Phone 320–767** | 4 | 12 | 16 | Top bar 52 and bottom bar 56 + `env(safe-area-inset-bottom)`: 5 items (Cockpit, Leads, Call reports, Flows, More); More is a bottom sheet listing all 12 destinations | Full width; sheets are full screen; tables become two-line list items |

`tokens.css` exposes `--page-margin`, `--grid-gutter` and `--grid-columns`, which switch at 1024 and 768.

**Containers:** `--size-container-page` 1280 (Home, Analytics, Billing, Knowledge), `--size-container-form` 720 (Settings and create forms, F-VIS-034), `--size-container-narrow` 400 (auth), `--size-measure` 68ch (paragraphs). Headers align with their content column; forms never stretch to 1,300 px at 1920. `html { scrollbar-gutter: stable }` stops the shift F-VIS-034 measured.

**Chrome sizes** (`--size-*`): header 56 · view tabs 40 · toolbar 48 · table head 32 · pager 40 · Baseline 28 · Flow header 48 · phase ruler 40 · tool rail 48 · problems bar 32 · settings sub-nav 200 · inspector 320 (max 480) · record sheet 440 · call-detail sheet 560 · Publish gate 640 · Call gate popover 400 · dialogs 400 / 560 / 720 · menus 180–320 · tooltip max 280 (F-VIS-014 found tooltips about 70 px wide) · toast 400 · Cockpit columns 240 / 400 / rest.

**Chrome budget** (direction §6.1): on 1366×768 and 1280×720 laptops, Leads shows at least 10 Standard rows. Budgets use the **inner viewport**, not the screen: those laptops give about 1366×657 and 1280×609 in maximised Chrome or Edge (`05-responsive` §2.1). The chrome is 56 + 40 + 48 + 32 + 40 + 28 = 244 px. At viewport heights of 720 px or less, `--size-baseline` becomes 0, the Baseline folds into a header chip (the BaselineChip) and the view tabs fold into a select, leaving 176 px: 12 rows at 1366×657, 10 at 1280×609. On those laptops the chip is therefore the everyday status surface, not a fallback.

Full-height shells use `100dvh`, never `100vh`.

---

## 6. Radius

"Machined, not soft." Twelve radii today (F-VIS-016); five now.

| Token | Value | Tailwind | Used for |
|---|---|---|---|
| `--radius-2` | 2 | `rounded-2` | Bars, meters, minimap blocks, chart data-ends |
| `--radius-4` | 4 | `rounded-4` / `rounded-tag` | Tags, keycaps, checkboxes, language marks |
| `--radius-6` | 6 | `rounded-6` / `rounded-control` | Buttons, inputs, menus, filter tokens, answer rows, glyph tiles, notices |
| `--radius-8` | 8 | `rounded-8` / `rounded-panel` | Panels, cards, steps (nodes), table frames, toasts, the bulk bar |
| `--radius-12` | 12 | `rounded-12` / `rounded-dialog` | Dialogs, sheets, gates |
| `--radius-full` | 9999 | `rounded-full` | **Only** avatars, the live dot, switches, and the capsule ends of Trigger and Outcome steps |

No pill buttons, pill tags or pill filter chips (anti-pattern 6).

---

## 7. Lines

| Token | Value | Use |
|---|---|---|
| `--bw-hairline` | 1 px | All structure: row dividers, panel edges, control borders, node edges |
| `--bw-strong` | 2 px | Only the active tab underline, the selected-row inset bar and stepper progress |
| `--focus-width` | 2 px | The focus outline |

A dashed line means one thing: the fallback path on the canvas (a 5/4 dash on `--edge`). There are no dashed borders on cards or empty states.

---

## 8. Elevation

Three levels (F-VIS-016: no elevation scale existed, only glows).

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--e0` | none | none | Default. Structure comes from hairlines |
| `--e1` | `0 1px 2px rgba(18,23,34,.06)` | none | Steps on the canvas, secondary buttons, the active nav key. In dark the element's own border carries it |
| `--e2` | `e1` + `0 6px 16px -4px rgba(18,23,34,.12)` | `0 8px 20px -8px rgba(0,0,0,.60)` | Popovers, menus, the selected step |
| `--e3` | `0 2px 4px rgba(18,23,34,.06), 0 20px 40px -12px rgba(18,23,34,.24)` | `0 24px 48px -16px rgba(0,0,0,.70)` | Dialogs, sheets, gates, the bulk bar, toasts |

- **Light:** soft, layered, ink-tinted shadows. **Dark:** borders do the work. Shadows are deep and ring-free, and every e2/e3 element pairs with `border: 1px solid var(--border-overlay)` (`#3A4250`) so it separates from the page.
- **No blur, no glow, no coloured shadows.** Modals sit on a flat `--scrim`.
- **No hover lift.** Hover changes the fill only (anti-pattern 4).

---

## 9. Z-index

Named layers replace 0 to 9999 (F-VIS-016).

| Token | Value | Holds |
|---|---|---|
| `--z-base` | 0 | Page content |
| `--z-raised` | 1 | The selected step over edges; the sticky first column |
| `--z-sticky` | 10 | Sticky table headers, the page header |
| `--z-chrome` | 20 | Sidebar, rail, top and bottom bars, the Baseline, canvas controls (zoom, minimap) |
| `--z-float` | 25 | The bulk bar |
| `--z-overlay` | 30 | Non-modal sheets over content (1280–1439), the rail expansion |
| `--z-scrim` | 40 | The modal scrim |
| `--z-modal` | 50 | Dialogs, modal sheets, gates |
| `--z-popover` | 60 | Menus, selects, comboboxes, the Call gate popover |
| `--z-toast` | 70 | Toasts |
| `--z-tooltip` | 80 | Tooltips |
| `--z-skiplink` | 90 | The skip link when focused |

Popovers sit above modals because menus and selects inside a dialog (Go to [step] in the Publish gate, for example) portal to `<body>`.

---

## 10. Opacity

Opacity is for **graphics only, never on an element that is an ancestor of text**, and never for text colours or disabled controls (F-A11Y-008 found text at 50% alpha failing AA). Composited over the canvas, a step body at 0.5 puts `--text-3` at 2.12:1 and at 0.4 at 1.79:1, so "dim the whole region" is not allowed: a de-emphasised region changes its **fill** (to `--surface-2`) and dims only its icons, tiles, sockets, strokes and markers. The compositing contrast scanner (06 CT-02) fails any text node under an ancestor with `opacity` < 1.

| Token | Value | Only for |
|---|---|---|
| `--opacity-dim` | 0.4 | Glyph tiles, sockets and connectors of steps outside the emphasised phase or Find result (restored on hover or focus); their text stays at full contrast on a `--surface-2` fill |
| `--opacity-partial` | 0.45 | The pending segment of the talk strip (a bar, no text) |
| `--opacity-unreachable` | 0.5 | The glyph tile, sockets and connectors of an unreachable step or a removed step in compare mode; the step keeps full-contrast text on `--surface-2` and the words "Not connected" or "Removed" |
| `--opacity-drag` | 0.6 | A drag ghost: the **one exception** to the ancestor rule. It is a transient, `aria-hidden` copy under the pointer (incidental text under WCAG 1.4.3) while the original stays at full strength; it carries `data-drag-ghost`, which the CT-02 scanner skips |

---

## 11. Motion

"A relay clicking" (direction §5). Today there are 36 keyframes and reduced motion reaches only the landing page (F-A11Y-022).

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 90 ms | Hover, press, colour changes, and every exit |
| `--dur-base` | 140 ms | Menus, popovers, tooltips, the tab indicator |
| `--dur-slow` | 200 ms | Sheets, dialogs, toasts, the rail overlay |
| `--dur-trace` | 480 ms | The one-shot test-run trace along an edge |
| `--dur-pulse` | 1600 ms | One live-dot pulse cycle; one pass of the indeterminate bar |
| `--dur-spin` | 800 ms | One spinner turn, linear |
| `--live-pulse-cycles` | 3 | Pulse cycles each time a call enters Live (focal CallHeader only); 0 under reduced motion |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | The one easing, for enter and exit (`linear` only for the spinner, the indeterminate bar and pointer-driven motion) |
| `--shift-popover` / `-dialog` / `-toast` | 4 / 8 / 8 px | Entrance offsets |
| `--shift-sheet` | 100% | A sheet slides its own width or height from its edge; 0 under reduced motion, so it fades in place |

**What moves:** only `transform` and `opacity`, listed explicitly (never `transition: all`). Popovers fade and move 4 px; dialogs fade and move 8 px; sheets slide from their edge; toasts rise 8 px. Nothing in the app runs longer than 200 ms except the one-shot trace, the bounded live pulse and busy indicators bound to a request. There is no idle animation: no rings, breathing, shimmer loops, marching ants, scroll reveals or hover lifts.

**Loops are earned and bounded** (the rule for every spec; 07-motion MD3, M5, MD6; 06-accessibility §14). Only three things may repeat, and none of them runs on an idle screen:

1. **The live dot, 3 cycles.** On the **focal call's CallHeader only**, the LiveDot pulses `--live-pulse-cycles` (3) × `--dur-pulse` = 4.8 s each time the call *enters* Live (including a return from On hold, Reconnecting or a hand-back), then holds as a solid dot. Every other live dot (the Calls column, a Leads "Last call" cell, the nav badge, the Baseline, the top-bar chip, meeting cards) is static. Under 5 s, so WCAG 2.2.2 needs no pause control; the word "Live" and the ticking timer carry the state after that.
2. **A spinner or the indeterminate bar, only while a user-started request is in flight.** It appears after `--timing-skeleton-delay` (200 ms), stays at least `--timing-skeleton-min` (400 ms) once shown, and stops the moment the request settles. Spinner: one turn per `--dur-spin` (800 ms), linear. Indeterminate bar: one pass per `--dur-pulse`. Never on idle, never for background polling.
3. **Level meters driven by real audio** (≤ 15 fps). They are real-time data, not decoration, and they stop when the audio stops.

Everything else stops. A timer ticking once a second and a playhead are state, not animation.

**Reduced motion** (`prefers-reduced-motion: reduce`, or the in-app **Motion: Reduce motion** preference, which sets `data-motion="reduce"` on `<html>` before first paint; `tokens.css` emits the same block for both):
- `tokens.css` sets every `--shift-*` to 0, `--dur-trace`, `--dur-pulse` and `--dur-spin` to 0 and `--live-pulse-cycles` to 0, so nothing travels or loops.
- `base.css` stops every keyframe loop. The live dot is still and the word "Live" carries the state; a spinner is frozen and the "…" label and `aria-busy` carry the state; meters show a static level; the test trace is skipped and the reached steps are marked.
- Opacity fades stay, at their normal short durations: they are state changes, not movement.
- Framer Motion (if used) runs inside `<MotionConfig reducedMotion="user">`; JS loops check `matchMedia`.

**Behavioural timing** (`--timing-*`): tooltip delay 300 ms; a skeleton or busy state only after 200 ms of loading (`skeleton-delay`), inside the shell, and then for at least 400 ms (`skeleton-min`); flow validation, palette record search and autosave 300 ms after the last change (`validate-debounce`, the one input debounce, F-FLOW-010); call-state announcements debounced 500 ms (`state-announce`); a call with no update for 60 s shows "No update for 60 s" (`call-stale`); the canvas re-fits 150 ms after a resize (`refit-debounce`); at most one transcript announcement per 2 s; informational toasts 6 s, paused on hover and focus. Error and Undo toasts stay until dismissed (WCAG 2.2.1). JS-only constants (drag threshold, zoom range, level-of-detail bands, frame rates) live in the `interaction` group (§18).

---

## 12. Iconography

| Token | Size | Use |
|---|---|---|
| `--icon-xs` | 12 | Inside 20 px tags only |
| `--icon-sm` | 14 | The Baseline, glyph-tile glyphs, dense chips |
| `--icon-md` | 16 | Default UI: buttons, nav, rows, inputs |
| `--icon-lg` | 20 | Phone bottom bar, top-bar actions |
| `--icon-xl` | 24 | Setup-track step icons (the largest icon in the product; no illustrations) |
| `--icon-stroke` | 1.5 px | Every icon |

- **Library:** Lucide only (`lucide-react`, already the norm on 100% of Leads and Call Reports SVGs). Props: `strokeWidth={1.5}` with `absoluteStrokeWidth`, so the line is exactly 1.5 px from 12 to 24 px. Twenty-two icon sizes today become five (F-VIS-031).
- **Colour:** `currentColor`. Icons take the text colour of their context; the active nav icon uses `--accent-text`; state icons use their state's text colour.
- **Replace** letter pseudo-icons ("F", "IG", "{}"), emoji, the solid sort triangle and same-tab ↗ icons: brand SVGs for Facebook, Instagram and Google sources; `ArrowUp`, `ArrowDown` and `ChevronsUpDown` in sortable headers; `ExternalLink` only for off-site links (F-VIS-031).
- **Accessible names:** decorative icons are `aria-hidden`; every icon-only button has an `aria-label` and a tooltip (F-A11Y-024).

**One icon per destination** (the nav config drives the sidebar, rail, bottom bar, H1 and `<title>`):

| Destination | Icon | Destination | Icon | Destination | Icon |
|---|---|---|---|---|---|
| Cockpit | `activity` | Personal agents | `list-checks` | Call reports | `file-text` |
| Assistant | `bot` | Flows | `workflow` | Analytics | `chart-column` |
| Rep console | `headphones` | Knowledge | `book-open` | Billing | `wallet` |
| Meetings | `video` | Leads | `users` | Settings | `sliders-horizontal` |

**Phase glyph tiles** (24 px tile, 14 px glyph, radius 6; they stay visible at every canvas zoom):

| Phase | Tile | Glyphs |
|---|---|---|
| Trigger | Solid `--ink-tile` with `--ink-tile-fg` | `phone-incoming`, `list`, `webhook`, `monitor` (browser test) |
| Logic | Outlined: 1 px `--control` on `--surface` | A diamond, drawn to Lucide metrics |
| Action | Tinted: `--surface-3` | The tool: `message-square` (Speak), `book-open`, `database`, `calendar-plus`, `message-circle`, `phone-forwarded` |
| Outcome | The soft tint of the state it writes (for example `--success-soft` / `--success-text`) | `flag` |

Custom glyphs (the Logic diamond and any missing tool) are drawn on Lucide's 24 px grid with round caps and joins, at the same stroke.

---

## 13. Focus

Focus and selection are different things, and when both apply both show (F-A11Y-007).

| | Spec |
|---|---|
| **Focus** | `outline: var(--focus-width) solid var(--focus); outline-offset: var(--focus-offset)`: 2 px, offset 2 px. **Always an outline, never a box-shadow** (outlines survive forced-colours mode). Set globally on `:focus-visible` in `base.css`; `outline: none` without a replacement is banned (F-A11Y-006). |
| **Contrast** | `--focus` is ≥ 6.15:1 against every plane, selected row, soft tint, canvas and frame in both themes. The offset means the ring always sits on a plane, not on the button's own fill. |
| **Canvas steps** | Offset `--focus-offset-node` (3 px) so the ring clears the step's own border and the selection ring. |
| **Rows and list items** | Offset `--focus-offset-inset` (−2 px), drawn inside, so a scroll container never clips it. |
| **Inverse planes** | `data-surface="inverse"` switches `--focus` to `--focus-inverse`; the Baseline uses `--bl-focus`. |
| **Selection** | `--accent-soft` fill plus a 1 px `--accent-mark` border (steps, cards), or a 2 px inset `--accent-mark` bar (rows). Never an outline, so it never looks like focus. |
| **Forced colours** | Focus stays a 2 px `Highlight` **outline** all round, with its offset. Selection and the current page (`aria-selected`, `aria-current`, `data-selected`) become a **4 px `Highlight` bar on the inline-start edge** (rows: on the first cell), never an outline or ring, so a focused row, a selected row and the current nav item stay distinguishable and the current page never looks focused; focused + selected shows both. (A `SelectedItem` fill was tried and rejected: Chromium's forced-colours text backplate hides `SelectedItemText`.) State marks (`data-mark`: the live dot, connected sockets, legend swatches) fill with `CanvasText`; free sockets and ports carry `data-mark="hollow"` and render as a `Canvas` fill with a 2 px `CanvasText` ring, so free versus connected survives. These rules use `!important`, the one sanctioned use: they are the accessibility layer and must beat component border and fill rules. Edges (`data-edge`) use `CanvasText` strokes. Snapshot VR-02 covers focused, selected and focused + selected (06-accessibility §21.1). |
| **Sticky chrome** | Never covers a focused element: `scroll-margin` on scroll targets equals the sticky header height. |

---

## 14. Density

A per-user setting on data surfaces only (P4). Forms, dialogs and the inspector always use Standard, and touch overrides everything.

| Mode | How it is set | Row `--row-h` | Control `--control-h` | Small control | Cell padding | Tag | Field text |
|---|---|---|---|---|---|---|---|
| **Standard** (default) | nothing, or `data-density="standard"` | 40 | 32 | 28 | 12 | 20 | 14 px |
| **Compact** | `data-density="compact"` on the data surface (Shift+D, remembered per user) | 32 | 28 | 24 | 8 | 20 | 14 px |
| **Touch** | automatic under `(pointer: coarse)` or below 768 px | 48 | 44 | 36 visible, 44 hit area | 16 | 24 | **16 px** (no iOS zoom) |

- At 1440×900, Leads shows about 16 rows in Standard and 20 in Compact.
- **Hit areas:** at least 24×24 everywhere (`--size-hit-min`, WCAG 2.5.8), 44×44 on touch (`--size-hit-touch`), padded with `::after` so a small visual can keep a large target. No layout mode shrinks a touch target: the nav's short-height mode applies only under `(pointer: fine)` (02-components-data-nav §1.2). Sockets are 10 px with a 24 px hit area clipped to their 28 px answer row. On coarse pointers the answer and result rows grow to 44 and the socket's target is the full-height end of its row, 44 × 44 at 100 % zoom. When the canvas is zoomed out, Connect to…, the Go to selects and the Outline are the equivalent 44 px paths (04-flow-designer/01 §6.1, 06-accessibility §15.1; F-A11Y-023).
- Destructive controls stay at least 8 px from routine ones, or move into an overflow menu.
