<!-- Assembled from 01-canvas-and-nodes.part1.md, 01-canvas-and-nodes.part2.md, 01-canvas-and-nodes.part3.md, 01-canvas-and-nodes.part4.md, 01-canvas-and-nodes.part5.md, 01-canvas-and-nodes.part6.md, 01-canvas-and-nodes.part7.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 04 · Flow Designer · 01 · Canvas and nodes

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** flow-canvas (`/flows/<flowId>`, labelled **Flows**; replaces `/flow-builder`)
**Follows:** `spec/00-design-direction.md` (Sutradhar, especially P1, P2, P3, P5, P6, §4 and §6.5), `spec/01-foundations.md` + `spec/tokens/tokens.css`, the component specs `spec/02-components-core.md`, `spec/02-components-overlay-feedback.md` and `spec/02-components-data-nav.md`, and the shell spec `spec/03-pages/00-app-shell-ia.md` (focus mode). Components are named as those specs name them. Anything they do not cover is specified in §20 "New components needed".
**Evidence:** finding ids (F-FLOW-…, F-A11Y-…, F-RWD-…, F-VIS-…, F-UX-…) refer to `audit/consolidated/`. Raw ids (FLOW-CANVAS-…) refer to `audit/raw/flow-canvas.md`. Measurements of today's builder come from 03c "How the Flow Builder works today" and the raw report §2 to §6.
**Privacy:** every flow, number, lead and person in this spec and its mock is fictional ("Site-visit qualifier", "+91 80 •••• 2210"). Audit flows are called Flow A (26 steps), Flow B (35 steps) and Flow C (9 steps), as in 03c.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/04-flow-designer/01-canvas-and-nodes.md`, assembled from `.part1.md` to `.part7.md` (edit the parts, then re-assemble with `cat`) |
| Reference mock | `spec/04-flow-designer/01-canvas-and-nodes.html` (links `../tokens/tokens.css` and `../tokens/base.css`; `?theme=dark` forces dark). Sections: 1 desktop editor · 2 phase grammar · 3 step states · 4 level of detail · 5 connectors and sockets · 6 palette and adding · 7 large flows · 8 new flow and empty canvas · 9 selecting and snapping · 10 breakpoints (1024, 834, 390) · 11 shortcuts and legend |
| Renders | `01-canvas-and-nodes-desktop.png` (1440 × 900, light), `01-canvas-and-nodes-dark.png` (1440 × 900, dark), `01-canvas-and-nodes-full.png` (whole mock, light) |

**Scope of this part.** The designer's frame and everything on the canvas: layout per breakpoint, the Trigger → Logic → Action → Outcome grammar, step anatomy and states, sockets and connectors, the palette and every way to add a step, canvas controls, selection and clipboard, the keyboard model, large-flow tools (Find, Outline, frames, notes, level of detail), the empty canvas and new-flow templates.
**Owned by Flow Designer part 2** (`spec/04-flow-designer/02-config-validation-lifecycle.md`, cited *P2 §n*; its §0.1 table is the ownership contract) and only referenced here: the inspector's contents, the step-type registry's data (P2 §7.2), what every header chip and button says and when Publish is enabled (P2 §4, §5), the rule set and the Problems bar and panel content (P2 §12), the Test panel and the meaning of test marks (P2 §13), the Outline as an editor (P2 §16), the keyboard operability contract (P2 §16.5, written with this part), `/flows` and the `/flows/new` form (P2 §15), history, Publish gate, AI draft and Flow settings. This part owns how all of it is **drawn and laid out** on the canvas and in the frame, plus the palette, frames, notes, Tidy, minimap, Find and the spatial model (pan, zoom, nudge, marquee, snap).

**Contents.** Part 1: §0 decisions, §1 purpose and findings, §2 hierarchy. Part 2: §3 layout and wireframes per breakpoint. Part 3: §4 visual grammar, §5 step anatomy, states and level of detail, §6 sockets. Part 4: §7 connectors, §8 adding steps and the palette, §9 canvas controls, §10 selection, clipboard and arranging. Part 5: §11 keyboard, §12 large flows, §13 empty canvas and templates, §14 states with copy. Part 6: §15 microcopy, §16 accessibility, §17 responsive summary, §18 telemetry, §19 acceptance criteria. Part 7: §20 new components and tokens, §21 dependencies, open questions, reconciliations and traceability.

---

## 0. Decisions

Today's builder is a React Flow canvas that gets 36–52 % of the screen, draws every step as the same grey 240 px card coloured only by its title (1.48–3.86:1), labels one edge in 27, animates 25 of them forever, hides branch meaning in handle position, and cannot be connected or opened by keyboard (F-FLOW-007, F-FLOW-011, F-FLOW-020, F-FLOW-022, F-A11Y-001). The React Flow base, the labelled toolbar, the polite live region, synonym search and Validate → Jump are kept (00-summary §4). Everything below is additive to React Flow (xyflow v12).

**D1. Left to right, Trigger to Outcome.** Flows read left to right. Tidy (ELK layered) pins every Trigger to the first layer and every Outcome to the last, so the left edge of any flow answers "how do calls start" and the right edge answers "how do calls end". There are **no swimlanes and no phase columns in the layout**: real flows interleave Logic and Action many times (ask, speak, ask, look up, ask), and phase columns would force long back-and-forth edges. The **phase ruler** (40 px) is the lane substitute: one connected bar that reads Trigger → Logic → Action → Outcome, counts and filters phases without spending canvas, and offers an optional **Phase columns** view (off by default) that tints Tidy's layers without moving anything (§4.4).

**D2. Shape is type, colour is state (direction P2).** Trigger = capsule start with a solid ink tile; Logic = rectangle with an outlined diamond tile and answer rows; Action = rectangle with a tinted tool tile and, when it can fail, result rows; Outcome = capsule end with a tile in the soft tone of the status it writes and the plain status line "Lead → Interested". Titles are always `--text`. Green, amber and red appear only for real state (issues, the status an Outcome writes, a live version). Users who want colour get **frames** with a low-chroma tint (§12.4).

**D3. Every branch is a labelled row with its own socket, and "decides" never looks like "did".** Logic outputs are **answer rows** ("Yes · haan, zaroor · हाँ"): a `label-13` label, bilingual examples, a socket on the right edge, plus exactly one **fallback row** (No reply, Else). Actions that can fail (lookups, Book meeting, Transfer) show **result rows** instead: a 12 px `check` or `x` glyph, a `data-13` label in `--text-2`, no examples, a lighter rule, and the failure result as the fallback row (Not found, Not booked, Didn't connect). Meaning never depends on which side a handle sits (F-FLOW-020).

**D4. One line, one meaning for dashes.** Connectors are 1.5 px neutral orthogonal lines with 8 px corners and an arrowhead into the input. The fallback path is the only dashed line in the product. Nothing animates at rest; the only motion is a one-shot trace during a test run (F-FLOW-011, F-A11Y-022).

**D5. Every action has an address (direction P5).** The canvas is one tab stop with arrow-key navigation along connections; sockets are real buttons with 24 px hit areas (44 px on coarse pointers); `C` opens **Connect to…** and `A` adds a connected step; every answer also has a Go to select in the inspector (part 2). Drag is always optional (F-A11Y-001, F-A11Y-028).

**D6. Adding never lands on top of something.** Click or Enter inserts after the selected step and connects it; drag drops where you let go; dropping on a connection inserts between its steps; the "+" beside a free socket opens a search-first picker. Placement avoids every existing box (F-FLOW-009).

**D7. Step numbers are stable ids; call order is said separately.** Every step gets a per-flow sequence number when it is created (the flow's highest number ever used + 1). It is never reused after a delete, never changed by Tidy, edits, reordering or publishing, and it is carried from version to version, so "#9" in a chat message, a saved Problems message, a Call reports column ("Visit day · step 9"), Analytics drop-off or History still names the same step next week (F-FLOW-026, F-FLOW-010). The step shows it as `#9` at the end of its phase line; sentences say "step 9". **Call order** (depth-first from the first Trigger, answers in their listed order, unreachable steps last; P2 §16.2) is a separate, positional fact: it drives the Outline's order, the roving arrow-key order and the position in the accessible name ("step 3 of 14 in call order"), and it is never printed as a number on the step. Find matches both `#9` and titles (§12.2).

**D8. The 12 px floor holds at every zoom, at rest.** Three level-of-detail bands (Full ≥ 0.75, Compact 0.5–0.75, Block < 0.5, direction §6.5) plus a clamp on every text role inside the node layer, so no step text renders below 12 CSS px once a pan or zoom gesture ends. During a gesture text scales with the viewport and the clamp is re-applied at its end, so large flows stay fast (§5.5, §12.7; F-FLOW-008, F-A11Y-008).

**D9. The canvas never writes the live flow, and viewing never writes at all.** Every canvas edit goes to the Draft (part 2); before the revisions backend ships, that Draft is the **device draft** in this browser and nothing reaches the server until the Publish gate (P2 §4.9, interim I1, the only interim). Selection, zoom, pan, fit, LOD changes, the minimap, theme and panel toggles never mark the flow dirty and never write. The viewport is remembered per user and flow in local storage, never in the flow (F-FLOW-002, F-FLOW-012).

**D10. Large flows are first-class.** Find (`⌘/Ctrl+F`), the Outline (nested by branch, a complete keyboard editor), collapsible frames, notes, a minimap from 1280 px, Tidy as one undo step and a restored viewport are part of v1, validated against 26- and 35-step flows (F-FLOW-017, F-FLOW-021, F-FLOW-023).

**D11. Edit from 1024, review from 768, outline below.** 1024–1279 overlays the inspector; 768–1023 is Review mode (Outline plus read-only canvas; Test and Publish work); under 768 the Outline is the page, read-only, with Test and Publish. Publish is never clipped (F-RWD-003, F-RWD-014). This is the one responsive decision for the designer (direction §6.5, "Responsive"); `05-responsive` §10 follows it, and tablet editing is a v1.1 candidate measured by `review_edit_attempt` (§18). (Capabilities: `05-responsive` §10.6.)

**D12. Create on purpose.** New flow is a page (P2 §15.3) whose starting points are drawn with this part's **PhaseStrip**: real glyph tiles and step names in Trigger → Logic → Action → Outcome order, with a read-only canvas preview. Every template passes validation in CI **and is instantiated against the workspace** (numbers, calendar, WhatsApp, knowledge), so a template created in an empty workspace opens with no errors (P2 §15.3). A blank flow is a Trigger connected to an Outcome with one sentence and two buttons on the connection, not an empty grid, and its issues chip reads "No issues" (F-FLOW-013, F-FLOW-037).

---

## 1. Purpose, job to be done and findings addressed

### 1.1 Purpose

**Job to be done.** "When I need my voice agent to handle a kind of call, I want to lay out what it says, what it listens for and how each call ends, see at a glance that every path finishes somewhere sensible, and change it safely, so that the next real call does what I intended."

| User | Comes to the canvas to… | Success looks like |
|---|---|---|
| Ops or sales lead (builds flows) | Start from a template, adapt questions and answers, wire outcomes | A 10–15 step flow built and tested in one sitting without dragging a single handle if they prefer |
| Support or QA (reviews flows) | Read a 26–35 step flow, find a step a caller got stuck on, check branches | Finds "#14 Ask about loan" in two keystrokes; reads every branch label without zooming to 100 % |
| Keyboard, switch or screen-reader user | Build and change flows | Builds a 3-step connected flow with the keyboard alone (F-A11Y-001) |
| Manager on a tablet or phone | Check what is live, review a change, run a test, publish | Reviews the Outline and publishes from 768 px; reads the Outline on a phone |

The canvas answers three questions at every moment, in this order: **What does this call do?** (the path), **Is anything wrong?** (issue marks and the Problems bar), **What will callers hear?** (Live v7 versus Draft, in the header and phase ruler).

### 1.2 Findings addressed here

| Finding | Severity | What changes on the canvas |
|---|---|---|
| F-A11Y-001 (F-FLOW-006) | critical | Canvas is one tab stop with graph-order arrow navigation; Enter opens the inspector; sockets are buttons with 24 / 44 px targets; `C` Connect to…; `A` adds a connected step (§6, §11; contract shared with P2 §16.5; the Outline editor is P2 §16) |
| F-FLOW-007, F-VIS-003, F-A11Y-019 (node titles) | high | Ink titles on `--surface-raised`, 1 px `--border-strong` + `--e1`; phase tiles instead of coloured titles; chips replaced by 13/500 answer rows (§5) |
| F-FLOW-008 | high | Level-of-detail bands with the 12 px clamp; open at a legible zoom anchored at the first Trigger; zoom % control with presets; Find and Outline (§5.5, §9, §12) |
| F-FLOW-009 | high | Insert-after-selection with auto-connect, collision-free placement, drag from the palette, drop onto an edge, "+" on free sockets (§8) |
| F-FLOW-010 (canvas part) | high | Issue badges with words on steps, amber required-answer sockets, stable step numbers (D7); the Problems bar's slot and responsive behaviour (§5.4, §3.4). Rules, timing and bar content: P2 §12 |
| F-FLOW-011 | high | Neutral routed connectors, labels on long branch edges, dashed only for fallback, no idle animation, readable edge names (§7) |
| F-A11Y-007 | high | Focus = outline with 3 px offset; selection = accent-soft header + accent border; both show together (§5.4) |
| F-FLOW-017 | medium | Find, Outline, frames, notes, legend, Tidy, zoom readout; per-step call data as v1.1 (§12) |
| F-FLOW-020 | medium | N labelled answers + mandatory fallback; 10 px sockets with 24 / 44 px hit areas; edge popover to insert, retarget or delete (§6, §7.5) |
| F-FLOW-021 | medium | 16 px snap, alignment guides, Tidy (ELK) as one undo step, "Overlapping steps · Tidy" notice on load (§9.4, §10.4) |
| F-FLOW-022, F-RWD-014 | medium | One 48 px header, 40 px ruler, 48 px tool rail, collapsible left panel, inspector overlay below 1280, Baseline hidden: canvas share 61 % at 1440 with the inspector open (§3) |
| F-FLOW-023 | medium | 176 × 112 neutral minimap from 1280 only, toggle remembered, never covers the selection, fit padding accounts for it (§9.3) |
| F-FLOW-024 | medium | Shift/Ctrl/Cmd click toggles selection; marquee selects on touch; selection bar with count; platform-aware shortcut sheet with only working keys (§10, §11) |
| F-FLOW-025 | medium | Delete closes the inspector, announces, and raises "Deleted … and 2 connections · Undo" (§10.3) |
| F-FLOW-026 | medium | Paste at pointer or nearest free space, "(copy)" suffix, internal connections kept, fresh ids, `#n` on every step (§10.2, D7) |
| F-FLOW-027 | medium | One step-type registry (data in P2 §7.2) drawn identically in the palette, phase line, Outline and badges (§4.3) |
| F-FLOW-029 | medium | "Unsupported step" component with Convert to… and a validator error (§5.3) |
| F-FLOW-034 | low | No separate full-screen mode: the Baseline is hidden and panels collapse, so the header, save state and issues stay visible at all times (§3.1) |
| F-FLOW-035 | low | Single-column palette, each type once, descriptions, fixed Recently used row, no fake "+ 10" (§8.2) |
| F-FLOW-036 | low | One theme mechanism for the canvas (`colorMode` from `data-theme`), tokenised edge labels, no meaningless dashed borders or green dot (§5, §7) |
| F-FLOW-037 | low | Canvas skeleton, no template flash, editing off until hydrated, flow id in the URL (§14) |
| F-FLOW-013 | high | PhaseStrip on every starting point, read-only template preview, blank-flow canvas state (§13). The `/flows/new` form is P2 §15.3 |
| F-A11Y-011 | medium | Every canvas menu (step, edge, view options, zoom) is a Radix menu: focus moves in, arrows move, Esc returns focus (§9, §10.5) |
| F-A11Y-022 | medium | No idle animation; trace and Tidy moves stop under reduced motion (§7.4, §9.4) |
| F-A11Y-023 | medium | 24 px minimum targets on the canvas, 44 px on coarse pointers (§6.2) |
| F-A11Y-027 | medium | `?` sheet is the shared Dialog lg, portalled, focus managed; the node editor is the inspector with Esc back to the step (§11.3) |
| F-A11Y-028 | medium | Graph-order navigation instead of 53 tab stops; edges named from step titles; minimap `aria-hidden` with keyboard equivalents (§11, §9.3) |
| F-RWD-003 | high | Right-aligned, non-shrinking action group; overflow menu below 1024; Review mode at 768–1023; mode switches on resize, not only on load (§3, §17) |
| F-UX-004 (canvas part), F-UX-031 | high / medium | No "validated" pill on the canvas; the open flow and selected step live in the URL (`/flows/<id>?node=<stepId>`) (§3.3, §12.1) |

