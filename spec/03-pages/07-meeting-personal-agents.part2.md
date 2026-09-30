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
