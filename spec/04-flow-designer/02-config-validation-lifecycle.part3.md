
---

## 5. The Publish gate

**Purpose.** The one door to Live. It shows whether the Draft may go live, what changes, where it goes live and who is affected, then publishes it as the next version. It is `PublishGate` (O §3.1 tier 4), specified in `spec/02-components-gate.md` §5.2: the sheet gate container (640, modal, `--e3`), `GateChecklist` and `GateCheckRow`, the check kinds, states, keys, gate token and idempotency key live there. This section configures it: which checks, where it goes live, the changes, the note and the copy.

**Opened by:** `Publish v8…` in the header; the palette action "Publish v8…"; "Roll back to v5…" (§6.4, same gate with a different title); the Assistant's approval step for any plan that publishes (F-UX-022). No single key opens it. Opening flushes pending saves first and requests server validation (FD4).

### 5.1 Layout (≥1024)

```
┌ Publish v8 ─────────────────────────────────────────────────────────── ✕ ┐ 56
│ Site-visit qualifier · draft from v7 · 3 changes by you and Anika R.     │
├──────────────────────────────────────────────────────────────────────────┤
│ Checks                                 Ready · 1 warning to confirm      │
│  ✓  No errors                                                            │
│     14 steps checked just now. The server runs the same rules.           │
│  ⚠  Book site visit: WhatsApp template "visit_confirm" is pending        │
│     approval. Bookings still work; the confirmation waits.  Go to step  │
│     [✓] Publish with this warning                                        │
│  ✓  Tested on this draft                                                 │
│     Text test · Today 11:02 am · reached "Visit booked"                  │
│                                                                          │
│ Where it goes live                                                       │
│  ☎  Inbound +91 80 •••• 2210 · Mon to Sat, 10 am to 7 pm IST             │
│  ☰  Batch "Weekend follow-ups" · 46 leads queued · the next call uses v8 │
│  ⌂  Workspace default flow (Cockpit, Leads)                              │
│     Calls in progress finish on v7. New calls use v8.                    │
│                                                                          │
│ Changes (3)                                                              │
│  Changed · Ask about a site visit · prompt edited, answer "Later" added  │
│           by you · Show                                                  │
│  Added   · Book site visit · by Anika R. · Show                          │
│  Changed · Flow settings · voice Vaani → Vikash · by you · Show          │
│                                                                          │
│ Note (optional)                                                          │
│  [What changed and why…                                              ]   │
├──────────────────────────────────────────────────────────────────────────┤
│ Callers hear v8 from the next call.        [Cancel] [Publish with 1 warning] │
└──────────────────────────────────────────────────────────────────────────┘
```

Order is Checks → Where it goes live → Changes → Note: the decision first, then its blast radius, then the detail (§3). Section headings are `title-14` `h3`; the Checks heading carries the summary `StatusText` with `role="status"`.

### 5.2 Check rows

Each row is a `GateCheckRow` (G §2.2), and every row renders inside the gate (`collapse="none"`, the last look before going live). Kinds per G §5.2: errors are `blocking` with sub-rows, warnings are `advisory` `severity="warning"` with a required ack, the test check is `advisory` with an ack and reasons.