Findings owned by part 2 and not repeated here: F-FLOW-001 to 005, 012, 014 to 016, 018, 019 (inspector and menu parts), 028, 030 to 033; F-UX-024; F-QA-002.

---

## 2. Information hierarchy

What the eye should hit, in order, on a 1440 × 900 editor (mock frame 1):

| Order | Element | How the hierarchy is achieved |
|---|---|---|
| 1st | **The call path on the canvas**, starting at the Trigger capsules on the left | The largest region (61–80 % of the viewport); ink titles at 14/600; the only texture in the product (dot grid); nothing else on screen is as large |
| 2nd | **What is live versus what I'm editing, and whether I can publish**: `Draft · 3 changes`, `Saved 11:24 am`, `Live v7`, the issues button, `Publish v8…` | Top-right cluster of the 48 px header; the one Neel fill on the screen is Publish; the issues button is the only amber in chrome |
| 3rd | **The selected step** (accent-soft header) and its inspector | Selection is the second Neel element allowed per screen (direction §3.1) |
| 4th | Phase ruler counts and the live note | 40 px, one connected bar of four segments joined by `arrow-right`, `label-13`, neutral tiles; reads as a sequence of phases, not as a second breadcrumb |
| 5th | Problems bar (current issue + Go to step), tool rail, canvas controls, minimap | Quiet: `--surface`, `text-2`/`text-3`, icon buttons with tooltips; no fills |

Rules that protect this order:
- At most one filled Neel button on screen (Publish) plus the selection (direction §3.1). Test is secondary; everything else is tertiary or in `⋯`.
- No text on the canvas is larger than a step title; frame titles are `label-13`/600, notes `data-13`.
- Issue colour appears on the step that has the issue and in the issues button and Problems bar, never as a banner (direction anti-pattern 18).
- Nothing on the canvas moves unless the user moved it or a test is running (P7).

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

---

## 4. Visual grammar: Trigger → Logic → Action → Outcome

### 4.1 The four phases (mock section 2)

| Phase | Palette description | Silhouette | Glyph tile (24 px, radius 6) | Input | Outputs |
|---|---|---|---|---|---|
| **Trigger** | When a call starts | **Capsule start**: left end `--radius-full`, right corners `--radius-8` | Solid `--ink-tile`, glyph `--ink-tile-fg` | none | 1 |
| **Logic** | Listen and decide | Rectangle, `--radius-8`, with answer rows under the header | Outlined: 1 px `--control` on `--surface`, glyph `--text` (the diamond) | 1 | named answers + exactly one fallback row |
| **Action** | Do something for the caller | Rectangle, `--radius-8` | Tinted: `--surface-3`, glyph `--text` (the tool) | 1 | 1; lookups, Book meeting and Transfer show **result rows** (what happened), the last of which is the fallback (P2 §7.2, R2) |
| **Outcome** | How the call ended | **Capsule end**: right end `--radius-full` | The soft tone of the lead status it writes (`--success-soft`, `--warning-soft`, `--surface-3`, `--danger-soft`) with `flag` in the matching text tone | 1 | none |

Four tiles stay distinguishable in greyscale and at every zoom: solid, outlined, tinted, and flag. Phase never relies on hue (direction P2, risk "monochrome nodes" mitigated by the ruler, the palette groups and the legend in the `?` sheet). **Rows tell the second half of the story:** a Logic step's answer rows say what the caller might *say* (label + bilingual examples); an Action's result rows say what the tool *did* (check or x glyph + plain label, no examples). The two row types differ at every level of detail (§5.1, §5.5), so a CRM lookup never reads as a question.

### 4.2 Start and end markers, lanes

- **Start** is always a Trigger capsule; a flow can have several (Inbound call and Outbound batch into the same first step). Triggers have no input port, so nothing can connect into a start.
- **End** is always an Outcome capsule. Every path must reach one (validator error "a path with no Outcome", part 2). An Outcome has no output socket, so a call cannot continue past its end.
- **No swimlanes or phase columns** (D1). Tidy places Triggers in the first layer and Outcomes in the last, which gives every flow a readable entry edge and exit edge. Between them, layers follow the graph.
- **Phase ruler as the lane substitute** (§4.4) and **frames** for user-defined grouping (§12.4).

### 4.3 Step-type registry, as drawn (F-FLOW-027)

The registry's data (type key, name, palette description, outputs, replaced names) is P2 §7.2 (`lib/flow/registry.ts`). This part adds only what the canvas needs from each entry: the glyph, the rows, which row is the fallback, and the default width.

| Type key | Name | Glyph (Lucide, 1.5 px) | Rows on the canvas | Fallback row (dashed edge) | Width |
|---|---|---|---|---|---|
| `trigger.inbound` | Inbound call | `phone-incoming` | – (one socket on the title line) | – | 208 |
| `trigger.outbound` | Outbound batch | `list` | – | – | 208 |
| `trigger.api` | API or webhook | `webhook` | – | – | 208 |
| `trigger.test` | Browser test | `monitor` | – | – | 208 |
| `logic.question` | Question | diamond (custom, drawn to Lucide metrics) | answer rows: 2–8 named answers | **No reply** · after N s (· "asks again once" when retries are on) | 256 |
| `logic.branch` | Branch | diamond | answer rows: 1–8 cases | **Else** | 256 |
| `logic.verify` | Verify caller | diamond | answer rows: Verified · Failed | **No reply** | 256 |
| `action.speak` | Speak | `message-square` | – | – | 240 |
| `action.knowledge` | Knowledge lookup | `book-open` | result row: `check` Found | **`x` Not found** | 240 |
| `action.crm` | CRM lookup | `database` | result row: `check` Found | **`x` Not found** | 240 |
| `action.meeting` | Book meeting | `calendar-plus` | result row: `check` Booked | **`x` Not booked** | 240 |
| `action.whatsapp` | Send WhatsApp | `message-circle` | – | – | 240 |
| `action.transfer` | Transfer to a person | `phone-forwarded` | result row: `check` Connected | **`x` Didn't connect** | 240 |
| `outcome.end` | End with outcome | `flag` | – (no output) | – | 240 |
| `unknown` | Unsupported step | `circle-help` (outlined tile) | one row with Convert to… | – | 240 |

- **Fallback** means "the step could not get what it needed". It is always the last row, always on `--surface-2`, and its connector is the only dashed line (§7). On Logic steps it is an answer row; on Actions it is a result row with the `x` glyph.
- **Outcome tiles** follow the lead status the step sets (P2 §7.14 "Set lead status to"): Interested and Converted → `--success-soft`; Callback due → `--warning-soft`; Not interested, Not reached, Contacted → `--surface-3`; Do not call → `--danger-soft`. The **status line** under the title is plain text, the same sentence everywhere (direction §6.5, `06-accessibility` §10.4, the Outline): **"Lead → Interested"** in `meta-12` `--text-3`, the arrow a 12 px Lucide `arrow-right`, the status word in `--text-2`. It is not a chip: the tile already carries the tone, the words carry the meaning, and the canvas keeps one fewer tag per step.
- **Default titles** come from the registry; when that title already exists in the flow, a number is appended ("Speak 2"), never "New Speak Node" (F-FLOW-026). Duplicate titles stay legal (they get a validator warning, P2 §12.2); `#n` disambiguates them on the canvas.
- **Migrated End steps** must not claim a status they never recorded (P1). They are drawn with a neutral tile and the status line "Choose what this call records" until an outcome is chosen (open question Q2).
- **Unregistered types** (imports, AI drafts, old data) render as Unsupported step (§5.3) and are errors (P2 rule E14, F-FLOW-029).

### 4.4 Phase ruler (40 px)

`toolbar "Phases"`: **one connected segmented bar**, so it reads as a sequence of phases and never as a second breadcrumb under "Flows / Site-visit qualifier". Anatomy:
- A 28 px bar on `--surface` with a 1 px `--border-strong` outline and `--radius-6`, holding four toggle buttons. Each segment is `[tile 20] Phase <count>` in `label-13`, count `tabular-nums` 600, padding `0 var(--space-10)`.
- Between segments, a 16 px Lucide **`arrow-right`** in `--text-3` sits on a 1 px `--border-strong` rule drawn behind the tiles, the full width of the bar at its vertical centre (the rule is hidden behind each segment's `--surface` fill, so it shows only in the gaps, joining the tiles into one line). Never `chevron-right` (that is the breadcrumb separator), never typed arrows (foundations §2.1).
- After the bar, separated by 8 px: the **Phase columns** toggle, an IconButton `sm` with `columns-3`, `aria-pressed`, tooltip "Phase columns".

| Interaction | Result |
|---|---|
| Click or Enter/Space on a segment | `aria-pressed="true"`; the segment takes the selection treatment (`--accent-soft`, 1 px `--accent-mark`); steps of other phases are **de-emphasised** (§5.4 Dimmed: `--surface-2` fill, their glyph tiles, sockets and connectors at `--opacity-dim`; text keeps full contrast). Tab into the canvas lands on the first step of that phase |
| Click another segment | Emphasis moves to it |
| Click the pressed segment, or Esc in the canvas | Emphasis clears |
| Hover or focus a de-emphasised step | It returns to the default treatment while hovered or focused |
| Phase columns on | A view preference (per user, `vaani:flow:phase-columns`; never written to the flow, never dirties the draft; off by default, so D1 holds). Tidy's layers are drawn as full-height bands behind steps, alternating `--canvas` and `--surface-2`, each with a 24 px counter-scaled header pinned to the top of the viewport: the phases present in that layer, dominant first, with counts ("Logic 2 · Action 1") in `label-12` `--text-2`. Bands follow the layers Tidy last computed; steps moved by hand keep their band by x-position. Nothing moves and no step changes. Hidden in the Block band below 0.35 and whenever the flow has not been tidied since load ("Tidy to see phase columns" in the toggle's tooltip) |

Counts are computed from the graph (frames and notes excluded) and update after every change. **Live note** (right side, `data-13` `--text-2`, ellipsis, link `flex: none`): "● Live v7 answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish. **Compare with live**". Clean draft: "No unpublished changes" (`--text-3`). Never published: "Not live yet. Publishing puts v1 on the numbers and batches you choose." At 1024–1279: "Callers hear v7 until you publish. **Compare**". Hidden below 1024 (the Live chip carries it). The note's content comes from part 2's revision model (P2 §4.3). **Interim I1** (before revisions ship, the only interim; P2 §4.9): "Edits stay on this device until you publish. Callers hear the saved flow." in `--text-2`, never in warning tone, because nothing the author types reaches callers.

---

## 5. Step anatomy, states and level of detail

### 5.1 Anatomy (Full band, mock sections 1 to 3)

```
         badge ┐ (outside the dimmable body)
 ┌────────────────────────────────────[2 errors]─┐
 ● [tile] Logic · Question · Edited          #3   │  phase line: phase-12 text-3 · number meta-12
 │        Ask about a site visit                  │  title: title-14 text, 1 line
 │        {{lead_name}} ji, would you like to…    │  summary: data-13 text-2, 2 lines
 │        [अA] Hinglish · waits 6 s               │  meta: meta-12 text-3, 1 line
 ├────────────────────────────────────────────────┤
 │ Yes    haan, zaroor · हाँ                     ●│  answer row 28: label-13 + examples meta-12
 │ Later  baad mein, next week                   ●│
 │ No reply  after 6 s · asks again once         ○│  fallback row on surface-2
 └────────────────────────────────────────────────┘
 ↑ input port on the title line                   ↑ one socket per row, on the right edge

 Action that can fail (result rows):             Outcome (status line):
 ┌──────────────────────────────────────┐        ┌───────────────────────────────────╮
 ● [tile] Action · CRM lookup       #4  │        ● [flag] Outcome              #5     │
 │        Find the buyer's record       │        │        Visit booked                │
 │        By phone number · Sample CRM  │        │        Lead → Interested           │  meta-12: text-3, word text-2
 │  ──────────────────────────────────  │        ╰───────────────────────────────────╯
 │ ✓ Found                             ●│  result row 28: inset rule, 12 px glyph text-3 + data-13 text-2
 │ ✕ Not found                         ○│  fallback result row on surface-2
 └──────────────────────────────────────┘
```

| Part | Tokens and rules |
|---|---|
| Frame | `--surface-raised`, 1 px `--border-strong`, `--radius-8`, `--e1` (dark: the border carries it). Capsule ends `--radius-full`. **No dashed borders, no coloured borders at rest** (F-FLOW-036) |
| Width | Fixed per phase so Tidy aligns columns: Trigger `--size-node-trigger` 208 · Logic `--size-node-logic` 256 · Action `--size-node-action` 240 · Outcome `--size-node-outcome` 240 (tokens, §20.2 and foundations §18). Height is intrinsic |
| Header | padding `--space-12` top, `--space-16` right (`--space-32` on the Outcome capsule), `--space-10` bottom, `--space-12` left (`--space-16` inside the Trigger capsule); gap tile → text `--space-10` |
| Glyph tile | `--size-glyph-tile` 24, `--radius-6`, glyph `--icon-sm` 14 at 1.5 px |
| Phase line | `phase-12` in `--text-3`: phase · type (omitted when equal to the phase, e.g. "Trigger") · change word ("Edited", "New", "Reached"), ellipsis; the **stable step number** `#12` (D7: assigned at creation, never reused or renumbered) right-aligned, `meta-12` 400, `tabular-nums`, `flex: none`. Call order is never printed on the step |
| Title | `title-14` `--text`, one line with ellipsis; the full title is in the tooltip (after 300 ms) and in the accessible name. `translate="no"` |
| Summary (Logic, Action) | `data-13` `--text-2`, 2-line clamp. `{{variables}}` as `mono-12` chips on `--variable-bg` / `--variable-fg` (surface-3 / ink; never the selection tint, foundations §3.9), radius 4; an unknown variable is a `--danger-soft` / `--danger-text` chip (part 2 rule) |
| Meta line | `meta-12` `--text-3`, one line: Trigger number (PhoneText, masked, tabular figures) or batch name and calling hours "10 am to 7 pm IST"; the language name (LanguageMark `name`) "Hinglish · waits 6 s"; lookup source; WhatsApp template and approval; transfer destination. A missing dependency reads in `--danger-text` ("No template chosen") |
| Answer row (Logic: what the caller says) | `--size-answer-row` 28 (**44**, `--size-hit-touch`, on `pointer: coarse` while editing; padding-right then `--space-24`, §6.1), 1 px `--border` top, padding `0 20px 0 12px`; label `label-13` `--text`; examples `meta-12` `--text-3` directly after the label (left-aligned, gap 8, never right-aligned), ellipsis, each example carries its own `lang` (`hi` for Devanagari, `hi-Latn` for Hinglish) |
| Result row (Action: what the tool did) | `--size-answer-row` 28 (**44** on `pointer: coarse` while editing, as answer rows, §6.1), a **lighter top rule**: 1 px `--border` inset 12 px from both edges (answer rows run theirs edge to edge; no dashes, which mean fallback only), padding `0 20px 0 12px`; a leading 12 px result glyph in `--text-3` (`check` on the success result, `x` on the failure result), gap 6; label `data-13` (400) in `--text-2`; **no examples column**. Compact band: glyph + label; Block band: stubs, as answer rows |
| Fallback row | The step's last row (answer or result), on `--surface-2`, bottom radius 7 (concentric), hollow socket until connected |
| Outcome status line | Plain text, no chip: "Lead" `meta-12` `--text-3` · 12 px `arrow-right` `--text-3` · the status word `meta-12` `--text-2` ("Lead → Interested"). The accessible name reads "Sets lead to Interested" (06 §10.4). Migrated End steps: "Choose what this call records" in `--text-3` |
| Badges | Absolutely positioned on the top edge, `right: --space-12`, `translateY(-50%)`, outside the dimmable body. Tag (data-nav §5.2) with the Validation domain word ("2 errors", "1 warning") or "Not connected"; at most two badges (Now + one issue) |

