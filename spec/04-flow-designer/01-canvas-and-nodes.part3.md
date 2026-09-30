
---

## 4. Visual grammar: Trigger → Logic → Action → Outcome

### 4.1 The four phases (mock section 2)

| Phase | Palette description | Silhouette | Glyph tile (24 px, radius 6) | Input | Outputs |
|---|---|---|---|---|---|
| **Trigger** | When a call starts | **Capsule start**: left end `--radius-full`, right corners `--radius-8` | Solid `--ink-tile`, glyph `--ink-tile-fg` | none | 1 |
| **Logic** | Listen and decide | Rectangle, `--radius-8`, with answer rows under the header | Outlined: 1 px `--control` on `--surface`, glyph `--text` (the diamond) | 1 | named answers + exactly one fallback row |
| **Action** | Do something for the caller | Rectangle, `--radius-8` | Tinted: `--surface-3`, glyph `--text` (the tool) | 1 | 1; lookups, Book meeting and Transfer show **result rows** (what happened), the last of which is the fallback (P2 §7.2, R2) |
| **Outcome** | How the call ended | **Capsule end**: right end `--radius-full` | The soft tone of the lead status it writes (`--success-soft`, `--warning-soft`, `--surface-3`, `--danger-soft`) with `flag` in the matching text tone | 1 | none |

Four tiles stay distinguishable in greyscale and at every zoom: solid, outlined, tinted, and flag. Phase never relies on hue (direction P2, risk "monochrome nodes" mitigated by the ruler, the palette groups and the legend in the `?` sheet). **Rows tell the second half of the story:** a Logic step's answer rows say what the caller might *say* (label + bilingual examples); an Action's result rows say what the tool *did* (check or x glyph + plain label, no examples). The two row types differ at every level of detail (§5.1, §5.5), so a CRM lookup never reads as a question.

### 4.2 Start and end markers, lanes

- **Start** is always a Trigger capsule; a flow can have several (Inbound call and Outbound batch into the same first step). Triggers have no input port, so nothing can connect into a start.
- **End** is always an Outcome capsule. Every path must reach one (validator error "a path with no Outcome", part 2). An Outcome has no output socket, so a call cannot continue past its end.
- **No swimlanes or phase columns** (D1). Tidy places Triggers in the first layer and Outcomes in the last, which gives every flow a readable entry edge and exit edge. Between them, layers follow the graph.
- **Phase ruler as the lane substitute** (§4.4) and **frames** for user-defined grouping (§12.4).

### 4.3 Step-type registry, as drawn (F-FLOW-027)

The registry's data (type key, name, palette description, outputs, replaced names) is P2 §7.2 (`lib/flow/registry.ts`). This part adds only what the canvas needs from each entry: the glyph, the rows, which row is the fallback, and the default width.

| Type key | Name | Glyph (Lucide, 1.5 px) | Rows on the canvas | Fallback row (dashed edge) | Width |
|---|---|---|---|---|---|
| `trigger.inbound` | Inbound call | `phone-incoming` | – (one socket on the title line) | – | 208 |
| `trigger.outbound` | Outbound batch | `list` | – | – | 208 |
| `trigger.api` | API or webhook | `webhook` | – | – | 208 |
| `trigger.test` | Browser test | `monitor` | – | – | 208 |
| `logic.question` | Question | diamond (custom, drawn to Lucide metrics) | answer rows: 2–8 named answers | **No reply** · after N s (· "asks again once" when retries are on) | 256 |
| `logic.branch` | Branch | diamond | answer rows: 1–8 cases | **Else** | 256 |
| `logic.verify` | Verify caller | diamond | answer rows: Verified · Failed | **No reply** | 256 |
| `action.speak` | Speak | `message-square` | – | – | 240 |
| `action.knowledge` | Knowledge lookup | `book-open` | result row: `check` Found | **`x` Not found** | 240 |
| `action.crm` | CRM lookup | `database` | result row: `check` Found | **`x` Not found** | 240 |
| `action.meeting` | Book meeting | `calendar-plus` | result row: `check` Booked | **`x` Not booked** | 240 |
| `action.whatsapp` | Send WhatsApp | `message-circle` | – | – | 240 |
| `action.transfer` | Transfer to a person | `phone-forwarded` | result row: `check` Connected | **`x` Didn't connect** | 240 |
| `outcome.end` | End with outcome | `flag` | – (no output) | – | 240 |
| `unknown` | Unsupported step | `circle-help` (outlined tile) | one row with Convert to… | – | 240 |

