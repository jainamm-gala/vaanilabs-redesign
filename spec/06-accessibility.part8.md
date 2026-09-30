
---

## 19. Area specs (1 of 2): the app shell and the Flow Designer

Each area follows the page-spec template from an accessibility point of view. Visual layout and copy are owned by the page specs; what is fixed here is structure, order, names, keys, announcements and tests. The mock (`06-accessibility.html` §1 and §3) renders both areas.

### 19.A App shell and navigation

**Job.** Get anywhere in two keystrokes, always know where you are, and hear only real changes. Owners: N §1, S §3–§10.

**Findings addressed.** F-A11Y-012 (skip link; two stops per nav item), F-A11Y-013 (one title for every route), F-A11Y-015 (wallet `role=alert` on every page), F-A11Y-017 (no `aria-current`, unlabelled navs, `title` tooltips), F-A11Y-023 (phone targets), F-A11Y-026 (landmarks), F-RWD-001 (6 of 12 sections on phones and at 200 %).

**Hierarchy for assistive tech.** 1st: the `<title>` and the skip link. 2nd: the H1 (focused on every route change). 3rd: the Main navigation with the current item marked. Last: the Baseline region and notifications.

**Layout, landmarks and Tab order** (numbers are Tab stops from a fresh load; `[ ]` = one stop):

```
Desktop ≥ 1440 (Leads as the example page)
┌ [1] Skip to main content  (visible only on focus, top-left, --z-skiplink) ─────────────────────────┐
├ nav "Main" 232 ─────────┬ main#main ───────────────────────────────────────────────────────────────┤
│ [2] Workspace ⇕         │ h1 Leads (tabindex -1)   1,284 leads · synced 11:24 am                   │
│ [3] Search or jump…     │                              [9] Export  [10] Import…  [11] New lead     │
│ Operate                 │ [12] Views tablist (1 stop, ← → move, Enter selects)                     │
│ [4] Cockpit · 2 live    │ [13] Search  [14] Filter  [15] Columns  [16] Density (radiogroup)        │
│ [5] Assistant  … one    │ [17] grid: 1 stop → active row → its controls → [18] BulkBar → [19] pager│
│     stop per item       │                                                                          │
│ [6] Finish setup 3 of 5 │                                                                          │
│ [7] Anika R. ⇕ (menu)   │                                                                          │
├─────────────────────────┴ region "Workspace status" (Baseline 28): [20] Live flow [21] Number     ┤
│                           [22] Wallet [23] Calls in progress [24] Shortcuts [25] Search            │
└ region "Notifications" (toasts, F8)  ·  status + alert (announcer, visually hidden) ─────────────────┘

Laptop 1024–1279                         Tablet 768–1023                    Phone 320–767
┌[1]Skip┬─────────────────────┐          ┌[1]Skip─────────────────────┐     ┌[1]Skip───────────────┐
│nav 56 │ main                 │          │[2]☰ h1 Leads [3]₹ [4]⌕    │     │ h1 Leads [2]₹ [3]⌕  │
│[2] ▣  │ h1 Leads             │          ├ main ──────────────────────┤     ├ main ────────────────┤
│[3] ⌕  │ …                    │          │ single pane                │     │ list rows (li + link)│
│[4] ⌁ ─┼▶ tooltip on focus:   │          │                            │     │                      │
│  …    │  "Cockpit · 2 live"  │          │ ☰ opens NavSheet (dialog,  │     ├ nav "Main" 56 + safe ┤
│[n] ⟦⟧ │ expand: aria-expanded│          │ focus → current item, Esc) │     │[n]Cockpit Leads Call │
└───────┴ Baseline ────────────┘          └────────────────────────────┘     │ reports Flows More ▲ │
                                                                             └ More: dialog, 12/12 ─┘
```

**Components.** SkipLink (§6.4), Sidebar · Rail · TopBar · NavSheet · BottomBar · MoreSheet (N §1), PageHeader (N §2), Baseline (S §5), Toaster (O §9), LiveRegion + `announce()` (§12), CommandPalette (O §8), the `?` Dialog `lg` (S §10), ShortcutProvider (§8.4).

**States** (what the user perceives, and what assistive tech gets):

