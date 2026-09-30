---

## 13. Traceability: finding → component

| Finding | Severity | Resolved by (section) |
|---|---|---|
| F-UX-001 org setup dead end · F-UX-006 "You're live" too early | critical · high | SetupCard in sidebar, NavSheet and MoreSheet; "Live" only after checks (§1.2, §1.8) |
| F-UX-002 / F-QA-004 Top up opens Profile · F-UX-028 banner on every page | high · medium | Wallet chip and nav badge link to `/billing?topup=1`; no global banner (§1.5, §1.6) |
| F-UX-003 demo intel beside a real lead | high | KeyValueList "Not captured" + source notes; CallHeader shows only this call (§8, §12.1) |
| F-UX-004 permanent "FLOW VALIDATED" · F-UX-005 no "what is live" | high · medium | Computed validation and lifecycle StatusTags (§5.3) |
| F-UX-007 / F-RWD-005 rail clips items at laptop heights | high | Sidebar ≥1280, rail 1024–1279, short-height mode, vertical-only scroll, current item scrolled into view (§1.2, §1.4) |
| F-UX-008 / F-RWD-001 phones reach 6 of 12 | high | BottomBar + MoreSheet, 12 of 12, Sign out in More (§1.8) |
| F-UX-009 17-column table, 50 of 121, mouse-only rows | high | Priority columns, Captured column, pinned columns, server pagination, focusable rows (§7.5–§7.11) |
| F-UX-010 transcript buried in a 373 px panel | high | Transcript tab first, player on top, one scroll container (§12.4, §12.5) |
| F-UX-011 metrics disagree, recordings unexplained | high | Shared metric definitions and `deltaTone`; recording unavailable reason (§4.7, §12.5) |
| F-UX-013 / F-A11Y-004 `c` dials a real call | high | "Call…" and `C` open the Call gate; shortcuts scoped and switchable (§7.8, §7.9) |
| F-UX-014 pickers save the default silently | medium | VoicePicker with separate "Make default" (§12.3) |
| F-UX-017 names, keyboard and active state inconsistent | medium | One nav config; `aria-current` by route prefix (§0.7, §1.3) |
| F-UX-018 fake "SYS: ONLINE" and latency | medium | Status footer removed; LineQuality only during calls, measured (§1.5, §12.2) |
| F-UX-026 CONNECT vs Test Call unexplained | medium | CallHeader states and LineQuality explanation (Cockpit page owns the call options) (§12.1, §12.2) |
| F-UX-029 no identity; unguarded sign-out | medium | WorkspaceSwitcher, AccountMenu, "Sign out…" confirmed (§1.2) |
| F-UX-030 no shell while loading; zeros as data | medium | Persistent shell; skeletons, never 0 (§1.14, §2.4, §4.6, §7.12) |
| F-UX-031 / F-QA-016 state not in the URL | medium | `useUrlState` for views, filters, sort, page, open record, sheet tab (§0.7) |
| F-UX-032 Delete under Call, stale drawer history · F-UX-035 destructive beside routine | medium | Destructive only in `⋯`; Timeline stale flags (§7.8, §10.4) |
| F-UX-036 range toggle scope unclear, stale cache | medium | One range in the header; "Showing data from…" (§3.9, §11.9) |
| F-UX-038 stale meeting rooms | medium | Meeting room StatusTag "Stale" (§5.3) |
| F-UX-042 / F-QA-023 empty audit ledger | medium | Timeline empty-audit state with retention (§10.4) |
| F-UX-046 no Mixed chip, wrong empty copy, blanks sorted first | low | Views incl. Mixed and Unscored; filtered-empty copy; blanks last; field · step labels (§3, §7.6, §7.7, §7.12) |
| F-UX-047 two equal primaries | medium | At most one primary per header (§2.2) |
| F-VIS-002 / F-A11Y-008 type below 12 px | high | 12 px floor everywhere, and the rem-base defect fixed (§0.4, §0.6) |
| F-VIS-005 no shared page header · F-VIS-034 no container | medium · low | PageHeader variants aligned to containers (§2) |
| F-VIS-009 Leads 44 % chrome, dead column | medium | Real table, chrome budget, density (§7.3, §7.4) |
| F-VIS-010 Analytics decoration inverts hierarchy | medium | One H1 style; chart titles as questions; no § markers (§2, §11.13) |
| F-VIS-011 deltas by sign, mustard neutral | medium | `deltaTone` by desirability; grey neutral sentiment (§4.7, §11.5) |
| F-VIS-012 distorted sentiment chart | medium | 1:1 drawing, 12 px labels, nice ticks, legend (§11.3–§11.6) |
| F-VIS-013 truncation with no way to read | medium | Truncation tooltips + detail sheet; BarList labels (§7.3, §11.11) |
| F-VIS-015 rail labels clipped | medium | Portal tooltips on hover and focus (§1.4) |
| F-VIS-016 no card, radius or elevation scale | medium | Card and tile tokens (§4) |
| F-VIS-017 20 badge styles · F-VIS-027 pill noise | medium · low | One Tag, one domain map, one tag per cell (§5) |
| F-VIS-023 seven empty-state styles | medium | Table, chart, timeline and feed states (§7.12, §10.4, §11.9, §12.4) |
| F-VIS-024 date and duration formats vary | medium | `lib/format.ts` (§0.7, §8) |
| F-VIS-029 STANDBY ring · F-VIS-030 call actions unclear | low | Call state components; no idle animation (§12.1) |
| F-VIS-032 sidebar polish · F-VIS-033 tablet sidebar pushes content | low | Grouped nav, Theme radio items, overlay rail and NavSheet (§1) |
| F-A11Y-002 call details mouse-only (critical) · F-A11Y-010 Leads rows | critical · medium | Focusable rows, Enter opens the sheet, Esc returns focus (§7.8, §7.9) |
| F-A11Y-012 no skip link, two stops per nav item | medium | Skip link; one stop per item; one stop for the table body (§1.9, §7.9) |
| F-A11Y-013 same title everywhere, silent routes | medium | `<title>` from config; focus to H1 (§1.9, §2.5) |
| F-A11Y-014 status changes not announced | medium | Shell announcer: counts, selection, call state, final turns (§0.7, §12) |
| F-A11Y-016 toggle states visual only | medium | Radio groups, `aria-pressed`, `aria-expanded`, check cues (§3, §12.3) |
| F-A11Y-017 nav semantics | medium | Labelled navs, `aria-current`, real tooltips (§1.9) |
| F-A11Y-018 table structure | medium | `<table role="grid">`, scope, `aria-sort`, caption, named action column (§7.14) |
| F-A11Y-019 low-contrast chips, dash fillers | medium | Status tints ≥5.47:1; solid empty-cell text (§5.2, §7.3) |
| F-A11Y-022 animations ignore reduced motion | medium | Only the live dot and real meters move; both stop (§5.4, §12) |
| F-A11Y-023 small targets · F-A11Y-024 unnamed icon buttons | medium | 24 px minimum, 44 on touch; names include the row (§7.3, §7.14) |
| F-A11Y-030 label-in-name, headings, order | low | DOM order = visual order; headings for panels (§2.5, §12.4) |
| F-RWD-002 Cockpit hides state at narrow widths | high | CallHeader and the TopBar chip at every width (§12.1) |
| F-RWD-004 / F-RWD-010 Call reports on phones | high · medium | ListRow, full-screen sheet, KPI strip (§4.8, §7.13) |
| F-RWD-007 / F-RWD-008 headers push the page sideways | medium | Wrapping header, overflow menu, `overflow-x: clip` (§2.7) |
| F-RWD-009 / F-RWD-012 search and chips overflow | medium | FilterBar responsive rules (§6.7) |
| F-RWD-011 Leads on phones | medium | ListRow keeps status and language; no row call button (§7.13) |
| F-RWD-016 Knowledge table clips actions | medium | Pinned actions column; ListRow below 768 (§7.5, §7.13) |
| F-QA-005 50 of 121 calls | high | Server pagination, server search, sort and filters (§6.3, §7.11) |
| F-QA-006 two legs per test call | high | "calls, not legs" scopes; "2 legs" disclosure (§4.5, §8) |
| F-QA-014 / F-QA-015 KPI and count scopes | medium | Server aggregates; scope lines; pipeline-wide view counts (§3.2, §4.5) |
| F-QA-019 funnel without fills | medium | Funnel component with linked, numbered steps (§11.11) |
| F-QA-037 stale queued calls | low | "Timed out" status and stale Timeline items (§5.3, §10.4) |