| Check | Pass | Blocking (disables Publish, its sentence becomes the reason) | Advisory (never blocks) |
|---|---|---|---|
| Errors | "No errors" · "14 steps checked just now. The server runs the same rules." (interim: "Checked on this device.") | "2 errors" then one sub-row per error: "#5 Ask about budget: 'No reply' isn't connected. · Go to step" | n/a |
| Each warning | n/a | n/a | The warning sentence + Go to step + a Checkbox "Publish with this warning". Unticked warnings keep Publish disabled with "Confirm 1 warning to publish." (D §6.5) |
| Tested on this draft | "Tested on this draft" · "Text test · Today 11:02 am · reached 'Visit booked'" (any kind: text, browser voice, test call) | n/a | "Not tested since your last change." · **Test now** (closes the gate, opens the Test panel) · Checkbox "Publish without testing" which reveals a Select "Reason": Wording change only · Urgent fix · Tested another way · Other (Other adds a one-line field). The reason is stored on the version (D §6.5) |
| Draft saved | (hidden when saved) | "Your last 2 edits haven't saved. Retry" | n/a |
| Draft unchanged while open | (hidden) | "The draft changed while this was open. Anika R. saved at 11:31 am. **Review changes**" (refreshes Changes) | n/a |
| Base unchanged (interim I1 only) | (hidden) | "This flow was published from another browser at 11:31 am. Your draft is based on an older copy. **Review changes**" with two choices: **Re-apply my changes on top** (a three-way merge per step; conflicting steps are listed and must be resolved) or **Discard my draft** (§4.9) | n/a |
| Inbound number ready | "Inbound +91 80 •••• 2210 verified" (folded into Where it goes live) | "+91 80 •••• 2210 isn't verified yet. Verify it in Phone setup before it can answer calls." | n/a |
| Moves a number | n/a | n/a | "+91 80 •••• 2210 moves from 'EMI reminder' (Live v3) to this flow." |
| Wallet | (hidden when fine) | n/a | "Wallet is ₹0. Calls on v8 won't connect until you top up. · Top up" (publishing costs nothing, so it never blocks) |
| Calling hours | (hidden) | n/a | "Outside calling hours. Batch calls on v8 start at 10 am IST." |
| Voice and language | (hidden) | "Voice Vikash doesn't speak Tamil, one of this flow's languages. Change the voice in Flow settings." | n/a |
| Permission (FD12) | (hidden) | "Only admins can publish this flow. Ask Anika R. or Rohit S." | n/a |
| Couldn't check | n/a | `unknown` row: "Couldn't run the server check. **Retry**" (treated as blocking, G §2.1) | n/a |

Summary line (`StatusText` md): "Ready to publish" (success) · "Ready · 1 warning to confirm" (warning) · "2 errors block publishing" (danger, the blocked tone of G §2.3) · "Checking…" (progress).

### 5.3 Where it goes live

A list (not a table), one row per `UsedBy` (FD5), each with a 16 px Lucide icon in `text-2`: `phone-incoming` inbound (number `PhoneText` + hours), `list-checks` batch (name + queued count + "the next call uses v8"), `house` workspace default ("Cockpit, Leads and new batches start with it"), `video` Meetings, `list-checks` Personal agents, `webhook` API trigger ("Calls started through the API"). After the list, one `meta-12` sentence: "Calls in progress finish on v7. New calls use v8."

| Case | Copy |
|---|---|
| Nothing uses it yet | "Nothing uses this flow yet. After publishing, choose it in Phone setup, a Leads batch or **Make workspace default**." |
| First publish (v1) | Same list; the footer sentence becomes "Nothing called this flow before." |
| Interim (FD5 missing) | Only "Your Cockpit default" when `active_flow_id` matches; otherwise "Where this flow is used isn't known yet." (never guessed) |

### 5.4 Changes

`DiffList` (§24): rows grouped Added · Changed · Removed · Settings, each `data-13`: kind word (`fw-medium`) · step label (`translate="no"`) · a summary in `text-2` ("prompt edited, answer 'Later' added") · author ("by you", "by Anika R.") · **Show** (closes the gate, enters compare mode at that step). More than 8 rows collapse behind "Show all 23 changes". A first publish shows "First version · 12 steps" instead of a diff. Reordering and position-only moves are summarised as one row ("Layout tidied"), never one per step.

### 5.5 Note, footer and keyboard

- **Note** (optional): Textarea, 1 row growing to 4, soft limit 280 ("What changed and why…"). Stored on the version and shown in History.
- **Footer:** why-text on the left in `meta-12` `text-2` (the consequence or the blocking reason), then **Cancel** (ghost) and the primary. Labels: `Publish v8` · `Publish with 1 warning` · `Publish without testing` (when the test check was skipped) · `Roll back to v7` (§6.4) · `Publishing…` (Spinner, gate not dismissible). Disabled uses `aria-disabled` with the reason in the why-text and in `aria-describedby`.
- **Keyboard** (G §4.5): focus lands on the title (read-mostly sheet, O §1.3); Tab reaches warnings' checkboxes in order; `⌘/Ctrl+Enter` publishes when enabled (as in the Call gate); `Esc` closes (the note is kept for the session). "Go to step" and "Show" close the gate and move focus to the step or change.

