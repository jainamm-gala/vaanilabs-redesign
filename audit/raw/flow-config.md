# Flow Builder: node configuration, validation and lifecycle (raw audit)

**Agent:** va-flow-config · **Product:** https://vaanilabs.in/flow-builder (live production, signed-in customer account) · **Date:** 2026-09-26 · **Viewport:** 1440x900 (plus a 1024x768 spot check)
**Screenshots:** `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-flow-config/`
**Browser status:** ok. The session stayed valid for the whole run, and I closed my private window at the end.

> Method note: all work ran in a private, guarded browser window. Every non-GET request was aborted, so **no edits were persisted**. Wherever I describe "autosave", I observed the app *attempting* a `PUT /api/flows/<id>`, which the guard then blocked. UI reactions to those blocked writes are labelled "observed under simulated network failure". I never clicked Save, ACTIVATE, Private, the trash icon, Reset to default or Generate. I also never copied people's names, phone numbers or emails. Flow names are business or project names and are quoted only where the naming analysis needs them.

---

## 1. Context and what the Flow Builder is

The Flow Builder is where an operator designs the voice agent's call script as a node graph (React Flow). A flow runs from **Start Call** to **End Call**, with Speak / Question / Branch / action nodes in between. Other surfaces use the flow too:

- **Agent Cockpit (/dashboard)**: a native `<select>` labelled `FLOW:` lists all 16 flows. Duplicate names get a 6-char id suffix (e.g. `Client A Realty (v2) · f9b04a`). In my session its selected value was the same flow id (`f9b04a…`) that the builder auto-loads.
- **Meeting Agent (/meeting-agent)**: a "Conversation flow" `<select>` with 17 options. The first is `Active flow (from profile)`, followed by the 16 flows with **no** id suffix, so duplicates can't be told apart.
- **Flow Builder header**: flow switcher button (`aria-label="Current flow: Client A Realty (v2). Click to choose a different flow."`), status chip (`Up to date`), toolbar: `AI draft`, `Settings`, Undo, Redo, Copy, Paste, Validate (shield), Preview AI script (eye), Full-screen (F), Keyboard shortcuts (?), More actions (…), `Private`, Destructive actions (trash), `Save` (Ctrl+S), `ACTIVATE` ("Activate this flow for all your calls").

The loaded flow ("Client A Realty (v2)", id f9b04a18…) has **26 nodes / 27 links**. Nodes by type: start 1, end 1, speak 15, question 1, condition 3, transfer 1, whatsapp 1, knowledge_lookup 3.

## 2. Method

1. Loaded /flow-builder repeatedly. I sampled state every second and logged every `/api/` request with timestamps.
2. Added one node of every palette type (10 types). I double-clicked each one and captured the panel text, every input/select/switch with its default, and a screenshot. Then I reloaded to discard.
3. Opened the existing Start, End, Speak, Question, Condition and Knowledge nodes in the real flow.
4. Ran local validation tests: cleared labels and messages, entered an invalid phone, out-of-range numbers and unknown template variables, then clicked **Validate**.
5. Opened Settings, AI draft, … menu, Preview, Keyboard shortcuts, Full-screen, the flow switcher and **New flow**.
6. Tested lifecycle behaviour: autosave on load and on edit, status chip changes, quick navigation after an edit, Backspace delete, Undo.
7. Cross-checked the flow selectors on /dashboard and /meeting-agent.

---

## 3. Observations by area

### 3.1 Load sequence and autosave (lifecycle)

| t after navigation | State |
|---|---|
| 1.8 s | `GET /api/auth/me` |
| 2.7 s | `GET /api/orgs`, `/api/onboarding/state`, `/api/billing/wallet`, `/api/flows` |
| 2.6 s | 0 nodes rendered, no flow selected |
| 4.7 s | 26 nodes, switcher = "Client A Realty (v2)", status "Up to date", badge "FLOW VALIDATED", **Undo enabled** |
| **6.7 s** | **`PUT /api/flows/f9b04a18-…` with zero user interaction** (blocked by guard) |

- On the very first load in this session, the canvas briefly showed the **default 8-node template** with the switcher reading "Choose a flow to edit" before the real flow replaced it (`20_fb_load.png`).
- Idle for 18 s after load: no further requests, so the save isn't periodic. It fires once after hydration.
- **Each edit triggers an autosave PUT** about 3.5 s later (debounced). Adding a node, typing in a field, clearing a label, deleting a node and editing the flow name in Settings each produced a PUT (4 PUTs in one short editing burst).
- The status chip (`role=status`, `aria-live=polite`) read **"Up to date"** before, during and after the blocked PUTs in most cases. Once, after several blocked edits, it switched to **"Autosave failed"** with a red icon (`30_validate_after_edits.png`, observed under simulated network failure). So failure reporting is inconsistent.
- **Quick-leave test:** I added a node and navigated away 0.4 s later. There was **no PUT, no beforeunload warning and no flush**, so the last edit is silently lost. The chip said "Up to date" at the moment of leaving.
- **Backspace** on a selected node (with 2 connected edges) deleted it **without confirmation**. Nodes went 26→25 and edges 27→25, and an autosave PUT followed within about 4 s. Ctrl+Z restored it locally (live region announced "Undone.").
- **Undo is enabled right after load** with no history. Clicking it twice changed nothing, and it stayed enabled (`56_undo_after_load.png`).
- Inferred from the above: the builder opens the flow the Cockpit shows as selected (probably the active flow), and every edit autosaves straight into that record. So there's no draft/published separation, and edits to the live script take effect without Save or ACTIVATE. This is inferred from the matching id and the PUT behaviour. I couldn't confirm the runtime effect without saving.

