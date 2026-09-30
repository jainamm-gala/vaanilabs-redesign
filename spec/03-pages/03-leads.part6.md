## 7. States, with copy

One state matrix for every data view (direction §6.6): what the page says, what it offers, and what it never does (show `0` while loading, simulate data, or drop the shell).

### 7.1 Page

| State | When | What shows | Copy |
|---|---|---|---|
| **First use** | The workspace has no leads | Header (meta "No leads yet"), no ViewTabs, FilterBar, ViewSummary or pager; one `EmptyState` `first-use` in the table region (icon `users` 20) | Title "No leads yet" · body "Leads you add or import appear here with their status and last call." · **Import leads…** (primary) · **New lead** (secondary) · link "Download the CSV template" |
| **Loading (first)** | Before the first response | Shell, H1, header actions, ViewTabs labels and toolbar render at once; meta, tab counts and ViewSummary numbers skeleton; table skeleton after 200 ms (overlay §13.2 Table layout); pager "Loading…" | Hidden polite line "Loading leads…"; never "0 leads" (F-UX-030) |
| **Refreshing** | Sort, filter, page or view change | Rows stay; `aria-busy="true"`; result count and pager read "Updating…"; no dimming or spinner | — |
| **Partial: counts** | B2 failed, rows loaded | Tab counts render nothing; meta "Couldn't load counts · Retry"; ViewSummary "Couldn't load the summary · Retry" | — |
| **Partial: call details** | Rows loaded, last-call join failed | Section `Notice` warning above the table; Last call cells "–" with hidden "Not loaded" | "**Last call details couldn't load.** Statuses and names are current. Retry" |
| **Partial: missing capability** | B3, B4 or B5 not shipped | The column, filter and view are absent (not disabled, not "coming soon") | — |
| **Error (first load)** | The list request failed | Danger `Notice` in the body (`role="alert"`); header and toolbar stay | "**Couldn't load leads.** Check your connection and try again." · Retry |
| **Error (refresh)** | A refresh failed with data on screen | Warning `Notice` above the table (`role="status"`) | "**Showing leads from 11:24 am.** Couldn't refresh. Retry" |
| **Offline** | `ConnectionBar` offline | Cached rows with the stale Notice; Call…, New lead, Import…, Export, status changes and notes are `aria-disabled` with "You're offline" | Bar: "**You're offline.** Showing data from 11:42 am." |
| **No permission (page)** | The role cannot see leads | `Forbidden` inside the shell (overlay §16.1), no redirect | "Only admins and sales members can see leads. Ask an admin (2 in this workspace) to change your role." · Copy request link |
| **Wallet low or empty** | Server wallet state | `WalletNotice` under the header (§6.1); call actions disabled at ₹0 with the reason | "**Wallet is ₹0.** Phone calls are paused. Browser tests and free meeting minutes still work. Top up" |
| **Setup blocks calling** | No verified caller ID or no live flow | Page `Notice` warning; call actions disabled with the reason | "**Calls can't be placed yet.** Verify your calling number to call leads. Finish setup (3 of 5)" |
| **Calls in progress** | A batch from this page is running | Last call cells show `CallStateTag` live states; the Baseline segment "9 calls in progress"; the nav badge on Cockpit | — |

### 7.2 Table results

| State | Copy (EmptyState variant) | Action |
|---|---|---|
| Search matched nothing | `no-results`: "No leads match 'pune'." · "Search covers name, phone, email and city." | Clear search |
| Filters matched nothing | `filtered`: "No leads match Language Tamil and Last called in the last 7 days." · "1,284 leads are hidden by filters." | Clear filters |
| A view is empty | `done`, copy per view (§6.4) | per view |
| Page out of range | Info `Notice`: "Page 30 doesn't exist. Showing page 26." | — |
| Selection cleared by a change | Announcement only: "Selection cleared" | — |

### 7.3 Lead sheet

