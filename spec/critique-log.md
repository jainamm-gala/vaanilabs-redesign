<!-- Assembled from critique-log.part1.md, critique-log.part2.md, critique-log.part3.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# Critique log: how the Vaani Labs redesign spec was challenged and revised

**Date:** 2026-09-27 · **Scope:** every judgement and critique the redesign spec went through, and what became of each issue.
**Sources:** [`_critique/workflow-results.json`](_critique/workflow-results.json) (the 3 directions, 3 judges, 3 critics with 68 issues, and 6 revision records), [`_critique/handback-revisions.md`](_critique/handback-revisions.md) (revisers that reported to the orchestrator outside the workflow), and a check of the spec files on 2026-09-27 (§8). Finding ids (F-FLOW-001 …) are the audit's, in `../audit/consolidated/`.

**Status words used below**

| Status | Meaning |
|---|---|
| **Resolved** | The fix the critic asked for is in the spec text (and mocks where relevant). |
| **Resolved, with deviation** | Fixed, but not exactly as the critic proposed; the reason is in §5. |
| **Partly** | Some of the fix landed; what is left is named. |
| **Open** | Not revised. Listed again in §6 so it can be scheduled. |

Doc shorthands follow [`08-implementation-plan.md`](08-implementation-plan.md) (D = direction, F = foundations, C/N/G/O = component specs, SH/CK/AS/L/CR/KB/ST/MP/PA = page specs, FD1/FD2 = Flow Designer, R = responsive, A11Y = accessibility, M = motion).

---

## 1. The three directions

| Key | Direction | Essence (condensed) | Files |
|---|---|---|---|
| `operator` | **Switchboard**: the precision operator console | Dense where you scan, quiet where you decide, never wrong about what is live. Graphite chrome, one Neel accent for operator intent, state colours only for real call and record state; keyboard-first with a density setting; a Flow Designer that reads Trigger → Logic → Action → Outcome through node shape; an explicit commit (pre-flight card or Publish sheet) for everything that bills or goes live. | [`directions/operator.md`](directions/operator.md), [`operator.html`](directions/operator.html) |
| `voice` | **Bolchaal** (बोलचाल): voice-native identity | Conversation is the interface: an ink-on-khadi workspace where colour and motion belong only to the voice; peacock marks what Vaani says and does; each call draws its own shape; every language appears in its own script. | [`directions/voice.md`](directions/voice.md), [`voice.html`](directions/voice.html) |
| `clarity` | **Clear Path**: guided clarity | Every screen answers where am I, what is true right now and what is the one next step, in calm plain language; premium through effortlessness, not effects. | [`directions/clarity.md`](directions/clarity.md), [`clarity.html`](directions/clarity.html) |

## 2. The judges' scores and the decision

Three judges scored all three directions, each through one lens.

| Direction | Taste | Product | Build | Mean | Lens wins |
|---|---:|---:|---:|---:|---:|
| **Switchboard** (`operator`) | 7.5 | **8.5** | **8.5** | **8.17** | 2 (product, build) |
| Bolchaal (`voice`) | **8.5** | 7.0 | 6.5 | 7.33 | 1 (taste) |
| Clear Path (`clarity`) | 6.0 | 8.0 | 7.5 | 7.17 | 0 |

**Why each judge chose as it did (condensed from the records)**
- **Taste → Bolchaal.** The most distinctive and ownable: Anek Latin display type, a warm khadi palette with one peacock, script chips and a conversation line that carry real data. Its weak points: a washed-out pale-cyan dark primary, an amber Draft chip, plum Logic tiles near the purple-AI trope, too many pills, and data-dependent signatures.
- **Product → Switchboard.** The best Flow Designer for real 26–35-step flows (left-to-right phases, a phase spine with counts, level of detail, frames, find, Tidy), the most complete lifecycle (draft and live, a save machine that ignores hydration, If-Match, a Publish sheet with a diff), a computed status line and a pre-flight card on every dialling path. Its weak points: thin onboarding, a phase-grouped phone Outline, 11 px caps headers, and IBM Plex replacing the audit's Hanken.
- **Build → Switchboard.** The most complete, exact token system (every contrast pair passes in both themes), the lowest colour migration, real density tokens and signatures with low data dependency. Its weak points: the Plex swap, an icon-only rail across 1024–1439, focus and selection drawn the same, no Tailwind dark-variant fix, and sub-12 px exceptions.

