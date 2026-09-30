
---

## 20. Area specs (2 of 2): tables, live calls, overlays, forms and the public site

### 20.C Data tables and record sheets (Leads, Call reports, Flows list, Knowledge, Invoices)

**Job.** Scan many records, open one, act on a selection, and never dial by accident. Owners: N §7, L §8–§10, CR §2.8–2.10.
**Findings addressed.** F-A11Y-002, F-A11Y-004, F-A11Y-010, F-A11Y-014 (counts), F-A11Y-018, F-A11Y-019, F-A11Y-023, F-A11Y-024.
**Hierarchy for assistive tech.** H1 with the pipeline count → view tabs → search and filters → the table caption (what and how sorted) → the rows → the open record sheet.

```
Desktop ≥ 1440 (Call reports; the detail sheet docks at 560)
┌ main ────────────────────────────────────────────┬ dialog, non-modal: "Call on 21 Sep, 10:42 am" ─┐
│ h1 Call reports   121 calls · 3 need review       │ h2 (focus on open)       [Close call details]  │
│ tablist "Views" · search (role=search) · Filter   │ group "Recording": ▶  ↺ 5 s  ↻ 5 s  slider     │
│ table role=grid, caption "Calls, newest first"    │ h3 Summary · h3 Captured · h3 Topics           │
│  th When (aria-sort=descending, button) · Lead ·  │ h3 Transcript: ol, one tab stop, ↑ ↓ by turn   │
│  Phone · Direction · Duration · Outcome · … ·     │                                               │
│  th "Actions" (visually hidden)                   │ Esc → focus returns to the row's link          │
│  tr aria-current="true" ▌ (open) …                │ J / K¹ → next call, "Call 4 of 50" announced   │
│ pager: status "1–50 of 121 calls · tests hidden"  │                                               │
└───────────────────────────────────────────────────┴────────────────────────────────────────────────┘
Laptop 1024–1439: the sheet overlays the right third (non-modal; F6 switches). Tablet: full-height modal sheet.
Phone < 768: ul of list rows; each li has one stretched link ("Today 10:42 am, 2 minutes 31 seconds,
Interested, Lead 1042"); the sheet is a full-screen modal above the bottom bar; no per-row Call button.
```

**States (assistive-tech view).** Loading: real headers, `aria-busy="true"`, pager "Loading…". Refreshing: rows stay, "Updating…" in the pager status. Empty: "No calls yet" (`title-16`) + one sentence + one action, inside the table's single full-width cell. Filtered to nothing: announced "No calls match 'visit' and 2 filters" + Clear filters. First-load error: danger Notice `role="status"`, then `role="alert"` if a user Retry fails (§24). Stale data: warning Notice "Showing results from 11:24 am. Couldn't refresh." No permission: names the admin. Record deleted while open: "This lead was deleted." and focus to the list heading.
**Microcopy.** "0 / 0 SHOWN" → "38 of 1,284 leads" · "1 SELECTED" → "2 leads selected" · sort "▼" → a sort icon plus `aria-sort` and the caption · empty `th` → "Actions" (visually hidden) · "Condition Check" ×4 → "Condition check: Residential" · "Re-analyze" per row → `⋯` › "Re-analyse call".
**Acceptance.** KB-05 (Leads: keyboard open and return, `C` opens the gate and sends no call request, shortcuts off makes `c` inert) · KB-06 (Call reports: Tab to row 3, Enter, read the transcript, Esc, focus back on row 3) · every row control named with its record (AX-01, name scan) · the focused row is never under the sticky header or BulkBar (VR-04) · counts are announced once after typing settles (LR-01).

### 20.D Live call and transcript (Cockpit, Rep console, flow Test panel)

**Job.** Know the call's state and what was said the moment it changes, without being flooded. Owners: CK §4.3–4.5 and §5.8–5.10, N §12.
**Findings addressed.** F-A11Y-014, F-A11Y-022 (STANDBY ring, breathe), F-A11Y-008 ("Awaiting connection…" at 3.0:1), F-A11Y-003 and F-A11Y-030 (Customer Intel fields and "Save context"), F-RWD-002.
**Hierarchy for assistive tech.** The call state word → the call card heading → "Captured so far" → the transcript → the actions (Take over, Transfer…, End call).

