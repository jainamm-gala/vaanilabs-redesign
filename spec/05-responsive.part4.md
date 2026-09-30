---

## 6. Touch targets and gestures

### 6.1 Target sizes

| Target | Fine pointer | Coarse pointer | Notes |
|---|---|---|---|
| Every interactive element | ≥24×24 hit (`--size-hit-min`, WCAG 2.5.8) | ≥44×44 hit (`--size-hit-touch`) | Visual may be smaller; the hit area is an `::after` inset (C §1.4) |
| Buttons and fields | 28 / 32 / 40 by size | 44 (sm: 36 visible, 44 hit) | Touch density sets `--control-h` |
| Table and list rows | 40 (32 compact) | 48 min; ListRow two-line ≥ 62 | — |
| Checkboxes, radios, switches | 16 visual, 24 hit | 20 visual, 44 hit (the whole row is the label) | F-A11Y-023 (20×20 today) |
| Tabs, chips, filter tokens | 32 / 28 | 44 hit, 36 visual | F-A11Y-023 (25 px chips) |
| BottomBar items, MoreSheet rows | — | 64×56 and 44 rows | N §1.8 |
| Sidebar and rail items (≥ 1024) | 32 · rail 40 (28 in short mode, ≤800 tall) | 44; short mode never applies, the nav list scrolls | N §1.2, §1.4 |
| Canvas sockets | 10 visual, 24 hit, clipped to the 28 px row | 10 visual; answer and result rows grow to 44 and the hit is the 44 × 44 row end at 100 % zoom; tap opens "Connect to…". Zoomed out, Connect to…, Go to and the Outline are the equivalent paths (FD1 §6.1, 06 §15.1) | F-A11Y-001, F-RWD-014 |
| Canvas zoom controls | 32 | 44 (in the tool bar, not floating over steps) | F-RWD-014 (34×34 over nodes) |
| Dismiss / Close | 32 | 44 | F-RWD-013 (22×22 today) |
| Inline text links in sentences | line height ≥ 20, hit padding 4 | hit padding to 44 tall where the line allows; otherwise a separate button | Login links 16–17 px tall today |

**Spacing for consequence.** Destructive or billable controls keep ≥8 px (`--space-8`) from any other target, or live in `⋯` / a sheet footer behind a confirmation or a gate (F §14, F-A11Y-023): Delete room, Delete step, Delete lead, End call (separated by `--space-16` in sticky bars), and the Call button. The Meeting Agent's 32×32 Delete room flush beside Record, and the Leads call button flush against the row, are the anti-examples.

### 6.2 Hover-only affordances on touch

