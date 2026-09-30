### 10.6 Capability matrix (the one source)

This is the only capability matrix for the Flow Designer. D §6.5, FD1 D11 and §17, FD2 §21 and 06 §19.B summarise it and link here; if a summary and this table disagree, this table wins and the summary is the bug.

| Capability | Full ≥ 1280 | Compact 1024–1279 | Review 768–1023 | Phone < 768 |
|---|---|---|---|---|
| See the whole flow | Canvas + minimap; Outline docked for flows over 20 steps | Canvas | Outline + read-only canvas at the Compact band (≥ 0.5), panned to the selection | Outline (default) and Canvas (read-only, Block band) |
| Find a step | `⌘/Ctrl+F`, `#9` | same | Outline filter | Outline filter |
| Open a step | Click, `Enter` | same | Tap or `Enter`: read-only sheet | Tap: full-screen read-only sheet |
| Edit step text, answers, targets, add, delete, move, frame, Tidy | Inspector, palette, canvas | same (touch: Navigate / Arrange) | **No**: the Notice explains | **No** |
| Issues | Chip, step marks, Problems bar and panel | same | Chip → "Problems" tab beside the Outline, step marks | Chip → full-screen Problems list; Outline badges |
| Test by text | Test panel | same | Test sheet (full height) | Full-screen text test |
| Test in the browser (voice) | Test panel | same | Test sheet | Full-screen test, Browser voice mode (FD2 §13.6) |
| Test call to my phone | Test → Call gate | same | same | Not here: "Call my phone…" stays in the Cockpit on phones (FD2 §13.6, §11 here) |
| Compare with live, Version history, Restore as draft | Version menu, left panel | same | Version menu; History as a sheet | `⋯` › full-screen sheets |
| Publish v8… (Publish gate) | Sheet 640 | same | Modal, full height | Full screen |
| Publish with a clean draft | Visible, `aria-disabled`, reason "Nothing to publish. Your draft matches Live v7." (FD2 §4.3) | same | same | same, in the sticky bar |
| Roll back to v7… | Publish toast (6 s), then the version menu and History (FD2 §5.7) | same | same | same (`⋯`) |
| AI draft ("Describe a change") | `⋯`, `/flows/new` | same | No | No |
| Import or export JSON | `⋯` | same | Export only | No |
| New flow from a template | Flows page | same | same | same (a template is valid by construction; editing it waits for a larger screen) |

Anything marked "No" is never silently missing: the Review Notice, the read-only step sheet's footer and `⋯` say "Edit this step on a screen at least 1024 px wide. Your draft is safe." Viewer roles see every mode read-only with "You can view this flow. Ask an admin to edit it."

### 10.7 Components used (names from the FD1 §20.1 registry) and configuration

