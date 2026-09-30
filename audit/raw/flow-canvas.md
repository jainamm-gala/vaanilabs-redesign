# Flow Builder: canvas and interaction audit

- Product: https://vaanilabs.in/flow-builder (live production, signed-in customer account)
- Auditor role: Flow Designer, canvas and interaction specialist (agent `va-flow-canvas`)
- Date: 2026-09-26
- Viewport: 1440x900 (plus spot checks at 1280x720 and 1024x768, dark mode, reduced motion)
- Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-flow-canvas/` (files 01–07 come from the interrupted earlier run and were re-checked live. Files 10–55 come from this run.)
- Browser status: session stayed signed in for the whole run (no LOGGED_OUT). My private window was closed at the end.

---

## 0. Method and guard caveats

- I used one private browser window with a network guard that blocks writes. It aborts every non-GET request, all websockets and analytics. Any save or autosave in my tab failed on purpose. I do **not** report those failures as bugs. Where I describe how the UI communicates a failed save, I label it "observed under simulated network failure".
- I did not click anything that saves. Every canvas edit was local and was thrown away by reloading. I never clicked Save, ACTIVATE, Private, the trash menu item "Delete flow", AI draft generate, "Reset to default", Import/Export JSON or "New flow".
- I tested three flows from the switcher:
  - **Client A Realty (v2)**: 26 nodes, 27 links. This is the flow the builder opens by default.
  - **Airport Passenger Support Flow**: 35 nodes, 47 links. It is wide and fans out.
  - **Client C Media - Tele Calling Script**: 9 nodes, 11 links. It is small.
  - I also saw the built-in default template (8 nodes, 8 links) briefly during page load.
- Measurements come from `getComputedStyle` and `getBoundingClientRect` on the live DOM. Contrast ratios use the WCAG 2.x relative-luminance formula. Canvas background is approximated as rgb(244,246,249).
- Privacy: node contents include a real transfer phone number and customer-facing scripts. They are not reproduced here. Flow names are business or flow titles only.

---

## 1. What the Flow Builder is (product understanding)

The Flow Builder is where a customer writes the conversation "script" the Vaani voice agent follows on a phone call. It is a React Flow (xyflow) canvas: the root has class `react-flow flow-builder-canvas light`, with `.react-flow__minimap` and `.react-flow__controls`.

- **Node types seen:**
  - `start` (Start Call pill)
  - `speak`
  - `question` (YES and NO outputs)
  - `condition` (TRUE and FALSE outputs)
  - `knowledge_lookup`
  - `whatsapp`
  - `transfer`
  - `schedule` / Book Meeting
  - `end` (End Call pill)
  - one unknown type rendered as React Flow `default`
- **Palette groups:**
  - START HERE: 8 shortcuts
  - CONVERSATION: Speak, Question, Branch, Human Handoff, Verify Customer
  - ACTIONS: 2 items
  - KNOWLEDGE & CRM: 3 items
- **Compilation:** "Preview AI script" (eye icon) shows the natural-language system instruction the flow compiles into ("Step 1: START … Step 2: SPEAK …").
- **Shipping:** "ACTIVATE" (tooltip "Activate this flow for all your calls") makes a flow the live script. "Private" controls visibility. "Settings" holds identity, Soul.md and voice verification. That drawer is covered by the sibling flow-config agent.
- **Links to the rest of the product:**
  - Dashboard: flow selector and Test Call
  - Call Reports: flow fields extracted per call
  - Knowledge: Knowledge Lookup nodes query uploaded documents
  - Leads: variables `{{lead_name}}` and `{{company_name}}` in Speak messages
- **Autosave:** the builder autosaves by issuing `PUT /api/flows/{id}`. This happens in addition to the explicit Save button (see FLOW-CANVAS-01).

**Intended journey:** pick or draft a flow → add steps from the palette → connect handles (YES/NO, TRUE/FALSE) → edit each node in the right-hand inspector → validate → preview the AI script → Save → ACTIVATE → test from the Dashboard.

---

## 2. Layout anatomy (1440x900)

| Region | Position / size | Notes |
|---|---|---|
| Global wallet banner | y 0–42 | "Wallet empty…" with Top up, Enable autopay and Dismiss. Takes 42px from the canvas. |
| Header row 1 | y 56–96 | Icon tile. H1 "Flow Builder" plus mono uppercase subtitle "VOICE JOURNEY WORKSPACE". Flow switcher button (206x40): `aria-label="Current flow: Client A Realty (v2). Click to choose a different flow."`. Status pill "Up to date" with a dashed-circle icon. |
| Header row 2 (toolbar) | y 113–153 | `role=toolbar` "Flow builder controls". It contains:<br>• AI draft (102x40)<br>• Settings (102x40)<br>• group "Editor actions" (9 icon buttons, 36x36 each)<br>• group "Save and ship": Private (81x40), trash "Destructive actions" (40x40), Save (83x40, blue), ACTIVATE (105x40, green) |
| Left palette | x 85–372, y 182–887 (288 wide) | Title "Add steps", subtitle "PICK A TOOL, THEN CONNECT IT", a "+ 10" badge, collapse button, search, then the groups. |
| Canvas card | x 385–1427, y 182–887 | Header: green dot + "Canvas" + hint "Drag nodes, connect handles, double-click to edit, press ? for shortcuts." plus chips "26 nodes" and "27 links". React Flow pane is 1043x651. |
| Canvas overlays | inside pane | "FLOW VALIDATED" badge (top-left, 10px mono). Controls (zoom in/out, fit, lock; 34x34 each, bottom-left). Minimap 202x152 (bottom-right). |
| Right inspector | x 1109–1427 when a node is selected | The canvas shrinks from 1043 to 711px wide. The minimap stays the same size and covers more content. |

- The canvas pane is 1043x651 = 678,993 px², which is 52% of the 1440x900 viewport. With the inspector open it is 711x651 = 36%.
- At 1280x720 the canvas is 882x513, and 12 of 26 nodes are visible at default zoom.
- At 1024x768 the canvas is 626x561. The 200x150 minimap then covers about 8.5% of it and sits on top of nodes (screenshot `55_1024x768.png`).

### Toolbar inventory (from aria-label / title)
| Visible | aria-label | title | State at load |
|---|---|---|---|
| AI draft | Open AI flow generator | Generate a flow with AI | enabled |
| Settings | Open flow settings | Flow settings — identity, Soul.md, voice verification | enabled |
| ↶ | Undo (Ctrl+Z) | Undo (Ctrl+Z) | **enabled on a freshly loaded flow** |
| ↷ | Redo (Ctrl+Shift+Z) | same | disabled |
| copy icon | Copy selected nodes (Ctrl+C) | Copy (Ctrl+C) | enabled with nothing selected |
| paste icon | Paste from clipboard (Ctrl+V) | Paste (Ctrl+V) | disabled |
| shield | Validate flow structure | same | enabled |
| eye | Preview AI script | same | enabled |
| expand arrows | Full-screen canvas | Full-screen canvas (F) | enabled |
| keyboard | Show keyboard shortcuts | Keyboard shortcuts (?) | enabled |
| … | More actions | More actions | menu: Export JSON, Import JSON, New flow, Reset to default |
| Private (lock) | (none, text only) | Private — only visible to you | toggle |
| trash | Destructive actions | same | menu: Delete flow |
| Save | (text) | Save (Ctrl+S) | always enabled |
| ACTIVATE | (text) | Activate this flow for all your calls | enabled |

All nine editor icons have no visible label and rely on the native `title` tooltip. Two icons are hard to read without that tooltip: the shield (Validate) and the eye (Preview AI script).

---

## 3. Node visual system (measured at zoom 1.0; default zoom is 0.712)

All card nodes share this style: `w-60` (240px), `rounded-2xl` (16px), 2px border (rendered 1.6px at 0.71 zoom), padding 14px, background `#EEF1F7`, border `#E1E6EF`.

