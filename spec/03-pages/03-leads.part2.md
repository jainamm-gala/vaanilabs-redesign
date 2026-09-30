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
