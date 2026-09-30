
---

## 9. Keyboard maps per complex widget

Each map lists the keys, the roles and the one-line reason. Single-key rows (marked ¹) obey the switch (§8.3). Where a component spec already fixes the map, this section restates it only as far as needed to test it and names the owner.

### 9.1 Shell navigation (N §1.9, S §3.8)

| Widget | Keys | Roles and names |
|---|---|---|
| Skip link | Tab (first stop) · Enter | link "Skip to main content" → `main` |
| Workspace switcher | Enter / Space / ↓ opens; menu keys (§9.13) | `button aria-haspopup="menu"`, name "Workspace: Sample Realty, Admin" |
| Search or jump | Enter opens the palette; ⌘K / Ctrl+K from anywhere | `button aria-keyshortcuts="Control+K"` (Meta on macOS) |
| Sidebar items | Tab / Shift+Tab (one stop each); Enter follows. **Arrow keys are not intercepted** (it is a list of links, not a menu) | `nav aria-label="Main"` › `ul aria-labelledby={group label}` › `a aria-current="page"` on the current item; badge text in the name ("Billing, wallet low") |
| Setup card | Enter | one link "Finish setup, 3 of 5 done. Next: add money" |
| Account menu | menu keys | contains Theme (radio items), the Single-key shortcuts switch (`menuitemcheckbox`), Sign out… |
| Rail (1024–1279) | Tab through items; tooltip shows on focus immediately; `[`¹ or the expand button opens the overlay; Esc, `[`¹ or scrim click closes; focus goes to the current item on open and back to the expand button on close | expand button `aria-expanded`, `aria-keyshortcuts="["` |
| NavSheet (768–1023) | Menu button opens; focus to the current item; Tab trapped; Esc closes, focus to the menu button | `role="dialog" aria-modal="true" aria-label="Navigation"` |
| Bottom bar (< 768) | Tab through 5 items; Enter follows | `nav aria-label="Main"`; items are links, More is `button aria-haspopup="dialog" aria-expanded` |
| More sheet | Focus to the current destination (or the first row); Tab trapped; Esc closes | `role="dialog" aria-label="More"`; rows are links with `aria-current` |
| Baseline | Tab through segment links | `role="region" aria-label="Workspace status"`; full names per segment (S §5.6) |

### 9.2 Tabs, segmented controls, radio groups (N §3.4, C §6.2–6.4)

| Widget | Keys | Roles |
|---|---|---|
| ViewTabs (Leads, Call reports views) | ←/→ move focus; Home/End; **Enter or Space selects** (manual activation: selection fires a server query) | `tablist aria-label="Views"` · `tab aria-selected aria-controls` · counts in the name ("Callbacks due, 18") |
| PanelTabs (sheet tabs, inspector Configure · Test data · Issues) | ←/→ move **and** select (automatic; local content) | as above; the panel is `tabpanel` |
| RouteTabs (Billing) | Tab between links; Enter follows | `nav aria-label="Billing sections"`, `aria-current="page"` |
| SegmentedControl, VoiceChoice, session mode, sentiment and status filters (single) | one tab stop; ←/→/↑/↓ move and select; Tab leaves | `radiogroup aria-label` · `radio aria-checked`; the selected item has a non-colour cue (raised key with `--control` border) |
| Multi-select chips, panel toggles | Tab to each; Space toggles | `button aria-pressed` |
| Disclosures (New task, "2 people", Show all checks) | Enter / Space toggles | `button aria-expanded aria-controls` |

### 9.3 Data tables, bulk bar, pager, record sheet (N §7.8–7.14, L §8, CR §2.8)

