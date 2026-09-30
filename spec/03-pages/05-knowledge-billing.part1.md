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