- Title: Sora 13px / 700, coloured by type.
- Body: JetBrains Mono 11px / 500, colour `#3E475A`.
- Output chips (YES↓ / NO→, TRUE↓ / FALSE→): JetBrains Mono 10px / 600 on a 15% tint.
- Start and End are pill shapes: `rounded-full`, 150x47 and 142x47, Sora 14px / 700.

| Type | Size (px @1.0) | Title colour | Title contrast on node bg | Border |
|---|---|---|---|---|
| start (pill) | 150x47 | #178A55 on 15% green | 3.37:1 | solid green |
| speak | 240x118 (message clamped to 3 lines) | #2F5FE0 blue | 4.84:1 | solid |
| question | 240x144 | #0E9488 teal | **3.31:1** | **dashed** |
| condition | 240x108 | #FBBF24 amber | **1.48:1** | **dashed** |
| knowledge_lookup | 240x65 | #FB923C orange | **2.00:1** | solid |
| transfer | 240x83 | #F472B6 pink | **2.34:1** | solid |
| whatsapp | 240x87 | #178A55 green | 3.86:1 | solid |
| end (pill) | 142x47 | #D0463A on 15% red | 3.45:1 | solid red |
| unknown ("Call Ambulance", Airport flow) | about 150x40 | React Flow default white box | n/a | default |

- Body text: `#3E475A` on `#EEF1F7` = 8.24:1 (good at native size).
- Chips: YES 3.24:1 and NO 3.29:1 at 10px.
- **Node surface vs canvas: 1.05:1. Node border vs canvas: 1.16:1.** Card edges are almost invisible (WCAG 1.4.11 needs 3:1 for component boundaries).
- **On-screen sizes at the default zoom of 0.712:**
  - title ≈ 9.3px
  - body ≈ 7.8px
  - chips ≈ 7.1px
  - edge label "Not Interested" ≈ 7.1px
  - handles ≈ 8.5px
- **At fit view (0.294 for the 26-node flow):** title ≈ 3.8px. A measured title bounding box at 0.42 zoom was 49x6.9px.
- **Dark mode (`52_dark_mode.png`):**
  - Node bg is #1A1D26. Speak titles turn purple #7C6BF5 (4.23:1), while in light mode they are blue. The type colour is not stable across themes.
  - Amber titles become 10.08:1.
  - The "Not Interested" edge label stays a white box with black text.
  - The React Flow root keeps class `light`, so `colorMode` is not wired.

Type identity relies on title colour plus a 12px tinted icon. At default zoom the icons are about 8px, so the types look nearly identical. No node carries a type word such as "QUESTION".

---

## 4. Handles, edges and labels

- **Handles:**
  - 12x12px at zoom 1 (`!w-3 !h-3`), 8.54px at default zoom.
  - Fill #1A192B with a 0.8px white ring. A green fill is used for YES/TRUE source handles.
  - No enlarged invisible hit area was found; the hit target equals the visual. That is below the WCAG 2.5.8 minimum of 24x24.
  - Question and condition nodes have 3 handles: target top, YES/TRUE bottom (`data-handleid="yes"`), NO/FALSE right. The right-hand NO/FALSE handle is red.
  - The rule "YES connects from bottom handle / NO connects from right handle" appears **only in the inspector**, not on the canvas.
- **Edges:**
  - Default React Flow bezier. Stroke #2F5FE0, 1px (0.71px on screen at default zoom). 5.06:1 against the canvas.
  - The selected edge widens to 3px. No edge toolbar, no delete button, no label editor and no inspector for edges.
  - Interaction width is 20px (good).