| Key (focus in the table body) | Does |
|---|---|
| Tab into the table | Focuses the active row (the last focused, else the first). The body is one stop plus the active row's controls |
| ↑ / ↓ · `J` / `K`¹ | Previous / next row (real focus, roving `tabindex`) |
| Home / End · PageUp / PageDown | First / last row on the page · one screen of rows |
| Tab / Shift+Tab from a row | Through that row's controls (checkbox, key link, Call…, ⋯), then out to the BulkBar and the pager |
| Enter | Opens the record sheet (native activation wins on buttons and links) |
| Space · `X`¹ | Toggles the row's selection |
| Shift+↑ / Shift+↓ · Ctrl/⌘+A | Extends the selection · selects every row on the page |
| `C`¹ | Opens the Call gate for the selection or the focused row (never dials) |
| Esc | Closes the open sheet, else clears the selection |
| Shift+F10 / context key | Row menu (the same items as `⋯`) |
| Sheet open: `J`/`K`¹ or Previous/Next, F6, Esc | Next or previous record ("Lead 5 of 38" announced) · move between table and sheet · close and return focus to the row |

Roles: `table role="grid"` labelled by the H1, hidden caption with the sort, `aria-rowcount`, `aria-rowindex`, `aria-multiselectable`, `aria-selected`, `aria-current="true"` on the open row; the BulkBar is `role="toolbar" aria-label="2 leads selected"` with arrow keys; the pager range is `role="status"`. **Phones** use list rows (a stretched key link per `li`) and a Select mode; there is no per-row Call button, so a mis-tap never dials (N §7.13).

### 9.4 Command palette (O §8)

⌘K / Ctrl+K opens from anywhere (including fields) and closes when pressed again · type to filter · ↑/↓ move the active option (wraps) · Enter runs it and closes · ⌘/Ctrl+Enter opens a record in its sheet without leaving the page · Esc clears the query, then closes and returns focus · Tab moves between the input and Clear only. Roles: `dialog aria-label="Search or jump"` › `combobox aria-expanded aria-controls aria-activedescendant aria-autocomplete="list"` › `listbox` with a `group` per section › `option`. Result counts are announced after typing settles. **Actions that cost or go live end in "…" and open their gate; the palette never dials, bills or publishes** (A2).

### 9.5 Gates: Call gate and Publish gate

The full keyboard, focus and announcement contract for every gate (Call, Publish, Add agent, money and form gates) is `spec/02-components-gate.md` §4.5 and §8; this table is its summary for the two most used.

| | Call gate (popover, modal) | Publish gate (640 px sheet, modal) |
|---|---|---|
| Opens from | `C`¹ on a row, "Call…", the bulk bar, the palette, the Cockpit's Place call… | "Publish v8…", the palette |
| Initial focus | The gate heading (`tabindex="-1"`). **Never the Start button**, so `C` then Enter cannot dial | The sheet heading |
| Inside | Tab through checks with actions (Include, Top up, Fix), the cost line, Cancel, Start | Tab through checks ("Go to step" links), the warning acknowledgement checkbox, the diff links, "Where it goes live", the note, Cancel, Publish |
| Confirm | ⌘/Ctrl+Enter anywhere in the gate, or Enter / Space on the focused **Start n calls** button | ⌘/Ctrl+Enter or the focused **Publish v8** / **Publish with 1 warning** |
| Blocked | Start is `aria-disabled` with the reason linked by `aria-describedby` ("Outside calling hours. Opens 10 am IST.") and stays focusable | Publish is `aria-disabled` with "Fix 2 errors to publish." |
| Close | Esc or Cancel; focus returns to the trigger | Esc or Cancel; focus returns to the Publish button |
| Announced | The readiness summary when it changes ("9 calls ready. 3 leads skipped."); the result after Start | The check summary when it changes; the publish result toast |

### 9.6 Flow canvas (FD §16.5, FD1): the only canvas key map

**This table is the one canvas key map.** Flow Designer part 1 §11, part 2 §16.5 and §18, the shell's `?` sheet and `07-motion` reference it and restate no keys; every row is registered once in the `ShortcutProvider` (§8.2, §8.4), which generates the `?` sheet and `aria-keyshortcuts`. The canvas is **one tab stop** with a roving `tabindex` in **call order** (depth-first from the first Trigger, answers in listed order, unreachable steps last; F-A11Y-028). Edges are not tab stops: they are reached and edited through their source socket or answer. One meaning per key: **Alt+Arrow always moves** (here, in the Outline, and in answer, case and column lists); issues use **Alt+.** and **Alt+,**.

