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
