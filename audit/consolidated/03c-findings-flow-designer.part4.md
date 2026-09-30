
### F-FLOW-021 — No snapping, alignment guides or auto-layout, so flows drift into overlaps and crossing edges
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-17, DESIGN-RESEARCH-04 (node-overlap part), VISUAL-AUDIT-10 (auto-layout part)
- **Pages:** /flow-builder
- **Evidence:**
  - **No snapping or guides:** after a drag, the node sits at fractional coordinates, `translate(714.949px, 476.093px)`. No helper lines appear while dragging.
  - **No layout command:** there is no "Tidy" or auto-layout in the toolbar or the "…" menu.
  - **Real flows already show the damage:**
    - Flow A: the "Knowledge Lookup" box overlaps "Confirm Interest" and hides its question text.
    - Flow B: 12+ edges converge on one node and cross each other.
    - Flow C: a NO edge loops back behind the cards.
  - **Edge style:** every edge is a default bezier. There are no orthogonal or step edges and no reroute points.
- **Screenshots:** `audit/screenshots/va-flow-canvas/25_node_dragging.png`, `audit/screenshots/va-flow-canvas/45_airport_fit.png`, `audit/screenshots/va-visual-audit/flow-builder_node_zoom.png`, `audit/screenshots/scout_flow-builder.png`
- **Recommendation:**
  - Turn on `snapToGrid` with a 16 px grid, and show alignment and spacing guides while dragging.
  - Add "Tidy layout" (dagre or elk; top-down or left-right) as a single undoable command.
  - When a loaded flow has overlapping nodes, show an "Overlapping steps · Fix layout" banner. Don't move nodes silently, because autosave would then write the change.
  - Use `smoothstep` edges with rounded corners for flows with many branches. Add reroute points, and a merge node for many-to-one joins.

### F-FLOW-022 — The canvas gets only 36–52% of the screen, squeezed by two header rows, a fixed palette and a docked inspector (down to 294 px wide at 1024)
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-20, FLOW-CONFIG-16, VISUAL-AUDIT-10 (header-height part)
- **Pages:** /flow-builder at 1440, 1280 and 1024 px
- **Evidence:**

  | Viewport | Canvas pane | Share of viewport |
  |---|---|---|
  | 1440x900 | 1043x651 | 52% |
  | 1440x900, inspector open | 711x651 | 36% |
  | 1280x720 | 882x513 | — |
  | 1024x768 | 626x561 | — |
  | 1024x768, inspector open | **294 px wide**, mostly covered by the ~200x150 minimap | — |

  - **Chrome above the canvas:** the 42 px wallet banner plus two header rows (about 128 px), roughly 180 px in total.
  - **Palette:** fixed at 288 px. It can collapse, but the collapsed state isn't remembered.
- **Screenshots:** `audit/screenshots/va-flow-config/62_1024_panel_open.png`, `audit/screenshots/va-flow-canvas/55_1024x768.png`, `audit/screenshots/va-flow-canvas/54_1280x720.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`
- **Recommendation:**
  - Merge the header into one 48–56 px bar: flow-name dropdown, status chip, primary action and an overflow menu.
  - Inside the builder, collapse the wallet banner into a header chip.
  - While the inspector is open, auto-collapse the palette to a 56 px icon rail, and remember the palette state per user.
  - Below 1280 px, make the inspector overlay the canvas (or let users resize it between 280 and 480 px), and pan the selected node into the visible area.
  - Hide the minimap automatically when the canvas is narrower than 600 px.

### F-FLOW-023 — The minimap covers canvas content, can't be hidden, and looks like a grey slab in light mode
- **Severity:** medium · **Confidence:** multi-agent
- **Source findings:** FLOW-CANVAS-16, VISUAL-AUDIT-10 (minimap part)
- **Pages:** /flow-builder
- **Evidence:**
  - **Size and placement:** 202x152 in the bottom-right corner.
  - **Covers content:**
    - With the inspector open it covers Condition, Lead-questions and WhatsApp nodes.
    - At 1024x768 it covers about 8.5% of the canvas and sits on top of nodes.
  - **No control:** there's no toggle, and the minimap disappears in full-screen mode.
  - **Grey slab in light mode:** its `rgba(0,0,0,.38)` mask over a white panel reads as a solid grey block.
  - **No legend:** minimap nodes are coloured by type, but nothing says what the colours mean.
