
---

## 16. The Outline, and keyboard and screen-reader operability

### 16.1 Purpose and placement

The Outline is a **complete, non-spatial editor** of the flow at ≥ 1024: everything the canvas can do except drawing positions (L12). It is the accessible alternative to the canvas (F-A11Y-001, F-A11Y-028, digest A8) and a desktop side panel for large flows. Below 1024 the same `FlowOutline` renders with `readOnly`: the left column of tablet Review mode and the phone page. There the navigation keys, type-ahead, `Enter` (opens the read-only step sheet) and issue badges work; `F2`, `A`, `C`, `Delete`, `Alt+↑/↓` and the editing items of the row menu are not rendered (`05-responsive` §10.6 is the capability matrix).

| Width | Where | Editing |
|---|---|---|
| ≥1024 | Left panel, `--size-left-panel` 280 (part 1 §3.1), toggled with **Outline** in the tool rail, the Problems bar or `O`; shares the slot with Add step, Variables and Version history; opens docked for flows over 20 steps at ≥ 1280 (part 1 §9.2) | Full (§16.3) |
| 768–1023 | Left column of Review mode, `--size-left-panel-tablet` 320, always shown, tabs Outline · Problems (§21) | `readOnly` |
| <768 | The main view of `/flows/<id>` | `readOnly` |

### 16.2 Structure: nested by branch

```
┌ Outline ───────────────────── [Filter steps…] ┐
│ ◖ Inbound call · +91 80 •••• 2210             │
│ □ Greeting                                    │
│ ◇ Ask about a site visit               ⚠ 1   │
│   ▾ Yes                                        │
│     □ Book site visit                          │
│       ▾ Booked                                 │
│         ◗ Visit booked · Lead → Interested     │
│       ▾ Not booked                             │
│         ↪ Go to #9 Polite close                │
│   ▾ Later                                      │
│     □ Schedule callback                        │
│     ◗ Callback set · Lead → Callback due       │
│   ▾ No                                         │
│     □ Polite close                             │
│     ◗ Not interested                           │
│   ▾ No reply ┄                                 │
│     ⚠ Not connected · Connect…                 │
│ ◖ Outbound batch                               │
│   ↪ Go to #2 Greeting                          │
│ Not connected to a trigger (1)                 │
│ □ Send brochure                        ⊗ 2    │
│ [+ Add step]                                   │
└───────────────────────────────────────────────┘
```

- **Order** is call order: depth-first from the first Trigger, answers in their listed order. The same order drives canvas arrow navigation and the "step 3 of 14 in call order" part of each accessible name. Steps show their **stable** numbers (`#9`, part 1 D7: assigned at creation, never reused, unchanged by edits, Tidy, reordering or publishing), so the numbers in the Outline are not consecutive and that is expected.
- **Linear chains stay flat:** a step with one output is followed by its next step at the same level; nesting happens only under answers, cases and Found/Not found, so "If Yes → Book site visit → Visit booked" reads as one indented run (D §1.3 graft).
- **Merges and loops never repeat:** a step reached by more than one path is written in full once (its first occurrence) and elsewhere as a reference row "↪ Go to #9 Polite close" that selects it.
- **Unreachable steps** are grouped at the end under "Not connected to a trigger (n)".
- **Rows** (`OutlineRow`, part 1 §20.1): step rows show the 24 px glyph tile, label (`data-13`/500, `translate="no"`), `#n`, the phase line on hover and focus ("Logic · Question"), an issue badge (icon + count), a reached mark after tests, and for Outcomes the plain status line "Lead → Interested" (the same sentence as the canvas, not a tag). Answer rows show the answer label (`label-13`), its examples in `meta-12` `text-3`, and either the child steps or "⚠ Not connected · Connect…". The fallback answer carries a small dashed rule glyph, echoing its canvas edge.
- **Filter** (SearchInput `sm`, synonyms as the palette): matches labels, prompts and variables; non-matching rows collapse into "3 hidden" lines, keeping context.

### 16.3 Editing from the Outline

