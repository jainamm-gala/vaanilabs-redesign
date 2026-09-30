# Open items after the spec revision round

The mock-conversion helpers reported these after moving spec mocks onto `components/components.css`. None blocks the prototype. The design-system owners should resolve them next.

## Component-layer requests (not yet merged into components.css)
Source: `scratchpad/requests/leads-callreports.md` (Leads and Call reports helper).
1. DataTable open row: `tr[aria-current="true"]` should get the hover fill plus an inset accent bar. Today, mocks fake it with `.is-hover`, which also reveals the row actions.
2. ListRow needs a selection mode and a selected state (phone multi-select).
3. `.gate-x`: a close-button slot in the Gate header.
4. `.gate-scope` and `.gate-choice`: the Settings scope row and the RadioCard pair are still page-local.
5. `.gate--bottom`: a phone bottom-sheet variant, with no rounded bottom corners at the screen edge.
6. A `[data-density="touch"]` hook in tokens and components. Device frames and `canonical.html` `.cn-device` render 32 px buttons instead of 44 px without it.
7. ListRow tags should stay 20 px under touch density.
8. A TopBar placeholder option for Back + ⋯ without Search (record pages on phones).

Source: `scratchpad/requests/shell-cockpit-assistant.md` (App shell, Cockpit and Assistant helper).
9. Setup-track current-row and ring marks for the Gate (page-local in `00-app-shell-ia.html` and `gate.html`).
10. Style `h2` as well as `h3` inside `.empty` (the 404 and no-access frames use `h3` for now).
11. `.gate-cost` wraps badly in narrow containers: the Assistant laptop ApprovalCard shows "₹29 to / ₹58".
12. A responsive PageHeader: `.ph--phone` metrics below 1024 and a truncating `.ph-meta`. The Assistant header grew from 48 to 56–60 px below 1024.
13. A compact TurnRow for phones (the 56 px timecode column is heavy at 375 px).
14. A start-aligned `.empty` variant (the Assistant welcome is page-local).
15. A `[data-density="touch"]` token set for device frames drawn at 1440 (same as item 6).
16. An optional start-aligned button.
17. `mockshell.sidebar()` and `rail()` lack the Search row, rail search and account avatar.

Source: `scratchpad/requests/responsive-motion.md` (Responsive and Motion helper).
18. Sidebar short mode inside components.css, keeping the `and (pointer:fine)` guard.
19. Rail items at 44 px on coarse pointers.
20. A busy (loading) button should keep its variant colour, not the disabled grey. The current CSS contradicts 07 MD5.
21. `.spin` should use `--dur-spin`, and the keyframe names `vl-live-pulse` and `vl-pulse` clash.
22. A CallStepper current-step colour while Dialling or Ringing (today the current step looks "upcoming").
23. Canvas drag, connect-target and taken-answer states in §17.
24. `shell-partials.js` pulses the Baseline and TopBar live dots, which 07 says must be static. This is a spec violation in shared code.
25. LevelMeter, Switch and the tab-indicator slide have no canonical component yet.
26. Phone PageHeader is 56 px instead of 48 (same as item 12).
Note: the info tag tone is now neutral grey in tokens, so older renders that showed blue "Now" / "Top aligned" tags are superseded.

Source: `scratchpad/requests/billing-settings-meetings-auth.md` (Billing, Settings, Meetings and Auth helper).
27. `.seg--lg`: the top-up presets are 32 px next to a 40 px field.
28. A 4-step Meter variant (page-local `.kb-meter` in Knowledge).
29. `.notice--top`: multi-line notices should top-align their icon.
30. `.ph-desc` should be able to wrap to its own line.
31. An ink-band surface token so the marketing footer can match the Baseline in the dark theme.
32. Full-colour OAuth marks: the spec asks for them, but check-mocks' raw-colour rule blocks brand colours. It needs an allowlist for third-party marks.
33. StageProgress as a canonical component (page-local in Settings).
Also open (need a product decision):
- The Billing phone TopBar wallet chip repeats the balance card.
- Settings › Phone setup's H1 meta ("Inbound ready") repeats the Baseline.
- `03-pages/08-public-auth.md`'s "Reference mock" row still lists only tokens.css and base.css.

