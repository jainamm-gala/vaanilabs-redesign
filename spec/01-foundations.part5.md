## 18. Token register

Every token another spec asked for, with exactly one name, one value and one owner. Before 1.1.0 the component, page, flow, responsive and motion specs each kept a "Token requests" section with interim `calc()` values, and about sixty names existed only in prose, so "every value is a token" and "no arbitrary values" could not both hold. They are now in `tokens.json` **v1.1.0**, emitted by `build-tokens.mjs`, and every new colour pair is in `check-contrast.mjs` (460 pairs, all pass). Those sections now point here. **A spec that needs a new token adds a row here first**, then to `tokens.json`; a name that is not in this register or in `tokens.css` fails lint (§15.5).

**Status:** *accepted* (emitted since 1.1.0) · *merged* (the request uses another token's name, which wins) · *declined* (an existing token already does the job) · *JS* (in the `interaction` group, never emitted to CSS) · *deprecated*.

### 18.1 Colour, type and motion

| Token | Value (light / dark) | Owner spec | Status |
|---|---|---|---|
| `--nav-hover-bg` | `--surface-3` / `--surface-2` (`#E8EBF0` / `#1A1E24`) | 02-components-data-nav §0.5; 03-pages/06-settings | accepted (`component.nav`) |
| `--nav-active-bg` | `--surface` / `--surface-3` (`#FFFFFF` / `#222730`); text 17.93 / 12.54, active icon 8.52 / 6.95 | same | accepted (`component.nav`) |
| `--nav-active-border` | `--border` / `--border-strong` | same | accepted (`component.nav`) |
| `--danger-hover` | red-700 `#B42318` / red-200 `#F7B2AB`; label 6.57 / 10.17 | 02-components-core §2.1, §11 | accepted (`component.button`) |
| `--qr-fg` / `--qr-bg` | ink / white in both themes (17.93:1); never inverts | 03-pages/05-knowledge-billing §3 | accepted (`component.qr`) |
| `--edge-hover` | `--text-2` in both themes; 8.18 / 9.53 on the canvas | 04-flow-designer/01 §20.2 | accepted (`component.flow-color`) |
| `--chart-neutral` | alias of `--chart-1` (ink) | 02-components-data-nav §11; 03-pages/04 | accepted (alias) |
| `--chart-highlight` | alias of `--accent-mark` | this document §3.6 | accepted (alias, new) |
| `--talk-agent` / `--talk-caller` | ink / graphite-100 · graphite-400 / graphite-500 | 02-components-data-nav §12.5 | accepted (no longer Neel and Slate) |
| `--diff-added-*`, `--diff-changed-*`, `--diff-removed-*` | §3.9 | 04-flow-designer/02 §5 (Compare) | accepted (aliases, new) |
| `--variable-bg` / `--variable-fg` | `--surface-3` / `--text` | 04-flow-designer/01 §5.1, 02 | accepted (aliases, new) |
| `--type-display-48` | 48/52 · 600 · −0.03 em | 03-pages/08-public-auth §18 | accepted (`typography.display-48`) |
| `--type-mono-20` | 20/28 · 500 mono | this document §2.3 | **deprecated**: the timer is `--type-num-20` |
| `--dur-spin` | 800 ms (0 under reduced motion) | 02-components-overlay-feedback §21; 07-motion MD6; 06-accessibility §14.1 | accepted (`duration.spin`) |
| `--live-pulse-cycles` | 3 (0 under reduced motion) | 07-motion MD3; 06-accessibility §14.2 | accepted (`component.live`) |
| `--shift-sheet` | 100 % (0 % under reduced motion) | 07-motion §2.1 | accepted (`motion-shift.sheet`) |
| `--timing-skeleton-min` | 400 ms | 02-components-overlay-feedback §21; 07-motion MD6 | accepted (`timing`) |
| `--timing-state-announce` | 500 ms | 03-pages/01-agent-cockpit §7.14; 02-components-data-nav §12.1 | accepted (`timing`) |
| `--timing-call-stale` | 60 s (`60000ms`) | 03-pages/01-agent-cockpit §7.14 | accepted (`timing`) |
| `--timing-refit-debounce` | 150 ms | 05-responsive §19 | accepted (`timing`) |
| `--timing-debounce` | – | 02-components-overlay-feedback §21 | **merged** into `--timing-validate-debounce` (300 ms), the one input debounce |
| `:root[data-motion="reduce"]` | the reduced-motion block, generated | 07-motion §18; 06-accessibility §14.3 | accepted (build output) |

### 18.2 Sizes

| Token | Value | Owner spec | Status |
|---|---|---|---|
| `--size-node-trigger` · `-logic` · `-action` · `-outcome` | 208 · 256 · 240 · 240 px | 04-flow-designer/01 §20.2 | accepted (`component.flow`) |
| `--size-answer-row` · `--size-frame-header` · `--size-note` | 28 · 32 · 220 px | same | accepted |
| `--size-minimap-w` / `-h` | 176 / 112 px | same | accepted |
| `--grid-snap` | 16 px (snap and dot spacing; JS reads this one value) | same; 07-motion §10.4 | accepted |
| `--layout-rank-gap` / `--layout-node-gap` | 128 / 24 px | same | accepted |
| `--edge-width` / `--edge-width-active` · `--edge-dash` · `--edge-radius` | 1.5 / 2 px · `5 4` · 8 px | same | accepted |
| `--size-left-panel` | 280 px: the one left-panel slot (Add step, Outline, Variables, Version history) at ≥ 1024 | 04-flow-designer/01 §3.1, §20.2; 02 §3.3, §8, §16 | accepted (`size` group), **the only name** at ≥ 1024 |
| `--size-left-panel-tablet` | 320 px: the Outline column of Review mode at 768–1023 | same; 05-responsive §19 | accepted (`size` group) |
| `--size-outline-panel` | – | 04-flow-designer/01 §3.1 | **merged** into `--size-left-panel` |
| `--size-outline` (320) | – | 05-responsive §19 | **merged** into `--size-left-panel-tablet` (320) |
| `--size-test-panel` · `--size-compare-bar` | 280 · 40 px | 04-flow-designer/02 §20 | accepted (`component.flow`) |
| `--size-scrollrow-fade` | 24 px | 05-responsive §19 | accepted (`component.data`) |
| `--size-sheet-step` | – | 05-responsive §19 | **withdrawn** by its owner: the Review step sheet is Sheet `detail` (`--size-sheet-detail`) |
| `--size-chart-sm` · `-md` · `-lg` | 160 · 200 · 240 px | 02-components-data-nav §0.5 | accepted (`component.data`) |
| `--size-sparkline-h` · `--size-stat-min` · `--size-search` · `--size-turn-gutter` | 32 · 200 · 280 · 56 px | same | accepted |
| `--size-view-summary` | 32 px (counted in the chrome budget) | 03-pages/04-call-reports-analytics §5 | accepted |
| `--field-w-short` · `--field-w-medium` · `--popover-w-list` | 180 · 320 · 400 px | 02-components-core §1.3 | accepted (`component.form`); core no longer declares them |
| `--size-palette-list` | `calc(var(--row-h) * 9)` | 02-components-overlay-feedback §21 | accepted (`component.overlay`) |
| `--size-softphone` | 400 px (equals `--size-cockpit-card`) | 03-pages/01-agent-cockpit §7.14 | accepted (`component.shell`) |
| `--size-auth-panel` · `--section-pad-y` | 464 px · 80 / 64 / 48 px at ≥ 1024 / 768–1023 / < 768 | 03-pages/08-public-auth §18 | accepted (`component.shell`, responsive) |
| `--size-assistant-plan` · `--size-assistant-column` | – | 03-pages/02-assistant §11 | **declined**: use `--size-sheet-record` (440) / `--size-inspector` (320) and `--size-container-form` (720) |

### 18.3 JS constants and names that are not tokens

**`interaction` (JS only, one name each; import from `tokens.json`):** `dragThreshold` 4 · `alignThreshold` 6 · `magnetRadius` 24 · `autopanZone` 40 · `autopanMax` 12 px per frame · `safeAreaInset` 0.1 · `zoomMin` 0.25 · `zoomMax` 2 · `lodFull` 0.75 · `lodCompact` 0.5 · `lodHysteresis` 0.03 · `meterFps` 15 · `talkStripFps` 10 · `progressThrottle` 140 ms (07-motion §18, 04-flow-designer/01 §20.2). The CSS names `--zoom-min`, `--zoom-max`, `--lod-full` and `--lod-compact` are **not** emitted: these are read by JS. 07's `snapGrid` is `--grid-snap`, not a second constant.

**Component-local runtime variables** (allowed by lint, never in `tokens.json`, always assigned from a token or a measurement):

| Name | Set by | Why it is not a token |
|---|---|---|
| `--zoom` | `useCanvasZoomVar()` on the canvas viewport | The live zoom level |
| `--table-sticky-top` | DataTable, from the measured height of the sticky header and toolbar above it | A measurement |
| `--vl-dir-x` / `-y`, `--vl-from-x` / `-y`, `--vl-rise` | 07-motion §15 keyframe parameters, per element | Set from `--shift-*` per use |
| `--btn-h-*`, `--btn-px-*`, `--btn-font-md`, `--field-h*`, `--field-px`, `--hit` | 02-components-core §1.3 component layer | `var()` pointers to density tokens (`--control-h`, `--space-*`), switched by density |

Placeholders in prose (`--type-x-size`, `--seq-n-fg`) stand for a family of registered tokens.

### 18.4 Where the requests were

The "Token requests" sections in 02-components-core (§1.3, §2.1, §11), 02-components-data-nav (§0.5, §14), 02-components-overlay-feedback (§21), 03-pages/01-agent-cockpit (§7.14), 03-pages/04-call-reports-analytics (§5), 03-pages/05-knowledge-billing (§3), 03-pages/08-public-auth (§18), 04-flow-designer/01 (§20.2), 04-flow-designer/02 (§20), 05-responsive (§19) and 07-motion-microinteractions (§2.1, §18) now say "registered in 01-foundations §18". Interim `calc()` values in those specs are retired: build with the token name.