| Key (focus on a row) | Does |
|---|---|
| `↑` / `↓` | Previous / next visible row |
| `→` / `←` | Expand, or move to the first child / collapse, or move to the parent |
| `Home` / `End`, type-ahead | First / last row; jump by label |
| `Enter` | Open the step in the inspector (focus on Label); on a reference row, go to the step |
| `F2` | Rename the step inline (Enter saves, Esc cancels) |
| `A` | Add a step after this step, or at this answer: the palette opens as a popover; the new step is inserted, connected and focused |
| `C` | On an answer row or a single-output step: **Connect to…** (§16.4) |
| `Delete` | Delete the step (Undo toast, §14.1); on an answer row, remove its connection |
| `Alt+↑` / `Alt+↓` | Move a step within a linear chain (swaps it with its neighbour and rewires the chain; one undo step). Disabled on Logic steps and at chain ends, with the reason in the row menu |
| `Shift+F10` or the context key | Row menu: Open · Add step after… · Connect to… · Duplicate · Move up · Move down · Delete step |

Every edit announces its result politely: "Added Speak after Greeting, step 3", "Connected Yes to Book site visit", "Yes now goes to Book site visit instead of Polite close", "Deleted Polite close. Press Control Z to undo."

**ARIA.** `role="tree"` labelled "Flow outline, Site-visit qualifier"; rows are `treeitem`s with `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded`; `aria-selected` mirrors the canvas selection. A step row's name is the step's full label from §16.5 ("#3 Ask about a site visit, Logic, Question, 1 warning"). Answer rows: "Answer Yes, goes to Book site visit" or "Answer No reply, not connected".

### 16.4 Connect to…

A Combobox popover (C §5.3) opened by `C` on a focused step or socket (canvas), answer row (Outline or inspector), or the step's `⋯`. Title "Connect 'Yes' to…". Options: "New step…" first, then steps grouped by phase with glyph, label and "step 5"; the current target is marked "(current)"; steps that would create a loop without an exit are listed with the hint "Creates a loop". Choosing connects (replacing any current target), closes, returns focus to the origin and announces the result. "Disconnect" is the last option when a target exists. Search matches label, step number ("5") and synonyms.

### 16.5 The canvas keyboard contract (with part 1)

**The key map is `06-accessibility` §9.6**, the only canvas key map; this section and part 1 §11 reference it and restate no keys. What this part owns in it:
- **`C` Connect to…** (§16.4) and **`A` add after** (part 1 §8.4) from a step, a socket, an Outline row or an inspector answer; **Delete** with Undo (§14.1); **Enter / F2** open the inspector with focus in Label, **Esc** returns to the step (§7.1).
- **Issues:** Alt+. / Alt+, walk the issues (§12.4). Alt+Arrow always means move (part 1 §10.4, the Outline §16.3, the answer and case lists §7.7, §9).
- **Names:** the step name, the socket names and the one instruction string are defined in 06 §9.6; step names begin with the stable number and title and then give the call-order position ("#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: …"). Connections are named from labels, never ids: "Ask about a site visit, answer Yes, to Book site visit" (F-FLOW-011).
- **Structure:** steps are `role="group"` with `aria-roledescription="step"` inside the canvas `<section>` (no `role="application"`, 06 §6.1); the minimap is `aria-hidden="true"` (it duplicates the Outline); sockets are focusable only within a focused step, 24 px hit area, 44 on coarse pointers (D §6.5).
- **Single-key shortcuts** are registered in 06 §8.2 and obey the switch; each command also has a visible button (P5).

---|---|
| `Tab` | Enter the canvas at the first Trigger; the canvas is one tab stop with a roving tabindex (F-A11Y-028) |
| `→` / `←` | Follow the first output / go back along the incoming connection |
| `↑` / `↓` | Siblings in the same rank, or answer rows (sockets) of a Logic step |
| `Enter` / `F2` | Open the inspector, focus Label; `Esc` returns to the step |
| `C` · `A` · `Delete` | Connect to… · Add step after · Delete with Undo |
| `⌘/Ctrl+D` · `⌘/Ctrl+F` · `⌘/Ctrl+Z` / `⇧⌘Z` | Duplicate · Find · Undo / Redo |
| `O` · `V` · `T` · `?` | Outline · Variables · Test panel · Shortcuts sheet (a Dialog `lg`, focus moved in, grouped Edit · Select · Navigate · View · Test, platform-correct modifiers; F-FLOW-024, F-A11Y-027) |
| `F6` | Cycle header → canvas → inspector → Problems bar |

