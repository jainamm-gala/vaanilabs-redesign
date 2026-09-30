# 03-pages · 04 · Call reports and Analytics

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** calls-analytics (`/call-reports`, `/analytics`)
**Follows:** `spec/00-design-direction.md` (Sutradhar, especially §6.4 and §6.6), `spec/01-foundations.md` + `spec/tokens/tokens.css`, and the component specs `spec/02-components-core.md`, `spec/02-components-data-nav.md`, `spec/02-components-overlay-feedback.md`. Every component below is named as those specs name it. Anything they do not cover is listed in §4 "New components needed".
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-RWD-…, F-A11Y-…, F-QA-…) refer to `audit/consolidated/`. Raw ids (EXPLORE-DATA-…) refer to `audit/raw/explore-data.md`.
**Privacy:** every name, number, flow and workspace in this spec and its mock is fictional. No customer or lead data from the audit appears here.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/04-call-reports-analytics.md`, assembled from `.part1.md` to `.part7.md` (edit the parts, then re-assemble) |
| Reference mock (both pages, desktop, tablet and phone, light and dark) | `spec/03-pages/04-call-reports-analytics.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `spec/03-pages/04-call-reports-analytics-desktop.png` (1440, light), `-dark.png` (1440, dark), `-mobile.png` (390) |

**Contents.** Part 1: §0 decisions (what belongs where) and §1 the shared layer (metrics, scopes, drill-down, URLs, data dependencies, glossary). Part 2: §2.1–2.5 Call reports (purpose, findings, hierarchy, wireframes, components). Part 3: columns, §2.6 the call detail sheet (with the review run), §2.7 states. Part 4: §2.8–2.13 keyboard, copy, accessibility, responsive, telemetry, acceptance. Part 5: §3.1–3.5 Analytics (purpose to components). Part 6: §3.6–3.12 Analytics (states to acceptance). Part 7: §4 new components (including the StatStrip and ReportSection), §5 reconciliations with the component specs, §6 open questions, §7 traceability.

---

## 0. Decisions: what belongs where

Today the two pages answer overlapping questions in two different visual dialects, with numbers that disagree: average duration is 90 s on one and 1m 18s on the other, calls are "BROWSER" on one and "INBOUND/OUTBOUND" on the other, and both count each browser test twice (F-UX-011, F-QA-006, F-QA-014, EXPLORE-DATA-17). The fix is a division of labour plus one shared metrics layer.

| The operator asks… | Page | Why there |
|---|---|---|
| Which calls happened, and which ones need me? | **Call reports** | A ledger: one row per conversation, filterable, sortable, paginated on the server |
| What was said, what was captured, how did it end? | **Call reports** › call detail sheet | Transcript, recording, summary and captured fields belong to one call |
| How are we doing over time? Is it getting better? | **Analytics** | Trends, deltas and shares need a range and a comparison period |
| Where do callers drop off, and why do people call? | **Analytics** | Funnel per flow version and intent clusters are aggregates, not records |
| Which calls sit behind this number? | **Analytics → Call reports** | Every Analytics number is a link that opens Call reports with the same filter and range (§1.3) |
| Who am I, what plan am I on, is my inbound number live? | **Not these pages** | Workspace switcher and account menu (identity), Billing › Plans (plan), Settings › Phone setup (inbound number). Analytics keeps only a "Calls to your number" card that reads the Phone setup state |

**D1. Call reports is the ledger, Analytics is the report.** Call reports never shows trends or week-over-week deltas. Analytics never shows a transcript or a per-call action other than "open it in Call reports".

**D2. Every number opens its calls.** This is the Sutradhar idea of "holding the threads" applied to data (direction §0, P1): no aggregate is a dead end. Bars, sentiment segments, funnel steps, intent rows, hour bars and StatStrip cells are links into Call reports with the matching URL (§1.3). This also replaces today's only working cross-link, Analytics §07 "Open report ›" (01-product-understanding part 5, row 11), with one that exists everywhere.

**D3. One metrics layer.** One aggregate endpoint (`GET /api/calls/stats`) and one definitions module (`lib/metrics.ts`) serve both pages, Home and Billing › Usage. Counts are **conversations, not legs**, and **test calls are excluded by default** on both pages, with the same switch semantics (F-QA-006, F-QA-014, F-UX-011).

