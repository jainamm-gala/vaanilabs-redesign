## 4. Overlays: dropdowns, popovers, tooltips, dialogs, sheets

**Purpose and job.** Show where a floating surface came from and where it went, so the operator never loses their place in the table, canvas or call behind it. Motion is short, directional and never holds up focus or input.

**Findings addressed.** F-A11Y-005 and F-A11Y-027 (focus never enters dialogs), F-VIS-014 and F-VIS-015 (clipped tooltips), F-VIS-022 (blurred glass scrim), F-VIS-033 (tablet sidebar pushes content), F-UX-010 (cramped nested-scroll panel), F-A11Y-022.

**Hierarchy.** 1st: the overlay's content (focus lands there at t = 0). 2nd: the edge or trigger it came from (direction of travel). 3rd: the page behind (dimmed by the flat scrim only for modals).

### 4.1 The overlay motion table

Entrance uses the listed duration and `--ease-standard`. **Every exit is an opacity fade over `--dur-fast`**, with no travel back (O §1.5). Only `transform` and `opacity` animate.

| Container | Enter | Distance | Duration | Exit | Reduced motion |
|---|---|---|---|---|---|
| **Tooltip** | opacity | none | `--dur-base`, after `--timing-tooltip-delay` (300 ms) on hover; **0 ms delay on keyboard focus**; adjacent triggers within 300 ms skip the delay *and* the fade | `--dur-fast` | same (fade is state) |
| **Menu, ContextMenu, Select listbox, Combobox list** | opacity + translate from the trigger side | `--shift-popover` 4 px | `--dur-base` | `--dur-fast` | fade only |
| **Submenu** | opacity | none | `--dur-base` | `--dur-fast` | same |
| **Popover** (Filter, Columns, date range, info, "Go to [step]", "Connect to…") | opacity + translate from the anchor side | 4 px | `--dur-base` | `--dur-fast` | fade only |
| **Call gate** (modal popover, `--radius-12`) | as Popover | 4 px | `--dur-base` | `--dur-fast` | fade only |
| **Scrim** (modals only, flat `--scrim`, never blur) | opacity 0 → 1 | – | `--dur-slow` | `--dur-fast` | same |
| **Dialog, ConfirmDialog, CommandPalette** | opacity + `translateY(var(--shift-dialog))` → 0 | 8 px | `--dur-slow` | `--dur-fast` | fade only |
| **Sheet, overlay mode** (record 440, detail 560 at 1024–1439) | `translateX(var(--shift-sheet))` → 0 from the right edge; no scrim | own width | `--dur-slow` | `--dur-fast` | fade in place |
| **Sheet, docked** (≥ 1440) | **none**: the grid column appears in one frame; the table does not animate its width (O §4.7) | – | 0 | 0 | same |
| **Gate sheet** (Publish 640, Top up, conflict) | slide from the right + scrim | own width | `--dur-slow` | `--dur-fast` | fade |
| **Bottom sheet** (phone popovers, selects, Call gate, MoreSheet, full-screen sheets) | `translateY(var(--shift-sheet))` → 0 from the bottom + scrim | own height | `--dur-slow` | `--dur-fast` | fade |
| **Rail overlay** (1024–1279) and **NavSheet** (tablet) | `translateX(-100%)` → 0 from the left + scrim | own width | `--dur-slow` | `--dur-fast` | fade |
| **Flow inspector, overlay mode** (1024–1279) | slide from the right; the canvas pans the selection clear (§10.2) | own width | `--dur-slow` | `--dur-fast` | fade; pan instant |

**Direction from the anchor.** Radix sets `data-side` on floating content. The content starts offset *toward* its trigger and settles into place, so it appears to come out of the trigger: `bottom` starts at `translateY(-4px)`, `top` at `+4px`, `right` at `translateX(-4px)`, `left` at `+4px`. No scale, no `transform-origin` games, no arrow.

### 4.2 Content changes inside an open overlay

| Change | Motion |
|---|---|
| Switching records with J / K or Previous / Next in a sheet | The sheet stays; header and body content swap in **one frame**; the body scrolls to top instantly; "Lead 4 of 24" is announced (O §4.4) |
| Switching tabs in a sheet | Indicator slides over `--dur-base`; the panel swaps in one frame |
| Multi-step dialog ("Import leads": Checking → Mapping → Importing) | Body content replaces in one frame; the dialog keeps its size or resizes in one frame (no height animation); focus moves to the new step heading |
| Inline discard state (O §2.5) | The footer content swaps in one frame; focus moves to "Keep editing" |
| Palette results | Instant, no list animation (O §8.7) |
| Loading inside an overlay | Sheet skeleton after 200 ms (O §13.2); the header and tabs are real at once |

### 4.3 Timing rules shared by every overlay

