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