- **Fallback** means "the step could not get what it needed". It is always the last row, always on `--surface-2`, and its connector is the only dashed line (§7). On Logic steps it is an answer row; on Actions it is a result row with the `x` glyph.
- **Outcome tiles** follow the lead status the step sets (P2 §7.14 "Set lead status to"): Interested and Converted → `--success-soft`; Callback due → `--warning-soft`; Not interested, Not reached, Contacted → `--surface-3`; Do not call → `--danger-soft`. The **status line** under the title is plain text, the same sentence everywhere (direction §6.5, `06-accessibility` §10.4, the Outline): **"Lead → Interested"** in `meta-12` `--text-3`, the arrow a 12 px Lucide `arrow-right`, the status word in `--text-2`. It is not a chip: the tile already carries the tone, the words carry the meaning, and the canvas keeps one fewer tag per step.
- **Default titles** come from the registry; when that title already exists in the flow, a number is appended ("Speak 2"), never "New Speak Node" (F-FLOW-026). Duplicate titles stay legal (they get a validator warning, P2 §12.2); `#n` disambiguates them on the canvas.
- **Migrated End steps** must not claim a status they never recorded (P1). They are drawn with a neutral tile and the status line "Choose what this call records" until an outcome is chosen (open question Q2).
- **Unregistered types** (imports, AI drafts, old data) render as Unsupported step (§5.3) and are errors (P2 rule E14, F-FLOW-029).

### 4.4 Phase ruler (40 px)

`toolbar "Phases"`: **one connected segmented bar**, so it reads as a sequence of phases and never as a second breadcrumb under "Flows / Site-visit qualifier". Anatomy:
- A 28 px bar on `--surface` with a 1 px `--border-strong` outline and `--radius-6`, holding four toggle buttons. Each segment is `[tile 20] Phase <count>` in `label-13`, count `tabular-nums` 600, padding `0 var(--space-10)`.
- Between segments, a 16 px Lucide **`arrow-right`** in `--text-3` sits on a 1 px `--border-strong` rule drawn behind the tiles, the full width of the bar at its vertical centre (the rule is hidden behind each segment's `--surface` fill, so it shows only in the gaps, joining the tiles into one line). Never `chevron-right` (that is the breadcrumb separator), never typed arrows (foundations §2.1).
- After the bar, separated by 8 px: the **Phase columns** toggle, an IconButton `sm` with `columns-3`, `aria-pressed`, tooltip "Phase columns".

| Interaction | Result |
|---|---|
| Click or Enter/Space on a segment | `aria-pressed="true"`; the segment takes the selection treatment (`--accent-soft`, 1 px `--accent-mark`); steps of other phases are **de-emphasised** (§5.4 Dimmed: `--surface-2` fill, their glyph tiles, sockets and connectors at `--opacity-dim`; text keeps full contrast). Tab into the canvas lands on the first step of that phase |
| Click another segment | Emphasis moves to it |
| Click the pressed segment, or Esc in the canvas | Emphasis clears |
| Hover or focus a de-emphasised step | It returns to the default treatment while hovered or focused |
| Phase columns on | A view preference (per user, `vaani:flow:phase-columns`; never written to the flow, never dirties the draft; off by default, so D1 holds). Tidy's layers are drawn as full-height bands behind steps, alternating `--canvas` and `--surface-2`, each with a 24 px counter-scaled header pinned to the top of the viewport: the phases present in that layer, dominant first, with counts ("Logic 2 · Action 1") in `label-12` `--text-2`. Bands follow the layers Tidy last computed; steps moved by hand keep their band by x-position. Nothing moves and no step changes. Hidden in the Block band below 0.35 and whenever the flow has not been tidied since load ("Tidy to see phase columns" in the toggle's tooltip) |