| State | Visible | Assistive tech |
|---|---|---|
| Loading a route | Shell stays; RouteProgress after 200 ms; skeletons in `main` | `main aria-busy="true"`; when content lands, focus moves to the H1 |
| First use (setup incomplete) | Setup card "Finish setup · 3 of 5 · Next: add money" | One link with that full name; Home listed first in Operate |
| Error (route) | PageError inside the shell | Focus to the H1; `<title>` "Couldn't load · Call reports · Vaani Labs" |
| Offline | ConnectionBar "You're offline. Showing data from 11:42 am." | `role=status`, announced once; network actions `aria-disabled` with "You're offline" |
| No permission | Forbidden page naming who can help | Focus to the H1 "Only organization admins can review proposals." |
| Not found | NotFound inside the shell | `<title>` "Page not found · Vaani Labs"; focus to the H1 |
| Session expired | SessionExpired dialog | Focus on "Sign in"; page state and flow edits kept on the device |
| Wallet low or empty | Baseline segment turns amber; WalletNotice only on spending pages | `role=status`; one polite announcement per crossing; never `role=alert` |

**Microcopy (before → after).** "Exit" (a primary tab) → "Sign out…" (account menu, confirmed) · "SYS: ONLINE · 22ms" → removed · rail `title="Leads"` → portalled tooltip "Leads" on hover and focus · "Vaani Labs - The Voice AI that speaks India" on every route → "Leads · Vaani Labs" · "Wallet empty — top up now to keep calls flowing." → "Wallet is ₹0. Phone calls are paused." (Top up) · "Collapse [" → tooltip "Collapse sidebar" + keycap `[`.

**Responsive.** One `nav aria-label="Main"` exists at any width (the others are `display: none`). At 200 % zoom of 1440 × 900 (720 × 450) the phone shell applies and all 12 destinations stay reachable in two taps.

**Telemetry (optional, privacy-safe).** `skip_link_used`, `f6_region_cycled`, `palette_opened { via: 'key' | 'button' }`, `single_key_shortcuts_toggled { on }`, `motion_setting_changed { value }`, and an environment ping with media-query flags only (`prefers-reduced-motion`, `forced-colors`, `prefers-contrast`, width class). **Never try to detect a screen reader**, and never log titles (they can contain lead names).

**Acceptance criteria**
- [ ] The first Tab on a fresh load focuses "Skip to main content"; Enter focuses `main`; the next Tab reaches the first page-header control (KB-01).
- [ ] Every nav item is one tab stop; the nav has no focusable element without a name (AX-01, KB-01).
- [ ] Exactly one `nav[aria-label="Main"]` and one `main` in the accessibility tree at 1440, 1280, 1024, 768, 390 and 320 (AX-01).
- [ ] The current destination has `aria-current="page"` in the sidebar, rail, NavSheet, bottom bar and More sheet, including Settings sub-routes (AX-01).
- [ ] A client route change updates `<title>` per S §4.4 and moves focus to the H1 (KB-02).
- [ ] Rail tooltips appear on keyboard focus without delay and never clip (KB-01, VR-01).
- [ ] No `role="alert"` exists at page load on any route (LR-02).
- [ ] Turning single-key shortcuts off makes `[` and `?` inert and removes their keycaps (KB-11).
- [ ] At 390 × 844 with touch emulation, every shell target is ≥ 44 × 44 (TS-01).
- [ ] At 1024 × 690 with touch emulation (a landscape tablet), the nav is not in short mode: every rail item and every item of the expanded sidebar is ≥ 44 × 44, and all 12 destinations are reachable by scrolling the nav list (TS-01).

### 19.B Flow Designer

**Job.** Build, fix, test and publish a call flow without a pointer, and understand it without sight. Owners: FD1, FD §16, §20, §21.

**Findings addressed.** F-A11Y-001 (no keyboard edit or connect), F-A11Y-007 (focus and selection invisible), F-A11Y-011 (toolbar menus), F-A11Y-019 (node text contrast), F-A11Y-027 (shortcuts dialog and editor focus), F-A11Y-028 (creation-order tab order, id names, unnamed minimap), F-FLOW-001 and F-UX-024 (3.3.4), F-FLOW-008, F-FLOW-011, F-FLOW-020, F-FLOW-024, F-RWD-003.

**Hierarchy for assistive tech.** 1st: the flow name (H1) with its state ("Draft, 3 unpublished changes · Live, version 7"). 2nd: the issues chip and Publish. 3rd: the canvas (entered at the first Trigger) or, equivalently, the Outline. 4th: the inspector for the step in focus. 5th: the Problems bar.

