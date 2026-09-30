<!-- Assembled from 02-config-validation-lifecycle.part1.md, 02-config-validation-lifecycle.part2.md, 02-config-validation-lifecycle.part3.md, 02-config-validation-lifecycle.part4.md, 02-config-validation-lifecycle.part5.md, 02-config-validation-lifecycle.part6.md, 02-config-validation-lifecycle.part7.md, 02-config-validation-lifecycle.part8.md, 02-config-validation-lifecycle.part9.md, 02-config-validation-lifecycle.part10.md, 02-config-validation-lifecycle.part11.md, 02-config-validation-lifecycle.part12.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

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

---

## 3. Information hierarchy

**Designer with a step selected (≥1024).** The eye should hit, in order:
1. **The step being edited**: the inspector title and its first field (the work).
2. **What is live versus what is changed**: `Live v7` and `Draft · 3 changes` in the header, and the live note ("Callers hear v7 until you publish").
3. **Whether it can go live**: the issues chip (`1 warning`) and the one Neel button, `Publish v8…`.
4. Then: the Problems bar's current issue, the save chip, Test.

**Publish gate.** 1: the title with the version and the blocking count if any ("Publish v8", "2 errors block publishing"). 2: the checks. 3: where it goes live. 4: the changes. 5: the button, whose label states the consequence ("Publish with 1 warning").

**Flows list.** 1: flow names. 2: status (`Live v7`, `Draft · 3 changes`, `Not published`). 3: where each is used. 4: issues and last edit.

The largest element is always the work (P7): the canvas and inspector in the designer, the table on `/flows`, the conversation in the Test panel.

---

## 4. The revision model and saving

### 4.1 What is versioned

| Belongs to | Fields | Changes take effect |
|---|---|---|
| **Flow metadata** (not versioned) | Name, description, category, visibility, archived, owner | At once, for everyone; logged in Version history as "Renamed by Anika R." |
| **Revision content** (Draft, then versions) | Steps and their fields, connections, answers, conditions, frames and notes, flow-level agent settings (voice, languages, agent instructions, silence timeout, max call length, calling hours on outbound triggers, voice verification, sensitive actions) | Draft: at once, for the designer and tests only. Live: only through Publish |
| **Bindings** (owned by other pages) | Inbound number → flow (Phone setup), batch → flow (Leads Call gate), workspace default flow, Meetings flow | By their own pages, always pointing at the flow (calls read its Live version at call time). An Inbound call trigger may *request* a number; the move happens at Publish (§7.3) |

```ts
type Flow = {
  id: string; shortId: string /* flow_7c21 */; name: string; description?: string;
  category: 'sales' | 'support' | 'collections' | 'scheduling' | 'other';
  visibility: 'workspace' | 'only-me'; ownerId: string; archived: boolean;
  live?: { version: number; publishedAt: string; publishedBy: string; usedBy: UsedBy[] };
  draft: { baseVersion: number | null; etag: string; editedAt: string; editedBy: string; changes: ChangeSummary };
};
type UsedBy = { kind: 'inbound' | 'batch' | 'workspace-default' | 'meetings' | 'personal-agent' | 'api';
  label: string /* "+91 80 •••• 2210" */; detail?: string /* "Mon to Sat, 10 am to 7 pm IST" */; href: string };
type ChangeSummary = { added: number; changed: number; removed: number; settings: number; total: number };
```

The Draft change count is the number of **steps and settings that differ from Live** (added + changed + removed + settings groups), not the number of edits: typing ten letters into one prompt is "1 change". A draft whose content equals Live is **clean** and mirrors Live automatically after every publish or roll back.

### 4.2 Names and version labels everywhere

| Surface | Today | v1 |
|---|---|---|
| Designer header | Switcher "Sample Realty (v2)"; chip "Up to date"; no live marker | FlowSwitcher `switch` "Sample Realty follow-up" · `Draft · 3 changes ▾` · `Saved 11:24 am` · `Live v7` |
| FlowSwitcher (Cockpit, Leads, Meetings, Phone setup) | "Sample Realty (v2) · 9115a2" / identical duplicates | Line 1 name + `Live v7`; line 2 "Edited 3 days ago · 14 steps · Inbound +91 80 •••• 2210"; legacy duplicates start line 2 with `flow_7c21` (C §5.4) |
| Call reports row, Leads "Flow" column | name only, or a hash | "Site-visit qualifier v7": the version the call actually ran |
| Baseline (Shell part 3) | "SYS: ONLINE" | `Live v7 · Site-visit qualifier` |
| `<title>` | one title for every route | `Site-visit qualifier · Flows · Vaani Labs`; `Couldn't save · Site-visit qualifier · Flows · Vaani Labs` while a save is failing (Shell) |
| AI-draft flows | "Generated: Sample developers ... (v2)" | An editable name suggested from the description, no "...", tagged `AI draft` until first publish |
| Draft of a flow never published | "Choose a flow to edit" | Header: `Not live yet` (VersionChip, O §18.2); lists and pickers: `Not published` (StatusTag, N §5.3); Publish reads `Publish v1…` |

### 4.3 Saving: the machine and what the header says

The chip is `SaveState` and the version chip is `VersionChip` (O §18). This section fixes the designer-specific rules.

**Timing.** Graph edits (add, connect, disconnect, delete, move end, paste, Tidy) save 300 ms after the change (`--timing-validate-debounce`). Typing coalesces per field and saves 800 ms after the last keystroke or on blur, whichever comes first. One request in flight; edits during a save queue behind it; retries 3 times with backoff, then `error`. A content hash (sorted keys) skips a PUT whose content equals the last saved snapshot (F-FLOW-002).

**Never marks dirty:** hydration, schema normalisation on load (runs in memory), `fitView`, `dimensions` and selection events, viewport, theme, panel resizing, opening the inspector, validation results, test runs, compare mode, viewing an old version.

**Header states** (the version area, save chip, live chip and Publish button always agree):

| Situation | Version area | Save chip | Live | Publish button (the one Neel button) |
|---|---|---|---|---|
| Loading | hidden | hidden | hidden | hidden (O §13.2 canvas skeleton) |
| Never published | `Not live yet` (neutral, O §18.2) | `Not saved yet` → `Saved 11:24 am` | none | `Publish v1…` |
| Live, draft clean | hidden | `Saved 11:24 am` | `Live v7` | `Publish…`, `aria-disabled`, reason "Nothing to publish. Your draft matches Live v7." |
| Live, draft changed | `Draft · 3 changes ▾` | `Saved 11:24 am` | `Live v7` | `Publish v8…` |
| Saving | unchanged | `Saving…` (only after 200 ms) | unchanged | enabled; opening the gate flushes first ("Saving your last edit…") |
| Save failed | unchanged | `Couldn't save · Retry` (danger, persistent) | unchanged | `aria-disabled`: "Your last 2 edits haven't saved. Retry, then publish." |
| Offline | unchanged | `Offline · 3 edits on this device` | unchanged | `aria-disabled`: "You're offline." |
| Conflict (409) | unchanged | `Changed elsewhere · Review` | unchanged | `aria-disabled`: "Review the other changes first." |
| Publishing | `Publishing v8…` (info tag) | unchanged | `Live v7` | busy, `aria-busy="true"` |
| Viewing an old version (`?v=5`) | `Viewing v5 · read-only` + "Back to draft" link | hidden | `Live v7` | secondary `Restore as draft…` and primary `Roll back to v5…` |
| View-only role | `View only` (outline tag) | hidden | `Live v7` | hidden; secondary `Duplicate to edit` |
| Interim I1 (§4.9) | `Draft on this device · 3 changes ▾` (VersionChip `device`) | `Saved on this device 11:24 am` (SaveState `device`) | `Saved flow` (neutral) | `Publish…` |
| Interim I1, browser storage unavailable (private window, blocked site data) | `Draft on this device · 3 changes ▾` | `Not saved · this tab only` (SaveState `volatile`, danger tone, persistent; tooltip "This browser won't keep your edits. Publish them, or they are lost when this tab closes.") | `Saved flow` | `Publish…` stays available (publishing is the only way to keep the edits); `beforeunload` is registered while any edit exists |

**Issues chip** (right zone, before Test): a button built on StatusTag `validation` (N §5.3) at `lg` size: `No issues` (success, `check`) · `1 warning` (warning) · `2 errors · 1 warning` (danger tone, the worst level leads) · `Checking…` (neutral, only before the first result after load). It opens the ProblemsPanel (§12.4). Its component name is **IssuesChip** (part 1 §20.1 registry). Accessible name: "2 errors and 1 warning. Open problems".

**Live note** (the right end of the phase ruler row; part 1 places it):

| State | Copy |
|---|---|
| Live, draft clean | Hidden: the `Live v7` chip says enough |
| Live, draft changed | "**Live v7** answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish. · Compare with live" |
| Live on several targets | "**Live v7** answers 2 numbers and runs 1 batch since 12 Sep. Callers hear v7 until you publish. · Compare with live" |
| Live, used by nothing | "**Live v7** isn't used by a number or batch yet. · Where to use it" (link opens a popover listing Phone setup, Leads and "Make workspace default…") |
| Not published | "Not live. Nothing calls this flow until you publish." |
| Interim I1 | "Edits stay on this device until you publish. Callers hear the saved flow." |

The phone number is `PhoneText` (masked, tabular figures; data-nav §5.8). The note is plain text with one link; it is not a live region (it changes only after publish, which the toast announces).

### 4.4 The version menu (from the Draft chip)

`Draft · 3 changes ▾` is the interactive Tag (N §5.3) with `aria-haspopup="menu"`. Menu items (Radix DropdownMenu, O §7):

| Item | Does | Guard |
|---|---|---|
| Compare with Live v7 | Enters compare mode (§4.5) | none |
| Version history | Opens the History panel (§6) | none |
| What changed (3) | A submenu listing the changes; each item selects its step | none |
| separator | | |
| Discard draft changes… | Resets the Draft to Live v7 | Tier 2 ConfirmDialog: "Discard draft changes? Your draft goes back to Live v7. The 3 changes since then are removed, including 1 by Anika R." · Cancel · **Discard changes** (danger outline). Then toast "Draft reset to Live v7 · Undo" (Undo needs FD11) |

Never here: "Reset to default" (retired), Delete flow (Flows list and ⋯ only).

### 4.5 Compare with live

Compare mode lets the author review the Draft against Live (or against any version, `?compare=5`) on the canvas itself.

```
┌ Flows / Site-visit qualifier  [Draft · 3 changes ▾] ✓ Saved 11:24 am  ● Live v7 ─────── ⚠ 1 warning [Test] [Publish v8…] ⋯ ┐
│ Comparing draft with Live v7 · 1 added · 2 changed · 1 removed        ‹ Previous change   Next change ›   Exit compare (Esc) │ 40
├──────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────┤
│   ╭──────────╮   ┌─────────────────────┐ Changed   ┌──────────────┐ Added                │ Ask about a site visit       │
│   │ Inbound  │──▶│ Ask about a site     │──────────▶│ Book site    │                      │ Changed in draft             │
│   ╰──────────╯   │ visit               │           │ visit        │                      │ Agent asks                   │
│                  │ Yes · Later · No    │           └──────────────┘                      │  Before (v7)                 │
│                  └─────────────────────┘   ┌ ─ ─ ─ ─ ─ ─ ┐ ← no: removed steps are ghosts │  …would you like to visit?   │
│                                            │ Send brochure│   at 40%, solid edge, tag    │  After (draft)               │
│                                            └──────────────┘   "Removed"                  │  …visit the site this week?  │
└──────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────┘
```