Counts are computed from the graph (frames and notes excluded) and update after every change. **Live note** (right side, `data-13` `--text-2`, ellipsis, link `flex: none`): "● Live v7 answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish. **Compare with live**". Clean draft: "No unpublished changes" (`--text-3`). Never published: "Not live yet. Publishing puts v1 on the numbers and batches you choose." At 1024–1279: "Callers hear v7 until you publish. **Compare**". Hidden below 1024 (the Live chip carries it). The note's content comes from part 2's revision model (P2 §4.3). **Interim I1** (before revisions ship, the only interim; P2 §4.9): "Edits stay on this device until you publish. Callers hear the saved flow." in `--text-2`, never in warning tone, because nothing the author types reaches callers.

---

## 5. Step anatomy, states and level of detail

### 5.1 Anatomy (Full band, mock sections 1 to 3)

```
         badge ┐ (outside the dimmable body)
 ┌────────────────────────────────────[2 errors]─┐
 ● [tile] Logic · Question · Edited          #3   │  phase line: phase-12 text-3 · number meta-12
 │        Ask about a site visit                  │  title: title-14 text, 1 line
 │        {{lead_name}} ji, would you like to…    │  summary: data-13 text-2, 2 lines
 │        [अA] Hinglish · waits 6 s               │  meta: meta-12 text-3, 1 line
 ├────────────────────────────────────────────────┤
 │ Yes    haan, zaroor · हाँ                     ●│  answer row 28: label-13 + examples meta-12
 │ Later  baad mein, next week                   ●│
 │ No reply  after 6 s · asks again once         ○│  fallback row on surface-2
 └────────────────────────────────────────────────┘
 ↑ input port on the title line                   ↑ one socket per row, on the right edge

 Action that can fail (result rows):             Outcome (status line):
 ┌──────────────────────────────────────┐        ┌───────────────────────────────────╮
 ● [tile] Action · CRM lookup       #4  │        ● [flag] Outcome              #5     │
 │        Find the buyer's record       │        │        Visit booked                │
 │        By phone number · Sample CRM  │        │        Lead → Interested           │  meta-12: text-3, word text-2
 │  ──────────────────────────────────  │        ╰───────────────────────────────────╯
 │ ✓ Found                             ●│  result row 28: inset rule, 12 px glyph text-3 + data-13 text-2
 │ ✕ Not found                         ○│  fallback result row on surface-2
 └──────────────────────────────────────┘
```

