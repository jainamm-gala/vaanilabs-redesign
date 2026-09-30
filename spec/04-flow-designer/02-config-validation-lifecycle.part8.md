
### 13.2 Three ways to test

| Mode | Uses | Call kind (Cockpit §1.1) | Billing copy (the real rule only, P1) | Needs |
|---|---|---|---|---|
| **Text** (default) | The flow runtime turn by turn on the chosen revision, with typed caller replies (FD7) | none (no audio) | Stated by the server ("Text tests aren't billed" or the rate); hidden until known | Online |
| **Browser voice** | Talk in browser: your microphone and speakers | Browser test | As Cockpit §1.1 ("Not billed" or "Billed at ₹0.02/s") | Microphone permission (Cockpit readiness row) |
| **Call my phone…** | Your verified number rings | Test call | "Billed at ₹0.04/s · not counted in reports" | Opens the CallGate (`mode="single"`, kind test, the Draft allowed because the target is your own number); wallet and caller ID checks apply |

A Draft never calls anyone else: the phone mode has no number field, only "your verified number +91 •••••• 4821" and a link to verify one (Cockpit rule 2).

### 13.3 Side effects are simulated and said

| Step | In a test |
|---|---|
| Speak, Question, Verify caller | Spoken or shown as usual |
| Knowledge lookup | A real, read-only search; the system row names the source and passage count |
| CRM lookup | Select in the Captured column: "Use a sample result: Found · Not found" (default Found with Test data values) or "Read from the CRM (read-only)" |
| Book meeting | Simulated: "Book meeting · simulated · would book Sat 11 am. No invite sent." |
| Send WhatsApp | Simulated: "Send WhatsApp · simulated · would send 'visit_confirm' to your number. Not sent." |
| Transfer to a person | Simulated in every mode: "Would transfer to Rep console. Nobody was called." A Checkbox in Call my phone mode, "Transfer for real during this test", names who would ring |
| End with outcome | "Outcome · Visit booked · would set Lead 1042 to Interested. Not written: this is a test." |

### 13.4 The canvas during a test

- **Current step:** the "running" treatment part 1 defines (accent trace once along the incoming edge over `--dur-trace`, then static) plus a Tag "Now". The canvas follows the current step while **Follow along** is on (default); panning by hand pauses it and shows a "Follow along" button.
- **Reached steps:** a 16 px `check` mark in the step's corner; traversed edges stay in `--edge-active`. Unreached steps are unchanged (no dimming, so the author can still read them).
- **Reduced motion:** no trace; the marks appear directly (F §11).
- **After the run:** marks stay until the author edits the flow, restarts or closes the panel. Clicking a turn's step link selects that step.

### 13.5 End of a run, and the record

The last row is a summary: "Reached 'Visit booked' · 6 turns · 5 steps · 1 min 12 s" (success StatusText) or "Stopped at #8 Send brochure: choose a template. Fix it, then Restart." (warning). A run that hits an invalid step stops there, never skips it.

Each run is recorded (FD6): kind, revision and its content hash, reached steps, outcome, who and when. The Publish gate's "Tested on this draft" reads these; an edit after the run makes the check read "Tested before your last 2 changes". Coverage (hidden until FD6): "Across 3 tests on this draft: 9 of 14 steps reached · **Show untested**" (filters the Outline to untested steps).

### 13.6 Test panel states

| State | Copy and treatment |
|---|---|
| Idle | Compact EmptyState: "Test the draft before callers hear it. Nothing is sent or dialled in a text test." + **Start text test** (primary in this region) |
| Running, waiting for the caller | Quick replies enabled; composer focused |
| Agent working | A partial turn row "…" in `text-3` (the TurnRow partial state); no typing animation |
| Stopped at an invalid step | Warning summary row with Go to step |
| Service error | InlineError "Couldn't reach the test service. Your draft is safe. Retry" |
| Offline | Text and phone modes `aria-disabled` "You're offline"; nothing queued |
| Microphone blocked | The Cockpit readiness row "Microphone blocked. Allow it in your browser's site settings, then Retry." |
| Wallet ₹0 (Call my phone) | Handled in the Call gate: "Wallet is ₹0. Top up to place phone calls." |

**Keyboard and screen readers.** `T` toggles the panel (single-key shortcuts can be turned off, O §19); focus moves to Start, then to the composer. Final agent turns are announced (throttled, N §12.4); the step change is announced "Now at Ask about a site visit". Quick replies are ordinary buttons in the tab order. `Esc` in the composer returns focus to the canvas step that is current.

