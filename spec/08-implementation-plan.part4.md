## 5. P2: the remaining pages and the Flow Designer upgrades

### Remaining pages

**P2-01 · Analytics** · L · Depends: P1-05; BE: CR B2, B8
- *Scope:* the StatStrip (one hairline-divided band, trend on hover or focus only), ReportSections in a ReportGrid (no cards, no box-in-box), graphite single-series charts with Neel only on the highlighted datum, the 24-bar hour chart, drill-down into Call reports with the same filters, `lib/metrics.ts` shared with Call reports, the range control, stale and degraded Intents states, the flow drop-off with step links; phone: compact strip, chart text ≥ 12 px, no sideways pan.
- *Resolves:* F-VIS-010, F-VIS-011, F-VIS-012, F-UX-011, F-UX-036, F-QA-019, F-RWD-008, F-UX-048.
- *Spec:* CR §3, §4.2–§4.7; N §11; R §12.12. *Acceptance:* CR §3.12; totals equal Call reports for the same scope.

**P2-02 · Knowledge** · M · Depends: P1-05
- *Scope:* the sources table with an indexing status sentence per file, Add knowledge, the source sheet, Test a question, Proposals for admins only, vendor names removed, Delete in the overflow (tier 2 when a flow uses the file).
- *Resolves:* F-UX-033, F-UX-016 (vendor names), F-UX-034, F-RWD-016. *Spec:* KB §1. *Acceptance:* KB §1.18.

**P2-03 · Billing, remaining tabs** · M · Depends: P1-15; BE: one rates endpoint for the app, `/pricing` and the docs; the payment provider's mandate API
- *Scope:* Usage (calls, not legs; test calls separate), Plans (one billing-unit sentence), Invoices (paginated, download), Autopay (Off · On · Paused with Retry · Needs mandate renewal), the Plan change and Autopay money gates.
- *Resolves:* F-UX-021, F-QA-011 (rates), F-QA-006 (usage). *Spec:* KB §2.8–§2.18; G §5.6. *Acceptance:* KB §2.18.

**P2-04 · Settings** · L · Depends: P1-03, P1-04, P1-08
- *Scope:* the 200 px grouped sub-nav and 720 px column; the per-section save model (SectionFooter, UnsavedChangesBar, navigation guard); Overview, Profile, Organization & team, Notifications, Integrations (ServiceMark, no letter tiles), Assistant, Phone setup (inbound number, caller ID, transfer, test call), Security (password, two-factor, sessions), API keys, Webhooks, Embed (the corrupted snippet fixed), Activity, Export, Delete (typed, 7-day grace); ReauthDialog.
- *Resolves:* F-UX-012, F-UX-015, F-UX-020, F-QA-008, F-UX-027, F-UX-041, F-UX-042, F-QA-023, F-UX-044, F-UX-047, F-VIS-031, F-VIS-034. *Spec:* ST §0–§17. *Acceptance:* ST §13.

