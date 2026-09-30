## 9. Plans

A **plan** is the ordered list of steps the Assistant will take for one request. It is shown before anything runs and stays attached to the chat as the record of what happened (principles A1, A2).

### 9.1 Step kinds

| Kind (word on the step) | Examples | Changes the workspace? | Default guard (mode "Ask before changes") |
|---|---|---|---|
| **Look up** | Find callbacks due today; summarise the last 10 calls; this week's analytics; search knowledge; read an attachment | No | Runs on its own |
| **Draft** | Create a new flow as a draft (not published); write a script; save a lead view | Creates something new that is not live | Runs on its own; result is a Card |
| **Edit draft** | Change the draft of an existing flow | Changes a shared draft (never Live) | ApprovalCard with a diff: Apply to draft · Discard (F-FLOW-031) |
| **Change** | Add or import leads; set status; assign a flow; schedule a callback; add a note; add a knowledge file | Yes, reversibly | ApprovalCard |
| **Delete** | Delete leads or a knowledge file | Yes | ApprovalCard; typed count above 50 records |
| **Call** | Call n leads now or at a time; call yourself to test | Dials people and costs money | **Call gate** |
| **Publish** | Publish a flow draft as a new live version | Goes live | **Publish gate** |
| **Open** | "Open Leads with this filter" | No | A link (used in Suggest only mode) |

**Out of reach in v1** (the Assistant says so and links to the page): top up, billing and autopay; settings, roles, invites, API keys and webhooks; deleting flows or the workspace; sending WhatsApp or SMS; taking over or ending a live call; exporting data outside the workspace. It always acts with the signed-in user's role and never sees data that role cannot see.

### 9.2 Step statuses

Marks reuse the StageProgress visuals (overlay §14.3, 20 px) and add three (§19).

| Status | Mark | Result line (StatusText `sm`) | Announced (polite unless noted) |
|---|---|---|---|
| Queued | 1.5 px `--control` ring | "After step 3" (`--text-3`) | no |
| Running | Spinner sm in a 2 px `--accent-mark` ring | "Adding 24 leads…" | no |
| Waiting for you | **new:** `pause` 12 on `--warning-soft`, `--warning-text` | Tag `warning` "Waiting for you" + the ApprovalCard | "Step 3 needs your approval" |
| Done | `check` on `--success-soft` | "Done · 24 added · **View in Leads** · **Undo**" | "Step 2 done" (debounced; several finishing together read "Steps 1 and 2 done") |
| Blocked | **new:** `lock` 12 on `--warning-soft` | The reason and the fix: "Only admins can publish flows. Ask an admin." | yes |
| Failed | `x` on `--danger-soft` | InlineError: "Couldn't add 3 of 24 leads. **Retry step** · Details" | **assertive**, once |
| Skipped · Cancelled · Expired | **new:** `minus` (or `timer-off` for Expired, the one Expired icon in N §5.3) 12 on `--surface-3`, `--text-2` | "Skipped by you" · "Not run: plan stopped" · "Approval expired after 24 h · **Ask again**" | no |

### 9.3 Plan lifecycle

1. **Planning…** The panel header shows Spinner sm + "Planning…"; then every step appears as Queued. A plan never appears one step at a time as if improvised.
2. **Running.** Steps run in order. Look up and Draft steps run on their own (in modes 2 and 3). The plan pauses at the first step that needs the user.
3. **Waiting.** The plan stays paused. The nav badge shows "1 waiting" and the chat's History row says "Waiting for you" (§12). After 24 h the step **expires** and "Ask again" re-plans with fresh data.
4. **Re-check.** When a waiting card comes into view and its preview is older than 10 minutes, it recomputes and says "Checked just now". Gates always run their own checks when opened. Execution is bound to what the user saw: the server receives a preview hash, and if the data changed (a lead was deleted, a teammate edited the draft) the step returns "Changed since you approved. **Review again**" instead of acting on different data.
5. **Stop plan.** A tertiary `sm` Button in the panel header while Running or Waiting. It never interrupts a write in flight: "Stopping after step 2…", then the remaining steps are Cancelled. Tier 0: no confirmation.
6. **Ends** as Done ("Done · 4 of 4"), Stopped ("Stopped at step 3") or Failed ("Failed at step 2 · **Retry step**"). The Assistant then posts a short closing turn that states only confirmed results: "Added 24 leads. Scheduled 10 calls for 11:00 am IST; 2 were skipped by the call checks."
7. **One active plan per chat.** A new request that needs a new plan cancels the waiting step of the old one ("Replaced by a new plan") and the reply says so.
8. **Leaving the page.** Running steps continue on the server; waiting steps wait. If the plan finishes while the user is elsewhere in the app, a success toast offers "Plan finished · 4 of 4 steps · **Open chat**".

