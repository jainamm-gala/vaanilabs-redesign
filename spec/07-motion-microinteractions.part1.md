# 07 · Motion and micro-interactions (Sutradhar)

**Status:** implementation-ready. **Date:** 2026-09-27.
**Scope:** every moving or changing thing in the signed-in app and the shared overlays: hover, focus and press feedback; button busy states; toggles; menus, popovers, dialogs, sheets and toasts; loading, skeletons and progress; save-state transitions; success and error feedback; Flow Designer selection, drag, connect, snap and zoom; test-run path highlighting; live call state transitions and audio-level indicators; reduced motion; and the list of what must not animate. Marketing follows the same rules (P-08 PA12).
**Builds on:** `00-design-direction.md` (D), `01-foundations.md` (F, §11 Motion is the token source), `02-components-core.md` (C), `02-components-overlay-feedback.md` (O), `02-components-data-nav.md` (N), `04-flow-designer/01-canvas-and-nodes.html` (FD1, the canvas reference mock), `04-flow-designer/02-config-validation-lifecycle.part*.md` (FD2), `03-pages/*` (P-00 shell to P-08 public), `05-responsive.part*.md` (R).
**Reference mock:** `spec/07-motion-microinteractions.html` (links `tokens/tokens.css`), with renders `07-motion-microinteractions-desktop.png`, `-dark.png` and `-mobile.png`. The mock has working **Replay** controls and a **Reduce motion** switch, so a developer can feel each timing, not just read it.
**Evidence:** `audit/consolidated/*`; finding ids cited throughout (F-A11Y-022, F-FLOW-011 and so on).

**Contents.** Part 1: §0 decisions and reconciliations, §1 principles, §2 tokens and the motion budget. Part 2: §3 control micro-interactions (hover, focus, press, busy buttons, toggles). Part 3: §4 overlays, §5 toasts. Part 4: §6 loading, §7 save-state transitions, §8 success and error feedback. Part 5: §9 the app shell. Part 6: §10.1–10.9 Flow Designer canvas (select, drag, connect, snap, zoom, wireframes). Part 7: §10.10–10.17 (components, states, keys, acceptance), §11.1–11.2 test-run path highlighting. Part 8: §11.3–11.10, §12.1 live call state transitions. Part 9: §12.2–12.13 live pulse, incoming calls, audio-level indicators. Part 10: §13 reduced motion, §14 what must not animate. Part 11: §15 implementation, §16 telemetry, §17 release acceptance, §18 new components and tokens, §19 open questions, §20 traceability.

---

## 0. Decisions and reconciliations

Today the app defines **36 `@keyframes`** (breathe, scanline, flicker, orbit-spin, sphereGlow, shimmer, marquee, typewriter-caret, ring-pulse and more), honours `prefers-reduced-motion` only on the landing page, runs a 320 px STANDBY ring and a breathing "Awaiting connection…" forever, animates 25 of 27 flow edges as marching ants, lifts and glows primary buttons on hover, and shows a full-screen spinner on every hard load (02-current-design-language §2.1–2.4; F-A11Y-022, F-FLOW-011, F-VIS-029, F-UX-030, F-QA-007). Sutradhar replaces all of it with nine keyframes and three durations.