| Part | Tokens and rules |
|---|---|
| Frame | `--surface-raised`, 1 px `--border-strong`, `--radius-8`, `--e1` (dark: the border carries it). Capsule ends `--radius-full`. **No dashed borders, no coloured borders at rest** (F-FLOW-036) |
| Width | Fixed per phase so Tidy aligns columns: Trigger `--size-node-trigger` 208 · Logic `--size-node-logic` 256 · Action `--size-node-action` 240 · Outcome `--size-node-outcome` 240 (tokens, §20.2 and foundations §18). Height is intrinsic |
| Header | padding `--space-12` top, `--space-16` right (`--space-32` on the Outcome capsule), `--space-10` bottom, `--space-12` left (`--space-16` inside the Trigger capsule); gap tile → text `--space-10` |
| Glyph tile | `--size-glyph-tile` 24, `--radius-6`, glyph `--icon-sm` 14 at 1.5 px |
| Phase line | `phase-12` in `--text-3`: phase · type (omitted when equal to the phase, e.g. "Trigger") · change word ("Edited", "New", "Reached"), ellipsis; the **stable step number** `#12` (D7: assigned at creation, never reused or renumbered) right-aligned, `meta-12` 400, `tabular-nums`, `flex: none`. Call order is never printed on the step |
| Title | `title-14` `--text`, one line with ellipsis; the full title is in the tooltip (after 300 ms) and in the accessible name. `translate="no"` |
| Summary (Logic, Action) | `data-13` `--text-2`, 2-line clamp. `{{variables}}` as `mono-12` chips on `--variable-bg` / `--variable-fg` (surface-3 / ink; never the selection tint, foundations §3.9), radius 4; an unknown variable is a `--danger-soft` / `--danger-text` chip (part 2 rule) |
| Meta line | `meta-12` `--text-3`, one line: Trigger number (PhoneText, masked, tabular figures) or batch name and calling hours "10 am to 7 pm IST"; the language name (LanguageMark `name`) "Hinglish · waits 6 s"; lookup source; WhatsApp template and approval; transfer destination. A missing dependency reads in `--danger-text` ("No template chosen") |
| Answer row (Logic: what the caller says) | `--size-answer-row` 28 (**44**, `--size-hit-touch`, on `pointer: coarse` while editing; padding-right then `--space-24`, §6.1), 1 px `--border` top, padding `0 20px 0 12px`; label `label-13` `--text`; examples `meta-12` `--text-3` directly after the label (left-aligned, gap 8, never right-aligned), ellipsis, each example carries its own `lang` (`hi` for Devanagari, `hi-Latn` for Hinglish) |
| Result row (Action: what the tool did) | `--size-answer-row` 28 (**44** on `pointer: coarse` while editing, as answer rows, §6.1), a **lighter top rule**: 1 px `--border` inset 12 px from both edges (answer rows run theirs edge to edge; no dashes, which mean fallback only), padding `0 20px 0 12px`; a leading 12 px result glyph in `--text-3` (`check` on the success result, `x` on the failure result), gap 6; label `data-13` (400) in `--text-2`; **no examples column**. Compact band: glyph + label; Block band: stubs, as answer rows |
| Fallback row | The step's last row (answer or result), on `--surface-2`, bottom radius 7 (concentric), hollow socket until connected |
| Outcome status line | Plain text, no chip: "Lead" `meta-12` `--text-3` · 12 px `arrow-right` `--text-3` · the status word `meta-12` `--text-2` ("Lead → Interested"). The accessible name reads "Sets lead to Interested" (06 §10.4). Migrated End steps: "Choose what this call records" in `--text-3` |
| Badges | Absolutely positioned on the top edge, `right: --space-12`, `translateY(-50%)`, outside the dimmable body. Tag (data-nav §5.2) with the Validation domain word ("2 errors", "1 warning") or "Not connected"; at most two badges (Now + one issue) |

### 5.2 What each type puts in its body

| Type | Summary | Meta | Rows |
|---|---|---|---|
| Inbound call | – | `+91 80 •••• 2210` · calling hours IST | – |
| Outbound batch | – | batch name · calling hours IST, or "No batch linked yet" | – |
| API or webhook | – | "POST /v1/calls · Sample CRM" | – |
| Question | what the agent asks | language · wait time | answers with examples; No reply |
| Branch | "Decides on {{budget}}" | – | cases ("Under ₹80 L"); Else |
| Verify caller | what is checked ("Date of birth against CRM") | attempts "up to 3 tries" | Verified; Failed; No reply |
| Speak | the line | "1 line · Hinglish" | – |
| Knowledge lookup | – | "price-sheet.pdf + 2 files" | result rows: Found; Not found |
| CRM lookup | – | "By phone number · Sample CRM" | result rows: Found; Not found |
| Book meeting | – | "Calendar, then WhatsApp" or "Calendar not connected" (danger) | result rows: Booked; Not booked |
| Send WhatsApp | – | template name · approval ("pending approval" is a warning) | – |
| Transfer to a person | – | "Rep console · any available rep" or a masked number | result rows: Connected; Didn't connect |
| End with outcome | – | the status line "Lead → Interested" (plain text) | – |

