<!-- Assembled from 02-components-data-nav.part1.md, 02-components-data-nav.part2.md, 02-components-data-nav.part3.md, 02-components-data-nav.part4.md, 02-components-data-nav.part5.md, 02-components-data-nav.part6.md, 02-components-data-nav.part7.md, 02-components-data-nav.part8.md, 02-components-data-nav.part9.md, 02-components-data-nav.part10.md, 02-components-data-nav.part11.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 02 · Components: data and navigation (Sutradhar)

**Status:** v1 for build · **Date:** 2026-09-27 · **Group:** data-nav · **Follows:** `spec/00-design-direction.md` (the direction) and `spec/01-foundations.md` + `spec/tokens/tokens.css` (every value). Nothing in this file introduces a raw colour or an ad-hoc size: every value is a token from `tokens.css`, a `calc()` of tokens, or a component alias that points at a semantic token (listed in §0.5).
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-A11Y-…, F-RWD-…, F-QA-…) refer to `audit/consolidated/`.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/02-components-data-nav.md`, assembled from `02-components-data-nav.part1.md` … `part11.md` (edit the parts, then re-assemble) |
| Gallery: every component in its states, light and dark side by side | `spec/components/data-nav.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `spec/components/data-nav-shell.png`, `data-nav-table.png`, `data-nav-voice.png`, `data-nav-charts.png` (1440, light and dark panes side by side), `data-nav-mobile.png` (390, phone shell) |

---

## 0. How to read this spec

### 0.1 Scope

| § | Component | React export(s) |
|---|---|---|
| 1 | App shell navigation: sidebar (expanded), rail (collapsed), tablet top bar and nav sheet, phone bottom bar and More sheet | `AppShell`, `Sidebar`, `NavGroup`, `NavItem`, `WorkspaceSwitcher`, `JumpButton`, `SetupCard`, `AccountMenu`, `Rail`, `TopBar`, `NavSheet`, `BottomBar`, `MoreSheet` |
| 2 | Page header and breadcrumbs | `PageHeader`, `Breadcrumbs` |
| 3 | Tabs | `ViewTabs`, `RouteTabs`, `PanelTabs`, `SegmentedControl` |
| 4 | Cards and KPI tiles | `Card`, `StatTile`, `StatGrid`, `Sparkline`, `Delta` |
| 5 | Tags and status | `Tag`, `StatusTag` (+ `lib/status.ts` domain maps), `LiveDot`, `CountBadge`, `LanguageMark` |
| 6 | Filter bar | `FilterBar`, `SearchField`, `FilterMenu`, `FilterToken`, `ColumnsMenu`, `DensitySwitch` |
| 7 | Data table | `DataTable`, `BulkBar`, `Pager`, `ListRow` (phone), `TableState` |
| 8 | Key-value panels | `KeyValueList`, `KeyValue` |
| 9 | Avatars | `Avatar`, `VoiceTile`, `WorkspaceTile`, `AvatarStack` |
| 10 | Timeline and activity feed | `Timeline`, `TimelineDay`, `TimelineItem` |
| 11 | Chart styling rules | `ChartFrame`, `BarChart`, `StackedBarChart`, `LineChart`, `BarList`, `Funnel`, `HeatStrip`, `ChartLegend`, `ChartTooltip` |
| 12 | Voice components | `CallStateTag`, `CallStepper`, `CallHeader`, `TranscriptFeed`, `TurnRow`, `RecordingPlayer`, `TalkStrip`, `LineQuality`, `VoicePicker`, `VoiceOption` |

**Owned by other groups and only referenced here:** Button, IconButton, Field and SearchInput internals, Checkbox, Select, Menu, Popover, Tooltip, Kbd, Sheet, Dialog, Toast, Notice, EmptyState, Gate (`02-components-gate.md`: Call gate, Publish gate, setup track, GateChecklist), Baseline. This file uses them with their names and states; when their spec changes, this file follows.

### 0.2 The per-component template

Every component below has the same headings: **Purpose** (when to use, when not) · **Anatomy** (named parts) · **Variants and sizes** (exact tokens) · **States** · **Behaviour and keyboard** · **ARIA** · **Responsive** (per breakpoint) · **Motion** · **Content** · **Do / Don't** · **Resolves** (finding ids) · **React** (primitive, prop sketch, notes).

### 0.3 Shorthand used in the tables

| Written | Means |
|---|---|
| `label-13`, `data-13`, `meta-12`, `title-20` … | the type role: `font: var(--type-label-13)` (size, line height, weight) plus its `-tracking` variable where non-zero |
| `space-12`, `radius-6`, `e2`, `z-sticky` | `var(--space-12)`, `var(--radius-6)`, `var(--e2)`, `var(--z-sticky)` |
| `text`, `text-2`, `text-3`, `surface-2`, `accent-mark` … | the semantic colour token of that name; light and dark values are in `tokens.css` and proven in `contrast-report.md` |
| Desktop · Laptop-L · Laptop-S · Tablet · Phone | ≥1440 · 1280–1439 · 1024–1279 · 768–1023 · 320–767 (media queries use these literals; `--bp-*` exists for JS) |
| Standard · Compact · Touch | the density modes of foundations §14: `--row-h` 40/32/48, `--control-h` 32/28/44, `--control-h-sm` 28/24/36, `--cell-px` 12/8/16, `--tag-h` 20/20/24 |
| focus ring | `outline: var(--focus-width) solid var(--focus); outline-offset: var(--focus-offset)` (2 px, offset 2 px) from `base.css`; rows and list items use `--focus-offset-inset` (−2 px) |
| selection | `accent-soft` fill + 1 px `accent-mark` border (cards, options) or a 2 px inset `accent-mark` bar (rows). Never an outline, so it never looks like focus; when both apply, both show (F-A11Y-007) |

### 0.4 Rules that apply to every component in this group

1. **Say only what is proven (P1).** Every count, badge, status and delta comes from the server or a computation. While unknown it is a skeleton or "–", never `0` (F-UX-030). If the data does not exist (no per-turn timing, no recording, no sentiment), the element is hidden or says so in words.
2. **Colour is state; shape is type (P2).** Green, amber and red only for real call or record state, always with a word and an icon. Neel is for the one primary action per region, focus, selection, links and the active nav icon.
3. **12 px floor.** No text below `meta-12`/`label-12`, including table headers, tags, bottom-bar labels, chart ticks and keycaps.
4. **One tab stop per item, focus never hidden.** No nested focusable wrappers (F-A11Y-012); sticky chrome sets `scroll-margin` so it never covers a focused element.
5. **State in the URL (P5).** Views, filters, search, sort, page, the open record and open sheet tabs live in query params (`replaceState` while typing, `pushState` for discrete changes) (F-UX-031, F-QA-016).
6. **Motion:** only `transform` and `opacity`, listed explicitly; `--dur-fast` for hover and every exit, `--dur-base` for menus, popovers, tooltips and the tab indicator, `--dur-slow` for sheets, the rail overlay and the bulk bar; one easing `--ease-standard`. Loops are bounded (foundations §11): the LiveDot pulses `--live-pulse-cycles` (3) times per entry into Live on the focal CallHeader only (every other live dot in this group is static), a spinner or indeterminate bar loops only while a user-started request is in flight, and meters move only on real audio.
7. **Copy:** sentence case, verbs with objects, "…" when another step follows, no em-dash separators, `lib/format.ts` for every number, date, duration and amount (F-VIS-024, F-UX-043).

### 0.5 Component aliases introduced by this group

Component aliases are allowed only as `var()` pointers to semantic tokens, declared per theme in the same blocks as the role aliases (`:root, [data-theme="light"]` and `[data-theme="dark"]`, plus the no-JS media fallback). They are in `tokens.json` v1.1.0 under `component.nav`: `build-tokens.mjs` emits them and `check-contrast.mjs` checks them (registered in 01-foundations §18).

| Alias | Light | Dark | Why a theme split is needed |
|---|---|---|---|
| `--nav-hover-bg` | `var(--surface-3)` | `var(--surface-2)` | In dark, `surface-3` is brighter than the active key, so a hovered item outranked the current page (seen in the gallery render) |
| `--nav-active-bg` | `var(--surface)` | `var(--surface-3)` | The active item must be the strongest item in both themes: a white key on the grey sidebar in light, the highest plane in dark |
| `--nav-active-border` | `var(--border)` | `var(--border-strong)` | Keeps the raised key's edge visible on the dark ladder |

**Tokens (registered in 01-foundations §18, emitted since tokens.json 1.1.0):** `--size-chart-sm` 160, `--size-chart-md` 200, `--size-chart-lg` 240, `--size-sparkline-h` 32, `--size-stat-min` 200, `--size-search` 280, `--size-turn-gutter` 56. Use the names; the interim `calc()` values are retired.

### 0.6 Foundations defect found while building the gallery (fixed in `base.css`, 2026-09-27)

`base.css` sets `html { font: var(--type-body-14); }`. The `font` shorthand sets the root font size to `0.875rem` = 14 px, and every `rem` in the system is then relative to 14 px, not 16 px. **Every type token renders at 87.5 %:** `meta-12` at 10.5 px, `data-13` at 11.4 px, `title-20` at 17.5 px. Measured in both `spec/tokens/foundations.html` (the foundations specimen) and this gallery: `getComputedStyle(html).fontSize` is `14px` and a `meta-12` element computes to `10.5px`. That silently breaks the 12 px floor, which is the whole point of F-VIS-002 and F-A11Y-008.

**Fix (one line, in `base.css`):** keep the root at the browser default and put the body style on `body`:

```css
html { font-size: 100%; /* never set `font` here: it re-bases rem */ }
body { font: var(--type-body-14); }
```

**Status: closed.** `base.css` now keeps `html { font-size: 100% }` and sets `font` and tracking on `body`; the per-mock overrides are removed and the foundations and overlay specimens were re-rendered at the true sizes. The assertion is CI check CT-03 (foundations §15.5, 06-accessibility §21.1): `getComputedStyle(document.documentElement).fontSize === '16px'` and an element with `font: var(--type-meta-12)` computes to `12px`.

### 0.7 Shared contracts used by several components

**One nav config** (drives sidebar, rail, top-bar title, bottom bar, More sheet, H1, `<title>` and ⌘K) (F-UX-017, F-VIS-005, F-A11Y-013):

```ts
// lib/nav.ts
export type NavId = 'home'|'cockpit'|'assistant'|'rep-console'|'meetings'|'personal-agents'|'flows'|'knowledge'|'leads'|'call-reports'|'analytics'|'billing'|'settings';
export interface NavEntry {
  id: NavId;
  label: string;            // the one name: nav, H1, <title>, bottom bar, ⌘K
  href: string;             // canonical route
  match: string[];          // route prefixes that make it current, e.g. settings: ['/settings','/api-keys','/webhooks']
  icon: LucideIcon;         // one icon per destination (foundations §12)
  group: 'operate'|'build'|'data'|'account';
  phoneSlot?: 1|2|3|4;      // Cockpit 1, Leads 2, Call reports 3, Flows 4; everything else lives in More
  badge?: (s: WorkspaceState) => NavBadge | null;  // computed facts only (§1.5)
  roles?: Role[];           // hidden, not disabled, for roles that cannot use it
}
export const GROUP_LABEL = { operate: 'Operate', build: 'Build', data: 'Data', account: 'Account' } as const;
```

`<title>` is `${entry.label} · Vaani Labs`, or `${recordName} · ${entry.label} · Vaani Labs` on record routes. Home (`/home`) is listed first in Operate only while setup is incomplete (direction §6.1).

**Announcer** (F-A11Y-014): one polite `role="status"` region in `AppShell`, fed by `announce(message, { debounceMs })`. Components in this group announce: result counts after filtering ("38 of 1,284 leads"), selection counts ("2 leads selected"), call-state changes, final transcript turns (throttled by `--timing-announce-throttle`), line-quality drops and recoveries, and save or load failures. Timers, wallet decrements and cost-so-far are never announced. Assertive announcements are reserved for failures that stop the current task.

**URL state:** `useUrlState(schema)` (Zod or similar) parses and writes query params; every table, filter bar, view tab, pager and sheet tab in this group reads and writes through it, so reload, Back and a pasted link restore exactly what was on screen (F-QA-016, F-UX-031).

**Formatting:** `lib/format.ts` owns `formatCount` (en-IN grouping, compact `1.2 L` above 99,999 in tabs and badges), `formatMoney` (`₹2,34,050.00`; dense cells `₹85 L`, `₹1.2 Cr`), `formatDuration` (`2m 31s`, `41s`, `–` for no talk time), `formatTimecode` (`mm:ss`), `formatWhen` (`Today 10:42 am`, `Yesterday`, `3 days ago`, then `21 Sep 2026`; absolute in a tooltip and in `<time datetime>`), `formatLatency` (`180 ms`, with a non-breaking space). A lint rule bans `toLocaleString` in components.

**Primitives.** The detected stack has no primitive library (`audit/raw/design-system.md` §2). This group needs: Radix UI `Tooltip`, `DropdownMenu`, `Popover`, `Dialog` (sheets), `Tabs`, `RadioGroup`, `Checkbox`, `Collapsible`, `Avatar`, `Slider`; TanStack Table v8 + TanStack Virtual for the data table; `d3-scale` + `d3-shape` for charts; Floating UI for chart tooltips. If the team installs them through shadcn/ui, keep shadcn's files in `components/ui/`, bridge its variables as foundations §15.4 describes (its `--accent` is a hover fill, ours is Neel), and replace its `ring` box-shadow focus with the outline from `base.css`.

### 0.8 Component index and build order

| Order | Component | Depends on | Blocks |
|---|---|---|---|
| 1 | `Tag`, `StatusTag`, `LiveDot`, `LanguageMark`, `CountBadge` | tokens only | every other component here |
| 2 | `NavItem` → `Sidebar`, `Rail`, `TopBar`, `BottomBar`, `NavSheet`, `MoreSheet` → `AppShell` | Tooltip, Dialog, Menu | every page |
| 3 | `PageHeader`, `Breadcrumbs` | Button, Menu | every page |
| 4 | `ViewTabs`, `RouteTabs`, `PanelTabs`, `SegmentedControl` | Radix Tabs, RadioGroup | Leads, Call reports, Billing, sheets |
| 5 | `FilterBar` and parts | SearchInput, Menu, Popover, Checkbox | Leads, Call reports, Knowledge |
| 6 | `DataTable`, `BulkBar`, `Pager`, `ListRow`, `TableState` | TanStack Table, Checkbox, EmptyState | Leads, Call reports, Knowledge, Billing › Invoices |
| 7 | `Card`, `StatTile`, `Sparkline`, `Delta`, `KeyValueList`, `Avatar`, `Timeline` | Tooltip | Home, Analytics, sheets |
| 8 | `CallStateTag`, `CallStepper`, `LineQuality`, `TurnRow`, `TranscriptFeed`, `RecordingPlayer`, `VoicePicker` | Slider, Menu, RadioGroup | Cockpit, Call reports sheet, Rep console, Meetings, flow Test panel |
| 9 | Chart set | d3-scale, Floating UI | Analytics, Billing › Usage, Home |

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

---

## 2. Page header and breadcrumbs

### 2.1 Purpose
The one place a page says what it is, what it contains right now, and what you can do. **Use** it on every signed-in page, including Settings sub-pages and record pages. **Don't** use it for status banners, KPIs, filters or tabs (those sit below it), and don't put a second title style anywhere (13 H1 treatments today, F-VIS-005). The Flow Designer uses its own 48 px header (flow group); the record sheets use `PageHeader variant="sheet"`.

### 2.2 Anatomy

```
[Breadcrumbs ›] H1 title   meta line (computed)                [tertiary] [secondary] [⋯] [Primary]
optional description (overview and form pages only, one sentence)
```

| Part | Tokens and rules |
|---|---|
| Bar | min-height `--size-header` (56); padding `space-8` `--page-margin`; `surface`; bottom hairline `border`; `display: flex; flex-wrap: wrap; gap: space-8 space-12`; sticky top at `z-sticky` inside the content column; aligns with the content container (data pages fluid, overview pages `--size-container-page`, forms `--size-container-form`) (F-VIS-034) |
| Breadcrumbs | `<nav aria-label="Breadcrumb"><ol>`; parent links `label-13` `text-2` (hover `text`, underline), separator `chevron-right` 14 `text-3` `aria-hidden`; the current page is the H1 itself, never repeated as a link |
| H1 | `title-20` with its tracking; one line, `white-space: nowrap; text-overflow: ellipsis` with the full title in a tooltip; `translate="no"` on record names; `tabindex="-1"` so route changes can move focus here |
| Meta | `data-13` `text-3`, tabular numbers, baseline-aligned with the H1; one line of computed facts: "1,284 leads · synced 11:24 am", "14 files · 1 indexing", "1 live call · 2 up next" |
| Description | optional `body-14` `text-2`, max `--size-measure`, full row below the title; only on overview, setup and form pages, never on data pages |
| Actions | `display: flex; gap: space-inline-md; margin-left: auto`; buttons at `--control-h`; at most three visible; order left to right: tertiary (ghost) → secondary → overflow `⋯` → primary (always last, at most one) |
| Overflow | IconButton `more-horizontal` with `aria-label="More actions"` (or "More actions for {record}") opening a Menu; destructive items sit last, after a separator, in `danger-text`, ending in "…" |
| State tag (record pages) | one `Tag` after the H1 for lifecycle ("Live v7", "Draft · 3 changes") |

