# Vaani Labs (vaanilabs.in): Manual Accessibility Audit B (keyboard, focus, semantics)

Auditor: va-a11y-manual (Accessibility Auditor B)
Date: 2026-09-26
Target: https://vaanilabs.in (live production, signed in as customer org "starvox labs"; signed-out /login tested in a separate, cookie-less browser context)
Browser: Chromium (Playwright, private window, viewport 1440x900 unless stated)
Screenshots: `C:/Users/Lenovo/Downloads/VaaniLabs.in/audit/screenshots/va-a11y-manual/`
Status: complete. The session stayed valid for the whole run and there were no LOGGED_OUT events. My window and the extra signed-out context were closed at the end.

---

## 1. Method

- **Keyboard only.** I drove every flow with `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, arrow keys and the product's own shortcuts (`/`, `j`, `?`, `[`). I never pressed `c` on Leads because it places a real call. After each key press a script read `document.activeElement` and recorded:
  - tag, role, type and accessible-name source (aria-label, label, title, placeholder or text)
  - `aria-pressed` and `aria-expanded`
  - `:focus-visible`, computed `outline` and `box-shadow`
  - bounding box
- **Visual checks.** I took screenshots of focus states and looked at every one. Visual judgements in this report come from those screenshots.
- **DOM and ARIA inspection.** I inspected landmarks, headings, `<label for>` association, `aria-live`/`role=alert` regions, dialog roles, `aria-current`, table semantics and React Flow attributes.
- **Reflow.** I set a 720x450 viewport as an approximation of 200% zoom on a 1440x900 screen.
- **Motion.** I emulated `prefers-reduced-motion: reduce` and counted running animations with `document.getAnimations()`.
- **Network guard.** All non-GET requests were blocked in my tab. Any "write" observed below was **attempted but blocked**. Whether the server would have persisted it is inferred.
- **No assistive technology was run.** I did not use NVDA, JAWS or VoiceOver. "Announced" and "not announced" statements come from the accessibility tree and ARIA semantics, not from listening to a screen reader.
- **Privacy.** Lead and customer names, phones and emails appear in screenshots on local disk only. They are not reproduced here.

WCAG references are to WCAG 2.2. Level is shown in brackets.

---

## 2. Summary

The product is **not operable by keyboard-only or screen-reader users for three core jobs**:

1. **Configuring a call flow (Flow Builder).**
   - The node editor opens only on a mouse click or double-click.
   - Pressing Enter or Space on a focused node selects it silently: no editor opens and nothing changes visually.
   - Connection handles are not focusable, so nodes cannot be connected.
   - Focused and selected nodes have **no visible indicator at all**.
2. **Reading a call's details and transcript (Call Reports).**
   - Table rows open the "Call Details" panel only on a mouse click.
   - Rows have no tabindex, link or button. The only focusable items in a row are "Re-analyze" and "Download CSV".
3. **Opening a lead (Leads).**
   - Rows are `div`s with `cursor:pointer`.
   - The drawer can only be reached through an undocumented-to-screen-readers `j`/`k` + `Enter` shortcut, which never moves DOM focus.

Problems that repeat across the app:

- Visible labels are **not programmatically associated** with inputs. Every form I inspected (login, New Lead, Customer Intel, Settings, Flow node editor, Personal Agents, Assistant) relies on placeholders or nothing.
- Modals and drawers **do not trap or return focus**.
  - In the New Lead modal, focus escapes to the blurred page behind the overlay. Escape then drops focus to `<body>`.
  - The Leads drawer, Call Details panel, Flow node editor and Flow shortcuts dialog never receive focus when they open.
- There is **no skip link**, and every sidebar item is **two tab stops** (an `<a>` wrapping a `div tabindex=0`). About 30 tab stops come before the first main-content control.
- **Every route has the same `<title>`**. On route change, focus stays on the sidebar link and nothing is announced.
- **Single-character shortcuts** can't be turned off or remapped, and one of them (`C` on Leads) places a real phone call.
- **Flow Builder attempts to write the flow (`PUT /api/flows/{id}`) without Save:** on page load (twice), after a 2-press keyboard nudge of a node, and (inferred) on leaving the page.
- At **200% zoom**, six of the twelve app sections disappear from navigation, the cockpit's Customer Intel form is removed, and the remaining controls overlap.
- **`prefers-reduced-motion` is ignored.** Four infinite animations keep running.

Things to preserve:

- Visible native focus rings on most buttons and links.
- `aria-pressed` on the Dashboard voice toggle and the Flow "Private" and "Full-screen" toggles.
- Well-labelled Flow toolbar and palette buttons, which give a keyboard alternative to dragging nodes.
- React Flow's built-in node and edge descriptions and live "moved node" announcements.
- The Leads `/` to search shortcut and the Escape-to-clear behaviour.
- The Show/Hide password toggle label.
- Focus moving into the New Lead modal on open.
- A proper `role=dialog aria-modal` for Flow keyboard shortcuts.

---

## 3. Detailed observations by area

### 3.1 Signed-out /login (separate cookie-less context)
Screenshots: `30-login.png`, `31-login-tabbed.png`, `32-login-showpw-focus.png`, `33-login-invalid-email.png`

**Structure**
- `lang="en"`.
- No H1. The only heading is H2 "Welcome Back".
- No `main`, `header` or `nav` landmark. The only landmark-ish element is a `<form>`.
- No skip link. `<title>` is "Vaani Labs - The Voice AI that speaks India", the same as every other page.

**Tab order (11 stops, then it wraps through `<body>`)**
1. "Back to home"
2. "VaaniLabs home" logo link
3. "Continue with Google" (`<a>`)
4. "Continue with Meta" (`<a>`)
5. email input
6. password input
7. "Show password" toggle
8. "Forgot your password?"
9. "Sign In" (submit)
10. "Sign in with Magic Link" (`button type=button`)
11. "Don't have an account? Sign up" (`button type=submit`)

The order is logical.

**Labels**
- The visible labels "EMAIL" and "PASSWORD" are not associated: `input.labels.length === 0`, no `aria-label`, no `aria-labelledby`.
- The accessible name falls back to the placeholder: "you@company.com", and "••••••••" for the password.
- The password placeholder looks like an already-filled password.

**Autocomplete**
- The email input has **no autocomplete** attribute.
- The password input has `autocomplete="off"`.
- Both work against password managers and WCAG 1.3.5 / 3.3.8.

**Show password toggle**
- `<button type="button" aria-label="Show password">`. The label flips to "Hide password" and `input.type` flips to `text`. That part is good.
- Target size is **16x16 px**, and it sits inside the input.
- On focus: `outline: none`, `box-shadow: none`. The screenshot `32-login-showpw-focus.png` shows **no visible focus indicator**; the eye icon looks identical.

**Invalid email ("not-an-email")**
- Nothing happens on blur. There is no inline error.
- On Enter, Chrome's native bubble appears: "Please include an '@' in the email address…". Focus returns to the field.
- No `aria-invalid`, no persistent inline error text, and no `role=alert`/`aria-live` region in the page.
- The native bubble is transient and generally announced by screen readers, so this is acceptable at minimum. It is inconsistent with the app's visual language, and it vanishes.

**Input focus ring**
- `outline: none` plus `box-shadow: 0 0 0 2px rgba(47,99,224,0.14)`, which is a 14%-alpha halo with about 1.2:1 contrast against white. There is also a 1px blue border change.
- It is visible in screenshots but faint.

### 3.2 App shell: sidebar, banner, route changes
Screenshots: `01-dashboard.png`, `02-dashboard-tab14.png`, `06-sidebar-link-focus.png`, `07-sidebar-innerdiv-focus.png`, `95-sidebar-expanded.png`

**Landmarks**
- `ASIDE`, then `NAV` (12 items), then `NAV` (7 items, footer), then `MAIN`, then `HEADER`.
- On /settings there is a third `NAV` with 17 items.
- **No `nav` has an `aria-label`**, so a screen reader lists "navigation, navigation, navigation".

**No skip link.** No `a[href^="#"]` exists in the app.

**Sidebar item markup**
```html
<a title="Leads" href="/leads">
  <div tabindex="0"><svg/></div>
  <div>Leads</div>
</a>
```
- The text div has `opacity: 0; position: absolute` while collapsed.
- Every one of the 12 items therefore produces **two tab stops**: the `<a>` (name "Leads"), then a nameless, roleless `div` (a nested interactive element).
- The `<a>`'s focus ring is Chrome's default `auto` ring. Because of the sidebar's overflow clipping, only its top and bottom edges are visible (`06-sidebar-link-focus.png`). The inner div's ring is fully visible (`07-…`).

**No `aria-current`** on the active item in either the sidebar or the Settings sub-nav. The active page is shown only by a blue tint and a left bar.

**Dashboard tab count.** Tab stops before the first main-content control:
- 1 logo link
- 24 sidebar stops (12 links plus 12 inner divs)
- Sign Out
- Dark mode toggle
- Expand sidebar
- 3 wallet-banner controls ("Top up", "Enable autopay", "Dismiss")
- the flow `<select>`
- the refresh-flows button

That is about 33 stops before "Customer name".

**Sign Out** is a `button type=submit` placed right after the nav in the tab order, with no confirmation (I did not activate it). At 720 px it is relabelled "Exit" in the bottom bar.

**Wallet banner**
- `<div role="alert">` present on every route, so it is announced assertively on every page load (as of the observed markup).
- The "Dismiss" button is 22x22.

**Route change**
- Focusing the "Assistant" link and pressing Enter navigates.
- `document.title` stays "Vaani Labs - The Voice AI that speaks India".
- Focus stays on the sidebar link.
- No live region announces the new page.

**Expand sidebar**
- Button label toggles "Expand sidebar" / "Collapse sidebar". It has no `aria-expanded`.
- The title advertises a `[` shortcut. My `[` test was inconclusive: the width stayed 240 px.
- Expanded labels are readable, and the Collapse button's focus ring is a clear dark 2px ring (`95-sidebar-expanded.png`).

**Dark mode toggle.** `aria-label="Switch to dark mode"`. Not pressed. Cookies were unchanged.

### 3.3 Leads (/leads)
Screenshots: `10-leads.png`, `11-leads-slash-focus.png`, `12-leads-noresults.png`, `13-leads-tab-chips.png`, `14-leads-checkbox-focus.png`, `15-leads-checkbox-checked.png`, `16-leads-jk-nav.png`, `17-leads-after-enter.png`, `18-leads-drawer-after-esc.png`

**`/` shortcut.** From `<body>`, `/` focuses the search input. Good.

**Search**
- Named only by its placeholder: "Search by name, phone, or email… (press / to focus)".
- After typing a non-matching string, the count changes to "0 / 0 SHOWN" and "No leads match." appears. **Neither is in a live region**, so screen reader users get no feedback.
- Escape clears the query and keeps focus. Good.

**Tab order after search**
- 8 status chips
- 7 source chips
- 2 `<select>`s ("Any language", "Any outcome")
- per row: checkbox, then call button (2 stops per row, 48 stops for 24 rows)

**Filter chips**
- `<button type="submit">` with **no `aria-pressed`**. The selected chip ("ALL", "ANY SOURCE") is shown only by a tinted fill and border.
- Focus ring: 2.4px `auto` outline, visible.
- The "F FACEBOOK" chip got a different 0.8px ring, an inconsistency.
- Chip text includes decorative glyphs that become part of the name: "·ANY SOURCE", "✎MANUAL", "◎DEMO", "FFACEBOOK", "IGINSTAGRAM", "GGOOGLE", "{}API". A screen reader will read "F FACEBOOK", "I G INSTAGRAM", "curly brackets API".

**Filter selects**
- No label. The accessible name comes only from the `title` attribute, which contains **internal developer notes**:
  - "Filter by lead's preferred language. Reads metadata.extra.language until a schema column lands."
  - "Filter by most-recent call outcome. Populated as you open lead drawers; full-list join is a backend TODO."
- Focus shows `outline: none`.

**Row checkboxes**
- `<label><input type="checkbox"><span/></label>`. The native input is **1x1 px**, and the custom 16 px box is a sibling span.
- No accessible name: no `aria-label`, and the label contains only an empty span.
- The header "select all" checkbox is also nameless. Its `title="Select all visible"` sits on the `<label>`, not the input.
- **No visible focus indicator** (`14-leads-checkbox-focus.png`). The 0.8px outline is drawn around the 1x1 input and is invisible.
- Space toggles the checkbox and shows "1 SELECTED". That count is not announced.

**Rows**
- `<div data-lead-row data-index>` with `cursor: pointer`, no role and no tabindex. The list has no table or grid semantics, and the column headers "LEAD / STATUS / INTEREST / CALL" are visual only.

**Call buttons**
- Icon-only, named by `title="Call <lead name> (c)"`. The name is fine, but it is title-only.
- Focus ring is visible (2.4px).

**`j`/`k` navigation**
- Moves a thin 1px light-blue highlight border (`16-leads-jk-nav.png`).
- **DOM focus stays on `<body>`**. There is no `aria-selected`, `aria-current` or `aria-activedescendant`, so screen readers get nothing.

**Enter after `j`/`k`**
- Opens the lead drawer (`17-leads-after-enter.png`).
- The drawer is an `<aside>` with no role, label or `aria-modal`.
- **Focus stays on `<body>`**, and the next Tab goes to the list's checkboxes, not into the drawer.
- Escape did **not** close the drawer (`stillOpen: true`).

**Drawer contents**
- Close button: `aria-label="Close"`. Good.
- Voice choice "VIKASH / VAANI": buttons **without `aria-pressed`**. This is inconsistent with the Dashboard, which has it.
- Language `<select>`: **unlabelled**.
- Flow `<select>`: `aria-label="Flow for this call"`. Good.
- "Call Now", "WA" (title "Send WhatsApp"), "+15 MORE" and "DELETE LEAD" are all keyboard-reachable. I did not activate them.

**Single-key shortcuts.** The page advertises `/`, `J/K`, `X`, `A`, `C` (call), `Esc`. There is no setting to disable or remap them. When I typed "zzqx" into the search input, `x` was not intercepted, so the shortcuts appear to be suppressed inside inputs (inferred from one sample).

### 3.4 New Lead modal
Screenshots: `20-newlead-modal-open.png`, `21-newlead-modal-tabbed.png`, `22-newlead-empty-submit.png`, `23-newlead-invalid-values.png`

**Opening.** Enter on "NEW LEAD" opens the modal, and **focus moves to the Name field**. Good.

**Dialog semantics.** There are none: no `role=dialog`/`alertdialog`, no `<dialog>`, no `aria-modal`, no `aria-labelledby`. The title "New lead" is an **H3** directly under the page H1.

**Fields.** All 9 fields have `labels.length === 0`: Name, Phone, Email, City, Region/State, Source, Status, Notes, plus the buttons.
- Visible labels such as "NAME *" and "PHONE *" are unassociated.
- Name, Phone and Email are named by example placeholders ("Priya Sharma", "+91 98765 43210", "priya@example.com"). These read like real prefilled data.
- **City and Region/State have no placeholder at all, so they have no accessible name.**
- Source and Status `<select>`s are unnamed.
- `required` is set on Name and Phone. The asterisk is visual only, with no "required" legend.

**No focus trap.** After "Create lead", Tab goes to `<body>`, then the logo, then the sidebar links **behind the blurred overlay** (`21-newlead-modal-tabbed.png`). Focus becomes invisible and the user is lost.

**Close button.** The X at the top right has **no accessible name**: no aria-label, title or text.

**Escape**
- Closes the modal.
- **Focus is not returned to "NEW LEAD"**; it drops to `<body>`. I confirmed this twice: once immediately after opening, and once after typing.

**Validation**
- Enter on an empty form shows the native bubble "Please fill in this field."
- Entering "abc" in Phone and "not-an-email" in Email and blurring produces **no inline error**. The email field is `type=email`, so native validation would fire only on submit (not submitted).

### 3.5 Dashboard ("Agent Cockpit")
Screenshots: `01-dashboard.png`, `03-dashboard-tab45.png`, `04-input-focus.png`, `05-select-focus.png`, `97-dashboard-voice-toggle-focus.png`, `80/81-reduced-motion-*.png`

**Headings.** One H1 "AGENT COCKPIT". "CUSTOMER INTEL" and "TRANSCRIPT FEED" are styled text, not headings.

**Customer Intel form**
- Six inputs named only by placeholders: "Enter customer name", "+91 XXXXX XXXXX", "email@company.com", "Company name", "City, State", "e.g. HINDI / EN".
- The visible labels ("CUSTOMER NAME", "PHONE NUMBER" and so on) are unassociated.
- The prefilled values are real customer data. Once a value is present the placeholder disappears, so **the field has no name at all** for a screen reader, which hears only the value.

**Save button.** Visible text "SAVE CONTEXT", accessible name "Save customer context — agent will use this data". The visible phrase is not contained contiguously in the name (2.5.3).

**Flow selector**
- `<select aria-label="Select flow">`. Good.
- Focus shows `outline: none` with only a faint background tint (`05-select-focus.png`).
- The "Refresh flows" icon button is **14x14 px**, 6 px from the select.

**Voice toggle**
- Vaani/Vikash buttons have **`aria-pressed` true/false**. Good.
- Focus ring is clear (`97-…`).

**Phone input** (placeholder "+91...") is unlabelled. "Test Call" is `disabled` with no explanation (no `aria-describedby` or tooltip).

**CONNECT**
- Visible focus ring.
- Text colour is black on `rgb(47,95,224)`. My calculated contrast is about **4.15:1**, which is below 4.5:1 for 14px text. This is outside my brief and noted for the visual auditor.

**Status text**
- "SESSION: IDLE", "IDLE", "STANDBY" and "Awaiting connection..." are **not in live regions**.
- "TRANSCRIPT FEED" is not `role=log`. I checked the markup at 0 entries; that it won't announce live transcript lines during a call is inferred.
- A screen reader user would not hear call state or transcript updates during a live call (inferred; I did not connect).

**Tab order ends** at CONNECT, then goes to `<body>`. The transcript panel has no focusable content.

### 3.6 Flow Builder (/flow-builder)
Screenshots: `40-flow-builder.png` (mid-load), `41-flow-loaded.png`, `42-flow-node-focus.png`, `43-flow-node-moved.png`, `44-flow-tab-edges.png`, `45-flow-shortcuts.png`, `46-flow-node-click.png`, `47-flow-node-enter2.png`, `48-flow-node-keyboard-select.png`, `49-flow-node-focused-only.png`, `49b-flow-node-selected.png`

**Toolbar (good)**
- Icon buttons have explicit `aria-label`s with shortcuts: "Undo (Ctrl+Z)", "Redo (Ctrl+Shift+Z)", "Copy selected nodes (Ctrl+C)", "Paste from clipboard (Ctrl+V)", "Validate flow structure", "Preview AI script", "Full-screen canvas" (`aria-pressed=false`), "Show keyboard shortcuts", "More actions", "Destructive actions".
- "Private" has `aria-pressed=false`.
- The current-flow picker is named "Current flow: …". "AI draft" and "Settings" are named.
- A hidden duplicate "More actions" button (0x0) and a 0x0 duplicate set of 10 palette buttons exist in the DOM. They are harmless unless they become focusable.

**Palette (good)**
- "Add Speak node to canvas" and similar buttons, plus a "Filter node palette" input (`aria-label`).
- These give a click or keyboard alternative to dragging (2.5.7).

**Canvas controls (good)**
- React Flow Controls: "Zoom In", "Zoom Out", "Fit View", "Toggle Interactivity", in a group labelled "Canvas zoom and fit controls".
- The minimap is an `svg role=img` **without a name**.

**Nodes (26) and edges (27)**
- Nodes: `div[tabindex=0][role=group][aria-roledescription=node]` with `aria-describedby` pointing to "Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel."
- Nodes have no `aria-label`; the name is derived from their content ("Greet & Introduce Namaste! This is Vaani…").
- Edges are focusable `g[role=group]`, labelled like "Edge from start to greet" but also "Edge from node_1785140237056 to node_178…", which **exposes internal IDs**.
- 26 + 27 = **53 tab stops** in the canvas.
- Tab order follows DOM creation order, not the graph. Observed y-positions: 282 → 354 → 460 → 580 → 531 → 791 → 520 → 757 → 653…

**Visible focus on nodes: none.**
- Focused node: `outline: none`, `box-shadow: none`, inner border `rgb(225,230,239) 1.6px`, identical to unfocused (`49-flow-node-focused-only.png`).
- After Enter (keyboard select), the node is still identical (`49b-…`).
- Only a mouse click, which also opens the editor, gives the dark selected border (`46-…`).

**Keyboard move.** Enter selects, then ArrowRight ×2 moves the node from `translate(250px,30px)` to `translate(260px,30px)`. The React Flow live region announced "Moved selected node right. New position, x: 255, y: 30". Good.

**Autosave write.** Within about 1.5 s of that nudge, `PUT https://vaanilabs.in/api/flows/f9b04a18-…` was attempted (blocked).
- A `PUT` to the same URL was also attempted **on every page load (twice)**.
- One was attempted between leaving /flow-builder and the next navigation (inferred: fired on unload).
- The flow is written without the user pressing Save.

**Escape** after selecting a node moved focus to `<body>`, so focus was lost.

**Opening the node editor: not possible by keyboard**
- Enter and Space on a focused node leave the editor closed (`kbEnter: false`, `kbSpace: false`).
- A mouse click opens the "SPEAK NODE" editor panel.
- The shortcut sheet lists "Edit node label inline: Double-click", which has **no keyboard equivalent**.

**Node editor panel (mouse-opened)**
- Plain `div`, not a dialog or region, with an H3 "SPEAK NODE".
- Focus stays on the node.
- Fields "LABEL" (input) and "MESSAGE" (textarea) are **unlabelled** (`labels=0`, no aria).
- Buttons: "Collapse node editor" and "Close editor" (named, good) and "Delete Node".
- **Escape did not close the editor** (`afterEsc: true`), although the shortcut sheet says "Close panel / dialog — Esc".

**Connecting nodes: not possible by keyboard.** The 54 `.react-flow__handle` elements have no tabindex. The instruction text says "connect handles"; there is no keyboard path.

**Keyboard shortcuts dialog (`?`)**
- `role=dialog aria-modal=true`, labelled "KEYBOARD SHORTCUTS". Good.
- **Focus is not moved into it**; `activeElement` is `<body>`. Tab goes to canvas edges behind it.
- It is positioned inside the canvas container and **clipped**: the title is cut at the top by the toolbar, and the bottom rows (from about y=880) are cut off at 900 px height (`45-flow-shortcuts.png`).
- Escape closes it, but focus stays on `<body>`.

**Single-key shortcuts.** `F` (full screen), `?`, and `Backspace` (delete selected). Combined with autosave, a stray Backspace on a selected node (inferred) would delete it and trigger a write immediately.

### 3.7 Call Reports (/call-reports)
Screenshots: `60-call-reports.png`, `61-call-reports-tab.png`, `62-call-reports-detail.png`

**Table**
- Real `<table>`, 18 columns, 50 rows per page.
- No `<caption>`.
- `th` without `scope`. This is acceptable for a simple table, but 18 columns including 11 dynamic flow-field columns such as "Condition Check" ×4 make duplicate header names ambiguous.
- Sort state is shown only by the "▼" glyph in "Started". There is **no `aria-sort`**, and headers are not buttons (sorting by keyboard not possible or not discoverable).

**Rows**
- `tr` with `cursor: pointer`, no tabindex.
- Focusable per row: "Re-analyze" (title "Re-run AI analysis from scratch") and an icon-only "Download CSV" (title only, 24x24).
- **The row's detail panel cannot be opened by keyboard.**

**Mouse click on a row** opens the "CALL DETAILS" side panel: dialed number, status, duration, call ID, analysis and flow-builder fields.
- Not a dialog or region.
- Focus stays on `<body>`, and Tab continues through the table's row buttons.

**Controls**
- Search input: placeholder-only name ("Search transcripts, summaries…").
- Sentiment chips "All / Positive / Negative / Neutral": `type=submit`, **no `aria-pressed`**.

### 3.8 Settings (/settings)
Screenshots: `50-settings.png` (still loading at 3 s), `51-settings-loaded.png`, `52-settings-subnav-focus.png`, `53-settings-tab28.png`

**Headings.** H1 "SETTINGS", H2 "Profile Settings".

**Sub-nav**
- 17 items in an unlabelled `nav`.
- The current item "Profile" is a `<button>`; "Meetings Billing" and "Docs" are also buttons; the rest are `<a>`. Link and button semantics are mixed.
- No `aria-current`.
- Most items show an external-link "↗" icon, but they navigate in the same tab (`target=null`), which is misleading.

**Tab order**
- "Save Changes" (page header, top right), then the 17 sub-nav items, then Full name, Phone, subdomain "Edit", file input, "Connect Google Account" (y=862), then "Connect Microsoft Account" (y=830).
- The last two are in **reverse visual order**.
- Focus rings are visible (`52-…`).

**Labels.** Visible `<label>` elements exist ("FULL NAME", "PHONE", "SUBDOMAIN", "WHATSAPP BROCHURE", "GOOGLE ACCOUNT", "MICROSOFT ACCOUNT") but all have `for=""`. **No input is associated.** The file input is nameless apart from the browser's "Choose file" text.

### 3.9 Personal Agents (/personal-agents)
Screenshots: `90-personal-agents.png`, `91-personal-agents-newtask.png`

- "NEW TASK" opens an inline panel, not a modal. Focus stays on the button, which has **no `aria-expanded`**.
- Fields: "GOAL" textarea (placeholder-only name) and "CAPABILITY HINT (OPTIONAL)" select (unlabelled). Then "START TASK" and "CANCEL". I did not submit.
- After CANCEL, Tab leaves to `<body>` and then the sidebar.

### 3.10 Assistant (/assistant)
Screenshot: `96-assistant.png`

- Headings: H1 "Assistant", H2 "What can I do for you?".
- The chat textarea has only a placeholder name: "Ask me to build a flow, summarize calls, …".
- The file input is unlabelled. The attach and send icon buttons are named by `title` only ("Attach a file (…)", "Send"). Send is disabled until there is input.
- No message was sent, so I could not check `role=log` or `aria-live` on the transcript.

### 3.11 200% zoom approximation (720x450)
Screenshots: `70-zoom200-leads.png`, `71-zoom200-leads-search.png`, `72-zoom200-dashboard.png`

**Navigation**
- The sidebar is replaced by a fixed bottom bar (56 px) with only **Assistant, Agent, Leads, Reports, Billing, Knowledge, Exit**.
- **Analytics, Flow Builder, Meet Agent, Personal Agents, Rep Console and Settings are not reachable from any navigation** at this size.
- "Exit" is the Sign Out submit button.

**Screen space.** The fixed wallet banner (42 px) and bottom bar (56 px) take 98 of 450 px (22%) of the viewport permanently.

**Leads.** Reflows acceptably with no page-level horizontal scroll. The chip rows scroll horizontally in their own scrollers, and the `/` search stays visible.

**Dashboard**
- **The Customer Intel panel is removed from the DOM.**
- The Transcript Feed panel overlaps the voice toggle and phone field, and CONNECT overlaps the "Awaiting connection…" text.
- Nothing in `main` scrolls: `scrollHeight == clientHeight == 450`.

### 3.12 prefers-reduced-motion
- Without emulation: 4 running infinite animations on /dashboard.
- With `reducedMotion: 'reduce'`, after load, 4 infinite animations are still running:
  - CSS `breathe` (3 s) on "Awaiting connection…"
  - a framer-motion loop (3.2 s) on the sidebar logo
  - a 449x449 px pulsing ring (3 s)
  - the "STANDBY" label (2 s)
- One `@media (prefers-reduced-motion)` rule exists in the stylesheets, but it does not cover these animations.
- There is no pause or stop control.

---

## 4. Findings (ranked)

| ID | Title | WCAG | Severity |
|---|---|---|---|
| A11Y-MANUAL-01 | Flow node editing and connecting impossible by keyboard | 2.1.1 (A), 2.1.3 | critical |
| A11Y-MANUAL-02 | Flow nodes have no visible focus or selection state for keyboard users | 2.4.7 (AA), 2.4.11 | critical |
| A11Y-MANUAL-03 | Call Reports: call detail/transcript opens only on mouse row click | 2.1.1 (A), 2.4.3 | critical |
| A11Y-MANUAL-04 | Leads: rows not focusable; drawer reachable only via hidden j/k+Enter; no focus move, not a dialog, Esc doesn't close | 2.1.1, 2.4.3, 4.1.2 | high |
| A11Y-MANUAL-05 | New Lead modal: no dialog role, no focus trap, focus lost on close, unnamed close button | 2.4.3, 2.4.11, 4.1.2 | high |
| A11Y-MANUAL-06 | Visible labels not programmatically associated on every form; some fields have no name at all | 1.3.1, 3.3.2, 4.1.2, 2.5.3 | high |
| A11Y-MANUAL-07 | Leads row checkboxes: 1x1 px, unnamed, no visible focus | 2.4.7, 4.1.2, 2.5.8 | high |
| A11Y-MANUAL-08 | No skip link; each sidebar item is 2 tab stops (nested focusable div); about 33 stops to reach content | 2.4.1 (A), 2.4.3, 4.1.2 | high |
| A11Y-MANUAL-09 | Same `<title>` on every route; no focus management or announcement on route change | 2.4.2 (A), 4.1.3 | high |
| A11Y-MANUAL-10 | Flow Builder writes the flow without Save (on load, on keyboard nudge, on leave) | 3.3.4 (AA), 3.2.2 | high |
| A11Y-MANUAL-11 | Single-character shortcuts can't be disabled; `C` places a real call | 2.1.4 (A) | high |
| A11Y-MANUAL-12 | 200% zoom: 6 sections lose navigation, Customer Intel removed, controls overlap | 1.4.10 (AA), 1.4.4, 2.4.11 | high |
| A11Y-MANUAL-13 | Filter chips and voice choices lack `aria-pressed`; state conveyed by colour only | 1.3.1, 4.1.2, 1.4.1 | medium |
| A11Y-MANUAL-14 | Status changes not announced (search results, selection count, j/k row, call state, transcript) | 4.1.3 (AA) | medium |
| A11Y-MANUAL-15 | Persistent `role=alert` wallet banner announced assertively on every page | 4.1.3, 2.2.4 | medium |
| A11Y-MANUAL-16 | Login: `autocomplete=off` on password, none on email; toggle has no focus indicator and 16px target; no H1/main | 1.3.5, 3.3.8, 2.4.7, 2.5.8, 1.3.1 | medium |
| A11Y-MANUAL-17 | Flow shortcuts dialog and node editor: focus not moved in, not trapped, clipped, Esc leaves focus on body or doesn't close | 2.4.3, 1.4.10 | medium |
| A11Y-MANUAL-18 | Flow canvas tab order is DOM order, 53 stops, edge names expose internal IDs | 2.4.3, 2.4.6, 1.3.1 | medium |
| A11Y-MANUAL-19 | prefers-reduced-motion ignored; 4 infinite animations with no pause | 2.2.2 (A), 2.3.3 (AAA) | medium |
| A11Y-MANUAL-20 | Leads filter selects named by title containing developer notes; chip names include glyph noise | 2.4.6, 3.3.2, 1.3.1 | medium |
| A11Y-MANUAL-21 | No `aria-current`; three unlabelled `nav` landmarks; sidebar ring clipped | 1.3.1, 4.1.2, 2.4.7 | medium |
| A11Y-MANUAL-22 | Data lists lack table/grid semantics (Leads); Call Reports table lacks caption and aria-sort | 1.3.1 | medium |
| A11Y-MANUAL-23 | Targets under 24x24 px (show password 16, refresh flows 14, banner dismiss 22, checkbox 16) | 2.5.8 (AA) | low |
| A11Y-MANUAL-24 | Label-in-name mismatch, misleading ↗ icons, heading hierarchy, reversed tab order in Settings | 2.5.3, 1.3.1, 2.4.3, 2.4.6 | low |
| A11Y-MANUAL-25 | Sign Out (and "Exit" at 720px) is an unconfirmed one-keystroke action next to nav | 3.3.4 (advisory) | low |
| A11Y-MANUAL-26 | CONNECT label black on blue at about 4.15:1 | 1.4.3 (AA) | low |

### A11Y-MANUAL-01: Flow node editing and connecting impossible by keyboard (critical)

**Evidence**
- Keyboard route: focus a node with Tab, then Enter, then Space. The inspector stays closed (`kbEnter:false`, `kbSpace:false`).
- A mouse click opens the "SPEAK NODE" editor (`46-flow-node-click.png` vs `48-…`).
- The shortcut sheet documents editing only by "Double-click".
- All 54 `.react-flow__handle` elements are unfocusable (no tabindex), so there is no keyboard way to create an edge.

**Impact.** Keyboard, switch and voice-control users cannot configure or build call flows, which is the product's core authoring task.

**Recommendation**
- Make Enter on a focused node open the editor and move focus to its first field. Keep Space for selection.
- Add a keyboard "Connect…" command on a selected node (a button in the node toolbar or editor) that opens a list of target nodes and output ports.
- Make handles focusable buttons with names like "Output: TRUE of Condition Check (Residential)".
- Document these in the "?" sheet.

### A11Y-MANUAL-02: Flow nodes have no visible focus or selection state (critical)

**Evidence**
- Focused node: `outline:none`, `box-shadow:none`, border `rgb(225,230,239) 1.6px`, identical to unfocused (`49-flow-node-focused-only.png`).
- After Enter (selected), still identical (`49b-…`). In `44-flow-tab-edges.png` the 8th tabbed node is indistinguishable from the others.

**Impact.** Combined with arrow-key moves and Backspace-to-delete, users operate blind on a production flow.

**Recommendation**
- Add `.react-flow__node:focus-visible { outline: 2px solid <brand 600>; outline-offset: 2px }`.
- Give the selected state a distinct 2px brand border plus a tint, meeting 3:1 against the canvas.
- Apply the same to focused edges (a thicker stroke plus a halo).

### A11Y-MANUAL-03: Call Reports detail opens only by mouse (critical)

**Evidence**
- Tabbing through the table reaches only "Re-analyze" and "Download CSV" per row. `tr` has no tabindex.
- A row click opens "CALL DETAILS" (`62-…`) with focus left on `<body>`. The panel is not a region or dialog.

**Recommendation**
- Make the first cell (or the summary) a real `<button>`/`<a>` "Open call details, 23 Sept 06:13, 0:11, Completed", or make rows focusable with Enter to open.
- Render the panel as `role="dialog"` (non-modal side sheet with `aria-labelledby`) or a labelled `<aside role="region">`.
- Move focus to the panel heading on open, close it with Esc, and return focus to the triggering row.

### A11Y-MANUAL-04: Leads rows and drawer (high)

**Evidence**
- Rows are `div[data-lead-row]` with `cursor:pointer`, no role and no tabindex.
- `j`/`k` draws a 1px highlight while `activeElement` stays BODY. There is no `aria-selected` or `aria-activedescendant` (`16-…`).
- Enter opens the drawer `<aside>` (no role or label). Focus stays on BODY, and Tab continues in the list.
- Esc does not close the drawer.

**Recommendation**
- Make the lead name a `<button>` (or row link) that opens the drawer.
- If keeping `j`/`k`, move real focus (roving tabindex) to the row, or use a grid with `aria-activedescendant`.
- On open: `role="dialog"` (non-modal) or labelled region. Focus goes to the drawer heading (lead name), Esc closes it, and focus returns to the row.

### A11Y-MANUAL-05: New Lead modal focus management (high)

**Evidence**
- No `role=dialog`/`aria-modal`/`aria-labelledby`.
- Tab after "Create lead" goes to BODY and then the sidebar behind the blurred overlay (`21-…`), so focus is invisible.
- Esc closes and leaves focus on BODY in both tests.
- The X close button has no accessible name. The title is an H3.

**Recommendation**
- Use a dialog primitive (native `<dialog>` with `showModal()`, or Radix/Headless UI) with `aria-labelledby` pointing to "New lead" and `aria-describedby` pointing to the hint.
- Trap focus, make the background inert, return focus to "NEW LEAD" on close, and set `aria-label="Close"` on the X.

### A11Y-MANUAL-06: Form labels not associated (high)

**Evidence**
- `input.labels.length === 0` and no aria on:
  - login email/password
  - all 9 New Lead fields (City and Region have **no name at all**)
  - 6 Customer Intel inputs and the phone input
  - Settings Full name, Phone and file input (visible `<label for="">`)
  - Flow editor LABEL/MESSAGE
  - Personal Agents GOAL and CAPABILITY HINT
  - Leads drawer Language select
  - Assistant textarea
- Customer Intel inputs prefilled with values have no name at all.

**Recommendation**
- Make every visible label a `<label for=id>` (or wrap the input).
- Keep placeholders only as examples, and mark example values clearly ("e.g. …") so they don't read as real data.
- Add `autocomplete` tokens (name, tel, email, address-level2/1).
- Mark required fields with `aria-required` plus visible text ("required"), not just "*".
- Add a lint rule (eslint-plugin-jsx-a11y `label-has-associated-control`).

### A11Y-MANUAL-07: Leads checkboxes (high)

**Evidence**
- The native input is 1x1 px. The label has an empty `<span>`; the header's `title` is on the `<label>`. The accessible name is empty.
- No visible focus (`14-…`).

**Recommendation**
- Use `aria-label="Select <lead name>"` / "Select all visible leads".
- Style the custom box on `input:focus-visible + span` with a 2px ring.
- Make the clickable label at least 24x24.

### A11Y-MANUAL-08: No skip link; double tab stops (high)

**Evidence**
- 24 sidebar tab stops for 12 items (`<a><div tabindex="0">`). The inner div has no name or role.
- About 33 stops before "Customer name" on the Dashboard.
- There is no `a[href^="#"]` anywhere.

**Recommendation**
- Remove `tabindex` from the inner div.
- Add a first-in-DOM "Skip to main content" link that is visible on focus and targets `<main id="main" tabindex="-1">`.
- Consider moving the wallet banner's actions after the page header in DOM order, or into a landmark (`role="region" aria-label="Wallet"`).

### A11Y-MANUAL-09: Page titles and route announcements (high)

**Evidence**
- `document.title` is "Vaani Labs - The Voice AI that speaks India" on every page seen: dashboard, leads, flow-builder, settings, call-reports, assistant, personal-agents, billing, analytics, knowledge, meeting-agent, login.
- After keyboard navigation via the sidebar, focus stays on the link and there is no live announcement.

**Recommendation**
- Set per-route titles, e.g. "Leads · Vaani Labs" or "Flow Builder: Client A Realty (v2) · Vaani Labs".
- On route change, move focus to the page H1 (`tabindex=-1`) or announce "Leads page loaded" via a polite live region.

### A11Y-MANUAL-10: Flow Builder writes without Save (high)

**Evidence (all blocked by the guard; server effect inferred)**
- `PUT https://vaanilabs.in/api/flows/f9b04a18-…` on every /flow-builder load (2× per load observed).
- A `PUT` after two ArrowRight nudges of a node.
- A `PUT` observed after leaving the page (inferred unload save).

**Impact.** Keyboard users who cannot see focus (A11Y-MANUAL-02) and who may press arrows or Backspace by accident would persist changes to a live customer call flow with no confirmation, undo prompt or "unsaved" state. Meanwhile the UI shows "Up to date" and a separate Save button, which contradicts itself.

**Recommendation**
- Pick one model.
  - **Explicit save:** hold changes locally, show "Unsaved changes", and warn on leave.
  - **Autosave:** remove the Save button, show "Saving… / Saved" in a polite live region, and version every save with one-click restore.
- Never write on load.
- Require confirmation or offer undo for node deletion.

### A11Y-MANUAL-11: Single-character shortcuts (high)

**Evidence**
- Leads advertises `/`, `J`, `K`, `X`, `A`, `C` (call), `Esc`. Flow uses `F`, `?`, `Backspace`. The sidebar title advertises `[`.
- There is no setting to turn them off or remap them.
- `C` initiates a real outbound call (not pressed, per safety rules).

**Recommendation**
- Satisfy 2.1.4: add a "Keyboard shortcuts" preference (on/off, remap), or require a modifier (e.g. Alt+C / Ctrl+Enter to call).
- Restrict the call shortcut to when the row has focus, and add a confirm step for "Call".

### A11Y-MANUAL-12: 200% zoom reflow (high)

**Evidence**
- At 720x450 the bottom bar lists only Assistant, Agent, Leads, Reports, Billing, Knowledge and Exit. Analytics, Flow Builder, Meet Agent, Personal Agents, Rep Console and Settings are unreachable.
- The Dashboard Customer Intel panel is not in the DOM, and controls overlap (`72-…`).
- The fixed banner (42 px) and bar (56 px) take 22% of the height.

**Recommendation**
- Add a "More" item or a hamburger drawer exposing all 12 destinations plus Settings.
- Stack cockpit panels vertically with a scrollable `main`; never remove the form.
- Make the wallet banner non-sticky or collapsible under 600 px of height.
- Test at 1280x1024 @ 400% (320 px wide).

### A11Y-MANUAL-13: Toggle state not exposed (medium)

**Evidence**
- Leads status chips (8), source chips (7), Call Reports sentiment chips (4) and the Leads drawer VIKASH/VAANI choice are `button type=submit` with no `aria-pressed`. Selection is shown only by tint.
- By contrast, the Dashboard Vaani/Vikash buttons and the Flow Private/Full-screen buttons do have `aria-pressed`.

**Recommendation**
- Use `aria-pressed` for multi-select chips, or `role="radiogroup"` / `role="radio"` with `aria-checked` for single-select groups (status, sentiment, voice).
- Add a non-colour selected cue (check icon or weight).
- Set `type="button"`.

### A11Y-MANUAL-14: Dynamic updates not announced (medium)

**Evidence.** None of these are in a live region:
- "0 / 0 SHOWN", "No leads match."
- "1 SELECTED"
- the `j`/`k` highlight
- "SESSION: IDLE" / "STANDBY" / "Awaiting connection…"
- the transcript feed (not `role=log`)

The only live regions app-wide are the wallet `role=alert` and React Flow's own.

**Recommendation**
- Add a polite `role=status` for result counts, selection counts and save state.
- Make the transcript `role="log" aria-live="polite"`.
- Make call state a `role=status` region that announces "Connecting / Connected / Call ended".

### A11Y-MANUAL-15: Persistent role=alert banner (medium)

**Evidence.** `<div role="alert">` "Wallet empty — top up now to keep calls flowing." is rendered on every route and page load.

**Recommendation**
- Use `role="region" aria-label="Wallet status"` (or `role=status`) for the persistent banner.
- Reserve `role=alert` for new, time-sensitive errors.
- Remember dismissal per session.

### A11Y-MANUAL-16: Login authentication accessibility (medium)

**Evidence**
- Email has no `autocomplete`; password has `autocomplete="off"`.
- Show-password toggle: 16x16, `outline:none`, `box-shadow:none`, no visible focus (`32-…`).
- No H1 (H2 "Welcome Back") and no `<main>`.
- The error is a native bubble only, with no `aria-invalid`.
- The password placeholder "••••••••" looks filled.

**Recommendation**
- Use `autocomplete="username"`/`"email"` and `"current-password"`.
- Associate the labels, make the heading an H1, and wrap the form in `<main>`.
- Make the toggle 32x32 with a focus ring.
- Show inline errors with `aria-describedby` and `aria-invalid`.
- Remove the dotted placeholder.

### A11Y-MANUAL-17: Flow dialog and panel focus handling (medium)

**Evidence**
- `?` opens a proper `role=dialog aria-modal=true`, but `activeElement` stays BODY and Tab reaches canvas edges behind it.
- The dialog is clipped by the canvas container: the title is cut at the top and the rows below about 880 px are cut off (`45-…`).
- Esc closes it, but focus stays on BODY.
- The node editor is not focus-managed, and Esc doesn't close it, although the sheet says it does.

**Recommendation**
- Portal the dialog to `<body>` and centre it in the viewport with `max-height: 90vh; overflow:auto`.
- Focus its heading or close button, trap focus, and restore focus to the "?" button or the previously focused node.
- Wire Esc to close the node editor and return focus to the node.

### A11Y-MANUAL-18: Canvas tab order and edge names (medium)

**Evidence**
- 26 nodes plus 27 edges make 53 sequential tab stops, in creation order (y: 282 → 354 → 460 → 580 → 531 → 791 → 520 → 757 → 653).
- Edge names expose IDs, e.g. "Edge from node_1785140237056 to node_178…".
- The minimap `svg role=img` has no name.

**Recommendation**
- Sort focus order by graph order (topological, top to bottom).
- Consider making the canvas a single tab stop with arrow-key traversal between connected nodes.
- Label edges with node labels ("Edge from Greet & Introduce to Confirm Interest (YES)").
- Name the minimap or hide it from assistive technology.

### A11Y-MANUAL-19: Reduced motion ignored (medium)

**Evidence.** Under `prefers-reduced-motion: reduce`, 4 infinite animations run on /dashboard: `breathe` 3 s, the logo loop 3.2 s, the 449 px ring 3 s, and STANDBY 2 s. Only one reduced-motion media rule exists.

**Recommendation**
- Wrap all decorative loops in `@media (prefers-reduced-motion: no-preference)`.
- Use framer-motion `useReducedMotion()` / `MotionConfig reducedMotion="user"`.
- Stop idle-state pulsing after 5 s.

### A11Y-MANUAL-20: Filter select names and chip glyph noise (medium)

**Evidence**
- The language and outcome selects are named only by `title` attributes containing developer TODO notes ("Reads metadata.extra.language until a schema column lands"; "full-list join is a backend TODO").
- Chip names read "FFACEBOOK", "IGINSTAGRAM", "{}API", "·ANY SOURCE", "✎MANUAL".

**Recommendation**
- Use `aria-label="Filter by language"` / "Filter by last call outcome" and remove the internal notes from the UI.
- Put glyphs in `aria-hidden` spans.

### A11Y-MANUAL-21: Navigation semantics (medium)

**Evidence**
- No `aria-current` in the sidebar or the Settings sub-nav.
- Three unlabelled `<nav>` elements.
- Sidebar link focus ring clipped to its top and bottom edges (`06-…`).
- Settings sub-nav mixes `<button>` ("Profile", "Meetings Billing", "Docs") with `<a>`.

**Recommendation**
- Set `aria-current="page"` on the active link.
- Label the navs "Main", "Account", "Settings sections".
- Use `outline-offset: -2px` or remove `overflow` clipping.
- Use links for all sub-nav destinations.

### A11Y-MANUAL-22: Table and grid semantics (medium)

**Evidence**
- The Leads list is div-based with visual-only headers.
- Call Reports `<table>` has 18 columns, no caption, no `scope`, and sort indicated by "▼" text only (no `aria-sort`, header not a button). There are duplicate header names ("Condition Check" ×4).

**Recommendation**
- Use `<table>` (or `role=grid`) for Leads with a caption.
- In Call Reports, make sortable headers `<button>`s inside `<th aria-sort>`, and disambiguate dynamic field columns ("Condition Check: Residential").

### A11Y-MANUAL-23: Small targets (low)

**Evidence**
- Show password 16x16.
- Dashboard "Refresh flows" 14x14, 6 px from the select.
- Wallet "Dismiss" 22x22.
- Leads checkbox visual about 16 px.

**Recommendation.** Make every target at least 24x24 CSS px (ideally 32 to 40), or add spacing.

### A11Y-MANUAL-24: Naming and structure polish (low)

**Evidence**
- "SAVE CONTEXT" is named "Save customer context — agent will use this data".
- Section titles (CUSTOMER INTEL, TRANSCRIPT FEED, IDENTITY) are not headings. The New Lead title is an H3 under H1.
- Settings ↗ icons are shown on same-tab links.
- "Save Changes" comes before the sub-nav in tab order; Google and Microsoft connect buttons are in reversed focus order.
- The "NEW TASK" disclosure has no `aria-expanded`.

**Recommendation**
- Start accessible names with the visible text.
- Use H2 for panel titles.
- Drop the ↗ icons.
- Order the DOM to match the visual order.
- Add `aria-expanded`/`aria-controls` to disclosure buttons.

### A11Y-MANUAL-25: One-keystroke sign-out (low)

**Evidence**
- "Sign Out" (`button type=submit`, no confirm) sits in the sidebar tab sequence right after the nav.
- At 720 px it is labelled "Exit" in the bottom bar.
- Not activated during testing.

**Recommendation**
- Move Sign Out into an account menu, label it consistently "Sign out", and consider a confirm step or an undo window.

### A11Y-MANUAL-26: CONNECT label contrast (low; outside brief)

**Evidence.** Black text on `rgb(47,95,224)`, calculated at about 4.15:1.

**Recommendation.** Use white text (about 5.0:1) or darken the fill.

---

## 5. Strengths to preserve
- Most buttons and links show a clear native focus ring: call buttons, CONNECT, Vaani/Vikash, Settings sub-nav, Collapse sidebar, New Lead fields (1px blue border).
- The Dashboard voice toggle and the Flow "Private" and "Full-screen" toggles expose `aria-pressed`.
- Flow toolbar icon buttons have descriptive labels including shortcuts, and palette "Add X node to canvas" buttons give a non-drag alternative.
- React Flow a11y is left on: node and edge `aria-describedby` instructions, and a live announcement of keyboard node moves.
- Canvas controls are labelled (Zoom In/Out, Fit View, Toggle Interactivity) inside a labelled group.
- Leads: `/` focuses search, Esc clears, and the shortcut legend is visible.
- The login Show/Hide password toggle updates its accessible name.
- The New Lead modal moves focus to its first field on open. `required` is set on mandatory fields.
- The Flow shortcuts sheet uses `role=dialog aria-modal=true` with a label.
- `lang="en"` is set, and each app page has one H1.
- The expanded sidebar shows real text labels, and its state persists.

## 6. Open questions / not verified
- Actual screen reader output (NVDA/VoiceOver) was not tested; conclusions are from the accessibility tree.
- Whether blocked `PUT /api/flows/{id}` requests would have persisted on the server (on load, nudge, unload).
- Whether `j`/`k`/`x`/`a`/`c` are consistently suppressed while typing in any input. I saw one sample (search), where they were.
- The `[` sidebar shortcut behaviour was inconclusive.
- Transcript and call-state announcements during a live call could not be tested (CONNECT and Test Call are forbidden).
- Rep Console, Meeting Agent, Billing, Knowledge and Analytics were not keyboard-audited in depth. Their titles are identical (seen in tab lists); the rest is outside this brief's sample.
