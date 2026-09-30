## 3C. Findings — Flow Designer

**Scope and test conditions.** Route `/flow-builder` at 1440x900, with spot checks at 1280x720 and 1024x768, dark mode and emulated reduced motion. It also covers the flow selectors on `/dashboard` (Agent Cockpit) and `/meeting-agent` where they affect flow identity. Sources: the two Flow Designer explorers (FLOW-CANVAS, FLOW-CONFIG), the adversarial verifier, and the flow-builder findings from UX-AUDIT, VISUAL-AUDIT and DESIGN-RESEARCH. All live testing ran behind a network guard that blocks writes: no edit was ever persisted. "Autosave" means the app *attempted* `PUT /api/flows/{id}` and the guard aborted it. A UI reaction to a blocked save is labelled "observed under simulated network failure". Nobody clicked Save, ACTIVATE, Private, Delete flow, Reset to default, Import JSON or AI-draft Generate.

**Flow labels used below** (instead of customer business names):
- **Flow A**: the account's active flow and the builder's default. 26 nodes, 27 links, id `f9b04a18…`.
- **Flow B**: an airport passenger support flow. 35 nodes, 47 links.
- **Flow C**: a tele-calling script. 9 nodes, 11 links.

### How the Flow Builder works today

**Purpose.** The Flow Builder is where a customer writes the call script the Vaani voice agent follows. It is a React Flow (xyflow) canvas, and the graph compiles into a natural-language system instruction, which you can see with "Preview AI script". Two other pages also select flows:
- The Agent Cockpit's `FLOW:` select, which also drives Test Call.
- The Meeting Agent's "Conversation flow" select.

**Layout (1440x900).**
- **Global wallet banner** (42 px) above everything.
- **Header row 1:**
  - The title "Flow Builder / VOICE JOURNEY WORKSPACE".
  - The flow switcher, which opens an "ALL FLOWS" modal: 16 flows, search, columns NAME / CATEGORY / LAST EDITED / OPEN, and pagination.
  - A status chip reading "Up to date".
- **Header row 2** (`role=toolbar`):
  - AI draft and Settings.
  - 9 icon-only buttons: Undo, Redo, Copy, Paste, Validate (shield), Preview AI script (eye), Full-screen, Shortcuts, and More actions. More actions contains Export JSON, Import JSON, New flow and Reset to default.
  - A "Save and ship" group: Private, trash (Delete flow), Save (blue) and ACTIVATE (green, with a glow).
- **Left palette** (288 px): "Add steps", a "+ 10" pill, search, START HERE (8 tiles), RECENTLY USED, CONVERSATION (5), ACTIONS (2) and KNOWLEDGE & CRM (3). You add items by clicking; dragging doesn't work.
- **Canvas card:**
  - A hint: "Drag nodes, connect handles, double-click to edit, press ? for shortcuts".
  - Chips for node and link counts.
  - A 1043x651 pane (52% of the viewport) at a default zoom of 0.712.
  - Overlays: a "FLOW VALIDATED" badge (top-left), zoom/fit/lock controls (bottom-left) and a 202x152 minimap (bottom-right).
- **Right inspector** (320 px): opens on a single click or a double-click. It shrinks the canvas to 711 px, which is 36% of the viewport.

**Nodes and config panels.**
- Every card node is 240 px wide with a `#EEF1F7` fill, a 13 px title coloured by type and an 11 px mono body. Type is shown only by title colour and a 12 px icon.
- Every panel contains a read-only ID, a Label field, the type-specific fields, helper text, a read-only Position and a full-width red "Delete Node" button.
- There is no Done or Apply. Changes apply live and autosave.

| Palette name → canvas default | Type-specific panel fields | Outputs |
|---|---|---|
| Start / End (fixed pills) | Label only; cannot be deleted | 1 out / none |
| Speak → "New Speak Node" | Message (hint: `{{lead_name}}`, `{{company_name}}`) | 1 |
| Question → "New Question" | Question text | YES ↓ bottom, NO → right |
| Branch → "Condition Check" | Free-text condition | TRUE ↓, FALSE → |
| Knowledge Query → "Knowledge Lookup" | Knowledge file (optional), search-query hint | 1 |
| CRM Lookup → "Live Lookup" | Connector, lookup-by field | 1 (no found/not-found) |
| Book Meeting → "Schedule" | Prompt, duration, meeting type, free-text slots; email / WhatsApp / Calendar switches | 1 |
| WhatsApp → "Send WhatsApp" | Template, attachment | 1 |
| Human Handoff → "Transfer Call" | Number (E.164) | 1 |
| Verify Customer | Question, source, field, match mode, attempts (1–5) | VERIFIED ↓, FAILED → |
| FAQ | Linked knowledge file, Q&A entries | 1 |