```
Desktop ≥ 1440 (live)
main: h1 Cockpit
┌ section h2 "Calls" 240 ┬ section h2 "Call with Lead 1042" 400 ──────┬ section h2 "Transcript" ────┐
│ ul: Live now · Up next │ status wrapper (polite): "Live"   02:14      │ ol, one tab stop:           │
│ · Recent (links)       │   (timer role=timer: never announced)        │ li lang=hi-Latn  00:21 Vaani │
│                        │ ol stepper: Dialling · Ringing · Live · Wrap │ li lang=hi       00:34 Caller│
│                        │ Now in the flow: "Ask about a site visit"    │ [Jump to latest · 2 new]     │
│                        │ h3 Captured so far (dl)                      │                              │
│                        │ [Take over] [Transfer…]   8 px   [End call]  │                              │
└────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────┘
Laptop: the Calls column becomes a header switcher (a Select). Tablet: PanelTabs "Call" · "Transcript".
Phone: the card stacks above the transcript; Take over and End call sit in a sticky 44 px bar; the TopBar
call chip keeps the state visible but is silent (only one element announces each change).
```

**States.** Idle: the Ready to call card; "The transcript appears here when a call starts." as text; nothing moves. Dialling, Ringing, Live, On hold, Wrap-up, Ended, No answer, Busy, Voicemail, Failed: each a word, an icon and one polite announcement (debounced 500 ms). Placing failed (the user's action): InlineError `role="alert"` "Couldn't reach the phone line. The call was not placed and you were not charged." Transcript reconnecting: warning Notice `role="status"`. Blocked (wallet ₹0, no number, outside hours): Place call `aria-disabled` with the reason linked by `aria-describedby`. Offline: "You're offline" reason on every call action.
**Keys.** `M`¹ mute, `H`¹ hold (announced); ⌘/Ctrl+Enter answers an incoming transfer in the Rep console; **no key ends a call**, End call is a button reached with Tab and needs no confirmation (D §6.2). Transcript and player keys: §9.9–9.10.
**Microcopy.** "SESSION: IDLE", "STANDBY", "Awaiting connection…" → the Ready card and "Idle" · "CUSTOMER INTEL" → h2 "Lead" · "TRANSCRIPT FEED" → h2 "Transcript" · "CONNECT" → "Place call…" · "Test Call" → "Talk in browser".
**Acceptance.** A scripted 3-minute test call produces exactly one announcement per state change and at most one transcript announcement per 2 s, and none for timers or cost (LR-01 with a spy on both regions) · SR-02 (NVDA and VoiceOver hear Dialling, Call live, the final turns in the right voice, Call ended) · at 720 × 450 nothing overlaps and every action is reachable (VR-04) · with reduced motion the live dot is still and the word "Live" remains (VR-03).

### 20.E Overlays and the palette

**Job.** Open a focused task, finish or leave it, and land back where you were. Owners: O §1–§9.
**Findings addressed.** F-A11Y-005, F-A11Y-011, F-A11Y-015, F-A11Y-024 (unnamed close buttons), F-A11Y-027.

```
Dialog md "New lead" (desktop centred; phone full screen with sticky header and footer)
┌ h2 New lead ─────────────────────────────── [5] Close ┐   focus order: body → footer → close
│ [1] Name (data-autofocus)                              │   Tab and Shift+Tab trapped; background inert
│ [2] Phone number   hint "10-digit mobile, like …"     │   Esc on a dirty form → inline discard state:
│ … (optional) fields                                   │   "Discard this lead? What you typed will be
├ footer ────────────────── [3] Cancel  [4] Add lead ────┤   lost." [Keep editing] (focused) [Discard]
```

**Which overlays must pass KB-03** (open by keyboard, focus in, Tab cycles, Esc closes, focus returns to the trigger, never `<body>`): New lead, Import leads, New webhook, every ConfirmDialog, Keyboard shortcuts, Search or jump, Call gate, Publish gate, Top-up sheet, lead sheet, call detail sheet, NavSheet, More sheet, workspace and account menus, every `⋯` menu, Connect to…, Go to [step], SessionExpired, the marketing phone menu.
**States.** Submitting: primary shows "Adding…", `aria-busy`, activation ignored. Server error: InlineError `role="alert"` above the actions, values kept. Success: the dialog closes, focus returns to the trigger, a toast "Lead added · View" (polite). A modal open during background events queues toasts until it closes (O §1.6).
**Acceptance.** KB-03 for each overlay above; KB-04 for every menu; `landmark-unique`, `aria-dialog-name`, `button-name` pass with each open (AX-02); the persistent WalletNotice is `role="status"` (LR-02).

### 20.F Forms and authentication

**Job.** Enter and correct information once, sign in without a memory test. Owners: C §3, §8; PA §8–§9; ST §10.
**Findings addressed.** F-A11Y-003, F-A11Y-006 (toggle focus), F-A11Y-020, F-A11Y-025, F-A11Y-026 (login H1 and landmarks).

```
Sign in (bare mode; 400 px column on desktop, full width with 16 px margins on phone)
[1] Skip to main content
main
  img "Vaani Labs" (the V mark)
  h1 Sign in to Vaani Labs
  Notice role=status (only with ?reason=expired): "Your session expired. Sign in to continue."
  [2] Email      input type=email autocomplete=username
  [3] Password   input autocomplete=current-password   [4] Show password (aria-pressed, 26 visual, 32 hit)
      hint row: "Caps Lock is on" (role=status, only while true)
  [5] Forgot password?   (link, 24 px tall)
  InlineError role=alert (after a failed attempt)
  [6] Sign in (lg: 40 desktop, 44 touch)
  [7] Email me a link instead
  "New to Vaani Labs?" [8] Create account
```

**States.** Error: "That email and password don't match. Try again or email me a link." under the form, `role="alert"`, focus stays on Sign in. Rate limited: "Too many attempts. Try again in 30 s." (the countdown updates each second and is not announced). Offline: "Can't reach Vaani Labs. Check your connection." with Retry. Session expired: the Notice above, email prefilled.
**Acceptance.** Every auth field has a `<label for>` and the right `autocomplete` (AX-01, a DOM assertion per field) · paste works in every field (MN-01) · a password manager fills sign in and saves on sign-up (MN-01) · an empty submit focuses the first invalid field with its error read (KB-14) · the show-password toggle has a visible ring and `aria-pressed` (VR-01).

### 20.G Public site

**Job.** Understand the product, hear it work in English and Hindi, and start. Owner: PA §4–§7.
**Findings addressed.** F-A11Y-021, F-A11Y-026, F-A11Y-029, F-A11Y-009 (violet CTAs), F-RWD-018 (menu Esc).

```
[1] Skip to main content
header: V mark link "Vaani Labs home" · nav "Main" (links) · [Log in] · [Get started]   (solid --surface, no alpha)
   phone: [Menu] button aria-expanded → dialog sheet; Esc closes and returns focus to Menu
main: h1 (hero) · h2 per section · h3 per card (no skipped levels)
   "Hear it work": industry and scenario radiogroups, language radiogroup (English · हिन्दी lang=hi),
   Play button (aria-pressed), the sample transcript expands in the page (no nested scroll region)
footer: nav "Site links" · Contact (same place on every page: 3.2.6)
ConsentBar: region "Cookie choices"; not modal; page scroll-padding-bottom = its height while shown
```

**Acceptance.** One H1 and header/nav/main/footer on every public page; axe `heading-order`, `region`, `scrollable-region-focusable` pass (AX-01) · the header passes contrast at every scroll position in both themes (CT-02, VR-01) · no audio plays until the user presses Play, and Stop is always available (1.4.2) · the phone menu closes on Esc and keeps `aria-expanded` in sync (KB-03).
