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
