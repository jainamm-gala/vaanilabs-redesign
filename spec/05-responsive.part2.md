### 3.2 Five page archetypes

Every signed-in page is one of five archetypes. A page spec picks one and only describes its differences. Wireframes show the content region; shell chrome is §4.

**A. Data page** (Leads, Call reports, Knowledge, Flows, Meetings list, Billing › Invoices and ledger). Job: find a record and act on it.

```
Desktop ≥1440                                         Laptop 1024–1439
┌ header 56: H1 · meta ········ tertiary secondary [Primary]┐  ┌ same header; Columns icon-only <1280 ─┐
│ views 40: All 1,284 · New 312 · …                  │  │ views                                   │
│ toolbar 48: ⌕ search  Filter  [token][token] ·· 38 of … Columns Density │  │ toolbar: 2 tokens inline (<1280)       │
│ ┌ table P1–P3 ─────────────────┐┌ record sheet 440 ┐ │  │ table P1–P3 (≥1280) / P1–P2 (<1280)   │
│ │ sticky head 32               ││ docked, non-modal │ │  │        ┌ sheet overlays right third ┐ │
│ └──────────────────────────────┘└───────────────────┘ │  │        └ non-modal, no scrim ───────┘ │
│ pager 40 · BulkBar floats above it                  │  │ pager                                   │
└─────────────────────────────────────────────────────┘  └─────────────────────────────────────────┘
Tablet 768–1023                                       Phone 320–767
┌ meta ··············· ⋯ [Primary] ┐ (H1 in TopBar)   ┌ meta ····· ⋯ [New] ┐  scrolls away
│ views: scrolling row, edge fade  │                  │ ⌕ Search… (sticky)  │
│ ⌕ search ······ [Filter · 2]     │ tokens in popover │ Filter·2 tok tok →  │  ScrollRow
│ table: P1 + pinned key and ⋯,    │                  │ Title        Tag    │  ListRow 48+
│ horizontal scroll inside         │                  │ meta · meta   अ     │
│ pager                            │                  │ …                   │
│ sheet: modal, 100% height,       │                  │ pager (in flow)     │
│ min(560, 100%) wide              │                  │ sheet: full screen  │
└──────────────────────────────────┘                  └─────────────────────┘
```

**B. Overview page** (Home, Analytics, Billing › Wallet and Usage, Personal agents explainer). Job: understand a state, then take one action. Container `--size-container-page` 1280, centred.

```
Desktop / Laptop                       Tablet                         Phone
┌ header ····· [Primary] ┐            ┌ meta ··· ⋯ [Primary] ┐       ┌ meta ··· [Primary] ┐
│ [KPI][KPI][KPI][KPI]   │ 4 across   │ [KPI][KPI]           │ 2×2   │ [kpi][kpi][kp→     │ strip, snap
│ [chart     ][chart    ]│ 2 per row  │ [KPI][KPI]           │       │ [chart 160        ]│ 1 per row
│ [card      ][card     ]│            │ [chart 200          ]│ 1/row │ [card             ]│
└────────────────────────┘            └──────────────────────┘       └────────────────────┘
```

**C. Form page** (Settings pages, Billing › Autopay, Flow settings, Profile). Job: change a setting and know it saved. Column `--size-container-form` 720.

```
Desktop / Laptop                              Tablet                          Phone
┌ sub-nav 200 ┬ form column ≤720 ──────┐    ┌ ‹ Settings  Phone setup  ┐    Settings index (list) → page
│ Workspace   │ Section title          │    │ column centred, max 720  │    ┌ ‹ Settings  Phone setup ┐
│  Profile ▣  │ [field]  [field]  2-col│    │ [field]                  │    │ field (full width)      │
│ Calling …   │ [field]                │    │ [field]  (1 col <600)    │    │ field                   │
│             │ UnsavedChangesBar ────│    │ UnsavedChangesBar sticky │    │ [Discard] [Save changes]│ sticky bar
└─────────────┴────────────────────────┘    └──────────────────────────┘    └─────────────────────────┘
```

Two-column field rows exist only when both fields are short (≤ `--field-w-medium`) and the column is ≥600 px; otherwise one column. Labels sit above fields at every width (never beside them on phones).

**D. Workbench** (Cockpit, Assistant, Rep console, Flow Designer, a Meetings room). Job: do live, focused work in one place. Columns each scroll on their own at ≥1024; below 1024 the columns become panes (tabs or a segmented switch) or disclosures, never removed (F-RWD-002).