- Row actions revealed on hover (`Call…`, `⋯`) are always visible on coarse pointers and on the focused or selected row (§5.1).
- Tooltips never carry the only copy of information on touch (O §6.5): icon-only controls get visible labels where space allows (bottom bar, More, Flow tool bar); truncated values wrap to two lines on phones instead of truncating (F-VIS-013).
- `⌘`/`Ctrl` hints, keycap legends and "press ? for shortcuts" never render under `(hover: none), (pointer: coarse)` (F-UX-048: Leads' legend took 45–70 px on phones; F-RWD-014: ⌘Z shown on Android).

### 6.3 Gesture policy

| Gesture | Allowed where | Always also available as |
|---|---|---|
| Tap | everywhere | — |
| Vertical scroll, fling | page, sheet bodies, transcripts | — |
| Horizontal scroll | ScrollRow, wide tables at ≥768, the KPI strip | arrow buttons on fine pointers; content reachable by Tab |
| One-finger pan, two-finger pan, pinch zoom | the flow canvas, editable or read-only (and nowhere else in the app) | zoom − / + / Fit buttons; `+`, `−`, `Shift+1` on keyboards (06 §9.6; browser zoom keys are never taken) |
| Drag a step, draw a selection box | the editable flow canvas (≥ 1024) in **Arrange** mode (touch) or with a mouse | the Outline editor, "Move to frame…" and Tidy (WCAG 2.5.7) |
| Drag to connect | the editable flow canvas (mouse; touch in Arrange) | tap the socket → "Connect to…"; `Go to [step ▾]` in the inspector (WCAG 2.5.1, 2.5.7) |
| Drag a sheet down to close | bottom sheets on phones (optional enhancement) | the visible Close / Done button and Back |
| Swipe on rows | **not used** (no hidden swipe-to-delete or swipe-to-call) | — |
| Long-press | **not used** (it conflicts with text selection and is undiscoverable; there is no ContextMenu on touch, O §7.6) | `⋯` |
| Pull to refresh | **not used**; `overscroll-behavior-y: contain` on the page scroller of data pages | Refresh in `⋯`, and live data that updates itself |
| Browser pinch-zoom of the page | always allowed (`user-scalable` is never set; D anti-pattern 21) | — |

`touch-action`: `pan-y` on ListRows (so horizontal intent never selects), `manipulation` on buttons (removes the double-tap delay), `none` only on the canvas viewport element, where React Flow handles pan and pinch itself (`panOnDrag`, `zoomOnPinch` set explicitly, F-RWD-014).

---

## 7. Safe areas, the keyboard and viewport units

### 7.1 Safe areas

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`. No `maximum-scale`, no `user-scalable`.
- `viewport-fit=cover` means **every** edge-touching fixed element pads its inset:

| Element | Padding |
|---|---|
| TopBar (in the Flow Designer's Review mode the TopBar stays and the 48 px Flow header sits under it, so only the TopBar pads the top inset) | `padding-top: env(safe-area-inset-top)`; left and right `max(var(--space-8), env(safe-area-inset-left/right))` (landscape notch) |
| BottomBar | `padding-bottom: env(safe-area-inset-bottom)`; height `calc(var(--size-bottombar) + env(safe-area-inset-bottom))` (F-RWD-001: none today) |
| Sticky action bars, sheet footers, bottom sheets, the Call gate sheet, toasts, the docked BulkBar | `padding-bottom: calc(var(--space-12) + env(safe-area-inset-bottom))` when they touch the bottom edge; when they sit above the BottomBar they offset by `calc(var(--size-bottombar) + env(safe-area-inset-bottom))` and add no inset of their own |
| NavSheet (left) and full-screen sheets in landscape | `padding-left: env(safe-area-inset-left)` |
| The flow canvas | the canvas may run under the home indicator, but its controls, the Map toolbar and fitView padding respect the insets |

- A page never paints a fixed element with a transparent background over content (no "floating" bars with gaps); bars have `--surface` fills and hairlines.

### 7.2 Viewport units

- Full-height shells, sheets and the MoreSheet use `dvh` (`100dvh`, `max-height: 88dvh`), never `vh` (F §5, digest R5): the iOS address bar changes the height.
- `svh` for elements that must never be taller than the smallest viewport (the Call gate sheet's content area), `lvh` never.
- Fallback: `height: 100vh; height: 100dvh;` (the second wins where supported).

### 7.3 The on-screen keyboard

`interactive-widget=resizes-content` makes Chrome on Android shrink the layout viewport when the keyboard opens; iOS Safari does not, so `useViewport()` also listens to `visualViewport` resize and sets `keyboardOpen` when `visualViewport.height < innerHeight × 0.75`.

| Situation | Behaviour |
|---|---|
| Any text field focused on a phone | The BottomBar hides (`keyboardOpen`); the focused field is scrolled into view with its label and error line, 16 px above the keyboard (`scrollIntoView({ block: 'nearest' })` after the resize settles, 100 ms) |
| A form with a sticky action bar | The bar stays attached above the keyboard (iOS: `transform: translateY(-(innerHeight − visualViewport.height − visualViewport.offsetTop))`), so Save is reachable without closing the keyboard |
| Assistant composer, Test panel composer, Cockpit notes | Composer pinned above the keyboard; the thread keeps its bottom anchored (the newest turn stays in view) (F-RWD-015) |
| Cockpit PhoneInput | The kind line and the two call buttons ride above the keyboard, so the user sees "Real call to +91 …" while typing (§11) |
| Search in the palette and filter sheets | Results render above the keyboard; the list scrolls, the input stays |
| Bottom sheets with a field (New lead) | The sheet grows to the visual viewport; its footer stays above the keyboard |
| `enterkeyhint` | "search" in search fields, "next" between fields, "done" on the last field, "send" in composers |

Chat composers and notes textareas auto-grow from 1 to 5 rows and then scroll inside (C §3.6).

---

## 8. Orientation, short screens and zoom

### 8.1 Orientation

- No page locks orientation, and no page shows "rotate your device" (WCAG 1.3.4).
- **Rotating preserves the task:** the open sheet, the scroll anchor (the first visible row or turn), the selected step, typed text, the playing recording and a live call all survive. React Flow re-fits only if the user had not moved the viewport since the last fit; otherwise it keeps the centre point (§10.9).
- **Landscape phones** (e.g. 844×390, 932×430): the tablet shell (TopBar + NavSheet; no BottomBar, which would take 14% of the height) with phone page layouts (tiny class): header rows fold into the TopBar, summaries hide, sheets are full screen with a 48 px header. The Cockpit shows its card and transcript side by side (§11.4).
- **Landscape tablets** (1024×768 to 1366×1024) use the laptop layouts with Touch density on coarse pointers; the rail's tooltips open on focus, not on tap.

### 8.2 Short screens (by height)

| Height | Rule |
|---|---|
| ≤800 (≥1024 wide, fine pointer) | Sidebar and rail short mode (N §1.2; with a coarse pointer items stay 44 and the nav list scrolls): all 12 items visible on 1366×768 and 1280×720 laptops, whose inner viewports are about 1366×657 and 1280×609 (§2.1; F-RWD-005) |
| ≤720 | Baseline folds into the BaselineChip; ViewTabs fold into a View select; the Cockpit card scrolls with a sticky footer. This is the everyday state of 1366×768 and 1280×720 laptops, so the BaselineChip is tested there as the primary status surface (§17.5) |
| <600 (≥768 wide) | Tablet shell (TopBar + NavSheet) |
| <480 | Phone page layouts inside the tablet shell; the Flow Designer uses its phone mode |

### 8.3 Zoom

| User setting | Resolves to | Must hold |
|---|---|---|
| 200% on 1440×900 | 720×450: phone shell, phone layouts | 12 of 12 destinations; no overlaps; no sideways scroll (F-RWD-001, F-RWD-002) |
| 200% on 1920×1080 | 960×~485 (inner 1920×969): tablet shell (landscape-phone rule), tablet layouts | Flow Designer in Review mode; Publish visible |
| 200% on 1366×768 or 1280×720 | about 683×328 or 640×305: phone shell, tiny class | Flow Designer in phone mode (the Outline); 12 of 12 destinations |
| 125% on 1366×768 | about 1093×526: tablet shell (under 600 tall), laptop-width page layouts | Flow Designer in Compact mode (it resolves by its own rule, §2.4), so editing still works |
| 400% on 1280×1024 | 320×256: phone shell | Reflow (WCAG 1.4.10); the TopBar stays one line; sheets scroll |
| 125% / 150% browser text size | layouts by width as usual | nothing clips; labels fold into `⋯`, never wrap inside buttons |

---

## 9. Phones on Indian networks

Most phone use will be on 4G with variable latency, often on mid-range Android. The responsive layer does not change what data is fetched (tables stay server-paginated at 25 / 50), but it sets these rules:

- **The shell never waits for data** (shell `00` §3.7): navigation and headers render from the session; regions show skeletons after 200 ms (`--timing-skeleton-delay`), no shimmer loop.
- **Page size on phones defaults to 25** (the Pager still offers 50 and 100). ListRows are cheap, and the first screen needs 8–10.
- **Offline:** the ConnectionBar says so and shows the data time; navigation to uncached routes keeps the shell and shows a toast (O §10.3). Billable and publish actions are disabled with the reason "You're offline." (gate check "Connection").
- **Slow actions** show the button's own pending label ("Placing call…", "Publishing…") with `aria-busy`, never a full-screen spinner, and never retry billable requests automatically; every billable request carries an idempotency key (D §6.3).
- **Fonts:** only the regular Hanken subset is preloaded; Devanagari loads by `unicode-range` when a Hindi turn appears (F §2.2), so a Leads list with no Hindi never downloads it.
