### 1.5 Components used (by spec name) and configuration

| Region | Component | Configuration |
|---|---|---|
| Page header | `PageHeader` (N §2) `variant="page"`, `navId="meetings"` | Meta "1 live · 12 past" (server counts, `formatCount`; skeleton while unknown, never "0 live"). Actions: tertiary **How meetings work** (`info` icon; opens `Popover variant="info"`, §1.11; icon-only below 1280); overflow ⋯ with **Generate a deck…** and **Usage in Billing**; primary **Start a meeting** (`plus`; tooltip `Kbd` N; `labelShort` "Start") |
| Live now heading | `h2` (`title-16`) + `StatusText size="sm"` meta | "Agent seats: 1 of 3 in use" (MT5); at 3 of 3 the warning tone, "All 3 agent seats are in use" |
| Room cards | `RoomCard` (new, §3), composed of `Card` plain (N §4), `StatusTag domain="meeting-room"` (N §5.3, values extended in §4), `LiveDot`, `Tag tone="outline"`, `IconButton` (copy), `RoomControlRow` ×3 in `summary` mode (new, §3), `Button variant="secondary" size="sm"`, `Menu` | §1.6 |
| Past meetings toolbar | `FilterBar` (N §6) | `SearchInput` "Search titles and notes…" (server, `?q=`, `/` shortcut); `DateRangePicker` (C §7.1; presets Today · Last 7 days · Last 30 days · This month · Custom; default Last 30 days); filter fields Agent (Presented slides · Ran a flow · No agent) and Notes (Summary ready · Notes off); result count "12" |
| Past meetings table | `DataTable` (N §7) `id="meetings"`, framed, Standard density, server pagination (25 default) | Columns: **Meeting** (P1, key link, `translate="no"`, truncate 40ch, `mobile: title`) · **When** (P1, `formatWhen`, default sort descending, `mobile: meta`) · **Length** (P2, `formatDuration`, right, `mobile: meta`) · **People** (P2, count, right, `mobile: meta`) · **Agent** (P3: "Presented slides", "Ran Product demo v3", "No agent") · **Notes** (P1, `StatusTag domain="meeting-notes"`, §4; `mobile: titleTrailing`) · **Cost** (P3, `formatMoney`, right; hidden until MT6) · actions ⋯ |
| Row menu | `Menu` (O §7) | Open notes · Copy summary · Download transcript (.txt) · Hand an action item to a personal agent ▸ (submenu listing items; MT3) · separator · **Delete meeting…** (danger, tier 2) |
| Aside | `AgentProfileCard` (new, §3); `Card` "This month" | This month: `ProgressBar` (O §14.2) label "Free minutes", value "1 of 30 used"; `KeyValueList variant="rows"` (N §8): Free minutes left "29", Agent time "25 min · ₹120.00", Meetings "12"; links "Usage in Billing" (`/billing/usage`) and "Plans" (`/billing/plans`) |
| Sheets | `Sheet` (O §4) | `variant="gate"` Start a meeting (§1.7); `variant="record"` room (§1.8); `variant="detail"` past meeting (§1.9) |
| Other overlays | `Popover variant="gate"` (Add agent, §1.8); `ConfirmDialog` (End room, Start recording, Delete meeting); `Dialog size="md"` (Generate a deck, §1.10); `Popover variant="info"` (§1.11) | |
| Feedback | `Toast`, `SectionError`, `InlineError`, `EmptyState`, `Skeleton` (O §9–16) | §1.12 |

**No WalletNotice on Meetings.** The overlay spec limits it to pages whose main task spends money on calls (O §10.2). Wallet conditions appear where they block: the Start sheet and the Add agent gate (checks and cost line), and a room's agent row. The Baseline wallet segment stays as everywhere.

### 1.6 Live now and the RoomCard

**Anatomy** (a `section` labelled by its title; vertical stack, gap `--space-8`):

| Part | Spec |
|---|---|
| Container | `Card` plain: `--surface`, 1 px `--border`, `--radius-8`, padding `--space-panel-pad` (16), `min-width: 0` |
| Title | `title-14` link that opens the room sheet (`?room=<id>`); `translate="no"`; clamps to 2 lines with the full title in a tooltip |
| State line | `StatusTag` (§4 values) + meta `meta-12` `--text-3` with tabular figures: "18 min · 3 people" (minutes from `startedAt` on the shared 1-minute ticker; people includes the agent) |
| Join line | Room code in `mono-13` `--text` ("qdr-hkte-mzp", truncated from the end) · `IconButton size="sm"` `copy`, name "Copy link for Weekly demo · Sample Realty", tooltip "Copy link" · `Tag tone="outline"` with `lock` "Key required" on key-only rooms |
| Controls summary | Three `RoomControlRow` in `summary` mode: label (`data-13` `--text-3`, 88 px column) + `StatusText size="sm"`. Agent: "In the room · presenting" / "Joins when the first guest arrives" / "Not in the room" / "Joining…" / "Couldn't join". Notes: "On · 42 turns so far" / "Off". Recording: "Recording since 4:30 pm" / "Off". No inline actions: changes happen in ⋯ or the room sheet, so a card can't bill by a stray click |
| Warning line (optional) | `StatusText` warning, one sentence and at most one action: "The agent couldn't join. **Retry**" · "Wallet is ₹0. The agent left at 5:02 pm. **Top up**" |
| Actions | `Button secondary sm` **Open room** (`external-link`; opens `https://meet.vaanilabs.in/<code>` in a new tab, `rel="noopener"`; name "Open Weekly demo in a new tab") · `IconButton` ⋯ "More actions for Weekly demo" |

