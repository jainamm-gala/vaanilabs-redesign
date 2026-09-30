## 3. The shell frame

### 3.1 Anatomy and DOM order

One frame on every signed-in route, including Settings sub-pages, 404, 403 and loading states (data-nav §1.1). DOM order equals focus order:

| # | Region | Element and landmark | Notes |
|---|---|---|---|
| 1 | Skip link | `<a href="#main">Skip to main content</a>` | First element; visible on focus at `--z-skiplink` (F-A11Y-012) |
| 2 | Navigation | `<nav aria-label="Main">`: Sidebar **or** Rail **or** TopBar + NavSheet **or** TopBar + BottomBar + MoreSheet | Only one rendered per breakpoint (CSS `display:none` on the rest), so there is never a duplicate landmark (F-A11Y-017) |
| 3 | Main | `<main id="main" tabindex="-1">` containing ConnectionBar (only when offline), PageHeader, at most one page Notice, then the page | The H1 is inside PageHeader (`tabindex="-1"`) |
| 4 | Baseline | `<div role="region" aria-label="Workspace status">` | Desktop and laptop only; hidden in the Flow Designer; folds to a chip at ≤720 px tall (part 3 §5) |
| 5 | Toasts | Radix Toast viewport, `role="region" aria-label="Notifications"` | F8 focuses the newest toast (overlay §9.4) |
| 6 | Announcer | one visually hidden polite `role="status"` | Fed by `announce()` (data-nav §0.7) |
| 7 | Portals | palette, sheets, dialogs, menus, tooltips | Named z-layers only |

There is no `<header>` landmark per page and no `contentinfo` (data-nav §2.6; direction §1.3).

### 3.2 Shell modes

| Mode | Routes | What differs |
|---|---|---|
| **standard** | every destination and sub-page | as below |
| **focus** | `/flows/<flowId>` (the Flow Designer) | At ≥1024 the navigation is forced to the **Rail** without changing the user's sidebar preference; the **Baseline is hidden**; the 56 px PageHeader is replaced by the Flow header (48 px) that carries the wallet chip and the live facts (Flow Designer spec; F-FLOW-022, F-FLOW-034). Leaving the designer restores the preference. |
| **bare** | `/login`, `/signup`, `/signup/workspace`, `/signup/pending`, `/forgot-password`, the global error page | No navigation. A 400 px (`--size-container-narrow`) centred column with the V mark on top; the same tokens and type (F-VIS-025). |
| **public** | marketing routes and the signed-out 404 | The marketing shell (public-site spec). |

### 3.3 Mounted once by AppShell (`app/(app)/layout.tsx`)

`SkipLink` · the navigation for the breakpoint · `RouteProgress` · `ConnectionBar` · `Baseline` · `<Toaster/>` · `LiveRegion` (announcer) · `CommandPalette` · the `?` shortcut sheet (Dialog lg) · `TopUpSheet` (content owned by the Billing spec; opened by `?topup=1` on any route) · `SessionExpired` · the sign-out ConfirmDialog. The layout stays mounted across routes and during loading, so the shell never disappears (F-UX-030, F-QA-007).

### 3.4 Layout at each breakpoint

Widths are the foundations breakpoints. Each layout is designed, not shrunk (P6). Wireframes use the Leads page as the sample content.

**Desktop ≥1440 · labelled sidebar, docked sheets**

