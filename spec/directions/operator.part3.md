
---

## 11. How the direction fixes the audit's top issues

| # | Finding | How Switchboard resolves it |
|---|---|---|
| 1 | F-FLOW-001: autosave writes to the live flow | Draft/published revisions are built into the UI model. The header always shows `Live v7` next to `Draft · from v7`. Only **Publish v8…** (a sheet with validation, a diff and the impact) promotes. Deleting a connected node raises an Undo toast. (15.8) |
| 2 | F-UX-001: org setup dead end | Setup becomes a tracked checklist (`Finish setup (2 of 4)` in the status line and on the Cockpit). Settings › Organization reuses the 3-step Calling number stepper pattern. A disabled integration says why and links to the step. |
| 3 | F-QA-001: /about claims | Content fix, outside the visual scope. P1 applies to marketing too: no claim without evidence. The marketing site adopts the same type and colour, which reduces "two brands" (F-VIS-025). |
| 4 | F-A11Y-001: flow canvas mouse-only | Nodes and port-tab sockets are focusable. Tab order follows the graph from the Trigger. `Enter` opens the inspector, `C` opens "Connect to…" and `A` adds a step after. The Outline view is a full alternative. (15.10) |
| 5 | F-A11Y-002: Call Reports rows mouse-only | Rows are real `<tr>` elements with a row link. `Enter` opens a 440 px side sheet with focus moved in, and the transcript uses the timecode gutter. `Esc` returns focus. |
| 6 | F-QA-002: opening a flow writes it | The save-state machine ignores hydration and layout events. `Saved hh:mm` shows only after a real save (15.8). |
| 7 | F-FLOW-004: "FLOW VALIDATED" on invalid flows | The badge is removed. A live issues chip, node-level error and warning marks and a Problems bar replace it. Publish is disabled while errors exist, with the reason shown. |
| 8 | F-A11Y-004: `c` places a billable call | `C` opens the pre-flight card and never dials. Single-key shortcuts can be switched off in Settings › Accessibility. |
| 9 | F-QA-005: 50 of 121 calls | The table spec requires server pagination and a visible "1–50 of 121" range. Search, sort and filter run server-side. |
| 10 | F-QA-006: test calls stored as two legs | A data fix. The UI shows one row per call with "2 legs" disclosed in the detail sheet, and KPIs count calls, not legs. |
| 11 | F-UX-002: Top up opens Profile | The wallet lives in the status line and Billing › Wallet, and every wallet link goes to `/billing#wallet`. |
| 12 | F-UX-006: "You're live" when you're not | P1. "Live" appears only when number, wallet and a published flow all check out. Otherwise the setup checklist shows. |
| 13 | F-QA-010: /signup lands on sign-in | Auth screens use the same shell tokens. "Create account" and "Sign in" become separate routes with separate H1s (routing fix). |
| 14 | F-RWD-001: phone nav reaches 6 of 12 | The bottom bar holds Cockpit, Leads, Reports, Flows and More. **More** is a sheet listing every remaining section. Sign-out moves to the account menu. |
| 15 | F-A11Y-008 / 009 / F-VIS-003: contrast | Every text token is ≥ 4.5:1 (lowest: text-3 on surface-3, 4.70). White on the accent is 6.92:1. Control borders are ≥ 3:1. |

Also resolved by the system itself:
- F-VIS-001, 002, 005, 006, 016, 017, 018: one type scale, one button, one input, one tag, one header
- F-VIS-004: one hue in both themes
- F-VIS-022 / F-QA-038: no textures
- F-VIS-029 / F-UX-026: no idle ring; "Place call" vs "Talk in browser" become distinct, labelled actions
- F-UX-018: no fake status
- F-UX-028 / F-A11Y-015: wallet banner removed
- F-A11Y-022: reduced motion
- F-A11Y-023: 24 px targets
- F-VIS-024: one date grammar

---

## 12. App shell and information architecture

### 12.1 Navigation model
The labelled sidebar has four groups; group labels are 12/500 in text-3, sentence case (digest L6):

