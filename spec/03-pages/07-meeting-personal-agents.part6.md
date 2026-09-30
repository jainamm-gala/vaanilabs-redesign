## 2. Personal agents (`/personal-agents`, `/personal-agents/settings`)

### 2.1 Purpose and job to be done

**Primary job:** *When I have a job that takes several steps or several people (chase this week's overdue EMIs, call new leads and book site visits, research three vendors and brief me), I want to give an agent the goal, who it may contact and how far it may go, then watch its progress and approve anything it can't undo, so the job gets done without me writing a flow or making the calls.* The user is the "individual delegator": a sales lead, an operations manager or a founder (01-product-understanding part 1).

**Secondary jobs:** decide once how the agent reaches me and what it may do alone; see what a task did, spent and found; pause, resume or cancel a task; start from a template; turn a meeting's action item into a task.

**Not this page's job:** one scripted call (Flows, then Cockpit), a fixed-script batch to a lead list (Leads › Call gate), assigning numbers (Settings › Phone setup, admins), and topping up (the Top-up sheet, KB §2.7).

### 2.2 Findings addressed and what changes

| Finding | Today | Change |
|---|---|---|
| F-UX-039 (medium) | The blocking "no number" prerequisite appears only on an orphan settings page; New task is an inline panel (focus stays on the trigger, Esc does nothing, Cancel keeps the draft, "No tasks yet" shows under it); Start Task is enabled with an empty goal; no contacts, deadline, schedule, spend or call cap; example cards look disabled and do nothing; "goalinstead"; "state lives in the task row" | **Readiness** checklist above everything (§2.6); **New task** is a gate sheet with focus, Esc and discard handling (§2.9); the goal is required; **Who it can contact** and **Limits**; templates are real buttons; copy fixed |
| F-UX-040 (medium) | 14 capabilities mix business items with "Homework Analysis", "Stock Research" and a "coming soon" "Stock Trade (live)" | Consumer items hidden unless the workspace flag is on (PA5); the rest grouped by job with a one-line description (§2.11) |
| F-UX-015 (medium) | The page promises "its assigned number"; four names for numbers | Readiness row "Phone number" using the glossary; admins get **Assign a number** (Settings › Phone setup) |
| F-UX-019 (medium) | `/tasks` 500 prints the raw server string in a pink box above "No tasks yet"; offline shows "Failed to fetch"; no Retry | `TableState` error with a sentence and Retry; never an empty state for a failed request (§2.12) |
| F-UX-025 (medium), QA-A-14 | START TASK enabled with an empty goal | One validation rule (C §8.2): "Describe the goal in a sentence." on submit |
| F-UX-017, EXPLORE-CORE-26 | Settings has "← BACK TO SETTINGS" and "← Settings"; no nav item is current | `/personal-agents/settings` with one breadcrumb "Personal agents"; the Personal agents nav item stays current |
| F-VIS-003 (high) | Grey `black/20` cards at 2.2:1 with invisible `white/10` borders | `Card` tokens: `--surface`, `--border`, `--text-3` 5.62:1 |
| F-VIS-001, F-VIS-005, F-VIS-006 | 30 px Sora H1 under a 2.5 px-tracked eyebrow; no header bar; mono 11 px caps buttons with an invisible border; Refresh that doesn't spin | `PageHeader`, Button variants, RefreshButton recipe (C §2.6) |
| F-VIS-034 | Left-biased 1,120 px column; 42 px of stray scroll; scrollbar shift | Fluid data page; `scrollbar-gutter: stable` (base.css) |
| F-A11Y-003 (high) | Goal textarea and capability select unlabelled | Every control in a `Field` |
| F-A11Y-008, F-A11Y-009 (high) | Card text 2.2:1; 10 px tracked labels at 3.8:1; black on blue 3.83:1 | Tokens; Neel primary with a white label (7.68:1) |
| F-A11Y-016 (medium) | NEW TASK disclosure without `aria-expanded` | A dialog-role sheet with its own title and focus management |
| F-A11Y-023, F-A11Y-026 | 5 of 13 phone targets under 44 px; only an H1 | Touch density; H2 per section |
| F-RWD-007 (medium) | The header never wraps; New task is pushed off-screen below about 440 px | `PageHeader` wraps (N §2.7); on phones the primary sits in the header row with `labelShort` |
| F-RWD-001 (high) | No phone route | In the More sheet (Shell §2.2) |
| 00-summary §4 strengths | Autonomy levels, contact preference, explainer | Kept and made clearer (§0.1) |

### 2.3 Information hierarchy

1. **First: can my agent work?** The **Readiness** checklist (number, how it reaches you, what it may do alone). It is expanded only when something blocks or on first use; when everything passes it is one line.
2. **Second: what is waiting for me?** **Waiting for you**: one `ApprovalCard` per pending decision. These block tasks, so they come before the list.
3. **Third: how are my tasks doing?** The task table: status, progress against limits, spend, freshness.
4. **Fourth: start something.** **New task** (header primary) and, on first use, **Start from a template**.

### 2.4 Layout

**Desktop ≥ 1440, working state** (sidebar 232 · main 768 · docked task sheet 440). Without an open task the main column takes the full 1208 px. The header meta and the nav badge come from the same server counts (Shell §2.2).

```
┌ Sidebar 232 ┬ Personal agents  3 tasks · 1 waiting for you  [Agent settings] [↻] [+ New task] ┬ Task sheet 440 ─────────────────┐
│ Operate     │ ✓ Ready · +91 80 •••• 2210 · confirmations on WhatsApp · Agent settings        │ Chase this week's overdue EMIs × │
│  Cockpit    │                                                                                 │ ⏸ Waiting for you · since 9:12 am │
│  Assistant  │ Waiting for you · 1                                                             │ Progress   Activity   Details    │
│  Rep console│ ┌ Send payment links to 3 people on WhatsApp ─────────────────────────────────┐ │ Plan                             │
│  Meetings   │ │ From: Chase this week's overdue EMIs · asked 4 min ago                       │ │ ✓ Find overdue EMIs · 5 found    │
│ ▸ Personal  │ │ Lead 1042 · Pune · ₹12,400 due                                               │ │ ✓ Call each person · 5 calls,    │
│   agents    │ │ Lead 1187 · Nashik · ₹8,900 due      and 1 more · View all 3                 │ │   3 promised to pay              │
│   1 to conf.│ │ 3 WhatsApp messages from +91 80 •••• 2210 · messages can't be unsent         │ │ ⏸ Send payment links · waiting   │
│ Build       │ │                                    [Skip step] [Edit…] [Send 3 messages]     │ │   for you · Review               │
│  Flows      │ └──────────────────────────────────────────────────────────────────────────────┘ │ ○ Message you a summary          │
│  Knowledge  │ Active 3   Waiting for you 1   Done 12   All 15                                 │ Limits                           │
│ Data        │ [⌕ Search tasks…                ]                                          3    │ Calls      5 of 10               │
│  …          │ Task ↕                         Status             Progress        Spent       ⋯ │ Spent      ₹42.80 of ₹200        │
│             │▌Chase this week's overdue EMIs ⏸ Waiting for you  3 of 4 steps   ₹42.80      ⋯ │ Due        Fri 3 Oct, 6:00 pm IST │
│             │ Call new leads, book visits    ▶ Working          7 of 20 calls  ₹96.10      ⋯ │                                  │
│             │ Weekly competitor price digest ◷ Scheduled        Next Mon 9 am  ₹0.00       ⋯ │ [Pause task]                     │
│             │ 1–3 of 3 tasks                                                  ‹ ›             │                                  │
├─────────────┴─────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┤
│ Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │ Wallet ₹2,340.50 · about 16 h of calls │ Shortcuts  Search │ 28
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Desktop, first use with a blocking prerequisite** (`PageHeader variant="overview"`: the description shows only while there are no tasks).

```
┌ Sidebar ┬ Personal agents ·································································· [Agent settings] [+ New task] ┐
│         │ Give an agent a goal instead of a script. It calls, messages and looks things up from its own number until   │
│         │ the job is done, and asks you before anything it can't undo. For one scripted call, build a flow instead.     │
│         │ Before your agent can work                                                              1 of 3 ready         │
│         │ ⚠ No phone number yet. Your agent can research and write, but can't call or message       [Ask an admin]     │
│         │   anyone until an admin assigns one.                                                                          │
│         │ ✓ Confirmations go to WhatsApp · +91 ••••• 4821                                            Change            │
│         │ ⓘ Calls and messages ask you first.                                                        Review            │
│         │ Start from a template                                                                                         │
│         │ ┌ Outbound follow-ups ───────────────┐ ┌ Multi-step errands ─────────────────┐ ┌ Standing jobs ───────────────┐ │
│         │ │ Payment reminders, lead call-backs,│ │ Research, compare, draft, then call │ │ Goals that repeat on a       │ │
│         │ │ appointment confirmations.         │ │ you with the result.                │ │ schedule, like a weekly      │ │
│         │ │ Use template                     → │ │ Use template                      → │ │ digest. Use template       → │ │
│         │ └────────────────────────────────────┘ └─────────────────────────────────────┘ └──────────────────────────────┘ │
│         │ Tasks                                                                                                         │
│         │                     Tasks you give your agent appear here with their progress.                               │
│         │                                            [New task]                                                          │
```

**Laptop 1280–1439.** As desktop; the task sheet overlays the right third (non-modal). **Laptop 1024–1279** (rail): P1–P2 columns (Task, Status, Progress); "Agent settings" folds into ⋯; the template cards stay three across from 900 px of content, else two.

**Tablet 768–1023.** TopBar with "Personal agents". Header row: meta, `[⋯]` (Agent settings, Refresh, How personal agents work) and **New task**. Readiness rows keep their action on the right. ApprovalCards full width. ViewTabs scroll with the edge fade. Table: Task and Status pinned, Progress if it fits, ⋯ pinned. Sheets modal, full height.

**Phone 320–767** (Personal agents is in More). Touch density; the New task sheet and the task sheet are full screen.

```
┌ Personal agents       [₹2,340][⌕] ┐ 52
│ 3 tasks · 1 waiting  [⋯][New task]│ 48
│ ✓ Ready · WhatsApp · Settings      │ collapsed readiness (44 px row, whole row is the link)
│ Waiting for you · 1                │
│ ┌────────────────────────────────┐ │
│ │ Send payment links to 3 people │ │ title-14
│ │ on WhatsApp                    │ │
│ │ From: Chase this week's overdue│ │ meta-12
│ │ EMIs · 4 min ago               │ │
│ │ Lead 1042 · ₹12,400 due        │ │
│ │ and 2 more · View all          │ │
│ │ 3 messages · can't be unsent   │ │
│ │ [Send 3 messages             ] │ │ primary, own full-width row
│ │ [Edit…         ] [Skip step   ]│ │ 1:1 row
│ └────────────────────────────────┘ │
│ Active 3  Waiting 1  Done 12  All →│ 40, scrolls
│ [⌕ Search tasks…                ]  │ 44
├────────────────────────────────────┤
│ Chase this week's o… ⏸ Waiting     │ ListRow line 1
│ 3 of 4 steps · ₹42.80 · 4 min ago  │ line 2
│ Call new leads, book… ▶ Working    │
│ 7 of 20 calls · ₹96.10 · just now  │
│ 1–3 of 3                   ‹  ›    │
├────────────────────────────────────┤
│ BottomBar · More current           │ 56
└────────────────────────────────────┘
```

### 2.5 Components used (by spec name) and configuration

| Region | Component | Configuration |
|---|---|---|
| Page header | `PageHeader` (N §2), `navId="personal-agents"` | `variant="overview"` with the description while the user has no tasks, then `variant="page"`. Meta "3 tasks · 1 waiting for you" (server counts). Actions: tertiary **Agent settings** (link to `/personal-agents/settings`), `RefreshButton` (C §2.6, icon-only with tooltip at < 1280), overflow ⋯ with **How personal agents work** (opens `Popover variant="info"`); primary **New task** (`plus`, tooltip `Kbd` N) |
| Wallet | `WalletNotice page="personal-agents"` (O §10.2) | Page scope under the header, standard ladder. The New task gate and ApprovalCards repeat the reason where they block (rung 4) |
| Readiness | `GateChecklist` (G §2, `context="inline"`, `collapse="all-pass"`) in a `section` with `h2` "Before your agent can work" | §2.6; collapses to one `StatusText` line when every row passes |
| Templates | `Card variant="interactive"` ×3 (N §4.3) in a `role="list"` | §2.6; shown on first use; afterwards inside the New task sheet |
| Waiting for you | `h2` + one `ApprovalCard` (AS §10.3, variant `task-step`, §3) per pending decision | §2.7 |
| Task list | `ViewTabs` (N §3): Active · Waiting for you · Done · All, with server counts; `FilterBar` (N §6) with `SearchInput` "Search tasks…"; `DataTable` (N §7) `id="agent-tasks"` | Columns: **Task** (P1, key link = the goal's first sentence, truncated at 48ch with the full goal in a tooltip; no `translate="no"`, because a goal is a sentence, not a name; `mobile: title`) · **Status** (P1, `StatusTag domain="agent-task"`, §4; `mobile: titleTrailing`) · **Progress** (P1, `StatusText sm`: "3 of 4 steps", "7 of 20 calls", "Next Mon 9:00 am IST"; `mobile: meta`) · **Spent** (P2, `formatMoney`, "₹42.80 of ₹200" when capped; right; `mobile: meta`) · **Updated** (P2, `formatWhen`; `mobile: meta`) · **Due** (P3) · actions: inline **Review…** on waiting rows (opens the sheet on its ApprovalCard), ⋯ |
| Row menu | `Menu` | Open · Pause / Resume · Duplicate as new task… · separator · **Cancel task…** (danger, tier 2) |
| Task sheet | `Sheet variant="record"` 440 (O §4.1) with `PanelTabs` Progress · Activity · Details | §2.10 |
| New task | `Sheet variant="gate"` 640, modal | §2.9 |
| Settings | `PageHeader variant="nested"` (breadcrumb "Personal agents", H1 "Agent settings"); form sections in the 720 px column; `UnsavedChangesBar` (O §18.3) | §2.11 |
| Feedback | `Toast`, `TableState`, `SectionError`, `InlineError`, `EmptyState`, `Skeleton` | §2.12 |