### 2.3 Variants

| Variant | Use | Differences |
|---|---|---|
| `page` (default) | top-level destinations | no breadcrumb; meta line |
| `nested` | record pages, Settings sub-pages, Billing sub-routes | breadcrumb before the H1; optional state tag |
| `overview` | Home, Personal agents explainer, setup pages | description row; `title-20` H1 still (the 24/32 setup headings live in the body, foundations §2.3) |
| `sheet` | inside a 440 or 560 px record sheet | `title-16` as the sheet's `h2`, meta below it, Close IconButton at the far right; no breadcrumb |

### 2.4 States

| State | Treatment |
|---|---|
| Loading | the H1 renders immediately from `lib/nav.ts`; meta is a skeleton bar `calc(var(--space-40) * 3)` × `space-8` in `--skeleton`; actions render (they do not depend on data) or are `aria-disabled` with a reason until they can work; never "0 leads" (F-UX-030) |
| Stale | meta ends with "· updated 11:24 am" and a ghost `Refresh`; no auto-refresh spinner loop |
| Action disabled | `aria-disabled="true"` (stays focusable) plus the reason in a tooltip and, when it blocks the page's main task, a Notice under the header ("Wallet is ₹0. Top up to place calls.") (direction P3) |
| Action hover / pressed / focus | Button states (actions group); the header adds nothing |
| Overflow open | `aria-expanded="true"` on `⋯`; menu at `z-popover`, `e2`, fades and shifts `--shift-popover` over `--dur-base` |
| Error loading meta | meta reads "Couldn't load counts · Retry" (`text-3`, Retry as a link button); the page body shows its own error state |

### 2.5 Behaviour and keyboard
- Tab order: breadcrumb links → actions in visual order → overflow → primary. The DOM order matches the visual order (F-A11Y-030).
- On route change the shell sets `document.title` and moves focus to the H1 (programmatic focus shows no ring after a pointer navigation).
- A header action never has a single-key shortcut that dials, bills or deletes; creation shortcuts ("N" for New lead) show only in the action's tooltip and obey the shortcut switch.

### 2.6 ARIA
`<header>` is not used (it would create a banner landmark per page); the bar is a `div` at the top of `<main>`. H1 is the only `h1`. Breadcrumbs `nav` labelled "Breadcrumb". The overflow button has `aria-haspopup="menu"`, `aria-expanded`.

### 2.7 Responsive

| Width | Layout |
|---|---|
| ≥1024 | one row: [breadcrumbs] H1 · meta ····· actions |
| 768–1023 | the H1 moves into the TopBar title; this row keeps meta (left) and actions (right); secondary and tertiary actions fold into `⋯`; the primary stays labelled |
| 320–767 | row min-height `--size-toolbar` (48), padding `space-4` `--page-margin`; meta left, then `⋯` and the primary (`--control-h-sm`, label kept, `white-space: nowrap`); if they don't fit, meta wraps to its own line. Breadcrumb becomes the TopBar back link |
| All | `flex-wrap: wrap` and `min-width: 0`; the page scroller has `overflow-x: clip`, so no header can pan the page sideways (F-RWD-007, F-RWD-008) |

### 2.8 Content
- H1 = the nav label for destinations (sentence case, no literal capitals); the record's own name for record pages.
- Meta = counts, then freshness, separated by " · " (no em dashes): "121 calls · 3 need review · synced 11:24 am". The counts are pipeline-wide from the server, not the loaded page (F-QA-015).
- Actions are verbs with objects; "…" when a dialog or another step follows ("Import…", "Publish v8…").

### 2.9 Do / Don't

| Do | Don't |
|---|---|
| One `title-20` H1 and one line of meta | 15 px tracked caps H1 over 27 px section titles (F-VIS-010) |
| Primary last, at most one | Two equal primaries (F-UX-047), or green ACTIVATE beside blue Save |
| Destructive actions in `⋯`, after a separator | Delete next to everyday actions with equal weight (F-UX-035) |
| Actions fold into `⋯` below 1024 | A non-wrapping header that pushes the primary off-screen (F-RWD-007) |

**Resolves:** F-VIS-005, F-VIS-010, F-VIS-034, F-RWD-007, F-RWD-008, F-A11Y-013, F-A11Y-030, F-UX-030, F-UX-035, F-QA-015.

### 2.10 React

```tsx
<PageHeader
  navId="leads"                       // H1 + <title> from lib/nav.ts
  title={record?.name}                // overrides for record pages (translate="no")
  breadcrumbs={[{ label: 'Flows', href: '/flows' }]}
  meta={<>{formatCount(total)} leads · synced {formatWhen(syncedAt)}</>}
  metaLoading={!total}
  description={undefined}
  stateTag={<StatusTag domain="flow" value="live" version={7} />}
  actions={[
    { id: 'export', label: 'Export', icon: Download, tier: 'tertiary', onSelect },
    { id: 'import', label: 'Import…', icon: Upload, tier: 'secondary', onSelect },
    { id: 'delete', label: 'Delete lead…', tier: 'overflow', destructive: true, onSelect },
  ]}
  primary={{ label: 'New lead', icon: Plus, onSelect, disabledReason }}
/>
```

The component decides placement from `tier` and the breakpoint (CSS container query on the header), so pages never hand-place buttons. On tablet and phone it portals the H1 into the TopBar title slot through a `PageTitleContext`.

---

## 3. Tabs and segmented controls

### 3.1 Purpose and choice

| Component | Use when | Semantics | Don't use for |
|---|---|---|---|
| **ViewTabs** | switching saved filter views of one table (Leads: All · New · Callbacks due · Interested · Not reached; Call reports: All · Needs review · Positive · Negative · Mixed · Unscored) | `role="tablist"` controlling the table region, manual activation | ad-hoc filters (FilterBar) or navigation between routes |
| **RouteTabs** | sub-destinations with their own URL (Billing: Wallet · Usage · Plans · Invoices · Autopay) | `<nav>` of links with `aria-current="page"` | panels inside one page |
| **PanelTabs** | panels inside a sheet or card (call detail: Summary · Transcript · Captured) | `role="tablist"`, automatic activation | more than 5 panels (use a list) |
| **SegmentedControl** | one mode among 2–4 (density Standard/Compact, range 7 days/30 days/90 days, Call/Transcript on tablet Cockpit) | `role="radiogroup"` | navigation, or more than 4 options (use a Select) |

Pill chips as filters are retired: Call reports' sentiment chips become ViewTabs, Leads' status and source chip rows become ViewTabs plus FilterTokens (F-RWD-009, F-RWD-012).

### 3.2 Anatomy and tokens (ViewTabs, RouteTabs, PanelTabs share one look)

| Part | Tokens |
|---|---|
| Row | height `--size-view-tabs` (40); `surface`; bottom hairline `border`; padding-inline `calc(var(--page-margin) - var(--space-8))` so the first label aligns with the page margin; `overflow-x: auto; scrollbar-width: none` |
| Tab | padding-inline `space-8`; gap `space-6`; `label-13` `text-2`; `white-space: nowrap` |
| Count | `meta-12` `text-3`, tabular (`text-2` when selected); from the server's view-count aggregate; while loading a 16 px skeleton, never 0 |
| Indicator | `--bw-strong` bar at the bottom edge, inset `space-8` each side, `accent-mark` |
| Save view | ghost trigger after the tabs: `plus` 14 + "Save view", `text-3`; opens a Popover (name field, "Share with workspace" checkbox, Save) |
| Overflow edge | when the row scrolls, a mask fades the last 15 % of the row (alpha only; the colour in the mask is irrelevant, so it is written with a token) and the selected tab is scrolled into view |

### 3.3 States

| State | Treatment |
|---|---|
| Idle | `text-2` |
| Hover | label `text`; indicator preview in `border-strong` |
| Focus-visible | focus ring with `--focus-offset-inset` |
| Selected | label `text`, count `text-2`, `accent-mark` indicator; `aria-selected="true"` (tabs) or `aria-current="page"` (RouteTabs) |
| Disabled tab | not used; a view the role cannot see is omitted |
| Edited view | when the toolbar's filters differ from the saved view, the tab reads "Callbacks due · edited" (`meta-12` `text-3`) and the FilterBar shows "Save changes to view" and "Reset" |
| Loading counts | skeletons in the count slot; tabs remain usable |

### 3.4 Behaviour and keyboard
- **ViewTabs:** manual activation. ←/→ move focus, Home/End jump, Enter or Space selects (a selection fires a server query, so arrowing must not). Selection writes `?view=` with `pushState`; the table keeps its sort and density but resets to page 1. User views have a `⋯` inside the tab on hover and focus (Rename, Update with current filters, Copy link, Delete view…).
- **RouteTabs:** plain links; Tab moves between them; Enter follows.
- **PanelTabs:** automatic activation (content is local); ←/→ move and select; `?tab=` is kept in the sheet's URL so a deep link opens the right panel.
- **SegmentedControl:** radio behaviour: ←/→ (and ↑/↓) move and select, Tab leaves the group; the density switch also answers `Shift+D` when the shortcut switch is on.

### 3.5 ARIA
Tabs: `role="tablist"` with `aria-label` ("Views", "Call details"), each `role="tab"` with `aria-selected` and `aria-controls` pointing at the panel (`role="tabpanel"`, `aria-labelledby` the tab, `tabindex="0"` when it has no focusable child). Counts are part of the tab name ("Callbacks due, 18"). RouteTabs: `<nav aria-label="Billing sections">` with `aria-current="page"`. SegmentedControl: `role="radiogroup"` + `aria-label`; options `role="radio"` + `aria-checked`; an unavailable option has `aria-disabled="true"` and its reason in a tooltip on a wrapper plus `aria-describedby` (F-A11Y-016).

### 3.6 SegmentedControl tokens
Track: `surface-2`, 1 px `border`, radius-6, padding `space-2`, gap `space-2`. Option: height `calc(var(--control-h) - var(--space-6))` (26 in Standard, so the control is exactly `--control-h`), padding-inline `space-10`, radius-4 (concentric), `label-13` `text-2`. Selected: `surface`, 1 px `border-strong`, `e1`, `text`. Focus ring offset 0 inside the track. Unavailable: `text-dis`.

### 3.7 Responsive

| Width | ViewTabs | PanelTabs | SegmentedControl |
|---|---|---|---|
| ≥1024 | full row under the header | full width of the sheet | inline in the toolbar |
| 768–1023 | row scrolls with the edge fade | same | inline |
| 320–767 | row scrolls; tabs at touch height via the 40 px row plus 44 px hit areas; counts kept | same | full width when it is the only control in its row |
| Height ≤720 | ViewTabs fold into a "View: All ▾" Select at the start of the toolbar (direction §6.1 chrome budget) | unchanged | unchanged |

### 3.8 Motion
The indicator slides with `transform: translateX() scaleX()` over `--dur-base`, `--ease-standard`, only under `prefers-reduced-motion: no-preference`; otherwise it jumps. The selected segment's fill changes over `--dur-fast`.

### 3.9 Content
Tab labels are nouns or short states in sentence case, ideally one or two words; counts are separate numbers, never "(18)". Range options read "7 days", "30 days", "90 days" (not 7D). The page header meta and each chart name the range too (F-UX-036).

### 3.10 Do / Don't

| Do | Don't |
|---|---|
| Views with pipeline-wide counts in the URL | Chips whose counts describe the loaded page (F-QA-015) |
| A radio group for a single mode, with arrow keys | 25 px mono uppercase pills without `aria-pressed` (F-A11Y-016) |
| One range control in the page header that every section obeys | A range toggle inside one card that silently changes other sections (F-UX-036) |

**Resolves:** F-A11Y-016, F-UX-031, F-UX-036, F-UX-046 (Mixed and Unscored views), F-QA-015, F-QA-016, F-RWD-009, F-RWD-012, F-VIS-017 (chip styles retired).

### 3.11 React

```tsx
<ViewTabs value={view} onValueChange={setView /* writes ?view= */} controls="leads-table"
  views={[{ id: 'all', label: 'All', count: counts?.all }, { id: 'callbacks', label: 'Callbacks due', count: counts?.callbacks }]}
  userViews={saved} onSaveView={saveView} edited={isEdited} />
<RouteTabs label="Billing sections" items={[{ href: '/billing/wallet', label: 'Wallet' }, …]} />
<PanelTabs value={tab} onValueChange={setTab} items={[{ id: 'summary', label: 'Summary' }, …]}>{panels}</PanelTabs>
<SegmentedControl label="Density" value={density} onValueChange={setDensity}
  options={[{ value: 'standard', label: 'Standard' }, { value: 'compact', label: 'Compact' }]} />
```

Built on Radix `Tabs` (`activationMode="manual"` for ViewTabs, `"automatic"` for PanelTabs) and Radix `RadioGroup` for SegmentedControl (not `ToggleGroup`, which exposes `aria-pressed` buttons instead of radios).

---

## 4. Cards and KPI tiles

### 4.1 Card: purpose
One level of containment for a titled region on overview pages (Home, Analytics, Billing › Wallet), for choosable items (template gallery, voice options) and for KPI tiles. **Don't** use cards to lay out a page, to wrap a table on a data page (tables sit flush), to wrap a field, or inside another card (F-VIS-016, direction anti-pattern 7).

### 4.2 Card anatomy and tokens

| Part | Tokens |
|---|---|
| Container | `surface`; 1 px `border`; radius-8; padding `--space-panel-pad` (16); `e0` (no shadow); `min-width: 0` |
| Header | flex, baseline-aligned, gap `space-8`, margin-bottom `space-12`; title `title-14` as `h2`/`h3` (per page outline); meta `meta-12` `text-3` on the right ("Last 7 days"); optional action: ghost small Button or link |
| Body | `body-14` `text-2`, or the content component (chart, key-value list, list) |
| Footer (optional) | top hairline `border`, padding-top `space-12`, one link or ghost Button |
| Check (selectable) | `circle-check` 16 `accent-text`, top-right at `space-12` |

### 4.3 Variants and states

| Variant | Element | Hover | Pressed | Focus | Selected | Disabled |
|---|---|---|---|---|---|---|
| `plain` | `section` | none | none | none | n/a | n/a |
| `interactive` (the whole card is one link or button) | `a` / `button` (or a stretched-link pattern when the card holds text to select) | `surface-2` fill + `border-strong` over `--dur-fast` | `surface-3` | focus ring, offset 2 | n/a | `aria-disabled`, `surface-2`, title `text-dis`, reason in `text-3` (legible) |
| `selectable` (radio or checkbox card) | `role="radio"` / `"checkbox"` in a group | as interactive | as interactive | focus ring | `accent-soft` fill + 1 px `accent-mark` border + check icon; focus and selection both show | as interactive, reason via `aria-describedby` |

Loading: static skeleton blocks (`--skeleton`, radius-2) after `--timing-skeleton-delay`; no shimmer. Error: a Notice inside the body with Retry; the card keeps its title.

**Content:** titles are nouns ("Call volume", "Where callers drop off"); meta states scope; no decorative icons, § numerals or serif kickers (F-VIS-010). **Responsive:** cards reflow in the page grid (`--grid-columns` 12/8/4, gutter `--grid-gutter`); never fixed heights, so text wraps instead of clipping. **Motion:** fill changes `--dur-fast` only; no hover lift.

**Resolves:** F-VIS-016, F-VIS-010, F-VIS-023 (shared loading and error), F-VIS-034.

### 4.4 StatTile (KPI) purpose
A single number with its scope, its change and, when there is enough history, its shape. **Use** on Home, Analytics, Call reports, Leads (pipeline) and Billing › Usage. **Don't** use it for numbers without a defined scope, for numbers computed from a loaded page (F-QA-014, F-QA-015), or to decorate a page with vanity totals.

### 4.5 StatTile anatomy and tokens

```
Calls ⓘ                          label + definition tooltip
184                               value (num-28) [unit]
▲ +12% vs previous 7 days         Delta
╱╲__╱‾                            Sparkline (32 px)
Last 7 days · calls, not legs     scope
```

| Part | Tokens |
|---|---|
| Tile | a `Card` (plain or interactive when it links to the full chart); grid gap `space-4` |
| Label | `label-13` `text-2`; optional `info` 14 `text-3` IconButton opening a Tooltip with the metric definition (F-UX-011) |
| Value | `num-28` with tracking, tabular, `text`; unit or suffix in `body-14` `text-3`; money via `formatMoney` (KPIs 0 decimals, balances 2) |
| Delta | `label-12`, tabular; `arrow-up` / `arrow-down` / `minus` 12; sign always written ("+12%", "−4"); colour by desirability: `success-text` (good), `danger-text` (bad), `text-2` (neutral or flat); comparison words from the range ("vs previous 7 days") |
| Sparkline | height `space-32`, full width, margin-top `space-8`; one polyline in `chart-neutral` at `--icon-stroke`, `vector-effect: non-scaling-stroke`, round joins; no fill, no axes, no dots, `aria-hidden` |
| Not enough data | replaces the sparkline: "Not enough data yet" in `meta-12` `text-3` above a hairline, shown when fewer than 7 points exist |
| Scope | `meta-12` `text-3`: window + counting rule ("Last 7 days · calls, not legs · test calls excluded", "In this filter · 96 leads", "All time") |

