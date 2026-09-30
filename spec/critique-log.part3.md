## 5. Recommendations that were rejected or changed, and why

| Issue | The critic proposed | What was done instead | Why |
|---|---|---|---|
| U1, S3 | Adopt 05's old rules: tablets edit, phones edit step text and re-point answers | Tablets review, test and publish; phones read the Outline; editing from 1024 px | The direction, both Flow Designer specs, 06, 07 and every render already agreed, so 05 was the outlier. Editing needs the graph and the step in view at once (a 400 px sheet leaves 368–623 px of canvas on a portrait tablet, cf. F-FLOW-022); touch drag on portrait canvases is unproven (F-RWD-014); tablet editing would need new keyboard and screen-reader rules; there is no evidence of demand. Recorded as R §21 Q1 and Q2 for v1.1, decided from `review_edit_attempt` telemetry. |
| U1 | One phone layout from 05: Outline · Map · Issues · Test tabs with Publish in a top state row | FD1 §3.2's layout: TopBar, chip row, Outline \| Canvas switch, sticky Test · Publish bar above the BottomBar | Every existing render and four specs already used it; it keeps Publish in thumb reach and Flows as a BottomBar tab (R R4). |
| S3 | Remove the specimen's "Editing needs 1024" frame | Kept, with its Notice wording aligned to the canonical string | Tablets do not edit in v1, so the frame is correct. |
| S17 | Either lower the Baseline fold to `max-height: 600px`, or make the chip the primary surface | The second option: the 720 px fold stays and the BaselineChip is the primary status surface on 1366 × 768 and 1280 × 720 laptops | Below 600 px tall the tablet shell already takes over, so a 600 px fold would never fire in a shell that has a Baseline; it would cost every short laptop a Leads row and churn tokens and the build script. |
| U6 | Size the rank gap so a 140 px label fits between layers at 0.35 zoom | A 128 px gap with a 240 px minimum layer width (129 px pitch at 0.35); labels run 140 px where the next column is clear and stop 8 px before it otherwise (about 100 px, two lines, about 30 characters); the Outline docks for flows over 20 steps | When Fit is width-limited, the on-screen column pitch is the canvas width divided by the layer count whatever the gap; a 176–215 px gap would push a four-layer flow out of the Full band beside the docked inspector. The critic's own criterion (≥ 20 characters or the full title, no identical labels) is still met. |
| S8 | Alt+↑/↓ for issues, `M`-only move, drop Alt+Arrow | Alt+Arrow keeps "move" everywhere; issues on Alt+. / Alt+,; `M` Move mode stays as the announced single-pointer path | The proposal conflicts with U5, and Alt+Arrow already means move and reorder across the Outline, answer and case lists, column menus and 07. |
| T2 | Re-render FD2's mock and the specimen from the shared node CSS | Aligned to the frozen grammar in their own class vocabularies; a merge agent later moved the flow mocks onto `components.css` | FD2's mock reuses generic class names (`.seg`, `.ar`) that the shared file would restyle. |
| T4 | Dark `--chart-1` graphite-300; caller lane graphite-300 | Dark `--chart-1` graphite-250; caller lane graphite-400 (light) and graphite-500 (dark) | Measured: graphite-300 sits 14.5 ΔE from teal, under the 15 floor; graphite-300 is under 3:1 on the lane track. |
| S10 | Forced-colours selection as a `SelectedItem` fill | A 4 px Highlight inline-start bar; focus stays a 2 px Highlight outline | Tested with Playwright's forced-colours emulation: Chromium's text backplate hid `SelectedItemText`, and component backgrounds overrode the fill. |
| T7 | Retire `mono-20` | Deprecated (`$deprecated`), still emitted, lint rejects new uses, removed in tokens 2.0.0 | The F §15.7 versioning rule: removing a token is a major change through a one-release alias. |
| T5, T1 | Put the Baseline partial in `components/components.css` | First in `shell-partials.css` / `.js`, then merged into `components.css` §9, §10 and §15 with canonical class names | Another agent was writing `components.css` at the same moment and overwrote the first version (§7). |
| T12 | "The bottom bar is hidden only in full-screen sheets and flows" | Read as full-screen task flows; the phone Flow Designer keeps the BottomBar with Flows current | R R4, §4.1 and §10.5 make the phone Flow Designer a destination with Flows in the bar. |

---

## 6. Open items

### 6.1 Critique issues still open or partly open

