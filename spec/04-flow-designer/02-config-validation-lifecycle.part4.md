
---

## 7. The step inspector

### 7.1 Shared anatomy

The inspector is an `<aside aria-labelledby="inspector-title">` in the Sheet `inspector` variant (O §4.1): docked 320 (resizable to 480) at ≥1280, an overlay from the right at 1024–1279, a read-only sheet below 1024. It always renders at Standard density (O §1.2).

```
┌ ◇  Logic · Question · #5                  ⋯  ✕ ┐ 56  header
│    Ask about a site visit                      │
├ Configure │ Test data │ Issues 1 ─────────────┤ 40  PanelTabs
│ Label                                          │
│ [Ask about a site visit                     ]  │
│ Agent asks                               {}    │  {} = Insert variable
│ [{{lead_name}} ji, would you like to visit  ]  │
│ [the site this week?                        ]  │
│ Sounds like: "Anika ji, would you like to…" ▶  │
│ Answers to listen for                          │
│ ⋮ Yes    haan, zaroor · हाँ    Go to [Book site visit ▾] │
│ ⋮ Later  baad mein, next week  Go to [Schedule callb… ▾] │
│ ⋮ No     nahi, not now         Go to [Polite close ▾]    │
│   No reply  after [6] s        Go to [No answer ▾]        │
│ [+ Add answer]                                 │
│ Save answer to (optional)  [{{visit_intent}} ] │
│ Language  [अA Auto · Hindi + English ▾]        │
│ ▸ Advanced                                     │
├────────────────────────────────────────────────┤
│ ⓘ Edits save to the draft. Callers hear        │ 48  footer
│   Live v7 until you publish.          [Done]   │
└────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Header | Glyph tile 24 (F §12, the phase's tile) · phase line `phase-12` `text-3` "Logic · Question · #5" (the stable step number, part 1 D7) · title `title-16`, the step's label, one line with a Tooltip for the full text · `⋯` IconButton ("More actions for Ask about a site visit") · Close IconButton ("Close inspector"). The label field and the title stay in sync as you type |
| `⋯` menu | Duplicate (`⌘/Ctrl+D`) · Copy link to step (`?node=`) · Convert to… (submenu of compatible types: Speak ⇄ Question keeps the prompt; Knowledge lookup ⇄ CRM lookup keeps outputs) · separator · **Delete step** and **Delete and reconnect** (`Alt+Delete`, only when the step has one input and one output; part 1 §10.3), both in `danger-text`, no "…": they act at once with Undo (§14.1) |
| Tabs | PanelTabs (N §3): **Configure** · **Test data** · **Issues** with CountBadge (errors + warnings on this step). Selected tab in the URL (`tab=`) |
| Configure | Sections in this order: the step's fields (label first), **Outputs** (answers, cases or found/not found), **Language** (override, §10.3), **Advanced** (Collapsible, closed): step id `flow_7c21/step_18` in `mono-12` with Copy; "What the agent is told" (the compiled instruction for this step, read-only, `mono-12` on `surface-2`, max 12 lines then scroll, Copy); created and last edited by whom |
| Test data | The sample values this step uses (a KeyValueList of editable fields, per user per flow, never saved into the revision): "lead_name · Anika", "company_name · Sample Realty". **Hear it** plays the step's line with these values in the flow's voice. "At this step in tests today: reached 3 times · Yes 2 · No reply 1" (FD6; hidden until it exists) |
| Issues | One IssueRow per issue on this step (§12.4) with **Show field** (focuses the field) or **Go to step** (for connection issues). Empty: compact EmptyState "No issues on this step." |
| Footer | Sticky, 48, `surface`, top hairline: StatusText sm neutral with `info` 14: "Edits save to the draft. Callers hear Live v7 until you publish." ("Edits save to the draft." when nothing is live; "Read-only. You're viewing v5." on versions) · **Done** (secondary `sm`): closes the inspector and returns focus to the step. There is no Apply and no Delete here (F-FLOW-019) |
| Fields | Field wrapper (C §3.1): `label-13` in `text`, hint `meta-12` `text-3`, error replaces the hint. No uppercase, no mono labels, no ID or Position boxes (F-FLOW-033). Optional fields say "(optional)"; unmarked fields are required (C §3.1) |
| Integration row | Steps that depend on an integration start Configure with an **IntegrationStatusRow** (§24): a ServiceMark `sm` (Settings §7.4 and §14: a 20 px `--surface-3` tile with the service's single-colour mark or its Lucide fallback at 12 px, never a letter or a brand fill; the Book meeting inspector shows the Google Calendar mark, or `calendar` as the fallback), "Google Calendar · Connected" (`StatusText` success) or "Google Calendar · Not connected · **Connect**" (warning; the link opens Settings › Integrations in a new tab and the row re-checks on focus return) or "Couldn't check Google Calendar · Retry" (neutral). Controls that need it are disabled with the reason (C §1.6), never silently on (F-FLOW-030) |

**Behaviour.**
- Selecting a step opens its inspector without moving focus (O §4.4). `Enter` or `F2` on a focused step opens it and focuses the first field (Label); `Esc` in a field (after closing any open popover) returns focus to the step; `F6` moves between canvas, inspector, Problems bar and header (F-A11Y-001, F-A11Y-027).
- Every change applies to the Draft at once (autosave, §4.3). **Validation timing is C §8.2** with one designer rule: an invalid value (a phone number "abc", 999 attempts) stays visible in its field but the step keeps its last valid value and is reported invalid until fixed (F-FLOW-015). An empty required field on a step you just added is not painted red until you leave the step once (V2); the Issues count includes it from the start, so the header is never optimistic.
- Deleting the step while its inspector is open closes the inspector and moves focus to the previous step in graph order (F-FLOW-025).
- Nothing selected: the inspector closes and the canvas takes the space. Several steps selected: the slot shows "3 steps selected" with the bulk actions part 1 defines.

### 7.2 The step-type registry (one name everywhere)

One module (`lib/flow/step-types.ts`, part 1 §4.3) feeds the palette, the step's phase line, the inspector title, toasts, rules, the Outline, the Test panel's system rows and the docs (F-FLOW-027).

| Type key | Name | Phase | Palette description | Outputs | Replaces |
|---|---|---|---|---|---|
| `trigger.inbound` | Inbound call | Trigger | When someone calls your number | 1 | Start (fixed pill) |
| `trigger.outbound` | Outbound batch | Trigger | When a batch from Leads calls someone | 1 | Start |
| `trigger.api` | API or webhook | Trigger | When your system starts a call | 1 | (new) |
| `trigger.test` | Browser test | Trigger | When you test in the browser | 1 | (new) |
| `logic.question` | Question | Logic | Ask, then follow the answer | 1–8 answers + No reply (part 1 says 2–8; §25 R13) | Question ("YES ↓ / NO →") |
| `logic.branch` | Branch | Logic | Decide from what you know | Cases + Else | Branch / Condition Check |
| `logic.verify` | Verify caller | Logic | Check who is calling | Verified · Not verified · No reply | Verify Customer |
| `action.speak` | Speak | Action | Say a line | 1 | Speak / New Speak Node |
| `action.knowledge` | Knowledge lookup | Action | Answer from your documents | Found · Not found | Knowledge Query / Knowledge Lookup, FAQ |
| `action.crm` | CRM lookup | Action | Fetch a record from your CRM | Found · Not found | CRM Lookup / Live Lookup |
| `action.meeting` | Book meeting | Action | Offer times and book one | 1 + fallback **Not booked** (proposed, §25 R2) | Book Meeting / Schedule |
| `action.whatsapp` | Send WhatsApp | Action | Send an approved template | 1 | WhatsApp / Send WhatsApp |
| `action.transfer` | Transfer to a person | Action | Hand the call to a person | fallback **Didn't connect** only; a connected transfer ends the call as Transferred | Human Handoff / Transfer Call |
| `outcome.end` | End with outcome (Interested · Callback · Not interested · No answer · Transferred · Do not call · Failed · Ended) | Outcome | Finish and record the result | 0 | End / End Call (migrates to Ended) |
| `unknown` | Unsupported step | (none) | never in the palette | as stored | React Flow's default box |

Part 1 §4.3 is the source of truth for names, glyphs and outputs; this table adds the type keys the inspector schemas use. The one proposed difference is Book meeting's fallback row **Not booked** (the caller hears the difference, so the flow must branch on it); it is a change request to part 1, listed in §25 R2.

### 7.3 Trigger steps

A flow needs at least one Trigger (rule E01). Triggers take no input socket. They configure how a call **enters**; nothing is spoken in a Trigger (the first Speak or Question after it speaks).

**Inbound call**

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Inbound call" | Required |
| Answer calls on | MultiSelect of the workspace's inbound numbers (`PhoneText` options with "answers with 'EMI reminder' v3" as the description) | none | Picking a number bound to another flow shows the hint "Moves from 'EMI reminder' to this flow when you publish." A number that isn't verified is listed disabled with "Not verified yet. Verify it in Phone setup." Empty: warning W08 "This trigger doesn't answer any number yet." |
| When to answer | SegmentedControl: Always · Set hours | Always | Set hours reveals the CallingHours recipe (C §7.1) titled "Answer hours · IST" |
| Outside these hours | Select: Say a message and end · Transfer to a person · Take a voicemail | Say a message and end | "Say a message" reveals a PromptField: "We're closed now. We open at 10 am. Please call back then." |
| Recording notice | Read-only statement from workspace settings | | "Callers hear the recording notice first: 'This call may be recorded for quality.' · Change in Settings" (compliance copy is the owner's, D §8) |

**Outbound batch**

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Outbound batch" | Required |
| Caller ID | Select of verified caller IDs (`PhoneText`) | Workspace default | None verified: blocking at publish only if a batch uses this flow (§5.2) |
| Calling hours · IST | CallingHours recipe | Workspace hours (Mon to Sat, 10 am to 7 pm) | "Batches wait for these hours. DND numbers are always skipped." |
| Retries if no answer | NumberInput 0–3, unit "retries" + Select interval (1 h, 2 h, 4 h, next day) | 1 retry · 2 h | "0 to 3 retries" |
| Calls at a time | NumberInput 1–20 | 5 | "1 to 20 calls at a time" |
| If nobody answers | Select of Outcome labels | No answer | Written to the lead after the last retry; no step runs |
| Voicemail | SegmentedControl: Hang up · Leave a message | Hang up | Leave a message reveals a PromptField (max about 20 s spoken) |

**API or webhook**: Label · Endpoint (read-only `mono-13` "POST /v1/flows/flow_7c21/calls" with Copy) · Inputs the request must include: a list of variable names (`{{order_id}}`) with type (Text, Number, Yes/No, Date) that become variables (§8) · a link "API keys and docs" to Settings › Developer. Rule: an input name that clashes with a lead field is an error.

**Browser test**: Label · Start as: Inbound call · Outbound call (sets `{{call_direction}}`) · Sample lead: Combobox of leads or "Sample values" (from Test data). Used by Talk in browser and the Test panel when the flow has several triggers; without it, tests start at the first Trigger in graph order and the Test panel's "Start at" select chooses.

### 7.4 Question

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Question" + number ("Question 2") | Required |
| Agent asks | PromptField (§8.2), rows 3 | empty | Required (E05 "Add what the agent asks."). Hint: "Ask one thing. The agent speaks it in the caller's language." |
| Answers to listen for | AnswerEditor (§7.7) | Yes (haan · हाँ), No (nahi · नहीं), No reply after 6 s | At least one named answer (E07); each named answer needs 2 or more examples (W04) |
| If the answer is unclear | Select: Ask again once · Ask again twice · Go to No reply | Ask again once | Reveals "Ask again with" PromptField (optional; default rephrases the question) |
| Save answer to (optional) | VariableField (§8.3) | none | Creates a captured variable of type Option (the answer labels) or Text ("Save what they said"); snake_case, unique in the flow |
| Let the caller interrupt | Switch | On | "Callers can answer before the question ends." |
| Language | Language override (§10.3) | Auto | |

### 7.5 Branch

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Branch" + number | Required |
| Decide by | SegmentedControl: Rules · Description | Rules | Description reveals a Textarea "Caller mentioned a budget above ₹1 Cr" and the warning hint "The agent judges descriptions and can be wrong. Use rules when the value is saved in a variable." |
| Cases | ConditionBuilder (§9) | one empty case + Else | Evaluated top to bottom; the first match wins (stated under the list) |
| Else | Fixed last row, Go to | none | Required (E06) |

Outputs: one per case (labelled by the case's name, default "Budget over ₹1 Cr" generated from the rule and editable) plus **Else**.

### 7.6 Verify caller

| Field | Control | Default | Rules and copy |
|---|---|---|---|
| Label | TextInput | "Verify caller" | Required |
| Agent asks | PromptField | "To confirm it's you, what are the last 4 digits of your loan account?" | Required |
| Check against | Select: A lead field · A CRM record · A knowledge table | A lead field | Then **Field** (Select of fields from that source, never free text; F-FLOW-033 truncated placeholders go). CRM record adds the IntegrationStatusRow |
| Match | SegmentedControl: Last 4 digits · Full value · Exact wording | Last 4 digits | |
| Attempts | NumberInput 1–5 | 2 | "1 to 5 attempts." Out of range: "Enter a number from 1 to 5." (E09, kept in the field, not committed) |
| If it fails, say (optional) | PromptField | "Sorry, that doesn't match." | |
| Hide spoken digits in transcripts | Switch | On (locked on when Match is digits) | "Shown as •••• in Call reports." |

Outputs: **Verified** · **Not verified** · **No reply** (fallback). Voice biometrics are a flow-level setting (§11 Security), not this step.

### 7.7 The answer editor (Question, Branch, Verify caller)

Every Logic output is an **answer row** in the inspector, mirroring the 28 px answer rows on the canvas (D §6.5).

| Part | Spec |
|---|---|
| Row | Grid `24px minmax(0,1fr) auto`, min height `--control-h` + 8, padding `space-4 0`, bottom hairline. Drag handle (`grip-vertical` 16, `text-3`) for pointer reordering; keyboard reordering via the row's `⋯` "Move up / Move down" and `Alt+↑/↓` |
| Label | Inline TextInput `sm`, `label-13`; unique within the step (E08 "Two answers are called 'Yes'.") |
| Examples | A token input: each example is a 20 px Tag with remove; Enter or comma adds; Devanagari and Hinglish welcome ("haan, zaroor", "हाँ"); shown on the canvas as "haan, zaroor · हाँ" (`meta-12`). `lang` set per token by script detection |
| Go to | **GoToSelect** (§24): a Select listing steps by label with phase glyph and step number, grouped by phase, plus "+ New step here…" (opens the palette and inserts a connected step) and "Not connected". Choosing creates or moves the connection (one undo step) |
| Fallback row | No reply ("after [6] s", NumberInput 3–15 s) or Else. On `surface-2`, no drag handle, can't be deleted, label fixed. Its canvas edge is the only dashed line (D §5) |
| Not connected | Row gets `warning-soft` fill and "Not connected" in `warning-text` in the Go to select; error E03 until wired |
| Add answer | Ghost `sm` "+ Add answer" (max 8 named answers; the 9th is disabled with "Up to 8 answers. Use a Branch for more.") |
| Delete an answer | Row `⋯` › Delete answer: acts at once, removes its connection, Undo toast "Deleted answer 'Later' and its connection · Undo" |

Keyboard: Tab moves Label → Examples → Go to per row; `C` on a focused row opens Connect to… (§16.3), the same list as Go to.
