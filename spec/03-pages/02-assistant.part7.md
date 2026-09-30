## 19. New components needed

Built from existing tokens and primitives; none adds a colour, a size outside the scales, or a new motion.

| Component | What it is | Built on | Key props / contract |
|---|---|---|---|
| **AssistantThread** | The conversation feed | `role="feed"` list; follow-mode logic shared with TranscriptFeed (data-nav §12.4) | `turns`, `status: 'loading' \| 'ready' \| 'error'`, `onLoadOlder`; pins and unpins like TranscriptFeed; renders Jump to latest |
| **AssistantTurn** | One turn (§7.1) | `article`; StatusText, InlineError, IconButton, Tag | `role: 'user' \| 'assistant'`; `state: 'sending' \| 'sent' \| 'failed' \| 'streaming' \| 'complete' \| 'stopped' \| 'error'`; `lang`; `activity[]`; `blocks[]` (text, table, stats, keyValues, card, quote, passage, code); `sources[]`; `plan?`; `onRetry`, `onEdit`, `onCopy` |
| **ActivityRow** | "Looked up 18 callbacks · Leads · 0.8 s" | TurnRow system row + a `running` state (Spinner sm + "…") | `state: 'running' \| 'done' \| 'failed'`, `icon`, `text`, `href`, `ms` |
| **Composer** | Named in core §3.6; fully specified in §8 | Field + Textarea (composer mode) + Dropzone rows + IconButton + Button | `onSend(text, attachments)`, `onStop`, `streaming`, `disabledReason`, `draftKey` (local draft), IME-safe Enter, `maxRows` 5 |
| **SuggestionList** | Insert-only suggestions (§7.6) | Button `secondary md` in a `role="group"` | `items: { id, label, icon, insert: string, caretAt?: number, action?: 'attach' }[]`, `onInsert`; **no `onSend` prop exists**, by design |
| **PlanPanel** · **PlanStep** · **PlanBar** | Plan region, step item, and the tablet and phone summary bar (§9.4, §5.5) | Sheet (`detail`) below 1024, PanelTabs, StageProgress marks, StatusText, Collapsible | `plan: { id, state, steps[] }`; `step: { id, index, kind, title, status, result?, details?, approval? }`; PlanBar: `summary`, `onOpen` |
| **Step marks** (addition to StageProgress, overlay §14.3) | `waiting`, `blocked`, `skipped` / `cancelled`, `expired` | 20 px marks on `--warning-soft` / `--surface-3` with 12 px glyphs (`pause`, `lock`, `minus`, `timer-off`) | Every mark has a word next to it; `data-mark` for forced colours |
| **ApprovalCard** | The inline Gate variant for tiers 1–3, and the launcher for Call and Publish steps (§10.3–§10.5) | The gate's parts (G §5.7: GateChecklist, GateCost, header grammar), KeyValueList, DataTable, Notice, Button, typed-confirm Field | `variant: 'change' \| 'delete' \| 'edit-draft' \| 'call' \| 'publish'`; `preview`; `checks[]`; `impact`; `typedConfirm?`; `blockedReason?`; `checkedAt`; `onApprove(previewHash, idempotencyKey)`; `onOpenGate()`; `onSkip`; `onEdit` |
| **ChatHistory** · **ChatRow** | History list (§12.3) | Popover (≥ 768) / Sheet (< 768) + the cmdk list engine | `query`, `groups`, `current`, `onOpen`, `onRename`, `onDelete`, `hasOlder` |
| **DictationControl** | Dictate button, first-use explainer, listening strip, language select (§11.1) | IconButton toggle, Popover, Select, the VoicePicker meter (real `AnalyserNode`) | `state: 'idle' \| 'asking' \| 'listening' \| 'finishing' \| 'error'`; `onText(final)`; `language`; `disabledReason` |
| **ThreadSkeleton** · **PlanSkeleton** | Loading layouts (§13.2) | Skeleton.Line / Skeleton.Block | Static, after 200 ms, at least 400 ms once shown |
| **VoiceBar** (Beta, optional) | Voice conversation controls (§11.2) | Call-state words, LineQuality, IconButton, Button | `state`, `muted`, `onEnd` |
| **ReferencePicker** (v1.1) | `@` references in the composer (§8.5) | Combobox (core §5.3) anchored at the caret | `sources: ('flows' \| 'leadViews' \| 'knowledge' \| 'people')[]` |
| **AssistantPermissions** (Settings section) | The three modes and the "Always" list (§10.2) | RadioCard group, KeyValueList | `workspaceMode`, `personalMode`, `canEdit` |

**Changes requested to existing specs**