**Compact** (`size="compact"`): value `num-20`; no sparkline; used on phones and in dense cards.

### 4.6 StatTile states

| State | Treatment |
|---|---|
| Ready | as above |
| Loading | label real; value skeleton `space-28` tall, half width; delta skeleton; scope reads "Updated when loaded"; `aria-busy="true"` |
| Error | value "–" in `text-3`; delta slot "Couldn't load" with `alert-triangle` in `danger-text`; ghost Retry; scope kept |
| Empty (no events in range) | value `0` is allowed only when the server says 0; the delta reads "No calls in the previous 7 days" instead of "+∞%" |
| Filtered | scope switches to "In this filter" or "In this view" (F-QA-014) |
| Interactive hover / focus | Card interactive states; `aria-label` includes the value and delta in words |

### 4.7 Delta desirability (`deltaTone`)

| Metric | Up is | Metric | Up is |
|---|---|---|---|
| Calls, connected calls, interested leads, conversion rate | good | Negative sentiment, failed calls, drop-off at a step | bad |
| Positive sentiment, answered rate | good | Wallet runway | good (a fall is bad) |
| Average duration, minutes used, spend | neutral (`text-2`) | Anything with abs(change) below 1 % or 1 unit | flat: "No change" with `minus` |

`deltaTone(metricId, delta)` lives in `lib/metrics.ts` next to the metric definitions, so Analytics, Call reports and Billing agree (F-VIS-011, F-UX-011).

### 4.8 StatGrid responsive

| Width | Layout |
|---|---|
| ≥1024 | `grid-template-columns: repeat(auto-fit, minmax(calc(var(--space-40) * 5), 1fr))`, gap `space-12`: 4 across at 1280+ |
| 768–1023 | 2 across |
| 320–767 | one horizontally scrolling row of compact tiles, each `min-width: calc(var(--space-40) * 4)`, `scroll-snap-type: x mandatory`, edge fade; sparklines hidden; the page scroller keeps the strip inside the page (F-RWD-004, F-RWD-011) |

**ARIA:** each tile is a `section` or `a` named by its label; the Sparkline is `aria-hidden` because the value, delta and scope carry the meaning; the definition tooltip is `aria-describedby` on the label. **Motion:** none (numbers do not count up). **Content:** labels are the metric's name from `lib/metrics.ts`; never "TOTAL CALLS" caps; never a number without a window.

**Do:** serve every KPI from one server aggregate endpoint with shared definitions. **Don't:** mix a server total with averages of 50 loaded rows (F-QA-014); colour a delta by its sign (F-VIS-011).

**Resolves:** F-QA-014, F-QA-015, F-VIS-011, F-UX-011, F-UX-030, F-UX-036, F-RWD-004, F-RWD-011.

```tsx
<StatTile label="Calls" definition="Conversations placed or received. Two browser legs count once."
  value={184} format="count" delta={{ value: 0.12, kind: 'percent', metric: 'calls', comparison: 'vs previous 7 days' }}
  series={daily} minPoints={7} scope="Last 7 days · calls, not legs · test calls excluded"
  state="ready" href="/analytics?range=7d#calls" size="default" />
```

---

## 5. Tags, status tags, live dot, count badge, language marks

### 5.1 Tag: purpose
A small, non-interactive label for a state or a qualifier. **Use** one per table cell at most, and at most two per list row (status plus one qualifier). **Don't** use tags as filters (FilterToken), as buttons (except the lifecycle chip below), as decoration, or stacked three per row (anti-pattern 6). 20 badge styles collapse into this one (F-VIS-017).

### 5.2 Tag anatomy, sizes and tones

| Part | Tokens |
|---|---|
| Container | `inline-flex`, height `--tag-h` (20; 24 on touch); padding-inline `space-6`; gap `space-inline-xs`; radius-4 (never pill); 1 px transparent border; `white-space: nowrap`; never truncates (`min-width: max-content`) |
| Icon | 12 (`--icon-xs`), `currentColor`, `aria-hidden` |
| Text | `label-12`, sentence case, tabular numbers |
| Size `lg` | height `--size-chip` (24), padding-inline `space-8`; for page headers and the interactive lifecycle chip |

| Tone | Background | Text | Use |
|---|---|---|---|
| `neutral` | `surface-3` | `text-2` | categories and non-problem states (New, Contacted, Neutral, Ended) |
| `info` | `info-soft` (= `surface-2`) + 1 px `info-border` (= `border-strong`) | `info-text` (= `text-2`); icon `info` or the progress icon | system facts and progress (Scheduled, Publishing…, Indexing… 60%, Streaming). Graphite, never Neel: an info tag must not look like a selection (foundations §3.4) |
| `success` | `success-soft` | `success-text` | live, done, positive |
| `warning` | `warning-soft` | `warning-text` | pending, due, low, a warning |
| `danger` | `danger-soft` | `danger-text` | failed, error, destructive, negative |
| `outline` | transparent, 1 px `border-strong` | `text-2` | qualifiers (Test call, 2 legs, Workspace default, Not published, Unscored) |

Every status text pair is ≥ 5.47:1 on its tint in both themes (foundations §3.4), replacing the 2.3–3.6:1 chips of F-A11Y-019.

### 5.3 StatusTag and the domain maps (`lib/status.ts`)
One module maps each domain value to word, icon and tone, and **every status on every page and every mock renders through `<StatusTag domain value />`**, so "Callback due" looks the same in Leads, the shell, the Cockpit, Call reports and the accessibility examples (F-VIS-017). Every StatusTag carries a word and an icon (P2, F-A11Y-019).

**Enforcement**
1. `StatusTag` takes `domain` and `value` only: it has no `tone`, `icon` or `label` prop. `Tag` (§5.2) is for qualifiers, never for a status word; a lint rule rejects a `Tag` whose text is a status word from `lib/status.ts`.
2. The map is exhaustive (`satisfies Record<Domain, Record<Value, StatusDef>>`), so a new state fails the build until it has its word, icon and tone.
3. A record state is never Neel. Neel is for the primary action, focus, selection and links (P2); the only Neel-tinted tone is `info`, and it is reserved for system progress (Scheduled, Working, Publishing…, Indexing…, Writing notes…), never for a lead status or a call outcome. The tones are the six of §5.2.
4. **One icon per meaning in a column.** Two values that can share a column never share an icon (Waiting for you `pause`, Paused `circle-pause`; Pending `clock`, Expired `timer-off`).
5. **Callback due is always amber with `clock`**, and a call outcome that writes a lead status borrows that status's icon and tone (below), so "Callback" is never blue, never a triangle and never icon-less.

| Domain | Value → word · icon · tone |
|---|---|
| Lead status | New · `circle-dot` · neutral; Contacted · `phone` · neutral; Callback due · `clock` · warning; Interested · `thumbs-up` · success; Not interested · `circle-slash` · neutral; Not reached · `phone-missed` · neutral; Converted · `circle-check` · success; Do not call · `ban` · danger |
| Call result | Completed · `check` · success; No answer · `phone-missed` · neutral; Busy · `phone-off` · neutral; Voicemail · `voicemail` · neutral; Failed · `circle-x` · danger; Timed out (a call stuck in queued or in progress past the reaper window) · `clock` · warning (F-QA-037) |
| Call outcome (written by the flow's Outcome step) | The outcome's own label with the **icon and tone of the lead status it writes** (direction §6.5): "Interested" · `thumbs-up` · success; "Callback" · `clock` · warning; "Not interested" · `circle-slash` · neutral; "Visit booked" · `circle-check` · success (writes Converted). An outcome that writes no status: its label · `check` · neutral |
| Sentiment | Positive · `smile` · success; Neutral · `meh` · neutral; Mixed · `contrast` · neutral; Negative · `frown` · danger; Unscored · `circle-dashed` · outline (F-UX-046) |
| Flow lifecycle | Live v7 · static LiveDot · success; Draft · 3 changes · `chevron-down` · neutral `lg` button (opens the version menu); Not published · outline; Publishing… · info; Couldn't save · `alert-triangle` · danger |
| Validation | No issues · `check` · success; 1 warning · `alert-triangle` · warning; 2 errors · `circle-x` · danger (computed, never permanent; F-UX-004) |
| Knowledge indexing | Indexed · `check` · success; Queued · `clock` · neutral; Uploading… · info; Reading… · info; Indexing… 60% · info; Couldn't upload · `circle-x` · danger; Couldn't index · `circle-x` · danger |
| Autopay | On · `check` · success; Off · outline; Waiting for approval · `clock` · info; Paused · `circle-pause` · warning; Needs mandate renewal · `alert-triangle` · warning |
| Payment · Invoice · Proposal (KB §3) | Payment: Completed · `check` · success; Pending · `clock` · info; Failed · `circle-x` · danger; Refunded · `undo-2` · neutral; Expired · `timer-off` · neutral. Invoice: Paid · `check` · success; Refunded · `undo-2` · neutral; Credit note · `file-minus` · outline. Proposal: Pending · `clock` · info; Added · `check` · success; Dismissed · `x` · neutral |
| Meeting room (MP §4) | Live · pulsing LiveDot · success; Open · `door-open` · neutral; Open 3 h (open too long) · `alert-triangle` · warning; Scheduled · `calendar-clock` · info; Ending… · info; Ended · neutral; Stale · `alert-triangle` · warning (F-UX-038) |
| Meeting notes (MP §4) | Summary ready · `check` · success; Writing notes… · info; Notes off · outline; Couldn't write notes · `circle-x` · danger |
| Assistant plan and step (AS §9.2) | **Waiting for you · `pause` · warning**; Running · Spinner · info; Done · `check` · success; Blocked · `lock` · warning; Failed · `circle-x` · danger; Skipped · `minus` · neutral; Expired · `timer-off` · neutral |
| Personal-agent task (MP §2.8) | Queued · `clock` · neutral; Working · `play` · info; **Waiting for you · `pause` · warning** (the same word, icon and tone as the Assistant); Scheduled · `calendar-clock` · info; Paused · `circle-pause` · neutral; Stopped at limit · `octagon-pause` · warning; Blocked · `lock` · warning; Done · `check` · success; Failed · `circle-x` · danger; Cancelled · `circle-slash` · neutral |

Call state (Idle, Dialling…, Ringing…, Live, On hold, Wrap-up, Ended and the rest) uses `CallStateTag` in §12.1 with the `--call-*` tokens. Gate check marks are not tags: they are the `GateCheckRow` marks of `spec/02-components-gate.md` §2.1.

### 5.4 LiveDot
8 px (`--size-live-dot`) circle in `--live` (≥3.58:1 on every plane), `data-mark`. **Static by default.** `pulsing` adds a `::after` ring that scales from 1 to 2.6 and fades from 0.55 to 0 over `--dur-pulse`, `animation-iteration-count: var(--live-pulse-cycles)` (3), `--ease-standard`, then holds solid. Only the **focal call's CallHeader** (and a meeting room's header) sets `pulsing`, and it restarts the 3 cycles each time the call *enters* Live (including a return from On hold, Reconnecting or a hand-back); every other live dot (table cells, nav badge, TopBar chip, Baseline, cards, a live *flow*) is static (07-motion MD3, 06-accessibility §14.2). Under reduced motion or the in-app Motion preference the dot never pulses (tokens zero `--live-pulse-cycles` and `--dur-pulse`; base.css caps iterations) and the word "Live" carries the state. Always next to a word.

### 5.5 CountBadge
Plain tabular numbers in `meta-12` `text-3` (`text-2` in a selected tab), formatted by `formatCount`. No filled bubbles, no red. Use inside tabs, nav items and group headers. While loading: a 16 px skeleton. Accessible name: part of the parent's name ("Callbacks due, 18").

### 5.6 LanguageMark
A language **name**, and, only where a glyph helps, a native-script glyph tile in front of it, so a Tamil reader is never asked to recognise a Telugu glyph (direction §4.5). The tile is a **filled tile with no stroke**: a bordered 18 to 20 px square is the `Kbd` keycap (core §7.3), and a keycap-looking token on every row is the HUD dialect that direction §1.3 removes.

| Part | Tokens |
|---|---|
| Glyph tile | min-width and height `--size-lang-mark` (18); padding-inline `space-2`; fill `surface-3`; **no stroke**: a 1 px `transparent` border that only forced colours draws (`CanvasText`); radius-4; glyph `label-12` `text`, `line-height: 1`, with `lang` set on the glyph. On a `surface-2` row (caller turns) the tile stays `surface-3` |
| Name | `data-13` `text-2` in tables and lists; `meta-12` `text-2` inside voice options and turn headers |

| Variant | Renders | Use | Never |
|---|---|---|---|
| `name` (default) | The name only, plain text in the surrounding role (`text-2`) | Table columns (Leads, Call reports, Flows, Knowledge proposals), phone ListRows, KeyValue values, filter tokens, the Call gate scope, record sheets | A glyph in a table cell or a list row: in dense lists it only repeats the name |
| `full` | Tile + name ("अ Hindi") | Pickers where a language or voice is chosen: VoiceOption and VoicePicker (§12.3), language `Select` and `MultiSelect` options; and the language legend in a CallHeader or TranscriptFeed header ("अ Hindi · A English"), which teaches the glyphs the turn rows use | Tables, lists, KeyValue values |
| `compact` | Tile only, `role="img"` + `aria-label="Hindi"` | The TurnRow speaker line (§12.4), only when per-turn language exists | Anywhere else |

Glyphs: Hindi अ · English A · Hinglish अA (`hi-Latn`) · Marathi म · Tamil த · Telugu తె · Bengali ব · Gujarati ગ · Kannada ಕ · Malayalam മ · Punjabi ਪ · Odia ଓ. Mixed calls with no per-turn language show one mark per language in the call header ("अ Hindi · A English"), never fake per-turn marks (P1). A table cell with two languages reads "Hindi, English" (or "Hindi +1" with both in the tooltip when the column is narrow).

### 5.7 Do / Don't

| Do | Don't |
|---|---|
| One StatusTag per cell, from the domain map: word + icon | Three uppercase pills per row (BROWSER, COMPLETED, NEUTRAL) (F-VIS-027) |
| "Callback due" amber with `clock` on every page; the "Callback" outcome borrows it | A Neel "Callback" on one page and an amber triangle on another (F-VIS-017) |
| "Live v7" computed from the published revision | A permanent green "FLOW VALIDATED" (F-UX-004) |
| "Hindi" as plain text in a table column; "अ Hindi" in a voice picker; the tile alone in a turn row | HI/EN mono boxes, a bordered glyph that reads as a keycap, or a bare glyph in a list (direction §1.3) |

**Resolves:** F-VIS-017, F-VIS-027, F-A11Y-019, F-VIS-011 (sentiment neutral is grey), F-UX-004, F-UX-005 (one "what is live" tag), F-UX-038, F-UX-046, F-QA-037.

```tsx
<Tag tone="outline">Test call</Tag>
<StatusTag domain="lead" value="callback_due" size="default" />   // no tone, icon or label props
<StatusTag domain="call-outcome" value="callback" />               // borrows Callback due: clock, warning
<StatusTag domain="flow" value="live" version={7} />
<LiveDot pulsing={call.state === 'live'} />
<LanguageMark code="hi" />                   // variant: 'name' (default) | 'full' | 'compact'
<LanguageMark code="hi" variant="full" />    // voice pickers, language options, call-header legend
```

---

## 6. Filter bar

### 6.1 Purpose
Narrow one data set, visibly and reversibly, with everything in the URL. **Use** once per data surface (Leads, Call reports, Knowledge, Invoices, Meetings list). **Don't** add a second filter row, status pill rows (views are ViewTabs), or filters that only apply to the loaded page (F-QA-005).

### 6.2 Anatomy

```
[⌕ Search name, phone or city…  ×] [≡ Filter] [Language  Hindi, English ×] [Source  Website ×] [+2 filters] [Clear] ····· 38 of 1,284  [▥ Columns] [Standard|Compact]
```

| Part | Tokens and rules |
|---|---|
| Bar | min-height `--size-toolbar` (48); padding `space-8` `--page-margin`; `surface`; bottom hairline `border`; `flex-wrap: wrap`; gap `space-8`; the right-hand group is pushed by a flexible spacer; sticky under the page header on desktop, together with the table header (F-RWD-012) |
| SearchField | height `--control-h`; `flex: 0 1 calc(var(--space-40) * 7)` (280), `min-width: calc(var(--space-40) * 4)` (160); 1 px `control` border (≥3:1, it is a field); radius-6; padding `0 space-4 0 space-8`; `search` 16 `text-3`; input `data-13` at `--field-font` (16 px on touch, no iOS zoom); placeholder an example ending in "…" in `text-3`; a small Clear IconButton appears when there is text; focus ring on the wrapper via `:focus-within` |
| Filter button | secondary Button, `list-filter` 16 + "Filter"; below 1024 it shows the active count in a 20 px `accent-soft` / `accent-soft-text` count box, radius-4 |
| FilterToken | height `--control-h-sm`; 1 px `border-strong`; radius-6 (never pill); `surface`; body button: field in `data-13` `text-3` + values in `data-13` `--fw-medium` `text` (two values, then "+2"), padding `0 space-4 0 space-8`, hover `surface-2`; remove button 24 wide with `x` 14 `text-3`, hover `surface-2` / `text`; negated filters read "Language not Hindi" |
| More filters | when tokens exceed the inline limit, one token "+2 filters" opens a Popover listing every token |
| Clear | ghost small Button "Clear"; appears only when a search or filter is set; clears search and filters, never the view |
| Result count | `data-13` `text-3`, tabular: "38 of 1,284" when anything narrows the set, otherwise hidden (the header meta has the total); `role="status"` |
| Columns | ghost Button `columns-3` + "Columns" (icon-only with `aria-label` below 1280) opening the ColumnsMenu (§7.5) |
| Density | SegmentedControl Standard / Compact (§3); hidden on touch, where Touch density is automatic |
| View edits | when filters differ from the selected saved view: ghost "Save changes to view" and "Reset" after Clear |