- **Step names:** "#3, Logic, Question: Ask about a site visit. Answers: Yes goes to Book site visit; Later goes to Schedule callback; No goes to Polite close; No reply is not connected. 1 warning." Steps are `role="group"` with `aria-roledescription="step"`; instructions ("Enter to edit, C to connect, A to add a step after") in one shared `aria-describedby` node.
- **Connections:** named from labels, never ids: "Ask about a site visit, answer Yes, to Book site visit" (F-FLOW-011).
- **Minimap** `aria-hidden="true"` (it duplicates the Outline). Sockets are focusable only within a focused step (arrow keys), 24 px hit area, 44 on coarse pointers (D §6.5).
- **Single-key shortcuts** (`A`, `C`, `O`, `V`, `T`, `?`) are ignored while typing and can be turned off in the account menu; each command also has a visible button (P5).

---

## 17. State matrix

| Surface | State | Treatment and copy |
|---|---|---|
| Designer | Loading | Canvas skeleton (O §13.2): header with the flow name if known, chips hidden, four static silhouettes; editing and autosave off until hydrated (F-FLOW-037) |
| Designer | First use (blank flow) | Part 1 §13.2, the one design: a Trigger (per the workspace rule of §15.3) **connected** to an End with outcome (neutral tile, "Choose what this call records"), a "+" on the connection and the empty-state card "What happens when the call connects?" with Add Speak · Add Question · All steps. Issues chip **"No issues"** (or the warning "Choose what this call records" if the Q2 rule for an unset outcome ships; never an error before the author has done anything) |
| Designer | Partial | An integration status can't load: its row reads "Couldn't check Google Calendar · Retry"; rules that depend on it are marked "not checked" in the Problems list; Publish's check row is `unknown` (blocking with Retry) |
| Designer | Save failed · offline · conflict | §4.3 chip states, §4.6, §4.7 |
| Designer | Not found | NotFound in the shell: "This flow was deleted, or the link is wrong." · Go to Flows |
| Designer | Private flow (not yours) | Forbidden: "This flow is private to Rohit S." · Go to Flows |
| Designer | View only (FD12) | `View only` tag; inspector fields read-only; Publish hidden; "Duplicate to edit"; Test works (text and browser voice) |
| Designer | Viewing a version | §6.2 |
| Designer | Success | "Saved 11:24 am"; after publish, `Live v8` and the toast (§5.7) |
| Inspector | Nothing selected | Closed |
| Inspector | Field invalid | Field error; step marked; value not committed (§7.1) |
| Flows list | Loading | Table skeleton with real headers; pager "Loading…" (O §13.2) |
| Flows list | First use | "Start from a template or describe the call you want." · New flow |
| Flows list | No results / filtered | "No flows match 'kisan'. Search covers names, ids and numbers." · Clear search / "No flows match Live in Tamil." · Clear filters |
| Flows list | Error | PageError: "Flows couldn't load. Your flows are safe." · Retry |
| Flows list | Archived view empty | "Archived flows appear here. Archive a flow from its ⋯ menu." |

---

## 18. Interactions and shortcuts (this part's surfaces)

| Key or gesture | Where | Does |
|---|---|---|
| `⌘/Ctrl+Enter` | Publish gate, Call gate | Confirm when enabled |
| `]` / `[` · `Esc` | Compare mode | Next / previous change · exit (the shell's `[` is suppressed in the designer) |
| Canvas keys, issues (Alt+. / Alt+,), `T` | Designer | **06 §9.6**; not restated here |
| `Enter` | Test composer | Send as the caller; `Shift+Enter` new line |
| `Alt+↑/↓` | Answer editor, case list, Outline | Move the item (Alt+Arrow means move everywhere) |
| Drag handle | Answer editor, case list | Reorder by pointer (keyboard equivalent above) |
| `/` | Flows list | Focus search |
| `Enter` | Flows list row | Open the flow |
| Palette (`⌘K`) actions | Anywhere | "Publish v8…", "Test this flow", "Compare with live", "Version history", "New flow", "Go to flow: …" |

No single key publishes, rolls back, discards or dials; each opens its gate or dialog. The `?` sheet lists these under "Publish and test".
