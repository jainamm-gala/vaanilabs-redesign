---

## 1. App shell navigation

### 1.1 Purpose
One frame that reaches all 12 destinations at every width, says where you are, and carries only computed facts. **Use** the shell on every signed-in route, including Settings sub-pages, `/api-keys`, `/webhooks`, the 404 and loading states (F-VIS-023, F-UX-029). **Don't** add page-specific controls, promotions or status strips to it; blocking problems appear inline where they block (direction §6.1).

| Width | Shell | Replaces today |
|---|---|---|
| Desktop ≥1440 and Laptop-L 1280–1439 | **Sidebar** 232 px, labelled and grouped | the 72 px icon rail with clipped labels (F-UX-007, F-VIS-015) |
| Laptop-S 1024–1279 | **Rail** 56 px with portal tooltips; `[` or the expand button opens the sidebar as an overlay with a scrim | — |
| Tablet 768–1023 | **TopBar** 52 px + **NavSheet** (left, modal) | the sidebar pushing content to 528 px (F-VIS-033) |
| Phone 320–767 | **TopBar** 52 px + **BottomBar** 56 px (5 items) + **MoreSheet** | 6 of 12 sections reachable, Exit as a tab (F-RWD-001, F-UX-008) |

### 1.2 Sidebar anatomy and tokens

```
┌ Sidebar (232, bg, right hairline) ─┐
│ WorkspaceSwitcher  [S] Sample Realty ⇕     pinned top
│ JumpButton         ⌕ Search or jump to…    pinned top
│ ── scroll region (vertical only) ──
│ NavGroup label     Operate
│ NavItem            ⌁ Cockpit        ● 2 live
│ …
│ ── pinned bottom ──
│ SetupCard          Finish setup · 3 of 5 ▬▬▬▭ Next: add money
│ AccountMenu        (AR) Anika R.  ⇕
└────────────────────────────────────┘
```

| Part | Tokens |
|---|---|
| Sidebar | width `--size-sidebar`; height `100dvh`; background `bg`; right border `--bw-hairline` `border`; padding `space-8`; `z-chrome`; `data-density="standard"` so Compact never shrinks it (Touch still applies on coarse pointers) |
| Scroll region | `overflow-y: auto; overflow-x: hidden` (never a sideways scrollbar, F-UX-007); thin scrollbar; on load the current item is scrolled into view with `block: 'nearest'` |
| WorkspaceSwitcher | button, min-height `space-48`, padding `space-8`, radius-6; `WorkspaceTile` 28 (`--size-avatar`, radius-6, `ink-tile` / `ink-tile-fg`, `label-13` initial); name `title-14` (ellipsis, `translate="no"`); role line `meta-12` `text-3` ("Workspace · Admin"); `chevrons-up-down` 14 `text-3`; hover `--nav-hover-bg` |
| JumpButton | height `--control-h`; margin-block `space-4`; padding-inline `space-8`; 1 px `border-strong`; radius-6; background `surface`; `search` 16 + "Search or jump to…" in `data-13` `text-3`. The ⌘K keycap appears only in its tooltip |
| NavGroup | padding-top `space-12`; label `label-12` `text-3`, padding `space-4` `space-8`; sentence case; not collapsible in v1 |
| NavItem | grid `var(--icon-md) minmax(0,1fr) auto`, column-gap `space-8`; height `--control-h` (32, 44 on touch); padding-inline `space-8`; radius-6; 1 px transparent border; `label-13`; colour `text-2`; icon 16 in `currentColor`; list gap `space-2`; label ellipsis |
| Badge slot | `meta-12`, tabular; see §1.5 |
| SetupCard | margin-block `space-8`; padding `space-12`; 1 px `border`; radius-8; `surface`; `title-14` "Finish setup" + `meta-12` `text-3` "3 of 5"; progress: height `space-4`, track `surface-3`, fill `accent-mark`, radius-2; next step `meta-12` `text-2`; the whole card is one link to `/home`; hover border `border-strong` |
| AccountMenu trigger | min-height `space-48`; padding `space-8`; top border `border`; `Avatar` 28 + name `label-13` + `chevrons-up-down` 14 |

**Account menu** (Radix DropdownMenu, `e2`, `border-overlay`, radius-6, `--size-menu-min`…`--size-menu-max`): name, role and workspace (`meta-12`), Profile, Theme (radio items: System · Light · Dark; never writes a flow, DESIGN-SYSTEM-08), Motion (radio items: Match system · Reduce motion; sets `data-motion="reduce"` on `<html>`, 06-accessibility §14.3), Keyboard shortcuts (switch "Single-key shortcuts", default on, F-A11Y-004), Help and docs, Back to website (`external-link`), separator, **Sign out…** (opens a confirm dialog, F-UX-029). Sign out never sits next to a routine item without the separator.