### 6.3 Filter picking
The Filter menu (Radix DropdownMenu, `e2`, `border-overlay`) lists fields grouped as they appear in the table: lead fields, call fields, and captured fields of a flow (only when one flow is filtered, §7.6). Each field opens a value picker (Radix Popover, `role="dialog"`, labelled by the field):

| Field type | Picker |
|---|---|
| Enum (Status, Language, Source, Outcome, Sentiment, Flow) | a search field, then a checklist with server facet counts (tabular `meta-12` `text-3`), 32 px rows; toggles apply immediately (debounced) |
| Date (Last called, Created, When) | presets (Today, Yesterday, Last 7 days, Last 30 days, This month) then Custom range… with two date fields; times in IST |
| Number (Interest, Duration) | min and max fields with the unit ("s", "%") and validation messages under the fields |
| Text (Captured value, Summary) | contains / does not contain + a text field |

Searches and filters run on the server over the whole data set (F-QA-005). The search input is debounced by `--timing-validate-debounce` (300 ms); discrete filter changes query immediately.

### 6.4 States

| State | Treatment |
|---|---|
| Idle | search placeholder; Filter; right-hand group |
| Typing | wrapper focus ring; Clear search appears; result count updates after the debounce |
| Active | tokens, Clear, result count; the table shows only matches |
| Updating | result count reads "Updating…" (`text-3`); no spinner, no dimming (the table sets `aria-busy`) |
| No matches | the table's filtered-empty state (§7.9) with "Clear filters" |
| Error | the table's error state; tokens stay so the user can change them |
| Empty data set | the bar hides entirely; the page shows the empty state and its one action |

### 6.5 Keyboard
`/` focuses search (single-key shortcut switch; ignored while typing anywhere). In search, Esc clears the text, a second Esc blurs. Tab order: search → its Clear → Filter → each token (body, remove) → More filters → Clear → Columns → density. On a focused token body, Enter reopens its picker, Backspace or Delete removes it and focus moves to the next token or the Filter button, and "Language filter removed" is announced. In a picker, focus starts in its search field; ↓ enters the list; Space toggles; Esc closes and returns focus to the token or Filter button.

### 6.6 ARIA
The search sits in `<form role="search" aria-label="Search leads">` (`type="search"`, `enterkeyhint="search"`, `autocomplete="off"`). The filter group is `role="group" aria-label="Filters"` (not `toolbar`, because it holds a text field). Token body: `aria-label="Language is Hindi or English. Edit filter"`; remove: `aria-label="Remove Language filter"`. The Filter button has `aria-haspopup="menu"` and `aria-expanded`. The result count is a polite `role="status"`, announced through the shell announcer after the debounce ("38 of 1,284 leads").

### 6.7 Responsive

| Width | Layout |
|---|---|
| ≥1280 | one row; up to 3 tokens inline, then "+n filters" |
| 1024–1279 | up to 2 tokens inline; Columns is icon-only |
| 768–1023 | tokens fold into the Filter button with a count; the button opens a Popover listing active tokens plus "Add filter"; Columns icon-only |
| 320–767 | row 1: search at full width (sticky under the TopBar); row 2: a horizontally scrolling row of Filter (with count), tokens and Clear, with `scroll-snap-type: x proximity` and an edge fade; pickers open as a bottom sheet with a footer button "Show 38 leads" (one query per decision, not per tap); density and Columns hidden (phones use list rows) |

### 6.8 Motion, content, do / don't
Menus and popovers fade and shift `--shift-popover` over `--dur-base`; tokens appear and disappear without animation. Placeholders: "Search name, phone or city…", "Search calls and transcripts…", "Search files…". Field names match column headers exactly.

| Do | Don't |
|---|---|
| One toolbar row; tokens show field and values | Two rows of 25 px pill chips that overflow at 1024 (F-RWD-012) |
| Full-width search on phones | A 52 px search box at 360 (F-RWD-009) |
| Filters, search and sort in the URL | Filters that reset on reload (F-QA-016) |

**Resolves:** F-UX-031, F-QA-005, F-QA-016, F-RWD-009, F-RWD-012, F-UX-046, F-A11Y-016, F-A11Y-004 (`/` scoped and switchable), F-VIS-009.

```tsx
<FilterBar
  search={{ value: q, onChange: setQ, label: 'Search leads', placeholder: 'Search name, phone or city…' }}
  fields={LEAD_FIELDS}            // { id, label, type: 'enum'|'date'|'number'|'text', facets?(): Promise<Facet[]> }
  value={filters} onChange={setFilters}          // serialised as ?q=&f.language=hi,en&f.source=website
  resultCount={{ shown, total, noun: 'leads' }}  // omit while unknown
  columns={columns} onColumnsChange={setColumns}
  density={density} onDensityChange={setDensity}
  viewEdit={edited ? { onSave, onReset } : undefined}
/>
```

---

## 7. Data table

### 7.1 Purpose
Scan, compare, select and act on many records, keyboard first. **Use** for Leads, Call reports, Knowledge files, Invoices, Usage, Meetings, API keys and Webhooks. **Don't** use it for a single record's fields (KeyValueList), for fewer than about five items (a list), or as page layout. Built on TanStack Table v8 as a real `<table>`, replacing the div-built Leads list and the 2,617 px Call Reports table (F-VIS-009, F-UX-009, F-A11Y-018).

### 7.2 Anatomy

```
caption (visually hidden unless the page has no H1 context)
thead  [☐] Lead ↕ │ Phone │ Status │ Last call ↓ │ Interest │ Language │ Flow │ (actions)
tbody  rows: [☐] key link │ cells … │ [Call…] [⋯] (revealed on hover and focus)
BulkBar (floats above the pager while rows are selected)
Pager  1–50 of 1,284 leads ········ Rows per page 50 ▾  Page 1 of 26  ‹ ›
```

| Frame | Use |
|---|---|
| `flush` | data pages: fills the content column under the FilterBar, no outer border, `surface` |
| `framed` | overview pages and sheets: 1 px `border`, radius-8, `overflow: hidden` |

### 7.3 Tokens

| Part | Tokens |
|---|---|
| Table | `border-collapse: separate; border-spacing: 0`; `data-13` `text-2` |
| Header cell | height `--size-table-head` (32); padding `0 --cell-px`; `label-12` `text-3`, sentence case; `surface`; bottom hairline `border`; `white-space: nowrap`; sticky at `top: var(--table-sticky-top)` (the height of the sticky header and toolbar above it), `z-sticky` |
| Body cell | height `--row-h` (40 · 32 · 48); padding `0 --cell-px` (12 · 8 · 16); bottom hairline `border`; background set on the cell (so sticky cells cover what scrolls under them); `white-space: nowrap`; background transitions `--dur-fast` |
| Key cell | the row's link: `data-13` at `--fw-medium`, `text`, underline on hover; `translate="no"` for names |
| Selection cell | width `space-40`; Checkbox 16 visual with a 24 px hit area (44 on coarse pointers) |
| Numeric cell | right-aligned (header too), tabular; money via `formatMoney` short forms (₹85 L) |
| Phone | `PhoneText` (§5.8): `data-13` with tabular figures, masked `+91 •••••• 4821` |
| Id | `IdText`: `mono-12` |
| Status cell | one StatusTag |
| Meter cell (Interest) | number, then a `space-40` × `space-4` bar: track `surface-3`, fill `text-2` (a neutral magnitude, not Neel, so a 50-row page never "looks blue"), radius-2 |
| Language cell | LanguageMark `name`: the name as plain `text-2`, no glyph tile (§5.6); two languages read "Hindi, English" |
| Date cell | `formatWhen` in a `<time datetime>` with the absolute value in its tooltip; meta parts in `text-3` ("Visit booked · Today 10:42 am") |
| Actions cell | `width: 1%`, right-aligned; row actions (§7.8) |
| Empty value | a domain phrase in `text-3` when one exists ("Not called yet", "Not scored", "Nothing captured"), otherwise "–" in `text-3` with visually hidden "Not captured" (solid token, ≥4.5:1; never an alpha dash, F-A11Y-019) |
| Truncated text | `max-width` in `ch` per column (e.g. Summary `48ch`, Captured `32ch`), ellipsis; the full value in a Tooltip on hover and always in the detail sheet (F-VIS-013) |

### 7.4 Density
Standard (default) · Compact (`Shift+D` or the switch; remembered per user and per table id) · Touch (automatic on `pointer: coarse` or below 768). Only `--row-h`, `--cell-px`, `--control-h*` and `--tag-h` change; type sizes never shrink. At 1440×900 Leads shows about 16 rows in Standard and 20 in Compact; at 1366×768 and 1280×720 at least 10 in Standard (direction §6.1 chrome budget).

### 7.5 Columns: priority, choice, stickiness

Every column declares `priority` 1–4. The table shows what fits the breakpoint; the user's Columns choices override it (and may create horizontal scroll, with pinned columns).

| Priority | Shown by default | Leads | Call reports |
|---|---|---|---|
| P1 | ≥768 (and they form the phone list row) | Lead, Status, Last call | When, Lead, Outcome |
| P2 | ≥1024 | Phone, Interest | Sentiment, Duration |
| P3 | ≥1280 | Language, Flow | Direction (icon + word), Flow + version, Language |
| P4 | off by default; in Columns | Owner, Source, Created | Captured, Channel, Call id, Cost |

At most 9 columns are visible by default (direction §6.4). **ColumnsMenu** (Popover): a checklist grouped "Columns" and, when exactly one flow is filtered, "Captured by Site-visit qualifier v7"; each row has Move up and Move down IconButtons (drag is optional, never the only way); the key column is checked and `aria-disabled` with the reason "Always shown"; "Reset columns" at the bottom.

**Pinned columns:** at ≥768, when the table is wider than its container, the selection and key columns stick left (`position: sticky`, `z-raised`) and the actions column sticks right. The pinned edge gets a 1 px `border` only while scrolled (`data-scrolled-x` on the wrapper). Header cells of pinned columns use `calc(var(--z-sticky) + var(--z-raised))`. So a value is never separated from its call or lead again (F-UX-009, F-RWD-010).

### 7.6 Dynamic extracted-field columns (Call reports)
Flows capture different fields ("Budget", "Preferred day", three "Condition check" steps…). The union of all flows' fields as columns produced 17 columns of dashes (F-VIS-027, F-UX-009). Rules:
1. By default there is one **Captured** column (P4, off by default; on in the "Needs review" view) showing the first values as "Budget ₹85 L to ₹1 Cr · Day Saturday · +1", truncated at `32ch`, with the full list in a Tooltip and the detail sheet. With nothing captured it reads "Nothing captured" in `text-3`.
2. When the Flow filter holds exactly one flow version, ColumnsMenu offers that flow's fields as individual columns, labelled by field and step when names repeat ("Condition check · step 3") (F-UX-046, F-A11Y-018).
3. A captured-field column empty in every row of the result set is listed in ColumnsMenu as "Empty in these results" and not shown by default.
4. Captured values are text cells (`data-13` `text`), searchable through the Text filter type.

### 7.7 Sorting
A sortable header holds a `button` (label + 12 px icon, gap `space-4`, `vertical-align: middle`). Unsorted: `chevrons-up-down` appears on hover and focus only. Sorted: `arrow-up` or `arrow-down`, always visible, label `text-2`. Clicking cycles the column's natural first direction (dates and numbers newest or largest first, text A–Z), then the reverse, then back to the table's default sort (no unsorted state). Only the sorted header carries `aria-sort="ascending|descending"`; sortable others carry `aria-sort="none"`. Blank values sort last in both directions (F-UX-046). Sorting runs on the server over all records (F-QA-005), writes `?sort=last_call:desc`, and announces "Sorted by Last call, newest first".

---

### 7.8 Rows: states, interaction, row actions

| Row state | Treatment (applied to every cell, including pinned ones) |
|---|---|
| Default | `surface` |
| Hover | `--row-hover` (`surface-2`) |
| Selected | `--row-selected` (`accent-soft`) + a `--bw-strong` inset bar in `--row-selected-bar` (`accent-mark`) on the first cell; `aria-selected="true"` |
| Selected + hover | `--row-selected-hover` (`accent-soft-hover`); the control border stays ≥3:1 on it (foundations §0) |
| Focus-visible | the row outline, `--focus-offset-inset` (drawn inside so the scroller never clips it) |
| Focus + selected | both |
| Open (its record is in the sheet) | `--row-hover` fill + the inset bar, `aria-current="true"`; persists while the sheet is open |
| Action disabled in a row | the row is normal; the action is `aria-disabled` with its reason ("On the DND list", "Outside calling hours. Opens 10 am IST") |
| Saving an inline change | the changed cell shows its new value; on failure a danger StatusTag "Couldn't save" with Retry in that cell |

**Opening a record:** the key cell holds a real link (`getRowHref`), so middle-click and ⌘-click open a new tab. A pointer click anywhere else on the row (not on a control, and not while text is selected) is delegated to the same link. The record opens in a sheet deep-linked as `?lead=…` or `?call=…`; a direct load opens it even when the record is not on the current page (F-UX-031). Focus moves to the sheet heading; Esc closes the sheet and returns focus to the row (F-A11Y-002, F-A11Y-010).

