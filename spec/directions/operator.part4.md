
---

## 15. Flow Designer: Trigger → Logic → Action → Outcome

**Job:** script what the agent does on a call, prove it works, and put it live on purpose. The tool should feel like a serious engineering instrument, closer to a circuit editor than a whiteboard. Everything here is additive to the React Flow base, which stays.

### 15.1 The four-phase model
Every step belongs to exactly one phase. The palette, the spine, the outline and the validator all use the same four words.

| Phase | Meaning | Vaani step types (today's names → new name) | Outputs |
|---|---|---|---|
| **Trigger** | How a call enters this flow | Start (today a fixed pill with no config) → **Inbound call** (number, hours), **Outbound batch** (from Leads or a campaign, concurrency), **API / webhook**, **Browser test** | 1 |
| **Logic** | Decide where the conversation goes | Question → **Question** (N answers + No reply), Branch/Condition Check → **Branch** (variable · operator · value cases + Else), Verify Customer → **Verify** (Verified / Failed / No reply) | N named port tabs + mandatory fallback |
| **Action** | Say or do something | Speak, Knowledge Lookup, FAQ, CRM/Live Lookup, Book Meeting, Send WhatsApp, Transfer Call → **Speak · Knowledge lookup · FAQ · CRM lookup · Book meeting · Send WhatsApp · Transfer to human** | 1 (lookups add Found / Not found) |
| **Outcome** | How the call ended, and what it writes | End Call → **End with outcome**: Interested, Callback, Not interested, No answer, Transferred, Do not call, Failed | 0; sets lead status + call-report outcome |

- Each step type has **one name** everywhere: palette, canvas, inspector, toast and validator (F-FLOW-027).
- **Frames** ("Greeting", "Qualification", "Booking") and **Notes** are annotations, not phases.
- The phase gives a flow the "Trigger → Logic → Action → Outcome" reading that the canvas lacks today. It had no trigger configuration and no outcome taxonomy (03C "What the canvas communicates").

### 15.2 Layout of the tool
```
┌ Flows › Site-visit qualifier [Draft · from v7 ▾] ✓ Saved 11:24 (● Live v7) ↶ ↷ ⧉ ─── ⚠ 1 warning [▷ Test] [Publish v8…] ⋯ ┐ 48
├───┬────────────────────────────────────────────────────────────────────────────┬──────────────────────────┤
│ + │ ◖Trigger 2 → ◇Logic 2 → □Action 5 → ◗Outcome 5          ── Path  ┄┄ Fallback│ ◇ Question  Q1    ⋯  ×  │ 40
│ ☰ ├────────────────────────────────────────────────────────────────────────────┤ Configure│Test data│Issues│
│ ⛁ │ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·│ Label                    │
│ ⟲ │  ╭─────────────╮      ┌─────────────────────┐     ┌────────────┐  ┌────────╮│ [Interested in a site…]  │
│───│  │▮ TRIGGER    │      │◇ LOGIC · QUESTION Q1│  ┌─▶│□ ACTION  ⚠1│─▶│◗OUTCOME││ Agent asks               │
│ ⚙ │  │Inbound call │──⊕──▶│Interested in a site │  │  │Book site   │  │Visit   ││ [{{lead_name}} ji, would │
│   │  │+91 80••••2210│     │visit?               │  │  │visit       │  │booked  ││  you like to visit…]     │
│   │  ╰─────────────╯   ┌─▶│{{lead_name}} ji, …  │  │  └────────────┘  │→Intrstd││ Answers · each is a port │
│   │  ╭─────────────╮   │  ├─────────────────────┤  │  ┌────────────┐  ╰────────╯│ ⋮ Yes    haan, zaroor    │
│   │  │▮ TRIGGER    │───┘  │Yes     haan, zaroor ●┼──┘┌▶│□ Schedule  │─▶ Callback │ ⋮ Later  next week       │
│   │  │Outbound batch│     │Later   baad mein    ●┼───┘ │  callback  │    set     │ ⋮ No     nahi            │
│   │  ╰─────────────╯      │No      nahi         ●┼───▶ □ Polite close ─▶ Not int.│   No reply  after 6 s    │
│   │                       │No reply  after 6 s  ○┼┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄▶ No answer│ + Add answer             │
│   │                       └─────────────────────┘                              │ Save to [{{visit_intent}}]│
│   │ [− 100% + | ⛶ Fit]                                            [minimap]    │ ✓ Autosaves to draft. Live│
├───┴────────────────────────────────────────────────────────────────────────────┤   v7 unaffected. Esc     │
│ ⚠ 1 warning  Book site visit: WhatsApp template pending approval  Go to step   ☰ Outline  ▷ Test panel T │ 32
└────────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘
```
- **One 48 px header** replaces today's two rows (about 128 px) and the 42 px banner. The app sidebar auto-collapses to its 56 px rail while a flow is open. At 1440×900 the canvas grows from 52% to about 75% of the viewport with the inspector closed (F-FLOW-022).
- **Header, left zone:** breadcrumb, flow name, version menu, save state, the Live chip, and undo / redo / tidy.
- **Header, right zone:** the issues chip, **Test** (secondary) and exactly **one** primary, **Publish v8…**. Private, Share, Export and Import JSON, Reset and Delete go into `⋯` (F-FLOW-018, F-FLOW-019).
- **Phase spine** (40 px): phase counts with their glyphs. Clicking a phase highlights its steps and dims the rest to 40%. The phase of the selected step is marked. It also holds the edge legend.
- **Left rail** (48 px):
  - **Add step** (`A`) opens the palette popover: single column, search first, grouped by phase, full names and one-line descriptions, no truncation (F-FLOW-035).
  - **Outline** (`O`), **Variables** (`V`), **Version history**, **Flow settings**.
- **Palette placement:** at ≥ 1600 px it can be pinned open as a 240 px panel. It auto-collapses while the inspector is open (F-FLOW-022).
- **Inspector** (320 px, resizable to 480): tabs are Configure · Test data · Issues. There is no editing modal and no "Delete Node" slab; delete lives in `⋯`.
- **Problems bar** (32 px): the current issues, with Go to step, plus toggles for Outline and the Test panel.

### 15.3 Shape grammar (colour means state, shape means type)

| Phase | Node shape | Glyph | Why |
|---|---|---|---|
| Trigger | Left edge fully rounded (28 px), right edge 8 px | filled half-round tab | an entry: nothing connects into it |
| Logic | Rectangle, 8 px, with port-tab rows below the body | diamond | the flowchart convention for a decision |
| Action | Rectangle, 8 px, with its tool icon top-right (calendar, database, message…) | square outline | a process step |
| Outcome | Right edge fully rounded, with a 3 px terminal bar in text-2 | half-round with bar | an exit: nothing leaves it |

- All nodes share one surface (`--surface`), a 1 px `--border-strong` edge, e1, a 14/500 ink title and a caps-11 phase label in text-3. Every title is 17.9:1, compared with 1.48 to 4.84:1 today (F-FLOW-007).
- Category colour is gone. Hue appears only for **state:**

| State | Treatment |
|---|---|
| Selected | 2 px accent outline with 2 px offset, e2, accent sockets |
| Keyboard focus | 2 px `--focus` outline (the same ring as everywhere else) |
| Error | 1 px danger border and a red count badge ("⚠ 2") on the top edge |
| Warning | amber border and amber badge |
| Unreachable | 50% opacity and a "Not connected" meta line |
| Running in a test | accent-soft fill, and the traversed edges draw in accent once |
| Live analytics overlay (optional) | a meta chip "62% reached · 41% Yes" (F-FLOW-017) |

### 15.4 Node anatomy
- **Width:** fixed per phase (Trigger 208, Logic 224, Action 184, Outcome 168). There is no free resizing, and nodes never overlap (F-FLOW-009, F-FLOW-021).
- **Content rows:** phase label row (16) · title (20, one line with ellipsis and a tooltip) · body (13/18, two lines clamped: the prompt, number, template or condition) · meta (12/16 in text-3: tool, variable written, wait time).
- **Logic port rows:** 26 px each: **label** (13/500 ink), **examples or rule** (12 text-3), and the **socket** on the right edge. The fallback row sits on `--surface-2` with a hollow socket.
- **Grid:** nodes snap to an 8 px grid. The canvas shows 1 px dots every 16 px at ink 13% (a neutral grid, no hatch and no noise).

### 15.5 Ports and edges
- **Sockets:** 10 px visible, 24 px hit area, 1.5 px `--control` ring. Filled when connected, hollow when free. A free socket shows `+` on hover or focus, which opens the mini palette and inserts an already-connected step.
- **Input:** one socket on the left edge of every non-Trigger node. Several edges may merge into it.
- **Edges:** orthogonal "smoothstep" with 8 px corner radii, 1.5 px `--edge` (graphite).
  - Hovered and selected edges turn accent at 2 px.
  - A **dashed** edge means fallback, and nothing else.
  - An edge's accessible name comes from labels: "Q1 Interested in a site visit? · No reply → No answer" (F-A11Y-028).
- **Edge actions:** a selected edge shows a small toolbar (Insert step, Change output, Delete). Hovering a path shows an insert `⊕` at the midpoint.
- **No marching ants:** edges animate only while a test run traverses them, once (F-FLOW-011).

### 15.6 Canvas navigation
- **Direction:** the default layout is **left to right**, so reading order is phase order. A top-to-bottom option exists for narrow screens.
- **Tidy up** (`⇧T`): layered auto-layout (ELK "layered", rank spacing 48, node spacing 24) that respects frames. The result can be undone as one step.
- **Level of detail by zoom** (F-FLOW-008):

| Zoom | Nodes show | Labels |
|---|---|---|
| ≥ 0.75 | full node | normal |
| 0.5 – 0.75 | compact: glyph + title + port labels | normal |
| < 0.5 | phase-shaped blocks | HTML overlay counter-scaled to 12 px on screen |

- **Zoom control:** `− 100% +` and `Fit`. `⌘0` fits, `⌘1` goes to 100%, and the menu offers 50 / 100 / 200 presets. Flows open at `fit({ minZoom: 0.75 })` anchored on the first Trigger, or at the saved viewport.
- **Minimap:** neutral node rectangles with an accent viewport frame. It is toggleable, hides below 1280 px or when the canvas is under 600 px wide, and never covers nodes (F-FLOW-023).
- **Find:** `⌘F` searches labels, prompts and variables, with next and previous. **Outline** (`O`) lists steps grouped by phase with issue marks; clicking a step selects and centres it.

### 15.7 Inspector, Variables and Test
- **Configure:** Label (required, unique). Type fields validated per schema on change and on blur, with inline errors via `aria-describedby`. Only valid values reach the graph (F-FLOW-015).
- **Variables:** `{{` opens a picker of lead fields, captured answers and CRM fields. Unknown variables are errors (F-FLOW-028). Integration dependencies show inline: "Needs Google Calendar · Connect" (F-FLOW-030).
- **Test data tab:** sample values for this step's variables.
- **Test panel** (`T`, docked bottom, 280 px, resizable): a **text simulator** that is free and the default. Agent turns and quick-reply buttons (Yes / Later / No / No reply) use the timecode gutter. The canvas highlights the current step and traces the path in accent. Captured variables fill in live. **Call me with this draft** is a billable test call on the **draft** revision, never the live one, behind a pre-flight (F-FLOW-016).

### 15.8 Lifecycle: draft, save, publish, history
- **Two revisions per flow:** `published` (what calls use) and `draft` (what you edit). Opening a flow creates no write. The dirty flag ignores hydration, fitView, `dimensions` and selection events, and a content hash skips no-op saves (F-QA-002, F-FLOW-002).
- **Save-state chip:**

| State | Chip |
|---|---|
| saved | `✓ Saved 11:24` (static icon) |
| dirty | `● Unsaved changes` (amber dot) |
| saving | `Saving…` |
| failed | `⚠ Couldn't save · Retry` (red, stays until a save succeeds, plus a toast on the first failure) |
| new flow | `Not saved yet` |

- Pending saves flush on route change, `visibilitychange` and `pagehide` with `keepalive`. `beforeunload` is registered only while dirty. The server requires `If-Match` and returns 409 on a conflict (F-FLOW-003).
- **Undo history:** one stack for every graph change, empty after load (F-FLOW-005). Deleting a node gives the toast "Deleted 'Polite close' and 2 connections · Undo".
- **Publish v8…** opens a 640 px sheet containing:
  1. Validation: errors block, warnings need a tick.
  2. A diff: "3 steps changed · 1 added · prompt changed", each item linked to its node.
  3. Where it goes live: the inbound numbers, the outbound batches using it, and "Default for Cockpit".
  4. An optional note.
  5. The **Publish v8** button.
- After publishing, the header shows `Live v8` and the draft is clean.
- **Version history** lists who, when, the note and the diff. **Restore as draft** never overwrites Live directly (F-FLOW-001, F-FLOW-012, F-FLOW-014).
- **AI draft** (secondary, in the `⋯` menu and ⌘K) opens a side sheet: a multi-line prompt, then a preview diff on the canvas (added steps in accent-soft, removed ones struck), then **Apply to draft** or **Discard**. The canvas never changes silently (F-FLOW-031).

### 15.9 Validation rules (the one source for the chip, marks, Problems bar and server)
- **Errors (block Publish):**
  - no Trigger
  - an unreachable step
  - a required socket left unconnected (the fallback included)
  - an empty Speak message or Question text
  - an invalid E.164 number
  - WhatsApp with no template
  - a lookup with no connector
  - attempts outside 1–5
  - an unknown variable
  - a blank or duplicate flow name
  - a path that ends without an Outcome
- **Warnings:** a duplicate step label, a disconnected integration, a template pending approval, a Logic node without examples.
- **Behaviour:** results are recomputed 300 ms after each change and keyed by flow id, so they never carry over (F-FLOW-010). Steps are named by id and label ("Q1 · Interested in a site visit?"), never by a raw node id. The server runs the same rules and returns 422 with the list (F-FLOW-004).

### 15.10 Keyboard and accessibility
| Key | Action |
|---|---|
| `Tab` | Enter the canvas at the first Trigger; tab order follows the graph depth-first, not creation order |
| `→` / `←` | Follow the default output / go back along the input |
| `↑` / `↓` | Move between sibling steps in the same rank, or between port rows on a Logic step |
| `Enter` / `F2` | Open the inspector with focus on Label; `Esc` returns focus to the step |
| `C` | On a step or socket: "Connect to…" listbox of targets (searchable) |
| `A` | Add a step after the focused step (palette popover, inserted and connected) |
| `Alt+Arrows` | Nudge 8 px (`⇧` 32 px) |
| `Delete` | Remove, with an Undo toast |
| `⌘D` · `⌘F` · `⇧T` · `⌘0` / `⌘1` | Duplicate · Find · Tidy · Fit / 100% |
| `O` · `V` · `T` · `?` | Outline · Variables · Test panel · Shortcut sheet (a real dialog, focus moved in, fits 900 px) |

- Each step has an `aria-label` such as "Step 3 of 14, Logic, Question: Interested in a site visit? Outputs: Yes → Book site visit; Later → Schedule callback; No → Polite close; No reply → No answer".
- The Outline view is a complete non-spatial editor: reorder, connect and edit all work from the list (F-A11Y-001, F-FLOW-006, F-A11Y-027).

### 15.11 Responsive behaviour
| Width | Behaviour |
|---|---|
| ≥ 1440 | Rail + canvas + docked 320 px inspector; palette can be pinned at ≥ 1600 |
| 1280–1439 | Same, with the minimap on and the inspector resizable |
| 1024–1279 | The inspector overlays the canvas from the right and pans the selected step into view; minimap hidden |
| 768–1023 | Review mode: the Outline and a read-only canvas side by side; Test and Publish work; editing asks for ≥ 1024 px. The Publish action is never clipped off-screen (F-RWD-003) |
| < 768 | Outline only (grouped by phase), "Run text test", version and status. Touch pan and pinch on the read-only canvas (F-RWD-014) |

---

## 16. Risks and trade-offs

1. **Changing the typeface.** Moving from Hanken Grotesk (which the audit recommends keeping) to IBM Plex costs one migration and a marketing re-set. It also brings an IBM/Carbon association. The mitigation is that Vaani's identity lives in Neel, the status line, port tabs and the timecode gutter, not in the face. If the owner prefers continuity, the system still works with Hanken + JetBrains Mono + Noto Sans Devanagari with no other token change. Plex is recommended mainly for Devanagari parity.
2. **Density can feel "enterprise".** A 13 px data size and 32 px Compact rows can read as cold to SMB first-timers. The mitigation is that Standard is the default, forms stay calm, empty states are plain-spoken, and the Assistant keeps its friendly tone.
3. **The ink status line is a strong horizontal element.** In light mode it is the only dark band, and some will see it as heavy. It must stay 28 px, carry only four or five facts, and never become a toolbar. If research shows it's ignored, the fallback is a top-bar status chip on every breakpoint.
4. **Monochrome nodes.** Removing category colour makes a first glance slightly less "colourful" and relies on users learning four shapes. The phase spine, glyphs, labels and legend teach them, and colour-blind users gain the most. Some teams may ask for colour back; resist it for types and allow user-defined **frame** tints (low-saturation surface tints) as the pressure valve.
5. **Draft/publish is a backend change.** The UI assumes `published_revision_id`, `If-Match` and server validation. Shipping the visuals without it would repeat the audit's core problem of looking truthful while not being truthful. Sequence the backend first (F-FLOW-001).
6. **The pre-flight adds a step to calling.** Power users who call hundreds of leads could feel friction. Keep it one keystroke (`C` then `⌘↵`), remember "don't show for batches under n leads within calling hours" per workspace (admin-controlled), and never skip the cost line.
7. **Left-to-right layout on existing flows.** The 16 existing top-down flows need a one-time Tidy migration. Offer it as a draft ("Re-layout left to right") rather than rewriting live flows.
8. **Keyboard-first can hide features from mouse users.** Every shortcut therefore has a visible button, and keycaps appear only in tooltips, menus and the `?` sheet.

---

## 17. Open decisions and the token block

**Decisions for the owner** (digest 5.11), with this direction's recommendations:
- Accent: **Neel blue** (not violet), including marketing.
- Default theme: **follow the system**, with light as the fallback. Parity in both.
- Case: **sentence case**.
- Flow Save: **no Save button**. Autosave to draft, and Publish creates versions.
- Minimum editing width: **1024 px**.
- The sidebar latency readout: **remove it**. Latency shows only in a live call.
- Compliance cues (recording disclosure, DND and TRAI hours): **in the pre-flight and the live card** (to be confirmed).

**Tailwind v4 `@theme` excerpt** (light values; dark overrides live in `:root.dark`, and in `@media (prefers-color-scheme: dark)` when the theme is System):
```css
@theme {
  --font-sans: "IBM Plex Sans", "IBM Plex Sans Devanagari", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --color-bg: #F6F7F9;      --color-surface: #FFFFFF;   --color-surface-2: #F1F3F6; --color-surface-3: #E8EBF0;
  --color-border: #E3E6EC;  --color-border-strong: #C9CED8; --color-control: #858D9C;
  --color-text: #121722;    --color-text-2: #434B5B;    --color-text-3: #5F6878;    --color-text-disabled: #A3AAB7;
  --color-accent: #2C4BD1;  --color-accent-hover: #2440B8; --color-accent-soft: #EEF1FD; --color-focus: #2C4BD1;
  --color-success: #15803D; --color-success-text: #11703F; --color-success-soft: #E7F5EC;
  --color-warning: #B45309; --color-warning-text: #8A4B00; --color-warning-soft: #FDF3E1;
  --color-danger: #C0271C;  --color-danger-text: #B42318;  --color-danger-soft: #FDECEA;
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px;
  --text-caps: 11px; --text-meta: 12px; --text-sm: 13px; --text-base: 14px; --text-read: 15px;
  --text-title-sm: 16px; --text-title: 20px; --text-title-lg: 24px; --text-num: 28px;
  --ease-out: cubic-bezier(.2,0,0,1);
}
```
The specimen (`operator.html`) is the reference implementation of every value above, in both themes.
