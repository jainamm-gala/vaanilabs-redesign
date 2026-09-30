---

## 12. Page by page

### 12.0 The matrix (today → v1)

Today's status is the audit's page × breakpoint matrix (3D). v1 is the target: every cell "designed" and tested.

| Page | Archetype | Today 1440 / 1024 / 768 / 390 | v1 phone slot | Owning spec | F-RWD |
|---|---|---|---|---|---|
| App shell | — | minor / **broken** / minor / **broken** | — | N §1, `00` | 001, 005, 013 |
| Home (setup) | B | — (new) | More | `00` part 6 | — |
| Cockpit | D | minor / **broken** / **broken** / **broken** | 1 | `01`, §11 | 002 |
| Assistant | D | OK / OK / OK / minor | More | `02` | 015 |
| Rep console | D | not tested | More | `01` §5 | — |
| Meetings | A + D | OK / OK / minor / **broken** | More | `07` §1, §12.5 | 006 |
| Personal agents | A | OK / OK / minor / **broken** | More | `07` §2, §12.6 | 007 |
| Flows (list) | A | — (new) | 4 | §12.7 | — |
| Flow Designer | D | minor / minor / **broken** / minor | via Flows | §10 | 003, 014 |
| Knowledge | A | OK / minor / **broken** / **broken** | More | `05` §1 | 016 |
| Leads | A | minor / minor / minor / **broken** | 2 | `03` | 011, 012 |
| Call reports | A | minor / minor / minor / **broken** | 3 | `04` §2 | 004, 009, 010 |
| Analytics | B | OK / minor / minor / **broken** | More | `04` §3 | 008 |
| Billing | B + C | OK everywhere (banner only) | More | `05` §2 | 013 |
| Settings | C | OK / minor / OK / **broken** | More | `06`, §12.14 | 001 |
| Login, sign-up | bare | OK / OK / OK / minor | — | `08`, §12.15 | 018 |
| Marketing home, pricing | public | OK / minor / **broken** / minor | — | `08`, §12.16 | 017, 018 |
| Onboarding | → Home | minor at 1440 | — | §12.17 | 019 |

Each card below gives: purpose, findings and what changes, hierarchy, behaviour per breakpoint, responsive-specific states and acceptance. Everything else (full state matrices, copy, keyboard) is in the owning spec.

### 12.1 Home (setup track)

- **Purpose.** "Get your first call live": five steps with computed done states (D §6.1).
- **Hierarchy.** (1) the current step and its one primary action, (2) progress "2 of 5 done", (3) done and blocked steps.
- **Per breakpoint.** ≥1024: 720 px column centred in the page container, steps as a vertical stepper. 768–1023: same column, full width minus margins. <768: full width; the current step's action is a `lg` 44 px full-width button; blocked steps say what blocks them inline ("Blocked: needs money in the wallet"). The setup card also appears in the sidebar, NavSheet and MoreSheet (`00`).
- **States.** All five done → Home leaves the nav and the landing route becomes Cockpit; a toast "Setup complete. Cockpit is now your home." appears once.
- **Acceptance.** [ ] At 320×640 the current step's action is visible within one scroll and never wraps its label. [ ] More carries the current mark on `/home`.

### 12.2 Cockpit

See §11 and `01`. Acceptance in §11.8.

### 12.3 Assistant (F-RWD-015)

- **Purpose.** Ask Vaani to do or explain something; approve its plans (`02`).
- **Findings → change.** The conversation had 241–345 px on phones under a banner, a 130 px header, a composer and a 150 px Plan & Actions card. v1: no banner; the header row scrolls away; the plan becomes a 44 px **PlanBar** ("Plan · 3 steps · 1 waiting") opening a full-screen sheet; New chat and Voice are 44 px IconButtons; suggestion chips in a ScrollRow; placeholder "Ask Vaani…"; composer auto-grows 1–5 rows and stays above the keyboard (`02` §5.2, §5.6).
- **Hierarchy.** (1) the latest turn, (2) the composer, (3) an ApprovalCard when one waits (inline below 1024).
- **Budget.** At 390×844 the thread gets about 560 px with the header row shown and more after it scrolls away (`02` §5.6), against 345 today.
- **Acceptance.** [ ] At 360×780 with the keyboard open, the latest turn and the composer are both visible. [ ] No suggestion chip is cut at the screen edge without an edge fade.

### 12.4 Rep console