| # | Decision | Why |
|---|---|---|
| **MD1** | **The token set is closed:** `--dur-fast` 90 ms, `--dur-base` 140 ms, `--dur-slow` 200 ms, `--dur-trace` 480 ms, `--dur-pulse` 1,600 ms, one easing `--ease-standard` `cubic-bezier(0.2, 0, 0, 1)` (F §11). The digest's 120/200/320 ms and ease-out-expo proposals (digest M1, M2; F-A11Y-022 recommendation) are **not** used. | One source of truth. Foundations already fixed these values and every component spec uses them. |
| **MD2** | **Two kinds of change.** *Movement* (`transform`, `opacity`) follows the tables in this spec. *Repaint* (`background-color`, `border-color`, `color`, `fill`, `stroke`) always takes `--dur-fast`. Nothing else transitions: not `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, `filter`, `clip-path` or `font-*`. **One sanctioned exception:** the test-run trace animates `stroke-dashoffset` on one overlay path (§11.4). | Compositor-only movement stays at 60 fps on office laptops. Repaint at 90 ms reads as "state changed", not as motion. |
| **MD3** | **The live pulse is bounded (now the rule in D §5, F §11 and N §5.4).** The LiveDot pulses **3 cycles (4.8 s)** each time a call *enters* Live (including returns from On hold, Reconnecting and a hand-back), then holds as a solid dot. **Only the focal call's CallHeader pulses**; every other live dot (Calls column, Leads "Last call" cell, nav badge, Baseline, TopBar chip, meeting cards) is static. | WCAG 2.2.2: movement that lasts over 5 s beside other content needs a pause control unless essential, and the word "Live" plus the ticking timer already carry the state. It also keeps long calls calm (the audit's own advice: stop pulses after 5 s, F-A11Y-022). If the owner rejects this, the continuous pulse stays and MD4 becomes the 2.2.2 pause mechanism (§19 Q1). |
| **MD4** | **An in-app motion preference.** The account menu gets **Motion: Match system · Reduce motion** (a radio group beside Theme). It sets `data-motion="reduce"` on `<html>` before first paint, and every reduced-motion rule applies to it exactly as to the media query. | Shared call-centre PCs often lock OS settings; operators on 8-hour shifts need a way to turn movement off inside the product. |
| **MD5** | **Button busy timing (reconciles C §2.1 with O §12.1).** C says the label switches at once and the spinner follows after 200 ms; O says the spinner appears at once in a clicked button. **Resolution:** at t = 0 the button locks (`aria-busy`, activation ignored) with no visual change beyond the press; **at 200 ms**, if still pending, the progress label and the spinner appear **together, in one frame**; once shown they stay at least 400 ms. A request that settles before 200 ms shows no busy state at all. | Most saves finish under 200 ms, so the common case shows no flicker; the slow case changes once, not twice. The press state is the instant acknowledgement. |
| **MD6** | **Spinner rotation uses `--dur-spin` 800 ms**, and a skeleton or busy state, once shown, stays `--timing-skeleton-min` 400 ms. Both are in `tokens.json` 1.1.0 (registered in F §18). | Named tokens, no `calc()` in components. |
| **MD7** | **The pointer is never eased.** Drag, pan, pinch-zoom, marquee, scrubbing and swipe follow the pointer 1:1. Only *programmatic* camera moves (Fit, zoom buttons, Go to step, Follow along, pan-into-view) animate, over `--dur-slow`. | Easing a drag makes the step lag behind the hand, which reads as a slow app. |
| **MD8** | **Position changes the user did not drag are interpolated, once:** grid-snap settle (90 ms, ≤ 8 px), Esc-cancel return (140 ms) and **Tidy** (200 ms, every moved step). The interpolation updates React Flow positions per frame so edges follow; it is one history entry and marks the draft dirty once, at the end. | Object constancy: after Tidy the author can see where each step went. |
| **MD9** | **Content never animates in.** Skeleton-to-content, route changes, table rows, list items, chart marks, numbers, transcript text and new steps all appear in one frame. | Entrance animation on data delays reading and implies novelty that isn't there (O §13, N §7.15, N §11.12). |
| **MD10** | **Theme and density switches never animate.** Transitions are suspended for the frame in which `data-theme` or `data-density` changes. | Otherwise every element with a 90 ms colour transition fades at once, which reads as a flash. |

**Conflicts found in other specs (for their owners):**
- **FD1 vs FD2 keyboard (resolved).** FD1 bound `Alt+Arrow` to "move the step"; FD2 bound `Alt+↑/↓` to next / previous issue. Resolved in `06-accessibility` §9.6, now the only canvas key map: **Alt+Arrow moves everywhere** (canvas, Outline, answer and case lists) and **issues are Alt+. / Alt+,**. This spec defines the motion of both (both instant; §10.7). §19 Q5 is closed.
- **Three copies of the same meter.** P-01 §7.9 MicMeter, N §12.3 VoicePicker preview meter and P-02 §11.1 dictation meter describe one 4-bar meter three times. §12.6 defines one `LevelMeter` they all use (§18).

### 0.1 Audit findings addressed (motion-owned or motion-affected)

| Finding | Severity | What changes | Where |
|---|---|---|---|
| F-A11Y-022 | medium | 36 keyframes become 9; every loop stops or becomes static under reduced motion and the in-app preference; no idle loop anywhere | §2, §13, §14 |
| F-FLOW-011 | high | Marching-ants edges removed (`animated` never set); only the edge just taken in a test traces, once | §10.9, §11 |
| F-VIS-029, F-UX-026 | medium | The breathing STANDBY ring is deleted; the Ready-to-call card is static; motion only on real call state and real audio | §12, §14 |
| F-UX-030, F-QA-007, F-VIS-023 | high | No full-screen spinner; shell renders at once; static skeletons after 200 ms; RouteProgress for slow navigations | §6, §9 |
| F-FLOW-003, F-QA-002, F-UX-024 | high | Save chip transitions driven by the save machine; no permanent "Up to date"; no dashed idle icon that looks like a spinner | §7 |
| F-QA-020, F-UX-006 | high | Success appears only after the server confirms; no "Context Saved" after 2 s regardless; no celebratory motion | §8 |
| F-FLOW-021, F-FLOW-009, F-FLOW-026 | medium | Alignment guides and grid snap with a visible settle; palette inserts are placed, connected and selected, never stacked | §10.5, §10.7 |
| F-FLOW-025, F-FLOW-001, F-FLOW-005 | critical / high | Delete removes the step in one frame, closes the inspector and raises the Undo toast; Undo restores and reselects | §10.8, §8 |
| F-FLOW-016 | high | Test runs mark the current step, trace the edge taken, and keep reached steps marked | §11 |
| F-A11Y-001, F-A11Y-007, F-FLOW-006 | critical / high | Focus ring appears instantly and is distinct from selection; keyboard moves and connects have their own feedback | §3.1, §10.3, §10.6 |
| F-A11Y-014 | medium | Every state change that motion shows is also announced, debounced, through the one live region | every area |
| F-A11Y-005, F-A11Y-027 | high | Focus moves into an overlay at t = 0, never after the animation | §4.3 |
| F-A11Y-015, F-QA-036, F-UX-028 | medium | The wallet signal is in the first paint and never slides in or pushes content | §9 |
| F-QA-032 | medium | Marketing H1 visible at first paint; no entrance animation | §14 |
| F-QA-038, F-VIS-022 | medium | The z-9999 noise overlay and every texture animation are removed | §14 |
| F-UX-018 | medium | The random "22ms" ticker is gone; nothing ticks while idle | §9, §14 |
| F-UX-012, F-UX-014, F-A11Y-016 | high / medium | Switches flip optimistically, report Saving and revert visibly on failure | §3.5 |
| F-FLOW-008, F-FLOW-023, F-RWD-014 | high / medium | Level-of-detail swaps are instant with hysteresis; the canvas re-fits on resize without animating | §10.10 |
| 02-current-design-language §2.4 | – | The 20 px glow and −1 px hover lift on primary buttons are removed | §3.1 |

---

## 1. Principles

Seven rules, ranked like the direction's P1–P7. When two conflict, the higher one wins.

**M1. Motion reports a state change; it never decorates (D P1, P7).** Every animation must answer one question: what changed, where it came from, or where it went. "It looks alive" is not a reason.

| Do | Don't |
|---|---|
| The Publish gate sheet slides in from the right edge it lives on | A 320 px STANDBY ring breathing on an idle Cockpit (F-VIS-029) |
| The live dot pulses when a call becomes live | Marching-ants dashes on every saved edge (F-FLOW-011) |

**M2. Acknowledge at once, finish calmly.** Press, focus, selection and drag pick-up render in the same frame as the input (≤ 16 ms). Transitions finish within 200 ms.

| Do | Don't |
|---|---|
| The pressed fill shows on `pointerdown`; the focus ring on the focus event | A button that waits for a 200 ms transition before looking pressed |

**M3. The pointer is never eased (MD7).** What the hand drags stays under the hand.

| Do | Don't |
|---|---|
| A dragged step follows the cursor exactly; it settles onto the 16 px grid on release | React Flow's `snapToGrid`, which makes the step jump in 16 px steps during the drag |

**M4. One thing moves at a time.** At most one entrance per layer, one test trace, one pulsing dot per screen. A camera move finishes before a trace starts.

| Do | Don't |
|---|---|
| Queued toasts enter one after another, 200 ms apart | Three toasts rising together after a modal closes |

**M5. Loops are earned and bounded.** Only four things may repeat: the focal live dot (3 cycles per entry, MD3), level meters driven by real audio, the spinner and indeterminate bar of a request in flight, and nothing else.

| Do | Don't |
|---|---|
| A spinner that exists only while a real request is pending | Shimmering skeletons, a looping logo, a ticker (F-A11Y-022) |

**M6. Reduced means still, not broken.** With reduced motion every state stays legible: words, icons and marks carry it. Opacity fades stay (they are state, not movement).

| Do | Don't |
|---|---|
| Reduced: the test-run path is simply marked, and a word replaces the meter | Reduced: the trace is skipped and nothing shows which step ran |

**M7. Motion never blocks.** Focus moves, input is accepted and announcements fire at t = 0 of any animation. Closing overlays are `inert` immediately. A new state retargets from wherever the old animation is.

| Do | Don't |
|---|---|
| Esc during a sheet's entrance reverses it from its current opacity | Ignoring clicks until an animation ends |

---

## 2. Tokens and the motion budget

### 2.1 Durations, easing and offsets

Values from `tokens/tokens.css` (F §11); every token below is in `tokens.json` 1.1.0 (F §18).

| Token | Value | Reduced motion | Use |
|---|---|---|---|
| `--dur-0` | 0 ms | 0 | Focus rings, disabled changes, content swaps, theme and density changes |
| `--dur-fast` | 90 ms | 90 (opacity and repaint only) | Hover, press release, colour and border changes, row-action reveal, snap settle, **every exit** |
| `--dur-base` | 140 ms | 140 (opacity only) | Popovers, menus, tooltips, tab indicator, determinate progress steps, Esc-cancel return, toast swipe return |
| `--dur-slow` | 200 ms | 200 (opacity only) | Dialogs, sheets, the scrim, toasts, BulkBar, UnsavedChangesBar, rail overlay, camera moves, Tidy |
| `--dur-trace` | 480 ms | 0 | The one-shot test trace along an edge |
| `--dur-pulse` | 1,600 ms | 0 | One LiveDot pulse cycle; the indeterminate bar's pass |
| `--dur-spin` | 800 ms | frozen | One spinner turn, linear |
| `--live-pulse-cycles` | 3 | 0 | Pulse cycles per entry into Live (MD3) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | same | Every UI transition, enter and exit |
| `linear` | – | – | Only for the spinner, the indeterminate bar and pointer-driven motion |
| `--shift-popover` | 4 px | 0 | Popover, menu, listbox entrance |
| `--shift-dialog` | 8 px | 0 | Dialog and palette rise |
| `--shift-toast` | 8 px | 0 | Toast, BulkBar and UnsavedChangesBar rise |
| `--shift-sheet` | 100 % | 0 | Sheet slide from its edge; at 0 a sheet fades in place |

**Behavioural timing** (F §11, O §21): tooltip delay `--timing-tooltip-delay` 300 ms · busy and skeleton delay `--timing-skeleton-delay` 200 ms · minimum visible `--timing-skeleton-min` 400 ms · validation debounce `--timing-validate-debounce` 300 ms · announcement throttle `--timing-announce-throttle` 2 s · informational toast `--timing-toast` 6 s.

**Why one easing.** `cubic-bezier(0.2, 0, 0, 1)` starts fast and spends most of its time settling, so an entrance feels responsive and lands softly, and a 90 ms exit is effectively a quick fade. No springs: overshoot misreports where a thing is and reads as playful.

### 2.2 Choosing a duration

| The change is… | Duration | Examples |
|---|---|---|
| A repaint of something already on screen | `--dur-fast` | Hover fill, selected row, switch track, save-chip colour |
| Something small appearing next to its trigger | `--dur-base` | Menu, popover, tooltip, Call gate |
| A large surface arriving from an edge or over the page | `--dur-slow` | Sheet, dialog, toast, rail overlay, MoreSheet |
| The camera moving to show something | `--dur-slow` | Fit, Go to step, Follow along |
| Anything leaving | `--dur-fast` | Every exit, whatever its entrance |
| Real time | the data's own rate | Timer (1 s), meter (≤ 15 fps), playhead, talk strip |

### 2.3 The motion budget (hard limits, all testable)

| # | Limit | How it is checked |
|---|---|---|
| **B1** | No UI transition longer than 200 ms, except the 480 ms trace and the bounded pulse | Stylelint: `transition-duration` and `animation-duration` accept only `var(--dur-*)` (§15.5) |
| **B2** | Entrance travel ≤ 8 px, except sheets and bottom sheets (their own size) and snap settle (≤ 8 px by construction) | Code review; tokens |
| **B3** | One entrance per layer at a time. Opening a second overlay while the first is entering jumps the first to its end state | Playwright: open palette during a sheet entrance; the sheet's animation is finished |
| **B4** | Loops on screen: at most one pulsing LiveDot, level meters only while real audio flows, at most one spinner per region. A list with more than 3 working rows shows the spinner only on its aggregate line ("3 of 5 uploaded · 2 indexing"); rows show words | `document.getAnimations()` audit (§15.6) |
| **B5** | Nothing animates on first paint or on a route change, except RouteProgress after 200 ms | Playwright: after navigation, `getAnimations()` is empty or RouteProgress only |
| **B6** | Only compositor properties move (MD2). `will-change` is set only while an animation runs. No layout reads inside animation frames | Lint `transition: all`; performance trace |
| **B7** | 60 fps on the reference devices: a 1366 × 768 Windows laptop with integrated graphics, and a 4 GB Android phone. No long task over 50 ms while dragging a step in the 35-step flow (Flow B in the audit) | Chrome performance panel at 4× CPU throttle; ≤ 2 dropped frames per transition |
| **B8** | **At rest, nothing moves.** Two seconds after the last input, on any page with no live call, no audio and no request in flight, `document.getAnimations().filter(a => a.playState === 'running')` is empty | Playwright idle test on every route (§15.6) |

### 2.4 How motion and announcements pair

Every state change that motion shows is also available without sight. The pairing is fixed:

| Visual change | Announcement (polite unless noted) | Never announced |
|---|---|---|
| Call state tag changes | "Ringing", "Call live", "Call ended. Wrap-up" (debounced 500 ms, N §12.1) | The timer, cost so far |
| Save chip → Couldn't save | "Couldn't save. Your last 2 edits are on this device." (assertive, once) | Saved, Saving… |
| Toast enters | Its message (error toasts assertive) | – |
| Test run reaches a step | "Now at Ask about a site visit" | The trace |
| Step deleted | "Deleted Polite close and 2 connections. Undo available." | – |
| Keyboard move of a step | "Moved Ask about a site visit" (coalesced per second) | Pointer drags |
| Line quality to Poor or Reconnecting | "Line quality poor" / "Reconnecting" (N §12.2) | Latency numbers, meter levels |
| Wallet crosses into Low or Empty | "Wallet low. About 17 min of calls left." (O §10.2) | Balance decrements |
