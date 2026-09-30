### 2.14 Microcopy (before → after)

| Before (today) | After |
|---|---|
| Eyebrow "AUTONOMOUS TASKS" · H1 "Personal Agents" (Sora 30) | No eyebrow · H1 "Personal agents"; meta "3 tasks · 1 waiting for you" |
| "Give your agent open-ended goals. It works persistently on its assigned number and contacts you to confirm anything irreversible. Tasks survive restarts — state lives in the task row." | "Give an agent a goal instead of a script. It calls, messages and looks things up from its own number until the job is done, and asks you before anything it can't undo." (first use only) |
| "WHAT'S THIS FOR?" · "A Personal Agent is a voice agent you hand a goalinstead of a script…" | "Start from a template" (the explanation lives in the description and in "How personal agents work") |
| Grey cards "Outbound follow-ups", "Multi-step errands", "Standing jobs" (not clickable) | Same titles as template buttons with "Use template"; "Standing jobs" reads "Goals that repeat on a schedule, like a weekly digest." |
| "Use this when a job needs several steps or its own phone line — for a single scripted call flow, use the Flow Builder instead." | "For one scripted call, build a flow instead." (link **Flows**) |
| "SETTINGS" · "REFRESH" · "+ NEW TASK" | "Agent settings" · "Refresh" (then "Updated 11:24 am") · "New task" |
| "No tasks yet. Click New task to give your agent a goal." (plain text, not a button) | "Tasks you give your agent appear here with their progress." + a real **New task** button |
| "NEW AGENT TASK" (inline panel) · "GOAL" · "e.g. Research the top 3 CRM vendors…" | Sheet "New task" · "Goal" · placeholder "Call the leads in my Callbacks due view and agree a new time with each…" · hint "Say what done looks like. The agent plans the steps." |
| "CAPABILITY HINT (OPTIONAL)" · 14 flat options incl. "Homework Analysis", "Stock Research" | "Main tool (optional)" · grouped by job; consumer items hidden in business workspaces |
| "START TASK" · "CANCEL" | **Start task** (or **Schedule task**) · **Cancel** |
| Pink box with the raw server error / "Failed to fetch" | "Couldn't load your tasks. Check your connection and try again. **Retry**" (raw text under Details) |
| "No number assigned yet. Provisioning is admin-assigned — contact your administrator to get a number for your personal agent." (only on the settings page) | On the page: "No phone number yet. Your agent can research and write, but can't call or message anyone until an admin assigns one. **Ask an admin**" |
| "← BACK TO SETTINGS" · "← Settings" · H1 "Personal Agent" · "Tune how autonomous your personal agent is and how it reaches you." | Breadcrumb "Personal agents" · H1 "Agent settings" · "Choose what your agent may do on its own and how it reaches you." |
| "CONTACT PREFERENCE" · "The agent calls your assigned number to confirm / update." | "How your agent reaches you" · "Calls you at +91 ••••• 4821 to confirm and report." |
| "CAPABILITY AUTONOMY" · "Auto = the agent acts without asking. Confirm = it parks and contacts you first. Confirm + 2FA = confirmation plus strong-auth." | "What it may do on its own" · "Auto: does it without asking." · "Confirm: pauses and asks you first." · "Confirm + 2FA: asks you, then you confirm with your second factor." |
| "Stock Trade (live) — LOCKED … coming soon. Pinned at Confirm + 2FA." | Hidden in business workspaces; "Payments · Always asks, with two-factor authentication" where money is involved |
| "SAVE SETTINGS" (always on) | The UnsavedChangesBar: "Unsaved changes · 2 fields · Discard · **Save changes**" |

### 2.15 Accessibility (Personal agents)

- **Structure.** One H1; H2 "Before your agent can work", "Waiting for you", "Start from a template" (first use), "Tasks"; the table has a hidden caption "Tasks, needing you first, then newest" (F-A11Y-026, F-A11Y-018).
- **Readiness.** A `ul` of rows; each row's sentence precedes its action link; the summary `StatusText` is `role="status"`, so a change ("can't call or message") is announced once. Blocking rows carry an icon and a word, never colour alone.
- **ApprovalCard.** `role="group"` labelled by its title (AS §10.3); recipients in a real list; the message preview has `lang`; the primary's name repeats the verb and count; decisions are announced ("Sent 3 messages") and focus moves to the result line.
- **New task.** Focus lands in Goal; the sheet is `role="dialog"` with `aria-modal`; contacts and channels are `radiogroup` / checkbox group with legends; **Edit limits** is a disclosure with `aria-expanded` and `aria-controls`; errors follow C §8.2 (V4: the error summary for this long form); limits read in words ("Stops after 20 calls or ₹200…").
- **Autonomy rows.** Each SegmentedControl is a `radiogroup` named by its capability ("Calls: what the agent may do on its own"), with arrow keys; locked rows expose `aria-disabled` and the reason via `aria-describedby` (F-A11Y-016).
- **Tables and targets.** Rows are focusable with one tab stop for the body (N §7.9); **Review…** names its task ("Review Chase this week's overdue EMIs"); every target ≥ 24 px (44 on touch) (F-A11Y-023, F-A11Y-024).
- **Contrast and type.** No `black/20` or `white/10`; template text `--text-2` on `--surface` (8.76:1); no text under 12 px; no tracked caps (F-VIS-003, F-A11Y-008). Primary label white on Neel (F-A11Y-009).
- **Motion.** No loops at all on this page; sheets fade under reduced motion.
- **Zoom.** At 200% the phone layout applies; Personal agents is in More (F-RWD-001).