### 5.3 Unsupported step

Replaces React Flow's blank default box (F-FLOW-029). Rectangle 240, outlined tile with `circle-help`, phase line "Unsupported step", title = the stored label, meta `Type "ambulance_call" isn't supported` (`--text-3`, the raw type in quotes), one row with a secondary `sm` Button **Convert to…** (Menu: Speak · Transfer to a person · End with outcome, as P2 §7.15; converting keeps the title, the incoming connection and the first outgoing one, as one undo step). Badge "1 error"; the rule is P2 E14; Publish stays blocked until it is converted or deleted. It takes the **error** border (`--danger-border`), not amber, because the rule is an error and colour must match level (P2 §7.15 mentions amber; reconciled in §21.3).

### 5.4 States (mock section 3)

| State | Treatment | Notes |
|---|---|---|
| Default | as §5.1 | |
| Hover (fine pointer) | border `--control`; free sockets show "+" (§6); header cursor `grab` | no lift, no shadow change |
| Selected | header fill `--accent-soft`; border `--accent-mark` + 1 px inset `--accent-mark` ring; `--e2`; sockets `--accent-mark`; its connectors use `--edge-hover` | selection wins the border over issue borders; the badge stays |
| Keyboard focus | `outline: 2px solid var(--focus); outline-offset: var(--focus-offset-node)` (3 px), drawn at 2 screen px at any zoom (outline width `calc(2px / zoom)`) | focus is never shown as selection (F-A11Y-007) |
| Focused and selected | both | |
| Dragging | the step follows the pointer at `--e2`; alignment guides (§10.4) | the palette ghost uses `--opacity-drag` |
| Errors | border `--danger-border`; badge `danger` "2 errors" (`circle-x`) | blocks Publish |
| Warning | border `--warning-border`; badge `warning` "1 warning" (`triangle-alert`) | Publish asks for a tick |
| Unreachable | Full opacity on everything that holds text: `--surface-2` fill, title in `--text`, phase line and meta in `--text-3` (≥ 4.70:1 on `--surface-2`); only the **glyph tile, sockets and its connectors** take `--opacity-unreachable`; hollow input port; badge `danger` "Not connected" (`unlink`) at full strength | an error the author must fix, so it stays fully readable (WCAG 1.4.3; foundations §1.3 rule 2) |
| Required answer not connected | that row's socket `--warning-soft` fill + 1.5 px `--warning-border`, a 20 px stub, examples replaced by "Not connected" in `--warning-text` | counted in the step's errors; the inspector shows the fix |
| Changed since live | phase-line word "Edited" or "New" | only when the draft differs from Live; removed steps appear only in Compare (part 2) |
| Test run: current | 3 px inset `--accent-mark` bar on the left edge + Tag `info` "Now" (`play`) | |
| Test run: reached | a neutral Tag "Reached" with `check` in the badge slot (Full band; `check` alone in Compact and Block) | P2 §13.2 defines when; cleared when the Test panel closes |
| Dimmed (phase emphasis, Find) | `--surface-2` fill; **graphics only** at `--opacity-dim`: the glyph tile, sockets and connectors. Titles, phase line, rows and badges keep full contrast. `opacity` is never set on an element that contains text (foundations §10) | restored on hover and focus |
| Read-only (Review mode, view-only role, locked canvas) | no "+", no hover border, `cursor: default`; sockets still show connection state | |

**Precedence:** border = selection > errors > warning > default. Badges: Now (left) and one issue badge (errors > Not connected > warning); the tooltip and the Issues tab list everything.

### 5.5 Level of detail and the 12 px floor (mock section 4)

Step text is sized in flow units and would shrink with zoom (today 13 px titles render at 9.3 px, and at 3.8 px at fit, F-FLOW-008). Two rules keep it legible:

1. **Bands decide content** (direction §6.5):

| Band | Zoom | Steps show | Also |
|---|---|---|---|
| Full | ≥ 0.75 | everything in §5.1 | edge labels per §7.3; frame headers and notes in full |
| Compact | 0.5 – < 0.75 | tile, phase word, one-line title, answer labels (no examples) or result glyph + label, sockets; badges as icon + count | line boxes 32 flow px, rows 36 |
| Block | < 0.5 (min 0.25) | silhouette and tile in the box; answer and result rows collapse to socket stubs spread on the right edge; the title moves to the **Block label** below | edge labels hidden; frame titles and badges counter-scaled; notes show their first line |

2. **Every text role is clamped inside the node layer:** `font-size: max(var(--type-x-size), calc(12px / var(--zoom)))` with fixed line boxes sized for the band's lowest zoom (Full: 20 px lines and 28 px rows fit 16 px text at 0.75; Compact: 32 / 36). Boxes therefore never change size while zooming inside a band, so React Flow does not re-measure.

3. **`--zoom` is written once per gesture, not per frame.** During a pan, wheel, pinch or animated zoom the text simply scales with the viewport transform (React Flow's one CSS transform; no style is invalidated). `--zoom` is written on the viewport element on **`onMoveEnd`** and whenever the band changes, **quantised down to 0.05** (0.83 → 0.80, so `12px / 0.80` renders at 12.45 px and never below 12). Keyboard and button zooms write it once, when their transition ends. So the floor holds at rest, and a pinch across 150 steps restyles text at most twice (at the band change and at the end), which is what the §12.7 frame budget needs. The glyph tile and phase word survive the Full and Compact bands, and the tile survives Block, so Logic and Action never collapse into identical boxes.

**Block label (large flows readable at Fit).** Below 0.5 the node box is too small to hold a title (a 240 px step is 84 × 35 screen px at 0.35), so the box keeps its silhouette and a 40 flow px glyph tile, and the title is drawn as a **counter-scaled overlay** (`BlockLabel`): it starts just right of the tile, over the box, and runs **140 screen px**, up to **two lines**, `label-12` 600 `--text` on a `--surface-raised` plate with 1 px `--border` and `--radius-4`, prefixed with the stable number in `meta-12` `--text-3` ("#9 Ask about preferred location"). It extends past the box into the rank gap and beyond wherever the next column is clear at that height; where a step in the next column overlaps its height, it stops 8 px before that column. Tidy gives every layer a column of at least `--size-node-action` + `--layout-rank-gap` (240 + 128 = 368 flow px, 129 screen px at 0.35), so even a stopped label is about 100 px: two lines, about 30 characters, and every visible label shows at least 20 characters or the full title. (A wider gap would not help at Fit: when Fit is width-limited, the on-screen column pitch is the canvas width divided by the number of layers, whatever the gap; and 128 still lets a four-layer flow open in the Full band beside the docked inspector.) Where two labels would still collide (dense layers, hand-placed steps), the one with the lower priority hides (priority: selected > focused > has an issue > Trigger and Outcome > call order) and reappears on hover or focus of its step; the step keeps its tile, so it is never an empty box. Labels are `aria-hidden` (the step's name carries the title).

Band changes are instant (no animation) with 0.03 hysteresis to avoid flicker at the thresholds. Selection, focus outline, badges, sockets and Block labels are drawn at constant screen size at every band.

---

## 6. Sockets and ports

### 6.1 Anatomy (mock section 5)

| Part | Rule |
|---|---|
| Output socket | `--size-socket` 10 px circle centred on the right edge of its row (or on the title line for single-output steps). Connected: fill `--socket` with a 2 px `--surface-raised` ring. Free: `--surface` fill, 1.5 px `--socket-border` (`--control`, ≥ 3:1 on every plane). Selected step: `--accent-mark` |
| Input port | 10 px, centred on the left edge on the title line (42 px from the top in the Full band). Hollow while nothing reaches the step; filled once connected. Arrowheads stop 2 px short of it |
| Hit area | **Fine pointer:** `::after` of `--size-socket-hit` 24 CSS px, counter-scaled so it stays 24 screen px wide at every zoom and clipped to its row so neighbours never overlap; the row is 28 flow px, so the target is 24 × 24 from about 0.86 zoom up. **Coarse pointer (editing at ≥ 1024):** answer and result rows grow to `--size-hit-touch` 44 flow px in the Full and Compact bands (the step grows taller; its width is fixed), and the socket's target is the **row end**: the row's full height by `--size-socket-hit-coarse` 44 wide, centred on the socket (22 px inside the step, 22 outside). Adjacent rows' targets abut and never overlap, and the label keeps clear of the target because row padding-right becomes `--space-24`. At 100 % zoom and above that is 44 × 44 CSS px; zooming out scales it with the canvas (44 wide × 44 × zoom tall, still ≥ 24 down to 0.55). **Equivalent paths (WCAG 2.5.8's equivalent-control exception):** wherever a socket's target is under the size for its pointer (fine below about 0.86 zoom, coarse below 100 %, and every Block-band stub), **Connect to…** in the step's `⋯` menu (44 on touch), the inspector's **Go to [step ▾]** selects (32, 44 on touch) and the Outline do the same job. 06 §15.1 and TS-01 list this exception. Review-mode and view-only canvases keep band heights, because their sockets are not targets. **Layout:** Tidy (§9.4) and placement (§8.1) size each step at its touch height, so a flow tidied with a mouse never overlaps on a tablet |
| "+" quick add | on hover or focus of a **free** socket: a 20 px secondary IconButton-style square, `--radius-4`, 12 px beyond the socket, `plus` 14. Opens Add step (§8.4) anchored to the socket |
| Required, not connected | `--warning-soft` fill, 1.5 px `--warning-border`, 20 px stub in `--warning-border`, row text "Not connected" |

### 6.2 Behaviour

| Input | On a free output socket | On a connected output socket | On an input port |
|---|---|---|---|
| Fine pointer drag | draws a new connection (§7.5) | moves the existing connection to a new target (one undo step) | starts nothing (inputs accept only) |
| Fine pointer click (no drag) | opens **Connect to…** anchored to the socket | selects its connection and opens the edge popover | selects the step |
| Coarse pointer tap (≥ 1024 editing) | opens Connect to… (no drag needed) | opens the edge popover | selects the step |
| Keyboard (focused socket) | `C` Connect to… · `A` Add step after · Enter = Connect to… | Enter selects the connection (popover) · `C` change target · Delete disconnects (Undo toast) | – |

**Connect to…** is P2's **ConnectToPopover** (P2 §16.4; Combobox, core §5.3, `--popover-w-list` 400): title "Connect 'Yes' to…", "New step…" first, then steps grouped by phase with glyph, title and "step 5"; the current target marked "(current)"; loops without an exit hinted "Creates a loop"; "Disconnect" last when a target exists. Triggers and the step itself are not offered. Choosing connects, returns focus to the socket and announces "Connected Yes to Book site visit". This part anchors it to the socket (or the step's first free socket) and keeps it clear of the minimap and inspector.

**Accessible name** (a real `<button>`, one per socket, inside the step's group): "Answer Yes of Ask about a site visit, connected to Book site visit" · "Answer Later, not connected. Press C to connect" · "No reply fallback of Ask about a site visit, required, not connected". Sockets are reached with ↑/↓ inside a step (§11), never as separate Tab stops (F-A11Y-028).
