
---

## 3. Layout

### 3.1 Regions and sizes

The designer runs in the shell's **focus mode** (`00-app-shell-ia` §3.2): at ≥ 1024 the navigation is forced to the 56 px Rail without changing the user's sidebar preference, the **Baseline is hidden**, and the 56 px PageHeader is replaced by the 48 px Flow header. There is no separate full-screen mode (F-FLOW-034): the header, save state and issues are always visible, and panels collapse instead.

| Region | Size (token) | Landmark / role | Contents |
|---|---|---|---|
| Rail (shell) | `--size-rail` 56 | `nav "Main"` | Shell spec. Flows is `aria-current` |
| Flow header (`FlowHeader`) | `--size-flow-header` 48, `--surface`, 1 px `--border` bottom | inside `main`; the flow name is the page H1 (visually `title-14`) | Breadcrumb, FlowSwitcher, VersionChip (Draft), SaveState, VersionChip (Live), Undo, Redo, Tidy · spacer · Wallet chip, IssuesChip, Test, Publish v8…, `⋯` (§3.3) |
| Phase ruler | `--size-phase-ruler` 40, `--surface` | `toolbar "Phases"` | One connected bar of four phase segments with counts, the Phase columns toggle, and the live note on the right (§4.4) |
| Tool rail | `--size-tool-rail` 48, `--surface`, 1 px `--border` right | `toolbar "Flow tools"`, vertical, roving tabindex | Add step (A) · Outline (O) · Variables (V) · Find (⌘F) · Version history · Flow settings |
| Left panel | `--size-left-panel` 280 (tokens.json; every left-panel view at ≥ 1024) | `complementary`, labelled by its title | One of: Add step (§8), Outline (§12.3), Variables (part 2), Version history (part 2) |
| Canvas | fluid, `--canvas` with the 16 px `--canvas-dot` grid | `<section aria-labelledby>` with a visually hidden `h2` "Canvas" (06 §6.1, §9.6; no `role="application"`) | Steps, connectors, frames, notes; overlays: canvas controls (bottom left), minimap (bottom right), Find bar (top right), selection bar (bottom centre) |
| Inspector | `--size-inspector` 320, drag-resizable to `--size-inspector-max` 480 | `complementary "Step inspector"` (Sheet `inspector` variant, overlay spec §4.1) | Part 2: Configure · Test data · Issues. This part owns only its placement per breakpoint |
| Problems bar | `--size-problems-bar` 32, `--surface`, 1 px `--border` top | `region "Problems"` | Content per P2 §12.4 (counts, current issue, Go to step, ‹ 1 of 3 ›, Outline and Test toggles); at ≥ 1440 this part adds the two-item legend (Path, Fallback). Expands upward into the Problems panel (§3.4) |
| Toasts | overlay spec §9.3 | `region "Notifications"` | `bottom: calc(var(--size-problems-bar) + var(--space-16))`, right of the docked inspector |

**Canvas share** (viewport area given to the canvas; today 52 %, 36 % with the inspector, 294 px wide at 1024, F-FLOW-022):