### 9.4 Plan panel anatomy (≥ 1024; the same content in the Plan sheet below 1024)

| Part | Spec |
|---|---|
| Region | `<aside aria-labelledby="plan-title">`, `--surface`, left hairline `--border`, width per §5.2; its own scroll container with `overscroll-behavior: contain` |
| Header (sticky, `--size-header` 56) | `h2#plan-title` "Plan" (`title-16`) · plan StatusTag ("Waiting for you" warning, "Running" info, "Done" success, "Stopped" neutral, "Failed" danger) · meta "Step 3 of 4" (`meta-12`, tabular; hidden when the panel is 320 wide) · right: Stop plan |
| Tabs (`--size-view-tabs` 40) | PanelTabs "Plan" · "Changes {n}" |
| Step list | `<ol aria-label="Plan steps">`; each item a grid `var(--space-20) minmax(0,1fr)`, gap `--space-12`, padding-block `--space-12`; a 1 px `--border` connector joins the marks (Timeline style). Content: kind line `label-12` `--text-3` ("3 · Call"), title `data-13` weight 500 `--text` ("Call 12 leads with EMI reminder v4"), result line, and a "Details" disclosure listing the inputs used ("Status is Callback due · Due today · Not called in the last 24 h") |
| Waiting step | Expands to hold the ApprovalCard (§10.3) under its title; the step gets `aria-current="step"` |
| Footer (sticky) | `meta-12` `--text-3`: the autonomy sentence + link "Assistant permissions" (Settings › Workspace › Assistant) |
| Empty (no plan yet) | EmptyState `compact`, mode-aware (§13.1) |
| Hidden | The header's plan toggle hides the panel (remembered per user); a waiting ApprovalCard then renders inline in the thread (§5.2 rule) |

### 9.5 Changes tab

A Timeline (data-nav §10) of every change the Assistant made in this chat, newest first, grouped by day.

| Item | Actions |
|---|---|
| "Added 24 leads" | View (Leads, filtered to those 24) · **Undo** while the backend keeps the soft-delete window (tooltip: "Undo available until tomorrow 10:44 am"); after undo the item reads "Undone 10:52 am" |
| "Created draft flow **Sales qualifier**" | Open in Flows · Undo (deletes the draft only while nobody has edited it; otherwise "Delete draft…" in Flows) |
| "Applied 3 changes to the **EMI reminder** draft" | Open diff · Undo (restores the previous draft revision) |
| "Scheduled 10 calls for today 11:00 am" | Open in Cockpit. No Undo: calls are paused or cancelled in Cockpit (Cancel a batch is tier 2 there) |
| "Published **Sales qualifier** v1" | Open in Flows · "Roll back…" opens the version menu. Never "Undo publish" (direction §7 item 14) |

Every change also lands in Settings › Activity & Audit with the actor "{user} via Assistant", so the audit ledger is complete (F-UX-042).

---

## 10. Confirming consequential actions

### 10.1 Risk tiers for Assistant steps

The overlay spec's guard ladder (overlay §3.1) applies unchanged. The Assistant adds no weaker path.

| Tier | Assistant steps | Guard | Can an autonomy mode lower it? |
|---|---|---|---|
| 0 · None | Look up; Open | none | n/a |
| 0 · None (Undo = delete draft) | Draft a new flow, script or view | none; listed in Changes | n/a |
| 1 · Undo | Change up to 50 records, reversible | ApprovalCard; in mode 3 runs on its own with an Undo toast | Only to "on its own with Undo" |
| 2 · Confirm | Change more than 50 records; Edit draft (diff); Delete up to 50 records; Cancel a scheduled batch | ApprovalCard | No |
| 3 · Typed | Delete more than 50 records | ApprovalCard with typed count ("Type 64 to confirm") | No |
| 4 · Gate | Call; Publish | Call gate · Publish gate | **Never**, for any role, including admins (direction P3) |

### 10.2 Autonomy modes

Set by an admin in **Settings › Workspace › Assistant** ("Assistant permissions") as a RadioCard group (core §6.2). Each user may choose an equal or stricter mode for themselves. The same words as Personal agents are used per capability (Auto, Confirm), so the two features read as one system (00-summary §4).

| Capability | 1. Suggest only | 2. Ask before changes (default) | 3. Undoable changes on its own |
|---|---|---|---|
| Look up | Auto | Auto | Auto |
| Draft something new | Preview in chat, "Create draft in Flows" button for you | Auto | Auto |
| Change ≤ 50 records (reversible) | "Open" link: you do it | Confirm | Auto, with an Undo toast |
| Change > 50 · Edit draft · Delete ≤ 50 | "Open" link | Confirm | Confirm |
| Delete > 50 | "Open" link | Confirm + typed | Confirm + typed |
| Call | "Open" link to Leads with the selection | Call gate | Call gate |
| Publish | "Open" link to the draft in Flows | Publish gate | Publish gate |