**Row actions:** at most one labelled action (the row's main verb: "Call…" on Leads) and a `⋯` IconButton ("More actions for Aarav K."). They sit in the pinned actions column, whose width is always reserved, and fade in (`opacity` over `--dur-fast`) on row hover, on the focused row and on `:focus-within`; on coarse pointers `⋯` is always visible. "Call…" opens the Call gate popover and never dials (F-UX-013, F-A11Y-004). Per-row repeats such as Re-analyse and Download move into `⋯` (F-UX-046). Destructive items live only in `⋯`, after a separator, in `danger-text`, ending in "…", with a confirmation or an Undo toast (F-UX-032, F-UX-035).

### 7.9 Keyboard model (one tab stop for the body)

| Key (focus in the table body) | Action |
|---|---|
| Tab into the table | focuses the active row (the last focused, or the first) |
| ↑ / ↓, and J / K when single-key shortcuts are on | previous / next row |
| Home / End · PageUp / PageDown | first / last row on the page · by one screen of rows |
| Tab / Shift+Tab from a row | through that row's controls (checkbox, key link, Call…, ⋯), then out to the BulkBar and pager. Controls in other rows have `tabindex="-1"`, so the table costs one stop plus the active row's controls (F-A11Y-012) |
| Enter | opens the record (native activation wins when the target is a button or link) |
| Space or X | toggles the row's selection |
| Shift+↑ / Shift+↓ | extends the selection |
| Ctrl/⌘+A | selects every row on the page (only while focus is in the table) |
| Esc | closes the open sheet; otherwise clears the selection |
| C (shortcut switch on) | opens the Call gate for the selection or the focused row; never places a call |
| Shift+D | toggles Standard / Compact |

Single-key shortcuts are handled on the table element, not `window`; they never fire when the target is an input, textarea, select, contenteditable, button or link (for Enter and Space), and they can be switched off in the account menu (F-A11Y-004). Rows set `scroll-margin-top` to the sticky chrome height so a focused row is never hidden under the header.

### 7.10 Selection and BulkBar
- The header checkbox is unchecked, mixed or checked for the **current page** ("Select all leads on this page"). After a full page is selected, the BulkBar offers "Select all 1,284 leads"; that uses a server-side selection (a snapshot of the filters), not 1,284 ids in the browser.
- Selection survives paging within the same filters and is cleared, with an announcement, when filters, search or view change.

| BulkBar part | Tokens and rules |
|---|---|
| Bar | floats centred inside the table region, `bottom: calc(var(--size-pager) + var(--space-12))`; `surface-raised`; 1 px `border-overlay`; radius-8; `e3`; `z-float`; padding `space-6 space-6 space-6 space-12`; gap `space-6` |
| Count | "2 selected" in `label-13`, tabular, with a right hairline `border` and padding-right `space-8` |
| Primary | the one Neel action for the selection ("Call 2 leads…" opens the Call gate, where the count updates after skips) |
| Secondary | ghost small Buttons: Set status, Assign flow, Export |
| Destructive | "Delete 2 leads…" inside a `⋯` on the bar, never inline |
| Clear | IconButton `x`, "Clear selection", `aria-keyshortcuts="Escape"` |

`role="toolbar"` with `aria-label="2 leads selected"` and roving arrow keys inside; it never takes focus on its own; the count change is announced ("2 leads selected"). It enters with `translateY(var(--shift-toast))` → 0 and `opacity` over `--dur-slow`, leaves over `--dur-fast`; under reduced motion it fades. **Phone:** full width minus `space-8` margins, docked above the BottomBar (`bottom: calc(var(--size-bottombar) + env(safe-area-inset-bottom) + var(--space-8))`), with the count, the primary and `⋯`.

### 7.11 Pagination, not infinite scroll
Tables always use **server pagination**: every row has an address (`?page=3&size=50`), the footer and counts stay honest, and keyboard users can reach the pager. This replaces "50 of 121 with no way to the rest" (F-QA-005).

| Pager part | Tokens and rules |
|---|---|
| Bar | height `--size-pager` (40); padding `0 --page-margin`; `surface`; top hairline `border`; `meta-12` `text-3`, tabular; sticky at the bottom of the data region |
| Range | "1–50 of 1,284 leads" (or "1–50 of 121 calls · test calls hidden"); `role="status"`, announced on change |
| Size | "Rows per page" + a small Select: 25 · 50 (default) · 100 |
| Pages | "Page 1 of 26" + Previous / Next IconButtons (small, `aria-label`, `aria-disabled` at the ends) |

On page change the table scrolls to its top and focus stays on the pager button. Page sizes above 100 are not offered; if a product need appears, rows virtualise (TanStack Virtual) and keep `aria-rowindex`. **"Load more"** (a button, never automatic) is only for chronological feeds: Timeline, Activity & Audit, notes. Automatic appending is only for the live transcript.

### 7.12 Table states (`TableState`)

| State | Treatment |
|---|---|
| Loading (first) | real header; after `--timing-skeleton-delay`, static skeleton rows (as many as fit, up to the page size): `space-8` bars in `--skeleton`, radius-2, varying widths, numeric ones right-aligned; no shimmer; pager "Loading…"; `aria-busy="true"` (F-UX-030) |
| Refreshing (sort, filter, page) | current rows stay; `aria-busy="true"`; result count and pager read "Updating…"; no dimming, no spinner |
| Empty data set | one full-width row with EmptyState: 24 px icon `text-3`, `title-16` ("No leads yet"), one `body-14` sentence saying what will appear, one action ("Import leads…"); FilterBar hidden |
| Filtered to nothing | "No calls match “visit” and 2 filters" · "Try a shorter search or remove a filter." · Clear filters (secondary); different copy from the empty account (F-UX-046) |
| Error (first load) | a danger Notice in the body (`role="alert"`): "Couldn't load calls. Check your connection and try again." + Retry; header stays |
| Error (refresh, data on screen) | a warning Notice above the table (`role="status"`): "Showing results from 11:24 am. Couldn't refresh." + Retry |
| No permission | "Only admins can see invoices. Ask Anika R. for access." (names the admin) |

### 7.13 Responsive

| Width | Table | Record |
|---|---|---|
| ≥1440 | P1–P3 (+ user columns) | sheet docks beside the table (440 record, 560 call detail) |
| 1280–1439 | P1–P3 | sheet overlays the right third |
| 1024–1279 | P1–P2 | sheet overlays |
| 768–1023 | P1 + user columns; horizontal scroll with pinned key and actions | full-height sheet, width `min(var(--size-sheet-detail), 100%)` |
| 320–767 | **ListRow** list (below) | full-screen sheet above the BottomBar |

**ListRow** (phone): an `li` whose key link covers the row (stretched-link pattern); padding `space-10 space-16`; min-height `--row-h` (48); bottom hairline. Line 1: title (`label-13` `text`, ellipsis) + trailing StatusTag. Line 2: meta (`meta-12` `text-3`: masked `PhoneText` short (`•••• 4821`, tabular) · last outcome · time, ellipsis) + trailing language name (LanguageMark `name`, plain `meta-12` `text-2`, never a bare glyph, §5.6). Columns map through `meta.mobile`: `title`, `titleTrailing`, `meta`, `metaTrailing` or `hidden`. There is no per-row Call button on phones; calling starts from the record sheet or the BulkBar, so a mis-tap never dials (F-RWD-011). A "Select" button in the page header row enters selection mode (44 px leading checkboxes, BulkBar). At 360×780 at least 8 rows are visible under the chrome (F-RWD-011, F-RWD-004).

### 7.14 ARIA summary
- `<table role="grid" aria-labelledby="{h1 id}" aria-rowcount={total + 1} aria-multiselectable="true">` with a visually hidden `<caption>` stating the sort ("Leads, sorted by last call, newest first").
- `<th scope="col">` with `aria-sort` on sortable ones; the actions header is labelled "Actions" (visually hidden) (F-A11Y-018).
- `<tr aria-rowindex>` (absolute across pages), `aria-selected` on selectable rows, `aria-current="true"` on the open row.
- Row checkboxes are labelled "Select {name}"; row action names include the record ("Download call from 10:42 am") (F-A11Y-024).
- Selection, sort, page range and result counts are announced through the shell announcer.
- Forced colours: selected and current rows get the `Highlight` outline from `base.css`.

### 7.15 Motion and content
Row fills change over `--dur-fast`; row actions fade over `--dur-fast`; the BulkBar enters over `--dur-slow`. No row entrance animation, no shimmer. Headers are sentence-case nouns that match filter field names ("Last call", "Interest"); values carry units ("2m 31s"); dates are relative under 7 days with the absolute date in the tooltip.

### 7.16 Do / Don't

| Do | Don't |
|---|---|
| A real `<table>` with sticky header, `aria-sort` and focusable rows | Div rows with `cursor: pointer` and no role (F-A11Y-010, F-A11Y-002) |
| Server pagination with "1–50 of 121" | Rendering 50 of 121 with no pager (F-QA-005) |
| Priority columns plus a Columns menu; one Captured column | 17 columns of dashes, 2,617 px wide (F-UX-009, F-VIS-027) |
| Pinned key and actions columns | Scrolling right until a value can't be tied to its call (F-RWD-010) |
| "Call…" opening a gate | A `c` keypress or one click dialling (F-A11Y-004, F-UX-013) |
| Delete in `⋯` with confirmation | Delete under Call in the drawer (F-UX-032) |

**Resolves:** F-UX-009, F-UX-013, F-UX-030, F-UX-031, F-UX-032, F-UX-035, F-UX-046, F-VIS-009, F-VIS-013, F-VIS-027, F-A11Y-002, F-A11Y-004, F-A11Y-010, F-A11Y-012, F-A11Y-018, F-A11Y-019, F-A11Y-023, F-A11Y-024, F-QA-005, F-QA-015, F-QA-016, F-RWD-004, F-RWD-010, F-RWD-011, F-RWD-016.

### 7.17 React

```tsx
<DataTable<Lead>
  id="leads" labelledBy="page-title"
  columns={leadColumns}   // ColumnDef<Lead> + meta: { priority: 1|2|3|4, align?: 'end', cell: 'text'|'number'|'money'|'phone'|'status'|'language'|'meter'|'datetime'|'captured', truncate?: `${number}ch`, pin?: 'left'|'right', mobile?: 'title'|'titleTrailing'|'meta'|'metaTrailing'|'hidden', emptyText?: string }
  data={page.rows} rowCount={page.total} getRowId={(r) => r.id}
  getRowHref={(r) => `/leads?lead=${r.id}`}
  state={tableState} onStateChange={setTableState}   // sorting, pagination, rowSelection, columnVisibility, columnOrder; URL-backed
  density={density}
  rowActions={(r) => [
    { id: 'call', label: 'Call…', icon: Phone, inline: true, onSelect: () => openCallGate([r]), disabledReason: r.dnd ? 'On the DND list' : undefined },
    { id: 'delete', label: 'Delete lead…', destructive: true, onSelect: () => confirmDelete(r) },
  ]}
  bulkActions={[{ id: 'call', label: (n) => `Call ${n} leads…`, primary: true, onSelect: openCallGate }, { id: 'status', label: 'Set status' }, { id: 'flow', label: 'Assign flow' }, { id: 'export', label: 'Export' }]}
  status={status}             // 'loading' | 'refreshing' | 'ready' | 'error' | 'stale'
  staleSince={lastGoodAt} onRetry={refetch}
  empty={<EmptyState icon={Users} title="No leads yet" action={importAction}>Leads you import or capture from calls appear here with their status and last call.</EmptyState>}
  emptyFiltered={<EmptyState variant="no-match" onClear={clearFilters} />}
  shortcuts={{ enabled: prefs.singleKeyShortcuts }}
/>
```

- TanStack Table with `manualSorting`, `manualPagination`, `manualFiltering`: the server sorts, filters and counts.
- A `useGridRowFocus` hook owns the roving `tabindex` on rows and on the active row's controls.
- Row-click delegation ignores clicks on interactive descendants and when `getSelection().toString()` is not empty.
- Truncation tooltips mount only when `el.scrollWidth > el.clientWidth`.
- Pinned-edge borders toggle from a `scroll` listener that sets `data-scrolled-x` on the wrapper (passive, rAF-throttled).
- Density and column choices persist per `id` in user preferences (server) with `localStorage` only as a cache, wrapped in try/catch.

---

## 8. Key-value panels

### 8.1 Purpose
Read-only facts about one record: a call's details, a lead's overview, an invoice, an API key, a flow version, what was captured on a call. **Use** in record sheets, cards and Settings summaries. **Don't** use it for editing (Fields and forms), for comparing records (DataTable), or to show values that don't exist (missing values say so, P1).

### 8.2 Anatomy and tokens

```
Section label        Captured so far · 2 of 3
dt  Preferred day    dd  Saturday, morning
dt  Site visit       dd  Waiting for an answer…
dt  City             dd  Pune   from Leads
dt  Call id          dd  call_7c21e0  [copy]
```

| Part | Tokens |
|---|---|
| Section label (optional) | `label-12` `text-3`, padding `space-12 0 space-4`; a count on the right ("2 of 3") |
| Row | grid `minmax(0,2fr) minmax(0,3fr)`, gap `space-16`, padding-block `space-6`; `data-13` |
| Key (`dt`) | `text-3`, sentence case, no colon |
| Value (`dd`) | `text`; `display: flex; flex-wrap: wrap; gap: space-6`; `overflow-wrap: anywhere` for ids and URLs; may hold a StatusTag, a link, a LineQuality, a language name (LanguageMark `name`, §5.6) |
| Mono value | `mono-12` ids only (`IdText`), with a Copy IconButton (small, 24 hit minimum, `aria-label="Copy call id"`). A phone value is `PhoneText` (§5.8), in the row's text role with tabular figures |
| Source note | `meta-12` `text-3` after the value ("from Leads", "from the call", "₹0.04/s") (F-UX-003) |

| Variant | Use |
|---|---|
| `inline` (default) | sheets and cards |
| `rows` | Settings summaries and "Captured so far": each row padding-block `space-10` with a bottom hairline `border` |
| `stacked` | key above value (gap `space-2`); applied automatically by a container query below `calc(var(--space-80) * 4)` (320 px) and for long text (Summary) |

### 8.3 Value states

| State | Treatment |
|---|---|
| Present | `text` |
| Missing (optional field never captured) | "Not captured" in `text-3` |
| Pending (live call, the question not yet answered) | "Waiting for an answer…" in `text-3` (direction §6.2) |
| Loading | a `space-8` skeleton bar at 60 % width |
| Error | the section shows "Couldn't load details · Retry" once, not per row |
| Masked | masked phone with an explicit Reveal button for permitted roles; revealing is logged in Activity & Audit (digest §5.7) |
| Copied | the Copy icon swaps to `check` for the toast's life; the toast says "Copied call id" |

**Behaviour:** values are plain text (selectable); Copy copies the raw value; an Edit link, when present, opens the form for that section, never an inline editor. **ARIA:** `<dl>` with `<div>` wrappers around each `dt`/`dd` pair; a heading (`h3`) above each section; copy results are announced by the toast. **Responsive:** container queries only (the same list works in a 440 px sheet, a 560 px sheet and a phone). **Motion:** none. **Content:** keys are nouns; values come from `lib/format.ts` (one duration format: "2m 31s", never "87s" and "1:27" for the same call, F-VIS-024); captured fields and "not collected" come from the same source so they can't contradict each other (F-UX-010); "2 legs · browser test, counted once" is disclosed when relevant (F-QA-006).

| Do | Don't |
|---|---|
| "Not captured" and the source of every value | Demo email, company and sentiment beside a real lead (F-UX-003) |
| One formatter for every duration | "87s" in the panel and "1:27" in the table (F-UX-010) |
| Copy button on ids | A truncated call id with no way to copy it (F-UX-010) |

**Resolves:** F-UX-003, F-UX-010, F-UX-032, F-VIS-024, F-A11Y-019, F-QA-006 (legs disclosed).

```tsx
<KeyValueList variant="inline" title="Call" items={[
  { key: 'Outcome', value: <StatusTag domain="outcome" value={call.outcome} /> },
  { key: 'Duration', value: formatDuration(call.talkMs) },
  { key: 'Call id', value: call.id, mono: true, copy: call.id },
  { key: 'City', value: lead.city, source: 'from Leads' },
  { key: 'Site visit', state: 'pending' },
]} />
```

---

## 9. Avatars

### 9.1 Purpose
Recognise a person, the AI voice or the workspace at a glance, always next to the name except in dense stacks. **Don't** use avatars for leads in tables (names suffice), as decoration, or to give the agent a face (direction §3.2).

### 9.2 Variants and tokens

| Variant | Shape and colour | Sizes | Content |
|---|---|---|---|
| Person | round (`--radius-full`); `surface-3` background; `text-2` | 20 (`space-20`) in feeds, 28 (`--size-avatar`) default, 32 (`--size-avatar-voice`) in record and call headers | initials: one letter at 20 (`label-12`), two at 28 (`label-12`) and 32 (`label-13`); a teammate's photo when they uploaded one (`object-fit: cover`), initials as the fallback; never a lead photo |
| VoiceTile | square tile, radius-6; `surface-3`; `text` | 28 in lists and the compact picker, 32 in the voice picker and call header | two letters of the voice name ("Va", "Vi"). Square so an AI voice never looks like a person; no face, orb or waveform art |
| WorkspaceTile | square tile, radius-6; `ink-tile` / `ink-tile-fg` | 28 | the workspace's first letter |
| AvatarStack | Person avatars overlapping by `space-4`, each with a `--bw-strong` ring in `surface` | 28 | at most 3, then "+n" in the same shape |

**States:** default; loading (an empty `surface-3` circle or tile); image error (initials). Avatars are not interactive; the button or link that contains one owns hover and focus. **ARIA:** `aria-hidden` when the name is adjacent; alone, `role="img"` with `aria-label` ("Anika R."); stacks name everyone ("3 participants: Anika R., Dev M. and 1 more"). **Responsive:** sizes never scale with the viewport. **Motion:** none. **Content:** initials from the first letters of the first two words; `translate="no"` on names.

| Do | Don't |
|---|---|
| Neutral initials; square tiles for voices and the workspace | Colour-coded rainbow backgrounds, or Neel initials (K8) |
| Account identity at the bottom of the sidebar | No identity anywhere in the chrome (F-UX-029) |

**Resolves:** F-UX-029, F-VIS-016, direction §3.2 (agent persona).

```tsx
<Avatar name="Anika R." size={28} src={user.photoUrl} />
<VoiceTile voice={{ name: 'Vaani' }} size={32} />
<WorkspaceTile name="Sample Realty" />
<AvatarStack people={participants} max={3} />
```
Built on Radix `Avatar` (image with fallback).

---

## 10. Timeline and activity feed

### 10.1 Purpose
What happened to one record, in order: a lead's calls, status changes, notes, imports and assignments; the workspace's Activity & Audit ledger uses the same component with filters. **Don't** use it for the live transcript (TranscriptFeed), notifications or chat.

### 10.2 Anatomy and tokens

```
Today                                                   day heading (sticky in its scroller)
[☎] Vaani called · Visit booked · 2m 31s        10:42 am
 │   ┌ अA Caller  “Saturday ho sakta hai…” ┐    detail (optional)
[◎] Status changed from New to Interested by the Outcome step   10:44 am
(A) Anika R. added a note                        11:02 am
```

| Part | Tokens |
|---|---|
| Day heading | `label-12` `text-3`, padding `space-12 0 space-8`; "Today", "Yesterday", then "28 Aug 2026"; `position: sticky; top: 0` inside the scroller with a `surface` background |
| Item | grid `var(--size-glyph-tile) minmax(0,1fr) auto`, gap `space-4 space-12`, padding-bottom `space-16` |
| Node | 24 (`--size-glyph-tile`) tile, radius-6, `surface-2`, 1 px `border`, icon 14 `text-2`; events that carry a state use its soft tone (`success-soft` / `success-text` for a connected call, `warning-soft` for a stale queued call, `danger-soft` for a failed one); human actions use a 20 px Person avatar instead |
| Connector | 1 px `border` line from under the node to the next node; none after the last item |
| Text | `data-13` `text-2`; actor and object in `--fw-medium` `text`; links in `accent-text` |
| Time | `meta-12` `text-3`, `<time datetime>` with the absolute date and IST in its tooltip |
| Detail (optional) | spans columns 2–3; `surface-2`, radius-6, padding `space-8 space-12`, `data-13` `text-2`: a transcript excerpt with its LanguageMark, a note, or a change ("New → Interested") |
| Actions (optional) | ghost small Buttons under the text ("Check status", "Open call") |
| Load older | ghost small Button "Show older activity" after the last group |

### 10.3 Event catalogue (icon · tone)
Call placed or received (`phone-outgoing` / `phone-incoming`, tone from the call result) · Status changed (`circle-dot`, neutral) · Note added (author avatar) · Imported (`list`, neutral) · Flow assigned (`workflow`) · Callback scheduled (`clock`, info) · Call still queued past the reaper window (`clock`, warning: "no update since 28 Aug, 11:45 pm") · Exported (`download`) · Audit only: signed in (`log-in`), API key created (`key-round`), settings changed (`sliders-horizontal`).

### 10.4 States

| State | Treatment |
|---|---|
| Loading | three skeleton items (node tile, two bars) after `--timing-skeleton-delay` |
| Empty | "No activity yet. Calls, status changes and notes will appear here." |
| Empty audit ledger | states the retention window and since when events are recorded ("Recording since 20 Sep 2026 · kept for 365 days"), so an empty ledger is not mistaken for no activity (F-UX-042, F-QA-023) |
| Stale | a queued or in-progress call older than the reaper window shows the warning tone and "Check status" (F-QA-037) |
| Grouped repeats | consecutive same-kind system events collapse: "3 status changes by the Outcome step · Show" (Radix Collapsible, `aria-expanded`) |
| Load older | 20 items per load; focus moves to the first new item; "20 older events loaded" is announced |
| Error | a Notice with Retry at the top of the list; existing items stay |

**Keyboard:** Tab through links and buttons only; no roving focus. **ARIA:** each day is a heading (level from context) followed by an `<ol aria-labelledby>`; items are `<li>`; live additions are announced only when they carry a state change (call ended, status changed). **Responsive:** below a 360 px container the time moves under the text (grid becomes two columns). **Motion:** none; new items appear without animation. **Content:** one past-tense sentence, actor first ("Vaani called", "Anika R. added a note", "Import added 212 leads"); system actors are named in words ("the Outcome step"), never ids.

| Do | Don't |
|---|---|
| Flag a month-old "Queued" call as stale | Leave "QUEUED 28 Aug" looking current (F-QA-037) |
| Explain an empty audit ledger | "Nothing in this slice yet" on an active account (F-UX-042) |
| "Show older activity" as a button | Endless auto-loading with no end or position |

**Resolves:** F-QA-037, F-UX-042, F-QA-023, F-UX-032, F-VIS-024.

```tsx
<Timeline status={status} hasOlder={hasOlder} onLoadOlder={loadOlder}
  groups={[{ day: '2026-09-26', items: [
    { id, kind: 'call', tone: 'success', actor: 'Vaani', text: <>called · <a href={callHref}>Visit booked</a> · 2m 31s</>, at, detail: <TurnExcerpt turn={t} /> },
    { id, kind: 'note', actor: { name: 'Anika R.' }, text: 'added a note', at, detail: note.body },
  ] }]} />
```

---

## 11. Chart styling rules

### 11.1 Purpose and chart choice
Charts answer one question each, with the range and the counting rule stated. The chart palette is separate from chrome (foundations §3.6). No chart library is installed today (hand-built SVGs distort at every width, F-VIS-012).

| Question | Form | Component |
|---|---|---|
| How many per day or week? | vertical bars (discrete periods); a line only above 31 points | `BarChart`, `LineChart` |
| How is it split over time? (sentiment) | stacked bars in a fixed order | `StackedBarChart` |
| Which are the biggest? (intents, flows, reasons) | a ranked bar list with readable labels | `BarList` |
| Where do callers drop off? | step rows with reached count and drop %, each linking to its step | `Funnel` |
| When are calls busiest? | a 24-cell sequential strip (IST) | `HeatStrip` |
| What is the shape behind a KPI? | a sparkline in a StatTile | `Sparkline` (§4.5) |

**Never:** pies or donuts, gauges, 3D, dual axes, radar, stacked areas with gradients, animated counters.

### 11.2 ChartFrame anatomy
A `Card` (§4) holding: header (title `title-14` as a question-shaped noun, meta `meta-12` `text-3` with range and counting rule, and a ghost small "View as table" toggle), the legend row (when there are 2+ series), the plot, and an optional footnote (`meta-12` `text-3`, e.g. "Test calls excluded").

### 11.3 Plot sizing
- The SVG is drawn at 1:1 with its container: a ResizeObserver reads the width and the SVG `width`/`height` equal it. No `viewBox` stretching and no `preserveAspectRatio="none"`, so text is never squashed (F-VIS-012).
- Heights: `calc(var(--space-40) * 6)` (240) for the main chart on Analytics at ≥1280; `calc(var(--space-40) * 5)` (200) default; `calc(var(--space-40) * 4)` (160) below 768 (the `--size-chart-lg`, `-md` and `-sm` tokens, §0.5).
- Inner margins: top `space-8`, right `space-4`, bottom `space-24` (x labels), left `space-32` grown to the widest measured y label plus `space-8`.

### 11.4 Axes, ticks and gridlines

| Element | Rule |
|---|---|
| Y axis | no axis line; 4–6 "nice" ticks (`d3.scaleLinear().nice()`, `ticks(4)`); labels `meta-12` in `--chart-label`, tabular, right-aligned `space-8` left of the plot; bars and counts start at 0 |
| X axis | the only axis line: 1 px `--chart-axis` on the baseline; labels `meta-12` `--chart-label`, centred under each band; dates "21 Sep"; labels are thinned (keep at least 56 px per label: 7 for a week on desktop, 3–4 on phones), never rotated, never cut mid-word |
| Gridlines | horizontal only, 1 px `--chart-grid`, solid (dashes mean one thing: the canvas fallback path), `shape-rendering: crispEdges`; no vertical gridlines, no plot background other than `surface` |
| Units | in the title or meta ("Calls per day"), not as a rotated axis title |

### 11.5 Marks and colour

| Mark | Rule |
|---|---|
| Bars | width `min(56% of the band, var(--space-48))`; radius-2 on the data end only; single-series and nominal bars all in `--chart-neutral` (no rainbow categories); the hovered, focused or selected period switches to `--chart-highlight` (foundations §3.6) |
| Stacked bars | fixed order from the baseline: positive, neutral, mixed, negative (`--sentiment-*`), separated by a `--bw-strong` gap so green never touches red; radius-2 on the top segment's top edge |
| Lines | 2 px (`--bw-strong`), round joins; points hidden except the hovered or focused one and the last point; at most 4 identity series plus Other, direct end labels when there are 4 or fewer |
| Categorical colour | `--chart-1` Ink, `--chart-2` Teal, `--chart-3` Ochre, `--chart-4` Rose in fixed order, never cycled; everything past four is `--chart-other` ("Other", always labelled). No Neel series: Neel is only `--chart-highlight` (foundations §3.6) |
| Sequential colour | `--seq-1`…`--seq-5` (one teal hue), labels on cells in `--seq-n-fg`; zero or missing uses `--seq-empty` with a "No calls" legend entry, never the lightest step |
| Sentiment colour | only for sentiment data; neutral is grey, not mustard (F-VIS-011) |
| Never | state colours (success, warning, danger) as series; area fills or gradients; decoration |
| Hover | bars: a `surface-2` band behind the hovered period; lines: a 1 px `--chart-axis` crosshair |

Values and labels always use text tokens, never the series colour. Chart marks carry no Neel except the one highlighted datum, which counts as the screen's selection.

### 11.6 Legend
Required with 2 or more series; above the plot, left-aligned; items `meta-12` `text-2`: an 8 px (`space-8`) swatch, radius-2, `data-mark` (forced colours), the series name, then its total in `--fw-medium` `text`, tabular. Order matches the stack order. Legend items may toggle series (`button`, `aria-pressed`), never as the only way to read a value.

### 11.7 Tooltip (`ChartTooltip`)
Floating UI, anchored to the hovered or focused band or point, offset `space-8`, flips and shifts at the plot edges (never covers the pointer, F-VIS-012); `surface-raised`, 1 px `border-overlay`, radius-6, `e2`, padding `space-8 space-10`, min-width `calc(var(--space-40) * 4)`, max `--size-tooltip-max`, `z-tooltip`, `pointer-events: none`. Header `label-12` `text` ("Thu 24 Sep"); rows: swatch, series name (`meta-12` `text-2`), value right-aligned (`--fw-medium` `text`, tabular); an optional comparison row ("vs previous Thu · +7"). It appears without delay on hover and on keyboard focus, fades over `--dur-fast`; on touch, a tap shows it and a tap elsewhere hides it.

### 11.8 Keyboard and accessibility
- A static chart is `role="img"` with an `aria-label` that states the finding ("Calls per day, last 7 days: from 9 on 27 Sep to 31 on 24 Sep").
- An interactive plot is one tab stop (`tabindex="0"`, `aria-roledescription="chart"`, labelled by the title): ←/→ move between periods, Home/End jump, Esc hides the tooltip; a visually hidden polite region reads the focused period ("Thursday 24 September: 31 calls, 7 more than the previous Thursday"). The focus ring sits on the plot.
- **View as table** renders the same data as a framed, compact DataTable (dates, series columns, totals), so no value depends on colour or hover.
- All text ≥12 px at every width; every mark ≥3:1 on `surface` (validated palette); swatches carry `data-mark`.

### 11.9 States

| State | Treatment |
|---|---|
| Loading | frame, title, meta and gridlines render; no marks; the legend shows skeleton bars; after `--timing-skeleton-delay`; `aria-busy` |
| Empty | inside the plot area, above the baseline: a 24 px icon in `text-3`, one `body-14` sentence and at most one action ("No calls to your number yet. Your number is still being verified." · Open Phone setup). Never 24 empty cells or a flat line pretending to be data (F-VIS-010, F-UX-011) |
| Not enough data | "Not enough data yet. Trends appear after 7 days of calls." |
| Partial | missing periods are gaps (no interpolation); the tooltip says "No data" |
| Stale | meta reads "Showing data from 21 Sep" with "Recompute" when the data is older than its refresh interval (F-UX-036) |
| Error | a Notice inside the plot with Retry; the frame keeps its height |

### 11.10 Responsive

| Width | Rules |
|---|---|
| ≥1280 | main chart 240; grids of 2–3 charts per row on Analytics |
| 768–1279 | 200; one or two per row |
| 320–767 | 160; one per row; ticks thinned; legend wraps above the plot; BarList labels move above their bars; HeatStrip becomes two rows of 12 (am, pm) below 480 px of container |

### 11.11 Specific components

| Component | Tokens and rules |
|---|---|
| `BarList` | rows `minmax(0,14ch) minmax(0,1fr) auto`, gap `space-12`, row gap `space-8`; label `data-13` `text` with ellipsis and full text in a tooltip (F-VIS-013); track `space-8` tall in `surface-2`, fill `--chart-neutral` (Other in `--chart-other`; the hovered or focused row in `--chart-highlight`), radius-2 on the end; value "38 · 31%" outside the bar in `meta-12` `text-2`; top 8 then Other |
| `Funnel` | one row per step: label "3 · Ask about a site visit" as a link to that step in the flow (F-QA-019); value "88 · 15% drop" in `meta-12` `text-2`; a `space-8` track in `surface-3` with a `--chart-neutral` fill proportional to reached ÷ entered (`--chart-highlight` while its row is hovered or focused); the largest drop says "largest" in words; scoped to the page range, with the flow version in the meta |
| `HeatStrip` | 24 cells, gap `space-2`, height `space-20`, radius-2, `--seq-*`; axis labels "12 am · 6 am · 12 pm · 6 pm · 11 pm"; IST in the meta; legend "No calls · Fewer · More" |
| `Sparkline` | §4.5 |

### 11.12 Motion
No entrance animation (bars do not grow, numbers do not count up). A data change may crossfade the plot's `opacity` over `--dur-fast`; the tooltip fades over `--dur-fast`. Nothing loops.

### 11.13 Content
The title names the question or quantity ("Where callers drop off", "Calls per day"); the meta states the range and the counting rule ("Last 7 days · calls, not legs"); test calls are excluded by default with a footnote; numbers use en-IN grouping; step names carry their step number; no § markers, italic taglines or HUD brackets (F-VIS-010).

| Do | Don't |
|---|---|
| Draw at the container's pixel size with 12 px labels | A stretched 800×220 viewBox with 4.8 px labels (F-VIS-012) |
| Colour deltas and series by meaning; grey neutral | Green "negative +13pp" and mustard neutral (F-VIS-011) |
| A funnel whose fills render and whose steps link to the flow | Transparent bars and six steps named "Condition check" (F-QA-019) |
| One range in the header that every chart states | A range toggle inside one card that changes some sections (F-UX-036) |

**Resolves:** F-VIS-010, F-VIS-011, F-VIS-012, F-VIS-013, F-QA-019, F-UX-011, F-UX-036, F-A11Y-019 (marks and labels on tokens).

### 11.14 React

```tsx
<ChartFrame title="Calls per day" meta="Last 7 days · calls, not legs" status={status} onRetry={refetch}
  table={{ columns: ['Day', 'Calls'], rows }} empty={{ icon: Phone, text: 'No calls in the last 7 days.' }}>
  <BarChart data={daily} x="day" y="calls" format={formatCount}
    tooltip={(d) => [{ label: 'Calls', value: d.calls }, { label: 'vs previous', value: signed(d.delta) }]} />
</ChartFrame>
<StackedBarChart data={daily} keys={['positive', 'neutral', 'mixed', 'negative']} palette="sentiment" />
<BarList items={intents} max={8} valueFormat={(v, share) => `${v} · ${pct(share)}`} />
<Funnel steps={steps} getHref={(s) => `/flows/${flowId}?step=${s.id}`} />
<HeatStrip values={byHour} timezone="Asia/Kolkata" />
```

- Scales and paths from `d3-scale` and `d3-shape`; rendering is our own SVG and HTML, so every colour is a CSS class reading a token (`.bar { fill: var(--chart-neutral) }`), and dark mode needs no JS.
- `useElementSize` (ResizeObserver, rAF-throttled) feeds width; text measured once per font load for the left margin.
- Floating UI for the tooltip; the visually hidden live region comes from the shell announcer.
- If the team prefers a library (visx or Recharts), wrap it in `ChartFrame`, disable its animations, and pass token classes instead of colour props.

---

## 12. Voice components

The conversation is the stage (direction §0): these components show real call state, real line quality and real speech, and they hide themselves when the data does not exist. Motion here is only ever driven by a live call or real audio.

### 12.1 Call state: `CallStateTag`, `CallStepper`, `CallHeader`

**Purpose.** One call-state machine, shown the same way in Cockpit, Rep console, Call reports, the flow Test panel, the Cockpit Calls column and the tablet and phone call chip. **Don't** show a call state when there is no call (no STANDBY ring, no "SESSION: IDLE", F-VIS-029, F-UX-018).

**States** (foundations §3.5; tokens `--call-{state}-fg / -bg / -mark`):

| State | Word | Icon | Tone | Announced |
|---|---|---|---|---|
| Idle | Idle | `phone` | neutral | no |
| Dialling | Dialling… | `phone-outgoing` | pending (warning tokens) | "Dialling" |
| Ringing | Ringing… | `phone-call` | pending | "Ringing" |
| Live | Live | LiveDot, pulsing | live (success tokens, `--live` mark) | "Call live" |
| On hold | On hold | `pause` | pending | "On hold" |
| Wrap-up | Wrap-up | `clipboard-check` | neutral | "Call ended. Wrap-up" |
| Ended · No answer · Busy · Voicemail | as written | `phone-off` · `phone-missed` · `phone-off` · `voicemail` | neutral | the word, plus the duration for Ended |
| Failed | Failed | `circle-x` | failed (danger tokens) | "Call failed" + reason when known |

Transitions: Idle → Dialling → Ringing → Live ⇄ On hold → Wrap-up → Ended. Dialling or Ringing → No answer | Busy | Voicemail | Failed. Live → Failed ("Call dropped"). Inbound calls start at Ringing.

| Variant | Anatomy and tokens |
|---|---|
| `CallStateTag` | Tag metrics (§5.2): height `--tag-h`, radius-4, padding-inline `space-6`, gap `space-6`, `label-12`; icon 12 or LiveDot; word; optional `Timer` (§5.8, `label-12` tabular) of time in this state ("Ringing… 00:07", "Live 02:14"). As the tablet or phone TopBar chip it is `lg` (`--size-chip`) with radius-6 and links to the call |
| `CallStepper` | `<ol>` of 4 steps: Dialling, Ringing, Live, Wrap-up; node 12 px (`space-12`) circle with a `--bw-strong` border; done nodes filled `text-2`; the current node filled with the state's mark (`--live` when live) and `data-mark`; upcoming nodes `surface` + `border-strong`; connector `--bw-strong` in `border-strong`, done segments `text-2`; label `label-12` `text-2` (current in the state's `fg`), time `Timecode` (`meta-12` tabular `text-3`, "00:03", "next"). A terminal outcome (No answer, Busy, Voicemail, Failed) replaces the remaining steps with its CallStateTag |
| `CallHeader` | row 1: CallStateTag · direction and flow ("Outbound · Site-visit qualifier v7") in `data-13` `text-2` · `Timer` in `num-20`, tabular, right-aligned, `role="timer"`; row 2: 32 px Person avatar, lead name `title-14` (`translate="no"`), masked number `PhoneText`, a `Tag outline` "Recording · disclosed 00:01"; row 3: CallStepper; then LineQuality |

