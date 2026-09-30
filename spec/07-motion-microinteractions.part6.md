## 10. Flow Designer canvas: select, drag, connect, snap, zoom

**Purpose and job.** Make every edit to a call flow feel direct and legible: the step under the hand stays under the hand, a connection shows where it will land before you let go, and every change the author did not drag (snap, Tidy, undo, Go to step) moves just enough to be followed. The canvas should feel like a precise circuit editor (D §6.5), never like a toy.

**Findings addressed.**

| Finding | Motion answer |
|---|---|
| F-FLOW-011 | No edge animates at rest; React Flow's `animated` is never set; only the test trace moves (§11) |
| F-FLOW-021 | Alignment guides while dragging; grid snap with a 90 ms settle on release; Tidy with animated positions |
| F-FLOW-009, F-FLOW-026 | Palette inserts are placed in the next free slot, connected, selected and panned into view; never stacked on top of another step |
| F-FLOW-006, F-A11Y-001, F-A11Y-007, F-A11Y-028 | Instant focus ring distinct from selection; keyboard traversal pans only when needed; `C` connect and `Alt+Arrow` move have their own feedback |
| F-FLOW-020, F-A11Y-023 | Sockets 10 px with 24 px hit areas (44 on touch); valid input ports grow to 14 px while connecting |
| F-FLOW-001, F-FLOW-025 | Delete removes in one frame, closes the inspector, raises the Undo toast; Undo restores and reselects |
| F-FLOW-005, F-QA-003 | Undo and Redo apply in one frame; the camera follows the restored step |
| F-FLOW-008 | Level-of-detail swaps in one frame, with hysteresis so text never flickers at a threshold |
| F-FLOW-022, F-RWD-014 | Inspector overlay at 1024–1279 pans the selection clear; resizing re-lays out in one frame |
| F-FLOW-002, F-FLOW-037 | Programmatic motion (fit, snap, Tidy frames) never marks the draft dirty mid-animation |

**Information hierarchy while editing.**
1. The step or selection being manipulated (under the pointer, `--e2`, selection treatment).
2. The connection being made (ghost edge, grown target ports).
3. Guides and the "Top aligned" tag.
4. Consequences in the chrome: SaveState to "Unsaved changes", the issues chip count after 300 ms.

### 10.1 Hover and edge hover

| Target | Change | Timing |
|---|---|---|
| Step | border `--border-strong` → `--control`; a free socket shows its "+" quick-add (opacity) | `--dur-fast` in and out |
| Edge | stroke to `--edge-hover` and 2 px; its label appears if hidden at this zoom; tooltip names both ends after 300 ms | colour `--dur-fast`, width 0 ms |
| Socket | cursor `crosshair`; the socket gets a 2 px `--accent-mark` ring | `--dur-fast` |
| Phase ruler segment | fill `--surface-2` | `--dur-fast` |

No lift, no shadow growth, no glow on hover. Hover never changes the selection.

### 10.2 Selection

| Moment | Visual (FD1 step states) | Timing |
|---|---|---|
| Click a step, `Space` on a focused step, or a marquee touching it | header `--accent-soft`, 1 px `--accent-mark` border plus inner ring, sockets `--accent-mark` | fill and border `--dur-fast`; `--e1` → `--e2` **swaps in one frame** (box-shadow is never transitioned) |
| Deselect (Esc, click empty canvas) | reverse | `--dur-fast` |
| Inspector, docked (≥ 1280) | content swaps in one frame; its scroll resets to top instantly | 0 ms |
| Inspector, overlay (1024–1279) | slides in from the right over `--dur-slow`; **if the selected step's box intersects the inspector's area plus 24 px, the camera pans it clear** over `--dur-slow`, starting after the inspector lands | 200 + 200 ms, sequential (M4) |
| Edge selected | stroke `--edge-active` 2 px, label in the selection treatment, its popover (Insert step…, Change target…, Delete) opens | repaint `--dur-fast`, popover `--dur-base` |
| Marquee (`Shift`-drag) | rectangle follows the pointer 1:1: 1 px `--accent-mark` border, `--accent-soft` fill at `--opacity-partial`; touched steps take the selection treatment live | rect 0 ms; steps `--dur-fast` |
| Selection bar ("3 steps selected · Frame · Align · Duplicate · Delete") | rises `--shift-toast` above the Problems bar | `--dur-slow`; exit `--dur-fast` |

