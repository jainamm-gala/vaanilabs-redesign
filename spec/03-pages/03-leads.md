<!-- Assembled from 03-leads.part1.md, 03-leads.part2.md, 03-leads.part3.md, 03-leads.part4.md, 03-leads.part5.md, 03-leads.part6.md, 03-leads.part7.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 03-pages · 03 · Leads (`/leads`)

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** leads (`/leads`: pipeline summary, views, search, filters, shortcuts, table, selection and bulk actions, calling, import, new lead, lead sheet)
**Follows:** `spec/00-design-direction.md` (Sutradhar, especially §6.1 shell, §6.3 Leads, P3 gates), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `spec/02-components-core.md` (core), `spec/02-components-data-nav.md` (data-nav) and `spec/02-components-overlay-feedback.md` (overlay). Every component below is named as those specs name it. What they do not cover is specified in §14 "New components needed", never invented silently. The sibling page spec `04-call-reports-analytics` shares the data-page template; where both use the same new part (ViewSummary) this spec follows it.
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-RWD-…, F-A11Y-…, F-QA-…) refer to `audit/consolidated/`. Raw ids (EXPLORE-DATA-…) refer to `audit/raw/explore-data.md`. Screenshots of today's page: `audit/screenshots/scout_leads.png`, `va-explore-data/r2_leads_*.png`, `va-responsive-b/leads_*.png`, `va-qa-b/leads-*.png`.
**Privacy:** every lead in this spec and its mock is a fictional label ("Lead 1042 · Pune") with a fictional masked number. No customer or lead data from the audit appears here.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/03-leads.md`, assembled from `03-leads.part1.md` to `.part7.md` (edit the parts, then re-assemble) |
| Reference mock: A desktop with selection, B docked lead sheet with the Call gate, C gate states and Import step 2, D phone, E tablet (light and dark through the theme switch) | `spec/03-pages/03-leads.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `spec/03-pages/03-leads-desktop.png` (the whole mock, light; 1488 px viewport so the 1440×900 frames fit), `03-leads-dark.png` (frame B, 1440×900, dark), `03-leads-mobile.png` (the three 390×844 phone frames) |

**Contents.** Part 1: §0–§4 (brief, jobs, findings, URL and data, hierarchy). Part 2: §5.0–5.3 layouts to laptop. Part 3: §5.4–5.6 tablet, phone, short viewports. Part 4: §6.1–6.8 (shell to pager). Part 5: §6.9–6.13 (lead sheet, Call gate, New lead, Import, Export). Part 6: §7 states, §8 keyboard, §9 microcopy. Part 7: §10–§16 (accessibility, responsive, telemetry, acceptance, new components, questions, traceability).

---

## 0. The page in brief

**Today** (1440×900, `scout_leads.png`): a 42 px wallet banner, an 80 px header with a tracked-caps "LEADS", a 70 px KPI strip that describes the loaded page rather than the pipeline, a permanent shortcut strip, a search bar and two rows of pill chips put the first lead at y≈400, so 7 rows show (F-VIS-009). The list is a div grid with a 730 px dead column and a Status badge that sits under the Interest header. Filters are lost on reload (F-QA-016). A single `c` keypress places a billable call, and bulk "CALL 24" dials with no cost, calling-hours, DND or wallet check (F-A11Y-004, F-UX-013). The lead drawer clips its bottom 42 px, loses its header on scroll, and puts a full-width DELETE LEAD under Call Now (F-UX-032, F-UX-035). Import accepts a `.txt` file and a CSV without a phone column (F-QA-022). On phones the Status column disappears and 2–3 leads fit per screen (F-RWD-011).