"Confirm + 2FA" is not used in v1. It is reserved for any future capability that moves money, matching Personal agents' default for financial actions.

**Mode sentences** (page header meta on a new chat, plan panel footer, Settings): mode 1 "Suggests steps. You make every change." · mode 2 "Asks before changing anything." · mode 3 "Makes undoable changes, asks for the rest."

**Settings content under the modes** (a KeyValueList titled "Always, in every mode"): Calls go through the Call gate · Publishing goes through the Publish gate · Deleting always asks · It acts with your role's permissions · It can't top up, change billing or change settings. Mode changes are recorded in Activity & Audit.

### 10.3 ApprovalCard (tiers 1 to 3)

An inline card built from the gate's parts (direction P3; `spec/02-components-gate.md` §5.7: `GateChecklist`, the `GateCost` impact or cost line, the header grammar, one confirming action, `⌘/Ctrl+Enter`, an idempotency key per decision), rendered inside the waiting step or inline in the thread (§5.2). It is not a modal: the user can read the thread, scroll the plan and even type while it waits.

| Part | Spec |
|---|---|
| Container | `--surface`, 1 px `--border-strong`, `--radius-8`, `--e1` (dark: border only), padding `--space-panel-pad` 16; `role="group"` `aria-labelledby` its title; Standard density |
| Header | Title `title-14`, verb + object + count: "Add 24 leads", "Mark 12 leads Contacted", "Apply 3 changes to the EMI reminder draft", "Delete 64 leads". Meta `meta-12` `--text-3`: "Checked just now" / "Checked 12 min ago · **Recheck**" |
| What changes | One of: a read-only table (first 5 rows + "and 19 more · **View all 24**", which opens the full list in the Plan sheet or a `lg` Dialog); a KeyValueList of field changes ("Status · Callback due → Contacted"); a diff summary ("3 steps added · 1 changed · **Open diff**", opening the flow in Flows on its diff view) |
| Checks (optional) | Gate check rows (`blocking`, `adjusted` or `advisory`, G §2.1), e.g. "3 phone numbers are already in Leads · skipped · **Include**" (`adjusted`: it changes the count) or "No phone column found" (blocking) |
| Impact line | `data-13`: "Affects 24 leads · Undo available for 24 h" or "Deleted leads can't be restored after 7 days" (wording from the backend's real window); then `meta-12` `--text-3` "Runs as you · Operator" |
| Typed confirm (tier 3) | Field "Type **64** to confirm" inside the card, per ConfirmDialog typed rules (overlay §3.2: paste allowed, trimmed match) |
| Blocked reason | An inline warning Notice above the footer with the fix; the primary becomes `aria-disabled` with that reason (core §1.6) |
| Footer | Right-aligned: **Skip step** (tertiary) · **Edit…** (secondary) · the primary, which repeats the verb and count ("Add 24 leads", "Apply to draft"); deletes use the `destructive` outline variant ("Delete 64 leads"). At 320–400 px wide the primary takes its own full-width row. When the card is taller than its scroll area (the 320 px panel at 1024×768), the footer is sticky at the bottom of that area |
| Keyboard | ⌘/Ctrl+Enter anywhere inside the card activates the primary (the gate convention); Esc does nothing (the card is not an overlay) |
| Busy | Primary shows "Adding…" (Button loading), card inputs lock, `aria-busy="true"` |
| Done | The card collapses into the step's result line; focus moves to that line (`tabindex="-1"`), which is announced |
| Plan changed | Info Notice at the top of the card: "The plan changed. Review again." The primary stays disabled until the new preview loads |

**Edit…** opens an inline form in the card (Standard density): the step's parameters as real fields (a Select for the status, a FlowSwitcher, a date and time for callbacks, checkboxes to exclude recipients). "Save changes" recomputes the preview; "Cancel" restores it. A link "Ask for a different plan" inserts "Change step 3: " into the composer instead.

**Skip step** marks it Skipped. Later steps that depend on it are skipped with the reason "Needs step 3".

### 10.4 Call steps: always through the Call gate

The Call step's card uses the same anatomy with call facts, and its primary opens the product's **Call gate**. The Assistant never starts calls itself (F-UX-013, F-A11Y-004).

| Part | Content |
|---|---|
| Title | "Call 12 leads" (or "Call yourself to test EMI reminder v5 (draft)") |
| Facts (KeyValueList) | Flow: "EMI reminder v4" + StatusTag "Live v4" (static dot); a draft can be used only for a test call to your own verified number ("Draft · test calls only", core §5.4) · Voice: VoiceTile 28 + "Vaani · Hindi + English" · When: "Now · calling hours until 7 pm IST" or "Tomorrow 10:00 am IST" · Caller ID: `mono-13` "+91 80 •••• 2210" |
| Recipients | First 3 rows: "Lead 1042 · Pune" · `PhoneText` "+91 ••••• 4821" · "Due 11:00 am"; then "and 9 more · **View all 12**" |
| Cost line (gate cost row) | "12 calls · about 1 to 2 min each · **₹29 to ₹58**" · right: "Wallet ₹2,340.50 · about 16 h". Until median durations exist: "Rate ₹0.04/s" (direction §8 interim) |
| Note | `meta-12` `--text-3`: "Calling hours, DND and recent calls are checked again before anything dials." |
| Footer | Skip step · Edit… (flow, voice, time, recipients) · primary **Review and call…** (`phone-outgoing`) |

- **Review and call…** opens the Call gate (G §5.1) pre-filled with this batch and the step's idempotency key; its container follows G §1.3 (anchored popover 400 when it fits, bottom sheet on phones). The gate runs its blocking and advisory checks and shows its own count ("Start 10 calls" after skips). Only the gate's Start, or ⌘/Ctrl+Enter inside the gate, places calls.
- **Cancel in the gate** leaves the step Waiting and returns focus to Review and call….
- **After Start:** the step is Done: "Scheduled · 10 calls · 2 skipped by the checks · **Open in Cockpit**". The batch sits in Cockpit › Up next as Scheduled, with Pause and Cancel. Each step carries an idempotency key, so a retry or a double click can never create two batches.
- **Blocked** (inline reason; primary `aria-disabled`):
  - Wallet: "Wallet is ₹0. **Top up** to place calls." (→ `/billing?topup=1`; rung 4 of the wallet ladder, overlay §10.2).
  - Setup: "No verified caller ID yet. **Finish setup (3 of 5)**" (→ `/home`).
  - No live version: "EMI reminder has no live version. Publish it first, or **call yourself to test**."
  - Role: "Your role can't place calls. Ask an admin."
- Outside calling hours is **not** a block on the card; it says "Outside calling hours now. The Call gate will offer to schedule." and the gate does the rest.

### 10.5 Publish steps: always through the Publish gate

| Part | Content |
|---|---|
| Title | "Publish Sales qualifier as v1" |
| Validation | StatusTag from the shared validator: "No issues" · "1 warning" · "2 errors" (computed, never permanent; F-FLOW-004) |
| Where it goes live | From the draft's triggers: "Outbound batches only · no inbound number" or "Answers +91 80 •••• 2210 · replaces v4" (F-FLOW-014) |
| Changes | "New flow · 6 steps" or "3 steps added · 1 changed · **Open diff**" |
| Footer | Skip step · **Open in Flows** (secondary) · primary **Review and publish…** |

- The primary opens the **Publish gate** sheet (640, modal) over the Assistant page with its checks, diff, "where it goes live", note and **Publish v1** (or "Publish with 1 warning"). With errors the card's primary is `aria-disabled`: "Fix 2 errors to publish · **Open in Flows**".
- **After publishing:** Done: "v1 is live on outbound batches · **Roll back…**" (version menu). There is no Undo for a publish.
- **Role:** if publishing is admin-only, the step is Blocked: "Only admins can publish flows. Ask an admin to publish the draft from Flows. **Copy link to the draft**".
- The word "activate" is retired. A request to "activate" a flow produces a Publish step.

### 10.6 Drafts

- A **new draft flow** is created as "Not published" in Flows with a unique name (a clash is resolved by asking: "A flow called Sales qualifier exists. Name this one…"). It passes through the shared validator, and the Card shows its issue count.
- **Edit draft** writes to the draft revision only, with `If-Match`. A 409 fails the step: "This draft changed while I was working. **Review the latest**, then ask again." The card repeats the live note: "Callers hear v4 until you publish." Live is never touched (F-FLOW-001).
- From a document: the Draft step reads the attachment; the reply summarises what it drafted and where the text came from ("6 steps from brochure.pdf, pages 1–3").

### 10.7 What the Assistant never does (tested in §21)

1. Dial, publish, delete or change records without the step's guard, in any mode, for any role.
2. Act on a suggestion click, a spoken phrase or a keyboard shortcut outside a card or gate.
3. Touch billing, autopay, settings, roles, API keys, webhooks or sign-in methods.
4. Report a result the server did not confirm ("Called 12 leads" when 10 were scheduled).
5. Replace Live, or replace a draft without a diff the user applied.
