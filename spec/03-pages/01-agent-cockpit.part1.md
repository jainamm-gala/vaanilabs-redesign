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
