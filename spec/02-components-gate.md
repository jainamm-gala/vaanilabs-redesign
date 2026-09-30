<!-- Assembled from 02-components-gate.part1.md, 02-components-gate.part2.md, 02-components-gate.part3.md, 02-components-gate.part4.md, 02-components-gate.part5.md, 02-components-gate.part6.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 02 · Components: gates (Gate, GateChecklist, GateCheckRow and the gate variants)

**Status:** v1 for build · **Date:** 2026-09-27 · **Group:** gate · **Follows:** `spec/00-design-direction.md` (Sutradhar, **P3** "Nothing dials, bills or goes live without a gate", §6.2, §6.3, §6.5, §6.6, §8), `spec/01-foundations.md` + `spec/tokens/tokens.css` (every value), `spec/02-components-overlay-feedback.md` (the containers: Popover `gate`, Sheet `gate`; the tier model §3.1) and `spec/02-components-core.md` (Button, Field, RadioCard, disabled reasons §1.6).
**Token rule:** every value below is a token from `tokens.css` or a `calc()` of tokens. No hex, no ad-hoc px. This spec needs **no new token**.
**Evidence:** finding ids (F-UX-…, F-A11Y-…, F-FLOW-…, F-QA-…, F-RWD-…) refer to `audit/consolidated/`.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/02-components-gate.md`, assembled from `02-components-gate.part1.md` … `part6.md` (edit the parts, then re-assemble) |
| Gallery: every check kind, the Call gate (single and batch), the Publish gate, the money gate, the setup track and the inline checklist, light and dark, plus 390 px bottom sheets | `spec/components/gate.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `spec/components/gate-light.png`, `gate-dark.png` (1440), `gate-mobile.png` (390) |

**Citations.** D = direction · F = foundations · C = core · N = data-nav · O = overlay-feedback · G = this spec · CK = `03-pages/01-agent-cockpit` · AS = `02-assistant` · L = `03-leads` · KB = `05-knowledge-billing` · MP = `07-meeting-personal-agents` · SH = `00-app-shell-ia` · FD = `04-flow-designer/02-config-validation-lifecycle` · A11Y = `06-accessibility` · R = `05-responsive` · ST = `03-pages/06-settings`.

---

## 0. How to read this spec

### 0.1 Scope

| § | Component | React export(s) |
|---|---|---|
| 1 | The gate frame: anatomy, containers per breakpoint, header grammar | `Gate`, `GateHeader`, `GateFooter` |
| 2 | Checks | `GateChecklist`, `GateCheckRow`, `GateCheckGroup` (+ `lib/gate.ts` kind map) |
| 3 | The consequence line (cost-line grammar) | `GateCost`, `formatCostRange()`, `formatRunway()` (KB §3) |
| 4 | Behaviour shared by every gate: states, preflight, gate token, idempotency, global blockers, keyboard, focus, announcements | `useGate()`, `useGatePreflight()` |
| 5 | Variants | `CallGate` (`mode="single" \| "batch"`), `PublishGate` (`mode="publish" \| "rollback"`), `SetupTrack` + `SetupStep`, `AddAgentGate`, form gates (`StartMeetingSheet`, `NewTaskSheet`), money gates (`TopUpSheet`, `AutopayGateSheet`, `PlanChangeSheet`), inline uses (`ReadyToCallCard` readiness, `ApprovalCard`) |
| 6 | Server contract | `GatePreflight`, `GateCheck`, `CostEstimate` types; endpoints per variant |
| 7 | React | props sketches and hooks |
| 8–11 | Accessibility summary, acceptance checks, do / don't, traceability, open questions | |

### 0.2 What a gate is (D P3, O §3.1 tier 4)

A **gate** is the one component that stands between a user and an action that **dials people, spends money or goes live**. Every gate has the same four parts and nothing else:

1. **What will happen**: a title that names the verb and the object ("Call 9 leads", "Publish v8", "Top up wallet"), and one sentence saying that nothing happens until you confirm.
2. **Checks**: a checklist of `blocking`, `adjusted` and `advisory` rows (plus `pass`), each a sentence with at most one fix.
3. **The consequence line**: what it costs (a range, never false precision) or, when it costs nothing, what it affects ("Callers hear v8 from the next call").
4. **One confirming action** whose label repeats the verb and the count ("Start 9 calls", "Publish with 1 warning", "Pay ₹590 via UPI"), confirmed by the labelled button or `⌘/Ctrl+Enter`, never by a single key or a single click on the entry point.

No setting, role or mode skips a gate (D P3; admins included). The only memory a gate keeps is a proof, never a bypass ("Test call on this version today, 11:02 am").

### 0.3 Ownership

| Layer | Owns | Does not own |
|---|---|---|
| **Overlay** (O §4, §5) | The containers: Popover `variant="gate"` and Sheet `variant="gate"`, portals, scrim, focus trap, dismissal, motion | What is inside a gate |
| **This spec** | The gate anatomy, GateChecklist and GateCheckRow, the check-kind enum, the cost-line grammar, the state machine, preflight and gate token, idempotency, global blockers and the wallet ₹0 rule, keyboard, focus, announcements, the variant contracts | Page data, which check applies where, page-specific copy nouns |
| **Pages** | **Configuration only**: entry points, which checks from §5 apply, settings mode, the variant's copy nouns, what happens on the page after the result | Re-specifying marks, containers, elevation, keys, token or key handling |

Page sections that configure a gate: CK §1.3 and §3.4 (Cockpit single Call gate and inline readiness), CK §5.6 (Rep console readiness), L §6.10 and §7.4 (Leads Call gate, single and batch), FD §5 (Publish gate), SH §13 (setup track), MP §1.7, §1.8, §2.6, §2.9 (Start a meeting, Add agent, Personal agents readiness, New task), KB §2.7, §2.8, §2.10 (Top up, Autopay, Plan change), AS §10.3–§10.5 (ApprovalCard and the Call and Publish steps). Where a page table conflicts with this spec, **this spec wins** and the page is corrected.

### 0.4 Divergences found in the page specs, and the decision

| # | What diverged | Where | Decision (this spec) |
|---|---|---|---|
| G1 | Three check vocabularies: `pass · blocking · advisory · checking · unknown`; "Must pass · Adjusted · advisory"; `todo · current · progress · blocked · needs-admin · failed · done` | CK §7.2 · L §6.10 · SH §13.4 | **One enum:** `pass · blocking · advisory · adjusted · checking · unknown` (§2.1). "Must pass", "Adjusted" and "Good to know" survive only as group labels. Setup steps map onto the enum (§5.3) |
| G2 | Elevation `--e2` for the Call gate popover | L §5.2, §6.10; O §1.2 | **`--e3` and `--radius-12` for every gate container**, popover included (F §8, D elevation row). O §1.2 amended |
| G3 | Blocking mark amber `triangle-alert` vs red `x` | CK §7.2 vs L §6.10 | **`x` on `--danger-soft`** for blocking; amber is for `adjusted` and for advisory warnings. The footer why-text was already `--danger-text` (L, MP) |
| G4 | "Global blockers never open the gate" yet "Wallet is ₹0" listed as an in-gate Blocked state; wallet ₹0 as an in-gate row in the Add agent gate | L §6.10 vs L §7.4; MP §1.8 | **One wallet ₹0 rule** (§4.4): the entry point is `aria-disabled` with the reason and the gate does not open; if the wallet drops while the gate is open, a `blocking` wallet row appears at the top of the checks |
| G5 | Titles "Call Lead 1042?" vs "Call Lead 1042" | CK §1.1, §3.4 vs L §6.10 | **No question mark.** A gate is a review surface, not a yes/no question (ConfirmDialog keeps question titles, O §3.2) |
| G6 | `⌘/Ctrl+Enter` confirms in every gate vs "does nothing" in the Autopay and Plan change sheets | CK, L, FD, MP vs KB §2.13 | **It activates the enabled primary in every gate.** While a UPI approval is pending there is no in-app primary, so the chord does nothing then (§5.6) |
| G7 | Call gate at 768–1023: "Popover 400" vs "anchored if it fits, else bottom sheet" | CK §4.6 vs O §1.7, L §11, R §3 | **Anchored if the whole gate fits, else bottom sheet** (§1.3) |
| G8 | Initial focus: the heading vs the first field | A11Y §9.5, L vs MP §1.7, §2.9 | **The heading** (`tabindex="-1"`), so `C` then Enter can never dial. **Form gates** (Start a meeting, New task) focus their first field, and Enter never submits a gate form (§4.5) |
| G9 | Idempotency key "when the gate opened" vs "per sheet opening" vs supplied by the caller | L §6.10, MP §1.7, AS §19 | **One key per opening**, reused by Retry; a launcher (Assistant step, ApprovalCard) may pass its own (§4.3) |
| G10 | A 2-minute `gate_token` in Leads only; Cockpit "re-checks at confirm" | L §3.2 vs CK §4.2 | **Every variant** preflights on open and confirms with `gate_token` + `idempotency_key`; the token lives 120 s (§4.3) |
| G11 | `GateChecklist` needs a collapsed one-line summary and a page-level use | MP §4 | Adopted: `collapse="passing" \| "all-pass" \| "none"` (§2.4) |
| G12 | "Top up" is tier 4 but no gate existed for money | KB R6, O §3.1 | **Money gate** variant (§5.6): the quote is the consequence line, bounds are checks, the primary names the amount |
| G13 | ApprovalCard "uses the Gate anatomy (the Gate spec is not written yet)" | AS §10.3, §19 | ApprovalCard (tiers 1–3, inline, not modal) composes `GateChecklist` and `GateCost`; Call and Publish steps **launch** the gate (§5.7) |
| G14 | Gates must open from any page with a payload and report the result | AS §19 | `useGate().open(variant, payload, options)` returns the confirmed result (§7) |

