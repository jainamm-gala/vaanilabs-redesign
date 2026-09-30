## 6. Components and configuration

Component names are those of the component specs: **core** (`02-components-core.md`), **data-nav** (`02-components-data-nav.md`) and **overlay** (`02-components-overlay-feedback.md`). "New" marks a part specified in §14.

### 6.1 Shell, notices and the Baseline

| Part | Component | Configuration on Leads |
|---|---|---|
| Frame | `AppShell` (data-nav §1) | `navId="leads"`; `<title>` "Leads · Vaani Labs", or "Lead 1042 · Leads · Vaani Labs" while a sheet is open; nav badge `count` "18 due" (callbacks due today, B5) |
| Status band | `Baseline` (shell part 3 §5; rendered by the shared component, never composed here) | The shell §5.2 strings: `Live v7 · Site-visit qualifier` · `Inbound +91 80 •••• 2210 · Ready` · `Wallet ₹2,340.50 · about 16 h of calls` · Activity only while something runs (a batch from this page: `Batch · 12 of 40 placed` → Cockpit) · Shortcuts · Search |
| Wallet | `WalletNotice` (overlay §10.2), `page="leads"` | Leads spends money, so rung 3 applies: Low (warning), Empty (warning), Autopay failed (danger), Payment pending (info). Dismissible for 24 h per state. Top up opens `/billing?topup=1` |
| Setup | `Notice` tone `warning`, scope `page` | Only when calling is blocked by setup: "**Calls can't be placed yet.** Verify your calling number to call leads. Finish setup (3 of 5)" with the link to `/home`. When both this and a WalletNotice apply, one page notice shows the most severe condition plus "and 1 more" (overlay §10.1) |
| Offline | `ConnectionBar` (overlay §10.3) | The only app-wide bar; network actions on this page carry "You're offline" |
| Toasts | `Toaster` (overlay §9) | Bottom right above the Baseline; the kinds used here are listed in §7.7 |

### 6.2 PageHeader

`PageHeader` (data-nav §2), variant `page`:

| Slot | Value |
|---|---|
| H1 | "Leads" from `lib/nav.ts` (`title-20`, `tabindex="-1"`) |
| Meta | `{formatCount(stats.views.all)} leads · synced {formatWhen(synced_at)}`, e.g. "1,284 leads · synced 11:24 am". Loading: skeleton bar. Counts failed: "Couldn't load counts · Retry". Stale for more than 5 min: "· updated 11:24 am" + ghost **Refresh** in `⋯` |
| Tertiary | **Export** (`download` 16) → Export popover (§6.13). Hidden when the workspace has no leads |
| Secondary | **Import…** (`upload` 16) → Import dialog (§6.12). One label for CSV and XLSX (today "IMPORT CSV" although XLSX is accepted) |
| Primary | **New lead** (`plus` 16) → New lead dialog (§6.11). Tooltip "New lead" + `Kbd` N |
| Overflow `⋯` | Only when it has items: Refresh (stale), Import history (past imports with results), Keyboard shortcuts |

Below 1024 the header row keeps meta, `⋯` and New lead; Export and Import… fold into `⋯` (data-nav §2.7). On phones the primary reads "New" (`labelShort`) and a **Select** tertiary button precedes it (§5.5).

### 6.3 ViewSummary (pipeline KPIs)

`ViewSummary` (**new**, shared with Call reports; defined in `04-call-reports-analytics` §4.1, configured here). A 32 px line under the toolbar, `meta-12` `text-3`, tabular numbers, values in `text-2` and `--fw-medium`. It replaces today's KPI strip, which described the loaded page (F-QA-015). Every value comes from `GET /api/leads/stats` with the current view, search and filters, never from the loaded rows.

`In this view · {leads} leads · {open} open · {reached} reached ({reached_pct}) · {interested} interested · {converted} converted · avg interest {avg}`

| Item | Definition (`lib/metrics.ts`, shared with Analytics) | When it is not shown |
|---|---|---|
| leads | Leads matching the view, search and filters | never |
| open | Status is not Converted, Not interested or Do not call | B2 missing |
| reached | Leads with at least one connected conversation (talk time > 0). Conversations, not legs; test calls excluded (F-QA-006) | B2 or B6 missing |
| interested | Status Interested | B2 missing |
| converted | Status Converted | B2 missing, or 0 in the whole workspace |
| avg interest | Mean Interest score over scored leads in the view; the tooltip says "Across 412 scored leads" | fewer than 5 scored leads: the item reads "interest not scored yet" |