### 10.3 Keyboard focus and traversal

- The focus outline (2 px `--focus`, offset 3 px, `--focus-offset-node`) appears in the frame focus arrives. Focus and selection show together when both apply (F §13).
- `→ ← ↑ ↓` move focus along the graph instantly. The camera moves **only** when the newly focused step leaves the **safe area** (the canvas minus 10% on each side and minus any overlay), then pans over `--dur-slow` to bring it to the nearest edge of the safe area, not the centre, so rapid arrowing produces small moves. A new pan request retargets from the current viewport.
- `Enter` / `F2` moves focus into the inspector's Label field in one frame; `Esc` returns it to the step.
- `Tab` into the canvas lands on the first Trigger; the camera pans to it only if it is outside the safe area.

### 10.4 Dragging a step

```
 pointerdown on a step body
   │  moves < 4 px → it is a click (select); nothing moves, nothing saves
   ▼  moves ≥ 4 px (drag threshold)
 DRAG  · the step follows the pointer 1:1: no easing, no inertia, no scale, no tilt
       · --e2 on the dragged step; cursor "grabbing"; text selection off; other steps inert to hover
       · edges re-route every frame (requestAnimationFrame)
       · guides: when an edge or centre of the dragged box comes within 6 px (screen) of another
         step's, a 1 px --accent-mark guide spans both steps and the step is held on that line
         (instant); an info Tag "Top aligned" sits 8 px from the pointer
       · near the canvas edge (within 40 px) the canvas auto-pans, up to 12 px per frame at the edge
   │
   ├─ Esc → the step returns to where it started over --dur-base (140 ms); no history entry, no save
   ├─ Alt held → guides and grid snap are off (place freely)
   ▼ release
 SETTLE · position rounds to the 16 px grid; the step glides the ≤ 8 px remainder over --dur-fast
       · one history entry; SaveState → "Unsaved changes"; the draft saves 300 ms later
```