**Short viewports** (`@media (min-width: 1024px) and (max-height: 800px) and (pointer: fine)`): NavItem height `--control-h-sm` (28), group padding-top `space-4`, group label padding `space-2` `space-8`, WorkspaceSwitcher min-height `space-40`, SetupCard folds into one 32 px row (`Finish setup · 3 of 5` + a 40 px progress bar). Budget: normal mode needs about 776 px for all 12 items, the setup card and the account row; short mode needs about 596 px, so every item is visible at 1366×768, 1280×720 and the 680 px target of F-RWD-005 without scrolling. **Never on coarse pointers.** A landscape tablet (1024×768, 1280×800) keeps touch density: NavItem stays `--control-h` (44), the SetupCard folds to its one-row form at 44 px, and the scroll region scrolls with the current item scrolled into view. Nothing shrinks below 44 to fit (06-accessibility §15.1).

### 1.3 NavItem states

| State | Treatment |
|---|---|
| Default | `text-2` label and icon, no fill |
| Hover | background `--nav-hover-bg` (light `surface-3`, dark `surface-2`), label `text`; `transition: background-color, color` `--dur-fast` |
| Pressed | same as hover for the length of the press (navigation is immediate) |
| Focus-visible | focus ring with `--focus-offset-inset` so the scroll region never clips it (F-A11Y-012) |
| Current | "raised key": background `--nav-active-bg`, 1 px `--nav-active-border`, `e1`, label `text`, icon `accent-text`, `aria-current="page"`; matched by route prefix (`/settings`, `/api-keys`, `/webhooks` all mark Settings) (F-UX-017) |
| Current + hover | keeps the current treatment; hover never outranks it |
| Current + focus | both treatments |
| Disabled | never. Destinations a role cannot use are omitted; destinations that need setup stay enabled and the page explains the block |
| Loading | the list renders from the config instantly; badges render nothing until their data resolves (never `0`) |

### 1.4 Rail (Laptop-S 1024–1279)

| Part | Tokens |
|---|---|
| Rail | width `--size-rail`; background `bg`; right hairline `border`; padding-block `space-8`; items centred with gap `space-2` |
| WorkspaceTile | 28, radius-6, `ink-tile`; a button that opens the workspace menu; margin-bottom `space-8` |
| Rail item | 40×40 (`space-40`); **44×44 (`--size-hit-touch`) on coarse pointers**, where the item list scrolls between the pinned WorkspaceTile and the bottom buttons when 12 items don't fit (it never shrinks them, 06-accessibility §15.1); radius-6, 1 px transparent border, icon 16 `text-2`; states as NavItem (hover `--nav-hover-bg`, current `--nav-active-bg` + border + `e1` + `accent-text` icon) |
| Group separator | 24×1 (`space-24` × `--bw-hairline`) in `border`, margin-block `space-6`; replaces group labels |
| Badge mark | 8 px (`--size-live-dot`) dot at top-right inset `space-6`: `--live` for live calls, `--warning` for a warning; a `--bw-strong` ring in `bg` separates it from the icon; `data-mark` for forced colours. Numbers and words go into the tooltip and the accessible name |
| Tooltip | Radix Tooltip in a portal, side right, offset `space-8`, delay `--timing-tooltip-delay` on hover and none on keyboard focus; inverse plane (`data-surface="inverse"`), `meta-12`; content is the label plus the badge text ("Cockpit · 2 live"); never clipped, never widens the rail (F-VIS-015) |
| Bottom | expand button (`panel-left`, `aria-expanded`, `aria-keyshortcuts="["`) and the account avatar button, pinned |

**Expanded overlay:** the full Sidebar at `--size-sidebar`, `position: fixed`, `z-overlay`, `e3` + `border-overlay`, over a flat `--scrim` painted beneath it in the same layer. Content never reflows (F-VIS-033). Opens from the button or `[` (shortcut setting on, focus not in a field); closes on Esc, scrim click, `[`, and route change; focus moves to the current item on open and returns to the expand button on close. At ≥1280 the same `[` collapses the docked sidebar to the rail as a remembered preference (`localStorage["vaani:sidebar"]`, wrapped in try/catch).

### 1.5 Nav badges (computed facts only)

| Kind | Where | Look | Accessible name |
|---|---|---|---|
| `live` | Cockpit | static `LiveDot` (never pulses here; only the focal CallHeader pulses) + "2 live" in `success-text` | "Cockpit, 2 live calls" |
| `count` | Flows ("1 draft" with unpublished changes), Leads ("18 due" callbacks due today) | `text-3`, tabular, no fill; above 99 shows "99+" | "Flows, 1 draft with unpublished changes" |
| `warning` | Billing (wallet low or blocked), Settings (calling number not verified) | `alert-triangle` 12 + one word ("Low", "Blocked", "Verify") in `warning-text` | "Billing, wallet low" |