- **Dashed vs solid has no meaning.** In Client A Realty (v2), **25 of 27 edges have the `animated` class** (5px dash, `dashdraw 0.5s infinite` marching ants). Only 2 legacy template edges are solid. Airport has 4 of 47 animated. Edges drawn by the user in the UI come out animated. The animation still runs under `prefers-reduced-motion: reduce`: I emulated it and got the same `dashdraw 0.5s infinite`.
- **Branch colour and labels are inconsistent.**
  - Exactly one edge, from the original template, is red and labelled "Not Interested" (10px SVG text on a white box).
  - Every user-created NO/FALSE edge is the same blue as YES/TRUE edges and has no label. For example "Condition Check (Residential) FALSE → Condition Check (Commercial)" is blue dashed.
  - The only way to tell a FALSE edge from a TRUE one is which side of the node it leaves from.
- **Edge accessible names use raw IDs.** Example: "Edge from node_1785140279604-copy-1785140692231-copy-1785140869201 to node_1785140824439-copy-1785140843519".
- **Routing:**
  - Edges from right-side NO handles loop back across node bodies to reach the top handles of lower nodes (SRv flow: "New Question" NO → "Knowledge Lookup" passes behind cards; `51_edge_selected.png`).
  - In Airport, more than 12 edges converge on "Additional Assistance" and cross each other (`45_airport_fit.png`, `46_airport_validate.png`).
  - There are no orthogonal or step edges, no edge bundling and no reroute points.

---

## 5. Interaction tests (all local, reverted by reload)

| # | Action | Result | Network (guarded) |
|---|---|---|---|
| 1 | Load /flow-builder, no input | First a "Loading…" spinner. Once (at ~3s, `10_default.png`) the header read "Choose a flow to edit" while the canvas showed an 8-node default template with a "FLOW VALIDATED" badge. It then switched to Client A Realty (v2) (26/27). | **`PUT /api/flows/f9b04a18…` at ~4s after flows loaded, with no user action** (repeated on every load; 4 of 4 times) |
| 2 | Click Undo button right after load | Nothing visible changes. Undo stays enabled after two clicks. Redo stays disabled. | PUT |
| 3 | Click palette "Speak" (START HERE) | Node "New Speak Node" (240x65) appears **at viewport centre on top of Confirm Interest and the orphan Knowledge Lookup** (`17_after_palette_click.png`). It is not selected and not connected. Live region says "New Speak Node added." A "RECENTLY USED" section appears in the palette and pushes the groups down. | PUT ~3s later |
| 4 | Ctrl+Z after #3 | Live region says "Undone." **The node count stays 27 and the node is still there.** Redo stays disabled. Ctrl+Shift+Z: nothing. Ctrl+Y announces "Redone." with no change. | PUT |
| 5 | Undo button ×3 more | The node is still present. Undo is still enabled. | PUT |
| 6 | Click node, then Backspace | Node deleted immediately with no confirmation. No announcement: status shows only "Up to date". **The inspector stays open showing the deleted node's ID and the "Editing New Speak Node" chip** (`20_after_delete_key.png`). | PUT |
| 7 | Ctrl+Z after delete | Node restored and Redo enabled. Ctrl+Y deletes it again. Undo/redo **does** work for deletion. | PUT |
| 8 | Drag a palette item onto the canvas (`dragTo`) | **Nothing is added.** Palette buttons have no `draggable` attribute, so adding is click-only. A hidden duplicate palette button exists (class `h-9 … text-[10px]`). | none |
| 9 | Drag from Knowledge Lookup bottom handle to Thank & End top handle | While dragging: thin grey connection line, target card gets a dark border and its handle grows. On release a new **animated dashed blue** edge is created. "Connection added." Links go 27→28. | PUT |
| 10 | Drag the "Thank & End" node about 45px | It moves freely to translate(714.949px, 476.093px). **No snap, no alignment guides**, fractional coordinates. | PUT |
| 11 | Click Greet, then Shift+click Confirm Interest | **Only Confirm Interest is selected.** The ? panel documents "Multi-select nodes: Shift + Click". | — |
| 12 | Click Greet, then Ctrl+click Thank & End | Only Greet stays selected. Meta+click clears the selection. Click-to-add-to-selection does not work at all on Windows. | — |
| 13 | Shift + drag a rectangle on empty canvas | Box select works. Only fully enclosed nodes are selected (2 Condition Checks). Connected edges go bold. No "2 selected" indicator and no bulk actions (`28_box_selected.png`). | — |
| 14 | Ctrl+A | Selects all 27. | — |
| 15 | Ctrl+C / Ctrl+V on Greet | Pasted copy with the **same title "Greet & Introduce"** at +50,+50, overlapping the original. Edges are not copied. "Pasted." | — |
| 16 | Double-click a node title | **No inline editor.** The side inspector opens, same as a single click, and the header chip text "Editing New Speak Node" gets text-selected by the double-click (`41b_inline_edit_full.png`). The ? panel promises "Edit node label inline: Double-click". | — |
| 17 | Zoom buttons ×3 in / ×8 out / Fit | Scale 0.712 → 1.230 → 0.286 (floor; zoom-out never disables) → fit 0.294. **No zoom % readout.** | none |
| 18 | Mouse wheel −300 / +200 | Wheel zooms: 0.294 → 0.494 → 0.349. Dragging empty space pans. | none |
| 19 | Lock (Toggle Interactivity) | Nodes lose draggable/selectable. The button has no `aria-pressed` and only the icon changes. | none |
| 20 | Keyboard: focus node, Tab ×5 | Order is Start → Greet → Confirm → **Thank & End → Send WhatsApp → End Call** (creation order, not flow order). **No visible focus ring** (`outline-style: none`; `33_focus_ring_check.png`). Enter selects the node but does not open the inspector. ArrowRight nudges 5px. | PUT after nudge |
| 21 | "?" key | Shortcuts dialog opens (`aria-modal=true`, labelled) but **focus is not moved into it**. It is 451x823 at y=148, so **71px is clipped below the 900px viewport**. | none |
| 22 | F key | In-app full-screen: canvas grows to 1342x832. **The minimap is hidden and there is no visible exit control**; the wallet banner stays. F again restores. | none |
| 23 | Validate (shield) | Panel "2 FLOW VALIDATION ERRORS" for Client A: both about "Knowledge Lookup" (the orphan). "Jump" zooms to 1.0, selects the node and opens the inspector (`15_validate_jump.png`). | none (client-side) |
| 24 | Switch flow → Airport | Viewport transform is **kept from the previous flow**. The Airport Start node is off-screen. **FLOW VALIDATED** is shown until you click Validate, which then reports **7 errors**. | **PUT /api/flows/47e3147e…** on open |
| 25 | Switch flow → Client C Media (Airport errors panel still open) | **The Airport flow's 7 errors keep showing on the SRv flow**. Canvas shows only "End Call" because of the inherited viewport (`47_flow_srv_asloaded.png`). Validate on SRv → "FLOW VALIDATED". | **PUT /api/flows/bf11c0a3…** on open |
| 26 | Drag a node, poll status every 200ms for 6s | Status pill stays **"Up to date"** the whole time and never shows "Unsaved", "Saving…" or "Failed". The autosave PUT was aborted by the guard, and the pill still said "Up to date" (observed under simulated network failure). | PUT |
| 27 | Open "…" menu | Export JSON, Import JSON, New flow, **Reset to default**. All four are styled the same; nothing marks Reset as destructive. | none |
| 28 | Open trash menu, press Escape | "Delete flow" menu **stays open after Escape**. I closed it by clicking the header. | none |
| 29 | Preview AI script | Modal "AI SCRIPT PREVIEW", 672x428, with a scrolling mono text area about 220px tall and a full-width "Close Preview" button. Steps are not linked back to nodes. | none |

