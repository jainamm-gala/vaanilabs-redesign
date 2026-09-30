
### F-FLOW-006 — The canvas works only with a mouse: no visible focus, tab order follows creation order, and there's no keyboard way to connect nodes
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-10
- **Pages:** /flow-builder
- **Evidence:**
  - **Nodes:** each is `role=group tabindex=0` with no `aria-label`, so a screen reader reads out all the inner text, including long messages. (FLOW-CONFIG listed "descriptive node aria-labels" as a strength; the verifier found no aria-label on the focusable node element.)
  - **Focus:** while a node is `:focus-visible` it has `outline: none`, `box-shadow: none` and an unchanged grey border, so there is no visible focus indicator (WCAG 2.4.7).
  - **Tab order** is creation order, not flow order: Start → Greet & Introduce → Confirm Interest → Thank & End → Send WhatsApp → End Call. Focus jumps back and forth across the graph.
  - **Enter** selects the node but doesn't open the inspector (no "Editing …" chip).
  - **Connecting:** none of the 54 handles can take focus, and the shortcuts list has no connect command. So you can't create connections from the keyboard (WCAG 2.1.1).
  - **Shortcuts dialog:** "?" opens it with `aria-modal=true`, but focus stays on `BODY`.
  - **Handles** are small targets too (see F-FLOW-020).
- **Screenshots:** `audit/screenshots/va-flow-canvas/33_focus_ring_check.png`, `audit/screenshots/va-flow-canvas/32_keyboard_focus.png`, `audit/screenshots/va-verify-flow-canvas/15_focus.png`, `audit/screenshots/va-verify-flow-canvas/16_after_enter.png`
- **Recommendation:**
  - Give nodes a visible focus style: `.react-flow__node:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px }`, with at least 3:1 contrast against the canvas.
  - Make keyboard order follow the graph (depth-first from Start). Use a roving tabindex so arrow keys follow edges: ↓ for the default output, → for the alternate output. Alt+Arrow moves the node.
  - Make Enter or F2 open the inspector with focus on Label, and Esc return focus to the node.
  - Add a "Connect…" command (C) on the focused node or output, which opens a searchable listbox of target nodes. Add an "Add next step" command that opens the palette, then inserts and connects the new node.
  - Give nodes a full `aria-label`, for example "Step 3 of 26, Question: Confirm Interest. Outputs: Yes → New Speak Node; No → Thank & End".
  - In every dialog, move focus to the first control on open, trap it, and restore it on close.

