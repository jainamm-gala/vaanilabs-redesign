<!-- Assembled from 07-meeting-personal-agents.part1.md, 07-meeting-personal-agents.part2.md, 07-meeting-personal-agents.part3.md, 07-meeting-personal-agents.part4.md, 07-meeting-personal-agents.part5.md, 07-meeting-personal-agents.part6.md, 07-meeting-personal-agents.part7.md, 07-meeting-personal-agents.part8.md, 07-meeting-personal-agents.part9.md, 07-meeting-personal-agents.part10.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 03-pages · 07 · Meetings and Personal agents

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** agents (`/meetings`, `/meetings/<meetingId>`, `/personal-agents`, `/personal-agents/settings`)
**Follows:** `spec/00-design-direction.md` (Sutradhar, cited *D §n*, especially P1, P3, §6.6 Meetings and Personal agents), `spec/01-foundations.md` + `spec/tokens/tokens.css` (*F §n*), and the component specs `02-components-core.md` (*C §n*), `02-components-data-nav.md` (*N §n*), `02-components-overlay-feedback.md` (*O §n*). Shell, routes and badges come from `03-pages/00-app-shell-ia` (*Shell §n*). Page specs reused: Cockpit `01-agent-cockpit` (*CK §n*: `GateChecklist`, `GateCheckRow`, `CallGate`), Assistant `02-assistant` (*AS §n*: `ApprovalCard`, step marks, autonomy words), Knowledge and Billing `05-knowledge-billing` (*KB §n*: Top-up sheet, Plans, rates), Settings `06-settings` (*ST §n*: Phone setup, "Confirm it's you"). Components are named as those specs name them. Anything they do not define is in §3 "New components needed".
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-RWD-…, F-A11Y-…, F-QA-…) refer to `audit/consolidated/`; raw ids (EXPLORE-CORE-…, QA-A-…, UX-AUDIT-…) to `audit/raw/`. Today's screens: `audit/screenshots/scout_meeting-agent.png`, `scout_personal-agents.png`, `va-visual-audit/meeting-agent_full.png`, `va-explore-core/personal_agents_new_task.png`, `va-explore-core/settings_personal_agent.png`, `va-verify-responsive-a/meeting-agent_390_rooms.png`.
**Privacy:** every workspace, person, room, task and number here and in the mock is fictional ("Sample Realty", "Anika R.", "Lead 1042", `+91 80 •••• 2210`). "Vikash" and "Vaani" are the product's own voice names. No customer or lead data from the audit appears.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/07-meeting-personal-agents.md`, assembled from `.part1.md` … `.part10.md` (edit the parts, then re-assemble) |
| Reference mock (Meetings desktop, Start a meeting sheet, Personal agents first use and working state with a docked task sheet, phone frames; light and dark) | `spec/03-pages/07-meeting-personal-agents.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `07-meeting-personal-agents-desktop.png` (1440, light, full page), `-dark.png` (1440, dark), `-mobile.png` (390 phone frames) |

**Contents.** Part 1: §0 decisions, strengths kept, backend dependencies, routes. Part 2: §1.1–1.4 Meetings purpose, findings, hierarchy, layouts. Part 3: §1.5–1.7 components, Live now and the RoomCard, Start a meeting. Part 4: §1.8–1.11 room sheet, past meeting, Generate a deck, How meetings work. Part 5: §1.12–1.18 Meetings states, keys, copy, accessibility, responsive, telemetry, acceptance. Part 6: §2.1–2.5 Personal agents purpose, findings, hierarchy, layouts, components. Part 7: §2.6–2.9 readiness and templates, Waiting for you, task states, New task. Part 8: §2.10–2.13 task sheet, Agent settings, states, keys. Part 9: §2.14–2.18 copy, accessibility, responsive, telemetry, acceptance. Part 10: §3 new components, §4 reconciliations, §5 open questions, §6 traceability.

---

## 0. Decisions and the shared layer

Both pages hand work to an agent that acts **outside the Vaani app**: the meeting agent speaks in a video room on `meet.vaanilabs.in`, and a personal agent calls and messages people from its own number. Today both pages hide the facts an operator needs before letting an agent act, and both look like separate products. Meetings is the "violet product": all JetBrains Mono, a hard-coded `#8B5CF6`, a square segmented control, an H1 "Meeting Agent — Vikash", and backend cards that print a port number and an environment-variable name (F-VIS-001, F-VIS-004, F-UX-016). Personal agents is the "marketing hero": a 30 px Sora H1 under a tracked eyebrow, three grey cards at 2.2:1 that look disabled, and a hidden blocking prerequisite (F-VIS-003, F-UX-039). Journeys J8 "Deploy the meeting agent" and J9 "Delegate a goal to a personal agent" both rate 3/5 (01-product-understanding part 6).

| # | Decision | Findings |
|---|---|---|
| **A1** | **One design language, no violet product.** Both pages use the AppShell, the one `PageHeader` (N §2), Hanken Grotesk, sentence case, the Neel budget (one filled primary per region) and tokens only. `#8B5CF6`, the mono body, the 0-radius segments, the tracked eyebrows and the `black/20` cards are deleted. Mono appears only for room codes, masked numbers, ids, keys and timecodes (D §5). | F-VIS-001, F-VIS-003, F-VIS-004, F-VIS-005, F-VIS-006, F-A11Y-008, F-A11Y-009 |
| **A2** | **One name per place.** Nav, H1 and `<title>` say **Meetings** and **Personal agents** (Shell §2.2). "Vikash" is the meeting agent's *voice*, shown as a VoiceTile and a name inside the page, never in the H1. Agent settings live at `/personal-agents/settings` with one breadcrumb, and the Personal agents nav item stays current there. | F-UX-017, F-UX-043, EXPLORE-CORE-26 |
| **A3** | **Say only what is proven (P1).** The GPU, Backend, port and env-var cards go to a staff-only admin route. "Agents 1/3 · Slots 2 · Stale 0 · Recording 0" become sentences computed from room state ("Agent seats: 1 of 3 in use"). The agent profile lists only capabilities that work today. A personal agent "works on its own number" only once a number is assigned. | F-UX-016, F-UX-038, F-QA-024, F-UX-039 |
| **A4** | **Anything that bills or acts for you passes a gate (P3).** Starting a meeting is a gate sheet with checks and a cost line; adding the agent to a room later is a gate popover. A personal-agent task's **New task** sheet is its gate: who it may contact, its limits and a cost range. Inside the approved limits the agent's **Auto** capabilities run; anything outside them waits for you (**Confirm**), and money needs **Confirm + 2FA**. No single key or click starts an agent that spends money. | D P3, F-UX-013 (pattern), 00-summary §4 (autonomy levels) |
| **A5** | **Prerequisites first, where they block.** Personal agents opens with a readiness checklist (number, how it reaches you, what it may do alone) above the tasks. Meetings shows seats, wallet and free minutes in the Start sheet and the Add agent gate, not in a global bar. | F-UX-039, F-UX-015, D §6.1 blocking-notice rule |
| **A6** | **Every record has an address (P5).** Rooms are listed by title; a live room opens in a record sheet (`?room=`), a past meeting in a detail sheet (`?meeting=`) or its own page (`/meetings/<id>`), a task in a record sheet (`?task=`). New task is a gate sheet with focus management, not an inline panel. | F-UX-031, F-UX-038, F-A11Y-005, F-UX-039 |
| **A7** | **A truthful room lifecycle.** A room is in **Live now** or in **Past meetings**, never both. A room open for hours with nobody in it is flagged with the fact ("Open 3 days · nobody here since 24 Sep") and a way to end it; the server ends idle rooms. | F-QA-024, F-UX-038 |
| **A8** | **Outputs are the point of a meeting.** A past meeting opens to Summary · Transcript · Action items (when notes were on). Any action item can be handed to a personal agent as a New task: the one link between the two features. | F-UX-038, F-QA-024, J8/J9 |
| **A9** | **B2B scope.** Consumer capabilities (Homework analysis, Stock research, Stock trade) are hidden in business workspaces behind a workspace flag; the rest are grouped by job with a one-line description. | F-UX-040 |