```
Desktop ≥1440                  Laptop 1024–1439            Tablet 768–1023               Phone
┌ list 240 ┬ card 400 ┬ rest ┐  ┌ card 400 ┬ rest ───┐     ┌ sticky context header ┐    ┌ sticky context ┐
│ switch   │ scrolls  │ log  │  │ list → header switch│    │ [Pane A | Pane B]     │    │ disclosure ›   │
│          │ footer ▬ │      │  │                     │    │ pane scrolls          │    │ main pane      │
└──────────┴──────────┴──────┘  └─────────────────────┘    │ sticky action bar     │    │ sticky 44 bar  │
                                                            └───────────────────────┘    └────────────────┘
```

**E. Record and detail sheets** (lead, call detail, knowledge source, webhook, task, Top up, Publish gate, step inspector). Modality and width follow O §1.7; the header (title, meta, Previous and Next, Copy link, `⋯`, Close) is identical at every width except that phones replace Close with a Back link ("‹ Call reports") at the left (O §4.6).

### 3.3 The scroll model

| Width | Model | Sticky elements (top to bottom) | Evidence |
|---|---|---|---|
| ≥1024 | The page body scrolls inside `main`; data regions (table body, transcript, canvas) may own their scroll when the archetype needs a fixed frame (Workbench, Data page table) | PageHeader, ViewTabs and toolbar with the table header on data pages; nothing else | F-RWD-012 (column header scrolled away) |
| 768–1023 | One scroller per pane; sheets full height | TopBar; the search row on data pages; the sticky action bar on workbenches | F-RWD-004 |
| <768 | **One page scroller.** Header row, summaries and KPIs scroll away | TopBar; the search row (data pages); the sticky action bar or composer; the BottomBar. At most **two** sticky bars besides the TopBar and BottomBar | F-RWD-004, F-RWD-015, RESPONSIVE-B-18 |

- `main` (or the page scroller) always has `overflow-x: clip` (not `hidden`, so sticky children keep working) as a safety net (F-RWD-006, -008, -019).
- Every scroll container that is not the page sets `overscroll-behavior: contain` so a fling inside a sheet or transcript does not scroll the page or trigger pull-to-refresh.
- Nested scrollers are allowed only for: a wide table's horizontal axis (≥768), the transcript in a Workbench at ≥768, the canvas, and a ScrollRow. A transcript or record body inside a 255 px box (F-RWD-004) or a 262 px demo box inside a page (F-RWD-018) is not allowed.
- `scroll-margin-top` on focusable content equals the height of the sticky stack above it, and `scroll-padding-bottom` equals the sticky bars below it, so focus and in-page links are never hidden (WCAG 2.4.11).

### 3.4 Chrome budget per breakpoint