Source: `scratchpad/requests/a11y.md` (Accessibility mock helper).
34. **Spec conflict:** the socket focus ring is 24 px in 06 §7.1 but 18 px in components.css and FD1 §16.2. Decide one value.
35. `.bl-seg` focus is inset with no padding, so the ring overlaps the text; 06 §7.1 says offset 2.
36. **Spec conflict:** the FilterToken remove icon is 12 in 06 §15.2 but 14 in data-nav and canonical.
37. A state hook to show the coarse-pointer answer row in a static mock.
38. `--btn-h-*` resolves at `:root`, so frames that change density keep the root button height (same gap as `canonical.html` `.cn-device`; see items 6, 8 and 15).
39. Still page-local because components.css has no version: tooltip, toast, the "Connect to…" combobox and options, the Outline tree row, the skip link, and a basic text field.

Source: `scratchpad/requests/flow-02-05.md` (Flow lifecycle and responsive-flow helper).
40. A pressed state, `.btn[aria-pressed="true"]`. The header Test and Problems-bar Test toggles show no visible pressed state.
41. Minimap marks `.minimap > i.is-selected` and `.is-warning`.
42. `.node--compact .res-row` at 36 px, to match compact answer rows.
43. `.node-meta .phone-text` at `--f12` (a masked number inside a step renders at about 9 px at 75 % zoom).
44. `.gate-body { align-content: start }` for full-height gates.

Source: `scratchpad/requests/specimen.md` (Direction specimen helper).
45. SetupTrack current and to-do marks, plus a current-row style (same as item 9).
46. `.node-var` should use `--variable-bg` / `--variable-fg`.
47. Gate rows and the gate foot squeeze their text on phones.
48. A borderless `.tr` variant for docked transcript columns.
49. Toast, form fields and a side-sheet container are missing from components.css (same as item 39).
Remaining "one fact, one place" repeats that need a product decision:
- The Leads nav badge "2 live" repeats the Baseline's "2 calls in progress".
- The Cockpit shows the call timer three times: the Calls column, the call card and the Baseline "On call".

## Spec text that lags the mocks (flow)
- `05-responsive.md` (around line 544) still says the mock links `04-flow-designer/flow-grammar.css`. That sheet is now retired (see Mocks).
- `04-flow-designer/02-config-validation-lifecycle.md` (around lines 246–247) still gives the live note as "Live v7 answers +91 80 •••• 2210 since 12 Sep. Callers hear v7 until you publish. · Compare with live". Under P1 it should be "Callers hear v7 until you publish. · Compare with live", with "Live v7" only in the header chip.
- The same file (around lines 576 and 589) still specifies the inspector footer "Edits save to the draft. Callers hear Live v7 until you publish." It should be only "Edits save to the draft."

## Spec text that lags the "one fact, one place" rule (direction P1)
- `03-pages/00-app-shell-ia.md` still gives Home's H1 as "Home" with meta "2 of 5 done" (D11, the §4.2 table, the §13.2 diagram). The converted mock uses the H1 "Get your first call live", and "Setup · 2 of 5 done" appears only in the setup-track Gate.
- `03-pages/02-assistant.md` §5.5 and §5.6 still show "Waiting for you" on the PlanBar. Below 1024 it should appear only on the inline waiting step.
- `03-pages/03-leads.md` §6.3 still describes the ViewSummary line, and its desktop table says "Baseline + WalletNotice". Under the rule, the toolbar count (`tb-count`) is the only place a view's size is stated. On desktop the low wallet is carried by the amber Baseline segment and the gate's wallet row.
- `03-pages/04-call-reports-analytics.md` §4.1 still defines ViewSummary. The same fix applies: move the totals into the count's popover.

## Mocks
- All 23 spec mocks pass `components/check-mocks.mjs` (0 problems) as of the end of the revision round. None still carries the temporary "Spec sketch … illustrative only" notice. If a future mock fails the check, `_tools/mark_superseded.py` can mark it again.
- `04-flow-designer/flow-grammar.css` and `components/shell-partials.css` are retired to pointer comments, and no mock links them. The last full copy of flow-grammar.css is in `_critique/retired/`.