| Spec | Change | Why |
|---|---|---|
| core §2.2 IconButton | Allow `variant="primary"` for exactly one use: the phone composer Send (44 px, `--accent` fill, `--on-accent` icon, `aria-label="Send"`) | The page's one committing action must stay Neel when there is no room for a label |
| core §3.6 Composer | Placeholder "Ask Vaani…" → an example ("Plan today's calls…"); add the IME rule (no send while `isComposing`) | Placeholders are examples (direction §4.2 rule 9); "Vaani" names the call voice, not the Assistant; Indic keyboards confirm words with Enter |
| data-nav §2.7 PageHeader | `iconOnlyBelow="lg"` for up to two actions, rendered as 44 px named IconButtons instead of folding into `⋯` | History and New chat are this page's navigation; hiding them in `⋯` on tablets and phones would bury them |
| data-nav §1.5 Nav badges | Add Assistant `count` badge "1 waiting" | Waiting approvals must be findable from anywhere |
| data-nav §1.9 Shell focus | Exception: a new Assistant chat focuses the composer on fine pointers | Typing is the only task on that screen |
| overlay §8 CommandPalette | Group "Assistant chats"; action "Ask the Assistant: {query}" that inserts, never sends | Palette actions never act by themselves (overlay §8.3) |
| overlay §14.3 StageProgress | The four extra marks above | Plans need waiting, blocked, skipped and expired |
| Gate (`spec/02-components-gate.md`) | **Adopted** (G14): `useGate().open(variant, payload, { idempotencyKey, returnFocusTo })` opens any gate from any page with a pre-filled payload and returns the confirmed result (batch id and counts, or the published version), G §7 | The Assistant launches gates and reports their confirmed result |
| base.css (foundations §5) | `scrollbar-gutter: stable` on `html` should apply only to documents that scroll; app-shell routes whose shell is `100dvh` (the document never scrolls) set `auto` | Rendering the mock showed a permanent 15 px empty strip on the right of every shell screen with Windows scrollbars |
| Tokens | Declined in the register (01-foundations §18): use `--size-sheet-record` (440) / `--size-inspector` (320) for the plan and `--size-container-form` (720) for the column | One name per value |

---

## 20. Backend dependencies and interim behaviour

As the direction requires (§8), each UI state below is **hidden, not simulated**, until its backend ships.

| # | Needed | Until it ships |
|---|---|---|
| 1 | **Plan protocol:** the server returns a plan (steps with kind, tier and preview) before executing anything, pauses on steps that need approval, and executes a step only with an approval token, a preview hash and an idempotency key | The Assistant runs Look up and Draft steps only; any request that would change records, call or publish gets an **Open** step with a deep link (effectively mode 1). This must ship before any side effect is re-enabled (open question 1) |
| 2 | Server-side chats: create, list, search, rename, soft delete, retention | History lists the chats in this browser, with the Notice "Chats are saved in this browser only." |
| 3 | Streaming events: status phase, tool call start and end, text delta, completion, `lang` per turn | Non-streamed replies with "Working on it…" and the same completion announcement |
| 4 | Autonomy settings API (workspace mode, personal preference, audit) | Fixed at mode 2; the footer link is hidden |
| 5 | Gates openable from other pages (G §7 `useGate`) and draft/live flow revisions (direction §8 item 1) | Call and Publish steps are Open steps: "Open Leads with these 12 leads selected" · "Open the draft in Flows" |
| 6 | Soft-delete windows and "via Assistant" audit events | Changes are tier 2 (ApprovalCard only) with no Undo offered |
| 7 | The shared metrics aggregates (`lib/metrics.ts`) | Analytics questions get a link to Analytics with the range, not numbers |
| 8 | Speech to text for English, Hindi and Hinglish, with a no-retention option | Dictate is hidden |
| 9 | Waiting-step count per user | No nav badge |
| 10 | Server validation shared with the Flow Designer (direction §8 item 2) | Publish steps show "Open in Flows" only |

---

## 21. Acceptance criteria

**Safety and consent**
- [ ] Clicking or pressing Enter on any suggestion inserts its text into the composer and sends no request (network log: no chat POST).
- [ ] With text already in the composer, a suggestion is added on a new line and the typed text is unchanged.
- [ ] A contract test proves the step-execution endpoint rejects any Change, Delete, Edit draft, Call or Publish step without an approval token, except tier-1 changes of 50 records or fewer in mode 3.
- [ ] In every mode and every role, a Call step's primary opens the Call gate; no Assistant path dials without the gate's Start.
- [ ] A Publish step opens the Publish gate; with validation errors the card's primary is `aria-disabled` with "Fix N errors to publish".
- [ ] Editing an existing flow never changes its Live revision; changes reach the draft only through Apply to draft.
- [ ] Double-clicking an approval or retrying a step never creates two batches or two imports (idempotency).
- [ ] Approving a preview whose data has changed returns "Changed since you approved" and changes nothing.
- [ ] A waiting step expires after 24 h and offers Ask again.
- [ ] Deleting more than 50 records requires typing the count.
- [ ] Dictation and voice never send or approve; saying "send" or "yes, call them" changes nothing.

