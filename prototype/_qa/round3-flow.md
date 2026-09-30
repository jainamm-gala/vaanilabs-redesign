# QA round 3: Flow Designer (`flow-designer.html`)

Date: 2026-09-27. Tester: QA agent (Playwright, isolated cookie-less contexts, `file://`).
Screenshots: `prototype/_shots/qa-r3-flow/` (file names are cited below).
Spec checked against: FD1 `04-flow-designer/01-canvas-and-nodes.md` (§3.3, §8, §9, §12, §16, §19), FD2 `02-config-validation-lifecycle.md` (§4.3, §5, §6.4, §12.4, §16, §21, §23), `05-responsive.md` §6.1 and §10, `06-accessibility.md`, `02-components-data-nav.md` (rail), and the mocks `01-canvas-and-nodes-*.png`.

## Summary

The one bug handed to this round, **FD-R2-01, is fixed**: on a coarse-pointer tablet at 1024 px or wider, the rail items are 44 × 44 and the phase-ruler segments keep a 26 px visual with a 44 px hit area that does not overlap the header.

The page files (`pages/flow-designer*.{js,css}`) have not changed since round 2 (last write 08:40, before the round-2 report). So the round-2 page bugs are all still present. I reproduced each one again and re-report it under its old id: FD-R2-02 to FD-R2-06, FD-R1-15 and FD-R1-26.

This round found 4 new problems:

- **1 major:**
  - **FD-R3-01:** Roll back does not restore the old version. Rolling back from v8 publishes a made-up v9, not v7's content. The gate lists 1 change instead of 3. The draft, which was clean, is left as `Draft · 1 change` with `Publish v10…`.
- **3 minor:**
  - **FD-R3-02:** the Outline filter drops context. There are no "n hidden" lines and the count does not change.
  - **FD-R3-03 (shared):** at 1180×820 on a touch screen, the rail list scrolls and hides Settings completely, with no cue that there is more.
  - **FD-R3-04 (shared):** the `?` sheet takes 82–86 % of the viewport height. The spec limit is 80 vh.

There are no console errors, and axe finds 0 violations in every state tested.

## Metrics