1. **Focus at t = 0.** Focus moves into the overlay in the same frame it mounts (O §1.3), never on `animationend`. Content is interactive at once.
2. **Closing is inert at t = 0.** A closing overlay gets `inert` and `pointer-events: none` immediately; focus returns to the trigger (or its fallback) in the same frame; the fade then plays.
3. **Interruptible.** Closing during an entrance reverses from the current opacity over `--dur-fast`. Reopening during an exit retargets forward. Rapid toggling never queues animations.
4. **One entrance per layer (B3).** Opening the palette while a sheet is still entering finishes the sheet's animation at once.
5. **Scroll lock without shift.** Modal overlays lock `<body>` scroll; `scrollbar-gutter: stable` (base.css) keeps the page from jumping by the scrollbar's width.
6. **Nested floating content.** A Select inside the Publish gate opens with popover motion above it (`--z-popover` 60 over `--z-modal` 50); the gate does not move.

### 4.4 Optional: swipe to dismiss on phones

Bottom sheets may add a 32 × 4 px grabber (`--border-strong`, `--radius-2`) in a 24 px hit strip at the top (§18, `SheetGrabber`). Dragging it moves the sheet down 1:1; releasing beyond 30% of the sheet's height, or faster than 0.5 px/ms, closes it (it continues downward over at most `--dur-slow`); otherwise it returns over `--dur-base`. With reduced motion the drag still follows the finger and the release completes instantly. Close, Done or Back is always present; the swipe is never the only way out. A dirty sheet ignores the swipe and shows the inline discard state.

### 4.5 Wireframes: the same record sheet at each breakpoint

```
DESKTOP ≥1440 · docked (no motion)          LAPTOP 1024–1439 · overlay (slides from the right, 200 ms)
┌────┬──────────────────────┬─────────┐     ┌────┬─────────────────────┬─────────┐
│nav │ Leads table          │ Lead    │     │nav │ Leads table         │◄─ Lead  │ translateX(100%) → 0
│    │                      │ sheet   │     │    │ (stays interactive) │  sheet  │ no scrim
│    │                      │ 440     │     │    │                     │  e3     │ exit: fade 90 ms
│    │ grid column appears  │         │     │    │                     │         │
│    │ in one frame         │         │     │    │                     │         │
├────┴──────────────────────┴─────────┤     ├────┴─────────────────────┴─────────┤
│ Baseline                            │     │ Baseline                           │
└─────────────────────────────────────┘     └────────────────────────────────────┘

TABLET 768–1023 · modal, full height          PHONE <768 · full screen from the bottom
┌─────────────────────────────┐               ┌───────────────────┐
│ ▒▒▒▒▒▒▒▒▒▒▒▒┌──────────────┐│ scrim fade    │ ← Back to Leads   │ translateY(100%) → 0
│ ▒ list ▒▒▒▒▒│◄─ Lead sheet ││ 200 ms        │ Lead 1042 · Pune  │ 200 ms, scrim behind
│ ▒▒▒▒▒▒▒▒▒▒▒▒│   min(560,   ││ sheet slides  │ Overview Calls …  │ bottom bar hidden
│ ▒▒▒▒▒▒▒▒▒▒▒▒│   100%)      ││ 200 ms        │ …                 │ while open
│ ▒▒▒▒▒▒▒▒▒▒▒▒└──────────────┘│               │ [ Call… ]  sticky │
└─────────────────────────────┘               └───────────────────┘
```

### 4.6 States (overlay motion only)

| State | Motion |
|---|---|
| Opening while data loads | The container enters normally; its skeleton appears after 200 ms (no double animation) |
| Record gone or error inside | EmptyState or SectionError in one frame; the sheet does not close or shake |
| Offline while open | The ConnectionBar appears above the page; the overlay does not move |
| Permission denied action inside | The action is `aria-disabled` with its reason; no motion |
| Success inside a modal | Feedback about the modal's own action appears inside it; background toasts queue until it closes (O §1.6) |

### 4.7 Accessibility

- Tooltips appear on keyboard focus with no delay and stay while hovered (WCAG 1.4.13, O §6.3).
- Motion never delays focus, so screen-reader and keyboard users are never waiting on an animation.
- Reduced motion keeps every fade (fades are short state changes) and removes every slide and shift through the zeroed `--shift-*` tokens.

### 4.8 Acceptance criteria (overlays)

- [ ] For every overlay type, `document.activeElement` is inside the overlay in the first animation frame after opening (Playwright: open, then evaluate synchronously).
- [ ] Every exit takes 90 ms and moves nothing (computed `transform` is unchanged during the exit).
- [ ] With reduced motion (media or `data-motion="reduce"`), no overlay's computed `transform` changes at any point.
- [ ] Docked sheets at ≥ 1440 appear with no transition, and the table's width change happens in one frame.
- [ ] Opening the palette during a sheet entrance leaves no running animation on the sheet.
- [ ] No overlay uses `backdrop-filter`; the scrim is a flat colour.

