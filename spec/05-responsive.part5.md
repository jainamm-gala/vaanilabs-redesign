---

## 10. Flow Designer across breakpoints

The desktop Flow Designer is D §6.5 and FD1 §3 (header 48, phase ruler with the live note, tool rail, canvas, inspector 320–480, Problems bar, rail forced, no Baseline). This section says what it becomes below 1280 and on touch. **It follows the one responsive decision in D §6.5 and FD1 D11: edit from 1024, review from 768, the Outline below.** Mock: `05-responsive-flow.html` (renders `05-responsive-flow-1440.png`, `-1440-dark.png`, `-1024.png`, `-768.png`, `-768-step.png`, `-390.png`, `-390-step.png`); it links the shared step grammar `04-flow-designer/flow-grammar.css`, so its steps are drawn exactly as FD1's.

### 10.1 Purpose and jobs to be done, by device

| Device class | Who, when | Job to be done | Primary action |
|---|---|---|---|
| Desktop and laptop (≥ 1024) | Flow builder at a desk | "Author a flow, wire every branch, prove it works, put it live on purpose." | Publish v8… |
| Landscape tablet (≥ 1024, coarse pointer) | Builder on an iPad with or without a keyboard | The same job, by touch | Publish v8… |
| Portrait tablet (768–1023) | Team lead in a review, often with a client | "Walk through the flow with someone, hear it, compare it with live, publish or roll back." | Test · Publish v8… |
| Phone (< 768) | Anyone on call for the flow: after a complaint, during a campaign, at night | "Something is wrong with a live flow: see what it says, find the step, test it, roll back or publish a draft that is ready." | Roll back to v7… · Publish v8… |

### 10.2 Decision: four modes; tablets review, phones read

| Mode (`flowMode`, §2.4) | Width × height | What it is |
|---|---|---|
| **Full** | ≥ 1280 | FD1 §3 unchanged: docked inspector, tool rail, minimap, Problems bar |
| **Compact** | 1024–1279 | The same editor; the inspector overlays the canvas from the right and pans the selection into view; no minimap; SaveState shows its icon with the time in the tooltip. With a coarse pointer (landscape tablets) sockets hit 44 px and a **Navigate / Arrange** switch joins the canvas controls (§10.9) |
| **Review** | 768–1023 (and ≥ 480 tall) | **Review, test and publish; no step edits.** The Outline (`--size-left-panel-tablet` 320) beside a read-only canvas at the Compact band, an info Notice, Test, Compare, Version history, Restore as draft, Roll back and Publish. A step opens as a read-only sheet |
| **Phone** | < 768, or < 480 tall | **The Outline is the page**, read-only: chip row, Outline · Canvas switch, Problems as a full-screen list, a text and browser-voice test, versions, Publish and Roll back |