**Lifecycle.**
- **Autosave.** Every edit sends `PUT /api/flows/{id}` about 3–4 s later. Opening a flow sends one too, with no edit. The flow opened by default is the account's `active_flow_id` (per `/api/auth/me`), which is also the Cockpit's selected flow. So edits land on the script live calls use.
- **Save (Ctrl+S)** is always enabled. The UI doesn't explain what it adds on top of autosave.
- **ACTIVATE** ("Activate this flow for all your calls") is enabled even when validation finds errors. It looks the same whether or not the open flow is already active, and it is disabled only on an unsaved new flow.
- **Private** ("only visible to you") renders like a static pill.
- **Versions.** There is no version history. "Versions" are separate flows named "(v2)", "(v3)" or "(v6)". The API does store `version_no` and `parent_flow_id`, but the UI never shows that lineage.
- **Validation** runs only on demand (the shield button) and shows a floating panel with Jump buttons. The canvas badge always reads "FLOW VALIDATED".

**What the canvas communicates.**
- For flows of 9 nodes or fewer, the Start (green pill) → steps → End Call (red pill) path reads well at fit view.
- Real flows of 26–35 nodes become either a narrow, unreadable column or a dense web:
  - Titles render at 9.3 px at default zoom and 3.8 px at fit.
  - Branch edges are the same blue as the main path.
  - 25 of 27 edges animate.
  - Only one edge carries an outcome label.
- The canvas never shows:
  - whether a flow is inbound or outbound (no trigger config);
  - how a call ended (no outcome taxonomy on End);
  - any grouping (no groups or frames);
  - which flow is live.

**Strengths to keep:**
- Every toolbar button has an accessible name that includes its shortcut.
- A polite live region announces actions ("New Speak Node added.", "Connection added.").
- Validate → Jump zooms to the node, selects it and opens its panel.
- Palette search matches synonyms ("transfer" finds Human Handoff) and has a clear empty state.
- Preview AI script shows how the graph compiles into the agent's instructions.
- Undo restores deleted nodes.
- Dragging a connection gives clear target feedback.
- Viewport changes (zoom, pan, fit) don't trigger saves.
- Start and End are protected from deletion.

---

### F-FLOW-001 — Edits autosave directly into the live flow; there is no draft/publish separation, and Backspace deletes connected nodes without confirmation
- **Severity:** critical · **Confidence:** verified
- **Source findings:** FLOW-CONFIG-01, FLOW-CANVAS-01 (per-edit autosave part)
- **Pages:** /flow-builder, /dashboard (Cockpit `FLOW:` select)
- **Evidence:**
  - `/api/auth/me` returns `active_flow_id = f9b04a18…`. The builder auto-opens that flow, and the Cockpit `FLOW:` select shows it as selected ("… · f9b04a"). No draft copy exists anywhere.
  - Every edit sent `PUT /api/flows/f9b04a18…` about 3.0–4.0 s later: adding a node, typing in a field, clearing a label, clearing the flow name, dragging, nudging, and even the Validate panel's Jump, which only selects a node.
  - The PUT body includes `flow_config` with `system_instruction`. So every autosave rewrites the active agent's prompt.
  - Backspace on a selected node with 2 connections took nodes 26→25 and edges 27→25. There was no `confirm()`, no in-app dialog and no toast, and a PUT followed 3.0 s later.
  - The effect on live calls was not tested because writes were blocked. It is inferred, but nothing in the product could prevent it.
- **Screenshots:** `audit/screenshots/va-verify-flow-config/02_after_backspace.png`, `audit/screenshots/va-flow-config/59_backspace_delete.png`, `audit/screenshots/va-flow-config/08_after_autosave.png`, `audit/screenshots/va-flow-config/54_cockpit_flow_selector.png`
- **Recommendation:**
  - Add draft and published revisions. A flow keeps a `published_revision_id`; autosave writes only to a draft revision; the call runtime always reads the published revision.
  - Turn ACTIVATE into "Publish" (or "Go live"). It opens a confirmation sheet showing the validation result and a diff summary (nodes added, removed and changed; prompt changed), then promotes the draft.
  - Show the state in the header: "Live · v7" vs "Draft — 3 unpublished changes", with a "Discard draft" action.
  - When a connected node is deleted, show an undo toast ("Deleted 'X' and 2 connections · Undo", 5–8 s). Never delete silently.
  - On the server, require `If-Match` / `updated_at` on PUT and return 409 on a mismatch, so a stale tab can't overwrite a newer save.