Vertical chrome on a Data page in Standard density (Touch on phones and coarse-pointer tablets), with the work area that remains. **Every row is an inner viewport** (§2.1), not a screen size: an earlier version of this table subtracted chrome from 768 for a 1366×768 laptop, whose Chrome or Edge viewport is about 657 tall. Targets come from D §6.1 and shell `00` §3.5; Leads `03` §5.0 uses the same numbers (no summary band: the view's size is the toolbar count).

| Inner viewport | Screen it stands for | Chrome | Work area | Target |
|---|---|---|---|---|
| 1920×969 | 1920×1080 | header 56 + views 40 + toolbar 48 + head 32 + pager 40 + Baseline 28 = 244 | 725 → 18 rows at 40 | ≥14 rows |
| 1440×900 | the mocks' reference size | 244 | 656 → 16 rows | ≥14 rows |
| 1440×789 | 13″ MacBook | 244 (short mode, Baseline shown) | 545 → 13 rows | ≥10 rows |
| 1536×730 | 1920×1080 at 125 % | 244 (short mode, Baseline shown) | 486 → 12 rows | ≥10 rows |
| 1366×657 | **1366×768**, the reference office laptop | Compact: Baseline → BaselineChip, views → select: 56 + 48 + 32 + 40 = 176 | 481 → 12 rows | ≥10 rows |
| 1366×625 | the same with a bookmarks bar | 176 | 449 → 11 rows | ≥10 rows |
| 1280×609 | 1280×720 | 176 | 433 → 10 rows | ≥10 rows |
| 1024×690 | iPad landscape (Safari), Touch rows 48 | 176 (rail) | 514 → 10 rows at 48 | ≥8 rows |
| 768×950 | iPad portrait (Safari) | TopBar 52 + header row 48 + toolbar 48 + pager 40 = 188 | 762 → 15 rows at 48 | ≥12 rows |
| 390×750 | 390×844 iPhone, Safari toolbar collapsed | TopBar 52 + search 56 + BottomBar 56 + inset 34 = 198 while scrolled (header row and filter row scroll away) | 552 → 8 two-line rows at 62 | ≥8 rows (N §7.13) |
| 390×664 | the same, toolbar shown (no bottom inset under it) | 164 | 500 → 8 rows | ≥8 rows |
| 360×780 | 360×800 Android, Chrome's URL bar scrolled away | 164 (no home indicator on most Android) | 616 → 9 rows | ≥8 rows (F-RWD-011: 2 today) |
| 320×640 | 400 % of 1280 | 164 | 476 → 7 rows | ≥6 rows |
| 844×340 | 844×390 landscape iPhone, Safari | TopBar 52 only; header row in the TopBar (tiny class) | 288 → 4 rows | ≥4 rows (0 today, F-RWD-011) |

The mocks render phones at 390×844 and 360×780 and laptops at 1440×900; acceptance tests run at the inner sizes above (§17.1). No global banner is part of any budget (R10). A page Notice (one line, 40) is allowed when the page's main task is blocked; it scrolls away on phones.

---

## 4. Shell adaptation

The shell is fully specified in N §1 and shell `00` §3. This section fixes what **pages** must do so the shell works at every size, and restates the breakpoint behaviour in one table for traceability.

### 4.1 Shell per breakpoint (reference)

| | Desktop ≥1440 | Laptop-L 1280–1439 | Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Navigation | Sidebar 232, grouped, labelled | Sidebar 232 | Rail 56; `[` opens the sidebar as an overlay with a scrim | TopBar 52: ☰ · title · call chip · wallet chip · search; NavSheet 320 (max 85vw) | TopBar 52 + BottomBar 56 (Cockpit, Leads, Call reports, Flows, More) + MoreSheet |
| H1 | PageHeader (title-20) | PageHeader | PageHeader | TopBar title (title-16) | TopBar title |
| Workspace facts | Baseline 28 | Baseline | Baseline | TopBar chips; BaselineList in the NavSheet | TopBar chips; BaselineList in More |
| Setup track | Sidebar card | Sidebar card | Overlay only (dot on the expand button) | NavSheet | MoreSheet |
| Account, theme, sign out | Account menu | same | Avatar menu | NavSheet | MoreSheet (Sign out… last, confirmed) |
| Short height | Short mode ≤800 (fine pointer only); Baseline chip ≤720 | same | same | Tablet shell from <600 tall at any width | — |
| Flow Designer (focus mode) | Rail forced, no Baseline, Flow header 48 | same | same | Shell TopBar 52 (☰) stays; the 48 px Flow header sits under it (Review mode, §10.5) | Standard phone TopBar with a Back link; chip row; sticky Test · Publish bar; BottomBar stays |

![Shell at four widths](05-responsive-shell-1440.png) · `05-responsive-shell-1024.png` · `05-responsive-shell-768.png` · `05-responsive-shell-390.png`

### 4.2 What every page must do for the shell

1. **Reserve the bars.** Phone pages end with `padding-bottom: calc(var(--size-bottombar) + env(safe-area-inset-bottom) + var(--space-16))`; pages with a sticky action bar add its height. Nothing is ever hidden under the BottomBar (RESPONSIVE-B-20: the lead drawer's last 56 px were covered).
2. **Stay above or below it on purpose.** Full-screen sheets, dialogs and the MoreSheet sit at `--z-modal` above the BottomBar (`--z-chrome`) and hide it while open; toasts and the BulkBar sit above it (O §9.3, N §7.10).
3. **Hand the H1 to the TopBar below 1024.** The PageHeader keeps the meta and actions row; it never repeats the title (N §2.7).
4. **Never add chrome to the shell.** No page-specific banners in the TopBar or BottomBar; a blocking problem is a page Notice (D §6.1 blocking-notice rule).
5. **Declare its archetype and its phone slot.** `lib/nav.ts` holds `phoneSlot`; a page not in the bar marks More as current (N §1.8).
6. **Handle the keyboard.** While a text field is focused on a phone, the BottomBar hides (`keyboardOpen`, §7.3) so the field and its sticky action bar get the space.

### 4.3 Wallet and status signals per breakpoint (F-RWD-013, F-UX-028)

| | ≥1024 | 768–1023 | <768 |
|---|---|---|---|
| Healthy | Baseline segment "Wallet ₹2,340.50 · about 16 h of calls" | Wallet chip "₹2,340" (neutral) | Wallet chip "₹2,340"; hidden first if the title would drop below 120 px |
| Low or empty | Amber Baseline segment with "Top up"; a one-line WalletNotice only on spending pages (Cockpit, Leads call actions) | Amber chip "₹42 · Top up" (never hidden before the call chip); WalletNotice on spending pages | Amber chip; the WalletNotice becomes a one-line pill "Wallet ₹0 · Top up" with one CTA (no autopay), Dismiss 44×44 at least 8 px away, remembered for the session; never on /billing |
| Every Top up | Opens `/billing?topup=1` (the Top-up sheet) | same | same, full screen |

The 42–97 px banner with two wrapping buttons and a 22 px Dismiss 7 px from "Enable autopay" (F-RWD-013) does not exist at any width.
