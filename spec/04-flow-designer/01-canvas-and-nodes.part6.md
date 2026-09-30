
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