---

## 14. Acceptance checks (add to CI and visual regression)

| Area | Check |
|---|---|
| Foundations | `getComputedStyle(html).fontSize === '16px'`; an element with `font: var(--type-meta-12)` computes to `12px` (§0.6) |
| Shell | On 1366×768 and 1280×720 laptops, tested at their inner viewports 1366×657, 1366×625 and 1280×609 (`05-responsive` §2.1), all 12 destinations are visible without scrolling the sidebar; no horizontal scrollbar in sidebar or rail at 1024, 1280, 1440, 1920; rail tooltips appear on keyboard focus; the phone MoreSheet lists every destination not in the bar; the skip link is the first tab stop; one tab stop per nav item |
| Page header | No horizontal page scroll at 320, 360, 390 on any page; the primary action is visible at every width |
| Table | Keyboard e2e: Tab to the table, ↓↓, Enter opens the sheet, Esc returns focus to the same row (F-A11Y-002); with 120 fixture calls the oldest is reachable through the pager (F-QA-005); pressing `c` never sends a call request; blanks sort last; header and cell edges align (visual test); a pasted URL restores view, filters, sort, page and the open record |
| Tags and charts | Every tag and chart pair is in `check-contrast.mjs`; chart labels are ≥12 px at 390 and 1920; "View as table" exists on every chart |
| Transcript and player | Scrolling up pauses following and shows Jump to latest; at most one announcement per 2 s; Devanagari turns have no colliding matras (visual); Space does not start playback unless focus is inside the player |
| Motion and colours | Under `prefers-reduced-motion: reduce` no element animates except opacity fades; under `forced-colors: active` focus, selected rows, current nav items, the live dot and legend swatches stay visible |
| Gallery | `spec/components/data-nav.html` renders both themes with no console errors and no horizontal scroll at 390 |

