### 12.2 The LiveDot pulse (bounded)

```
entering Live ─► ● ◎ ● ◎ ● ◎ ─► ●  (solid from 4.8 s until the state changes)
                 └ 1.6 s ┘ ×3
```

| Property | Value |
|---|---|
| Dot | 8 px (`--size-live-dot`) circle in `--live`, `data-mark`, always beside the word "Live" (N §5.4) |
| Ring (`::after`) | same size and colour, `transform: scale(1)` → `scale(2.6)`, `opacity` 0.55 → 0 over `--dur-pulse`, `--ease-standard` |
| Iterations | `animation-iteration-count: var(--live-pulse-cycles)` (3); restarted by re-keying the element on each entry into Live |
| Where it pulses | **only** the focal call's CallHeader: the Cockpit call card, the Rep console call card, the Browser test card and the flow Test panel header in voice modes; and a meeting room's own header while someone is in the room (P-07) |
| Where it is static | Calls column items, Up next, the Leads "Last call" cell, the nav badge, the Baseline call segment, the tablet and phone call chip, meeting cards in lists, `Live v7` flow chips (a live flow is not a live call) |
| Reduced motion | no ring; the solid dot and the word "Live" carry the state |
| Tab hidden | the pulse does not run while `document.hidden`; returning to the tab does not replay it |

### 12.3 Incoming calls (Rep console, P-01 §5)

| Moment | Motion |
|---|---|
| A call rings for an available rep | `IncomingCallCard` enters once: opacity + `translateY(var(--shift-toast))` over `--dur-slow`. The card never pulses, shakes or glows while ringing (P-01 §7.12); the ring is the audio |
| Tab hidden | `<title>` becomes "Ringing · Rep console · Vaani Labs" (text, never blinking); a system notification only if the rep allowed it |
| Answered | the card becomes the call card in one frame; state Live, bounded pulse |
| Missed or taken by another rep | the card is replaced in one frame by StatusText "Missed · 12:04 pm" / "Answered by Rep 2" |

### 12.4 Take over and hand back

"Take over" is a toggle Button (`aria-pressed`): on press, the neutral Tag "You're talking" appears in CallHeader row 2 in one frame, the agent line reads "Vaani is paused", the MuteToggle appears and your LevelMeter starts. "Hand back to Vaani" reverses it in one frame and the call re-enters Live (bounded pulse). Nothing slides.

### 12.5 Audio-level indicators: one `LevelMeter`

MicMeter (P-01 §7.9), the VoicePicker preview meter (N §12.3) and the Assistant dictation meter (P-02 §11.1) become **one component** with the same behaviour (§18).

| Part | Spec |
|---|---|
| Anatomy | 4 bars, `--space-2` (2 px) wide, gap `--space-2`, heights 4 / 8 / 12 / 16 px, `--radius-2`, bottom-aligned in a 16 px box |
| Encoding | the level lights 0–4 bars: lit bars `--accent-mark`, unlit `--border-strong`. **Bars change colour, they do not grow**, so the meter never moves the layout and reads like signal bars |
| Source | a real `AnalyserNode` (RMS of the time-domain buffer); never a random or looping animation (D anti-pattern 20) |
| Sampling | at most 15 updates per second (every 66 ms), in `requestAnimationFrame`, skipped while `document.hidden` |
| Smoothing (signal domain) | attack immediate, release 150 ms; thresholds −45 / −35 / −25 / −15 dBFS for 1 / 2 / 3 / 4 bars; below −50 dBFS (noise floor) is 0 bars |
| No colour transition | updates are frame-to-frame fills (0 ms), which is what makes it feel live rather than laggy |
| Silence | after 5 s of 0 bars during a call where the operator is talking (Take over or Browser test), StatusText sm "No sound from your microphone · Check" appears beside it (text, announced once) |
| Reduced motion | the bars freeze unlit, and a word replaces the moving level: "Mic · hearing you" or "Mic · silent", updated at most once per second, not announced (except the 5 s silence line) |
| ARIA | `role="meter"`, `aria-label="Microphone level"`, `aria-valuenow` rounded to 10% steps, `aria-valuetext` "Hearing you" / "Silent"; never live |

### 12.6 Other real-time elements

| Element | Motion | Reduced motion |
|---|---|---|
| Talk strip (live, N §12.5) | segments grow with real time, redrawn at ≤ 10 fps; the still-speaking segment at `--opacity-partial`, becoming solid (opacity `--dur-fast`) when the turn is final; the now-marker moves with the clock | redrawn once per second, no in-between growth |
| Recording playhead (review) | follows real playback; seeking jumps with no easing | unchanged (state, not decoration, N §12.5) |
| LineQuality (N §12.2) | none: bars and words change in place with hysteresis (two agreeing samples) | same |
| Transcript follow mode (N §12.4) | new final turns append in one frame; while pinned, the feed scrolls to the newest turn with `behavior: 'smooth'` capped at 200 ms (instant if the jump exceeds one screen) | instant |
| Partial turn | `--text-3` text ending "…", replaced in place; final colour over `--dur-fast`; **no typing effect, no per-word fade** | same |
| "Jump to latest · 2 new" | fades in over `--dur-base` when unpinned; the count updates in place; no bounce | same (fade) |
| Voice preview ("Hear Vaani") | `play` ↔ `square` icon swap in one frame; the LevelMeter shows the real preview audio | words |
| Cost so far, timers | text updates only | same |

### 12.7 Wireframes: one call, four breakpoints