### 5.2 What each type puts in its body

| Type | Summary | Meta | Rows |
|---|---|---|---|
| Inbound call | – | `+91 80 •••• 2210` · calling hours IST | – |
| Outbound batch | – | batch name · calling hours IST, or "No batch linked yet" | – |
| API or webhook | – | "POST /v1/calls · Sample CRM" | – |
| Question | what the agent asks | language · wait time | answers with examples; No reply |
| Branch | "Decides on {{budget}}" | – | cases ("Under ₹80 L"); Else |
| Verify caller | what is checked ("Date of birth against CRM") | attempts "up to 3 tries" | Verified; Failed; No reply |
| Speak | the line | "1 line · Hinglish" | – |
| Knowledge lookup | – | "price-sheet.pdf + 2 files" | result rows: Found; Not found |
| CRM lookup | – | "By phone number · Sample CRM" | result rows: Found; Not found |
| Book meeting | – | "Calendar, then WhatsApp" or "Calendar not connected" (danger) | result rows: Booked; Not booked |
| Send WhatsApp | – | template name · approval ("pending approval" is a warning) | – |
| Transfer to a person | – | "Rep console · any available rep" or a masked number | result rows: Connected; Didn't connect |
| End with outcome | – | the status line "Lead → Interested" (plain text) | – |

### 5.3 Unsupported step

