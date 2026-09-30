
## 14. Flow Designer (When → Check → Do → End)

**Intent.** A call flow should read like a sentence and behave like a professional publishing tool. You draft, check, test and publish, and the live version is never touched by accident.

### 14.1 Lifecycle: draft, test, publish (fixes F-FLOW-001/002/003/005/014)
| Concept | Behaviour |
|---|---|
| **Draft** | Opening a flow **never writes to it** (F-QA-002). The first edit creates a draft from the live version. Every edit autosaves to the draft (debounced 800 ms). The header shows the result truthfully: "Saving…", "Saved to draft 11:42", or "Not saved · kept on this device · Retry". `beforeunload` and a router guard protect any unsaved local changes. |
| **Live version** | A strip under the header always says what callers hear: "Live v7 is answering calls on +91 ••••• 2210 since 12 Sep. Callers keep hearing v7 until you publish this draft." It links to "Compare with live". A flow with no live version reads "Not live yet. Publish to start taking calls". |
| **Publish…** | The only primary button. It opens a dialog with the **readiness path** (below), a "What changed" summary (+2 steps, 1 edited, 0 removed, shown as a diff on the canvas), an optional note, and a [Publish v8] button. Publishing creates an immutable version. The API already stores `version_no` and `parent_flow_id`. |
| **Undo publish** | For 10 minutes a toast offers "v8 is live. Undo". After that, Version history lets you "Restore v7 as draft". |
| **Test call** | Tests **the draft** (see 14.6). It never touches live. |
| **Delete step** | Delete or Backspace removes the step and its edges, and an Undo toast appears (Ctrl Z works too). Deleting a step with more than 3 connections asks for confirmation first (F-FLOW-019). |
| **Undo/Redo** | Covers every canvas mutation (add, connect, move, delete, edit). It is disabled when there is nothing to undo (F-FLOW-005). |
| Removed | The Save button, the "Private" pill (it moves to the ⋯ menu as a visibility setting), and the green glowing ACTIVATE button (F-FLOW-018) |

**Publish readiness path**
- **Blocking checks:**
  - ✓ No blocking issues. Warnings are listed and can be acknowledged.
  - ✓ Calling number assigned (outbound) or number connected (inbound)
- **Advisory checks:**
  - ✓ Test call placed on this draft ("Tested 11:40 · connected 1:52"). This can be skipped, with the reason recorded.
  - ✓ Wallet covers the next day's volume at the current rate
  - ✓ Calling hours set for outbound flows

### 14.2 Layout (desktop ≥1440)

```
┌─ ← │ Site visit booking ▾ │ (Draft · 4 changes) Saved 11:42 │  ↶ ↷ │ ⊞ Tidy up ⋯ │ (⚠ 1 issue) [☏ Test call] [Publish…] ┐
├─ (● Live v7) v7 is answering calls on +91 ••••• 2210 since 12 Sep. Callers keep hearing v7 until you publish.  Compare ┤
├──────────────────┬────────────────────────────────────────────────┬──────────────────────────────┤
│[Add step|Outline]│ [W]When → [C]Check → [D]Do → [E]End   (legend)  │ [C] Check · Ask a question ⋯ ✕│
│[⌕ Find a step… /]│                ┌──────────────────┐            │ Ask: still looking?          │
│ When start call  │                │[W] When·Outbound │            │──────────────────────────────│
│  [W] Outbound    │                │Call the Site list│            │ What the agent asks          │
│  [W] Inbound     │                └────────●─────────┘            │ ┌──────────────────────────┐ │
│ Check listen…    │                         ▼                      │ │Are you still looking for │ │
│  [C] Ask         │                ┌──────────────────┐            │ │a 2 or 3 BHK near {{city}}│ │
│  [C] Branch    + │                │[D] Do·Say        │            │ └──────────────────────────┘ │
│  [C] Verify      │                │Greet & introduce │            │ Type {{ to add lead details. │
│ Do act…          │                └────────●─────────┘            │ Answers to listen for        │
│  [D] Say         │                         ▼                      │ (Yes)  › [Book a site visit▾]│
│  [D] Knowledge   │              ╔══════════════════╗ ← selected    │ (No)   › [Send the brochure▾]│
│  [D] WhatsApp    │              ║[C] Check·Ask     ║   2 px Peacock│ (No reply·6 s)›[Call back… ▾]│
│  [D] Book        │              ║Ask: still looking?║             │ [+ Add an answer]            │
│  [D] Transfer    │              ║ (Yes) (No) (No reply)║           │ › Advanced: retries, timeout │
│ End finish…      │              ╚══●════●══════●═══╝             │                              │
│  [E] End call    │          ┌──────┘    ▼       └──────┐          │                              │
│                  │   ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │                              │
│                  │   │[D] Book visit│ │[D] WhatsApp ⚠1│ │[E] Call │ │                              │
│                  │   └──────●───────┘ └──────●───────┘ │back 2d  │ │                              │
│                  │          ▼                ▼         └─────────┘ │                              │
│                  │   ┌──────────────┐ ┌──────────────┐             │                              │
│                  │   │[E]✓ Visit    │ │[E] Not       │             │                              │
│                  │   │   booked     │ │ interested   │             │                              │
│                  │   └──────────────┘ └──────────────┘             │                              │
│                  │ [− 86% + │ ⤢]                        [▦ Map]    │ ✓ Saved to draft 11:42 Preview│
└──────────────────┴────────────────────────────────────────────────┴──────────────────────────────┘
```