**D4. Call reports drops its KPI cards.** The four cards mixed a server total with averages of the 50 loaded rows (F-QA-014) and cost about 100 px of a table page. They become one **ViewSummary** line (new, §4) that always describes the current view, filters and range: "In this view · 212 calls · 4h 36m talk time · avg 1m 40s · 21 negative". The StatStrip with deltas lives on Analytics only (D12).

**D5. Identity, DID and Recordings leave Analytics.** §01 Identity (operator card, plan, role) pushed the KPIs below the fold (F-VIS-010) and duplicated the chrome's missing identity (F-UX-029). The DID card pointed at a Billing page that cannot allocate numbers (F-UX-015, EXPLORE-DATA-21). §08 Recordings said "No call recordings yet" with no reason (F-UX-011). Recordings now live on each call, with the reason when absent (RecordingPlayer "Unavailable" state).

**D6. One range, in the URL, obeyed by every section.** Analytics gets a single range control in the page header (`?range=30d`); every card's meta names the range. Call reports expresses the same range as a date FilterToken ("When · Last 30 days"). Drill-downs carry the range across (F-UX-036, EXPLORE-DATA-10).

**D7. Captured fields collapse into one column.** One Captured column (off by default, on in the Needs review view), plus per-field columns only when exactly one flow version is filtered, labelled "Field · step n" when names repeat (F-UX-009, F-VIS-027, F-A11Y-018, data-nav §7.6).

**D8. The call detail is a 560 px sheet, deep-linked.** `?call=<id>` opens it even when the call is not on the current page. Tabs are **Transcript · Summary · Captured**, Transcript first and default, with the one-line AI summary, outcome and sentiment always visible in the sheet header (F-UX-010, F-A11Y-002; reconciliation in §5).

**D9. Five sentiment values everywhere.** Positive · Neutral · Mixed · Negative · Unscored, from `lib/status.ts`, as views on Call reports and as a fixed-order stacked bar on Analytics, with grey neutral (F-UX-046, F-VIS-011).

**D10. One visual language: the one the audit said to keep.** Both pages use the Call reports / Assistant template the audit called out as the one to copy (00-summary §4): calm sans, sentence case, a title-20 H1 with one line of computed meta and right-aligned actions (PageHeader). Analytics loses the § numerals, serif-italic kickers, 27 px/800 section titles, HUD corner brackets, hatch and graph-paper grid (F-VIS-010, F-VIS-022, F-UX-043).

**D11. Exports say what they contain.** Call reports exports the rows of the current view (`Export…`). Analytics exports the data behind its cards as CSV and a printable PDF report built from the same tokens, not a separate editorial style (F-VIS-010 suggested the editorial look only for an export; Sutradhar declines it, because one brand across screen and paper is simpler to trust).

**D12. Analytics reads like a report, not a wall of cards.** The KPIs are one hairline-divided **StatStrip** (new, §4.6), not four cards, and a KPI trend line appears only in a preview on hover or focus. Every chart is a **section**: an `h2`, its meta and its plot on `surface`, separated from its neighbours by hairlines, never inside a Card (direction P7 and anti-pattern 7: one level of containment, no cards for layout). Single-series marks are graphite (`--chart-neutral`); Neel (`--chart-highlight`) marks only the hovered, focused or selected period, so the page is not all Neel (direction §3.1, foundations §3.6). The "Latest calls" table is removed: Analytics links to calls, Call reports lists them (D1).

---

## 1. The shared layer (both pages)

### 1.1 Metric definitions (`lib/metrics.ts`)

One module holds every metric's name, definition (shown in the StatStrip ⓘ and section tooltips), counting rule, format and `deltaTone` (data-nav §4.7). The server's `/api/calls/stats` uses the same ids.