**Responsive.** ≥1024 docked (overlays the canvas bottom at 1024–1279 when the inspector is open). 768–1023: a full-height sheet with the three modes; the read-only canvas behind still shows marks. <768: full screen, text and browser voice only ("Call my phone" stays in the Cockpit on phones), with the Path list in place of the canvas.

---

## 14. Destructive-action safety

### 14.1 Guards (O §3.1 tiers applied)

| Action | Tier | What happens | Copy |
|---|---|---|---|
| Delete a step (`Delete`/`Backspace` on a focused step, ⋯ › Delete step, bulk) | 1 · Undo | Acts at once; its connections go with it. **Delete and reconnect** (`Alt+Delete`, or the step menu) also joins the neighbours when the step has exactly one input and one output (part 1 §10.3). Inspector closes; focus moves to the previous step on the path; announced | Toast: "Deleted 'Polite close' and 2 connections · Undo" / "Deleted 'Pitch' · reconnected 'Greeting' to 'Ask about budget' · Undo" (F-FLOW-001, F-FLOW-025) |
| Delete a connection or an answer | 1 · Undo | At once | "Removed the connection from 'Yes' · Undo" |
| Delete several steps | 1 · Undo | One toast, one undo step | "Deleted 4 steps and 6 connections · Undo" |
| Delete the last Trigger or Outcome | 1 · Undo | Allowed; the flow gets error E01 or E03 and can't be published until fixed (part 1 §10.3) | "Deleted 'Inbound call' · Undo"; the issues chip turns red |
| Discard draft changes | 2 · Confirm | Draft resets to Live | §4.4 |
| Restore a version as draft over changes | 2 · Confirm | §6.3 | "Replace your draft with v5? …" |
| Apply an AI proposal | Diff first | One undo step | §6.5 |
| Start over from a template (⋯ › "Replace draft with a template…") | 2 · Confirm | Draft replaced; Live unchanged | "Replace your draft with 'Site visit'? Your 3 unpublished changes are removed. Live v7 is unchanged." |
| Archive a flow not used anywhere | 1 · Undo | Hidden from pickers | "Archived 'Diwali offer' · Undo" |
| Delete a flow not used anywhere | 2 · Confirm | Removed; call reports kept | "Delete 'Diwali offer'? Its 3 versions are removed. Call reports for its 41 calls are kept." |
| Archive or delete a flow that is live somewhere | 3 · Typed | Dialog lists the impact; each inbound number needs a replacement flow chosen; scheduled batches using it are cancelled | "Delete 'Site-visit qualifier'?" · impact rows: "+91 80 •••• 2210 answers with it · Answer with [EMI reminder ▾]", "Batch 'Weekend follow-ups' · 46 queued calls will be cancelled" · "Type Site-visit qualifier to confirm" · **Delete flow** |
| Publish, Roll back | 4 · Gate | §5, §6.4 | |

The inspector's red "Delete Node" slab and the unguarded "Reset to default" are retired (F-FLOW-019). Every destructive menu item sits last, after a separator, in `danger-text` (O §3.5).

### 14.2 Keys that delete

`Delete` and `Backspace` delete only when focus is on the canvas, a step or a selected edge, never inside a field, a popover, the Outline's rename field or the Test composer. The key does nothing while a test is running on the canvas (a toast explains "Stop the test to edit").

### 14.3 Toast rules in the designer

Undo toasts are persistent until dismissed or superseded, sit above the Problems bar and right of the inspector (O §9.3), and coalesce ("Deleted 3 steps · Undo" undoes all three). `⌘/Ctrl+Z` is owned by the designer's history stack, which the toast mirrors.

### 14.4 One history stack

Every graph change is one entry: add, paste, duplicate, connect, disconnect, delete, move (one per drag end), Tidy, answer and case edits, inspector typing (coalesced per field focus), AI apply, restore-as-draft and discard. The stack is empty after load (Undo disabled, "Nothing to undo"), cleared on flow switch, and survives saves and publishes within the session. Undo and Redo announce the action: "Undid delete 'Polite close'" (F-FLOW-005).

---

## 15. The Flows list and creating flows

### 15.1 Purpose

`/flows` answers "which flows exist, which are live where, and which have work waiting", and is where flows are created, duplicated, renamed, archived and deleted (F-FLOW-012, F-FLOW-013, F-UX-005).

