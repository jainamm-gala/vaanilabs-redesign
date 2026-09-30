
## 11. App shell and information architecture

### 11.1 Model
- **One shell on every authenticated route** (L1). It has three parts:
  - **Sidebar:** workspace switcher, `Ctrl K` jump, nav groups, and a footer for setup, wallet, Settings and account.
  - **Page header:** H1, one-line description, and actions on the right (at most one primary).
  - **Content.**
- Header height is 64 px on desktop and 52 px on mobile. Sticky chrome never exceeds 96 px (L7).
- **Home** becomes the default route. For a new workspace it shows the readiness path. Once setup is done it shows "Today": live and scheduled calls, calls that need follow-up, balance runway, and flows with issues.
- **The wallet moves out of the banner** and into the sidebar footer as "Wallet ₹240.00", which opens Billing.
  - When the balance is low, the row gets an amber badge.
  - When calling is blocked, a status line appears inline wherever calling is attempted. It says what is blocked and how to fix it, and "Top up…" opens the Billing top-up sheet directly (F-UX-002, F-UX-028, F-QA-004).
- **Identity is visible.** The account row shows avatar, name, role and org. It opens a menu with Profile, Theme (Light / Dark / System), Keyboard shortcuts, Help and Sign out. Sign out asks for confirmation only while a call is live (F-UX-029).
- **`Ctrl K` / `⌘K`** is a jump-to palette covering destinations, flows, leads by name or last four digits, and actions such as "Place test call…". The keys shown match the platform (F-FLOW-024).
- **Every route has its own `<title>`**, for example "Leads · Vaani". Filters, views, open records and the open flow are kept in the URL (F-UX-031, F-A11Y-013).
- The skip link lands on `main`. The sidebar is a single `nav` landmark with `aria-current="page"`, and each item is one tab stop (F-A11Y-012, F-A11Y-017).

### 11.2 Desktop ≥1440 (laptop is identical at 232 px)

```
┌────────────────────────┬───────────────────────────────────────────────────────────────┐
│ [V] Orchid Realty    ▾ │ Leads  248                               [Import leads…] [+ New lead]
│ ⌕ Search or jump… CtrlK│ People your agent can call. Import a list or add someone by hand.   │
│                        │ ─────────────────────────────────────────────────────────────────── │
│ ⌂ Home                 │  All 248 │ New 96 │ Follow up 31 │ Interested 42 │ Not interested 79 │
│ ◌ Assistant            │ ─────────────────────────────────────────────────────────────────── │
│ Build                  │ [⌕ Search name or phone…  /] (Status Any▾) (Language Hindi ✕) (+Filter)│
│  ⊏ Call flows       6  │                                                 ▥ Columns [Comf|Comp]│
│  ▯ Knowledge           │ ┌───────────────────────────────────────────────────────────────┐ │
│ Run                    │ │☐ Name            Phone           Status      Last call    Lang  Interest │ │
│  ☏ Live calls          │ │☑ MI Meera Iyer   +91 ••••• 4821  ✓Interested Asked for pr… HI EN ▬▬▬ 82 ☏│ │
│ ▌☺ Leads          248  │ │☐ VR Vikram R.    +91 ••••• 7712  Contacted   No answer 2h  HI   ▬   30 ☏│ │
│  ◠ Rep desk            │ └───────────────────────────────────────────────────────────────┘ │
│ Review                 │ 1–8 of 248                                          [Prev] [Next] │
│  ↺ Call history        │                                                                    │
│  ▥ Analytics           │                                                                    │
│ More agents            │                                                                    │
│  ▭ Meeting agent       │                                                                    │
│  ◘ Personal agent      │                                                                    │
│ ┌────────────────────┐ │                                                                    │
│ │Finish setup  4 of 5│ │                                                                    │
│ │▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░  │ │                                                                    │
│ │Next: invite team → │ │                                                                    │
│ └────────────────────┘ │                                                                    │
│ ▣ Wallet      ₹240.00  │                                                                    │
│ ≡ Settings             │                                                                    │
│ (NV) Neel Varma      ▾ │                                                                    │
│      Admin · Orchid    │                                                                    │
└────────────────────────┴───────────────────────────────────────────────────────────────┘
```