No red notification bubbles, no counts for passive things, no status footer: "SYS: ONLINE", latency and region are removed (F-UX-018). At most one badge per item.

### 1.6 TopBar (Tablet and Phone)

| Part | Tokens and rules |
|---|---|
| Bar | height `--size-topbar`; `surface`; bottom hairline `border`; padding `0 space-8 0 space-4`; sticky top, `z-chrome` |
| Menu button (tablet) | IconButton `menu` 20, 44 hit on touch, `aria-expanded`, `aria-controls` the NavSheet |
| Back link (phone record and sub-pages) | `chevron-left` + parent label, `label-13`; replaces the breadcrumb (§2) |
| Title | the page's `<h1>` below 1024 (not a copy): `title-16`, one line, ellipsis with the full text in `title` and the tooltip |
| Call chip | exists only during a call: `CallStateTag` compact (`--size-chip` 24, radius-6, `success-soft` / `success-text`, static `LiveDot`, `label-12` tabular timer), links to the call in Cockpit |
| Wallet chip | its own chip (never merged with call state): normal `surface` + 1 px `border-strong` + `wallet` 12 + short balance; low or blocked `warning-soft` + `warning-border` + `warning-text` + "₹42.10 · Top up", linking to `/billing?topup=1` (F-UX-002, F-UX-028) |
| Search | IconButton `search` 20 opening ⌘K |

**Chip priority:** when the title would drop below `calc(var(--space-40) * 3)` (120 px), chips hide in reverse priority: normal wallet first, then warning wallet (it still shows inline on every Call action, direction §6.1), never the call chip.

### 1.7 NavSheet (Tablet)
Radix Dialog from the left: width `min(var(--size-nav-sheet), 85vw)`, height `100dvh`, background `bg`, right border `border-overlay`, `e3`, flat `--scrim`, `z-modal`. Contents: WorkspaceSwitcher + Close, JumpButton, all four groups at touch density, SetupCard, AccountMenu. Focus moves to the current item; Esc, scrim and route change close it; focus returns to the menu button. Slides in with `transform` over `--dur-slow`, exits over `--dur-fast`; under reduced motion it fades only.

### 1.8 BottomBar and MoreSheet (Phone)