- **Screenshots:** `audit/screenshots/va-visual-audit/flow-builder_minimap_zoom.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`, `audit/screenshots/va-flow-canvas/55_1024x768.png`
- **Recommendation:**
  - Add a minimap toggle to the canvas controls, remembered per user.
  - Shrink the default to about 160x100.
  - In light mode, use a `rgba(15,23,42,.08)` mask with the viewport rectangle outlined.
  - Pad `fitView` so content never ends up under the overlays.
  - Keep the minimap in full-screen mode.

### F-FLOW-024 — Documented shortcuts don't work (Shift+click multi-select, double-click inline edit), and the shortcuts dialog is clipped and shows the wrong platform's keys
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-12, FLOW-CANVAS-13, FLOW-CANVAS-18
- **Pages:** /flow-builder, /flow-builder ("?" dialog)
- **Evidence:**
  - **The dialog:**
    - It is 451x823 at y=148, so 71 px falls below the 900 px viewport and the last row is cut off.
    - Redo reads "Cmd Shift Z" on Windows, while the toolbar tooltip says Ctrl+Shift+Z.
    - Missing entries: zoom, fit, pan, the Delete key, connect, add node and search.
    - Focus isn't moved into it (F-FLOW-006).
  - **Multi-select:**
    - Shift+click on a second node selects only that node. Ctrl+click keeps only the first. Meta+click clears the selection.
    - Only Shift+drag box selection works, and it selects only fully enclosed nodes.
    - With 2 nodes selected there's no count and no bulk-action bar.
  - **Inline edit:** double-clicking a title opens the same side inspector as a single click, and the double-click text-selects the "Editing …" chip. The flow-config notes (§3.8) confirm this.
- **Screenshots:** `audit/screenshots/va-flow-canvas/35_shortcuts.png`, `audit/screenshots/va-flow-canvas/26_shift_multiselect.png`, `audit/screenshots/va-flow-canvas/28_box_selected.png`, `audit/screenshots/va-flow-canvas/41b_inline_edit_full.png`, `audit/screenshots/va-flow-config/49_keyboard_shortcuts.png`
- **Recommendation:**
  - **Multi-select:** set React Flow `multiSelectionKeyCode={['Shift','Control','Meta']}` so these keys toggle selection. Show an "N selected" chip and a floating action bar (Delete, Duplicate, Align, Group). Offer partial-overlap box selection with Alt held.
  - **Inline edit:** either build it (an input at least 14 px on screen whatever the zoom; Enter commits, Esc cancels) or change the copy to "Click a step to edit it in the side panel".
  - **Dialog:**
    - Cap it at 80vh with internal scroll, in two columns.
    - Group the rows: Edit / Select / Navigate / View.
    - Detect the platform for modifier-key labels.
    - List only shortcuts that work.

### F-FLOW-025 — Deleting a node leaves a ghost inspector and gives no feedback
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-14
- **Pages:** /flow-builder
- **Evidence:**
  - After Backspace the node disappears, but the inspector still shows "SPEAK NODE · ID node_1790420907202 · Label New Speak Node · Delete Node", and the header chip still reads "Editing New Speak Node".
  - Nothing is announced in the live region, and the status stays "Up to date".
  - The verifier also saw no toast after deleting a connected node (F-FLOW-001).
- **Screenshots:** `audit/screenshots/va-flow-canvas/20_after_delete_key.png`, `audit/screenshots/va-verify-flow-config/02_after_backspace.png`
- **Recommendation:**
  - On delete, close the inspector and clear the "Editing" chip.
  - Show a toast ("Deleted 'New Speak Node' and 2 connections · Undo") and announce "Deleted New Speak Node" in the live region.
  - When the deleted node had both incoming and outgoing edges, offer "Reconnect neighbours", which joins the previous step to the next one.

