### 10.10 Components used, with motion configuration

| Component (spec) | Motion configuration |
|---|---|
| `FlowCanvas` on React Flow (FD1) | `nodeDragThreshold={4}` · `snapToGrid={false}` (snap on release, §10.4) · `defaultEdgeOptions={{ animated: false }}` · `autoPanOnNodeDrag` and `autoPanOnConnect` on, speed capped at 12 px per frame · `onlyRenderVisibleElements` above 60 steps · `fitView` computed before first paint, never animated on load · every `fitView`, `setCenter`, `zoomIn`, `zoomOut` and `zoomTo` call passes `{ duration: reduced ? 0 : 200 }` (`--dur-slow` read from `tokens.json`) |
| Step nodes: Trigger, Logic (with AnswerRows), Action, Outcome (FD1) | `transition-property: background-color, border-color` over `--dur-fast`; `box-shadow` not transitioned; `data-selected`, `data-focus-visible`, `data-dragging` attributes drive the states |
| Socket | `transform: scale(1.4)` over `--dur-fast` while it is a valid target; `data-mark` for forced colours |
| Edge and EdgeLabel (FD1) | stroke colour `--dur-fast`; no `stroke-dasharray` animation ever; fallback edges keep their static 5/4 dash |
| `AlignmentGuides` (new overlay, §18) | 1 px `--accent-mark` lines and an info Tag, rendered in the viewport layer, no transition |
| `TraceLayer` (new overlay, §18) | the test trace (§11.4) |
| Selection bar (BulkBar variant, N §7.10) | rise `--shift-toast` over `--dur-slow` |
| Inspector (Sheet `inspector`, O §4) | docked: no motion; overlay at 1024–1279: slide `--dur-slow` then camera pan |
| Popovers: Connect to…, Add step picker, Go to [step ▾] (O §5) | `--dur-base`, 4 px from the anchor side |
| Toast (O §9) | Undo, Tidied, Publish toasts, placed above the Problems bar |
| SaveState, VersionChip (O §18) | §7 |
| `animateNodePositions(targets, { duration, onDone })` (new util, §18) | rAF interpolation with `--ease-standard` sampled in JS; used for snap settle (90), Esc return (140), overlap nudge (90) and Tidy (200) |

### 10.11 States

| State | Motion and copy |
|---|---|
| Loading | CanvasSkeleton (static); the real flow appears already fitted in one frame (§6.4) |
| First use (blank flow) | Static hint on the canvas: "Add a step after the trigger. Press A, or use Add step." (FD2 §17); nothing pulses to attract attention |
| Partial (an integration check failed) | Marks and rows update in place; no motion |
| Save error, offline, conflict | SaveState transitions (§7); dragging and connecting keep working offline and queue on this device (FD2 §4.7) |
| View only, viewing a version | No drag, connect, snap or Tidy; camera and selection only; drag attempts show "View only. Duplicate to edit." |
| Review mode (768–1023) and phone | No drag, connect, snap or Tidy; a one-finger drag on a step pans the canvas, so there is no refused drag and no tooltip; the Notice and the read-only sheet footer say "Edit this step on a screen at least 1024 px wide." (R §10.6, §10.9) |
| Permission (private flow not yours) | Forbidden page; no canvas |
| Success | "Saved 11:24 am"; after publishing, `Live v8` and the publish toast; no canvas effect |

### 10.12 Keyboard (motion behaviour of each key)

| Key | Motion |
|---|---|
| `Tab`, `→ ← ↑ ↓` | focus instant; camera only when leaving the safe area (`--dur-slow`) |
| `Alt+Arrow` (step focused) | step moves 16 px, instant; coalesced history and announcement |
| `A` | new step in one frame, connected and focused; camera if needed |
| `C` | Connect to… popover `--dur-base`; new edge in one frame |
| `Delete` | one-frame removal; Undo toast |
| `⌘/Ctrl+Z`, `⇧⌘Z` / `Ctrl+Y` | one-frame restore; camera if needed |
| `⌘/Ctrl+D` | copy in one frame, offset two squares |
| `Shift+0`, `Shift+1`, `Shift+2`, `+`, `−` | camera `--dur-slow` |
| `Esc` while dragging or connecting | returns the step over `--dur-base` / fades the ghost over `--dur-fast` |
| `Alt` while dragging | disables guides and snap |