- The line starts with "In this view" when a view other than All, a search or a filter is active; with All and nothing else, it starts "All leads".
- An `info` IconButton at the end opens an `info` Popover with the definitions above in plain sentences.
- Items drop from the end when the line would wrap (avg interest, converted, open); the Popover always lists all of them.
- Loading: the line keeps its words and skeletons only the numbers. Error: "Couldn't load the summary · Retry" in `text-3`.
- Announced: no. The result count (§6.5) is the announced number.

### 6.4 ViewTabs

`ViewTabs` (data-nav §3), `aria-label="Views"`, controls the table, manual activation, counts from `stats.views` (pipeline-wide, F-QA-015). Counts render nothing while loading, never `0`.

| View | Server definition | Default sort | Column preset | "All done" copy (EmptyState `done`) |
|---|---|---|---|---|
| **All** | Every lead | Last call, newest first (never-called leads after the called ones) | P1–P3 | n/a (first-use state instead, §7.1) |
| **New** | Status New | Created, newest first | + Created (P4) | "No new leads. Leads you add or import start here." |
| **Callbacks due** (B5) | Status Callback due and `callback_at` before the end of today, IST (overdue included) | Callback, earliest first | + Callback (P4); Last call hidden | "No callbacks due today." + link "See upcoming callbacks" (adds the filter Callback: next 7 days) |
| **Interested** | Status Interested | Interest, highest first | P1–P3 | "No interested leads yet. Leads your flows mark Interested appear here." |
| **Not reached** (B4) | Last call result is No answer, Busy, Voicemail, Failed or Timed out, and status is not Converted, Not interested or Do not call | Last call, **oldest** first (retry whoever has waited longest) | P1–P3 | "Everyone in your pipeline has been reached." |
| Saved views | A named snapshot of search, filters, sort and columns | Saved | Saved | Filtered-empty copy |

- **Save view** (ghost, `plus` 14) opens a Popover: Name (required), "Share with workspace" checkbox (admins; open question), Save. User views get a `⋯` inside the tab: Rename, Update with current filters, Copy link, Delete view… (tier 1 Undo).
- **Edited view:** when the toolbar differs from the saved view, the tab reads "Callbacks due · edited" and the FilterBar offers "Save changes to view" and "Reset" (data-nav §3.3).
- The status "Do not call" has no tab; it is reachable through Filter › Status.

### 6.5 FilterBar

`FilterBar` (data-nav §6) with `SearchField`, `FilterMenu`, `FilterToken`, `ColumnsMenu`, `DensitySwitch`:

