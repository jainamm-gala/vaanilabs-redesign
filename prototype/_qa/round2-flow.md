# QA round 2: Flow Designer (`flow-designer.html`)

Date: 2026-09-27. Tester: QA agent (Playwright, isolated cookie-less contexts, `file://`).
Screenshots: `prototype/_shots/qa-r2-flow/` (file names are cited below).
Spec checked against: FD1 `04-flow-designer/01-canvas-and-nodes.md`, FD2 `02-config-validation-lifecycle.md`, `05-responsive.md` §2, §6.1, §10, `06-accessibility.md`, and the direction and mocks (`05-responsive-flow-768-step.png`, `01-canvas-and-nodes-*.png`).

## Summary

Round 1 reported 26 bugs. 24 are fixed and 2 are only partly fixed:

- **FD-R1-15:** the `?` sheet still has no Flow Designer and Legend tabs.
- **FD-R1-26:** a keyboard insert still leaves too little room between steps.

The biggest round-1 problems are gone:

- Focus no longer drops to `<body>` in the Publish and Roll back gates or in the phone step sheet.
- The minimap no longer hides new, pasted or selected steps.
- The 360 px sticky bar is no longer overlapped.
- Short screens (1280×580) and landscape phones now use the tablet shell correctly.
- Frames and notes are fully built: Ctrl+G, collapse to a block with exits, a note pinned to a step, the palette Canvas group, the step menu's Cut / Add to frame / Convert to…, undo, and roving focus.

Round 2 found 6 new problems:

- **1 major (shared):** on coarse-pointer tablets at 1024 px or wider, the rail and the phase ruler buttons are smaller than the 44 px touch minimum.
- **5 minor:**
  - some Problems-bar controls are also too small on those tablets;
  - closing the conflict sheet sends focus to the page title instead of back to what opened it;
  - notes are placed on top of connectors and across frame edges;
  - the text test doesn't recognise natural replies;
  - on a phone, the Canvas view of a large flow opens centred, with the starting Triggers off screen.

No console errors in any run. axe finds 0 violations in every state tested.

## Metrics

| Check | Result |
|---|---|
| Console errors / page errors | 0 in every run. The only errors logged are axe's own blocked stylesheet requests (CORS on `file://`), which come from the tool, not the page |
| axe 4.10.2 violations | 0 at 1440 `?state=large` (frames, note, Outline) · 0 at 1440 dark `?state=large` · 0 at 768 touch with the read-only sheet open · 0 at 390 on the Outline and Canvas views · 0 at 390 dark `?state=errors` on Canvas |
| Horizontal overflow (`scrollWidth - innerWidth`) | 0 at 1440, 1280, 1024, 900, 768 touch, 390, 360, 320 and 844×390 |
| Vertical page scroll | 0 at every desktop and tablet size, including 1280×580 with the inspector open (it was +541 in round 1). In phone mode the Outline is the page, so the page scrolls, as intended |
| Scrollbar gutter | `auto` at 900 with a mouse (round 1 left a 15 px empty strip) |
| Text below 12 px | None outside the canvas. On the canvas nothing is below 12 px after zoom at 390 |
| Touch targets under 44 px | 768 and 390 (touch): none (the chips have a 44 px `::before` hit area, the zoom controls are 44, the filter field is 44). At 1180×820 on a touch tablet: the rail items are 40×40, the phase ruler segments 26 px tall, the Problems-bar count 24 px, "Go to step" has a 38 px hit area, and Undo/Redo are 38 px wide |
| Focus timeline | Publish gate: title at 100, 400, 800, 1200 and 1600 ms. Roll back gate: title at 100–1400 ms. Phone step sheet (390 and 720×450): title at 30, 150 and 600 ms; Esc returns focus to the row |
| Reduced motion | 0 running animations during a test run |

## Round-1 bugs: re-test

