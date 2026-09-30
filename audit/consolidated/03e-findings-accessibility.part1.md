## 3E. Findings — Accessibility (WCAG 2.2)

**Scope and method.** This section consolidates 68 accessibility findings from 12 agents into 30 findings. The main sources were an automated pass (axe-core 4.10.2, plus a custom scanner that composites alpha and ancestor opacity before computing contrast; A11Y-AUTO) and a manual keyboard, focus and semantics pass (A11Y-MANUAL). An adversarial verifier re-checked every high and critical finding in the live product, and its corrected severities are applied here. Some limits apply:
- No screen reader was run, so "announced" statements come from the accessibility tree.
- No call was placed, and the Leads `c` shortcut was never pressed.
- `/rep-console` was not audited, because it registers a live softphone.
- Default viewport was 1440x900, light theme, unless stated otherwise.

### Axe-core violations per page

| Page | axe violations (rule: nodes) | axe `incomplete` | Scanner: text failing AA | Controls without programmatic label |
|---|---|---|---|---|
| /dashboard | color-contrast 11; label-title-only 1 | contrast 26 | 26 / 52 (50%) | 7 / 8 |
| /assistant | color-contrast 5; landmark-unique 1 | contrast 1 | 5 / 33 | 1 / 1 |
| /analytics | color-contrast 2 | contrast 46 | 124 / 242 (51%) | 0 / 0 |
| /leads | **label 24 (critical)**; label-title-only 2; color-contrast 2 | contrast 112 | 131 / 240 (55%) | 1 + 24 row checkboxes |
| /flow-builder | color-contrast 9; aria-allowed-role 1 | contrast 22; aria-prohibited-attr 1 | 20 / 68 | 0 / 1 |
| /meeting-agent | color-contrast 37; **label 1 (critical)**; **select-name 1 (critical)** | contrast 2 | 64 / 111 (58%) | 4 / 4 |
| /personal-agents | color-contrast 8 | — | 8 / 39 | 0 |
| /call-reports | color-contrast 51; empty-table-header 1 | contrast 2 | 730 / 949 (77%) | 1 / 1 |
| /billing | color-contrast 12 | — | 12 / 46 | 2 / 2 |
| /knowledge | color-contrast 31; **label 1 (critical)** | — | 38 / 88 | 2 / 3 |
| /settings | color-contrast 29; **label 1 (critical)**; landmark-unique 1 | — | 32 / 66 | 3 / 3 |
| /login (signed out) | color-contrast 1; region 10 | contrast 14 | 7 / 15 | 2 / 2 |
| / (signed out) | color-contrast 8; heading-order 4; **scrollable-region-focusable 2 (serious)** | contrast 35 | 14 / 243 | 0 |

**Violation types across the 13 pages:**
- color-contrast: 13 pages.
- label / select-name (critical): 4 pages.
- label-title-only: 2.
- landmark-unique: 2.
- region, heading-order, scrollable-region-focusable, empty-table-header and aria-allowed-role: 1 each.

axe undercounts contrast. Most muted text sits on translucent surfaces, which axe files as `incomplete`, so the scanner column is the more reliable failure count.

**Passed on every page:**
- `lang="en"`.
- Zoom not blocked.
- 0 duplicate ids.
- 0 `<img>` without `alt`.
- 0 positive `tabindex`.

**Missing on every page:** a skip link and a unique `<title>`.

### Findings index

