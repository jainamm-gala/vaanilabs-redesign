
---

## 22. Telemetry (optional, privacy-safe)

No prompt text, transcript text, variable values, lead names or phone numbers are sent; ids and counts only.

| Event | Properties | Question it answers |
|---|---|---|
| `flow_opened` | flowId, hasDraftChanges, issueCounts, width bucket | Does opening still write? (must be zero PUTs; alert on any) |
| `draft_save` | result (ok, error, conflict, offline), latencyMs, retries | Are saves reliable? |
| `conflict_resolved` | choice (theirs, copy, mine) | How often do teammates collide? Is presence needed? |
| `validation_changed` | errors, warnings, ruleIds (top 5) | Which rules fire most; which templates fail |
| `issue_go_to` | ruleId, surface (bar, panel, gate, inspector, outline) | Which surface people use to fix |
| `publish_gate_opened` | errors, warnings, tested (bool), targets | How often is Publish blocked, and by what |
| `publish_completed` | version, warningsAcked, testSkippedReason, targets, msFromGateOpen | Are people skipping tests? For what reason? |
| `publish_failed` | status (422, 409, network), serverOnlyRuleIds | Client/server rule drift |
| `rollback` / `restore_as_draft` / `discard_draft` | fromVersion, toVersion, draftReset | How often do changes go wrong? |
| `test_run` | mode, revision (draft, live, version), reachedOutcome, steps, turns, stoppedAtRuleId | Is testing used before publishing? |
| `step_deleted` / `undo` | count, viaKey (bool), undone within 10 s | Accidental deletes (undo rate) |
| `connect` | via (drag, go-to select, C, outline) | Adoption of keyboard wiring |
| `variable_inserted` | via (picker, typed), unknownCorrected (bool) | Is the picker preventing E11? |
| `flows_list_action` | action (duplicate, rename, archive, delete, default) | List management usage |

---

## 23. Acceptance criteria

**Lifecycle and saving**
- [ ] Opening `/flows/<id>` and idling 30 s sends zero PUT/PATCH/POST requests (network log).
- [ ] Hydration, fit view, selection, zoom, pan, theme change and panel resizing never change the save chip from "Saved …" and never write.
- [ ] Editing a prompt autosaves to the Draft only; a real call started during the edit uses Live v7 (server log shows the version).
- [ ] With the save request blocked, the chip reaches "Couldn't save · Retry" within 3 retries, an error toast appears once, the `<title>` starts with "Couldn't save", Publish is disabled with its reason, and navigating away asks first.
- [ ] Navigating away 0.4 s after an edit still saves the edit (keepalive flush).
- [ ] Two tabs editing the same draft: the second save gets 409 and the conflict sheet; no silent overwrite.
- [ ] The Draft chip shows the number of changed steps and settings, not the number of edits.
- [ ] **Interim I1:** with revisions off, 20 edits send zero network writes until Publish in the gate; with IndexedDB blocked, the chip reads "Not saved · this tab only" (danger), closing the tab asks first, and Publish still works.
- [ ] **Interim I1, two browsers:** A keeps a device draft while B edits and publishes; A's Publish gate shows the blocking "published from another browser" row, lists only A's changes against the fresh server copy, and can't publish until A re-applies on top (conflicts resolved per step) or discards. B's content is never silently overwritten; `/flows` in A shows "Unpublished edits on this device" on that flow.

**Publish, history, roll back**
- [ ] Publish is the only Neel button in the header; ACTIVATE and Save no longer exist.
- [ ] With 1 error the gate's primary is disabled and its why-text names the fix; the server returns 422 if the client is bypassed.
- [ ] With 1 warning the primary stays disabled until the warning is ticked, then reads "Publish with 1 warning".
- [ ] "Not tested since your last change" can be skipped only with a reason, which appears on the version in History.
- [ ] "Where it goes live" lists every number, batch and default using the flow; nothing is listed that the server didn't return.
- [ ] After publishing, the header shows `Live v8`, the Draft chip is gone, the toast offers "Roll back to v7…", and Call reports record v8 on new calls.
- [ ] Roll back publishes v7's content as v9; v8 remains in History; calls placed on v8 still show v8.
- [ ] Restore as draft never changes Live.

