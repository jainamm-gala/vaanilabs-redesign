# Revision hand-backs (revisers that reported to the orchestrator)

Some revision agents were resumed outside the design workflow and reported directly to the orchestrator. Their structured workflow results may be missing from `workflow-results.json`. This file records what they changed. All paths are relative to `spec/`.

## revise:responsive (4 issues, all resolved in the spec text; no mocks or tokens changed)
- **Blockers 1–2, tablet and phone Flow Designer.** The single rule is kept: tablets (768–1023) get read-only **Review mode**, phones get the read-only **Outline**, and editing needs at least 1024 px. The usability critic's suggestion to let tablets edit was not adopted, for these reasons:
  - The direction, both Flow Designer specs, 06, 07 and the 05 mock all agree on Review mode.
  - Tablet editing would need new keyboard and screen-reader rules.
  - Tablet editing and phone quick fixes are recorded as open questions 1 and 2 in 05 §21, to be decided from `review_edit_attempt` telemetry.
- **Phone Flow Designer layout** (FD1 §3.2), from top to bottom:
  - the shell's phone TopBar (Back, title, wallet chip, Search);
  - a chip row (Draft · Live · issues) with the flow's `⋯`;
  - an Outline | Canvas switch;
  - a sticky Test · Publish bar above the BottomBar.
- **Other decisions:** no full-screen mode at any width. "Call my phone" stays in the Cockpit on phones. 05 §10.6 is the single capability matrix, and the other docs point to it.
- **Issue 3, Publish after a clean draft.** Publish stays visible and aria-disabled at every width, with the reason "Nothing to publish. Your draft matches Live v7." The publish toast lasts 6 s. Roll back stays in the version menu. After publishing, focus returns to the Publish button (06 §19.B).
- **Issue 4, chrome budget.** Budgets use real inner viewports (1366×657 and 1280×609) and keep the 720 px fold. The BaselineChip is the primary status surface on those laptops. Flow canvas figures:
  - 942×537 at 1366×657;
  - 856×489 at 1280×609.
- **Files edited:** FD1 parts 2 and 6; FD2 parts 1, 9 and 10; 06 part 8; 07 part 7; 00-design-direction.md §6.5 and §8; 05 parts 5 and 11.
- **Open (owned by the flow-mock reviser):**
  - Unify the Notice string in the FD mocks and the specimen: "Editing steps needs a screen at least 1024 px wide. You can review, test and publish here."
  - Fix the TopBar and chip order in the phone and tablet frames.
- **Open decision:** on coarse pointers at 1024×690 (landscape iPad), the 12 rail items need about 725 px of height, so the list scrolls. A coarse-only tightening would fit them in about 687 px:
  - group separators at `margin-block: space-2`;
  - no gap between the 44 px hit areas;
  - tile margin `space-12`.

  This has not been applied (data-nav N §1.4). Also, the coarse row lists device sizes while the fine row lists inner viewports, so the units are inconsistent.

## revise:a11y (2 major issues, both resolved; reconciled with a parallel duplicate agent)
- **Motion preference.** `build-tokens.mjs` emits the reduced-motion block for both `@media (prefers-reduced-motion: reduce)` and `:root[data-motion="reduce"]`, and `base.css` caps animations under both.
  - Every doc now uses the attribute `data-motion="reduce"` and the labels "Match system · Reduce motion".
  - `THEME_BOOT` (foundations §15.3) sets the attribute before first paint from `localStorage['vaani:motion']`.
  - Added: the VR-03 row, the `MotionSetting` row in 06 §23, the F-A11Y-022 ledger row, a Motion item in the account menu and MoreSheet (N §1.2), and Motion rows and acceptance checks in the shell (S §9).
- **Touch targets.** No layout mode shrinks a touch target, and short nav mode applies to `(pointer: fine)` only.
  - Answer and result rows grow to 44 px on coarse pointers (direction §6.5, foundations §14, FD1 §5.1, §6.1, §8.1 and §9.4).
  - The socket target is the 44 × 44 end of its row.
  - Connect to…, the Go to select and the Outline are the equivalent 44 px paths.
  - Tidy lays out steps at touch height.
  - The coarse row-height rule is in `components/components.css`.
- **Warning:** assembled `.md` files had drifted from their part files. The orchestrator re-assembles every combined `.md` from its parts after all revisers finish (the part files are canonical).

## revise:components (1 blocker and 1 major, both resolved)
- **Blocker: the Gate spec was missing.** New `02-components-gate.md` (parts 1–6). It is one confirmation-gate system for every consequential action.
  - **Container:** `--surface-overlay`, `--border-overlay`, `--e3` and `--radius-12`.
  - **Per breakpoint:** a popover of 400 px; at 768–1023 the popover stays anchored only if the whole gate fits, otherwise it becomes a bottom sheet; a sheet of 640 px, full height on tablet and full screen on phone; inline; page.
  - **Checks:** `GateChecklist` and `GateCheckRow` share one kind enum (`pass | blocking | advisory | adjusted | checking | unknown`).
  - **Behaviour:**
    - one cost-line formula;
    - a state machine and preflight;
    - a 120 s gate token;
    - one idempotency key per opening, reused by Retry;
    - ⌘/Ctrl+Enter confirms;
    - focus opens on the heading.
  - **Variants:** CallGate (single and batch), PublishGate, SetupTrack, AddAgentGate, form gates, money gates and ApprovalCard.
  - **Divergences between pages, settled in G §0.4:**
    - one check enum;
    - Leads' e2 becomes e3;
    - blocking marks become a red `x`;
    - gate titles lose the question mark;
    - ⌘/Ctrl+Enter works in the money gates too;
    - there is one wallet ₹0 rule: the entry point is aria-disabled with its reason, and a blocking row appears if the balance drops while a gate is open.
  - Page sections that previously defined gates are now configuration only (Cockpit, Leads, FD2, shell, 07, 05, 02). CSS is in `components/components.css` §16, and the gallery is `components/gate.html`.