### 15.2 Layout (≥1280)

```
┌ Flows ────────────────────────────────────────────── [Import JSON…] [New flow] ┐ 56
│ 16 flows · 3 live · 1 draft                                                    │
├ All 16 │ Live 3 │ Drafts 1 │ Not published 4 │ Archived 2 ───────────────────────┤ 40
│ [Search flows by name, id or number…]  [Filter ▾]                  Sort: Last edited │ 48
├──────────────────────┬────────────────────┬─────────────────────────┬────────┬───────────┬────────────────┬───┤
│ Name                 │ Status             │ Used by                 │ Lang   │ Issues    │ Last edited    │   │ 32
├──────────────────────┼────────────────────┼─────────────────────────┼────────┼───────────┼────────────────┼───┤
│ Site-visit qualifier │ ● Live v7  Draft·3 │ ☎ +91 80 •••• 2210 · 1 batch │ अ A │ ⚠ 1 warning │ Today · Anika R. │ ⋯ │
│ EMI reminder         │ ● Live v3          │ ⌂ Workspace default    │ अ A    │ No issues │ 12 Sep · you   │ ⋯ │
│ COD confirmation     │ Not published      │ Not used               │ A      │ ⊗ 2 errors│ 3 days ago     │ ⋯ │
│ Support FAQ  🔒      │ ● Live v1          │ API                    │ त A    │ No issues │ 21 Sep 2026    │ ⋯ │
```