| State | Treatment and copy |
|---|---|
| Loading | Title from the row if known, else a skeleton; real tabs; sheet skeleton (overlay §13.2) |
| Not in the current results | Neutral Notice at the top: "Not in the current results. Clear filters" |
| Deleted or no access | Compact EmptyState: "This lead was deleted, or you no longer have access." + Close |
| Section failed | `SectionError` inside that tab: "Couldn't load calls. Retry"; the other tabs work |
| Status save failed | The Select reverts; StatusText danger "Couldn't save. Retry" beside it |
| Dirty (Edit details) | `UnsavedChangesBar` in the footer; closing asks inline: "Discard changes to Lead 1042? · Keep editing · Discard" |
| Phone masked | "+91 •••••• 0142 · Reveal" for permitted roles; others see no Reveal, hint "Only admins can see full numbers." |

### 7.4 Call gate

The states are G §4.1; Leads copy for each:

| State | Copy |
|---|---|
| Checking | Summary "Checking 12 leads…"; why-text "Checking…"; the primary `aria-disabled` |
| Ready | "9 calls ready · 3 leads skipped"; primary "Start 9 calls" |
| Adjusted | Amber `minus` marks with the reason and Include (G §2.1); the count and cost follow the skips |
| Blocked (in-gate rows only) | A red `x` row with its fix; primary `aria-disabled`; why-text such as "Calls can't start outside calling hours." (single lead: "This number is on the DND list. It can't be called for promotions.") |
| A global blocker appears while open | Wallet ₹0, offline or no caller ID never open the gate (§6.10). If one appears while the gate is open (for example the wallet reaches ₹0 through another batch), G §4.4 rule 2 applies: a blocking row at the top of Must pass ("Wallet is ₹0. Top up to place calls." · Top up), the primary disabled, the gate stays open |
| All skipped | "All 3 leads were skipped. Include some, or cancel." |
| Stale / Changed | "Checked 2 min ago · Recheck"; Start re-checks first; if anything changed: "Checks changed since you opened this. Review and start again." |
| Starting / failed / started | "Starting…" · "Couldn't start the calls. Nothing was dialled." + Retry (same idempotency key) · §6.10 Done |
| Estimate unavailable (B7 missing) | "9 calls · Rate ₹0.04/s" and the balance; no runway; one advisory row "Calling hours, DND and recent calls aren't checked here yet." (G §6.3) |

### 7.5 Import

| State | Copy |
|---|---|
| Rejected file | "Not a CSV or XLSX file. Choose another file." · "Larger than 5 MB. Split it into smaller files." |
| No phone column mapped | "Choose the column that holds phone numbers." (blocking) |
| Parse failed | "Couldn't read this file. Save it as CSV (UTF-8) and try again." · Details (row and message) |
| Ready | "1,212 rows are ready" + the skipped groups |
| Importing | "Importing… 820 of 1,212" |
| Done | "1,212 imported · 28 skipped" · Download skipped rows · View imported leads |
| Stopped | "Import stopped at row 820. 819 leads were imported." · Retry the rest · Download skipped rows |

### 7.6 Roles (proposed; the audit saw a member account only, so the owner confirms, §15)

| Action | Member | Admin |
|---|---|---|
| View, search, filter, save personal views | yes | yes |
| Call through the Call gate | yes | yes |
| New lead, edit details, status, callback, notes | yes | yes |
| Import | yes | yes |
| Export with masked numbers | yes | yes |
| Reveal or export full numbers (logged) | no: Reveal absent, the Export option reads "Full numbers · admins only" and is disabled | yes |
| Delete leads, share views with the workspace | no: the `⋯` item is disabled with "Only admins can delete leads. Ask an admin." | yes |

### 7.7 Toasts used on this page

| Kind (overlay §9) | Message | Action |
|---|---|---|
| success | "Lead added" · "Status changed to Interested" (from the sheet) · "Exported 38 leads" | Open · — · — |
| undo | "Set 12 leads to Contacted" · "Assigned Site-visit qualifier to 12 leads" · "Deleted 12 leads" · "Deleted note" | Undo (stays until dismissed) |
| progress | "Starting 9 calls" · "Importing 1,212 leads… 820 done" · "Preparing export of 8,400 leads…" | View in Cockpit · View · — |
| success (later) | "9 calls finished · 3 interested" · "1,212 imported · 28 skipped" | View results · View imported leads |
| error | "Couldn't set status for 12 leads. Nothing changed." · "Couldn't delete 12 leads. Nothing was deleted." | Retry |
| info | "Wallet is ₹0. Top up to place calls." (after `C` on a blocked page) | Top up |

---

## 8. Interactions and keyboard

### 8.1 Keyboard

