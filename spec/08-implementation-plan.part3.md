## 4. P1: tokens, components, shell and IA, highest-traffic pages

### P1-01 · Token pipeline and theming in the product (M1) · M · Depends: P0-13
- *Scope:* copy `spec/tokens/` into `design/` and wire `app/globals.css` in the F §15.1 order; `@theme` literals plus `@theme inline` colours, `--spacing: 4px` (the palette reset waits for M5); next/font Hanken Grotesk, JetBrains Mono (no preload), Noto Sans Devanagari by `unicode-range`, and the one-glyph rupee subset, all as variables on `<html>`; delete the 9 unused registrations; `THEME_BOOT` with `data-theme`, `data-motion` and the one-release legacy `html.dark` bridge; `base.css` in full (`html` at 100 %, `font` on `body`); remove the 21 OS-media `dark:` utilities; account menu Theme (System · Light · Dark) and Motion (Match system · Reduce motion).
- *Resolves:* F-VIS-008, F-VIS-036, F-VIS-021, F-VIS-004, F-VIS-002 (the floor's infrastructure), F-A11Y-022 (the reduced-motion infrastructure), DESIGN-SYSTEM-08, DESIGN-SYSTEM-11.
- *Spec:* F §1, §2.2, §15.1–§15.7, §18; D §5, §8.2; A11Y §14.3; M §9.4, §13.2.
- *Acceptance:* CI runs `node design/build-tokens.mjs && git diff --exit-code` then `check-contrast.mjs` (exit 0); CT-03 (`html` computes to 16 px, `meta-12` to 12 px); a unit test that the body font resolves to Hanken; VR-03 (media-query and attribute runs identical); a theme or motion change sends no network write.

### P1-02 · Lint and guard rails, with a ratchet · S–M · Depends: P1-01
- *Scope:* F §15.5 Stylelint/ESLint rules (no hex or colour functions outside `design/`, no arbitrary values, no raw palette classes, no `white/*`, no opacity on text, no `transition-all`, no `outline-none` without a replacement, `font-mono` only in the five token components, no deprecated `mono-20`, no new legacy names, every `var(--…)` names a registered token); A11Y LN-01 (`jsx-a11y`), LN-02 (house rules), LN-03 (duplicate key bindings); no raw `<button className>`/`<input>`/`<select>` outside `components/ui`; `toLocaleString` banned; R §17.3 breakpoint and `hidden` lints; the D §4.4 banned-strings lint. Rules are warnings globally and errors inside migrated folders.
- *Resolves:* F-VIS-020, F-VIS-006, F-VIS-035, F-UX-043, F-UX-016 (lint part).
- *Spec:* F §1.3, §15.5; A11Y §21.1; R §17.3; D §8.2.
- *Acceptance:* every rule has a failing fixture in CI; the migrated-folder list is the ratchet and never shrinks.

### P1-03 · Core controls · L · Depends: P1-01, P0-00
- *Scope:* in C §10 build order: Button and IconButton (codemod `.btn-*` and bespoke buttons), Field and TextInput, Checkbox, Radio, RadioCard, Switch, SegmentedControl, Select with the listbox popover, Kbd, PhoneInput (+91), CurrencyInput (INR, lakh grouping), NumberInput, SearchInput, PasswordInput, Textarea, Combobox, MultiSelect, FlowSwitcher, date and time pickers, Dropzone, SplitButton, ButtonGroup, RefreshButton; form layout and the one validation-timing rule on `react-hook-form` + `zod`.
- *Resolves:* F-VIS-006, F-VIS-018, F-VIS-019, F-A11Y-003, F-A11Y-006, F-A11Y-016, F-A11Y-024, F-UX-025, F-QA-021.
- *Spec:* C §1–§10.
- *Acceptance:* C §10 definition of done for each control (states in the gallery in both themes, snapshots including focus, axe, keyboard walkthrough, touch check at 390 × 844, forced colours, lint clean).

### P1-04 · Overlay and feedback · L · Depends: P0-00, P1-01
- *Scope:* finish the P0 slice and add the rest: Dialog, ConfirmDialog (tiers 2–3), Sheet (record, detail, gate, inspector), Popover, Tooltip, Menu and ContextMenu, CommandPalette, Toast, Notice, WalletNotice, ConnectionBar, StatusText, InlineError, Spinner, Skeleton, ProgressBar, StageProgress, EmptyState, ErrorState with `lib/errors.ts`, SaveState, VersionChip, UnsavedChangesBar.
- *Resolves:* F-A11Y-005, F-A11Y-011, F-A11Y-015, F-VIS-014, F-VIS-016 (elevation), F-VIS-023, F-UX-019, F-UX-030.
- *Spec:* O §1–§18.
- *Acceptance:* AX-02 (axe with each overlay open), KB-03, KB-04; toast timings per O §9; every error state offers Retry where the action can be retried.

### P1-05 · Data components and `lib/status.ts` · L · Depends: P1-03, P1-04
- *Scope:* Tag, StatusTag with `lib/status.ts`, LiveDot, LanguageMark (`name` · `full` · `compact`), CountBadge, PhoneText, Timer and Timecode (Hanken with tabular figures), FilterBar, DataTable on TanStack (density, one tab stop for the body, selection, sticky header, `aria-sort`), BulkBar, Pager, ListRow, TableState, KeyValueList, Avatar, Timeline, StatTile, StatStrip, the chart set (graphite marks, Neel only on the highlighted datum), `lib/format.ts`, `useUrlState`.
- *Resolves:* F-VIS-017, F-VIS-024, F-VIS-013, F-VIS-011, F-VIS-009 (row density), F-A11Y-018, F-A11Y-019, F-UX-031.
- *Spec:* N §0–§11; F §3.6, §14; CR §4.6.
- *Acceptance:* the `lib/status.ts` exhaustiveness check fails the build on an unmapped value; the Tag-with-status-word lint has a failing fixture; A11Y §20.C passes on the gallery table; Leads at 1440 × 900 shows about 16 rows in Standard.

### P1-06 · The gate system, complete · M · Depends: P0-08, P1-04; BE: CK B3 / L B7 (preflight), CK B4 (rates)
- *Scope:* `GateHost`, `useGate`, `useGatePreflight`; the full preflight when `cap.call_preflight` is true (calling hours in IST, DND n of n clear, recently called auto-skipped with Include, language match, cost as a range from the per-second rate and median duration, runway); batches land in Cockpit › Up next as Scheduled with Pause and Cancel; the PublishGate's full layout (checks, changes, where it goes live, note) wired to revisions when `cap.flow_revisions` is true; SetupTrack. AddAgentGate and the form gates ship with their pages (P2-06).
- *Resolves:* F-UX-013 (full pre-flight), F-A11Y-004 (completion).
- *Spec:* G §1–§8; D P3; L §6.10; CK §3.4; FD2 §5.
- *Acceptance:* G §8; SR-05 (hear readiness, cancel; repeat with shortcuts off); MN-06 (no single switch-scan step can dial or publish).

### P1-07 · Voice components · M · Depends: P1-05
- *Scope:* CallStateTag, CallStepper, CallHeader (the bounded 3-cycle pulse on the focal call only), LineQuality, TurnRow (`lang` on every turn, Devanagari at 15/26, the step link in plain words), TranscriptFeed (final turns announced, at most one every 2 s; Jump to latest), RecordingPlayer (plain track; the talk-strip variant is P3-04), VoicePicker, LevelMeter (moves only on real audio).
- *Resolves:* F-A11Y-014, F-VIS-029, F-UX-010 (transcript placement), F-A11Y-022 (live indicators).
- *Spec:* N §12; D §6.2; M §12; A11Y §12.
- *Acceptance:* LR-01 (a 3-minute scripted call yields one message per state change and at most one turn per 2 s); SR-02 on NVDA and VoiceOver.

### P1-08 · Shell and information architecture · L · Depends: P1-03, P1-04, P1-05
- *Scope:* `lib/nav.ts`; `AppShell` with the skip link and landmarks; the Sidebar with the thread (≥ 1280, 232 px); the Rail (1024–1279, expands as an overlay with a scrim; 44 px items that scroll on coarse pointers); TopBar and NavSheet (tablet); BottomBar (Cockpit · Leads · Call reports · Flows · More) and the MoreSheet reaching all 12 destinations (phone); PageHeader (56 px, one H1, at most one primary); `<title>` and route announcements; the workspace switcher; the account menu (profile, theme, motion, shortcuts, `Sign out…`); ⌘K Search or jump; the 308 redirect table and the landing function; 404, 403 and error pages inside the shell; loading inside the shell (skeleton after 200 ms); removal of the full-screen noise overlay.
- *Resolves:* F-RWD-001, F-UX-008, F-UX-007, F-UX-017, F-UX-027 (navigation part), F-UX-029, F-UX-030, F-VIS-005, F-VIS-015, F-VIS-032, F-VIS-033, F-VIS-034, F-RWD-005, F-A11Y-012, F-A11Y-013, F-A11Y-017, F-QA-007, F-QA-038, F-UX-048.
- *Spec:* SH §2–§4, §8–§10, §15–§16; N §1–§2; R §2, §4; D §6.1.
- *Acceptance:* SH §3.10, §4.5, §8.6, §9.5, §15.3; R §17.2 check 2 (every destination in ≤ 2 activations at 320, 390, 720 × 450, 844 × 390 and 1024 × 768); KB-01, KB-02; at 1366 × 657 and 1280 × 609 with a fine pointer every nav item is visible without scrolling.

### P1-09 · Baseline, BaselineChip and the wallet signals · M · Depends: P1-08, P1-15
- *Scope:* the 28 px Neel-ink Baseline from `lib/baseline-copy.ts` (live flow and version, inbound number, wallet with runway, calls in progress, your call timer; Shortcuts and Search); the fold to the BaselineChip at a viewport height of 720 px or less; TopBar chips below 1024 (call state and wallet as two chips); wallet states computed server-side; WalletNotice only where there is no Baseline; the 42 px banner deleted; `openTopUp({ source })` everywhere.
- *Resolves:* F-UX-028, F-UX-002, F-QA-036, F-A11Y-015, F-RWD-013, F-UX-018 (its replacement).
- *Spec:* SH §5–§7; O §10.2; D §6.1; R §4.3.
- *Acceptance:* SH §5.7 (the Baseline is byte-identical for the same state on every page), §6.5; R §17.5 BaselineChip checks at 1366 × 657, 1366 × 625 and 1280 × 609; nothing in the Baseline is announced except state changes.

### P1-10 · Home and the setup track · M · Depends: P1-06, P1-08; BE: setup-state endpoint (D §8 item 8)
- *Scope:* `/home` is the landing route while setup is incomplete; the SetupTrack's five steps computed by `GET /api/setup` (publish a flow, verify the calling number, add money, call yourself, import leads or connect inbound); the SetupCard in the sidebar, NavSheet and More, hidden while Home is open; one heading (the 40 px first-run display); "Live" only after all five pass; step 1 links the template gallery when P2-17 ships and today's template until then.
- *Resolves:* F-UX-006, F-UX-001 (tracking part), F-RWD-019.
- *Spec:* SH §12–§14; G §5.3; D §6.1, §6.6.
- *Acceptance:* SH §13.10; the track's counts come from the server and survive a reload on another device.

### P1-11 · Cockpit · L · Depends: P1-06, P1-07, P1-09; BE: CK B1, **B7 before the card**, B8, B12
- *Scope:* the Ready to call card (Contact, Flow with version, Voice, Language, inline readiness) with **Place call…** and **Talk in browser**; session-only overrides, so the pickers never write the account default ("Make default" is a separate link); the call card (stepper, cost so far, line quality; Now in the flow and Captured so far hidden until CK B5/B6); the transcript in turn rows; wrap-up with **Save and next**; the ≥ 1440 Calls column and the switcher below it; tablet tabs and the phone stack with a sticky 44 px bar; End call without confirmation, as a danger outline.
- *Resolves:* F-UX-003, F-UX-014, F-UX-026, F-VIS-007, F-VIS-029, F-VIS-030, F-RWD-002, F-A11Y-014, F-QA-037.
- *Spec:* CK §0–§4, §6, §7; R §11; D §6.2.
- *Acceptance:* CK §4.8; R §11.8; with Contact empty the primary names what is missing.

### P1-12 · Leads · L · Depends: P1-05, P1-06; BE: L B1, B2, B4–B6, B8
- *Scope:* the header (Export, Import…, New lead); views with pipeline-wide counts; the toolbar count with its breakdown popover; FilterBar with 6 px tokens; the DataTable (at least 10 Standard rows at 1366 × 657; the Language column hidden until L B3); row actions; BulkBar with **Call n leads…**; the 440 px lead sheet, deep-linked, with Delete in the overflow; the Call gate configuration; New lead; Import with a mapping preview and row-level errors; Export; phone ListRows (at least 8 at 360 × 780).
- *Resolves:* F-VIS-009, F-QA-015, F-QA-016, F-QA-022, F-UX-032, F-A11Y-010, F-A11Y-018, F-A11Y-024, F-RWD-011, F-RWD-012, F-VIS-017.
- *Spec:* L §0–§13; D §6.3; R §12.10.
- *Acceptance:* L §13; KB-05; SR-05. *Decision taken here:* the direction's toolbar count and popover (D §6.1, §6.3) replaces the 32 px "In this view" ViewSummary band that L §6.3 and CR §4.1 still describe; the ViewSummary facts move into the popover (§8, open item).

### P1-13 · Call reports, complete · M · Depends: P0-14, P1-05, P1-07; BE: CR B5 (review state), B7
- *Scope:* anchored columns (at most 9 by default; Sentiment as icon and word, untinted); the views (All · Needs review · Positive · Negative · Mixed · Unscored); the 560 px call detail sheet (header with "2 legs" disclosed when relevant, AI summary, captured fields, topics, transcript in turn rows with timecode seek, the plain recording track); the review run (**Mark reviewed and next**, snapshot navigation, "All 9 calls reviewed"); Re-analyse and Download in the overflow; the tablet and phone list with a full-height sheet.
- *Resolves:* F-UX-009, F-UX-010, F-VIS-027, F-UX-046, F-RWD-004, F-RWD-009, F-RWD-010.
- *Spec:* CR §2; D §6.4; R §12.11.
- *Acceptance:* CR §2.13 including the review-run checks; KB-06; SR-03.

### P1-14 · Flows list · M · Depends: P1-05, P0-02; BE: FD5, FD9
- *Scope:* the list with Status (`Live v7`, `Draft · 3 changes`, `Unpublished edits on this device`), Used by (from FD5, else "Your Cockpit default"), unique names (FD9; until then a `flow_7c21` suffix on duplicates), New flow, Make my Cockpit default, Duplicate, Rename and visibility with a clear meaning of Private.
- *Resolves:* F-VIS-037, F-FLOW-012, F-FLOW-014, F-UX-005.
- *Spec:* FD2 §15.1–§15.5.
- *Acceptance:* FD2 §23 list items; no two rows read the same.

### P1-15 · Top-up sheet (money gate) and the Wallet tab · M · Depends: P1-04, P1-06; BE: KB BL1 (rates), BL3 (quote)
- *Scope:* the TopUpSheet (UPI first, ₹100 / ₹500 / ₹1,000, a custom amount validated against the provider minimum, the resulting runway before paying, the pending and failed states); the Wallet tab (balance in `num-28` with runway); the app-wide `?topup=1` handler, which returns focus to the control that is now enabled.
- *Resolves:* F-UX-002, F-QA-004, F-UX-021 (wallet part), F-QA-021 (amount validation).
- *Spec:* KB §2.3–§2.7; G §5.6; SH §6.4.
- *Acceptance:* KB §2.18 wallet and top-up items; SR-06; topping up from inside a Call gate keeps the gate's payload and offers to reopen it (G §4.4 rule 6).

### P1-16 · Close the reference component gaps before copying the layer · M · Depends: none (design-system owners; runs alongside P1-03 to P1-07)
- *Scope:* resolve the 39 requests the mock-conversion helpers left in [`_critique/open-items.md`](_critique/open-items.md): merge into `components.css` (or decline with a note) the DataTable open-row state, ListRow selection, the Gate header close slot, scope and choice rows and phone bottom-sheet variant, a `[data-density="touch"]` hook, a responsive PageHeader, a compact phone TurnRow, the start-aligned empty state, a busy button that keeps its variant colour (M MD5), `.spin` on `--dur-spin` with the clashing keyframe names fixed, the CallStepper current step while dialling, canvas drag and connect-target states, and canonical versions of LevelMeter, Switch, the tab indicator, Tooltip, Toast, Connect to…, the Outline row, the skip link, StageProgress and the text field; stop `shell-partials.js` pulsing the Baseline and TopBar live dots (M: static); settle the two dimension conflicts in §8.3 (S12, S13).
- *Resolves:* no audit finding directly; it prevents each product team re-inventing these pieces (F-VIS-001, F-VIS-006 drift).
- *Spec:* D §8.1; `components/components.css`; `_critique/open-items.md`; M §3.2, §12.2.
- *Acceptance:* every request is merged or declined; `check-mocks.mjs` stays at 0 problems; no mock keeps a page-local component class; the canonical crops are re-rendered.