| ID | Sev. | Title | WCAG 2.2 |
|---|---|---|---|
| F-A11Y-001 | critical | Flow Builder nodes can't be edited or connected by keyboard | 2.1.1 A |
| F-A11Y-002 | critical | Call Reports details open only with a mouse | 2.1.1 A, 2.4.3 A |
| F-A11Y-003 | high | Form fields have no programmatic labels | 1.3.1 A, 3.3.2 A, 4.1.2 A, 2.5.3 A, 1.3.5 AA |
| F-A11Y-004 | high | Single-key shortcuts can't be turned off; `c` places a call | 2.1.4 A, 4.1.2 A |
| F-A11Y-005 | high | Modals and drawers: no dialog role, trap or focus return | 4.1.2 A, 2.4.3 A, 2.4.11 AA |
| F-A11Y-006 | high | Focus indicator missing or under 3:1 | 2.4.7 AA, 1.4.11 AA |
| F-A11Y-007 | high | Flow nodes show no keyboard focus or selection | 2.4.7 AA, 1.4.11 AA |
| F-A11Y-008 | high | Muted text token and 8–10px mono type fail AA | 1.4.3 AA, 1.4.4 AA |
| F-A11Y-009 | high | Primary buttons use black or ink text on blue (3.27–3.83:1) | 1.4.3 AA |
| F-A11Y-010 | medium | Leads rows unfocusable; drawer never gets focus | 2.4.3 A, 4.1.2 A |
| F-A11Y-011 | medium | Flow toolbar menus impractical by keyboard | 2.1.1 A, 2.4.3 A |
| F-A11Y-012 | medium | No skip link; 2 tab stops per sidebar item | 2.4.1 A, 2.4.3 A |
| F-A11Y-013 | medium | Same `<title>` on every route | 2.4.2 A |
| F-A11Y-014 | medium | Status changes not announced | 4.1.3 AA |
| F-A11Y-015 | medium | Wallet banner is a persistent `role=alert` | 4.1.3 AA, 2.4.3 A |
| F-A11Y-016 | medium | Toggle, selection and expansion state not exposed | 4.1.2 A, 1.3.1 A |
| F-A11Y-017 | medium | Nav: no `aria-current`, unlabelled navs | 1.3.1 A, 4.1.2 A |
| F-A11Y-018 | medium | Leads has no table structure; Call Reports table has thin semantics | 1.3.1 A |
| F-A11Y-019 | medium | Status chips, fillers and node titles under 4.5:1 | 1.4.3 AA |
| F-A11Y-020 | medium | Placeholders at 1.56–1.78:1 | 1.4.3 AA |
| F-A11Y-021 | medium | Marketing light-mode scrolled nav at 1.39:1 | 1.4.3 AA |
| F-A11Y-022 | medium | Reduced-motion preference ignored in app | 2.2.2 A |
| F-A11Y-023 | medium | Targets under 24px; touch targets far under 44px | 2.5.8 AA, 2.5.5 AAA |
| F-A11Y-024 | medium | Icon buttons unnamed on phones, or named by `title` only | 4.1.2 A |
| F-A11Y-025 | medium | Login blocks autofill; show-password toggle has no visible focus | 1.3.5 AA, 3.3.8 AA, 2.4.7 AA |
| F-A11Y-026 | medium | Heading and landmark gaps | 1.3.1 A, 2.4.6 AA |
| F-A11Y-027 | medium | Flow shortcuts dialog and node editor: focus never enters | 2.4.3 A, 2.4.11 AA |
| F-A11Y-028 | medium | Canvas tab order follows creation order; edge names show IDs | 2.4.3 A, 2.4.6 AA, 1.1.1 A |
| F-A11Y-029 | medium | Marketing home: scroll regions not focusable | 2.1.1 A, 1.4.3 AA |
| F-A11Y-030 | low | Label-in-name, heading and tab-order polish | 2.5.3 A, 1.3.1 A, 2.4.3 A |

---

### F-A11Y-001 — Flow Builder: nodes cannot be opened for editing or connected using the keyboard
- **Severity:** critical · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-01, A11Y-AUTO-11
- **Pages:** /flow-builder
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**. The handle size also bears on 2.5.8 Target Size (Minimum) (AA).
  - Enter or Space on a node reached with Tab only adds the `selected` class. The node editor never opens. A mouse click opens the "Speak Node" editor. The `?` shortcut sheet documents editing only as "Double-click".
  - All 54 `.react-flow__handle` connection handles are 9x9 CSS px, which renders at about 6.4px at the default fit zoom `scale(0.7119)`. They have no `role` and no `tabindex`, so there is no keyboard path to create an edge.
  - Adding a node from the palette by keyboard ("Add Speak node to canvas" + Enter) creates an unconnected node (the edge count stays at 27) and does not open its editor.
  - Verifier (live flow, 26 nodes and 27 edges) reproduced all of the above. Clicking a source handle and then a target handle does create an edge, so a single-pointer alternative exists and 2.5.7 passes. The keyboard gap remains. Keyboard, switch and voice-control users cannot build or change a call flow, which is the product's core authoring job.
- **Screenshots:** audit/screenshots/va-a11y-manual/46-flow-node-click.png, audit/screenshots/va-a11y-manual/48-flow-node-keyboard-select.png, audit/screenshots/va-verify-a11y-manual/49b-flow-node-enter.png, audit/screenshots/va-verify-a11y-manual/50-flow-palette-add.png, audit/screenshots/va-verify-a11y-auto/flow-click-connect.png, audit/screenshots/va-a11y-auto/flow-builder-loaded.png
- **Recommendation:**
  - Enter on a focused node opens the editor and moves focus to its first field. Space keeps its select behaviour. Esc closes the editor and returns focus to the node.
  - Add a "Connect to…" command on the selected node, as a node-toolbar button plus a shortcut such as `Ctrl+Shift+C`. It opens a listbox of target nodes and output ports and creates the edge. Add a matching "Remove connection" command for existing edges.
  - Make handles focusable `<button>`s with names such as "Output: YES of Confirm Interest". Give each a 24x24 hit area at the default zoom (an `::after` hit-slop keeps the visual size).
  - Document the keyboard equivalents in the `?` sheet. Add a keyboard-only Playwright test that builds a 3-node connected flow.

