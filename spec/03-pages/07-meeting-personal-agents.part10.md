## 3. New components needed

Built only from existing tokens and primitives: no new colour, size outside the scales, or motion. Files under `components/meetings/` and `components/agents/`; shared ones (`AgentProfileCard`, `LimitsSummary`) under `components/ui/`.

| Component | What it is | Built on | Key props / contract |
|---|---|---|---|
| **RoomCard** | An open room in Live now (§1.6) | `Card` plain, `StatusTag`, `LiveDot`, `Tag`, `IconButton`, `RoomControlRow`, `Button`, `Menu` | `room: { id, title, status: 'open'\|'live'\|'long_open'\|'stale'\|'ending', startedAt, people, code, keyRequired, agent, notes, recording, endsAt? }`; `onOpenRoom`, `onCopyLink`, `onEnd`, `menuItems`. The card holds no billing action; the Agent row never acts from the card |
| **RoomControlRow** | "Agent · In the room · Remove agent" (§1.6 summary, §1.8 full) | `StatusText`, `Button sm`, `VoiceTile` | `kind: 'agent'\|'notes'\|'recording'`, `mode: 'summary'\|'full'`, `state`, `sentence`, `action?: { label, onSelect, guard: 'none'\|'confirm'\|'gate' }`, `disabledReason?` |
| **JoinDetails** | Join link, key and invite (§1.7 Room ready, §1.8) | `Field`, read-only `TextInput`, `IconButton` copy, `Button` | `url`, `code`, `key?: { value?: string; retrievable: boolean }`, `inviteText` (never contains the key), `onCopy(kind: 'link'\|'key'\|'invite')` |
| **AddAgentGate** | The gate for adding the agent to an open room (§1.8) | Specified in `spec/02-components-gate.md` §5.4 | `roomId`, `voice`, `mode` (G §7); this page only configures it |
| **AgentProfileCard** | The meeting persona card, reusable for any agent voice (§1.5) | `Card` plain, `VoiceTile` 32, `KeyValueList`, `LanguageMark`, `IconButton` preview through `useAudioPreview()` (N §12.3) | `voice: { name, style, languages }`, `knowledgeCount`, `capabilities: { id, label, shipped: boolean }[]` (only `shipped` render), `onPreview` |
| **DeckPicker** | The Slides choice in the Start sheet (§1.7, 2a) | `RadioGroup`, `FileField`, `Select` | `value: { kind: 'live' } \| { kind: 'deck', deckId?: string, file?: File }`, `recentDecks`, `onGenerate()`; renders the single-sentence form until MT7 |
| **DeckOptions** | Three generated decks to choose from (§1.10) | `RadioGroup variant="card"`, link button | `options: { id, title, slides, firstSlide, previewUrl }[]`, `value`, `onChange` |
| **LimitsSummary** | A task's limits as one sentence with **Edit limits** (§2.9, §2.10) | Disclosure `Button` (`aria-expanded`), `NumberInput`, `CurrencyInput`, `DatePicker`, `TimeField`, `Select` | `value: { maxCalls?, spendCap?, finishBy?, repeat? }`, `bounds`, `defaults`, `used?` (for "₹42.80 is already spent"); the sentence comes from `describeLimits()` in `lib/format.ts` |
| **AutonomyRow** | One capability's autonomy (§2.11) | `SegmentedControl size="sm"`, `Tag outline` "Default", inline `Notice`, `lock` icon | `capability: { id, label, description, group }`, `value: 'auto'\|'confirm'\|'confirm_2fa'`, `defaultValue`, `locked?: { reason }`, `onChange` |
| **TaskPlan** | A task's plan with results and evidence (§2.10) | `StageProgress` + the Assistant's step marks (AS §19) + link buttons | `steps: { id, label, state, meta?, evidence?: { label, href } }[]` |

## 4. Reconciliations and changes requested to other specs

| Spec | Change | Why |
|---|---|---|
| data-nav §5.3 `lib/status.ts` | **Meeting room:** add `Open` · `door-open` · neutral; `Open {duration}` (interim long-open) · `alert-triangle` · warning; `Ending…` · info. **New domain `meeting-notes`:** Summary ready · `check` · success; Writing notes… · info; Notes off · outline; Couldn't write notes · `circle-x` · danger. **New domain `agent-task`:** the ten states of §2.8 | One map for every room, notes and task state (F-VIS-017) |
| core §3.2 TextInput (meeting title) | A meeting title must be unique among **open** rooms, not across the workspace; past meetings may share a title and are told apart by date | Recurring meetings ("Weekly demo") would otherwise be refused |
| Gate G §2.3 `GateChecklist` | **Adopted** as `collapse="all-pass"` (one success line when every row passes, re-expanding when one stops) with the summary as `role="status"` | Personal agents readiness (§2.6) |
| Assistant AS §19 `ApprovalCard` | Add `variant: 'task-step'` with `from` (task link), `expiresAt`, `decidedElsewhere` ("Approved on WhatsApp at 9:20 am") and `twoFactor` (opens "Confirm it's you", ST §5) | Personal-agent confirmations (§2.7) |
| Knowledge-Billing KB §2.9 Usage | The example "29 of 30 free min used" reads the quota the other way round from the API (60 s used means 29 **left**). Use "29 of 30 free minutes left" everywhere, from one formatter | One truthful free-minute sentence (P1) |
| Overlay O §4.1 and Shell §2.3 | Meeting outputs open as a `detail` sheet from the list and as the page `/meetings/<id>` from links; both render the same tabs (§1.9) | The two specs named different containers |
| Overlay O §10.2 WalletNotice | No change: Meetings stays off the list. The Empty copy "free meeting minutes still work" stays true because rooms open on free minutes; the agent's block is stated in the Start sheet and the Agent row | Blocking-notice rule (D §6.1) |
| Foundations F §12 icons | New uses of existing Lucide glyphs: `door-open` (Open room), `disc` (Recording), `pause` (Waiting for you, shared with the Assistant; user-paused tasks use `circle-pause`), `octagon-pause` (Stopped at limit), `calendar-clock` (Scheduled task). No custom glyphs | Keep one icon per meaning |
| Settings ST Phone setup | A "Personal-agent numbers" part where admins assign a number to a teammate; it is the target of **Assign a number** | The readiness row needs a real destination (F-UX-015) |
| Shell §2.2 badges | "1 to confirm" stays hidden until PA2 ships (computed facts only) | P1 |

