---

## 13. Responsive states (every page)

The per-view state matrix (empty, filtered to nothing, loading, error, no permission) is D §6.6 and each page spec. These states exist only because of size, input or device, and apply everywhere:

| State | Trigger | Treatment and copy |
|---|---|---|
| **Needs a larger screen** (Flow Designer edits below 1024) | A tablet or phone user reaches a capability marked No in §10.6 | Neutral Notice, never a blocking screen. Review mode: "Editing steps needs a screen at least 1024 px wide. You can review, test and publish here."; the read-only step sheet's footer (tablet and phone): "Edit this step on a screen at least 1024 px wide. Your draft is safe." + `Copy link` |
| **Keyboard open** | `keyboardOpen` (§7.3) | BottomBar hidden; sticky action bar above the keyboard; the focused field and its error visible |
| **Rotated mid-task** | orientation change | No state lost (§8.1); a live call, a playing recording and an open sheet continue |
| **Resized across a breakpoint with a sheet open** | window resize, split screen, zoom | The sheet changes modality in place (docked → overlay → modal → full screen) and keeps focus and scroll (§2.4) |
| **Zoomed to 200% / 400%** | browser zoom | The width class for the CSS size applies (§8.3); nothing overlaps; nothing asks the user to zoom out |
| **Offline on a phone** | `navigator.onLine` false or failed requests | ConnectionBar under the TopBar "You're offline. Showing data from 11:42 am."; billable and publish actions disabled with "You're offline."; typed drafts kept |
| **Slow network** | request > 200 ms | Skeleton inside the region (no shimmer), RouteProgress after 200 ms; buttons show their own pending label |
| **Touch device with a hardware keyboard** | keyboard events seen on a coarse-pointer device | Keyboard model and the `?` sheet become available; keycap hints still hidden in the UI chrome |
| **Browser without `dvh` / `visualViewport` / Wake Lock** | feature detection | `vh` fallback; `resize` fallback for the keyboard (Android only); no wake lock (silent) |
| **Split screen / slide-over (iPad)** | width 320–700 | Phone or tablet class by width; no special casing |

## 14. Microcopy changes (before → after)

| Where | Before | After |
|---|---|---|
| Phone nav | Assistant · Agent · Leads · Reports · Billing · Knowledge · **Exit** | Cockpit · Leads · Call reports · Flows · More; "Sign out…" last in More, confirmed |
| Wallet on phones | "Wallet empty — top up now to keep calls flowing." + "Top / up" + "Enable / autopay" + 22 px × | Chip "₹0 · Top up"; on spending pages one line "Wallet ₹0 · Top up" |
| Call reports search (phone) | "Search transcripts, summaries…" (clipped to one letter) | "Search calls…" |
| Assistant composer (phone) | "Ask me to build a flow, summarize calls, add leads, place a call…" (clipped over 2–3 lines) | "Ask Vaani…" |
| File pickers on touch | "Drop or click to choose" | "Choose a file" |
| Leads on touch | Shortcut legend `/` J K X A C Esc | nothing (keyboard hints only on fine pointers) |
| Flow Designer toolbar at 768–877 | ACTIVATE (clipped) | "Publish v8…" |
| Flow Designer phone menu | "⌘Z Undo" on Android | "Undo" |
| Flow Designer tablet and phone limits | "Editing steps needs a screen 1024 px or wider" (specimen) | Review Notice "Editing steps needs a screen at least 1024 px wide. You can review, test and publish here."; read-only step sheet footer "Edit this step on a screen at least 1024 px wide. Your draft is safe." |
| Cockpit phone | CONNECT · "Test / Call" | "Talk in browser" · "Call Lead 1042…" (short: "Call lead…") |
| Cockpit phone, live | — | "The call continues if you leave this page. Open it again from Cockpit." |
| Browser test after backgrounding | — | "Microphone paused while Vaani Labs was in the background · 00:42" |
| Personal agents empty state | "Click New task" (inert text) | Button "New task…" |
| Meeting rooms (phone) | raw room URLs and "Meeting / Agent — / Vikash" | room titles; "Copy link"; H1 "Meetings" |
| Settings (phone and tablet) | 2,300 px strip ending in "Delete Account" | SettingsIndex list, "Delete account" last under Data (`06`) |
| Marketing header 768–1023 | Links wrap and push "Get started" off-screen | Lockup · Sign in · Get started · menu (`08` §4.1) |

