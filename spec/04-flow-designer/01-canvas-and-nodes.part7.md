
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
