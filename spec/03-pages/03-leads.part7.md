## 10. Accessibility

WCAG 2.2 AA is the floor. Page-specific rules on top of the component specs:

| Area | Rule | Fixes |
|---|---|---|
| Landmarks and headings | One `h1` "Leads" (focused on route entry, `<title>` updated). The FilterBar search is a `role="search"` form. The table is labelled by the H1. The sheet title is its `h2`; Overview sections are `h3` | F-A11Y-013, F-A11Y-026 |
| Table semantics | `<table role="grid">` with a visually hidden caption stating the sort, `th scope="col"`, `aria-sort` on the sorted header only (others `none`), `aria-rowcount` and absolute `aria-rowindex`, `aria-multiselectable`, `aria-selected` on selected rows, `aria-current="true"` on the open row, a visually hidden "Actions" header | F-A11Y-018 |
| Names | Row checkbox "Select Lead 1042"; header checkbox "Select all leads on this page"; "Call Lead 1042…"; "More actions for Lead 1042"; Phone cells "Phone ending 0142" (the bullets are `aria-hidden`); Interest "Interest 82 of 100"; LanguageMark glyphs carry `lang` and the visible name; every IconButton has `aria-label` + tooltip, never `title` alone, and keeps its name at every width (`sr-only`, not `hidden sm:inline`) | F-A11Y-003, F-A11Y-024 |
| Keyboard | §8.1: every action has a key path and a visible control; shortcuts scoped and switchable; Enter and Space never hijacked on buttons | F-A11Y-004, F-A11Y-010, F-A11Y-012 |
| Focus visibility | Global 2 px outline; rows use the inset offset so the scroller never clips it; sticky header, toolbar and BulkBar never cover a focused row (`scroll-margin-top` / `scroll-padding-bottom`) | F-A11Y-006, WCAG 2.4.11 |
| Focus vs selection | Selection = accent-soft + inset bar; focus = outline; both show together | F-A11Y-007 |
| Announcements | Through the shell announcer, polite and debounced: "38 of 1,284 leads" after search or filter; "2 leads selected"; "Sorted by Last call, newest first"; "Showing 51 to 100 of 1,284"; "Lead 5 of 38" when J/K move the sheet; gate results "9 calls ready. 3 leads skipped."; "9 calls scheduled. Selection cleared."; row status changes only for the focused row. Never: timers, cost, wallet decrements | F-A11Y-014 |
| Status without colour | Every StatusTag and CallStateTag has a word and an icon; overdue callbacks say "Overdue"; gate marks pair ✓/✕/– glyphs with sentences and a hidden kind word (G §2.1) | F-A11Y-019, P2 |
| Contrast | Tokens only: headers `text-3` ≥ 4.70:1, tags ≥ 5.47:1, checkbox borders `--control` ≥ 3.06:1 even on selected + hover rows, Neel label 7.68:1 (light) and 6.21:1 (dark) | F-A11Y-008, F-A11Y-009 |
| Targets | ≥ 24×24 everywhere (checkbox hit area 24, 44 on touch); phone rows 56 tall; Delete never within 8 px of a routine control (it lives in `⋯`) | F-A11Y-023 |
| Dialogs and sheets | Radix Dialog / AlertDialog / Popover contracts (overlay §1.3–1.4); New lead's Esc on a dirty form shows the inline discard state instead of throwing input away | F-A11Y-005 |
| Language | `lang` on the Language cell glyph and on transcript excerpts in the Calls tab (`hi`, `hi-Latn`, `ta`…); names `translate="no"` | direction §4.5 |
| Motion | Only the live dot and the listed transitions move; all stop or fade under `prefers-reduced-motion` | F-A11Y-022 |
| Forced colours | Selected and open rows get the `Highlight` outline (`aria-selected`, `aria-current`); tags and gate marks keep `CanvasText` borders; the meter track and fill carry `data-mark` | direction §8 |
| Zoom and reflow | 200% and 400% zoom switch to the tablet and phone layouts with nothing lost and no sideways page scroll | WCAG 1.4.10, F-RWD-001 |

---

## 11. Responsive behaviour (summary)