## 15. Accessibility (WCAG 2.2 mapping)

| Criterion | How this spec meets it | Findings |
|---|---|---|
| 1.3.4 Orientation (AA) | No orientation lock anywhere (R11) | — |
| 1.4.4 Resize text (AA) | Root font follows the browser; labels fold, never clip (§2.6) | F-VIS-002 |
| 1.4.10 Reflow (AA) | 320 CSS px and 256 px tall with no two-axis scrolling except tables, the canvas and ScrollRows; 720×450 no longer overlaps | F-RWD-002, -006, -007, -008 |
| 1.4.12 Text spacing (AA) | Text boxes use `min-height` | — |
| 1.4.13 Content on hover or focus (AA) | Tooltips never the only source on touch; dismissible with Esc | F-VIS-014 |
| 2.1.1 Keyboard (A) | Every mode of the Flow Designer and every sheet is keyboard operable | F-A11Y-001, -002 |
| 2.4.3 Focus order (A) | DOM order equals visual order at every breakpoint; sheets return focus | F-A11Y-005 |
| 2.4.11 Focus not obscured (AA) | `scroll-margin` / `scroll-padding` for every sticky bar; the keyboard never covers the focused field | — |
| 2.5.1 Pointer gestures (A) | Pinch and multi-finger gestures have buttons | F-RWD-014 |
| 2.5.2 Pointer cancellation (A) | Actions fire on up-event (`click`), never on `touchstart`; dragging a step back to its origin cancels the move | — |
| 2.5.7 Dragging movements (AA) | Outline, Go to, Connect to…, Tidy, Move to frame | F-A11Y-001 |
| 2.5.8 Target size (AA) | 24×24 minimum everywhere; 44×44 on touch | F-A11Y-023 |
| 3.2.1 / 3.2.2 On focus / on input (A) | Focusing a field never changes layout beyond keyboard handling; mode switches keep focus | F-RWD-003 |
| 4.1.3 Status messages (AA) | Result counts, save state, call state and "Offline" announced politely; mode changes are not announced (they are layout, not state) | F-A11Y-014 |

Landmarks: exactly one `<nav aria-label="Main">` per breakpoint (N §1.9); the phone Flow Designer's Outline · Canvas switch is a `radiogroup` (SegmentedControl), not a second navigation. Forced colours: sticky bars keep a `CanvasText` top border; the Navigate / Arrange selection (≥ 1024, coarse pointers) uses `Highlight`.

## 16. Telemetry hooks (optional, consent-gated, no personal data)

| Event | Properties | Question it answers |
|---|---|---|
| `viewport_session` | `width_class`, `height_class`, `pointer`, `orientation`, `zoom_class` (from `devicePixelRatio` and `innerWidth`) | Which layouts real users see; whether tablets matter |
| `shell_mode_changed` | `from`, `to`, `cause` (resize, rotate, zoom) | Split-screen and zoom usage |
| `more_sheet_opened` / `more_destination` | `destination` | Whether the bottom-bar slots are right (R4) |
| `sheet_opened` | `kind`, `modality` | Whether phone full-screen sheets are used or bounced |
| `horizontal_scroll` | `component` (table, ScrollRow) | Whether wide tables at 768–1023 need more pinned columns |
| `keyboard_obscured` | `component` (the focused field's bottom was under the keyboard) | Catch §7.3 regressions in the field |
| `large_screen_notice_seen` | `surface`, `mode` (review, phone) | How often tablets and phones hit the Flow Designer limits (R5, R6); with `review_edit_attempt`, whether tablet editing earns a v1.1 layout |
| `wake_lock` | `granted` / `unsupported` | Device support for §11.5 |

Route templates only (never `document.title`, which can contain lead names); session replay stays off on Cockpit, Rep console, Leads and Call reports (F-UX-045).