---

## 6. How the canvas communicates Trigger → Logic → Action → Outcome

- **Trigger:** "Start Call" is a green pill at the top. Clear, but at default zoom it is only 107x34px on screen. There is no trigger configuration: you cannot tell from the canvas whether a flow is used for outbound, inbound or both. The only hint is ACTIVATE "for all your calls".
- **Logic:**
  - Question and condition nodes differ only by title colour (teal vs amber, where amber is 1.48:1), a dashed border (unexplained), and tiny 10px output chips.
  - TRUE/FALSE outcome edges are not colour-coded or labelled except one legacy edge. So in a 26-node flow you cannot read which branch is which without zooming to about 1.0 and tracing handles.
  - Condition expressions such as "Residential" show as 11px mono body text.
- **Action:**
  - WhatsApp, Transfer, Knowledge Lookup and Book Meeting nodes look like Speak nodes with a different title colour.
  - Knowledge Lookup and Transfer titles are low contrast (2.0:1 and 2.34:1).
  - One AI-generated action ("Call Ambulance") renders as an unstyled React Flow default box with no type.
- **Outcome:** "End Call" red pill. Many flows end through a "Closing End" Speak node followed by End Call. There is no outcome taxonomy (booked, not interested, transferred, voicemail) on the canvas, even though the product reports outcomes in Call Reports.
- **Overall:** readable for 8–9 node flows at fit view (SRv at about 0.75 zoom, `48_flow_srv_fit.png`). For 26–35 node flows the canvas turns into an unreadable column (Client A, `30_fit_view.png`) or a dense web (Airport, `45_airport_fit.png`). There are no groups, frames, swimlanes or collapsed sub-flows, and no level-of-detail rendering that would show type badges at low zoom.

---

## 7. Findings

Severity scale: critical = blocks a core task, loses data or is a serious accessibility barrier. High = major friction or clearly unprofessional. Medium = noticeable. Low = polish.

### FLOW-CANVAS-01: Opening a flow silently writes to it; every edit autosaves with no visible state (critical)
- **Evidence:**
  - With no user input, every load of /flow-builder issued `PUT /api/flows/{id}` about 4s after `GET /api/flows` (4 of 4 loads).
  - Opening a different flow from the switcher issued a PUT to that flow (Airport 47e3147e…, SRv bf11c0a3…).
  - Every local edit (add, connect, drag, nudge, undo) issued a PUT 3–10s later.
  - The switcher list shows "Client A Realty (v2) — last edited 26 Sept, 16:09" (today). **Inferred:** simply viewing flows bumps "last edited" and could overwrite concurrent edits by a teammate.
  - Together with FLOW-CANVAS-02 (undo broken for adds) and ACTIVATE "for all your calls", an accidental click on the active flow can be persisted and, **inferred**, go live on real calls without Save ever being pressed.
- **Recommendation:**
  - Never write on open: only mark dirty on a real user edit, and diff against the loaded version.
  - Pick one model:
    - (a) Explicit Save, with a dirty indicator and an unsaved-changes guard; or
    - (b) Autosave to a **draft** that never affects the active/published version until "Publish/Activate".
  - Show the draft vs published state in the header ("Draft · saved 12:04 · Published v7").
  - Add optimistic concurrency (ETag / `updated_at` check) to stop silent overwrites.

### FLOW-CANVAS-02: Undo does not undo node additions and is enabled with nothing to undo (critical)
- **Evidence:**
  - After a palette add, Ctrl+Z announced "Undone." but the node stayed (count 27 → 27). Four further Undos also left it (tests 4–5). Redo stayed disabled.
  - On a freshly loaded flow, Undo is enabled and clicking it does nothing.
  - Undo *does* restore a deleted node (test 7), so the history is partial and cannot be trusted.
- **Recommendation:**
  - Record every graph mutation in one history stack: add, paste, connect, disconnect, move (coalesced per drag), inspector edits, AI draft.
  - Disable Undo when the stack is empty.
  - Announce what was undone ("Undid: add Speak node").
  - Expose history in a version panel (see FLOW-CANVAS-24).