---

## 5. Toasts

**Purpose and job.** Report the outcome of an action whose effect is off-screen, and offer the one follow-up that matters (Undo, Retry, View, Roll back to v7…), without covering the work (O §9).

**Findings addressed.** F-A11Y-014 (silent async outcomes), F-FLOW-025 and F-FLOW-001 (no delete feedback), F-UX-019 (silent failures), F-QA-020 (unproven success).

**Hierarchy.** The newest toast is the most salient; errors and Undo persist; nothing on the toast animates after it has arrived.

### 5.1 Motion

| Moment | Motion | Duration | Reduced |
|---|---|---|---|
| Enter | opacity + `translateY(var(--shift-toast))` → 0 | `--dur-slow` | fade only |
| Exit (timeout, Dismiss, Esc, superseded) | opacity | `--dur-fast` | same |
| Others in the stack reflow | **instant** (O §9.5); never a sliding stack | 0 | same |
| Coalescing ("Deleted 3 steps · Undo") | text updates in place; no re-entry; the timer restarts | 0 | same |
| Repeated identical error ("Couldn't refresh (3)") | count updates in place | 0 | same |
| Progress toast | message and 2 px bar update in place; bar `transform: scaleX()` over `--dur-base`, at most one update per 140 ms; becomes success or error **in place** | `--dur-base` | bar jumps |
| Swipe right (touch) | follows the finger 1:1; release past 40% of its width, or faster than 0.5 px/ms, exits right (`translateX(100%)` + opacity over `--dur-base`); otherwise returns over `--dur-base` | – | release completes instantly |
| Queued toasts (after a modal closes) | enter **one at a time**, each after the previous entrance ends (200 ms apart) (B3) | – | fades 200 ms apart |

**No countdown bar** on timed toasts: a shrinking bar is six seconds of idle motion. The 6 s timer pauses on hover, on focus inside the toast and while the tab is hidden (O §9.2).

### 5.2 Placement per breakpoint

```
DESKTOP / LAPTOP                               FLOW DESIGNER (Baseline hidden)
┌─────────────────────────────────────┐        ┌───────────────────────────┬─────────┐
│                                     │        │ canvas                    │inspector│
│                     ┌─────────────┐ │        │              ┌──────────┐ │ 320     │
│                     │ ✓ Lead saved│ │ ↑ 8 px │              │ ↶ Deleted│ │         │
│                     └─────────────┘ │ 200 ms │              │ 'Polite… │ │         │
├─────────────────────────────────────┤        │              └──────────┘ │         │
│ Baseline (toasts sit 16 px above)   │        ├───────────────────────────┴─────────┤
└─────────────────────────────────────┘        │ Problems bar (toasts sit 16 px above)│

TABLET                                         PHONE
┌─────────────────────────────┐                ┌───────────────────┐
│                             │                │                   │
│             ┌─────────────┐ │                │┌─────────────────┐│ full width − 32
│             │ toast       │ │ bottom 16 px   ││ toast           ││ above bottom bar
│             └─────────────┘ │                │└─────────────────┘│ + safe area + 8
└─────────────────────────────┘                ├───────────────────┤
                                               │ ⌂  ☰  ▤  ⤳  ⋯     │
```

### 5.3 Copy and kinds

The kinds, copy and timing are O §9.2's. Motion adds one rule: **the glyph never animates** (no drawing check, no spinning undo arrow); the progress kind uses the Spinner (`--dur-spin`) until it becomes success or error.

| Kind | Example | Stays |
|---|---|---|
| success | "Default flow updated · used by Cockpit, Meetings and Leads" | 6 s |
| undo | "Deleted 'Polite close' and 2 connections · Undo" | until dismissed |
| error | "Couldn't save. Your last 2 edits are on this device · Retry" | until resolved |
| progress | "Importing 1,240 leads… 820 done · View" → "1,212 imported · 28 skipped" | until done |
| publish | "v8 is live on 1 number and 1 batch · Roll back to v7…" | 6 s |

### 5.4 Acceptance criteria (toasts)

- [ ] A toast rises 8 px and fades in over 200 ms; with reduced motion it only fades.
- [ ] When a second toast arrives, the first does not animate; its position changes in one frame.
- [ ] Three toasts queued behind a modal enter one at a time after it closes, 200 ms apart.
- [ ] No timed toast shows a countdown bar; the timer pauses on hover and focus.
- [ ] A progress toast turns into a success or error toast without leaving and re-entering.
- [ ] Toasts never cover the Baseline, the Problems bar, the BottomBar or a focused element (O §9.3).
