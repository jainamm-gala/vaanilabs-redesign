---

## 5. Component adaptation

### 5.1 The adaptation table

One row per component, by spec name. "=" means the same as the column to its left. Values not shown here are in the component's own Responsive section (cited).

| Component (spec) | Desktop ≥1440 | Laptop 1024–1439 | Tablet 768–1023 | Phone 320–767 | Findings |
|---|---|---|---|---|---|
| **PageHeader** (N §2.7) | H1 · meta · ≤3 actions, primary last | = | H1 → TopBar; meta + `⋯` + primary; secondary and tertiary fold into `⋯` | row 48: meta, `⋯`, primary (`labelShort`); meta wraps to its own line before anything clips | F-RWD-007, -008, -016 |
| **ViewTabs / RouteTabs** (N §3.7) | row | = | ScrollRow with edge fade | ScrollRow; selected tab kept in view | F-RWD-012 |
| … at ≤720 tall | "View: All ▾" select in the toolbar | = | = | = | D §6.1 |
| **FilterBar** (N §6.7) | one row, 3 tokens, "+n filters" | 2 tokens <1280; Columns icon-only | tokens fold into "Filter · 2" → Popover of tokens + Add filter | search full width, sticky; ScrollRow of Filter · tokens · Clear; pickers as bottom sheets with "Show 38 leads" | F-RWD-009, -012 |
| **SearchField** (N §6.2) | 280 flexible, min 160 | = | = | 100% width, 16 px text, placeholder ≤ 3 words ("Search calls…") | F-RWD-009 |
| **DataTable** (N §7.13) | P1–P3 + user columns | P1–P3 ≥1280, P1–P2 <1280 | P1 + user columns; pinned key/select left and actions right; horizontal scroll inside | **ListRow** list | F-RWD-010, -011, -016 |
| **Row actions** (N §7.8) | on hover and focus, `Call…` and `⋯` | = | always-visible `⋯` (coarse) | none in the row; in the record sheet footer or selection mode | F-RWD-011 |
| **BulkBar** (N §7.10) | floats above the pager | = | = | docked full width above the BottomBar | — |
| **Pager** (N §7.11) | sticky bottom of the data region | = | = | in flow at the end of the list; "1–50 of 121 · Next" 44 px | F-QA-005 |
| **StatGrid / StatTile** (N §4.8) | 4 across, sparklines | 4 across (min 200) | 2 across | compact tiles in a scroll-snap strip, no sparklines; or folded into the header meta (Leads) | F-RWD-004, -008, -011 |
| **ViewSummary** (`04` §4.1) | one line | truncates from the end | 3 facts | 2 facts in the header meta; wraps, scrolls away | F-RWD-011 |
| **ChartFrame** (N §11.10) | 240 plot, 2 per row | 240 / 200 | 200, 1 per row | 160; 3–4 x ticks; legend above, wraps; drawn 1:1 from a ResizeObserver, axis text HTML ≥12 px | F-VIS-012 |
| **Record sheet 440 / detail 560** (O §4.6) | docked beside content | overlay right, non-modal | modal, full height, min(560, 100%) | full screen, Back link, sticky footer, BottomBar hidden | F-RWD-004 |
| **Gate sheet** (Publish 640, Top up) | modal right 640 | = | modal full height | full screen, sticky primary above the safe area | D P3 |
| **Call gate popover** (O §5.4) | anchored 400 | = | anchored if it fits, else bottom sheet | bottom sheet, `Place call` sticky | F-UX-013 |
| **Dialog sm / md / lg** (O §2.6) | centred | = | centred, width min(size, 100% − 48) | sm → bottom sheet; md/lg → full screen, sticky header and footer | F-A11Y-005 |
| **ConfirmDialog** (O §3) | centred sm | = | = | bottom sheet; buttons stacked, primary on top, Cancel last above the safe area | — |
| **Popover** (O §5) | anchored | = | anchored if it fits | bottom sheet with title + Done | — |
| **Menu** (O §7.6) | anchored | = | anchored | anchored if ≤5 items and no danger item; else action sheet | F-UX-035 |
| **Tooltip** (O §6.5) | hover and focus | = | focus only on touch | never on touch; the content exists elsewhere (visible label, second line) | F-VIS-013, -014 |
| **CommandPalette** (O §8.6) | centred md | = | centred; from the TopBar search | full screen, results above the keyboard | — |
| **Toast** (O §9.3) | bottom right above the Baseline | = | bottom right | full width above the BottomBar | — |
| **Notice / WalletNotice** (O §10) | one line under the header | = | = | one-line pill, one CTA, 44 px Dismiss ≥8 px away | F-RWD-013 |
| **ConnectionBar** (O §10.3) | top of `main` | = | under the TopBar | under the TopBar; one line "Offline · data from 11:42 am" | F-QA-007 |
| **UnsavedChangesBar** (O §18.3) | sticky at the bottom of the form column | = | = | sticky action bar above the BottomBar (Discard · Save changes, 1:1) | F-UX-012 |
| **Field layout** (C §8.1) | 2 columns only for short pairs | = | 1 column below 600 px container | 1 column, labels above, 16 px text, `autocomplete` and `inputmode` set | RESPONSIVE-B-19 |
| **Select / Combobox** (C §5) | anchored listbox | = | = | bottom sheet with search and 48 px rows | — |
| **Date and time pickers** (C §7.1) | popover calendar | = | = | presets first, then native `input type="date"` / `time` (the platform picker), IST shown | — |
| **FileUpload / Dropzone** (C §7.2) | drop zone "Drop a file or choose one" | = | = on fine pointers; "Choose a file" on touch | full-width button "Choose a file", no drop copy | F-RWD-016, F-UX-048 |
| **SegmentedControl** (N §3.7) | inline | = | inline | full width when alone in its row; 44 px segments | — |
| **SettingsNav** (`06` §3) | 200 px column | = | SettingsIndex list → page, "‹ Settings" in the TopBar | same as tablet, full width | RESPONSIVE-B-13 |
| **TranscriptFeed / TurnRow** (N §12.4) | 56 px `mm:ss` gutter (`--size-turn-gutter`, `meta-12` tabular) | = | = | gutter 48; timecode above the speaker line when the container is <360 px; turns wrap, never truncate | F-UX-010 |
| **RecordingPlayer / TalkStrip** (N §12.5) | inline in the sheet | = | = | sticky at the top of the call sheet body; 44 px play, ±5 s buttons visible | F-RWD-004 |
| **Timeline** (N §10) | full | = | = | day headers sticky; "Load more" button | — |
| **KeyValueList** (N §8) | label beside value | = | = | stacked when the container is <360 px (container query) | — |
| **Kbd hints** (C §7.3) | tooltips, menus, `?` sheet | = | fine pointers only | never | F-UX-048, F-RWD-014 |
| **EmptyState / Skeleton** (O §13, §15) | inside the shell | = | = | same copy; skeleton rows match ListRow height | F-VIS-023 |
| **Canvas controls** (Flow, §10) | floating bottom-left + minimap | no minimap <1280 | in the bottom tool bar, 44 px | in the Map toolbar row | F-RWD-014 |