```
Desktop ≥ 1440 (focus mode: rail nav, no Baseline)            F6 cycles: header → canvas → inspector → Problems
┌[1] Skip to canvas  [2] Skip to Outline ─────────────────────────────────────────────────────────────┐
│nav│ header: [3] Flows / h1 Site-visit qualifier ▾ [4] Draft · 3 changes ▾  Saved 11:24 am  Live v7   │
│56 │         [5] Undo [6] Redo [7] Tidy · · · [8] 1 warning [9] Test [10] Publish v8… [11] ⋯          │
│   │ phase ruler: [12] Trigger 2 → Logic 1 → Action 2 → Outcome 4 (toolbar of toggles) · [13] Compare │
│   ├ toolbar ┬ section "Canvas" (h2 hidden) ─────────────────────┬ aside "Ask about a site visit" ──┤
│   │[14] 1   │ [15] ONE tab stop, roving in call order:          │ [16] tablist Configure · Test data│
│   │ stop,   │  Trigger #1 → Logic #9 ▣ (focus + selected)        │ Label [17] · Agent asks [18]      │
│   │ ↑ ↓     │     ↓ sockets: Yes ◉ · Later · No · No reply ┄     │ Answers: Yes → Go to [19] ▾ …     │
│   │         │  → Action#3 → Outcome#4 …   minimap aria-hidden    │                                  │
│   ├─────────┴ region "Problems": [20] ⚠ 1 warning · Go to step · [21] Outline · [22] Test panel ──────┤

Laptop 1024–1279: same order; the inspector overlays the canvas from the right and pans the focused step into view.
Tablet 768–1023 (Review mode)                   Phone < 768 (Outline is the page)
┌ TopBar: ☰ · h1 · ₹ chip · Search ─────────┐   ┌ ‹ Flows · h1 Site-visit q… · ₹ ┐
├ header: Draft ▾ · Live · ⚠1 · Test · Publish · ⋯┤ │ Draft · 3 ▾ · Live v7 · ⚠1 [⋯]│
├ Notice: "Editing steps needs a screen at least  ┤ │ tree "Flow outline" (readOnly)│
│ 1024 px wide. You can review, test and publish."│ │  ◇ Ask about a site visit ⚠1  │
├ tree "Flow outline" 320 ┬ canvas (read) ──┤   │    ▾ Yes → □ Book site visit  │
│ ◖ Inbound call (readOnly)│ steps focusable │   │ [Test]  [Publish v8…] 44 px   │
│ ◇ Ask about a site visit│ Enter opens a   │   │ BottomBar (nav "Main")        │
│   ▾ Yes → □ Book visit  │ read-only sheet │   └───────────────────────────────┘
└─────────────────────────┴─────────────────┘
```

**Components.** Flow header, phase ruler, tool rail, canvas steps (Trigger, Logic with AnswerRows, Action, Outcome) and sockets (FD1); Outline (`tree`), Connect to… (Combobox), Go to [step] (Select), inspector (`aside` + PanelTabs + Field), Problems bar, Publish gate (Sheet 640), SaveState, VersionChip, `?` Dialog `lg`, Toast (Undo, publish), ShortcutProvider scopes `canvas` and `outline`.

**States**