### 10.13 Microcopy (before → after)

| Before | After |
|---|---|
| "Drag nodes, connect handles, double-click to edit, press ? for shortcuts" (permanent hint) | No permanent hint; blank flows only: "Add a step after the trigger. Press A, or use Add step." |
| (no alignment feedback) | Guide tags: "Top aligned", "Middle aligned", "Bottom aligned", "Left aligned", "Centre aligned", "Right aligned" |
| (silent invalid drop) | Reason tooltip: "Triggers start a call. Nothing connects into them." |
| (no delete feedback, F-FLOW-025) | "Deleted 'Polite close' and 2 connections · Undo" |
| (no layout command) | "Tidied 14 steps · Undo" |

### 10.14 Accessibility

- Every drag has a non-drag path: `Alt+Arrow`, `C`, `Go to [step ▾]`, the Outline (WCAG 2.5.7, FD2 §16).
- Pointer drags are not announced; their keyboard equivalents are (coalesced).
- Programmatic camera moves never move focus away from where the user asked it to be; focus lands on the destination step at the end of the move.
- The canvas animations respect both reduced-motion sources, including every React Flow `duration`.
- Forced colours: guides use `CanvasText`; grown ports keep `data-mark`; the ghost edge is `data-edge`.

### 10.15 Responsive behaviour

| Width | Canvas motion |
|---|---|
| ≥ 1280 | Everything in §10; the inspector is docked (no slide) |
| 1024–1279 | Inspector overlay (slide + pan clear); test panel overlays the canvas bottom when the inspector is open (FD2 §13.6) |
| 1024+ with `pointer: coarse` | Sockets 44 px; the Navigate / Arrange switch (R §10.9) decides whether a one-finger drag pans or moves; guides and settle as on desktop |
| 768–1023 | Review mode (read-only, R §10.6): no drag or connect; tap selects (repaint); the read-only step sheet slides; Outline row tap moves the camera over `--dur-slow` |
| < 768 | The read-only Outline (R §10.6): rows expand in one frame; a row opens the full-screen read-only step sheet (its answers read "Goes to #4 Book site visit"; there is no Go to select to open); the Canvas view follows pinch and pan 1:1 with no animated camera; nothing drags or connects |

### 10.16 Telemetry hooks (optional, no flow content)

| Event | Properties |
|---|---|
| `step_drag_end` | `snapped_to_guide` (bool), `grid_nudge_px` (0–8), `cancelled` (bool), `multi` (count bucket) |
| `connect` | `via` (drag, c_key, go_to, outline), `result` (ok, cancelled, invalid_target) (shared with FD2 §22) |
| `tidy` | `steps_moved` (bucket), `undone_within_10s` (bool) |
| `camera_move` | `cause` (go_to_step, find, follow_along, pan_into_view, fit) |

### 10.17 Acceptance criteria (canvas)

- [ ] No edge has a running animation at any time outside a test run (`document.getAnimations()` filtered to `.react-flow__edge` is empty; no element has the `animated` class).
- [ ] A pointer movement under 4 px on a step selects it and sends no save.
- [ ] During a drag, the step's position equals the pointer delta on every frame (no lag), and no `transition` applies to `.react-flow__node`.
- [ ] Bringing a step's top edge within 6 px of another's shows a guide and the "Top aligned" tag; holding Alt shows neither.
- [ ] On release, the step's final position is a multiple of 16 on both axes and the settle takes ≤ 90 ms; edges stay attached on every frame of the settle.
- [ ] Esc during a drag returns the step to its origin with no history entry and no save request.
- [ ] While connecting, only valid input ports scale; releasing on a valid port creates exactly one edge and announces it.
- [ ] Palette insert (click, Enter, `A`) never places a step overlapping another; the new step is selected, focused and fully visible.
- [ ] Delete produces the Undo toast; Undo restores the step and its connections in one frame and selects it.
- [ ] Tidy is one undo step; edges remain attached during its 200 ms; the draft is marked dirty once, after the animation.
- [ ] Level of detail does not flicker when zoom oscillates between 0.73 and 0.77.
- [ ] With reduced motion, every camera move, settle, return and Tidy completes in one frame.
- [ ] At 1024 × 768, selecting a step under the inspector's area pans it clear after the inspector lands.