### FLOW-CANVAS-03: "FLOW VALIDATED" badge is shown on invalid flows (critical)
- **Evidence:**
  - The badge (10px mono uppercase, text-positive/70 ≈ 2.58:1, pulsing green dot) reads "FLOW VALIDATED" on load for every flow.
  - Clicking Validate reveals 2 errors in Client A Realty (v2) (an orphan Knowledge Lookup with no input or output) and **7 errors** in Airport Passenger Support Flow (7 Question nodes missing YES/NO connections). See `11_loaded_Client A.png`, `44_flow_airport.png`, `46_airport_validate.png`.
  - The badge also said "FLOW VALIDATED" on the transient default template during load.
  - ACTIVATE sits next to it and is always enabled. **Inferred:** users can activate broken flows while the UI tells them the flow is validated.
- **Recommendation:**
  - Validate continuously on every change, debounced.
  - Show one truthful status chip: "✓ Valid" / "⚠ 7 issues" / "Not yet validated".
  - Gate ACTIVATE on errors, with an explicit override ("Activate anyway") for warnings only.
  - Make the chip open the issues list.

### FLOW-CANVAS-04: Palette click drops new nodes on top of existing nodes; no drag-to-place (high)
- **Evidence:**
  - Clicking "Speak" placed "New Speak Node" at the viewport centre, overlapping Confirm Interest and another node, not selected and not connected (`17_after_palette_click.png`).
  - The real Client A flow already contains an orphan "Knowledge Lookup" stacked on Confirm Interest (`05_selected_node_zoom.png`). **Inferred:** it was created this way and autosaved.
  - Palette items are not draggable (test 8), although the canvas hint says "Drag nodes…".
- **Recommendation:**
  - Support drag-from-palette with a drop preview.
  - For click-to-add, place the node at the next free slot below the selected node and auto-connect it from the selected node's default output.
  - If nothing is selected, place it at a free location, never overlapping.
  - Select the new node and open its inspector.
  - Offer "+" buttons on output handles (as in n8n and Make) that insert a connected node.

### FLOW-CANVAS-05: Node content is illegible at default and fit zoom; default view hides most of the flow (high)
- **Evidence:**
  - Default zoom is 0.712: title 9.3px, body 7.8px, chips and edge labels 7.1px. Only about 9 of 26 nodes are visible and End Call is off-screen, with nothing indicating more below.
  - Fit view for 26 nodes is 0.294: titles 3.8px. Fit for 35 nodes is 0.383.
  - There is no zoom % indicator and no zoom presets.
  - The flow is a tall, narrow column (about 280px wide at fit) in a 1043px-wide canvas (`30_fit_view.png`).
- **Recommendation:**
  - Use level-of-detail rendering. Below about 0.6, render nodes as compact chips (type icon + 14px+ label, no body text). Below about 0.35, render type-coloured blocks with labels in an overlay.
  - Open flows fit-to-content with a minimum zoom of about 0.6, anchored at Start.
  - Add a zoom % control with 50/100/Fit presets.
  - Offer horizontal (left-to-right) auto-layout for wide monitors (see FLOW-CANVAS-17).