| Key (focus on a step) | Does |
|---|---|
| Tab / Shift+Tab | Enter the canvas at the active step (first time: the first Trigger) / leave it in one press |
| → / ← | Follow the first output to the next step / go back along the connection you arrived by (else the first incoming) |
| ↑ / ↓ | Previous / next step in the same layer; on a step with answer or result rows, ↓ moves into its sockets |
| Home / End | First Trigger / last step in call order |
| Enter · F2 | Open the inspector with focus on Label; Esc in the inspector returns to the step |
| Space · Shift+Space | **Select only this step** (like a click) · **toggle** this step in the selection (like Shift+click) |
| Ctrl/⌘+A · Esc | Select all steps, notes and frames · clear the selection (a second Esc clears phase emphasis) |
| `C`¹ · `A`¹ | Connect to… · Add a step after, already connected |
| Delete / Backspace · Alt+Delete | Delete the selection with an Undo toast (F-FLOW-001) · delete and reconnect (one input, one output only) |
| Alt+Arrow · Alt+Shift+Arrow | Move the focused or selected steps 16 px · 64 px, instant, one undo entry per second of presses, announced "Moved Book site visit" |
| `M`¹ | **Move mode** (§16.1): arrows move 16 px, Shift+arrows 64 px, Enter places, Esc restores; the announced, discoverable path, also reachable from the step menu with a click-to-place single-pointer option |
| Alt+. · Alt+, | Next / previous issue: moves focus to that step and selects it (matched by `KeyboardEvent.code` Period / Comma, so macOS Option characters don't interfere; inert inside text fields) |
| ⌘/Ctrl+D · ⌘/Ctrl+C · X · V | Duplicate · copy · cut · paste |
| ⌘/Ctrl+G · ⌘/Ctrl+Shift+G | Frame the selection · ungroup |
| ⌘/Ctrl+F · ⌘/Ctrl+Z · ⌘/Ctrl+Shift+Z (Ctrl+Y) | Find · Undo · Redo |
| `+`¹ · `−`¹ · `Shift+1`¹ · `Shift+2`¹ · `Shift+0`¹ | Zoom in · zoom out · fit flow · fit selection · 100 % |
| Shift+F10 / context key | Step menu: Open · Add step after… · Connect to… · Move step · Duplicate · Delete step · Delete and reconnect |
| `O`¹ `V`¹ `T`¹ `?`¹ · F6 | Outline · Variables · Test panel · shortcuts · cycle header → canvas → inspector → Problems bar |
| `]`¹ · `[`¹ (compare mode only) | Next · previous change; the shell's `[` sidebar key is suppressed while the designer is open (S §3.8) |

| Key (focus on a socket, reached with ↓ on a step) | Does |
|---|---|
| ↑ / ↓ | Previous / next socket; ↑ from the first returns to the step |
| Enter · Space · `C`¹ | Open **Connect to…** for this answer or result |
| → | Follow this socket's connection to its target step |
| Delete | Remove this socket's connection (Undo toast) |
| Esc | Back to the step |

**Names** (FD §16.5): a step is named by its **stable number** and title first, then its call-order position: "#9 Ask about a site visit, step 3 of 14 in call order, Logic, Question. Answers: Yes goes to Book site visit; Later goes to Schedule callback; No goes to Polite close; No reply is not connected. 1 warning." Action result sockets: "Result Found of Find the buyer's record, goes to Ask about budget"; answer sockets: "Answer Yes, goes to Book site visit. Press Enter to change." or "Answer No reply, not connected. Press Enter to connect." Outcomes end "Sets lead to Interested". **The instruction string** (the only one; one shared hidden node referenced by `aria-describedby` from the canvas section and every step): "Arrow keys follow connections. Enter opens a step. C connects, A adds a step after, Alt and arrow keys move steps. Question mark lists all shortcuts." With single-key shortcuts off it drops the letter keys. Steps are `role="group" aria-roledescription="step"`; sockets are `<button>`s; the minimap is `aria-hidden="true"`; the canvas is a `<section>` with a visually hidden `h2` "Canvas" and **no `role="application"`** (§6.1). Focusing a step pans it into view (§7.4) and never zooms.

### 9.7 Outline (FD §16.2–16.3)

`role="tree"` labelled "Flow outline, Site-visit qualifier"; rows are `treeitem`s with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`; `aria-selected` mirrors the canvas selection. Keys: ↑/↓ rows · → expand or first child · ← collapse or parent · Home/End · typeahead · Enter opens the step in the inspector (a reference row jumps to its step) · F2 rename inline · `A`¹ add · `C`¹ Connect to… (answer rows) · Delete (Undo) · Alt+↑/↓ move within a chain (Alt+Arrow means move everywhere) · Alt+. / Alt+, next and previous issue · Shift+F10 row menu. Every edit announces its result ("Connected Yes to Book site visit").

### 9.8 Connect to…, Go to [step], inspector

- **Connect to…** is a Combobox popover (C §5.3) titled "Connect 'Yes' to…": type to filter (label, step number, synonyms) · ↑/↓ · Enter connects and closes · Esc closes; focus returns to the origin (step, socket, answer row) and the result is announced. Options are grouped by phase (`group` + label); the current target is "(current)"; "New step…" first; "Disconnect" last.
- **Go to [step ▾]** on every answer in the inspector is a Select (Radix) with the same options: Enter or ↓ opens, typeahead, Enter chooses.
- **Inspector** (`aside`): ordinary form order; PromptField never swallows Tab (Tab leaves the field; `{{` opens the variable menu, Esc closes it); Esc returns focus to the step unless a popover inside is open.

### 9.9 Transcript feed (N §12.4)

The feed is **one tab stop**: turns are focusable `li`s with a roving `tabindex` (this makes a 500-turn call cost one stop, not a thousand). ↑/↓ move between turns and read them (speaker, time, language, text) · Home / End first / latest turn (End re-pins follow mode) · Tab from a focused turn moves into its links (step, source, timecode) and then out of the feed · ⌘/Ctrl+F inside the panel opens transcript search; Enter / Shift+Enter next / previous match; Esc closes search and returns to the Search button. "Jump to latest · 2 new" is a normal button. Roles: `section aria-labelledby` › `ol aria-label="Transcript"` › `li lang="hi"` per turn. It is **not** `role="log"` (§12.3).

### 9.10 Recording player and talk strip (N §12.5)

`role="group" aria-label="Recording"`. Play / Pause, Back 5 s, Forward 5 s, speed and `⋯` are buttons. The scrubber is `role="slider"` with `aria-valuetext="00:41 of 02:31, Vaani speaking"`: ←/→ 5 s · Shift+←/→ 15 s · PageUp/PageDown 30 s · Home/End. Space or `K`¹ plays and pauses only while focus is inside the player and not on a button. Enter on a turn's timecode seeks and plays. Nothing is global.

### 9.11 Charts (N §11.8)

A static chart is one `role="img"` with a finding sentence. An interactive plot is one tab stop (`aria-roledescription="chart"`): ←/→ move between periods · Home/End · Esc hides the tooltip; a hidden polite region reads the focused period. **View as table** gives the same data as a table.

### 9.12 Pickers, upload, sliders (C §6.5, §7.1, §7.2)

Date and time fields are typed segments (↑/↓ change a segment, typing replaces it); the calendar opens with Alt+↓ and uses the grid keys (arrows by day and week, PageUp/PageDown by month). File upload is always a **Choose files** button (drop is an enhancement). Sliders: arrows, PageUp/PageDown, Home/End.

### 9.13 Menus, tooltips, toasts (O §6, §7, §9)

Menus: Enter / Space / ↓ open and focus the first item · ↑ opens at the last · ↑/↓ wrap · Home/End · typeahead · →/← submenus · Esc closes and returns focus · Tab closes and moves on. Tooltips: show on hover after 300 ms and on focus at once; Esc hides without moving focus; they never hold controls. Toasts: F8 focuses the newest; Tab reaches its action and Dismiss; Esc dismisses and returns focus.