### 0.1 Kept from today (strengths, 00-summary §4)

| Keep | Where it lands |
|---|---|
| The meeting persona card (voice, role, capabilities) | `AgentProfileCard` in the Meetings aside (§1.5), capabilities filtered to what ships |
| The **Auto / Confirm / Confirm + 2FA** autonomy levels per capability, with irreversible → Confirm and financial → Confirm + 2FA defaults | Agent settings § "What it may do on its own" (§2.11), unchanged in meaning, clearer in words; the same words the Assistant uses (AS §10.2) |
| Contact preference Call / WhatsApp / Email | Agent settings § "How your agent reaches you", RadioCard group (§2.11) |
| The explainer, and the cross-link "for one scripted call, use a flow" | PageHeader description on first use; Flows link in "How personal agents work" (§2.5) |
| The three use-case examples | Real **Start from a template** cards that pre-fill the goal (§2.6) |
| Encrypted meetings as an option | "Only people with the key", with the key handed over after creation (§1.7) |
| Generate PPT trims whitespace and disables Generate when the prompt is empty | Generate a deck dialog (§1.10), plus a visible 3-to-7 slide range instead of silent clamping |
| Past meetings keep their join-count detail | "In the room" participant list with join and leave times (§1.8, §1.9) |

### 0.2 Backend dependencies (hidden, not simulated: D §8)