### 11.3 Tablet 768–1023 and mobile 320–767

```
TABLET                                   MOBILE (390)
┌────┬──────────────────────────────┐    ┌──────────────────────────────┐
│[V] │ Leads 248   [Import…][+ New] │    │ Leads (248)            ⌕  +  │  ← app bar
│ ⌂  │ All │ New │ Follow up │ …    │    │ All 248  New 96  Follow up 31│
│ ◌  │ [⌕ Search…] (Status▾)(+Filter)│    │ [⌕ Search name or…] (Hindi ✕)│
│ ── │ ┌──────────────────────────┐ │    │ ┌──────────────────────────┐ │
│ ⊏  │ │☑ Meera Iyer  4821 ✓Inter…│→│    │ │☑ Meera Iyer   ✓Interested│ │
│ ▯  │ │  (table scrolls inside,  │ │    │ │  +91 ••••• 4821 · Bengal…│ │
│ ☏  │ │   Name column sticky)    │ │    │ │☐ Vikram Rathore Contacted│ │
│▌☺  │ └──────────────────────────┘ │    │ └──────────────────────────┘ │
│ …  │                              │    │ [☑ 3 selected  Clear  Call 3…]│ ← docked bulk bar
│ ▣  │  ☰ "Menu" opens the full     │    ├──────────────────────────────┤
│(NV)│  labelled sidebar as overlay │    │ Home  Calls  Leads History More│ ← 5 tabs, 60 px
└────┴──────────────────────────────┘    └──────────────────────────────┘
```

More opens a sheet listing every group and destination (Build, Run, Review, More agents), then Billing, Settings, Help and the account row with Sign out. **All 12 destinations are reachable on a phone** (fixes F-RWD-001 and F-UX-008).

### 11.4 Page header template (every page)
- **Left side:** H1 `title-1` with an optional count in `text-3`, and a description in `body`/`text-2` of 90 characters or fewer.
- **Right side:** secondary actions, then at most one primary.
- **Directly below:** view tabs (underline, in the URL) or nothing.
- Settings sub-pages keep the Settings sub-nav visible, so there are no "BACK TO SETTINGS" bars (F-UX-027). This follows the Call Reports and Assistant pattern the audit says to keep.

---

## 12. Agent Cockpit ("Live calls")

**Intent.** The centre of the screen is always the task: before a call, a readiness card; during a call, the call itself; after a call, the outcome. The 320 px idle ring is removed (F-VIS-029, L5).

### 12.1 States
| State | Centre card content | Primary action |
|---|---|---|
| **Ready** (idle) | Readiness path (inline variant). The steps are: **Contact**: pick a lead (search) or type a number, with a fixed `+91` prefix, `type="tel"` and E.164 validation as you type. **Flow**: the name plus "Live v7 · tested today". Choosing it here does **not** change the workspace default (F-UX-014). **Agent voice**: Vaani / Vikash, each with a one-line description and a ▶ 5-second preview. **Wallet**: ₹ runway. **Number**: verified. | "Call this number" (primary). "Talk in browser" (secondary). A disabled primary shows its reason inline (K2). |
| **Dialling… / Ringing…** | Horizontal call-state stepper, timer, Cancel | none (a Cancel ghost button) |
| **Live** | Status line (Live dot, timer, recording disclosure). Lead name. Stepper. "Now in the flow" (stage tile, step name, step n of N, mini-path). Audio level for agent and lead. "Line: Good · 180 ms". Actions: Listen in, Take over call, End call… (danger outline, with confirmation) | none (no filled button during a live call; the AI is in control) |
| **Wrap-up** | Outcome, suggested automatically from the End node ("Visit booked"). Captured fields with edit. Summary. "Save to lead" (primary), "Open in Call history" | Save to lead |
| **Failed** | Status line (Failed) with the reason in plain words ("The number didn't answer after 30 s.") | Try again |

### 12.2 Wireframe: desktop, live call

