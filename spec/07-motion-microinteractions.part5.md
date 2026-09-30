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
