
---

## 19. Microcopy: before and after

| Where | Before (today) | After |
|---|---|---|
| Save chip | "Up to date" (always) | "Saved 11:24 am" · "Unsaved changes" · "Saving…" · "Couldn't save · Retry" · "Not saved yet" |
| Validation badge | "● FLOW VALIDATED" | "No issues" · "1 warning" · "2 errors · 1 warning" |
| Validate panel title | "2 FLOW VALIDATION ERRORS" | "Problems · 2 errors · 1 warning" |
| Error message | `Node "node_1790420966396" is not connected to any previous step.` | "#7 Speak can't be reached from any trigger." |
| Error message | `Question "Confirm Location" must have both YES and NO connections.` | "#6 Confirm location: answer 'No' isn't connected." |
| Primary action | "ACTIVATE" (green, glow) · "Save" | "Publish v8…" (one Neel button); no Save |
| ACTIVATE tooltip | "Activate this flow for all your calls" | Publish gate "Where it goes live" lists the actual numbers, batches and defaults |
| Disabled reason | "Save the flow first to activate it" (native tooltip) | "Fix 2 errors to publish." · "Nothing to publish. Your draft matches Live v7." (visible, `aria-describedby`) |
| Private | "Private" (static-looking pill) | Visibility: "Workspace" · "Only me" |
| More menu | "Export JSON · Import JSON · New flow · Reset to default" | ⋯ (part 1 §3.3 plus this part's items): Preview agent script · Describe a change… · Replace draft with a template… · Duplicate flow… · Export JSON · Import JSON… (always as a new flow) · Keyboard shortcuts · Flow settings · separator · Delete flow… (New flow lives on `/flows`) |
| Page title | "Flow Builder / VOICE JOURNEY WORKSPACE" | Breadcrumb "Flows / Site-visit qualifier" |
| Palette header | "Add steps / PICK A TOOL, THEN CONNECT IT" · "+ 10" | "Add step" (part 1) |
| Panel title | "SPEAK NODE" · "SCHEDULE NODE" · "LIVE LOOKUP" | Phase line "Action · Speak" + the step's label (registry names, §7.2) |
| Panel fields | "ID: node_1790…" · "Position: x=332, y=330" | Advanced › Step id (copyable); position removed |
| Panel delete | "Delete Node" (full-width red) | ⋯ › Delete step (Undo toast) · footer "Done" |
| Question outputs | "YES ↓" / "NO →" · "YES — connects from bottom handle" | Answer rows "Yes · haan, zaroor · हाँ" with "Go to [step ▾]"; "No reply · after 6 s" |
| Branch | "Condition Check" · "TRUE ↓ / FALSE →" | "Branch" with named cases and "Else" |
| Transfer helper | "E.164 format. Leave blank to use context." · "Must start with country code (e.g. +91)" | "Include the country code, like +91 98765 43210." |
| CRM lookup note | "Calls the operator's live API for ONE record (no embeddings). On no_match…" | "If no record matches, the agent says so and never guesses." |
| FAQ note | "Answers are served only through search_knowledge_base…" · "materialized" | Knowledge lookup › "This step's Q&A": "The agent answers from these when a caller asks." |
| Verify helper | "Green handle = VERIFIED, red handle = FAILED — wire FAILED to an End Call or Handoff node." | Outputs "Verified · Not verified · No reply", each with Go to |
| Schedule | "AVAILABLE TIME SLOTS (OPTIONAL) Mon-Fri 9am-5pm…" | "Offer times from: Google Calendar free time · Set hours" |
| Flow settings | "Soul.md · PER-FLOW" · "SPEECH WINDOW 8 · MEDIUM SCORE 0.7 · HIGH SCORE 0.86" · "lookup_record, send_email, send_whatsapp" | "Agent instructions" · "Listen for 8 s of speech" · bands "Verified 0.86 and above · Confirm 0.70 to 0.86" · "Look up a customer record · Send email · Send WhatsApp" |
| AI draft | "Generate a flow with AI" · "Generated nodes replace the canvas as a private draft" | "Describe a change…" · "Proposed: 6 added · 2 changed · Apply to draft · Discard" |
| Preview | "AI SCRIPT PREVIEW / --- SYSTEM INSTRUCTION PREVIEW ---" · "Close Preview" | Flow settings › Advanced › "What the agent is told" · Copy |
| Delete feedback | (nothing) | "Deleted 'Polite close' and 2 connections · Undo" |
| Undo announcement | "Undone." | "Undid delete 'Polite close'" |
| Switcher modal | "ALL FLOWS" · NAME / CATEGORY / LAST EDITED / OPEN | `/flows`: Name · Status · Used by · Languages · Issues · Last edited |
| Version naming | "Sample Realty (v2) · 9115a2" | "Sample Realty follow-up · Live v3" (+ `flow_7c21` only for legacy duplicates) |
| Meeting Agent option | "Active flow (from profile)" | "Workspace default · Site-visit qualifier v7" |
| Leaving with a failed save | (nothing; edit lost) | "Leave with 2 unsaved edits? They stay on this device and come back when you reopen this flow." |

---

## 20. Accessibility

- **Keyboard (2.1.1 A):** every authoring action works without a pointer: open (Enter), connect (`C`, Go to selects), add (`A`, Go to "New step…"), reorder (`Alt+↑/↓`), delete (Undo), publish, roll back, test. A Playwright keyboard-only test builds a 3-step connected flow, publishes it and rolls it back (F-A11Y-001).
- **Focus (2.4.3, 2.4.7, 2.4.11):** graph tab order; the inspector, gate, sheets and Shortcuts dialog receive focus and return it to their trigger (O §1.3; F-A11Y-027); focused steps use `--focus-offset-node`; nothing sticky covers a focused field (`scroll-padding` on the inspector body for its 56 px header and 48 px footer).
- **Names (4.1.2, 2.4.6, 1.1.1):** steps and connections are named from labels (§16.5); icon buttons have names and tooltips ("Insert variable", "Previous issue"); tokens in PromptField are read as text ("lead name variable") through a visually hidden description; no raw ids in any accessible name (F-A11Y-028).
- **Labels (1.3.1, 3.3.2):** every inspector field uses Field (C §3.1); the answer editor's inline inputs are labelled "Answer 2 label" / "Answer 2 examples"; condition rows "Case 1 variable / operator / value".
- **Errors (3.3.1, 3.3.3):** field errors say how to fix; the ProblemsPanel and gate link to the field; server errors map to the same messages.
- **Status messages (4.1.3):** save failures are assertive once; counts, publishes, deletes, test steps are polite and throttled; nothing is announced per keystroke or per timer tick (O §1.8).
- **Contrast (1.4.3, 1.4.11):** all text pairs from tokens pass in both themes (F §3.8); step borders, sockets, token borders and the dashed fallback edge are ≥ 3:1 on `--canvas`; badges pair icon and number with the step's accessible text (F-FLOW-007, F-A11Y-019).
- **Colour is never alone (1.4.1):** Added / Changed / Removed carry Tags; diff text uses strike-through and underline; errors and warnings use distinct icons; Live has a word.
- **Targets (2.5.8):** sockets 24 px hit area (44 on coarse pointers), drag handles 24, IconButtons ≥ 24 (44 on touch) (F-FLOW-020).
- **Dragging alternatives (2.5.7):** every drag (reorder, connect) has a keyboard and single-pointer alternative (menus, Go to selects).
- **Motion (2.3.3):** the test trace is the only movement and is skipped under reduced motion; no edge animates at rest (F-FLOW-011).
- **Language (3.1.2):** answer examples, prompts and turns carry `lang`; flow names and variables `translate="no"` (digest A9).
- **Forced colours:** step error and warning borders, sockets, answer rows, diff tags and the Draft chip remain visible (`data-mark`, `ButtonBorder`, `Highlight` for selection; base.css).
- **Zoom and reflow (1.4.10):** the layout reads the CSS width, so zoom picks the mode (`05-responsive` §2.4, §8.3): 200% on a 1920 × 1080 screen (960 CSS px) is Review mode; 200% on 1440 or 1280 screens (720 or 640 CSS px) and 400% anywhere is the phone Outline. Nothing is clipped in any of them; `/flows` reflows to list items.

---

## 21. Responsive behaviour

### 21.1 Desktop ≥1440 (the reference)

Rail · Outline or Variables (optional, 280) · canvas · inspector (320 to 480) docked; Test panel docked bottom (280); Problems bar 32. Publish gate modal from the right (640). History opens in the left panel (§6.1). At 1440×900 with the inspector open and the Test panel closed, the canvas keeps at least 60% of the viewport width (part 1 budget).

### 21.2 Laptop 1024–1439

```
1280 × 800, inspector open (overlay at 1024–1279; docked at 1280–1439)
┌ Flows / Site-visit qualifier  Draft·3 ▾  ✓ Saved  ● Live v7 ── ⚠1 [Test] [Publish v8…] ⋯ ┐ 48
├ Trigger 2 → Logic 1 → Action 3 → Outcome 4        Live v7 answers +91 80 •••• 2210 …      ┤ 40
├──┬────────────────────────────────────────────────────┬───────────────────────────┤
│+ │  canvas (the selected step is panned into the part  │ Inspector 320 (overlay at │
│☰ │  not covered by the inspector)                      │ 1024–1279: e3, no scrim,  │
│{}│                                                     │ canvas still interactive) │
├──┴────────────────────────────────────────────────────┴───────────────────────────┤
│ ⚠ 1 warning  Book site visit: template pending approval  Go to step   Outline  Test │ 32
└──────────────────────────────────────────────────────────────────────────────────────┘
```

- The Outline and the inspector never both dock below 1280: opening one overlays the other's side.
- The Test panel opens at 240 px; with the inspector open it overlays the canvas bottom only.
- Header: below 1280, "Tidy" and the issue sentence collapse into icons with names; `Publish v8…` and `Test` never collapse (F-RWD-003).

### 21.3 Tablet 768–1023: Review mode

```
768 × 1024   (part 1 §3.2 is the design; capabilities: 05-responsive §10.6)
┌ ☰  Site-visit qualifier                             [₹2,340]   ⌕ ┐ 52 TopBar (shell)
├ [Draft · 3 changes ▾] [● Live v7]  [⚠ 1 warning] [Test] [Publish v8…] ⋯ ┤ 48 flow header
├ ⓘ Editing steps needs a screen at least 1024 px wide. You can review,  ┤
│   test and publish here.                                                 │ Notice
├ Outline · Problems 1 ────────┬──────────────────────────────────────────┤
│ Outline (320)                │ read-only canvas (pan, pinch, select)    │
│ ◖ Inbound call               │                                          │
│ □ Greeting                   │                                          │
│ ◇ Ask about a site visit ⚠1  │                                          │
│   ▾ Yes → □ Book site visit  │                                          │
│ …                            │ [− 60% +] [Fit]                          │
└──────────────────────────────┴──────────────────────────────────────────┘
```

- Selecting a step opens a read-only full-height sheet (non-modal) with its fields, answers and their Go to targets, issues, and the footer "Edit this step on a screen at least 1024 px wide. Your draft is safe." + Copy link.
- Test, Compare with live, Version history (sheet), Restore as draft, Roll back and Publish all work; the header's Test and Publish are pinned right and never clip (F-RWD-003).
- Problems appear as a tab in the Outline column ("Outline · Problems 1").

### 21.4 Phone 320–767

```
390 × 844, /flows/<id>   (part 1 §3.2 is the design; one phone layout everywhere)
┌ ‹ Flows  Site-visit qualifier [₹2,340] ⌕ ┐ 52 TopBar (shell)
│ [Draft · 3 changes ▾] [● Live v7]     │
│ [⚠ 1 warning] (opens Problems)      ⋯ │ chip row; ⋯ = flow actions
│ [   Outline    |    Canvas     ]      │ 44
├───────────────────────────────────────┤
│ ◖ Inbound call · +91 80 •••• 2210  #1 │ 48 rows
│ □ Greeting                         #2 │
│ ◇ Ask about a site visit      ⚠ 1  #3 │
│   ↳ If Yes → Book site visit →        │
│     Visit booked · Lead → Interested  │
│   ↳ If Later → Schedule callback →    │
│     Callback set                      │
│   ↳ If No reply ┄ Not connected       │
├───────────────────────────────────────┤
│ [▷ Test]              [Publish v8…]   │ 56 sticky, above the BottomBar
├───────────────────────────────────────┤
│ Cockpit  Leads  Reports  Flows  More  │ 56 BottomBar
└───────────────────────────────────────┘
```

- The Outline (nested by branch, 48 px rows, chains wrapped as sentences) is the page. A step opens a full-screen read-only sheet (Back returns to the row).
- Test is the full-screen test (text and browser voice; "Call my phone…" stays in the Cockpit on phones, §13.6); Publish is the full-screen gate; the `⋯` at the end of the chip row holds Version history, Compare with live, Roll back to v7…, Discard draft changes…, Flow settings (read-only). The TopBar is the shell's phone TopBar (Back, title, wallet chip, Search), unchanged.
- With a clean draft the sticky bar keeps Test and Publish; Publish is `aria-disabled` with "Nothing to publish. Your draft matches Live v7." (§4.3), so focus can return to it after a publish.
- `/flows` is a list of two-line items; New flow opens `/flows/new` as a single column.
- Nothing edits steps below 1024 in v1 (D §6.5 responsive table); the Canvas view is the read-only canvas at Fit, never a squeezed editor.