### 2.16 Responsive summary (Personal agents)

| Width | Layout |
|---|---|
| ≥ 1440 | Sidebar; single main column; task sheet docks at 440 (the main column keeps 768 px); P1–P3 columns |
| 1280–1439 | Sidebar; sheets overlay the right third; P1–P3 |
| 1024–1279 | Rail; P1–P2 (Task, Status, Progress); "Agent settings" folds into ⋯; templates 3 across from 900 px, else 2 |
| 768–1023 | TopBar; header row with meta, ⋯ and **New task**; readiness actions stay on the right; ApprovalCards full width; ViewTabs scroll; Task and Status pinned; modal full-height sheets; Agent settings in the 720 column with 44 px segments on coarse pointers |
| 320–767 | TopBar + BottomBar (More is current); header row keeps **New task** visible (F-RWD-007); readiness collapsed to one 44 px row; ApprovalCard primary on its own full-width row, then Edit… and Skip step side by side; tasks as ListRows; New task and the task sheet full screen with sticky footers; autonomy controls full width under their text |

### 2.17 Telemetry (optional)

| Event | Properties | Question it answers |
|---|---|---|
| `pa_readiness_view` | `blocking` (none, number, contact) | How many people arrive blocked? |
| `pa_ask_admin` | `mode` (request, copied) | Does the number request reach admins? |
| `pa_task_new_open` | `source` (header, template, empty, duplicate, meeting_item, palette, shortcut) | Where do tasks start? |
| `pa_task_start` | `contacts` (me, view, specific, new_people), `channels` count, `hasLimits`, `repeats`, `blockedChecks` | What kinds of tasks are delegated? |
| `pa_confirmation_decision` | `decision` (approve, edit, skip, expired, elsewhere), `latencyBucket`, `kind` (message, call, money) | Are approvals fast enough, and where are they made? |
| `pa_task_end` | `state` (done, failed, cancelled, stopped_limit), `durationBucket` | Do tasks finish? |
| `pa_autonomy_change` | `capability`, `from`, `to` | How much autonomy do people grant? |
| `pa_settings_save` | `fieldsChanged` | Is the settings page used? |

No goal text, message text, names, numbers or amounts leave the product in analytics; routes are templates.

### 2.18 Acceptance criteria (Personal agents)

- [ ] `/settings/personal-agent` returns a 308 to `/personal-agents/settings`, which has one breadcrumb ("Personal agents") and keeps the Personal agents nav item current.
- [ ] No Sora, no tracked eyebrow, no `black/*` or `white/*` utilities, no text below 12 px; H1 "Personal agents" uses `title-20` (lint and snapshots, both themes).
- [ ] Without an assigned number, the page shows the blocking readiness row with **Ask an admin** (members) or **Assign a number** (admins) before any task content.
- [ ] With every readiness row passing and at least one task, readiness is a single line; when a row stops passing it expands and announces once.
- [ ] Template cards are buttons; each opens New task with its goal, contacts and limits filled in.
- [ ] **New task** opens a modal gate sheet with focus in Goal; Esc on a changed form shows "Discard this task?" in the footer; nothing starts with an empty or whitespace goal ("Describe the goal in a sentence.").
- [ ] Ticking Calls or WhatsApp without a number blocks **Start task** with the number sentence; unticking both unblocks it.
- [ ] At a ₹0 wallet with Calls ticked, the wallet row blocks **Start task**; the cost line always shows a range or the interim rate and the cap.
- [ ] **Start task** creates exactly one task even when pressed twice; the new task appears first in Active and opens in the task sheet at ≥ 1024.
- [ ] A pending decision appears once in Waiting for you and in its task's Progress tab; deciding in either place (or on WhatsApp) updates both and the nav badge.
- [ ] A call decision opens the Call gate; nothing places a call from an ApprovalCard or a key press; a money decision requires "Confirm it's you".
- [ ] Every task state renders its word, icon and progress sentence from `lib/status.ts`; Stopped at limit offers **Raise limit…**.
- [ ] **Cancel task…** is in ⋯ only, confirms with **Keep task** focused, and never appears in a footer.
- [ ] A failed task list request shows the error sentence with Retry and never the "no tasks" empty state; raw server text appears only under Details.
- [ ] Consumer capabilities are absent from New task and Agent settings unless the workspace flag is on.
- [ ] Agent settings saves through the UnsavedChangesBar only; leaving with changes asks first; Payments cannot be set below Confirm + 2FA.
- [ ] At 320, 360 and 390 px, **New task** is visible in the header row without sideways scrolling, and every action is at least 44 × 44.
- [ ] axe reports no violations in both themes on the page, the New task sheet, the task sheet and Agent settings; the Goal field, contacts group and each autonomy control have programmatic names.