**Room states** (room domain values are added to `lib/status.ts`, §4):

| State (MT1, MT2) | Tag | Meta | Visible action |
|---|---|---|---|
| Open, nobody yet | `Open` · `door-open` · neutral | "Created 2 min ago · nobody here yet" | Open room |
| Live (at least one person in the room) | `Live` · pulsing `LiveDot` · success | "18 min · 3 people" | Open room |
| Live, the agent joining | `Live` | as above; Agent "Joining…" (progress StatusText) | Open room |
| Live, the agent couldn't join | `Live` | warning line "The agent couldn't join. Retry" | Open room |
| Open for more than 12 h (interim, before MT1's reaper) | `Open 3 days` · `alert-triangle` · warning | "Nobody here since 24 Sep" when MT2 knows it, else "Created 24 Sep 2026" | **End room…** (`destructive` outline sm) |
| Stale (MT1: nobody in the room for 30 min) | `Stale` · `alert-triangle` · warning | "Nobody here for 45 min · closes at 5:10 pm unless someone joins" | **End room…** |
| Ending | `Ending…` · info | none | none; the card leaves Live now when the server confirms |

The `LiveDot` pulses only while someone is in the room (N §5.4) and never under reduced motion. The stale variant replaces **Open room** with **End room…** because ending is the useful next step; it is still the only destructive control on the card and sits 8 px from ⋯.

**⋯ menu** (room): Copy link · Copy invite · Copy key (key-only rooms, while MT9 allows) · separator · **Add agent…** or Remove agent · Turn notes on / off · **Start recording…** or Stop recording · Open room details · separator · **End room…** (danger).

**Section states.** Nothing open: the heading stays and one compact EmptyState line follows, "No rooms are open. **Start a meeting**" (the link opens the Start sheet). More than six open rooms: the first six (live first, then open, then stale) and "Show all 8 open rooms". A room created in this session is inserted first and its title receives focus when the Start sheet closes.

### 1.7 Start a meeting (`Sheet variant="gate"`, 640, modal, `?start=1`)

Opened by the header primary, `N`, the palette action "Start a meeting…", the first-use EmptyState, the Live now empty line and "Use in a meeting" (Generate a deck). Title "Start a meeting". Standard density; fields at `--space-field-gap`, groups at `--space-group-gap`. The form is the gate: it says what the agent will do, what it will cost and what blocks it, and one confirming action creates the room (D P3).

| # | Field | Component | Rules and copy |
|---|---|---|---|
| 1 | **Title** | `Field` + `TextInput md`, `data-autofocus` | Default value "Meeting · 27 Sep, 4:40 pm" (workspace time; the whole value is selected on focus so typing replaces it). Required and trimmed on blur: "Enter a title for the meeting." A title equal to another **open** room's: "A room called 'Weekly demo' is already open. Choose another title, or open that room." (link). Past meetings may share titles; they are told apart by date. Soft limit 80 characters with the count from 90% |
| 2 | **What the agent does** | `RadioGroup variant="card"` (C §6.2), 2 cards in a row at ≥ 560 px | **Present slides**: "Shows slides and answers questions about them. No flow runs." · **Run a flow**: "Talks through a published flow, as it would on a call." Default: the user's last choice, else Present slides |
| 2a | **Slides** (Present slides) | `RadioGroup` (stacked radios) | **Make slides as it talks**: "Builds slides from the conversation and your knowledge." · **Show my deck**: reveals `FileField` "Deck" (C §7.2 single; PPTX or PDF, up to 20 MB) and, when decks exist, a `Select` "Or pick a recent deck". Hint under the group: "No deck yet? **Generate a deck**" (closes the sheet keeping its draft, opens §1.10). Until MT7 only the first option exists, shown as a sentence, not a one-item radio |
| 2b | **Flow** (Run a flow) | `FlowSwitcher purpose="assign"` (C §5.4) | Default: the workspace default flow when it has a live version. Trigger "Product demo · Live v3". Not published flows are disabled with "Not published yet. Publish it to use it in meetings." Hint: "The agent uses the live version. Draft changes aren't used." Choosing never writes the profile (F-UX-014) |
| 3 | **Voice** | `VoicePicker variant="compact"` (N §12.3) | Default the meeting persona (Vikash); options show language marks; the preview plays a real sample. Helper: "Used for this meeting only. **Make default**" (a toast with Undo confirms) |
| 4 | **When the agent joins** | `RadioGroup` (stacked) | **When the first guest joins** (default): "Agent time starts when it joins." · **I'll add it from the room**. Until MT8: a sentence instead, "You'll add the agent from the room. Agent time is charged only while it's in the room." |
| 5 | **Notes** | `Checkbox` with description | "Take notes" · "Transcript, summary and action items after the meeting. Everyone in the room sees that notes are on." Default: last choice, else on. Hidden until MT3 (§0.2) |
| 6 | **Recording** | `Checkbox` with description | "Record the meeting" · "Guests are told the meeting is recorded before they join." Default off. If the server reports that key-only rooms can't be recorded, disabled with that reason (§5 Q4) |
| 7 | **Who can join** | `RadioGroup variant="card"` | **Anyone with the link**: "Guests join from the link. Audio and video are encrypted in transit." · **Only people with the key**: "Guests enter a key before joining. You'll get the key after you create the room." Default: last choice, else Only people with the key (today's default) |
| 8 | **Before you start** | `GateChecklist` (G §2, `collapse="none"`): every row rendered | Rows below |
| 9 | **Cost** | Cost row: `data-13` `--text`, then `meta-12` `--text-3` | "Room time uses your free minutes first (29 of 30 left), then ₹2.40/min." · "Agent time is ₹0.08/s while the agent is in the room, about ₹4.80 a minute." Rates from MT6 (KB BL1); config values until then |

**Checks** (`GateCheckRow`, computed by `GET /api/meetings/readiness`; re-run when mode, voice or deck change):

| Check | `pass` | `advisory` | `blocking` |
|---|---|---|---|
| Wallet (agent time) | "Wallet ₹2,340.50 covers about 8 h of agent time." | Low: "Wallet ₹42.10 covers about 9 min of agent time. **Top up**" · at ₹0 with "I'll add it from the room": "Wallet is ₹0. The agent can't join until you top up. The room still opens on free minutes." (`severity="warning"`) | At ₹0 with "When the first guest joins": "Wallet is ₹0. The agent can't join until you top up." · **Top up** · **Add the agent later** (switches field 4). Wallet ₹0 is not a global blocker here, because a room still opens on free minutes (G §5.5) |
| Free minutes | "29 of 30 free minutes left this month." | "Free minutes are used up. Room time is ₹2.40/min from the wallet." | Only with a ₹0 wallet: "No free minutes left and the wallet is ₹0. **Top up** to start a meeting." |
| Agent seats | "Agent seat available · 2 of 3 free." | "All 3 agent seats are in use right now. End a room before your guests arrive. **Show open rooms**" | none (the agent joins later) |
| Deck (Show my deck) | "Deck ready · 14 slides." | none | `checking` "Uploading deck… 60%" · "Couldn't read this deck. Choose another PPTX or PDF." |
| Recording (when ticked) | none | "Guests are told the meeting is recorded." | none |
| Role | none | none | "Your role can't start meetings. Ask an admin (2 in this workspace)." |

**Footer.** Left why-text (`meta-12`): "You'll get the link next." or, when blocked, the first blocking sentence in `--danger-text`. Right: **Cancel** (tertiary) · **Create room** (primary; `⌘/Ctrl+Enter`; loading "Creating room…"; an idempotency key per sheet opening, so a double press never creates two rooms). Blocking rows make the primary `aria-disabled` with that reason (C §1.6).

**Top up from the sheet.** "Top up" keeps the sheet's draft (session storage keyed by the sheet), closes it and opens the Top-up sheet (one modal at a time, O §1.6). After the payment is confirmed, the success toast offers "**Continue starting Weekly demo**", which reopens the Start sheet with the draft and re-runs the checks.

**Room ready** (the same sheet, body replaced; focus moves to the sheet title, now the room's title, with `StatusText` success "Room ready · created 4:41 pm"):

| Part | Spec |
|---|---|
| Join link | `Field` "Join link": read-only `TextInput` with `https://meet.vaanilabs.in/qdr-hkte-mzp` and a trailing Copy `IconButton` ("Copy join link") |
| Room key (key-only rooms) | `Field` "Room key": read-only, value in `mono-13`, trailing Copy ("Copy room key"). Hint: "Send the key separately from the link, for example in a message. It can't be shown again." (the last sentence only when MT9 says so) |
| Actions | **Copy invite** (secondary): copies "Join 'Weekly demo · Sample Realty' on Vaani Labs: https://meet.vaanilabs.in/qdr-hkte-mzp. You'll be asked for a key; the host will send it." (no key inside) · **Done** (tertiary) · **Open room** (primary, `external-link`, new tab) |
| Agent line | `StatusText`: "Vikash joins when the first guest arrives." / "Add the agent from the room when your guests arrive." |

Copy actions confirm with a toast ("Link copied"). Closing the sheet from Room ready never asks to discard. **Errors:** a failed create shows an `InlineError` at the top of the body, `role="alert"`: "Couldn't create the room. Nothing was charged. **Retry**" with Details; every field keeps its value. **Dirty close** (Esc, ×, outside click) with a changed form swaps the footer to the inline discard state (O §2.5): "Discard this meeting? Your choices will be lost." · Keep editing · Discard.
