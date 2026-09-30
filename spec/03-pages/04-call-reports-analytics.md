<!-- Assembled from 04-call-reports-analytics.part1.md, 04-call-reports-analytics.part2.md, 04-call-reports-analytics.part3.md, 04-call-reports-analytics.part4.md, 04-call-reports-analytics.part5.md, 04-call-reports-analytics.part6.md, 04-call-reports-analytics.part7.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

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

---

## 2. Call reports (`/call-reports`)

### 2.1 Purpose and jobs to be done

**Purpose.** Review what happened on calls, one at a time or as a set, and act on what needs attention.

| Who | Job (when… I want to… so I can…) |
|---|---|
| QA analyst, team lead | When calls went badly this week, I want to see only those, read or hear them quickly, and mark them reviewed, so I can coach the flow or the team |
| Sales or support operator | When a lead says "you called me", I want to find that call by number, name or a phrase, and see the outcome and what was captured, so I can follow up correctly |
| Flow builder | When a step underperforms (from Analytics), I want the calls that dropped there, with the transcript at that step, so I can fix the prompt |
| Founder or ops lead | When checking a campaign, I want an honest count of calls and how they ended, in the range I care about, so I can trust the numbers |

**Primary job:** find the calls that matter and understand one of them in under a minute. Secondary: export a set; call a lead back (through the Call gate).

### 2.2 Audit findings addressed

| Finding | Today | Change |
|---|---|---|
| F-QA-005 (high), F-UX-009 (high) | 50 of 121 calls render; search, sort and filter cover only those 50 | Server pagination, search, sort and filter over every call; "1–50 of 212 calls"; `?call=` fetches any call (B1) |
| F-A11Y-002 (critical) | Rows open only by mouse; the panel never gets focus; Esc does nothing | Focusable rows with a key-cell link; Enter opens the sheet; focus moves to the sheet title; Esc returns focus to the row |
| F-UX-010 (high), EXPLORE-DATA-23 | 373 px panel, 2,504 px of content, transcript last in a nested 384 px scroller | 560 px sheet, one scroll container, Transcript tab first with the player on top |
| F-QA-006 (high), F-UX-011 (high), F-QA-014 | Two legs per test call; KPIs from 50 rows; 90 s vs 1m 18s | One row per conversation; test calls hidden by default; ViewSummary from the stats endpoint with the shared definitions |
| F-VIS-027, F-RWD-010 | 17 columns, 2,617 px, 87 % of flow-field cells are "—" | ≤ 9 priority columns; one Captured column; per-field columns only for one flow version |
| F-A11Y-018, F-UX-046 | No caption, scope or `aria-sort`; duplicate "Condition Check" headers; blanks sort first; no Mixed chip; wrong empty copy | DataTable semantics; "Field · step n" labels; blanks last; six views incl. Mixed and Unscored; separate filtered-empty copy |
| F-RWD-004 (high), F-RWD-009 | 255–337 px data strip on phones; search shrinks to 52 px; pills clip | One page scroller; full-width sticky search; ListRow list; full-screen sheet |
| F-VIS-024 | "23 Sept, 06:13", "87s", "1:27" | `lib/format.ts` everywhere |
| F-A11Y-019, F-A11Y-008 | Dash fillers at 1.75:1; BROWSER pill 2.56:1; NEUTRAL 2.83:1 | Solid `text-3` empty phrases; StatusTags ≥ 5.47:1 |
| F-UX-016, F-UX-019 | "force=true" tooltip; raw errors | Plain tooltips; errors from `lib/errors.ts` with Retry |
| F-UX-034, F-QA-018 | "Learn from this call" feeds a page that redirects members to the Cockpit | "Suggest knowledge from this call…" sends a proposal; members get a toast, never a link they can't open |
| F-UX-031, F-QA-016 | Open call and filters not in the URL | §1.4 |
| F-UX-028, F-QA-036 | 42 px wallet banner on this page too | No WalletNotice here (not a spending page); "Call back…" carries the wallet reason inline when blocked |
| F-QA-037 | Month-old calls still read "QUEUED" | Result "Timed out" (warning) after the reaper window |
| F-VIS-017 | Three uppercase pills per row | One StatusTag per cell; direction as icon + word |

### 2.3 Information hierarchy

The largest element is the table (P7). The eye should land, in order:

1. **The current view and how many calls it holds:** the selected view tab and its count, then the result count "38 of 212".
2. **Each row's When, Lead and Outcome** (P1 columns): the three facts that identify a call. Outcome is the **only tinted element in a row**: Sentiment is an icon and a word in `text-2` with no tint (direction §6.4), so a positive row is not green twice and Unscored is not a third outlined chip.
3. **Sentiment and duration**, then the rest of the row.
4. **The ViewSummary line** (quiet, meta-12): totals for what is on screen, and the link to trends.
5. **Chrome** (header meta, Export, Columns, density) stays quiet: no filled Neel button on this page (there is no creation action here; P2's one-primary rule allows zero).

Inside the call detail sheet: **who and when** (title) → **how it ended** (outcome, sentiment, one-line summary) → **the conversation** (player + transcript) → captured values and analysis.

### 2.4 Layout and wireframes

Shell per direction §6.1 and data-nav §1. Chrome at 1440×900: header 56 + views 40 + toolbar 48 + ViewSummary 32 + table head 32 + pager 40 + Baseline 28 = **276 px**, leaving about 15 Standard rows (19 Compact). At 1366×768: 12 Standard rows. At 1280×720 the Baseline folds into a header chip and the views fold into a "View: All ▾" Select (data-nav §3.7): 12 rows. The chrome budget (≥ 10 rows) holds at every laptop size.

**Desktop ≥ 1440, no call open**

```
┌ Sidebar 232 ─┬─────────────────────────────────────────────────────────────────────────────────────────┐
│ [S] Sample   │ Call reports  212 calls · 9 need review · updated 11:24 am          ↻ Refresh   Export… │ 56
│ ⌕ Search…    ├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Operate      │ All 212  Needs review 9  Positive 58  Negative 21  Mixed 14  Unscored 6   + Save view   │ 40
│ Build        ├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Data         │ [⌕ Search calls and transcripts…] [≡ Filter] [When  Last 7 days ×] Clear                │ 48
│  Leads       │                       38 of 212 · Test calls ○ · ▥ Columns · [Standard|Compact]         │
│ ▌Call reports├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Analytics   │ In this view · 38 calls · 49m talk time · avg 1m 38s · 6 negative     Trends in Analytics │ 32
│ Account      ├─────────────────────────────────────────────────────────────────────────────────────────┤
│              │ When ↓        Lead      Phone           Direction  Duration  Outcome        Sentiment   … │ 32
│              │ Today 10:42 am Meera S. +91 •••••• 3307 ↗ Outbound   2m 31s  ✓ Visit booked ☺ Positive   │ 40
│              │ Today 10:12 am Rohan I. +91 •••••• 9158 ↙ Inbound      41s  ✓ Callback      ◐ Mixed      │
│              │ Yesterday      Zoya S.  +91 •••••• 6612 ↗ Outbound       –  ☏ No answer     ◌ Unscored   │
│              │ …                     (Flow + version, Language, ⋯ continue to the right)               │
│              ├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Finish setup │ 1–50 of 212 calls · test calls hidden        Rows per page 50 ▾   Page 1 of 5   ‹  ›   │ 40
│ AR Anika R.  │ Live v7 · Site-visit qualifier │ Inbound … Ready │ Wallet ₹2,340.50 · about 16 h │ …    │ 28
└──────────────┴─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Desktop ≥ 1440, call open (sheet docked, 560 px).** The page header, views and toolbar span the whole content column; the sheet takes a grid column from under the toolbar to above the pager. The table keeps P1–P2 columns (When, Lead, Outcome, Sentiment, Duration) at 1440 and all P1–P3 at 1920 (reconciliation §5, R2). The open row carries the "current" treatment.

```
├───────────────────────────────────────────────┬─────────────────────────────────────────────┤
│ When ↓        Lead      Duration Outcome   Sen│ Meera S. · Today 10:42 am        ⌃ ⌄ 🔗 ⋯ × │ 56 sheet header
│▌Today 10:42 am Meera S.  2m 31s ✓ Visit bo… ☺ │ ✓ Visit booked ☺ Positive  Outbound · 2m 31s │
│ Today 10:12 am Rohan I.     41s ✓ Callback  ◐ │ Site-visit qualifier v7 · अ Hindi · A English│
│ Yesterday      Zoya S.        – ☏ No answer ◌ │ "Wants a Saturday site visit near the metro; │
│ …                                             │  budget ₹85 L to ₹1 Cr." (one-line summary)  │
│                                               ├─────────────────────────────────────────────┤
│                                               │ Transcript   Summary   Captured 3            │ 40 tabs
│                                               ├─────────────────────────────────────────────┤
│                                               │ ❚❚ ↺5 ↻5  00:41 / 02:31            1× ▾  ⋯ │ sticky player
│                                               │ ▬▬ ▬▬▬ ▬▬|▬   ▬▬▬   ▬▬   ▬▬  (agent)        │
│                                               │   ▬    ▬▬▬   ▬▬▬   ▬▬  ▬  (caller)         │
│                                               │ Agent 58% · Caller 42% · Recording disclosed │
│                                               │ 00:17 Caller अ  हाँ जी, बोलिए।                 │
│                                               │▌00:41 Vaani A  Step · Ask about a site visit │ playing turn
│                                               │       2 BHK homes start at ₹85 lakh…         │
│                                               ├─────────────────────────────────────────────┤
│                                               │ Call back…   Mark reviewed        Open lead  │ 56 footer (in Needs review: "Mark reviewed and next", §2.6.4)
├───────────────────────────────────────────────┴─────────────────────────────────────────────┤
│ 1–50 of 212 calls · test calls hidden                  Rows per page 50 ▾  Page 1 of 5  ‹ › │
```

**Laptop 1280–1439.** Same sidebar and table (P1–P3). The sheet **overlays** the right edge under the page header (non-modal, `e3`, no scrim); the table behind stays interactive, and F6 moves focus between them.

**Laptop 1024–1279.** 56 px rail with tooltips; P1–P2 columns by default (When, Lead, Outcome, Sentiment, Duration); FilterBar shows up to 2 tokens and an icon-only Columns button. Sheet overlays as above.

```
┌R┬───────────────────────────────────────────────────────────────────────────────┐
│a│ Call reports  212 calls · 9 need review · updated 11:24 am      ↻  Export…    │
│i│ All 212  Needs review 9  Positive 58  Negative 21  Mixed 14  Unscored 6        │
│l│ [⌕ Search calls and transcripts…] [≡ Filter] [When Last 7 days ×]   38 of 212 ▥│
│ │ In this view · 38 calls · 49m talk time · avg 1m 38s · 6 negative   Trends     │
│5│ When ↓            Lead         Outcome           Sentiment      Duration     │
│6│ Today 10:42 am    Meera S.     ✓ Visit booked    ☺ Positive       2m 31s     │
│ │ 1–50 of 212 calls                          Rows per page 50 ▾ Page 1 of 5 ‹ ›  │
│ │ Baseline                                                                        │
└─┴───────────────────────────────────────────────────────────────────────────────┘
```

**Tablet 768–1023.** 52 px TopBar (menu, "Call reports", wallet chip, call chip only during a call, search). The page header row keeps meta left and `Export…` in `⋯`. Views scroll horizontally with the edge fade. Filter tokens fold into the Filter button with a count. P1 columns (When, Lead, Outcome) plus user columns, horizontal scroll with When and Lead pinned left and `⋯` pinned right. The sheet is modal, full height, `min(560, 100%)` wide, with a scrim.

```
┌──────────────────────────────────────────────────────────┐
│ ☰  Call reports                    ₹2,340  ⌕             │ 52 TopBar
│ 212 calls · 9 need review                         ⋯      │ 48
│ All 212  Needs review 9  Positive 58  Negative 21  Mix…▸ │ 40 (scrolls)
│ [⌕ Search calls and transcripts…      ] [≡ Filter 1]     │ 48
│ In this view · 38 calls · avg 1m 38s · 6 negative        │ 32
│ When ↓          Lead        Outcome          Sentiment ▸ │
│ Today 10:42 am  Meera S.    ✓ Visit booked   ☺ Positive  │
│ 1–50 of 212 calls                     Page 1 of 5  ‹ ›   │
└──────────────────────────────────────────────────────────┘
```

**Phone 320–767.** One page scroller (F-RWD-004): the header row and ViewSummary scroll away; the search row sticks under the TopBar. ListRows (data-nav §7.13), at least 8 visible at 360×780. The call opens as a full-screen sheet with "Back to Call reports", the player sticky at its top, and the actions in a sticky 56 px bar.

```
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ ☰ Call reports    ₹2,340  ⌕  │   │ ‹ Back to Call reports   ⋯   │ 56
│ 212 calls · 9 need review  ⋯ │   │ Meera S.                     │
│ All 212 Needs review 9 Pos…▸ │   │ Today 10:42 am · 2m 31s      │
│ [⌕ Search calls…           ] │ ← │ ✓ Visit booked  ☺ Positive   │
│ [≡ Filter 1][When 7 days ×] ▸│   │ Wants a Saturday site visit… │
│ 38 calls · avg 1m 38s · 6 neg│   │ Transcript  Summary  Captured│
│ Meera S.       ✓ Visit booked│   │ ▶  00:41 / 02:31   1× ⋯      │ sticky
│ Today 10:42 am · 2m 31s  ☺ P…│   │ ▬▬ ▬▬▬ ▬▬|▬  ▬▬▬  ▬▬         │
│ Rohan I.       ✓ Callback    │   │ 00:17 Caller अ               │
│ Today 10:12 am · 41s     ◐ M…│   │ हाँ जी, बोलिए।                  │
│ Zoya S.        ☏ No answer   │   │ 00:41 Vaani A · Ask about a… │
│ Yesterday · –            ◌ U…│   │ 2 BHK homes start at ₹85…    │
│ 1–50 of 212   Page 1 of 5 ‹ ›│   ├──────────────────────────────┤
├──────────────────────────────┤   │ [ Call back… ][Mark reviewed]│ 56
│ BottomBar · Call reports ✓   │   └──────────────────────────────┘
└──────────────────────────────┘
```

(Glyphs in wireframes stand for Lucide icons: ✓ `check`, ☺ `smile`, ◐ `contrast`, ◌ `circle-dashed`, ☏ `phone-missed`, ↗ `phone-outgoing`, ↙ `phone-incoming`.)

### 2.5 Components used, with configuration

| Region | Component (spec) | Configuration |
|---|---|---|
| Header | `PageHeader` (data-nav §2), variant `page`, `navId="call-reports"` | Meta: `{calls} calls · {needsReview} need review · updated {time}` from B2 (skeleton while loading, never "0"). Actions: tertiary `RefreshButton` (core §2.6), tertiary `Export…` opening the Export popover (§2.6.5). No primary. Below 1024 both fold into `⋯` |
| Views | `ViewTabs` (data-nav §3) | `All · Needs review · Positive · Negative · Mixed · Unscored` + user views + "Save view". Counts are server view counts over all calls, like Leads (data-nav §3.2, F-QA-015): they never describe a page of rows and do not move with search or filters. What search and filters narrow is stated by the result count ("38 of 212") and the ViewSummary |
| Toolbar | `FilterBar` (data-nav §6) | Search label "Search calls", placeholder "Search calls and transcripts…" (server search over lead name, masked-number suffix, summary and transcript text). Filter fields in order: **When** (date presets, IST), **Result**, **Outcome**, **Direction**, **Flow** (FlowSwitcher, core §5.4, lists name + version, disambiguates duplicate names by version and last edit, F-VIS-037), **Language**, **Duration** (number, s), **Intent**, **Last step reached** (only with one flow version), **Hour of day (IST)**, **Captured value** (text, contains), **Reviewed** (yes/no, B5), **Kind** (Real call, Test call, Browser test; listed only while test calls are shown). Right group: result count, the **Test calls** Switch (core §6.3, label "Show test calls", tooltip "Includes test calls and browser tests", `?test=1`), Columns, Density |
| Summary | `ViewSummary` (**new**, §4.1) | "In this view · {calls} calls · {talk_time} talk time · avg {avg_talk} · {negative} negative"; link "Trends in Analytics" carrying `range` and filters Analytics supports |
| Table | `DataTable` (data-nav §7), `id="call-reports"`, frame `flush`, rows `role="grid"` | Columns below. `getRowHref = /call-reports?call={id}` (keeps the current query). Default sort `when:desc`. Row actions: `⋯` only (Open lead, Copy link, Re-analyse call, Download transcript (.txt), Export call (CSV)). No bulk selection in v1 (open question Q3) |
| Pager | `Pager` (data-nav §7.11) | "1–50 of 212 calls · test calls hidden"; sizes 25 · 50 · 100 |
| Detail | `Sheet` variant `detail` (overlay §4), 560 | §2.6 |

---

**Columns** (`meta.priority`, `meta.mobile`; all sortable except Captured and Language):

| Column | P | Cell | Empty value | Mobile slot |
|---|---|---|---|---|
| When | 1 | `formatWhen` in `<time>`, absolute date + IST in tooltip; pinned left ≥ 768 | never empty | meta (first) |
| Lead | 1 | key cell link: lead name (`translate="no"`), or the masked number when no lead exists; pinned left ≥ 768 | "Unknown caller" `text-3` (inbound without caller ID) | title |
| Outcome | 1 | one `StatusTag`: the Outcome step's label if one was written (domain `outcome`), else the Result (domain `call result`) | "No outcome" `text-3` | titleTrailing |
| Sentiment | 2 | `StatusTag` domain `sentiment`, `appearance="plain"` (§4.5): icon 14 in `text-3` + word in `text-2`, **no tint and no outline**, so Outcome stays the row's only tint (direction §6.4) | "Unscored" with `circle-dashed`, word in `text-3` | metaTrailing |
| Duration | 2 | right-aligned `formatDuration` of talk time | "–" + visually hidden "No talk time" | meta |
| Phone | 3 | `PhoneText` masked `+91 •••••• 4821` (tabular) | "Withheld" `text-3` | hidden |
| Direction | 3 | icon (`phone-outgoing` / `phone-incoming`) + word; plus an outline Tag "Test call" (`flask-conical`) or "Browser test" (`monitor`) when test calls are shown | – | meta (word only) |
| Flow | 3 | "Site-visit qualifier v7" (name `text`, version `text-3`), link to the flow at that version | "No flow" `text-3` (manual calls) | hidden |
| Language | 3 | `LanguageMark` `name` (plain text, no glyph tile, data-nav §5.6); mixed calls read "Hindi +1" with both in the tooltip | "–" | hidden |
| Captured | 4 | "Budget ₹85 L to ₹1 Cr · Day Saturday · +1", `32ch`, tooltip with all; on by default in Needs review | "Nothing captured" `text-3` | hidden |
| Summary | 4 | one line, `48ch`, full text in tooltip and sheet | "Not analysed yet" `text-3` | hidden |
| Result | 4 | StatusTag domain `call result` (shown separately only when the user adds it) | – | hidden |
| Cost | 4 | `formatMoney` (₹1.84), right-aligned; phone calls only | "Not billed" `text-3` when the server says so | hidden |
| Call id | 4 | `mono-12` + Copy IconButton on hover | – | hidden |
| Per-field captured columns | 4 | only when one flow version is filtered; header "Field · step n" when labels repeat; ColumnsMenu group "Captured by Site-visit qualifier v7"; "Empty in these results" group for all-empty fields | "Not captured" `text-3` | hidden |

At most 9 visible by default (direction §6.4). Column choices persist per user and per table id (data-nav §7.17).

### 2.6 The call detail sheet

`Sheet` variant `detail` (overlay §4): 560 px, docked at ≥ 1440 (a grid column from under the FilterBar to the Baseline; ViewSummary, table and pager stay in the left column), non-modal overlay at 1024–1439, modal full height at 768–1023, full screen below 768. `role="dialog"` without `aria-modal` when non-modal, labelled by its title. The body is the **only** scroll container (F-UX-010).

#### 2.6.1 Header (fixed, never scrolls)

| Row | Content and tokens |
|---|---|
| Title row (56) | Title `title-16` as `h2`: "{Lead name} · {When}" ("Meera S. · Today 10:42 am"; masked number when there is no lead), `translate="no"` on the name, truncated with a tooltip. IconButtons 32, right-aligned: **Previous call** (`chevron-up`, tooltip keycap K), **Next call** (`chevron-down`, J), **Copy link** (`link`), **⋯** (§2.6.4), **Close** ("Close call details", last). Below 768 the title row becomes "‹ Back to Call reports" + ⋯ and the title moves to the next row |
| Glance rows | Row 1: one `StatusTag` for the outcome, then sentiment as a plain StatusTag (icon + word, `text-2`, as in the table), then the call's LanguageMarks (one per language, P1). Row 2, `meta-12` `text-3`: "Outbound · 2m 31s · Site-visit qualifier v7 · recording disclosed at 00:01". Qualifier Tags `outline` when they apply: "Test call" or "Browser test" (the kind, `01-agent-cockpit` §1.1), "2 legs" on backfilled records (tooltip "Recorded as two legs. Counted once."), "Reviewed" |
| Summary line | The AI summary's first sentence, `body-14` `text-2`, clamped to 2 lines, with "Full summary" (link button, opens the Summary tab). "Not analysed yet" in `text-3` while analysis is pending |
| Tabs (40) | `PanelTabs` (automatic activation): **Transcript** · **Summary** · **Captured {n}** (count of captured fields), in `?tab=` |

#### 2.6.2 Transcript tab (default)

1. **RecordingPlayer** (data-nav §12.5), `position: sticky; top: 0` inside the body so it stays reachable while reading. Scrubber choice: TalkStrip when per-turn timing exists (B6), else Waveform from server peaks, else Track. The legend shows "Agent 58% · Caller 42% · 9 turns · 1 interruption" and "Recording disclosed at 00:01". `?t=` seeks on open. Speed menu 1×, 1.25×, 1.5×, 2× (remembered per user).
   - **Unavailable:** info Notice (inline), reason from B7: "No recording for this call. Recording is off for browser tests. The transcript is still available." / "…Recording was turned off for this flow." / "…The call didn't connect." The header and page never promise recordings that don't exist (F-UX-010).
2. **TranscriptFeed** mode `review` (data-nav §12.4): header "Transcript" `title-14` + "18 turns" `meta-12`; tools: Search (⌘/Ctrl+F while focus is in the sheet; "2 of 7" with previous and next), Copy transcript, `⋯` (Download .txt). Turn rows with the 56 px timecode gutter; timecodes are seek buttons ("Play from 00:41"); step links open the flow at that step and version; system rows for step moves, knowledge lookups and transfers; the playing turn uses the active treatment and "Follow playback" pinning.
3. **End row:** "Call ended · 02:31 · Outcome written: Visit booked" (`meta-12` `text-3`, `phone-off` 14).

#### 2.6.3 Summary and Captured tabs

**Summary** (`KeyValueList`, sections with `h3`):

| Section | Rows |
|---|---|
| Analysis | Sentiment (plain StatusTag) · Caller satisfaction (Low / Medium / High, word only) · Summary (stacked, full text, `body-14`) · Topics (up to 6 neutral Tags, then "+2") · Suggestions (a list of plain sentences, heading "Suggestions for this flow") · footer StatusText "Analysed 26 Sep, 10:45 am · Re-analyse call" |
| Call | Result · Outcome · Direction · Kind (Real call, Test call, Browser test) · Phone (masked `PhoneText`, **Reveal** link for permitted roles, logged in Activity & Audit) · Caller ID used · Flow (link, with version) · Voice (VoiceTile 28 + name) · Languages · Started ("26 Sep 2026, 10:42:07 am IST") · Talk time · Ring time · Cost ("₹6.04" + source note "₹0.04/s", or the rule the server returns, such as "Not billed · browser test") · Legs ("2 legs · counted once", tests only) · Call id (`mono-12` + Copy) · Recording ("Disclosed at 00:01" / "Off for browser tests") |

**Captured** (`KeyValueList` variant `rows`, title "Captured · 3 of 4"): one row per field the flow version defines, in step order. Key: field label, then `meta-12` "step 3" when labels repeat. Value: the captured value, then the source note "at 00:52 · Ask about budget" as a seek link (`?t=52`, switches to the Transcript tab and plays from there). Missing fields read "Not captured". Captured values and "Not captured" come from **one source** (the flow run log), so they can never contradict each other (F-UX-010). A final row states side effects: "Lead status set to Interested by the Outcome step"; on test kinds it reads "Test calls don't change the lead." (`01-agent-cockpit` §1.1 rule 5).

#### 2.6.4 Footer and menus

- **Footer** (sticky, 56, `surface`, top hairline): `Call back…` (secondary, `phone` icon) opens the **Call gate** popover for this call's lead and never dials (P3); disabled reasons come from the gate's blocking checks ("Wallet is ₹0. Top up to place calls.", "On the DND list", "Outside calling hours. Opens 10 am IST."). Then the **review action** (secondary, `check`; its tooltip shows the shortcut ⌘/Ctrl+Enter, the label never does), which depends on the view (B5; hidden until B5 ships):
  - **In Needs review: `Mark reviewed and next`.** It marks this call reviewed, opens the next unreviewed call of the review run (below) and moves focus to that call's title (`h2`, `tabindex="-1"`). The polite region says "Marked reviewed. Call 2 of 9, Pranav I. 8 left to review."
  - **In every other view: `Mark reviewed`.** It marks the call and stays on it; the button becomes the StatusText "Reviewed by you · 11:42 am · Undo".
  - **On a call that is already reviewed** (by you earlier in the run, or by a colleague): the StatusText "Reviewed by Dev S. · 11:40 am" (plus "Undo" when it is your own review, or you are an admin), and in Needs review a secondary **`Next unreviewed call`** in the button's place.

  `Open lead` (tertiary link, `/leads?lead={id}`), hidden for unknown callers. No primary and no destructive action in the footer: the review action is reversible, and a filled Neel button in a sheet beside the table would compete with the table (P7).
- **The review run** (how Needs review is worked through; the same rules hold in any view where someone steps through calls in the sheet):
  1. **Snapshot.** Opening the sheet takes a snapshot of the current results: the ordered call ids for the view, search, filters and sort at that moment. The client keeps the query plus an `as_of` timestamp and sends `as_of` with every page it fetches, so the server returns the same order and membership. Previous and Next (the header chevrons, `K`/`J`) and "and next" walk this snapshot, across page boundaries. Reviewing a call never removes it from the snapshot, and calls that arrive later never enter it, so "Call 4 of 9" keeps its meaning.
  2. **The reviewed row stays where it is.** In the table, a call reviewed during this visit keeps its position and height. Its actions cell shows the outline Tag "Reviewed" (`check`, domain `review`, §4.5) followed by a link button **Undo** (accessible name "Undo review of the call with Meera S. at 10:42 am"). Nothing reflows, nothing fades and no row is dimmed. The row leaves Needs review only when the view is refreshed or re-entered: Refresh, a view, filter, sort or page change, "Show" on new calls, or a reload.
  3. **Counts move at once.** The Needs review tab count, the header meta ("8 need review") and the ViewSummary decrement optimistically when the request is sent, and are reconciled with the server's response. Undo increments them again. The ViewSummary adds the fact "· 1 reviewed just now" while the snapshot holds, so the rows on screen (9) and the count (8) visibly reconcile. The result count ("9 of 212") and the pager keep describing the snapshot until the view is refreshed.
  4. **"Next" is the next unreviewed call after this one in the snapshot**, skipping calls that were reviewed meanwhile (by you or by a colleague; the server reports review state each time a call opens). Past the last call it continues from the first call you skipped.
  5. **End of the run.** When no unreviewed call is left in the snapshot, the sheet header title reads "Needs review" (Previous, Next and Close stay) and the body shows a compact all-done state in place of a call: `check` 24 in `text-3`, title "All 9 calls reviewed", body "They leave Needs review when you refresh the view.", and a secondary **Back to Call reports**, which closes the sheet and returns focus to the last reviewed row. The footer is hidden. If you reached the end by skipping calls, the title is "End of the list", the body "1 call still needs review.", the action **Open it** (secondary) and **Back to Call reports** (tertiary).
  6. **Undo** lives in two places: the row's Undo, and the footer StatusText when you step back to the call (`K` or the up chevron). There is no Undo toast, so working through nine calls never stacks nine toasts.
  7. **Failure.** If marking fails, the counts revert, the sheet does not advance, and an InlineError above the footer says "Couldn't mark this call as reviewed. Retry"; focus stays on the review action.
  8. **Cost per call:** one action (⌘/Ctrl+Enter or one click), instead of three (mark, find the next row, open it), and the list never moves under the pointer.
- **⋯ menu** (Menu, overlay §7): Copy call id · Copy link at 00:41 (current player time) · Re-analyse call · Download transcript (.txt) · Download recording… (roles per open question Q5; confirms that numbers stay masked and that the download is logged) · Export call (CSV) · separator · Suggest knowledge from this call… (opens a small Dialog: the passage to propose, pre-selected from the transcript, and "Admins review suggestions in Knowledge › Proposals"). There is no delete.
- **Re-analyse call** runs in place without a dialog (it replaces the analysis; the previous one is kept server-side for 30 days, open question Q6). The Summary tab shows StatusText "Re-analysing… · about 20 s", the button is busy, and the result arrives as a toast only if the user has left the tab: "Analysis updated · sentiment changed from Neutral to Negative".

#### 2.6.5 Export popover (page header `Export…`)

A Popover (overlay §5), 400 wide, titled "Export 38 calls" (the current result count): Format SegmentedControl **CSV | XLSX**; Columns RadioGroup **Visible columns** / **All columns, including captured fields**; Checkbox **Include transcripts** (helper "Adds one text column. Large files take longer."); the note "Phone numbers stay masked. Exports are logged." (`meta-12` `text-3`); primary `Export 38 calls`. Up to 5,000 rows download directly; above that a progress toast "Preparing export… 12,480 calls" becomes "Export ready · Download" (link valid 1 h). Disabled with reason when the view is empty: "Nothing to export in this view."

### 2.7 States (with copy)

| State | Trigger | Treatment and copy |
|---|---|---|
| **First use** | The workspace has no calls at all | FilterBar, ViewSummary and pager hidden; views show counts of "0" only because the server says 0. EmptyState first-use in the table body: icon `file-text`, title "No calls yet", body "Calls appear here after your agent places or answers one, with the transcript, summary and what was captured.", action `Place a test call…` (secondary, opens the Cockpit Ready-to-call card with Talk in browser selected), link "How call reports work" |
| **Loading (first)** | Route entry | Shell, header H1, views (count skeletons), FilterBar and real table header render at once; after 200 ms `TableSkeleton` rows fill the height; ViewSummary shows skeleton bars; pager "Loading…"; `aria-busy` and "Loading calls…" in the polite region. Never "0 calls" (F-UX-030) |
| **Refreshing** | Sort, filter, page or view change | Rows stay; result count, ViewSummary and pager read "Updating…"; no dimming or spinner |
| **New calls arrived** | Background poll every 60 s while the tab is visible | Rows do not jump. The header meta gains "· 3 new calls · Show" (link button); Show reloads page 1. Announced once, politely: "3 new calls" |
| **No results (search)** | `q` set, nothing matches | EmptyState no-results: "No calls match “site visit”." / "Search covers lead names, the last digits of numbers, summaries and transcripts." / `Clear search` |
| **Filtered empty** | Filters or view exclude everything | "No calls match Negative in the last 7 days." / "212 calls are hidden by filters." / `Clear filters` (keeps the view) |
| **View done** | Needs review is empty | EmptyState all-done: `check`, "Nothing needs review.", "Calls with negative or mixed sentiment, a failed result or no outcome appear here." |
| **Partial: stats failed** | B2 errors, rows load | ViewSummary: "Couldn't load totals · Retry" (`text-3`, link button); view counts show "–"; the table works |
| **Partial: analysis pending** | Call ended < ~1 min ago | Sentiment cell "Unscored" (plain, `text-3`) with tooltip "Analysis in progress"; sheet summary line "Analysing this call…"; row updates in place when done |
| **Partial: no per-turn data** | B6 missing for a call | Player uses Waveform or Track; turn LanguageMarks hidden; header shows the call's languages once |
| **Error (first load)** | `/api/calls` fails | Danger Notice in the body (`role="alert"`): "Couldn't load calls. Check your connection and try again." + `Retry`; Details disclosure with the error id |
| **Error (refresh)** | A later request fails | Warning Notice above the table (`role="status"`): "Showing results from 11:24 am. Couldn't refresh." + `Retry`; rows stay |
| **Sheet: loading** | `?call=` resolving | Sheet header shows the title from the row if known; `SheetSkeleton`; tabs real |
| **Sheet: section failed** | Transcript or analysis request fails | SectionError in that tab: "Couldn't load the transcript. Retry"; other tabs work |
| **Sheet: call gone** | Deep link to a deleted call or one outside the user's access | Compact EmptyState in the sheet: "This call was deleted, or you no longer have access." + Close |
| **Sheet: not in results** | Filters change while a call is open | Sheet stays; neutral Notice at the top of its body: "Not in the current results. Clear filters" (overlay §4.3). The review-run snapshot is retaken from the new results, so Previous and Next walk what the table now shows |
| **Review run: call reviewed** | Mark reviewed (and next) during this visit | The row stays in place with the outline Tag "Reviewed" and **Undo** in its actions cell; Needs review count, header meta and ViewSummary drop by one at once; the row leaves the view on refresh or re-entry (§2.6.4) |
| **Review run: already reviewed** | The opened call was reviewed by a colleague since the snapshot | Footer StatusText "Reviewed by Dev S. · 11:40 am"; in Needs review the action reads **Next unreviewed call**; "and next" skips such calls |
| **Review run: end** | No unreviewed call left in the snapshot | Sheet body: `check`, "All 9 calls reviewed", "They leave Needs review when you refresh the view.", **Back to Call reports** (focus returns to the last reviewed row). With skipped calls: "End of the list" · "1 call still needs review." · **Open it** · Back to Call reports |
| **Review run: couldn't save** | The review request fails | Counts revert; the sheet stays on the call; InlineError above the footer "Couldn't mark this call as reviewed. Retry"; the row shows no Reviewed tag |
| **Offline** | ConnectionBar offline | Data shows "Showing data from 11:42 am"; search, filters, paging and Re-analyse are `aria-disabled` with "You're offline"; the player shows "Recording needs a connection." unless already buffered; open transcripts stay readable |
| **Permission: page** | Role without call access (open question Q4) | `Forbidden` inside the shell: "Only admins and team leads can see call reports. Ask Anika R. for access." |
| **Permission: action** | Member on Download recording or Reveal | The menu item is shown `aria-disabled` with "Admins only" (so people know it exists); Reveal is hidden |
| **Success** | Mark reviewed · Re-analyse · Export · Suggest knowledge | In place: "Reviewed by you · 11:42 am · Undo" (in Needs review the sheet moves to the next call and the row carries "Reviewed · Undo"); "Analysed 26 Sep, 10:45 am"; toast "Export ready · Download"; toast "Suggestion sent. An admin reviews it in Knowledge." No green banners, no exclamation marks |
| **Stale call** | A call stuck in queued or in progress past the reaper window | Result "Timed out" (warning tag, `clock`), sheet notice "No update since 28 Aug, 11:45 pm. The call probably didn't connect." (F-QA-037) |
| **Long call** | > 500 turns | Transcript virtualises (data-nav §12.4); search still covers every turn (server) |

---

### 2.8 Interactions and keyboard

**Table** (data-nav §7.9, one tab stop for the body): ↑/↓ (and J/K when single-key shortcuts are on) move rows; Home/End, PageUp/PageDown; **Enter** opens the call; Tab moves through the focused row's controls (key link, Undo on a row reviewed during this visit, `⋯`); **Esc** closes the sheet, focus returns to the row. There is no row selection in v1, so Space and X do nothing here (Q3). **C** opens the Call gate for the focused row's lead (never dials; hidden when shortcuts are off). **/** focuses search. **Shift+D** toggles density. **?** opens the shortcut sheet.

**With the sheet open:** J/K (or the header chevrons) move to the next or previous call **in the snapshot taken when the sheet opened** (§2.6.4), and the sheet follows; the polite region says "Call 4 of 38". At a page edge, J/K fetch the next or previous page of the same snapshot (same `as_of`). **⌘/Ctrl+Enter** runs the footer's review action (in Needs review: mark reviewed and open the next unreviewed call, focus on its title). **F6** moves focus between the table and the sheet. Browser Back closes the sheet (it pushed `?call=`).

**Inside the sheet:** ←/→ between tabs (automatic activation); ⌘/Ctrl+F searches the transcript when focus is in the sheet (otherwise the browser's find); in the player group, Space or K play and pause (never grabbed from the page), the scrubber takes ←/→ 5 s, Shift+←/→ 15 s, PageUp/PageDown 30 s, Home/End; Enter on a timecode seeks and plays. Media keys work through the Media Session API.

**Pointer:** clicking anywhere on a row that isn't a control opens the call (delegated to the key link; ignored while text is selected); middle-click or ⌘/Ctrl-click on the key cell opens a new tab. Hovering or focusing a row for 150 ms prefetches its detail, so the sheet usually opens without a skeleton.

**Drill-in from Analytics** (§1.3) lands with filters as FilterTokens and focus on the H1, and announces "38 calls match". A `?call=` landing opens the sheet with focus on its title.

**Motion:** the sheet slides in over 200 ms (`--dur-slow`) at 1024–1439 and appears without motion when docked; row fills and the row `⋯` fade over 90 ms; nothing else moves except the playhead during playback.

### 2.9 Microcopy (before → after)

| Where | Before (live product) | After |
|---|---|---|
| H1 and nav | "Call Reports" (H1), "Reports" (phone bar), "121 calls" pill | "Call reports" everywhere; meta "212 calls · 9 need review · updated 11:24 am" |
| Subtitle | "Recordings, transcripts, sentiment & extracted flow fields" | None (data pages have no description; P1: it promised recordings that often don't exist) |
| Header buttons | "Refresh", solid blue "Export CSV" | Ghost "Refresh" (then "Updated 11:24 am"), tertiary "Export…" |
| KPI cards | "Total Calls 121 · Avg Duration 90s · Positive 4 · Negative 10" | ViewSummary "In this view · 212 calls · 4h 36m talk time · avg 1m 40s · 21 negative" |
| Search | "Search transcripts, summaries…" | "Search calls and transcripts…" (label "Search calls") |
| Sentiment chips | "All · Positive · Negative · Neutral" | Views "All · Needs review · Positive · Negative · Mixed · Unscored" with counts |
| Type column | "BROWSER" pill on every row | Direction "Outbound" / "Inbound" with an icon; "Test call" or "Browser test" outline tag only when test calls are shown |
| Status column | "COMPLETED" outlined pill | Outcome "Visit booked" (or the result "Completed", "No answer", "Timed out") |
| Sentiment | "NEUTRAL" mustard pill | "Neutral" with `meh`: icon and word in `text-2`, no tag, no tint (only Outcome is tinted) |
| Review | none (no review state today) | "Mark reviewed and next" in Needs review, "Mark reviewed" elsewhere; row tag "Reviewed · Undo"; end state "All 9 calls reviewed" · "Back to Call reports" |
| Empty cells | "—" at 50 % alpha | "Not captured", "No outcome", "Not analysed yet" in solid `text-3`, or "–" with a hidden label |
| Flow-field headers | "Condition Check" ×4, "Green & Identity" typo | "Condition check · step 3" (labels from the flow version; typos fixed at the source) |
| Duration | "1:27" (table), "87s" (panel), "90s" (KPI) | "1m 27s" everywhere |
| Dates | "23 Sept, 06:13" | "Today 10:42 am", "Yesterday", "3 days ago", "21 Sep 2026" |
| Filtered empty | "No calls found. No call records match the current search or filters. Calls appear here once your agents start dialing." | "No calls match “site visit”." + what search covers + `Clear search`; or "No calls match Negative in the last 7 days." + `Clear filters` |
| Panel title | "CALL DETAILS" | "Meera S. · Today 10:42 am" |
| Panel sections | "KEY ELEMENTS EXTRACTED", "FLOW BUILDER FIELDS: not collected", "ANALYSIS", "AI SUGGESTIONS" | "Captured · 3 of 4", "Not captured" per field, "Analysis", "Suggestions for this flow" |
| Recording | "No recording is available for this call." | "No recording for this call. Recording is off for browser tests. The transcript is still available." |
| Transcript turns | "ASSISTANT • 2S" / "USER • 15S" | "00:02 Vaani" / "00:15 Caller", with language mark and step |
| Actions | "Re-analyze Transcript", tooltip "Re-run AI analysis from scratch (force=true)" | "Re-analyse call", tooltip "Runs the summary, sentiment and captured fields again." |
| Actions | "Learn from this call" | "Suggest knowledge from this call…" |
| Actions | "Export This Call" | "Export call (CSV)" in `⋯` |
| Close | unnamed "×" | "Close call details" |

### 2.10 Accessibility

- **Keyboard parity (F-A11Y-002, critical):** every call opens from the keyboard; the sheet takes focus on open and returns it on close; F6 cycles regions; nothing on the page needs a pointer (the talk strip is a slider, timecodes are buttons, drag is never required).
- **Table semantics (F-A11Y-018):** `<table role="grid" aria-labelledby="page-title" aria-rowcount={total + 1}>`, visually hidden caption "Calls, sorted by When, newest first", `th scope="col"`, `aria-sort` on the sorted header only, a hidden "Actions" header, `aria-rowindex` absolute across pages, `aria-current="true"` on the open row.
- **Names:** row `⋯` is "More actions for the call with Meera S. at 10:42 am"; sort buttons read "When, sorted newest first"; the Test calls switch is "Show test calls" with its state; the player's Play is "Play recording" ↔ "Pause recording".
- **Announcements** (shell announcer, polite, debounced): result counts after filtering ("38 of 212 calls"), sort changes, page range, "Call 4 of 38" when stepping in the sheet, "Marked reviewed. Call 2 of 9, Pranav I. 8 left to review." in a review run, "All 9 calls reviewed" at its end, "Review undone", "3 new calls", analysis complete. Never announced: playback time, turn text during playback, counts while typing.
- **Colour is never alone (F-A11Y-019):** outcome, result and sentiment carry a word and an icon; the direction carries a word; the open row has the inset bar plus `aria-current`.
- **Contrast (F-A11Y-008, F-VIS-003):** all text on `text`, `text-2`, `text-3` (≥ 4.70:1 on every plane); StatusTags ≥ 5.47:1; no alpha dashes.
- **Language:** each turn has `lang`; Devanagari turns use `read-15-deva`; names carry `translate="no"`; the language column shows names only (LanguageMark `name`); glyph tiles appear only in the call header legend and on turns.
- **Targets (F-A11Y-023):** row `⋯` and sheet header IconButtons are 32 px (hit ≥ 24) on fine pointers and 44 px on touch; the Test calls switch has a 44 px hit area on touch.
- **Reflow and zoom:** at 320 px and at 400 % zoom the page is the phone layout; nothing scrolls sideways except the view tabs strip and the table's own scroller at 768–1023 (with pinned columns).
- **Forced colours:** open and focused rows, the playing turn, tags and the playhead keep visible outlines (`Highlight`, `CanvasText`).
- **Reduced motion:** the sheet fades instead of sliding; smooth scrolling to the playing turn becomes instant.

### 2.11 Responsive behaviour (summary)

| Width | Shell | Views | FilterBar | Table | Sheet |
|---|---|---|---|---|---|
| ≥ 1920 | Sidebar 232 | Full row | One row, 3 tokens inline | P1–P3 (9 columns) stay visible beside the docked sheet | Docked 560 |
| 1440–1919 | Sidebar 232 | Full row | One row | P1–P3; P1–P2 while the sheet is docked (R2) | Docked 560 |
| 1280–1439 | Sidebar 232 | Full row | One row | P1–P3 | Overlay right, non-modal |
| 1024–1279 | Rail 56 | Full row | 2 tokens; Columns icon-only | P1–P2 | Overlay right, non-modal |
| 768–1023 | TopBar 52 + nav sheet | Scrolls, edge fade | Tokens fold into Filter (count) | P1 + user columns; pinned When/Lead and `⋯`; horizontal scroll | Modal, full height, min(560, 100%) |
| 320–767 | TopBar + BottomBar ("Call reports" is slot 3) | Scrolls | Search full width and sticky; Filter + tokens in a scrolling row; pickers open as bottom sheets with "Show 38 calls" | ListRow list | Full screen, player sticky, footer sticky above the safe area; BottomBar hidden while open |
| Height ≤ 720 | Baseline folds into a header chip | "View: All ▾" Select in the toolbar | – | ≥ 10 rows | – |

ViewSummary: one line at ≥ 768 (it truncates the last facts first and keeps "In this view · {n} calls"); on phones it wraps to two lines and scrolls away with the header. The Test calls switch moves into the Filter sheet on phones.

### 2.12 Telemetry hooks (optional, consent-gated)

Events fire only after the user has accepted analytics cookies (F-QA-033 found a 365-day analytics cookie set before consent). No payload contains a name, phone number, search text, transcript text or captured value.

| Event | Properties |
|---|---|
| `call_reports.viewed` | `view`, `has_filters`, `result_count_bucket` (0, 1–10, 11–100, 101–1k, 1k+), `test_calls_shown` |
| `call_reports.filter_changed` | `field` (id only), `action` (add, edit, remove, clear) |
| `call_reports.searched` | `query_length_bucket`, `result_count_bucket`, `latency_ms` |
| `call_reports.call_opened` | `source` (row_click, keyboard, deep_link, analytics_drilldown, j_k), `position_on_page`, `tab` |
| `call_reports.tab_viewed` | `tab`, `dwell_ms` on leave |
| `call_reports.recording_played` | `scrubber_variant` (talk_strip, waveform, track), `pct_listened_bucket`, `speed` |
| `call_reports.transcript_searched` | `match_count_bucket` |
| `call_reports.reanalysed` / `.exported` | `format`, `columns`, `include_transcripts`, `row_count_bucket` |
| `call_reports.marked_reviewed` / `.review_undone` | `view`, `advanced` (true when "and next" moved on), `position_in_run`, `run_size_bucket`, `input` (click, shortcut) |
| `call_reports.review_run_finished` | `run_size_bucket`, `skipped_count`, `duration_s_bucket` |
| `call_reports.error_shown` | `surface` (table, stats, transcript, recording), `code` |

Questions these answer: do reviewers use views or search; how often the transcript is read versus the summary; whether the player gets used when a recording exists; how often drill-downs from Analytics end in an opened call.

### 2.13 Acceptance criteria (Call reports)

**Data truth**
- [ ] With 212 fixture calls, the oldest call is reachable through the pager, and a search for a phrase in its transcript finds it (F-QA-005).
- [ ] One browser test call produces one row, and the ViewSummary and view counts count it once; with test calls hidden it is not counted at all (F-QA-006).
- [ ] ViewSummary, view counts and the Analytics StatStrip return identical numbers for the same range and filters (both call `/api/calls/stats`) (F-QA-014, F-UX-011).
- [ ] No number renders as "0" while loading; skeletons or "–" only (F-UX-030).
- [ ] Captured values and "Not captured" in the sheet never contradict each other for any fixture call (F-UX-010).

**Layout**
- [ ] At 1440×900, ≥ 15 rows show in Standard; at 1366×768 and 1280×720, ≥ 10 (chrome budget).
- [ ] No horizontal page scroll at 320, 360, 390, 768, 1024, 1280, 1440, 1920; at 768–1023 only the table scroller moves sideways and When and Lead stay pinned.
- [ ] At most 9 columns show by default; Captured and per-field columns appear only as specified in §2.5; repeated field labels read "Field · step n".
- [ ] At 360×780 at least 8 ListRows are visible and the search field is full width (F-RWD-004, F-RWD-009).

**Keyboard and screen reader**
- [ ] Tab into the table, press ↓ twice and Enter: the sheet opens with focus on its title; Esc returns focus to the same row (F-A11Y-002).
- [ ] J/K in the open sheet step through calls and announce "Call n of N"; Back closes the sheet.
- [ ] In Needs review with 9 calls, ⌘/Ctrl+Enter on call 1 marks it reviewed, opens the next unreviewed call and puts focus on its title; nine presses review all nine, and the sheet then shows "All 9 calls reviewed" with Back to Call reports, which returns focus to the last reviewed row.
- [ ] A reviewed row stays at the same position and height with "Reviewed · Undo" until Refresh or re-entering the view; no row above or below the pointer moves while reviewing.
- [ ] The Needs review tab count, the header meta and the ViewSummary drop by one as each call is marked, rise again on Undo, and match the server after the response; a failed request reverts them and keeps the sheet on the call.
- [ ] Previous and Next walk the snapshot taken when the sheet opened: a call reviewed, or a call that arrives, during the run does not change "Call n of N"; a call reviewed by a colleague is skipped by "and next".
- [ ] Space does not start playback unless focus is inside the player; ←/→ on the scrubber seek 5 s; a timecode seeks and plays.
- [ ] Pressing `c` on a focused row opens the Call gate and never sends a call request.
- [ ] axe reports no `empty-table-header`, no unnamed buttons and no contrast failures on the page, the sheet and the Export popover, in both themes.

**URL and state**
- [ ] Reload and a pasted link restore view, search, filters, range, sort, page, columns, the open call, its tab and `?t=` (F-UX-031, F-QA-016).
- [ ] A `?call=` for a call on page 5 opens the sheet from page 1.
- [ ] Filtering the open call out of the results keeps the sheet open with "Not in the current results. Clear filters".

**Copy and visuals**
- [ ] No uppercase labels, no text below 12 px, no mono outside ids (phones and timecodes are Hanken tabular), no `force=true`, no em-dash separators (lint list, direction §4.4).
- [ ] Each row carries at most one tinted element (the Outcome tag); Sentiment renders as icon + word in `text-2` with no fill or outline, in the table, the sheet and the phone list (direction §6.4).
- [ ] Every "no recording" state states its reason when B7 provides one.
- [ ] The page has no filled Neel element except the focus ring, the selected-tab indicator, the playing turn and links (the Export popover's confirm is the one primary inside that popover).

---

## 3. Analytics (`/analytics`)

### 3.1 Purpose and jobs to be done

**Purpose.** Show how the voice agent is performing over a period, where and why callers drop off, and what they call about, with every number traceable to its calls.

| Who | Job |
|---|---|
| Founder or ops lead | When I check in weekly, I want call volume, answer rate, talk time and minutes against the previous period, so I can judge whether the agent is worth what it costs |
| Team lead, QA | When sentiment worsens, I want to see which days and open those calls, so I can find the cause |
| Flow builder | When a flow version is live, I want to see which step loses callers and hear those calls, so I can fix the step |
| Operations | When staffing or scheduling, I want to know which hours (IST) calls come in, and whether the inbound number is getting calls |

**Primary job:** "Is it working, and where is it breaking?" in one screen at 1440×900 without scrolling past the headline numbers and the two trend charts. **Secondary:** export the numbers for a report.

### 3.2 Audit findings addressed

| Finding | Today | Change |
|---|---|---|
| F-VIS-010 (medium) | 15 px tracked H1 under 27 px/800 section titles, § markers, serif italics, HUD brackets, hatch; Identity first, KPIs at y≈570 | `title-20` H1 via PageHeader; `title-16` section titles as questions; StatStrip first; Identity removed (D5) |
| Direction P7, anti-pattern 7 (design critique of the first mock) | The first redesign still read as a generic dashboard: four KPI cards with sparklines over a grid of chart cards, everything in Neel, and a "Latest calls" table in a card with its own frame | One hairline StatStrip (trend only in a hover or focus preview); sections with `h2`s and hairlines on `surface`, no cards; graphite single-series marks with Neel only for the hovered, focused or selected period; Latest calls removed (D12) |
| F-UX-036, EXPLORE-DATA-10 | The 7D/30D/90D toggle sits in the Sentiment card, changes Intents too but not Flow or Headline; not in the URL; resets to 30D | One range in the header (`?range=`), obeyed by every section, stated in every meta |
| F-UX-036 (intents part), F-UX-016 | "Intent clustering temporarily unavailable (LLM call failed)"; "next 21 Sept, 17:01" shown 5 days late | Degraded and stale states with plain copy and the last good result |
| F-UX-011, F-QA-014, F-QA-006 | Avg 1m 18s here vs 90 s on Call reports; "Headline — this past week" over a lifetime total; legs counted twice | Shared definitions (§1.1); the StatStrip states its scope once; conversations, not legs |
| F-VIS-011 | "negative +13pp" green; mustard neutral | `deltaTone` by desirability; grey neutral; arrow + sign + word |
| F-VIS-012 | Stretched 800×220 viewBox, 4.8 px labels on phones, uneven ticks, no legend | ChartFrame rules: 1:1 drawing, 12 px labels, nice ticks, legend with totals, View as table |
| F-QA-019 | Drop-off bars have no fill; six steps named "Condition Check" / "Knowledge Lookup"; always 38 calls | Funnel with fills, "3 · Ask about budget" labels, step links, range-scoped |
| F-UX-015, EXPLORE-DATA-21 | DID card: "Allocate a number from billing" (plain text; Billing can't) | "Calls to your number" section reading Phone setup, linking there |
| F-UX-011, EXPLORE-DATA-20 | §06 "CALLS ON LINE 0" beside §07's inbound calls; §08 "No call recordings yet" with no reason | Section scope states "calls to your inbound number"; Recordings section removed (D5) |
| F-QA-006 | §07 Recent shows each test call as INBOUND "— → —" + OUTBOUND pairs | §07 Recent removed; "Open these calls in Call reports" ends the StatStrip scope line, and Call reports lists one row per conversation |
| F-RWD-008 | Header actions push the page 153–193 px sideways at 390/360 | Wrapping PageHeader, actions in `⋯` below 768, `overflow-x: clip` |
| F-UX-048, EXPLORE-DATA-15, F-VIS-013 | Step names cut to 9 characters at 390; intent names "Appointment …" with room to spare | BarList and Funnel labels wrap to 2 lines on phones; tooltips carry full text elsewhere |
| F-A11Y-022 | 6 infinite animations (spinners, pulse, logo) | Nothing loops; skeletons are static |
| F-VIS-014, EXPLORE-DATA-12 | 70 px tooltips, 16 lines, clipped by cards | Tooltip max 280, portalled |
| F-UX-043, F-VIS-022 | "the dispatch from your line", "— who is on the line", graph-paper grid | Plain nouns; solid planes |
| F-A11Y-008 | 124 of 242 text nodes (51 %) fail contrast | `text-3` ≥ 4.70:1; chart labels on `--chart-label` |

### 3.3 Information hierarchy

1. **The range and the headline numbers** (StatStrip): what period, how many calls, answered, talk time, minutes, each with a delta; the scope stated once under the strip.
2. **Trend shape:** Calls per day and Sentiment by day, side by side.
3. **Diagnosis:** Where callers drop off (per flow version) and Why people call (intents).
4. **Context:** When calls come in (IST) and Calls to your number.

The page is a report, not a dashboard: one level of containment (P7). The only framed things are overlays (tooltips, the range picker). **Colour budget:** chrome is graphite; single-series marks are `--chart-neutral`; the one hovered, focused or selected period in a chart is `--chart-highlight` (Neel); sentiment uses its own palette. Nothing else on the page is Neel except the selected range segment, links and focus. If a screenshot of Analytics looks blue, something is misusing Neel (direction §3.1).

### 3.4 Layout and wireframes

A container page on `surface` (not `bg`): content max `--size-container-page` (1280), centred in the content column, page margin 24. The StatStrip spans the content width. Below it, sections sit in a 2-column **ReportGrid** (§4.7): each row starts with a full-width hairline, the two sections are separated by a vertical hairline, and each section has 24 px of inline padding on the side of the rule. No section has a border box, background, radius or shadow. The page scrolls as one (no inner 858 px scroller, F-VIS-010).

**Desktop ≥ 1440 (content 1160 wide at 1440)**

```
┌ Sidebar ─┬──────────────────────────────────────────────────────────────────────────────────────────┐
│          │ Analytics  212 calls · last 30 days · updated 4:34 pm   [7 days|30 days|90 days] Custom…  ⋯ │ 56
│          ├──────────────────────────────────────────────────────────────────────────────────────────┤
│          │ ────────────────────────────────────────────────────────────────────────────────────────  │
│          │  Calls ⓘ              │ Answered ⓘ            │ Avg talk time ⓘ       │ Minutes used ⓘ     │ StatStrip
│          │  212                  │ 78%                   │ 1m 40s                │ 276 min            │ 112
│          │  ▲ +12% vs prev. 30 d │ ▼ −3 pts vs prev.     │ – No change           │ ▲ +9% vs prev.     │
│          │ ────────────────────────────────────────────────────────────────────────────────────────  │
│          │ Last 30 days · calls, not legs · test calls excluded · Open these calls in Call reports    │ 20 scope
│          │ ────────────────────────────────────────────┬───────────────────────────────────────────── │ row rule
│          │ Calls per day  Last 30 days   View as table │ Sentiment by day  Last 30 days  View as table │ h2 title-16
│          │ 10 ┤      ▇ ▇▇  ▇▇▇                          │ ■Positive 58 ■Neutral 113 ■Mixed 14 ■Neg 21   │
│          │  5 ┤ ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ (graphite, one Neel) │ stacked bars, fixed order, 2 px gaps          │ 240 plots
│          │  0 ┴────────────────────────────────────────│───────────────────────────────────────────── │
│          │ Test calls excluded · Select a day…          │ 6 calls not scored                            │
│          │ ────────────────────────────────────────────┼───────────────────────────────────────────── │
│          │ Where callers drop off [Site-visit q. v7 ▾] │ Why people call  188 of 212 analysed          │
│          │ 1 · Greeting                 96 · 14% drop  │ Site visit booking ▇▇▇▇▇▇ 58 · 31%            │
│          │ 3 · Ask about a site visit   71 · 54% drop  │ Price enquiry      ▇▇▇▇▇  42 · 22%            │
│          │   largest                                   │ …                                             │
│          │ ────────────────────────────────────────────┼───────────────────────────────────────────── │
│          │ When calls come in  IST · last 30 days      │ Calls to your number  Last 30 days            │
│          │ ▁▁▁▁▁▁▂▃▅▆▇█▇▆▅▅▆▇▇▆▄▂▁▁ (24 hour bars)      │ Inbound number  +91 80 •••• 2210  ✓ Ready      │
│          │ 12 am    6 am    12 pm    6 pm              │ Calls received 41 · Unique callers 19 · …     │
│          ├──────────────────────────────────────────────────────────────────────────────────────────┤
│          │ Baseline                                                                                  │ 28
└──────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

Above the fold at 1440×900 (content from y≈56 to 872): header 56, 24 gap, StatStrip 112, scope line 28, the first section row (rule, 20 padding, 28 header, 240 plot, 24 footnote) ≈ 312 = 532 px, so the headline numbers and both trend charts are fully visible without scrolling, with the next row's titles showing below.

**Laptop 1280–1439.** Same as desktop; content 1000–1160 wide; the StatStrip keeps 4 cells; sections two per row (each ≥ 476 px after padding).

**Laptop 1024–1279 (rail).** Content 920–1175: 4 cells in the StatStrip; sections two per row at 200 px plot height.

**Tablet 768–1023**

```
┌──────────────────────────────────────────────────────┐
│ ☰  Analytics                          ₹2,340   ⌕     │ 52 TopBar
│ 212 calls · last 30 days             [7d|30d|90d] ⋯  │ 48 (range labels "7 days"…)
│ ──────────────────────────────────────────────────── │
│ Calls      │ Answered   │ Avg talk time │ Minutes    │ StatStrip, 4 cells (num-28)
│ 212        │ 78%        │ 1m 40s        │ 276 min    │
│ ──────────────────────────────────────────────────── │
│ Last 30 days · calls, not legs · test calls excluded │
│ ──────────────────────────────────────────────────── │
│ Calls per day                        View as table   │ one section per row, 200 plot
│ ──────────────────────────────────────────────────── │
│ Sentiment by day                                     │
│ ──────────────────────────────────────────────────── │
│ Where callers drop off · Why people call · When      │ (each its own row)
│ calls come in · Calls to your number                 │
└──────────────────────────────────────────────────────┘
```

**Phone 320–767**

```
┌──────────────────────────────┐
│ ☰ Analytics      ₹2,340   ⌕  │ 52
│ 212 calls · last 30 days   ⋯ │ 48 (⋯: Custom range…, Export CSV, Export PDF, Include test calls)
│ [ 7 days | 30 days | 90 days]│ 40 SegmentedControl, full width, sticky under the TopBar
│ Calls         │ Answered     │ StatStrip 2 × 2, hairline rules,
│ 212           │ 78%          │ num-20 values, no scroll strip
│ ▲ +12%        │ ▼ −3 pts     │
│ ──────────────┼───────────── │
│ Avg talk time │ Minutes used │
│ 1m 40s        │ 276 min      │
│ Last 30 days · calls, not legs│ scope line (wraps)
│ ──────────────────────────── │
│ Calls per day                │ 160 plot, 3–4 x labels
│ ──────────────────────────── │
│ Sentiment by day             │ legend wraps above the plot
│ ──────────────────────────── │
│ Where callers drop off       │ labels wrap to 2 lines, value under the label
│ Why people call              │ labels above their bars
│ When calls come in           │ 24 bars, labels every 6 h
│ Calls to your number         │
├──────────────────────────────┤
│ BottomBar · More current     │ Analytics lives in More
└──────────────────────────────┘
```

### 3.5 Components used, with configuration

| Region | Component (spec) | Configuration |
|---|---|---|
| Header | `PageHeader` variant `page`, `navId="analytics"` | Meta: "{calls} calls · {range words} · updated {time}". Actions: the range control (below), then `⋯` (Export CSV · Export PDF report · separator · checkbox item "Include test calls" `?test=1` · Refresh). No primary |
| Range | `SegmentedControl` (data-nav §3.6) "Range": **7 days · 30 days · 90 days**, plus a tertiary `Custom…` opening the `DateRangePicker` (core §7.1) | Writes `?range=`; with a custom range the segment shows no selection and the button reads "1–26 Sep 2026". Every section re-queries; the comparison period is the previous equal-length window. Phone: full-width SegmentedControl; Custom moves into `⋯` |
| Headline | `StatStrip` (**new**, §4.6) with 4 cells | `calls`, `answered`, `avg_talk`, `minutes_used` from §1.1. Each cell is one link (§1.3); Minutes used links to Billing › Usage. No sparkline at rest: the 30-day line appears in the cell's **trend preview** on hover or keyboard focus (§4.6), "Not enough data yet" under 7 points. One scope line under the strip ends with the link "Open these calls in Call reports" (`?when=30d`) |
| Section frame | `ReportSection` (**new layout recipe**, §4.7) in a `ReportGrid` | Replaces ChartFrame's Card on this page (R8): `h2` `title-16`, meta `meta-12` `text-3`, actions right, plot, footnote. No border box, background or radius |
| Calls per day | `ReportSection` + `BarChart` (data-nav §11) | Title "Calls per day", meta "Last 30 days"; bars `--chart-neutral`, the hovered or focused day `--chart-highlight` over a `surface-2` band; periods ≤ 31 as bars, 90 days as weekly bars ("Calls per week", tooltip "Week of 15 Sep"); tooltip "Thu 24 Sep · 31 calls · vs previous Thu +7"; Enter or click on a period drills down (§1.3); footnote "Test calls excluded" |
| Sentiment by day | `ReportSection` + `StackedBarChart` palette `sentiment` | Order positive, neutral, mixed, negative with 2 px gaps; Unscored is not stacked, it is stated in the footnote "6 calls not scored"; legend with totals, legend items are drill-down links (not series toggles, so one element does one thing); weekly at 90 days |
| Where callers drop off | `ReportSection` + `Funnel` (data-nav §11.11) + `FlowSwitcher` (core §5.4) in the section header | Default flow version: the one with most calls in range; options list name + version + calls in range. Rows "3 · Ask about a site visit" (step label links to the Flow Designer at that version, F-QA-019), value "71 · 54% drop" (drop part links to the dropped calls in Call reports), the drop share is "calls that ended at this step without an outcome ÷ calls that reached it" (`dropped_at_step`, §1.1); the largest drop says "largest". Fills `--chart-neutral`, the hovered or focused row `--chart-highlight`. Meta "Site-visit qualifier v7 · 96 calls entered · last 30 days". Steps that are not questions or actions (Start, pure logic) are collapsed into their next visible step. Versions never mix (a v6 call is not counted in v7) |
| Why people call | `ReportSection` + `BarList` (data-nav §11.11) | Top 8 intents, then Other in `--chart-other`; other fills `--chart-neutral`, the hovered or focused row `--chart-highlight`; label wraps on phones; each row links (§1.3); a disclosure "Examples" under a row shows 3 anonymised summary lines, each linking to its call. Meta "Last 30 days · 188 of 212 calls analysed · updated 26 Sep, 4:01 pm". `Recompute` (ghost, admins only, shown only when stale) |
| When calls come in | `ReportSection` + `BarChart` by hour (24 bars, IST) | Replaces the HeatStrip: bar length reads more precisely than five colour steps and needs no Neel ramp. Bars `--chart-neutral`, hovered or focused hour `--chart-highlight`; x labels "12 am · 6 am · 12 pm · 6 pm"; IST in the meta; summary line "Busiest 11 am to 1 pm and 5 to 7 pm · quietest before 8 am"; tooltip "11 am to 12 pm · 23 calls"; each hour links (§1.3) |
| Calls to your number | `ReportSection` + `KeyValueList` `rows` | Reads Phone setup (B9): "Inbound number +91 80 •••• 2210 · Ready" (StatusTag success "Ready"), "Calls received 41", "Unique callers 19", "Missed 3" (links to Call reports `f.direction=inbound`). Other states in §3.6 |

**What is gone and where it went:** §01 Identity → WorkspaceSwitcher and account menu (name, role), Billing › Plans (plan); DID → Settings › Phone setup + the "Calls to your number" section; §06 hour-of-day and recent callers → "When calls come in" (all calls) and the number section (inbound only); §07 Recent → removed (the StatStrip's "Open these calls in Call reports", and every chart period, open the calls); §08 Recordings → each call in Call reports. The first redesign's "Latest calls" card is removed too (D12).

---

### 3.6 States (with copy)

| State | Treatment and copy |
|---|---|
| **First use (no calls ever)** | StatStrip hidden; one page-level EmptyState in place of the sections: icon `chart-column`, "No calls to analyse yet", "Trends, drop-off and intents appear after your agent's first calls.", action `Place a test call…` (secondary), link "Finish setup (3 of 5)" while setup is incomplete |
| **Empty range** | StatStrip cells show "0" (server-confirmed) with "No calls in the previous 30 days" as the delta when both are empty; each chart's EmptyState inside its plot: "No calls in the last 7 days." + `Show 30 days` (link button) |
| **Not enough data** | Fewer than 7 daily points: the trend preview reads "Not enough data yet"; charts still draw what exists; the sentiment chart adds "Trends appear after 7 days of calls." as a footnote |
| **Loading** | Header, range, StatStrip labels and section headers render at once; after 200 ms the cells skeleton their values, charts draw axes and gridlines with no marks, BarList and Funnel show 4 skeleton rows; `aria-busy` per section; never "0 calls analysed" (F-UX-036) |
| **Range change** | Previous values stay; each section's meta reads "Updating…"; plots crossfade over 90 ms when new data arrives |
| **Partial: one section failed** | SectionError in that section: "Couldn't load sentiment. Retry" (other sections unaffected); with last good data, keep it and add "Couldn't refresh · Retry · Updated 4:12 pm" |
| **Degraded: intents** | "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry" (warning StatusText above the last good BarList); with no previous result: "Intent insights are temporarily unavailable. Retry" |
| **Stale: intents** | Computed longer ago than its refresh interval: meta "Updated 21 Sep" + warning StatusText "Stale · computed 5 days ago · Recompute" (admins) or "· an admin can recompute" (members) |
| **Partial: intents not computed for range** | "Intents are computed for 30 and 90 days. Switch to 30 days" (link) when the chosen range is shorter than the clustering window |
| **Funnel: flow has no calls in range** | "No calls reached Site-visit qualifier v7 in the last 30 days." + FlowSwitcher open hint "Choose another flow" |
| **Funnel: no flows** | "Publish a flow to see where callers drop off." + `Open Flows` |
| **Number section states** (B9) | Pending: StatusTag warning "Pending" + "Your inbound number is being set up. Calls to it will show here." + `Open Phone setup`. None: "No inbound number yet. Request one in Phone setup." + `Open Phone setup`. Ready, no calls: "No calls to +91 80 •••• 2210 in the last 30 days." Never a link to Billing (F-UX-015) |
| **Offline** | ConnectionBar; sections keep data with "Showing data from 4:12 pm"; range changes and exports are `aria-disabled` with "You're offline" |
| **Permission** | Page: `Forbidden` "Only admins and team leads can see Analytics. Ask Anika R. for access." (if the product owner gates it, Q4). Action: Recompute hidden for members; "Include test calls" available to all |
| **Export** | CSV: downloads the data of every section (one sheet per section in XLSX later) named `vaani-analytics-2026-08-28-to-2026-09-26.csv`; PDF: progress toast "Preparing report…" → "Report ready · Download". Disabled with reason while loading: "Wait for the page to finish loading." |
| **Success** | Recompute: StatusText "Recomputing… · about 1 min", then "Updated 4:36 pm"; exports as above. No celebratory states |

### 3.7 Interactions and keyboard

- **Range:** the SegmentedControl is one tab stop; ←/→ move and select (a selection re-queries every section, so the control debounces 250 ms before querying while arrowing). `Custom…` opens the DateRangePicker (presets list, two months at ≥ 1024, typeable segments); Esc cancels. The applied range writes `?range=` with `pushState`, so Back restores the previous range.
- **StatStrip cells:** each is one link (no Card); its name includes value, delta and scope ("Calls, 212, up 12 % vs previous 30 days, last 30 days"). The ⓘ definition is a separate IconButton inside the cell's label row, before the link in the tab order, so the definition is reachable without following the link. **Trend preview:** hovering a cell for 300 ms (`--timing-tooltip-delay`) or focusing its link shows the 30-day line under the cell (§4.6); it never takes focus, Esc hides it, and moving to the next cell moves it. It is not shown on touch; the same facts are in the link's description.
- **Charts** (data-nav §11.8): each interactive plot is one tab stop; ←/→ move between periods or hours, Home/End jump; the hovered or focused period turns `--chart-highlight` over a `surface-2` band while the rest stay `--chart-neutral`; **Enter opens the calls behind the focused period** in Call reports (§1.3), Esc hides the tooltip. The tooltip ends with "Open calls ›" on pointer devices; on touch, the first tap shows the tooltip and a tap on "Open calls" follows it (never a navigation on the first tap).
- **View as table:** a ghost small toggle in each section header swaps the plot for a framed compact DataTable of the same data (`?table=calls,sentiment`); the toggle is `aria-pressed`. Tables are the accessible and printable truth of each chart.
- **Funnel:** the FlowSwitcher in the section header lists flows with calls in the range ("Site-visit qualifier v7 · 96 calls"); each step has two links: the label (opens the step in the Flow Designer at that version) and the drop value (opens the dropped calls in Call reports).
- **Intents:** "Examples" is a disclosure button per row (`aria-expanded`), showing three one-line summaries, each a link to its call. The disclosure never covers other controls (today's tooltip hid Refresh, EXPLORE-DATA-15 area).
- **Freshness:** the header meta says "updated 4:34 pm". Returning to the tab after 5 minutes refreshes quietly (sections keep values, meta shows "Updating…"); the `⋯` menu has "Refresh" for an explicit refresh. Nothing polls while the tab is hidden.
- **Export:** `⋯` › Export CSV downloads at once; Export PDF report shows a progress toast; both carry the range and the test-call rule in the file name and header row.
- **No single-key shortcuts** on this page. `?` still opens the shortcut sheet, `⌘/Ctrl+K` the palette.
- **Motion:** no entrance animation, no counting numbers, no growing bars. Data changes crossfade plot opacity over 90 ms; tooltips fade over 90 ms. Nothing loops (F-A11Y-022).

### 3.8 Microcopy (before → after)

| Where | Before | After |
|---|---|---|
| H1 | "ANALYTICS" (15 px, tracked) + "the dispatch from your line" | "Analytics" + meta "212 calls · last 30 days · updated 4:34 pm" |
| Header actions | "UPDATED 16:34 · REFRESH · CSV · EXPORT PDF" | Range control, `Custom…`, `⋯` (Export CSV, Export PDF report, Include test calls, Refresh) |
| Section titles | "§ 01 Identity — who is on the line", "§ 02 Headline — this past week, in numerals", "§ 03 Sentiment — how the calls felt", "§ 04 Flow — where they hang up", "§ 05 Intents — why they called", "§ 06 Phone — the geography of your line", "§ 07 Recent — the latest ten", "§ 08 Recordings — hear the line itself" | Section titles (`h2`, `title-16`) as questions or quantities: "Calls per day", "Sentiment by day", "Where callers drop off", "Why people call", "When calls come in", "Calls to your number" |
| KPI labels | "TOTAL CALLS" (lifetime), "THIS WEEK +200%", "AVG DURATION +70%", "TOTAL MINUTES +2533%" | "Calls", "Answered", "Avg talk time", "Minutes used", each with a range-scoped value and "▲ +12% vs previous 30 days"; one scope line under the strip |
| Range | "LAST 30D" + "7D · 30D · 90D" inside the Sentiment card | "7 days · 30 days · 90 days" in the header; every section meta says "Last 30 days" |
| Sentiment legend | "WOW SHIFT · positive 0pp · neutral −25pp · negative +13pp · mixed +10pp" | Legend "Positive 58 · Neutral 113 · Mixed 14 · Negative 21"; the comparison lives in each day's tooltip ("Negative 4 · +2 vs previous Thu") |
| Funnel | "{flow name} (v2) · 38 CALLS ANALYSED · colour warms with drop-off — peacock to red"; "Condition Check CONDITION · 1 reached · 0.0% drop" | "Where callers drop off" · "Site-visit qualifier v7 · 96 calls entered · last 30 days"; "3 · Ask about a site visit · 71 · 54% drop · largest" |
| Intents meta | "WINDOW 30D · 97 CALLS ANALYSED · last computed 21 Sept, 16:31, next 21 Sept, 17:01" | "Last 30 days · 188 of 212 calls analysed · updated 26 Sep, 4:01 pm" |
| Intents error | "Intent analysis unavailable — Intent clustering temporarily unavailable (LLM call failed)." | "Intent insights are temporarily unavailable. Showing the analysis from 21 Sep. Retry" |
| Number | "ALLOCATED DID · PENDING · not allocated yet · Allocate a number from billing to start receiving calls." | "Calls to your number" · "Your inbound number is being set up. Calls to it will show here." · `Open Phone setup` |
| Phone section zeros | "CALLS ON LINE 0 · UNIQUE CALLERS 0 · NO DATA — No callers yet — share your number —" | "No calls to +91 80 •••• 2210 in the last 30 days." (only when the number is Ready) |
| Recent | "— → — INBOUND" / "— → +91••••••XXXX OUTBOUND", "COMPLETED", link-blue durations | Removed; "Open these calls in Call reports" at the end of the StatStrip scope line (D12) |
| Recordings | "LAST 20 · private bucket — links expire in 1 hour · NO DATA — No call recordings yet." | Removed; each call states its own recording status |
| Footer | "VAANI ANALYTICS · MUMBAI · 2026" | Removed (the Baseline is the only footer) |

### 3.9 Accessibility

- **Headings:** H1 "Analytics"; a visually hidden `h2` "Overview" labels the StatStrip; each section title is an `h2`. Section order in the DOM equals the visual order at every breakpoint (F-A11Y-030); the ReportGrid never reorders with CSS.
- **Charts:** static summaries in `aria-label` state the finding ("Calls per day, last 30 days: from 3 on 28 Aug to 31 on 24 Sep"); interactive plots follow data-nav §11.8 with a visually hidden polite region reading the focused period. Every chart has View as table. Labels are ≥ 12 px at every width (F-VIS-012).
- **Colour:** sentiment has words and icons in the legend and tooltip; deltas carry an arrow, a sign and "vs previous 30 days"; the funnel's largest drop says "largest" in words; the Neel period is also the one with the tooltip and the `surface-2` band, and its values are read out, so the colour change is never the only signal; hour bars have text values on focus and in the table view (F-A11Y-019, F-VIS-011).
- **Contrast:** chart labels on `--chart-label` (`text-3`, ≥ 4.70:1); every mark ≥ 3:1 on `surface` and on the `surface-2` hover band (`--chart-neutral` 11.46:1 light and 9.20:1 dark, `--chart-highlight` 8.52:1 and 8.33:1; validated palette).
- **Names:** StatStrip cell links as in §3.7; "View Calls per day as a table"; FlowSwitcher "Flow for drop-off"; Examples "Show example calls for Price enquiry".
- **Announcements:** range change ("Showing the last 7 days"), section failures ("Couldn't load sentiment"), exports ready. Never the values while arrowing through a chart except through the chart's own region.
- **Targets and touch:** chart periods expose ≥ 24 px hit bands on fine pointers and ≥ 44 px on touch (the band is the full column height, not the bar).
- **Reduced motion and forced colours:** nothing moves; swatches and marks keep `data-mark` borders; focus rings stay visible on plots; in forced colours the hovered or focused bar takes `Highlight` and the others `CanvasText`, and the ReportGrid hairlines stay visible as `CanvasText` borders.

### 3.10 Responsive behaviour (summary)

| Width | Header | StatStrip | Charts | Funnel / Intents | By hour / Number |
|---|---|---|---|---|---|
| ≥ 1440 | H1 + meta + range + Custom… + `⋯` on one row | 4 cells, `num-28`, trend preview on hover or focus | ReportGrid, 2 per row, 240 plots | 2 per row | 2 per row |
| 1280–1439 | Same | Same | 2 per row, 240 | 2 per row | 2 per row |
| 1024–1279 | Meta may wrap under the H1 | 4 cells | 2 per row, 200 | 2 per row | 2 per row |
| 768–1023 | H1 in TopBar; row: meta, range, `⋯` (Custom moves into `⋯`) | 4 cells; no preview on touch | 1 per row, 200 | 1 per row | 1 per row |
| 320–767 | Meta + `⋯`; full-width range row, sticky under the TopBar | 2 × 2 grid with hairline rules, `num-20`, no preview | 1 per row, 160; 3–4 x labels; legend wraps above | Labels wrap to 2 lines; values on their own line | 24 bars, labels every 6 h; number section below |

The page scroller has `overflow-x: clip`, so no header or chart can push the page sideways (F-RWD-008). No section has a fixed height; text wraps. Below 1024 the ReportGrid's vertical rule disappears and every section starts with a full-width hairline.

### 3.11 Telemetry hooks (optional, consent-gated)

Same consent and privacy rules as §2.12.

| Event | Properties |
|---|---|
| `analytics.viewed` | `range`, `test_calls_included`, `sections_failed` (count) |
| `analytics.range_changed` | `from`, `to`, `custom` |
| `analytics.drilldown` | `source` (stat_calls, stat_answered, strip_scope_link, bars, sentiment, funnel_drop, funnel_step_to_flow, intent, hour), `range` |
| `analytics.stat_trend_previewed` | `metric`, `input` (hover, focus) |
| `analytics.table_view_toggled` | `section` |
| `analytics.flow_switched` | `flow_calls_bucket` |
| `analytics.intents_examples_opened` / `.intents_retry` / `.recompute` | `state` (ok, degraded, stale) |
| `analytics.exported` | `format` (csv, pdf), `range` |

Questions these answer: which sections lead to Call reports (and so earn their space); whether anyone opens a KPI's trend preview (if not, it can go); whether people read the funnel and then open the Flow Designer; whether View as table is used (a sign a chart is hard to read).

### 3.12 Acceptance criteria (Analytics)

**Data truth**
- [ ] For the same range and test-call rule, Calls, talk time and sentiment counts equal Call reports' ViewSummary and view counts (one endpoint, §1.1).
- [ ] Each StatStrip cell's delta compares with the previous equal-length window; with no previous calls it reads "No calls in the previous 30 days"; no delta is ever "+∞%".
- [ ] Deltas are coloured by `deltaTone` (negative sentiment up is danger, positive up is success, duration and minutes neutral) and always carry an arrow, sign and words (F-VIS-011).
- [ ] Changing the range changes every section, and every section's meta names the range (F-UX-036); reload restores it.
- [ ] The funnel's fills render for every non-zero step; step labels are "n · label"; the funnel only counts calls on the selected flow version (F-QA-019).
- [ ] A browser test counts once, and test calls are excluded unless "Include test calls" is on (F-QA-006).

**Drill-down**
- [ ] Every element in §1.3 opens Call reports with the listed URL, and the number of rows there equals the number clicked.
- [ ] Enter on a focused chart period opens the same URL as a click.

**Layout and responsive**
- [ ] At 1440×900 the StatStrip and both trend charts are fully visible without scrolling.
- [ ] No horizontal page scroll at 320, 360, 390, 768, 1024, 1280, 1440, 1920 (F-RWD-008); chart text ≥ 12 px at 390 and 1920 (F-VIS-012).
- [ ] At 390 the funnel and intent labels show in full (wrapping), and the StatStrip shows all four values in a 2 × 2 grid without horizontal scrolling (F-UX-048).

**Accessibility**
- [ ] Every chart has View as table; every interactive plot is one tab stop with arrow-key navigation and a spoken summary.
- [ ] axe reports no contrast failures, unnamed controls or heading-order issues in both themes.
- [ ] Under reduced motion nothing animates; no element loops at any time.

**Copy and visuals**
- [ ] No § markers, serif or italic text, uppercase labels, mono labels, HUD brackets, hatch or grid textures; one H1 at `title-20` (F-VIS-010, F-VIS-022).
- [ ] No Card component, border box or background plane in the page body: the StatStrip and the sections are divided by hairlines only, and no table or list sits in a frame inside a section (P7, anti-pattern 7).
- [ ] Every single-series mark (calls per day, funnel fills, intent bars, hour bars, the trend preview line) renders in `--chart-neutral`; only the hovered, focused or selected period is `--chart-highlight`; at rest no chart mark on the page is Neel.
- [ ] No sparkline renders at rest; the trend preview appears on hover (after 300 ms) or on keyboard focus of a StatStrip cell, never on touch, and says "Not enough data yet" under 7 points.
- [ ] The page has no "Latest calls" block; "Open these calls in Call reports" opens `/call-reports?when=30d` with the page's test-call rule.
- [ ] No raw error strings (no "LLM", no vendor names); degraded and stale intents show the last good result with a date.
- [ ] No link on the page points at Billing for anything number-related; the number section links to Settings › Phone setup (F-UX-015).

---

## 4. New components needed

Everything else on both pages is an existing component used as specified. These are the gaps, specified here so nobody invents them locally. Build them in `components/ui/data/` next to the DataTable and chart set.

### 4.1 `ViewSummary` (shared with Leads)

**Purpose.** One quiet line of computed totals for exactly what the table shows (view + search + filters + range), so a data page gets its "KPIs" without mixing scopes or spending 100 px (F-QA-014, F-QA-015). `03-leads` uses the same component with lead metrics. **Don't** use it for trends or deltas (StatTile on Analytics), or for numbers computed in the browser from a loaded page.

| Part | Tokens and rules |
|---|---|
| Bar | height `var(--space-32)` (`--size-view-summary`, registered in 01-foundations §18; counted in the chrome budget); padding `0 var(--page-margin)`; `surface`; bottom hairline `border`; flex, `gap: var(--space-12)`; `white-space: nowrap; overflow: hidden` |
| Lead-in | "In this view" `label-12` `text-3`, followed by a tooltip trigger (the whole lead-in) listing the scope in words: "All calls · search “visit” · When: Last 30 days · test calls hidden" |
| Facts | `meta-12` `text-2`, values in `--fw-medium` `text`, tabular, separated by " · " (`text-3`); ordered by importance; the last facts drop first when space runs out (they stay in the tooltip) |
| Link (optional) | right-aligned link button `meta-12` ("Trends in Analytics"), carrying the range and filters Analytics understands |

| State | Treatment |
|---|---|
| Loading / refreshing | Lead-in real; facts as `--space-8` skeleton bars (first load) or unchanged values with "Updating…" (refresh) |
| Error | "Couldn't load totals · Retry" in `text-3`, Retry as a link button |
| Empty result | Hidden (the table's empty state speaks) |
| Unknown metric (backend not ready) | That fact is omitted, never "0" (P1) |

**ARIA:** `role="status"` region with `aria-label="Totals for this view"`; updates are announced only through the shell announcer's result-count message, not separately. **Responsive:** one line at ≥ 768; wraps to two lines on phones and scrolls away with the page header; hidden at viewport heights ≤ 720 when the table would drop below 10 rows (its facts move into the result-count tooltip). **Motion:** none.

```tsx
<ViewSummary label="In this view" scope={scopeWords}
  facts={[{ id: 'calls', label: 'calls', value: 212 }, { id: 'talk_time', label: 'talk time', value: '4h 36m' },
          { id: 'avg_talk', label: 'avg', value: '1m 40s', prefix: true }, { id: 'negative', label: 'negative', value: 21 }]}
  status={status} onRetry={refetch} link={{ label: 'Trends in Analytics', href }} />
```

### 4.2 Chart drill-down contract (extends the data-nav chart set and StatTile)

Every chart component (`BarChart`, `StackedBarChart`, `BarList`, `Funnel`), `StatTile` and each `StatStrip` cell gain an optional `getHref(datum, series?)` prop. When present:
- the focused or hovered period gets an "Open calls ›" row at the end of its `ChartTooltip`;
- Enter on a focused period, or a click on its hit band, navigates (a real link, so ⌘/Ctrl-click opens a new tab);
- on touch, the first tap shows the tooltip and only a tap on "Open calls" navigates;
- legend items become links (not series toggles) when `getLegendHref` is given; a chart never has both behaviours;
- the hit band is the full column (≥ 24 px wide, ≥ 44 px on touch), never the bar alone;
- the chart's `aria-roledescription` stays "chart"; the period's announcement ends with ", press Enter to open these calls".

### 4.3 `RangeControl` (composition recipe)

`SegmentedControl` (7 days · 30 days · 90 days) + a tertiary `Custom…` Button opening `DateRangePicker` (core §7.1), bound to one URL param. With a custom range, no segment is checked and the button label becomes the range ("1–26 Sep 2026"). Phone: the SegmentedControl goes full width in its own sticky row, and Custom moves into the page's `⋯`. The comparison period ("vs previous 30 days") is derived here and passed to every section, so no section computes its own. Used by Analytics, Billing › Usage and Home.

### 4.4 `ExportPopover` (recipe for data pages)

A Popover (400) titled "Export {n} {noun}" with Format (SegmentedControl CSV | XLSX), Columns (RadioGroup: Visible columns / All columns), page-specific options (Call reports: Include transcripts), a fixed privacy note ("Phone numbers stay masked. Exports are logged."), and one primary "Export {n} {noun}". Synchronous up to 5,000 rows, otherwise a progress toast that becomes "Export ready · Download" (link valid 1 h). Disabled with a reason on an empty view. Shared with Leads' Export, Knowledge and Invoices.

### 4.5 Small extensions (no new component)

| Extension | Where it's specified | Change |
|---|---|---|
| `KeyValueList` source note as a seek link | §2.6.3 | `source` may be `{ label, href }`; rendered as a `meta-12` link; for captured fields it seeks the player and switches to the Transcript tab |
| `StatusTag` domain `review` | §2.6.4 | Reviewed · `check` · neutral (outline); used as a qualifier tag in the sheet header, the optional Reviewed column, and in the actions cell of a row reviewed during this visit, followed by a link button "Undo" |
| `StatusTag` `appearance="plain"` | §2.5, §2.6 | The domain's icon (14, `text-3`) and word (`data-13` or `meta-12`, `text-2`) with no fill, border or tone colour. Used for Sentiment in Call reports' table, sheet and phone list, so each row carries one tint (Outcome) (direction §6.4). Unscored renders its word in `text-3` |
| `FilterBar` fields Intent, Last step reached, Hour of day (IST), Kind, Reviewed | §2.5, §1.3 | New field definitions only (enum, enum per flow version, number 0–23, enum, boolean) |
| `Pager` range suffix | §1.2 | "· test calls hidden" / "· test calls included" appended to the range text |

### 4.6 `StatStrip` (Analytics headline; replaces a row of StatTile cards)

**Purpose.** Four to five headline numbers for one range, read left to right as one band, each a link to its calls. It exists because four bordered cards with sparklines made Analytics read as a generic dashboard (D12, P7). **Use** on Analytics; Billing › Usage and Home may adopt it. **Don't** use it for a single number (use a StatTile), for more than five metrics, or inside a Card.

```
────────────────────────────────────────────────────────────────────────────────────
 Calls ⓘ               │ Answered ⓘ            │ Avg talk time ⓘ       │ Minutes used ⓘ
 212                   │ 78%                   │ 1m 40s                │ 276 min
 ▲ +12% vs previous 30 │ ▼ −3 pts vs previous… │ – No change           │ ▲ +9% vs previous…
────────────────────────────────────────────────────────────────────────────────────
Last 30 days · calls, not legs · test calls excluded · Open these calls in Call reports
```

| Part | Tokens and rules |
|---|---|
| Strip | `<section aria-labelledby>` with a visually hidden `h2` "Overview"; a grid of equal columns; `border-block: var(--bw-hairline) solid var(--border)`; no background, radius or shadow |
| Cell | `padding: var(--space-16) var(--space-20)`; cells 2 to n add `border-inline-start: var(--bw-hairline) solid var(--border)`; the value and delta sit inside one `<a>` (the cell link); hover fills the cell with `--row-hover` over `--dur-fast`; keyboard focus draws the 2 px ring around the link (`outline-offset: var(--space-2)`), inside the cell's padding, so it never touches the neighbouring cell, and opens the trend preview |
| Label row | `label-13` `text-2` + the ⓘ IconButton (14, `text-3`, definition tooltip from `lib/metrics.ts`), outside the link and before it in the tab order |
| Value | `num-28` with its tracking, tabular, `text`; unit in `body-14` `text-3`; `num-20` below 768 |
| Delta | as StatTile (data-nav §4.5, §4.7): `label-12`, arrow + sign + words, coloured by `deltaTone` |
| Scope line | one line under the strip, `meta-12` `text-3`, `margin-top: var(--space-8)`: window · counting rule · test-call rule, then the link "Open these calls in Call reports" (`meta-12` link) carrying the range and test-call rule (§1.2, §1.3). Cells carry no scope line of their own |
| Trend preview | a `ChartTooltip` (data-nav §11.7: `surface-raised`, 1 px `border-overlay`, radius-6, `e2`, `z-tooltip`, `pointer-events: none`), 240 wide, anchored under the cell with `space-8` offset and flipped at the viewport edge. Header `label-12` "Answered · last 30 days"; a 208 × 40 line in `--chart-neutral` at `--icon-stroke`, round joins, no axes, the last point a 6 px dot in `--chart-highlight`; row `meta-12` `text-2` "28 Aug 80% → 26 Sep 78%"; row `meta-12` `text-3` "Low 76% · high 81%". Opens after `--timing-tooltip-delay` on hover, at once on keyboard focus of the cell link, closes on leave, blur or Esc; never on `pointer: coarse`. Under 7 points it reads "Not enough data yet". The link's `aria-describedby` points at a visually hidden sentence with the same facts ("From 80% on 28 Aug to 78% on 26 Sep, low 76%, high 81%") |

| State | Treatment |
|---|---|
| Loading | labels real; values as `space-28` skeleton bars, half the cell width; deltas as `space-12` bars; the scope line reads "Updated when loaded"; `aria-busy` on the strip |
| Error (one metric) | value "–" in `text-3`, delta slot "Couldn't load · Retry" (danger icon, link button); the other cells unaffected |
| Empty range | "0" only when the server says 0; delta "No calls in the previous 30 days" |
| Filtered or custom range | the scope line names it ("1–26 Sep 2026 · calls, not legs · test calls included") |

**Responsive.** ≥ 768: one row of cells. 320–767: a 2 × 2 grid; the second column keeps its `border-inline-start`, the second row gets `border-block-start`; values `num-20`; no trend preview; the scope line wraps. No horizontal scrolling at any width (replaces StatGrid's phone scroll-snap strip on this page). **Motion:** the cell fill fades over `--dur-fast`; the preview fades over `--dur-fast`; no counting numbers. **Forced colours:** cell rules and the focus ring render as `CanvasText` and `Highlight`.

```tsx
<StatStrip label="Overview" scope={scopeWords} scopeLink={{ label: 'Open these calls in Call reports', href }}
  cells={[{ metric: 'calls', value: 212, delta, href, trend: daily }, /* answered, avg_talk, minutes_used */]} />
```

### 4.7 `ReportSection` and `ReportGrid` (layout recipe; no new primitive)

**Purpose.** Lay out a report page as titled sections divided by hairlines instead of cards, so there is one level of containment (P7, anti-pattern 7). Used by Analytics; Billing › Usage should follow.

| Part | Tokens and rules |
|---|---|
| ReportGrid | ≥ 1024: `grid-template-columns: repeat(2, minmax(0, 1fr))`, no gap; each row begins with a full-width hairline (`border-block-start` on both sections of the row). The right-hand section adds `border-inline-start: var(--bw-hairline) solid var(--border)` and `padding-inline-start: var(--space-24)`; the left one `padding-inline-end: var(--space-24)`. A section may span both columns (`grid-column: 1 / -1`). < 1024: one column, each section with its own top hairline. DOM order equals visual order |
| ReportSection | `<section aria-labelledby>`; `padding-block: var(--space-20) var(--space-32)`; no border box, background, radius or shadow; the page background is `surface` |
| Header | one row, baseline-aligned: `h2` `title-16` `text`, then meta `meta-12` `text-3` (range, counts, freshness), then right-aligned actions (ghost sm "View as table", a FlowSwitcher, Recompute); wraps under the title below 480 px of section width |
| Body | the chart (data-nav §11 rules, drawn on `surface`), a BarList, a Funnel or a KeyValueList. Tables shown by "View as table" render as a `flush` DataTable (no frame), so there is never a frame inside a section |
| Footnote | `meta-12` `text-3`, `margin-top: var(--space-8)` |

The ChartFrame header, legend, plot sizing and states (data-nav §11.2–11.9) apply unchanged; only the Card wrapper is replaced (R8).

---

## 5. Reconciliations with the component specs

Where two specs disagree, or a spec's rule cannot hold at a real width, this page decides as follows. The component spec owners should fold these back in.

| # | Conflict | Decision here |
|---|---|---|
| R1 | Call detail tab names differ: data-nav §3.1 "Summary · Transcript · Captured", overlay §4.1 "Summary · Transcript · Data"; data-nav §12.4 says the transcript is the default tab | **Transcript · Summary · Captured**, Transcript first and default. The sheet header carries the outcome, sentiment and first summary sentence, so the Summary tab is detail, not the first read. "Captured" is the glossary word (§1.6) |
| R2 | Overlay §4.6 says the table keeps at least 8 columns beside a docked 560 sheet at ≥ 1440 | At 1440 the table column is 1440 − 232 − 560 = 648 px, which fits 5 columns. The table drops to P1–P2 while the sheet is docked and restores P1–P3 when it closes; at 1920 (1,128 px) all 9 fit |
| R3 | Overlay §4.5 says the transcript inside the sheet uses `role="log"`; data-nav §12.4 says the feed is not `role="log"` (its implicit live region would read interim updates) | Follow data-nav §12.4: `<section>` + `<ol aria-label="Transcript">`, no `role="log"`, in both live and review modes |
| R4 | data-nav §11.6 lets legend items toggle series | On Analytics, legend items are drill-down links (§4.2). A legend never both toggles and navigates |
| R5 | data-nav §4.4 lists StatTile "on Call reports" and "on Analytics" | Call reports uses ViewSummary instead (D4); Analytics uses the StatStrip (§4.6, D12); StatTile stays for Home, Leads pipeline (per `03-leads`) and Billing › Usage |
| R6 | data-nav §7.8 "Call…" is the one inline row action on Leads | Call reports rows have no inline labelled action, only `⋯`; the row's main verb is "open", and "Call back…" lives in the sheet footer and on `C` |
| R7 | data-nav §7.5 lists Call reports P3 as Direction, Flow + version, Language and P4 as Captured, Channel, Call id, Cost | Same, plus Phone at P3 (direction §6.4 anchors it; data-nav omits it), Channel renamed **Kind** (shared call model), and Summary and Result added at P4 |
| R8 | data-nav §11.2 makes every ChartFrame a Card, which turns a report page into a grid of cards (anti-pattern 7) | On Analytics the ChartFrame renders inside a ReportSection (§4.7): same header, legend, plot and states, no Card |
| R9 | data-nav §11.5 and foundations §3.6 drew single-series bars, funnel fills and bar lists in a Neel `--chart-1`, so Analytics was all Neel | Token `--chart-neutral` (alias of `--chart-1`, now Ink: graphite-700 light, graphite-250 dark; 11.46:1 and 9.20:1 on `surface`) for every single-series mark, and `--chart-highlight` (alias of `--accent-mark`; 8.52:1 and 8.33:1) only for the hovered, focused or selected period. Folded into foundations §3.6 and data-nav §4.5, §11.5 and §11.11 in this revision |
| R10 | data-nav §11.1 answers "When are calls busiest?" with a Neel HeatStrip | Analytics uses a 24-bar BarChart by hour in `--chart-neutral` (length is read more precisely than five colour steps). HeatStrip has no other consumer and can be dropped from the component set |
| R11 | data-nav §5.3 renders sentiment as a toned StatusTag everywhere | In tables and lists where Outcome is already tinted, sentiment uses `appearance="plain"` (§4.5); toned sentiment tags remain for the sentiment chart's legend and tooltip |

---

## 6. Open questions for the product owner

1. **Average or median talk time?** This spec ships a mean of answered calls (§1.1). Confirm, or ask for a median as a second metric.
2. **Answered rate:** does voicemail count as answered? (Proposed: yes for outbound, since the line connected.)
3. **Bulk actions on Call reports:** v1 has none. Candidates for v2: Mark reviewed, Export selected, Call back selected (through the Call gate).
4. **Role gating:** should members see Call reports and Analytics (today they do)? Should Recompute and Reveal number be admin-only?
5. **Recording downloads:** which roles, masked or not, and how long the logged link lives (data-nav open question 9).
6. **Re-analyse history:** keep the previous analysis for 30 days so a re-analysis can be compared or reverted?
7. **Needs review:** confirm the definition (negative or mixed, failed or timed out, or no outcome; not yet reviewed) and whether "Reviewed" is per workspace or per reviewer.
8. **Intent clustering:** which windows are computed (7, 30, 90 days?), how often, and who may trigger Recompute.
9. **Browser test billing:** follows `01-agent-cockpit` Q2; the Cost cell and Minutes used definition read the server's rule.
10. **PDF report:** one page per card in the same tokens (proposed), or a shorter executive summary?
11. **New-call polling:** is 60 s acceptable load, or should Call reports subscribe to a server event stream?

---

## 7. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-A11Y-002 call details mouse-only | critical | §2.6, §2.8, §2.10, §2.13 |
| F-QA-005 50 of 121 calls | high | §1.5 B1, §2.2, §2.5, §2.13 |
| F-UX-009 17-column table, no anchor, mouse-only | high | §2.4, §2.5 (columns), §2.11 |
| F-UX-010 transcript buried in a 373 px panel | high | §2.6 |
| F-UX-011 metrics disagree across pages | high | §0 D3, §1.1, §1.2, §3.12 |
| F-QA-006 two legs per browser test | high | §1.1, §1.5 B3–B4, §2.6.1 |
| F-RWD-004 Call reports phone strip | high | §2.4 (phone), §2.11 |
| F-QA-014 KPI scopes mixed | medium | §0 D4, §4.1 |
| F-UX-036 range scope, raw LLM error, stale cache | medium | §0 D6, §3.5, §3.6, §4.3 |
| F-VIS-010 Analytics decoration and inverted hierarchy | medium | §0 D10, §3.3, §3.4, §3.8 |
| F-VIS-011 deltas by sign, mustard neutral | medium | §1.1, §3.5, §3.12 |
| F-VIS-012 distorted sentiment chart | medium | §3.5, §3.9 |
| F-QA-019 funnel without fills, ambiguous steps | medium | §3.5, §3.7 |
| F-UX-015 DID card points at Billing | medium | §0 D5, §3.5, §3.6 |
| F-A11Y-018 table structure | medium | §2.10 |
| F-A11Y-019, F-A11Y-008 contrast of chips, dashes, muted text | medium · high | §2.9, §2.10, §3.9 |
| F-VIS-024 date and duration formats | medium | §1.6, §2.9 |
| F-VIS-027, F-RWD-010 dash-filled columns, no mobile layout | low · medium | §0 D7, §2.5, §2.11 |
| F-RWD-008 Analytics header pushes the page sideways | medium | §3.4, §3.10 |
| F-RWD-009 search and pills overflow on phones | medium | §2.4, §2.11 |
| F-UX-031, F-QA-016 state not in the URL | medium | §1.4 |
| F-UX-030 zeros while loading | medium | §2.7, §3.6, §4.1 |
| F-UX-046 no Mixed, wrong empty copy, blanks first, duplicate headers | low | §2.5, §2.7, §2.9 |
| F-UX-048, EXPLORE-DATA-15, F-VIS-013 truncated names on phones | low · medium | §3.4, §3.10 |
| F-UX-016, F-UX-019 internal strings, raw errors | medium | §2.9, §3.6, §3.8 |
| F-UX-034, F-QA-018 "Learn from this call" dead end | medium | §2.6.4 |
| F-QA-037 stale queued calls | low | §2.7 |
| F-UX-043, F-VIS-022 editorial copy, textures | medium | §3.8, §3.12 |
| F-A11Y-014 silent status changes | medium | §2.10, §3.9 |
| F-A11Y-022 infinite animations on Analytics | medium | §3.7, §3.12 |
| F-VIS-014 clipped tooltips | medium | §3.2 (tooltip max 280, portalled) |
| F-VIS-037 duplicate flow names in pickers | low | §2.5 (FlowSwitcher), §3.5 |
| F-QA-033 analytics cookie before consent | medium | §2.12, §3.11 (telemetry only after consent) |
| F-UX-028, F-QA-036 wallet banner on every page | medium · low | §2.2 (no WalletNotice here; inline reason on Call back…) |
| Design critique: Analytics read as a generic card dashboard (KPI cards, sparklines, chart cards, all Neel, a framed table in a card) | major | §0 D12, §3.2–3.5, §3.10, §3.12, §4.6, §4.7, R8–R10 |
| Design critique: two tinted chips per Call reports row | major | §2.3, §2.5 (Sentiment column), §2.6.1, §4.5, R11, §2.13 |
| Usability critique: the review journey stops at one call | major | §2.6.4 (review run), §2.7, §2.8, §2.10, §2.12, §2.13 |