**Validation**
- [ ] Every rule in §12.2 has a unit test with its message; the same package runs on the server.
- [ ] Issues recompute within 300 ms of an edit and are cleared when switching flows (reproduce F-FLOW-010's stale list: must not occur).
- [ ] No message or accessible name contains a raw node id.
- [ ] Every New flow template has 0 errors and 0 warnings in isolation, and its compiled instruction has no "undefined" or "null" (CI).
- [ ] In an empty fixture workspace (no numbers, integrations or knowledge), creating every template through `/flows/new` yields 0 errors and at most W08 (Support FAQ only); each TemplateCard's Needs line matches what is missing; Home's goal pre-selection never picks a template with unmet needs over one without.
- [ ] A blank flow opens with its Trigger connected to its Outcome and the issues chip at "No issues".

**Inspector, variables, conditions, voice**
- [ ] Typing "abc" in a transfer number shows the error on blur and the canvas still shows the last valid number; the step is marked invalid.
- [ ] Attempts 999 shows "Enter a number from 1 to 5." and is not committed.
- [ ] Typing `{{` opens the picker; `{{lead_nmae}}` is marked and E11 offers the correction.
- [ ] A Branch with cases evaluates top to bottom; "Try values" shows the case a sample takes; an empty value goes to Else.
- [ ] Choosing a voice that can't speak a flow language raises E16.
- [ ] Integration-dependent toggles are disabled with a reason when the integration isn't connected; none default to on.
- [ ] There are no ID or Position boxes, no text below 12 px and no uppercase mono labels in the inspector.

**Test**
- [ ] A text test on the Draft never sends WhatsApp, books meetings, transfers or writes lead status; each simulated action says so.
- [ ] The canvas marks the current step and reached steps; with reduced motion, no trace animates.
- [ ] "Call my phone" opens the Call gate and can only call the user's verified number.

**Deletion**
- [ ] Deleting a connected step shows "Deleted '…' and n connections · Undo"; Undo restores the step and its connections; the inspector closes and focus moves to the previous step.
- [ ] Undo is disabled right after load; adding then undoing restores the step count (F-FLOW-005 regression).
- [ ] Deleting a flow that answers a number requires the typed name and a replacement flow for that number.

**Flows list**
- [ ] `/flows` shows Status, Used by and Issues for every flow; sorting defaults to last edited, newest first.
- [ ] Creating a flow asks for a unique name and a starting point, persists it as `Not published`, and opens it.
- [ ] Duplicate produces "(copy)", fresh ids and no live version.

**Keyboard, screen readers, responsive**
- [ ] Keyboard only: build Trigger → Question (2 answers + No reply) → 2 Outcomes, publish, roll back (Playwright).
- [ ] In the Outline, `A`, `C`, `F2`, `Delete` and `Alt+↑/↓` work and announce their results; Alt+. and Alt+, move to the next and previous issue from anywhere in the designer outside a text field.
- [ ] Tab order on the canvas follows graph order from the first Trigger.
- [ ] At 768–1023 Test and Publish are visible and usable at every width (F-RWD-003); at 390 the Outline, text test and Publish gate work without horizontal scroll.
- [ ] axe reports no violations on the inspector, Publish gate, Test panel, ProblemsPanel, Outline and `/flows` in both themes.

---

## 24. New components needed

Not defined in `02-components-*` or earlier page specs. Build after the overlay group (O §20) and the Gate group (`spec/02-components-gate.md` §7). **Names follow the registry in part 1 §20.1**, the one list of Flow Designer component names; this table adds the props this part needs.

| Component | Built on | Props sketch |
|---|---|---|
| **StepInspector** (+ `InspectorSection`) | Sheet `inspector`, PanelTabs, Field | `step`, `registryEntry`, `tab`, `onTab`, `issues`, `readOnly`, `liveVersion` |
| **IntegrationStatusRow** | ServiceMark `sm` (06-settings §14), StatusText, link | `service: 'calendar' \| 'whatsapp' \| 'crm'`, `status: 'connected' \| 'disconnected' \| 'unknown'`, `connectHref`, `onRetry` |
| **PromptField** (+ `VariableToken`, `VariablePicker`) | Textarea (C §3.6) + mirrored highlight layer, Combobox | `value`, `onChange`, `variables: VarDef[]`, `availableAt: stepId`, `sample: Record<string,string>`, `languages`, `onHear()`, `maxLength` |
| **VariableField** | TextInput with affix + Combobox | `value`, `captured: VarDef[]`, `onRename(scope: 'all' \| 'here')` |
| **AnswerEditor** (+ `AnswerEditorRow`: grip handle, label + examples, Go to; the canvas owns `AnswerRow`) | TextInput `sm`, token input, GoToSelect | `answers: {id,label,examples[],target?}[]`, `fallback: {kind:'no-reply'\|'else', seconds?, target?}`, `max: 8` |
| **GoToSelect** | Select (C §5.2) | `steps: StepSummary[]`, `value`, `onChange`, `onNewStep()` |
| **ConditionBuilder** (+ `ConditionCase`, `ConditionRow`, `TryValues`) | Combobox, Select, NumberInput, DatePicker, SegmentedControl | `cases`, `else`, `variables`, `onChange`, `sample` |
| **ProblemsPanel content** and **IssueRow** (the ProblemsBar slot, the panel container and the IssuesChip are part 1 §3.4; every name is in the part 1 §20.1 registry) | StatusText, SegmentedControl, buttons | `issues: Issue[]`, `current`, `onGoTo(issue)`, `filter` |
| **PublishGate** (specified in G §5.2; this part adds DiffList and TargetList) | Sheet `gate` + GateChecklist / GateCheckRow + DiffList + TargetList + Textarea | `mode: 'publish' \| 'rollback'`, `fromVersion`, `nextVersion`, `checks`, `changes`, `targets: UsedBy[]`, `onPublish({note, ackedWarnings, skipTestReason, resetDraft?})` |
| **DiffList** (+ `ChangeRow`, `FieldDiff`) | list rows, Tag | `changes: {kind:'added'\|'changed'\|'removed'\|'settings', stepId?, label, summary, author}[]`, `onShow(change)` |
| **CompareBar** | 40 px bar, ghost buttons | `against: 'live' \| number`, `counts`, `onPrev`, `onNext`, `onExit` |
| **VersionHistory** (+ `VersionRow`), in the left panel | Timeline (N §10) as a listbox | `draft`, `versions: {n, liveFrom, liveTo?, author, note?, tested?, calls?}[]`, `onAction(n, action)` |
| **ConflictSheet** | Sheet `gate`, RadioCard | `theirs: {author, at, changes}`, `mine: {changes}`, `canReplace`, `onResolve(choice)` |
| **TestPanel** (+ `QuickReplies`, `CapturedList`, `PathList`, `RunSummary`) | TranscriptFeed / TurnRow, SegmentedControl, Composer, KeyValueList | `mode`, `revision`, `startAt`, `sample`, `run`, `onReply(text \| answerId)`, `onRestart` |
| **FlowOutline** (+ `OutlineRow`); one component with part 1 §12.3 | RAC Tree or a tree pattern with roving tabindex | `graph`, `selection`, `filter`, `onCommand(cmd, target)` |
| **ConnectToPopover** (shares its list with part 1's StepPicker, §8.4) | Combobox (C §5.3) | `origin: {stepId, outputId?}`, `steps`, `onConnect(targetId)`, `onDisconnect()` |
| **LiveNote** | text + link | `live`, `usedBy`, `draftChanges` |
| **TemplateCard** (+ `PhaseStrip`) | RadioCard | `template: {id, name, purpose, steps: {phase, label}[]}`, `needs: string[]` (computed from the workspace, §15.3), `recommended` |
| **VariablesPanel** | SearchInput, list rows | `variables: VarDef[]`, `onFind(name)`, `onSample(name, value)` |

Hooks: `useFlowRules(graph, ctx)` (Web Worker above 60 steps), `useSaveMachine` (O §18.4) with the designer's timing and the `device` / `volatile` statuses, `useDraftStore` (interim I1 with its base `updated_at` and hash, the three-way re-apply, and the offline queue, IndexedDB), `useFlowHistory` (the undo stack), `useTestRun(revision)`.

**Tokens** (registered in 01-foundations §18, in `tokens.json` 1.1.0): `--size-test-panel` 280 px (Test panel default height) and `--size-compare-bar` 40 px. The left panel width is `--size-left-panel` (part 1 §20.2). Compare mode uses the diff role aliases `--diff-added-*`, `--diff-changed-*` and `--diff-removed-*` (foundations §3.9); no new colours and never the selection tint.
