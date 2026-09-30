### 1.12 Meetings states

The shell, H1 and header actions render at once (no full-screen loader, F-QA-007); only data regions skeletonise, after 200 ms (O §13). Live data refreshes by push when a live channel exists, else by polling `GET /api/meetings/open` every 15 s while the tab is visible; room minutes tick from `startedAt` on the shared 1-minute ticker. The polite region announces only state changes (debounced): "Weekly demo is live", "Vikash joined Weekly demo", "Weekly demo ended", "Site walkthrough prep has nobody in it". Ticks, costs and counts are never announced.

| State | Trigger | Treatment and copy |
|---|---|---|
| **First use** | No meeting has ever been created | Meta "No meetings yet". Live now and Past meetings are replaced by one `EmptyState variant="first-use"` (icon `video`): title "Meetings you start appear here", body "Open a video room that your meeting agent joins to present slides or talk through a flow. Notes and a summary follow each meeting.", primary **Start a meeting**, link **How meetings work**. The aside still shows the agent profile and "30 of 30 free minutes left this month" |
| **Nothing open** | Rooms exist, none open | Live now keeps its heading with the compact line "No rooms are open. **Start a meeting**" |
| **Loading** | First load | Meta skeleton; Live now: two card skeletons (title bar, state bar, three row bars); Past meetings: `TableSkeleton` with real headers, pager "Loading…"; aside: card skeletons with real titles; `aria-busy="true"` and one hidden line "Loading meetings…" |
| **Partial** | One source fails (seats, usage, participants) | Only that element degrades: Live now meta "Agent seats unavailable · **Retry**"; This month "Couldn't load usage · **Retry**" (`SectionError variant="empty"`); a card's people count "People unknown" |
| **Error, first load** | The rooms or meetings request fails | Live now: `SectionError` "Couldn't load open rooms. **Retry**"; Past meetings: `TableState` error "Couldn't load past meetings. Check your connection and try again. **Retry**". Both failing: `PageError` "Meetings couldn't load. Your rooms and notes are safe. This is a problem on our side or with your connection." with Retry and Details. Never an empty state for a failed request (F-UX-019) |
| **Error, refresh** | A poll or Refresh fails with data on screen | The last good data stays with warning `StatusText` "Couldn't refresh · **Retry** · Updated 4:40 pm" beside the section heading. Join links never change on refresh (today a failed refresh swaps the short link for a room-id URL, F-UX-019) |
| **Offline** | `ConnectionBar` (O §10.3) | Cached data with "Showing data from 4:40 pm"; **Start a meeting**, **Open room**, **Add agent…** and **End room…** `aria-disabled` with "You're offline"; copying links still works |
| **Permission** | The role can't start meetings or end others' rooms (pending the role model) | Primary `aria-disabled`, tooltip "Only admins can start meetings. Ask an admin."; ⋯ **End room…** disabled with "Only the host or an admin can end this room" |
| **Wallet ₹0** | Wallet state | No page banner. Start sheet: the wallet row blocks the agent; a room's Agent row: "Left at 5:02 pm · the wallet reached ₹0 · **Top up**"; the Baseline wallet segment turns amber |
| **Free minutes used up** | Quota | This month: full `ProgressBar` and warning `StatusText` "Free minutes used up · room time is ₹2.40/min"; the Start sheet row becomes advisory |
| **Seats full** | MT5 | Live now meta warning "All 3 agent seats are in use"; Start sheet advisory; Add agent blocking |
| **Stale or long-open room** | MT1 / interim 12 h rule | The card's stale variant (§1.6); header meta adds "· 1 needs attention" |
| **Filtered to nothing** | Search or filters | "No meetings match 'pricing' in the last 30 days." · "Try a shorter search or another date range." · **Clear filters** (O §15.1) |
| **Success** | Room created · agent joined · room ended · notes ready | Room ready step in place (§1.7) · Agent row "In the room" · toast "Ended Weekly demo · writing notes" · the row's Notes cell turns "Summary ready" (announced only if the sheet for it is open) |
| **Not found** | `/meetings/<id>` unknown or deleted | `NotFound` in the shell: "This meeting doesn't exist. It may have been deleted." · **Go to Meetings** |
| **Session expired** | 401 | `SessionExpired` dialog (O §16); the Start sheet draft is kept in session storage |

