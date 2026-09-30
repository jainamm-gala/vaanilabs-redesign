
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