### 5.6 States and copy

| State | Treatment |
|---|---|
| Checking | Rows show `checking` marks; summary "Checking…"; the primary keeps its label, `aria-disabled`, with the why-text "Checking the draft…" (G §4.1) |
| Ready | As §5.1 |
| Blocked by errors | Summary "2 errors block publishing"; error rows first; primary disabled, why-text "Fix 2 errors to publish." |
| Warnings unconfirmed | Primary disabled, "Confirm 1 warning to publish." Ticking relabels the button "Publish with 1 warning" |
| Publishing | Primary "Publishing…", Cancel disabled, Esc ignored; header version area shows `Publishing v8…` |
| Network failure | Danger InlineError at the top (`role="alert"`): "Couldn't publish. Nothing changed: callers still hear v7. **Retry**" · Details. The gate stays open |
| Server found more issues (422) | Rows update from the server list; summary "The server found 1 more error"; focus moves to the summary |
| Live changed (409 on publish) | Blocking row: "Anika R. published v8 at 11:40 am while this was open. This draft now publishes as v9. **Review changes**" |
| Success | Gate closes; focus returns to the header's version area; toast (below) |

### 5.7 After publishing

- **Toast** (O §9.2 kind `publish`): "v8 is live on 1 number and 1 batch · Roll back to v7…". For a first publish: "v1 is live. Choose where to use it · Where to use it".
- **Header:** `Live v8`; the Draft chip disappears (the draft is clean and mirrors v8); the live note hides; Publish becomes `aria-disabled` "Nothing to publish".
- **Announce** (polite): "Version 8 is live."
- **Elsewhere:** the Baseline's live segment updates; the Flows nav badge "1 draft" clears; FlowSwitcher options show `Live v8`; Call reports record the version on each call.
- **Roll back** stays reachable after the toast in the version menu and History for 7 days as the first item ("Roll back to v7…"), then as a normal History action.

### 5.8 Responsive

The sheet gate's breakpoints are G §1.3; the Flow Designer adds only the phone "Show" behaviour below.

| Width | Gate |
|---|---|
| ≥1024 | Right sheet, 640, modal with scrim |
| 768–1023 | Modal, full height, `min(640px, 100%)` wide; opened from Review mode (§21) |
| <768 | Full screen, header 56 with "Back", sticky footer above the safe area with 44 px buttons; sections unchanged; "Show" opens the step's read-only sheet instead of compare mode |

---

## 6. Version history, restore and roll back

### 6.1 The History panel

Opened from the tool rail (Version history), the version menu, or `?panel=history`. It opens in the **left panel** (`--size-left-panel` 280, part 1 §3.1), so the inspector stays free for the selected step of a version being viewed; below 1024 it is a full-height sheet.

```
┌ Version history ──────────────── ✕ ┐
│ Draft · 3 changes since v7          │  current, selected
│ Edited by you, Today 11:24 am       │
│─────────────────────────────────────│
│ ● v7  Live                          │
│   12 Sep, 4:10 pm · Anika R.        │
│   "Added Later answer to the visit  │
│    question"                        │
│   Tested: test call · 412 calls     │
│ ○ v6  12 Aug to 12 Sep · 1,204 calls│
│   Rohit S. · "Hindi greeting"       │
│ ○ v5  Rolled back from v6 … · ⋯     │
│ ○ v1  Migrated · published before   │
│       checks existed                │
│ [Show older versions]               │
└─────────────────────────────────────┘
```

Built on `Timeline` (N §10) as `VersionHistory` (§24). Each version row: version (`title-14`, tabular) · state Tag (`Live` success with static LiveDot; nothing for past versions) · date range it was live · author (Person avatar 20) · note in `text-2` (quoted, two lines, then "More") · meta: how it was tested ("Tested: text test" / "Published without testing: urgent fix") and calls handled ("412 calls", from Call reports, linking to `/call-reports?f.flow=<id>&f.version=7`; hidden until counted) · `⋯`. Metadata events (renamed, visibility changed, archived) appear as compact system rows between versions.