**The decision.** The final direction, **Sutradhar** ([`00-design-direction.md`](00-design-direction.md)), keeps Switchboard's system (tokens and contrast, density, the Flow Designer and its lifecycle, the keyboard model) and grafts the other two: Bolchaal's identity layer (language marks in native script, the talk strip only where real data exists, the branch-nested Outline, wallet runway, the Calls column, the blocking-notice rule) and Clear Path's guidance layer (the setup track, the call-gate logic with blocking and advisory checks, the live note, Go to [step], templates, the state matrix, `@theme inline`). The judges proposed **33 grafts** (taste 10, product 13, build 10) and **36 must-fix items** (taste 10, product 14, build 12); every must-fix item is mapped to its resolution in D §9. Rejected, with reasons in D §1.4 and [`directions/README.md`](directions/README.md): IBM Plex, Anek as a fourth family, the khadi ramp, peacock as the accent, plum/jamun/indigo tiles, When/Check/Do/End, renamed destinations, 52 px default rows, conversation lines in the Leads table, pill chips and "Undo publish".

## 3. The critics' verdicts

Three critics then reviewed the whole Sutradhar spec set (direction, foundations, component, page, Flow Designer, responsive, accessibility and motion specs, and the mocks).

| Critic | Verdict (condensed) | Blocker | Major | Minor |
|---|---|---:|---:|---:|
| **Usability** | Not ready for handoff. The direction is strong and most journeys get simpler (a server-computed setup track, a Call gate with a cost range, Top up in place, a Publish gate with a diff). Two blockers: the Flow Designer's tablet and phone behaviour is defined differently in 05 and everywhere else, and the interim fix for autosave-into-live (F-FLOW-001) is defined three incompatible ways. Large-flow tooling is well conceived but unreadable at Fit and at risk on performance. | 2 | 8 | 9 |
| **System** | Not ready for handoff. The token pipeline is solid (rebuilt byte-identical; all pairs pass) and the accessibility model is above average, but the specs contradict each other on what a developer must get right first: `base.css` re-bases rem to 14 px, the Gate has no spec, the canvas ARIA model, key map, tablet capability and interim are each defined differently, and about 60 tokens the specs use don't exist. | 6 | 11 | 8 |
| **Taste** | Disciplined, usable and appropriately undecorated, with excellent gates and a Flow Designer that finally reads as a professional builder, but it does not yet read as Vaani: the shell is a close cousin of Linear, Neel sits about 5° from Linear's indigo and carries about 12 meanings, and every mock re-implements components, so signature parts are drawn 2–6 ways. | 2 | 10 | 12 |
| **Total** | | **10** | **29** | **29** |

---

## 4. Every issue and how it was resolved

Reviser names: `responsive`, `flow-designer`, `foundations`, `a11y`, `pages-a`, `pages-b` (workflow records) and `components`, `direction` (hand-back records).

### 4.1 Usability critic (19 issues)