| Part | Configuration |
|---|---|
| Search | Label "Search leads" (visually hidden), placeholder "Search name, phone or city…", `Kbd` "/" hint on fine pointers only. Server search over name, email, city and phone (any 4 or more digits match the number's end, so "0142" finds •••• 0142). `?q=` |
| Result count | "38 of 1,284", shown only when search or filters narrow the view; `role="status"`, announced "38 of 1,284 leads" after the debounce |
| Columns | `ColumnsMenu`: groups "Columns" and "Custom fields" (extra columns from imports); Lead is checked and `aria-disabled` "Always shown"; columns empty for every lead in the workspace are listed under "Empty for all leads" and off by default (F-VIS-009: Interest is empty for all 24 leads today); Reset columns |
| Density | `SegmentedControl` Standard / Compact, `Shift+D`; hidden on touch |

**Filter fields**, in the Filter menu's order (field names match column headers exactly):

| Field | Type (picker, data-nav §6.3) | Values | Notes |
|---|---|---|---|
| Status | enum | New · Contacted · Callback due · Interested · Not interested · Not reached · Converted · Do not call (`lib/status.ts`) | Combines with the view (a view's own status is not repeated as a token) |
| Source | enum | Manual · Import · Website · Facebook · Instagram · Google · WhatsApp · API · Sample data | Each value shows its brand SVG where one exists, never a letter glyph (F-VIS-031). "Demo" becomes "Sample data" |
| Language (B3) | enum | Hindi · English · Hinglish · Tamil · Telugu · Marathi · Bengali · … | Each option shows its `LanguageMark` (glyph + name, with `lang` on the glyph) |
| Last call outcome (B4) | enum | Call results (Completed, No answer, Busy, Voicemail, Failed, Timed out) and the flows' outcome labels (Visit booked, Callback, Interested…) | Grouped "Result" and "Outcome" |
| Last called | date | Presets Today · Yesterday · Last 7 days · Last 30 days · This month · Custom range… · **Never called** | IST |
| Callback (B5) | date | Overdue · Today · Next 7 days · Custom range… | |
| Interest | number | 0 to 100, min and max | "Not scored" is a separate checkbox in the picker |
| Flow | enum (FlowSwitcher list) | Workspace default · each flow by name + `Live v7` tag | Duplicate names show their short id (core §5.4, F-VIS-037) |
| Owner | enum | Teammates · Unassigned | Hidden in single-user workspaces |
| City | text | contains / does not contain | |
| Created | date | as Last called, without Never | |
| Imported from | enum | Past imports by file name and date ("leads-sept.csv · 21 Sep") | The target of "View imported leads" (§6.12) |

### 6.6 DataTable

`DataTable` (data-nav §7), `id="leads"`, frame `flush`, `labelledBy` the H1, a visually hidden caption stating the sort ("Leads, sorted by last call, newest first"), `aria-rowcount` = total + 1, `aria-multiselectable="true"`, `getRowHref = /leads?lead={id}` (plus the current query).

**Columns** (widths are minimums at Standard density; Lead absorbs spare width):

| Column | Pri. | Min width | Cell (data-nav §7.3) | Sort (first direction) | Empty value | Phone (ListRow) |
|---|---|---|---|---|---|---|
| Select | — | 40 | Checkbox, label "Select Lead 1042"; header "Select all leads on this page" (mixed state) | — | — | selection mode only |
| **Lead** | P1, pinned left | 160 | Key link, `data-13` `--fw-medium` `text`, `translate="no"`, ellipsis + tooltip | Name A–Z | "Unnamed lead" `text-3` | title |
| Phone | P2 | 160 | `PhoneText` (data-nav §5.8): `data-13` tabular "+91 •••••• 0142", accessible name "Phone ending 0142" | — | never empty (phone is required) | meta ("•••• 0142", `meta-12` tabular) |
| **Status** | P1 | 136 | One `StatusTag` domain `lead` (word + icon) | Pipeline order: New, Contacted, Not reached, Callback due, Interested, Converted, Not interested, Do not call | — | titleTrailing |
| **Last call** | P1 | 184 | "Outcome · when" (`text-2` outcome, `text-3` time in `<time>`); during a call a compact `CallStateTag` (Dialling…, Ringing…, Live with the pulsing dot); after the reaper window a `StatusTag` "Timed out" (warning) | Newest first; blanks last | "Not called yet" `text-3` | meta ("Visit booked · 10:42 am") |
| Interest | P2 | 96, right | Number + 40×4 meter (track `surface-3`, fill `text-2`, never Neel); `aria-label` "Interest 82 of 100" | Highest first; blanks last | "Not scored" `text-3` | not shown (sheet and Sort) |
| Language (B3) | P3 | 120 | `LanguageMark` `name` (plain text, no glyph tile) | — | "Not set" `text-3` | metaTrailing |
| Flow | P3 | 160 | Flow name + version in `text-2`, `translate="no"`, truncated at 20ch; "Workspace default" in `text-3` when the lead has no override; outline Tag "Not published" when the assigned flow has no live version | A–Z | "Workspace default" | not shown |
| Callback (B5) | P4 | 152 | `formatWhen` in IST; overdue: `clock` 12 + "Overdue · Yesterday 6 pm" in `warning-text` | Earliest first | "–" | meta in Callbacks due view |
| Source | P4 | 128 | Brand SVG (where one exists) + word | — | — | — |
| Owner | P4 | 140 | `Avatar` 20 + name | A–Z | "Unassigned" `text-3` | — |
| City · Email · Created · Calls | P4 | 120 · 180 · 120 · 72 right | text · text · `formatWhen` · count | A–Z · — · newest · most | "Not captured" `text-3` | — |
| Actions | pinned right | 104 | "Call…" (`secondary` `sm`, `phone` 14) + `⋯` IconButton "More actions for Lead 1042"; column header named "Actions" (visually hidden) | — | — | none |

**Fit-by-priority** (an extension of data-nav §7.5, see §14): the table measures its own container (a container query, not the viewport) and adds columns in this order while their minimum widths fit: P1 (624 px with Select and Actions) → Phone (784) → Interest (880) → Language (1,000) → Flow (1,160). So: 1440 wide with no sheet shows everything; 1366 and 1280 drop Flow; 1024 with the rail shows P1 + Phone + Interest; 1440 with the docked sheet, and 768 tablets, show P1 only. Columns the user turns on in ColumnsMenu always show and create horizontal scroll with the Select, Lead and Actions columns pinned (data-nav §7.5).

**Rows** follow data-nav §7.8 exactly (default, hover `--row-hover`, selected `--row-selected` + 2 px `--row-selected-bar`, selected + hover, focus with `--focus-offset-inset`, open with `aria-current="true"`). Rows are solid `surface`; no texture shows through (F-VIS-022). Status updates arriving while the page is open (an Outcome step wrote "Interested") update the cell in place without animation and are not announced unless the row is the focused one.

**Row actions:** "Call…" opens the Call gate for that lead (§6.10). `⋯` menu: Open lead · Copy link · Set status ▸ (submenu) · Assign flow… · Add note… · separator · Delete lead… (`danger-text`). Disabled "Call…" states keep the button focusable with the reason in its tooltip: "Marked Do not call", "Wallet is ₹0. Top up to place calls.", "No verified caller ID. Verify one in Settings › Phone setup.", "No live flow. Publish a flow to call leads.", "You're offline".

### 6.7 Selection and BulkBar

`BulkBar` (data-nav §7.10), `role="toolbar"`, `aria-label="{n} leads selected"`:

| Slot | Configuration |
|---|---|
| Count | "2 selected"; after a full page is selected, a link "Select all 1,284 leads in All" switches to a server-side selection ("All 1,284 selected · Clear selection") |
| Primary | **Call {n} leads…** (`phone` 14) → Call gate. With a server-side selection: "Call 1,284 leads…" |
| Secondary | **Set status ▾** (Menu of statuses; "Do not call…" last, after a separator, because it has a confirm) · **Assign flow ▾** (FlowSwitcher `assign`: "Use workspace default", then live flows; unpublished flows disabled with "Not published yet. Publish it to use it for calls.") · **Export** (→ Export popover with "Selected (2)" preselected) |
| Overflow `⋯` | Add note to {n} leads… · separator · **Delete {n} leads…** (`danger-text`) |
| Clear | IconButton `x` "Clear selection", `aria-keyshortcuts="Escape"` |

| Bulk action | Guard (overlay §3.1) | Result |
|---|---|---|
| Set status (not Do not call) | Tier 1: immediate + Undo toast | "Set 12 leads to Contacted · Undo" |
| Set status Do not call | Tier 2 ConfirmDialog: "Mark 12 leads Do not call? They're skipped by every future call and batch. You can change this later." · Cancel · Mark Do not call | Toast "Marked 12 leads Do not call" |
| Assign flow | Tier 1 | "Assigned Site-visit qualifier to 12 leads · Undo". Assignment points at the flow; calls use its live version at call time, which the Call gate names |
| Export | none (read-only) | Download or progress toast (§6.13) |
| Delete ≤ 50 leads | Tier 1 with soft delete (B9); tier 2 without | "Deleted 12 leads · Undo" |
| Delete > 50 leads, or any server-side "all" selection | Tier 3 typed: "Type 1,284 to delete" | ConfirmDialog names what is kept: "Their call reports are kept." |

Selection survives paging within the same view, search and filters; it clears, with the announcement "Selection cleared", when any of them change (data-nav §7.10). The BulkBar never takes focus on its own.

### 6.8 Pager

`Pager` (data-nav §7.11): "1–50 of 1,284 leads" (`role="status"`), Rows per page 25 · 50 · 100 (default 50, remembered per user), "Page 1 of 26", Previous and Next IconButtons. `?page=&size=` with `pushState`, so Back returns to the previous page (F-QA-016). On a page change the table scrolls to its top and focus stays on the pager button.