| | Desktop ≥1440 | Laptop 1280–1439 | Laptop 1024–1279 | Tablet 768–1023 | Phone 320–767 |
|---|---|---|---|---|---|
| Navigation | Sidebar 232 | Sidebar 232 | Rail 56 (+ overlay) | TopBar + NavSheet | TopBar + BottomBar + More |
| H1 | PageHeader | PageHeader | PageHeader | TopBar title | TopBar title |
| Header actions | Export · Import… · New lead | same | same | `⋯` (Export, Import…) · New lead | Select · New |
| ViewTabs | row, counts | row | row | scrolling row | scrolling row |
| Filters | 3 tokens inline | 3 inline | 2 inline | in the Filter button (count) | Filter · Sort · scrolling tokens |
| ViewSummary | full line | drops from the end | drops from the end | 3 items | 2 facts in the header meta |
| Table | P1–P3 | P1, P2, Language | P1, P2 | P1, pinned key and actions | ListRow, two lines |
| Density | Standard / Compact | same | same | Touch when coarse | Touch |
| Lead sheet | Docked 440 | Overlay, non-modal | Overlay, non-modal | Modal, 560, full height | Full screen, Back link |
| Call gate | Popover 400 | same | same | Popover or bottom sheet | Bottom sheet |
| Call from a row | "Call…" on hover and focus | same | same | `⋯` › Call… | Sheet footer or selection mode |
| BulkBar | Floats above the pager | same | same | same | Docked above the BottomBar |
| Wallet | Baseline + WalletNotice | same | same | TopBar chip + WalletNotice | TopBar chip + one-line WalletNotice |
| Import | Dialog md → lg | same | same | lg, width min(720, 100% − margins) | Full screen; mapping rows stack (column name over its Import-as select) |

---

## 12. Telemetry hooks

Events carry ids, counts and enums only: **never names, phone numbers, emails or search text** (F-UX-045). Session replay is off on `/leads`, or masks every table cell, sheet body, gate body and form field (`ph-no-capture` on those containers), verified with a recorded test session; analytics cookies wait for consent.

| Event | Properties | Question it answers |
|---|---|---|
| `leads_view_selected` | view id, is_saved_view, count bucket | Which queues do operators work? |
| `leads_filter_changed` | field, operator, value count, result bucket | Are the right filters there? |
| `leads_search` | query length bucket, result bucket (no text) | Does search find people? |
| `lead_sheet_opened` | source (click, keyboard, deep link, jk), tab | Is keyboard flow used? |
| `call_gate_opened` | entry (row, bulk, sheet, shortcut, palette), n requested | Where do calls start? |
| `call_gate_outcome` | result (started, scheduled, cancelled, blocked), blockers, skipped by reason, includes clicked, n final, cost band, seconds open | Which checks block or adjust most; is the gate slow? |
| `call_request_without_gate` | — (must stay at 0; alert if not) | Is P3 intact? |
| `bulk_action` | action, n, undo used | Is bulk beyond calling useful? |
| `import_step` | step, rows, rows skipped by reason, duplicate policy, seconds | Where do imports fail? |
| `lead_created` | via (dialog, create-and-add-another), duplicate warning shown | Is manual entry clean? |
| `export` | scope, format, masked, n bucket | Who needs full numbers? |
| `shortcut_used` | key, context; `shortcuts_disabled` toggled | Keep single-key shortcuts on by default? |
| `density_changed`, `columns_changed` | value, column ids | Defaults right? |

---

## 13. Acceptance criteria

**Truth and safety**
- [ ] With 120 fixture leads, pressing `c`, `C` or Enter anywhere on the page sends **no** call request; `C` opens the Call gate (network assertion).
- [ ] Every call entry point (row Call…, sheet Call…, BulkBar, `C`, ⌘K) opens the gate; the only request that places calls is `POST /api/calls/batches` from **Start**, carrying a gate token and an idempotency key; a double click sends one request.
- [ ] At ₹0 wallet, every Call entry is `aria-disabled` with "Wallet is ₹0. Top up to place calls."; Top up opens the Top-up sheet (`/billing?topup=1`), never Profile.
- [ ] Outside calling hours, Start is disabled with the reason and Schedule is offered; a lead called in the last 24 h is skipped until Include; a Do-not-call lead is always skipped.
- [ ] The cost line shows a range with floor/ceil rounding or, without rate data, "Rate ₹0.04/s"; never a single estimate.
- [ ] Header meta, tab counts and ViewSummary match `/api/leads/stats` on page 2 at size 20 (the F-QA-015 case: "All 24", not 4).
- [ ] While loading, no count renders `0`; with B3, B4 or B5 absent, their column, filter and view are absent.

