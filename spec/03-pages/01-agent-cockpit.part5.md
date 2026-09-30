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
