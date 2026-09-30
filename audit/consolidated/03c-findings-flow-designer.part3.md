
### F-FLOW-012 — Flow identity is ambiguous: duplicate names, hidden versions, no current or live marker, and switching keeps the previous flow's viewport
- **Severity:** high · **Confidence:** partially-verified
- **Source findings:** FLOW-CONFIG-06, FLOW-CANVAS-09
- **Pages:** /flow-builder (ALL FLOWS modal), /dashboard, /meeting-agent
- **Evidence:**
  - **Duplicate names.** The ALL FLOWS modal (896 px) lists 16 flows, including 3 pairs with identical names. Within the builder the pairs differ only by last-edited date.
  - **No flow status in the list.**
    - The row for the open flow isn't highlighted (every row has a transparent background).
    - There is no Live or Active badge.
    - There is no visibility column, although the API's `is_public` differs across flows.
    - OPEN is the only row action.
  - **Confusing sort.** Rows are sorted by `created_at` descending, a column the modal doesn't show. So the visible LAST EDITED column looks random (4 Sept, 21 Sept, 15 Sept, 26 Sept, 28 Aug…), and the headers can't be clicked to sort.
  - **Versions.**
    - Names carry "(v2)", "(v3)" and "(v6)". The API stores `version_no` and `parent_flow_id`, but the UI never shows the lineage.
    - The lineage data is inconsistent: the active "(v2)" flow has `version_no` 3, and its parent is an unrelated demo flow.
    - AI-draft flows are stored as "Generated: <prompt text> ... (v2)", with a literal "...".
  - **Naming differs by page.**
    - The Cockpit tells duplicates apart with hashes ("· f9b04a").
    - The Meeting Agent's 17 options list the duplicates identically.
    - The builder header truncates long names ("…Tele Calling Scri…").
  - **Viewport carry-over.** Switching flows keeps the previous transform exactly. Flow A → Flow B kept `translate(257.588,24.64) scale(0.7119)`, and Flow B → Flow C kept `translate(51,-554.5) scale(1)`. Flow C opened showing fragments, with Start off-screen. One click on Fit View recovers it, so the verifier rated this part medium.
- **Screenshots:** `audit/screenshots/va-flow-config/05_flow_switcher.png`, `audit/screenshots/va-flow-config/52_flow_switcher_bottom.png`, `audit/screenshots/va-flow-config/54_cockpit_flow_selector.png`, `audit/screenshots/va-flow-config/55_meeting_agent_conversation_flow.png`, `audit/screenshots/va-flow-canvas/12_switcher_open.png`, `audit/screenshots/va-flow-canvas/47_flow_srv_asloaded.png`, `audit/screenshots/va-verify-flow-canvas/08_srv_open.png`
- **Recommendation:**
  - Model one flow as one entity with revisions (v1…vN, each with author, timestamp and note; view, compare and restore). Show the existing `version_no` / `parent_flow_id` data, and repair the inconsistent lineage.
  - Enforce unique names per organisation: the server returns 409 on a clash, and duplicating auto-suffixes "(copy 2)".
  - Give the switcher these columns: Name, Status (Live / Unpublished changes / Archived), Visibility, Nodes, Last edited (the default sort, descending) and Owner. Make the headers sortable.
  - Highlight the open flow's row ("Open now") and add a row menu: Rename, Duplicate, Archive, Set live.
  - Use the same display name plus a disambiguator (short id or created date) in the Builder, Cockpit and Meeting Agent. Show the full name in a tooltip, or truncate the middle of the name instead of the end.
  - Save the viewport per flow id. Every time a flow opens, restore its saved viewport or fit to content.

### F-FLOW-013 — There's no real "create flow" journey, and the default template is itself broken
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-08
- **Pages:** /flow-builder (More actions → New flow)
- **Evidence:**
  - **Hidden and next to a destructive action.** "New flow" is the third item in the "…" menu, directly above "Reset to default". There is no separator, and both use the same colour (rgb 62,71,90).
  - **No setup step.** Clicking it instantly swaps in an 8-node, 8-link template. There's no name prompt, no blank-canvas option, no choice of template and no confirmation.
  - **Confusing state afterwards.**
    - The header reads "Choose a flow to edit" and the chip reads "Up to date".
    - ACTIVATE, Private and trash are disabled at opacity 0.4.
    - The reasons appear only in native tooltips ("Save the flow first to activate it").
    - No PUT is sent to the active flow, which is correct.
  - **The template is broken.**
    - It fails Validate with 1 error ("Confirm Location" is missing a connection).
    - Its Preview AI script prints "Duration: undefined minutes".
