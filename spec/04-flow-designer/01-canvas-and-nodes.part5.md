
---

## 11. Keyboard (mock section 11)

### 11.1 Model

**The canvas key map is `06-accessibility` §9.6, and only there.** This part, P2 §16.5 and the `?` sheet reference it; none restates it. Every key is registered once in the `ShortcutProvider` registry (06 §8.2, §8.4), which generates the `?` sheet and `aria-keyshortcuts`, and a lint test fails the build when two bindings share a key within one scope (06 §8.4). Modifiers follow the platform through Kbd (core §7.3): ⌘ and ⌥ on macOS, Ctrl and Alt elsewhere.

- **The canvas is one tab stop** with a roving tabindex. Tab enters at the last focused step, or the first Trigger on first entry; Shift+Tab leaves. Roving order is **call order** (D7), then unreachable steps, then frames and notes in reading order; the step's accessible name states its position ("step 3 of 14 in call order") next to its stable number.
- **Focus follows into view:** moving focus to an off-screen step pans it into view (`--dur-slow`; instant under reduced motion) without changing zoom, and never under the inspector, minimap, Find bar or Problems panel.
- **Sockets** are reached with ↑/↓ inside a focused step; they are not separate tab stops.
- **Single-key shortcuts** (A, C, M, O, V, T, +, −, Shift+1, Shift+2, Shift+0, ?, and `]` / `[` in compare mode) are ignored while typing, are listed with a "single key" mark, and stop working when the account setting turns them off (F-A11Y-004). Every one has a visible button too (P5). Browser zoom keys are never intercepted. While the designer is open (shell focus mode) the shell's `[` sidebar key is suppressed; the rail overlay stays available from its expand button (shell §3.8).

### 11.2 Keys this part implements

The meanings are 06 §9.6's; this part implements the spatial rows and draws their feedback:
- **Navigate:** Home · End (first Trigger · last step in call order); ⌘/Ctrl+F Find (§12.2).
- **Arrange:** Alt+Arrow and Alt+Shift+Arrow nudge the selection 16 / 64 px; `M` Move mode (§10.4); ⌘/Ctrl+D duplicate; ⌘/Ctrl+C · X · V (§10.2); ⌘/Ctrl+G · ⌘/Ctrl+Shift+G frame and ungroup; Alt+Delete delete and reconnect (§10.3).
- **Select:** Space selects only the focused step, Shift+Space toggles it (§10.1); ⌘/Ctrl+A; Esc clears (a second Esc clears phase emphasis); Shift+F10 menus (§10.5).
- **View:** `+` · `−` zoom; Shift+1 · Shift+2 · Shift+0 fit flow, fit selection, 100 %; Space+drag pans (pointer).
- **Issues** (next / previous) are **Alt+.** and **Alt+,**, matched by `KeyboardEvent.code` (Period, Comma) so macOS Option characters don't break them; Alt+Arrow is never used for issues. P2 §12.4 owns what they do.

### 11.3 The `?` sheet

The shared sheet (Dialog `lg`, shell §10; portalled to `<body>`, focus moved in and returned, max 80 vh with internal scroll, F-A11Y-027, F-FLOW-024) opens on its **Flow Designer** tab when called from the designer. Groups: Navigate · Edit · Select · View · Test, two columns at ≥ 768, one below; only keys that work are listed. A **Legend** tab teaches the grammar: the four silhouettes with their tiles and phase descriptions, `─ Path` and `┄ Fallback`, the issue badges (errors, warning, Not connected), and Now and Reached (risk mitigation for monochrome steps, direction §10). Phones never show keycaps; the sheet stays reachable from Help for external keyboards.

---

## 12. Large flows (mock section 7)

Validated against Flow A (26 steps) and Flow B (35 steps, 47 connections, 12 converging on one step).

### 12.1 Getting around

| Need | Tool |
|---|---|
| See the whole flow | Fit (⇧1): the Block band shows silhouettes, tiles and two-line Block labels (`#n` + title, ≥ 140 px, §5.5); frames summarise groups; flows over 20 steps also open with the Outline docked at ≥ 1280 (§9.2) |
| Jump to a known step | Find with "#9", "9", "step 9" or a title; the Outline; Go to step from any issue; `/flows/<id>?node=<stepId>` deep links select and centre |
| Follow one phase | Phase ruler emphasis (§4.4) |
| Keep orientation while zoomed in | Minimap (≥ 1280); Home and End |
| Keep a region tidy | Frames, Tidy selection, snap and guides |

### 12.2 Find