| id | Label (UI) | Definition (tooltip text, verbatim) | Format | Up is |
|---|---|---|---|---|
| `calls` | Calls | Conversations placed or received in the range. A browser test counts once, even if it was stored as two legs. Test calls and browser tests are excluded unless you include them. | `formatCount` | good |
| `answered` | Answered | Share of outbound calls that connected to a person or voicemail. Inbound calls always count as answered. | `12%`, 0 decimals | good |
| `talk_time` | Talk time | Total time with the line connected, across all calls in the range. | `4h 36m` | neutral |
| `avg_talk` | Avg talk time | Mean talk time of answered calls. Unanswered calls are left out so they don't pull the average down. | `formatDuration` (`1m 18s`) | neutral |
| `minutes_used` | Minutes used | Billable phone minutes, per-second billing rounded to the minute for display. Free minutes and anything the server marks as not billed are left out; see Billing › Usage. | `formatCount` + "min" | neutral |
| `sentiment_*` | Positive · Neutral · Mixed · Negative · Unscored | One score per conversation, from the AI analysis. Unscored means the call was too short or not yet analysed. | count and share | positive good, negative bad, others neutral |
| `needs_review` | Needs review | Calls with negative or mixed sentiment, a failed or timed-out result, or no outcome captured, that nobody has marked reviewed. | `formatCount` | bad |
| `reached_step` | Reached | Calls in this flow version that got to this step. | count · share of calls that entered the flow | good |
| `dropped_at_step` | Drop-off | Calls whose last step was this one and that ended without an outcome. | count · share of those who reached it | bad |
| `intent_share` | Share | Share of analysed calls in the range assigned to this intent. One call has one main intent. | count · % | neutral |