| Region | Component | Configuration by mode |
|---|---|---|
| Header | `FlowHeader` with `VersionChip` and `SaveState` (O §18), `IssuesChip`, `Button` (`Test` secondary with the `play` icon, `Publish v8…` primary), `Menu` (`⋯`) | Full: all inline, Tidy labelled. Compact: SaveState icon-only with the time in its tooltip and accessible name, Tidy and wallet in `⋯`. Review: `width="tablet"` under the shell TopBar, Undo / Redo / Tidy hidden (read-only). Phone: `width="phone"`, the chip row plus the sticky action bar |
| Phase ruler and live note | `PhaseRuler`, `LiveNote` | Full: the connected bar + the full live note. Compact: bar + short note. Review and phone: hidden (the Live chip carries it; the Outline shows phases by tile) |
| Tools | `ToolRail` (≥ 1024); `CanvasControls` with `TouchModeSwitch` (coarse pointers at ≥ 1024 only) | Review and phone: zoom − % + and Fit only, 44 px on touch |
| Canvas | `FlowCanvas` | Full and Compact: editable. Review and phone: `readOnly`, `nodesDraggable` false, `nodesConnectable` false, `elementsSelectable` true (tap opens the read-only sheet); `panOnDrag` true; `zoomOnPinch` true; `minZoom` 0.25, `maxZoom` 1.5; level of detail and Block labels as FD1 §5.5; `fitView({ padding: 0.08 })` on first open when no saved viewport exists, clamped to the Full band at ≥ 1024 (FD1 §9.2) and to the Compact band (≥ 0.5, panned to the selection) in Review mode |
| Outline | `FlowOutline` > `OutlineRow` | Full / Compact: left panel from the tool rail (`O`), docked for flows over 20 steps at ≥ 1280. Review: left column 320, always shown, `readOnly`. Phone: the page, `readOnly`, `density="touch"` (48 px rows); branches as "↳ If Yes · haan, zaroor" rows; Outcomes end with "Lead → Interested" |
| Step detail | `StepInspector` | Full: docked 320–480. Compact: overlay. Review: `presentation="sheet"`, `readOnly`. Phone: `presentation="fullscreen"`, `readOnly`, "‹ Outline" Back |
| Issues | `ProblemsBar` + `ProblemsPanel` | ≥ 1024: bar + panel. Review: `ProblemsPanel placement="tab"` beside the Outline. Phone: `placement="fullscreen"` |
| Test | `TestPanel` (TranscriptFeed / TurnRow, composer, `LevelMeter` for Browser voice) | Phone: composer pinned above the keyboard |
| Publish | `PublishGate` | Sheet 640 (≥ 1024), full height (Review), full screen with a sticky "Publish v8" (phone) |
| Feedback | `Toast` (published, rolled back), `Notice` (Review, read-only role) | Phone toasts above the sticky bar |

### 10.8 States (with copy)

| State | Full / Compact | Review | Phone |
|---|---|---|---|
| **First use** (no flows) | Flows page empty state: "No flows yet. Start from a template or describe what the agent should do." [Browse templates] | same | same; "Describe it" is not offered on phones |
| **Empty flow** (blank) | FD1 §13.2, the one design: the Trigger connected to the Outcome, a "+" on the connection and the card "What happens when the call connects?" with Add Speak · Add Question; issues chip "No issues" | Outline shows the Trigger and the Outcome; the Notice adds "Add steps on a screen at least 1024 px wide." | Outline: "This flow has no steps between its Trigger and Outcome yet. Add steps on a screen at least 1024 px wide." |
| **Loading** | Header from the list data (name, version); ruler counts "–"; canvas skeleton after 200 ms (static, no shimmer) | Outline skeleton rows + canvas skeleton | Outline skeleton rows (48 px) after 200 ms |
| **Large flow** (26–35 steps) | Level of detail, Block labels, frames, Find, Outline docked | Outline first; canvas at fit in the Block band | Branches collapse beyond depth 3 ("Show 4 more steps") |
| **Load error** | Canvas region: "Couldn't load this flow. Check your connection and try again." [Retry]. Header keeps the name | same | same, in the page |
| **Saving / saved** | SaveState "Saving…" → "Saved 11:24 am" | icon + tooltip (Review saves nothing itself; the chip reflects edits made elsewhere) | same |
| **Interim I1** | "Saved on this device 11:24 am", "Draft on this device · 3 changes ▾", live note "Edits stay on this device until you publish. Callers hear the saved flow." (FD2 §4.9) | chips as Full | chips as Full |
| **Couldn't save** | Red persistent SaveState "Couldn't save · Retry"; `<title>` "Couldn't save · Site-visit qualifier · Flows · Vaani Labs"; Publish disabled "Your last 2 edits haven't saved. Retry, then publish." | same | same |
| **Offline** | ConnectionBar; SaveState **"Offline · 3 edits on this device"** (the one offline string, O §18.1); Publish, Test call and Roll back disabled with "You're offline." | same | same |
| **Conflict (409)** | Conflict sheet (FD2 §4.6) | full height | full screen |
| **Validation** | Chip "No issues" / "1 warning" / "2 errors · 1 warning"; step marks; Problems bar | chip + marks + Problems tab | chip + Outline badges; the Publish gate lists them |
| **Permission (viewer)** | Read-only canvas, no edits, Notice "You can view this flow. Ask an admin to edit it." | same | same |
| **Publishing** | Gate button "Publishing…" (`aria-busy`) | same | same |
| **Published** | Toast "v8 is live on 1 number and 1 batch · Roll back to v7…", kind `publish`: 6 s, paused on hover and focus, then Roll back stays in the version menu and History (O §9, FD2 §5.7). Header: `Live v8`, the Draft chip goes, Publish turns `aria-disabled` "Nothing to publish. Your draft matches Live v8." and keeps focus (06 §7.3, §19.B) | same | same; the toast sits above the sticky bar, and focus stays on the sticky bar's Publish |
| **Clean draft** | Draft chip hidden; the Live chip reads "Live v7"; the live note hides; **Publish stays visible**, `aria-disabled`, reason "Nothing to publish. Your draft matches Live v7." in its tooltip and `aria-describedby` (FD2 §4.3) | same | chip row: "● Live v7" (no Draft chip); the sticky bar keeps **Test** and the `aria-disabled` Publish, whose reason shows as a one-line hint above the bar on tap (touch has no tooltip) |