| # | Sev | Doc | Issue | Status | How and where |
|---|---|---|---|---|---|
| U1 | blocker | R | The Flow Designer's tablet and phone behaviour is defined twice: 05 lets tablets edit and phones fix text; every other doc says read-only Review and Outline; the renders show three phone layouts | **Resolved, with deviation** | One decision everywhere: Review mode at 768–1023, a read-only Outline on phones, editing from 1024 (coarse pointers there get 44 px sockets and Navigate / Arrange). R R5/R6 and §10.2–§10.13 rewritten; R §10.6 is "the one source" capability matrix; one phone layout (FD1 §3.2) and one tablet layout; one Notice string; no full-screen mode; flow renders rebuilt. The critic's recommendation to let tablets edit was not adopted (§5). `responsive`, `flow-designer` |
| U2 | blocker | FD1 | The interim before revisions is defined three ways, two of which still let edits reach live calls | **Resolved** | Interim I1 (the device draft) is the only interim: D §8.2 rewritten and the "Save in Flow Builder" decision reworded; FD1 §3.3 Publish states and §4.4 live note; SH §13.3 step 1 done when "a publish recorded through the Publish gate"; a new FD1 §19 criterion (20 edits, zero writes until Publish). `flow-designer` |
| U3 | major | FD2 | I1 has no conflict protection: last write wins, the device draft is invisible elsewhere, and storage failure makes "Saved on this device" false | **Resolved** | FD2 §4.9: the draft records a base (`updated_at` + hash); the Publish gate re-fetches and shows a blocking "published from another browser" row with Re-apply my changes on top (three-way merge) or Discard my draft; the diff uses the fresh copy; a `/flows` tag "Unpublished edits on this device"; `Not saved · this tab only` with `beforeunload`; a two-browser acceptance test; the gate row in FD2 §5.2. `flow-designer` |
| U4 | major | FD1 | Step numbers are both positional and stable | **Resolved** | `#n` is a stable per-flow number (max + 1, never reused, carried across versions); call order is said separately ("step 3 of 14 in call order"); Find matches `#9` and titles. FD1 D7, §5.1, §11.1, §12.2; FD2 §16.2, R12; A11Y §9.6; the D §6.5 aria-label. `flow-designer` |
| U5 | major | FD1 | The same keys mean different things (Alt+Arrow; `[` `]` versus the shell's `[`) | **Resolved** | A11Y §9.6 is the only canvas key map; Alt+Arrow moves everywhere; issues are Alt+. / Alt+,; the shell `[` is off in focus mode; lint LN-03 fails on duplicate bindings (A11Y §8.4); M Q5 closed. `flow-designer` |
| U6 | major | FD1 | Large flows are unreadable at Fit (titles truncate to about 10 characters) | **Resolved, with deviation** | Block-band labels as a counter-scaled overlay with `#n`, 140 px, two lines, stopping before the next column, with priority hiding; flows over 20 steps open with the Outline docked at ≥ 1280; the criterion "≥ 20 characters or the full title, no identical labels" (FD1 §5.5, §3.2, §9.2, §12.3, §19). The rank gap is 128 px with a 240 px minimum layer width, not a gap sized for 140 px at 0.35 (§5). `flow-designer` |
| U7 | major | FD1 | Counter-scaling text on every pan and zoom frame puts 60 fps at risk | **Resolved** | `--zoom` is written only on `onMoveEnd` and on band change, quantised to 0.05; during a gesture text scales with the transform; a criterion of ≥ 50 fps for a 1.0 → 0.25 pinch on 150 steps at 4× CPU throttle with no long task over 50 ms (FD1 D8, §5.5, §12.7, §19; M). `flow-designer` |
| U8 | major | FD2 | Templates are validated only in isolation, so a real first Publish can start with errors | **Resolved** | FD2 §15.3: instantiation adapts to the workspace (number or Outbound batch, Set hours, WhatsApp off unless approved, sample Q&A, CRM only with a connector); a "Needs" line on each TemplateCard; goal pre-selection prefers met needs (also SH §13.3); CI runs in an empty fixture workspace (0 errors, at most W08). `flow-designer` |
| U9 | major | FD2 | The blank-flow first view is defined three ways, one with a red error chip | **Resolved** | FD1 §13.2 everywhere: a connected Trigger → Outcome, the empty-state card and "No issues"; FD2 §17, R17, R §10.8 and A11Y §19.B rewritten. `flow-designer` |
| U10 | major | CR | The "review calls" journey stops at one call | **Resolved** | CR §2.6.4 review run: "Mark reviewed and next" (⌘/Ctrl+Enter), Previous/Next over a snapshot (`as_of`), reviewed rows keep their place with "Reviewed · Undo", counts drop at once and reconcile, the end state "All 9 calls reviewed"; §2.7, §2.8, §2.10, §2.12, §2.13 and mock section E. `pages-b` |
| U11 | minor | R | Below 1280 the designer loses the signals that prove draft and live are separate | **Open** | FD1 §4.4 keeps the live note in the phase-ruler row, but R §10.7's Compact row still makes SaveState icon-only (the time and word in the tooltip). |
| U12 | minor | FD1 | A permanent wallet chip in the flow header at ≥ 1280 | **Open** | FD1 §3.3 row 8 still shows it at ≥ 1280 (only when low below that). |
| U13 | minor | FD2 | Editing during a test run is allowed in FD1 §14 and blocked for Delete in FD2 §14.2 | **Open** | Unchanged. |
| U14 | minor | CK | Top-up targets disagree (`/billing?topup=1` versus the in-place sheet) | **Open** | CK §2.2, §4.8 and L §2, §6.1, §13 still name `/billing?topup=1`; SH §6.4 `openTopUp` is the in-place rule. |
| U15 | minor | CK | The builder's first test call is hidden inside the Contact combobox | **Open** | No one-tap "Call my phone…" under an empty Contact field yet (CK §3.3). |
| U16 | minor | SH | Home's time to first value is gated by number verification | **Open** | "Talk in browser instead" is still a small link that doesn't complete step 4 (SH §13.3). |
| U17 | minor | SH | The "Live" wording rule contradicts the render | **Resolved** | Setup states read "Published v1 · Site-visit qualifier" and "Inbound … · Verified", and Home's proof reads "v1 is published" (SH §5.2, §5.5, §13.3). `pages-a` |
| U18 | minor | L | The Leads page's core verb is invisible at rest | **Open** | "Call…" still appears only on hover and focus (L §4, §5.1, §6.6). |
| U19 | minor | R | Responsive numbers and zoom mappings disagree across docs | **Partly** | R is canonical for zoom mapping (200 % of 1920 → Review; 200 % of 1366 or 1280 → phone) and the budgets use inner viewports. Still open: D §6.3 says "at least 5 leads per screen" against R and L's ≥ 8 at 360 × 780, and CK keeps `/dashboard` with a `/cockpit` alias while SH §2.4 redirects it. |

---

### 4.2 System critic (25 issues)

| # | Sev | Doc | Issue | Status | How and where |
|---|---|---|---|---|---|
| S1 | blocker | `tokens/base.css` | `html { font: … }` sets the root to 14 px, so every rem token renders at 87.5 % (meta-12 at 10.5 px) | **Resolved** | `base.css` keeps `html` at 100 % and sets `font` on `body` (made by a concurrent edit); the per-mock workaround was removed from 17 mocks; foundations and overlay PNGs re-rendered and measured (16 px, 12 px); CT-03 added to F §15.5; C §1.10 and Q8, N §0.6 and Q1, A11Y §18 and R8 closed. `foundations` |
| S2 | blocker | O | The Gate spec is missing; five pages define their own gates, which diverge | **Resolved** | New [`02-components-gate.md`](02-components-gate.md) (parts 1–6): one frame; GateChecklist and GateCheckRow with one kind enum (`pass · blocking · advisory · adjusted · checking · unknown`); containers per breakpoint; `--e3` and `--radius-12`; one cost formula; a state machine and preflight; a 120 s token; one idempotency key per opening; ⌘/Ctrl+Enter; focus on the heading; one wallet ₹0 rule; every variant; divergences G1–G14 settled in G §0.4; page sections reduced to configuration; CSS in `components.css` §16; gallery `components/gate.html`. `components` |
| S3 | blocker | R | The Flow Designer's tablet and phone capability is defined three ways | **Resolved** | As U1. R §10.6 is the only matrix; D §6.5 and §8, FD2 §21.3 and A11Y §19.B point to it; the Outline edits at ≥ 1024 and is read-only below (FD2 L12, §16.1); "Call my phone" stays in the Cockpit on phones. `responsive`, `flow-designer` |
| S4 | blocker | FD1 | The canvas ARIA model contradicts itself (`role="application"` always, never, or only while focused) | **Resolved** | A11Y's standard-roles model: a `<section>` with a hidden `h2`, steps `role="group"` with a role description, sockets as buttons, the Outline a tree; `role="application"` removed from FD1 §3.1, §16.1, the hero mock and R §10.11; one instruction string in A11Y §9.6 (R15). `flow-designer` |
| S5 | blocker | FD2 | Three interim behaviours before the revisions backend | **Resolved** | I1 everywhere; O §18.1, §18.2 and §18.4 gain SaveStatus `device` and `volatile` and VersionChip `device` (the "Saved flow" live chip); FD1 §4.4 copy; the Baseline interim "Saved flow · Site-visit qualifier"; one offline string "Offline · 3 edits on this device". `flow-designer` |
| S6 | blocker | `tokens/tokens.json` | About 60 tokens the specs rely on don't exist, and some requests conflict | **Resolved** | tokens.json **1.1.0** with a changes note: `component.*` groups (nav, button, qr, flow, flow-color, data, form, overlay, shell, live) and a JS-only `interaction` group; timing, duration, motion and display additions; `build-tokens.mjs` emits component colours per theme and the `data-motion` block and fails on duplicate names; `check-contrast.mjs` resolves component colours; one name per token (`--timing-debounce` merged into `--timing-validate-debounce`, the left-panel names merged); the F §18 register replaces every spec's "Token requests" section. `foundations` |
| S7 | major | FD1 | Opacity applied to text for unreachable and dimmed steps (fails 1.4.3) | **Resolved** | A `--surface-2` fill with every word at full contrast; only tiles, sockets and connectors dim; F §1.3 rule 2 and §10 say "graphics only, never an ancestor of text" (the drag ghost is the flagged exception); a CT-02 fixture (A11Y §13.1); all mocks fixed. `flow-designer` |
| S8 | major | FD1 | The canvas key map contradicts itself and 06 | **Resolved, with deviation** | A11Y §9.6 is the only map, FD1 §11.2 and FD2 §16.5 and §18 reference it; the keys joined the A11Y §8.2 registry. Alt+Arrow stays "move" and issues moved to Alt+. / Alt+, instead of the critic's "Alt+↑/↓ = issues, drop Alt+Arrow" (§5); Space selects, Shift+Space toggles; `M` Move mode kept. `flow-designer` |
| S9 | major | F | Looping-motion rules differ between docs; spinner speed given two ways | **Resolved** | 07's rule everywhere: a 3-cycle pulse on the focal CallHeader only; spinner and indeterminate-bar loops only while a user-started request runs; C §1.7 uses `--dur-spin` (800 ms); `--dur-spin`, `--live-pulse-cycles` (both zeroed under reduced motion) and `--shift-sheet` added; C Q2 and O Q3 closed. `foundations` |
| S10 | major | `tokens/base.css` | In forced colours, focus and selection look identical; free and connected sockets look the same | **Resolved, with deviation** | Focus stays a 2 px Highlight outline; selection and the current page are a 4 px Highlight inline-start bar (a SelectedItem fill was tested and rejected, §5); `[data-mark="hollow"]` for free sockets; F §13, A11Y §13.3, C §1.8 and VR-02 updated. (F §16's traceability row still describes the SelectedItem fill: §6.) `foundations` |
| S11 | major | `tokens/legacy-aliases.css` | The alias file overwrote the validated sentiment palette | **Resolved** | The three `--sentiment-*` lines deleted; the legacy lint limited to names the file defines; F §15.6 row "same names, new values". `foundations` |
| S12 | major | A11Y | Two motion-preference specs and no CSS behind either | **Resolved** | `data-motion="reduce"` and "Match system · Reduce motion" everywhere; the reduced block emitted for the media query and the attribute; `base.css` caps animations under both; `THEME_BOOT` reads `localStorage['vaani:motion']` (F §15.3); VR-03; Motion items in the account menu and MoreSheet; A11Y §14.1, §14.3, §23, R13 and M §9.4, §13.2. `a11y`, `foundations` |
| S13 | major | FD2 | The flow left panel has three names, three widths and no definition | **Resolved** | `--size-left-panel` 280 and `--size-left-panel-tablet` 320 in tokens.json and FD1 §20.2; the old names replaced; FD1 §3.2's 300 corrected. `flow-designer` |
| S14 | major | FD1 | Component names drift between docs; full-screen mode is contradictory | **Resolved** | FD1 §20.1 is a component registry (owner, built on, props and variants, retired names); IssuesChip, ProblemsPanel, AnswerEditorRow, LevelMeter adopted; full-screen references removed from FD2 §12.3, O §18 and R §10.3 (no full-screen mode). `flow-designer` |
| S15 | major | R | After publishing, Publish is hidden in one doc and aria-disabled with focus on it in another; toast duration differs | **Resolved** | Publish stays visible and `aria-disabled` with "Nothing to publish. Your draft matches Live v7." at every width; focus returns to it; the toast is O §9 `publish`, 6 s, with Roll back in the version menu and History; R §10.13 asserts focus is never on `<body>`; G §4 "Done" fixed to match. `responsive` |
| S16 | major | A11Y | Touch-target promises the layouts can't keep (28 px answer rows, 28 px short-nav items on tablets) | **Resolved** | Nothing shrinks a touch target; short nav mode applies to `(pointer: fine)` only; answer and result rows grow to 44 px on coarse pointers, so the socket target is the 44 × 44 end of its row; Connect to…, Go to and the Outline are the 2.5.8 equivalents when zoomed out; rail items 44 px with a scrolling list; D §6.5, F §14, FD1 §5.1, §6.1, §8.1, §9.4, N §1.2, §1.10, SH §3.4, R §2.2–§2.4; `components.css` coarse rows; TS-01 at 1024 × 690. `a11y` |
| S17 | major | R | Chrome budgets subtract chrome from the screen height, not the viewport | **Resolved, with deviation** | Reference inner viewports (R §2.1: 1366 × 657, 1280 × 609 …); budgets recomputed in R §3.4, D §6.1, SH §3.4–§3.5, L §0, §5.0, F §5 and N; tests at inner sizes; the 720 px fold kept and the BaselineChip named the primary status surface on 1366 × 768 and 1280 × 720 laptops, instead of lowering the fold to 600 px (§5). `responsive` |
| S18 | minor | D | The direction and its "final specimen" carry superseded values and the old theming mechanism | **Partly** | D §5 now states the token values, and the specimen links `tokens.css`, `base.css` and `components.css` and passes `check-mocks.mjs`. Still open: D §8.2 prints `@custom-variant dark (&:where(.dark, .dark *))` and `html.dark`, while foundations and the generated CSS use `data-theme`. |
| S19 | minor | `tokens/tailwind.theme.css` | The dark variant still matches inside a nested light island; a comment is wrong | **Open** | The generated variant is unchanged. |
| S20 | minor | F | Gate and popover elevation and radius differ between docs | **Resolved** | G §0.4 G2: `--e3` and `--radius-12` for every gate container, popover included; O §1.2 amended; F §6 and §8 list gates at radius-12 and e3. `components` |
| S21 | minor | `tokens/tokens.css` | Duplicate size tokens; `--size-baseline` on small screens; `scrollbar-gutter` on `html` | **Partly** | `--size-baseline` is 0 below 1024. `--size-tag` and `--space-cell-px` remain, and `scrollbar-gutter: stable` is still on `html`. |
| S22 | minor | FD1 | Off-scale values (30 px canvas controls, radius 7, raw px padding), the flow H1 exception, zoom maximum and snap rule | **Partly** | Snapping is one rule (16 × 16 on drop, FD1 §9). The 30 px canvas controls remain (FD1 §9.1); the other values were not re-checked. |
| S23 | minor | N | Both CallHeader and the TopBar call chip carry `role="status"`; alias wording | **Open** | N §12.1 and §0.5 unchanged. |
| S24 | minor | SH | The setup track has six rows, one optional and first, against the direction's five | **Partly** | D §6.1 and §6.6 settle one heading and one progress statement; SH §13.3 still lists "Teach your agent" first with a success tick. |
| S25 | minor | `tokens/check-contrast.mjs` | CI misses pairs the specs create | **Partly** | Now 460 required pairs, including selected-row and soft-tint pairs and a component group read from tokens.json (nav keys, danger hover, QR, edge hover, talk lanes, chart highlight, diff tints, variable chips). Composited-opacity pairs are left to the rendered check CT-02. `foundations` |

### 4.3 Taste critic (24 issues)

| # | Sev | Doc | Issue | Status | How and where |
|---|---|---|---|---|---|
| T1 | blocker | D | No canonical visual reference: every mock re-implements components, and the "final" specimen hard-codes values that failed contrast | **Resolved** | [`components/components.css`](components/components.css) is the single component layer (§9 TopBar, §10 BottomBar, NavSheet and MoreSheet, §15 Baseline, §16 Gate, §17 flow steps, §18 TurnRow and CallStepper); [`components/canonical.html`](components/canonical.html) renders each signature component once with crops in `components/canonical/`; D §8.1 maps each to its class root and crop; `check-mocks.mjs` enforces link order, no inline re-implementation, signature tokens only in `components.css`, and no raw colours. The relink was unfinished when the workflow stopped (8 files passed; 15 carried a temporary "Spec sketch" notice); helper agents then converted the rest, and on 2026-09-27 all 23 mocks, the specimen included, pass with 0 problems and no notice remains. Their outstanding component requests are in [`_critique/open-items.md`](_critique/open-items.md). `direction` and its helpers |
| T2 | blocker | FD1 | The flagship screen is drawn four ways at 1440 and the text conflicts | **Resolved** | One grammar frozen and redrawn: an arrow-right connected phase ruler with a Phase columns toggle; the Outcome line "Lead → Interested" in plain meta-12; edge labels only on long edges, hover or selection; the play icon for Test; Tidy labelled at ≥ 1280; the answer editor as handle + label and examples + Go to. The FD1 mock rebuilt, the R flow mock rewritten, the FD2 mock and the specimen aligned; PNGs re-rendered. `flow-designer` |
| T3 | major | D | The identity is generic and too close to Linear | **Resolved** | Neel re-keyed to indigo dye `#1F4A94` (HSL ≈ 218°; dark fill `#2F62C0`, dark text `#8DB2EE`); the Baseline in Neel-ink `#0F203D` in both themes; the sidebar sheds the Linear tells (Search as a plain row, one chevron, the "thread" instead of a raised key); a working mark (the cord) replaces the letter V, with a commission brief; D §1.5 rewritten with the per-destination identity table; check-contrast 460 of 460. `direction` |
| T4 | major | F | Neel is overloaded (about 12 meanings); Analytics renders solid blue | **Resolved, with deviation** | Seven Neel jobs; info tokens become neutral aliases; `--chart-1` is ink (graphite-700, dark graphite-250) and `--chart-highlight` is the only Neel in a chart; `--seq-*` a teal ramp; the talk strip in ink and graphite; `--variable-*` and `--diff-*` tokens that are never accent; dark `accent-soft` lowered and kept to rows and chips; F §3.2–§3.9, D, N §5.2, §11.5, FD1, FD2; mocks re-rendered. Two values differ from the critic's by measurement (§5). `foundations`, `pages-b` |
| T5 | major | SH | The Baseline is rendered six ways | **Resolved** | One shared partial fed by the SH §5.2 strings (`lib/baseline-copy.ts`) in every page mock, byte-identical per state, empty segments omitted; SH §5.1, §5.2, §5.5, §5.7, §19. The partial first lived in `shell-partials.css/.js` and was then merged into `components.css` §15. `pages-a`, `direction` |
| T6 | major | N | StatusTag and LanguageMark are inconsistent; the language mark reads as a keycap | **Resolved** | All status from `lib/status.ts`; StatusTag has no tone, icon or label props; Callback due is always amber with a clock; outcomes borrow the lead status's tone; "Waiting for you" is `pause`, user-paused tasks `circle-pause`; the LanguageMark glyph tile is an 18 px surface-3 fill with no stroke, with `name`, `full` and `compact` variants; mocks re-rendered. `components` |
| T7 | major | F | Mono is used for phones, timers and durations, which feeds the console feel | **Resolved** | JetBrains Mono only in IdText, VariableChip, Code, SecretField and Keycap; phones, timers, timecodes and durations in Hanken with tabular figures; the live timer is `num-20`; `mono-20` deprecated for 2.0.0; N §5.8 PhoneText, Timer, Timecode; D §5, F §1.3, §2, §15.5 and the page specs updated. The page mocks still draw phones with a shared `.mono` class (§6). `foundations` |
| T8 | major | FD1 | Trigger → Logic → Action → Outcome reads weakly | **Resolved** | The ruler is one connected bar with arrow-right; Actions get a result-row variant (a check or x glyph, data-13 text-2, no examples, an inset rule); an optional Phase columns view, off by default; FD1 D2, D3, §4.4, FD2 and D updated and drawn in every flow mock. `flow-designer` |
| T9 | major | ST | Letter pseudo-icons on brand-coloured squares in Integrations | **Resolved** | ServiceMark: a 28 px surface-2 tile with the vendor's one-colour mark at 16 px, Lucide fallbacks; ST §7.4, §14, R9; the same rule for Personal agents contacts and the Book meeting and Send WhatsApp inspector rows; only OAuthButton keeps full-colour marks. `pages-b` |
| T10 | major | D | The same fact is repeated several times in one viewport | **Partly** | D P1 "One fact, one place per viewport" with do/don't pairs, P7, anti-pattern 22 and the §6 rules for the shell, Leads, Call reports, the Flow Designer and Home; the Leads chrome budget drops the band. L §6.3 and CR §4.1 still specify the "In this view" ViewSummary band. `direction` |
| T11 | major | CR | Analytics is the most generic screen (all Neel, cards); Call reports rows carry two tints | **Resolved** | CR D12: a StatStrip without cards (trend only on hover or focus), ReportSections without cards, graphite single-series charts with `--chart-highlight`, a graphite hour chart instead of the Neel heat strip, Latest calls removed; Sentiment as a plain icon and word; CR §2.3, §2.5, §2.6.1, §4.5–§4.7, R8–R11; mock and PNGs re-rendered. `pages-b` |
| T12 | major | SH | Phone navigation contradicts itself across mocks | **Resolved** | Every phone TopBar and BottomBar drawn from the nav config: no hamburger on phone TopBars, Cockpit · Leads · Call reports · Flows · More with the ellipsis; SH §2.6, §3.4, §3.10, §4.3 "One source"; N §1.8; the 00–07, 05-shell and 05-flow mocks re-rendered. `pages-a` |
| T13 | minor | F | The type scale is too granular (22 roles) | **Open** | F §2.3 still has 22 roles. |
| T14 | minor | F | The `frame-neel` and `frame-rose` tints are violet-adjacent | **Open** | Both tints remain in `tokens.css`. |
| T15 | minor | C | The dark destructive button is a pastel fill with dark text | **Open** | Dark `--danger` is still `red-300`. |
| T16 | minor | SH | Home has a double title and repeated progress; the sign-out dialog's primary loses data | **Partly** | D §6.1 and §6.6: one heading (the 40 px display is the H1) and progress once. The optional step still leads the track and SH §9.3's dialog was not changed. |
| T17 | minor | FD1 | Chrome noise in the designer (wallet chip, `#n` everywhere, saturated minimap, two icon rails) | **Partly** | The minimap is neutral (FD1 §9.3) and Tidy is labelled; `#n` stays on every step on purpose (stable references, U4); the wallet chip at ≥ 1280 and the two rails remain. |
| T18 | minor | N | Realistic personal names in some mocks | **Partly** | Gone from the specimen; still in `components/data-nav.html` and `03-pages/04-call-reports-analytics.html`. |
| T19 | minor | N | Generic "AI" cues (the `bot` icon, ink avatar tiles, thumbs-up for Interested) | **Open** | The Assistant keeps `bot` (F §12, SH §2.2) and Interested keeps `thumbs-up` (N §5.3). |
| T20 | minor | PA | Marketing and auth are generic; the brand line is inconsistent | **Partly** | The hero is a real recorded call in TurnRows (PA §5). The H1 and the meta line still differ, `/login` is still a single centred panel and the `/pricing` header was not re-checked. |
| T21 | minor | KB | A green "Completed" chip on every Billing row | **Open** | The KB §2.5 wireframe still shows it on each row. |
| T22 | minor | R | Some breakpoints look shrunk rather than designed | **Partly** | Analytics' KPI cards became the StatStrip and phone filter tokens moved into the filter sheet; the 768 Call reports column set and the scroll-row edge fade were not changed. |
| T23 | minor | M | The live-dot motion is specified three ways | **Resolved** | The 3-cycle rule in D §5, P7 and anti-pattern 4, F §11, N §0.4 and §5.4, A11Y and M. `foundations` |
| T24 | minor | `directions/README.md` | The superseded directions are still in `spec/` without a banner | **Partly** | The README says they are "not specs to implement" and D §8.1 calls them archived; the folder was not moved, the HTML has no banner, and the README still quotes the first Sutradhar Neel (`#2B45C2`). |

---

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
