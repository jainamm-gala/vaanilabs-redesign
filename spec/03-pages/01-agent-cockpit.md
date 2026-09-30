<!-- Assembled from 01-agent-cockpit.part1.md, 01-agent-cockpit.part2.md, 01-agent-cockpit.part3.md, 01-agent-cockpit.part4.md, 01-agent-cockpit.part5.md, 01-agent-cockpit.part6.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 03-pages · 01 · Agent Cockpit and Rep console

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** cockpit (`/dashboard`, labelled **Cockpit**; `/rep-console`, labelled **Rep console**)
**Follows:** `spec/00-design-direction.md` (Sutradhar, especially §2 P1, P3, P7, §4 and §6.2), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `spec/02-components-core.md`, `spec/02-components-data-nav.md` (§12 voice components) and `spec/02-components-overlay-feedback.md`. Components are named as those specs name them. Anything they do not cover is specified in §7 "New components needed".
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-RWD-…, F-A11Y-…, F-QA-…) refer to `audit/consolidated/`. Raw ids (EXPLORE-CORE-…) refer to `audit/raw/explore-core.md`. Only the idle Cockpit and an offline Rep console were observed in the audit; live, ringing and ended states are designed from the product map, not from observation (00-summary §6).
**Privacy:** every lead, rep, flow, workspace and number in this spec and its mock is fictional ("Lead 1042", "+91 •••••• 4821"). No customer or lead data from the audit appears here.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/01-agent-cockpit.md`, assembled from `.part1.md` to `.part6.md` (edit the parts, then re-assemble with `cat`) |
| Reference mock (Cockpit idle, gate, live, wrap-up, laptop, phone; Rep console ringing, blocked and phone) | `spec/03-pages/01-agent-cockpit.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `spec/03-pages/01-agent-cockpit-light.png` (full page, light), `-dark.png` (full page, dark) |

**Contents.** Part 1: §0 decisions, §1 the shared call model (call kinds, states, readiness, naming, URLs). Part 2: §2 Cockpit purpose, findings, hierarchy and wireframes for every breakpoint. Part 3: §3 Cockpit regions and components with configuration. Part 4: §4 Cockpit states with copy, interactions and keyboard, microcopy, accessibility, responsive rules, telemetry and acceptance criteria. Part 5: §5 Rep console, complete. Part 6: §6 backend dependencies, §7 new components needed, §8 open questions, §9 traceability.

---

## 0. Decisions

Today's Cockpit is a single-session console whose centre is a 320 px animated STANDBY ring, with two unexplained call buttons under it (CONNECT dials nobody and uses the browser mic; Test Call dials whatever was typed, "abc" included), a Customer Intel panel that mixes the latest real lead with demo data, a flow picker that silently rewrites the account default, and a "SESSION: IDLE · LAT: 0ms" strip (F-VIS-029, F-UX-026, F-UX-003, F-UX-014, F-UX-018). The Rep console marks a rep available the moment the page opens and shows raw SDK errors (F-UX-023). The redesign keeps the three-column idea the audit praised (context | stage | transcript, 00-summary §4) and replaces everything decorative with facts and gates.

**D1. Three call kinds, always named.** Every call started from these pages is exactly one of **Browser test**, **Test call** or **Real call** (§1.1). The kind is computed from the target and the flow revision, printed on the button, repeated in the Call gate and carried on the live card, the Calls column, the TopBar chip and Call reports. Nobody has to infer from a button colour whether a customer's phone is about to ring.

**D2. The primary button names who gets called.** `Call Lead 1042…`, `Call +91 98765 43210…`, `Call my phone…`. Never CONNECT, never a bare "Test Call". The trailing "…" is honest: every phone call goes through the Call gate (P3). `Talk in browser` is the separate, secondary action, and it never rings a phone.

**D3. No single key and no single click dials.** `C` or the primary button opens the Call gate; the gate starts the call with its own button or `⌘/Ctrl+Enter` (F-A11Y-004, F-UX-013). There is no skip setting, for admins either (direction §1.3).

**D4. Readiness is shown before the click, not discovered after it.** The New call card carries an inline gate checklist (wallet, caller ID, flow, calling hours, microphone, and per lead: DND and recently called). A blocked action is `aria-disabled` and says why and how to fix it (core §1.6, F-QA-020).

**D5. One stable frame for idle and live.** The centre column is always "the card" (New call or a call) and the right column is always "the transcript". Starting a call swaps the card's content; nothing jumps across the page. At ≥1440 a Calls column on the left lets supervisors switch calls (direction §6.2).

**D6. Pickers are session-only.** Flow, voice and language choices apply to this call, live in the URL, and never write the account default. "Make default" is a separate link with a toast and Undo (F-UX-014).

**D7. Lead context is sourced or absent.** The card shows only fields that exist on the chosen lead, each with its source; missing fields read "Not captured". No demo seeds, no pre-call sentiment. SAVE CONTEXT splits into "Use for this call" and an explicit "Also save to lead" (F-UX-003, F-QA-020).

**D8. Rep presence is explicit.** Opening the Rep console never registers presence, fetches a softphone token or opens a socket. The rep presses **Go available**; the page proves the route (call channel), the microphone and the connection first, and clears presence when the tab closes (F-UX-023).

**D9. Latency is a call fact.** "SYS: ONLINE", "LAT", "RGN" and "SESSION: IDLE" are removed. During a call, LineQuality says "Line · Good · 180 ms" from real WebRTC stats (F-UX-018).

**D10. Nothing decorative moves.** The ring, the breathing "Awaiting connection…" and the STANDBY blink are deleted. The live dot (only while a call is live) and meters driven by real audio are the only loops, and both stop under reduced motion (F-A11Y-022, foundations §11).

---

## 1. The shared call model (Cockpit, Rep console, Leads, Call reports, flow Test panel)

### 1.1 Call kinds: test versus real

| Kind | Started by | Who hears the agent | Phone line | Flow revisions allowed | Billed | Recording | In Call reports and KPIs | Marker |
|---|---|---|---|---|---|---|---|---|
| **Browser test** | `Talk in browser` | Only you, through your microphone and speakers | None | Live or Draft | As the product owner decides (§8 Q2). The card states the real rule: "Not billed" or "Billed at ₹0.02/s" | Off (RecordingPlayer "unavailable" copy) | Stored as **one** conversation (F-QA-006), tagged Test, excluded by default | `Tag outline` with `monitor` icon: **Browser test** |
| **Test call** | `Call my phone…` (a number verified as yours in Profile or Phone setup) | You, on your phone | Yes | Live or Draft | Yes, at the phone rate | Per workspace setting | Tagged Test, excluded by default | `Tag outline` with `flask-conical` icon: **Test call** |
| **Real call** | `Call Lead 1042…` or `Call +91 …` (anyone else) | The person you call | Yes | **Live only** | Yes | Per workspace setting, with the disclosure time shown | Counted | No test tag. The Call gate title reads "Call Lead 1042" (no question mark, G §1.4) and the live card carries "Recording · disclosed 00:01" when recording |

