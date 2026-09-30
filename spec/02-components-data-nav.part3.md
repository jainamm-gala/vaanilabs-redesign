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
