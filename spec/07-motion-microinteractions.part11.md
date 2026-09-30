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
