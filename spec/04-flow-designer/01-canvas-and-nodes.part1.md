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