## 5. Open questions for the product owner

1. **Free minutes.** Does "29 / 30" mean 29 left (the quota API says 60 s used)? Do free minutes cover only room time or also agent time? The rates conflict (₹2.40/min in Meetings Billing, 1 paisa/s in the public docs; KB §5 Q1).
2. **"Intel".** What does the "Meeting intelligence" toggle produce today, and where are its outputs stored? This spec calls the capability **Notes** (transcript, summary, action items) and hides it until MT3 returns stored outputs.
3. **Idle rooms.** Confirm the reaper rule: stale after 30 min with nobody in the room, ended automatically 15 min later; does a room with only the agent count as empty? Until then the 12 h interim flag applies.
4. **Key-only rooms.** Can the agent, notes and recording work in key-protected rooms? Can the key be shown again after creation (MT9)?
5. **Rooms without the agent.** The API has a "Plain meeting" scope. Should the Start sheet offer "No agent, just a room"? Not included in v1.
6. **Test data.** Archive "ZZ Mobile QA Room 22Sep" and "E2E Test Room 21Sep" in production and add the CI check that fails on QA or E2E fixtures in production data (F-UX-016).
7. **Roles.** Who may start meetings, end another person's room, see every meeting in the workspace (or only their own), use personal agents, and lock autonomy for everyone?
8. **Personal-agent numbers.** One number per user or a shared pool? Does the number cost money? Do WhatsApp messages cost money (the cost line would include them)?
9. **Existing autonomy.** Accounts that set Calls to Auto before limits exist (PA3): keep Auto or move to Confirm until limits ship? This spec recommends Confirm by default for new workspaces.
10. **Retention.** How long are recordings, transcripts and summaries kept? The copy states retention only when the server returns it.
11. **Consumer capabilities.** Should any workspace ever see Homework analysis, Stock research or Stock trade, or should they be removed from the product (F-UX-040)?
12. **The meeting persona.** Are the meeting agent's voice and role editable per workspace? If yes, where ("Make default" in the Start sheet today, or a profile editor)?

## 6. Traceability

| Finding | Severity | Resolved in |
|---|---|---|
| F-UX-037 | medium | §1.7 title rule, Slides, Room ready key hand-off, FlowSwitcher |
| F-UX-038 | medium | §1.6 RoomCard (title first, stale tag, words for state), §1.8 End room in ⋯, §1.9 outputs |
| F-QA-024 | medium | §0.2 MT1, §1.6 exclusive lists and stale rule, §1.9 |
| F-UX-039 | medium | §2.6 readiness and templates, §2.9 New task gate, §2.12 |
| F-UX-040 | medium | §2.9 Main tool groups, §2.11 autonomy groups, PA5 |
| F-UX-016 | medium | A3, §1.14 removed cards and copy, §5 Q6 |
| F-UX-017, F-UX-043 | medium · low | A2, §0.3 redirects, §1.14, §2.14 |
| F-UX-019 | medium | §1.12 and §2.12 error rows (last good data kept, no empty state on failure) |
| F-UX-025 | medium | §1.7 title and §2.9 goal validation (C §8.2) |
| F-UX-015 | medium | §2.6 number row, §2.11 Phone number, §4 Settings request |
| F-UX-014, F-UX-005, F-VIS-037 | medium | §1.7 FlowSwitcher `assign` |
| F-UX-021 | medium | §0.3 Free minutes to Billing › Plans, §1.5 This month card |
| F-UX-035 | medium | §1.6 ⋯ danger group, §1.8 End room, §2.8 Cancel task |
| F-VIS-001, F-VIS-004, F-VIS-005, F-VIS-006 | high · medium | A1, §1.5, §2.5 |
| F-VIS-003 | high | §2.6 template cards on tokens |
| F-VIS-024, F-VIS-034 | medium · low | `formatWhen`; data page, 640 gate sheets, 720 settings column |
| F-A11Y-003 | high | Every control in a `Field` (§1.7, §1.10, §2.9) |
| F-A11Y-008, F-A11Y-009 | high | Tokens only; Neel primary with a white label |
| F-A11Y-016 | medium | RadioGroups, disclosures with `aria-expanded`, SegmentedControl radiogroups |
| F-A11Y-023, F-A11Y-024 | medium | Named IconButtons with 24 / 44 px hit areas |
| F-A11Y-026 | medium | H2 per section (§1.15, §2.15) |
| F-RWD-006 | medium | §1.4 phone layout, §1.16 |
| F-RWD-007 | medium | §2.4 phone header row, §2.16 |
| F-RWD-001 | high | Both destinations in More (Shell §2.2) |
| F-QA-007, F-UX-030 | high · medium | Shell renders at once; skeletons (§1.12, §2.12) |
| EXPLORE-CORE-26 | low | §2.11 one breadcrumb, nav current |