### 10.9 Interactions, gestures and keyboard

- **Touch at ≥ 1024 (coarse pointer): Navigate / Arrange.** Navigate (default, restored on every open): one-finger drag pans, pinch zooms, tap selects and opens the inspector, tap on a socket opens "Connect to…". Arrange: one-finger drag moves a step (with the drag ghost), drag on the background draws a selection box, two fingers still pan and zoom. Each move is one Undo step. With a mouse the switch is hidden. The switch is a labelled `radiogroup` whose state is announced ("Arrange. Drag steps to move them.").
- **Review and phone:** one-finger drag pans, pinch zooms, tap opens the read-only sheet; nothing can be dragged or connected, so there is no mode switch.
- **Resize and rotation.** A `ResizeObserver` on the canvas container, debounced 150 ms, calls `fitView({ padding: 0.08 })` **only if the user has not panned or zoomed since the last fit**; otherwise it keeps the viewport centre. A mode switch (Full ↔ Compact ↔ Review ↔ Phone) keeps the selected step, the open sheet (re-mounted in its new placement, read-only below 1024), the Undo stack and the viewport. An inspector field with unsaved focus at ≥ 1024 commits on blur before the switch. Theme or viewport changes never write the flow (F §1.2).
- **Hardware keyboards** get the full model of `06-accessibility` §9.6 at ≥ 1024, and its navigation keys (Tab, arrows, Enter, Find, `?`) in Review; keycaps appear in the `?` sheet only when a keyboard event has been seen in the session.
- **Phone:** Outline rows are links to `?node=<id>` (Back closes the sheet); `Enter` on a focused row opens it; Publish and the VersionChip are reachable by Tab in header order.
- **URL state:** `?node=`, `?panel=outline|problems|test`, `?tab=`, and the saved viewport per flow and user, so a link opened on a phone lands on the same step.

### 10.10 Microcopy (before → after)

| Before | After |
|---|---|
| "ACTIVATE" (clipped at 768–877) | "Publish v8…" (never clipped) |
| "FLOW VALIDATED" pill over the Start node | Header chip "1 warning" / "2 errors · 1 warning" / "No issues" |
| "+ ADD" chip strip on tablets and phones | No palette below 1024; the Notice "Editing steps needs a screen at least 1024 px wide. You can review, test and publish here." |
| Red "Delete Node" button in the phone inspector | Read-only step sheet; footer "Edit this step on a screen at least 1024 px wide. Your draft is safe." |
| "⌘Z Undo", "⌘C Copy" in the phone menu (on Android) | No keycaps on touch |
| "Up to date" (always) | "Saved 11:24 am" / "Saving…" / "Couldn't save · Retry" / "Offline · 3 edits on this device" |
| "Canvas · 26 nodes · 27 links" | "26 steps" in the Outline header; no link count |