```
┌ Live calls ──────────────────────────────────────────────────────────── [☏ Place test call…] ┐
│ Watch calls as they happen, or place a test call to hear a flow yourself.                   │
│ Live now 1 │ Scheduled 12 │ Test calls                                                      │
├──────────────────────┬───────────────────────────────────────┬───────────────────────────────┤
│ (MI) Meera Iyer      │ (● Live) 02:14      ◎ Recording · 00:04│ Transcript    [◉ Auto-scroll] ⌕│
│ +91 ••••• 4821  Open │ Meera Iyer                            │ Vaani agent 00:04          EN  │
│──────────────────────│ +91 ••••• 4821 · Outbound · try 1 of 2 │ Namaste Meera ji, this is…    │
│ Status   ✓Interested │ (✓)──(✓)──(3)──(4)                    │ Meera lead 00:11           HI  │
│ Language HI EN       │ Dial  Ring  Live Wrap-up              │ हाँ जी, बोलिए।                   │
│ Source   Website     │ ┌ Now in the flow ─────── Open in flow┐│ Vaani agent 00:15          HI  │
│ City     Bengaluru   │ │ [Check] Ask: still looking?         ││ आपने पिछले हफ़्ते 2 BHK…        │
│ Earlier  2 · 3d ago  │ │ Site visit booking · v7 · step 3/8  ││ …                             │
│ Notes    after 11 am │ │ [W]━[D]━[C]──[D]──[E]               ││ Meera lead 02:12 listening… HI│
│──────────────────────│ └─────────────────────────────────────┘│ Saturday को हो सकता है, लेकिन… │
│ Captured on this call│ Agent ▫▫▫▫▫▫▫▫   Lead ▮▮▮▯▮▮▮▯        │ (grey = still transcribing)   │
│ Budget   ₹60 lakh ✓  │ Line  Good · 180 ms                   │                               │
│ Home     2 BHK ✓     │ [🎧 Listen in] [✋ Take over]  [End call…]│ ⓘ Scroll up to pause.         │
│ Visit    Listening…  │                                       │           [Jump to latest ↓]  │
└──────────────────────┴───────────────────────────────────────┴───────────────────────────────┘
```

- **Laptop:** the lead panel moves below the call and transcript, which stay side by side.
- **Tablet:** call, then transcript, stacked.
- **Mobile:** status line and timer stay sticky at the top. Then the "Now in the flow" card, then the transcript at full width. Lead details sit in an accordion. The actions become a bottom action bar (Listen, Take over, End…).
- Nothing is hidden without a replacement (F-RWD-002).

### 12.3 Transcript rules
- Turns carry the speaker name (agent turns in `accent-text`), role, `mm:ss` in mono, and a language tag. Each turn also has `lang="hi"` or `lang="en"` set.
- Hindi uses `deva` at 15/26.
- A partial turn shows in `text-3` with "listening…". Only final turns go to the `aria-live="polite"` region, throttled to at most one per 2 s (Q6, F-A11Y-014).
- Auto-scroll pauses when the user scrolls up, and a "Jump to latest" pill appears.
- Search and Copy live in the header.
- The empty state reads "Transcripts appear here once the call connects." It replaces "Awaiting connection…" at 1.77:1.

---

## 13. Leads

### 13.1 Structure
- **Header:** "Leads 248", the description, [Import leads…] secondary and [+ New lead] primary. The first-run empty state swaps these for the empty-state actions.
- **View tabs** (in the URL, `?view=follow-up`): All, New, Follow up, Interested, Not interested. Counts cover the **whole pipeline**, not the current page (F-QA-015). The KPI strip leaves the default view. Pipeline numbers now live in the tab counts and in Analytics.
- **Toolbar:** search (focus with `/`), filter chips (Status, Language, Source, Owner, Last call; all kept in the URL), "+ Filter", then Columns (chooser) and the density toggle on the right. Everything fits in one row at 1024 px or wider. Below that, chips wrap to a second row rather than scrolling hidden (F-RWD-012).
- **Table** (a real `<table>` with caption, `scope` and `aria-sort`) (F-A11Y-018):