**FindBar** (new, §20.1): top-right of the canvas, 12 px inset, width `--size-inspector` 320, `--surface-raised`, 1 px `--border-overlay`, `--radius-8`, `--e2`, `--z-chrome`. Opened by ⌘/Ctrl+F or the tool rail; separate from the palette's step search (direction §6.5).

| Part | Rule |
|---|---|
| Field | SearchInput `sm`, autofocused, text selected on reopen; placeholder "Find steps…" |
| Count | "2 of 5" in `meta-12` `--text-3`, `tabular-nums`, `aria-live="polite"` (announces "2 of 5 matches" after typing pauses) |
| Previous · next | IconButtons `chevron-up` / `chevron-down` ("Previous match", "Next match"); Shift+Enter / Enter in the field |
| Options | Menu: search in Titles ✓, What the agent says ✓, Answers and examples ✓, Variables ✓, Notes ✓; Only one phase ▸ |
| Close | IconButton `x`, Esc; focus lands on the current match (never `<body>`) |

Behaviour: matching is debounced by `--timing-validate-debounce`, case- and accent-insensitive, and uses the registry synonyms. Non-matching steps, notes and connectors dim to `--opacity-dim`; matched words get `<mark>` (`--text-selection`) in the Full band. The current match gets the focus ring and is panned into view; below 0.5 zoom the view zooms to 0.75 around it so it can be read. A match inside a collapsed frame shows "1 match" in the frame summary and expands the frame while it is current. "#9", "9" or "step 9" jumps straight to the step whose **stable** number is 9 (D7), and a query matches both numbers and titles ("9" also finds "Site visit 9 am"; the numbered step is listed first). No results: the count reads "No matches" and the canvas is not dimmed.

### 12.3 Outline (placement and sync)

The Outline's structure and editing are P2 §16 (FlowOutline). This part places it: the left panel (`--size-left-panel` 280) at ≥ 1024 (opened and docked on load for flows over 20 steps at ≥ 1280, §9.2), toggled by `O`, the tool rail or the Problems bar; the left column of Review mode at 768–1023 (`--size-left-panel-tablet` 320); the main view below 768 (§3.2). Selection is shared: selecting a row selects and pans to the step (keeping zoom); selecting on the canvas highlights the row (`--accent-soft` + 2 px inset `--accent-mark`) and scrolls it into view; hovering a row gives its step the hover border. Frames and notes do not appear in the Outline in v1 (it is the call path, not the drawing).

### 12.4 Frames

A frame groups steps visually and can collapse. Frames are flow content saved in the Draft but never compiled into the agent's script, never validated and never counted in the phase ruler.

| Aspect | Rule |
|---|---|
| Look | `--frame-{neel,teal,ochre,rose,slate}` fill with its `-border` (foundations §3.6) or **None** (transparent, 1 px `--border-strong`), `--radius-8`, 16 px padding around members, drawn under steps and connectors. The low-chroma tints are the pressure valve for "we want colour back" (direction §3.2); they never mean state |
| Header | 32 px: collapse IconButton (`chevron-down` / `chevron-right`), title `label-13`/600 `--text` (≥ 15:1 on every tint), count "6 steps" `meta-12` `--text-3`, `⋯` menu. Counter-scaled so it stays readable in the Block band |
| Create | ⌘/Ctrl+G on a selection, the selection bar, the palette's Canvas group, or the canvas menu. Default title "Frame 1" with the title field in edit mode |
| Membership | A step belongs to at most one frame (no nesting in v1). Dragging a step onto a frame adds it; dragging it out removes it. The frame's bounds hug its members; moving the frame moves them. Frames never overlap: a drop that would overlap is placed beside |
| Collapse | A view preference stored per user (like the viewport), so collapsing never dirties the draft. A collapsed frame is a 240 px block: header, summary "6 steps · 1 warning" (member issues roll up, errors first, with the same badge rules as steps), one input port if any connection enters, and one exit socket per distinct outgoing connection, labelled with its target ("To Visit booked"). Connections re-route to these ports |
| Tidy | Frames are ELK compound nodes: members stay together |
| Keyboard | The header is in the roving order before its members; Enter toggles collapse; `aria-label` "Frame Qualification, 6 steps, collapsed" on a `role="group"` |

### 12.5 Notes