**Honesty (P1)**
- [ ] Every number in an analytics answer sits in a StatTile with its scope line and equals Analytics for the same range and filters.
- [ ] Every answer that used workspace data has a Sources line whose links open the exact filtered views.
- [ ] Step results show server-confirmed counts ("Scheduled · 10 calls · 2 skipped by the checks").
- [ ] An e2e check runs the banned-terms list of F-UX-016 (vendor, model and internal names) against Assistant replies and finds none.

**The user's words**
- [ ] With the network blocked, Send leaves the turn as "Not sent" with Retry and Edit, announced once assertively; nothing is saved as an Assistant reply (QA-A-16).
- [ ] Unsent composer text survives a reload and a SessionExpired sign-in.
- [ ] Enter during an IME composition (Hindi keyboard) does not send.
- [ ] Stop ends streaming within 1 s and keeps the partial answer.

**History**
- [ ] The same chat opens on a second browser for the same user; `/assistant/c/{id}` opens it; `?step=` scrolls to and focuses that step.
- [ ] Browser-only chats are uploaded only after "Save to account".
- [ ] Deleting a chat offers Undo (or a ConfirmDialog) and its changes remain in Activity & Audit.

**Layout**
- [ ] At 1440×900 the conversation column is at most 720 px and the plan panel 440 px; at 1920 the composer is at most 720 px wide (F-VIS-034).
- [ ] At 390×844 the thread has at least 560 px of height and there is no wallet banner; at 360×780 at least 500 px (F-RWD-015).
- [ ] At 320 px nothing scrolls sideways and no suggestion, placeholder or button label is clipped.
- [ ] A waiting ApprovalCard renders in exactly one place at every breakpoint and when the panel is hidden.
- [ ] From 768 to 1023 px every header action is visible or in `⋯`; nothing is clipped (F-RWD-003 pattern).

**Accessibility**
- [ ] axe reports no violations in light and dark, including `landmark-unique`, `label` and `button-name`.
- [ ] The composer's accessible name is "Message the Assistant"; Attach, Dictate, Send and Stop are named; Dictate exposes `aria-pressed`.
- [ ] A screen reader hears exactly one announcement per completed reply and none for streamed text or timers.
- [ ] Every action is reachable by keyboard; F6 cycles conversation, plan and composer; Page Down and Page Up move between turns.
- [ ] Focus never lands on `<body>` after a gate, dialog, sheet, popover or delete.
- [ ] Targets are at least 44×44 on touch and 24×24 on fine pointers.
- [ ] `check-contrast.mjs` passes; no text sits on Neel except `--on-accent`.
- [ ] Under reduced motion the spinners and the dictation meter are static and scrolling is instant.
- [ ] `getComputedStyle(body).fontFamily` starts with Hanken Grotesk (F-VIS-008).

**Telemetry**
- [ ] Session replay does not load on `/assistant`; no event payload contains message text, file names or lead data.

---

## 22. Open questions for the product owner

1. **Server behaviour today.** Does `/api/assistant/chat` already execute side effects (create or activate flows, add leads, place calls) without a confirmation turn? The verifier asked to raise F-UX-022 to high if so. Until answered, assume yes and ship the plan protocol (§20 item 1) before re-enabling any side effect.
2. **Autonomy.** Confirm mode 2 as the default, the 50-record ceiling for mode 3, and whether admins may turn the Assistant off for a workspace (copy for that state exists in §13.4).
3. **Attachments.** Keep today's types (PDF, TXT, CSV, XLSX, DOCX, JSON)? Confirm 10 MB per file, 5 per message and the 8,000-character paste hint.
4. **Speech.** Which speech-to-text service handles English, Hindi and Hinglish; is audio retained? The privacy line appears only if it is not.
5. **Voice conversation.** Keep it as Beta or retire it? Today it connects to the call agent "vaani", which mixes the call persona with the in-app Assistant.
6. **Privacy of chats.** Private to the author (proposed). Can admins read members' chats? Should read-only sharing exist? Both need a DPDP review.
7. **Retention.** 90 days proposed for chats and their attachments; is export needed?
8. **Roles.** Which roles may place calls, publish flows and delete leads? Step copy names the role that can.
9. **Scheduling.** May a Call step schedule calls for the next calling window through the gate's Schedule, or only suggest a time?
10. **Limits.** Is there a per-user or per-workspace quota? The limit Notice is shown only if one exists.
11. **Reply language.** Confirm Devanagari replies to Devanagari input and Hinglish (Latin) replies to Hinglish input.