### FLOW-CANVAS-06: Low contrast for node titles, chips, card edges and the status badge (high)
- **Evidence (on #EEF1F7):**
  - Condition title amber #FBBF24: 1.48:1
  - Knowledge Lookup orange #FB923C: 2.00:1
  - Transfer pink #F472B6: 2.34:1
  - Question teal #0E9488: 3.31:1
  - WhatsApp green #178A55: 3.86:1
  - All at 13px bold, which needs 4.5:1.
  - YES/NO and TRUE/FALSE chips: 3.2–3.3:1 at 10px.
  - Node surface vs canvas 1.05:1 and node border vs canvas 1.16:1 (non-text contrast needs 3:1).
  - FLOW VALIDATED badge text ≈ 2.58:1 at 10px.
- **Recommendation:**
  - Keep hue for the icon tile, a left accent bar or a top stripe, and set title text in a single high-contrast ink (≥ 7:1).
  - If coloured text is required, darken each hue to ≥ 4.5:1 (for example amber-700 #B45309, orange-700 #C2410C, pink-700 #BE185D, teal-700 #0F766E).
  - Give cards a white surface with a #C9D1DE-class border (≥ 1.5:1) plus a subtle shadow, or a 3:1 outline.
  - Raise chips to 12px on solid fills.

### FLOW-CANVAS-07: Edge styling carries no meaning; branch outcomes unlabelled; perpetual animation (high)
- **Evidence:**
  - 25 of 27 edges (Client A) animate as marching ants (dashdraw 0.5s infinite), the rest are solid. There is no legend and no semantic difference.
  - Only one edge is red and labelled ("Not Interested"). All other NO/FALSE edges are the same blue as YES/TRUE with no label.
  - Edge stroke is 1px (0.71px on screen).
  - Animation ignores `prefers-reduced-motion: reduce` (WCAG 2.2.2 pause/stop for moving content; 2.3.3).
  - Edge accessible names are raw node IDs.
- **Recommendation:**
  - Draw every branch edge with an outcome label pill: YES/NO, TRUE/FALSE, or the condition value such as "Residential".
  - Colour-code by outcome (positive green, negative red, default neutral grey #64748B) at 1.5–2px.
  - Reserve dashed for "fallback / timeout / error" paths and document it in a legend.
  - Animate only while a test call or simulation runs, and respect reduced motion.
  - Name edges by node labels ("Confirm Interest — NO → Thank & End").

### FLOW-CANVAS-08: Validation lives in a floating list, not on nodes; stale results survive flow switch (high)
- **Evidence:**
  - Errors appear only in a 383x285 panel over the canvas's top-left; nodes get no error ring or badge (checked the DOM after validation).
  - Messages cite ambiguous duplicate names ("Knowledge Lookup" ×3 in Client A).
  - **After switching from Airport to Client C Media, the panel still listed Airport's 7 errors** (`47_flow_srv_asloaded.png`).
  - Jump works: it zooms to 1.0, selects the node and opens the inspector. But the jumped-to node sits partly under the panel.
- **Recommendation:**
  - Put error and warning badges on the offending nodes and handles, for example a red ring plus "!" and a dangling-handle marker on the unconnected YES/NO port.
  - Move the issue list into a collapsible "Problems" drawer (bottom or right) with counts.
  - Clear or recompute results on flow switch.
  - Reference nodes by label plus a short ID or step number.

### FLOW-CANVAS-09: Flow switch inherits the previous viewport; switcher lacks state (high)
- **Evidence:**
  - After switching, the viewport transform was identical to the previous flow's: translate(342.6, −114.2) scale 0.423 → Airport; then 0.383 → SRv.
  - The SRv flow loaded with only End Call visible.
  - The "ALL FLOWS" modal:
    - lists 16 flows with duplicate names (two "Client A Realty (v2)", two "Airport Passenger Support Flow");
    - does not mark the currently open flow or the **active (live)** flow;
    - has no sortable headers, and the order is not by last edited;
    - leads to a truncated header name "Client C Media - Tele Calling Scri…".
- **Recommendation:**
  - Fit-to-content (or restore the per-flow saved viewport) on every flow open.
  - In the switcher, show "Live" / "Draft" / "Private" badges, the current flow, node count, last editor, and sort by last edited.
  - Block duplicate names, or add disambiguators (created date, ID).
  - Show the full name in a tooltip or widen the header.

### FLOW-CANVAS-10: Canvas is mouse-only in practice: no focus ring, creation-order tabbing, no keyboard connect (high)
- **Evidence:**
  - Nodes are `role=group tabindex=0` with React Flow's aria description, but the focus style is `outline: none` and no ring is visible (`33_focus_ring_check.png`).
  - Tab order follows creation order: Start → Greet → Confirm → Thank & End → WhatsApp → End Call, jumping around the graph.
  - Enter selects but does not open the editor.
  - There is no keyboard way to create a connection. **Inferred:** no handle-focus mechanism was found.
  - The shortcuts dialog does not receive focus when opened (`focusInside: false`).
  - Nodes have no aria-label, so screen readers read all inner text, including the long message.
- **Recommendation:**
  - Add a 2px focus ring (≥ 3:1) with offset.
  - Tab order should follow the graph (depth-first from Start). Use arrow-key traversal along edges and Alt+arrows to move.
  - Enter opens the inspector.
  - Add a "Connect to…" command (for example C, then pick a target from a searchable list) and an "Add next step" command.
  - Give nodes `aria-label="Step 3 of 26, Question: Confirm Interest, 2 outputs: YES → New Speak Node, NO → Thank & End"`.
  - Move focus into dialogs and restore it on close.

### FLOW-CANVAS-11: Save state is not communicated; "Up to date" is permanent (high)
- **Evidence:**
  - The status pill (dashed-circle icon that looks like a spinner) read "Up to date" before, during and after edits, polled every 200ms for 6s.
  - After the autosave PUT failed, it still said "Up to date" (observed under simulated network failure).
  - The Save button is always enabled, so users cannot tell whether Save does anything beyond autosave.
- **Recommendation:**
  - Tie the pill to real state: "Unsaved changes" (amber), "Saving…" (spinner), "Saved 12:04" (check), "Couldn't save — Retry" (red, persistent).
  - Disable Save when clean, or rename it "Publish".
  - Warn with `beforeunload` when changes are unsaved.

### FLOW-CANVAS-12: Documented multi-select does not work; no multi-selection affordances (medium)
- **Evidence:**
  - Shift+click (listed in the ? panel) and Ctrl+click did not add to the selection. Meta+click cleared it.
  - Only Shift+drag box select worked (fully-enclosed mode).
  - With 2 nodes selected there was no count, no bulk action bar (align, delete, duplicate, group) and no inspector state.
- **Recommendation:**
  - Support Shift+click and Ctrl/Cmd+click toggling.
  - Show "2 selected" plus a floating action bar.
  - Allow partial-overlap box selection with a modifier.

### FLOW-CANVAS-13: Double-click "inline edit" promised but not delivered (medium)
- **Evidence:** The ? panel and the canvas hint both say double-click edits the label inline. Double-click only opens the side inspector (same as single click) and text-selects the "Editing …" chip (`41b_inline_edit_full.png`).
- **Recommendation:** Either implement in-place label editing (input at ≥ 14px on screen regardless of zoom) or change the copy to "click to edit in the side panel".

### FLOW-CANVAS-14: Deleting a node leaves a ghost inspector; deletions are silent (medium)
- **Evidence:** After Backspace, the node disappears but the inspector still shows "SPEAK NODE, ID node_1790420907202, Label New Speak Node, Delete Node" and the header chip "Editing New Speak Node" (`20_after_delete_key.png`). No live-region message or toast ("Deleted… Undo").
- **Recommendation:**
  - Close or clear the inspector on delete.
  - Show a toast with Undo ("Deleted 'New Speak Node' · Undo").
  - Announce it via the live region.
  - For nodes with connections, briefly highlight the edges that were removed.

### FLOW-CANVAS-15: Duplicates and naming: paste and palette produce identical titles, overlapping copies, copy-of-copy IDs (medium)
- **Evidence:**
  - Paste creates "Greet & Introduce" again at +50/+50, overlapping the original, and edges are not carried.
  - Palette creates a second "New Speak Node".
  - The real Client A flow has 9 nodes titled "Lead questions" / "Lead - questions" and 3 "Condition Check", with IDs like `node_…-copy-…-copy-…-copy-…-copy-…`.
  - Validation messages then become ambiguous.
- **Recommendation:**
  - Auto-suffix names on paste or add ("Greet & Introduce (copy)", "Speak 2").
  - Paste at the cursor or into free space.
  - Offer "Duplicate with connections".
  - Show short step numbers on nodes (S1, Q2…) to disambiguate.

### FLOW-CANVAS-16: Minimap occludes content and cannot be hidden (medium)
- **Evidence:**
  - The minimap is 202x152 at bottom-right on a dark grey mask. With the inspector open it covers nodes (Condition, Lead-questions, WhatsApp; `19_node_selected.png`, `41b_inline_edit_full.png`). At 1024x768 it covers about 8.5% of the canvas (`55_1024x768.png`).
  - There is no toggle. It disappears entirely in full-screen mode.
  - Minimap nodes are coloured by type, but there is no legend.
- **Recommendation:**
  - Make it collapsible (remember the choice per user).
  - Shrink it to about 160x100 with a translucent mask.
  - Offset the fit view so content never sits under overlays.
  - Keep it in full-screen.

### FLOW-CANVAS-17: No snapping, alignment guides or auto-layout; flows degrade into overlaps and crossings (medium)
- **Evidence:**
  - Node positions are fractional after a drag (714.949, 476.093). No helper lines appeared while dragging.
  - There is no "Tidy up" or auto-layout command in the toolbar or the … menu.
  - Real flows show overlapping nodes (Client A) and heavy crossings or convergence (Airport: more than 12 edges into one node).
- **Recommendation:**
  - Use a 16px snap grid with alignment and spacing guides.
  - Add "Auto-layout (top-down / left-right)" using dagre or elk, with undo.
  - Use orthogonal or step edges with rounded corners for branch-heavy flows.
  - Add reroute points and "merge" nodes for many-to-one joins.

### FLOW-CANVAS-18: Shortcuts dialog is clipped, platform-inconsistent and incomplete (medium)
- **Evidence:**
  - The dialog is 451x823 at y=148, so 71px sits beyond the 900px viewport and the last row is cut off (`35_shortcuts.png`).
  - Redo is shown as "Cmd Shift Z" on Windows while the toolbar tooltip says "Ctrl+Shift+Z"; the other rows say "Cmd/Ctrl".
  - Missing from the list: zoom in/out, fit view, pan, Delete key (only Backspace), connect, add node, search.
  - Two documented shortcuts do not work: Shift+Click multi-select and double-click inline edit.
- **Recommendation:**
  - Cap the height at 80vh with internal scroll, or use a two-column layout.
  - Detect the platform.
  - Group the list (Edit, Navigate, Select, View).
  - Only list shortcuts that work, and add the missing ones.

### FLOW-CANVAS-19: Unknown or unsupported node types render as unstyled boxes (medium)
- **Evidence:** In the Airport flow, "Call Ambulance" renders as React Flow's `react-flow__node-default`: a plain white box with 2 handles, no type, no icon and no warning (`44_flow_airport.png`). Validation says nothing about it.
- **Recommendation:** Map unknown types to an "Unsupported step" node with a warning style, an explanation, and a "Convert to…" action. Include it in validation.

### FLOW-CANVAS-20: Canvas gets about half the screen; chrome and inspector crowd it (medium)
- **Evidence:**
  - At 1440x900 the pane is 1043x651 (52% of the viewport). The inspector reduces it to 711x651 (36%).
  - The header plus toolbar use two rows (about 128px) plus a 42px banner.
  - The palette is fixed at 288px. It is collapsible, but the choice is not remembered in this test.
  - At 1024x768: 626x561.
- **Recommendation:**
  - Merge the header into a single 48–56px bar: flow name dropdown, status, and grouped actions in an overflow menu.
  - Overlay the inspector on the canvas (or make it resizable) and pan the selected node into view instead of squeezing.
  - Suppress the global wallet banner inside the builder, or collapse it into the header.

### FLOW-CANVAS-21: Full-screen mode has no exit affordance and loses the minimap (low)
- **Evidence:** F expands the canvas to 1342x832. No visible close or exit button, the minimap is gone, and the wallet banner still shows (`39_fullscreen_canvas.png`).
- **Recommendation:** Add an "Exit full screen (F / Esc)" button in the corner, keep the minimap, and hide the global banner.

### FLOW-CANVAS-22: Destructive actions are poorly guarded (medium)
- **Evidence:**
  - "Reset to default" sits in the "…" menu between "New flow" and nothing else, with the same styling as Export JSON. I did not click it; its effect is inferred to replace the flow, and autosave would then persist it.
  - The trash "Delete flow" menu did not close on Escape.
  - Backspace deletes nodes with no confirmation, which is acceptable only if undo is reliable (see FLOW-CANVAS-02).
- **Recommendation:**
  - Move Reset into a separated danger section with red styling and a confirm dialog naming the flow.
  - Make all menus close on Escape and outside click.
  - Show an undo toast for destructive canvas actions.

### FLOW-CANVAS-23: Palette affordances: fake "+10" button, duplicated groups, truncated labels (low)
- **Evidence:**
  - "+ 10" (85x32, saffron border and fill, plus icon) looks like a button but is an inert `<span>` count.
  - START HERE repeats Speak, Question, Branch and Human Handoff from CONVERSATION.
  - 5 of 13 visible item labels are truncated at 112–119px wide ("Knowle…", "CRM Lo…", "Book Me…", "Human …", "Verify Cu…").
  - Labels have no descriptions or tooltips beyond the name.
  - "Recently used" appears after one add and shifts the list down.
- **Recommendation:**
  - Make "+10" either a real "Browse all steps" button or plain muted text.
  - Use a single list with category headers and one-line descriptions.
  - Use single-column items at a 288px panel width so names are not truncated.
  - Pin "Recently used" in a fixed-height row.

### FLOW-CANVAS-24: Missing pro-tool capabilities for a live-call workflow editor (high)
- **Observed absent:**
  - search or jump to node on the canvas (palette search only filters step types)
  - version history, diff or restore (versioning is done by duplicating flows named "(v2)", "(v3)", "(v6)")
  - publish vs draft separation
  - comments or sticky notes
  - groups or frames
  - a test or simulate run on the canvas, with path highlighting and a transcript mapped to nodes
  - per-node analytics (drop-off, % taking YES vs NO from Call Reports)
  - variables panel
  - a legend of node types and edge meanings
  - zoom % control
  - auto-layout
  - Preview AI script is text-only and not linked to nodes
- **Recommendation (priority order):**
  1. Draft/Publish with version history and a diff.
  2. Inline issues on nodes plus a Problems drawer.
  3. "Simulate call" mode that steps through the graph with typed or voice replies, highlights the active node, and animates only the traversed edge.
  4. Canvas search (Ctrl+F) across labels and messages with next/previous.
  5. Overlay per-node funnel metrics from Call Reports.
  6. Sticky notes and frames for sections (Greeting, Qualification, Booking, Close).

### FLOW-CANVAS-25: Tiny handles and hidden output semantics (medium)
- **Evidence:**
  - Handles are 12px (8.5px on screen at default zoom) with no larger hit zone, below the WCAG 2.5.8 24px target.
  - Question and Condition outputs use position (YES/TRUE bottom, NO/FALSE right) and a 10px chip. The mapping is explained only in the inspector ("↓ YES — connects from bottom handle, → NO — connects from right handle").
- **Recommendation:**
  - Enlarge the visible handle to 14–16px, with a 24–32px invisible hit area and a hover halo.
  - Put output labels directly on the handles ("Yes" / "No" tabs on the card edge).
  - Keep all outputs on one side (bottom) with labelled ports so routing stays predictable.

### FLOW-CANVAS-26: Visual inconsistencies across themes and states (low)
- **Evidence:**
  - Speak type is blue #2F5FE0 in light and purple #7C6BF5 in dark (4.23:1). The Save button also changes blue → purple.
  - The edge label box stays white in dark mode.
  - The React Flow root keeps class `light` in dark mode.
  - Question and Condition nodes have dashed borders natively (unexplained), and selection shows as a dark dashed or solid 1.6px border, so selection is weak on dashed nodes.
  - The "Canvas" header has a green "live" dot with no meaning.
- **Recommendation:**
  - Define type colours as theme tokens with fixed hue identity.
  - Pass `colorMode` to React Flow.
  - Use a 2px accent selection ring with shadow on all node types.
  - Use solid borders on all nodes; reserve dashed for disabled or unreachable steps.

### FLOW-CANVAS-27: Loading flashes a default template labelled "Choose a flow to edit" and "FLOW VALIDATED" (low)
- **Evidence:** On one load at about 3s (`10_default.png`) the header read "Choose a flow to edit" while the canvas rendered an 8-node generic template ("Hello! This is Vaani Labs calling on behalf of your company…") with "8 nodes / 8 links" and "FLOW VALIDATED". It was then replaced by the real flow.
- **Recommendation:** Keep a skeleton canvas until the target flow is resolved, never render the default template for an existing account, and keep the canvas read-only until loaded.

---

## 8. Strengths worth preserving

- Solid foundation: React Flow with minimap, controls, box select, Ctrl+A, arrow-key nudge (5px, 25px with Shift) and React Flow's built-in aria descriptions for nodes and edges.
- Toolbar semantics are good:
  - `role=toolbar` "Flow builder controls", with groups "Editor actions" and "Save and ship";
  - every icon button has an aria-label that includes its shortcut;
  - Redo and Paste are correctly disabled when unavailable.
- A polite live region announces actions: "New Speak Node added.", "Connection added.", "Pasted.", "Undone.", "Selected New Speak Node. Editor panel open."
- The validation panel's "Jump" zooms to 1.0, selects the node and opens the inspector, which is a good pattern to extend onto the nodes themselves.
- "Preview AI script" gives rare transparency into how the graph compiles into the agent's instructions. It is a differentiator worth linking to nodes.
- The inspector is helpful: YES/NO handle explanation, dynamic variable hint (`{{lead_name}}`, `{{company_name}}`), type-specific fields (knowledge document scoping, search query hint).
- Node and link count chips, and palette search with a clear empty state ("No nodes match "xyz"").
- The flow switcher is a proper modal with search ("Search 16 flows…"), category, last-edited and pagination.
- Clear start and end pills and top-to-bottom flow for small flows. The 9-node SRv flow reads well at fit view.
- Viewport changes (zoom, pan, lock, fit) do not trigger saves.
- Deletion is undoable.
- The connection drag gives good target feedback: the target card is highlighted and its handle grows.

---

## 9. Open questions

1. Is the PUT on open intentional (for example schema migration or normalisation on load)? If so it should be server-side and must not bump "last edited".
2. Does autosave write to the **active** flow that is serving live calls? Could not verify: writes were blocked. This decides whether FLOW-CANVAS-01 is a live-call risk.
3. What does Save do if autosave already persists? Is there a notion of draft vs published?
4. What exactly does "Reset to default" do, and is it undoable? Not clicked.
5. Why do Question and Condition nodes use dashed borders? Is it intended to mean "branching"?
6. Are animated (dashed) edges meant to mark AI-generated or user-drawn edges? The class split suggests "created in UI = animated".
7. Which node type was "Call Ambulance" meant to be (probably an action or webhook from AI draft)?

---

## 10. Note for the user on session expiry (from the relayed request)

The sign-in session stayed valid for this entire run; the preamble extends the session cookies. The earlier logout happened because a hung tool call reset the shared browser, not because the session timed out.

Please **do not send me your password**, or any tokens or cookies. Typing credentials into a production login page on your behalf is something I must not do, even with permission. Options that keep runs going unattended without me handling credentials:

- Sign in once yourself in the shared browser.
- Keep agents' calls short, which we now do, so the browser is never reset.
- Or have the orchestrator restore a browser storage state that you saved yourself (for example Playwright `storageState` exported after your own login), so runs start already signed in. Treat that file like a password and keep it on your machine.

If a run does get logged out, agents now stop and report instead of retrying.
