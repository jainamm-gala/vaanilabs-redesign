# 04 · Flow Designer · Part 2: configuration, validation and lifecycle

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** flow-lifecycle (`/flows`, `/flows/new`, `/flows/<flowId>`: the step inspector, variables, conditions, voice and language, validation, Draft and Live, Publish, history, conflicts, testing, deletion safety, the flow list, and the non-spatial Outline editor)
**Follows:** `spec/00-design-direction.md` (Sutradhar, cited *D §n*, especially §6.5), `spec/01-foundations.md` + `spec/tokens/tokens.css` (*F §n*), and the component specs `02-components-core.md` (*C §n*), `02-components-data-nav.md` (*N §n*), `02-components-overlay-feedback.md` (*O §n*). Page specs referenced: `03-pages/00-app-shell-ia` (*Shell*), `03-pages/01-agent-cockpit` (*Cockpit*, which defines `GateChecklist`, `GateCheckRow` and `CallGate` in its §7.2), `03-pages/03-leads`, `03-pages/05-knowledge-billing`. Components are named as those specs name them. Anything they do not cover is specified in §24 "New components needed".
**Companion:** Flow Designer part 1 (`spec/04-flow-designer/01-*.md`: canvas, step rendering, palette, edges, level of detail, frames, header layout). Where the two touch, §0.1 says who owns what.
**Evidence:** finding ids (F-FLOW-…, F-UX-…, F-A11Y-…, F-RWD-…, F-VIS-…, F-QA-…) refer to `audit/consolidated/`; raw ids (FLOW-CONFIG-…, FLOW-CANVAS-…) to `audit/raw/flow-config.md` and `audit/raw/flow-canvas.md`. Today's screens: `audit/screenshots/scout_flow-builder.png`, `va-flow-config/05_flow_switcher.png`, `14_validate_fresh.png`, `26_panel_*.png`, `40_settings_dialog.png`, `42_settings_voice_verification.png`, `45_more_actions_menu.png`.
**Privacy:** every flow, lead, teammate, number and workspace in this spec and its mock is fictional ("Site-visit qualifier", "Lead 1042", "Anika R.", "+91 80 •••• 2210"). No customer or lead data from the audit appears.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/04-flow-designer/02-config-validation-lifecycle.md`, assembled from `.part1.md` to `.part12.md` (edit the parts, then re-assemble) |
| Reference mock (inspector per step type, Problems list, Publish gate, history and compare, Test panel, conflict, Flows list, tablet review, phone Outline) | `spec/04-flow-designer/02-config-validation-lifecycle.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `02-config-validation-lifecycle-light.png` (1440, full page), `-dark.png` (1440, full page, dark), `-mobile.png` (three 390 px phone frames: Outline, text test, Publish gate) |

**Contents.** Part 1: §0 decisions and the shared layer, §1 purpose, §2 findings addressed. Part 2: §3 hierarchy, §4 the revision model, saving, Draft and Live in the header, compare, conflicts, offline, migration, the interim device draft. Part 3: §5 the Publish gate, §6 version history, restore, roll back and AI draft. Part 4: §7.1–7.7 the step inspector (shared anatomy, registry, Trigger and Logic steps, answer editor). Part 5: §7.8–7.15 Action and Outcome steps, unsupported steps; §8 variables and templating. Part 6: §9 condition builder, §10 voice and language, §11 Flow settings, §12.1 validation principles. Part 7: §12.2–12.6 rule catalogue, surfaces, Problems list, server parity; §13.1 the Test panel. Part 8: §13.2–13.6 testing modes and states, §14 destructive-action safety, §15 the Flows list and creating flows. Part 9: §16 the Outline and keyboard and screen-reader operability, §17 state matrix, §18 interactions. Part 10: §19 microcopy, §20 accessibility, §21 responsive. Part 11: §22 telemetry, §23 acceptance criteria, §24 new components. Part 12: §25 reconciliations, §26 open questions, §27 traceability.

---

## 0. Decisions and the shared layer

