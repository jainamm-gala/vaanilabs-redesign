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