Replaces React Flow's blank default box (F-FLOW-029). Rectangle 240, outlined tile with `circle-help`, phase line "Unsupported step", title = the stored label, meta `Type "ambulance_call" isn't supported` (`--text-3`, the raw type in quotes), one row with a secondary `sm` Button **Convert to…** (Menu: Speak · Transfer to a person · End with outcome, as P2 §7.15; converting keeps the title, the incoming connection and the first outgoing one, as one undo step). Badge "1 error"; the rule is P2 E14; Publish stays blocked until it is converted or deleted. It takes the **error** border (`--danger-border`), not amber, because the rule is an error and colour must match level (P2 §7.15 mentions amber; reconciled in §21.3).

### 5.4 States (mock section 3)

| State | Treatment | Notes |
|---|---|---|
| Default | as §5.1 | |
| Hover (fine pointer) | border `--control`; free sockets show "+" (§6); header cursor `grab` | no lift, no shadow change |
| Selected | header fill `--accent-soft`; border `--accent-mark` + 1 px inset `--accent-mark` ring; `--e2`; sockets `--accent-mark`; its connectors use `--edge-hover` | selection wins the border over issue borders; the badge stays |
| Keyboard focus | `outline: 2px solid var(--focus); outline-offset: var(--focus-offset-node)` (3 px), drawn at 2 screen px at any zoom (outline width `calc(2px / zoom)`) | focus is never shown as selection (F-A11Y-007) |
| Focused and selected | both | |
| Dragging | the step follows the pointer at `--e2`; alignment guides (§10.4) | the palette ghost uses `--opacity-drag` |
| Errors | border `--danger-border`; badge `danger` "2 errors" (`circle-x`) | blocks Publish |
| Warning | border `--warning-border`; badge `warning` "1 warning" (`triangle-alert`) | Publish asks for a tick |
| Unreachable | Full opacity on everything that holds text: `--surface-2` fill, title in `--text`, phase line and meta in `--text-3` (≥ 4.70:1 on `--surface-2`); only the **glyph tile, sockets and its connectors** take `--opacity-unreachable`; hollow input port; badge `danger` "Not connected" (`unlink`) at full strength | an error the author must fix, so it stays fully readable (WCAG 1.4.3; foundations §1.3 rule 2) |
| Required answer not connected | that row's socket `--warning-soft` fill + 1.5 px `--warning-border`, a 20 px stub, examples replaced by "Not connected" in `--warning-text` | counted in the step's errors; the inspector shows the fix |
| Changed since live | phase-line word "Edited" or "New" | only when the draft differs from Live; removed steps appear only in Compare (part 2) |
| Test run: current | 3 px inset `--accent-mark` bar on the left edge + Tag `info` "Now" (`play`) | |
| Test run: reached | a neutral Tag "Reached" with `check` in the badge slot (Full band; `check` alone in Compact and Block) | P2 §13.2 defines when; cleared when the Test panel closes |
| Dimmed (phase emphasis, Find) | `--surface-2` fill; **graphics only** at `--opacity-dim`: the glyph tile, sockets and connectors. Titles, phase line, rows and badges keep full contrast. `opacity` is never set on an element that contains text (foundations §10) | restored on hover and focus |
| Read-only (Review mode, view-only role, locked canvas) | no "+", no hover border, `cursor: default`; sockets still show connection state | |

**Precedence:** border = selection > errors > warning > default. Badges: Now (left) and one issue badge (errors > Not connected > warning); the tooltip and the Issues tab list everything.

### 5.5 Level of detail and the 12 px floor (mock section 4)

Step text is sized in flow units and would shrink with zoom (today 13 px titles render at 9.3 px, and at 3.8 px at fit, F-FLOW-008). Two rules keep it legible:

1. **Bands decide content** (direction §6.5):

| Band | Zoom | Steps show | Also |
|---|---|---|---|
| Full | ≥ 0.75 | everything in §5.1 | edge labels per §7.3; frame headers and notes in full |
| Compact | 0.5 – < 0.75 | tile, phase word, one-line title, answer labels (no examples) or result glyph + label, sockets; badges as icon + count | line boxes 32 flow px, rows 36 |
| Block | < 0.5 (min 0.25) | silhouette and tile in the box; answer and result rows collapse to socket stubs spread on the right edge; the title moves to the **Block label** below | edge labels hidden; frame titles and badges counter-scaled; notes show their first line |

2. **Every text role is clamped inside the node layer:** `font-size: max(var(--type-x-size), calc(12px / var(--zoom)))` with fixed line boxes sized for the band's lowest zoom (Full: 20 px lines and 28 px rows fit 16 px text at 0.75; Compact: 32 / 36). Boxes therefore never change size while zooming inside a band, so React Flow does not re-measure.

3. **`--zoom` is written once per gesture, not per frame.** During a pan, wheel, pinch or animated zoom the text simply scales with the viewport transform (React Flow's one CSS transform; no style is invalidated). `--zoom` is written on the viewport element on **`onMoveEnd`** and whenever the band changes, **quantised down to 0.05** (0.83 → 0.80, so `12px / 0.80` renders at 12.45 px and never below 12). Keyboard and button zooms write it once, when their transition ends. So the floor holds at rest, and a pinch across 150 steps restyles text at most twice (at the band change and at the end), which is what the §12.7 frame budget needs. The glyph tile and phase word survive the Full and Compact bands, and the tile survives Block, so Logic and Action never collapse into identical boxes.

**Block label (large flows readable at Fit).** Below 0.5 the node box is too small to hold a title (a 240 px step is 84 × 35 screen px at 0.35), so the box keeps its silhouette and a 40 flow px glyph tile, and the title is drawn as a **counter-scaled overlay** (`BlockLabel`): it starts just right of the tile, over the box, and runs **140 screen px**, up to **two lines**, `label-12` 600 `--text` on a `--surface-raised` plate with 1 px `--border` and `--radius-4`, prefixed with the stable number in `meta-12` `--text-3` ("#9 Ask about preferred location"). It extends past the box into the rank gap and beyond wherever the next column is clear at that height; where a step in the next column overlaps its height, it stops 8 px before that column. Tidy gives every layer a column of at least `--size-node-action` + `--layout-rank-gap` (240 + 128 = 368 flow px, 129 screen px at 0.35), so even a stopped label is about 100 px: two lines, about 30 characters, and every visible label shows at least 20 characters or the full title. (A wider gap would not help at Fit: when Fit is width-limited, the on-screen column pitch is the canvas width divided by the number of layers, whatever the gap; and 128 still lets a four-layer flow open in the Full band beside the docked inspector.) Where two labels would still collide (dense layers, hand-placed steps), the one with the lower priority hides (priority: selected > focused > has an issue > Trigger and Outcome > call order) and reappears on hover or focus of its step; the step keeps its tile, so it is never an empty box. Labels are `aria-hidden` (the step's name carries the title).

Band changes are instant (no animation) with 0.03 hysteresis to avoid flicker at the thresholds. Selection, focus outline, badges, sockets and Block labels are drawn at constant screen size at every band.

---

## 6. Sockets and ports

### 6.1 Anatomy (mock section 5)

| Part | Rule |
|---|---|
| Output socket | `--size-socket` 10 px circle centred on the right edge of its row (or on the title line for single-output steps). Connected: fill `--socket` with a 2 px `--surface-raised` ring. Free: `--surface` fill, 1.5 px `--socket-border` (`--control`, ≥ 3:1 on every plane). Selected step: `--accent-mark` |
| Input port | 10 px, centred on the left edge on the title line (42 px from the top in the Full band). Hollow while nothing reaches the step; filled once connected. Arrowheads stop 2 px short of it |
| Hit area | **Fine pointer:** `::after` of `--size-socket-hit` 24 CSS px, counter-scaled so it stays 24 screen px wide at every zoom and clipped to its row so neighbours never overlap; the row is 28 flow px, so the target is 24 × 24 from about 0.86 zoom up. **Coarse pointer (editing at ≥ 1024):** answer and result rows grow to `--size-hit-touch` 44 flow px in the Full and Compact bands (the step grows taller; its width is fixed), and the socket's target is the **row end**: the row's full height by `--size-socket-hit-coarse` 44 wide, centred on the socket (22 px inside the step, 22 outside). Adjacent rows' targets abut and never overlap, and the label keeps clear of the target because row padding-right becomes `--space-24`. At 100 % zoom and above that is 44 × 44 CSS px; zooming out scales it with the canvas (44 wide × 44 × zoom tall, still ≥ 24 down to 0.55). **Equivalent paths (WCAG 2.5.8's equivalent-control exception):** wherever a socket's target is under the size for its pointer (fine below about 0.86 zoom, coarse below 100 %, and every Block-band stub), **Connect to…** in the step's `⋯` menu (44 on touch), the inspector's **Go to [step ▾]** selects (32, 44 on touch) and the Outline do the same job. 06 §15.1 and TS-01 list this exception. Review-mode and view-only canvases keep band heights, because their sockets are not targets. **Layout:** Tidy (§9.4) and placement (§8.1) size each step at its touch height, so a flow tidied with a mouse never overlaps on a tablet |
| "+" quick add | on hover or focus of a **free** socket: a 20 px secondary IconButton-style square, `--radius-4`, 12 px beyond the socket, `plus` 14. Opens Add step (§8.4) anchored to the socket |
| Required, not connected | `--warning-soft` fill, 1.5 px `--warning-border`, 20 px stub in `--warning-border`, row text "Not connected" |

### 6.2 Behaviour

| Input | On a free output socket | On a connected output socket | On an input port |
|---|---|---|---|
| Fine pointer drag | draws a new connection (§7.5) | moves the existing connection to a new target (one undo step) | starts nothing (inputs accept only) |
| Fine pointer click (no drag) | opens **Connect to…** anchored to the socket | selects its connection and opens the edge popover | selects the step |
| Coarse pointer tap (≥ 1024 editing) | opens Connect to… (no drag needed) | opens the edge popover | selects the step |
| Keyboard (focused socket) | `C` Connect to… · `A` Add step after · Enter = Connect to… | Enter selects the connection (popover) · `C` change target · Delete disconnects (Undo toast) | – |

**Connect to…** is P2's **ConnectToPopover** (P2 §16.4; Combobox, core §5.3, `--popover-w-list` 400): title "Connect 'Yes' to…", "New step…" first, then steps grouped by phase with glyph, title and "step 5"; the current target marked "(current)"; loops without an exit hinted "Creates a loop"; "Disconnect" last when a target exists. Triggers and the step itself are not offered. Choosing connects, returns focus to the socket and announces "Connected Yes to Book site visit". This part anchors it to the socket (or the step's first free socket) and keeps it clear of the minimap and inspector.

**Accessible name** (a real `<button>`, one per socket, inside the step's group): "Answer Yes of Ask about a site visit, connected to Book site visit" · "Answer Later, not connected. Press C to connect" · "No reply fallback of Ask about a site visit, required, not connected". Sockets are reached with ↑/↓ inside a step (§11), never as separate Tab stops (F-A11Y-028).

---

## 7. Connectors (mock section 5)

### 7.1 Routing and drawing

- **One custom edge type** (`FlowEdge`) for every connection. Orthogonal routing with 8 px rounded corners (`getSmoothStepPath`, `borderRadius: 8`, `offset: 16`), leaving the source socket to the right and entering the input port from the left. Today's default beziers (F-FLOW-021) are removed.
- **Back edges** (to a step in an earlier layer): exit 16 px right, drop 32 px below the lower of the two steps, run left to 16 px before the target, rise and enter. They never pass behind step bodies (F-FLOW-011, Flow C).
- **Fan-in:** connections into the same input share their last run (a common x 24 px before the port), so 12 edges converging on one step read as one trunk (Flow B).
- **Stroke is non-scaling** (`vector-effect: non-scaling-stroke`): 1.5 screen px at every zoom (today 0.71 px on screen). Arrowhead: an 8 × 8 filled marker in the stroke colour, `markerUnits="userSpaceOnUse"`, tip 2 px before the input port; one marker per state colour.
- **Hit target:** React Flow `interactionWidth` 20 screen px (counter-scaled). Connectors sit below steps; the selected connector is raised above other connectors (`--z-raised` within the edge layer).
- No crossing hops or bridges; Tidy minimises crossings. Manual bend points are not in v1 (open question Q5).

### 7.2 States

| State | Stroke | Label | Notes |
|---|---|---|---|
| Default path | 1.5 px `--edge` (3.42:1 on the canvas) | per §7.3 | |
| Fallback path | 1.5 px `--edge`, dash `5 4` | always carries its row label when a label shows | **the only dashed line in the product** |
| Hover | 2 px `--edge-hover` (component alias → `--text-2`) | shown | tooltip after 300 ms: "Ask about a site visit, answer Yes, to Book site visit" |
| Connected to the selected step | 1.5 px `--edge-hover` | per §7.3 | helps trace the selection without adding colour |
| Selected | 2 px `--edge-active` | selection treatment: `--accent-soft` fill, 1 px `--accent-mark`, `--accent-soft-text` | opens the edge popover (§7.5) |
| Invalid | 1.5 px `--danger` | `--danger-text` label with the reason ("Unsupported target") | only imported or AI-drafted flows can contain one; the canvas refuses invalid drops |
| Taken in a test | one trace along the path over `--dur-trace` (480 ms, `stroke-dashoffset` on an overlay path), then 2 px `--edge-active` until the test panel closes | – | reduced motion: no trace, the path is marked at once (foundations §11) |
| Dimmed (phase emphasis, Find) | stroke and marker at `--opacity-dim` (a graphic; no text is ever dimmed) | hidden | |
| Connecting (ghost) | 1.5 px `--edge-active` at `--opacity-drag`, solid | – | follows the pointer from the socket |
| Insert target (dragging a step over it) | 2 px `--edge-active` | Tag `info` "Insert between Book site visit and Visit booked" near the pointer | |

Nothing animates at rest: the `animated` flag is ignored on load and never set (25 of 27 edges animate today, F-FLOW-011, F-A11Y-022).

### 7.3 Labels

A connector from a multi-output step (Logic, lookups, Transfer) carries an **EdgeLabel**: Tag-like, 20 px, `label-12`, `--surface` fill, 1 px `--border-strong`, `--radius-4`, `--text-2`, counter-scaled to stay 12 px on screen. Text is the answer label ("Yes", "Later", "No reply", "Else", "Not found"), never a position ("TRUE ↓").

A label shows in exactly three cases; every render and mock follows this table (no label on every edge, no label on none):

| Show the label when | Where |
|---|---|
| **Long branch edge:** the connector skips at least one layer, runs back to an earlier layer, or its source row is scrolled off-screen, so the row label beside the socket can't be read from the target | centred on its longest horizontal run |
| **Hover or selection:** the connector is hovered, selected, or its socket has focus | same; if the run is short, just past the socket |
| never in the Block band, or when "Show connection labels" is off (View options) | – |

A connector to the next layer never carries a resting label: the answer or result row beside its socket already says it (clutter rule), and with `--layout-rank-gap` 128 such runs are short. Overlapping labels slide 8 px along their run; if there is no room the later one hides (the row label remains).

### 7.4 Theming

Connectors, labels and markers read tokens only, so dark mode follows `data-theme`. React Flow's `colorMode` is bound to the resolved theme (today the root keeps `light` in dark mode, F-FLOW-036). Forced colours: strokes `CanvasText` (`data-edge`), dashes kept, the selected connector `Highlight`.

### 7.5 Creating and editing connections

- **Drag from a free socket.** Valid targets are the input ports of Logic, Action and Outcome steps other than the source. Within 24 screen px of a valid port it grows to 14 px with a 2 px `--accent-mark` ring; dropping anywhere on a valid step's body also connects to its input (forgiving target). Triggers and the step itself show `cursor: not-allowed`. Dropping on empty canvas opens Add step (§8.4) at that point, already connected. Esc cancels. Near the canvas edge (48 px band) the view auto-pans.
- **Drag from a connected socket** moves that connection to a new target (one undo step).
- **Self-connections are refused.** Retries are a setting on the fallback row ("asks again up to 2 times"), shown on the row, not a loop edge.
- **Edge popover** (Popover, overlay §5; opened by clicking a connector or its label, or Enter on a connected socket): header "Yes, to Book site visit" (`label-12` `--text-3`), then **Insert step…** (Add step, inserting between) · **Change target…** (`C`, Connect to…) · **Delete connection** (`Delete`, danger text, Undo toast). Esc closes and returns focus to the socket.
- Every connection change is announced ("Connected Later to Callback set", "Disconnected Yes") and is one undo step.

### 7.6 Accessibility

Connectors are drawn in an `aria-hidden` SVG and are not in the tab order (today 27 of 53 tab stops, F-A11Y-028). Their meaning is exposed through the sockets' names (§6.2) and the steps' names ("Answers: Yes goes to Book site visit; Later goes to Callback set; No reply goes to No answer"). React Flow's edge `ariaLabel` is still set from titles for browse-mode reading, never from ids.

---

## 8. Adding steps and the palette (mock section 6)

### 8.1 Every way to add a step

| Method | Placement | Connection | Afterwards |
|---|---|---|---|
| Palette click or Enter | After the selected step (next layer, aligned to the source socket) or, with nothing selected, the nearest free cell to the viewport centre | From the focused socket, else the selected step's first free output (answers in order, fallback last) | New step selected and panned into view; inspector opens |
| Palette drag | Where it is dropped, snapped to 16 px, nudged to the nearest free spot if it overlaps | None, unless dropped on a connection or a free socket | same |
| Drop onto a connection | Beside the connection's midpoint, clear of other steps | Splits it: source → new step → old target (first output) | same |
| "+" beside a free socket, or `A` | Next layer, aligned to that socket | From that socket | same |
| Connect to… → "Add a new step…" | as "+" | from the socket | same |
| Canvas context menu "Add step here…" | at the pointer | none | same |
| Paste, Duplicate | §10.2 | internal connections kept | pasted steps selected |
| Pattern (palette) | as a palette click | pre-wired inside; its entry connects like a single step | one undo step |

**Placement never overlaps.** Each candidate box (sized at its touch height, §6.1, plus a 24 px margin) is tested against every step, frame and note; the search walks down then up the target column in 16 px steps and falls back to below the lowest step in that column. Existing steps are **never moved automatically** (only Tidy moves steps, on request). Successive adds with nothing selected cascade +32/+32.

**Focus after adding:** keyboard adds move focus to the inspector's title field with its text selected (Esc returns to the new step); pointer adds keep focus on the canvas so the user can keep adding. Announcement: "Added Speak 2 after Ask about a site visit, connected from Later." When nothing could be connected: "Added Speak 2, not connected. Press C to connect."

### 8.2 Palette (StepPalette, left panel)

| Part | Spec |
|---|---|
| Header | "Add step" `title-16` + IconButton close ("Close Add step", Esc) |
| Search | SearchInput `sm`, placeholder "Search steps…", Kbd `/` hint; `/` focuses it while the panel is open |
| Recently used | One row, fixed 32 px height, up to 4 compact buttons (20 px tile + short name, 1 px `--border-strong`, `--radius-6`); before the first add it reads "Steps you add appear here." in `--text-3`. The list below never jumps (F-FLOW-035) |
| Groups | Trigger · Logic · Action · Outcome · Patterns · Canvas (Note, Frame). Header: 20 px phase tile, name `label-13`/600, description `meta-12` `--text-3`, chevron; Radix Collapsible, open state remembered per user. Trigger starts collapsed when the flow already has one |
| Item | min-height 44, padding `4px 8px`, `--radius-6`: 24 px tile, name `label-13` `--text`, the registry's palette description (P2 §7.2) in `meta-12` `--text-3` (wraps, never truncates). Hover `--surface-2`; focus ring inset; `cursor: grab`. The dragged item stays in place at `--opacity-drag` |
| Outcome items | Presets of End with outcome, listed directly so the choice is one click: Interested · Callback · Not interested · No answer · Transferred · Do not call · Failed. Each inserts `outcome.end` with that outcome and its default lead status (P2 §7.14), shows its tone tile, and is described "Sets lead status to Interested" |
| Patterns (v1) | "Ask, retry once, then end as No answer" · "Look up, with a not-found reply" · "Book, then confirm on WhatsApp" · "Recording disclosure" (content needs the product owner, Q3). Each passes validation (CI) |
| Footer | `meta-12` `--text-3`: "Drag onto the canvas or a connection, or press Enter to add after the selected step." |
| No results | EmptyState compact: "No steps match 'refund'. Try 'transfer' or 'ask'." + Clear search |

Search matches names, descriptions and a synonym list kept in the registry (transfer, handoff, human, agent → Transfer to a person; sms, message → Send WhatsApp; if, condition, rule → Branch; faq, docs, pdf → Knowledge lookup; end, hang up → Outcome), keeping today's synonym strength (00-summary §4). The same synonym list powers Connect to… and the Outline filter (P2 §0.3). Results show flat, each with its phase tile.

Markup: each group is a `<section>` with a heading; items are `<button>`s in a `<ul>` named "Add Question step. Ask, then branch on the answer." Drag uses pointer events with an HTML5 drag-and-drop fallback, mapped through `screenToFlowPosition` (F-FLOW-009).

### 8.3 Drag ghost

While dragging from the palette, a ghost of the real step (the Full-band silhouette of that type, default title "Send WhatsApp 2") follows the pointer at `--opacity-drag` and `--e2`, snapped to the grid. Over a connection, the connection turns `--edge-active` and a Tag `info` "Insert between A and B" follows the ghost. Over a free socket, the socket rings in `--accent-mark` ("Connect from Later"). Esc cancels.

### 8.4 Add step picker (StepPicker)

Opened by "+", `A`, "Add step here…", "Insert step…" or a drop on empty canvas. Popover (overlay §5) 300 px, anchored to the socket or point:
- SearchInput autofocused, placeholder names the anchor: `Add after "Later"…` / `Insert between Book site visit and Visit booked…`.
- **Suggested** (up to 4, from registry rules): after an answer, Speak, Question and the Outcome whose name matches the answer ("Later" → End as Callback); after Speak, Question and End. Then the phase groups, then **Connect to an existing step…** (`C`).
- Footer: "Adds the step after "Later", already connected." ↑/↓ choose, Enter adds, Esc closes and returns focus to the anchor.
- Below 1024 it never opens (Review mode is read-only).

---

## 9. Canvas controls

### 9.1 Zoom and pan

**CanvasControls** (bottom-left, 12 px inset, `--z-chrome`): ButtonGroup `attached` on `--surface-raised`, 1 px `--border-strong`, `--e1`, 30 px tall:
`[−] [85%] [+]` · `[Fit]` · `[map] [⋯]`

| Control | Behaviour |
|---|---|
| Zoom out / in | ×1.25 steps between 25 % and 200 %; tooltips with Kbd `−` / `+` (single keys, canvas focused) |
| Zoom % | Button tertiary, `tabular-nums`; opens a Menu: 50 %, 75 %, 100 % (⇧0), 150 %, 200 %, separator, Fit flow (⇧1), Fit selection (⇧2) (F-FLOW-008) |
| Fit | Fits every step with 48 px padding plus the overlays (minimap width when shown, controls height) |
| Minimap | IconButton `map`, `aria-pressed`; ≥ 1280 only |
| View options (`⋯`) | Menu with checkbox items: Snap to grid ✓ · Show connection labels ✓ · Show changes since live ✓ · Show call data (hidden until data exists, §12.6) · Lock canvas · Scroll to zoom · then Keyboard shortcuts… |

**Pan and zoom input:** drag on empty canvas pans; Space + drag pans anywhere; the wheel pans (Shift + wheel pans sideways); ⌘/Ctrl + wheel and trackpad or touch pinch zoom around the pointer. "Scroll to zoom" in View options restores today's wheel-zooms behaviour. `panOnDrag` and `zoomOnPinch` are set explicitly and tested on iOS and Android (F-RWD-014). Browser zoom (⌘/Ctrl + / −) is never intercepted.

### 9.2 Viewport on open and on resize

Restore the viewport saved for this user and flow (`localStorage` `vaani:flow:<id>:viewport`, never written to the flow, D9). Without one: fit to content clamped to 75–100 % (the Full band); if the flow does not fit at 75 %, open at 75 % anchored on the first Trigger (left edge, vertically centred), with the minimap showing the rest. A flow with **more than 20 steps** at ≥ 1280 also opens with the Outline docked in the left panel (§3.2 laptop exception, §12.3), so the whole call path is readable as text beside the canvas from the first second. Switching flows never keeps the previous transform (F-FLOW-012). A debounced ResizeObserver keeps the selected step (or the viewport centre) in place when panels open, close or the window resizes (F-RWD-014).

### 9.3 Minimap (≥ 1280)

176 × 112 (`--size-minimap-w`, `--size-minimap-h`, new), bottom-right, 12 px inset, `--surface-raised`, 1 px `--border-strong`, `--radius-6`, `--e1`. Steps are `--radius-2` blocks in `--border-strong`; Triggers `--ink-tile`; steps with errors `--danger`; frames their `-border` tint. The viewport is a 1.5 px `--accent-mark` rectangle with **no mask** (today a grey slab, F-FLOW-023). Click or drag pans; wheel zooms. `aria-hidden="true"` and not focusable: Fit, Find and the Outline are the keyboard equivalents (F-A11Y-028). Default on; the toggle is remembered per user (`vaani:flow:minimap`); it auto-hides when the canvas is narrower than 640 px, and fit and auto-pan never place the selection under it.

### 9.4 Grid, snap and Tidy

- **Grid:** React Flow Background, dots, gap 16, size 1, colour `--canvas-dot`. Below 0.4 zoom the dots are hidden (they would become noise).
- **Snap:** `snapToGrid` 16 × 16 on drop. Holding Alt places freely and hides guides.
- **Tidy** (header button; `⋯` below 1280; "Tidy selection" for ≥ 2 selected): ELK layered, direction right, layer spacing 128 (`--layout-rank-gap`) with every layer at least 240 wide (`--size-node-action`, so Trigger layers of 208 px steps get the same column pitch and Block labels have room, §5.5), step spacing 24 (`--layout-node-gap`) measured between steps at their **touch height** (answer and result rows counted at 44, §6.1), so a flow tidied with a mouse never overlaps when it opens on a touch tablet (with a fine pointer this reads as up to 16 px more space per row below multi-answer steps; hand-placed overlaps raise the Overlap notice below), Triggers in the first layer, Outcomes in the last, frames as compound nodes so members stay together, notes keep their offset from their nearest step. Steps move with a `transform` transition over `--dur-slow` (instant under reduced motion). One undo step; toast "Tidied 26 steps · Undo". Tidy never runs on its own.
- **Overlap notice:** if two step boxes intersect when a flow loads, an inline Notice (info) at the top of the canvas reads "2 steps overlap. **Tidy** · Dismiss". Nothing moves until the user chooses (F-FLOW-021).
- **Old top-down flows** (the 16 existing flows): Notice "This flow is laid out top to bottom. **Re-layout as draft**" runs Tidy on the draft; publishing it follows part 2 (direction §6.5 migration).

### 9.5 Lock

"Lock canvas" (View options, `menuitemcheckbox`) stops dragging steps and starting connections by drag; Connect to…, Go to selects and the inspector still work. A neutral Tag "Locked" with an Unlock button joins the controls cluster; Tidy is disabled with the reason "Unlock the canvas to tidy." Lock is per user and session, never stored in the flow.

---

## 10. Selection, clipboard and arranging (mock section 9)

### 10.1 Selecting

| Input | Result |
|---|---|
| Click a step, or Space on the focused step | Selects only it; `?node=<stepId>` in the URL (F-UX-031) |
| Shift, Ctrl or ⌘ + click, or Shift+Space on the focused step | Toggles that step in the selection (all three keys, F-FLOW-024). The keyboard pair mirrors the pointer pair and is defined once in 06 §9.6 |
| Shift + drag on empty canvas | Marquee: 1 px `--accent-mark` border over an `--accent-soft` region at 0.6 opacity; selects every step, note and frame it touches |
| ⌘/Ctrl + A | Selects all steps, notes and frames |
| Esc, or click on empty canvas | Clears; focus stays where it was |

**Selection bar** (BulkBar, data-nav §7.10, canvas variant; floats bottom-centre, `--z-float`), shown for ≥ 2 selected: "3 steps selected" (", 1 note" when relevant) · Frame (⌘G) · Align ▾ (left, centre, right, top, middle, bottom; distribute horizontally or vertically from 3) · Duplicate (⌘D) · `⋯` (Copy, Cut, Tidy selection, Delete 3 steps) · Clear. **Deviation from BulkBar:** there is no Neel primary, because arranging commits nothing. The count change is announced ("3 steps selected").

### 10.2 Clipboard

- **Copy** ⌘C: selected steps with their internal connections, frames and notes, as versioned JSON with the source flow id. **Cut** ⌘X: copy + delete with Undo.
- **Paste** ⌘V: at the pointer if it is over the canvas, else the nearest free spot to the viewport centre. Titles that already exist get " (copy)"; ids are fresh and each pasted step gets the next unused stable number (D7), never the source's (F-FLOW-026). Connections to steps outside the selection are dropped and announced ("Pasted 3 steps. 2 outside connections not copied."). Pasting into another flow works; unknown variables become validator errors.
- **Duplicate** ⌘D: copy and paste at +32/+32 with internal connections; the duplicates become the selection.

### 10.3 Deleting

Delete or Backspace deletes the selection with no dialog and an **Undo toast** ("Deleted 'Polite close' and 2 connections · Undo"; consecutive deletes coalesce, overlay §9.2). The inspector closes (no ghost panel, F-FLOW-025); focus moves to the step before it on the path, else the next one, else the first Trigger, never `<body>`; announced "Deleted Polite close". **Delete and reconnect** (Alt + Delete, step menu) exists when the step has exactly one incoming and one outgoing connection and joins them. The last Trigger can't be deleted: Delete is `aria-disabled` with the reason "A flow needs a trigger. Add another trigger first." (P2 §0.3). Deleting the last Outcome is allowed and becomes a validator error.

### 10.4 Moving and aligning

Drag moves (one undo entry per drag end). While dragging, **guides**: 1 px `--accent-mark` lines when the step's left, centre, right, top, middle or bottom lines up with a visible step within 4 screen px; guides take precedence over the grid. From the keyboard, **Alt + Arrow** moves the focused or selected steps by 16 px and Alt + Shift + Arrow by 64 (Alt + Arrow means "move" everywhere in the product: here, in the Outline, and in the answer and case lists); **Move mode** (`M`, or step menu › Move step, then click where it should go) is the announced, single-pointer alternative (06 §16.1). Both are one undo step; the key map is 06 §9.6. Dragging a step onto a frame's body adds it to the frame (the frame border turns `--accent-mark` while it is a target); dragging it out removes it.

### 10.5 Context menus

ContextMenu (overlay §7) on right-click, Shift + F10 or the context key; every item also exists elsewhere.

| On | Items |
|---|---|
| Step | Open (Enter) · Add step after (A) · Connect to… (C) · Duplicate (⌘D) · Copy · Cut · Add to frame ▸ · Convert to… (same phase; any type for Unsupported) · separator · Delete and reconnect · Delete |
| Canvas | Add step here… · Add note here · Paste here · Select all · Tidy · Fit |
| Frame | Rename · Colour ▸ (None, Neel, Teal, Ochre, Rose, Slate) · Collapse / Expand · Ungroup · separator · Delete frame (keeps steps) · Delete frame and 6 steps |
| Note | Edit · Duplicate · Delete |

Destructive items sit after a separator in `--danger-text` (F-FLOW-019); all are undoable.

---

## 11. Keyboard (mock section 11)

### 11.1 Model

**The canvas key map is `06-accessibility` §9.6, and only there.** This part, P2 §16.5 and the `?` sheet reference it; none restates it. Every key is registered once in the `ShortcutProvider` registry (06 §8.2, §8.4), which generates the `?` sheet and `aria-keyshortcuts`, and a lint test fails the build when two bindings share a key within one scope (06 §8.4). Modifiers follow the platform through Kbd (core §7.3): ⌘ and ⌥ on macOS, Ctrl and Alt elsewhere.

- **The canvas is one tab stop** with a roving tabindex. Tab enters at the last focused step, or the first Trigger on first entry; Shift+Tab leaves. Roving order is **call order** (D7), then unreachable steps, then frames and notes in reading order; the step's accessible name states its position ("step 3 of 14 in call order") next to its stable number.
- **Focus follows into view:** moving focus to an off-screen step pans it into view (`--dur-slow`; instant under reduced motion) without changing zoom, and never under the inspector, minimap, Find bar or Problems panel.
- **Sockets** are reached with ↑/↓ inside a focused step; they are not separate tab stops.
- **Single-key shortcuts** (A, C, M, O, V, T, +, −, Shift+1, Shift+2, Shift+0, ?, and `]` / `[` in compare mode) are ignored while typing, are listed with a "single key" mark, and stop working when the account setting turns them off (F-A11Y-004). Every one has a visible button too (P5). Browser zoom keys are never intercepted. While the designer is open (shell focus mode) the shell's `[` sidebar key is suppressed; the rail overlay stays available from its expand button (shell §3.8).

### 11.2 Keys this part implements

The meanings are 06 §9.6's; this part implements the spatial rows and draws their feedback:
- **Navigate:** Home · End (first Trigger · last step in call order); ⌘/Ctrl+F Find (§12.2).
- **Arrange:** Alt+Arrow and Alt+Shift+Arrow nudge the selection 16 / 64 px; `M` Move mode (§10.4); ⌘/Ctrl+D duplicate; ⌘/Ctrl+C · X · V (§10.2); ⌘/Ctrl+G · ⌘/Ctrl+Shift+G frame and ungroup; Alt+Delete delete and reconnect (§10.3).
- **Select:** Space selects only the focused step, Shift+Space toggles it (§10.1); ⌘/Ctrl+A; Esc clears (a second Esc clears phase emphasis); Shift+F10 menus (§10.5).
- **View:** `+` · `−` zoom; Shift+1 · Shift+2 · Shift+0 fit flow, fit selection, 100 %; Space+drag pans (pointer).
- **Issues** (next / previous) are **Alt+.** and **Alt+,**, matched by `KeyboardEvent.code` (Period, Comma) so macOS Option characters don't break them; Alt+Arrow is never used for issues. P2 §12.4 owns what they do.

### 11.3 The `?` sheet

The shared sheet (Dialog `lg`, shell §10; portalled to `<body>`, focus moved in and returned, max 80 vh with internal scroll, F-A11Y-027, F-FLOW-024) opens on its **Flow Designer** tab when called from the designer. Groups: Navigate · Edit · Select · View · Test, two columns at ≥ 768, one below; only keys that work are listed. A **Legend** tab teaches the grammar: the four silhouettes with their tiles and phase descriptions, `─ Path` and `┄ Fallback`, the issue badges (errors, warning, Not connected), and Now and Reached (risk mitigation for monochrome steps, direction §10). Phones never show keycaps; the sheet stays reachable from Help for external keyboards.

---

## 12. Large flows (mock section 7)

Validated against Flow A (26 steps) and Flow B (35 steps, 47 connections, 12 converging on one step).

### 12.1 Getting around

| Need | Tool |
|---|---|
| See the whole flow | Fit (⇧1): the Block band shows silhouettes, tiles and two-line Block labels (`#n` + title, ≥ 140 px, §5.5); frames summarise groups; flows over 20 steps also open with the Outline docked at ≥ 1280 (§9.2) |
| Jump to a known step | Find with "#9", "9", "step 9" or a title; the Outline; Go to step from any issue; `/flows/<id>?node=<stepId>` deep links select and centre |
| Follow one phase | Phase ruler emphasis (§4.4) |
| Keep orientation while zoomed in | Minimap (≥ 1280); Home and End |
| Keep a region tidy | Frames, Tidy selection, snap and guides |

### 12.2 Find

**FindBar** (new, §20.1): top-right of the canvas, 12 px inset, width `--size-inspector` 320, `--surface-raised`, 1 px `--border-overlay`, `--radius-8`, `--e2`, `--z-chrome`. Opened by ⌘/Ctrl+F or the tool rail; separate from the palette's step search (direction §6.5).

| Part | Rule |
|---|---|
| Field | SearchInput `sm`, autofocused, text selected on reopen; placeholder "Find steps…" |
| Count | "2 of 5" in `meta-12` `--text-3`, `tabular-nums`, `aria-live="polite"` (announces "2 of 5 matches" after typing pauses) |
| Previous · next | IconButtons `chevron-up` / `chevron-down` ("Previous match", "Next match"); Shift+Enter / Enter in the field |
| Options | Menu: search in Titles ✓, What the agent says ✓, Answers and examples ✓, Variables ✓, Notes ✓; Only one phase ▸ |
| Close | IconButton `x`, Esc; focus lands on the current match (never `<body>`) |

Behaviour: matching is debounced by `--timing-validate-debounce`, case- and accent-insensitive, and uses the registry synonyms. Non-matching steps, notes and connectors dim to `--opacity-dim`; matched words get `<mark>` (`--text-selection`) in the Full band. The current match gets the focus ring and is panned into view; below 0.5 zoom the view zooms to 0.75 around it so it can be read. A match inside a collapsed frame shows "1 match" in the frame summary and expands the frame while it is current. "#9", "9" or "step 9" jumps straight to the step whose **stable** number is 9 (D7), and a query matches both numbers and titles ("9" also finds "Site visit 9 am"; the numbered step is listed first). No results: the count reads "No matches" and the canvas is not dimmed.

### 12.3 Outline (placement and sync)

The Outline's structure and editing are P2 §16 (FlowOutline). This part places it: the left panel (`--size-left-panel` 280) at ≥ 1024 (opened and docked on load for flows over 20 steps at ≥ 1280, §9.2), toggled by `O`, the tool rail or the Problems bar; the left column of Review mode at 768–1023 (`--size-left-panel-tablet` 320); the main view below 768 (§3.2). Selection is shared: selecting a row selects and pans to the step (keeping zoom); selecting on the canvas highlights the row (`--accent-soft` + 2 px inset `--accent-mark`) and scrolls it into view; hovering a row gives its step the hover border. Frames and notes do not appear in the Outline in v1 (it is the call path, not the drawing).

### 12.4 Frames

A frame groups steps visually and can collapse. Frames are flow content saved in the Draft but never compiled into the agent's script, never validated and never counted in the phase ruler.

| Aspect | Rule |
|---|---|
| Look | `--frame-{neel,teal,ochre,rose,slate}` fill with its `-border` (foundations §3.6) or **None** (transparent, 1 px `--border-strong`), `--radius-8`, 16 px padding around members, drawn under steps and connectors. The low-chroma tints are the pressure valve for "we want colour back" (direction §3.2); they never mean state |
| Header | 32 px: collapse IconButton (`chevron-down` / `chevron-right`), title `label-13`/600 `--text` (≥ 15:1 on every tint), count "6 steps" `meta-12` `--text-3`, `⋯` menu. Counter-scaled so it stays readable in the Block band |
| Create | ⌘/Ctrl+G on a selection, the selection bar, the palette's Canvas group, or the canvas menu. Default title "Frame 1" with the title field in edit mode |
| Membership | A step belongs to at most one frame (no nesting in v1). Dragging a step onto a frame adds it; dragging it out removes it. The frame's bounds hug its members; moving the frame moves them. Frames never overlap: a drop that would overlap is placed beside |
| Collapse | A view preference stored per user (like the viewport), so collapsing never dirties the draft. A collapsed frame is a 240 px block: header, summary "6 steps · 1 warning" (member issues roll up, errors first, with the same badge rules as steps), one input port if any connection enters, and one exit socket per distinct outgoing connection, labelled with its target ("To Visit booked"). Connections re-route to these ports |
| Tidy | Frames are ELK compound nodes: members stay together |
| Keyboard | The header is in the roving order before its members; Enter toggles collapse; `aria-label` "Frame Qualification, 6 steps, collapsed" on a `role="group"` |

### 12.5 Notes

A note is a comment on the canvas, not a step (replaces nothing today; F-FLOW-017 asks for sticky notes).
- 220 px wide (drag-resizable 200–320), `--surface-2`, 1 px `--border`, `--radius-6` (smaller than a step's 8, so it never reads as a step), no shadow, no sockets, padding 8 × 10.
- Header `meta-12` `--text-3`: `sticky-note` icon · "Note" · author · relative time. Body `data-13` `--text`, plain text up to 500 characters, links detected.
- Dropped within 24 px of a step, a note **pins** to it ("Pinned to step 4" in its menu) and moves with it, including through Tidy.
- Saved in the Draft; never compiled, validated or counted; included in Find (option), copy and paste, and JSON export. In the Block band only the first line shows. Threaded comments with mentions are v2 (they need presence and notifications, Q6).

### 12.6 Per-step call data (v1.1, hidden until the data exists)

"Show call data" in View options adds a meta line to each step ("Reached by 82 % · 1,204 calls") and a share to each answer row ("46 %"), from calls on the Live version over the last 30 days, with the scope stated in the phase ruler ("Live v7 · last 30 days"). Drop-off is written as text ("18 % hung up here"), never as a heat colour. Test calls are excluded. Hidden, not simulated, until per-step analytics ship (P1; F-FLOW-017 item 5).

### 12.7 Performance budget

- React Flow `onlyRenderVisibleElements`; memoised step components; the Block band renders 3 elements per step and drops connector labels.
- `--zoom` is written to the viewport element only on `onMoveEnd` and on band changes, quantised down to 0.05 (§5.5 rule 3); during a gesture text scales with the transform, so no per-frame style invalidation reaches the visible steps. LOD band changes are the only re-render triggered by zoom.
- No `getBoundingClientRect` during render; `user-select: none` and `inert` on side panels while dragging.
- Rules run in a Web Worker above 60 steps (P2 §24).
- Targets: 60 fps pan and zoom with 150 steps on a mid-range office laptop (integrated graphics, 1366 × 768), measured with the level-of-detail clamp active; with 4× CPU throttling a pinch from 1.0 to 0.25 on 150 steps keeps ≥ 50 fps with no long task over 50 ms; a 35-step flow interactive within 1.5 s of its data arriving.

---

## 13. Empty canvas and new-flow templates (mock section 8)

### 13.1 PhaseStrip on every starting point

The `/flows/new` form is P2 §15.3. Each starting point there (Blank, Site visit, Lead qualification, EMI reminder, COD confirmation, Appointment, Support FAQ) shows a **PhaseStrip** that this part defines, so templates are recognisable in the same visual grammar as the canvas:
- A row on `--surface-2` (`--surface` inside the selected RadioCard), `--radius-6`, padding 8: up to four path steps (the Trigger, the first Logic step, the key Action, the happy-path Outcome), each a 20 px glyph tile + step name in `label-12` `--text-2`, joined by a 12 px `arrow-right` in `--text-3` (the phase ruler's separator, §4.4; never `chevron-right`).
- Names truncate at 120 px with an ellipsis; below 480 px the strip shows tiles only plus "10 steps".
- The strip is `aria-hidden`; the card's description carries the words ("Inbound call, then Ask about a visit, Book visit, Visit booked").
- **Preview** opens a Sheet `detail` (560) with a read-only canvas of the template at Fit in the Compact band, the phase ruler counts, and "Use this template" (selects the RadioCard and closes).

### 13.2 First open of a new flow

- **From a template:** Fit (clamped to the Full band where possible), the first step after the Trigger selected and its inspector open, and P2's Test hint. The template was instantiated against this workspace (P2 §15.3), so the issues chip reads "No issues" (or "1 warning" for W08 when the workspace has no inbound number yet).
- **From Blank:** a Trigger connected to an Outcome (End with outcome, neutral tile, "Choose what this call records") at 100 %, with the Add step panel open at ≥ 1440. The Trigger follows the same workspace rule as templates (P2 §15.3): an Inbound call bound to the workspace's only verified, unbound number, otherwise an Outbound batch. The issues chip reads **"No issues"**; nothing is red before the author has done anything. (If the Q2 rule for an unset outcome ships, it is the warning "Choose what this call records", never an error.) This is the only first-use design: P2 §17 and `05-responsive` §10.8 reference it.
- The connection carries a 20 px **"+" insert button** at its midpoint and, 16 px below, the **empty-state card** (EmptyState region variant, overlay §15, 352 px, `--surface`, 1 px `--border-strong`, `--radius-8`, `--e1`):
  - Title: "What happens when the call connects?"
  - Body: "Add the first step. Most flows greet the caller, then ask one question."
  - Actions: **Add Speak** · **Add Question** (secondary) · link **All steps** (opens the palette). Both buttons insert between the Trigger and the Outcome, connected on both sides, and select the new step.
  - The card is in the roving order right after the Trigger. It disappears once the flow has more than two steps and never returns.
- A flow with no steps at all (only possible through a broken import, because the last Trigger can't be deleted) shows EmptyState "This flow has no steps. Add a trigger to say how calls start." with **Add trigger…** (opens the palette on the Trigger group).

### 13.3 Templates are tested (F-FLOW-013)

CI loads every template, runs the shared rule set (zero errors, zero warnings in isolation), compiles it (no "undefined" or "null" in the agent script), checks that every path reaches an Outcome, and checks that Tidy is stable (running it twice moves nothing). It then **instantiates every template in a fixture empty workspace** (no numbers, no calendar, no WhatsApp, no knowledge) through the real create path (P2 §15.3): each must open with 0 errors and at most W08. A failure blocks the build. Today's New-flow template fails validation and prints "Duration: undefined minutes".

---

## 14. States of the canvas, with copy

| State | What the canvas shows | Copy |
|---|---|---|
| **Loading** | Shell and Flow header render at once (name if known from the list); SaveState and VersionChip hidden; after 200 ms the "Flow canvas" skeleton (overlay §13.2): dot grid and four static silhouettes, no edges, no text; editing and autosave off until hydrated. Never today's default-template flash (F-FLOW-037) | Hidden status line: "Loading Site-visit qualifier…" |
| **First use** (blank flow) | §13.2: Trigger connected to Outcome, the "+" and the empty-state card; issues chip "No issues" | "What happens when the call connects?" |
| **Partial: rules running** | IssuesChip "Checking…"; step badges keep their last result until the new one arrives | "Checking…" |
| **Partial: unsupported steps** | Unsupported step components (§5.3) | "Type "ambulance_call" isn't supported" |
| **Partial: overlapping or top-down layout** | Inline Notice (info) at the top of the canvas (§9.4) | "2 steps overlap. Tidy · Dismiss" / "This flow is laid out top to bottom. Re-layout as draft" |
| **Error: load failed** | SectionError (overlay §16) filling the canvas; header keeps the name if known | "Couldn't load this flow. Check your connection and try again." **Retry** · Back to Flows |
| **Not found** | In-shell NotFound | "This flow doesn't exist or was deleted. **Go to Flows**" |
| **Interim I1** (before revisions ship) | Header per §3.3 (`Draft on this device · 3 changes ▾`, `Saved on this device 11:24 am`, `Saved flow`); live note per §4.4; no request is sent until Publish (P2 §4.9). Browser storage unavailable: SaveState `Not saved · this tab only` (danger), `beforeunload` registered, Publish stays available | "Edits stay on this device until you publish. Callers hear the saved flow." |
| **Offline** | ConnectionBar (shell) and SaveState "Offline · 3 edits on this device" (P2 §4.7; the one offline string). With the local draft queue: editing continues. Without it: the canvas turns read-only with an inline Notice | "You're offline. Editing is paused so nothing is lost. It resumes when you reconnect." |
| **Permission: view only** (FD12) | Read-only canvas: no palette, no "+", no drag, no Tidy; the inspector is read-only; Publish hidden; Tag `outline` "View only" in the header | "You can view this flow. Ask Asha R. (admin) to change it." |
| **Permission: another user's Only-me flow** | Forbidden (overlay §16) in the shell | "This flow is private to its owner." |
| **Conflict** | SaveState "Changed elsewhere · Review" (P2 §4.6); the canvas stays as you left it until you choose | per P2 |
| **Viewing an old version** (`?v=5`) | Read-only canvas; P2's bar says which version | per P2 |
| **Compare with live** | Added and changed steps as P2 §4.5 (Tags "Added", "Changed"); removed steps are ghosts placed where they were in Live: `--surface-2` fill, solid 1 px `--border-strong` (never dashed), text at full contrast, only the glyph tile and sockets at `--opacity-unreachable`, Tag `danger` "Removed" | per P2 |
| **Locked** | §9.5 | "Unlock the canvas to tidy." |
| **Test running** | Now and Reached marks, taken connectors (§5.4, §7.2); editing stays allowed | per P2 §13 |
| **Success feedback** | Announcements for add, connect, disconnect, move (on drop: "Moved Book site visit"), paste, selection count; toasts only for undoable deletes and Tidy | "Added Speak 2 after Ask about a site visit, connected from Later." · "Deleted 'Polite close' and 2 connections · Undo" · "Tidied 26 steps · Undo" |

---

## 15. Microcopy: before → after

| Today | After | Where |
|---|---|---|
| "Flow Builder" / "VOICE JOURNEY WORKSPACE" | "Flows / Site-visit qualifier" | header |
| Green dot + "Canvas" + "Drag nodes, connect handles, double-click to edit, press ? for shortcuts." | Removed. Blank flows get one sentence (§13.2); every control has a tooltip; the `?` sheet lists what works | canvas card |
| "26 nodes" · "27 links" | "Trigger 2 → Logic 8 → Action 12 → Outcome 4" (one connected bar, `arrow-right` icons) | phase ruler |
| "FLOW VALIDATED" (pulsing, permanent) | "No issues" · "1 warning" · "2 errors · 1 warning" · "Checking…" (computed, P2) | IssuesChip |
| "Add steps" · "PICK A TOOL, THEN CONNECT IT" · "+ 10" | "Add step" · footer "Drag onto the canvas or a connection, or press Enter to add after the selected step." | palette |
| "START HERE" · "CONVERSATION" · "ACTIONS" · "KNOWLEDGE & CRM" · "RECENTLY USED" | "Trigger · When a call starts" · "Logic · Listen and decide" · "Action · Do something for the caller" · "Outcome · How the call ended" · "Recently used" | palette groups |
| "Search nodes..." | "Search steps…" | palette |
| "Knowle…", "CRM Lo…", "WhatsA…" (truncated tiles) | Full names with a one-line description, never truncated | palette items |
| "New Speak Node" | "Speak 2" | default title |
| "Start Call" pill | "Inbound call" / "Outbound batch" capsule | Trigger |
| "End Call" pill | "End with outcome" capsule, e.g. "Visit booked" with the status line "Lead → Interested" | Outcome |
| "YES ↓" · "NO →" · "TRUE ↓" · "FALSE →" (10 px mono chips) | Answer rows "Yes · haan, zaroor · हाँ", cases, "Else", "No reply · after 6 s" | Logic steps |
| "On no_match…" (a helper note; the result paths themselves are unlabelled handles) | Result rows "✓ Found" · "✕ Not found" (glyph + plain label, no examples) | lookups, Book meeting, Transfer |
| "Not Interested" (the one labelled edge, 7 px on screen) | Labels from answers on long branch connectors (skipping a layer or running back) and on hover or selection, 12 px | connectors |
| "Edge from node_1785140279604-copy-… to node_…" | "Ask about a site visit, answer Yes, to Book site visit" | accessible names |
| "New Speak Node added." | "Added Speak 2 after Ask about a site visit, connected from Later." | live region |
| "Connection added." | "Connected Later to Callback set" | live region |
| "Pasted." | "Pasted 3 steps. 2 outside connections not copied." | live region |
| (silent Backspace delete) | "Deleted 'Polite close' and 2 connections · Undo" | toast |
| "Zoom In" · "Zoom Out" · "Fit View" · "Toggle Interactivity" | "Zoom in" · "Zoom out" · "85%" (menu) · "Fit" · "Lock canvas" | canvas controls |
| "Full-screen canvas (F)" | Removed: no mode hides the header or issues | toolbar |
| "KEYBOARD SHORTCUTS", "Multi-select nodes: Shift + Click", "Edit node label inline: Double-click" | "Keyboard shortcuts", only keys that work, platform modifiers | `?` sheet |
| "Choose a flow to edit" + default template (during load) | Skeleton; hidden status "Loading Site-visit qualifier…" | loading |
| React Flow's blank default box | "Unsupported step · Type "ambulance_call" isn't supported · Convert to…" | unknown types |
| "node" anywhere in UI copy | "step" (direction §4.3 glossary) | everywhere |

---

## 16. Accessibility

### 16.1 Roles and names

| Element | Markup |
|---|---|
| Canvas | A `<section aria-labelledby>` whose visually hidden `h2` reads "Canvas" (06 §6.1), holding one roving tab stop. **No `role="application"`**: steps are standard roles (below), so browse mode keeps working. `aria-describedby` points at the one instruction string defined in 06 §9.6 (not restated here). The Outline (`tree`, P2 §16) is the non-spatial equivalent |
| Step | `role="group"`, `aria-roledescription="step"`, name per 06 §9.6: stable number and title first, then the call-order position ("#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: Yes goes to Book site visit; … 1 warning."). Badges and Block labels are `aria-hidden` because their words are in the name |
| Socket | `<button>`, names in §6.2 (answer sockets say "Answer …", result sockets "Result Found of …"); `aria-keyshortcuts="C A Delete"` |
| Connector | SVG `aria-hidden`; meaning exposed by sockets and step names (§7.6) |
| Frame | `role="group"`, "Frame Qualification, 6 steps, collapsed"; header button `aria-expanded` |
| Note | `aria-roledescription="note"`, name "Note by Asha R.: Weekend batches use the Saturday script." |
| Phase ruler | `role="toolbar"` of toggle buttons with `aria-pressed`: "Logic, 1 step. Emphasise Logic"; the arrows and rule are `aria-hidden`; "Phase columns" is a toggle button with `aria-pressed` |
| Tool rail | vertical `role="toolbar"`, roving tabindex; panel toggles `aria-pressed`; `aria-keyshortcuts` |
| Canvas controls | `role="group" aria-label="Zoom"`; the % button "Zoom 85 %, choose a zoom level" (`aria-haspopup="menu"`) |
| Minimap | `aria-hidden="true"`, not focusable (keyboard equivalents: Fit, Find, Outline) |

### 16.2 Focus

Always a 2 px `--focus` outline, drawn at constant screen width (`calc(2px / zoom)` inside the node layer) with a 3 px offset on steps and a 2 px offset on sockets. Never obscured: panning keeps the focused step clear of the inspector, panels, Find bar, minimap and Problems panel (WCAG 2.4.11). Return targets: delete → the previous step on the path; edge popover or Connect to… → the socket; inspector Esc → the step; Find Esc → the current match; palette Esc → the tool rail button. Never `<body>`.

### 16.3 Announcements

One polite region (shell). Announced: adds, connects, disconnects, retargets, deletes, moves (on drop), pastes, selection counts, Find result counts, phase emphasis ("Showing Logic steps"), issue count changes (debounced, P2). Never announced: pans, zoom (except when chosen from the zoom menu: "Zoom 100 %"), band changes, hover. Assertive only for a failed save (P2).

### 16.4 Contrast (all pairs from `contrast-report.md`)

Titles `--text` on `--surface-raised` 17.93 / 15.03 · phase line, meta and examples `--text-3` ≥ 4.70 on every plane including `--surface-2` fallback rows · connectors `--edge` 3.42:1 on the canvas · sockets `--control` ≥ 3.01 · selection `--accent-mark` 7.68 / 7.57 · focus ≥ 6.15 · frame titles ≥ 15:1 on every tint · tags ≥ 5.47. Dimming never touches text: `--opacity-dim` and `--opacity-unreachable` apply only to glyph tiles, sockets and connectors, and dimmed or unreachable steps take the `--surface-2` fill with text at full contrast (title 16.13:1, `--text-3` 5.05:1 on `--surface-2` in light, ≥ 4.70:1 in both themes), so CT-02 (06 §21.1) passes with an unreachable and a dimmed step on screen (foundations §10).

### 16.5 Targets, motion, forced colours, zoom

- Targets: sockets 24 px on fine pointers, and on coarse pointers the 44 × 44 end of an answer or result row, which grows to 44 (§6.1); zoomed out, Connect to…, Go to and the Outline are the equivalent paths; "+" 20 px visual with a 24 px hit; canvas controls 30 px; palette items 44; phase segments 28 (WCAG 2.5.8).
- Reduced motion: no trace, Tidy and pans are instant, panels fade instead of sliding (foundations §11).
- Forced colours: step borders `ButtonBorder` (selected `Highlight`, 2 px); sockets and live marks `CanvasText` (`data-mark`); connectors `CanvasText` with dashes kept (`data-edge`); frame fills removed, borders `CanvasText`; badges keep their words.
- Zoom and reflow: at 200 % browser zoom a 1440 screen becomes 720 CSS px and the designer switches to the Outline layout, so reflow holds; the 2D canvas is exempt under 1.4.10 and the Outline is its reflowed equivalent. All type is rem-based.
- Language: examples carry `lang` (`hi`, `hi-Latn`, …); titles `translate="no"`.

### 16.6 Test plan

Keyboard-only Playwright test: open a blank flow, add a Question after the Trigger, connect "Yes" to a new Speak step and "No reply" to an Outcome, all without a pointer, then assert 3 connections and the announcements (F-A11Y-001). Manual passes: NVDA + Chrome, JAWS + Chrome, VoiceOver + Safari on the canvas and Outline; TalkBack + Chrome on the phone Outline; real-device touch pan and pinch on iOS and Android (00-summary §6 gap).

---

## 17. Responsive behaviour summary

What each width can do is `05-responsive` §10.6, the one capability matrix; this table summarises layout per width.

| Width | Shell | Header | Left panel | Canvas | Inspector | Minimap | Editing |
|---|---|---|---|---|---|---|---|
| ≥ 1440 | Rail (focus mode), Baseline hidden | full | `--size-left-panel` 280, docks, pushes canvas | full | docked 320–480 | on | full |
| 1280–1439 | same | full | overlays canvas (the Outline docks for flows over 20 steps, and the inspector then overlays) | full | docked | on | full |
| 1024–1279 | same | compressed (§3.3) | overlays | full | overlay, pans selection into view | off | full |
| 1024+ with coarse pointer (landscape tablets) | same | as width | as width | touch sizes: answer and result rows 44 with a 44 × 44 socket target at each row's end (§6.1), tap socket → Connect to…, the step's `⋯` for its menu (no long-press, `05-responsive` §6.3), pinch zoom; a **Navigate / Arrange** SegmentedControl joins the canvas controls: Navigate (default, restored on every open) makes one-finger drag pan, Arrange makes it move steps and draw a marquee; two fingers always pan and zoom (`05-responsive` §10.9) | as width | as width | full |
| 768–1023 | TopBar 52 + NavSheet | 48, actions never clipped | Outline column `--size-left-panel-tablet` 320 | read-only, Compact band | read-only Sheet | off | Review: Test, Compare, History and Publish; no step edits |
| < 768 | TopBar + BottomBar (12 of 12 reachable) | chip row | Outline is the page | read-only tab (Outline · Canvas) | full-screen read-only sheet | off | Test, Publish and Roll back; no step edits |

- Modes switch on a `matchMedia` change listener, including live resizes (F-RWD-003's verifier note).
- Heights (inner viewports, `05-responsive` §2.1): on a 1366 × 768 laptop (1366 × 657) the canvas keeps 537 px and on a 1280 × 720 laptop (1280 × 609) 489 px, under the 120 px of designer chrome; below 600 px tall at ≥ 1024 the phase ruler folds into a "Phases" menu in the header and the live note into the Live chip's tooltip.
- A debounced ResizeObserver keeps the selection or centre in place on resize (F-RWD-014).

---

## 18. Telemetry (optional, no content)

Never log titles, prompts, examples, numbers or variable values. Hash flow ids.

| Event | Properties | Question it answers |
|---|---|---|
| `designer_opened` | steps, triggers, width bucket, mode (edit, review, outline), band on open | Are people editing on laptops, reviewing on tablets? |
| `step_added` | type, method (palette_click, palette_drag, drop_on_edge, socket_plus, key_a, connect_to_new, context_menu, paste, pattern), connected (bool) | Target: ≥ 90 % of adds arrive connected |
| `connection_created` | method (drag, connect_to, goto_select, outline, drop_on_edge), keyboard (bool) | Is the keyboard path used? |
| `step_deleted` | count, undone within 10 s | Are deletes accidental? |
| `tidy_run` | steps, undone (bool) | Is Tidy trusted? |
| `overlap_notice` | shown, tidied, dismissed | Target: overlaps trend to zero |
| `find_used` | matches bucket, jumped (bool) | Large-flow navigation |
| `lod_time` | ms in Full, Compact, Block | Do people work zoomed out? |
| `panel_toggled` | panel (add_step, outline, variables), docked or overlay | Canvas share in practice |
| `review_edit_attempt` | width bucket | Demand for tablet editing |
| `keyboard_session` | sessions with no pointer events and ≥ 1 edit | Keyboard-only authoring exists |

---

## 19. Acceptance criteria

**Layout and chrome**
- [ ] At 1440 × 900 with the inspector docked the canvas is at least 1016 × 780; with no panels at least 1336 × 780. The Baseline is absent and the nav is the rail.
- [ ] At 768, 800, 834, 1024 and 1280 px every header action including `Publish v8…` is fully visible; resizing live across 1024 and 768 switches modes without a reload (F-RWD-003).
- [ ] At 1024–1279 the inspector overlays the canvas and the selected step stays fully visible beside it; the minimap is hidden.
- [ ] No full-screen mode exists; the header, SaveState and IssuesChip are visible in every editing state.
- [ ] **Interim I1:** with the revisions backend off, 20 edits (typing, adding, connecting, deleting, Tidy) send zero network writes (network log: no PUT, PATCH or POST) until Publish is pressed in the gate; the header reads `Draft on this device · 20 changes ▾` or the change count, and the live note reads "Edits stay on this device until you publish. Callers hear the saved flow." in `--text-2`.

**Grammar and steps**
- [ ] Trigger and Outcome render as capsules, Logic and Action as rectangles, each with its tile type (solid, outlined, tinted, flag); no step title uses a colour other than `--text`; no dashed borders on steps.
- [ ] Every Logic step shows one answer row (label + examples) per answer plus exactly one fallback row; lookups, Book meeting and Transfer show **result rows** (12 px check or x glyph, `data-13` `--text-2` label, no examples, inset rule) ending in their fallback. At Full and Compact zoom a CRM lookup and a Question are distinguishable in a greyscale screenshot by their rows alone.
- [ ] An Outcome shows the plain status line "Lead → Interested" (`meta-12`, no chip, arrow as an icon); its tile tone matches that status. The same sentence appears in the Outline and the accessible name says "Sets lead to Interested".
- [ ] Every step shows its stable `#n`. Adding, deleting, Tidy, reordering in the Outline and publishing never change an existing step's number; a deleted number is never reused; v8 and v9 show the same number for the same step. Two steps with the same title are distinguishable on screen.
- [ ] The phase ruler is one connected bar with `arrow-right` between segments; no `chevron-right` appears in it. Phase columns is off by default, and toggling it moves no step and does not mark the draft dirty.
- [ ] An unregistered type renders as Unsupported step with Convert to… and blocks Publish.
- [ ] Focus and selection look different, and both show when both apply (F-A11Y-007).
- [ ] At every zoom from 25 % to 200 %, once the gesture has ended (one frame after `onMoveEnd`), no step, label, badge or frame text computes below 12 px on screen (measure with `getBoundingClientRect` of text nodes vs zoom).
- [ ] With one unreachable step and phase emphasis on, the compositing contrast scanner (06 CT-02) finds zero text nodes below 4.5:1 in both themes; no element with `opacity` < 1 contains text.

**Sockets and connectors**
- [ ] Each socket is a focusable button with a name that says its answer and target. At 100 % zoom its hit area is ≥ 24 × 24 screen px on a fine pointer. Under `pointer: coarse` its answer or result row is 44 tall and the hit area is ≥ 44 × 44, and adjacent rows' hit areas never overlap.
- [ ] Connectors are orthogonal with rounded corners, 1.5 screen px at every zoom, with an arrowhead; only fallback connectors are dashed.
- [ ] With 25 connectors on screen and `prefers-reduced-motion: reduce`, no connector animates; without reduced motion, none animates at rest either.
- [ ] Clicking a connector opens the popover with Insert step…, Change target… and Delete connection; each works and is undoable.
- [ ] No connector's accessible text contains an internal id.

**Adding**
- [ ] With a step selected, clicking a palette item adds a new step to its right, connected from its first free output, selected, with no overlap with any existing box (+24 px margin). Three adds in a row never stack (F-FLOW-009).
- [ ] Dragging a palette item onto a connection inserts the step between its two steps.
- [ ] The "+" on a free socket and the `A` key open Add step anchored there; choosing adds a connected step.
- [ ] Palette labels are never truncated at 1440 or 1280; each type appears once; Recently used never shifts the list.

**Controls, selection, clipboard**
- [ ] The zoom control shows the current % and offers 50 / 75 / 100 / 150 / 200 %, Fit flow and Fit selection.
- [ ] Opening a flow never inherits the previous flow's viewport; reopening restores this flow's last viewport for this user; none of this writes the flow.
- [ ] Shift, Ctrl and ⌘ click each toggle selection; Shift-drag marquee selects touched steps; the selection bar shows the count.
- [ ] Paste lands at the pointer or a free spot, suffixes duplicate titles with "(copy)", keeps internal connections and never overlaps.
- [ ] Delete shows "Deleted '…' and n connections · Undo", closes the inspector and moves focus to a step; Undo restores steps and connections.
- [ ] Tidy lays Triggers in the first column and Outcomes in the last, keeps frame members together, is one undo step, and running it twice moves nothing.
- [ ] Loading a flow with overlapping steps shows the overlap Notice and moves nothing until Tidy is chosen.

**Keyboard and assistive tech**
- [ ] The canvas is one tab stop; arrows follow connections; Enter opens the inspector; Esc returns focus to the step.
- [ ] The keyboard-only Playwright scenario in §16.6 passes.
- [ ] The shortcut registry lint (06 §8.4) finds no key bound twice in one scope; Alt+Arrow moves the selection, Alt+. and Alt+, walk issues, and the shell's `[` does nothing while the designer is open.
- [ ] With single-key shortcuts off, A, C, M, O, V, T, +, −, Shift+1, Shift+2, Shift+0 and ? do nothing on the canvas, and ⌘/Ctrl and Alt shortcuts still work.
- [ ] The `?` sheet opens as a focused dialog, fits within 80 vh with scrolling, shows platform modifiers and lists only working keys.

**Large flows**
- [ ] At Fit on Flow B (35 steps) at 1440 × 900, every visible Block label shows at least 20 characters or the full title, prefixed with `#n`, and no two visible labels are identical; hidden labels appear on hover or focus. Find "visit" reports the count and walks the matches; "#9" jumps to step 9; a match inside a collapsed frame expands it.
- [ ] At ≥ 1280, a flow with more than 20 steps opens with the Outline docked (unless the user turned that off), and the canvas keeps at least 56 % of the viewport.
- [ ] Frames collapse to a block with exits; collapsing does not mark the draft dirty.
- [ ] The minimap (≥ 1280) can be hidden, is remembered, never covers the selected step, and has no grey mask.
- [ ] Panning and zooming a 150-step flow stays at 60 fps on the reference laptop with the level-of-detail clamp active; with 4× CPU throttling, a pinch from 1.0 to 0.25 keeps ≥ 50 fps and records no long task over 50 ms (Performance panel), and `--zoom` is written at most once per gesture plus once per band change.

**Empty canvas and templates**
- [ ] A blank flow opens as Trigger → Outcome with the "+" and the empty-state card, and its issues chip reads "No issues"; both buttons insert a connected step between them.
- [ ] Every template passes the rule set in CI with zero errors and no "undefined" in its script; instantiated in an empty fixture workspace, every template opens with 0 errors and at most W08.

**States**
- [ ] During load, the canvas shows the skeleton and never a default template; nothing is editable until hydrated (F-FLOW-037).
- [ ] View-only users see a read-only canvas with the admin's name in the notice; no palette, "+", drag or Publish.
- [ ] Both themes: light and dark renders match the mock; forced-colours mode keeps focus, selection, sockets, connectors and dashes visible.

---

## 20. New components needed

### 20.1 Component registry (the one list of Flow Designer names)

Not defined in `02-components-*` or the shell spec. **This table is the only place a Flow Designer component is named**; P2 §24, `05-responsive` §10.7 and §19, `06-accessibility` and `07-motion` use these names and point here. The Owner column says which section specifies behaviour and content (P2 = part 2). All live in `components/flow/`, are built on React Flow v12 (xyflow) plus the Radix-based primitives of the component specs, and read tokens only.

**Frame and chrome**

| Component | Owner | Built on | Props and variants |
|---|---|---|---|
| **FlowHeader** | layout §3.3; content P2 §4.3 | flex row, FoldGroup (`05-responsive` §19) | `width: 'full' \| 'compact' \| 'tablet' \| 'phone'` (phone renders the chip row and the sticky action bar); slots for the items below |
| · **VersionChip**, **SaveState** | overlay §18 (variants `device`, `volatile` for interim I1) | Tag | as overlay §18.4 |
| · **IssuesChip** | layout §3.3; content P2 §4.3 | StatusTag `validation` `lg` as a button | `counts: {errors, warnings}`, `checking`, `onOpen()`; `compact` (icon + count) below 1280 |
| **PhaseRuler** (+ `PhaseSegment`, `PhaseColumnsToggle`) | §4.4 | `role="toolbar"`, toggle buttons | `counts: Record<Phase, number>`, `pressed?: Phase`, `onToggle(phase)`, `columns: boolean`, `onColumns()`; hosts `LiveNote` |
| **LiveNote** | placed §4.4; copy P2 §4.3 | text + link | `live`, `usedBy`, `draftChanges`, `interim: boolean` |
| **ToolRail** | §3.1 | vertical ButtonGroup, `role="toolbar"` | `active: 'add' \| 'outline' \| 'variables' \| 'history' \| null`, `onToggle` |
| **LeftPanel** | §3.1 | `<aside>` | `view`, `docked: boolean`, `onClose`; width `--size-left-panel` (≥ 1024) or `--size-left-panel-tablet` (Review mode) |
| **ProblemsBar** | slot §3.4; content P2 §12.4 | 32 px bar | `issues`, `current`, `onGoTo`, `onPrev`, `onNext` (Alt+, / Alt+.), `legend: boolean` (≥ 1440) |
| **ProblemsPanel** (+ `IssueRow`) | slot §3.4; rows P2 §12.4 | region, SegmentedControl | `issues: Issue[]`, `filter`, `onGoTo(issue)`; `placement: 'panel' \| 'sheet' \| 'tab' \| 'fullscreen'` (≥ 1024 · tablet bottom sheet · Review tab · phone) |
| **CompareBar** | P2 §4.5 | 40 px bar | `against: 'live' \| number`, `counts`, `onPrev`, `onNext` (`[` / `]`), `onExit` |

**Canvas**

| Component | Owner | Built on | Props and variants |
|---|---|---|---|
| **FlowCanvas** | §3, §9, §11 | `<ReactFlow>`, Background (dots 16), `snapToGrid`, `onlyRenderVisibleElements`, `colorMode` from `data-theme` | `graph`, `readOnly`, `mode: 'edit' \| 'review'`, `selection`, `onSelectionChange`, `onCommand(cmd)`, `emphasisPhase`, `phaseColumns`, `findQuery`, `touchMode: 'navigate' \| 'arrange'` |
| **StepNode** → `TriggerStep`, `LogicStep`, `ActionStep`, `OutcomeStep`, `UnsupportedStep` | §4, §5 | React Flow custom node | `data: {type, title, number /* stable, D7 */, callIndex, summary, meta, rows[], status, issues, test, changed, unreachable, dimmed}`, `band: 'full' \| 'compact' \| 'block'` |
| · `GlyphTile` | §4.1 | span | `phase`, `icon`, `tone?` (Outcome), `size: 24 \| 20`, `muted` (graphics-only dim) |
| · `PhaseLine` | §5.1 | span | `phase`, `typeName`, `changeWord?`, `number` |
| · `AnswerRow` (Logic) | §5.1 | div + `OutputSocket` | `label`, `examples[] (with lang)`, `fallback`, `required`, `connectedTo?` |
| · `ResultRow` (Action) | §5.1 | div + `OutputSocket` | `result: 'success' \| 'failure'` (glyph `check` / `x`), `label`, `fallback`, `connectedTo?` |
| · `OutcomeStatusLine` | §4.3, §5.1 | span | `status` (renders "Lead → Interested"; plain text, never a Tag) |
| · `OutputSocket`, `InputPort` | §6 | React Flow `Handle` in a `<button>`; `::after` hit area | `id`, `state: 'connected' \| 'free' \| 'required'`, `accessibleName`, `onConnectTo()`, `onAddAfter()` |
| · `StepBadges` | §5.4 | Tag (data-nav §5.2) | `now?`, `reached?`, `issue?: {level, count} \| 'unreachable'`; `compact` below 0.75 |
| · `BlockLabel` | §5.5 | counter-scaled overlay | `number`, `title`, `priority`, `hidden` |
| **FlowEdge** (+ `EdgeLabel`, `EdgePopover`) | §7 | custom edge, `getSmoothStepPath`; Popover (overlay §5) | `kind: 'path' \| 'fallback'`, `state`, `label?`, `labelReason: 'long' \| 'hover' \| 'selected' \| null`, `onInsert()`, `onRetarget()`, `onDelete()` |
| **PhaseBands** | §4.4 | SVG under the node layer | `layers: {x, width, phases}[]`, `visible` |
| **CanvasControls** (+ `ZoomMenu`, `ViewOptionsMenu`, `TouchModeSwitch`) | §9.1, §17 | ButtonGroup `attached`, Menu, SegmentedControl (Navigate / Arrange, coarse pointers at ≥ 1024 only) | `zoom`, `onZoom`, `onFit(scope)`, `minimap`, `options: {snap, labels, changes, callData, locked, scrollToZoom}`, `touchMode?` |
| **FlowMinimap** | §9.3 | React Flow MiniMap, stroke-only viewport | `visible`, `nodeColor(step)` |
| **AlignmentGuides** | §10.4 | SVG overlay during drag | `lines[]` |
| **MoveMode** | 06 §16.1 (feedback §10.4) | canvas state + announcer | `stepIds`, `onPlace`, `onCancel` |
| **FindBar** | §12.2 | SearchInput, IconButtons, Menu | `query`, `matches[]`, `current`, `options`, `onNavigate(dir)`, `onClose` |
| **Frame** (+ `CollapsedFrame`) | §12.4 | React Flow group node | `title`, `tint`, `members[]`, `collapsed`, `summary`, `exits[]` |
| **CanvasNote** | §12.5 | React Flow node | `text`, `author`, `at`, `pinnedTo?` |
| **SelectionBar** | §10.1 | BulkBar (data-nav §7.10), canvas variant without a primary | `count`, `notes`, `onFrame`, `onAlign(kind)`, `onDuplicate`, `onDelete` |
| **EmptyCanvasCard** | §13.2 | EmptyState region variant (overlay §15) on a connection | `onAdd(type)`, `onBrowse()` |

**Adding, connecting, outline**

| Component | Owner | Built on | Props and variants |
|---|---|---|---|
| **StepPalette** (+ `PaletteGroup`, `PaletteItem`, `RecentlyUsed`) | §8.2 | SearchInput, Radix Collapsible, pointer-event drag | `registry`, `recent[]`, `onAdd(type, preset?)`, `onDragStart(type)`, `variant: 'panel'` (v1; `'sheet'` is reserved for tablet editing in v1.1) |
| **StepPicker** | §8.4 | Popover + cmdk | `anchor`, `suggestions[]`, `onPick(type, preset?)`, `onConnectExisting()` |
| **ConnectToPopover** | P2 §16.4 (anchoring §6.2) | Combobox (core §5.3); shares its list with StepPicker | `origin: {stepId, outputId?}`, `steps`, `onConnect(targetId)`, `onDisconnect()` |
| **DragGhost** | §8.3 | portal at `--opacity-drag` | `type`, `title`, `insertTarget?` |
| **FlowOutline** (+ `OutlineRow`) | P2 §16 (placement §12.3) | tree with roving tabindex | `graph`, `selection`, `filter`, `readOnly`, `onCommand(cmd, target)`; `OutlineRow kind: 'step' \| 'answer' \| 'result' \| 'reference' \| 'group'`, `density: 'panel' \| 'touch'` (48 px rows) |
| **PhaseStrip** | §13.1 | div | `steps: {phase, icon, name}[]`, `compact` |
| **TemplateCard** | P2 §15.3 | RadioCard + PhaseStrip | `template`, `needs: string[]` (computed from the workspace), `recommended` |

**Inspector, lifecycle and test** (behaviour owned by P2; names fixed here): `StepInspector` (+ `InspectorSection`; `presentation: 'docked' | 'overlay' | 'sheet' | 'fullscreen'`, `readOnly`) · `IntegrationStatusRow` · `PromptField` (+ `VariableToken`, `VariablePicker`) · `VariableField` · `AnswerEditor` (+ `AnswerEditorRow`: grip handle, label + examples, `GoToSelect`) · `GoToSelect` · `ConditionBuilder` (+ `ConditionCase`, `ConditionRow`, `TryValues`) · `PublishGate` · `DiffList` (+ `ChangeRow`, `FieldDiff`) · `VersionHistory` (+ `VersionRow`) · `ConflictSheet` · `TestPanel` (+ `QuickReplies`, `CapturedList`, `PathList`, `RunSummary`; Browser voice shows **`LevelMeter`**, owned by `07-motion` §12.5, the one audio meter in the product) · `VariablesPanel`.

**Names retired by this registry:** IssuesButton → IssuesChip · ProblemsList → ProblemsPanel · OutlineItem, BranchRow → OutlineRow · AddStepSheet → StepPalette (tablet editing is not in v1) · MicMeter → LevelMeter · FlowMap → FlowCanvas `readOnly` · CanvasToolbar → CanvasControls · the inspector's `AnswerRow` → AnswerEditorRow (the canvas owns `AnswerRow`).

Hooks: `useCanvasZoomVar()` (writes `--zoom` on the viewport element on `onMoveEnd` and band changes only, quantised down to 0.05; §5.5), `useLodBand(zoom)` (with 0.03 hysteresis), `usePlacement(graph)` (collision-free slots, §8.1), `useCallOrder(graph)` (call order for roving focus, the Outline and accessible names; never the printed number), `useStepNumbers(flow)` (stable numbers: max + 1, never reused, carried across versions; D7), `useViewportMemory(flowId)` (local storage, never the flow), `useFind(graph, query, options)`.

### 20.2 Tokens

Registered in 01-foundations §18 and emitted by `tokens.json` 1.1.0 under `component.flow`; the interim values are retired, so build with the names. The zoom range and level-of-detail bands are JS constants in the `interaction` group (`zoomMin`, `zoomMax`, `lodFull`, `lodCompact`), not CSS variables.

| Token | Value | Why |
|---|---|---|
| `--size-node-trigger` | 208px | Trigger width |
| `--size-node-logic` | 256px | Logic width (answer rows need room) |
| `--size-node-action` | 240px | Action width |
| `--size-node-outcome` | 240px | Outcome width (room for the status line "Lead → Callback due" and the capsule end) |
| `--size-answer-row` | 28px | Answer row height in the Full band |
| `--size-minimap-w` / `-h` | 176px / 112px | Minimap (F-FLOW-023) |
| `--size-frame-header` | 32px | Frame header |
| `--size-note` | 220px (200–320) | Note width |
| `--grid-snap` | 16px | Snap and dot spacing |
| `--layout-rank-gap` / `--layout-node-gap` | 128px / 24px | Tidy spacing. 128 with a 240 px minimum layer width gives a 368 flow px column: 129 screen px at 0.35, so a Block label stopped by the next column is still about 100 px, two lines (§5.5), and a four-layer flow still fits the Full band beside the docked inspector |
| `--edge-width` / `--edge-width-active` | 1.5px / 2px | Connector strokes |
| `--edge-dash` | `5 4` | The one dash pattern (foundations §7) |
| `--edge-radius` | 8px | Connector corners |
| `--edge-hover` | `var(--text-2)` both themes | Hover and "connected to selection" stroke (8.7:1 / 9.2:1 on the canvas) |
| `interaction.zoomMin` / `zoomMax` (JS) | 0.25 / 2 | Zoom range |
| `interaction.lodFull` / `lodCompact` (JS) | 0.75 / 0.5 | Band thresholds (direction §6.5) |

**Defined in `tokens.json` (layout sizes, not proposed):** `--size-left-panel` 280px, the left panel at ≥ 1024 for every view (Add step, Outline, Variables, Version history), and `--size-left-panel-tablet` 320px, the Outline column of Review mode at 768–1023. These two names replace `--size-outline-panel`, `--size-outline` and every literal 280, 300 or 320 for that panel in the Flow Designer specs. No new colours: frames reuse `--frame-*`, states reuse the semantic set, and `--edge-hover` is an alias.

---

## 21. Dependencies, open questions, reconciliations and traceability

### 21.1 Dependencies specific to the canvas

| Id | Needs | For | Until it ships |
|---|---|---|---|
| C1 | Flow JSON stores frames (title, tint, members), notes (text, author, time, pinned step) and integer positions on the 16 px grid; the compiler ignores frames and notes | §12.4, §12.5 | Frames and notes hidden; positions rounded on save |
| C2 | Server check of imported and AI-drafted graphs against the registry (P2 FD4) | Unsupported step never reaching Live | Client renders Unsupported step and blocks Publish |
| C3 | Per-step analytics from Call reports (reach, answer split, drop-off) on the Live version | §12.6 | Hidden (P1) |
| C4 | Versioned clipboard format (`application/x-vaani-flow+json;v=1`) | §10.2 cross-flow paste | Paste within the same flow only |
| C5 | Read-only mode per role (P2 FD12) | §14 view-only | Everyone edits, as today |

Viewport and frame-collapse state need no backend: they are per-user browser preferences (D9).

### 21.2 Open questions for the product owner

| # | Question | Proposal |
|---|---|---|
| Q1 | Should the mouse wheel pan (proposed, trackpad-friendly for large flows) or zoom (today's behaviour)? | Pan by default, "Scroll to zoom" in View options; revisit with telemetry |
| Q2 | What do migrated End steps record? | Nothing until someone chooses: neutral tile and "Choose what this call records" (P1). P2 to add a warning rule for an unset outcome |
| Q3 | The "Recording disclosure" pattern: exact wording and when it is mandatory | Needs legal review (direction §8 compliance cues) |
| Q4 | Subflows ("Go to flow" as a step that runs another flow) | v2; frames cover grouping in v1 |
| Q5 | Manual bend points on connectors | Not in v1; Tidy plus orthogonal routing first, reassess with Flow B-sized flows |
| Q6 | Threaded comments with mentions on the canvas | v2, with presence and notifications (shell §11 has no inbox in v1) |
| Q7 | Who can see notes: everyone with view access, or editors only? | Everyone with view access; notes are part of the flow |
| Q8 | Should frames appear in the Outline? | No in v1 (the Outline is the call path); revisit if large teams ask |
| Q9 | A hard limit on steps per flow | None; performance budget targets 150 steps; warn at 200 |
| Q10 | Hinglish synonyms in search ("sawaal" → Question) | Yes, owned in the registry with the palette descriptions |

### 21.3 Reconciliations

| # | Topic | Source says | This spec does | Why |
|---|---|---|---|---|
| X1 | Step numbering | Direction: "step 3 of 12"; an earlier draft of this part: positional `#n` | `#n` is a stable per-flow sequence number (D7); call order is stated separately ("step 3 of 14 in call order") in the accessible name, the Outline's order and roving focus. P2 R12 agrees | A number that renumbers on every insert breaks every saved reference: Problems messages, Call reports columns, Analytics drop-off, History, and "fix step 9" in chat |
| X2 | Level of detail | Direction: Full from 0.75, but 12 px roles would render at 9 px there | Same bands, plus the clamp `max(role, 12px / zoom)` with fixed line boxes | Keeps the 12 px floor the direction requires |
| X3 | Outcome width | Direction specimen ~190 px | 240 px | The longest status line ("Lead → Callback due") must not truncate beside the capsule end |
| X4 | Unsupported step border | P2 §7.15: amber | Danger border and "1 error" | Its rule (E14) is an error; colour follows level (P2) |
| X5 | Problems bar legend | P2 §12.4 lists no legend | Path / Fallback legend at ≥ 1440 only | Direction specimen shows it; it teaches the one dashed line |
| X6 | BulkBar primary | data-nav §7.10: one Neel primary | Canvas selection bar has none | Arranging commits nothing; Publish stays the only Neel fill |
| X7 | Full-screen mode | F-FLOW-034 suggests a floating bar | No full-screen mode | Focus mode already gives the canvas 61–80 %; nothing may hide save state |
| X8 | Palette Outcome items | P2 §7.2: one type, End with outcome | Seven presets of that type | One click per common ending; still one type in the registry |
| X9 | Left panel | Direction: tool rail only | Tool rail toggles a 280 px left panel (docked at ≥ 1440) | The palette needs a list with descriptions (F-FLOW-035) |
| X10 | Wheel behaviour | Today: wheel zooms | Wheel pans (Q1) | Large flows are navigated more than zoomed |
| X11 | Canvas key map | This part, P2 §16.5 and §18, and 06 §9.6 each had a table; Alt+↑/↓ meant both "next issue" and "move" | One map, 06 §9.6. Alt+Arrow = move everywhere (canvas nudge, Outline, answer and case lists); issues = Alt+. / Alt+,; Space selects only, Shift+Space toggles; `M` Move mode stays as the announced, single-pointer path; the shell's `[` is off in focus mode | One meaning per key per scope, enforced by the registry lint (06 §8.4); resolves 07 Q5 |
| X12 | Interim before revisions | Direction §8 (old): Publish = ACTIVATE, Draft chip hidden; this part (old): "Active flow. Changes apply to calls immediately." | Interim I1 only (P2 §4.9): device draft, `device` SaveState and VersionChip variants, Publish writes the flow through the gate | The only option that removes F-FLOW-001 before the backend ships |
| X13 | Tablet editing | `05-responsive` (old): tablets edit with Navigate / Arrange | Review mode at 768–1023 (D11, direction §6.5); Navigate / Arrange kept for coarse pointers at ≥ 1024 | One decision; tablet editing is measured by telemetry for v1.1 |
| X14 | Canvas role | This part (old) and `05-responsive` (old): `role="application"` | 06 §6.1 model: `<section>` + hidden `h2`, steps `role="group"`, sockets buttons, Outline `tree` | Keeps screen-reader browse mode; standard roles cover every behaviour |
| X15 | Dimming | Foundations §10 (old): opacity for "whole regions"; unreachable body at 50 % | Opacity on graphics only (tiles, sockets, connectors), never on an ancestor of text | WCAG 1.4.3; foundations §1.3 rule 2 |

### 21.4 Traceability

| Finding | Sections |
|---|---|
| F-A11Y-001, F-FLOW-006 | §6, §11, §16, §19 |
| F-A11Y-007 | §5.4, §16.2 |
| F-A11Y-011 | §9.1, §10.5 (Radix menus) |
| F-A11Y-022 | §7.2, §9.4, §16.5 |
| F-A11Y-023 | §6.1, §16.5 |
| F-A11Y-027 | §11.3 |
| F-A11Y-028 | §6.2, §7.6, §9.3, §11.1 |
| F-FLOW-007, F-VIS-003, F-A11Y-019 | §4.1, §5.1, §16.4 |
| F-FLOW-008 | §5.5, §9.1, §9.2, §12 |
| F-FLOW-009 | §8 |
| F-FLOW-010 (canvas marks) | §5.4, §3.4 |
| F-FLOW-011 | §7 |
| F-FLOW-012 (viewport) | §9.2 |
| F-FLOW-013 | §13 |
| F-FLOW-017 | §12 |
| F-FLOW-020 | §5.1, §6, §7.5 |
| F-FLOW-021 | §9.4, §10.4 |
| F-FLOW-022, F-RWD-014 | §3, §17 |
| F-FLOW-023 | §9.3 |
| F-FLOW-024 | §10.1, §11 |
| F-FLOW-025 | §10.3 |
| F-FLOW-026 | §4.3, §10.2, D7 |
| F-FLOW-027 | §4.3 |
| F-FLOW-029 | §5.3 |
| F-FLOW-034 | §3.1, X7 |
| F-FLOW-035 | §8.2 |
| F-FLOW-036 | §5.1, §7.4 |
| F-FLOW-037 | §14 |
| F-RWD-003 | §3.3, §17 |
| F-UX-004 (canvas), F-UX-031 | §3.3, §10.1, §12.1 |