**URL and navigation**
- [ ] Reloading `/leads?view=interested&q=pune&f.language=hi&sort=interest:desc&page=2&size=25&lead={id}&tab=calls` restores view, search, filter token, sort, page, size, the open sheet and its tab.
- [ ] Back after Next page returns to page 1; Back after opening a lead closes the sheet.
- [ ] `/leads/{id}` redirects to `/leads?lead={id}`; a lead outside the current page opens with "Not in the current results".

**Layout and density**
- [ ] Measured at inner viewports (`05-responsive` §2.1, §17.1), Standard shows ≥ 16 full rows at 1440×900; ≥ 12 at 1366×657 (a 1366×768 laptop; views and Baseline folded, BaselineChip in the header); ≥ 11 at 1366×625 (with a bookmarks bar); ≥ 10 at 1280×609 (1280×720); ≥ 12 at 1536×730; ≥ 10 Touch rows at 1024×690 (iPad landscape); ≥ 8 ListRows at 360×780; ≥ 9 at the 390×844 mock size and ≥ 8 at 390×750 (iPhone Safari); ≥ 4 at 844×340 (landscape iPhone).
- [ ] Column headers stay visible while scrolling at every width ≥ 768 (F-RWD-012); header and cell edges align (visual test).
- [ ] Fit-by-priority: at 1440 with the sheet docked only P1 columns show; at 1024 with the rail P1 + Phone + Interest.
- [ ] No horizontal page scroll at 320, 360, 390, 768, 1024; no FilterBar overflow at 1024.
- [ ] No texture, gradient or blur on the page; the Interest meter is ink, not Neel; one filled Neel button in the header (and one in the BulkBar while it shows).

**Keyboard and assistive tech**
- [ ] Tab reaches the table in one stop; ↓↓ then Enter opens the sheet with focus on its title; Esc returns focus to the same row (Playwright).
- [ ] J/K move real focus (`document.activeElement` is the row); with the sheet open they change the lead and announce "Lead n of N".
- [ ] With "Single-key shortcuts" off, `/`, J, K, X, C, N and `?` do nothing and their keycaps disappear; modifier shortcuts still work.
- [ ] Enter on a focused New lead button opens New lead, never a lead (F-A11Y-004 verifier case).
- [ ] axe: 0 violations on the page, the sheet, the gate, New lead and every Import step, in both themes; every checkbox and icon button has a name at 390 px.
- [ ] Announcements fire for result counts, selection, sort, page range and gate results, at most one per 2 s per key.

**Records and bulk**
- [ ] Delete lead is only in `⋯` menus; ≤ 50 leads delete with an Undo toast (or a confirm without soft delete); > 50 or "all matching" require typing the count.
- [ ] Checking a row checkbox never scrolls the table.
- [ ] Set status and Assign flow apply to all selected leads, including a server-side "all 1,284" selection, and Undo reverts all of them.
- [ ] The Calls tab count equals the Cockpit's count for the same lead; a call stuck `queued` past the reaper window reads "Timed out".

**Import and forms**
- [ ] A `.txt` file, a 6 MB CSV and a CSV without a mappable phone column cannot reach "Import"; each shows its reason.
- [ ] The mapping preview shows per-group row counts that add up to the file's row count; skipped rows download as CSV.
- [ ] New lead: "abc" as phone shows "Enter a 10-digit mobile number, like 98765 43210." on blur; Esc on a dirty form shows the discard state; after Create, focus returns to New lead.

---

## 14. New components needed