- **Average, not median, for v1:** the audit found two different averages, not a median debate. The definition says which calls are included, which is what made the two pages disagree (F-UX-011). A median can be added as `median_talk` later.
- **Deltas** compare with the previous period of equal length ("vs previous 30 days"). Below 1 % or 1 unit the delta reads "No change" (data-nav §4.7). When the previous period has no calls: "No calls in the previous 30 days", never "+∞%" or "+2533%" (today's §02 chips).

### 1.2 The scope line (one grammar on both pages)

Every number shows its scope, in this order, separated by " · ": **window · counting rule · test-call rule · filter note**. Examples:

| Where | Scope text |
|---|---|
| Analytics StatStrip (one line under the strip, not one per cell) | `Last 30 days · calls, not legs · test calls excluded` |
| Analytics card meta | `Last 30 days · 212 calls` (the counting rule is in the page meta once) |
| Funnel card meta | `Site-visit qualifier v7 · 96 calls entered · last 30 days` |
| Intents card meta | `Last 30 days · 188 of 212 calls analysed · updated 26 Sep, 4:01 pm` |
| Call reports ViewSummary | `In this view · 38 calls · …` (the view, search, filters and range are what "this view" means; the tooltip lists them in words) |
| Call reports pager | `1–50 of 212 calls · test calls hidden` |
| With test calls included | append `· test calls included` everywhere above |

### 1.3 Drill-down contract (Analytics → Call reports)

Every link below opens `/call-reports` in the same tab (⌘/Ctrl-click opens a new tab: they are real `<a href>`). The Call reports FilterBar shows the carried filters as ordinary FilterTokens the user can remove; a small neutral Notice is **not** shown (the tokens already say it).

| Analytics element | Call reports URL (range `30d` shown) |
|---|---|
| StatStrip cell Calls | `?when=30d` |
| StatStrip cell Answered | `?when=30d&f.result=completed,voicemail` |
| A bar in Calls per day (21 Sep) | `?when=2026-09-21` |
| A segment in Sentiment by day (Negative, 21 Sep) | `?view=negative&when=2026-09-21` |
| Sentiment legend item (Negative) | `?view=negative&when=30d` |
| Funnel step 3 "Ask about a site visit", drop-off | `?when=30d&f.flow=fl_12@7&f.last_step=st_3&f.outcome=none` |
| Funnel step label | opens the step in the Flow Designer (`/flows/fl_12?step=st_3&version=7`), not Call reports (F-QA-019) |
| Intent row "Price enquiry" | `?when=30d&f.intent=int_price` |
| A bar in When calls come in (11 am) | `?when=30d&f.hour=11` (IST) |
| "Open these calls in Call reports" (end of the StatStrip scope line) | `?when=30d` |

Test-call inclusion travels too (`&test=1`). The Filter menu gains three call fields to receive these: **Intent**, **Last step reached** (per flow version), **Hour of day (IST)** (§2.5).

### 1.4 URL state (both pages, via `useUrlState`)

| Page | Params | Defaults (omitted from the URL) |
|---|---|---|
| Call reports | `view` (`all`, `review`, `positive`, `negative`, `mixed`, `unscored`, or a saved view id) · `q` · `when` (`today`, `7d`, `30d`, `90d`, `YYYY-MM-DD`, `YYYY-MM-DD..YYYY-MM-DD`) · `f.<field>` (comma lists) · `sort` (`when:desc`) · `page` · `size` (25, 50, 100) · `test` (`1`) · `cols` (column ids) · `call` (open sheet) · `tab` (`transcript`, `summary`, `captured`) · `t` (seek, seconds, only with `call`) | `view=all`, no `when` (all time), `sort=when:desc`, `page=1`, `size=50`, test calls hidden, `tab=transcript` |
| Analytics | `range` (`7d`, `30d`, `90d`, `YYYY-MM-DD..YYYY-MM-DD`) · `flow` (funnel flow id@version) · `test` (`1`) · `table` (card ids shown as tables) | `range=30d`, the funnel shows the flow with the most calls in the range |

Typing in search uses `replaceState`; discrete changes use `pushState`, so Back steps through views, filters, pages and open calls (F-UX-031, F-QA-016). "Copy link at 00:41" in the player produces `?call=<id>&t=41`.

### 1.5 Data dependencies and interim behaviour

The truthful UI needs these server changes (direction §8 backend sequencing). Until each ships, its UI element is **hidden, not simulated** (P1).

| # | Dependency | Unblocks | Interim behaviour until it ships |
|---|---|---|---|
| B1 | Server pagination, search, sort and filter on `/api/calls` (the API already accepts `offset`/`limit`, F-QA-005) | Pager, result counts, every filter | None acceptable. This ships with the redesign; the old 50-row table is not kept |
| B2 | `/api/calls/stats?from&to&filters` with the §1.1 definitions | ViewSummary, view counts, StatStrip | ViewSummary and view counts show "–" with "Counts are being recalculated"; the StatStrip is not rendered |
| B3 | Conversation model: legs grouped under one conversation, with a backfill of old pairs (F-QA-006) | "calls, not legs", the "2 legs" tag on backfilled records | Browser tests and Test calls (the test kinds of the shared call model, `01-agent-cockpit` §1.1) are hidden by default, so phone-call counts are already clean. When the user shows test calls, legs list separately with an outline Tag "Browser leg" and the scope line says "test calls counted per leg" |
| B4 | A `kind` enum (Real call, Test call, Browser test; `01-agent-cockpit` §1.1) and one `direction` enum (F-UX-011) | Test-call switch, Kind filter and tags | Browser test derived from today's `type = browser`; Test call not distinguishable yet, so it counts as a real call until B4 ships |
| B5 | Review state (`reviewed_at`, `reviewed_by`) | Needs review view, Mark reviewed | Needs review = negative + failed + no outcome in the last 7 days; the Mark reviewed button is hidden |
| B6 | Per-turn timestamps, speaker and language | TalkStrip, per-turn LanguageMarks, timecode seek | Plain Track scrubber; one language mark per call in the header |
| B7 | Recording availability with a reason code | Honest "no recording" copy | "No recording for this call." without a reason clause |
| B8 | Funnel per flow version with step ids; intent clusters with `computed_at` and a job status | Funnel links, "Updated…", stale and degraded states | Funnel without step links; intents meta without "updated" |
| B9 | Inbound number state from Phone setup | "Calls to your number" card | Card shows "Inbound number status is in Phone setup" with the link, no counts |

### 1.6 Glossary for these pages

| Concept | Use | Retire |
|---|---|---|
| The page | **Call reports** (nav, H1, `<title>`, phone bar) | "Call Reports", "Reports" (phone bar), "CALL DETAILS" |
| One record | **call** (a conversation); a browser test has **legs** | "call record", duplicate rows |
| How it ended | **Result** (Completed, No answer, Busy, Voicemail, Failed, Timed out) and **Outcome** (what the flow's Outcome step wrote: Visit booked, Callback…) | "Status COMPLETED" pills, "END" |
| Direction and kind | **Outbound / Inbound**; the call **kind** from the shared call model: Real call (no tag), **Test call** (your own phone, `flask-conical`), **Browser test** (Talk in browser, `monitor`) | "BROWSER", "INBOUND/OUTBOUND" caps, "— → —" |
| What the flow collected | **Captured** (fields and values) | "Key elements extracted", "Flow Builder fields", "extracted flow fields" |
| AI analysis | **Summary**, **Sentiment**, **Topics**, **Suggestions**; action **Re-analyse call** | "Re-analyze Transcript", "force=true", "AI SUGGESTIONS" |
| Numbers | **Inbound number** (Phone setup) | "Allocated DID", "PENDING · not allocated yet" |
| Time | `Today 10:42 am`, `21 Sep 2026`, durations `2m 31s`, timecodes `mm:ss`, IST named on hour charts | "23 Sept, 06:13", "87s" beside "1:27" (F-VIS-024) |