| Id | Capability | Needed for | UI until it ships |
|---|---|---|---|
| **MT1** | Room lifecycle: `open` → `ended`, `endedAt`, end reason (host, idle reaper, error), last-participant time; Live and Past mutually exclusive | Live now, Past meetings, Stale flag | Live now = rooms without `endedAt`; Past = rooms with it. A room open longer than 12 h shows the fact "Open 3 days" with the warning tone (an open duration is proven; "idle" is not). The server-side reaper is a launch blocker for the Stale word itself |
| **MT2** | Room title, creator, participants with join and leave times | Room cards, "In the room", Details | Participants from today's per-room calls; titles from the room record |
| **MT3** | Meeting notes: per-turn transcript (speaker, language, timestamps), summary, action items, processing status | Notes control, Summary / Transcript / Action items tabs, "Notes" column | Tabs and column hidden. The past-meeting sheet shows Details only. The control today labelled "Intel" keeps its current function under a plain name agreed with the product owner (§5 Q2); the agent profile does not claim "Action item capture" |
| **MT4** | Recording files, duration, disclosure time, availability per room type | Recording control, RecordingPlayer | "Start recording…" keeps today's function; the player is hidden; Details say "Recorded · file not available in the app yet" |
| **MT5** | Agent seats (`/api/meeting-agent/agents`: in use, total) | Seat check, Live now meta | Exists today (1/3); shown as "Agent seats: 1 of 3 in use" |
| **MT6** | Rates and free minutes from the one rates endpoint (KB BL1) plus the quota API | Cost line, This month card, checks | Rates from config (KB §0.2 BL1 interim); free minutes from today's quota API (60 s used = "29 of 30 left") |
| **MT7** | Deck upload and a workspace deck library (uploaded and generated decks) | "Show my deck", Recent decks, "Use in a meeting" | "Show my deck" hidden; Presentation offers "Make slides as it talks" only; Generate a deck offers Download only |
| **MT8** | Agent joins when the first guest arrives | "When the agent joins" choice | Choice hidden; the agent joins when the host presses **Add agent…** in the room (today's behaviour), and the Start sheet says so |
| **MT9** | Room key returned once at creation, plus a flag saying whether it can be shown again | Key hand-off (§1.7) | Key shown once in "Room ready" with Copy; afterwards "The key was shown when the room was created" (the API-key shown-once pattern, 00-summary §4) |
| **MT10** | Scheduled rooms with a start time (v1.1) | "Upcoming" section, `Scheduled` room tag | Hidden |
| **PA1** | Task model: status, plan steps with status, activity events, counters (calls used, spent), result | Task table, task sheet | Status and goal from today's task row; Progress shows the status sentence only; Activity hidden |
| **PA2** | Confirmation requests: id, task, requested action, payload preview, cost, expiry, decision API, idempotency | Waiting for you, ApprovalCard, nav badge "1 to confirm" | Section and badge hidden; confirmations continue on WhatsApp, call or email as today, and the task shows "Waiting for you · check WhatsApp" |
| **PA3** | Task limits enforced on the server: contact scope, max calls, spend cap, deadline, schedule | Limits in New task, counters, "Stopped at limit" | Limits section hidden; the gate shows the advisory "No spending limit yet. Calls follow your autonomy settings." and new workspaces default Calls to **Confirm** |
| **PA4** | Number assignment state per user, and a request-to-admin endpoint | Readiness row, Agent settings § Phone number | State from today's settings API ("No number assigned yet"); "Ask an admin" copies a request message (O §16 Forbidden: "Copy request link") |
| **PA5** | Workspace flag `consumerCapabilities` | Capability lists | Default off: consumer items hidden everywhere |
| **PA6** | Templates (id, title, description, goal text, suggested limits) | Start from a template | Three static templates in config (§2.6) |
| **PA7** | Re-authentication for Confirm + 2FA decisions | ApprovalCard `twoFactor` | Uses Settings' "Confirm it's you" dialog (ST §5); if 2FA is not set up, the approval is blocked with "Turn on two-factor authentication to approve payments. Security settings" |

### 0.3 Routes and URL state (`useUrlState`, N §0.7)

| Route | Query params (restored by reload, Back and a pasted link) |
|---|---|
| `/meetings` | `q`, `f.when`, `f.agent` (present, flow, none), `f.notes` (ready, none), `sort`, `page`, `size`; `room=<id>&tab=room\|notes`; `meeting=<id>&tab=summary\|transcript\|actions\|details`; `start=1` (+ optional `mode=present\|flow`, `flow=<id>`, `deck=<id>` prefills); `generate=1` (Generate a deck) |
| `/meetings/<meetingId>` | `tab=summary\|transcript\|actions\|details`, `t=<ms>` (transcript position) |
| `/personal-agents` | `view=active\|waiting\|done\|all`, `q`, `sort`, `page`, `size`; `task=<id>&tab=progress\|activity\|details`; `new=1` (+ `template=<id>` or `from=meeting:<meetingId>:item:<n>`) |
| `/personal-agents/settings` | section anchors `#number`, `#contact`, `#autonomy`, `#limits` |
| **Any signed-in route** | `topup=1` opens the Top-up sheet in place (KB §0.3) |

Goal text, titles and names never go into the URL; prefills travel by id (`template=`, `from=`), so no personal data lands in query strings or analytics.

**Redirects** (308, query kept; Shell §2.4): `/meeting-agent` and `/meeting-agent/*` → `/meetings` and `/meetings/*`; `/settings/personal-agent` → `/personal-agents/settings`; `/settings#meetings-billing` → `/billing/plans` (client). The "Free minutes" fact links to `/billing/plans` directly (F-UX-021).

**Nav** (Shell §2.2): Meetings `video`, badge none; Personal agents `list-checks`, badge `count` "1 to confirm" from PA2 (hidden until it ships). Both live in the phone More sheet (Shell §2.2), so phones reach them (F-RWD-001).

---

## 1. Meetings (`/meetings`)

### 1.1 Purpose and job to be done

**Primary job:** *When I have a demo or a customer meeting, I want to open a video room that the Vaani meeting agent joins (to present slides or to talk through a flow), share the link, and afterwards read the notes, summary and action items, so I don't have to run the pitch or take notes myself.* The user is the meeting host: presales, a sales lead or a founder (01-product-understanding part 1, persona "Meeting host / presales").

**Secondary jobs:** see which rooms are open now and end the ones nobody uses; know what the agent will cost before it joins (free minutes, agent time); find a past meeting and hand its follow-ups to someone; make a deck without a meeting.

**Not this page's job:** building or publishing the flow the agent runs (Flows), meeting-minute plans and invoices (Billing › Plans and Invoices, F-UX-021), calendar scheduling (v1.1, MT10), the video room itself (it opens on `meet.vaanilabs.in` in a new tab), and infrastructure health (a staff-only admin route and the public status page, F-UX-016).

### 1.2 Findings addressed and what changes

| Finding | Today | Change |
|---|---|---|
| F-UX-037 (medium) | Title pre-filled with its own placeholder (3 of 5 past meetings share it); empty title accepted; Presentation promises "an attached" deck with no way to attach; nothing says who gets the encryption key; "Active flow (from profile)" names no flow | Title defaults to a unique value ("Meeting · 27 Sep, 4:40 pm"), required and trimmed; **Slides** choice with "Show my deck" upload (MT7); a **Room ready** step hands over the link and key; FlowSwitcher names the flow and its live version (§1.7) |
| F-UX-038 (medium) | Active room listed by its 22-character id; an 82 h "live" room with "Stale 0"; icon-only red Delete among the toggles; toggles without on/off words; no meeting outputs; "1 participant" and "2 joinees" in one card | Title-first `RoomCard`; **Stale** or "Open 3 days" tag with **End room…**; End room in ⋯ behind a tier-2 confirmation; `RoomControlRow`s that say "In the room", "On", "Off"; Summary · Transcript · Action items on past meetings; one count ("3 people") |
| F-QA-024 (medium) | The same room in Active and Past; quota says 60 s used while a room shows 82 h live | Live now and Past meetings are exclusive by status (MT1); idle rooms end on the server; the free-minute fact comes from the quota API |
| F-UX-016 (medium) | "GPU server status", "Meeting agent runs on port 8090 · NEXT_PUBLIC_MEET_AGENT_URL", "(present_topic)", "no LiveKit", QA rooms in the list | Cards removed from customer builds; plain copy; banned-terms lint; QA rooms archived in production data (§5 Q6) |
| F-UX-017, F-UX-043 | Rail "Meet Agent", H1 "Meeting Agent — Vikash" | "Meetings" in nav, H1 and `<title>`; no em dash |
| F-UX-019 (medium) | `GET /api/meet` 500: no message, Past meetings vanish, the active link switches to a 22-character room-id URL | SectionError keeps the last good list with "Couldn't refresh · Retry"; a room's join link never changes on refresh (§1.12) |
| F-UX-025 (medium), QA-A-14 | Create Room enabled with an empty title; PPT prompt trims, title does not | One validation rule (C §8.2); both fields trimmed |
| F-UX-014, F-UX-005, F-VIS-037 | Flow read from the profile the Cockpit writes; 17 options with duplicate names | FlowSwitcher `purpose="assign"`: Live and Not published sections, short ids for duplicates; the choice belongs to the room, never the profile |
| F-UX-035, F-A11Y-023, F-A11Y-024 | Delete room (32 px) directly beside Record; Copy URL 15 × 15 named by `title` | Destructive actions only in ⋯ after a separator; Copy link is an IconButton with a 24 px hit area (44 on touch) and the name "Copy link for Weekly demo" |
| F-UX-021 | "Free minutes: 29 / 30" links to Settings › Meetings Billing | "29 of 30 free minutes left this month" links to Billing › Plans |
| F-A11Y-003 (high; axe `label` and `select-name` critical) | Flow select and slide count unnamed; title unlabelled | Every control in a `Field` with a visible label |
| F-A11Y-016 (medium) | Session mode and privacy with no radio semantics; "2 joinees ▸" expander without `aria-expanded` | RadioGroup `variant="card"`; participants listed in the room sheet (no expander) |
| F-A11Y-008, F-A11Y-009 (high) | 64 of 111 text nodes below AA; white on violet 4.23:1; hints at 2.0–2.4:1 | Tokens only: `--text-3` 5.62:1, Neel 7.68:1, 12 px floor |
| F-A11Y-026 | No headings below the H1 | H2 per section: Live now, Past meetings, Meeting agent, This month |
| F-VIS-001, F-VIS-004, F-VIS-005, F-VIS-006, F-VIS-016 | Violet primary in both themes, 100% mono, 11 button signatures, square segments | AppShell, PageHeader, Button, SegmentedControl and RadioGroup from the specs |
| F-VIS-024 | "23 Sept 2026" | `formatWhen`: "Yesterday 4:10 pm", "23 Sep 2026" |
| F-VIS-034 | Title input and mode control 1,125 px wide at 1920 | Form lives in a 640 px gate sheet; the page is a fluid data page with an aside |
| F-VIS-006 (Refresh) | Refresh neither spins nor disables and refetches 5 endpoints | Room state refreshes on its own (§1.12); the RefreshButton recipe (C §2.6) says "Updated 11:24 am" |
| F-RWD-006 (medium) | Content wider than the screen below 513 px; Record cut, Delete off-screen, title in 3 lines | `min-width: 0` everywhere, room codes truncate with Copy, card actions stack, past meetings become ListRows |
| F-RWD-001 (high) | No phone route to the page | Meetings is in the More sheet (Shell §2.2) |
| F-QA-007, F-UX-030 | Full-screen "Loading…"; first H1 at 4.9 s | The shell and H1 render at once; regions use skeletons (O §13) |

### 1.3 Information hierarchy

1. **First: what is open right now, and does anything need me?** The **Live now** section: each room's title, "Live · 18 min · 3 people", whether the agent is in the room, and any warning (a stale room, an agent that couldn't join). When nothing is open, the section shrinks to one line and Past meetings rises.
2. **Second: the one action.** **Start a meeting** (header primary; `N` in its tooltip).
3. **Third: what happened.** **Past meetings** with a Notes column ("Summary ready"), then context in the aside: the meeting agent's profile, free minutes and agent time this month.