### 1.13 Interactions and keyboard

| Key | Where | Does |
|---|---|---|
| `N` | Page, single-key shortcuts on | Opens **Start a meeting** (shown in the button's tooltip) |
| `/` | Page | Focuses the past-meetings search |
| `↑` `↓`, `J` `K` | Past meetings table | Move the active row; with a meeting sheet open, the sheet follows |
| `Enter` | Row, room title | Opens the meeting sheet or room sheet |
| `Esc` | Sheet, popover, dialog | Closes (guarded when dirty); focus returns to the row or card title |
| `⌘/Ctrl+Enter` | Start sheet, Add agent gate, Generate a deck (step 1) | Create room · Add agent · Generate 3 options |
| `F6` | A sheet is open | Moves focus between the page and the sheet |
| `Shift+D` | Table | Standard / Compact density |
| `?` | Page | Keyboard shortcuts sheet |

No single key or single click adds the agent, starts a recording or ends a room: each goes through its gate or confirmation. Tab order in a RoomCard: title link → Copy link → Open room (or End room…) → ⋯. Menus mirror as context menus on cards and rows (Shift+F10), and every context action also has a visible address (O §7.2).

**Purposeful micro-interactions** (motion tokens only): Copy swaps its icon to `check` for the toast's life; the `LiveDot` pulses only while someone is in the room; the Agent row's "Joining…" carries a `Spinner sm` bound to the request; sheets slide from their edge (`--dur-slow`) and fade under reduced motion; cards and rows appear without entrance animation. Nothing moves when idle.

### 1.14 Microcopy (before → after)

| Before (today) | After |
|---|---|
| Rail "Meet Agent" · H1 "Meeting Agent — Vikash" · subtitle "Deploy AI agent to video calls" | "Meetings" in nav and H1; meta "1 live · 12 past" |
| "Free minutes: 29 / 30" (pill, to Settings) | "29 of 30 free minutes left this month" (This month card, to Billing › Plans) |
| "CREATE MEETING ROOM" (inline form) | Sheet title "Start a meeting"; primary **Start a meeting** |
| "Meeting Title" pre-filled "Product Demo with Vikash" | "Title", default "Meeting · 27 Sep, 4:40 pm" |
| "Session Mode" · "Presentation (generate/show PPT)" · "Conversation flow" | "What the agent does" · "Present slides" · "Run a flow" |
| "The agent presents a deck — generating slides live (present_topic) or showing an attached one. No flow is run." | "Shows slides and answers questions about them. No flow runs." |
| "The agent follows the selected conversation flow." | "Talks through a published flow, as it would on a call." |
| "Conversation Flow (agent will follow this flow)" · "Active flow (from profile)" | "Flow" · "Product demo · Live v3" |
| "Meeting Privacy" · "Open meeting — Anyone with the meeting link can join. Media uses TLS transport." | "Who can join" · "Anyone with the link" · "Guests join from the link. Audio and video are encrypted in transit." |
| "Encrypted meeting — Guests must enter the private key in the browser before joining." | "Only people with the key" · "Guests enter a key before joining. You'll get the key after you create the room." |
| "Create Room" | **Create room**, then "Room ready" with **Copy invite** and **Open room** |
| "ACTIVE ROOMS" · "ACTIVE" · "1 participant" · "2 joinees ▸" · room id as the name | "Live now" · "Live" · "3 people" · the room title |
| Agent / Intel / Record toggles; red square "Delete room" | "Agent · In the room · Remove agent", "Notes · On · Turn off", "Recording · Off · Start recording…"; **End room…** in ⋯ |
| "AGENT OPERATIONS · AGENTS 1/3 · SLOTS 2 · STALE 0 · RECORDING 0" | "Agent seats: 1 of 3 in use"; stale rooms flagged on their cards |
| "live 82h 31m" | "Open 3 days · nobody here since 24 Sep" + **End room…** |
| "GPU SERVER STATUS Online" · "BACKEND — Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL" | Removed from customer builds |
| "PAST MEETINGS" · "23 Sept 2026" · URL + Copy URL only | "Past meetings" · "23 Sep 2026" · Notes column and the Summary · Transcript · Action items sheet |
| "Vikash — AI Meeting Agent" · "VOICE Male Indian (Hindi)" · "ROLE AI Product Expert" · "CAPABILITIES …" | "Vikash · Meeting agent" · "Voice · Male · warm, measured" · "Speaks · अ Hindi, A English" · "Can · Present slides · run a flow · take notes" (only shipped capabilities) |
| "GENERATE PPT … independent of meetings — no LiveKit, no in-meeting agent…" · "Slides per deck" · "Generate PPT" | "Generate a deck" · "Describe the deck and choose from 3 options." · "Slides" (hint "3 to 7 slides") · **Generate 3 options** |
| Refresh (no feedback) | Automatic refresh; "Updated 4:42 pm"; "Couldn't refresh · Retry" |

### 1.15 Accessibility (Meetings)

- **Structure.** One H1 "Meetings"; H2 Live now, Past meetings, Meeting agent, This month; each RoomCard is a `section` whose title is an `h3` (F-A11Y-026). The table has a visually hidden caption "Past meetings, newest first" and `aria-sort` (N §7.14).
- **Names.** Copy buttons name their room ("Copy link for Weekly demo"); Open room adds "(opens in a new tab)" visually hidden; the FlowSwitcher reads "Flow: Product demo, live version 3. Change flow"; participant rows are list items with the name first (F-A11Y-003, F-A11Y-024).
- **Choice semantics.** Both RadioCard groups and the Slides and When-joins groups are `radiogroup`s with roving focus; checkboxes are real checkboxes; the "people left" disclosure has `aria-expanded` (F-A11Y-016).
- **State in words.** Live, Stale, Open, Recording, Notes on and the agent's state are words with icons; the LiveDot is `aria-hidden` and `data-mark` for forced colours (F-A11Y-019).
- **Targets.** Copy, ⋯ and Close have at least 24 × 24 hit areas (44 on touch); End room lives in a menu or, on stale cards, 8 px from ⋯ (F-A11Y-023, F-UX-035).
- **Focus.** Sheets follow O §1.3; Room ready moves focus to the sheet title; after End room focus moves to the next card title or the Live now heading, never to `<body>`.
- **Language.** Summaries and turns set `lang`; Devanagari uses `read-15-deva`; names carry `translate="no"`.
- **Contrast and motion.** Token pairs only (the violet 4.23:1 CTA and 1.72:1 hints are gone, F-A11Y-009, F-A11Y-008); no pulse and no slide under reduced motion.
- **Zoom.** At 200% on a 1280 px screen the phone layout applies and Meetings is in More (F-RWD-001).

### 1.16 Responsive summary (Meetings)

| Width | Layout |
|---|---|
| ≥ 1440 | Sidebar; main + aside 320; room cards 2 across; P1–P3 columns; sheets dock in place of the aside |
| 1280–1439 | Sidebar; no aside (its cards follow Past meetings, 2-up); room cards up to 3 across; sheets overlay the right third |
| 1024–1279 | Rail; P1–P2 columns; "How meetings work" icon-only; Baseline folds into a chip at ≤ 720 px tall |
| 768–1023 | TopBar; header row with meta, ⋯ and the primary; cards 2 across from 680 px; P1 with pinned key and actions; modal full-height sheets |
| 320–767 | TopBar + BottomBar (More is current); cards full width with a full-width **Open room** and ⋯; past meetings as ListRows; full-screen sheets and Start sheet with a sticky footer; room codes truncate, nothing scrolls sideways at 320 |

### 1.17 Telemetry (optional)

| Event | Properties | Question it answers |
|---|---|---|
| `meeting_start_open` | `source` (header, empty, shortcut, palette, deck) | Where do people begin? |
| `meeting_create` | `mode`, `slides` (live, deck), `privacy` (link, key), `agentJoin` (first_guest, manual), `notes`, `recording` | Which setups are used? |
| `meeting_create_blocked` | `check` (wallet, minutes, role, deck) | What stops meetings? |
| `meeting_room_ready_copy` | `what` (link, key, invite) | Is the key hand-off understood? |
| `meeting_agent_add` | `result` (joined, failed, blocked_seat, blocked_wallet) | Agent reliability |
| `meeting_room_end` | `reason` (host, stale_prompt, auto), `openHoursBucket` | Are stale rooms being ended? |
| `meeting_notes_view` / `meeting_action_item_handoff` | `tab` / none | Are outputs read and acted on? |
| `deck_generate` | `slides`, `result`, `usedInMeeting` | Is the deck generator worth keeping here? |

Payloads never carry titles, names, room codes, keys, transcripts or summaries; routes are templates. Session replay stays off on Meetings (Shell §18).

### 1.18 Acceptance criteria (Meetings)

- [ ] `/meeting-agent` returns a 308 to `/meetings`; nav, H1 and `<title>` read "Meetings"; "Vikash" appears only as a voice.
- [ ] No `#8B5CF6`, `#A78BFA` or other literal colour, no `font-mono` outside token components, no 0-radius control and no text below 12 px on the page (lint and visual snapshot, both themes).
- [ ] The GPU, Backend, port and env-var cards, "(present_topic)" and "no LiveKit" do not render in customer builds (banned-terms lint).
- [ ] A room with `endedAt` never appears in Live now; a room without it never appears in Past meetings.
- [ ] A room open longer than 12 h shows the warning tag with its open duration and an **End room…** action; after MT1, a room idle 30 min shows "Stale" and ends on the server.
- [ ] Rooms are listed by title; the room code appears only in the join line, the sheet's Details and Copy results.
- [ ] Clearing the title or entering only spaces and pressing **Create room** shows "Enter a title for the meeting." and sends nothing.
- [ ] The Start sheet opens with focus in Title, traps focus, guards a dirty close with the inline discard state, and `⌘/Ctrl+Enter` creates exactly one room even when pressed twice.
- [ ] Present slides with "Show my deck" accepts only PPTX or PDF up to 20 MB and names any rejected file with its reason (after MT7).
- [ ] Run a flow shows the flow's name and live version; unpublished flows are disabled with their reason; choosing a flow never calls `PATCH /api/auth/profile`.
- [ ] Key-only rooms show the key once in Room ready with Copy; **Copy invite** never includes the key.
- [ ] At a ₹0 wallet the Start sheet's wallet row is blocking, **Create room** is `aria-disabled` with that sentence, and **Top up** returns to the kept draft after payment.
- [ ] **Add agent…** always opens the gate popover with a cost line; nothing adds the agent on a single click or key.
- [ ] Agent, Notes and Recording rows state their state in words, and every change is reflected there within one refresh.
- [ ] **End room…** exists only in ⋯ (or as the stale card's action), opens a tier-2 confirmation naming the room, and returns focus to a card title or the Live now heading.
- [ ] A failed refresh keeps the previous rooms and meetings on screen with "Couldn't refresh · Retry", and join links do not change.
- [ ] Past meetings paginate on the server with "1–25 of n meetings"; search covers titles and notes on the server.
- [ ] A meeting with notes opens to Summary; Transcript seeks the recording when one exists; each action item offers **Hand to a personal agent…**, which opens the New task sheet with that item as the goal.
- [ ] Generate a deck rejects 999 slides with "Enter a number from 3 to 7." instead of clamping.
- [ ] At 320, 360 and 390 px nothing scrolls sideways; Create room, Open room, Copy and ⋯ are fully visible with 44 px targets; Meetings is reachable from More.
- [ ] axe reports no violations in both themes on the page, the Start sheet, the room sheet, the meeting sheet and the deck dialog; every field has a programmatic label.
