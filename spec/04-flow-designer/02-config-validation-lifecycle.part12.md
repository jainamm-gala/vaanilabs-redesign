
---

## 25. Reconciliations with the direction and other specs

| # | Topic | Source says | This spec does | Why |
|---|---|---|---|---|
| R1 | Interim before revisions exist | D §8 (old): "The Draft chip stays hidden"; Publish is ACTIVATE behind the gate | **I1 device draft** (§4.9), now adopted everywhere: D §8, O §18 (`device` and `volatile` statuses), part 1 §3.3, §4.4 and §14, Shell §5.2 and §13.3 | Hiding the chip while every keystroke still reaches live calls would leave the critical finding (F-FLOW-001) in place until the backend ships. Holding edits locally is client-only and truthful about its limit; the base check (§4.9) covers the last-write-wins gap FD2 leaves |
| R2 | Book meeting output | D §6.5 and part 1 §4.3: Book meeting has 1 output; Transfer has the fallback row Didn't connect | Transfer follows part 1. **Change request:** give Book meeting the fallback row **Not booked** (§7.11) | The caller hears the difference; without a branch the flow can't say "No problem, I'll call you back" (F-FLOW-020 asks for failure paths). Part 1's own definition of a fallback, "the step could not get what it needed", fits |
| R3 | FAQ step | Audit has a FAQ step; D §6.5's Action list has none | FAQ becomes Knowledge lookup › "This step's Q&A" (§7.9) | One name per concept; FAQ answers were already served through knowledge search |
| R4 | "Test call placed on this draft" | D §6.5 advisory check | "Tested on this draft": any test kind that reached an Outcome counts (§5.2) | Text tests are free and cover logic; phone tests stay available and are named |
| R5 | Specimen's "Action · CRM update: Schedule callback" | Specimen only | Not in the v1 registry; callbacks use Question › Save answer to + End with outcome › Callback time (§7.14). "Update lead" is Q9 in §26 | The direction's type table doesn't list it; adding a write-to-CRM step needs its own safety review |
| R6 | Inspector footer "Done" | O §4.9 do/don't | Secondary `Done` in the inspector footer | The Publish button stays the one Neel element in the designer |
| R7 | Problems navigation keys | O §19 gives F8 to toasts; an earlier draft used Alt+↓ / Alt+↑, which also meant "move" | **Alt+.** / **Alt+,** for next / previous issue (06 §9.6) | Alt+Arrow means move everywhere (canvas nudge, Outline, answer and case lists); one meaning per key per scope, checked by the registry lint (06 §8.4) |
| R8 | Cockpit default | Today `active_flow_id` is per user; Leads spec says "Workspace default" | "Make workspace default…" on `/flows`; Cockpit picks stay session-only (Cockpit D6) | One default everyone can name (F-UX-005); per-user defaults are Q8 |
| R9 | Assistant | Assistant spec: side-effect steps wait for approval | Any Assistant plan that publishes opens this Publish gate; nothing publishes from a chip (F-UX-022) | One door to Live (L3) |
| R10 | Knowledge deletes | Knowledge spec §1.8: a deleted source raises a validation error | Rule E13 covers it | Shared rule set |
| R11 | Shell nav badge | Shell: Flows badge "1 draft" | Counts live flows whose Draft differs from Live | Same definition as the Drafts view on `/flows` |
| R12 | Step numbers | Part 1 D7 (now): `#n` is a stable per-flow sequence number, assigned as max + 1 at creation, never reused, unchanged by Tidy, edits or publishing, carried across versions; call order is said separately | Adopted: messages, the inspector phase line, Outline references, the Publish diff, History, Call reports' "Field · step n" columns and Analytics drop-off use `#n`; accessible names add "step 3 of 14 in call order" | A reference to "#9" stays true next week and in the next version |
| R13 | Question answers | Part 1 §4.3: 2–8 named answers | **Change request:** 1–8, so a capture question ("When should we call back?" → Gave a time · No reply) is valid | One named answer plus No reply is common when the answer is saved to a variable |
| R14 | Go to step target | Part 1 §3.4: opens the inspector on its Issues tab | Opens Configure with the field focused; the Issues tab lists the same issue | The fix happens in the field; one step fewer for keyboard users |
| R15 | The Outline | Part 1 §12.3 and this §16 both describe it | §16 is the accessibility contract; part 1 owns its placement and look; one `FlowOutline` component | Avoid two editors |
| R16 | Version history slot | Part 1 §3.1: left-panel content | Adopted (§6.1, §21.1); mock section 5 shows it on the left | The inspector stays free for a viewed version's steps |
| R17 | First use of a blank flow | This spec (old) §17: Trigger and Outcome unconnected, "1 error" | Part 1 §13.2: connected, the empty-state card, "No issues" | No false-state noise before the author has done anything (D P1) |
| R18 | Templates and the workspace | §12.2: templates have zero issues (in isolation) | Instantiation adapts to the workspace; Needs line; CI in an empty workspace (§15.3) | W08, E13, E12/W01 and W02 depend on the workspace, so isolation alone let the first Publish start blocked |
| R19 | Full-screen mode | O §18 and `05-responsive` (old): a compact or floating full-screen bar | No full-screen mode anywhere (part 1 §3.1, X7) | Focus mode already gives the canvas 61–80 %; nothing may hide save state or issues |