Everything else (room codes, privacy, participants' join times, cost per meeting) lives in the room or meeting sheet.

### 1.4 Layout

**Desktop ≥ 1440** (1440 × 900; sidebar 232, content 1208 = main fluid 888 + aside 320 at `--size-inspector`). The aside holds the agent profile and This month. Opening a room (record sheet 440) or a past meeting (detail sheet 560) docks the sheet **in place of the aside**; closing it returns the aside (the Knowledge dock-swap rule, KB §1.4).

```
┌─ Sidebar 232 ─┬─ Meetings  1 live · 12 past ···························· [ⓘ How meetings work] [⋯] [+ Start a meeting] ┐ 56
│ [S] Sample R. ├─ main (fluid, padding 24) ───────────────────────────────────────┬─ aside 320 ─────────────────────────┤
│ ⌕ Search   ⌘K │ Live now   Agent seats: 1 of 3 in use                            │ Meeting agent                        │
│ Operate       │ ┌ Weekly demo · Sample Realty ─────────┐┌ Site walkthrough prep ──┐│ [Vi] Vikash               [▶ Hear] │
│  Cockpit      │ │ ● Live · 18 min · 3 people            ││ ⚠ Stale                 ││ Voice   Male · warm, measured       │
│  Assistant    │ │ qdr-hkte-mzp [⧉]  Key required        ││ Open 3 days · nobody    ││ Speaks  अ Hindi  A English          │
│  Rep console  │ │ Agent      In the room · presenting    ││ here since 24 Sep       ││ Knows   Knowledge · 14 sources      │
│ ▸ Meetings    │ │ Notes      On · 42 turns so far        ││                         ││ Can     Present slides · run a flow │
│  Personal ag. │ │ Recording  Off                         ││ [End room…]         [⋯] ││         · take notes                │
│ Build         │ │ [↗ Open room]                     [⋯] │└─────────────────────────┘├─────────────────────────────────────┤
│  Flows        │ └────────────────────────────────────────┘                          │ This month                          │
│  Knowledge    │ Past meetings                                                       │ Free minutes          1 of 30 used  │
│ Data          │ [⌕ Search titles and notes…] [Date  Last 30 days ▾] [≡ Filter]  12  │ ▬▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭   29 left            │
│  Leads        ├─────────────────────────────────────────────────────────────────────│ Agent time       25 min · ₹120.00   │
│  Call reports │ Meeting ↕             When ↓             Length  People  Notes     ⋯ │ Meetings                       12   │
│  Analytics    │ Pricing walkthrough   Yesterday 4:10 pm     42m       4  ✓ Summary… ⋯│ Usage in Billing · Plans            │
│ Account       │ Weekly demo           23 Sep 2026           31m       3  ✓ Summary… ⋯│                                     │
│  Billing      │ Investor Q&A prep     22 Sep 2026           18m       2  Notes off  ⋯│                                     │
│  Settings     │ 1–12 of 12 meetings              Rows per page 25 ▾  Page 1 of 1 ‹ › │                                     │
├───────────────┴─────────────────────────────────────────────────────────────────────┴─────────────────────────────────────┤
│ Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │ Wallet ₹2,340.50 · about 16 h of calls │ Shortcuts  Search │ 28
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Live now: a `RoomCard` grid, `repeat(auto-fill, minmax(calc(var(--space-80) * 4), 1fr))` (320 px minimum), gap `--space-12`. Room cards never stretch past two columns at this width. Up to 6 cards show; more collapse behind "Show all 8 open rooms".
- Past meetings: `DataTable` framed (radius 8) inside the main column, P1–P3 columns, server pager.
- Vertical rhythm: `--space-section-gap` (40) between Live now and Past meetings; section headings `title-16` with meta in `meta-12` `--text-3`.

**Laptop 1280–1439** (sidebar 232). Same main column at full content width, **no aside**: its two cards move to a "Meeting agent" section after Past meetings, side by side (`grid-columns` 12, each card spans 6). Sheets overlay the right third, non-modal (O §1.7). Live now shows up to three cards per row.

**Laptop 1024–1279** (rail 56). As above with P1–P2 columns (Meeting, When, Notes, ⋯). "How meetings work" becomes an info IconButton with a tooltip. At heights ≤ 720 the Baseline folds into a header chip (D §6.1).

```
┌R─┬─ Meetings  1 live · 12 past ···································· [ⓘ] [⋯] [+ Start a meeting] ┐
│56│ Live now   Agent seats: 1 of 3 in use                                                            │
│  │ ┌ Weekly demo · Sample Realty ───────────────┐ ┌ Site walkthrough prep ─────────────────────────┐ │
│  │ │ ● Live · 18 min · 3 people                 │ │ ⚠ Stale · Open 3 days · nobody here since 24 Sep│ │
│  │ │ …                                          │ │ [End room…]                                [⋯] │ │
│  │ Past meetings                                                                                   │
│  │ [⌕ Search titles and notes…] [Date ▾] [≡ Filter]                                           12   │
│  │ Meeting ↕                      When ↓                      Notes                            ⋯   │
│  │ …                                              ┌ Weekly demo (overlay 560) ────────────── × ┐  │
│  │ Meeting agent · This month (2-up cards)        │ Summary  Transcript  Action items  Details │  │
└──┴────────────────────────────────────────────────┴────────────────────────────────────────────┴──┘
```

**Tablet 768–1023** (TopBar 52 with "Meetings" as the title, the wallet chip and search; Shell §3). Single pane. The header row keeps the meta on the left and `[⋯] [Start a meeting]` on the right ("How meetings work" moves into ⋯). Live now cards: two per row from a 680 px container, one below. Past meetings: P1 plus pinned key and actions columns. Sheets are modal, full height, `min(560, 100%)` wide.

```
┌ ☰  Meetings                                   [₹2,340] [⌕] ┐ 52
│ 1 live · 12 past                      [⋯] [+ Start a meeting]│ 48
│ Live now   Agent seats: 1 of 3 in use                        │
│ ┌ Weekly demo · Sample Realty ─┐ ┌ Site walkthrough prep ──┐ │
│ │ ● Live · 18 min · 3 people   │ │ ⚠ Stale · Open 3 days   │ │
│ │ qdr-hkte-mzp [⧉] Key required│ │ nobody here since 24 Sep│ │
│ │ Agent · In the room          │ │                         │ │
│ │ Notes · On   Recording · Off │ │ [End room…]         [⋯] │ │
│ │ [↗ Open room]            [⋯] │ └─────────────────────────┘ │
│ └──────────────────────────────┘                             │
│ Past meetings                                                │
│ [⌕ Search titles and notes…               ] [≡ Filter 1]     │
│ Meeting (pinned)            When               Notes    ⋯(pin)│
│ Pricing walkthrough         Yesterday 4:10 pm  ✓ Ready   ⋯    │
│ 1–12 of 12                                        ‹  ›        │
│ Meeting agent · This month (2-up cards)                       │
└──────────────────────────────────────────────────────────────┘
```

**Phone 320–767** (TopBar + BottomBar; Meetings is reached from More, whose bar item shows as current). Touch density. Every row has `min-width: 0`; nothing scrolls sideways at 320 (fixes F-RWD-006).

```
┌ Meetings              [₹2,340][⌕] ┐ 52
│ 1 live · 12 past     [⋯] [Start]  │ 48  (Start = labelShort of "Start a meeting")
│ Live now                           │
│ ┌────────────────────────────────┐ │
│ │ Weekly demo · Sample Realty    │ │ title-14, wraps to 2 lines max
│ │ ● Live · 18 min · 3 people     │ │
│ │ qdr-hkte-mzp          [⧉ Copy] │ │ code truncates; Copy 44 × 44
│ │ Key required                   │ │
│ │ Agent      In the room         │ │
│ │ Notes      On                  │ │
│ │ Recording  Off                 │ │
│ │ [↗ Open room            ] [⋯]  │ │ full-width secondary + ⋯, 8 px apart
│ └────────────────────────────────┘ │
│ ┌ Site walkthrough prep ─────────┐ │
│ │ ⚠ Stale · Open 3 days          │ │
│ │ [End room…              ] [⋯]  │ │
│ └────────────────────────────────┘ │
│ Past meetings                      │
│ [⌕ Search titles and notes…     ]  │ 44, own row
│ [Date ▾] [≡ Filter] →              │
├────────────────────────────────────┤
│ Pricing walkthrough   ✓ Summary    │ ListRow line 1
│ Yesterday 4:10 pm · 42m · 4 people │ line 2 (meta-12)
│ Weekly demo           ✓ Summary    │
│ 23 Sep 2026 · 31m · 3 people       │
│ 1–12 of 12                 ‹  ›    │
│ Meeting agent                      │ cards stacked
│ This month                         │
├────────────────────────────────────┤
│ BottomBar · More current           │ 56 BottomBar
└────────────────────────────────────┘
```

The Start sheet, room sheet and meeting sheet are full screen on phones with a sticky footer above the safe area (O §1.7). The room code is `mono-13`, truncated from the end with the full code in the Copy button's name and in the sheet.

---

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

---

### 1.8 Room sheet (an open room: `Sheet variant="record"`, 440, `?room=<id>&tab=room|notes`)

Non-modal from 1024 (docked in place of the aside at ≥ 1440, overlaying the right third at 1024–1439), modal full height on tablets, full screen on phones (O §1.7). It replaces the "2 joinees ▸" expander and the unlabelled toggles.

**Header** (O §4.2): title = the room title (`translate="no"`); meta row = `StatusTag` "Live" + "18 min · started 4:23 pm"; actions: Copy link IconButton, ⋯ (Copy invite, Copy key, separator, **End room…**), Close ("Close room details"). **PanelTabs** (N §3): **Room** · **Live notes** (the second tab only while notes are on and MT3 ships).

**Room tab**, four sections, each an `h3` (`title-14`):

1. **Join.** `JoinDetails` (new, §3): the join link field with Copy, the key state ("Key shown when the room was created" or the key with Copy while MT9 allows), **Copy invite** (secondary) and **Open room** (secondary, `external-link`).
2. **Agent, notes and recording.** Three `RoomControlRow`s in `full` mode, `--row-h` 48, divided by `--border` hairlines: label (`label-13`), the state sentence (`StatusText sm`), one action on the right.

| Row | States (sentence) | Action | Guard |
|---|---|---|---|
| Agent | VoiceTile 28 + "Vikash · in the room since 4:24 pm · presenting Q3 pricing" · "Joins when the first guest arrives" · "Not in the room" · "Joining…" · "Couldn't join. The seat was released and you were not charged." · "Left at 5:02 pm · the wallet reached ₹0" | **Add agent…** / **Remove agent** / **Retry** | Add: `AddAgentGate` (below, tier 4). Remove: tier 0, immediate (like End call, O §3.1), toast "Vikash left Weekly demo" |
| Notes | "On · 42 turns so far" · "Off" · "Paused while nobody speaks" (only if MT3 reports it) | **Turn off** / **Turn on** | Tier 0; the room shows "Notes on" to everyone (MT3), and the row says so in its tooltip |
| Recording | Tag outline `disc` "Recording" + "since 4:30 pm" · "Off" · "Not available in key-only rooms" (disabled reason) | **Start recording…** / **Stop recording** | Start: `ConfirmDialog` tier 2 with a primary (non-destructive) confirm; Stop: immediate |

3. **In the room · 3.** A `ul` of 40 px rows: Avatar 28 with initials (guests) or VoiceTile 28 (the agent) · name (`data-13`, `translate="no"`; guest names are what guests typed) · meta "joined 4:26 pm" · `Tag outline` "Host" on the creator. People who left collapse behind "2 people left · Show" (a `button` with `aria-expanded`). The count is one number for everyone including the agent (F-UX-038 "1 participant" vs "2 joinees").
4. **Details.** `KeyValueList` (N §8): What the agent does ("Presents slides · Q3 pricing.pdf, 14 slides" or "Runs Product demo · Live v3", the flow name linking to `/flows/<id>`) · Voice (VoiceTile 20 + "Vikash · अ Hindi, A English") · Who can join · Notes · Recording · Created by · Created ("Today 4:21 pm") · Room code (`mono-12` + Copy).

**Live notes tab.** `TranscriptFeed mode="live"` (N §12.4) with the meeting's turns: speaker = participant name or "Guest 2" when unnamed, "Vikash" for the agent; `LanguageMark` per turn only with per-turn language (else once in the feed header); follow mode and "Jump to latest"; announcements of final turns follow the feed's default (on, switchable in its ⋯). Idle copy: "Notes appear here when someone speaks."

**AddAgentGate** is specified in `spec/02-components-gate.md` §5.4 (popover gate, 400, anchored to **Add agent…**; a bottom sheet below 768 and at 768–1023 when it doesn't fit; checks `agent_seat` and `wallet`; the `rate` cost line; "Add agent" with `⌘/Ctrl+Enter` and an idempotency key; result and failure copy). Meetings configuration:

| Setting | Value |
|---|---|
| Title and scope | "Add Vikash to Weekly demo" · Does "Presents slides · Q3 pricing.pdf" · Voice "Vikash · Hindi, English" |
| Global blockers | At ₹0 the **Add agent…** button is `aria-disabled` with "Wallet is ₹0. Top up so the agent can join." (G §4.4); the gate opens only if the agent can be paid for |
| "Show open rooms" | Closes the gate and scrolls Live now into view, focusing its heading |
| Done | The Agent row reads "Joining…", then "In the room"; focus moves to the Agent row; announce "Vikash joined Weekly demo" |

**End room…** (`ConfirmDialog` tier 2, danger): title "End 'Weekly demo · Sample Realty'?"; body "Everyone is removed, the agent leaves and the link stops working. Notes and the recording are kept in Past meetings."; confirm **End room** (destructive outline); focus starts on Cancel. After the server confirms: toast "Ended Weekly demo · writing notes"; the card leaves Live now and the meeting appears first in Past meetings with Notes "Writing notes…"; focus moves to the next room card's title, else the Live now heading. There is no Undo (a room can't be reopened).

**Start recording…** (`ConfirmDialog` tier 2, primary confirm): "Start recording Weekly demo?" · "Everyone in the room is told that recording has started. The recording is kept with this meeting's notes." · Cancel · **Start recording**.

### 1.9 A past meeting (`Sheet variant="detail"`, 560, `?meeting=<id>`; full page `/meetings/<meetingId>`)

Rows open the sheet (keeping the list in view); **Open full page** in the sheet header and every shared link go to `/meetings/<meetingId>`, which renders the same content under `PageHeader variant="nested"` (breadcrumb "Meetings", H1 = the title, `translate="no"`), with the tabs as `PanelTabs` in the page. This reconciles the shell's route (Shell §2.3) with the overlay spec's "meeting outputs" detail sheet (O §4.1).

**Header:** title; meta "23 Sep 2026 · 4:23 to 5:05 pm IST · 42 min · 4 people"; actions Previous / Next meeting (`J` / `K` in their tooltips), Copy link, Open full page (sheet only), ⋯ (Copy summary, Download transcript (.txt), separator, **Delete meeting…**), Close.

**PanelTabs:** **Summary** (default) · **Transcript** · **Action items** · **Details**. With notes off (or before MT3) only **Details** exists and no tab row renders.

| Tab | Content |
|---|---|
| Summary | `StatusText` success "Summary ready · written 5:07 pm". The summary in `read-15` (`lang` set from the meeting language; Devanagari paragraphs use `read-15-deva`), max `--size-measure`. Optional `h3` sections "Decisions" and "Open questions" as plain lists when the notes service returns them. Then `KeyValueList`: Agent "Vikash presented Q3 pricing.pdf" or "Ran Product demo v3 · reached 6 of 8 steps" · Agent time "18 min · ₹86.40" (source note "from Billing") · Room time "42 min · free minutes" · Languages (`LanguageMark`s "अ Hindi · A English") · Recording "42 min · **Play**" (switches to Transcript) or "Not recorded" |
| Transcript | `RecordingPlayer` (N §12.5) when a recording exists; its scrubber is a TalkStrip only with per-turn timing, with the lanes **Agent** and **Guests** (all human speakers in one lane), else a waveform or plain track. Then `TranscriptFeed mode="review"`: turns seek the player; search in the feed header; speakers by name |
| Action items | "Copy all" (secondary sm) at the top. An `ol` of items: the text (`data-13` `--text`), then `meta-12` `--text-3` "Owner · Anika R." or "Owner · Not captured", "Due · Mon 29 Sep" or "Due · Not captured", and a timecode link "at 23:41" that opens Transcript there. Each item has a tertiary sm action **Hand to a personal agent…**, which opens `/personal-agents?new=1&from=meeting:<id>:item:<n>` (§2.9). Empty: "No action items were found in this meeting." |
| Details | `KeyValueList variant="rows"`: Room code (`mono-12`, Copy) · Created by · Started · Ended ("5:05 pm · ended by Anika R." or "5:40 pm · ended automatically after 30 min with nobody in the room") · Who could join · What the agent did · Voice · Notes (On / Off) · Recording · People (name · joined to left, one row each) |

**States.** *Writing notes* (MT3 processing): `StageProgress` (O §14.3) "Transcribing · Summarising · Finding action items", meta "Usually under 2 minutes"; tabs render, their panels show the stage. *Notes off*: a neutral `Notice` at the top of Details: "Notes were off for this meeting. Turn on **Take notes** when you start a meeting to get a summary." *Couldn't write notes*: `InlineError` "Couldn't write the notes for this meeting. **Retry**" (Details holds the error id). *No recording*: the player's Unavailable state, "No recording. Recording was off for this meeting." *Deleted or no access*: the sheet's "Record gone" state (O §4.3).

**Delete meeting…** (`ConfirmDialog` tier 2, danger): "Delete 'Weekly demo'?" · "Its notes, transcript and recording are deleted. Billing records are kept. This can't be undone." · **Delete meeting**. If the backend soft-deletes for the toast's lifetime, it becomes tier 1 with "Deleted Weekly demo · Undo" (O §3.1).

### 1.10 Generate a deck (`Dialog size="md"`, `?generate=1`)

Replaces the "Generate PPT" section that sat at the bottom of the page. Opened from the header ⋯ and from the Start sheet's "Generate a deck" link. One dialog; its body changes by step (no stacked modals, O §1.6).

| Step | Content | Footer |
|---|---|---|
| 1 · Describe | `Field` "Describe the deck" + `Textarea` (rows 4, `data-autofocus`), placeholder "Quarterly pricing update for channel partners, with the new payment plans…", required and trimmed: "Describe the deck in a sentence or two." `Field` "Slides" + `NumberInput` 3 to 7 with stepper, default 5, hint "3 to 7 slides"; out-of-range values stay as typed with "Enter a number from 3 to 7." (today 999 silently becomes 7, QA-A) | Cancel · **Generate 3 options** (primary) |
| 2 · Generating | `StageProgress`: "Planning the slides · Writing · Designing", meta "About a minute"; the dialog can be closed and the job continues with a progress toast | Cancel generation (tertiary) |
| 3 · Choose | `RadioGroup variant="card"`, 3 options: the deck title (`title-14`), "5 slides · first slide: New payment plans", and a **Preview** link (opens a PDF preview in a new tab) | Start over (tertiary) · **Download PPTX** (secondary) · **Use in a meeting** (primary; closes the dialog and opens the Start sheet with Present slides → Show my deck and this deck attached). Until MT7 the primary is **Download PPTX** and "Use in a meeting" is absent |

Failure: `InlineError` "Couldn't make the deck. Try again, or shorten the description. **Retry**" with Details. Copy retires "independent of meetings", "no LiveKit" and "no in-meeting agent" (F-UX-016).

### 1.11 How meetings work (`Popover variant="info"`, 280)

"Start a meeting to get a link. The meeting agent joins your video room to present slides or talk through a published flow. With notes on, you get a transcript, summary and action items afterwards. Room time uses your free minutes first; agent time is charged from the wallet." Link: **Plans and rates** (`/billing/plans`). It opens on click or Enter (never hover), holds focus on its content and closes on Esc.

---

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

---

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

---

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

---

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

---

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

---

## 3. New components needed

Built only from existing tokens and primitives: no new colour, size outside the scales, or motion. Files under `components/meetings/` and `components/agents/`; shared ones (`AgentProfileCard`, `LimitsSummary`) under `components/ui/`.

| Component | What it is | Built on | Key props / contract |
|---|---|---|---|
| **RoomCard** | An open room in Live now (§1.6) | `Card` plain, `StatusTag`, `LiveDot`, `Tag`, `IconButton`, `RoomControlRow`, `Button`, `Menu` | `room: { id, title, status: 'open'\|'live'\|'long_open'\|'stale'\|'ending', startedAt, people, code, keyRequired, agent, notes, recording, endsAt? }`; `onOpenRoom`, `onCopyLink`, `onEnd`, `menuItems`. The card holds no billing action; the Agent row never acts from the card |
| **RoomControlRow** | "Agent · In the room · Remove agent" (§1.6 summary, §1.8 full) | `StatusText`, `Button sm`, `VoiceTile` | `kind: 'agent'\|'notes'\|'recording'`, `mode: 'summary'\|'full'`, `state`, `sentence`, `action?: { label, onSelect, guard: 'none'\|'confirm'\|'gate' }`, `disabledReason?` |
| **JoinDetails** | Join link, key and invite (§1.7 Room ready, §1.8) | `Field`, read-only `TextInput`, `IconButton` copy, `Button` | `url`, `code`, `key?: { value?: string; retrievable: boolean }`, `inviteText` (never contains the key), `onCopy(kind: 'link'\|'key'\|'invite')` |
| **AddAgentGate** | The gate for adding the agent to an open room (§1.8) | Specified in `spec/02-components-gate.md` §5.4 | `roomId`, `voice`, `mode` (G §7); this page only configures it |
| **AgentProfileCard** | The meeting persona card, reusable for any agent voice (§1.5) | `Card` plain, `VoiceTile` 32, `KeyValueList`, `LanguageMark`, `IconButton` preview through `useAudioPreview()` (N §12.3) | `voice: { name, style, languages }`, `knowledgeCount`, `capabilities: { id, label, shipped: boolean }[]` (only `shipped` render), `onPreview` |
| **DeckPicker** | The Slides choice in the Start sheet (§1.7, 2a) | `RadioGroup`, `FileField`, `Select` | `value: { kind: 'live' } \| { kind: 'deck', deckId?: string, file?: File }`, `recentDecks`, `onGenerate()`; renders the single-sentence form until MT7 |
| **DeckOptions** | Three generated decks to choose from (§1.10) | `RadioGroup variant="card"`, link button | `options: { id, title, slides, firstSlide, previewUrl }[]`, `value`, `onChange` |
| **LimitsSummary** | A task's limits as one sentence with **Edit limits** (§2.9, §2.10) | Disclosure `Button` (`aria-expanded`), `NumberInput`, `CurrencyInput`, `DatePicker`, `TimeField`, `Select` | `value: { maxCalls?, spendCap?, finishBy?, repeat? }`, `bounds`, `defaults`, `used?` (for "₹42.80 is already spent"); the sentence comes from `describeLimits()` in `lib/format.ts` |
| **AutonomyRow** | One capability's autonomy (§2.11) | `SegmentedControl size="sm"`, `Tag outline` "Default", inline `Notice`, `lock` icon | `capability: { id, label, description, group }`, `value: 'auto'\|'confirm'\|'confirm_2fa'`, `defaultValue`, `locked?: { reason }`, `onChange` |
| **TaskPlan** | A task's plan with results and evidence (§2.10) | `StageProgress` + the Assistant's step marks (AS §19) + link buttons | `steps: { id, label, state, meta?, evidence?: { label, href } }[]` |

## 4. Reconciliations and changes requested to other specs

| Spec | Change | Why |
|---|---|---|
| data-nav §5.3 `lib/status.ts` | **Meeting room:** add `Open` · `door-open` · neutral; `Open {duration}` (interim long-open) · `alert-triangle` · warning; `Ending…` · info. **New domain `meeting-notes`:** Summary ready · `check` · success; Writing notes… · info; Notes off · outline; Couldn't write notes · `circle-x` · danger. **New domain `agent-task`:** the ten states of §2.8 | One map for every room, notes and task state (F-VIS-017) |
| core §3.2 TextInput (meeting title) | A meeting title must be unique among **open** rooms, not across the workspace; past meetings may share a title and are told apart by date | Recurring meetings ("Weekly demo") would otherwise be refused |
| Gate G §2.3 `GateChecklist` | **Adopted** as `collapse="all-pass"` (one success line when every row passes, re-expanding when one stops) with the summary as `role="status"` | Personal agents readiness (§2.6) |
| Assistant AS §19 `ApprovalCard` | Add `variant: 'task-step'` with `from` (task link), `expiresAt`, `decidedElsewhere` ("Approved on WhatsApp at 9:20 am") and `twoFactor` (opens "Confirm it's you", ST §5) | Personal-agent confirmations (§2.7) |
| Knowledge-Billing KB §2.9 Usage | The example "29 of 30 free min used" reads the quota the other way round from the API (60 s used means 29 **left**). Use "29 of 30 free minutes left" everywhere, from one formatter | One truthful free-minute sentence (P1) |
| Overlay O §4.1 and Shell §2.3 | Meeting outputs open as a `detail` sheet from the list and as the page `/meetings/<id>` from links; both render the same tabs (§1.9) | The two specs named different containers |
| Overlay O §10.2 WalletNotice | No change: Meetings stays off the list. The Empty copy "free meeting minutes still work" stays true because rooms open on free minutes; the agent's block is stated in the Start sheet and the Agent row | Blocking-notice rule (D §6.1) |
| Foundations F §12 icons | New uses of existing Lucide glyphs: `door-open` (Open room), `disc` (Recording), `pause` (Waiting for you, shared with the Assistant; user-paused tasks use `circle-pause`), `octagon-pause` (Stopped at limit), `calendar-clock` (Scheduled task). No custom glyphs | Keep one icon per meaning |
| Settings ST Phone setup | A "Personal-agent numbers" part where admins assign a number to a teammate; it is the target of **Assign a number** | The readiness row needs a real destination (F-UX-015) |
| Shell §2.2 badges | "1 to confirm" stays hidden until PA2 ships (computed facts only) | P1 |

## 5. Open questions for the product owner

1. **Free minutes.** Does "29 / 30" mean 29 left (the quota API says 60 s used)? Do free minutes cover only room time or also agent time? The rates conflict (₹2.40/min in Meetings Billing, 1 paisa/s in the public docs; KB §5 Q1).
2. **"Intel".** What does the "Meeting intelligence" toggle produce today, and where are its outputs stored? This spec calls the capability **Notes** (transcript, summary, action items) and hides it until MT3 returns stored outputs.
3. **Idle rooms.** Confirm the reaper rule: stale after 30 min with nobody in the room, ended automatically 15 min later; does a room with only the agent count as empty? Until then the 12 h interim flag applies.
4. **Key-only rooms.** Can the agent, notes and recording work in key-protected rooms? Can the key be shown again after creation (MT9)?
5. **Rooms without the agent.** The API has a "Plain meeting" scope. Should the Start sheet offer "No agent, just a room"? Not included in v1.
6. **Test data.** Archive "ZZ Mobile QA Room 22Sep" and "E2E Test Room 21Sep" in production and add the CI check that fails on QA or E2E fixtures in production data (F-UX-016).
7. **Roles.** Who may start meetings, end another person's room, see every meeting in the workspace (or only their own), use personal agents, and lock autonomy for everyone?
8. **Personal-agent numbers.** One number per user or a shared pool? Does the number cost money? Do WhatsApp messages cost money (the cost line would include them)?
9. **Existing autonomy.** Accounts that set Calls to Auto before limits exist (PA3): keep Auto or move to Confirm until limits ship? This spec recommends Confirm by default for new workspaces.
10. **Retention.** How long are recordings, transcripts and summaries kept? The copy states retention only when the server returns it.
11. **Consumer capabilities.** Should any workspace ever see Homework analysis, Stock research or Stock trade, or should they be removed from the product (F-UX-040)?
12. **The meeting persona.** Are the meeting agent's voice and role editable per workspace? If yes, where ("Make default" in the Start sheet today, or a profile editor)?

## 6. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-UX-037 | medium | §1.7 title rule, Slides, Room ready key hand-off, FlowSwitcher |
| F-UX-038 | medium | §1.6 RoomCard (title first, stale tag, words for state), §1.8 End room in ⋯, §1.9 outputs |
| F-QA-024 | medium | §0.2 MT1, §1.6 exclusive lists and stale rule, §1.9 |
| F-UX-039 | medium | §2.6 readiness and templates, §2.9 New task gate, §2.12 |
| F-UX-040 | medium | §2.9 Main tool groups, §2.11 autonomy groups, PA5 |
| F-UX-016 | medium | A3, §1.14 removed cards and copy, §5 Q6 |
| F-UX-017, F-UX-043 | medium · low | A2, §0.3 redirects, §1.14, §2.14 |
| F-UX-019 | medium | §1.12 and §2.12 error rows (last good data kept, no empty state on failure) |
| F-UX-025 | medium | §1.7 title and §2.9 goal validation (C §8.2) |
| F-UX-015 | medium | §2.6 number row, §2.11 Phone number, §4 Settings request |
| F-UX-014, F-UX-005, F-VIS-037 | medium | §1.7 FlowSwitcher `assign` |
| F-UX-021 | medium | §0.3 Free minutes to Billing › Plans, §1.5 This month card |
| F-UX-035 | medium | §1.6 ⋯ danger group, §1.8 End room, §2.8 Cancel task |
| F-VIS-001, F-VIS-004, F-VIS-005, F-VIS-006 | high · medium | A1, §1.5, §2.5 |
| F-VIS-003 | high | §2.6 template cards on tokens |
| F-VIS-024, F-VIS-034 | medium · low | `formatWhen`; data page, 640 gate sheets, 720 settings column |
| F-A11Y-003 | high | Every control in a `Field` (§1.7, §1.10, §2.9) |
| F-A11Y-008, F-A11Y-009 | high | Tokens only; Neel primary with a white label |
| F-A11Y-016 | medium | RadioGroups, disclosures with `aria-expanded`, SegmentedControl radiogroups |
| F-A11Y-023, F-A11Y-024 | medium | Named IconButtons with 24 / 44 px hit areas |
| F-A11Y-026 | medium | H2 per section (§1.15, §2.15) |
| F-RWD-006 | medium | §1.4 phone layout, §1.16 |
| F-RWD-007 | medium | §2.4 phone header row, §2.16 |
| F-RWD-001 | high | Both destinations in More (Shell §2.2) |
| F-QA-007, F-UX-030 | high · medium | Shell renders at once; skeletons (§1.12, §2.12) |
| EXPLORE-CORE-26 | low | §2.11 one breadcrumb, nav current |