**After:** one 56 px header (`Leads · 1,284 leads · synced 11:24 am` with Export, Import… and New lead), view tabs whose counts cover the whole pipeline, one toolbar row with search and filter tokens, a quiet ViewSummary line with the pipeline KPIs for exactly what is on screen, and a real table: 16 Standard rows at 1440×900, and at least 12 on a 1366×768 laptop, measured on its real 1366×657 viewport (§5.0). Every call action ("Call…", "Call n leads…", `C`, the sheet's Call…) opens the **Call gate**, which checks flow, caller ID, calling hours, wallet, DND and repeat calls, states the cost as a range, and dials nothing until **Start n calls** (or ⌘/Ctrl+Enter). The lead opens in a deep-linked 440 px sheet whose destructive actions live in `⋯`. Import becomes three steps with a column-mapping preview and row-level errors. Phones get two-line rows with status and language on every row and every one of the 12 destinations in reach.

### 0.1 What changes at a glance

| Area | Today | Redesign |
|---|---|---|
| Header | "LEADS", "24 SHOWN · 24 TOTAL", REFRESH · EXPORT · teal IMPORT CSV · NEW LEAD | PageHeader: `Leads`, meta `1,284 leads · synced 11:24 am`, Export (tertiary) · Import… (secondary) · New lead (primary) |
| Pipeline KPIs | 70 px strip, page-scoped (F-QA-015) | ViewTabs counts (pipeline-wide) + a 32 px ViewSummary line scoped to the current view and filters |
| Shortcuts | A permanent keycap strip, also on phones | Keycaps in tooltips, menus and the `?` sheet; single-key shortcuts scoped to the table and switchable |
| Filters | 8 status chips, 7 source chips, 2 native selects, not in the URL | ViewTabs (status views) + FilterBar tokens (Source, Language, Last call outcome, dates, Interest, Flow, Owner); all in the URL |
| List | div grid, 65 px rows, 730 px dead column | DataTable (`<table role="grid">`), 40/32/48 px rows by density, fit-by-priority columns |
| Calling | `c`, row phone icon, drawer Call Now, bulk CALL n: all dial immediately | All open the Call gate; Start is explicit; batches land in Cockpit › Up next as Scheduled |
| Bulk | Calling only | Call n leads… · Set status · Assign flow · Export · Delete (in `⋯`) |
| Record | Clipped `<aside>` with Delete under Call | Sheet `record` 440, deep-linked `?lead=`, tabs Overview · Calls · Notes, footer Call… |
| Import | Any file accepted, no preview | Dropzone with type and size checks → mapping preview with row checks → progress → result with skipped rows |
| Phone | Status hidden, 2–3 rows, legend shown on touch | ListRow with status and language, at least 8 rows at 360×780, no per-row dial button |

---

## 1. Purpose and jobs to be done

**Primary job.** *When I have people to reach, I want to narrow the list to the ones worth calling now and start those calls in their language with the right flow, without calling anyone twice in a day, outside calling hours, on the DND registry or beyond my wallet.*

| # | Job | Who | Where on the page |
|---|---|---|---|
| L1 | Work a queue at volume: callbacks due, not reached, new | Operator (desktop, keyboard, hundreds of leads a day) | ViewTabs → table → `X`/`C` → Call gate |
| L2 | Qualify one lead: read the last call, set status, add a note, schedule a callback | Operator, field sales on a phone | Lead sheet (Overview, Calls, Notes) |
| L3 | Bring people in | Team lead or admin | Import… (CSV or XLSX), New lead |
| L4 | Organise the pipeline: assign a flow or owner, change status in bulk, export | Team lead or admin | BulkBar, Export |
| L5 | See what happened on a call | Everyone | Last call cell → lead sheet › Calls → Call reports `?call=` |

**Not this page's job:** trends over time (Analytics), transcripts and recordings in full (Call reports), campaign objects with pacing and retries (no campaign object exists; `/campaigns` returns 404, 01-product-understanding part 6, J5). The Call gate's **Schedule** option is the only scheduling Leads offers, and the resulting batch is managed in Cockpit › Up next.

**Success signals** (telemetry in §12): 100% of call starts pass through the Call gate; zero call requests triggered by a single key; median time from landing on a view to "Start n calls" under 20 s for a returning operator; import completion rate and the share of rows skipped by reason; rows visible above the fold per viewport (visual regression, §13).

---

## 2. Audit findings addressed

| Finding | Sev. | Today on Leads | What changes | § |
|---|---|---|---|---|
| F-A11Y-004 | high | `c` places a billable call; one `window` handler; J/K highlight invisible to assistive tech; Enter on "New lead" opens a lead | `C` opens the Call gate only; shortcuts listen on the table, obey the "Single-key shortcuts" switch, never hijack Enter or Space on buttons; J/K move real focus (roving tabindex) | 6.6, 8 |
| F-UX-013 | medium | No pre-flight before bulk CALL n, row call, drawer Call Now or `C`; calling is the only bulk action | Call gate on every call entry point: blocking and advisory checks, cost range, wallet runway; bulk Set status, Assign flow, Export, Delete | 6.7, 6.10 |
| F-VIS-009 | medium | First row at y≈400; 7 rows; 730 px dead column; Status under Interest; grid texture through rows | Chrome 244 px; 16 rows at 1440×900, 12 at 1366×657 (a 1366×768 laptop); real `<table>`; solid `surface` rows; empty columns hidden by default | 5, 6.6 |
| F-QA-015 | medium | "N total" and KPIs describe the page | ViewTabs counts and ViewSummary come from `GET /api/leads/stats` (filters yes, pagination no), scope stated in words | 3.3, 6.3, 6.4 |
| F-QA-016, F-UX-031 | medium | Filters, search, open lead not in the URL; deep links reset; Back skips pages | `useUrlState`: view, q, filters, sort, page, size, lead, tab; `pushState` for discrete changes | 3.1 |
| F-UX-032, F-UX-035 | medium | Drawer clips 42 px, header scrolls away, DELETE LEAD under Call Now, "VOBIZ · QUEUED" a month old, "WA" | Full-height Sheet with sticky header and footer; Delete in `⋯` with Undo or typed confirm; stale calls read "Timed out"; "WhatsApp…" | 6.9 |
| F-A11Y-010, F-A11Y-018, F-A11Y-012 | medium | Rows not focusable; no table semantics; 48 tab stops for 24 rows; drawer never gets focus | `role="grid"` table, one tab stop for the body, Enter opens the sheet, focus moves to its title, Esc returns to the row | 6.6, 10 |
| F-A11Y-003, F-A11Y-005, F-UX-025 | high · high · medium | 25 unnamed checkboxes; unnamed Language select; New lead without dialog semantics, Esc discards typing, phone accepts "abc" | Named checkboxes ("Select Lead 1042"); Field labels; Dialog with inline discard state; PhoneInput with E.164 and on-blur validation | 6.11, 10 |
| F-A11Y-008, F-A11Y-019, F-VIS-002, F-VIS-017 | high · medium | 9 px tracked caps headers at 3.80:1; "NEW" badge 3.32:1 | `label-12` sentence-case headers in `text-3` (≥ 4.70:1); StatusTag word + icon ≥ 5.47:1 | 6.6 |
| F-A11Y-016 | medium | Status and source chips and VIKASH/VAANI have no pressed state | ViewTabs (`aria-selected`), FilterToken, VoicePicker radio group | 6.4, 6.5, 6.10 |
| F-A11Y-014 | medium | "0 / 0 SHOWN", "No leads match", "1 SELECTED" change silently | Shell announcer: result counts, selection counts, sort, page range, gate result | 10 |
| F-A11Y-023, F-A11Y-024 | medium | 26 targets under 24 px at 390; Refresh and Export nameless below 640; row call named by `title` | 24 px minimum, 44 px on touch; every IconButton has `aria-label` + tooltip; row actions named with the lead | 6.6, 10 |
| F-RWD-011 | medium | Status and Interest hidden on phones; 2–3 rows per screen; legend on touch | ListRow keeps status and language; ≥ 8 rows at 360×780; keycaps hidden on touch; Interest in the sheet and as a sort | 5.4 |
| F-RWD-012 | medium | Chip rows overflow from 1024; selects 540 px off-screen; table header scrolls away | One FilterBar row; tokens fold into the Filter button below 1024; header row sticky with the toolbar | 5, 6.5 |
| F-QA-022 | medium | Import accepts `.txt` and phone-less CSVs; no preview; "metadata.extra" | Dropzone type and size checks; client parse; mapping preview with Phone required; row checks; plain helper copy | 6.12 |
| F-QA-037 | low | Month-old "QUEUED" call; later calls not linked to the lead | "Timed out" result after the reaper window; calls matched to leads by E.164 (backend B6) | 6.9, 3.3 |
| F-UX-002, F-QA-004, F-UX-028, F-RWD-013 | high · high · medium · medium | A global wallet banner with Top up linking to Profile | WalletNotice (page scope, Leads spends money), Baseline wallet segment, inline reasons on every call action; Top up opens `/billing?topup=1` | 6.1, 7 |
| F-UX-005, F-VIS-037, F-UX-014 | high · low · medium | Flow select lists duplicate names; "Default flow" never named; voice default differs from Cockpit | FlowSwitcher (`assign`) with name + version; the Call gate names flow, version and voice; picking never writes the account default | 6.9, 6.10 |
| F-UX-016, F-UX-043 | medium | Tooltips "Reads metadata.extra.language until a schema column lands", "VOBIZ", em-dash banner copy | Plain labels; features without data are hidden (P1), not explained with developer notes | 9 |
| F-UX-030 | medium | Zeros shown while loading | Skeletons after 200 ms inside the shell; counts never `0` until the server says so | 7 |
| F-UX-045 | medium | Session replay loads on a page full of names and numbers | Replay off or masked on `/leads`; events carry no names, numbers or search text | 12 |
| F-VIS-006, F-VIS-022, F-VIS-031 | medium · medium · low | Teal IMPORT CSV; graph-paper texture behind rows; letter pseudo-icons "F", "IG", "{}" | One Button; solid rows; source shown as a word with a brand SVG where one exists | 6.2, 6.6 |

---

## 3. URL, data and dependencies

### 3.1 URL state (via `useUrlState`, data-nav §0.7)

| Param | Values | History | Notes |
|---|---|---|---|
| `view` | `all` (default) · `new` · `callbacks` · `interested` · `not-reached` · `v_{id}` (saved view) | push | Resets `page` to 1; keeps sort only if the view has no default sort (§6.4) |
| `q` | search text | replace while typing, push on settle | Debounced by `--timing-validate-debounce` (300 ms) |
| `f.{field}` | e.g. `f.language=hi,en`, `f.source=website`, `f.last_called=7d`, `f.interest=60-100`, `f.flow=flow_7c21`, `f.status!=do_not_call` | push | Negation uses `!=`; one param per field |
| `sort` | `{column}:{asc|desc}`, e.g. `last_call:desc` | push | Blank values sort last in both directions (F-UX-046) |
| `page`, `size` | `page≥1`; `size` 25 · 50 (default) · 100 | push | Out-of-range page is clamped with a Notice: "Page 30 doesn't exist. Showing page 26." |
| `lead` | lead id | push | Opens the lead sheet, even when the lead is not in the current page or view (then with the "Not in the current results" notice, overlay §4.3) |
| `tab` | `overview` (default) · `calls` · `notes` | replace | Only with `lead` |
| `density` | never in the URL | | A per-user preference (server), cached in `localStorage` with try/catch |

`/leads/{id}` (from ⌘K, Call reports and notifications) redirects to `/leads?lead={id}` with the default view, so every lead has one address. Dialogs and gates (New lead, Import, Export, Call gate, confirmations) never write to the URL (overlay §1.4).

### 3.2 Page data

| Request | Returns | Used by |
|---|---|---|
| `GET /api/leads?view&q&f.*&sort&offset&limit` | rows + `total` (for the current view and filters) | DataTable, Pager, result count |
| `GET /api/leads/stats?view&q&f.*` | `{ views: {all, new, callbacks, interested, not_reached, …userViews}, summary: {leads, open, reached, interested, converted, scored, avg_interest}, synced_at }`; filters apply, pagination never does | ViewTabs counts, ViewSummary, header meta (F-QA-015) |
| `GET /api/leads/facets?field&q&f.*` | value counts per enum field | FilterBar pickers |
| `GET /api/leads/{id}` · `/calls` · `/notes` · `/activity` | the record, its calls (conversations, not legs), notes, events | Lead sheet |
| `POST /api/calls/preflight` `{ selection, settings }` | checks, adjustments, final count, cost range, wallet runway, `gate_token` (expires after 2 min) | Call gate |
| `POST /api/calls/batches` `{ gate_token, idempotency_key, when }` | batch id, state `scheduled` | Call gate Start |
| `PATCH /api/leads/bulk` `{ selection, patch }` · `DELETE /api/leads/bulk` | affected count, `undo_token` | BulkBar |
| `POST /api/leads/imports` (parse) → `PUT …/{id}/mapping` → `POST …/{id}/commit` → `GET …/{id}` | row checks, progress, result, skipped-rows file | Import |

`selection` is either `{ ids: [...] }` or `{ all_matching: { view, q, filters, snapshot_at } }` (the server-side "Select all 1,284 leads", data-nav §7.10).

### 3.3 Backend dependencies and interim behaviour

Following direction §8: until a dependency ships, its UI is **hidden, not simulated** (P1).

| # | Dependency | Unlocks | Until it ships |
|---|---|---|---|
| B1 | Server search, sort, filter and pagination with a true `total` (the API already returns `total`, F-QA-015) | Table, Pager, result count | None acceptable; ships with the redesign |
| B2 | `GET /api/leads/stats` with pipeline-wide counts and summary metrics | ViewTabs counts, ViewSummary | Tab counts render nothing (no `0`); ViewSummary shows only "In this view · {total} leads" from B1 |
| B3 | A `language` column on leads (today read from `metadata.extra.language`, EXPLORE-DATA-03) | Language column, Language filter, language advisory in the gate | Language column and filter hidden |
| B4 | Last call joined server-side for every lead (today "populated as you open lead drawers", EXPLORE-DATA-03) | Last call column, "Last call outcome" filter, Not reached view | Last call column shows the stored last call where it exists; the outcome filter and the Not reached view are hidden |
| B5 | `callback_at` written by the Outcome step "Callback" and by the sheet | Callbacks due view, Callback column, nav badge "18 due" | View, column and badge hidden; status "Callback due" not offered |
| B6 | Calls matched to leads by E.164 at creation; stuck `queued`/`in_progress` calls reaped to "Timed out" (F-QA-037) | Truthful Last call, lead status advanced by Outcome steps, Calls tab | Calls tab shows stored calls; a call older than 30 min in `queued` renders as "No update since {time}" with a warning tone (Timeline stale state, data-nav §10.4) |
| B7 | Preflight endpoint: calling hours, DND scrub, recently-called, wallet runway from the per-second rate and median duration (direction §8 items 5 and 6) | Call gate checks and cost range | The gate shows only the checks the server can compute (flow live, caller ID, wallet balance) plus one advisory row saying what isn't checked yet (G §6.3); cost reads "Rate ₹0.04/s"; nothing is guessed |
| B8 | Import parse/mapping/commit endpoints with row-level results | Import steps 2 and 3 | Client-side checks only (type, size, phone column present, first 20 rows) and the current commit; the result states what the server reported |
| B9 | Soft delete for leads for at least the toast's life | Undo on Delete | Delete moves from tier 1 (Undo) to tier 2 (ConfirmDialog), never to tier 0 (overlay §3.1) |

---

## 4. Information hierarchy

The largest element is the table (P7). The eye should land, in order:

1. **Which slice of the pipeline am I looking at, and how big is it?** The selected view tab with its count ("Callbacks due 18"), then the result count "38 of 1,284" when filters narrow it.
2. **Each row's Lead, Status and Last call** (the P1 columns): who, where they stand, what happened last. Status is the only coloured element in a row, and only for real state (Callback due amber, Interested and Converted green, Do not call red).
3. **The row's next move:** "Call…" and `⋯`, revealed on hover and focus; for a selection, the BulkBar's **Call n leads…**, the one Neel action while rows are selected.
4. **Supporting columns:** Phone (masked, tabular figures), Interest (number + ink meter), Language (native-script mark), Flow.
5. **The ViewSummary line** (quiet, `meta-12`): the pipeline KPIs for exactly this view.
6. **Chrome stays quiet:** header meta, Export, Columns, density, pager. **New lead** is the header's only filled button; while rows are selected, the BulkBar's Call is the region's primary and the header keeps its own (one primary per region, core §2.1).

Inside the lead sheet: **who** (name, status) → **next step** (callback due, last call outcome) → **contact and pipeline facts** → captured values → history. The footer's **Call…** is the sheet's one primary.

Inside the Call gate: **what will happen** (title "Call 9 leads", "Nothing dials until you start") → **anything blocking** (red, with the fix) → **what was adjusted** (amber, with Include) → **cost against wallet** → **Start 9 calls**.

---

## 5. Layout and wireframes

Shell per direction §6.1 and data-nav §1: grouped sidebar (≥1280), rail (1024–1279), TopBar + NavSheet (768–1023), TopBar + BottomBar + MoreSheet (<768), and the Baseline under desktop and laptop screens. Leads is a **data page**: fluid width, the table flush with the content column, no cards, no page description (data-nav §2.2). Glyphs in the sketches: `▲` success tag, `◷` warning tag, `○` neutral tag, `⊘` danger tag, `▬` interest meter, `▌` the 2 px selected-row bar, `⌃ ⌄` previous and next lead, `⧉` copy link.

### 5.0 Chrome budget

Rows are counted on the **inner viewport** (the browser's content area), not the screen: a 1366×768 laptop gives about 1366×657 in maximised Chrome or Edge on Windows (`05-responsive` §2.1 has the reference sizes, and the tests run at them). The chrome is the direction's 244 px (§6.1), with nothing added: the view's size is the toolbar count, not a band.

| Inner viewport (screen) | Stack above and below the rows | Chrome | Standard rows (40) | Compact rows (32) |
|---|---|---|---|---|
| 1440×900 (the mocks' reference) | header 56 + views 40 + toolbar 48 + table head 32 + pager 40 + Baseline 28 | 244 | **16** | 20 |
| 1920×969 (1920×1080) | as 1440×900 | 244 | 18 | 22 |
| 1536×730 (1920×1080 at 125 %) | as 1440×900 | 244 | **12** | 15 |
| 1440×789 (13″ MacBook) | as 1440×900 | 244 | 13 | 17 |
| 1366×657 (**1366×768**, height ≤ 720) | views fold into a "View: All ▾" Select in the toolbar (−40); the Baseline folds into the BaselineChip in the header (−28) | 176 | **12** | 15 |
| 1366×625 (the same with a bookmarks bar) | as 1366×657 | 176 | 11 | 14 |
| 1280×609 (1280×720) | as 1366×657 | 176 | **10** | 13 |
| 1024×690 (iPad landscape, rail, Touch rows 48) | as 1366×657 | 176 | 10 at 48 px | n/a |

Every laptop size stays at or above the direction's 10-row floor. On 1366×768 and 1280×720 laptops the BaselineChip, not the band, carries the wallet and live facts (shell `00` §5.4). A page-scope setup Notice adds 40 px while present (dismissible for 24 h, overlay §10.2); 1366×657 still shows 11 rows with it. The WalletNotice is not shown at ≥ 1024 (direction §6.1 blocking-notice rule). The BulkBar floats over the table and costs no rows.

### 5.1 Desktop ≥ 1440 · default view, two rows selected

```
┌ Sidebar 232 ──┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [S] Sample    │ Leads  1,284 leads · synced 11:24 am                                 ⤓ Export   [⤒ Import…]   [+ New lead]      │ 56 PageHeader
│     Realty ⇕  │                                                                                                                 │
│               ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⌕ Search or   │ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ Not reached 204 │ + Save view                          │ 40 ViewTabs
│   jump to…    │                                                                                                                 │
│               ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Operate       │ [⌕ Search name, phone or city…  /] [≡ Filter] [Language  Hindi, English ×] Clear  38 of 1,284  ▥  [Std|Cmp]     │ 48 FilterBar
│  Cockpit ● 2  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Assistant    │ In this view · 38 leads · 31 open · 12 reached (32%) · 4 interested · 1 converted · avg interest 61             │ 32 ViewSummary
│  Rep console  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Meetings     │ ☐ │ Lead ↕   │ Phone     │ Status        │ Last call ↓       │   Interest│ Language │ Flow          │           │ 32 table head, sticky
│  Personal agts├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Build         │▌☑ │ Lead 1042│ •••• 0142 │ ▲ Interested  │ Visit booked·10:42│       82 ▬│ Hindi    │ Site-visit v7 │           │ selected
│  Flows 1 draft│▌☑ │ Lead 1043│ •••• 0187 │ ◷ Callback due│ Call later · Yest.│       64 ▬│ Hinglish │ Site-visit v7 │           │ selected
│  Knowledge    │ ☐ │ Lead 1044│ •••• 0239 │ ○ New         │ Not called yet    │ Not scored│ English  │ Default       │           │
│ Data          │[☐ │ Lead 1045│ •••• 0251 │ ○ Contacted   │ No answer · Yest. │       41 ▬│ Bengali  │ Site-visit v7 │        ]  │ keyboard focus: 2 px ring
│ ▐Leads 18 due▌│ ☐ │ Lead 1046│ •••• 0263 │ ○ New         │ Not called yet    │ Not scored│ English  │ Default       │ Call… ⋯   │ hover: row actions
│  Call reports │ ☐ │ Lead 1047│ •••• 0275 │ ⊘ Do not call │ Declined · 2 d    │       12 ▬│ Tamil    │ Site-visit v7 │           │
│  Analytics    │  …15 rows in Standard at 1440×900 (19 in Compact)                                                               │
│ Account       │           ┌ 2 selected │ [Call 2 leads…]   Set status ▾   Assign flow ▾   Export   ⋯  │  ✕ ┐                    │ BulkBar: e3, floats
│  Billing  Low │           └────────────────────────────────────────────────────────────────────────────┘                        │
│  Settings     ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Finish setup  │ 1–50 of 1,284 leads                                      Rows per page 50 ▾    Page 1 of 26    ‹   ›            │ 40 Pager, sticky
│ 4 of 5 ▬▬▬▬▭  │                                                                                                                 │
│ (AR) You ⇕    │                                                                                                                 │
├───────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │ Wallet ₹2,340.50 · about 16 h of calls │ Shortcuts Search │ 28 Baseline
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Header actions sit right-aligned in the order tertiary → secondary → primary (data-nav §2.2). A `⋯` overflow appears only when it has items (Refresh when the data is stale, Import history).
- Page header, ViewTabs, toolbar, ViewSummary and the table header stick together at the top of the scroll region, so the column headers never scroll away (F-RWD-012). The pager sticks to the bottom of the data region.
- The actions column is reserved (`width: 1%`) and pinned right; "Call…" and `⋯` fade in on hover, focus and `:focus-within` (data-nav §7.8).
- Row 1045 shows keyboard focus (2 px outline, inset), rows 1042–1043 selection (accent-soft fill + inset bar), row 1046 hover. Focus and selection show together when both apply (F-A11Y-007).

### 5.2 Desktop ≥ 1440 · a lead open (docked sheet), and the Call gate

The sheet takes a 440 px grid column beside the table (overlay §4.6). The table container shrinks to about 753 px, so it shows the P1 columns only (fit-by-priority, §6.6). The open row keeps the inset bar and `aria-current="true"`.

```
├──────────────────────────────────────────────────────────┬────────────────────────────────────────────┤
│ [⌕ Search…] [≡ Filter]               38 of 1,284  ▥      │ Lead 1042 · Pune          ⌃  ⌄  ⧉  ⋯  ✕    │ 56 sheet header, sticky
│                                                          │ Added 21 Sep 2026 · Import · ▲ Interested  │
├──────────────────────────────────────────────────────────┤                                            │
│ In this view · 38 leads · 12 reached · 4 interested      │────────────────────────────────────────────│
├──────────────────────────────────────────────────────────┤ Overview │ Calls 3 │ Notes 1               │ 40 PanelTabs
│ ☐ │ Lead       │ Status        │ Last call ↓       │     │────────────────────────────────────────────│
│▌☐ │ Lead 1042  │ ▲ Interested  │ Visit booked      │     │ Next step                                  │
│   │            │               │ Today 10:42 am    │     │ ◷ Callback due today 4:00 pm IST    Edit   │
│ ☐ │ Lead 1043  │ ◷ Callback due│ Call later · Yest.│     │ Contact                                    │
│ ☐ │ Lead 1044  │ ○ New         │ Not called yet    │     │  Phone      +91 •••••• 0142   Reveal       │
│ ☐ │ Lead 1045  │ ○ Contacted   │ No answer · Yest. │     │  Language   Hindi · from import            │
│ ☐ │ Lead 1046  │ ○ New         │ Not called yet    │     │  City       Pune                           │
│   │ …          │               │                   │     │ Pipeline                                   │
│                                                          │  Status     [Interested ▾]   Saved         │
│                                                          │  Interest   82 ▬▬▬▬ · from the call 26 Sep │
│                                                          │  Flow       Site-visit qualifier v7 ▾      │
│                                                          │ Captured on the last call · 2 of 3         │
├──────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
│ 1–50 of 1,284 leads                           ‹   ›      │ [Call…]   WhatsApp…                        │ sticky footer
└──────────────────────────────────────────────────────────┴────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Call 9 leads                                   ✕ │ title-16
│ Nothing dials until you start. Checked just now. │ meta-12, text-3
├──────────────────────────────────────────────────┤
│ Settings  Site-visit qualifier v7 · Vaani ·      │ collapsed summary; Change expands
│           Auto language · •••• 2210     Change   │
├──────────────────────────────────────────────────┤
│ Must pass                                        │ label-12, text-3
│ ✓ Site-visit qualifier v7 is live                │ success mark + words
│   Test call on this version today, 11:02 am      │
│ ✓ Caller ID verified · +91 80 •••• 2210          │
│ ✓ Inside calling hours · open until 7 pm IST     │
│ ✓ Wallet covers this batch                       │
│ Adjusted                                         │ `adjusted`: amber minus marks (G §2.1)
│ – 2 leads were called in the last 24 h           │ auto-skipped
│   Skipped to avoid a repeat call      Include    │
│ – DND registry: 11 of 12 clear · 1 skipped       │
│ Good to know                                     │
│ ⓘ 1 lead prefers Tamil. Vaani speaks Hindi       │ `advisory`, neutral info mark, no skip
│   and English.           Choose voice  Keep      │
├──────────────────────────────────────────────────┤
│ 9 calls · about 1 to 2 min each · ₹21 to ₹44     │ cost range, tabular
│ Wallet ₹2,340.50 · about 16 h of calls           │ meta-12, text-3
│ (•) Place now    ( ) Schedule…                   │ RadioCard pair
├──────────────────────────────────────────────────┤
│                       Cancel   [Start 9 calls]   │ surface-2 footer; Ctrl/Cmd+Enter
└──────────────────────────────────────────────────┘
```

The Call gate (above, from "Call 9 leads…" with 12 selected: 2 recently called and 1 DND lead skipped) is a popover anchored to the control that opened it: upward from the BulkBar's primary, from the row's "Call…", or from the sheet footer's Call…. It is modal for focus (trapped, no scrim), `--radius-12`, `--e3`, width `--size-popover-gate` 400: the popover gate of `spec/02-components-gate.md` §1.3. Leads configuration in §6.10.

### 5.3 Laptop 1280–1439 and 1024–1279

```
┌ Sidebar 232 ─┬────────────────────────────────────────────────────────────┬ Lead sheet 440 (overlay) ──────────┐
│              │ Leads  1,284 leads · synced 11:24 am     ⤓  [⤒…] [+ New]   │ Lead 1042 · Pune    ⌃ ⌄ ⧉ ⋯ ✕      │
│              │ All 1,284 │ New 312 │ Callbacks due 18 │ Interested ▸      │ Overview │ Calls 3 │ Notes 1       │
│              │ [⌕ Search…] [≡ Filter] [Language Hindi ×]  38 of 1,284     │ Next step                          │
│              │ In this view · 38 leads · 12 reached · 4 interested        │ ◷ Callback due today 4 pm IST      │
│              │ ☐│ Lead     │ Phone     │ Status       │ Last call         │ Contact · Pipeline · Captured      │
│              │▌☐│ Lead 1042│ •••• 0142 │ ▲ Interested │ Visit booked      │ …                                  │
│              │ ☐│ Lead 1043│ •••• 0187 │ ◷ Callback du│ Call later ·      │                                    │
│              │ …  table behind stays interactive (non-modal sheet)        │ [Call…]  WhatsApp…                 │ sticky footer
└──────────────┴────────────────────────────────────────────────────────────┴────────────────────────────────────┘

┌────┬────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ S  │ Leads  1,284 leads · synced 11:24 am                            ⤓ Export   [⤒ Import…]   [+ New lead]  │ 56
│ ⌕  │ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ Not reached 204 │ + Save view                 │ 40
│ ⌁  │ [⌕ Search name, phone or city…] [≡ Filter] [Language  Hindi ×] +1 filter   38 of 1,284   ▥  [Std|Cmp]  │ 48
│ …  │ In this view · 38 leads · 31 open · 12 reached (32%) · 4 interested                                    │ 32
│    │ ☐ │ Lead          │ Phone            │ Status          │ Last call ↓            │   Interest │         │ 32
│▐▌  │ ☐ │ Lead 1042     │ +91 •••••• 0142  │ ▲ Interested    │ Visit booked · 10:42   │       82 ▬ │ Call… ⋯ │ rows: P1 + P2
│    │ ☐ │ Lead 1043     │ +91 •••••• 0187  │ ◷ Callback due  │ Call later · Yesterday │       64 ▬ │         │
│    │ …  Language joins when the table container is ≥ 1,000 px wide (fit-by-priority, §6.6)                  │
└────┴────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **1280–1439:** the same labelled sidebar; the lead sheet overlays the right third (non-modal, `--e3`, no scrim) and the table behind stays interactive (overlay §4.6). With no sheet open, the table shows P1, P2 and Language; Flow is in Columns.
- **1024–1279:** the 56 px rail with portal tooltips; `[` expands the sidebar as an overlay with a scrim (data-nav §1.4). The table shows P1 and P2.
- FilterBar shows up to 3 tokens inline at ≥1280 and 2 at 1024–1279, then "+n filters" (data-nav §6.7). Columns is icon-only below 1280.
- The ViewSummary drops items from its end when they don't fit (avg interest, then converted, then open), never wraps, and keeps every item in its tooltip.

---

### 5.4 Tablet 768–1023

```
┌──────────────────────────────────────────────────────────────────────┐
│ ☰  Leads                              [▣ ₹2,340]    ⌕                │ 52 TopBar; the title is the H1
├──────────────────────────────────────────────────────────────────────┤
│ 1,284 leads · synced 11:24 am                    ⋯   [+ New lead]    │ 48 header row; Import and Export in ⋯
├──────────────────────────────────────────────────────────────────────┤
│ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ Not reach ▸ │ 40 ViewTabs scroll with an edge fade
├──────────────────────────────────────────────────────────────────────┤
│ [⌕ Search name, phone or city…          ]  [≡ Filter 2]  38   ▥      │ 48 tokens fold into Filter (count)
├──────────────────────────────────────────────────────────────────────┤
│ In this view · 38 leads · 12 reached · 4 interested                  │ 32
├──────────────────────────────────────────────────────────────────────┤
│ ☐ │ Lead          │ Status          │ Last call              │ ⋯     │ P1 columns, key and actions pinned
│ ☐ │ Lead 1042     │ ▲ Interested    │ Visit booked · 10:42   │ ⋯     │ 48 px rows on touch, 40 with a mouse
│ ☐ │ Lead 1043     │ ◷ Callback due  │ Call later · Yesterday │ ⋯     │
│ …                                                                    │
├──────────────────────────────────────────────────────────────────────┤
│ 1–50 of 1,284 leads                                   ‹    ›         │ 40
└──────────────────────────────────────────────────────────────────────┘
```

- The TopBar carries the H1, the wallet chip (warning tone when low) and search (data-nav §1.6). The header row keeps the meta and New lead; Import… and Export move into `⋯` (core §2.1 responsive).
- The lead opens as a **modal** full-height sheet, width `min(var(--size-sheet-detail), 100%)` = 560, with the scrim; content never reflows (F-VIS-033).
- On coarse pointers `⋯` is always visible and holds "Call…"; the actions column is 44 px wide.
- The Call gate stays an anchored popover when it fits above or below its anchor; otherwise it becomes a bottom sheet (overlay §5.4).
- Density: Touch applies automatically under `(pointer: coarse)`; a tablet with a trackpad keeps Standard or Compact.

### 5.5 Phone 320–767

```
List (390×844)                        Selection mode                        Call gate (bottom sheet)
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Leads            [₹2,340]   ⌕   │   │ Leads            [₹2,340]   ⌕   │   │ ░░░░░░ page under scrim ░░░░░░  │
│ 38 of 1,284 · 4 interested      │   │ 2 selected           Done [All] │   ├─────────────────────────────────┤
│                 Select  [+ New] │   │                                 │   │ Call 2 leads                 ✕  │
├─────────────────────────────────┤   ├─────────────────────────────────┤   │ Nothing dials until you start.  │
│ All 1,284 │ New 312 │ Callbac ▸ │   │ All 1,284 │ New 312 │ Callbac ▸ │   │ Site-visit qualifier v7 ·       │
├─────────────────────────────────┤   ├─────────────────────────────────┤   │ Vaani · Auto          Change ▾  │
│ [⌕ Search name, phone or city…] │   │ [⌕ Search name, phone or city…] │   │ Must pass                       │
├─────────────────────────────────┤   ├─────────────────────────────────┤   │ ✓ Flow live   ✓ Caller ID       │
│ [≡ Filter 1] [⇅ Last call] [Lan▸│   │ ☑ Lead 1042       ▲ Interested  │   │ ✓ Calling hours · until 7 pm    │
├─────────────────────────────────┤   │   •••• 0142 · Visit booked Hindi│   │ ✓ Wallet covers this call       │
│ Lead 1042           ▲ Interested│   │ ☑ Lead 1043    ◷ Callback due   │   │ Adjusted                        │
│ •••• 0142 · Visit booked  Hindi │   │   •••• 0187 · Call later Hinglis│   │ ◷ Lead 1043 called 22 h ago ·   │
│ Lead 1043        ◷ Callback due │   │ ☐ Lead 1044             ○ New   │   │   skipped              Include  │
│ •••• 0187 · Call later  Hinglish│   │   •••• 0239 · Not called English│   │ 1 call · about 1 to 2 min ·     │
│ Lead 1044                ○ New  │   │ …                               │   │ ₹2 to ₹5 · wallet about 16 h    │
│ •••• 0239 · Not called  English │   │                                 │   │ (•) Place now  ( ) Schedule…    │
│ Lead 1045          ○ Contacted  │   │                                 │   │                                 │
│ •••• 0251 · No answer  Bengali  │   ├─────────────────────────────────┤   │                                 │
│ …8 rows at 360×780, 9 at 390    │   │ 2 selected  [Call 2…]       ⋯   │   ├─────────────────────────────────┤
├─────────────────────────────────┤   ├─────────────────────────────────┤   │ Cancel         [Start 1 call]   │
│ BottomBar · Leads current       │   │ BottomBar · Leads current       │   │                                 │
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

- **One page scroller.** The header row and ViewTabs scroll away; the search row sticks under the TopBar (F-RWD-009). The separate 32 px ViewSummary line is not rendered: its first two facts become the header row's meta ("38 of 1,284 · 4 interested").
- **Row count:** TopBar 52 + header row 48 + ViewTabs 40 + search 52 + filter row 52 + BottomBar 56 = 300 px, and ListRows are 60 px: a `label-13` line holding a 20 px StatusTag (tags keep `--size-tag` on touch because they are not interactive), a `meta-12` line holding the 18 px LanguageMark, a 2 px gap and `space-10` padding. At 360×780 that is **8 rows**, at 390×844 **9** (today 2 and 3, F-RWD-011); measured in the mock.
- **ListRow mapping** (data-nav §7.13): title = Lead; titleTrailing = Status (StatusTag); meta = masked phone (`PhoneText` short, last four digits, tabular) · last call outcome · time; metaTrailing = the language name (LanguageMark `name`, plain `meta-12` `text-2`; never a bare glyph, data-nav §5.6).
- **Sort** has no column headers on phones, so the filter row starts with **Sort** ("⇅ Last call"): a bottom-sheet radio list (Last call, Created, Interest, Name, Callback) with a direction switch.
- **No per-row Call button**, so a mis-tap never dials (data-nav §7.13). Calls start from the lead sheet footer or from the BulkBar in selection mode. **Select** enters selection mode: 44 px leading checkboxes, the header row becomes "2 selected · Done · All", and the BulkBar docks above the BottomBar with the count, "Call 2…" (`labelShort`) and `⋯` (Set status, Assign flow, Export, Delete 2 leads…).
- **Lead sheet** is full screen with "‹ Back to Leads" in its header, the BottomBar hidden while it is open, and a sticky footer with Call… and WhatsApp… (44 px, side by side).
- **Call gate** is a bottom sheet (overlay §5.4) with Start sticky above the safe area; the Settings and Adjusted sections collapse to one line each and expand in place.
- Keycaps and the "/" search hint are hidden on touch (core §7.3). The BottomBar reaches 5 destinations and More reaches the other 7 (F-RWD-001).

### 5.6 Short and zoomed viewports

| Condition | Change |
|---|---|
| Height ≤ 800 at ≥ 1024 | Sidebar short mode (data-nav §1.2); the page is unchanged |
| Height ≤ 720 at ≥ 1024 | ViewTabs fold into a "View: All ▾" Select at the start of the toolbar; the Baseline folds into a header chip (direction §6.1) |
| Height ≤ 480 (landscape phones, 844×390) | The header row hides (New lead and `⋯` move into the TopBar), ViewTabs fold into the View Select, the ViewSummary hides, the pager scrolls with the list. TopBar 52 + toolbar 48 + table head 32 = 132 px, so **5 rows** show (today none, F-RWD-011) |
| 200% zoom on a 1440 screen (720 CSS px) | The phone layout applies; every destination and action stays reachable (F-RWD-001) |
| 320 CSS px (400% zoom) | Phone layout; nothing scrolls sideways; ListRow text truncates, with the full value in the sheet |

---

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

---

### 6.9 Lead sheet

`Sheet` variant `record` (overlay §4), 440 px, `mode="auto"`: docked at ≥1440, non-modal overlay at 1024–1439, modal full height at 768–1023, full screen below 768. Deep-linked `?lead={id}&tab={tab}`; a direct load opens it even when the lead is outside the current page or view (with the "Not in the current results · Clear filters" Notice, overlay §4.3). It replaces today's clipped `<aside>` (F-UX-032, F-A11Y-010).

| Part | Configuration |
|---|---|
| Header (sticky, 56) | Title: the lead's name, `title-16`, `translate="no"` ("Unnamed lead · •••• 0142" when there is no name). Meta line: `StatusTag` + "Added 21 Sep 2026 · Import · leads-sept.csv" (`meta-12`). Actions: Previous lead / Next lead (`chevron-up` / `chevron-down`, tooltips with `Kbd` K and J), Copy link, `⋯` (Edit details… · Export lead · Copy full number (admins, logged) · separator · **Delete lead…**), Close ("Close lead"). Phone: "‹ Back to Leads" replaces Close |
| Tabs | `PanelTabs` (data-nav §3): Overview · Calls {n} · Notes {n}; automatic activation; `?tab=` |
| Footer (sticky) | **Call…** (primary, `phone` 16) → Call gate anchored upward. **WhatsApp…** (secondary) only when a WhatsApp integration is connected; it opens that integration's template picker (outside this spec). Never a destructive action |

**Overview tab** (sections are `h3` in `title-14`, content as `KeyValueList` `inline`, data-nav §8):

| Section | Rows |
|---|---|
| Next step (only when there is one) | StatusText `warning`: "Callback due today 4:00 pm IST" + link "Reschedule"; or, from B6: "Last call timed out · no update since 28 Aug, 11:45 pm · Check status" |
| Contact | Phone: `PhoneText` masked + **Reveal** (permitted roles; logged in Activity & audit; then Copy) · Email · City · State · Language: the name (`LanguageMark` `name`) + source note ("from import", "heard on the call on 26 Sep") · Source |
| Pipeline | Status: `Select` that saves on change, then StatusText "Saved" for `--timing-toast`; on failure it reverts with "Couldn't save. Retry" · Interest: "82" + meter + source note "from the call on 26 Sep", or "Not scored" · Callback: DateTime field (IST) "Set a callback…" · Owner: `Select` · Flow: `FlowSwitcher` `assign`, trigger reads "Workspace default · Site-visit qualifier v7" until overridden |
| Captured on the last call | Count on the right ("2 of 3"); rows from that call's captured fields; "Nothing captured" compact; link "Open call report" (`/call-reports?call={id}`) |
| Custom fields | "Extra columns from import" as key-value rows; the section is omitted when empty |

**Edit details…** turns Contact into Fields (Name, Phone as `PhoneInput` for admins only, Email, City, State, Language, Source). While dirty, the footer swaps to the `UnsavedChangesBar` ("Unsaved changes · 2 fields · Discard · Save changes", overlay §18.3); closing or switching leads while dirty uses the inline discard state (overlay §2.5).

**Calls tab:** `Timeline` (data-nav §10) with calls, status changes, callbacks, flow assignments and the import that created the lead. A call item reads "Vaani called · Visit booked · 2m 31s" with the tone of its result, an optional detail (the caller's key turn as a compact `TurnRow` excerpt with its `LanguageMark`) and the action "Open call report". Test calls carry an outline Tag "Test call". Calls are conversations, not legs, from the same source the Cockpit uses, so the count agrees everywhere (F-UX-032). Stale calls show the Timeline stale state (F-QA-037). "Show older activity" loads 20 more.

**Notes tab:** a `Textarea` labelled "Add a note" (placeholder "Asked for the brochure in Hindi…"), **Add note** (secondary `sm`, ⌘/Ctrl+Enter), then notes newest first as Timeline items with the author's Avatar. Own notes have `⋯` Edit · Delete note (Undo toast). Empty: compact "No notes yet."

### 6.10 Call gate (Leads configuration)

The Call gate is `CallGate` from `spec/02-components-gate.md` (G §5.1). Its frame, check kinds and marks, cost-line formula, states, keys, gate token (120 s), idempotency key, the wallet ₹0 rule and its containers per breakpoint are specified there, not here. This section only configures it for Leads; the sketch in §5.2 shows the result.

| Setting | Leads value |
|---|---|
| Entry points and mode | Row "Call…", sheet footer "Call…", ⌘K "Call Lead 1042…": `mode="single"` for that lead · `C` in the table: the selection (`batch`) if there is one, else the focused row (`single`) · BulkBar "Call {n} leads…": `batch` with the selection or the server-side "all matching" selection |
| Anchor | Upward from the BulkBar primary, from the row's "Call…", or from the sheet footer's "Call…" (popover gate, G §1.3) |
| Scope | `settings="editable"`: Flow · Voice · Language · Caller ID, collapsed to one line with **Change**. Flow is `FlowSwitcher purpose="assign"` (live flows only; "Uses each lead's flow" with the breakdown "Site-visit qualifier v7 (8) · Home-loan follow-up v3 (1)" when assignments differ); Language is "Auto: each lead's language, else Hindi and English" or a fixed language |
| Choice | `choice="always"` in both modes: Place now · Schedule… |
| Checks | The G §5.1 catalogue for Real calls to leads. Leads adds none |
| Global blockers (entry point `aria-disabled`, reason in its tooltip; `C` announces it and shows an info toast with the fix) | "Wallet is ₹0. Top up to place calls. · Top up" · "No verified caller ID. · Verify a number" · "No live flow. Publish a flow to call leads. · Open Flows" · "You're offline" (G §4.4) |
| Primary | Single: "Place call" / "Schedule call". Batch: "Start {n} calls" / "Schedule {n} calls" |
| Top up from the gate | G §4.4 rule 6: the selection is kept; the top-up success toast offers "Call 12 leads…" |
| Done (batch) | The selection clears ("9 calls scheduled. Selection cleared."); focus returns to the trigger or, if it is gone, the table's active row; progress toast "Starting 9 calls · View in Cockpit"; rows' Last call cells show live `CallStateTag`s; the Baseline shows "9 calls in progress"; the batch is in Cockpit › Up next as Scheduled with Pause and Cancel. When it finishes: toast "9 calls finished · 3 interested · View results" (Call reports filtered to the batch) |
| Done (single) | Toast "Calling Lead 1042 · Open in Cockpit"; focus returns to the trigger |
| Remembered | Only the proof "Test call on this version today, 11:02 am". No setting, admin or otherwise, skips the gate (P3) |

### 6.11 New lead

`Dialog` `md` (overlay §2), title "New lead", description "Add one person. To add many, use Import…" (a link that swaps to the Import dialog after the inline discard check). It replaces today's modal without dialog semantics that throws away typing on Esc (F-A11Y-005, F-UX-025).

| Field | Component | Rules |
|---|---|---|
| Name | `TextInput`, `data-autofocus` | Required: "Enter the lead's name." No placeholder |
| Phone | `PhoneInput` `kind="any"` (core §4.1) | Required; E.164; format checked on blur; duplicate check on blur: hint "This number is already a lead. **Open lead**" |
| Language | `Select` with `LanguageMark` options | Optional ("Not set") |
| Email | `TextInput` `type="email"` | Optional; `email` schema on blur |
| City | `TextInput` | Optional |
| More details (`Collapsible`, closed) | State · Source (default Manual) · Status (default New) · Owner (default you) · Flow (`FlowSwitcher` `assign`, default "Workspace default") · Note (`Textarea`) | Keeps the visible form at 5 fields (overlay §2: dialogs hold ≤ 6) |

Footer: **Cancel** (tertiary) · **Create and add another** (secondary: saves, clears the form, keeps Language, Source and Flow, focuses Name, announces "Lead added") · **Create lead** (primary). Validation follows core §8.2 (V1–V12): nothing turns red while typing, errors on blur for changed fields, all on submit, focus to the first invalid field. Submitting: "Creating lead…"; failure: a danger Notice at the top of the body, e.g. "Couldn't create the lead. This number is already in Leads. Open existing lead". Success: the dialog closes, focus returns to New lead, toast "Lead added · Open" (or "Lead added. It's hidden by your current filters · Show" when it doesn't match the view).

### 6.12 Import leads

Three steps in one `Dialog` (`md` for step 1, growing to `lg` 720 for steps 2 and 3, overlay §2.2), with `StageProgress` in the header: Checking file · Mapping columns · Importing (overlay §14.3). Importing never places calls.

**Step 1 · Choose a file** (`md`). Description: "CSV or XLSX, up to 5 MB. A phone column is required." `Dropzone` (core §7.2) with `maxFiles={1}`, `accept={['.csv','text/csv','.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}`, the contract line "CSV or XLSX · up to 5 MB · one file", and a link "Download the template (CSV)". Type, MIME and size are checked on selection and on drop; a rejected file stays listed with its reason ("Not a CSV or XLSX file. Choose another file.") (F-QA-022). The first 20 rows are parsed in the browser (Papa Parse for CSV, SheetJS for XLSX) while the server counts the rest. Footer: Cancel · **Next: map columns** (enabled when a file is accepted).

**Step 2 · Map columns** (`lg`):

| Region | Content |
|---|---|
| File line | "leads-sept.csv · 1,240 rows · 6 columns" + Change file |
| Mapping | A framed `DataTable` without selection: **Column in file** · **Sample values** (first 3, `text-3`, phone samples masked) · **Import as** (`Select`: Name · Phone · Email · City · State · Language · Source · Status · Owner · Callback · Custom field · Don't import) · **Check** (`StatusText`: "Matched", "Custom field", "Not imported", or an error). Columns are auto-matched by header synonyms (phone, mobile, contact number, फ़ोन; name, full name…) and each auto-match says so ("Matched from 'Mobile No.'") |
| Row checks | A checklist in the Gate's visual language: ✓ "1,212 rows are ready" · ◷ "18 rows have no phone number · skipped" · ◷ "6 phone numbers aren't valid · skipped" · ◷ "4 numbers repeat inside the file · first kept" · ◷ "12 numbers are already leads" with a `RadioGroup` Skip (default) · Update empty fields · Overwrite. Each row has "Show rows" (up to 20 row numbers and reasons) |
| Options | Source for these leads: "Import · leads-sept.csv" (editable) · Flow: `FlowSwitcher` `assign` (default Workspace default) · Language for rows without one: `Select` (default Not set) |
| Consent (pending the owner's decision, §15) | Checkbox "These people agreed to be contacted by {workspace}" |

Blocking errors: "Choose the column that holds phone numbers." (Phone unmapped); "No rows have a valid phone number." Footer: Back · Cancel · **Import 1,212 leads** (primary; the count follows the checks and the duplicate choice).

**Step 3 · Importing** (`lg`): a determinate `ProgressBar` "Importing… 820 of 1,212" and the line "You can close this. The import continues, and a notification appears when it's done." **Close** hands over to a progress toast ("Importing 1,212 leads… 820 done · View"). **Done:** "1,212 imported · 28 skipped" with **Download skipped rows (CSV)** and **View imported leads** (primary: closes and applies the filter Imported from: leads-sept.csv). **Failed part-way:** "Import stopped at row 820. 819 leads were imported." + Retry the rest · Download skipped rows. Every result comes from the server (B8).

Helper copy uses plain words: "Extra columns are saved as custom fields." (never "metadata.extra", F-UX-016).

### 6.13 Export

**Export** opens a `Popover` (overlay §5): title "Export leads"; **Which leads** `RadioGroup`: This view (38) · Selected (12, when there is a selection) · All leads (1,284); **Format** `SegmentedControl`: CSV · XLSX; **Columns**: Visible columns · All fields; **Phone numbers**: Masked (default) · Full numbers (admins only, with "Logged in Activity & audit"). Footer: Cancel · **Export 38 leads**. Up to 5,000 rows download directly with the toast "Exported 38 leads"; larger exports run in the background with a progress toast and a link when ready (threshold to confirm, §15). Exports respect masking (digest §5.7).

---

## 7. States, with copy

One state matrix for every data view (direction §6.6): what the page says, what it offers, and what it never does (show `0` while loading, simulate data, or drop the shell).

### 7.1 Page

| State | When | What shows | Copy |
|---|---|---|---|
| **First use** | The workspace has no leads | Header (meta "No leads yet"), no ViewTabs, FilterBar, ViewSummary or pager; one `EmptyState` `first-use` in the table region (icon `users` 20) | Title "No leads yet" · body "Leads you add or import appear here with their status and last call." · **Import leads…** (primary) · **New lead** (secondary) · link "Download the CSV template" |
| **Loading (first)** | Before the first response | Shell, H1, header actions, ViewTabs labels and toolbar render at once; meta, tab counts and ViewSummary numbers skeleton; table skeleton after 200 ms (overlay §13.2 Table layout); pager "Loading…" | Hidden polite line "Loading leads…"; never "0 leads" (F-UX-030) |
| **Refreshing** | Sort, filter, page or view change | Rows stay; `aria-busy="true"`; result count and pager read "Updating…"; no dimming or spinner | — |
| **Partial: counts** | B2 failed, rows loaded | Tab counts render nothing; meta "Couldn't load counts · Retry"; ViewSummary "Couldn't load the summary · Retry" | — |
| **Partial: call details** | Rows loaded, last-call join failed | Section `Notice` warning above the table; Last call cells "–" with hidden "Not loaded" | "**Last call details couldn't load.** Statuses and names are current. Retry" |
| **Partial: missing capability** | B3, B4 or B5 not shipped | The column, filter and view are absent (not disabled, not "coming soon") | — |
| **Error (first load)** | The list request failed | Danger `Notice` in the body (`role="alert"`); header and toolbar stay | "**Couldn't load leads.** Check your connection and try again." · Retry |
| **Error (refresh)** | A refresh failed with data on screen | Warning `Notice` above the table (`role="status"`) | "**Showing leads from 11:24 am.** Couldn't refresh. Retry" |
| **Offline** | `ConnectionBar` offline | Cached rows with the stale Notice; Call…, New lead, Import…, Export, status changes and notes are `aria-disabled` with "You're offline" | Bar: "**You're offline.** Showing data from 11:42 am." |
| **No permission (page)** | The role cannot see leads | `Forbidden` inside the shell (overlay §16.1), no redirect | "Only admins and sales members can see leads. Ask an admin (2 in this workspace) to change your role." · Copy request link |
| **Wallet low or empty** | Server wallet state | `WalletNotice` under the header (§6.1); call actions disabled at ₹0 with the reason | "**Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. Top up" |
| **Setup blocks calling** | No verified caller ID or no live flow | Page `Notice` warning; call actions disabled with the reason | "**Calls can't be placed yet.** Verify your calling number to call leads. Finish setup (3 of 5)" |
| **Calls in progress** | A batch from this page is running | Last call cells show `CallStateTag` live states; the Baseline segment "9 calls in progress"; the nav badge on Cockpit | — |

### 7.2 Table results

| State | Copy (EmptyState variant) | Action |
|---|---|---|
| Search matched nothing | `no-results`: "No leads match 'pune'." · "Search covers name, phone, email and city." | Clear search |
| Filters matched nothing | `filtered`: "No leads match Language Tamil and Last called in the last 7 days." · "1,284 leads are hidden by filters." | Clear filters |
| A view is empty | `done`, copy per view (§6.4) | per view |
| Page out of range | Info `Notice`: "Page 30 doesn't exist. Showing page 26." | — |
| Selection cleared by a change | Announcement only: "Selection cleared" | — |

### 7.3 Lead sheet

| State | Treatment and copy |
|---|---|
| Loading | Title from the row if known, else a skeleton; real tabs; sheet skeleton (overlay §13.2) |
| Not in the current results | Neutral Notice at the top: "Not in the current results. Clear filters" |
| Deleted or no access | Compact EmptyState: "This lead was deleted, or you no longer have access." + Close |
| Section failed | `SectionError` inside that tab: "Couldn't load calls. Retry"; the other tabs work |
| Status save failed | The Select reverts; StatusText danger "Couldn't save. Retry" beside it |
| Dirty (Edit details) | `UnsavedChangesBar` in the footer; closing asks inline: "Discard changes to Lead 1042? · Keep editing · Discard" |
| Phone masked | "+91 •••••• 0142 · Reveal" for permitted roles; others see no Reveal, hint "Only admins can see full numbers." |

### 7.4 Call gate

The states are G §4.1; Leads copy for each:

| State | Copy |
|---|---|
| Checking | Summary "Checking 12 leads…"; why-text "Checking…"; the primary `aria-disabled` |
| Ready | "9 calls ready · 3 leads skipped"; primary "Start 9 calls" |
| Adjusted | Amber `minus` marks with the reason and Include (G §2.1); the count and cost follow the skips |
| Blocked (in-gate rows only) | A red `x` row with its fix; primary `aria-disabled`; why-text such as "Calls can't start outside calling hours." (single lead: "This number is on the DND list. It can't be called for promotions.") |
| A global blocker appears while open | Wallet ₹0, offline or no caller ID never open the gate (§6.10). If one appears while the gate is open (for example the wallet reaches ₹0 through another batch), G §4.4 rule 2 applies: a blocking row at the top of Must pass ("Wallet is ₹0. Top up to place calls." · Top up), the primary disabled, the gate stays open |
| All skipped | "All 3 leads were skipped. Include some, or cancel." |
| Stale / Changed | "Checked 2 min ago · Recheck"; Start re-checks first; if anything changed: "Checks changed since you opened this. Review and start again." |
| Starting / failed / started | "Starting…" · "Couldn't start the calls. Nothing was dialled." + Retry (same idempotency key) · §6.10 Done |
| Estimate unavailable (B7 missing) | "9 calls · Rate ₹0.04/s" and the balance; no runway; one advisory row "Calling hours, DND and recent calls aren't checked here yet." (G §6.3) |

### 7.5 Import

| State | Copy |
|---|---|
| Rejected file | "Not a CSV or XLSX file. Choose another file." · "Larger than 5 MB. Split it into smaller files." |
| No phone column mapped | "Choose the column that holds phone numbers." (blocking) |
| Parse failed | "Couldn't read this file. Save it as CSV (UTF-8) and try again." · Details (row and message) |
| Ready | "1,212 rows are ready" + the skipped groups |
| Importing | "Importing… 820 of 1,212" |
| Done | "1,212 imported · 28 skipped" · Download skipped rows · View imported leads |
| Stopped | "Import stopped at row 820. 819 leads were imported." · Retry the rest · Download skipped rows |

### 7.6 Roles (proposed; the audit saw a member account only, so the owner confirms, §15)

| Action | Member | Admin |
|---|---|---|
| View, search, filter, save personal views | yes | yes |
| Call through the Call gate | yes | yes |
| New lead, edit details, status, callback, notes | yes | yes |
| Import | yes | yes |
| Export with masked numbers | yes | yes |
| Reveal or export full numbers (logged) | no: Reveal absent, the Export option reads "Full numbers · admins only" and is disabled | yes |
| Delete leads, share views with the workspace | no: the `⋯` item is disabled with "Only admins can delete leads. Ask an admin." | yes |

### 7.7 Toasts used on this page

| Kind (overlay §9) | Message | Action |
|---|---|---|
| success | "Lead added" · "Status changed to Interested" (from the sheet) · "Exported 38 leads" | Open · — · — |
| undo | "Set 12 leads to Contacted" · "Assigned Site-visit qualifier to 12 leads" · "Deleted 12 leads" · "Deleted note" | Undo (stays until dismissed) |
| progress | "Starting 9 calls" · "Importing 1,212 leads… 820 done" · "Preparing export of 8,400 leads…" | View in Cockpit · View · — |
| success (later) | "9 calls finished · 3 interested" · "1,212 imported · 28 skipped" | View results · View imported leads |
| error | "Couldn't set status for 12 leads. Nothing changed." · "Couldn't delete 12 leads. Nothing was deleted." | Retry |
| info | "Wallet is ₹0. Top up to place calls." (after `C` on a blocked page) | Top up |

---

## 8. Interactions and keyboard

### 8.1 Keyboard

Single-key shortcuts are handled on the table element (or the page for `/`, `N`, `?`), never on `window`; they never fire in inputs, textareas, selects, contenteditable, or on buttons and links for Enter and Space; and they stop when the user turns **Single-key shortcuts** off in the account menu, which also hides their keycaps (F-A11Y-004, data-nav §7.9, overlay §19).

| Key | Where | Does | Single-key? |
|---|---|---|---|
| `/` | Page, focus not in a field | Focus the search | yes |
| `Esc` | Search | Clear the text; a second Esc leaves the field | — |
| `↑` `↓` · `J` `K` | Table | Previous / next row (real focus, roving tabindex) | J/K yes |
| `Home` `End` · `PgUp` `PgDn` | Table | First / last row on the page · one screen of rows | — |
| `Enter` | Row | Open the lead sheet (native activation wins on buttons and links) | — |
| `Space` · `X` | Row | Toggle selection | X yes |
| `Shift+↑` `Shift+↓` | Table | Extend the selection | — |
| `Ctrl+A` / `⌘A` | Table | Select every row on the page (replaces today's bare `A`) | — |
| `C` | Table | Open the Call gate for the selection or the focused row. **Never dials** | yes |
| `Ctrl+Enter` / `⌘↵` | Call gate | Start the calls | — |
| `N` | Page | New lead | yes |
| `Shift+D` | Page | Standard / Compact | — |
| `J` `K` | Sheet open, focus in the table or the sheet header | Next / previous lead; the sheet follows; "Lead 5 of 38" announced | yes |
| `F6` | Sheet open | Move focus between the table and the sheet | — |
| `Esc` | Table | Close the sheet, else clear the selection | — |
| `?` | Anywhere outside a field | Keyboard shortcuts sheet | yes |
| `Ctrl+K` / `⌘K` | Anywhere | Search or jump: "Leads", "New lead…", "Import leads…", "Call Lead 1042…" (opens the gate) | — |
| `F8` | Anywhere | Go to the newest toast (Undo) | — |

**Retired:** `A` alone (select all, too easy to trigger before a bulk call) → `Ctrl/⌘+A` inside the table; for one release, pressing `A` in the table shows an info toast "Select all is now Ctrl+A." · `C` dialling → `C` opens the gate. The permanent shortcut strip is removed; shortcuts live in tooltips ("Call… C"), menus and the `?` sheet (P5).

### 8.2 Focus and pointer

- **One tab stop for the table body** (data-nav §7.9): Tab enters on the active row; Tab from a row moves through that row's controls (checkbox, lead link, Call…, ⋯), then to the BulkBar and the pager. 24 rows no longer cost 48 stops (F-A11Y-010).
- **Row click** anywhere except a control opens the sheet, unless text is being selected. Middle-click or ⌘/Ctrl-click on the lead link opens `/leads?lead=` in a new tab.
- **Checkbox clicks never scroll the table** (today a click on row 1 scrolled and checked rows 7 and 8, F-UX-032): no `scrollIntoView` on pointer focus.
- **Sheet focus:** opening moves focus to the sheet title; Esc returns it to the row's lead link, or to the next row if the lead was deleted (overlay §1.3). The inspector-style F6 applies.
- **Gate focus:** trapped; Esc and Cancel return focus to the trigger; after Start, to the trigger or the table's active row.
- **Dialogs** (New lead, Import, confirmations): the overlay focus contract; focus never lands on `<body>` (F-A11Y-005).
- **Hover** reveals row actions after nothing (no delay); on coarse pointers `⋯` is always visible and there is no hover state.
- **Touch:** no long-press gestures; selection is the explicit Select mode. Swipe on rows does nothing (it would compete with scrolling).

### 8.3 Micro-interactions (all within foundations §11)

| Moment | Motion |
|---|---|
| Row hover, selection fill | `background-color` over `--dur-fast` |
| Row actions reveal | `opacity` over `--dur-fast` |
| BulkBar enter / leave | `translateY(var(--shift-toast))` + `opacity` over `--dur-slow` / `--dur-fast`; fade only under reduced motion |
| View tab indicator | `transform` over `--dur-base`; jumps under reduced motion |
| Sheet (overlay mode) | slides from the right over `--dur-slow`; docked mode appears in one frame (no animated table width) |
| Call gate | fade + `--shift-popover` over `--dur-base` |
| Live call in a Last call cell | the LiveDot pulses only while that call is live; static under reduced motion |
| New or updated rows | no entrance animation, no highlight flash |

---

## 9. Microcopy: before and after

| Where | Before | After |
|---|---|---|
| H1 | LEADS | Leads |
| Header meta | 24 SHOWN · 24 TOTAL | 1,284 leads · synced 11:24 am |
| Header actions | REFRESH · EXPORT · IMPORT CSV · NEW LEAD | Export · Import… · New lead (Refresh only when stale, in ⋯) |
| KPI strip | OPEN PIPELINE · NEW 100% · INTERESTED+ · AVG INTEREST — | In this view · 38 leads · 31 open · 12 reached (32%) · 4 interested · avg interest 61 |
| Shortcut strip | SHORTCUTS / SEARCH J / K NAV X SELECT A SELECT ALL C CALL ESC CLEAR | Removed; tooltips such as "Call… C" and the `?` sheet |
| Search | Search by name, phone, or email… (press / to focus) | Search name, phone or city… (with a "/" keycap on fine pointers) |
| Search count | 24 / 24 SHOWN | 38 of 1,284 |
| Status chips | ALL · NEW · CONTACTED · INTERESTED · SCHEDULED · CONVERTED · NOT INTERESTED · LOST | Views: All · New · Callbacks due · Interested · Not reached; Filter › Status |
| Source chips | ANY SOURCE · ✎ MANUAL · ◎ DEMO · F FACEBOOK · IG INSTAGRAM · G GOOGLE · {} API | Filter › Source: Manual · Import · Website · Facebook · Instagram · Google · WhatsApp · API · Sample data |
| Selects | Any language · Any outcome, with titles "Reads metadata.extra.language until a schema column lands" | Filter › Language · Filter › Last call outcome (shown only when the data exists) |
| Table headers | LEAD · STATUS · INTEREST · CALL (9 px caps) | Lead · Phone · Status · Last call · Interest · Language · Flow (12 px, sentence case) |
| Status badge | NEW | New (with icon) |
| Empty interest | — (red dash) | Not scored |
| Row call button | phone icon, title "Call {name} (c)" | Call… (named "Call Lead 1042…", tooltip "Call… C") |
| Bulk bar | 24 SELECTED · VIKASH · VAANI · AUTO-DETECT · DEFAULT FLOW · CALL 24 | 24 selected · Call 24 leads… · Set status · Assign flow · Export · ⋯ |
| Drawer config | OUTBOUND CONFIG · VOICE VIKASH male / direct · Active flow (profile default) | Call gate › Settings: Site-visit qualifier v7 · Vaani · Auto language · Caller ID |
| Drawer actions | Call Now · WA · DELETE LEAD | Call… · WhatsApp… · ⋯ › Delete lead… |
| Call history | VOBIZ · QUEUED · 28 Aug, 11:45 pm | Phone call · Timed out · no update since 28 Aug, 11:45 pm |
| Drawer stats | INTEREST — · CALLS 1 | Interest: Not scored · Calls 3 (one count everywhere) |
| New lead | "ONE AT A TIME — FOR BULK, USE CSV"; placeholder with a sample person's name | "Add one person. To add many, use Import…"; no name placeholder; phone hint "10-digit mobile, like 98765 43210" |
| Import | Import leads · CSV / XLSX · PHONE COLUMN REQUIRED · "Canonical columns… folded into metadata.extra" · Template.csv · Verify & import | Import leads · "CSV or XLSX, up to 5 MB. A phone column is required." · "Extra columns are saved as custom fields." · Download the template (CSV) · Next: map columns · Import 1,212 leads |
| No match | "No leads match. Try clearing a filter, or import a CSV to seed your pipeline." | "No leads match 'pune'." / "No leads match Language Tamil…" + Clear filters; first-use copy only when there are no leads |
| Wallet banner | "Wallet empty — top up now to keep calls flowing." · Top up (to Profile) · Enable autopay | WalletNotice "Wallet is ₹0. Phone calls are paused…" · Top up (to the Top-up sheet) |
| Calling | a single `c` press, no confirmation | "Call 9 leads · Nothing dials until you start." · Start 9 calls |

---

## 10. Accessibility

WCAG 2.2 AA is the floor. Page-specific rules on top of the component specs:

| Area | Rule | Fixes |
|---|---|---|
| Landmarks and headings | One `h1` "Leads" (focused on route entry, `<title>` updated). The FilterBar search is a `role="search"` form. The table is labelled by the H1. The sheet title is its `h2`; Overview sections are `h3` | F-A11Y-013, F-A11Y-026 |
| Table semantics | `<table role="grid">` with a visually hidden caption stating the sort, `th scope="col"`, `aria-sort` on the sorted header only (others `none`), `aria-rowcount` and absolute `aria-rowindex`, `aria-multiselectable`, `aria-selected` on selected rows, `aria-current="true"` on the open row, a visually hidden "Actions" header | F-A11Y-018 |
| Names | Row checkbox "Select Lead 1042"; header checkbox "Select all leads on this page"; "Call Lead 1042…"; "More actions for Lead 1042"; Phone cells "Phone ending 0142" (the bullets are `aria-hidden`); Interest "Interest 82 of 100"; LanguageMark glyphs carry `lang` and the visible name; every IconButton has `aria-label` + tooltip, never `title` alone, and keeps its name at every width (`sr-only`, not `hidden sm:inline`) | F-A11Y-003, F-A11Y-024 |
| Keyboard | §8.1: every action has a key path and a visible control; shortcuts scoped and switchable; Enter and Space never hijacked on buttons | F-A11Y-004, F-A11Y-010, F-A11Y-012 |
| Focus visibility | Global 2 px outline; rows use the inset offset so the scroller never clips it; sticky header, toolbar and BulkBar never cover a focused row (`scroll-margin-top` / `scroll-padding-bottom`) | F-A11Y-006, WCAG 2.4.11 |
| Focus vs selection | Selection = accent-soft + inset bar; focus = outline; both show together | F-A11Y-007 |
| Announcements | Through the shell announcer, polite and debounced: "38 of 1,284 leads" after search or filter; "2 leads selected"; "Sorted by Last call, newest first"; "Showing 51 to 100 of 1,284"; "Lead 5 of 38" when J/K move the sheet; gate results "9 calls ready. 3 leads skipped."; "9 calls scheduled. Selection cleared."; row status changes only for the focused row. Never: timers, cost, wallet decrements | F-A11Y-014 |
| Status without colour | Every StatusTag and CallStateTag has a word and an icon; overdue callbacks say "Overdue"; gate marks pair ✓/✕/– glyphs with sentences and a hidden kind word (G §2.1) | F-A11Y-019, P2 |
| Contrast | Tokens only: headers `text-3` ≥ 4.70:1, tags ≥ 5.47:1, checkbox borders `--control` ≥ 3.06:1 even on selected + hover rows, Neel label 7.68:1 (light) and 6.21:1 (dark) | F-A11Y-008, F-A11Y-009 |
| Targets | ≥ 24×24 everywhere (checkbox hit area 24, 44 on touch); phone rows 56 tall; Delete never within 8 px of a routine control (it lives in `⋯`) | F-A11Y-023 |
| Dialogs and sheets | Radix Dialog / AlertDialog / Popover contracts (overlay §1.3–1.4); New lead's Esc on a dirty form shows the inline discard state instead of throwing input away | F-A11Y-005 |
| Language | `lang` on the Language cell glyph and on transcript excerpts in the Calls tab (`hi`, `hi-Latn`, `ta`…); names `translate="no"` | direction §4.5 |
| Motion | Only the live dot and the listed transitions move; all stop or fade under `prefers-reduced-motion` | F-A11Y-022 |
| Forced colours | Selected and open rows get the `Highlight` outline (`aria-selected`, `aria-current`); tags and gate marks keep `CanvasText` borders; the meter track and fill carry `data-mark` | direction §8 |
| Zoom and reflow | 200% and 400% zoom switch to the tablet and phone layouts with nothing lost and no sideways page scroll | WCAG 1.4.10, F-RWD-001 |

---

## 11. Responsive behaviour (summary)

| | Desktop ≥1440 | Laptop 1280–1439 | Laptop 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Navigation | Sidebar 232 | Sidebar 232 | Rail 56 (+ overlay) | TopBar + NavSheet | TopBar + BottomBar + More |
| H1 | PageHeader | PageHeader | PageHeader | TopBar title | TopBar title |
| Header actions | Export · Import… · New lead | same | same | `⋯` (Export, Import…) · New lead | Select · New |
| ViewTabs | row, counts | row | row | scrolling row | scrolling row |
| Filters | 3 tokens inline | 3 inline | 2 inline | in the Filter button (count) | Filter · Sort · scrolling tokens |
| ViewSummary | full line | drops from the end | drops from the end | 3 items | 2 facts in the header meta |
| Table | P1–P3 | P1, P2, Language | P1, P2 | P1, pinned key and actions | ListRow, two lines |
| Density | Standard / Compact | same | same | Touch when coarse | Touch |
| Lead sheet | Docked 440 | Overlay, non-modal | Overlay, non-modal | Modal, 560, full height | Full screen, Back link |
| Call gate | Popover 400 | same | same | Popover or bottom sheet | Bottom sheet |
| Call from a row | "Call…" on hover and focus | same | same | `⋯` › Call… | Sheet footer or selection mode |
| BulkBar | Floats above the pager | same | same | same | Docked above the BottomBar |
| Wallet | Baseline + WalletNotice | same | same | TopBar chip + WalletNotice | TopBar chip + one-line WalletNotice |
| Import | Dialog md → lg | same | same | lg, width min(720, 100% − margins) | Full screen; mapping rows stack (column name over its Import-as select) |

---

## 12. Telemetry hooks

Events carry ids, counts and enums only: **never names, phone numbers, emails or search text** (F-UX-045). Session replay is off on `/leads`, or masks every table cell, sheet body, gate body and form field (`ph-no-capture` on those containers), verified with a recorded test session; analytics cookies wait for consent.

| Event | Properties | Question it answers |
|---|---|---|
| `leads_view_selected` | view id, is_saved_view, count bucket | Which queues do operators work? |
| `leads_filter_changed` | field, operator, value count, result bucket | Are the right filters there? |
| `leads_search` | query length bucket, result bucket (no text) | Does search find people? |
| `lead_sheet_opened` | source (click, keyboard, deep link, jk), tab | Is keyboard flow used? |
| `call_gate_opened` | entry (row, bulk, sheet, shortcut, palette), n requested | Where do calls start? |
| `call_gate_outcome` | result (started, scheduled, cancelled, blocked), blockers, skipped by reason, includes clicked, n final, cost band, seconds open | Which checks block or adjust most; is the gate slow? |
| `call_request_without_gate` | — (must stay at 0; alert if not) | Is P3 intact? |
| `bulk_action` | action, n, undo used | Is bulk beyond calling useful? |
| `import_step` | step, rows, rows skipped by reason, duplicate policy, seconds | Where do imports fail? |
| `lead_created` | via (dialog, create-and-add-another), duplicate warning shown | Is manual entry clean? |
| `export` | scope, format, masked, n bucket | Who needs full numbers? |
| `shortcut_used` | key, context; `shortcuts_disabled` toggled | Keep single-key shortcuts on by default? |
| `density_changed`, `columns_changed` | value, column ids | Defaults right? |

---

## 13. Acceptance criteria

**Truth and safety**
- [ ] With 120 fixture leads, pressing `c`, `C` or Enter anywhere on the page sends **no** call request; `C` opens the Call gate (network assertion).
- [ ] Every call entry point (row Call…, sheet Call…, BulkBar, `C`, ⌘K) opens the gate; the only request that places calls is `POST /api/calls/batches` from **Start**, carrying a gate token and an idempotency key; a double click sends one request.
- [ ] At ₹0 wallet, every Call entry is `aria-disabled` with "Wallet is ₹0. Top up to place calls."; Top up opens the Top-up sheet (`/billing?topup=1`), never Profile.
- [ ] Outside calling hours, Start is disabled with the reason and Schedule is offered; a lead called in the last 24 h is skipped until Include; a Do-not-call lead is always skipped.
- [ ] The cost line shows a range with floor/ceil rounding or, without rate data, "Rate ₹0.04/s"; never a single estimate.
- [ ] Header meta, tab counts and ViewSummary match `/api/leads/stats` on page 2 at size 20 (the F-QA-015 case: "All 24", not 4).
- [ ] While loading, no count renders `0`; with B3, B4 or B5 absent, their column, filter and view are absent.

**URL and navigation**
- [ ] Reloading `/leads?view=interested&q=pune&f.language=hi&sort=interest:desc&page=2&size=25&lead={id}&tab=calls` restores view, search, filter token, sort, page, size, the open sheet and its tab.
- [ ] Back after Next page returns to page 1; Back after opening a lead closes the sheet.
- [ ] `/leads/{id}` redirects to `/leads?lead={id}`; a lead outside the current page opens with "Not in the current results".

**Layout and density**
- [ ] Measured at inner viewports (`05-responsive` §2.1, §17.1), Standard shows ≥ 16 full rows at 1440×900; ≥ 12 at 1366×657 (a 1366×768 laptop; views and Baseline folded, BaselineChip in the header); ≥ 11 at 1366×625 (with a bookmarks bar); ≥ 10 at 1280×609 (1280×720); ≥ 12 at 1536×730; ≥ 10 Touch rows at 1024×690 (iPad landscape); ≥ 8 ListRows at 360×780; ≥ 9 at the 390×844 mock size and ≥ 8 at 390×750 (iPhone Safari); ≥ 4 at 844×340 (landscape iPhone).
- [ ] Column headers stay visible while scrolling at every width ≥ 768 (F-RWD-012); header and cell edges align (visual test).
- [ ] Fit-by-priority: at 1440 with the sheet docked only P1 columns show; at 1024 with the rail P1 + Phone + Interest.
- [ ] No horizontal page scroll at 320, 360, 390, 768, 1024; no FilterBar overflow at 1024.
- [ ] No texture, gradient or blur on the page; the Interest meter is ink, not Neel; one filled Neel button in the header (and one in the BulkBar while it shows).

**Keyboard and assistive tech**
- [ ] Tab reaches the table in one stop; ↓↓ then Enter opens the sheet with focus on its title; Esc returns focus to the same row (Playwright).
- [ ] J/K move real focus (`document.activeElement` is the row); with the sheet open they change the lead and announce "Lead n of N".
- [ ] With "Single-key shortcuts" off, `/`, J, K, X, C, N and `?` do nothing and their keycaps disappear; modifier shortcuts still work.
- [ ] Enter on a focused New lead button opens New lead, never a lead (F-A11Y-004 verifier case).
- [ ] axe: 0 violations on the page, the sheet, the gate, New lead and every Import step, in both themes; every checkbox and icon button has a name at 390 px.
- [ ] Announcements fire for result counts, selection, sort, page range and gate results, at most one per 2 s per key.

**Records and bulk**
- [ ] Delete lead is only in `⋯` menus; ≤ 50 leads delete with an Undo toast (or a confirm without soft delete); > 50 or "all matching" require typing the count.
- [ ] Checking a row checkbox never scrolls the table.
- [ ] Set status and Assign flow apply to all selected leads, including a server-side "all 1,284" selection, and Undo reverts all of them.
- [ ] The Calls tab count equals the Cockpit's count for the same lead; a call stuck `queued` past the reaper window reads "Timed out".

**Import and forms**
- [ ] A `.txt` file, a 6 MB CSV and a CSV without a mappable phone column cannot reach "Import"; each shows its reason.
- [ ] The mapping preview shows per-group row counts that add up to the file's row count; skipped rows download as CSV.
- [ ] New lead: "abc" as phone shows "Enter a 10-digit mobile number, like 98765 43210." on blur; Esc on a dirty form shows the discard state; after Create, focus returns to New lead.

---

## 14. New components needed

| Component | Why | Spec here | Proposed home |
|---|---|---|---|
| **Gate / `CallGate`** | Was referenced as "the Gate spec" and did not exist; Leads needed its content | §6.10 is now configuration only | **Done:** `spec/02-components-gate.md` (CallGate single and batch, PublishGate, SetupTrack and the other variants share GateChecklist and GateCheckRow) |
| **`ViewSummary`** | Pipeline KPIs as one scoped line | §6.3 (Leads metrics) | Defined by `04-call-reports-analytics` §4.1; Leads follows it |
| **`PhoneText`** | Now specified in data-nav §5.8 (Hanken, tabular figures, never mono): masking format, `aria-label` "Phone ending 0142", Reveal (permitted roles, logged), Copy after reveal | §6.6, §6.9, §10 | data-nav §5.8 (done) |
| **`ImportDialog` + `ImportMapping`** | Core §7.2 hands off to "the Import mapping preview (data group)", which data-nav does not define | §6.12 | data-nav, next to DataTable |
| **DataTable fit-by-priority** | data-nav §7.5 shows columns by viewport breakpoint; with a docked 440 px sheet the viewport rule shows columns that don't fit. Columns join by **container width** in priority order | §6.6 | An amendment to data-nav §7.5 (container query `inline-size`) |
| **ListRow sort control** | Phone lists have no headers, so sort needs a control | §5.5 | data-nav §7.13, "Sort" bottom-sheet radio list |
| **ListRow tag height on touch** | Touch density lifts `--tag-h` to 24, which makes a two-line ListRow 64 px and drops 360×780 to 7 rows. Tags in a ListRow are not interactive, so they keep `--size-tag` (20): rows are 60 px, 8 fit at 360×780 (measured in the mock) | §5.5 | An amendment to data-nav §7.13 |

Token requests: none (01-foundations §18 lists every registered token). Every size here is an existing token or a `calc()` of one; the fit thresholds are sums of the column minimums and live in the table's column config, not in tokens.

---

## 15. Open questions for the product owner

1. **Status set.** Today's statuses are New, Contacted, Interested, Scheduled, Converted, Not interested, Lost; the domain map (data-nav §5.3) has New, Contacted, Callback due, Interested, Not interested, Not reached, Converted, Do not call. Proposed migration: Scheduled → Callback due (when a callback time exists) or Interested, Lost → Not interested. Confirm.
2. **Callbacks.** Does the Outcome step "Callback" write `callback_at`, and may operators set it by hand? Until it exists, the Callbacks due view is hidden (B5).
3. **DND and consent.** May a DND-registered lead be included when the workspace records consent (service or transactional calls)? Should Import require a consent attestation? Calling hours: one window per workspace, or per flow?
4. **Repeat-call window.** 24 h proposed for the "recently called" skip; per workspace or fixed?
5. **Batch limits and pacing.** Is there a maximum batch size or concurrency the gate should state ("Calls start in order within a minute")? Should very large "all matching" batches require Schedule?
6. **Roles.** Confirm the member/admin matrix in §7.6 (Reveal, full-number export, delete, shared views).
7. **Export threshold** for switching from direct download to a background job (5,000 proposed), and whether large exports are emailed.
8. **Single-key shortcuts default** for new users: on (safe now that `C` only opens the gate) or off (data-nav open question 3).
9. **Phone calling from lists.** This spec removes the per-row call button on phones (data-nav open question 6). Confirm with sales operations.
10. **WhatsApp…** in the sheet footer depends on the WhatsApp integration's template picker, which is outside this spec.

---

## 16. Traceability

| Finding | Resolved in |
|---|---|
| F-A11Y-004, F-UX-013 | §6.6 row actions, §6.7, §6.10, §8.1, §13 |
| F-VIS-009, F-RWD-012 | §5.0–5.1, §6.5, §6.6 |
| F-QA-015 | §3.2, §6.2–6.4 |
| F-QA-016, F-UX-031 | §3.1, §6.8, §13 |
| F-UX-032, F-UX-035, F-QA-037 | §6.6, §6.7, §6.9, §7.3 |
| F-A11Y-010, F-A11Y-018, F-A11Y-012, F-A11Y-014 | §6.6, §8.2, §10 |
| F-A11Y-003, F-A11Y-005, F-UX-025, F-QA-021 | §6.11, §10 |
| F-A11Y-008, F-A11Y-019, F-VIS-002, F-VIS-017 | §6.6, §10 |
| F-A11Y-016, F-A11Y-023, F-A11Y-024 | §6.4, §6.5, §6.10, §10 |
| F-RWD-011 | §5.5, §5.6 |
| F-QA-022, F-UX-016 | §6.12, §9 |
| F-UX-002, F-QA-004, F-UX-028, F-RWD-013 | §6.1, §6.10, §7.1 |
| F-UX-005, F-VIS-037, F-UX-014 | §6.5, §6.9, §6.10 |
| F-UX-030 | §6.2, §7.1 |
| F-UX-045 | §12 |
| F-VIS-006, F-VIS-022, F-VIS-031 | §6.2, §6.5, §6.6 |
