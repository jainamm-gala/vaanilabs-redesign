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
