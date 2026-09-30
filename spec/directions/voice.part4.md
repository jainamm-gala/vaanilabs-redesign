# Bolchaal: part 4 of 4

Part of `voice.md`. This part covers the Flow Designer, risks and trade-offs, open decisions and a token appendix. The rendered version is in `voice.html`, screen B.

## 15. Flow Designer

### 15.1 The grammar: Trigger → Logic → Action → Outcome

Every step belongs to one of four categories. Each category is signalled three ways: **silhouette** (boundaries are capsules, work is rectangles), **tile colour** (the only place category colour appears, per digest 5.8 #2), and a **category line** above the title ("Logic · Question"). The palette groups steps in the same numbered order, and a legend chip on the canvas states the sentence: Trigger → Logic → Action → Outcome.

| Category | Meaning | Steps (one name everywhere: palette = node = inspector = toast, fixing F-FLOW-027) | Silhouette | Tile | Ports |
|---|---|---|---|---|---|
| **1 Trigger** | How the call starts | Inbound call (on number …), Outbound call answered (lead list or campaign), API or webhook, Scheduled | Capsule, no input | Ink | 1 output |
| **2 Logic** | Listen and decide | Question (N answers plus a required **No reply** path), Condition (variable · operator · value cases plus **Else**), Verify caller (Verified / Failed) | Rectangle | Jamun | 1 input; N **labelled** outputs |
| **3 Action** | Say or do | Say, Answer from knowledge, CRM lookup (Found / Not found), Book meeting, Send WhatsApp, Transfer to a person (Answered / No answer), Set variable, Call webhook | Rectangle | Peacock | 1 input; 1 output, plus a Failed output for integrations |
| **4 Outcome** | How the call ended | End call with outcome: Visit booked, Converted, Callback set, Not interested, Transferred, No answer, Failed (org-editable taxonomy) | Capsule, no output | Outcome's semantic colour | 1 input |

- The trigger makes inbound vs outbound explicit, and its category line carries calling hours ("Trigger · 10:00 to 19:00").
- Outcomes give every path a named end that feeds Call reports and Analytics (F-FLOW-001 "how a call ended").
- Start and End remain protected: a flow always has at least one Trigger and one Outcome.

### 15.2 Node anatomy

- **Rectangle (Logic, Action).** Fixed width 236 px (Logic grows to 360 px for up to four ports), `surface`, 1 px `border-strong`, `r-md`, `e1`. Contents:
  - **Header:** 24 px tile, a category line in 12/500 `text-3`, and the title in 14/500 `text` (7:1 or better, replacing the coloured titles at 1.48–3.86:1 in F-FLOW-007). A bare script chip sits at the right when the step's language differs from the flow default.
  - **Body:** what the agent says or does, 13/18 `text-2`, clamped to 2 lines and indented to align with the title. `{{variables}}` render as mono accent chips.
  - **Ports footer:** 24 px pill tabs labelled with the answer ("Interested", "Later", "Not now", "No reply"). The tab is the edge's label and the drag hit-area.
- **Capsule (Trigger, Outcome).** 46 px tall, minimum 188 px wide, radius full, 32 px round tile, category line plus title.
- **Handles.** Input: a 10 px ring at top-centre with a 24 px hit area. Outputs: a 9 px dot on the node's bottom edge under each port tab, with a 24 px hit area and a hover halo (F-FLOW-020, A6).
- **Accessible name:** "Step 2 of 8, Question: Ask about the site visit. Answers: Interested → Book site visit; Later → Schedule callback; Not now → Send brochure; No reply not connected. 1 warning."

| State | Treatment |
|---|---|
| Default | As above |
| Hover | Border becomes `border-control`; ports show their "+" |
| Keyboard focus | 2 px accent outline, offset 2 (F-A11Y-007) |
| Selected | Focus outline + `e2`. Its edges and port tabs turn accent. The inspector opens. The URL gets `?node=`. |
| Error | 1 px danger border, a danger count badge at top-right, the message in the inspector and the Problems list |
| Warning | Amber count badge; any unconnected **required** port shows as a dashed amber tab with "+" |
| Unreachable | 60% opacity with "Not connected to a trigger" |
| Running (test) | 3 px accent left bar, a "Running" chip with the voice meter; traversed edges accent |
| Changed (in Publish diff) | "Added / Edited / Removed" caption badge, only while the diff is shown |

### 15.3 Edges

- 1.5 px `edge` (3.1:1 on canvas). Orthogonal routing with 10 px rounded corners and a chevron arrowhead. The selected path is 2 px accent.
- Branch meaning lives in the port tab at the source. Edges longer than 240 px repeat it as a mid-edge pill (12 px, never smaller on screen).
- **Dashed means only "fallback or timeout"** (No reply, Else when auto-generated), and the legend says so (F-FLOW-011).
- No animation at rest. During a test the traversed edge draws once.
- The edge `aria-label` is built from labels: "Ask about the site visit, Later → Schedule callback".
- A selected edge shows a popover: Change answer, Insert step, Delete.

### 15.4 Canvas

- **Grid and snap.** `canvas` with a 20 px dot grid (`dot`), snap 8 px. Default layout is **top-to-bottom ranks** (a script reads down) via ELK layered, applied with **Tidy**. A left-to-right option suits wide flows at 1440 px and up (F-FLOW-021).
- **Insertion** never overlaps (F-FLOW-009, F-FLOW-026). Clicking a palette item inserts after the selected node and connects its first free port. With nothing selected, it goes to the nearest free cell. Palette items can be dragged. Dropping on an edge inserts the step between its two nodes. "+" on an open port opens a mini palette filtered to valid next steps.
- **Zoom level of detail** (F-FLOW-008):
  - 60% and up: full nodes.
  - 35–60%: compact nodes (tile plus title, counter-scaled to at least 12 px on screen).
  - Below 35%: category-coloured blocks with an unscaled label overlay.
  - Opening a flow restores its saved viewport, or fits it with a 60% floor anchored at the Trigger.
- **Overlays.**
  - Top-left: a collapsible legend chip.
  - Bottom-left: zoom control with a %, presets and Fit (`Ctrl+0`, `Ctrl+1`).
  - Bottom-right: a 132 × 80 minimap with neutral blocks, the selected node in accent and an accent viewport frame. It can be toggled and hides when the canvas is under 600 px wide (F-FLOW-023).
- **Search:** `Ctrl+F` across titles and messages, with next and previous.

### 15.5 Toolbar and lifecycle (fixes F-FLOW-001/002/003/012/014/018/022)

One 52 px row replaces today's two rows (about 180 px). The wallet banner does not appear in the builder.

- **Left:** flow switcher ("Site-visit follow-up ▾", which opens All flows with Name, Status, Visibility, Steps, Last edited and Owner, marking "Open now"), `Live v6` badge, `Draft · 3 changes` badge, and the save chip (Saved to draft 12:04 / Unsaved changes / Saving… / Couldn't save · Retry / Not saved yet).
- **Centre-right:** Undo and Redo (bound to real history lengths, F-FLOW-005), Tidy, then the **Issues** button ("No issues", "1 warning" in amber, "2 errors" in red; it opens the Problems list).
- **Right:** **Test call** (secondary) and **Publish…** (primary). Publish is disabled while errors exist, with an inline reason. Warnings go through "Publish with 1 warning".
- **Overflow ⋯:** Flow settings, Version history, Preview AI script, Draft with AI…, Visibility, Duplicate, Export or Import JSON, Delete flow….
- **Autosave** writes only to the draft revision, only for user-made changes, with `If-Match` on every write. Navigation, `pagehide` and `beforeunload` flush or guard unsaved work.
- **Publish sheet:** version number, a change summary (added, removed and edited steps; prompt changed yes/no), the validation result, what uses it (number, campaigns), an optional note, and **Publish v7**.
- **Version history:** view, compare or restore any version. Discard draft is always available.
- **Draft with AI** opens a side sheet with a prompt and a diff preview. Apply or Discard. The canvas never changes silently (F-FLOW-031).

### 15.6 Palette and inspector

- **Palette** (216 px): search with `/`, then groups **1 Trigger, 2 Logic, 3 Action, 4 Outcome** in a single column. Names never truncate (F-FLOW-035); each has a one-line description tooltip. When the inspector is open below 1440 px, the palette collapses to a 56 px tile rail.
- **Inspector** (328 px; resizable 280–480): header with tile, "Logic · Question · step 2", title and close. For a Question:
  - **Vaani says** (a textarea with a `{{` variable picker, F-FLOW-028), the language chip and ▶ Hear it.
  - **Listen for** answers (reorderable, each showing its target, plus Add answer).
  - **No reply** (required: repeat once, then take the path), **Save answer to** a variable.
  - Footer: Delete step (ghost danger, with an Undo toast) and "Edits save to your draft".
  - IDs and positions sit in a collapsed "Advanced" section (F-FLOW-033). Integration-dependent steps show connection status inline with a link to connect (F-FLOW-030).
- **Validation, per type** (F-FLOW-004, F-FLOW-015):
  - Errors: empty message or question; invalid E.164; WhatsApp without a template; lookup without a connector; attempts outside 1–5; unknown variable; blank flow name; unreachable step; unconnected required port.
  - Warnings: duplicate titles; disconnected integration; missing fallback.
  - The same validator runs on the server at Publish.

### 15.7 Keyboard, outline and test (fixes F-A11Y-001, F-A11Y-027/028, F-FLOW-016, F-FLOW-024)

| Key | Action |
|---|---|
| Tab | Enter the canvas at the Trigger (roving tabindex, graph order) |
| ↓ / ↑ | Follow the default output / go to the parent |
| ← / → | Move between sibling branches |
| Enter or F2 | Open the inspector with focus on the first field. Esc returns to the node. |
| C | Connect… (a searchable list of valid targets) |
| N | Add next step (mini palette, inserted and connected) |
| Alt + arrows | Move the node by 8 px |
| Delete | Delete, with an Undo toast naming the step and its connections |
| Ctrl+Z / Ctrl+Shift+Z | Undo / redo |
| Ctrl+D | Duplicate (auto-suffixed "copy 2") |
| Ctrl+F | Find step |
| ? | Shortcut sheet, platform-correct keycaps, focus-trapped |

- **Outline view** ("Canvas | Outline" toggle): an ordered tree of steps indented by branch, with tiles, issue badges and the same keyboard model. It is the screen-reader path and the phone and tablet view.
- **Test call** opens a 280 px bottom dock with two tabs:
  - **Simulate:** text turns with quick replies for each answer.
  - **Call me:** a real call using the **draft**, clearly labelled "Test".
  - The dock shows the conversation line, the transcript and captured variables. The canvas marks the running step and traversed edges.

```
FLOW DESIGNER · DESKTOP 1440
┌──────────────────────────────────────────────────────────────────────────────┐
│⑂ Site-visit follow-up ▾ (Live v6)(Draft · 3 changes) ✓ Saved 12:04  ↶ ↷ ▦Tidy│
│                                        │ ⚠ 1 warning [▷ Test call] [Publish…]│
├────────────┬───────────────────────────────────────────┬─────────────────────┤
│[⌕ Add a… /]│(▣Trigger → ⑂Logic → ▤Action → ⚑Outcome)  │[⑂] Logic·Question·2 │
│1 Trigger   │           ╭──────────────────────╮        │Ask about the site  ×│
│ ▣ Inbound  │           │(☎) Trigger·10–19     │        ├─────────────────────┤
│ ▣ Outbound │           │    Outbound answered │        │Vaani says           │
│ ▣ API      │           ╰──────────┬───────────╯        │┌───────────────────┐│
│2 Logic     │   ┌──────────────────▼─────────────────┐① │Aapne … {{project}}││
│ ⑂ Question │   │[⑂] Logic · Question           [अA] │   │└───────────────────┘│
│ ⑂ Condition│   │    Ask about the site visit        │   │[अA Hinglish] ▷ Hear │
│ ⑂ Verify   │   │    Aapne pichhle hafte {{project}}…│   │Listen for           │
│3 Action    │   │(Interested)(Later)(Not now)(No reply+)│ │⋮ Interested → Book  │
│ ▤ Say      │   └────┬─────────┬────────┬────────────┘   │⋮ Later → Callback   │
│ ▤ Knowledge│  ┌─────▼──────┐┌─▼────────┐┌▼──────────┐   │⋮ Not now → Brochure │
│ ▤ CRM      │  │▤ Action·Cal││▤ Schedule││▤ WhatsApp │   │⚠ No reply  not conn.│
│ ▤ Book     │  │Book visit  ││Callback  ││Brochure   │   │Save answer to       │
│ ▤ WhatsApp │  └─────┬──────┘└─┬────────┘└┬──────────┘   │[{{visit_intent}}]   │
│ ▤ Transfer │  ╭─────▼──────╮╭─▼────────╮╭▼──────────╮   │                     │
│4 Outcome   │  │⚑ Visit     ││◷ Callback││✕ Not      │   │                     │
│ ⚑ End with │  │  booked    ││  set     ││ interested│   ├─────────────────────┤
│            │  ╰────────────╯╰──────────╯╰───────────╯   │🗑 Delete step  draft│
│            │[− 100% + ⤢]                      [minimap] │                     │
└────────────┴───────────────────────────────────────────┴─────────────────────┘
```

### 15.8 Responsive (fixes F-RWD-003, F-RWD-014, R4)

| Range | Behaviour |
|---|---|
| ≥1440 | Palette 216 · canvas · inspector 328, all visible |
| 1280–1439 | Palette collapses to a 56 px rail while the inspector is open |
| 1024–1279 | Palette rail; inspector **overlays** the canvas as a sheet and pans the selected node into view. The toolbar keeps Test call and Publish…; Undo, Redo and Tidy move to ⋯. |
| 768–1023 | View only: pan, zoom, Outline, Problems, Test call. The banner reads "Editing needs a screen 1024 px or wider." |
| <768 | Outline view by default (rendered in `voice-mobile.png`). Toolbar: flow name, Live and Draft badges, Test call. |

---

## 16. Risks and trade-offs

1. **Two Latin sans faces (Anek for display, Hanken for UI).** They could read as mismatched if roles leak. *Mitigation:* Anek is locked to five tokens (display-xl, display, title-1, kpi, kpi-s) with lint rules. A fallback exists: set display tokens in Hanken 600 at -0.02em, losing some identity but no structure.
2. **Anek's Latin has no guaranteed tabular figures.** It is used only for static KPI numerals. Anything that ticks (timers, balances that update live) uses Hanken tabular or mono.
3. **Warm neutrals** can drift towards beige on uncalibrated or low-end screens common in Indian SMB offices. *Mitigation:* chroma is under 0.01 and surfaces are pure white. If testing shows it, set chroma to 0 with no other change.
4. **The signature elements depend on data.** The conversation line needs per-turn timestamps and diarisation. The voice meter needs client-side audio levels (LiveKit or WebRTC stats), which carrier-side calls may not expose. Per-turn script chips need language identification per turn. **Rule: never fake them.** Hide S1 without turn data, show a static meter with "Live", and show one per-call language chip.
5. **The identity is quieter** than today's violet gradient hero, and marketing may feel less spectacular. *Mitigation:* the hero shows a real live-call strip (the conversation line and script chips), which is more specific than an orb.
6. **Jamun (plum) for Logic** sits near the "purple AI" trope. It is confined to 24 px tiles and never used as a fill, text or glow. If stakeholders object, Logic can use the ink-outline tile instead.
7. **The capsule/rectangle grammar is new** to users of the current builder. The legend chip, the numbered palette groups and the category lines teach it. First-run shows the legend expanded.
8. **Backend dependencies.** Draft/publish revisions, `If-Match`, server validation, leg de-duplication and pagination are not visual changes. Without them the truthful UI states cannot be honest. Interim: Publish = the current ACTIVATE behind the confirmation sheet, and hide "Draft" until revisions exist.
9. **Font weight.** Anek Latin variable plus Anek Devanagari add about 70–90 KB (subset, woff2). Other Indic scripts load on demand. Preload only Anek Latin and Hanken.
10. **Removing the global wallet banner** could lower urgency. Blocking notices where calling is blocked, the amber sidebar card and the phone header chip cover it; user testing should confirm.

## 17. Decisions the owner still needs to make

- **Outcome taxonomy:** the default set, whether it is editable per org, and its mapping to CRM statuses.
- **Is the "active flow"** per number, per campaign or per account (F-FLOW-014)? This direction assumes per trigger (number or campaign).
- **Compliance cues** to surface during calls and at Publish: recording disclosure, calling hours, DND/TRAI.
- **Shortcut defaults:** confirm that `C` opens confirmation rather than being removed.
- **Marketing:** light-first to match the app, or dark sections kept as an accent.

## Appendix: tokens for Tailwind v4

```css
@theme {
  --font-sans: "Hanken Grotesk","Anek Devanagari","Anek Tamil","Anek Telugu","Anek Bangla",system-ui,sans-serif;
  --font-display: "Anek Latin","Anek Devanagari","Hanken Grotesk",sans-serif;
  --font-mono: "JetBrains Mono",ui-monospace,monospace;
  --radius-xs:4px; --radius-sm:6px; --radius-md:8px; --radius-lg:12px; --radius-xl:16px;
  --ease-out:cubic-bezier(.16,1,.3,1); --ease-drawer:cubic-bezier(.32,.72,0,1);
}
:root{ /* light */
  --canvas:#fbf9f6; --surface:#fff; --surface-2:#f4f2ef; --surface-3:#ece9e5;
  --border:#e5e1dd; --border-strong:#c1bdb8; --border-control:#928e89;
  --text:#1c1915; --text-2:#504c48; --text-3:#6d6a65; --text-disabled:#a7a4a0;
  --accent:#006c85; --accent-hover:#005b71; --on-accent:#fff; --accent-soft:#e0f4f9; --accent-text:#006077; --accent-border:#a0cdd9;
  --success:#1a763f; --success-soft:#e0f7e5; --success-text:#0a562b;
  --warning:#e4a339; --warning-soft:#fff1d1; --warning-text:#7d460b;
  --danger:#b6322d; --danger-soft:#ffeae8; --danger-text:#9e2320; --on-danger:#fff;
  --jamun:#79466f; --jamun-soft:#f9ebf6; --ink-tile:#2c2823; --on-ink:#fbf9f6;
  --lane-human:#8a8580; --edge:#928e89; --dot:#d6d2cd;
  --chart-1:#0084a4; --chart-2:#c48225; --chart-3:#a2568a; --chart-4:#548436; --chart-5:#ae593a; --chart-6:#596fbb;
}
:root.dark{ /* also under @media (prefers-color-scheme: dark) when theme = system */
  --canvas:#0f0e0c; --surface:#171614; --surface-2:#201e1b; --surface-3:#2a2724;
  --border:#2c2a26; --border-strong:#403d39; --border-control:#6c6863;
  --text:#f2f0ed; --text-2:#c1bdb8; --text-3:#9f9b95; --text-disabled:#605d5a;
  --accent:#65bcd3; --accent-hover:#7bd3e9; --on-accent:#04191f; --accent-soft:#0e2d36; --accent-text:#74cde2; --accent-border:#205563;
  --success:#63ca84; --success-soft:#172c1d; --success-text:#86db9d;
  --warning:#ebb353; --warning-soft:#342611; --warning-text:#f4c677;
  --danger:#ed756e; --danger-soft:#3e1e1c; --danger-text:#fb9890; --on-danger:#1a0a08;
  --jamun:#cf95c1; --jamun-soft:#32232f; --ink-tile:#403c37; --on-ink:#f2f0ed;
  --lane-human:#847f7a; --edge:#6c6863; --dot:#2f2c29;
  --chart-1:#49bbda; --chart-2:#d79e59; --chart-3:#d98fc1; --chart-4:#8cbb73; --chart-5:#e69275; --chart-6:#90a7f1;
}
```

- **Theme switching.** One mechanism: `html.dark` set from `localStorage` with a "system" value, plus `@custom-variant dark (&:where(.dark, .dark *))`, so Tailwind `dark:` follows the app toggle and not the OS (F-VIS-021).
- **Legacy tokens.** Map `--saffron*` and `--peacock*` to `--accent*` during migration, then delete them (F-VIS-036).
