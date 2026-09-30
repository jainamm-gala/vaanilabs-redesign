## 5. Layout

### 5.1 Routes and URL state

| URL | Shows |
|---|---|
| `/assistant` | A new, empty chat. Nothing is created on the server until the first Send |
| `/assistant/c/{chatId}` | A saved chat. `<title>`: "{chat title} · Assistant · Vaani Labs" |
| `…?step={stepId}` | Scrolls the plan to that step, expands it and moves focus to it (deep links from toasts, History and the nav badge) |
| `…?tab=changes` | Opens the plan panel on the Changes tab |

The open chat, step and tab live in the URL (`pushState` for chat changes, `replaceState` for step focus). History popover state and composer text do not.

### 5.2 Regions and sizes per breakpoint

| Region | Desktop ≥ 1440 | Laptop-L 1280–1439 | Laptop-S 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Shell nav | Sidebar `--size-sidebar` 232 | Sidebar 232 | Rail `--size-rail` 56 | TopBar 52 + NavSheet | TopBar 52 + BottomBar 56 (Assistant lives in **More**) |
| Page header | PageHeader 56 (`page` on a new chat, `nested` on a saved chat) | same | same | H1 in TopBar; header row with meta + icon actions | same as tablet, row scrolls away with the thread |
| Conversation | fluid; content column centred, max `--size-container-form` 720, padding `--space-24` | same (column 560–720) | same (column 600–720) | single pane, column max 720, padding `--space-24` | full width, padding `--page-margin` 16 |
| Plan panel | docked right, `--size-sheet-record` 440, collapsible | docked 440 | docked `--size-inspector` 320 | **PlanBar** 44 above the composer → modal Sheet `min(--size-sheet-detail, 100%)` | PlanBar 44 → full-screen Sheet |
| ApprovalCard location | in the plan panel | in the panel | in the panel | **inline**, at the end of the thread | inline |
| Composer | pinned under the conversation column, max 720 | same | same | same | pinned above the BottomBar; the BottomBar hides while the keyboard is open |
| Baseline | 28 | 28 | 28 | TopBar wallet chip | TopBar wallet chip |

Rule: the ApprovalCard renders in **exactly one place**: the plan panel when it is visible, otherwise inline at the end of the thread. Hiding the panel at ≥ 1024 moves a waiting card into the thread.

### 5.3 Desktop ≥ 1440 (1440×900): a plan waiting for approval

```
+----------+-----------------------------------------------------------------------------------------+
| Sidebar  | Assistant > Plan calls for today's callbacks        [History] [New chat] [...] [Hide plan]| 56
| 232      +-----------------------------------------------------+-----------------------------------+
|          | CONVERSATION (column max 720, centred)              | PLAN (440)                        |
| Operate  |                                                     | Plan   [Waiting for you] 3 of 4   |
|  Cockpit | +-------------------------------------------------+ | [Plan] [Changes]      [Stop plan] |
| >Assist. | | You · 10:42 am                                   | | (v) 1 Look up                    |
| 1 waiting| | Plan calls for the 18 callbacks due today. Skip  | |     Find callbacks due today      |
|  Rep c.  | | anyone we called in the last day.                | |     Done · 18 leads · View        |
|  ...     | +-------------------------------------------------+ | (v) 2 Look up                    |
| Build    |   Assistant · 10:42 am                              |     Leave out recent calls        |
|  Flows   |   (search) Looked up 18 callbacks · Leads · 0.8 s   |     Done · 6 left out · 12 remain |
| Data     |   (search) Checked calls since yesterday · 0.4 s    | (||) 3 Call                      |
|  ...     |   18 callbacks are due today. 6 were called in the  | +-------------------------------+ |
| Account  |   last 24 h, so I left them out. 12 remain:         | | Call 12 leads                 | |
|  Billing |   +-----------------------------------------------+ | | EMI reminder v4 . Live        | |
|  Settings|   | Lead      | Due      | Last call  | Language | | | Vaani . Hindi + English       | |
|          |   | Lead 1042 | 11:00 am | 3 days ago | Hindi    | | | Now, until 7 pm IST           | |
|          |   | ... 4 more rows ...                           | | | Lead 1042 +91 ..... 4821      | |
|          |   | and 7 more . Open in Leads                    | | | ... and 9 more . View all 12  | |
|          |   +-----------------------------------------------+ | | 12 calls . ~1-2 min . Rs29-58 | |
|          |   [list] Plan . 4 steps . Step 3 waits for you [Review]| | Checks run again before dial. | |
|          |   Sources: 18 leads . 31 calls                      | | [Skip] [Edit...] [Review and  | |
|          |   [Copy] [Retry]                                    | |                   call...]    | |
|          |                                                     | +-------------------------------+ |
|          |  +-----------------------------------------------+  | ( ) 4 Change                     |
|          |  | Plan today's calls...                         |  |     Mark answered leads Contacted |
|          |  | [Attach]                      [Dictate] [Send]|  |                                   |
|          |  +-----------------------------------------------+  | Asks before changing anything .   |
|          |  Enter to send . Shift+Enter for a new line         | Assistant permissions             |
+----------+-----------------------------------------------------+-----------------------------------+
| Baseline: Live v7 . Site-visit qualifier | Inbound +91 80 .... 2210 . Ready | Wallet Rs2,340.50 . about 16 h of calls | Shortcuts  Search |  28 (shell part 3 §5.2 strings; no Activity segment while nothing runs)
+----------------------------------------------------------------------------------------------------+
```