These are scheduled in [`08-implementation-plan.md`](08-implementation-plan.md) (§8.3 lists the text inconsistencies that must be settled before the owning work item starts).

| Issue | What is left | Plan |
|---|---|---|
| U11 | Keep a word in SaveState and the live note at 1024–1279 (R §10.7 Compact row) | P2-11 |
| U12, T17 | Show the flow header's wallet chip only when low, blocked or testing; the two side-by-side rails in the designer | §8.3 S6, P2-11 |
| U13 | One rule for editing during a test run (FD1 §14 versus FD2 §14.2) | §8.3 S7, P2-16 |
| U14 | Replace `/billing?topup=1` in CK and L with `openTopUp({ source })` | §8.3 S5, P1-15 |
| U15 | A one-tap "Call my phone…" under an empty Contact field in the Cockpit | P1-11 |
| U16 | "Hear it in your browser" as a visible secondary on Home step 4 while the step is blocked | P1-10 |
| U18 | "Call…" visible at rest in the Leads actions column | P1-12 |
| U19 | D §6.3's "at least 5 leads" (R and L say ≥ 8); the Cockpit route `/dashboard` versus `/cockpit` | §8.3 S1, S3 |
| S18 | D §8.2's `.dark` variant and `html.dark` | §8.3 S4 |
| S19 | The generated `dark:` variant still matches inside a nested light island | P1-01 |
| S21 | Remove or mark `--size-tag` and `--space-cell-px`; move `scrollbar-gutter: stable` off `html` | P1-01 |
| S22 | The 30 px canvas controls and the other off-scale values in FD1 | P2-11 |
| S23 | Only CallHeader carries `role="status"`; N §0.5 alias wording | §8.3 S9, P1-07 |
| S24, T16 | The optional "Teach your agent" row first with a success tick; the sign-out dialog's primary | §8.3 S8, P1-10 |
| S25 | Composited-opacity pairs in `check-contrast.mjs` (today covered only by CT-02) | P1-02 |
| T10 | The "In this view" ViewSummary band in L §6.3 and CR §4.1 versus the direction's toolbar count | §8.3 S2, P1-12 |
| T13 | Collapse the 22 type roles | design decision |
| T14 | Remove `frame-neel` and `frame-rose` | P3-05 |
| T15 | A saturated dark destructive fill with a white label | P1-03 |
| T18 | Replace personal names with "Lead 1042 · Pune" in the data-nav gallery and the Call reports mock | spec hygiene |
| T19 | The Assistant's `bot` icon, ink avatar tiles, thumbs-up for Interested | P1-05, P2-05 |
| T20 | One brand line; the `/login` layout; the `/pricing` header primary | P2-08 |
| T21 | Show only exceptional payment states in Billing's Status column | P1-15, P2-03 |
| T22 | The 768 Call reports column set; the scroll-row edge fade | P1-13 |
| T24 | Move `directions/` to an archive or banner its HTML; update the README's Neel value | spec hygiene |

### 6.2 Leftovers named by the revisers and the mock-conversion helpers