---

## 1. The gate frame

### 1.1 Anatomy

```
┌────────────────────────────────────────────────────┐
│ Call 9 leads                                   [×] │ 1 Header: title-16 h2 (tabindex -1) + close
│ Nothing dials until you start. · Checked just now  │   consequence sentence (text-2) · freshness (text-3)
├────────────────────────────────────────────────────┤
│ Settings  Site-visit qualifier v7 · Vaani · …  Change │ 2 Scope (optional): read-only or editable summary
├────────────────────────────────────────────────────┤
│ Must pass                          Ready · 1 to know│ 3 Checks: GateChecklist (summary right of the label)
│ ✓  Caller ID verified · +91 80 •••• 2210            │   GateCheckRow per check (§2)
│ ✓  Inside calling hours · open until 7 pm IST       │
│ Adjusted                                            │
│ –  2 leads were called in the last 24 h    Include  │
├────────────────────────────────────────────────────┤
│ 9 calls · about 1 to 2 min each · ₹21 to ₹44       │ 4 Consequence line (§3)
│ Wallet ₹2,340.50 · about 16 h of calls              │
│ (•) Place now          ( ) Schedule…                │ 5 Choice (optional): RadioCard pair (C §6.2)
├────────────────────────────────────────────────────┤
│ why-text                     Cancel  [Start 9 calls]│ 7 Footer: surface-2, why-text, Cancel, primary
└────────────────────────────────────────────────────┘
```

| # | Part | Tokens and rules |
|---|---|---|
| 1 | **Header** | Title `--type-title-16`, `h2`, `tabindex="-1"`, one line, sentence case, no question mark (G5). Line 2: the consequence sentence in `--type-meta-12` `--text-2` ("Nothing dials until you start.", "Callers hear v8 only after you publish.", "Nothing is charged until you approve in your UPI app."), then ` · ` and the freshness in `--text-3` ("Checked just now" → "Checked 2 min ago · **Recheck**", §4.3). Test kinds add a `CallKindTag` before the sentence (CK §7.5). Close: IconButton 28 (`--control-h-sm`) in popovers, 32 (`--control-h`) in sheets, `aria-label="Close"`. Padding `--space-panel-pad-lg` (20) |
| 2 | **Scope** (optional) | What the action applies to. `settings="readonly"`: a `KeyValueList variant="inline"` (N §8), because the choices were made before the gate (Cockpit card). `settings="editable"`: one summary line in `--type-data-13` `--text-2` + tertiary sm **Change** (`aria-expanded`) that expands the pickers in place; any change re-runs the checks after `--timing-validate-debounce` (300 ms). Hairlines `--bw-hairline` `--border` above and below |
| 3 | **Checks** | `GateChecklist` (§2). Inside a gate **every row renders**, passing ones included: it is the last look before a billable or live action |
| 4 | **Consequence line** | `GateCost` (§3, `.gate-cost` in `components/components.css`): an inset on `--surface-2`, `--radius-6`, padding `--space-10` `--space-12`, `--type-data-13` tabular in `--text-2` with the amount in `--fw-semibold` `--text`; the count and duration on the left, the range on the right (they stack below 360 px). The wallet line follows it in `--type-meta-12` `--text-3` (`.gate-note`). **Never empty and never removed**: when the estimate is unknown it shows the rate (§3.4) |
| 5 | **Choice** (optional) | One decision that changes the action, never a setting. It sits directly above the footer because it relabels the primary (Start → Schedule): `RadioGroup variant="card"` (C §6.2), two cards side by side ≥ 400 px of content, stacked below. Examples: Place now / Schedule… (CallGate), Publish now only (no choice), Now / later (New task) |
| 6 | **Note** (optional, Publish only) | Textarea, 1 row growing to 4 (FD §5.5) |
| 7 | **Footer** | Sticky, fill `--surface-2`, top hairline, padding `--space-12` `--space-20`. Left: **why-text** `--type-meta-12`, `--text-2` normally (the consequence: "Callers hear v8 from the next call."), `--danger-text` when blocked (the first blocking sentence, linked from the primary by `aria-describedby`). Right, `--space-inline-md` apart: **Cancel** (tertiary) and the **primary** (C §2.1 `primary`, one per gate). Buttons are `--control-h` (32), 44 on touch |

**Density:** gates always render at Standard (`data-density="standard"`, O §1.2); touch lifts controls to 44 px. **Spacing:** sections are separated by hairlines, never by cards inside cards; body padding `--space-panel-pad-lg` (20); group label to first row `--space-4`; between groups `--space-8`.

### 1.2 Container surface (one for every gate)

| Property | Value | Note |
|---|---|---|
| Fill | `--surface-overlay` | F §3.3: "Dialogs, sheets, gates" |
| Edge | 1 px `--border-overlay` | Dark theme separates by this ring, no shadow blur tricks |
| Elevation | **`--e3`** | Popover and sheet alike (G2); dark `--e3` is the deep ring-free shadow |
| Radius | **`--radius-12`** | Sheets: inner corners only, 0 at a viewport edge (O §1.2); bottom sheets: top corners only |
| Layer | Popover gate `--z-popover` (60, so it sits above a docked or overlay record sheet it was opened from); sheet gate `--z-modal` (50) over `--scrim` at `--z-scrim` | O §1.6: one modal at a time |
| Motion | Popover: fade + `--shift-popover` over `--dur-base`; sheet: `translateX(100%)` → 0 over `--dur-slow` (bottom sheet `translateY(100%)`); exit `--dur-fast`; reduced motion: fade only | O §1.5 |
| Scrim | Sheet gates and bottom sheets: flat `--scrim`, **no blur**. Popover gates: no scrim (focus is trapped instead) | D anti-pattern: no glass |
| Reference CSS | `.gate`, `.gate--sheet`, `.gate--page` and their parts in `spec/components/components.css` §16 (the canonical component layer); gallery `spec/components/gate.html` | Mocks never restyle these classes |

---

### 1.3 Containers per breakpoint

| Container | Variants | Desktop ≥1440 · Laptop 1280–1439 · Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|
| **Popover gate** (O §5, `Popover variant="gate"`, width `--size-popover-gate` 400) | CallGate, AddAgentGate | Anchored to its trigger: `top-end` from footers and the BulkBar, `bottom-start` from toolbars and rows; offset `--space-4`, collision padding `--space-8`, flips and shifts, never covers its trigger. Modal focus trap, no scrim | Anchored **if the whole gate fits** above or below the anchor within `100svh − 2 × --space-8`; otherwise the phone bottom sheet (G7) | **Bottom sheet**: full width, top corners `--radius-12`, `--e3`, scrim, `max-height: calc(100svh − var(--space-40))`, sticky header, sticky footer with the primary above `env(safe-area-inset-bottom)`, 44 px controls |
| **Sheet gate** (O §4, `Sheet variant="gate"`, `--size-sheet-gate` 640) | PublishGate, money gates, form gates (Start a meeting, New task), ConflictSheet | From the right, modal, with scrim | Modal, full height, width `min(var(--size-sheet-gate), 100%)` | **Full screen**: sticky 56 px header (title and close, or "‹ Back" inside a multi-step body), sticky footer above the safe area, 44 px buttons, the primary on its own full-width row when both labels don't fit |
| **Inline** | GateChecklist in a card or section (CK New call card, Rep console, MP Personal agents readiness), ApprovalCard | In flow; no container of its own | same | same; action links become 44 px rows |
| **Page** | SetupTrack (SH §13) | In the 720 px main column | Full width minus the page margin | Full width; every step action full width at 44 px |

The popover's body scrolls internally (`max-height` = available space minus `--space-8`, `overscroll-behavior: contain`) while its header and footer stay put, so the primary is never scrolled out of view. A gate never opens inside a Dialog and never stacks on another gate (§4.6).

### 1.4 Copy grammar

| Slot | Grammar | Examples |
|---|---|---|
| Title | Verb + object (+ count), sentence case, **no "?"**, names in `translate="no"` | "Call Lead 1042" · "Call 9 leads" · "Call your phone" · "Publish v8" · "Roll back to v7" · "Add Vikash to Weekly demo" · "Top up wallet" · "Switch to Starter" · "Start a meeting" · "New task" |
| Consequence sentence | What confirming does, and that nothing happens before | "Nothing dials until you start." · "Your phone rings when you start. Not counted in reports." · "Callers hear v8 only after you publish." · "Agent time is charged only while the agent is in the room." · "Nothing is charged until you approve in your UPI app." |
| Freshness | "Checked just now", then "Checked {n} min ago · **Recheck**" once the token expires (§4.3) | — |
| Primary | Verb + count or object. Never "OK", "Confirm", "Yes", "Submit" | "Place call" · "Start 9 calls" · "Schedule 9 calls" · "Publish v8" · "Publish with 1 warning" · "Publish without testing" · "Roll back to v7" · "Add agent" · "Pay ₹590 via UPI" · "Pay ₹499 and switch" · "Create room" · "Start task" |
| Busy | The verb in progress, ending in "…" | "Placing call…" · "Starting…" · "Publishing…" · "Adding…" · "Creating room…" |
| Why-text | The first blocking sentence, else the consequence after confirming | "Calls can't start outside calling hours." · "Fix 2 errors to publish." · "Confirm 1 warning to publish." · "Callers hear v8 from the next call." |
| Cancel | Always "Cancel" (tertiary) | — |

