### 2.6 Readiness and templates

**Readiness** (`GateChecklist`, G §2 with `collapse="all-pass"`, fed by `GET /api/personal-agents/readiness`; `section` with `h2` "Before your agent can work" and a summary `StatusText`). It sits directly under the header (and under the WalletNotice when one shows). Rows:

| Row | `pass` | `advisory` | `blocking` | Action |
|---|---|---|---|---|
| **Phone number** (PA4) | "Works from +91 80 •••• 2210." | none | "No phone number yet. Your agent can research and write, but can't call or message anyone until an admin assigns one." | Members: **Ask an admin** (sends a request when PA4 ships; until then copies "Please assign me a personal-agent number in Vaani Labs, Settings › Phone setup." and toasts "Request copied. Send it to an admin."). Admins: **Assign a number** (`/settings/phone`) |
| **How it reaches you** | "Confirmations go to WhatsApp · +91 ••••• 4821." | "Your WhatsApp number isn't verified. Confirmations go by email until it is. **Verify**" | "There's no way to reach you. Add a phone number or email in your profile." | **Change** (`/personal-agents/settings#contact`) |
| **What it may do alone** | none | "Calls and messages ask you first." or "Calls run on their own within each task's limits." (an informational row) | none | **Review** (`#autonomy`) |

Summary sentence: "Ready" (success) · "Your agent can't call or message yet" (danger, the blocked tone of G §2.3, when the number row blocks) · "Checking…" (progress). A blocked number does **not** disable New task: research and writing tasks still run; the New task gate blocks only tasks that need calls or messages (§2.9).

**Collapsed** (every row passes and the user has at least one task): one row, `StatusText` success "Ready · +91 80 •••• 2210 · confirmations on WhatsApp · **Agent settings**". On phones: "Ready · WhatsApp · Settings", the whole 44 px row being the link. The list re-expands by itself when any row stops passing, and the change is announced once ("Your agent can't call or message: no phone number").

**Start from a template** (PA6; `h2`, then three `Card variant="interactive"` in a `role="list"`, each a `button`). Title `title-14`; description `body-14` `--text-2`; a trailing "Use template" with `arrow-right` 16. Activating opens New task with `?new=1&template=<id>`. The cards are shown on first use; afterwards the same templates live at the top of the New task sheet.

| Template | Description | Goal it fills in | Suggested contacts and limits |
|---|---|---|---|
| Outbound follow-ups | "Payment reminders, lead call-backs, appointment confirmations." | "Call the leads in my Callbacks due view, agree a new time with each and update their status." | Leads in a view · 20 calls · ₹200 · today 7 pm IST |
| Multi-step errands | "Research, compare, draft, then call you with the result." | "Compare three CRM tools for a 20-person sales team, draft a one-page comparison and call me when it's ready." | Only me · 1 call · ₹20 · in 2 days |
| Standing jobs | "Goals that repeat on a schedule, like a weekly digest." | "Every Monday at 9 am, send me a summary of competitor price changes on WhatsApp." | Only me · WhatsApp · repeats weekly |

### 2.7 Waiting for you (confirmations)

Shown only when PA2 reports pending decisions: `h2` "Waiting for you" + `CountBadge`, then one **ApprovalCard** (AS §10.3) per decision, soonest-to-expire first; more than three show three and "Show all 5 waiting" (switches the ViewTab to Waiting for you). Cards are inline, not modal: the user can read the list and open the task while a card waits (AS §10.3).