At 1440 px the app sidebar collapses to a 56 px rail inside the designer. The canvas gets 55–60% of the viewport, up from 36–52% (F-FLOW-022). There is one header row of 56 px plus the 37 px live strip, down from a 180 px two-row header.

### 14.3 Canvas and node anatomy
- **Canvas.**
  - `canvas` background with a 20 px dot grid at 13% ink (9% in dark).
  - Snap to 8 px. Top-down layout.
  - **Tidy up** runs ELK layered auto-layout in about 250 ms.
  - New steps are inserted **after the selected step, auto-connected, with collisions avoided**. They are never stacked on top of existing steps (F-FLOW-009, F-FLOW-021).
- **Node.**

| Property | Spec |
|---|---|
| Width | 224–264 px fixed (240 default), sized by the stage |
| Surface | `surface`, 1 px `border-2`, 12 px radius, `e1` |
| Header | 24 px stage tile, the stage word in the stage colour ("Check"), and the type in `text-3` ("· Ask a question") |
| Title | 14/600 |
| Body | 13/19 `text-2`, clamped to 2 lines. Variables show as chips. |
| Footer (branching steps) | Named output chips ("Yes", "No", "No reply", "Found / Not found", "Verified / Failed"), with an 11 px port under each and a **24 px hit area** |

  Input ports appear only on hover, focus or while connecting. The arrowheads on edges show direction (F-FLOW-020, F-A11Y-001).
- **Node states.**

| State | Treatment |
|---|---|
| Hover | `border-strong` |
| Selected | 2 px Peacock outline (offset 3) + `e2`. Its outgoing edges and ports turn Peacock. |
| Keyboard focus | The same outline as selected, plus a "Focused" hint in the status bar. Focus is never invisible (F-A11Y-007). |
| Warning | Amber border + a "⚠ n" badge in the header. The body line states the problem. |
| Error (blocking) | Danger border + a badge. Publish stays blocked with the reason. |
| Unreachable | 55% opacity + "Not connected to the start" |
| Running (test call) | Peacock left stripe + a "Now" chip. Edges already traversed turn Peacock (14.6). |

- **Edges.** A 1.5 px `border-strong` stroke (3:1 against the canvas) with a small arrowhead, routed as smooth steps. They turn Peacock on hover or selection. Dashed edges mean exactly one thing, "fallback / no reply", and the legend says so. There are no marching ants and no always-animated edges (F-FLOW-011).
- **End nodes** name an **outcome**: goal reached, follow up, closed or failed. They are colour-coded by that outcome, and the outcome flows into Call history, Leads status and Analytics. This closes the "no outcome taxonomy" gap in the canvas.
- **Trigger nodes** state where calls come from and when: "Calls the Site visits list · 9:00 to 21:00 IST · up to 2 tries". That removes the ambiguity between inbound and outbound.
- **Minimap** is off by default and toggled with "Map". It uses neutral node rectangles with a Peacock viewport frame and is hidden below 1280 px (F-FLOW-023). Zoom shows as a % and has Fit.

