# Bolchaal: part 3 of 4

Part of `voice.md`. This part covers the app shell and IA, the Agent Cockpit and the Leads table. Wireframes are schematic; the rendered versions are in `voice.html`.

## 12. App shell and information architecture

### 12.1 One name per destination (fixes F-UX-017, F-VIS-005)

| Group | Destination (sidebar = page title = bottom bar) | Route | Replaces |
|---|---|---|---|
| Operate | **Cockpit** | `/cockpit` (`/dashboard` redirects) | "Agent View", "Agent", "AGENT COCKPIT" |
| | **Assistant** | `/assistant` | |
| | **Rep console** | `/rep-console` | |
| | **Meetings** | `/meetings` | "Meet Agent", "Meeting Agent — Vikash" |
| | **Personal agents** | `/personal-agents` | |
| Build | **Flows** (list) and the **Flow Designer** (one flow open) | `/flows`, `/flows/:id?node=&v=` | "Flow Builder / VOICE JOURNEY WORKSPACE" |
| | **Knowledge** | `/knowledge` | "AGENT KNOWLEDGE" |
| Data | **Leads** | `/leads` | "LEADS" (+4 px tracking) |
| | **Call reports** | `/call-reports` | |
| | **Analytics** | `/analytics` | |
| Account | **Billing** (wallet, top-up, autopay, usage, invoices) | `/billing` | Wallet links to Profile (F-UX-002) |
| | **Settings** (with sub-nav: Profile, Organisation and team, Calling number, Integrations, Developer, Security, Data) | `/settings/*` | 17 flat items with false ↗ icons (F-UX-027) |

API keys, Webhooks and Embed move under **Settings › Developer**, so no page is orphaned (EXPLORE-SETTINGS-07).

### 12.2 Shell anatomy

- **Sidebar**, 232 px, on `canvas`:
  - Org switcher (org name plus role) and **Search or jump to ⌘K**. The command palette (cmdk) finds leads, calls and flows and runs actions such as "New lead" and "Place test call…".
  - Four labelled groups (12/500 `text-3`) with 32 px items: 16 px icon plus a 14/500 label. The active item has a `surface` fill, `e1`, an accent icon and `aria-current="page"`.
  - Cockpit carries a live count ("2 live" with the voice meter) whenever calls are live. No other item has badges, except a setup item while setup is incomplete.
  - **Footer:** wallet card (balance in Anek 18, a Low / Empty badge, "Top up in Billing"), then the user row (avatar, name, role). The user menu holds Profile, Theme (Light / Dark / Match system), Keyboard shortcuts and Sign out… (with confirmation).
  - Identity is always visible (F-UX-029). There is no latency or "SYS" readout (F-UX-018).
- **Main panel**: `surface`, inset 8 px, 10 px radius, 1 px `border`. It scrolls on its own.
- **Page header** (identical on every page, fixes F-VIS-005):
  - Anek h1; one-line description with live counts ("248 leads · 21 callbacks due today").
  - Right side: at most one primary plus secondaries; overflow in "⋯".
  - Sub-pages use a breadcrumb in `caption` above the title ("Settings › Calling number"), never a "BACK TO…" bar.
- **Blocking notices** replace the global wallet banner. When the wallet is empty or no number is allocated, an amber inline notice appears only on pages whose primary task is blocked (Cockpit, Leads call actions, Flow Publish, Personal agents). It is `role="status"`, not `alert`, and dismissing it never moves focus (F-UX-028, F-A11Y-015). Everywhere else, the wallet card is enough.
- **Skip link**, landmarks (`nav`, `main`, `aside`) and a per-route `<title>` ("Leads · Vaani Labs") (F-A11Y-012, F-A11Y-013).