---

## 11. Test-run path highlighting

**Purpose and job.** While the author tests a draft (text, browser voice or "Call my phone…"), show which step the conversation is on, which answer matched, and the path taken, so they can see the flow behave without reading the graph. Motion here is the only place a canvas element moves on its own, and it moves once per step.

**Findings addressed.** F-FLOW-016 (no way to test or simulate), F-FLOW-011 ("animate only the path being traversed during a simulation"), F-A11Y-022 (reduced motion), F-A11Y-014 (step changes not announced), F-UX-004 / F-FLOW-004 (trust: the author sees exactly what ran).

**Information hierarchy during a run.**
1. The current step: a `Now` Tag and a 3 px inset `--accent-mark` bar (FD1 "In a test run").
2. The matched answer row on the step just left (`--accent-soft` fill), and the edge just taken, drawn once.
3. Reached steps (a 16 px `check` mark) and traversed edges (`--edge-active`, 2 px).
4. The Test panel's turn rows (N §12.4): what was said, with the step link.

### 11.1 The sequence for one step

```
runtime event: "entered step 4 (Book site visit) via answer Yes of step 3"
t = 0     · step 3: "Now" and the inset bar removed; "Reached ✓" mark added          (one frame)
          · step 3's answer row "Yes": --accent-soft fill; its socket --accent-mark   (one frame)
          · step 4: "Now" Tag and the inset bar                                       (one frame)
          · announce (polite): "Now at Book site visit"
          · Test panel: the system row "Moved to step 4 · Book site visit" appended   (one frame)
t = 0     if step 4 is outside the safe area and Follow along is on:
            camera pans over --dur-slow (200 ms) and the trace waits for it (M4)
t = 0|200 TRACE: the edge Yes → Book site visit is drawn from the socket to the input port
            in --edge-active over --dur-trace (480 ms), --ease-standard
t = 480+  the traced edge stays --edge-active at 2 px; the overlay is removed
```

**Truth first.** The `Now` Tag appears at t = 0, before the trace finishes: the trace is a direction cue, and the state never waits for it (M7).

### 11.2 Rules

| Rule | Detail |
|---|---|
| One trace at a time | If the runtime enters the next step before the current trace ends, the current trace jumps to complete and the new one starts (no queue, no overlap) |
| Fallback paths | A "No reply", "Else", "Not found" or "Didn't connect" edge traces too, and keeps its 5/4 dash: the trace reveals the edge's own dashed stroke through an animated mask, so the one dashed line keeps its meaning |
| Loops back to an earlier step | The back edge traces along its route under both steps; the earlier step becomes "Now" again; its reached mark stays |
| Follow along | On by default. The camera moves only when the current step leaves the safe area (§10.3). Panning or zooming by hand pauses it; a secondary Button "Follow along" fades in over `--dur-base` at the canvas top-centre; clicking it re-centres over `--dur-slow` and resumes |
| Stopped at an invalid step | The step gets `Now` plus a warning Tag "Stopped here"; no trace beyond it; the Test panel's summary row says why (FD2 §13.5). No shake |
| Run ends at an Outcome | The Outcome step is "Reached"; the summary row "Reached 'Visit booked' · 6 turns · 5 steps · 1 min 12 s"; no celebration |
| Restart or edit | All marks, matched rows and active edges clear in one frame |
| Unreached steps | Unchanged (no dimming), so the author can still read them (FD2 §13.4) |
| Browser voice and "Call my phone…" | The same canvas behaviour, driven by the runtime's step events; the Test panel header carries the CallStateTag with the bounded live pulse (§12) |