| Viewport | Panels | Canvas | Share |
|---|---|---|---|
| 1440 × 900 | none open | 1336 × 780 | 80 % |
| 1440 × 900 | inspector docked | 1016 × 780 | 61 % |
| 1440 × 900 | Add step and inspector docked | 736 × 780 | 44 % (while building; either closes with one key) |
| 1366 × 657 (a 1366 × 768 laptop's inner viewport, `05-responsive` §2.1) | inspector docked | 942 × 537 | 56 % |
| 1280 × 609 (a 1280 × 720 laptop) | inspector docked | 856 × 489 | 54 % |
| 1024 × 768 (a window of that size) | inspector as overlay | 920 × 648 (600 × 648 visible beside it) | 76 % (49 % visible) |

Rows are inner viewports (the browser's content area), not screen sizes; the laptop rows subtract the 120 px of designer chrome (header 48, phase ruler 40, Problems bar 32) from the height Chrome or Edge actually leaves.

### 3.2 Wireframes

Legend: `(■ …)` Trigger capsule · `[◇ …]` Logic · `[▢ …]` Action · `(⚑ …)` Outcome capsule · `●` connected socket · `○` free socket · `┄` fallback path · `[Btn]` button, `[Btn]` with ★ is the one primary.

**Desktop ≥ 1440 · full editor** (mock frame 1). Left panel docks and pushes the canvas; inspector docks at 320; minimap on.

```
┌──┬───────────────────────────────────────────────────────────────────────────────────────────────┐
│V │ Flows / Site-visit qualifier ▾ [Draft · 3 changes ▾] ✓ Saved 11:24 am [● Live v7] │ ↶ ↷ Tidy       │ 48
│  │                                 [₹2,340.50] │ [⚠ 1 warning] [▷ Test] [★ Publish v8…] [⋯]        │
│◉ ├───────────────────────────────────────────────────────────────────────────────────────────────┤
│◉ │ [■ Trigger 2 → ◇ Logic 1 → ▢ Action 2 → ⚑ Outcome 4] ▥   ● Live v7 answers +91 80 •••• 2210 since │ 40
│  │   one connected bar; ▥ = Phase columns toggle           12 Sep. Callers hear v7 until…  Compare│
│◉ ├──┬─────────────┬────────────────────────────────────────────────────┬────────────────────────┤
│  │+ │Add step   ✕ │ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │◇ Logic · Question · #3 │
│  │──│⌕ Search… [/]│ (■ Outbound batch #1)─┐ ┌───────────────────┐       │  Ask about a site visit│
│  │☰ │Recently used│                       ├▶│◇ Ask about a site  │       │Configure·Test data·Iss.│
│  │{}│[Speak][Q…]  │ (■ Inbound call  #2)──┘ │ Yes   haan, zaroor●├─▶[▢ Book site visit]─▶(⚑ Visit booked)
│  │⌕ │▸ Trigger    │                         │ Later baad mein   ●├── Later ──────────────▶(⚑ Callback set)
│  │⟲ │▾ Logic      │                         │ No    nahi        ●├─▶[▢ Polite close]────▶(⚑ Not interested)
│  │⚙ │  Question   │                         │ No reply · 6 s    ○├┄┄┄ No reply ┄┄┄┄┄┄┄┄┄▶(⚑ No answer)
│  │  │  Branch     │                         └───────────────────┘       │ Label / Agent asks /   │
│  │  │▾ Action …   │ [− 85% +] [Fit] [▣] [⋯]                ┌─minimap─┐ │ Answers → Go to [▾]    │
│  │  │▸ Outcome    │                                         └─────────┘ │ Edits save to the draft│
│  ├──┴─────────────┴────────────────────────────────────────────────────┴────────────────────────┤
│  │ [⚠ 1 warning] Book site visit: template "visit_confirm" is pending approval. Go to step  ─ Path ┄ Fallback │ Outline  Test panel │ 32
└──┴───────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Laptop 1280–1439 · full editor, left panel overlays.** Same as desktop except the left panel opens **over** the canvas (non-modal, `--z-overlay`, `--e3`, 1 px `--border-overlay` on its right edge) and closes on Esc or after a drag-add completes. Inspector docked; minimap on; wallet chip visible; SaveState keeps its time. **Exception for large flows:** a flow with more than 20 steps opens with the Outline **docked** at ≥ 1280 (remembered per user as `vaani:flow:outline-large`; closing the Outline on a large flow turns it off). At 1280–1439, while the Outline is docked the inspector becomes the overlay variant, so the canvas keeps at least 56 % of the viewport (§12.1).

```
┌──┬──────────────────────────────────────────────────────────────────────────────────┐
│V │ Flows / Site-visit qual… ▾ [Draft · 3 ▾] ✓ Saved 11:24 am [● Live v7] │ ↶ ↷ Tidy │
│  │                             [₹2,340.50] [⚠ 1] [▷ Test] [★ Publish v8…] [⋯]        │
│  ├──────────────────────────────────────────────────────────────────────────────────┤
│  │ [■ Trigger 2 → ◇ Logic 1 → ▢ Action 2 → ⚑ Outcome 4] ▥  Callers hear v7 until …  │
│  ├──┬─────────────┬───────────────────────────────────────┬───────────────────────┤
│  │+ │Add step   ✕ │▒ (canvas continues under the panel) ▒  │ Inspector 320 docked  │
│  │☰ │ …overlay…   │   [◇ …]──▶[▢ …]──▶(⚑ …)                │                       │
│  │⌕ │             │ [− 85% +][Fit][▣][⋯]      ┌minimap┐    │                       │
│  ├──┴─────────────┴───────────────────────────────────────┴───────────────────────┤
│  │ Problems bar                                                                     │
└──┴──────────────────────────────────────────────────────────────────────────────────┘
```

**Laptop 1024–1279 · rail, inspector as overlay** (mock section 10). The inspector slides over the canvas from the right (Sheet `inspector` variant as an overlay, non-modal, `--e3`); the canvas pans so the selected step sits in the visible part (`fitBounds` of the step within the uncovered width, padding 48). Minimap off by default (its toggle hides). Header compresses: breadcrumb hidden, SaveState short form ("Saved", time in its tooltip), Tidy and the wallet chip move into `⋯` (the wallet chip returns to the header whenever it is low or blocked), IssuesChip shows icon + count. Live note shortens to "Callers hear v7 until you publish. Compare".

```
┌──┬──────────────────────────────────────────────────────────────────────┐
│V │ Site-visit qual… ▾ [Draft · 3 ▾] ✓ Saved [● Live v7] │ ↶ ↷           │
│  │                        [⚠ 1] [▷ Test] [★ Publish v8…] [⋯]            │
│  ├──────────────────────────────────────────────────────────────────────┤
│  │ [■ Trigger 2 → ◇ Logic 1 → ▢ Action 2 → ⚑ Outcome 4]  Callers hear v7… Compare │
│  ├──┬──────────────────────────────────────┬────────────────────────────┤
│  │+ │ (■ Inbound)──▶[◇ Ask about a site…]  │ ◇ Logic · Question · #3  ✕ │
│  │☰ │                ● ● ○ ──▶[▢ Book…]    │ Configure · Test data · …  │
│  │{}│   selection kept in the visible part │ (overlay, e3, non-modal)   │
│  │⌕ │ [− 85% +][Fit]                       │                            │
│  ├──┴──────────────────────────────────────┴────────────────────────────┤
│  │ [⚠ 1 warning] Book site visit: template pending…  Go to step   ☰  ▷  │
└──┴──────────────────────────────────────────────────────────────────────┘
```

**Tablet 768–1023 · Review mode** (mock section 10, 834 px; `05-responsive-flow-768.png`, `-768-step.png`). What works here is the capability matrix in `05-responsive` §10.6 (the one source). Shell TopBar (52) + a 48 px flow header + an info Notice + Outline (`--size-left-panel-tablet` 320, tabs **Outline · Problems n**) | read-only canvas. Test and Publish work; nothing is clipped. Tapping a step (canvas or Outline) opens a read-only Sheet (`detail` width, full height, non-modal) with the step's configuration and the footer "Edit this step on a screen at least 1024 px wide. Your draft is safe." + Copy link. Landscape tablets at ≥ 1024 with a coarse pointer get the full editor with touch sizes (§6.2).

```
┌───────────────────────────────────────────────────────────────┐
│ ☰  Site-visit qualifier                        [₹2,340]   ⌕   │ 52 TopBar (shell)
├───────────────────────────────────────────────────────────────┤
│ [Draft · 3 changes ▾] [● Live v7]   [⚠ 1 warning] [▷ Test] [★ Publish v8…] [⋯] │ 48
├───────────────────────────────────────────────────────────────┤
│ ⓘ Editing steps needs a screen at least 1024 px wide. You can review, test and publish here. │
├ Outline · Problems 1 ─┬─────────────────────────────────────────┤
│ ■ Outbound batch  #1│ · · · · · · · · · · · · · · · ·  (Read only)
│ ◇ Ask about a si… #3│   (■ Outbound)──▶[◇ Ask about…]──▶[▢ Book…]  │
│   ↳ If Yes          │                  Yes ●  Later ●  No ●        │
│     ▢ Book site… ⚠1 │   compact band; pinch to zoom, drag to pan   │
│       ⚑ Visit booked│                                              │
│   ↳ If Later        │                                              │
│     ⚑ Callback set  │                                              │
│   ↳ If No reply     │                                              │
│     ⚑ No answer     │                                              │
│ ■ Inbound call    #2│                                              │
│   ↳ Continues at #3 │ [− 60% +] [Fit]                              │
└─────────────────────┴─────────────────────────────────────────┘
```

**Phone 320–767 · Outline mode** (mock section 10, 390 px; `05-responsive-flow-390.png`, `-390-step.png`; the one phone layout, also `05-responsive` §10.5 and P2 §21.4). The shell's phone TopBar (‹ Flows Back, the flow name as the title, the wallet chip, Search; the wallet chip hides first when the title would drop below 120 px, `05-responsive` §4.3); a chip row (**Draft · Live · issues**, then the flow's `⋯` at its end: Version history, Compare with live, Roll back to v7…, Discard draft changes…, Flow settings); a SegmentedControl **Outline | Canvas** (Canvas = the read-only canvas, pinch and pan, Fit on open); the Outline nested by branch with 48 px rows; a sticky action bar (Test · Publish v8…, 1:1, 44 px buttons) directly above the shell BottomBar, so all 12 destinations stay reachable (F-RWD-001). With a clean draft the bar keeps both buttons and Publish is `aria-disabled` with its reason (P2 §4.3). Steps open as full-screen read-only sheets ("‹ Outline" Back; footer "Edit this step on a screen at least 1024 px wide. Your draft is safe." + Copy link). At 320 px the chip row wraps to two lines; nothing scrolls sideways.

```
┌─────────────────────────────────┐
│ ‹ Flows  Site-visit q… [₹2,340] ⌕│ 52 TopBar (shell)
├─────────────────────────────────┤
│ [Draft · 3 ▾] [● Live v7] [⚠ 1] ⋯│
│ [   Outline   |    Canvas     ] │ 44
├─────────────────────────────────┤
│ ■ Outbound batch             #1 │ 48 rows
│ ◇ Ask about a site visit  #3  › │
│   ↳ If Yes · haan, zaroor       │
│     ▢ Book site visit      ⚠ 1  │
│       ⚑ Visit booked         #6 │
│   ↳ If Later · baad mein        │
│     ⚑ Callback set           #7 │
│   ↳ If No reply · after 6 s     │
│     ⚑ No answer              #9 │
├─────────────────────────────────┤
│ [ ▷ Test ]   [ ★ Publish v8… ]  │ 56 sticky
├─────────────────────────────────┤
│ BottomBar · Flows current       │ 56 BottomBar
└─────────────────────────────────┘
```

### 3.3 Flow header contents

| # | Element (component) | ≥ 1280 | 1024–1279 | < 1024 |
|---|---|---|---|---|
| 1 | "Flows /" crumb (Breadcrumbs, data-nav §2) | shown, links to `/flows` | hidden | TopBar Back on phones |
| 2 | Flow name (FlowSwitcher `purpose="switch"`, core §5.4, borderless `sm` trigger) | max 280 px, middle truncation | max 200 px | TopBar title |
| 3 | `Draft · 3 changes ▾` (VersionChip, overlay §18.2); interim I1: `Draft on this device · 3 changes ▾` (variant `device`) | full | `Draft · 3 ▾` / `On this device · 3 ▾` | chip row / header |
| 4 | SaveState (overlay §18.1); interim I1: `Saved on this device 11:24 am` (status `device`), or `Not saved · this tab only` (status `volatile`, danger) when browser storage is unavailable | `Saved 11:24 am` | `Saved` (time in tooltip); error, offline, conflict and volatile labels never shorten | icon + word in the header |
| 5 | `● Live v7` (VersionChip) or `Not live yet`; interim I1: `Saved flow` (neutral, no version claimed) | shown | shown | chip row |
| 6 | Undo · Redo (IconButton sm, ButtonGroup `attached`, `role="group" aria-label="History"`) | shown | shown | hidden (read-only) |
| 7 | Tidy (Button tertiary sm, `network` icon) | icon + visible label "Tidy" (never icon-only at ≥ 1280) | in `⋯` | hidden |
| 8 | Wallet chip (Tag `lg` neutral; warning tone when low; links to `/billing?topup=1`) | shown | only when low or blocked | TopBar chip (shell) |
| 9 | IssuesChip (§20.1 registry; content P2 §4.3): `No issues` · `1 warning` · `2 errors · 1 warning` · `Checking…`; opens the ProblemsPanel | word + count | icon + count | chip row |
| 10 | Test (Button secondary sm, `play` icon, never a flask) | shown | shown | sticky bar (phone), header (tablet) |
| 11 | `Publish v8…` (Button primary sm) | shown | shown | sticky bar / header |
| 12 | `⋯` More flow actions (Menu) | shown | shown (+ Tidy, Wallet) | header (tablet); end of the chip row (phone) |

The action group (9–12) is `flex: none` and right-aligned; the left group shrinks (`min-width: 0`, name truncates first, then the Draft chip shortens). Nothing is ever clipped off-screen (F-RWD-003). Mode switches on a `matchMedia` change listener, not a check at load.

**Publish button states** (the rules are P2 §5; listed here because they change the header's width): enabled `Publish v8…` · disabled with reason "Fix 2 errors to publish" (`aria-disabled`, reason in its tooltip and in the Problems bar) · disabled "Nothing to publish. Your draft matches Live v7." (never hidden: it stays in the header, or the phone sticky bar, at every width, so focus can return to it after a publish, 06 §7.3) · first publish `Publish v1…`. Before the revisions backend ships, the label is `Publish…` and it writes the device draft to the flow through the gate (P2 §4.9, interim I1; direction §8). Until that Publish, 20 edits or 200 send zero network writes; today's ACTIVATE becomes the Flows list item "Make my Cockpit default" and never publishes.

**`⋯` More flow actions** (Menu, overlay §7; P2 §14 is the source of its items and guards): Preview agent script · Duplicate flow… · Export JSON · Import JSON… · Keyboard shortcuts · Flow settings · separator · Delete flow… (danger, tier-2 confirm, part 2). "New flow" and "Reset to default" are not here (F-FLOW-013, F-FLOW-019).

### 3.4 Problems bar and Problems panel (slot)

Content, order, copy and the panel's rows are P2 §12.4. This part fixes the frame:

| Aspect | Rule |
|---|---|
| Bar | 32 px, full width under the canvas and inspector, always visible in the designer at ≥ 1024 (there is no full-screen mode that hides it, F-FLOW-034). The current-issue sentence takes the free width and truncates with a tooltip; counts, Go to step, ‹ › and the toggles never truncate |
| Legend | At ≥ 1440 only, between the sentence and the toggles: `─ Path` and `┄ Fallback` (`meta-12` `--text-3`, 24 × 8 SVG swatches drawn with `--edge`). Below 1440 the legend lives in the `?` sheet only |
| Panel | Expands **upward** over the bottom of the canvas (not the inspector): min 160 px, max 40 % of the canvas height, resizable by its top edge (`role="separator"`, arrow keys resize by 16 px). The canvas does not re-fit when it opens; Go to step pans so the step clears the panel |
| Tablet | No bar in Review mode: Problems is a tab beside the Outline ("Outline · Problems 1", P2 §12.4, `05-responsive` §10.6); the header's issues chip selects that tab; step marks stay on the read-only canvas |
| Phone | No bar: the issues chip in the chip row opens the Problems list as a full-screen sheet, and the Outline shows per-row badges |

Go to step (P2) selects the step, pans it into view with padding so no panel, overlay or minimap covers it, raises the zoom to at least 0.75 (the Full band) when needed, and opens the inspector.