| Part | Spec |
|---|---|
| Header | PageHeader (N §2): H1 "Flows", meta "16 flows · 3 live · 1 draft" (Shell), actions **Import JSON…** (tertiary) and **New flow** (primary). Import creates a new flow; it never replaces an open one |
| Views | ViewTabs with CountBadges: All · Live · Drafts (live flows with unpublished changes) · Not published · Archived |
| Toolbar | SearchInput `/` (name, short id, version "v7", number suffix) · Filter menu: Used by (Inbound, Batch, Workspace default, Not used), Language, Category, Owner, Visibility · Sort Select (Last edited, Name) |
| Table | DataTable (N §7), Standard 40 px rows. Columns: **Name** (500, middle-truncated, `translate="no"`; a `lock` 14 icon with "Only me" when private; legacy duplicates show `flow_7c21` in `mono-12` after the name until renamed) · **Status** (StatusTag flow: `Live v7` success and/or `Draft · 3 changes` neutral, or `Not published` outline, `AI draft` neutral) · **Used by** (first target + "· 2 more"; icons as §5.3; "Not used" in `text-3`; FD5) · **Languages** (names, LanguageMark `name`: "Hindi, English"; no glyph tiles in a table, N §5.6) · **Issues** (the Draft's validation StatusTag; "No issues" in `text-3`) · **Last edited** (date grammar + editor) · row actions |
| Row | The name is the row link to `/flows/<id>` (Enter opens); focusable rows (N §7.9). The open flow, when coming back from the designer, is focused |
| Interim I1 tag | Before revisions ship, a flow with a device draft in this browser shows a neutral Tag **"Unpublished edits on this device"** in the Status cell (read from IndexedDB, never from the server; teammates never see it), and the Drafts view counts these flows (§4.9) |
| Row `⋯` | Open · Test… (opens the designer with the Test panel) · Rename… · Duplicate · Make workspace default… (live flows only; toast "Default flow updated · used by Cockpit, Leads and new batches · Undo", O §9.2) · Visibility ▸ Workspace / Only me · Export JSON · separator · Archive… · Delete… (`danger-text`) |

**Phone (<768):** two-line list items: name + status tag / "Used by +91 80 •••• 2210 · edited today" with the issues tag on the right; New flow in the top bar as an IconButton "New flow"; the row menu opens as an action sheet. **Tablet:** the table drops Languages and Last edited editor (kept in the tooltip).

### 15.3 New flow (`/flows/new`)

A full page in the shell (not a modal), replacing the instant template swap hidden above "Reset to default" (F-FLOW-013).

```
┌ New flow ─────────────────────────────────────────────────────────────── Cancel ┐
│ Name            [Site visit follow-up                              ]            │
│ Languages       [अ Hindi ×] [A English ×] [+]      Voice [Va Vaani ▾ ▶]         │
│ Start from                                                                      │
│ ( ) Blank            Trigger → Outcome                                          │
│ (•) Site visit       ◖Inbound → ◇Ask about a visit → □Book visit → ◗Visit booked │
│ ( ) Lead qualification · ( ) EMI reminder · ( ) COD confirmation                │
│ ( ) Appointment · ( ) Support FAQ · ( ) Describe it: [Textarea…]                │
│                                                                   [Create flow] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **Name** required and unique (async check, V5; "A flow called 'Site visit' already exists. Choose another name."). **Languages** MultiSelect; **Voice** VoicePicker compact. **Start from** is a RadioCard group (C §6.2); each template card (TemplateCard) shows a one-line purpose, a mini phase strip (glyph tiles and step names in `meta-12`, part 1 §13.1), a **Needs** line and a Preview link opening a read-only canvas sheet. "Describe it" reveals the AI draft textarea (§6.5).
- **Needs line** (`meta-12` `text-3`, computed from the workspace when the page loads): what the template uses that this workspace hasn't set up, and what happens without it: "Needs: Google Calendar · an approved WhatsApp template. Without them, visits are offered in set hours and no confirmation is sent." When nothing is missing: "Works with your workspace as it is." Blank shows no Needs line.
- **Pre-selection.** When Home's setup track opens this page from the workspace goal (Shell §13.3), it pre-selects the best-matching template **whose needs are met**; a template with unmet needs is never pre-selected over one without.
- **Create flow** persists the flow at once as a Draft ("Not published"), so every later action has a real target, and opens `/flows/<id>` with the first step selected and the Test panel hint "Test it before you publish." A template's copy uses the chosen languages.
- **Instantiation adapts the template to the workspace**, so the first-run "Publish a flow" never starts blocked by errors the author didn't make. Templates are validated in isolation in CI (§12.2), but W08, E13, E12/W01 and W02 depend on the workspace:
  - **Inbound call trigger:** bound to the workspace's only verified number that no other flow answers. With no such number, a template that also works outbound (Site visit, Lead qualification, EMI reminder, COD confirmation, Appointment) is created with an **Outbound batch** trigger instead; an inbound-only template (Support FAQ) keeps its Inbound call trigger and shows W08 ("doesn't answer any number yet"), which its Needs line announced. With several unbound numbers, the trigger is left for the author to choose (W08 until chosen). Blank follows the same rule (part 1 §13.2).
  - **Book meeting:** "Offer times from" is Set hours (workspace calling hours, IST) unless Google Calendar is connected; never a calendar default that raises W02.
  - **WhatsApp:** the confirmation checkbox is off, and a template's separate Send WhatsApp step is left out (its neighbours joined), unless WhatsApp is connected with an approved template, which is then pre-selected (no E12 or W01).
  - **Knowledge lookup:** "Search in" is All indexed sources when the workspace has at least one indexed source; otherwise **This step's Q&A** with three sample question-and-answer pairs in the flow's languages (no E13).
  - **CRM lookup:** included only when a connector exists; otherwise the template's variant without it is used.
  - **Acceptance:** in an empty workspace (no numbers, integrations or knowledge), creating every template yields **0 errors**, and at most W08 on the inbound-only template; with a number, a calendar and WhatsApp connected, 0 errors and 0 warnings.
- The Flows empty state ("Start from a template or describe the call you want.", O §15.3) links here.

### 15.4 Duplicate, rename, visibility

- **Duplicate** copies the Draft (not the versions) into a new flow named "Site-visit qualifier (copy)" (then "(copy 2)"), `Not published`, owned by you; toast "Duplicated as 'Site-visit qualifier (copy)' · Open". Ids are fresh; nothing chains "-copy-" (F-FLOW-026).
- **Rename…** is a Dialog `sm` with one Name field (unique check), also reachable from Flow settings › Identity. Renaming never touches versions or calls; History logs it.
- **Visibility**: Workspace (default) or Only me. Only-me flows show the lock, are hidden from teammates' pickers, and can't be live anywhere (§11).

### 15.5 Where a flow is live, everywhere else

Every other page that picks a flow uses FlowSwitcher (C §5.4) and shows the version the call will use: Cockpit (`call`: drafts for test calls only), Leads bulk and lead sheet (`assign`: unpublished flows disabled "Not published yet. Publish it to use it for calls."), Meetings "Uses flow", Phone setup's number binding, and Call reports filters. "Active flow (from profile)" and "Default flow" are replaced by the flow's name: "Workspace default · Site-visit qualifier v7" (F-FLOW-014, F-UX-005).