See `01` §5 (phone: Answer / Decline sticky bar; Mute · End call + `⋯`; the "keep this screen on" Notice). Additions from §11.5 apply (wake lock during a call; microphone permission from a gesture). **Acceptance.** [ ] At 390×844 an incoming transfer's Answer and Decline are 44 px, 1:1, ≥16 px apart, above the safe area.

### 12.5 Meetings (F-RWD-006)

Owned by `07` §1 (layouts §1.4, responsive summary §1.16). The responsive contract it must keep:

- **Purpose.** Start a meeting room with the agent, see what is live now, read past meeting outputs.
- **Findings → change.** Below 513 px the column was 99–129 px wider than the screen: five `nowrap` 274 px room URLs set its minimum width; Agent overlapped labels; Record was cut; Delete room (32×32) sat flush beside Record and off-screen; the title wrapped to three lines beside a "Free minutes" pill. v1 (`07`): rooms listed by title; room codes truncate from the end with the full value in the Copy button's name; Live now as RoomCards (full width on phones with a full-width **Open room** and `⋯`), Past meetings as ListRows; room controls in the room sheet (full screen on phones); destructive actions only in `⋯` after a separator; every flex child `min-width: 0`, the scroller `overflow-x: clip`.
- **Hierarchy.** (1) Live now and the fact of how long each room has been open, (2) Start a meeting, (3) past meetings and their outputs.
- **Phone.**

```
┌ Meetings              [₹2,340]  ⌕ ┐
│ 1 live · 12 past    ⋯ [Start a m…]│  header row; primary keeps a one-line label
│ Live now                           │
│ ┌ Weekly pipeline review ────────┐ │  RoomCard, full width
│ │ Live · 12 min · 3 people       │ │
│ │ qdr-hkte-…  [copy]             │ │  code truncates from the end
│ │ [      Open room      ]  [⋯]   │ │  44 px; Delete room only inside ⋯
│ └────────────────────────────────┘ │
│ Past meetings                      │
│ Site visit debrief                 │  ListRow
│ 21 Sep · 34 min · Notes ready    › │
├ Cockpit  Leads  Call reports  Flows  More ┤
└────────────────────────────────────┘
```

- **Acceptance.** [ ] At 320, 360 and 390 neither the page nor the room sheet scrolls sideways (scroller `scrollWidth === clientWidth`). [ ] Delete room is never adjacent to Record or Agent and always asks to confirm (F-A11Y-023). [ ] "Free minutes" never shares the H1's row below 768.

### 12.6 Personal agents (F-RWD-007)

Owned by `07` §2 (responsive summary §2.16). The responsive contract:

- **Purpose.** Give a personal agent a task with a goal, approve what it asks, watch it run.
- **Findings → change.** The header never wrapped, so "New task" (the only primary) was pushed to x 362–438 at 390 with a two-line label, and the empty state's "Click New task" was inert text. v1: the PageHeader fold order (§5.9) keeps **New task** visible with a one-line label (`labelShort` "New" only if it still does not fit); Agent settings and Refresh fold into `⋯`; readiness collapses to one 44 px row on phones; the ApprovalCard's primary gets its own full-width row; the empty state's action is a real button.
- **Hierarchy.** (1) a blocking readiness fact, if any, (2) tasks waiting for you, (3) running and done tasks, (4) New task.
- **Acceptance.** [ ] At 320–440 px New task is fully on screen with a one-line label (F-RWD-007, §17.2 check 3). [ ] The empty-state action is a focusable button that opens New task.

### 12.7 Flows (list)

- **Purpose.** Find a flow, see what is live where, open it, start a new one.
- **Hierarchy.** (1) live state and issues per flow, (2) New flow, (3) recency and owner.
- **Per breakpoint.** ≥1280: table Name · State ("Live v7" + "Draft · 3 changes") · Live on ("1 number · 1 batch") · Issues · Edited · Owner · `⋯`. 1024–1279: Owner hidden. 768–1023: P1 (Name, State, Issues) + pinned `⋯`. <768: ListRow — line 1 name + state Tag ("Live v7"); line 2 "Draft · 3 changes · 1 warning · edited 2 h ago". Duplicate names get a disambiguating second line with the id suffix only when needed (F-VIS-037).
- **States.** Empty: "No flows yet." [Browse templates] (template gallery: Dialog lg → full screen on phones, each template a mini Trigger → Logic → Action → Outcome strip that wraps to a vertical strip below 480 px).
- **Acceptance.** [ ] At 390 a flow's live state and issue count are readable without opening it. [ ] New flow from a template works end to end on a phone and opens the flow in phone mode.

### 12.8 Flow Designer

See §10. Acceptance in §10.13.
