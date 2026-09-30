# QA round 1: Flow Designer (`flow-designer.html`)

Date: 2026-09-27. Tester: QA agent (Playwright, isolated cookie-less contexts, `file://`).
Screenshots: `prototype/_shots/qa-r1-flow/` (names cited below).
Spec checked against: `spec/04-flow-designer/01-canvas-and-nodes.md` (FD1), `02-config-validation-lifecycle.md` (FD2), `05-responsive.md` §2, §6, §10, `06-accessibility.md`, direction and mocks (`01-canvas-and-nodes-desktop.png`, `-dark.png`, `05-responsive-flow-390.png`).

## Summary

The designer is in good shape. The desktop editor matches the mock closely in light and dark themes. The keyboard-only build scenario from FD1 §16.6 passes: add a Question with `A`, connect No reply with `C`, then delete and undo, with correct announcements. Other flows that work: palette add, drag from the palette onto a connection, dragging to retarget a socket, the edge popover, marquee selection, Tidy (one undo step, and running it twice changes nothing), validation with Go to step and Alt+. / Alt+,, the Publish gate, publishing, the Roll back gate, and the test run with Now and Reached marks. Reduced motion is respected. There are no console errors in any run, and axe reports 0 violations in every state tested.

The main problems:

- **Focus is lost to `<body>`** when the Publish gate and the phone step sheet open. Both re-render after they receive focus.
- **The minimap covers newly added, pasted and selected steps.**
- **Several phone and short-screen layouts break:**
  - At 360 px, the zoom controls overlap the sticky Test button.
  - In the Block band, labels overlap neighbouring steps and Fit clips the last column.
  - At 1280×580, the shell TopBar is shown as well as the Flow header, and the page scrolls 541 px into a blank area.
- **Touch targets on coarse pointers are below 44 px.**
- **Frames and notes (a v1 feature) are missing.**

## Metrics

| Check | Result |
|---|---|
| Console errors / page errors | 0 in every run (the CORS messages seen during the axe runs come from axe fetching stylesheets, not from the page) |
| axe 4.10.2 violations | 0 at 1440 (light, default) · 0 at 1440 dark with the inspector open · 0 with Outline + Test panel + Problems panel open · 0 in the dark `?state=errors` state · 0 at 390 (phone) |
| Horizontal overflow (`scrollWidth - innerWidth`) | 0 at 1440, 1280, 1024, 768 (touch), 390, 360. With a desktop mouse at 768–1023 the result is −15, because of a reserved scrollbar gutter (bug 23) |
| Vertical page overflow | 0 at every tested width except 1280×580 with the inspector open (+541 px, bug 7) |
| Text below 12 px | None found outside the canvas. On the canvas, nothing measured below 12 px at 100 %, 80 %, 73 % or 58 % zoom |
| Canvas share | 1336 × 780 with no panels at 1440×900, and 856 px wide with the inspector docked at 1280×800. The spec budgets are met |
| Network | Only Google Fonts GETs; no writes |
| Touch targets under 44 px (coarse pointer) | Header chips (Draft 24, issues 24), `⋯` 36, Outline and Problems tabs 39, Outline filter 34, zoom controls 30/31 (768, 390, and 1180 coarse) |

## Bugs (reproduced)

Severity: **major** / minor. `shared` = the root cause is in `assets/*`.

### Major

1. **The Publish gate loses focus to `<body>` about 650 ms after opening** (a11y; page).
   - Repro: open `flow-designer.html`, focus `Publish v8…`, press Enter. Focus goes to `#fd-gate-t` at about 100 ms, then `document.activeElement` becomes `BODY` at about 760 ms. The Roll back gate behaves the same. The focusout stack points to `render()` in `pages/flow-designer-publish.js:58`, called by the 650 ms "checking done" timer on line 19, which rewrites `g.innerHTML`.
   - Expected: focus stays on the gate title (O §1.3; FD2 §20).
   - Fix: in the line-19 timeout, remember `document.activeElement.id` (or `data-g`) before `render()` and refocus it afterwards (fall back to `#fd-gate-t`). Better, update only the checks section.