| `⋯` action | Available on | Does |
|---|---|---|
| View | every version | `?v=5`: read-only canvas (§6.2) |
| Compare with draft | every version | Compare mode against the Draft (§4.5) |
| Compare with previous | v2 and later | Compare mode v4 → v5 |
| Restore as draft… | every non-draft version | §6.3 |
| Roll back to this version… | past versions (not the Live one) | §6.4 |
| Copy link | every version | `/flows/<id>?v=5` |

Keyboard: the list is a `listbox` of versions (↑/↓, Enter views, Shift+F10 opens `⋯`); the panel title receives focus on open; Esc closes and returns focus to the trigger.

### 6.2 Viewing an old version

`?v=5` shows v5 on the canvas, read-only: steps are selectable, the inspector shows fields disabled (not greyed text: `read-only` field state, C §3.2) and an info Notice at the top of the canvas: "Viewing v5 (live 2 Aug to 12 Aug). Read-only. **Back to draft**". Header per §4.3 (Restore as draft… secondary, Roll back to v5… primary). Test works on it ("Test v5" in the Test panel's revision select), which is how an author checks an old version before rolling back.

### 6.3 Restore as draft

Copies v5's content into the Draft; Live does not change.
- Draft clean: acts at once; toast "Draft now matches v5. Live v7 is unchanged. · Undo".
- Draft has changes: tier 2 ConfirmDialog "Replace your draft with v5? Your 3 unpublished changes are removed. Live v7 is unchanged." · Cancel · **Replace draft** (primary, not danger: nothing live is affected). Then the same toast with Undo (FD11).

### 6.4 Roll back

"Roll back to v7…" (from the publish toast, the version menu or History) opens the Publish gate with:
- Title "Roll back to v7", meta "Publishes v7's content as v9. Calls already placed on v8 stay recorded on v8."
- Checks re-run **on v7's content today**: an integration or template that has since broken blocks it like any publish ("v7 uses the WhatsApp template 'visit_old', which was rejected on 20 Sep.").
- Changes: the diff from Live v8 to v7's content.
- Where it goes live: as §5.3.
- Note prefilled: "Rolled back from v8 to v7's content" (editable).
- **The Draft:** if the Draft is clean it follows Live (becomes v9's content). If it has changes, a Checkbox "Also reset my draft to v7's content (removes 3 unpublished changes)", unticked, with the consequence under it: "Left unticked, your draft keeps v8's changes and publishing it later brings them back." The version chip then reads `Draft · based on v8 (rolled back) ▾`.
- Primary: `Roll back to v7`. Toast: "v9 is live with v7's content. Calls on v8 stay on v8. · Undo isn't possible; roll back again from History."

There is no "Undo publish" anywhere (D §1.4).

### 6.5 AI draft (Describe it)

AI draft becomes a way to **propose changes to the Draft**, never to replace a flow silently (F-FLOW-031).

- Entry: ⋯ › "Describe a change…" in the designer, the palette, and `/flows/new` "Describe it" (§15.3).
- Sheet `detail` (560): Textarea (6 rows, soft limit 2,000, placeholder "Ask about a site visit this week. If they say later, schedule a callback…"), optional fields: Languages (MultiSelect), "Book meetings" (Checkbox), "Hand off to a person when" (text). Three example prompts as secondary `sm` buttons that insert text (not chips that run).
- Generate runs with `StageProgress` (O §14.3): Reading your description · Drafting steps · Checking the flow, with Cancel; up to 90 s.
- Result: compare mode on the canvas against the current Draft (added, changed, removed marks as §4.5) plus a bar: "Proposed: 6 added · 2 changed · 1 removed · 1 error to fix" · **Apply to draft** (primary) · Discard. Applying is one undo step and a toast "Applied 9 changes to the draft · Undo". Nothing reaches Live; the Publish gate still stands between it and callers.
- The server validates the proposal against the step-type schema; unknown types come back as Unsupported steps (§7.15), never as default boxes (F-FLOW-029).