### F-FLOW-007 — Node titles, output chips, card edges and the status badge are low contrast
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-06
- **Pages:** /flow-builder
- **Evidence:**
  - Measured from computed styles with alpha blending, on the `#EEF1F7` node fill.
  - **13 px / 700 titles**, which need 4.5:1:

    | Node type | Title colour | Contrast |
    |---|---|---|
    | condition | #FBBF24 | **1.48:1** |
    | knowledge_lookup | #FB923C | **2.00:1** |
    | transfer | #F472B6 | **2.34:1** |
    | question | #0E9488 | **3.31:1** |
    | whatsapp | #178A55 | **3.86:1** |
    | speak | #2F5FE0 | 4.84:1 (passes) |

  - **Output chips:** YES/NO/TRUE/FALSE are 10 px mono at 3.24–3.30:1.
  - **Card edges:** fill vs canvas (#F4F6F9) is 1.05:1 and border (#E1E6EF) vs canvas is 1.16:1, so card edges are practically invisible. WCAG 1.4.11 asks for 3:1.
  - **Badge:** "FLOW VALIDATED" is 2.58:1.
  - **Zoom makes it worse:** at the default 0.712 zoom these render at 9.3 px (titles) and 7.1 px (chips).
- **Screenshots:** `audit/screenshots/va-flow-canvas/05_selected_node_zoom.png`, `audit/screenshots/va-flow-canvas/19_node_selected.png`, `audit/screenshots/va-verify-flow-canvas/13_default_zoom.png`
- **Recommendation:**
  - Set all titles in one ink token (≥ 7:1). Carry the type hue in a 4 px left accent bar, the icon tile and a small type badge.
  - If coloured title text stays, use darker shades. Checked on #EEF1F7:
    - orange #C2410C: 4.58:1
    - pink #BE185D: 5.34:1
    - teal #0F766E: 4.84:1
    - amber **#92400E**: 6.27:1. Amber-700 #B45309 reaches only 4.44:1 on #EEF1F7, so it is not enough.
  - Give cards a white surface with a 1 px #CBD5E1 border, a subtle shadow and the type accent bar, so each card's edges are visible against the canvas.
  - Make chips 12 px with white text on solid fills: green #15803D (5.0:1) and red #B91C1C (6.5:1).
  - Replace the badge as described in F-FLOW-004.

### F-FLOW-008 — Node text is illegible at default and fit zoom, and large flows can't be read or navigated
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-05, FLOW-CONFIG-21, VISUAL-AUDIT-10 (node text size)
- **Pages:** /flow-builder
- **Evidence:**
  - **Default zoom:** the scale is 0.711924.
    - A 13 px title renders at about 9.3 px, 11 px body text at 7.8 px, chips and edge labels at 7.1 px, and handles at 8.5 px.
    - In the 1042x651 pane only 9 of Flow A's 26 nodes are fully visible and 12 are partly visible.
    - End Call's top edge is at y=1686, against a pane bottom of 887, and nothing signals that more of the flow is below.
    - At 1280x720 only 12 of 26 nodes are visible.
  - **Fit View:**
    - The scale drops to 0.2938, so titles are about 3.8 px.
    - Flow A becomes a 287 px-wide column in a 1042 px pane.
    - Flow B fits at 0.383.
  - **No navigation aids:**
    - There is no zoom % readout or preset. The only controls are Zoom In, Zoom Out, Fit View and Lock.
    - There is no outline or list view and no find-node.
    - Duplicate labels ("Lead questions" ×5, "Lead - questions" ×3, "Knowledge Lookup" ×3) make it ambiguous which node is which.
- **Screenshots:** `audit/screenshots/va-flow-canvas/30_fit_view.png`, `audit/screenshots/va-flow-canvas/45_airport_fit.png`, `audit/screenshots/va-flow-config/35_fit_view.png`, `audit/screenshots/va-verify-flow-canvas/13_default_zoom.png`, `audit/screenshots/va-verify-flow-canvas/14_fit_view.png`, `audit/screenshots/va-visual-audit/flow-builder_node_zoom.png`
- **Recommendation:**
  - Change node detail with zoom level:
    - Below 0.6, render compact nodes: type icon plus label, counter-scaled so it's at least 12 px on screen, with no body text.
    - Below 0.35, render type-coloured blocks with labels in an unscaled HTML overlay.
  - Open flows with `fitView({ minZoom: 0.6 })` anchored at Start, or restore the viewport saved for that flow.
  - Add a zoom % control with 50 / 100 / Fit presets, plus Ctrl+0 and Ctrl+1.
  - Add an Outline panel: an ordered step list with type icons, issue dots and search. Clicking a step selects the node and centres it.
  - Add Ctrl+F canvas search across labels and messages, with next/previous.
  - Offer a left-to-right layout for wide screens (F-FLOW-021).

### F-FLOW-009 — Palette clicks drop new nodes on top of existing ones, unconnected and unselected, and you can't drag steps from the palette
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-04, FLOW-CONFIG-05, UX-AUDIT-18 (node-placement part), DESIGN-RESEARCH-04 (node-overlap part), VISUAL-AUDIT-10 (node-overlap part)
- **Pages:** /flow-builder
- **Evidence:**
  - **One add:** palette "Speak" placed "New Speak Node" at about (927,486), 171x46 on screen. It overlapped "Confirm Interest" and "Knowledge Lookup", wasn't selected, and wasn't connected (still 27 links).
  - **Three adds:** Speak, Question and CRM Lookup landed within x 868–896 / y 524–539. `elementFromPoint` at each new node's centre returned only the last one added, so the earlier two were hidden underneath.
  - **Under the selection:** FLOW-CONFIG also saw a new node render *beneath* the selected node, where it couldn't be clicked. The verifier did not re-test this.
  - **No drag-and-drop:** palette buttons are `draggable=false` with no `dragstart` handler. Neither a manual mouse drag nor Playwright `dragTo` added a node, although the canvas hint says "Drag nodes…".
  - **In the live Flow A:** an orphan "Knowledge Lookup" is stacked on "Confirm Interest" and hides its question text (reported independently by FLOW-CANVAS, FLOW-CONFIG, UX-AUDIT, VISUAL-AUDIT and DESIGN-RESEARCH). Whether it was created this way can't be verified.
- **Screenshots:** `audit/screenshots/va-flow-canvas/17_after_palette_click.png`, `audit/screenshots/va-flow-config/27_stacked_nodes.png`, `audit/screenshots/va-flow-config/23_after_add_crm.png`, `audit/screenshots/va-verify-flow-config/03_added_nodes.png`, `audit/screenshots/va-verify-flow-config/09_stacked_adds.png`, `audit/screenshots/va-flow-canvas/22_drag_from_palette.png`, `audit/screenshots/va-ux-audit/crop_flow_overlapping_nodes.png`, `audit/screenshots/va-visual-audit/flow-builder_node_zoom.png`
- **Recommendation:**
  - **When a node is selected:** insert the new node below it (node height + 48 px gap) and connect it from the selected node's first free output. Push downstream nodes down if they would collide.
  - **When nothing is selected:** place the node in the free grid cell nearest the viewport centre, checking collisions against every node's box plus a 24 px margin. Offset each successive add.
  - **After any add:** select the node, pan it into view and open the inspector with focus on Label.
  - **Drag from palette:** support HTML5 drag-and-drop mapped through `screenToFlowPosition`, with a drop ghost. Dropping onto an edge inserts the step between its two nodes.
  - **Output "+":** put a "+" on every unconnected output handle that opens a mini palette and inserts an already connected node.

### F-FLOW-010 — Validation issues aren't marked on nodes, and results carry over when you switch flows
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-08
- **Pages:** /flow-builder
- **Evidence:**
  - **Errors appear only in a floating panel:** a 384x289 panel over the canvas's top-left. After Jump, the node has no error ring or badge, and no node carries an error class.
  - **Messages are ambiguous:** they name nodes by duplicate labels ("Knowledge Lookup" appears 3 times in Flow A) or by raw ids.
  - **Stale results survive a flow switch (reproduced twice):**
    - Flow A's 2 errors stayed on screen after switching to Flow B.
    - Flow B's 7 errors stayed after switching to Flow C, a 9-node flow for which Validate reports "FLOW VALIDATED".
  - **Jump works:** it zooms to 1.0, selects the node and opens the inspector. The report that the jumped-to node sits under the panel was overstated: it overlaps the panel by only about 7 px.
- **Screenshots:** `audit/screenshots/va-flow-canvas/15_validate_jump.png`, `audit/screenshots/va-flow-canvas/47_flow_srv_asloaded.png`, `audit/screenshots/va-verify-flow-canvas/10_srv_after_switch.png`, `audit/screenshots/va-verify-flow-canvas/11_jump.png`
- **Recommendation:**
  - Mark issues on nodes:
    - errors: a 2 px red ring plus a "!" count badge;
    - warnings: amber;
    - a dangling-output marker on any unconnected YES/NO handle;
    - a tooltip listing the node's issues.
  - Replace the floating list with a collapsible Problems drawer at the bottom, showing error and warning counts, grouped by node. Clicking an issue selects and centres the node.
  - Key validation state by flow id, and clear or recompute it whenever the open flow changes.
  - Name nodes by step number plus label (for example "Q4 · Confirm Interest").

### F-FLOW-011 — Edge styling carries no meaning, branch outcomes are unlabelled, and the marching-ants animation ignores reduced motion
- **Severity:** high · **Confidence:** verified
- **Source findings:** FLOW-CANVAS-07
- **Pages:** /flow-builder
- **Evidence (Flow A, 27 edges):**
  - **Animation:** 25 edges have the `animated` class (5 px dasharray, `dashdraw 0.5s infinite`). Edges drawn by users come out animated. There is no legend and the dashes mean nothing.
  - **Colour and labels:**
    - 26 edges are stroke rgb(47,95,224) and 1 is red rgb(208,70,58).
    - That red edge carries the only label, "Not Interested": 10 px text on a white box, about 7.1 px on screen.
    - Edges leaving a FALSE handle render blue and dashed, exactly like TRUE edges.
  - **Stroke width:** every stroke is 1 px, about 0.71 px on screen.
  - **Reduced motion:** with `prefers-reduced-motion: reduce` emulated, all 25 edges keep animating (WCAG 2.2.2, 2.3.3).
  - **Accessible names:** 24 of 27 edge aria-labels contain raw ids ("Edge from node_1785140…-copy-…-copy-… to node_…").
  - **Routing in other flows:** Flow B has 12+ edges converging on one node and crossing each other. In Flow C a NO edge loops back behind the cards.
- **Screenshots:** `audit/screenshots/va-flow-canvas/51_edge_selected.png`, `audit/screenshots/va-flow-canvas/50_edge_hover.png`, `audit/screenshots/va-flow-canvas/45_airport_fit.png`
- **Recommendation:**
  - Give every branch edge an outcome label pill (Yes/No, True/False, Verified/Failed, or the condition value) at least 12 px on screen.
  - Colour edges by outcome at 1.5–2 px: positive #15803D, negative #B91C1C, default neutral #64748B.
  - Stop animating saved edges. Animate only the path being traversed during a simulation (F-FLOW-016), and add `@media (prefers-reduced-motion: reduce) { .react-flow__edge-path { animation: none } }`.
  - Reserve dashed lines for fallback and timeout paths, and document colours and dash styles in a legend.
  - Build edge aria-labels from node labels, for example "Confirm Interest — No → Thank & End".
  - Use `smoothstep` edges with rounded corners for flows with many branches.
