
---

## 19. Keyboard summary (for the `?` sheet)

| Key | Where | Does |
|---|---|---|
| ⌘K / Ctrl+K | Anywhere | Search or jump (CommandPalette) |
| ? | Anywhere outside a text field | Keyboard shortcuts sheet (Dialog lg) |
| Esc | Any overlay | Close the top-most overlay; in the palette, clear the query first |
| F6 | Page with an open sheet or inspector | Move focus between the page and the sheet |
| F8 | Anywhere | Go to notifications (newest toast) |
| ⌘/Ctrl+Z | Outside text fields | Undo (the newest undo toast, or the Flow history) |
| ⌘/Ctrl+S | Inside a form with changes | Save (UnsavedChangesBar) |
| J / K | Table with an open sheet | Next / previous record; the sheet follows |
| Shift+F10, context key | Focused row or flow step | Open its context menu |
| Enter | Dialog single-line field | Submit; ⌘/Ctrl+Enter from a textarea |

Single-key shortcuts (J, K, ?, and the Flow Designer's A, C, O, V) can be turned off from the account menu and the palette (F-A11Y-004). No single key ever places a call: C opens the Call gate, and Start needs ⌘/Ctrl+Enter.

---

## 20. Build order and tests

1. `announce()` + LiveRegion, `<Toaster/>`, Dialog, ConfirmDialog (everything else depends on them).
2. Tooltip (+ `DisabledReason`, `OverflowTooltip`), Menu / ContextMenu, Popover.
3. Sheet (record, detail, gate, inspector), then CommandPalette.
4. Notice, WalletNotice, ConnectionBar, StatusText, InlineError.
5. Spinner, Skeleton layouts, RouteProgress, ProgressBar, StageProgress.
6. EmptyState, PageError, NotFound, Forbidden, SectionError, SessionExpired.
7. SaveState + `useSaveMachine`, VersionChip, UnsavedChangesBar + `useUnsavedChangesGuard`.

**Tests that lock the audit fixes in:**
- Playwright: every dialog and sheet → open with the keyboard, Tab cycles inside, Esc closes, `document.activeElement` is the trigger (never `BODY`) (F-A11Y-005, F-A11Y-027).
- axe on each gallery state in both themes; the contrast script covers every new pair (none are new: all pairs used here exist in `contrast-report.md`).
- Save machine unit tests: hydration and `fitView` do not mark dirty; a blocked PUT ends in `error`, never `saved` (F-QA-002); a navigation 0.4 s after an edit flushes the save (F-FLOW-003).
- Link check: every "Top up" resolves to the Top-up sheet; no in-app href points at a missing anchor (F-UX-002).
- Visual snapshots: toasts, notices and the save chip at 320, 768, 1024, 1440 in both themes; reduced-motion snapshots show static spinners and no slides.
- Lint: no `role="alert"` on components other than Toast (error), InlineError and SaveState (error); no `z-index` literals; no `transition: all`.

---

## 21. Tokens and open questions

**Token requests:** registered in 01-foundations §18 and emitted by `tokens.json` 1.1.0: `--dur-spin` (800 ms), `--timing-skeleton-min` (400 ms) and `--size-palette-list` (`calc(var(--row-h) * 9)`) are accepted; `--timing-debounce` is merged into `--timing-validate-debounce` (300 ms), the one input debounce, so palette search and autosave use that name. Use the token names; the interim `calc()` values are retired.

**Open questions for the product owner**

1. **Wallet "low" threshold.** Proposed: runway under 60 min of calls at the workspace's median rate, editable in Billing › Autopay. Needs the per-second rate and median duration endpoints (direction §8 items 6).
2. **Soft-delete windows.** Tier 1 (Undo) needs the backend to keep deleted leads, steps, notes and rooms for at least the toast's lifetime. If it cannot, those actions move to tier 2 (ConfirmDialog).
3. **Busy loops.** Closed: direction §5 and foundations §11 now say it. Spinners and the indeterminate bar loop only while a user-started request is in flight; the live dot pulses 3 cycles on the focal call only.
4. **Request access.** Forbidden pages offer "Request access" only if an endpoint exists that notifies admins; otherwise "Copy request link".
5. **Session re-auth in place.** SessionExpired sends the user to `/login?next=`. A re-auth popup that keeps the page alive would preserve more work; it depends on the auth provider.
6. **Notification inbox.** Out of scope for v1: toasts are transient, the Baseline and notices carry state. If an inbox is added (for batch results and teammate activity), it is a popover from the account area built on §5.
7. **Offline edits.** The ConnectionBar copy promises that flow edits stay on the device. That needs a local draft queue (IndexedDB) for the Flow Designer; other surfaces say "Changes can't be saved until you reconnect."

---

## 22. Traceability

| Finding | Severity | Resolved by |
|---|---|---|
| F-FLOW-001 | critical | Undo toast for step delete (§9); Draft vs Live (§18.2); tier model (§3) |
| F-A11Y-002 | critical | Detail sheet opened by keyboard, focus in and back, deep link (§4) |
| F-A11Y-005 | high | Dialog focus contract, named close, inline discard, phone sheets above the bar (§1.3, §2) |
| F-QA-002, F-UX-024 | high | SaveState machine; hydration never writes (§18.1) |
| F-FLOW-003 | high | Five-plus-two save states, flush on exit, error toast (§18.1, §9) |
| F-FLOW-005 | high | Undo bound to the history stack (§18.1) |
| F-UX-002, F-QA-004 | high | Every Top up opens the Top-up sheet (§10.2) |
| F-UX-006 | high | Success only when proven; setup rows (§17) |
| F-UX-010 | high | Detail sheet 560 with tabs and one scroller (§4) |
| F-UX-012 | high | UnsavedChangesBar, guard, switches autosave (§18.3) |
| F-QA-007 | high | Shell never unmounts, skeletons, RouteProgress, ConnectionBar, SessionExpired (§13, §14, §10.3, §16) |
| F-RWD-004 | high | Full-screen call detail on phones (§4.6) |
| F-UX-013 | medium | Tier 4 routes billable actions to gates; palette never dials (§3.1, §8.3) |
| F-A11Y-004 | high | Single-key shortcuts can be turned off; C opens the Call gate, never dials (§19) |
| F-UX-022 | medium | Assistant side-effect steps are tier 4 (approval by autonomy level) (§3.1) |
| F-A11Y-011 | medium | Menu keyboard model (§7.4) |
| F-A11Y-013 | medium | Route announcement with RouteProgress (§14.1) |
| F-A11Y-014 | medium | LiveRegion + toasts with politeness (§1.8, §9) |
| F-A11Y-015 | medium | WalletNotice `role="status"`, focus to H1 on dismiss (§10.1–10.2) |
| F-A11Y-016 | medium | `aria-expanded`, `aria-checked` in menus and popovers (§5, §7) |
| F-A11Y-017, F-A11Y-024 | medium | Tooltip replaces `title`; `aria-label` on every icon button (§6) |
| F-A11Y-019 | medium | Status words and ≥ 5.47:1 tints (§10, §11) |
| F-A11Y-022 | medium | Motion table; static skeletons; spinners stop under reduced motion (§1.5, §12, §13) |
| F-A11Y-027, F-FLOW-024 | medium | Shortcut sheet as a portaled lg Dialog (§2.4) |
| F-A11Y-010 | medium | Lead sheet semantics and focus (§4.4–4.5) |
| F-FLOW-019, F-UX-035 | medium | Danger group in menus, Danger zone, typed confirm for live flows (§3.5, §7) |
| F-FLOW-025 | medium | Inspector closes on delete, Undo toast (§4.3, §9) |
| F-FLOW-031 | medium | AI draft as StageProgress + diff; Replace draft is tier 2 (§14.3, §3.1) |
| F-FLOW-022 | medium | Inspector overlay at 1024–1279 (§4.6) |
| F-FLOW-034 | low | No banner in the builder; status stays visible (§10.2, §18) |
| F-FLOW-037 | low | Canvas skeleton; editing off until hydrated (§13.2) |
| F-UX-014 | medium | "Default updated" success toast (§9.2) |
| F-UX-019, F-UX-023, F-UX-036 | medium | InlineError with Details, SectionError with last good data (§11.2, §16) |
| F-UX-028, F-RWD-013, F-QA-036 | medium / low | Wallet signal ladder (§10.2) |
| F-UX-029 | medium | CommandPalette, Sign out… confirm, in-shell 404 (§8, §3.1, §16) |
| F-UX-030, F-VIS-023 | medium | Skeleton layouts, EmptyState variants, error levels (§13, §15, §16) |
| F-UX-032 | medium | Lead sheet: full height, sticky header and footer, Delete in ⋯ (§4) |
| F-UX-033 | medium | Upload rows with status and stage progress (§14.4) |
| F-UX-034, F-QA-018 | medium | Forbidden in shell, disabled with reason (§16.1) |
| F-UX-042 | medium | "Not yet available" empty variant (§15.1) |
| F-UX-046 | low | Separate no-results and filtered copy; row ⋯ menu (§15.1, §7) |
| F-UX-047 | low | One primary; export stages (§2.8, §14.3) |
| F-QA-017, F-QA-039 | medium / low | NotFound inside the shell (§16.1) |
| F-QA-020 | medium | Save result proven; StatusText (§17, §11) |
| F-QA-022 | medium | Import StageProgress with mapping step (§14.3) |
| F-VIS-013, F-VIS-014, F-VIS-015, F-UX-007 | medium | Tooltip sizing, portal, overflow variant, rail side (§6) |
| F-VIS-016, F-QA-038 | medium / low | Named z-layers only (§1.2) |
| F-VIS-022 | medium | Flat scrim, no blur (§1.2) |
| F-VIS-029 | low | No decorative ring; Spinner rules (§12) |
