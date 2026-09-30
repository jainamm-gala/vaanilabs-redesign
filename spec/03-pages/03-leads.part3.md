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