**P2-05 · Assistant** · L · Depends: P0-09, P1-06; BE: AS §20 items 2–10
- *Scope:* conversation turns, activity rows, answer blocks, the composer (keeps the user's words, attachments), plans and the plan panel, the ApprovalCard with the autonomy modes, Call and Publish steps that launch gates through `useGate`, Dictate (only with an approved speech service), history, every state.
- *Resolves:* F-UX-022 (the UI), F-RWD-015. *Spec:* AS §0–§21. *Acceptance:* AS §21.

**P2-06 · Meetings and Personal agents** · L · Depends: P1-06, P1-07
- *Scope:* rooms by title with state sentences and stale flags, Start a meeting (form gate), the room sheet, past meetings with notes as turn rows, Generate a deck, AddAgentGate; Personal agents with the blocking prerequisite first, templates, Waiting for you, task states, New task (form gate), agent settings and autonomy; consumer capabilities hidden; the Meeting Agent violet removed.
- *Resolves:* F-UX-037, F-UX-038, F-UX-039, F-UX-040, F-QA-024, F-RWD-006, F-RWD-007, F-VIS-004 (violet). *Spec:* MP §1–§4; G §5.4–§5.5. *Acceptance:* MP §1.18, §2.18.

**P2-07 · Rep console** · M · Depends: P1-07, P1-11; BE: CK B10 (presence)
- *Scope:* the availability model (explicit Go available, heartbeat, server timeout, auto-offline after missed transfers), the incoming call card, the shared call card and turn rows, errors as sentences with Retry, no internal ids.
- *Resolves:* F-UX-023, F-UX-016 (ids). *Spec:* CK §5. *Acceptance:* CK §5.12.

**P2-08 · Public site and auth** · L · Depends: P0-16, P0-17, P1-01; BE: PA A2–A12
- *Scope:* MarketingLayout on the tokens and Hanken; the hero as a real recorded call in TurnRows; `/pricing` from the public rates endpoint with one primary; `/login` (password manager friendly, magic link, two-factor); verify by link and code; OAuth confirm; forgot and reset; accept an invite; the signed-out 404; the ConsentBar; the other public pages (PA §6); theme in sync on first click; the performance budget.
- *Resolves:* F-VIS-025, F-VIS-026, F-QA-012, F-QA-013, F-QA-026, F-QA-027, F-QA-028, F-QA-029, F-QA-030, F-QA-031, F-QA-032, F-QA-035, F-QA-040, F-A11Y-021, F-A11Y-025, F-A11Y-026, F-A11Y-029, F-RWD-017, F-RWD-018. *Spec:* PA §0–§18; R §12.15–§12.16. *Acceptance:* PA §5.13, §7.12, §8.12, §9.11, §10.4, §17; SR-07.

### Flow Designer upgrades (behind `flow.designer_v2`)

**P2-09 · The new node set and shape grammar** · L · Depends: P1-01, P1-05
- *Scope:* StepNode for Trigger and Outcome (capsule ends) and Logic and Action (8 px rectangles) with four neutral glyph tiles; AnswerRow (label, bilingual examples, 10 px socket with a 24 px hit area, 44 px rows on coarse pointers); ResultRow for Actions that can fail; the mandatory fallback row as the only dashed edge; amber "Not connected"; the Outcome line "Lead → Interested" as plain text; connectors with labels only on long edges, hover or selection; the PhaseRuler (one connected bar, counts, emphasis, the live note on its right); level of detail with 12 px counter-scaled text (`--zoom` written on `onMoveEnd`, quantised to 0.05); focus distinct from selection; unreachable and dimmed steps with no opacity on text; the stable `#n`; forced-colours rules.
- *Resolves:* F-FLOW-007, F-FLOW-008, F-FLOW-011, F-FLOW-020, F-FLOW-027, F-FLOW-033, F-FLOW-036, F-A11Y-007, F-A11Y-019 (canvas titles).
- *Spec:* FD1 §4–§7, §20.1; D §6.5; the flow section of `components/components.css`. *Acceptance:* FD1 §19 grammar and level-of-detail items; CT-02 with the unreachable and dimmed fixture; CT-03 at zoom 0.25, 0.5, 0.75 and 1; VR-02; matches `components/canonical/step.png`.

**P2-10 · Canvas keyboard and assistive technology, complete** · M · Depends: P2-09, P0-12
- *Scope:* A11Y §9.6 as the only canvas key map (Tab enters at the first Trigger; arrows follow edges and siblings; Enter; `C`; `A`; Delete with Undo; Alt+Arrow moves; Alt+. / Alt+, for issues; Space selects, Shift+Space toggles; `M` Move mode; `+` `−` `Shift+1/2/0`); the canvas as a `<section>` with a hidden `h2` (no `role="application"`), steps as `role="group"` with `aria-roledescription="step"`, sockets as buttons; the shell `[` off in focus mode.
- *Resolves:* F-A11Y-001 (completion), F-A11Y-028, F-FLOW-006, F-FLOW-024. *Spec:* A11Y §6.1, §9.6; FD1 §11, §16; FD2 §16.5. *Acceptance:* KB-08; SR-04 on the canvas; LN-03.

**P2-11 · Designer layout and chrome** · M · Depends: P2-09, P1-08
- *Scope:* focus mode (sidebar collapses to the rail, the Baseline hides); the 48 px FlowHeader (breadcrumb, Draft chip, SaveState, Live chip, undo, redo, Tidy · IssuesChip, Test, **Publish v8…**; Share, Export, Import, Duplicate and Delete in `⋯`); the tool rail and 280 px left panel (StepPalette with phase descriptions, Outline, Variables, History); the inspector docked at 320 (≥ 1440) or overlaid (1024–1279); the 32 px Problems bar; no full-screen mode.
- *Resolves:* F-FLOW-022, F-FLOW-018, F-FLOW-034, F-FLOW-035, F-FLOW-009, F-RWD-014 (laptop part). *Spec:* FD1 §3, §8, §9; D §6.5. *Acceptance:* FD1 §19 layout items; the canvas keeps about 942 × 537 at 1366 × 657 and 856 × 489 at 1280 × 609 (FD1 §17).

**P2-12 · Large flows** · L · Depends: P2-09; BE: FD1 C1 (frames and notes in the flow JSON)
- *Scope:* Tidy (ELK layered, left to right, respects frames, one undo step), collapsible frames with tints, notes, Find (`⌘/Ctrl+F`, matches `#9` and titles), multi-select with a count and a bulk bar, the neutral minimap from 1280, the saved viewport per flow, the Outline docked for flows over 20 steps, the 150-step performance budget.
- *Resolves:* F-FLOW-017, F-FLOW-021, F-FLOW-023, F-FLOW-026, F-FLOW-008 (large flows). *Spec:* FD1 §9–§12; D §6.5. *Acceptance:* FD1 §19: at Fit on Flow B every visible label shows ≥ 20 characters or the full title and no two are identical; a 1.0 → 0.25 pinch on 150 steps at 4× CPU throttle holds ≥ 50 fps with no long task over 50 ms.

**P2-13 · Inspector, step registry, variables, conditions and voice** · L · Depends: P2-09; BE: FD8, FD10
- *Scope:* the step-type registry (one name everywhere); inspectors for every type (Trigger, Question, Branch with the condition builder, Verify caller, the answer editor with Go to, Speak, Knowledge lookup, CRM lookup, Book meeting, Send WhatsApp, Transfer, End with outcome, Unsupported); PromptField with the variable picker; the Variables panel; Flow settings; voice and language with a step override; integration status rows.
- *Resolves:* F-FLOW-015, F-FLOW-020, F-FLOW-027, F-FLOW-028, F-FLOW-029, F-FLOW-030, F-FLOW-032. *Spec:* FD2 §7–§11. *Acceptance:* FD2 §23 inspector items.

**P2-14 · Validation parity and the Problems surfaces** · M · Depends: P0-04, P0-05 (FD4)
- *Scope:* the full rule catalogue, including integration and template rules; server 422 parity; the ProblemsPanel and Problems bar with Go to step; the gate row "The server runs the same rules".
- *Resolves:* F-FLOW-004 (completion), F-FLOW-010. *Spec:* FD2 §12. *Acceptance:* FD2 §12.6; one shared fixture set, identical results on client and server.

**P2-15 · The revision UI** · L · Depends: P0-05, P2-09
- *Scope:* Draft and Live on real revisions; the version menu; History; Compare with live (with `[` `]` in compare mode); Restore as draft; Roll back (publishes v7's content as v9, toast for 6 s, then the version menu); the 409 conflict sheet; AI draft as a diff (Apply to draft · Discard); leaving, offline and recovery; device drafts from I1 offered as server drafts when `cap.flow_revisions` flips.
- *Resolves:* F-FLOW-012, F-FLOW-031, F-FLOW-019 (reset), F-FLOW-001 (final state). *Spec:* FD2 §4–§6; D §6.5 Lifecycle. *Acceptance:* FD2 §23 lifecycle items; KB-07 publish and roll back; the roll-back text says calls already placed on v8 stay on v8.

**P2-16 · Test and simulate** · L · Depends: P1-06, P2-09; BE: FD6, FD7
- *Scope:* the Test panel (docked, 280 px): text test, browser voice, Call my phone through the CallGate; side effects simulated and said; the test trace on the canvas; the run record; "Test call placed on this draft" feeding the Publish gate's advisory row.
- *Resolves:* F-FLOW-016, F-UX-026. *Spec:* FD2 §13; M §11. *Acceptance:* FD2 §23 test items; M §11.10.

**P2-17 · New flow, templates and re-layout** · M · Depends: P2-09, P2-13
- *Scope:* `/flows/new` with the template gallery (Lead qualification, Site visit, EMI reminder, COD confirmation, Appointment, Support FAQ) drawn as mini strips; instantiation adapted to the workspace with a "Needs:" line; Describe it (AI draft onto a new draft); the blank-flow first view (connected Trigger → Outcome, "No issues"); left to right by default; the opt-in **Re-layout as draft** for the 16 existing flows.
- *Resolves:* F-FLOW-013, F-FLOW-031, F-FLOW-009. *Spec:* FD2 §15.3; FD1 §13; D §6.5 Migration. *Acceptance:* CI in an empty fixture workspace: every template yields 0 errors and at most W08; no live flow is re-laid out on open.

**P2-18 · Designer responsive modes** · M · Depends: P2-11
- *Scope:* Compact (1024–1279); Review (768–1023: Outline or Problems beside a read-only canvas, one Notice string); the phone Outline (read-only, a sticky Test · Publish bar above the BottomBar); coarse pointers at ≥ 1024 with 44 px rows and Navigate / Arrange; Publish never clipped; everything per the R §10.6 capability matrix.
- *Resolves:* F-RWD-003, F-RWD-014. *Spec:* R §10; FD1 §3.2, §17; FD2 §21. *Acceptance:* R §10.13 (after publishing, focus is on Publish and never on `<body>`).

**P2-19 · Dialect removal and the palette reset (M5)** · M · Depends: every P2 page
- *Scope:* codemod counts to zero; the Tailwind palette reset and the raw-palette ban go global; HUD, glass, grid, noise and glow classes deleted; one icon per destination; letter pseudo-icons removed.
- *Resolves:* F-VIS-001, F-VIS-002, F-VIS-020, F-VIS-022, F-VIS-031, F-VIS-035, F-VIS-036. *Spec:* F §15.6 steps 4–6; D §7; M §14.3. *Acceptance:* lint and grep at zero; CT-02 and CT-03 green on every route.

---

## 6. P3: polish and motion

| Id | Item | Effort | Resolves | Spec | Acceptance |
|---|---|---|---|---|---|
| P3-01 | Motion system: 90 / 140 / 200 ms and one easing everywhere; the keyframe allowlist replaces the 36; the overlay motion table; RouteProgress; no hover lift; decide on removing `framer-motion` (M-Q6) | M | F-A11Y-022, F-VIS-022, F-FLOW-011 (marching ants), F-QA-032 (hero entrance) | M §2, §4–§6, §9, §14–§15 | M §14.4, §15.6, §17 |
| P3-02 | Micro-interactions: button busy states, autosaving switches, the save-state timeline, success and error feedback, toast motion, optimistic edits | M | F-UX-019 (feedback polish) | M §3, §5, §7, §8 | M §3.10, §5.4, §8.1 |
| P3-03 | Canvas motion and the test-run trace (once, then static; skipped under reduced motion) | M | F-FLOW-011 | M §10–§11 | M §10.17, §11.10 |
| P3-04 | Data-dependent signatures: the talk strip in the Cockpit card, the recording scrubber as a keyboard slider (±5 s), per-turn language marks, Now in the flow, Captured so far; each behind its capability | S–M each | F-UX-010, F-VIS-029 (completion) | D §6.2, §6.4; N §12.5; CK §3.5; BE CK B5–B6, CR B6 | KB-13; with the capability off each element is absent, never faked |
| P3-05 | Density and view options: Compact density (`⇧D`), the Phase columns view, frame tints, "Scroll to zoom" | S–M | F-VIS-009 (operator density) | D P4; FD1 §4.4, §12 | 20 Compact rows at 1440 × 900 |
| P3-06 | Clean-up (M6): delete `legacy-aliases.css`, the `html.dark` bridge and the 36 keyframes; tokens 2.0.0 drops `mono-20`; remove shipped flags | S | F-VIS-036 | F §15.6 step 6, §15.7 | lint: no legacy names; no flag older than its removal date |
| P3-07 | Brand completion: the commissioned mark replaces the working cord (only the symbol changes), favicon cuts, wordmark; marketing on the same tokens (PA-Q13) | M | F-VIS-025, F-QA-013 | D §3.1, §10 | the mark reads at 16 px; no letter tile anywhere |
| P3-08 | Sign-offs: real devices (R §17.4), SR-01 to SR-07 on NVDA, VoiceOver and TalkBack, JAWS runs, MN-01 to MN-06, the ACR, the `/accessibility` statement | M | the WCAG 2.2 AA claim | A11Y §21–§22; R §17.4 | A11Y §22 "may claim" rule met |