| Component | Why | Spec here | Proposed home |
|---|---|---|---|
| **Gate / `CallGate`** | Was referenced as "the Gate spec" and did not exist; Leads needed its content | §6.10 is now configuration only | **Done:** `spec/02-components-gate.md` (CallGate single and batch, PublishGate, SetupTrack and the other variants share GateChecklist and GateCheckRow) |
| **`ViewSummary`** | Pipeline KPIs as one scoped line | §6.3 (Leads metrics) | Defined by `04-call-reports-analytics` §4.1; Leads follows it |
| **`PhoneText`** | Now specified in data-nav §5.8 (Hanken, tabular figures, never mono): masking format, `aria-label` "Phone ending 0142", Reveal (permitted roles, logged), Copy after reveal | §6.6, §6.9, §10 | data-nav §5.8 (done) |
| **`ImportDialog` + `ImportMapping`** | Core §7.2 hands off to "the Import mapping preview (data group)", which data-nav does not define | §6.12 | data-nav, next to DataTable |
| **DataTable fit-by-priority** | data-nav §7.5 shows columns by viewport breakpoint; with a docked 440 px sheet the viewport rule shows columns that don't fit. Columns join by **container width** in priority order | §6.6 | An amendment to data-nav §7.5 (container query `inline-size`) |
| **ListRow sort control** | Phone lists have no headers, so sort needs a control | §5.5 | data-nav §7.13, "Sort" bottom-sheet radio list |
| **ListRow tag height on touch** | Touch density lifts `--tag-h` to 24, which makes a two-line ListRow 64 px and drops 360×780 to 7 rows. Tags in a ListRow are not interactive, so they keep `--size-tag` (20): rows are 60 px, 8 fit at 360×780 (measured in the mock) | §5.5 | An amendment to data-nav §7.13 |

Token requests: none (01-foundations §18 lists every registered token). Every size here is an existing token or a `calc()` of one; the fit thresholds are sums of the column minimums and live in the table's column config, not in tokens.

---

## 15. Open questions for the product owner

1. **Status set.** Today's statuses are New, Contacted, Interested, Scheduled, Converted, Not interested, Lost; the domain map (data-nav §5.3) has New, Contacted, Callback due, Interested, Not interested, Not reached, Converted, Do not call. Proposed migration: Scheduled → Callback due (when a callback time exists) or Interested, Lost → Not interested. Confirm.
2. **Callbacks.** Does the Outcome step "Callback" write `callback_at`, and may operators set it by hand? Until it exists, the Callbacks due view is hidden (B5).
3. **DND and consent.** May a DND-registered lead be included when the workspace records consent (service or transactional calls)? Should Import require a consent attestation? Calling hours: one window per workspace, or per flow?
4. **Repeat-call window.** 24 h proposed for the "recently called" skip; per workspace or fixed?
5. **Batch limits and pacing.** Is there a maximum batch size or concurrency the gate should state ("Calls start in order within a minute")? Should very large "all matching" batches require Schedule?
6. **Roles.** Confirm the member/admin matrix in §7.6 (Reveal, full-number export, delete, shared views).
7. **Export threshold** for switching from direct download to a background job (5,000 proposed), and whether large exports are emailed.
8. **Single-key shortcuts default** for new users: on (safe now that `C` only opens the gate) or off (data-nav open question 3).
9. **Phone calling from lists.** This spec removes the per-row call button on phones (data-nav open question 6). Confirm with sales operations.
10. **WhatsApp…** in the sheet footer depends on the WhatsApp integration's template picker, which is outside this spec.

---

## 16. Traceability

| Finding | Resolved in |
|---|---|
| F-A11Y-004, F-UX-013 | §6.6 row actions, §6.7, §6.10, §8.1, §13 |
| F-VIS-009, F-RWD-012 | §5.0–5.1, §6.5, §6.6 |
| F-QA-015 | §3.2, §6.2–6.4 |
| F-QA-016, F-UX-031 | §3.1, §6.8, §13 |
| F-UX-032, F-UX-035, F-QA-037 | §6.6, §6.7, §6.9, §7.3 |
| F-A11Y-010, F-A11Y-018, F-A11Y-012, F-A11Y-014 | §6.6, §8.2, §10 |
| F-A11Y-003, F-A11Y-005, F-UX-025, F-QA-021 | §6.11, §10 |
| F-A11Y-008, F-A11Y-019, F-VIS-002, F-VIS-017 | §6.6, §10 |
| F-A11Y-016, F-A11Y-023, F-A11Y-024 | §6.4, §6.5, §6.10, §10 |
| F-RWD-011 | §5.5, §5.6 |
| F-QA-022, F-UX-016 | §6.12, §9 |
| F-UX-002, F-QA-004, F-UX-028, F-RWD-013 | §6.1, §6.10, §7.1 |
| F-UX-005, F-VIS-037, F-UX-014 | §6.5, §6.9, §6.10 |
| F-UX-030 | §6.2, §7.1 |
| F-UX-045 | §12 |
| F-VIS-006, F-VIS-022, F-VIS-031 | §6.2, §6.5, §6.6 |