```
DESKTOP ≥1440 (and 1280–1439)
┌───────────────┬────────────────────────────────────────────────────────┐
│ ▮ılı Nestwell │  Leads                                [Import][+ New lead]
│   Homes ▾     │  248 leads · 21 callbacks due today                     │
│ ⌕ Search ⌘K   │ ┌─────────────┬─────────────┬─────────────┬───────────┐ │
│ Operate       │ │Open pipeline│ Interested  │Visits booked│Connect    │ │
│  Cockpit ılı2 │ │ 248         │ 36 +12 vs…  │ 9           │ 61%       │ │
│  Assistant    │ └─────────────┴─────────────┴─────────────┴───────────┘ │
│  Rep console  │  [⌕ Search… /] (All 248|New|Interested|Callback) [अ Lang▾]
│  Meetings     │  ─────────────────────────────────────────────────────  │
│  Personal ag. │  ☐ Lead            Lang   Status   Int  Last call  Next │
│ Build         │  ☑ Kabir Anand     अA     Interest  82  ═─═─ Visit  Sat │
│  Flows        │    +91 ••••• •4821                                      │
│  Knowledge    │  ☐ …                                                    │
│ Data          │                                                         │
│ ▣ Leads       │         ┌──────────────────────────────────────────┐    │
│  Call reports │         │2 selected · Flow v6 · Est ₹6–9 · Hours ✓ │    │
│  Analytics    │         │                 [Clear] [Review and call…]│   │
│ Account       │         └──────────────────────────────────────────┘    │
│  Billing      │                                                         │
│  Settings     │                                                         │
│┌─────────────┐│                                                         │
││Wallet   Low ││                                                         │
││₹142.50      ││                                                         │
││Top up →     ││                                                         │
│└─────────────┘│                                                         │
│ (IB) Ishita   │                                                         │
└───────────────┴────────────────────────────────────────────────────────┘
```

### 12.3 Breakpoint behaviour of the shell

| Range | Navigation | Header and wallet | Notes |
|---|---|---|---|
| **Desktop ≥1440** | 232 px labelled sidebar | Wallet card in the sidebar footer | Content max 1280 on reading pages |
| **Laptop 1280–1439** | 232 px labelled sidebar | Same | |
| **Laptop 1024–1279** | 56 px icon rail by default; `[` or the logo toggles a 232 px sidebar that **overlays** with a scrim | Wallet becomes an icon with a Low/Empty dot plus a tooltip | Rail items are 40 × 40 with real tooltips (label and shortcut), not `title` (F-UX-007, F-A11Y-017) |
| **Tablet 768–1023** | 56 px rail; the sidebar opens as a sheet over content (fixes F-VIS-033) | Same as above | Page gutter 24 |
| **Mobile <768** | **Bottom bar**: Cockpit · Leads · Reports · Assistant · More (56 px + safe area, 11/500 labels, 44 px targets). **More** opens a sheet with all 12 destinations grouped as in the sidebar, then Account, Theme and Sign out… | 52 px top bar: logo mark, page actions, wallet chip (`₹142.50`, amber when low) and search | Fixes F-RWD-001. Sign out never occupies a tab. |

- **Short viewports** (height 720 or less): the sidebar body scrolls, the footer stays pinned and the wallet card collapses to one line (F-RWD-005).
- **200% zoom** behaves like laptop or tablet, never "phone with 6 destinations".