| State | Visible | Assistive tech |
|---|---|---|
| Loading | Canvas skeleton; editing and autosave off until hydrated | `aria-busy="true"` on the canvas section; focus stays on the H1 |
| First use (blank flow) | FD1 §13.2: the Trigger connected to the Outcome, a "+" on the connection and the card "What happens when the call connects?" with Add Speak · Add Question; issues chip "No issues" | The card is in the roving order right after the Trigger; its buttons are ordinary buttons; nothing is announced as an error |
| Partial (a check can't run) | "Couldn't check Google Calendar · Retry" | Problems panel marks the rule "not checked"; Publish check row blocking with Retry |
| Save failed | Chip "Couldn't save · Retry" (red, persistent); title prefix "Couldn't save" | One assertive announcement per failure streak |
| Offline | ConnectionBar; chip "Offline · 3 edits on this device" | Announced once; Publish `aria-disabled` "You're offline" |
| Interim I1 (before revisions) | Chips "Draft on this device · 3 changes", "Saved on this device 11:24 am"; "Not saved · this tab only" when storage is blocked | The `volatile` chip is announced assertively once; the H1 state reads "Draft on this device, 3 unpublished changes" |
| View only | `View only` tag; Publish hidden; "Duplicate to edit" | Inspector fields `readonly` (focusable, copyable); step names end in "view only" |
| Success (publish) | Toast "v8 is live on 1 number and 1 batch · Roll back to v7…" (kind `publish`, 6 s; Roll back stays in the version menu, O §9) | Polite; focus returns to the Publish button, now `aria-disabled` "Nothing to publish. Your draft matches Live v8." The button is never hidden after a publish at any width (header, or the phone sticky bar), so focus never falls to `<body>` (§7.3) |

**Keys.** §9.6–§9.8. **Microcopy (before → after):** `?` sheet "Double-click to edit" → "Enter or double-click to edit" · "Edge from node_1785140237056 to node_178…" → "Ask about a site visit, answer Yes, to Book site visit" · "Green handle = VERIFIED, red handle = FAILED" → outputs "Verified · Failed · No reply", each with Go to · "YES — connects from bottom handle" → "Answer Yes · Go to [step ▾]" · palette "Add Speak node to canvas" (unconnected) → "Add Speak after Greeting" (inserted, connected, focused) · "KEYBOARD SHORTCUTS" → "Keyboard shortcuts".

**Responsive.** What each width can do is the one capability matrix, R §10.6. Editing needs ≥ 1024 CSS px. At 768–1023 (Review mode, including 200 % zoom on a 1920 screen) and below 768 (the phone Outline, including 200 % zoom on 1440 or 1280 screens), the Outline tree and the step sheet are `readOnly`: arrows, type-ahead and Enter work, editing keys (F2, A, C, Delete, Alt+↑/↓) are not bound and their menu items are not rendered, and the Notice or the sheet footer names the limit (FD §16.1, §21). Coarse pointers at ≥ 1024 get 44 px answer and result rows, so each socket's target is the 44 × 44 end of its row at 100 % zoom. Zoomed out, the same connections are made through Connect to…, Go to and the Outline (§15.1 rule 2). **Touch mode switch** (coarse pointers at ≥ 1024 only, R §10.9): a SegmentedControl, `role="radiogroup"` named "Touch mode", with radios "Navigate" (default, restored on every open) and "Arrange"; arrows move between them (§9.2); a change announces politely once ("Arrange. Drag steps to move them." / "Navigate. Drag to pan."). The switch only changes what a one-finger drag does: every keyboard path (§9.6–§9.8) works in both states, and Arrange adds no path that lacks a non-drag equivalent (Go to, Connect to…, `M` Move mode, Alt+Arrow).

**Telemetry (optional).** `flow_edit { via: 'canvas_pointer' | 'canvas_key' | 'outline' | 'inspector_goto' }`, `connect_to_opened { via }`, `outline_opened { width_class }`, `move_mode_used`. Counts only; no step text.

**Acceptance criteria**
- [ ] Keyboard only: create a flow, add Speak and Question steps, connect every answer, name them, test in text, publish through the gate and roll back, with no pointer event fired (KB-07).
- [ ] Tab enters the canvas at the first Trigger; one Shift+Tab leaves it; tab order equals graph order on the 26- and 35-step reference flows (KB-08).
- [ ] Focused, selected and focused+selected steps are distinguishable in both themes and in forced colours (VR-01, VR-02).
- [ ] No accessible name on the canvas or in the Outline contains an internal id (SR-04, automated name scan).
- [ ] Enter opens the inspector with focus on Label; Esc returns focus to the same step (KB-07).
- [ ] The `?` dialog opens with focus inside, is not clipped at 1440 × 900 or 1280 × 720, and returns focus to its opener (KB-11).
- [ ] At 100 % zoom, sockets have a ≥ 24 × 24 hit area on a fine pointer. Under touch emulation their rows are 44 tall and the hit area is ≥ 44 × 44, and adjacent rows' hit areas never overlap. At lower zooms every socket's job is reachable through Connect to…, Go to and the Outline (TS-01).
- [ ] No canvas text renders below 12 px at any zoom level (CT-03).
- [ ] With reduced motion, the test trace is skipped and reached steps are marked (VR-03).