**States beyond the machine:** loading (the header shows the lead and flow; the tag reads "Connecting…" as Dialling only once the server confirms the attempt), stale (a call stuck in Dialling or Ringing past 60 s shows "No update for 60 s · Check" in `warning-text`, never a frozen timer).

**Behaviour and ARIA.** The state word sits inside a polite `role="status"` wrapper in CallHeader and the chip; changes are debounced by 500 ms so a Dialling → Ringing flip under a second announces once. The timer is `role="timer"` (implicitly not live) and is never announced. In tables the CallStateTag has no live region. Colour never carries the state alone: word and icon are always present.

**Responsive.** Desktop: CallHeader in the Cockpit call card (400 px column). Laptop-S: the Calls column becomes a header switcher, CallHeader unchanged. Tablet: CallHeader on the Call tab. Phone: CallHeader stacks above the transcript; the TopBar chip keeps state visible when the card scrolls away (F-RWD-002).

**Motion.** Only the CallHeader's LiveDot pulses: 3 cycles (`--live-pulse-cycles` × `--dur-pulse`) each time the call enters Live, then solid; the CallStateTag's dot in lists and chips is static; Ringing has no animation. Tone changes over `--dur-fast`. Under reduced motion nothing moves.

**Content.** State words exactly as in the table; timers `mm:ss` (h:mm:ss after an hour); "Recording · disclosed 00:01" wherever a recording runs (compliance cue, direction §8).