### F-FLOW-002 — Opening or switching to a flow writes to it with no user action
- **Severity:** high (auditors: critical/high; verifier: high on FLOW-CANVAS-01, medium on FLOW-CONFIG-02) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-01, FLOW-CONFIG-02
- **Pages:** /flow-builder, /flow-builder (ALL FLOWS switcher)
- **Evidence:**
  - With zero input, `PUT /api/flows/f9b04a18…` fired on every reload the verifier ran: 4 of 4 in one check, 3.8–4.6 s after `GET /api/flows`, and on all 7 in another, 6.3–7.0 s after navigation. After that, 12 s of idle produced no further requests.
  - Opening another flow from the switcher wrote to that flow too: Flow B about 3.6 s after opening and Flow C about 5.1 s after (`PUT /api/flows/47e3147e…`, `/bf11c0a3…`).
  - The write changes no content. All 26 nodes have equal fields, the 27 edges have the same keys, and only the JSON key order differs. But it bumps `updated_at`: stored 10:39 UTC = 16:09 IST, which is exactly the switcher's "Last edited 26 Sept, 16:09". So "last edited" records visits, not edits.
  - Undo is enabled immediately after load, a phantom history entry (see F-FLOW-005).
  - Inferred: a stale tab that merely opens a flow can overwrite a teammate's newer save, because there is no concurrency check.
- **Screenshots:** `audit/screenshots/va-verify-flow-config/01_load_idle.png`, `audit/screenshots/va-flow-config/21_load_1s.png`, `audit/screenshots/va-flow-config/22_load_8s.png`, `audit/screenshots/va-flow-canvas/02_after_autosave_blocked.png`
- **Recommendation:**
  - Set the dirty flag only on changes the user made. Ignore hydration, React Flow `onNodesChange` events of type `dimensions`, `fitView` and selection changes.
  - Before each save, compare a stable hash (sorted keys) of the serialized flow with the last loaded or saved snapshot, and skip the save if they match.
  - On the server, treat a PUT whose content equals the stored content as a no-op that leaves `updated_at` alone. If the load-time rewrite exists to normalise the schema, run it once as a server-side migration.
  - Clear the undo stack after hydration.

### F-FLOW-003 — Save status is never truthful: "Up to date" is permanent, failures are silent, and a quick exit loses the last edit
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-11, FLOW-CONFIG-03
- **Pages:** /flow-builder
- **Evidence:**
  - After a node drag, the pill was polled every 200 ms for 6 s. All 30 samples read "Up to date". It never showed "Unsaved" or "Saving…".
  - Right after a node was added it read "Up to date". 5.5 s after the autosave PUT was blocked, it still read "Up to date", with no toast (observed under simulated network failure).
  - FLOW-CONFIG saw "Autosave failed" (red icon) once, after several blocked edits. The verifier never saw it, so failure reporting is inconsistent at best.
  - **Quick-exit test:** add a node, then navigate away 0.4 s later, by full page load or by the in-app sidebar link to /dashboard. There was no PUT, no `beforeunload` prompt and no flush, so the edit was silently lost.
  - After "New flow" plus edits (never persisted, no API call at all), the chip still read "Up to date".
  - The idle icon is a dashed circle that reads as a loading spinner.
  - Save is always enabled. Its only explanation is the tooltip "Save (Ctrl+S)", which doesn't say how it differs from autosave.
- **Screenshots:** `audit/screenshots/va-flow-canvas/49_after_edit_status.png`, `audit/screenshots/va-flow-config/30_validate_after_edits.png`, `audit/screenshots/va-verify-flow-config/03_chip_after_add.png`
- **Recommendation:**
  - Drive the chip from a save state machine:
    - "Saved · 12:04" with a static check icon;
    - "Unsaved changes" with an amber dot;
    - "Saving…" with a spinner;
    - "Couldn't save · Retry" in red, persistent until a save succeeds;
    - "Not saved yet" for new flows.
  - Flush any pending debounced save on in-app route change (navigation guard), on `visibilitychange` → hidden and on `pagehide`, using `fetch(…, {keepalive: true})`. Register `beforeunload` only while the state is dirty or saving.
  - Resolve what Save means. With draft/publish in place (F-FLOW-001), either remove Save and rely on the autosave chip, or relabel it "Save version" with an optional note, disabled when clean.
  - Retry failed writes with backoff and raise a toast on the first failure.