| Group | Destinations (nav label = page title) |
|---|---|
| Operate | Cockpit · Assistant · Rep console · Meetings · Personal agents |
| Build | Flows · Knowledge |
| Data | Leads · Call reports · Analytics |
| Account | Billing · Settings |

- **One name per destination** everywhere: nav, H1, `<title>` ("Leads · Vaani Labs"), phone bar and ⌘K. "Agent View / AGENT COCKPIT / Agent" becomes **Cockpit** and "Meet Agent / Meeting Agent — Vikash" becomes **Meetings** (F-UX-017, F-A11Y-013).
- **Active item:** a raised white key (surface + 1 px border + e1) with an accent icon and `aria-current="page"`. Settings sub-pages keep Settings active.
- **Workspace switcher** at the top: org name and role ("Workspace · Admin"). Identity is visible at last (F-UX-029).
- **Account menu** at the bottom (avatar): profile, theme (System / Light / Dark), keyboard shortcuts on/off, and `Sign out…` with a confirm.
- **Settings** gets a grouped 200 px sub-nav inside the shell, with no ↗ icons and no "BACK TO SETTINGS" bars (F-UX-027):
  - Workspace (Profile, Organization & team, Notifications)
  - Calling (Numbers & telephony, Call channel, Voices & languages)
  - Developer (API keys, Webhooks, Embed)
  - Security (Two-factor, Sessions, Activity log)
  - Data (Export, Delete account)
- **Billing** has tabs: Wallet · Usage · Plans · Invoices · Autopay.
- **Skip link** to `main`. Each nav item is one tab stop (F-A11Y-012).