### F-FLOW-026 — Paste and the palette create identically named, overlapping duplicates
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CANVAS-15
- **Pages:** /flow-builder
- **Evidence:**
  - **Paste:** Ctrl+C / Ctrl+V on "Greet & Introduce" creates another "Greet & Introduce" at +50,+50, overlapping the original. Edges aren't copied. The announcement is just "Pasted."
  - **Palette:** adding Speak twice creates a second "New Speak Node".
  - **In live Flow A:**
    - 8–9 nodes titled "Lead questions" or "Lead - questions" (FLOW-CONFIG counted 5 + 3, FLOW-CANVAS counted 9), 3 "Condition Check" and 3 "Knowledge Lookup";
    - ids like `node_…-copy-…-copy-…-copy-…`.
  - **Result:** validator messages and Jump targets become ambiguous.
- **Screenshots:** `audit/screenshots/va-flow-canvas/53_copy_paste.png`
- **Recommendation:**
  - Auto-suffix names on paste and add ("Greet & Introduce (copy)", "Speak 2").
  - Paste at the cursor, or in the nearest free space.
  - Add "Duplicate with connections" (Ctrl+D) that keeps edges within the selection.
  - Generate fresh short ids instead of chaining "-copy-" segments.
  - Show step numbers on nodes (S1, Q2…).
  - Raise a validator warning for duplicate labels.

### F-FLOW-027 — Each node type has 3–4 different names across the palette, canvas, panel and toast
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-13
- **Pages:** /flow-builder
- **Evidence:**
  - The name changes from palette to canvas to panel:

    | Palette | Canvas default | Panel title |
    |---|---|---|
    | Knowledge Query | "Knowledge Lookup" | KNOWLEDGE |
    | CRM Lookup | "Live Lookup" | LIVE LOOKUP |
    | Book Meeting | "Schedule" | SCHEDULE NODE |
    | WhatsApp | "Send WhatsApp" | WHATSAPP NODE |
    | Human Handoff | "Transfer Call" | TRANSFER NODE |
    | Branch | "Condition Check" | CONDITION |

  - Canvas nodes carry no type word. In Flow A, a Speak node labelled "Transfer Call" sits next to the real Transfer node and looks like the same kind of step.
- **Screenshots:** `audit/screenshots/va-flow-config/26_panel_HumanHandoff.png`, `audit/screenshots/va-flow-config/26_panel_Branch.png`, `audit/screenshots/va-flow-config/25_panel_crm_lookup.png`
- **Recommendation:**
  - Keep one canonical name per type in a single node-type registry, used by the palette, node badge, panel title, toast, validator and docs. For example: "Transfer to human", "CRM lookup", "Book meeting", "Condition", "Knowledge lookup".
  - Put a small type badge (icon plus type word, at least 11 px on screen) on every node, so a custom label can't disguise its type.

### F-FLOW-028 — Template variables have no picker, and unknown variables are accepted without warning
- **Severity:** medium · **Confidence:** single-agent
- **Source findings:** FLOW-CONFIG-12
- **Pages:** /flow-builder (Speak node)
- **Evidence:**
  - The only guidance is the helper text "Use {{lead_name}} and {{company_name}} for dynamic content".
  - Typing `{{` offers nothing.
  - `{{unknown_var}}` is accepted, shown on the canvas and not flagged by Validate.
- **Screenshots:** `audit/screenshots/va-flow-config/33_speak_variable_typing.png`, `audit/screenshots/va-flow-config/34_speak_unknown_var.png`
- **Recommendation:**
  - Add an "Insert variable" button and `{{` autocomplete listing lead fields, captured answers and CRM fields.
  - Show tokens as chips, and mark an unknown variable with an inline error and a validator error.
  - Under the message, preview the spoken line with sample values filled in.