| Do | Don't |
|---|---|
| "Live 02:14" with a pulsing dot while live | A 320 px STANDBY ring that breathes forever (F-VIS-029, F-A11Y-022) |
| The same state machine on every surface | "IDLE" in the header, "Awaiting connection…" in the feed and "SESSION: IDLE" in a strip |

**Resolves:** F-VIS-029, F-VIS-030, F-UX-018, F-UX-026, F-A11Y-014, F-A11Y-022, F-RWD-002, F-QA-037 (stuck states surface).

```tsx
<CallStateTag state="ringing" since={ringingAt} size="default" />   // size: 'default' | 'chip'
<CallStepper state={call.state} times={{ dialling: 0, ringing: 3000, live: 9000 }} />
<CallHeader call={call} lead={lead} flow={flow} recording={{ disclosedAtMs: 1000 }} />
```

### 12.2 `LineQuality`

**Purpose.** Tell the operator, in words, whether callers can hear the agent well right now. **Only during a call** (Cockpit call card, Rep console, Talk in browser, the call header); never idle, never in the sidebar, never a random number (F-UX-018).

**Anatomy.** Optional key "Line" (`text-3`) · signal bars · level word · latency · optional consequence.

| Part | Tokens |
|---|---|
| Signal bars | 3 bars, `space-2` wide, heights `space-4`, `space-8`, `space-12`, gap `space-2`, radius-2, bottom-aligned in a 14 px box; filled bars in the level's solid (`--success`, `--warning`, `--danger`); unfilled bars `border-strong`; `data-mark` |
| Word | `data-13` in the level's text token (`success-text`, `warning-text`, `danger-text`) |
| Latency | `meta-12` `text-3`, tabular, `formatLatency` ("180 ms", non-breaking space) |
| Consequence (Poor only) | `meta-12` `text-3`: "callers may talk over the agent" |