### F-FLOW-004 — "FLOW VALIDATED" shows on invalid flows, the validator checks wiring only, and ACTIVATE isn't gated
- **Severity:** high (auditor: critical; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-03, FLOW-CONFIG-04
- **Pages:** /flow-builder
- **Evidence:**
  - **The badge** is a 10 px mono span in `text-positive/70` (#59AA86 on #F4F6FA = 2.58:1) with an `animate-pulse` dot. It shows on every flow, including the default template that flashes during load, and is hidden only while the Validate panel is open in its place.
  - **Validate results while the badge said "validated":**
    - Flow A: 2 errors (an orphan Knowledge Lookup with no input and no output).
    - Flow B: 7 errors (Question nodes missing YES/NO connections).
    - The product's own New-flow template: 1 error (Question "Confirm Location" must have both YES and NO connections).
    - Flow A plus 3 unconnected new nodes: 9 errors, with the badge unchanged.
  - **What the validator misses:** every error it reports is about connectivity or YES/NO wiring. It does not flag:
    - a Speak node with its label and message cleared;
    - Transfer number "abc";
    - WhatsApp with no template;
    - Live Lookup with no connector;
    - Verify attempts set to 999;
    - an unknown `{{variable}}`;
    - a blank flow name;
    - duplicate labels.
  - **ACTIVATE** stays `disabled=false` at opacity 1 with 9 errors. Whether it validates on the server is unknown, because it was not clicked.
  - **Raw ids:** one error named a node by its raw id ("node_1790420966396") after its label was cleared.
- **Screenshots:** `audit/screenshots/va-verify-flow-canvas/01_load.png`, `audit/screenshots/va-verify-flow-canvas/05_airport_badge.png`, `audit/screenshots/va-flow-canvas/46_airport_validate.png`, `audit/screenshots/va-flow-config/14_validate_fresh.png`, `audit/screenshots/va-flow-config/50_validate_default_template.png`, `audit/screenshots/va-verify-flow-config/04_validate_with_added.png`, `audit/screenshots/va-verify-flow-config/05_validate_empty_greet.png`
- **Recommendation:**
  - Replace the static badge with a live chip, recomputed on every graph change (debounced 300–500 ms): "No issues", "2 errors · 3 warnings" or "Checking…". Text at 4.5:1 or better, no pulse. Clicking it opens the Problems list (F-FLOW-010).
  - Add per-type rules.
    - Errors: empty Speak message or Question text; invalid E.164 number; WhatsApp without a template; Live Lookup without a connector; attempts outside 1–5; unknown variables; blank flow name; unreachable nodes; required outputs left unconnected.
    - Warnings: duplicate labels, disconnected integrations, and a missing fallback path.
  - Gate publishing. Disable ACTIVATE/Publish while errors exist and show the reason inline. Allow warnings through "Publish anyway". Run the same validator on the server at activation and return 422 with the list of issues.
  - Always name nodes by label, falling back to "Untitled Transfer step (step 7)". Never show raw ids.

### F-FLOW-005 — Undo doesn't revert node additions and is enabled with nothing to undo
- **Severity:** high (auditor: critical; verifier downgraded) · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-02, FLOW-CONFIG-23 (Undo part)
- **Pages:** /flow-builder
- **Evidence:**
  - On freshly loaded Flow A, Undo is enabled and Redo disabled. Two Undo clicks changed nothing, and Undo stayed enabled.
  - Palette "Speak" took nodes from 26 to 27. Ctrl+Z announced "Undone.", but the node (same id) stayed. After 3 more toolbar Undos there were still 27 nodes.
  - Ctrl+Y announced "Redone." with no change, and Redo stayed disabled. The status chip stayed "Up to date" throughout.
  - Undo *does* restore a node deleted with Backspace, and Ctrl+Y deletes it again. So deletions are recorded but additions are not, and the history is only partial and can't be trusted.
- **Screenshots:** `audit/screenshots/va-flow-canvas/16_undo_after_load.png`, `audit/screenshots/va-flow-canvas/17_after_palette_click.png`, `audit/screenshots/va-flow-canvas/18_after_3_undos.png`, `audit/screenshots/va-flow-config/56_undo_after_load.png`, `audit/screenshots/va-verify-flow-canvas/03_after_undos.png`
- **Recommendation:**
  - Keep one history stack that records every graph change: add, paste, connect, disconnect, delete, move (one entry per drag end), inspector edits (typing coalesced per field focus), AI-draft replace and Reset.
  - Start the stack empty after hydration, and bind Undo/Redo `disabled` to the stack lengths.
  - Announce the specific action ("Undid: add Speak node"), and only when something actually changed.
  - Add a regression test: add, then undo, and assert the node count is restored.