- **Screenshots:** `audit/screenshots/va-flow-config/45_more_actions_menu.png`, `audit/screenshots/va-flow-config/46_new_flow_click.png`, `audit/screenshots/va-flow-config/48_preview_script_newflow.png`, `audit/screenshots/va-flow-config/50_validate_default_template.png`, `audit/screenshots/va-verify-flow-config/08_new_flow.png`, `audit/screenshots/va-verify-flow-config/09_new_flow_validate.png`
- **Recommendation:**
  - Put a primary "+ New flow" button beside the switcher and inside the ALL FLOWS modal.
  - It opens a create dialog with:
    - Name (required, unique);
    - use case / category;
    - language and agent voice;
    - a starting point: Blank (Start → End), Template gallery (with previews) or AI draft.
  - Persist the new flow straight away as a draft, so ACTIVATE and Private have a real target. Label it "Draft · not live".
  - Fix the template: add Confirm Location's missing branch, and default the Schedule duration to 30 min so the compiled prompt never prints "undefined".
  - Add a CI check that every template passes the validator and compiles with no "undefined" or "null".
  - Move "Reset to default" into a danger section (F-FLOW-019).

### F-FLOW-014 — The builder doesn't show which flow is live, "active" means different things on different pages, and Private looks like a label
- **Severity:** medium (auditor: high; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-07
- **Pages:** /flow-builder, /meeting-agent
- **Evidence:**
  - The open flow is the account's `active_flow_id`, but the builder shows no Live or Active text or badge anywhere.
  - ACTIVATE (title "Activate this flow for all your calls") is enabled and looks identical on a flow that is already active.
  - The active flow is stored on the user record (`/api/auth/me` → `active_flow_id`). This fits the Meeting Agent's "Active flow (from profile)" option but contradicts "all your calls". That option also never names the flow.
  - Private is a `<button>` with `cursor: default`, `aria-pressed=false` and a grey pill style. It reads as a static label, and nothing says what the alternative to Private is.
  - Only the Cockpit's `FLOW:` select reveals the active flow.
- **Screenshots:** `audit/screenshots/va-flow-config/55_meeting_agent_conversation_flow.png`, `audit/screenshots/va-flow-config/54_cockpit_flow_selector.png`, `audit/screenshots/va-ux-audit/crop_flow_toolbar.png`
- **Recommendation:**
  - Show a "LIVE" pill next to the flow name when the open flow is active. On that flow, turn ACTIVATE into a disabled "Live ✓", or "Publish changes" once a draft differs.
  - Wherever "Active flow" appears, name the flow: "Active flow: <name> (short id)".
  - Decide whether the active flow is per user or per organisation, and say so in the ACTIVATE tooltip and in settings copy.
  - Replace Private with a visibility menu button ("Visibility: Only me ▾ / Team") with `aria-haspopup` and a pointer cursor, or with a real switch (`role=switch`, `aria-checked`).

### F-FLOW-015 — Invalid field values are accepted, applied and autosaved (blank flow name, "abc" phone number, 999 attempts)
- **Severity:** medium · **Confidence:** partially-verified
- **Source findings:** FLOW-CONFIG-09, FLOW-CONFIG-17
- **Pages:** /flow-builder (Flow settings; Transfer, Verify Customer and node labels)
- **Evidence:**
  - **Blank flow name (verified):**
    - The field has `required=false` and `aria-invalid` is null; it reports as valid and shows no message.
    - The switcher becomes an empty pill (aria-label "Current flow: . Click to choose a different flow.").
    - A PUT fired 3.1 s later.
  - **Transfer number "abc":** the field gets a red border, the helper "Must start with country code (e.g. +91)" and `aria-invalid=true`. The value is still applied (the canvas shows "To: abc") and autosaved.
  - **Verify attempts:** 999 and −5 are accepted (min 1, max 5). Only the browser's validity is false; no message is shown.
  - **Node labels** can be cleared. The validator then refers to the node by its raw id.
- **Screenshots:** `audit/screenshots/va-verify-flow-config/11_blank_name.png`, `audit/screenshots/va-verify-flow-config/12_blank_name_header.png`, `audit/screenshots/va-flow-config/43_blank_flow_name_header.png`, `audit/screenshots/va-flow-config/28_transfer_invalid_abc.png`, `audit/screenshots/va-flow-config/32_verify_attempts_invalid.png`, `audit/screenshots/va-flow-config/29_transfer_label_cleared.png`
- **Recommendation:**
  - Define a field schema per node type (for example with zod) and validate on change and on blur. Show the error text inline, linked with `aria-describedby`.
  - Let the input keep the invalid text but commit only valid values to the graph, or commit with an error flag the validator reports.
  - **Flow name:** required, trimmed and unique; if it's empty on blur, revert to the last valid name.
  - **Numeric fields:** clamp them, or show "1–5 attempts".
  - **Node labels:** required, with a fallback of "Untitled <type>".

### F-FLOW-016 — You can't test or simulate a flow inside the builder
- **Severity:** medium (auditor: high; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-10
- **Pages:** /flow-builder
- **Evidence:**
  - No builder control matches test, simulate, try, dry-run or call-me.
  - The only preview is "Preview AI script", a 672x428 modal:
    - Its scroll box is 230 px tall for 1,612 px of raw system prompt.
    - The prompt includes "CRITICAL EXECUTION RULES", the tool names `schedule_meeting` and `send_whatsapp`, and "Duration: undefined minutes".
    - Branches are laid out in a confusing order: Step 7 END appears before the "If NO" branch.
    - Steps don't link back to nodes, there is no copy button, and Close is the only button.
  - Test Call lives in the Cockpit and runs the active flow, the same record the builder autosaves into (F-FLOW-001).
- **Screenshots:** `audit/screenshots/va-verify-flow-config/10_preview_script.png`, `audit/screenshots/va-flow-config/48_preview_script_newflow.png`, `audit/screenshots/va-flow-canvas/38_preview_script.png`
- **Recommendation:**
  - Add a "Test" side panel with a text simulator. It shows agent turns and takes user replies, typed or via Yes/No and True/False quick replies. It highlights the current node and animates only the edge being taken.
  - Let testers fill in sample values for `{{lead_name}}` and other variables.
  - Add "Call me with this draft", which places a test call using the draft revision, never the live one.
  - Keep the prompt preview as an "Advanced" tab: max-height 70vh, a copy button, and each step linked to its node.

### F-FLOW-017 — The editor lacks the professional tooling a live-call workflow needs
- **Severity:** medium (auditor: high; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-24
- **Pages:** /flow-builder
- **Evidence:**
  - **What exists:**
    - Toolbar: AI draft, Settings, Undo, Redo, Copy, Paste, Validate, Preview AI script, Full-screen, Shortcuts, More (Export JSON, Import JSON, New flow, Reset to default), Private, Delete, Save and ACTIVATE.
    - Canvas controls: Zoom In, Zoom Out, Fit View and Toggle Interactivity.
  - **Missing:**
    - canvas search / jump to node;
    - version history, diff and restore;
    - draft vs publish;
    - sticky notes, frames and groups (the palette has no such items);
    - simulation;
    - a variables panel;
    - a legend;
    - auto-layout;
    - a zoom % readout;
    - per-node analytics from Call Reports, such as drop-off or the Yes/No split.
- **Screenshots:** `audit/screenshots/va-flow-canvas/36_more_menu.png`, `audit/screenshots/va-verify-flow-canvas/18_more_menu.png`, `audit/screenshots/va-ux-audit/crop_flow_toolbar.png`
- **Recommendation (priority order):**
  1. Draft/publish and version history (F-FLOW-001, F-FLOW-012).
  2. Issues shown on nodes, plus a Problems drawer (F-FLOW-010).
  3. A simulator (F-FLOW-016).
  4. Ctrl+F canvas search with next/previous (F-FLOW-008).
  5. An optional per-node funnel overlay from Call Reports (reach %, Yes/No split, drop-off).
  6. Sticky notes, and frames for sections (Greeting, Qualification, Booking, Close) that move their child nodes with them.
  7. A variables panel listing lead fields, captured answers and CRM fields.
  8. A legend popover for node types and edge meanings.

### F-FLOW-018 — Toolbar hierarchy: two filled primary buttons with mismatched styling, and an unexplained Save
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** DESIGN-RESEARCH-03, UX-AUDIT-18 (toolbar part), VISUAL-AUDIT-10 (Save/ACTIVATE part)
- **Pages:** /flow-builder
- **Evidence:**
  - **Two filled primaries, styled differently:**

    | | Save | ACTIVATE |
    |---|---|---|
    | Fill | blue rgb(47,95,224) | green rgb(23,138,85), with a glow |
    | Radius | 8 px | 12 px |
    | Case | Title case | UPPERCASE |
    | Text colour | black | white |
    | Size | 83x40 | 105x40 |

  - Save's black-on-blue text also fails contrast (3.83:1); this is tracked with the global primary-button finding.
  - AI draft is tinted as well.
  - **Icon-only buttons:** 9 of them. The shield (Validate) and eye (Preview) can't be identified without their tooltips.
  - **Unclear Save:** Save's purpose next to autosave is unexplained (F-FLOW-003).
  - **Destructive action in the primary group:** the trash "Destructive actions" button sits 8 px from Save, at the same visual weight.
- **Screenshots:** `audit/screenshots/scout_flow-builder.png`, `audit/screenshots/va-ux-audit/crop_flow_toolbar.png`, `audit/screenshots/va-visual-audit/flow-builder.png`
- **Recommendation:**
  - Keep one filled primary per toolbar: "Publish" / "Go live" (today's ACTIVATE), which opens a confirmation sheet with validation results and a diff.
  - Drop Save in favour of the autosave chip, or make it a secondary "Save version".
  - Share one button token set: 36–40 px height, the same radius, sentence case, white text on fills, and no glow.
  - Label Validate and Preview with text ("Check", "Preview") at widths of 1280 px and above. Move Copy, Paste, Full-screen and Shortcuts into the overflow menu.
  - Take destructive actions out of the "Save and ship" group (F-FLOW-019).

### F-FLOW-019 — Destructive actions are under-guarded where it matters and over-emphasised where it doesn't
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-22, FLOW-CONFIG-15, UX-AUDIT-18 (trash placement)
- **Pages:** /flow-builder ("…" and trash menus, node panels)
- **Evidence:**
  - **Under-guarded:**
    - "Reset to default" in the "…" menu is styled exactly like Export JSON: no separator, no red, no confirmation seen. It was not clicked. With autosave it would presumably overwrite the live flow (inferred).
    - The trash menu's "Delete flow" stays open after Escape.
    - Backspace deletes connected nodes without confirmation (F-FLOW-001) and without feedback (F-FLOW-025).
  - **Over-emphasised:**
    - Every inspector panel ends with a full-width, solid red "Delete Node" button (287x37, rgb(208,70,58)), the heaviest element in the panel.
    - Tab reaches it straight after the last field.
    - There is no Done or Apply.
- **Screenshots:** `audit/screenshots/va-flow-canvas/36_more_menu.png`, `audit/screenshots/va-flow-canvas/37_destructive_menu.png`, `audit/screenshots/va-flow-config/45_more_actions_menu.png`, `audit/screenshots/va-flow-config/26_panel_Speak_new.png`
- **Recommendation:**
  - **"…" menu:** add a separator and a red danger section with "Reset to default…". Confirm with a dialog that names the flow and says it replaces the current draft; version history makes this reversible.
  - **Delete flow:** require typing the name when the flow is live.
  - **All menus:** close on Esc and on an outside click (use an accessible menu primitive).
  - **Inspector:** replace the red slab with a trash icon in the panel header (`aria-label="Delete step"`) or a ghost "Delete step" link, backed by an undo toast. Add a "Done" primary that closes the panel.

### F-FLOW-020 — Branch outputs: only two outcomes, tiny handles whose meaning depends on position and is explained only in the inspector, and edges that can't be edited
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CONFIG-11, FLOW-CANVAS-25
- **Pages:** /flow-builder (Question, Branch, Verify Customer, edges)
- **Evidence:**
  - **Only two outcomes:**
    - Question offers YES/NO only.
    - Branch is a free-text condition with TRUE/FALSE only, so Flow A chains 3 Condition Checks to express three property types.
    - There is no "no answer / unclear / other" output and no way to save an answer to a variable.
  - **Outcome depends on position:** bottom = YES/TRUE/VERIFIED and right = NO/FALSE/FAILED. On the canvas the only cues are a green or red dot and a 10 px chip. The text "YES — connects from bottom handle" appears only in the inspector.
  - **Tiny targets:** handles are 12x12 (8.5 px on screen) with no larger hit area. WCAG 2.5.8 asks for 24x24.
  - **Edges can't be edited:** you can select an edge but can't label or delete it from a control, and double-clicking an edge label does nothing. Labels exist only on template edges.
- **Screenshots:** `audit/screenshots/va-flow-config/26_panel_Question.png`, `audit/screenshots/va-flow-config/26_panel_Branch.png`, `audit/screenshots/va-flow-config/58_edge_click.png`, `audit/screenshots/va-flow-canvas/23_connecting_drag.png`
- **Recommendation:**
  - **Question:** let authors define N answer options, each with its own labelled output, plus a mandatory "No response / Didn't understand" fallback and an optional "Save answer to {{var}}".
  - **Branch:** offer a structured condition builder (variable, operator, value) with N cases plus Else. Keep a natural-language option.
  - **Handles:** put all outputs on the bottom edge as labelled port tabs ("Yes", "No", "Else"). Make the visible handle 14–16 px, with a 24–32 px hit area and a hover halo.
  - **Edges:** when an edge is selected, show a popover to label it, change its outcome, delete it or insert a step.