**Levels** (computed from WebRTC `getStats()` on the agent's media leg every 2 s; a level changes only after two consecutive samples agree, so it never flickers). Thresholds are a proposal for the product owner to confirm:

| Level | Condition | Bars | Word |
|---|---|---|---|
| Good | round trip < 300 ms, loss < 1 %, jitter < 30 ms | 3 filled, `--success` | Good |
| Fair | round trip 300–600 ms, or loss 1–3 %, or jitter 30–60 ms | 2 filled, `--warning` | Fair |
| Poor | round trip > 600 ms, or loss > 3 %, or jitter > 60 ms | 1 filled, `--danger` | Poor |
| Reconnecting | no media for more than 2 s | `refresh-cw` 14 (static) in `warning-text` | Reconnecting… + seconds ("4 s") |
| Lost | reconnection fails after 15 s | — | the call moves to Failed ("Call dropped") |

**Details popover.** LineQuality is a button (`aria-haspopup="dialog"`); its Popover (`e2`, `border-overlay`, max `--size-tooltip-max`) says what it means in a sentence ("Callers hear the agent about 0.2 s after they finish speaking.") and lists Round trip, Jitter, Packet loss and "Measured every 2 s" as a KeyValueList. Region appears only when it is real. With **Talk in browser**, two rows show: "Your connection" (the browser leg) and "Phone line".

**ARIA.** Button name "Line quality: Good, 180 milliseconds". Announced only on transitions into Poor or Reconnecting and on recovery ("Line recovered"), politely; Lost is announced by the call state. Numbers are never announced.

**Responsive.** Same component everywhere; on phones the key "Line" is dropped and the consequence moves into the popover. **Motion:** none (bars do not animate; the reconnect icon does not spin). **Content:** words first, then the number: "Line · Good · 180 ms".

| Do | Don't |
|---|---|
| "Line · Good · 180 ms" during a call, from real measurements | "LAT: 0ms" idle, or "SYS: ONLINE · 22ms" from a random timer (F-UX-018) |
| Hysteresis so the level is stable | A level that flips every sample |

**Resolves:** F-UX-018, F-UX-026 (explains what the operator is watching), digest §5.7 item 2.

```tsx
<LineQuality sample={stats /* { rttMs, jitterMs, lossPct, stalledMs } */} showKey legs={['phone']} />  // legs: ['browser','phone'] for Talk in browser
```

### 12.3 `VoicePicker` and `VoiceOption`

**Purpose.** Choose the voice for this call, flow or agent, and hear it in the language it will speak. **Use** in the Cockpit Ready-to-call card (compact), the Call gate, Flow settings and Personal agents. **Don't** save the account default as a side effect of picking (F-UX-014), and don't give the voice a face.

**Anatomy (option card).**

```
[Va]  Vaani  [Workspace default]                 ✓  [▶]
      अ Hindi  A English  Warm, measured pace
```

| Part | Tokens |
|---|---|
| Option | grid `minmax(0,1fr) auto`, gap `space-4 space-12`; padding `space-12`; 1 px `border`; radius-8; `surface` |
| Radio part | the tile and text, as one `role="radio"` element: grid `auto minmax(0,1fr)`; VoiceTile 32; name `title-14` (`translate="no"`); qualifier Tag `outline` ("Workspace default"); meta line `meta-12` `text-3` with LanguageMarks (16 px glyph box) and a plain style description |
| Selected cue | `circle-check` 16 in `accent-text` beside the preview button (the non-colour cue, F-A11Y-016) |
| Preview | IconButton `line` 32 (44 on touch): `play` ↔ `square`; while playing, a 4-bar level meter (`space-2` wide bars in `accent-mark`, radius-2) driven by a real `AnalyserNode` |
| Compact trigger (`VoiceSelect`) | a field-like row: height `space-48`, 1 px `control` border, radius-6, padding `0 space-4 0 space-8`; VoiceTile 28 + "Vaani · Hindi + English" in `data-13` + preview IconButton + `chevron-down` IconButton opening a Popover listbox of options; helper under it in `meta-12` `text-3`: "Used for this call only. Make default" |

| State | Treatment |
|---|---|
| Hover | `surface-2` + `border-strong` over `--dur-fast` |
| Focus-visible | focus ring on the radio part, offset `space-4` |
| Selected | `accent-soft` fill + `accent-mark` border + check icon; `aria-checked="true"` |
| Previewing | preview button `aria-pressed="true"`, label "Stop preview of Vikash", meter moving with the audio |
| Preview failed | "Couldn't play the preview. Retry" in `meta-12` `danger-text` inside the option |
| Unavailable | `surface-2`; name `text-dis`; the reason in the meta line ("Not available: this flow speaks Hindi and English"); `aria-disabled="true"`; preview still works so people can hear it |
| Loading | three skeleton options |

**Behaviour.** Selecting changes this call or this flow only; "Make default" is a separate link and confirms with a toast that offers Undo (F-UX-014). One preview plays at a time; starting another stops the first; previews stop at their end (a sample of about 8 s), on selection change and on unmount. The sample is real audio in the selected language, recorded or synthesised once, never a fake waveform.

**Keyboard and ARIA.** `role="radiogroup"` with `aria-label="Voice for this call"`; ↑/↓ (and ←/→) move and select; Tab moves to the preview button of the focused option, then out. Space on the preview toggles play; Esc stops it. Each radio has `aria-describedby` pointing at its meta line. The preview button is a sibling of the radio, never nested inside it.

**Responsive.** A single column of options; in Flow settings at ≥1024 with more than four voices, two columns. On phones options are 56 px or taller and the compact trigger opens a bottom sheet instead of a popover.

**Motion.** The meter moves only with real audio and is static under reduced motion; hover fills over `--dur-fast`.

| Do | Don't |
|---|---|
| Radio options with a check, a language and a real preview | VIKASH / VAANI buttons without `aria-pressed` (F-A11Y-010, F-A11Y-016) |
| "Make default" as its own action | Pickers that silently save the account default and silently revert (F-UX-014) |
| A square 32 px tile | An orb or a face for the agent |

**Resolves:** F-UX-014, F-A11Y-010, F-A11Y-016, F-VIS-029 (controls, not decoration, lead the Cockpit), direction §6.2.

```tsx
<VoicePicker value={voiceId} onValueChange={setVoiceId} label="Voice for this call"
  voices={voices /* { id, name, languages: LangCode[], style, available, unavailableReason? } */}
  previewLanguage={flow.language} defaultId={workspace.defaultVoiceId} onMakeDefault={makeDefault}
  variant="cards" />   // 'cards' | 'compact'
```
Built on Radix `RadioGroup` (cards) and Radix `Popover` + a listbox (compact); audio through one shared `useAudioPreview()` that guarantees a single playing element.

---

### 12.4 `TranscriptFeed` and `TurnRow`

**Purpose.** What was said, by whom, in which language, and where in the flow, live or after the call. One row design is used in Cockpit, Call reports, Rep console, Meetings notes and the flow Test panel (direction §6.2). **Don't** use chat bubbles, typing animations, per-word fades, or fake per-turn data.

**TurnRow anatomy.**

```
00:21 │ Vaani  [A]  Step · Ask about a site visit   ⌸ Knowledge · price-sheet.pdf
      │ You had asked about a 2 BHK near the metro. Would you like to visit the site this week?
```

| Part | Tokens |
|---|---|
| Row | grid `var(--space-56) minmax(0,1fr)` (the gutter is `--size-turn-gutter`, foundations §18), row gap `space-4`; padding `space-12 space-16 space-12 0`; bottom hairline `border`; `lang` on the row (`hi`, `hi-Latn`, `ta`, …) |
| Agent / operator turn | `surface` |
| Caller turn | `surface-2` |
| Timecode | `Timecode` (§5.8): `meta-12` tabular `text-3` in the gutter, padding-left `space-16`, from call start (`mm:ss`, `h:mm:ss` after an hour). In review mode it is a button that seeks ("Play from 00:41"; hover `accent-text` + underline) |
| Header line | flex, wrap, gap `space-4 space-8`, `meta-12` `text-3`: speaker `title-14` `text` ("Vaani" with `translate="no"`, "Caller", or "You" after a take-over) · LanguageMark `compact` · the flow step in plain words, "Step · Ask about a site visit", `text-2` with a `border-strong` underline, opening the flow at that step · an optional source ("Knowledge · price-sheet.pdf" with `book-open` 12) |
| Utterance | `read-15` `text`; rows with `lang` hi, mr or ne switch to `read-15-deva` (15/26) so matras never collide; Hinglish (`hi-Latn`) stays Latin at `read-15` |
| System row | one line, no speaker: icon 14 + `meta-12` `text-3`, indented to the text column ("Knowledge lookup · price-sheet.pdf · 2 passages", "Transferred to a person", "Moved to step 4 · Book site visit") |

**TurnRow states.**

| State | Treatment |
|---|---|
| Partial (interim) | utterance in `text-3`, always ending in "…"; header "speaking…"; replaced in place by the final text (colour change over `--dur-fast`, no other motion); never announced, never copied |
| Final | `text` |
| Active (playing, review mode) | `accent-soft` fill + `--bw-strong` inset `accent-mark` bar (the selection treatment), header "Playing", `aria-current="true"` |
| Search match | `<mark>` in `accent-soft` with `accent-soft-text`; the header shows "2 of 7" with previous and next |
| Redacted | sensitive digits spoken on the call read "•••• (redacted)" in `text-3` |
| No per-turn language | turn language marks are hidden; the feed header shows the call's languages once (P1) |

**Feed anatomy and behaviour.**

| Part | Tokens and rules |
|---|---|
| Header | height `space-48`; padding `0 space-8 0 space-16`; bottom hairline; "Transcript" `title-14` (`h2` or `h3`); a Tag for the feed state (Streaming · info, Reconnecting… · warning, Ended · neutral); tools: Search (opens a field in the header; ⌘F inside the panel), Copy transcript (final turns with speakers and timecodes), `⋯` (Download .txt, "Read new turns aloud" switch) |
| Body | the scroll region; an `<ol>` of turns; `overscroll-behavior: contain` |
| Follow mode | the feed follows the newest turn while it is pinned (scrolled within `space-48` of the bottom). Any user scroll up (wheel, touch, keys, scrollbar) unpins it, and so does an active text selection inside the feed |
| Jump to latest | while unpinned, a small secondary Button "Jump to latest · 2 new" (`arrow-down` 16) floats centred at `bottom: space-12`, `e2`, `z-float`; the count is final turns received since unpinning; click or End scrolls to the bottom (`behavior: smooth`, or `auto` under reduced motion) and re-pins |
| Announcements | final turns only, at most one per `--timing-announce-throttle` (2 s); when several arrive, the latest is read with "and 1 more" ("Caller: Saturday ho sakta hai, but morning mein."); switchable in `⋯`, on by default. The feed is **not** `role="log"` (its implicit live region would read every interim update) |
| Long calls | virtualised above 500 turns (TanStack Virtual), with `aria-setsize` and `aria-posinset` on items |

**Feed states.**

| State | Copy and treatment |
|---|---|
| Idle (Cockpit, no call) | "The transcript appears here when a call starts." `body-14` `text-2`, centred; nothing animates (replaces "Awaiting connection…", F-VIS-023) |
| Connecting | "Waiting for the first words…" |
| Streaming | turns append; Tag "Streaming" |
| Reconnecting | a warning Notice at the top: "Transcript paused while the line reconnects. Missing turns will fill in." Existing turns stay |
| Error | a danger Notice: "Transcript stopped updating. The full transcript will be ready after the call." + Retry |
| Ended | a footer row: "Call ended · 02:31 · Summary ready" linking to the call report; timecodes become seek buttons if a recording exists |
| Review (Call reports) | full transcript, synced with RecordingPlayer (§12.5); the transcript is the default tab of the call detail sheet (F-UX-010) |

**Keyboard and ARIA.** `<section aria-labelledby="{header id}">`; turns are `<li lang>` inside `<ol aria-label="Transcript">`; step links are named "Open step: Ask about a site visit"; timecode buttons "Play from 00:41". End jumps to the latest turn and re-pins; Home goes to the first. The Search field traps nothing; Esc closes it and returns focus to the Search button.

**Responsive.** At a container width of 480 px or more, the 56 px gutter layout. Below it (phones, narrow panels) the gutter disappears and the timecode leads the header line; padding `space-12 space-16`. In the phone Cockpit the call card stacks above the feed and Take over / End call sit in a sticky 44 px bar (Cockpit page spec).

**Motion.** Only scrolling in follow mode, and the partial-to-final colour change. No typing effect, no per-word fade, no bouncing Jump button.

**Content.** Speakers: the agent's name, "Caller", "You". Steps in plain words, never node ids. Sources name the document. Transcripts are content in the language spoken and are never machine-translated in place (`lang` set per row, `translate="no"` on names).

| Do | Don't |
|---|---|
| Rows with a timecode gutter, speaker, language and step | Chat bubbles, or "TRANSCRIPT FEED" caps over an empty white column (F-VIS-029) |
| Pause following when the operator scrolls up, and offer Jump to latest | Yanking the operator back to the bottom on every turn |
| Announce final turns, throttled | Silent transcripts (F-A11Y-014) or a live region that reads every interim word |

**Resolves:** F-A11Y-014, F-UX-010, F-VIS-023, F-VIS-029, F-UX-003 (only what was said), digest §5.7 item 3, direction §6.2 and §6.4.

```tsx
type Turn = { id: string; speaker: 'agent' | 'caller' | 'operator' | 'system'; name?: string;
  startMs: number; endMs?: number; text: string; lang?: string; final: boolean;
  step?: { id: string; label: string; href: string }; source?: { kind: 'knowledge' | 'crm'; label: string; href?: string } };
<TranscriptFeed mode="live" turns={turns} callLanguages={['hi', 'en']} perTurnLanguage={hasTurnLang}
  state={feedState} onRetry={retry} announce={prefs.readTurnsAloud} />
<TurnRow turn={turn} mode="review" active={turn.id === activeId} onSeek={(ms) => player.seek(ms)} />
```

### 12.5 `RecordingPlayer` and `TalkStrip`

**Purpose.** Replay a call and move through it by who was speaking, with the transcript following. **Use** at the top of the call detail sheet's Transcript tab and in Meetings notes. **Don't** draw a waveform or talk strip that is not computed from the recording or from per-turn timing (P1); when neither exists, a plain track is honest.

**Anatomy.**

```
[❚❚] [↺5] [↻5]  00:41 / 02:31                       1× ▾  [⋯]
▬▬▬  ▬▬▬▬  ▬▬▬|▬      ▬▬▬▬▬       ▬▬▬▬      ▬▬▬      agent lane
    ▬          ▬▬▬         ▬▬▬         ▬▬      ▬▬▬   caller lane
Agent 58% · Caller 42% · 9 turns · 1 interruption          Recording disclosed at 00:01
```

| Part | Tokens |
|---|---|
| Player | `surface`; 1 px `border`; radius-8; padding `space-12 space-16`; grid gap `space-10` |
| Controls row | flex, gap `space-8`, wraps; Play/Pause IconButton `line` 32 (44 on touch); Back 5 s and Forward 5 s IconButtons (`rotate-ccw`, `rotate-cw`); time "00:41 / 02:31" `meta-12` `text-2`, tabular (`Timecode`); speed ghost small Button "1×" with a Menu (1×, 1.25×, 1.5×, 2×; remembered per user); `⋯` with "Download recording…" (explicit, masked, logged) and "Copy link at 00:41" |
| TalkStrip scrubber | two lanes, each `space-6` tall, gap `space-4`, padding-block `space-6`; lane track `surface-2`, radius-2; one segment per turn in `--talk-agent` (agent lane, top) or `--talk-caller` (caller lane, below), radius-2, min width 1 px; overlaps show in both lanes (that is an interruption) |
| Playhead | a `--bw-strong` line in `text` across both lanes with a `space-10` square handle, radius-2 (only avatars, the live dot, switches and capsule ends are fully round), ringed by `--bw-strong` of `surface` |
| Waveform variant | bars from the recording's real peaks (server-computed buckets): gap 1 px, radius-2, height `space-32`, unplayed `--chart-other`, played `accent-mark` |
| Track variant | a `space-4` track in `surface-3`, played fill `accent-mark`, radius-2, same handle |
| Legend | `meta-12` `text-3`, tabular: swatches (`data-mark`) "Agent 58%", "Caller 42%", "9 turns", "1 interruption", then "Recording disclosed at 00:01" on the right |

**Scrubber choice:** TalkStrip when per-turn timing exists, else Waveform when peaks exist, else Track. In the live Cockpit card the same TalkStrip grows in real time, with the still-speaking segment at `--opacity-partial` and the playhead as the now-marker (direction §6.2).

**States.**

| State | Treatment |
|---|---|
| Loading | Play `aria-disabled` with "Loading recording…" beside the time |
| Ready / paused | Play icon; "00:00 / 02:31" |
| Playing | Pause icon; playhead moves with real playback time |
| Buffering | "Buffering…" after the time (no spinner) |
| Ended | Play becomes Replay (`rotate-ccw`) |
| Error | a danger Notice "Couldn't load the recording." + Retry; the transcript stays usable |
| Unavailable | an info Notice with the reason: "No recording for this call. Recording is off for browser tests. The transcript is still available." (F-UX-011); the header no longer promises recordings that don't exist (F-UX-010) |

**Keyboard.** The player is `role="group"` with `aria-label="Recording"`. The scrubber is `role="slider"` with `aria-valuemin="0"`, `aria-valuemax` = duration in seconds, `aria-valuenow`, and `aria-valuetext="00:41 of 02:31, Vaani speaking"`; ←/→ move 5 s, Shift+←/→ 15 s, PageUp/PageDown 30 s, Home/End to the ends. Space or K plays and pauses while focus is inside the player but not on a button (buttons keep native Space). Enter on a turn's timecode seeks there and plays. Media keys work through the Media Session API. Nothing is global: the player never grabs Space from the page.

**Transcript sync.** The turn containing the current time is `active` (§12.4) and is scrolled into view while "Follow playback" is on; a user scroll pauses following and shows a "Follow playback" button, the same pinning rule as the live feed. Seeking from a turn keeps following on.

**ARIA.** Play/Pause changes its name ("Play" ↔ "Pause"); the time display is not live; nothing is announced during playback.

**Responsive.** Desktop and tablet: inside the 560 px call detail sheet, above the transcript. Phone: sticky at the top of the full-screen sheet, controls at 44 px; below a 360 px container, Back and Forward 5 s move into `⋯`; the legend wraps.

**Motion.** Only the playhead, driven by real playback. Seeking jumps without easing. Reduced motion changes nothing here (it is state, not decoration).

**Content.** "1×", "1.25×"; "Download recording…" ends in "…" because it confirms masking and logs the download; the disclosure time is always shown when a recording exists.

| Do | Don't |
|---|---|
| A talk strip from per-turn timing, or real peaks, or a plain track | A plausible-looking fake waveform (direction P1) |
| Transcript first, player on top of it | Recording and transcript at the bottom of a 373 px panel with nested scrolling (F-UX-010) |
| Explain why there is no recording | "No call recordings yet" with no reason beside 121 calls (F-UX-011) |

**Resolves:** F-UX-010, F-UX-011, F-A11Y-002 (keyboard reach inside the call), digest §5.7 item 8, direction §6.4.

```tsx
<RecordingPlayer src={call.recordingUrl} durationMs={call.durationMs}
  turns={turns /* per-turn timing → TalkStrip */} peaks={call.peaks /* → Waveform */}
  disclosedAtMs={call.recordingDisclosedAtMs} unavailableReason={call.recordingOffReason}
  onTimeUpdate={setCurrentMs} speed={prefs.playbackSpeed} onSpeedChange={setSpeed} />
```
Built on a native `<audio>` element (no custom decoder); the scrubber on Radix `Slider` with a custom track that renders the lanes; the talk-strip geometry is computed once per call from turn start and end times.

---

## 13. Traceability: finding → component

| Finding | Severity | Resolved by (section) |
|---|---|---|
| F-UX-001 org setup dead end · F-UX-006 "You're live" too early | critical · high | SetupCard in sidebar, NavSheet and MoreSheet; "Live" only after checks (§1.2, §1.8) |
| F-UX-002 / F-QA-004 Top up opens Profile · F-UX-028 banner on every page | high · medium | Wallet chip and nav badge link to `/billing?topup=1`; no global banner (§1.5, §1.6) |
| F-UX-003 demo intel beside a real lead | high | KeyValueList "Not captured" + source notes; CallHeader shows only this call (§8, §12.1) |
| F-UX-004 permanent "FLOW VALIDATED" · F-UX-005 no "what is live" | high · medium | Computed validation and lifecycle StatusTags (§5.3) |
| F-UX-007 / F-RWD-005 rail clips items at laptop heights | high | Sidebar ≥1280, rail 1024–1279, short-height mode, vertical-only scroll, current item scrolled into view (§1.2, §1.4) |
| F-UX-008 / F-RWD-001 phones reach 6 of 12 | high | BottomBar + MoreSheet, 12 of 12, Sign out in More (§1.8) |
| F-UX-009 17-column table, 50 of 121, mouse-only rows | high | Priority columns, Captured column, pinned columns, server pagination, focusable rows (§7.5–§7.11) |
| F-UX-010 transcript buried in a 373 px panel | high | Transcript tab first, player on top, one scroll container (§12.4, §12.5) |
| F-UX-011 metrics disagree, recordings unexplained | high | Shared metric definitions and `deltaTone`; recording unavailable reason (§4.7, §12.5) |
| F-UX-013 / F-A11Y-004 `c` dials a real call | high | "Call…" and `C` open the Call gate; shortcuts scoped and switchable (§7.8, §7.9) |
| F-UX-014 pickers save the default silently | medium | VoicePicker with separate "Make default" (§12.3) |
| F-UX-017 names, keyboard and active state inconsistent | medium | One nav config; `aria-current` by route prefix (§0.7, §1.3) |
| F-UX-018 fake "SYS: ONLINE" and latency | medium | Status footer removed; LineQuality only during calls, measured (§1.5, §12.2) |
| F-UX-026 CONNECT vs Test Call unexplained | medium | CallHeader states and LineQuality explanation (Cockpit page owns the call options) (§12.1, §12.2) |
| F-UX-029 no identity; unguarded sign-out | medium | WorkspaceSwitcher, AccountMenu, "Sign out…" confirmed (§1.2) |
| F-UX-030 no shell while loading; zeros as data | medium | Persistent shell; skeletons, never 0 (§1.14, §2.4, §4.6, §7.12) |
| F-UX-031 / F-QA-016 state not in the URL | medium | `useUrlState` for views, filters, sort, page, open record, sheet tab (§0.7) |
| F-UX-032 Delete under Call, stale drawer history · F-UX-035 destructive beside routine | medium | Destructive only in `⋯`; Timeline stale flags (§7.8, §10.4) |
| F-UX-036 range toggle scope unclear, stale cache | medium | One range in the header; "Showing data from…" (§3.9, §11.9) |
| F-UX-038 stale meeting rooms | medium | Meeting room StatusTag "Stale" (§5.3) |
| F-UX-042 / F-QA-023 empty audit ledger | medium | Timeline empty-audit state with retention (§10.4) |
| F-UX-046 no Mixed chip, wrong empty copy, blanks sorted first | low | Views incl. Mixed and Unscored; filtered-empty copy; blanks last; field · step labels (§3, §7.6, §7.7, §7.12) |
| F-UX-047 two equal primaries | medium | At most one primary per header (§2.2) |
| F-VIS-002 / F-A11Y-008 type below 12 px | high | 12 px floor everywhere, and the rem-base defect fixed (§0.4, §0.6) |
| F-VIS-005 no shared page header · F-VIS-034 no container | medium · low | PageHeader variants aligned to containers (§2) |
| F-VIS-009 Leads 44 % chrome, dead column | medium | Real table, chrome budget, density (§7.3, §7.4) |
| F-VIS-010 Analytics decoration inverts hierarchy | medium | One H1 style; chart titles as questions; no § markers (§2, §11.13) |
| F-VIS-011 deltas by sign, mustard neutral | medium | `deltaTone` by desirability; grey neutral sentiment (§4.7, §11.5) |
| F-VIS-012 distorted sentiment chart | medium | 1:1 drawing, 12 px labels, nice ticks, legend (§11.3–§11.6) |
| F-VIS-013 truncation with no way to read | medium | Truncation tooltips + detail sheet; BarList labels (§7.3, §11.11) |
| F-VIS-015 rail labels clipped | medium | Portal tooltips on hover and focus (§1.4) |
| F-VIS-016 no card, radius or elevation scale | medium | Card and tile tokens (§4) |
| F-VIS-017 20 badge styles · F-VIS-027 pill noise | medium · low | One Tag, one domain map, one tag per cell (§5) |
| F-VIS-023 seven empty-state styles | medium | Table, chart, timeline and feed states (§7.12, §10.4, §11.9, §12.4) |
| F-VIS-024 date and duration formats vary | medium | `lib/format.ts` (§0.7, §8) |
| F-VIS-029 STANDBY ring · F-VIS-030 call actions unclear | low | Call state components; no idle animation (§12.1) |
| F-VIS-032 sidebar polish · F-VIS-033 tablet sidebar pushes content | low | Grouped nav, Theme radio items, overlay rail and NavSheet (§1) |
| F-A11Y-002 call details mouse-only (critical) · F-A11Y-010 Leads rows | critical · medium | Focusable rows, Enter opens the sheet, Esc returns focus (§7.8, §7.9) |
| F-A11Y-012 no skip link, two stops per nav item | medium | Skip link; one stop per item; one stop for the table body (§1.9, §7.9) |
| F-A11Y-013 same title everywhere, silent routes | medium | `<title>` from config; focus to H1 (§1.9, §2.5) |
| F-A11Y-014 status changes not announced | medium | Shell announcer: counts, selection, call state, final turns (§0.7, §12) |
| F-A11Y-016 toggle states visual only | medium | Radio groups, `aria-pressed`, `aria-expanded`, check cues (§3, §12.3) |
| F-A11Y-017 nav semantics | medium | Labelled navs, `aria-current`, real tooltips (§1.9) |
| F-A11Y-018 table structure | medium | `<table role="grid">`, scope, `aria-sort`, caption, named action column (§7.14) |
| F-A11Y-019 low-contrast chips, dash fillers | medium | Status tints ≥5.47:1; solid empty-cell text (§5.2, §7.3) |
| F-A11Y-022 animations ignore reduced motion | medium | Only the live dot and real meters move; both stop (§5.4, §12) |
| F-A11Y-023 small targets · F-A11Y-024 unnamed icon buttons | medium | 24 px minimum, 44 on touch; names include the row (§7.3, §7.14) |
| F-A11Y-030 label-in-name, headings, order | low | DOM order = visual order; headings for panels (§2.5, §12.4) |
| F-RWD-002 Cockpit hides state at narrow widths | high | CallHeader and the TopBar chip at every width (§12.1) |
| F-RWD-004 / F-RWD-010 Call reports on phones | high · medium | ListRow, full-screen sheet, KPI strip (§4.8, §7.13) |
| F-RWD-007 / F-RWD-008 headers push the page sideways | medium | Wrapping header, overflow menu, `overflow-x: clip` (§2.7) |
| F-RWD-009 / F-RWD-012 search and chips overflow | medium | FilterBar responsive rules (§6.7) |
| F-RWD-011 Leads on phones | medium | ListRow keeps status and language; no row call button (§7.13) |
| F-RWD-016 Knowledge table clips actions | medium | Pinned actions column; ListRow below 768 (§7.5, §7.13) |
| F-QA-005 50 of 121 calls | high | Server pagination, server search, sort and filters (§6.3, §7.11) |
| F-QA-006 two legs per test call | high | "calls, not legs" scopes; "2 legs" disclosure (§4.5, §8) |
| F-QA-014 / F-QA-015 KPI and count scopes | medium | Server aggregates; scope lines; pipeline-wide view counts (§3.2, §4.5) |
| F-QA-019 funnel without fills | medium | Funnel component with linked, numbered steps (§11.11) |
| F-QA-037 stale queued calls | low | "Timed out" status and stale Timeline items (§5.3, §10.4) |

---

## 14. Acceptance checks (add to CI and visual regression)

| Area | Check |
|---|---|
| Foundations | `getComputedStyle(html).fontSize === '16px'`; an element with `font: var(--type-meta-12)` computes to `12px` (§0.6) |
| Shell | On 1366×768 and 1280×720 laptops, tested at their inner viewports 1366×657, 1366×625 and 1280×609 (`05-responsive` §2.1), all 12 destinations are visible without scrolling the sidebar; no horizontal scrollbar in sidebar or rail at 1024, 1280, 1440, 1920; rail tooltips appear on keyboard focus; the phone MoreSheet lists every destination not in the bar; the skip link is the first tab stop; one tab stop per nav item |
| Page header | No horizontal page scroll at 320, 360, 390 on any page; the primary action is visible at every width |
| Table | Keyboard e2e: Tab to the table, ↓↓, Enter opens the sheet, Esc returns focus to the same row (F-A11Y-002); with 120 fixture calls the oldest is reachable through the pager (F-QA-005); pressing `c` never sends a call request; blanks sort last; header and cell edges align (visual test); a pasted URL restores view, filters, sort, page and the open record |
| Tags and charts | Every tag and chart pair is in `check-contrast.mjs`; chart labels are ≥12 px at 390 and 1920; "View as table" exists on every chart |
| Transcript and player | Scrolling up pauses following and shows Jump to latest; at most one announcement per 2 s; Devanagari turns have no colliding matras (visual); Space does not start playback unless focus is inside the player |
| Motion and colours | Under `prefers-reduced-motion: reduce` no element animates except opacity fades; under `forced-colors: active` focus, selected rows, current nav items, the live dot and legend swatches stay visible |
| Gallery | `spec/components/data-nav.html` renders both themes with no console errors and no horizontal scroll at 390 |

---

## 15. Open questions for the product owner

1. **Foundations fix:** closed. `base.css` keeps the root at 100 % and CT-03 asserts it (§0.6).
2. **Line quality thresholds** (§12.2): confirm the Good / Fair / Poor boundaries and which leg is measured for phone calls (agent media leg vs carrier leg).
3. **Single-key shortcuts default:** on (current behaviour, now safe because `C` only opens the gate) or off for new users.
4. **Saved views:** personal only, or shareable with the workspace; who may edit a shared view.
5. **KPI desirability** (§4.7): confirm per metric, especially average duration and spend (proposed neutral).
6. **Phone calling from lists:** this spec removes the per-row Call button on phones (calls start from the sheet or the bulk bar). Confirm with sales operations.
7. **Backend data for voice components:** per-turn timestamps and language (direction §8 item 7) decide whether TalkStrip and per-turn marks show; confirm whether recordings get server-computed peaks for the Waveform variant.
8. **Transcript read-aloud default:** on by default (proposed) or opt-in.
9. **Recording downloads:** which roles may download, and whether downloads are masked (digest §5.7 item 9).
10. **Hindi chrome (v2):** bottom-bar labels were measured in English only ("Call reports" fits 320 px by under 1 px); Hindi labels will need a re-measure and possibly two-line labels.
11. **Sidebar collapse at ≥1280:** keep the remembered collapse to the rail (§1.4) or always show the labelled sidebar at that width.
12. **Token requests** (§0.5): closed. All are in `tokens.json` 1.1.0 and registered in 01-foundations §18.