### 5.2 Tables → priority columns → list rows

- **Priority, not order, decides what shows** (N §7.5). Each page declares P1–P4; P1 must be enough to recognise and triage a record, because P1 forms the phone row. Examples: Leads P1 = Lead, Status, Last call; Call reports P1 = When, Lead, Outcome; Knowledge P1 = Name, Indexing status; Flows P1 = Name, Version state, Issues.
- **768–1023:** P1 plus any user-chosen columns. When wider than the container: the select and key columns pin left and the actions column pins right (`position: sticky`, background, 1 px edge while scrolled). This fixes F-RWD-016 (Embed and Delete unreachable at 768) and F-RWD-010 (values separated from their call).
- **Below 768: ListRow** (N §7.13), two lines, min 48 px: line 1 title + trailing status tag; line 2 meta (masked phone, outcome or size, relative time) + trailing language name or amount (never a bare glyph, N §5.6). Columns map through `meta.mobile` (`title`, `titleTrailing`, `meta`, `metaTrailing`, `hidden`). Hidden columns stay reachable in the record sheet.
- **Nothing is dropped without a home** (F-RWD-011, F-UX-048): Status and Interest move into the row (tag, and "Interest 72" in the meta line), Sentiment into the meta line with its word ("Negative"), Duration beside the time.
- **No per-row call button on phones.** Calling starts from the record sheet footer or selection mode, so a mis-tap never dials and the 32×32 flush call button of today goes away (F-RWD-011, F-A11Y-023).
- **Selection on phones** starts from a "Select" button in the header row, which shows 44 px leading checkboxes and the docked BulkBar; long-press is not used (§6.3).
- **Density:** Touch (48 rows) on coarse pointers; Compact is not offered on touch; the density switch is hidden.

### 5.3 Filter bars → sheets

- ≥1024: tokens inline (3, or 2 below 1280), "+n filters" popover.
- 768–1023: one "Filter · 2" button with the active count; it opens a Popover listing the active tokens and "Add filter".
- <768: row 1 is the search field at full width (sticky); row 2 is a ScrollRow (§5.8) with Filter · the tokens · Clear. Each picker opens as a bottom sheet with a footer button that states the result ("Show 38 leads", "Show all calls" when nothing narrows), so one query runs per decision. Sort lives in the same sheet on phones ("Sort by Last call, newest first").
- The Call reports sentiment pills that ran 12 px off-screen at 360 (F-RWD-009) become ViewTabs (All · Needs review · Positive · Negative · Mixed · Unscored) in a ScrollRow; the Leads Source and Status chip rows (F-RWD-012) become the Filter menu and ViewTabs.

### 5.4 Side panels → full-screen sheets