### 14.4 Palette, inspector and validation
- **Palette** (256 px): a segmented control [Add step | Outline], search (`/`, synonym-aware), and four stage groups, each item with a full name and a one-line description. There is no truncation, no "START HERE" duplicate group and no fake "+10" button (F-FLOW-035). Click or Enter adds after the selected step. Dragging also works. A step has **one name** in the palette, node, inspector and toasts (F-FLOW-027).
- **Inspector** (328–360 px, right side):
  - It shows only the fields the step needs, with plain labels, helper text and a variable picker triggered by `{{` that warns on unknown variables (F-FLOW-028).
  - The **"Answers to listen for" / "Paths" list wires steps with a "Go to" select**, which is the keyboard and screen-reader alternative to dragging (A8).
  - Advanced fields are folded.
  - Integration dependencies are stated inline, for example "Needs Google Calendar · Connect…" (F-FLOW-030).
  - Read-only IDs and positions move into ⋯ › Details (F-FLOW-033).
  - Invalid values are rejected with a reason and never autosaved (F-FLOW-015).
- **Validation** is continuous (debounced 500 ms) and checks semantics as well as wiring: missing template, unreachable step, a branch without "no reply", an unknown variable, or a transfer number that isn't E.164.
  - The header button shows "⚠ n issues", which opens a list. Clicking an issue selects and centres its node.
  - Node badges match the list.
  - When clean, the header shows "No issues · checked 11:42" in `text-3`.
  - Results are recomputed when you switch flows (F-FLOW-010).

### 14.5 Creating a flow (fixes F-FLOW-013, F-FLOW-031)
"New call flow" opens a sheet:
1. **Name** (required, with a duplicate-name warning; F-VIS-037).
2. **Start from:** a gallery of 6 templates, each drawn as a mini When → Check → Do → End strip. The templates are Lead qualification, Site visit booking, EMI reminder, COD confirmation, Appointment booking and Support FAQ. Or start from Blank, or **Describe it**.
3. **Describe it** is the AI draft. It uses a multi-line prompt with examples in English and Hindi. The result shows as a preview on a new draft canvas, with added steps outlined. The user picks [Use this draft] or [Try again]. It never replaces an open flow.

Every template passes validation out of the box.

### 14.6 Test mode (fixes F-FLOW-016)
**Test call** opens a 280 px dock at the bottom with two options:
- [Call my phone], using the verified profile number
- [Talk in browser]

While the test runs:
- The dock shows the status line, timer, transcript and captured variables.
- On the canvas, the current node gets the "Now" chip and traversed edges turn Peacock.
- When the test ends, the dock shows the outcome and "Tested 11:40". That result feeds the Publish readiness check.

The test always runs against the draft, and the dock says "Testing draft (not live)".

### 14.7 Keyboard and screen readers (fixes F-A11Y-001, F-A11Y-028, F-FLOW-006, F-FLOW-024)
| Key | Action |
|---|---|
| Tab / Shift+Tab | Enter or leave the canvas. Focus lands on the trigger. Tab order follows the flow order, not creation order. |
| ↓ / ↑ | Next / previous step along the default path |
| ← / → | Move between sibling branches |
| Enter | Open the inspector with focus on its first field. Esc returns to the node. |
| A | "Add step after…" (palette search, focused) |
| L | "Connect to…" (a list of steps to link from the focused output) |
| Delete | Remove the step, with an Undo toast |
| Ctrl/⌘ Z, Ctrl/⌘ Shift Z, Ctrl/⌘ D | Undo, redo, duplicate |
| ? | Shortcut sheet: a proper dialog that fits the viewport and shows keys for the user's platform |

- The **Outline** view is a full, editable alternative: a tree of steps with the stage, title and paths. It supports reordering and reconnecting through menus.
- Nodes expose names such as "Step 3 of 8, Check, Ask a question: still looking? 3 answers, selected".
- Canvas changes are announced through the existing polite live region.
- The selection is deep-linked with `?step=<id>&v=draft`.

### 14.8 Breakpoints
| Range | Behaviour |
|---|---|
| ≥1440 | Palette + canvas + inspector, with the app sidebar as a 56 px rail |
| 1024–1439 | Palette becomes a 48 px strip with an "Add step" popover. The inspector is an overlay sheet (360 px) that opens on select. The toolbar keeps every action; lower-priority ones fold into ⋯ and never clip Publish (F-RWD-003). |
| 768–1023 | Read-only canvas (pan and zoom work by touch) plus the Outline. Wording edits happen in the inspector sheet. Test call works. A note reads: "Structural editing needs a screen 1024 px or wider." |
| <768 | Outline view only, as shown in the specimen. Review, fix wording, check issues, Test call and Publish (the readiness path still runs) |

---