### 10.11 Accessibility

- The canvas is a `<section aria-labelledby>` with a visually hidden `h2` "Canvas", in every mode; **no `role="application"`** (06 §6.1). Steps, sockets, names and the one instruction string are `06-accessibility` §9.6; the Outline (`role="tree"`) is a complete alternative at every size (WCAG 2.1.1, 2.5.7).
- Every drag (move, connect, box-select) has a non-drag path at ≥ 1024 (FD1 §6, §10; 06 §16.1); every pinch has buttons (WCAG 2.5.1).
- Sheets: the Review step sheet is non-modal (`role="dialog"` without `aria-modal`, `F6` between Outline, canvas and sheet); the phone step sheet is modal, focus moves to its title and back to the Outline row on close (O §1.3).
- Focus never sits under the sticky bar, the header or the BottomBar (`scroll-padding`, WCAG 2.4.11); the selected step is panned clear of the sheet.
- Step names are identical in every mode ("#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: …").
- Reduced motion: the pan-into-view and sheet slides become instant; the test trace is skipped.

### 10.12 Telemetry hooks (optional, consent-gated, no flow content)

`flow_opened {mode, pointer, orientation}` · `flow_mode_changed {from, to, cause: resize|rotate|zoom}` · `touch_mode_switched {to}` · `review_edit_attempt {width_bucket}` (FD1 §18) · `large_screen_notice_seen {surface: 'flow', mode}` (§16) · `publish_started {mode}` / `publish_completed {mode, warnings}` · `rollback {mode}`. Use: decide whether tablet editing earns a v1.1 layout, and whether phones are used in incidents.

### 10.13 Acceptance criteria (Flow Designer)

- [ ] At every width from 320 to 1920 and at 844 × 390, **Publish v8…** (when a draft exists) is fully visible without scrolling, and it is also in `⋯` (F-RWD-003).
- [ ] With a clean draft, Publish is present at every width (header, or the phone sticky bar) as `aria-disabled` with the reason "Nothing to publish. Your draft matches Live v7." (the live version's number); after a successful publish of v8 the reason names v8 and `document.activeElement` is that button, never `<body>` (06 §7.3); the publish toast leaves after 6 s and "Roll back to v7…" is still the first item of the version menu (O §9).
- [ ] Resizing a loaded page from 1440 to 900 to 390 and back switches Full → Review → Phone → Full without a reload, keeping the selected step and the open sheet (F-RWD-003, F-RWD-014).
- [ ] At 768–1023 no control edits a step (no palette, no "+", no drag, no editable field); the Notice is shown; Test, Compare, History, Roll back and Publish work.
- [ ] After a container resize with an untouched viewport, the flow is re-fitted within 300 ms; after a user pan, the centre is kept.
- [ ] No canvas text renders below 12 px at rest at any zoom in any mode (`getComputedStyle` × zoom) (F-FLOW-008).
- [ ] On a real iPad in landscape and a real Android phone: one-finger pan and pinch work (Navigate on the iPad); Arrange moves steps on the iPad; a tap on a socket opens "Connect to…" (R12).
- [ ] The phone layout matches FD1 §3.2 (chip row, Outline | Canvas, sticky Test and Publish above the BottomBar, 12 of 12 destinations reachable) with no horizontal scroll at 320.
- [ ] No canvas control overlaps a step at 390, 768 or 1024; the minimap never renders below 1280 (F-RWD-014, F-FLOW-023).
- [ ] Opening a flow on any device sends no write request (F-QA-002).
- [ ] Touch targets on the header, Outline, sockets (hit), sheets and sticky bar are ≥ 44 × 44 on coarse pointers (F-A11Y-023).