- The four modalities (docked, overlay, modal full height, full screen) are O §1.7. Rule for pages: **a panel never shares the phone screen with the list**. Today's call detail opens inside the table's 255 px strip (F-RWD-004); the Assistant's Plan & Actions card takes 150 px under the composer (F-RWD-015). Both become full-screen sheets or a 44 px summary bar that opens one (Assistant PlanBar, `02` §5.2).
- Full-screen sheets on phones: header 56 with "‹ Call reports" Back link at the left, title, `⋯`; one body scroller; optional sticky footer above `env(safe-area-inset-bottom)`; the BottomBar hides; Back (browser, hardware or gesture) closes the sheet because opening it pushed `?call=` (O §1.4).
- A sheet's tabs (Summary · Transcript · Data) stay tabs on phones; the RecordingPlayer sticks at the top of the body so the transcript can seek it.

### 5.5 KPI rows

- ≥1024: StatGrid 4 across. 768–1023: 2×2. <768: one scroll-snap strip of compact tiles (`num-20`, no sparkline), each ≥160 px, edge fade, and the strip scrolls away with the page.
- When a page's KPIs are really the pipeline counts of its views (Leads, Call reports), phones fold them into the ViewTabs counts and the header meta instead of a strip (Leads `03` §11).
- KPI cards never clip their value (F-RWD-008: 156 px cards clipped 160–163 px of content at 360): tiles have `min-width` and the value uses `formatCount` compact forms (₹85 L, 1.2 L) below 200 px.

### 5.6 Forms

- One column below a 600 px container; labels above; helper and error text under the field; 16 px field text on touch (F §14) so iOS never zooms on focus (F-RWD-018, RESPONSIVE-B-19).
- Every field sets `autocomplete`, `inputmode` and `enterkeyhint`: phone `tel` + `inputmode="tel"`, amounts `inputmode="decimal"`, OTP `one-time-code` + `inputmode="numeric"`, email `email`, search `enterkeyhint="search"`, the last field of a form `enterkeyhint="done"` or "send".
- Actions: on phones, the form's Save / Discard pair sits in a sticky action bar above the BottomBar (C §2 responsive); a third action goes into `⋯`. Labels never wrap ("Top / up" and "Enable / autopay" in F-RWD-013 are the anti-example); a long label uses `labelShort`.
- Validation messages appear under the field, and the field scrolls into view above the keyboard (§7.3), never only in a toast.

### 5.7 Modals

- Short creation dialogs (New lead, Rename flow) become **bottom sheets** on phones: the first field autofocuses only when the sheet was opened by a keyboard or an explicit "New" tap, and the sheet grows above the keyboard.
- Medium and large dialogs (Import, Add knowledge, template gallery, the `?` sheet) become **full screen** with a sticky header and footer.
- One modal at a time at every size (O §1.6). A confirm step inside a phone sheet replaces the sheet's footer (inline discard state), it does not stack a second modal.

### 5.8 ScrollRow (horizontal rows that are allowed to scroll)

A ScrollRow is the only sanctioned horizontal scroller outside tables and the canvas. Used for ViewTabs and RouteTabs below 1024, the phone filter row, the KPI strip, the Assistant suggestion chips (F-RWD-015) and the Billing top-up presets when they do not fit.

- `overflow-x: auto; scroll-snap-type: x proximity` (mandatory only for equal tiles); `scroll-padding-inline: var(--page-margin)`; no visible scrollbar on touch, a thin one on fine pointers.
- **Edge fade** on the side that has more: `mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent)`, toggled by `data-overflow="start|end|both"` from an IntersectionObserver on the first and last items. A fade is a cue, not a control, so it never covers a whole target.
- On fine pointers, arrow IconButtons (`chevron-left` / `chevron-right`, `aria-label="Scroll tabs"`) appear at the ends when the row overflows.
- The selected item is scrolled into view (`inline: 'nearest'`) on load and on change.
- **Never put a destructive or rare item in a ScrollRow.** Settings' 2,300 px strip ended with Delete Account (RESPONSIVE-B-13); phones get the Settings index list instead.
- Keyboard: the row is not a tab stop; its items are (tabs use roving arrows per N §3.4).

### 5.9 Headers and action overflow (the fold order)

When a header, toolbar or bar runs out of width, items fold in this order, and the primary never folds (F-RWD-003, F-RWD-007, F-RWD-008, F-RWD-016):

1. Tertiary actions → `⋯` (Refresh becomes an IconButton with `aria-label` first).
2. Secondary actions → `⋯` (Export, CSV, Export PDF, Import…).
3. Meta text wraps to its own line under the title or row (never truncated below the count).
4. Chips hide in reverse priority (TopBar rule: normal wallet, then warning wallet, never the call chip).
5. The primary switches to `labelShort` ("New task" → "New", "Call 2 leads…" → "Call 2…").

Implementation: the group is `display: flex; flex-wrap: wrap; min-width: 0`; the primary has `flex-shrink: 0; margin-left: auto`; the fold is measured with a ResizeObserver on the group (not a breakpoint), so it also works at 125% text size.
