<!-- Assembled from 07-motion-microinteractions.part1.md, 07-motion-microinteractions.part2.md, 07-motion-microinteractions.part3.md, 07-motion-microinteractions.part4.md, 07-motion-microinteractions.part5.md, 07-motion-microinteractions.part6.md, 07-motion-microinteractions.part7.md, 07-motion-microinteractions.part8.md, 07-motion-microinteractions.part9.md, 07-motion-microinteractions.part10.md, 07-motion-microinteractions.part11.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

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

---

## 3. Control micro-interactions

**Purpose and job.** Tell the operator "the product heard you" in the same frame as the input, and show where focus is, without pulling attention from the table, canvas or call. Applies to every control in C and N: Button, IconButton, Link, fields, Checkbox, Radio, Switch, SegmentedControl, Tabs, Slider, NavItem, table rows, Disclosure.

**Findings addressed.** F-A11Y-006 (focus missing or under 3:1), F-A11Y-016 (states visual only), F-VIS-006 (80 button styles, 3 behaviours), 02-current-design-language §2.4 (hover glow and −1 px lift), F-UX-012 and F-UX-014 (silent saves and silent reverts), F-QA-020 (success shown regardless of result).

**Hierarchy of feedback** (when several apply, all show, in this order of salience):
1. **Focus** — where am I? (outline, instant, never animated)
2. **State** — what did it do? (pressed, checked, selected, busy)
3. **Hover** — what could I do? (the quietest: a fill change on fine pointers only)

### 3.1 Hover, press and focus

| Interaction | Properties | In | Out | Reduced motion | Notes |
|---|---|---|---|---|---|
| **Hover** (fine pointers only, `@media (hover: hover)`) | `background-color`, `border-color`, `color` | `--dur-fast` | `--dur-fast` | same (repaint) | Never a lift, scale, shadow change or glow (F §8). Current nav item and selected rows keep their treatment under hover (N §1.3) |
| **Press** (`:active` or React Aria `[data-pressed]`) | fill one step deeper (C §1.5) | **0 ms** | `--dur-fast` | same | Instant on `pointerdown` so a tap always shows. No scale, no translate |
| **Focus-visible** | `outline` (2 px, offset 2; 3 px on canvas steps; −2 px on rows) | **0 ms** | **0 ms** | same | Never `transition` the outline, never a box-shadow ring, never a pulsing ring (F §13) |
| **Disabled ↔ enabled** | fill, border, text colour | **0 ms** | **0 ms** | same | A fading button suggests work in progress. The reason text appears in the same frame (C §1.6) |
| **Row hover / selected / open** | row fill, inset bar | `--dur-fast` | `--dur-fast` | same | N §7.8 |
| **Row actions reveal** (hover, focus-within) | `opacity` | `--dur-fast` | `--dur-fast` | same | Width is always reserved; nothing shifts (N §7.8). Always visible on coarse pointers |
| **Link hover** | `color`, underline appears | colour `--dur-fast`, underline 0 ms | same | same | |
| **Field hover** | `border-color` `--control` → `--text-3` | `--dur-fast` | `--dur-fast` | same | Labels are static above fields; **no floating-label animation** |
| **Field invalid** | border to `--danger-border`; message appears | 0 ms | 0 ms | same | No shake, no red flash (§8) |