### F-A11Y-002 — Call Reports: call details and transcript open only with a mouse click
- **Severity:** critical · **Confidence:** verified
- **Source findings:** A11Y-MANUAL-03, A11Y-AUTO-07 (Call Reports part)
- **Pages:** /call-reports
- **Evidence:** WCAG 2.2: **2.1.1 Keyboard (A)**, **2.4.3 Focus Order (A)**, **4.1.2 Name, Role, Value (A)**.
  - The page has 1 `<table>` with 50 `<tbody>` rows per page. Each `tr` has `cursor:pointer` and a click handler, but no `tabindex`, no role, no link and no focusable cell.
  - The only focusable items in a row are "Re-analyze" (title "Re-run AI analysis from scratch") and an icon-only "Download CSV".
  - Tab order from the search box: 4 sentiment chips, then the Re-analyze and Download pairs row by row. `j`, ArrowDown and Enter from `<body>` do nothing.
  - A mouse click on a cell opens the CALL DETAILS panel (dialled number, status, duration, call ID, AI analysis, flow fields and transcript). Every ancestor of the panel up to `main` is a plain `div` with no role, label or `aria-modal`. Focus stays on `<body>`, and the next Tab goes to row 1's Re-analyze.
  - Verifier reproduced every point live. Keyboard and screen-reader users cannot read any call's outcome or transcript.
- **Screenshots:** audit/screenshots/va-a11y-manual/61-call-reports-tab.png, audit/screenshots/va-a11y-manual/62-call-reports-detail.png, audit/screenshots/va-verify-a11y-manual/62-call-reports-detail.png, audit/screenshots/va-verify-a11y-manual/30-call-reports-detail.png
- **Recommendation:**
  - Render the "Started" cell as a `<button>` named "Open call details, <date time>, <duration>, <status>", with Enter and Space opening the panel. Keep the row click for mouse users by delegating it to the same handler.
  - Render the panel as a non-modal side sheet: `role="dialog"` with `aria-labelledby` pointing to its heading, or `<aside aria-label="Call details">`.
  - On open, move focus to the panel heading (`tabindex="-1"`). Esc closes the panel, and focus returns to the row's button.
  - Add a keyboard-only e2e test: Tab to row 3, press Enter, read the transcript, press Esc, and assert that focus is back on row 3.

### F-A11Y-003 — Form fields have no programmatic label: placeholders act as names, and some fields have no name at all
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-AUTO-01, A11Y-MANUAL-06, QA-A-13 (unlabelled-field part), EXPLORE-SETTINGS-16 (label part), PUBLIC-SITE-13 (label part), PUBLIC-SITE-22
- **Pages:** /login (sign-in and sign-up), /dashboard, /meeting-agent, /settings (Profile, Calling number, Change email), /billing, /leads (list, New Lead modal, lead drawer), /knowledge, /call-reports, /assistant, /personal-agents, flow node editor, /pricing, /contact
- **Evidence:** WCAG 2.2: **1.3.1 Info and Relationships (A)**, **3.3.2 Labels or Instructions (A)**, **4.1.2 Name, Role, Value (A)**, **2.5.3 Label in Name (A)**, **1.3.5 Identify Input Purpose (AA)**.
  - axe critical violations:
    - `label`: /leads (24 row checkboxes), /meeting-agent (number input), /knowledge and /settings (file inputs).
    - `select-name`: /meeting-agent.
    - `label-title-only`: the Dashboard flow select and 2 Leads filter selects.
  - Scanner, controls without a label:
    - Dashboard 7/8, Meeting Agent 4/4, Settings Profile 3/3.
    - Billing 2/2, Login 2/2, Knowledge 2/3.
    - Call Reports 1/1, Assistant 1/1.
  - /login:
    - The `<label>`s have no `for`, and the inputs have no `id` or `name`.
    - The accessible names are the placeholders "you@company.com" and "••••••••", so the password field is announced as a string of bullets.
    - Sign-up mode has the same problem.
  - /dashboard Customer Intel: 6 text inputs and the dial `tel` input are named by their placeholders ("Enter customer name", "City, State", …). These don't match the visible labels ("CUSTOMER NAME"), which also fails 2.5.3 for speech-input users.
  - New Lead modal: all 8 inputs have `labels.length === 0`. City, Region/State and the Source and Status selects have no accessible name at all.
  - Leads: 25 checkboxes (24 rows plus select-all) have no name. The header's `title="Select all visible"` is on the `<label>`, not the input.
  - Meeting Agent: the Conversation Flow `<select>` and the slide-count number input have no name at all.
  - Settings: the `<label>`s have no `for` attribute.
  - Also placeholder-only or unlabelled:
    - Personal Agents GOAL textarea and CAPABILITY HINT select.
    - Flow editor LABEL and MESSAGE.
    - The lead-drawer Language select.
    - The Assistant composer.
    - Knowledge and Call Reports search.
    - Settings Calling-number and Change-email.
    - /pricing (14 fields; only its 3 selects have `aria-label`) and /contact (4 fields).
  - Verifier reproduced this on Login, Dashboard, Meeting Agent, Settings, Billing, Leads, Knowledge, Call Reports and Assistant. It downgraded A11Y-AUTO-01 from critical to high because `type=email` and `type=password`, plus nearby visible text, still convey each field's purpose, so no flow is fully blocked.
