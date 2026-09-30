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
