## 2. Cockpit (`/dashboard`)

### 2.1 Purpose and jobs to be done

**Purpose.** The place where an operator starts a call on purpose, watches it with the facts that matter (state, where the agent is in the flow, what has been captured, what it costs), steps in when needed, and closes it out. It also lets a supervisor see and switch between the workspace's live calls.

| Who | Job to be done | Primary action |
|---|---|---|
| Flow builder or admin | "When I've changed a flow, I want to hear it before a customer does." | `Talk in browser` (Browser test) or `Call my phone…` (Test call) |
| Sales or support operator | "When I pick a lead, I want the agent to call them with the right flow and voice, knowing it's allowed, what it costs and that nothing is missing." | `Call Lead 1042…` → Call gate → `Place call` |
| Operator during a call | "While the agent talks, I want to know where it is in the script and what it has captured, so I can take over or transfer if it goes wrong." | Take over · Transfer… · End call |
| Operator after a call | "I want to record the outcome in seconds and move to the next one." | `Save and next` |
| Supervisor | "I want to see every live call and jump into the one that needs me." | Calls column (≥1440) or the Calls switcher |

**Primary job:** start the right call safely. The page answers, in order: *Am I on a call? Who will be called and is it a test or a real person? Can I call right now? Which flow and voice?*

### 2.2 Audit findings addressed

