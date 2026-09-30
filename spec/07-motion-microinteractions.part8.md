### 11.3 Reduced motion

No trace and no animated camera. At t = 0 the edge simply becomes `--edge-active`, the marks appear, and the camera jumps if the step is outside the safe area. The path is fully readable: `Now`, `Reached ✓`, the matched answer row and the active edges are all static marks (M6, FD2 §13.4).

### 11.4 How the trace is drawn

The trace is the product's only non-transform, non-opacity animation (MD2), and it runs on one short path at a time:

```html
<!-- TraceLayer: an SVG in the edge layer, above edges, below steps -->
<path d="…same d as the edge…" pathLength="1"
      class="vl-trace" stroke="var(--edge-active)" stroke-width="2" fill="none"
      style="stroke-dasharray: 1; stroke-dashoffset: 1;
             animation: vl-trace var(--dur-trace) var(--ease-standard) forwards" />
```

`@keyframes vl-trace { to { stroke-dashoffset: 0 } }`. On `animationend` the overlay is removed and the underlying edge takes the `--edge-active` class. For dashed fallback edges, the same animated path is used as a `<mask>` over a dashed `--edge-active` copy. Under reduced motion `--dur-trace` is 0 ms and base.css caps the iteration, so the end state applies at once.

### 11.5 Wireframes

```
DESKTOP ≥1280 · test panel docked at the bottom (280 px)
┌──┬──────────────────────────────────────────────────────────────────┬──────────────┐
│  │ ╭Trigger ✓╮    ┌Logic · Ask about a site visit ✓┐                 │ Inspector    │
│  │ │Inbound  ├───►│ Yes  haan, zaroor ▓▓▓▓▓▓▓ ●═════╗  (trace drawn  │              │
│  │ ╰─────────╯    │ Later baad mein              ○  ║   once, 480 ms)│              │
│  │                │ No reply  after 6 s          ○  ║                │              │
│  │                └────────────────────────────────┘ ▼                │              │
│  │                           ┃ ┌Action · Book site visit┐  [Now]      │              │
│  │                           ┗━│ Calendar, then WhatsApp│◄ inset bar  │              │
│  │                             └────────────────────────┘             │              │
│  ├──────────────────────────────────────────────────────────────────┤              │
│  │ Test · Text ▾   ● Running                           Restart  Stop │              │
│  │ 00:21 Vaani  Step · Ask about a site visit                       │              │
│  │       Would you like to visit the site this week?                │              │
│  │ 00:26 Caller  haan, zaroor                                       │              │
│  │       ⤷ Moved to step 4 · Book site visit                        │              │
└──┴──────────────────────────────────────────────────────────────────┴──────────────┘
 ▓ matched answer row (accent-soft)   ═ trace in progress   ━ traversed (edge-active)

LAPTOP 1024–1279: the test panel overlays the canvas bottom when the inspector is open;
                  the safe area excludes both, so Follow along keeps "Now" above the panel.
TABLET 768–1023:  the test sheet is full height; the read-only canvas behind still gets marks and
                  traces when visible; the Outline row of the current step shows "Now".
PHONE <768:       Path list instead of a canvas; no trace.
┌───────────────────────┐
│ Test · Text ▾  ● Run  │
│ ✓ Inbound call        │
│ ✓ Ask about a visit   │ ← "Yes · haan, zaroor" under it
│ ▶ Book site visit Now │ ← scrolled into view (smooth, or instant when reduced)
│   Visit booked        │
├───────────────────────┤
│ turn rows…            │
│ [ Type the caller's reply…        ] [Send] │
└───────────────────────┘
```

### 11.6 Components used

`TraceLayer` (new, §18) · step nodes with the "running" and "reached" treatments (FD1) · AnswerRow matched state (`data-matched`, `--accent-soft` fill; new state on an existing part) · `TranscriptFeed` and `TurnRow` in the Test panel (N §12.4) · `CallStateTag` in the panel header for voice modes (N §12.1) · secondary Button "Follow along" · StatusText summary row.

### 11.7 States

| State | Motion and copy |
|---|---|
| Idle (panel open, not running) | Nothing on the canvas; EmptyState "Test the draft before callers hear it. Nothing is sent or dialled in a text test." |
| Running, waiting for the caller | `Now` on the current step; no motion until the next step event |
| Agent working | A partial turn row "…" in `--text-3`; **no typing animation** (FD2 §13.6) |
| Stopped at an invalid step | "Stopped here" Tag; summary "Stopped at 'Send brochure' (step 8): choose a template. Fix it, then Restart." |
| Service error | InlineError "Couldn't reach the test service. Your draft is safe. Retry"; marks stay as they were |
| Offline | Start is `aria-disabled` "You're offline"; nothing runs |
| Ended | Marks stay until an edit, Restart or closing the panel |

### 11.8 Accessibility

- Step changes are announced politely ("Now at Book site visit"), throttled with the transcript announcements (one per 2 s, the latest wins).
- The trace is `aria-hidden`; the `Now` Tag and "Reached" marks are part of each step's accessible name ("Step 4 of 14, Action, Book site visit. Now in the test.").
- `Esc` in the composer returns focus to the current step on the canvas (FD2 §13.6); the camera does not move unless the step is outside the safe area.