- **Major: StatusTag and LanguageMark consistency.**
  - All status comes from `lib/status.ts`. `StatusTag` has no tone, icon or label props.
    - Callback due is always amber with a clock.
    - A call outcome borrows the tone of the lead status it writes.
    - "Waiting for you" is `pause`, and user-paused tasks use `circle-pause`.
  - LanguageMark:
    - The glyph tile is an 18 px `surface-3` fill with no stroke, so it can't be confused with `Kbd`.
    - It has three variants: `name` (default), `full` and `compact`.
  - The mocks were re-rendered.

## revise:direction (merge and relink; interrupted before finishing)
- **Done:**
  - Neel was re-keyed in tokens.json: fill #1F4A94, dark fill #2F62C0, dark text #8DB2EE, and Neel-ink #0F203D for the Baseline in both themes. `check-contrast.mjs` passes 460/460 pairs.
  - `shell-partials.css` was merged into `components/components.css` (TopBar, BottomBar and Baseline under §9, §10 and §15, with canonical class names), and `shell-partials.js` now emits the canonical classes.
  - CallStepper was moved into `components.css`.
  - `components/check-mocks.mjs` was upgraded. It checks base classes, allows layout-only CSS, guards signature tokens and rejects the retired stylesheets.
  - These now pass check-mocks: `components/canonical.html`, `core.html`, `data-nav.html`, `gate.html`, `overlay.html`, `brand/mark.html`, `tokens/foundations.html`, and `04-flow-designer/01-canvas-and-nodes.html` (the last converted by the flow reviser).
- **Final report (hand-back after the stop):** all three critique issues are resolved in the docs and tokens.
  1. **Blocker, no canonical visual reference.**
     - `components/components.css` is the single component layer: §9 TopBar, §10 BottomBar, NavSheet and MoreSheet, §15 Baseline and BaselineList, §16 Gate, §17 flow steps, §18 TurnRow and CallStepper.
     - `components/canonical.html` renders each component once, in light and dark, with crops in `components/canonical/*.png`. Direction §8.1 maps each signature component to its class root and crop.
     - `check-mocks.mjs` enforces link order, no inline re-implementation, signature tokens only in components.css, and no raw colours.
  2. **Major, identity too close to Linear.**
     - Neel was re-keyed to an indigo dye (HSL ≈218°):
       - light fill `#1F4A94` (white label 8.52:1), with hover `#183C7A` and press `#143368`;
       - dark fill `#2F62C0` (5.79:1);
       - dark text `#8DB2EE`;
       - new Neel-ink `#0F203D` for the Baseline in both themes.
     - A working mark, "the cord", replaces the letter-V tile (`brand/mark.svg`, with `--mark-bg` and `--mark-fg`); direction §3.1 has the commission brief.
     - The sidebar loses its search field, the current page is shown "on the thread", and §1.5 is rewritten honestly about what is borrowed.
  3. **Major, the same fact repeated in one viewport.**
     - New rule P1: one fact, one place per viewport, and a repeat must add an action.
     - Direction §6.1, §6.3–§6.6 and anti-patterns 22–23 apply it: no "In this view" band, the WalletNotice only where there is no Baseline, Home has one heading, phones show only "Filter (2)", and the inspector never restates the live version.
  - **Helper agents.** At hand-back it had 7 helper agents still converting the remaining mocks, so 12 of 23 mocks passed check-mocks at that point. Helpers delete the superseded notice once their file passes; re-run `_tools/mark_superseded.py` for any leftovers.
- **Not done at the stop:** the relink of 15 mocks: the 9 `03-pages/*.html`, `00-direction-specimen.html`, `05-responsive-shell.html`, `05-responsive-flow.html`, `06-accessibility.html`, `07-motion-microinteractions.html` and `04-flow-designer/02-config-validation-lifecycle.html`. The orchestrator marked each one with a visible "Spec sketch … illustrative only" notice (`_tools/mark_superseded.py`) that points to the canonical prototype page. The reference implementation is `../prototype/`, built on `components/components.css`. `shell-partials.css` and `flow-grammar.css` stay only because those sketches still link them.

## Coordination incident
When the orchestrator messaged five running revisers, a second copy of each was started while the workflow's originals kept running. The two copies of a reviser sometimes edited the same files; they reconciled through `scratchpad/locks/`. The workflow was then stopped, so only one copy per area remained. The orchestrator re-assembles every combined `.md` from its canonical part files at the end.