Never in a gate: "Are you sure?", a bare "OK", a primary without the count when a count exists, "≈" or a single rupee figure for an estimate, "free" unless the server says so, vendor names, uppercase labels.

---

## 2. Checks: `GateCheckRow` and `GateChecklist`

### 2.1 The check-kind enum (`lib/gate.ts`)

One enum for every gate, every inline readiness list and the setup track. The server sends the kind; the client never upgrades or downgrades it.

| Kind | Mark (20 px tile, `--radius-4`, glyph `--icon-sm` 14, stroke per F §12) | Sentence | Stops the primary? | Action (at most one) | Group label in a gate |
|---|---|---|---|---|---|
| `pass` | `check` in `--success-text` on `--success-soft` | `--text` | No | Optional quiet link ("Change", "Open") | Must pass |
| `blocking` | `x` in `--danger-text` on `--danger-soft` | `--text`; the sentence names the condition, the action names the fix | **Yes.** Primary `aria-disabled`; the first blocking sentence becomes the why-text (`--danger-text`) | **Required**: "Top up", "Verify a number", "Schedule", "Go to step", "Ask an admin" | Must pass (sorted first) |
| `adjusted` | `minus` in `--warning-text` on `--warning-soft` | `--text` + meta saying what was done ("Skipped to avoid a repeat call") | No. The scope changed: count and cost are recomputed | "Include" when allowed; "View" or none otherwise | Adjusted |
| `advisory` | `info` in `--text-2` on `--surface-2`; with `severity="warning"`: `triangle-alert` in `--warning-text` on `--warning-soft` | `--text` | No, **unless** it carries a required `ack` that is not ticked | Optional; or an `ack` Checkbox ("Publish with this warning") | Good to know |
| `checking` | Spinner sm in a 2 px `--accent-mark` ring (the StageProgress "current" mark, O §14.3) | `--text-2` ("Checking the DND registry…") | Yes: primary `aria-disabled` "Checking…" | none | Its own group |
| `unknown` | `circle-help` in `--warning-text` on `--warning-soft` | `--text` ("Couldn't check calling hours.") | **Yes**, treated as blocking | **Required**: Retry | Must pass |

Rules:
1. **Colour is state, and every mark has a word** (D P2). Each row's sentence starts with a visually hidden kind word ("Passed:", "Blocking:", "Adjusted:", "Note:", "Warning:", "Checking:", "Couldn't check:"), so the kind never depends on colour or glyph (F-A11Y-019).
2. **Red means "you must fix this before confirming"**; amber means "we changed something, or this is risky"; neutral means "worth knowing". Nothing in a gate is green except passed checks.
3. **A blocking row always has its fix.** Where the user can't fix it (role), the action is "Ask an admin" (copies a request) and the sentence names who can help.
4. **Adjusted rows never hide people silently.** Each states the count and the reason; its group expands (`aria-expanded`) to list up to 5 members, each with its own Include, then "and 7 more".
5. **Include is refused where it would break a rule**: already in a scheduled batch (it would dial twice), marked Do not call, or no valid number. DND is includable only for leads with recorded consent (open question, L §15).

### 2.2 `GateCheckRow` anatomy and tokens

| Part | Tokens |
|---|---|
| Row | `<li>`, grid `var(--space-20) minmax(0,1fr) auto`, column gap `--space-10`, padding-block `--space-6`, `align-items: start`; min height `calc(var(--space-20) + 2 * var(--space-6))` (32) |
| Mark | 20 × 20, `--radius-4`, glyph 14, `aria-hidden="true"`, `data-mark` (forced colours) |
| Sentence | `--type-data-13` `--text`; numbers tabular; names `translate="no"`; phone numbers as `PhoneText` (masked) |
| Meta (optional) | Second line, `--type-meta-12` `--text-3`: proof or detail ("Test call on this version today, 11:02 am", "Opens 10 am IST tomorrow") |
| Action (optional) | Right column, `--type-label-13` `--accent-text`, `white-space: nowrap`, hit area ≥ `--size-hit-min` (44 on touch). `<a href>` when it navigates (Phone setup), `<button>` when it acts in the gate (Include, Retry, Schedule, Recheck). Accessible name carries the object: "Include 2 leads called in the last 24 h" |
| Ack (advisory warnings) | A Checkbox (C §6.1) under the sentence, in the text column: "Publish with this warning". Optional `reasonOptions` reveal a Select "Reason" when ticked (FD §5.2 "Publish without testing") |
| Members (adjusted) | Disclosure "Show 2 leads" (`button`, `aria-expanded`); nested `<ul>` indented to the text column, 32 px rows: name · masked phone · Include |
| Sub-rows (blocking with parts) | Nested `<ul>` indented to the text column, one per item ("#5 Ask about budget: 'No reply' isn't connected. · Go to step"); more than 5 collapse behind "Show all 12" |

Dark theme: every soft tint and its text pair are the dark tokens (≥ 5.47:1, F §3.4). **Forced colours:** marks keep a `CanvasText` 1 px border and glyph; the checking ring uses `Highlight`; the row never relies on the tint.

### 2.3 `GateChecklist`

`<section aria-labelledby>` with a heading, a summary `StatusText` and one `<ul role="list">` per group.

