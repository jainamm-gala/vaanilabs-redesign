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