Heights at 1440×900: header 56 + Baseline 28 leaves 816 px; the composer takes about 96 (one row, attachments hidden, hint line), so the thread scroller gets about 720 px. The plan panel scrolls on its own; its footer (autonomy line) is sticky.

### 5.4 Laptop-S 1024–1279 (1024×768)

```
+----+-------------------------------------------------------------------------------+
|rail| Assistant > Plan calls for today's...       [History] [New chat] [...] [Plan] |
| 56 +--------------------------------------------------+----------------------------+
|    | CONVERSATION (column 600-720)                    | PLAN (320)                 |
|    |  You · 10:42 am ...                              | Plan [Waiting] 3 of 4      |
|    |  Assistant · 10:42 am ...                        | (v) 1 Look up ...          |
|    |  table collapses to 3 columns (Lead, Due, Last)  | (||) 3 Call                |
|    |                                                  | [ApprovalCard, recipients  |
|    |  [composer]                                      |  list 2 rows + "and 10"]   |
+----+--------------------------------------------------+----------------------------+
| Baseline (28)                                                                     |
+-----------------------------------------------------------------------------------+
```

At 1280–1439 the layout is the desktop one with a 560–720 px column. At 1024–1279 the panel is 320: a container query (card narrower than 330 px) switches the ApprovalCard KeyValueList to the `stacked` variant, collapses the recipient rows into one KeyValue row ("Recipients · 12 leads · View all"), and puts `Review and call…` full width on its own row under `Skip step` and `Edit…`. The panel header drops "Step 3 of 4" (the tag carries the state), and the panel scrolls to the waiting card. When the card is taller than the panel, its footer (Skip step · Edit… · Review and call…) sticks to the bottom of the panel's scroll area with a top hairline, so the decision is always on screen. At viewport heights ≤ 720 the Baseline folds into a header chip (shell rule) and the composer hint line is hidden.

### 5.5 Tablet 768–1023 (768×1024)

```
+----------------------------------------------------------------------+
| [menu]  Plan calls for today's callbacks      [Rs2,340]   [search]   | TopBar 52
+----------------------------------------------------------------------+
| Started 10:42 am · 0 changes              [History] [New chat] [...] | header row 48
+----------------------------------------------------------------------+
|   You · 10:42 am  ...                                                |
|   Assistant · 10:42 am  ...                                          |
|   +--------------------------------------------------------------+   |
|   | (||) Step 3 of 4 · Call                  [Waiting for you]   |   |
|   | Call 12 leads · EMI reminder v4 · Live                       |   |
|   | recipients (3 rows) · cost line                              |   |
|   | [Skip] [Edit...]                      [Review and call...]   |   |
|   +--------------------------------------------------------------+   |
+----------------------------------------------------------------------+
| [list] Plan · Step 3 of 4 · Waiting for you                [Open]    | PlanBar 44
| [composer]                                                           |
+----------------------------------------------------------------------+
```

"Open" on the PlanBar opens the plan as a modal Sheet from the right, width `min(560, 100%)`, full height (overlay §1.7 detail sheet at tablet). The Call gate opened from the inline card is an anchored popover if it fits, else a bottom sheet.

### 5.6 Phone 320–767 (390×844)

```
+-------------------------------------+
| < Assistant  Plan calls fo...  [Rs2,340] [search] | TopBar 52 (Back link + H1 = chat title; no menu button on phones)
+-------------------------------------+
| Started 10:42 am   [hist][new][...] | header row 48 (scrolls away)
|                                     |
| You · 10:42 am                      |
| Plan calls for the 18 callbacks...  |
|                                     |
| Assistant · 10:42 am                |
| (search) Looked up 18 callbacks     |
| 18 callbacks are due today. 6 were  |
| called in the last 24 h...          |
|  Lead 1042 · Pune      Due 11:00 am |  two-line list items,
|  +91 ..... 4821 · 3 days ago        |  not a table
|  and 9 more · Open in Leads         |
| +---------------------------------+ |
| | (||) Step 3 of 4 · Call          | |  ApprovalCard inline
| | Call 12 leads · EMI reminder v4  | |
| | 12 calls · Rs29 to Rs58          | |
| | [Skip]  [Edit...]                | |
| | [      Review and call...      ] | |  44 px, full width
| +---------------------------------+ |
+-------------------------------------+
| [list] Plan · 3 of 4 · Waiting  (^) | PlanBar 44
| [clip] Plan today's calls...    [mic] | composer: one 44 px row; Send appears once there is text
+-------------------------------------+
| Cockpit  Leads  Call reports  Flows  ••• More | BottomBar 56 (More is current)
+-------------------------------------+
```

Budget at 390×844: TopBar 52 + header row 48 + PlanBar 44 (+8 gap) + one-row composer 60 (+8 padding) + BottomBar 56 = 276 px of chrome, so the thread gets about 560 px while the header row shows (562 px measured in the mock) and about 610 px once it scrolls away (today: 345). At 360×780: about 500 px (today: 241). With the on-screen keyboard open, the BottomBar and PlanBar hide (`visualViewport`), the composer sits on the keyboard, and the PlanBar returns when the keyboard closes; a waiting step is still visible inline in the thread.
