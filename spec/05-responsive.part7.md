---

## 11. Cockpit on tablet and phone

The Cockpit's layouts at every breakpoint are specified in Cockpit `01` §2.4 and §4.6 (New call card, Call gate, live call card, transcript, sticky controls). This section adds what only matters on phones and tablets: the device itself (screen sleep, backgrounding, the keyboard, the microphone) and the landscape layout.

### 11.1 Purpose and jobs on a phone

| Who | Job | Primary action |
|---|---|---|
| Operator away from a desk | "Call this lead now, with the right flow, and know it's a real call and what it costs." | `Call Lead 1042…` → Call gate → `Place call` |
| Flow builder testing on the go | "Hear the draft on my own phone before customers do." | `Call my phone…` (Test call) or `Talk in browser` |
| Supervisor | "See which calls are live and step into the one going wrong." | TopBar call chip "2 live" → CallSwitcher sheet → Take over |

### 11.2 Findings addressed

| Finding | What changes on tablet and phone |
|---|---|
| F-RWD-002 (high) | Customer context, flow and session state never disappear: Contact and Flow are always visible on the idle card; Lead details and Voice and language are disclosures, not removals; the call state, timer and kind stay in a sticky header during a call. No fixed-height stack: one scroller, controls in normal flow, a sticky action bar |
| F-VIS-007, F-RWD-002 (720×450) | At 720×450 (200% zoom) the phone layout applies; nothing overlaps and the page scrolls |
| F-RWD-001 | Cockpit is bottom-bar slot 1; the call chip opens the call from any page |
| F-RWD-013 | No wallet banner; the wallet shows in the TopBar chip and, when blocking, inline in the readiness list and on the disabled call button |
| F-A11Y-023 | 44 px call controls; End call separated by `--space-16`; Transfer… in `⋯` on phones |
| F-UX-026 | CONNECT and Test Call become `Talk in browser` and `Call Lead 1042…`, 1:1 in the sticky bar, each saying what it does |

### 11.3 Information hierarchy on a phone

Idle: (1) Contact and the kind line "Real call to Lead 1042 · ₹0.04/s" → (2) the two actions in the sticky bar → (3) Flow (always visible) → (4) Readiness summary → (5) disclosures (Lead details, Voice and language). Live: (1) sticky CallHeader: state, timer, lead, kind tag, recording disclosure → (2) the transcript → (3) the sticky bar (Take over, End call, `⋯`) → (4) "Call details" disclosure (Now in the flow, Captured so far, line quality, cost).

### 11.4 Layouts added here (portrait layouts are in `01` §2.4)

**Landscape phone (844×390; tablet shell, tiny height class)** — the card and the transcript sit side by side, because a stacked layout would leave about 150 px for the transcript:

```
┌ ☰ Cockpit                          [(•) Live 02:14] [₹2,335]  ⌕ ┐ TopBar 52
├ call card 40% (scrolls) ─────────────┬ transcript 60% (scrolls) ─┤
│ Live · Outbound               02:14  │ 00:21 Vaani  अA           │
│ Lead 1042 · Recording · disc. 00:01  │ You had enquired about…   │
│ > Call details · step 3 of 8 · 2/3   │ 00:34 Caller  अA          │
│──────────────────────────────────────│ Saturday ho sakta hai…    │
│ [Take over]      [End call]  [⋯]     │        [Jump to latest]   │
└──────────────────────────────────────┴───────────────────────────┘
```

Idle in landscape: the New call card at max 560 px, centred, its sticky footer at the bottom of the viewport; the previous-calls list moves under the card.

**Tablet portrait, live** (from `01`): compact CallHeader, `SegmentedControl` Call · Transcript (2 new), sticky 44 px control bar. **Tablet landscape (≥1024):** the laptop two-column layout with Touch density.

### 11.5 Device behaviour (new)

