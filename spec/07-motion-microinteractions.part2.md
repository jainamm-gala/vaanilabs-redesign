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