- **The component-layer backlog.** The helpers that converted the last 15 mocks onto `components.css` left 39 requests that are still page-local or unmerged (for example a DataTable open-row state, ListRow selection, Gate header close and phone bottom-sheet variants, a `[data-density="touch"]` hook, a responsive PageHeader, a compact phone TurnRow, a busy button that keeps its colour, canonical Tooltip, Toast, Connect to… and Outline rows), plus two spec conflicts (the socket focus ring is 24 px in A11Y §7.1 but 18 px in `components.css` and FD1 §16.2; the FilterToken remove icon is 12 px in A11Y §15.2 but 14 px in N and the canonical page) and a shared-code defect (`shell-partials.js` pulses the Baseline and TopBar live dots, which M says are static). All are listed in [`_critique/open-items.md`](_critique/open-items.md) and scheduled as P1-16 in the plan.
- **Retired stylesheets.** `components/shell-partials.css` and `04-flow-designer/flow-grammar.css` are now pointer comments that no mock links; the last full copy of the flow grammar is in `_critique/retired/`. R still says its flow mock links `flow-grammar.css` (around §10).
- **Renders.** The page, responsive, accessibility and motion PNGs were re-rendered during the conversion (03:35–03:47 IST); the specimen's PNGs predate its last HTML edit and should be re-rendered.
- **Spec text lagging the P1 rule** (from the helpers): SH D11, §4.2 and §13.2 still give Home the H1 "Home" with "2 of 5 done" in its meta; AS §5.5–§5.6 repeat "Waiting for you" on the phone PlanBar; L §6.3 and CR §4.1 keep the ViewSummary band; PA's "Reference mock" row lists only `tokens.css` and `base.css`.
- **The coarse-pointer rail at 1024 × 690:** the 12 items need about 725 px and scroll; a coarse-only tightening to about 687 px was proposed and not applied; N §1.10 still says the rail fits at ≤ 800 px tall, which 40 px items do not at 690; the table mixes device sizes and inner viewports (plan §8.4).
- **Mock defects reported before the conversion** (re-check them in the converted files): in `05-responsive-shell.html` at 1024 × 690 with a fine pointer the rail items squashed to 37 px and the Baseline overflowed at ≤ 720 px tall (the mocks don't build the height classes); in `06-accessibility.html` the pointer-alternatives table clipped at 360–390 px.
- **Stale text:** F §16's forced-colours row still names the SelectedItem fill; A11Y CT-01 cites 396 contrast pairs (460 now).

---

## 7. The coordination incident, and how consistency was restored

**What happened.** The revision step ran one reviser per area (pages-a, pages-b, foundations, responsive, a11y, flow-designer, components, direction). When the orchestrator messaged five of the running revisers, a second copy of each was started while the workflow's originals kept running, so for a while two copies of a reviser worked on the same area and sometimes on the same files. The records show the effects:
- pages-a's first `components.css` was overwritten by another agent writing the brand-mark component, so its Baseline partial moved to `shell-partials.css` and `.js`; mocks were rewritten in bulk at 02:37 between its edits; shared scratchpad helper scripts (`assemble.mjs`) overwrote each other.
- The a11y reviser found identical additions made by its parallel copy and removed its own.
- The foundations reviser found the `base.css` fix already made by a concurrent edit, the left-panel tokens already added (it removed its duplicate), and a concurrent Neel hue retune that made page PNGs stale.
- pages-b's chart token was superseded by a parallel change (`--chart-1` to ink, `--chart-highlight` added), and it re-pointed its specs to match.
- The direction reviser was interrupted before relinking the 15 mocks.
- Assembled `.md` files drifted from their part files.
- Revisers resumed outside the workflow reported to the orchestrator directly, so their structured results are missing from `workflow-results.json`.

**How consistency was restored.**
1. Duplicate copies reconciled through lock files in the shared scratchpad; revisers switched to exact-match edits with a re-read guard and moved helpers to per-reviser folders.
2. The workflow was stopped, leaving one copy per area.
3. The hand-back revisers' changes were written up in [`_critique/handback-revisions.md`](_critique/handback-revisions.md).
4. The part files were declared canonical, and every combined document was re-assembled from its parts with [`_tools/reassemble.py`](_tools/reassemble.py) after the revisers finished.
5. Parallel definitions were merged rather than kept side by side: the shell partials into `components.css` with canonical class names (§9, §10, §15), the flow mocks onto `components.css`, and every token request into one register (F §18) with `build-tokens.mjs` failing on duplicate names.
6. The guards were re-run and strengthened: `check-contrast.mjs` (460 pairs, 0 failures) and an upgraded `check-mocks.mjs` (base classes, layout-only CSS, signature tokens, retired stylesheets). The 15 mocks that still failed at the stop were first marked with a visible notice by [`_tools/mark_superseded.py`](_tools/mark_superseded.py); helper agents then converted them onto `components.css` one by one and removed each notice once the file passed, until all 23 passed. What they could not merge is recorded in [`_critique/open-items.md`](_critique/open-items.md).
7. This log re-checked every issue against the current spec text (§4, §6) rather than against the revisers' claims alone, and was updated when the conversion finished during its writing.

---

## 8. State at hand-off (checked 2026-09-27)

| Check | Result |
|---|---|
| `python spec/_tools/reassemble.py --check` | every combined document matches its part files |
| `node spec/tokens/check-contrast.mjs` | 460 required pairs, 0 failures |
| `node spec/components/check-mocks.mjs` | 23 mocks checked, 0 failing, 0 problems; no "Spec sketch" notice remains |
| The 68 critique issues | 35 resolved, 6 resolved with a deviation, 13 partly, 14 open |
| By severity | blockers: 10 of 10 resolved (1 with a deviation); majors: 28 of 29 resolved (5 with a deviation), T10 partly; minors: 3 resolved, 12 partly, 14 open |
