
### F-FLOW-029 — Unknown node types render as unstyled default boxes, and validation ignores them
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-19
- **Pages:** /flow-builder (Flow B)
- **Evidence:**
  - In Flow B, a step labelled "Call Ambulance" renders as React Flow's fallback `react-flow__node-default`. It is a plain white box of about 150x40 with 2 handles, and it has no type colour, no icon and no warning.
  - Validate on Flow B reports 7 errors, all about Question YES/NO wiring. None mentions this node.
  - It is unclear which type the step was meant to be (probably an action from AI draft; the auditor's open question 7). How the compiled prompt treats it was not checked.
- **Screenshots:** `audit/screenshots/va-flow-canvas/44_flow_airport.png`, `audit/screenshots/va-flow-canvas/46_airport_validate.png`
- **Recommendation:**
  - Register a fallback in `nodeTypes` that maps any type missing from the node-type registry to an "Unsupported step" component. Give it an amber warning border, the raw type string ("Unknown type: `<type>`"), one line of explanation and a "Convert to…" menu (Speak, Transfer, or another supported type).
  - Make the validator report it as an error: "Step 'X' uses an unsupported type".
  - On the server, check AI-draft output and Import JSON against the node-type schema before saving. Reject unknown types or convert them to a supported type.
  - Flag the step in Preview AI script as well.

### F-FLOW-030 — Integration dependencies aren't shown in node config (Calendar, email, WhatsApp, CRM connector)
- **Severity:** medium · **Confidence:** single-agent (the verifier separately confirmed the validator doesn't flag a Live Lookup with no connector)
- **Source findings:** FLOW-CONFIG-18
- **Pages:** /flow-builder (Schedule, WhatsApp and Live Lookup panels)
- **Evidence:**
  - **Live Lookup** (the palette's "CRM Lookup"):
    - The CONNECTOR select is empty, with the helper "No connectors yet — create one in Integrations → Live Lookup." and a "+ New connector" link, which is good. LOOKUP BY FIELD is disabled ("Pick a connector first").
    - The canvas shows "Pick a connector…", but Validate doesn't flag it.
    - The panel says that on `no_match` the agent says "I don't have that record", yet the node has a single output. There is no Found / Not found branch.
  - **Schedule** (the palette's "Book Meeting"):
    - SEND CONFIRMATION EMAIL and ADD TO GOOGLE CALENDAR default to on. Nothing shows whether Google Calendar is connected or where the caller's email address comes from.
    - AVAILABLE TIME SLOTS is free text ("Mon-Fri 9am-5pm, Sat 10am-2pm") rather than coming from a calendar.
    - The switches are amber, a colour the app doesn't otherwise use for "on".
    - Canvas chips read "30m / Phone / ✓ Confirm / ✓ Calendar".
  - **WhatsApp:** the TEMPLATE select offers Visit Confirmation, No-Answer Follow-up and Custom Message. There is no preview, no variable mapping and no approval or connection status. An empty template isn't flagged.
- **Screenshots:** `audit/screenshots/va-flow-config/25_panel_crm_lookup.png`, `audit/screenshots/va-flow-config/26_panel_BookMeeting_Schedule.png`, `audit/screenshots/va-flow-config/26_panel_WhatsApp.png`, `audit/screenshots/va-flow-config/23_after_add_crm.png`
- **Recommendation:**
  - At the top of each integration panel, add a status row that reads the same integration-status API as Settings: "Google Calendar · Connected" or "Not connected · Connect", with a deep link to the integration.
  - When an integration isn't connected, default its toggles to off and disable them, with the reason shown inline.
  - **Schedule:** show which variable provides the caller's email (for example `{{lead_email}}`) and warn when no such field exists. Replace free-text availability with the connected calendar's working hours, or a structured day and time picker.
  - **WhatsApp:** show a template preview with variable mapping and the approval status (Approved / Pending / Rejected).
  - **Live Lookup:** add Found and Not found outputs to match its no-match behaviour.
  - **Validator:** flag every unmet dependency (error when the node can't run, warning when a notification would silently fail), and run the same checks on the server at activation.
  - Use the standard "on" colour token for switches.

### F-FLOW-031 — AI draft is a single-line prompt, and it replaces the open flow without asking
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-19
- **Pages:** /flow-builder (AI draft drawer)
- **Evidence:**
  - "AI draft" ("Generate a flow with AI") opens a right-hand drawer containing a **single-line** input (maxlength 500). Its placeholder is cut off: "Describe your desired flow (e.g., Dental clinic appointment scheduling with SMS follow-up)...". Generate stays disabled until you type.
  - The drawer's note says generated nodes "replace the canvas as a private draft" and that generation "can take up to 90 seconds". There is no warning or confirmation, although the open flow is the autosaving active flow (F-FLOW-001).
  - About 85% of the drawer is empty: no example prompts and no options for language, agent or length.
  - Generated flows are stored with names like "Generated: <prompt text> ... (v2)", including a literal "..." (F-FLOW-012).
  - Generate wasn't clicked, so whether it overwrites the open flow or creates a new record is inferred from the note.
- **Screenshots:** `audit/screenshots/va-flow-config/44_ai_draft_dialog.png`
- **Recommendation:**
  - Use a multi-line textarea (6–10 rows, with a character counter) plus optional guided fields: goal, audience, language(s), agent voice, must-ask questions, handoff rule and whether to book meetings. Add 3–4 example-prompt chips.
  - Always generate into a **new draft flow**. Pre-fill an editable name from the prompt's summary, with no "...". If replacing is offered at all, make it an explicit choice ("Create new flow (recommended)" / "Replace current draft") and make it undoable.
  - During generation (up to 90 s), show a progress state with Cancel. When it finishes, open the new flow at fit view and run the validator.
  - Check the generated graph against the node-type schema on the server (F-FLOW-029).

### F-FLOW-032 — Flow Settings is missing core per-flow options, has no Done or save feedback, and doesn't explain its voice-verification numbers
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CONFIG-20, UX-AUDIT-18 (settings-drawer part)
- **Pages:** /flow-builder (Flow settings drawer)
- **Evidence:**
  - **Drawer:** 576 px wide, with the page blurred behind it. Sections:
    - *Flow identity:* NAME and DESCRIPTION.
    - *Soul.md · PER-FLOW:* a 6,000-character textarea with a markdown placeholder. Nothing explains what "Soul.md" is.
    - *Consented voice verification · OPTIONAL:* SPEECH WINDOW 8, MEDIUM SCORE 0.7 and HIGH SCORE 0.86, all with no unit or explanation. Also MEDIUM FALLBACK, LOW FALLBACK and FRAUD ACTION selects (the "Light confirmation" value is cut off), and checkboxes for Consent required, Liveness check and Fraud watchlist.
    - SENSITIVE ACTIONS is a raw, comma-separated list of tool names: "lookup_record, send_email, send_whatsapp".
  - **No Save, no Done, no feedback:** edits autosave straight into the active flow (UX-AUDIT-18 saw the same). A blank name is accepted (F-FLOW-015).
  - **Missing:** language, agent voice or persona (this lives in the Cockpit), calling hours, retries, max duration, category (the switcher shows CUSTOM, SCHEDULING and GENERAL, but you can't edit it), visibility and version notes.
- **Screenshots:** `audit/screenshots/va-flow-config/40_settings_dialog.png`, `audit/screenshots/va-flow-config/42_settings_voice_verification.png`, `audit/screenshots/va-ux-audit/28_flow_settings_drawer.png`
- **Recommendation:**
  - Split the drawer into sections:
    - **Identity:** name (required), description, category, visibility.
    - **Agent:** voice, language(s), and persona / Soul.md with a one-line "What is this?" helper.
    - **Call behaviour:** calling hours with a timezone, retries, max duration, voicemail handling.
    - **Security:** voice verification.
    - **Versions:** history and notes (F-FLOW-012).
  - **Thresholds:** state the unit for Speech window (the UI doesn't say whether 8 is seconds or turns). Show the two scores as one 0–1 range with labelled bands (≥ 0.86 verified, 0.70–0.86 light confirmation, below 0.70 the low fallback). Validate that Medium < High.
  - **Sensitive actions:** a checkbox list with plain labels ("Look up a customer record", "Send email", "Send WhatsApp").
  - Add a footer with the save state ("Saved · 12:04") and a Done button. Widen the selects so their values aren't cut off.

### F-FLOW-033 — Node panels show developer internals, and their 9–10 px low-contrast mono labels fail AA
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-14
- **Pages:** /flow-builder (all node panels)
- **Evidence:**
  - **Internal data:** every panel shows a read-only "ID: node_1790420834378" and "Position: x=332, y=330".
  - **Developer jargon in the copy:** "search_knowledge_base" and "materialized" (FAQ); "no embeddings" and `no_match` (Live Lookup); "E.164" (Transfer); "Soul.md"; and the raw tool list "lookup_record, send_email, send_whatsapp".
  - **File names:** knowledge-file options keep their storage timestamp prefix (`1789987752864-<name>.pdf`).
  - **Cut-off placeholders:** Verify Customer shows "e.g., Loan Book (which uploaded doc/t…" and "e.g., loan_account (blank = name + ph…".
  - **Typography:** field labels are 10 px and helper, ID and position text is 9 px, all JetBrains Mono uppercase in #7A8397. That is 3.8:1 on white and 3.58:1 on #F7F8FB, below the 4.5:1 AA minimum for text this small.
- **Screenshots:** `audit/screenshots/va-flow-config/26_panel_FAQ.png`, `audit/screenshots/va-flow-config/26_panel_KnowledgeQuery.png`, `audit/screenshots/va-flow-config/25_panel_crm_lookup.png`, `audit/screenshots/va-flow-config/26_panel_VerifyCustomer.png`, `audit/screenshots/va-flow-config/26_panel_HumanHandoff.png`, `audit/screenshots/va-flow-config/11_node_speak.png`
- **Recommendation:**
  - Take ID and Position out of the default view. Put them in a collapsed "Advanced" section with a copy-ID button.
  - Rewrite helper copy in operator language:
    - Transfer: "Include the country code, e.g. +91 followed by the number".
    - FAQ: "The agent looks these answers up when a caller asks".
    - Live Lookup: "If no record matches, the agent says so and never guesses".
  - Show knowledge files by their original name plus upload date.
  - Use 12–13 px sentence-case sans labels at weight 500 in a colour of at least 4.5:1, for example #475569 (7.58:1 on white, 7.14:1 on #F7F8FB). Use 12 px #5B6478 (5.59:1) for helper text. Keep mono only for ids, variables and code.
  - Keep placeholders short and move examples into helper text so nothing is cut off.

### F-FLOW-034 — Full-screen hides the toolbar and minimap, has no visible exit, and keeps the wallet banner
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-21, FLOW-CONFIG-22
- **Pages:** /flow-builder (full-screen canvas, F)
- **Evidence:**
  - F grows the canvas from 1043x651 to 1342x832.
  - It hides the header, the whole toolbar (Save, status chip, Validate), the palette and the minimap.
  - There is no visible exit control. Only F again or Esc gets you out.
  - The 42 px wallet banner stays.
  - While full-screen, you can't see save state or validation at all, even though every edit autosaves to the live flow (F-FLOW-001).
- **Screenshots:** `audit/screenshots/va-flow-canvas/39_fullscreen_canvas.png`, `audit/screenshots/va-flow-config/60_fullscreen.png`
- **Recommendation:**
  - In full-screen, show a compact floating bar in the top-right with: status chip, issue count / Validate, Undo/Redo, and an "Exit full screen (F / Esc)" button.
  - Keep the minimap and canvas controls.
  - Hide global banners, or call the Fullscreen API on the canvas container.
  - Set `aria-pressed` on the toolbar toggle to reflect the state.

### F-FLOW-035 — Palette: a fake "+ 10" button, repeated groups and truncated labels
- **Severity:** low (DESIGN-RESEARCH-04 and VISUAL-AUDIT-10 rated their combined findings medium; their node-overlap parts are in F-FLOW-009 and F-FLOW-021) · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-23, FLOW-CONFIG-23 ("+ 10" part), FLOW-CONFIG-24, DESIGN-RESEARCH-04 (palette part), VISUAL-AUDIT-10 (palette part), UX-AUDIT-18 (palette part)
- **Pages:** /flow-builder (palette)
- **Evidence:**
  - **"+ 10":** an 85x32 pill with a saffron border and fill and a plus icon. It is actually an inert `<span>` count (`cursor: auto`), not a button.
  - **Repeated groups:** START HERE (8 tiles) repeats types from CONVERSATION, ACTIONS and KNOWLEDGE & CRM, so the same types appear up to 3 times once RECENTLY USED shows up. FAQ and Verify Customer are missing from START HERE. RECENTLY USED appears after the first add and pushes the groups down.
  - **Truncation at 1440 px:**
    - 5–7 of the 13 visible tile labels are cut off: "Knowle…", "CRM Lo…", "Book Me…", "WhatsA…", "Human …", "Human Han…", "Verify Cu…".
    - The text is 10–11 px in about 59–65 px of label width, in a 2-column grid of 112–119 px tiles.
    - FLOW-CANVAS counted 5; FLOW-CONFIG, VISUAL-AUDIT and DESIGN-RESEARCH counted 7. The difference depends on which groups were expanded.
  - **No descriptions:** tiles have no descriptions or tooltips beyond the name.
  - **Working well:** search matches synonyms and has a clear empty state.
- **Screenshots:** `audit/screenshots/va-flow-config/31_palette_expanded.png`, `audit/screenshots/va-ux-audit/crop_flow_palette_truncation.png`, `audit/screenshots/va-flow-canvas/42_palette_search.png`, `audit/screenshots/va-flow-config/61_palette_search_noresult.png`, `audit/screenshots/scout_flow-builder.png`
- **Recommendation:**
  - Use a single-column list in the 288 px panel. Each row has a 20 px icon, the full name at 13–14 px and a one-line 12 px description.
  - List each type exactly once, grouped by purpose (Conversation / Actions / Knowledge & CRM).
  - Show "Recently used" as a fixed-height row of up to 4 icons above the groups, so the list doesn't jump.
  - Replace "+ 10" with muted text ("10 step types"), or make it a real "Browse all steps" button.
  - Make rows draggable onto the canvas (F-FLOW-009).

### F-FLOW-036 — Node colours, edge labels and selection styling change across themes and node types
- **Severity:** low · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-26, VISUAL-AUDIT-10 (unthemed edge-label part)
- **Pages:** /flow-builder (light and dark)
- **Evidence:**
  - **Speak colour:** Speak titles are blue #2F5FE0 in light mode and purple #7C6BF5 in dark mode (4.23:1 on #1A1D26), and Save shifts from blue to purple too. A type's colour isn't stable across themes.
  - **Edge label:** the "Not Interested" label stays a white box with black text in dark mode (both agents saw this).
  - **Theme wiring:** the React Flow root keeps the class `light` in dark mode, so `colorMode` isn't connected.
  - **Borders and selection:**
    - Question and Condition nodes have dashed borders, which nothing explains.
    - Selection shows as a dark 1.6 px border (dashed or solid), so it is weak on the dashed nodes.
  - **"Canvas" header dot:** it is green and looks like a "live" indicator, but it means nothing.
- **Screenshots:** `audit/screenshots/va-flow-canvas/52_dark_mode.png`, `audit/screenshots/va-visual-audit/dark_flow-builder.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`
- **Recommendation:**
  - Define a colour token per node type (`--node-speak`, `--node-question`, …) with a fixed hue and light and dark values that each reach at least 4.5:1 for text.
  - Pass `colorMode={theme}` to `<ReactFlow>`, and theme edge labels through `--edge-label-bg` and `--edge-label-fg`.
  - Give every node a solid border, and reserve dashed borders for disabled or unreachable steps.
  - Show selection as a 2 px accent ring plus shadow on every node type, distinct from the focus ring (F-FLOW-006).
  - Remove the green dot, or give it a meaning (for example "Live" on the active flow, F-FLOW-014).

### F-FLOW-037 — On load, the default template flashes up marked "FLOW VALIDATED" before the saved flow appears
- **Severity:** low · **Confidence:** multi-agent (the verifier also saw it while checking FLOW-CANVAS-03)
- **Source findings:** FLOW-CANVAS-27, FLOW-CONFIG-25
- **Pages:** /flow-builder (initial load)
- **Evidence:**
  - About 3 s after navigation on a first load, the header read "Choose a flow to edit". The canvas meanwhile showed the generic 8-node template ("Hello! This is Vaani Labs calling on behalf of your company…") with "8 nodes / 8 links" and the "FLOW VALIDATED" badge. Flow A then replaced it.
  - On later loads the canvas stayed empty for about 2.6 s (0 nodes, no flow selected), and Flow A's 26 nodes appeared at about 4.7 s.
- **Screenshots:** `audit/screenshots/va-flow-canvas/10_default.png`, `audit/screenshots/va-flow-config/20_fb_load.png`, `audit/screenshots/va-flow-config/21_load_1s.png`, `audit/screenshots/va-verify-flow-canvas/09_load_3s.png`
- **Recommendation:**
  - Until `/api/auth/me` and `/api/flows` resolve and the target flow id is known, show a skeleton for the header and canvas with placeholder node shapes.
  - Show the default template only when the account has no flows at all, and then as an empty state with "Create your first flow".
  - Keep editing and autosave off until hydration finishes (F-FLOW-002).
  - Put the flow id in the URL (`/flow-builder/:id`) so the canvas can fetch the flow without waiting for `/api/auth/me`, which cuts the roughly 4.7 s time-to-canvas.