- **Screenshots:** audit/screenshots/va-verify-a11y-auto/login-signedout.png, audit/screenshots/va-verify-a11y-auto/dashboard.png, audit/screenshots/va-verify-a11y-auto/meeting-agent.png, audit/screenshots/va-a11y-auto/settings.png, audit/screenshots/va-a11y-auto/billing.png, audit/screenshots/va-a11y-manual/20-newlead-modal-open.png, audit/screenshots/va-public-site/pricing_full.png
- **Recommendation:**
  - Build one `<Field>` primitive that always renders:
    - `<label for={id}>`;
    - the hint through `aria-describedby`;
    - errors through `aria-invalid` plus `aria-describedby`;
    - `required` with a visible "(required)";
    - an `autocomplete` prop.
  - Migrate every form listed above to it, starting with Login, New Lead and Customer Intel.
  - Autocomplete tokens:
    - login: `email` and `current-password`;
    - sign-up: `new-password`;
    - profile, intel, New Lead, pricing and contact: `name`, `tel`, `email`, `organization`, `address-level2` and `address-level1`.
  - Checkboxes: put `aria-label="Select <lead name>"` and "Select all visible leads" on the `<input>` itself.
  - Selects: add a label or `aria-label` ("Filter by language", "Conversation flow", "Number of slides"), and stop relying on `title` for names.
  - Use placeholders only as neutral hints ("e.g. 10-digit mobile"), never as the name.
  - Enforce this in CI with `eslint-plugin-jsx-a11y` (`label-has-associated-control`, `control-has-associated-label`) and an axe run.

### F-A11Y-004 — Single-character shortcuts cannot be turned off, `c` places a real call, and the j/k selection is invisible to assistive technology
- **Severity:** high · **Confidence:** verified
- **Source findings:** A11Y-AUTO-06, A11Y-MANUAL-11
- **Pages:** /leads (primary), /flow-builder, global sidebar
- **Evidence:** WCAG 2.2: **2.1.4 Character Key Shortcuts (A)**, **4.1.2 Name, Role, Value (A)**.
  - Shortcuts in use:
    - Leads legend: `/` search, `J`/`K` navigate, `X` select, `A` select all, `C` call, `Esc` clear. Row call buttons are titled "Call <name> (c)".
    - Flow Builder: `F` full screen, `?` shortcut sheet, `Backspace` delete selected node.
    - The sidebar title advertises `[`.
  - One `window` keydown handler runs page-wide. It skips only INPUT, TEXTAREA, SELECT and contentEditable targets and keys pressed with Ctrl, Alt or Meta, and it has no enable flag.
  - Settings has 17 sections, and none mentions shortcuts. Pressing `j` while a filter-chip button had focus still moved the row highlight.
  - When a row has been picked with `j`, or a lead drawer is open, `c` calls `makeVobizCall` immediately, with no confirmation (read from the bundle; never pressed). A stray "c" from speech input or a mis-key starts a billable outbound call.
  - After `j`, focus stays on `<body>`. The row gets only `ring-1 ring-saffron/40`, a faint 1px border. There is no `aria-selected`, no `aria-activedescendant` and no live-region update.
  - Verifier confirmed all of this, and found more: while a row is highlighted, Enter on the focused NEW LEAD button opens that lead's drawer instead of the New Lead modal. The global handler hijacks Enter on buttons.
- **Screenshots:** audit/screenshots/va-a11y-auto/leads.png, audit/screenshots/va-a11y-auto/leads-after-j.png, audit/screenshots/va-a11y-manual/16-leads-jk-nav.png, audit/screenshots/va-verify-a11y-auto/leads-j-enter.png
- **Recommendation:**
  - Add a "Keyboard shortcuts" preference in Settings (on/off, and remap) and check it in the single handler.
  - Scope list shortcuts to the list: listen on the list container (`role="grid"`), not `window`, so they fire only when focus is inside it.
  - Take Call off a bare letter. Require `Shift+C` or `Ctrl+Enter`, followed by a confirm popover ("Call <name> now? Enter to confirm, Esc to cancel").
  - Never intercept Enter or Space when `event.target` is a button, link or form control.
  - Implement j/k as a roving tabindex that moves real focus to the row, or use `aria-activedescendant` on a focused grid with `aria-selected` on the active row.