| Part | Tokens and rules |
|---|---|
| BottomBar | height `--size-bottombar` + `padding-bottom: env(safe-area-inset-bottom)`; `surface`; top hairline `border`; `position: fixed`, `z-chrome`; grid of 5 equal columns; page content gets matching bottom padding |
| Item | icon 20 (`--icon-lg`) over label `label-12` (gap `space-2`), min 44×44 hit; `text-2`. Order from `phoneSlot`: Cockpit, Leads, Call reports, Flows, More |
| Current | icon and label `accent-text` plus a `--bw-strong` `accent-mark` bar across the middle half of the top edge (a non-colour cue); `aria-current="page"` |
| More | a button with `aria-haspopup="dialog"` and `aria-expanded`; icon Lucide `ellipsis` ("•••"), never `menu` (the hamburger is only the tablet TopBar's NavSheet trigger; phones have no other navigation entry point); it carries the current mark when the current route is a More destination (F-RWD-001) |
| Label fit | labels never wrap or truncate. Measured: "Call reports" is 64.4 px at `label-12` in Hanken 500; a slot at 320 px is 64 px, so the overhang is under 1 px and invisible. Keep a 320 px visual-regression test |
| MoreSheet | bottom sheet (Radix Dialog): max-height 88dvh, radius-12 top corners, `surface-overlay`, top border `border-overlay`, `e3`, `--scrim`, `z-modal`; header "More" `title-16` + Close (44) |
| MoreSheet body | the destinations not in the bar, grouped in the same order: Operate (Assistant, Rep console, Meetings, Personal agents), Build (Knowledge), Data (Analytics), Account (Billing, Settings); rows 44 px, icon 20 + `label-13`, two columns; current row uses the selection treatment (`accent-soft`, `accent-soft-text`) with `aria-current`; then SetupCard; separator; account row (avatar, name · role → Profile), Theme, Motion (Match system · Reduce motion), Help and docs, and **Sign out…** last (confirm dialog) |

### 1.9 Keyboard and ARIA (whole shell)

- First element in the DOM: **Skip to main content**, visible on focus at `z-skiplink`, targeting `<main id="main" tabindex="-1">` (F-A11Y-012).
- Sidebar, rail, NavSheet and the bottom bar are each `<nav aria-label="Main">`; only one is rendered at a time (CSS `display: none` on the others), so there is never a duplicate landmark. Group lists are `<ul aria-labelledby>` pointing at the visible group label. The account menu trigger is outside the nav list.
- Every destination is one `<a href>` and one tab stop, with no focusable wrapper inside it. Arrow keys are not intercepted.
- Route change: `document.title` updates from the config; focus moves to the page `<h1>` (`tabindex="-1"`) so screen readers announce the new page (F-A11Y-013).
- `[` (rail overlay, sidebar collapse) respects the single-key shortcut switch and is ignored while focus is in an input, textarea, select or contenteditable, and when the target is a button or link.

### 1.10 Responsive summary

| | Desktop ≥1440 | Laptop-L 1280–1439 | Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Navigation | Sidebar 232 | Sidebar 232 | Rail 56, overlay sidebar | NavSheet from TopBar menu | BottomBar 5 + MoreSheet |
| Page H1 | PageHeader | PageHeader | PageHeader | TopBar title | TopBar title |
| Setup card | sidebar | sidebar | overlay only | NavSheet | MoreSheet |
| Call and wallet | Baseline | Baseline | Baseline | TopBar chips | TopBar chips |
| Short height (≤800) | short mode (fine pointer); touch: 44 px items, the list scrolls | same | rail fits (fine pointer); touch: 44 px items, the list scrolls | n/a | n/a |

### 1.11 Motion
Hover and colour changes `--dur-fast`. Rail overlay, NavSheet and MoreSheet enter with `transform` over `--dur-slow` and leave over `--dur-fast`, scrim `opacity` alongside. Live dots in the shell (nav badge, TopBar chip, Baseline) are static; only the focal CallHeader pulses, 3 cycles per entry into Live (§5.4). Nothing else moves; under reduced motion the sheets fade only.

### 1.12 Content
Labels come only from `lib/nav.ts` (§0.7): Cockpit · Assistant · Rep console · Meetings · Personal agents · Flows · Knowledge · Leads · Call reports · Analytics · Billing · Settings. Group labels: Operate · Build · Data · Account. Badge words: "2 live", "1 draft", "18 due", "Low", "Blocked", "Verify". Sign out is "Sign out…" everywhere (never "Exit").

### 1.13 Do / Don't

| Do | Don't |
|---|---|
| One name per destination, from one config, in nav, H1, `<title>` and ⌘K | "Agent View" in the rail and "AGENT COCKPIT" in the H1 (F-UX-017) |
| Portal tooltips on hover and focus in the rail | Labels inside an `overflow: auto` nav that clip and draw scrollbars (F-VIS-015) |
| A setup card with the next step until setup passes | "You're live" before the checks pass (F-UX-006) |
| Sign out in the account menu and the More sheet, confirmed | Sign out as a primary tab 0 px from Knowledge (F-RWD-001) |
| Theme as System / Light / Dark radio items | A toggle whose icon and label disagree (F-VIS-032) |

**Resolves:** F-UX-007, F-UX-008, F-UX-017, F-UX-018, F-UX-029, F-UX-002 (wallet chip target), F-UX-006 and F-UX-001 (setup card), F-RWD-001, F-RWD-005, F-VIS-015, F-VIS-032, F-VIS-033, F-A11Y-012, F-A11Y-013, F-A11Y-017, F-A11Y-023 (44 px phone targets).

### 1.14 React

```tsx
<AppShell nav={NAV} workspace={ws} user={me} setup={setup /* null when complete */}
          liveCall={liveCall /* null when idle */} wallet={wallet}>
  {children}
</AppShell>

type NavBadge = { kind: 'live' | 'count' | 'warning'; text: string; srText: string };
interface SidebarProps { entries: NavEntry[]; pathname: string; state: WorkspaceState;
  collapsed?: boolean; onCollapsedChange?(v: boolean): void; setup?: SetupProgress | null }
interface NavItemProps { entry: NavEntry; current: boolean; badge?: NavBadge | null; variant: 'sidebar' | 'rail' | 'sheet' | 'bar' }
```

- The shell lives in `app/(app)/layout.tsx` so it stays mounted across routes and during loading (F-UX-030); pages render skeletons inside it.
- Layout switching is CSS-only (media queries), so there is no hydration flash; only the rail overlay, sheets and the collapse preference hold client state.
- `NavItem` renders Next `<Link>` with `aria-current`; the current match uses `entry.match.some(p => pathname.startsWith(p))`.
- Rail tooltips: Radix `Tooltip.Provider delayDuration={300}` (mirrors `--timing-tooltip-delay`); NavSheet and MoreSheet: Radix `Dialog` with `modal`; account and workspace menus: Radix `DropdownMenu`.
- Forced colours: the current item and More's current mark rely on `aria-current` (base.css maps it to a `Highlight` outline); badge dots carry `data-mark`.