**Why tablets review in v1 (withdraws this spec's earlier R5, "tablets edit").**
1. **Editing needs the graph and the step at once.** At 768–1023 portrait a step sheet of 400 px leaves a canvas of 368–623 px, the width FD1 measured as unusable (F-FLOW-022: 294 px at 1024 with the inspector open). Review needs only one of them at a time, which the Outline and the read-only sheet give.
2. **Touch precision and drag ambiguity** are real on a portrait canvas (F-RWD-014: synthetic one-finger pans failed). Landscape tablets at ≥ 1024 do edit, with 44 px sockets, tap-to-connect and Navigate / Arrange, because the Compact layout has room for them.
3. **No evidence of demand yet.** The audit saw people *reach* the builder at iPad widths (F-RWD-003: ACTIVATE clipped at 768–877), not author there. `review_edit_attempt` (FD1 §18) and `large_screen_notice_seen` (§10.12, §16) measure it; tablet editing is a v1.1 candidate with its own layout, not a squeezed desktop.
4. **Safety is already solved by Draft and Publish**, so Review loses nothing that matters to a reviewer: Test, Compare, Roll back and Publish all work.

**Why the phone reads but does not edit.** At 360–390 px one step is readable at a time. Changing wording or re-pointing answers changes what callers hear and which paths reach an Outcome, which can only be judged with the path in view, and a mistyped fix on a phone still needs the Publish gate. The phone jobs are triage: read the live flow, find the failing step, run a text test, roll back, or publish a draft someone finished on a computer.

**Identical in every mode:** the Draft and Live model (and interim I1, FD2 §4.9), SaveState, VersionChip, validation (one rule set, 300 ms), the Publish gate, Roll back, the step names, the stable step numbers (`#n`) and node positions. **Positions are data, never per-device:** a tablet zooms the stored layout; it never re-lays it out.

### 10.3 Findings addressed

| Finding | Today | What changes |
|---|---|---|
| F-RWD-003 (high) | ACTIVATE clipped off-screen at 768–877, unreachable from any menu; the phone toolbar appears only on a fresh load | Publish v8… is the last item of the header, `flex-shrink: 0`, never folds (§5.9); it is also in `⋯`; modes switch live on `matchMedia` (§2.4) |
| F-RWD-014 | Canvas 40 % at 768, palette starts open, no fitView on resize, touch pan failed, validation badge over the Start node, 34 px zoom controls over nodes, inspector covers 82 % with a big red Delete Node, ⌘ hints on Android | Review mode: Outline + read-only canvas at fit, no palette, no delete; debounced re-fit on container resize (§10.9); explicit `panOnDrag` / `zoomOnPinch`; issues in the header chip; zoom controls beside, never over, the steps; read-only step sheet; no keycaps on touch |
| F-FLOW-022 | Canvas 36–52 % of the screen, 294 px wide at 1024 with the inspector | Compact mode overlays the inspector; the Baseline and wallet banner are gone in the designer |
| F-FLOW-008 | 3.8–9.3 px text at fit zoom | Level of detail with the 12 px floor at rest and Block labels (FD1 §5.5) in every mode |
| F-FLOW-034 | Full screen hides status and has no visible exit | **No full-screen mode at any width** (FD1 §3.1, X7): the header, SaveState and issues are always visible |
| F-A11Y-001, F-FLOW-006, F-A11Y-023 | 9 × 9 px mouse-only handles | ≥ 1024: Outline editor, Go to selects, tap-to-connect, 44 px socket hits on coarse pointers |
| F-FLOW-001, F-QA-002 | Autosave into the live flow | No mode writes the flow before Publish; opening a flow on any device writes nothing |
| F-FLOW-004, F-FLOW-010 | "FLOW VALIDATED" on invalid flows | Issues chip, step marks and the Problems list, computed from one rule set |

### 10.4 Information hierarchy

| Mode | 1st | 2nd | 3rd |
|---|---|---|---|
| Full, Compact | The canvas and the selected step | Header state: Draft · 3 changes, SaveState, Live v7, issues, **Publish v8…** | The inspector fields; the Problems bar |
| Review | The Outline, nested by branch with issue marks | Header state and **Test · Publish v8…** | The read-only canvas and the Notice |
| Phone | The Outline | The chip row (Draft, Live, issues) and the sticky **Test · Publish v8…** bar | The Outline · Canvas switch |

### 10.5 Layouts

**Full ≥ 1280** (`05-responsive-flow-1440.png`): FD1 §3.2. Canvas about 1016 × 780 at 1440 × 900 with the inspector docked.

**Compact 1024–1279** (`-1024.png`): FD1 §3.2 "Laptop 1024–1279". Header compressed (breadcrumb hidden, `Saved` short, Tidy and the wallet chip in `⋯` unless the wallet is low), inspector as an overlay, no minimap.

**Review 768–1023** (`-768.png`, `-768-step.png`). FD1 §3.2 "Tablet 768–1023" is the design: the shell TopBar (52, ☰ opens the NavSheet) stays; the 48 px flow header sits under it; the info Notice spans the page under the header; Problems is a tab beside the Outline (FD2 §12.4), not a bar.

```
┌ ☰  Site-visit qualifier                                   [₹2,340.50]  ⌕ ┐ 52 TopBar
├ [Draft · 3 changes ▾] [● Live v7] [⚠ 1 warning]   [▷ Test] [Publish v8…] [⋯] ┤ 48
├ ⓘ Editing steps needs a screen at least 1024 px wide. You can review, test and publish here. ┤
├ Outline · Problems 1 (tabs) ────┬ read-only canvas (Compact band, pinch and pan) ┤
│ ■ Inbound call             #1   │  (■ Inbound)─┐ ┌◇ Ask about a site visit ┐    │
│ ■ Outbound batch           #2   │  (■ Outbound)┘ │ Yes · Later · No · No re…│    │
│ ◇ Ask about a site visit   #3   │                └──────────────────────────┘    │
│   ↳ If Yes · haan, zaroor       │        ▢ Book site visit ⚠   ⚑ Visit booked  │
│     ▢ Book site visit  ⚠ 1  #4  │                                               │
│       ⚑ Visit booked       #5   │                                               │
│   ↳ If Later · baad mein        │                                               │
│     ⚑ Callback set         #6   │ [− 60% +] [Fit]                               │
└─────────────────────────────────┴───────────────────────────────────────────────┘
Step open (tap a row or a step): a read-only Sheet `detail` (`min(var(--size-sheet-detail), 100%)`, FD1 §3.2), full height, non-modal:
header (tile, phase line with #n, title, Close) · fields as read-only values (C §3.2 read-only state) · answers with
their Go to targets · Issues for this step · footer "Edit this step on a screen at least 1024 px wide. · Copy link".
```

**Phone < 768** (`-390.png`, `-390-step.png`). FD1 §3.2 "Phone 320–767" is the design, and the only phone layout: the shell's phone TopBar, unchanged (Back to Flows "‹ Flows", the flow name as the title, the wallet chip, which drops first when the title would fall under 120 px (§4.3), and Search); a chip row in header order (Draft · 3 changes ▾, ● Live v7, issues chip "⚠ 1 warning", which opens the Problems list full screen) that ends with the flow's `⋯`; a SegmentedControl **Outline | Canvas** (Canvas = the read-only canvas at Fit, pinch and pan); the Outline nested by branch with 48 px rows; a sticky action bar (**Test** · **Publish v8…**, 1:1, 44 px) directly above the BottomBar, so all 12 destinations stay reachable (F-RWD-001). Publish never leaves the bar: with a clean draft it stays, `aria-disabled`, with its reason (§10.8). A row opens a full-screen read-only step sheet ("‹ Outline" Back). `⋯` holds Version history, Compare with live, Roll back to v7…, Discard draft changes… and Flow settings (read-only). At 320 px the chip row wraps to two lines; nothing scrolls sideways.

**Landscape phone (e.g. 844 × 390):** tablet shell (TopBar with ☰), Phone mode: the chip row folds into the TopBar (Draft chip and Publish), the Outline · Canvas switch stays. **200 % zoom on a 1920 × 1080 screen (about 960 × 485 CSS px)** resolves to Review mode; **200 % on 1440, 1366 or 1280 screens (720, 683 or 640 px wide)** to Phone mode.