### 3.2 What Save / ACTIVATE / Private / "Up to date" communicate

| Control | Observed label / title | Observation |
|---|---|---|
| Status chip | "Up to date" with a dashed-circle (spinner-like) icon | Shown while edits are pending, while a save is blocked, and after "New flow" (never saved). Its icon looks like a loading spinner even when idle. |
| Save | "Save (Ctrl+S)", blue `rgb(47,95,224)` | With autosave already running, what Save adds is never explained. Flow names like "X (v2)", "(v3)", "(v6)" suggest Save or Generate creates **new copies** rather than versions (inferred; I didn't click Save). |
| ACTIVATE | "Activate this flow for all your calls", green `rgb(23,138,85)` | Looks identical whether or not the open flow is already active. There's no "Live/Active" badge anywhere in the builder. Enabled even when the validator reports errors. |
| ACTIVATE (new unsaved flow) | disabled, opacity 0.4, title "Save the flow first to activate it" | Reason only in a native tooltip. |
| Private | "Private — only visible to you" (saved flow) / disabled "Save the flow to set visibility" (new flow) | Looks like a static label, not a toggle. The switcher list shows no visibility column, so there's no way to see which flows are shared. |
| Trash (Destructive actions) | enabled on saved flow, disabled "Save the flow to enable" on new flow | Not clicked. Sits next to Private with no separation from Save/ACTIVATE. |
| Meeting Agent | "Active flow (from profile)" | Suggests the active flow is stored **per user profile**, which contradicts ACTIVATE's "for all your calls". The option doesn't name which flow is active. |

### 3.3 Flow switcher, naming and versions (16 flows)

The switcher opens an **"ALL FLOWS" modal** (896 px wide) with a search box (autofocused, placeholder "Search 16 flows…"), columns NAME / CATEGORY / LAST EDITED / [OPEN], and pagination ("Page 1 of 1 · 1-16 of 16 flows", per page 20) (`05_flow_switcher.png`, `51_…`, `52_…`).

- **Duplicate names:** "Client A Realty (v2)" ×2 (last edited 21 Sept 22:46 and 26 Sept 16:09), "Airport Passenger Support Flow" ×2, "Client D Demo" ×2. In the builder list the duplicates are **indistinguishable** apart from the date. The cockpit disambiguates them with a cryptic hash (`· 9115a2` vs `· f9b04a`). The meeting agent shows them identically.
- **Version-as-suffix:** "Appointment Scheduling" + "(v3)"; "Client B developers" + "(v6)"; "Client D Demo (v2)"; "Mutual_Fund_AI_Calling_Flow (v2)". Each "version" is a separate, unlinked flow. There's no history, no diff, no "restore version" and no parent link. "(v6)" exists while v2–v5 don't, so versions are presumably overwritten or deleted, or the suffix is just a copy counter (inferred).
- **"Generated: Client B developers ..."** plus a subtitle "Generated from prompt: Client B developers in Dubai". The AI draft names flows from the prompt and truncates them with a literal "..." in the stored name.
- **Sort order is unclear.** It isn't last-edited (4 Sept, 21 Sept, 15 Sept, 26 Sept, 28 Aug…) and it isn't alphabetical.
- There's **no marker for the current flow** (the open flow's row isn't highlighted) and **no Active badge**.
- There are **no row actions** (rename, duplicate, delete, set active, visibility). OPEN is the only one.
- Category values: CUSTOM, SCHEDULING, GENERAL. Most flows are CUSTOM, and the category can't be edited in Settings.
- Search works: "Client A" returns 3 rows. Earlier run: no-result state exists (`07_flow_switcher_noresult.png`).
- Names mix conventions: Title Case, snake_case ("Mutual_Fund_AI_Calling_Flow"), "X - Y".

### 3.4 Node palette

- Header "Add steps / PICK A TOOL, THEN CONNECT IT", a pill "**+ 10**" (a `<span>` count inside a styled pill with a plus icon, `cursor:auto`, not interactive), and a collapse button.
- Groups: **START HERE** (8 tiles: Speak, Question, Knowledge Query, CRM Lookup, Branch, Book Meeting, WhatsApp, Human Handoff). **RECENTLY USED** appears after first use. **CONVERSATION (5)**: Speak, Question, Branch, Human Handoff, Verify Customer. **ACTIONS (2)** (collapsed): Book Meeting, WhatsApp. **KNOWLEDGE & CRM (3)** (collapsed): Knowledge Query, FAQ, CRM Lookup. So the same 10 types appear up to 3 times, and FAQ and Verify Customer are missing from "Start here".
- Truncation at 1440 px: 7 of 13 visible tile labels are cut ("Knowle…", "CRM Lo…", "Book Me…", "WhatsA…", "Human …", "Human Han…", "Verify Cu…"). Tile text is 10–11 px with about 59–65 px of label width.
- Search works well: "transfer" finds Human Handoff, "lookup" finds Knowledge Query and CRM Lookup, and "zzz" shows "No nodes match "zzz"" (`61_palette_search_noresult.png`).
- **Clicking a tile adds the node at the viewport centre, on top of whatever is there.** Three consecutively added nodes landed at x≈879–913, y≈488–497 (`27_stacked_nodes.png`). When the previous node was selected, the new node went *under* it and couldn't be clicked (pointer interception confirmed). The saved production flow has 3 "Knowledge Lookup" nodes, one of which is disconnected and overlaps "Confirm Interest" (`14_validate_fresh.png`), which is consistent with this behaviour (inferred).
- New nodes are **not connected** to anything, and there's no "insert after selected node" behaviour.

### 3.5 Property panel: placement and shared anatomy

- A right-docked panel, **320 px wide**, height 707 px, opened by double-click **and by single click** (live region: "Selected New Speak Node. Editor panel open."). It **shrinks the canvas from 1042 px to 710 px** (−32%) at 1440 px. At 1024x768 the canvas shrinks to **294 px** and the minimap (≈200x150) covers most of what's left (`62_1024_panel_open.png`).
- Common anatomy: collapse chevron, icon + UPPERCASE title, close ×. A read-only **"ID: node_1790420834378"** box. LABEL input. Type-specific fields. Helper text. A read-only **"Position: x=332, y=330"** box. Then a **full-width solid red "Delete Node"** button, 287x37 px, `rgb(208,70,58)` and the most visually dominant element in the panel. There's no Done/Apply: changes apply live and autosave.
- Typography: field labels 10 px and helper/ID/position text 9 px, JetBrains Mono uppercase, colour `#7A8397` on white/`#F7F8FB`, roughly **3.8:1** contrast. That fails WCAG AA (4.5:1) for small text.
- Tabbing past the last field lands directly on **Delete Node** (focus ring visible, `28_…`, `32_…`).
- The canvas header shows "Editing <label>" as a chip, which is good. The minimap re-docks over the canvas.

### 3.6 Per-node configuration

Naming chain = palette tile → canvas node default label → panel title → live-region toast.

| Palette | Canvas default | Panel title | Toast | Fields (defaults) | Outcomes / notes |
|---|---|---|---|---|---|
| (fixed) Start | "Start Call" | START NODE | – | Label only. "ID: start". Note "Start and End nodes cannot be deleted." | 1 out handle |
| (fixed) End | "End Call" | END NODE | – | Label only. "ID: end" | Nothing configurable: no disposition, closing line, post-call action or tags |
| Speak | "New Speak Node" | SPEAK NODE | "New Speak Node added." | Label; MESSAGE textarea (placeholder "What should the AI say?"); helper "Use {{lead_name}} and {{company_name}} for dynamic content" | Single out. **No variable picker/autocomplete.** Typing `{{` shows nothing. `{{unknown_var}}` accepted silently and shown on canvas (`34_speak_unknown_var.png`). |
| Question | "New Question" | QUESTION NODE | "New Question added." | Label; QUESTION textarea ("Question to ask the caller") | Fixed **YES ↓ (bottom handle) / NO → (right handle)**. Explained only in panel text. No "unclear / no answer / other" path. No answer capture to a variable. |
| Branch | "Condition Check" | CONDITION | "Condition Check added." | Label; CONDITION textarea ("e.g., Caller mentioned budget > 10000") | Free-text natural-language condition. **TRUE ↓ / FALSE →** only. The real flow chains 3 Condition Checks to express Residential/Commercial/Industrial. No structured builder, operators or field picker. |
| Knowledge Query | "Knowledge Lookup" | KNOWLEDGE | "Knowledge Lookup added." | Label; KNOWLEDGE FILE (OPTIONAL) select ("All knowledge documents" + 5 files shown with raw timestamp prefixes like `1789987752864-<name>.pdf`); SEARCH QUERY HINT textarea ("Optional: guide what to search for", helper "Leave blank to auto-detect from caller's question.") | Single out. No test-search from the node. |
| CRM Lookup | "Live Lookup" | LIVE LOOKUP | "Live Lookup added." | Label; CONNECTOR select ("Select a connector…", empty; helper "No connectors yet — create one in Integrations → Live Lookup." + "+ New connector"); LOOKUP BY FIELD select disabled ("Pick a connector first"); note "Calls the operator's live API for ONE record (no embeddings). On no_match the agent says "I don't have that record" — never invents fields." | Canvas shows "Pick a connector…". **No found/not-found outputs** despite no_match semantics. Validator doesn't flag the missing connector. |
| Book Meeting | "Schedule" | SCHEDULE NODE | (not captured) | Label; WHAT TO ASK THE CALLER textarea; MEETING CONFIG: DURATION (15m/30m*/45m/1h/1.5h/2h), MEETING TYPE (Phone Call*/Google Meet/In-Person), AVAILABLE TIME SLOTS (OPTIONAL) free text ("Mon-Fri 9am-5pm, Sat 10am-2pm"); NOTIFICATIONS & SYNC switches: SEND CONFIRMATION EMAIL **on**, SEND WHATSAPP REMINDER off, ADD TO GOOGLE CALENDAR **on** | Canvas chips "30m / Phone / ✓ Confirm / ✓ Calendar". Defaults assume a connected Google Calendar and a known caller email. Neither is checked or explained. Availability is free text instead of a calendar source. Switches are amber (a colour not used elsewhere for "on"). |
| WhatsApp | "Send WhatsApp" | WHATSAPP NODE | "Send WhatsApp added." | Label; WHATSAPP TEMPLATE select ("Select template...", Visit Confirmation, No-Answer Follow-up, Custom Message); ATTACHMENT select (No attachment*, User's Brochure (auto), Custom URL) | No template preview, no variable mapping, no approval/connection status. Empty template isn't flagged by validator. |
| Human Handoff | "Transfer Call" | TRANSFER NODE | "Transfer Call added." | Label; TRANSFER TO NUMBER ("+91XXXXXXXXXX", helper "E.164 format. Leave blank to use context.") | "abc" → red border + helper becomes "Must start with country code (e.g. +91)", `aria-invalid=true`, **but the value is still applied** (canvas shows "To: abc") and autosaved. No failure/no-answer outcome. The real flow also has a *Speak* node labelled "Transfer Call" next to the real transfer node. |
| Verify Customer | "Verify Customer" | VERIFY CUSTOMER | (not captured) | Label; VERIFICATION QUESTION; VERIFY AGAINST (DOCUMENT / SOURCE) free text ("e.g., Loan Book (which uploaded doc/t…" truncated placeholder); FIELD TO VERIFY free text ("e.g., loan_account (blank = name + ph…" truncated); MATCH MODE (Last 4 digits*/Full value/Exact match); ATTEMPTS ALLOWED number (2; min 1, max 5) | **VERIFIED ↓ / FAILED →**. Helper: "Green handle = VERIFIED, red handle = FAILED — wire FAILED to an End Call or Handoff node." Attempts 999 and −5 accepted with no visible error (browser validity false only). Source/field are free text, not pickers. |
| FAQ | "FAQ" | FAQ | "FAQ added." | Label; LINK AN EXISTING KNOWLEDGE FILE (OPTIONAL) ("Owned FAQ file (entries below)" + files); Q&A ENTRIES (n) + "+ Add" → Question input ("Question (e.g. What are your hours?)") + Answer textarea; note "Backing file: created on first save. Answers are served only through search_knowledge_base at call time (never injected into the prompt)." | Developer jargon ("materialized", "search_knowledge_base"). |

### 3.7 Validation

- The **persistent canvas badge "● FLOW VALIDATED"** (top-left, mono 10 px) showed on the production flow and on the default template in every state I saw, including with orphan nodes, empty fields and after adding 3 unconnected nodes. It's effectively static.
- Clicking **Validate** (shield) opens a red panel "N FLOW VALIDATION ERRORS" with per-error **Jump** buttons (good). Results:
  - Production flow as loaded: **2 errors**: `Node "Knowledge Lookup" is not connected to any previous step.` / `...has no outgoing connection.` (`14_validate_fresh.png`). ACTIVATE is enabled anyway.
  - After my local edits: **6 errors**, all connectivity-only. One refers to a node by its raw id: `Node "node_1790420966396" is not connected…` (label had been cleared) (`30_validate_after_edits.png`).
  - **Product's own default template** (via New flow): **1 error**: `Question "Confirm Location" must have both YES and NO connections.` (`50_validate_default_template.png`).
- **Not validated** (all observed as accepted with no error): empty node label, empty Speak message (earlier run `13_validate_with_empty_node.png`), transfer number "abc", WhatsApp with no template, CRM Lookup with no connector, Verify attempts 999, unknown `{{variable}}`, empty flow name, duplicate node labels.
- There's no severity model (errors vs warnings) and no validate-on-ACTIVATE gate observed. The ACTIVATE tooltip is only about saving.

### 3.8 Toolbar dialogs

- **Settings** ("Flow settings — identity, Soul.md, voice verification"): a right drawer 576 px wide with the page blurred behind (`40_settings_dialog.png`). Contents:
  - *Flow identity*: NAME ("Flow name…") and DESCRIPTION ("Description (optional)").
  - *Soul.md · PER-FLOW*: a 6000-char textarea with a markdown placeholder.
  - *Consented voice verification · OPTIONAL*: "Enable for this flow" checkbox. SPEECH WINDOW 8, MEDIUM SCORE 0.7 and HIGH SCORE 0.86, all without units or explanation. MEDIUM FALLBACK (Light confirmation*), LOW FALLBACK (OTP or MFA*), FRAUD ACTION (Restrict and alert*). Checkboxes: Consent required, Liveness check, Fraud watchlist. SENSITIVE ACTIONS as a raw comma list "lookup_record, send_email, send_whatsapp". The "Light confirmatio(n)" select value is truncated.
  - There's no Save/Done; edits autosave.
  - **Clearing NAME is accepted**: no error, the header switcher becomes an **empty pill**, and an autosave PUT fired (`41_…`, `43_blank_flow_name_header.png`).
  - Missing from flow settings: language, voice/agent persona (Vaani/Vikash lives in the Cockpit), calling window, retries, max duration, category, visibility, version notes.
- **AI draft** ("Generate a flow with AI"): right drawer. A single-line input (maxlength 500) with a truncated placeholder ("Describe your desired flow (e.g., Dental clinic appointment scheduling with SMS follow-up)..."). "Generate" is disabled until you type. Note: "Generated nodes replace the canvas as a private draft. Edit any step from the right inspector, then Save or Activate from the top bar. Generation can take up to 90 seconds." About 85% of the drawer is empty. There are no examples, no language/agent/length options, and no warning that the currently open (autosaving) flow will be replaced. Not generated.
- **… More actions** (`role=menu`): Export JSON, Import JSON, **New flow**, **Reset to default**, with no separator or destructive styling on Reset (`45_more_actions_menu.png`).
- **New flow**: **instantly** replaces the canvas with the default 8-node "Appointment Scheduling"-style template: Start → Greet & Introduce → Confirm Interest (Yes: Schedule Visit → Confirm Location → Send WhatsApp Confirmation → End; No: "Not Interested" → Thank & End). There's no name prompt, no blank canvas option, no template choice and no confirmation. The header reads "Choose a flow to edit" and the status reads "Up to date" (never saved). ACTIVATE, Private and trash are disabled at 0.4 opacity. No API call is made until Save (`46_new_flow_click.png`).
- **Preview AI script** (eye): a modal 672 px wide, "AI SCRIPT PREVIEW / --- SYSTEM INSTRUCTION PREVIEW ---". It shows the generated system prompt (step list, "CRITICAL EXECUTION RULES", tool names `schedule_meeting`, `send_whatsapp`) in a ~225 px-tall scroll box, plus a full-width "Close Preview" primary button. **The default template renders `Duration: undefined minutes`.** The branch linearization is confusing (Step 7 END appears before the "If NO" branch). There's no copy button, no language or sample-data preview, and no simulate or test action (`48_preview_script_newflow.png`).
- **Keyboard shortcuts** (?): a clear list: Undo, Redo (Cmd+Shift+Z / Ctrl+Y), Copy, Paste, Select all, Save, F full-screen, Shift-click multi-select, arrows nudge 5/25 px, **Backspace delete**, "Edit node label inline: Double-click" (but double-click actually opens the side panel), ? help, Esc close (`49_keyboard_shortcuts.png`).
- **Full-screen (F)**: the canvas grows to 1342x832, and the header, toolbar (including Save, status and Validate) and palette are hidden. There's **no visible exit control**, only F or Esc. The wallet banner (42 px) still shows (`60_fullscreen.png`).
- **Fit view** on the 26-node flow: node text becomes about 3 px and unreadable. The flow is tall and narrow (uses ~300 of 1042 px width). There's no outline/list view and no find-node-on-canvas (`35_fit_view.png`).

### 3.9 Edges and branching

- Edges are selectable (`.selected`) but have **no editor**. Double-clicking an edge label opens nothing. Labels ("Interested", "Not Interested") exist only on template edges and can't be created or edited. Label text is about 9.6 px tall.
- Edge `aria-label`s expose raw ids: "Edge from node_1785140237056 to node_1785140283523".
- Outcomes are encoded **positionally** (bottom handle = YES/TRUE/VERIFIED, right handle = NO/FALSE/FAILED), with coloured dots (green/red) as the only cue on the canvas.

### 3.10 Relationship to the rest of the product

- Cockpit `FLOW:` select: selected "Client A Realty (v2) · f9b04a", the same id the builder autosaves to. There's a "Refresh flows" button. Changing the cockpit selection wasn't tested (would affect the live agent).
- Meeting Agent: "Conversation flow" defaults to "Active flow (from profile)", helper "The agent follows the selected conversation flow."
- So three surfaces use three naming schemes, and none of them shows a clear "this is the live flow" marker next to the name.

---

## 4. Findings

Severity: critical = blocks a core task / data loss / serious a11y barrier; high = major friction; medium = noticeable; low = polish.

### FLOW-CONFIG-01: Edits autosave straight into the live flow, and Backspace deletes without confirmation (critical)
**Evidence:** Every edit (add node, type, clear label, Backspace-delete) fired `PUT /api/flows/f9b04a18…` about 3.5–4 s later (blocked by guard). Backspace removed a node plus 2 edges with no confirmation (26→25 nodes, 27→25 edges) and a PUT followed (`59_backspace_delete.png`). The open flow has the same id as the Cockpit's selected flow. ACTIVATE says "for all your calls", yet nothing separates a draft from the version calls use (live effect inferred).
**Recommendation:** Add a draft/published model. Edits autosave to a *draft* revision, and the live version changes only on "Publish/Activate" (with a diff summary). Show a persistent "Live" vs "Draft — unpublished changes" state. Confirm deletions of connected nodes (or show an undo toast "Node deleted · Undo"). Keep autosave for drafts only.

### FLOW-CONFIG-02: Opening the builder writes to the flow with no user action (high)
**Evidence:** `PUT /api/flows/<id>` at t≈6.7 s after navigation, with zero interaction (`21_load_1s.png`, `22_load_8s.png`, request log). This happened on every reload. Undo is also enabled right after load (a phantom history entry). The loaded flow shows "Last edited 26 Sept, 16:09", probably bumped by visits rather than edits (inferred).
**Recommendation:** Don't mark the document dirty on hydration. Compare against the loaded snapshot before saving. Only update "last edited" on real content changes. Clear the undo stack after load.

### FLOW-CONFIG-03: Save state is misreported and the last edit can be lost silently (high)
**Evidence:**
- "Up to date" (with a spinner-like dashed-circle icon) showed while a save was pending and after blocked PUTs. Only sometimes did it switch to "Autosave failed" (observed under simulated network failure, `30_…`).
- Leaving 0.4 s after an edit sent no PUT and showed no beforeunload prompt, so the edit was lost.
- After "New flow" (never persisted) the chip still said "Up to date".
- The Save button's purpose next to autosave is unexplained.

**Recommendation:** Use a four-state chip: "Unsaved changes…" → "Saving…" → "Saved · 12:04" → "Couldn't save · Retry". Use a static icon when idle. Flush pending saves on `visibilitychange`/`pagehide` and warn on unload when dirty. For unsaved new flows show "Not saved yet". Either remove the Save button or relabel it to what it actually does (e.g. "Save version").

### FLOW-CONFIG-04: Validation is connectivity-only, contradicts the "FLOW VALIDATED" badge and doesn't gate ACTIVATE (high)
**Evidence:**
- The badge "FLOW VALIDATED" is always shown, yet Validate reports 2 errors on the saved production flow, 1 error on the product's own default template, and 6 after edits (`14_…`, `50_…`, `30_…`).
- Not flagged: empty label or message, phone "abc", missing WhatsApp template, missing CRM connector, attempts 999, unknown `{{var}}`, blank flow name.
- ACTIVATE stays enabled with errors present.
- An error references a raw id ("node_1790420966396").

**Recommendation:** Run validation live. Replace the static badge with a live count ("2 errors · 3 warnings"), and put per-node error dots on the canvas and inline in panels. Validate required config per node type (message, question, template, connector, number format, variables). Block or confirm ACTIVATE when there are errors. Always name nodes by label, with a fallback of "Untitled Transfer node", never the id.

### FLOW-CONFIG-05: New nodes drop on top of existing nodes and stack invisibly (high)
**Evidence:** Palette clicks place the node at the viewport centre regardless of occupancy. Three nodes stacked at the same coordinates, and a new node rendered *beneath* the selected node and couldn't be clicked (`27_stacked_nodes.png`, `23_after_add_crm.png`). The production flow contains orphan, overlapping "Knowledge Lookup" nodes (`14_…`).
**Recommendation:** Insert after the selected node and auto-connect it. Otherwise place new nodes in free space, offset each successive add, select and scroll to the new node, and keep drag-to-place. Add a "Tidy layout" action.

### FLOW-CONFIG-06: Flow identity is ambiguous: duplicate names, fake versions, no active or current marker (high)
**Evidence:**
- 16 flows, of which 3 pairs have identical names.
- "(v2)/(v3)/(v6)" are separate unlinked flows.
- AI-generated names are truncated with a literal "..." ("Generated: Client B developers ... (v2)").
- The builder list has no id, no active badge, no current-row highlight and no visibility column, and the sort order is unclear (`52_flow_switcher_bottom.png`, `53_…`).
- The cockpit shows `· f9b04a` hashes and the meeting agent shows neither (`54_…`, `55_…`).

**Recommendation:** Treat a flow as one entity with a **version history** (v1…vN, author, timestamp, note, restore, compare) instead of copying and renaming. Enforce unique names per org (or auto-suffix "(copy 2)"). Add Status (Live / Draft / Archived), Visibility and Owner columns. Sort by last edited with sortable headers. Highlight the open flow. Add row actions (rename, duplicate, archive, set live). Use the same display name and disambiguator in the Builder, Cockpit and Meeting Agent.

### FLOW-CONFIG-07: The live flow is invisible and "active" has conflicting meanings (high)
**Evidence:** The ACTIVATE button looks identical on the flow that's already selected in the Cockpit. The Meeting Agent says "Active flow (from profile)" without naming it. ACTIVATE says "for all your calls" but "from profile" implies per user. Private ("only visible to you") is a disabled-looking pill.
**Recommendation:** Show a "LIVE" pill next to the flow name when it's the active flow, and change the button to "Live ✓" (or "Publish changes" when a draft exists). Name the active flow wherever "Active flow" appears. Clarify scope (org vs user) in copy. Make visibility an explicit menu ("Only me / Team").

### FLOW-CONFIG-08: No "create flow" journey, and the template is broken (high)
**Evidence:** "New flow" is hidden in the … menu next to un-separated "Reset to default". It instantly swaps in a fixed 8-node template with no name, no template picker, no blank option and no confirmation. The header reads "Choose a flow to edit". The template fails validation ("Confirm Location" missing NO path) and its script preview prints "Duration: undefined minutes" (`45_…`, `46_…`, `48_…`, `50_…`).
**Recommendation:** Add a primary "+ New flow" button beside the switcher. It should open a create dialog with name (required), use case/category, language, agent, and start from Blank / Template gallery / AI draft. Fix the default template's schedule duration and the Confirm Location NO branch. Style "Reset to default" as destructive with a confirmation.

### FLOW-CONFIG-09: Flow name can be cleared with no validation (high)
**Evidence:** Clearing NAME in Settings gave no inline error, the header switcher became an empty pill, and an autosave PUT with the blank name fired (`41_…`, `43_blank_flow_name_header.png`).
**Recommendation:** Make the name required, trim whitespace, show "Name is required", and don't save until it's valid (revert on blur if empty). Check uniqueness.

### FLOW-CONFIG-10: No way to test or simulate a flow inside the builder (high)
**Evidence:** The only "test" affordance is Preview AI script: a raw system prompt in a ~225 px scroll box with tool names and a rendering bug. There's no chat simulator, no "test call with this draft", and no path walkthrough (`48_…`). Test Call lives in the Cockpit and uses the selected flow.
**Recommendation:** Add a "Test" side panel. It should offer a text simulator that highlights the current node on the canvas, pick-a-branch stepping, sample lead variables, and "Call me with this draft" (uses the draft, not the live flow). Keep the prompt preview as an "Advanced" tab with a copy button and taller viewport.

### FLOW-CONFIG-11: Outcome model is too rigid and edges aren't editable (medium)
**Evidence:** Question = YES/NO only. Branch = free-text condition with TRUE/FALSE only, so the production flow chains 3 Condition Checks to express 3 options. There's no "no answer / unclear / other" path. Outcomes are positional (bottom vs right handle), explained only in panel text. Edges can't be edited or labelled, and edge aria-labels expose raw ids (`26_panel_Question.png`, `26_panel_Branch.png`, `58_edge_click.png`).
**Recommendation:**
- Question: multi-choice answers (each its own labelled output), plus a mandatory fallback output ("Didn't understand / No response") and an optional "save answer to variable".
- Branch: offer a structured condition builder (variable, operator, value) with a natural-language option and N cases + Else.
- Put outcome labels on the handles themselves.
- Make edges selectable with a small popover (label, delete), and use node labels in edge aria-labels.

### FLOW-CONFIG-12: Variable/templating support is minimal and unvalidated (medium)
**Evidence:** Only the helper text "Use {{lead_name}} and {{company_name}}". Typing `{{` shows no picker, and `{{unknown_var}}` is accepted and rendered on the canvas (`33_…`, `34_…`).
**Recommendation:** Add an "Insert variable" button and `{{` autocomplete listing lead fields, captured answers and CRM fields. Highlight tokens as chips and flag unknown variables. Show a sample-data preview of the spoken line.

### FLOW-CONFIG-13: Node types have 3–4 different names each (medium)
**Evidence:**
- Knowledge Query → "Knowledge Lookup" → KNOWLEDGE
- CRM Lookup → "Live Lookup" → LIVE LOOKUP
- Book Meeting → "Schedule" → SCHEDULE NODE
- WhatsApp → "Send WhatsApp" → WHATSAPP NODE
- Human Handoff → "Transfer Call" → TRANSFER NODE
- Branch → "Condition Check" → CONDITION

The production flow also has a Speak node labelled "Transfer Call" next to the real Transfer node, and duplicate labels ("Lead questions" ×5, "Lead - questions" ×3).
**Recommendation:** Use one canonical name per type across palette, node badge, panel title, toast, docs and validator (e.g. "Transfer to human", "CRM lookup", "Book meeting", "Condition"). Show the type as a small badge on each node so a custom label can't disguise the type. Warn about duplicate labels.

### FLOW-CONFIG-14: Property panels expose developer internals, and small low-contrast text fails AA (medium)
**Evidence:**
- Panels show raw "ID: node_1790420834378" and "Position: x=332, y=330".
- Copy uses internal names: "search_knowledge_base", "lookup_record, send_email, send_whatsapp", "no embeddings", "materialized", "Soul.md", "E.164".
- File options carry timestamp prefixes ("1789987752864-….pdf").
- Labels are 10 px and helper text 9 px, JetBrains Mono uppercase in `#7A8397` (~3.8:1).

**Recommendation:** Hide ID and Position behind an "Advanced" disclosure (or remove them). Rewrite helper copy in operator language. Strip the storage prefix from file names and show upload date instead. Use ≥12 px sentence-case labels at ≥4.5:1 contrast. Reserve mono for ids and code.

### FLOW-CONFIG-15: "Delete Node" dominates every panel and sits in the tab path (medium)
**Evidence:** Full-width solid red 287x37 px button, the heaviest element in the panel, reached by Tab straight after the last field. There's no Done/Apply (`26_panel_*.png`, `32_…`).
**Recommendation:** Move delete to a quiet secondary position (a trash icon in the panel header or a "More" menu) with confirmation or undo. If a clear commit affordance is needed, add a "Done" primary.

### FLOW-CONFIG-16: Docked panel squeezes the canvas, badly at smaller widths (medium)
**Evidence:** At 1440 px the canvas goes from 1042 to 710 px. At 1024 px it's 294 px and the minimap covers most of it (`62_1024_panel_open.png`). The palette stays 288 px wide.
**Recommendation:** Auto-collapse the palette while the panel is open. Let the panel overlay the canvas below ~1280 px. Auto-hide the minimap when the canvas is under 600 px wide. Pan the selected node into view next to the panel. Make the panel resizable.

### FLOW-CONFIG-17: Field validation is inconsistent and invalid values are still applied (medium)
**Evidence:** Transfer number "abc" gets an inline error but is still applied ("To: abc") and autosaved. Attempts allowed accepts 999 and −5 (min 1, max 5) with no message. A cleared label is allowed (`28_…`, `29_…`, `32_…`).
**Recommendation:** Validate on blur with inline messages for every constrained field. Keep invalid values in the field but don't commit them to the flow. Surface them in the validator. Clamp numeric fields with a hint ("1–5 attempts").

### FLOW-CONFIG-18: Integration dependencies aren't surfaced in node config (medium)
**Evidence:**
- CRM Lookup: "No connectors yet" plus a link (good), but the node stays valid.
- Schedule: defaults "Add to Google Calendar" ON and "Send confirmation email" ON, with no connection check and no source for the caller's email. Availability is free text.
- WhatsApp: template choice has no preview, variables or approval/connection status (`25_…`, `26_panel_BookMeeting_Schedule.png`, `26_panel_WhatsApp.png`).

**Recommendation:** Show a connection status line per integration ("Google Calendar · Connected as …" / "Not connected · Connect"). Default integration toggles to OFF when disconnected. Show template previews with variable mapping. Raise validator warnings for unmet dependencies.

### FLOW-CONFIG-19: AI draft is under-specified and destructive (medium)
**Evidence:** A single-line 500-char input with a truncated placeholder. "Generated nodes replace the canvas" with no confirmation about the open flow. There are no options or examples, and ~85% of the drawer is empty (`44_ai_draft_dialog.png`). Generated flows are named "Generated: <prompt> ..." in the list.
**Recommendation:** Use a multi-line brief with guided fields (goal, audience, language, agent, must-ask questions, handoff rules) and example prompts. Always generate into a **new draft flow** (or ask "Replace current / Create new"). Name the result properly and let the user rename it before it's created.

### FLOW-CONFIG-20: Flow Settings lacks core per-flow config and explanations (medium)
**Evidence:** Settings covers only Name, Description, Soul.md and Voice verification. Speech window "8", scores "0.7"/"0.86" have no units or explanation. Sensitive actions is a raw tool list. There are no language, voice/agent, calling hours, retries, max duration, category or visibility settings (`40_…`, `42_…`).
**Recommendation:** Organise settings into Identity (name, description, category, visibility), Agent (voice, language(s), persona/Soul), Call behaviour (hours, retries, max duration, voicemail), Security (verification) and Versions. Add units and helper text for thresholds, and a checklist for sensitive actions using human labels.

### FLOW-CONFIG-21: Large flows are hard to read and navigate (medium)
**Evidence:** Fit view renders a 26-node flow at an unreadable scale. There's no outline/list view and no find-node. Duplicate labels make validator "Jump" targets ambiguous (`35_fit_view.png`).
**Recommendation:** Add an outline sidebar (step list with type icons, errors and search) that syncs with canvas selection. Add collapsible groups/sub-flows. Use semantic zoom (show title-only cards when zoomed out).

### FLOW-CONFIG-22: Full-screen hides every control with no visible exit (low)
**Evidence:** F hides the toolbar (Save, status, Validate) and the palette, with no exit button, and the wallet banner remains (`60_fullscreen.png`).
**Recommendation:** Keep a compact floating bar in full-screen (status, validate, exit ⤡). Hide global banners.

### FLOW-CONFIG-23: Misleading affordances: "+ 10" pill and always-on Undo (low)
**Evidence:** The "+ 10" is a non-interactive count styled as a button with a plus icon. Undo is enabled on load and does nothing (`56_…`).
**Recommendation:** Render the count as plain text ("10 step types") or make it open an "all steps" view. Disable Undo until there's history.

### FLOW-CONFIG-24: Palette labels truncated, and types repeated across groups (low)
**Evidence:** 7 of 13 visible tiles are truncated at 1440 px (10–11 px text in 59–65 px). The same types repeat in Start here, Recently used and the categories. FAQ and Verify are missing from "Start here" (`31_palette_expanded.png`).
**Recommendation:** Use a single-column list with icon + full name + one-line description, or widen tiles. Show each type once, grouped by purpose, with "Recently used" as the only duplicate section.

### FLOW-CONFIG-25: The default template flashes before the real flow loads (low)
**Evidence:** The first load showed the 8-node default template with "Choose a flow to edit" before the saved flow appeared. On later loads the canvas stayed empty for ~2.6 s before the flow rendered (`20_fb_load.png`).
**Recommendation:** Show a skeleton or loading state until `/api/flows` resolves. Never render the default template as a placeholder for an existing flow.

---

## 5. Strengths to keep
- Toolbar and palette are accessible by name: every icon button has `title` + `aria-label` with its shortcut ("Undo (Ctrl+Z)", "Add Speak node to canvas"). Nodes carry descriptive aria-labels ("Speak node: Greet & Introduce. Message: …").
- A polite live region announces actions ("Speak added.", "Undone.", "Selected X. Editor panel open.").
- The Validate panel lists errors with **Jump** buttons that centre and select the node.
- Palette search matches synonyms ("transfer" → Human Handoff) and has a clear no-results message.
- Undo/redo, copy/paste, a keyboard nudge and a complete shortcuts dialog. Ctrl+Z restores deleted nodes.
- The canvas header shows "Editing <node label>" plus node and link counts.
- Helpful helper text in places. Verify Customer explains VERIFIED/FAILED wiring, CRM lookup promises "never invents fields", and CRM Lookup offers "+ New connector" when none exist.
- Inline phone validation exists on the Transfer node, and "Autosave failed" can surface.
- Start and End nodes are protected, with an explanation.
- The flow switcher modal has search, category, last-edited and pagination, which is a reasonable base.
- Voice verification is consent-first, with fallbacks and fraud actions (a strong trust concept).
- The script preview makes the agent's interpretation transparent.

## 6. Open questions (couldn't verify without saving)
1. What does **Save** do on an existing flow: overwrite, or create "(vN)"? Is "(vN)" produced by Save, AI draft or Duplicate?
2. Is the active flow per org or per user ("from profile")? Does changing the Cockpit `FLOW:` select change the active flow?
3. Do autosaved edits to the active flow affect live calls immediately? (Strongly implied.)
4. What does the Private toggle switch to (Team/Org)? Who can see which flows?
5. Does ACTIVATE run the validator server-side?
6. Does Import JSON validate or merge, or replace? Does Reset to default affect the saved flow immediately (with autosave)?