```
┌ Sidebar 232 ──────────┬ content (fluid) ───────────────────────────────────────────────────────┐
│ [S] Sample Realty   ⇕ │ Leads  1,284 leads · synced 11:24 am          Export   Import…   [New lead]│ header 56
│ ⌕ Search or jump to…  │ All 1,284   New 312   Callbacks due 18   Interested 96   + Save view     │ views 40
│                       │ ⌕ Search leads   Filter ▾   Columns   Standard | Compact                 │ toolbar 48
│ Operate               │ ┌ table ──────────────────────────────────┐┌ Lead sheet 440 (docked) ──┐│
│  Cockpit     ● 2 live │ │ ☐  Lead        Phone           Status   ││ Lead 1042             ✕  ││
│  Assistant            │ │ ☐  Lead 1042   +91 •••••• 4821  New      ││ Overview · Calls · Notes  ││
│  Rep console          │ │ …  (about 16 rows at Standard)          ││                           ││
│  Meetings             │ └─────────────────────────────────────────┘└───────────────────────────┘│
│  Personal agents      │ 1–50 of 1,284                                                    ‹   ›   │ pager 40
│ Build                 ├──────────────────────────────────────────────────────────────────────────┤
│  Flows       1 draft  │ Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │        │
│  Knowledge            │ Wallet ₹2,340.50 · about 16 h of calls │ 2 calls in progress  Shortcuts Search│ Baseline 28
│ Data  Leads▣ …        │ (one line; shown here on two for width)                                  │
│ Account  Billing ⚠Low │                                                                          │
│ ┌ Finish setup 3 of 5┐│                                                                          │
│ └ Next: add money ───┘│                                                                          │
│ (AR) Anika R.       ⇕ │                                                                          │
└───────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

**Laptop-L 1280–1439 · same sidebar, sheets overlay the right third.** The record sheet is non-modal over the table (`--z-overlay`); the table keeps its columns and scroll position.

**Laptop-S 1024–1279 · 56 px rail, Baseline stays**

```
┌Rail┬ content ─────────────────────────────────────────────────────────────────────┐
│[S] │ Call reports  121 calls · 3 need review                              Export ⋯ │
│ ⌕  │ All · Needs review · Positive · Negative · Mixed · Unscored                    │
│ ── │ table …                                                                       │
│ ⌁• │                                                                              │
│ ⌂  │           ┌─ tooltip (portal, never clipped) ─┐                              │
│ …  │  ▣ ──────►│ Billing · Wallet low                │                              │
│ ── │           └────────────────────────────────────┘                              │
│ ⇥  ├──────────────────────────────────────────────────────────────────────────────┤
│(AR)│ Live v7 │ Inbound · Ready │ ⚠ Wallet ₹42.10 · about 17 min · Top up │ Shortcuts Search│
└────┴──────────────────────────────────────────────────────────────────────────────┘
```

Rail: workspace tile, a search button (opens ⌘K), group separators instead of labels, 8 px badge dots (`--live` or `--warning`) with the words in the tooltip and accessible name, expand button (`panel-left`, `[`) and the avatar at the bottom. `[` or the expand button opens the full Sidebar as an **overlay with a flat scrim**; content never reflows (data-nav §1.4; F-VIS-033). The setup card lives only in the overlay at this width; the rail shows a 8 px `--accent-mark` dot on the expand button while setup is incomplete, named "Expand navigation, setup 3 of 5 done".

**Tablet 768–1023 · top bar and nav sheet**

```
┌ TopBar 52 ───────────────────────────────────────────────────────────────┐
│ ☰  Leads                          [● Live 02:14]  [₹42 · Top up]   ⌕    │
├──────────────────────────────────────────────────────────────────────────┤
│ 1,284 leads · synced 11:24 am                           ⋯   [New lead]   │ header row 48
│ View: All ▾        ⌕ Search leads           Filter ▾                      │
│ list …                                                                   │
└──────────────────────────────────────────────────────────────────────────┘
NavSheet (☰): 320 px (max 85vw) from the left, modal, flat scrim
┌──────────────────────────────┐
│ [S] Sample Realty        ✕   │
│ ⌕ Search or jump to…         │
│ Operate · Build · Data ·     │  all groups, 44 px rows (touch)
│ Account                      │
│ Finish setup · 3 of 5  ▬▬▬▭  │  (while incomplete)
│ Workspace status             │  BaselineList: flow, line, wallet, calls
│ (AR) Anika R.            ⇕   │
└──────────────────────────────┘
```

The NavSheet body (groups, setup card, Workspace status) scrolls as one region; the workspace switcher, search and account row stay pinned. The page H1 moves into the TopBar title (data-nav §1.6). The call chip exists only during a call; the wallet chip is always its own chip, neutral when healthy. When the title would drop below 120 px, chips hide in reverse priority (normal wallet first, then warning wallet, never the call chip). Sheets and dialogs are full height.

**Phone 320–767 · top bar, five tabs, More**

```
┌ TopBar 52 ────────────────────────────┐   More sheet (bottom, max 88dvh)
│ Leads            [₹2,340]         ⌕   │   ┌──────────────────────────────────┐
├───────────────────────────────────────┤   │ More                          ✕  │
│ 1,284 leads · 11:24 am   ⋯ [New lead] │   │ Operate                           │
│ ⌕ Search leads        Filter ▾         │   │  Assistant        Rep console     │
│ Lead 1042                 New          │   │  Meetings         Personal agents │
│ +91 •••••• 4821 · Not reached · 2 h  अ │   │ Build   Knowledge                 │
│ …  (at least 5 list items)             │   │ Data    Analytics                 │
├───────────────────────────────────────┤   │ Account Billing ⚠ Low   Settings  │
│ Cockpit  Leads  Call reports Flows More│   │ Finish setup · 3 of 5  (card)     │
└───────────────────────────────────────┘   │ Workspace status (BaselineList)   │
 56 px + safe area; labels 12 px; 44 px    │ (AR) Anika R. · Admin    Profile ›│
 targets; current = accent + top bar       │ Theme  System | Light | Dark      │
                                           │ Help and docs ›                   │
                                           │ ─────────────────────────────────  │
                                           │ Sign out…                         │
                                           └──────────────────────────────────┘
```

12 of 12 destinations are reachable (F-RWD-001, F-UX-008). "More" carries the current mark when the current route is a More destination, including `/home`. One entry point: the phone TopBar never has a menu button, and More uses the `ellipsis` icon, never `menu`. The BottomBar hides only under full-screen sheets and task flows (§4.3). Sign out is never a tab. Desktop-only keyboard hints are not rendered on phones (F-UX-048).

**Short and zoomed screens**

| Condition | Shell | Evidence |
|---|---|---|
Heights here are **inner viewport** heights, not screen heights: 1366×768 and 1280×720 laptops give about 1366×657 and 1280×609 in maximised Chrome or Edge, a 1920×1080 laptop at 125 % about 1536×730, and a 13″ MacBook about 1440×789 (`05-responsive` §2.1).

| Condition | Shell | Evidence |
|---|---|---|
| ≥1024 wide, ≤800 tall, **fine pointer** (every laptop above: 1440×789, 1536×730, 1366×657, 1280×609) | Sidebar and rail **short mode**: 28 px items, tighter group spacing, setup card as one 32 px row. All 12 items fit in 596 px without scrolling (data-nav §1.2). | F-UX-007, F-RWD-005 |
| ≥1024 wide, ≤800 tall, **coarse pointer** (landscape tablets: 1024×768, 1280×800) | **No short mode.** Touch density keeps sidebar and rail items at 44 px; the nav list scrolls vertically with the current item scrolled into view, so all 12 stay reachable without shrinking a target (06-accessibility §15.1). | F-A11Y-023, F-RWD-005 |
| ≥1024 wide and ≤720 tall (1366×768 and 1280×720 laptops, always) | Baseline folds into the **BaselineChip** in the PageHeader (`--size-baseline` becomes 0). On these laptops the chip is the primary workspace-status surface (part 3 §5.4); the band shows from 1536×730 up | foundations §5 |
| ≥768 wide and <600 tall (landscape phones, 1920×1080 at 200 % ≈ 960×485, 1366×768 at 125 % ≈ 1093×526) | **Tablet shell** (TopBar + NavSheet), whatever the width | F-RWD-005 (844×390 showed no complete nav item) |
| 1440×900 at 200% zoom (720×450 CSS px) | **Phone shell**: bottom bar + More | F-RWD-001 |

### 3.5 Chrome budget

Vertical chrome on a data page (Leads) in Standard density, on **inner viewports** (an earlier version subtracted chrome from the 768 px screen height of a 1366×768 laptop, whose viewport is about 657). Target: at least 10 rows on 1366×768 and 1280×720 laptops (direction §6.1). The full per-breakpoint table, phones included, is `05-responsive` §3.4.

| Inner viewport (screen) | Chrome | Rows visible (40 px) |
|---|---|---|
| 1440×900 (the mocks' reference) | header 56 + views 40 + toolbar 48 + head 32 + pager 40 + Baseline 28 = 244 | 16 |
| 1920×969 (1920×1080) | 244 | 18 |
| 1536×730 (1920×1080 at 125 %) | 244 | 12 |
| 1366×657 (1366×768) | ≤720 tall: Baseline → BaselineChip, views → View select: 56 + 48 + 32 + 40 = 176 | 12 |
| 1280×609 (1280×720) | 176 | 10 |
| 768×950 (iPad portrait, Safari) | TopBar 52 + header row 48 + toolbar 48 + pager 40 = 188 (rows 48 px) | 15 |
| 390×844 (phone, mock size, top of page) | TopBar 52 + header row 48 + toolbar 48 + bottom bar 56 + safe area 34 = 238 | 9 two-line items; 8 at 390×750, iPhone Safari while scrolled (`05` §3.4) |

No global banner is part of any budget: the wallet banner (42 px on every page, 58–77 px on phones) is retired (F-UX-028, F-RWD-013).

### 3.6 What the eye hits first

1. **The page's work** (table, canvas, conversation): the largest region, on `--surface`.
2. **The H1 and its one line of meta** (title-20 + data-13 text-3): where am I, how much is here.
3. **The one primary action** (Neel), top right of the header.
4. **The current nav item** (raised key, accent icon) and any **amber** fact (Baseline segment or nav badge), which only appears when something is actually blocked or low.
5. Everything else in the chrome is `--text-2`/`--text-3` on `--bg` and recedes.

### 3.7 Shell states

| State | Treatment | Copy |
|---|---|---|
| First paint (hard load) | The server layout renders the shell from the session (user, workspace, role, setup summary, wallet summary). No client auth gate, no full-screen "Loading…" (F-QA-007, F-UX-030). Page regions show skeletons after 200 ms. Nav badges render nothing until workspace state resolves. | SR only: "Loading leads…" |
| Client route change | `RouteProgress` after 200 ms; on completion `document.title` updates and focus moves to the H1. | none |
| Workspace state failed | Badges stay hidden; the Baseline shows one neutral segment. | "Couldn't load workspace status · Retry" |
| Offline | `ConnectionBar` at the top of `<main>`; navigation to uncached routes is cancelled with an info toast (overlay §10.3). | "You're offline. Showing data from 11:42 am." / toast "You're offline. Call reports will open when you reconnect." |
| Session expired (explicit 401 only) | `SessionExpired` dialog over the shell; never a silent redirect on a timeout (F-QA-007). | "Your session expired. Sign in again to keep working. Edits on this page stay on this device." |
| Signed out in another tab | `BroadcastChannel('vaani-auth')` sends every tab to `/login?reason=signed-out`. | Login shows "You're signed out." |
| Role cannot use a route | The route renders `Forbidden` inside the shell; the nav item is already hidden (part 6). | "Only organization admins can review proposals." |
| Workspace switch | Guarded if there are unsaved edits; then the landing route of the new workspace, with a toast. | "Switched to Demo Workspace." |

### 3.8 Interactions and keyboard (shell-wide)

| Key | Does | Notes |
|---|---|---|
| ⌘K / Ctrl+K | Search or jump (palette) | Works inside text fields; again closes |
| `?` | Keyboard shortcuts sheet | Single-key; obeys the shortcut switch; ignored in fields |
| `[` | ≥1280: collapse or restore the sidebar (remembered as `vaani:sidebar`). 1024–1279: open or close the rail overlay | Single-key; ignored in fields and on buttons or links. **Suppressed in focus mode** (the Flow Designer), where `[` / `]` step through changes in compare mode; the rail's expand button still opens the overlay |
| F6 | Cycle focus: navigation → main → open sheet or inspector → Baseline | Non-modal regions only |
| F8 | Focus the newest toast | overlay §9.4 |
| Esc | Close the top-most overlay; in the palette, clear the query first | never closes a page |

Every shortcut has a visible control (P5): the Jump button and the Baseline's "Search" for ⌘K, "Shortcuts" for `?`, the expand button for `[`. Keycaps appear only in tooltips, menus, palette rows and the `?` sheet.

### 3.9 Accessibility notes

- One tab stop per nav item, no nested focusable wrappers; today each item is two stops and a nameless `div` (F-A11Y-012). From a fresh load, content is two keystrokes away (Tab to the skip link, Enter); by plain Tab the sidebar costs one stop per control (workspace, search, 12 or 13 items, setup card, account), against 33 stops today.
- `aria-current="page"` on the current item in every nav, matched by route prefix, so `/settings/api-keys` marks Settings (F-A11Y-017, F-UX-017).
- Rail tooltips appear on hover **and keyboard focus**, in a portal; the accessible name includes the badge ("Billing, wallet low").
- Route change: title updates, focus moves to the H1. The polite region announces the page name only when focus cannot move (an open non-modal sheet keeps focus).
- Touch targets: 44×44 on the bottom bar, More rows, TopBar buttons and chips; 24×24 minimum elsewhere (F-A11Y-023).
- Reduced motion: the rail overlay, NavSheet and MoreSheet fade instead of sliding; the live dot is still and the word "live" carries the state.
- Forced colours: the current item and More's current mark use `aria-current` → `Highlight` outline; badge dots carry `data-mark`.

### 3.10 Acceptance criteria: shell

- [ ] At the inner viewports 1440×900, 1536×730, 1366×657, 1366×625, 1280×609 and 1024×768, every one of the 12 destinations (13 with Home) is visible without scrolling the nav, and the nav has no horizontal scrollbar (F-UX-007, F-RWD-005).
- [ ] At 1366×657 and 1280×609 the BaselineChip is in the PageHeader and shows the top fact (amber first); at 1536×730 and above the band is shown instead.
- [ ] At 390×844, 360×780 and 320×640, each destination is reachable in at most two taps (bottom bar or More), and Sign out is inside More, after a separator, behind a confirmation (F-RWD-001).
- [ ] At 844×390 and at 200% zoom of 1440×900, every destination is reachable without typing a URL.
- [ ] Tablet (768–1023): opening the nav never narrows the content; it is a modal sheet over it (F-VIS-033).
- [ ] Only one `<nav aria-label="Main">` exists in the accessibility tree at any width; axe `landmark-unique` passes.
- [ ] The first Tab from a fresh load focuses "Skip to main content"; Enter moves focus to `<main>`.
- [ ] On `/settings/*` and every legacy developer path (after redirect), Settings is the current item with `aria-current="page"`.
- [ ] A hard load shows the navigation and PageHeader within 1 s on a 4G profile and never a full-screen spinner; the H1 is visible within 2.5 s (F-QA-007).
- [ ] Throttled route change: RouteProgress appears after 200 ms and completes; the old page is never shown without feedback for more than 200 ms (F-UX-030).
- [ ] Offline, clicking an uncached nav item keeps the shell and shows the info toast; the browser error page never appears (F-QA-007).
- [ ] In the Flow Designer at 1440, the nav is the rail and the Baseline is absent; leaving it restores the sidebar.
- [ ] Every phone TopBar, BottomBar and MoreSheet is generated from `lib/nav.ts`: at 390 px the bar reads exactly Cockpit · Leads · Call reports · Flows · More, More shows `ellipsis`, no phone TopBar has a `menu` button, and on a More destination (Meetings, Analytics, Settings…) More carries the current mark.
- [ ] No text in the shell renders below 12 px at any breakpoint (bottom-bar labels included), measured with `getComputedStyle` (F-VIS-002).