A note is a comment on the canvas, not a step (replaces nothing today; F-FLOW-017 asks for sticky notes).
- 220 px wide (drag-resizable 200–320), `--surface-2`, 1 px `--border`, `--radius-6` (smaller than a step's 8, so it never reads as a step), no shadow, no sockets, padding 8 × 10.
- Header `meta-12` `--text-3`: `sticky-note` icon · "Note" · author · relative time. Body `data-13` `--text`, plain text up to 500 characters, links detected.
- Dropped within 24 px of a step, a note **pins** to it ("Pinned to step 4" in its menu) and moves with it, including through Tidy.
- Saved in the Draft; never compiled, validated or counted; included in Find (option), copy and paste, and JSON export. In the Block band only the first line shows. Threaded comments with mentions are v2 (they need presence and notifications, Q6).

### 12.6 Per-step call data (v1.1, hidden until the data exists)

"Show call data" in View options adds a meta line to each step ("Reached by 82 % · 1,204 calls") and a share to each answer row ("46 %"), from calls on the Live version over the last 30 days, with the scope stated in the phase ruler ("Live v7 · last 30 days"). Drop-off is written as text ("18 % hung up here"), never as a heat colour. Test calls are excluded. Hidden, not simulated, until per-step analytics ship (P1; F-FLOW-017 item 5).

### 12.7 Performance budget

- React Flow `onlyRenderVisibleElements`; memoised step components; the Block band renders 3 elements per step and drops connector labels.
- `--zoom` is written to the viewport element only on `onMoveEnd` and on band changes, quantised down to 0.05 (§5.5 rule 3); during a gesture text scales with the transform, so no per-frame style invalidation reaches the visible steps. LOD band changes are the only re-render triggered by zoom.
- No `getBoundingClientRect` during render; `user-select: none` and `inert` on side panels while dragging.
- Rules run in a Web Worker above 60 steps (P2 §24).
- Targets: 60 fps pan and zoom with 150 steps on a mid-range office laptop (integrated graphics, 1366 × 768), measured with the level-of-detail clamp active; with 4× CPU throttling a pinch from 1.0 to 0.25 on 150 steps keeps ≥ 50 fps with no long task over 50 ms; a 35-step flow interactive within 1.5 s of its data arriving.

---

## 13. Empty canvas and new-flow templates (mock section 8)

### 13.1 PhaseStrip on every starting point

The `/flows/new` form is P2 §15.3. Each starting point there (Blank, Site visit, Lead qualification, EMI reminder, COD confirmation, Appointment, Support FAQ) shows a **PhaseStrip** that this part defines, so templates are recognisable in the same visual grammar as the canvas:
- A row on `--surface-2` (`--surface` inside the selected RadioCard), `--radius-6`, padding 8: up to four path steps (the Trigger, the first Logic step, the key Action, the happy-path Outcome), each a 20 px glyph tile + step name in `label-12` `--text-2`, joined by a 12 px `arrow-right` in `--text-3` (the phase ruler's separator, §4.4; never `chevron-right`).
- Names truncate at 120 px with an ellipsis; below 480 px the strip shows tiles only plus "10 steps".
- The strip is `aria-hidden`; the card's description carries the words ("Inbound call, then Ask about a visit, Book visit, Visit booked").
- **Preview** opens a Sheet `detail` (560) with a read-only canvas of the template at Fit in the Compact band, the phase ruler counts, and "Use this template" (selects the RadioCard and closes).

### 13.2 First open of a new flow

- **From a template:** Fit (clamped to the Full band where possible), the first step after the Trigger selected and its inspector open, and P2's Test hint. The template was instantiated against this workspace (P2 §15.3), so the issues chip reads "No issues" (or "1 warning" for W08 when the workspace has no inbound number yet).
- **From Blank:** a Trigger connected to an Outcome (End with outcome, neutral tile, "Choose what this call records") at 100 %, with the Add step panel open at ≥ 1440. The Trigger follows the same workspace rule as templates (P2 §15.3): an Inbound call bound to the workspace's only verified, unbound number, otherwise an Outbound batch. The issues chip reads **"No issues"**; nothing is red before the author has done anything. (If the Q2 rule for an unset outcome ships, it is the warning "Choose what this call records", never an error.) This is the only first-use design: P2 §17 and `05-responsive` §10.8 reference it.
- The connection carries a 20 px **"+" insert button** at its midpoint and, 16 px below, the **empty-state card** (EmptyState region variant, overlay §15, 352 px, `--surface`, 1 px `--border-strong`, `--radius-8`, `--e1`):
  - Title: "What happens when the call connects?"
  - Body: "Add the first step. Most flows greet the caller, then ask one question."
  - Actions: **Add Speak** · **Add Question** (secondary) · link **All steps** (opens the palette). Both buttons insert between the Trigger and the Outcome, connected on both sides, and select the new step.
  - The card is in the roving order right after the Trigger. It disappears once the flow has more than two steps and never returns.
- A flow with no steps at all (only possible through a broken import, because the last Trigger can't be deleted) shows EmptyState "This flow has no steps. Add a trigger to say how calls start." with **Add trigger…** (opens the palette on the Trigger group).

### 13.3 Templates are tested (F-FLOW-013)

CI loads every template, runs the shared rule set (zero errors, zero warnings in isolation), compiles it (no "undefined" or "null" in the agent script), checks that every path reaches an Outcome, and checks that Tidy is stable (running it twice moves nothing). It then **instantiates every template in a fixture empty workspace** (no numbers, no calendar, no WhatsApp, no knowledge) through the real create path (P2 §15.3): each must open with 0 errors and at most W08. A failure blocks the build. Today's New-flow template fails validation and prints "Duration: undefined minutes".

---

## 14. States of the canvas, with copy

| State | What the canvas shows | Copy |
|---|---|---|
| **Loading** | Shell and Flow header render at once (name if known from the list); SaveState and VersionChip hidden; after 200 ms the "Flow canvas" skeleton (overlay §13.2): dot grid and four static silhouettes, no edges, no text; editing and autosave off until hydrated. Never today's default-template flash (F-FLOW-037) | Hidden status line: "Loading Site-visit qualifier…" |
| **First use** (blank flow) | §13.2: Trigger connected to Outcome, the "+" and the empty-state card; issues chip "No issues" | "What happens when the call connects?" |
| **Partial: rules running** | IssuesChip "Checking…"; step badges keep their last result until the new one arrives | "Checking…" |
| **Partial: unsupported steps** | Unsupported step components (§5.3) | "Type "ambulance_call" isn't supported" |
| **Partial: overlapping or top-down layout** | Inline Notice (info) at the top of the canvas (§9.4) | "2 steps overlap. Tidy · Dismiss" / "This flow is laid out top to bottom. Re-layout as draft" |
| **Error: load failed** | SectionError (overlay §16) filling the canvas; header keeps the name if known | "Couldn't load this flow. Check your connection and try again." **Retry** · Back to Flows |
| **Not found** | In-shell NotFound | "This flow doesn't exist or was deleted. **Go to Flows**" |
| **Interim I1** (before revisions ship) | Header per §3.3 (`Draft on this device · 3 changes ▾`, `Saved on this device 11:24 am`, `Saved flow`); live note per §4.4; no request is sent until Publish (P2 §4.9). Browser storage unavailable: SaveState `Not saved · this tab only` (danger), `beforeunload` registered, Publish stays available | "Edits stay on this device until you publish. Callers hear the saved flow." |
| **Offline** | ConnectionBar (shell) and SaveState "Offline · 3 edits on this device" (P2 §4.7; the one offline string). With the local draft queue: editing continues. Without it: the canvas turns read-only with an inline Notice | "You're offline. Editing is paused so nothing is lost. It resumes when you reconnect." |
| **Permission: view only** (FD12) | Read-only canvas: no palette, no "+", no drag, no Tidy; the inspector is read-only; Publish hidden; Tag `outline` "View only" in the header | "You can view this flow. Ask Asha R. (admin) to change it." |
| **Permission: another user's Only-me flow** | Forbidden (overlay §16) in the shell | "This flow is private to its owner." |
| **Conflict** | SaveState "Changed elsewhere · Review" (P2 §4.6); the canvas stays as you left it until you choose | per P2 |
| **Viewing an old version** (`?v=5`) | Read-only canvas; P2's bar says which version | per P2 |
| **Compare with live** | Added and changed steps as P2 §4.5 (Tags "Added", "Changed"); removed steps are ghosts placed where they were in Live: `--surface-2` fill, solid 1 px `--border-strong` (never dashed), text at full contrast, only the glyph tile and sockets at `--opacity-unreachable`, Tag `danger` "Removed" | per P2 |
| **Locked** | §9.5 | "Unlock the canvas to tidy." |
| **Test running** | Now and Reached marks, taken connectors (§5.4, §7.2); editing stays allowed | per P2 §13 |
| **Success feedback** | Announcements for add, connect, disconnect, move (on drop: "Moved Book site visit"), paste, selection count; toasts only for undoable deletes and Tidy | "Added Speak 2 after Ask about a site visit, connected from Later." · "Deleted 'Polite close' and 2 connections · Undo" · "Tidied 26 steps · Undo" |