Today the Flow Builder autosaves every edit, and even the act of opening a flow, into the record that live calls read. There is no draft, no version, no truthful save chip, a green "FLOW VALIDATED" pill on flows with 9 errors, an ACTIVATE that ignores errors, a red "Delete Node" slab in every panel, a Backspace that silently deletes connected steps, and no way to hear a flow before a customer does (F-FLOW-001 to F-FLOW-005, F-FLOW-016, F-FLOW-019). The core authoring job is mouse-only (F-A11Y-001). This part turns the builder into a tool that is **safe to edit while calls are running**.

### 0.1 Ownership between part 1 and part 2

| Topic | Part 1 (canvas) owns | Part 2 (this file) owns |
|---|---|---|
| Header (48 px) | Layout, order, sizes, collapse rules | What each chip and button says in every state, what it opens, and when Publish is enabled |
| Steps on the canvas | Silhouettes, glyph tiles, answer rows, sockets, level of detail, selection and focus look | Error and warning marks' meaning, the "Not connected" answer row copy, the test-run trace and reached marks, compare-mode tags |
| Palette, frames, notes, Tidy, minimap, Find | All | Nothing (a step added from the palette opens this file's inspector) |
| Inspector | Its slot and size (320 to 480, docked or overlay) | Everything inside it: tabs, fields per step type, variables, conditions, voice and language, issues |
| Canvas keyboard and the Outline | The pointer model, Find, the feedback of the spatial keys, and the Outline's place in the left panel (part 1 §11, §12.3) | The accessibility contract both must meet (§16): `C` Connect to…, `A` add after, delete with Undo, label-based names, and the Outline as a complete non-spatial editor. **The canvas key map itself is `06-accessibility` §9.6**, the only one; neither part restates it |
| Problems bar (32 px), IssuesChip and ProblemsPanel | Slot, layout and states (part 1 §3.4); names in the part 1 §20.1 registry | The issue content, the Problems list rows and where Go to step lands |
| Test panel, Version history, Flow settings, Publish gate, conflict sheet, Flows list, `/flows/new` | Nothing | All |

### 0.2 Decisions

**L1. Two revisions per flow: one Draft, one Live.** The **Live** revision is an immutable, numbered version (v1, v2, …). Every call, batch, inbound number, Meeting and Personal agent reads only Live. The **Draft** is one shared working copy per flow that everyone with edit rights sees; the designer, the Test panel, browser tests and test calls to your own number may use it. A Draft never reaches a real person (Cockpit §1.1 rule 2).

**L2. Opening writes nothing. Autosave writes only to the Draft.** The dirty flag is set by user edits only; hydration, `fitView`, dimension measurement, selection, viewport and theme never write (F-FLOW-002, F-UX-024). Saves carry `If-Match` and fail truthfully (O §18.1).

**L3. Publish is the only way anything goes live, and it is a gate** (D §P3, O §3.1 tier 4). "Publish v8…" opens the Publish gate: checks (errors block, each warning needs a tick, testing is advisory with a recorded reason), the changes, where it goes live, a note. The server re-runs the same rules and returns 422 on a mismatch. ACTIVATE and Save are retired (F-FLOW-018).

**L4. Versions have numbers, not names.** "Site-visit qualifier (v2) · 9115a2" becomes "Site-visit qualifier" with the tag `Live v7` and, when edited, `Draft · 3 changes`. Flow names are unique per workspace. A legacy duplicate shows its short id `flow_7c21` on the second line of pickers until renamed (F-FLOW-012, F-UX-005, F-VIS-037).

**L5. Going back never rewrites history.** "Roll back to v7…" publishes v7's content as v9 through the same gate. "Restore as draft…" copies an old version into the Draft. There is no "Undo publish": calls already placed on v8 stay on v8 (D §1.4 rejected list).

**L6. Every issue lives in one rule set** shared by the inspector fields, the step marks, the issues chip, the Problems bar and panel, the Outline, the Publish gate and the server. Results recompute 300 ms after each change, keyed by flow id and draft revision, so nothing carries over between flows (F-FLOW-004, F-FLOW-010).

**L7. The inspector is the only editor, and it never lies about validity.** Fields validate per step-type schema (C §8.2). An invalid value stays in the field, is **not** committed to the graph, and the step is reported invalid until fixed (F-FLOW-015). No "ID" or "Position" boxes, no mono uppercase labels, no red slab (F-FLOW-033, F-FLOW-019).

**L8. Answers are named, and every answer has an address.** Question, Branch and Verify caller outputs are named answer rows with a mandatory fallback (**No reply** or **Else**). Each has a `Go to [step ▾]` select in the inspector, so a flow can be wired without dragging (D §6.5, F-FLOW-020, F-A11Y-001).

**L9. Variables are picked, previewed and checked.** `{{` opens a picker, tokens render as tokens, unknown variables are errors, variables used before they are captured are warnings, and every prompt shows how it will sound with sample values (F-FLOW-028).

**L10. Test inside the builder, on the Draft, for free where possible.** A docked Test panel runs a text simulation by default, or a browser voice test, or a test call to your own verified number through the Call gate. The canvas marks the current step and the path taken. Side effects are simulated and labelled (F-FLOW-016).

**L11. Undo beats dialogs; typed confirmation for blast radius.** Deleting steps and connections acts at once with an Undo toast. Discarding a draft or restoring over it confirms. Deleting or archiving a flow that answers a number or runs a batch needs the flow's name typed and a replacement chosen (O §3.1).

**L12. The Outline is a full editor at ≥ 1024, not a report.** Nested by branch, it can add, connect, reorder, rename, delete and open any step with the keyboard alone wherever editing is allowed (≥ 1024, `05-responsive` §10.6). The same component renders `readOnly` below 1024: it is the left column of tablet Review mode and the page on phones, where it navigates, opens read-only step sheets and shows issues but edits nothing (D §6.5, F-A11Y-001, F-A11Y-028).

**L13. The flow list says what is live where.** `/flows` shows status, where each flow is used (numbers, batches, workspace default, Meetings), open issues, visibility and last editor. Create, duplicate, rename, archive and delete live here with the right guard (F-FLOW-012, F-FLOW-013, F-FLOW-014).

### 0.3 Kept from today (00-summary §4)

| Keep | Where it lands |
|---|---|
| Validate's per-error **Jump** (zoom, select, open panel) | "Go to step" on every issue row, in the Problems bar, the ProblemsPanel, the inspector Issues tab and the Publish gate (§12) |
| "Preview AI script" | "What the agent is told" in each step's Advanced section and in Flow settings › Advanced, linked step by step (§7.1, §11) |
| Helpful inspector hints | Rewritten in operator language, never removed (§19) |
| The polite live region ("Connection added.") | Kept and made specific: "Connected Yes to Book site visit" (§16.4) |
| Protected Start and End | Deleting the last Trigger or Outcome is allowed and raises an error (E01, E03), so the flow can't be published broken (part 1 §10.3) |
| Flow Settings, AI draft and Preview dialogs' focus behaviour | The model for the Publish gate, conflict sheet and Flow settings (O §2) |
| Synonym-aware palette search | Also used by `Connect to…` and the Outline filter ("transfer" finds "Transfer to a person") |
| Viewport changes never save | Stays a rule of the save machine (§4.3) |

### 0.4 Backend dependencies (hidden, not simulated: D §8)

| Id | Capability | Needed for | Until it ships |
|---|---|---|---|
| FD1 | Draft and Live revisions, `published_version`, immutable versions with author, note, time | L1, §4, §5, §6 | **Interim I1 (device draft)**, §4.9, the only interim: edits stay in this browser until Publish; Publish re-checks the server copy against the draft's base, then writes the flow with today's PUT |
| FD2 | `If-Match` on draft PUT, 409 with the newer draft's author and time | Conflict sheet (§4.6) | The conflict sheet is hidden; I1's base check in the Publish gate (§4.9) stops a device draft from silently overwriting a copy published from another browser |
| FD3 | No-op PUT detection (content hash), `updated_at` untouched | "Last edited" truth (F-FLOW-002) | Client never sends a PUT on open (client-only fix, ships first) |
| FD4 | Server validation with the shared rule ids, 422 with `{ruleId, level, stepId, field, message}` | Publish gate parity (§12.6) | Gate row "Checked on this device" instead of "The server runs the same rules" |
| FD5 | Per-trigger resolution of use: inbound number → flow, batch → flow, workspace default, Meetings default | "Where it goes live", Used by column (§5.4, §15.2) | Only what is known today: "Your Cockpit default" from `active_flow_id` |
| FD6 | Test runs stored per draft hash (kind, reached steps, outcome, time) | "Tested on this draft" check (§5.3), coverage (§13.6) | Tests kept in session memory; the check reads "No test recorded on this device" |
| FD7 | Text simulation endpoint on a revision (model turn by turn, side effects stubbed) | Text test (§13) | Text mode hidden; Browser voice and Call my phone only |
| FD8 | Integration status API shared with Settings (Calendar, WhatsApp, CRM connectors, templates and approval state) | Integration rows and rules (§7, §12) | Integration rows hidden; the rule "a disconnected integration" is not evaluated |
| FD9 | Unique flow names (409 on clash), rename, archive, visibility endpoints | §15 | Names unchanged; duplicates show `flow_7c21`; Archive hidden |
| FD10 | Variable catalogue (lead fields, custom fields, CRM fields per connector) and a fallback syntax `{{name \| "text"}}` | §8 | Picker lists `lead_name`, `company_name` and captured variables only; fallback syntax hidden |
| FD11 | Draft snapshots kept 24 h (for "Replace with mine" and discard Undo) | §4.6, §14 | Those two actions hidden |
| FD12 | Roles: who can edit and who can publish | Permission states (§17) | Everyone who can open a flow can edit and publish (today's behaviour) |

### 0.5 Routes and URL state

| Route | Query params (restorable by reload, Back and a pasted link: P5, F-UX-031) |
|---|---|
| `/flows` | `view=all\|live\|drafts\|unpublished\|archived`, `q=`, `f.used=inbound\|batch\|none`, `sort=edited\|name`, `page=` |
| `/flows/new` | `template=site-visit\|…`, `from=describe` |
| `/flows/<flowId>` | `node=<stepId>` (selection, opens the inspector), `tab=configure\|test-data\|issues`, `v=<n>` (view a version read-only), `compare=live\|<n>`, `panel=outline\|variables\|history\|test\|problems`, `test=text\|voice\|phone` |

Never in the URL: test transcripts, typed caller replies, phone numbers (Cockpit §1.5 privacy rule). The viewport is saved per flow per user as a UI preference, never in the flow and never in the URL (F-FLOW-012).

---

## 1. Purpose and jobs to be done

**Purpose.** Let an operator change what the agent says and does on calls **without affecting live callers until they choose to**, prove the change works, and put it live on purpose, with a way back.

| Who | Job to be done | Primary action |
|---|---|---|
| Flow author (ops, sales lead) | "When a call script needs a change, I want to edit it without the agent saying half-finished lines to real customers." | Edit steps in the inspector; the Draft saves itself |
| Flow author | "Before customers hear it, I want to hear it myself and see which path it takes." | **Test** (text, browser voice or my phone) |
| Flow author or admin | "When it's ready, I want to know exactly what changes and where, then put it live." | **Publish v8…** → Publish gate |
| Admin | "When a change goes wrong, I want the previous version back in seconds." | **Roll back to v7…** |
| Keyboard or screen-reader user | "I want to build and change a flow without a mouse." | Outline editor, `C` Connect to…, `A` Add step |
| Team lead | "I want to see which flow answers which number and which ones have unpublished work." | `/flows` list |

**Primary job:** change a live call script safely. The designer answers, in order: *What is live right now? What have I changed? Is it valid? Did I test it? Where will it go live?*

---

## 2. Audit findings addressed

| Finding | Severity | Today | What changes (section) |
|---|---|---|---|
| F-FLOW-001 | critical | Edits autosave into the flow live calls use; Backspace deletes connected steps silently | Draft and Live (§4), Publish gate (§5), Undo toast on every delete (§14) |
| F-FLOW-002, F-UX-024, F-QA-002 | high | Opening a flow PUTs it; "last edited" records visits | No write on open; dirty flag from user edits only; no-op PUTs skipped (§4.3) |
| F-FLOW-003 | high | "Up to date" is permanent; failures silent; quick exit loses the last edit | SaveState machine, flush on leave, router guard (§4.3, §4.7) |
| F-FLOW-004, F-UX-004 | high | "FLOW VALIDATED" on invalid flows; wiring-only checks; ACTIVATE ungated | Computed issues chip, full rule set, gated Publish, server parity (§5, §12) |
| F-FLOW-005 | high | Undo doesn't revert additions; enabled with nothing to undo | One history stack; Undo bound to it; empty after load (§14.4) |
| F-A11Y-001, F-FLOW-006 | critical | Steps can't be opened or connected by keyboard | Enter opens the inspector; `C` Connect to…; Go to selects; Outline editor (§7, §16) |
| F-FLOW-010 | high | Issues only in a floating list; no marks; results survive a flow switch | Step marks, Problems bar and panel, Issues tab, keyed by flow (§12) |
| F-FLOW-012, F-UX-005, F-VIS-037 | high | Duplicate names, "(v2)" copies, hash suffixes, no live marker | Numbered versions, unique names, Flows list with status and Used by (§4.2, §15) |
| F-FLOW-013 | high | "New flow" hidden above "Reset to default"; broken template | `/flows/new` with name, language, voice and a starting point; templates validated in CI (§15.3) |
| F-FLOW-014 | medium | No live marker; "active" means different things; Private looks like a label | Live tag + live note; Used by per trigger; Visibility select (§4.4, §15.5) |
| F-FLOW-015 | medium | Blank name, "abc" number, 999 attempts accepted and saved | Per-type schemas; invalid values not committed (§7, §12) |
| F-FLOW-016 | medium | No test inside the builder | Test panel: text, browser voice, call my phone; path marks (§13) |
| F-FLOW-017 | medium | No history, variables panel, legend, simulation | Version history (§6), Variables panel (§8.4), Test (§13) |
| F-FLOW-018 | medium | Two filled primaries; unexplained Save | One primary, Publish; no Save (§4.4) |
| F-FLOW-019 | medium | Reset to default unguarded; red Delete Node slab | Discard draft (tier 2); Delete step in ⋯ with Undo; Done button (§7.1, §14) |
| F-FLOW-020 | medium | Two positional outcomes; tiny handles; uneditable edges | Named answers with examples, Else and No reply, Go to selects (§7.4 to §7.7) |
| F-FLOW-025 | medium | Ghost inspector after delete; no feedback | Inspector closes, focus moves, Undo toast, announcement (§14.1) |
| F-FLOW-027 | medium | 3–4 names per step type | One registry of names (§7.2) |
| F-FLOW-028 | medium | No variable picker; unknown variables accepted | PromptField, picker, token marks, rule errors (§8) |
| F-FLOW-029 | medium | Unknown types render as default boxes | Unsupported step with Convert to…, and an error rule (§7.15) |
| F-FLOW-030 | medium | Integration dependencies invisible | Integration status rows; toggles disabled with reasons; rules (§7) |
| F-FLOW-031 | medium | AI draft replaces the canvas without asking | AI draft produces a diff: Apply to draft or Discard (§6.5) |
| F-FLOW-032 | medium | Flow settings lacks core options; unexplained numbers | Flow settings sheet: Identity, Agent, Call behaviour, Security, Advanced (§11) |
| F-FLOW-033 | medium | IDs, positions, jargon, 9–10 px mono labels | 13 px sentence-case labels, plain helper copy, Advanced disclosure (§7.1, §19) |
| F-FLOW-034 | low | Full screen hides status and validation | Status stays in the compact header in every mode (part 1 layout; content §4.4) |
| F-FLOW-037 | low | Default template flashes as "validated" | Canvas skeleton; chips hidden until hydrated (§17) |
| F-A11Y-027, F-A11Y-028, F-A11Y-011 | medium | Focus never enters the editor; creation-order tabbing; id-based names; menus unreachable | Inspector focus contract, graph order, label-based names, Radix menus (§16, §20) |
| F-RWD-003, F-RWD-014 | high · medium | Publish clipped at 768–877; tiny canvas on tablets | Review mode with Publish always reachable; Outline on phones (§21) |
| F-UX-022 | medium | Assistant chip can "activate" a flow | Any Assistant publish goes through this Publish gate (§25) |