| Topic | Rule | Copy |
|---|---|---|
| **Screen sleep** | While the operator's own call (Browser test, Take over, Rep console call) is Dialling, Ringing or Live, request a Screen Wake Lock (`navigator.wakeLock.request('screen')`); release it on Ended and when the page is hidden; re-request on `visibilitychange` back to visible. Failure is silent (unsupported browsers) | none |
| **Leaving the page during a phone call placed by Vaani** | The call runs on the server and continues; the live card says so once, under the CallHeader, on phones | "The call continues if you leave this page. Open it again from Cockpit." |
| **Backgrounding during a Browser test or Take over** | Mobile browsers may pause the microphone when the page is hidden. On `visibilitychange` → hidden, the client marks the time; on return, if the audio track ended or was muted, a system row appears in the transcript and the card offers to resume | System row: "Microphone paused while Vaani Labs was in the background · 00:42". Card: "Your microphone is off. Resume" |
| **Microphone permission** | Requested only from the `Talk in browser` or `Take over` tap (a user gesture, required by iOS). If denied, the Microphone readiness check turns blocking with platform-specific steps in a Popover (bottom sheet on phones) | "Microphone blocked. Allow it in your browser's site settings, then Retry." |
| **Audio route** | The browser chooses the output (speaker or headset); the product never promises earpiece audio. A one-time hint on coarse pointers before the first Browser test | "Use headphones to avoid echo while you test." (dismissible, remembered) |
| **On-screen keyboard** | Focusing the Contact or `+91` field hides the BottomBar; the kind line and the sticky action bar ride above the keyboard, so the user sees who will be called while typing (§7.3). `inputmode="tel"`, `autocomplete="tel"` (never for a lead search), `enterkeyhint="done"` | — |
| **Rotation during a call** | The call, the transcript scroll anchor ("Jump to latest" state) and any disclosure stay as they were; nothing restarts | — |
| **Incoming transfer on a phone (Rep console)** | Covered by `01` §5: a neutral Notice while available on phones | "Keep this screen on and this tab open. Phones pause background tabs, so transfers may not ring if you switch apps." |
| **Notifications** | No web push in v1 (§21 Q4). The `<title>` carries the state word ("On call · Cockpit · Vaani Labs"), never a ticking timer | — |

### 11.6 States (phone-specific copy; the full matrix is `01` §4.1)

| State | Phone treatment |
|---|---|
| Wallet ₹0 | Primary `aria-disabled`; the reason sits on the kind line: "Wallet is ₹0. Top up to place phone calls." with `Top up` → Top-up sheet (full screen). `Talk in browser` stays enabled if Browser tests are free (`01` §8 Q2) |
| Offline | ConnectionBar under the TopBar; both actions disabled with "You're offline."; a live server-side call keeps its last known state with "No update for 60 s · Check status" |
| Call ended | The sticky bar becomes `Save and next` (Real calls with an Outcome form) or `New call` (tests) |
| Permission (role can't place calls) | Readiness row "Your role can't place phone calls. Ask an admin."; `Talk in browser` still works |

### 11.7 Accessibility

State changes are announced (debounced 500 ms), never the timer or the cost; the sticky bar is a `role="toolbar"` labelled "Call controls"; End call keeps its danger outline and `--space-16` separation; the landscape two-pane layout keeps DOM order card → transcript; the wake lock and background rules change no focus.

### 11.8 Acceptance criteria (Cockpit, phone and tablet)

- [ ] At 360×780, 390×844, 320×640, 720×450 and 844×390, idle: Contact, Flow, the kind line and both actions are visible or reachable by scrolling one page, and no control overlaps another (F-RWD-002).
- [ ] During a live call on a phone, the state, timer, lead and kind stay visible while the transcript scrolls; Take over and End call stay in the sticky bar above the safe area.
- [ ] With the `+91` field focused on iOS Safari and Android Chrome, the kind line and `Call +91 …` are visible above the keyboard (R12 real device).
- [ ] The screen does not sleep during a Browser test lasting 3 minutes on a real phone with a 30 s sleep timer; the lock is released after End.
- [ ] Switching apps for 20 s during a Browser test and returning shows the "Microphone paused" row when the track was stopped, and never a frozen "Live" with no audio.
- [ ] No single tap anywhere on a phone dials: every phone call passes the Call gate bottom sheet (D P3).