| Id | Status | Evidence |
|---|---|---|
| FD-R1-01 Publish and Roll back gates lose focus | Fixed | Focus stays on `#fd-gate-t` for 1.6 s; the trap cycles; Esc returns to Publish (`1440-gate.png`, `1440-rollback-gate.png`) |
| FD-R1-02 Phone step sheet loses focus | Fixed | 390 touch and 720×450 (`390-stepsheet.png`, `720x450-sheet.png`) |
| FD-R1-03 Minimap covers new, pasted and selected steps | Fixed | Three palette adds after "Polite close": #12 ends 12 px above the minimap. Ctrl+D and Ctrl+V copies are clear of the minimap (`1440-palette-adds.png`, `1440-dup-paste.png`) |
| FD-R1-04 Zoom controls overlap the 360 px sticky bar | Fixed | Canvas 208–623, sticky bar from 623, controls 566–611 (`360-canvas.png`) |
| FD-R1-05 Block labels and Fit | Fixed | At 390 and 360 the labels are capped ("#1 Outbo…") and colliding labels hide. With `?state=large`, Fit leaves every box in the canvas; the last-column labels end in an ellipsis instead of being clipped (`390-canvas.png`, `1440-large-fit.png`) |
| FD-R1-06 1280×580 | Fixed | One header (tablet TopBar), a Phases menu, no document scroll (`1280x580.png`) |
| FD-R1-07 `.ibtn--sm` and `.vtab` hit areas | Fixed | 44 at 768 and 390 touch |
| FD-R1-08 Chips, zoom controls and filter field on touch | Fixed | Chips have a `::before` hit area of 44; controls are 44×44; the filter is 44 |
| FD-R1-09 Frames and notes | Fixed | Selection bar "Frame · Align · Duplicate · ⋯ · Clear". Ctrl+G announces "Framed 2 steps as Frame 1…" with the title field in focus. Enter collapses the frame to a block "2 steps · 1 warning · To Visit booked / To Callback set / To Not interested"; the draft stays at "3 changes"; undo removes the frame. The palette has a Canvas group (Note, Frame) (`1440-frame-new.png`, `1440-frame-collapsed.png`, `1440-note.png`) |
| FD-R1-10 Phone "‹ Flows" and "‹ Outline" | Fixed | `390.png`, `390-stepsheet.png` |
| FD-R1-11 Compact SaveState | Fixed | Reads "Saved", with the time in the tooltip (`1024-selected.png`) |
| FD-R1-12 Flow settings / Prototype states return focus | Fixed | Esc returns focus to the tool-rail button for both |
| FD-R1-13 Recently used | Fixed | "Speak" appears straight after the add |
| FD-R1-14 Find marks | Fixed | 4 `<mark>` elements for "visit", background `--text-selection`; cleared on Esc |
| FD-R1-15 `?` sheet | **Partly fixed**: re-reported below | The empty group is gone, F-keys are upper case and the columns are balanced. There are still no tabs and no Legend (`1440-shortcuts.png`) |
| FD-R1-16 Keycap in the phone `⋯` sheet | Fixed | 0 visible keycaps (`390-more.png`) |
| FD-R1-17 Meta ellipsis | Fixed | Now `text-overflow: ellipsis` with `nowrap` |
| FD-R1-18 Problems-bar pressed style | Fixed | Pressed buttons get the `--surface-3` background (`1440-outline-test.png`) |
| FD-R1-19 Phase-column header clipped | Fixed | "Trigger 2" is fully visible (`1440-phase-cols.png`) |
| FD-R1-20 Error state leaves the rail live | Fixed | Every tool is `aria-disabled` except Prototype states (`state-error.png`) |
| FD-R1-21 Resizing loses the inspector | Fixed | 1440 → 900 → 390 → 1440 keeps both the selection and the inspector |
| FD-R1-22 Step menu | Fixed | Adds Cut (Ctrl+X, Undo), Add to frame ▸ and Convert to… ▸ (`1440-stepmenu.png`) |
| FD-R1-23 Scrollbar gutter | Fixed | `scrollbar-gutter: auto` at 900 with a mouse |
| FD-R1-24 Landscape phone | Fixed (see note) | 844×390: tablet shell, Phone mode, one chip row with Draft, Live, issues, Test, Publish, `⋯` and Outline/Canvas. No BottomBar or sticky bar (`844x390.png`, `844x390-canvas.png`). Note: the chips sit in a 53 px row under the TopBar, not inside it as 05 §10.5 words it. The intent (one row, the switch kept) is met |
| FD-R1-25 Outline Delete focus | Fixed | Focus moves to the previous step row (#7 Callback set) and stays in the tree |
| FD-R1-26 Cramped keyboard insert | **Partly fixed**: re-reported below | The gap is now 80 flow px (it was 33), and the announcement offers Tidy (`1440-kb-built.png`, `1440-kb-built2.png`) |

## Bugs (reproduced)

Severity: **major** / minor. `shared` means the root cause is in `assets/*`.

### Major

1. **FD-R2-01: Rail items and phase-ruler segments are below 44 px on coarse pointers at 1024 px or wider** (a11y; **shared**, `assets/components.css`).
   - Repro: open the page at 1180×820 with `hasTouch`/`isMobile` (an iPad in landscape, Compact mode). The rail items (`.rail-item`) are 40×40 with no hit expansion. The phase-ruler buttons (`.phase-seg`) are 26 px tall.
   - Expected: 05 §6.1 says every element has a 44×44 hit area on coarse pointers, and the table row "Sidebar and rail items (≥ 1024): coarse 44" applies to the rail. Tabs and chips need 44 hit / 36 visual.
   - Fix: in `components.css`, inside `@media (pointer: coarse)`:
     - `.rail-item { width: var(--size-hit-touch); height: var(--size-hit-touch); }`
     - `.phase-seg { position: relative; }` plus `.phase-seg::after { content: ""; position: absolute; inset: calc((var(--size-hit-touch) - 100%) / -2) 0; }`, or `min-height: var(--control-h-sm)` with a `::after` hit area up to `--size-hit-touch`.

### Minor

2. **FD-R2-02: Problems-bar and header targets are below 44 px on coarse pointers at 1024 px or wider** (a11y; page).
   - Repro: 1180×820 touch.
   - Measured:
     - `.fd-pb-counts` ("1 warning. Open problems"): 82×24 with no hit area.
     - `.fd-pb-go` "Go to step": 20 px tall, 38 px hit.
     - "Compare" link (`.fd-note-link`): 42 px hit.
     - Undo and Redo (`.ibtn--sm`, 36 px): the two `::after` areas overlap, leaving about 38 px of width each.
   - Expected: 44 hit on coarse pointers (05 §6.1: inline links get hit padding up to 44, chips 44).
   - Fix: in `pages/flow-designer.css`, inside `@media (pointer: coarse)`, give `.fd-pb-counts`, `.fd-pb-go` and `.fd-note-link` `position: relative` and a `::before` of `--size-hit-touch` height, as the chips already have. Add a `--space-8` gap between Undo and Redo on coarse pointers.
3. **FD-R2-03: Closing the conflict sheet sends focus to the H1** (a11y; page).
   - Repro: open `?state=conflict`. Let the sheet auto-open and close it with Esc. Focus "Changed elsewhere · Review" (`#fd-save`, `span[role=button]`) and press Enter: the sheet opens with focus on `#fd-conflict-t`. Press Esc (or Cancel): focus lands on `H1#page-title`. The trigger has been replaced by a header re-render (`isConnected === false`).
   - Expected: closing a dialog returns focus to its trigger (O §1.3, FD1 §16.2), as FD-R1-12 fixed for the tool rail.
   - Fix: pass `returnTo` as a function that re-queries `#fd-save`, or refocus `#fd-save` after `renderHeader()` when the sheet closes. Also add `aria-haspopup="dialog"` to `#fd-save` while it is in the conflict state.
4. **FD-R2-04: Notes are placed over connectors and across frame edges** (visual; page).
   - Repro 1: at 1440, select "Polite close", open Add step › Canvas › Note, type text and press Ctrl+Enter. The note is placed under #5, on top of the dashed "No reply" connector, and the "No reply" label pill is drawn over the note's text (`1440-note.png`).
   - Repro 2: `?state=large`. The demo note pinned to #2 Greeting (y 497–555) straddles the "Opening" frame's bottom border (y 530) (`1440-large-note-frame.png`).
   - Repro 3: the note header "Note · Rohit S. · 2 …" truncates the relative time at 220 px.
   - Expected:
     - FD1 §12.5: a note must not hide flow content.
     - FD1 §12.4: frames hug their members, and nothing overlaps a frame edge.
     - The note header shows the author and the time.
   - Fix:
     - Place new notes with the same free-spot search that pasted steps use, treating connector paths and label pills as obstacles, and draw labels under notes.
     - Include a pinned member's note in the frame bounds, or place it outside the frame (below the frame, not below the step).
     - Let the header drop "Note ·" before cutting the time, or allow two lines.
5. **FD-R2-05: The text test doesn't understand natural replies** (interaction; page).
   - Repro: at 1440, open Test, choose Start text test, type "haan zaroor" or "haan ji" and press Send. The agent replies "Maaf kijiye, main samajh nahi paayi…" and the flow stays on #3. Typing "haan" alone works (`1440-test-run.png`).
   - Cause: `flow-designer-test.js:129` matches whole example strings. `VF.examples()` splits only on " · ", so the example is the single string "haan, zaroor", and "haan zaroor" matches neither it nor "हाँ".
   - Expected: the example chips ("Yes · haan, zaroor · हाँ") are what the caller says, so typing them routes Yes (FD2 test panel; FD1 §19 test path).
   - Fix: split each example on commas too, normalise case, punctuation and accents, and match when any example phrase appears as whole words in the reply (or any word of the reply equals an example).
6. **FD-R2-06: The phone Canvas on a large flow opens centred, with the Triggers off screen** (responsive; page).
   - Repro: 390×844 touch, `?state=large`, tap Canvas. The view is 25 % and centred: #1 Outbound batch is at x −303…−251, #23–#26 at x 633–693, and the "First answers" frame header is cut at the left edge. Pressing Fit gives the same view (`390-large-canvas.png`).
   - Expected: FD1 §9.2 opens with a fit anchored on the first Trigger when the flow can't fit, so the start of the call is in view. The code comment on `VF.fit` says the open-on-load fit keeps the Triggers in view, but phone mode doesn't pass `anchorFirst`.
   - Fix: in `fitOpen()` (`flow-designer.js:92`), pass `anchorFirst: true` for phone mode, as the Full-mode call already does.

### Re-reported from round 1 (still open)

7. **FD-R1-15: The `?` sheet has no Flow Designer or Legend tab, and no Navigate/Edit/Select/View/Test groups** (spec-fidelity; page).
   - The shell side is fixed: the empty group is gone, F6/F8/F10 are upper case and the columns are balanced.
   - Repro: at 1440, focus the canvas and press `?`. There are no tabs (0 `[role=tab]`); the headings are "Everywhere" and "Flow Designer"; one long Flow Designer list runs over both columns, with its second half under no heading (`1440-shortcuts.png`). `shell.js` already supports `V.shortcuts.addTab({ id, label, groups, sections, html, first })` (shell.js:788–834), but no `pages/flow-designer*.js` calls it.
   - Expected: FD1 §11.3: the sheet opens on a Flow Designer tab with the groups Navigate · Edit · Select · View · Test, plus a Legend tab (the four silhouettes, Path/Fallback, the issue badges, Now/Reached).
   - Fix: in `registerShortcuts()`, call `V.shortcuts.addTab({ id: 'fd', label: 'Flow Designer', groups: ['Flow Designer'], sections: ['Navigate', 'Edit', 'Select', 'View', 'Test'], first: true })` and tag each registration with `section`. Add `addTab({ id: 'legend', label: 'Legend', html: legendHtml })`. Merge the two Redo rows into one (Ctrl+Shift+Z · Ctrl+Y).
8. **FD-R1-26: A keyboard insert still crowds the next step** (visual; page).
   - Repro: `?new=1` at 1440. Focus the Trigger, press A, type "Question" and press Enter. The Question sits 80 flow px from the Outcome (the rank gap is 128). Close the panels, go to No reply with ↓ and connect it to End with C. At Fit (144 %), the "No reply" label pill sits in the 80 px gap, right at the Outcome's input port, on top of the Yes connector's last horizontal segment (`1440-kb-built2.png`).
   - Expected: FD1 §8.1 and §7.3 call for orthogonal runs with room for labels. The insert keeps at least `--layout-rank-gap` on both sides, or shifts the downstream column.
   - Fix: when the gap to the downstream step is less than the step width plus 2 × `--layout-rank-gap`, shift the downstream steps right by the missing amount as part of the same undo step (the announcement already mentions Tidy). Otherwise, keep label pills out of the last 24 px before a port.

## What passed (highlights)

- **Keyboard:**
  - Tab order runs: skip link, rail, header, ruler (roving), Compare, tool rail (roving), the canvas as one stop, controls, Problems bar. Every stop has a visible ring.
  - Shift+F10 menu with submenus (→ opens, Esc closes).
  - Cut and undo.
  - Frame roving: → from the collapsed block goes to #6 and ← to #3; Enter toggles.
  - Outline Delete stays in the tree.
- **Pointer:**
  - Dragging a step moves it ("Moved Polite close"), and undo restores it.
  - Dragging a socket retargets its connection ("Not booked now goes to No answer instead of Callback set").
  - Palette click-add; palette drop onto empty canvas.
- **Lifecycle:**
  - Publish with the warning confirmed goes to Live v8, with the toast "Roll back to v7…".
  - The Roll back gate works.
  - Conflict, compare (Changed tags, Next and Previous change), version, offline, interim, volatile and save-failed states render without errors.
- **Responsive:**
  - 1440, 1280 (inspector docked, 856 px canvas) and 1024 (overlay inspector, "Saved").
  - 768 Review: read-only sheet, non-modal, as in the mock.
  - 390, 360 and 320 phone: chips wrap, sticky Test and Publish, BottomBar.
  - 844×390 landscape and 720×450 (200 % zoom) resolve to Phone mode; 1280×580 resolves to the short Full mode.
- **Theme and motion:** the dark theme matches the direction in the large-flow and phone error states, and reduced motion is respected.