| Element | Treatment |
|---|---|
| Compare bar (replaces the Problems bar's row, 40 px) | `data-13`: "Comparing draft with Live v7 · 1 added · 2 changed · 1 removed" · Previous / Next change (ghost `sm`) · "Exit compare" (ghost `sm`, `Esc`) |
| Added step | `--diff-added-bg` header fill (success-soft) + Tag `success` "Added" above the step. Never `accent-soft`: while comparing, a selected step still looks selected and an added step never does (foundations §3.9) |
| Changed step | `--diff-changed-bg` header fill (surface-3) + a 2 px `--diff-changed-bar` (ink) inline-start bar + Tag `neutral` "Changed"; never `accent-mark`, which means selection; the inspector shows **Before (v7)** and **After (draft)** per changed field, with deleted words struck through on `danger-soft` and inserted words underlined on `success-soft` (text decoration is the non-colour cue) |
| Removed step | Drawn as a ghost placed where it was in Live: `--surface-2` fill, a **solid** 1 px `--border-strong` border, text at full contrast (only its glyph tile and sockets at `--opacity-unreachable`; opacity never touches text, F §10) and Tag "Removed"; never dashed (dashes mean fallback only, D §5 Lines) |
| Changed connection | Edge drawn in `--edge-active`; its label pill gets "Changed" |
| Settings changes | Listed in the compare bar's overflow "Settings: voice changed" linking to Flow settings with the same Before/After view |

Compare mode is read-only (editing a field exits compare and selects the step). Keyboard: `]` / `[` next and previous change (single keys in the 06 §8.2 registry; the shell's `[` sidebar key is suppressed while the designer is open, Shell §3.8), `Esc` exits; each change announced "Change 2 of 4: Ask about a site visit, changed". Available at every width (it is how tablets review, §21).

### 4.6 Conflicts (409)

A save whose `If-Match` no longer matches means someone else saved the Draft (another tab or a teammate). The chip turns `Changed elsewhere · Review` (assertive once) and the **conflict sheet** opens (Sheet `gate`, 640, modal; O §4.1):

```
┌ This flow changed while you were editing ───────────────────────── ✕ ┐
│ Anika R. saved the draft at 11:31 am. Your last 2 edits haven't      │
│ been saved yet.                                                      │
│ Their changes (2)                     Your unsaved edits (2)         │
│  Changed · Ask about budget            Changed · Polite close        │
│  Added · Send brochure                 Changed · Flow settings: voice │
│ ──────────────────────────────────────────────────────────────────── │
│ ( ) Use their version. Your 2 edits are discarded.                   │
│ ( ) Keep both: save my version as a new flow "Site-visit (my copy)". │
│ ( ) Replace with mine. Anika R.'s 2 changes are removed.             │
│                                         [Cancel]   [Continue]        │
└──────────────────────────────────────────────────────────────────────┘
```

- RadioCard options (C §6.2); no default selected; Continue is enabled once a choice is made. "Replace with mine" shows its consequence inline and needs FD11 (the replaced draft is kept 24 h, restorable from History as "Draft snapshot 11:31 am"); it is hidden without FD11.
- Cancel keeps the sheet's state available from the chip; editing stays paused (the canvas is `inert` behind a neutral Notice "Editing is paused until you choose which changes to keep").
- Same tab, second window: the other window shows a neutral Notice "This flow is open in another tab. Edits there may conflict." (BroadcastChannel), no lock.
- Presence ("Anika R. is editing") is v1.1 (D §8 decision: single editor with conflict handling).

### 4.7 Leaving, offline and recovery

| Moment | Behaviour |
|---|---|
| In-app navigation, flow switch, `visibilitychange` → hidden, `pagehide` | Flush pending saves with `fetch(…, { keepalive: true })` (O §18.1). Switching flows through the FlowSwitcher waits for the flush (≤ 1 s) before routing |
| Leaving while `error`, `offline` or `conflict` | Router guard ConfirmDialog: "Leave with 2 unsaved edits? They stay on this device and come back when you reopen this flow." · Keep editing · Leave. `beforeunload` is registered only in these states and while `dirty`/`saving` |
| Offline | ConnectionBar (O §10.3) + chip `Offline · 3 edits on this device`. Edits queue in IndexedDB keyed by flow id and base etag. Publish, Text test, Call my phone and integration checks are `aria-disabled` "You're offline". Validation keeps running locally |
| Reconnect | Queue flushes with `If-Match`; success toast "Back online. 3 edits saved."; a 409 opens the conflict sheet |
| Reopen after a crash or closed tab | If the local queue holds edits newer than the server draft, a section Notice (info) in the inspector slot: "2 edits from Today 11:42 am weren't saved. **Restore them** · Discard". Never applied silently |

### 4.8 Migrating today's flows

1. **No write on open ships first** (client only; FD3 follows on the server).
2. When FD1 ships, each existing flow gets **v1 = its current content**, published (so nothing that calls it today breaks), with the note "Migrated · published before checks existed". Its Draft starts clean. The validator runs on v1; if it has errors, the flow shows them and its next Publish is blocked until fixed. Nothing is re-laid out (D §6.5 Migration).
3. Legacy lineage (`version_no`, `parent_flow_id`) is shown read-only in History as "Copied from 'Appointment scheduling' on 20 Sep" when the parent exists, and hidden when inconsistent (F-FLOW-012).
4. **Names:** a one-time Notice on `/flows` when duplicates exist: "3 pairs of flows share a name. Rename them so everyone picks the right one. **Review names**" opens a list of pairs with Rename… per row. Names ending in "(v2)" get a suggested rename without the suffix. Nothing is renamed automatically.
5. Old step names map one to one to the registry (§7.2); FAQ steps become Knowledge lookup steps with "This step's Q&A" as the source (§7.9).

### 4.9 Interim I1: a device draft before revisions exist

Until FD1 ships, the builder still must not write into what calls use on every keystroke. The client holds edits in IndexedDB and writes the flow only on Publish. **This is the only interim** in the product: the direction (§8), overlay §18, part 1 (§3.3, §4.4, §14) and the shell (§5.2, §13.3) describe it the same way.

| Element | Interim behaviour |
|---|---|
| Starting a device draft | On the first edit, the client stores the edits keyed by flow id **plus a base**: the server copy's `updated_at` and a content hash (sorted keys, the same hash as FD3) of the flow it was opened from |
| Editing | Autosaves to this browser. Chip `Saved on this device 11:24 am` (SaveState `device`). Version chip `Draft on this device · 3 changes ▾` (VersionChip `device`, neutral). Live chip `Saved flow` (no version is claimed). Zero network writes until Publish |
| Storage unavailable | If IndexedDB throws or is blocked (private window, cleared or blocked site data), edits live only in memory: the chip reads **`Not saved · this tab only`** (SaveState `volatile`, danger tone, persistent), `beforeunload` is registered while any edit exists, and Publish stays available. "Saved on this device" is never shown when it isn't true (P1) |
| Publish gate | Opening it **re-fetches the server copy**. If its `updated_at` or hash differs from the draft's base, a blocking check row leads the gate: "This flow was published from another browser at 11:31 am. Your draft is based on an older copy. **Review changes**", with two choices: **Re-apply my changes on top** (a three-way merge per step between the base, the new server copy and the draft; steps changed on both sides are listed as conflicts and each needs a choice, mine or theirs, before Publish enables) or **Discard my draft** (tier 2 confirm). The Changes list is always computed against the **fresh** server copy, never the stale base, so the other author's work can't appear as rows the author didn't make. Otherwise: checks (client rules, "Checked on this device"), the change list from the local diff, "Where it goes live" limited to what is known ("Your Cockpit default" when `active_flow_id` matches), note hidden. Publish = today's PUT. Button `Publish…` |
| After Publish | The device draft is cleared and its base becomes the just-written copy; toast "Published. Callers hear this version from the next call." |
| Set as default | Today's ACTIVATE becomes the Flows list item "Make my Cockpit default" (it writes `active_flow_id`; its menu text says "for you", not "for all your calls", F-FLOW-014). It never publishes |
| `/flows` | A flow with a device draft in this browser shows a neutral Tag **"Unpublished edits on this device"** in its Status cell (read from IndexedDB; §15.2), so an author sees which flows hold local work |
| History, Roll back, Compare with a version | Hidden. Compare with live compares with the freshly fetched server copy |
| Other devices | A neutral Notice when a device draft exists: "You have unpublished edits on this device only. Teammates and other browsers see the published flow." A teammate told "I fixed the flow" sees nothing until it is published; the Notice and the `/flows` tag say so |

**Acceptance (interim):** browser A opens the flow and edits for a day without publishing; browser B edits and publishes; when A opens the Publish gate it shows the blocking "published from another browser" row, the Changes list contains only A's edits, and A's Publish can't run until A re-applies (conflicts resolved) or discards. B's published content is never overwritten silently.

---

## 5. The Publish gate

**Purpose.** The one door to Live. It shows whether the Draft may go live, what changes, where it goes live and who is affected, then publishes it as the next version. It is `PublishGate` (O §3.1 tier 4), specified in `spec/02-components-gate.md` §5.2: the sheet gate container (640, modal, `--e3`), `GateChecklist` and `GateCheckRow`, the check kinds, states, keys, gate token and idempotency key live there. This section configures it: which checks, where it goes live, the changes, the note and the copy.

**Opened by:** `Publish v8…` in the header; the palette action "Publish v8…"; "Roll back to v5…" (§6.4, same gate with a different title); the Assistant's approval step for any plan that publishes (F-UX-022). No single key opens it. Opening flushes pending saves first and requests server validation (FD4).

### 5.1 Layout (≥1024)

```
┌ Publish v8 ─────────────────────────────────────────────────────────── ✕ ┐ 56
│ Site-visit qualifier · draft from v7 · 3 changes by you and Anika R.     │
├──────────────────────────────────────────────────────────────────────────┤
│ Checks                                 Ready · 1 warning to confirm      │
│  ✓  No errors                                                            │
│     14 steps checked just now. The server runs the same rules.           │
│  ⚠  Book site visit: WhatsApp template "visit_confirm" is pending        │
│     approval. Bookings still work; the confirmation waits.  Go to step  │
│     [✓] Publish with this warning                                        │
│  ✓  Tested on this draft                                                 │
│     Text test · Today 11:02 am · reached "Visit booked"                  │
│                                                                          │
│ Where it goes live                                                       │
│  ☎  Inbound +91 80 •••• 2210 · Mon to Sat, 10 am to 7 pm IST             │
│  ☰  Batch "Weekend follow-ups" · 46 leads queued · the next call uses v8 │
│  ⌂  Workspace default flow (Cockpit, Leads)                              │
│     Calls in progress finish on v7. New calls use v8.                    │
│                                                                          │
│ Changes (3)                                                              │
│  Changed · Ask about a site visit · prompt edited, answer "Later" added  │
│           by you · Show                                                  │
│  Added   · Book site visit · by Anika R. · Show                          │
│  Changed · Flow settings · voice Vaani → Vikash · by you · Show          │
│                                                                          │
│ Note (optional)                                                          │
│  [What changed and why…                                              ]   │
├──────────────────────────────────────────────────────────────────────────┤
│ Callers hear v8 from the next call.        [Cancel] [Publish with 1 warning] │
└──────────────────────────────────────────────────────────────────────────┘
```

Order is Checks → Where it goes live → Changes → Note: the decision first, then its blast radius, then the detail (§3). Section headings are `title-14` `h3`; the Checks heading carries the summary `StatusText` with `role="status"`.

### 5.2 Check rows

Each row is a `GateCheckRow` (G §2.2), and every row renders inside the gate (`collapse="none"`, the last look before going live). Kinds per G §5.2: errors are `blocking` with sub-rows, warnings are `advisory` `severity="warning"` with a required ack, the test check is `advisory` with an ack and reasons.

| Check | Pass | Blocking (disables Publish, its sentence becomes the reason) | Advisory (never blocks) |
|---|---|---|---|
| Errors | "No errors" · "14 steps checked just now. The server runs the same rules." (interim: "Checked on this device.") | "2 errors" then one sub-row per error: "#5 Ask about budget: 'No reply' isn't connected. · Go to step" | n/a |
| Each warning | n/a | n/a | The warning sentence + Go to step + a Checkbox "Publish with this warning". Unticked warnings keep Publish disabled with "Confirm 1 warning to publish." (D §6.5) |
| Tested on this draft | "Tested on this draft" · "Text test · Today 11:02 am · reached 'Visit booked'" (any kind: text, browser voice, test call) | n/a | "Not tested since your last change." · **Test now** (closes the gate, opens the Test panel) · Checkbox "Publish without testing" which reveals a Select "Reason": Wording change only · Urgent fix · Tested another way · Other (Other adds a one-line field). The reason is stored on the version (D §6.5) |
| Draft saved | (hidden when saved) | "Your last 2 edits haven't saved. Retry" | n/a |
| Draft unchanged while open | (hidden) | "The draft changed while this was open. Anika R. saved at 11:31 am. **Review changes**" (refreshes Changes) | n/a |
| Base unchanged (interim I1 only) | (hidden) | "This flow was published from another browser at 11:31 am. Your draft is based on an older copy. **Review changes**" with two choices: **Re-apply my changes on top** (a three-way merge per step; conflicting steps are listed and must be resolved) or **Discard my draft** (§4.9) | n/a |
| Inbound number ready | "Inbound +91 80 •••• 2210 verified" (folded into Where it goes live) | "+91 80 •••• 2210 isn't verified yet. Verify it in Phone setup before it can answer calls." | n/a |
| Moves a number | n/a | n/a | "+91 80 •••• 2210 moves from 'EMI reminder' (Live v3) to this flow." |
| Wallet | (hidden when fine) | n/a | "Wallet is ₹0. Calls on v8 won't connect until you top up. · Top up" (publishing costs nothing, so it never blocks) |
| Calling hours | (hidden) | n/a | "Outside calling hours. Batch calls on v8 start at 10 am IST." |
| Voice and language | (hidden) | "Voice Vikash doesn't speak Tamil, one of this flow's languages. Change the voice in Flow settings." | n/a |
| Permission (FD12) | (hidden) | "Only admins can publish this flow. Ask Anika R. or Rohit S." | n/a |
| Couldn't check | n/a | `unknown` row: "Couldn't run the server check. **Retry**" (treated as blocking, G §2.1) | n/a |

Summary line (`StatusText` md): "Ready to publish" (success) · "Ready · 1 warning to confirm" (warning) · "2 errors block publishing" (danger, the blocked tone of G §2.3) · "Checking…" (progress).

### 5.3 Where it goes live

A list (not a table), one row per `UsedBy` (FD5), each with a 16 px Lucide icon in `text-2`: `phone-incoming` inbound (number `PhoneText` + hours), `list-checks` batch (name + queued count + "the next call uses v8"), `house` workspace default ("Cockpit, Leads and new batches start with it"), `video` Meetings, `list-checks` Personal agents, `webhook` API trigger ("Calls started through the API"). After the list, one `meta-12` sentence: "Calls in progress finish on v7. New calls use v8."

| Case | Copy |
|---|---|
| Nothing uses it yet | "Nothing uses this flow yet. After publishing, choose it in Phone setup, a Leads batch or **Make workspace default**." |
| First publish (v1) | Same list; the footer sentence becomes "Nothing called this flow before." |
| Interim (FD5 missing) | Only "Your Cockpit default" when `active_flow_id` matches; otherwise "Where this flow is used isn't known yet." (never guessed) |

### 5.4 Changes

`DiffList` (§24): rows grouped Added · Changed · Removed · Settings, each `data-13`: kind word (`fw-medium`) · step label (`translate="no"`) · a summary in `text-2` ("prompt edited, answer 'Later' added") · author ("by you", "by Anika R.") · **Show** (closes the gate, enters compare mode at that step). More than 8 rows collapse behind "Show all 23 changes". A first publish shows "First version · 12 steps" instead of a diff. Reordering and position-only moves are summarised as one row ("Layout tidied"), never one per step.

### 5.5 Note, footer and keyboard

- **Note** (optional): Textarea, 1 row growing to 4, soft limit 280 ("What changed and why…"). Stored on the version and shown in History.
- **Footer:** why-text on the left in `meta-12` `text-2` (the consequence or the blocking reason), then **Cancel** (ghost) and the primary. Labels: `Publish v8` · `Publish with 1 warning` · `Publish without testing` (when the test check was skipped) · `Roll back to v7` (§6.4) · `Publishing…` (Spinner, gate not dismissible). Disabled uses `aria-disabled` with the reason in the why-text and in `aria-describedby`.
- **Keyboard** (G §4.5): focus lands on the title (read-mostly sheet, O §1.3); Tab reaches warnings' checkboxes in order; `⌘/Ctrl+Enter` publishes when enabled (as in the Call gate); `Esc` closes (the note is kept for the session). "Go to step" and "Show" close the gate and move focus to the step or change.

### 5.6 States and copy

| State | Treatment |
|---|---|
| Checking | Rows show `checking` marks; summary "Checking…"; the primary keeps its label, `aria-disabled`, with the why-text "Checking the draft…" (G §4.1) |
| Ready | As §5.1 |
| Blocked by errors | Summary "2 errors block publishing"; error rows first; primary disabled, why-text "Fix 2 errors to publish." |
| Warnings unconfirmed | Primary disabled, "Confirm 1 warning to publish." Ticking relabels the button "Publish with 1 warning" |
| Publishing | Primary "Publishing…", Cancel disabled, Esc ignored; header version area shows `Publishing v8…` |
| Network failure | Danger InlineError at the top (`role="alert"`): "Couldn't publish. Nothing changed: callers still hear v7. **Retry**" · Details. The gate stays open |
| Server found more issues (422) | Rows update from the server list; summary "The server found 1 more error"; focus moves to the summary |
| Live changed (409 on publish) | Blocking row: "Anika R. published v8 at 11:40 am while this was open. This draft now publishes as v9. **Review changes**" |
| Success | Gate closes; focus returns to the header's version area; toast (below) |

### 5.7 After publishing

- **Toast** (O §9.2 kind `publish`): "v8 is live on 1 number and 1 batch · Roll back to v7…". For a first publish: "v1 is live. Choose where to use it · Where to use it".
- **Header:** `Live v8`; the Draft chip disappears (the draft is clean and mirrors v8); the live note hides; Publish becomes `aria-disabled` "Nothing to publish".
- **Announce** (polite): "Version 8 is live."
- **Elsewhere:** the Baseline's live segment updates; the Flows nav badge "1 draft" clears; FlowSwitcher options show `Live v8`; Call reports record the version on each call.
- **Roll back** stays reachable after the toast in the version menu and History for 7 days as the first item ("Roll back to v7…"), then as a normal History action.

### 5.8 Responsive

The sheet gate's breakpoints are G §1.3; the Flow Designer adds only the phone "Show" behaviour below.

| Width | Gate |
|---|---|
| ≥1024 | Right sheet, 640, modal with scrim |
| 768–1023 | Modal, full height, `min(640px, 100%)` wide; opened from Review mode (§21) |
| <768 | Full screen, header 56 with "Back", sticky footer above the safe area with 44 px buttons; sections unchanged; "Show" opens the step's read-only sheet instead of compare mode |

---

## 6. Version history, restore and roll back

### 6.1 The History panel

Opened from the tool rail (Version history), the version menu, or `?panel=history`. It opens in the **left panel** (`--size-left-panel` 280, part 1 §3.1), so the inspector stays free for the selected step of a version being viewed; below 1024 it is a full-height sheet.

```
┌ Version history ──────────────── ✕ ┐
│ Draft · 3 changes since v7          │  current, selected
│ Edited by you, Today 11:24 am       │
│─────────────────────────────────────│
│ ● v7  Live                          │
│   12 Sep, 4:10 pm · Anika R.        │
│   "Added Later answer to the visit  │
│    question"                        │
│   Tested: test call · 412 calls     │
│ ○ v6  12 Aug to 12 Sep · 1,204 calls│
│   Rohit S. · "Hindi greeting"       │
│ ○ v5  Rolled back from v6 … · ⋯     │
│ ○ v1  Migrated · published before   │
│       checks existed                │
│ [Show older versions]               │
└─────────────────────────────────────┘
```

Built on `Timeline` (N §10) as `VersionHistory` (§24). Each version row: version (`title-14`, tabular) · state Tag (`Live` success with static LiveDot; nothing for past versions) · date range it was live · author (Person avatar 20) · note in `text-2` (quoted, two lines, then "More") · meta: how it was tested ("Tested: text test" / "Published without testing: urgent fix") and calls handled ("412 calls", from Call reports, linking to `/call-reports?f.flow=<id>&f.version=7`; hidden until counted) · `⋯`. Metadata events (renamed, visibility changed, archived) appear as compact system rows between versions.

| `⋯` action | Available on | Does |
|---|---|---|
| View | every version | `?v=5`: read-only canvas (§6.2) |
| Compare with draft | every version | Compare mode against the Draft (§4.5) |
| Compare with previous | v2 and later | Compare mode v4 → v5 |
| Restore as draft… | every non-draft version | §6.3 |
| Roll back to this version… | past versions (not the Live one) | §6.4 |
| Copy link | every version | `/flows/<id>?v=5` |

Keyboard: the list is a `listbox` of versions (↑/↓, Enter views, Shift+F10 opens `⋯`); the panel title receives focus on open; Esc closes and returns focus to the trigger.

### 6.2 Viewing an old version

`?v=5` shows v5 on the canvas, read-only: steps are selectable, the inspector shows fields disabled (not greyed text: `read-only` field state, C §3.2) and an info Notice at the top of the canvas: "Viewing v5 (live 2 Aug to 12 Aug). Read-only. **Back to draft**". Header per §4.3 (Restore as draft… secondary, Roll back to v5… primary). Test works on it ("Test v5" in the Test panel's revision select), which is how an author checks an old version before rolling back.

### 6.3 Restore as draft

Copies v5's content into the Draft; Live does not change.
- Draft clean: acts at once; toast "Draft now matches v5. Live v7 is unchanged. · Undo".
- Draft has changes: tier 2 ConfirmDialog "Replace your draft with v5? Your 3 unpublished changes are removed. Live v7 is unchanged." · Cancel · **Replace draft** (primary, not danger: nothing live is affected). Then the same toast with Undo (FD11).

### 6.4 Roll back

"Roll back to v7…" (from the publish toast, the version menu or History) opens the Publish gate with:
- Title "Roll back to v7", meta "Publishes v7's content as v9. Calls already placed on v8 stay recorded on v8."
- Checks re-run **on v7's content today**: an integration or template that has since broken blocks it like any publish ("v7 uses the WhatsApp template 'visit_old', which was rejected on 20 Sep.").
- Changes: the diff from Live v8 to v7's content.
- Where it goes live: as §5.3.
- Note prefilled: "Rolled back from v8 to v7's content" (editable).
- **The Draft:** if the Draft is clean it follows Live (becomes v9's content). If it has changes, a Checkbox "Also reset my draft to v7's content (removes 3 unpublished changes)", unticked, with the consequence under it: "Left unticked, your draft keeps v8's changes and publishing it later brings them back." The version chip then reads `Draft · based on v8 (rolled back) ▾`.
- Primary: `Roll back to v7`. Toast: "v9 is live with v7's content. Calls on v8 stay on v8. · Undo isn't possible; roll back again from History."

There is no "Undo publish" anywhere (D §1.4).

### 6.5 AI draft (Describe it)

AI draft becomes a way to **propose changes to the Draft**, never to replace a flow silently (F-FLOW-031).

- Entry: ⋯ › "Describe a change…" in the designer, the palette, and `/flows/new` "Describe it" (§15.3).
- Sheet `detail` (560): Textarea (6 rows, soft limit 2,000, placeholder "Ask about a site visit this week. If they say later, schedule a callback…"), optional fields: Languages (MultiSelect), "Book meetings" (Checkbox), "Hand off to a person when" (text). Three example prompts as secondary `sm` buttons that insert text (not chips that run).
- Generate runs with `StageProgress` (O §14.3): Reading your description · Drafting steps · Checking the flow, with Cancel; up to 90 s.
- Result: compare mode on the canvas against the current Draft (added, changed, removed marks as §4.5) plus a bar: "Proposed: 6 added · 2 changed · 1 removed · 1 error to fix" · **Apply to draft** (primary) · Discard. Applying is one undo step and a toast "Applied 9 changes to the draft · Undo". Nothing reaches Live; the Publish gate still stands between it and callers.
- The server validates the proposal against the step-type schema; unknown types come back as Unsupported steps (§7.15), never as default boxes (F-FLOW-029).

---

## 7. The step inspector

### 7.1 Shared anatomy

The inspector is an `<aside aria-labelledby="inspector-title">` in the Sheet `inspector` variant (O §4.1): docked 320 (resizable to 480) at ≥1280, an overlay from the right at 1024–1279, a read-only sheet below 1024. It always renders at Standard density (O §1.2).

```
┌ ◇  Logic · Question · #5                  ⋯  ✕ ┐ 56  header
│    Ask about a site visit                      │
├ Configure │ Test data │ Issues 1 ─────────────┤ 40  PanelTabs
│ Label                                          │
│ [Ask about a site visit                     ]  │
│ Agent asks                               {}    │  {} = Insert variable
│ [{{lead_name}} ji, would you like to visit  ]  │
│ [the site this week?                        ]  │
│ Sounds like: "Anika ji, would you like to…" ▶  │
│ Answers to listen for                          │
│ ⋮ Yes    haan, zaroor · हाँ    Go to [Book site visit ▾] │
│ ⋮ Later  baad mein, next week  Go to [Schedule callb… ▾] │
│ ⋮ No     nahi, not now         Go to [Polite close ▾]    │
│   No reply  after [6] s        Go to [No answer ▾]        │
│ [+ Add answer]                                 │
│ Save answer to (optional)  [{{visit_intent}} ] │
│ Language  [अA Auto · Hindi + English ▾]        │
│ ▸ Advanced                                     │
├────────────────────────────────────────────────┤
│ ⓘ Edits save to the draft. Callers hear        │ 48  footer
│   Live v7 until you publish.          [Done]   │
└────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Header | Glyph tile 24 (F §12, the phase's tile) · phase line `phase-12` `text-3` "Logic · Question · #5" (the stable step number, part 1 D7) · title `title-16`, the step's label, one line with a Tooltip for the full text · `⋯` IconButton ("More actions for Ask about a site visit") · Close IconButton ("Close inspector"). The label field and the title stay in sync as you type |
| `⋯` menu | Duplicate (`⌘/Ctrl+D`) · Copy link to step (`?node=`) · Convert to… (submenu of compatible types: Speak ⇄ Question keeps the prompt; Knowledge lookup ⇄ CRM lookup keeps outputs) · separator · **Delete step** and **Delete and reconnect** (`Alt+Delete`, only when the step has one input and one output; part 1 §10.3), both in `danger-text`, no "…": they act at once with Undo (§14.1) |
| Tabs | PanelTabs (N §3): **Configure** · **Test data** · **Issues** with CountBadge (errors + warnings on this step). Selected tab in the URL (`tab=`) |
| Configure | Sections in this order: the step's fields (label first), **Outputs** (answers, cases or found/not found), **Language** (override, §10.3), **Advanced** (Collapsible, closed): step id `flow_7c21/step_18` in `mono-12` with Copy; "What the agent is told" (the compiled instruction for this step, read-only, `mono-12` on `surface-2`, max 12 lines then scroll, Copy); created and last edited by whom |
| Test data | The sample values this step uses (a KeyValueList of editable fields, per user per flow, never saved into the revision): "lead_name · Anika", "company_name · Sample Realty". **Hear it** plays the step's line with these values in the flow's voice. "At this step in tests today: reached 3 times · Yes 2 · No reply 1" (FD6; hidden until it exists) |
| Issues | One IssueRow per issue on this step (§12.4) with **Show field** (focuses the field) or **Go to step** (for connection issues). Empty: compact EmptyState "No issues on this step." |
| Footer | Sticky, 48, `surface`, top hairline: StatusText sm neutral with `info` 14: "Edits save to the draft. Callers hear Live v7 until you publish." ("Edits save to the draft." when nothing is live; "Read-only. You're viewing v5." on versions) · **Done** (secondary `sm`): closes the inspector and returns focus to the step. There is no Apply and no Delete here (F-FLOW-019) |
| Fields | Field wrapper (C §3.1): `label-13` in `text`, hint `meta-12` `text-3`, error replaces the hint. No uppercase, no mono labels, no ID or Position boxes (F-FLOW-033). Optional fields say "(optional)"; unmarked fields are required (C §3.1) |
| Integration row | Steps that depend on an integration start Configure with an **IntegrationStatusRow** (§24): a ServiceMark `sm` (Settings §7.4 and §14: a 20 px `--surface-3` tile with the service's single-colour mark or its Lucide fallback at 12 px, never a letter or a brand fill; the Book meeting inspector shows the Google Calendar mark, or `calendar` as the fallback), "Google Calendar · Connected" (`StatusText` success) or "Google Calendar · Not connected · **Connect**" (warning; the link opens Settings › Integrations in a new tab and the row re-checks on focus return) or "Couldn't check Google Calendar · Retry" (neutral). Controls that need it are disabled with the reason (C §1.6), never silently on (F-FLOW-030) |

**Behaviour.**
- Selecting a step opens its inspector without moving focus (O §4.4). `Enter` or `F2` on a focused step opens it and focuses the first field (Label); `Esc` in a field (after closing any open popover) returns focus to the step; `F6` moves between canvas, inspector, Problems bar and header (F-A11Y-001, F-A11Y-027).
- Every change applies to the Draft at once (autosave, §4.3). **Validation timing is C §8.2** with one designer rule: an invalid value (a phone number "abc", 999 attempts) stays visible in its field but the step keeps its last valid value and is reported invalid until fixed (F-FLOW-015). An empty required field on a step you just added is not painted red until you leave the step once (V2); the Issues count includes it from the start, so the header is never optimistic.
- Deleting the step while its inspector is open closes the inspector and moves focus to the previous step in graph order (F-FLOW-025).
- Nothing selected: the inspector closes and the canvas takes the space. Several steps selected: the slot shows "3 steps selected" with the bulk actions part 1 defines.

### 7.2 The step-type registry (one name everywhere)

One module (`lib/flow/step-types.ts`, part 1 §4.3) feeds the palette, the step's phase line, the inspector title, toasts, rules, the Outline, the Test panel's system rows and the docs (F-FLOW-027).

| Type key | Name | Phase | Palette description | Outputs | Replaces |
|---|---|---|---|---|---|
| `trigger.inbound` | Inbound call | Trigger | When someone calls your number | 1 | Start (fixed pill) |
| `trigger.outbound` | Outbound batch | Trigger | When a batch from Leads calls someone | 1 | Start |
| `trigger.api` | API or webhook | Trigger | When your system starts a call | 1 | (new) |
| `trigger.test` | Browser test | Trigger | When you test in the browser | 1 | (new) |
| `logic.question` | Question | Logic | Ask, then follow the answer | 1–8 answers + No reply (part 1 says 2–8; §25 R13) | Question ("YES ↓ / NO →") |
| `logic.branch` | Branch | Logic | Decide from what you know | Cases + Else | Branch / Condition Check |
| `logic.verify` | Verify caller | Logic | Check who is calling | Verified · Not verified · No reply | Verify Customer |
| `action.speak` | Speak | Action | Say a line | 1 | Speak / New Speak Node |
| `action.knowledge` | Knowledge lookup | Action | Answer from your documents | Found · Not found | Knowledge Query / Knowledge Lookup, FAQ |
| `action.crm` | CRM lookup | Action | Fetch a record from your CRM | Found · Not found | CRM Lookup / Live Lookup |
| `action.meeting` | Book meeting | Action | Offer times and book one | 1 + fallback **Not booked** (proposed, §25 R2) | Book Meeting / Schedule |
| `action.whatsapp` | Send WhatsApp | Action | Send an approved template | 1 | WhatsApp / Send WhatsApp |
| `action.transfer` | Transfer to a person | Action | Hand the call to a person | fallback **Didn't connect** only; a connected transfer ends the call as Transferred | Human Handoff / Transfer Call |
| `outcome.end` | End with outcome (Interested · Callback · Not interested · No answer · Transferred · Do not call · Failed · Ended) | Outcome | Finish and record the result | 0 | End / End Call (migrates to Ended) |
| `unknown` | Unsupported step | (none) | never in the palette | as stored | React Flow's default box |

Part 1 §4.3 is the source of truth for names, glyphs and outputs; this table adds the type keys the inspector schemas use. The one proposed difference is Book meeting's fallback row **Not booked** (the caller hears the difference, so the flow must branch on it); it is a change request to part 1, listed in §25 R2.

### 7.3 Trigger steps

A flow needs at least one Trigger (rule E01). Triggers take no input socket. They configure how a call **enters**; nothing is spoken in a Trigger (the first Speak or Question after it speaks).

**Inbound call**

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Inbound call" | Required |
| Answer calls on | MultiSelect of the workspace's inbound numbers (`PhoneText` options with "answers with 'EMI reminder' v3" as the description) | none | Picking a number bound to another flow shows the hint "Moves from 'EMI reminder' to this flow when you publish." A number that isn't verified is listed disabled with "Not verified yet. Verify it in Phone setup." Empty: warning W08 "This trigger doesn't answer any number yet." |
| When to answer | SegmentedControl: Always · Set hours | Always | Set hours reveals the CallingHours recipe (C §7.1) titled "Answer hours · IST" |
| Outside these hours | Select: Say a message and end · Transfer to a person · Take a voicemail | Say a message and end | "Say a message" reveals a PromptField: "We're closed now. We open at 10 am. Please call back then." |
| Recording notice | Read-only statement from workspace settings | | "Callers hear the recording notice first: 'This call may be recorded for quality.' · Change in Settings" (compliance copy is the owner's, D §8) |

**Outbound batch**

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Outbound batch" | Required |
| Caller ID | Select of verified caller IDs (`PhoneText`) | Workspace default | None verified: blocking at publish only if a batch uses this flow (§5.2) |
| Calling hours · IST | CallingHours recipe | Workspace hours (Mon to Sat, 10 am to 7 pm) | "Batches wait for these hours. DND numbers are always skipped." |
| Retries if no answer | NumberInput 0–3, unit "retries" + Select interval (1 h, 2 h, 4 h, next day) | 1 retry · 2 h | "0 to 3 retries" |
| Calls at a time | NumberInput 1–20 | 5 | "1 to 20 calls at a time" |
| If nobody answers | Select of Outcome labels | No answer | Written to the lead after the last retry; no step runs |
| Voicemail | SegmentedControl: Hang up · Leave a message | Hang up | Leave a message reveals a PromptField (max about 20 s spoken) |

**API or webhook**: Label · Endpoint (read-only `mono-13` "POST /v1/flows/flow_7c21/calls" with Copy) · Inputs the request must include: a list of variable names (`{{order_id}}`) with type (Text, Number, Yes/No, Date) that become variables (§8) · a link "API keys and docs" to Settings › Developer. Rule: an input name that clashes with a lead field is an error.

**Browser test**: Label · Start as: Inbound call · Outbound call (sets `{{call_direction}}`) · Sample lead: Combobox of leads or "Sample values" (from Test data). Used by Talk in browser and the Test panel when the flow has several triggers; without it, tests start at the first Trigger in graph order and the Test panel's "Start at" select chooses.

### 7.4 Question

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Question" + number ("Question 2") | Required |
| Agent asks | PromptField (§8.2), rows 3 | empty | Required (E05 "Add what the agent asks."). Hint: "Ask one thing. The agent speaks it in the caller's language." |
| Answers to listen for | AnswerEditor (§7.7) | Yes (haan · हाँ), No (nahi · नहीं), No reply after 6 s | At least one named answer (E07); each named answer needs 2 or more examples (W04) |
| If the answer is unclear | Select: Ask again once · Ask again twice · Go to No reply | Ask again once | Reveals "Ask again with" PromptField (optional; default rephrases the question) |
| Save answer to (optional) | VariableField (§8.3) | none | Creates a captured variable of type Option (the answer labels) or Text ("Save what they said"); snake_case, unique in the flow |
| Let the caller interrupt | Switch | On | "Callers can answer before the question ends." |
| Language | Language override (§10.3) | Auto | |

### 7.5 Branch

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Branch" + number | Required |
| Decide by | SegmentedControl: Rules · Description | Rules | Description reveals a Textarea "Caller mentioned a budget above ₹1 Cr" and the warning hint "The agent judges descriptions and can be wrong. Use rules when the value is saved in a variable." |
| Cases | ConditionBuilder (§9) | one empty case + Else | Evaluated top to bottom; the first match wins (stated under the list) |
| Else | Fixed last row, Go to | none | Required (E06) |

Outputs: one per case (labelled by the case's name, default "Budget over ₹1 Cr" generated from the rule and editable) plus **Else**.

### 7.6 Verify caller

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Verify caller" | Required |
| Agent asks | PromptField | "To confirm it's you, what are the last 4 digits of your loan account?" | Required |
| Check against | Select: A lead field · A CRM record · A knowledge table | A lead field | Then **Field** (Select of fields from that source, never free text; F-FLOW-033 truncated placeholders go). CRM record adds the IntegrationStatusRow |
| Match | SegmentedControl: Last 4 digits · Full value · Exact wording | Last 4 digits | |
| Attempts | NumberInput 1–5 | 2 | "1 to 5 attempts." Out of range: "Enter a number from 1 to 5." (E09, kept in the field, not committed) |
| If it fails, say (optional) | PromptField | "Sorry, that doesn't match." | |
| Hide spoken digits in transcripts | Switch | On (locked on when Match is digits) | "Shown as •••• in Call reports." |

Outputs: **Verified** · **Not verified** · **No reply** (fallback). Voice biometrics are a flow-level setting (§11 Security), not this step.

### 7.7 The answer editor (Question, Branch, Verify caller)

Every Logic output is an **answer row** in the inspector, mirroring the 28 px answer rows on the canvas (D §6.5).

| Part | Spec |
|---|---|
| Row | Grid `24px minmax(0,1fr) auto`, min height `--control-h` + 8, padding `space-4 0`, bottom hairline. Drag handle (`grip-vertical` 16, `text-3`) for pointer reordering; keyboard reordering via the row's `⋯` "Move up / Move down" and `Alt+↑/↓` |
| Label | Inline TextInput `sm`, `label-13`; unique within the step (E08 "Two answers are called 'Yes'.") |
| Examples | A token input: each example is a 20 px Tag with remove; Enter or comma adds; Devanagari and Hinglish welcome ("haan, zaroor", "हाँ"); shown on the canvas as "haan, zaroor · हाँ" (`meta-12`). `lang` set per token by script detection |
| Go to | **GoToSelect** (§24): a Select listing steps by label with phase glyph and step number, grouped by phase, plus "+ New step here…" (opens the palette and inserts a connected step) and "Not connected". Choosing creates or moves the connection (one undo step) |
| Fallback row | No reply ("after [6] s", NumberInput 3–15 s) or Else. On `surface-2`, no drag handle, can't be deleted, label fixed. Its canvas edge is the only dashed line (D §5) |
| Not connected | Row gets `warning-soft` fill and "Not connected" in `warning-text` in the Go to select; error E03 until wired |
| Add answer | Ghost `sm` "+ Add answer" (max 8 named answers; the 9th is disabled with "Up to 8 answers. Use a Branch for more.") |
| Delete an answer | Row `⋯` › Delete answer: acts at once, removes its connection, Undo toast "Deleted answer 'Later' and its connection · Undo" |

Keyboard: Tab moves Label → Examples → Go to per row; `C` on a focused row opens Connect to… (§16.3), the same list as Go to.

---

### 7.8 Speak

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Speak" + number | Required; duplicate labels warn (W05) |
| Agent says | PromptField, rows 3, soft limit 600 | empty | Required (E05 "Add what the agent says."). Hint on the count row: "About 9 s spoken" (estimated at the voice's pace). Over about 30 s: W09 "Long lines lose callers. Split this into two steps or ask a question." |
| Let the caller interrupt | Switch | On | |
| Language | Language override (§10.3) | Auto | |

Output: 1. The canvas body shows the first two lines with tokens (part 1).

### 7.9 Knowledge lookup (includes today's FAQ)

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Knowledge lookup" | Required |
| Search in | RadioGroup: All indexed sources · Chosen sources · This step's Q&A | All indexed sources | Chosen sources reveals a MultiSelect of sources, each option with its status sentence ("Indexed · 42 passages", "Indexing… 60%", "Couldn't index") from the Knowledge spec. **This step's Q&A** replaces the FAQ step: a list of Question + Answer pairs ("+ Add question") |
| Look up | SegmentedControl: What the caller asked · A set query | What the caller asked | A set query reveals a PromptField ("EMI due date for {{loan_type}}") |
| Answer style | Select: In the agent's own words · Read the passage closely | Own words | Hint for "closely": "For prices and policy wording." |
| Try a question | SearchInput `sm` + result line | | "Would answer from 3 passages · price-sheet.pdf" or "Nothing matched well enough. The call takes Not found." (Knowledge spec K2 verdict copy) |

Outputs: **Found** · **Not found** (both required, E03). Rules: no indexed source in scope, or an empty Q&A list (E13 "Nothing to search. Upload a document in Knowledge or add Q&A here."); a chosen source that was deleted (E13, Knowledge spec §1.8); a chosen source indexing or failed (W06). Storage names like `1789987752864-price.pdf` never show; sources use their titles (F-FLOW-033).

### 7.10 CRM lookup

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| (top) | IntegrationStatusRow for the connector | | |
| Label | TextInput | "CRM lookup" | Required |
| Connector | Select of connectors + "New connector…" (opens Settings › Integrations in a new tab) | none | None: E13 "Choose a connector." Disconnected: W02 |
| Find the record by | Select: Caller's phone number · A variable | Caller's phone number | A variable reveals a VariableField picker |
| Bring in | MultiSelect of the connector's fields | none | Each becomes `{{crm_<field>}}` (§8.1). Disabled until a connector is chosen: "Choose a connector first." |

Outputs: **Found** · **Not found**. Helper under Outputs: "If no record matches, the agent says so and never guesses." (replaces the `no_match` and "no embeddings" copy, F-FLOW-033).

### 7.11 Book meeting

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| (top) | IntegrationStatusRow: Google Calendar | | |
| Label | TextInput | "Book meeting" | Required |
| Agent asks | PromptField | "Which day suits you for the site visit this week?" | Required |
| Meeting type | SegmentedControl: Phone call · Video call · In person | Phone call | In person reveals Address (Textarea, 2 rows, required) |
| Length | Select: 15, 30, 45, 60, 90, 120 min | 30 min | Never undefined (fixes "Duration: undefined minutes", F-FLOW-013) |
| Offer times from | RadioGroup: Google Calendar free time · Set hours | Calendar when connected, else Set hours | Set hours reveals the CallingHours recipe ("Meeting hours · IST") plus "Earliest" (Select: Later today · Tomorrow · In 2 days). Free text slots are retired (F-FLOW-030) |
| Confirm by | Checkbox group, each disabled with its reason when unavailable: Send WhatsApp confirmation (Select template; "Needs WhatsApp. Connect it in Settings.") · Send email (needs `{{lead_email}}`: W11 "Some leads have no email. They won't get one.") · Add to Google Calendar ("Needs Google Calendar.") | WhatsApp on only if connected; others off | Defaults never assume a connection (F-FLOW-030). Checkboxes use the standard `--accent` checked fill, not amber |
| Save the booked time to | VariableField | `{{meeting_time}}` | Created automatically; renaming updates uses |

Outputs: the main output (booked) and the fallback row **Not booked** (declined, or no time suited), proposed in §25 R2. Until part 1 adopts it, Book meeting has one output and the agent's prompt handles a refusal.

### 7.12 Send WhatsApp

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| (top) | IntegrationStatusRow: WhatsApp Business | | Not connected: W02 |
| Label | TextInput | "Send WhatsApp" | Required |
| Template | Select; each option shows a StatusTag: Approved (success) · Pending (warning) · Rejected (danger, disabled with "Rejected on 20 Sep. Pick another.") | none | None: E12 "Choose a template." Pending: W01 "'visit_confirm' is pending approval. Calls continue; the message waits." |
| Preview | A read-only message card (`surface-2`, radius 8, `read-15`) with placeholders filled from Test data | | Shows exactly what the caller receives |
| Fill the template | One row per placeholder: `{{1}}` → VariableField picker | first matching variable | Unmapped: E12 "Fill {{2}} in the template." |
| Send to | Select: Caller's number · A variable | Caller's number | |
| Attachment | Select: None · A file from Assets · A link | None | Link uses `httpsUrl` (C §8.2). Files come from Settings › Workspace › Assets (Knowledge spec) |
| Tell the caller (optional) | PromptField | "I've sent the details on WhatsApp." | |

Output: 1 (sending is asynchronous; a failed send is recorded on the call report, not a branch).

### 7.13 Transfer to a person

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Transfer to a person" | Required |
| Transfer to | RadioGroup: A phone number · Rep console · A variable | Rep console when reps exist, else A phone number | Phone number: PhoneInput (C §4.1). "abc" shows "Enter a number with the country code, like +91 98765 43210." on blur; the step keeps its last valid number (E10). Rep console reveals Select of queues ("Any available rep") |
| Say before transferring | PromptField | "Connecting you to our site manager. Please hold." | Required |
| Ring for | NumberInput 10–60, unit "s" | 30 s | "10 to 60 seconds" |
| Brief the person first | Switch | On | "They hear a one-line summary before the caller joins." |

Outputs: the fallback row **Didn't connect** (no answer or busy). A transfer that connects ends the agent's part of the call and records the outcome **Transferred** (part 1 §4.3); nothing runs after it.

### 7.14 End with outcome

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Outcome | Select: Interested · Callback · Not interested · No answer · Transferred · Do not call · Failed · Ended (lead unchanged; migrated End steps) | Interested | Sets the tile's state tint (D §6.5) and the canvas status line "Lead → Interested" (plain text, part 1 §5.1) |
| Label | TextInput | the outcome name ("Visit booked" is typical) | Required |
| Set lead status to | Select from the Lead status map (N §5.3) | mapped per part 1 §4.3 (Interested → Interested, Callback → Callback due, No answer → Not reached, Transferred → Contacted, Do not call → Do not call; Failed and Ended leave it unchanged) | "Do not call" shows the consequence: "This lead won't be called again." |
| Callback time | VariableField (Callback only) | none | Missing: W10 "Callbacks need a time. Save one on an earlier question." |
| Say before ending (optional) | PromptField | "Thank you for your time. Have a good day." | |
| Add a note to the lead (optional) | PromptField, rows 2 | none | "Visit booked for {{meeting_time}}." |

No outputs. Test calls and browser tests never write lead status or notes (Cockpit §1.1 rule 5); the Test panel says so when an Outcome is reached (§13.4).

### 7.15 Unsupported step

Any stored type missing from the registry (legacy AI draft or imported JSON) renders as a neutral rectangle with an amber border and the words "Unsupported step" (part 1 draws it). Its inspector:
- Notice (warning): "This step uses a type Vaani doesn't recognise: `emergency_dispatch`. Calls can't run it. Convert it or delete it."
- Label (read-only) and the stored text, if any, shown read-only.
- **Convert to…** Select (Speak · Transfer to a person · End with outcome), keeping the label and text; one undo step.
- Rule E14 (error): "'Call ambulance' uses an unsupported type." (F-FLOW-029).

---

## 8. Variables and templating

### 8.1 Where variables come from

Variable names stay flat snake_case, as today (`{{lead_name}}`), so existing prompts keep working. Groups exist only in the picker.

| Group | Examples | Source | Available |
|---|---|---|---|
| Captured in this flow | `{{visit_intent}}`, `{{meeting_time}}`, `{{verified}}` | Save answer to (Question), Verify caller, Book meeting | After the step that captures it, on that path |
| Lead | `{{lead_name}}`, `{{lead_city}}`, `{{lead_language}}`, `{{lead_email}}`, custom lead fields | Leads (FD10) | Whole call; may be empty per lead |
| CRM | `{{crm_plan}}`, `{{crm_due_date}}` | CRM lookup "Bring in" | After that lookup's Found path |
| API input | `{{order_id}}` | API trigger inputs | Whole call when started by the API |
| Call | `{{call_direction}}`, `{{call_date}}`, `{{caller_number}}` (masked in previews) | The call | Whole call |
| Workspace | `{{company_name}}`, `{{agent_name}}` | Settings | Whole call |

### 8.2 PromptField

Every "Agent asks / says" field. It is the Textarea (C §3.6) plus variable tokens, a picker and a preview.

| Part | Spec |
|---|---|
| Input | A native `<textarea>` (keeps undo, spellcheck, IME for Devanagari and paste) with a mirrored highlight layer behind it that draws tokens; never a `contenteditable` |
| Token look | `{{lead_name}}` in `mono-12` on `surface-3`, radius 4, 1 px `border`; an unknown variable gets a 1 px `danger-border` and a wavy `danger` underline (shape plus colour) |
| Insert variable | IconButton `braces` 28 at the label row's end ("Insert variable"), opening the picker at the caret |
| Picker | Combobox listbox (C §5.3) grouped as §8.1, each option: name (`mono-12`), label ("Lead name"), source and sample ("sample: Anika"); unavailable-here options listed last, disabled with the reason ("Captured later, in Book meeting") |
| Trigger | Typing `{{` opens the picker filtered by what follows; Enter or Tab inserts `{{name}}` and closes; Esc closes and leaves the braces |
| Preview | Under the field: "Sounds like: 'Anika ji, would you like to visit the site this week?'" in `meta-12` `text-2`, with sample values from Test data; an empty variable shows its fallback or "(empty)" in `text-3`. ▶ **Hear it** (IconButton `play`) speaks the line in the flow's voice and language |
| Count | "About 9 s spoken · 142 of 600" (soft limit, C §3.6) |
| Errors | E05 empty · E11 "Unknown variable {{lead_nmae}}. Did you mean {{lead_name}}?" with a one-click fix link · W03 used before captured · W07 may be empty without a fallback |

**Fallback values** (FD10): `{{lead_name | "sir"}}` speaks "sir" when the lead has no name. The picker offers "Add a fallback" on a selected token. Hidden until the runtime supports it.

### 8.3 VariableField (Save answer to, Save the booked time to)

A TextInput with a `{{ }}` affix and a Combobox of existing captured variables. New names are validated as snake_case ("Use lowercase letters, numbers and _ only.") and unique in the flow. Renaming a captured variable asks once: "Rename {{visit_intent}} in 3 steps too?" · Rename everywhere (default) · Only here; one undo step either way.

### 8.4 The Variables panel (`V`)

The left panel (`--size-left-panel` 280, part 1 §3.1), sharing the slot with Add step, Outline and Version history. A searchable list grouped as §8.1; each row: name (`mono-13`), label, type, "Used in 3 steps" (a button that runs Find for it), "Captured by Ask about a site visit" (link to the step), and its sample value (editable; the same values as Test data). Unused captured variables show "Not used" in `text-3`. Empty: "Variables appear when a step saves an answer or a lookup brings in fields."

---

## 9. The condition builder (Branch)

Today a Branch is one free-text condition with TRUE and FALSE, so real flows chain three Branches to express three property types (F-FLOW-020). The builder gives a Branch **named cases evaluated in order, plus Else**.

```
Cases · first match wins                                    
┌ 1  Name [Budget over ₹1 Cr                ]          ⋯ ┐
│    [{{budget}}    ▾] [is more than    ▾] [1,00,00,000 ] │
│    + Add condition                                     │
│    Go to [Premium site visit                     ▾]    │
└────────────────────────────────────────────────────────┘
┌ 2  Name [Budget ₹80 L to ₹1 Cr            ]          ⋯ ┐
│    [{{budget}}    ▾] [is between      ▾] [80,00,000] and [1,00,00,000] │
│    Go to [Standard site visit                    ▾]    │
└────────────────────────────────────────────────────────┘
  Else · anything else, or an empty value   Go to [Ask about budget again ▾]
[+ Add case]                         Try values: {{budget}} [95,00,000] → Case 2
```

| Part | Spec |
|---|---|
| Case | A group (`role="group"`, labelled "Case 2, Budget ₹80 L to ₹1 Cr"), 1 px `border`, radius 8, padding `space-12`, gap `space-8`. Number + editable Name (defaults to a sentence built from the rule; the name labels the canvas answer row and the edge) + `⋯` (Move up, Move down, Duplicate case, Delete case with Undo) |
| Condition row | Variable (Combobox of variables with their type; C §5.3) · Operator (Select, by type below) · Value (control by type). Min widths 120 / 140 / 120; wraps below 400 px of inspector width to one control per line |
| Several conditions | "+ Add condition" adds a row; with 2 or more, a SegmentedControl above them: **Match all** · **Match any**. No nested groups in v1 (use another case or Branch) |
| Else | Fixed last row on `surface-2`: "Else · anything else, or an empty value" + Go to. Required (E06) |
| Try values | A sample-value field per variable used (from Test data) and a live result "→ Case 2 · Budget ₹80 L to ₹1 Cr" (or "→ Else"), recomputed as you type. It is how an author proves the order is right |

**Operators and values by variable type**

| Type | Operators | Value control |
|---|---|---|
| Text | is · is not · contains · starts with · is empty · is not empty · is one of | TextInput; "is one of" uses the token input |
| Number | = · ≠ · more than · at least · less than · at most · between | NumberInput (en-IN grouping, ₹ prefix when the variable is money) |
| Option (from a Question's answers) | is · is not · is one of | Select or MultiSelect of that Question's answer labels |
| Yes/No | is yes · is no | none |
| Date | before · after · within the next · more than … ago | DatePicker (C §7.1) or NumberInput + "days" |

**Rules.** Empty values never match and take Else (stated in the Else row). E15: an incomplete condition ("Case 2 needs a value.") or a type mismatch ("Enter a number, like 80,00,000."). E11: an unknown variable. W12: a case that can never match because an earlier case covers it ("Case 3 can't match. Case 1 already covers budgets over ₹80 L."; checked for single-variable numeric ranges and option sets only). **Description** mode (§7.5) stores the text and is judged by the agent at call time; it shows the hint "The agent judges descriptions and can be wrong."

**Keyboard.** Tab order: case name → variable → operator → value → Add condition → Go to, case by case. `Alt+↑/↓` on a focused case moves it; the move is announced ("Case 2 moved to position 1").

---

## 10. Voice and language

### 10.1 Flow level (Flow settings › Agent)

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Voice | VoicePicker `cards` (N §12.3); previews play in each of the flow's languages | Workspace default voice | Picking changes this flow's Draft only; "Make default" belongs to Settings, never here (F-UX-014) |
| Languages | MultiSelect with LanguageMarks (अ Hindi · A English · अA Hinglish · म Marathi · த Tamil …); the first is the primary; reorder with the token's menu | Hindi, English | At least one. A voice that can't speak one of them makes that option show "Vikash doesn't speak Tamil" and raises E16 |
| Switching | RadioGroup: Follow the caller's language · Stay in the primary language | Follow the caller | Follow: "The agent answers in the language the caller uses, from this list." |
| Mixed Hindi and English | Switch "Speak Hinglish when the caller mixes Hindi and English" | On when Hindi and English are both listed | |
| Pace | SegmentedControl: Slower · Normal · Faster | Normal | Previews use it |
| Wait for a reply | NumberInput 3–15, "s" | 6 s | Default "No reply after" for new Questions; existing steps keep their own |

### 10.2 What the canvas and inspector show

- The flow's languages appear once in the header meta of the Test panel and in the Publish gate ("Speaks Hindi and English · Vaani").
- A step with a language override shows its LanguageMark on the canvas meta line; steps on Auto show nothing (no decorative marks).
- Answer examples are bilingual by design (D §3.1): the answer editor accepts Latin, Devanagari and other scripts in the same row.

### 10.3 Step-level language override

A Select at the end of Configure: "Language: Auto · Hindi + English" (the flow's list) · each flow language · never a language outside the flow's list (add it in Flow settings first, link "Add a language"). Prompt fields show **language versions** as small tabs above the textarea when the flow has more than one language: `अ Hindi` · `A English` · "+ Add version". Hint under the field: "Without a Hindi version, the agent says this in Hindi in its own words. Add one to control the exact wording." (the runtime behaviour is to be confirmed, §26). Devanagari text renders at `read-15-deva` line height inside the field.

---

## 11. Flow settings

A Sheet `detail` (560), modal, opened from the tool rail (Flow settings), ⋯ › Flow settings, or `?panel=settings`. It replaces the blurred 576 px drawer (F-FLOW-032, F-VIS-022). Header: "Flow settings" + meta "Site-visit qualifier"; footer: SaveState compact on the left, **Done** (secondary) on the right. Five sections, each with a `title-16` heading, a one-line description and an outline Tag stating when changes apply.

| Section | Applies | Fields |
|---|---|---|
| **Identity** | "Applies now" | Name (required, unique; async check "Checking…"; clearing it and leaving the field restores the last name with "A flow needs a name. Kept 'Site-visit qualifier'." (F-FLOW-015)) · Description (optional, soft 280) · Category (Select: Sales · Support · Collections · Scheduling · Other) · Visibility (Select: Workspace · Only me; "Only me" is disabled with "Live on +91 80 •••• 2210. Teammates who run calls must see it." while the flow is live anywhere; replaces the "Private" pill, F-FLOW-014) |
| **Agent** | "Saved to the draft" | §10.1 fields · **Agent instructions** (Textarea, soft 6,000, count; description "The agent's personality and limits for this flow: tone, what it must never promise, how to address callers."; placeholder "Warm and brief. Never promise a discount. Address callers as ji…"; replaces "Soul.md", F-UX-016) |
| **Call behaviour** | "Saved to the draft" | Longest call (NumberInput 1–30 min, default 10; "At the limit the agent closes politely and ends the call.") · Recording notice (read-only, from workspace, with a Settings link) · Calling hours: a link "Set on the Outbound batch trigger" (they belong to the trigger, §7.3) |
| **Security** | "Saved to the draft" | Voice verification Switch "Check the caller's voice, with consent" (consent is always required, shown as a locked Checkbox) · Listen for (NumberInput, 4–20, unit per §26 Q3) · Confidence bands: a two-thumb Slider (C §6.5) 0 to 1 with labelled bands under it: "Verified 0.86 and above · Confirm 0.70 to 0.86 · Fallback below 0.70"; thumbs can't cross ("The lower band must be below the upper one.") · When confidence is in the middle band (Select: Ask a confirmation question · One-time code) · When it's low (Select: One-time code · Transfer to a person · End the call) · If fraud is suspected (Select: Restrict and alert · End the call) · Checkboxes: Liveness check · Check the fraud watchlist · **Only after verification** (Checkbox list in plain words: Look up a customer record · Send email · Send WhatsApp · Book meetings · Transfer calls; replaces "lookup_record, send_email, send_whatsapp") |
| **Advanced** | "Read only" | What the agent is told (the compiled instruction, `mono-12`, max-height 50vh, Copy; each "Step n" heading links to its step; replaces "Preview AI script" with its 230 px box and "Duration: undefined minutes", F-FLOW-016) · Export JSON (secondary `sm`) · Flow id `flow_7c21` with Copy |

Selects are at least 180 px wide so values never truncate ("Light confirmatio…", F-FLOW-032). Esc or Done closes; focus returns to the tool rail button.

---

## 12. Validation

### 12.1 Principles

1. **One rule set** (`@vaani/flow-rules`, TypeScript, run in the browser and on the server) with stable ids, levels and message templates. The chip, marks, Problems bar and panel, inspector fields and Issues tab, Outline badges, Publish gate and the server's 422 all read it (L6).
2. **Computed, never assumed.** Recompute 300 ms after each change (`--timing-validate-debounce`) in a Web Worker for flows over 60 steps; results are keyed by `flowId + draftEtag` (or version) and cleared on flow switch (F-FLOW-010). There is no "validated" state that outlives a change.
3. **Steps are named by their stable number and label** (part 1 D7), never by a raw id: "#5 Ask about budget". Untitled steps keep their default title, "#7 Speak 2" (F-FLOW-004).
4. **Errors block Publish. Warnings need a tick. Hints never block.** Nothing else is gated by validation: an invalid draft still saves and still runs in the text test up to the broken step.

---

### 12.2 The rule catalogue

Messages name the step by its stable number and label (part 1 D7). Each rule attaches to the flow, a step, a field or an output, which decides where "Go to" lands.

| Id | Level | Rule | Message example | Attaches to |
|---|---|---|---|---|
| E01 | error | No trigger | "Add a trigger so calls can start this flow." | flow |
| E02 | error | A step can't be reached from any trigger | "#9 Polite close can't be reached from any trigger." | step |
| E03 | error | An output isn't connected (answer, case, Found, Not found, Not booked, Didn't connect, or the single output of a non-Outcome step) | "#5 Ask about budget: answer 'Later' isn't connected." | output |
| E04 | error | A loop with no way to an Outcome | "#4, #5 and #6 loop with no way to an outcome." | steps |
| E05 | error | Empty prompt (says, asks, say before transferring) | "#7 Speak has nothing to say." | field |
| E06 | error | The fallback (No reply, Else) isn't connected | "#5 Ask about budget: 'No reply' isn't connected." | output |
| E07 | error | A Question with no named answer, or a Branch with no case | "#6 Branch has no cases." | step |
| E08 | error | Two answers or cases share a name in one step | "Two answers in 'Ask about budget' are called 'Yes'." | field |
| E09 | error | A number outside its range | "Attempts must be 1 to 5. It's 999." | field |
| E10 | error | An invalid phone number | "Transfer number needs the country code, like +91 98765 43210." | field |
| E11 | error | Unknown variable | "{{lead_nmae}} isn't a variable. Did you mean {{lead_name}}?" | field |
| E12 | error | WhatsApp template missing, rejected or not filled | "Choose a template for #8 Send brochure." | field |
| E13 | error | A lookup has nothing to use: no connector, no indexed source, a deleted source, empty Q&A | "Choose a connector for #4 Find loan." | field |
| E14 | error | Unsupported step type | "#11 Call ambulance uses an unsupported type." | step |
| E15 | error | Incomplete or mismatched condition | "#6 Budget check, case 2 needs a value." | field |
| E16 | error | The voice can't speak one of the flow's languages | "Vikash doesn't speak Tamil. Change the voice or remove Tamil." | flow |
| E17 | error | Any other required field empty or invalid under the step's schema (address for in-person meetings, a link that isn't https) | "#7 Book visit needs an address for in-person meetings." | field |
| E18 | error | An API input clashes with a lead field name | "API input {{lead_name}} clashes with the lead field. Rename it." | field |
| W01 | warning | Template pending approval | "'visit_confirm' is pending approval. Calls continue; the message waits." | field |
| W02 | warning | An integration the step needs isn't connected | "Google Calendar isn't connected. 'Book visit' can't check free time." | step |
| W03 | warning | A variable is used before it's captured on some path | "{{meeting_time}} is used in 'Polite close' before 'Book meeting' captures it on the 'No' path." | field |
| W04 | warning | An answer has fewer than 2 examples | "Answer 'Later' has no examples. Add 2 or more so the agent recognises it." | field |
| W05 | warning | Two steps share a label | "2 steps are called 'Lead questions' (#4 and #9)." | step |
| W06 | warning | A chosen knowledge source is indexing or failed | "'price-sheet.pdf' is still indexing." | field |
| W07 | warning | A lead field used without a fallback is empty for many leads (FD10) | "{{lead_email}} is empty for 40% of leads. Add a fallback." | field |
| W08 | warning | An Inbound call trigger answers no number | "'Inbound call' doesn't answer any number yet." | step |
| W09 | warning | A line longer than about 30 s spoken | "#3 Pitch runs about 42 s. Split it." | field |
| W10 | warning | A Callback outcome without a time | "Callbacks need a time. Save one on an earlier question." | field |
| W11 | warning | Email confirmation where leads may lack an email | "Some leads have no email. They won't get the confirmation." | field |
| W12 | warning | A case that can never match | "Case 3 can't match. Case 1 already covers it." | field |

Templates in the New flow gallery pass every rule with zero errors and zero warnings **in isolation**, checked in CI together with "the compiled instruction contains no 'undefined' or 'null'" (F-FLOW-013). Several rules depend on the workspace (W08 number, E13 knowledge, E12 and W01 WhatsApp, W02 calendar), so creation adapts each template to the workspace (§15.3) and CI also instantiates every template in an empty fixture workspace: 0 errors, at most W08.

### 12.3 Where issues show

| Surface | Shows | Behaviour |
|---|---|---|
| Inspector field | The field error (C §3.1), replacing the hint | V1–V4 timing; the new-step grace of §7.1 |
| Inspector Issues tab | This step's issues | Show field / Go to step |
| Step on the canvas | Error: `danger-border` + count badge; warning: `warning-border` + badge; an unconnected answer row turns amber "Not connected" (part 1 draws) | The badge is `aria-hidden`; the step's accessible name ends "2 errors" |
| IssuesChip (header) | `2 errors · 1 warning` | Opens the ProblemsPanel |
| Problems bar (32 px) | The first issue in graph order + counts + ‹ › + Go to step | Always visible in the designer at ≥ 1024; there is no full-screen mode (part 1 §3.1, X7; F-FLOW-034) |
| ProblemsPanel | Every issue, grouped by step | §12.4 |
| Outline | A badge per step row and "Not connected" answer rows | §16 |
| Publish gate | Errors block, warnings need a tick | §5.2 |
| Flows list and FlowSwitcher | "2 errors" for drafts with errors | §15 |
| Server | 422 with the same ids | §12.6 |

### 12.4 Problems bar and ProblemsPanel

```
Problems bar (32 px, bottom of the designer)
│ ⊗ 2 errors  ⚠ 1 warning │ #5 Ask about budget: "No reply" isn't connected.  Go to step  ‹ 1 of 3 › │ Outline  Test │

ProblemsPanel (expands upward from the bar; max 40 % of the canvas, part 1 §3.4)
┌ Problems · 2 errors · 1 warning         [All] [Errors] [Warnings]           Collapse ┐
│ Ask about budget · step 5 · Logic · Question                                         │
│   ⊗ "No reply" isn't connected.                                   Go to step         │
│   ⊗ Answer "Later" isn't connected.                               Go to step         │
│ Send brochure · step 8 · Action · Send WhatsApp                                      │
│   ⚠ Template "visit_confirm" is pending approval.                 Go to step         │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Bar | `surface`, top hairline, `data-13`. Counts as StatusTag validation `sm`; the current issue sentence in `text-2`, one line with Tooltip; Go to step (link-style button); ‹ › IconButtons "Previous issue" / "Next issue" (`F8` is taken by toasts and Alt+Arrow means move, so these use **Alt+,** / **Alt+.** while focus is in the designer and not in a text field, matched by `KeyboardEvent.code`; the keys appear in both tooltips, "Next issue (Alt+.)", and in the `?` sheet; key map 06 §9.6); toggles for Outline and Test panel (ghost `sm`, `aria-pressed`). With no issues: "No issues · 14 steps checked just now" (success StatusText) |
| Panel | `role="region"` `aria-label="Problems"`; heading `title-14` with counts; SegmentedControl filter (All · Errors · Warnings); groups per step (`label-13` step name + `meta-12` "step 5 · Logic · Question"), then IssueRows |
| IssueRow | Grid `16px minmax(0,1fr) auto`: `circle-x` (`danger-text`) or `triangle-alert` (`warning-text`) 16 + sentence `data-13` + "Go to step" or "Show field". Min height `--control-h`; the whole row is a button |
| Go to step | Selects the step, pans it into view with padding so no panel covers it, opens the inspector on **Configure** and focuses the field (or the output row) the issue attaches to; the list stays open. Part 1 §3.4 says "Issues tab"; this spec prefers the field, where the fix happens (§25 R14) |
| Empty | Compact EmptyState "No issues. 14 steps checked just now." |
| Announce | When counts change, politely, after 1.5 s without edits and at most every 2 s: "2 errors, 1 warning". Never per keystroke |

At 1024–1279 the panel overlays the canvas bottom (non-modal). In Review mode (768–1023) it is a tab beside the Outline; on phones the Outline's header shows the counts and each row its badges.

### 12.5 Step marks: meaning

Errors outrank warnings on a step (one border colour, the badge counts both: "3" with the worst icon). A step with an E02 (unreachable) also takes the unreachable treatment (part 1 §5.4: `--surface-2` fill, text at full contrast, glyph tile and sockets dimmed, badge "Not connected"). Marks update with the 300 ms recompute; they never animate.

### 12.6 Server parity

The Publish request carries the rules package version and the draft etag; the server re-runs the same rules and returns `422 { issues: [{ ruleId, level, stepId, field, output, message }] }` when anything blocks. Issues only the server can see (a template rejected minutes ago, a number unverified since) appear in the Problems list with the meta "Found when publishing" and stay until the next check clears them. A mismatch between client and server results is logged (§22). Until FD4, the gate says "Checked on this device" (P1).

---

## 13. Test and simulate

**Purpose.** Hear and walk the Draft before customers do, see which path it takes, and leave a record that it was tested (F-FLOW-016). Opened with **Test** in the header (secondary), `T`, or `?panel=test`.

### 13.1 Layout (≥1024: docked at the bottom, 280 px, resizable 200 px to 50%)

```
├ Test  [Text | Browser voice | Call my phone…]  Revision [Draft ▾]  Start at [Inbound call ▾]  Sample [Lead 1042 ▾]  Restart  ✕ ┤ 40
├──────────────────────────────────────────────────────────────────────────┬──────────────────────────────┤
│ 00:00  Vaani  अA  Step · Greeting                                         │ Captured                     │
│        Namaste Anika ji, main Vaani, Sample Realty se bol rahi hoon.      │  visit_intent   Later        │
│ 00:04  You, as the caller                                                 │  meeting_time   not yet      │
│        haan boliye                                                        │ Path                         │
│ 00:05  Vaani  Step · Ask about a site visit                               │  ✓ Inbound call              │
│        Would you like to visit the site this week?                        │  ✓ Greeting                  │
│    ⌸ Knowledge lookup · price-sheet.pdf · 2 passages                      │  ● Ask about a site visit    │
│ Reply as the caller  [Yes · haan] [Later · baad mein] [No · nahi] [No reply]                              │
│ [Type what the caller says…                                                               ] [Send]       │
└──────────────────────────────────────────────────────────────────────────┴──────────────────────────────┘
```

| Part | Spec |
|---|---|
| Header (40) | Mode SegmentedControl · Revision Select (Draft, Live v7, any version) · Start at Select (the flow's triggers) · Sample Select (a lead via Combobox, or "Sample values" from Test data) · Language Select (Auto or a flow language) · Restart (ghost) · Close. The kind line under it, `meta-12`: "Text test on the draft · nothing is sent or dialled" |
| Transcript | TranscriptFeed + TurnRow (N §12.4) in `live` mode: timecode gutter, speaker ("Vaani", "You, as the caller"), LanguageMark, the step link in plain words; system rows for lookups and simulated actions |
| Quick replies | Secondary `sm` buttons from the current Logic step: each answer's label and first example ("Later · baad mein"), then "No reply (6 s)". A Branch shows the decision instead: "Branch decided from {{budget}} = 95,00,000 → Case 2 · Change value" |
| Composer | Textarea composer mode (C §3.6): "Type what the caller says…", Enter sends; Hindi, Hinglish and Devanagari accepted |
| Side column (280) | **Captured**: a KeyValueList of variables as they fill ("not yet" in `text-3`). **Path**: the steps reached in order with `check`, the current one with a filled dot and "Now" |

---

### 13.2 Three ways to test

| Mode | Uses | Call kind (Cockpit §1.1) | Billing copy (the real rule only, P1) | Needs |
|---|---|---|---|---|
| **Text** (default) | The flow runtime turn by turn on the chosen revision, with typed caller replies (FD7) | none (no audio) | Stated by the server ("Text tests aren't billed" or the rate); hidden until known | Online |
| **Browser voice** | Talk in browser: your microphone and speakers | Browser test | As Cockpit §1.1 ("Not billed" or "Billed at ₹0.02/s") | Microphone permission (Cockpit readiness row) |
| **Call my phone…** | Your verified number rings | Test call | "Billed at ₹0.04/s · not counted in reports" | Opens the CallGate (`mode="single"`, kind test, the Draft allowed because the target is your own number); wallet and caller ID checks apply |

A Draft never calls anyone else: the phone mode has no number field, only "your verified number +91 •••••• 4821" and a link to verify one (Cockpit rule 2).

### 13.3 Side effects are simulated and said

| Step | In a test |
|---|---|
| Speak, Question, Verify caller | Spoken or shown as usual |
| Knowledge lookup | A real, read-only search; the system row names the source and passage count |
| CRM lookup | Select in the Captured column: "Use a sample result: Found · Not found" (default Found with Test data values) or "Read from the CRM (read-only)" |
| Book meeting | Simulated: "Book meeting · simulated · would book Sat 11 am. No invite sent." |
| Send WhatsApp | Simulated: "Send WhatsApp · simulated · would send 'visit_confirm' to your number. Not sent." |
| Transfer to a person | Simulated in every mode: "Would transfer to Rep console. Nobody was called." A Checkbox in Call my phone mode, "Transfer for real during this test", names who would ring |
| End with outcome | "Outcome · Visit booked · would set Lead 1042 to Interested. Not written: this is a test." |

### 13.4 The canvas during a test

- **Current step:** the "running" treatment part 1 defines (accent trace once along the incoming edge over `--dur-trace`, then static) plus a Tag "Now". The canvas follows the current step while **Follow along** is on (default); panning by hand pauses it and shows a "Follow along" button.
- **Reached steps:** a 16 px `check` mark in the step's corner; traversed edges stay in `--edge-active`. Unreached steps are unchanged (no dimming, so the author can still read them).
- **Reduced motion:** no trace; the marks appear directly (F §11).
- **After the run:** marks stay until the author edits the flow, restarts or closes the panel. Clicking a turn's step link selects that step.

### 13.5 End of a run, and the record

The last row is a summary: "Reached 'Visit booked' · 6 turns · 5 steps · 1 min 12 s" (success StatusText) or "Stopped at #8 Send brochure: choose a template. Fix it, then Restart." (warning). A run that hits an invalid step stops there, never skips it.

Each run is recorded (FD6): kind, revision and its content hash, reached steps, outcome, who and when. The Publish gate's "Tested on this draft" reads these; an edit after the run makes the check read "Tested before your last 2 changes". Coverage (hidden until FD6): "Across 3 tests on this draft: 9 of 14 steps reached · **Show untested**" (filters the Outline to untested steps).

### 13.6 Test panel states

| State | Copy and treatment |
|---|---|
| Idle | Compact EmptyState: "Test the draft before callers hear it. Nothing is sent or dialled in a text test." + **Start text test** (primary in this region) |
| Running, waiting for the caller | Quick replies enabled; composer focused |
| Agent working | A partial turn row "…" in `text-3` (the TurnRow partial state); no typing animation |
| Stopped at an invalid step | Warning summary row with Go to step |
| Service error | InlineError "Couldn't reach the test service. Your draft is safe. Retry" |
| Offline | Text and phone modes `aria-disabled` "You're offline"; nothing queued |
| Microphone blocked | The Cockpit readiness row "Microphone blocked. Allow it in your browser's site settings, then Retry." |
| Wallet ₹0 (Call my phone) | Handled in the Call gate: "Wallet is ₹0. Top up to place phone calls." |

**Keyboard and screen readers.** `T` toggles the panel (single-key shortcuts can be turned off, O §19); focus moves to Start, then to the composer. Final agent turns are announced (throttled, N §12.4); the step change is announced "Now at Ask about a site visit". Quick replies are ordinary buttons in the tab order. `Esc` in the composer returns focus to the canvas step that is current.

**Responsive.** ≥1024 docked (overlays the canvas bottom at 1024–1279 when the inspector is open). 768–1023: a full-height sheet with the three modes; the read-only canvas behind still shows marks. <768: full screen, text and browser voice only ("Call my phone" stays in the Cockpit on phones), with the Path list in place of the canvas.

---

## 14. Destructive-action safety

### 14.1 Guards (O §3.1 tiers applied)

| Action | Tier | What happens | Copy |
|---|---|---|---|
| Delete a step (`Delete`/`Backspace` on a focused step, ⋯ › Delete step, bulk) | 1 · Undo | Acts at once; its connections go with it. **Delete and reconnect** (`Alt+Delete`, or the step menu) also joins the neighbours when the step has exactly one input and one output (part 1 §10.3). Inspector closes; focus moves to the previous step on the path; announced | Toast: "Deleted 'Polite close' and 2 connections · Undo" / "Deleted 'Pitch' · reconnected 'Greeting' to 'Ask about budget' · Undo" (F-FLOW-001, F-FLOW-025) |
| Delete a connection or an answer | 1 · Undo | At once | "Removed the connection from 'Yes' · Undo" |
| Delete several steps | 1 · Undo | One toast, one undo step | "Deleted 4 steps and 6 connections · Undo" |
| Delete the last Trigger or Outcome | 1 · Undo | Allowed; the flow gets error E01 or E03 and can't be published until fixed (part 1 §10.3) | "Deleted 'Inbound call' · Undo"; the issues chip turns red |
| Discard draft changes | 2 · Confirm | Draft resets to Live | §4.4 |
| Restore a version as draft over changes | 2 · Confirm | §6.3 | "Replace your draft with v5? …" |
| Apply an AI proposal | Diff first | One undo step | §6.5 |
| Start over from a template (⋯ › "Replace draft with a template…") | 2 · Confirm | Draft replaced; Live unchanged | "Replace your draft with 'Site visit'? Your 3 unpublished changes are removed. Live v7 is unchanged." |
| Archive a flow not used anywhere | 1 · Undo | Hidden from pickers | "Archived 'Diwali offer' · Undo" |
| Delete a flow not used anywhere | 2 · Confirm | Removed; call reports kept | "Delete 'Diwali offer'? Its 3 versions are removed. Call reports for its 41 calls are kept." |
| Archive or delete a flow that is live somewhere | 3 · Typed | Dialog lists the impact; each inbound number needs a replacement flow chosen; scheduled batches using it are cancelled | "Delete 'Site-visit qualifier'?" · impact rows: "+91 80 •••• 2210 answers with it · Answer with [EMI reminder ▾]", "Batch 'Weekend follow-ups' · 46 queued calls will be cancelled" · "Type Site-visit qualifier to confirm" · **Delete flow** |
| Publish, Roll back | 4 · Gate | §5, §6.4 | |

The inspector's red "Delete Node" slab and the unguarded "Reset to default" are retired (F-FLOW-019). Every destructive menu item sits last, after a separator, in `danger-text` (O §3.5).

### 14.2 Keys that delete

`Delete` and `Backspace` delete only when focus is on the canvas, a step or a selected edge, never inside a field, a popover, the Outline's rename field or the Test composer. The key does nothing while a test is running on the canvas (a toast explains "Stop the test to edit").

### 14.3 Toast rules in the designer

Undo toasts are persistent until dismissed or superseded, sit above the Problems bar and right of the inspector (O §9.3), and coalesce ("Deleted 3 steps · Undo" undoes all three). `⌘/Ctrl+Z` is owned by the designer's history stack, which the toast mirrors.

### 14.4 One history stack

Every graph change is one entry: add, paste, duplicate, connect, disconnect, delete, move (one per drag end), Tidy, answer and case edits, inspector typing (coalesced per field focus), AI apply, restore-as-draft and discard. The stack is empty after load (Undo disabled, "Nothing to undo"), cleared on flow switch, and survives saves and publishes within the session. Undo and Redo announce the action: "Undid delete 'Polite close'" (F-FLOW-005).

---

## 15. The Flows list and creating flows

### 15.1 Purpose

`/flows` answers "which flows exist, which are live where, and which have work waiting", and is where flows are created, duplicated, renamed, archived and deleted (F-FLOW-012, F-FLOW-013, F-UX-005).

### 15.2 Layout (≥1280)

```
┌ Flows ────────────────────────────────────────────── [Import JSON…] [New flow] ┐ 56
│ 16 flows · 3 live · 1 draft                                                    │
├ All 16 │ Live 3 │ Drafts 1 │ Not published 4 │ Archived 2 ───────────────────────┤ 40
│ [Search flows by name, id or number…]  [Filter ▾]                  Sort: Last edited │ 48
├──────────────────────┬────────────────────┬─────────────────────────┬────────┬───────────┬────────────────┬───┤
│ Name                 │ Status             │ Used by                 │ Lang   │ Issues    │ Last edited    │   │ 32
├──────────────────────┼────────────────────┼─────────────────────────┼────────┼───────────┼────────────────┼───┤
│ Site-visit qualifier │ ● Live v7  Draft·3 │ ☎ +91 80 •••• 2210 · 1 batch │ अ A │ ⚠ 1 warning │ Today · Anika R. │ ⋯ │
│ EMI reminder         │ ● Live v3          │ ⌂ Workspace default    │ अ A    │ No issues │ 12 Sep · you   │ ⋯ │
│ COD confirmation     │ Not published      │ Not used               │ A      │ ⊗ 2 errors│ 3 days ago     │ ⋯ │
│ Support FAQ  🔒      │ ● Live v1          │ API                    │ त A    │ No issues │ 21 Sep 2026    │ ⋯ │
```

| Part | Spec |
|---|---|
| Header | PageHeader (N §2): H1 "Flows", meta "16 flows · 3 live · 1 draft" (Shell), actions **Import JSON…** (tertiary) and **New flow** (primary). Import creates a new flow; it never replaces an open one |
| Views | ViewTabs with CountBadges: All · Live · Drafts (live flows with unpublished changes) · Not published · Archived |
| Toolbar | SearchInput `/` (name, short id, version "v7", number suffix) · Filter menu: Used by (Inbound, Batch, Workspace default, Not used), Language, Category, Owner, Visibility · Sort Select (Last edited, Name) |
| Table | DataTable (N §7), Standard 40 px rows. Columns: **Name** (500, middle-truncated, `translate="no"`; a `lock` 14 icon with "Only me" when private; legacy duplicates show `flow_7c21` in `mono-12` after the name until renamed) · **Status** (StatusTag flow: `Live v7` success and/or `Draft · 3 changes` neutral, or `Not published` outline, `AI draft` neutral) · **Used by** (first target + "· 2 more"; icons as §5.3; "Not used" in `text-3`; FD5) · **Languages** (names, LanguageMark `name`: "Hindi, English"; no glyph tiles in a table, N §5.6) · **Issues** (the Draft's validation StatusTag; "No issues" in `text-3`) · **Last edited** (date grammar + editor) · row actions |
| Row | The name is the row link to `/flows/<id>` (Enter opens); focusable rows (N §7.9). The open flow, when coming back from the designer, is focused |
| Interim I1 tag | Before revisions ship, a flow with a device draft in this browser shows a neutral Tag **"Unpublished edits on this device"** in the Status cell (read from IndexedDB, never from the server; teammates never see it), and the Drafts view counts these flows (§4.9) |
| Row `⋯` | Open · Test… (opens the designer with the Test panel) · Rename… · Duplicate · Make workspace default… (live flows only; toast "Default flow updated · used by Cockpit, Leads and new batches · Undo", O §9.2) · Visibility ▸ Workspace / Only me · Export JSON · separator · Archive… · Delete… (`danger-text`) |

**Phone (<768):** two-line list items: name + status tag / "Used by +91 80 •••• 2210 · edited today" with the issues tag on the right; New flow in the top bar as an IconButton "New flow"; the row menu opens as an action sheet. **Tablet:** the table drops Languages and Last edited editor (kept in the tooltip).

### 15.3 New flow (`/flows/new`)

A full page in the shell (not a modal), replacing the instant template swap hidden above "Reset to default" (F-FLOW-013).

```
┌ New flow ─────────────────────────────────────────────────────────────── Cancel ┐
│ Name            [Site visit follow-up                              ]            │
│ Languages       [अ Hindi ×] [A English ×] [+]      Voice [Va Vaani ▾ ▶]         │
│ Start from                                                                      │
│ ( ) Blank            Trigger → Outcome                                          │
│ (•) Site visit       ◖Inbound → ◇Ask about a visit → □Book visit → ◗Visit booked │
│ ( ) Lead qualification · ( ) EMI reminder · ( ) COD confirmation                │
│ ( ) Appointment · ( ) Support FAQ · ( ) Describe it: [Textarea…]                │
│                                                                   [Create flow] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **Name** required and unique (async check, V5; "A flow called 'Site visit' already exists. Choose another name."). **Languages** MultiSelect; **Voice** VoicePicker compact. **Start from** is a RadioCard group (C §6.2); each template card (TemplateCard) shows a one-line purpose, a mini phase strip (glyph tiles and step names in `meta-12`, part 1 §13.1), a **Needs** line and a Preview link opening a read-only canvas sheet. "Describe it" reveals the AI draft textarea (§6.5).
- **Needs line** (`meta-12` `text-3`, computed from the workspace when the page loads): what the template uses that this workspace hasn't set up, and what happens without it: "Needs: Google Calendar · an approved WhatsApp template. Without them, visits are offered in set hours and no confirmation is sent." When nothing is missing: "Works with your workspace as it is." Blank shows no Needs line.
- **Pre-selection.** When Home's setup track opens this page from the workspace goal (Shell §13.3), it pre-selects the best-matching template **whose needs are met**; a template with unmet needs is never pre-selected over one without.
- **Create flow** persists the flow at once as a Draft ("Not published"), so every later action has a real target, and opens `/flows/<id>` with the first step selected and the Test panel hint "Test it before you publish." A template's copy uses the chosen languages.
- **Instantiation adapts the template to the workspace**, so the first-run "Publish a flow" never starts blocked by errors the author didn't make. Templates are validated in isolation in CI (§12.2), but W08, E13, E12/W01 and W02 depend on the workspace:
  - **Inbound call trigger:** bound to the workspace's only verified number that no other flow answers. With no such number, a template that also works outbound (Site visit, Lead qualification, EMI reminder, COD confirmation, Appointment) is created with an **Outbound batch** trigger instead; an inbound-only template (Support FAQ) keeps its Inbound call trigger and shows W08 ("doesn't answer any number yet"), which its Needs line announced. With several unbound numbers, the trigger is left for the author to choose (W08 until chosen). Blank follows the same rule (part 1 §13.2).
  - **Book meeting:** "Offer times from" is Set hours (workspace calling hours, IST) unless Google Calendar is connected; never a calendar default that raises W02.
  - **WhatsApp:** the confirmation checkbox is off, and a template's separate Send WhatsApp step is left out (its neighbours joined), unless WhatsApp is connected with an approved template, which is then pre-selected (no E12 or W01).
  - **Knowledge lookup:** "Search in" is All indexed sources when the workspace has at least one indexed source; otherwise **This step's Q&A** with three sample question-and-answer pairs in the flow's languages (no E13).
  - **CRM lookup:** included only when a connector exists; otherwise the template's variant without it is used.
  - **Acceptance:** in an empty workspace (no numbers, integrations or knowledge), creating every template yields **0 errors**, and at most W08 on the inbound-only template; with a number, a calendar and WhatsApp connected, 0 errors and 0 warnings.
- The Flows empty state ("Start from a template or describe the call you want.", O §15.3) links here.

### 15.4 Duplicate, rename, visibility

- **Duplicate** copies the Draft (not the versions) into a new flow named "Site-visit qualifier (copy)" (then "(copy 2)"), `Not published`, owned by you; toast "Duplicated as 'Site-visit qualifier (copy)' · Open". Ids are fresh; nothing chains "-copy-" (F-FLOW-026).
- **Rename…** is a Dialog `sm` with one Name field (unique check), also reachable from Flow settings › Identity. Renaming never touches versions or calls; History logs it.
- **Visibility**: Workspace (default) or Only me. Only-me flows show the lock, are hidden from teammates' pickers, and can't be live anywhere (§11).

### 15.5 Where a flow is live, everywhere else

Every other page that picks a flow uses FlowSwitcher (C §5.4) and shows the version the call will use: Cockpit (`call`: drafts for test calls only), Leads bulk and lead sheet (`assign`: unpublished flows disabled "Not published yet. Publish it to use it for calls."), Meetings "Uses flow", Phone setup's number binding, and Call reports filters. "Active flow (from profile)" and "Default flow" are replaced by the flow's name: "Workspace default · Site-visit qualifier v7" (F-FLOW-014, F-UX-005).

---

## 16. The Outline, and keyboard and screen-reader operability

### 16.1 Purpose and placement

The Outline is a **complete, non-spatial editor** of the flow at ≥ 1024: everything the canvas can do except drawing positions (L12). It is the accessible alternative to the canvas (F-A11Y-001, F-A11Y-028, digest A8) and a desktop side panel for large flows. Below 1024 the same `FlowOutline` renders with `readOnly`: the left column of tablet Review mode and the phone page. There the navigation keys, type-ahead, `Enter` (opens the read-only step sheet) and issue badges work; `F2`, `A`, `C`, `Delete`, `Alt+↑/↓` and the editing items of the row menu are not rendered (`05-responsive` §10.6 is the capability matrix).

| Width | Where | Editing |
|---|---|---|
| ≥1024 | Left panel, `--size-left-panel` 280 (part 1 §3.1), toggled with **Outline** in the tool rail, the Problems bar or `O`; shares the slot with Add step, Variables and Version history; opens docked for flows over 20 steps at ≥ 1280 (part 1 §9.2) | Full (§16.3) |
| 768–1023 | Left column of Review mode, `--size-left-panel-tablet` 320, always shown, tabs Outline · Problems (§21) | `readOnly` |
| <768 | The main view of `/flows/<id>` | `readOnly` |

### 16.2 Structure: nested by branch

```
┌ Outline ───────────────────── [Filter steps…] ┐
│ ◖ Inbound call · +91 80 •••• 2210             │
│ □ Greeting                                    │
│ ◇ Ask about a site visit               ⚠ 1   │
│   ▾ Yes                                        │
│     □ Book site visit                          │
│       ▾ Booked                                 │
│         ◗ Visit booked · Lead → Interested     │
│       ▾ Not booked                             │
│         ↪ Go to #9 Polite close                │
│   ▾ Later                                      │
│     □ Schedule callback                        │
│     ◗ Callback set · Lead → Callback due       │
│   ▾ No                                         │
│     □ Polite close                             │
│     ◗ Not interested                           │
│   ▾ No reply ┄                                 │
│     ⚠ Not connected · Connect…                 │
│ ◖ Outbound batch                               │
│   ↪ Go to #2 Greeting                          │
│ Not connected to a trigger (1)                 │
│ □ Send brochure                        ⊗ 2    │
│ [+ Add step]                                   │
└───────────────────────────────────────────────┘
```

- **Order** is call order: depth-first from the first Trigger, answers in their listed order. The same order drives canvas arrow navigation and the "step 3 of 14 in call order" part of each accessible name. Steps show their **stable** numbers (`#9`, part 1 D7: assigned at creation, never reused, unchanged by edits, Tidy, reordering or publishing), so the numbers in the Outline are not consecutive and that is expected.
- **Linear chains stay flat:** a step with one output is followed by its next step at the same level; nesting happens only under answers, cases and Found/Not found, so "If Yes → Book site visit → Visit booked" reads as one indented run (D §1.3 graft).
- **Merges and loops never repeat:** a step reached by more than one path is written in full once (its first occurrence) and elsewhere as a reference row "↪ Go to #9 Polite close" that selects it.
- **Unreachable steps** are grouped at the end under "Not connected to a trigger (n)".
- **Rows** (`OutlineRow`, part 1 §20.1): step rows show the 24 px glyph tile, label (`data-13`/500, `translate="no"`), `#n`, the phase line on hover and focus ("Logic · Question"), an issue badge (icon + count), a reached mark after tests, and for Outcomes the plain status line "Lead → Interested" (the same sentence as the canvas, not a tag). Answer rows show the answer label (`label-13`), its examples in `meta-12` `text-3`, and either the child steps or "⚠ Not connected · Connect…". The fallback answer carries a small dashed rule glyph, echoing its canvas edge.
- **Filter** (SearchInput `sm`, synonyms as the palette): matches labels, prompts and variables; non-matching rows collapse into "3 hidden" lines, keeping context.

### 16.3 Editing from the Outline

| Key (focus on a row) | Does |
|---|---|
| `↑` / `↓` | Previous / next visible row |
| `→` / `←` | Expand, or move to the first child / collapse, or move to the parent |
| `Home` / `End`, type-ahead | First / last row; jump by label |
| `Enter` | Open the step in the inspector (focus on Label); on a reference row, go to the step |
| `F2` | Rename the step inline (Enter saves, Esc cancels) |
| `A` | Add a step after this step, or at this answer: the palette opens as a popover; the new step is inserted, connected and focused |
| `C` | On an answer row or a single-output step: **Connect to…** (§16.4) |
| `Delete` | Delete the step (Undo toast, §14.1); on an answer row, remove its connection |
| `Alt+↑` / `Alt+↓` | Move a step within a linear chain (swaps it with its neighbour and rewires the chain; one undo step). Disabled on Logic steps and at chain ends, with the reason in the row menu |
| `Shift+F10` or the context key | Row menu: Open · Add step after… · Connect to… · Duplicate · Move up · Move down · Delete step |

Every edit announces its result politely: "Added Speak after Greeting, step 3", "Connected Yes to Book site visit", "Yes now goes to Book site visit instead of Polite close", "Deleted Polite close. Press Control Z to undo."

**ARIA.** `role="tree"` labelled "Flow outline, Site-visit qualifier"; rows are `treeitem`s with `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded`; `aria-selected` mirrors the canvas selection. A step row's name is the step's full label from §16.5 ("#3 Ask about a site visit, Logic, Question, 1 warning"). Answer rows: "Answer Yes, goes to Book site visit" or "Answer No reply, not connected".

### 16.4 Connect to…

A Combobox popover (C §5.3) opened by `C` on a focused step or socket (canvas), answer row (Outline or inspector), or the step's `⋯`. Title "Connect 'Yes' to…". Options: "New step…" first, then steps grouped by phase with glyph, label and "step 5"; the current target is marked "(current)"; steps that would create a loop without an exit are listed with the hint "Creates a loop". Choosing connects (replacing any current target), closes, returns focus to the origin and announces the result. "Disconnect" is the last option when a target exists. Search matches label, step number ("5") and synonyms.

### 16.5 The canvas keyboard contract (with part 1)

**The key map is `06-accessibility` §9.6**, the only canvas key map; this section and part 1 §11 reference it and restate no keys. What this part owns in it:
- **`C` Connect to…** (§16.4) and **`A` add after** (part 1 §8.4) from a step, a socket, an Outline row or an inspector answer; **Delete** with Undo (§14.1); **Enter / F2** open the inspector with focus in Label, **Esc** returns to the step (§7.1).
- **Issues:** Alt+. / Alt+, walk the issues (§12.4). Alt+Arrow always means move (part 1 §10.4, the Outline §16.3, the answer and case lists §7.7, §9).
- **Names:** the step name, the socket names and the one instruction string are defined in 06 §9.6; step names begin with the stable number and title and then give the call-order position ("#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: …"). Connections are named from labels, never ids: "Ask about a site visit, answer Yes, to Book site visit" (F-FLOW-011).
- **Structure:** steps are `role="group"` with `aria-roledescription="step"` inside the canvas `<section>` (no `role="application"`, 06 §6.1); the minimap is `aria-hidden="true"` (it duplicates the Outline); sockets are focusable only within a focused step, 24 px hit area, 44 on coarse pointers (D §6.5).
- **Single-key shortcuts** are registered in 06 §8.2 and obey the switch; each command also has a visible button (P5).

---|---|
| `Tab` | Enter the canvas at the first Trigger; the canvas is one tab stop with a roving tabindex (F-A11Y-028) |
| `→` / `←` | Follow the first output / go back along the incoming connection |
| `↑` / `↓` | Siblings in the same rank, or answer rows (sockets) of a Logic step |
| `Enter` / `F2` | Open the inspector, focus Label; `Esc` returns to the step |
| `C` · `A` · `Delete` | Connect to… · Add step after · Delete with Undo |
| `⌘/Ctrl+D` · `⌘/Ctrl+F` · `⌘/Ctrl+Z` / `⇧⌘Z` | Duplicate · Find · Undo / Redo |
| `O` · `V` · `T` · `?` | Outline · Variables · Test panel · Shortcuts sheet (a Dialog `lg`, focus moved in, grouped Edit · Select · Navigate · View · Test, platform-correct modifiers; F-FLOW-024, F-A11Y-027) |
| `F6` | Cycle header → canvas → inspector → Problems bar |

- **Step names:** "#3, Logic, Question: Ask about a site visit. Answers: Yes goes to Book site visit; Later goes to Schedule callback; No goes to Polite close; No reply is not connected. 1 warning." Steps are `role="group"` with `aria-roledescription="step"`; instructions ("Enter to edit, C to connect, A to add a step after") in one shared `aria-describedby` node.
- **Connections:** named from labels, never ids: "Ask about a site visit, answer Yes, to Book site visit" (F-FLOW-011).
- **Minimap** `aria-hidden="true"` (it duplicates the Outline). Sockets are focusable only within a focused step (arrow keys), 24 px hit area, 44 on coarse pointers (D §6.5).
- **Single-key shortcuts** (`A`, `C`, `O`, `V`, `T`, `?`) are ignored while typing and can be turned off in the account menu; each command also has a visible button (P5).

---

## 17. State matrix

| Surface | State | Treatment and copy |
|---|---|---|
| Designer | Loading | Canvas skeleton (O §13.2): header with the flow name if known, chips hidden, four static silhouettes; editing and autosave off until hydrated (F-FLOW-037) |
| Designer | First use (blank flow) | Part 1 §13.2, the one design: a Trigger (per the workspace rule of §15.3) **connected** to an End with outcome (neutral tile, "Choose what this call records"), a "+" on the connection and the empty-state card "What happens when the call connects?" with Add Speak · Add Question · All steps. Issues chip **"No issues"** (or the warning "Choose what this call records" if the Q2 rule for an unset outcome ships; never an error before the author has done anything) |
| Designer | Partial | An integration status can't load: its row reads "Couldn't check Google Calendar · Retry"; rules that depend on it are marked "not checked" in the Problems list; Publish's check row is `unknown` (blocking with Retry) |
| Designer | Save failed · offline · conflict | §4.3 chip states, §4.6, §4.7 |
| Designer | Not found | NotFound in the shell: "This flow was deleted, or the link is wrong." · Go to Flows |
| Designer | Private flow (not yours) | Forbidden: "This flow is private to Rohit S." · Go to Flows |
| Designer | View only (FD12) | `View only` tag; inspector fields read-only; Publish hidden; "Duplicate to edit"; Test works (text and browser voice) |
| Designer | Viewing a version | §6.2 |
| Designer | Success | "Saved 11:24 am"; after publish, `Live v8` and the toast (§5.7) |
| Inspector | Nothing selected | Closed |
| Inspector | Field invalid | Field error; step marked; value not committed (§7.1) |
| Flows list | Loading | Table skeleton with real headers; pager "Loading…" (O §13.2) |
| Flows list | First use | "Start from a template or describe the call you want." · New flow |
| Flows list | No results / filtered | "No flows match 'kisan'. Search covers names, ids and numbers." · Clear search / "No flows match Live in Tamil." · Clear filters |
| Flows list | Error | PageError: "Flows couldn't load. Your flows are safe." · Retry |
| Flows list | Archived view empty | "Archived flows appear here. Archive a flow from its ⋯ menu." |

---

## 18. Interactions and shortcuts (this part's surfaces)

| Key or gesture | Where | Does |
|---|---|---|
| `⌘/Ctrl+Enter` | Publish gate, Call gate | Confirm when enabled |
| `]` / `[` · `Esc` | Compare mode | Next / previous change · exit (the shell's `[` is suppressed in the designer) |
| Canvas keys, issues (Alt+. / Alt+,), `T` | Designer | **06 §9.6**; not restated here |
| `Enter` | Test composer | Send as the caller; `Shift+Enter` new line |
| `Alt+↑/↓` | Answer editor, case list, Outline | Move the item (Alt+Arrow means move everywhere) |
| Drag handle | Answer editor, case list | Reorder by pointer (keyboard equivalent above) |
| `/` | Flows list | Focus search |
| `Enter` | Flows list row | Open the flow |
| Palette (`⌘K`) actions | Anywhere | "Publish v8…", "Test this flow", "Compare with live", "Version history", "New flow", "Go to flow: …" |

No single key publishes, rolls back, discards or dials; each opens its gate or dialog. The `?` sheet lists these under "Publish and test".

---

## 19. Microcopy: before and after

| Where | Before (today) | After |
|---|---|---|
| Save chip | "Up to date" (always) | "Saved 11:24 am" · "Unsaved changes" · "Saving…" · "Couldn't save · Retry" · "Not saved yet" |
| Validation badge | "● FLOW VALIDATED" | "No issues" · "1 warning" · "2 errors · 1 warning" |
| Validate panel title | "2 FLOW VALIDATION ERRORS" | "Problems · 2 errors · 1 warning" |
| Error message | `Node "node_1790420966396" is not connected to any previous step.` | "#7 Speak can't be reached from any trigger." |
| Error message | `Question "Confirm Location" must have both YES and NO connections.` | "#6 Confirm location: answer 'No' isn't connected." |
| Primary action | "ACTIVATE" (green, glow) · "Save" | "Publish v8…" (one Neel button); no Save |
| ACTIVATE tooltip | "Activate this flow for all your calls" | Publish gate "Where it goes live" lists the actual numbers, batches and defaults |
| Disabled reason | "Save the flow first to activate it" (native tooltip) | "Fix 2 errors to publish." · "Nothing to publish. Your draft matches Live v7." (visible, `aria-describedby`) |
| Private | "Private" (static-looking pill) | Visibility: "Workspace" · "Only me" |
| More menu | "Export JSON · Import JSON · New flow · Reset to default" | ⋯ (part 1 §3.3 plus this part's items): Preview agent script · Describe a change… · Replace draft with a template… · Duplicate flow… · Export JSON · Import JSON… (always as a new flow) · Keyboard shortcuts · Flow settings · separator · Delete flow… (New flow lives on `/flows`) |
| Page title | "Flow Builder / VOICE JOURNEY WORKSPACE" | Breadcrumb "Flows / Site-visit qualifier" |
| Palette header | "Add steps / PICK A TOOL, THEN CONNECT IT" · "+ 10" | "Add step" (part 1) |
| Panel title | "SPEAK NODE" · "SCHEDULE NODE" · "LIVE LOOKUP" | Phase line "Action · Speak" + the step's label (registry names, §7.2) |
| Panel fields | "ID: node_1790…" · "Position: x=332, y=330" | Advanced › Step id (copyable); position removed |
| Panel delete | "Delete Node" (full-width red) | ⋯ › Delete step (Undo toast) · footer "Done" |
| Question outputs | "YES ↓" / "NO →" · "YES — connects from bottom handle" | Answer rows "Yes · haan, zaroor · हाँ" with "Go to [step ▾]"; "No reply · after 6 s" |
| Branch | "Condition Check" · "TRUE ↓ / FALSE →" | "Branch" with named cases and "Else" |
| Transfer helper | "E.164 format. Leave blank to use context." · "Must start with country code (e.g. +91)" | "Include the country code, like +91 98765 43210." |
| CRM lookup note | "Calls the operator's live API for ONE record (no embeddings). On no_match…" | "If no record matches, the agent says so and never guesses." |
| FAQ note | "Answers are served only through search_knowledge_base…" · "materialized" | Knowledge lookup › "This step's Q&A": "The agent answers from these when a caller asks." |
| Verify helper | "Green handle = VERIFIED, red handle = FAILED — wire FAILED to an End Call or Handoff node." | Outputs "Verified · Not verified · No reply", each with Go to |
| Schedule | "AVAILABLE TIME SLOTS (OPTIONAL) Mon-Fri 9am-5pm…" | "Offer times from: Google Calendar free time · Set hours" |
| Flow settings | "Soul.md · PER-FLOW" · "SPEECH WINDOW 8 · MEDIUM SCORE 0.7 · HIGH SCORE 0.86" · "lookup_record, send_email, send_whatsapp" | "Agent instructions" · "Listen for 8 s of speech" · bands "Verified 0.86 and above · Confirm 0.70 to 0.86" · "Look up a customer record · Send email · Send WhatsApp" |
| AI draft | "Generate a flow with AI" · "Generated nodes replace the canvas as a private draft" | "Describe a change…" · "Proposed: 6 added · 2 changed · Apply to draft · Discard" |
| Preview | "AI SCRIPT PREVIEW / --- SYSTEM INSTRUCTION PREVIEW ---" · "Close Preview" | Flow settings › Advanced › "What the agent is told" · Copy |
| Delete feedback | (nothing) | "Deleted 'Polite close' and 2 connections · Undo" |
| Undo announcement | "Undone." | "Undid delete 'Polite close'" |
| Switcher modal | "ALL FLOWS" · NAME / CATEGORY / LAST EDITED / OPEN | `/flows`: Name · Status · Used by · Languages · Issues · Last edited |
| Version naming | "Sample Realty (v2) · 9115a2" | "Sample Realty follow-up · Live v3" (+ `flow_7c21` only for legacy duplicates) |
| Meeting Agent option | "Active flow (from profile)" | "Workspace default · Site-visit qualifier v7" |
| Leaving with a failed save | (nothing; edit lost) | "Leave with 2 unsaved edits? They stay on this device and come back when you reopen this flow." |

---

## 20. Accessibility

- **Keyboard (2.1.1 A):** every authoring action works without a pointer: open (Enter), connect (`C`, Go to selects), add (`A`, Go to "New step…"), reorder (`Alt+↑/↓`), delete (Undo), publish, roll back, test. A Playwright keyboard-only test builds a 3-step connected flow, publishes it and rolls it back (F-A11Y-001).
- **Focus (2.4.3, 2.4.7, 2.4.11):** graph tab order; the inspector, gate, sheets and Shortcuts dialog receive focus and return it to their trigger (O §1.3; F-A11Y-027); focused steps use `--focus-offset-node`; nothing sticky covers a focused field (`scroll-padding` on the inspector body for its 56 px header and 48 px footer).
- **Names (4.1.2, 2.4.6, 1.1.1):** steps and connections are named from labels (§16.5); icon buttons have names and tooltips ("Insert variable", "Previous issue"); tokens in PromptField are read as text ("lead name variable") through a visually hidden description; no raw ids in any accessible name (F-A11Y-028).
- **Labels (1.3.1, 3.3.2):** every inspector field uses Field (C §3.1); the answer editor's inline inputs are labelled "Answer 2 label" / "Answer 2 examples"; condition rows "Case 1 variable / operator / value".
- **Errors (3.3.1, 3.3.3):** field errors say how to fix; the ProblemsPanel and gate link to the field; server errors map to the same messages.
- **Status messages (4.1.3):** save failures are assertive once; counts, publishes, deletes, test steps are polite and throttled; nothing is announced per keystroke or per timer tick (O §1.8).
- **Contrast (1.4.3, 1.4.11):** all text pairs from tokens pass in both themes (F §3.8); step borders, sockets, token borders and the dashed fallback edge are ≥ 3:1 on `--canvas`; badges pair icon and number with the step's accessible text (F-FLOW-007, F-A11Y-019).
- **Colour is never alone (1.4.1):** Added / Changed / Removed carry Tags; diff text uses strike-through and underline; errors and warnings use distinct icons; Live has a word.
- **Targets (2.5.8):** sockets 24 px hit area (44 on coarse pointers), drag handles 24, IconButtons ≥ 24 (44 on touch) (F-FLOW-020).
- **Dragging alternatives (2.5.7):** every drag (reorder, connect) has a keyboard and single-pointer alternative (menus, Go to selects).
- **Motion (2.3.3):** the test trace is the only movement and is skipped under reduced motion; no edge animates at rest (F-FLOW-011).
- **Language (3.1.2):** answer examples, prompts and turns carry `lang`; flow names and variables `translate="no"` (digest A9).
- **Forced colours:** step error and warning borders, sockets, answer rows, diff tags and the Draft chip remain visible (`data-mark`, `ButtonBorder`, `Highlight` for selection; base.css).
- **Zoom and reflow (1.4.10):** the layout reads the CSS width, so zoom picks the mode (`05-responsive` §2.4, §8.3): 200% on a 1920 × 1080 screen (960 CSS px) is Review mode; 200% on 1440 or 1280 screens (720 or 640 CSS px) and 400% anywhere is the phone Outline. Nothing is clipped in any of them; `/flows` reflows to list items.

---

## 21. Responsive behaviour

### 21.1 Desktop ≥1440 (the reference)

Rail · Outline or Variables (optional, 280) · canvas · inspector (320 to 480) docked; Test panel docked bottom (280); Problems bar 32. Publish gate modal from the right (640). History opens in the left panel (§6.1). At 1440×900 with the inspector open and the Test panel closed, the canvas keeps at least 60% of the viewport width (part 1 budget).

### 21.2 Laptop 1024–1439

```
1280 × 800, inspector open (overlay at 1024–1279; docked at 1280–1439)
┌ Flows / Site-visit qualifier  Draft·3 ▾  ✓ Saved  ● Live v7 ── ⚠1 [Test] [Publish v8…] ⋯ ┐ 48
├ Trigger 2 → Logic 1 → Action 3 → Outcome 4        Live v7 answers +91 80 •••• 2210 …      ┤ 40
├──┬────────────────────────────────────────────────────┬───────────────────────────┤
│+ │  canvas (the selected step is panned into the part  │ Inspector 320 (overlay at │
│☰ │  not covered by the inspector)                      │ 1024–1279: e3, no scrim,  │
│{}│                                                     │ canvas still interactive) │
├──┴────────────────────────────────────────────────────┴───────────────────────────┤
│ ⚠ 1 warning  Book site visit: template pending approval  Go to step   Outline  Test │ 32
└──────────────────────────────────────────────────────────────────────────────────────┘
```

- The Outline and the inspector never both dock below 1280: opening one overlays the other's side.
- The Test panel opens at 240 px; with the inspector open it overlays the canvas bottom only.
- Header: below 1280, "Tidy" and the issue sentence collapse into icons with names; `Publish v8…` and `Test` never collapse (F-RWD-003).

### 21.3 Tablet 768–1023: Review mode

```
768 × 1024   (part 1 §3.2 is the design; capabilities: 05-responsive §10.6)
┌ ☰  Site-visit qualifier                             [₹2,340]   ⌕ ┐ 52 TopBar (shell)
├ [Draft · 3 changes ▾] [● Live v7]  [⚠ 1 warning] [Test] [Publish v8…] ⋯ ┤ 48 flow header
├ ⓘ Editing steps needs a screen at least 1024 px wide. You can review,  ┤
│   test and publish here.                                                 │ Notice
├ Outline · Problems 1 ────────┬──────────────────────────────────────────┤
│ Outline (320)                │ read-only canvas (pan, pinch, select)    │
│ ◖ Inbound call               │                                          │
│ □ Greeting                   │                                          │
│ ◇ Ask about a site visit ⚠1  │                                          │
│   ▾ Yes → □ Book site visit  │                                          │
│ …                            │ [− 60% +] [Fit]                          │
└──────────────────────────────┴──────────────────────────────────────────┘
```

- Selecting a step opens a read-only full-height sheet (non-modal) with its fields, answers and their Go to targets, issues, and the footer "Edit this step on a screen at least 1024 px wide. Your draft is safe." + Copy link.
- Test, Compare with live, Version history (sheet), Restore as draft, Roll back and Publish all work; the header's Test and Publish are pinned right and never clip (F-RWD-003).
- Problems appear as a tab in the Outline column ("Outline · Problems 1").

### 21.4 Phone 320–767

```
390 × 844, /flows/<id>   (part 1 §3.2 is the design; one phone layout everywhere)
┌ ‹ Flows  Site-visit qualifier [₹2,340] ⌕ ┐ 52 TopBar (shell)
│ [Draft · 3 changes ▾] [● Live v7]     │
│ [⚠ 1 warning] (opens Problems)      ⋯ │ chip row; ⋯ = flow actions
│ [   Outline    |    Canvas     ]      │ 44
├───────────────────────────────────────┤
│ ◖ Inbound call · +91 80 •••• 2210  #1 │ 48 rows
│ □ Greeting                         #2 │
│ ◇ Ask about a site visit      ⚠ 1  #3 │
│   ↳ If Yes → Book site visit →        │
│     Visit booked · Lead → Interested  │
│   ↳ If Later → Schedule callback →    │
│     Callback set                      │
│   ↳ If No reply ┄ Not connected       │
├───────────────────────────────────────┤
│ [▷ Test]              [Publish v8…]   │ 56 sticky, above the BottomBar
├───────────────────────────────────────┤
│ Cockpit  Leads  Reports  Flows  More  │ 56 BottomBar
└───────────────────────────────────────┘
```

- The Outline (nested by branch, 48 px rows, chains wrapped as sentences) is the page. A step opens a full-screen read-only sheet (Back returns to the row).
- Test is the full-screen test (text and browser voice; "Call my phone…" stays in the Cockpit on phones, §13.6); Publish is the full-screen gate; the `⋯` at the end of the chip row holds Version history, Compare with live, Roll back to v7…, Discard draft changes…, Flow settings (read-only). The TopBar is the shell's phone TopBar (Back, title, wallet chip, Search), unchanged.
- With a clean draft the sticky bar keeps Test and Publish; Publish is `aria-disabled` with "Nothing to publish. Your draft matches Live v7." (§4.3), so focus can return to it after a publish.
- `/flows` is a list of two-line items; New flow opens `/flows/new` as a single column.
- Nothing edits steps below 1024 in v1 (D §6.5 responsive table); the Canvas view is the read-only canvas at Fit, never a squeezed editor.

---

## 22. Telemetry (optional, privacy-safe)

No prompt text, transcript text, variable values, lead names or phone numbers are sent; ids and counts only.

| Event | Properties | Question it answers |
|---|---|---|
| `flow_opened` | flowId, hasDraftChanges, issueCounts, width bucket | Does opening still write? (must be zero PUTs; alert on any) |
| `draft_save` | result (ok, error, conflict, offline), latencyMs, retries | Are saves reliable? |
| `conflict_resolved` | choice (theirs, copy, mine) | How often do teammates collide? Is presence needed? |
| `validation_changed` | errors, warnings, ruleIds (top 5) | Which rules fire most; which templates fail |
| `issue_go_to` | ruleId, surface (bar, panel, gate, inspector, outline) | Which surface people use to fix |
| `publish_gate_opened` | errors, warnings, tested (bool), targets | How often is Publish blocked, and by what |
| `publish_completed` | version, warningsAcked, testSkippedReason, targets, msFromGateOpen | Are people skipping tests? For what reason? |
| `publish_failed` | status (422, 409, network), serverOnlyRuleIds | Client/server rule drift |
| `rollback` / `restore_as_draft` / `discard_draft` | fromVersion, toVersion, draftReset | How often do changes go wrong? |
| `test_run` | mode, revision (draft, live, version), reachedOutcome, steps, turns, stoppedAtRuleId | Is testing used before publishing? |
| `step_deleted` / `undo` | count, viaKey (bool), undone within 10 s | Accidental deletes (undo rate) |
| `connect` | via (drag, go-to select, C, outline) | Adoption of keyboard wiring |
| `variable_inserted` | via (picker, typed), unknownCorrected (bool) | Is the picker preventing E11? |
| `flows_list_action` | action (duplicate, rename, archive, delete, default) | List management usage |

---

## 23. Acceptance criteria

**Lifecycle and saving**
- [ ] Opening `/flows/<id>` and idling 30 s sends zero PUT/PATCH/POST requests (network log).
- [ ] Hydration, fit view, selection, zoom, pan, theme change and panel resizing never change the save chip from "Saved …" and never write.
- [ ] Editing a prompt autosaves to the Draft only; a real call started during the edit uses Live v7 (server log shows the version).
- [ ] With the save request blocked, the chip reaches "Couldn't save · Retry" within 3 retries, an error toast appears once, the `<title>` starts with "Couldn't save", Publish is disabled with its reason, and navigating away asks first.
- [ ] Navigating away 0.4 s after an edit still saves the edit (keepalive flush).
- [ ] Two tabs editing the same draft: the second save gets 409 and the conflict sheet; no silent overwrite.
- [ ] The Draft chip shows the number of changed steps and settings, not the number of edits.
- [ ] **Interim I1:** with revisions off, 20 edits send zero network writes until Publish in the gate; with IndexedDB blocked, the chip reads "Not saved · this tab only" (danger), closing the tab asks first, and Publish still works.
- [ ] **Interim I1, two browsers:** A keeps a device draft while B edits and publishes; A's Publish gate shows the blocking "published from another browser" row, lists only A's changes against the fresh server copy, and can't publish until A re-applies on top (conflicts resolved per step) or discards. B's content is never silently overwritten; `/flows` in A shows "Unpublished edits on this device" on that flow.

**Publish, history, roll back**
- [ ] Publish is the only Neel button in the header; ACTIVATE and Save no longer exist.
- [ ] With 1 error the gate's primary is disabled and its why-text names the fix; the server returns 422 if the client is bypassed.
- [ ] With 1 warning the primary stays disabled until the warning is ticked, then reads "Publish with 1 warning".
- [ ] "Not tested since your last change" can be skipped only with a reason, which appears on the version in History.
- [ ] "Where it goes live" lists every number, batch and default using the flow; nothing is listed that the server didn't return.
- [ ] After publishing, the header shows `Live v8`, the Draft chip is gone, the toast offers "Roll back to v7…", and Call reports record v8 on new calls.
- [ ] Roll back publishes v7's content as v9; v8 remains in History; calls placed on v8 still show v8.
- [ ] Restore as draft never changes Live.

**Validation**
- [ ] Every rule in §12.2 has a unit test with its message; the same package runs on the server.
- [ ] Issues recompute within 300 ms of an edit and are cleared when switching flows (reproduce F-FLOW-010's stale list: must not occur).
- [ ] No message or accessible name contains a raw node id.
- [ ] Every New flow template has 0 errors and 0 warnings in isolation, and its compiled instruction has no "undefined" or "null" (CI).
- [ ] In an empty fixture workspace (no numbers, integrations or knowledge), creating every template through `/flows/new` yields 0 errors and at most W08 (Support FAQ only); each TemplateCard's Needs line matches what is missing; Home's goal pre-selection never picks a template with unmet needs over one without.
- [ ] A blank flow opens with its Trigger connected to its Outcome and the issues chip at "No issues".

**Inspector, variables, conditions, voice**
- [ ] Typing "abc" in a transfer number shows the error on blur and the canvas still shows the last valid number; the step is marked invalid.
- [ ] Attempts 999 shows "Enter a number from 1 to 5." and is not committed.
- [ ] Typing `{{` opens the picker; `{{lead_nmae}}` is marked and E11 offers the correction.
- [ ] A Branch with cases evaluates top to bottom; "Try values" shows the case a sample takes; an empty value goes to Else.
- [ ] Choosing a voice that can't speak a flow language raises E16.
- [ ] Integration-dependent toggles are disabled with a reason when the integration isn't connected; none default to on.
- [ ] There are no ID or Position boxes, no text below 12 px and no uppercase mono labels in the inspector.

**Test**
- [ ] A text test on the Draft never sends WhatsApp, books meetings, transfers or writes lead status; each simulated action says so.
- [ ] The canvas marks the current step and reached steps; with reduced motion, no trace animates.
- [ ] "Call my phone" opens the Call gate and can only call the user's verified number.

**Deletion**
- [ ] Deleting a connected step shows "Deleted '…' and n connections · Undo"; Undo restores the step and its connections; the inspector closes and focus moves to the previous step.
- [ ] Undo is disabled right after load; adding then undoing restores the step count (F-FLOW-005 regression).
- [ ] Deleting a flow that answers a number requires the typed name and a replacement flow for that number.

**Flows list**
- [ ] `/flows` shows Status, Used by and Issues for every flow; sorting defaults to last edited, newest first.
- [ ] Creating a flow asks for a unique name and a starting point, persists it as `Not published`, and opens it.
- [ ] Duplicate produces "(copy)", fresh ids and no live version.

**Keyboard, screen readers, responsive**
- [ ] Keyboard only: build Trigger → Question (2 answers + No reply) → 2 Outcomes, publish, roll back (Playwright).
- [ ] In the Outline, `A`, `C`, `F2`, `Delete` and `Alt+↑/↓` work and announce their results; Alt+. and Alt+, move to the next and previous issue from anywhere in the designer outside a text field.
- [ ] Tab order on the canvas follows graph order from the first Trigger.
- [ ] At 768–1023 Test and Publish are visible and usable at every width (F-RWD-003); at 390 the Outline, text test and Publish gate work without horizontal scroll.
- [ ] axe reports no violations on the inspector, Publish gate, Test panel, ProblemsPanel, Outline and `/flows` in both themes.

---

## 24. New components needed

Not defined in `02-components-*` or earlier page specs. Build after the overlay group (O §20) and the Gate group (`spec/02-components-gate.md` §7). **Names follow the registry in part 1 §20.1**, the one list of Flow Designer component names; this table adds the props this part needs.

| Component | Built on | Props sketch |
|---|---|---|
| **StepInspector** (+ `InspectorSection`) | Sheet `inspector`, PanelTabs, Field | `step`, `registryEntry`, `tab`, `onTab`, `issues`, `readOnly`, `liveVersion` |
| **IntegrationStatusRow** | ServiceMark `sm` (06-settings §14), StatusText, link | `service: 'calendar' \| 'whatsapp' \| 'crm'`, `status: 'connected' \| 'disconnected' \| 'unknown'`, `connectHref`, `onRetry` |
| **PromptField** (+ `VariableToken`, `VariablePicker`) | Textarea (C §3.6) + mirrored highlight layer, Combobox | `value`, `onChange`, `variables: VarDef[]`, `availableAt: stepId`, `sample: Record<string,string>`, `languages`, `onHear()`, `maxLength` |
| **VariableField** | TextInput with affix + Combobox | `value`, `captured: VarDef[]`, `onRename(scope: 'all' \| 'here')` |
| **AnswerEditor** (+ `AnswerEditorRow`: grip handle, label + examples, Go to; the canvas owns `AnswerRow`) | TextInput `sm`, token input, GoToSelect | `answers: {id,label,examples[],target?}[]`, `fallback: {kind:'no-reply'\|'else', seconds?, target?}`, `max: 8` |
| **GoToSelect** | Select (C §5.2) | `steps: StepSummary[]`, `value`, `onChange`, `onNewStep()` |
| **ConditionBuilder** (+ `ConditionCase`, `ConditionRow`, `TryValues`) | Combobox, Select, NumberInput, DatePicker, SegmentedControl | `cases`, `else`, `variables`, `onChange`, `sample` |
| **ProblemsPanel content** and **IssueRow** (the ProblemsBar slot, the panel container and the IssuesChip are part 1 §3.4; every name is in the part 1 §20.1 registry) | StatusText, SegmentedControl, buttons | `issues: Issue[]`, `current`, `onGoTo(issue)`, `filter` |
| **PublishGate** (specified in G §5.2; this part adds DiffList and TargetList) | Sheet `gate` + GateChecklist / GateCheckRow + DiffList + TargetList + Textarea | `mode: 'publish' \| 'rollback'`, `fromVersion`, `nextVersion`, `checks`, `changes`, `targets: UsedBy[]`, `onPublish({note, ackedWarnings, skipTestReason, resetDraft?})` |
| **DiffList** (+ `ChangeRow`, `FieldDiff`) | list rows, Tag | `changes: {kind:'added'\|'changed'\|'removed'\|'settings', stepId?, label, summary, author}[]`, `onShow(change)` |
| **CompareBar** | 40 px bar, ghost buttons | `against: 'live' \| number`, `counts`, `onPrev`, `onNext`, `onExit` |
| **VersionHistory** (+ `VersionRow`), in the left panel | Timeline (N §10) as a listbox | `draft`, `versions: {n, liveFrom, liveTo?, author, note?, tested?, calls?}[]`, `onAction(n, action)` |
| **ConflictSheet** | Sheet `gate`, RadioCard | `theirs: {author, at, changes}`, `mine: {changes}`, `canReplace`, `onResolve(choice)` |
| **TestPanel** (+ `QuickReplies`, `CapturedList`, `PathList`, `RunSummary`) | TranscriptFeed / TurnRow, SegmentedControl, Composer, KeyValueList | `mode`, `revision`, `startAt`, `sample`, `run`, `onReply(text \| answerId)`, `onRestart` |
| **FlowOutline** (+ `OutlineRow`); one component with part 1 §12.3 | RAC Tree or a tree pattern with roving tabindex | `graph`, `selection`, `filter`, `onCommand(cmd, target)` |
| **ConnectToPopover** (shares its list with part 1's StepPicker, §8.4) | Combobox (C §5.3) | `origin: {stepId, outputId?}`, `steps`, `onConnect(targetId)`, `onDisconnect()` |
| **LiveNote** | text + link | `live`, `usedBy`, `draftChanges` |
| **TemplateCard** (+ `PhaseStrip`) | RadioCard | `template: {id, name, purpose, steps: {phase, label}[]}`, `needs: string[]` (computed from the workspace, §15.3), `recommended` |
| **VariablesPanel** | SearchInput, list rows | `variables: VarDef[]`, `onFind(name)`, `onSample(name, value)` |

Hooks: `useFlowRules(graph, ctx)` (Web Worker above 60 steps), `useSaveMachine` (O §18.4) with the designer's timing and the `device` / `volatile` statuses, `useDraftStore` (interim I1 with its base `updated_at` and hash, the three-way re-apply, and the offline queue, IndexedDB), `useFlowHistory` (the undo stack), `useTestRun(revision)`.

**Tokens** (registered in 01-foundations §18, in `tokens.json` 1.1.0): `--size-test-panel` 280 px (Test panel default height) and `--size-compare-bar` 40 px. The left panel width is `--size-left-panel` (part 1 §20.2). Compare mode uses the diff role aliases `--diff-added-*`, `--diff-changed-*` and `--diff-removed-*` (foundations §3.9); no new colours and never the selection tint.

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