---

## 26. Open questions for the product owner

1. **Text test cost.** Is the text simulation billed, and does it run the same model as live calls? The panel states only what the server returns (FD7).
2. **Who can publish?** Everyone who can edit (today), or admins only with a "Request publish" review? (FD12)
3. **Voice verification unit.** Is "Speech window 8" seconds of speech or turns? The UI shows "s" provisionally; it must be confirmed before shipping (F-FLOW-032).
4. **Fixed lines across languages.** Does the agent speak a prompt verbatim, or restate it in the caller's language? This decides whether per-language versions (§10.3) are needed or merely optional.
5. **Private and live.** Confirm that an "Only me" flow can't be live anywhere, and what happens to a private flow when its owner leaves.
6. **Failure outputs.** Can the runtime report Book meeting "Not booked" as a distinct result (R2), and should Question allow a single named answer (R13)?
7. **Retention.** How long are versions kept (proposed: forever), draft snapshots (24 h, FD11) and test runs (30 days, FD6)?
8. **Defaults.** Is the Cockpit default per workspace (proposed) or per user (today)?
9. **Update lead action.** Is an "Update lead / CRM update" step needed in v1 (R5)?
10. **Several triggers of one kind.** May a flow have two Inbound call triggers with different hours or numbers, or should that be two flows?
11. **Outbound retries.** Do retries and "If nobody answers" belong to the Outbound batch trigger (proposed) or to the batch in Leads?
12. **Size budget.** What is the largest flow to support (proposed: 200 steps, rules in a Worker above 60)?

---

## 27. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-FLOW-001 autosave into live, silent Backspace | critical | §0.2 L1–L3, §4, §4.9, §5, §14.1 |
| F-A11Y-001 keyboard can't open or connect | critical | §7.1, §7.7, §16.3–16.5, §20, §23 |
| F-FLOW-002 writes on open | high | §4.3, §4.8, §23 |
| F-FLOW-003 untruthful save chip, lost edits | high | §4.3, §4.7 |
| F-FLOW-004 false "validated", ungated ACTIVATE | high | §5.2, §12 |
| F-FLOW-005 Undo broken | high | §14.4 |
| F-FLOW-006 mouse-only canvas | high | §16.5 |
| F-FLOW-010 issues not on steps, stale after switch | high | §12.1, §12.3–12.5 |
| F-FLOW-012 duplicate names, hidden versions, viewport carry-over | high | §0.5, §4.2, §4.8, §6, §15 |
| F-FLOW-013 no create journey, broken template | high | §12.2 (CI), §15.3 |
| F-QA-002 writes while "Up to date" | high | §4.3 |
| F-UX-004 green pill on invalid flows | high | §4.3 issues chip, §12 |
| F-UX-005 no "what is live", four descriptions of the active flow | high | §4.2, §4.3 live note, §15.2, §15.5 |
| F-RWD-003 Publish clipped at 768–877 | high | §21.2, §21.3 |
| F-FLOW-014 live flow invisible, Private looks like a label | medium | §4.3, §11 Visibility, §15.4 |
| F-FLOW-015 invalid values accepted | medium | §7.1, §7.3–7.14, §12.2 E09–E10 |
| F-FLOW-016 no test in the builder | medium | §13 |
| F-FLOW-017 missing tooling | medium | §4.5, §6, §8.4, §13 |
| F-FLOW-018 two primaries, unexplained Save | medium | §4.3, §19 |
| F-FLOW-019 unguarded reset, red slab | medium | §4.4, §7.1, §14.1 |
| F-FLOW-020 two positional outcomes | medium | §7.4–7.7, §9 |
| F-FLOW-025 ghost inspector after delete | medium | §7.1, §14.1 |
| F-FLOW-026 duplicate names on paste and palette | medium | §12.2 W05, §15.4 |
| F-FLOW-027 3–4 names per type | medium | §7.2 |
| F-FLOW-028 no variable picker | medium | §8 |
| F-FLOW-029 unknown types | medium | §6.5, §7.15, §12.2 E14 |
| F-FLOW-030 integration dependencies | medium | §7.1 IntegrationStatusRow, §7.10–7.12, §12.2 W02 |
| F-FLOW-031 AI draft replaces without asking | medium | §6.5 |
| F-FLOW-032 Flow settings gaps | medium | §10, §11 |
| F-FLOW-033 developer internals, 9–10 px mono | medium | §7.1, §19 |
| F-UX-024 writes on open (UX lens) | medium | §4.3 |
| F-A11Y-027 focus never enters editor or dialog | medium | §7.1, §16.5, §20 |
| F-A11Y-028 creation-order tabbing, id names | medium | §16.2, §16.5 |
| F-A11Y-011 toolbar menus impractical | medium | §4.4 (Radix menu), §20 |
| F-RWD-014 tablet and phone canvas | medium | §21.3, §21.4 |
| F-UX-022 Assistant can activate a flow | medium | §25 R9 |
| F-FLOW-034 full screen hides status | low | §4.3, §12.3 (no full-screen mode; Problems bar always visible), R19 |
| F-FLOW-037 template flash | low | §17 |
| F-VIS-037 duplicate flow names in pickers | low | §4.2, §15.5 |
