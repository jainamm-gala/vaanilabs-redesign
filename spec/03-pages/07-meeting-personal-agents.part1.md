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
