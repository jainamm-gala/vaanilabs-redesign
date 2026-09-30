<!-- Assembled from 05-knowledge-billing.part1.md, 05-knowledge-billing.part2.md, 05-knowledge-billing.part3.md, 05-knowledge-billing.part4.md, 05-knowledge-billing.part5.md, 05-knowledge-billing.part6.md, 05-knowledge-billing.part7.md. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->

# 03-pages · 05 · Knowledge and Billing

**Status:** v1 for build · **Date:** 2026-09-27 · **Area:** knowledge-billing (`/knowledge`, `/knowledge/proposals`, `/billing/*`, the app-wide Top-up sheet)
**Follows:** `spec/00-design-direction.md` (Sutradhar, cited *D §n*, especially §6.6), `spec/01-foundations.md` + `spec/tokens/tokens.css` (*F §n*), and the component specs `02-components-core.md` (*C §n*), `02-components-data-nav.md` (*N §n*), `02-components-overlay-feedback.md` (*O §n*). Components are named as those specs name them. Anything they do not cover is in §3 "New components needed".
**Evidence:** finding ids (F-UX-…, F-VIS-…, F-RWD-…, F-A11Y-…, F-QA-…) refer to `audit/consolidated/`; raw ids (EXPLORE-DATA-…, QA-B-…) to `audit/raw/`.
**Privacy:** every name, amount, file, UPI ID and workspace here and in the mock is fictional ("Sample Realty", "Anika R."). No customer or lead data from the audit appears.

| Deliverable | Path |
|---|---|
| This spec (assembled) | `spec/03-pages/05-knowledge-billing.md`, assembled from `.part1.md` to `.part7.md` (edit the parts, then re-assemble) |
| Reference mock (Knowledge, Billing › Wallet, Top-up sheet, Autopay, phone frames; light and dark) | `spec/03-pages/05-knowledge-billing.html` (links `../tokens/tokens.css` and `../tokens/base.css`) |
| Renders | `05-knowledge-billing-light.png` (1440), `-dark.png` (1440), `-mobile.png` (375 frames) |

**Contents.** Part 1: §0 decisions and the shared layer; §1.1–1.4 Knowledge purpose to layout. Part 2: §1.5–1.10 components, sources table, Add knowledge, source sheet, Test a question, proposals. Part 3: §1.11–1.18 explainer, states, keys, copy, accessibility, responsive, telemetry, acceptance. Part 4: §2.1–2.8 Billing purpose, IA, Wallet, Top-up sheet, Autopay. Part 5: §2.9–2.12 Usage, Plans, Invoices, states. Part 6: §2.13–2.18 keys, copy, accessibility, responsive, telemetry, acceptance. Part 7: §3 new components, §4 reconciliations, §5 open questions, §6 traceability.

---

## 0. Decisions and the shared layer

Both pages are visited between calls, and both fail the same test today: **they do not tell the operator whether the thing they paid for or uploaded actually works.** Knowledge lists storage keys with an "Embed" button on every row and no status (F-UX-033). Billing shows ₹0.00 and "0 transactions" beside 158 minutes of calls, with no rate, usage or invoice (F-UX-021, F-UX-011). Each journey also ends in a dead end: "Review proposals" silently lands on the live-call Cockpit (F-UX-034), and every "Top up" opens Profile (F-UX-002). J7 "Understand spend and top up" was rated 2/5 (ux-audit).

**K1. A source is only useful when it is indexed, so status is the first column.** Every source carries one computed status sentence, "Indexed · 42 passages", "Indexing… 60%", "Couldn't index · Retry" (D §6.6, O §11.1). "Embed" as a routine row button is retired; re-indexing appears only when it is needed.

**K2. Testing sits beside the library.** At ≥1440 the "Test a question" panel is docked next to the sources table, because the loop is add → test → fix. The verdict speaks the Flow Designer's language: "Would answer from 3 passages" or "Nothing matched well enough. A Knowledge lookup step would take its Not found path" (D §6.5 Action outputs).

**K3. One way in, three source types.** Add knowledge takes Files (PDF, DOCX, TXT, CSV), Text, or a Web page. The separate "CSV Data" mode is merged into Files: a CSV opens a short "How should the agent read this table?" step (F-UX-033, QA-B-26).

**K4. Say that knowledge is live.** Sources have no draft: they reach live calls as soon as indexing finishes. The Add dialog, the delete confirmation and "How knowledge works" say so, and deleting a source that a live flow uses names that flow (P1, P3).

**K5. Proposals are an admin queue, never a redirect.** Admins see a "Proposals" tab with a count; members never see the entry, and a direct visit renders Forbidden inside the shell (F-UX-034, F-QA-018, O §16.1).

**B1. Billing is the only money hub, with five route tabs:** Wallet · Usage · Plans · Invoices · Autopay (D §6.6). Settings › Meetings Billing moves to Plans (F-UX-021).

**B2. Top up is one sheet, reachable from anywhere, in place.** `?topup=1` on any route opens the Top-up sheet (a `gate` Sheet, O §4.1) without leaving the page the user was working on. Legacy `/settings#wallet` and `/settings#autopay` redirect (F-UX-002, F-QA-004).

**B3. Money is shown, never guessed.** The sheet shows the amount charged (including tax, when tax applies) on the Pay button, the runway the top-up buys, and the new balance before paying. A balance changes only after the payment provider confirms; until then the state is "Payment pending" (P1, O §17).

**B4. One primary per region.** Wallet: "Top up" in the page header is the only filled button. Autopay is a secondary action in its own card (F-UX-021, F-A11Y-009).

**B5. Usage counts calls, not legs, and separates test calls**, using the same metrics layer as Call reports and Analytics (`/api/calls/stats`, `lib/metrics.ts`; see `03-pages/04-call-reports-analytics` §1.1) (F-QA-006, F-UX-011).

**B6. The wallet warning never appears on Billing as a banner.** Billing states low and empty balances in its own balance card. The WalletNotice ladder (O §10.2) stays on money-spending pages only.

### 0.1 Kept from today (strengths, 00-summary §4)

| Keep | Where it lands |
|---|---|
| UPI-native top-up with ₹100 / ₹500 / ₹1,000 presets | CurrencyInput presets in the Top-up sheet (§2.6) |
| Billing reflows cleanly from 1920 to 360 | Single-column phone layout keeps the same order (§2.5) |
| The four ways to add knowledge (file, text, web page, CSV) | Add knowledge, with CSV folded into Files (§1.7) |
| "Test what your agent would find… the same search as live calls" | Test a question panel, with the promise kept and the jargon removed (§1.9) |
| Knowledge pagination in the URL (`?page=1&size=20`) | DataTable pager in the URL; `size=20` maps to 25 (§1.6) |
| Knowledge lookup can target "All sources" or one source | The Test panel's Scope select mirrors it (§1.9) |
| Data Export lists what an archive contains | "Download all invoices" states contents and format (§2.10) |

### 0.2 Backend dependencies (hidden, not simulated: D §8)