```
DESKTOP ≥1440 · Calls column 240 · call card 400 · transcript
 Dialling                 Ringing                  Live                       Wrap-up
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐   ┌──────────────────────┐
│[↗ Dialling… 00:01]   │ │[☏ Ringing… 00:03]    │ │[● Live 00:09]  ◎◎◎   │   │[✓ Wrap-up]     02:31 │
│Outbound · Site v7 0:01│ │                 0:04 │ │ pulse ×3, then solid │   │                      │
│Lead 1042  +91 ••4821 │ │                      │ │               00:09  │   │ Summary ready …      │
│●──○──○──○            │ │●──●──○──○            │ │●──●──●──○            │   │●──●──●──●            │
│Dialling Ringing Live │ │ (no ring animation)  │ │ Talk ▬▬ ▬  ▬▬        │   │ Outcome [Visit ▾]    │
│  Wrap-up             │ │                      │ │ Line · Good · 180 ms │   │ Lead status [Int… ▾] │
│                      │ │                      │ │ Take over Transfer…  │   │ [Save and next]      │
│            End call  │ │            End call  │ │            End call  │   │                      │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘   └──────────────────────┘
  every change: one frame · tone repaint 90 ms · announced (debounced 500 ms)

LAPTOP 1024–1439: the Calls column becomes a header switcher ("2 live ▾", static dots);
                  the call card and transcript are unchanged; the card's CallHeader is the only pulse.
TABLET 768–1023:  Call | Transcript tabs; the TopBar chip "● Live 02:14" (static dot) stays visible
                  on both tabs; switching tabs swaps content in one frame.
PHONE <768:
┌───────────────────────┐
│ Cockpit  ● Live 02:14 │ ← chip, static dot, links to the card
├───────────────────────┤
│ [● Live 02:14] ◎◎◎    │ ← CallHeader: the one pulse (3 cycles)
│ Lead 1042 · ••4821    │
│ ●──●──●──○            │
│ Talk ▬▬ ▬ ▬▬          │
├───────────────────────┤
│ 00:21 Vaani …         │ transcript follows (smooth ≤ 200 ms, instant if reduced)
│ 00:26 Caller …        │
├───────────────────────┤
│ [Take over] [End call]│ sticky 44 px bar
└───────────────────────┘
```

### 12.8 Components used

`CallStateTag`, `CallStepper`, `CallHeader` (N §12.1) · `LiveDot` (N §5.4, bounded) · `LineQuality` (N §12.2) · `TalkStrip` live variant (N §12.5) · `TranscriptFeed` and `TurnRow` (N §12.4) · `LevelMeter` (new, replaces three meter descriptions) · `CallControls`, `IncomingCallCard`, `WrapUpForm` (P-01 §7) · Button busy (§3.2) · CallGate (P-01 §7.2).

### 12.9 States (motion view)

| State | Treatment |
|---|---|
| Idle (no call) | Ready-to-call card, static; transcript empty state "The transcript appears here when a call starts." (static, `--text-2`); nothing moves (B8) |
| Checking readiness | "Checking readiness…" StatusText with Spinner sm (request-bound) |
| Blocked | Blocking row and the disabled "Place call…" reason, in one frame; WalletNotice is in the first paint |
| Live | §12.1–12.6 |
| Offline during a call | ConnectionBar; LineQuality "Reconnecting…"; transcript Notice; the dot stays static until Live resumes |
| Error (call failed) | Failed tag and reason; Wrap-up form with "Try again…" |
| No permission | "Your role can't place phone calls. Ask an admin." (static) |

### 12.10 Microcopy (before → after)

| Before | After |
|---|---|
| "STANDBY" (blinking, 2.1–4.4:1) | "Ready to call" (static card heading) |
| "Awaiting connection…" (breathing) | "The transcript appears here when a call starts." |
| "SESSION: IDLE" · "LAT: 0ms" | nothing while idle; "Line · Good · 180 ms" during a call |
| (no state words) | "Dialling… 00:01" · "Ringing… 00:03" · "Live 00:09" · "Wrap-up" · "Call dropped" |
| (silent mic) | "No sound from your microphone · Check" |
| (reduced motion: no alternative) | "Mic · hearing you" / "Mic · silent" |

### 12.11 Accessibility

- The state word sits in a polite `role="status"` wrapper, debounced 500 ms so Dialling → Ringing under a second announces once (N §12.1). Timers are `role="timer"` and never announced.
- The pulse lasts under 5 s per entry, so no pause control is required by WCAG 2.2.2; the Motion preference removes it entirely.
- Meters expose a text value; the reduced-motion words are also the `aria-valuetext`.
- Colour is never alone: word, icon and (when live) the dot.

### 12.12 Telemetry hooks (optional, no content)

`call_state_stuck_shown` (state, seconds) · `mic_silence_warning` (mode: take_over, browser_test) · `jump_to_latest_used` (count bucket).

### 12.13 Acceptance criteria (live calls)

- [ ] On entering Live, exactly one element runs the pulse, for 3 cycles (4.8 s ± 1 frame); afterwards `getAnimations()` on the Cockpit is empty unless a meter or spinner is active.
- [ ] Returning from On hold to Live runs the 3 cycles again; list, chip, nav and Baseline dots never pulse.
- [ ] Ringing has no running animation on the page.
- [ ] Each transition in §12.1 changes the tag in one frame and is announced once within 500 ms; the timer is never announced.
- [ ] The LevelMeter never changes size or position; with the microphone muted it shows 0 bars; with a test tone it lights 3–4 bars within 66 ms.
- [ ] With reduced motion (either source), no pulse runs, the meter shows "Mic · hearing you" / "Mic · silent", and the talk strip updates once per second.
- [ ] With the tab hidden, no meter sampling or pulse runs (CPU idle check).
- [ ] A call stuck in Ringing for 60 s shows "No update for 60 s · Check status".