```
LAPTOP 1024–1279            TABLET 768–1023            MOBILE 390
┌──┬──────────────────┐     ┌──┬───────────────┐       ┌────────────────────┐
│▮ │ Leads  [+ New]   │     │▮ │ Leads  [+ New]│       │▮ılı     ₹142.50 ⌕ │
│⌕ │ ┌KPI strip────┐  │     │⌕ │ KPI 2×2       │       │ Leads     [+ New] │
│◎ │ table …          │     │◎ │ table, sticky │       │ 248 · 21 due      │
│… │                  │     │… │ first column  │       │ ┌KPI 2×2────────┐ │
│👥│                  │     │  │               │       │ [⌕ Search…     /] │
│  │                  │     │  │               │       │ (All|New|Inter…)→ │
│₹•│                  │     │₹•│               │       │ Kabir Anand  Int. │
│IB│                  │     │IB│               │       │ अA ═─═─ Visit req │
└──┴──────────────────┘     └──┴───────────────┘       │ Next: Sat 11:00   │
 rail + tooltips; `[`        sidebar opens as sheet     │───────────────────│
 overlays full sidebar                                  │◎   👥   ▤   💬  ≡ │
                                                        │Cock Leads Rep As More
                                                        └────────────────────┘
```

### 12.4 Setup and readiness (fixes F-UX-001, F-UX-006, F-UX-015)

While setup is incomplete, a "Setup · 3 of 5" item sits under Account and a readiness card sits on Cockpit. Both use the Calling-number stepper pattern. The steps are:
1. Organisation and team
2. Calling number (Owned → Compliance → Authorised)
3. Wallet
4. Publish a flow
5. Pass a test call

Each blocked integration card names its unlocking step and links to it. The word "live" appears only when step 5 has passed.

---

## 13. Agent Cockpit

### 13.1 Call-state machine (shared by Cockpit, Rep console, Call reports, the flow test panel and Meetings)

| State | Pill | Icon | Colour | Live-region text |
|---|---|---|---|---|
| Idle | "Ready" | phone | neutral | (none) |
| Dialling | "Dialling… 00:03" | phone-outgoing | warning | "Dialling Kabir Anand" |
| Ringing | "Ringing 00:07" | phone-outgoing | warning | "Ringing" |
| Live | "Live 01:27" + voice meter | S2 | success | "Connected" (once) |
| On hold / taken over | "You're on the call" | headset | accent | "You joined the call" |
| Wrap-up | "Wrap-up" | edit | accent | "Call ended. Review the outcome." |
| Ended | outcome label ("Visit booked") | flag | neutral, or success for positive outcomes | outcome |
| No answer / Busy / Voicemail | label | phone-missed | neutral | label |
| Failed | "Couldn't connect · Retry" | alert | danger | reason in plain words |

Only **Live** animates, and only with audio (principle 1). Timers are mono with tabular figures. Latency is shown only while Live, qualitatively: "Voice latency: good, 210 ms" (F-UX-018).

### 13.2 Layout

- **Pre-call.** A "Ready to call" card replaces the 320 px orb (F-VIS-029, F-UX-026). It has these rows:
  1. **Contact:** lead search, or "Enter a number".
  2. **Number:** a `+91` tel field with a visible label.
  3. **Flow:** "Site-visit follow-up · v6 · live", with a "Use draft (test only)" option.
  4. **Agent voice:** Vaani · warm, plus a script chip for the language and ▶ Hear it.
  5. **Readiness:** wallet ₹142.50 (about 23 minutes), calling hours ✓, number ✓.
  - Actions: **Place call** (primary) and **Test in browser** (secondary, microphone). Every disabled state gives its reason inline.
  - Picker changes never silently rewrite the account default. "Set as default" is an explicit link (F-UX-014).
  - Customer context shows only real lead data, or an empty state. Demo values are never mixed in (F-UX-003).
- **Live** (rendered in `voice.html` C). From top to bottom:
  1. Header: state pill, name, masked number, language chip, direction, then recording-disclosure and flow badges on the right.
  2. **S1 conversation line** with time ticks and a legend (talk ratio, turns, interruptions).
  3. A "Now at" strip: logic tile, step name, step number, and an "Open in flow" link.
  4. Transcript. Speaker-labelled turns: Vaani in accent-text, the caller in text. A mono timestamp column. A bare script chip per turn with `lang` on the text. Partial turns in `text-3` ending in "…" plus a "Transcribing…" caption. Captured-field ticks sit inline under the turn that produced them. Auto-scroll pauses when the user scrolls up, and a **Jump to latest** button appears (digest 5.7 #3). Only final turns are announced, throttled (Q6).
  5. **Side panel** (340 px): Captured so far (a `dl` of flow variables, with pending values in `text-3`), Sentiment (icon, label, bar, score), "If he confirms" (the predicted outcome capsule), and controls: **Take over** (secondary), **End call** (danger outline), the `M` mute-agent keycap, and latency.
- **Wrap-up.** The transcript area becomes a summary: an AI summary, the outcome picked from the flow's Outcome nodes (editable), captured fields (editable) and a next step (callback date and time with explicit IST). Actions: **Save and close** (primary) and "Open in Call reports". This replaces "SAVE CONTEXT".
- **Multiple calls.** At 1440 px and up, a 240 px "Calls" column on the left lists Live now (with voice meters), Up next and Recent. Below 1440 px it becomes a switcher in the header.

```
COCKPIT · LIVE · DESKTOP 1440
┌──────────┬─────────────────────────────────────────────┬──────────────────┐
│Calls     │(ılı Live 01:27) Kabir Anand     (●Rec)(Flow v6)│Captured  4 of 6 │
│Live now 2│+91 ••••• •4821 · अA Hinglish · Outbound      │Interest [Interest]
│▸Kabir ılı│══════─────═════════──═══──══════───═══── │   │Unit     3BHK     │
│ Meera ılı│ ───────────────────────────────────────── │   │Budget ₹85,00,000 │
│Up next 3 │0:00      0:30        1:00           1:27     │Visit  Sat 11:00… │
│ Sana     │■Vaani 58%  ■Kabir 42%  9 turns  1 interrupt │──────────────────│
│ …        ├─────────────────────────────────────────────┤Sentiment ☺ Pos.  │
│Recent    │[⑂] Now at Ask about the site visit · 2 of 8 │▬▬▬▬▬▬▬▬░░ 0.72  │
│ …        ├─────────────────────────────────────────────┤──────────────────│
│          │00:02 Vaani [अA]                             │If he confirms    │
│          │      Namaste Kabir ji, main Vaani…          │(⚑ Visit booked)  │
│          │00:09 Kabir [अ]                               │                  │
│          │      हाँ, बोलिए। पिछले हफ़्ते…              │                  │
│          │01:26 Kabir ılı  Saturday chalega, bas…      │[Take over][End call]
│          │      Transcribing…        [↓ Jump to latest] │latency good · [M] │
└──────────┴─────────────────────────────────────────────┴──────────────────┘

COCKPIT · PRE-CALL (centre column)        COCKPIT · MOBILE 390 (live)
┌──────────────────────────────────┐      ┌──────────────────────────┐
│ Ready to call                    │      │(ılı Live 01:27)          │
│ Contact  [⌕ Kabir Anand       ▾] │      │Kabir Anand  अA Hinglish  │
│ Number   [+91│98200 1xxxx      ] │      │(●Rec) (Flow v6)          │
│ Flow     [Site-visit … v6 live▾] │      │═══──════──══─── 1:27     │
│ Voice    Vaani · warm  [अA] ▶    │      │[⑂] Now at Ask about…  →  │
│ Ready    ✓ ₹142.50 (~23 min)     │      │(Transcript|Captured|Flow)│
│          ✓ Within calling hours  │      │00:02 Vaani               │
│ [Place call]  [Test in browser]  │      │ Namaste Kabir ji…        │
└──────────────────────────────────┘      │ …                        │
                                          │[Take over]   [End call]  │ sticky
                                          └──────────────────────────┘
```

### 13.3 Responsive (fixes F-RWD-002, F-VIS-007)

| Range | Layout |
|---|---|
| ≥1440 | Calls column (240) · call (fluid) · context (340) |
| 1024–1439 | Call · context (320); calls become a header switcher |
| 768–1023 | Single column. The context panel becomes tabs (Transcript · Captured · Flow) under the conversation line; controls sticky at the bottom. |
| <768 | As tablet, with the header wrapping to 3 lines, badges wrapping and controls sticky with the safe-area inset. The flow select and context are never removed, only moved into tabs. |

---

## 14. Leads

### 14.1 Desktop anatomy (rendered in `voice.html` A)

- **Header:** "Leads", with a description stating counts and callbacks due. Actions: Import (secondary; accepts CSV and XLSX, so it is not labelled "IMPORT CSV") and **New lead** (primary).
- **KPI strip:** one bordered strip of four cells (Open pipeline, Interested with a delta in words, Site visits booked, Connect rate). The chrome above the first row drops from about 400 px to about 230 px (F-VIS-009).
- **Toolbar** (one row):
  - search (`/` keycap in the field) and a status segmented control with counts (top 4–5 statuses);
  - Language (script chips in the menu), Source and More filters as dropdown buttons. Active filters appear as removable chips under the toolbar.
  - A saved-view menu. All filters live in the URL (F-UX-031).
- **Table** (semantic `<table>`, sticky header, 52 px rows):

| Column | Width | Content |
|---|---|---|
| Select | 44 | 16 px checkbox with a 24 px hit area |
| Lead | min 200 | Name (14/500) and masked phone (mono 12 `text-3`). Reveal is an explicit, logged action in the sheet. |
| Language | 120 | Script chip |
| Status | 140 | One badge: New (outline), Contacted (outline), Interested (accent), Callback due (warning + clock), Converted (success + check), Not interested (neutral) |
| Interest | 96, right-aligned | 44 px bar + tabular score; "Not scored" in `text-3` (no dash fillers) |
| Last call | 240 | S1 mini conversation line, outcome (13 px) and "Today 11:42 · 1:27" (12 px `text-3`) |
| Next step | fluid | Plain text; overdue in warning text |
| Actions | 48 | Ghost icon button "Call {name}…" that opens the paid-action confirmation, never dials |

- **Columns menu** to show or hide Owner, Source, City and Created. Empty columns are hidden by default, which removes the 730 px dead column (F-VIS-009).
- **States:** hover `surface-2`; selected accent-soft at 70%; keyboard focus as a 2 px inset accent bar on the row. Rows are focusable and announce position (F-A11Y-010).
- **Keyboard:** `/` search, `J`/`K` move, `X` select, `A` select visible, `Enter` open, `C` call… (confirmation), `Esc` clear, `?` sheet. The single-key set can be turned off (F-A11Y-004).
- **Lead sheet** (right, 400 px, focus-trapped, Esc closes, fixes F-UX-032):
  - Header: name, phone and status, with the language chip in the header.
  - Tabs: Activity (calls with conversation lines, outcomes and transcripts), Details, Notes.
  - Footer: **Call…** (primary) and WhatsApp…. Delete lives in the ⋯ menu with a confirmation.
- **Bulk bar** (ink, floating, `e3`): count · flow and version · estimated cost · calling-hours check · Clear · **Review and call…**, which opens the paid-action dialog. Change status, Assign, Export and Delete… sit in its ⋯ menu (F-UX-013, EXPLORE-DATA-07).
- **Empty state:** "Leads you import or add appear here." with Import and New lead. **Loading:** skeleton rows matching 52 px row anatomy. **Error:** "Couldn't load leads. Retry".

### 14.2 Other breakpoints (fixes F-RWD-011, F-RWD-012)

- **Laptop 1024–1279:** Next step moves under Last call; filters beyond Language collapse into "Filters (2)".
- **Tablet:** the table keeps a sticky Lead column and scrolls horizontally inside its container, with an edge fade. The Last call column shows only the mini line.
- **Mobile:** cards (see the wireframe in 12.3). Each card shows name and masked phone; status badge; script chip, mini line and outcome; "Next:" line. A tap opens a full-screen sheet with sticky **Call…**. The segmented control scrolls horizontally, and the filter button opens a bottom sheet. At least 5 leads fit per screen (today 2–3).

Continue in `voice.part4.md`.