Rules:
1. **The kind is computed, not chosen.** Inputs: the target (none, your verified number, anything else) and the flow revision (Live or Draft). The client computes it for display; the server recomputes it at call creation and rejects mismatches (a Draft on a Real call returns 422 with the gate's copy).
2. **A Draft never reaches a real person.** FlowSwitcher `purpose="call"` lists drafts as "Draft · test calls only" (core §5.4). Choosing a draft and a lead turns the primary into a blocked state: "Draft v8 can only call your own number. Use Live v7 or Call my phone." with both as links.
3. **The kind line.** Directly above the actions, one StatusText (`sm`, neutral) states the kind in words: "Real call to Lead 1042 · billed at ₹0.04/s" / "Test call to your phone +91 •••••• 4821 · billed at ₹0.04/s · not counted in reports" / (Talk in browser needs no line; its helper says "Uses your microphone. Nobody else is called.").
4. **Everywhere after the click the kind travels with the call:** the Call gate title and tag, CallHeader row 2, the Calls column item, the TopBar call chip's accessible name ("Live test call, 01:12"), the Baseline segment ("On test call 01:12"), the transcript footer and the Call reports row (`Test call` outline tag).
5. **Test calls never write lead outcomes.** A Test call or Browser test has no wrap-up form and never changes lead status, even when the flow's Outcome step runs.

### 1.2 Call states (one machine, one look)

Cockpit and Rep console use `CallStateTag`, `CallStepper` and `CallHeader` exactly as data-nav §12.1 defines them: Idle → Dialling… → Ringing… → Live ⇄ On hold → Wrap-up → Ended, with No answer, Busy, Voicemail and Failed as terminal outcomes; inbound and transferred calls start at Ringing. Additions for these pages:

| Addition | Where | Rule |
|---|---|---|
| **Placing** (client-only, not a call state) | Primary button in the gate | Label "Placing call…", `aria-busy`, until the server returns the call id. Only then does CallHeader appear with "Dialling…" (data-nav §12.1 "Connecting…" rule). A request that fails here never shows Dialling |
| **Taken over** (a mode of Live, not a new state) | Cockpit call card | CallStateTag stays "Live"; a neutral Tag "You're talking" joins row 2 and the agent line reads "Vaani is paused". Ends with "Hand back to Vaani" |
| **Transferring…** | Cockpit call card | Pending tone (warning tokens), `phone-forwarded`; resolves to "Transferred to Rep 2" (Ended, neutral) or back to Live with "Transfer didn't connect. Vaani is back on the call." |
| **Stuck** | Any card or list item | Dialling or Ringing for more than 60 s without a server event shows "No update for 60 s · Check status" (`warning-text`), never a frozen timer. Calls stuck in queued or in progress past the reaper window read "Timed out" (F-QA-037) |

State changes are announced through the shell announcer, debounced 500 ms (data-nav §12.1). The timer and the cost are never announced.

### 1.3 Readiness (the inline gate)

Readiness is the **Call gate's check catalogue** shown before the click. Kinds (`pass · blocking · advisory · adjusted · checking · unknown`), marks, the summary grammar, the wallet ₹0 rule and every check's id and copy are specified once in `spec/02-components-gate.md` (G §2, §4.4, §5.1). The card reads them from `GET /api/calls/readiness?target=&flow=&kind=` and renders them with **GateChecklist** `context="inline"` `collapse="passing"`; the Call gate preflights again when it opens (G §4.3).

**Cockpit configuration**

| Kind (§1.1) | Rows the card shows (G §5.1 ids) | Global blockers: the primary is `aria-disabled` with the reason and opens no gate (G §4.4) |
|---|---|---|
| Browser test | `microphone`, `connection` (and `wallet` only if Browser tests are billed, §8 Q2) | offline · microphone blocked |
| Test call | `wallet`, `caller_id`, `flow_tested`, `role`, `connection` | wallet ₹0 · no verified caller ID · offline · role |
| Real call | `wallet`, `caller_id`, `flow_live` (with `flow_tested` as its meta line), `calling_hours`, and for a lead `dnd`, `recent_call`, `do_not_call`; `role`, `connection` | wallet ₹0 · no verified caller ID · no live flow · offline · role |

- A Draft chosen for a Real call is an in-card `blocking` row with both fixes as links: "Draft v8 can only call your own number. Use Live v7 or Call my phone." (rule §1.1.2).
- "Outside calling hours" does not disable the primary: the gate offers "Schedule for 10 am IST" (G §5.1 choice).
- **Collapsed passing rows** ("Show all 5 checks", remembered per user) come from rendering this mock: with every row expanded the New call card overflowed a 1440×900 screen and five green rows buried the one that mattered (G §2.3).
- Until the readiness endpoint ships (B3), the card shows only wallet, caller ID, flow, role and connection, plus G §6.3's one advisory row "Calling hours, DND and recent calls aren't checked here yet." Missing rows are never shown as passing.

### 1.4 Names, titles and routes

| Thing | Today | v1 |
|---|---|---|
| Destination | "Agent View" (rail), "AGENT COCKPIT" (H1), "Agent" (phone), "Dashboard" (URL, Rep console back link, onboarding CTA) (F-UX-017) | **Cockpit** everywhere, from `lib/nav.ts`; icon `activity`; Operate group; phone bottom-bar slot 1 |
| Route | `/dashboard` | `/dashboard` stays the route in v1 (onboarding CTA, bookmarks); `/cockpit` is added as an alias that redirects to it. Renaming the path is §8 Q1 |
| `<title>` | "Vaani Labs - The Voice AI that speaks India" on every route (F-A11Y-013) | "Cockpit · Vaani Labs"; while a call is shown: "Live call · Cockpit · Vaani Labs" (state word only, changed on state change, never per second) |
| Rep console | "Rep console" in mono, "← Dashboard" back link, same tab title as every page | **Rep console** (icon `headphones`, Operate group, More sheet on phones); no back link (it is a top-level destination); `<title>` "Available · Rep console · Vaani Labs", "Incoming call · Rep console · …", "On call · Rep console · …", "Offline · Rep console · …" |
| Forbidden routes | `/knowledge/proposals` and `/admin` silently redirect to the Cockpit (F-UX-034, F-QA-018) | The Cockpit is never a fallback: those routes render `Forbidden` in the shell |

### 1.5 URL state and storage (P5)

| Param | Meaning | Written by |
|---|---|---|
| `?call=<callId>` | The call shown in the card (live, ringing or ended today) | Calls column, CallSwitcher, TopBar call chip, Baseline segment |
| `?new=1&lead=<leadId>&flow=<flowId>&voice=<voiceId>&lang=<code>` | The New call card and its session-only picks | Card pickers (`replaceState`), Leads "Open in Cockpit", Call reports "Call again…" |
| `?tab=call|transcript` | Tablet and phone pane | SegmentedControl |

- **Never in the URL:** a typed phone number, names, notes (privacy rules). A typed number that is not a lead lives in `sessionStorage` for this tab only, wrapped in try/catch, cleared after the call.
- Session picks survive reload through the URL, so nothing needs to be written to the profile (D6).
- `localStorage` holds only per-user conveniences: "Show all checks" expanded, the transcript "Read new turns aloud" switch (mirrored server-side as a UI preference when the endpoint exists).

---

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

---

## 3. Cockpit regions and components (with configuration)

### 3.1 Page frame

| Region | Component (spec) | Configuration |
|---|---|---|
| Header | `PageHeader variant="page"` (data-nav §2) | H1 "Cockpit" (`title-20`, `tabindex="-1"`). Meta (computed, `data-13` `text-3`): "No calls in progress" · "1 live call · 2 up next" · "Checking calls…" (skeleton bar while loading, never "0 calls"). Actions only while a call is shown in the card: `CallSwitcher` (below 1440) and `Button variant="secondary" leadingIcon={Plus}` "New call" |
| Page notices | `WalletNotice page="cockpit"` (overlay §10.2), `ConnectionBar` (overlay §10.3) | One line under the header; at most one page notice (most severe first). No notice for setup: the readiness checklist carries it |
| Body | CSS grid | ≥1440: `grid-template-columns: var(--size-cockpit-calls) var(--size-cockpit-card) minmax(0,1fr)`; 1024–1439: `var(--size-cockpit-card) minmax(0,1fr)`; below 1024: one column. Gap 0; columns separated by 1 px `border` hairlines on `surface`; the body fills `100dvh` minus chrome, and each column is `display:flex; flex-direction:column; min-height:0` with its own `overflow-y:auto` |
| Baseline | Baseline (direction §6.1) | Segments: call in progress with its timer (links to `?call=`), live flow and version, inbound number readiness, wallet with runway, calls in progress. The call segment names the kind for tests ("On test call 01:12") |
| Nav badge | `NavBadge kind="live"` on Cockpit (data-nav §1.5) | "2 live", pulsing LiveDot while at least one call is live; nothing when idle |

### 3.2 Calls column (≥1440) and CallSwitcher (below 1440)

New component **CallsColumn** (§7.4). 240 px, `bg` plane (it is navigation-like), right hairline.

| Part | Spec |
|---|---|
| "New call" item | First row, 40 px, `plus` 16 + "New call" `label-13`. Selected when the card shows the New call form (`?new=1` or no `?call`) |
| Group headers | `label-12` `text-3` sentence case with a CountBadge: "Live now 1", "Up next · Scheduled", "Recent". Headings are `h2` visually styled as group labels |
| Call item (`CallListItem`) | 2 lines, min height 48, padding `space-8 space-12`, radius-6. Line 1: name (`data-13`/500, `translate="no"`, ellipsis) + right-aligned `Timer` (`meta-12` tabular, live) or time (recent). Line 2 (`meta-12` `text-3`): state word with its icon (CallStateTag `default` for live and ringing; the StatusTag call result for recent) · flow and version · a `Tag outline` "Test" for Browser tests and Test calls · `phone-incoming` icon for inbound. Hover `surface-2`; selected = selection treatment (accent-soft + 2 px inset `accent-mark` bar) with `aria-current="true"` |
| Batch item (`BatchItem`) | Name (`data-13`/500), "2 of 48" (`meta-12`, tabular), "Next · 11:30 am" (no lead name if the viewer cannot see it), then `Button size="sm" variant="secondary"` "Pause" and `variant="tertiary"` "Cancel…" (ConfirmDialog tier 2: "Cancel 'Weekend follow-ups'? 46 calls won't be placed. Calls already placed stay in Call reports.") |
| Empty groups | Compact EmptyState lines: "No calls live." · "Nothing scheduled." · "No calls yet today." |
| Scope | Live now lists every live call in the workspace that the viewer can open in Call reports (supervisors see all, §8 Q3). Recent lists today's calls started from this workspace, newest first, 20 max, then "Open Call reports" |
| Keyboard | One tab stop for the list (roving tabindex): ↑/↓ move, Home/End jump, Enter opens the item (`?call=`). Pause and Cancel are reached with Tab from a focused batch item |

**CallSwitcher** (§7.4): `Button variant="secondary"` "Calls · 1 live" + `chevron-down`, `aria-haspopup="dialog"`, opening `Popover variant="default"` at 320 px with the same content. Tablet and phone: the TopBar call chip opens it as a bottom sheet when more than one call is live; with one call the chip links straight to it.

### 3.3 The New call card (`ReadyToCallCard`, §7.1)

A `section` on `surface` filling the card column (no outer border inside the column; one level of containment), padding `space-panel-pad-lg` (20). Heading `h2` "New call" (`title-16`), not "Ready to call": the card must not claim readiness it hasn't proven (P1). Form spacing: `space-field-gap` between fields, `space-group-gap` between groups. Standard density always (forms, P4); Touch on coarse pointers.

| # | Field | Component | Configuration and copy |
|---|---|---|---|
| 1 | **Contact** | `ContactField` recipe (§7.3): `Combobox` + `PhoneInput` (core §4.1, §5.3) | Label "Contact". Hint "Search leads by name or number, or type a number." Placeholder "Name or number…". Listbox groups: **You** ("My phone · +91 •••••• 4821 · Verified", or "Add your number in Profile to test on your phone" when none is verified); **Leads** (two-line options: name + StatusTag / masked number · city · LanguageMark); **Number** (typing 10 digits offers "Call +91 98765 43210", with "Already a lead · Open" when it matches one). Clear button `x` resets the target. Validation per PhoneInput ("Enter a 10-digit mobile number, like 98765 43210."). Optional for `Talk in browser` |
| 2 | **Lead details** (only with a lead) | `KeyValueList variant="inline"` (data-nav §8) with an `h3` "Lead details" and a link `Open lead` (lead sheet in Leads, new tab) | Rows: Status (StatusTag), City (source "from Leads"), Language (LanguageMark), Last call ("21 Sep · Callback", or "No calls yet"), then **the fields this flow uses** (its lead variables), each with its value or "Not captured". Never email, company or sentiment unless the lead record has them. Link `Edit for this call…` (§3.3.1) |
| 3 | **Flow** | `FlowSwitcher purpose="call"` (core §5.4) | Label "Flow". Default: the Cockpit default flow, marked with a `Tag outline` "Cockpit default" in its option. Drafts read "Draft · test calls only". Under it (`meta-12`): "Tested today 10:12 am · **Open in flow**" or "Not tested since publish · **Open in flow**". "Make default" appears as a link only when the pick differs from the default |
| 4 | **Voice** | `VoicePicker variant="compact"` (data-nav §12.3) | Label "Voice". Options from the flow's allowed voices; preview in the flow's language. Helper "For this call only · **Make default**". Unavailable voices show their reason |
| 5 | **Language** | `Select` (core §5.2) | Label "Language". Options from the flow: "Auto · Hindi + English" (default), "Hindi", "English", "Hinglish" with LanguageMarks. Hint "Auto follows the caller." At ≥560 px card width Voice and Language share a row |
| 6 | **Readiness** | `GateChecklist` (G §2, `context="inline"`, `collapse="passing"`) | `h3` "Readiness" + summary StatusText; rows per §1.3 for the current kind; blocking and advisory rows shown, passing rows behind "Show all 5 checks" |
| 7 | **Kind line** | `StatusText size="sm"` + `CallKindTag` (§7.5) | §1.1 rule 3. `aria-live` off (it is re-read with the button's description) |
| 8 | **Footer** | Sticky card footer: `surface`, top hairline, padding `space-12 space-20`, `display:flex; gap: space-inline-md` | `Button variant="secondary" leadingIcon={Mic}` "Talk in browser" · `Button variant="primary" leadingIcon={Phone}` with the kind label: "Call Lead 1042…", "Call +91 98765 43210…", "Call my phone…", or "Place call…" with no target (reason "Choose a lead or enter a number."). Each button's `disabledReason` comes from the blocking checks, shown inline under the footer (`meta-12` `warning-text` with `triangle-alert`), and in the tooltip |

Both buttons are `md` (32 px; 44 on touch), same height, never wrapping (`labelShort` below 768). The secondary's helper, in its tooltip and `aria-describedby`: "Uses your microphone. Nobody else is called."

#### 3.3.1 Edit for this call (replaces SAVE CONTEXT)

`Edit for this call…` expands an inline form in place of the Lead details list (no dialog). Fields: the flow's lead variables as `TextInput`s with their labels ("City", "Budget"). Footer: `Checkbox` "Also save to Lead 1042" (unchecked by default) · `Button variant="secondary"` "Use for this call" (label becomes "Use and save to lead" when checked) · `Button variant="tertiary"` "Cancel". Result: the list returns with the edited values marked "for this call" (`meta-12` `text-3`), and, when saving to the lead, a `SaveState` beside the heading: "Saving…" → "Saved 11:24 am" on 2xx, or "Couldn't save · Retry" (never a fixed "Context Saved", F-QA-020). Leaving with unsaved edits uses `useUnsavedChangesGuard` (digest F5).

### 3.4 The Call gate (`CallGate mode="single"`, G §5.1)

The gate's frame, check kinds, cost line, states, keys, gate token, idempotency key and containers are specified in `spec/02-components-gate.md`. This section configures it for the Cockpit.

```
Call Lead 1042                                             [x]
Their phone rings when you place the call. · Checked just now
--------------------------------------------------------------
To        Lead 1042 · +91 •••••• 4821 · Hindi
Flow      Site-visit qualifier  [Live v7] · tested today
Voice     Vaani · Hindi + English
Caller ID +91 80 •••• 2210
--------------------------------------------------------------
Must pass                                  Ready · 1 thing to know
v  Within calling hours · 10 am to 7 pm IST
v  Not on the DND list
v  Wallet ₹2,340.50 · about 16 h of calls
Good to know
i  Called 22 h ago · Callback due today
--------------------------------------------------------------
1 call · about 1 to 2 min · ₹2 to ₹5
The agent says the call is recorded at the start.
--------------------------------------------------------------
                                      [Cancel] [Place call]
```

| Setting | Cockpit value |
|---|---|
| Opened by | The card's primary (`Call Lead 1042…`, `Call my phone…`) and `C` (§4.3). Never by a single key or click on its own |
| Container | Popover gate anchored above the card footer (G §1.3): `--size-popover-gate` 400, `--radius-12`, `--e3`; a bottom sheet below 768, and at 768–1023 when it doesn't fit |
| Header | Per kind (G §5.1): "Call Lead 1042" · "Call +91 98765 43210" · "Call your phone" with `CallKindTag` Test call |
| Scope | `settings="readonly"`: the choices were made on the card (To, Flow, Voice, Caller ID). No Change link; editing happens on the card |
| Checks | The rows of §1.3 for the kind, re-run on open, `collapse="none"` (every row renders) |
| Choice | `choice="when-needed"`: only when a Real call is outside calling hours: Place now (disabled, "Outside calling hours") · Schedule for 10 am IST. The primary becomes "Schedule call"; the call appears in Up next |
| Cost line | `range` (G §3.2); interim "Rate ₹0.04/s" (direction §8) |
| Compliance note (Cockpit addition) | Under the cost line, `meta-12` `text-3`: the recording disclosure sentence when recording is on (exact wording §8 Q7) |
| Primary | "Place call" / "Schedule call"; busy "Placing call…" |
| Done | The card switches to the call (`?call=<id>`); focus moves to the call card's heading (the trigger no longer exists); announce "Dialling" |
| Failed | G §4.1 with "Couldn't reach the phone line. The call was not placed and you were not charged." (the last clause only when the server confirms it) |

### 3.5 The call card (a live or recent call)

A `section` labelled by its `h2` (visually the lead name inside CallHeader; `aria-label` "Call with Lead 1042"). Blocks are separated by `border` hairlines, each padded `space-16 space-20`.

| Block | Component | Configuration |
|---|---|---|
| Header | `CallHeader` (data-nav §12.1) | Row 1: CallStateTag (with time in state) · "Outbound · Site-visit qualifier v7" · `Timer` in `num-20`. Row 2: Person avatar 32, lead name `title-14`, `PhoneText`, then `CallKindTag` for tests or `Tag outline` "Recording · disclosed 00:01" when recording. Row 3: CallStepper. Stale rule §1.2 |
| Talk | `TalkStrip` (data-nav §12.5, live variant) | Only when per-turn timing streams; heading `h3` "Talk" with "Agent above · caller below"; legend "Agent 58% · Caller 42% · 1 interruption". `role="img"` with that sentence as its label, updated at most every 10 s. Hidden otherwise (P1) |
| Now in the flow | `NowInFlow` (§7.6) | Phase glyph tile (foundations §12) · "Now in Site-visit qualifier v7 · step 3 of 8" (`meta-12`) · step name (`title-14`) · link "Open in flow" (opens the Flow Designer at that step in a new tab; visually hidden "(opens in a new tab)") |
| Facts | `KeyValueList variant="inline"` | Voice ("Vaani · Hindi + English"), Line (`LineQuality` with `showKey={false}`), Cost ("₹5.36 so far · ₹0.04/s", tabular, never announced), Caller ID |
| Captured so far | `KeyValueList variant="rows"` | `h3` "Captured so far" + "2 of 3". Values from the flow's capture fields; pending rows "Waiting for an answer…" (`text-3`) |
| Lead details | Radix `Collapsible`, closed by default | "Lead details · 4 from Leads" → the same list as the New call card |
| Controls | `CallControls` (§7.7), sticky card footer | Phone call (Real or Test): `Button variant="secondary" leadingIcon={Headphones}` "Take over" (toggle, `aria-pressed`; asks for the microphone on first use) · `Button variant="secondary" leadingIcon={PhoneForwarded}` "Transfer…" (opens `TransferPicker`, §7.8) · `Button variant="destructive" leadingIcon={PhoneOff}` "End call" pushed right (`margin-left:auto`, ≥ `space-16` from the others). **No confirmation on End call** (direction §6.2). While taken over: "Hand back to Vaani" replaces Take over, and a `MuteToggle` ("Mute" / "Unmute", `aria-pressed`) appears. Controls a role or the backend doesn't support are hidden, not disabled (P1) |

**Browser test variant.** Row 2 shows VoiceTile "Vaani" + "You're the caller" + `CallKindTag` "Browser test"; a `LevelMeter` (§7.9) shows your input level from real audio; LineQuality lists one leg, "Your connection". Controls: `MuteToggle` · `Button variant="destructive"` "End test". A Transfer step reached in a test appears as a system TurnRow with what actually happened ("Transfer to a person · not placed in browser tests").

### 3.6 Wrap-up and ended calls

After a Real call ends, the card becomes **Wrap-up** (CallStateTag "Wrap-up"; the CallStepper completes). Component **WrapUpForm** (§7.10):

| Part | Spec |
|---|---|
| Summary | StatusText: "Summarising…" (progress) → "Summary ready" with the first two sentences and "Open call report"; or "Summary unavailable for this call." |
| Outcome | `Select` label "Outcome", pre-filled from the flow's Outcome step ("Visit booked · from the flow"), else from the call result ("Not reached") |
| Lead status | `Select` label "Lead status", pre-filled from the outcome mapping ("Interested") |
| Callback | `DateField` + `TimeField` (core §7.1) "Call back on", shown when the outcome is Callback; IST stated in the label |
| Notes | `Textarea` label "Notes" (optional) |
| Actions | `Button variant="primary"` "Save and next" when Up next has a call for this operator, else "Save" · `Button variant="tertiary"` "Skip" (leaves the lead unchanged; logged). Saving: "Saving…" then a toast "Saved to Lead 1042 · Open lead"; failure keeps the form with InlineError "Couldn't save the outcome. Retry" |

Terminal results without a conversation (No answer, Busy, Voicemail, Failed) use the same form with Outcome pre-set and add `Button variant="secondary"` "Try again…" (reopens the Call gate). Test calls and Browser tests show no form: "Test ended · 01:12 · not counted in reports" with "Open call report" and `Talk in browser` / `Call my phone…` again.

### 3.7 Transcript column

| State | Content |
|---|---|
| Live or recent call selected | `TranscriptFeed mode="live"` (data-nav §12.4) with `callLanguages`, `perTurnLanguage`, follow mode, "Jump to latest · n new", throttled announcements; after the call, the footer "Call ended · 02:31 · Summary ready" links to the call report |
| New call, lead chosen, lead has calls | `h2` "Previous calls with Lead 1042" + `Timeline` (data-nav §10) of the last 3 calls: when, duration, result, first line of the summary, "Open call report". Then "All calls in Call reports" |
| New call, nothing to show | `EmptyState variant="first-use"` without an icon: "The transcript appears here once a call connects." (overlay §15.3); body "Calls from this page appear in Call reports when they end." |

---

## 4. Cockpit behaviour

### 4.1 States, with copy

The shell, PageHeader (H1 and static meta) and Baseline render at once; only data regions wait (F-QA-007). Skeletons appear after 200 ms and have no shimmer (overlay §13).

| State | Trigger | What the operator sees | Copy |
|---|---|---|---|
| **Loading** | First paint | New call card as the "Cockpit Ready card" skeleton (form layout); Calls column list skeleton; transcript empty state immediately (it needs no data). Both actions `aria-disabled` | Footer reason: "Checking readiness…" |
| **First use: no flows** | Workspace has no flow | Flow field replaced by a compact EmptyState; both actions disabled | "No flows yet. Create one to test it here." link **New flow** (template gallery). Reason: "Create a flow first." |
| **First use: setup incomplete** | Setup track not finished | Readiness rows show exactly what blocks phone calls; `Talk in browser` works as soon as a flow exists | Summary: "Phone calls blocked · 2 things to fix". Rows: "Wallet is ₹0. Top up to place phone calls." · "Verify a caller ID before placing phone calls." plus the sidebar setup card "Finish setup · 3 of 5" |
| **No leads** | Leads is empty | Contact listbox shows a compact empty line; typing a number still works | "No leads yet. **Import leads…**" |
| **Ready** | All checks pass | Summary collapsed | "All 5 checks pass" · kind line · enabled primary |
| **Advisory** | e.g. flow untested, recently called | Rows expanded; primary enabled | "Live v7 hasn't been tested since it was published. Talk in browser first." |
| **Blocked** | Any blocking check | Primary `aria-disabled`, reason inline and in the tooltip; `Talk in browser` unaffected unless its own checks block | "Wallet is ₹0. Top up to place phone calls." · "Outside calling hours. Opens 10 am IST." · "This number is on the DND list." · "Draft v8 can only call your own number. **Use Live v7** or **Call my phone**." |
| **Partial** | One readiness source fails | That row reads unknown; phone calls blocked until it resolves | "Couldn't check the wallet. **Retry**" · reason "Can't confirm your balance yet." |
| **Flows failed to load** | Flow list request fails | FlowSwitcher error state | "Couldn't load flows. **Retry**" (the Refresh-flows spinner that did nothing offline is gone, F-UX-019) |
| **Page error** | Cockpit data fails entirely | `PageError` inside the shell | Title "Cockpit couldn't load." Body "No calls were placed. This is a problem on our side or with your connection." Actions **Retry** · Go to Call reports |
| **Offline, idle** | `offline` event | ConnectionBar; every network action `aria-disabled` | "You're offline." |
| **Offline, during a phone call** | Network drops while a Real or Test call is live | The call continues on the phone line. TranscriptFeed "Reconnecting" notice; timer keeps running from the server start time | Card notice (warning, section scope): "You're offline. The call continues on the phone line. The transcript catches up when you reconnect." |
| **Offline, during a Browser test or Take over** | Your audio leg drops | Call moves to Failed | "Your connection dropped, so the browser test ended." / "Your connection dropped. Vaani is back on the call." |
| **Microphone blocked** | Permission denied or no device | `Talk in browser` and `Take over` disabled with reasons; an `info` IconButton opens steps | "Microphone blocked. Allow it in your browser's site settings, then **Retry**." · "No microphone found. Connect one, then **Retry**." |
| **Role can't call** | Permission | Primary hidden; `Talk in browser` stays if allowed | Readiness row: "Your role can't place phone calls. Ask an admin." |
| **Placing** | Place call pressed | Gate primary busy | "Placing call…" |
| **Dialling / Ringing** | Server events | CallHeader, stepper, TopBar chip, Baseline, nav badge | "Dialling…" · "Ringing… 00:07" |
| **Stuck** | No event for 60 s | Warning text in CallHeader | "No update for 60 s · **Check status**" |
| **Live** | Answered | Full card, transcript streaming | "Live 02:14" |
| **Taken over** | Take over | Row 2 tag "You're talking"; agent paused | "Vaani is paused. **Hand back to Vaani**" |
| **Transferring** | Transfer… confirmed | Pending tag | "Transferring to Rep 2…" → "Transferred to Rep 2" / "Transfer didn't connect. Vaani is back on the call." |
| **No answer, Busy, Voicemail** | Terminal | Terminal CallStateTag replaces the remaining steps | "No answer after 30 s." · "Busy." · "Reached voicemail. No message was left." (only if true) |
| **Failed** | Terminal | Danger CallStateTag + reason | "Call failed. Couldn't reach the phone line. You were not charged." (only when confirmed) · **Try again…** |
| **Wrap-up** | Real call ended | WrapUpForm | "Summarising…" → "Summary ready" |
| **Saved** | Wrap-up saved | Toast; card returns to New call or the next call | "Saved to Lead 1042 · **Open lead**" |
| **Test ended** | Test ended | Compact ended block | "Test ended · 01:12 · not counted in reports" |
| **Default changed** | Make default | Success toast with Undo | "Default flow updated · used by Cockpit, Meetings and Leads · **Undo**" |
| **Wallet low or empty** | Server state | WalletNotice (page) + Baseline segment amber + readiness row | "**Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. **Top up**" |

### 4.2 Interactions

- **Choosing a target.** Selecting a lead fills Lead details and re-runs readiness (DND, recently called). Choosing "My phone" switches the kind to Test call. Clearing the Contact returns the primary to "Place call…" with its reason. Arriving from Leads (`?new=1&lead=`) or Call reports ("Call again…") pre-fills the card and focuses the primary, never the gate.
- **Changing the flow** re-validates the kind (Draft + lead blocks) and the language list; the voice resets only if the flow does not allow it ("Vaani isn't available for this flow. Choose a voice.").
- **Talk in browser** asks for the microphone on the click (never on page load), then starts the Browser test directly (no gate: it rings nobody). If the product owner decides Browser tests are billed, it gets the same gate with the Browser test title (§8 Q2).
- **Place call.** Primary or `C` → gate → `Place call` or `⌘/Ctrl+Enter`. The server re-checks readiness; if something changed since the gate opened, the gate shows the new blocking row instead of calling.
- **Supervising.** Selecting another live call in the Calls column swaps the card and transcript (`?call=`); the previous call keeps running.
- **Leaving during a live call.** In-app navigation is allowed (the call runs server-side; the TopBar chip, Baseline and nav badge lead back). During a Browser test or Take over, your audio would stop, so a ConfirmDialog asks: "Leave the Cockpit? Your browser test ends when you leave." · Stay · Leave and end test. `beforeunload` is registered only while your microphone is in use.
- **Only one microphone session per tab.** Starting Talk in browser during a Take over is disabled: "You're already talking on Lead 1042."

### 4.3 Keyboard

Single-key shortcuts follow the account's "Single-key shortcuts" switch and are ignored while typing (overlay §19).

| Key | Where | Does |
|---|---|---|
| `/` | Cockpit, outside text fields | Focus the Contact field (the New call item is selected first) |
| `C` | Cockpit, outside text fields | Open the Call gate if the card is complete; otherwise focus the first field that needs attention and show its message. **Never dials** |
| `⌘/Ctrl+Enter` | Inside the Call gate | Place call (or Schedule call) |
| `Esc` | Gate, popovers, sheets | Close and return focus to the trigger |
| `M` | During a Browser test or Take over | Mute or unmute your microphone (announced: "Microphone muted") |
| `F6` / `Shift+F6` | Cockpit | Move focus between regions: header → Calls → card → transcript |
| `↑` `↓` `Home` `End` `Enter` | Calls column | Move and open |
| `End` / `Home` | Transcript | Jump to the latest turn and re-pin / to the first turn |
| `⌘/Ctrl+F` | Focus inside the transcript | Search the transcript |
| `?` | Anywhere | Shortcut sheet |

No shortcut ends, takes over or transfers a call in v1 (§8 Q4). Every shortcut has a visible button; keycaps appear only in tooltips and the `?` sheet.

### 4.4 Microcopy: before → after

| Before | After |
|---|---|
| AGENT COCKPIT · Agent View · Agent · Dashboard | Cockpit |
| IDLE · SESSION: IDLE · STANDBY · Awaiting connection… | (no idle state words) "No calls in progress" in the header meta; the transcript empty state "The transcript appears here once a call connects." |
| LAT: 0ms · SYS: ONLINE 22ms · RGN: Mumbai-1 | (nothing idle) "Line · Good · 180 ms" during a call |
| CONNECT | Talk in browser |
| Test Call | Call my phone… / Call Lead 1042… / Call +91 98765 43210… |
| +91... (placeholder as label) | Label "Contact", hint "Search leads by name or number, or type a number." |
| FLOW: [flow name] (v2) · 9115a2 (10 px mono, truncated) | Flow: Site-visit qualifier `Live v7` (FlowSwitcher, no hashes) |
| Vaani / Vikash (bare toggle) | Voice: Vaani · Hindi + English ▶ · "For this call only · Make default" |
| CUSTOMER INTEL | Lead details |
| SENTIMENT POSITIVE 72/100 · 3 PREV. CALLS (before any call) | Last call · 21 Sep · Callback (only if it exists) |
| EMAIL / COMPANY / LOCATION (demo seeds) | Only real fields, "from Leads", or "Not captured" |
| SAVE CONTEXT · Context Saved | Edit for this call… · Use for this call · Also save to Lead 1042 · Saved 11:24 am / Couldn't save · Retry |
| Enter a valid phone number (8-15 digits)… (in the transcript) | "Enter a 10-digit mobile number, like 98765 43210." (under the field) |
| TRANSCRIPT FEED · 0 entries | Transcript |
| Wallet empty — top up now to keep calls flowing. | Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work. Top up |

### 4.5 Accessibility

- **Landmarks and headings.** One `h1` "Cockpit". Regions are `section`s labelled by `h2`: "Calls", "New call" or "Call with Lead 1042", "Transcript" (or "Previous calls with Lead 1042"). Blocks inside the card use `h3`. The skip link targets `main`.
- **Labels.** Every control sits in a `Field` with a visible `label` (F-A11Y-003). Placeholders are examples only (F-A11Y-020). PhoneInput carries the hidden "Indian number, +91" description.
- **Disabled means focusable.** Blocked buttons use `aria-disabled` with `aria-describedby` pointing at the visible reason (core §1.6); they remain in the tab order so the reason can be heard.
- **Kind in the name.** The primary's accessible name is its label ("Call Lead 1042…"); its description adds the kind line ("Real call. Billed at ₹0.04 per second."). The TopBar call chip's name includes the kind ("Live test call, 1 minute 12 seconds").
- **Announcements** (shell announcer, polite): call state changes debounced 500 ms ("Dialling", "Call live", "Call ended. Wrap-up"); final transcript turns at most one per 2 s, switchable; LineQuality drops and recoveries; readiness changes that flip the primary ("Phone calls blocked. Wallet is ₹0."). Never timers, cost or wallet decrements. Failures that stop the task (Placing failed, Couldn't save outcome) use `role="alert"` via InlineError.
- **Focus management.** Gate confirm → focus to the call card heading. Operator presses End call → focus to the Wrap-up heading. A call that ends on the other side does **not** move focus; it is announced. Closing any popover returns focus to its trigger.
- **Contrast and type.** All text pairs come from tokens proven ≥ 4.5:1 in both themes (contrast-report); nothing below 12 px; the timer is `num-20` tabular (Hanken); the primary label is white on Neel (7.68 / 6.21:1).
- **Targets.** 24×24 minimum, 44×44 on touch; End call sits at least `space-16` from routine controls.
- **Motion.** Only the LiveDot (live) and LevelMeter or VoicePicker meters (real audio); both static under reduced motion, where the words carry the state.
- **Language.** `lang` on every turn and example; `translate="no"` on lead, flow and voice names.
- **Forced colours.** State tags keep word and icon; LiveDot, meters and talk-strip swatches carry `data-mark`; the selected call item carries `aria-current`.

### 4.6 Responsive rules (summary)

| | ≥1440 | 1280–1439 | 1024–1279 | 768–1023 | 320–767 |
|---|---|---|---|---|---|
| Calls | Column 240 | CallSwitcher in header | CallSwitcher in header | TopBar chip → sheet | TopBar chip → sheet |
| Card | 400 column | 400 column | 400 column | Full pane, max 640 | Full width |
| Transcript | Rest | Rest | Rest (≥ 568) | Tab "Transcript" | Below the sticky call header |
| Call controls | Card footer | Card footer | Card footer | Sticky bottom bar | Sticky 44 px bar above the bottom nav; Transfer… in `⋯` |
| Gate | Popover 400 | Popover 400 | Popover 400 | Popover 400 if the whole gate fits, else bottom sheet (G §1.3) | Bottom sheet |
| Lead details | Inline | Inline | Inline | Inline | Disclosure |
| Voice and language | Inline | Inline | Inline | Inline, one row | Disclosure → bottom sheet |

### 4.7 Telemetry hooks (optional, privacy-safe)

Session replay and autocapture are **off** on `/dashboard` and `/rep-console` (F-UX-045). Events carry ids and enums only: never names, numbers, notes or transcript text.

| Event | Properties | Question it answers |
|---|---|---|
| `cockpit_card_ready` | `blocking_checks[]`, `advisory_checks[]`, `ms_to_ready` | What stops people calling? |
| `call_gate_opened` / `_confirmed` / `_cancelled` | `kind`, `flow_revision`, `checks_state`, `had_schedule_choice` | Does the gate cost too much time? Where do people back out? |
| `browser_test_started` | `flow_revision`, `mic_permission` | Are flows tested before real calls? |
| `call_state_changed` | `kind`, `from`, `to`, `ms_in_state` | Time to live; failure rates by stage |
| `take_over_used` / `transfer_used` | `ms_into_call`, `step_phase` | Where does the agent need help? |
| `wrap_up_saved` | `ms_to_save`, `outcome_changed_from_flow` | Is wrap-up fast; are flow outcomes right? |
| `make_default_clicked` | `field` (flow, voice) | Do people want sticky defaults? |
| `mic_permission_denied` | `surface` | How often browser audio is blocked |

### 4.8 Acceptance criteria (Cockpit)

- [ ] The nav, H1, phone bar, ⌘K and `<title>` all say "Cockpit"; `<title>` becomes "Live call · Cockpit · Vaani Labs" only while a call is shown.
- [ ] No element on the page animates while idle; with reduced motion on, nothing animates during a call either.
- [ ] The New call card's primary names its target ("Call Lead 1042…", "Call my phone…"); with no target it reads "Place call…" and is `aria-disabled` with "Choose a lead or enter a number."
- [ ] Pressing the primary or `C` never creates a call request; only `Place call` (or `⌘/Ctrl+Enter`) inside the gate does, with an idempotency key; a double press creates one call.
- [ ] Typing "abc" or "12345" into Contact shows the PhoneInput error under the field on blur, and the primary stays disabled with that reason.
- [ ] With the wallet at ₹0, the primary is `aria-disabled` with "Wallet is ₹0. Top up to place phone calls.", `Top up` opens `/billing?topup=1`, and `Talk in browser` still works (if Browser tests are free).
- [ ] Choosing a Draft flow and a lead blocks the call with "Draft v8 can only call your own number."; the server rejects the same combination with 422.
- [ ] Changing flow, voice or language sends no profile write; the picks survive reload via the URL; "Make default" writes once and shows the toast with Undo.
- [ ] Lead details never show a field absent from the lead record; missing flow fields read "Not captured"; no sentiment or call count appears for a lead without calls.
- [ ] "Use and save to lead" shows "Saved hh:mm am" only after a 2xx and "Couldn't save · Retry" after a failure (tested with a blocked request).
- [ ] At 1024×768, 1100×700 and 720×450 no control overlaps another, every control is reachable by scrolling, and the card footer stays visible (F-VIS-007, F-RWD-002).
- [ ] At 390 px the Contact, Flow, readiness and both actions are visible without opening anything; nothing scrolls sideways at 320.
- [ ] Every control has a programmatic label; axe reports no `label`, `color-contrast` or `aria-*` violations in idle, gate, live, wrap-up and error states, in both themes.
- [ ] A screen reader hears "Dialling", "Call live", "Call ended. Wrap-up" once each, final turns at most every 2 s, and never the timer or cost.
- [ ] Every Browser test produces exactly one conversation in Call reports, tagged Test (contract test with the backend, F-QA-006).
- [ ] A call with no server event for 60 s shows "No update for 60 s · Check status"; a stale queued call never shows a running timer.
- [ ] Session replay scripts do not load on `/dashboard`.

---

## 5. Rep console (`/rep-console`)

### 5.1 Purpose and jobs to be done

**Purpose.** A browser softphone for people who take calls that a flow's **Transfer** step hands to a human. It must make three things unmistakable: whether transfers can reach you right now, when one is ringing (and who and why), and what you are doing on the call.

| Who | Job to be done | Primary action |
|---|---|---|
| Sales or support rep | "When Vaani hands a caller to a person, I want it to ring here with who it is and why, pick up in one action, and see what was already said." | `Go available`, then `Answer` |
| Rep during a call | "I want clear mute, hold and hang-up controls and the conversation so far." | Mute · End call |
| Rep after a call | "I want to log the outcome and decide whether I take the next one." | `Save and go available` |
| Team lead or admin | "I want to know transfers are routed to people who are really there." | Presence badge; Phone setup |

### 5.2 Audit findings addressed

| Finding | Today (evidence) | What changes |
|---|---|---|
| F-UX-023 | Opening the page fetches a softphone token, POSTs presence and opens a LiveKit socket; the rep is "present" without deciding to be; raw SDK error with no Retry; "Room: rep-<UUID>" shown; Mute and End call disabled with no reason; "← Dashboard" back link; not on phones | Explicit `Go available` after route, microphone and connection checks; presence cleared on tab close and by server timeout; plain errors with Retry and Details; ids under "Connection details"; call controls only exist during a call; top-level page reachable from the phone More sheet |
| F-UX-015 | Calls land here only if Call channel is Browser or Auto, but the page neither shows nor links the channel, and Call channel says the browser bridge "hasn't shipped" | A routing check states the real channel ("Transfers ring here · Call channel: Browser" or "Transfers ring the phone, not this page") with a link to Phone setup; if the bridge is unavailable the page says so and `Go available` is blocked (§8 Q9) |
| F-UX-018 | The rail's green "SYS: ONLINE" stayed green while this page said "Offline" | Removed; the Rep console nav item carries a computed presence badge ("Available") |
| F-UX-019, F-VIS-020 | "Could not connect — …(re)connection attempt:" in off-token `#FB2C36` at 3.27:1 | InlineError: "Couldn't connect to the call service. Check your connection and Retry." in `danger-text` (≥ 5.75:1), raw text under Details |
| F-VIS-001, F-VIS-002, F-VIS-023, F-VIS-034 | Mono 24 px H1, mono body copy, a boxed "Requesting softphone credentials…", a 640 px column | `title-20` Hanken H1, sentence-case copy, busy button label "Connecting…", two-column layout on the shared card width |
| F-UX-017, F-A11Y-013, F-A11Y-014 | "Dashboard" back link; one tab title for all routes; nothing announced | Presence-aware `<title>`; availability, ringing and call-state changes announced |
| F-RWD-001 | Unreachable on phones | Listed in the More sheet (Operate group) with its presence badge |

### 5.3 Availability model

```
Offline --Go available--> Connecting... --ok--> Available --transfer--> Ringing --Answer--> On call <-> On hold
   ^                          |                     |                     |                    |
   |<--------- fail ----------+                     |<------ Decline -----+                    v
   |<--------------------- Go offline ---------------+<----- Missed ------+                 Wrap-up
   |<--------------------- tab closed, heartbeat lost, 2 misses in a row                       |
   |<------------------------------------------------------ Save and go offline ---------------+
                                                   Available <----------- Save and go available+
```

| Rule | Detail |
|---|---|
| Opening the page | Renders **Offline**. Reads the routing config and the microphone permission state (`navigator.permissions.query`, no prompt). **No** token request, presence write or socket until `Go available` (D8) |
| Going available | On click: (1) route check passes, (2) microphone permission requested (the click also unlocks audio for the ring), (3) token fetched, (4) socket connected, (5) presence written. The button reads "Connecting…" throughout; a failure at any step returns to Offline with that step's message (§5.7). Available is shown only after (5) succeeds |
| Staying available | Heartbeat every 20 s; the server withdraws presence after 45 s without one (values §8 Q10). A dropped connection shows "Reconnecting…" (LineQuality); if it fails, the page returns to Offline with "You were set offline at 11:42 am because the connection dropped." |
| Leaving | `pagehide` sends a beacon that clears presence; `Go offline` clears it at once. A ConfirmDialog guards leaving the page only while Ringing or On call |
| One tab owns presence | A `BroadcastChannel` lets only one tab be available. Other tabs show "Rep console is open in another tab. **Use this tab**" |
| Wrap-up | No new transfers ring during Wrap-up. It ends with `Save and go available` or `Save and go offline` (or Skip) |
| Missed transfers | A transfer not answered within the ring timeout (20 s proposed) goes to the Transfer step's fallback. After 2 missed in a row the rep is set Offline so callers are not kept waiting (§8 Q11) |

Availability words and tones (`AvailabilityTag`, §7.11): Offline (neutral, `circle-dot`), Connecting… (info, Spinner), Available (success, static LiveDot), Ringing… (pending, `phone-call`, time in state), On call (live, pulsing LiveDot, timer), On hold (pending, `pause`), Wrap-up (neutral, `clipboard-check`).

### 5.4 Information hierarchy

1. **Your availability and the one action that changes it** (`Go available` / `Go offline`).
2. **The ringing or current call:** who, why it was transferred, `Answer`, then the controls.
3. **Context:** what the caller already said and what was captured, before and during the call.
4. **Readiness:** routing, microphone, speaker, notifications.
5. **History:** today's transfers.

### 5.5 Layout and wireframes

Body at ≥1024: `grid-template-columns: var(--size-cockpit-card) minmax(0,1fr)` (the softphone uses the Cockpit card width), columns scroll independently, hairline between them. PageHeader: H1 "Rep console", meta computed ("Offline", "Available since 10:02 am · 3 calls today"), `⋯` with "Phone setup" (admins) and "Keyboard shortcuts". No back link.

**Desktop ≥1280, Offline, routing blocked**

```
| Rep console   Offline                                                                   [...] |
+------------------------------------------+---------------------------------------------------+
| Softphone                           400  | Today                                             |
| [Offline]                                |  0 calls taken · 0 min talk · 0 missed            |
| Transferred calls don't ring here        |                                                   |
| while you're offline.                    | Recent transfers                                  |
| [ Go available ]  (aria-disabled)        |  No transfers yet today.                          |
|  ! Transfers ring the phone, not this    |                                                   |
|    page. Ask an admin to set the call    | How transfers reach you                           |
|    channel to Browser.                   |  A flow's Transfer step hands the caller to an    |
| Readiness                                |  available rep. If nobody answers in 20 s, the    |
|  ! Call channel: Phone (PSTN)  Phone setup| flow's fallback runs.                            |
|  v Microphone allowed · Headset (USB)    |                                                   |
|  i Notifications off · Turn on           |                                                   |
| > Audio devices                          |                                                   |
+------------------------------------------+---------------------------------------------------+
```

**Desktop ≥1280, Ringing** (the incoming card replaces the availability block at the top-left, where the eye already is)

```
| Rep console   Incoming call                                                                  |
+------------------------------------------+---------------------------------------------------+
| [Ringing... 00:07]                       | Before you pick up                                |
| (L) Lead 1042                            | Summary so far                                    |
|     +91 •••••• 4821 · (A) Hindi          |  Wants a site visit on Saturday morning. Asked    |
| Transferred by Vaani                     |  about price; asked for a person.                 |
|  Site-visit qualifier v7 · Transfer to   | Captured so far                          2 of 3   |
|  sales · "Caller asked for a person"     |  Preferred day   Saturday, morning                |
| [        Answer        ] [ Decline ]     |  Budget          ₹85 L to ₹1 Cr                   |
| If you don't answer in 20 s, Vaani       |  Site visit      Not captured                     |
| continues with: Offer a callback.        | Transcript so far                                 |
|------------------------------------------|  00:34 Caller (AA) Saturday ho sakta hai...       |
| Readiness  All 3 checks pass             |  01:02 Vaani (A) Let me connect you to our team.  |
+------------------------------------------+---------------------------------------------------+
```

**Desktop ≥1280, On call**

```
| [Live 03:41]      Transferred · Site-visit qualifier v7         03:41 |
| (L) Lead 1042  +91 •••••• 4821     Recording · disclosed 00:01        |
| Your connection  Good · 120 ms     Phone line  Good · 180 ms          |
| [Mute] [Hold] [Keypad]  [Transfer...]                    [End call]   |
| Notes (saved to this call)                                            |
| [ ...                                                     ] Saved     |
```
Right column: the same context with the TranscriptFeed now live ("You" for the rep's turns).

**Laptop 1024–1279:** same two columns with the rail. **Tablet 768–1023:** one column: the softphone card first (sticky call controls at the bottom during a call), context below it, the transcript in a disclosure "Transcript so far · 12 turns". **Phone 320–767:** one column; Answer and Decline in a sticky bar (Answer 1:1 Decline, 44 px); during a call a sticky bar with Mute · End call and `⋯` (Hold, Keypad, Transfer…). A neutral Notice stays at the top while available on a phone: "Keep this screen on and this tab open. Phones pause background tabs, so transfers may not ring if you switch apps." (real-device behaviour, 00-summary §6).

```
+-------------------------------------+
| Rep console [(•) Live 03:41] [₹2,340] [search] |
| Live · Transferred         03:41    |
| Lead 1042 · +91 •••••• 4821         |
| > Context · 2 of 3 captured         |
| 03:12 You   Namaste, sales team...  |
| 03:20 Caller (AA) Haan, Saturday... |
| [Mute]             [End call] [...] |  sticky 44 px
+-------------------------------------+
```

### 5.6 Components used, with configuration

| Region | Component | Configuration |
|---|---|---|
| Header | `PageHeader variant="page"` | As §5.5; meta from the availability machine |
| Availability | `AvailabilityControl` (§7.11) | `AvailabilityTag` `lg` + one sentence + `Button variant="primary"` "Go available" (Offline) or `variant="secondary"` "Go offline" (Available); `disabledReason` from blocking checks |
| Readiness | `GateChecklist` (G §2, `context="inline"`, `collapse="passing"`) | Rows: Call channel, Microphone, Speaker (advisory when `setSinkId` is unsupported: "Your browser plays calls through the system speaker"), Notifications (advisory, `Turn on` requests permission on click), Connection (while available) |
| Audio devices | Radix `Collapsible` + `Select` ×2 + `MicCheck` (§7.9) | "Microphone", "Speaker", a live LevelMeter while open, `Button variant="secondary" size="sm"` "Play test sound" |
| Incoming call | `IncomingCallCard` (§7.12) | CallStateTag "Ringing…" with time in state; Person avatar, name, `PhoneText`, LanguageMark; "Transferred by Vaani" with flow, version, step name and the reason captured by the Transfer step; `Button variant="primary" size="lg"` "Answer" (full width minus Decline) and `variant="secondary"` "Decline"; fallback sentence from the Transfer step's configuration |
| Call | `CallHeader` + `CallControls variant="rep"` (§7.7) + `LineQuality legs={['browser','phone']}` | Mute (`M`), Hold (`H`) and Keypad only when the bridge supports them; Transfer… (`TransferPicker`); End call (destructive outline, no confirmation) |
| Notes | `Textarea` label "Notes" + `SaveState` | Autosaves to the call as a draft ("Saved 11:24 am"); carried into Wrap-up |
| Wrap-up | `WrapUpForm variant="rep"` (§7.10) | Outcome, Lead status, Callback, Notes; `Button variant="primary"` "Save and go available" · `variant="secondary"` "Save and go offline" · `variant="tertiary"` "Skip" |
| Context | `KeyValueList` (summary so far, captured so far, lead details) + `TranscriptFeed mode="live"` | Headings "Before you pick up" (ringing) / "Call context" (on call) |
| History | `KeyValueList variant="inline"` "Today" + `Timeline` "Recent transfers" | Counts computed server-side; missed transfers carry the warning tone ("Missed · Vaani offered a callback") |
| Page notices | `WalletNotice page="rep-console"`, `ConnectionBar`, Notice (neutral) for another tab or phone caveat | One page notice at a time |
| Nav | `NavBadge kind="presence"` (§7.13) | "Available" (static LiveDot + `success-text`), "On call" during a call; nothing when offline |

### 5.7 States, with copy

| State | Copy and treatment |
|---|---|
| Loading | Header and availability block render; checklist rows skeleton; `Go available` `aria-disabled` "Checking your setup…" |
| Offline (default) | Tag "Offline" · "Transferred calls don't ring here while you're offline." · **Go available** |
| Routing blocked | Blocking row "Transfers ring the phone (PSTN), not this page." Admins: **Change in Phone setup**; members: "Ask an admin to set the call channel to Browser." `Go available` disabled with the same reason |
| Bridge unavailable | Page Notice (neutral): "Browser transfers aren't available yet. Transfers ring the number in Phone setup." `Go available` disabled (only if the platform truly cannot deliver, §8 Q9) |
| Microphone blocked | "Microphone blocked. Allow it in your browser's site settings, then **Retry**." (info Popover with steps) |
| No microphone | "No microphone found. Connect a headset, then **Retry**." |
| Connecting | Button "Connecting…" (`aria-busy`), tag "Connecting…" |
| Token denied (403) | "Your role can't take transferred calls. Ask an admin to add you as a rep." |
| Connection failed | InlineError: "Couldn't connect to the call service. Check your connection and **Retry**." · Details (raw message, error id, Copy) |
| Presence write failed | "Couldn't mark you available. **Retry**" (the tag stays Offline) |
| Available | Tag "Available" · "Transferred calls ring here. Keep this tab open." · **Go offline** |
| Another tab | Notice: "Rep console is open in another tab. **Use this tab**" |
| Ringing | Card per §5.6; assertive announcement "Incoming call from Lead 1042. Press Control Enter to answer."; tab title "Incoming call · Rep console · Vaani Labs"; a system notification when the tab is hidden and notifications are on, with **no name or number** in it: "Incoming transfer from Vaani" |
| Answering | Answer busy "Answering…"; if the caller hung up: "The caller hung up before you answered." |
| On call | Tag "Live 03:41"; controls; notes |
| On hold | Tag "On hold 00:12"; Hold button pressed ("Resume") |
| Reconnecting during a call | LineQuality "Reconnecting… 4 s"; section Notice "Your connection is unstable. The caller may hear a gap." |
| Call dropped | CallStateTag Failed "Call dropped" · "The caller was disconnected at 03:52. **Call back…**" (opens the Cockpit Call gate for this lead) |
| Wrap-up | Form; "You won't get new transfers until you save or skip." |
| Missed | Section Notice (warning): "You missed a transfer at 11:40 am. Vaani offered a callback." After 2 in a row: tag "Offline" and "You were set offline after 2 missed transfers. **Go available**" |
| Offline network | ConnectionBar; presence lapses by timeout; "You were set offline at 11:42 am because the connection dropped." |
| Wallet empty | WalletNotice "Wallet is ₹0. Phone calls are paused." (transfers can't be placed) |
| Empty history | "No transfers yet today." |

### 5.8 Interactions and keyboard

| Key | Where | Does |
|---|---|---|
| `⌘/Ctrl+Enter` | Page, while Ringing | Answer (focus is **not** moved automatically, so typing in Notes can't answer by accident) |
| `M` | On call | Mute or unmute (announced) |
| `H` | On call, if supported | Hold or resume (announced) |
| `F6` / `Shift+F6` | Page | Move between Softphone and Context |
| `Esc` | Popovers (Keypad, Transfer) | Close, focus returns |

`Go available`, `Decline`, `Transfer…` and `End call` have no shortcuts. Single-key shortcuts follow the account switch.

### 5.9 Microcopy: before → after

| Before | After |
|---|---|
| ← Dashboard | (removed; Rep console is a top-level destination) |
| Browser softphone. Keep this tab open… Calls only land here when your Settings → Call channel is set to Browser or Auto. | Readiness row "Transfers ring here · Call channel: Browser", or "Transfers ring the phone (PSTN), not this page. Change in Phone setup" |
| Online · Waiting for calls (on page load) | Offline (on load) → Available · "Transferred calls ring here. Keep this tab open." |
| Room: rep-<UUID> | Connection details (disclosure; `mono-12` id with Copy) |
| No active call | (removed; the availability tag carries the state) |
| Could not connect — could not establish signal connection: Websocket got closed during a (re)connection attempt: | Couldn't connect to the call service. Check your connection and Retry. |
| Requesting softphone credentials… | Connecting… (on the Go available button) |
| Mute / End call (disabled, no reason) | Shown only during a call |

### 5.10 Accessibility

- `h1` "Rep console"; `section`s "Softphone" and "Call context" with `h2`s. The availability tag sits in a polite `role="status"`; ringing uses one **assertive** announcement (it interrupts the current task by design), never repeated while ringing.
- The ring is audio plus text plus the tab title; nothing flashes. The ring stops on Answer, Decline, timeout or Go offline. Its volume follows the Speaker device; a "Ring volume" Slider sits in Audio devices.
- Answer and Decline are 40 px (`lg`) on desktop and 44 px on touch, at least `space-16` apart.
- Controls with state use `aria-pressed` (Mute, Hold); names change with state ("Unmute", "Resume").
- Browser notifications are opt-in from a button, never requested on load.
- Reduced motion: the live dot and the LevelMeter are static; words carry the state.

### 5.11 Telemetry hooks (optional)

`rep_availability_changed` (`from`, `to`, `reason`: user, timeout, misses, tab_closed) · `rep_go_available_failed` (`stage`: route, mic, token, socket, presence) · `rep_transfer_outcome` (`answered`, `declined`, `missed`, `ms_to_answer`) · `rep_wrap_up_saved` (`ms_to_save`, `next`: available or offline) · `rep_device_test_used`. No names, numbers or notes.

### 5.12 Acceptance criteria (Rep console)

- [ ] Loading `/rep-console` makes no softphone token request, no presence write and no WebSocket connection (network log).
- [ ] `Go available` requests the microphone on click; presence is written only after the socket connects; a failure at any stage leaves the tag at Offline with that stage's copy, and raw SDK text appears only under Details.
- [ ] With the call channel set to Phone (PSTN), `Go available` is `aria-disabled` with the routing reason; admins get a working Phone setup link.
- [ ] Closing the tab clears presence (beacon observed); with the network cut, the server withdraws presence within 45 s and the page later says why.
- [ ] Only one tab can be Available; the second shows "Use this tab".
- [ ] An incoming transfer is announced once, assertively; `⌘/Ctrl+Enter` answers; focus does not move on its own; the notification contains no name or number.
- [ ] Mute, Hold, Keypad, Transfer… and End call exist only during a call; unsupported controls are absent, not disabled.
- [ ] After a call no new transfer rings until the rep saves or skips wrap-up.
- [ ] `<title>` reflects availability ("Available · Rep console · Vaani Labs"); the nav badge shows "Available" only while presence is confirmed.
- [ ] The page is reachable from the phone More sheet and works at 320 px without sideways scrolling.
- [ ] No text on the page is set in mono except ids; timers and masked numbers are Hanken with tabular figures (foundations §2.3).

---

## 6. Backend dependencies and interim behaviour

The truthful UI depends on these. Until each ships, its UI element is **hidden, not simulated** (direction §8).

| # | Dependency | Used by | Interim until it ships |
|---|---|---|---|
| B1 | Call events stream (state changes with server timestamps, call id returned on create, idempotency key honoured) | CallHeader, Calls column, chips, Baseline | Poll `GET /api/calls/{id}` every 2 s while a call is shown; never show Dialling before the id exists |
| B2 | One conversation per Browser test; `is_test` and `kind` on every call (F-QA-006) | Kind tags, Call reports exclusion | Browser tests show "2 legs · counted once" in Call reports; the Cockpit hides Recent test items rather than listing both legs |
| B3 | Readiness endpoint (§1.3) with wallet runway, caller ID state, calling hours (IST), DND, recently called, role | GateChecklist, Call gate | Wallet and caller ID from existing endpoints; calling hours, DND and recently called rows are **omitted** (not shown as passing), and one advisory row says so (G §6.3) |
| B4 | Per-second rate and median duration per flow | Cost line, runway | "Rate ₹0.04/s" only (direction §8) |
| B5 | Per-turn timestamps and language; step id per turn | TalkStrip, turn language marks, step links, Now in the flow | TalkStrip hidden; one language mark per call in the feed header; Now in the flow hidden |
| B6 | Capture fields per flow and live captured values | Captured so far, Lead details "fields this flow uses" | Section hidden |
| B7 | Session-only call overrides (flow, voice, language, lead variables) on the create-call request | New call card | Required: without it the pickers must keep writing the profile, so ship it before the card (F-UX-014) |
| B8 | Lead association by normalised E.164 at call creation; reaper for stuck calls (F-QA-037) | Previous calls, Recent, Timed out | Previous calls hidden for typed numbers; stuck calls show "No update since…" |
| B9 | Take over, Transfer, Hold, Keypad capabilities per call | CallControls | Absent controls |
| B10 | Presence API: explicit set and clear, heartbeat, server timeout, one owner per rep; call channel config readable by members | Rep console | Rep console blocks `Go available` with "Presence isn't available yet." rather than registering presence on load |
| B11 | Flow "tested" facts per revision | Readiness flow row, FlowSwitcher meta | Row reads "Live v7" without the tested clause |
| B12 | Wrap-up endpoint (outcome, lead status, callback, notes) | WrapUpForm | Outcome saved through the existing lead update; callback field hidden |

---

## 7. New components needed

The Gate components (`GateChecklist`, `GateCheckRow`, `CallGate` single and batch) are specified in `spec/02-components-gate.md` (G); these pages only configure them (§1.3, §3.4, §5.6). Every component uses existing tokens only; the three this area added are in §7.14 and registered in 01-foundations §18.

### 7.1 `ReadyToCallCard` (composition)
The New call card of §3.3: Contact, Lead details, Flow, Voice, Language, GateChecklist, kind line, sticky footer. Container queries: at ≥560 px card width Voice and Language share a row and the footer buttons are 1:1. Loading uses the overlay "Cockpit Ready card" skeleton.
```tsx
<ReadyToCallCard value={{ target, leadId, flowId, voiceId, lang, overrides }} onChange={setUrlState}
  readiness={readiness /* §1.3 rows */} onTalkInBrowser={startBrowserTest} onOpenGate={openGate} />
```

### 7.2 `GateChecklist`, `GateCheckRow` and `CallGate`
Specified in `spec/02-components-gate.md` (§2 checks, §5.1 CallGate, §7 React), which replaced the contract that used to live here. Cockpit usage:
```tsx
<GateChecklist context="inline" collapse="passing" heading="Readiness" noun="Phone calls" checks={readiness.checks} />
<CallGate mode="single" kind="real" settings="readonly" choice="when-needed" entry="cockpit"
  target={{ leadId, e164 }} flow={{ id, revision: 'live', version: 7 }} voiceId="vaani" lang="auto" />
```

### 7.3 `ContactField` (recipe of `Combobox` + `PhoneInput`)
Core §4.1 names the behaviour; this is its contract. One input: text searches leads (debounced 300 ms, server), digits switch the value to a PhoneInput E.164 value. Groups "You", "Leads", "Number". The selected value renders as a chip-free text value "Lead 1042 · +91 •••••• 4821" with a Clear IconButton. Value: `{ kind: 'self' | 'lead' | 'number', leadId?, e164 }`. Masked numbers only; a typed number is shown as typed. `aria-describedby` → hint or error; results count announced.

### 7.4 `CallsColumn`, `CallListItem`, `BatchItem`, `CallSwitcher`
§3.2 anatomy. `CallsColumn` is a `nav`-like region but not a landmark (`section aria-labelledby`), with a roving-tabindex list. `CallSwitcher` = secondary Button + Popover (≥768) or bottom sheet (<768) rendering the same `CallsColumn` content at 320 px. Items subscribe to B1 for timers (one shared 1 s ticker; timers render from server start times, so switching never resets them).

### 7.5 `CallKindTag` (and the kind line)
`Tag tone="outline"` with an icon: `monitor` "Browser test", `flask-conical` "Test call". Real calls render no tag (the absence is deliberate; the gate title and button name carry it). The kind line is a `StatusText size="sm"` built by `describeCallKind(kind, target, rate)` in `lib/calls.ts`, the single source for the sentence used by the card, the gate subtitle and the primary's `aria-describedby`.

### 7.6 `NowInFlow`
Row: phase glyph tile 24 (foundations §12) · two lines (`meta-12` "Now in {flow} v{n} · step {i} of {total}", `title-14` step name) · link "Open in flow". Updates only on step change (not announced). Hidden without B5.

### 7.7 `CallControls` (with `MuteToggle`, `HoldToggle`, `KeypadPopover`)
A sticky footer bar (`surface`, top hairline, padding `space-12 space-20`, flex, gap `space-inline-md`), End call pushed right with `margin-left:auto` and at least `space-16` from routine controls. Variants: `agent` (Take over, Transfer…, End call), `browser-test` (Mute, End test), `takeover` (Hand back to Vaani, Mute, Transfer…, End call), `rep` (Mute, Hold, Keypad, Transfer…, End call). Toggles are `Button variant="secondary"` with `aria-pressed` and state-named labels ("Mute" / "Unmute", "Hold" / "Resume"). `KeypadPopover`: 3×4 grid of 44 px keys (`mono-13` digits with letters in `meta-12`), sends DTMF on press, echoes digits in a read-only field. Below 768 the bar keeps two primary controls and moves the rest to `⋯`.

### 7.8 `TransferPicker`
`Popover variant="combobox"` from "Transfer…": sections "Available reps" (from presence; name, AvailabilityTag) and "Phone number" (PhoneInput `allowInternational`); primary "Transfer" (busy "Transferring…"); a note when the target is a phone number: "Transfers to a phone are billed at ₹0.04/s." Empty reps: "No reps are available. Transfer to a number instead."

### 7.9 `MicCheck` and `LevelMeter`

`LevelMeter` is the product's one audio meter, owned by `07-motion` §12.5 and named in the Flow Designer registry (FD1 §20.1); it was called MicMeter here. This section keeps only the Cockpit's use of it.
`LevelMeter`: 4 bars (`space-2` wide, gap `space-2`, heights 4/8/12/16, radius-2, `accent-mark` when active, `border-strong` idle), driven by a real `AnalyserNode` at ≤ 15 fps; static under reduced motion (shows a single level). `role="meter"` with `aria-valuenow` rounded to 10 % steps, `aria-label="Microphone level"`, never live-announced. `MicCheck`: Microphone and Speaker `Select`s (from `enumerateDevices`, labels need permission; before that: "Allow the microphone to see device names"), the meter, "Play test sound", and the result line "We can hear you" only after real input above the noise floor.

### 7.10 `WrapUpForm`
§3.6 and §5.6. Variants `cockpit` ("Save and next" / "Save") and `rep` ("Save and go available" / "Save and go offline"). Form rules from core §8 (validation on submit, UnsavedChangesBar not used: the form has its own footer). Outcome options come from the flow's Outcome steps plus the call results.

### 7.11 `AvailabilityControl` and `AvailabilityTag`
`AvailabilityTag`: Tag `lg` with the words and tones of §5.3; `role="status"` wrapper. `AvailabilityControl`: tag + sentence (`body-14` `text-2`) + one button, driven by a `usePresenceMachine()` reducer (states of §5.3, events: goAvailable, connected, presenceConfirmed, failed(stage), goOffline, ring, answer, decline, missed, ended, wrapUpSaved, heartbeatLost, otherTabClaimed).

### 7.12 `IncomingCallCard`
§5.6 anatomy on `surface`, 1 px `warning-border` (the pending state's border, ≥ 3:1) and radius-8 inside the softphone column; padding `space-16`. The ringing state never animates the card (no pulse, no shake); the ring is audio.

### 7.13 `NavBadge kind="presence"`
Extends data-nav §1.5: "Available" (static LiveDot + `success-text`), "On call" (pulsing LiveDot while on a call), nothing when offline. Accessible name "Rep console, available". One badge per item still applies.

### 7.14 Tokens (registered in 01-foundations §18)

Registered in 01-foundations §18 and emitted by `tokens.json` 1.1.0: `--size-softphone` (400 px, the Rep console column), `--timing-state-announce` (500 ms, the call-state debounce, data-nav §12.1) and `--timing-call-stale` (60 s, the "No update for 60 s" rule). Use the names; no literals in `announce()` or `lib/calls.ts`.

---

## 8. Open questions for the product owner

1. **Route.** Keep `/dashboard` with a `/cockpit` alias (proposed for v1), or move to `/cockpit` with a permanent redirect?
2. **Are Browser tests billed?** Proposed: free, which keeps `Talk in browser` gate-free and usable at ₹0 (as the WalletNotice copy promises). If billed, they get the Call gate with the Browser test title and a cost line.
3. **Who sees "Live now"?** Proposed: everyone sees the calls they could open in Call reports; admins see all. Is there a supervisor role?
4. **End-call shortcut.** None in v1 (browser shortcut conflicts, accidental hang-ups). Revisit with operators.
5. **Telephony capabilities.** Which of Take over, Transfer, Hold and Keypad exist today? Hidden until confirmed (B9).
6. **Calling hours for Test calls to your own number.** Proposed: not applied.
7. **Compliance copy.** Exact DND scope (promotional vs service calls), TRAI calling windows, and the recording disclosure sentence.
8. **"Tested today".** Proposed: a Browser test or Test call on this revision that reached Live and lasted at least 10 s, today in IST.
9. **Browser transfer bridge.** Call channel copy says it hasn't shipped (F-UX-015). If it hasn't, should the Rep console be hidden from the nav or shown blocked?
10. **Presence timing.** Heartbeat 20 s and server timeout 45 s proposed; ring timeout 20 s.
11. **Auto-offline after 2 missed transfers.** Proposed on, per workspace setting.
12. **Draft test calls to teammates.** May a Draft call a teammate's verified number (kind Test call), or only your own?
13. **Cockpit default flow.** Where is it set: the Publish gate's "Where it goes live" (direction §6.5), Flows, or Settings?

---

## 9. Traceability

| Finding | Section |
|---|---|
| F-UX-003 | D7, §3.3 (Lead details), §3.3.1, §4.4 |
| F-UX-005, F-FLOW-012, F-FLOW-014, F-VIS-037, F-VIS-013 | §3.3 Flow |
| F-UX-006 | §1.3, §4.1 first use |
| F-UX-013, F-A11Y-004 | D3, §1.3, §3.4, §4.3 |
| F-UX-014 | D6, §1.5, §3.3, §4.1 default changed, B7 |
| F-UX-015 | §5.2, §5.7 routing blocked, §8 Q9 |
| F-UX-016 | §5.9 (room ids under Details) |
| F-UX-017, F-A11Y-013 | §1.4, §5.2 |
| F-UX-018 | D9, §2.2, §5.2 |
| F-UX-019, F-VIS-020 | §4.1 partial and flows failed, §5.7 connection failed |
| F-UX-023 | D8, §5 |
| F-UX-026, F-VIS-030, F-A11Y-009 | D2, §3.3 footer, §4.4 |
| F-UX-028, F-UX-002, F-RWD-013, F-A11Y-015 | §3.1 notices, §4.1 wallet |
| F-UX-030, F-QA-007 | §4.1 loading, §5.7 loading |
| F-UX-034, F-QA-018 | §1.4 forbidden routes |
| F-UX-045 | §4.7, §4.8 |
| F-VIS-001, F-VIS-002, F-VIS-016, F-VIS-022, F-QA-038 | §3.3 (one level of containment, type roles), §5.2 |
| F-VIS-007, F-RWD-002 | D5, §2.4, §4.6, §4.8 |
| F-VIS-023, F-A11Y-019 | §3.7 empty state |
| F-VIS-029, F-A11Y-022 | D10, §4.5 motion |
| F-VIS-034 | §2.4 fixed columns, §3.7 previous calls |
| F-RWD-001 | §1.4, §5.2 |
| F-A11Y-003, F-A11Y-006, F-A11Y-020 | §3.3, §4.5 labels |
| F-A11Y-014 | §1.2, §4.5, §5.10 |
| F-A11Y-016 | VoicePicker radiogroup (§3.3), toggles with `aria-pressed` (§7.7) |
| F-A11Y-023 | §4.5 targets, §5.10 |
| F-QA-006 | §1.1, B2, §4.8 |
| F-QA-020, F-QA-021, F-UX-025 | §3.3 Contact, §3.3.1, §4.8 |
| F-QA-037 | §1.2 stuck, B8 |