| Check | Result |
|---|---|
| Console errors / page errors | 0 in every run. The only errors logged are axe's own blocked stylesheet requests (CORS on `file://`), which come from the tool, not the page |
| axe 4.10.2 violations | 0 in all 5 states tested: 1440 light (default) · 1440 light with the inspector open · 1440 dark `?state=large` (frames, note, Outline) · 1440 dark + reduced motion `?state=test` (Test dock, Now/Reached marks) · 768 dark touch with the read-only step sheet open |
| Horizontal overflow (`scrollWidth - innerWidth`) | 0 at 1440, 1280, 1024, 1024×690 touch, 1180×820 touch, 768 touch, 390 and 360 (Outline and Canvas), and in the 390 Publish gate. The only offender listed at 1440 is an SVG inside the clipped canvas |
| Vertical page scroll | 0 at 1440, 1280, 1024 and 1024×690. In phone mode the Outline is the page, so the page scrolls, as intended |
| Text below 12 px | None at 768, 390 or 360. None on screen at 1440 `?state=large`, including canvas text measured at the canvas scale |
| Touch targets under 44 px | **1180×820 touch** (Compact mode): the rail is 44×44 and the phase segments have a 44 hit (FD-R2-01 fixed). Still under 44: `.fd-pb-counts` 83×24, "Go to step" 38, Compare 42, Undo 38 wide, Phase columns 42, and ‹ › / Outline / Test panel 38 (their 44 hit is cut off by the viewport's bottom edge). **768, 390, 360:** none |
| Focus | Tab order runs: skip link, rail, header, ruler, Compare, tool rail, the canvas as one stop, zoom controls. Every stop has a visible outline (2 px token; it computes to 1.6 px because of the host's 125 % display scale). Publish gate: focus goes to the title and the Tab trap holds for 25 presses. Esc returns focus to Publish. The phone step sheet's Esc returns focus to the row |
| Reduced motion | 0 running animations, and 0 s transitions on the panels and the viewport, during a test run |
| Canvas at 1440 with the inspector docked | 1016 × 780 (meets FD1 §19) |

## Previous bugs: re-test

| Id | Status | Evidence |
|---|---|---|
| **FD-R2-01** Rail and phase segments below 44 on coarse pointers | **Fixed** | See the evidence after this table |
| FD-R2-02 Problems-bar and header targets below 44 (coarse) | **Not fixed** (page files unchanged) | Bug 2 below |
| FD-R2-03 Conflict sheet returns focus to the H1 | **Not fixed** | Bug 3 |
| FD-R2-04 Notes over connectors and frame edges | **Not fixed** | Bug 4 |
| FD-R2-05 Text test doesn't understand "haan zaroor" | **Not fixed** | Bug 5 |
| FD-R2-06 Phone Canvas on a large flow opens centred | **Not fixed** | Bug 6 |
| FD-R1-15 `?` sheet has no Flow Designer or Legend tabs | **Not fixed** | Bug 7 |
| FD-R1-26 A keyboard insert crowds the next step | **Not fixed** | Bug 8 |

FD-R2-01 evidence (`1180-touch.png`, `1024x690-touch.png`):
- At 1180×820 with `hasTouch`/`isMobile`, `(pointer: coarse)` matches.
- Probed with `elementFromPoint`, every `.rail-item` has a 44×44 hit area.
- Every `.phase-seg` is 26 px visual with a 44 px hit (y 46–89). The header targets' hit areas end at y 45, so the two don't overlap.
- At 1024×690 touch the rail also stays at 44 and the list scrolls, as 05 §6.1 and N §1.4 require.
- The current-page mark still sits on the rail's left edge.

## Bugs (reproduced)

Severity: **major** / minor. `shared` means the root cause is in `assets/*`.

### Major

1. **FD-R3-01: Roll back does not restore the old version; the draft does not follow Live** (interaction, spec fidelity; page).
   - Repro:
     1. At 1440 (default state), press Publish v8…, tick the warning and publish. The header reads Live v8 and the draft is clean.
     2. In the toast, press "Roll back to v7…". The gate lists **Changes (1)**: "Ask about a site visit · prompt edited". v8 changed 3 steps against v7 (#3 prompt, #4 meeting hours, #5 prompt) (`1440-rollback-gate.png`).
     3. Tick the warning and press Roll back to v7. The toast reads "v9 is live with v7's content".
   - Result: the state (`VaniFlow.S.m`) is not v7:
     - #3's prompt becomes the new text "Namaste {{lead_name}} ji. Kya aap is hafte site visit karna chahenge?", which no version ever had.
     - #4 keeps v8's hours ("Sat and Sun").
     - #5 keeps v8's prompt.
     - The header then shows **`Draft · 1 change`** and **`Publish v10…`** (`1440-rolledback.png`).
   - Expected:
     - FD2 §6.4 and §23: "Roll back publishes v7's content as v9"; "Changes: the diff from Live v8 to v7's content"; "if the Draft is clean it follows Live".
     - The toast reads "v9 is live with v7's content. Calls on v8 stay on v8. · Undo isn't possible; roll back again from History." The second sentence is missing.
   - Cause:
     - `VF.versionSteps` (`pages/flow-designer-data.js:131`) makes up old versions by cloning the current `m.live` and rewriting only step #3's prompt.
     - `publish()` (`pages/flow-designer-publish.js:117`) checks `!VF.draftDiff().count` after it has already replaced `S.m.live`, so a clean draft always looks dirty.
   - Fix:
     - On every publish, store a snapshot on the version entry: push `steps: VF.clone(content)`, and on the first publish keep the previous `S.m.live` as the snapshot of the old version.
     - Make `VF.versionSteps(m, v)` return the stored `steps` for `v` when it exists, and use the made-up text only for versions older than the demo data.
     - In `publish()`, compute `var wasClean = !VF.draftDiff().count;` before `S.m.live = content`, then use `if (rb && (G.resetDraft || wasClean))`.
     - Add " Undo isn't possible; roll back again from History." to the rollback toast.

### Minor

2. **FD-R2-02: Problems-bar and header targets are below 44 px on coarse pointers at 1024 px or wider** (a11y; page).
   - Repro: 1180×820 touch.
   - Measured:
     - `.fd-pb-counts` ("1 warning. Open problems"): 83×24 with no `::before`/`::after`.
     - `.fd-pb-go` "Go to step": 38 tall.
     - "Compare" link (`.fd-note-link`): 42.
     - Undo: 38 wide (its hit area overlaps Redo's).
     - Phase columns: 42 tall.
     - New this round: ‹ ›, Outline and Test panel have 44 px `::after` areas, but the 32 px bar sits at the viewport's bottom edge. Their usable hit is y 782–820, which is 38.
   - Expected: 44 hit on coarse pointers (05 §6.1).
   - Fix: in `pages/flow-designer.css`, inside `@media (pointer: coarse)`:
     - give `.fd-pb-counts`, `.fd-pb-go` and `.fd-note-link` `position: relative` and a `::before` of `--size-hit-touch` height (as the chips have);
     - set `#fd-pbar { min-height: var(--size-hit-touch); }`;
     - add a `--space-8` gap between Undo and Redo.
3. **FD-R2-03: Closing the conflict sheet sends focus to the H1** (a11y; page).
   - Repro:
     1. Open `?state=conflict`. The sheet opens by itself with focus on `#fd-conflict-t`. Press Esc: focus lands on `H1#page-title`.
     2. Focus `#fd-save` ("Changed elsewhere · Review", `span[role=button]`) and press Enter. The sheet opens. Press Esc: focus lands on `H1#page-title` again.
   - Expected: focus returns to `#fd-save` (FD1 §16.2; never to a heading or `<body>`).
   - Fix: re-query `#fd-save` after `renderHeader()` when the sheet closes (pass `returnTo` as a function). While in the conflict state, give `#fd-save` `aria-haspopup="dialog"`.
4. **FD-R2-04: Notes are placed over connectors and across frame edges** (visual; page).
   - Repro 1: at 1440, select #5 Polite close, then Add step › Canvas › Note, type and press Ctrl+Enter. The note lands at (824, 566)–(1030, 638), on the dashed "No reply" connector. The "No reply" label pill is drawn over the note text. The header reads "Note · Anika R. · Toda…" (`1440-note-new.png`).
   - Repro 2: `?state=large`. The note pinned to #2 spans y 497–555 and crosses the "Opening" frame's bottom edge at y 530. Its header is cut to "2 …" (`1440-large-note-frame.png`).
   - Expected:
     - FD1 §12.5: a note never hides flow content.
     - FD1 §12.4: frames hug their members.
     - The note header shows the author and the time.
   - Fix:
     - Place new notes with the same free-spot search as pasted steps, treating connector paths and label pills as obstacles.
     - Put a pinned note inside its member's frame bounds, or outside the frame.
     - Let the header drop "Note ·" before it cuts the time.
5. **FD-R2-05: The text test doesn't understand natural replies** (interaction; page).
   - Repro: at 1440, open Test, choose Start text test, type "haan zaroor" and press Enter. The agent answers "Maaf kijiye, main samajh nahi paayi…" and the flow stays on #3 (`1440-test-run.png`).
   - Expected: the reply routes Yes, because the example chip reads "Yes · haan, zaroor".
   - Fix: in `flow-designer-test.js`, split the examples on commas as well as " · ". Normalise case, punctuation and diacritics. Match when an example phrase appears as whole words in the reply.
6. **FD-R2-06: On a phone, the Canvas view of a large flow opens centred, with the Triggers off screen** (responsive; page).
   - Repro: 360×780 touch, `?state=large`, tap Canvas. The view opens at 25 % and centred. The "Opening" frame is at x −230…−66, the Trigger is off screen, and the "First answers" header is cut ("rst answers") (`360-large-canvas.png`).
   - Expected: FD1 §9.2, the opening fit is anchored on the first Trigger when the flow can't fit.
   - Fix: in `fitOpen()` (`flow-designer.js` ~l.92), pass `anchorFirst: true` in phone mode too.
7. **FD-R1-15: The `?` sheet has no Flow Designer or Legend tab** (spec fidelity; page).
   - Repro: at 1440, focus a step and press `?`. There are 0 `[role=tab]` elements, and the headings are only "Everywhere" and "Flow Designer". One long list runs over both columns, with Redo listed twice (`1440-shortcuts.png`).
   - Expected: FD1 §11.3 and FD2 §16.5, a Flow Designer tab (Navigate · Edit · Select · View · Test) and a Legend tab.
   - Fix:
     - In `registerShortcuts()`, call `V.shortcuts.addTab({ id: 'fd', label: 'Flow Designer', sections: [...], first: true })` and tag each registration with `section`.
     - Add `addTab({ id: 'legend', label: 'Legend', html })`.
     - Merge the two Redo rows.
8. **FD-R1-26: A keyboard insert still crowds the next step** (visual; page).
   - Repro:
     1. `?new=1` at 1440. Focus the Trigger, press A, type "Question" and press Enter.
     2. Press Esc, then ↓ to "Yes", C, New step…, type "Speak" and press Enter.
     3. Press ← to the Question, ↓×4 to "No reply", then C, "End with" and Enter.
     4. Press Shift+1.
   - Result (`1440-kb-built.png`):
     - The Question sits about 80 flow px from the Outcome.
     - The "No reply" pill covers the Outcome's input port.
     - Speak lands in the Outcome's column, below it. Its output runs right, down and back left to reach the Outcome.
   - Expected: FD1 §8.1 and §7.3, orthogonal runs with room for labels. An insert keeps `--layout-rank-gap` or shifts the downstream steps.
   - Fix: when the gap is less than the step width plus 2 × `--layout-rank-gap`, shift the downstream steps right as part of the same undo step. Keep label pills out of the last 24 px before a port.
9. **FD-R3-02: The Outline filter hides context, and its count doesn't change** (spec fidelity; page).
   - Repro: at 1440, open the Outline and type "visit". Four rows remain (#3, #4, #6, "Go to #3…"). The others disappear completely, the count still reads "9 steps", and nothing is announced. "lead_name" and "saturday" behave the same way (`1440-outline.png`).
   - Expected: FD2 §16.2: "non-matching rows collapse into '3 hidden' lines, keeping context".
   - Fix:
     - In `flow-designer-outline.js`, replace each run of hidden rows with one non-focusable `li` reading "n hidden" (`--text-3`, `meta-12`).
     - Change the count to "3 of 9 steps".
     - Announce "3 steps match" politely, debounced.
10. **FD-R3-03: At 1180×820 on a touch screen, the rail hides Settings with no cue that the list scrolls** (responsive; **shared**, `assets/components.css`).
    - Repro:
      - At 1180×820 touch, the rail items are now 44 (the FD-R2-01 fix), so `.rail-list` overflows: scrollHeight 645 against 599 visible.
      - The list cuts exactly between Billing and Settings. Settings (y 714) is entirely hidden, and nothing shows the list scrolls (`1180-touch.png`; scrolled: `1180-touch-rail-scrolled.png`).
      - At 1024×690, a half-cut item happens to act as the cue.
    - Expected: 02-data-nav rail and 05 §6.1 allow the list to scroll. 05 §5.8's rule is that clipped content shows an edge fade as its cue.
    - Fix: give `.rail-list` the same `data-overflow` edge fade that ScrollRow uses, vertically: `mask-image: linear-gradient(to bottom, #000 calc(100% - var(--size-scrollrow-fade)), transparent)` while it has more below. Alternatively, size the list so the last visible item is always half cut.
11. **FD-R3-04: The `?` shortcuts dialog is taller than 80 vh** (visual; **shared**, `assets/components.css`).
    - Repro: press `?` on the canvas. `.dlg.dlg--lg.dlg--kbd` is 772 px tall at 1440×900 (86 %) and 592 px at 1280×720 (82 %). Its max-height is `calc(100dvh - 2 * var(--space-64))` (`1440-shortcuts.png`).
    - Expected: FD1 §19: "The `?` sheet opens as a focused dialog, fits within 80 vh with scrolling".
    - Fix: `.dlg--kbd { max-height: min(80dvh, calc(100dvh - 2 * var(--space-64))); }`.

## What passed (highlights)

- **Canvas keyboard:**
  - → and ← follow connections; ↓ enters answer rows; Enter on a socket opens the connector popover and Esc returns to the socket.
  - A adds a step: focus goes to the title field, and "Added Question after Outbound batch, connected." is announced.
  - C opens "Connect 'Yes' to…" with New step…, Disconnect and (current).
  - Delete says "Deleted 'Polite close' and 2 connections · Undo" and moves focus to #3; Ctrl+Z restores 9 steps.
  - Ctrl+F finds "price" (3 marks, 1 of 3 → 2 of 3); "#9" jumps and Esc returns to #9.
  - Outline tree: ↑↓←→, Home and End; F2 renames and Esc returns to the row.
- **Pointer:**
  - Dragging a step shows "Moved Polite close" and undo puts it back.
  - Dragging a socket onto #8 shows "No reply now goes to Not interested instead of No answer".
  - Clicking a connector opens the popover (Insert step… · Change target… · Delete connection).
  - Three palette adds place steps with no overlap and none under the minimap.
  - On a touch screen, Navigate mode pans and Arrange mode moves steps ("Moved Polite close").
- **Validation:**
  - `?state=errors`: Go to step focuses `#fd-f-goto-later`; Alt+. walks to #4.
  - The Problems panel filters work (All · Errors 2 · Warnings 1).
  - Publish is `aria-disabled` with "Fix 2 errors to publish." (FD1 §3.3).
- **Lifecycle:**
  - The Publish gate matches FD2 §5 (checks, warning tick → "Publish with 1 warning", Where it goes live, Changes (3), Note).
  - Publishing leads to Live v8, the toast "Roll back to v7…", and focus on Publish.
  - The phone gate is full screen with no overflow.
- **Test:**
  - The text test marks the canvas with Now and Reached, highlights the path and shows the Captured and Path columns.
  - On the phone, the full-screen Test offers Text and Browser voice (FD2 §21.4).
- **Responsive:**
  - 1440: inspector docked, canvas 1016.
  - 1280: canvas 856.
  - 1024: overlay inspector, and the selected step stays visible beside it.
  - 768: Review mode with the non-modal read-only sheet.
  - 390 and 360: Outline, Canvas, sticky Test and Publish, and the BottomBar.
- **Blank flow (`?new=1`):** opens as Trigger → Outcome with "+", the empty-state card, "No issues" and the palette open.
- **Theme and motion:** dark theme large-flow and test states match the direction; reduced motion is respected.