| Context | Heading | Groups |
|---|---|---|
| Inside a gate | none of its own (the gate's `h2` names it); group labels in `--type-label-12` `--text-3`: **Must pass** · **Adjusted** · **Good to know**; the summary sits right-aligned on the first label's line | Must pass (blocking and unknown first, then checking, then pass, in catalogue order) · Adjusted · Good to know. Empty groups don't render |
| Inline (card, section) | `h3` `--type-title-14` ("Readiness", "Before your agent can work", "Before you start") with the summary under it | One list, ordered blocking · unknown · checking · adjusted · advisory · pass |
| Page (setup track) | The page `h1` and the progress line (§5.3) | One ordered list of steps |

**Summary line** (`StatusText` md, O §11, `role="status"`):

| Situation | Tone | Grammar | Examples |
|---|---|---|---|
| Every row passes | success | "Ready" or "All {n} checks pass" | "All 5 checks pass" · "Ready to publish" |
| Passes, with adjusted or advisory rows | success | "Ready · {n} thing(s) to know" | "Ready · 1 thing to know" · "9 calls ready · 3 leads skipped" |
| Unticked required acks | warning | "Ready · {n} warning(s) to confirm" | "Ready · 1 warning to confirm" |
| Any blocking row | danger | "{What} blocked · {n} thing(s) to fix", or the variant's noun | "Phone calls blocked · 1 thing to fix" · "2 errors block publishing" |
| Any unknown row, nothing blocking | warning | "Couldn't finish the checks · Retry" | — |
| In flight | progress | "Checking…" after `--timing-skeleton-delay` (200 ms) | "Checking 12 leads…" |

**Collapse** (`collapse` prop; G11):

| Value | Where | Behaviour |
|---|---|---|
| `none` | **Every gate** | Every row renders |
| `passing` | Inline lists that sit above a gate (CK New call card, Rep console) | Blocking, unknown, checking, adjusted and advisory rows render; passing rows sit behind "Show all {n} checks" (`button`, `aria-expanded`, remembered per user). Rendering the Cockpit mock proved this necessary: five green rows buried the one that mattered and the card overflowed 1440×900 (CK §1.3) |
| `all-pass` | Page-level readiness (MP §2.6) | When every row passes, the list collapses to one success line with a link ("Ready · +91 80 •••• 2210 · confirmations on WhatsApp · **Agent settings**"); it re-expands by itself when a row stops passing and announces that once |

**Loading:** rows render as `checking` with their names when the catalogue is known ("Checking wallet…"), else three skeleton rows (O §13). A `pass` is never shown before the server answers (D P1).

### 2.4 ARIA and announcements

- The summary is the only live part (`role="status"`, polite). It announces **once per settled change**, throttled by `--timing-announce-throttle` with `dedupeKey` = the gate id: "9 calls ready. 3 leads skipped." · "Phone calls blocked. Outside calling hours." · "Fix 2 errors to publish." Individual rows are never announced as they arrive.
- Rows are a plain list; marks are `aria-hidden`; the hidden kind word carries the state.
- The primary points `aria-describedby` at the why-text, so a focused, `aria-disabled` primary reads "Start 3 calls, dimmed. Calls can't start outside calling hours."
- An action that changes the scope (Include, Change settings) moves no focus; the summary announces the new count.

---

## 3. The consequence line (`GateCost`)

Every gate says what confirming costs, or, when it costs nothing, what it affects. The line never disappears: when an estimate can't be computed it shows the rate (§3.4).

### 3.1 Kinds

| Kind | Used by | Line 1 (`--type-data-13` `--text`, tabular; the amount in `--fw-medium`) | Line 2 (`--type-meta-12` `--text-3`) |
|---|---|---|---|
| `range` (calls) | CallGate, the Assistant Call step, Personal-agent call decisions | "{n} call(s) · about {lo} to {hi} min{ each} · ₹{low} to ₹{high}" | "Wallet ₹{balance} · about {runway} of calls" |
| `capped` (a task with limits) | New task | "Up to 20 calls · about 1 to 2 min each · ₹48 to ₹96 · never more than ₹200" | wallet line |
| `rate` (open-ended time) | AddAgentGate, Start a meeting, a billed Browser test | "₹0.08/s while the agent is in the room · about ₹4.80 a minute" | "Wallet ₹2,340.50 · about 8 h" (and free minutes where they apply: "29 of 30 free minutes left") |
| `quote` (money) | TopUpSheet, PlanChangeSheet, AutopayGateSheet | A `KeyValueList variant="rows"` from the **server quote**, values right-aligned: Wallet credit · GST (only when the quote has it) · **You pay** · New balance + runway | "Pay with any UPI app. Money is added when your UPI app confirms." |
| `impact` (no money) | PublishGate, ApprovalCard change and delete steps | "Callers hear v8 from the next call. Calls in progress finish on v7." · "Affects 24 leads · Undo available for 24 h" | "Publishing costs nothing." · "Runs as you · Operator" |

### 3.2 The call range (one formula, every surface)

- `lo`, `hi`: the 25th and 75th percentile durations of **connected** calls on that flow version over the last 30 days (at least 20 calls; else the flow's all-time; else the workspace's). Displayed minutes: `lo` floored (at least 1), `hi` ceiled.
- `low = floor(n × lo_seconds × rate)` and `high = ceil(n × hi_seconds × rate)` in whole rupees, so the range never understates the maximum (L §6.10).
- "each" only when n > 1. Examples at ₹0.04/s, 1 to 2 min: **1 call · about 1 to 2 min · ₹2 to ₹5**; **9 calls · about 1 to 2 min each · ₹21 to ₹44**.
- `n` is the count **after** adjustments; it updates with Include.
- If `high` exceeds the balance, the wallet check becomes `advisory` `severity="warning"`: "Wallet covers about 40 of 120 calls. Calls pause at ₹0." (Top up · Turn on autopay). It never blocks unless the wallet is ₹0 (§4.4).
- Runway is `formatRunway(balance / rate)` (KB §3), floored, always paired with the rate it used.

### 3.3 Formatting

Indian grouping (`₹1,00,000`); whole rupees for estimates, paise for balances and quotes ("₹2,340.50"); tabular numbers; the middle dot as separator; never "≈", "~" or a single figure for an estimate (D P3); never animated or counted up (N §4.8); never announced (D §8: cost and wallet decrements are silent).

### 3.4 When an estimate is unavailable (D §8 interim, hidden not simulated)

| Missing | Line 1 | Line 2 |
|---|---|---|
| Median durations (D §8 item 6) | "{n} calls · Rate ₹0.04/s" | "Wallet ₹2,340.50" (no runway) |
| Task limits (MP PA3) | "Rate ₹0.04/s · no spending limit yet" as an `advisory` `severity="warning"` row as well | wallet line |
| The quote (KB BL3) | The money gate cannot open: its entry point is `aria-disabled` "Top up isn't available right now. Try again in a minute." | — |

---

## 4. Behaviour shared by every gate

### 4.1 States

| State | Enters when | Checks | Primary | Why-text | Esc |
|---|---|---|---|---|---|
| **Checking** | Open, Recheck, any scope change | `checking` rows after `--timing-skeleton-delay` | Keeps its label (no layout jump), `aria-disabled` | "Checking…" | Closes |
| **Ready** | Preflight settled with no `blocking`, `unknown` or unticked required `ack` | As returned | Enabled | The consequence ("Calls start in order within a minute.") | Closes |
| **Needs confirmation** | Ready except a required `ack` is unticked | — | `aria-disabled` | "Confirm 1 warning to publish." | Closes |
| **Blocked** | Any `blocking` or `unknown` row | Blocking first | `aria-disabled`, still focusable | The first blocking sentence, `--danger-text` | Closes |
| **Stale** | The gate token expired (§4.3) | Unchanged; freshness "Checked 2 min ago · **Recheck**" | As before; pressing it re-checks first | unchanged | Closes |
| **Changed** | The confirm-time recheck differs from what was shown | Updated | Back to Ready or Blocked | A warning `Notice` (O §10.1, inline scope) at the top of the body: "Checks changed since you opened this. Review and start again." (verb per variant); focus moves to the summary | Closes |
| **Confirming** | Primary activated | Locked (`inert` body) | Busy label + Spinner, `aria-busy="true"`; a second press is ignored | unchanged | **Ignored**; Cancel disabled |
| **Failed** | Error response, or no response within the request timeout | Unchanged | Enabled again | `InlineError` (O §11.2) at the top of the body, `role="alert"`: the sentence from `lib/errors.ts` (O §16.2) + **Retry** (same idempotency key) + Details. "You were not charged" / "Nothing was dialled" only when the server confirms it | Closes |
| **Done** | 2xx | — | — | — | The gate closes (exit `--dur-fast`); focus and result per variant (§5) |

### 4.2 Opening

A gate opens only from: a control whose label ends in "…" ("Call Lead 1042…", "Call 9 leads…", "Publish v8…", "Add agent…", "Top up…"), `C` in Cockpit and Leads, a palette action ending in "…", a toast action ("Call 12 leads…"), or a launcher (ApprovalCard "Review and call…" / "Review and publish…"). **Opening never sends the action**; it sends the preflight. Gates are not addressable by URL (a shared link can't open a billing decision), except the money gate's `?topup=1`, which opens the sheet at the amount step where nothing is charged (KB §2.7).

### 4.3 Preflight, gate token and idempotency key

- **Preflight.** On open, on Recheck and after a scope change (debounced 300 ms), the gate calls its variant's preflight endpoint (§6) and receives `{ checks, scope, cost, gateToken, expiresAt, checkedAt }`. Inline lists outside a gate (the Cockpit card, Rep console, Personal agents) use a cheap `GET …/readiness` that returns checks only, never a token; a gate always preflights anew.
- **Gate token.** Binds what the user saw: the scope hash, the check ids and kinds, and the cost band. It lives **120 s**. After expiry the freshness line reads "Checked 2 min ago · Recheck". Pressing the primary with an expired token runs the preflight first: if checks, count and cost band are unchanged it proceeds with the new token; otherwise it enters **Changed** and does not proceed. A confirm the server rejects with `409 gate_checks_changed` (token expired or mismatched) is handled the same way, using the fresh preflight in the response. The server re-validates everything at confirm, token or not.
- **Idempotency key.** A UUID generated when the gate opens (or passed in by a launcher, such as an Assistant step or a Personal-agent decision, so a retried step can never create a second batch). Every Retry of this opening reuses it; a new opening makes a new one. Sent as the `Idempotency-Key` header with `gate_token` in the body. The same key always returns the same result (one batch, one room, one version, one payment). The client also ignores a second activation while Confirming.

### 4.4 Global blockers and the wallet ₹0 rule (one rule for every gate)

A **global blocker** is a condition, known before the gate opens, that makes every confirm from an entry point impossible and can't be fixed inside the gate. Each variant lists its own (§5); for billable calls they are: wallet ₹0, no verified caller ID, no live flow for a Real call, offline, and a role that can't place calls.

1. **Before opening, the entry point is `aria-disabled`** (focusable) with its reason (C §1.6): inline where there is room ("Wallet is ₹0. **Top up** to place calls."), else in its tooltip. Activating it (click, Enter, `C`, the palette) does **not** open the gate: it announces the reason politely and shows an info toast with the fix ("Wallet is ₹0. Top up to place calls. · **Top up**"). This is rung 4 of the wallet ladder (O §10.2).
2. **If a global blocker appears while the gate is open** (the wallet reaches ₹0 through other calls, the connection drops, the role changes), the gate stays open and gains a `blocking` row **at the top of Must pass**, with its fix ("Wallet is ₹0. Top up to place calls." · Top up). The primary becomes `aria-disabled`; the summary announces once. The gate never closes by itself and never discards the user's choices. The gate subscribes to the pushed wallet state while it is open.
3. **At confirm**, a `402` from the server renders as that same row, never as a toast only.
4. **Low is not empty.** A low wallet is never global: in the gate it is `advisory` `severity="warning"` with Top up and Turn on autopay (§3.2).
5. **Selection-dependent conditions are never global**: DND, recently called, calling hours, language, agent seats and a lead's number are in-gate rows.
6. **Top up from inside a gate** closes the gate (one modal at a time), keeps its payload (selection, settings, choice) in session storage keyed by the gate id, and opens the Top-up sheet. The Top-up success toast offers to reopen it ("**Call 12 leads…**", "**Continue starting Weekly demo**"), with the payload and a fresh preflight.

### 4.5 Keyboard and focus

| Moment | Rule |
|---|---|
| Open | Focus moves to the gate **title** (`tabindex="-1"`); the dialog is `aria-labelledby` the title and `aria-describedby` the consequence sentence. **Never the primary**, so `C` then Enter can never dial (A11Y §9.5). **Form gates** (Start a meeting, New task) focus their first field (`data-autofocus`, O §1.3) |
| Tab | Trapped, in reading order: title → scope Change → row actions, members and acks → choice → note → Cancel → primary → close |
| `⌘/Ctrl+Enter` | Anywhere in the gate, fields and the note included: activates the primary when it is enabled; when `aria-disabled`, announces the why-text and does nothing. The primary has `aria-keyshortcuts="Control+Enter"` (`Meta+Enter` on macOS) and its tooltip shows the Kbd (C §7.3; hidden on touch) |
| Enter | Activates the focused control only. **Enter in a field never submits a gate**: the primary is `type="button"` and there is no implicit form submission. One exception: Enter in the Top-up amount field goes to the UPI step, where nothing is charged (KB §2.13) |
| Esc | Closes and returns focus to the trigger (O §1.4). A dirty form gate shows the inline discard state first (O §2.5). Ignored while Confirming |
| Single keys | None inside a gate, and no preference, role or mode skips one (D P3) |
| After Cancel or Esc | Focus returns to the trigger, else the `returnFocusTo` fallback (the next row, the list heading, the page H1). Never `<body>` |
| After Done | Per variant (§5), always to something that exists: the call card heading, the trigger or the table's active row, the Flow header's version area, the room's Agent row |

### 4.6 One modal at a time

A gate never opens a second modal and never stacks on another gate. A fix that needs its own surface (Top up, Phone setup, Test now, Go to step, Show a change) closes the gate first; Top up reopens it as in §4.4. Menus, selects and comboboxes inside a gate portal above it (`--z-popover` 60 > `--z-modal` 50, O §1.6). Feedback about the gate's own action appears inside the gate; background toasts queue until it closes.

### 4.7 Announcements and motion

- Polite: the summary on each settled change (§2.4); the result after Done ("9 calls scheduled." · "Version 8 is live." · "Vikash joined Weekly demo."). Assertive: only the InlineError of a failed confirm, once.
- Never announced: timers, the cost line, wallet decrements (D §8).
- Motion: only the container (§1.2) and the primary's busy Spinner (C §2.1). Rows change in one frame, numbers change in place, nothing counts up.

### 4.8 Telemetry (ids, enums and counts only)

`gate_opened` {variant, mode, entry, requested_n} · `gate_outcome` {variant, result: `confirmed · cancelled · blocked · failed · changed`, blocking_ids, adjusted_counts, seconds_open} · `gate_blocked_entry` {variant, blocker_id} (the entry point was `aria-disabled` and activated) · `request_without_gate` (must stay 0; alert if not). Never names, numbers, amounts typed by the user, or free text.

---

## 5. Variants

Each variant is the frame of §1, the checks of §2, the consequence line of §3 and the behaviour of §4, plus the configuration below. Pages add only the table of their §0.3 section.

### 5.1 `CallGate` (single and batch)

**Container:** popover gate (§1.3). **Global blockers** (§4.4): offline · a role that can't place calls · wallet ₹0 · no verified caller ID · no live flow at all (for a Real call).

| | `mode="single"` | `mode="batch"` |
|---|---|---|
| Opened from | Cockpit primary and `C` (CK §3.4) · Leads row "Call…", sheet "Call…", `C` on a focused row (L §6.10) · ⌘K "Call Lead 1042…" · Home "Call my number…" (SH §13.3) · Rep console "Call back…" · an Assistant "call yourself" step | Leads BulkBar "Call {n} leads…" and `C` with a selection · the Assistant Call step "Review and call…" (AS §10.4) · a Personal-agent call decision (MP §2.7) |
| Call kinds (CK §1.1) | Test call or Real call (a Browser test only if the owner decides it is billed, CK §8 Q2) | Real call only |
| Scope | `settings="readonly"` when the choices were made before the gate (the Cockpit card, a Personal-agent task): `KeyValueList variant="inline"`: To (name, `PhoneText`, `LanguageMark` name) · Flow (name + version Tag + tested state) · Voice · Caller ID. `settings="editable"` everywhere else: one summary line "Site-visit qualifier v7 · Vaani · Auto language · Caller ID •••• 2210" + **Change**, which expands `FlowSwitcher purpose="assign"` (live flows only; "Uses each lead's flow" with its breakdown when assignments differ), `VoicePicker variant="compact"` (N §12.3), Language `Select`, Caller ID `Select`. Changes apply to this call or batch only; "Make default" is a separate link with an Undo toast (F-UX-014) | Always `editable`, except from a Personal-agent task (`readonly`: the task's settings) |
| Choice (`choice` prop) | `"when-needed"` (Cockpit: a live console calls now): shown only when a Real call is outside calling hours: **Place now** (disabled, "Outside calling hours") · **Schedule for 10 am IST** (a `TimeField` within the next opening). `"always"` (Leads, where scheduling one callback is an everyday job): the batch pair below | `"always"`: **Place now** "Calls start in order within a minute." · **Schedule…** "Pick a time inside calling hours." (DateTime limited to calling hours, IST) |
| Primary | "Place call" · "Schedule call" | "Start {n} calls" · "Schedule {n} calls" ({n} after adjustments) |
| Confirm | `POST /api/calls` | `POST /api/calls/batches` |
| Done | Cockpit: the card becomes the call (`?call=<id>`), focus → the call card heading, announce "Dialling". Elsewhere: toast "Calling Lead 1042 · **Open in Cockpit**", focus → the trigger | Selection clears; toast "Starting 9 calls · **View in Cockpit**"; the batch is in Cockpit › Up next as **Scheduled** with Pause and Cancel; focus → the trigger or the table's active row; announce "9 calls scheduled. Selection cleared." |
| Failure copy | "Couldn't reach the phone line. The call was not placed and you were not charged." (the last clause only when confirmed) | "Couldn't start the calls. Nothing was dialled." |

**Header per kind** (§1.4):

| Kind | Title | Tag | Consequence sentence |
|---|---|---|---|
| Real call, single | "Call Lead 1042" / "Call +91 98765 43210" | none (the absence is deliberate, CK §7.5) | "Their phone rings when you place the call." |
| Real call, batch | "Call 9 leads" | none | "Nothing dials until you start." |
| Test call | "Call your phone" | `CallKindTag` Test call | "Your phone rings when you place the call. Not counted in reports." |
| Browser test (only if billed) | "Talk in browser" | `CallKindTag` Browser test | "Uses your microphone. Nobody else is called." |

**The check catalogue** (one list, server ids; pages choose none of it, the server returns what applies to the kind and mode):

| id | Applies to | `pass` | `blocking` (or global, §4.4) | `adjusted` (batch) | `advisory` | Action |
|---|---|---|---|---|---|---|
| `connection` | All | (hidden) | Global: "You're offline." (the ConnectionBar owns the message) | — | — | — |
| `role` | Test, Real | (hidden) | Global: "Your role can't place phone calls. Ask an admin." | — | — | Ask an admin |
| `wallet` | Test, Real | "Wallet ₹2,340.50 · about 16 h of calls" · batch: "Wallet covers this batch" | Global at ₹0: "Wallet is ₹0. Top up to place calls." (in-gate only if it drops while open) | — | `warning`: "₹42.10 left · about 17 min of calls" · "Wallet covers about 40 of 120 calls. Calls pause at ₹0." | Top up · Turn on autopay |
| `caller_id` | Test, Real | "Caller ID +91 80 •••• 2210 verified" | Global: "Verify a caller ID before placing phone calls." (members: "Ask an admin to verify one.") | — | — | Phone setup |
| `flow_live` | Real | "Site-visit qualifier v7 is live" | Global when no flow is live: "No live flow. Publish a flow to call leads." · In-gate: "Draft v8 can only call your own number. Use Live v7 or Call my phone." · "Draft v8 has 2 errors. Fix them in the flow." | Mixed flows: "Home-loan follow-up has no live version · 1 lead skipped" | — | Open flow |
| `flow_tested` | All | The meta line of `flow_live`: "Test call on this version today, 11:02 am" | — | — | "Live v7 hasn't been tested since it was published. Talk in browser first." · batch: "No test call on v7 yet" | Talk in browser · Place a test call… |
| `calling_hours` | Real | "Inside calling hours · open until 7 pm IST" | "Outside calling hours. Opens 10 am IST." (Place now only; choosing Schedule clears it) | — | — | Schedule (switches the choice and presets the next opening) |
| `dnd` | Real, to leads | "Not on the DND list" · batch: "DND registry: 12 of 12 clear" | Single: "This number is on the DND list. It can't be called for promotions." (exact rule: CK §8 Q7) | "1 lead is on the DND registry · Skipped" | — | Include (only with recorded consent) |
| `recent_call` | Real, to leads | (hidden) | — | "2 leads were called in the last 24 h · Skipped to avoid a repeat call" | Single: "Called 22 h ago · Callback due today" (information; nothing to include) | Include (batch) |
| `already_scheduled` | Real, batch | (hidden) | — | "4 leads are already scheduled in 'Weekend follow-ups' · Skipped" | — | View in Cockpit (no Include: it would dial twice) |
| `do_not_call` | Real, to leads | (hidden) | Single: "Lead 1042 is marked Do not call." | "1 lead is marked Do not call · Skipped" | — | none |
| `number_valid` | Real | (hidden) | Single: "This number isn't valid. Check it on the lead." | "1 lead has no valid phone number · Skipped" | — | Fix (opens the lead) |
| `language` | Real | (hidden) | — | — | "2 leads prefer Tamil. Vaani speaks Hindi and English." | Choose voice · Keep |
| `all_skipped` | Batch (derived) | — | "All 3 leads were skipped. Include some, or cancel." (why-text; the primary stays `aria-disabled`) | — | — | — |

Inline readiness lists outside the gate add two rows the gate itself never needs, because they concern the browser: `microphone` (Browser test, Take over, Rep console: pass "Microphone allowed" / "Asks for your microphone when you start"; blocking "Microphone blocked. Allow it in your browser's site settings, then Retry." with an info Popover of steps) and the Rep console's `call_channel`, `speaker` and `notifications` rows (CK §5.6).

**States and copy** (the §4.1 machine with this variant's words):

| State | Copy |
|---|---|
| Checking | Summary "Checking 12 leads…" · why-text "Checking…" |
| Ready | "All 5 checks pass" · single: "Ready · 1 thing to know" · batch: "9 calls ready · 3 leads skipped" |
| Blocked | "Phone calls blocked · 1 thing to fix"; why-text = the first blocking sentence ("Calls can't start outside calling hours.") |
| Changed | "Checks changed since you opened this. Review and start again." |
| Confirming | "Placing call…" · "Starting…" |
| Estimate unavailable | "9 calls · Rate ₹0.04/s" and the balance, no runway (§3.4) |

### 5.2 `PublishGate` (publish and roll back)

**Container:** sheet gate (§1.3). **Global blockers:** offline · a role that can't publish ("Only admins can publish this flow. Ask Anika R. or Rohit S.") · nothing to publish (the entry reads "Nothing to publish", `aria-disabled`). **Opened by:** "Publish v8…" in the Flow header, the palette action, "Roll back to v7…" (`mode="rollback"`), and the Assistant's Publish step launcher. Opening flushes pending draft saves, then preflights (server validation with the shared rule ids, FD4, plus where the flow is used, FD5).

| Part | Configuration |
|---|---|
| Header | Title "Publish v8" / "Roll back to v7"; meta "Site-visit qualifier · draft from v7 · 3 changes by you and Anika R."; consequence "Callers hear v8 only after you publish." |
| Body order | **Checks** (`h3` `--type-title-14` + summary) → **Where it goes live** (`TargetList`, FD §5.3) → **Changes** (`DiffList`, FD §5.4) → **Note** (Textarea, FD §5.5). The decision first, then its blast radius, then the detail |
| Checks | The flow rule catalogue (FD §5.2) mapped to the enum: each **error** is `blocking` with one sub-row per error and "Go to step"; each **warning** is `advisory` `severity="warning"` with a required `ack` "Publish with this warning"; **Tested on this draft** is `advisory` with an `ack` "Publish without testing" whose `reasonOptions` (Wording change only · Urgent fix · Tested another way · Other) are stored on the version; draft not saved, draft changed while open, number not verified, voice and language mismatch are `blocking`; wallet and calling hours are `advisory` (publishing costs nothing, so money never blocks it); "Couldn't run the server check" is `unknown` |
| Consequence | `impact`: why-text "Callers hear v8 from the next call." and, under Where it goes live, "Calls in progress finish on v7. New calls use v8." |
| Primary | "Publish v8" · "Publish with 1 warning" · "Publish without testing" · "Roll back to v7" · busy "Publishing…" |
| Summary copy | "Ready to publish" · "Ready · 1 warning to confirm" · "2 errors block publishing" · "Checking…" |
| Changed | Server 422 found more issues: rows update, summary "The server found 1 more error", focus to the summary. 409 (Live changed while open): a blocking row "Anika R. published v8 at 11:40 am while this was open. This draft now publishes as v9. **Review changes**" |
| Done | Focus returns to the Publish button that opened the gate (the header's, or the phone sticky bar's), which stays in place as `aria-disabled` "Nothing to publish. Your draft matches Live v8." at every width, so focus never falls to `<body>` (06 §7.3, `05-responsive` §10.8); toast (O §9.2 `publish`, 6 s, Roll back then stays in the version menu) "v8 is live on 1 number and 1 batch · **Roll back to v7…**"; announce "Version 8 is live." (FD §5.7) |
| Failure copy | "Couldn't publish. Nothing changed: callers still hear v7." + Retry |
| "Go to step" / "Show" / "Test now" | Close the gate and move focus to the step, the change or the Test panel (§4.6); the note is kept for the session |

---

### 5.3 `SetupTrack` (the page variant)

The Home setup track (SH §13) is a gate whose confirming action is "your workspace goes live": a checklist computed on the server where each step's fix is a whole task. It lives in the page, not in an overlay, and it has no primary of its own; the current step's button is the page's one primary.

**Steps are checks.** Each `SetupStep` has a kind from the §2.1 enum; the server sends it. Because an unmet step on a new workspace is expected rather than a failure, unmet steps are **presented** as steps (rings), not as red crosses. The red `x` is kept for a step that actually failed. The hidden kind word still names the state.

| Step state (SH §13.4) | Kind | Mark (20 px) | Row treatment | Hidden word |
|---|---|---|---|---|
| Done | `pass` | `check` on `--success-soft` | Title `--text`, proof line `--text-3`, quiet "Open" or "Change" | "Done:" |
| Current | `blocking` (unmet), `current: true` | 2 px `--accent-mark` ring with a centre dot | `--accent-soft` fill, 2 px inset `--accent-mark` bar, **primary** button | "Current step:" |
| To do | `blocking` (unmet) | 1.5 px `--control` ring | Secondary button | "To do:" |
| In progress | `checking` | Spinner sm in a 2 px `--accent-mark` ring | `StatusText` progress ("Indexing 1 file… 60%", "Payment pending · updates when UPI confirms") | "In progress:" |
| Blocked by another step | `blocking`, `dependsOn` | `lock` on `--surface-2` | Title `--text-2`; the reason names only what is missing, each a link ("Needs money in the wallet.") | "Blocked:" |
| Needs an admin | `blocking`, `role` | `lock` on `--surface-2` | No action button; "Copy request link" | "Needs an admin:" |
| Failed | `blocking`, `failed: true` | `x` on `--danger-soft` | `StatusText` danger + retry ("Didn't connect · No answer · **Try again**") | "Failed:" |
| Optional | any, `optional: true` | as its state | `Tag` "Optional" after the title; excluded from the count | — |

Rules: the **current** step is the first required step, in order, that is neither done nor waiting on someone else; a step waiting on someone else moves the current mark to the next actionable step. The progress line ("2 of 5 done", `ProgressBar`, O §14.2) counts required steps only. "Live" is said only when every required step is `pass` (F-UX-006). A step whose fix is a billable call ("Call yourself") opens the **CallGate** (§5.1); the track never dials. Loading shows six skeleton rows; nothing is shown as done or current before the server answers. Container: page (§1.3). Configuration, steps and copy: SH §13.

### 5.4 `AddAgentGate`

**Container:** popover gate, anchored to **Add agent…** in a room (MP §1.8). **Global blockers:** offline · wallet ₹0 ("Wallet is ₹0. Top up so the agent can join.") · a role that can't add the agent.

| Part | Configuration |
|---|---|
| Header | "Add Vikash to Weekly demo" · "Agent time is charged only while the agent is in the room." |
| Scope | `readonly` `KeyValueList`: Does ("Presents slides · Q3 pricing.pdf") · Voice ("Vikash · Hindi, English") |
| Checks | `agent_seat`: pass "Agent seat available · 2 of 3 free"; blocking "All 3 agent seats are in use. End another room to free one." · **Show open rooms**. `wallet`: pass with runway; advisory `warning` when low; blocking only if it drops to ₹0 while open (§4.4) |
| Consequence | `rate`: "₹0.08/s while the agent is in the room · about ₹4.80 a minute" · "Wallet ₹2,340.50 · about 8 h" |
| Primary | "Add agent" · busy "Adding…" |
| Done | The Agent row reads "Joining…", then "In the room"; focus → the Agent row; announce "Vikash joined Weekly demo." |
| Failure copy | "The agent couldn't join. You were not charged." (the last sentence only when confirmed) + Retry |

### 5.5 Form gates (`StartMeetingSheet`, `NewTaskSheet`)

**Container:** sheet gate. A form gate is a gate whose scope is a short form: the fields come first, then a `GateChecklist` headed `h3` "Before you start" / "Before it starts" (`collapse="none"`), then the consequence line, then the footer.

- **Focus** starts in the first field (`data-autofocus`, §4.5); Enter in a single-line field never submits; `⌘/Ctrl+Enter` confirms.
- **Fields never disable themselves because of a check**; the primary does, with the reason. A field that changes a check re-runs the preflight after 300 ms.
- **Dirty close** uses the inline discard state (O §2.5): "Discard this task? Your goal and limits will be lost."
- **Global blockers:** offline and role only. **Wallet ₹0 is not global here**, because not every outcome costs money: a room still opens on free minutes, and a research task needs no calls. The wallet is therefore an in-gate row whose kind depends on the choices: `blocking` when the chosen options must spend (the agent joins when the first guest arrives; the task may place calls; no free minutes left), `advisory` `severity="warning"` otherwise ("Wallet is ₹0. The agent can't join until you top up. The room still opens on free minutes.").
- **Primary:** "Create room" · "Start task" / "Schedule task"; busy "Creating room…" · "Starting…".
- **Consequence:** `rate` (Start a meeting: room time and agent time) or `capped` (New task).
- Configuration, fields and checks: MP §1.7 and §2.9.

### 5.6 Money gates (`TopUpSheet`, `PlanChangeSheet`, `AutopayGateSheet`)

**Container:** sheet gate. The consequence line is the **server quote** (`quote`, §3.1): the client never computes tax. The primary names the amount actually charged, tax included. **Global blockers:** offline · the quote is unavailable.

| | TopUpSheet (KB §2.7) | PlanChangeSheet (KB §2.10) | AutopayGateSheet (KB §2.8) |
|---|---|---|---|
| Opened by | "Top up…" anywhere and `?topup=1` on any route (mounted once in the AppShell) | "Switch to Starter…" | "Review and approve…" · "Renew mandate…" |
| Title | "Top up wallet" | "Switch to Starter" | "Set up autopay" · "Renew autopay" |
| Checks | Amount bounds are the field's own validation ("Enter an amount from ₹100 to ₹1,00,000."), not rows. Advisory row only when useful: "Autopay is off · **Set up autopay**" (runway under a day) | `wallet`: pass "Your wallet covers ₹499"; blocking "Wallet is ₹42.10. Top up at least ₹457 to switch." · Top up (closes this gate, opens the Top-up sheet, §4.4 rule 6) | `mandate`: advisory rows from the provider's rules ("Your bank tells you before each automatic debit.") |
| Consequence | Wallet credit · GST · **You pay** · New balance + runway | New plan · Price · Starts · **Charged** | Trigger · Amount · Monthly limit · Mandate valid until · Largest single debit |
| Primary | "Pay ₹590 via UPI" (Step 1; "Pay via UPI" while the amount is invalid) | "Pay ₹499 and switch" · downgrade: "Switch at the end of the period" | None in the app: approval is the UPI PIN in the user's UPI app |
| `⌘/Ctrl+Enter` | Activates Pay (G6). Nothing is charged until the UPI PIN | Activates the primary: the wallet is debited, which is why the chord (never a single key) is the only shortcut | Does nothing while waiting, because there is no in-app primary |

**Extra states** (after the primary): Preparing · Waiting (QR or UPI request, countdown) · Confirming · **Success** · Declined · Expired · No answer yet (KB §2.7). They replace the body; the header and a "‹ Change amount" back link stay. Unlike Confirming in §4.1, **Waiting may be closed**: the order continues on the server and the app shows Payment pending (O §10.2), never money it hasn't received (D P1). "You were not charged" only when the server confirms it.

### 5.7 Inline uses, and the ApprovalCard

| Use | Component | Configuration |
|---|---|---|
| Cockpit New call card (CK §3.3) | `GateChecklist collapse="passing"` from `GET /api/calls/readiness` | The card's primary follows §4.4: `aria-disabled` with the reason while any global blocker or blocking row exists; the gate re-checks on open |
| Rep console (CK §5.6) | `GateChecklist collapse="passing"` | Blocking rows disable "Go available" with the reason |
| Personal agents (MP §2.6) | `GateChecklist collapse="all-pass"` in a `section` with `h2` "Before your agent can work" | A blocked number does not disable New task; the form gate blocks only tasks that call or message |
| **ApprovalCard** (AS §10.3, MP §2.7) | A card, not a gate | See below |

**ApprovalCard** is the inline approval for Assistant and Personal-agent steps of **tiers 1 to 3** (O §3.1). It is not modal and not a gate, but it is built from the gate's parts so the two read as one family:

- the header grammar of §1.4 (verb + object + count; "Checked 12 min ago · **Recheck**");
- `GateChecklist collapse="none"` for its checks (`blocking`, `adjusted`, `advisory` only; passes are implied by the absence of rows);
- `GateCost` `impact` ("Affects 24 leads · Undo available for 24 h") or `range` for call steps;
- one primary that repeats the verb and count, `⌘/Ctrl+Enter` inside the card, the why-text rule and an idempotency key per decision (§4.3).

Container (in page flow): `--surface`, 1 px `--border-strong`, `--radius-8`, `--e1` (dark: border only), padding `--space-panel-pad`. **For tier-4 steps its primary is a launcher**: "Review and call…" opens the `CallGate` with the batch, "Review and publish…" opens the `PublishGate` with the draft, each passing the step's idempotency key (G14). Only the gate confirms; Cancel in the gate leaves the step waiting and returns focus to the launcher. Money decisions ("Approve with 2FA…") open "Confirm it's you" (ST §5) before the step runs; the Assistant never tops up or changes billing (AS §10.7).

---

## 6. Server contract

### 6.1 Types (`lib/gate.ts`)

```ts
export type GateCheckKind = 'pass' | 'blocking' | 'advisory' | 'adjusted' | 'checking' | 'unknown';

export interface GateCheck {
  id: string;                          // stable rule id: 'wallet', 'caller_id', 'calling_hours', 'dnd', 'flow_errors', 'agent_seat', …
  kind: GateCheckKind;
  severity?: 'info' | 'warning';       // advisory only (§2.1)
  global?: boolean;                    // a global blocker (§4.4)
  sentence: string;                    // server copy: one sentence, sentence case
  meta?: string;                       // proof or detail line
  action?: GateAction;
  ack?: { label: string; required: boolean; reasonOptions?: string[] };
  members?: { total: number; items: { id: string; label: string; includable: boolean }[] }; // adjusted groups
  subRows?: { id: string; sentence: string; action?: GateAction }[];                    // e.g. one per flow error
  step?: { current?: boolean; optional?: boolean; dependsOn?: string[]; failed?: boolean }; // SetupTrack only
}

export type GateAction =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'include' | 'retry' | 'recheck' | 'schedule' | 'top_up' | 'go_to_step' | 'ask_admin'; label: string; target?: string };

export type CostEstimate =
  | { kind: 'range'; n: number; minutesLow: number; minutesHigh: number; rupeesLow: number; rupeesHigh: number; ratePerSecond: number }
  | { kind: 'capped'; maxCalls: number; rupeesLow: number; rupeesHigh: number; capRupees: number; ratePerSecond: number }
  | { kind: 'rate'; ratePerSecond: number; perMinute: number; freeMinutesLeft?: number }
  | { kind: 'quote'; rows: { label: string; paise: number; emphasis?: boolean }[]; chargePaise: number }
  | { kind: 'impact'; sentence: string; meta?: string }
  | { kind: 'rate_only'; n?: number; ratePerSecond: number };      // interim, §3.4

export interface GatePreflight {
  checks: GateCheck[];
  scope?: { requested: number; final: number; hash: string };
  cost: CostEstimate;
  wallet?: { balancePaise: number; runwaySeconds?: number };
  gateToken: string;
  expiresAt: string;                   // ISO: checkedAt + 120 s
  checkedAt: string;
}
```

`lib/gate.ts` also exports the **kind map** (kind → Lucide glyph, tint token, glyph token, hidden word), the summary grammar (`summarise(checks, noun)`), and `sortChecks()` (§2.3 order). Pages never map kinds to colours themselves.

### 6.2 Endpoints per variant

Paths already named in a page spec are kept; the rest are proposals for the backend owner.

| Variant | Inline readiness (checks only) | Preflight (returns `gateToken`) | Confirm (`Idempotency-Key` header + `gate_token`) |
|---|---|---|---|
| CallGate single | `GET /api/calls/readiness?target=&flow=&kind=` (CK §1.3) | `POST /api/calls/preflight` `{ target, flow, voice, lang, callerId, kind }` | `POST /api/calls` `{ gate_token, when }` → `{ callId }` |
| CallGate batch | — | `POST /api/calls/preflight` `{ selection, settings }` (L §3.2) | `POST /api/calls/batches` `{ gate_token, when, include: ids[] }` → `{ batchId, scheduled, skipped }` |
| PublishGate | — | `POST /api/flows/{id}/publish/preflight` `{ draftRevision }` (server rules FD4, targets FD5) | `POST /api/flows/{id}/publish` `{ gate_token, note, ackedWarnings, skipTestReason? }` with `If-Match` → `{ version, targets }` |
| AddAgentGate | — | `POST /api/meetings/{roomId}/agent/preflight` (proposed) | `POST /api/meetings/{roomId}/agent` → `{ state }` |
| Form gates | `GET /api/meetings/readiness` · `GET /api/personal-agents/readiness` | the same routes with the draft form as the body (proposed `POST`) | `POST /api/meetings` → `{ roomId }` · `POST /api/personal-agents/tasks` → `{ taskId }` |
| Money gates | — | `POST /api/billing/quote` (KB BL3) | `POST /api/billing/orders` · `/plan-changes` · `/mandates` → `{ orderId, upiIntent, expiresAt }` |
| SetupTrack | `GET /api/setup` (D §8 item 8) | — (no confirm) | — |

**Errors → gate states:** `402` → the `wallet` blocking row (§4.4) · `403` → the `role` blocking row · `409 gate_checks_changed` → **Changed**, using the fresh preflight in the body · `409` version conflict (publish) → its blocking row · `422` → the rows update · `5xx` or timeout → **Failed** with Retry (same key).

### 6.3 Until the preflight exists (D §8 item 5: hidden, not simulated)

The gate shows only the checks the server can compute today (flow live, caller ID, wallet balance, role, connection), and the cost reads "Rate ₹0.04/s". Missing checks are **never shown as passing**. Because silence could read as "checked", the gate adds one `advisory` row: "Calling hours, DND and recent calls aren't checked here yet." It disappears when the preflight ships (CK B3, L B7).

---

## 7. React

```tsx
// components/gate/gate.tsx: the frame (§1); containers come from the overlay group
interface GateProps {
  container: 'popover' | 'sheet';                 // fixed by the variant, never a page choice
  title: string;                                   // §1.4
  consequence: string;                             // the header sentence
  kindTag?: 'test' | 'browser';                    // CallKindTag
  scope?: React.ReactNode;                         // readonly KeyValueList or the editable summary
  preflight: GatePreflightState;                   // from useGatePreflight()
  choice?: React.ReactNode;                        // RadioCard pair
  note?: React.ReactNode;                          // Publish only
  primary: { label: string; busyLabel: string;
             onConfirm(ctx: { gateToken: string; idempotencyKey: string }): Promise<GateResult> };
  anchor?: React.RefObject<HTMLElement>;           // popover container
  returnFocusTo?: () => HTMLElement | null;
  onClose(reason: 'cancel' | 'escape' | 'done' | 'fix'): void;
}

<GateChecklist checks={checks} context="gate" | "inline" | "page" collapse="none" | "passing" | "all-pass"
  heading="Readiness" noun="Phone calls" onAction={(check, action) => …} onAck={(id, value, reason) => …} />
<GateCheckRow check={check} onAction onAck onInclude />
<GateCost estimate={cost} wallet={wallet} />

<CallGate mode="single" kind="real" settings="readonly" choice="when-needed" entry="cockpit"
  target={{ leadId, e164 }} flow={{ id, revision: 'live', version: 7 }} voiceId="vaani" lang="auto" callerId={cid} />
<CallGate mode="batch" settings="editable" choice="always" entry="bulk" selection={{ ids } /* or { query, total } */} />
<PublishGate mode="publish" flowId={id} draftRevision={rev} fromVersion={7} nextVersion={8} />
<AddAgentGate roomId={room.id} voice={voice} mode={room.mode} />
<SetupTrack steps={steps} doneCount={2} total={5} />

// Launch any gate from anywhere (G14). One GateHost is mounted in the AppShell, so only one gate is ever open.
const gate = useGate();
const result = await gate.open('call', { mode: 'batch', selection, settings },
  { idempotencyKey: step.key, returnFocusTo: () => reviewButton.current });
// result: { status: 'confirmed', batchId, scheduled: 10, skipped: 2 } | { status: 'cancelled' } | { status: 'blocked', blockerId }
```

- `useGatePreflight(variant, payload)` → `{ state, checks, cost, wallet, gateToken, expiresAt, recheck() }`; it debounces scope changes (300 ms), shows `checking` after 200 ms, runs the 120 s expiry timer and subscribes to wallet pushes while open.
- `useGate()` owns the idempotency key per opening, the payload kept in session storage for the Top-up round trip (§4.4 rule 6), and `returnFocusTo`.
- Files: `components/gate/{gate,gate-header,gate-footer,gate-checklist,gate-check-row,gate-cost,call-gate,publish-gate,add-agent-gate,setup-track}.tsx`, `lib/gate.ts`, `hooks/use-gate.ts`. Form and money gates live with their pages (`components/meetings/`, `components/agents/`, `components/billing/`) and compose these parts.
- Primitives: Radix Popover (`modal`) and Radix Dialog through the overlay containers (O §1.9). No other library.
- **Build order** (D §8 puts Gate fifth): after Button, Checkbox, RadioCard (C), KeyValueList and Tag (N), and Popover, Sheet, StatusText, InlineError and StageProgress (O §20 steps 1–5); before the Cockpit card, Leads calling, the Flow Designer's Publish and Home. Build `GateCheckRow` → `GateChecklist` → `GateCost` → `Gate` → `CallGate` → `PublishGate` → `SetupTrack` → the rest.

---

## 8. Accessibility summary and acceptance checks

**Roles.** Container `role="dialog"` `aria-modal="true"`, `aria-labelledby` the title, `aria-describedby` the consequence sentence. Checks are lists with a hidden kind word per row; the summary is the only live region (polite). The primary is `aria-disabled` (never `disabled`) when blocked, `aria-describedby` the why-text, `aria-keyshortcuts` the chord. Bottom sheets add a visible title and keep the close button top right. Every target ≥ 24 px (44 on touch). Satisfies WCAG 3.3.4 (financial and data) for every billable and live action (A11Y §3).

Acceptance (CI, visual regression and manual):

- [ ] Network: no request that dials, bills, publishes, creates a room or adds an agent is sent except a gate's confirm carrying `gate_token` and `Idempotency-Key`; `request_without_gate` stays 0.
- [ ] Opening any gate focuses its title (form gates: the first field); pressing Enter immediately after `C` sends nothing.
- [ ] `⌘/Ctrl+Enter` confirms when enabled; when `aria-disabled` it announces the reason and sends nothing. Enter in a gate field never confirms (the Top-up amount only moves to the UPI step).
- [ ] A double activation and a Retry each produce exactly one call, batch, version, room or order.
- [ ] With the token expired and a check changed, confirm does not proceed and the Changed notice shows.
- [ ] Wallet ₹0: every billable entry point is `aria-disabled` with the reason and opens nothing; dropping the wallet to ₹0 from another tab while a gate is open adds the blocking row at the top without closing the gate.
- [ ] Every gate container renders `--surface-overlay`, 1 px `--border-overlay`, `--e3` and `--radius-12` in both themes.
- [ ] Each check kind renders its mark and hidden word; marks survive forced colours; axe reports 0 violations in checking, ready, blocked, changed and failed states, in both themes.
- [ ] 768–1023: a CallGate that doesn't fit becomes a bottom sheet. 390 px and 320 px: popover gates are bottom sheets, sheet gates are full screen, and the primary stays visible above the safe area with no horizontal scroll.
- [ ] No gate stacks on another modal; Top up from a gate closes it, and the success toast reopens it with the payload.
- [ ] The cost line never shows "≈" or a single figure; without medians it shows the rate.

---

## 9. Do / Don't

| Do | Don't |
|---|---|
| "Call 9 leads" · "Nothing dials until you start." · Start 9 calls (⌘/Ctrl+Enter) | A single key, a single click, a voice command or a switch press that dials (F-A11Y-004, F-UX-013) |
| A blocking row with its fix: "Outside calling hours. Opens 10 am IST." · Schedule | A disabled button with no reason, or a reason only in a tooltip on touch |
| "2 leads were called in the last 24 h · Skipped · Include" | Silently calling someone twice, or silently dropping them |
| "9 calls · about 1 to 2 min each · ₹21 to ₹44" | "≈ ₹11", or no cost at all |
| The entry point `aria-disabled` with "Wallet is ₹0. Top up to place calls." | Opening a gate only to say it can't be used |
| One gate container: `--e3`, `--radius-12`, a flat scrim | A glass or blurred backdrop, a coloured header, a second modal on top |
| Publish shows its checks, where it goes live and the diff | "FLOW VALIDATED" on an invalid flow (F-FLOW-004), autosave into Live (F-FLOW-001) |
| "Test call on this version today, 11:02 am" as a proof | A "Don't ask again" or an admin skip setting |

---

## 10. Traceability

| Finding | Severity | Resolved by |
|---|---|---|
| F-UX-013 / F-A11Y-004 `c` and bulk CALL dial with no pre-flight | high | §4.2, §4.5, §5.1: every call goes through the CallGate; `C` opens it; the chord confirms |
| F-FLOW-001 edits autosave into the live flow | critical | §5.2 PublishGate is the only door to Live (with FD §4) |
| F-FLOW-004 / F-UX-004 "FLOW VALIDATED" on invalid flows | high | §5.2 errors are `blocking` rows from the shared rule set; the summary is computed |
| F-FLOW-014 "active" means different things | medium | §5.2 Where it goes live lists real targets |
| F-UX-006 "You're live" too early; F-UX-001 setup dead ends | high · critical | §5.3 SetupTrack: "Live" only when every required step passes; every step names its fix |
| F-UX-022 the Assistant activates without approval | medium | §5.7 ApprovalCard launches the gates; no mode skips them |
| F-UX-002 / F-QA-004 wallet Top up opens Profile | high | §4.4 rule 6 and §5.6: Top up opens the money gate in place |
| F-QA-021 top-up amount clamped silently | medium | §5.6 bounds are field validation with a sentence |
| F-UX-014 pickers save the account default | medium | §5.1 settings apply to this call or batch; "Make default" is separate |
| F-A11Y-019 status by colour only | medium | §2.1 rule 1: a mark and a hidden word per row |
| F-A11Y-005 / F-A11Y-014 focus and announcements | high · medium | §4.5, §2.4, §4.7 |
| F-UX-038 / F-UX-039 Meetings and Personal agents hide prerequisites | medium | §5.4, §5.5, §5.7 readiness and form gates |

---

## 11. Open questions for the product owner

1. **DND and consent.** May a lead on the DND registry be included when consent is recorded, and who may include them (CK §8 Q7, L §15)?
2. **Browser tests.** Billed or free (CK §8 Q2)? If billed, they get the CallGate with the Browser test title and a `rate` line.
3. **Batch limits.** Is there a maximum batch size or pacing the gate should state, and must very large "all matching" batches be scheduled (L §15 Q5)?
4. **Token lifetime.** Is 120 s right for busy operators, or should the gate re-check silently in the background while open?
5. **Plan changes.** Charged from the wallet or by UPI (KB §5 Q5)? The PlanChangeSheet primary and shortcut depend on it.
