# 05 · Responsive strategy: every page at every width (Sutradhar)

<!-- Assembled from 05-responsive.part1.md … part11.md. Edit the parts, then re-assemble. -->

**Status:** v1 for build · **Date:** 2026-09-27 · **Follows:** `spec/00-design-direction.md` (D), `spec/01-foundations.md` (F) and `spec/tokens/tokens.css`, the component specs `02-components-core.md` (C), `02-components-data-nav.md` (N), `02-components-overlay-feedback.md` (O), and the page specs in `spec/03-pages/` (shell `00`, Cockpit and Rep console `01`, Assistant `02`, Leads `03`, Call reports and Analytics `04`, Knowledge and Billing `05`, Settings `06`, Meetings and Personal agents `07`, public site and auth `08`), and the Flow Designer specs `spec/04-flow-designer/01-canvas-and-nodes.md` (FD1: layouts and wireframes per breakpoint, §3 and §17) and `02-config-validation-lifecycle.md` (FD2: gate, test, history and Outline per breakpoint, §21). §10 here owns the Flow Designer's **one capability matrix** (§10.6) and its mode rules; FD1 and FD2 point to it and do not restate it.
**Evidence:** finding ids (F-RWD-…, F-UX-…, F-FLOW-…, F-A11Y-…, F-VIS-…) refer to `audit/consolidated/`. Every one of the 19 F-RWD findings is traced in §18.