| Finding | Today (evidence) | What changes |
|---|---|---|
| F-UX-003 (high) | Customer Intel shows the latest real lead with demo email, company and city, plus "POSITIVE 72/100" and "3 PREV. CALLS" before any call | The card starts empty with a Contact field that searches Leads. Only real lead fields show, with "from Leads"; missing ones read "Not captured". "Last call" appears only if one exists, from the same source as Leads |
| F-UX-014 | Flow and voice picks silently `PATCH /api/auth/profile`, revert on failure, and change Meetings and Leads | Session-only picks in the URL; "Make default" as a separate link, confirmed by a toast with Undo ("Default flow updated · used by Cockpit, Meetings and Leads") |
| F-UX-026, F-VIS-030, F-A11Y-009 | CONNECT (black on blue, 3.83:1, no title) and teal "Test / Call" (2.95:1, wraps, enables for "abc"); nothing explains which rings a phone | `Talk in browser` (secondary) and `Call Lead 1042…` (primary, white on Neel 7.68:1) at the same height, each saying what it does; the kind line and the gate say it again |
| F-VIS-029, F-A11Y-022, F-A11Y-019 | A 320 px STANDBY ring breathes forever, even under reduced motion; "Awaiting connection…" at 1.77–2.4:1 | Ring removed. The New call card leads; the transcript empty state is `body-14` `text-2`. Only the live dot and real meters move, never under reduced motion |
| F-VIS-007, F-RWD-002 (high) | At 1024×768 and 1100×700 CONNECT is drawn over the transcript; at 720×450 controls overlap and cannot be scrolled; below 1024 Intel, flow and session status disappear | Flex columns with `min-height: 0` and their own scroll; the card's action bar is sticky inside the card; every breakpoint keeps flow, contact, state and actions reachable (§2.4) |
| F-UX-018 | "SYS: ONLINE", random "22ms", "RGN: Mumbai-1", "LAT: 0ms", "SESSION: IDLE" | Removed. LineQuality only during a call, from real stats |
| F-UX-013, F-A11Y-004 | Every call control enabled at ₹0 with the caller ID pending; no pre-flight | Readiness checklist on the card, Call gate on every phone call, `C` opens the gate, `⌘/Ctrl+Enter` confirms |
| F-QA-020, F-QA-021, F-UX-025 | "abc" enables Test Call; the error appears in the transcript 450 px away; "Context Saved" shows whether or not the save worked | PhoneInput validation under the field; blocked actions carry reasons; saving to a lead uses SaveState ("Saved 11:24 am" / "Couldn't save · Retry") |
| F-UX-005, F-FLOW-012, F-FLOW-014, F-VIS-037, F-VIS-013 | A 150 px, 10 px mono select with hash suffixes; the live flow described four ways; no link to the builder | FlowSwitcher `purpose="call"` (240 px minimum, Live and Draft tags, middle truncation) plus "Open in flow" |
| F-A11Y-003, F-A11Y-020, F-A11Y-006 | 7 of 8 controls unlabelled; placeholders as names; focus at 2.11:1 on intel inputs | Every control in a `Field` with a real label; the global focus outline |
| F-A11Y-014, F-A11Y-013 | Call state, transcript and results never announced; one title for every route | Announcer for state changes and final turns (throttled); state-aware `<title>` |
| F-VIS-016, F-VIS-001, F-VIS-002, F-VIS-022, F-QA-038 | Box-in-box intel fields in 9–10 px uppercase mono; grid texture and noise overlay behind the page | One level of containment, `label-13` labels, sentence case, no textures |
| F-VIS-034 | At 1920 the centre column is about 1,150 px of empty grid | Fixed card column (400) and a transcript column that holds real content (live turns, or the lead's previous calls) |
| F-QA-006, F-QA-037 | Each browser test is stored as two legs; old calls stuck in "QUEUED" | One conversation per Browser test (backend §6); stuck calls read "Timed out" |
| F-UX-028, F-UX-002, F-RWD-013, F-A11Y-015 | A 42 px lavender wallet bar with Top up opening Profile, as an assertive alert | WalletNotice (page scope, Cockpit is a spending page), the Baseline segment and the readiness row; every Top up opens `/billing?topup=1` |
| F-UX-006 | "You're live" at ₹0 with no calling number | The readiness checklist and the setup card say what is missing; the Cockpit never claims "live" |
| F-UX-017, F-RWD-001, F-UX-034, F-QA-018 | Four names; unreachable destinations on phones; forbidden routes redirect here | §1.4 |
| F-UX-045 | Session replay and autocapture load on a page that shows lead data and transcripts | Replay off on `/dashboard` and `/rep-console`; telemetry events carry no personal data (§4.7) |
| F-QA-007, F-UX-030 | Full-screen "Loading…" with no shell for 2.6 s | Shell and header render immediately; only data regions skeletonise |

### 2.3 Information hierarchy

**Idle (New call card in the centre)**
1. **The target and the kind:** Contact field and the kind line ("Real call to Lead 1042").
2. **The primary action and its state:** `Call Lead 1042…` (or its disabled reason) beside `Talk in browser`.
3. **Readiness:** the checklist summary ("All 5 checks pass" / "Phone calls blocked · 1 thing to fix").
4. **Configuration:** Flow (name, version tag), Voice, Language.
5. **Context:** Lead details (sourced), and in the transcript column the lead's previous calls.
6. **Workspace activity:** Calls column (live now, up next, recent) at ≥1440.

**Live (call card in the centre)**
1. **Call state and timer** (CallStateTag, `mono-20` timer), with the kind tag.
2. **The conversation** (the transcript column is the largest element, P7).
3. **Where the agent is** (Now in the flow) and **what's captured** (Captured so far · 2 of 3).
4. **Controls:** End call (danger outline, far right), Take over, Transfer….
5. **Quality and cost:** LineQuality, cost so far, voice.

### 2.4 Layout and wireframes

Chrome follows the shell spec (data-nav §1): sidebar 232 at ≥1280, rail 56 at 1024–1279, TopBar 52 below 1024, bottom bar below 768, Baseline 28 on desktop and laptop. `main` scrolls (`overflow-y: auto`); inside the Cockpit body each column is a flex column with `min-height: 0` and its own scroll, so no control can ever be drawn over another (F-RWD-002).

**Desktop ≥1440, idle, lead chosen** (content width at 1440 = 1208)

```
+-Sidebar 232-------+--------------------------------------------------------------------------------------------+
| [S] Sample Realty | Cockpit   No calls in progress                                                 (no actions)|  PageHeader 56
| Search or jump... +---------------------+------------------------------------+-----------------------------------+
| Operate           | Calls          240  | New call                      400  | Transcript                   rest |
| > Cockpit         | [+] New call   <sel>| Contact                            |                                   |
|   Assistant       |                     | [ Lead 1042 · +91 ••••••4821  x v] |   The transcript appears here     |
|   Rep console     | Live now          0 | Lead details          Open lead    |   once a call connects.           |
|   Meetings        |  No calls live.     |  Status     Callback due           |                                   |
|   Personal agents | Up next   Scheduled |  City       Pune       from Leads  |  Previous calls with Lead 1042    |
| Build             |  Weekend follow-ups |  Language   (A) Hindi             |  21 Sep · 2m 31s · Callback  Open |
|   Flows           |  2 of 48 · 11:30 am |  Last call  21 Sep · Callback      |  "Call me Saturday morning..."    |
|   Knowledge       |  [Pause] [Cancel...]|  Budget     Not captured           |  18 Sep · 41s · No answer    Open |
| Data              | Recent              |  Edit for this call...             |                                   |
|   Leads           |  10:12 am  Lead 0991|                                    |                                   |
|   Call reports    |   Visit booked      | Flow                               |                                   |
|   Analytics       |  9:31 am  Browser   | [ Site-visit qualifier  Live v7 ⇕] |                                   |
| Account           |   test · Draft v8   |  Tested today 10:12 am · Open flow |                                   |
|   Billing         |                     | Voice                              |                                   |
|   Settings        |                     | [Va Vaani · Hindi + English  > v ] |                                   |
|                   |                     | For this call only · Make default  |                                   |
|                   |                     | Language [ Auto · Hindi + Eng  v ] |                                   |
|                   |                     | Readiness   Ready · 1 thing to know|                                   |
| (AR) Anika R.     |                     |  i Called 22 h ago · Show all 5    |                                   |
|                   |                     |------------------------------------|                                   |
|                   |                     | Real call to Lead 1042 · ₹0.04/s   |                                   |
|                   |                     | [mic Talk in browser][Call Lead 1042...] <- sticky card footer         |
+-------------------+---------------------+------------------------------------+-----------------------------------+
| Baseline 28: Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │ Wallet ₹2,340.50 · about 16 h of calls │ Shortcuts  Search |
+----------------------------------------------------------------------------------------------------------------+
```

- The header has **no call buttons while the New call card is shown**, so there is never a duplicate primary. When the centre shows a call, the header gains `New call` (secondary, `plus`) which selects the New call item.
- WalletNotice (when low or empty) sits between the PageHeader and the columns, full content width, one line.

**Desktop ≥1440, live call selected**

```
| Cockpit   1 live call · 2 up next                                    [+ New call]                                 |
+---------------------+------------------------------------+-------------------------------------------------------+
| [+] New call        | Live ·  Outbound · Site-visit v7   | Transcript  Streaming          [search] [copy] [...]  |
| Live now          1 |                            02:14   | 00:09 | Vaani (A) Step · Greeting                    |
| (•) Lead 1042 <sel> | (L) Lead 1042  +91 ••••••4821      |       | Namaste, main Vaani bol rahi hoon...          |
|     02:14 · v7      |     [Recording · disclosed 00:01]  | 00:17 | Caller (A)                                    |
| Up next   Scheduled | Dialling -- Ringing -- Live -- Wrap|       | Haan ji, boliye.                               |
|  Weekend follow-ups | Talk  Agent 58% · Caller 42%       | 00:21 | Vaani (A) Step · Ask about a site visit       |
|  2 of 48 · 11:30 am |  =====  ===   ====      (agent)    |       | You had enquired about a 2 BHK...             |
| Recent              |     ==    ===    ==     (caller)   | 00:41 | Vaani (A) Knowledge · price-sheet.pdf         |
|  10:12 am Lead 0991 | Now in the flow   Open in flow     |       | 2 BHK homes start at ₹85 lakh...              |
|   Visit booked      | <> Ask about a site visit · 3 of 8 | 02:12 | Caller (AA) speaking...                       |
|  9:31 am Browser    | Voice   Vaani · Hindi + English    |       | Haan, eleven works, bas address...            |
|   test · Draft v8   | Line    Good · 180 ms              |                                                       |
|                     | Cost    ₹5.36 so far · ₹0.04/s     |                 [Jump to latest · 2 new]              |
|                     | Captured so far             2 of 3 |                                                       |
|                     |  Preferred day  Saturday, morning  |                                                       |
|                     |  Budget         ₹85 L to ₹1 Cr     |                                                       |
|                     |  Site visit     Waiting for an ans…|                                                       |
|                     | > Lead details (4 from Leads)      |                                                       |
|                     |------------------------------------|                                                       |
|                     | [Take over] [Transfer...]  [End call] <- sticky card footer                                |
+---------------------+------------------------------------+-------------------------------------------------------+
| Baseline: Live v7 │ Inbound +91 80 •••• 2210 · Ready │ Wallet ₹2,340.50 · about 16 h of calls │ (•) On call 02:14 · Lead 1042 │ Shortcuts  Search |
```

**Laptop 1280–1439** (sidebar 232; content 1048–1207). The Calls column folds into the **CallSwitcher**, a secondary Button in the PageHeader: `Calls · 1 live` with `chevron-down`, opening a 320 px Popover with the same groups (New call, Live now, Up next, Recent). The body is card 400 | transcript (648–807).

```
| Cockpit   1 live call · 2 up next                          [Calls · 1 live v] [+ New call] |
+------------------------------------+-------------------------------------------------------+
| call card (400, scrolls)           | Transcript (rest, scrolls)                            |
| ...                                | ...                                                   |
| [Take over] [Transfer...] [End call]                                                       |
```

**Laptop 1024–1279** (rail 56; content 968–1223). Same as 1280 with the rail. At **1024×768**: header 56 + card body 684 + Baseline 28 = 768; the card scrolls internally and its footer stays visible. With a WalletNotice (40), the card body is 644 and still scrolls; nothing overlaps (F-VIS-007). At heights of 720 px or less, the Baseline folds into a header chip (foundations §5).

```
+rail+------------------------------------------------------------------------------+
| [V]| Cockpit   No calls in progress                                               |
| .. +---------------------------------+-------------------------------------------+
| .. | New call (400, scrolls)         | Transcript / previous calls               |
| .. | Contact ... Flow ... Voice ...  |                                           |
| .. | Readiness  1 thing to fix       |                                           |
| .. |  ! Wallet is ₹0. Top up to ...  |                                           |
| .. |---------------------------------|                                           |
| .. | [Talk in browser][Call Lead ...]| (primary aria-disabled, reason inline)    |
+----+---------------------------------+-------------------------------------------+
| Baseline 28                                                                     |
```

**Tablet 768–1023** (TopBar 52 with menu, title, call chip, wallet chip, search). Single pane. Idle: the New call card is the page, max width 640, centred; inside it, a container query at ≥560 puts Voice and Language side by side and the two actions 1:1 in the footer. The lead's previous calls sit under the card.

```
+-----------------------------------------------------------------------------+
| [=] Cockpit                                   [₹2,340] [search]             |  TopBar
+-----------------------------------------------------------------------------+
|         New call                                                            |
|         Contact [ Lead 1042 · +91 ••••••4821                         x v ]  |
|         Lead details ...                                                    |
|         Flow [ Site-visit qualifier  Live v7 ⇕ ]                            |
|         Voice [ Vaani · Hi+En > v ]     Language [ Auto v ]                 |
|         Readiness  All 5 checks pass  Show                                  |
|         Real call to Lead 1042 · ₹0.04/s                                    |
|         [ Talk in browser          ] [ Call Lead 1042...        ]  sticky   |
+-----------------------------------------------------------------------------+
```

Live on tablet: a compact CallHeader (rows 1 and 2) stays at the top of the pane; under it a `SegmentedControl` **Call · Transcript (2 new)** switches the pane (`?tab=`). The call's controls sit in a sticky bottom bar (44 px buttons, since tablets are usually touch): `Take over` · `Transfer…` · `End call` (right, separated by `space-16`). With more than one live call the TopBar call chip reads "2 live" and opens the CallSwitcher as a sheet.

```
| [=] Cockpit                         [(•) Live 02:14] [₹2,340] [search] |
| Live · Outbound                                  02:14                  |
| (L) Lead 1042  +91 ••••••4821   Recording · disclosed 00:01             |
| [ Call | Transcript (2 new) ]                                           |
| ... selected pane, scrolls ...                                          |
| [Take over]  [Transfer...]                          [End call]  sticky  |
```

**Phone 320–767** (TopBar 52, bottom bar 56 + safe area, touch density: 44 px controls, 16 px field text).

Idle: one column. Contact and **Flow are always visible** (F-RWD-002: an operator must see which flow they are testing). Voice and Language sit in a disclosure row "Voice and language · Vaani · Auto" that opens a bottom sheet. Lead details are a disclosure ("Lead details · 4 from Leads"). The actions sit in a sticky bar above the bottom navigation: two buttons, 1:1, secondary first.

```
+-------------------------------------+
| Cockpit          [₹2,340] [search] |  TopBar
+-------------------------------------+
| Contact                             |
| [ Lead 1042 · +91 ••••••4821   x v ]|
| > Lead details · 4 from Leads       |
| Flow                                |
| [ Site-visit qualifier  Live v7  ⇕ ]|
| > Voice and language · Vaani · Auto |
| Readiness  All 5 checks pass  Show  |
|                                     |
| Real call to Lead 1042 · ₹0.04/s    |
| [Talk in browser] [Call Lead 1042…] |  sticky, 44 px
+-------------------------------------+
| Cockpit  Leads  Call reports  Flows  More |  BottomBar
+-------------------------------------+
```

A name that does not fit the button uses `labelShort` "Call lead…" or "Call my phone…"; the kind line directly above always carries the full target. The Call gate opens as a full-width bottom sheet with `Place call` sticky above the safe area (overlay §5.4).

Live on phone: the CallHeader (state, timer, lead, kind tag) is sticky under the TopBar; a "Call details" disclosure holds Now in the flow, Captured so far, LineQuality and cost; the transcript fills the rest. A sticky 44 px bar holds `Take over` and `End call`; `Transfer…` moves into the bar's `⋯` menu (direction §6.2).

```
+-------------------------------------+
| Cockpit [(•) Live 02:14] [₹2,340] [search] |
| Live · Outbound            02:14    |  sticky
| Lead 1042 · Recording · disc. 00:01 |
| > Call details · step 3 of 8 · 2/3  |
|-------------------------------------|
| 00:21 Vaani (A) Step · Ask about... |
| You had enquired about a 2 BHK...   |
| 00:34 Caller (AA)                   |
| Saturday ho sakta hai, but...       |
|        [Jump to latest · 2 new]     |
| [Take over]        [End call] [...] |  sticky, 44 px
+-------------------------------------+
| Cockpit  Leads  Call reports  Flows  More |
+-------------------------------------+
```

At 200% zoom on a 1440 display (720 CSS px) the tablet layout applies; at 400% (360 CSS px) the phone layout applies. Nothing scrolls sideways at 320 (WCAG 1.4.10).