**Touch.** `hover` rules are wrapped in `@media (hover: hover)` (Tailwind v4's `hover:` already is), so a tap never leaves a stuck hover fill. The pressed fill shows for the length of the touch; React Aria's `usePress` (or an empty `touchstart` listener on `document`) makes `:active` apply on iOS Safari.

**Keyboard press.** `Space` shows the pressed fill while held (`:active` applies); `Enter` activates on keydown, so its acknowledgement is the result or the busy state (§3.2).

### 3.2 Button busy states

A button whose action takes time (Save, Publish v8…, Place call…, Start 3 calls, Pay ₹500 via UPI, Delete flow, Retry, Refresh) follows one timeline (MD5):

```
 t = 0 (activate)          t = 200 ms (still pending)        settle (≥ 400 ms after 200)
┌──────────────────┐      ┌──────────────────────┐           ┌──────────────────┐
│   Publish v8…    │  ─►  │ ◌  Publishing…       │  ─ ─ ─ ►  │   Publish v8…    │  + result
└──────────────────┘      └──────────────────────┘           └──────────────────┘
 pressed fill, then idle   label + spinner, one frame         idle label; the result is shown
 aria-busy="true"          width unchanged (label stack)      by a toast, StatusText or chip
 activation ignored        spinner turns once per 800 ms      focus stays on the button
```

| Phase | Visual | Semantics |
|---|---|---|
| **0–200 ms** | Press feedback only. The label does not change | `aria-busy="true"`, `aria-disabled="true"`; repeated clicks, Enter and Space are ignored; billable and payment requests carry an idempotency key (D §6.3) |
| **≥ 200 ms** | Progress label ("Saving…", "Publishing…", "Placing call…", "Starting 3 calls…", "Paying…", "Deleting…") and a `--icon-sm` 14 px spinner in the leading-icon slot, both in one frame. The fill stays the variant's default (not the disabled grey) | Accessible name becomes the progress label; nothing is announced for the busy state itself |
| **Minimum** | Once shown, the busy look stays `--timing-skeleton-min` (400 ms) even if the request settles sooner | – |
| **Settled, success** | The idle label returns in one frame. **No "✓ Saved" morph, no green flash** (O §17). The result is reported by its own element: SaveState, StatusText, toast, the Live chip moving to v8 | Result announced by that element |
| **Settled, error** | Idle label returns; the failure shows where it belongs (InlineError under the control, error toast, SaveState error). Focus stays on the button so Retry is one keystroke away | Error announced assertively once |
| **Offline** | The button never enters busy: it is `aria-disabled` with the reason "You're offline" (O §10.3) | Reason via `aria-describedby` |

**No width shift: the label stack.** The button renders its idle label and its progress label (with the spinner slot) in the same grid cell, the inactive one `visibility: hidden`. The button is always as wide as the wider of the two, so a right-aligned header ("Test · Publish v8…") never jitters. This replaces C §2.1's `min-inline-size` lock, which could still grow.

**Variants.**
- **IconButton** (Refresh, Retry in a chip): at 200 ms the icon is replaced by the spinner; the tooltip and name read "Refreshing…". The RefreshButton recipe (C §2.6) adds the result as StatusText "Updated 4:42 pm".
- **Link button** (Retry inside a sentence): at 200 ms the text becomes "Retrying…" with no spinner (links have no icon slot).
- **Gate primaries** ("Start 3 calls", "Publish with 1 warning"): same timeline; on success the gate closes (exit `--dur-fast`) and the next surface appears (Cockpit call card, Live chip, publish toast).
- **Long jobs** (import, AI draft, knowledge indexing) never keep a button busy for more than about 5 s: they hand over to StageProgress or a progress toast with Cancel (O §14.3).

**States and copy.**

| State | Button | Elsewhere |
|---|---|---|
| Idle | "Save" | – |
| Busy (≥ 200 ms) | "◌ Saving…" | – |
| Success | "Save" | StatusText "Saved 11:24 am" (settings), toast "Lead saved · Open lead" (off-screen effect) |
| Error | "Save" | InlineError "Couldn't save. Check your connection. **Retry**" |
| Offline | "Save" (aria-disabled) | Reason "You're offline" |
| No permission | hidden, or aria-disabled "Only admins can change this. Ask an admin." (C §1.6) | – |

### 3.3 Checkbox and Radio

| Moment | Treatment | Timing |
|---|---|---|
| Check / uncheck | Box fill and border change; the `check` glyph appears or disappears whole | fill `--dur-fast`; glyph **0 ms** (no stroke-draw animation) |
| Indeterminate | `minus` glyph, same fill | same |
| Radio select | The inner dot appears whole | fill `--dur-fast`; dot 0 ms |
| Header checkbox selecting a page | Every row's selected fill in the same frame; the BulkBar rises (§4) | rows `--dur-fast`, bar `--dur-slow` |
| Shift-click range | All rows in the range change in one frame | `--dur-fast` |

### 3.4 SegmentedControl, Tabs and Disclosure

| Control | Motion | Reduced |
|---|---|---|
| SegmentedControl | The selected item's fill and border change over `--dur-fast`. **No sliding thumb** (the selected key simply changes) | same |
| ViewTabs, RouteTabs, PanelTabs | The 2 px indicator moves with `transform: translateX() scaleX()` over `--dur-base` (N §3.8); the panel content swaps in one frame | indicator jumps |
| Disclosure / Collapsible ("Lead details", "Show all 5 checks") | The chevron rotates 90° (`transform`) over `--dur-fast`; the content appears or disappears in one frame. **Never animate height** | chevron jumps |

### 3.5 Switch (autosaving toggle)

Switches apply at once and save in the background (C §6.3, O §18.3). The motion makes the optimistic change and its possible reversal visible (F-UX-012, F-UX-014).

```
 flip (t = 0)                    t = 200 ms, still saving        saved                     failed
 ( ○──)  →  (──● )              (──● )  Saving…                 (──● )  Saved             ( ○──)  Couldn't save. Retry
 thumb 12 px, 90 ms              status line appears            for 6 s, then removed     thumb returns over 90 ms
```

| Moment | Visual | Timing | Announce |
|---|---|---|---|
| Flip | Thumb `translateX(12px)`, track colour | `--dur-fast`; instant under reduced motion | Role announces on/off |
| Saving (after 200 ms) | Status line "Saving…" (`meta-12`, `--text-3`), `aria-busy` on the switch | text 0 ms | no |
| Saved | "Saved" for `--timing-toast`, then removed (opacity `--dur-fast`) | | no |
| Failed | Thumb returns to its previous position over `--dur-fast`; "Couldn't save. **Retry**" in `--danger-text` | | `role="status"`, once |
| Rapid toggling | Each flip retargets from the thumb's current position; only the last value is saved | – | – |

### 3.6 Slider, reorder handles and copy buttons

- **Slider.** The thumb follows the pointer 1:1 (MD7). Keyboard steps and Page Up/Down jump without easing. The value label updates in the same frame.
- **Reorder by drag** (answer rows, Branch cases, FD2 §18). The dragged row follows the pointer 1:1 at `--opacity-drag` (0.6) with `--e2`; the other rows make room with `transform: translateY()` over `--dur-base` (so the author sees where it will land); on drop the row settles over `--dur-fast`. Reduced motion: siblings jump. Keyboard (`Alt+↑/↓`): the row swaps in one frame, focus stays on it, and "Moved Yes to position 1 of 4" is announced.
- **Copy buttons** (Copy link, Copy transcript, Copy key). The icon swaps `copy` → `check` in one frame, the accessible name and tooltip become "Copied", and "Copied" is announced politely; the icon returns after `--timing-toast`. A toast is added only when the copied thing is not visible (P-07 §1.13).

### 3.7 Microcopy (before → after)

| Before | After |
|---|---|
| "Save" with a permanent spinner, or no feedback | "Saving…" (only after 200 ms), then "Saved 11:24 am" beside the form |
| "Context Saved" for 2 s whatever happened (F-QA-020) | Nothing on the button; "Saved" only after the 2xx, or "Couldn't save. Retry" |
| ACTIVATE with a glow and a hover lift | "Publish v8…" → "Publishing…" |
| "✓ Saved" morphing inside the button | The button returns to its label; the result lives in the status element |
| A switch that silently reverts after reload (F-UX-014) | "Couldn't save. Retry" beside a switch that visibly returns |

### 3.8 Accessibility

- Focus appears in the same frame as the focus event, including after a pointer click that moves focus programmatically (sheets focus their title, O §1.3).
- Busy buttons keep focus and use `aria-busy` plus `aria-disabled` (not `disabled`, which would drop focus to `<body>`).
- No state is carried by motion alone: the checked glyph, the switch position and the busy label all persist when motion is off.
- Forced colours: the pressed fill may be lost, so the focus outline (`Highlight`) and the checked marks (`data-mark`) carry the state (F §13).

### 3.9 Responsive

Identical at every breakpoint. On touch (`pointer: coarse` or below 768 px) there are no hover states; the press state is the only pointer feedback, and targets are 44 px (F §14). Phone sticky action bars use the same busy timeline; the label short form ("Call 2…") keeps the label stack narrow.

### 3.10 Acceptance criteria (controls)

- [ ] No control changes size, position, shadow or scale on hover or press, in either theme (visual snapshot diff of hover and press states is fill-only).
- [ ] The focus outline is present in the first frame after focus (Playwright: focus, then read `getComputedStyle(el).outlineStyle` without waiting).
- [ ] A request that settles in under 200 ms shows no busy label and no spinner (mock the API at 120 ms; assert the label never changed).
- [ ] A request of 1 s shows the progress label and spinner from 200 ms to 1,000 ms; the button's bounding box is identical in idle and busy states.
- [ ] Double-clicking "Place call…" or "Pay ₹500 via UPI" sends exactly one request.
- [ ] After success, the button label is the idle label, and the result appears in SaveState, StatusText or a toast.
- [ ] A switch whose save fails returns to its previous position and shows "Couldn't save. Retry"; the failure is announced once.
- [ ] Checkbox, radio and switch marks are present with `prefers-reduced-motion: reduce`; the switch thumb moves instantly.
- [ ] Tab indicators slide over 140 ms with motion allowed and jump with reduced motion.
- [ ] No `transition: all` and no `transition` on `outline` exist in the component CSS (lint).

---

## 4. Overlays: dropdowns, popovers, tooltips, dialogs, sheets

**Purpose and job.** Show where a floating surface came from and where it went, so the operator never loses their place in the table, canvas or call behind it. Motion is short, directional and never holds up focus or input.

**Findings addressed.** F-A11Y-005 and F-A11Y-027 (focus never enters dialogs), F-VIS-014 and F-VIS-015 (clipped tooltips), F-VIS-022 (blurred glass scrim), F-VIS-033 (tablet sidebar pushes content), F-UX-010 (cramped nested-scroll panel), F-A11Y-022.

**Hierarchy.** 1st: the overlay's content (focus lands there at t = 0). 2nd: the edge or trigger it came from (direction of travel). 3rd: the page behind (dimmed by the flat scrim only for modals).

### 4.1 The overlay motion table

Entrance uses the listed duration and `--ease-standard`. **Every exit is an opacity fade over `--dur-fast`**, with no travel back (O §1.5). Only `transform` and `opacity` animate.

| Container | Enter | Distance | Duration | Exit | Reduced motion |
|---|---|---|---|---|---|
| **Tooltip** | opacity | none | `--dur-base`, after `--timing-tooltip-delay` (300 ms) on hover; **0 ms delay on keyboard focus**; adjacent triggers within 300 ms skip the delay *and* the fade | `--dur-fast` | same (fade is state) |
| **Menu, ContextMenu, Select listbox, Combobox list** | opacity + translate from the trigger side | `--shift-popover` 4 px | `--dur-base` | `--dur-fast` | fade only |
| **Submenu** | opacity | none | `--dur-base` | `--dur-fast` | same |
| **Popover** (Filter, Columns, date range, info, "Go to [step]", "Connect to…") | opacity + translate from the anchor side | 4 px | `--dur-base` | `--dur-fast` | fade only |
| **Call gate** (modal popover, `--radius-12`) | as Popover | 4 px | `--dur-base` | `--dur-fast` | fade only |
| **Scrim** (modals only, flat `--scrim`, never blur) | opacity 0 → 1 | – | `--dur-slow` | `--dur-fast` | same |
| **Dialog, ConfirmDialog, CommandPalette** | opacity + `translateY(var(--shift-dialog))` → 0 | 8 px | `--dur-slow` | `--dur-fast` | fade only |
| **Sheet, overlay mode** (record 440, detail 560 at 1024–1439) | `translateX(var(--shift-sheet))` → 0 from the right edge; no scrim | own width | `--dur-slow` | `--dur-fast` | fade in place |
| **Sheet, docked** (≥ 1440) | **none**: the grid column appears in one frame; the table does not animate its width (O §4.7) | – | 0 | 0 | same |
| **Gate sheet** (Publish 640, Top up, conflict) | slide from the right + scrim | own width | `--dur-slow` | `--dur-fast` | fade |
| **Bottom sheet** (phone popovers, selects, Call gate, MoreSheet, full-screen sheets) | `translateY(var(--shift-sheet))` → 0 from the bottom + scrim | own height | `--dur-slow` | `--dur-fast` | fade |
| **Rail overlay** (1024–1279) and **NavSheet** (tablet) | `translateX(-100%)` → 0 from the left + scrim | own width | `--dur-slow` | `--dur-fast` | fade |
| **Flow inspector, overlay mode** (1024–1279) | slide from the right; the canvas pans the selection clear (§10.2) | own width | `--dur-slow` | `--dur-fast` | fade; pan instant |

**Direction from the anchor.** Radix sets `data-side` on floating content. The content starts offset *toward* its trigger and settles into place, so it appears to come out of the trigger: `bottom` starts at `translateY(-4px)`, `top` at `+4px`, `right` at `translateX(-4px)`, `left` at `+4px`. No scale, no `transform-origin` games, no arrow.

### 4.2 Content changes inside an open overlay

| Change | Motion |
|---|---|
| Switching records with J / K or Previous / Next in a sheet | The sheet stays; header and body content swap in **one frame**; the body scrolls to top instantly; "Lead 4 of 24" is announced (O §4.4) |
| Switching tabs in a sheet | Indicator slides over `--dur-base`; the panel swaps in one frame |
| Multi-step dialog ("Import leads": Checking → Mapping → Importing) | Body content replaces in one frame; the dialog keeps its size or resizes in one frame (no height animation); focus moves to the new step heading |
| Inline discard state (O §2.5) | The footer content swaps in one frame; focus moves to "Keep editing" |
| Palette results | Instant, no list animation (O §8.7) |
| Loading inside an overlay | Sheet skeleton after 200 ms (O §13.2); the header and tabs are real at once |

### 4.3 Timing rules shared by every overlay

1. **Focus at t = 0.** Focus moves into the overlay in the same frame it mounts (O §1.3), never on `animationend`. Content is interactive at once.
2. **Closing is inert at t = 0.** A closing overlay gets `inert` and `pointer-events: none` immediately; focus returns to the trigger (or its fallback) in the same frame; the fade then plays.
3. **Interruptible.** Closing during an entrance reverses from the current opacity over `--dur-fast`. Reopening during an exit retargets forward. Rapid toggling never queues animations.
4. **One entrance per layer (B3).** Opening the palette while a sheet is still entering finishes the sheet's animation at once.
5. **Scroll lock without shift.** Modal overlays lock `<body>` scroll; `scrollbar-gutter: stable` (base.css) keeps the page from jumping by the scrollbar's width.
6. **Nested floating content.** A Select inside the Publish gate opens with popover motion above it (`--z-popover` 60 over `--z-modal` 50); the gate does not move.

### 4.4 Optional: swipe to dismiss on phones

Bottom sheets may add a 32 × 4 px grabber (`--border-strong`, `--radius-2`) in a 24 px hit strip at the top (§18, `SheetGrabber`). Dragging it moves the sheet down 1:1; releasing beyond 30% of the sheet's height, or faster than 0.5 px/ms, closes it (it continues downward over at most `--dur-slow`); otherwise it returns over `--dur-base`. With reduced motion the drag still follows the finger and the release completes instantly. Close, Done or Back is always present; the swipe is never the only way out. A dirty sheet ignores the swipe and shows the inline discard state.

### 4.5 Wireframes: the same record sheet at each breakpoint

```
DESKTOP ≥1440 · docked (no motion)          LAPTOP 1024–1439 · overlay (slides from the right, 200 ms)
┌────┬──────────────────────┬─────────┐     ┌────┬─────────────────────┬─────────┐
│nav │ Leads table          │ Lead    │     │nav │ Leads table         │◄─ Lead  │ translateX(100%) → 0
│    │                      │ sheet   │     │    │ (stays interactive) │  sheet  │ no scrim
│    │                      │ 440     │     │    │                     │  e3     │ exit: fade 90 ms
│    │ grid column appears  │         │     │    │                     │         │
│    │ in one frame         │         │     │    │                     │         │
├────┴──────────────────────┴─────────┤     ├────┴─────────────────────┴─────────┤
│ Baseline                            │     │ Baseline                           │
└─────────────────────────────────────┘     └────────────────────────────────────┘

TABLET 768–1023 · modal, full height          PHONE <768 · full screen from the bottom
┌─────────────────────────────┐               ┌───────────────────┐
│ ▒▒▒▒▒▒▒▒▒▒▒▒┌──────────────┐│ scrim fade    │ ← Back to Leads   │ translateY(100%) → 0
│ ▒ list ▒▒▒▒▒│◄─ Lead sheet ││ 200 ms        │ Lead 1042 · Pune  │ 200 ms, scrim behind
│ ▒▒▒▒▒▒▒▒▒▒▒▒│   min(560,   ││ sheet slides  │ Overview Calls …  │ bottom bar hidden
│ ▒▒▒▒▒▒▒▒▒▒▒▒│   100%)      ││ 200 ms        │ …                 │ while open
│ ▒▒▒▒▒▒▒▒▒▒▒▒└──────────────┘│               │ [ Call… ]  sticky │
└─────────────────────────────┘               └───────────────────┘
```

### 4.6 States (overlay motion only)

| State | Motion |
|---|---|
| Opening while data loads | The container enters normally; its skeleton appears after 200 ms (no double animation) |
| Record gone or error inside | EmptyState or SectionError in one frame; the sheet does not close or shake |
| Offline while open | The ConnectionBar appears above the page; the overlay does not move |
| Permission denied action inside | The action is `aria-disabled` with its reason; no motion |
| Success inside a modal | Feedback about the modal's own action appears inside it; background toasts queue until it closes (O §1.6) |

### 4.7 Accessibility

- Tooltips appear on keyboard focus with no delay and stay while hovered (WCAG 1.4.13, O §6.3).
- Motion never delays focus, so screen-reader and keyboard users are never waiting on an animation.
- Reduced motion keeps every fade (fades are short state changes) and removes every slide and shift through the zeroed `--shift-*` tokens.

### 4.8 Acceptance criteria (overlays)

- [ ] For every overlay type, `document.activeElement` is inside the overlay in the first animation frame after opening (Playwright: open, then evaluate synchronously).
- [ ] Every exit takes 90 ms and moves nothing (computed `transform` is unchanged during the exit).
- [ ] With reduced motion (media or `data-motion="reduce"`), no overlay's computed `transform` changes at any point.
- [ ] Docked sheets at ≥ 1440 appear with no transition, and the table's width change happens in one frame.
- [ ] Opening the palette during a sheet entrance leaves no running animation on the sheet.
- [ ] No overlay uses `backdrop-filter`; the scrim is a flat colour.

---

## 5. Toasts

**Purpose and job.** Report the outcome of an action whose effect is off-screen, and offer the one follow-up that matters (Undo, Retry, View, Roll back to v7…), without covering the work (O §9).

**Findings addressed.** F-A11Y-014 (silent async outcomes), F-FLOW-025 and F-FLOW-001 (no delete feedback), F-UX-019 (silent failures), F-QA-020 (unproven success).

**Hierarchy.** The newest toast is the most salient; errors and Undo persist; nothing on the toast animates after it has arrived.

### 5.1 Motion

| Moment | Motion | Duration | Reduced |
|---|---|---|---|
| Enter | opacity + `translateY(var(--shift-toast))` → 0 | `--dur-slow` | fade only |
| Exit (timeout, Dismiss, Esc, superseded) | opacity | `--dur-fast` | same |
| Others in the stack reflow | **instant** (O §9.5); never a sliding stack | 0 | same |
| Coalescing ("Deleted 3 steps · Undo") | text updates in place; no re-entry; the timer restarts | 0 | same |
| Repeated identical error ("Couldn't refresh (3)") | count updates in place | 0 | same |
| Progress toast | message and 2 px bar update in place; bar `transform: scaleX()` over `--dur-base`, at most one update per 140 ms; becomes success or error **in place** | `--dur-base` | bar jumps |
| Swipe right (touch) | follows the finger 1:1; release past 40% of its width, or faster than 0.5 px/ms, exits right (`translateX(100%)` + opacity over `--dur-base`); otherwise returns over `--dur-base` | – | release completes instantly |
| Queued toasts (after a modal closes) | enter **one at a time**, each after the previous entrance ends (200 ms apart) (B3) | – | fades 200 ms apart |

**No countdown bar** on timed toasts: a shrinking bar is six seconds of idle motion. The 6 s timer pauses on hover, on focus inside the toast and while the tab is hidden (O §9.2).

### 5.2 Placement per breakpoint

```
DESKTOP / LAPTOP                               FLOW DESIGNER (Baseline hidden)
┌─────────────────────────────────────┐        ┌───────────────────────────┬─────────┐
│                                     │        │ canvas                    │inspector│
│                     ┌─────────────┐ │        │              ┌──────────┐ │ 320     │
│                     │ ✓ Lead saved│ │ ↑ 8 px │              │ ↶ Deleted│ │         │
│                     └─────────────┘ │ 200 ms │              │ 'Polite… │ │         │
├─────────────────────────────────────┤        │              └──────────┘ │         │
│ Baseline (toasts sit 16 px above)   │        ├───────────────────────────┴─────────┤
└─────────────────────────────────────┘        │ Problems bar (toasts sit 16 px above)│

TABLET                                         PHONE
┌─────────────────────────────┐                ┌───────────────────┐
│                             │                │                   │
│             ┌─────────────┐ │                │┌─────────────────┐│ full width − 32
│             │ toast       │ │ bottom 16 px   ││ toast           ││ above bottom bar
│             └─────────────┘ │                │└─────────────────┘│ + safe area + 8
└─────────────────────────────┘                ├───────────────────┤
                                               │ ⌂  ☰  ▤  ⤳  ⋯     │
```

### 5.3 Copy and kinds

The kinds, copy and timing are O §9.2's. Motion adds one rule: **the glyph never animates** (no drawing check, no spinning undo arrow); the progress kind uses the Spinner (`--dur-spin`) until it becomes success or error.

| Kind | Example | Stays |
|---|---|---|
| success | "Default flow updated · used by Cockpit, Meetings and Leads" | 6 s |
| undo | "Deleted 'Polite close' and 2 connections · Undo" | until dismissed |
| error | "Couldn't save. Your last 2 edits are on this device · Retry" | until resolved |
| progress | "Importing 1,240 leads… 820 done · View" → "1,212 imported · 28 skipped" | until done |
| publish | "v8 is live on 1 number and 1 batch · Roll back to v7…" | 6 s |

### 5.4 Acceptance criteria (toasts)

- [ ] A toast rises 8 px and fades in over 200 ms; with reduced motion it only fades.
- [ ] When a second toast arrives, the first does not animate; its position changes in one frame.
- [ ] Three toasts queued behind a modal enter one at a time after it closes, 200 ms apart.
- [ ] No timed toast shows a countdown bar; the timer pauses on hover and focus.
- [ ] A progress toast turns into a success or error toast without leaving and re-entering.
- [ ] Toasts never cover the Baseline, the Problems bar, the BottomBar or a focused element (O §9.3).

---

## 6. Loading: skeletons, spinners and progress

**Purpose and job.** Make waiting honest and calm: keep the shell and every known label on screen, show the shape of what is coming, and move only when a real request is in flight.

**Findings addressed.** F-UX-030 (no shell, zeros shown as data, silent route changes), F-QA-007 (full-screen loader on every hard load), F-VIS-023 (seven loader styles), F-FLOW-037 (default template flashes "FLOW VALIDATED" before the real flow), F-A11Y-022 (spinners and ring-pulse under reduced motion), F-A11Y-013 (silent route changes).

**Hierarchy.** 1st: the real labels already known (H1, column headers, KPI labels, the flow name). 2nd: the static shape of the data (skeleton). 3rd: a moving indicator, only for a request the user started.

### 6.1 The waiting ladder

| Wait so far | What shows | Motion |
|---|---|---|
| **0–200 ms** | Nothing changes. The shell, H1, tabs, toolbar and Baseline are already rendered from the layout (O §13.1) | none |
| **200 ms onward, region data** | Static skeleton in the region's final layout (O §13.2); `aria-busy="true"` and a hidden "Loading leads…" | **none: no shimmer, no pulse** |
| **200 ms onward, a control's own request** | The control's busy state (§3.2), Spinner sm in a chip, or StatusText progress ("Indexing… 60%") | spinner, `--dur-spin` linear |
| **200 ms onward, client navigation** | RouteProgress (§6.3) | stepped bar |
| **8 s onward** | Under the skeleton: StatusText neutral "Still loading. This is taking longer than usual." (text change only) | none |
| **15 s onward** | The same line gains **Retry** and "Check your connection"; the ConnectionBar appears if the network is actually gone (O §10.3) | none |
| **Failure** | SectionError or PageError in place of the skeleton, in one frame (O §16) | none |

**Skeleton lifecycle.** Shown only after `--timing-skeleton-delay` (200 ms); once shown, kept at least `--timing-skeleton-min` (400 ms) so it never flickers (`useDelayedFlag`, O §13.3). **Content replaces it in one frame**, with no fade (MD9): the layouts match, so the swap is calm, and a fade would only lengthen the perceived wait.

**Why no shimmer.** A shimmer loop is idle motion that says "busy" while nothing changes, pulls the eye to empty regions, and becomes an unstoppable loop past 5 s on a slow Indian mobile connection (WCAG 2.2.2). Static bars plus a hidden "Loading…" say the same thing without moving (D anti-pattern 4).

### 6.2 Spinner and indeterminate progress

| Indicator | Where | Motion | Reduced motion |
|---|---|---|---|
| **Spinner** (`loader-circle`, 3/4 arc) | busy buttons, SaveState Saving…, StatusText progress, palette and popover loading rows, progress toasts | one turn per `--dur-spin` (800 ms), `linear`, only while its request is in flight; unmounts the moment it settles | a static arc; the adjacent word carries the state |
| **Indeterminate ProgressBar** | waits with no measure, expected under 10 s | a 30% segment crosses the track once per `--dur-pulse`, `linear`, only while in flight | a static 30% segment and the label "Working…" |
| **Determinate ProgressBar** | uploads, imports, exports | fill `transform: scaleX()` over `--dur-base`, updates throttled to one per 140 ms so it glides rather than jitters | fill jumps to each value |
| **StageProgress** | AI draft, knowledge indexing, lead import | stage marks swap in one frame (done `check`, current Spinner sm, failed `x`) | current mark is a static arc |

**Budget (B4).** At most one spinner per region. A list with more than 3 working rows (the Knowledge upload list, a bulk re-analyse) shows the spinner only on its aggregate line, "3 of 5 uploaded · 2 indexing"; each row shows its word ("Indexing… 60%") and a determinate bar where a measure exists.

### 6.3 RouteProgress

A 2 px bar in `--accent-mark` across the top of the main column (O §14.1).

```
t = 0      click a nav item: aria-current moves at once; nothing else changes
t = 200    still pending → bar appears at 30% (opacity 0 → 1, 90 ms)
t = 500    50%   ┐
t = 800    65%   │ each step: transform scaleX over 140 ms (decelerating steps, never a loop)
t = 1100   75%   │
t = 1400   82%   │
t = 1700   87%   │
t = 2000   90%   ┘ holds at 90%
done       100% over 90 ms, then fades over 90 ms; <title> updates; focus moves to the new H1
```

Reduced motion: a static bar at 30% appears at 200 ms and disappears on completion. The bar is `aria-hidden`; the route change itself is announced by the title and the H1 focus (F-A11Y-013).

### 6.4 Surface-specific loading

| Surface | Loading motion |
|---|---|
| Hard load of any app route | Server-rendered shell in the first paint; data regions skeleton after 200 ms; **never a full-screen spinner** (F-QA-007) |
| Flow Designer | CanvasSkeleton: four static silhouettes on the dot grid; chips hidden. The real flow renders **already fitted**: measure off-screen, compute the viewport, then show, so there is no animated fit on load and never the default template first (F-FLOW-037, FD2 §17). Editing and autosave stay off until hydration ends (F-FLOW-002) |
| Transcript (streaming) | Turns append; a partial turn is `--text-3` ending in "…" and becomes `--text` over `--dur-fast` when final. **No typing effect, no per-word fade** (N §12.4) |
| Assistant replies | The same partial-to-final rule; plan steps appear whole |
| Charts | Axes and gridlines only while loading; marks appear in one frame; no growing bars or counting numbers (N §11.12) |
| KPI tiles | Real label; number skeleton; the number appears in one frame (no count-up) |
| Images and avatars | No fade-in; initials render first and are replaced in one frame |
| Cockpit Ready card | Form layout inside the card; "Place call…" disabled with "Checking readiness…" (O §13.2); rows resolve one by one in place, no animation |

### 6.5 Acceptance criteria (loading)

- [ ] On a throttled hard load of /leads (1.5 s API), the sidebar, H1 and column headers are visible in the first paint, and no element covers the viewport.
- [ ] No skeleton appears for a 150 ms response; a 300 ms response shows a skeleton for at least 400 ms.
- [ ] `getAnimations()` on a page showing skeletons returns nothing (no shimmer).
- [ ] A skeleton's replacement by content produces no running animation.
- [ ] The Flow Designer never renders the default template before the saved flow, and never animates a fit on load.
- [ ] With reduced motion, spinners are static arcs and every busy element still shows its word.

---

## 7. Save-state transitions

**Purpose and job.** Let the author trust, at a glance and without reading every second, that their edit is safe, and notice immediately when it is not.

**Findings addressed.** F-FLOW-003 ("Up to date" permanent, failures silent, dashed idle icon reads as a spinner), F-QA-002 and F-UX-024 (writes on open, "Up to date" while failing), F-FLOW-002 (hydration writes), F-UX-012 (always-enabled Save), F-QA-020.

**Hierarchy.** The chip is quiet when all is well (text-3, no fill), neutral while dirty, and loud only on failure. A failure outranks everything else in the header.

### 7.1 The SaveState timeline (Flow header, autosaving sheets, Cockpit context)

```
edit ──► dirty "Unsaved changes" (0 ms, neutral chip)
          │  graph edits: save 300 ms after the change · typing: 800 ms after the last key or on blur (FD2 §4.3)
          ▼
        request ──── settles < 200 ms ─────────────────────► saved  "✓ Saved 11:24 am"  (quiet)
          │
          └── still pending at 200 ms ──► saving "◌ Saving…" ──(≥ 400 ms visible)──► saved
          │
          └── fails 3× with backoff ────► error "⊘ Couldn't save · Retry"  (danger, persistent)
                                           + error toast on the first failure + assertive announcement, once
offline event ──► "Offline · 3 edits on this device" (warning)      409 ──► "Changed elsewhere · Review" (warning)
```

| Transition | Visual | Timing | Announce |
|---|---|---|---|
| saved → dirty | Label and icon swap; neutral fill and border appear | content 0 ms; fill `--dur-fast` | no |
| dirty → saved (fast save) | Straight to "Saved 11:24 am"; **no Saving… flash** | 0 ms | no |
| dirty → saving | Only after 200 ms pending | 0 ms | no |
| saving → saved | After at least 400 ms of Saving… | 0 ms | no |
| any → error | Danger fill at once; **no shake, no pulse** | fill `--dur-fast` | assertive, once |
| error → saved (retry works) | Quiet state returns | `--dur-fast` | polite "Saved" (recovery only) |
| → offline / conflict | Warning fill | `--dur-fast` | polite / assertive, once |

**Anti-flicker rules.**
1. Continuous editing keeps the chip on "Unsaved changes"; it does not blink through Saving and Saved on every keystroke.
2. The chip changes its visible label at most once per 400 ms; intermediate states inside that window collapse (dirty → saving → saved within 400 ms shows dirty → saved).
3. The time in "Saved 11:24 am" updates only when a save completes, never on a clock tick.
4. **Width is reserved.** The chip's inline size is at least that of "Unsaved changes" (the widest common label), so the header items to its right do not shift on every save; the rarer error, offline and conflict labels may widen it.
5. Hydration, fit, dimension measurement, selection, viewport and theme changes never set dirty (O §18.1), so opening a flow never shows "Unsaved changes".

### 7.2 VersionChip and publish

| Moment | Visual | Motion |
|---|---|---|
| First edit after publishing | `Draft · 1 change ▾` appears beside `Live v7` | one frame; header items to the right shift once (a real state change) |
| Change count updates | "3 changes" → "4 changes" | text in place |
| Publish succeeds | `Live v7` → `Live v8` (text in place); the Draft chip disappears in one frame; publish toast rises | toast `--dur-slow` only |
| Discard draft changes | The canvas swaps to Live content in one frame; Undo toast | toast only |
| Roll back | As publish, to v9 | toast only |

The Live chip's dot is **static** (a live flow is not a live call, N §5.4).

### 7.3 Forms with an explicit Save (Settings)

| Moment | Motion |
|---|---|
| First change in the form | UnsavedChangesBar rises `--shift-toast` over `--dur-slow` (O §18.3); announced once |
| Save pressed | The bar's Save follows §3.2 |
| Saved | The bar exits over `--dur-fast`; the section heading shows "Saved 11:24 am" for 6 s, then it fades over `--dur-fast` |
| Error | The bar stays; InlineError inside it; Save returns to idle |
| Discard | Fields revert in one frame; the bar exits |

### 7.4 Inline and optimistic edits (Leads status, lead notes, flags)

The new value shows at once. On failure the cell returns to the old value in one frame and shows a danger StatusTag "Couldn't save · Retry" (N §7.8). **No highlight flash** when a value is saved or when the server pushes an update (P-03 §8.3).

---

## 8. Success and error feedback

**Purpose and job.** Confirm what actually happened, where it happened, with no celebration and no alarm theatre.

**Findings addressed.** F-QA-020, F-UX-006 (unproven success), F-UX-019 (silent or far-away failures), F-FLOW-025 (ghost inspector, no delete feedback), F-A11Y-014.

| Situation | Feedback | Motion |
|---|---|---|
| Saved in place | StatusText "Saved 11:24 am" or the element's new state | text 0 ms |
| Effect off-screen | Success toast | toast enter |
| Money arrived | Only after provider confirmation: toast "₹500 added. Wallet ₹540.10 · about 3 h of calls."; balance changes in place | no count-up |
| Setup step done | The step's mark becomes `check` in one frame; "Finish setup · 4 of 5" updates in place; when all five pass, the card disappears in one frame and the Live state appears | no confetti, no check-draw |
| Published | Live chip text changes; publish toast | toast only |
| Deleted (reversible) | The item disappears in one frame; neighbours close the gap in one frame; Undo toast | no collapse animation, so nothing slides under the pointer |
| Undo | The item returns in one frame, selected; if off-screen, the view scrolls or pans to it (smooth unless reduced) | camera only |
| Field error | Message appears under the field; on submit, focus moves to the first invalid field (`scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })`, then `focus({ preventScroll: true })`) | **no shake, no red flash** |
| Action failed | InlineError beside the control, or error toast | text 0 ms |
| Gate blocked | The blocking row and the disabled primary's reason appear in one frame | none |
| Call placed | The gate closes; the call card shows "Dialling…" (§12) | gate exit, then state change |
| File dropped on a dropzone | On `dragenter` the zone's border and fill change over `--dur-fast`; on drop, rows appear in one frame with their progress | repaint only |

**Never:** shake, bounce, confetti, glow, flashing red or green, a check that draws itself, success sounds, a colour pulse on the changed row, or an exclamation mark in the copy (D §4.2 rule 7, O §17).

### 8.1 Acceptance criteria (save state and feedback)

- [ ] Opening a flow shows "Saved …" (or "Not live yet") and never "Unsaved changes" or "Saving…"; no request is sent.
- [ ] A blocked PUT ends in "Couldn't save · Retry" within 3 retries, with one assertive announcement and one error toast; the chip never shows "Saved" afterwards until a save succeeds.
- [ ] While typing continuously for 5 s in the inspector, the chip reads "Unsaved changes" throughout.
- [ ] The header items to the right of the chip keep their x-position across dirty, saving and saved.
- [ ] No success state animates (no running animations after a success, apart from a toast's entrance).
- [ ] Deleting a step, a lead or a note produces no collapse animation; the Undo toast appears within one frame of the deletion.

---

## 9. The app shell

**Purpose and job.** Move between the twelve destinations, read workspace state (live flow, number, wallet, calls in progress) and receive feedback, with chrome that is completely still unless the operator acts or something real changes. The shell is where "quiet chrome" (D P7) is won or lost, because it is on screen all day.

**Findings addressed.**

| Finding | What changes in motion terms |
|---|---|
| F-UX-030, F-QA-007 | The shell never unmounts or shows a loader; RouteProgress covers slow navigations (§6.3) |
| F-A11Y-013 | Route change: title and H1 focus at once; no page transition animation |
| F-A11Y-022 | The framer-motion logo loop (3.2 s) and the rail's pulsing status are removed; the mark is static |
| F-UX-018 | The random "22ms" ticker and "SYS: ONLINE" are removed; nothing in the shell ticks while idle |
| F-VIS-033 | Tablet navigation is a sheet that slides over content; content never reflows or animates its width |
| F-UX-007, F-VIS-015 | Rail tooltips portal out and fade (no clipping, no stray scrollbars) |
| F-UX-028, F-QA-036, F-A11Y-015 | The wallet signal is in the first paint (Baseline segment, chip or page notice); it never slides in 3 s late or pushes the page |
| F-QA-038, F-VIS-022 | The fixed z-9999 noise overlay is deleted |
| F-RWD-001, F-UX-008 | The phone MoreSheet reaches every destination; it is a standard bottom sheet |

**Information hierarchy (what may catch the eye, in order).**
1. The content region changing (a new route's data, a sheet the user opened).
2. Overlays the user opened (menus, palette, rail overlay).
3. A Baseline or chip segment turning amber (a real low or blocked state).
4. Nav hover, the quietest possible repaint.

### 9.1 Shell motion inventory

| Element | Trigger | Motion | Reduced motion |
|---|---|---|---|
| NavItem hover | pointer | fill and label colour `--dur-fast` (N §1.3) | same |
| NavItem current (`aria-current`) | click or route | moves to the new item **at click time**, in one frame, before data loads | same |
| RouteProgress | navigation pending > 200 ms | §6.3 | static 30% bar |
| Page change | route resolves | **none**: header, H1 and regions render in one frame; skeletons after 200 ms | same |
| Rail tooltips (1024–1279) | hover 300 ms, focus 0 ms | fade `--dur-base`, portalled to the right | same |
| Rail overlay (`[` or expand) | user | sidebar from the left over `--dur-slow` + scrim | fade |
| Docked sidebar collapse to rail (`[` at ≥ 1280) | user | **one frame** (content width must not animate) | same |
| Workspace menu, account menu | user | Menu motion (§4.1) | fade |
| ⌘K palette | user | Dialog motion, results instant | fade |
| Setup card step done | server state | mark and count swap in place | same |
| Baseline segment low or blocked | server state | repaint to `--bl-warn` over `--dur-fast`; the text changes in one frame | same |
| Baseline call segment | call starts or ends | appears or disappears in one frame; timer text ticks each second | same |
| Nav "live" badge dot | calls in progress | **static** (MD3); count and words in the tooltip | same |
| Tablet and phone call chip | call starts | appears in one frame; tone repaint `--dur-fast`; static dot | same |
| Wallet chip | balance state | repaint only | same |
| ConnectionBar | offline | appears in one frame and pushes content (a rare, true state, O §10.3); back online: disappears in one frame + toast "Back online. 2 edits saved." | same |
| SessionExpired | 401 | Dialog sm motion | fade |
| Skip link | first Tab | appears in one frame (no slide) | same |
| Theme or Motion change | account menu | **no transition** (MD10) | same |

### 9.2 Route change, step by step

```
t = 0 ms     click "Leads" (or Enter, or a ⌘K result)
             · NavItem current moves to Leads (one frame)
             · old page stays visible and usable; no fade-out, no overlay
t = ~50 ms   new route's layout renders from the nav config: H1 "Leads", tabs, toolbar, table header
             · focus moves to the H1; <title> "Leads · Vaani Labs"; polite region stays silent (focus moved)
             · data regions: nothing yet
t = 200 ms   data still pending → table skeleton (static) + RouteProgress at 30%
t = 900 ms   data arrives → rows replace the skeleton in one frame; RouteProgress completes and fades (90 ms)
Back / Forward → the same, and scroll position is restored instantly (no smooth scroll on history navigation)
```

### 9.3 Wireframes (what moves where)

```
DESKTOP ≥1440 (1280–1439 identical, sheets overlay instead of dock)
┌──────────────┬───────────────────────────────────────────────────────────────┐
│ ▣ Workspace ▾│▔▔▔▔▔▔▔▔▔ RouteProgress 2 px (only after 200 ms, stepped) ▔▔▔▔▔▔▔│
│ ⌕ Search  ⌘K │ Leads                                   Export  Import…  [New] │ H1 renders in 1 frame
│ OPERATE      ├───────────────────────────────────────────────────────────────┤
│  Cockpit     │ All · New · Callbacks due ─── indicator slides 140 ms          │
│  …           │ ⌕ Search…  Filter ▾  Columns  Std│Cmp                          │
│ BUILD        │ ┌───────────────────────────────────────────────────────────┐ │
│  Flows       │ │ header row (real)                                         │ │
│ DATA         │ │ ░░░░░░░░ skeleton rows, static, after 200 ms              │ │
│ ▸Leads ◄─────┼─┼── current moves at click (1 frame)                        │ │
│              │ └───────────────────────────────────────────────────────────┘ │
│ Finish setup │                                              ┌─────────────┐  │
│ 3 of 5       │                                              │ toast ↑8 px │  │
│ ◉ Account ▾  │                                              └─────────────┘  │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ Live v7 · +91 80 •••• 2210 ready · Wallet ₹42.10 · about 17 min · Top up ◄ amber repaint 90 ms │
└──────────────────────────────────────────────────────────────────────────────┘

LAPTOP 1024–1279 · rail + overlay
┌──┬────────────────────────────┐        ┌──────────────┬───────────────┐
│▣ │ Leads                      │  "["   │ ▣ Workspace ▾│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ sidebar slides from the left
│⌂ │                            │  ───►  │ OPERATE      │▒ scrim 200 ms ▒│ 200 ms over a flat scrim;
│◎ │  table                     │        │  Cockpit     │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ content does not reflow
│… │                            │        │  …           │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ Esc / scrim / "[" / route: fade 90 ms
├──┴────────────────────────────┤        └──────────────┴───────────────┘
│ Baseline                      │
└───────────────────────────────┘

TABLET 768–1023 · top bar + NavSheet                 PHONE <768 · bottom bar + MoreSheet
┌───────────────────────────────┐                    ┌───────────────────┐
│ ☰  Leads     ● Live 02:14  ₹42 ⌕│ chips: 1 frame     │ Leads  ● 02:14 ₹42│ chips appear in 1 frame
├───────────────────────────────┤ static dot         ├───────────────────┤
│ ┌───────────┐▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│                    │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│ │ NavSheet  │▒▒▒ scrim ▒▒▒▒▒▒▒▒│ left sheet 200 ms  │ ┌───────────────┐ │ MoreSheet rises from the
│ │ groups    │▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│                    │ │ Assistant     │ │ bottom over 200 ms + scrim;
│ │ setup card│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│                    │ │ …  Sign out…  │ │ exit fade 90 ms
│ └───────────┘▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│                    │ └───────────────┘ │
└───────────────────────────────┘                    ├───────────────────┤
                                                     │ ◎  ⚇  ▤  ⤳  ⋯More │ tab change: 1 frame
                                                     └───────────────────┘
```

### 9.4 The Motion preference (new, MD4)

Account menu, below Theme:

```
Theme          ○ System  ○ Light  ○ Dark
Motion         ● Match system  ○ Reduce motion
               Stops sliding and pulsing. Meters show words instead.
Shortcuts      [switch] Single-key shortcuts
```

- A radio group (`role="menuitemradio"` items inside the account Menu), like Theme (F-VIS-032).
- Stored as a server-side UI preference (`motion: "system" | "reduce"`), with `localStorage["vaani:motion"]` (`system` | `reduce`) as a fallback (reads and writes wrapped in try/catch). The server layout renders `data-motion="reduce"` on `<html>` when it knows the preference; otherwise the pre-hydration script `THEME_BOOT` (foundations §15.3), the same one that sets `data-theme`, sets it from storage, so the first paint is already correct. `reduce` is the only attribute value; Match system removes it.
- Changing it applies at once, with transitions suspended for that frame (MD10), and shows no toast (the change is visible).
- "Match system" follows `prefers-reduced-motion`; "Reduce motion" forces reduced behaviour even when the OS allows motion. There is no "force full motion" option.

### 9.5 States

| State | Shell motion and copy |
|---|---|
| First use (setup incomplete) | Setup card "Finish setup · 3 of 5 · Next: add money"; completing a step swaps its mark in place; nothing animates on arrival |
| Loading (hard load) | Shell in the first paint; data skeletons after 200 ms; no spinner |
| Partial (a Baseline fact failed) | That segment reads "Wallet · couldn't load · Retry" in one frame; others unchanged |
| Error (route failed) | PageError in the content region in one frame; the shell stays |
| Offline | ConnectionBar "You're offline. Showing data from 11:42 am." in one frame; network actions carry "You're offline" |
| Permission | Forbidden page in the content region; no redirect, no motion |
| Success | Toasts only; the shell does not flash |
| Live call in progress | Baseline segment "On call 02:14" (timer text), static nav dot, tablet and phone chip; the only pulse is in the Cockpit call card (§12) |

### 9.6 Interactions and shortcuts (motion-relevant)

| Key | Motion |
|---|---|
| `[` | Rail overlay slides in (1024–1279); docked sidebar collapses in one frame (≥ 1280) |
| `⌘K` / `Ctrl+K` | Palette: dialog motion; Esc clears the query first, then fades out |
| `?` | Shortcuts sheet: Dialog lg motion |
| `F6` | Focus moves between regions instantly (no scroll animation) |
| `F8` | Focus jumps to the newest toast (no motion) |
| `Esc` | Closes the top-most overlay: fade 90 ms, focus returns at t = 0 |

### 9.7 Microcopy (before → after)

| Before | After |
|---|---|
| Full-screen "Loading…" spinner on every hard load | Nothing visible; the shell renders; "Loading leads…" is read to screen readers only |
| "SYS: ONLINE · 22ms" ticking in the rail | Nothing while idle; "Line · Good · 180 ms" only during a call |
| "Wallet empty — top up now to keep calls flowing." sliding in 3 s late | Baseline "Wallet ₹0 · Top up" in the first paint; the page notice on spending pages only (O §10.2) |
| (no motion setting) | "Motion: Match system · Reduce motion" |

### 9.8 Accessibility notes

- Route changes move focus to the H1 in the same frame the H1 renders; nothing waits for data.
- The Baseline announces state changes only (Live, Ended, Low balance, Couldn't save), debounced; its timer never animates or announces (D §6.1).
- Both reduced-motion sources (media query, `data-motion`) are honoured by CSS and by every JS-driven motion (§13.3).
- Forced colours: nothing in the shell relies on motion; the current item keeps its `Highlight` outline.

### 9.9 Responsive behaviour

| Width | Shell motion differences |
|---|---|
| ≥ 1440 | Record sheets dock (no motion); everything else as §9.1 |
| 1280–1439 | Sheets overlay from the right (200 ms) |
| 1024–1279 | Rail; `[` opens the sidebar as an overlay from the left |
| 768–1023 | NavSheet from the left; sheets modal, full height |
| < 768 | MoreSheet and every sheet from the bottom; toasts full width above the bottom bar; no hover states |
| Height ≤ 720 | The Baseline folds into a header chip (one frame at the breakpoint; never animated on resize) |

Crossing a breakpoint while resizing re-lays the shell in one frame; nothing animates on `resize`.

### 9.10 Telemetry hooks (optional, consent-gated, no content)

| Event | Properties | Question it answers |
|---|---|---|
| `motion_pref_changed` | `value` (system, reduce), `os_reduce` (bool) | How many operators need reduced motion beyond the OS setting |
| `session_motion_state` | `effective` (full, reduced), `source` (os, app) | Share of sessions in reduced motion (test coverage priority) |
| `route_progress_shown` | `route`, `duration_bucket` (0.2–0.5, 0.5–1, 1–2, > 2 s) | Which routes are slow enough to show progress |
| `skeleton_long_wait` | `region`, `bucket` (8 s, 15 s) | Where "Still loading" appears |

### 9.11 Acceptance criteria (shell)

- [ ] After any navigation, the only animation that may run is RouteProgress (Playwright: `getAnimations()` right after `click`).
- [ ] `aria-current` moves to the clicked item before the route's data request resolves.
- [ ] At 1024 × 768, `[` opens the sidebar over a scrim in 200 ms; the content's `getBoundingClientRect()` is unchanged throughout.
- [ ] At 1440, `[` collapses the sidebar in one frame with no running transition on `main`.
- [ ] With the Motion preference set to "Reduce motion" on an OS that allows motion, the rail overlay, NavSheet and MoreSheet fade without moving, and the live dot never pulses.
- [ ] The wallet state is present in the server-rendered HTML; no element shifts the layout after first paint (CLS ≤ 0.01 on /cockpit, /leads, /billing).
- [ ] Idle test (B8): two seconds after load with no call, no audio and no request, every app route has zero running animations.
- [ ] Changing Theme or Motion produces no running transition in the next frame.

---

## 10. Flow Designer canvas: select, drag, connect, snap, zoom

**Purpose and job.** Make every edit to a call flow feel direct and legible: the step under the hand stays under the hand, a connection shows where it will land before you let go, and every change the author did not drag (snap, Tidy, undo, Go to step) moves just enough to be followed. The canvas should feel like a precise circuit editor (D §6.5), never like a toy.

**Findings addressed.**

| Finding | Motion answer |
|---|---|
| F-FLOW-011 | No edge animates at rest; React Flow's `animated` is never set; only the test trace moves (§11) |
| F-FLOW-021 | Alignment guides while dragging; grid snap with a 90 ms settle on release; Tidy with animated positions |
| F-FLOW-009, F-FLOW-026 | Palette inserts are placed in the next free slot, connected, selected and panned into view; never stacked on top of another step |
| F-FLOW-006, F-A11Y-001, F-A11Y-007, F-A11Y-028 | Instant focus ring distinct from selection; keyboard traversal pans only when needed; `C` connect and `Alt+Arrow` move have their own feedback |
| F-FLOW-020, F-A11Y-023 | Sockets 10 px with 24 px hit areas (44 on touch); valid input ports grow to 14 px while connecting |
| F-FLOW-001, F-FLOW-025 | Delete removes in one frame, closes the inspector, raises the Undo toast; Undo restores and reselects |
| F-FLOW-005, F-QA-003 | Undo and Redo apply in one frame; the camera follows the restored step |
| F-FLOW-008 | Level-of-detail swaps in one frame, with hysteresis so text never flickers at a threshold |
| F-FLOW-022, F-RWD-014 | Inspector overlay at 1024–1279 pans the selection clear; resizing re-lays out in one frame |
| F-FLOW-002, F-FLOW-037 | Programmatic motion (fit, snap, Tidy frames) never marks the draft dirty mid-animation |

**Information hierarchy while editing.**
1. The step or selection being manipulated (under the pointer, `--e2`, selection treatment).
2. The connection being made (ghost edge, grown target ports).
3. Guides and the "Top aligned" tag.
4. Consequences in the chrome: SaveState to "Unsaved changes", the issues chip count after 300 ms.

### 10.1 Hover and edge hover

| Target | Change | Timing |
|---|---|---|
| Step | border `--border-strong` → `--control`; a free socket shows its "+" quick-add (opacity) | `--dur-fast` in and out |
| Edge | stroke to `--edge-hover` and 2 px; its label appears if hidden at this zoom; tooltip names both ends after 300 ms | colour `--dur-fast`, width 0 ms |
| Socket | cursor `crosshair`; the socket gets a 2 px `--accent-mark` ring | `--dur-fast` |
| Phase ruler segment | fill `--surface-2` | `--dur-fast` |

No lift, no shadow growth, no glow on hover. Hover never changes the selection.

### 10.2 Selection

| Moment | Visual (FD1 step states) | Timing |
|---|---|---|
| Click a step, `Space` on a focused step, or a marquee touching it | header `--accent-soft`, 1 px `--accent-mark` border plus inner ring, sockets `--accent-mark` | fill and border `--dur-fast`; `--e1` → `--e2` **swaps in one frame** (box-shadow is never transitioned) |
| Deselect (Esc, click empty canvas) | reverse | `--dur-fast` |
| Inspector, docked (≥ 1280) | content swaps in one frame; its scroll resets to top instantly | 0 ms |
| Inspector, overlay (1024–1279) | slides in from the right over `--dur-slow`; **if the selected step's box intersects the inspector's area plus 24 px, the camera pans it clear** over `--dur-slow`, starting after the inspector lands | 200 + 200 ms, sequential (M4) |
| Edge selected | stroke `--edge-active` 2 px, label in the selection treatment, its popover (Insert step…, Change target…, Delete) opens | repaint `--dur-fast`, popover `--dur-base` |
| Marquee (`Shift`-drag) | rectangle follows the pointer 1:1: 1 px `--accent-mark` border, `--accent-soft` fill at `--opacity-partial`; touched steps take the selection treatment live | rect 0 ms; steps `--dur-fast` |
| Selection bar ("3 steps selected · Frame · Align · Duplicate · Delete") | rises `--shift-toast` above the Problems bar | `--dur-slow`; exit `--dur-fast` |

### 10.3 Keyboard focus and traversal

- The focus outline (2 px `--focus`, offset 3 px, `--focus-offset-node`) appears in the frame focus arrives. Focus and selection show together when both apply (F §13).
- `→ ← ↑ ↓` move focus along the graph instantly. The camera moves **only** when the newly focused step leaves the **safe area** (the canvas minus 10% on each side and minus any overlay), then pans over `--dur-slow` to bring it to the nearest edge of the safe area, not the centre, so rapid arrowing produces small moves. A new pan request retargets from the current viewport.
- `Enter` / `F2` moves focus into the inspector's Label field in one frame; `Esc` returns it to the step.
- `Tab` into the canvas lands on the first Trigger; the camera pans to it only if it is outside the safe area.

### 10.4 Dragging a step

```
 pointerdown on a step body
   │  moves < 4 px → it is a click (select); nothing moves, nothing saves
   ▼  moves ≥ 4 px (drag threshold)
 DRAG  · the step follows the pointer 1:1: no easing, no inertia, no scale, no tilt
       · --e2 on the dragged step; cursor "grabbing"; text selection off; other steps inert to hover
       · edges re-route every frame (requestAnimationFrame)
       · guides: when an edge or centre of the dragged box comes within 6 px (screen) of another
         step's, a 1 px --accent-mark guide spans both steps and the step is held on that line
         (instant); an info Tag "Top aligned" sits 8 px from the pointer
       · near the canvas edge (within 40 px) the canvas auto-pans, up to 12 px per frame at the edge
   │
   ├─ Esc → the step returns to where it started over --dur-base (140 ms); no history entry, no save
   ├─ Alt held → guides and grid snap are off (place freely)
   ▼ release
 SETTLE · position rounds to the 16 px grid; the step glides the ≤ 8 px remainder over --dur-fast
       · one history entry; SaveState → "Unsaved changes"; the draft saves 300 ms later
```

| Detail | Rule |
|---|---|
| Multi-step drag | The whole selection moves together; guides compare the selection's bounding box |
| Drag into a frame | The frame's border repaints to `--accent-mark` over `--dur-fast` while the pointer is inside it; on release the step becomes a member |
| Drag onto another step | Allowed to overlap during the drag; on release, if the step overlaps another by more than 50%, it is nudged to the nearest free grid slot to the right over `--dur-fast` (never left stacked, F-FLOW-021) |
| Keyboard move (`Alt+Arrow` on a focused step) | Moves 16 px per press, **instant** (no settle), no guides; presses within 1 s coalesce into one history entry and one announcement, "Moved Ask about a site visit" |
| Reduced motion | The drag itself is unchanged (it is the user's own motion); the settle, Esc return and auto-pan easing become instant |
| View-only flow | Steps do not move; the cursor stays default; a drag attempt shows the reason tooltip "View only. Duplicate to edit." after 300 ms |
| Review mode (768–1023) and phone | Steps do not move: a one-finger drag on a step pans the canvas (R §10.9), so nothing is refused and no tooltip appears; the limit is stated once, in the Review Notice |

**Why snap on release, not during the drag.** React Flow's `snapToGrid` makes the step jump in 16 px increments under the cursor, which fights the hand (M3). Holding the step on alignment guides during the drag (the common need) and rounding to the grid on release (the tidy result) gives both precision and a direct feel.

### 10.5 Connecting

```
 pointerdown on an answer socket (10 px, hit 24 px; 44 px on coarse pointers)
   ▼ ≥ 4 px
 GHOST · a 2 px --edge-active edge at --opacity-drag (0.6) from the socket to the pointer, routed like
         a real edge, updated every frame
       · every valid input port grows 10 → 14 px with a 2 px --accent-mark ring (transform scale, 90 ms)
       · invalid targets (the source step itself, Trigger steps, which have no input) do not change;
         hovering one shows the not-allowed cursor and, after 300 ms, the reason tooltip:
         "Triggers start a call. Nothing connects into them."
       · within 24 px of a valid port the ghost's end snaps to it (instant), the port fills
         --accent-mark and the target step's border repaints to --accent-mark (90 ms)
   │
   ├─ release on a valid port → the edge is created in one frame with its label ("Yes"); ports shrink
   │    back (90 ms); an amber "Not connected" answer repaints to connected (90 ms) and loses its stub;
   │    announce "Connected Yes to Book site visit"; issues recompute after 300 ms
   ├─ release on empty canvas → the ghost holds, static; the Add step picker opens at the release
   │    point (popover, 140 ms); choosing a type inserts the step there, already connected;
   │    Esc removes the ghost (fade 90 ms)
   ├─ release anywhere else, or Esc → the ghost fades over --dur-fast; nothing is created
   ▼
 RE-ROUTE an existing edge: drag its arrowhead end; the edge becomes the ghost; Esc returns it (140 ms)
```

**Without dragging (P5).** `C` on a focused socket or step opens "Connect to…" (a combobox popover, `--dur-base`); `Go to [step ▾]` in the inspector does the same. The new edge appears in one frame; if its target is outside the safe area, the camera pans over `--dur-slow` so both ends are visible; focus stays on the socket.

### 10.6 Adding, duplicating, deleting, undoing

| Action | Result | Motion |
|---|---|---|
| Palette click or `Enter`, or `A` on a focused step | The new step is placed after the selected step in the next free slot of the next rank (never on top of another), connected, selected and focused | appears in **one frame** (no pop-in); camera pans over `--dur-slow` only if it lands outside the safe area |
| Palette drag | The tile follows the pointer at `--opacity-drag`; over the canvas it becomes a step silhouette; hovering an edge highlights it (`--edge-hover`, 2 px): "drop to insert between"; drop inserts and splits the edge in one frame | pointer 1:1 |
| "+" on a free socket | The search-first picker opens at the socket (popover); the result is placed and connected as above | popover `--dur-base` |
| Duplicate (`⌘/Ctrl+D`) | The copy is placed 2 grid squares right and down, named "… (copy)", selected | one frame |
| Delete (`Delete`, menu) | The step and its connections disappear in one frame; the inspector closes (overlay mode fades 90 ms); focus moves to the previous step in graph order; Undo toast "Deleted 'Polite close' and 2 connections · Undo" | toast only |
| Undo / Redo | The graph returns in one frame; the restored step is selected; the camera pans to it over `--dur-slow` if it is outside the safe area | camera only |
| Tidy | Every moved step interpolates to its new position over `--dur-slow` (edges follow each frame); then, if the result is outside the viewport, Fit runs over `--dur-slow`; one history entry; toast "Tidied 14 steps · Undo" | 200 + 200 ms, sequential |
| AI draft "Apply to draft" | The canvas updates in one frame; added and changed steps carry the words "New" and "Edited"; the camera fits to the changes over `--dur-slow` (F-FLOW-031) | camera only |

### 10.7 Camera: pan, zoom, fit, go to

| Input | Motion |
|---|---|
| Wheel, trackpad pinch, `Space`-drag, middle-button drag, touch pan and pinch | 1:1 with the input; no added easing or inertia (OS scroll momentum is the user's own) |
| Zoom buttons, `+` / `−`, `Shift+0` (100%), `Shift+1` (fit all), `Shift+2` (fit selection) | viewport animates over `--dur-slow`, `--ease-standard` |
| Find result (`⌘/Ctrl+F`), Problems bar "Go to step", `Alt+.` / `Alt+,` issues, Outline row, turn-row step link | camera moves over `--dur-slow`, **then** the step is selected and focused (focus lands at t = 0 of the arrival frame) |
| Minimap click or drag | click: `--dur-slow`; drag: 1:1 |
| Window or panel resize | the canvas re-lays out in one frame, keeping the centre; it re-fits in one frame only when the mode changes (for example entering Review mode) (F-RWD-014) |
| Reduced motion | every programmatic camera move is instant (`duration: 0`) |

### 10.8 Level of detail, phase ruler, frames, marks

| Element | Rule |
|---|---|
| Level of detail (≥ 0.75 full · 0.5–0.75 compact · < 0.5 block, D §6.5) | swaps in **one frame**; hysteresis ±0.03 (zooming out goes compact below 0.72; zooming in goes full above 0.78) so text never flickers at a threshold |
| Phase ruler filter (click "Logic 1") | the other phases' glyph tiles, sockets and edges fade to `--opacity-dim` and their fill changes to `--surface-2` over `--dur-base`; their text never fades (F §10); clicking again or Esc restores over `--dur-base`; reduced motion keeps the fade (opacity and colour only) |
| Phase columns toggle | bands appear and disappear in one frame; nothing moves |
| Zoom and the 12 px floor | during a pan, wheel or pinch the text scales with the viewport transform; at `onMoveEnd` the counter-scale is re-applied in one frame (quantised `--zoom`, FD1 §5.5); no per-frame restyle |
| Frame collapse / expand | one frame; the chevron rotates over `--dur-fast`; edges re-route in the same frame |
| Validation marks (error, warning, "Not connected") | update 300 ms after an edit; **never animate** (FD2 §12.5); the issues chip count changes in place |
| Edited / New words (compare with live) | static |
| Edges at rest | static, always; `animated` is never passed to React Flow (lint, §15.5) |

### 10.9 Wireframes

```
DESKTOP ≥1440 · dragging "Ask budget" into line with "Greet"
┌──┬─────────────────────────────────────────────────────────────────────┬──────────────┐
│▣ │ Flows / Site-visit qualifier ▾  Draft · 3 changes ▾  ● Unsaved changes│ Test Publish v8…│
│  │ ◉Trigger 2 → ◇Logic 1 → ▢Action 3 → ⚑Outcome 4    Live v7 answers …  │              │
│◎ ├─────────────────────────────────────────────────────────────────────┤ Inspector    │
│  │  ╭Trigger──────╮      ┌Action · Greet──────┐                        │ (unchanged   │
│⤳ │  │ Inbound call├─────►│                    │                        │  during the  │
│  │  ╰─────────────╯      └────────────────────┘                        │  drag)       │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ guide 1 px accent ─ ─ ─ ─   │              │
│  │                       ┌Logic · Ask budget──┐ ◄ follows pointer 1:1  │              │
│  │                       │ e2, cursor grabbing│  [Top aligned]         │              │
│  │                       └────────────────────┘                        │              │
│  │  [−] 85% [+] [Fit]                                        ┌minimap┐ │              │
├──┴─────────────────────────────────────────────────────────────────────┴──────────────┤
│ ⚠ 1 warning  Book site visit: template pending approval. Go to step    ─ Path ┄ Fallback│
└──────────────────────────────────────────────────────────────────────────────────────┘

LAPTOP 1024–1279 · select a step under the inspector's future position
 t = 0          click step (right side of canvas) → selection treatment (90 ms)
 t = 0–200      inspector slides in from the right over the canvas
 t = 200–400    camera pans the step left, clear of the inspector (+24 px)
┌──┬───────────────────────────────────────┐      ┌──┬─────────────────────┬─────────────┐
│  │                         ┌Step ■sel┐   │ ───► │  │   ┌Step ■sel┐  ◄pan  │◄ Inspector │
│  │                         └─────────┘   │      │  │   └─────────┘       │  320        │
└──┴───────────────────────────────────────┘      └──┴─────────────────────┴─────────────┘

TABLET 768–1023 · Review mode (read-only canvas + Outline)       PHONE <768 · Outline only
┌──────────────┬────────────────────────────┐                  ┌───────────────────────┐
│ Outline      │ read-only canvas            │                  │ Site-visit qualifier  │
│ ▸ Inbound    │ tap = select (90 ms repaint)│                  │ Live v7 · Draft 3 ▾   │
│   ▸ Ask …  ◄─┼─ tap row: camera 200 ms     │                  │ ▾ Inbound call        │
│     Yes → …  │ pinch/pan 1:1; no dragging  │                  │   ▾ Ask about a visit │ expand: 1 frame
│              │ step sheet slides 200 ms    │                  │     If Yes → Book …   │ chevron 90 ms
└──────────────┴────────────────────────────┘                  │ [Test]  [Publish v8…] │
                                                               └───────────────────────┘
```

On phones and in tablet Review mode there is no drag, connect, snap or Tidy; motion is limited to camera moves (tablet), sheets and disclosure chevrons.

---

### 10.10 Components used, with motion configuration

| Component (spec) | Motion configuration |
|---|---|
| `FlowCanvas` on React Flow (FD1) | `nodeDragThreshold={4}` · `snapToGrid={false}` (snap on release, §10.4) · `defaultEdgeOptions={{ animated: false }}` · `autoPanOnNodeDrag` and `autoPanOnConnect` on, speed capped at 12 px per frame · `onlyRenderVisibleElements` above 60 steps · `fitView` computed before first paint, never animated on load · every `fitView`, `setCenter`, `zoomIn`, `zoomOut` and `zoomTo` call passes `{ duration: reduced ? 0 : 200 }` (`--dur-slow` read from `tokens.json`) |
| Step nodes: Trigger, Logic (with AnswerRows), Action, Outcome (FD1) | `transition-property: background-color, border-color` over `--dur-fast`; `box-shadow` not transitioned; `data-selected`, `data-focus-visible`, `data-dragging` attributes drive the states |
| Socket | `transform: scale(1.4)` over `--dur-fast` while it is a valid target; `data-mark` for forced colours |
| Edge and EdgeLabel (FD1) | stroke colour `--dur-fast`; no `stroke-dasharray` animation ever; fallback edges keep their static 5/4 dash |
| `AlignmentGuides` (new overlay, §18) | 1 px `--accent-mark` lines and an info Tag, rendered in the viewport layer, no transition |
| `TraceLayer` (new overlay, §18) | the test trace (§11.4) |
| Selection bar (BulkBar variant, N §7.10) | rise `--shift-toast` over `--dur-slow` |
| Inspector (Sheet `inspector`, O §4) | docked: no motion; overlay at 1024–1279: slide `--dur-slow` then camera pan |
| Popovers: Connect to…, Add step picker, Go to [step ▾] (O §5) | `--dur-base`, 4 px from the anchor side |
| Toast (O §9) | Undo, Tidied, Publish toasts, placed above the Problems bar |
| SaveState, VersionChip (O §18) | §7 |
| `animateNodePositions(targets, { duration, onDone })` (new util, §18) | rAF interpolation with `--ease-standard` sampled in JS; used for snap settle (90), Esc return (140), overlap nudge (90) and Tidy (200) |

### 10.11 States

| State | Motion and copy |
|---|---|
| Loading | CanvasSkeleton (static); the real flow appears already fitted in one frame (§6.4) |
| First use (blank flow) | Static hint on the canvas: "Add a step after the trigger. Press A, or use Add step." (FD2 §17); nothing pulses to attract attention |
| Partial (an integration check failed) | Marks and rows update in place; no motion |
| Save error, offline, conflict | SaveState transitions (§7); dragging and connecting keep working offline and queue on this device (FD2 §4.7) |
| View only, viewing a version | No drag, connect, snap or Tidy; camera and selection only; drag attempts show "View only. Duplicate to edit." |
| Review mode (768–1023) and phone | No drag, connect, snap or Tidy; a one-finger drag on a step pans the canvas, so there is no refused drag and no tooltip; the Notice and the read-only sheet footer say "Edit this step on a screen at least 1024 px wide." (R §10.6, §10.9) |
| Permission (private flow not yours) | Forbidden page; no canvas |
| Success | "Saved 11:24 am"; after publishing, `Live v8` and the publish toast; no canvas effect |

### 10.12 Keyboard (motion behaviour of each key)

| Key | Motion |
|---|---|
| `Tab`, `→ ← ↑ ↓` | focus instant; camera only when leaving the safe area (`--dur-slow`) |
| `Alt+Arrow` (step focused) | step moves 16 px, instant; coalesced history and announcement |
| `A` | new step in one frame, connected and focused; camera if needed |
| `C` | Connect to… popover `--dur-base`; new edge in one frame |
| `Delete` | one-frame removal; Undo toast |
| `⌘/Ctrl+Z`, `⇧⌘Z` / `Ctrl+Y` | one-frame restore; camera if needed |
| `⌘/Ctrl+D` | copy in one frame, offset two squares |
| `Shift+0`, `Shift+1`, `Shift+2`, `+`, `−` | camera `--dur-slow` |
| `Esc` while dragging or connecting | returns the step over `--dur-base` / fades the ghost over `--dur-fast` |
| `Alt` while dragging | disables guides and snap |

### 10.13 Microcopy (before → after)

| Before | After |
|---|---|
| "Drag nodes, connect handles, double-click to edit, press ? for shortcuts" (permanent hint) | No permanent hint; blank flows only: "Add a step after the trigger. Press A, or use Add step." |
| (no alignment feedback) | Guide tags: "Top aligned", "Middle aligned", "Bottom aligned", "Left aligned", "Centre aligned", "Right aligned" |
| (silent invalid drop) | Reason tooltip: "Triggers start a call. Nothing connects into them." |
| (no delete feedback, F-FLOW-025) | "Deleted 'Polite close' and 2 connections · Undo" |
| (no layout command) | "Tidied 14 steps · Undo" |

### 10.14 Accessibility

- Every drag has a non-drag path: `Alt+Arrow`, `C`, `Go to [step ▾]`, the Outline (WCAG 2.5.7, FD2 §16).
- Pointer drags are not announced; their keyboard equivalents are (coalesced).
- Programmatic camera moves never move focus away from where the user asked it to be; focus lands on the destination step at the end of the move.
- The canvas animations respect both reduced-motion sources, including every React Flow `duration`.
- Forced colours: guides use `CanvasText`; grown ports keep `data-mark`; the ghost edge is `data-edge`.

### 10.15 Responsive behaviour

| Width | Canvas motion |
|---|---|
| ≥ 1280 | Everything in §10; the inspector is docked (no slide) |
| 1024–1279 | Inspector overlay (slide + pan clear); test panel overlays the canvas bottom when the inspector is open (FD2 §13.6) |
| 1024+ with `pointer: coarse` | Sockets 44 px; the Navigate / Arrange switch (R §10.9) decides whether a one-finger drag pans or moves; guides and settle as on desktop |
| 768–1023 | Review mode (read-only, R §10.6): no drag or connect; tap selects (repaint); the read-only step sheet slides; Outline row tap moves the camera over `--dur-slow` |
| < 768 | The read-only Outline (R §10.6): rows expand in one frame; a row opens the full-screen read-only step sheet (its answers read "Goes to #4 Book site visit"; there is no Go to select to open); the Canvas view follows pinch and pan 1:1 with no animated camera; nothing drags or connects |

### 10.16 Telemetry hooks (optional, no flow content)

| Event | Properties |
|---|---|
| `step_drag_end` | `snapped_to_guide` (bool), `grid_nudge_px` (0–8), `cancelled` (bool), `multi` (count bucket) |
| `connect` | `via` (drag, c_key, go_to, outline), `result` (ok, cancelled, invalid_target) (shared with FD2 §22) |
| `tidy` | `steps_moved` (bucket), `undone_within_10s` (bool) |
| `camera_move` | `cause` (go_to_step, find, follow_along, pan_into_view, fit) |

### 10.17 Acceptance criteria (canvas)

- [ ] No edge has a running animation at any time outside a test run (`document.getAnimations()` filtered to `.react-flow__edge` is empty; no element has the `animated` class).
- [ ] A pointer movement under 4 px on a step selects it and sends no save.
- [ ] During a drag, the step's position equals the pointer delta on every frame (no lag), and no `transition` applies to `.react-flow__node`.
- [ ] Bringing a step's top edge within 6 px of another's shows a guide and the "Top aligned" tag; holding Alt shows neither.
- [ ] On release, the step's final position is a multiple of 16 on both axes and the settle takes ≤ 90 ms; edges stay attached on every frame of the settle.
- [ ] Esc during a drag returns the step to its origin with no history entry and no save request.
- [ ] While connecting, only valid input ports scale; releasing on a valid port creates exactly one edge and announces it.
- [ ] Palette insert (click, Enter, `A`) never places a step overlapping another; the new step is selected, focused and fully visible.
- [ ] Delete produces the Undo toast; Undo restores the step and its connections in one frame and selects it.
- [ ] Tidy is one undo step; edges remain attached during its 200 ms; the draft is marked dirty once, after the animation.
- [ ] Level of detail does not flicker when zoom oscillates between 0.73 and 0.77.
- [ ] With reduced motion, every camera move, settle, return and Tidy completes in one frame.
- [ ] At 1024 × 768, selecting a step under the inspector's area pans it clear after the inspector lands.

---

## 11. Test-run path highlighting

**Purpose and job.** While the author tests a draft (text, browser voice or "Call my phone…"), show which step the conversation is on, which answer matched, and the path taken, so they can see the flow behave without reading the graph. Motion here is the only place a canvas element moves on its own, and it moves once per step.

**Findings addressed.** F-FLOW-016 (no way to test or simulate), F-FLOW-011 ("animate only the path being traversed during a simulation"), F-A11Y-022 (reduced motion), F-A11Y-014 (step changes not announced), F-UX-004 / F-FLOW-004 (trust: the author sees exactly what ran).

**Information hierarchy during a run.**
1. The current step: a `Now` Tag and a 3 px inset `--accent-mark` bar (FD1 "In a test run").
2. The matched answer row on the step just left (`--accent-soft` fill), and the edge just taken, drawn once.
3. Reached steps (a 16 px `check` mark) and traversed edges (`--edge-active`, 2 px).
4. The Test panel's turn rows (N §12.4): what was said, with the step link.

### 11.1 The sequence for one step

```
runtime event: "entered step 4 (Book site visit) via answer Yes of step 3"
t = 0     · step 3: "Now" and the inset bar removed; "Reached ✓" mark added          (one frame)
          · step 3's answer row "Yes": --accent-soft fill; its socket --accent-mark   (one frame)
          · step 4: "Now" Tag and the inset bar                                       (one frame)
          · announce (polite): "Now at Book site visit"
          · Test panel: the system row "Moved to step 4 · Book site visit" appended   (one frame)
t = 0     if step 4 is outside the safe area and Follow along is on:
            camera pans over --dur-slow (200 ms) and the trace waits for it (M4)
t = 0|200 TRACE: the edge Yes → Book site visit is drawn from the socket to the input port
            in --edge-active over --dur-trace (480 ms), --ease-standard
t = 480+  the traced edge stays --edge-active at 2 px; the overlay is removed
```

**Truth first.** The `Now` Tag appears at t = 0, before the trace finishes: the trace is a direction cue, and the state never waits for it (M7).

### 11.2 Rules

| Rule | Detail |
|---|---|
| One trace at a time | If the runtime enters the next step before the current trace ends, the current trace jumps to complete and the new one starts (no queue, no overlap) |
| Fallback paths | A "No reply", "Else", "Not found" or "Didn't connect" edge traces too, and keeps its 5/4 dash: the trace reveals the edge's own dashed stroke through an animated mask, so the one dashed line keeps its meaning |
| Loops back to an earlier step | The back edge traces along its route under both steps; the earlier step becomes "Now" again; its reached mark stays |
| Follow along | On by default. The camera moves only when the current step leaves the safe area (§10.3). Panning or zooming by hand pauses it; a secondary Button "Follow along" fades in over `--dur-base` at the canvas top-centre; clicking it re-centres over `--dur-slow` and resumes |
| Stopped at an invalid step | The step gets `Now` plus a warning Tag "Stopped here"; no trace beyond it; the Test panel's summary row says why (FD2 §13.5). No shake |
| Run ends at an Outcome | The Outcome step is "Reached"; the summary row "Reached 'Visit booked' · 6 turns · 5 steps · 1 min 12 s"; no celebration |
| Restart or edit | All marks, matched rows and active edges clear in one frame |
| Unreached steps | Unchanged (no dimming), so the author can still read them (FD2 §13.4) |
| Browser voice and "Call my phone…" | The same canvas behaviour, driven by the runtime's step events; the Test panel header carries the CallStateTag with the bounded live pulse (§12) |

---

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

---

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

---

## 13. Reduced motion

**Purpose.** Every operator can work with no movement at all and lose nothing: every state is still visible as a word, icon or mark. Two sources turn it on: the OS `prefers-reduced-motion: reduce`, and the in-app **Motion: Reduce motion** preference (MD4, §9.4).

**Findings addressed.** F-A11Y-022 (reduced motion honoured only on the landing page; 4 loops on the Cockpit and 6 on Analytics keep running), F-FLOW-011 (edges keep animating under reduce), F-QA-032.

### 13.1 The complete mapping

| Motion | Default | Reduced |
|---|---|---|
| Hover, press, colour, border, selected fills | repaint `--dur-fast` | same (repaint is not movement) |
| Focus ring | instant | instant |
| Tab indicator | slides `--dur-base` | jumps |
| Switch thumb | `translateX` `--dur-fast` | instant |
| Disclosure chevron | rotates `--dur-fast` | instant |
| Reorder siblings | `translateY` `--dur-base` | instant |
| Tooltip | fade `--dur-base` | fade |
| Menu, popover, listbox, Call gate | fade + 4 px | fade only |
| Dialog, palette | fade + 8 px, scrim fade | fades only |
| Sheets, bottom sheets, rail overlay, NavSheet, MoreSheet | slide from the edge | **fade in place** (`--shift-sheet` is 0) |
| Toast | fade + 8 px | fade only |
| BulkBar, selection bar, UnsavedChangesBar | rise 8 px | fade only |
| Toast and sheet swipe | follows the finger; release animates | follows the finger; release completes instantly |
| Skeletons | static | static |
| Spinner | 800 ms turn | static arc + its word |
| Indeterminate bar | 30% segment passes | static segment + "Working…" |
| Determinate bar | `scaleX` `--dur-base` | jumps |
| RouteProgress | stepped | static 30% bar |
| Step drag | 1:1 with the pointer | 1:1 (the user's own motion) |
| Snap settle, Esc return, overlap nudge | 90–140 ms glide | instant |
| Tidy | 200 ms interpolation | instant |
| Camera: fit, zoom buttons, go to, follow along, pan-into-view | `--dur-slow` | instant |
| Phase ruler dimming | fade `--dur-base` | fade |
| Valid ports while connecting | scale `--dur-fast` | instant |
| Test trace | 480 ms draw | none; the edge is marked at once |
| LiveDot | 3 pulse cycles per entry into Live | solid dot + "Live" |
| LevelMeter | lit bars at ≤ 15 fps | frozen bars + "Mic · hearing you" / "Mic · silent" (≤ 1 Hz) |
| Talk strip (live) | ≤ 10 fps growth | once per second |
| Transcript follow, Jump to latest, anchor scrolling, scroll-into-view | smooth, ≤ 200 ms | instant |
| Recording playhead | follows playback | follows playback (state) |
| Timers, counters, balances | text changes | text changes |

### 13.2 CSS: both sources, one rule set

`tokens.css` gains an attribute block identical to its media block (generated by `build-tokens.mjs` from one source, §18):

```css
@media (prefers-reduced-motion: reduce) {
  :root { --shift-popover: 0px; --shift-dialog: 0px; --shift-toast: 0px; --shift-sheet: 0%;
          --dur-trace: 0ms; --dur-pulse: 0ms; --dur-spin: 0ms; --live-pulse-cycles: 0; }
}
:root[data-motion="reduce"] {
  --shift-popover: 0px; --shift-dialog: 0px; --shift-toast: 0px; --shift-sheet: 0%;
  --dur-trace: 0ms; --dur-pulse: 0ms; --dur-spin: 0ms; --live-pulse-cycles: 0;
}
```

`base.css` stops remaining keyframe loops for both sources and makes scrolling instant:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
}
:root[data-motion="reduce"] *, :root[data-motion="reduce"] *::before, :root[data-motion="reduce"] *::after {
  animation-duration: 1ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important;
}
```

Tailwind v4 gets one custom variant covering both, used instead of the built-in `motion-reduce:`:

```css
@custom-variant reduced {
  @media (prefers-reduced-motion: reduce) { @slot; }
  &:where([data-motion="reduce"] *) { @slot; }
}
```

Transform transitions that are not driven by a `--shift-*` token (switch thumb, chevron, tab indicator, reorder, port scale) add `reduced:transition-none`.

### 13.3 JavaScript: one hook

```ts
// lib/motion.ts
export function useReducedMotion(): boolean  // true if the media query matches OR <html data-motion="reduce">
export const motionMs = (token: 'fast' | 'base' | 'slow' | 'trace') => (reduced ? 0 : tokens.duration[token]);
```

Every JS-driven motion reads it: React Flow `duration` options, `animateNodePositions`, `scrollIntoView` / `scrollTo` behaviour, LevelMeter (switch to words), TalkStrip (1 Hz), TranscriptFeed follow scrolling, toast queue spacing. If Framer Motion stays anywhere (§15.4 recommends removing it), wrap the app in `<MotionConfig reducedMotion={pref === 'reduce' ? 'always' : 'user'}>`.

### 13.4 Acceptance criteria (reduced motion)

- [ ] With `page.emulateMedia({ reducedMotion: 'reduce' })`, and separately with `data-motion="reduce"` on an OS that allows motion, every route passes: no element's computed `transform` changes during any overlay open or close, and `getAnimations()` never contains an animation with more than one iteration.
- [ ] Under reduced motion every state in §13.1 remains identifiable from a single screenshot (visual snapshots of Cockpit live, Flow Designer mid-test, Knowledge uploading, Leads loading).
- [ ] Switching the Motion preference takes effect without a reload and persists across sessions and devices.
- [ ] The in-app preference cannot force motion on when the OS asks for reduced motion.

---

## 14. What must not animate

These are banned in the app and on marketing pages. Each ban names what replaces it.

### 14.1 Things

| Never animate | Replace with | Evidence |
|---|---|---|
| Idle decoration: rings, orbs, spheres, mandalas, breathing text, blinking labels, scanlines, flicker, marquees, tickers | Nothing; the Ready-to-call card; static empty states | F-VIS-029, F-A11Y-022, 02 §2.1 |
| Edges at rest (marching ants, dash offsets, flowing gradients) | Static edges; the one-shot test trace | F-FLOW-011 |
| Skeleton shimmer or pulse | Static `--skeleton` bars | O §13.1, D anti-pattern 4 |
| Hover lifts, glows, scale-up cards, shadow growth | A fill change | 02 §2.4, F §8 |
| Page or route transitions (fades, slides, cross-dissolves) | One-frame render; RouteProgress when slow | F-UX-030 |
| Scroll reveals, parallax, sticky-scroll effects (app and marketing) | Content visible at first paint | F-QA-032, D §7 |
| Entrance of data: table rows, list items, cards, chart bars growing, lines drawing, KPI numbers counting up, balances rolling | One frame | N §7.15, N §11.12, P-05 |
| Transcript typing effects, per-word fades, typewriter carets | Partial turn in `--text-3` → final | N §12.4 |
| Success celebration: confetti, bouncing checks, check-draw, green flashes | StatusText or a toast | O §17 |
| Error theatre: shaking fields, red flashes, wobbling dialogs | The message where it applies | §8 |
| Ringing effects: pulsing call cards, shaking phone icons, blinking titles | The word "Ringing…", the stepper, the audio | P-01 §7.12 |
| The logo, the workspace tile, avatars, icons (except the spinner) | Static | F-A11Y-022 (framer-motion logo loop) |
| Validation marks, issue badges, counts, "New"/"Edited" words | Static, updated in place | FD2 §12.5 |
| Height and width (accordions, docked sheets, sidebar collapse, frames) | One-frame layout change | O §4.7, N §1.4 |
| Theme and density changes | One frame, transitions suspended | MD10 |
| Status in the Baseline and chips (except repaint to amber) | Text updates | D §6.1 |
| Level-of-detail swaps on the canvas | One frame, with hysteresis | §10.8 |
| Countdown bars on toasts, QR-code expiry rings (Billing UPI) | "Expires in 4:12" as text | P-05 §2.13 |
| Noise, grain, grid or hatch overlays, animated or not | Nothing | F-QA-038, F-VIS-022 |
| Marketing hero orbs, waves, rotating language pills | A real product surface; the demo player moves only while its real audio plays | P-08 §1 PA12, F-VIS-026 |

### 14.2 Properties and techniques

- **Never transition:** `all`, `width`, `height`, `min-*`/`max-*`, `top`/`right`/`bottom`/`left`, `margin`, `padding`, `inset`, `box-shadow`, `filter`, `backdrop-filter`, `clip-path`, `font-size`, `font-weight`, `letter-spacing`, `line-height`, `outline`, `background-position`, SVG path `d`.
- **Never** `animation-iteration-count: infinite` outside the allowlist (§15.2), JS `setInterval` animations, GSAP, Lottie, anime.js or canvas particle effects in the app bundle.
- **Never** a spring or overshoot easing, `ease-in` on entrances, or a duration outside the tokens.
- **Never** `z-index` literals for animated layers; named layers only (F §9).

### 14.3 The 36 keyframes today, and what becomes of them

| Today (02-current-design-language §2.1, DESIGN-SYSTEM-17) | Fate |
|---|---|
| breathe, gentlePulse, sphereBreath, sphereGlow, ring-pulse, orbit-spin, mandala-spin, mandala-spin-reverse, mandala-drift, soundPulse, compliance-fluctuate, flicker, scanline | **Delete** (idle decoration) |
| ticker, ticker-step, marquee, marquee-reverse, typewriter-caret, flap-in | **Delete** (tickers and typing) |
| shimmer | **Delete** (static skeletons) |
| countPop, scaleReveal, float-in-nav, fadeInUp, slideDown, slideUp, fade-in, fadeIn | **Replace** with `vl-fade-in`, `vl-pop-in`, `vl-rise-in`, `vl-sheet-in` (§15.2) |
| waveform-bar | **Delete**; `LevelMeter` is driven by real audio, not a keyframe |
| vlpRise, vlpFloat, vlpEq (marketing) | **Delete**; the H1 is visible at first paint |
| spin (Tailwind `animate-spin`) | **Replace** with `vl-spin` on the Spinner only |
| ping, pulse (Tailwind `animate-ping`, `animate-pulse`) | **Replace** with `vl-live-pulse` on the LiveDot only |
| bounce | **Delete** |
| React Flow `dashdraw` (edge `animated`) | **Delete**; `vl-trace` for test runs only |

### 14.4 Acceptance criteria (bans)

- [ ] The compiled CSS contains exactly the allowlisted keyframes (§15.2) and no others.
- [ ] No component uses `animate-spin`, `animate-ping`, `animate-pulse` or `animate-bounce` (lint).
- [ ] No element in the app has `animation-iteration-count: infinite` except the Spinner and the indeterminate ProgressBar, and those exist only while a request is pending.
- [ ] The marketing home's H1 is visible in the first paint with no opacity or transform animation.

---

## 15. Implementation in the detected stack

Stack (audit/raw/design-system.md §2): Next.js, Tailwind v4 `@theme`, `lucide-react`, React Flow (xyflow), Radix primitives adopted by O §1.9, and a framer-motion logo loop today. **Recommendation: remove framer-motion.** CSS keyframes on Radix `data-state` cover every overlay, and the few JS motions (canvas, meters) need `requestAnimationFrame`, not a library.

### 15.1 Where motion lives

| File | Contents |
|---|---|
| `tokens/tokens.css` | durations, easing, shifts, `--live-pulse-cycles`, both reduced blocks (§13.2) |
| `tokens/base.css` | global reduced-motion loop stop (both sources) |
| `components/ui/motion.css` (new) | the keyframe allowlist and the overlay classes below; nothing else defines `@keyframes` |
| `lib/motion.ts` (new) | `useReducedMotion`, `motionMs`, `withoutTransitions`, `animateNodePositions`, interaction constants from `tokens.json` |

### 15.2 The keyframe allowlist (replaces 36)

```css
/* components/ui/motion.css — the only @keyframes in the app */
@keyframes vl-fade-in  { from { opacity: 0 } }
@keyframes vl-fade-out { to   { opacity: 0 } }
@keyframes vl-pop-in   { from { opacity: 0; transform: translate(var(--vl-from-x, 0), var(--vl-from-y, 0)) } }
@keyframes vl-rise-in  { from { opacity: 0; transform: translateY(var(--vl-rise, var(--shift-toast))) } }
@keyframes vl-sheet-in { from { opacity: 0; transform: translate(calc(var(--vl-dir-x, 1) * var(--shift-sheet)),
                                                                  calc(var(--vl-dir-y, 0) * var(--shift-sheet))) } }
@keyframes vl-live-pulse { from { transform: scale(1); opacity: .55 } to { transform: scale(2.6); opacity: 0 } }
@keyframes vl-spin     { to { transform: rotate(1turn) } }
@keyframes vl-indeterminate { from { transform: translateX(-100%) } to { transform: translateX(333%) } }
@keyframes vl-trace    { to { stroke-dashoffset: 0 } }

/* Radix overlays: CSS animations (not transitions) so Presence waits for the exit */
.vl-float[data-state="open"]    { animation: vl-pop-in var(--dur-base) var(--ease-standard); }
.vl-float[data-side="bottom"]   { --vl-from-y: calc(-1 * var(--shift-popover)); }
.vl-float[data-side="top"]      { --vl-from-y: var(--shift-popover); }
.vl-float[data-side="right"]    { --vl-from-x: calc(-1 * var(--shift-popover)); }
.vl-float[data-side="left"]     { --vl-from-x: var(--shift-popover); }
.vl-tooltip[data-state="delayed-open"] { animation: vl-fade-in var(--dur-base) var(--ease-standard); }
/* Radix "instant-open" (an adjacent tooltip within skipDelayDuration) appears with no fade, §4.1 */
.vl-dialog[data-state="open"]   { --vl-rise: var(--shift-dialog); animation: vl-rise-in var(--dur-slow) var(--ease-standard); }
.vl-toast[data-state="open"]    { animation: vl-rise-in var(--dur-slow) var(--ease-standard); }
.vl-sheet[data-state="open"]    { animation: vl-sheet-in var(--dur-slow) var(--ease-standard); }
.vl-sheet[data-edge="left"]     { --vl-dir-x: -1; }
.vl-sheet[data-edge="bottom"]   { --vl-dir-x: 0; --vl-dir-y: 1; }
.vl-scrim[data-state="open"]    { animation: vl-fade-in var(--dur-slow) var(--ease-standard); }
:is(.vl-float, .vl-tooltip, .vl-dialog, .vl-toast, .vl-sheet, .vl-scrim)[data-state="closed"] {
  animation: vl-fade-out var(--dur-fast) var(--ease-standard);
}
.vl-live-dot::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--live); opacity: 0; }
.vl-live-dot[data-pulse]::after { animation: vl-live-pulse var(--dur-pulse) var(--ease-standard) var(--live-pulse-cycles); }
.vl-spinner  { animation: vl-spin var(--dur-spin) linear infinite; }     /* mounted only while pending */
```

Allowed loops carry `data-motion-allow="spinner|indeterminate|pulse|meter"` so tests can tell them apart (§15.6).

### 15.3 Tailwind vocabulary

`transition-colors duration-(--dur-fast) ease-standard` for repaint; `transition-[opacity] duration-(--dur-fast)` for the row-action reveal; `transition-transform duration-(--dur-base) reduced:transition-none` for the tab indicator, chevrons and switch thumb; the `reduced:` variant from §13.2. Never `transition` (Tailwind's default list includes `box-shadow` and `filter`) or `transition-all`.

### 15.4 React patterns

```tsx
// Busy button (MD5): lock at once, show after 200 ms, keep ≥ 400 ms
const showBusy = useDelayedFlag(isPending, { delay: tokens.timing.skeletonDelay, minVisible: tokens.timing.skeletonMin });
<Button aria-busy={isPending} aria-disabled={isPending} onPress={isPending ? undefined : run}>
  <LabelStack idle="Publish v8…" busy="Publishing…" showBusy={showBusy} spinner />
</Button>

// Theme, density and motion switches (MD10)
withoutTransitions(() => document.documentElement.dataset.theme = next);

// LiveDot (MD3): re-key on each entry into Live so the 3 cycles restart
<LiveDot key={call.liveEnteredAt} pulse={isFocal && !document.hidden} />

// Canvas: interpolate positions so edges follow (MD8)
animateNodePositions(setNodes, targets, { duration: motionMs('fast'), onDone: () => commitHistory('move') });
```

React Flow settings are listed in §10.10. The `TraceLayer` renders one `<path pathLength="1">` per active trace and removes it on `animationend` (§11.4).

### 15.5 Lint

| Tool | Rule |
|---|---|
| Stylelint | `keyframes-name-pattern` to the nine `vl-*` names; `declaration-property-value-disallowed-list` for `transition: /all/` and `transition-property: /all/`; a strict-value rule so `transition-duration`, `animation-duration` and `transition-timing-function` accept only `var(--dur-*)` / `var(--ease-standard)` (and `linear` inside `.vl-spinner` and the indeterminate bar) |
| Stylelint (custom) | `transition-property` may list only `opacity`, `transform`, `background-color`, `border-color`, `color`, `fill`, `stroke` |
| ESLint | `no-restricted-imports`: `framer-motion`, `gsap`, `lottie-web`, `animejs`; `no-restricted-syntax`: JSX attribute `animated` on React Flow edges and in `defaultEdgeOptions` |
| Tailwind class lint | ban `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`, `transition-all`, `transition` (bare), arbitrary `duration-[…]` and `ease-[…]` |

### 15.6 Tests

- **Idle (B8), every route:** load, wait 2 s with no call, audio or request, then `document.getAnimations().filter(a => a.playState === 'running' && !a.effect?.target?.closest('[data-motion-allow]'))` must be empty.
- **Reduced motion:** run the whole Playwright suite twice more, with `page.emulateMedia({ reducedMotion: 'reduce' })` and with `data-motion="reduce"`; assert §13.4.
- **Timing:** for each overlay type, read `getAnimations()[0].effect.getTiming().duration` after opening (140 or 200) and after closing (90).
- **Focus-at-open:** evaluate `document.activeElement` in the same task as the open action (§4.8).
- **Canvas:** the drag, connect, settle, Tidy and trace checks of §10.17 and §11.10, on the audit's 26- and 35-step flow shapes (Flow A and Flow B).
- **Performance (B7):** a CI trace at 4× CPU throttle while dragging a step in the 35-step flow: no long task over 50 ms, ≤ 2 dropped frames per transition.
- **Visual snapshots** use `animations: 'disabled'`; separate reduced-motion snapshots cover the Cockpit live card, a mid-run test and a loading table.

---

## 16. Telemetry summary (optional, consent-gated, no content)

| Event | Section | Why |
|---|---|---|
| `motion_pref_changed`, `session_motion_state` | §9.10 | Size the reduced-motion audience; decide test priority |
| `route_progress_shown`, `skeleton_long_wait` | §9.10 | Find slow routes and regions |
| `busy_shown` (`component`, `duration_bucket`) | §3.2 | Which actions keep users waiting over 200 ms |
| `step_drag_end`, `connect`, `tidy`, `camera_move` | §10.16 | Whether guides, snap, keyboard wiring and Tidy are used |
| `test_run_end` | §11.9 | Whether Follow along gets in the way |
| `call_state_stuck_shown`, `mic_silence_warning`, `jump_to_latest_used` | §12.12 | Real-time health seen by operators |

---

## 17. Acceptance criteria: the whole product

The per-area lists (§3.10, §4.8, §5.4, §6.5, §8.1, §9.11, §10.17, §11.10, §12.13, §13.4, §14.4) are the detailed checks. These are the release gates:

- [ ] **B8 idle:** every route is motionless two seconds after load with no call, audio or request.
- [ ] **Reduced:** both sources pass §13.4 on every route.
- [ ] **Allowlist:** the compiled CSS has exactly nine keyframes, all `vl-*`; no `transition: all`; no `animated` edges.
- [ ] **Durations:** no UI transition exceeds 200 ms except the 480 ms trace and the 3 × 1.6 s pulse.
- [ ] **Focus:** focus is inside every overlay in its first frame and returns to the trigger in the first frame of closing.
- [ ] **Truth:** busy, saving, saved, live and success states appear only when the underlying request or call state says so (§3.2, §7, §12).
- [ ] **Performance:** B7 passes on the 35-step flow.

---

## 18. New components, tokens and utilities needed

| Item | Kind | Detail | Owner spec to update |
|---|---|---|---|
| `--dur-spin` 800 ms, `--timing-skeleton-min` 400 ms, `--live-pulse-cycles` 3, `--shift-sheet` 100% | tokens | **done**: in `tokens.json` 1.1.0, registered in F §18; F §11 amended | – |
| `:root[data-motion="reduce"]` block | token output | **done**: generated by `build-tokens.mjs`; `base.css` stops loops for it | – |
| `interaction` group in `tokens.json` | JS constants | **done**: `dragThreshold 4`, `alignThreshold 6`, `magnetRadius 24`, `autopanZone 40`, `autopanMax 12`, `safeAreaInset 0.1`, `lodHysteresis 0.03`, `meterFps 15`, `talkStripFps 10`, `progressThrottle 140`, plus `zoomMin`, `zoomMax`, `lodFull`, `lodCompact` from FD1. `snapGrid` is not a second constant: JS reads `--grid-snap` (16) from `component.flow` | – |
| `components/ui/motion.css` | stylesheet (new) | §15.2 | C §1.7, O §1.5 |
| `lib/motion.ts` | utilities (new) | `useReducedMotion`, `motionMs`, `withoutTransitions`, `animateNodePositions` | – |
| Account menu **Motion** radio group | AppShell addition | §9.4 | P-00, N §1 |
| `LabelStack` | Button internal | §3.2 width reservation | C §2.1 |
| `LevelMeter` | component (consolidation) | §12.5; replaces MicMeter, VoicePicker meter and dictation meter descriptions | P-01 §7.9, N §12.3, P-02 §11.1 |
| `TraceLayer` | canvas overlay (new) | §11.4 | FD1, FD2 §13.4 |
| `AlignmentGuides` | canvas overlay (new unless FD1's build includes it) | §10.4 | FD1 §9 |
| AnswerRow `matched` state | state on an existing part | `--accent-soft` fill during a test | FD1 |
| `SheetGrabber` | optional affordance | §4.4 | O §4 |

---

## 19. Open questions for the product owner

1. **Bounded live pulse (MD3).** Accept three cycles per entry into Live? If not, the pulse runs for the whole call and the Motion preference is the WCAG 2.2.2 pause mechanism.
2. **Where the Motion preference is stored.** A server-side UI preference (follows the operator across PCs) needs an endpoint; until then it is per browser.
3. **Tidy animation.** 200 ms interpolation (this spec) or an instant re-layout plus the "Tidied 14 steps · Undo" toast?
4. **Swipe to dismiss** phone sheets in v1, or later?
5. ~~`Alt+Arrow` conflict~~ **Closed:** Alt+Arrow moves everywhere; issues are Alt+. / Alt+, (`06-accessibility` §9.6, the only canvas key map).
6. **Remove framer-motion** entirely (today it only drives the logo loop)?
7. **Request-bound loops** (spinner, indeterminate bar) as sanctioned loops beside the live dot and meters (O §21 Q3): this spec assumes yes.
8. **Incoming calls in a hidden tab:** when may the Rep console ask for notification permission (never on page load)?
9. **Meter thresholds** (−45 to −15 dBFS) need checking against real telephony and browser microphone levels.

---

## 20. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-FLOW-001 | critical | §8, §10.6 (Undo toast, one-frame delete) |
| F-A11Y-001 | critical | §10.3, §10.5, §10.14 |
| F-FLOW-003, F-QA-002, F-UX-024 | high | §7.1 |
| F-FLOW-011 | high | §10.8, §11, §14.3 |
| F-FLOW-016 | high | §11 |
| F-FLOW-006, F-A11Y-007 | high | §3.1, §10.2, §10.3 |
| F-FLOW-005, F-QA-003 | high | §10.6 |
| F-UX-006, F-QA-020 | high | §3.7, §8 |
| F-UX-030, F-QA-007 | high | §6, §9.2 |
| F-A11Y-005 | high | §4.3 |
| F-UX-012, F-UX-014 | high | §3.5, §7.3 |
| F-FLOW-008, F-FLOW-022, F-RWD-014 | high / medium | §10.2, §10.7, §10.8 |
| F-A11Y-022 | medium | §2.3, §12, §13, §14 |
| F-VIS-029, F-UX-026 | medium | §12, §14.1 |
| F-FLOW-021, F-FLOW-009, F-FLOW-026 | medium | §10.4, §10.6 |
| F-FLOW-025 | medium | §10.6 |
| F-FLOW-002, F-FLOW-037 | high / medium | §6.4, §7.1 |
| F-A11Y-014 | medium | §2.4, §11.8, §12.11 |
| F-A11Y-013 | medium | §6.3, §9.2 |
| F-A11Y-015, F-QA-036, F-UX-028 | medium | §9.1, §9.7 |
| F-A11Y-016, F-A11Y-006 | medium | §3.1, §3.3–3.5 |
| F-A11Y-019 | medium | §12.11 |
| F-A11Y-023, F-FLOW-020 | medium | §10.5 |
| F-UX-018 | medium | §9, §12.10 |
| F-VIS-014, F-VIS-015, F-UX-007 | medium | §4.1, §9.1 |
| F-VIS-022, F-QA-038 | medium | §14.1 |
| F-VIS-023 | medium | §6 |
| F-VIS-033 | medium | §9.3 |
| F-QA-032 | medium | §14.1 |
| F-QA-037 | medium | §12.1 |
| F-RWD-002 | high | §12.7 |
| F-FLOW-031 | medium | §10.6 |