### 12.2 Desktop (≥ 1440): full shell
```
┌──────────────────────┬──────────────────────────────────────────────────────────────────────────┐
│ [V] Sahyadri Homes ▾ │ Leads  1,284 leads · synced 11:24         Export  [Import…] [+ New lead N]│ 56
│ [⌕ Search or jump ⌘K]├──────────────────────────────────────────────────────────────────────────┤
│ Operate              │ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ + Save view      │ 40
│  ∿ Cockpit  ● 2 live │ [⌕ Search name, phone… /] [Filter] [Language: Hindi ×]   Columns [Std|Cmp]│ 52
│  ▢ Assistant         ├──────────────────────────────────────────────────────────────────────────┤
│  ◠ Rep console       │ ☐ LEAD           PHONE            STATUS         LAST CALL          ...   │ 32
│  ▭ Meetings          │ ☑ Kavya Raman    +91 •••••• 4821  Interested     Visit booked · 10:42 ... │ 40
│  ☰ Personal agents   │ ☑ Siddharth Nair +91 •••••• 3307  Callback due   Call later · 09:15   ... │
│ Build                │ ☐ Farhan Qureshi +91 •••••• 9158  New            Not called yet       ... │
│  ⧉ Flows             │ ...                                                                      │
│  ▯ Knowledge         │                                                                          │
│ Data                 │          ┌ 3 selected │ Call 3 leads… │ Set status ▾ │ Export │ Clear Esc ┐ │
│ ▐Leads▌ (raised key) │          └──────────────────────────────────────────────────────────────┘ │
│  ▤ Call reports      │ 1–50 of 1,284                          J K move · X select · ? all    ‹ › │ 40
│  ▥ Analytics         │                                                                          │
│ Account              │                                                                          │
│  ▦ Billing  ▧ Settings                                                                          │
│ (RK) Ritika K. Admin │                                                                          │
├──────────────────────┴──────────────────────────────────────────────────────────────────────────┤
│ ● Live flow Site-visit qualifier v7 │ ☎ +91 80 •••• 2210 ready │ Wallet ₹2,340.50 │ 2 calls │ ? ⌘K│ 28
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 12.3 Laptop (1024–1439): rail
- The sidebar becomes a 56 px icon rail with tooltips that show label and shortcut.
- `[` or the logo expands it as an **overlay** (it never pushes content).
- The rail is scrollable and never clips Settings (F-RWD-005). ⌘K is the fast path.
- Inspectors overlay content below 1280 px.
- The status line stays.
```
┌────┬───────────────────────────────────────────────────────────────┐
│ V  │ Cockpit  1 live call · 1 in wrap-up     [Kavya · 02:14|Test]  │
│ ⌕  ├──────────────────────┬────────────────────────────────────────┤
│[∿] │ LIVE CALL CARD       │ TRANSCRIPT (timecode gutter)           │
│ ▢  │ 392 px               │                                        │
│ ⧉  │                      │                                        │
│ ▣  │                      │                                        │
│ ▦  │ [Take over][Transfer…]        [End call]                      │
├────┴──────────────────────┴────────────────────────────────────────┤
│ ● On call 02:14 │ Live flow Site-visit qualifier v7 │ Wallet ₹2,335│
└────────────────────────────────────────────────────────────────────┘
```

### 12.4 Tablet (768–1023): top bar and sheets
- A 52 px top bar: menu button, page title, the status chip and ⌘K.
- The menu opens the full grouped nav as a left **sheet** over content. Today it pushes content down to 528 px (F-VIS-033).
- Pages are single-pane. Records and inspectors open as right sheets at 100% height.
- Tables keep a sticky first column and scroll inside their frame.
- The status line becomes the chip.
```
┌──────────────────────────────────────────────┐
│ ☰  Leads               (● ₹2,340)   ⌕   ⌘K   │ 52
├──────────────────────────────────────────────┤
│ All │ New │ Callbacks │ Interested  →        │
│ [⌕ Search…]                       [Filter]   │
│ ┌────────────┬──────────────────────────────▶│ table scrolls inside,
│ │ Kavya Raman│ +91 •••••• 4821  Interested … │ lead column sticky
│ └────────────┴───────────────────────────────│
└──────────────────────────────────────────────┘
```

### 12.5 Mobile (320–767): bottom tabs and More
- **Top bar:** title, status chip (`● ₹2,340`), search and filter.
- **Bottom bar:** 5 items (Cockpit, Leads, Reports, Flows, More), 60 px plus the safe-area inset.
- **More** opens a sheet with every other destination, the account menu and Sign out.
- Tables become two-line list items (name + tag / masked phone + last outcome · time), and multi-select is entered with a long press or a Select button.
```
┌──────────────────────────────┐
│ Leads        (● ₹2,340) ⌕ ⚲ │
│ All 1,284  New 312  Callbacks│
├──────────────────────────────┤
│ Kavya Raman       Interested │
│ +91 •••••• 4821 · Visit 10:42│
├──────────────────────────────┤
│ Siddharth Nair  Callback due │
│ +91 •••••• 3307 · Later 09:15│
├──────────────────────────────┤
│ ...                          │
├──────────────────────────────┤
│ ∿      ▣      ▤      ⧉     ⋯ │
│Cockpit Leads Reports Flows More│
└──────────────────────────────┘
```

---

## 13. Agent Cockpit

**Job:** place, watch and wrap up one call at a time (test or live), with nothing on screen that isn't about that call. The idle ring, the mono intel boxes and the demo data go (F-VIS-029, F-UX-003, F-VIS-016).

**One call-state machine**, shared with the Rep console, Call reports and flow Test:

`Idle → Dialling… → Ringing… → Live → Wrap-up → Ended | No answer | Busy | Voicemail | Failed`

| State | Colour | Icon | Label |
|---|---|---|---|
| Idle | graphite | phone | Idle |
| Dialling, Ringing | amber | phone | Dialling…, Ringing… |
| Live | green | pulsing dot (the only pulse in the product) | Live |
| Wrap-up, Ended, No answer | graphite | clock, check, × | as named |
| Failed | red | alert | Failed |

Every state change is announced politely.

**Layout, desktop and laptop:**
- **left**, the 392 px call card
- **right**, the transcript (timecode gutter)
- an optional 320 px **Lead context** sheet with history and previous calls, toggled with `L`
- a header segmented control that switches between concurrent sessions (the live call and a test in wrap-up)

**Pre-call ("Ready to call") card:** it replaces the idle centre stage and holds five rows.
1. **Contact:** search leads, or type a number (`+91` prefix field, E.164 validation).
2. **Flow:** name, version and `Live` tag; the draft can be picked for test calls only.
3. **Voice:** 32 px avatar, "Vaani · Hindi + English · warm", and a ▶ preview.
4. **Language:** Auto or fixed.
5. **Readiness:** calling number ready, wallet balance.

Actions:
- **Place call** (primary, with a pre-flight showing cost and hours) and **Talk in browser** (secondary, mic). These replace the unexplained CONNECT and Test Call (F-UX-026, F-VIS-030).
- A disabled Place call says why inline: "Wallet is ₹0. Top up in Billing."
- The flow and voice pickers **never** write the account default silently (F-UX-014). "Make default" is a separate, explicit link.

```
┌──────────────────────────────────────┬─────────────────────────────────────────────────┐
│ ● Live   Outbound             02:14  │ Transcript · streaming                   ⌕  ⧉   │
│ (KR) Kavya Raman  +91 •••••• 4821    ├─────────────────────────────────────────────────┤
│      Pune                [◎ Recording]│ 00:03 │ Agent [HI] [T1]                          │
├──────────────────────────────────────┤       │ नमस्ते कव्या जी, मैं वाणी बोल रही हूँ…     │
│ Flow          Site-visit qualifier v7│ 00:11 │ Kavya [HI]                  (surface-2)  │
│ Current step  [Q1] Interested in a…  │       │ हाँ जी, बोलिए।                            │
│ Voice         Vaani · Hindi + English│ 00:14 │ Agent [EN] [Q1]                          │
│ Line          ✓ Good · 180 ms        │       │ You had enquired about a 2 BHK…          │
│ Cost so far   ₹5.36 · ₹0.04/s        │ 00:31 │ Agent [EN] [KB] Knowledge: price-sheet   │
├──────────────────────────────────────┤       │ 2 BHK units start at ₹85 lakh…           │
│ Agent ▮▮▮▮▮▮▯▯▯▯  Customer ▮▯▯▯▯▯▯▯▯ │ 02:12 │ Kavya · listening…      (muted, partial) │
├──────────────────────────────────────┤       │ Haan, eleven works…                      │
│ Captured by the flow                 │                                                 │
│ {{preferred_day}}   Saturday, morning│                                                 │
│ {{budget}}          ₹85 L – ₹1 Cr    │               [⌄ Jump to latest]                │
├──────────────────────────────────────┤                                                 │
│ [Take over] [Transfer…]   [End call] │                                                 │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
```

- **Live controls:** Take over (routes to Rep console, `⌘T`), Transfer… (number picker), End call (danger outline, `⌘⇧E`, no confirm, because ending is expected).
- **Compliance cue:** a "Recording" tag with a tooltip giving the disclosure time. Calling hours and the DND check appear in the pre-flight (for the product owner to confirm, digest 5.11).
- **Wrap-up:** the card becomes an outcome form, pre-filled from the flow's Outcome node (Visit booked → Interested), with editable notes and the AI summary. The primary is **Save and next** (`N`), so an operator can run a list without touching the mouse.
- **Tablet:** Call and Transcript become tabs. **Phone:** the card stacks over the transcript, and Take over and End call sit in a sticky 44 px bar (see the specimen). This fixes the hidden intel and the overlapping controls (F-RWD-002, F-VIS-007).

---

## 14. Leads

**Job:** find, qualify and call people in bulk, safely. Chrome above the first row drops from about 400 px to 148 px (header 56, views 40, toolbar 52), so about 12 rows are visible at 1440×900 in Standard (F-VIS-009).

- **Saved views as tabs,** with counts computed over the whole pipeline, not the page (F-QA-015): All · New · Callbacks due · Interested · Not reached · + Save view.
- **Toolbar:**
  - search (`/`)
  - a `Filter` menu that adds tokens (status, source, language, outcome, flow, owner, date)
  - Columns chooser and a Standard | Compact switch on the right
  - everything is kept in the URL (F-QA-016)
- **Table columns:** checkbox · Lead (500) · Phone (mono-13, masked) · Status (tag) · Last call (outcome + time in text-3) · Interest (right-aligned score + 40 px bar) · Lang (codes) · Flow · row actions.
  - The ~730 px dead column and the Status-under-Interest misalignment disappear (F-VIS-009).
  - Source becomes a filter and an optional column with a muted icon. The letter glyphs go.
- **Row interaction:**
  - Click or `Enter` opens the 440 px lead sheet, with its header sticky and no clipping. Tabs: Overview (details, outbound config), Calls (timecode-gutter history), Notes. `Delete lead…` sits in the sheet's overflow menu, not under Call (F-UX-032, F-UX-035).
  - Hover or focus reveals `Call… C` and `⋯`.
- **Keyboard:** `J`/`K` move, `X` select, `⇧A` select all, `C` call (pre-flight), `N` new lead, `Esc` clear, `⇧D` density. Rows are focusable, with a visible 2 px outline (F-A11Y-010).
- **Bulk bar:** floats above the pager (e3). It holds the selection count, **Call n leads…** (primary), Set status, Assign flow, Export and Clear. Calling is no longer the only bulk action (EXPLORE-DATA-07).
- **Pre-flight card**, opened by any call action:
  - flow + version + Live tag
  - voice
  - calling hours ("Open until 19:00 IST")
  - DND registry ("3 of 3 clear")
  - estimated cost ("≈ ₹11 (3 × ~90 s at ₹0.04/s)")
  - wallet
  - Cancel / **Start 3 calls ⌘↵**
  - If anything fails, the start button is disabled with the reason, for example "2 leads are on DND. Remove them or continue with 1." (F-UX-013)
- **Import:** keep the two-step dialog, but relabel it "Import…" (CSV or XLSX) and add a column-mapping preview with row-level errors (F-QA-022).

```
┌ Leads  1,284 leads · synced 11:24 ─────────────────── Export  [Import…]  [+ New lead N] ┐
│ All 1,284 │ New 312 │ Callbacks due 18 │ Interested 96 │ Not reached 204 │ + Save view  │
│ [⌕ Search name, phone or city… /] [≡ Filter] [Language Hindi, English ×] [Source Web ×]│
│                                                         ▥ Columns  [Standard|Compact] │
├───┬────────────────┬─────────────────┬──────────────┬─────────────────────┬──────┬────┤
│ ▣ │ LEAD           │ PHONE           │ STATUS       │ LAST CALL           │INTRST│LANG│
├───┼────────────────┼─────────────────┼──────────────┼─────────────────────┼──────┼────┤
│▌☑ │ Kavya Raman    │ +91 •••••• 4821 │ Interested   │ Visit booked · 10:42│ 82 ▬ │HI EN│ selected
│▌☑ │ Siddharth Nair │ +91 •••••• 3307 │ ◷Callback due│ Call later · 09:15  │ 64 ▬ │ EN │ selected
│ ☐ │ Farhan Qureshi │ +91 •••••• 9158 │ New          │ Not called yet      │    – │ HI │
│[☐ │ Ishita Bose    │ +91 •••••• 6612 │ Contacted    │ No answer · Yest.   │ 41 ▬ │ BN]│ keyboard focus
│ ☐ │ Tanvi Joshi    │ +91 •••••• 1189 │ New          │ Not called yet      │ [Call… C] ⋯ │ hover
├───┴────────────────┴─────────────────┴──────────────┴─────────────────────┴──────┴────┤
│        ┌ 3 selected │ [Call 3 leads…] │ Set status ▾ │ Assign flow ▾ │ Export │ Clear Esc ┐│
│ 1–50 of 1,284                                  J K move · X select · ? all shortcuts ‹ ›│
└────────────────────────────────────────────────────────────────────────────────────────┘
```