2. **The phone and zoomed step sheet opens with focus on `<body>`** (a11y; page).
   - Repro: 390×844 (or 720×450 desktop, which is phone mode as at 200 % zoom). Focus the Outline row "Book site visit" and press Enter. Focus goes to `#fd-insp-t` and is lost to `BODY` 5 ms later: `VF.openInspector` calls `render()` (`flow-designer-inspector.js:16`, which rewrites the sheet at line 50) after `V.drawer.open`.
   - Expected: focus on the sheet title; Back returns it to the row (05 §10.11).
   - Fix: render before opening the drawer, or refocus `#fd-insp-t` after `render()`.
3. **The minimap covers new, pasted and selected steps** (visual/interaction; page).
   - Repro 1: at 1440, select "Polite close", open Add step and click "Speak" three times. The selected "Speak 3" (#12) is placed and revealed under the minimap (`1440-palette-adds.png`).
   - Repro 2: select a step, press Ctrl+D, then Ctrl+V. Both copies sit under the minimap and are partly off-canvas (`1440-dup-paste.png`).
   - Expected: FD1 §9.3 says "fit and auto-pan never place the selection under" the minimap, and the §19 acceptance criterion says the same.
   - Fix: `VF.reveal()` and the placement search should subtract the minimap and canvas-controls rects (and the selection bar) from the visible area. Add their size to the reveal padding.
4. **At 360×740 on the phone Canvas view, the zoom controls overlap the sticky Test button** (responsive; page).
   - Repro: mobile emulation at 360×740, then tap Canvas. The chip row wraps to two lines, so `#fd-phone` is 144 px tall, but `#fd-canvas` still ends at y 652 while `#fd-sticky` starts at y 623. The controls (y 609–640) sit on the Test button (`360-canvas.png`). At 390×844 the layout is correct.
   - Expected: nothing overlaps the sticky bar (05 §10.13).
   - Fix: size the phone canvas from real layout (flex column `1 1 auto; min-height:0` inside a `100dvh` frame) instead of fixed chrome heights, or measure `#fd-phone` and `#fd-sticky`.
5. **In the Block band, labels overlap other steps and Fit does not fit** (visual; page).
   - Repro: at 390 or 360 on the phone Canvas tab (25 %), the "#1 Outbound batch" Block label covers the whole #3 Logic box. Outcome labels are cut at the canvas edge ("#7 Callb…", "#8 Not ir…") (`390-canvas.png`). At 1440 with `?state=large`, pressing Shift+1 fits at 25 % and the Outcome column's labels are clipped at the right edge (`1440-large-fit.png`).
   - Expected: FD1 §5.5 says a label "stops 8 px before" a column where a step overlaps its height, and the lower-priority label hides. §9.1 says Fit fits every step.
   - Fix: clip each label's width to the next occupied column (−8 px) and hide it on collision. Include the Block-label overhang (140 px on screen) in the Fit bounds, and drop the extra 48 px left inset when the flow can't fit.
6. **Short screens (below 600 px tall at 1024 px or wider) break the frame** (responsive; page).
   - Repro: 1280×580, `?node=n3` (`1280x580.png`, `1280x580-insp-scrolled.png`).
     - The shell switches to the tablet TopBar (☰, title, wallet, search) while the designer stays in `full` mode, so the title and wallet appear twice and the rail is gone.
     - There is no "Phases" menu.
     - With the inspector open, the document scrolls 541 px into a blank page.
   - Expected: 05 §2.2 ("Landscape phone" class) and FD1 §17 (ruler folds into a "Phases" header menu; nothing scrolls).
   - Fix: make `VF.modeFor()` read the same resolver as the shell (height too). When the TopBar is visible, hide the duplicate crumb and wallet. Constrain `.fd` to the frame height (`min-height:0` / `overflow:hidden` on `.app-main--frame` and the inspector column).
7. **Touch targets below 44 px on coarse pointers, part a** (a11y/responsive; **shared**).
   - `.ibtn--sm` has no `::after` override: `.ibtn::after` uses `--btn-h-md`, so on touch the `⋯` "More flow actions" hit area is 36 × 36.
   - `.vtab` has no coarse hit area: the Outline and Problems tabs are 39 px.
   - Repro: 768×1024 or 390×844 with touch emulation.
   - Fix in `assets/components.css`:
     - add `.ibtn--sm::after { inset: min(0px, calc((var(--btn-h-sm) - var(--hit)) / 2)); }`
     - add `@media (pointer: coarse) { .vtab { min-height: var(--size-hit-touch); } }` (or a `::before` hit area).
8. **Touch targets below 44 px on coarse pointers, part b** (a11y/responsive; page).
   - The header chips `.fd-vchip` and `.fd-issues-chip` (buttons styled as `tag--lg`) are 24 px tall with no hit expansion.
   - The canvas zoom controls are 30 px at 768, 390 and 1180-coarse.
   - The Outline filter field is 34 px.
   - Expected: 05 §6.1 and §10.13 (chips 44 hit, zoom controls 44 in Review and phone, fields 44).
   - Fix in `pages/flow-designer.css`: `@media (pointer: coarse)`:
     - a `::before` hit area of `--size-hit-touch` on the chips (as `.topbar .chip::before` does);
     - `.canvas-ctl-group button { min-height/min-width: var(--size-hit-touch) }`;
     - the filter uses `--field-h`.
9. **Frames and notes are not implemented** (spec-fidelity; page).
   - The palette has no "Canvas (Note, Frame)" group. Ctrl+G does nothing. The selection bar (`2 steps selected · Align · Duplicate · ⋯ · Clear`) has no **Frame**. The step menu has no "Add to frame", "Cut" or "Convert to…".
   - Expected: FD1 D10, §10.1, §10.5, §12.4, §12.5 and the §19 criteria ("Frames collapse to a block with exits").
   - Fix: add FrameNode and NoteNode per FD1 §12.4–12.5 (a collapsible frame with member roll-up, and a pinned note), the palette Canvas group, Ctrl+G / Ctrl+Shift+G, and the missing menu items. If this is intentionally out of scope for the prototype, record it in `_integration-notes.md`.

### Minor

10. The phone TopBar has no "‹ Flows" Back, and the step sheet's Back is an icon without the visible "Outline" label (FD1 §3.2, `05-responsive-flow-390.png`). Fix: set `data-back-href`/`data-back-label="Flows"` on `<body>` in phone mode, and add the text "Outline" to `.sheet-back` in phone mode. (page)
11. Compact mode (1024–1279) shows `Saved 11:24 am` instead of `Saved` with the time in a tooltip (FD1 §3.3; 05 §10.7) (`1024-selected.png`, `1180-touch.png`). (page)
12. Flow settings opened from the tool rail returns focus to the H1 on Esc, because `renderTools()` in `flow-designer-header.js:131` re-renders the rail and detaches the `returnTo` button. Fix: pass a re-query (`() => $('#fd-tools [data-tool="settings"]')`), or skip `renderTools()` for dialog tools. The Prototype states dialog uses the same path. (page)
13. "Recently used" doesn't update while the palette is open. It still reads "Steps you add appear here." after adds, and changes only when the palette is reopened (FD1 §8.2). Re-render the fixed-height recent row on `added`. (page)
14. Find doesn't wrap matched words in `<mark>` (0 marks for "visit") (FD1 §12.2). (page)
15. The `?` sheet shows an empty "Lists and tables" heading, has no Flow Designer or Legend tabs (FD1 §11.3), lists Flow Designer keys in one long column, and prints `f6`/`f8` in lower case (`1440-shortcuts.png`). (**shared**, `shell.js` sheet builder)
16. The `?` keycap shows in the phone `⋯` action sheet on touch (05 §6.2: no keycaps on coarse pointers) (`390-more.png`). Hide `.menu .kbd` under `(hover:none),(pointer:coarse)`. (**shared**)
17. Trigger meta lines are cut mid-word with no ellipsis ("Weekend follow-ups · 1", "+91 80 •••• 2210 · every"), because `.node-meta` is `display:flex`, so `text-overflow` never applies (`components.css:498`). Wrap the text in a `min-width:0` ellipsis span. (**shared**)
18. The Problems-bar toggles "Outline" and "Test panel" have `aria-pressed="true"` but no visible pressed style (`1440-outline-test-problems.png`). (page)
19. With Phase columns on, the first column header is clipped ("rigger 2") at the canvas's left edge (`1440-phase-cols.png`). (page)
20. In the load-error state the tool rail stays live. Version history then says "Draft · not published … No versions yet" for a live flow that failed to load. Disable the rail in the error state. (page)
21. Resizing 1440 → 900 → 390 → 1440 keeps the selection, but the inspector is closed on return to 1440 (05 §10.9: keep the open sheet). (page)
22. The step context menu is missing Cut and Convert to… (FD1 §10.5); see also bug 9. (page)
23. Review mode with a mouse (768–1023) reserves an empty 15 px strip on the right, because `base.css:51` sets `scrollbar-gutter: stable` below 1024 and the designer page doesn't scroll. Extend `base.css:55` to fixed-frame pages, e.g. `html:has([data-shell="focus"]) { scrollbar-gutter: auto; }`. (**shared**)
24. Landscape phone 844×390 renders Review mode (header, info notice and Outline column, with about 2 Outline rows visible) instead of Phone mode with the chips folded into the TopBar (05 §10.5) (`844x390.png`). (page)
25. Delete on an Outline row moves focus to the canvas step instead of the adjacent Outline row, so keyboard users are pulled out of the tree. (page)
26. On a blank flow, "Add Question" is inserted 33 px from the Outcome. Its Yes and No reply connectors run vertically at the Outcome's port and their labels overlap the sockets (`1440-kb-built.png`). Place the insert clear of the connector label run too, or offer the one-time Tidy. (page)

## What passed (highlights)

- **Tab order and focus:** the skip link goes to `#main`. The rail, header, ruler (roving) and tool rail (roving) come next, then the canvas as one tab stop starting at #1, then the controls and the Problems bar. Focus rings are visible, and focus and selection are shown together.
- **Canvas keys:** ←/→ follow connections, ↑/↓ reach sockets, and Home/End work. Enter opens the inspector (focus on Label) and Esc returns to the step. Space selects; Esc clears. Alt+Arrow nudges 16 / 64. M enters move mode and Esc cancels. Shift+F10 opens the menu. Alt+Delete deletes and reconnects, and the last Trigger is protected.
- **Keyboard build (FD1 §16.6):** `A` adds a Question with "Added Question after Outbound batch, connected." `C` on No reply gives "Connected No reply to End with outcome". Delete gives "Deleted 'Question' and 3 connections · Undo" and focus moves to the previous step. Ctrl+Z restores it.
- **Edge popover:** Insert step…, Change target… and Delete connection work, with Undo; Esc returns to the socket.
- **Menus:** the zoom menu (50–200 %, Fit flow, Fit selection disabled with its reason) and View options (checkbox items) both work.
- **Minimap:** the toggle is remembered.
- **Palette and pointer editing:** palette click adds without overlap. Dragging onto a connection inserts between its steps. Dragging a socket retargets its connection.
- **Selection and clipboard:** marquee, Shift and Ctrl click, Ctrl+A, and the selection bar count (announced) all work. Duplicate and paste add "(copy)".
- **Validation:** `?state=errors` shows the Publish reason "Fix 2 errors to publish."; Go to step focuses the field; Alt+. and Alt+, walk issues; the Problems panel filters work; the unknown variable gets an E11 suggestion.
- **Publish and roll back:** tick the warning, and the primary becomes "Publish with 1 warning". Publishing gives `Live v8`, the aria-disabled "Nothing to publish. Your draft matches Live v8.", focus on Publish, and the toast "Roll back to v7…". The Roll back gate reads "Publishes v7's content as v9". The focus trap holds.
- **Test and motion:** the test run marks Now and Reached and traces the path. With reduced motion there are 0 running animations.
- **Outline:** it is a tree with levels and expanded state, and arrows, F2 rename, Alt+↑, `A`, filter and Delete with undo all work.
- **Find:** the counts are right ("1 of 3", "#9" jumps, "No matches"), and non-matching steps are dimmed with text still at full contrast.
- **States:** loading skeleton, load error, not found, clean draft, large flow (Outline docked, 75 % on the first Trigger), view only, unsupported step, overlap notice, save failed (title prefix), conflict sheet (focus on title), and compare.
- **Review (768–1023) and phone modes:** Review has the read-only notice, a read-only sheet with Copy link, and `A` / Delete explaining the read-only reason. On phones, the Outline (48 px rows), the sticky Test and Publish above the BottomBar, the full-screen Problems list, the full-screen gate and the full-screen text test all work.
- **Theme:** dark theme matches `01-canvas-and-nodes-dark.png`.