**What this document owns.** The cross-page rules that decide how a layout changes with width, height and input: mode resolution, the page archetypes, the component adaptation table, touch targets, safe areas, the on-screen keyboard, orientation and zoom, and the two surfaces whose small-screen behaviour is a product decision rather than a layout one: the **Flow Designer** (§10) and the **Cockpit on phones** (§11). Where a component or page spec already fixes a value, this document points to it and does not restate it; where it changes one, §20 lists the change.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/05-responsive.md`, from `05-responsive.part1.md` … `part11.md` |
| Responsive reference: shell and a data page (Call reports), genuinely responsive (resize the window; `?sheet=1` opens the call sheet, `?more=1` the phone More sheet) | `spec/05-responsive-shell.html` → `05-responsive-shell-1440.png` (sidebar, docked 560 sheet, Baseline), `-1024.png` (rail, overlay sheet), `-768.png` (TopBar, P1 table, Filter with count), `-390.png`, `-390-scrolled.png` (header scrolled away, search sticky), `-390-sheet.png` (full-screen sheet), `-390-more.png` |
| Responsive reference: Flow Designer in its four modes (`?step=1` opens the step sheet, `?theme=dark`) | `spec/05-responsive-flow.html` → `05-responsive-flow-1440.png`, `-1440-dark.png`, `-1024.png` (inspector overlay), `-768.png` (tablet Review mode: Outline + read-only canvas), `-768-step.png` (read-only step sheet, selection panned into view), `-390.png` (phone Outline), `-390-step.png` (read-only step sheet) |

Both mocks link `tokens/tokens.css` and `tokens/base.css` and use media queries only (no device frames), so the same file shows every breakpoint. They implement the width classes; the height classes (§2.2) are specified here but not built into the mocks. Measured on the mocks: no sideways scroll at 320–1440; Publish fully visible at 320, 360, 390, 412, 768, 800, 834, 1024, 1280 and 1440; 9 ListRows fully visible at 360×780 once the header scrolls away; no text under 12 px on screen in any Flow Designer mode.

---

## 0. The responsive contract (one screen)

1. **Every page is designed four times, not shrunk once** (D P6): Desktop ≥1440, Laptop 1024–1439 (split at 1280), Tablet 768–1023, Phone 320–767. The layout is chosen by **width and height**; the interaction details by **pointer**.
2. **Nothing is removed at a breakpoint without a replacement** (F-RWD-001, F-RWD-002, F-RWD-011): a hidden column becomes a line in a list row, a hidden panel becomes a tab, a disclosure or a sheet, a hidden action moves into `⋯`. `hidden md:*` with nothing in its place is banned by lint (§17.3).
3. **12 of 12 destinations at every size**, including 320×640, 844×390 and 200% zoom (F-RWD-001, F-RWD-005).
4. **Nothing scrolls sideways** except content that is sideways by nature (a wide table at ≥768 with pinned columns, a ScrollRow of tabs or tokens with an edge fade). Every page scroller has `overflow-x: clip` and every flex child that holds text has `min-width: 0` (F-RWD-006, -007, -008, -016, -019).
5. **One scroller per page on phones.** Headers, KPIs and filters scroll away; only the TopBar, the search row and sticky action bars stay (F-RWD-004, F-RWD-015). `h-screen` shells with a small inner data window are banned below 1024.
6. **The primary action is never clipped.** It has `flex-shrink: 0` and is the last thing to fold; everything else folds into `⋯` first (F-RWD-003, F-RWD-007, F-RWD-008).
7. **Layout reacts to resize, rotation and zoom live**, never decided once at load (F-RWD-003, F-RWD-014). State (selection, open record, draft text, scroll position) survives every mode change.
8. **Touch is an input, not a width.** 44×44 hit areas and Touch density whenever `(pointer: coarse)`, at any width; 24×24 everywhere else (F-A11Y-023). Keyboard hints never render on touch (F-UX-048).
9. **Safe areas and the keyboard are part of the layout**: every fixed bar pads `env(safe-area-inset-*)`, full-height shells use `dvh`, and a focused field is never under a sticky bar (§7).
10. **Billable and live actions keep their gates at every size.** A phone never gets a shortcut around the Call gate or the Publish gate; it gets a full-screen version of it (D P3).

---

## 1. Decisions this spec settles

| # | Decision | Why (evidence) |
|---|---|---|
| R1 | Five width classes, three height classes and two pointer classes, resolved by one function (`lib/viewport.ts`, §2.4) that CSS mirrors with literal media queries. No other breakpoint may appear in app code. | F-VIS-035 found raw queries at 420, 640, 720, 760, 767, 1079 and 1080 beside Tailwind's; F-RWD-003 and F-RWD-014 show layout decided at load. |
| R2 | **Height is a layout input.** ≥768 wide but <600 tall uses the tablet shell; <480 tall uses phone page layouts inside it; ≤720 tall folds the Baseline; ≤800 tall with a fine pointer puts the sidebar in short mode (a coarse pointer keeps 44 px items and scrolls the nav, 06 §15.1). | F-RWD-005 (rail hides 3–5 items at 768–800 tall; 844×390 shows only one), F-RWD-002 (Cockpit collisions at 1024×768, 1100×700, 720×450). |
| R3 | **Zoom maps to width classes.** 200% on 1440×900 is 720×450 CSS px, so it gets the phone shell; 400% on 1280 is 320 px. No special zoom code, and nothing may disable zoom. | F-RWD-001 (720×450 reached 6 of 12 sections), WCAG 1.4.4 and 1.4.10. |
| R4 | **Phone bottom bar = Cockpit · Leads · Call reports · Flows · More** (N §1.8). Flows earns a slot because the phone Flow Designer is a real review, test, publish and roll-back tool (R6), not a dead end; Assistant, Knowledge, Billing and the rest live in More. | D §6.1; F-RWD-001 recommended 4 tabs + More; the audit's bar had Billing and Knowledge but not Flows. |
| R5 | **Flow Designer on tablet (768–1023): Review mode**, as D §6.5 and FD1 D11 decide: the Outline beside a read-only canvas, Test, Compare, History, Roll back and Publish; no step edits. Landscape tablets (≥ 1024, coarse pointer) get the full editor with 44 px sockets, tap-to-connect and a Navigate / Arrange switch. | §10.2. Editing needs the graph and the step at once, which portrait tablets can't show; tablet editing is a v1.1 candidate measured by `review_edit_attempt`. An earlier draft of this spec let tablets edit; that is withdrawn so every spec and render tells one story. |
| R6 | **Flow Designer on phone (< 768, or < 480 tall): the Outline, read-only.** One layout (FD1 §3.2, §10.5 here): TopBar, chip row (Draft · Live · issues), an Outline \| Canvas switch, the Outline, a sticky **Test · Publish v8…** bar directly above the BottomBar. Problems, a text and browser-voice test, versions, Publish and Roll back work; no edits. | §10.2. Phone jobs are triage; wording and branch changes need the path in view and still go through the Publish gate. |
| R7 | **Cockpit on phone keeps flow, contact, call kind and state visible at all times**, uses a sticky action bar, requests a screen wake lock during a call, and says that phone calls continue if the page is left. | F-RWD-002 (flow and customer context vanish below 768/1024), §11. |
| R8 | **Record and detail panels:** docked beside the list at ≥1440, non-modal overlay at 1024–1439, modal full-height sheet at 768–1023, full-screen sheet with a Back link below 768 (O §1.7). The phone bottom bar hides while a full-screen sheet is open. | F-RWD-004 (details opened inside a 255 px strip), F-A11Y-005, RESPONSIVE-B-20. |
| R9 | **Tables become two-line list rows below 768**, never a squeezed table; at 768–1023 they show P1 columns plus pinned key and actions. There is no per-row call button on phones. | F-RWD-010, F-RWD-011, F-RWD-016; N §7.13. |
| R10 | **The wallet banner is retired at every width.** Wallet state lives in the Baseline (≥1024), the TopBar chip (<1024) and inline on blocked call actions. | F-RWD-013, F-UX-028. |
| R11 | **No orientation lock and no "rotate your device" screens.** Every page works in both orientations; landscape phones get the tablet shell with phone page layouts. | WCAG 1.3.4; F-RWD-005 (844×390). |
| R12 | **Real-device sign-off is part of done** for touch pan and pinch on the canvas, iOS focus zoom, safe-area overlap and the on-screen keyboard, which the audit could only emulate. | 00-summary §6; F-RWD-014. |

---

## 2. Breakpoints, height and input: how a layout is chosen

### 2.1 Width classes

The five min-width breakpoints are F §5 (`--bp-sm` 480 · `--bp-md` 768 · `--bp-lg` 1024 · `--bp-xl` 1280 · `--bp-2xl` 1440). The brief's four ranges map onto them like this:

| Brief range | Class (N §0.3 shorthand) | Width | Shell | Designed for |
|---|---|---|---|---|
| Desktop 1440+ | Desktop | ≥1440 | Sidebar 232, docked sheets and inspector | 1440×900, 1536×864, 1920×1080 |
| Laptop 1024–1440 | Laptop-L | 1280–1439 | Sidebar 232, overlay sheets | 1280×800, 1366×768 (the common Indian office laptop, F-UX-007) |
| | Laptop-S | 1024–1279 | Rail 56 + overlay sidebar | 1024×768 windows, 1280×1024 monitors, iPad landscape 1024–1194 (a 1280×720 screen at 125 % is only about 1024×465 inside the browser, so it gets the tablet shell by height, §2.2) |
| Tablet 768–1024 | Tablet | 768–1023 | TopBar 52 + NavSheet | iPad portrait 768 / 810 / 820 / 834 (the F-RWD-003 range), 200% zoom of a 1920×1080 screen (about 960×485 inside the browser) |
| Mobile 320–768 | Phone | 320–767 (`sm` 480 splits large phones) | TopBar 52 + BottomBar 56 + More | 360×780, 375×667, 390×844, 412×915, 320×640 |

**Screen size is not viewport size.** The "Designed for" column lists device screens. Layout, budgets and tests use the **inner viewport** (`innerWidth × innerHeight`, which is what Playwright's `viewport` sets): the screen minus the OS taskbar or menu bar and the browser's tab strip and toolbar. The reference inner sizes, measured for maximised Chrome and Edge with no bookmarks bar, are listed below. Every budget in this spec set (D §6.1, shell `00` §3.5, Leads `03` §5.0, §3.4 here) is computed at these sizes, and §17.1 tests at them.

| Screen | Where it is common | Inner viewport (reference) | Width, height class |
|---|---|---|---|
| 1920×1080 | desktops, 15.6″ laptops at 100 % | **1920×969** | Desktop, normal |
| 1536×864 | 1920×1080 laptops at 125 % Windows scaling | **1536×730** | Desktop, short |
| 1440×900 | 13″ MacBook (Chrome, Dock hidden) | **1440×789** (the mocks render at 1440×900, the "tall desktop" case) | Desktop, short |
| 1366×768 | the common Indian office laptop (F-UX-007) | **1366×657** (about 1366×625 with a bookmarks bar) | Laptop-L, short **and compact** |
| 1280×720 | small laptops, 1600×900 at 125 % | **1280×609** | Laptop-L, short and compact |
| 1024×768 (iPad landscape) | tablets with Safari's tab bar | **1024×~690**, Touch density | Laptop-S, compact; coarse pointer, so no short nav mode (44 px rail items, the rail scrolls) |
| 768×1024 (iPad portrait) | Safari | **768×~950** | Tablet |
| 390×844 · 360×800 | iPhone 13–15 Safari · mid-range Android Chrome | **390×664** with Safari's toolbar, **390×750** once it collapses · **360×780** with the URL bar scrolled away | Phone |
| 844×390 | the same iPhone in landscape | **844×340** | Tablet shell (landscape phone), tiny |

So on a 1366×768 laptop the Compact height class (§2.2) always applies: the Baseline is folded into its **BaselineChip**, which is the primary workspace-status surface on that device and is tested there (§17.5).

Media queries use literal values with a `.98` upper bound (`@media (max-width: 767.98px)`), matching `tokens.css`. Tailwind utilities use the `sm md lg xl 2xl` keys that map to these values (F §15); arbitrary breakpoints such as `min-[1100px]:` are banned in app and marketing code alike (the public header fits at 1024 because its link set is five short links, `08` §4.1).

### 2.2 Height classes

| Class | Query | Effect | Evidence |
|---|---|---|---|
| **Short** | `(min-width: 1024px) and (max-height: 800px) and (pointer: fine)` | Sidebar and rail short mode: 28 px items, setup card as one row; all 12 items fit in 596 px (N §1.2). Never on a coarse pointer: landscape tablets keep 44 px items and the nav list scrolls, because touch targets never shrink to fit (06 §15.1) | F-RWD-005, F-A11Y-023 |
| **Compact** | `(max-height: 720px)` | `--size-baseline: 0`; the Baseline folds into the BaselineChip; ViewTabs fold into a "View" select. Applies on every 1366×768 and 1280×720 laptop (inner 657 and 609 tall), so the BaselineChip, not the band, is what most office users see; the band shows from 1536×864 (730 tall) up. The fold stays at 720 rather than a lower, Baseline-only fold: below 600 px tall the tablet shell takes over anyway and its TopBar chips carry the same facts, so a lower fold would never fire and would only make every short laptop pay 28 px of rows (11 instead of 12 at 1366×657) | D §6.1, F §5 |
| **Landscape phone** | `(min-width: 768px) and (max-height: 599.98px)` | Tablet shell whatever the width | shell `00` §3.4 |
| **Tiny** | `(max-height: 479.98px)` | Phone page layouts inside the tablet shell: page header rows hide into the TopBar, summaries hide, pagers scroll with the list | Leads `03` §5.6; 844×390 showed no lead rows (F-RWD-011) |

### 2.3 Input classes

| Query | Meaning | What changes |
|---|---|---|
| `(pointer: coarse)` | the primary pointer is a finger | Touch density (44 px controls, 48 px rows, 16 px field text), no short nav mode, 44 px answer and result rows on the canvas so each socket's target is the 44 × 44 row end (FD1 §6.1), the Navigate / Arrange switch in the Flow Designer at ≥ 1024, no hover reveals |
| `(hover: hover) and (pointer: fine)` | mouse or trackpad | hover fills, hover-revealed row actions, tooltips on hover, keycap hints |
| `(any-pointer: coarse)` with a fine primary | touch laptop | keep fine-pointer density, but hover-revealed actions stay visible on focus and on the selected row, so a tap can reach them |

Rules: never detect devices by user agent; never make a layout decision from `pointer` alone (a mouse on a 820 px tablet is still a tablet layout). Hover styles are wrapped in `@media (hover: hover)` so a tap never leaves a sticky hover fill.

### 2.4 One resolver, live

```ts
// lib/viewport.ts — mirrors the CSS; used only where JS must know (React Flow, sheets, focus)
export type ShellMode = 'sidebar' | 'rail' | 'topbar' | 'bottombar';
export type FlowMode  = 'full' | 'compact' | 'review' | 'phone';   // §10.2
export function shellMode(w: number, h: number): ShellMode {
  if (w < 768) return 'bottombar';          // phones, 200% zoom of 1440×900
  if (w < 1024 || h < 600) return 'topbar'; // tablets, landscape phones
  return w < 1280 ? 'rail' : 'sidebar';
}
export function flowMode(w: number, h: number): FlowMode {
  if (w < 768 || h < 480) return 'phone';
  if (w < 1024) return 'review';            // tablets: Review mode, no step edits
  return w < 1280 ? 'compact' : 'full';
}
// FlowCanvas `mode` (FD1 §20.1): 'edit' for full and compact, 'review' for review and phone.
export const coarse = () => matchMedia('(pointer: coarse)').matches;
```

- `useViewport()` subscribes to `matchMedia` change events for each boundary (not a throttled `resize` loop) and to `visualViewport` for the keyboard (§7.3). It returns `{ shell, flow, coarse, short, compact, tiny, keyboardOpen }`; `short` mirrors the Short query including its `(pointer: fine)` clause (§2.2), so it is never true on a touch tablet.
- **CSS decides layout; JS only follows.** Server render emits every variant's CSS, so there is no hydration flash; JS uses the resolver for things CSS cannot do (React Flow `fitView`, choosing a sheet's modality, moving focus).
- **Mode changes are non-destructive:** the open record, the selected step, the draft text in a field, the active tab and the scroll anchor are kept. A sheet that changes modality (overlay at 1100 → modal at 900 after a resize) re-mounts in place with focus kept on the same control.

### 2.5 Container queries

Panels whose width depends on their parent, not the viewport, use `@container` (F §5, F-VIS-035): the Flow inspector and step sheet, the Cockpit call card and New call card, every Sheet body, StatGrid, ChartFrame, the Embed preview, KeyValueList (label beside value at ≥360 px, stacked below) and the Top-up presets. Rule: a component never reads the viewport to lay out its own insides.

### 2.6 Zoom, text size and text spacing

- The root font size is the browser's (N §0.6 fixes `html { font-size: 100% }`), so a user's larger default text scales every `rem` token. Test at 125% and 150% browser text size: nothing may clip or overlap; buttons keep one-line labels by folding into `⋯`, not by wrapping.
- 200% zoom on 1440×900 resolves to the phone shell; 400% on 1280 to 320 px. Both must pass WCAG 1.4.10 with no sideways page scroll and no overlapping controls (F-RWD-002 failed exactly this at 720×450).
- Text spacing overrides (WCAG 1.4.12: line height 1.5, letter spacing 0.12 em, word spacing 0.16 em) must not clip fixed-height elements: tags, chips, the Baseline and bottom-bar labels use `min-height`, never `height`, for their text box.

---

## 3. Grid, page archetypes and the scroll model

### 3.1 Grid

Columns, gutters and margins are F §5 (`--grid-columns` 12 / 8 / 4, `--grid-gutter` 24 / 16 / 12, `--page-margin` 24 / 24 / 16) and the containers (`--size-container-page` 1280, `-form` 720, `-narrow` 400, `--size-measure` 68ch). Additions:

- On phones, full-bleed lists and tables run edge to edge; their rows carry the 16 px margin as inner padding, so tap areas reach the screen edge.
- Landscape phones and notched devices add the side insets: `padding-inline: max(var(--page-margin), env(safe-area-inset-left))` (and right) on the page container, TopBar and sticky bars.
- At ≥1920 data surfaces stay fluid; overview and form pages centre in their container, and the PageHeader aligns with that container, never with the viewport edge (F-VIS-034).