Single-key shortcuts are handled on the table element (or the page for `/`, `N`, `?`), never on `window`; they never fire in inputs, textareas, selects, contenteditable, or on buttons and links for Enter and Space; and they stop when the user turns **Single-key shortcuts** off in the account menu, which also hides their keycaps (F-A11Y-004, data-nav §7.9, overlay §19).

| Key | Where | Does | Single-key? |
|---|---|---|---|
| `/` | Page, focus not in a field | Focus the search | yes |
| `Esc` | Search | Clear the text; a second Esc leaves the field | — |
| `↑` `↓` · `J` `K` | Table | Previous / next row (real focus, roving tabindex) | J/K yes |
| `Home` `End` · `PgUp` `PgDn` | Table | First / last row on the page · one screen of rows | — |
| `Enter` | Row | Open the lead sheet (native activation wins on buttons and links) | — |
| `Space` · `X` | Row | Toggle selection | X yes |
| `Shift+↑` `Shift+↓` | Table | Extend the selection | — |
| `Ctrl+A` / `⌘A` | Table | Select every row on the page (replaces today's bare `A`) | — |
| `C` | Table | Open the Call gate for the selection or the focused row. **Never dials** | yes |
| `Ctrl+Enter` / `⌘↵` | Call gate | Start the calls | — |
| `N` | Page | New lead | yes |
| `Shift+D` | Page | Standard / Compact | — |
| `J` `K` | Sheet open, focus in the table or the sheet header | Next / previous lead; the sheet follows; "Lead 5 of 38" announced | yes |
| `F6` | Sheet open | Move focus between the table and the sheet | — |
| `Esc` | Table | Close the sheet, else clear the selection | — |
| `?` | Anywhere outside a field | Keyboard shortcuts sheet | yes |
| `Ctrl+K` / `⌘K` | Anywhere | Search or jump: "Leads", "New lead…", "Import leads…", "Call Lead 1042…" (opens the gate) | — |
| `F8` | Anywhere | Go to the newest toast (Undo) | — |

**Retired:** `A` alone (select all, too easy to trigger before a bulk call) → `Ctrl/⌘+A` inside the table; for one release, pressing `A` in the table shows an info toast "Select all is now Ctrl+A." · `C` dialling → `C` opens the gate. The permanent shortcut strip is removed; shortcuts live in tooltips ("Call… C"), menus and the `?` sheet (P5).

### 8.2 Focus and pointer

- **One tab stop for the table body** (data-nav §7.9): Tab enters on the active row; Tab from a row moves through that row's controls (checkbox, lead link, Call…, ⋯), then to the BulkBar and the pager. 24 rows no longer cost 48 stops (F-A11Y-010).
- **Row click** anywhere except a control opens the sheet, unless text is being selected. Middle-click or ⌘/Ctrl-click on the lead link opens `/leads?lead=` in a new tab.
- **Checkbox clicks never scroll the table** (today a click on row 1 scrolled and checked rows 7 and 8, F-UX-032): no `scrollIntoView` on pointer focus.
- **Sheet focus:** opening moves focus to the sheet title; Esc returns it to the row's lead link, or to the next row if the lead was deleted (overlay §1.3). The inspector-style F6 applies.
- **Gate focus:** trapped; Esc and Cancel return focus to the trigger; after Start, to the trigger or the table's active row.
- **Dialogs** (New lead, Import, confirmations): the overlay focus contract; focus never lands on `<body>` (F-A11Y-005).
- **Hover** reveals row actions after nothing (no delay); on coarse pointers `⋯` is always visible and there is no hover state.
- **Touch:** no long-press gestures; selection is the explicit Select mode. Swipe on rows does nothing (it would compete with scrolling).

### 8.3 Micro-interactions (all within foundations §11)

| Moment | Motion |
|---|---|
| Row hover, selection fill | `background-color` over `--dur-fast` |
| Row actions reveal | `opacity` over `--dur-fast` |
| BulkBar enter / leave | `translateY(var(--shift-toast))` + `opacity` over `--dur-slow` / `--dur-fast`; fade only under reduced motion |
| View tab indicator | `transform` over `--dur-base`; jumps under reduced motion |
| Sheet (overlay mode) | slides from the right over `--dur-slow`; docked mode appears in one frame (no animated table width) |
| Call gate | fade + `--shift-popover` over `--dur-base` |
| Live call in a Last call cell | the LiveDot pulses only while that call is live; static under reduced motion |
| New or updated rows | no entrance animation, no highlight flash |

---

## 9. Microcopy: before and after

| Where | Before | After |
|---|---|---|
| H1 | LEADS | Leads |
| Header meta | 24 SHOWN · 24 TOTAL | 1,284 leads · synced 11:24 am |
| Header actions | REFRESH · EXPORT · IMPORT CSV · NEW LEAD | Export · Import… · New lead (Refresh only when stale, in ⋯) |
| KPI strip | OPEN PIPELINE · NEW 100% · INTERESTED+ · AVG INTEREST — | In this view · 38 leads · 31 open · 12 reached (32%) · 4 interested · avg interest 61 |
| Shortcut strip | SHORTCUTS / SEARCH J / K NAV X SELECT A SELECT ALL C CALL ESC CLEAR | Removed; tooltips such as "Call… C" and the `?` sheet |
| Search | Search by name, phone, or email… (press / to focus) | Search name, phone or city… (with a "/" keycap on fine pointers) |
| Search count | 24 / 24 SHOWN | 38 of 1,284 |
| Status chips | ALL · NEW · CONTACTED · INTERESTED · SCHEDULED · CONVERTED · NOT INTERESTED · LOST | Views: All · New · Callbacks due · Interested · Not reached; Filter › Status |
| Source chips | ANY SOURCE · ✎ MANUAL · ◎ DEMO · F FACEBOOK · IG INSTAGRAM · G GOOGLE · {} API | Filter › Source: Manual · Import · Website · Facebook · Instagram · Google · WhatsApp · API · Sample data |
| Selects | Any language · Any outcome, with titles "Reads metadata.extra.language until a schema column lands" | Filter › Language · Filter › Last call outcome (shown only when the data exists) |
| Table headers | LEAD · STATUS · INTEREST · CALL (9 px caps) | Lead · Phone · Status · Last call · Interest · Language · Flow (12 px, sentence case) |
| Status badge | NEW | New (with icon) |
| Empty interest | — (red dash) | Not scored |
| Row call button | phone icon, title "Call {name} (c)" | Call… (named "Call Lead 1042…", tooltip "Call… C") |
| Bulk bar | 24 SELECTED · VIKASH · VAANI · AUTO-DETECT · DEFAULT FLOW · CALL 24 | 24 selected · Call 24 leads… · Set status · Assign flow · Export · ⋯ |
| Drawer config | OUTBOUND CONFIG · VOICE VIKASH male / direct · Active flow (profile default) | Call gate › Settings: Site-visit qualifier v7 · Vaani · Auto language · Caller ID |
| Drawer actions | Call Now · WA · DELETE LEAD | Call… · WhatsApp… · ⋯ › Delete lead… |
| Call history | VOBIZ · QUEUED · 28 Aug, 11:45 pm | Phone call · Timed out · no update since 28 Aug, 11:45 pm |
| Drawer stats | INTEREST — · CALLS 1 | Interest: Not scored · Calls 3 (one count everywhere) |
| New lead | "ONE AT A TIME — FOR BULK, USE CSV"; placeholder with a sample person's name | "Add one person. To add many, use Import…"; no name placeholder; phone hint "10-digit mobile, like 98765 43210" |
| Import | Import leads · CSV / XLSX · PHONE COLUMN REQUIRED · "Canonical columns… folded into metadata.extra" · Template.csv · Verify & import | Import leads · "CSV or XLSX, up to 5 MB. A phone column is required." · "Extra columns are saved as custom fields." · Download the template (CSV) · Next: map columns · Import 1,212 leads |
| No match | "No leads match. Try clearing a filter, or import a CSV to seed your pipeline." | "No leads match 'pune'." / "No leads match Language Tamil…" + Clear filters; first-use copy only when there are no leads |
| Wallet banner | "Wallet empty — top up now to keep calls flowing." · Top up (to Profile) · Enable autopay | WalletNotice "Wallet is ₹0. Phone calls are paused…" · Top up (to the Top-up sheet) |
| Calling | a single `c` press, no confirmation | "Call 9 leads · Nothing dials until you start." · Start 9 calls |
