### 2.10 Task sheet (`Sheet variant="record"`, 440, `?task=<id>&tab=progress|activity|details`)

Non-modal from 1024 (docked at ≥ 1440), modal below. **Header** (O §4.2): title = the goal's first sentence (2 lines, then a tooltip); meta row = `StatusTag` + "since 9:12 am"; actions: **Pause task** / **Resume task** IconButton (`pause` / `play`, `aria-label` names the action), Previous / Next task (`J` / `K` in tooltips), ⋯ (Duplicate as new task…, Edit limits…, separator, **Cancel task…**), Close. **PanelTabs:** **Progress** (default) · **Activity** · **Details**.

| Tab | Content |
|---|---|
| Progress | This task's pending decisions first: the full `ApprovalCard` (the same component as §2.7) when the sheet is an overlay or full screen; when it is docked at ≥ 1440 beside a visible Waiting for you section, a one-line warning `Notice` instead ("**Waiting for you.** Send payment links to 3 people on WhatsApp. **Review**", where Review moves focus to the card), so two live copies of one decision never sit side by side. **Plan**: the agent's steps as a `StageProgress` list (O §14.3) with the step marks added by the Assistant spec (AS §19: waiting, blocked, skipped, expired); each step has a name, a result meta ("5 found", "5 calls · 3 promised to pay") and, when there is evidence, a link ("**View 5 calls**" → Call reports filtered to this task). **Limits**: `KeyValueList` Calls "5 of 10" · Spent "₹42.80 of ₹200" · Finish by "Fri 3 Oct, 6:00 pm IST" · Repeats "Every Monday, 9:00 am IST". **Result** (done): a summary in `read-15` and any files it made as rows (`file-text` · name · size · **Download**) |
| Activity | `Timeline` (N §10), newest last within each day: "Agent called Lead 1042 · promised to pay by Monday · 2m 31s" (links to the call report) · "Sent a WhatsApp message to Lead 1187" · "Asked you: Send payment links (3)" · "You approved on WhatsApp" · "Skipped Lead 1203 · on the DND list" · "Reached ₹200 · stopped". Money events show the amount; "Show older activity" loads 20 more |
| Details | `KeyValueList variant="rows"`: Goal (full text) · Who it can contact · How it may reach them (with each channel's autonomy) · Limits · Repeats · Number (`mono-13` masked) · Confirmations go to · Created by and on · Task id (`mono-12`, Copy). **Edit limits…** opens an inline form in this tab (Standard density, Save changes · Cancel); a limit below what is already used fails with "₹42.80 is already spent. Set a limit above that." |

**Footer** (sticky, everyday action only, O §4.2): Working → **Pause task**; Paused → **Resume task**; Stopped at limit → **Raise limit…** (opens Edit limits); Failed → **Retry task**; Done → **Duplicate as new task…**. Cancel is never in the footer.

### 2.11 Agent settings (`/personal-agents/settings`)

A form page in the 720 px column under `PageHeader variant="nested"`: breadcrumb "Personal agents", H1 "Agent settings", description "Choose what your agent may do on its own and how it reaches you." The Personal agents nav item stays current. One save model: `UnsavedChangesBar` (O §18.3; `⌘/Ctrl+S`; leaving with changes asks "Discard changes to Agent settings?"). Every saved change is written to Settings › Activity (ST) with the actor.

| Section (`h2` + one-line description) | Content |
|---|---|
| **Phone number** (`#number`) · "The number your agent calls and messages from." | Read-only `KeyValueList`: "+91 80 •••• 2210 · assigned by Anika R. on 12 Sep". Unassigned: warning `Notice` (inline) "No phone number yet. Only an admin can assign one." + **Ask an admin** (members) or **Assign a number** (admins, `/settings/phone`) |
| **How your agent reaches you** (`#contact`) · "Where it asks for approval and sends results." | `RadioGroup variant="card"` stacked: **WhatsApp** "Messages you at +91 ••••• 4821. You can reply to approve." · **Call** "Calls you at +91 ••••• 4821 to confirm and report." · **Email** "Emails you at a•••@sample-realty.in." An unverified destination is disabled with its reason: "Verify your WhatsApp number in your profile first." (C §6.2 disabled card). Each card leads with a **ServiceMark** `md` (Settings §7.4 and §14): the WhatsApp single-colour mark, and the Lucide `phone` and `mail` glyphs for Call and Email, all in `--text` on the neutral 28 px tile. Never a letter tile or a brand-green fill; the card's selected state stays the only colour (C §6.2) |
| **What it may do on its own** (`#autonomy`) · "Applies to every task. Calls and messages always stay within each task's limits." | A legend (`KeyValueList` inline): **Auto** "Does it without asking." · **Confirm** "Pauses and asks you first." · **Confirm + 2FA** "Asks you, then you confirm with your second factor." Then `AutonomyRow`s (new, §3) grouped under `h3` by job: Sales follow-up (Calls, WhatsApp messages, Email) · Scheduling (Book appointments) · Research (Web research, News digest) · Documents (Read PDFs, Read spreadsheets, Draft a document, Make a spreadsheet, Make a presentation) · Knowledge (Look up your knowledge) · Meetings (Run a video meeting) · Money (Payments: pinned at Confirm + 2FA, "Always asks, with two-factor authentication"). Consumer capabilities appear only with PA5 on, in a last group "Personal" |
| **Default limits** (`#limits`) · "New tasks start with these. You can change them per task." | `NumberInput` "Calls per task" (default 20, 1 to 200) · `CurrencyInput` "Spend per task" (default ₹200, ₹50 to ₹10,000) · read-only "Calling hours · 10 am to 7 pm IST · workspace setting" with **Change in Phone setup** for admins. Hidden until PA3 |

**AutonomyRow** behaviour: name (`label-13`) and description (`meta-12` `--text-3`) on the left, a `SegmentedControl size="sm"` "Auto · Confirm · Confirm + 2FA" on the right (below the text, full width, under a 560 px container). The workspace defaults (reversible → Auto, irreversible → Confirm, money → Confirm + 2FA; 00-summary §4) are marked with an outline Tag "Default" beside the current choice when it differs. Choosing **Auto** for a capability that contacts people adds an inline neutral `Notice` under the row: "Calls will run without asking, within each task's limits." Locked rows render the control disabled with `lock` and the reason ("Payments always need Confirm + 2FA." · "Your admin set Calls to Confirm for everyone."). A tertiary **Reset to defaults…** ends the section (tier 2 ConfirmDialog, "Reset what your agent may do on its own? Your 3 changes go back to the defaults.").

### 2.12 Personal agents states

| State | Trigger | Treatment and copy |
|---|---|---|
| **First use** | No tasks ever | `PageHeader variant="overview"` with the description; Readiness expanded; **Start from a template**; then `EmptyState variant="first-use"` in the Tasks section (icon `list-checks`): title "No tasks yet", body "Tasks you give your agent appear here with their progress.", and a **secondary** New task (the header already holds the primary) |
| **Blocked prerequisite** | No number | Readiness expanded with the blocking row; the nav shows no badge for it (it is a setup fact, not a waiting decision); New task stays available for research and writing |
| **Loading** | First load | Meta skeleton; Readiness: three `GateCheckRow`s in `checking`; Waiting for you hidden until known (no layout jump: it renders once, with its count); `TableSkeleton` with real headers; `aria-busy` and "Loading tasks…" |
| **Partial** | Readiness or confirmations fail, tasks load | Readiness: `SectionError` "Couldn't check your agent's setup. **Retry**" (the list still shows); Waiting for you: "Couldn't load approvals. **Retry**" in place of the cards, and the Waiting ViewTab count shows "–" |
| **Error, first load** | `/tasks` fails | `TableState` error (`role="alert"` after a user Retry): "Couldn't load your tasks. Check your connection and try again. **Retry**" with Details holding the raw message. No "No tasks yet" underneath (F-UX-019) |
| **Error, refresh** | A poll or Refresh fails with data shown | Rows stay; warning `StatusText` beside the ViewTabs, "Couldn't refresh · **Retry** · Updated 11:24 am" |
| **Offline** | `ConnectionBar` | Cached rows with "Showing tasks from 11:24 am"; New task, approvals, Pause, Resume and Cancel `aria-disabled` "You're offline" |
| **Permission** | Personal agents not enabled for the role (pending the role model) | The nav item is hidden for that role (Shell §2.2); a direct visit renders `Forbidden` in the shell: "Personal agents aren't turned on for your role. Ask an admin (2 in this workspace)." |
| **Wallet low or ₹0** | Wallet state | `WalletNotice` (page scope); New task's wallet row blocks calls at ₹0; call approvals are blocked with "Wallet is ₹0. **Top up** so your agent can call."; working tasks that need calls move to Blocked with that sentence |
| **Waiting for you** | PA2 | Section with ApprovalCards; nav badge "1 to confirm"; a toast "Your agent needs you · Chase this week's overdue EMIs · **Review**" only when the user is on another page (Shell §11) |
| **Filtered to nothing** | Search | "No tasks match 'invoice'." · **Clear search** |
| **All done** | Active view empty, tasks exist | `EmptyState variant="done"`: "No active tasks. Finished tasks are under Done." · **View done** |
| **Success** | Task started, decision made, task done | Task sheet opens on the new task (≥ 1024) or toast "Task started · **View**"; the card collapses into "Sent 3 messages · 9:21 am"; toast "Task done · Chase this week's overdue EMIs · **View result**" when the user is elsewhere |
| **Not found** | `?task=` unknown | The sheet's "Record gone" state: "This task was deleted, or you no longer have access." |

Tasks refresh by push when a live channel exists, else every 30 s while the tab is visible and every 10 s while a task is Working. The polite region announces only state changes: "Chase this week's overdue EMIs is waiting for you", "Call new leads is done", "Stopped at the ₹200 limit".

### 2.13 Interactions and keyboard (Personal agents)

| Key | Where | Does |
|---|---|---|
| `N` | Page, single-key shortcuts on | Opens **New task** |
| `/` | Page | Focuses "Search tasks…" |
| `↑` `↓`, `J` `K` | Task table | Moves the active row; with the task sheet open, the sheet follows |
| `Enter` | Row | Opens the task sheet |
| `⌘/Ctrl+Enter` | New task sheet · inside an ApprovalCard · Edit limits | Start task · the card's primary (never skips a Call gate or 2FA) · Save limits |
| `⌘/Ctrl+S` | Agent settings | Saves (UnsavedChangesBar) |
| `Esc` | Sheet, dialog, menu | Closes (guarded when dirty); focus returns to the row, card or trigger |
| `F6` | Task sheet open | Moves focus between the page and the sheet |
| `?` | Page | Keyboard shortcuts sheet |

No single key approves, sends, calls, pauses or cancels. Template cards are one tab stop each; readiness rows expose only their action link as a stop. **Micro-interactions:** the readiness list collapses to its one line with an opacity change (`--dur-base`, no height animation); a decided ApprovalCard is replaced in place by its result line and focus moves to that line (AS §10.3 Done); Working tasks show their progress sentence updating in place (never a moving bar, never a pulsing dot: the LiveDot belongs to calls and meetings only).