| Part | Content |
|---|---|
| Title | Verb + object + count: "Send payment links to 3 people on WhatsApp" · "Call 3 people who aren't in this task's list" · "Pay ₹4,999 for a listing upgrade" |
| Meta | "From: **Chase this week's overdue EMIs** · asked 4 min ago · expires in 2 h" (the task name opens the task sheet) |
| What changes | Recipients: first three rows ("Lead 1042 · Pune · ₹12,400 due") and "and 1 more · **View all 3**"; or the message itself in a `passage` block with `lang` set (Hindi in Devanagari); or a `KeyValueList` for other steps |
| Checks | `GateCheckRow`s from the server: "1 person is on the DND list · skipped" (advisory, adjusts the count) · "Outside messaging hours. Sends at 10 am IST." (advisory) · "Wallet is ₹0. **Top up** so your agent can call." (blocking) |
| Impact line | "3 WhatsApp messages from +91 80 •••• 2210 · messages can't be unsent" or, for calls, "3 calls · about 1 to 2 min each · ₹7 to ₹15" |
| Footer | **Skip step** (tertiary) · **Edit…** (secondary; edits recipients or the message inline) · the primary repeating the verb and count: **Send 3 messages** |
| Calls | The primary is **Review and call…**, which opens the `CallGate` for this batch (G §5.1, `settings="readonly"`, launched with this decision's idempotency key, G §5.7); only the gate's Start places calls (P3, AS §10.4) |
| Money (Confirm + 2FA) | The primary is **Approve with 2FA…**, which opens "Confirm it's you" (ST §5, PA7) and then runs the step. Without 2FA set up: blocked with "Turn on two-factor authentication to approve payments. **Security settings**" |
| Decided elsewhere | A reply on WhatsApp or a call updates the card live: "Approved on WhatsApp at 9:20 am", then it collapses into the task's Activity; announced once, politely |
| Expired | "Expired at 11:12 am · the agent skipped this step" (the card collapses; the task continues or stops per its plan) |
| Keyboard | `⌘/Ctrl+Enter` inside the card activates the primary; decisions carry an idempotency key, so a double press or a WhatsApp reply racing an in-app click decides once |

### 2.8 Tasks and task states

`StatusTag domain="agent-task"` (added to `lib/status.ts`, §4). Every state has a word, an icon and a progress sentence; the tone follows P2.

| State | Tag (word · icon · tone) | Progress sentence (examples) | In view |
|---|---|---|---|
| queued | Queued · `clock` · neutral | "Starts in a moment" | Active |
| working | Working · `play` · info | "Step 2 of 4 · calling 3 people" · "7 of 20 calls" | Active |
| waiting | Waiting for you · `pause` · warning (the same word, icon and tone as the Assistant's waiting step, AS §9.2) | "Send payment links · waiting 4 min" | Active, Waiting for you |
| scheduled | Scheduled · `calendar-clock` · info | "Next Mon 29 Sep, 9:00 am IST" | Active |
| paused | Paused · `circle-pause` · neutral | "Paused by you at 11:02 am" | Active |
| stopped_limit | Stopped at limit · `octagon-pause` · warning | "Reached the ₹200 spend limit · **Raise limit**" | Active |
| blocked | Blocked · `lock` · warning | "Needs a phone number · **Ask an admin**" | Active |
| done | Done · `check` · success | "3 of 5 promised to pay · summary sent to you" | Done |
| failed | Failed · `circle-x` · danger | "Couldn't reach the calling service. **Retry**" | Done |
| cancelled | Cancelled · `circle-slash` · neutral | "Cancelled by you at 2:40 pm" | Done |

- The Active view sorts "needs you" first (waiting, stopped_limit, blocked), then by Updated, newest first; other views sort by Updated. Sort, view, search and page live in the URL.
- **Pause / Resume** are tier 0 (immediate): toast "Paused 'Chase this week's overdue EMIs' · **Resume**". Calls already in progress finish; nothing new starts.
- **Cancel task…** is tier 2: `ConfirmDialog` "Cancel 'Chase this week's overdue EMIs'?" · "The agent stops now. Calls and messages already sent stay sent, and their records stay in Call reports." · buttons **Keep task** (focused) and **Cancel task** (destructive outline).
- **Duplicate as new task…** opens New task pre-filled with the goal, contacts and limits (never started without the gate).

### 2.9 New task (`Sheet variant="gate"`, 640, modal, `?new=1`)

Opened by the header primary, `N`, a template card, the palette action "New task…", the first-use EmptyState, Duplicate, and **Hand to a personal agent…** on a meeting's action item. Title "New task". The sheet is the task's gate (A4; a form gate, G §5.5): it states what the agent may do, to whom, for how much and until when, and one action starts it.

| # | Field | Component | Rules and copy |
|---|---|---|---|
| 0 | Templates (only when the user has tasks and the goal is empty) | Row of three `Button secondary sm` | "Start from: Outbound follow-ups · Multi-step errands · Standing jobs"; fills goal, contacts and limits |
| 1 | **Goal** | `Field` + `Textarea` (rows 4, max 12), `data-autofocus` | Placeholder "Call the leads in my Callbacks due view and agree a new time with each…". Hint "Say what done looks like. The agent plans the steps." Required, trimmed: "Describe the goal in a sentence." Soft limit 2,000 characters. From a meeting: a `StatusText` under the field, "From Weekly demo · 23 Sep 2026 · action item 2", linking back |
| 2 | **Who it can contact** | `RadioGroup` (stacked, each with a description) | **Only me** (default): "It reports to you and asks you questions. It contacts no one else." · **Leads in a view**: reveals a `Select` of Leads views with counts ("Callbacks due · 18") · **Specific leads**: reveals a `MultiSelect` searching leads by name or phone (tokens "Lead 1042" …) · **New people it finds**: "It asks you before contacting each new person." |
| 3 | **How it may reach them** | `CheckboxGroup` | Calls · WhatsApp messages · Email. Each description shows the autonomy from settings: "Runs on its own within the limits" (Auto) or "Asks you first" (Confirm); link **Change in Agent settings**. Hidden when the contact choice is Only me (it always reaches you by your contact preference) |
| 4 | **Limits** | `LimitsSummary` (new, §3) | Sentence "Stops after 20 calls or ₹200, by Fri 3 Oct, 6:00 pm IST." + **Edit limits** (`aria-expanded`) revealing: Max calls `NumberInput` (1 to 200: "Enter a number from 1 to 200.") · Spend limit `CurrencyInput` (₹50 to ₹10,000) · Finish by `DatePicker` + `TimeField` (IST; "Pick a time after now.") · Repeats `Select` (Doesn't repeat · Every weekday · Every week on … · Every month on …) with its time. Defaults from Agent settings (§2.11). Hidden until PA3 (§0.2) |
| 5 | **Main tool** (optional) | `Select` with groups | "Let the agent decide" (default) · Sales follow-up: Calls, WhatsApp messages · Scheduling: Book appointments · Research: Web research, News digest · Documents: Read PDFs, Read spreadsheets, Draft a document, Make a spreadsheet, Make a presentation · Knowledge: Look up your knowledge · Meetings: Run a video meeting. The consumer group exists only with PA5 on |
| 6 | **Before it starts** | `GateChecklist` (G §2, `collapse="none"`: every row rendered) | Number: blocking when calls or messages are ticked and no number exists ("This task needs to call or message. No phone number yet. **Ask an admin**, or untick Calls and WhatsApp.") · Wallet: blocking at ₹0 when Calls is ticked, advisory when low (runway) · Contacts: "18 leads in Callbacks due · 2 were called today and are skipped · **Include**" · Calling hours: "Calls only between 10 am and 7 pm IST; it waits outside those hours." · DND: "People on the DND list are skipped." · 2FA: advisory when a capability needs Confirm + 2FA and 2FA is off |
| 7 | **Cost** | Cost row | "Up to 20 calls · about 1 to 2 min each · ₹48 to ₹96 · never more than ₹200." Until median durations exist: "Rate ₹0.04/s · stops at ₹200" (D §8 interim); until PA3: "Rate ₹0.04/s · no spending limit yet" (advisory tone) |

**Footer.** Why-text: "It starts now and messages you on WhatsApp when it needs you." (or the first blocking reason in `--danger-text`) · **Cancel** · **Start task** (primary; **Schedule task** when it repeats or starts later; `⌘/Ctrl+Enter`; loading "Starting…"; idempotency key per opening).

**After Start.** At ≥ 1024 the sheet closes and the new task's record sheet opens (non-modal) with "Queued · planning the steps…", focus on its title; below 1024 a toast "Task started · **View**" and focus on the new row. The row appears first in Active. **Errors:** `InlineError` at the top of the body, "Couldn't start the task. Nothing was charged. **Retry**", fields kept. **Dirty close:** the inline discard state (O §2.5), "Discard this task? Your goal and limits will be lost."