| Detail | Rule |
|---|---|
| Multi-step drag | The whole selection moves together; guides compare the selection's bounding box |
| Drag into a frame | The frame's border repaints to `--accent-mark` over `--dur-fast` while the pointer is inside it; on release the step becomes a member |
| Drag onto another step | Allowed to overlap during the drag; on release, if the step overlaps another by more than 50%, it is nudged to the nearest free grid slot to the right over `--dur-fast` (never left stacked, F-FLOW-021) |
| Keyboard move (`Alt+Arrow` on a focused step) | Moves 16 px per press, **instant** (no settle), no guides; presses within 1 s coalesce into one history entry and one announcement, "Moved Ask about a site visit" |
| Reduced motion | The drag itself is unchanged (it is the user's own motion); the settle, Esc return and auto-pan easing become instant |
| View-only flow | Steps do not move; the cursor stays default; a drag attempt shows the reason tooltip "View only. Duplicate to edit." after 300 ms |
| Review mode (768–1023) and phone | Steps do not move: a one-finger drag on a step pans the canvas (R §10.9), so nothing is refused and no tooltip appears; the limit is stated once, in the Review Notice |

**Why snap on release, not during the drag.** React Flow's `snapToGrid` makes the step jump in 16 px increments under the cursor, which fights the hand (M3). Holding the step on alignment guides during the drag (the common need) and rounding to the grid on release (the tidy result) gives both precision and a direct feel.

### 10.5 Connecting

```
 pointerdown on an answer socket (10 px, hit 24 px; 44 px on coarse pointers)
   ▼ ≥ 4 px
 GHOST · a 2 px --edge-active edge at --opacity-drag (0.6) from the socket to the pointer, routed like
         a real edge, updated every frame
       · every valid input port grows 10 → 14 px with a 2 px --accent-mark ring (transform scale, 90 ms)
       · invalid targets (the source step itself, Trigger steps, which have no input) do not change;
         hovering one shows the not-allowed cursor and, after 300 ms, the reason tooltip:
         "Triggers start a call. Nothing connects into them."
       · within 24 px of a valid port the ghost's end snaps to it (instant), the port fills
         --accent-mark and the target step's border repaints to --accent-mark (90 ms)
   │
   ├─ release on a valid port → the edge is created in one frame with its label ("Yes"); ports shrink
   │    back (90 ms); an amber "Not connected" answer repaints to connected (90 ms) and loses its stub;
   │    announce "Connected Yes to Book site visit"; issues recompute after 300 ms
   ├─ release on empty canvas → the ghost holds, static; the Add step picker opens at the release
   │    point (popover, 140 ms); choosing a type inserts the step there, already connected;
   │    Esc removes the ghost (fade 90 ms)
   ├─ release anywhere else, or Esc → the ghost fades over --dur-fast; nothing is created
   ▼
 RE-ROUTE an existing edge: drag its arrowhead end; the edge becomes the ghost; Esc returns it (140 ms)
```

**Without dragging (P5).** `C` on a focused socket or step opens "Connect to…" (a combobox popover, `--dur-base`); `Go to [step ▾]` in the inspector does the same. The new edge appears in one frame; if its target is outside the safe area, the camera pans over `--dur-slow` so both ends are visible; focus stays on the socket.

### 10.6 Adding, duplicating, deleting, undoing

| Action | Result | Motion |
|---|---|---|
| Palette click or `Enter`, or `A` on a focused step | The new step is placed after the selected step in the next free slot of the next rank (never on top of another), connected, selected and focused | appears in **one frame** (no pop-in); camera pans over `--dur-slow` only if it lands outside the safe area |
| Palette drag | The tile follows the pointer at `--opacity-drag`; over the canvas it becomes a step silhouette; hovering an edge highlights it (`--edge-hover`, 2 px): "drop to insert between"; drop inserts and splits the edge in one frame | pointer 1:1 |
| "+" on a free socket | The search-first picker opens at the socket (popover); the result is placed and connected as above | popover `--dur-base` |
| Duplicate (`⌘/Ctrl+D`) | The copy is placed 2 grid squares right and down, named "… (copy)", selected | one frame |
| Delete (`Delete`, menu) | The step and its connections disappear in one frame; the inspector closes (overlay mode fades 90 ms); focus moves to the previous step in graph order; Undo toast "Deleted 'Polite close' and 2 connections · Undo" | toast only |
| Undo / Redo | The graph returns in one frame; the restored step is selected; the camera pans to it over `--dur-slow` if it is outside the safe area | camera only |
| Tidy | Every moved step interpolates to its new position over `--dur-slow` (edges follow each frame); then, if the result is outside the viewport, Fit runs over `--dur-slow`; one history entry; toast "Tidied 14 steps · Undo" | 200 + 200 ms, sequential |
| AI draft "Apply to draft" | The canvas updates in one frame; added and changed steps carry the words "New" and "Edited"; the camera fits to the changes over `--dur-slow` (F-FLOW-031) | camera only |

### 10.7 Camera: pan, zoom, fit, go to

| Input | Motion |
|---|---|
| Wheel, trackpad pinch, `Space`-drag, middle-button drag, touch pan and pinch | 1:1 with the input; no added easing or inertia (OS scroll momentum is the user's own) |
| Zoom buttons, `+` / `−`, `Shift+0` (100%), `Shift+1` (fit all), `Shift+2` (fit selection) | viewport animates over `--dur-slow`, `--ease-standard` |
| Find result (`⌘/Ctrl+F`), Problems bar "Go to step", `Alt+.` / `Alt+,` issues, Outline row, turn-row step link | camera moves over `--dur-slow`, **then** the step is selected and focused (focus lands at t = 0 of the arrival frame) |
| Minimap click or drag | click: `--dur-slow`; drag: 1:1 |
| Window or panel resize | the canvas re-lays out in one frame, keeping the centre; it re-fits in one frame only when the mode changes (for example entering Review mode) (F-RWD-014) |
| Reduced motion | every programmatic camera move is instant (`duration: 0`) |

### 10.8 Level of detail, phase ruler, frames, marks

| Element | Rule |
|---|---|
| Level of detail (≥ 0.75 full · 0.5–0.75 compact · < 0.5 block, D §6.5) | swaps in **one frame**; hysteresis ±0.03 (zooming out goes compact below 0.72; zooming in goes full above 0.78) so text never flickers at a threshold |
| Phase ruler filter (click "Logic 1") | the other phases' glyph tiles, sockets and edges fade to `--opacity-dim` and their fill changes to `--surface-2` over `--dur-base`; their text never fades (F §10); clicking again or Esc restores over `--dur-base`; reduced motion keeps the fade (opacity and colour only) |
| Phase columns toggle | bands appear and disappear in one frame; nothing moves |
| Zoom and the 12 px floor | during a pan, wheel or pinch the text scales with the viewport transform; at `onMoveEnd` the counter-scale is re-applied in one frame (quantised `--zoom`, FD1 §5.5); no per-frame restyle |
| Frame collapse / expand | one frame; the chevron rotates over `--dur-fast`; edges re-route in the same frame |
| Validation marks (error, warning, "Not connected") | update 300 ms after an edit; **never animate** (FD2 §12.5); the issues chip count changes in place |
| Edited / New words (compare with live) | static |
| Edges at rest | static, always; `animated` is never passed to React Flow (lint, §15.5) |

### 10.9 Wireframes

```
DESKTOP ≥1440 · dragging "Ask budget" into line with "Greet"
┌──┬─────────────────────────────────────────────────────────────────────┬──────────────┐
│▣ │ Flows / Site-visit qualifier ▾  Draft · 3 changes ▾  ● Unsaved changes│ Test Publish v8…│
│  │ ◉Trigger 2 → ◇Logic 1 → ▢Action 3 → ⚑Outcome 4    Live v7 answers …  │              │
│◎ ├─────────────────────────────────────────────────────────────────────┤ Inspector    │
│  │  ╭Trigger──────╮      ┌Action · Greet──────┐                        │ (unchanged   │
│⤳ │  │ Inbound call├─────►│                    │                        │  during the  │
│  │  ╰─────────────╯      └────────────────────┘                        │  drag)       │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ guide 1 px accent ─ ─ ─ ─   │              │
│  │                       ┌Logic · Ask budget──┐ ◄ follows pointer 1:1  │              │
│  │                       │ e2, cursor grabbing│  [Top aligned]         │              │
│  │                       └────────────────────┘                        │              │
│  │  [−] 85% [+] [Fit]                                        ┌minimap┐ │              │
├──┴─────────────────────────────────────────────────────────────────────┴──────────────┤
│ ⚠ 1 warning  Book site visit: template pending approval. Go to step    ─ Path ┄ Fallback│
└──────────────────────────────────────────────────────────────────────────────────────┘

LAPTOP 1024–1279 · select a step under the inspector's future position
 t = 0          click step (right side of canvas) → selection treatment (90 ms)
 t = 0–200      inspector slides in from the right over the canvas
 t = 200–400    camera pans the step left, clear of the inspector (+24 px)
┌──┬───────────────────────────────────────┐      ┌──┬─────────────────────┬─────────────┐
│  │                         ┌Step ■sel┐   │ ───► │  │   ┌Step ■sel┐  ◄pan  │◄ Inspector │
│  │                         └─────────┘   │      │  │   └─────────┘       │  320        │
└──┴───────────────────────────────────────┘      └──┴─────────────────────┴─────────────┘

TABLET 768–1023 · Review mode (read-only canvas + Outline)       PHONE <768 · Outline only
┌──────────────┬────────────────────────────┐                  ┌───────────────────────┐
│ Outline      │ read-only canvas            │                  │ Site-visit qualifier  │
│ ▸ Inbound    │ tap = select (90 ms repaint)│                  │ Live v7 · Draft 3 ▾   │
│   ▸ Ask …  ◄─┼─ tap row: camera 200 ms     │                  │ ▾ Inbound call        │
│     Yes → …  │ pinch/pan 1:1; no dragging  │                  │   ▾ Ask about a visit │ expand: 1 frame
│              │ step sheet slides 200 ms    │                  │     If Yes → Book …   │ chevron 90 ms
└──────────────┴────────────────────────────┘                  │ [Test]  [Publish v8…] │
                                                               └───────────────────────┘
```

On phones and in tablet Review mode there is no drag, connect, snap or Tidy; motion is limited to camera moves (tablet), sheets and disclosure chevrons.
