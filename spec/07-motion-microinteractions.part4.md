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