| Id | Capability | Needed for | UI until it ships |
|---|---|---|---|
| KB1 | Per-source status (queued, uploading, reading, indexing %, indexed, failed + reason code) and passage count | Status column, meta counts | Status column shows "Uploaded" for every existing file (the only proven fact); no passage counts; "Re-index" stays in ⋯ for all |
| KB2 | Original file name and editable title | Source names | Strip the 13-digit epoch prefix client-side (`/^\d{13}-/`) as a stop-gap; Rename hidden |
| KB3 | Source → flow step references (direct and "All sources") | Used by column, delete impact | Column hidden; delete confirmation says "Flows that look up all sources will stop finding it" |
| KB4 | Test search returning score, the live lookup's threshold and passage location (page, row, heading) | Result meter, verdict | Results listed in rank order without meter or verdict |
| KB5 | Lookup outcomes on calls (Found / Not found, question text) | "Unanswered on calls" section | Section hidden |
| KB6 | Proposals API for admins + role in `/api/auth/me` | Proposals tab | Tab hidden for everyone; `/knowledge/proposals` renders Forbidden for members |
| KB7 | Passage listing per source | Source sheet › Passages tab | Tab hidden |
| BL1 | Rates endpoint: per product, unit, rounding rule | Plans › Your rates, runway, usage | Interim line "Phone calls ₹0.04/s" from config (D §8 interim) |
| BL2 | Runway: balance ÷ the workspace's blended per-second rate; median call duration | Balance card, Baseline, Top-up sheet | Runway hidden; the rate line shows instead |
| BL3 | Top-up quote: bounds, tax, total charged | Top-up summary, Pay label | Bounds from config (₹100 to ₹1,00,000); tax row hidden; Pay label uses the entered amount |
| BL4 | Payment order + status (created, pending, captured, failed, expired) by webhook or polling | Pay step, pending, success | Today's hosted checkout; the sheet shows "Complete the payment in the payment window" and the same result states |
| BL5 | Mandate lifecycle (pending approval, active, paused, revoked, expiring) + next debit notice | Autopay tab | Today's two states (Inactive/Active) mapped to Off/On |
| BL6 | Wallet ledger with balance-after and daily call-charge roll-ups | Transactions | Top-ups only, no balance-after column |
| BL7 | Usage aggregates by product and day (calls, not legs; test calls separate) | Usage tab | Tab shows the rates and "Usage appears here once it is counted per call" (not-yet EmptyState) |
| BL8 | Invoices with GST fields and PDF; billing details (legal name, GSTIN, state) | Invoices tab | Tab hidden from RouteTabs |
| BL9 | Billing roles (who can pay, change autopay, see invoices) | Permission states | Everyone who can open Billing can pay (today's behaviour) |

### 0.3 Routes and URL state (`useUrlState`, N §0.7)

| Route | Query params (all restorable by reload, Back and a pasted link) |
|---|---|
| `/knowledge` | `q`, `f.type`, `f.status`, `f.usedBy`, `sort`, `page`, `size`, `source=<id>&tab=overview\|passages\|used-by`, `test=<question>&scope=<all\|sourceId>`, `add=files\|text\|web` |
| `/knowledge/proposals` | `view=pending\|accepted\|dismissed`, `page`, `proposal=<id>` |
| `/billing` | redirects to `/billing/wallet` (a `replace`, so Back is not trapped) |
| `/billing/wallet` | `range`, `f.kind`, `page`, `size`, `txn=<id>` |
| `/billing/usage` · `/plans` · `/invoices` · `/autopay` | `range` (usage) · none · `fy`, `page`, `invoice=<id>` · none |
| **Any signed-in route** | `topup=1` (+ optional `amount=500`) opens the Top-up sheet in place; closing removes the params with `replaceState` |

**Redirects** (client handler on `/settings`, server redirects elsewhere; each logs `legacy_redirect_hit`): `/settings#wallet` → current page `?topup=1` if reached from a link, else `/billing/wallet?topup=1` · `/settings#autopay` → `/billing/autopay` · `/settings#meetings-billing` → `/billing/plans` · `/settings/wallet`, `/settings/billing` (aliases observed in 01-product-understanding part 4) → `/billing/wallet`. CI checks that every in-app `#hash` link resolves (F-UX-002 recommendation).

---

## 1. Knowledge (`/knowledge`)

### 1.1 Purpose and job to be done

**Primary job:** *When my agent needs facts I did not script (prices, policies, FAQs, inventory), I want to add them once, see that the agent can use them, and check what it would say, so callers get correct answers.* The user is the flow builder or operator (01-product-understanding part 1, persona 2).

**Secondary jobs:** find out why a source failed and fix it; see which flows depend on a source before changing it; review answers proposed from real calls (admins); learn once how knowledge reaches a call.

**Not this page's job:** configuring the Knowledge lookup step (Flow Designer inspector), reading call transcripts (Call reports), or storing the WhatsApp brochure (it moves to Settings › Workspace › Assets, F-UX-041; not a knowledge source).

### 1.2 Findings addressed and what changes

| Finding | Today | Change |
|---|---|---|
| F-UX-033 (medium) | Storage-key names, no status, Embed and Delete equal weight, CSV mode identical to Upload, two static KPI cards | Original names with type icon; status sentence per source; Delete in ⋯ with Undo or confirmation; CSV folded into Files with a table step; static cards removed, facts moved to the header meta |
| F-UX-034, F-QA-018 (medium) | "Review proposals" shown to members, silent redirect to Cockpit | Proposals tab only for admins, with a count; Forbidden page inside the shell for direct visits |
| F-UX-016 (medium) | "embedded with Gemini", "text-embedding-004 (768-dimensional vectors)", "pgvector" | Plain words: "indexed", "passages", "search"; banned-terms lint |
| F-UX-019 (medium), EXPLORE-DATA-18, QA-B-26 | Search error rendered in the Upload card, about 500 px from the search box | InlineError directly under the question field, `role="alert"` |
| F-RWD-016 (medium) | Table min-width 691 px hides Embed and Delete from 880 px down; header clipped at 360 | Priority columns, pinned key and actions columns at 768–1023, ListRow below 768 |
| F-A11Y-003 (high; axe `label` critical on /knowledge) | Native file input unlabelled; search unlabelled | Dropzone with labelled "Choose files" button; SearchInput with label; every field in a Field |
| F-A11Y-008 (high) | 38 of 88 text nodes below AA; 8–10 px tracked mono labels | Tokens only: `--text-3` ≥ 4.70:1, 12 px floor, no mono labels |
| F-A11Y-016 (medium) | The four mode buttons are not tabs and expose no state | SegmentedControl (radio semantics) for source type |
| F-VIS-001, F-VIS-005, F-VIS-006 | Uppercase "AGENT KNOWLEDGE", mono body, 11 bespoke button styles, 0 of 13 shared buttons | PageHeader with H1 "Knowledge", Hanken throughout, Button only |
| F-VIS-024 (medium) | "21/09/2026, 16:19:12" | `formatWhen`: "Today 10:42 am", "21 Sep 2026" |
| F-VIS-034 (medium) | Content ~1,150 px centred while header actions sit at 1,620–1,895 at 1920 | Data page: fluid table aligned with the header; docked panel at ≥1440 |
| F-UX-035 (medium) | Delete beside Embed on every row | Delete only in ⋯, after a separator |
| F-UX-017 | Rail "Knowledge", H1 "AGENT KNOWLEDGE" | One name from `lib/nav.ts`: Knowledge |
| F-UX-043 | Em dashes ("Search failed — check network connection") | Full stops and middle dots |

### 1.3 Information hierarchy

1. **First: is my agent's knowledge usable right now?** The Status column of the sources table, and, when something failed, one section Notice above the table ("1 source couldn't be indexed…"). This is where the eye lands after the H1.
2. **Second: the two actions of the loop.** "Add knowledge" (the page's one primary, header right) and the question field of "Test a question" (docked right at ≥1440).
3. **Third: context.** Header meta ("14 sources · 612 passages · 1 indexing"), Used by, Updated, filters, the Proposals tab count, "How knowledge works".

Everything else (size, added by, file type) is P3–P4 or lives in the source sheet.

### 1.4 Layout

**Desktop ≥1440** (1440×900 shown; sidebar 232, content 1208). The docked column holds either the Test panel (default, remembered open or closed per user) or an open source sheet; opening a source swaps the dock, closing it returns the Test panel. Both are `--size-sheet-record` (440), so the table keeps 768 px.

```
┌─ Sidebar 232 ─┬─ Knowledge  14 sources · 612 passages · 1 indexing ····· [ⓘ How knowledge works] [+ Add knowledge] ┐ 56
│ Build         ├─ Sources   Proposals 3 ──────────────────────────────────────────────────────────────────────────┤ 40 (admins)
│ ▸ Knowledge   ├──────────────────────────────────────────────────────────┬──────────────────────────────────────┤
│               │ ⚠ 1 source couldn't be indexed. Callers get no answers  │ Test a question                  [×] │
│               │   from it. Show it                                       │ Scope  [All sources            ▾]    │
│               │ [⌕ Search sources…  ] [≡ Filter] [Status  Failed ×]  14  │ Question                             │
│               ├──────────────────────────────────────────────────────────┤ [2BHK ka price kya hai?          ]   │
│               │ ☐ Source ↕             Status                Used by  Upd │ [Search]  Uses the same search as    │
│               │ ☐ ▤ Price sheet (Sep)  ✓ Indexed · 42 passag  2 flows 2m  │           live calls.                │
│               │ ☐ ▤ Possession timeli  ⊗ Couldn't index · No  Not used 1h │ ✓ Would answer from 3 passages       │
│               │ ☐ ◍ Project amenities  ◌ Indexing… 60%        1 flow  now │ 1 Price sheet (Sep) · page 2         │
│               │ ☐ ▦ Unit inventory     ✓ Indexed · 200 rows   1 flow  21S │   ▮▮▮▯ Strong match                  │
│               │ ☐ ≡ Payment plans      ✓ Indexed · 6 passages 3 flows 19S │   "2BHK units start at ₹85 L…"       │
│               │ …                                                        │ 2 Payment plans · passage 3 …        │
│               ├──────────────────────────────────────────────────────────┤ ──────────────────────────────────── │
│               │ 1–14 of 14 sources      Rows per page 50 ▾  Page 1 of 1 ‹›│ Unanswered on calls · last 7 days    │
├───────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────┤
│ Live v7 · Site-visit qualifier │ Inbound +91 80 •••• 2210 · Ready │ Wallet ₹2,340.50 · about 16 h of calls │ Shortcuts  Search │ 28 Baseline
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Laptop 1280–1439** (sidebar 232). The table takes the full content width (P1–P3 columns). "Test a question" becomes a secondary header button that opens the Test panel as a non-modal overlay sheet on the right third (O §4.6); the table stays interactive behind it. Source sheets overlay the same way.

**Laptop 1024–1279** (rail 56). As 1280–1439 with P1–P2 columns (Source, Status, Used by, Updated). "How knowledge works" becomes an icon-only tertiary button with a tooltip. At heights ≤ 720 the Baseline folds into a header chip (D §6.1).

```
┌R─┬─ Knowledge  14 sources · 1 indexing ·········· [ⓘ] [Test a question] [+ Add knowledge] ┐
│56│ Sources  Proposals 3                                                                   │
│  │ ⚠ 1 source couldn't be indexed. Callers get no answers from it. Show it               │
│  │ [⌕ Search sources…] [≡ Filter]                                            [▥]          │
│  │ ☐ Source ↕                 Status                         Used by    Updated        ⋯  │
│  │ …                                   ┌ Test a question (overlay 440) ────────────── × ┐ │
│  │                                     │ …                                               │ │
└──┴─────────────────────────────────────┴─────────────────────────────────────────────────┘
```

**Tablet 768–1023** (TopBar 52 with the H1 as title, wallet chip, search). One pane at a time: a SegmentedControl "Sources · Test" (N §3.1) switches the body between the table and the Test panel, and keeps `?pane=` in the URL. Table shows P1 (Source, Status) plus Used by if it fits, with the key and actions columns pinned so ⋯ is never scrolled away (fixes F-RWD-016). Sheets are modal, full height.

```
┌ ☰  Knowledge                                 [₹2,340] [⌕] ┐ 52
│ 14 sources · 1 indexing                      [⋯] [+ Add]   │ 48  (⋯: How knowledge works)
│ Sources   Proposals 3                                      │ 40
│ [      Sources      |       Test        ]                  │ 32
│ ⚠ 1 source couldn't be indexed. Show it                    │
│ [⌕ Search sources…               ] [≡ Filter 1]            │
│ Source ↕ (pinned)          Status                    ⋯(pin)│
│ ▤ Price sheet (Sep)        ✓ Indexed · 42 passages     ⋯   │
│ 1–14 of 14                                     ‹  ›        │
└────────────────────────────────────────────────────────────┘
```

**Phone 320–767** (TopBar + BottomBar; Knowledge is reached from More). Touch density. The SegmentedControl is full width; sources are ListRows; the header row keeps only the meta, ⋯ and "Add".

```
┌ Knowledge            [₹2,340][⌕] ┐ 52
│ 14 sources · 1 indexing  [⋯][Add]│ 48
│ Sources  Proposals 3             │ 40 (admins)
│ [   Sources    |     Test     ]  │ 44
│ ⚠ 1 couldn't be indexed. Show it │
│ [⌕ Search sources…             ] │ 44, own row
│ [≡ Filter] [Status Failed ×] →   │ scrolling row
├──────────────────────────────────┤
│ Price sheet (Sep)      ✓ Indexed │ ListRow line 1
│ PDF · 42 passages · 2 min ago    │ line 2 (meta-12)
│ Possession timeline  ⊗ Couldn't… │
│ PDF · No text found · 1 h ago    │
│ Project amenities   ◌ Indexing…  │
│ Web page · 60% · just now        │
│ 1–14 of 14                ‹  ›   │
├──────────────────────────────────┤
│ BottomBar · More current         │ 56 BottomBar
└──────────────────────────────────┘
```

---

### 1.5 Components used (by spec name) and configuration

| Region | Component | Configuration |
|---|---|---|
| Header | `PageHeader` (N §2) `variant="page"` | `navId="knowledge"`; meta `{sources} sources · {passages} passages · {n} indexing` (the last part only when > 0; skeleton while loading, never "0"); actions: tertiary "How knowledge works" (`info`), secondary "Test a question" (hidden at ≥1440 while the dock is open), primary "Add knowledge" (`plus`) |
| Sub-routes | `RouteTabs` (N §3) | "Sources" `/knowledge` · "Proposals" `/knowledge/proposals` with `CountBadge` of pending proposals; rendered **only for admins** (a member sees no tab row, saving 40 px) |
| Pane switch (<1024) | `SegmentedControl` (N §3.6) | "Sources" / "Test", `?pane=`, full width below 768 |
| Attention | `Notice` (O §10) `tone="warning" scope="section"` | Shown when ≥ 1 source failed; action "Show it" / "Show them" applies `f.status=failed`; not dismissible (it is a real, fixable condition) |
| Toolbar | `FilterBar` (N §6) | Search "Search sources…" (`label="Search sources"`); fields: Type (File, Text, Web page, Table), Status (Indexed, Indexing, Queued, Couldn't index), Used by (flow names, "Not used"); Columns; density switch |
| Table | `DataTable` (N §7) `id="knowledge-sources"`, `frame="flush"` | Columns and row actions in §1.6; `getRowHref` → `?source=<id>`; server pagination 25 · 50 · 100 (default 50) |
| Phone list | `ListRow` (N §7.13) | title = source name, titleTrailing = compact `StatusTag` (domain `knowledge`), meta = type · passages or reason · updated |
| Status | `StatusText` md (O §11.1) in the Status cell; `StatusTag` (N §5.3, domain `knowledge`) on phones and in the sheet header | Tones: success Indexed, progress Indexing… n%, neutral Queued, danger Couldn't index |
| Add | `Dialog` md (O §2), `SegmentedControl`, `Dropzone` (C §7.2), `TextInput`, `Textarea`, `Field` | §1.7 |
| Record | `Sheet` `variant="record"` (O §4) | Docked at ≥1440, overlay 1024–1439, modal below; §1.8 |
| Test | `Sheet`-shaped docked panel (`record` width), `Select`, `TextInput`, `Button`, **RetrievalResult** (new, §3) | §1.9 |
| Explainer | `Popover` (O §5) info variant | §1.11 |
| Feedback | `Toast` (O §9), `ConfirmDialog` (O §3), `EmptyState` (O §15), `TableState` (N §7.12), `InlineError` (O §11.2), `ConnectionBar` (O §10.3) | Per state, §1.12 |
| Shell | `AppShell`, `Baseline` (D §6.1) | Standard; Knowledge is not a money-spending page, so no WalletNotice (O §10.2) |

### 1.6 Sources table

**Columns** (`DataTable` meta, N §7.5). Default sort: Updated, newest first. At most 7 columns visible by default.

| Column | Priority | Cell | Notes |
|---|---|---|---|
| Select | – | Checkbox "Select Price sheet (Sep)" | Bulk: Re-index (only when a selected source failed), Delete n sources… in the BulkBar ⋯ |
| Source (key) | P1 | Type icon 16 in `--text-3` (`file-text` PDF, DOCX, TXT · `sheet` table · `globe` web page · `text` pasted text · `message-square` answers from calls) + name in `data-13` 500, `translate="no"`, truncated at 40ch with a tooltip | Sort A–Z. The icon has a visually hidden type word ("PDF") |
| Status | P1 | `StatusText` md (table below) | Sort by severity: Couldn't index, then in progress, then Indexed |
| Used by | P2 | "3 flows" as a link to the sheet's Used by tab (flows that reach the source directly or through an all-sources lookup) · "Not used" in `--text-3` | KB3. The tooltip splits direct and all-source flows and gives each one's Live or Draft state |
| Updated | P2 | `formatWhen` in `<time>` | Sort |
| Type · size | P3 | "PDF · 273.6 KB" · "Table · 200 rows" · "Web page · fetched 21 Sep" | |
| Added by | P4 | 20 px Avatar + name | Off by default |
| Actions | pinned right | ⋯ IconButton "More actions for Price sheet (Sep)" only. No inline button: a failed row's fix is the first item of its ⋯ menu and the action of the source sheet's Notice | Always reserved width (fixes F-RWD-016). Verified in the mock: with the dock open the table is 768 px and an inline "Replace file…" did not fit |

**Status sentences** (domain `knowledge` in `lib/status.ts`; the sentence carries the state, never the colour alone):

| State | Sentence (Status cell) | Tone · icon | Phone / sheet tag |
|---|---|---|---|
| Uploading | Uploading… 42% + 2 px ProgressBar | progress · Spinner | Uploading… |
| Queued | Queued | neutral · `clock` | Queued |
| Reading | Reading… (extracting text or fetching the page) | progress · Spinner | Reading… |
| Indexing | Indexing… 60% | progress · Spinner | Indexing… 60% |
| Indexed | Indexed · 42 passages (tables: "Indexed · 200 rows") | success · `check` | Indexed |
| Couldn't index | Couldn't index · No text found (the short reason, table below) | danger · `circle-x` | Couldn't index |
| Couldn't upload | Couldn't upload · Connection lost | danger · `circle-x` | Couldn't upload |

**Failure reasons** (reason code → a short reason for the Status cell and the phone meta line, and one sentence with the fix for the Status tooltip and the source sheet Notice; the Add dialog's file rows, which have room, use "Couldn't index · Retry" or the fix link, O §11.1):

| Code | Sentence | Fix action |
|---|---|---|
| `no_text` | No text found. It may be a scanned PDF. | Replace file… · Paste the text instead |
| `encrypted` | The file is password-protected. | Replace file… |
| `too_large` | Larger than 10 MB. Split it into smaller files. | Replace file… |
| `fetch_blocked` / `fetch_login` | The website didn't let us read this page. / The page needs a sign-in. | Paste the text instead |
| `fetch_not_found` | The page wasn't found. Check the address. | Edit address… |
| `empty` | This source has no text. | Replace file… · Delete source… |
| `internal` | Something went wrong on our side. | Retry · Details (error id in `mono-12`, O §11.2) |

**Row ⋯ menu** (Menu, O §7): on a failed row, the fix first (Retry · Replace file… · Edit address… · Paste the text instead…), then a separator; then Test with this source · Rename… · Replace file… (files) / Re-fetch page (web) / Edit text… (text) · Re-index (only when failed) · Download original · Copy source id · separator · **Delete source…** (`--danger-text`).

**Delete** follows O §3.1: a source no flow uses is deleted at once with an Undo toast, "Deleted 'Price sheet (Sep)' · Undo" (tier 1; tier 2 if the backend cannot soft-delete). A source a flow uses, directly or through an all-sources lookup, gets a ConfirmDialog (tier 2):
> **Delete 'Price sheet (Sep)'?** Live calls stop finding its 42 passages as soon as you delete it. Site-visit qualifier (Live v7) looks it up in step 5, and 2 flows look up all sources. Call reports that quoted it are kept. · Cancel · **Delete source**

After a delete, a flow whose step pointed at that source shows a validation error on its draft ("Knowledge lookup points to a deleted source"), so the next Publish is blocked until it is fixed (D §6.5 validation).

**Page drop target** (enhancement; the "Add knowledge" button remains the address, P5): dragging files over the content area shows an overlay, `--accent-soft` fill with a 1 px `--accent-mark` inset border (never dashed, F §7), "Drop files to add them to Knowledge". Dropping opens Add knowledge on Files with the files already uploading.

### 1.7 Add knowledge (`Dialog` md 560; lg 720 for the table step)

- **Header:** title "Add knowledge", description "Your agent can quote these on calls once they're indexed."
- **Source type:** `SegmentedControl` labelled "Source type": Files · Text · Web page (`?add=`). Radio semantics, arrow keys (fixes F-A11Y-016).
- **Footer:** why-text "Sources reach live calls as soon as they're indexed." (K4) · Cancel or Done (tertiary) · the type's primary. Closing the dialog never cancels uploads; progress continues in the table and, off the page, in a progress toast "Adding 3 sources… 1 indexed · View" (O §9.2).

**Files.** `Dropzone` (C §7.2) labelled "Knowledge files"; contract line "PDF, DOCX, TXT or CSV · up to 10 MB each · up to 20 files" (limits from the server). Uploads start on add; each file row walks the status sentences above live, so the user sees "Indexed · 42 passages" without leaving the dialog. The title defaults to the file name without its extension. No primary button in this mode: the footer shows **Done** (secondary). A duplicate (same content hash) gets a row warning: "Already in Knowledge as 'Price sheet (Sep)'. **Replace it** · **Add anyway**".

**Table step** (a CSV was added; the file row shows "Table · 200 rows · **Choose how to read it**"; the dialog body is replaced, size lg, one modal at a time, O §1.6):
- Title "How should the agent read 'Unit inventory.csv'?"
- `RadioGroup variant="card"` (C §6.2): **Row by row** (default; "Best for price lists, inventories and directories. Each row becomes one passage.") · **As plain text** ("The whole file is read as one document.").
- Row by row: **Columns to include** (Checkbox group listing each header with a sample value, all on), **Name each row by** (Select, first text column by default).
- **Preview** (TablePreview, new §3): the first 5 rows exactly as passages, e.g. "Tower B 2BHK: Size 1,150 sq ft · Price ₹85 L · Floor 7".
- Errors: "The first row should hold column names, like Tower, Type and Price." · "This table has 25,000 rows. Split it into files of 5,000 rows or fewer." (limit from the server).
- Footer: Back (tertiary) · **Add 200 rows** (primary).

**Text.** Field "Title" (TextInput, required, max 100, hint "Shown in the sources list and in call reports when the agent quotes it") · Field "Text" (Textarea, rows 8, maxRows 16, soft count "1,240 of 50,000", placeholder "Paste product details, FAQs, policies or scripts…"). Primary **Add text**. A dirty dialog uses the inline discard state (O §2.5).

**Web page.** Field "Page address" (TextInput `type="url"`, `httpsUrl` validation on blur: "Enter a full address starting with https://."; placeholder "https://yourcompany.in/pricing…"; hint "We read this one page, not the whole site. Re-fetch it from the source's menu when the page changes.") · Field "Title (optional)" (defaults to the page title). Primary **Add page**. The row then shows Reading… while the page is fetched.

### 1.8 Source sheet (`Sheet variant="record"`, 440)

- **Header** (O §4.2): title = source name (`translate="no"`); meta "PDF · 12 pages · added 21 Sep 2026 by Anika R."; Previous / Next source (J / K in tooltips), Copy link, ⋯ (the row menu), Close.
- **State line** under the header: `StatusTag` lg + the status sentence. When failed, an inline danger `Notice`: lead sentence = the reason; action = the fix ("Replace file…", "Paste the text instead", "Retry").
- **PanelTabs** (`?tab=`): **Overview** · **Passages** (KB7) · **Used by** (KB3).
  - *Overview:* `KeyValueList` inline: Status · Passages 42 · Type PDF, 12 pages · Source (original file name, the page address as an `external-link`, or "Pasted text") · Fetched (web pages) · Added · Last indexed · Languages (LanguageMark per detected language; row hidden when detection is unavailable). Actions: secondary **Test with this source** (sets the Test scope and focuses the question) and, only when failed, tertiary **Retry**.
  - *Passages:* numbered passages, each "Passage 4 · page 2" (`meta-12` `--text-3`) over the text in `read-15` (`lang` set; Devanagari in `read-15-deva`), clamped to 6 lines with "Show more"; a `SearchInput` "Find in passages…"; a small Pager. For "Answers from calls", each answer has Edit… and Remove (Undo).
  - *Used by:* flows that reference the source, each "Site-visit qualifier · Live v7 · step 5, Knowledge lookup · **Open in flow**", then "2 flows look up all sources" with their names; then "Quoted on 18 calls in the last 7 days · **Open in Call reports**" (`/call-reports?f.source=<id>&range=7d`), from TurnRow source notes (N §12.4), hidden until that data exists.
- No footer: the sheet has no everyday action beyond Test, and Delete lives in ⋯ (O §4.2).

### 1.9 Test a question

Docked at ≥1440 (440, `<aside aria-labelledby>`), a non-modal overlay sheet at 1024–1439, the "Test" pane below 1024. Everything in it is Standard density.

| Part | Spec |
|---|---|
| Header | `title-16` "Test a question"; Close IconButton (at ≥1440 closing collapses the dock and brings back the header's "Test a question" button; the choice is remembered per user) |
| Scope | `Select` labelled "Search in": **All sources** (default) or one source (a `Combobox` above 10 sources). Mirrors the Knowledge lookup step's own setting |
| Question | `TextInput` labelled "Question", placeholder "Ask the way a caller would…", hint "Hindi, English or Hinglish. Uses the same search as live calls." `enterkeyhint="search"`; Enter submits. `Button` secondary **Search** (the panel has no primary: the page's one Neel button stays "Add knowledge") |
| Verdict | `StatusText` md, computed against the live lookup threshold (KB4): success "Would answer from 3 passages" · warning "Only weak matches. The agent may say it doesn't know." · neutral "Nothing matched well enough. A Knowledge lookup step would take its Not found path." with **Add an answer…** (opens Add knowledge › Text, title prefilled with the question) |
| Results | Up to 5 `RetrievalResult` rows (new, §3): rank · source name as a link (opens the source sheet) · location ("page 2", "row 14", "passage 3") · a 4-step `Meter` + word (Strong / Good / Weak match; score and threshold in the tooltip, "Score 0.82 · calls use 0.70 and above") · the passage in `read-15`, 4 lines then "Show all" |
| Below threshold | After a divider, collapsed: "2 more below the match threshold (not used on calls)" (Radix Collapsible, `aria-expanded`) |
| Caveat | While any source in scope is indexing: neutral StatusText "1 source is still indexing. Results can change when it finishes." |
| Unanswered on calls (KB5) | Section `title-14` "Unanswered on calls · last 7 days": up to 5 questions with the language name (LanguageMark `name`), the question text and "asked 4 times", each with **Try it** (fills and runs) and **Add an answer…**; link "See these calls in Call reports" |
| Errors | `InlineError` directly under the question field, `role="alert"`: "Couldn't search. Check your connection and try again. **Retry**" (fixes F-UX-019, EXPLORE-DATA-18) |

The last question and scope live in the URL (`?test=&scope=`), so a teammate can open the same test from a shared link.

### 1.10 Proposals (`/knowledge/proposals`, admins only)

Answers suggested from calls ("Learn from this call" in Call reports, inferred today; 01-product-understanding part 5 row 12). Every answer the agent will speak is read by a person first, so there is no bulk add.

- **Header:** the same PageHeader (H1 "Knowledge"), RouteTabs on "Proposals"; meta "3 pending · from calls in the last 30 days".
- **ViewTabs:** Pending 3 · Added · Dismissed.
- **Table** (`DataTable`, flush): Question (key, 48ch) · Proposed answer (`--text-2`, 48ch) · From call ("Today 10:42 am · 2m 14s", a link to the call) · Language (the name, LanguageMark `name`) · Suggested by ("Vaani" or a teammate) · actions **Review** (the row's verb) and ⋯ (Dismiss). BulkBar: count · **Dismiss n** · Clear.
- **Review sheet** (`record`, docked at ≥1440), title "Proposal", meta "From a call today at 10:42 am · suggested by Anika R.":
  - Field "Question" (TextInput) and Field "Answer" (Textarea; hint "Your agent may read this out on calls. Keep it short and factual.").
  - "Where it came from": 2–4 `TurnRow`s around the moment (N §12.4); timecodes open the call at that point (`/call-reports?call=<id>&t=01:12`).
  - "Already in knowledge": the top 2 RetrievalResults for the question, with the verdict ("Probably covered by 'Site visit FAQ' · Strong match"), so duplicates are caught before they are added.
  - Field "Add to" (Select): **Answers from calls** (a managed Text source, created on first use) or any Text source.
  - Footer: **Dismiss** (tertiary) · **Add to knowledge** (primary, ⌘/Ctrl+Enter). After adding: toast "Added to 'Answers from calls' · Undo", the next pending proposal opens, and "Added. 2 proposals left." is announced.
- **Empty (Pending):** EmptyState `done`: "No proposals waiting. Answers suggested from calls appear here for you to review."
- **Members:** no tab. A direct visit renders `Forbidden` inside the shell (O §16.1): "Only organization admins can review proposals." · "Ask an admin (2 in this workspace) to review them for you." · Copy request link · Go back. Never a redirect to the Cockpit.

---

### 1.11 How knowledge works (`Popover`, info variant, 400)

Opened from the header's tertiary "How knowledge works" (icon-only with tooltip below 1280). It replaces the green 11 px mono card with seven steps and three vendor names (F-UX-016, F-A11Y-008). The same numbered list appears under the first-use EmptyState.

1. Add sources: files, pasted text or a web page.
2. Each source is split into short passages (a paragraph, or one table row) and indexed. Most are ready in under a minute.
3. On a call, a **Knowledge lookup** step searches your passages for the caller's question. The agent answers from the best matches, and the call report shows which source it used.
4. If nothing matches well enough, the step takes its **Not found** path.
5. Only this workspace's sources are searched. Changes reach live calls as soon as indexing finishes.

Footer link: "Knowledge lookup in Flows" (docs, same tab).

### 1.12 States

| State | Sources region | Test a question | Copy and behaviour |
|---|---|---|---|
| **First use** (0 sources) | `EmptyState` first-use in the table region; FilterBar hidden; meta "No sources yet" | EmptyState compact | Title "Teach your agent what it can say" · body "Add documents your agent can quote on calls." (O §15.3) · secondary **Upload files** · link "Paste text or add a web page" · the 5-step list from §1.11 below |
| **Loading** | H1 at once; meta skeleton; `TableSkeleton` with the real header; pager "Loading…" | Renders at once (it needs no list) | Skeleton after 200 ms, never "0 sources" (F-UX-030) |
| **Partial** (some indexing or failed) | Rows show their own sentence; section Notice when ≥ 1 failed; meta "· 1 indexing" | Caveat line while any source in scope is indexing | Notice: "**1 source couldn't be indexed.** Callers get no answers from it. **Show it**" |
| **No results** | EmptyState no-results | – | "No sources match 'brochure'." · "Search looks at source names. To search inside sources, use Test a question." · Clear search |
| **Filtered to nothing** | EmptyState filtered | – | "No sources match Status: Couldn't index." · "14 sources are hidden by filters." · Clear filters |
| **Error, first load** | danger Notice in the table body, `role="alert"` | Works (independent) | "Couldn't load sources. Check your connection and try again." · Retry |
| **Error, refresh** | warning Notice above the table; rows stay | – | "Showing sources from 11:24 am. Couldn't refresh." · Retry |
| **Offline** | `ConnectionBar`; rows stay | Search `aria-disabled`, reason "You're offline" | Add knowledge `aria-disabled` with "You're offline"; uploads in progress show "Waiting for connection" and resume if the upload is resumable, else "Couldn't upload · Retry" |
| **Permission** | Proposals: `Forbidden` (§1.10). If a role cannot add or delete sources (open question 6): Add knowledge `aria-disabled` with "Only admins can add knowledge. Ask Anika R."; Delete hidden from ⋯ | – | Never hidden silently when it is the page's main action; the reason is visible |
| **Success** | The row's sentence changes to "Indexed · 42 passages"; for sources added in this session, announce politely "Price sheet (Sep) indexed, 42 passages." | Verdict line | Off the page: the progress toast turns into "3 sources added · View" (O §9.2) |
| **Record gone** | Source sheet: EmptyState compact "This source was deleted, or you no longer have access." + Close (O §4.3) | – | |

**Test a question, own states:** idle (field, recent questions list on focus, stored per user with try/catch) · searching (Search shows "Searching…", results `aria-busy`, three RetrievalResult skeletons after 200 ms) · results · weak only · nothing matched · error (InlineError under the field) · offline · no sources (compact empty).

### 1.13 Interactions and keyboard

| Key | Where | Does |
|---|---|---|
| `/` | Page (single-key switch on) | Focus "Search sources" |
| `↑` `↓`, `J` `K` | Table | Previous / next row; with a sheet open, the sheet follows |
| `Enter` | Row | Open the source sheet (docks at ≥1440) |
| `Space` or `X` | Row | Toggle selection |
| `Esc` | Sheet / search / dock | Close the sheet and return focus to the row · clear the search · (dock stays) |
| `F6` | Page with a dock or sheet | Move focus between the table and the docked panel or sheet (O §1.3) |
| `Enter` | Question field | Run the test |
| `⌘/Ctrl+Enter` | Proposal sheet | Add to knowledge |
| `Shift+D` | Table | Standard / Compact |
| `?` | Page | Shortcut sheet |

No single key adds, deletes or re-indexes anything. The command palette (O §8) lists "Add knowledge…" and "Test a question", and finds sources under its Knowledge group with the status sentence as row meta. Dragging files is an enhancement; "Choose files" is always the address (P5).

**Motion:** status sentences change in place (no animation); ProgressBars move with `transform: scaleX()` over `--dur-base`; the dock appears in one frame (docked sheets do not slide, O §4.7); overlay sheets slide over `--dur-slow`, fade only under reduced motion. No shimmer, no pulsing "processing" dots.

### 1.14 Microcopy (before → after)

| Before (live today) | After |
|---|---|
| AGENT KNOWLEDGE | Knowledge |
| KNOWLEDGE FILES 5 · SUPPORTED DOCS PDF, CSV… · AI INTEGRATION Embeddings → RAG-powered voice agent | Header meta "14 sources · 612 passages · 1 indexing"; types move to the Dropzone contract line |
| Upload Knowledge. "Content is chunked, embedded with Gemini, and indexed for real-time AI retrieval." | Add knowledge. "Your agent can quote these on calls once they're indexed." |
| Upload Files · Paste Text · Website URL · CSV Data | Files · Text · Web page (a CSV is read inside Files) |
| Choose file / No file chosen | Drag files here or **Choose files** |
| Upload & Embed · Save & Embed · Fetch & Embed | (files start on add) · Add text · Add page |
| Document title (optional) | Title |
| Embed (on every row, teal) | Nothing on healthy rows; on a failed row, its fix (Retry, Replace file…) first in ⋯ |
| 1789987752864-….pdf | The original name, e.g. "Price sheet (Sep)" |
| 21/09/2026, 16:19:12 | Today 4:19 pm · 21 Sep 2026 |
| Test Knowledge Search. "Uses the same vector search as live calls." | Test a question. "Uses the same search as live calls." |
| Ask a question to test knowledge retrieval… | Ask the way a caller would… |
| Search failed — check network connection | Couldn't search. Check your connection and try again. Retry |
| How Knowledge Integration Works (7 steps: Gemini text-embedding-004, 768-dimensional vectors, pgvector) | How knowledge works (5 plain steps, §1.11) |
| Review proposals (shown to members, then redirect) | Proposals 3 (admins) · Forbidden page for members |
| Page 1 of 1 · 1–5 of 5 files · PER PAGE 20 | 1–5 of 5 sources · Rows per page 50 |

### 1.15 Accessibility

- **Structure:** one H1; the table is labelled by it with a hidden caption ("Sources, sorted by updated, newest first"); the dock is `<aside aria-labelledby="test-title">`; source sheets are non-modal dialogs at ≥1024 and modal below (O §4.5).
- **Names:** row checkbox "Select Price sheet (Sep)"; ⋯ "More actions for Price sheet (Sep)"; the menu's fix item names the source ("Retry indexing Possession timeline"); type icons carry a hidden type word (F-A11Y-024).
- **Upload:** the Dropzone's Choose files button is the tab stop; the hidden input is labelled "Knowledge files" (fixes the axe `label` critical, F-A11Y-003); per-file uploads and indexing are announced at start, completion and failure only; rejections are announced once as a summary (C §7.2, O §14.2).
- **Status:** always a word plus an icon (F-A11Y-019); progress values are not announced between 25/50/75%.
- **Test:** the verdict is a polite live region announced once per search; results are an `<ol aria-label="Matching passages">`; each Meter is `role="img"` with "Strong match, score 0.82"; passages carry `lang` (Devanagari at 15/26).
- **Focus:** header actions → RouteTabs → SegmentedControl → Notice action → FilterBar → table (one tab stop, N §7.9) → pager; F6 reaches the dock. Forbidden and PageError move focus to the H1.
- **Contrast and size:** tokens only, so the 38 of 88 failing text nodes (F-A11Y-008) disappear with the 12 px floor and `--text-3` (≥ 4.70:1 on every plane).
- **Touch:** Touch density on coarse pointers; ⋯ always visible; Dropzone shows only "Choose files".

### 1.16 Responsive summary

| | ≥1440 | 1280–1439 | 1024–1279 | 768–1023 | 320–767 |
|---|---|---|---|---|---|
| Header actions | ⓘ label · Add | ⓘ label · Test · Add | ⓘ icon · Test · Add | meta · ⋯ · Add | meta · ⋯ · Add |
| Test a question | docked 440 | overlay 440 | overlay 440 | "Test" pane | "Test" pane |
| Table | P1–P2 (+P3 at 1920) | P1–P3 | P1–P2 | P1, pinned key and ⋯ | ListRow |
| Source sheet | docked (swaps with Test) | overlay | overlay | modal, full height | full screen, Back link |
| Add knowledge | Dialog md / lg | same | same | Dialog md centred | full-screen dialog, sticky footer |
| Proposals review | table + docked sheet | overlay sheet | overlay sheet | modal sheet | ListRow + full-screen sheet |

### 1.17 Telemetry (optional)

No file names, source text or question text leave the client in analytics; questions are logged by length and detected language only.

| Event | Properties | Answers |
|---|---|---|
| `knowledge_add_opened` | entry: header · empty · drop · palette · test_answer · proposal | Which paths people use to add |
| `knowledge_source_added` | type, size bucket, table rows bucket | Mix of sources |
| `knowledge_source_state` | state (indexed · failed), reason code, ms to indexed | Indexing health; which failures to fix first |
| `knowledge_test_run` | scope (all · one), results above threshold, verdict, ms | Whether knowledge answers real questions |
| `knowledge_answer_added_from_test` | – | The test → fix loop working |
| `knowledge_proposal_decided` | decision (added · dismissed), edited (bool) | Quality of proposals |
| `knowledge_source_deleted` | used-by count, tier | Risky deletes |
| `forbidden_view` | route | Hidden entries still reached by URL |

### 1.18 Acceptance criteria (Knowledge)

- [ ] H1 is "Knowledge" and `<title>` is "Knowledge · Vaani Labs"; no uppercase, tracked or mono labels on the page.
- [ ] No source name starts with a 13-digit prefix; names come from the server title or the original file name.
- [ ] Every row has exactly one status sentence with a word and an icon; there is no routine "Embed" or "Retry" button; a failed row's fix is the first item of its ⋯ menu and the action of the sheet's Notice.
- [ ] A failed source shows its reason and a fix in the tooltip, the phone meta line and the sheet; the section Notice appears when ≥ 1 source failed and "Show it" sets `f.status=failed` in the URL.
- [ ] Delete exists only in ⋯ after a separator; an unused source deletes with an Undo toast; a used source opens a ConfirmDialog naming each flow and its Live version.
- [ ] axe reports no `label` violation on `/knowledge`; "Choose files" is reachable by Tab and opens the file picker with Enter.
- [ ] Adding a `.csv` opens the table step with a 5-row passage preview; nothing is indexed before "Add n rows".
- [ ] A search error renders directly under the question field with Retry; the verdict names the Found / Not found outcome in words; Scope lists All sources and each source.
- [ ] At 1440×900 the table (≥ 768 px wide) and the Test panel show together; at 1024 the panel is an overlay; at 768 and 375 a Sources / Test switch appears.
- [ ] At 768 and 390 the ⋯ column is visible without horizontal page scroll; at 360 the header does not overflow (F-RWD-016).
- [ ] A member never sees Proposals; visiting `/knowledge/proposals` as a member shows Forbidden inside the shell, focus on the H1, and no redirect.
- [ ] As an admin, adding a proposal shows an Undo toast and opens the next proposal; there is no bulk add.
- [ ] The banned-terms lint finds no Gemini, pgvector, embedding, vector, chunk or RAG in the page's strings.
- [ ] Reload, Back and a pasted link restore search, filters, sort, page, the open source and its tab, and the test question and scope.
- [ ] Light and dark pass `check-contrast.mjs`; no text renders below 12 px at any width.

---

## 2. Billing (`/billing/*`) and the Top-up sheet

### 2.1 Purpose and jobs to be done

**Primary job:** *When my calls depend on a prepaid balance, I want to know how long it will last, add money in seconds with UPI, and never be surprised by a pause, so calls keep flowing.* The user is the buyer or ops lead (01-product-understanding part 1, persona 1), often on a phone.

**Secondary jobs:** see what calls and meetings cost and where the money went (Usage, Transactions); set up autopay once and trust it; download GST invoices for accounts; compare meeting-minute plans.

**Not this page's job:** allocating an inbound number (Settings › Phone setup; Analytics' "Allocate a number from billing" is corrected there, F-UX-015, EXPLORE-DATA-21), or per-call cost analysis (Call reports' Cost column; Usage links to it).

### 2.2 Findings addressed and what changes

| Finding | Today | Change |
|---|---|---|
| F-UX-002, F-QA-004 (high) | Banner "Top up" and "Enable autopay" open Settings › Profile, even from /billing | Every Top up opens the Top-up sheet in place (`?topup=1`); legacy hashes redirect (§0.3); CI link check |
| F-UX-021 (medium) | No rate, usage, invoices or GST; "use Pricing" contradiction; four competing blue buttons; placeholder-only amount fields; 0, −50 and 9,999,999 accepted; autopay status shown twice; meeting plans in Settings | Five route tabs; one primary ("Top up"); CurrencyInput with visible bounds, validation on blur and no silent rewrite; one autopay StatusTag; Plans tab absorbs Meetings Billing with fixed PAYG copy |
| F-UX-011 (high), F-QA-006 | 158 min used vs ₹0 and 0 transactions; two legs per test call | Usage counts calls, not legs, test calls separate; the ledger reconciles top-ups and charges with balance-after |
| F-QA-011 (high) | Public docs say per-second billing and also "round up to whole minutes" | Plans › Your rates states the unit and rounding the backend actually applies (BL1); one sentence reused on /pricing and docs (open question 1) |
| F-QA-021 (medium) | Top-up accepts any number | `inr(min, max)` schema; Pay disabled only for outside reasons, field errors on submit (C §8.2 V6) |
| F-UX-028, F-A11Y-015, F-RWD-013, F-QA-036 | 42 px assertive banner on every page including Billing, 3 s late, 4 lines at 320 | No banner on Billing; the balance card carries low and empty states; the WalletNotice ladder elsewhere (O §10.2) |
| F-A11Y-009 (high) | Black on blue at 3.27–3.83:1 | Button primary with `--on-accent` (7.68 / 6.21:1) |
| F-A11Y-016, F-A11Y-020 | Preset chips without state; labels by placeholder | Presets are a radiogroup; every field has a Field label |
| F-UX-030 | "Auto top-up amount ₹0.00" flash while loading | Skeletons; money is never rendered before it is known |
| F-VIS-001, F-VIS-005 | "BILLING" in caps, mono body, blue mono labels | PageHeader "Billing", Hanken, sentence case |
| F-RWD-005 | Rail hides Billing at laptop heights | Shell short mode (N §1.2); Billing also reachable from the Baseline wallet segment and ⌘K ("wallet", "recharge", "UPI" keywords) |

### 2.3 Information hierarchy (Wallet tab, the default)

1. **First: balance and runway.** "₹2,340.50" at `num-28` with "About 16 h of phone calls at ₹0.04/s" directly under it. The runway answers the real question (how long until calls stop); the balance proves it.
2. **Second: Top up.** The page's only filled button, at the right of the header; then the autopay state in the card beside the balance (the way to stop thinking about top-ups).
3. **Third: Transactions.** Where the money went, with balance-after on every row.

Usage, Plans, Invoices and Autopay are one click away as route tabs; nothing from them repeats on Wallet except a one-line "Spent ₹1,284.60 this month · See usage".

### 2.4 Information architecture and entry points

**Route tabs** (`RouteTabs label="Billing sections"`, N §3): **Wallet** · **Usage** · **Plans** · **Invoices** · **Autopay**. The Autopay tab carries a 12 px `alert-triangle` in `--warning-text` with the hidden word "needs attention" when autopay is Paused or Needs renewal. The shell nav badge on Billing ("Low", "Blocked", N §1.5) is the only other place a billing state reaches the chrome besides the Baseline.

**Every way into money, and where it lands:**

| Entry point | Target |
|---|---|
| Baseline wallet segment `Wallet ₹2,340.50 · about 16 h of calls` (D §6.1) | `/billing/wallet` |
| Baseline low or blocked segment's "Top up" link · wallet chip in the low state (tablet, phone, Flow Designer) | Top-up sheet in place (`?topup=1`) |
| WalletNotice "Top up" (Cockpit, Leads, Flows, Rep console, Personal agents; O §10.2) | Top-up sheet in place |
| Disabled Call action reason "Wallet is ₹0. **Top up** to place calls." (C §1.6) | Top-up sheet in place; on success, focus returns to the call control, now enabled, with "You can place the call now." |
| WalletNotice "Turn on autopay" · autopay-failed "Fix autopay" | `/billing/autopay` |
| ⌘K "Top up…" / "Billing" / "Autopay" | Sheet / Wallet / Autopay |
| Billing header "Top up" | Sheet over the current Billing tab |

### 2.5 Wallet tab layout

**Desktop ≥1440** (content 1208; overview container `--size-container-page` 1280, so fluid here; cards on the 12-column grid 7 + 5).

```
┌ Sidebar ┬─ Billing   Prepaid wallet · last top-up 21 Sep 2026 ··························· [Top up] ┐ 56
│ Account ├─ Wallet  Usage  Plans  Invoices  Autopay ─────────────────────────────────────────────────┤ 40
│▸Billing │ ┌ Wallet balance ⓘ ─────────────────────────────┐ ┌ Autopay ·················· [Off] ┐   │
│         │ │ ₹2,340.50                                      │ │ Top up automatically when your   │   │
│         │ │ About 16 h of phone calls at ₹0.04/s           │ │ balance runs low, so calls never │   │
│         │ │ Spent ₹1,284.60 this month · See usage         │ │ pause.        [Set up autopay…]  │   │
│         │ └────────────────────────────────────────────────┘ └──────────────────────────────────┘   │
│         │ Transactions  Last 30 days · 64 transactions   [📅 Last 30 days ▾] [≡ Filter] [Export CSV] │
│         │ ┌ When ↓        Description                         Amount   Balance after  Status   Ref ┐ │
│         │ │ Today         Call charges · 38 calls · 1h 12m    −₹172.80    ₹2,340.50  ✓ Completed … │ │
│         │ │ Yesterday     Meeting charges · 2 meetings        −₹98.40     ₹2,513.30  ✓ Completed … │ │
│         │ │ 21 Sep 2026   Top-up via UPI                     +₹500.00    ₹2,611.70  ✓ Completed … │ │
│         │ └ 1–25 of 64 transactions            Rows per page 25 ▾   Page 1 of 3   ‹  › ───────────┘ │
├─────────┴─────────────────────────────────────────────────────────────────────────────────────────┤
│ Baseline                                                                                            │ 28
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Laptop 1280–1439:** identical, cards 7 + 5. **1024–1279** (rail): cards 6 + 6; transactions P1–P2 (When, Description, Amount, Balance after, Status). **Tablet 768–1023:** the TopBar carries the H1 and the wallet chip; the header row keeps meta and **Top up**; route tabs scroll with an edge fade; the balance card is full width and the autopay card sits below it; the table shows P1 with the key column pinned. **Phone 320–767:** one column in the same order; transactions become ListRows.

```
┌ Billing              [₹2,340][⌕] ┐ 52
│ Last top-up 21 Sep     [Top up]  │ 48
│ Wallet Usage Plans Invoices Aut→ │ 40 (scrolls)
│ ┌ Wallet balance ──────────────┐ │
│ │ ₹2,340.50                    │ │ num-28 kept on phones
│ │ About 16 h of phone calls    │ │
│ │ at ₹0.04/s                   │ │
│ │ Spent ₹1,284.60 this month   │ │
│ └──────────────────────────────┘ │
│ ┌ Autopay ──────────────── Off ┐ │
│ │ Top up automatically…        │ │
│ │ [ Set up autopay…          ] │ │ full width, 44
│ └──────────────────────────────┘ │
│ Transactions            [Filter] │
│ Call charges · 38 calls −₹172.80 │ ListRow line 1 (amount trailing)
│ Today · Completed · ₹2,340.50    │ line 2: when · status · balance after
│ Top-up via UPI         +₹500.00  │
│ 21 Sep · Completed · ₹2,611.70   │
│ 1–25 of 64                ‹  ›   │
├──────────────────────────────────┤
│ BottomBar · More current         │ 56
└──────────────────────────────────┘
```

### 2.6 Wallet components and configuration

| Region | Component | Configuration |
|---|---|---|
| Header | `PageHeader` `variant="page"` (N §2), shared by all tabs | `navId="billing"`; meta "Prepaid wallet · last top-up 21 Sep 2026" (or "No top-ups yet"); primary **Top up** (`wallet` icon), `aria-disabled` with reason when offline or not permitted |
| Tabs | `RouteTabs` | §2.4 |
| Balance | `Card` plain (N §4) | Label `label-13` `--text-2` "Wallet balance" + info Tooltip "Prepaid. Calls, meetings and API use are charged from this balance."; value `num-28` tabular, 2 decimals (`formatMoney`); runway `body-14` `--text-2` from `formatRunway` (§3); meta `meta-12` "Spent ₹1,284.60 this month · **See usage**" |
| Balance: low | `StatusText` md warning inside the card | "Low balance · about 17 min of calls left. Calls pause at ₹0." (threshold: O §21 Q1) |
| Balance: empty | `Notice` `tone="warning" scope="inline"` inside the card | "**Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. **Top up**" (a link to the same sheet) |
| Autopay summary | `Card` plain + `StatusTag` (domain `autopay`, N §5.3) | Off: sentence + secondary "Set up autopay…" (→ `/billing/autopay`). On: "When below ₹200, add ₹500 · UPI a•••••@okaxis · **Manage**". Paused: "Couldn't top up on 24 Sep. The bank declined the debit." + secondary "Fix autopay…". Needs renewal: "Mandate ends 30 Sep." + secondary "Renew mandate…" |
| Transactions | Section heading `title-16` + `DateRangePicker` (C §7.1, presets This month · Last month · Last 30 days · This financial year · Custom) + `FilterBar` field Kind (Top-up, Autopay top-up, Call charges, Meeting charges, API charges, Refund, Adjustment) + tertiary "Export CSV" | `DataTable id="wallet-ledger" frame="framed"`, pager 25 · 50 · 100 |
| Ledger columns | When (P1, date for daily roll-ups, time for payments) · Description (P1, key link) · Amount (P1, right, tabular, "+₹500.00" / "−₹172.80" with a real minus, never coloured: the sign carries the direction, P2) · Balance after (P2, right) · Status (P2, `StatusTag` domain `payment`) · Reference (P3, `mono-12`) · Method (P4, "UPI · a•••••@okaxis") | Call and meeting charges are **daily roll-ups** (BL6), so 400 calls do not bury the top-ups |
| Transaction sheet | `Sheet variant="record"` + `KeyValueList` | Top-up: Wallet credit · Tax · Total charged · Method · UPI reference (mono, Copy) · Status · Started / Confirmed · Invoice "INV-2026-0142 · Download PDF". Roll-up: charge by product, "Open these calls in Call reports" (`/call-reports?range=<day>&columns=+cost`) |

UPI IDs are personal data: they are masked everywhere (first character, bullets, the handle: "a•••••@okaxis") and never placed in URLs or analytics.

### 2.7 Top-up sheet (`TopUpSheet`, new composition §3; `Sheet variant="gate"` 640, modal)

Mounted once in the AppShell and opened by `?topup=1` on any route (B2). It is a **money gate** (tier 4, O §3.1; `spec/02-components-gate.md` §5.6): the server quote is its consequence line and "Pay ₹590 via UPI" its one confirming action; this section configures the steps and copy.

**Step 1 · Amount**

```
┌ Top up wallet ················································· [×] ┐
│ Balance ₹42.10 · about 17 min of calls                                │
├───────────────────────────────────────────────────────────────────────┤
│ Top-up amount                                                         │
│ [ ₹100 ][▣ ₹500 ][ ₹1,000 ]   [₹ 500                         ]         │
│ Minimum ₹100 · maximum ₹1,00,000                                       │
│ Adds about 3 h 25 min of phone calls at ₹0.04/s.                      │
│                                                                       │
│ Wallet credit                                         ₹500.00         │
│ GST (18%)                                              ₹90.00         │
│ You pay                                               ₹590.00         │
│ New balance                     ₹542.10 · about 3 h 45 min of calls   │
│                                                                       │
│ Pay with any UPI app. Money is added when your UPI app confirms.      │
├───────────────────────────────────────────────────────────────────────┤
│ Autopay is off · Set up autopay               [Cancel] [Pay ₹590 via UPI] │
└───────────────────────────────────────────────────────────────────────┘
```

- `CurrencyInput` (C §4.2) `size="lg"`, label "Top-up amount", presets ₹100 · ₹500 · ₹1,000 (a radiogroup; ₹500 preselected, or `?amount=`), bounds and tax from the quote (BL3). Validation on blur and submit: "Enter an amount from ₹100 to ₹1,00,000." Never clamped (F-QA-021).
- Summary `KeyValueList` (rows variant, tabular, right-aligned values) comes from the server quote, so the client never computes tax. **The tax row renders only if the quote has one** (whether GST is added on top or included is open question 2).
- Runway lines are `aria-live="polite"`, throttled to 2 s (C §4.2).
- Footer: why-text "Autopay is off · **Set up autopay**" (only when autopay is off and the runway is under a day) · Cancel (tertiary) · primary **Pay ₹590 via UPI** (names the amount charged; "Pay via UPI" while the amount is invalid). Enter in the amount field = Pay. An idempotency key is created when the sheet opens (C §8.2 V11).

**Step 2 · Pay** (the body is replaced; header and a "Change amount" back link stay; uses **UpiPayment**, new §3)

```
┌ Top up wallet ················································· [×] ┐
│ ‹ Change amount                                                       │
│ Pay ₹590.00 with any UPI app                                          │
│ ┌────────────┐  1  Open any UPI app on your phone                     │
│ │  QR code   │  2  Scan this code                                     │
│ │  200 × 200 │  3  Approve ₹590.00 with your UPI PIN                  │
│ └────────────┘  Waiting for payment · 04:32 left                      │
│ ───────────────────────────── or ──────────────────────────────       │
│ UPI ID  [name@bank…                        ]  [Send request]          │
├───────────────────────────────────────────────────────────────────────┤
│ Keep this open, or close it: we'll add the money when UPI confirms.   │
│                                                     [Cancel payment]  │
└───────────────────────────────────────────────────────────────────────┘
```

- **Fine pointer / ≥768:** QR first (server-generated UPI intent string rendered as a QR, `role="img"` "UPI QR code to pay ₹590.00 to Vaani Labs"), then "Pay using UPI ID" (TextInput, validated "Enter a UPI ID, like name@bank.") where the provider supports collect requests.
- **Phone / coarse pointer:** primary full-width **Open UPI app** (the intent link), then "Pay using UPI ID", then a link "Show QR code" for paying from another phone. iOS app-switching is open question 3.
- The countdown is a `Timecode` in `meta-12` with tabular figures (a timer, F §2.3; Hanken, not mono), not announced except once at 1 minute left.
- **Hosted-checkout fallback** (BL4 interim): the body reads "Complete the payment in the payment window. Keep this tab open." Every result state below is unchanged.

**Result states** (all driven by the payment status from the server; "not charged" is claimed only when the server confirms it, O §16.2):

| State | Body | Footer |
|---|---|---|
| Preparing | Spinner md + "Preparing your payment…" | Cancel |
| Waiting | As drawn; request sent to a UPI ID: "Approve the request in the UPI app for a•••••@okaxis." | Cancel payment |
| Confirming | "Payment received. Adding it to your wallet…" | (none, Esc disabled briefly) |
| **Success** | `check` in `--success-text` + `title-16` "₹500 added" + "New balance ₹542.10 · about 3 h 45 min of calls" + KeyValueList: Amount paid ₹590.00 · UPI reference (mono, Copy) · Invoice INV-2026-0142 | Download invoice (tertiary) · **Done** (primary) |
| Declined | danger Notice "**UPI payment didn't complete.** You were not charged." + the bank's reason when given ("Declined by your bank", "Incorrect UPI PIN") | Change amount · **Try again** |
| Expired | neutral Notice "This payment request expired. Nothing was charged." | **Create a new request** |
| No answer yet | warning Notice "We haven't heard back from UPI yet. If money left your account, it will be added here or returned by your bank." · **Check status** | Close |
| Closed while waiting | The order continues on the server. The app shows **Payment pending** (info WalletNotice on money pages, O §10.2; info page Notice on Billing; a Pending ledger row) until the final state, then the toast "₹500 added. Wallet ₹542.10 · about 3 h 45 min of calls." | – |

The success toast is suppressed when the sheet itself showed Success (no double report); toasts that arrive while the sheet is open queue until it closes (O §1.6).

### 2.8 Autopay tab (`/billing/autopay`)

A form page in the `--size-container-form` (720) column. Setting up or renewing a mandate is a tier-4 gate: the page collects the rule, and the **Autopay gate sheet** (a money gate, G §5.6: gate 640, the same UpiPayment component in `mode="mandate"`) collects the one-time approval.

**Off** (and never set up):
- `title-16` "Autopay" + `StatusTag` Off. Body: "Top up automatically when your balance runs low, so calls never pause. You approve a UPI Autopay mandate once, in your UPI app."
- Field "Top up when the balance falls below" (CurrencyInput; default about 24 h of the workspace's median daily spend, rounded to ₹100, minimum ₹100). Hint: "About 5 h of calls. Your bank notifies you before each automatic debit, so money can take up to a day to arrive." (pre-debit timing: open question 4).
- Field "Amount to add" (CurrencyInput, presets ₹500 · ₹1,000 · ₹2,000). Hint: "Adds about 3 h 25 min of calls each time."
- Field "Monthly limit (optional)" (CurrencyInput). Hint: "Autopay stops for the rest of the month after this." Error: "Set a limit of at least ₹500, the amount added each time."
- Summary (inline `Notice` neutral): "When your wallet falls below ₹200, we add ₹500 from your UPI account, at most ₹2,500 a month."
- Primary **Review and approve…** → Autopay gate sheet: the summary as a KeyValueList (Trigger · Amount · Monthly limit · Mandate valid until · Largest single debit) + UpiPayment "Approve once with your UPI PIN". States: waiting for approval (countdown) · approved → the page shows **On** and a toast "Autopay is on. We'll add ₹500 when your wallet falls below ₹200." · declined · expired (same copy pattern as §2.7).

**On:** `StatusTag` On + `KeyValueList` rows: Rule "When below ₹200, add ₹500" · Monthly limit "₹2,500 · ₹500 used in September" with a ProgressBar · UPI account "a•••••@okaxis" · Mandate valid until "26 Sep 2027" · Last automatic top-up "21 Sep 2026 · ₹500 · Completed". Actions: secondary **Edit rule…** (Dialog md; raising the amount above the mandate's limit says "You'll approve the new amount in your UPI app" and routes through the gate) · tertiary **Turn off autopay…** at the end of the page, after a hairline (ConfirmDialog tier 2: "Turn off autopay? We'll cancel the UPI mandate. Calls pause when your wallet reaches ₹0 unless you top up." · Cancel · **Turn off autopay**).

**Paused** (a debit failed): page `Notice` danger, `role="status"`: "**Autopay couldn't top up on 24 Sep.** Your bank declined the debit (insufficient balance). Calls pause at ₹0." Actions, inside the Notice (O §10.1: one small secondary button plus one link): **Retry ₹500 now** (uses the approved mandate; the button names the amount) · link "Top up manually". The page's one primary stays "Top up" in the header. If the mandate itself was revoked, the action is **Set up again…**.

**Needs mandate renewal:** page `Notice` warning: "**Your autopay mandate ends on 30 Sep.** Renew it to keep automatic top-ups." Action inside the Notice: small secondary **Renew mandate…** (gate sheet, `mode="mandate"`).

**Cancelled outside Vaani** (from the UPI app): state Off with a neutral Notice "Autopay was cancelled from your UPI app on 22 Sep. Set it up again to resume automatic top-ups."

---

### 2.9 Usage tab (`/billing/usage`)

**Job:** see what the money bought and whether spend matches the calls. It shares the metrics layer with Call reports and Analytics (`lib/metrics.ts`, `03-pages/04` §1.1), so a call count here equals the count there for the same range.

- **Range:** one `DateRangePicker` under the tabs (`?range=`; presets This month (default) · Last month · Last 30 days · This financial year · Custom). A scope line in `meta-12` `--text-3` states the counting rule: "1–27 Sep 2026 · calls, not legs · test calls shown separately".
- **StatGrid** (N §4.8), four `StatTile`s, each with a definition tooltip and a delta against the same days of the previous period (`deltaTone`, N §4.7):

| Tile | Example | Scope line | Delta tone |
|---|---|---|---|
| Spend | ₹1,284.60 | "Wallet charges · this month" | neutral (spend is neither good nor bad) |
| Calls | 412 | "Calls, not legs · test calls excluded" | up is good |
| Phone call time | 7h 30m | "Billed talk time" | neutral |
| Average cost per call | ₹2.62 | "Median ₹2.40" | neutral |

- **Chart:** `ChartFrame` "Spend per day", meta "This month · wallet charges by product", `StackedBarChart` in the categorical palette in fixed order: Phone calls `--chart-1` · Meeting agent `--chart-2` · Meetings `--chart-3` · API text voice `--chart-4` (N §11.5); legend with totals; "View as table". Never state colours for series.
- **By product** (`DataTable frame="framed"`, no pager, a total row):

| Product | Rate | Used | Free allowance | Charged |
|---|---|---|---|---|
| Phone calls (voice agent) | ₹0.04/s | 412 calls · 7h 30m | – | ₹1,080.00 |
| Meeting agent | ₹0.08/s | 3 meetings · 25m | – | ₹120.00 |
| Meetings | ₹0.01/s after free minutes | 1 meeting · 29m | 29 of 30 free min used | ₹0.00 |
| API text voice | ₹0.04/s | 35m 15s | – | ₹84.60 |
| Browser test calls `Tag outline "Test calls"` | as billed (BL7) | 41 tests · 38m (2 legs counted once) | – | from the server |
| **Total** | | | | **₹1,284.60** |

  Rates in this spec are examples taken from the public API docs (4 / 8 / 1 paise per second); the rates endpoint is the only source in the product (BL1). Footnote: "Browser test calls are stored as two legs and counted once here." Link: "See cost per call in Call reports" (`/call-reports?range=<same>&columns=+cost&sort=cost:desc`).
- **Reconciliation rule** (fixes F-UX-011): for any range, Spend = the sum of charge rows in the Wallet ledger = the By product total. A CI data test asserts it on seeded accounts.

### 2.10 Plans tab (`/billing/plans`)

Absorbs Settings › Meetings Billing (F-UX-021); `/settings#meetings-billing` redirects here.

**Your rates** (`title-16`; meta "Prepaid · charged from your wallet"): a framed `DataTable` without pager: Product · Rate · Per minute · Billing unit. The Billing unit column states exactly what the backend does, "Per second" or "Per minute, rounded up" (F-QA-011); the same sentence is reused by `/pricing` and `/docs/api/billing` (open question 1). A row for inbound number rental appears only if a rental exists (open question 7).

**Meeting minutes plan** (`title-16`):
- Current plan `Card`: "Pay as you go" `title-14` + `Tag outline "Current plan"`; `ProgressBar` labelled "Free minutes this month", value "1 of 30 used"; meta "Resets 1 Oct 2026".
- Plan comparison: four **PlanCards** (a `Card` recipe, §3) in a grid `repeat(auto-fit, minmax(calc(var(--space-40) * 6), 1fr))`, gap `--space-group-gap`; 4 across at ≥1280, 2 × 2 at 768–1279, stacked below 768 (fixes 132 px cards with wrapped prices).

| PlanCard part | Spec |
|---|---|
| Name | `title-16` ("Starter") |
| For whom | `body-14` `--text-2`, one full sentence, never truncated ("For solo founders running a few demos a week.") |
| Price | `num-20` "₹499" + `body-14` `--text-3` "/ month", one line, `white-space: nowrap` (never "₹499/ / mo") |
| Included | `data-13`: "10 h of meetings included, then ₹2.40/min" |
| Points | up to 3 lines, `data-13` with `check` 12; no vendor names ("Reserved capacity", not "Reserved LiveKit capacity") |
| Action | Current plan: `Tag outline "Current plan"`, no button. Others: secondary **Switch to Starter…** (one per card; no Neel here, the page keeps "Top up" as its only primary) |
| Pay as you go | "₹0 / month" · "30 free minutes each month, then ₹2.40/min" (replaces "Free / Unlimited included / then ₹2.40/min") |

**Plan change sheet** (`Sheet variant="gate"`, a money gate, G §5.6): title "Switch to Starter"; KeyValueList: New plan · Price "₹499 / month" (+ tax row if the quote has one) · Starts "Today, 27 Sep" · Charged "₹499 from your wallet today" (charge source and proration: open question 5) · Included "10 h of meetings each month, then ₹2.40/min". If the wallet cannot cover it, the primary is `aria-disabled` with "Wallet is ₹42.10. Top up at least ₹457 to switch." and a **Top up** link. Primary label names the money: **Pay ₹499 and switch**. A downgrade says when it takes effect: "Starter stays active until 26 Oct. Pay as you go starts then." · **Switch at the end of the period**.

**Enterprise:** one line after the plans: "Need higher volumes or a custom rate? **Talk to sales**" (same tab).

### 2.11 Invoices tab (`/billing/invoices`)

- **Billed to** (`Card` plain, compact `KeyValueList`): Legal name "Sample Realty Pvt Ltd" · GSTIN · State (place of supply) · Address; secondary sm **Edit billing details…** → `Dialog` md: Legal name (required) · GSTIN (optional; "Enter a 15-character GSTIN, like 27ABCDE1234F1Z5.") · Address · City · State (Select) · PIN code (6 digits: "Enter a 6-digit PIN code.") · Email for invoices (optional). Hint on the dialog: "Changes apply to invoices issued from now on." With no GSTIN: inline info Notice "Add your GSTIN to claim input tax credit on your invoices. **Add GSTIN**".
- **Toolbar:** `Select` "Financial year" (FY 2026–27 default, April to March, IST) · tertiary **Download all (ZIP)** with the sentence "12 PDF invoices for FY 2026–27" (states contents, like Data Export does).
- **Table** (`DataTable frame="framed"`, pager 25): Invoice (key, id in `mono-12`, "INV-2026-0142") · Date · For ("Top-up", "Autopay top-up", "Starter plan · Oct 2026") · Taxable value · GST · Total (numeric columns right-aligned, tabular) · Status (`StatusTag` domain `invoice`: Paid · Refunded · Credit note) · actions: inline tertiary sm **Download** (`download` icon; name "Download invoice INV-2026-0142") and ⋯ (Copy invoice number · Email to accounts…).
- **Invoice sheet** (`record`): the same facts as a KeyValueList, the related transaction link, and **Download PDF** (secondary) in the footer.
- **Empty:** "Invoices appear here after your first top-up." · **Top up** (O §15.3).
- **No permission:** "Only admins can see invoices. Ask Anika R. for access." (N §7.12).

### 2.12 Billing states (all tabs)

| State | Wallet | Top-up sheet | Usage · Plans · Invoices | Autopay |
|---|---|---|---|---|
| **First use** (₹0, never topped up) | Balance ₹0.00 with the empty Notice; Transactions EmptyState first-use "Top-ups and charges appear here with the balance after each one." (no action: the header has Top up); autopay card Off | Normal; balance line "Balance ₹0.00" | Usage: not-yet EmptyState "Usage appears here after your first call." · Invoices: first-use | Off form |
| **Loading** | `num-28` skeleton for the balance and a bar for the runway; never "₹0.00" before it is known (F-UX-030); TableSkeleton | Balance line skeleton; the Pay button shows "Pay via UPI" until the quote returns | KpiSkeleton, ChartSkeleton, TableSkeleton | FormSkeleton |
| **Partial** | No rates: runway hidden, "Rate ₹0.04/s" shown (D §8 interim) · no balance-after: column hidden | No tax in the quote: tax row hidden | No usage aggregates: Usage shows rates only with the not-yet state | Only Inactive/Active known: Off/On only |
| **Error** | SectionError in the card ("Couldn't load your balance · Retry", value "–"); table error Notice | InlineError under the amount "Couldn't get a price for this amount. **Retry**"; Pay `aria-disabled` with that reason | SectionError per card; table Notice | PageError with Retry |
| **Offline** | ConnectionBar; balance meta "as of 11:42 am"; **Top up** `aria-disabled`, reason "You're offline" | A waiting payment keeps its countdown and says "You're offline. We'll check the payment when you reconnect." | Stale data kept with "Showing data from 11:42 am" | Buttons `aria-disabled` "You're offline" |
| **Permission** (BL9) | Top up `aria-disabled`, "Only admins can add money. Ask Anika R." | Not reachable | Invoices: no-permission state | "Only admins can change autopay. Ask Anika R."; the state is still visible read-only |
| **Payment pending** | Page Notice info: "**Payment pending.** ₹590.00 started at 10:42 am. Your wallet updates when UPI confirms. **Check status**"; a Pending ledger row | Waiting / No answer yet (§2.7) | – | Waiting for approval (mandate) |
| **Low** | Card StatusText warning; Baseline segment amber; nav badge "Low" | Balance line in `--warning-text` with its word ("Low") | – | Suggests turning on autopay (Off state only) |
| **Empty (₹0)** | Card Notice warning; Baseline "Blocked"; call actions elsewhere carry the reason | – | – | – |
| **Autopay failed** | Page Notice danger "**Autopay couldn't top up on 24 Sep.** … **Fix autopay**" + card Paused | – | – | Paused state (§2.8) |
| **Success** | New ledger row at the top, balance and runway update in place; polite announcement "₹500 added. Wallet ₹542.10." | Success state (§2.7), else the toast after confirmation | Invoice row appears | On state + toast |

---

### 2.13 Interactions and keyboard (Billing)

| Key | Where | Does |
|---|---|---|
| `⌘/Ctrl+K`, then "Top up…" (keywords: wallet, recharge, UPI, balance) | Anywhere | Opens the Top-up sheet in place |
| `Tab` / `Enter` | Route tabs | They are links: Tab moves, Enter follows |
| `←` `→` | Amount presets (radiogroup) | Move and select |
| `Enter` | Amount field | Pay → Step 2. Nothing is charged until the user approves in their UPI app with their PIN, so this is not a one-key charge |
| `Esc` | Top-up sheet | Closes. In Waiting, the order stays open on the server and the app shows Payment pending; **Cancel payment** is the explicit way to cancel it |
| `↑` `↓`, `J` `K`, `Enter` | Ledger and invoice tables | Move rows, open the record sheet (N §7.9) |
| `⌘/Ctrl+Enter` | Top-up sheet (Amount step), Plan change sheet, Autopay gate sheet | The gate chord (G §4.5, G6): activates the enabled primary. **Pay ₹590 via UPI** moves to the UPI step (nothing is charged before the PIN); **Pay ₹499 and switch** debits the wallet, which is why only the two-key chord, never a single key, does it. In the Autopay gate sheet and in the Top-up Waiting step there is no in-app primary (the approval is the UPI PIN), so the chord does nothing there |

Billing has no single-key shortcuts at all (P3: nothing that bills on a key). **Motion:** sheets slide over `--dur-slow` (fade only under reduced motion); balances and runways change in place without counting up (N §4.8); the QR countdown is a text change, not an animated ring.

### 2.14 Microcopy (before → after)

| Before (live today) | After |
|---|---|
| BILLING | Billing |
| WALLET BALANCE ₹0.00 · TRANSACTIONS 0 "All transaction history is shown below" | Wallet balance ₹0.00, with "Phone calls are paused…"; the count moves to the Transactions meta |
| UPI AUTOPAY · Auto-debit wallet top-up · "Enable once, and Razorpay UPI mandate automatically recharges your wallet." | Autopay · "Top up automatically when your balance runs low, so calls never pause. You approve a UPI Autopay mandate once, in your UPI app." |
| Enable UPI Auto-Debit (filled blue) | Set up autopay… (secondary) → Review and approve… |
| INACTIVE pill + "Status: INACTIVE" | One StatusTag: Off |
| Auto top-up ₹ (placeholder as the label) | Amount to add (label), ₹ prefix, hint with the runway it buys |
| MANUAL TOP-UP · Recharge wallet with UPI · "…For automatic mandate-based recharge, use Pricing." | Top up wallet (sheet) · "Pay with any UPI app. Money is added when your UPI app confirms." |
| ₹100 ₹500 ₹1000 (chips without state) | ₹100 · ₹500 · ₹1,000 (radiogroup, en-IN grouping) |
| Top-up ₹ (placeholder) | Top-up amount |
| Pay with UPI | Pay ₹590 via UPI |
| Billing history · "No transactions yet." | Transactions · "Top-ups and charges appear here with the balance after each one." |
| "Wallet empty — top up now to keep calls flowing." (every page, including Billing) | On Billing, the balance card: "Wallet is ₹0. Phone calls are paused. Browser tests and free meeting minutes still work." Elsewhere, the WalletNotice ladder (O §10.2) |
| Meetings Billing (Settings) · "Free · Unlimited included · then ₹2.40/min" | Billing › Plans · "₹0 / month · 30 free minutes each month, then ₹2.40/min" |
| "₹499/ / mo" (wrapped) | "₹499 / month" (one line) |
| Reserved LiveKit capacity | Reserved capacity |
| Recharge | Top up |
| Allocate a number from billing (Analytics) | Not in Billing: "Set up your inbound number in Phone setup" (owned by Analytics and Settings specs) |

### 2.15 Accessibility (Billing)

- **Top-up sheet:** `role="dialog"` `aria-modal`, labelled by its title; focus starts in the amount field (`data-autofocus`); Step 2 moves focus to its heading "Pay ₹590.00 with any UPI app" (`tabindex="-1"`); a result moves focus to the result heading; closing returns focus to the trigger, which may be a call control that is now enabled (O §1.3).
- **Amount:** presets are a `radiogroup` "Choose an amount"; the input's name includes the currency ("Top-up amount, in rupees"); the runway line is polite and throttled; errors are linked by `aria-describedby`.
- **UPI step:** the QR has a text alternative naming amount and payee; "Pay using UPI ID" and "Open UPI app" are full keyboard and screen-reader paths, so nobody depends on scanning; the countdown is not live except one announcement at 1 minute left and one at expiry.
- **Results:** Declined and No answer yet use `role="alert"` inside the sheet (a failure of the user's action); Success is polite.
- **Money in tables:** the Amount cell carries a hidden word ("Credit ₹500.00", "Debit ₹172.80"), so the minus sign is never the only signal; en-IN grouping is text, not CSS.
- **Balance:** the card's accessible name joins value and runway ("Wallet balance ₹2,340.50, about 16 hours of phone calls").
- **Autopay:** each state has a word and an icon; the page Notice for Paused uses `role="status"` (persistent condition, not an alert, F-A11Y-015).
- **Tabs, tables, sheets:** as N §3.5, N §7.14, O §4.5. Contrast from tokens only (F-A11Y-009 black-on-blue retired).
- **Touch:** presets 44 px, full-width equal columns on phones; sticky footer above `env(safe-area-inset-bottom)`; Dismiss and action targets at least `--space-8` apart (F-RWD-013).

### 2.16 Responsive summary (Billing)

| | ≥1440 | 1280–1439 | 1024–1279 | 768–1023 | 320–767 |
|---|---|---|---|---|---|
| Header | H1 · meta · Top up | same | same (rail) | TopBar title + wallet chip; row: meta · Top up | same; meta shortens to "Last top-up 21 Sep" |
| Route tabs | row | row | row | scrolls, edge fade | scrolls, edge fade, selected tab kept in view |
| Wallet cards | 7 + 5 columns | 7 + 5 | 6 + 6 | stacked | stacked |
| Ledger / invoices | P1–P3 | P1–P3 | P1–P2 | P1, key pinned | ListRow (amount trailing on line 1) |
| Record sheets | docked 440 | overlay | overlay | modal, full height | full screen, Back link |
| Top-up sheet | gate 640, right | same | same | full height, 100% width up to 640 | full screen, sticky footer, presets 3-up |
| UPI step | QR first | QR first | QR first | QR first on fine pointers; intent first on coarse | "Open UPI app" first |
| Usage | 4 tiles, chart 240 | 4 tiles, chart 240 | 4 tiles, chart 200 | 2 × 2 tiles, chart 200 | tiles scroll-snap (compact), chart 160 |
| Plans | 4 PlanCards across | 2 × 2 | 2 × 2 | 2 × 2 | stacked |
| Autopay form | 720 column | same | same | same | full width, sticky action bar |

### 2.17 Telemetry (optional)

UPI IDs, UTRs, GSTINs and names never enter analytics; amounts are bucketed.

| Event | Properties | Answers |
|---|---|---|
| `topup_sheet_opened` | entry (baseline · chip · notice · call_reason · palette · billing_header · autopay_card), wallet state (ok · low · empty) | Which entry points work (F-UX-002 regression watch) |
| `topup_amount_chosen` | preset or custom, amount bucket | Whether presets fit |
| `topup_validation_error` | code | Where people struggle |
| `upi_step_shown` | mode (qr · intent · collect · hosted) | Payment path mix |
| `payment_result` | state (captured · declined · expired · unknown), seconds to final | Payment reliability |
| `payment_pending_closed` | – | People leaving mid-payment |
| `autopay_setup` | step (started · approval_shown · approved · declined · expired) | Mandate funnel |
| `autopay_retry` / `autopay_failed_viewed` | – | Recovery |
| `invoice_downloaded` | bulk (bool) | Invoice use |
| `plan_switch` | from, to, result | Plan movement |
| `legacy_redirect_hit` | from (settings_wallet · settings_autopay · meetings_billing) | When the redirects can be removed |

**North-star measure for this area:** median time from a call blocked by the wallet to a confirmed top-up (target under 90 s), and the share of workspaces whose calls paused at ₹0 while autopay was off.

### 2.18 Acceptance criteria (Billing)

- [ ] No in-app link points at `/settings#wallet`, `/settings#autopay` or `/settings#meetings-billing`; each of those URLs redirects as §0.3 says; the CI hash-link check passes.
- [ ] From Cockpit, Leads, Flows, the Baseline, the low wallet chip and ⌘K, "Top up" opens the Top-up sheet over the current page (Playwright), and closing it returns focus to the trigger.
- [ ] `/billing` redirects to `/billing/wallet`; the five tabs are links with `aria-current` and survive reload and Back.
- [ ] At 1440×900 the Wallet tab shows exactly one filled Neel button (Top up) in every wallet state.
- [ ] The balance is never rendered as "₹0.00" while loading; a skeleton shows instead.
- [ ] Runway text follows `formatRunway` (§3) and names the rate it uses.
- [ ] Top-up amounts 0, −50, 5, 99, 1,00,001 and "abc" each show the right error on blur or submit and are never rewritten; "Rs 1,000" is read as 1000; typing 500 selects the ₹500 preset and typing 750 clears it.
- [ ] The Pay button names the amount charged; a tax row appears only when the quote has tax.
- [ ] Double-activating Pay creates one payment order (idempotency key, verified server-side).
- [ ] The balance changes only after the server confirms; closing the sheet mid-payment shows Payment pending on Billing and a toast on confirmation.
- [ ] "You were not charged" appears only when the payment status says so.
- [ ] Autopay shows one status (no duplicate "Status:" line); Off, Waiting for approval, On, Paused and Needs renewal each render with the copy in §2.8; Turn off asks for confirmation.
- [ ] Usage counts calls, not legs; test calls have their own row; the By product total equals the Spend tile and the sum of ledger charges for the same range.
- [ ] Plans: no price wraps between the number and its unit at 1024 or 375; the PAYG card reads "30 free minutes each month, then ₹2.40/min"; Settings no longer lists Meetings Billing.
- [ ] Invoices paginate and each row has a Download button whose name includes the invoice number; GSTIN and PIN code validate on blur; a member without access sees the no-permission state naming an admin.
- [ ] No WalletNotice renders on any Billing route (F-UX-028).
- [ ] At 375 the Top-up sheet is full screen with a sticky footer, presets are three equal 44 px columns, "Open UPI app" is the first action, and nothing scrolls sideways at 320.
- [ ] axe is clean on every tab and every sheet state, in both themes; `check-contrast.mjs` passes.

---

## 3. New components needed

Everything else on these pages is an existing component used by its spec name. Every size below is an existing token or a `calc()` of one. **One token (registered in 01-foundations §18, in `tokens.json` 1.1.0):** `--qr-fg` (= `--ink`) and `--qr-bg` (= `--graphite-0`), fixed in both themes, because a scannable code needs dark modules on a light quiet zone and must not invert in dark mode (found while rendering the mock).

| Component | Kind | Anatomy and rules | Props sketch |
|---|---|---|---|
| **TopUpSheet** | Composition (`components/billing/top-up-sheet.tsx`), mounted once in `AppShell` | `Sheet variant="gate"` + CurrencyInput + summary KeyValueList (rows) + UpiPayment. Steps: Amount → Pay → Result (§2.7). Opens from `?topup=1` (and `amount`), removes the params on close with `replaceState`, remembers its entry point for telemetry and for returning focus. One idempotency key per open sheet | `useTopUp().open({ entry, amount?, returnFocusTo? })`; `<TopUpSheet />` reads `useWalletState()`, `useTopUpQuote(amount)`, `usePaymentStatus(orderId)` |
| **UpiPayment** | Component (`components/billing/upi-payment.tsx`), `mode="payment" \| "mandate"` | Header line "Pay ₹590.00 with any UPI app" (or "Approve autopay with your UPI PIN"); **QrCode** (SVG from the server's UPI intent payload; modules in `--qr-fg` on `--qr-bg` in both themes, 4-module quiet zone, `calc(var(--space-40) * 5)` = 200 px, `role="img"`, forced colours `CanvasText` on `Canvas`); numbered steps; **Countdown** (`meta-12` tabular, "04:32 left", announced once at 1 min and at expiry); "Open UPI app" (intent link, primary on coarse pointers); "Pay using UPI ID" (TextInput + Send request, only when the provider supports collect); result states from §2.7. Status arrives by server-sent events, else polling every 3 s with backoff until expiry, then "No answer yet" | `{ mode, amountPaise, payeeName, qrPayload, intentUrl, supportsCollect, expiresAt, status, onSendCollect(vpa), onCancel(), onRetry(), onCheckStatus() }` |
| **RetrievalResult** | Component (`components/knowledge/retrieval-result.tsx`) | `<li>` grid `auto minmax(0,1fr)`: rank (`label-12` `--text-3`) · line 1: source name link (`data-13` 500) + location (`meta-12` `--text-3`) + Meter + match word (`meta-12` `--text-2`) · line 2: passage (`read-15`, `lang` set, clamped to 4 lines, "Show all"). Below-threshold results use `--text-2` for the passage and live under a Collapsible. Skeleton: three rows (O §13.2 transcript-like bars) | `{ rank, source: { id, name, href }, location?, score?, threshold?, strength: 'strong' \| 'good' \| 'weak' \| 'below', text, lang? }` |
| **Meter** | Primitive (`components/ui/meter.tsx`); promotes the DataTable meter cell (N §7.3) to a standalone mark | Four segments of `--space-8` × `--space-4`, gap `--space-2`, radius `--radius-2`; filled `--text-2`, empty `--surface-3` (a neutral magnitude, never Neel or a state colour); `role="img"` with an `aria-label` that states the word and value; `data-mark` for forced colours | `{ value: 0..4, label: string }` |
| **TablePreview** | Component (`components/ui/table-preview.tsx`), shared with Leads Import (the "Import mapping preview" C §7.2 references but no spec defines) | Dialog lg body: file line ("Unit inventory.csv · 200 rows · 6 columns"), column list with sample values and a role per column (Knowledge: include / name rows by; Leads: map to field, phone required), a 5-row preview (Knowledge: rendered as passages; Leads: as mapped records), per-row problems in `--danger-text` with the row number | `{ file, columns: { name, sample, role }[], rows, errors: { row, message }[], mode: 'knowledge' \| 'leads', onChange }` |
| **PlanCard** | Recipe on `Card` (N §4), not a new primitive | §2.10 table. Grid `repeat(auto-fit, minmax(calc(var(--space-40) * 6), 1fr))` | `{ plan, current: boolean, onSwitch() }` |
| **PageDropTarget** | Component + `useFileDrop` hook | An overlay over the content column while files are dragged over it: `--accent-soft` fill, 1 px `--accent-mark` inset border (solid, never dashed), `title-16` "Drop files to add them to Knowledge"; ignores drags that start inside the page; announces once; drop hands files to the Add dialog | `{ accept, onFiles, label }` |

**Library additions** (not components):

- `lib/format.ts` · `formatRunway(seconds)`: under 60 min → "about N min" (floored; under 1 min → "under a minute"); 1–10 h → "about H h M min", floored to 5 min, "0 min" dropped; 10–99 h → "about H h"; 100 h and more → floored to 10 h ("about 690 h"). It always pairs with the rate it used ("at ₹0.04/s"). Rounding down keeps the promise conservative (P1). The Baseline, WalletNotice, balance card and Top-up sheet all call it.
- `lib/format.ts` · `maskUpiId('anika.r@okaxis')` → "a•••••@okaxis" (first character, five bullets, handle). Never logged, never in a URL.
- `lib/status.ts` domain additions: `knowledge` + Uploading… · Reading… · Couldn't upload; `payment` (Completed · `check` · success; Pending · `clock` · info; Failed · `circle-x` · danger; Refunded · `undo-2` · neutral; Expired · `timer-off` · neutral (N §5.3 rule 4: Pending already uses `clock`)); `invoice` (Paid · `check` · success; Refunded · `undo-2` · neutral; Credit note · `file-minus` · outline); `proposal` (Pending · `clock` · info; Added · `check` · success; Dismissed · `x` · neutral); `autopay` + Waiting for approval · `clock` · info.
- `lib/knowledge.ts`: source type → Lucide icon and word; failure reason code → sentence and fix (§1.6).
- `lib/nav.ts`: Billing keywords for ⌘K ("wallet", "recharge", "UPI", "balance", "invoice", "GST").

## 4. Reconciliations with the component specs

| # | Where the specs differ | This spec's choice |
|---|---|---|
| R1 | N §1.6 says the low wallet chip links to `/billing?topup=1`; O §10.2 says Top up opens the sheet in place | In place: `?topup=1` on the current route (the user's task is on that page). `/billing?topup=1` still works by redirecting to `/billing/wallet?topup=1`. Proposed edit to N §1.6 |
| R2 | N §7.3: a status cell holds one StatusTag; D §6.6 and O §11.1 ask for a status sentence in the Knowledge column | The Knowledge Status column uses `StatusText` md (sentence with passage count); phones and sheets use `StatusTag` |
| R3 | F-UX-034 allowed a disabled "Admins only · Request access" entry | Hidden for members (N §0.7: roles hide, never disable) plus Forbidden for direct visits |
| R4 | F-UX-021 proposed four tabs with autopay inside Wallet; D §6.6 lists five | Five tabs (D wins); Wallet carries an autopay summary card that links to the Autopay tab |
| R5 | O §3.3 says there is no filled red anywhere; C §2.1 allows a solid destructive button only inside ConfirmDialog | This spec uses `ConfirmDialog tone="danger"` and inherits whichever treatment the component owners settle |
| R6 | O §3.1 lists "Top up" under tier 4 (Gate) without a Gate spec | **Resolved** by `spec/02-components-gate.md` §5.6: Top up, Plan change and Autopay are money gates (the quote is the consequence line, the primary names the amount charged, `⌘/Ctrl+Enter` confirms where an in-app primary exists) |

## 5. Open questions for the product owner

1. **Billing unit and rates.** Per second, or per minute rounded up (F-QA-011)? Meetings: ₹2.40/min (Meetings Billing) or 1 paisa/s (public docs)? One rates endpoint must feed the app, `/pricing` and the docs.
2. **GST on top-ups.** Added on top (₹500 credit, ₹590 charged) or included (₹590 paid, ₹500 credit)? Is the invoice issued at top-up or monthly on usage?
3. **UPI on iOS and collect requests.** iOS shows no app chooser for generic UPI links; use app-specific links or lead with the QR? Does the provider still support "Pay using UPI ID" collect requests for merchant payments?
4. **Autopay rules.** The pre-debit notice timing, the largest debit allowed without the payer re-authenticating, the mandate validity period, and whether threshold-triggered debits are supported, as the provider implements RBI's e-mandate rules. The Autopay copy (§2.8) depends on these.
5. **Plan changes.** Charged from the wallet or by UPI? Prorated? Downgrades at period end?
6. **Roles.** Proposed: members add and test knowledge and can top up; admins delete sources a flow uses, review proposals, manage autopay and see invoices. Confirm.
7. **Inbound number rental.** Is there a monthly charge? If so it belongs in Your rates and the ledger.
8. **Knowledge and flow versions.** Sources are live as soon as they are indexed (K4). Should a flow version pin its sources, so Publish covers knowledge changes? This spec assumes not, and says so in the UI.
9. **Limits.** File size, files per upload, text length, CSV rows, and whether web sources can crawl beyond one page.
10. **Low-balance threshold.** Runway under 60 min at the median rate (O §21 Q1)? Editable in Autopay?
11. **Refunds.** Are failed or dropped calls refunded (ledger "Refund" rows)? Is unused balance refundable?
12. **Payment processor name.** May receipts and invoices name the processor (a trust signal), as the one exception to the vendor-name rule (F-UX-016)? Proposed: invoices and the payment receipt only, never the sheet body.

## 6. Traceability

| Finding (severity) | Resolved in |
|---|---|
| F-UX-002, F-QA-004 (high) | §0 B2, §0.3 redirects, §2.4 entry points, §2.18 |
| F-UX-011 (high), F-QA-006 | §0 B5, §2.9 Usage and the reconciliation rule |
| F-QA-011 (high) | §2.10 Your rates billing unit, open question 1 |
| F-A11Y-003 (high) | §1.7 Dropzone and Fields, §1.15, §2.15 |
| F-A11Y-008, F-A11Y-009 (high) | Tokens only (§1.15, §2.15); Button primary label on Neel |
| F-UX-021 (medium) | §2.2, §2.6, §2.7, §2.10 |
| F-UX-033 (medium) | §0 K1–K3, §1.6, §1.7, §1.8 |
| F-UX-034, F-QA-018 (medium) | §0 K5, §1.10 |
| F-UX-016 (medium) | §1.11, §1.14, banned-terms lint |
| F-UX-019 (medium), EXPLORE-DATA-18, QA-B-26 | §1.9 errors under the field |
| F-UX-028, F-A11Y-015, F-RWD-013, F-QA-036 (medium / low) | §0 B6, §2.6 balance card states, no WalletNotice on Billing |
| F-RWD-016 (medium) | §1.4 tablet and phone, §1.6 pinned actions |
| F-QA-021, F-UX-025 (medium) | §2.7 CurrencyInput validation, §2.8 Autopay fields, §2.11 GSTIN and PIN |
| F-A11Y-016, F-A11Y-020 (medium) | Source type SegmentedControl, preset radiogroup, labelled fields |
| F-UX-030 (medium) | §1.12 and §2.12 loading rows |
| F-VIS-001, F-VIS-005, F-VIS-006, F-VIS-024, F-VIS-034 | PageHeader, Button, `formatWhen`, containers (§1.2, §2.2) |
| F-UX-035 (medium) | Delete in ⋯ with Undo or confirmation (§1.6) |
| F-UX-017, F-RWD-005 | One nav name; ⌘K keywords; Baseline entry (§2.4) |
| F-UX-015, EXPLORE-DATA-21 | Numbers are not Billing's job (§2.1, §2.14) |
| F-UX-043 | No em dashes in any string above |

## 7. What the reference mock verified

`05-knowledge-billing.html` was rendered at 1440 × 900 (light and dark) and at a 375 × 812 touch viewport. Findings that changed this spec:

- **Knowledge table width.** With the Test panel docked at 1440, the table gets exactly 768 px. An inline "Replace file…" on a failed row overflowed it, so failed rows carry their fix as the first ⋯ item and in the sheet's Notice (§1.6). "Used by" shows a flow count, not "All-source lookups", to keep the column short.
- **QR code in dark mode.** A code drawn in `--text` on `--surface` inverts in dark and stops being reliably scannable, hence the fixed `--qr-fg` / `--qr-bg` request (§3).
- **Notice actions.** The Autopay Paused and renewal actions are small secondary buttons inside their Notices (O §10.1), so the Billing header's "Top up" stays the only filled button (§2.8).
- **Phones.** Touch density applies (48 px rows, 44 px controls, 16 px field text); nothing scrolls sideways at 375 or 320; presets fit as three equal 44 px columns; the Knowledge ListRow keeps the status tag and the failure reason visible.
- **Root font size.** The mock carries the `html { font-size: 100% }` workaround for the foundations defect (N §0.6); without it every size in this spec renders at 87.5 %.