---

## 15. Open questions for the product owner

1. **Foundations fix:** closed. `base.css` keeps the root at 100 % and CT-03 asserts it (§0.6).
2. **Line quality thresholds** (§12.2): confirm the Good / Fair / Poor boundaries and which leg is measured for phone calls (agent media leg vs carrier leg).
3. **Single-key shortcuts default:** on (current behaviour, now safe because `C` only opens the gate) or off for new users.
4. **Saved views:** personal only, or shareable with the workspace; who may edit a shared view.
5. **KPI desirability** (§4.7): confirm per metric, especially average duration and spend (proposed neutral).
6. **Phone calling from lists:** this spec removes the per-row Call button on phones (calls start from the sheet or the bulk bar). Confirm with sales operations.
7. **Backend data for voice components:** per-turn timestamps and language (direction §8 item 7) decide whether TalkStrip and per-turn marks show; confirm whether recordings get server-computed peaks for the Waveform variant.
8. **Transcript read-aloud default:** on by default (proposed) or opt-in.
9. **Recording downloads:** which roles may download, and whether downloads are masked (digest §5.7 item 9).
10. **Hindi chrome (v2):** bottom-bar labels were measured in English only ("Call reports" fits 320 px by under 1 px); Hindi labels will need a re-measure and possibly two-line labels.
11. **Sidebar collapse at ≥1280:** keep the remembered collapse to the rail (§1.4) or always show the labelled sidebar at that width.
12. **Token requests** (§0.5): closed. All are in `tokens.json` 1.1.0 and registered in 01-foundations §18.