| Column | Content | Notes |
|---|---|---|
| ☐ | Checkbox 16 px in a 24 px hit area | The header checkbox has a mixed state |
| Name | 28 px neutral avatar (initials on `surface-3`), name 14/500, city 12.5 `text-3` | Sticky when scrolling sideways |
| Phone | `+91 ••••• 4821` in mono | Reveal is an explicit, logged action |
| Status | One badge (icon + word) | Editable from the row menu with an optimistic update |
| Last call | Outcome in words plus relative time; the tooltip shows the absolute time | "Not called yet" in `text-3` |
| Language | `HI` / `EN` codes | |
| Interest | 44 px meter plus a tabular number, right-aligned | "–" when unknown, not a dash row |
| Actions | Quiet phone icon button, named "Call Meera Iyer…". It becomes a labelled "Call…" button on hover or focus. | It opens the readiness popover. It never dials. |

- Clicking a row or pressing Enter opens the **lead sheet** (440 px, right side). The sheet has focus trap, Esc, focus return and deep link `?lead=<id>`. Inside it: details, call history (outcome words, never a month-old "QUEUED"), notes, and **Call…**. Delete sits in the ⋯ menu and asks for confirmation (F-UX-032, F-A11Y-010).
- **Keyboard:**

| Key | Action |
|---|---|
| `J` / `K` | Move a visible row focus ring |
| `X` | Select |
| `Enter` | Open |
| `C` | Open the readiness popover for the focused lead (never dials) |
| `/` | Search |
| `Esc` | Clear |

  Single-key shortcuts can be switched off in account settings, which meets WCAG 2.1.4 (F-A11Y-004).

### 13.2 Bulk calling with a readiness check
Selecting rows shows a floating **bulk bar**: "☑ 3 selected · Change status · Add to list · Clear · [Call 3 leads…]". The primary opens the **readiness popover** (a bottom sheet on mobile).

```
┌ Ready to call 3 leads? ───────────────────────────────┐
│ We checked everything that could stop or surprise a call.│
│ (✓) Flow: Site visit booking      Live v7 · tested today │
│  │                                                      │
│ (✓) Calling number verified       +91 ••••• 2210        │
│  │                                                      │
│ (✓) Inside calling hours          11:42 IST · 9:00–21:00│
│  │                                                      │
│ (!) Aditya Menon was called 22 h ago · we'll skip him [Include]│
│ ─────────────────────────────────────────────────────── │
│ 2 calls · about 2 to 4 min each              ₹10 to ₹20 │
│ ─────────────────────────────────────────────────────── │
│                                  [Cancel] [☏ Call 2 leads]│
└─────────────────────────────────────────────────────────┘
```

**Rules**
- **Blocking checks disable the primary and say why:**
  - no live flow
  - unverified number
  - wallet cannot cover the minimum
  - outside calling hours
- **Advisory checks (amber) adjust the batch and can be overridden:**
  - recently called
  - do-not-call
  - language mismatch
- **The estimate is a range, never a false-precise number.** It comes from the per-second rate and the flow's median call length.
- **After confirming,** the batch appears under Live calls › Scheduled with Pause and Cancel. A toast reads "Calling 2 leads. Track them in Live calls".
- **Every call request sends an idempotency key** (F3).

### 13.3 States
| State | Design |
|---|---|
| Empty | "No leads yet" plus one sentence. [Import leads…] (primary), [Add a lead], "Download template". |
| Filtered to nothing | "No leads match Hindi + Follow up", with [Clear filters] |
| Loading | A skeleton of 8 rows that mirrors the columns, after a 200 ms delay. The shell is always present (F-UX-030). |
| Error | Status line: "Couldn't load leads. Check your connection" with [Retry]. Rows already loaded stay visible. |
| No permission | "Only admins can import leads. Ask Neel Varma (Admin)." |
| Import | A two-step sheet (template, then upload). It accepts CSV and XLSX. A **preview of the first 5 rows** with column mapping and a phone-validation count comes before "Import 212 leads" (F-QA-022). |