### 11.9 Telemetry hooks (optional)

`test_run_step` is not logged per step. `test_run_end` records `steps_reached`, `follow_along_paused` (bool) and `reduced_motion` (bool).

### 11.10 Acceptance criteria (test path)

- [ ] On each step event, the `Now` Tag moves in the same frame as the event; the trace runs once for 480 ms on the edge taken, and no other edge animates.
- [ ] Two step events 200 ms apart produce one completed trace and one running trace, never two running.
- [ ] A fallback edge keeps its 5/4 dash while and after it is traced.
- [ ] With reduced motion, there are no running animations during a test run, and the path is marked (active edges, reached marks, `Now`).
- [ ] Panning by hand during a run pauses Follow along and shows the "Follow along" button; clicking it re-centres the current step.
- [ ] Editing the flow after a run clears every mark in one frame.

---

## 12. Live calls: state transitions and audio indicators

**Purpose and job.** Tell the operator, at a glance, by ear and through a screen reader, what state a call is in, whether audio is flowing, and what the agent is saying, while keeping the Cockpit calm enough to watch for hours. These are the only places where motion runs without a user action, and each one is tied to something real.

**Findings addressed.**

| Finding | Motion answer |
|---|---|
| F-VIS-029, F-UX-026 | The 320 px STANDBY ring, orb and breathing "Awaiting connection…" are deleted; the Ready-to-call card is static |
| F-A11Y-022 | The 4 infinite Cockpit loops (orb, breathe, STANDBY blink, logo) are removed; the live pulse is bounded; meters become words under reduced motion |
| F-UX-018 | "LAT: 0ms" and "SESSION: IDLE" are gone; line quality appears only during a call and never animates |
| F-A11Y-014 | Call state changes are announced; transcript final turns are announced, throttled |
| F-A11Y-019 | Every state has a word and an icon; the pulse is never the only signal |
| F-QA-037 | A call stuck in Dialling or Ringing past 60 s says so in words; the timer never freezes silently |
| F-RWD-002 | The tablet and phone call chip keeps the state visible when the card scrolls away |

**Information hierarchy.**
1. The state word and icon (CallStateTag) and the timer.
2. The CallStepper (where in Dialling → Ringing → Live → Wrap-up).
3. Real audio: the talk strip, the level meter.
4. The transcript.

### 12.1 State transitions (one machine, N §12.1 and P-01 §1.2)

| From → to | What changes (one frame unless stated) | Motion | Announce (500 ms debounce) |
|---|---|---|---|
| Ready → **Placing** (client) | The gate's primary follows §3.2: "Placing call…" at 200 ms | spinner | – |
| Placing → **Dialling…** | The gate closes (exit `--dur-fast`); the card's Ready content is replaced by CallHeader; tag "Dialling…" (pending tone, `phone-outgoing`); stepper node 1 current; timer 00:00 | no slide, no fade-in of the card | "Dialling" |
| Dialling → **Ringing…** | Word and icon (`phone-call`); stepper node 2 (fill `--dur-fast`); time-in-state resets ("Ringing… 00:03") | **no ringing animation** (no pulse, no shake, no wobbling icon); the ring is audio | "Ringing" |
| Ringing → **Live** | Tag to live tone; LiveDot appears and pulses `--live-pulse-cycles` (3) × `--dur-pulse` = 4.8 s, then holds solid (MD3); stepper node 3; transcript "Waiting for the first words…" → turns; talk strip starts; LineQuality appears; Take over and Transfer… become available | bounded pulse | "Call live" |
| Live → **On hold** | Tag pending, `pause` icon; the dot is replaced by the icon | none | "On hold" |
| On hold → Live, Reconnecting → Live, hand-back → Live | As entering Live: the 3-cycle pulse runs again | bounded pulse | "Call live" |
| Live → **Reconnecting** (line) | Tag stays "Live" with a static dot; LineQuality "Reconnecting… 4 s" (static `refresh-cw`); transcript Notice | none | "Reconnecting" |
| Live → **Transferring…** | Pending tone, `phone-forwarded` | none | "Transferring" |
| Live → **Wrap-up** | Dot removed; tag neutral "Wrap-up"; stepper complete; the card body becomes the WrapUpForm (one frame); transcript footer "Call ended · 02:31 · Summary ready" | none | "Call ended. Wrap-up" |
| → **Ended · No answer · Busy · Voicemail** | Remaining stepper steps replaced by the terminal CallStateTag | none | the word (+ duration for Ended) |
| → **Failed** | Danger tone, `circle-x`, reason sentence ("Call dropped") | **no shake, no red flash** | "Call failed. Call dropped." |
| Dialling or Ringing > 60 s without an event | "No update for 60 s · Check status" in `--warning-text`; timer keeps counting | none | once, politely |

**Focus.** State changes never move focus, with one exception: if the focused control disappears (End call when the call ends), focus moves to the card's heading in the same frame.

**Timers** update their text once per second (`role="timer"`, tabular figures, never announced, no rolling digits). **Cost so far** updates in place, never announced (D §8).
